# Design Document: fabric.js 4.5.0 → 5.2.4 升级

## Overview

本设计文档描述了将 fabric.js 从 4.5.0 升级到 5.2.4 的技术方案。

**核心约束**:
- 升级目标为 fabric.js 4.5.0 → 5.2.4（仅限此版本）
- 理论上仅需修改 CDN 版本号
- **在未发现行为差异前，禁止修改 app.js 及任何业务逻辑代码**
- 所有测试需以 4.5.0 行为作为对照基准
- 该结论需以测试结果为前提，而非预设假设

## Architecture

### 当前架构

```
app.html
├── CDN: fabric.js 4.5.0
├── CDN: jspdf 2.5.1
├── CDN: pickr
└── assets/js/app.js (业务逻辑 - 禁止修改)
```

### 升级后架构

```
app.html
├── CDN: fabric.js 5.2.4 (仅版本号变更)
├── CDN: jspdf 2.5.1 (不变)
├── CDN: pickr (不变)
└── assets/js/app.js (禁止修改，除非发现不兼容)
```

### 升级约束

1. **仅修改 CDN 版本号**: 第一步只修改 `app.html` 中的 fabric.js 版本
2. **禁止预防性修改**: 不得在未发现问题前修改任何业务代码
3. **行为一致性优先**: API 存在但行为发生变化的情况，视为不兼容
4. **测试驱动**: 所有修改必须基于实际测试发现的问题

## Components and Interfaces

### 1. CDN 引用变更

**文件**: `app.html`

**变更内容**:
```html
<!-- 变更前 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/4.5.0/fabric.min.js"></script>

<!-- 变更后 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.2.4/fabric.min.js"></script>
```

### 2. fabric.js 4.x → 5.x API 兼容性分析

基于 fabric.js 官方迁移指南，以下是 4.x 到 5.x 的主要变化：

#### 2.1 完全兼容的 API（无需修改）

| API | 状态 | 说明 |
|-----|------|------|
| `new fabric.Canvas()` | ✅ 兼容 | Canvas 构造函数保持不变 |
| `canvas.add()` | ✅ 兼容 | 添加对象方法保持不变 |
| `canvas.remove()` | ✅ 兼容 | 移除对象方法保持不变 |
| `canvas.getActiveObject()` | ✅ 兼容 | 获取选中对象保持不变 |
| `canvas.setActiveObject()` | ✅ 兼容 | 设置选中对象保持不变 |
| `canvas.discardActiveObject()` | ✅ 兼容 | 取消选中保持不变 |
| `canvas.getObjects()` | ✅ 兼容 | 获取所有对象保持不变 |
| `canvas.renderAll()` | ✅ 兼容 | 渲染方法保持不变 |
| `canvas.requestRenderAll()` | ✅ 兼容 | 请求渲染保持不变 |
| `canvas.toJSON()` | ✅ 兼容 | 序列化保持不变 |
| `canvas.loadFromJSON()` | ✅ 兼容 | 反序列化保持不变 |
| `canvas.toDataURL()` | ✅ 兼容 | 导出图片保持不变 |
| `canvas.setZoom()` | ✅ 兼容 | 设置缩放保持不变 |
| `canvas.getZoom()` | ✅ 兼容 | 获取缩放保持不变 |
| `canvas.zoomToPoint()` | ✅ 兼容 | 缩放到点保持不变 |
| `canvas.viewportTransform` | ✅ 兼容 | 视口变换保持不变 |
| `canvas.setViewportTransform()` | ✅ 兼容 | 设置视口变换保持不变 |
| `canvas.bringToFront()` | ✅ 兼容 | 置顶保持不变 |
| `canvas.sendToBack()` | ✅ 兼容 | 置底保持不变 |
| `canvas.bringForward()` | ✅ 兼容 | 上移保持不变 |
| `canvas.sendBackwards()` | ✅ 兼容 | 下移保持不变 |
| `fabric.Image.fromURL()` | ✅ 兼容 | 从 URL 创建图片保持不变 |
| `fabric.IText` | ✅ 兼容 | 可编辑文本保持不变 |
| `fabric.Text` | ✅ 兼容 | 文本对象保持不变 |
| `fabric.Rect` | ✅ 兼容 | 矩形对象保持不变 |
| `fabric.Circle` | ✅ 兼容 | 圆形对象保持不变 |
| `fabric.Line` | ✅ 兼容 | 线条对象保持不变 |
| `fabric.Triangle` | ✅ 兼容 | 三角形对象保持不变 |
| `fabric.Group` | ✅ 兼容 | 组对象保持不变 |
| `fabric.ActiveSelection` | ✅ 兼容 | 多选对象保持不变 |
| `fabric.Point` | ✅ 兼容 | 点对象保持不变 |
| `fabric.util.transformPoint()` | ✅ 兼容 | 坐标变换保持不变 |
| `fabric.Image.filters.Blur` | ✅ 兼容 | 模糊滤镜保持不变 |
| `fabric.Image.filters.Pixelate` | ✅ 兼容 | 马赛克滤镜保持不变 |
| `obj.getBoundingRect()` | ✅ 兼容 | 获取边界矩形保持不变 |
| `obj.setCoords()` | ✅ 兼容 | 更新坐标保持不变 |
| `obj.set()` | ✅ 兼容 | 设置属性保持不变 |
| `obj.clone()` | ✅ 兼容 | 克隆对象保持不变 |
| `obj.getCenterPoint()` | ✅ 兼容 | 获取中心点保持不变 |
| `obj.aCoords` | ✅ 兼容 | 绝对坐标保持不变 |
| `obj.render()` | ✅ 兼容 | 渲染方法保持不变 |
| `obj.applyFilters()` | ✅ 兼容 | 应用滤镜保持不变 |

