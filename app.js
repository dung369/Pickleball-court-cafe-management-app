// Global state
let currentView = 'tables';
let currentTable = null;
let currentOrder = null;
let categories = [];
let menuItems = [];
let tables = [];
let currentUser = null; // Lưu thông tin user hiện tại

// ===== AUTHENTICATION =====
async function handleLogin(event) {
  event.preventDefault();
  
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorDiv = document.getElementById('loginError');
  
  try {
    const result = await window.electronAPI.login(username, password);
    
    if (result.success) {
      currentUser = result.user;
      
      // Ẩn login, hiện app
      document.getElementById('loginContainer').style.display = 'none';
      document.getElementById('appContainer').style.display = 'flex';
      
      // Hiện tên user
      document.getElementById('currentUserInfo').textContent = 
        `${currentUser.fullName} (${currentUser.role === 'admin' ? 'Quản trị' : 'Nhân viên'})`;
      
      // Initialize app
      await initApp();
      
      errorDiv.style.display = 'none';
    } else {
      errorDiv.textContent = result.message;
      errorDiv.style.display = 'block';
    }
  } catch (error) {
    errorDiv.textContent = 'Lỗi đăng nhập: ' + error.message;
    errorDiv.style.display = 'block';
  }
}

function handleLogout() {
  if (confirm('Bạn có chắc muốn đăng xuất?')) {
    // Reset current user
    currentUser = null;
    
    // Reset current state
    currentTable = null;
    currentOrder = null;
    currentView = 'tables';
    
    // Reset form và error
    const usernameInput = document.getElementById('loginUsername');
    const passwordInput = document.getElementById('loginPassword');
    const errorDiv = document.getElementById('loginError');
    
    if (usernameInput) usernameInput.value = '';
    if (passwordInput) passwordInput.value = '';
    if (errorDiv) {
      errorDiv.style.display = 'none';
      errorDiv.textContent = '';
    }
    
    // Hide app, show login
    const appContainer = document.getElementById('appContainer');
    const loginContainer = document.getElementById('loginContainer');
    
    if (appContainer) appContainer.style.display = 'none';
    if (loginContainer) loginContainer.style.display = 'flex';
    
    // Focus vào username input
    setTimeout(() => {
      if (usernameInput) {
        usernameInput.focus();
      }
    }, 150);
  }
}

// Initialize app
async function initApp() {
  await loadCategories();
  await loadMenuItems();
  await loadTables();
  
  initNavigation();
  initEventListeners();
  
  // Set today's date for reports
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('reportStartDate').value = today;
  document.getElementById('reportEndDate').value = today;
}

// ===== NAVIGATION =====
function initNavigation() {
  const navBtns = document.querySelectorAll('.nav-btn');
  
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      switchView(view);
      
      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

function switchView(view) {
  currentView = view;
  
  document.querySelectorAll('.view-section').forEach(section => {
    section.classList.remove('active');
  });
  
  document.getElementById(`${view}-view`).classList.add('active');
  
  // Load data for specific views
  if (view === 'tables') {
    loadTables();
  } else if (view === 'menu') {
    displayMenuItems();
  } else if (view === 'bills') {
    loadBills();
  }
}

// ===== CATEGORIES =====
async function loadCategories() {
  categories = await window.electronAPI.getCategories();
  
  if (categories.length === 0) {
    // Add default categories
    await window.electronAPI.addCategory('Cà phê', 1);
    await window.electronAPI.addCategory('Nước ép - Trà', 2);
    await window.electronAPI.addCategory('Đồ uống khác', 3);
    await window.electronAPI.addCategory('Sinh tố', 4);
    await window.electronAPI.addCategory('Sữa - Sữa chua', 5);
    categories = await window.electronAPI.getCategories();
  }
  
  populateCategorySelects();
}

function populateCategorySelects() {
  const selects = [
    document.getElementById('categoryFilter'),
    document.getElementById('menuItemCategory')
  ];
  
  selects.forEach(select => {
    select.innerHTML = select.id === 'categoryFilter' 
      ? '<option value="">Tất cả danh mục</option>' 
      : '';
    
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = cat.name;
      select.appendChild(option);
    });
  });
}

// ===== MENU ITEMS =====
async function loadMenuItems(categoryId = null) {
  menuItems = await window.electronAPI.getMenuItems(categoryId);
  console.log('Loaded menuItems:', menuItems.length, menuItems);
  displayMenuItems();
}

