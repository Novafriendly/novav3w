# Replace self-hosted paths with rawcdn.githack.com CDN
# This CDN serves GitHub files and might not be blocked at school

Write-Host "Switching to rawcdn.githack.com CDN..." -ForegroundColor Cyan

$htmlPath = "C:\Users\willi\OneDrive\Documents\Nova\html-main\html-main"
$htmlFiles = Get-ChildItem -Path $htmlPath -Filter "*.html"

$fixedCount = 0

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    # Replace /assets-main/assets-main/ with rawcdn.githack.com URL
    if ($content -match '<base href="/assets-main/assets-main/') {
        $content = $content -replace '<base href="/assets-main/assets-main/', '<base href="https://rawcdn.githack.com/Novafriendly/novav3w/main/assets-main/assets-main/'
        $modified = $true
        Write-Host "Fixed: $($file.Name)" -ForegroundColor Green
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $fixedCount++
    }
}

Write-Host ""
Write-Host "Converted $fixedCount game(s) to use rawcdn.githack.com" -ForegroundColor Green
Write-Host "Assets will now load from: https://rawcdn.githack.com/Novafriendly/novav3w/main/assets-main/assets-main/[GAME_ID]/" -ForegroundColor Yellow
