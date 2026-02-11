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

REM 设置Conda环境路径
set CONDA_ENV=D:\Anaconda\envs\pytorch

echo 🔍 检查Conda环境...
if not exist "%CONDA_ENV%" (
    echo ❌ Conda环境不存在: %CONDA_ENV%
    echo.
    echo 💡 请检查环境路径是否正确
    pause
    exit /b 1
)

echo ✅ 找到Conda环境: %CONDA_ENV%
echo.

REM 激活Conda环境
echo 🔄 激活Conda环境...
call "%CONDA_ENV%\Scripts\activate.bat" %CONDA_ENV%

REM 检查Python
echo 🔍 检查Python环境...
python --version
if %errorlevel% neq 0 (
    echo ❌ Python未正确配置
    pause
    exit /b 1
)

echo.

REM 检查PyTorch
echo 🔍 检查PyTorch...
python -c "import torch; print(f'PyTorch版本: {torch.__version__}')" 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  PyTorch未安装，正在安装...
    pip install torch torchvision pillow
    if %errorlevel% neq 0 (
        echo ❌ PyTorch安装失败
        pause
        exit /b 1
    )
)

echo.

REM 准备数据集
echo 📁 准备数据集...
python download_fish_dataset.py
if %errorlevel% neq 0 (
    echo ⚠️  数据集准备脚本执行失败，继续检查现有数据集...
)

echo.

REM 检查数据集
echo 🔍 检查数据集...
python check_dataset.py
if %errorlevel% neq 0 (
    echo.
    echo ❌ 数据集检查失败
    echo.
    echo 📝 请先准备数据集：
    echo    1. 在 data\fish_images\ 目录下创建类别文件夹
    echo    2. 将对应类别的图片放入对应文件夹
    echo    3. 每类至少准备 20-50 张图片
    echo.
    echo 💡 数据来源：
    echo    - Kaggle: https://www.kaggle.com/datasets/crowww/a-large-scale-fish-dataset
    echo    - 或自己拍摄并标注
    echo.
    pause
    exit /b 1
)

echo.
echo 🚀 开始训练模型...
echo    这可能需要一些时间，请耐心等待...
echo    训练过程中会显示每个epoch的损失和准确率
echo.

REM 运行训练
python train_pytorch.py

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✅ 训练完成！
    echo ========================================
    echo.
    echo 📁 模型文件保存在:
    echo    models\fish_classifier_resnet18.pth
    echo    models\class_to_idx.pt
    echo.
    echo 💡 下一步操作：
    echo    1. 重启后端服务（如果正在运行）
    echo    2. 在前端测试识别功能
    echo    3. 如果识别效果不好，可以增加训练数据或训练轮数
    echo.
) else (
    echo.
    echo ❌ 训练失败，请检查错误信息
    echo.
    echo 💡 常见问题：
    echo    1. 数据集格式不正确
    echo    2. 图片数量太少
    echo    3. 内存不足（可以减小BATCH_SIZE）
    echo.
)

pause
