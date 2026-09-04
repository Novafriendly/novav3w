# 📁 Nova Project Structure

## Current Organization

```
Nova/
│
├── 🏠 ENTRY POINT
│   └── index.html              # Main entry - redirects to home.html
│
├── 📄 MAIN PAGES
│   ├── home.html               # Landing page
│   ├── games.html              # Games library
│   ├── apps.html               # Apps hub
│   ├── browser.html            # Browser with proxy
│   ├── settings.html           # Settings page
│   └── proxy.html              # Proxy configuration
│
├── 🎮 PLAYER PAGES
│   ├── game-player.html        # Game player interface
│   └── app-player.html         # App player interface
│
├── ⚖️ LEGAL PAGES
│   ├── terms.html              # Terms of Service
│   ├── privacy.html            # Privacy Policy
│   └── dmca.html               # DMCA Policy
│
├── 🖼️ ASSETS
│   ├── Img/                    # Images & wallpapers
│   │   ├── GifWallpapers/      # Video backgrounds
│   │   ├── Wallpapers/         # Static backgrounds
│   │   └── app/                # App icons
│   ├── covers-main/            # Game cover images
│   ├── assets-main/            # Game assets & files
│   ├── Nova.png                # Nova logo (large)
│   ├── Nova12.png              # Nova logo (small)
│   └── NovaBAckground.webp     # Background image
│
├── 🔧 SERVER & CONFIG
│   ├── server.js               # Express + Bare server
│   ├── serve.js                # Alternative server (if needed)
│   ├── package.json            # Dependencies
│   ├── vercel.json             # Vercel configuration
│   ├── .gitignore              # Git ignore rules
│   ├── .npmrc                  # NPM configuration
│   └── .env.example            # Environment variables template
│
├── 📚 DOCUMENTATION
│   ├── README.md               # Project overview
│   ├── SETUP.md                # Setup guide
│   ├── DEPLOY.md               # Deployment guide
│   └── STRUCTURE.md            # This file
│
└── 🚀 UTILITIES
    └── start.bat               # Quick start script (Windows)
```

---

## 🌐 URL Routes

When deployed, your URLs will work like this:

### Main Routes:
- `/` or `/index.html` → Redirects to `/home.html`
- `/home.html` → Landing page
- `/games.html` → Games library
- `/apps.html` → Apps hub
- `/browser.html` → Browser with proxy
- `/settings.html` → Settings page

### Player Routes:
- `/game-player.html?url=...&name=...` → Game player
- `/app-player.html?url=...&name=...` → App player

### Legal Routes:
- `/terms.html` → Terms of Service
- `/privacy.html` → Privacy Policy
- `/dmca.html` → DMCA Policy

### Proxy Route:
- `/bare/` → Bare server proxy endpoint

---

## 📝 How It Works

### 1. Entry Point Flow:
```
User visits: https://your-site.vercel.app
    ↓
Loads: index.html
    ↓
Auto-redirects to: home.html (main page)
```

### 2. Navigation:
```
home.html → Click Games → games.html
home.html → Click Apps → apps.html
home.html → Click Browser → browser.html
```

### 3. File Paths:
All HTML files reference assets using relative paths:
- `Img/GifWallpapers/...` for videos
- `covers-main/...` for game covers
- `Nova12.png` for logo

---

## 🔧 Server Routes

The `server.js` handles these routes:

```javascript
GET /              → index.html
GET /home          → home.html
GET /games         → games.html
GET /apps          → apps.html
GET /browser       → browser.html
GET /settings      → settings.html
GET /terms         → terms.html
GET /privacy       → privacy.html
GET /dmca          → dmca.html
GET /bare/*        → Bare proxy server
GET /static/*      → Static files (images, videos, etc.)
```

---

## 📦 Asset Organization

### Images (`Img/`)
```
Img/
├── GifWallpapers/          # Video backgrounds
│   ├── *.mp4               # Video files
│   └── thumbs/             # Thumbnails
├── Wallpapers/             # Static images
│   └── *.jpg, *.png        # Image files
└── app/                    # App icons
    └── *.jpg, *.avif       # Icon files
```

### Game Assets (`assets-main/`)
```
assets-main/
└── assets-main/
    ├── 113/, 116/, 117/    # Game folders (by ID)
    └── Each contains:
        ├── index.html      # Game entry
        ├── assets/         # Game files
        └── cover.png       # Game cover
```

### Game Covers (`covers-main/`)
```
covers-main/
└── covers-main/
    └── *.png               # Game cover images (by ID)
```

---

## 🚀 Deployment Structure

When deployed to Vercel:

```
https://your-site.vercel.app/
├── /                          # → index.html → home.html
├── /games.html                # Games page
├── /apps.html                 # Apps page
├── /browser.html              # Browser page
├── /bare/                     # Proxy endpoint
├── /Img/                      # All images
├── /covers-main/              # Game covers
└── /assets-main/              # Game files
```

---

## ✅ Verified Working

All these files reference each other correctly:

- ✅ `index.html` redirects to `home.html`
- ✅ All pages link to each other correctly
- ✅ Images load from `Img/` folder
- ✅ Game covers load from `covers-main/`
- ✅ Game assets load from `assets-main/`
- ✅ Proxy works at `/bare/`
- ✅ Settings, legal pages accessible

---

## 🎯 Key Points

1. **Entry Point:** `index.html` is the main entry (loads first)
2. **Home Page:** `home.html` is the actual landing page
3. **All paths:** Use relative paths (work locally & deployed)
4. **Proxy:** Works at `/bare/` on same domain
5. **Static files:** Served directly by Express

---

## 🔄 Navigation Flow

```
index.html
    ↓
home.html
    ├→ games.html → game-player.html
    ├→ apps.html → app-player.html
    ├→ browser.html (with proxy)
    └→ settings.html
           ├→ terms.html
           ├→ privacy.html
           └→ dmca.html
```

---

## 📊 File Counts

- **HTML Pages:** 12 files
- **Documentation:** 4 files
- **Config Files:** 6 files
- **Asset Folders:** 3 main folders
- **Total Structure:** Clean & organized!

---

**Everything is properly organized and ready to deploy!** 🚀
