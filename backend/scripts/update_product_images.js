const mysql = require('mysql2/promise');

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_DATABASE || 'fish_app',
  multipleStatements: true,
  charset: 'utf8mb4',
};

// 鱼类图片映射表
const fishImages = {
  '海鲈鱼': 'https://bu.dusays.com/2026/03/06/69aa6dcadb0eb.png',
  '花蛤': 'https://bu.dusays.com/2026/03/06/69aa6dcbe87e1.png',
  '比目鱼': 'https://bu.dusays.com/2026/03/06/69aa6dcc05d67.png',
  '对虾': 'https://bu.dusays.com/2026/03/06/69aa6dcc3b687.png',
  '草鱼': 'https://bu.dusays.com/2026/03/06/69aa6dcc70770.png',
  '大闸蟹': 'https://bu.dusays.com/2026/03/06/69aa6dcca3bd0.png',
  '桂鱼': 'https://bu.dusays.com/2026/03/06/69aa6dccbeb8d.png',
  '黄花鱼': 'https://bu.dusays.com/2026/03/06/69aa6dccc7ee0.png',
  '带鱼段': 'https://bu.dusays.com/2026/03/06/69aa6dccd969e.png',
  '多宝鱼': 'https://bu.dusays.com/2026/03/06/69aa6dccea855.png',
  '鲫鱼': 'https://bu.dusays.com/2026/03/06/69aa6dcd2b9bf.jpg',
  '基围虾': 'https://bu.dusays.com/2026/03/06/69aa6dcd50e8c.png',
  '金枪鱼刺身': 'https://bu.dusays.com/2026/03/06/69aa6dcda36bc.png',
  '鲈鱼': 'https://bu.dusays.com/2026/03/06/69aa6dce153eb.png',
  '鳗鱼': 'https://bu.dusays.com/2026/03/06/69aa6dceaae2e.png',
  '深海鳕鱼柳': 'https://bu.dusays.com/2026/03/06/69aa6dd0afccf.png',
  '墨鱼': 'https://bu.dusays.com/2026/03/06/69aa6dd0dd96a.png',
  '马鲛鱼': 'https://bu.dusays.com/2026/03/06/69aa6dd140b4a.png',
  '三文鱼刺身套餐': 'https://bu.dusays.com/2026/03/06/69aa6dd15b28e.png',
  '秋刀鱼': 'https://bu.dusays.com/2026/03/06/69aa6dd1c6acd.png',
  '扇贝': 'https://bu.dusays.com/2026/03/06/69aa6dd1d7cb4.png',
  '生蚝': 'https://bu.dusays.com/2026/03/06/69aa6dd219232.png',
  '皮皮虾': 'https://bu.dusays.com/2026/03/06/69aa6dd2a191d.png',
  '石斑鱼': 'https://bu.dusays.com/2026/03/06/69aa6dd3139dc.png',
  '梭子蟹': 'https://bu.dusays.com/2026/03/06/69aa6dd45f7f4.png',
  '鱼丸': 'https://bu.dusays.com/2026/03/06/69aa6dd4a9ed0.png',
  '小龙虾': 'https://bu.dusays.com/2026/03/06/69aa6dd4ca84c.png',
  '鱼豆腐': 'https://bu.dusays.com/2026/03/06/69aa6dd50b875.png',
  '鱿鱼': 'https://bu.dusays.com/2026/03/06/69aa6dd60bfb9.png',
  '鱼片': 'https://bu.dusays.com/2026/03/06/69aa6dd620ab0.png',
  '鱼皮': 'https://bu.dusays.com/2026/03/06/69aa6dd664981.png',
  '鱼头': 'https://bu.dusays.com/2026/03/06/69aa6dd66bb64.png',
  '鱼籽': 'https://bu.dusays.com/2026/03/06/69aa6dd6a8f19.png',
  '章鱼': 'https://bu.dusays.com/2026/03/06/69aa6dd6b1241.png',
};

async function updateProductImages() {
  let connection;
  try {
    console.log('正在连接数据库...');
    connection = await mysql.createConnection(config);
    console.log('数据库连接成功！');

    let updatedCount = 0;
    let notFoundCount = 0;

    for (const [fishName, imageUrl] of Object.entries(fishImages)) {
      try {
        // 检查商品是否存在
        const [checkResult] = await connection.query(
          'SELECT id, name FROM fish_product WHERE name = ?',
          [fishName]
        );

        if (checkResult.length > 0) {
          // 更新图片路径
          await connection.query(
            'UPDATE fish_product SET imageUrls = ? WHERE name = ?',
            [JSON.stringify([imageUrl]), fishName]
          );
          console.log(`✅ 已更新：${fishName}`);
          updatedCount++;
        } else {
          console.log(`⚠️  未找到商品：${fishName}`);
          notFoundCount++;
        }
      } catch (error) {
        console.error(`❌ 更新失败：${fishName}`, error.message);
      }
    }

    console.log('\n📊 更新统计:');
    console.log(`   - 成功更新：${updatedCount} 个商品`);
    console.log(`   - 未找到：${notFoundCount} 个商品`);
    console.log(`   - 总计：${Object.keys(fishImages).length} 个图片路径`);

    // 验证更新结果
    const [verifyResult] = await connection.query(
      'SELECT name, imageUrls FROM fish_product WHERE imageUrls IS NOT NULL AND imageUrls != \'[""]\''
    );
    console.log(`\n✅ 当前有 ${verifyResult.length} 个商品已配置图片`);

  } catch (error) {
    console.error('❌ 执行失败:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n提示：请确保 MySQL 服务正在运行');
      console.error('如果使用 Docker，请运行：docker-compose up -d mysql');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n提示：数据库用户名或密码错误');
      console.error('请检查环境变量：DB_USERNAME, DB_PASSWORD');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n数据库连接已关闭');
    }
  }
}

updateProductImages();
