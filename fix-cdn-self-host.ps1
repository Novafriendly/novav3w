# Fix CDN Blocking by Self-Hosting Assets
# This script updates all game HTML files to use local assets

Write-Host "Updating game HTML files to use self-hosted assets..." -ForegroundColor Cyan

$htmlPath = "C:\Users\willi\OneDrive\Documents\Nova\html-main\html-main"
$htmlFiles = Get-ChildItem -Path $htmlPath -Filter "*.html"

$fixedCount = 0
$fixedGames = @()

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    # Extract game ID from filename (e.g., "113.html" -> "113")
    $gameId = $file.BaseName
    
    # Pattern 1: CORS proxy URLs (from previous fix)
    if ($content -match 'https://corsproxy\.io/\?https://raw\.githubusercontent\.com/[^/]+/[^/]+@[^/]+/([^/]+)/') {
        $assetFolder = $matches[1]
        $content = $content -replace 'https://corsproxy\.io/\?https://raw\.githubusercontent\.com/[^/]+/[^/]+@[^/]+/[^/]+/', "../../assets-main/assets-main/$gameId/"
        $modified = $true
        Write-Host "Fixed (CORS): $($file.Name) -> $gameId" -ForegroundColor Green
    }
    
    # Pattern 2: Direct GitHub raw URLs
    if ($content -match 'https://raw\.githubusercontent\.com/[^/]+/[^/]+/[^/]+/([^/]+)/') {
        $content = $content -replace 'https://raw\.githubusercontent\.com/[^/]+/[^/]+/[^/]+/[^/]+/', "../../assets-main/assets-main/$gameId/"
        $modified = $true
        Write-Host "Fixed (Raw): $($file.Name) -> $gameId" -ForegroundColor Green
    }
    
    # Pattern 3: Statically CDN URLs
    if ($content -match 'https://cdn\.statically\.io/gh/[^/]+/[^/]+@[^/]+/([^/]+)/') {
        $content = $content -replace 'https://cdn\.statically\.io/gh/[^/]+/[^/]+@[^/]+/[^/]+/', "../../assets-main/assets-main/$gameId/"
        $modified = $true
        Write-Host "Fixed (Statically): $($file.Name) -> $gameId" -ForegroundColor Green
    }
    
    # Pattern 4: jsDelivr CDN URLs (in case any remain)
    if ($content -match 'https://cdn\.jsdelivr\.net/gh/[^/]+/[^/]+@[^/]+/([^/]+)/') {
        $content = $content -replace 'https://cdn\.jsdelivr\.net/gh/[^/]+/[^/]+@[^/]+/[^/]+/', "../../assets-main/assets-main/$gameId/"
        $modified = $true
        Write-Host "Fixed (jsDelivr): $($file.Name) -> $gameId" -ForegroundColor Green
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $fixedCount++
        $fixedGames += $gameId
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fixed $fixedCount game(s)" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "All games now use self-hosted assets from assets-main folder!" -ForegroundColor Yellow
Write-Host "Path pattern: ../../assets-main/assets-main/[GAME_ID]/" -ForegroundColor White
Write-Host ""
Write-Host "Note: Make sure the corresponding assets exist in:" -ForegroundColor Yellow
Write-Host "  C:\Users\willi\OneDrive\Documents\Nova\assets-main\assets-main\" -ForegroundColor White
