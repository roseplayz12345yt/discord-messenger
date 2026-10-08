# Discord Messenger

**A real website** where users sign in with Discord and send direct messages to their friends.

Live demo style app — deploy it yourself in under 5 minutes for free.

---

## Deploy as a Website (Recommended)

### Option 1: Deploy on Render (easiest free option)

1. Go to [https://render.com](https://render.com) and sign up (free).
2. Click **New + → Blueprint**.
3. Connect your GitHub account and select the `discord-messenger` repository.
4. Render will detect the `render.yaml` file.
5. Fill in these environment variables when asked:

   | Key | Value |
   |-----|-------|
   | `DISCORD_CLIENT_ID` | Your Discord Client ID |
   | `DISCORD_CLIENT_SECRET` | Your Discord Client Secret |
   | `REDIRECT_URI` | `https://your-app-name.onrender.com/auth/callback` |

6. Click **Apply**. Wait ~2 minutes for it to deploy.
7. Copy the URL Render gives you (e.g. `https://discord-messenger-xxxx.onrender.com`).

8. **Important final step**  
   Go back to the [Discord Developer Portal](https://discord.com/developers/applications) → your app → **OAuth2 → Redirects**  
   Add the exact URL:  
   `https://your-app-name.onrender.com/auth/callback`  
   and save.

Your website is now live!

### Option 2: Deploy on Railway

1. Go to [https://railway.app](https://railway.app)
2. New Project → Deploy from GitHub → select this repo
3. Add the same environment variables as above
4. Set `REDIRECT_URI` to the Railway domain + `/auth/callback`
5. Add that redirect URL in Discord Developer Portal

---

## Local Development

```bash
git clone https://github.com/roseplayz12345yt/discord-messenger.git
cd discord-messenger
npm install
cp .env.example .env
```

Edit `.env`:

```env
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
REDIRECT_URI=http://localhost:3000/auth/callback
SESSION_SECRET=any-long-random-string
```

Then run:

```bash
npm start
```

Open http://localhost:3000

---

## How to create the Discord Application

1. Visit https://discord.com/developers/applications
2. Click **New Application** → give it a name
3. Go to **OAuth2**
4. Copy **Client ID** and **Client Secret**
5. Under **Redirects**, add both:
   - `http://localhost:3000/auth/callback` (for local testing)
   - Your production URL (e.g. `https://your-app.onrender.com/auth/callback`)

---

## How users send messages

1. Click **Sign in with Discord**
2. Authorize the app
3. Paste a friend’s Discord User ID
4. Type a message and send

**To get someone’s Discord User ID:**
- Enable **Developer Mode** in Discord (User Settings → Advanced)
- Right-click their name → **Copy User ID**

---

## Features

- Clean Discord-inspired dark theme
- Secure OAuth2 login (tokens never leave the server)
- Send real DMs from the user’s own account
- Mobile-friendly

## Notes

- Discord only delivers the message if the recipient has you as a friend **or** allows DMs from server members.
- The free tier on Render sleeps after inactivity (first load can take ~30 seconds).

---

Made with Discord OAuth2 + Express
