# Revert back to self-hosting from Vercel domain
# This should work everywhere since everything loads from your own domain

Write-Host "Reverting to self-hosted paths..." -ForegroundColor Cyan

$htmlPath = "C:\Users\willi\OneDrive\Documents\Nova\html-main\html-main"
$htmlFiles = Get-ChildItem -Path $htmlPath -Filter "*.html"

$fixedCount = 0

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    # Replace rawcdn.githack.com URL back to /assets-main/assets-main/
    if ($content -match '<base href="https://rawcdn\.githack\.com/Novafriendly/novav3w/main/assets-main/assets-main/') {
        $content = $content -replace '<base href="https://rawcdn\.githack\.com/Novafriendly/novav3w/main/assets-main/assets-main/', '<base href="/assets-main/assets-main/'
        $modified = $true
        Write-Host "Reverted: $($file.Name)" -ForegroundColor Green
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $fixedCount++
    }
}

Write-Host ""
Write-Host "Reverted $fixedCount game(s) back to self-hosting" -ForegroundColor Green
Write-Host "Assets will now load from: /assets-main/assets-main/[GAME_ID]/ (your Vercel domain)" -ForegroundColor Yellow
