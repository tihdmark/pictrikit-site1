// ==================== 变换模块 ====================
// 职责：旋转 / 缩放 / 对齐 / 分布
// 依赖：fabric.js, canvas 实例, Selection 模块

// 分布间距常量
const DISTRIBUTE_GAP = 20;

/**
 * 获取对象的画布边界信息
 * @param {fabric.Object} obj - fabric 对象
 * @returns {Object} 边界信息
 */
function getObjectBounds(obj) {
    obj.setCoords();
    const coords = obj.aCoords;
    
    if (coords) {
        const points = [coords.tl, coords.tr, coords.br, coords.bl];
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        
        points.forEach(point => {
            if (point.x < minX) minX = point.x;
            if (point.y < minY) minY = point.y;
            if (point.x > maxX) maxX = point.x;
            if (point.y > maxY) maxY = point.y;
        });
        
        return {
            left: minX,
            top: minY,
            right: maxX,
            bottom: maxY,
            width: maxX - minX,
            height: maxY - minY,
            centerX: (minX + maxX) / 2,
            centerY: (minY + maxY) / 2
        };
    }
    
    // 后备方案：使用 getBoundingRect
    const bound = obj.getBoundingRect(true, true);
    return {
        left: bound.left,
        top: bound.top,
        right: bound.left + bound.width,
        bottom: bound.top + bound.height,
        width: bound.width,
        height: bound.height,
        centerX: bound.left + bound.width / 2,
        centerY: bound.top + bound.height / 2
    };
}

// ==================== 对齐函数 ====================

/**
 * 左对齐 - 将所有对象左边缘对齐到最左边对象的左边缘
 */
function alignLeft(canvas, showToast, saveState) {
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'activeSelection') {
        if (showToast) showToast('请先选择多个对象');
        return;
    }
    const objects = activeObject.getObjects().slice();
    if (objects.length < 2) return;
    
    canvas.discardActiveObject();
    canvas.renderAll();
    
    let minLeft = Infinity;
    objects.forEach(obj => {
        obj.setCoords();
        const bound = obj.getBoundingRect();
        if (bound.left < minLeft) minLeft = bound.left;
    });
    
    objects.forEach(obj => {
        const bound = obj.getBoundingRect();
        const offset = minLeft - bound.left;
        obj.set('left', obj.left + offset);
        obj.setCoords();
    });
    
    _recreateSelectionAfterAlign(canvas, objects);
    if (saveState) saveState();
    if (showToast) showToast('✓ Aligned left');
}

/**
 * 水平居中 - 将所有对象的中心对齐到选区的水平中心
 */
function alignCenterH(canvas, showToast, saveState) {
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'activeSelection') {
        if (showToast) showToast('请先选择多个对象');
        return;
    }
    const objects = activeObject.getObjects().slice();
    if (objects.length < 2) return;
    
    canvas.discardActiveObject();
    canvas.renderAll();
    
    let minLeft = Infinity, maxRight = -Infinity;
    objects.forEach(obj => {
        obj.setCoords();
        const bound = obj.getBoundingRect();
        if (bound.left < minLeft) minLeft = bound.left;
        if (bound.left + bound.width > maxRight) maxRight = bound.left + bound.width;
    });
    const centerX = (minLeft + maxRight) / 2;
    
    objects.forEach(obj => {
        const bound = obj.getBoundingRect();
        const objCenterX = bound.left + bound.width / 2;
        const offset = centerX - objCenterX;
        obj.set('left', obj.left + offset);
        obj.setCoords();
    });
    
    _recreateSelectionAfterAlign(canvas, objects);
    if (saveState) saveState();
    if (showToast) showToast('✓ Aligned center');
}

/**
 * 右对齐 - 将所有对象右边缘对齐到最右边对象的右边缘
 */
