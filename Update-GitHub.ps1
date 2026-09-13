$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath($PSScriptRoot)
$repository = 'https://github.com/Novafriendly/novav3w.git'
$branch = 'main'
$uploadRoot = Join-Path ([IO.Path]::GetTempPath()) ('Nova-GitHub-' + [guid]::NewGuid().ToString('N'))
$gitCommand = (Get-Command git -ErrorAction SilentlyContinue).Source

function Run-Git {
    param([string[]]$Arguments)
    & $gitCommand @Arguments | Out-Host
    if ($LASTEXITCODE -ne 0) { throw 'Git could not complete that step. Nothing in your Nova folder was changed.' }
}

try {
    Write-Host "`n  NOVA / UPDATE GITHUB`n" -ForegroundColor Cyan
    Write-Host "Destination: Novafriendly/novav3w ($branch)"
    Write-Host 'Only files you select will be uploaded. This does not delete files on GitHub.'
    if (!$gitCommand) { throw 'Install Git for Windows from https://git-scm.com/downloads/win, then run this file again.' }
    Write-Host "`nGetting the latest GitHub files..."
    Write-Host 'If Git asks you to sign in, use the account with access to Novafriendly/novav3w.'
    Run-Git -Arguments @('clone', '--depth', '1', '--branch', $branch, '--', $repository, $uploadRoot)

    $candidates = @(& $gitCommand -C $projectRoot -c core.quotepath=false ls-files --cached --others --exclude-standard)
    if ($LASTEXITCODE -ne 0) { throw 'Could not list your project files.' }
    $changes = @()
    foreach ($relative in ($candidates | Sort-Object -Unique)) {
        # Never offer credentials, Git internals or dependency folders.
        if ($relative -match '(^|/)(\.git|node_modules|\.env(?:\..*)?|credentials[^/]*|[^/]*\.(pem|key|pfx|p12))($|/)') { continue }
        $source = [IO.Path]::GetFullPath((Join-Path $projectRoot $relative))
        if (!$source.StartsWith($projectRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { continue }
        if (!(Test-Path -LiteralPath $source -PathType Leaf)) { continue }
        $file = Get-Item -LiteralPath $source
        if ($file.Attributes -band [IO.FileAttributes]::ReparsePoint) { continue }
        $destination = Join-Path $uploadRoot $relative
        $state = 'New'
        if (Test-Path -LiteralPath $destination -PathType Leaf) {
            if ((Get-FileHash -LiteralPath $source).Hash -eq (Get-FileHash -LiteralPath $destination).Hash) { continue }
            $state = 'Changed'
        }
        $changes += [pscustomobject]@{ Number = $changes.Count + 1; Status = $state; File = $relative; Source = $source }
    }
    if (!$changes.Count) { Write-Host "`nEverything already matches GitHub." -ForegroundColor Green; return }
    Write-Host "`nFiles different from GitHub:`n"
    $changes | Select-Object Number, Status, File | Format-Table -AutoSize | Out-Host
    Write-Host 'Enter file numbers separated by commas (example: 1,3,5).'
    Write-Host 'You can also enter ALL, or Q to cancel.'
    $answer = (Read-Host 'Select files').Trim()
    if (!$answer -or $answer -eq 'Q') { Write-Host 'Cancelled.'; return }
    if ($answer -eq 'ALL') { $selected = @($changes) }
    else {
        $numbers = @($answer -split '[,\s]+' | Where-Object { $_ })
        $selected = @()
        foreach ($value in $numbers) {
            $number = 0
            if (![int]::TryParse($value, [ref]$number) -or $number -lt 1 -or $number -gt $changes.Count) { throw "Invalid selection: $value. Run the uploader again and select listed numbers." }
            $selected += $changes[$number - 1]
        }
        $selected = @($selected | Sort-Object Number -Unique)
    }
    if (!$selected.Count) { return }
    Write-Host "`nSelected for upload:" -ForegroundColor Cyan
    $selected | ForEach-Object { Write-Host ('  ' + $_.File) }
    if ($selected.Source | Where-Object { (Get-Item -LiteralPath $_).Length -gt 95MB }) { throw 'A selected file is too large for a normal GitHub upload (over 95 MB). Select smaller files.' }
    $message = (Read-Host "`nDescribe this update (commit message)").Trim()
    if (!$message) { $message = 'Update selected Nova files' }
    if ((Read-Host 'Upload these files to main? Type YES to continue') -cne 'YES') { Write-Host 'Cancelled.'; return }

    foreach ($item in $selected) {
        $destination = [IO.Path]::GetFullPath((Join-Path $uploadRoot $item.File))
        if (!$destination.StartsWith($uploadRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'Invalid destination path.' }
        [IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($destination)) | Out-Null
        Copy-Item -LiteralPath $item.Source -Destination $destination -Force
        Run-Git -Arguments @('-C', $uploadRoot, 'add', '--', $item.File)
    }
    & $gitCommand -C $uploadRoot diff --cached --quiet
    if ($LASTEXITCODE -eq 0) { Write-Host 'No content changes to commit (only local line endings differed).'; return }
    if ($LASTEXITCODE -ne 1) { throw 'Could not check selected changes.' }
    foreach ($field in @('name','email')) {
        $existing = & $gitCommand -C $uploadRoot config ('user.' + $field)
        if (!$existing) {
            $identityValue = (Read-Host "Git commit author $field (use your GitHub no-reply email if preferred)").Trim()
            if (!$identityValue) { throw 'A commit author name and email are required.' }
            Run-Git -Arguments @('-C', $uploadRoot, 'config', '--local', ('user.' + $field), $identityValue)
        }
    }
    Run-Git -Arguments @('-C', $uploadRoot, 'commit', '-m', $message)
    # A normal push safely refuses if main changed since the initial download.
    # Do not force-push or overwrite concurrent updates.
    Run-Git -Arguments @('-C', $uploadRoot, 'push', 'origin', 'HEAD:main')
    $commit = & $gitCommand -C $uploadRoot rev-parse HEAD
    Write-Host "`nUploaded successfully!" -ForegroundColor Green
    Write-Host "https://github.com/Novafriendly/novav3w/commit/$commit"
    Write-Host 'Your hosting provider may need time to deploy the update.'
} catch {
    Write-Host "`nUpload stopped: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host 'For sign-in errors, finish Git authentication and run again. If main changed, run again to get its latest version.'
    exit 1
} finally {
    # Delete only this run's verified, uniquely named temporary checkout.
    $tempBase = [IO.Path]::GetFullPath([IO.Path]::GetTempPath()).TrimEnd('\') + '\'
    if ($uploadRoot.StartsWith($tempBase, [StringComparison]::OrdinalIgnoreCase) -and [IO.Path]::GetFileName($uploadRoot) -match '^Nova-GitHub-[a-f0-9]{32}$' -and (Test-Path -LiteralPath $uploadRoot)) {
        Remove-Item -LiteralPath $uploadRoot -Recurse -Force -ErrorAction SilentlyContinue
    }
}
