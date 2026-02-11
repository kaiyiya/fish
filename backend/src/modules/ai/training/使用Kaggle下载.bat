@echo off
chcp 65001 >nul
title 从Kaggle下载数据集

echo ========================================
echo   从Kaggle下载鱼类数据集
echo ========================================
echo.

echo [INFO] Kaggle数据集是最可靠的数据来源
echo.
echo 数据集地址:
echo https://www.kaggle.com/datasets/crowww/a-large-scale-fish-dataset
echo.
echo 下载步骤:
echo 1. 访问上述链接
echo 2. 注册/登录Kaggle账号（免费）
echo 3. 点击"Download"按钮下载数据集
echo 4. 解压下载的zip文件
echo 5. 将图片按类别整理到以下目录:
echo    backend\src\modules\ai\training\data\fish_images\
echo.
echo 或者使用Kaggle API（需要安装kaggle库）:
echo   pip install kaggle
echo   kaggle datasets download -d crowww/a-large-scale-fish-dataset
echo.
pause