function alignRight(canvas, showToast, saveState) {
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'activeSelection') {
        if (showToast) showToast('请先选择多个对象');
        return;
    }
    const objects = activeObject.getObjects().slice();
    if (objects.length < 2) return;
    
    canvas.discardActiveObject();
    canvas.renderAll();
    
    let maxRight = -Infinity;
    objects.forEach(obj => {
        obj.setCoords();
        const bound = obj.getBoundingRect();
        const right = bound.left + bound.width;
        if (right > maxRight) maxRight = right;
    });
    
    objects.forEach(obj => {
        const bound = obj.getBoundingRect();
        const objRight = bound.left + bound.width;
        const offset = maxRight - objRight;
        obj.set('left', obj.left + offset);
        obj.setCoords();
    });
    
    _recreateSelectionAfterAlign(canvas, objects);
    if (saveState) saveState();
    if (showToast) showToast('✓ Aligned right');
}

/**
 * 顶部对齐 - 将所有对象的顶边缘对齐到最顶部的顶边缘
 */
function alignTop(canvas, showToast, saveState) {
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'activeSelection') {
        if (showToast) showToast('请先选择多个对象');
        return;
    }
    const objects = activeObject.getObjects().slice();
    if (objects.length < 2) return;
    
    canvas.discardActiveObject();
    canvas.renderAll();
    
    let minTop = Infinity;
    objects.forEach(obj => {
        obj.setCoords();
        const bound = obj.getBoundingRect();
        if (bound.top < minTop) minTop = bound.top;
    });
    
    objects.forEach(obj => {
        const bound = obj.getBoundingRect();
        const offset = minTop - bound.top;
        obj.set('top', obj.top + offset);
        obj.setCoords();
    });
    
    _recreateSelectionAfterAlign(canvas, objects);
    if (saveState) saveState();
    if (showToast) showToast('✓ Aligned top');
}

/**
 * 垂直居中 - 将所有对象的中心对齐到选区的垂直中心
 */
function alignCenterV(canvas, showToast, saveState) {
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'activeSelection') {
        if (showToast) showToast('请先选择多个对象');
        return;
    }
    const objects = activeObject.getObjects().slice();
    if (objects.length < 2) return;
    
    canvas.discardActiveObject();
    canvas.renderAll();
    
    let minTop = Infinity, maxBottom = -Infinity;
    objects.forEach(obj => {
        obj.setCoords();
        const bound = obj.getBoundingRect();
        if (bound.top < minTop) minTop = bound.top;
        if (bound.top + bound.height > maxBottom) maxBottom = bound.top + bound.height;
    });
    const centerY = (minTop + maxBottom) / 2;
    
    objects.forEach(obj => {
        const bound = obj.getBoundingRect();
        const objCenterY = bound.top + bound.height / 2;
        const offset = centerY - objCenterY;
        obj.set('top', obj.top + offset);
        obj.setCoords();
    });
    
    _recreateSelectionAfterAlign(canvas, objects);
    if (saveState) saveState();
    if (showToast) showToast('✓ Aligned middle');
}

/**
 * 底部对齐 - 将所有对象的底边缘对齐到最底部对象的底边缘
 */
function alignBottom(canvas, showToast, saveState) {
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'activeSelection') {
        if (showToast) showToast('请先选择多个对象');
        return;
    }
    const objects = activeObject.getObjects().slice();
    if (objects.length < 2) return;
    
    canvas.discardActiveObject();
    canvas.renderAll();
    
    let maxBottom = -Infinity;
    objects.forEach(obj => {
        obj.setCoords();
        const bound = obj.getBoundingRect();
        const bottom = bound.top + bound.height;
        if (bottom > maxBottom) maxBottom = bottom;
    });
    
    objects.forEach(obj => {
        const bound = obj.getBoundingRect();
        const objBottom = bound.top + bound.height;
        const offset = maxBottom - objBottom;
        obj.set('top', obj.top + offset);
        obj.setCoords();
    });
    
    _recreateSelectionAfterAlign(canvas, objects);
    if (saveState) saveState();
    if (showToast) showToast('✓ Aligned bottom');
}

// ==================== 分布函数 ====================

/**
 * 水平分布 - 按顺序排列对象，固定间距
 */
