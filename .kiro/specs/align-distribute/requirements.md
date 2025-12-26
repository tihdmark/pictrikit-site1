# Requirements Document

## Introduction

本文档定义了对齐与分布（Align / Distribute）功能的需求规范。该功能允许用户对多个选中对象进行精确对齐和均匀分布，提升布局效率。

## Glossary

- **对齐（Align）**: 将多个对象按照指定边缘或中心线排列
- **分布（Distribute）**: 将多个对象按照等间距排列
- **ActiveSelection**: fabric.js 中多个元素临时选中时创建的特殊选择对象
- **Group**: 通过建组操作生成的对象组

## Requirements

### Requirement 1: 水平对齐

**User Story:** As a 用户, I want 将多个选中对象水平对齐, so that 我可以快速整理布局。

#### Acceptance Criteria

1. WHEN 用户选中多个对象并选择"左对齐"时, THE System SHALL 将所有对象的左边缘对齐到最左侧对象的左边缘。
2. WHEN 用户选中多个对象并选择"水平居中"时, THE System SHALL 将所有对象的中心点对齐到选区的水平中心线。
3. WHEN 用户选中多个对象并选择"右对齐"时, THE System SHALL 将所有对象的右边缘对齐到最右侧对象的右边缘。
4. THE System SHALL 在对齐后保存状态到历史记录。

### Requirement 2: 垂直对齐

**User Story:** As a 用户, I want 将多个选中对象垂直对齐, so that 我可以快速整理布局。

#### Acceptance Criteria

1. WHEN 用户选中多个对象并选择"顶部对齐"时, THE System SHALL 将所有对象的顶边缘对齐到最顶部对象的顶边缘。
2. WHEN 用户选中多个对象并选择"垂直居中"时, THE System SHALL 将所有对象的中心点对齐到选区的垂直中心线。
3. WHEN 用户选中多个对象并选择"底部对齐"时, THE System SHALL 将所有对象的底边缘对齐到最底部对象的底边缘。
4. THE System SHALL 在对齐后保存状态到历史记录。

### Requirement 3: 水平分布

**User Story:** As a 用户, I want 将多个选中对象水平均匀分布, so that 对象之间的间距相等。

#### Acceptance Criteria

1. WHEN 用户选中 3 个或更多对象并选择"水平分布"时, THE System SHALL 保持最左和最右对象位置不变，将中间对象均匀分布。
2. THE System SHALL 按对象中心点计算等间距。
3. IF 选中对象少于 3 个, THEN THE System SHALL 显示提示"至少需要选中 3 个对象"。
4. THE System SHALL 在分布后保存状态到历史记录。

### Requirement 4: 垂直分布

**User Story:** As a 用户, I want 将多个选中对象垂直均匀分布, so that 对象之间的间距相等。

#### Acceptance Criteria

1. WHEN 用户选中 3 个或更多对象并选择"垂直分布"时, THE System SHALL 保持最顶和最底对象位置不变，将中间对象均匀分布。
2. THE System SHALL 按对象中心点计算等间距。
3. IF 选中对象少于 3 个, THEN THE System SHALL 显示提示"至少需要选中 3 个对象"。
4. THE System SHALL 在分布后保存状态到历史记录。

### Requirement 5: 触发方式

**User Story:** As a 用户, I want 通过右键菜单访问对齐和分布功能, so that 操作便捷。

#### Acceptance Criteria

1. WHEN 用户选中多个对象并右键点击时, THE System SHALL 在右键菜单中显示"对齐"子菜单。
2. THE System SHALL 在"对齐"子菜单中包含：左对齐、水平居中、右对齐、顶部对齐、垂直居中、底部对齐。
3. WHEN 用户选中 3 个或更多对象时, THE System SHALL 在右键菜单中显示"分布"子菜单。
4. THE System SHALL 在"分布"子菜单中包含：水平分布、垂直分布。

### Requirement 6: 作用对象约束

**User Story:** As a 开发者, I want 对齐和分布功能仅作用于 ActiveSelection, so that 保持系统稳定性。

#### Acceptance Criteria

1. THE System SHALL 仅在 ActiveSelection 状态下启用对齐和分布功能。
2. THE System SHALL 在单对象或 Group 选中时禁用对齐和分布菜单项。
3. THE System SHALL 保持 ActiveSelection 禁止旋转的规则不变。
4. THE System SHALL 在对齐/分布操作后保持 ActiveSelection 状态。
