$ErrorActionPreference='Stop'
$projectRoot=[IO.Path]::GetFullPath($PSScriptRoot)
$repository='https://github.com/Novafriendly/novav3w.git'
$cacheBase=Join-Path $env:LOCALAPPDATA 'NovaUploader'
$uploadRoot=Join-Path $cacheBase 'novav3w.git'
$indexPath=Join-Path ([IO.Path]::GetTempPath()) ('Nova-index-'+[guid]::NewGuid().ToString('N'))
$oldIndex=$env:GIT_INDEX_FILE
$gitCommand=(Get-Command git -ErrorAction SilentlyContinue).Source
$lock=$null
function Git-Result {
 param([string[]]$Arguments)
 $result=@(& $gitCommand @Arguments)
 if($LASTEXITCODE -ne 0){throw 'Git could not finish. Check the message above; your Nova files are unchanged.'}
 return ,$result
}
function Run-Git {param([string[]]$Arguments) (Git-Result -Arguments $Arguments) | Out-Host}
try {
 Write-Host "`n  NOVA / QUICK UPLOAD`n" -ForegroundColor Cyan
 Write-Host 'Destination: Novafriendly/novav3w - main'
 Write-Host 'Choose files first. No full game-library download.'
 if(!$gitCommand){throw 'Install Git for Windows from https://git-scm.com/downloads/win first.'}
 $paths=Git-Result -Arguments @('-C',$projectRoot,'-c','core.quotepath=false','ls-files','--cached','--others','--exclude-standard')
 $files=@($paths | Sort-Object -Unique | Where-Object {$_ -notmatch '(^|/)(\.git|node_modules|\.env(?:\..*)?|credentials[^/]*|[^/]*\.(pem|key|pfx|p12))($|/)' -and (Test-Path -LiteralPath (Join-Path $projectRoot $_) -PathType Leaf)})
 $visible=@($files | Where-Object {$_ -notmatch '/'})
 while($true){
  Write-Host "`nProject files (not a changed-files scan):" -ForegroundColor Cyan
  for($i=0;$i -lt $visible.Count;$i++){Write-Host ('{0,4}  {1}' -f ($i+1),$visible[$i])}
  Write-Host 'Numbers: 1,3,5 | ALL = all listed | Q = cancel'
  Write-Host 'FIND logo = search subfolders; FIND . = show all files containing a dot'
  $answer=(Read-Host 'Selection').Trim()
  if(!$answer -or $answer -eq 'Q'){return}
  if($answer -match '^FIND\s+(.+)$'){$search=$Matches[1];$visible=@($files|Where-Object {$_.IndexOf($search,[StringComparison]::OrdinalIgnoreCase) -ge 0});continue}
  if($answer -eq 'ALL'){$selected=@($visible);break}
  $selected=@();$valid=$true
  foreach($value in ($answer -split '[,\s]+')){$n=0;if(![int]::TryParse($value,[ref]$n) -or $n -lt 1 -or $n -gt $visible.Count){$valid=$false;break};$selected+=$visible[$n-1]}
  if($valid){$selected=@($selected|Sort-Object -Unique);break}
  Write-Host 'Use numbers from the list.' -ForegroundColor Yellow
 }
 if(!$selected.Count){return}
 Write-Host "`nSelected:" -ForegroundColor Cyan
 $selected|ForEach-Object {Write-Host ('  '+$_)}
 $message=(Read-Host 'Update description').Trim();if(!$message){$message='Update selected Nova files'}
 if((Read-Host 'Type YES to upload, or Enter to cancel') -cne 'YES'){return}
 [IO.Directory]::CreateDirectory($cacheBase)|Out-Null
 try{$lock=[IO.File]::Open((Join-Path $cacheBase 'upload.lock'),[IO.FileMode]::OpenOrCreate,[IO.FileAccess]::ReadWrite,[IO.FileShare]::None)}catch{throw 'Another uploader is running. Close it first.'}
 Write-Host "`nConnecting to GitHub..." -ForegroundColor Cyan
 # Bare partial clone: no checkout and no Git LFS asset downloads.
 if(!(Test-Path -LiteralPath $uploadRoot)){Run-Git -Arguments @('clone','--bare','--filter=blob:none','--depth','1','--single-branch','--branch','main','--',$repository,$uploadRoot)}
 $remote=Git-Result -Arguments @('-C',$uploadRoot,'remote','get-url','origin')
 if($remote[0] -ne $repository){throw 'Cache repository does not match. Stopped.'}
 Run-Git -Arguments @('-C',$uploadRoot,'fetch','--depth','1','--filter=blob:none','origin','+refs/heads/main:refs/remotes/origin/main')
 $base=(Git-Result -Arguments @('-C',$uploadRoot,'rev-parse','refs/remotes/origin/main'))[0]
 $env:GIT_INDEX_FILE=$indexPath
 Run-Git -Arguments @('-C',$uploadRoot,'read-tree',$base)
 $changed=0
 foreach($relative in $selected){
  $source=[IO.Path]::GetFullPath((Join-Path $projectRoot $relative))
  if(!$source.StartsWith($projectRoot+[IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase)){throw 'Invalid file path.'}
  $item=Get-Item -LiteralPath $source
  # OneDrive files use ReparsePoint too; only real links are rejected.
  $check=$item
  while($check -and $check.FullName -ne $projectRoot){
   if($check.LinkType -in @('SymbolicLink','Junction')){throw "Linked path is not supported: $relative"}
   if($check -is [IO.FileInfo]){$check=$check.Directory}else{$check=$check.Parent}
  }
  try{$stream=[IO.File]::Open($source,[IO.FileMode]::Open,[IO.FileAccess]::Read,[IO.FileShare]::ReadWrite);try{[void]$stream.ReadByte()}finally{$stream.Dispose()}}
  catch{throw "Cannot read $relative. If it is online-only, connect OneDrive or choose 'Always keep on this device', then retry."}
  if($item.Length -gt 95MB){throw "File exceeds 95 MB: $relative. Large assets require a separate Git LFS upload."}
  Write-Host "Preparing $relative"
  $oid=(Git-Result -Arguments @('-C',$uploadRoot,'hash-object','-w','--no-filters','--',$source))[0]
  $entry=Git-Result -Arguments @('-C',$uploadRoot,'ls-tree',$base,'--',$relative)
  $mode='100644'
  if($entry.Count -and $entry[0] -match '^(\d+) blob ([a-f0-9]+)\t'){$mode=$Matches[1];if($mode -eq '120000'){throw "Linked repository file requires manual handling: $relative"};if($Matches[2] -eq $oid){continue}}
  Run-Git -Arguments @('-C',$uploadRoot,'update-index','--add','--cacheinfo',$mode,$oid,$relative)
  $changed++
 }
 if(!$changed){Write-Host 'Selected files already match GitHub.' -ForegroundColor Green;return}
 foreach($field in @('name','email')){
  $value=& $gitCommand -C $uploadRoot config ('user.'+$field)
  if(!$value){$value=(Read-Host "Commit author $field (GitHub no-reply email is OK)").Trim();if(!$value){throw 'Author name and email are required.'};Run-Git -Arguments @('-C',$uploadRoot,'config','--local',('user.'+$field),$value)}
 }
 $tree=(Git-Result -Arguments @('-C',$uploadRoot,'write-tree'))[0]
 $commit=(Git-Result -Arguments @('-C',$uploadRoot,'commit-tree',$tree,'-p',$base,'-m',$message))[0]
 Write-Host "Uploading $changed file(s)..." -ForegroundColor Cyan
 # Normal push refuses concurrent updates. Never force push.
 Run-Git -Arguments @('-C',$uploadRoot,'push','origin',($commit+':refs/heads/main'))
 Write-Host "`nUploaded! https://github.com/Novafriendly/novav3w/commit/$commit" -ForegroundColor Green
 Write-Host 'Hosting deployment may take a little longer.'
}catch{Write-Host "`nUpload stopped: $($_.Exception.Message)" -ForegroundColor Red;Write-Host 'Sign in if Git asks. If main changed, run again.';exit 1}
finally{$env:GIT_INDEX_FILE=$oldIndex;if(Test-Path -LiteralPath $indexPath){Remove-Item -LiteralPath $indexPath -Force -ErrorAction SilentlyContinue};if($lock){$lock.Dispose()}}
