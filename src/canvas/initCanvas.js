// ==================== Canvas 初始化模块 ====================
// 职责：canvas 创建、尺寸设置、基础事件注册
// 依赖：fabric.js, AppState

/**
 * 创建并初始化 fabric.Canvas 实例
 * @param {string} canvasId - canvas 元素的 ID
 * @returns {fabric.Canvas} canvas 实例
 */
function createCanvas(canvasId) {
    const canvas = new fabric.Canvas(canvasId, {
        backgroundColor: '#ffffff',
        preserveObjectStacking: true,
        selection: true,
        perPixelTargetFind: true,
        targetFindTolerance: 5,
        fireRightClick: true,
        stopContextMenu: true
    });
    
    return canvas;
}

/**
 * 初始化 canvas 尺寸（根据容器大小）
 * @param {fabric.Canvas} canvas - canvas 实例
 */
function initCanvasSize(canvas) {
    const container = document.querySelector('.canvas-container');
    if (!container) return;
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // 更新状态
    if (typeof setState === 'function') {
        setState('canvasWidth', width);
        setState('canvasHeight', height);
    }
    
    // 设置 canvas 尺寸
    canvas.setDimensions({ width: width, height: height });
    canvas.renderAll();
}

/**
 * 应用缩放
 * @param {fabric.Canvas} canvas - canvas 实例
 * @param {number} zoom - 缩放比例
 */
function applyZoom(canvas, zoom) {
    canvas.setZoom(zoom);
    
    // 更新状态
    if (typeof setState === 'function') {
        setState('currentZoom', zoom);
    }
    
    // 更新 UI 显示
    const zoomLevelEl = document.getElementById('zoomLevel');
    if (zoomLevelEl) {
        zoomLevelEl.textContent = Math.round(zoom * 100) + '%';
    }
    
    // 显示缩放提示
    const zoomToast = document.getElementById('zoomToast');
    if (zoomToast) {
        zoomToast.textContent = Math.round(zoom * 100) + '%';
        zoomToast.classList.add('show');
        setTimeout(() => zoomToast.classList.remove('show'), 800);
    }
}

/**
 * 放大
 * @param {fabric.Canvas} canvas - canvas 实例
 */
function zoomIn(canvas) {
    const currentZoom = canvas.getZoom();
    const newZoom = Math.min(currentZoom + 0.05, 3);
    applyZoom(canvas, newZoom);
}

/**
 * 缩小
 * @param {fabric.Canvas} canvas - canvas 实例
 */
function zoomOut(canvas) {
    const currentZoom = canvas.getZoom();
    const newZoom = Math.max(currentZoom - 0.05, 0.1);
    applyZoom(canvas, newZoom);
}

/**
 * 重置缩放
 * @param {fabric.Canvas} canvas - canvas 实例
 */
function resetZoom(canvas) {
    applyZoom(canvas, 1);
}

/**
 * 根据主题设置 canvas 背景色
 * @param {fabric.Canvas} canvas - canvas 实例
 * @param {string} theme - 主题名称 ('light' | 'dark')
 */
function setCanvasTheme(canvas, theme) {
    const bgColor = theme === 'light' ? '#ffffff' : '#1f1f1f';
    canvas.backgroundColor = bgColor;
    canvas.renderAll();
}

/**
 * 绑定窗口 resize 事件
 * @param {fabric.Canvas} canvas - canvas 实例
 */
function bindResizeEvent(canvas) {
    window.addEventListener('resize', function() {
        initCanvasSize(canvas);
    });
}

// ==================== 导出到全局 ====================
window.CanvasInit = {
    createCanvas: createCanvas,
    initCanvasSize: initCanvasSize,
    applyZoom: applyZoom,
    zoomIn: zoomIn,
    zoomOut: zoomOut,
    resetZoom: resetZoom,
    setCanvasTheme: setCanvasTheme,
    bindResizeEvent: bindResizeEvent
};
