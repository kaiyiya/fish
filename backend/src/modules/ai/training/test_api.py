"""
测试识别API接口
"""

import requests
import json
import os

def test_recognition_api():
    """测试识别API"""
    base_url = "http://localhost:3000"
    
    # 1. 先登录获取token
    print("="*60)
    print("测试识别API")
    print("="*60)
    print()
    
    print("1. 登录获取token...")
    login_data = {
        "username": "wuyueqian",
        "password": "123456"
    }
    
    try:
        login_res = requests.post(f"{base_url}/auth/login", json=login_data)
        login_res.raise_for_status()
        login_result = login_res.json()
        
        if login_result.get('code') == 200:
            # 检查不同的数据结构
            data = login_result.get('data', {})
            if isinstance(data, dict):
                token = data.get('token') or data.get('access_token')
            else:
                token = None
            
            if not token:
                print(f"   [ERROR] 无法获取token，响应: {json.dumps(login_result, indent=2, ensure_ascii=False)}")
                return
            
            print(f"   [OK] 登录成功，token: {token[:20]}...")
        else:
            print(f"   [ERROR] 登录失败: {login_result.get('message')}")
            print(f"   响应: {json.dumps(login_result, indent=2, ensure_ascii=False)}")
            return
    except Exception as e:
        print(f"   [ERROR] 登录请求失败: {e}")
        return
    
    print()
    
    # 2. 上传测试图片
    print("2. 上传测试图片...")
    test_image_path = os.path.join("data", "fish_images", "shrimp", "00001.png")
    
    if not os.path.exists(test_image_path):
        print(f"   [ERROR] 测试图片不存在: {test_image_path}")
        return
    
    try:
        with open(test_image_path, 'rb') as f:
            files = {'file': ('test.png', f, 'image/png')}
            headers = {'Authorization': f'Bearer {token}'}
            upload_res = requests.post(f"{base_url}/upload", files=files, headers=headers)
            upload_res.raise_for_status()
            upload_result = upload_res.json()
            
            if upload_result.get('code') == 200:
                image_url = upload_result['data']['data']['url']
                print(f"   [OK] 上传成功，图片URL: {image_url}")
            else:
                print(f"   [ERROR] 上传失败: {upload_result.get('message')}")
                return
    except Exception as e:
        print(f"   [ERROR] 上传请求失败: {e}")
        return
    
    print()
    
    # 3. 调用识别接口
    print("3. 调用识别接口...")
    recognize_data = {
        "imageUrl": image_url
    }
    
    try:
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        recognize_res = requests.post(
            f"{base_url}/ai/recognize",
            json=recognize_data,
            headers=headers
        )
        recognize_res.raise_for_status()
        recognize_result = recognize_res.json()
        
        if recognize_result.get('code') == 200:
            data = recognize_result['data']
            print(f"   [OK] 识别成功！")
            print(f"   鱼类: {data.get('fishName', '未知')}")
            print(f"   置信度: {data.get('confidence', 0) * 100:.2f}%")
            
            if data.get('result') and data['result'].get('alternatives'):
                print(f"   备选结果:")
                for alt in data['result']['alternatives']:
                    name = alt.get('nameCN') or alt.get('name', '未知')
                    conf = alt.get('confidence', 0) * 100
                    print(f"     - {name}: {conf:.2f}%")
            
            # 显示推荐商品
            if data.get('recommendedProducts'):
                products = data['recommendedProducts']
                print(f"   推荐商品 ({len(products)}个):")
                for i, product in enumerate(products, 1):
                    name = product.get('name', '未知商品')
                    price = product.get('price', 0)
                    stock = product.get('stock', 0)
                    # 使用format避免编码问题
                    print(f"     {i}. {name} - {price}元 (库存: {stock})")
            else:
                print(f"   推荐商品: 无")
        else:
            print(f"   [ERROR] 识别失败: {recognize_result.get('message')}")
            print(f"   响应: {json.dumps(recognize_result, indent=2, ensure_ascii=False)}")
    except Exception as e:
        print(f"   [ERROR] 识别请求失败: {e}")
        import traceback
        traceback.print_exc()
    
    print()
    print("="*60)
    print("测试完成")
    print("="*60)

if __name__ == "__main__":
    test_recognition_api()
