require('dotenv').config();
const express = require('express');
const session = require('express-session');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || `http://localhost:${PORT}/auth/callback`;
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-me-to-a-random-secret';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.warn('WARNING: DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET must be set in .env');
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 },
  })
);

// Login - redirect to Discord OAuth
app.get('/auth/login', (req, res) => {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'identify',
    prompt: 'consent',
  });
  res.redirect(`https://discord.com/oauth2/authorize?${params.toString()}`);
});

// OAuth callback
app.get('/auth/callback', async (req, res) => {
  const { code, error } = req.query;
  if (error || !code) {
    return res.redirect('/?error=auth_failed');
  }

  try {
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error('Token error:', tokenData);
      return res.redirect('/?error=token_failed');
    }

    // Fetch user profile
    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const user = await userRes.json();

    req.session.access_token = tokenData.access_token;
    req.session.user = user;
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.redirect('/?error=server_error');
  }
});

// Get current user
app.get('/api/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json(req.session.user);
});

// Send DM to a user by their Discord snowflake ID
app.post('/api/send-message', async (req, res) => {
  if (!req.session.access_token) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  const { recipientId, content } = req.body;
  if (!recipientId || !content || typeof content !== 'string' || content.trim().length === 0) {
    return res.status(400).json({ error: 'recipientId and content are required' });
  }

  if (content.length > 2000) {
    return res.status(400).json({ error: 'Message too long (max 2000 characters)' });
  }

  try {
    // Create (or get existing) DM channel
    const channelRes = await fetch('https://discord.com/api/users/@me/channels', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${req.session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipient_id: recipientId }),
    });

    const channel = await channelRes.json();
    if (!channel.id) {
      return res.status(channelRes.status).json({
        error: channel.message || 'Failed to create DM channel',
        details: channel,
      });
    }

    // Send the message
    const msgRes = await fetch(`https://discord.com/api/channels/${channel.id}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${req.session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: content.trim() }),
    });

    const msg = await msgRes.json();
    if (!msg.id) {
      return res.status(msgRes.status).json({
        error: msg.message || 'Failed to send message',
        details: msg,
      });
    }

    res.json({ success: true, message: msg });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while sending message' });
  }
});

// Logout
app.get('/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.listen(PORT, () => {
  console.log(`Discord Messenger running at http://localhost:${PORT}`);
  console.log(`Make sure REDIRECT_URI is set to ${REDIRECT_URI} in your Discord app settings`);
});
