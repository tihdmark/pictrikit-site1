// 多语言管理模块
const I18n = {
    currentLang: 'en',
    translations: {},
    
    // 初始化多语言
    async init(lang = 'en') {
        this.currentLang = lang;
        await this.loadLanguage(lang);
        this.updateUI();
    },
    
    // 加载语言文件
    async loadLanguage(lang) {
        try {
            console.log(`[I18n] Fetching /lang/${lang}.json`);
            const response = await fetch(`/lang/${lang}.json`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to load language: ${lang}`);
            }
            const data = await response.json();
            this.translations[lang] = data;
            console.log(`[I18n] Loaded ${lang} with ${Object.keys(data).length} keys`);
        } catch (error) {
            console.error('[I18n] Error loading language:', error);
            // 如果加载失败，尝试加载英语作为后备
            if (lang !== 'en') {
                await this.loadLanguage('en');
                this.currentLang = 'en';
            }
        }
    },
    
    // 切换语言
    async changeLanguage(lang) {
        console.log(`[I18n] Changing language to: ${lang}`);
        console.log(`[I18n] Current translations:`, Object.keys(this.translations));
        
        try {
            if (!this.translations[lang]) {
                console.log(`[I18n] Loading language file for: ${lang}`);
                await this.loadLanguage(lang);
            }
            
            if (!this.translations[lang]) {
                console.error(`[I18n] Failed to load language: ${lang}`);
                return;
            }
            
            this.currentLang = lang;
            console.log(`[I18n] Language set to: ${this.currentLang}`);
            
            this.updateUI();
            localStorage.setItem('language', lang);
            localStorage.setItem('preferredLanguage', lang);
            
            // 更新语言选择器的值
            const langSelect = document.getElementById('languageSelect');
            if (langSelect && langSelect.value !== lang) {
                langSelect.value = lang;
            }
        } catch (error) {
            console.error(`[I18n] Error changing language:`, error);
        }
    },
    
    // 获取翻译文本
    t(key) {
        const translation = this.translations[this.currentLang];
        return translation && translation[key] ? translation[key] : key;
    },
    
    // 更新页面上所有带 data-i18n 属性的元素
    updateUI() {
        const elements = document.querySelectorAll('[data-i18n]');
        console.log(`Updating ${elements.length} elements with language: ${this.currentLang}`);
        
        // 使用 requestAnimationFrame 来批量更新，避免布局抖动
        requestAnimationFrame(() => {
            elements.forEach(el => {
                const key = el.getAttribute('data-i18n');
                const translation = this.t(key);
                if (translation && translation !== key) {
                    // 保留 HTML 结构（如 kbd 标签）
                    if (el.innerHTML.includes('<kbd>')) {
                        el.innerHTML = translation;
                    } else {
                        el.textContent = translation;
                    }
                }
            });
            
            // 更新 SEO 内容显示
            this.updateSEOContent();
            
            // 更新语言选择器显示
            this.updateLanguageSelector();
        });
    },
    
    // 更新 SEO 内容的语言显示
    updateSEOContent() {
        const seoTexts = document.querySelectorAll('.seo-text[data-lang]');
        seoTexts.forEach(text => {
            const lang = text.getAttribute('data-lang');
            if (lang === this.currentLang) {
                text.style.display = 'block';
            } else {
                text.style.display = 'none';
            }
        });
    },
    
    // 更新语言选择器的当前语言显示
    updateLanguageSelector() {
        const langNames = {
            'en': 'English',
            'zh-CN': '简体中文',
            'ja': '日本語',
            'ko': '한국어'
        };
        
        const currentLangEl = document.getElementById('currentLangText');
        if (currentLangEl) {
            currentLangEl.textContent = langNames[this.currentLang];
        }
        
        // 更新语言选项的激活状态
        document.querySelectorAll('.lang-option').forEach(option => {
            option.classList.remove('active');
            if (option.getAttribute('data-lang') === this.currentLang) {
                option.classList.add('active');
            }
        });
    },
    
    // 从浏览器或 localStorage 获取首选语言
    getPreferredLanguage() {
        // 首先检查 localStorage (支持两种键名)
        const saved = localStorage.getItem('language') || localStorage.getItem('preferredLanguage');
        if (saved) return saved;
        
        // 然后检查浏览器语言
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('zh')) return 'zh-CN';
        if (browserLang.startsWith('ja')) return 'ja';
        if (browserLang.startsWith('ko')) return 'ko';
        
        return 'en'; // 默认英语
    }
};

// 全局函数供 HTML 调用
window.setLanguage = function(lang) {
    I18n.changeLanguage(lang);
};

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    const preferredLang = I18n.getPreferredLanguage();
    I18n.init(preferredLang);
    
    // 更新语言选择器的值
    const langSelect = document.getElementById('languageSelect');
    if (langSelect) {
        langSelect.value = preferredLang;
    }
});

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18n;
}
