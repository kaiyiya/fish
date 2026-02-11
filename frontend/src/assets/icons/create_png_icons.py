"""
使用PIL创建TabBar图标
需要安装: pip install Pillow
"""

from PIL import Image, ImageDraw
import os

SIZE = 81
ICONS = {
    'home': {
        'normal': '#666666',
        'active': '#1890ff',
        'shape': 'home'
    },
    'recognize': {
        'normal': '#666666',
        'active': '#1890ff',
        'shape': 'camera'
    },
    'search': {
        'normal': '#666666',
        'active': '#1890ff',
        'shape': 'search'
    },
    'profile': {
        'normal': '#666666',
        'active': '#1890ff',
        'shape': 'user'
    },
}

def hex_to_rgb(hex_color):
    """转换十六进制颜色到RGB"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def draw_home(draw, color, size):
    """绘制首页图标"""
    # 简单的房子形状
    points = [
        (size//2, size//4),  # 顶部
        (size//4, size//2),  # 左下
        (size//4, size*3//4),  # 左下角
        (size*3//4, size*3//4),  # 右下角
        (size*3//4, size//2),  # 右下
    ]
    draw.polygon(points, fill=color)
    # 门
    door_width = size//6
    door_height = size//4
    door_x = size//2 - door_width//2
    door_y = size*3//4 - door_height
    draw.rectangle([door_x, door_y, door_x + door_width, door_y + door_height], fill=(255, 255, 255))

def draw_camera(draw, color, size):
    """绘制相机图标"""
    # 相机主体
    camera_x = size//4
    camera_y = size//3
    camera_w = size//2
    camera_h = size//3
    draw.rectangle([camera_x, camera_y, camera_x + camera_w, camera_y + camera_h], fill=color)
    # 镜头
    lens_center = (size//2, camera_y + camera_h//2)
    lens_radius = size//8
    draw.ellipse([lens_center[0] - lens_radius, lens_center[1] - lens_radius,
                  lens_center[0] + lens_radius, lens_center[1] + lens_radius],
                 fill=(255, 255, 255))
    # 闪光灯
    flash_x = camera_x + camera_w - size//8
    flash_y = camera_y + size//16
    draw.ellipse([flash_x - size//16, flash_y - size//16,
                  flash_x + size//16, flash_y + size//16],
                 fill=(255, 255, 255))

def draw_search(draw, color, size):
    """绘制搜索图标"""
    # 放大镜
    center_x, center_y = size//3, size//3
    radius = size//6
    # 圆圈
    draw.ellipse([center_x - radius, center_y - radius,
                  center_x + radius, center_y + radius],
                 outline=color, width=3)
    # 手柄
    handle_start = (center_x + radius, center_y + radius)
    handle_end = (size*2//3, size*2//3)
    draw.line([handle_start, handle_end], fill=color, width=3)

def draw_user(draw, color, size):
    """绘制用户图标"""
    # 头部
    head_center = (size//2, size//3)
    head_radius = size//6
    draw.ellipse([head_center[0] - head_radius, head_center[1] - head_radius,
                  head_center[0] + head_radius, head_center[1] + head_radius],
                 fill=color)
    # 身体
    body_top = head_center[1] + head_radius
    body_bottom = size*2//3
    body_left = size//3
    body_right = size*2//3
    draw.ellipse([body_left, body_top, body_right, body_bottom], fill=color)

def create_icon(name, color, is_active=False):
    """创建图标"""
    # 创建透明背景
    img = Image.new('RGBA', (SIZE, SIZE), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    
    color_rgb = hex_to_rgb(color)
    
    # 根据形状绘制
    shape = ICONS[name]['shape']
    if shape == 'home':
        draw_home(draw, color_rgb, SIZE)
    elif shape == 'camera':
        draw_camera(draw, color_rgb, SIZE)
    elif shape == 'search':
        draw_search(draw, color_rgb, SIZE)
    elif shape == 'user':
        draw_user(draw, color_rgb, SIZE)
    
    # 保存
    suffix = '-active' if is_active else ''
    filename = f'{name}{suffix}.png'
    img.save(filename)
    print(f'[OK] 创建: {filename}')

def main():
    print('='*60)
    print('创建TabBar图标')
    print('='*60)
    print()
    
    try:
        for name, config in ICONS.items():
            # 创建普通状态图标
            create_icon(name, config['normal'], False)
            # 创建激活状态图标
            create_icon(name, config['active'], True)
        
        print()
        print('='*60)
        print('[SUCCESS] 所有图标已创建完成！')
        print('='*60)
        print()
        print('图标文件已保存在当前目录')
        print('现在可以在 app.config.ts 中使用这些图标了')
    except ImportError:
        print('[ERROR] 需要安装Pillow库')
        print('运行: pip install Pillow')
    except Exception as e:
        print(f'[ERROR] 创建图标失败: {e}')

if __name__ == '__main__':
    main()
