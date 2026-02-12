-- 数据库初始化脚本
-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS fish_app 
  DEFAULT CHARACTER SET utf8mb4 
  DEFAULT COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE fish_app;

SET time_zone = '+08:00';

-- 说明：
-- 表结构由 TypeORM 在后端启动时自动创建
-- 示例数据请在表创建完成后，手动执行 backend/scripts/seed_products.sql