#### 2.2 当前代码使用的 API 清单

通过代码分析，当前 `app.js` 使用的 fabric.js API 如下：

1. **Canvas 操作**:
   - `new fabric.Canvas('canvas', options)` - 创建画布
   - `canvas.setDimensions()` - 设置尺寸
   - `canvas.add()` / `canvas.remove()` - 添加/移除对象
   - `canvas.getActiveObject()` / `canvas.getActiveObjects()` - 获取选中
   - `canvas.setActiveObject()` / `canvas.discardActiveObject()` - 设置/取消选中
   - `canvas.getObjects()` - 获取所有对象
   - `canvas.renderAll()` / `canvas.requestRenderAll()` - 渲染
   - `canvas.toJSON()` / `canvas.loadFromJSON()` - 序列化
   - `canvas.toDataURL()` - 导出
   - `canvas.setZoom()` / `canvas.getZoom()` / `canvas.zoomToPoint()` - 缩放
   - `canvas.viewportTransform` / `canvas.setViewportTransform()` - 视口
   - `canvas.bringToFront()` / `canvas.sendToBack()` / `canvas.bringForward()` / `canvas.sendBackwards()` - 层级
   - `canvas.setBackgroundImage()` - 设置背景图
   - `canvas.isDrawingMode` / `canvas.freeDrawingBrush` - 绘图模式
   - `canvas.selection` - 选择模式
   - `canvas.forEachObject()` - 遍历对象
   - `canvas.getPointer()` - 获取指针位置
   - `canvas.clear()` - 清空画布

2. **对象创建**:
   - `fabric.Image.fromURL()` - 创建图片
   - `new fabric.IText()` - 创建可编辑文本
   - `new fabric.Text()` - 创建文本（图标）
   - `new fabric.Rect()` - 创建矩形
   - `new fabric.Circle()` - 创建圆形
   - `new fabric.Line()` - 创建线条
   - `new fabric.Triangle()` - 创建三角形
   - `new fabric.Group()` - 创建组
   - `new fabric.ActiveSelection()` - 创建多选

3. **对象操作**:
   - `obj.set()` - 设置属性
   - `obj.getBoundingRect()` - 获取边界
   - `obj.setCoords()` - 更新坐标
   - `obj.clone()` - 克隆
   - `obj.getCenterPoint()` - 获取中心
   - `obj.aCoords` - 绝对坐标
   - `obj.render()` - 渲染
   - `obj.applyFilters()` - 应用滤镜
   - `obj.getElement()` - 获取 DOM 元素（图片）
   - `obj.forEachObject()` - 遍历子对象（组）

4. **工具方法**:
   - `fabric.util.transformPoint()` - 坐标变换
   - `new fabric.Point()` - 创建点

