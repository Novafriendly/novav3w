# Fix CDN Blocking Script V2
# Replace blocked CDNs with CORS proxy URLs

Write-Host "Fixing CDN blocking using CORS proxy method..." -ForegroundColor Cyan

$htmlPath = "C:\Users\willi\OneDrive\Documents\Nova\html-main\html-main"
$htmlFiles = Get-ChildItem -Path $htmlPath -Filter "*.html"

$fixedCount = 0

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    # Method 1: Replace with CORS proxy (corsproxy.io)
    if ($content -match 'cdn\.statically\.io/gh/') {
        $content = $content -replace 'https://cdn\.statically\.io/gh/', 'https://corsproxy.io/?https://raw.githubusercontent.com/'
        $modified = $true
        Write-Host "Fixed: $($file.Name)" -ForegroundColor Green
    }
    
    # Also catch any remaining jsdelivr
    if ($content -match 'cdn\.jsdelivr\.net/gh/') {
        $content = $content -replace 'https://cdn\.jsdelivr\.net/gh/', 'https://corsproxy.io/?https://raw.githubusercontent.com/'
        $modified = $true
        Write-Host "Fixed: $($file.Name)" -ForegroundColor Green
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $fixedCount++
    }
}

Write-Host ""
Write-Host "Fixed $fixedCount game(s)" -ForegroundColor Green
Write-Host ""
Write-Host "Now using CORS proxy to bypass school blocking!" -ForegroundColor Yellow
