"""
创建类别索引文件
"""

import os
import torch
from torchvision import datasets

DATA_DIR = "./data/fish_images"
MODEL_DIR = "./models"
CLASS_INDEX_PATH = os.path.join(MODEL_DIR, "class_to_idx.pt")

def create_class_index():
    """创建类别索引文件"""
    print("创建类别索引文件...")
    
    if not os.path.exists(DATA_DIR):
        print(f"[ERROR] 数据目录不存在: {DATA_DIR}")
        return
    
    # 使用ImageFolder加载数据集以获取类别映射
    dataset = datasets.ImageFolder(DATA_DIR)
    class_to_idx = dataset.class_to_idx
    
    os.makedirs(MODEL_DIR, exist_ok=True)
    torch.save(class_to_idx, CLASS_INDEX_PATH)
    
    print(f"[OK] 类别索引文件已创建: {CLASS_INDEX_PATH}")
    print(f"类别数: {len(class_to_idx)}")
    print(f"类别: {list(class_to_idx.keys())}")

if __name__ == "__main__":
    create_class_index()
