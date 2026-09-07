# Fix game asset paths to use absolute paths from root
# This ensures assets load correctly regardless of how the page is accessed

Write-Host "Fixing asset paths to use absolute URLs..." -ForegroundColor Cyan

$htmlPath = "C:\Users\willi\OneDrive\Documents\Nova\html-main\html-main"
$htmlFiles = Get-ChildItem -Path $htmlPath -Filter "*.html"

$fixedCount = 0

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    # Replace relative paths (../../assets-main/) with absolute paths (/assets-main/)
    if ($content -match '../../assets-main/assets-main/') {
        $content = $content -replace '\.\./\.\./assets-main/assets-main/', '/assets-main/assets-main/'
        $modified = $true
        Write-Host "Fixed: $($file.Name)" -ForegroundColor Green
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $fixedCount++
    }
}

Write-Host ""
Write-Host "Fixed $fixedCount game(s) to use absolute paths" -ForegroundColor Green
Write-Host "Assets will now load from: /assets-main/assets-main/[GAME_ID]/" -ForegroundColor Yellow
