const mysql = require('mysql2/promise');

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_DATABASE || 'fish_app',
  charset: 'utf8mb4',
};

async function makeAdmin() {
  let connection;
  try {
    console.log('正在连接数据库...');
    connection = await mysql.createConnection(config);
    console.log('数据库连接成功！\n');

    // 查询所有用户
    const [users] = await connection.query(
      'SELECT id, username, phone, role, created_at FROM user ORDER BY id'
    );

    console.log('📋 当前用户列表:');
    console.log('-'.repeat(60));
    users.forEach((user, index) => {
      const isAdmin = user.role === 'admin';
      console.log(`${index + 1}. ${user.username} (${user.phone}) - 角色：${isAdmin ? '👑 管理员' : '👤 普通用户'} - 注册时间：${new Date(user.created_at).toLocaleString('zh-CN')}`);
    });
    console.log('-'.repeat(60));

    // 选择要提升的用户（默认第一个非 admin 用户）
    const regularUsers = users.filter(u => u.role !== 'admin');
    
    if (regularUsers.length === 0) {
      console.log('\n✅ 所有用户已经是管理员了！');
      return;
    }

    // 提升第一个普通用户为管理员
    const targetUser = regularUsers[0];
    
    console.log(`\n🔄 准备将用户 "${targetUser.username}" 提升为管理员...`);
    
    await connection.query(
      'UPDATE user SET role = ? WHERE id = ?',
      ['admin', targetUser.id]
    );

    console.log(`\n✅ 成功！用户 "${targetUser.username}" 现在是管理员了！`);
    console.log('\n💡 提示：请使用该账号重新登录后，再尝试导出订单。');

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

makeAdmin();
