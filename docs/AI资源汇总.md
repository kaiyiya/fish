# AI模型与数据集开源资源汇总

## 📚 鱼类图像识别数据集

### 1. Fish-Vista 数据集（推荐）
**简介：** 大型多用途鱼类图像数据集，包含约6万张高分辨率图像，涵盖1900个不同物种

**特点：**
- 数据量大：60,000+ 张图像
- 物种丰富：1900种鱼类
- 标注完整：支持分类、分割、特征识别
- 高质量：经过专业处理

**获取方式：**
- 论文：https://arxiv.org/abs/2407.08027
- 数据集链接通常在论文中提供

**适用场景：** 物种分类、细粒度识别

---

### 2. Marine Life Classification Dataset
**简介：** 包含696张海洋生物图像，分为4个类别（鱼、水母、鲨鱼、金枪鱼）

**特点：**
- 数据量：696张图像（训练集556张，验证集140张）
- 类别：4个主要类别
- 标注：包含边界框标注

**获取方式：**
- Kaggle：搜索 "Marine Life Classification"
- 数据集平台：https://www.selectdataset.com/

**适用场景：** 快速原型开发、多类别分类

---

### 3. FishNet Dataset
**简介：** 包含30万张手工标注图像，涵盖163个不同物种

**特点：**
- 大规模：300,000+ 张图像
- 物种数：163种
- 标注：包含边界框、尺寸估计
- 论文：https://arxiv.org/abs/2403.10916

**适用场景：** 鱼类检测、尺寸估计

---

### 4. FishBase（世界鱼类数据库）
**简介：** 综合性鱼类生物数据库，提供全球鱼类物种信息

**特点：**
- 信息丰富：包含分类、分布、生态等信息
- 图片资源：部分物种有图片
- 网址：https://www.fishbase.se/

**适用场景：** 数据补充、物种信息查询

---

### 5. Kaggle鱼类数据集
**简介：** Kaggle平台上有多个鱼类相关的数据集

**推荐数据集：**
- "Fish Dataset" - 常见的鱼类分类数据集
- "Deep Learning for Fish Classification" - 深度学习鱼类分类
- "Underwater Fish Classification" - 水下鱼类分类

**获取方式：**
- 访问：https://www.kaggle.com/
- 搜索关键词：fish classification, fish detection

---

## 🤖 预训练模型资源

### 1. TensorFlow官方模型
**模型：** MobileNetV3、ResNet50、EfficientNet等

**获取方式：**
```python
# TensorFlow Hub
import tensorflow_hub as hub

# MobileNetV3
mobilenet_v3 = hub.KerasLayer(
    "https://tfhub.dev/google/imagenet/mobilenet_v3_large_100_224/classification/5"
)

# ResNet50
resnet50 = hub.KerasLayer(
    "https://tfhub.dev/tensorflow/resnet_50/classification/1"
)

# EfficientNet
efficientnet = hub.KerasLayer(
    "https://tfhub.dev/tensorflow/efficientnet/b0/classification/1"
)
```

**官方链接：**
- TensorFlow Hub: https://tfhub.dev/
- TensorFlow Model Zoo: https://github.com/tensorflow/models

---

### 2. PyTorch官方模型
**模型：** ResNet、MobileNet、EfficientNet等

**获取方式：**
```python
import torch
import torchvision.models as models

# ResNet50
resnet50 = models.resnet50(pretrained=True)

# MobileNetV3
mobilenet_v3 = models.mobilenet_v3_large(pretrained=True)

# EfficientNet
efficientnet = models.efficientnet_b0(pretrained=True)
```

**官方链接：**
- PyTorch Models: https://pytorch.org/vision/stable/models.html
- Torchvision: https://github.com/pytorch/vision

---

### 3. TensorFlow.js模型（适用于前端部署）
**模型：** MobileNet、PoseNet等

**获取方式：**
```javascript
// 在浏览器或Node.js中使用
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

// 加载MobileNet模型
const model = await mobilenet.load();
```

**官方链接：**
- TensorFlow.js Models: https://github.com/tensorflow/tfjs-models
- 模型库: https://www.tensorflow.org/js/models

---

### 4. ONNX Model Zoo（跨平台模型）
**模型：** 多种预训练模型（ONNX格式）

**特点：**
- 跨平台：支持多种推理引擎
- 模型丰富：包含分类、检测等多种任务
- 官方链接：https://github.com/onnx/models

---

## 📦 GitHub开源项目

### 1. 鱼类检测/识别项目

**YOLOv8鱼类检测**
- 项目特点：使用YOLOv8进行鱼类目标检测
- GitHub搜索关键词：`yolo fish detection`
- 适合场景：实时检测

**深度学习鱼类分类**
- 项目特点：使用CNN进行鱼类分类
- GitHub搜索关键词：`fish classification deep learning`
- 适合场景：图像分类

---

### 2. 图像分类项目模板

**TensorFlow图像分类模板**
- 项目：https://github.com/tensorflow/models/tree/master/official/vision
- 特点：官方实现，代码规范

**PyTorch图像分类模板**
- 项目：https://github.com/pytorch/examples/tree/main/imagenet
- 特点：简洁清晰，易于理解

---

## 🛠️ 推荐的技术方案

### 方案一：使用预训练模型 + 迁移学习（推荐）

