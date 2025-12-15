@echo off
chcp 65001 >nul
echo ========================================
echo   📋 DANH SÁCH BACKUP
echo ========================================
echo.

if not exist "backups" (
    echo ❌ Chưa có backup nào!
    echo.
    echo 💡 Hãy chạy backup-data.bat để tạo backup đầu tiên.
    echo.
    pause
    exit /b 0
)

echo 📁 Thư mục: backups\
echo.

REM Count backup files
for /f %%A in ('dir /b backups\*.db 2^>nul ^| find /c /v ""') do set COUNT=%%A

if %COUNT%==0 (
    echo ❌ Chưa có backup nào!
    echo.
    pause
    exit /b 0
)

echo Tổng số backup: %COUNT% file
echo.
echo ┌─────────────────────────────────────────────────────────────┐
echo │ TÊN FILE                              │  DUNG LƯỢNG  │ NGÀY │
echo ├─────────────────────────────────────────────────────────────┤

for /f "tokens=*" %%F in ('dir /b /o-d backups\*.db') do (
    for %%A in ("backups\%%F") do (
        set SIZE=%%~zA
        set DATE=%%~tA
        echo │ %%F
    )
)

echo └─────────────────────────────────────────────────────────────┘
echo.

REM Show total size
for /f "tokens=3" %%A in ('dir /-c backups\*.db 2^>nul ^| find "File(s)"') do set TOTAL=%%A
echo 💾 Tổng dung lượng: %TOTAL% bytes
echo.

REM Show oldest and newest
for /f "tokens=*" %%F in ('dir /b /od backups\*.db 2^>nul ^| findstr /n "^" ^| findstr "^1:"') do (
    set OLDEST=%%F
    set OLDEST=!OLDEST:~2!
)

for /f "tokens=*" %%F in ('dir /b /o-d backups\*.db 2^>nul ^| findstr /n "^" ^| findstr "^1:"') do (
    set NEWEST=%%F
    set NEWEST=!NEWEST:~2!
)

echo 📅 Backup cũ nhất: %OLDEST%
echo 📅 Backup mới nhất: %NEWEST%
echo.

echo ========================================
echo 💡 GỢI Ý:
echo ========================================
echo.
echo ✅ Nên giữ: 7-14 bản backup gần nhất
echo ❌ Có thể xóa: Backup cũ hơn 1 tháng
echo 💾 Nên copy: Backup mới nhất ra USB hàng ngày
echo.

set /p ACTION="Bạn muốn mở thư mục backup? (Y/N): "
if /i "%ACTION%"=="Y" (
    explorer backups
)

echo.
pause
