"""
创建简单的图标文件
使用PIL创建简单的PNG图标
"""

from PIL import Image, ImageDraw, ImageFont
import os

# 图标配置
SIZE = 81  # Taro tabBar图标推荐尺寸：81x81
ICONS = {
    'home': {
        'text': '🏠',
        'color': (102, 102, 102),  # #666
        'active_color': (24, 144, 255),  # #1890ff
    },
    'recognize': {
        'text': '📷',
        'color': (102, 102, 102),
        'active_color': (24, 144, 255),
    },
    'search': {
        'text': '🔍',
        'color': (102, 102, 102),
        'active_color': (24, 144, 255),
    },
    'profile': {
        'text': '👤',
        'color': (102, 102, 102),
        'active_color': (24, 144, 255),
    },
}

def create_icon(name, text, color, is_active=False):
    """创建图标"""
    # 创建透明背景
    img = Image.new('RGBA', (SIZE, SIZE), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    
    # 绘制圆形背景
    margin = 10
    draw.ellipse(
        [margin, margin, SIZE - margin, SIZE - margin],
        fill=(*color, 200 if is_active else 100)
    )
    
    # 绘制文字（emoji）
    try:
        # 尝试使用系统字体
        font_size = 40
        # 在PIL中绘制emoji比较复杂，这里我们创建一个简单的图标
        # 实际项目中建议使用图标字体或SVG
        draw.text(
            (SIZE // 2, SIZE // 2),
            text,
            fill=(255, 255, 255, 255),
            anchor='mm'
        )
    except:
        pass
    
    # 保存
    suffix = '-active' if is_active else ''
    filename = f'{name}{suffix}.png'
    img.save(filename)
    print(f'Created: {filename}')

def main():
    os.makedirs('.', exist_ok=True)
    
    for name, config in ICONS.items():
        # 创建普通图标
        create_icon(name, config['text'], config['color'], False)
        # 创建激活图标
        create_icon(name, config['text'], config['active_color'], True)
    
    print('\n所有图标已创建完成！')

if __name__ == '__main__':
    main()
