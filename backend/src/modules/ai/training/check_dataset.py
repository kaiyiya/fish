"""
检查数据集是否存在，如果不存在则提供下载指南
"""

import os
from pathlib import Path

DATA_DIR = "./data/fish_images"

def check_dataset():
    """检查数据集"""
    if not os.path.exists(DATA_DIR):
        print(f"❌ 数据集目录不存在: {DATA_DIR}")
        return False
    
    categories = [d for d in os.listdir(DATA_DIR) 
                  if os.path.isdir(os.path.join(DATA_DIR, d))]
    
    if not categories:
        print(f"❌ 数据集目录为空: {DATA_DIR}")
        return False
    
    print(f"[OK] 找到 {len(categories)} 个类别: {', '.join(categories)}")
    
    total_images = 0
    for cat in categories:
        cat_path = os.path.join(DATA_DIR, cat)
        images = [f for f in os.listdir(cat_path) 
                  if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp'))]
        count = len(images)
        total_images += count
        print(f"   {cat}: {count} 张图片")
    
    if total_images == 0:
        print("[ERROR] 没有找到图片文件")
        return False
    
    print(f"\n[OK] 总计 {total_images} 张图片")
    
    if total_images < 100:
        print("[WARN] 图片数量较少，建议至少准备 100+ 张图片以获得更好的训练效果")
    
    return True

def print_guide():
    """打印数据集准备指南"""
    print("\n" + "="*60)
    print("数据集准备指南")
    print("="*60)
    print("\n1. 数据集目录结构:")
    print(f"   {os.path.abspath(DATA_DIR)}/")
    print("   ├── salmon/")
    print("   │   ├── image1.jpg")
    print("   │   └── image2.jpg")
    print("   ├── sea_bass/")
    print("   └── tuna/")
    print("\n2. 推荐数据来源:")
    print("   - Kaggle: https://www.kaggle.com/datasets/crowww/a-large-scale-fish-dataset")
    print("   - 自己拍摄并标注（每类至少50张）")
    print("\n3. 快速测试（使用少量数据）:")
    print("   可以先用少量图片（每类10-20张）进行测试训练")
    print("="*60)

if __name__ == "__main__":
    print("检查数据集...\n")
    
    if not check_dataset():
        print_guide()
        print("\n[ERROR] 请先准备数据集后再运行训练")
        exit(1)
    else:
        print("\n[OK] 数据集已准备就绪，可以开始训练！")
        exit(0)
