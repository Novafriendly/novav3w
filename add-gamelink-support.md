# Add gameLink Support to Games

## What This Does
Allows you to add a `gameLink` field to any game in zones.json. When present, the game will load the external URL through the proxy (like apps do) instead of using the local HTML file.

## Changes Needed

### 1. Example zones.json Entry
```json
{
  "id": 1,
  "name": "OvO",
  "cover": "{COVER_URL}/1.png",
  "url": "{HTML_URL}/1-fde.html",
  "gameLink": "https://dedragames.com/games/ovo",
  "author": "Dedra Games",
  "authorLink": "https://dedragames.com"
}
```

- If `gameLink` exists → Load through proxy (bypasses school blocks)
- If no `gameLink` → Use local `url` file like normal

### 2. Update home.html Game Opening Logic

Find where games are opened (the onclick handler) and change it to:

```javascript
// OLD:
card.onclick = () => window.location.href = `game-player.html?url=${encodeURIComponent(game.url)}&name=${encodeURIComponent(game.name)}&icon=${encodeURIComponent(game.cover)}&proxy=false`;

// NEW:
card.onclick = () => {
  // Check if game has external gameLink
  if (game.gameLink) {
    // Use proxy for external link (like apps)
    window.location.href = `game-player.html?url=${encodeURIComponent(game.gameLink)}&name=${encodeURIComponent(game.name)}&icon=${encodeURIComponent(game.cover)}&proxy=true`;
  } else {
    // Use local HTML file
    window.location.href = `game-player.html?url=${encodeURIComponent(game.url)}&name=${encodeURIComponent(game.name)}&icon=${encodeURIComponent(game.cover)}&proxy=false`;
  }
};
```

## Usage

1. Find the external URL for a game (e.g., from the original game website)
2. Add `"gameLink": "https://..."` to that game's entry in zones.json
3. The game will now load through proxy and bypass school blocks!

## Benefits
- Works exactly like apps
- Bypasses all CDN/GitHub blocks
- No need to self-host assets
- Can mix local HTML games and proxied external games
