# Update all gameLinks to use genizymath.github.io/iframe/
# Example: https://genizymath.github.io/iframe/0.html

Write-Host "Updating gameLinks to genizymath.github.io..." -ForegroundColor Cyan

$zonesPath = "C:\Users\willi\OneDrive\Documents\Nova\assets-main\assets-main\zones.json"
$content = Get-Content $zonesPath -Raw | ConvertFrom-Json

$baseUrl = "https://genizymath.github.io/iframe/"
$updated = 0

foreach ($game in $content) {
    # Skip the Discord suggestion entry (id: -1)
    if ($game.id -eq -1) {
        continue
    }
    
    # Extract filename from url field
    # url is like: "{HTML_URL}/1-fde.html"
    if ($game.url -match '([^/]+\.html)$') {
        $filename = $matches[1]
        $gameLink = $baseUrl + $filename
        
        # Update gameLink property
        $game.gameLink = $gameLink
        
        Write-Host "Updated gameLink for $($game.name): $gameLink" -ForegroundColor Green
        $updated++
    }
}

# Save back to file
$content | ConvertTo-Json -Depth 10 | Set-Content $zonesPath -Encoding UTF8

# Also update root zones.json
Copy-Item $zonesPath "C:\Users\willi\OneDrive\Documents\Nova\zones.json" -Force

Write-Host ""
Write-Host "✅ Updated gameLinks for $updated games!" -ForegroundColor Green
Write-Host "All games will now load from genizymath.github.io/iframe/ through proxy" -ForegroundColor Yellow
