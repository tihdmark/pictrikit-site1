// ==================== 选择模块 ====================
// 职责：单选 / 多选 / 禁止多选旋转规则
// 依赖：fabric.js, canvas 实例

/**
 * 禁止 ActiveSelection 旋转
 * 多选状态下禁止旋转，必须先组合才能旋转
 * @param {fabric.ActiveSelection} activeSelection - 多选对象
 */
function disableActiveSelectionRotation(activeSelection) {
    if (!activeSelection) return;
    
    activeSelection.set({
        hasRotatingPoint: false,
        lockRotation: true
    });
    activeSelection.setControlsVisibility({
        mtr: false
    });
}

/**
 * 检查并处理选择事件中的多选旋转禁用
 * @param {fabric.Canvas} canvas - canvas 实例
 */
function handleSelectionRotation(canvas) {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'activeSelection') {
        disableActiveSelectionRotation(activeObject);
    }
}

/**
 * 重新创建 ActiveSelection（对齐/分布操作后使用）
 * @param {fabric.Canvas} canvas - canvas 实例
 * @param {Array} objects - 对象数组
 */
function recreateSelection(canvas, objects) {
    canvas.discardActiveObject();
    const newSelection = new fabric.ActiveSelection(objects, { canvas: canvas });
    canvas.setActiveObject(newSelection);
    disableActiveSelectionRotation(newSelection);
    canvas.requestRenderAll();
}

/**
 * 绑定选择相关事件
 * @param {fabric.Canvas} canvas - canvas 实例
 * @param {Object} callbacks - 回调函数对象
 */
function bindSelectionEvents(canvas, callbacks) {
    const { onSelectionCreated, onSelectionUpdated, onSelectionCleared } = callbacks || {};
    
    canvas.on('selection:created', (e) => {
        handleSelectionRotation(canvas);
        if (typeof onSelectionCreated === 'function') {
            onSelectionCreated(e);
        }
    });
    
    canvas.on('selection:updated', (e) => {
        handleSelectionRotation(canvas);
        if (typeof onSelectionUpdated === 'function') {
            onSelectionUpdated(e);
        }
    });
    
    canvas.on('selection:cleared', (e) => {
        if (typeof onSelectionCleared === 'function') {
            onSelectionCleared(e);
        }
    });
}

// ==================== 导出到全局 ====================
window.Selection = {
    disableActiveSelectionRotation: disableActiveSelectionRotation,
    handleSelectionRotation: handleSelectionRotation,
    recreateSelection: recreateSelection,
    bindSelectionEvents: bindSelectionEvents
};

// 保持向后兼容 - 直接暴露核心函数
window.disableActiveSelectionRotation = disableActiveSelectionRotation;
