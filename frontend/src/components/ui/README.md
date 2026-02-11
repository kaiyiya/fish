# UI 组件库

统一的UI组件库，提供一致的样式和交互体验。

## 组件列表

### Button 按钮

统一的按钮组件，支持多种类型和尺寸。

#### 使用示例

```tsx
import { Button } from '../../components/ui'

// 主要按钮（渐变紫色）
<Button type="primary" size="large" onClick={handleClick}>
  保存
</Button>

// 次要按钮（蓝色）
<Button type="secondary" size="medium" onClick={handleClick}>
  取消
</Button>

// 危险按钮（红色）
<Button type="danger" size="small" onClick={handleDelete}>
  删除
</Button>

// 默认按钮（白色背景）
<Button type="default" size="medium" onClick={handleClick}>
  取消
</Button>

// 块级按钮（占满宽度）
<Button type="primary" size="large" block onClick={handleClick}>
  提交
</Button>

// 加载状态
<Button type="primary" loading={true}>
  提交中...
</Button>
```

#### Props

- `type`: 'primary' | 'secondary' | 'danger' | 'default' - 按钮类型
- `size`: 'large' | 'medium' | 'small' | 'mini' - 按钮尺寸
- `block`: boolean - 是否块级按钮
- `loading`: boolean - 是否加载中
- `disabled`: boolean - 是否禁用
- `onClick`: function - 点击事件
- `className`: string - 自定义类名

### Input 输入框

统一的输入框组件，支持前缀。

#### 使用示例

```tsx
import { Input } from '../../components/ui'

// 普通输入框
<Input
  value={value}
  onInput={(e) => setValue(e.detail.value)}
  placeholder="请输入"
/>

// 带前缀的输入框（如价格）
<Input
  type="digit"
  value={price}
  prefix="¥"
  onInput={(e) => setPrice(e.detail.value)}
  placeholder="0.00"
/>
```

#### Props

- `type`: string - 输入框类型（text, number, digit等）
- `placeholder`: string - 占位符
- `value`: string - 值
- `onInput`: function - 输入事件
- `disabled`: boolean - 是否禁用
- `prefix`: string - 前缀（如"¥"）
- `className`: string - 自定义类名

### Card 卡片

统一的卡片组件。

#### 使用示例

```tsx
import { Card } from '../../components/ui'

<Card shadow hover onClick={handleClick}>
  <Text>卡片内容</Text>
</Card>
```

#### Props

- `shadow`: boolean - 是否显示阴影
- `hover`: boolean - 是否显示悬停效果
- `onClick`: function - 点击事件
- `className`: string - 自定义类名

## 样式规范

所有组件遵循统一的设计规范：

- **主色调**: 紫色渐变 (#667eea → #764ba2)
- **次要色**: 蓝色 (#1890ff)
- **危险色**: 红色 (#ff4d4f)
- **圆角**: 12px (大按钮), 10px (小按钮)
- **阴影**: 统一的阴影效果
- **过渡**: 0.3s 过渡动画

## 使用建议

1. 优先使用公共组件，保持样式一致性
2. 如需自定义样式，通过 `className` 属性覆盖
3. 按钮尺寸选择：
   - `large`: 重要操作（登录、购买、保存）
   - `medium`: 一般操作（默认）
   - `small`: 次要操作（编辑、删除）
   - `mini`: 列表中的小按钮
