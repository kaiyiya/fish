"""
基于 PyTorch 的鱼类图像识别模型训练脚本

特点：
- 使用 torchvision 提供的预训练模型（默认 ResNet18）
- 支持数据增强、训练集 / 验证集划分
- 适配与 TensorFlow 版本相同的数据目录结构：

data/
└── fish_images/
    ├── salmon/
    │   ├── xxx.jpg
    ├── sea_bass/
    └── ...
"""

import os
from pathlib import Path

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, models, transforms


# 基本配置
DATA_DIR = "./data/fish_images"
MODEL_DIR = "./models"
MODEL_PATH = os.path.join(MODEL_DIR, "fish_classifier_resnet18.pth")
CLASS_INDEX_PATH = os.path.join(MODEL_DIR, "class_to_idx.pt")

IMG_SIZE = 224
BATCH_SIZE = 16  # 降低批次大小，适应较小的数据集
EPOCHS = 20  # 减少训练轮数，快速测试
LEARNING_RATE = 1e-4
WEIGHT_DECAY = 1e-4
NUM_WORKERS = 2  # Windows上减少worker数量
VAL_SPLIT = 0.2
SEED = 42


def set_seed(seed: int = 42):
    import random
    import numpy as np

    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)


def create_dataloaders(data_dir: str):
    """
    使用 ImageFolder + 随机划分训练 / 验证集
    """
    if not os.path.isdir(data_dir):
        raise RuntimeError(f"数据目录不存在: {data_dir}")

    # 数据增强与预处理
    train_transform = transforms.Compose(
        [
            transforms.Resize((IMG_SIZE, IMG_SIZE)),
            transforms.RandomHorizontalFlip(),
            transforms.RandomRotation(15),
            transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225],
            ),
        ]
    )

    val_transform = transforms.Compose(
        [
            transforms.Resize((IMG_SIZE, IMG_SIZE)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225],
            ),
        ]
    )

    full_dataset = datasets.ImageFolder(data_dir, transform=train_transform)
    num_classes = len(full_dataset.classes)

    # 按 VAL_SPLIT 比例划分
    val_size = int(len(full_dataset) * VAL_SPLIT)
    train_size = len(full_dataset) - val_size
    train_dataset, val_dataset = torch.utils.data.random_split(
        full_dataset, [train_size, val_size]
    )
    # 验证集使用 val_transform
    val_dataset.dataset.transform = val_transform

    # Windows上num_workers=0可以避免多进程问题
    import platform
    workers = 0 if platform.system() == 'Windows' else NUM_WORKERS
    
    train_loader = DataLoader(
        train_dataset,
        batch_size=BATCH_SIZE,
        shuffle=True,
        num_workers=workers,
        pin_memory=False if workers == 0 else True,
    )
    val_loader = DataLoader(
        val_dataset,
        batch_size=BATCH_SIZE,
        shuffle=False,
        num_workers=workers,
        pin_memory=False if workers == 0 else True,
    )

    return train_loader, val_loader, num_classes, full_dataset.class_to_idx


def create_model(num_classes: int):
    """
    基于 ResNet18 的迁移学习模型
    """
    model = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)
    in_features = model.fc.in_features
    model.fc = nn.Linear(in_features, num_classes)
    return model


def train_one_epoch(model, criterion, optimizer, dataloader, device):
    model.train()
    total_loss = 0.0
    correct = 0
    total = 0

    for inputs, labels in dataloader:
        inputs = inputs.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        total_loss += loss.item() * inputs.size(0)
        _, preds = torch.max(outputs, 1)
        correct += (preds == labels).sum().item()
        total += labels.size(0)

    avg_loss = total_loss / total if total > 0 else 0.0
    acc = correct / total if total > 0 else 0.0
    return avg_loss, acc


