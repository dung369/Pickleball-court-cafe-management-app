@echo off
chcp 65001 >nul
echo ========================================
echo   📦 BUILD FILE CÀI ĐẶT .EXE
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo ⚠️ Chưa cài đặt dependencies!
    echo.
    set /p INSTALL="📥 Cài đặt dependencies ngay bây giờ? (Y/N): "
    if /i "!INSTALL!"=="Y" (
        echo.
        echo 🔄 Đang cài đặt...
        call npm install
        if errorlevel 1 (
            echo.
            echo ❌ Lỗi khi cài đặt dependencies!
            pause
            exit /b 1
        )
    ) else (
        echo.
        echo ❌ Không thể build mà không có dependencies!
        echo    Chạy: npm install
        pause
        exit /b 1
    )
)

echo ✅ Dependencies đã sẵn sàng
echo.

REM Check if database exists
if not exist "pickleball_drink.db" (
    echo ⚠️ Chưa có database!
    echo.
    set /p CREATE_DB="📊 Tạo database với 22 món mẫu? (Y/N): "
    if /i "!CREATE_DB!"=="Y" (
        echo.
        echo 🔄 Đang tạo database...
        call node seed-menu.js
        echo ✅ Đã tạo database với menu mẫu
    )
    echo.
)

REM Clean old build
if exist "dist" (
    echo 🗑️ Xóa bản build cũ...
    rd /s /q dist
    echo ✅ Đã xóa
    echo.
)

echo ========================================
echo   🚀 BẮT ĐẦU BUILD
echo ========================================
echo.
echo ⏱️ Quá trình này mất 3-10 phút
echo 💡 Vui lòng đợi...
echo.

REM Run build
call npm run build

if errorlevel 1 (
    echo.
    echo ========================================
    echo   ❌ BUILD THẤT BẠI
    echo ========================================
    echo.
    echo 🔍 Kiểm tra lỗi ở trên
    echo.
    echo 💡 Các lỗi thường gặp:
    echo    1. electron-builder chưa được cài
    echo       → Chạy: npm install --save-dev electron-builder
    echo.
    echo    2. Thiếu file cấu hình
    echo       → Kiểm tra package.json
    echo.
    echo    3. Lỗi mạng khi tải Electron
    echo       → Kiểm tra kết nối internet
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ✅ BUILD THÀNH CÔNG!
echo ========================================
echo.

REM Show build results
if exist "dist\Pickleball Drink Manager Setup 1.0.0.exe" (
    echo 📦 File cài đặt:
    echo    dist\Pickleball Drink Manager Setup 1.0.0.exe
    echo.
    
    REM Get file size
    for %%A in ("dist\Pickleball Drink Manager Setup 1.0.0.exe") do (
        set SIZE=%%~zA
        set /a SIZE_MB=!SIZE! / 1048576
        echo 💾 Dung lượng: !SIZE_MB! MB
    )
    echo.
) else (
    echo ⚠️ Không tìm thấy file .exe
    echo.
)

if exist "dist\win-unpacked\Pickleball Drink Manager.exe" (
    echo 📂 Bản portable (không cần cài):
    echo    dist\win-unpacked\Pickleball Drink Manager.exe
    echo.
)

echo ========================================
echo   📋 BƯỚC TIẾP THEO
echo ========================================
echo.
echo 1️⃣ Kiểm tra file trong thư mục "dist\"
echo 2️⃣ Test cài đặt trên máy này (optional)
echo 3️⃣ Copy file .exe sang USB/Cloud
echo 4️⃣ Cài đặt trên máy khách
echo.
echo 💡 Xem hướng dẫn chi tiết: BUILD_GUIDE.md
echo.

set /p OPEN_FOLDER="📁 Mở thư mục dist? (Y/N): "
if /i "%OPEN_FOLDER%"=="Y" (
    explorer dist
)

echo.
set /p TEST_INSTALL="🧪 Test cài đặt trên máy này? (Y/N): "
if /i "%TEST_INSTALL%"=="Y" (
    echo.
    echo 🚀 Đang chạy installer...
    start "" "dist\Pickleball Drink Manager Setup 1.0.0.exe"
)

echo.
pause
