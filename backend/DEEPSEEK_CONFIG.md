# DeepSeek API 配置说明

## 1. 获取 API Key

1. 访问 [DeepSeek 开放平台](https://platform.deepseek.com/)
2. 注册/登录账号
3. 进入控制台，创建 API Key
4. 复制 API Key

## 2. 配置环境变量

在 `backend/.env` 文件中添加：

```env
DEEPSEEK_API_KEY=sk-your-api-key-here
```

## 3. 验证配置

启动后端服务后，查看日志：

- 如果看到 `DeepSeek API Key 已配置，长度: XX`，说明配置成功
- 如果看到 `DeepSeek API Key 未配置，将使用本地规则匹配`，说明未配置或配置错误

## 4. 测试 API 调用

发送一个测试问题，查看后端日志：

- **成功时**：会看到 `DeepSeek API 调用成功，回答长度: XX`
- **失败时**：会看到详细的错误信息，包括：
  - HTTP 状态码
  - 错误响应内容
  - 错误详情

## 5. 常见问题

### 问题1：API Key 无效
- **错误信息**：`401 Unauthorized` 或 `Invalid API Key`
- **解决方法**：检查 API Key 是否正确，是否已过期

### 问题2：模型不存在
- **错误信息**：`Model not found` 或 `400 Bad Request`
- **解决方法**：检查模型名称是否正确，DeepSeek 支持的模型：
  - `deepseek-chat`（默认）
  - `deepseek-chat-v2`（如果可用）

### 问题3：请求超时
- **错误信息**：`DeepSeek API 请求超时`
- **解决方法**：
  - 检查网络连接
  - 如果网络不稳定，系统会自动降级到本地规则匹配

### 问题4：API 调用失败但无详细错误
- **解决方法**：查看后端日志，所有 API 调用都有详细日志记录

## 6. 降级机制

如果 DeepSeek API 调用失败（网络问题、API Key 错误等），系统会自动降级到本地规则匹配，确保服务可用。

## 7. 调试技巧

1. **查看后端日志**：所有 API 调用都有详细日志
2. **检查环境变量**：确保 `.env` 文件中的 `DEEPSEEK_API_KEY` 正确
3. **测试 API Key**：可以使用 curl 或 Postman 直接测试 API Key 是否有效

```bash
curl https://api.deepseek.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "你好"}]
  }'
```

## 8. 模型选择

当前默认使用 `deepseek-chat`，如果需要使用其他模型，可以修改 `backend/src/modules/ai/chat.service.ts` 中的模型名称。
