-- 修复外键索引问题
-- TypeORM 的外键会自动创建索引，但索引名称可能与我们定义的不同
-- 这个脚本确保外键索引存在，避免 TypeORM 尝试删除它们

-- 查看所有外键及其索引
-- SELECT 
--     kcu.CONSTRAINT_NAME,
--     kcu.TABLE_NAME,
--     kcu.COLUMN_NAME,
--     s.INDEX_NAME
-- FROM information_schema.KEY_COLUMN_USAGE kcu
-- LEFT JOIN information_schema.STATISTICS s 
--     ON kcu.TABLE_SCHEMA = s.TABLE_SCHEMA 
--     AND kcu.TABLE_NAME = s.TABLE_NAME 
--     AND kcu.COLUMN_NAME = s.COLUMN_NAME
-- WHERE kcu.TABLE_SCHEMA = 'fish_app' 
--     AND kcu.CONSTRAINT_NAME LIKE 'FK_%';

-- 如果索引不存在，创建它们（但通常外键会自动创建索引）
-- 这里主要是确保索引存在

-- 注意：如果遇到 "Cannot drop index: needed in a foreign key constraint" 错误
-- 说明索引被外键使用，这是正常的，不应该删除

-- 解决方案：在实体定义中，对于有外键关系的字段，不要手动添加 @Index()
-- TypeORM 会自动为外键创建索引
