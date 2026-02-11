# 鱼类识别模型训练指南

## 问题诊断

如果识别结果总是"三文鱼"，可能的原因：
1. **模型未训练**：`models/fish_classifier_resnet18.pth` 不存在
2. **模型训练失败**：训练过程中出错，使用了默认的mock数据
3. **数据集问题**：数据集不存在或格式不正确

## 快速开始

### 步骤1：准备数据集

数据集目录结构：
```
backend/src/modules/ai/training/
└── data/
    └── fish_images/
        ├── salmon/          # 三文鱼
        │   ├── img1.jpg
        │   ├── img2.jpg
        │   └── ...
        ├── sea_bass/        # 鲈鱼
        │   └── ...
        ├── tuna/            # 金枪鱼
        │   └── ...
        └── carp/            # 鲤鱼
            └── ...
```

**数据来源：**
1. **Kaggle数据集**（推荐）：
   - 访问：https://www.kaggle.com/datasets/crowww/a-large-scale-fish-dataset
   - 下载后解压，按类别整理到上述目录结构

2. **自己拍摄**：
   - 每类至少准备 50 张图片
   - 图片格式：jpg, jpeg, png
   - 建议图片大小：224x224 或更大

### 步骤2：激活Conda环境

```bash
# 如果还没有创建环境
conda create -n fish-ai python=3.10 -y
conda activate fish-ai

# 安装依赖
pip install torch torchvision pillow
```

### 步骤3：检查数据集

```bash
cd backend/src/modules/ai/training
python check_dataset.py
```

### 步骤4：开始训练

```bash
# 在conda环境中运行
python train_pytorch.py
```

训练过程会显示：
- 每个epoch的训练损失和准确率
- 验证集损失和准确率
- 最优模型会自动保存

训练完成后会生成：
- `models/fish_classifier_resnet18.pth` - 模型权重
- `models/class_to_idx.pt` - 类别索引映射

### 步骤5：测试模型

```bash
python infer_pytorch.py --image path/to/test_image.jpg
```

## 训练参数调整

编辑 `train_pytorch.py` 可以调整：

```python
EPOCHS = 30          # 训练轮数（可根据数据集大小调整）
BATCH_SIZE = 32      # 批次大小
LEARNING_RATE = 1e-4 # 学习率
```

## 常见问题

### Q: 训练时提示"数据目录不存在"
A: 确保 `data/fish_images/` 目录存在，并且里面有按类别分组的图片

### Q: 训练很慢
A: 
- 减少 `EPOCHS` 数量（先用10-15轮测试）
- 减少 `BATCH_SIZE`（如果内存不足）
- 使用GPU（如果有）：会自动检测并使用

### Q: 识别准确率低
A:
- 增加每类的图片数量（建议每类100+张）
- 增加训练轮数
- 检查图片质量（清晰度、角度多样性）

### Q: 模型文件在哪里？
A: 训练完成后在 `backend/src/modules/ai/training/models/` 目录下

## Windows快速启动（使用批处理文件）

```bash
# 双击运行或在命令行执行
backend/src/modules/ai/training/run_training.bat
```

## 验证训练是否成功

训练完成后，检查：
1. `models/fish_classifier_resnet18.pth` 文件是否存在
2. `models/class_to_idx.pt` 文件是否存在
3. 重启后端服务，再次测试识别功能

如果模型文件存在，后端会自动使用训练好的模型，不再返回默认的"三文鱼"结果。
