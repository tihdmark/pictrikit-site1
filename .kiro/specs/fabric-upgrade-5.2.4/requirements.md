# Requirements Document

## Introduction

本文档定义了将 fabric.js 从 4.5.0 升级到 5.2.4 的需求规范。升级的首要目标是保持所有现有功能行为 100% 不变，建立 fabric.js 5.2.4 的稳定基线。本次升级遵循最小差异原则，仅修复因 API 变化导致的报错或失效。

## Glossary

- **fabric.js**: 一个强大的 HTML5 Canvas 库，用于创建交互式对象模型
- **Canvas**: fabric.js 的核心画布对象，管理所有可视元素
- **ActiveSelection**: fabric.js 中用于多选对象的特殊组类型
- **Group**: fabric.js 中用于合组对象的容器类型
- **viewportTransform**: 画布视口变换矩阵，控制缩放和平移
- **aCoords**: 对象的绝对坐标（四个角点）
- **setCoords**: 更新对象坐标的方法

## Requirements

### Requirement 1: CDN 引用升级

**User Story:** As a 开发者, I want 将 fabric.js CDN 引用从 4.5.0 更新到 5.2.4, so that 项目使用新版本的 fabric.js 库。

#### Acceptance Criteria

1. WHEN app.html 加载时, THE System SHALL 从 CDN 加载 fabric.js 5.2.4 版本。
2. THE System SHALL 使用 cdnjs.cloudflare.com 作为 CDN 源。
3. IF CDN 加载失败, THEN THE System SHALL 在控制台显示错误信息。

### Requirement 2: Canvas 初始化兼容性

**User Story:** As a 用户, I want 画布初始化行为保持不变, so that 应用启动时画布正常显示。

#### Acceptance Criteria

1. WHEN 应用启动时, THE System SHALL 创建 fabric.Canvas 实例并设置白色背景。
2. THE System SHALL 保持 preserveObjectStacking 为 true。
3. THE System SHALL 保持 perPixelTargetFind 为 true。
4. THE System SHALL 保持 targetFindTolerance 为 5。

### Requirement 3: 单元素操作兼容性

**User Story:** As a 用户, I want 单个元素的拖拽、缩放、旋转行为保持不变, so that 我可以正常编辑单个对象。

#### Acceptance Criteria

1. WHEN 用户拖拽单个对象时, THE System SHALL 平滑移动对象位置。
2. WHEN 用户缩放单个对象时, THE System SHALL 按比例调整对象尺寸。
3. WHEN 用户旋转单个对象时, THE System SHALL 以对象中心为轴旋转。
4. THE System SHALL 在旋转时保持角度吸附功能（15度增量）。

### Requirement 4: 多元素选择兼容性

**User Story:** As a 用户, I want 多元素选择（ActiveSelection）行为保持不变, so that 我可以同时操作多个对象。

#### Acceptance Criteria

1. WHEN 用户框选多个对象时, THE System SHALL 创建 ActiveSelection 包含所有选中对象。
2. WHEN 用户使用 Ctrl+A 时, THE System SHALL 选中画布上所有对象。
3. WHILE 多个对象被选中, THE System SHALL 显示统一的选择边框和控制点。
4. THE System SHALL 保持多选状态下的整体中心不变。

### Requirement 5: 多选整体操作兼容性

**User Story:** As a 用户, I want 多选状态下的整体移动、缩放、旋转保持稳定, so that 我可以批量操作对象。

#### Acceptance Criteria

1. WHEN 用户移动多选对象时, THE System SHALL 保持所有子对象的相对位置不变。
2. WHEN 用户缩放多选对象时, THE System SHALL 按比例调整所有子对象尺寸。
3. WHEN 用户旋转多选对象时, THE System SHALL 以选择组中心为轴旋转，无跳动或突变。
4. THE System SHALL 在多选旋转时保持角度吸附功能。

### Requirement 6: 合组/解组兼容性

