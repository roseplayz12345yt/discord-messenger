async function init() {
  const loginView = document.getElementById('login-view');
  const appView = document.getElementById('app-view');
  const userArea = document.getElementById('user-area');
  const avatar = document.getElementById('avatar');
  const username = document.getElementById('username');
  const form = document.getElementById('message-form');
  const status = document.getElementById('status');
  const sendBtn = document.getElementById('send-btn');

  // Check for error in URL
  const params = new URLSearchParams(window.location.search);
  if (params.get('error')) {
    showStatus('Authentication failed. Please try again.', 'error');
    // Clean URL
    window.history.replaceState({}, '', '/');
  }

  try {
    const res = await fetch('/api/me');
    if (res.ok) {
      const user = await res.json();
      // Logged in
      loginView.classList.add('hidden');
      appView.classList.remove('hidden');
      userArea.classList.remove('hidden');

      const avatarUrl = user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`
        : `https://cdn.discordapp.com/embed/avatars/${(user.discriminator || 0) % 5}.png`;

      avatar.src = avatarUrl;
      avatar.alt = user.username;
      username.textContent = user.global_name || user.username;
    } else {
      // Not logged in
      loginView.classList.remove('hidden');
      appView.classList.add('hidden');
      userArea.classList.add('hidden');
    }
  } catch (err) {
    console.error(err);
    loginView.classList.remove('hidden');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.classList.add('hidden');

    const recipientId = document.getElementById('recipient').value.trim();
    const content = document.getElementById('content').value.trim();

    if (!/^[0-9]{17,20}$/.test(recipientId)) {
      showStatus('Please enter a valid Discord User ID (17–20 digits).', 'error');
      return;
    }

    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending…';

    try {
      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId, content }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showStatus('Message sent successfully!', 'success');
        document.getElementById('content').value = '';
      } else {
        const msg = data.error || data.message || 'Failed to send message';
        showStatus(msg, 'error');
      }
    } catch (err) {
      showStatus('Network error. Please try again.', 'error');
    } finally {
      sendBtn.disabled = false;
      sendBtn.textContent = 'Send Message';
    }
  });

  function showStatus(message, type) {
    status.textContent = message;
    status.className = `status ${type}`;
    status.classList.remove('hidden');
  }
}

document.addEventListener('DOMContentLoaded', init);
