const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

class DatabaseManager {
  constructor(userDataPath) {
    // Nếu có userDataPath (từ Electron app.getPath('userData')), dùng nó
    // Nếu không có (dev mode), dùng __dirname
    const dbDir = userDataPath || __dirname;
    
    // Tạo thư mục nếu chưa có
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    this.dbPath = path.join(dbDir, 'pickleball_drink.db');
    this.db = null;
    this.ready = this.initDatabase();
  }

  async initDatabase() {
    const SQL = await initSqlJs();
    
    // Load existing database or create new one
    if (fs.existsSync(this.dbPath)) {
      const buffer = fs.readFileSync(this.dbPath);
      this.db = new SQL.Database(buffer);
    } else {
      this.db = new SQL.Database();
    }
    
    // Bảng danh mục món
    this.db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        display_order INTEGER DEFAULT 0
      );
    `);

    // Bảng món ăn/uống
    this.db.run(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price INTEGER NOT NULL,
        category_id INTEGER,
        description TEXT,
        image_url TEXT,
        is_popular INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      );
    `);

    // Bảng bàn
    this.db.run(`
      CREATE TABLE IF NOT EXISTS tables (
        id INTEGER PRIMARY KEY,
        status TEXT DEFAULT 'empty',
        merged_tables TEXT DEFAULT NULL,
        merged_into INTEGER DEFAULT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Thêm cột merged_tables nếu chưa có (cho database cũ)
    try {
      this.db.run(`ALTER TABLE tables ADD COLUMN merged_tables TEXT DEFAULT NULL`);
    } catch (e) {
      // Cột đã tồn tại, bỏ qua
    }
    
    // Thêm cột merged_into nếu chưa có (cho database cũ)
    try {
      this.db.run(`ALTER TABLE tables ADD COLUMN merged_into INTEGER DEFAULT NULL`);
    } catch (e) {
      // Cột đã tồn tại, bỏ qua
    }

    // Bảng đơn hàng
    this.db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_id INTEGER NOT NULL,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        total_amount INTEGER DEFAULT 0,
        FOREIGN KEY (table_id) REFERENCES tables(id)
      );
    `);

    // Bảng chi tiết đơn hàng
    this.db.run(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        menu_item_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price INTEGER NOT NULL,
        note TEXT,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
      );
    `);

    // Bảng hóa đơn
    this.db.run(`
      CREATE TABLE IF NOT EXISTS bills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_id INTEGER,
        order_id INTEGER,
        total_amount INTEGER NOT NULL,
        discount INTEGER DEFAULT 0,
        final_amount INTEGER NOT NULL,
        payment_method TEXT,
        cashier_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id)
      );
    `);

    // Bảng chi tiết hóa đơn
    this.db.run(`
      CREATE TABLE IF NOT EXISTS bill_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bill_id INTEGER NOT NULL,
        menu_item_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price INTEGER NOT NULL,
        FOREIGN KEY (bill_id) REFERENCES bills(id)
      );
    `);

    // Bảng người dùng (Admin & Nhân viên)
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        full_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Thêm tài khoản mặc định nếu chưa có
    const usersResult = this.db.exec('SELECT COUNT(*) as count FROM users');
    const userCount = usersResult.length > 0 && usersResult[0].values.length > 0 ? usersResult[0].values[0][0] : 0;
    
    if (userCount === 0) {
      this.db.run(`INSERT INTO users (username, password, role, full_name) VALUES 
        ('admin', '159357', 'admin', 'Quản trị viên'),
        ('nhanvien', '123456', 'staff', 'Nhân viên')`);
    }

    // Khởi tạo 20 bàn
    const result = this.db.exec('SELECT COUNT(*) as count FROM tables');
    const tableCount = result.length > 0 && result[0].values.length > 0 ? result[0].values[0][0] : 0;
    
    if (tableCount === 0) {
      for (let i = 1; i <= 20; i++) {
        this.db.run('INSERT INTO tables (id, status) VALUES (?, ?)', [i, 'empty']);
      }
    }

    this.saveDatabase();
    console.log('✓ Database initialized successfully');
  }

  saveDatabase() {
    const data = this.db.export();
    fs.writeFileSync(this.dbPath, data);
  }

  // ===== CATEGORIES =====
  getCategories() {
    const result = this.db.exec('SELECT * FROM categories ORDER BY display_order');
    return this.resultToObjects(result);
  }

  addCategory(name, displayOrder = 0) {
    this.db.run('INSERT INTO categories (name, display_order) VALUES (?, ?)', [name, displayOrder]);
    this.saveDatabase();
    return { lastInsertRowid: this.getLastInsertId() };
  }

  resultToObjects(result) {
    if (!result.length || !result[0].values.length) return [];
    const columns = result[0].columns;
    return result[0].values.map(row => {
      const obj = {};
      columns.forEach((col, i) => obj[col] = row[i]);
      return obj;
    });
  }

  getLastInsertId() {
    const result = this.db.exec('SELECT last_insert_rowid() as id');
    return result[0].values[0][0];
  }

  // ===== MENU ITEMS =====
  getMenuItems(categoryId = null) {
    let result;
    if (categoryId) {
      result = this.db.exec('SELECT * FROM menu_items WHERE category_id = ? AND is_active = 1', [categoryId]);
    } else {
      result = this.db.exec('SELECT * FROM menu_items WHERE is_active = 1');
    }
    return this.resultToObjects(result);
  }

  searchMenuItems(keyword) {
    const result = this.db.exec('SELECT * FROM menu_items WHERE name LIKE ? AND is_active = 1', [`%${keyword}%`]);
    return this.resultToObjects(result);
  }

  addMenuItem(name, price, categoryId, description = '', imageUrl = '') {
    this.db.run('INSERT INTO menu_items (name, price, category_id, description, image_url) VALUES (?, ?, ?, ?, ?)',
      [name, price, categoryId, description, imageUrl]);
    this.saveDatabase();
    return { lastInsertRowid: this.getLastInsertId() };
  }

  updateMenuItem(id, name, price, categoryId, description = '') {
    this.db.run('UPDATE menu_items SET name = ?, price = ?, category_id = ?, description = ? WHERE id = ?',
      [name, price, categoryId, description, id]);
    this.saveDatabase();
    return {};
  }

  deleteMenuItem(id) {
    this.db.run('UPDATE menu_items SET is_active = 0 WHERE id = ?', [id]);
    this.saveDatabase();
    return {};
  }

  togglePopular(id) {
    this.db.run('UPDATE menu_items SET is_popular = NOT is_popular WHERE id = ?', [id]);
    this.saveDatabase();
    return {};
  }

  // ===== TABLES =====
  getTables() {
    const result = this.db.exec('SELECT * FROM tables ORDER BY id');
    const allTables = this.resultToObjects(result);
    
    // Lọc bỏ các bàn đã bị merge vào bàn khác và tạo bàn ảo cho merged
    const visibleTables = [];
    const processedMerged = new Set();
    
    allTables.forEach(table => {
      // Nếu bàn đã bị merge vào bàn khác, bỏ qua
      if (table.merged_into !== null) {
        return;
      }
      
      // Nếu bàn có merged_tables và chưa xử lý
      if (table.merged_tables && !processedMerged.has(table.id)) {
        const mergedIds = table.merged_tables.split(',').map(id => parseInt(id));
        
        // Tạo bàn ảo với id là dãy các bàn đã gộp
        visibleTables.push({
          id: table.id, // Giữ nguyên id chính để query order
          display_id: table.merged_tables, // Hiển thị dạng "1,3,5"
          status: table.status,
          merged_tables: table.merged_tables,
          merged_into: table.merged_into,
          updated_at: table.updated_at
        });
        
        processedMerged.add(table.id);
      } else if (!table.merged_tables) {
        // Bàn thường không bị merge
        visibleTables.push({
          ...table,
          display_id: table.id.toString()
        });
      }
    });
    
    return visibleTables;
  }

  getTableStatus(tableId) {
    const result = this.db.exec('SELECT * FROM tables WHERE id = ?', [tableId]);
    const rows = this.resultToObjects(result);
    return rows.length > 0 ? rows[0] : null;
  }

  addTable() {
    try {
      // Lấy ID lớn nhất hiện tại
      const result = this.db.exec('SELECT MAX(id) as maxId FROM tables');
      const maxId = result.length > 0 && result[0].values.length > 0 ? result[0].values[0][0] : 0;
      const newId = (maxId || 0) + 1;
      
      // Thêm bàn mới
      this.db.run('INSERT INTO tables (id, status) VALUES (?, ?)', [newId, 'empty']);
      this.saveDatabase();
      
      return { success: true, tableId: newId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  deleteTable(tableId) {
    try {
      // Kiểm tra xem bàn có order đang hoạt động không
      const order = this.getActiveOrder(tableId);
      if (order) {
        return { success: false, error: 'Không thể xóa bàn đang có đơn hàng' };
      }
      
      // Kiểm tra xem bàn có phải là bàn ghép không
      const table = this.getTableStatus(tableId);
      if (table && table.merged_tables) {
        return { success: false, error: 'Không thể xóa bàn ghép. Vui lòng tách bàn trước.' };
      }
      
      // Xóa bàn
      this.db.run('DELETE FROM tables WHERE id = ?', [tableId]);
      this.saveDatabase();
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  updateTableStatus(tableId, status) {
    this.db.run('UPDATE tables SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, tableId]);
    this.saveDatabase();
    return {};
  }

  // ===== ORDERS =====
  getActiveOrder(tableId) {
    const result = this.db.exec('SELECT * FROM orders WHERE table_id = ? AND status = "active"', [tableId]);
    const rows = this.resultToObjects(result);
    return rows.length > 0 ? rows[0] : null;
  }

  createOrder(tableId) {
    this.db.run('INSERT INTO orders (table_id, status) VALUES (?, "active")', [tableId]);
    const orderId = this.getLastInsertId();
    this.updateTableStatus(tableId, 'serving');
    this.saveDatabase();
    return orderId;
  }

  getOrderItems(orderId) {
    const result = this.db.exec(`
      SELECT oi.*, mi.name as item_name 
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE oi.order_id = ?
    `, [orderId]);
    return this.resultToObjects(result);
  }

  addOrderItem(orderId, menuItemId, quantity, price, note = '') {
    this.db.run('INSERT INTO order_items (order_id, menu_item_id, quantity, price, note) VALUES (?, ?, ?, ?, ?)',
      [orderId, menuItemId, quantity, price, note]);
    this.saveDatabase();
    return {};
  }

  updateOrderItemQuantity(orderItemId, quantity) {
    if (quantity <= 0) {
      this.db.run('DELETE FROM order_items WHERE id = ?', [orderItemId]);
    } else {
      this.db.run('UPDATE order_items SET quantity = ? WHERE id = ?', [quantity, orderItemId]);
    }
    this.saveDatabase();
    return {};
  }

  deleteOrderItem(orderItemId) {
    this.db.run('DELETE FROM order_items WHERE id = ?', [orderItemId]);
    this.saveDatabase();
    return {};
  }

  getOrderTotal(orderId) {
    const result = this.db.exec('SELECT SUM(quantity * price) as total FROM order_items WHERE order_id = ?', [orderId]);
    if (result.length > 0 && result[0].values.length > 0) {
      return result[0].values[0][0] || 0;
    }
    return 0;
  }

  // ===== BILLS =====
  createBill(tableId, orderId, totalAmount, discount, paymentMethod, cashierName) {
    const finalAmount = totalAmount - discount;
    
    // Lấy thời gian hiện tại theo múi giờ địa phương (local time)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const localTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    
    // Tạo hóa đơn
    this.db.run(`
      INSERT INTO bills (table_id, order_id, total_amount, discount, final_amount, payment_method, cashier_name, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [tableId, orderId, totalAmount, discount, finalAmount, paymentMethod, cashierName, localTime]);
    
    const billId = this.getLastInsertId();

    // Copy order items sang bill items
    const orderItems = this.getOrderItems(orderId);

    for (const item of orderItems) {
      this.db.run('INSERT INTO bill_items (bill_id, menu_item_name, quantity, price) VALUES (?, ?, ?, ?)',
        [billId, item.item_name, item.quantity, item.price]);
    }

    // Đóng order
    this.db.run('UPDATE orders SET status = "completed" WHERE id = ?', [orderId]);

    // Reset bàn
    this.updateTableStatus(tableId, 'empty');
    
    this.saveDatabase();
    return billId;
  }

  getBills(startDate = null, endDate = null) {
    let result;
    
    if (startDate && endDate) {
      result = this.db.exec('SELECT * FROM bills WHERE DATE(created_at) BETWEEN ? AND ? ORDER BY created_at DESC',
        [startDate, endDate]);
    } else {
      result = this.db.exec('SELECT * FROM bills ORDER BY created_at DESC');
    }
    
    return this.resultToObjects(result);
  }

  getBillDetail(billId) {
    const billResult = this.db.exec('SELECT * FROM bills WHERE id = ?', [billId]);
    const bills = this.resultToObjects(billResult);
    if (bills.length === 0) return null;

    const itemsResult = this.db.exec('SELECT * FROM bill_items WHERE bill_id = ?', [billId]);
    const items = this.resultToObjects(itemsResult);
    
    return { ...bills[0], items };
  }

  deleteBill(billId) {
    // Delete bill items first
    this.db.run('DELETE FROM bill_items WHERE bill_id = ?', [billId]);
    // Delete bill
    this.db.run('DELETE FROM bills WHERE id = ?', [billId]);
    this.saveDatabase();
    return {};
  }

  // ===== REPORTS =====
  getRevenueByDate(date) {
    const result = this.db.exec(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as bill_count,
        SUM(final_amount) as total_revenue
      FROM bills
      WHERE DATE(created_at) = ?
      GROUP BY DATE(created_at)
    `, [date]);
    const rows = this.resultToObjects(result);
    return rows.length > 0 ? rows[0] : null;
  }

  getRevenueByMonth(year, month) {
    const result = this.db.exec(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as bill_count,
        SUM(final_amount) as total_revenue
      FROM bills
      WHERE strftime('%Y', created_at) = ? AND strftime('%m', created_at) = ?
      GROUP BY DATE(created_at)
    `, [year.toString(), month.toString().padStart(2, '0')]);
    return this.resultToObjects(result);
  }

  getTopSellingItems(limit = 10) {
    const result = this.db.exec(`
      SELECT 
        bi.menu_item_name,
        SUM(bi.quantity) as total_quantity,
        SUM(bi.quantity * bi.price) as total_revenue
      FROM bill_items bi
      GROUP BY bi.menu_item_name
      ORDER BY total_quantity DESC
      LIMIT ?
    `, [limit]);
    return this.resultToObjects(result);
  }

  getRevenueStats(startDate, endDate) {
    const result = this.db.exec(`
      SELECT 
        COUNT(*) as total_bills,
        SUM(final_amount) as total_revenue,
        AVG(final_amount) as avg_bill_amount,
        SUM(discount) as total_discount
      FROM bills
      WHERE DATE(created_at) BETWEEN ? AND ?
    `, [startDate, endDate]);
    const rows = this.resultToObjects(result);
    return rows.length > 0 ? rows[0] : { total_bills: 0, total_revenue: 0, avg_bill_amount: 0, total_discount: 0 };
  }

  getPaymentMethodStats(startDate, endDate) {
    const result = this.db.exec(`
      SELECT 
        payment_method,
        COUNT(*) as count,
        SUM(final_amount) as total
      FROM bills
      WHERE DATE(created_at) BETWEEN ? AND ?
      GROUP BY payment_method
    `, [startDate, endDate]);
    return this.resultToObjects(result);
  }

  // Chuyển bàn
  transferTable(fromTableId, toTableId) {
    try {
      const order = this.getActiveOrder(fromTableId);
      if (!order) {
        return { success: false, error: 'Bàn không có đơn hàng' };
      }

      // Check if target table is already serving
      const toTableOrder = this.getActiveOrder(toTableId);
      if (toTableOrder) {
        return { success: false, error: 'Bàn đích đang có khách' };
      }

      this.db.run('UPDATE orders SET table_id = ? WHERE id = ?', [toTableId, order.id]);
      this.updateTableStatus(fromTableId, 'empty');
      this.updateTableStatus(toTableId, 'serving');
      this.saveDatabase();
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Gộp bàn
  mergeTables(fromTableId, toTableId) {
    try {
      const fromOrder = this.getActiveOrder(fromTableId);
      let toOrder = this.getActiveOrder(toTableId);

      // Nếu cả 2 bàn đều có order, gộp items
      if (fromOrder && toOrder) {
        // Chuyển tất cả items từ bàn nguồn sang bàn đích
        this.db.run('UPDATE order_items SET order_id = ? WHERE order_id = ?', [toOrder.id, fromOrder.id]);
        
        // Xóa order cũ
        this.db.run('DELETE FROM orders WHERE id = ?', [fromOrder.id]);
      } else if (fromOrder && !toOrder) {
        // Bàn nguồn có order, bàn đích không có → tạo order mới cho đích
        const orderId = this.createOrder(toTableId);
        toOrder = { id: orderId };
        
        // Chuyển items
        this.db.run('UPDATE order_items SET order_id = ? WHERE order_id = ?', [toOrder.id, fromOrder.id]);
        
        // Xóa order cũ
        this.db.run('DELETE FROM orders WHERE id = ?', [fromOrder.id]);
      }
      // Nếu cả 2 đều không có order, hoặc chỉ bàn đích có order → không làm gì với order
      
      // Lấy merged_tables hiện tại của bàn đích
      const result = this.db.exec('SELECT merged_tables FROM tables WHERE id = ?', [toTableId]);
      let currentMerged = result.length > 0 && result[0].values.length > 0 ? result[0].values[0][0] : null;
      
      // Tạo danh sách bàn đã gộp
      let mergedList = [];
      if (currentMerged) {
        mergedList = currentMerged.split(',').map(id => parseInt(id));
      }
      
      // Thêm fromTableId và toTableId nếu chưa có
      if (!mergedList.includes(fromTableId)) {
        mergedList.push(fromTableId);
      }
      if (!mergedList.includes(toTableId)) {
        mergedList.push(toTableId);
      }
      
      // Sắp xếp và lưu
      mergedList.sort((a, b) => a - b);
      const mergedStr = mergedList.join(',');
      
      // Cập nhật merged_tables cho bàn đích
      this.db.run('UPDATE tables SET merged_tables = ? WHERE id = ?', [mergedStr, toTableId]);
      
      // Đánh dấu TẤT CẢ các bàn khác trong danh sách là merged_into toTableId
      mergedList.forEach(tId => {
        if (tId !== toTableId) {
          this.db.run('UPDATE tables SET merged_into = ?, status = ? WHERE id = ?', [toTableId, 'empty', tId]);
        }
      });
      
      this.saveDatabase();
      
      return { success: true, mergedTables: mergedStr };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  splitTables(tableId) {
    try {
      // Lấy thông tin merged_tables
      const result = this.db.exec('SELECT merged_tables FROM tables WHERE id = ?', [tableId]);
      if (result.length === 0 || result[0].values.length === 0 || !result[0].values[0][0]) {
        return { success: false, error: 'Bàn này chưa được gộp' };
      }

      const mergedTables = result[0].values[0][0].split(',').map(id => parseInt(id));
      if (mergedTables.length < 2) {
        return { success: false, error: 'Không có bàn nào để tách' };
      }

      // Lấy order hiện tại
      const order = this.getActiveOrder(tableId);
      if (!order) {
        // Không có order, reset merged_tables và merged_into cho TẤT CẢ các bàn
        mergedTables.forEach(tId => {
          this.db.run('UPDATE tables SET merged_tables = NULL, merged_into = NULL WHERE id = ?', [tId]);
        });
        this.saveDatabase();
        return { success: true };
      }

      // Lấy tất cả items
      const items = this.getOrderItems(order.id);
      if (items.length === 0) {
        // Không có items, reset merged_tables và merged_into cho TẤT CẢ các bàn
        mergedTables.forEach(tId => {
          this.db.run('UPDATE tables SET merged_tables = NULL, merged_into = NULL WHERE id = ?', [tId]);
        });
        this.saveDatabase();
        return { success: true };
      }

      // Chia đều items cho các bàn
      const itemsPerTable = Math.ceil(items.length / mergedTables.length);
      
      mergedTables.forEach((tId, index) => {
        const startIdx = index * itemsPerTable;
        const endIdx = Math.min(startIdx + itemsPerTable, items.length);
        const tableItems = items.slice(startIdx, endIdx);
        
        if (tableItems.length > 0) {
          // Tạo order mới cho bàn này
          const newOrderId = this.createOrder(tId);
          
          // Chuyển items sang order mới
          tableItems.forEach(item => {
            this.db.run(
              'UPDATE order_items SET order_id = ? WHERE id = ?',
              [newOrderId, item.id]
            );
          });
          
          // Cập nhật status bàn
          this.updateTableStatus(tId, 'serving');
        } else {
          this.updateTableStatus(tId, 'empty');
        }
        
        // Reset merged_tables và merged_into
        this.db.run('UPDATE tables SET merged_tables = NULL, merged_into = NULL WHERE id = ?', [tId]);
      });

      // Xóa order cũ
      this.db.run('DELETE FROM orders WHERE id = ?', [order.id]);
      
      this.saveDatabase();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ===== USER AUTHENTICATION =====
  login(username, password) {
    const result = this.db.exec(
      'SELECT id, username, role, full_name FROM users WHERE username = ? AND password = ?',
      [username, password]
    );
    
    if (result.length > 0 && result[0].values.length > 0) {
      const row = result[0].values[0];
      return {
        success: true,
        user: {
          id: row[0],
          username: row[1],
          role: row[2],
          fullName: row[3]
        }
      };
    }
    
    return { success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng!' };
  }

  close() {
    if (this.db) {
      this.saveDatabase();
      this.db.close();
    }
  }
}

module.exports = DatabaseManager;
