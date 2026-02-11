"""
检查训练进度
"""

import os
import time
from pathlib import Path

MODEL_DIR = "./models"
MODEL_PATH = os.path.join(MODEL_DIR, "fish_classifier_resnet18.pth")
CLASS_INDEX_PATH = os.path.join(MODEL_DIR, "class_to_idx.pt")

def check_training_status():
    """检查训练状态"""
    print("="*60)
    print("检查训练进度")
    print("="*60)
    print()
    
    # 检查模型文件
    if os.path.exists(MODEL_PATH):
        model_size = os.path.getsize(MODEL_PATH) / (1024 * 1024)  # MB
        model_time = time.ctime(os.path.getmtime(MODEL_PATH))
        print(f"[OK] 模型文件存在: {MODEL_PATH}")
        print(f"     文件大小: {model_size:.2f} MB")
        print(f"     最后修改: {model_time}")
        print()
        
        if os.path.exists(CLASS_INDEX_PATH):
            print(f"[OK] 类别映射文件存在: {CLASS_INDEX_PATH}")
            print()
            print("[SUCCESS] 训练已完成！")
            print()
            print("下一步:")
            print("  1. 重启后端服务")
            print("  2. 在前端测试识别功能")
        else:
            print("[WARN] 类别映射文件不存在，训练可能未完成")
    else:
        print("[INFO] 模型文件不存在")
        print("       训练可能还在进行中，或者还未开始")
        print()
        print("提示:")
        print("  - 训练过程可能需要较长时间（CPU: 5-10小时，GPU: 15-45分钟）")
        print("  - 可以查看终端输出了解训练进度")
        print("  - 训练完成后会生成模型文件")

if __name__ == "__main__":
    check_training_status()