**步骤：**
1. 下载ImageNet预训练的MobileNetV3或ResNet50
2. 使用鱼类数据集进行微调（Fine-tuning）
3. 导出为TensorFlow.js或ONNX格式
4. 部署到后端或前端

**优势：**
- 训练时间短
- 准确率高
- 代码量适中

**代码示例：**
```python
# 使用TensorFlow进行迁移学习
from tensorflow import keras
from tensorflow.keras.applications import MobileNetV3Large
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D

# 加载预训练模型
base_model = MobileNetV3Large(
    weights='imagenet',
    include_top=False,
    input_shape=(224, 224, 3)
)

# 冻结底层参数
base_model.trainable = False

# 添加自定义分类层
model = keras.Sequential([
    base_model,
    GlobalAveragePooling2D(),
    Dense(128, activation='relu'),
    Dense(num_classes, activation='softmax')  # num_classes: 鱼类种类数
])

# 编译模型
model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

# 训练
model.fit(train_data, epochs=10)
```

---

### 方案二：使用开源数据集训练（数据充足时）

**步骤：**
1. 下载Fish-Vista或其他大型数据集
2. 数据预处理和增强
3. 从头训练或使用预训练模型
4. 模型优化和部署

**优势：**
- 可以训练出针对性的模型
- 准确率可能更高

**劣势：**
- 训练时间长
- 需要更多计算资源

---

## 📖 数据集使用建议

### 1. 数据集选择策略

**如果追求快速原型：**
- 使用Marine Life Classification Dataset（696张）
- 或自己收集100-200张常见鱼类图片

**如果需要较高准确率：**
- 使用Fish-Vista数据集（60,000+张）
- 或FishNet数据集（300,000+张）

**如果数据有限：**
- 使用预训练模型 + 数据增强
- 采用迁移学习策略

---

### 2. 数据增强技巧

```python
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# 数据增强配置
datagen = ImageDataGenerator(
    rotation_range=20,        # 旋转
    width_shift_range=0.2,    # 水平平移
    height_shift_range=0.2,   # 垂直平移
    shear_range=0.2,          # 剪切
    zoom_range=0.2,           # 缩放
    horizontal_flip=True,     # 水平翻转
    fill_mode='nearest'       # 填充模式
)
```

---

### 3. 数据标注工具

**LabelImg** - 图像标注工具
- GitHub: https://github.com/HumanSignal/labelImg
- 适合：边界框标注

**Labelme** - 图像标注工具
- GitHub: https://github.com/wkentaro/labelme
- 适合：多边形标注、分割

**Roboflow** - 在线标注平台
- 网址：https://roboflow.com/
- 适合：团队协作标注

---

## 🚀 快速开始示例

### 1. 使用Kaggle数据集

```bash
# 安装Kaggle CLI
pip install kaggle

# 配置API密钥
# 下载数据集
kaggle datasets download -d dataset-name

# 解压
unzip dataset-name.zip
```

---

### 2. 使用预训练模型进行迁移学习

完整示例代码请参考：
- `backend/src/modules/ai/training/` 目录（需要创建）
- 训练脚本示例

---

## 📝 论文引用建议

如果使用这些开源资源，请在论文中引用：

**Fish-Vista数据集：**
```
@article{fishvista2024,
  title={Fish-Vista: A Large-Scale Dataset for Fish Recognition},
  author={...},
  journal={arXiv preprint arXiv:2407.08027},
  year={2024}
}
```

**FishNet模型：**
```
@article{fishnet2024,
  title={FishNet: A Deep Neural Network for Low-Cost Fish Population Estimation},
  author={...},
  journal={arXiv preprint arXiv:2403.10916},
  year={2024}
}
```

**预训练模型：**
```
@inproceedings{mobilenetv3,
  title={Searching for MobileNetV3},
  author={Howard, Andrew and Sandler, Mark and Chu, Grace and others},
  booktitle={ICCV},
  year={2019}
}
```

---

## 💡 实用建议

### 毕业设计项目建议：

1. **第一阶段（快速原型）：**
   - 使用Kaggle的小型数据集（500-1000张）
   - 使用预训练的MobileNetV3进行迁移学习
   - 快速实现基础功能

2. **第二阶段（优化提升）：**
   - 如果时间允许，使用Fish-Vista数据集
   - 优化模型架构和超参数
   - 提高识别准确率

3. **第三阶段（部署上线）：**
   - 将模型转换为TensorFlow.js或ONNX
   - 部署到后端API服务
   - 前端调用识别接口

---

## 🔗 快速链接汇总

### 数据集
- Fish-Vista: https://arxiv.org/abs/2407.08027
- Kaggle: https://www.kaggle.com/datasets?search=fish
- FishBase: https://www.fishbase.se/

### 预训练模型
- TensorFlow Hub: https://tfhub.dev/
- PyTorch Models: https://pytorch.org/vision/stable/models.html
- TensorFlow.js: https://www.tensorflow.org/js/models

### 工具
- LabelImg: https://github.com/HumanSignal/labelImg
- Labelme: https://github.com/wkentaro/labelme
- Roboflow: https://roboflow.com/

---

**总结：对于毕业设计项目，推荐使用预训练模型（MobileNetV3/ResNet）+ 迁移学习 + Kaggle数据集，这样可以快速实现功能，同时保证一定的准确率！**
