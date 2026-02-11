"""
下载鱼类图像数据集
从公开来源下载或创建示例数据集用于训练
"""

import os
import urllib.request
import json
from pathlib import Path

DATA_DIR = "./data/fish_images"

def create_dataset_structure():
    """创建数据集目录结构"""
    os.makedirs(DATA_DIR, exist_ok=True)
    
    # 定义常见的鱼类类别
    categories = [
        'salmon',      # 三文鱼
        'sea_bass',   # 鲈鱼
        'tuna',       # 金枪鱼
        'carp',       # 鲤鱼
        'trout',      # 鳟鱼
        'cod',        # 鳕鱼
        'mackerel',   # 鲭鱼
        'sardine',    # 沙丁鱼
    ]
    
    for category in categories:
        category_path = os.path.join(DATA_DIR, category)
        os.makedirs(category_path, exist_ok=True)
        print(f"[OK] 创建目录: {category_path}")
    
    return categories

def download_images_from_unsplash():
    """
    从Unsplash下载示例图片
    注意：这只是示例，实际训练建议使用专业的鱼类数据集
    """
    print("[INFO] 正在从Unsplash下载示例图片...")
    print("[WARN] 注意：这些是示例图片，建议使用专业的鱼类数据集进行训练")
    
    # 使用Unsplash API（需要API key）或直接使用公开图片URL
    # 这里我们创建一个脚本，让用户知道如何获取数据
    
    categories = {
        'salmon': [
            'https://images.unsplash.com/photo-1544947950-fa07a98d237f',
            'https://images.unsplash.com/photo-1574781330855-d0db8cc4a0d4',
        ],
        'sea_bass': [
            'https://images.unsplash.com/photo-1559827260-dc66d52bef19',
        ],
    }
    
    print("[TIP] 建议从以下来源获取数据集：")
    print("   1. Kaggle: https://www.kaggle.com/datasets/crowww/a-large-scale-fish-dataset")
    print("   2. 自己拍摄并标注")
    print("   3. 使用搜索引擎收集图片")
    
    return False

def create_sample_data_info():
    """创建数据集说明文件"""
    info = {
        "dataset_info": {
            "name": "Fish Classification Dataset",
            "description": "鱼类图像分类数据集",
            "categories": [
                "salmon - 三文鱼",
                "sea_bass - 鲈鱼",
                "tuna - 金枪鱼",
                "carp - 鲤鱼",
                "trout - 鳟鱼",
                "cod - 鳕鱼",
                "mackerel - 鲭鱼",
                "sardine - 沙丁鱼"
            ],
            "recommended_images_per_class": 50,
            "minimum_images_per_class": 20,
            "image_formats": ["jpg", "jpeg", "png"],
            "image_size": "224x224 or larger"
        },
        "data_sources": [
            "Kaggle: https://www.kaggle.com/datasets/crowww/a-large-scale-fish-dataset",
            "Fish4Knowledge: https://groups.inf.ed.ac.uk/f4k/",
            "Custom: 自己拍摄并标注"
        ]
    }
    
    info_path = os.path.join(DATA_DIR, "dataset_info.json")
    with open(info_path, 'w', encoding='utf-8') as f:
        json.dump(info, f, ensure_ascii=False, indent=2)
    
    print(f"[OK] 创建数据集说明文件: {info_path}")
    return info

def main():
    print("鱼类图像数据集准备工具\n")
    
    # 创建目录结构
    categories = create_dataset_structure()
    
    # 检查是否已有数据
    has_data = False
    total_images = 0
    
    for category in categories:
        cat_path = os.path.join(DATA_DIR, category)
        if os.path.exists(cat_path):
            images = [f for f in os.listdir(cat_path) 
                     if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp'))]
            count = len(images)
            if count > 0:
                has_data = True
                total_images += count
                print(f"  {category}: {count} 张图片")
    
    if has_data:
        print(f"\n[OK] 数据集已存在，总计 {total_images} 张图片")
        print("   可以直接开始训练！")
    else:
        print("\n[INFO] 数据集目录已创建，但还没有图片")
        print("\n" + "="*60)
        print("数据集准备方法：")
        print("="*60)
        print("\n方法1：从Kaggle下载（推荐）")
        print("   1. 访问: https://www.kaggle.com/datasets/crowww/a-large-scale-fish-dataset")
        print("   2. 下载数据集")
        print("   3. 解压后按类别整理到以下目录：")
        print(f"      {os.path.abspath(DATA_DIR)}/")
        print("\n方法2：自己收集图片")
        print("   1. 使用搜索引擎搜索各类鱼类图片")
        print("   2. 下载后按类别放入对应文件夹")
        print("   3. 每类至少准备 20-50 张图片")
        print("\n方法3：使用手机拍摄")
        print("   1. 拍摄各类鱼类的照片")
        print("   2. 按类别整理到对应文件夹")
        print("="*60)
    
    # 创建说明文件
    create_sample_data_info()
    
    print(f"\n数据集目录: {os.path.abspath(DATA_DIR)}")
    print("\n准备好数据后，运行: python train_pytorch.py")

if __name__ == "__main__":
    main()
