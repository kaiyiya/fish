const mysql = require('mysql2/promise');

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'rootpassword',
  database: process.env.DB_DATABASE || 'fish_app',
  multipleStatements: true,
  charset: 'utf8mb4',
};

async function seedProducts() {
  let connection;
  try {
    console.log('正在连接数据库...');
    connection = await mysql.createConnection(config);
    console.log('数据库连接成功！');

    // 读取SQL文件内容
    const fs = require('fs');
    const path = require('path');
    const sqlFile = path.join(__dirname, 'seed_products.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('正在执行SQL脚本...');
    await connection.query(sql);
    console.log('✅ 商品数据导入成功！');

    // 查询导入的商品数量
    const [products] = await connection.query('SELECT COUNT(*) as count FROM fish_product');
    const [categories] = await connection.query('SELECT COUNT(*) as count FROM category');
    
    console.log(`\n📊 数据统计:`);
    console.log(`   - 分类数量: ${categories[0].count}`);
    console.log(`   - 商品数量: ${products[0].count}`);

  } catch (error) {
    console.error('❌ 执行失败:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n提示: 请确保MySQL服务正在运行');
      console.error('如果使用Docker，请运行: docker-compose up -d mysql');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n提示: 数据库用户名或密码错误');
      console.error('请检查环境变量: DB_USERNAME, DB_PASSWORD');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n数据库连接已关闭');
    }
  }
}

seedProducts();
