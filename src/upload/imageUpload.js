/**
 * 图片上传模块
 * 职责：图片加载、fabric.Image 创建、粘贴/拖放处理
 * 
 * 依赖：
 * - canvas (fabric.Canvas 实例)
 * - canvasWidth, canvasHeight (画布尺寸)
 * - saveState, hideEmptyState, showToast, closeAllDrawers (UI 辅助函数)
 */

// ==================== 图片上传功能 ====================

/**
 * 初始化图片上传相关的事件监听
 * @param {fabric.Canvas} canvas - fabric画布实例
 * @param {Function} getCanvasSize - 获取画布尺寸的函数，返回 {width, height}
 * @param {Object} callbacks - 回调函数集合
 */
function initImageUpload(canvas, getCanvasSize, callbacks) {
    const { saveState, hideEmptyState, showToast, closeAllDrawers } = callbacks;
    
    /**
     * 添加图片到画布
     * @param {File} file - 图片文件
     */
    function addImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const { width: canvasWidth, height: canvasHeight } = getCanvasSize();
            fabric.Image.fromURL(e.target.result, (img) => {
                const maxW = canvasWidth * 0.6, maxH = canvasHeight * 0.6;
                if (img.width > maxW || img.height > maxH) {
                    img.scale(Math.min(maxW / img.width, maxH / img.height));
                }
                img.set({
                    left: canvasWidth / 2,
                    top: canvasHeight / 2,
                    originX: 'center',
                    originY: 'center',
                    cornerColor: '#0066cc',
                    cornerStyle: 'circle',
                    borderColor: '#0066cc',
                    cornerSize: 10,
                    transparentCorners: false
                });
                canvas.add(img);
                canvas.setActiveObject(img);
                canvas.renderAll();
                hideEmptyState();
                saveState();
                showToast('✓ Image added');
                
                // 触发首次操作提示
                if (typeof window.showFirstActionTip === 'function') {
                    window.showFirstActionTip();
                }
            });
        };
        reader.readAsDataURL(file);
    }
    
    /**
     * 设置背景图片
     * @param {File} file - 图片文件
     */
    function setBackgroundImage(file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const { width: canvasWidth, height: canvasHeight } = getCanvasSize();
            fabric.Image.fromURL(ev.target.result, (img) => {
                canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
                    scaleX: canvasWidth / img.width,
                    scaleY: canvasHeight / img.height
                });
                saveState();
                closeAllDrawers();
                showToast('✓ Background set');
            });
        };
        reader.readAsDataURL(file);
    }
    
    // 文件输入监听
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                Array.from(e.target.files).forEach(addImage);
                e.target.value = '';
            }
        });
    }
    
    // 背景图片输入监听
    const bgInput = document.getElementById('bgInput');
    if (bgInput) {
        bgInput.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                setBackgroundImage(e.target.files[0]);
                e.target.value = '';
            }
        });
    }
    
    // 粘贴事件监听
    document.addEventListener('paste', (e) => {
        e.preventDefault();
        for (const item of e.clipboardData.items) {
            if (item.type.includes('image')) {
                addImage(item.getAsFile());
                break;
            }
        }
    });
    
    // 拖放事件监听
    const canvasContainer = document.getElementById('canvasContainer');
    if (canvasContainer) {
        canvasContainer.addEventListener('dragover', (e) => e.preventDefault());
        canvasContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            Array.from(e.dataTransfer.files).forEach(f => {
                if (f.type.startsWith('image/')) addImage(f);
            });
        });
    }
    
    // 返回公开的函数供外部调用
    return {
        addImage,
        setBackgroundImage,
        triggerUpload: function() {
            if (fileInput) fileInput.click();
        },
        triggerBgUpload: function() {
            if (bgInput) bgInput.click();
        }
    };
}

// 暴露到全局
window.initImageUpload = initImageUpload;
