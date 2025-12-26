# Design Document: 对齐与分布功能

## Overview

本设计文档描述了对齐与分布（Align / Distribute）功能的技术实现方案。该功能通过右键菜单提供，仅作用于 ActiveSelection（多选状态）。

## Architecture

### 功能矩阵

| 功能 | 作用对象 | 最少对象数 | 触发方式 |
|------|----------|------------|----------|
| 左对齐 | ActiveSelection | 2 | 右键菜单 |
| 水平居中 | ActiveSelection | 2 | 右键菜单 |
| 右对齐 | ActiveSelection | 2 | 右键菜单 |
| 顶部对齐 | ActiveSelection | 2 | 右键菜单 |
| 垂直居中 | ActiveSelection | 2 | 右键菜单 |
| 底部对齐 | ActiveSelection | 2 | 右键菜单 |
| 水平分布 | ActiveSelection | 3 | 右键菜单 |
| 垂直分布 | ActiveSelection | 3 | 右键菜单 |

## Components and Interfaces

### 1. 对齐函数实现

```javascript
// 左对齐
function alignLeft() {
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'activeSelection') return;
    
    const objects = activeObject.getObjects();
    if (objects.length < 2) return;
    
    // 找到最左边的位置
    let minLeft = Infinity;
    objects.forEach(obj => {
        const bound = obj.getBoundingRect(true);
        if (bound.left < minLeft) minLeft = bound.left;
    });
    
    // 将所有对象左边缘对齐到最左位置
    objects.forEach(obj => {
        const bound = obj.getBoundingRect(true);
        const offset = minLeft - bound.left;
        obj.set('left', obj.left + offset);
        obj.setCoords();
    });
    
    canvas.renderAll();
    saveState();
    showToast('✓ Aligned left');
}

// 水平居中
function alignCenterH() {
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'activeSelection') return;
    
    const objects = activeObject.getObjects();
    if (objects.length < 2) return;
    
    // 计算选区中心
    const selectionBound = activeObject.getBoundingRect(true);
    const centerX = selectionBound.left + selectionBound.width / 2;
    
    // 将所有对象中心对齐到选区中心
    objects.forEach(obj => {
        const bound = obj.getBoundingRect(true);
        const objCenterX = bound.left + bound.width / 2;
        const offset = centerX - objCenterX;
        obj.set('left', obj.left + offset);
        obj.setCoords();
    });
    
    canvas.renderAll();
    saveState();
    showToast('✓ Aligned center');
}

// 右对齐
function alignRight() {
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'activeSelection') return;
    
    const objects = activeObject.getObjects();
    if (objects.length < 2) return;
    
    // 找到最右边的位置
    let maxRight = -Infinity;
    objects.forEach(obj => {
        const bound = obj.getBoundingRect(true);
        const right = bound.left + bound.width;
        if (right > maxRight) maxRight = right;
    });
    
    // 将所有对象右边缘对齐到最右位置
    objects.forEach(obj => {
        const bound = obj.getBoundingRect(true);
        const objRight = bound.left + bound.width;
        const offset = maxRight - objRight;
        obj.set('left', obj.left + offset);
        obj.setCoords();
    });
    
    canvas.renderAll();
    saveState();
    showToast('✓ Aligned right');
}

// 顶部对齐
function alignTop() {
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'activeSelection') return;
    
    const objects = activeObject.getObjects();
    if (objects.length < 2) return;
    
    // 找到最顶部的位置
    let minTop = Infinity;
    objects.forEach(obj => {
        const bound = obj.getBoundingRect(true);
        if (bound.top < minTop) minTop = bound.top;
    });
    
    // 将所有对象顶边缘对齐到最顶位置
    objects.forEach(obj => {
        const bound = obj.getBoundingRect(true);
        const offset = minTop - bound.top;
        obj.set('top', obj.top + offset);
        obj.setCoords();
    });
    
    canvas.renderAll();
    saveState();
    showToast('✓ Aligned top');
}

// 垂直居中
function alignCenterV() {
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'activeSelection') return;
    
    const objects = activeObject.getObjects();
    if (objects.length < 2) return;
    
    // 计算选区中心
    const selectionBound = activeObject.getBoundingRect(true);
    const centerY = selectionBound.top + selectionBound.height / 2;
    
    // 将所有对象中心对齐到选区中心
    objects.forEach(obj => {
        const bound = obj.getBoundingRect(true);
        const objCenterY = bound.top + bound.height / 2;
        const offset = centerY - objCenterY;
        obj.set('top', obj.top + offset);
        obj.setCoords();
    });
    
    canvas.renderAll();
    saveState();
    showToast('✓ Aligned middle');
}

// 底部对齐
function alignBottom() {
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'activeSelection') return;
    
    const objects = activeObject.getObjects();
    if (objects.length < 2) return;
    
    // 找到最底部的位置
    let maxBottom = -Infinity;
    objects.forEach(obj => {
        const bound = obj.getBoundingRect(true);
        const bottom = bound.top + bound.height;
        if (bottom > maxBottom) maxBottom = bottom;
    });
    
    // 将所有对象底边缘对齐到最底位置
    objects.forEach(obj => {
        const bound = obj.getBoundingRect(true);
        const objBottom = bound.top + bound.height;
        const offset = maxBottom - objBottom;
        obj.set('top', obj.top + offset);
        obj.setCoords();
    });
    
    canvas.renderAll();
    saveState();
    showToast('✓ Aligned bottom');
}
```

