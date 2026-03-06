const mysql = require('mysql2/promise');

(async () => {
  const config = {
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'fish_app',
  };

  try {
    const conn = await mysql.createConnection(config);
    const [rows] = await conn.query(
      'SELECT id, name, imageUrls FROM fish_product WHERE imageUrls IS NOT NULL AND imageUrls != \'[""]\' ORDER BY id LIMIT 10'
    );
    console.log('前 10 个已更新图片的商品:');
    console.log(JSON.stringify(rows, null, 2));
    await conn.end();
  } catch (error) {
    console.error('查询失败:', error.message);
  }
})();
