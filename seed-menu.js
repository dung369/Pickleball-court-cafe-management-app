const DatabaseManager = require('./database');

async function seedData() {
  const db = new DatabaseManager();
  await db.ready;

  console.log('Đang thêm dữ liệu mẫu menu...');

  // Check if categories exist, if not create them
  let categories = db.getCategories();
  
  if (categories.length === 0) {
    console.log('Tạo categories...');
    db.addCategory('Cà phê', 1);
    db.addCategory('Nước ép - Trà', 2);
    db.addCategory('Đồ uống khác', 3);
    db.addCategory('Sinh tố', 4);
    db.addCategory('Sữa - Sữa chua', 5);
    categories = db.getCategories();
    console.log('✓ Đã tạo ' + categories.length + ' categories');
  }

  // Get categories
const categoryMap = {};
categories.forEach(cat => {
  categoryMap[cat.name] = cat.id;
});

// Menu data - Pickleball Drink
const menuData = [
  // Cà phê
  { name: 'Đen đá', price: 16000, category: 'Cà phê' },
  { name: 'Sữa đá', price: 18000, category: 'Cà phê' },
  { name: 'Cà phê muối', price: 20000, category: 'Cà phê' },
  { name: 'Sữa tươi', price: 25000, category: 'Cà phê' },
  { name: 'Bạc sỉu', price: 20000, category: 'Cà phê' },
  
  // Nước ép - Trà
  { name: 'Cam ép', price: 25000, category: 'Nước ép - Trà' },
  { name: 'Trà dâu', price: 30000, category: 'Nước ép - Trà' },
  { name: 'Trà mãng cầu', price: 30000, category: 'Nước ép - Trà' },
  { name: 'Trà đá', price: 10000, category: 'Nước ép - Trà' },
  
  // Đồ uống khác
  { name: 'Bia (lon)', price: 20000, category: 'Đồ uống khác' },
  { name: 'Bò húc', price: 15000, category: 'Đồ uống khác' },
  { name: 'Nước suối', price: 8000, category: 'Đồ uống khác' },
  { name: 'Dừa trái', price: 15000, category: 'Đồ uống khác' },
  { name: 'Kombucha', price: 30000, category: 'Đồ uống khác' },
  { name: 'Nước ngọt các loại', price: 15000, category: 'Đồ uống khác' },
  { name: 'Hướng dương', price: 10000, category: 'Đồ uống khác', description: '10k/dĩa' },
  
  // Sinh tố
  { name: 'Sinh tố bơ', price: 25000, category: 'Sinh tố' },
  { name: 'Sinh tố dâu', price: 25000, category: 'Sinh tố' },
  { name: 'Sinh tố mãng cầu', price: 25000, category: 'Sinh tố' },
  
  // Sữa - Sữa chua
  { name: 'Nha đam đá xay', price: 15000, category: 'Sữa - Sữa chua' },
  { name: 'Sữa chua (hộp)', price: 10000, category: 'Sữa - Sữa chua' },
  { name: 'Cacao sữa', price: 25000, category: 'Sữa - Sữa chua' }
];

// Insert menu items
menuData.forEach(item => {
  const categoryId = categoryMap[item.category];
  if (categoryId) {
    db.addMenuItem(item.name, item.price, categoryId, item.description || '', '');
    console.log(`✓ Đã thêm: ${item.name} - ${item.price}đ`);
  } else {
    console.log(`✗ Không tìm thấy category: ${item.category} cho món ${item.name}`);
  }
});

console.log('\n✓ Hoàn thành! Đã thêm ' + menuData.length + ' món vào menu.');

  // Ensure database is saved before closing
  db.saveDatabase();
  console.log('✓ Database đã được lưu!');
  
  db.close();
}

seedData().catch(console.error);
