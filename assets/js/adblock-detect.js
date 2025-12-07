// 反广告屏蔽检测脚本
(function() {
    'use strict';
    
    // 检测广告屏蔽器的多种方法
    function detectAdBlock() {
        // 方法1: 检测广告元素是否被隐藏
        const testAd = document.createElement('div');
        testAd.innerHTML = '&nbsp;';
        testAd.className = 'adsbox ad-placement ad-placeholder adbanner';
        testAd.style.cssText = 'width: 1px !important; height: 1px !important; position: absolute !important; left: -10000px !important; top: -1000px !important;';
        document.body.appendChild(testAd);
        
        setTimeout(function() {
            const isBlocked = testAd.offsetHeight === 0 || 
                            testAd.offsetWidth === 0 || 
                            testAd.offsetParent === null ||
                            window.getComputedStyle(testAd).display === 'none' ||
                            window.getComputedStyle(testAd).visibility === 'hidden';
            
            document.body.removeChild(testAd);
            
            if (isBlocked) {
                showAdBlockWarning();
            }
        }, 100);
        
        // 方法2: 检测常见的广告脚本
        if (typeof window.google_ad_client === 'undefined') {
            // 可能被屏蔽
        }
        
        // 方法3: 使用 bait 文件检测
        fetch('/ads.js', { method: 'HEAD' })
            .catch(() => {
                // 广告文件被屏蔽
                showAdBlockWarning();
            });
    }
    
    function showAdBlockWarning() {
        // 检查是否已经显示过警告
        if (sessionStorage.getItem('adblock-warning-shown')) {
            return;
        }
        
        // 创建遮罩层
        const overlay = document.createElement('div');
        overlay.id = 'adblock-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        `;
        
        // 创建警告内容
        const warning = document.createElement('div');
        warning.style.cssText = `
            background: white;
            padding: 40px;
            border-radius: 16px;
            max-width: 500px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        `;
        
        warning.innerHTML = `
            <div style="font-size: 64px; margin-bottom: 20px;">🚫</div>
            <h2 style="color: #1a1a1a; margin-bottom: 16px; font-size: 24px;">检测到广告屏蔽器</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 24px;">
                我们注意到您正在使用广告屏蔽器。<br>
                PictriKit 是一个完全免费的工具，我们依靠广告来维持服务器运营和持续开发。
            </p>
            <p style="color: #666; line-height: 1.6; margin-bottom: 32px;">
                请将我们添加到白名单，或者关闭广告屏蔽器以继续使用。
            </p>
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button onclick="location.reload()" style="
                    padding: 12px 24px;
                    background: #667eea;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                ">
                    我已关闭广告屏蔽
                </button>
                <button onclick="document.getElementById('adblock-overlay').remove(); sessionStorage.setItem('adblock-warning-shown', 'true');" style="
                    padding: 12px 24px;
                    background: #f0f0f0;
                    color: #666;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                ">
                    暂时继续
                </button>
            </div>
            <p style="color: #999; font-size: 12px; margin-top: 24px;">
                感谢您的理解与支持 ❤️
            </p>
        `;
        
        overlay.appendChild(warning);
        document.body.appendChild(overlay);
        
        // 添加按钮悬停效果
        const buttons = warning.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            });
            btn.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = 'none';
            });
        });
    }
    
    // 页面加载完成后检测
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', detectAdBlock);
    } else {
        detectAdBlock();
    }
})();
