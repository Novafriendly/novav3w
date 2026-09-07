# PowerShell script to clone popular games from Seraph
Write-Host "Setting up self-hosted games..." -ForegroundColor Cyan

# Create games folder
if (!(Test-Path "games")) {
    New-Item -ItemType Directory -Path "games" | Out-Null
    Write-Host "Created games folder" -ForegroundColor Green
}

# Clone Seraph
Write-Host "Downloading Seraph repository..." -ForegroundColor Yellow
if (Test-Path "seraph-temp") {
    Remove-Item -Recurse -Force "seraph-temp"
}
git clone --depth 1 https://github.com/a456pur/seraph.git seraph-temp

# Copy games
$games = @("1v1lol", "slope", "basketballstars", "retrobowl", "subwaysurfers")

foreach ($game in $games) {
    $src = "seraph-temp\games\$game"
    $dest = "games\$game"
    
    if ((Test-Path $src) -and !(Test-Path $dest)) {
        Write-Host "Copying $game..." -ForegroundColor Green
        Copy-Item -Recurse $src $dest
    }
}

# Clean up
Remove-Item -Recurse -Force "seraph-temp"

Write-Host "Setup complete!" -ForegroundColor Green
Write-Host "Next: git add games/ && git commit -m 'Add games' && git push" -ForegroundColor Yellow
