const mysql = require('mysql2/promise');

const config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'rootpassword',
  database: 'fish_app',
};

async function fixAllForeignKeyIndexes() {
  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('已连接到数据库');

    // 需要修复的表
    const tables = ['cart', 'favorite', 'review', 'user_coupon', 'notification'];

    for (const table of tables) {
      console.log(`\n处理表: ${table}`);
      
      // 检查表是否存在
      const [tables] = await connection.query(
        `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = ?`,
        [config.database, table]
      );
      
      if (tables[0].count === 0) {
        console.log(`  - 表 ${table} 不存在，跳过`);
        continue;
      }

      // 获取所有外键约束
      const [foreignKeys] = await connection.query(
        `SELECT 
          CONSTRAINT_NAME,
          COLUMN_NAME,
          REFERENCED_TABLE_NAME,
          REFERENCED_COLUMN_NAME
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = ? 
          AND TABLE_NAME = ? 
          AND CONSTRAINT_NAME LIKE 'FK_%'
          AND REFERENCED_TABLE_NAME IS NOT NULL`,
        [config.database, table]
      );

      if (foreignKeys.length === 0) {
        console.log(`  - 表 ${table} 没有外键约束，跳过`);
        continue;
      }

      // 获取所有索引
      const [indexes] = await connection.query(`SHOW INDEX FROM ${table}`);
      
      // 找出被外键使用的索引
      const fkIndexes = new Map();
      for (const fk of foreignKeys) {
        // 优先查找单独的索引（IDX_开头）
        let index = indexes.find(idx => 
          idx.Column_name === fk.COLUMN_NAME && 
          idx.Key_name !== 'PRIMARY' &&
          idx.Key_name.startsWith('IDX_')
        );
        
        // 如果没有找到，查找外键自动创建的索引（FK_开头）
        if (!index) {
          index = indexes.find(idx => 
            idx.Column_name === fk.COLUMN_NAME && 
            idx.Key_name !== 'PRIMARY' &&
            idx.Key_name.startsWith('FK_')
          );
        }
        
        if (index) {
          fkIndexes.set(fk.CONSTRAINT_NAME, {
            indexName: index.Key_name,
            columnName: fk.COLUMN_NAME,
          });
        }
      }

      // 修复每个外键
      for (const fk of foreignKeys) {
        const fkInfo = fkIndexes.get(fk.CONSTRAINT_NAME);
        if (!fkInfo) {
          console.log(`  - 外键 ${fk.CONSTRAINT_NAME} 没有找到对应的索引，跳过`);
          continue;
        }

        console.log(`  处理外键: ${fk.CONSTRAINT_NAME} (列: ${fk.COLUMN_NAME}, 索引: ${fkInfo.indexName})`);

        try {
          // 删除外键约束
          await connection.query(`ALTER TABLE ${table} DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}`);
          console.log(`    ✓ 已删除外键约束: ${fk.CONSTRAINT_NAME}`);

          // 删除索引（如果存在且不是复合索引的一部分）
          const indexInfo = indexes.find(idx => idx.Key_name === fkInfo.indexName);
          if (indexInfo) {
            // 检查是否是复合索引
            const sameKeyIndexes = indexes.filter(idx => idx.Key_name === fkInfo.indexName);
            if (sameKeyIndexes.length === 1) {
              // 单字段索引，检查是否有复合索引包含这个字段
              const compositeIndexes = indexes.filter(idx => 
                idx.Key_name !== fkInfo.indexName &&
                idx.Key_name !== 'PRIMARY' &&
                idx.Column_name === fk.COLUMN_NAME
              );
              
              if (compositeIndexes.length > 0) {
                // 有复合索引包含这个字段，可以删除单独的索引
                try {
                  await connection.query(`DROP INDEX ${fkInfo.indexName} ON ${table}`);
                  console.log(`    ✓ 已删除重复索引: ${fkInfo.indexName} (有复合索引可用)`);
                } catch (error) {
                  if (error.code !== 'ER_CANT_DROP_FIELD_OR_KEY') {
                    console.log(`    - 删除索引失败: ${error.message}`);
                  }
                }
              } else {
                // 没有复合索引，保留这个索引
                console.log(`    - 保留索引 ${fkInfo.indexName} (没有其他索引可用)`);
              }
            } else {
              console.log(`    - 索引 ${fkInfo.indexName} 是复合索引的一部分，保留`);
            }
          }

          // 重新创建外键约束（MySQL 会自动创建索引）
          await connection.query(
            `ALTER TABLE ${table} ADD CONSTRAINT ${fk.CONSTRAINT_NAME} FOREIGN KEY (${fk.COLUMN_NAME}) REFERENCES ${fk.REFERENCED_TABLE_NAME}(${fk.REFERENCED_COLUMN_NAME})`
          );
          console.log(`    ✓ 已重新创建外键约束: ${fk.CONSTRAINT_NAME}`);

        } catch (error) {
          console.error(`    ✗ 处理外键 ${fk.CONSTRAINT_NAME} 失败:`, error.message);
        }
      }
    }

    console.log('\n修复完成！');
  } catch (error) {
    console.error('错误:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixAllForeignKeyIndexes();
