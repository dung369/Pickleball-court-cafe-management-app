@echo off
chcp 65001 >nul
title Migrate Database - Pickleball Drink Manager

echo.
echo ═══════════════════════════════════════════════════════════
echo    MIGRATE DỮ LIỆU CŨ - PICKLEBALL DRINK MANAGER
echo ═══════════════════════════════════════════════════════════
echo.

REM Kiểm tra file database cũ có tồn tại không
if not exist "%~dp0pickleball_drink.db" (
    echo ❌ KHÔNG TÌM THẤY FILE: pickleball_drink.db
    echo.
    echo    Vui lòng đảm bảo file pickleball_drink.db 
    echo    nằm cùng thư mục với file migrate-database.bat này
    echo.
    pause
    exit /b 1
)

REM Tạo thư mục userData nếu chưa có
set "USERDATA=%APPDATA%\pickleball-drink-manager"
if not exist "%USERDATA%" (
    echo ⚠️  Thư mục dữ liệu chưa tồn tại!
    echo.
    echo    Vui lòng:
    echo    1. Mở app Pickleball Drink Manager
    echo    2. Đăng nhập 1 lần
    echo    3. Tắt app
    echo    4. Chạy lại file này
    echo.
    pause
    exit /b 1
)

echo ✓ Tìm thấy file database cũ
echo ✓ Tìm thấy thư mục userData
echo.
echo 📂 Copy dữ liệu từ:
echo    %~dp0pickleball_drink.db
echo.
echo 📂 Đến:
echo    %USERDATA%\pickleball_drink.db
echo.

REM Backup file cũ nếu có
if exist "%USERDATA%\pickleball_drink.db" (
    echo 💾 Backup file cũ...
    copy /Y "%USERDATA%\pickleball_drink.db" "%USERDATA%\pickleball_drink.db.backup" >nul
    echo ✓ Đã backup: pickleball_drink.db.backup
    echo.
)

REM Copy file database
echo 📋 Đang copy dữ liệu...
copy /Y "%~dp0pickleball_drink.db" "%USERDATA%\pickleball_drink.db" >nul

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ═══════════════════════════════════════════════════════════
    echo    ✅ MIGRATE THÀNH CÔNG!
    echo ═══════════════════════════════════════════════════════════
    echo.
    echo    Bây giờ bạn có thể mở app và sử dụng dữ liệu cũ.
    echo    Tất cả đơn hàng, hóa đơn đã được khôi phục!
    echo.
) else (
    echo.
    echo ❌ LỖI: Không thể copy file!
    echo.
)

pause
