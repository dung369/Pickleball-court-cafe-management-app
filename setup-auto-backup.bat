@echo off
chcp 65001 >nul
echo ========================================
echo   ⏰ TẠO LÊN LỊCH BACKUP TỰ ĐỘNG
echo ========================================
echo.
echo 🚀 Script này sẽ tạo lịch chạy backup tự động
echo    mỗi ngày vào 23:00 (11 giờ đêm)
echo.
echo 📋 Yêu cầu: Chạy với quyền Administrator
echo.

REM Check for admin rights
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Lỗi: Cần chạy với quyền Administrator!
    echo.
    echo 💡 Cách chạy với quyền Administrator:
    echo    1. Click phải vào file setup-auto-backup.bat
    echo    2. Chọn "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo ✅ Đã có quyền Administrator
echo.

REM Get current directory
set CURRENT_DIR=%~dp0
set CURRENT_DIR=%CURRENT_DIR:~0,-1%

echo 📁 Thư mục hiện tại: %CURRENT_DIR%
echo 📄 Script backup: %CURRENT_DIR%\backup-data.bat
echo.

REM Check if backup-data.bat exists
if not exist "%CURRENT_DIR%\backup-data.bat" (
    echo ❌ Lỗi: Không tìm thấy backup-data.bat!
    echo.
    pause
    exit /b 1
)

echo ⏰ Thiết lập lịch backup:
echo    • Tên task: PickleballDrink_AutoBackup
echo    • Thời gian: Mỗi ngày lúc 23:00
echo    • Chạy ngầm: Không hiện cửa sổ
echo.

set /p CONFIRM="📌 Tiếp tục tạo lịch tự động? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo.
    echo ❌ Đã hủy.
    pause
    exit /b 0
)

echo.
echo ⚙️ Đang tạo lịch...

REM Delete existing task if exists
schtasks /delete /tn "PickleballDrink_AutoBackup" /f >nul 2>&1

REM Create new scheduled task
schtasks /create /tn "PickleballDrink_AutoBackup" /tr "\"%CURRENT_DIR%\backup-data.bat\"" /sc daily /st 23:00 /rl highest /f

if %errorlevel% equ 0 (
    echo.
    echo ✅ Đã tạo lịch backup tự động thành công!
    echo.
    echo 📋 Thông tin:
    echo    • Lịch sẽ chạy mỗi ngày lúc 23:00
    echo    • Backup sẽ được lưu vào thư mục: backups\
    echo    • Tên file: pickleball_drink_backup_YYYYMMDD_HHMMSS.db
    echo.
    echo 💡 Lưu ý:
    echo    • Máy tính phải BẬT vào lúc 23:00
    echo    • Nếu tắt máy, lịch sẽ chạy khi khởi động lại
    echo    • Nên kiểm tra thư mục backups\ định kỳ
    echo.
    echo 🔧 Quản lý lịch:
    echo    • Xem lịch: Task Scheduler ^(tìm trong Start Menu^)
    echo    • Xóa lịch: chạy uninstall-auto-backup.bat
    echo.
    
    REM Test backup immediately
    set /p TEST="🧪 Bạn muốn chạy thử backup ngay bây giờ? (Y/N): "
    if /i "!TEST!"=="Y" (
        echo.
        echo 🔄 Đang chạy backup...
        call "%CURRENT_DIR%\backup-data.bat"
    )
) else (
    echo.
    echo ❌ Lỗi: Không thể tạo lịch tự động!
    echo    Mã lỗi: %errorlevel%
    echo.
)

echo.
pause
