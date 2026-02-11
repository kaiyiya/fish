"""
获取训练数据的实用工具
"""

import os
import webbrowser
import json

DATA_DIR = "./data/fish_images"

def main():
    print("="*60)
    print("获取训练数据 - 推荐方法")
    print("="*60)
    print()
    
    print("方法1: Kaggle数据集（最推荐）")
    print("  - 数据质量高，数量充足")
    print("  - 访问: https://www.kaggle.com/datasets/crowww/a-large-scale-fish-dataset")
    print()
    
    print("方法2: 手动收集（快速测试）")
    print("  - 打开浏览器，搜索图片")
    print("  - 搜索: 'salmon fish', 'sea bass fish' 等")
    print("  - 下载图片到对应类别文件夹")
    print()
    
    print("="*60)
    print()
    
    choice = input("是否打开Kaggle数据集页面？(y/n): ").strip().lower()
    
    if choice == 'y':
        url = "https://www.kaggle.com/datasets/crowww/a-large-scale-fish-dataset"
        print(f"\n[INFO] 正在打开: {url}")
        webbrowser.open(url)
        print("[OK] 浏览器已打开")
    
    print()
    print("="*60)
    print("数据目录位置")
    print("="*60)
    print(f"{os.path.abspath(DATA_DIR)}/")
    print()
    print("准备好数据后，运行: python train_pytorch.py")

if __name__ == "__main__":
    main()
