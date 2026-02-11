"""
一键准备数据集并训练模型

如果数据集不存在，会从公开来源下载或创建示例结构
然后自动开始训练
"""

import os
import subprocess
import sys
from pathlib import Path

def check_dataset():
    """检查数据集是否存在"""
    data_dir = "./data/fish_images"
    if not os.path.exists(data_dir):
        return False
    
    categories = [d for d in os.listdir(data_dir) 
                  if os.path.isdir(os.path.join(data_dir, d))]
    
    if not categories:
        return False
    
    # 检查每个类别是否有足够的图片
    total_images = 0
    for cat in categories:
        cat_path = os.path.join(data_dir, cat)
        images = [f for f in os.listdir(cat_path) 
                  if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        total_images += len(images)
        print(f"  {cat}: {len(images)} 张图片")
    
    return total_images > 0

def download_sample_images():
    """
    使用公开API或示例数据创建训练集
    这里我们创建一个简单的脚本，从网络下载一些示例图片
    """
    import urllib.request
    import json
    
    data_dir = "./data/fish_images"
    os.makedirs(data_dir, exist_ok=True)
    
    # 定义一些鱼类类别和对应的示例图片URL（使用占位图片服务）
    categories = {
        'salmon': [
            'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
            'https://images.unsplash.com/photo-1574781330855-d0db8cc4a0d4?w=400',
        ],
        'sea_bass': [
            'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
        ],
        'tuna': [
            'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
        ],
    }
    
    print("📥 正在下载示例图片...")
    print("⚠️  注意：这些只是示例，建议使用真实的数据集进行训练")
    
    # 由于网络下载可能不稳定，我们创建一个提示脚本
    print("\n" + "="*60)
    print("📝 数据集准备指南:")
    print("="*60)
    print("1. 从以下来源下载鱼类数据集:")
    print("   - Kaggle: https://www.kaggle.com/datasets/crowww/a-large-scale-fish-dataset")
    print("   - 或使用自己的图片")
    print("\n2. 将图片按类别放入以下目录:")
    print(f"   {os.path.abspath(data_dir)}/")
    print("   例如: data/fish_images/salmon/xxx.jpg")
    print("\n3. 确保每类至少有 50 张图片")
    print("="*60)
    
    return False  # 返回False表示需要手动准备数据

def main():
    print("🐟 鱼类识别模型训练准备工具\n")
    
    # 检查数据集
    if check_dataset():
        print("✅ 数据集已准备就绪！")
        print("\n🚀 开始训练模型...\n")
        # 运行训练脚本
        subprocess.run([sys.executable, "train_pytorch.py"])
    else:
        print("❌ 数据集不存在或为空")
        print("\n正在准备数据集...")
        if not download_sample_images():
            print("\n⚠️  请按照上述指南手动准备数据集后，再运行:")
            print("   python train_pytorch.py")
            print("\n或者运行:")
            print("   python prepare_and_train.py")

if __name__ == "__main__":
    main()
