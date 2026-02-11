"""
自动下载鱼类图片数据集
使用公开的图片API和搜索引擎
"""

import os
import urllib.request
import urllib.parse
import time
import json
import random

DATA_DIR = "./data/fish_images"

# 定义类别和搜索关键词
CATEGORIES = {
    'salmon': 'salmon fish',
    'sea_bass': 'sea bass fish', 
    'tuna': 'tuna fish',
    'carp': 'carp fish',
    'trout': 'trout fish',
    'cod': 'cod fish',
    'mackerel': 'mackerel fish',
    'sardine': 'sardine fish',
}

# 使用Pexels API（免费，需要注册获取API key）
# 或者使用一些公开的图片URL
PEXELS_API_KEY = None  # 如果有API key可以填入

def download_from_pexels(keyword, save_dir, count=15):
    """从Pexels下载图片（需要API key）"""
    if not PEXELS_API_KEY:
        return 0
    
    downloaded = 0
    try:
        url = f"https://api.pexels.com/v1/search?query={keyword}&per_page={count}"
        headers = {'Authorization': PEXELS_API_KEY}
        
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read())
            
            for i, photo in enumerate(data.get('photos', [])[:count]):
                img_url = photo['src']['large']
                save_path = os.path.join(save_dir, f"{keyword.replace(' ', '_')}_{i+1}.jpg")
                
                if download_from_url(img_url, save_path):
                    downloaded += 1
                    time.sleep(0.5)  # 避免请求过快
    except Exception as e:
        print(f"  [ERROR] Pexels下载失败: {e}")
    
    return downloaded

def download_from_url(url, save_path, max_retries=3):
    """从URL下载图片"""
    for attempt in range(max_retries):
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=10) as response:
                with open(save_path, 'wb') as f:
                    f.write(response.read())
            return True
        except Exception as e:
            if attempt < max_retries - 1:
                time.sleep(1)
                continue
            return False
    return False

def download_sample_urls():
    """使用一些示例图片URL（这些是占位，实际需要替换为真实URL）"""
    # 注意：这里只是示例，实际使用时需要确保URL的有效性和合法性
    sample_urls = {
        'salmon': [],
        'sea_bass': [],
        'tuna': [],
    }
    return sample_urls

def create_kaggle_download_guide():
    """创建Kaggle下载指南"""
    guide = """使用Kaggle API下载数据集（推荐方法）
========================================

步骤1: 安装Kaggle库
  pip install kaggle

步骤2: 获取API凭证
  1. 访问 https://www.kaggle.com/
  2. 登录账号
  3. 进入 Account -> API
  4. 点击 "Create New API Token"
  5. 下载 kaggle.json 文件

步骤3: 配置API凭证
  Windows: 将 kaggle.json 放到 C:\\Users\\你的用户名\\.kaggle\\
  Linux/Mac: 将 kaggle.json 放到 ~/.kaggle/

步骤4: 下载数据集
  kaggle datasets download -d crowww/a-large-scale-fish-dataset

步骤5: 解压并整理
  1. 解压下载的zip文件
  2. 将图片按类别整理到 data/fish_images/ 对应文件夹
"""
    
    guide_path = os.path.join(DATA_DIR, "Kaggle下载指南.txt")
    with open(guide_path, 'w', encoding='utf-8') as f:
        f.write(guide)
    
    print(f"[OK] 创建Kaggle下载指南: {guide_path}")

def main():
    print("="*60)
    print("自动下载鱼类图片数据集")
    print("="*60)
    print()
    
    # 创建目录
    os.makedirs(DATA_DIR, exist_ok=True)
    
    total_downloaded = 0
    
    print("[INFO] 由于直接从网络批量下载图片可能涉及:")
    print("       1. 版权问题")
    print("       2. 网站使用条款")
    print("       3. API限制")
    print()
    print("[INFO] 推荐使用以下方法获取数据:")
    print()
    print("方法1: Kaggle数据集（最推荐）")
    print("  - 数据质量高，已标注")
    print("  - 访问: https://www.kaggle.com/datasets/crowww/a-large-scale-fish-dataset")
    print("  - 或使用Kaggle API下载（见指南）")
    print()
    print("方法2: 手动收集（10-15分钟）")
    print("  - 打开浏览器，搜索图片")
    print("  - 下载到对应类别文件夹")
    print("  - 每类 10-20 张即可开始测试")
    print()
    
    # 创建Kaggle下载指南
    create_kaggle_download_guide()
    
    print("="*60)
    print()
    print("[TIP] 已创建详细的下载指南")
    print(f"     查看: {os.path.abspath(DATA_DIR)}/Kaggle下载指南.txt")
    print()
    print("[TIP] 准备好数据后，运行训练:")
    print("      python train_pytorch.py")

if __name__ == "__main__":
    main()
