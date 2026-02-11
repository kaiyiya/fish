"""
快速获取训练数据的实用脚本
提供多种数据获取方法
"""

import os
import webbrowser
import json

DATA_DIR = "./data/fish_images"

def open_kaggle_dataset():
    """打开Kaggle数据集页面"""
    url = "https://www.kaggle.com/datasets/crowww/a-large-scale-fish-dataset"
    print(f"[INFO] 正在打开Kaggle数据集页面...")
    print(f"       如果浏览器未自动打开，请手动访问: {url}")
    webbrowser.open(url)

def create_download_guide():
    """创建详细的下载指南"""
    guide = {
        "方法1_Kaggle数据集": {
            "描述": "最推荐的方法，数据质量高，数量充足",
            "步骤": [
                "1. 访问: https://www.kaggle.com/datasets/crowww/a-large-scale-fish-dataset",
                "2. 注册/登录Kaggle账号（免费）",
                "3. 点击'Download'按钮下载数据集",
                "4. 解压zip文件",
                "5. 将图片按类别整理到 data/fish_images/ 对应文件夹",
                "6. 每类选择 20-50 张图片即可开始训练"
            ],
            "优点": "数据质量高、数量充足、已标注",
            "缺点": "需要注册账号，下载文件较大（几百MB）"
        },
        "方法2_手动收集": {
            "描述": "快速获取少量测试数据",
            "步骤": [
                "1. 打开浏览器，访问图片搜索引擎",
                "2. 搜索以下关键词并下载图片:",
                "   - 'salmon fish' → 放入 salmon/ 文件夹",
                "   - 'sea bass fish' → 放入 sea_bass/ 文件夹",
                "   - 'tuna fish' → 放入 tuna/ 文件夹",
                "   - 等等...",
                "3. 每类下载 10-20 张图片",
                "4. 图片格式: jpg, jpeg, png 都可以"
            ],
            "优点": "快速、灵活、可以控制数据质量",
            "缺点": "需要手动操作，数据量有限"
        },
        "方法3_使用Python脚本": {
            "描述": "自动化下载（需要技术能力）",
            "步骤": [
                "1. 安装依赖: pip install requests beautifulsoup4 selenium",
                "2. 编写脚本从图片搜索引擎下载",
                "3. 注意遵守网站使用条款和版权",
                "4. 建议使用专业的数据集API"
            ],
            "优点": "自动化、可批量下载",
            "缺点": "需要编程能力，可能涉及版权问题"
        }
    }
    
    guide_path = os.path.join(DATA_DIR, "数据获取指南.json")
    with open(guide_path, 'w', encoding='utf-8') as f:
        json.dump(guide, f, ensure_ascii=False, indent=2)
    
    print(f"[OK] 创建数据获取指南: {guide_path}")
    return guide

def main():
    print("="*60)
    print("快速获取训练数据")
    print("="*60)
    print()
    
    print("推荐方法：从Kaggle下载数据集")
    print()
    choice = input("是否打开Kaggle数据集页面？(y/n): ").strip().lower()
    
    if choice == 'y':
        open_kaggle_dataset()
        print()
        print("[INFO] 浏览器已打开，请按照页面提示下载数据集")
    else:
        print()
        print("[INFO] 您可以稍后手动访问:")
        print("       https://www.kaggle.com/datasets/crowww/a-large-scale-fish-dataset")
    
    print()
    print("="*60)
    print("数据准备步骤")
    print("="*60)
    print()
    print("1. 下载数据集（从Kaggle或手动收集）")
    print("2. 将图片按类别整理到以下目录:")
    print(f"   {os.path.abspath(DATA_DIR)}/")
    print("   例如:")
    print("   - salmon/ 文件夹放入三文鱼图片")
    print("   - sea_bass/ 文件夹放入鲈鱼图片")
    print("   - 等等...")
    print()
    print("3. 每类至少准备 10-20 张图片（测试用）")
    print("   或 50-100 张图片（正式训练）")
    print()
    print("4. 准备好后运行训练:")
    print("   python train_pytorch.py")
    print("   或")
    print("   训练.bat")
    print()
    
    # 创建指南文件
    create_download_guide()
    
    print("[OK] 已创建详细的数据获取指南")
    print(f"     查看: {os.path.abspath(DATA_DIR)}/数据获取指南.json")

if __name__ == "__main__":
    main()
