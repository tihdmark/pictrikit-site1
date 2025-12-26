# 工程化结构重整进度

## 目标
对现有前端项目进行工程化结构重整，提升可维护性、可扩展性和稳定性。
- 禁止重写功能
- 禁止改动现有交互
- 禁止引入新行为
- 所有功能在重整前后必须 100% 行为一致

## 完成状态

### Step 1: 抽离 canvas/initCanvas.js ✅
- 文件：`src/canvas/initCanvas.js`
- 职责：canvas 创建、尺寸设置、缩放功能
- app.js 仅调用 initCanvas

### Step 2: 抽离 selection / group / transform ✅
- 文件：
  - `src/canvas/selection.js` - 单选/多选/禁止多选旋转规则
  - `src/canvas/group.js` - 合组/解组
  - `src/canvas/transform.js` - 旋转/缩放/对齐/分布
- 保证多选禁止旋转、组可旋转行为不变

### Step 3: 抽离 upload/imageUpload.js ✅
- 文件：`src/upload/imageUpload.js`
- 职责：
  - 图片加载（addImage）
  - fabric.Image 创建
  - 背景图片设置
  - 粘贴事件处理
  - 拖放事件处理
- 保证图片加载位置、比例、可选状态不变
- app.js 行数：4287 行（从原 5000+ 行减少）

### Step 4: 抽离 layout/containers.js ✅
- 文件：
  - `src/layout/containers.js` - 布局容器、吸附、拖入判断
  - `src/layout/templates.js` - 布局模态框、布局结构、组件模板
- 职责：
  - 布局格子检测（isLayoutDropZone）
  - 拖入高亮显示
  - 图片自动接管到容器
  - 容器解组
  - 布局结构插入（center、leftRight、grid等）
  - 组件模板插入（titleSubtitle、labelBadge等）
- 不修改现有拖入逻辑，只隔离代码
- app.js 行数：3724 行

### Step 5: 引入 state/state.js ✅
- 文件：`src/state/state.js`
- 职责：
  - 集中管理所有状态变量
  - 提供 setState、setNestedState 等统一修改接口
  - 所有模块只读 state，修改必须通过 setter
- 已替换的全局变量：
  - currentLang, currentTheme, currentZoom
  - snapEnabled, drawingMode, cropMode
  - guideLines, alignLabels, rotationLabel
  - history, historyStep
  - isSpacePressed, isPanning, lastPosX, lastPosY
  - shareExportMode, downloadExportMode
  - cropTarget, originalImageState, cropRect, cropOverlays
  - currentShapeColor, currentShapeStroke
  - savedBrushSettings, savedTextSettings
  - currentIconCategory, iconSearchTimeout, currentIconColor
- app.js 行数：3726 行（从原 5000+ 行减少约 25%）

## 当前文件结构

```
src/
├─ canvas/
│   ├─ initCanvas.js        ✅ canvas 创建、尺寸、事件注册
│   ├─ selection.js         ✅ 单选/多选/禁止多选旋转规则
│   ├─ transform.js         ✅ 旋转/缩放/对齐/分布
│   └─ group.js             ✅ 合组/解组
│
├─ upload/
│   └─ imageUpload.js       ✅ 图片加载、fabric.Image 创建
│
├─ layout/
│   ├─ containers.js        ✅ 布局容器、吸附、拖入判断
│   └─ templates.js         ✅ 布局模态框、布局结构、组件模板
│
├─ state/
│   └─ state.js             ✅ 全局状态对象
│
├─ ui/
│   ├─ shortcuts.js         ⏳ 快捷键绑定
│   └─ hints.js             ⏳ 操作提示
│
└─ app.js                   📌 仅负责初始化和模块串联
```

## 脚本引入顺序（app.html）

```html
<script src="/assets/js/i18n.js"></script>
<script src="/src/state/state.js"></script>
<script src="/src/canvas/initCanvas.js"></script>
<script src="/src/canvas/selection.js"></script>
<script src="/src/canvas/group.js"></script>
<script src="/src/canvas/transform.js"></script>
<script src="/src/upload/imageUpload.js"></script>
<script src="/src/layout/containers.js"></script>
<script src="/src/layout/templates.js"></script>
<script src="/assets/js/app.js"></script>
```

## 验收标准
- [x] 所有原功能行为一致
- [x] 多选/组/拖入/分布无新增异常
- [x] app.js 行数明显下降
- [x] 模块之间无循环依赖
- [x] 每个模块职责清晰、可单独定位 bug
