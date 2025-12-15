@echo off
chcp 65001 >nul
echo ========================================
echo   🔄 KHÔI PHỤC DỮ LIỆU PICKLEBALL DRINK
echo ========================================
echo.

REM Check if backups folder exists
if not exist "backups" (
    echo ❌ Không tìm thấy thư mục backup!
    echo.
    echo Chưa có backup nào. Vui lòng:
    echo 1. Chạy backup-data.bat để tạo backup
    echo 2. Hoặc copy file backup vào thư mục backups\
    echo.
    pause
    exit /b 1
)

REM List available backups
echo 📁 Danh sách backup có sẵn:
echo ========================================
echo.
dir /b /o-d backups\*.db
echo.

REM Ask user to choose backup file
echo ========================================
set /p BACKUP_FILE="📝 Nhập TÊN FILE backup muốn khôi phục: "

REM Validate backup file
if not exist "backups\%BACKUP_FILE%" (
    echo.
    echo ❌ Không tìm thấy file: backups\%BACKUP_FILE%
    echo.
    echo Vui lòng kiểm tra lại tên file!
    pause
    exit /b 1
)

REM Warning
echo.
echo ========================================
echo   ⚠️  CẢNH BÁO QUAN TRỌNG!
echo ========================================
echo.
echo Hành động này sẽ:
echo 1. ❌ XÓA toàn bộ dữ liệu hiện tại
echo 2. ✅ THAY THẾ bằng dữ liệu từ backup
echo.
echo ⚠️  Không thể hoàn tác!
echo.
set /p CONFIRM="Bạn có CHẮC CHẮN muốn tiếp tục? (Y/N): "

if /i not "%CONFIRM%"=="Y" (
    echo.
    echo ✋ Đã hủy khôi phục.
    pause
    exit /b 0
)

REM Check if app is running
tasklist /FI "IMAGENAME eq pickleball-drink-manager.exe" 2>NUL | find /I /N "pickleball-drink-manager.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo.
    echo ⚠️  Phát hiện app đang chạy!
    echo ❌ Vui lòng TẮT app trước khi restore!
    echo.
    pause
    exit /b 1
)

REM Backup current database before restore
echo.
echo [1/4] 💾 Backup dữ liệu hiện tại (an toàn)...
if exist "pickleball_drink.db" (
    for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
    set SAFETY_BACKUP=backups\before_restore_%datetime:~0,14%.db
    copy "pickleball_drink.db" "%SAFETY_BACKUP%" >nul
    echo ✅ Đã backup: %SAFETY_BACKUP%
)

REM Restore backup
echo [2/4] 🔄 Đang khôi phục dữ liệu...
copy "backups\%BACKUP_FILE%" "pickleball_drink.db" /Y >nul

if %errorlevel% equ 0 (
    echo [3/4] ✅ Khôi phục thành công!
    echo [4/4] ✅ Hoàn tất!
    echo.
    echo ========================================
    echo   🎉 KHÔI PHỤC HOÀN TẤT!
    echo ========================================
    echo.
    echo ✅ Dữ liệu đã được khôi phục từ:
    echo    %BACKUP_FILE%
    echo.
    echo 📌 Bây giờ bạn có thể:
    echo    1. Khởi động app
    echo    2. Kiểm tra dữ liệu
    echo.
    echo 💡 Lưu ý: Backup cũ vẫn được giữ trong backups\
) else (
    echo ❌ [LỖI] Khôi phục thất bại!
    echo.
    echo Vui lòng thử lại hoặc restore thủ công:
    echo 1. Copy file: backups\%BACKUP_FILE%
    echo 2. Paste vào thư mục app
    echo 3. Đổi tên thành: pickleball_drink.db
)

echo.
echo ========================================
pause
