-- 将示例分类与商品由英文更新为中文展示文案
-- 在 MySQL 中执行一次即可生效
-- 使用方式（在后端容器里）：
--   mysql -u root -p fish_db < /scripts/update_products_zh.sql

-- 更新分类名称
UPDATE category
SET name = '海鱼'
WHERE name = 'sea_fish';

UPDATE category
SET name = '淡水鱼'
WHERE name = 'freshwater_fish';

UPDATE category
SET name = '深海鱼'
WHERE name = 'deep_sea_fish';

UPDATE category
SET name = '贝类/小海鲜'
WHERE name = 'shellfish';

-- 更新示例商品：三文鱼刺身套餐
UPDATE fish_product
SET
  name = '三文鱼刺身套餐',
  description = '优选挪威三文鱼，口感细腻，适合刺身或简单煎制。',
  nutritionInfo = '富含优质蛋白和 Omega-3 不饱和脂肪酸，有助于心血管健康。',
  cookingTips = '解冻后切片即可做刺身；也可两面小火煎至微焦，撒少许海盐和黑胡椒。'
WHERE name = 'Salmon Sashimi Set';

-- 深海鳕鱼柳
UPDATE fish_product
SET
  name = '深海鳕鱼柳',
  description = '来自阿拉斯加海域的鳕鱼柳，肉质细嫩、刺少，适合老人和小孩。',
  nutritionInfo = '高蛋白、低脂肪，含有多种维生素和微量元素。',
  cookingTips = '推荐清蒸、煎烤或香煎，搭配柠檬汁或简单胡椒调味即可。'
WHERE name = 'Deep Sea Cod Fillet';

-- 清蒸桂鱼
UPDATE fish_product
SET
  name = '清蒸桂鱼',
  description = '新鲜桂鱼一条，肉质细嫩，是经典清蒸鱼的首选。',
  nutritionInfo = '营养均衡，口感清淡细腻，适合家庭日常饮食。',
  cookingTips = '在鱼身划花刀，铺姜丝和葱段，大火蒸 8-10 分钟，出锅后淋上热油和蒸鱼豉油。'
WHERE name = 'Steamed Mandarin Fish';

-- 麻辣小龙虾
UPDATE fish_product
SET
  name = '麻辣小龙虾',
  description = '秘制配方腌制入味的小龙虾，到手加热即可享用。',
  nutritionInfo = '富含蛋白质和多种微量元素，是夜宵聚会的热门选择。',
  cookingTips = '建议小火加热至汤汁微微翻滚即可，搭配冰镇饮料风味更佳。'
WHERE name = 'Spicy Crayfish';

