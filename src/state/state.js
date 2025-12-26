// ==================== 全局状态管理 ====================
// 集中管理所有状态变量，所有模块只读 state，修改必须通过 setter

// ==================== 启动状态屏障 (Bootstrap Barrier) ====================
// 只有当所有条件满足时，才允许用户操作
const bootstrapState = {
    domReady: false,
    fabricReady: false,
    canvasReady: false,
    modulesReady: false,
    i18nReady: false
};

// 检查是否所有启动条件都满足
function isBootstrapComplete() {
    return bootstrapState.domReady && 
           bootstrapState.fabricReady && 
           bootstrapState.canvasReady && 
           bootstrapState.modulesReady;
}

// 设置启动状态
function setBootstrapState(key, value) {
    if (key in bootstrapState) {
        bootstrapState[key] = value;
        // 检查是否全部完成
        if (isBootstrapComplete()) {
            onBootstrapComplete();
        }
    }
}

// 启动完成后的回调
function onBootstrapComplete() {
    // 隐藏加载遮罩
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('show');
    }
    
    // 启用工具栏
    enableToolbar();
    
    console.log('[Bootstrap] Application ready');
}

// 启用工具栏
function enableToolbar() {
    // 移除所有工具按钮的禁用状态
    document.querySelectorAll('.tool-btn[data-bootstrap-disabled]').forEach(btn => {
        btn.disabled = false;
        btn.removeAttribute('data-bootstrap-disabled');
        btn.style.opacity = '';
        btn.style.pointerEvents = '';
    });
    
    document.querySelectorAll('.mobile-tool-btn[data-bootstrap-disabled]').forEach(btn => {
        btn.disabled = false;
        btn.removeAttribute('data-bootstrap-disabled');
        btn.style.opacity = '';
        btn.style.pointerEvents = '';
    });
}

// 禁用工具栏（启动时调用）
function disableToolbar() {
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.disabled = true;
        btn.setAttribute('data-bootstrap-disabled', 'true');
        btn.style.opacity = '0.5';
        btn.style.pointerEvents = 'none';
    });
    
    document.querySelectorAll('.mobile-tool-btn').forEach(btn => {
        btn.disabled = true;
        btn.setAttribute('data-bootstrap-disabled', 'true');
        btn.style.opacity = '0.5';
        btn.style.pointerEvents = 'none';
    });
}

// 导出启动状态
window.bootstrapState = bootstrapState;
window.isBootstrapComplete = isBootstrapComplete;
window.setBootstrapState = setBootstrapState;

const state = {
    // 基础模式
    mode: 'select',
    currentLang: 'en',
    currentTheme: 'light',
    currentZoom: 1,
    
    // 功能开关
    snapEnabled: true,
    drawingMode: false,
    cropMode: false,
    guidesVisible: false,
    layoutAdoptEnabled: true,
    
    // 常量配置
    SNAP_THRESHOLD: 5,
    SNAP_EDGE_THRESHOLD: 2,
    ANGLE_SNAP: 15,
    SNAP_ANGLES: [0, 45, 90, 135, 180, 225, 270, 315, 360],
    
    // 画布尺寸
    canvasWidth: 800,
    canvasHeight: 600,
    
    // 辅助线和标签
    guideLines: [],
    alignLabels: [],
    rotationLabel: null,
    guideElements: [],
    
    // 历史记录
    history: [],
    historyStep: -1,
    
    // 布局拖拽系统
    layoutHoverTarget: null,
    draggingObject: null,
    
    // 空格拖拽画布
    isSpacePressed: false,
    isPanning: false,
    lastPosX: 0,
    lastPosY: 0,
    
    // Alt 键临时禁用吸附
    isAltPressed: false,
    snapWasEnabled: false,
    
    // 导出模式
    shareExportMode: 'full',
    downloadExportMode: 'full',
    
    // 裁剪相关
    cropTarget: null,
    originalImageState: null,
    cropRect: null,
    cropOverlays: [],
    
    // 形状颜色
    currentShapeColor: 'rgba(0, 0, 0, 0.5)',
    currentShapeStroke: '#000000',
    
    // 画笔设置
    savedBrushSettings: {
        color: '#000000',
        width: 5
    },
    
    // 文字设置
    savedTextSettings: {
        fontFamily: 'Arial',
        fontSize: 32,
        fill: '#000000',
        fontWeight: 'normal'
    },
    
    // 图标设置
    currentIconCategory: 'popular',
    iconSearchTimeout: null,
    currentIconColor: '#667eea',
    
    // 颜色选择器实例（运行时赋值）
    bgPickr: null,
    textPickr: null,
    bgPickrMobile: null,
    textPickrMobile: null,
    drawPickr: null,
    drawPickrMobile: null,
    shapePickr: null,
    iconPickr: null,
    
    // 右键菜单状态
    isRightMouseDown: false,
    
    // 编辑提示记录
    shownHints: new Set()
};

// ==================== Setter 函数 ====================
// 所有状态修改必须通过这些函数

function setState(key, value) {
    if (key in state) {
        state[key] = value;
    } else {
        console.warn(`[state] Unknown state key: ${key}`);
    }
}

function setNestedState(parentKey, childKey, value) {
    if (parentKey in state && typeof state[parentKey] === 'object') {
        state[parentKey][childKey] = value;
    }
}

// 批量设置状态
function setMultipleState(updates) {
    Object.keys(updates).forEach(key => {
        setState(key, updates[key]);
    });
}

// 数组操作
function pushToState(key, value) {
    if (Array.isArray(state[key])) {
        state[key].push(value);
    }
}

function clearStateArray(key) {
    if (Array.isArray(state[key])) {
        state[key] = [];
    }
}

// 导出
window.AppState = state;
window.setState = setState;
window.setNestedState = setNestedState;
window.setMultipleState = setMultipleState;
window.pushToState = pushToState;
window.clearStateArray = clearStateArray;