function displayMenuItems() {
  const grid = document.getElementById('menuGrid');
  grid.innerHTML = '';
  
  let filteredItems = [...menuItems];
  
  // Filter by category
  const categoryFilter = document.getElementById('categoryFilter').value;
  if (categoryFilter) {
    filteredItems = filteredItems.filter(item => item.category_id == categoryFilter);
  }
  
  // Search
  const searchTerm = document.getElementById('menuSearch').value.toLowerCase();
  if (searchTerm) {
    filteredItems = filteredItems.filter(item => 
      item.name.toLowerCase().includes(searchTerm)
    );
  }
  
  // Sort
  const sortBy = document.getElementById('sortBy').value;
  if (sortBy === 'name') {
    filteredItems.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'price-asc') {
    filteredItems.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    filteredItems.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'popular') {
    filteredItems.sort((a, b) => b.is_popular - a.is_popular);
  }
  
  filteredItems.forEach(item => {
    const category = categories.find(c => c.id === item.category_id);
    
    const card = document.createElement('div');
    card.className = 'menu-item-card';
    card.innerHTML = `
      <div class="item-name">
        ${item.name}
        ${item.is_popular ? '<span class="popular-badge">Bán chạy</span>' : ''}
      </div>
      <div class="item-price">${formatMoney(item.price)}</div>
      <div class="item-category">${category ? category.name : ''}</div>
      ${item.description ? `<p style="font-size: 13px; color: #7f8c8d; margin: 10px 0;">${item.description}</p>` : ''}
      <div class="item-actions">
        <button class="btn btn-edit" onclick="editMenuItem(${item.id})">Sửa</button>
        <button class="btn btn-danger" onclick="deleteMenuItem(${item.id})">Xóa</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

async function editMenuItem(id) {
  const item = menuItems.find(m => m.id === id);
  if (!item) return;
  
  document.getElementById('menuItemModalTitle').textContent = 'Chỉnh sửa món';
  document.getElementById('menuItemId').value = item.id;
  document.getElementById('menuItemName').value = item.name;
  document.getElementById('menuItemPrice').value = item.price;
  document.getElementById('menuItemCategory').value = item.category_id;
  document.getElementById('menuItemDesc').value = item.description || '';
  
  document.getElementById('menuItemModal').classList.add('active');
}

async function deleteMenuItem(id) {
  if (!confirm('Bạn có chắc muốn xóa món này?')) return;
  
  await window.electronAPI.deleteMenuItem(id);
  await loadMenuItems();
  alert('Đã xóa món thành công!');
}

// ===== TABLES =====
async function loadTables() {
  tables = await window.electronAPI.getTables();
  displayTables();
}

function displayTables() {
  const grid = document.getElementById('tablesGrid');
  grid.innerHTML = '';
  
  tables.forEach(table => {
    const card = document.createElement('div');
    card.className = `table-card ${table.status}`;
    
    // Sử dụng display_id từ database (đã format sẵn)
    const tableDisplay = table.display_id ? table.display_id.split(',').join(' + ') : table.id.toString();
    
    card.innerHTML = `
      <div class="table-number">${tableDisplay}</div>
      <div class="table-status">${getStatusText(table.status)}</div>
    `;
    card.onclick = () => openTableOrder(table.id);
    grid.appendChild(card);
  });
}

function getStatusText(status) {
  const statusMap = {
    'empty': 'Trống',
    'serving': 'Đang phục vụ',
    'unpaid': 'Chưa thanh toán'
  };
  return statusMap[status] || status;
}

async function addNewTable() {
  try {
    const confirmed = await new Promise((resolve) => {
      showConfirm(
        '➕ THÊM BÀN MỚI\n\nBạn có chắc muốn thêm bàn mới?',
        () => resolve(true),
        () => resolve(false)
      );
    });
    
    if (!confirmed) return;
    
    const result = await window.electronAPI.addTable();
    
    if (result.success) {
      showAlert(`✅ THÀNH CÔNG!\n\nĐã thêm bàn ${result.tableId} mới.`);
      await loadTables();
    } else {
      showAlert('❌ LỖI: ' + (result.error || 'Không thể thêm bàn'));
    }
  } catch (error) {
    console.error('Error adding table:', error);
    showAlert('❌ Lỗi hệ thống: ' + error.message);
  }
}

async function deleteTableFromGrid() {
  try {
    // Reload tables
    await loadTables();
    
    // Lọc chỉ lấy bàn trống (không có merged_tables)
    const emptyTables = tables.filter(t => t.status === 'empty' && !t.merged_tables);
    
    if (emptyTables.length === 0) {
      showAlert('❌ Không có bàn trống để xóa!\n\nChỉ có thể xóa bàn trống không có đơn hàng.');
      return;
    }
    
    // Show modal với danh sách bàn có thể xóa
    showSelectTableModal(
      '🗑️ XÓA BÀN',
      'Chọn bàn muốn xóa (chỉ hiển thị bàn trống):',
      emptyTables,
      async (tableId) => {
        const confirmed = await new Promise((resolve) => {
          showConfirm(
            `⚠️ CẢNH BÁO\n\nBạn có chắc muốn xóa bàn ${tableId}?\n\nHành động này không thể hoàn tác!`,
            () => resolve(true),
            () => resolve(false)
          );
        });
        
        if (!confirmed) return;
        
        const result = await window.electronAPI.deleteTable(tableId);
        
        if (result.success) {
          showAlert(`✅ ĐÃ XÓA!\n\nBàn ${tableId} đã được xóa thành công.`);
          await loadTables();
        } else {
          showAlert('❌ LỖI: ' + (result.error || 'Không thể xóa bàn'));
        }
      }
    );
  } catch (error) {
    console.error('Error in deleteTableFromGrid:', error);
    showAlert('❌ Lỗi hệ thống: ' + error.message);
  }
}

// ===== ORDER =====
async function openTableOrder(tableId) {
  currentTable = tableId;
  
  // Hiển thị số bàn với merged tables nếu có
  const table = tables.find(t => t.id === tableId);
  let tableDisplay = tableId.toString();
  if (table && table.display_id) {
    tableDisplay = table.display_id.split(',').join(' + ');
  }
  document.getElementById('modalTableNumber').textContent = tableDisplay;
  
  // Hiển thị/ẩn nút tách bàn
  const splitBtn = document.getElementById('splitTableBtn');
  if (table && table.merged_tables) {
    splitBtn.style.display = 'inline-block';
  } else {
    splitBtn.style.display = 'none';
  }
  
  // Get or create order
  let order = await window.electronAPI.getActiveOrder(tableId);
  if (!order) {
    const orderId = await window.electronAPI.createOrder(tableId);
    order = { id: orderId, table_id: tableId };
  }
  currentOrder = order;
  
  // Load categories for tabs
  displayOrderCategoryTabs();
  
  // Load menu items
  displayOrderMenuItems();
  
  // Load order items
  await loadOrderItems();
  
  document.getElementById('orderModal').classList.add('active');
}

function displayOrderCategoryTabs() {
  const container = document.getElementById('orderCategoryTabs');
  container.innerHTML = '';
  
  const allTab = document.createElement('button');
  allTab.className = 'category-tab active';
  allTab.textContent = 'Tất cả';
  allTab.onclick = () => {
    document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
    allTab.classList.add('active');
    displayOrderMenuItems();
  };
  container.appendChild(allTab);
  
  categories.forEach(cat => {
    const tab = document.createElement('button');
    tab.className = 'category-tab';
    tab.textContent = cat.name;
    tab.onclick = () => {
      document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      displayOrderMenuItems(cat.id);
    };
    container.appendChild(tab);
  });
}

function displayOrderMenuItems(categoryId = null) {
  const grid = document.getElementById('orderMenuItems');
  grid.innerHTML = '';
  
  console.log('displayOrderMenuItems called with categoryId:', categoryId);
  console.log('Total menuItems:', menuItems.length);
  
  let items = [...menuItems];
  
  // Filter by category
  if (categoryId) {
    items = items.filter(item => item.category_id == categoryId); // Use == instead of ===
  }
  
  console.log('Filtered items:', items.length);
  
  // Search
  const searchTerm = document.getElementById('orderMenuSearch').value.toLowerCase();
  if (searchTerm) {
    items = items.filter(item => item.name.toLowerCase().includes(searchTerm));
  }
  
  if (items.length === 0) {
    grid.innerHTML = '<p style="padding: 20px; text-align: center; color: #7f8c8d;">Không có món nào</p>';
    return;
  }
  
  items.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'menu-item-btn';
    btn.innerHTML = `
      <div class="item-name">${item.name}</div>
      <div class="item-price">${formatMoney(item.price)}</div>
    `;
    btn.onclick = () => addItemToOrder(item);
    grid.appendChild(btn);
  });
}

async function addItemToOrder(item) {
  await window.electronAPI.addOrderItem(currentOrder.id, item.id, 1, item.price);
  await loadOrderItems();
}

async function loadOrderItems() {
  const orderItems = await window.electronAPI.getOrderItems(currentOrder.id);
  const container = document.getElementById('orderItems');
  container.innerHTML = '';
  
  if (orderItems.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 20px;">Chưa có món nào</p>';
  }
  
  orderItems.forEach(item => {
    const div = document.createElement('div');
    div.className = 'order-item';
    div.innerHTML = `
      <div class="order-item-info">
        <div class="order-item-name">${item.item_name}</div>
        <div class="order-item-price">${formatMoney(item.price)} x ${item.quantity} = ${formatMoney(item.price * item.quantity)}</div>
      </div>
      <div class="order-item-controls">
        <button class="qty-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
        <span class="order-item-qty">${item.quantity}</span>
        <button class="qty-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
        <button class="btn btn-danger" onclick="removeOrderItem(${item.id})">×</button>
      </div>
    `;
    container.appendChild(div);
  });
  
  // Update total
  const total = await window.electronAPI.getOrderTotal(currentOrder.id);
  document.getElementById('orderTotalAmount').textContent = formatMoney(total);
  
  // Update table status
  if (orderItems.length > 0) {
    await window.electronAPI.updateTableStatus(currentTable, 'serving');
  }
  
  await loadTables();
}

async function updateQuantity(orderItemId, newQuantity) {
  await window.electronAPI.updateOrderItemQuantity(orderItemId, newQuantity);
  await loadOrderItems();
}

async function removeOrderItem(orderItemId) {
  await window.electronAPI.deleteOrderItem(orderItemId);
  await loadOrderItems();
}

// ===== CHECKOUT =====
async function openCheckout() {
  const orderItems = await window.electronAPI.getOrderItems(currentOrder.id);
  if (orderItems.length === 0) {
    alert('Không có món nào để thanh toán!');
    return;
  }
  
  const total = await window.electronAPI.getOrderTotal(currentOrder.id);
  
  document.getElementById('checkoutTableNumber').textContent = currentTable;
  document.getElementById('checkoutTotal').value = formatMoney(total);
  document.getElementById('checkoutDiscount').value = 0;
  document.getElementById('checkoutFinal').value = formatMoney(total);
  
  const summary = document.getElementById('checkoutSummary');
  summary.innerHTML = '';
  
  orderItems.forEach(item => {
    const div = document.createElement('div');
    div.className = 'checkout-item';
    div.innerHTML = `
      <span>${item.item_name} x ${item.quantity}</span>
      <span>${formatMoney(item.price * item.quantity)}</span>
    `;
    summary.appendChild(div);
  });
  
  document.getElementById('orderModal').classList.remove('active');
  document.getElementById('checkoutModal').classList.add('active');
}

async function confirmCheckout() {
  const btn = document.getElementById('confirmCheckoutBtn');
  
  // Prevent duplicate clicks
  if (btn.disabled) return;
  btn.disabled = true;
  btn.textContent = 'Đang xử lý...';
  
  try {
    const totalText = document.getElementById('checkoutTotal').value;
    const total = parseInt(totalText.replace(/\D/g, ''));
    const discount = parseInt(document.getElementById('checkoutDiscount').value) || 0;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const cashierName = currentUser ? currentUser.fullName : 'Nhân viên';
    
    // Get order items before creating bill
    const orderItems = await window.electronAPI.getOrderItems(currentOrder.id);
    
    // Create bill only once
    const billId = await window.electronAPI.createBill(
      currentTable,
      currentOrder.id,
      total,
      discount,
      paymentMethod,
      cashierName
    );
    
    // Get bill with timestamp
    const billDetail = await window.electronAPI.getBillDetail(billId);
    
    // Print bill with real timestamp
    printBill({
      tableId: currentTable,
      items: orderItems,
      total: total,
      discount: discount,
      finalAmount: total - discount,
      paymentMethod: paymentMethod,
      cashierName: cashierName,
      createdAt: billDetail ? billDetail.created_at : new Date().toISOString()
    });
    
    document.getElementById('checkoutModal').classList.remove('active');
    await loadTables();
    
    alert('Thanh toán thành công!');
  } catch (error) {
    alert('Lỗi thanh toán: ' + error.message);
  } finally {
    // Reset button state
    btn.disabled = false;
    btn.textContent = 'Xác nhận thanh toán';
  }
}

// In bill
function printBill(billData) {
  // Sử dụng thời gian từ bill hoặc thời gian hiện tại
  const date = billData.createdAt ? new Date(billData.createdAt) : new Date();
  const dateStr = date.toLocaleDateString('vi-VN');
  const timeStr = date.toLocaleTimeString('vi-VN');
  
  let itemsHtml = '';
  billData.items.forEach(item => {
    itemsHtml += `
      <tr>
        <td style="padding: 5px 0;">${item.item_name}</td>
        <td style="text-align: center;">${item.quantity}</td>
        <td style="text-align: right;">${formatMoney(item.price)}</td>
        <td style="text-align: right;">${formatMoney(item.price * item.quantity)}</td>
      </tr>
    `;
  });
  
  const billHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Hóa đơn - Bàn ${billData.tableId}</title>
      <style>
        @media print {
          @page { margin: 0; size: 80mm auto; }
          body { margin: 0; }
        }
        body {
          font-family: 'Courier New', monospace;
          width: 280px;
          margin: 10px auto;
          padding: 10px;
          font-size: 12px;
        }
        h2, h3 {
          text-align: center;
          margin: 5px 0;
        }
        .center {
          text-align: center;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
        }
        th, td {
          padding: 3px 0;
          border-bottom: 1px dashed #ccc;
        }
        th {
          text-align: left;
          font-weight: bold;
        }
        .total-row td {
          border: none;
          padding: 5px 0;
          font-weight: bold;
        }
        .final-amount {
          font-size: 16px;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 2px solid #000;
        }
        hr {
          border: none;
          border-top: 2px solid #000;
          margin: 10px 0;
        }
        .no-print {
          text-align: center;
          margin-top: 20px;
        }
        @media print {
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <h2>🏓 PICKLEBALL DRINK</h2>
      <p class="center">Quán Cafe & Đồ uống</p>
      <hr>
      <p class="center">HÓA ĐƠN THANH TOÁN</p>
      <p>Bàn: <strong>${billData.tableId}</strong></p>
      <p>Ngày: ${dateStr} ${timeStr}</p>
      <p>Thu ngân: ${billData.cashierName}</p>
      <hr>
      <table>
        <thead>
          <tr>
            <th>Món</th>
            <th style="text-align: center;">SL</th>
            <th style="text-align: right;">Giá</th>
            <th style="text-align: right;">T.Tiền</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <hr>
      <table class="total-row">
        <tr>
          <td>Tổng cộng:</td>
          <td style="text-align: right;">${formatMoney(billData.total)}</td>
        </tr>
        <tr>
          <td>Giảm giá:</td>
          <td style="text-align: right;">${formatMoney(billData.discount)}</td>
        </tr>
      </table>
      <div class="final-amount center">
        <strong>THANH TOÁN: ${formatMoney(billData.finalAmount)}</strong>
      </div>
      <hr>
      <p class="center">Hình thức: ${getPaymentMethodText(billData.paymentMethod)}</p>
      <p class="center" style="margin-top: 20px;">Cảm ơn quý khách!</p>
      <p class="center">Hẹn gặp lại!</p>
      
      <div class="no-print">
        <button onclick="window.print()" style="padding: 10px 20px; margin: 5px; cursor: pointer; background: #4CAF50; color: white; border: none; border-radius: 5px;">🖨️ In lại</button>
        <button onclick="window.close()" style="padding: 10px 20px; margin: 5px; cursor: pointer; background: #f44336; color: white; border: none; border-radius: 5px;">❌ Đóng</button>
      </div>
    </body>
    </html>
  `;
  
  // Mở cửa sổ mới với kích thước lớn hơn để xem preview
  const printWindow = window.open('', '_blank', 'width=400,height=700');
  
  if (printWindow) {
    printWindow.document.write(billHtml);
    printWindow.document.close();
    
    // Tự động mở hộp thoại in sau khi load xong
    printWindow.onload = function() {
      setTimeout(() => {
        printWindow.print();
      }, 300);
    };
  } else {
    alert('Không thể mở cửa sổ in. Vui lòng kiểm tra popup blocker!');
  }
}

// ===== TRANSFER & MERGE TABLES =====
async function transferTable() {
  try {
    // Reload tables to get latest status
    await loadTables();
    
    // Get available tables (trống và không phải bàn merged)
    const availableTables = tables.filter(t => t.id !== currentTable && t.status === 'empty' && !t.merged_tables);
    
    if (availableTables.length === 0) {
      showAlert('Không có bàn trống để chuyển!\n\nTất cả các bàn khác đều đang có khách hoặc đã gộp.');
      return;
    }
    
    showSelectTableModal(
      '🔄 CHUYỂN BÀN',
      `Chọn bàn đích để chuyển từ bàn ${currentTable} (chỉ hiển thị bàn trống)`,
      availableTables,
      async (toTableId) => {
        const result = await window.electronAPI.transferTable(currentTable, toTableId);
        
        if (result.success) {
          showAlert(`✅ Đã chuyển bàn ${currentTable} sang bàn ${toTableId} thành công!`);
          document.getElementById('orderModal').classList.remove('active');
          await loadTables();
        } else {
          showAlert('❌ Lỗi: ' + (result.error || 'Không thể chuyển bàn'));
        }
      }
    );
  } catch (error) {
    console.error('Error in transferTable:', error);
    showAlert('❌ Lỗi hệ thống: ' + error.message);
  }
}

async function mergeTables() {
  console.log('mergeTables called, currentTable:', currentTable);
  
  try {
    // Reload tables to get latest status
    await loadTables();
    
    const currentTableObj = tables.find(t => t.id === currentTable);
    const currentTableDisplay = currentTableObj && currentTableObj.display_id 
      ? currentTableObj.display_id.split(',').join(' + ')
      : currentTable.toString();
    
    const otherTables = tables.filter(t => t.id !== currentTable);
    
    if (otherTables.length === 0) {
      showAlert('❌ Không có bàn khác để gộp!');
      return;
    }
    
    // Show modal with selectable table grid
    showSelectTableModal(
      '🔗 GỘP BÀN',
      `Chọn bàn để gộp VÀO "${currentTableDisplay}":`,
      otherTables,
      async (selectedTableId) => {
        console.log('Merging from', selectedTableId, 'to', currentTable);
        
        try {
          // Gộp bàn được chọn VÀO bàn hiện tại (đổi thứ tự tham số)
          const result = await window.electronAPI.mergeTables(selectedTableId, currentTable);
          console.log('Merge result:', result);
          
          if (result.success) {
            const mergedDisplay = result.mergedTables.split(',').join(' + ');
            const selectedTableObj = tables.find(t => t.id === selectedTableId);
            const selectedTableDisplay = selectedTableObj && selectedTableObj.display_id 
              ? selectedTableObj.display_id.split(',').join(' + ')
              : selectedTableId.toString();
            
            showAlert(`✅ THÀNH CÔNG!\n\nĐã gộp "${selectedTableDisplay}" vào "${currentTableDisplay}".\n\nBàn mới: ${mergedDisplay}`);
            document.getElementById('orderModal').classList.remove('active');
            await loadTables();
            // Mở lại modal của bàn hiện tại (bàn đích) để thấy nút tách bàn
            await openTableOrder(currentTable);
          } else {
            showAlert('❌ LỖI: ' + (result.error || 'Không thể gộp bàn'));
          }
        } catch (err) {
          console.error('Error merging tables:', err);
          showAlert('❌ Lỗi hệ thống: ' + err.message);
        }
      }
    );
  } catch (error) {
    console.error('Error in mergeTables:', error);
    showAlert('❌ Lỗi hệ thống: ' + error.message);
  }
}

async function splitTable() {
  console.log('splitTable called, currentTable:', currentTable);
  
  try {
    const table = tables.find(t => t.id === currentTable);
    if (!table || !table.merged_tables) {
      showAlert('❌ Bàn này chưa được gộp!');
      return;
    }
    
    const mergedList = table.merged_tables.split(',').join(', ');
    
    const confirmed = await new Promise((resolve) => {
      showConfirm(
        `🔓 TÁCH BÀN\n\nBạn có chắc muốn tách bàn ${table.merged_tables.split(',').join(' + ')} thành các bàn riêng lẻ?\n\nCác món sẽ được chia đều cho: ${mergedList}`,
        () => resolve(true),
        () => resolve(false)
      );
    });
    
    if (!confirmed) {
      return;
    }
    
    const result = await window.electronAPI.splitTables(currentTable);
    
    if (result.success) {
      showAlert(`✅ THÀNH CÔNG!\n\nĐã tách bàn thành công.\n\nCác bàn ${mergedList} đã được tách riêng.`);
      document.getElementById('orderModal').classList.remove('active');
      await loadTables();
    } else {
      showAlert('❌ LỖI: ' + (result.error || 'Không thể tách bàn'));
    }
  } catch (error) {
    console.error('Error in splitTable:', error);
    showAlert('❌ Lỗi hệ thống: ' + error.message);
  }
}

// ===== BILLS =====
function formatDateTime(dateString) {
  // Parse datetime string và format theo múi giờ Việt Nam
  const date = new Date(dateString);
  
  // Lấy thời gian theo múi giờ địa phương
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
}

async function loadBills(startDate = null, endDate = null) {
  const bills = await window.electronAPI.getBills(startDate, endDate);
  const tbody = document.getElementById('billsTableBody');
  tbody.innerHTML = '';
  
  if (bills.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 30px; color: #7f8c8d;">Không có hóa đơn nào</td></tr>';
    return;
  }
  
  bills.forEach(bill => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>#${bill.id}</td>
      <td>${formatDateTime(bill.created_at)}</td>
      <td>Bàn ${bill.table_id}</td>
      <td>${formatMoney(bill.total_amount)}</td>
      <td>${formatMoney(bill.discount)}</td>
      <td>${formatMoney(bill.final_amount)}</td>
      <td>${bill.cashier_name}</td>
      <td>
        <button class="btn btn-secondary" onclick="viewBillDetail(${bill.id})" style="margin-right: 5px;">Xem</button>
        ${currentUser && currentUser.role === 'admin' ? 
          `<button class="btn btn-danger" onclick="deleteBill(${bill.id})">Xóa</button>` : 
          ''
        }
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function viewBillDetail(billId) {
  const bill = await window.electronAPI.getBillDetail(billId);
  if (!bill) return;
  
  const content = document.getElementById('billDetailContent');
  
  let html = `
    <div style="text-align: center; margin-bottom: 20px;">
      <h3>HÓA ĐƠN #${bill.id}</h3>
      <p>${formatDateTime(bill.created_at)}</p>
      <p>Bàn ${bill.table_id} - ${bill.cashier_name}</p>
    </div>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <thead>
        <tr style="border-bottom: 2px solid #e0e0e0;">
          <th style="padding: 10px; text-align: left;">Món</th>
          <th style="padding: 10px; text-align: center;">SL</th>
          <th style="padding: 10px; text-align: right;">Đơn giá</th>
          <th style="padding: 10px; text-align: right;">Thành tiền</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  bill.items.forEach(item => {
    html += `
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 10px;">${item.menu_item_name}</td>
        <td style="padding: 10px; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; text-align: right;">${formatMoney(item.price)}</td>
        <td style="padding: 10px; text-align: right;">${formatMoney(item.price * item.quantity)}</td>
      </tr>
    `;
  });
  
  html += `
      </tbody>
    </table>
    <div style="text-align: right; font-size: 16px; margin-top: 20px;">
      <p><strong>Tổng tiền:</strong> ${formatMoney(bill.total_amount)}</p>
      <p><strong>Giảm giá:</strong> ${formatMoney(bill.discount)}</p>
      <p style="font-size: 20px; color: #e74c3c;"><strong>Thành tiền:</strong> ${formatMoney(bill.final_amount)}</p>
      <p style="margin-top: 10px;">Thanh toán: ${getPaymentMethodText(bill.payment_method)}</p>
    </div>
  `;
  
  content.innerHTML = html;
  document.getElementById('billDetailModal').classList.add('active');
}

function getPaymentMethodText(method) {
  const methods = {
    'cash': 'Tiền mặt',
    'transfer': 'Chuyển khoản',
    'qr': 'QR Banking'
  };
  return methods[method] || method;
}

async function deleteBill(billId) {
  if (!confirm('Bạn có chắc muốn xóa hóa đơn này?\nLưu ý: Thao tác này không thể hoàn tác!')) {
    return;
  }
  
  try {
    await window.electronAPI.deleteBill(billId);
    alert('Đã xóa hóa đơn thành công!');
    
    // Reload bills
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    if (startDate && endDate) {
      await loadBills(startDate, endDate);
    } else {
      await loadBills();
    }
  } catch (error) {
    alert('Lỗi khi xóa hóa đơn: ' + error.message);
  }
}

// ===== REPORTS =====
async function generateReport() {
  const startDate = document.getElementById('reportStartDate').value;
  const endDate = document.getElementById('reportEndDate').value;
  
  if (!startDate || !endDate) {
    alert('Vui lòng chọn khoảng thời gian!');
    return;
  }
  
  // Get stats
  const stats = await window.electronAPI.getRevenueStats(startDate, endDate);
  
  document.getElementById('totalRevenue').textContent = formatMoney(stats.total_revenue || 0);
  document.getElementById('totalBills').textContent = stats.total_bills || 0;
  document.getElementById('avgBill').textContent = formatMoney(Math.round(stats.avg_bill_amount) || 0);
  document.getElementById('totalDiscount').textContent = formatMoney(stats.total_discount || 0);
  
  // Get payment method stats
  const paymentStats = await window.electronAPI.getPaymentMethodStats(startDate, endDate);
  const paymentChart = document.getElementById('paymentMethodChart');
  paymentChart.innerHTML = '';
  
  if (paymentStats.length > 0) {
    const table = document.createElement('table');
    table.className = 'top-items-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th>Phương thức</th>
          <th>Số lượng</th>
          <th>Tổng tiền</th>
          <th>Tỷ lệ</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
    
    const totalAmount = paymentStats.reduce((sum, item) => sum + (item.total || 0), 0);
    const tbody = table.querySelector('tbody');
    
    paymentStats.forEach(item => {
      const percentage = totalAmount > 0 ? ((item.total / totalAmount) * 100).toFixed(1) : 0;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${getPaymentMethodText(item.payment_method)}</strong></td>
        <td>${item.count}</td>
        <td>${formatMoney(item.total)}</td>
        <td>${percentage}%</td>
      `;
      tbody.appendChild(tr);
    });
    
    paymentChart.appendChild(table);
  } else {
    paymentChart.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 20px;">Chưa có dữ liệu</p>';
  }
  
  // Get top selling items
  const topItems = await window.electronAPI.getTopSellingItems(10);
  const tbody = document.getElementById('topItemsTableBody');
  tbody.innerHTML = '';
  
  topItems.forEach((item, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${index + 1}.</strong> ${item.menu_item_name}</td>
      <td>${item.total_quantity}</td>
      <td>${formatMoney(item.total_revenue)}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ===== EVENT LISTENERS =====
function initEventListeners() {
  // Menu search and filter
  document.getElementById('menuSearch').addEventListener('input', displayMenuItems);
  document.getElementById('categoryFilter').addEventListener('change', displayMenuItems);
  document.getElementById('sortBy').addEventListener('change', displayMenuItems);
  
  // Order search
  document.getElementById('orderMenuSearch').addEventListener('input', () => displayOrderMenuItems());
  
  // Add menu item
  document.getElementById('addMenuItemBtn').addEventListener('click', () => {
    document.getElementById('menuItemModalTitle').textContent = 'Thêm món mới';
    document.getElementById('menuItemForm').reset();
    document.getElementById('menuItemId').value = '';
    document.getElementById('menuItemModal').classList.add('active');
  });
  
  // Menu item form submit
  document.getElementById('menuItemForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('menuItemId').value;
    const name = document.getElementById('menuItemName').value;
    const price = parseInt(document.getElementById('menuItemPrice').value);
    const categoryId = parseInt(document.getElementById('menuItemCategory').value);
    const description = document.getElementById('menuItemDesc').value;
    
    if (id) {
      await window.electronAPI.updateMenuItem(parseInt(id), name, price, categoryId, description);
    } else {
      await window.electronAPI.addMenuItem(name, price, categoryId, description, '');
    }
    
    await loadMenuItems();
    document.getElementById('menuItemModal').classList.remove('active');
    alert('Đã lưu món thành công!');
  });
  
  // Close modals
  document.getElementById('closeOrderModal').addEventListener('click', () => {
    document.getElementById('orderModal').classList.remove('active');
  });
  
  document.getElementById('closeCheckoutModal').addEventListener('click', () => {
    document.getElementById('checkoutModal').classList.remove('active');
    document.getElementById('orderModal').classList.add('active');
  });
  
  document.getElementById('closeMenuItemModal').addEventListener('click', () => {
    document.getElementById('menuItemModal').classList.remove('active');
  });
  
  document.getElementById('closeBillDetailModal').addEventListener('click', () => {
    document.getElementById('billDetailModal').classList.remove('active');
  });
  
  document.getElementById('closeSelectTableModal').addEventListener('click', () => {
    document.getElementById('selectTableModal').classList.remove('active');
  });
  
  document.getElementById('closeConfirmModal').addEventListener('click', () => {
    document.getElementById('confirmModal').classList.remove('active');
  });
  
  // Checkout
  document.getElementById('checkoutBtn').addEventListener('click', openCheckout);
  document.getElementById('confirmCheckoutBtn').addEventListener('click', confirmCheckout);
  
  // Discount calculation
  document.getElementById('checkoutDiscount').addEventListener('input', () => {
    const totalText = document.getElementById('checkoutTotal').value;
    const total = parseInt(totalText.replace(/\D/g, ''));
    const discount = parseInt(document.getElementById('checkoutDiscount').value) || 0;
    document.getElementById('checkoutFinal').value = formatMoney(total - discount);
  });
  
  // Transfer & Merge & Split
  document.getElementById('transferTableBtn').addEventListener('click', transferTable);
  document.getElementById('mergeTableBtn').addEventListener('click', mergeTables);
  document.getElementById('splitTableBtn').addEventListener('click', splitTable);
  
  // Bills filter
  document.getElementById('filterBillsBtn').addEventListener('click', () => {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    loadBills(startDate, endDate);
  });
  
  // Set default dates for bills (last 7 days)
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
  
  document.getElementById('endDate').value = today.toISOString().split('T')[0];
  document.getElementById('startDate').value = sevenDaysAgo.toISOString().split('T')[0];
  
  // Generate report
  document.getElementById('generateReportBtn').addEventListener('click', generateReport);
}

// ===== UTILITY FUNCTIONS =====
function formatMoney(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

// Custom alert
function showAlert(message) {
  alert(message);
}

// Custom confirm
function showConfirm(message, onConfirm, onCancel) {
  const modal = document.getElementById('confirmModal');
  document.getElementById('confirmMessage').textContent = message;
  modal.classList.add('active');
  
  const okBtn = document.getElementById('confirmOkBtn');
  const cancelBtn = document.getElementById('confirmCancelBtn');
  
  const handleOk = () => {
    modal.classList.remove('active');
    okBtn.removeEventListener('click', handleOk);
    cancelBtn.removeEventListener('click', handleCancel);
    onConfirm();
  };
  
  const handleCancel = () => {
    modal.classList.remove('active');
    okBtn.removeEventListener('click', handleOk);
    cancelBtn.removeEventListener('click', handleCancel);
    if (onCancel) onCancel();
  };
  
  okBtn.addEventListener('click', handleOk);
  cancelBtn.addEventListener('click', handleCancel);
}

// Show table selection modal
function showSelectTableModal(title, message, tablesList, onSelect) {
  const modal = document.getElementById('selectTableModal');
  document.getElementById('selectTableTitle').textContent = title;
  document.getElementById('selectTableMessage').textContent = message;
  
  const grid = document.getElementById('selectTableGrid');
  grid.innerHTML = '';
  
  tablesList.forEach(table => {
    const card = document.createElement('div');
    card.className = `table-card ${table.status}`;
    
    // Hiển thị tên bàn đúng
    const tableDisplay = table.display_id ? table.display_id.split(',').join(' + ') : table.id.toString();
    
    card.innerHTML = `
      <div class="table-number">${tableDisplay}</div>
      <div class="table-status">${getStatusText(table.status)}</div>
    `;
    card.onclick = () => {
      modal.classList.remove('active');
      onSelect(table.id);
    };
    grid.appendChild(card);
  });
  
  modal.classList.add('active');
}

// Close modal on outside click
window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('active');
  }
});
