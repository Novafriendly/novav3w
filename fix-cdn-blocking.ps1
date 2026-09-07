# Fix CDN Blocking Script
# This script finds and fixes jsDelivr GitHub CDN references in game HTML files

Write-Host "Scanning game HTML files for blocked CDN references..." -ForegroundColor Cyan

$htmlPath = "C:\Users\willi\OneDrive\Documents\Nova\html-main\html-main"
$htmlFiles = Get-ChildItem -Path $htmlPath -Filter "*.html"

$blockedGames = @()
$fixedCount = 0

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Check for jsDelivr GitHub CDN references
    if ($content -match 'cdn\.jsdelivr\.net/gh/') {
        $gameName = $file.BaseName
        Write-Host "Found blocked CDN in: $gameName.html" -ForegroundColor Red
        
        # Extract the base href
        if ($content -match '<base href="(https://cdn\.jsdelivr\.net/gh/[^"]+)">') {
            $oldUrl = $matches[1]
            Write-Host "  Old: $oldUrl" -ForegroundColor Yellow
            
            # Replace with Statically CDN (usually not blocked)
            $newUrl = $oldUrl -replace 'cdn\.jsdelivr\.net/gh/', 'cdn.statically.io/gh/'
            
            # Replace the URL
            $newContent = $content -replace [regex]::Escape($oldUrl), $newUrl
            Set-Content -Path $file.FullName -Value $newContent -NoNewline
            
            Write-Host "  New: $newUrl" -ForegroundColor Green
            $fixedCount++
            
            $blockedGames += $gameName
        }
    }
}

Write-Host ""
Write-Host "Fixed $fixedCount game(s)" -ForegroundColor Green
Write-Host ""
Write-Host "Summary of fixed games:" -ForegroundColor Cyan
foreach ($game in $blockedGames) {
    Write-Host "  - $game" -ForegroundColor White
}

Write-Host ""
Write-Host "IMPORTANT: Test these games at school to verify they work!" -ForegroundColor Yellow
