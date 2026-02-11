# AI识别功能说明

## 模型训练

模型已训练完成，位于：
- `backend/src/modules/ai/training/models/fish_classifier_resnet18.pth` (42.73 MB)
- `backend/src/modules/ai/training/models/class_to_idx.pt` (类别索引)

## 识别功能

### 1. 模型测试
测试脚本：`backend/src/modules/ai/training/test_model.py`
- 准确率：100%（测试集）
- 置信度：平均 99%+

### 2. API测试
测试脚本：`backend/src/modules/ai/training/test_api.py`
- 登录 → 上传图片 → 识别
- 返回中文鱼类名称和置信度

### 3. 识别流程

1. **前端上传图片** → `/upload` 接口
2. **获取图片URL** → `http://localhost:3000/uploads/xxx.png`
3. **调用识别接口** → `POST /ai/recognize`，参数：`{ imageUrl: "..." }`
4. **后端处理**：
   - 将URL转换为本地文件路径
   - 调用PyTorch推理脚本：`infer_pytorch.py`
   - 将英文类别名转换为中文
   - 返回识别结果

### 4. 鱼类名称映射

支持9个类别：
- `black_sea_sprat` → 黑海鲱鱼
- `gilt_head_bream` → 金头鲷
- `mackerel` → 鲭鱼
- `red_mullet` → 红鲻鱼
- `red_sea_bream` → 红鲷
- `sea_bass` → 鲈鱼
- `shrimp` → 虾
- `striped_red_mullet` → 条纹红鲻鱼
- `trout` → 鳟鱼

### 5. 配置

**Python路径**：
- Windows默认：`D:\Anaconda\envs\pytorch\python.exe`
- 可通过环境变量 `PYTHON_PATH` 配置

**工作目录**：
- 训练脚本目录：`backend/src/modules/ai/training/`
- 上传文件目录：`backend/uploads/`

### 6. 故障排查

如果识别返回模拟数据（"三文鱼"），说明PyTorch调用失败：

1. **检查Python路径**：确保 `D:\Anaconda\envs\pytorch\python.exe` 存在
2. **检查模型文件**：确保 `models/fish_classifier_resnet18.pth` 和 `models/class_to_idx.pt` 存在
3. **检查图片路径**：确保上传的图片文件存在
4. **查看后端日志**：检查是否有错误信息

### 7. 重启后端服务

修改代码后需要重启后端服务：
```bash
cd backend
npm run start:dev
```

## 前端使用

1. 进入"识别"页面
2. 点击"选择图片"
3. 选择或拍摄鱼类图片
4. 点击"开始识别"
5. 查看识别结果（中文名称、置信度、备选结果）
