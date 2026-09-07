# Add gameLink to ALL games in zones.json
# Uses strawberri-jam.deepee.com/study2/ + filename

Write-Host "Adding gameLinks to all games..." -ForegroundColor Cyan

$zonesPath = "C:\Users\willi\OneDrive\Documents\Nova\assets-main\assets-main\zones.json"
$content = Get-Content $zonesPath -Raw | ConvertFrom-Json

$baseUrl = "https://strawberri-jam.deepee.com/study2/"
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
        
        # Add gameLink property
        $game | Add-Member -MemberType NoteProperty -Name "gameLink" -Value $gameLink -Force
        
        Write-Host "Added gameLink for $($game.name): $gameLink" -ForegroundColor Green
        $updated++
    }
}

# Save back to file
$content | ConvertTo-Json -Depth 10 | Set-Content $zonesPath -Encoding UTF8

Write-Host ""
Write-Host "✅ Added gameLinks to $updated games!" -ForegroundColor Green
Write-Host "All games will now load from strawberri-jam.deepee.com through proxy" -ForegroundColor Yellow
