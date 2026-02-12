const mysql = require('mysql2/promise');

const config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'rootpassword',
  database: 'fish_app',
};

async function verifyAllIndexes() {
  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('检查所有表的外键索引状态...\n');

    // 获取所有有外键的表
    const [tables] = await connection.query(
      `SELECT DISTINCT TABLE_NAME 
       FROM information_schema.KEY_COLUMN_USAGE 
       WHERE TABLE_SCHEMA = ? 
         AND CONSTRAINT_NAME LIKE 'FK_%'
         AND REFERENCED_TABLE_NAME IS NOT NULL
       ORDER BY TABLE_NAME`,
      [config.database]
    );

    for (const { TABLE_NAME } of tables) {
      console.log(`表: ${TABLE_NAME}`);
      
      // 获取外键约束
      const [fks] = await connection.query(
        `SELECT CONSTRAINT_NAME, COLUMN_NAME 
         FROM information_schema.KEY_COLUMN_USAGE 
         WHERE TABLE_SCHEMA = ? 
           AND TABLE_NAME = ? 
           AND CONSTRAINT_NAME LIKE 'FK_%'
           AND REFERENCED_TABLE_NAME IS NOT NULL`,
        [config.database, TABLE_NAME]
      );

      // 获取索引
      const [indexes] = await connection.query(`SHOW INDEX FROM ${TABLE_NAME}`);

      for (const fk of fks) {
        // 查找外键使用的索引
        const fkIndex = indexes.find(idx => 
          idx.Column_name === fk.COLUMN_NAME && 
          idx.Key_name !== 'PRIMARY'
        );

        if (fkIndex) {
          const status = fkIndex.Key_name.startsWith('FK_') ? '✓ 正确' : '⚠ 注意';
          console.log(`  ${status} ${fk.CONSTRAINT_NAME} (${fk.COLUMN_NAME}) -> 索引: ${fkIndex.Key_name}`);
        } else {
          console.log(`  ✗ ${fk.CONSTRAINT_NAME} (${fk.COLUMN_NAME}) -> 未找到索引`);
        }
      }
      console.log('');
    }

    console.log('检查完成！');
    console.log('\n说明：');
    console.log('  ✓ 正确：外键使用外键名称作为索引名称（推荐）');
    console.log('  ⚠ 注意：外键使用其他索引（可能是复合索引，也是可以的）');
    console.log('  ✗ 未找到：外键没有索引（需要修复）');
  } catch (error) {
    console.error('错误:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

verifyAllIndexes();
