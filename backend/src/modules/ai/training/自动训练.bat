@echo off
chcp 65001 >nul
title 自动训练鱼类识别模型

echo ========================================
echo   自动训练鱼类识别模型
echo ========================================
echo.

REM 切换到脚本目录
cd /d "%~dp0"

echo [INFO] 当前目录: %CD%
echo.

REM 设置Conda环境路径
set CONDA_ENV=D:\Anaconda\envs\pytorch

echo [1/5] 检查Conda环境...
if not exist "%CONDA_ENV%" (
    echo [ERROR] Conda环境不存在: %CONDA_ENV%
    pause
    exit /b 1
)
echo [OK] 找到Conda环境
echo.

echo [2/5] 检查数据集...
call "%CONDA_ENV%\Scripts\activate.bat" %CONDA_ENV%
python download_sample_images.py
echo.

echo [3/5] 检查数据集状态...
python check_dataset.py
if %errorlevel% neq 0 (
    echo.
    echo [WARN] 数据集检查失败
    echo.
    echo 请先准备数据集：
    echo   1. 从Kaggle下载: https://www.kaggle.com/datasets/crowww/a-large-scale-fish-dataset
    echo   2. 或手动收集图片放入 data\fish_images\ 对应类别文件夹
    echo   3. 每类至少准备 10-20 张图片
    echo.
    echo 准备好数据后，再次运行此脚本
    pause
    exit /b 1
)
echo.

echo [4/5] 检查PyTorch...
python -c "import torch; print(f'PyTorch版本: {torch.__version__}')" 2>nul
if %errorlevel% neq 0 (
    echo [INFO] 正在安装PyTorch...
    pip install torch torchvision pillow -q
    if %errorlevel% neq 0 (
        echo [ERROR] PyTorch安装失败
        pause
        exit /b 1
    )
)
echo.

echo [5/5] 开始训练模型...
echo [INFO] 这可能需要一些时间，请耐心等待...
echo.

python train_pytorch.py

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo [SUCCESS] 训练完成！
    echo ========================================
    echo.
    echo 模型文件已保存到:
    echo   models\fish_classifier_resnet18.pth
    echo   models\class_to_idx.pt
    echo.
    echo 下一步：
    echo   1. 重启后端服务
    echo   2. 在前端测试识别功能
    echo.
) else (
    echo.
    echo [ERROR] 训练失败
    echo.
    echo 可能的原因：
    echo   1. 数据集格式不正确
    echo   2. 图片数量太少
    echo   3. 内存不足（可以减小BATCH_SIZE）
    echo.
)

pause
