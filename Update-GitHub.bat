@echo off
setlocal
title Nova - Update GitHub
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0Update-GitHub.ps1"
echo.
pause
endlocal
