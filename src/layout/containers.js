/**
 * 布局容器模块
 * 职责：布局容器、吸附、拖入判断、布局模板
 * 
 * 依赖：
 * - canvas (fabric.Canvas 实例)
 * - canvasWidth, canvasHeight (画布尺寸)
 * - saveState, hideEmptyState, showToast, closeAllDrawers (UI 辅助函数)
 */

// ==================== 布局容器系统 ====================

/**
 * 初始化布局容器系统
 * @param {fabric.Canvas} canvas - fabric画布实例
 * @param {Function} getCanvasSize - 获取画布尺寸的函数
 * @param {Object} callbacks - 回调函数集合
 */
function initLayoutContainers(canvas, getCanvasSize, callbacks) {
    const { saveState, hideEmptyState, showToast } = callbacks;
    
    // 当前悬停的布局格子
    let layoutHoverTarget = null;
    // 是否启用布局接管模式
    let layoutAdoptEnabled = true;
    
    /**
     * 检查对象是否为布局格子（Drop Zone）
     */
    function isLayoutDropZone(obj) {
        return obj && obj._isLayoutContainer === true && !obj._hasContent;
    }
    
    /**
     * 获取对象的画布坐标边界
     */
    function getObjectCanvasBounds(obj) {
        const objLeft = obj.left;
        const objTop = obj.top;
        const objWidth = obj.width * (obj.scaleX || 1);
        const objHeight = obj.height * (obj.scaleY || 1);
        
        let minX, maxX, minY, maxY;
        
        if (obj.originX === 'center') {
            minX = objLeft - objWidth / 2;
            maxX = objLeft + objWidth / 2;
        } else {
            minX = objLeft;
            maxX = objLeft + objWidth;
        }
        
        if (obj.originY === 'center') {
            minY = objTop - objHeight / 2;
            maxY = objTop + objHeight / 2;
        } else {
            minY = objTop;
            maxY = objTop + objHeight;
        }
        
        return { minX, maxX, minY, maxY, width: objWidth, height: objHeight, centerX: (minX + maxX) / 2, centerY: (minY + maxY) / 2 };
    }
    
    /**
     * 在指定坐标查找布局格子
     */
    function findDropZoneAtPoint(x, y) {
        const objects = canvas.getObjects();
        
        for (let i = objects.length - 1; i >= 0; i--) {
            const obj = objects[i];
            
            if (isLayoutDropZone(obj)) {
                const bounds = getObjectCanvasBounds(obj);
                if (x >= bounds.minX && x <= bounds.maxX && y >= bounds.minY && y <= bounds.maxY) {
                    return obj;
                }
            }
        }
        return null;
    }
    
    /**
     * 查找与给定对象相交的布局格子
     */
    function findIntersectingDropZone(movingObj) {
        const movingBounds = getObjectCanvasBounds(movingObj);
        const objects = canvas.getObjects();
        
        for (let i = objects.length - 1; i >= 0; i--) {
            const obj = objects[i];
            if (obj === movingObj) continue;
            
            if (isLayoutDropZone(obj)) {
                const zoneBounds = getObjectCanvasBounds(obj);
                if (!(movingBounds.maxX < zoneBounds.minX || 
                      movingBounds.minX > zoneBounds.maxX || 
                      movingBounds.maxY < zoneBounds.minY || 
                      movingBounds.minY > zoneBounds.maxY)) {
                    return obj;
                }
            }
        }
        return null;
    }
    
    /**
     * 设置 Drop Zone 高亮
     */
    function setDropZoneHighlight(zone, highlight) {
        if (!zone) return;
        
        if (highlight) {
            zone._originalStroke = zone.stroke;
            zone._originalStrokeWidth = zone.strokeWidth;
            zone._originalFill = zone.fill;
            zone.set({
                stroke: '#00cc66',
                strokeWidth: 4,
                fill: 'rgba(0, 204, 102, 0.15)'
            });
        } else {
            zone.set({
                stroke: zone._originalStroke || '#667eea',
                strokeWidth: zone._originalStrokeWidth || 2,
                fill: zone._originalFill || 'rgba(102, 126, 234, 0.15)'
            });
        }
        canvas.renderAll();
    }
    
    /**
     * 清除所有高亮
     */
    function clearAllDropZoneHighlights() {
        canvas.getObjects().forEach(obj => {
            if (obj._isLayoutContainer) {
                setDropZoneHighlight(obj, false);
            }
        });
        layoutHoverTarget = null;
    }
    
    /**
     * 将内容接管到布局容器
     */
    function adoptIntoLayout(contentObj, dropZone) {
        if (!contentObj || !dropZone) return false;
        
        const zoneBounds = getObjectCanvasBounds(dropZone);
        
        const contentWidth = contentObj.width * (contentObj.scaleX || 1);
        const contentHeight = contentObj.height * (contentObj.scaleY || 1);
        const scaleX = zoneBounds.width / contentWidth;
        const scaleY = zoneBounds.height / contentHeight;
        const scale = Math.min(scaleX, scaleY) * 0.9;
        
        canvas.remove(contentObj);
        
        const clonedContent = fabric.util.object.clone(contentObj);
        clonedContent.set({
            left: 0,
            top: 0,
            originX: 'center',
            originY: 'center',
            scaleX: (contentObj.scaleX || 1) * scale,
            scaleY: (contentObj.scaleY || 1) * scale
        });
        
        // 检查 dropZone 是否属于一个 Group（如 imageCaption 模板）
        let parentGroup = null;
        let groupObjects = [];
        let groupCenter = zoneBounds;
        
        // 查找包含此 dropZone 的 Group
        canvas.getObjects().forEach(obj => {
            if (obj.type === 'group' && obj._objects) {
                const hasDropZone = obj._objects.some(child => child === dropZone || 
                    (child._isLayoutContainer && !child._hasContent));
                if (hasDropZone) {
                    parentGroup = obj;
                }
            }
        });
        
        if (parentGroup) {
            // 如果 dropZone 在一个 Group 中（如 imageCaption 模板）
            groupCenter = {
                centerX: parentGroup.left,
                centerY: parentGroup.top
            };
            
            // 获取组内所有对象，过滤掉占位图标
            parentGroup._objects.forEach(child => {
                // 检查是否为占位图标（Font Awesome 图标或标记为占位符）
                const isPlaceholderIcon = child._isPlaceholderIcon || 
                    (child.type === 'text' && child.fontFamily && 
                     child.fontFamily.toLowerCase().includes('font awesome'));
                
                if (child._isLayoutContainer) {
                    // 克隆容器并标记为已有内容
                    const clonedZone = fabric.util.object.clone(child);
                    clonedZone.set({
                        left: child.left,
                        top: child.top,
                        originX: child.originX || 'center',
                        originY: child.originY || 'center'
                    });
                    clonedZone._isLayoutContainer = true;
                    clonedZone._hasContent = true;
                    groupObjects.push(clonedZone);
                    
                    // 添加图片内容到容器位置
                    clonedContent.set({
                        left: child.left,
                        top: child.top
                    });
                    groupObjects.push(clonedContent);
                } else if (isPlaceholderIcon) {
                    // 跳过占位图标，不添加到新组中
                } else {
                    // 保留其他对象（如文字说明）
                    const clonedChild = fabric.util.object.clone(child);
                    clonedChild.set({
                        left: child.left,
                        top: child.top,
                        originX: child.originX || 'center',
                        originY: child.originY || 'center'
                    });
                    groupObjects.push(clonedChild);
                }
            });
            
            canvas.remove(parentGroup);
            
            // 创建新的容器组
            const containerGroup = new fabric.Group(groupObjects, {
                left: groupCenter.centerX,
                top: groupCenter.centerY,
                originX: 'center',
                originY: 'center',
                cornerColor: '#0066cc',
                cornerStyle: 'circle',
                borderColor: '#0066cc',
                cornerSize: 10,
                transparentCorners: false,
                _isContainerGroup: true
            });
            
            canvas.add(containerGroup);
            canvas.setActiveObject(containerGroup);
            containerGroup.setCoords();
        } else {
            // 原有逻辑：单独的 dropZone
            const clonedZone = fabric.util.object.clone(dropZone);
            clonedZone.set({
                left: 0,
                top: 0,
                originX: 'center',
                originY: 'center'
            });
            clonedZone._isLayoutContainer = true;
            clonedZone._hasContent = true;
            
            canvas.remove(dropZone);
            
            const containerGroup = new fabric.Group([clonedZone, clonedContent], {
                left: zoneBounds.centerX,
                top: zoneBounds.centerY,
                originX: 'center',
                originY: 'center',
                cornerColor: '#0066cc',
                cornerStyle: 'circle',
                borderColor: '#0066cc',
                cornerSize: 10,
                transparentCorners: false,
                _isContainerGroup: true
            });
            
            canvas.add(containerGroup);
            canvas.setActiveObject(containerGroup);
            containerGroup.setCoords();
        }
        
        canvas.renderAll();
        saveState();
        hideEmptyState();
        
        showToast('✓ 已放入布局');
        return true;
    }
    
    /**
     * 解组容器
     */
    function releaseFromLayout(containerGroup) {
        if (!containerGroup || !containerGroup._isContainerGroup) return false;
        
        const groupCenter = containerGroup.getCenterPoint();
        const groupScaleX = containerGroup.scaleX || 1;
        const groupScaleY = containerGroup.scaleY || 1;
        const groupAngle = containerGroup.angle || 0;
        
        const objects = containerGroup.getObjects();
        canvas.remove(containerGroup);
        
        objects.forEach(obj => {
            const matrix = containerGroup.calcTransformMatrix();
            const point = fabric.util.transformPoint(
                { x: obj.left, y: obj.top },
                matrix
            );
            
            obj.set({
                left: point.x,
                top: point.y,
                scaleX: (obj.scaleX || 1) * groupScaleX,
                scaleY: (obj.scaleY || 1) * groupScaleY,
                angle: (obj.angle || 0) + groupAngle
            });
            
            if (obj._isLayoutContainer) {
                obj._hasContent = false;
                obj.set({
                    fill: 'rgba(102, 126, 234, 0.15)',
                    stroke: '#667eea',
                    strokeWidth: 2,
                    strokeDashArray: [8, 4]
                });
            }
            
            obj.setCoords();
            canvas.add(obj);
        });
        
        clearAllDropZoneHighlights();
        canvas.renderAll();
        saveState();
        
        showToast('✓ 已解组');
        return true;
    }
    
    // 绑定布局容器事件 - object:moving
    canvas.on('object:moving', function(e) {
        const movingObj = e.target;
        
        if (movingObj.type !== 'image') return;
        
        const intersectingZone = findIntersectingDropZone(movingObj);
        
        if (intersectingZone !== layoutHoverTarget) {
            if (layoutHoverTarget) {
                setDropZoneHighlight(layoutHoverTarget, false);
            }
            if (intersectingZone) {
                setDropZoneHighlight(intersectingZone, true);
            }
            layoutHoverTarget = intersectingZone;
        }
    });
    
    // 绑定布局容器事件 - object:modified
    canvas.on('object:modified', function(e) {
        const modifiedObj = e.target;
        
        if (modifiedObj.type !== 'image') {
            clearAllDropZoneHighlights();
            return;
        }
        
        if (layoutHoverTarget && layoutAdoptEnabled) {
            adoptIntoLayout(modifiedObj, layoutHoverTarget);
            layoutHoverTarget = null;
        } else {
            clearAllDropZoneHighlights();
        }
    });
    
    // 返回公开的函数
    return {
        isLayoutDropZone,
        findDropZoneAtPoint,
        adoptIntoLayout,
        releaseFromLayout,
        clearAllDropZoneHighlights,
        setLayoutAdoptEnabled: function(enabled) {
            layoutAdoptEnabled = enabled;
        }
    };
}

// 暴露到全局
window.initLayoutContainers = initLayoutContainers;
