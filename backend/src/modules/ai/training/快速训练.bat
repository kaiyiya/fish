@echo off
chcp 65001 >nul
title 鱼类识别模型训练

echo ========================================
echo   鱼类识别模型训练工具
echo ========================================
echo.

REM 切换到脚本目录
cd /d "%~dp0"

echo 📍 当前目录: %CD%
echo.

REM 检查数据集
echo 🔍 检查数据集...
python check_dataset.py
if %errorlevel% neq 0 (
    echo.
    echo ❌ 数据集检查失败，请先准备数据集
    echo.
    echo 📝 数据集准备方法：
    echo    1. 在目录下创建 data\fish_images\ 文件夹
    echo    2. 在 fish_images 下创建类别文件夹（如 salmon, sea_bass 等）
    echo    3. 将对应类别的图片放入对应文件夹
    echo.
    echo 💡 数据来源：
    echo    - Kaggle: https://www.kaggle.com/datasets/crowww/a-large-scale-fish-dataset
    echo    - 或自己拍摄（每类至少50张图片）
    echo.
    pause
    exit /b 1
)

echo.
echo 🚀 开始训练模型...
echo    这可能需要一些时间，请耐心等待...
echo.

REM 运行训练
python train_pytorch.py

if %errorlevel% equ 0 (
    echo.
    echo ✅ 训练完成！
    echo.
    echo 📁 模型文件保存在: models\fish_classifier_resnet18.pth
    echo.
    echo 💡 下一步：
    echo    1. 重启后端服务
    echo    2. 在前端测试识别功能
    echo.
) else (
    echo.
    echo ❌ 训练失败，请检查错误信息
    echo.
)

pause
