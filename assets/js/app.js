// Translations moved to lang/*.json files and loaded via i18n.js

        let currentLang = 'en';
        let currentTheme = 'light';
        let currentZoom = 1;
        let snapEnabled = true;
        let drawingMode = false;
        const SNAP_THRESHOLD = 5;
        const SNAP_EDGE_THRESHOLD = 2;
        const ANGLE_SNAP = 15;
        const SNAP_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315, 360];
        let guideLines = [], alignLabels = [], rotationLabel = null;
        let history = [], historyStep = -1;
        let bgPickr, textPickr, bgPickrMobile, textPickrMobile, drawPickr, drawPickrMobile;
        
        // 空格键拖动画板相关变量
        let isSpacePressed = false;
        let isPanning = false;
        let lastPosX = 0;
        let lastPosY = 0;
        
        // 裁剪工具相关变量
        let cropMode = false;
        let cropTarget = null;
        let originalImageState = null;
        let cropRect = null;
        let cropOverlays = [];
        
        // 形状工具相关变量
        let currentShapeColor = 'rgba(102, 126, 234, 0.5)';
        let currentShapeStroke = '#667eea';
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
                    default: '#000000'
                });
                drawPickr.on('save', (c) => {
                    if (c) {
                        canvas.freeDrawingBrush.color = c.toHEXA().toString();
                        closeAllDrawers();
                    }
                    drawPickr.hide();
                });
            }

            if (document.getElementById('drawColorPickerMobile')) {
                drawPickrMobile = Pickr.create({ 
                    ...drawConfig, 
                    el: '#drawColorPickerMobile', 
                    default: '#000000'
                });
                drawPickrMobile.on('save', (c) => {
                    if (c) {
                        canvas.freeDrawingBrush.color = c.toHEXA().toString();
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
            canvasWidth = container.clientWidth;
            canvasHeight = container.clientHeight;
            canvas.setDimensions({ width: canvasWidth, height: canvasHeight });
            canvas.renderAll();
        }

        const canvas = new fabric.Canvas('canvas', {
            backgroundColor: '#ffffff',
            preserveObjectStacking: true,
            selection: true
        });

        canvas.wrapperEl.oncontextmenu = (e) => { e.preventDefault(); return false; };

        initCanvas();
        initTheme();
        updateLanguage();
        window.addEventListener('resize', initCanvas);
        window.addEventListener('load', initColorPickers);

        function zoomIn() {
            currentZoom = Math.min(currentZoom + 0.1, 3);
            applyZoom();
        }

        function zoomOut() {
            currentZoom = Math.max(currentZoom - 0.1, 0.1);
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

        document.getElementById('fileInput').addEventListener('change', (e) => {
            if (e.target.files.length) {
                Array.from(e.target.files).forEach(addImage);
                e.target.value = '';
            }
        });

        document.getElementById('bgInput').addEventListener('change', (e) => {
            if (e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = (ev) => {
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
                reader.readAsDataURL(e.target.files[0]);
                e.target.value = '';
            }
        });

        function triggerUpload() {
            document.getElementById('fileInput').click();
        }

        function addImage(file) {
            const reader = new FileReader();
            reader.onload = (e) => {
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
                });
            };
            reader.readAsDataURL(file);
        }

        // 保存画笔设置
        let savedBrushSettings = {
            color: '#000000',
            width: 5
        };

        function toggleDraw() {
            drawingMode = !drawingMode;
            canvas.isDrawingMode = drawingMode;
            document.getElementById('drawToggle').classList.toggle('active', drawingMode);
            const mobileBtn = document.getElementById('drawToggleMobile');
            if (mobileBtn) mobileBtn.classList.toggle('active', drawingMode);
            
            if (drawingMode) {
                // 使用保存的画笔设置
                canvas.freeDrawingBrush.color = savedBrushSettings.color;
                canvas.freeDrawingBrush.width = savedBrushSettings.width;
                showToast('✓ Draw mode ON');
                openDrawDrawer();
            } else {
                showToast('Draw mode OFF');
                closeAllDrawers();
            }
        }

        function updateBrushSize(value) {
            savedBrushSettings.width = parseInt(value);
            canvas.freeDrawingBrush.width = parseInt(value);
            document.getElementById('brushSizeValue').textContent = value + 'px';
            const mobileValue = document.getElementById('brushSizeValueMobile');
            if (mobileValue) mobileValue.textContent = value + 'px';
            // 同步两个滑块的值
            document.getElementById('brushSize').value = value;
            const mobileBrush = document.getElementById('brushSizeMobile');
            if (mobileBrush) mobileBrush.value = value;
        }

        // 保存文字设置
        let savedTextSettings = {
            fontFamily: 'Arial',
            fontSize: 32,
            fill: '#000000',
            fontWeight: 'normal'
        };

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
            openSettingsModal('shape');
        }
        
        function openDrawDrawer() {
            openSettingsModal('draw');
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

        document.addEventListener('paste', (e) => {
            e.preventDefault();
            for (const item of e.clipboardData.items) {
                if (item.type.includes('image')) {
                    addImage(item.getAsFile());
                    break;
                }
            }
        });

        document.getElementById('canvasContainer').addEventListener('dragover', (e) => e.preventDefault());
        document.getElementById('canvasContainer').addEventListener('drop', (e) => {
            e.preventDefault();
            Array.from(e.dataTransfer.files).forEach(f => {
                if (f.type.startsWith('image/')) addImage(f);
            });
        });

        // 智能对齐
        canvas.on('object:moving', function(e) {
            const obj = e.target;
            // 使用画布坐标（不受视口变换影响）
            const objBounds = obj.getBoundingRect(false);
            
            clearGuides();
            
            if (snapEnabled) {
                let snapX = null, snapY = null;
                let minDistX = Infinity, minDistY = Infinity;
                
                // 只对齐画板的左侧和顶部边界（使用画布坐标）
                const leftDist = objBounds.left;
                const topDist = objBounds.top;
                
                // 左边界对齐
                if (leftDist < SNAP_THRESHOLD && leftDist < minDistX) {
                    snapX = { delta: -leftDist, line: 0, label: 'Left' };
                    minDistX = leftDist;
                }
                // 顶部边界对齐
                if (topDist < SNAP_THRESHOLD && topDist < minDistY) {
                    snapY = { delta: -topDist, line: 0, label: 'Top' };
                    minDistY = topDist;
                }
                
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
            
            // 只限制左侧和顶部边界，右侧和底部不限制
            obj.setCoords();
            const finalBounds = obj.getBoundingRect(false);
            
            // 限制左边界
            if (finalBounds.left < 0) {
                obj.set('left', obj.left - finalBounds.left);
                obj.setCoords();
            }
            // 限制顶部边界
            if (finalBounds.top < 0) {
                obj.set('top', obj.top - finalBounds.top);
                obj.setCoords();
            }
            // 右侧和底部不限制，可以无限拖动
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

        function flipHorizontal() {
            const o = canvas.getActiveObject();
            if (o) { o.set('flipX', !o.flipX); canvas.renderAll(); saveState(); }
        }

        function flipVertical() {
            const o = canvas.getActiveObject();
            if (o) { o.set('flipY', !o.flipY); canvas.renderAll(); saveState(); }
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
                // Check current lock state
                const isCurrentlyLocked = o.lockMovementX || false;
                const newLockState = !isCurrentlyLocked;
                
                // Set lock properties but keep object selectable
                o.set({
                    lockMovementX: newLockState,
                    lockMovementY: newLockState,
                    lockRotation: newLockState,
                    lockScalingX: newLockState,
                    lockScalingY: newLockState,
                    hasControls: !newLockState,
                    hasBorders: true,  // Always show borders so user can see it's selected
                    selectable: true,  // Keep selectable so user can unlock it
                    evented: true      // Keep evented so it responds to clicks
                });
                
                // Update lock button icon
                const lockBtn = document.getElementById('lockBtn');
                if (lockBtn) {
                    const icon = lockBtn.querySelector('i');
                    if (icon) {
                        icon.className = newLockState ? 'fas fa-lock' : 'fas fa-lock-open';
                    }
                }
                
                canvas.renderAll();
                saveState();
                showToast(newLockState ? '🔒 Locked (position fixed)' : '🔓 Unlocked');
            }
        }

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
                    const isLocked = o.lockMovementX || false;
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

        // Center selected object or all objects
        function centerSelected() {
            const activeObj = canvas.getActiveObject();
            if (activeObj) {
                // Center the selected object
                activeObj.center();
                canvas.renderAll();
                saveState();
                showToast('⊙ Centered');
            } else if (canvas.getObjects().length > 0) {
                // Center all objects as a group
                const group = new fabric.ActiveSelection(canvas.getObjects(), {
                    canvas: canvas
                });
                group.center();
                canvas.discardActiveObject();
                canvas.renderAll();
                saveState();
                showToast('⊙ All centered');
            }
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
                // 禁用所有对象的可选择性
                canvas.forEachObject(function(obj) {
                    obj.set('evented', false);
                });
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
                } else {
                    // 如果空格键已释放，恢复对象可选择性
                    canvas.forEachObject(function(obj) {
                        obj.set('evented', true);
                    });
                }
            }
            clearGuides(); 
            if (rotationLabel) { rotationLabel.remove(); rotationLabel = null; }
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
                const imgData = canvas.toDataURL({ format: 'png', quality: 1, multiplier: 2 });
                
                // 获取画布尺寸（像素）
                const canvasWidthPx = canvas.width;
                const canvasHeightPx = canvas.height;
                
                // 转换为毫米（假设 96 DPI）
                const mmPerPx = 25.4 / 96;
                const widthMm = canvasWidthPx * mmPerPx;
                const heightMm = canvasHeightPx * mmPerPx;
                
                // 创建 PDF（横向或纵向取决于画布比例）
                const orientation = canvasWidthPx > canvasHeightPx ? 'landscape' : 'portrait';
                const pdf = new jsPDF({
                    orientation: orientation,
                    unit: 'mm',
                    format: [widthMm, heightMm]
                });
                
                // 添加图片到 PDF
                pdf.addImage(imgData, 'PNG', 0, 0, widthMm, heightMm);
                
                // 下载 PDF
                pdf.save('screenshot_' + Date.now() + '.pdf');
                
                closeDownloadModal();
                showToast('✓ PDF saved');
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

        let currentIconCategory = 'popular';
        let iconSearchTimeout = null;
        let currentIconColor = '#667eea';
        let iconPickr = null;

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

        function copyToClipboard() {
            canvas.getElement().toBlob((blob) => {
                navigator.clipboard.write([new ClipboardItem({'image/png': blob})])
                    .then(() => { showToast('✓ Copied'); closeShareModal(); })
                    .catch(() => showToast('❌ Failed'));
            });
        }

        function downloadImage(format = 'png') {
            saveImage(format);
            closeDownloadModal();
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

        // 启动应用
        if (typeof I18n !== 'undefined') {
            initApp();
        } else {
            // 如果 i18n 未加载，直接启动
            saveState();
            showToast('Welcome 🎉');
        }

