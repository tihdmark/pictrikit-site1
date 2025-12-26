// ==================== 分组模块 ====================
// 职责：合组 / 解组（不改逻辑）
// 依赖：fabric.js, canvas 实例, Selection 模块

/**
 * 将多选对象转换为 Group
 * @param {fabric.Canvas} canvas - canvas 实例
 * @param {Function} showToast - 提示函数
 * @param {Function} saveState - 保存状态函数
 * @returns {boolean} 是否成功
 */
function groupSelected(canvas, showToast, saveState) {
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'activeSelection') {
        const msg = (typeof I18n !== 'undefined' && I18n.t('selectMultipleFirst')) 
            || '请先选择多个对象';
        if (showToast) showToast(msg);
        return false;
    }
    
    // 获取所有选中的对象
    const objects = activeObject.getObjects();
    if (objects.length < 2) {
        const msg = (typeof I18n !== 'undefined' && I18n.t('selectMultipleFirst')) 
            || '至少需要选择两个对象';
        if (showToast) showToast(msg);
        return false;
    }
    
    // 记录 ActiveSelection 的中心位置
    const center = activeObject.getCenterPoint();
    
    // 使用 toGroup() 创建 Group
    activeObject.toGroup();
    const group = canvas.getActiveObject();
    
    // 修复 fabric.js 5.x 的 Group 旋转中心问题
    // 设置 originX/originY 为 center，并重新定位
    group.set({
        originX: 'center',
        originY: 'center',
        left: center.x,
        top: center.y,
        cornerColor: '#0066cc',
        cornerStyle: 'circle',
        borderColor: '#0066cc',
        cornerSize: 10,
        transparentCorners: false,
        selectable: true,
        evented: true
    });
    
    group.setCoords();
    canvas.renderAll();
    
    // 保存状态
    if (typeof saveState === 'function') {
        saveState();
    }
    
    const msg = (typeof I18n !== 'undefined' && I18n.t('groupCreated')) 
        || '✓ 已组合';
    if (showToast) showToast(msg);
    
    return true;
}

/**
 * 将 Group 拆解为独立对象
 * @param {fabric.Canvas} canvas - canvas 实例
 * @param {Function} showToast - 提示函数
 * @param {Function} saveState - 保存状态函数
 * @returns {boolean} 是否成功
 */
function ungroupSelected(canvas, showToast, saveState) {
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'group') {
        const msg = (typeof I18n !== 'undefined' && I18n.t('selectGroupFirst')) 
            || '请先选择一个组';
        if (showToast) showToast(msg);
        return false;
    }
    
    // 使用 fabric.js 内置的 toActiveSelection 方法解组
    // 它会自动处理子对象的绝对位置一致
    activeObject.toActiveSelection();
    
    // 获取解组后的 ActiveSelection 并禁用旋转
    const newSelection = canvas.getActiveObject();
    if (newSelection && newSelection.type === 'activeSelection') {
        // 使用 Selection 模块的函数
        if (typeof disableActiveSelectionRotation === 'function') {
            disableActiveSelectionRotation(newSelection);
        }
        
        // 确保解组后的每个对象都可以被选择和交互
        newSelection.forEachObject(function(obj) {
            obj.set({
                selectable: true,
                evented: true
            });
            obj.setCoords();
        });
    }
    
    canvas.renderAll();
    
    // 保存状态
    if (typeof saveState === 'function') {
        saveState();
    }
    
    const msg = (typeof I18n !== 'undefined' && I18n.t('ungrouped')) 
        || '✓ 已解组';
    if (showToast) showToast(msg);
    
    return true;
}

// ==================== 导出到全局 ====================
window.Group = {
    groupSelected: groupSelected,
    ungroupSelected: ungroupSelected
};
