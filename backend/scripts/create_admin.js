const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_DATABASE || 'fish_app',
  charset: 'utf8mb4',
};

async function createAdmin() {
  let connection;
  try {
    console.log('正在连接数据库...');
    connection = await mysql.createConnection(config);
    console.log('数据库连接成功！\n');

    const username = 'superadmin';
    const phone = '13900139000';
    const password = 'admin888';

    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 检查用户是否已存在
    const [existing] = await connection.query(
      'SELECT id FROM user WHERE phone = ?',
      [phone]
    );

    if (existing.length > 0) {
      console.log(`❌ 手机号 ${phone} 已被注册，请使用其他号码`);
      await connection.end();
      return;
    }

    // 创建管理员账号
    await connection.query(
      `INSERT INTO user (username, phone, password, role, created_at, updated_at) 
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [username, phone, hashedPassword, 'admin']
    );

    console.log('✅ 成功创建管理员账号！');
    console.log('\n📋 账号信息:');
    console.log('-'.repeat(40));
    console.log(`用户名：${username}`);
    console.log(`手机号：${phone}`);
    console.log(`密  码：${password}`);
    console.log(`角  色：👑 管理员`);
    console.log('-'.repeat(40));
    console.log('\n💡 提示：请使用该账号登录后测试导出功能。');

  } catch (error) {
    console.error('❌ 创建失败:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n提示：请确保 MySQL 服务正在运行');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n提示：数据库用户名或密码错误');
    } else if (error.code === 'ER_DUP_ENTRY') {
      console.error('\n提示：用户名或手机号已存在');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n数据库连接已关闭');
    }
  }
}

createAdmin();
