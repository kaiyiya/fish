@echo off
chcp 65001 >nul
echo 🐟 鱼类识别模型训练脚本
echo.

REM 检查conda环境
where conda >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未找到conda，请先安装Anaconda或Miniconda
    pause
    exit /b 1
)

echo ✅ 找到conda环境
echo.

REM 激活conda环境（如果存在fish-ai环境）
call conda activate fish-ai 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  fish-ai环境不存在，使用当前Python环境
)

REM 检查Python
python --version
if %errorlevel% neq 0 (
    echo ❌ Python未安装或不在PATH中
    pause
    exit /b 1
)

echo.
echo 📁 检查数据集...
python check_dataset.py

echo.
echo 🚀 开始训练模型...
python train_pytorch.py

pause
