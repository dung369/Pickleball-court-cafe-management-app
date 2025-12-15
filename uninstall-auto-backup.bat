@echo off
chcp 65001 >nul
echo ========================================
echo   ❌ GỠ BỎ LỊCH BACKUP TỰ ĐỘNG
echo ========================================
echo.

REM Check for admin rights
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Lỗi: Cần chạy với quyền Administrator!
    echo.
    echo 💡 Cách chạy:
    echo    Click phải vào file này → "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo ✅ Đã có quyền Administrator
echo.

REM Check if task exists
schtasks /query /tn "PickleballDrink_AutoBackup" >nul 2>&1
if %errorlevel% neq 0 (
    echo ℹ️ Không tìm thấy lịch backup tự động.
    echo.
    echo 💡 Lịch chưa được cài đặt hoặc đã bị xóa.
    echo.
    pause
    exit /b 0
)

echo 📋 Tìm thấy lịch: PickleballDrink_AutoBackup
echo.

set /p CONFIRM="⚠️ Bạn có chắc muốn GỠ BỎ lịch backup tự động? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo.
    echo ✅ Đã giữ lại lịch backup.
    pause
    exit /b 0
)

echo.
echo 🔄 Đang gỡ bỏ lịch...

schtasks /delete /tn "PickleballDrink_AutoBackup" /f

if %errorlevel% equ 0 (
    echo.
    echo ✅ Đã gỡ bỏ lịch backup tự động thành công!
    echo.
    echo ℹ️ Lưu ý:
    echo    • Các backup cũ vẫn được giữ nguyên trong thư mục backups\
    echo    • Bạn vẫn có thể backup thủ công bằng backup-data.bat
    echo    • Để cài lại lịch tự động, chạy setup-auto-backup.bat
    echo.
) else (
    echo.
    echo ❌ Lỗi: Không thể gỡ bỏ lịch!
    echo    Mã lỗi: %errorlevel%
    echo.
)

pause
