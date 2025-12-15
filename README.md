# 🏓 Pickleball Drink Manager

Ứng dụng quản lý quán cafe chuyên nghiệp cho Windows, được xây dựng bằng Electron và SQLite.

## 📋 Tổng quan

**Pickleball Drink Manager** là hệ thống Point of Sale (POS) desktop hoàn chỉnh được thiết kế đặc biệt cho quán cafe Pickleball Drink. Ứng dụng cung cấp đầy đủ các tính năng quản lý bàn, đặt món, thanh toán, in hóa đơn và báo cáo doanh thu.

### ✨ Điểm nổi bật
- ✅ Giao diện thân thiện, dễ sử dụng
- ✅ Hoạt động offline hoàn toàn (không cần internet)
- ✅ Dữ liệu lưu trữ cục bộ an toàn với SQLite
- ✅ Hệ thống phân quyền Admin/Nhân viên
- ✅ In hóa đơn tự động với preview
- ✅ Quản lý bàn linh hoạt (gộp/tách/chuyển bàn)
- ✅ Báo cáo doanh thu theo thời gian
- ✅ Backup/restore dữ liệu đơn giản

---

## 🛠️ Công nghệ sử dụng

### Frontend
| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| **HTML5** | - | Cấu trúc giao diện |
| **CSS3** | - | Styling và responsive design |
| **JavaScript (ES6+)** | - | Logic xử lý phía client |

### Backend
| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| **Node.js** | v22.16.0 | JavaScript runtime |
| **Electron** | 28.1.0 | Desktop application framework |
| **sql.js** | 1.10.3 | SQLite database (WASM) |

### Build Tools
- **electron-builder** 24.9.1 - Đóng gói ứng dụng thành file .exe
- **npm** - Package manager

---

## 📁 Cấu trúc dự án

```
pickleball-drink-manager/
│
├── main.js                      # Electron main process (backend)
├── preload.js                   # Bridge giữa main và renderer
├── index.html                   # Giao diện chính (frontend)
├── app.js                       # Logic frontend
├── styles.css                   # Stylesheet
├── database.js                  # SQLite database manager (backend)
│
├── assets/                      # Tài nguyên tĩnh
│   └── icon.png                # Icon ứng dụng
│
├── backups/                     # Thư mục backup database
│
├── dist/                        # Build output
│   └── Pickleball Drink Manager Setup 1.0.0.exe
│
├── backup-data.bat             # Script backup database
├── restore-data.bat            # Script restore database
├── list-backups.bat            # Liệt kê các backup
├── setup-auto-backup.bat       # Cài đặt backup tự động
├── migrate-database.bat        # Migrate dữ liệu khi update
│
├── HUONG_DAN_CAI_DAT.txt      # Hướng dẫn cài đặt
├── BACKUP_HUONG_DAN.txt       # Hướng dẫn backup
├── BUILD_GUIDE.txt            # Hướng dẫn build
│
├── package.json               # Dependencies và scripts
└── README.md                  # File này
```

### Chi tiết các module chính

#### 🔹 main.js (Backend - Electron Main Process)
- Quản lý cửa sổ ứng dụng
- Xử lý IPC (Inter-Process Communication)
- Kết nối frontend với database
- Xử lý các API requests từ renderer process

#### 🔹 database.js (Backend - Database Layer)
- Quản lý SQLite database
- CRUD operations cho tất cả entities
- 8 tables: categories, menu_items, tables, orders, order_items, bills, bill_items, users
- Xử lý transactions và data persistence

#### 🔹 app.js (Frontend - Business Logic)
- Xử lý UI interactions
- Gọi API thông qua IPC
- Quản lý state (currentUser, currentTable, currentOrder)
- Render dữ liệu động

#### 🔹 preload.js (Bridge)
- Context isolation bridge
- Expose safe APIs từ main process cho renderer
- Security layer giữa frontend và backend

---

## 🎯 Tính năng chính

### 1. Quản lý bàn
- ✅ Hiển thị trạng thái bàn real-time (Trống/Đang dùng/Đã gộp)
- ✅ Gộp bàn: Kết hợp nhiều bàn thành 1 (VD: Bàn 1+3+5)
- ✅ Tách bàn: Tách các bàn đã gộp thành bàn riêng lẻ
- ✅ Chuyển bàn: Di chuyển order sang bàn khác
- ✅ Thêm/xóa bàn động

### 2. Menu & Đặt món
- ✅ 22 món đồ uống mặc định
- ✅ Phân loại theo danh mục
- ✅ Thêm món vào order với số lượng tùy chỉnh
- ✅ Ghi chú cho từng món
- ✅ Tính tổng tiền tự động

### 3. Thanh toán
- ✅ 3 phương thức: Tiền mặt / Chuyển khoản / QR Banking
- ✅ Áp dụng giảm giá
- ✅ In hóa đơn tự động với preview
- ✅ Lưu lịch sử hóa đơn với timestamp chính xác (múi giờ VN)

### 4. Hệ thống phân quyền
- 👨‍💼 **Admin**
  - Username: `admin` / Password: `159357`
  - Toàn quyền: Xem, thêm, sửa, xóa tất cả
  - Xóa hóa đơn
  
- 👤 **Nhân viên**
  - Username: `nhanvien` / Password: `123456`
  - Chỉ xem và tạo orders/bills
  - Không được xóa hóa đơn

