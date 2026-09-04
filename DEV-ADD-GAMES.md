# 🎮 How to Add Proxied Games (Developer Guide)

This guide shows you how to add games to Nova that will automatically use the Scramjet proxy.

## Method 1: Add to proxied-games.json (Recommended)

Edit the `proxied-games.json` file and add your game following this format:

```json
{
  "id": "proxy_yourgamename",
  "name": "Your Game Name",
  "url": "https://yourgame.com",
  "cover": "https://image-url.com/cover.png",
  "author": "Game Developer",
  "genre": "action",
  "isProxied": true
}
```

### Fields Explained:

- **id**: Unique identifier (use `proxy_` prefix + game name, no spaces)
- **name**: Display name shown to users
- **url**: Game URL (will be automatically proxied through Scramjet)
- **cover**: Cover image URL (300x400 recommended, or use Poki CDN format)
- **author**: Game developer/creator name
- **genre**: One of: `action`, `shooting`, `racing`, `puzzle`, `sports`, `io`, `adventure`, `strategy`, `arcade`
- **isProxied**: **MUST be `true`** - tells Nova to route through proxy

### Full Example:

```json
[
  {
    "id": "proxy_shellshockers",
    "name": "Shell Shockers",
    "url": "https://shellshock.io",
    "cover": "https://img.poki.com/cdn-cgi/image/quality=78,width=600,height=600,fit=cover,f=auto/9c11ff98cc8ef1391d9c2e6df8e66c38.png",
    "author": "Blue Wizard Digital",
    "genre": "shooting",
    "isProxied": true
  },
  {
    "id": "proxy_slope",
    "name": "Slope",
    "url": "https://slope-game.github.io/rilo/slope/index.html",
    "cover": "https://img.poki.com/cdn-cgi/image/quality=78,width=600,height=600,fit=cover,f=auto/d191caa910e148c0f4c0f40d1d93d8a3.png",
    "author": "Rob Kay",
    "genre": "racing",
    "isProxied": true
  }
]
```

## Method 2: Users Can Add Games

Users can click the **"+ Add Custom Game"** button in the games page to add their own proxied games. These are stored in localStorage and won't appear for other users.

## How the Proxy Works

When a game has `"isProxied": true`:
1. User clicks the game
2. Nova opens `game-player.html?url=GAME_URL&proxy=true`
3. Game-player.html routes it through: `https://scracmjetfornovatesters.onrender.com/?url=ENCODED_URL&transport=libcurl`
4. Game loads through Scramjet proxy

## Testing Your Games

1. Edit `proxied-games.json`
2. Save the file
3. Push to GitHub: `git add proxied-games.json && git commit -m "Add new proxied game" && git push`
4. Vercel will auto-deploy
5. Test the game on your site

## Finding Cover Images

### Option 1: Poki CDN (Best Quality)
Format: `https://img.poki.com/cdn-cgi/image/quality=78,width=600,height=600,fit=cover,f=auto/[IMAGE_ID].png`

### Option 2: Use Placeholder
`https://via.placeholder.com/300x400/8b5cf6/ffffff?text=GAME+NAME`

### Option 3: Upload Your Own
Use any image hosting service (Imgur, Cloudinary, etc.)

## Available Genres

- `action` - Action
- `shooting` - Shooting
- `racing` - Racing
- `puzzle` - Puzzle
- `sports` - Sports
- `io` - IO Games
- `adventure` - Adventure
- `strategy` - Strategy
- `arcade` - Arcade

## Notes

- All games in `proxied-games.json` will appear for ALL users
- User-added custom games are stored locally (only that user sees them)
- Make sure `isProxied: true` is set, otherwise the game won't use the proxy
- Games load in the same order they appear in the JSON file
