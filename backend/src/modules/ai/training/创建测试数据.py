"""
创建最小测试数据集
使用一些简单的示例图片URL或提示用户如何快速获取数据
"""

import os
import json

DATA_DIR = "./data/fish_images"

def create_quick_start_guide():
    """创建快速开始指南"""
    guide = """
快速开始训练 - 最小数据集方案
================================

由于直接从网络下载大量图片可能涉及版权和稳定性问题，
建议您使用以下方法快速准备数据：

方法1：使用Kaggle数据集（推荐，最快速）
----------------------------------------
1. 访问: https://www.kaggle.com/datasets/crowww/a-large-scale-fish-dataset
2. 注册/登录Kaggle账号
3. 下载数据集（约几百MB）
4. 解压后，将图片按类别整理到对应文件夹
5. 每类选择 20-50 张图片即可开始训练

方法2：手动收集（10-15分钟）
---------------------------
1. 打开浏览器，访问图片搜索引擎
2. 搜索以下关键词，下载图片：
   - "salmon fish" → 放入 salmon/ 文件夹
   - "sea bass fish" → 放入 sea_bass/ 文件夹
   - "tuna fish" → 放入 tuna/ 文件夹
   - "carp fish" → 放入 carp/ 文件夹
3. 每类下载 10-20 张图片即可开始测试训练
4. 图片格式：jpg, jpeg, png 都可以

方法3：使用已有图片
------------------
如果您已经有鱼类图片，直接按类别放入对应文件夹即可

目录结构示例：
data/fish_images/
├── salmon/
│   ├── img1.jpg
│   ├── img2.jpg
│   └── ...
├── sea_bass/
│   └── ...
└── ...

最小数据集要求：
- 至少 2 个类别
- 每类至少 10 张图片
- 图片大小：建议 224x224 或更大

准备好数据后，运行：
  python train_pytorch.py
或
  训练.bat
"""
    
    guide_path = os.path.join(DATA_DIR, "快速开始.txt")
    with open(guide_path, 'w', encoding='utf-8') as f:
        f.write(guide)
    
    print(f"[OK] 创建快速开始指南: {guide_path}")
    return guide_path

def main():
    print("="*60)
    print("创建测试数据集指南")
    print("="*60)
    print()
    
    if not os.path.exists(DATA_DIR):
        print(f"[ERROR] 数据目录不存在: {DATA_DIR}")
        print("请先运行: python download_fish_dataset.py")
        return
    
    # 创建快速开始指南
    create_quick_start_guide()
    
    print()
    print("[INFO] 已创建快速开始指南")
    print(f"[INFO] 查看指南: {os.path.abspath(DATA_DIR)}/快速开始.txt")
    print()
    print("[TIP] 准备好数据后，运行以下命令开始训练：")
    print("  python train_pytorch.py")
    print("  或")
    print("  训练.bat")

if __name__ == "__main__":
    main()