### 5. Báo cáo & Thống kê
- ✅ Lịch sử hóa đơn với bộ lọc thời gian
- ✅ Doanh thu theo ngày/tuần/tháng
- ✅ Chi tiết từng hóa đơn
- ✅ Thống kê món bán chạy

### 6. Backup & Restore
- ✅ Backup thủ công bằng 1 click
- ✅ Backup tự động theo lịch (Task Scheduler)
- ✅ Restore dữ liệu từ backup cũ
- ✅ Liệt kê tất cả backup points

---

## 🚀 Hướng dẫn cài đặt

### Yêu cầu hệ thống
- **OS:** Windows 10/11 (64-bit)
- **RAM:** 2GB trở lên
- **Disk:** 200MB trống

### Cài đặt cho người dùng cuối
1. Download file `Pickleball Drink Manager Setup 1.0.0.exe`
2. Double-click để cài đặt
3. Follow hướng dẫn trên màn hình
4. Mở ứng dụng và đăng nhập

### Cài đặt cho Developer

#### Bước 1: Clone project
```bash
git clone <repository-url>
cd "New folder (12)"
```

#### Bước 2: Cài dependencies
```bash
npm install
```

#### Bước 3: Chạy development mode
```bash
npm start
```

Ứng dụng sẽ mở ở cổng Electron với hot-reload.

---

## 🏗️ Build Production

### Build Windows Installer
```bash
npm run build
```

Output: `dist/Pickleball Drink Manager Setup 1.0.0.exe` (80+ MB)

### Build configuration
File `package.json` chứa config cho electron-builder:
```json
{
  "build": {
    "appId": "com.pickleballdrink.manager",
    "productName": "Pickleball Drink Manager",
    "win": {
      "target": ["nsis"],
      "icon": "assets/icon.png"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true
    }
  }
}
```

---

## 💾 Database Schema

### Tables
1. **categories** - Danh mục món
2. **menu_items** - Món ăn/uống
3. **tables** - Bàn (hỗ trợ merge/split)
4. **orders** - Đơn hàng
5. **order_items** - Chi tiết đơn hàng
6. **bills** - Hóa đơn thanh toán
7. **bill_items** - Chi tiết hóa đơn
8. **users** - Tài khoản người dùng

### Vị trí database
- **Development:** `d:\New folder (12)\pickleball_drink.db`
- **Production:** `%APPDATA%\pickleball-drink-manager\pickleball_drink.db`

### Migrate dữ liệu
Nếu đã có dữ liệu cũ, sử dụng `migrate-database.bat` để chuyển sang version mới.

---

## 📝 NPM Scripts

| Command | Mô tả |
|---------|-------|
| `npm start` | Chạy app ở development mode |
| `npm run build` | Build Windows installer (.exe) |

---

## 🔒 Bảo mật

- ✅ Context Isolation enabled
- ✅ Node Integration disabled trong renderer
- ✅ Preload script làm bridge an toàn
- ✅ Mật khẩu lưu plain text (cân nhắc hash trong tương lai)
- ✅ Database local, không sync cloud

---

## 🐛 Known Issues & Limitations

1. **Timezone:** App sử dụng giờ máy tính local, đảm bảo máy đã set múi giờ Việt Nam
2. **Single instance:** Chưa hỗ trợ multi-user concurrent access
3. **Network:** Hoạt động offline, không có sync giữa nhiều máy
4. **Print:** Chỉ hỗ trợ print qua browser print dialog

---

## 🔄 Phiên bản

### v1.0.0 (Current)
- ✅ Full POS features
- ✅ Authentication system
- ✅ Merge/split tables
- ✅ Print bills
- ✅ Reports
- ✅ Backup/restore
- ✅ Vietnam timezone support
- ✅ Production-ready database persistence

---

## 📞 Hỗ trợ

Để được hỗ trợ, vui lòng tham khảo:
- `HUONG_DAN_CAI_DAT.txt` - Hướng dẫn cài đặt chi tiết
- `BACKUP_HUONG_DAN.txt` - Hướng dẫn backup
- `BUILD_GUIDE.txt` - Hướng dẫn build từ source

---

## 📄 License

Proprietary - Dự án được phát triển cho Pickleball Drink Cafe.

---

## 👨‍💻 Development Info

### Architecture
```
┌─────────────────────────────────────────┐
│         Renderer Process (Frontend)      │
│    ┌─────────────────────────────┐      │
│    │  index.html + app.js + CSS  │      │
│    └──────────────┬──────────────┘      │
│                   │ IPC calls            │
│    ┌──────────────▼──────────────┐      │
│    │      preload.js (Bridge)    │      │
│    └──────────────┬──────────────┘      │
└───────────────────┼───────────────────────┘
                    │ Context Bridge
┌───────────────────▼───────────────────────┐
│          Main Process (Backend)           │
│    ┌──────────────────────────────┐      │
│    │  main.js (IPC Handlers)      │      │
│    └──────────────┬───────────────┘      │
│                   │                       │
│    ┌──────────────▼───────────────┐      │
│    │  database.js (SQLite)        │      │
│    └──────────────┬───────────────┘      │
│                   │                       │
│    ┌──────────────▼───────────────┐      │
│    │  pickleball_drink.db         │      │
│    └──────────────────────────────┘      │
└───────────────────────────────────────────┘
```

### Code Style
- **Frontend:** Vanilla JavaScript (ES6+), no frameworks
- **Backend:** Node.js với CommonJS modules
- **Database:** SQL queries với prepared statements
- **UI:** Custom CSS, không dùng CSS framework

---

**Built with ❤️ for Pickleball Drink Cafe**
