# Makefile for Docker部署（跨平台支持）

.PHONY: help build up down restart logs ps clean dev prod

help: ## 显示帮助信息
	@echo "可用命令:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## 构建Docker镜像
	docker-compose build

up: ## 启动所有服务（生产环境）
	docker-compose up -d

down: ## 停止所有服务
	docker-compose down

restart: ## 重启所有服务
	docker-compose restart

logs: ## 查看所有服务日志
	docker-compose logs -f

ps: ## 查看服务状态
	docker-compose ps

clean: ## 清理所有容器和镜像（谨慎使用）
	docker-compose down -v
	docker system prune -f

dev: ## 启动开发环境（只启动基础服务）
	docker-compose -f docker-compose.dev.yml up -d

prod: ## 启动生产环境
	docker-compose up -d

backend-logs: ## 查看后端日志
	docker-compose logs -f backend

mysql-logs: ## 查看MySQL日志
	docker-compose logs -f mysql

redis-logs: ## 查看Redis日志
	docker-compose logs -f redis

shell-backend: ## 进入后端容器
	docker-compose exec backend sh

shell-mysql: ## 进入MySQL容器
	docker-compose exec mysql mysql -u root -p

shell-redis: ## 进入Redis容器
	docker-compose exec redis redis-cli

backup-db: ## 备份数据库
	docker-compose exec mysql mysqldump -u root -p fish_app > backup_$(shell date +%Y%m%d_%H%M%S).sql

health: ## 检查服务健康状态
	@curl -s http://localhost:3000/health | python -m json.tool || echo "服务未运行"
