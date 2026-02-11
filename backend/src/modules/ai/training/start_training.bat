@echo off
chcp 65001 >nul
title 训练鱼类识别模型

echo ========================================
echo   开始训练鱼类识别模型
echo ========================================
echo.

cd /d "%~dp0"

set CONDA_ENV=D:\Anaconda\envs\pytorch

echo [INFO] 激活Conda环境...
call "%CONDA_ENV%\Scripts\activate.bat" %CONDA_ENV%

echo.
echo [INFO] 开始训练...
echo [INFO] 训练过程可能需要较长时间，请耐心等待
echo [INFO] 训练过程中会显示每个epoch的进度
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
    echo [ERROR] 训练失败，请检查错误信息
    echo.
)

pause
