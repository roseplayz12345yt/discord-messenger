# Discord Messenger

A simple website that lets users **sign in with Discord** and **send direct messages** to any Discord user by their User ID.

Messages are sent from the logged-in user's own Discord account using the official Discord API.

## Features

- Discord OAuth2 login (secure, uses `identify` scope only)
- Clean, Discord-inspired dark UI
- Send DMs by pasting a friend's Discord User ID
- Responsive design

## Prerequisites

- Node.js 18+
- A Discord Application (free) from the [Discord Developer Portal](https://discord.com/developers/applications)

## Setup

### 1. Create a Discord Application

1. Go to https://discord.com/developers/applications and click **New Application**.
2. Give it a name (e.g. "My Messenger") and create it.
3. Go to **OAuth2 → General**.
4. Copy the **Client ID** and **Client Secret**.
5. Under **Redirects**, add:
   ```
   http://localhost:3000/auth/callback
   ```
   (Add your production URL later if you deploy.)
6. Save changes.

### 2. Clone & install

```bash
git clone https://github.com/roseplayz12345yt/discord-messenger.git
cd discord-messenger
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in:

```env
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here
REDIRECT_URI=http://localhost:3000/auth/callback
SESSION_SECRET=any-long-random-string-you-like
```

### 4. Run

```bash
npm start
```

Open http://localhost:3000 in your browser.

## How to get a friend's Discord User ID

1. In Discord, go to **User Settings → Advanced** and enable **Developer Mode**.
2. Right-click the user → **Copy User ID**.
3. Paste it into the form on the website.

**Important:** Discord will only deliver the DM if:
- The recipient has you as a friend, **or**
- You share a server and they allow DMs from server members.

Otherwise you will get an error from the Discord API.

## Deploying

You can deploy this to any Node.js host (Render, Railway, Fly.io, Vercel with serverless adapter, etc.).

1. Set the same environment variables on the host.
2. Update `REDIRECT_URI` to your production URL (e.g. `https://your-app.onrender.com/auth/callback`).
3. Add that exact URL to the Discord application's OAuth2 Redirects list.

## Security notes

- The app only requests the `identify` scope.
- Access tokens stay on the server (session) and are never exposed to the browser.
- Never commit your real `.env` file.

## License

MIT
