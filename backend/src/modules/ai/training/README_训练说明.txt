========================================
鱼类识别模型训练 - 完整指南
========================================

一、环境准备
-----------
1. Conda环境路径: D:\Anaconda\envs\pytorch
2. 已安装: PyTorch, torchvision, pillow

二、数据集准备（3种方法任选其一）
--------------------------------

方法1：Kaggle数据集（推荐，最快）
1. 访问: https://www.kaggle.com/datasets/crowww/a-large-scale-fish-dataset
2. 下载数据集
3. 解压后，将图片按类别整理到:
   backend/src/modules/ai/training/data/fish_images/
   例如:
   - salmon/ 文件夹放入三文鱼图片
   - sea_bass/ 文件夹放入鲈鱼图片
   - tuna/ 文件夹放入金枪鱼图片
   - 等等...

方法2：手动收集（10-15分钟）
1. 打开浏览器，搜索图片
2. 搜索关键词:
   - "salmon fish images"
   - "sea bass fish images"
   - "tuna fish images"
   - 等等...
3. 下载图片，按类别放入对应文件夹
4. 每类至少 10-20 张图片即可开始测试

方法3：使用已有图片
如果您已经有鱼类图片，直接按类别整理即可

三、开始训练
-----------

最简单的方式：双击运行
  训练.bat

或手动运行：
  cd backend/src/modules/ai/training
  D:\Anaconda\envs\pytorch\python.exe train_pytorch.py

四、训练参数（已优化）
-------------------
- BATCH_SIZE = 16 (适应较小数据集)
- EPOCHS = 20 (快速测试)
- 自动适配Windows环境

五、训练完成后
-------------
1. 模型文件会保存在: models/fish_classifier_resnet18.pth
2. 重启后端服务
3. 在前端测试识别功能

六、常见问题
-----------
Q: 训练时提示"数据目录不存在"
A: 先运行: python download_fish_dataset.py 创建目录

Q: 训练很慢
A: 正常，CPU训练会慢一些。可以减少EPOCHS到10进行快速测试

Q: 识别效果不好
A: 增加每类的图片数量（建议每类100+张），增加训练轮数

========================================
当前状态
========================================
数据集目录: backend/src/modules/ai/training/data/fish_images/
模型保存: backend/src/modules/ai/training/models/

下一步: 准备数据 → 运行训练
