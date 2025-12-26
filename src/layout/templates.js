/**
 * 布局模板模块
 * 职责：布局模态框、布局结构、组件模板
 * 
 * 依赖：
 * - canvas (fabric.Canvas 实例)
 * - canvasWidth, canvasHeight (画布尺寸)
 * - saveState, hideEmptyState, showToast (UI 辅助函数)
 */

// ==================== 布局模板功能 ====================

/**
 * 初始化布局模板系统
 * @param {fabric.Canvas} canvas - fabric画布实例
 * @param {Function} getCanvasSize - 获取画布尺寸的函数
 * @param {Object} callbacks - 回调函数集合
 */
function initLayoutTemplates(canvas, getCanvasSize, callbacks) {
    const { saveState, hideEmptyState, showToast } = callbacks;
    
    /**
     * 打开布局模态框
     */
    function openLayoutModal() {
        document.getElementById('layoutModal').classList.add('show');
    }
    
    /**
     * 关闭布局模态框
     */
    function closeLayoutModal() {
        document.getElementById('layoutModal').classList.remove('show');
    }
    
    /**
     * 应用画布尺寸预设（仅作为参考框）
     */
    function applyCanvasPreset(width, height) {
        const { width: canvasWidth, height: canvasHeight } = getCanvasSize();
        const scale = Math.min(canvasWidth * 0.8 / width, canvasHeight * 0.8 / height);
        const scaledWidth = width * scale;
        const scaledHeight = height * scale;
        
        const rect = new fabric.Rect({
            left: canvasWidth / 2,
            top: canvasHeight / 2,
            width: scaledWidth,
            height: scaledHeight,
            fill: 'transparent',
            stroke: '#667eea',
            strokeWidth: 2,
            strokeDashArray: [10, 5],
            originX: 'center',
            originY: 'center',
            selectable: true,
            cornerColor: '#667eea',
            cornerStyle: 'circle',
            borderColor: '#667eea',
            cornerSize: 10,
            transparentCorners: false
        });
        
        canvas.add(rect);
        canvas.setActiveObject(rect);
        canvas.renderAll();
        hideEmptyState();
        saveState();
        closeLayoutModal();
        showToast('✓ ' + width + '×' + height + ' guide added');
    }
    
    /**
     * 插入布局结构
     */
    function insertLayoutStructure(type) {
        const { width: canvasWidth, height: canvasHeight } = getCanvasSize();
        const areaWidth = canvasWidth * 0.7;
        const areaHeight = canvasHeight * 0.6;
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        
        let objects = [];
        const blockStyle = {
            fill: 'rgba(102, 126, 234, 0.15)',
            stroke: '#667eea',
            strokeWidth: 2,
            strokeDashArray: [8, 4],
            rx: 8,
            ry: 8,
            _isLayoutContainer: true,
            _hasContent: false
        };
        
        switch (type) {
            case 'center':
                objects.push(new fabric.Rect({
                    ...blockStyle,
                    width: areaWidth * 0.6,
                    height: areaHeight * 0.6,
                    left: 0,
                    top: 0
                }));
                break;
                
            case 'leftRight':
                objects.push(new fabric.Rect({
                    ...blockStyle,
                    width: areaWidth * 0.48,
                    height: areaHeight * 0.8,
                    left: -areaWidth * 0.26,
                    top: 0
                }));
                objects.push(new fabric.Rect({
                    ...blockStyle,
                    width: areaWidth * 0.48,
                    height: areaHeight * 0.8,
                    left: areaWidth * 0.26,
                    top: 0
                }));
                break;
                
            case 'topBottom':
                objects.push(new fabric.Rect({
                    ...blockStyle,
                    width: areaWidth * 0.8,
                    height: areaHeight * 0.35,
                    left: 0,
                    top: -areaHeight * 0.25
                }));
                objects.push(new fabric.Rect({
                    ...blockStyle,
                    width: areaWidth * 0.8,
                    height: areaHeight * 0.35,
                    left: 0,
                    top: areaHeight * 0.25
                }));
                break;
                
            case 'threeCol':
                for (let i = 0; i < 3; i++) {
                    objects.push(new fabric.Rect({
                        ...blockStyle,
                        width: areaWidth * 0.28,
                        height: areaHeight * 0.8,
                        left: -areaWidth * 0.32 + i * (areaWidth * 0.32),
                        top: 0
                    }));
                }
                break;
                
            case 'grid2x2':
                for (let row = 0; row < 2; row++) {
                    for (let col = 0; col < 2; col++) {
                        objects.push(new fabric.Rect({
                            ...blockStyle,
                            width: areaWidth * 0.4,
                            height: areaHeight * 0.4,
                            left: -areaWidth * 0.22 + col * (areaWidth * 0.44),
                            top: -areaHeight * 0.22 + row * (areaHeight * 0.44)
                        }));
                    }
                }
                break;
                
            case 'sidebar':
                objects.push(new fabric.Rect({
                    ...blockStyle,
                    width: areaWidth * 0.25,
                    height: areaHeight * 0.8,
                    left: -areaWidth * 0.38,
                    top: 0
                }));
                objects.push(new fabric.Rect({
                    ...blockStyle,
                    width: areaWidth * 0.6,
                    height: areaHeight * 0.8,
                    left: areaWidth * 0.08,
                    top: 0
                }));
                break;
                
            default:
                showToast('Unknown layout type');
                return;
        }
        
        objects.forEach(obj => {
            obj.set({
                left: centerX + obj.left,
                top: centerY + obj.top,
                originX: 'center',
                originY: 'center',
                cornerColor: '#667eea',
                cornerStyle: 'circle',
                borderColor: '#667eea',
                cornerSize: 10,
                transparentCorners: false,
                selectable: true,
                evented: true
            });
            canvas.add(obj);
        });
        
        if (objects.length > 1) {
            const selection = new fabric.ActiveSelection(objects, { canvas: canvas });
            canvas.setActiveObject(selection);
        } else if (objects.length === 1) {
            canvas.setActiveObject(objects[0]);
        }
        
        canvas.renderAll();
        hideEmptyState();
        saveState();
        closeLayoutModal();
        showToast('✓ Layout structure added');
    }
    
    /**
     * 插入模板
     */
    function insertTemplate(type) {
        const { width: canvasWidth, height: canvasHeight } = getCanvasSize();
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        let objects = [];
        
        switch (type) {
            case 'titleSubtitle':
                objects.push(new fabric.IText('Title Here', {
                    fontSize: 36,
                    fontWeight: 'bold',
                    fill: '#1a1a1a',
                    fontFamily: 'Arial',
                    left: 0,
                    top: -30,
                    originX: 'center',
                    originY: 'center'
                }));
                objects.push(new fabric.IText('Subtitle or description text', {
                    fontSize: 18,
                    fill: '#666666',
                    fontFamily: 'Arial',
                    left: 0,
                    top: 20,
                    originX: 'center',
                    originY: 'center'
                }));
                break;
                
            case 'labelBadge':
                objects.push(new fabric.Rect({
                    width: 120,
                    height: 36,
                    fill: '#667eea',
                    rx: 18,
                    ry: 18,
                    left: -60,
                    top: -18
                }));
                objects.push(new fabric.IText('Label', {
                    fontSize: 14,
                    fontWeight: 'bold',
                    fill: '#ffffff',
                    fontFamily: 'Arial',
                    left: 0,
                    top: 0,
                    originX: 'center',
                    originY: 'center'
                }));
                break;
                
            case 'callout':
                objects.push(new fabric.Rect({
                    width: 280,
                    height: 100,
                    fill: '#fff9e6',
                    stroke: '#f0c000',
                    strokeWidth: 2,
                    rx: 8,
                    ry: 8,
                    left: -140,
                    top: -50
                }));
                objects.push(new fabric.IText('Callout text here.\nAdd your note or tip.', {
                    fontSize: 14,
                    fill: '#333333',
                    fontFamily: 'Arial',
                    left: 0,
                    top: 0,
                    originX: 'center',
                    originY: 'center',
                    textAlign: 'center'
                }));
                break;
                
            case 'imageCaption':
                objects.push(new fabric.Rect({
                    width: 200,
                    height: 150,
                    fill: 'rgba(102, 126, 234, 0.15)',
                    stroke: '#667eea',
                    strokeWidth: 2,
                    strokeDashArray: [8, 4],
                    rx: 8,
                    ry: 8,
                    left: -100,
                    top: -90,
                    _isLayoutContainer: true,
                    _hasContent: false
                }));
                // 使用文字说明替代图标
                objects.push(new fabric.Text('Ungroup to add image', {
                    fontSize: 12,
                    fill: '#667eea',
                    fontFamily: 'Arial',
                    left: 0,
                    top: -15,
                    originX: 'center',
                    originY: 'center',
                    _isPlaceholderIcon: true  // 标记为占位文字，拖入图片时移除
                }));
                objects.push(new fabric.IText('Image caption here', {
                    fontSize: 14,
                    fill: '#666666',
                    fontFamily: 'Arial',
                    left: 0,
                    top: 85,
                    originX: 'center',
                    originY: 'center'
                }));
                break;
                
            default:
                showToast('Unknown template type');
                return;
        }
        
        const group = new fabric.Group(objects, {
            left: centerX,
            top: centerY,
            originX: 'center',
            originY: 'center',
            cornerColor: '#667eea',
            cornerStyle: 'circle',
            borderColor: '#667eea',
            cornerSize: 10,
            transparentCorners: false
        });
        
        canvas.add(group);
        canvas.setActiveObject(group);
        canvas.renderAll();
        hideEmptyState();
        saveState();
        closeLayoutModal();
        showToast('✓ Template added');
    }
    
    // 返回公开的函数
    return {
        openLayoutModal,
        closeLayoutModal,
        applyCanvasPreset,
        insertLayoutStructure,
        insertTemplate
    };
}

// 暴露到全局
window.initLayoutTemplates = initLayoutTemplates;