function distributeH(canvas, showToast, saveState) {
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'activeSelection') {
        if (showToast) showToast('请先选择多个对象');
        return;
    }
    const objects = activeObject.getObjects().slice();
    const n = objects.length;
    if (n < 3) {
        if (showToast) showToast('至少需要选择 3 个对象');
        return;
    }
    
    canvas.discardActiveObject();
    canvas.renderAll();
    
    // 收集边界信息，按左边缘排序
    const items = objects.map(obj => {
        obj.setCoords();
        const bound = obj.getBoundingRect();
        return { obj, boundLeft: bound.left, boundTop: bound.top, boundWidth: bound.width };
    });
    items.sort((a, b) => a.boundLeft - b.boundLeft);
    
    // 找到最顶的对象位置
    let minTop = Infinity;
    items.forEach(item => {
        if (item.boundTop < minTop) minTop = item.boundTop;
    });
    
    // 从第一个元素的位置开始，依次排列
    let currentLeft = items[0].boundLeft;
    
    for (let i = 0; i < n; i++) {
        const item = items[i];
        // 顶部对齐
        const topOffset = minTop - item.boundTop;
        item.obj.set('top', item.obj.top + topOffset);
        // 左边缘定位
        const leftOffset = currentLeft - item.boundLeft;
        item.obj.set('left', item.obj.left + leftOffset);
        item.obj.setCoords();
        // 计算下一个元素的起始位置
        currentLeft = currentLeft + item.boundWidth + DISTRIBUTE_GAP;
    }
    
    canvas.requestRenderAll();
    _recreateSelectionAfterAlign(canvas, objects);
    if (saveState) saveState();
    if (showToast) showToast('✓ Distributed horizontally');
}

/**
 * 垂直分布 - 按顺序排列对象，固定间距
 */
function distributeV(canvas, showToast, saveState) {
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'activeSelection') {
        if (showToast) showToast('请先选择多个对象');
        return;
    }
    const objects = activeObject.getObjects().slice();
    const n = objects.length;
    if (n < 3) {
        if (showToast) showToast('至少需要选择 3 个对象');
        return;
    }
    
    canvas.discardActiveObject();
    canvas.renderAll();
    
    // 收集边界信息，按左边缘排序
    const items = objects.map(obj => {
        obj.setCoords();
        const bound = obj.getBoundingRect();
        return { obj, boundLeft: bound.left, boundTop: bound.top, boundHeight: bound.height };
    });
    items.sort((a, b) => a.boundLeft - b.boundLeft);
    
    // 找到最左的边缘位置
    let minLeft = Infinity;
    items.forEach(item => {
        if (item.boundLeft < minLeft) minLeft = item.boundLeft;
    });
    
    // 从第一个元素的顶部位置开始，依次向下排列
    let currentTop = items[0].boundTop;
    
    for (let i = 0; i < n; i++) {
        const item = items[i];
        // 左边缘对齐
        const leftOffset = minLeft - item.boundLeft;
        item.obj.set('left', item.obj.left + leftOffset);
        // 顶边缘定位
        const topOffset = currentTop - item.boundTop;
        item.obj.set('top', item.obj.top + topOffset);
        item.obj.setCoords();
        // 计算下一个元素的起始位置
        currentTop = currentTop + item.boundHeight + DISTRIBUTE_GAP;
    }
    
    canvas.requestRenderAll();
    _recreateSelectionAfterAlign(canvas, objects);
    if (saveState) saveState();
    if (showToast) showToast('✓ Distributed vertically');
}

// ==================== 内部辅助函数 ====================

/**
 * 对齐/分布操作后重新创建 ActiveSelection
 */
function _recreateSelectionAfterAlign(canvas, objects) {
    const newSelection = new fabric.ActiveSelection(objects, { canvas: canvas });
    canvas.setActiveObject(newSelection);
    if (typeof disableActiveSelectionRotation === 'function') {
        disableActiveSelectionRotation(newSelection);
    }
    canvas.requestRenderAll();
}

// ==================== 导出到全局 ====================
window.Transform = {
    getObjectBounds: getObjectBounds,
    alignLeft: alignLeft,
    alignCenterH: alignCenterH,
    alignRight: alignRight,
    alignTop: alignTop,
    alignCenterV: alignCenterV,
    alignBottom: alignBottom,
    distributeH: distributeH,
    distributeV: distributeV,
    DISTRIBUTE_GAP: DISTRIBUTE_GAP
};
