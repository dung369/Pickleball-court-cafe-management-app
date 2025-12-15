const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Categories
  getCategories: () => ipcRenderer.invoke('get-categories'),
  addCategory: (name, displayOrder) => ipcRenderer.invoke('add-category', name, displayOrder),

  // Menu Items
  getMenuItems: (categoryId) => ipcRenderer.invoke('get-menu-items', categoryId),
  searchMenuItems: (keyword) => ipcRenderer.invoke('search-menu-items', keyword),
  addMenuItem: (name, price, categoryId, description, imageUrl) => 
    ipcRenderer.invoke('add-menu-item', name, price, categoryId, description, imageUrl),
  updateMenuItem: (id, name, price, categoryId, description) => 
    ipcRenderer.invoke('update-menu-item', id, name, price, categoryId, description),
  deleteMenuItem: (id) => ipcRenderer.invoke('delete-menu-item', id),
  togglePopular: (id) => ipcRenderer.invoke('toggle-popular', id),

  // Tables
  getTables: () => ipcRenderer.invoke('get-tables'),
  getTableStatus: (tableId) => ipcRenderer.invoke('get-table-status', tableId),
  updateTableStatus: (tableId, status) => ipcRenderer.invoke('update-table-status', tableId, status),
  addTable: () => ipcRenderer.invoke('add-table'),
  deleteTable: (tableId) => ipcRenderer.invoke('delete-table', tableId),
  transferTable: (fromTableId, toTableId) => ipcRenderer.invoke('transfer-table', fromTableId, toTableId),
  mergeTables: (fromTableId, toTableId) => ipcRenderer.invoke('merge-tables', fromTableId, toTableId),
  splitTables: (tableId) => ipcRenderer.invoke('split-tables', tableId),

  // Orders
  getActiveOrder: (tableId) => ipcRenderer.invoke('get-active-order', tableId),
  createOrder: (tableId) => ipcRenderer.invoke('create-order', tableId),
  getOrderItems: (orderId) => ipcRenderer.invoke('get-order-items', orderId),
  addOrderItem: (orderId, menuItemId, quantity, price, note) => 
    ipcRenderer.invoke('add-order-item', orderId, menuItemId, quantity, price, note),
  updateOrderItemQuantity: (orderItemId, quantity) => 
    ipcRenderer.invoke('update-order-item-quantity', orderItemId, quantity),
  deleteOrderItem: (orderItemId) => ipcRenderer.invoke('delete-order-item', orderItemId),
  getOrderTotal: (orderId) => ipcRenderer.invoke('get-order-total', orderId),

  // Bills
  createBill: (tableId, orderId, totalAmount, discount, paymentMethod, cashierName) => 
    ipcRenderer.invoke('create-bill', tableId, orderId, totalAmount, discount, paymentMethod, cashierName),
  getBills: (startDate, endDate) => ipcRenderer.invoke('get-bills', startDate, endDate),
  getBillDetail: (billId) => ipcRenderer.invoke('get-bill-detail', billId),
  deleteBill: (billId) => ipcRenderer.invoke('delete-bill', billId),

  // Reports
  getRevenueByDate: (date) => ipcRenderer.invoke('get-revenue-by-date', date),
  getRevenueByMonth: (year, month) => ipcRenderer.invoke('get-revenue-by-month', year, month),
  getTopSellingItems: (limit) => ipcRenderer.invoke('get-top-selling-items', limit),
  getRevenueStats: (startDate, endDate) => ipcRenderer.invoke('get-revenue-stats', startDate, endDate),
  getPaymentMethodStats: (startDate, endDate) => ipcRenderer.invoke('get-payment-method-stats', startDate, endDate),

  // Authentication
  login: (username, password) => ipcRenderer.invoke('login', username, password)
});
