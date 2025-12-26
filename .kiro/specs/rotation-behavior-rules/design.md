# Design Document: 对象旋转与多选行为规则

## Overview

本设计文档描述了在 fabric.js 5.2.4 基线上实现对象旋转与多选行为规则的技术方案。核心设计原则是：**多选旋转被视为设计上不允许的操作，而非待修 bug**。通过禁止 ActiveSelection 旋转，从机制上彻底避免多元素旋转跳动、位置偏移等问题。

## Architecture

### 旋转权限矩阵

| 对象类型 | 允许旋转 | 显示旋转控制柄 | 旋转行为 |
|----------|----------|----------------|----------|
| fabric.Object（单对象） | ✅ 是 | ✅ 是 | 以对象中心为轴旋转 |
| fabric.Group（建组） | ✅ 是 | ✅ 是 | 仅作用于 Group 自身 |
| ActiveSelection（多选） | ❌ 否 | ❌ 否 | 禁止，显示提示 |

### 实现架构

```
app.js
├── ActiveSelection 旋转禁止
│   ├── 隐藏旋转控制柄 (hasRotatingPoint: false)
│   ├── 锁定旋转 (lockRotation: true)
│   └── 旋转尝试拦截 → 显示提示
├── Group 旋转支持
│   ├── 正常旋转行为
│   └── 解组位置修正
└── 建组/解组功能
    ├── 建组：多选 → Group
    └── 解组：Group → 独立对象（位置一致）
```

## Components and Interfaces

### 1. ActiveSelection 旋转禁止实现

**实现位置**: `assets/js/app.js`

**方案**: 在 `selection:created` 和 `selection:updated` 事件中，检测是否为 ActiveSelection，如果是则禁用旋转。

```javascript
// 禁止 ActiveSelection 旋转的核心逻辑
function disableActiveSelectionRotation(activeSelection) {
    activeSelection.set({
        hasRotatingPoint: false,  // 隐藏旋转控制柄
        lockRotation: true        // 锁定旋转
    });
    activeSelection.setControlsVisibility({
        mtr: false  // 隐藏旋转控制点
    });
}
```

**事件监听**:
```javascript
canvas.on('selection:created', function(e) {
    const selection = e.selected;
    if (selection.length > 1) {
        // 多选情况，获取 ActiveSelection 并禁用旋转
        const activeSelection = canvas.getActiveObject();
        if (activeSelection && activeSelection.type === 'activeSelection') {
            disableActiveSelectionRotation(activeSelection);
        }
    }
});

canvas.on('selection:updated', function(e) {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'activeSelection') {
        disableActiveSelectionRotation(activeObject);
    }
});
```

### 2. 旋转尝试拦截与提示

**实现位置**: `assets/js/app.js`

**方案**: 监听 `object:rotating` 事件，如果是 ActiveSelection 则阻止并显示提示。

```javascript
canvas.on('object:rotating', function(e) {
    const obj = e.target;
    if (obj && obj.type === 'activeSelection') {
        // 阻止旋转，恢复原始角度
        obj.set('angle', 0);
        obj.setCoords();
        canvas.renderAll();
        
        // 显示提示
        showToast(I18n.t('multiSelectNoRotate') || '多个元素无法直接旋转，请先建组');
    }
});
```

### 3. 建组功能实现

**实现位置**: `assets/js/app.js`

**方案**: 提供 `groupSelected()` 函数，将当前 ActiveSelection 转换为 Group。

```javascript
function groupSelected() {
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'activeSelection') {
        showToast('请先选中多个对象');
        return;
    }
    
    // 获取所有选中的对象
    const objects = activeObject.getObjects();
    if (objects.length < 2) {
        showToast('至少需要选中两个对象');
        return;
    }
    
    // 创建 Group
    const group = new fabric.Group(objects, {
        cornerColor: '#0066cc',
        cornerStyle: 'circle',
        borderColor: '#0066cc',
        cornerSize: 10,
        transparentCorners: false
    });
    
    // 从画布移除原对象
    objects.forEach(obj => canvas.remove(obj));
    
    // 添加 Group 到画布
    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.discardActiveObject();
    canvas.setActiveObject(group);
    canvas.renderAll();
    
    saveState();
    showToast('✓ 已建组');
}
```

### 4. 解组功能实现

**实现位置**: `assets/js/app.js`

**方案**: 提供 `ungroupSelected()` 函数，将 Group 拆分为独立对象，确保位置一致。

