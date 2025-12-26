// Translations moved to lang/*.json files and loaded via i18n.js

        // ==================== 启动流程控制 ====================
        // 模块引用（先声明为 null，后面初始化时赋值）
        let layoutContainersModule = null;
        let layoutTemplatesModule = null;
        let imageUploadModule = null;
        
        // 显示加载遮罩
        (function showInitialLoading() {
            const loadingOverlay = document.getElementById('loadingOverlay');
            if (loadingOverlay) {
                loadingOverlay.classList.add('show');
            }
        })();

        // ==================== 全局变量引用 ====================
        // 使用 AppState 集中管理状态，这里创建本地引用以保持兼容性
        let currentLang = AppState.currentLang;
        let currentTheme = AppState.currentTheme;
        let currentZoom = AppState.currentZoom;
        let snapEnabled = AppState.snapEnabled;
        let drawingMode = AppState.drawingMode;
        const SNAP_THRESHOLD = AppState.SNAP_THRESHOLD;
        const SNAP_EDGE_THRESHOLD = AppState.SNAP_EDGE_THRESHOLD;
        const ANGLE_SNAP = AppState.ANGLE_SNAP;
        const SNAP_ANGLES = AppState.SNAP_ANGLES;
        let guideLines = AppState.guideLines;
        let alignLabels = AppState.alignLabels;
        let rotationLabel = AppState.rotationLabel;
        let history = AppState.history;
        let historyStep = AppState.historyStep;
        let bgPickr, textPickr, bgPickrMobile, textPickrMobile, drawPickr, drawPickrMobile;
        
        // 空格键拖动画板相关变量
        let isSpacePressed = AppState.isSpacePressed;
        let isPanning = AppState.isPanning;
        let lastPosX = AppState.lastPosX;
        let lastPosY = AppState.lastPosY;
        
        // 导出模式：'full' 完整画布, 'smart' 智能裁剪
        let shareExportMode = AppState.shareExportMode;
        let downloadExportMode = AppState.downloadExportMode;
        
        // 裁剪工具相关变量
        let cropMode = AppState.cropMode;
        let cropTarget = AppState.cropTarget;
        let originalImageState = AppState.originalImageState;
        let cropRect = AppState.cropRect;
        let cropOverlays = AppState.cropOverlays;
        
        // 形状工具相关变量
        let currentShapeColor = AppState.currentShapeColor;
        let currentShapeStroke = AppState.currentShapeStroke;
        let shapePickr;

        // 使用 i18n.js 的翻译功能
        function updateLanguage() {
            if (typeof I18n !== 'undefined') {
                I18n.updateUI();
            }
        }

        async function changeLanguage(e, lang) {
            e.stopPropagation();
            currentLang = lang;
            setState('currentLang', lang);
            
            // 使用 i18n.js 切换语言
            if (typeof I18n !== 'undefined') {
                await I18n.changeLanguage(lang);
            }
            
            document.querySelectorAll('.lang-option').forEach(o => o.classList.remove('active'));
            e.currentTarget.classList.add('active');
            document.getElementById('langSelector')?.classList.remove('active');
            
            const langNames = { 'en': 'English', 'zh-CN': '简体中文', 'ja': '日本語', 'ko': '한국어' };
            showToast('✓ ' + langNames[lang]);
        }

        function toggleLangDropdown(e) {
            e.stopPropagation();
            document.getElementById('langSelector').classList.toggle('active');
        }

        function toggleMobileLang(e) {
            e.stopPropagation();
            document.getElementById('mobileLangDropdown').parentElement.classList.toggle('active');
        }

        function closeMobileLang() {
            document.getElementById('mobileLangDropdown').parentElement.classList.remove('active');
        }

        function toggleSidebar() {
            document.getElementById('sidebar').classList.toggle('collapsed');
        }

        function toggleMobileMenu() {
            document.getElementById('mobileMenu').classList.toggle('show');
            document.getElementById('mobileOverlay').classList.toggle('show');
        }

        function closeMobileMenu() {
            document.getElementById('mobileMenu').classList.remove('show');
            document.getElementById('mobileOverlay').classList.remove('show');
        }

        document.addEventListener('click', (e) => {
            const langSelector = document.getElementById('langSelector');
            if (langSelector && !langSelector.contains(e.target)) {
                langSelector.classList.remove('active');
            }
        });

        function toggleTheme() {
            currentTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', currentTheme);
            // 白天模式显示月亮，黑夜模式显示太阳
            const icon = currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
            document.querySelector('#themeToggle i').className = icon;
            
            canvas.backgroundColor = currentTheme === 'light' ? '#ffffff' : '#1f1f1f';
            canvas.renderAll();
            localStorage.setItem('theme', currentTheme);
        }

        function initTheme() {
            currentTheme = localStorage.getItem('theme') || 'light';
            document.documentElement.setAttribute('data-theme', currentTheme);
            const icon = currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
            document.querySelector('#themeToggle i').className = icon;
            
            // Set canvas background based on theme
            if (canvas) {
                canvas.backgroundColor = currentTheme === 'light' ? '#ffffff' : '#1f1f1f';
                canvas.renderAll();
            }
        }

        function initColorPickers() {
            const config = {
                theme: 'nano',
                swatches: ['#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'],
                components: { 
                    preview: true, 
                    opacity: true, 
                    hue: true, 
                    interaction: { hex: true, input: true, save: true }
                }
            };

            const drawConfig = {
                theme: 'nano',
                swatches: ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF'],
                components: { 
                    preview: true, 
                    hue: true, 
                    interaction: { hex: true, input: true, save: true }
                }
            };

            bgPickr = Pickr.create({ ...config, el: '#bgColorPicker', default: '#ffffff' });
            bgPickr.on('save', (c) => {
                if (c) {
                    canvas.backgroundColor = c.toHEXA().toString();
                    canvas.backgroundImage = null;
                    canvas.renderAll();
                    saveState();
                    closeAllDrawers();
                    showToast('✓ Background updated');
                }
                bgPickr.hide();
            });

            if (document.getElementById('bgColorPickerMobile')) {
                bgPickrMobile = Pickr.create({ ...config, el: '#bgColorPickerMobile', default: '#ffffff' });
                bgPickrMobile.on('save', (c) => {
                    if (c) {
                        canvas.backgroundColor = c.toHEXA().toString();
                        canvas.backgroundImage = null;
                        canvas.renderAll();
                        saveState();
                        closeAllDrawers();
                        showToast('✓ Background updated');
                    }
                    bgPickrMobile.hide();
                });
            }

            textPickr = Pickr.create({ 
                ...config, 
                el: '#textColorPicker', 
                default: '#000000',
                components: { preview: true, hue: true, interaction: { hex: true, input: true, save: true } }
            });
            textPickr.on('save', (c) => {
                if (c) {
                    const o = canvas.getActiveObject();
                    if (o?.type.includes('text')) {
                        o.set('fill', c.toHEXA().toString());
                        canvas.renderAll();
                        saveState();
                        closeAllDrawers();
                    }
                }
                textPickr.hide();
            });

            if (document.getElementById('textColorPickerMobile')) {
                textPickrMobile = Pickr.create({ 
                    ...config, 
                    el: '#textColorPickerMobile', 
                    default: '#000000',
                    components: { preview: true, hue: true, interaction: { hex: true, input: true, save: true } }
                });
                textPickrMobile.on('save', (c) => {
                    if (c) {
                        const o = canvas.getActiveObject();
                        if (o?.type.includes('text')) {
                            o.set('fill', c.toHEXA().toString());
                            canvas.renderAll();
                            saveState();
                            closeAllDrawers();
                        }
                    }
                    textPickrMobile.hide();
                });
            }

            // 画笔颜色选择器
            if (document.getElementById('drawColorPicker')) {
                drawPickr = Pickr.create({ 
                    ...drawConfig, 
                    el: '#drawColorPicker', 
                    default: savedBrushSettings.color
                });
                drawPickr.on('save', (c) => {
                    if (c) {
                        const colorStr = c.toHEXA().toString();
                        savedBrushSettings.color = colorStr;
                        canvas.freeDrawingBrush.color = colorStr;
                        closeAllDrawers();
                    }
                    drawPickr.hide();
                });
            }

            if (document.getElementById('drawColorPickerMobile')) {
                drawPickrMobile = Pickr.create({ 
                    ...drawConfig, 
                    el: '#drawColorPickerMobile', 
                    default: savedBrushSettings.color
                });
                drawPickrMobile.on('save', (c) => {
                    if (c) {
                        const colorStr = c.toHEXA().toString();
                        savedBrushSettings.color = colorStr;
                        canvas.freeDrawingBrush.color = colorStr;
                        // 同步桌面版颜色选择器
                        if (drawPickr) drawPickr.setColor(colorStr);
                        closeAllDrawers();
                    }
                    drawPickrMobile.hide();
                });
            }

            // 形状颜色选择器
            if (document.getElementById('shapeColorPicker')) {
                shapePickr = Pickr.create({ 
                    ...config, 
                    el: '#shapeColorPicker', 
                    default: '#667eea'
                });
                shapePickr.on('save', (c) => {
                    if (c) {
                        const colorStr = c.toHEXA().toString();
                        currentShapeStroke = colorStr;
                        // 如果颜色有透明度，用于填充，否则添加透明度
                        if (colorStr.length > 7) {
                            currentShapeColor = colorStr;
                        } else {
                            currentShapeColor = colorStr + '80'; // 50% opacity
                        }
                        
                        // 如果有选中的形状，更新其颜色
                        const activeObj = canvas.getActiveObject();
                        if (activeObj) {
                            if (activeObj.type === 'rect' || activeObj.type === 'circle') {
                                activeObj.set({
                                    fill: currentShapeColor,
                                    stroke: currentShapeStroke
                                });
                            } else if (activeObj.type === 'line') {
                                activeObj.set('stroke', currentShapeStroke);
                            } else if (activeObj.type === 'group') {
                                // 箭头组
                                activeObj.forEachObject((obj) => {
                                    if (obj.type === 'line') {
                                        obj.set('stroke', currentShapeStroke);
                                    } else if (obj.type === 'triangle') {
                                        obj.set('fill', currentShapeStroke);
                                    }
                                });
                            }
                            canvas.renderAll();
                            saveState();
                        }
                        
                        showToast('✓ Shape color updated');
                    }
                    shapePickr.hide();
                });
            }
        }

        function openBgColorPicker() {
            if (bgPickr) bgPickr.show();
        }

        function openBgColorPickerMobile() {
            if (bgPickrMobile) bgPickrMobile.show();
        }

        function toggleDrawer(type) {
            const drawerId = type + 'Drawer';
            const trigger = event.target.closest('.drawer-trigger');
            const drawer = document.getElementById(drawerId);
            
            // 关闭其他抽屉
            document.querySelectorAll('.drawer-trigger').forEach(t => {
                if (t !== trigger) t.classList.remove('active');
            });
            document.querySelectorAll('.drawer-content').forEach(d => {
                if (d !== drawer) d.classList.remove('show');
            });
            
            // 切换当前抽屉
            trigger.classList.toggle('active');
            drawer.classList.toggle('show');
        }

        function closeAllDrawers() {
            document.querySelectorAll('.drawer-trigger').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.drawer-content').forEach(d => d.classList.remove('show'));
            closeMobileMenu();
        }
        
        // Settings modal toggle function
        function openSettingsModal(type) {
            const drawers = {
                'background': 'bgDrawer',
                'shape': 'shapeDrawer',
                'draw': 'drawDrawer',
                'text': 'textDrawer',
                'layer': 'layerDrawer'
            };
            
            const drawerId = drawers[type];
            if (!drawerId) return;
            
            const drawer = document.getElementById(drawerId);
            if (!drawer) return;
            
            // Toggle the drawer
            const isOpen = drawer.classList.contains('show');
            
            // Close all drawers first
            Object.values(drawers).forEach(id => {
                const d = document.getElementById(id);
                if (d) d.classList.remove('show');
            });
            
            // Open the clicked drawer if it was closed
            if (!isOpen) {
                drawer.classList.add('show');
            }
        }
        
        // Close settings modal
        function closeSettingsModal() {
            closeAllDrawers();
        }

        function setBgTransparent() {
            canvas.backgroundColor = null;
            canvas.backgroundImage = null;
            canvas.renderAll();
            saveState();
            closeAllDrawers();
            showToast('✓ Transparent');
        }

        function triggerBgUpload() {
            document.getElementById('bgInput').click();
        }

        let canvasWidth, canvasHeight;
        
        function initCanvas() {
            const container = document.querySelector('.canvas-container');
            if (!container) return;
            canvasWidth = container.clientWidth;
            canvasHeight = container.clientHeight;
            canvas.setDimensions({ width: canvasWidth, height: canvasHeight });
            canvas.renderAll();
        }

        // ==================== Canvas 初始化（需要 fabric 已加载）====================
        // 检查 fabric 是否已加载
        if (typeof fabric === 'undefined') {
            console.error('[Bootstrap] fabric.js not loaded!');
        }
        
        // 标记 fabric 已就绪
        setBootstrapState('fabricReady', true);
        
        const canvas = new fabric.Canvas('canvas', {
            backgroundColor: '#ffffff',
            preserveObjectStacking: true,
            selection: true,
            perPixelTargetFind: true,
            targetFindTolerance: 5
        });

        // 右键菜单由contextmenu事件处理，这里不再阻止
        // canvas.wrapperEl.oncontextmenu = (e) => { e.preventDefault(); return false; };

        initCanvas();
        
        // 标记 canvas 已就绪
        setBootstrapState('canvasReady', true);
        
        // 标记 canvas 已就绪
        setBootstrapState('canvasReady', true);
        initTheme();
        updateLanguage();
        window.addEventListener('resize', initCanvas);
        window.addEventListener('load', initColorPickers);

        function zoomIn() {
            currentZoom = Math.min(currentZoom + 0.05, 3);
            applyZoom();
        }

        function zoomOut() {
            currentZoom = Math.max(currentZoom - 0.05, 0.1);
            applyZoom();
        }

        function resetZoom() {
            currentZoom = 1;
            applyZoom();
        }

        function applyZoom() {
            canvas.setZoom(currentZoom);
            document.getElementById('zoomLevel').textContent = Math.round(currentZoom * 100) + '%';
            const t = document.getElementById('zoomToast');
            t.textContent = Math.round(currentZoom * 100) + '%';
            t.classList.add('show');
            setTimeout(() => t.classList.remove('show'), 800);
        }

        // ==================== 图片上传模块初始化 ====================
        // 使用抽离的 imageUpload 模块
        imageUploadModule = initImageUpload(canvas, 
            () => ({ width: canvasWidth, height: canvasHeight }),
            { saveState, hideEmptyState, showToast, closeAllDrawers }
        );
        
        // 暴露 triggerUpload 和 addImage 供全局调用
        function triggerUpload() {
            if (!isBootstrapComplete()) {
                showToast('Loading...');
                return;
            }
            imageUploadModule.triggerUpload();
        }
        
        function addImage(file) {
            if (!isBootstrapComplete()) return;
            imageUploadModule.addImage(file);
        }
        
        function triggerBgUpload() {
            if (!isBootstrapComplete()) {
                showToast('Loading...');
                return;
            }
            imageUploadModule.triggerBgUpload();
        }

        // 保存画笔设置 - 使用 AppState
        let savedBrushSettings = AppState.savedBrushSettings;

        // 关闭绘画模式
        function disableDrawMode() {
            if (drawingMode) {
                drawingMode = false;
                setState('drawingMode', false);
                canvas.isDrawingMode = false;
                document.getElementById('drawToggle').classList.remove('active');
                const mobileBtn = document.getElementById('drawToggleMobile');
                if (mobileBtn) mobileBtn.classList.remove('active');
            }
        }

        function toggleDraw() {
            drawingMode = !drawingMode;
            setState('drawingMode', drawingMode);
            canvas.isDrawingMode = drawingMode;
            document.getElementById('drawToggle').classList.toggle('active', drawingMode);
            const mobileBtn = document.getElementById('drawToggleMobile');
            if (mobileBtn) mobileBtn.classList.toggle('active', drawingMode);
            
            if (drawingMode) {
                // 使用保存的画笔设置
                canvas.freeDrawingBrush.color = savedBrushSettings.color;
                canvas.freeDrawingBrush.width = savedBrushSettings.width;
                // 同步颜色选择器显示
                if (drawPickr) drawPickr.setColor(savedBrushSettings.color);
                if (drawPickrMobile) drawPickrMobile.setColor(savedBrushSettings.color);
                showToast('✓ Draw mode ON');
                openDrawDrawer();
            } else {
                showToast('Draw mode OFF');
                closeAllDrawers();
            }
        }

        function updateBrushSize(value) {
            savedBrushSettings.width = parseInt(value);
            setNestedState('savedBrushSettings', 'width', parseInt(value));
            canvas.freeDrawingBrush.width = parseInt(value);
            document.getElementById('brushSizeValue').textContent = value + 'px';
            const mobileValue = document.getElementById('brushSizeValueMobile');
            if (mobileValue) mobileValue.textContent = value + 'px';
            // 同步两个滑块的值
            document.getElementById('brushSize').value = value;
            const mobileBrush = document.getElementById('brushSizeMobile');
            if (mobileBrush) mobileBrush.value = value;
        }

        // 保存文字设置 - 使用 AppState
        let savedTextSettings = AppState.savedTextSettings;

        function addText() {
            const text = new fabric.IText('Double click to edit', {
                left: canvasWidth / 2,
                top: canvasHeight / 2,
                originX: 'center',
                originY: 'center',
                fontFamily: savedTextSettings.fontFamily,
                fontSize: savedTextSettings.fontSize,
                fill: savedTextSettings.fill,
                fontWeight: savedTextSettings.fontWeight
            });
            canvas.add(text);
            canvas.setActiveObject(text);
            canvas.renderAll();
            hideEmptyState();
            saveState();
            showToast('✓ Text added');
        }
        
        function openTextDrawer() {
            // 不自动打开
        }
        
        function openShapeDrawer() {
            // 打开形状抽屉
            toggleDrawer('shape');
        }
        
        function openDrawDrawer() {
            // 打开画笔抽屉
            toggleDrawer('draw');
        }

        function updateTextFont(v) {
            savedTextSettings.fontFamily = v;
            const o = canvas.getActiveObject();
            if (o?.type.includes('text')) {
                o.set('fontFamily', v);
                canvas.renderAll();
                saveState();
            }
        }

        function updateTextWeight(v) {
            savedTextSettings.fontWeight = v;
            const o = canvas.getActiveObject();
            if (o?.type.includes('text')) {
                o.set('fontWeight', v);
                canvas.renderAll();
                saveState();
            }
        }

        function updateTextSize(v) {
            savedTextSettings.fontSize = parseInt(v);
            const o = canvas.getActiveObject();
            if (o?.type.includes('text')) {
                o.set('fontSize', parseInt(v));
                canvas.renderAll();
                saveState();
            }
        }

        function updateTextAlign(v) {
            const o = canvas.getActiveObject();
            if (o?.type.includes('text')) {
                o.set('textAlign', v);
                canvas.renderAll();
                saveState();
            }
        }

        function updateLineHeight(v) {
            const o = canvas.getActiveObject();
            if (o?.type.includes('text')) {
                o.set('lineHeight', parseFloat(v));
                document.getElementById('lineHeightValue').textContent = v;
                const mobileValue = document.getElementById('lineHeightValueMobile');
                if (mobileValue) mobileValue.textContent = v;
                canvas.renderAll();
                saveState();
            }
        }

        // 形状工具函数
        function toggleShapePanel() {
            openSettingsModal('shape');
        }

        function addRectangle() {
            const rect = new fabric.Rect({
                left: canvasWidth / 2,
                top: canvasHeight / 2,
                width: 200,
                height: 150,
                fill: currentShapeColor,
                stroke: currentShapeStroke,
                strokeWidth: 2,
                originX: 'center',
                originY: 'center',
                cornerColor: '#0066cc',
                cornerStyle: 'circle',
                borderColor: '#0066cc',
                cornerSize: 10,
                transparentCorners: false
            });
            canvas.add(rect);
            canvas.setActiveObject(rect);
            canvas.renderAll();
            hideEmptyState();
            saveState();
            showToast('✓ Rectangle added');
            closeAllDrawers();
        }

        function addCircle() {
            const circle = new fabric.Circle({
                left: canvasWidth / 2,
                top: canvasHeight / 2,
                radius: 80,
                fill: currentShapeColor,
                stroke: currentShapeStroke,
                strokeWidth: 2,
                originX: 'center',
                originY: 'center',
                cornerColor: '#0066cc',
                cornerStyle: 'circle',
                borderColor: '#0066cc',
                cornerSize: 10,
                transparentCorners: false
            });
            canvas.add(circle);
            canvas.setActiveObject(circle);
            canvas.renderAll();
            hideEmptyState();
            saveState();
            showToast('✓ Circle added');
            closeAllDrawers();
        }

        function addLine() {
            const line = new fabric.Line([50, 50, 250, 50], {
                left: canvasWidth / 2 - 100,
                top: canvasHeight / 2,
                stroke: currentShapeStroke,
                strokeWidth: 3,
                originX: 'center',
                originY: 'center',
                cornerColor: '#0066cc',
                cornerStyle: 'circle',
                borderColor: '#0066cc',
                cornerSize: 10,
                transparentCorners: false
            });
            canvas.add(line);
            canvas.setActiveObject(line);
            canvas.renderAll();
            hideEmptyState();
            saveState();
            showToast('✓ Line added');
            closeAllDrawers();
        }

        function addArrow() {
            // 创建更像箭头的形状：左侧箭头 + 右侧横线
            const triangle = new fabric.Triangle({
                width: 20,
                height: 25,
                fill: currentShapeStroke,
                left: -100,
                top: 0,
                angle: -90,
                originX: 'center',
                originY: 'center'
            });
            
            const line = new fabric.Line([-90, 0, 100, 0], {
                stroke: currentShapeStroke,
                strokeWidth: 4,
                originX: 'center',
                originY: 'center'
            });
            
            const arrow = new fabric.Group([line, triangle], {
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
            
            canvas.add(arrow);
            canvas.setActiveObject(arrow);
            canvas.renderAll();
            hideEmptyState();
            saveState();
            showToast('✓ Arrow added');
            closeAllDrawers();
        }

        // 元素顺序调整函数
        function bringToFront() {
            const obj = canvas.getActiveObject();
            if (obj) {
                canvas.bringToFront(obj);
                canvas.renderAll();
                saveState();
                showToast('✓ Brought to front');
            }
        }

        function sendToBack() {
            const obj = canvas.getActiveObject();
            if (obj) {
                canvas.sendToBack(obj);
                canvas.renderAll();
                saveState();
                showToast('✓ Sent to back');
            }
        }

        function bringForward() {
            const obj = canvas.getActiveObject();
            if (obj) {
                canvas.bringForward(obj);
                canvas.renderAll();
                saveState();
                showToast('✓ Moved forward');
            }
        }

        function sendBackwards() {
            const obj = canvas.getActiveObject();
            if (obj) {
                canvas.sendBackwards(obj);
                canvas.renderAll();
                saveState();
                showToast('✓ Moved backward');
            }
        }

        // 裁剪工具函数
        function toggleCrop() {
            const activeObj = canvas.getActiveObject();
            
            if (!activeObj || activeObj.type !== 'image') {
                showToast('Select an image first');
                return;
            }
            
            if (cropMode) {
                exitCropMode();
            } else {
                enterCropMode(activeObj);
            }
        }

        function toggleCropMobile() {
            toggleCrop();
            if (!cropMode) {
                toggleMobileToolbar();
            }
        }

        function enterCropMode(imageObj) {
            cropMode = true;
            cropTarget = imageObj;
            
            // 保存原始状态
            originalImageState = {
                left: imageObj.left,
                top: imageObj.top,
                scaleX: imageObj.scaleX,
                scaleY: imageObj.scaleY,
                width: imageObj.width,
                height: imageObj.height,
                cropX: imageObj.cropX || 0,
                cropY: imageObj.cropY || 0
            };
            
            // 禁用其他交互
            canvas.selection = false;
            imageObj.set({
                lockMovementX: true,
                lockMovementY: true,
                lockRotation: true,
                hasControls: false,
                selectable: false
            });
            
            // 创建裁剪矩形
            createCropRectangle(imageObj);
            
            // 更新 UI
            document.getElementById('cropToggle').classList.add('active');
            const mobileCropBtn = document.getElementById('cropToggleMobile');
            if (mobileCropBtn) mobileCropBtn.classList.add('active');
            
            showToast('✓ Crop mode ON');
        }

        function createCropRectangle(imageObj) {
            const bounds = imageObj.getBoundingRect(true);
            const padding = 20;
            
            // 创建半透明遮罩
            const overlayTop = new fabric.Rect({
                left: 0,
                top: 0,
                width: canvasWidth,
                height: bounds.top,
                fill: 'rgba(0, 0, 0, 0.5)',
                selectable: false,
                evented: false,
                excludeFromExport: true
            });
            
            const overlayBottom = new fabric.Rect({
                left: 0,
                top: bounds.top + bounds.height,
                width: canvasWidth,
                height: canvasHeight - (bounds.top + bounds.height),
                fill: 'rgba(0, 0, 0, 0.5)',
                selectable: false,
                evented: false,
                excludeFromExport: true
            });
            
            const overlayLeft = new fabric.Rect({
                left: 0,
                top: bounds.top,
                width: bounds.left,
                height: bounds.height,
                fill: 'rgba(0, 0, 0, 0.5)',
                selectable: false,
                evented: false,
                excludeFromExport: true
            });
            
            const overlayRight = new fabric.Rect({
                left: bounds.left + bounds.width,
                top: bounds.top,
                width: canvasWidth - (bounds.left + bounds.width),
                height: bounds.height,
                fill: 'rgba(0, 0, 0, 0.5)',
                selectable: false,
                evented: false,
                excludeFromExport: true
            });
            
            cropOverlays = [overlayTop, overlayBottom, overlayLeft, overlayRight];
            
            // 创建裁剪矩形
            cropRect = new fabric.Rect({
                left: bounds.left,
                top: bounds.top,
                width: bounds.width,
                height: bounds.height,
                fill: 'transparent',
                stroke: '#0066cc',
                strokeWidth: 2,
                cornerColor: '#0066cc',
                cornerStyle: 'circle',
                cornerSize: 12,
                transparentCorners: false,
                lockRotation: true,
                hasRotatingPoint: false
            });
            
            // 添加约束
            cropRect.on('moving', updateCropOverlays);
            cropRect.on('scaling', updateCropOverlays);
            
            cropOverlays.forEach(overlay => canvas.add(overlay));
            canvas.add(cropRect);
            canvas.setActiveObject(cropRect);
            canvas.renderAll();
            
            // 显示确认/取消按钮
            showCropActions();
        }

        function updateCropOverlays() {
            if (!cropRect || !cropTarget) return;
            
            const bounds = cropRect.getBoundingRect(true);
            const imageBounds = cropTarget.getBoundingRect(true);
            
            // 约束裁剪矩形在图片范围内
            if (bounds.left < imageBounds.left) {
                cropRect.set('left', cropRect.left + (imageBounds.left - bounds.left));
            }
            if (bounds.top < imageBounds.top) {
                cropRect.set('top', cropRect.top + (imageBounds.top - bounds.top));
            }
            if (bounds.left + bounds.width > imageBounds.left + imageBounds.width) {
                cropRect.set('left', cropRect.left - ((bounds.left + bounds.width) - (imageBounds.left + imageBounds.width)));
            }
            if (bounds.top + bounds.height > imageBounds.top + imageBounds.height) {
                cropRect.set('top', cropRect.top - ((bounds.top + bounds.height) - (imageBounds.top + imageBounds.height)));
            }
            
            cropRect.setCoords();
            const newBounds = cropRect.getBoundingRect(true);
            
            // 更新遮罩位置
            if (cropOverlays.length === 4) {
                cropOverlays[0].set({ width: canvasWidth, height: newBounds.top });
                cropOverlays[1].set({ top: newBounds.top + newBounds.height, width: canvasWidth, height: canvasHeight - (newBounds.top + newBounds.height) });
                cropOverlays[2].set({ top: newBounds.top, width: newBounds.left, height: newBounds.height });
                cropOverlays[3].set({ left: newBounds.left + newBounds.width, top: newBounds.top, width: canvasWidth - (newBounds.left + newBounds.width), height: newBounds.height });
            }
            
            canvas.renderAll();
        }

        function showCropActions() {
            const actionsDiv = document.createElement('div');
            actionsDiv.id = 'cropActions';
            actionsDiv.className = 'crop-actions';
            actionsDiv.innerHTML = `
                <button class="crop-action-btn confirm" onclick="confirmCrop()">
                    <i class="fas fa-check"></i>
                    <span data-i18n="confirm">Confirm</span>
                </button>
                <button class="crop-action-btn cancel" onclick="cancelCrop()">
                    <i class="fas fa-times"></i>
                    <span data-i18n="cancel">Cancel</span>
                </button>
            `;
            document.getElementById('canvasContainer').appendChild(actionsDiv);
            
            // 更新翻译
            if (typeof I18n !== 'undefined') {
                I18n.updateUI();
            }
        }

        function hideCropActions() {
            const actionsDiv = document.getElementById('cropActions');
            if (actionsDiv) {
                actionsDiv.remove();
            }
        }

        function confirmCrop() {
            if (!cropMode || !cropTarget || !cropRect) return;
            
            const cropBounds = cropRect.getBoundingRect(true);
            const imageBounds = cropTarget.getBoundingRect(true);
            
            // 计算裁剪坐标（相对于原始图片）
            const cropX = (cropBounds.left - imageBounds.left) / cropTarget.scaleX;
            const cropY = (cropBounds.top - imageBounds.top) / cropTarget.scaleY;
            const cropWidth = cropBounds.width / cropTarget.scaleX;
            const cropHeight = cropBounds.height / cropTarget.scaleY;
            
            // 应用裁剪
            cropTarget.set({
                cropX: (cropTarget.cropX || 0) + cropX,
                cropY: (cropTarget.cropY || 0) + cropY,
                width: cropWidth,
                height: cropHeight
            });
            
            exitCropMode();
            saveState();
            showToast('✓ Cropped');
        }

        function cancelCrop() {
            if (!cropMode || !cropTarget) return;
            
            // 恢复原始状态
            if (originalImageState) {
                cropTarget.set(originalImageState);
            }
            
            exitCropMode();
            showToast('Crop cancelled');
        }

        function exitCropMode() {
            cropMode = false;
            
            // 移除裁剪矩形和遮罩
            if (cropRect) {
                canvas.remove(cropRect);
                cropRect = null;
            }
            
            cropOverlays.forEach(overlay => canvas.remove(overlay));
            cropOverlays = [];
            
            // 恢复图片控制
            if (cropTarget) {
                cropTarget.set({
                    lockMovementX: false,
                    lockMovementY: false,
                    lockRotation: false,
                    hasControls: true,
                    selectable: true
                });
            }
            
            // 重新启用画布选择
            canvas.selection = true;
            canvas.renderAll();
            
            // 更新 UI
            document.getElementById('cropToggle').classList.remove('active');
            const mobileCropBtn = document.getElementById('cropToggleMobile');
            if (mobileCropBtn) mobileCropBtn.classList.remove('active');
            
            hideCropActions();
            
            // 清除状态
            cropTarget = null;
            originalImageState = null;
        }

        // 更新裁剪按钮状态
        function updateCropButtonState() {
            const activeObj = canvas.getActiveObject();
            const cropBtn = document.getElementById('cropToggle');
            const cropBtnMobile = document.getElementById('cropToggleMobile');
            const blurBtn = document.getElementById('blurToggle');
            const blurBtnMobile = document.getElementById('blurToggleMobile');
            const pixelateBtn = document.getElementById('pixelateToggle');
            const pixelateBtnMobile = document.getElementById('pixelateToggleMobile');
            
            const isImageSelected = activeObj && activeObj.type === 'image';
            
            if (cropBtn) {
                cropBtn.disabled = !isImageSelected;
                cropBtn.style.opacity = isImageSelected ? '1' : '0.5';
                cropBtn.style.cursor = isImageSelected ? 'pointer' : 'not-allowed';
            }
            
            if (cropBtnMobile) {
                cropBtnMobile.disabled = !isImageSelected;
                cropBtnMobile.style.opacity = isImageSelected ? '1' : '0.5';
            }
            
            if (blurBtn) {
                blurBtn.disabled = !isImageSelected;
                blurBtn.style.opacity = isImageSelected ? '1' : '0.5';
                blurBtn.style.cursor = isImageSelected ? 'pointer' : 'not-allowed';
            }
            
            if (blurBtnMobile) {
                blurBtnMobile.disabled = !isImageSelected;
                blurBtnMobile.style.opacity = isImageSelected ? '1' : '0.5';
            }
            
            if (pixelateBtn) {
                pixelateBtn.disabled = !isImageSelected;
                pixelateBtn.style.opacity = isImageSelected ? '1' : '0.5';
                pixelateBtn.style.cursor = isImageSelected ? 'pointer' : 'not-allowed';
            }
            
            if (pixelateBtnMobile) {
                pixelateBtnMobile.disabled = !isImageSelected;
                pixelateBtnMobile.style.opacity = isImageSelected ? '1' : '0.5';
            }
        }

        // 模糊工具
        function toggleBlur() {
            const activeObj = canvas.getActiveObject();
            if (!activeObj || activeObj.type !== 'image') {
                showToast('Select an image first');
                return;
            }
            
            // 检查是否已有模糊滤镜
            const hasBlur = activeObj.filters && activeObj.filters.some(f => f.type === 'Blur');
            
            if (hasBlur) {
                // 移除模糊
                activeObj.filters = activeObj.filters.filter(f => f.type !== 'Blur');
                showToast('Blur removed');
            } else {
                // 添加模糊
                if (!activeObj.filters) activeObj.filters = [];
                activeObj.filters.push(new fabric.Image.filters.Blur({ blur: 0.3 }));
                showToast('✓ Blur applied');
            }
            
            activeObj.applyFilters();
            canvas.renderAll();
            saveState();
        }

        // 马赛克工具
        function togglePixelate() {
            const activeObj = canvas.getActiveObject();
            if (!activeObj || activeObj.type !== 'image') {
                showToast('Select an image first');
                return;
            }
            
            // 检查是否已有马赛克滤镜
            const hasPixelate = activeObj.filters && activeObj.filters.some(f => f.type === 'Pixelate');
            
            if (hasPixelate) {
                // 移除马赛克
                activeObj.filters = activeObj.filters.filter(f => f.type !== 'Pixelate');
                showToast('Pixelate removed');
            } else {
                // 添加马赛克
                if (!activeObj.filters) activeObj.filters = [];
                activeObj.filters.push(new fabric.Image.filters.Pixelate({ blocksize: 10 }));
                showToast('✓ Pixelate applied');
            }
            
            activeObj.applyFilters();
            canvas.renderAll();
            saveState();
        }

        // 粘贴和拖放事件已移至 src/upload/imageUpload.js 模块

        // 智能对齐
        canvas.on('object:moving', function(e) {
            const obj = e.target;
            // 使用画布坐标（不受视口变换影响）
            const objBounds = obj.getBoundingRect(false);
            
            clearGuides();
            
            if (snapEnabled) {
                let snapX = null, snapY = null;
                let minDistX = Infinity, minDistY = Infinity;
                
                // 移除画布边界对齐，只保留对象之间的对齐
                // 与其他对象对齐（使用画布坐标）
                canvas.getObjects().forEach(other => {
                    if (other === obj || other.type.includes('text')) return;
                    
                    const ob = other.getBoundingRect(false);
                    
                    // 边缘吸附
                    const edgeLeft = objBounds.left - (ob.left + ob.width);
                    const edgeRight = objBounds.left + objBounds.width - ob.left;
                    const edgeTop = objBounds.top - (ob.top + ob.height);
                    const edgeBottom = objBounds.top + objBounds.height - ob.top;
                    
                    if (Math.abs(edgeLeft) < SNAP_EDGE_THRESHOLD && Math.abs(edgeLeft) < minDistX) {
                        snapX = { delta: -edgeLeft, line: ob.left + ob.width };
                        minDistX = Math.abs(edgeLeft);
                    }
                    if (Math.abs(edgeRight) < SNAP_EDGE_THRESHOLD && Math.abs(edgeRight) < minDistX) {
                        snapX = { delta: -edgeRight, line: ob.left };
                        minDistX = Math.abs(edgeRight);
                    }
                    if (Math.abs(edgeTop) < SNAP_EDGE_THRESHOLD && Math.abs(edgeTop) < minDistY) {
                        snapY = { delta: -edgeTop, line: ob.top + ob.height };
                        minDistY = Math.abs(edgeTop);
                    }
                    if (Math.abs(edgeBottom) < SNAP_EDGE_THRESHOLD && Math.abs(edgeBottom) < minDistY) {
                        snapY = { delta: -edgeBottom, line: ob.top };
                        minDistY = Math.abs(edgeBottom);
                    }
                    
                    // 对齐
                    const alignLeft = objBounds.left - ob.left;
                    const alignTop = objBounds.top - ob.top;
                    const alignRight = (objBounds.left + objBounds.width) - (ob.left + ob.width);
                    const alignBottom = (objBounds.top + objBounds.height) - (ob.top + ob.height);
                    
                    if (Math.abs(alignLeft) < SNAP_THRESHOLD && Math.abs(alignLeft) < minDistX) {
                        snapX = { delta: -alignLeft, line: ob.left, label: 'Left' };
                        minDistX = Math.abs(alignLeft);
                    }
                    if (Math.abs(alignTop) < SNAP_THRESHOLD && Math.abs(alignTop) < minDistY) {
                        snapY = { delta: -alignTop, line: ob.top, label: 'Top' };
                        minDistY = Math.abs(alignTop);
                    }
                    if (Math.abs(alignRight) < SNAP_THRESHOLD && Math.abs(alignRight) < minDistX) {
                        snapX = { delta: -alignRight, line: ob.left + ob.width, label: 'Right' };
                        minDistX = Math.abs(alignRight);
                    }
                    if (Math.abs(alignBottom) < SNAP_THRESHOLD && Math.abs(alignBottom) < minDistY) {
                        snapY = { delta: -alignBottom, line: ob.top + ob.height, label: 'Bottom' };
                        minDistY = Math.abs(alignBottom);
                    }
                });
                
                // 应用吸附
                if (snapX) {
                    obj.set('left', obj.left + snapX.delta);
                    obj.setCoords();
                }
                if (snapY) {
                    obj.set('top', obj.top + snapY.delta);
                    obj.setCoords();
                }
                
                // 显示对齐线（使用视口坐标）
                if (snapX) {
                    // 获取当前对象的视口位置
                    const currentBounds = obj.getBoundingRect(true);
                    // 使用 fabric.util.transformPoint 转换坐标点
                    const transformedPoint = fabric.util.transformPoint(
                        new fabric.Point(snapX.line, 0), 
                        canvas.viewportTransform
                    );
                    addGuideLine('vertical', transformedPoint.x);
                    if (snapX.label) addAlignLabel(snapX.label, transformedPoint.x + 10, currentBounds.top + 20);
                }
                if (snapY) {
                    // 获取当前对象的视口位置
                    const currentBounds = obj.getBoundingRect(true);
                    // 使用 fabric.util.transformPoint 转换坐标点
                    const transformedPoint = fabric.util.transformPoint(
                        new fabric.Point(0, snapY.line), 
                        canvas.viewportTransform
                    );
                    addGuideLine('horizontal', transformedPoint.y);
                    if (snapY.label) addAlignLabel(snapY.label, currentBounds.left + 20, transformedPoint.y + 10);
                }
            }
            
            // 移除所有边界限制，允许对象在画布任意位置移动
            obj.setCoords();
        });

        canvas.on('object:rotating', (e) => {
            let a = e.target.angle % 360;
            if (a < 0) a += 360;
            for (const sa of SNAP_ANGLES) {
                if (Math.abs(a - sa) < ANGLE_SNAP) {
                    e.target.set('angle', sa);
                    if (rotationLabel) rotationLabel.remove();
                    const b = e.target.getBoundingRect();
                    rotationLabel = Object.assign(document.createElement('div'), {
                        className: 'rotation-label',
                        textContent: sa + '°'
                    });
                    rotationLabel.style.cssText = `left:${b.left+b.width/2}px;top:${b.top-35}px;transform:translateX(-50%)`;
                    document.getElementById('canvasContainer').appendChild(rotationLabel);
                    return;
                }
            }
            if (rotationLabel) { rotationLabel.remove(); rotationLabel = null; }
        });

        canvas.on('object:modified', () => { 
            clearGuides(); 
            if (rotationLabel) { rotationLabel.remove(); rotationLabel = null; }
            saveState(); 
        });

        // 画笔绘制完成后保存状态
        canvas.on('path:created', () => {
            hideEmptyState();
            saveState();
        });

        function addGuideLine(t, p) {
            const l = document.createElement('div');
            l.className = `guide-line ${t}`;
            l.style[t === 'horizontal' ? 'top' : 'left'] = p + 'px';
            document.getElementById('canvasContainer').appendChild(l);
            guideLines.push(l);
        }

        function addAlignLabel(txt, x, y) {
            const l = Object.assign(document.createElement('div'), {
                className: 'align-label',
                textContent: txt
            });
            l.style.cssText = `left:${x}px;top:${y}px`;
            document.getElementById('canvasContainer').appendChild(l);
            alignLabels.push(l);
        }

        function clearGuides() {
            guideLines.forEach(l => l.remove());
            guideLines = [];
            alignLabels.forEach(l => l.remove());
            alignLabels = [];
        }

        canvas.on('selection:created', (e) => {
            e.selected[0].bringToFront();
            canvas.renderAll();
            updateCropButtonState();
            
            const obj = e.selected[0];
            
            // 文本对象
            if (obj.type.includes('text')) {
                document.getElementById('fontFamily').value = obj.fontFamily || 'Arial';
                document.getElementById('fontWeight').value = obj.fontWeight || 'normal';
                document.getElementById('fontSize').value = obj.fontSize || 32;
                document.getElementById('lineHeight').value = obj.lineHeight || 1.16;
                document.getElementById('lineHeightValue').textContent = (obj.lineHeight || 1.16).toFixed(2);
                
                if (textPickr) textPickr.setColor(obj.fill);
                if (textPickrMobile) textPickrMobile.setColor(obj.fill);
            }
            // 形状对象（矩形、圆形、线条、箭头组）
            else if (obj.type === 'rect' || obj.type === 'circle' || obj.type === 'line' || obj.type === 'group') {
                if (shapePickr) {
                    const fillColor = obj.fill || currentShapeColor;
                    const strokeColor = obj.stroke || currentShapeStroke;
                    currentShapeColor = fillColor;
                    currentShapeStroke = strokeColor;
                    shapePickr.setColor(strokeColor);
                }
            }
        });

        canvas.on('selection:updated', (e) => {
            e.selected[0].bringToFront();
            canvas.renderAll();
            updateCropButtonState();
            
            const obj = e.selected[0];
            
            // 文本对象
            if (obj.type.includes('text')) {
                document.getElementById('fontFamily').value = obj.fontFamily || 'Arial';
                document.getElementById('fontWeight').value = obj.fontWeight || 'normal';
                document.getElementById('fontSize').value = obj.fontSize || 32;
                document.getElementById('lineHeight').value = obj.lineHeight || 1.16;
                document.getElementById('lineHeightValue').textContent = (obj.lineHeight || 1.16).toFixed(2);
                
                if (textPickr) textPickr.setColor(obj.fill);
                if (textPickrMobile) textPickrMobile.setColor(obj.fill);
            }
            // 形状对象
            else if (obj.type === 'rect' || obj.type === 'circle' || obj.type === 'line' || obj.type === 'group') {
                if (shapePickr) {
                    const fillColor = obj.fill || currentShapeColor;
                    const strokeColor = obj.stroke || currentShapeStroke;
                    currentShapeColor = fillColor;
                    currentShapeStroke = strokeColor;
                    shapePickr.setColor(strokeColor);
                }
            }
        });

        canvas.on('selection:cleared', () => {
            updateCropButtonState();
            closeAllDrawers();
        });

        // 水平翻转 - 以画板垂直中心线为基准
        function flipHorizontal() {
            const o = canvas.getActiveObject();
            if (!o) return;
            
            // 获取画板中心
            const canvasCenterX = canvasWidth / 2;
            
            // 获取对象中心
            const objCenter = o.getCenterPoint();
            
            // 计算对象中心到画板中心的距离
            const distanceFromCenter = objCenter.x - canvasCenterX;
            
            // 翻转对象本身
            o.set('flipX', !o.flipX);
            
            // 将对象移动到画板中心线的另一侧（镜像位置）
            o.set('left', o.left - 2 * distanceFromCenter);
            
            o.setCoords();
            canvas.renderAll();
            saveState();
        }

        // 垂直翻转 - 以画板水平中心线为基准
        function flipVertical() {
            const o = canvas.getActiveObject();
            if (!o) return;
            
            // 获取画板中心
            const canvasCenterY = canvasHeight / 2;
            
            // 获取对象中心
            const objCenter = o.getCenterPoint();
            
            // 计算对象中心到画板中心的距离
            const distanceFromCenter = objCenter.y - canvasCenterY;
            
            // 翻转对象本身
            o.set('flipY', !o.flipY);
            
            // 将对象移动到画板中心线的另一侧（镜像位置）
            o.set('top', o.top - 2 * distanceFromCenter);
            
            o.setCoords();
            canvas.renderAll();
            saveState();
        }

        // Layer management functions
        function bringToFront() {
            const o = canvas.getActiveObject();
            if (o) {
                canvas.bringToFront(o);
                canvas.renderAll();
                saveState();
                showToast('↑ Brought to front');
            }
        }

        function bringForward() {
            const o = canvas.getActiveObject();
            if (o) {
                canvas.bringForward(o);
                canvas.renderAll();
                saveState();
                showToast('↑ Moved forward');
            }
        }

        function sendBackward() {
            const o = canvas.getActiveObject();
            if (o) {
                canvas.sendBackwards(o);
                canvas.renderAll();
                saveState();
                showToast('↓ Moved backward');
            }
        }

        function sendToBack() {
            const o = canvas.getActiveObject();
            if (o) {
                canvas.sendToBack(o);
                canvas.renderAll();
                saveState();
                showToast('↓ Sent to back');
            }
        }

        function toggleLock() {
            const o = canvas.getActiveObject();
            if (o) {
                // Toggle layer order lock (prevent layer reordering)
                const isLayerLocked = o.layerLocked || false;
                o.layerLocked = !isLayerLocked;
                
                // Update lock button icon
                const lockBtn = document.getElementById('lockBtn');
                if (lockBtn) {
                    const icon = lockBtn.querySelector('i');
                    if (icon) {
                        icon.className = o.layerLocked ? 'fas fa-lock' : 'fas fa-lock-open';
                    }
                }
                
                canvas.renderAll();
                saveState();
                showToast(o.layerLocked ? '🔒 Layer order locked' : '🔓 Layer order unlocked');
            }
        }

        // Override layer movement functions to respect lock
        const originalBringToFront = canvas.bringToFront;
        const originalBringForward = canvas.bringForward;
        const originalSendBackwards = canvas.sendBackwards;
        const originalSendToBack = canvas.sendToBack;

        canvas.bringToFront = function(obj) {
            if (obj && obj.layerLocked) {
                showToast('⚠️ Layer order is locked');
                return;
            }
            return originalBringToFront.call(this, obj);
        };

        canvas.bringForward = function(obj) {
            if (obj && obj.layerLocked) {
                showToast('⚠️ Layer order is locked');
                return;
            }
            return originalBringForward.call(this, obj);
        };

        canvas.sendBackwards = function(obj) {
            if (obj && obj.layerLocked) {
                showToast('⚠️ Layer order is locked');
                return;
            }
            return originalSendBackwards.call(this, obj);
        };

        canvas.sendToBack = function(obj) {
            if (obj && obj.layerLocked) {
                showToast('⚠️ Layer order is locked');
                return;
            }
            return originalSendToBack.call(this, obj);
        };

        // Update lock button when selection changes
        canvas.on('selection:created', updateLockButton);
        canvas.on('selection:updated', updateLockButton);
        canvas.on('selection:cleared', () => {
            const lockBtn = document.getElementById('lockBtn');
            if (lockBtn) {
                const icon = lockBtn.querySelector('i');
                if (icon) icon.className = 'fas fa-lock-open';
            }
        });

        function updateLockButton() {
            const o = canvas.getActiveObject();
            const lockBtn = document.getElementById('lockBtn');
            if (o && lockBtn) {
                const icon = lockBtn.querySelector('i');
                if (icon) {
                    const isLocked = o.layerLocked || false;
                    icon.className = isLocked ? 'fas fa-lock' : 'fas fa-lock-open';
                }
            }
        }

        function saveState() {
            if (historyStep < history.length - 1) history = history.slice(0, historyStep + 1);
            history.push(JSON.stringify(canvas.toJSON()));
            if (++historyStep >= 50) { history.shift(); historyStep--; }
        }

        function undo() {
            if (historyStep > 0) {
                canvas.loadFromJSON(history[--historyStep], () => canvas.renderAll());
                showToast('↶ Undone');
            }
        }

        function redo() {
            if (historyStep < history.length - 1) {
                canvas.loadFromJSON(history[++historyStep], () => canvas.renderAll());
                showToast('↷ Redone');
            }
        }

        function toggleSnap() {
            snapEnabled = !snapEnabled;
            document.getElementById('snapToggle').classList.toggle('active', snapEnabled);
            const mobileBtnSnap = document.getElementById('snapToggleMobile');
            if (mobileBtnSnap) mobileBtnSnap.classList.toggle('active', snapEnabled);
            showToast(snapEnabled ? '✓ Align ON' : 'Align OFF');
        }

        function toggleSnapMobile() {
            snapEnabled = !snapEnabled;
            document.getElementById('snapToggleMobile').classList.toggle('active', snapEnabled);
            const desktopBtn = document.getElementById('snapToggle');
            if (desktopBtn) desktopBtn.classList.toggle('active', snapEnabled);
            showToast(snapEnabled ? '✓ Align ON' : 'Align OFF');
        }

        function toggleDrawMobile() {
            drawingMode = !drawingMode;
            canvas.isDrawingMode = drawingMode;
            document.getElementById('drawToggleMobile').classList.toggle('active', drawingMode);
            const desktopBtn = document.getElementById('drawToggle');
            if (desktopBtn) desktopBtn.classList.toggle('active', drawingMode);
            
            if (drawingMode) {
                canvas.freeDrawingBrush.color = drawPickrMobile ? drawPickrMobile.getColor().toHEXA().toString() : '#000000';
                canvas.freeDrawingBrush.width = parseInt(document.getElementById('brushSizeMobile').value) || 5;
                showToast('✓ Draw mode ON');
                toggleMobileToolbar();
                toggleMobileMenu();
            } else {
                showToast('Draw mode OFF');
            }
        }

        function toggleMobileToolbar() {
            const popup = document.getElementById('mobileToolbarPopup');
            popup.classList.toggle('show');
        }

        // 点击其他地方关闭移动工具栏
        document.addEventListener('click', (e) => {
            const popup = document.getElementById('mobileToolbarPopup');
            const fab = document.querySelector('.sidebar-fab');
            if (popup && fab && !popup.contains(e.target) && !fab.contains(e.target)) {
                popup.classList.remove('show');
            }
        });

        function deleteSelected() {
            const objs = canvas.getActiveObjects();
            if (objs.length) {
                objs.forEach(o => canvas.remove(o));
                canvas.discardActiveObject();
                canvas.renderAll();
                saveState();
                showToast('✓ Deleted');
                if (!canvas.getObjects().length) showEmptyState();
            }
        }

        function clearAll() {
            if (canvas.getObjects().length && confirm('Clear canvas?')) {
                canvas.clear();
                canvas.backgroundColor = currentTheme === 'light' ? '#ffffff' : '#1f1f1f';
                canvas.renderAll();
                history = [];
                historyStep = -1;
                saveState();
                showEmptyState();
                showToast('✓ Cleared');
            }
        }

        // Center selected object or reset view to home position with smooth animation
        function centerSelected() {
            const activeObj = canvas.getActiveObject();
            if (activeObj) {
                // Center the selected object in viewport with smooth animation
                const objCenter = activeObj.getCenterPoint();
                const viewportCenter = {
                    x: canvasWidth / 2,
                    y: canvasHeight / 2
                };
                
                // Calculate the offset needed
                const vpt = canvas.viewportTransform;
                const currentZoom = canvas.getZoom();
                const targetX = viewportCenter.x - objCenter.x * currentZoom;
                const targetY = viewportCenter.y - objCenter.y * currentZoom;
                
                // Animate viewport transform
                animateViewport(vpt[4], vpt[5], targetX, targetY, 300);
                showToast('⊙ Centered in view');
            } else if (canvas.getObjects().length > 0) {
                // Reset view to home position (0,0) with zoom reset and smooth animation
                const vpt = canvas.viewportTransform;
                const currentZoom = canvas.getZoom();
                
                // Animate back to origin
                animateViewportWithZoom(vpt[4], vpt[5], currentZoom, 0, 0, 1, 400);
                showToast('⊙ View reset to home');
            }
        }
        
        // Smooth viewport animation
        function animateViewport(startX, startY, endX, endY, duration) {
            const startTime = Date.now();
            const vpt = canvas.viewportTransform;
            
            function animate() {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function (ease-out-cubic)
                const eased = 1 - Math.pow(1 - progress, 3);
                
                vpt[4] = startX + (endX - startX) * eased;
                vpt[5] = startY + (endY - startY) * eased;
                
                canvas.requestRenderAll();
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            }
            
            animate();
        }
        
        // Smooth viewport animation with zoom
        function animateViewportWithZoom(startX, startY, startZoom, endX, endY, endZoom, duration) {
            const startTime = Date.now();
            const vpt = canvas.viewportTransform;
            
            function animate() {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function (ease-out-cubic)
                const eased = 1 - Math.pow(1 - progress, 3);
                
                vpt[4] = startX + (endX - startX) * eased;
                vpt[5] = startY + (endY - startY) * eased;
                
                const newZoom = startZoom + (endZoom - startZoom) * eased;
                canvas.setZoom(newZoom);
                currentZoom = newZoom;
                document.getElementById('zoomLevel').textContent = Math.round(newZoom * 100) + '%';
                
                canvas.requestRenderAll();
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            }
            
            animate();
        }

        document.addEventListener('keydown', (e) => {
            // C key - Center selected object
            if (e.key === 'c' || e.key === 'C') {
                const activeObj = canvas.getActiveObject();
                if (activeObj && !activeObj.isEditing) {
                    centerSelected();
                    e.preventDefault();
                    return;
                }
            }
            // 空格键按下 - 启用画板拖动模式
            if (e.code === 'Space' && !isSpacePressed) {
                // 检查是否正在编辑文本，如果是则不启用拖动
                const activeObj = canvas.getActiveObject();
                if (activeObj && activeObj.isEditing) {
                    return;
                }
                
                e.preventDefault();
                isSpacePressed = true;
                canvas.defaultCursor = 'grab';
                canvas.hoverCursor = 'grab';
                canvas.selection = false; // 禁用选择框
                
                // 如果有选中的对象，临时取消选中
                if (activeObj) {
                    canvas.discardActiveObject();
                    canvas.renderAll();
                }
                return;
            }
            
            // 检查是否正在编辑文本
            const activeObj = canvas.getActiveObject();
            const isEditingText = activeObj && activeObj.isEditing;
            
            if (e.ctrlKey || e.metaKey) {
                const k = e.key.toLowerCase();
                if (k === 'z') { e.preventDefault(); undo(); }
                else if (k === 'y') { e.preventDefault(); redo(); }
                else if (k === '=' || k === '+') { e.preventDefault(); zoomIn(); }
                else if (k === '-') { e.preventDefault(); zoomOut(); }
                else if (k === '0') { e.preventDefault(); resetZoom(); }
                else if (k === ']') { 
                    e.preventDefault(); 
                    if (e.shiftKey) bringForward(); 
                    else bringToFront(); 
                }
                else if (k === '[') { 
                    e.preventDefault(); 
                    if (e.shiftKey) sendBackwards(); 
                    else sendToBack(); 
                }
                else if (k === 'd') {
                    e.preventDefault();
                    const obj = canvas.getActiveObject();
                    if (obj) {
                        obj.clone((cloned) => {
                            cloned.set({
                                left: cloned.left + 20,
                                top: cloned.top + 20
                            });
                            canvas.add(cloned);
                            canvas.setActiveObject(cloned);
                            canvas.renderAll();
                            saveState();
                            showToast('✓ Duplicated');
                        });
                    }
                }
                else if (k === 'a') {
                    e.preventDefault();
                    canvas.discardActiveObject();
                    const sel = new fabric.ActiveSelection(canvas.getObjects(), {
                        canvas: canvas
                    });
                    canvas.setActiveObject(sel);
                    canvas.requestRenderAll();
                }
            } else if (!isEditingText) {
                // 只在非文本编辑模式下响应单键快捷键
                const k = e.key.toLowerCase();
                if (k === 't') { e.preventDefault(); addText(); }
                else if (k === 'k') { e.preventDefault(); toggleCrop(); }
                else if (e.key === 'Enter' && cropMode) { e.preventDefault(); confirmCrop(); }
                else if (e.key === 'Escape' && cropMode) { e.preventDefault(); cancelCrop(); }
                else if (e.key === 'Delete' || e.key === 'Backspace') {
                    const o = canvas.getActiveObject();
                    if (o && !o.type.includes('text')) { e.preventDefault(); deleteSelected(); }
                    else if (o?.type.includes('text') && !o.isEditing) { e.preventDefault(); deleteSelected(); }
                }
            } else if (e.key === 'Delete' || e.key === 'Backspace') {
                // 文本编辑模式下，只处理删除非文本对象的情况
                const o = canvas.getActiveObject();
                if (o && !o.type.includes('text')) { e.preventDefault(); deleteSelected(); }
                else if (o?.type.includes('text') && !o.isEditing) { e.preventDefault(); deleteSelected(); }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            // 空格键释放 - 退出画板拖动模式
            if (e.code === 'Space') {
                isSpacePressed = false;
                isPanning = false;
                canvas.defaultCursor = 'default';
                canvas.hoverCursor = 'move';
                canvas.selection = true; // 恢复选择框
                // 恢复所有对象的可选择性
                canvas.forEachObject(function(obj) {
                    obj.set('evented', true);
                });
                canvas.renderAll();
            }
        });
        
        // 鼠标按下 - 开始拖动画板
        canvas.on('mouse:down', function(opt) {
            const evt = opt.e;
            if (isSpacePressed) {
                isPanning = true;
                canvas.defaultCursor = 'grabbing';
                canvas.hoverCursor = 'grabbing';
                lastPosX = evt.clientX;
                lastPosY = evt.clientY;
            }
        });
        
        // 鼠标移动 - 拖动画板
        canvas.on('mouse:move', function(opt) {
            if (isPanning && isSpacePressed) {
                const evt = opt.e;
                const vpt = canvas.viewportTransform;
                vpt[4] += evt.clientX - lastPosX;
                vpt[5] += evt.clientY - lastPosY;
                canvas.requestRenderAll();
                lastPosX = evt.clientX;
                lastPosY = evt.clientY;
            }
        });
        
        // 鼠标释放 - 停止拖动画板和清除对齐线
        canvas.on('mouse:up', function() {
            if (isPanning) {
                isPanning = false;
                if (isSpacePressed) {
                    canvas.defaultCursor = 'grab';
                    canvas.hoverCursor = 'grab';
                }
            }
            clearGuides(); 
            if (rotationLabel) { rotationLabel.remove(); rotationLabel = null; }
        });
        
        // 空格键 + 鼠标滚轮缩放画布
        canvas.on('mouse:wheel', function(opt) {
            if (isSpacePressed) {
                opt.e.preventDefault();
                opt.e.stopPropagation();
                
                const delta = opt.e.deltaY;
                let zoom = canvas.getZoom();
                
                // 缩放步长 5%
                if (delta < 0) {
                    zoom = Math.min(zoom + 0.05, 3);
                } else {
                    zoom = Math.max(zoom - 0.05, 0.1);
                }
                
                // 以鼠标位置为中心缩放
                const pointer = canvas.getPointer(opt.e, true);
                const point = new fabric.Point(pointer.x, pointer.y);
                
                canvas.zoomToPoint(point, zoom);
                currentZoom = zoom;
                document.getElementById('zoomLevel').textContent = Math.round(zoom * 100) + '%';
                
                // 显示缩放提示
                const t = document.getElementById('zoomToast');
                t.textContent = Math.round(zoom * 100) + '%';
                t.classList.add('show');
                setTimeout(() => t.classList.remove('show'), 800);
            }
        });

        function setAsBackground() {
            const o = canvas.getActiveObject();
            if (!o || o.type !== 'image') return showToast('Select an image first');
            fabric.Image.fromURL(o.getElement().src, (img) => {
                canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
                    scaleX: canvasWidth / img.width,
                    scaleY: canvasHeight / img.height
                });
                canvas.remove(o);
                canvas.renderAll();
                saveState();
                closeAllDrawers();
                showToast('✓ Set as background');
            });
        }

        function saveImage(format = 'png') {
            const link = document.createElement('a');
            const timestamp = Date.now();
            
            if (format === 'jpg' || format === 'jpeg') {
                link.download = 'screenshot_' + timestamp + '.jpg';
                link.href = canvas.toDataURL({ format: 'jpeg', quality: 0.9, multiplier: 2 });
            } else {
                link.download = 'screenshot_' + timestamp + '.png';
                link.href = canvas.toDataURL({ format: 'png', quality: 1, multiplier: 2 });
            }
            
            link.click();
            showToast('✓ Saved');
        }

        function downloadPDF() {
            try {
                const { jsPDF } = window.jspdf;
                
                let imgData, pdfWidth, pdfHeight;
                
                if (downloadExportMode === 'smart') {
                    // 智能裁剪模式
                    const bounds = getContentBounds();
                    if (bounds) {
                        imgData = getSmartCropDataURL('png', 1);
                        pdfWidth = bounds.width;
                        pdfHeight = bounds.height;
                    } else {
                        imgData = canvas.toDataURL({ format: 'png', quality: 1, multiplier: 2 });
                        pdfWidth = canvas.width;
                        pdfHeight = canvas.height;
                    }
                } else {
                    // 完整画布模式
                    imgData = canvas.toDataURL({ format: 'png', quality: 1, multiplier: 2 });
                    pdfWidth = canvas.width;
                    pdfHeight = canvas.height;
                }
                
                // 转换为毫米（假设 96 DPI）
                const mmPerPx = 25.4 / 96;
                const widthMm = pdfWidth * mmPerPx;
                const heightMm = pdfHeight * mmPerPx;
                
                // 创建 PDF（横向或纵向取决于画布比例）
                const orientation = pdfWidth > pdfHeight ? 'landscape' : 'portrait';
                const pdf = new jsPDF({
                    orientation: orientation,
                    unit: 'mm',
                    format: [widthMm, heightMm]
                });
                
                // 添加图片到 PDF
                pdf.addImage(imgData, 'PNG', 0, 0, widthMm, heightMm);
                
                // 下载 PDF
                const filename = downloadExportMode === 'smart' ? 'screenshot_smart_' : 'screenshot_';
                pdf.save(filename + Date.now() + '.pdf');
                
                closeDownloadModal();
                showToast(downloadExportMode === 'smart' ? '✓ Smart PDF saved' : '✓ PDF saved');
            } catch (error) {
                console.error('PDF export error:', error);
                showToast('❌ PDF export failed');
            }
        }

        function shareImage() {
            document.getElementById('shareModal').classList.add('show');
        }

        function closeShareModal() {
            document.getElementById('shareModal').classList.remove('show');
        }

        function openDownloadModal() {
            document.getElementById('downloadModal').classList.add('show');
        }

        function closeDownloadModal() {
            document.getElementById('downloadModal').classList.remove('show');
        }

        // 图标分类数据
        const iconCategories = {
            popular: ['heart', 'star', 'check-circle', 'times-circle', 'thumbs-up', 'smile', 'fire', 'bolt', 'crown', 'gem', 'trophy', 'medal', 'award', 'gift', 'rocket', 'lightbulb'],
            business: ['briefcase', 'chart-line', 'chart-bar', 'chart-pie', 'dollar-sign', 'euro-sign', 'yen-sign', 'credit-card', 'wallet', 'receipt', 'calculator', 'balance-scale', 'handshake', 'building', 'store', 'industry'],
            social: ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'github', 'whatsapp', 'telegram', 'discord', 'reddit', 'pinterest', 'tiktok', 'snapchat', 'wechat', 'qq', 'weibo'],
            arrows: ['arrow-right', 'arrow-left', 'arrow-up', 'arrow-down', 'arrow-circle-right', 'arrow-circle-left', 'arrow-circle-up', 'arrow-circle-down', 'long-arrow-alt-right', 'long-arrow-alt-left', 'angle-right', 'angle-left', 'angle-double-right', 'angle-double-left', 'chevron-right', 'chevron-left'],
            shapes: ['square', 'circle', 'triangle', 'hexagon', 'star', 'heart', 'diamond', 'shield', 'bookmark', 'flag', 'tag', 'certificate', 'cube', 'box', 'layer-group', 'shapes']
        };

        // 图标相关变量 - 使用 AppState
        let currentIconCategory = AppState.currentIconCategory;
        let iconSearchTimeout = AppState.iconSearchTimeout;
        let currentIconColor = AppState.currentIconColor;
        let iconPickr = AppState.iconPickr;

        function openIconsModal() {
            document.getElementById('iconsModal').classList.add('show');
            loadIconCategory('popular');
            
            // 初始化图标颜色选择器
            setTimeout(() => {
                if (!iconPickr && document.getElementById('iconColorPicker')) {
                    iconPickr = Pickr.create({
                        el: '#iconColorPicker',
                        theme: 'nano',
                        default: currentIconColor,
                        components: { preview: true, opacity: true, hue: true, interaction: { hex: true, input: true, save: true } }
                    });
                    iconPickr.on('save', (c) => {
                        if (c) {
                            currentIconColor = c.toHEXA().toString();
                        }
                        iconPickr.hide();
                    });
                } else if (iconPickr) {
                    iconPickr.setColor(currentIconColor);
                }
            }, 100);
        }

        function closeIconsModal() {
            document.getElementById('iconsModal').classList.remove('show');
        }

        function loadIconCategory(category, clickedButton) {
            currentIconCategory = category;
            const icons = iconCategories[category] || iconCategories.popular;
            
            // 更新分类按钮状态
            document.querySelectorAll('.icon-category-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.textContent.toLowerCase() === category.toLowerCase() || 
                    (category === 'popular' && btn.textContent === 'Popular')) {
                    btn.classList.add('active');
                }
            });
            
            displayIcons(icons);
        }

        function searchIcons(query) {
            clearTimeout(iconSearchTimeout);
            
            if (!query || query.trim() === '') {
                loadIconCategory(currentIconCategory);
                return;
            }
            
            iconSearchTimeout = setTimeout(() => {
                const grid = document.getElementById('iconsGrid');
                grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 20px; color: var(--text-secondary);"><i class="fas fa-spinner fa-spin"></i> Searching...</div>';
                
                // 在所有分类中搜索
                const allIcons = Object.values(iconCategories).flat();
                const filtered = allIcons.filter(icon => icon.toLowerCase().includes(query.toLowerCase()));
                
                if (filtered.length > 0) {
                    displayIcons(filtered.slice(0, 48)); // 限制显示48个
                } else {
                    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary);"><i class="fas fa-search" style="font-size: 32px; margin-bottom: 12px; opacity: 0.5;"></i><p>No icons found for "' + query + '"</p></div>';
                }
            }, 300);
        }

        function displayIcons(icons) {
            const grid = document.getElementById('iconsGrid');
            grid.innerHTML = '';
            
            const socialIcons = iconCategories.social || [];
            
            icons.forEach(iconName => {
                const btn = document.createElement('button');
                btn.className = 'icon-grid-item';
                // 社交媒体图标使用 fab，其他使用 fas
                const iconClass = socialIcons.includes(iconName) ? 'fab' : 'fas';
                btn.innerHTML = `<i class="${iconClass} fa-${iconName}"></i>`;
                btn.title = iconName;
                btn.onclick = () => addIconToCanvas(iconName);
                grid.appendChild(btn);
            });
        }

        function addIconToCanvas(iconName) {
            const iconUnicode = getFontAwesomeUnicode(iconName);
            
            // 判断是否为社交媒体图标（使用品牌字体）
            const socialIcons = iconCategories.social || [];
            const isBrandIcon = socialIcons.includes(iconName);
            
            // Get icon size from slider
            const sizeSlider = document.getElementById('iconSizeSlider');
            const iconSize = sizeSlider ? parseInt(sizeSlider.value) : 60;
            
            const text = new fabric.Text(iconUnicode, {
                left: canvasWidth / 2,
                top: canvasHeight / 2,
                originX: 'center',
                originY: 'center',
                fontFamily: isBrandIcon ? 'Font Awesome 6 Brands' : 'Font Awesome 6 Free',
                fontWeight: isBrandIcon ? 400 : 900,
                fontSize: iconSize,
                fill: currentIconColor,
                cornerColor: '#0066cc',
                cornerStyle: 'circle',
                borderColor: '#0066cc',
                cornerSize: 10,
                transparentCorners: false
            });
            
            canvas.add(text);
            canvas.setActiveObject(text);
            canvas.renderAll();
            hideEmptyState();
            saveState();
            closeIconsModal();
            showToast('✓ Icon added');
        }

        function getFontAwesomeUnicode(iconName) {
            // Font Awesome 常用图标的 Unicode 映射（扩展版）
            const unicodeMap = {
                // 基础图标
                'heart': '\uf004', 'star': '\uf005', 'check': '\uf00c', 'times': '\uf00d', 'check-circle': '\uf058', 'times-circle': '\uf057',
                'plus': '\uf067', 'minus': '\uf068', 'plus-circle': '\uf055', 'minus-circle': '\uf056',
                'thumbs-up': '\uf164', 'thumbs-down': '\uf165', 'smile': '\uf118', 'frown': '\uf119', 'meh': '\uf11a',
                'fire': '\uf06d', 'bolt': '\uf0e7', 'crown': '\uf521', 'gem': '\uf3a5', 'trophy': '\uf091', 'medal': '\uf5a2', 'award': '\uf559', 'gift': '\uf06b',
                'rocket': '\uf135', 'lightbulb': '\uf0eb', 'magic': '\uf0d0', 'wand-magic': '\uf0d0',
                
                // 箭头
                'arrow-right': '\uf061', 'arrow-left': '\uf060', 'arrow-up': '\uf062', 'arrow-down': '\uf063',
                'arrow-circle-right': '\uf0a9', 'arrow-circle-left': '\uf0a8', 'arrow-circle-up': '\uf0aa', 'arrow-circle-down': '\uf0ab',
                'long-arrow-alt-right': '\uf30b', 'long-arrow-alt-left': '\uf30a', 'angle-right': '\uf105', 'angle-left': '\uf104',
                'angle-double-right': '\uf101', 'angle-double-left': '\uf100', 'chevron-right': '\uf054', 'chevron-left': '\uf053',
                
                // 商务
                'briefcase': '\uf0b1', 'chart-line': '\uf201', 'chart-bar': '\uf080', 'chart-pie': '\uf200',
                'dollar-sign': '\uf155', 'euro-sign': '\uf153', 'yen-sign': '\uf157', 'credit-card': '\uf09d',
                'wallet': '\uf555', 'receipt': '\uf543', 'calculator': '\uf1ec', 'balance-scale': '\uf24e',
                'handshake': '\uf2b5', 'building': '\uf1ad', 'store': '\uf54e', 'industry': '\uf275',
                
                // 社交媒体 (使用品牌图标)
                'facebook': '\uf09a', 'twitter': '\uf099', 'instagram': '\uf16d', 'linkedin': '\uf0e1',
                'youtube': '\uf167', 'github': '\uf09b', 'whatsapp': '\uf232', 'telegram': '\uf2c6',
                'discord': '\uf392', 'reddit': '\uf1a1', 'pinterest': '\uf0d2', 'tiktok': '\ue07b',
                'snapchat': '\uf2ab', 'wechat': '\uf1d7', 'qq': '\uf1d6', 'weibo': '\uf18a',
                
                // 形状
                'square': '\uf0c8', 'circle': '\uf111', 'triangle': '\uf2ec', 'hexagon': '\uf312',
                'diamond': '\uf219', 'shield': '\uf132', 'bookmark': '\uf02e', 'flag': '\uf024',
                'tag': '\uf02b', 'certificate': '\uf0a3', 'cube': '\uf1b2', 'box': '\uf466',
                'layer-group': '\uf5fd', 'shapes': '\uf61f',
                
                // 常用
                'home': '\uf015', 'user': '\uf007', 'search': '\uf002', 'envelope': '\uf0e0',
                'phone': '\uf095', 'camera': '\uf030', 'image': '\uf03e', 'video': '\uf03d',
                'music': '\uf001', 'file': '\uf15b', 'folder': '\uf07b', 'download': '\uf019',
                'upload': '\uf093', 'cloud': '\uf0c2', 'wifi': '\uf1eb', 'bluetooth': '\uf293',
                'battery-full': '\uf240', 'signal': '\uf012', 'lock': '\uf023', 'unlock': '\uf09c',
                'bell': '\uf0f3', 'calendar': '\uf133', 'clock': '\uf017', 'map-marker-alt': '\uf3c5',
                'shopping-cart': '\uf07a', 'comment': '\uf075', 'share': '\uf064', 'link': '\uf0c1',
                'paperclip': '\uf0c6', 'trash': '\uf1f8', 'edit': '\uf044', 'save': '\uf0c7',
                'print': '\uf02f', 'cog': '\uf013', 'wrench': '\uf0ad', 'sun': '\uf185',
                'moon': '\uf186', 'cloud-sun': '\uf6c4', 'snowflake': '\uf2dc', 'umbrella': '\uf0e9', 'coffee': '\uf0f4'
            };
            return unicodeMap[iconName] || '\uf005'; // 默认返回星星
        }

        // 设置分享导出模式
        function setShareMode(mode) {
            shareExportMode = mode;
            document.getElementById('shareModeFull').classList.toggle('active', mode === 'full');
            document.getElementById('shareModeSmart').classList.toggle('active', mode === 'smart');
        }
        
        // 设置下载导出模式
        function setDownloadMode(mode) {
            downloadExportMode = mode;
            document.getElementById('downloadModeFull').classList.toggle('active', mode === 'full');
            document.getElementById('downloadModeSmart').classList.toggle('active', mode === 'smart');
        }
        
        // 计算画布中有内容的边界区域（包括所有对象类型）
        function getContentBounds() {
            const objects = canvas.getObjects();
            if (objects.length === 0) {
                return null;
            }
            
            let minX = Infinity, minY = Infinity;
            let maxX = -Infinity, maxY = -Infinity;
            
            objects.forEach(obj => {
                // 跳过辅助对象（如裁剪遮罩等）
                if (obj.excludeFromExport) return;
                
                // 使用对象的 aCoords（绝对坐标）来计算边界
                obj.setCoords();
                const coords = obj.aCoords;
                
                if (coords) {
                    // 获取四个角的坐标
                    const points = [coords.tl, coords.tr, coords.br, coords.bl];
                    
                    points.forEach(point => {
                        minX = Math.min(minX, point.x);
                        minY = Math.min(minY, point.y);
                        maxX = Math.max(maxX, point.x);
                        maxY = Math.max(maxY, point.y);
                    });
                    
                    // 对于有描边的对象，需要考虑描边宽度
                    if (obj.stroke && obj.strokeWidth) {
                        const strokeOffset = obj.strokeWidth / 2;
                        minX -= strokeOffset;
                        minY -= strokeOffset;
                        maxX += strokeOffset;
                        maxY += strokeOffset;
                    }
                }
            });
            
            // 检查是否找到有效边界
            if (minX === Infinity || minY === Infinity || maxX === -Infinity || maxY === -Infinity) {
                return null;
            }
            
            // 添加边距（保留内容周围的空白空间）
            const padding = 10;
            minX = minX - padding;
            minY = minY - padding;
            maxX = maxX + padding;
            maxY = maxY + padding;
            
            // 确保宽高至少为1像素
            const width = Math.max(1, maxX - minX);
            const height = Math.max(1, maxY - minY);
            
            return {
                left: minX,
                top: minY,
                width: width,
                height: height
            };
        }
        
        // 智能裁剪导出 - 使用临时画布方法
        function getSmartCropDataURL(format = 'png', quality = 1) {
            // 保存当前视口变换
            const originalVpt = canvas.viewportTransform.slice();
            
            // 重置视口
            canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
            canvas.renderAll();
            
            const bounds = getContentBounds();
            if (!bounds) {
                canvas.setViewportTransform(originalVpt);
                canvas.renderAll();
                return canvas.toDataURL({ format: format, quality: quality, multiplier: 2 });
            }
            
            const multiplier = 2;
            
            // 创建临时画布，大小为内容边界
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = bounds.width * multiplier;
            tempCanvas.height = bounds.height * multiplier;
            const ctx = tempCanvas.getContext('2d');
            
            // 设置背景色
            if (canvas.backgroundColor) {
                ctx.fillStyle = canvas.backgroundColor;
                ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            }
            
            // 设置变换：将内容移动到临时画布的原点
            ctx.scale(multiplier, multiplier);
            ctx.translate(-bounds.left, -bounds.top);
            
            // 遍历所有对象并绘制
            const objects = canvas.getObjects();
            objects.forEach(obj => {
                if (obj.excludeFromExport) return;
                obj.render(ctx);
            });
            
            // 恢复视口
            canvas.setViewportTransform(originalVpt);
            canvas.renderAll();
            
            // 返回 dataURL
            if (format === 'jpeg' || format === 'jpg') {
                return tempCanvas.toDataURL('image/jpeg', quality);
            }
            return tempCanvas.toDataURL('image/png');
        }
        
        // 智能裁剪导出为 Blob
        function getSmartCropBlob(callback) {
            // 保存当前视口变换
            const originalVpt = canvas.viewportTransform.slice();
            
            // 重置视口
            canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
            canvas.renderAll();
            
            const bounds = getContentBounds();
            
            if (!bounds) {
                canvas.setViewportTransform(originalVpt);
                canvas.renderAll();
                canvas.getElement().toBlob(callback);
                return;
            }
            
            const multiplier = 2;
            
            // 创建临时画布，大小为内容边界
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = bounds.width * multiplier;
            tempCanvas.height = bounds.height * multiplier;
            const ctx = tempCanvas.getContext('2d');
            
            // 设置背景色
            if (canvas.backgroundColor) {
                ctx.fillStyle = canvas.backgroundColor;
                ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            }
            
            // 设置变换：将内容移动到临时画布的原点
            ctx.scale(multiplier, multiplier);
            ctx.translate(-bounds.left, -bounds.top);
            
            // 遍历所有对象并绘制
            const objects = canvas.getObjects();
            objects.forEach(obj => {
                if (obj.excludeFromExport) return;
                obj.render(ctx);
            });
            
            // 恢复视口
            canvas.setViewportTransform(originalVpt);
            canvas.renderAll();
            
            // 返回 Blob
            tempCanvas.toBlob(callback, 'image/png');
        }

        function copyToClipboard() {
            if (shareExportMode === 'smart') {
                getSmartCropBlob((blob) => {
                    navigator.clipboard.write([new ClipboardItem({'image/png': blob})])
                        .then(() => { showToast('✓ Smart copied'); closeShareModal(); })
                        .catch(() => showToast('❌ Failed'));
                });
            } else {
                canvas.getElement().toBlob((blob) => {
                    navigator.clipboard.write([new ClipboardItem({'image/png': blob})])
                        .then(() => { showToast('✓ Copied'); closeShareModal(); })
                        .catch(() => showToast('❌ Failed'));
                });
            }
        }

        function downloadImage(format = 'png') {
            if (downloadExportMode === 'smart') {
                saveImageSmart(format);
            } else {
                saveImage(format);
            }
            closeDownloadModal();
        }
        
        // 智能裁剪保存图片
        function saveImageSmart(format = 'png') {
            const link = document.createElement('a');
            const timestamp = Date.now();
            
            if (format === 'jpg' || format === 'jpeg') {
                link.download = 'screenshot_smart_' + timestamp + '.jpg';
                link.href = getSmartCropDataURL('jpeg', 0.9);
            } else {
                link.download = 'screenshot_smart_' + timestamp + '.png';
                link.href = getSmartCropDataURL('png', 1);
            }
            
            link.click();
            showToast('✓ Smart saved');
        }

        function hideEmptyState() {
            document.getElementById('emptyState').style.display = 'none';
        }

        function showEmptyState() {
            if (!canvas.getObjects().length) {
                document.getElementById('emptyState').style.display = 'block';
            }
        }

        function showToast(msg) {
            const t = document.getElementById('toast');
            t.textContent = msg;
            t.classList.add('show');
            setTimeout(() => t.classList.remove('show'), 2000);
        }

        // 收藏提示功能（漫画对话框）
        function toggleBookmarkTip() {
            const tip = document.getElementById('bookmarkTip');
            tip.classList.toggle('show');
        }

        function closeBookmarkTip() {
            const tip = document.getElementById('bookmarkTip');
            tip.classList.remove('show');
            // 保存关闭状态，不再显示
            localStorage.setItem('bookmarkTipClosed', 'true');
        }

        // 设置模态对话框功能
        function openSettingsModal(settingsType) {
            const modal = document.getElementById('settingsModal');
            const modalBody = document.getElementById('settingsModalBody');
            
            // 根据设置类型加载不同的内容
            let content = '';
            let title = '';
            
            switch(settingsType) {
                case 'background':
                    title = I18n.t('bgSettings') || 'Background Settings';
                    content = `
                        <h2 class="settings-modal-title">${title}</h2>
                        <div class="settings-group">
                            <label class="settings-label">Background Type</label>
                            <div class="icon-btn-group">
                                <button class="icon-btn" onclick="setBgTransparent(); closeSettingsModal();" title="Transparent">
                                    <i class="fas fa-border-none"></i>
                                </button>
                                <button class="icon-btn bg-color-btn" onclick="openBgColorPicker()" title="Color">
                                    <div class="pickr" id="bgColorPickerModal"></div>
                                </button>
                            </div>
                        </div>
                    `;
                    break;
                    
                case 'shape':
                    title = I18n.t('shapeSettings') || 'Shape Settings';
                    content = `
                        <h2 class="settings-modal-title">${title}</h2>
                        <div class="settings-group">
                            <label class="settings-label">Add Shape</label>
                            <div class="icon-btn-group">
                                <button class="icon-btn" onclick="addRectangle(); closeSettingsModal();" title="Rectangle">
                                    <i class="fas fa-square"></i>
                                </button>
                                <button class="icon-btn" onclick="addCircle(); closeSettingsModal();" title="Circle">
                                    <i class="fas fa-circle"></i>
                                </button>
                                <button class="icon-btn" onclick="addLine(); closeSettingsModal();" title="Line">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <button class="icon-btn" onclick="addArrow(); closeSettingsModal();" title="Arrow">
                                    <i class="fas fa-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                        <div class="settings-group">
                            <label class="settings-label">Color</label>
                            <div id="shapeColorPickerModal"></div>
                        </div>
                    `;
                    break;
                    
                case 'draw':
                    title = I18n.t('drawSettings') || 'Draw Settings';
                    content = `
                        <h2 class="settings-modal-title">${title}</h2>
                        <div class="settings-group">
                            <label class="settings-label">Brush Color</label>
                            <div id="drawColorPickerModal"></div>
                        </div>
                        <div class="settings-group">
                            <div class="slider-control">
                                <div class="slider-header">
                                    <span class="slider-icon"><i class="fas fa-paintbrush"></i> Brush Size</span>
                                    <span class="slider-value" id="brushSizeValueModal">5px</span>
                                </div>
                                <input type="range" id="brushSizeModal" min="1" max="50" value="5" onchange="updateBrushSize(this.value); document.getElementById('brushSizeValueModal').textContent = this.value + 'px';">
                            </div>
                        </div>
                    `;
                    break;
                    
                case 'text':
                    title = I18n.t('textSettings') || 'Text Settings';
                    content = `
                        <h2 class="settings-modal-title">${title}</h2>
                        <div class="settings-group">
                            <label class="settings-label">Font</label>
                            <div class="control-row">
                                <select id="fontFamilyModal" class="control-select" onchange="updateTextFont(this.value)" style="width: 100%;">
                                    <option value="Arial">Arial</option>
                                    <option value="Helvetica">Helvetica</option>
                                    <option value="Times New Roman">Times New Roman</option>
                                    <option value="Georgia">Georgia</option>
                                    <option value="Courier New">Courier New</option>
                                    <option value="Verdana">Verdana</option>
                                </select>
                            </div>
                        </div>
                        <div class="settings-group">
                            <label class="settings-label">Font Weight</label>
                            <div class="control-row">
                                <select id="fontWeightModal" class="control-select" onchange="updateTextWeight(this.value)" style="width: 100%;">
                                    <option value="normal">Normal</option>
                                    <option value="bold">Bold</option>
                                </select>
                            </div>
                        </div>
                        <div class="settings-group">
                            <label class="settings-label">Alignment</label>
                            <div class="icon-btn-group">
                                <button class="icon-btn" onclick="updateTextAlign('left')" title="Left">
                                    <i class="fas fa-align-left"></i>
                                </button>
                                <button class="icon-btn" onclick="updateTextAlign('center')" title="Center">
                                    <i class="fas fa-align-center"></i>
                                </button>
                                <button class="icon-btn" onclick="updateTextAlign('right')" title="Right">
                                    <i class="fas fa-align-right"></i>
                                </button>
                            </div>
                        </div>
                        <div class="settings-group">
                            <div class="slider-control">
                                <div class="slider-header">
                                    <span class="slider-icon"><i class="fas fa-text-height"></i> Line Height</span>
                                    <span class="slider-value" id="lineHeightValueModal">1.16</span>
                                </div>
                                <input type="range" id="lineHeightModal" min="0.8" max="2.5" step="0.1" value="1.16" onchange="updateLineHeight(this.value); document.getElementById('lineHeightValueModal').textContent = parseFloat(this.value).toFixed(2);">
                            </div>
                        </div>
                        <div class="settings-group">
                            <label class="settings-label">Color</label>
                            <div id="textColorPickerModal"></div>
                        </div>
                    `;
                    break;
                
                case 'bubble':
                    // 检查启动是否完成
                    if (!isBootstrapComplete()) {
                        showToast('Loading...');
                        return;
                    }
                    // 直接添加气泡到画布，不显示模态框
                    addSpeechBubble();
                    return;
                    
                case 'layout':
                    // 检查启动是否完成
                    if (!isBootstrapComplete() || !layoutTemplatesModule) {
                        showToast('Loading...');
                        return;
                    }
                    // 打开布局模态框
                    openLayoutModal();
                    return;
                    
                default:
                    return;
            }
            
            modalBody.innerHTML = content;
            
            // 先初始化颜色选择器，再显示模态框
            requestAnimationFrame(() => {
                if (settingsType === 'background' && typeof Pickr !== 'undefined') {
                    initBgColorPickerModal();
                } else if (settingsType === 'shape' && typeof Pickr !== 'undefined') {
                    initShapeColorPickerModal();
                } else if (settingsType === 'draw' && typeof Pickr !== 'undefined') {
                    initDrawColorPickerModal();
                } else if (settingsType === 'text' && typeof Pickr !== 'undefined') {
                    initTextColorPickerModal();
                }
                
                // 颜色选择器初始化后再显示模态框
                requestAnimationFrame(() => {
                    modal.classList.add('show');
                });
            });
        }

        function closeSettingsModal() {
            const modal = document.getElementById('settingsModal');
            modal.classList.remove('show');
        }

        // 模态对话框中的颜色选择器初始化
        let modalPickrs = {};
        
        function initBgColorPickerModal() {
            const el = document.getElementById('bgColorPickerModal');
            if (!el) return;
            if (modalPickrs.bg) modalPickrs.bg.destroyAndRemove();
            modalPickrs.bg = Pickr.create({
                el: '#bgColorPickerModal',
                theme: 'nano',
                default: '#ffffff',
                components: { preview: true, opacity: true, hue: true, interaction: { hex: true, input: true, save: true } }
            });
            modalPickrs.bg.on('save', (c) => {
                if (c) {
                    canvas.backgroundColor = c.toHEXA().toString();
                    canvas.renderAll();
                    showToast('✓ Background color updated');
                }
                modalPickrs.bg.hide();
            });
        }
        
        function initShapeColorPickerModal() {
            const el = document.getElementById('shapeColorPickerModal');
            if (!el) return;
            if (modalPickrs.shape) modalPickrs.shape.destroyAndRemove();
            modalPickrs.shape = Pickr.create({
                el: '#shapeColorPickerModal',
                theme: 'nano',
                default: currentShapeStroke,
                components: { preview: true, opacity: true, hue: true, interaction: { hex: true, input: true, save: true } }
            });
            // 实时更新颜色
            modalPickrs.shape.on('change', (c) => {
                if (c) {
                    const colorStr = c.toHEXA().toString();
                    currentShapeStroke = colorStr;
                    currentShapeColor = colorStr + '80';
                    const activeObj = canvas.getActiveObject();
                    if (activeObj && (activeObj.type === 'rect' || activeObj.type === 'circle' || activeObj.type === 'line' || activeObj.type === 'group')) {
                        if (activeObj.type === 'line') {
                            activeObj.set('stroke', currentShapeStroke);
                        } else if (activeObj.type === 'group') {
                            activeObj.forEachObject((obj) => {
                                if (obj.type === 'line') obj.set('stroke', currentShapeStroke);
                                else if (obj.type === 'triangle') obj.set('fill', currentShapeStroke);
                            });
                        } else {
                            activeObj.set({ fill: currentShapeColor, stroke: currentShapeStroke });
                        }
                        canvas.renderAll();
                    }
                }
            });
            modalPickrs.shape.on('save', (c) => {
                if (c) {
                    saveState();
                    showToast('✓ Shape color updated');
                }
                modalPickrs.shape.hide();
            });
        }
        
        function initDrawColorPickerModal() {
            const el = document.getElementById('drawColorPickerModal');
            if (!el) return;
            if (modalPickrs.draw) modalPickrs.draw.destroyAndRemove();
            modalPickrs.draw = Pickr.create({
                el: '#drawColorPickerModal',
                theme: 'nano',
                default: savedBrushSettings.color,
                components: { preview: true, opacity: true, hue: true, interaction: { hex: true, input: true, save: true } }
            });
            modalPickrs.draw.on('save', (c) => {
                if (c) {
                    const colorStr = c.toHEXA().toString();
                    savedBrushSettings.color = colorStr;
                    canvas.freeDrawingBrush.color = colorStr;
                    showToast('✓ Brush color updated');
                }
                modalPickrs.draw.hide();
            });
        }
        
        function initTextColorPickerModal() {
            const el = document.getElementById('textColorPickerModal');
            if (!el) return;
            if (modalPickrs.text) modalPickrs.text.destroyAndRemove();
            modalPickrs.text = Pickr.create({
                el: '#textColorPickerModal',
                theme: 'nano',
                default: savedTextSettings.fill,
                components: { preview: true, opacity: true, hue: true, interaction: { hex: true, input: true, save: true } }
            });
            modalPickrs.text.on('save', (c) => {
                if (c) {
                    const colorStr = c.toHEXA().toString();
                    savedTextSettings.fill = colorStr;
                    const activeObj = canvas.getActiveObject();
                    if (activeObj && activeObj.type.includes('text')) {
                        activeObj.set('fill', colorStr);
                        canvas.renderAll();
                        saveState();
                    }
                    showToast('✓ Text color updated');
                }
                modalPickrs.text.hide();
            });
        }

        // 图标颜色设置模态对话框
        function openIconColorModal(iconObj) {
            const modal = document.getElementById('settingsModal');
            const modalBody = document.getElementById('settingsModalBody');
            
            const title = I18n.t('icons') || 'Icon Settings';
            const content = `
                <h2 class="settings-modal-title">${title}</h2>
                <div class="settings-group">
                    <label class="settings-label">Icon Color</label>
                    <div id="iconColorPickerModal"></div>
                </div>
            `;
            
            modalBody.innerHTML = content;
            modal.classList.add('show');
            
            // 初始化颜色选择器
            setTimeout(() => {
                if (modalPickrs.icon) modalPickrs.icon.destroyAndRemove();
                modalPickrs.icon = Pickr.create({
                    el: '#iconColorPickerModal',
                    theme: 'nano',
                    default: iconObj.fill || '#667eea',
                    components: { preview: true, opacity: true, hue: true, interaction: { hex: true, input: true, save: true } }
                });
                modalPickrs.icon.on('save', (c) => {
                    if (c) {
                        iconObj.set('fill', c.toHEXA().toString());
                        canvas.renderAll();
                        saveState();
                        showToast('✓ Icon color updated');
                    }
                    modalPickrs.icon.hide();
                });
            }, 100);
        }

        // ESC键关闭模态对话框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeSettingsModal();
            }
        });

        // 初始化多语言
        async function initApp() {
            // 获取用户首选语言
            const preferredLang = I18n.getPreferredLanguage();
            currentLang = preferredLang;
            
            // 初始化 i18n
            await I18n.init(preferredLang);
            
            // 初始化完成
            saveState();
            showToast('Welcome 🎉');
            
            // 3秒后显示动漫风格收藏气泡
            setTimeout(() => {
                showBookmarkBubble();
            }, 3000);
        }
        
        // 显示动漫风格收藏气泡
        function showBookmarkBubble() {
            // 检查是否已经永久关闭
            if (localStorage.getItem('bookmarkBubbleClosed')) return;
            
            // 检查是否在移动端
            if (window.innerWidth <= 768) return;
            
            const bubble = document.getElementById('bookmarkBubble');
            if (!bubble) return;
            
            // 显示气泡
            bubble.style.display = 'block';
            
            // 设置焦点管理
            bubble.setAttribute('tabindex', '-1');
            
            // 10秒后自动关闭
            setTimeout(() => {
                closeBookmarkBubble();
            }, 10000);
        }
        
        function closeBookmarkBubble() {
            const bubble = document.getElementById('bookmarkBubble');
            if (!bubble) return;
            
            // 添加淡出动画
            bubble.style.animation = 'bubbleFadeIn 0.3s ease-out reverse';
            
            setTimeout(() => {
                bubble.style.display = 'none';
                // 保存到localStorage，不再显示
                localStorage.setItem('bookmarkBubbleClosed', 'true');
            }, 300);
        }
        
        // 键盘支持：ESC键关闭气泡
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const bubble = document.getElementById('bookmarkBubble');
                if (bubble && bubble.style.display !== 'none') {
                    closeBookmarkBubble();
                }
            }
        });
        
        // 辅助函数：重置气泡（用于测试）
        window.resetBookmarkBubble = function() {
            localStorage.removeItem('bookmarkBubbleClosed');
            console.log('Bookmark bubble reset. Reload page to see it again.');
        };

        // ==================== 布局模块初始化 ====================
        // 使用抽离的 layout 模块
        layoutContainersModule = initLayoutContainers(canvas,
            () => ({ width: canvasWidth, height: canvasHeight }),
            { saveState, hideEmptyState, showToast }
        );
        
        layoutTemplatesModule = initLayoutTemplates(canvas,
            () => ({ width: canvasWidth, height: canvasHeight }),
            { saveState, hideEmptyState, showToast }
        );
        
        // 暴露布局函数供全局调用
        function openLayoutModal() {
            if (!layoutTemplatesModule) {
                showToast('Loading...');
                return;
            }
            layoutTemplatesModule.openLayoutModal();
        }
        
        function closeLayoutModal() {
            layoutTemplatesModule.closeLayoutModal();
        }
        
        function applyCanvasPreset(width, height) {
            layoutTemplatesModule.applyCanvasPreset(width, height);
        }
        
        function insertLayoutStructure(type) {
            layoutTemplatesModule.insertLayoutStructure(type);
        }
        
        function insertTemplate(type) {
            layoutTemplatesModule.insertTemplate(type);
        }
        
        // 暴露容器函数到全局
        window.isLayoutDropZone = layoutContainersModule.isLayoutDropZone;
        window.findDropZoneAtPoint = layoutContainersModule.findDropZoneAtPoint;
        window.adoptIntoLayout = layoutContainersModule.adoptIntoLayout;
        window.releaseFromLayout = layoutContainersModule.releaseFromLayout;
        
        // 标记模块已就绪
        setBootstrapState('modulesReady', true);
        
        // ==================== 启动应用 ====================
        // DOM ready 后启动
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', finalizeBootstrap);
        } else {
            finalizeBootstrap();
        }
        
        function finalizeBootstrap() {
            setBootstrapState('domReady', true);
            
            // 启动 i18n
            if (typeof I18n !== 'undefined') {
                initApp();
            } else {
                saveState();
                showToast('Welcome 🎉');
            }
        }
        
        // ==================== 气泡功能 ====================
        
        function addSpeechBubble() {
            // 检查 fabric 是否已加载
            if (typeof fabric === 'undefined') {
                showToast('Loading...');
                return;
            }
            
            disableDrawMode();
            
            const bubbleWidth = 200;
            const bubbleHeight = 80;
            const tailSize = 20;
            const padding = 12;
            
            const bubblePath = new fabric.Path(
                'M 10 0 ' +
                'L ' + (bubbleWidth - 10) + ' 0 ' +
                'Q ' + bubbleWidth + ' 0 ' + bubbleWidth + ' 10 ' +
                'L ' + bubbleWidth + ' ' + (bubbleHeight - 10) + ' ' +
                'Q ' + bubbleWidth + ' ' + bubbleHeight + ' ' + (bubbleWidth - 10) + ' ' + bubbleHeight + ' ' +
                'L ' + (50 + tailSize) + ' ' + bubbleHeight + ' ' +
                'L 40 ' + (bubbleHeight + tailSize) + ' ' +
                'L 50 ' + bubbleHeight + ' ' +
                'L 10 ' + bubbleHeight + ' ' +
                'Q 0 ' + bubbleHeight + ' 0 ' + (bubbleHeight - 10) + ' ' +
                'L 0 10 ' +
                'Q 0 0 10 0 Z',
                {
                    fill: '#ffffff',
                    stroke: '#333333',
                    strokeWidth: 2,
                    left: -bubbleWidth / 2,
                    top: -(bubbleHeight + tailSize) / 2,
                    originX: 'left',
                    originY: 'top',
                    selectable: false,
                    evented: false
                }
            );
            
            // 使用Textbox支持自动换行
            const bubbleText = new fabric.Textbox('Type here', {
                fontSize: 14,
                fill: '#333333',
                fontFamily: 'Arial',
                left: 0,
                top: -tailSize / 2,
                originX: 'center',
                originY: 'center',
                textAlign: 'center',
                width: bubbleWidth - padding * 2,
                splitByGrapheme: true,
                selectable: false,
                evented: false
            });
            
            const speechBubble = new fabric.Group([bubblePath, bubbleText], {
                left: canvasWidth / 2,
                top: canvasHeight / 2,
                originX: 'center',
                originY: 'center',
                cornerColor: '#0066cc',
                cornerStyle: 'circle',
                borderColor: '#0066cc',
                cornerSize: 10,
                transparentCorners: false,
                subTargetCheck: true,
                interactive: true,
                _isSpeechBubble: true,
                _bubbleWidth: bubbleWidth,
                _bubbleHeight: bubbleHeight,
                _padding: padding
            });
            
            canvas.add(speechBubble);
            canvas.setActiveObject(speechBubble);
            canvas.renderAll();
            hideEmptyState();
            saveState();
            showToast('💬 Speech bubble added');
            closeAllDrawers();
        }
        
        // ==================== 对齐与分布功能 ====================
        
        function alignLeft() {
            const activeObject = canvas.getActiveObject();
            if (!activeObject || activeObject.type !== 'activeSelection') {
                showToast('请先选择多个对象');
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
            
            const newSelection = new fabric.ActiveSelection(objects, { canvas: canvas });
            canvas.setActiveObject(newSelection);
            if (typeof disableActiveSelectionRotation === 'function') {
                disableActiveSelectionRotation(newSelection);
            }
            canvas.requestRenderAll();
            saveState();
            showToast('✓ Aligned left');
        }
        
        function alignCenterH() {
            const activeObject = canvas.getActiveObject();
            if (!activeObject || activeObject.type !== 'activeSelection') {
                showToast('请先选择多个对象');
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
            
            const newSelection = new fabric.ActiveSelection(objects, { canvas: canvas });
            canvas.setActiveObject(newSelection);
            if (typeof disableActiveSelectionRotation === 'function') {
                disableActiveSelectionRotation(newSelection);
            }
            canvas.requestRenderAll();
            saveState();
            showToast('✓ Aligned center');
        }
        
        function alignRight() {
            const activeObject = canvas.getActiveObject();
            if (!activeObject || activeObject.type !== 'activeSelection') {
                showToast('请先选择多个对象');
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
            
            const newSelection = new fabric.ActiveSelection(objects, { canvas: canvas });
            canvas.setActiveObject(newSelection);
            if (typeof disableActiveSelectionRotation === 'function') {
                disableActiveSelectionRotation(newSelection);
            }
            canvas.requestRenderAll();
            saveState();
            showToast('✓ Aligned right');
        }
        
        function alignTop() {
            const activeObject = canvas.getActiveObject();
            if (!activeObject || activeObject.type !== 'activeSelection') {
                showToast('请先选择多个对象');
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
            
            const newSelection = new fabric.ActiveSelection(objects, { canvas: canvas });
            canvas.setActiveObject(newSelection);
            if (typeof disableActiveSelectionRotation === 'function') {
                disableActiveSelectionRotation(newSelection);
            }
            canvas.requestRenderAll();
            saveState();
            showToast('✓ Aligned top');
        }
        
        function alignCenterV() {
            const activeObject = canvas.getActiveObject();
            if (!activeObject || activeObject.type !== 'activeSelection') {
                showToast('请先选择多个对象');
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
            
            const newSelection = new fabric.ActiveSelection(objects, { canvas: canvas });
            canvas.setActiveObject(newSelection);
            if (typeof disableActiveSelectionRotation === 'function') {
                disableActiveSelectionRotation(newSelection);
            }
            canvas.requestRenderAll();
            saveState();
            showToast('✓ Aligned middle');
        }
        
        function alignBottom() {
            const activeObject = canvas.getActiveObject();
            if (!activeObject || activeObject.type !== 'activeSelection') {
                showToast('请先选择多个对象');
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
            
            const newSelection = new fabric.ActiveSelection(objects, { canvas: canvas });
            canvas.setActiveObject(newSelection);
            if (typeof disableActiveSelectionRotation === 'function') {
                disableActiveSelectionRotation(newSelection);
            }
            canvas.requestRenderAll();
            saveState();
            showToast('✓ Aligned bottom');
        }
        
        // 水平分布
        function distributeH() {
            const activeObject = canvas.getActiveObject();
            if (!activeObject || activeObject.type !== 'activeSelection') {
                showToast('请先选择多个对象');
                return;
            }
            const objects = activeObject.getObjects().slice();
            if (objects.length < 3) {
                showToast('至少需要选择 3 个对象');
                return;
            }
            
            canvas.discardActiveObject();
            canvas.renderAll();
            
            const items = objects.map(obj => {
                obj.setCoords();
                const bound = obj.getBoundingRect();
                return { obj, boundLeft: bound.left, boundWidth: bound.width };
            });
            items.sort((a, b) => a.boundLeft - b.boundLeft);
            
            const first = items[0];
            const last = items[items.length - 1];
            const totalWidth = (last.boundLeft + last.boundWidth) - first.boundLeft;
            const contentWidth = items.reduce((sum, item) => sum + item.boundWidth, 0);
            const gap = (totalWidth - contentWidth) / (items.length - 1);
            
            let currentLeft = first.boundLeft;
            items.forEach((item, i) => {
                if (i === 0) {
                    currentLeft += item.boundWidth + gap;
                    return;
                }
                const offset = currentLeft - item.boundLeft;
                item.obj.set('left', item.obj.left + offset);
                item.obj.setCoords();
                currentLeft += item.boundWidth + gap;
            });
            
            const newSelection = new fabric.ActiveSelection(objects, { canvas: canvas });
            canvas.setActiveObject(newSelection);
            if (typeof disableActiveSelectionRotation === 'function') {
                disableActiveSelectionRotation(newSelection);
            }
            canvas.requestRenderAll();
            saveState();
            showToast('✓ Distributed horizontally');
        }
        
        // 垂直分布
        function distributeV() {
            const activeObject = canvas.getActiveObject();
            if (!activeObject || activeObject.type !== 'activeSelection') {
                showToast('请先选择多个对象');
                return;
            }
            const objects = activeObject.getObjects().slice();
            if (objects.length < 3) {
                showToast('至少需要选择 3 个对象');
                return;
            }
            
            canvas.discardActiveObject();
            canvas.renderAll();
            
            const items = objects.map(obj => {
                obj.setCoords();
                const bound = obj.getBoundingRect();
                return { obj, boundTop: bound.top, boundHeight: bound.height };
            });
            items.sort((a, b) => a.boundTop - b.boundTop);
            
            const first = items[0];
            const last = items[items.length - 1];
            const totalHeight = (last.boundTop + last.boundHeight) - first.boundTop;
            const contentHeight = items.reduce((sum, item) => sum + item.boundHeight, 0);
            const gap = (totalHeight - contentHeight) / (items.length - 1);
            
            let currentTop = first.boundTop;
            items.forEach((item, i) => {
                if (i === 0) {
                    currentTop += item.boundHeight + gap;
                    return;
                }
                const offset = currentTop - item.boundTop;
                item.obj.set('top', item.obj.top + offset);
                item.obj.setCoords();
                currentTop += item.boundHeight + gap;
            });
            
            const newSelection = new fabric.ActiveSelection(objects, { canvas: canvas });
            canvas.setActiveObject(newSelection);
            if (typeof disableActiveSelectionRotation === 'function') {
                disableActiveSelectionRotation(newSelection);
            }
            canvas.requestRenderAll();
            saveState();
            showToast('✓ Distributed vertically');
        }

        // 布局容器系统已移至 src/layout/containers.js 模块
        // 双击容器化 Group 时解组（桌面端）
        canvas.on('mouse:dblclick', function(e) {
            if (e.target && e.target._isContainerGroup) {
                layoutContainersModule.releaseFromLayout(e.target);
                return;
            }
            
            // 双击气泡时进入编辑模式
            if (e.target && e.target._isSpeechBubble) {
                enterBubbleEditMode(e.target);
                return;
            }
        });
        
        // ==================== 移动端触摸支持 ====================
        // 移动端双击和长按检测变量
        let lastTapTime = 0;
        let lastTapPosition = { x: 0, y: 0 };
        const DOUBLE_TAP_DELAY = 300; // 双击间隔时间（毫秒）
        const DOUBLE_TAP_DISTANCE = 40; // 双击位置容差（像素）
        
        // 移动端长按显示右键菜单
        let longPressTimer = null;
        let longPressPosition = { x: 0, y: 0 };
        const LONG_PRESS_DELAY = 400; // 长按时间（毫秒）- 缩短到400ms
        
        // 监听 canvasContainer 的触摸事件
        const canvasContainer = document.getElementById('canvasContainer');
        
        if (canvasContainer) {
            // 触摸开始
            canvasContainer.addEventListener('touchstart', function(e) {
                if (e.touches.length !== 1) return; // 只处理单指触摸
                
                const touch = e.touches[0];
                const currentTime = Date.now();
                const currentPosition = { x: touch.clientX, y: touch.clientY };
                
                // 获取触摸位置对应的 fabric 对象
                const target = canvas.findTarget(e);
                
                longPressPosition = currentPosition;
                
                // 检测双击（同一位置快速点击两次）
                const distance = Math.sqrt(
                    Math.pow(currentPosition.x - lastTapPosition.x, 2) + 
                    Math.pow(currentPosition.y - lastTapPosition.y, 2)
                );
                
                if ((currentTime - lastTapTime) < DOUBLE_TAP_DELAY && distance < DOUBLE_TAP_DISTANCE) {
                    // 双击检测成功 - 清除长按计时器
                    if (longPressTimer) {
                        clearTimeout(longPressTimer);
                        longPressTimer = null;
                    }
                    
                    e.preventDefault();
                    
                    if (target) {
                        // 双击容器组 - 解组
                        if (target._isContainerGroup && layoutContainersModule) {
                            layoutContainersModule.releaseFromLayout(target);
                            lastTapTime = 0;
                            return;
                        }
                        
                        // 双击气泡 - 编辑文字
                        if (target._isSpeechBubble) {
                            enterBubbleEditMode(target);
                            lastTapTime = 0;
                            return;
                        }
                        
                        // 双击文字对象 - 进入编辑模式
                        if (target.type === 'i-text' || target.type === 'textbox') {
                            canvas.setActiveObject(target);
                            target.enterEditing();
                            target.selectAll();
                            canvas.renderAll();
                            lastTapTime = 0;
                            return;
                        }
                    }
                    
                    lastTapTime = 0;
                    return;
                }
                
                lastTapTime = currentTime;
                lastTapPosition = currentPosition;
                
                // 清除之前的长按计时器
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
                
                // 启动长按计时器（显示右键菜单）
                longPressTimer = setTimeout(() => {
                    // 长按触发 - 显示右键菜单
                    const currentTarget = canvas.findTarget(e) || canvas.getActiveObject();
                    
                    if (currentTarget) {
                        canvas.setActiveObject(currentTarget);
                        canvas.renderAll();
                        showContextMenu(longPressPosition.x, longPressPosition.y);
                        // 震动反馈（如果支持）
                        if (navigator.vibrate) {
                            navigator.vibrate(30);
                        }
                    }
                    longPressTimer = null;
                }, LONG_PRESS_DELAY);
                
            }, { passive: false });
            
            // 触摸移动 - 清除长按计时器（移动超过阈值才取消）
            canvasContainer.addEventListener('touchmove', function(e) {
                if (longPressTimer && e.touches.length === 1) {
                    const touch = e.touches[0];
                    const distance = Math.sqrt(
                        Math.pow(touch.clientX - longPressPosition.x, 2) + 
                        Math.pow(touch.clientY - longPressPosition.y, 2)
                    );
                    // 移动超过10像素才取消长按
                    if (distance > 10) {
                        clearTimeout(longPressTimer);
                        longPressTimer = null;
                    }
                }
            }, { passive: true });
            
            // 触摸结束 - 清除长按计时器
            canvasContainer.addEventListener('touchend', function(e) {
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
            }, { passive: true });
            
            // 触摸取消 - 清除长按计时器
            canvasContainer.addEventListener('touchcancel', function(e) {
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
            }, { passive: true });
        }
        
        // 触摸其他地方关闭右键菜单
        document.addEventListener('touchstart', function(e) {
            const menu = document.getElementById('contextMenu');
            if (menu && menu.classList.contains('show') && !menu.contains(e.target)) {
                hideContextMenu();
            }
        }, { passive: true });

        // ==================== 气泡编辑功能 ====================
        
        // 进入气泡编辑模式
        function enterBubbleEditMode(bubbleGroup) {
            if (!bubbleGroup || !bubbleGroup._isSpeechBubble) return;
            
            const scaleX = bubbleGroup.scaleX || 1;
            const scaleY = bubbleGroup.scaleY || 1;
            const groupAngle = bubbleGroup.angle || 0;
            
            // 找到气泡中的文字对象（支持textbox和i-text）
            const textObj = bubbleGroup._objects.find(obj => 
                obj.type === 'textbox' || obj.type === 'i-text' || obj.type === 'text'
            );
            if (!textObj) return;
            
            // 获取气泡尺寸（从组属性或默认值）
            const bubbleWidth = bubbleGroup._bubbleWidth || 200;
            const bubbleHeight = bubbleGroup._bubbleHeight || 80;
            const padding = bubbleGroup._padding || 12;
            
            // 计算可用文字区域（考虑缩放）
            const textAreaWidth = (bubbleWidth - padding * 2) * scaleX;
            const textAreaHeight = (bubbleHeight - padding * 2) * scaleY;
            
            // 计算文字在画布中的位置
            const matrix = bubbleGroup.calcTransformMatrix();
            const textPoint = fabric.util.transformPoint(
                { x: 0, y: -10 * scaleY },
                matrix
            );
            
            // 隐藏组内的文字
            textObj.visible = false;
            bubbleGroup.dirty = true;
            canvas.renderAll();
            
            // 字体大小
            const fontSize = (textObj.fontSize || 14) * Math.min(scaleX, scaleY);
            
            // 保存上一次有效的文本
            let lastValidText = textObj.text || '';
            
            // 创建临时编辑文本框
            const editText = new fabric.Textbox(lastValidText, {
                fontSize: fontSize,
                fill: textObj.fill || '#333333',
                fontFamily: textObj.fontFamily || 'Arial',
                left: textPoint.x,
                top: textPoint.y,
                originX: 'center',
                originY: 'center',
                textAlign: 'center',
                angle: groupAngle,
                width: textAreaWidth,
                splitByGrapheme: true,
                _tempEditFor: bubbleGroup,
                _originalTextObj: textObj,
                hasControls: false,
                hasBorders: true,
                borderColor: '#0066cc',
                editingBorderColor: '#0066cc',
                lockScalingX: true,
                lockScalingY: true
            });
            
            canvas.add(editText);
            canvas.setActiveObject(editText);
            editText.enterEditing();
            editText.selectAll();
            canvas.renderAll();
            
            // 监听文字变化，严格限制高度
            editText.on('changed', function() {
                editText.initDimensions();
                const currentHeight = editText.height;
                
                if (currentHeight > textAreaHeight) {
                    editText.text = lastValidText;
                    editText.initDimensions();
                    editText.setSelectionStart(editText.text.length);
                    editText.setSelectionEnd(editText.text.length);
                    canvas.renderAll();
                } else {
                    lastValidText = editText.text;
                }
            });
            
            // 监听编辑结束
            editText.on('editing:exited', function() {
                // 更新原文字内容，保持宽度
                textObj.set({
                    text: editText.text,
                    visible: true,
                    width: bubbleWidth - padding * 2
                });
                textObj.initDimensions && textObj.initDimensions();
                bubbleGroup.dirty = true;
                canvas.remove(editText);
                canvas.setActiveObject(bubbleGroup);
                canvas.renderAll();
                saveState();
            });
        }


        // ==================== 右键菜单功能 ====================
        
        // 创建右键菜单
        function createContextMenu() {
            let menu = document.getElementById('contextMenu');
            if (menu) return menu;
            
            menu = document.createElement('div');
            menu.id = 'contextMenu';
            menu.className = 'context-menu';
            menu.innerHTML = `
                <div class="context-menu-item" data-action="group">
                    <i class="fas fa-object-group"></i>
                    <span data-i18n="group">组合</span>
                    <span class="shortcut">Ctrl+G</span>
                </div>
                <div class="context-menu-item" data-action="ungroup">
                    <i class="fas fa-object-ungroup"></i>
                    <span data-i18n="ungroup">解组</span>
                    <span class="shortcut">Ctrl+Shift+G</span>
                </div>
                <div class="context-menu-divider" id="alignDivider"></div>
                <div class="context-menu-submenu" id="alignSubmenu">
                    <div class="context-menu-item has-submenu" data-submenu="align">
                        <i class="fas fa-align-left"></i>
                        <span data-i18n="align">对齐</span>
                        <i class="fas fa-chevron-right submenu-arrow"></i>
                    </div>
                    <div class="context-submenu" id="alignSubmenuContent">
                        <div class="context-menu-item" data-action="alignLeft">
                            <i class="fas fa-align-left"></i>
                            <span data-i18n="alignLeft">左对齐</span>
                        </div>
                        <div class="context-menu-item" data-action="alignCenterH">
                            <i class="fas fa-align-center"></i>
                            <span data-i18n="alignCenterH">水平居中</span>
                        </div>
                        <div class="context-menu-item" data-action="alignRight">
                            <i class="fas fa-align-right"></i>
                            <span data-i18n="alignRight">右对齐</span>
                        </div>
                        <div class="context-menu-divider"></div>
                        <div class="context-menu-item" data-action="alignTop">
                            <i class="fas fa-arrow-up"></i>
                            <span data-i18n="alignTop">顶部对齐</span>
                        </div>
                        <div class="context-menu-item" data-action="alignCenterV">
                            <i class="fas fa-arrows-up-down"></i>
                            <span data-i18n="alignCenterV">垂直居中</span>
                        </div>
                        <div class="context-menu-item" data-action="alignBottom">
                            <i class="fas fa-arrow-down"></i>
                            <span data-i18n="alignBottom">底部对齐</span>
                        </div>
                    </div>
                </div>
                <div class="context-menu-submenu" id="distributeSubmenu">
                    <div class="context-menu-item has-submenu" data-submenu="distribute">
                        <i class="fas fa-distribute-spacing-horizontal"></i>
                        <span data-i18n="distribute">分布</span>
                        <i class="fas fa-chevron-right submenu-arrow"></i>
                    </div>
                    <div class="context-submenu" id="distributeSubmenuContent">
                        <div class="context-menu-item" data-action="distributeH">
                            <i class="fas fa-arrows-left-right"></i>
                            <span data-i18n="distributeH">水平分布</span>
                        </div>
                        <div class="context-menu-item" data-action="distributeV">
                            <i class="fas fa-arrows-up-down"></i>
                            <span data-i18n="distributeV">垂直分布</span>
                        </div>
                    </div>
                </div>
                <div class="context-menu-divider"></div>
                <div class="context-menu-item" data-action="duplicate">
                    <i class="fas fa-copy"></i>
                    <span data-i18n="duplicate">复制</span>
                    <span class="shortcut">Ctrl+D</span>
                </div>
                <div class="context-menu-item" data-action="delete">
                    <i class="fas fa-trash-alt"></i>
                    <span data-i18n="delete">删除</span>
                    <span class="shortcut">Del</span>
                </div>
                <div class="context-menu-divider"></div>
                <div class="context-menu-item" data-action="bringToFront">
                    <i class="fas fa-arrow-up"></i>
                    <span data-i18n="bringToFront">置于顶层</span>
                    <span class="shortcut">Ctrl+]</span>
                </div>
                <div class="context-menu-item" data-action="sendToBack">
                    <i class="fas fa-arrow-down"></i>
                    <span data-i18n="sendToBack">置于底层</span>
                    <span class="shortcut">Ctrl+[</span>
                </div>
                <div class="context-menu-divider"></div>
                <div class="context-menu-item" data-action="flipH">
                    <i class="fas fa-arrows-left-right"></i>
                    <span data-i18n="flipH">水平翻转</span>
                </div>
                <div class="context-menu-item" data-action="flipV">
                    <i class="fas fa-arrows-up-down"></i>
                    <span data-i18n="flipV">垂直翻转</span>
                </div>
            `;
            document.body.appendChild(menu);
            
            // 绑定菜单项点击事件
            menu.querySelectorAll('.context-menu-item:not(.has-submenu)').forEach(item => {
                item.addEventListener('click', (e) => {
                    const action = item.dataset.action;
                    if (action) {
                        handleContextMenuAction(action);
                        hideContextMenu();
                    }
                });
            });
            
            // 添加子菜单悬停事件
            menu.querySelectorAll('.has-submenu').forEach(item => {
                item.addEventListener('mouseenter', (e) => {
                    const submenuId = item.dataset.submenu + 'SubmenuContent';
                    const submenu = document.getElementById(submenuId);
                    if (submenu) {
                        menu.querySelectorAll('.context-submenu').forEach(s => s.classList.remove('show'));
                        submenu.classList.add('show');
                    }
                });
            });
            
            menu.querySelectorAll('.context-menu-submenu').forEach(submenu => {
                submenu.addEventListener('mouseleave', (e) => {
                    const content = submenu.querySelector('.context-submenu');
                    if (content) content.classList.remove('show');
                });
            });
            
            return menu;
        }
        
        // 显示右键菜单
        function showContextMenu(x, y) {
            let menu = document.getElementById('contextMenu');
            if (!menu) {
                menu = createContextMenu();
            }
            
            const activeObject = canvas.getActiveObject();
            
            // 根据选中对象类型显示/隐藏菜单项
            const groupItem = menu.querySelector('[data-action="group"]');
            const ungroupItem = menu.querySelector('[data-action="ungroup"]');
            const alignSubmenu = document.getElementById('alignSubmenu');
            const distributeSubmenu = document.getElementById('distributeSubmenu');
            const alignDivider = document.getElementById('alignDivider');
            
            if (activeObject) {
                if (activeObject.type === 'activeSelection') {
                    groupItem.style.display = 'flex';
                    ungroupItem.style.display = 'none';
                    alignSubmenu.style.display = 'block';
                    alignDivider.style.display = 'block';
                    const objectCount = activeObject.getObjects().length;
                    distributeSubmenu.style.display = objectCount >= 3 ? 'block' : 'none';
                } else if (activeObject.type === 'group') {
                    groupItem.style.display = 'none';
                    ungroupItem.style.display = 'flex';
                    alignSubmenu.style.display = 'none';
                    distributeSubmenu.style.display = 'none';
                    alignDivider.style.display = 'none';
                } else {
                    groupItem.style.display = 'none';
                    ungroupItem.style.display = 'none';
                    alignSubmenu.style.display = 'none';
                    distributeSubmenu.style.display = 'none';
                    alignDivider.style.display = 'none';
                }
            }
            
            // 关闭所有子菜单
            menu.querySelectorAll('.context-submenu').forEach(s => s.classList.remove('show'));
            
            // 更新多语言
            if (typeof I18n !== 'undefined') {
                I18n.updateUI();
            }
            
            // 计算菜单位置
            menu.style.visibility = 'hidden';
            menu.style.left = '0px';
            menu.style.top = '0px';
            menu.classList.add('show');
            
            const rect = menu.getBoundingClientRect();
            const menuWidth = rect.width;
            const menuHeight = rect.height;
            
            let finalX = x;
            let finalY = y;
            
            if (x + menuWidth > window.innerWidth - 10) {
                finalX = x - menuWidth;
                if (finalX < 10) finalX = 10;
            }
            
            if (y + menuHeight > window.innerHeight - 10) {
                finalY = y - menuHeight;
                if (finalY < 10) finalY = 10;
            }
            
            menu.style.left = finalX + 'px';
            menu.style.top = finalY + 'px';
            menu.style.visibility = 'visible';
        }
        
        // 隐藏右键菜单
        function hideContextMenu() {
            const menu = document.getElementById('contextMenu');
            if (menu) {
                menu.classList.remove('show');
            }
        }
        
        // 处理右键菜单操作
        function handleContextMenuAction(action) {
            switch (action) {
                case 'group':
                    groupSelected();
                    break;
                case 'ungroup':
                    ungroupSelected();
                    break;
                case 'duplicate':
                    duplicateObject();
                    break;
                case 'delete':
                    deleteSelected();
                    break;
                case 'bringToFront':
                    bringToFront();
                    break;
                case 'sendToBack':
                    sendToBack();
                    break;
                case 'flipH':
                    flipHorizontal();
                    break;
                case 'flipV':
                    flipVertical();
                    break;
                case 'alignLeft':
                    alignLeft();
                    break;
                case 'alignCenterH':
                    alignCenterH();
                    break;
                case 'alignRight':
                    alignRight();
                    break;
                case 'alignTop':
                    alignTop();
                    break;
                case 'alignCenterV':
                    alignCenterV();
                    break;
                case 'alignBottom':
                    alignBottom();
                    break;
                case 'distributeH':
                    distributeH();
                    break;
                case 'distributeV':
                    distributeV();
                    break;
            }
        }
        
        // 绑定右键菜单事件 - 使用原生DOM事件确保可靠触发
        document.getElementById('canvasContainer').addEventListener('contextmenu', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            hideContextMenu();
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                showContextMenu(e.clientX, e.clientY);
            }
            return false;
        });
        
        // 点击其他地方关闭右键菜单
        document.addEventListener('click', (e) => {
            const menu = document.getElementById('contextMenu');
            if (menu && !menu.contains(e.target)) {
                hideContextMenu();
            }
        });
        
        // 滚动时关闭右键菜单
        document.addEventListener('scroll', hideContextMenu);
        canvas.on('mouse:wheel', hideContextMenu);


        // ==================== 组合/解组/复制功能 ====================
        
        // 禁止 ActiveSelection 旋转
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
        
        // 组合选中对象
        function groupSelected() {
            const activeObject = canvas.getActiveObject();
            if (!activeObject || activeObject.type !== 'activeSelection') {
                showToast('请先选择多个对象');
                return;
            }
            
            const objects = activeObject.getObjects();
            if (objects.length < 2) {
                showToast('至少需要选择两个对象');
                return;
            }
            
            // 记录选区的中心点和变换信息
            const selectionCenter = activeObject.getCenterPoint();
            const selectionAngle = activeObject.angle || 0;
            
            // 使用toGroup转换
            const group = activeObject.toGroup();
            
            // 确保组的位置正确
            group.set({
                cornerColor: '#0066cc',
                cornerStyle: 'circle',
                borderColor: '#0066cc',
                cornerSize: 10,
                transparentCorners: false,
                selectable: true,
                evented: true
            });
            
            group.setCoords();
            canvas.setActiveObject(group);
            canvas.requestRenderAll();
            saveState();
            showToast('✓ 已组合');
        }
        
        // 解组选中对象
        function ungroupSelected() {
            const activeObject = canvas.getActiveObject();
            if (!activeObject || activeObject.type !== 'group') {
                showToast('请先选择一个组');
                return;
            }
            
            // 如果是容器化的 Group，使用特殊解组
            if (activeObject._isContainerGroup) {
                releaseFromLayout(activeObject);
                return;
            }
            
            // 获取组的变换矩阵
            const groupMatrix = activeObject.calcTransformMatrix();
            
            // 获取组内所有对象
            const items = activeObject._objects.slice();
            
            // 计算每个对象在画布中的绝对变换
            const itemsAbsolute = items.map(item => {
                // 获取对象相对于组的变换矩阵
                const itemMatrix = item.calcTransformMatrix();
                // 组合变换矩阵得到绝对变换
                const absoluteMatrix = fabric.util.multiplyTransformMatrices(groupMatrix, [
                    item.scaleX || 1, 0, 0, item.scaleY || 1, item.left, item.top
                ]);
                
                // 从矩阵中提取位置
                const point = fabric.util.transformPoint({ x: 0, y: 0 }, absoluteMatrix);
                
                return {
                    item: item,
                    left: point.x,
                    top: point.y,
                    scaleX: (item.scaleX || 1) * (activeObject.scaleX || 1),
                    scaleY: (item.scaleY || 1) * (activeObject.scaleY || 1),
                    angle: (item.angle || 0) + (activeObject.angle || 0)
                };
            });
            
            // 从画布移除组
            canvas.remove(activeObject);
            
            // 将对象添加回画布，使用绝对位置
            const newObjects = [];
            itemsAbsolute.forEach(data => {
                const obj = data.item;
                obj.set({
                    left: data.left,
                    top: data.top,
                    scaleX: data.scaleX,
                    scaleY: data.scaleY,
                    angle: data.angle,
                    selectable: true,
                    evented: true
                });
                obj.setCoords();
                canvas.add(obj);
                newObjects.push(obj);
            });
            
            // 创建新的选区
            if (newObjects.length > 0) {
                const selection = new fabric.ActiveSelection(newObjects, { canvas: canvas });
                disableActiveSelectionRotation(selection);
                canvas.setActiveObject(selection);
            }
            
            canvas.requestRenderAll();
            saveState();
            showToast('✓ 已解组');
        }
        
        // 复制选中对象
        function duplicateObject() {
            const obj = canvas.getActiveObject();
            if (!obj) {
                showToast('请先选择对象');
                return;
            }
            
            obj.clone(function(cloned) {
                cloned.set({
                    left: cloned.left + 20,
                    top: cloned.top + 20,
                    evented: true
                });
                
                if (cloned.type === 'activeSelection') {
                    cloned.canvas = canvas;
                    cloned.forEachObject(function(o) {
                        canvas.add(o);
                    });
                    disableActiveSelectionRotation(cloned);
                    canvas.setActiveObject(cloned);
                } else {
                    canvas.add(cloned);
                    canvas.setActiveObject(cloned);
                }
                
                canvas.requestRenderAll();
                saveState();
                showToast('✓ 已复制');
            });
        }


        // ==================== 用户体验优化函数 ====================
        
        // 显示加载指示器
        function showLoading(text) {
            const overlay = document.getElementById('loadingOverlay');
            const textEl = overlay?.querySelector('.loading-spinner-text');
            if (textEl && text) {
                textEl.textContent = text;
            }
            overlay?.classList.add('show');
        }
        
        // 隐藏加载指示器
        function hideLoading() {
            document.getElementById('loadingOverlay')?.classList.remove('show');
        }
        
        // 显示首次操作提示
        let firstImageAdded = false;
        function showFirstActionTip() {
            if (firstImageAdded) return;
            firstImageAdded = true;
            
            // 检查是否是首次添加图片
            if (localStorage.getItem('firstActionTipShown')) return;
            
            const tip = document.getElementById('firstActionTip');
            if (!tip) return;
            
            tip.classList.add('show');
            
            // 3秒后自动隐藏
            setTimeout(() => {
                tip.classList.remove('show');
                localStorage.setItem('firstActionTipShown', 'true');
            }, 4000);
        }
        
        // 显示工具反馈提示
        function showToolFeedback(message) {
            const feedback = document.getElementById('toolFeedback');
            const textEl = document.getElementById('toolFeedbackText');
            if (!feedback || !textEl) return;
            
            textEl.textContent = message;
            feedback.classList.add('show');
            
            setTimeout(() => {
                feedback.classList.remove('show');
            }, 2500);
        }
        
        // 检查是否需要选中图片才能使用工具
        function checkImageSelected(toolName) {
            const activeObject = canvas.getActiveObject();
            if (!activeObject || activeObject.type !== 'image') {
                const msg = I18n?.t('tipSelectFirst') || 'Please select an image first';
                showToolFeedback(msg);
                return false;
            }
            return true;
        }
        
        // 暴露函数到全局
        window.showLoading = showLoading;
        window.hideLoading = hideLoading;
        window.showFirstActionTip = showFirstActionTip;
        window.showToolFeedback = showToolFeedback;
        window.checkImageSelected = checkImageSelected;


        // ==================== macOS 适配 ====================
        
        // 检测是否为 macOS
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0 || 
                      navigator.userAgent.toUpperCase().indexOf('MAC') >= 0;
        
        // 获取适合当前平台的修饰键符号
        function getModKey() {
            return isMac ? '⌘' : 'Ctrl';
        }
        
        // 更新页面上的快捷键提示
        function updateShortcutHints() {
            // 更新 data-shortcut 属性
            document.querySelectorAll('[data-shortcut]').forEach(el => {
                let shortcut = el.getAttribute('data-shortcut');
                if (isMac) {
                    shortcut = shortcut.replace(/Ctrl\+/g, '⌘');
                    shortcut = shortcut.replace(/⌘V\/Ctrl\+V/g, '⌘V');
                } else {
                    shortcut = shortcut.replace(/⌘/g, 'Ctrl+');
                    shortcut = shortcut.replace(/⌘V\/Ctrl\+V/g, 'Ctrl+V');
                }
                el.setAttribute('data-shortcut', shortcut);
            });
        }
        
        // 页面加载后更新快捷键提示
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', updateShortcutHints);
        } else {
            updateShortcutHints();
        }
        
        // 暴露到全局
        window.isMac = isMac;
        window.getModKey = getModKey;
