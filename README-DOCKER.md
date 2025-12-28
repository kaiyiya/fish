# Docker 部署指南

## 前置要求

- Docker >= 20.10
- Docker Compose >= 2.0

## 快速开始

### 1. 配置环境变量

复制环境变量示例文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，修改必要的配置（数据库密码、JWT密钥等）

### 2. 启动服务

**生产环境：**
```bash
# 使用部署脚本
chmod +x scripts/deploy.sh
./scripts/deploy.sh prod

# 或直接使用docker-compose
docker-compose up -d
```

**开发环境：**
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### 3. 查看服务状态

```bash
docker-compose ps
```

### 4. 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f mysql
docker-compose logs -f redis
```

### 5. 停止服务

```bash
docker-compose down

# 同时删除数据卷（谨慎使用）
docker-compose down -v
```

## 服务说明

### 后端服务 (backend)
- 端口: 3000
- 健康检查: http://localhost:3000/health
- 数据卷:
  - `./backend/uploads` - 上传文件目录
  - `./backend/logs` - 日志目录

### MySQL数据库 (mysql)
- 端口: 3306
- 数据库名: fish_app
- 数据卷: `mysql_data` (持久化存储)

### Redis缓存 (redis)
- 端口: 6379
- 数据卷: `redis_data` (持久化存储)

### Nginx反向代理 (nginx) - 可选
- HTTP端口: 80
- HTTPS端口: 443
- 配置文件: `./nginx/conf.d/default.conf`

启用Nginx:
```bash
docker-compose --profile nginx up -d
```

## 常用命令

### 进入容器

```bash
# 进入后端容器
docker-compose exec backend sh

# 进入MySQL容器
docker-compose exec mysql mysql -u root -p

# 进入Redis容器
docker-compose exec redis redis-cli
```

### 数据库操作

```bash
# 备份数据库
docker-compose exec mysql mysqldump -u root -p fish_app > backup.sql

# 恢复数据库
docker-compose exec -T mysql mysql -u root -p fish_app < backup.sql

# 执行SQL
docker-compose exec mysql mysql -u root -p fish_app -e "SHOW TABLES;"
```

### 更新服务

```bash
# 重新构建并启动
docker-compose up -d --build

# 只重启特定服务
docker-compose restart backend
```

### 查看资源使用

```bash
docker-compose top
docker stats
```

## 生产环境优化

### 1. 安全配置

- 修改所有默认密码
- 使用强JWT密钥
- 配置HTTPS（使用Nginx）
- 限制数据库访问（仅内部网络）

### 2. 性能优化

- 配置MySQL连接池
- 启用Redis缓存
- 配置Nginx负载均衡（多实例）
- 使用CDN加速静态资源

### 3. 监控和日志

- 配置日志收集（ELK Stack）
- 使用监控工具（Prometheus + Grafana）
- 设置告警通知

### 4. 备份策略

- 定期备份数据库
- 备份上传文件
- 使用Docker卷备份

```bash
# 备份MySQL数据卷
docker run --rm -v fish-app_mysql_data:/data -v $(pwd):/backup alpine tar czf /backup/mysql_backup.tar.gz /data

# 恢复MySQL数据卷
docker run --rm -v fish-app_mysql_data:/data -v $(pwd):/backup alpine tar xzf /backup/mysql_backup.tar.gz -C /
```

## 故障排查

### 服务无法启动

1. 检查端口是否被占用
2. 查看日志：`docker-compose logs [service_name]`
3. 检查环境变量配置
4. 验证Docker资源是否充足

### 数据库连接失败

1. 检查MySQL容器是否正常运行
2. 验证数据库配置信息
3. 检查网络连接：`docker-compose exec backend ping mysql`

### 权限问题

1. 确保上传目录有写权限
2. 检查文件所有者：`ls -la backend/uploads`

## 开发环境

开发时可以使用docker-compose启动基础服务（MySQL、Redis），后端服务在本地运行：

```bash
# 只启动基础服务
docker-compose -f docker-compose.dev.yml up -d

# 在本地运行后端（需要先安装依赖）
cd backend
npm install
npm run start:dev
```

这样可以快速调试，同时享受Docker带来的数据库和Redis服务。