```javascript
function ungroupSelected() {
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'group') {
        showToast('请先选中一个组');
        return;
    }
    
    // 获取 Group 的变换信息
    const groupLeft = activeObject.left;
    const groupTop = activeObject.top;
    const groupAngle = activeObject.angle;
    const groupScaleX = activeObject.scaleX;
    const groupScaleY = activeObject.scaleY;
    
    // 解组
    const items = activeObject.getObjects();
    activeObject._restoreObjectsState();
    canvas.remove(activeObject);
    
    // 将子对象添加回画布，保持视觉位置一致
    items.forEach(item => {
        canvas.add(item);
    });
    
    canvas.renderAll();
    saveState();
    showToast('✓ 已解组');
}
```

### 5. 键盘快捷键支持

**实现位置**: `assets/js/app.js`

**方案**: 添加 Ctrl+G（建组）和 Ctrl+Shift+G（解组）快捷键。

```javascript
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        if (e.key === 'g' || e.key === 'G') {
            e.preventDefault();
            if (e.shiftKey) {
                ungroupSelected();  // Ctrl+Shift+G 解组
            } else {
                groupSelected();    // Ctrl+G 建组
            }
        }
    }
});
```

### 6. 多语言支持

**实现位置**: `assets/lang/*.json`

**新增翻译键**:
```json
{
    "multiSelectNoRotate": "多个元素无法直接旋转，请先建组",
    "groupCreated": "已建组",
    "ungrouped": "已解组",
    "selectMultipleFirst": "请先选中多个对象",
    "selectGroupFirst": "请先选中一个组"
}
```

## Data Models

本次实现不涉及数据模型变更。所有对象属性和序列化格式保持不变。

## Error Handling

### 错误场景处理

| 场景 | 处理方式 |
|------|----------|
| 尝试旋转 ActiveSelection | 阻止旋转，显示提示 |
| 建组时选中对象少于 2 个 | 显示提示 |
| 解组时选中的不是 Group | 显示提示 |
| 解组后位置偏移 | 使用 `_restoreObjectsState()` 自动修正 |

## Testing Strategy

### 1. 旋转权限测试

| 测试项 | 操作 | 预期结果 |
|--------|------|----------|
| 单对象旋转 | 选中单个对象，拖动旋转控制柄 | 正常旋转 |
| Group 旋转 | 选中 Group，拖动旋转控制柄 | 正常旋转 |
| ActiveSelection 旋转控制柄 | 框选多个对象 | 不显示旋转控制柄 |
| ActiveSelection 旋转尝试 | 尝试通过任何方式旋转多选 | 显示提示，不旋转 |

### 2. 建组/解组测试

| 测试项 | 操作 | 预期结果 |
|--------|------|----------|
| 建组 | 选中多个对象，按 Ctrl+G | 创建 Group，可旋转 |
| 解组位置 | 旋转 Group 后解组 | 子对象视觉位置不变 |
| 解组角度 | 旋转 Group 后解组 | 子对象角度正确 |
| 解组缩放 | 缩放 Group 后解组 | 子对象缩放比例正确 |

### 3. 回归测试清单

- [ ] 单对象旋转正常
- [ ] Group 旋转正常
- [ ] ActiveSelection 不显示旋转控制柄
- [ ] ActiveSelection 无法旋转
- [ ] 尝试旋转 ActiveSelection 显示提示
- [ ] Ctrl+G 建组功能正常
- [ ] Ctrl+Shift+G 解组功能正常
- [ ] 解组后位置一致
- [ ] 解组后角度一致
- [ ] 解组后缩放一致
- [ ] 多语言提示正常

## Implementation Notes

### 实现顺序

1. **任务 1**: 实现 ActiveSelection 旋转禁止
2. **任务 2**: 实现建组/解组功能
3. **任务 3**: 添加多语言支持
4. **任务 4**: 验证所有功能

### 代码修改范围

1. **assets/js/app.js**: 添加旋转禁止逻辑、建组/解组功能
2. **assets/lang/*.json**: 添加多语言翻译
3. **app.html**: 可选添加建组/解组按钮

### 设计约束

- **禁止尝试"修复" ActiveSelection 旋转**: 多选旋转是设计上不允许的操作
- **所有旋转逻辑以 Group 或单对象为边界**: 不处理 ActiveSelection 旋转
- **解组必须保持位置一致**: 使用 fabric.js 内置的 `_restoreObjectsState()` 方法
