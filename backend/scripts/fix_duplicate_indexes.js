const mysql = require('mysql2/promise');

const config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'rootpassword',
  database: 'fish_app',
};

async function cleanupDuplicateIndexes() {
  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('已连接到数据库');

    // 需要清理的表和字段
    const tablesToClean = [
      { table: 'cart', fields: ['userId', 'productId'] },
      { table: 'favorite', fields: ['userId', 'productId'] },
      { table: 'address', fields: ['userId'] },
      { table: 'review', fields: ['userId', 'productId'] },
      { table: 'user_behavior', fields: ['userId', 'productId'] },
      { table: 'notification', fields: ['userId'] },
      { table: 'user_coupon', fields: ['userId', 'couponId'] },
      { table: 'search_log', fields: ['userId'] },
    ];

    for (const { table, fields } of tablesToClean) {
      console.log(`\n检查表: ${table}`);
      
      // 检查表是否存在
      const [tables] = await connection.query(
        `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = ?`,
        [config.database, table]
      );
      
      if (tables[0].count === 0) {
        console.log(`  - 表 ${table} 不存在，跳过`);
        continue;
      }
      
      // 获取所有索引
      const [indexes] = await connection.query(
        `SHOW INDEX FROM ${table}`
      );

      // 找出复合索引（包含多个字段的索引）
      const compositeIndexes = new Map();
      const singleIndexes = new Map();

      for (const index of indexes) {
        const keyName = index.Key_name;
        if (keyName === 'PRIMARY') continue;

        if (!compositeIndexes.has(keyName) && !singleIndexes.has(keyName)) {
          // 检查这个索引是否包含多个字段
          const sameKeyIndexes = indexes.filter(idx => idx.Key_name === keyName);
          if (sameKeyIndexes.length > 1) {
            // 这是复合索引
            const indexFields = sameKeyIndexes.map(idx => idx.Column_name).sort().join(',');
            compositeIndexes.set(keyName, indexFields);
          } else {
            // 这是单字段索引
            singleIndexes.set(keyName, index.Column_name);
          }
        }
      }

      // 找出需要删除的重复索引
      const indexesToDrop = [];
      
      for (const [indexName, columnName] of singleIndexes.entries()) {
        // 检查这个字段是否已经在复合索引中
        let isInComposite = false;
        for (const [compIndexName, compFields] of compositeIndexes.entries()) {
          if (compFields.includes(columnName) && fields.includes(columnName)) {
            isInComposite = true;
            console.log(`  发现重复索引: ${indexName} (字段: ${columnName}) 已在复合索引 ${compIndexName} 中`);
            indexesToDrop.push(indexName);
            break;
          }
        }
      }

      // 删除重复索引
      for (const indexName of indexesToDrop) {
        try {
          await connection.query(`DROP INDEX ${indexName} ON ${table}`);
          console.log(`  ✓ 已删除索引: ${indexName}`);
        } catch (error) {
          if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
            console.log(`  - 索引 ${indexName} 不存在或已被删除`);
          } else if (error.message.includes('foreign key constraint')) {
            console.log(`  - 索引 ${indexName} 被外键约束使用，保留`);
          } else {
            console.error(`  ✗ 删除索引 ${indexName} 失败:`, error.message);
          }
        }
      }
    }

    console.log('\n清理完成！');
  } catch (error) {
    console.error('错误:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

cleanupDuplicateIndexes();
