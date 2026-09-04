# Nova 🚀

An all-in-one gaming and productivity hub with built-in proxy support.

## Features ✨

- 🎮 **Game Library** - Access to hundreds of games
- 🌐 **Web Proxy** - Built-in Bare server for bypassing restrictions
- 📱 **Apps Hub** - Quick access to educational and productivity apps
- 🎨 **Customizable** - Backgrounds, themes, and settings
- 🔐 **Privacy Features** - Tab cloaking, panic key
- 💾 **Local Storage** - All settings saved locally

## Quick Start 🏃‍♂️

### Local Development

```bash
# Install dependencies
npm install

# Start the server
npm start

# Or with auto-reload
npm run dev
```

Visit `http://localhost:3000`

### Deploy to Vercel 🚀

1. **Install Vercel CLI** (optional):
```bash
npm i -g vercel
```

2. **Deploy**:

**Option A: Using Vercel CLI**
```bash
vercel
```

**Option B: Using Vercel Website**
- Go to [vercel.com](https://vercel.com)
- Click "Import Project"
- Connect your GitHub repo or upload this folder
- Click Deploy!

3. **Done!** Your site will be live at `https://your-project.vercel.app`

## Project Structure 📁

```
Nova/
├── index.html          # Main entry point (redirects to home.html)
├── home.html           # Landing page
├── games.html          # Games library
├── apps.html           # Apps hub
├── browser.html        # Browser with proxy
├── settings.html       # Settings page
├── game-player.html    # Game player interface
├── app-player.html     # App player interface
├── terms.html          # Terms of Service
├── privacy.html        # Privacy Policy
├── dmca.html           # DMCA Policy
├── server.js           # Express + Bare server
├── package.json        # Dependencies
├── vercel.json         # Vercel configuration
├── Img/                # Images and wallpapers
├── covers-main/        # Game covers
└── assets-main/        # Game assets
```

See `STRUCTURE.md` for detailed organization!

## Configuration ⚙️

### Proxy Settings

The Bare server runs on `/bare/` endpoint. No additional configuration needed!

### Environment Variables

Create a `.env` file (optional):
```env
PORT=3000
NODE_ENV=production
```

## Technologies Used 🛠️

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **Proxy**: Bare Server, Mercury Workshop Transports
- **Deployment**: Vercel

## Support 💬

If you encounter any issues:
1. Make sure all dependencies are installed (`npm install`)
2. Check that port 3000 is available
3. Verify Node.js version (>= 18.0.0)

## License 📄

MIT License - Feel free to use and modify!

---

Made with ❤️ by the Nova team
