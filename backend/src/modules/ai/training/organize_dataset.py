"""
整理数据集，将Fish_Dataset中的图片按类别整理到正确的目录结构
删除不需要的文件（GT文件夹、文档等）
"""

import os
import shutil
from pathlib import Path

DATA_DIR = "./data/fish_images"
FISH_DATASET_DIR = os.path.join(DATA_DIR, "Fish_Dataset")

# 类别名称映射（数据集中的名称 -> 训练脚本期望的名称）
CATEGORY_MAPPING = {
    'Sea Bass': 'sea_bass',
    'Trout': 'trout',
    'Red Mullet': 'red_mullet',  # 如果没有对应的，可以映射到相近的
    'Red Sea Bream': 'red_sea_bream',
    'Gilt-Head Bream': 'gilt_head_bream',
    'Black Sea Sprat': 'black_sea_sprat',
    'Hourse Mackerel': 'mackerel',
    'Shrimp': 'shrimp',
    'Striped Red Mullet': 'striped_red_mullet',
}

def get_category_folders():
    """获取Fish_Dataset下的所有类别文件夹"""
    if not os.path.exists(FISH_DATASET_DIR):
        print(f"[ERROR] Fish_Dataset目录不存在: {FISH_DATASET_DIR}")
        return []
    
    categories = []
    for item in os.listdir(FISH_DATASET_DIR):
        item_path = os.path.join(FISH_DATASET_DIR, item)
        if os.path.isdir(item_path) and not item.endswith(' GT'):
            # 排除GT文件夹和其他非类别文件夹
            if not item.startswith('.') and item not in ['__pycache__']:
                categories.append(item)
    
    return sorted(categories)

def count_images_in_folder(folder_path):
    """统计文件夹中的图片数量"""
    if not os.path.exists(folder_path):
        return 0
    
    count = 0
    for file in os.listdir(folder_path):
        if file.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp')):
            count += 1
    return count

def organize_dataset():
    """整理数据集"""
    print("="*60)
    print("整理数据集")
    print("="*60)
    print()
    
    if not os.path.exists(FISH_DATASET_DIR):
        print(f"[ERROR] Fish_Dataset目录不存在")
        return
    
    # 获取所有类别
    categories = get_category_folders()
    print(f"[INFO] 发现 {len(categories)} 个类别:")
    for cat in categories:
        print(f"  - {cat}")
    print()
    
    # 统计和整理
    total_moved = 0
    total_deleted = 0
    
    for category_name in categories:
        category_path = os.path.join(FISH_DATASET_DIR, category_name)
        
        # 获取目标类别名称（映射后的）
        target_category = CATEGORY_MAPPING.get(category_name, category_name.lower().replace(' ', '_').replace('-', '_'))
        target_dir = os.path.join(DATA_DIR, target_category)
        
        # 创建目标目录
        os.makedirs(target_dir, exist_ok=True)
        
        # 检查原始图片文件夹
        original_folder = os.path.join(category_path, category_name)
        if os.path.exists(original_folder):
            # 移动图片
            image_count = 0
            for file in os.listdir(original_folder):
                if file.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp')):
                    src = os.path.join(original_folder, file)
                    dst = os.path.join(target_dir, file)
                    if not os.path.exists(dst):  # 避免覆盖
                        shutil.copy2(src, dst)
                        image_count += 1
                    else:
                        # 如果文件已存在，使用新名称
                        base, ext = os.path.splitext(file)
                        counter = 1
                        while os.path.exists(dst):
                            new_name = f"{base}_{counter}{ext}"
                            dst = os.path.join(target_dir, new_name)
                            counter += 1
                        shutil.copy2(src, dst)
                        image_count += 1
            
            print(f"[OK] {category_name} -> {target_category}: 移动 {image_count} 张图片")
            total_moved += image_count
        
        # 删除GT文件夹（不需要用于训练）
        gt_folder = os.path.join(category_path, f"{category_name} GT")
        if os.path.exists(gt_folder):
            try:
                shutil.rmtree(gt_folder)
                print(f"[DEL] 删除GT文件夹: {gt_folder}")
                total_deleted += 1
            except Exception as e:
                print(f"[WARN] 删除GT文件夹失败: {e}")
    
    # 删除不需要的文件
    files_to_delete = ['license.txt', 'README.txt', 'Segmentation_example_script.m']
    for file_name in files_to_delete:
        file_path = os.path.join(FISH_DATASET_DIR, file_name)
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
                print(f"[DEL] 删除文件: {file_name}")
                total_deleted += 1
            except Exception as e:
                print(f"[WARN] 删除文件失败: {e}")
    
    print()
    print("="*60)
    print(f"[SUCCESS] 整理完成！")
    print(f"  移动图片: {total_moved} 张")
    print(f"  删除文件夹/文件: {total_deleted} 个")
    print("="*60)
    print()
    
    # 统计最终结果
    print("最终数据集统计:")
    final_categories = [d for d in os.listdir(DATA_DIR) 
                       if os.path.isdir(os.path.join(DATA_DIR, d)) 
                       and d != 'Fish_Dataset']
    
    total_images = 0
    for cat in sorted(final_categories):
        cat_path = os.path.join(DATA_DIR, cat)
        count = count_images_in_folder(cat_path)
        if count > 0:
            print(f"  {cat}: {count} 张图片")
            total_images += count
    
    print(f"\n总计: {total_images} 张图片")
    print()
    print("[TIP] 数据集已整理完成，可以开始训练了！")
    print("运行: python train_pytorch.py")

if __name__ == "__main__":
    organize_dataset()
