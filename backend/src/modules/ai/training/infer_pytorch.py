"""
基于 PyTorch 的鱼类识别推理脚本

用法（命令行）：
    python infer_pytorch.py --image path/to/image.jpg

输出：
    在 stdout 打印一行 JSON，包含：
    {
      "fishName": "salmon",
      "confidence": 0.92,
      "alternatives": [
        {"name": "sea_bass", "confidence": 0.04},
        {"name": "tuna", "confidence": 0.02}
      ]
    }

后端 NestJS 可以通过 child_process 调用本脚本，并解析 JSON。
"""

import argparse
import json
import os

import torch
from torchvision import models, transforms
from PIL import Image


MODEL_DIR = "./models"
MODEL_PATH = os.path.join(MODEL_DIR, "fish_classifier_resnet18.pth")
CLASS_INDEX_PATH = os.path.join(MODEL_DIR, "class_to_idx.pt")

IMG_SIZE = 224


def load_model():
    if not os.path.isfile(MODEL_PATH) or not os.path.isfile(CLASS_INDEX_PATH):
        raise FileNotFoundError("模型或类别索引文件不存在，请先运行 train_pytorch.py 进行训练。")

    class_to_idx = torch.load(CLASS_INDEX_PATH, map_location="cpu")
    idx_to_class = {idx: cls for cls, idx in class_to_idx.items()}

    model = models.resnet18(weights=None)
    in_features = model.fc.in_features
    model.fc = torch.nn.Linear(in_features, len(class_to_idx))
    model.load_state_dict(torch.load(MODEL_PATH, map_location="cpu"))
    model.eval()

    return model, idx_to_class


def preprocess_image(image_path: str):
    if not os.path.isfile(image_path):
        raise FileNotFoundError(f"图片不存在: {image_path}")

    transform = transforms.Compose(
        [
            transforms.Resize((IMG_SIZE, IMG_SIZE)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225],
            ),
        ]
    )

    img = Image.open(image_path).convert("RGB")
    tensor = transform(img).unsqueeze(0)  # [1, C, H, W]
    return tensor


@torch.no_grad()
def predict(image_path: str):
    model, idx_to_class = load_model()
    tensor = preprocess_image(image_path)

    outputs = model(tensor)
    probs = torch.softmax(outputs, dim=1)[0]

    # Top-3
    top_probs, top_idxs = torch.topk(probs, k=min(3, probs.shape[0]))

    result = {
        "fishName": idx_to_class[int(top_idxs[0])],
        "confidence": float(top_probs[0]),
        "alternatives": [
            {
                "name": idx_to_class[int(idx)],
                "confidence": float(p),
            }
            for idx, p in zip(top_idxs[1:], top_probs[1:])
        ],
    }

    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", required=True, help="待识别图片路径")
    args = parser.parse_args()

    try:
        result = predict(args.image)
        print(json.dumps(result, ensure_ascii=False))
    except Exception as e:
        # 出错时也输出 JSON，方便后端统一处理
        error_obj = {"error": str(e)}
        print(json.dumps(error_obj, ensure_ascii=False))


if __name__ == "__main__":
    main()

