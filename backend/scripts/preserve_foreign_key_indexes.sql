-- 保留外键索引的说明
-- 
-- 问题：TypeORM 的 synchronize 试图删除被外键约束使用的索引
-- 原因：外键约束需要索引，但 TypeORM 可能认为这些索引是"多余的"
--
-- 解决方案：
-- 1. 在 database.module.ts 中设置 dropSchema: false（已设置）
-- 2. 确保实体定义中，对于有 @ManyToOne 关系的字段，不要手动添加 @Index()
--    TypeORM 会自动为外键创建索引
-- 3. 只保留类级别的复合索引，用于查询优化
--
-- 如果仍然遇到问题，可以：
-- 1. 暂时禁用 synchronize，手动管理数据库结构
-- 2. 或者使用 migrations 替代 synchronize

-- 查看外键及其索引
SELECT 
    kcu.CONSTRAINT_NAME,
    kcu.TABLE_NAME,
    kcu.COLUMN_NAME,
    s.INDEX_NAME
FROM information_schema.KEY_COLUMN_USAGE kcu
JOIN information_schema.STATISTICS s 
    ON kcu.TABLE_SCHEMA = s.TABLE_SCHEMA 
    AND kcu.TABLE_NAME = s.TABLE_NAME 
    AND kcu.COLUMN_NAME = s.COLUMN_NAME
WHERE kcu.TABLE_SCHEMA = 'fish_app' 
    AND kcu.CONSTRAINT_NAME LIKE 'FK_%'
ORDER BY kcu.TABLE_NAME, kcu.CONSTRAINT_NAME;
