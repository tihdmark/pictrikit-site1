// 共享组件管理
const Components = {
    // 渲染 Header 组件
    renderHeader(currentPage = '') {
        return `
        <header class="page-header">
            <nav class="page-nav">
                <a href="/" class="page-logo" title="Return to Home">
                    <i class="fas fa-layer-group"></i>
                    <span>PictriKit</span>
                </a>
                
                <ul class="nav-menu" id="navMenu">
                    <li><a href="/" class="${currentPage === 'home' ? 'active' : ''}" data-i18n="navHome">Home</a></li>
                    <li><a href="/app.html" class="${currentPage === 'app' ? 'active' : ''}" data-i18n="navApp">Launch App</a></li>
                    <li><a href="/features.html" class="${currentPage === 'features' ? 'active' : ''}" data-i18n="navFeatures">Features</a></li>
                    <li><a href="/tutorial.html" class="${currentPage === 'tutorial' ? 'active' : ''}" data-i18n="navTutorial">Tutorial</a></li>
                    <li><a href="/faq.html" class="${currentPage === 'faq' ? 'active' : ''}" data-i18n="navFaq">FAQ</a></li>
                    <li><a href="/about.html" class="${currentPage === 'about' ? 'active' : ''}" data-i18n="navAbout">About</a></li>
                    <li><a href="/contact.html" class="${currentPage === 'contact' ? 'active' : ''}" data-i18n="navContact">Contact</a></li>
                </ul>
                
                <div class="nav-actions">
                    <div class="lang-selector" id="langSelector">
                        <button class="nav-btn" onclick="Components.toggleLangDropdown(event)">
                            <i class="fas fa-globe"></i>
                        </button>
                        <div class="lang-dropdown">
                            <div class="lang-option active" data-lang="en" onclick="Components.changeLanguage(event, 'en')">
                                <span>🇺🇸</span><span>English</span>
                            </div>
                            <div class="lang-option" data-lang="zh-CN" onclick="Components.changeLanguage(event, 'zh-CN')">
                                <span>🇨🇳</span><span>简体中文</span>
                            </div>
                            <div class="lang-option" data-lang="ja" onclick="Components.changeLanguage(event, 'ja')">
                                <span>🇯🇵</span><span>日本語</span>
                            </div>
                            <div class="lang-option" data-lang="ko" onclick="Components.changeLanguage(event, 'ko')">
                                <span>🇰🇷</span><span>한국어</span>
                            </div>
                        </div>
                    </div>
                    
                    <button class="nav-btn" id="themeToggle" onclick="Components.toggleTheme()">
                        <i class="fas fa-moon"></i>
                    </button>
                    
                    <button class="mobile-menu-toggle" onclick="Components.toggleMobileMenu()">
                        <i class="fas fa-bars"></i>
                    </button>
                </div>
            </nav>
        </header>
        `;
    },

    // 渲染 Footer 组件
    renderFooter() {
        return `
        <footer class="page-footer">
            <div class="footer-content">
                <div class="footer-section">
                    <h4>PictriKit</h4>
                    <p data-i18n="footerDesc">Free online screenshot stitching tool</p>
                </div>
                <div class="footer-section">
                    <h4 data-i18n="footerQuickLinks">Quick Links</h4>
                    <ul>
                        <li><a href="/features.html" data-i18n="navFeatures">Features</a></li>
                        <li><a href="/tutorial.html" data-i18n="navTutorial">Tutorial</a></li>
                        <li><a href="/faq.html" data-i18n="navFaq">FAQ</a></li>
                        <li><a href="/about.html" data-i18n="navAbout">About</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4 data-i18n="footerLegal">Legal</h4>
                    <ul>
                        <li><a href="/privacy.html" data-i18n="navPrivacy">Privacy Policy</a></li>
                        <li><a href="/terms.html" data-i18n="navTerms">Terms of Service</a></li>
                        <li><a href="/contact.html" data-i18n="navContact">Contact Us</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4 data-i18n="footerFollow">Follow Us</h4>
                    <div class="social-links">
                        <a href="#" class="social-link" aria-label="Twitter">
                            <i class="fab fa-twitter"></i>
                        </a>
                        <a href="#" class="social-link" aria-label="Facebook">
                            <i class="fab fa-facebook"></i>
                        </a>
                        <a href="#" class="social-link" aria-label="GitHub">
                            <i class="fab fa-github"></i>
                        </a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 PictriKit. <span data-i18n="footerRights">All rights reserved.</span></p>
            </div>
        </footer>
        `;
    },

    // 初始化组件
    init(currentPage = '') {
        // 插入 Header
        const headerPlaceholder = document.getElementById('header-placeholder');
        if (headerPlaceholder) {
            headerPlaceholder.innerHTML = this.renderHeader(currentPage);
        }

        // 插入 Footer
        const footerPlaceholder = document.getElementById('footer-placeholder');
        if (footerPlaceholder) {
            footerPlaceholder.innerHTML = this.renderFooter();
        }

        // 初始化主题
        this.initTheme();

        // 设置事件监听
        this.setupEventListeners();
    },

    // 切换语言下拉菜单
    toggleLangDropdown(e) {
        e.stopPropagation();
        const selector = document.getElementById('langSelector');
        if (selector) {
            selector.classList.toggle('active');
        }
    },

    // 切换语言
    async changeLanguage(e, lang) {
        e.stopPropagation();
        
        // 使用 I18n 模块切换语言
        if (typeof I18n !== 'undefined') {
            await I18n.changeLanguage(lang);
        }
        
        // 更新语言选项的激活状态
        document.querySelectorAll('.lang-option').forEach(option => {
            option.classList.remove('active');
            if (option.getAttribute('data-lang') === lang) {
                option.classList.add('active');
            }
        });
        
        // 关闭下拉菜单
        const selector = document.getElementById('langSelector');
        if (selector) {
            selector.classList.remove('active');
        }
        
        // 显示提示
        this.showToast('✓ Language changed');
    },

    // 切换主题
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // 更新图标
        const icon = newTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const iconEl = themeToggle.querySelector('i');
            if (iconEl) {
                iconEl.className = icon;
            }
        }
    },

    // 初始化主题
    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const icon = savedTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const iconEl = themeToggle.querySelector('i');
            if (iconEl) {
                iconEl.className = icon;
            }
        }
    },
    
    // 在页面加载前立即应用主题，避免闪烁
    applyThemeImmediately() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    },

    // 切换移动端菜单
    toggleMobileMenu() {
        const navMenu = document.getElementById('navMenu');
        if (navMenu) {
            navMenu.classList.toggle('show');
        }
    },

    // 设置事件监听
    setupEventListeners() {
        // 点击页面其他地方关闭语言下拉菜单
        document.addEventListener('click', (e) => {
            const langSelector = document.getElementById('langSelector');
            if (langSelector && !langSelector.contains(e.target)) {
                langSelector.classList.remove('active');
            }
        });

        // 点击导航链接时关闭移动端菜单
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                const navMenu = document.getElementById('navMenu');
                if (navMenu) {
                    navMenu.classList.remove('show');
                }
            });
        });
    },

    // 显示提示消息
    showToast(message) {
        // 创建或获取 toast 元素
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.className = 'toast';
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }
};

// 立即应用保存的主题，避免闪烁
(function() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
})();

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', Components.init);
} else {
    Components.init();
}

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Components;
}
