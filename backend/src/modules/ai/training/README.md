# 鱼类图像识别模型训练

本项目提供两套训练方案：

- **TensorFlow + MobileNetV3**：原始方案，适合熟悉 TF 的同学；
- **PyTorch + ResNet18**：新增方案，方便在 Conda 环境下快速集成到后端。

你可以根据自己的习惯和论文侧重点二选一，也可以在论文里对比两种框架。

---

## 一、数据集准备（两种方案通用）

**目录结构统一：**

```
data/
└── fish_images/
    ├── salmon/       # 三文鱼
    ├── sea_bass/     # 鲈鱼
    ├── tuna/         # 金枪鱼
    └── ...
```

**获取方式示例：**

1. 在 Kaggle 搜索 `fish classification`、`fish species` 等关键字，下载公开数据集；  
2. 参考 Fish4Knowledge、QUT Fish 等公开鱼类数据集；  
3. 自己用手机拍照 + 简单标注（建议：**每类 ≥ 50 张，总量 ≥ 1000 张**）。

将所有类别子目录放到 `data/fish_images/` 下即可，无需额外标注文件。

---

## 二、PyTorch 版本（推荐用于后端集成）

### 1. Conda 环境准备

```bash
conda create -n fish-ai python=3.10 -y
conda activate fish-ai

# CPU 版本（足够应对开发与论文演示）
pip install torch torchvision pillow
```

### 2. 开始训练（PyTorch）

`train_pytorch.py` 已经放在同目录下，直接运行即可：

```bash
cd backend/src/modules/ai/training
python train_pytorch.py
```

训练完成后会得到：

- 模型权重：`./models/fish_classifier_resnet18.pth`
- 类别索引映射：`./models/class_to_idx.pt`

这两个文件会在推理阶段被 `infer_pytorch.py` 和 NestJS 后端调用。

### 3. 单张图片推理（PyTorch）

```bash
python infer_pytorch.py --image path/to/your_fish_image.jpg
```

控制台会输出一行 JSON，例如：

```json
{
  "fishName": "salmon",
  "confidence": 0.92,
  "alternatives": [
    { "name": "sea_bass", "confidence": 0.04 },
    { "name": "tuna", "confidence": 0.02 }
  ]
}
```

NestJS 后端会通过 `child_process` 调用该脚本，并将 JSON 结果写入数据库、返回给前端。

---

## 三、TensorFlow 版本（保留，供对比或扩展）

### 1. 环境准备

```bash
pip install tensorflow==2.13.0
pip install numpy pillow
pip install tensorflowjs  # 可选：用于转换为TensorFlow.js
pip install tf2onnx       # 可选：用于转换为ONNX
```

### 2. 配置与训练

编辑 `train_model.py`，根据类别数量和机器情况调整：

```python
NUM_CLASSES = 20        # 鱼类种类数
DATA_DIR = './data/fish_images'  # 数据集路径
BATCH_SIZE = 32         # 批次大小
EPOCHS = 50             # 训练轮数
```

启动训练：

```bash
python train_model.py
```

模型会保存到 `./models/fish_classifier.h5`，同时生成 `training_history.json`，方便在论文中画训练曲线。

### 3. 模型转换（可选）

```python
convert_to_tensorflowjs('./models/fish_classifier.h5', './models/tfjs_model')
convert_to_onnx('./models/fish_classifier.h5', './models/fish_classifier.h5')
```

---

## 四、训练与论文写作建议

1. **数据增强**：随机翻转、旋转、颜色抖动等，可提升模型泛化能力；
2. **迁移学习**：两套方案都基于 ImageNet 预训练模型（MobileNetV3 / ResNet18）；
3. **评估指标**：建议在论文中给出 Top-1 / Top-3 准确率、混淆矩阵、部分可视化样例；
4. **资源配置**：在 Conda + PyTorch 环境下，CPU 也能完整跑通，只是时间略久；有 GPU 时可自动提速；
5. **与推荐模块结合**：识别到的鱼类 ID 可以作为后续个性化推荐的输入特征之一。

