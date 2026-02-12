-- 修复 favorite 表的外键索引
-- 问题：外键使用单独的索引，但复合索引已经包含该字段

-- 如果外键索引已经使用外键名称，则不需要执行此脚本
-- 检查：SHOW INDEX FROM favorite;

-- 如果需要修复，执行以下步骤：

-- 1. 删除外键约束
ALTER TABLE favorite DROP FOREIGN KEY IF EXISTS FK_b8e337759b77baa0a4055d1894e;
ALTER TABLE favorite DROP FOREIGN KEY IF EXISTS FK_83b775fdebbe24c29b2b5831f2d;

-- 2. 删除单独的索引（如果存在）
DROP INDEX IF EXISTS IDX_b8e337759b77baa0a4055d1894 ON favorite;

-- 3. 重新创建外键约束（MySQL 会自动创建索引，使用外键名称）
ALTER TABLE favorite ADD CONSTRAINT FK_b8e337759b77baa0a4055d1894e FOREIGN KEY (productId) REFERENCES fish_product(id);
ALTER TABLE favorite ADD CONSTRAINT FK_83b775fdebbe24c29b2b5831f2d FOREIGN KEY (userId) REFERENCES user(id);

-- 注意：MySQL 会为外键自动创建索引，使用外键名称作为索引名称
-- 这样 TypeORM 就不会尝试删除这些索引了
