"""
测试训练好的模型
"""

import os
import json
import glob
from infer_pytorch import predict

def test_model():
    """测试模型"""
    print("="*60)
    print("测试训练好的模型")
    print("="*60)
    print()
    
    # 从每个类别中选择一张图片进行测试
    data_dir = "./data/fish_images"
    categories = [d for d in os.listdir(data_dir) 
                 if os.path.isdir(os.path.join(data_dir, d))]
    
    print(f"找到 {len(categories)} 个类别")
    print()
    
    results = []
    
    for category in sorted(categories)[:5]:  # 测试前5个类别
        category_path = os.path.join(data_dir, category)
        images = glob.glob(os.path.join(category_path, "*.png"))
        
        if images:
            test_image = images[0]
            print(f"测试类别: {category}")
            print(f"  图片: {os.path.basename(test_image)}")
            
            try:
                result = predict(test_image)
                print(f"  识别结果: {result['fishName']}")
                print(f"  置信度: {result['confidence']:.4f}")
                
                if result['fishName'] == category:
                    print(f"  [OK] 识别正确！")
                else:
                    print(f"  [WARN] 识别错误，期望: {category}, 实际: {result['fishName']}")
                
                results.append({
                    'category': category,
                    'predicted': result['fishName'],
                    'confidence': result['confidence'],
                    'correct': result['fishName'] == category
                })
            except Exception as e:
                print(f"  [ERROR] 识别失败: {e}")
                results.append({
                    'category': category,
                    'error': str(e)
                })
            
            print()
    
    # 统计结果
    print("="*60)
    print("测试结果统计")
    print("="*60)
    correct = sum(1 for r in results if r.get('correct', False))
    total = len([r for r in results if 'correct' in r])
    if total > 0:
        accuracy = correct / total
        print(f"正确识别: {correct}/{total}")
        print(f"准确率: {accuracy:.2%}")
    print()
    
    print("详细结果:")
    for r in results:
        if 'error' in r:
            print(f"  {r['category']}: 错误 - {r['error']}")
        else:
            status = "[OK]" if r['correct'] else "[FAIL]"
            print(f"  {r['category']}: {status} -> {r['predicted']} ({r['confidence']:.4f})")

if __name__ == "__main__":
    test_model()
