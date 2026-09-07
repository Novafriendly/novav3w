# 🎮 Self-Hosting Games Guide

## Why Self-Host Games?

When games are blocked by network filters, self-hosting them on your own domain/server bypasses these blocks because:
- Games load from YOUR domain (e.g., novav3w.vercel.app)
- No external URLs to be filtered
- Network sees it as "your website" content

## How Seraph Does It

Seraph hosts entire game folders in their repository:
```
/games
  /1v1lol
    index.html
    UnityLoader.js
    /Build
      game files...
  /basketball-stars
    index.html
    ...
```

When deployed to Vercel, games are accessible at:
- `https://seraph.vercel.app/games/1v1lol/`
- `https://seraph.vercel.app/games/basketball-stars/`

## Setting Up Self-Hosted Games in Nova

### Step 1: Create Games Folder Structure

1. Create a `games` folder in your Nova repository:
```
C:\Users\willi\OneDrive\Documents\Nova\games\
```

2. For each game you want to self-host, create a subfolder:
```
Nova/
  games/
    1v1lol/
    big-shot-boxing/
    slope/
```

### Step 2: Download Game Files

**Method 1: Clone from existing repos**
```bash
# Example: Clone 1v1.lol from Seraph
git clone https://github.com/a456pur/seraph.git temp
cp -r temp/games/1v1lol Nova/games/
rm -rf temp
```

**Method 2: Use HTTrack to download games**
```bash
# Install HTTrack (website copier)
# Windows: Download from https://www.httrack.com/

# Download a game site
httrack "https://example.com/game/" -O "Nova/games/game-name"
```

**Method 3: Manual download (for simple games)**
1. Open browser DevTools (F12) → Network tab
2. Play the game and see what files it loads
3. Download HTML, JS, CSS, images, etc.
4. Reconstruct folder structure

### Step 3: Update Games List

Create or update `self-hosted-games.json`:

```json
[
  {
    "id": "1v1lol_selfhosted",
    "name": "1v1.LOL",
    "path": "games/1v1lol/index.html",
    "cover": "covers-main/covers-main/116.png",
    "author": "JustPlay.LOL",
    "genre": "shooting",
    "isSelfHosted": true
  },
  {
    "id": "bigshot_selfhosted",
    "name": "Big Shot Boxing",
    "path": "games/big-shot-boxing/index.html",
    "cover": "Img/game/Bigshotboxing.jpg",
    "author": "Big Shot Games",
    "genre": "sports",
    "isSelfHosted": true
  }
]
```

### Step 4: Update games.html to Load Both Types

The system will automatically detect:
- `url` field = External URL (uses proxy if needed)
- `path` field = Self-hosted (loads directly from your server)

## Quick Setup: Clone Popular Games from Seraph

```bash
cd C:\Users\willi\OneDrive\Documents\Nova

# Create games folder
mkdir games

# Clone Seraph temporarily
git clone https://github.com/a456pur/seraph.git seraph-temp

# Copy specific games
cp -r seraph-temp/games/1v1lol games/
cp -r seraph-temp/games/slope games/
cp -r seraph-temp/games/basketballstars games/

# Clean up
rm -rf seraph-temp

# Add to git
git add games/
git commit -m "Add self-hosted games"
git push
```

## Recommended Games to Self-Host

These games are commonly blocked and benefit from self-hosting:
1. **1v1.LOL** - Very popular, often blocked
2. **Slope** - Frequently blocked in schools
3. **Retro Bowl** - High demand
4. **Basketball Stars** - Sports game, often blocked
5. **Subway Surfers** - Popular mobile game
6. **Run 3** - Classic unblocked game

## File Size Considerations

**Important:** Self-hosted games take up repository space:
- Small HTML5 games: 1-5 MB
- Unity WebGL games: 10-50 MB
- Large games: 50-200 MB

**GitHub limits:**
- Single file: 100 MB max
- Repository: 1 GB recommended limit
- Large repos may have slow deployments

**Solutions for large games:**
1. Use Git LFS (Large File Storage)
2. Host assets on external CDN (Cloudinary, ImgBB)
3. Keep only essential files, link to external assets

## Updating Self-Hosted Games

When game developers update their games:

```bash
cd C:\Users\willi\OneDrive\Documents\Nova\games\1v1lol

# Download new version (use HTTrack or manual download)

git add .
git commit -m "Update 1v1.lol to latest version"
git push
```

## Testing Self-Hosted Games

1. **Local testing:**
   - Open `file:///C:/Users/willi/OneDrive/Documents/Nova/games/1v1lol/index.html`
   - Or run local server: `python -m http.server 8000`

2. **After deploy to Vercel:**
   - Visit `https://your-site.vercel.app/games/1v1lol/`
   - Check browser console for errors

## Troubleshooting

### Game shows blank screen
- Check browser console for errors
- Ensure all file paths are relative (not absolute URLs)
- Check if game needs specific domain (some games verify origin)

### Game loads but crashes
- May need to edit game code to remove domain checks
- Check if external APIs are blocked
- Ensure all assets loaded correctly

### Deployment fails
- Files too large (use Git LFS)
- Check Vercel build logs
- Reduce repo size by removing unused games

## Advanced: Creating Hybrid System

You can offer BOTH external URLs (with proxy) AND self-hosted versions:

```json
{
  "id": "1v1lol",
  "name": "1v1.LOL", 
  "url": "https://1v1.lol",
  "selfHostedPath": "games/1v1lol/index.html",
  "cover": "covers/116.png",
  "preferSelfHosted": true
}
```

The game player can try self-hosted first, fallback to proxy if needed.

---

**Need help?** Check Seraph's repository for examples:
https://github.com/a456pur/seraph/tree/main/games
