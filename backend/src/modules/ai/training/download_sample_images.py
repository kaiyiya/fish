"""
下载示例鱼类图片用于训练
使用公开的图片API或本地资源
"""

import os
import urllib.request
import json
from pathlib import Path
import time

DATA_DIR = "./data/fish_images"

# 使用一些公开的图片URL作为示例（实际使用时建议替换为真实数据集）
SAMPLE_IMAGES = {
    'salmon': [
        # 这些是示例URL，实际使用时需要替换为真实的鱼类图片
        # 可以从Kaggle数据集或其他来源获取
    ],
    'sea_bass': [],
    'tuna': [],
    'carp': [],
    'trout': [],
    'cod': [],
    'mackerel': [],
    'sardine': [],
}

def download_image(url, save_path, max_retries=3):
    """下载单张图片"""
    for attempt in range(max_retries):
        try:
            urllib.request.urlretrieve(url, save_path)
            return True
        except Exception as e:
            if attempt < max_retries - 1:
                time.sleep(1)
                continue
            print(f"  下载失败: {e}")
            return False
    return False

def create_placeholder_info():
    """创建占位信息，提示用户如何添加数据"""
    info_file = os.path.join(DATA_DIR, "README.txt")
    with open(info_file, 'w', encoding='utf-8') as f:
        f.write("""鱼类图像数据集说明
==================

目录结构：
每个类别文件夹中应包含该类别鱼类的图片文件。

支持的图片格式：
- .jpg / .jpeg
- .png
- .bmp

数据来源建议：
1. Kaggle数据集（推荐）：
   https://www.kaggle.com/datasets/crowww/a-large-scale-fish-dataset
   
2. 自己收集：
   - 使用搜索引擎搜索"salmon fish"、"sea bass fish"等关键词
   - 下载图片后按类别放入对应文件夹
   - 每类至少准备 20-50 张图片

3. 快速测试：
   - 每类准备 10-20 张图片即可开始测试训练
   - 后续可以逐步增加数据量

添加图片后，运行：
python train_pytorch.py

或使用批处理文件：
训练.bat
""")
    print(f"[OK] 创建说明文件: {info_file}")

def check_existing_images():
    """检查已有图片数量"""
    categories = os.listdir(DATA_DIR) if os.path.exists(DATA_DIR) else []
    total = 0
    category_counts = {}
    
    for cat in categories:
        cat_path = os.path.join(DATA_DIR, cat)
        if os.path.isdir(cat_path):
            images = [f for f in os.listdir(cat_path) 
                     if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp'))]
            count = len(images)
            category_counts[cat] = count
            total += count
    
    return total, category_counts

def main():
    print("="*60)
    print("鱼类图像数据集准备工具")
    print("="*60)
    print()
    
    # 检查已有数据
    total, counts = check_existing_images()
    
    if total > 0:
        print(f"[INFO] 发现已有数据: 总计 {total} 张图片")
        for cat, count in counts.items():
            if count > 0:
                print(f"  {cat}: {count} 张")
        print()
        print("[OK] 数据集已准备，可以直接开始训练！")
        print("运行: python train_pytorch.py")
        return
    
    print("[INFO] 数据集目录为空")
    print()
    print("="*60)
    print("数据准备指南")
    print("="*60)
    print()
    print("方法1：从Kaggle下载（推荐）")
    print("  1. 访问: https://www.kaggle.com/datasets/crowww/a-large-scale-fish-dataset")
    print("  2. 下载数据集（需要Kaggle账号）")
    print("  3. 解压后，将图片按类别整理到以下目录：")
    print(f"     {os.path.abspath(DATA_DIR)}/")
    print()
    print("方法2：手动收集图片")
    print("  1. 打开浏览器，搜索各类鱼类图片")
    print("  2. 例如搜索：")
    print("     - 'salmon fish images'")
    print("     - 'sea bass fish images'")
    print("     - 'tuna fish images'")
    print("  3. 下载图片后，按类别放入对应文件夹")
    print("  4. 每类至少准备 20-50 张图片")
    print()
    print("方法3：快速测试（最少数据）")
    print("  1. 每类准备 10-20 张图片即可开始测试")
    print("  2. 可以从以下网站收集：")
    print("     - Google Images")
    print("     - Bing Images")
    print("     - 或其他图片搜索引擎")
    print()
    print("="*60)
    print()
    
    # 创建说明文件
    create_placeholder_info()
    
    print(f"[INFO] 数据集目录: {os.path.abspath(DATA_DIR)}")
    print()
    print("[TIP] 准备好数据后，运行以下命令开始训练：")
    print("  python train_pytorch.py")
    print("  或")
    print("  训练.bat")

if __name__ == "__main__":
    main()