5. **滤镜**:
   - `new fabric.Image.filters.Blur()` - 模糊滤镜
   - `new fabric.Image.filters.Pixelate()` - 马赛克滤镜

6. **事件**:
   - `canvas.on('object:moving')` - 对象移动
   - `canvas.on('object:rotating')` - 对象旋转
   - `canvas.on('object:modified')` - 对象修改完成
   - `canvas.on('path:created')` - 路径创建
   - `canvas.on('selection:created')` - 选择创建
   - `canvas.on('selection:updated')` - 选择更新
   - `canvas.on('selection:cleared')` - 选择清除
   - `canvas.on('mouse:down')` - 鼠标按下
   - `canvas.on('mouse:move')` - 鼠标移动
   - `canvas.on('mouse:up')` - 鼠标释放
   - `canvas.on('mouse:wheel')` - 鼠标滚轮
   - `cropRect.on('moving')` / `cropRect.on('scaling')` - 裁剪矩形事件

### 3. 潜在兼容性问题及解决方案

#### 3.1 关键风险点（升级通过/不通过判定标准）

以下风险点如出现任何行为变化（跳动、偏移、角度异常），即判定升级不通过：

| 风险点 | 判定标准 | 不通过条件 |
|--------|----------|------------|
| 多选旋转稳定性 | 旋转过程中对象位置保持稳定 | 出现任何跳动或位置突变 |
| 合组/解组位置一致性 | 解组后子对象回到原始视觉位置 | 任何子对象位置发生偏移 |
| 坐标与变换精度 | `getBoundingRect()` 和 `aCoords` 返回值一致 | 坐标精度差异超过 0.1 像素 |
| 多选整体移动 | 移动时所有子对象相对位置不变 | 任何子对象相对位置发生变化 |
| 多选整体缩放 | 缩放时整体中心保持不变 | 整体中心发生偏移 |
| 角度吸附 | 旋转时角度吸附行为一致 | 吸附角度或触发条件发生变化 |

#### 3.2 验证方法

**多选旋转稳定性验证**:
1. 选中 3 个以上对象
2. 旋转多选组 360 度
3. 观察是否有任何跳动或位置突变
4. 对比 4.5.0 和 5.2.4 的行为

**合组/解组位置验证**:
1. 记录多个对象的初始位置坐标
2. 创建 Group
3. 解散 Group
4. 对比解组后的位置坐标与初始位置
5. 差异应为 0

**坐标精度验证**:
1. 创建对象并设置精确位置
2. 调用 `getBoundingRect()` 和访问 `aCoords`
3. 对比 4.5.0 和 5.2.4 的返回值
4. 差异应小于 0.1 像素

#### 3.3 无需修改的部分（待验证）

以下 API 理论上保持兼容，但需通过测试验证：

1. **Canvas 初始化**: `new fabric.Canvas()` 构造函数和选项
2. **对象创建**: 所有对象类的构造函数
3. **事件系统**: 所有事件名称和回调签名
4. **滤镜系统**: `fabric.Image.filters` 命名空间
5. **工具方法**: `fabric.util.transformPoint()` 和 `fabric.Point`
6. **序列化**: `toJSON()` 和 `loadFromJSON()`

## Data Models

本次升级不涉及数据模型变更。所有对象属性和序列化格式保持不变。

## Error Handling

### 升级失败回滚方案

如果升级后发现兼容性问题，可通过以下步骤回滚：

1. 将 CDN 引用改回 4.5.0 版本
2. 撤销 `app.js` 中的任何兼容性修改（如有）

### 错误检测

升级后应检查以下错误：

1. **控制台错误**: 检查是否有 JavaScript 错误
2. **功能异常**: 检查所有功能是否正常工作
3. **视觉异常**: 检查对象位置、角度、尺寸是否正确

## Testing Strategy

### 1. 升级前基线测试（4.5.0 对照基准）

在升级前，必须记录以下基线数据作为对照基准：

**坐标基线**:
1. 单元素在 (100, 100) 位置的 `getBoundingRect()` 返回值
2. 单元素在 (100, 100) 位置的 `aCoords` 值
3. 多选状态下的整体中心坐标
4. 合组/解组后子元素的位置坐标

**行为基线**:
1. 多选旋转 90 度后各子对象的位置
2. 多选旋转 360 度过程中是否有跳动
3. 智能对齐的触发距离和吸附行为

