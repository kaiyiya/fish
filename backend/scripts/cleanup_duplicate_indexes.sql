-- 清理重复索引的SQL脚本
-- 如果遇到重复索引错误，可以运行此脚本清理

-- 注意：在执行前请备份数据库

-- 查看所有索引
-- SHOW INDEX FROM cart;
-- SHOW INDEX FROM favorite;
-- SHOW INDEX FROM address;
-- SHOW INDEX FROM review;
-- SHOW INDEX FROM user_behavior;
-- SHOW INDEX FROM notification;
-- SHOW INDEX FROM user_coupon;
-- SHOW INDEX FROM search_log;

-- 删除单个字段的重复索引（如果存在）
-- 这些索引在类级别已经定义了复合索引，所以单个字段索引是重复的

-- Cart表：删除userId和productId的单独索引（复合索引已包含）
DROP INDEX IF EXISTS IDX_cart_userId ON cart;
DROP INDEX IF EXISTS IDX_cart_productId ON cart;

-- Favorite表：删除userId和productId的单独索引
DROP INDEX IF EXISTS IDX_favorite_userId ON favorite;
DROP INDEX IF EXISTS IDX_favorite_productId ON favorite;

-- Address表：删除userId的单独索引（类级别已有）
DROP INDEX IF EXISTS IDX_address_userId ON address;

-- Review表：删除userId和productId的单独索引
DROP INDEX IF EXISTS IDX_review_userId ON review;
DROP INDEX IF EXISTS IDX_review_productId ON review;

-- UserBehavior表：删除userId和productId的单独索引
DROP INDEX IF EXISTS IDX_user_behavior_userId ON user_behavior;
DROP INDEX IF EXISTS IDX_user_behavior_productId ON user_behavior;

-- Notification表：删除userId的单独索引
DROP INDEX IF EXISTS IDX_notification_userId ON notification;

-- UserCoupon表：删除userId和couponId的单独索引
DROP INDEX IF EXISTS IDX_user_coupon_userId ON user_coupon;
DROP INDEX IF EXISTS IDX_user_coupon_couponId ON user_coupon;

-- SearchLog表：删除userId的单独索引
DROP INDEX IF EXISTS IDX_search_log_userId ON search_log;
