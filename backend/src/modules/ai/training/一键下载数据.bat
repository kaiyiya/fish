@echo off
chcp 65001 >nul
title 一键获取训练数据

echo ========================================
echo   一键获取训练数据
echo ========================================
echo.

echo [INFO] 由于版权和稳定性考虑，推荐以下方法：
echo.
echo 方法1: Kaggle数据集（最推荐）
echo   访问: https://www.kaggle.com/datasets/crowww/a-large-scale-fish-dataset
echo   下载后解压，按类别整理到 data\fish_images\ 文件夹
echo.
echo 方法2: 手动收集（快速）
echo   1. 打开浏览器，搜索图片
echo   2. 搜索: "salmon fish", "sea bass fish" 等
echo   3. 下载图片到对应类别文件夹
echo   4. 每类 10-20 张即可开始测试
echo.
echo ========================================
echo.

choice /C YN /M "是否打开Kaggle数据集页面"

if errorlevel 2 goto :skip
if errorlevel 1 start https://www.kaggle.com/datasets/crowww/a-large-scale-fish-dataset

:skip
echo.
echo [INFO] 数据目录位置:
echo   backend\src\modules\ai\training\data\fish_images\
echo.
echo [TIP] 准备好数据后，运行: 训练.bat
echo.
pause
