# 鱼类图像识别模型训练

## 快速开始

### 1. 准备环境

```bash
# 安装Python依赖
pip install tensorflow==2.13.0
pip install numpy pillow
pip install tensorflowjs  # 可选：用于转换为TensorFlow.js
pip install tf2onnx       # 可选：用于转换为ONNX
```

### 2. 准备数据集

**数据集目录结构：**
```
data/
└── fish_images/
    ├── 三文鱼/
    │   ├── image1.jpg
    │   ├── image2.jpg
    │   └── ...
    ├── 鲈鱼/
    │   ├── image1.jpg
    │   └── ...
    └── ...
```

**获取数据集：**
1. 从Kaggle下载：https://www.kaggle.com/datasets?search=fish
2. 使用Fish-Vista数据集（如果可用）
3. 自己收集和标注（推荐1000+张图片，每类至少50张）

### 3. 配置参数

编辑 `train_model.py`，修改以下配置：
```python
NUM_CLASSES = 20        # 鱼类种类数
DATA_DIR = './data/fish_images'  # 数据集路径
BATCH_SIZE = 32        # 批次大小
EPOCHS = 50           # 训练轮数
```

### 4. 开始训练

```bash
python train_model.py
```

### 5. 使用训练好的模型

模型会保存到 `./models/fish_classifier.h5`

在后端服务中使用：
```typescript
// 在recognition.service.ts中加载和使用模型
```

## 训练技巧

1. **数据增强**：已配置多种数据增强方法
2. **迁移学习**：使用ImageNet预训练的MobileNetV3
3. **早停机制**：防止过拟合
4. **学习率调整**：自动降低学习率

## 模型转换

### 转换为TensorFlow.js（用于前端）

```python
convert_to_tensorflowjs('./models/fish_classifier.h5', './models/tfjs_model')
```

### 转换为ONNX（用于跨平台部署）

```python
convert_to_onnx('./models/fish_classifier.h5', './models/fish_classifier.h5')
```

## 评估指标

训练完成后会显示：
- 验证集准确率（Top-1）
- 验证集Top-3准确率
- 训练历史（保存为JSON）

## 注意事项

1. 确保数据集足够（每类至少50张图片）
2. 数据标注要准确
3. 根据GPU内存调整BATCH_SIZE
4. 训练时间取决于数据集大小（通常1-3小时）
