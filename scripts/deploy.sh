#!/bin/bash

# Docker部署脚本
# 使用方法: ./scripts/deploy.sh [dev|prod]

set -e

ENV=${1:-prod}

echo "🚀 开始部署 - 环境: $ENV"

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

# 检查.env文件
if [ ! -f .env ]; then
    echo "⚠️  .env文件不存在，从.env.example复制..."
    cp .env.example .env
    echo "✅ 请编辑.env文件后重新运行此脚本"
    exit 1
fi

# 停止并删除旧容器
echo "🛑 停止现有容器..."
docker-compose down

# 清理旧镜像（可选）
if [ "$ENV" = "prod" ]; then
    echo "🧹 清理旧镜像..."
    docker-compose build --no-cache
fi

# 启动服务
echo "📦 启动服务..."
if [ "$ENV" = "dev" ]; then
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
else
    docker-compose up -d
fi

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "🔍 检查服务状态..."
docker-compose ps

# 查看日志
echo "📋 查看后端日志..."
docker-compose logs backend --tail=50

echo "✅ 部署完成！"
echo "📍 后端API: http://localhost:3000"
echo "📍 健康检查: http://localhost:3000/health"
echo ""
echo "查看日志: docker-compose logs -f [service_name]"
echo "停止服务: docker-compose down"
echo "重启服务: docker-compose restart [service_name]"
