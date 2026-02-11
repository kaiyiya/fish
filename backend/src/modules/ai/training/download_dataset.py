"""
下载鱼类图像数据集脚本

从公开数据集下载鱼类图片，用于训练模型
支持从多个来源下载数据
"""

import os
import urllib.request
import zipfile
import shutil
from pathlib import Path

DATA_DIR = "./data/fish_images"
KAGGLE_DATASET_URL = "https://www.kaggle.com/datasets/crowww/a-large-scale-fish-dataset/download"
FISH4KNOWLEDGE_URL = "https://groups.inf.ed.ac.uk/f4k/"

def create_sample_structure():
    """创建示例目录结构，用于测试"""
    os.makedirs(DATA_DIR, exist_ok=True)
    
    # 创建几个常见的鱼类类别目录
    categories = ['salmon', 'sea_bass', 'tuna', 'carp', 'trout']
    for category in categories:
        category_path = os.path.join(DATA_DIR, category)
        os.makedirs(category_path, exist_ok=True)
        print(f"✅ 创建目录: {category_path}")
    
    print(f"\n📁 数据集目录结构已创建: {DATA_DIR}")
    print("⚠️  请将鱼类图片按类别放入对应目录中")
    print("   例如: data/fish_images/salmon/xxx.jpg")
    print("\n💡 建议从以下来源获取数据:")
    print("   1. Kaggle: https://www.kaggle.com/datasets/crowww/a-large-scale-fish-dataset")
    print("   2. Fish4Knowledge: https://groups.inf.ed.ac.uk/f4k/")
    print("   3. 自己拍摄并标注（每类至少50张图片）")

def download_from_url(url, dest_path):
    """从URL下载文件"""
    try:
        print(f"📥 正在下载: {url}")
        urllib.request.urlretrieve(url, dest_path)
        print(f"✅ 下载完成: {dest_path}")
        return True
    except Exception as e:
        print(f"❌ 下载失败: {e}")
        return False

def extract_zip(zip_path, extract_to):
    """解压zip文件"""
    try:
        print(f"📦 正在解压: {zip_path}")
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_to)
        print(f"✅ 解压完成: {extract_to}")
        return True
    except Exception as e:
        print(f"❌ 解压失败: {e}")
        return False

def main():
    print("🐟 鱼类图像数据集准备工具\n")
    
    # 检查是否已有数据
    if os.path.exists(DATA_DIR) and os.listdir(DATA_DIR):
        print(f"✅ 数据集目录已存在: {DATA_DIR}")
        categories = [d for d in os.listdir(DATA_DIR) if os.path.isdir(os.path.join(DATA_DIR, d))]
        if categories:
            print(f"📊 发现 {len(categories)} 个类别: {', '.join(categories)}")
            total_images = sum(
                len([f for f in os.listdir(os.path.join(DATA_DIR, cat)) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
                for cat in categories
            )
            print(f"🖼️  总计 {total_images} 张图片")
            
            if total_images > 0:
                print("\n✅ 数据集已准备就绪，可以开始训练！")
                print("   运行: python train_pytorch.py")
                return
    
    # 如果没有数据，创建目录结构
    print("📁 创建数据集目录结构...")
    create_sample_structure()
    
    print("\n" + "="*60)
    print("📝 下一步操作:")
    print("   1. 从上述来源下载鱼类图片数据集")
    print("   2. 将图片按类别放入对应目录")
    print("   3. 确保每类至少有 50 张图片")
    print("   4. 运行: python train_pytorch.py")
    print("="*60)

if __name__ == "__main__":
    main()
