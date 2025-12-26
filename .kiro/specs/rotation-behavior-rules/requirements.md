# Requirements Document

## Introduction

本文档定义了在 fabric.js 5.2.4 稳定基线之上的对象旋转与多选行为规则。本次调整为设计层面的行为约束，从机制上避免历史版本中多元素旋转跳动、位置偏移等问题。核心原则是：多选旋转被视为设计上不允许的操作，而非待修 bug。

## Glossary

- **fabric.Object**: fabric.js 中的单个对象（图片、文本、形状等）
- **fabric.Group**: 通过建组操作生成的对象组，包含多个子对象
- **ActiveSelection**: fabric.js 中多个元素临时选中时创建的特殊选择对象
- **旋转控制柄**: 对象选中时显示的用于旋转的圆形控制点
- **解组**: 将 Group 拆分为独立对象的操作

## Requirements

### Requirement 1: 单对象旋转权限

**User Story:** As a 用户, I want 能够旋转单个对象, so that 我可以调整对象的角度。

#### Acceptance Criteria

1. WHEN 用户选中单个 fabric.Object 时, THE System SHALL 显示旋转控制柄。
2. WHEN 用户拖动旋转控制柄时, THE System SHALL 以对象中心为轴旋转对象。
3. THE System SHALL 在旋转时支持角度吸附功能（15度增量）。
4. THE System SHALL 在旋转完成后保存状态到历史记录。

### Requirement 2: Group 旋转权限

**User Story:** As a 用户, I want 能够旋转通过建组生成的 Group, so that 我可以整体调整一组对象的角度。

#### Acceptance Criteria

1. WHEN 用户选中 fabric.Group 时, THE System SHALL 显示旋转控制柄。
2. WHEN 用户旋转 Group 时, THE System SHALL 仅作用于 Group 自身。
3. THE System SHALL 在 Group 旋转时保持所有子元素的相对位置不变。
4. THE System SHALL 在旋转时支持角度吸附功能。

### Requirement 3: ActiveSelection 旋转禁止

**User Story:** As a 用户, I want 在多选状态下无法旋转, so that 我不会遇到旋转跳动或位置偏移问题。

#### Acceptance Criteria

1. WHEN 用户框选多个对象创建 ActiveSelection 时, THE System SHALL 隐藏旋转控制柄。
2. THE System SHALL 禁止 ActiveSelection 进入任何旋转计算流程。
3. IF 用户尝试通过任何方式旋转 ActiveSelection, THEN THE System SHALL 显示提示："多个元素无法直接旋转，请先建组"。
4. THE System SHALL 确保 ActiveSelection 的 hasRotatingPoint 属性为 false。
5. THE System SHALL 确保 ActiveSelection 的 lockRotation 属性为 true。

### Requirement 4: 解组位置一致性

**User Story:** As a 用户, I want 解组后所有子元素保持原位, so that 我可以自由组织对象而不担心位置偏移。

#### Acceptance Criteria

1. WHEN 用户解组 Group 时, THE System SHALL 保持所有子元素的视觉位置与解组前完全一致。
2. THE System SHALL 保持所有子元素的角度与解组前完全一致。
3. THE System SHALL 保持所有子元素的缩放比例与解组前完全一致。
4. IF 解组后任何子元素位置发生偏移, THEN THE System SHALL 自动修正偏移量。

### Requirement 5: 旋转提示交互

**User Story:** As a 用户, I want 在尝试旋转多选时获得明确提示, so that 我知道需要先建组才能旋转。

#### Acceptance Criteria

1. WHEN 用户在 ActiveSelection 状态下尝试旋转时, THE System SHALL 显示 Toast 提示。
2. THE System SHALL 使用多语言支持显示提示信息。
3. THE System SHALL 在提示中明确说明解决方案（建组）。
4. THE System SHALL 在 2 秒后自动隐藏提示。

### Requirement 6: 建组功能支持

**User Story:** As a 用户, I want 能够将多选对象建组, so that 我可以对多个对象进行整体旋转。

#### Acceptance Criteria

1. WHEN 用户选中多个对象时, THE System SHALL 提供建组功能入口。
2. WHEN 用户执行建组操作时, THE System SHALL 创建 fabric.Group 包含所有选中对象。
3. THE System SHALL 在建组后自动选中新创建的 Group。
4. THE System SHALL 在建组后保存状态到历史记录。
