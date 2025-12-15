# 🥤 Pickleball Drink Manager

## Phần mềm quản lý quán cafe/đồ uống cho Windows Desktop

Phần mềm POS (Point of Sale) chuyên nghiệp, dễ sử dụng, hoạt động OFFLINE 100% - không cần internet.

---

## ✨ Tính năng chính

### 🪑 Quản lý bàn thông minh
- **Quản lý không giới hạn số bàn** - Thêm/xóa bàn tùy ý
- **Gộp bàn linh hoạt** - Gộp nhiều bàn thành 1 (VD: Bàn 1+3+5+7)
- **Tách bàn tự động** - Tách bàn ghép về các bàn riêng lẻ, món chia đều
- **Chuyển bàn nhanh** - Di chuyển order sang bàn khác 1 cú click
- **Trạng thái màu sắc** - Trống (xanh), Đang phục vụ (vàng), Chưa thanh toán (đỏ)

### 📋 Quản lý Menu
- Thêm, sửa, xóa món dễ dàng
- Phân loại theo danh mục
- Tìm kiếm & lọc thông minh
- Đánh dấu món phổ biến
- Sẵn 22 món mẫu (cafe, nước ép, sinh tố, sữa chua...)

### 🛒 Đặt món & Order
- Giao diện đặt món trực quan, nhanh chóng
- Tăng/giảm số lượng bằng nút +/-
- Ghi chú đặc biệt cho từng món
- Hiển thị tổng tiền real-time
- Cập nhật order bất cứ lúc nào

### 💰 Thanh toán đa dạng
- **3 phương thức**: Tiền mặt / Chuyển khoản / QR Code
- Giảm giá linh hoạt theo số tiền
- In hóa đơn tự động
- Lưu lịch sử giao dịch vĩnh viễn

### 📊 Báo cáo & Thống kê
- Doanh thu theo khoảng thời gian tùy chọn
- Top 10 món bán chạy nhất
- **Thống kê theo phương thức thanh toán**
- Lọc hóa đơn theo ngày
- Xem chi tiết từng hóa đơn
- Xóa hóa đơn sai (có xác nhận)

---

## 🚀 Cài đặt trên máy khách

### ✅ YÊU CẦU HỆ THỐNG
- **Hệ điều hành**: Windows 7/8/10/11 (64-bit)
- **RAM**: Tối thiểu 2GB
- **Ổ cứng**: 200MB trống
- **Không cần Internet** sau khi cài đặt

### 📥 HƯỚNG DẪN CÀI ĐẶT CHO MÁY KHÁCH

#### Phương án 1: Sử dụng file cài đặt .exe (Dễ nhất - Khuyên dùng)

**📚 Hướng dẫn chi tiết → [BUILD_GUIDE.md](BUILD_GUIDE.md)**

**Cách nhanh nhất:**

1. **Build file cài đặt** (trên máy dev):
   ```powershell
   npm run build
   ```
   Hoặc double-click: **`build.bat`** (tự động build + kiểm tra)
   
   File `.exe` sẽ được tạo trong thư mục `dist/` (≈80-150MB)

2. **Copy file .exe sang máy khách**
   - USB: Copy → cắm USB → paste
   - Cloud: Upload Google Drive/Dropbox → chia sẻ link
   - LAN: Share thư mục qua mạng nội bộ

3. **Cài đặt trên máy khách**
   - Double-click file `.exe`
   - Nếu Windows cảnh báo: Click "More info" → "Run anyway"
   - Click "Install"
   - Chọn thư mục cài đặt (mặc định OK)
   - Đợi 10-30 giây → Done!

4. **Thêm dữ liệu menu ban đầu** (chọn 1):
   - **Cách 1:** Cài Node.js → chạy `node seed-menu.js` trong thư mục app
   - **Cách 2:** Copy file `pickleball_drink.db` có sẵn từ máy dev
   - **Cách 3:** Thêm menu thủ công trong app

5. **✅ XONG!** - App chạy độc lập, không cần Node.js

