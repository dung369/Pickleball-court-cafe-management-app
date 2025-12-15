@echo off
chcp 65001 >nul
echo ========================================
echo   📦 BACKUP DỮ LIỆU PICKLEBALL DRINK
echo ========================================
echo.

REM Get current date and time
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set BACKUP_DATE=%datetime:~0,8%
set BACKUP_TIME=%datetime:~8,6%

REM Create backup folder if not exists
if not exist "backups" mkdir backups

REM Set backup filename with date and time
set BACKUP_FILE=backups\pickleball_drink_backup_%BACKUP_DATE%_%BACKUP_TIME%.db

REM Check if database exists
if not exist "pickleball_drink.db" (
    echo ❌ [LỖI] Không tìm thấy file database!
    echo.
    echo File cần backup: pickleball_drink.db
    echo Vui lòng chạy app 1 lần để tạo database.
    echo.
    pause
    exit /b 1
)

REM Get file size
for %%A in ("pickleball_drink.db") do set FILESIZE=%%~zA

REM Create backup
echo [1/3] 🔄 Đang sao chép database...
copy "pickleball_drink.db" "%BACKUP_FILE%" >nul

if %errorlevel% equ 0 (
    echo [2/3] ✅ Backup thành công!
    echo [3/3] 📊 Thông tin backup:
    echo.
    echo ┌──────────────────────────────────────┐
    echo │ File gốc:    pickleball_drink.db    │
    echo │ Dung lượng:  %FILESIZE% bytes         │
    echo │ Ngày backup: %BACKUP_DATE:~0,4%-%BACKUP_DATE:~4,2%-%BACKUP_DATE:~6,2%            │
    echo │ Giờ backup:  %BACKUP_TIME:~0,2%:%BACKUP_TIME:~2,2%:%BACKUP_TIME:~4,2%              │
    echo └──────────────────────────────────────┘
    echo.
    echo 💾 File backup: %BACKUP_FILE%
    echo.
    echo ========================================
    echo ⚠️  QUAN TRỌNG:
    echo ========================================
    echo.
    echo 1. Copy file backup vào USB ngay!
    echo 2. Hoặc upload lên Google Drive/Dropbox
    echo 3. Giữ ít nhất 7 bản backup gần nhất
    echo.
    echo 📁 Tất cả backup được lưu trong thư mục: backups\
    echo.
    dir backups\*.db | find "File(s)"
    echo.
    echo ✅ Backup hoàn tất!
) else (
    echo ❌ [LỖI] Backup thất bại!
    echo.
    echo Vui lòng:
    echo 1. Tắt app trước khi backup
    echo 2. Kiểm tra quyền ghi file
    echo 3. Thử lại
)

echo.
echo ========================================
pause
