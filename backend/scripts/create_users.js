const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function createUsers() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'rootpassword',
    database: 'fish_app',
  });

  try {
    // 检查用户是否已存在
    const [existingUsers] = await connection.execute(
      'SELECT username FROM user WHERE username IN (?, ?)',
      ['admin', 'wuyueqian']
    );

    const existingUsernames = existingUsers.map(u => u.username);
    
    // 创建管理员账户
    if (!existingUsernames.includes('admin')) {
      const adminPasswordHash = await bcrypt.hash('123456', 10);
      await connection.execute(
        'INSERT INTO user (username, password, phone, role) VALUES (?, ?, ?, ?)',
        ['admin', adminPasswordHash, '13800000000', 'admin']
      );
      console.log('✅ 管理员账户创建成功: admin / 123456');
    } else {
      // 更新现有 admin 用户的密码和角色
      const adminPasswordHash = await bcrypt.hash('123456', 10);
      await connection.execute(
        'UPDATE user SET password = ?, role = ? WHERE username = ?',
        [adminPasswordHash, 'admin', 'admin']
      );
      console.log('✅ 管理员账户密码已更新: admin / 123456');
    }

    // 创建普通用户账户
    if (!existingUsernames.includes('wuyueqian')) {
      const userPasswordHash = await bcrypt.hash('123456', 10);
      await connection.execute(
        'INSERT INTO user (username, password, phone, role) VALUES (?, ?, ?, ?)',
        ['wuyueqian', userPasswordHash, '13900000000', 'user']
      );
      console.log('✅ 普通用户账户创建成功: wuyueqian / 123456');
    } else {
      // 更新现有用户的密码
      const userPasswordHash = await bcrypt.hash('123456', 10);
      await connection.execute(
        'UPDATE user SET password = ? WHERE username = ?',
        [userPasswordHash, 'wuyueqian']
      );
      console.log('✅ 普通用户账户密码已更新: wuyueqian / 123456');
    }

    console.log('\n📋 账户信息：');
    console.log('管理员: admin / 123456');
    console.log('普通用户: wuyueqian / 123456');
  } catch (error) {
    console.error('❌ 创建用户失败:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

createUsers();
