# 🎮 Self-Hosted Games

These games are hosted directly on Nova's domain to bypass network restrictions.

## How It Works

When you deploy Nova to Vercel, these games become accessible at:
- `https://novav3w.vercel.app/games/slope/`
- `https://novav3w.vercel.app/games/1v1lol/`
- `https://novav3w.vercel.app/games/retrobowl/`
- `https://novav3w.vercel.app/games/subwaysurfers/`
- `https://novav3w.vercel.app/games/driftboss/`

Network filters see these as "just part of your website" so they won't be blocked!

## Currently Hosted Games

1. **Slope** - Fast-paced 3D racing game
2. **1v1.LOL** - Building and shooting game
3. **Retro Bowl** - American football game
4. **Subway Surfers** - Endless runner
5. **Drift Boss** - Drifting game

## Adding More Games

### Method 1: Embed existing game URLs
Create `games/gamename/index.html`:
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Game Name | Nova</title>
    <style>
        * { margin: 0; padding: 0; }
        html, body { width: 100%; height: 100%; overflow: hidden; background: #000; }
        #game-frame { width: 100%; height: 100%; border: none; }
    </style>
</head>
<body>
    <iframe id="game-frame" src="GAME_URL_HERE" allowfullscreen></iframe>
</body>
</html>
```

### Method 2: Download full game files
1. Find the game's source files
2. Download all HTML/JS/CSS/assets
3. Place in `games/gamename/` folder
4. Ensure paths are relative (not absolute URLs)

## Update self-hosted-games.json

Add your new game:
```json
{
  "id": "gamename_selfhosted",
  "name": "Game Name",
  "path": "games/gamename/",
  "cover": "path/to/cover.png",
  "author": "Game Author",
  "genre": "genre",
  "isSelfHosted": true
}
```

## Testing Locally

Open `games/slope/index.html` directly in your browser to test before deploying.

## Deployment

After adding games:
```bash
git add games/ self-hosted-games.json
git commit -m "Add new game"
git push
```

Vercel will automatically deploy the changes.

## File Size

Current games folder: ~5KB (just HTML wrappers)

These are lightweight because they embed existing hosted games. If you download full game files, expect:
- Small HTML5 games: 1-10 MB
- Unity WebGL games: 10-50 MB
- Large games: 50-200 MB

Keep total repo under 1GB for best GitHub/Vercel performance.
