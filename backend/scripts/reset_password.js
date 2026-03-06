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

async function resetPassword() {
  let connection;
  try {
    console.log('正在连接数据库...');
    connection = await mysql.createConnection(config);
    console.log('数据库连接成功！\n');

    // 查询所有用户
    const [users] = await connection.query(
      'SELECT id, username, phone, role FROM user ORDER BY id'
    );

    console.log('📋 当前用户列表:');
    console.log('-'.repeat(60));
    users.forEach((user, index) => {
      const isAdmin = user.role === 'admin';
      console.log(`${index + 1}. ${user.username} (${user.phone}) - ${isAdmin ? '👑 管理员' : '👤 普通用户'}`);
    });
    console.log('-'.repeat(60));

    // 选择要重置的用户
    const targetPhone = '13800138000'; // test 账号
    const newPassword = '123456'; // 新密码

    const targetUser = users.find(u => u.phone === targetPhone);
    
    if (!targetUser) {
      console.log(`\n❌ 未找到手机号为 ${targetPhone} 的用户`);
      return;
    }

    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    console.log(`\n🔄 准备重置用户 "${targetUser.username}" 的密码...`);
    
    await connection.query(
      'UPDATE user SET password = ? WHERE phone = ?',
      [hashedPassword, targetPhone]
    );

    console.log(`\n✅ 成功！用户 "${targetUser.username}" 的密码已重置为：${newPassword}`);
    console.log('\n💡 提示：请使用新密码重新登录后测试。');

  } catch (error) {
    console.error('❌ 执行失败:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n提示：请确保 MySQL 服务正在运行');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n提示：数据库用户名或密码错误');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n数据库连接已关闭');
    }
  }
}

resetPassword();