**User Story:** As a 用户, I want 合组和解组后元素位置保持不变, so that 我可以自由组织对象层级。

#### Acceptance Criteria

1. WHEN 用户创建 Group 时, THE System SHALL 保持所有子对象的视觉位置不变。
2. WHEN 用户解组 Group 时, THE System SHALL 将所有子对象恢复到原始视觉位置。
3. THE System SHALL 在解组后保持每个子对象的角度、尺寸、比例不变。
4. IF 解组后对象位置发生偏移, THEN THE System SHALL 自动修正偏移量。

### Requirement 7: 智能对齐兼容性

**User Story:** As a 用户, I want 智能对齐功能保持不变, so that 我可以精确对齐对象。

#### Acceptance Criteria

1. WHEN 用户拖动对象接近另一对象边缘时, THE System SHALL 显示对齐辅助线。
2. THE System SHALL 在对象边缘距离小于 2 像素时触发边缘吸附。
3. THE System SHALL 在对象边缘距离小于 5 像素时触发对齐吸附。
4. THE System SHALL 使用 fabric.util.transformPoint 正确转换坐标。

### Requirement 8: 视口变换兼容性

**User Story:** As a 用户, I want 画布缩放和平移功能保持不变, so that 我可以自由浏览画布内容。

#### Acceptance Criteria

1. WHEN 用户使用空格键+鼠标拖动时, THE System SHALL 平移画布视口。
2. WHEN 用户使用空格键+滚轮时, THE System SHALL 以鼠标位置为中心缩放画布。
3. THE System SHALL 保持 viewportTransform 矩阵操作的正确性。
4. THE System SHALL 在缩放时正确更新 zoomLevel 显示。

### Requirement 9: 图像滤镜兼容性

**User Story:** As a 用户, I want 图像滤镜功能保持不变, so that 我可以对图片应用模糊和马赛克效果。

#### Acceptance Criteria

1. WHEN 用户对图片应用模糊滤镜时, THE System SHALL 使用 fabric.Image.filters.Blur 创建滤镜。
2. WHEN 用户对图片应用马赛克滤镜时, THE System SHALL 使用 fabric.Image.filters.Pixelate 创建滤镜。
3. THE System SHALL 正确调用 applyFilters() 方法应用滤镜。
4. THE System SHALL 支持滤镜的添加和移除。

### Requirement 10: 对象序列化兼容性

**User Story:** As a 用户, I want 撤销/重做功能保持不变, so that 我可以恢复之前的操作状态。

#### Acceptance Criteria

1. WHEN 用户执行操作时, THE System SHALL 使用 canvas.toJSON() 保存状态。
2. WHEN 用户撤销时, THE System SHALL 使用 canvas.loadFromJSON() 恢复状态。
3. THE System SHALL 在状态恢复后正确渲染所有对象。
4. THE System SHALL 保持最多 50 步历史记录。

### Requirement 11: 禁止 6.x API 使用

**User Story:** As a 开发者, I want 确保不使用任何 fabric.js 6.x API, so that 代码与 5.2.4 版本完全兼容。

#### Acceptance Criteria

1. THE System SHALL 仅使用 fabric.js 5.2.4 文档中定义的 API。
2. THE System SHALL 避免使用任何 6.x 版本引入的新 API。
3. THE System SHALL 避免使用 6.x 版本的 transform/group/selection 行为。
4. IF 代码中存在 6.x API 调用, THEN THE System SHALL 在升级前移除或替换。

### Requirement 12: 最小差异原则

**User Story:** As a 开发者, I want 升级遵循最小差异原则, so that 代码变更可控且易于回滚。

#### Acceptance Criteria

1. THE System SHALL 仅修改因 API 变化导致的必要代码。
2. THE System SHALL 保持现有变量命名不变。
3. THE System SHALL 保持现有对象层级结构不变。
4. THE System SHALL 保持现有事件触发时机不变。
5. THE System SHALL 避免引入新的状态管理方式。
