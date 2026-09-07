# PowerShell script to clone popular games from Seraph repository
# Run this in PowerShell: .\clone-seraph-games.ps1

Write-Host "🎮 Nova - Self-Hosted Games Setup" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

# Check if games folder exists
if (!(Test-Path "games")) {
    Write-Host "📁 Creating games folder..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "games" | Out-Null
}

# Clone Seraph temporarily
Write-Host "⬇️  Downloading Seraph repository..." -ForegroundColor Yellow
if (Test-Path "seraph-temp") {
    Remove-Item -Recurse -Force "seraph-temp"
}
git clone --depth 1 https://github.com/a456pur/seraph.git seraph-temp

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to clone repository. Check your internet connection." -ForegroundColor Red
    exit 1
}

# List of popular games to copy
$games = @(
    "1v1lol",
    "slope",
    "basketballstars",
    "retrobowl",
    "subwaysurfers",
    "driftboss",
    "tunnelrush",
    "run3"
)

Write-Host "`n📦 Copying games..." -ForegroundColor Yellow

$copiedCount = 0
foreach ($game in $games) {
    $sourcePath = "seraph-temp\games\$game"
    $destPath = "games\$game"
    
    if (Test-Path $sourcePath) {
        if (!(Test-Path $destPath)) {
            Write-Host "  ✅ Copying $game..." -ForegroundColor Green
            Copy-Item -Recurse $sourcePath $destPath
            $copiedCount++
        } else {
            Write-Host "  ⏭️  Skipping $game (already exists)" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ⚠️  $game not found in Seraph repo" -ForegroundColor Yellow
    }
}

# Clean up
Write-Host "`n🧹 Cleaning up..." -ForegroundColor Yellow
Remove-Item -Recurse -Force "seraph-temp"

Write-Host "`n✨ Setup complete!" -ForegroundColor Green
Write-Host "Copied $copiedCount games to the games/ folder`n" -ForegroundColor Green

# Create self-hosted-games.json if it doesn't exist
if (!(Test-Path "self-hosted-games.json")) {
    Write-Host "📝 Creating self-hosted-games.json..." -ForegroundColor Yellow
    
    $gamesJson = @'
[
  {
    "id": "1v1lol_selfhosted",
    "name": "1v1.LOL",
    "path": "games/1v1lol/index.html",
    "cover": "covers-main/covers-main/116.png",
    "author": "JustPlay.LOL",
    "genre": "shooting",
    "isSelfHosted": true
  },
  {
    "id": "slope_selfhosted",
    "name": "Slope",
    "path": "games/slope/index.html",
    "cover": "covers-main/covers-main/slope.png",
    "author": "Y8 Games",
    "genre": "arcade",
    "isSelfHosted": true
  },
  {
    "id": "basketballstars_selfhosted",
    "name": "Basketball Stars",
    "path": "games/basketballstars/index.html",
    "cover": "covers-main/covers-main/basketball.png",
    "author": "Madpuffers",
    "genre": "sports",
    "isSelfHosted": true
  },
  {
    "id": "retrobowl_selfhosted",
    "name": "Retro Bowl",
    "path": "games/retrobowl/index.html",
    "cover": "covers-main/covers-main/retro-bowl.png",
    "author": "New Star Games",
    "genre": "sports",
    "isSelfHosted": true
  }
]
'@
    
    $gamesJson | Out-File -FilePath "self-hosted-games.json" -Encoding UTF8
    Write-Host "✅ Created self-hosted-games.json`n" -ForegroundColor Green
}

Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Review the games in the games/ folder" -ForegroundColor White
Write-Host "2. Test locally: games/1v1lol/index.html" -ForegroundColor White
Write-Host "3. Commit and push to GitHub:" -ForegroundColor White
Write-Host "   git add games/ self-hosted-games.json" -ForegroundColor Gray
Write-Host "   git commit -m 'Add self-hosted games'" -ForegroundColor Gray
Write-Host "   git push" -ForegroundColor Gray
Write-Host "4. Deploy to Vercel`n" -ForegroundColor White

Write-Host "Games will be accessible at:" -ForegroundColor Cyan
Write-Host "https://your-site.vercel.app/games/1v1lol/" -ForegroundColor Gray
Write-Host ""