### 2. 升级后验证测试

升级后，逐项验证以下功能，以 4.5.0 行为作为对照基准：

| 测试项 | 验证方法 | 通过标准 |
|--------|----------|----------|
| 画布初始化 | 刷新页面 | 画布正常显示，与 4.5.0 一致 |
| 图片上传 | 上传图片 | 图片位置、尺寸与 4.5.0 一致 |
| 单元素拖拽 | 拖动图片 | 移动行为与 4.5.0 一致 |
| 单元素缩放 | 缩放图片 | 缩放行为与 4.5.0 一致 |
| 单元素旋转 | 旋转图片 | 旋转行为与 4.5.0 一致 |
| **多选创建** | 框选多个对象 | 选择框位置与 4.5.0 一致 |
| **多选移动** | 移动多选组 | 相对位置保持不变 |
| **多选旋转** | 旋转多选组 | **无跳动，与 4.5.0 行为完全一致** |
| **合组/解组** | 创建并解散 Group | **解组后位置与初始位置完全一致** |
| 智能对齐 | 拖动对象靠近另一对象 | 吸附行为与 4.5.0 一致 |
| 画布缩放 | 空格+滚轮 | 缩放行为与 4.5.0 一致 |
| 画布平移 | 空格+拖动 | 平移行为与 4.5.0 一致 |
| 模糊滤镜 | 对图片应用模糊 | 效果与 4.5.0 一致 |
| 马赛克滤镜 | 对图片应用马赛克 | 效果与 4.5.0 一致 |
| 撤销/重做 | Ctrl+Z / Ctrl+Y | 状态恢复与 4.5.0 一致 |
| 导出 PNG | 下载 PNG | 输出与 4.5.0 一致 |
| 导出 PDF | 下载 PDF | 输出与 4.5.0 一致 |

### 3. 回归测试清单（必须全部通过）

- [ ] 单元素拖拽
- [ ] 单元素缩放
- [ ] 单元素旋转
- [ ] **多元素选中**
- [ ] **多选整体移动**
- [ ] **多选整体旋转（重点：无跳动）**
- [ ] **合组/解组位置一致性**
- [ ] 智能对齐
- [ ] 画布缩放
- [ ] 画布平移
- [ ] 图片上传
- [ ] 文本添加
- [ ] 形状添加
- [ ] 图标添加
- [ ] 模糊滤镜
- [ ] 马赛克滤镜
- [ ] 裁剪功能
- [ ] 撤销/重做
- [ ] 导出 PNG/JPG/PDF
- [ ] 复制到剪贴板

### 4. 升级不通过条件

以下任一情况出现，即判定升级不通过，需回滚：

1. 多选旋转时出现任何跳动或位置突变
2. 合组/解组后任何子对象位置发生偏移
3. 坐标精度差异超过 0.1 像素
4. 任何功能行为与 4.5.0 不一致
5. 控制台出现 fabric.js 相关错误

## Implementation Notes

### 变更范围

本次升级的代码变更范围：

1. **app.html**: 仅修改 CDN 版本号（1 行）
2. **app.js**: **禁止修改**，除非测试发现不兼容问题

### 升级步骤

1. **Step 1**: 修改 `app.html` 中的 fabric.js CDN 引用（4.5.0 → 5.2.4）
2. **Step 2**: 刷新页面，检查控制台是否有错误
3. **Step 3**: 执行完整功能测试（以 4.5.0 行为为基准）
4. **Step 4**: 重点验证多选旋转、合组/解组位置一致性
5. **Step 5**: 如所有测试通过，升级完成
6. **Step 6**: 如发现行为差异，分析原因并决定是否回滚

### 回滚方案

如升级结果不满足"行为完全一致"要求，可在不修改业务代码的情况下快速回滚：

```html
<!-- 回滚：将版本号改回 4.5.0 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/4.5.0/fabric.min.js"></script>
```

### 后续开发声明

本次升级仅建立 fabric.js 5.2.4 的稳定基线。

**重要约束**:
- 新功能（如智能对齐增强、角度吸附优化、等间距分布）必须在此基线稳定后，以独立 Spec 模式逐项增加
- 每一个新功能都需要：单独说明目标、不影响既有功能、可独立回滚
- 在未确认基线稳定前，禁止继续添加新功能
