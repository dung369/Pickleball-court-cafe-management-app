@echo off
echo ====================================
echo Pickleball Drink Manager - Installer
echo ====================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js chua duoc cai dat!
    echo Vui long tai Node.js tai: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [1/4] Kiem tra Node.js... OK
echo.

REM Install dependencies
echo [2/4] Dang cai dat dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Cai dat that bai!
    pause
    exit /b 1
)
echo.

REM Seed menu data
echo [3/4] Dang them du lieu menu mau...
node seed-menu.js
echo.

REM Done
echo [4/4] Hoan thanh!
echo.
echo ====================================
echo CAI DAT THANH CONG!
echo ====================================
echo.
echo De chay ung dung, go lenh:
echo   npm start
echo.
echo Hoac double-click file: start-app.bat
echo.
pause
