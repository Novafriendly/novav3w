@echo off
echo ========================================
echo    Nova - Local Development Server
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [1/2] Installing dependencies...
    echo.
    call npm install
    echo.
) else (
    echo [✓] Dependencies already installed
    echo.
)

echo [2/2] Starting Nova server...
echo.
echo ========================================
echo    Nova is running!
echo    Open: http://localhost:3000
echo ========================================
echo.
echo Press Ctrl+C to stop the server
echo.

npm start
