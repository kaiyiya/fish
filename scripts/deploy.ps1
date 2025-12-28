# Docker部署脚本 (Windows PowerShell版本)
# 使用方法: .\scripts\deploy.ps1 [dev|prod]

param(
    [Parameter(Position=0)]
    [ValidateSet("dev","prod")]
    [string]$Env = "prod"
)

Write-Host "🚀 开始部署 - 环境: $Env" -ForegroundColor Green

# 检查Docker是否安装
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker未安装，请先安装Docker Desktop" -ForegroundColor Red
    exit 1
}

if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Compose未安装，请先安装Docker Desktop" -ForegroundColor Red
    exit 1
}

# 检查.env文件
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env文件不存在，从.env.example复制..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ 请编辑.env文件后重新运行此脚本" -ForegroundColor Yellow
        exit 1
    } else {
        Write-Host "❌ .env.example文件也不存在" -ForegroundColor Red
        exit 1
    }
}

# 停止并删除旧容器
Write-Host "🛑 停止现有容器..." -ForegroundColor Yellow
docker-compose down

# 清理旧镜像（可选）
if ($Env -eq "prod") {
    Write-Host "🧹 清理旧镜像..." -ForegroundColor Yellow
    docker-compose build --no-cache
}

# 启动服务
Write-Host "📦 启动服务..." -ForegroundColor Yellow
if ($Env -eq "dev") {
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
} else {
    docker-compose up -d
}

# 等待服务启动
Write-Host "⏳ 等待服务启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 检查服务状态
Write-Host "🔍 检查服务状态..." -ForegroundColor Yellow
docker-compose ps

# 查看日志
Write-Host "📋 查看后端日志..." -ForegroundColor Yellow
docker-compose logs backend --tail=50

Write-Host ""
Write-Host "✅ 部署完成！" -ForegroundColor Green
Write-Host "📍 后端API: http://localhost:3000" -ForegroundColor Cyan
Write-Host "📍 健康检查: http://localhost:3000/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "常用命令:" -ForegroundColor Yellow
Write-Host "  查看日志: docker-compose logs -f [service_name]" -ForegroundColor White
Write-Host "  停止服务: docker-compose down" -ForegroundColor White
Write-Host "  重启服务: docker-compose restart [service_name]" -ForegroundColor White
