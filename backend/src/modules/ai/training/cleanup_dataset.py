"""
清理数据集，删除不需要的文件和文件夹
"""

import os
import shutil

DATA_DIR = "./data/fish_images"
FISH_DATASET_DIR = os.path.join(DATA_DIR, "Fish_Dataset")

def cleanup():
    """清理不需要的文件"""
    print("="*60)
    print("清理数据集")
    print("="*60)
    print()
    
    deleted_count = 0
    
    # 删除Fish_Dataset文件夹（图片已复制到对应类别文件夹）
    if os.path.exists(FISH_DATASET_DIR):
        try:
            print(f"[INFO] 删除Fish_Dataset文件夹（图片已复制到对应类别文件夹）...")
            shutil.rmtree(FISH_DATASET_DIR)
            print(f"[OK] 已删除: Fish_Dataset")
            deleted_count += 1
        except Exception as e:
            print(f"[WARN] 删除失败: {e}")
    
    # 删除其他不需要的文件
    files_to_delete = [
        'dataset_info.json',
        'README.txt',
        '快速开始.txt',
        'Kaggle下载指南.txt',
        '如何获取图片.txt',
    ]
    
    for file_name in files_to_delete:
        file_path = os.path.join(DATA_DIR, file_name)
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
                print(f"[DEL] 删除文件: {file_name}")
                deleted_count += 1
            except Exception as e:
                print(f"[WARN] 删除失败: {e}")
    
    # 删除类别文件夹中的说明文件
    categories = [d for d in os.listdir(DATA_DIR) 
                 if os.path.isdir(os.path.join(DATA_DIR, d))]
    
    for cat in categories:
        cat_path = os.path.join(DATA_DIR, cat)
        for file_name in os.listdir(cat_path):
            if file_name.endswith('.txt') and '如何获取' in file_name:
                file_path = os.path.join(cat_path, file_name)
                try:
                    os.remove(file_path)
                    print(f"[DEL] 删除: {cat}/{file_name}")
                    deleted_count += 1
                except:
                    pass
    
    print()
    print("="*60)
    print(f"[SUCCESS] 清理完成！删除了 {deleted_count} 个文件/文件夹")
    print("="*60)
    print()
    
    # 最终统计
    print("最终数据集结构:")
    categories = [d for d in os.listdir(DATA_DIR) 
                 if os.path.isdir(os.path.join(DATA_DIR, d))]
    
    total_images = 0
    for cat in sorted(categories):
        cat_path = os.path.join(DATA_DIR, cat)
        images = [f for f in os.listdir(cat_path) 
                  if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp'))]
        count = len(images)
        if count > 0:
            print(f"  {cat}: {count} 张图片")
            total_images += count
    
    print(f"\n总计: {total_images} 张图片")
    print(f"类别数: {len(categories)}")
    print()
    print("[OK] 数据集已准备就绪，可以开始训练！")

if __name__ == "__main__":
    cleanup()
