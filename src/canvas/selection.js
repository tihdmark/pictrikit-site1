// ==================== 选择模块 ====================
// 职责：单选 / 多选 / 禁止多选旋转规则 / 穿透选择
// 依赖：fabric.js, canvas 实例

// ==================== 穿透选择状态 ====================
let hoverHighlightRect = null;  // hover 高亮框
let hoverTarget = null;         // 当前 hover 的目标对象（全局维护）

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
 * 计算对象的面积（用于穿透选择优先级）
 * @param {fabric.Object} obj - fabric 对象
 * @returns {number} 面积
 */
function getObjectArea(obj) {
    const bounds = obj.getBoundingRect(true);
    return bounds.width * bounds.height;
}

/**
 * 检查点是否在对象内部（使用扩展的容忍度）
 * @param {fabric.Object} obj - fabric 对象
 * @param {Object} pointer - 鼠标坐标 {x, y}
 * @returns {boolean}
 */
function isPointInObject(obj, pointer) {
    // 使用 fabric 的 containsPoint 方法，带容忍度
    return obj.containsPoint(pointer, null, true);
}

/**
 * 获取鼠标位置下所有命中的对象（按面积从小到大排序）
 * @param {fabric.Canvas} canvas - canvas 实例
 * @param {Object} pointer - 鼠标坐标 {x, y}
 * @returns {Array} 命中的对象数组
 */
function getObjectsAtPoint(canvas, pointer) {
    const objects = canvas.getObjects();
    const hitObjects = [];
    
    for (let i = 0; i < objects.length; i++) {
        const obj = objects[i];
        
        // 跳过不可见、不可选择的对象
        if (!obj.visible || !obj.selectable || obj.evented === false) continue;
        
        // 跳过辅助线、hover 高亮框等辅助元素
        if (obj._isGuideLine || obj._isHoverHighlight || obj._isAlignLabel) continue;
        
        // 检查点是否在对象内
        if (isPointInObject(obj, pointer)) {
            hitObjects.push(obj);
        }
    }
    
    // 按面积从小到大排序（优先选择小元素）
    hitObjects.sort((a, b) => getObjectArea(a) - getObjectArea(b));
    
    return hitObjects;
}

/**
 * 创建 hover 高亮框
 * @param {fabric.Canvas} canvas - canvas 实例
 * @param {fabric.Object} target - 目标对象
 */
function showHoverHighlight(canvas, target) {
    // 如果是同一个对象，不重复创建
    if (hoverTarget === target && hoverHighlightRect) return;
    
    // 清除旧的高亮框
    hideHoverHighlight(canvas);
    
    // 如果目标是当前选中对象，不显示 hover
    const activeObject = canvas.getActiveObject();
    if (activeObject === target) return;
    if (activeObject && activeObject.type === 'activeSelection' && 
        activeObject.getObjects().includes(target)) return;
    
    // 获取对象边界
    const bounds = target.getBoundingRect();
    
    // 创建虚线高亮框
    hoverHighlightRect = new fabric.Rect({
        left: bounds.left - 2,
        top: bounds.top - 2,
        width: bounds.width + 4,
        height: bounds.height + 4,
        fill: 'transparent',
        stroke: '#0066cc',
        strokeWidth: 1.5,
        strokeDashArray: [5, 3],
        selectable: false,
        evented: false,
        excludeFromExport: true,
        _isHoverHighlight: true
    });
    
    canvas.add(hoverHighlightRect);
    hoverTarget = target;
    canvas.requestRenderAll();
}

/**
 * 隐藏 hover 高亮框
 * @param {fabric.Canvas} canvas - canvas 实例
 */
function hideHoverHighlight(canvas) {
    if (hoverHighlightRect) {
        canvas.remove(hoverHighlightRect);
        hoverHighlightRect = null;
    }
    hoverTarget = null;
}

/**
 * 获取当前 hover 目标
 * @returns {fabric.Object|null}
 */
function getHoverTarget() {
    return hoverTarget;
}

/**
 * 穿透选择 - 选中被遮挡的小元素
 * @param {fabric.Canvas} canvas - canvas 实例
 * @param {Object} pointer - 鼠标坐标
 * @returns {fabric.Object|null} 应该选中的对象
 */
