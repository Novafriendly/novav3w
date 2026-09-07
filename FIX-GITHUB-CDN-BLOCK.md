# 🔧 Fixing GitHub CDN Blocking Issue

## The Problem

Your school blocks:
- `github.com` ❌
- `githubusercontent.com` ❌  
- `cdn.jsdelivr.net/gh/` ❌ (jsDelivr serving GitHub content)

Many of your game HTML files have this line:
```html
<base href="https://cdn.jsdelivr.net/gh/freebuisness/assets@main/113/">
```

When the game tries to load assets from jsDeliv GitHub CDN, it gets blocked.

## Solutions

### Solution 1: Download Assets Locally (Best for Reliability)

1. **Download game assets:**
```bash
# For each game that's blocked, download its assets
# Example for game 113:
wget -r -np -nH --cut-dirs=4 https://cdn.jsdelivr.net/gh/freebuisness/assets@main/113/
```

2. **Move to assets-main folder:**
```
assets-main/
  assets-main/
    113/
      assets/
        index-Tc6MTS1z.js
        index-ZTuZXFCc.css
      icon32.png
      ...
```

3. **Update HTML file:**
```html
<!-- Change from: -->
<base href="https://cdn.jsdelivr.net/gh/freebuisness/assets@main/113/">

<!-- To: -->
<base href="../../assets-main/assets-main/113/">
```

### Solution 2: Use Alternative CDN (Quick Fix)

Replace jsDelivr with Unpkg or other CDNs that aren't blocked:

```html
<!-- Option A: Use unpkg.com -->
<base href="https://unpkg.com/browse/@freebuisness/assets@latest/113/">

<!-- Option B: Use Cloudflare CDN -->  
<base href="https://cdnjs.cloudflare.com/ajax/libs/...">

<!-- Option C: Use Statically -->
<base href="https://cdn.statically.io/gh/freebuisness/assets/main/113/">
```

### Solution 3: Remove Base Tag (Manual Path Updates)

1. Remove the `<base href="...">` line
2. Update all asset paths to be relative:

```html
<!-- Change: -->
<script src="assets/index.js"></script>

<!-- To: -->
<script src="../../assets-main/assets-main/113/assets/index.js"></script>
```

## Quick Fix Script

Here's a PowerShell script to test which CDNs work at your school:

```powershell
# test-cdns.ps1
$cdns = @(
    "https://cdn.jsdelivr.net/gh/freebuisness/assets@main/113/icon32.png",
    "https://unpkg.com/test",
    "https://cdn.statically.io/gh/freebuisness/assets/main/113/icon32.png",
    "https://cdnjs.cloudflare.com",
    "https://fastly.jsdelivr.net/gh/freebuisness/assets@main/113/icon32.png"
)

foreach ($cdn in $cdns) {
    try {
        Invoke-WebRequest -Uri $cdn -TimeoutSec 5 | Out-Null
        Write-Host "✅ WORKS: $cdn" -ForegroundColor Green
    } catch {
        Write-Host "❌ BLOCKED: $cdn" -ForegroundColor Red
    }
}
```

## Recommended: Hybrid Approach

1. **For popular games** (1v1.LOL, Slope, Retro Bowl):
   - Download assets locally
   - Host in assets-main folder
   - Update base href to relative paths

2. **For less popular games**:
   - Try alternative CDNs
   - If blocked, use proxy

3. **For games that don't work**:
   - Mark as "requires unblock" in games list
   - Provide alternative versions

## Automated Fix

I can create a script that:
1. Scans all HTML files in `html-main`
2. Finds jsDeliv GitHub references
3. Downloads assets to `assets-main`
4. Updates HTML files to use local paths

Would you like me to create this automated fix script?

## Testing

After applying fixes:
1. Test at home (should work)
2. Test at school (verify unblocked)
3. Check browser console for 404 errors
4. Verify game loads and plays correctly

## Notes

- Some games may have hard-coded CDN URLs in their JavaScript
- These are harder to fix without modifying the JS files
- Consider using a service worker to intercept and redirect requests
