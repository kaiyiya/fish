"""
鱼类图像识别模型训练脚本
使用预训练MobileNetV3进行迁移学习
"""

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.applications import MobileNetV3Large
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau
import numpy as np
import os

# 配置
IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 50
NUM_CLASSES = 20  # 根据实际鱼类种类数调整
DATA_DIR = './data/fish_images'  # 数据集路径
MODEL_SAVE_PATH = './models/fish_classifier.h5'

def create_model(num_classes):
    """
    创建基于MobileNetV3的迁移学习模型
    """
    # 加载预训练的MobileNetV3（在ImageNet上训练）
    base_model = MobileNetV3Large(
        weights='imagenet',  # 使用ImageNet预训练权重
        include_top=False,   # 不包含顶层分类器
        input_shape=(IMG_SIZE, IMG_SIZE, 3),
        alpha=1.0,           # 宽度乘数
        minimalistic=False,
        pooling=None
    )
    
    # 冻结基础模型的前几层（可选）
    # base_model.trainable = False  # 完全冻结
    # 或者只冻结前N层
    for layer in base_model.layers[:-10]:  # 只训练最后10层
        layer.trainable = False
    
    # 构建完整模型
    model = keras.Sequential([
        base_model,
        GlobalAveragePooling2D(),
        Dense(512, activation='relu'),
        Dropout(0.5),
        Dense(256, activation='relu'),
        Dropout(0.3),
        Dense(num_classes, activation='softmax')
    ])
    
    # 编译模型
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.0001),
        loss='categorical_crossentropy',
        metrics=['accuracy', 'top_3_accuracy']
    )
    
    return model

def prepare_data(data_dir):
    """
    准备训练数据
    """
    # 数据增强配置
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest',
        validation_split=0.2  # 20%作为验证集
    )
    
    # 验证数据生成器（不做增强）
    val_datagen = ImageDataGenerator(
        rescale=1./255,
        validation_split=0.2
    )
    
    # 训练数据生成器
    train_generator = train_datagen.flow_from_directory(
        data_dir,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='training',
        shuffle=True
    )
    
    # 验证数据生成器
    val_generator = val_datagen.flow_from_directory(
        data_dir,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='validation',
        shuffle=False
    )
    
    return train_generator, val_generator

def train():
    """
    训练模型
    """
    print("🚀 开始训练鱼类识别模型...")
    
    # 准备数据
    print("📁 准备数据集...")
    train_gen, val_gen = prepare_data(DATA_DIR)
    
    # 获取类别数
    num_classes = len(train_gen.class_indices)
    print(f"📊 检测到 {num_classes} 个鱼类类别")
    print(f"类别映射: {train_gen.class_indices}")
    
    # 创建模型
    print("🏗️  构建模型...")
    model = create_model(num_classes)
    model.summary()
    
    # 回调函数
    callbacks = [
        # 保存最佳模型
        ModelCheckpoint(
            MODEL_SAVE_PATH,
            monitor='val_accuracy',
            save_best_only=True,
            verbose=1
        ),
        # 早停
        EarlyStopping(
            monitor='val_loss',
            patience=10,
            restore_best_weights=True,
            verbose=1
        ),
        # 学习率调整
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=5,
            min_lr=0.00001,
            verbose=1
        )
    ]
    
    # 训练模型
    print("🎯 开始训练...")
    history = model.fit(
        train_gen,
        epochs=EPOCHS,
        validation_data=val_gen,
        callbacks=callbacks,
        verbose=1
    )
    
    print(f"✅ 训练完成！模型已保存到: {MODEL_SAVE_PATH}")
    
    # 保存训练历史
    import json
    with open('./models/training_history.json', 'w') as f:
        json.dump(history.history, f)
    
    # 评估模型
    print("\n📈 评估模型性能...")
    val_loss, val_acc, val_top3_acc = model.evaluate(val_gen, verbose=1)
    print(f"验证集准确率: {val_acc:.4f}")
    print(f"验证集Top-3准确率: {val_top3_acc:.4f}")
    
    return model, history

def convert_to_tensorflowjs(model_path, output_path):
    """
    将模型转换为TensorFlow.js格式（用于前端部署）
    """
    import tensorflowjs as tfjs
    
    print(f"🔄 转换模型为TensorFlow.js格式...")
    tfjs.converters.save_keras_model(
        keras.models.load_model(model_path),
        output_path
    )
    print(f"✅ 模型已转换为TensorFlow.js格式: {output_path}")

def convert_to_onnx(model_path, output_path):
    """
    将模型转换为ONNX格式（用于跨平台部署）
    """
    import tf2onnx
    
    print(f"🔄 转换模型为ONNX格式...")
    model = keras.models.load_model(model_path)
    
    spec = (tf.TensorSpec((None, IMG_SIZE, IMG_SIZE, 3), tf.float32, name="input"),)
    output_path_onnx = output_path.replace('.h5', '.onnx')
    model_proto, _ = tf2onnx.convert.from_keras(model, input_signature=spec, opset=13)
    
    with open(output_path_onnx, "wb") as f:
        f.write(model_proto.SerializeToString())
    
    print(f"✅ 模型已转换为ONNX格式: {output_path_onnx}")

if __name__ == '__main__':
    # 设置GPU（如果有）
    gpus = tf.config.experimental.list_physical_devices('GPU')
    if gpus:
        try:
            for gpu in gpus:
                tf.config.experimental.set_memory_growth(gpu, True)
            print(f"✅ 使用GPU: {gpus}")
        except RuntimeError as e:
            print(f"❌ GPU设置错误: {e}")
    
    # 创建模型保存目录
    os.makedirs('./models', exist_ok=True)
    
    # 训练模型
    model, history = train()
    
    # 可选：转换为其他格式
    # convert_to_tensorflowjs(MODEL_SAVE_PATH, './models/tfjs_model')
    # convert_to_onnx(MODEL_SAVE_PATH, MODEL_SAVE_PATH)