function getPenetratingTarget(canvas, pointer) {
    const hitObjects = getObjectsAtPoint(canvas, pointer);
    
    if (hitObjects.length === 0) return null;
    
    // 返回面积最小的对象（最可能是被遮挡的小元素）
    return hitObjects[0];
}

/**
 * 绑定穿透选择事件
 * @param {fabric.Canvas} canvas - canvas 实例
 */
function bindPenetratingSelectionEvents(canvas) {
    // 存储穿透选择的目标
    let penetratingTarget = null;
    
    // 鼠标移动 - hover 检测，维护全局 hoverTarget
    canvas.on('mouse:move', function(opt) {
        // 如果正在拖动或绘图模式，不处理
        if (canvas.isDrawingMode) return;
        if (typeof AppState !== 'undefined' && AppState.isPanning) return;
        
        const pointer = canvas.getPointer(opt.e);
        const hitObjects = getObjectsAtPoint(canvas, pointer);
        
        if (hitObjects.length > 0) {
            // 获取面积最小的对象
            const targetObj = hitObjects[0];
            
            // 检查是否是被遮挡的对象（不是最顶层）
            const topObject = canvas.findTarget(opt.e);
            
            // 如果命中的最小对象不是 fabric 默认找到的顶层对象，显示 hover
            if (targetObj !== topObject) {
                showHoverHighlight(canvas, targetObj);
            } else {
                // 顶层对象，清除 hover（fabric 会自己处理）
                hideHoverHighlight(canvas);
            }
        } else {
            hideHoverHighlight(canvas);
        }
    });
    
    // 核心：在 mouse:down:before 中拦截
    canvas.on('mouse:down:before', function(opt) {
        // 如果正在拖动画板，不处理
        if (typeof AppState !== 'undefined' && AppState.isSpacePressed) return;
        if (canvas.isDrawingMode) return;
        
        // 只处理左键点击
        if (opt.e.button !== 0) return;
        
        // 关键：如果有 hoverTarget，记录它
        if (hoverTarget) {
            penetratingTarget = hoverTarget;
            canvas._isPenetratingSelection = true;
            
            // 清除 hover 高亮
            if (hoverHighlightRect) {
                canvas.remove(hoverHighlightRect);
                hoverHighlightRect = null;
            }
            hoverTarget = null;
        } else {
            penetratingTarget = null;
            canvas._isPenetratingSelection = false;
        }
    });
    
    // mouse:down 中执行穿透选择
    canvas.on('mouse:down', function() {
        if (penetratingTarget && canvas._isPenetratingSelection) {
            const targetObj = penetratingTarget;
            
            // 重置状态
            penetratingTarget = null;
            canvas._isPenetratingSelection = false;
            
            // 强制选中目标对象
            // 使用 requestAnimationFrame 确保在 fabric 处理完后执行
            requestAnimationFrame(() => {
                canvas.discardActiveObject();
                canvas.setActiveObject(targetObj);
                targetObj.bringToFront();
                canvas.requestRenderAll();
            });
        }
    });
    
    // 选择改变时清除 hover
    canvas.on('selection:created', function() {
        if (hoverHighlightRect) {
            hideHoverHighlight(canvas);
        }
    });
    
    canvas.on('selection:updated', function() {
        if (hoverHighlightRect) {
            hideHoverHighlight(canvas);
        }
    });
    
    // 鼠标离开画布时清除 hover
    canvas.on('mouse:out', function() {
        hideHoverHighlight(canvas);
    });
}

/**
 * 检查是否正在执行穿透选择
 * @returns {boolean}
 */
function isPenetratingSelectionActive() {
    return typeof canvas !== 'undefined' && canvas._isPenetratingSelection === true;
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
    bindSelectionEvents: bindSelectionEvents,
    // 穿透选择相关
    bindPenetratingSelectionEvents: bindPenetratingSelectionEvents,
    getObjectsAtPoint: getObjectsAtPoint,
    getPenetratingTarget: getPenetratingTarget,
    showHoverHighlight: showHoverHighlight,
    hideHoverHighlight: hideHoverHighlight,
    isPenetratingSelectionActive: isPenetratingSelectionActive,
    getHoverTarget: getHoverTarget
};

// 保持向后兼容 - 直接暴露核心函数
window.disableActiveSelectionRotation = disableActiveSelectionRotation;
window.isPenetratingSelectionActive = isPenetratingSelectionActive;
window.getHoverTarget = getHoverTarget;
