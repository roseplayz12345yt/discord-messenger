async function init() {
  const loginView = document.getElementById('login-view');
  const appView = document.getElementById('app-view');
  const userArea = document.getElementById('user-area');
  const avatar = document.getElementById('avatar');
  const username = document.getElementById('username');
  const form = document.getElementById('message-form');
  const status = document.getElementById('status');
  const sendBtn = document.getElementById('send-btn');
  const loginBtn = document.getElementById('login-btn');
  const configError = document.getElementById('config-error');

  // Check for error in URL
  const params = new URLSearchParams(window.location.search);
  if (params.get('error')) {
    showStatus('Authentication failed. Please try again.', 'error');
    window.history.replaceState({}, '', '/');
  }

  // Make the Sign in button go directly to Discord
  loginBtn.addEventListener('click', async () => {
    loginBtn.disabled = true;
    loginBtn.textContent = 'Redirecting to Discord…';

    try {
      const res = await fetch('/api/config');
      const config = await res.json();

      if (!config.clientId) {
        configError.textContent = 'Server is missing DISCORD_CLIENT_ID. Please set it in the environment variables.';
        configError.classList.remove('hidden');
        loginBtn.disabled = false;
        loginBtn.innerHTML = `\
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">\
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>\
          </svg>\
          Sign in with Discord`;
        return;
      }

      // Build the official Discord OAuth2 URL and go there
      const discordParams = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        response_type: 'code',
        scope: 'identify',
        prompt: 'consent',
      });

      // This takes the user straight to Discord's login / authorize page
      window.location.href = `https://discord.com/oauth2/authorize?${discordParams.toString()}`;
    } catch (err) {
      console.error(err);
      configError.textContent = 'Could not reach the server. Make sure the app is running.';
      configError.classList.remove('hidden');
      loginBtn.disabled = false;
      loginBtn.textContent = 'Sign in with Discord';
    }
  });

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