#### Phương án 2: Copy toàn bộ code (Cho máy không cài được .exe)

**Bước 1: Chuẩn bị trên máy khách**

1. **Cài đặt Node.js**:
   - Tải Node.js LTS từ: https://nodejs.org/
   - Chạy file cài đặt, chọn tất cả tùy chọn mặc định
   - Khởi động lại máy tính

2. **Kiểm tra cài đặt**:
   ```powershell
   node --version
   npm --version
   ```
   Phải hiện số version (VD: v22.16.0)

**Bước 2: Copy code**

1. Copy toàn bộ thư mục `Pickleball Drink Manager` sang máy khách
2. Đặt ở vị trí dễ tìm (VD: `C:\POS\`)

**Bước 3: Cài đặt dependencies**

Mở PowerShell/Command Prompt tại thư mục code:

```powershell
cd "C:\POS\Pickleball Drink Manager"
npm install
```

Đợi 2-5 phút để tải về các thư viện cần thiết.

**Bước 4: Thêm dữ liệu menu mẫu** (chỉ chạy 1 lần)

```powershell
node seed-menu.js
```

Sẽ tạo 22 món mẫu: Cà phê, Nước ép, Sinh tố, Sữa chua...

**Bước 5: Chạy ứng dụng**

```powershell
npm start
```

Hoặc double-click file **`start-app.bat`**

### 🎯 CÀI ĐẶT NHANH (Dùng file .bat)

**Đơn giản nhất:**

1. Double-click `install.bat` - Tự động cài đặt
2. Double-click `start-app.bat` - Chạy app

---

## 💾 Quản lý Database & Backup

### 📍 Vị trí file database
```
pickleball_drink.db
```
File này chứa **TẤT CẢ** dữ liệu: Menu, Order, Hóa đơn, Bàn...

### ⚠️ BACKUP ĐỊNH KỲ (CỰC KỲ QUAN TRỌNG!)

#### 🎯 Cách 1: Backup THỦ CÔNG

**Double-click file:** `backup-data.bat`

✅ Tự động:
- Tạo thư mục `backups\` (nếu chưa có)
- Copy database với tên có timestamp: `pickleball_drink_backup_20241211_143052.db`
- Hiển thị dung lượng file & tổng số backup
- Không ghi đè backup cũ

💡 **Khuyến nghị**: Backup CUỐI MỖI NGÀY trước khi đóng cửa

#### ⚡ Cách 2: Backup TỰ ĐỘNG theo lịch

**Bước 1: Cài đặt lịch backup** (chỉ 1 lần)

1. Click phải vào `setup-auto-backup.bat`
2. Chọn **"Run as administrator"**
3. Chọn `Y` để xác nhận

✅ Lịch sẽ tự động chạy backup **MỖI NGÀY LÚC 23:00** (11 giờ đêm)

**Bước 2: Kiểm tra backup định kỳ**

Double-click `list-backups.bat` để xem:
- Danh sách tất cả backup
- Dung lượng từng file
- Backup cũ nhất & mới nhất
- Tổng dung lượng

**Gỡ bỏ lịch tự động** (nếu cần):
- Click phải `uninstall-auto-backup.bat`
- Chọn "Run as administrator"

#### 🔄 Khôi phục dữ liệu

**Khi nào cần restore:**
- Dữ liệu bị hỏng/mất
- Muốn quay về trạng thái trước đó
- Cài đặt lại app trên máy mới

**Cách restore:**

1. Double-click `restore-data.bat`
2. Chọn số thứ tự của backup muốn restore
3. Xác nhận `Y`

✅ Script tự động:
- Backup file hiện tại trước khi restore (an toàn 100%)
- Copy backup đã chọn thành database chính
- Kiểm tra app có đang chạy không

#### 📋 Chiến lược Backup thông minh

**Hàng ngày:**
- ✅ Backup tự động lúc 23:00 (hoặc thủ công)
- ✅ Giữ 7 backup gần nhất

**Hàng tuần:**
- ✅ Copy backup Chủ Nhật ra USB/Google Drive
- ✅ Đặt tên: `backup_tuan_W50_2024.db`

**Hàng tháng:**
- ✅ Copy backup ngày cuối tháng ra ổ cứng ngoài
- ✅ Lưu trữ dài hạn tối thiểu 6 tháng

**Trước khi:**
- ⚠️ Cập nhật phần mềm
- ⚠️ Thay đổi menu lớn
- ⚠️ Sửa giá bán

➡️ **Luôn backup trước!**

**Khuyến nghị**: Backup **HÀNG NGÀY** sau khi đóng cửa quán!

### Khôi phục dữ liệu
1. Tắt ứng dụng
2. Xóa file `pickleball_drink.db` cũ
3. Copy file backup về và đổi tên thành `pickleball_drink.db`
4. Khởi động lại app

---

## 📱 Hướng dẫn sử dụng nhanh

### 🪑 Quản lý bàn

**Mở bàn:**
- Click vào bàn trống (màu xanh)
- Chọn món từ menu
- Điều chỉnh số lượng
- Bàn chuyển sang "Đang phục vụ" (màu vàng)

**Chuyển bàn:**
- Mở bàn nguồn → Click "Chuyển bàn"
- Chọn bàn đích (chỉ bàn trống)
- Món tự động chuyển sang

**Gộp bàn:**
- Vào bàn 1 → Click "Gộp bàn" → Chọn bàn 3
- Bàn 1 và 3 biến mất → Xuất hiện bàn "1 + 3"
- Tiếp tục gộp: Vào "1 + 3" → Gộp bàn 5 → Thành "1 + 3 + 5"

**Tách bàn:**
- Vào bàn ghép (VD: "1 + 3 + 5")
- Click "Tách bàn" → Xác nhận
- 3 bàn xuất hiện lại, món chia đều

**Thêm/Xóa bàn:**
- Click "➕ Thêm bàn mới" (góc phải)
- Click "🗑️ Xóa bàn" → Chọn bàn trống muốn xóa

### 📋 Quản lý Menu

**Thêm món:**
1. Tab "Menu" → Click "Thêm món mới"
2. Nhập: Tên món, Giá, Danh mục, Mô tả
3. Click "Lưu"

**Sửa món:**
- Click nút "Sửa" trên món cần chỉnh
- Cập nhật thông tin → Lưu

**Xóa món:**
- Click "Xóa" → Xác nhận

### 💰 Thanh toán

1. Sau khi khách order xong → Click "Thanh toán"
2. Chọn phương thức: Tiền mặt / Chuyển khoản / QR
3. Nhập giảm giá (nếu có)
4. Nhập tên thu ngân
5. Click "Xác nhận thanh toán"
6. Hóa đơn tự động lưu vào "Hóa đơn"

### 📊 Báo cáo

1. Tab "Báo cáo"
2. Chọn thời gian (từ ngày → đến ngày)
3. Click "Tạo báo cáo"
4. Xem: Tổng doanh thu, Top món, Thống kê thanh toán

---

## 🛠️ Bảo trì & Vận hành lâu dài

### ✅ Phần mềm KHÔNG CẦN bảo trì thường xuyên vì:

1. **SQLite database** - Nhẹ, ổn định, không cần server
2. **Offline 100%** - Không phụ thuộc internet
3. **Không có API bên thứ 3** - Không lo service ngừng hoạt động
4. **Code đơn giản** - Ít bug, dễ sửa

### ⚠️ CẦN LƯU Ý:

1. **BACKUP database HÀNG NGÀY** - Đây là việc DUY NHẤT cần làm!
2. Nếu Windows Update, khởi động lại máy
3. Nếu cài phần mềm mới, test lại app xem có conflict không
4. Cứ 6 tháng nên backup code + database ra USB dự phòng

### 🔄 Cập nhật phần mềm (nếu có version mới)

1. Backup database cũ
2. Cài version mới (theo hướng dẫn cài đặt)
3. Copy file database cũ vào thư mục mới
4. Test thử trước khi dùng chính thức

### 🐛 Xử lý sự cố

**App không chạy:**
1. Kiểm tra Node.js còn không: `node --version`
2. Chạy lại: `npm install`
3. Khởi động lại máy

**Mất dữ liệu:**
1. Restore file backup `pickleball_drink.db`

**App chạy chậm:**
1. Đóng các phần mềm khác
2. Restart app
3. Restart máy tính

**Database bị lỗi:**
1. Tắt app
2. Xóa file `pickleball_drink.db`
3. Restore từ backup gần nhất

---

## 🎓 Đào tạo nhân viên

### Người dùng cơ bản (Nhân viên phục vụ)
- **5 phút** học: Mở bàn, gọi món, thanh toán
- Không cần đào tạo menu (giao diện trực quan)

### Người quản lý (Quản lý quán)
- **15 phút** học: Thêm món, xem báo cáo, backup
- In hướng dẫn ra giấy dán tại quầy

---

## 📦 Thông tin kỹ thuật

### Công nghệ sử dụng
- **Electron** - Framework desktop
- **SQLite (sql.js)** - Database nhẹ
- **HTML/CSS/JavaScript** - Giao diện

### Cấu trúc file
```
Pickleball Drink Manager/
├── main.js                    - Electron main process
├── preload.js                 - IPC bridge
├── index.html                 - Giao diện chính
├── app.js                     - Logic frontend
├── database.js                - Xử lý database
├── styles.css                 - CSS
├── seed-menu.js               - Tạo dữ liệu mẫu
├── package.json               - Dependencies
├── pickleball_drink.db        - Database (tự tạo)
│
├── 🚀 Scripts khởi động
│   ├── install.bat            - Cài đặt dependencies
│   └── start-app.bat          - Chạy ứng dụng
│
├── 💾 Scripts backup/restore
│   ├── backup-data.bat        - Backup thủ công
│   ├── restore-data.bat       - Khôi phục từ backup
│   ├── list-backups.bat       - Xem danh sách backup
│   ├── setup-auto-backup.bat  - Cài lịch backup tự động (23:00)
│   └── uninstall-auto-backup.bat - Gỡ lịch tự động
│
└── 📁 backups/                - Thư mục chứa backup (tự tạo)
```

### Dependencies chính
- `electron`: ^28.1.0
- `sql.js`: ^1.10.3

---

## 📞 Hỗ trợ & Liên hệ

**Lỗi kỹ thuật?**
- Kiểm tra phần "Xử lý sự cố" ở trên
- Restart app và thử lại

**Cần tính năng mới?**
- Ghi chú lại và liên hệ developer

**Mất dữ liệu?**
- Restore từ file backup

---

## 📄 License & Copyright

**Version**: 1.0.0  
**Ngày phát hành**: Tháng 12/2025  
**Platform**: Windows Desktop

**LƯU Ý**: 
- Phần mềm KHÔNG GỬI dữ liệu ra internet
- Tất cả dữ liệu lưu LOCAL trên máy
- BACKUP thường xuyên để tránh mất dữ liệu!

---

## ⭐ Tóm tắt nhanh

### Cài lần đầu:
1. Tải Node.js: https://nodejs.org/
2. Double-click: `install.bat`
3. Double-click: `start-app.bat`

### Sử dụng hàng ngày:
1. Double-click: `start-app.bat`
2. Làm việc bình thường
3. Đóng app khi xong

### Backup hàng ngày (chọn 1 trong 2):

**Cách 1 - Thủ công:**
1. Double-click: `backup-data.bat`
2. File backup tự động lưu vào `backups\`

**Cách 2 - Tự động:**
1. Click phải `setup-auto-backup.bat` → "Run as administrator"
2. Backup tự chạy mỗi đêm 23:00

### Khôi phục khi cần:
1. Double-click: `restore-data.bat`
2. Chọn số thứ tự backup muốn khôi phục
3. Xác nhận → Xong!

**🎉 VẬY LÀ XONG! Dễ dàng và ổn định lâu dài!**
