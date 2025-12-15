const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const DatabaseManager = require('./database');

let mainWindow;
let db;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    title: 'Pickleball Drink Manager'
  });

  mainWindow.loadFile('index.html');
  
  // Mở DevTools trong development (comment dòng này khi build production)
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  db = new DatabaseManager(app.getPath('userData'));
  await db.ready;
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (db) db.close();
    app.quit();
  }
});

// ===== IPC HANDLERS =====

// Categories
ipcMain.handle('get-categories', () => db.getCategories());
ipcMain.handle('add-category', (event, name, displayOrder) => db.addCategory(name, displayOrder));

// Menu Items
ipcMain.handle('get-menu-items', (event, categoryId) => db.getMenuItems(categoryId));
ipcMain.handle('search-menu-items', (event, keyword) => db.searchMenuItems(keyword));
ipcMain.handle('add-menu-item', (event, name, price, categoryId, description, imageUrl) => 
  db.addMenuItem(name, price, categoryId, description, imageUrl));
ipcMain.handle('update-menu-item', (event, id, name, price, categoryId, description) => 
  db.updateMenuItem(id, name, price, categoryId, description));
ipcMain.handle('delete-menu-item', (event, id) => db.deleteMenuItem(id));
ipcMain.handle('toggle-popular', (event, id) => db.togglePopular(id));

// Tables
ipcMain.handle('get-tables', () => db.getTables());
ipcMain.handle('get-table-status', (event, tableId) => db.getTableStatus(tableId));
ipcMain.handle('update-table-status', (event, tableId, status) => db.updateTableStatus(tableId, status));
ipcMain.handle('add-table', () => db.addTable());
ipcMain.handle('delete-table', (event, tableId) => db.deleteTable(tableId));
ipcMain.handle('transfer-table', (event, fromTableId, toTableId) => 
  db.transferTable(fromTableId, toTableId)
);
ipcMain.handle('merge-tables', (event, fromTableId, toTableId) => 
  db.mergeTables(fromTableId, toTableId)
);
ipcMain.handle('split-tables', (event, tableId) => 
  db.splitTables(tableId)
);

// Orders
ipcMain.handle('get-active-order', (event, tableId) => db.getActiveOrder(tableId));
ipcMain.handle('create-order', (event, tableId) => db.createOrder(tableId));
ipcMain.handle('get-order-items', (event, orderId) => db.getOrderItems(orderId));
ipcMain.handle('add-order-item', (event, orderId, menuItemId, quantity, price, note) => 
  db.addOrderItem(orderId, menuItemId, quantity, price, note));
ipcMain.handle('update-order-item-quantity', (event, orderItemId, quantity) => 
  db.updateOrderItemQuantity(orderItemId, quantity));
ipcMain.handle('delete-order-item', (event, orderItemId) => db.deleteOrderItem(orderItemId));
ipcMain.handle('get-order-total', (event, orderId) => db.getOrderTotal(orderId));

// Bills
ipcMain.handle('create-bill', (event, tableId, orderId, totalAmount, discount, paymentMethod, cashierName) => 
  db.createBill(tableId, orderId, totalAmount, discount, paymentMethod, cashierName));
ipcMain.handle('get-bills', (event, startDate, endDate) => db.getBills(startDate, endDate));
ipcMain.handle('get-bill-detail', (event, billId) => db.getBillDetail(billId));
ipcMain.handle('delete-bill', (event, billId) => db.deleteBill(billId));

// Reports
ipcMain.handle('get-revenue-by-date', (event, date) => db.getRevenueByDate(date));
ipcMain.handle('get-revenue-by-month', (event, year, month) => db.getRevenueByMonth(year, month));
ipcMain.handle('get-top-selling-items', (event, limit) => db.getTopSellingItems(limit));
ipcMain.handle('get-revenue-stats', (event, startDate, endDate) => db.getRevenueStats(startDate, endDate));
ipcMain.handle('get-payment-method-stats', (event, startDate, endDate) => db.getPaymentMethodStats(startDate, endDate));

// Authentication
ipcMain.handle('login', (event, username, password) => db.login(username, password));
