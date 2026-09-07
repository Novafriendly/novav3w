# 🎮 How Nova Games Work (Self-Hosted)

## ✅ Your Games Are Already Self-Hosted!

Good news: Your games are **already configured to work unblocked** when deployed!

## How It Works

### 1. Game Files Structure
```
Nova/
├── html-main/html-main/     ← 859 game HTML files (113.html, 116.html, etc.)
├── covers-main/covers-main/  ← 845 game cover images
├── assets-main/assets-main/  ← Game assets (some games)
└── zones.json               ← Game database
```

### 2. zones.json Configuration
```json
{
  "id": 113,
  "name": "1v1.LOL",
  "cover": "{COVER_URL}/113.png",
  "url": "{HTML_URL}/113.html"
}
```

The placeholders `{HTML_URL}` and `{COVER_URL}` are replaced at runtime with:
- `{HTML_URL}` → `html-main/html-main`
- `{COVER_URL}` → `covers-main/covers-main`

### 3. When Deployed to Vercel

Your games become accessible at:
- `https://novav3w.vercel.app/html-main/html-main/113.html`
- `https://novav3w.vercel.app/html-main/html-main/116.html`
- etc.

**Network filters see these as "just part of your website"** = Won't be blocked! 🎉

## Why This Works

**Traditional Unblocked Game Sites:**
- Link to external URLs: `https://gamesite.com/game`
- Network filters can block `gamesite.com`
- ❌ Games get blocked

**Your Nova Setup:**
- Games load from YOUR domain: `https://novav3w.vercel.app/html-main/...`
- Network only sees "novav3w.vercel.app"
- ✅ Games work!

## Your 859 Games Include:

- **113** = 1v1.LOL
- **116** = Run 3
- **Slope** = Game ID (check zones.json)
- **Retro Bowl** = Game ID (check zones.json)
- And **855 more games!**

## How to Add New Games

### Option 1: Add to html-main folder
1. Download or create game HTML file
2. Save to `html-main/html-main/860.html` (next available number)
3. Add cover image to `covers-main/covers-main/860.png`
4. Update zones.json:
```json
{
  "id": 860,
  "name": "New Game",
  "cover": "{COVER_URL}/860.png",
  "url": "{HTML_URL}/860.html",
  "author": "Game Author"
}
```

### Option 2: Add to proxied-games.json (for external URLs)
```json
{
  "id": "custom_game",
  "name": "Game Name",
  "url": "https://external-game-url.com",
  "cover": "cover-url.png",
  "isProxied": true
}
```

## Testing Before Deploy

**Local testing:**
1. Open `html-main/html-main/113.html` in browser
2. Game should load and work

**After deploy:**
1. Visit `https://novav3w.vercel.app/games.html`
2. Click any game
3. It loads from your domain = unblocked!

## Common Issues

### Game shows blank screen
- Check browser console for errors
- Ensure all file paths in game HTML are relative (not absolute URLs)
- Some games may require assets from `assets-main` folder

### Game loads but doesn't work
- Game may need external API (can't be fixed by self-hosting)
- Try opening the HTML file directly to test

### Game blocked on certain networks
- If deployed to Vercel and still blocked, the network may block Vercel domains
- Try deploying to different platform (Netlify, GitHub Pages, Cloudflare Pages)

## File Size Management

**Current setup:**
- html-main: ~50-100 MB (859 games)
- covers-main: ~100-200 MB (845 covers)
- assets-main: ~Variable (game assets)
- **Total:** ~200-400 MB estimated

**GitHub limits:**
- Repository: 1 GB soft limit (5 GB hard limit)
- You're well within limits! ✅

## Deployment

Your games are already in the repo, so:

```bash
# Just push to GitHub
git push

# Vercel auto-deploys
# Games instantly available at your domain!
```

No additional setup needed - games already work! 🚀

## Pro Tips

1. **Keep html-main files small**: Avoid embedding large assets inline
2. **Use assets-main for large files**: Link to them instead of embedding
3. **Test locally first**: Open HTML files before committing
4. **Check zones.json**: Verify ID numbers don't conflict

---

**Bottom line:** Your games are perfectly set up for self-hosting and will work unblocked when deployed! 🎮