### 2. 分布函数实现

```javascript
// 水平分布
function distributeH() {
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'activeSelection') return;
    
    const objects = activeObject.getObjects();
    if (objects.length < 3) {
        showToast('至少需要选中 3 个对象');
        return;
    }
    
    // 按中心点 X 坐标排序
    const sorted = objects.slice().sort((a, b) => {
        const boundA = a.getBoundingRect(true);
        const boundB = b.getBoundingRect(true);
        return (boundA.left + boundA.width / 2) - (boundB.left + boundB.width / 2);
    });
    
    // 计算第一个和最后一个对象的中心点
    const firstBound = sorted[0].getBoundingRect(true);
    const lastBound = sorted[sorted.length - 1].getBoundingRect(true);
    const firstCenterX = firstBound.left + firstBound.width / 2;
    const lastCenterX = lastBound.left + lastBound.width / 2;
    
    // 计算间距
    const totalDistance = lastCenterX - firstCenterX;
    const gap = totalDistance / (sorted.length - 1);
    
    // 分布中间对象
    for (let i = 1; i < sorted.length - 1; i++) {
        const obj = sorted[i];
        const bound = obj.getBoundingRect(true);
        const currentCenterX = bound.left + bound.width / 2;
        const targetCenterX = firstCenterX + gap * i;
        const offset = targetCenterX - currentCenterX;
        obj.set('left', obj.left + offset);
        obj.setCoords();
    }
    
    canvas.renderAll();
    saveState();
    showToast('✓ Distributed horizontally');
}

// 垂直分布
function distributeV() {
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'activeSelection') return;
    
    const objects = activeObject.getObjects();
    if (objects.length < 3) {
        showToast('至少需要选中 3 个对象');
        return;
    }
    
    // 按中心点 Y 坐标排序
    const sorted = objects.slice().sort((a, b) => {
        const boundA = a.getBoundingRect(true);
        const boundB = b.getBoundingRect(true);
        return (boundA.top + boundA.height / 2) - (boundB.top + boundB.height / 2);
    });
    
    // 计算第一个和最后一个对象的中心点
    const firstBound = sorted[0].getBoundingRect(true);
    const lastBound = sorted[sorted.length - 1].getBoundingRect(true);
    const firstCenterY = firstBound.top + firstBound.height / 2;
    const lastCenterY = lastBound.top + lastBound.height / 2;
    
    // 计算间距
    const totalDistance = lastCenterY - firstCenterY;
    const gap = totalDistance / (sorted.length - 1);
    
    // 分布中间对象
    for (let i = 1; i < sorted.length - 1; i++) {
        const obj = sorted[i];
        const bound = obj.getBoundingRect(true);
        const currentCenterY = bound.top + bound.height / 2;
        const targetCenterY = firstCenterY + gap * i;
        const offset = targetCenterY - currentCenterY;
        obj.set('top', obj.top + offset);
        obj.setCoords();
    }
    
    canvas.renderAll();
    saveState();
    showToast('✓ Distributed vertically');
}
```

### 3. 右键菜单扩展

在现有右键菜单中添加对齐和分布子菜单：

```javascript
// 更新 createContextMenu 函数，添加对齐和分布菜单项
// 仅在 ActiveSelection 状态下显示
```

## Data Models

本功能不涉及数据模型变更。

## Error Handling

| 场景 | 处理方式 |
|------|----------|
| 选中对象少于 2 个 | 禁用对齐菜单项 |
| 选中对象少于 3 个 | 禁用分布菜单项 |
| 非 ActiveSelection 状态 | 隐藏对齐/分布菜单 |

## Testing Strategy

### 测试用例

| 测试项 | 操作 | 预期结果 |
|--------|------|----------|
| 左对齐 | 选中 3 个对象，点击左对齐 | 所有对象左边缘对齐 |
| 水平居中 | 选中 3 个对象，点击水平居中 | 所有对象中心对齐 |
| 右对齐 | 选中 3 个对象，点击右对齐 | 所有对象右边缘对齐 |
| 顶部对齐 | 选中 3 个对象，点击顶部对齐 | 所有对象顶边缘对齐 |
| 垂直居中 | 选中 3 个对象，点击垂直居中 | 所有对象中心对齐 |
| 底部对齐 | 选中 3 个对象，点击底部对齐 | 所有对象底边缘对齐 |
| 水平分布 | 选中 4 个对象，点击水平分布 | 中间对象等间距分布 |
| 垂直分布 | 选中 4 个对象，点击垂直分布 | 中间对象等间距分布 |
| 分布限制 | 选中 2 个对象，点击分布 | 显示提示信息 |