@torch.no_grad()
def evaluate(model, criterion, dataloader, device):
    model.eval()
    total_loss = 0.0
    correct = 0
    total = 0

    for inputs, labels in dataloader:
        inputs = inputs.to(device)
        labels = labels.to(device)

        outputs = model(inputs)
        loss = criterion(outputs, labels)

        total_loss += loss.item() * inputs.size(0)
        _, preds = torch.max(outputs, 1)
        correct += (preds == labels).sum().item()
        total += labels.size(0)

    avg_loss = total_loss / total if total > 0 else 0.0
    acc = correct / total if total > 0 else 0.0
    return avg_loss, acc


def main():
    print("="*60)
    print("使用 PyTorch 训练鱼类识别模型")
    print("="*60)
    print(f"数据目录: {os.path.abspath(DATA_DIR)}")
    print(f"模型保存目录: {os.path.abspath(MODEL_DIR)}")
    print()
    
    set_seed(SEED)

    os.makedirs(MODEL_DIR, exist_ok=True)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"使用设备: {device}")
    if device.type == 'cpu':
        print("  [WARN] 使用CPU训练，速度较慢，建议使用GPU或减少训练轮数")
    print()

    try:
        train_loader, val_loader, num_classes, class_to_idx = create_dataloaders(DATA_DIR)
    except RuntimeError as e:
        print(f"[ERROR] 错误: {e}")
        print()
        print("请确保:")
        print(f"  1. 数据目录存在: {os.path.abspath(DATA_DIR)}")
        print("  2. 目录下有按类别分组的图片文件夹")
        print("  3. 每个类别文件夹中有图片文件（jpg, jpeg, png）")
        return
    
    print(f"检测到 {num_classes} 个鱼类类别: {list(class_to_idx.keys())}")
    
    # 统计数据集大小
    total_train = len(train_loader.dataset)
    total_val = len(val_loader.dataset)
    print(f"训练集: {total_train} 张, 验证集: {total_val} 张")
    
    # 估算训练时间
    batches_per_epoch = len(train_loader)
    total_batches = batches_per_epoch * EPOCHS
    print(f"每个epoch: {batches_per_epoch} 个batch, 共 {EPOCHS} 个epoch")
    print(f"总batch数: {total_batches}")
    if device.type == 'cpu':
        estimated_time = total_batches * 2  # 假设每个batch 2秒（CPU）
        print(f"预计训练时间: 约 {estimated_time // 60} 分钟 ({estimated_time} 秒)")
    else:
        estimated_time = total_batches * 0.1  # GPU更快
        print(f"预计训练时间: 约 {estimated_time // 60} 分钟 ({estimated_time} 秒)")
    print()
    
    if total_train < 50:
        print("[WARN] 训练集图片较少，可能影响模型效果")
        print("       建议每类至少准备 20-50 张图片")
    print()

    model = create_model(num_classes).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(
        model.parameters(), lr=LEARNING_RATE, weight_decay=WEIGHT_DECAY
    )

    best_val_acc = 0.0
    print(f"开始训练，共 {EPOCHS} 轮...")
    print("="*60)

    for epoch in range(1, EPOCHS + 1):
        train_loss, train_acc = train_one_epoch(
            model, criterion, optimizer, train_loader, device
        )
        val_loss, val_acc = evaluate(model, criterion, val_loader, device)

        print(
            f"Epoch [{epoch:2d}/{EPOCHS}] | "
            f"Train: Loss={train_loss:.4f} Acc={train_acc:.4f} | "
            f"Val: Loss={val_loss:.4f} Acc={val_acc:.4f}"
        )

        # 保存最优模型
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), MODEL_PATH)
            torch.save(class_to_idx, CLASS_INDEX_PATH)
            print(f"   [OK] 保存更优模型 (Val Acc = {best_val_acc:.4f})")

    print("="*60)
    print("[SUCCESS] 训练完成！")
    print(f"最优模型保存在: {os.path.abspath(MODEL_PATH)}")
    print(f"类别索引映射保存在: {os.path.abspath(CLASS_INDEX_PATH)}")
    print(f"最佳验证准确率: {best_val_acc:.4f}")
    print()
    print("下一步:")
    print("  1. 重启后端服务")
    print("  2. 在前端测试识别功能")


if __name__ == "__main__":
    main()

