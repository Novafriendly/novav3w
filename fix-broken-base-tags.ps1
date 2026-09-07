# Fix broken base tags that were corrupted during path replacement
# These tags have malformed endings like "style>", "title>", "script>" instead of proper "/>"

Write-Host "Fixing broken base tags..." -ForegroundColor Cyan

$htmlPath = "C:\Users\willi\OneDrive\Documents\Nova\html-main\html-main"
$htmlFiles = Get-ChildItem -Path $htmlPath -Filter "*.html"

$fixedCount = 0

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    # Fix base tags ending with wrong suffixes
    # Pattern: <base href="/assets-main/assets-main/SOMETHING/[WRONG_ENDING]>
    # Should be: <base href="/assets-main/assets-main/SOMETHING/">
    
    if ($content -match '<base href="(/assets-main/assets-main/[^/]+/)[^"]*>') {
        $content = $content -replace '<base href="(/assets-main/assets-main/[^/]+/)[^"]*>', '<base href="$1">'
        $modified = $true
    }
    
    # Also fix corsproxy ones that might still exist
    if ($content -match '<base href="(https://corsproxy\.io/\?/assets-main/assets-main/[^/]+/)[^"]*>') {
        $content = $content -replace '<base href="(https://corsproxy\.io/\?/assets-main/assets-main/[^/]+/)[^"]*>', '<base href="$1">'
        $modified = $true
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $fixedCount++
        Write-Host "Fixed: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Fixed $fixedCount file(s)" -ForegroundColor Green
