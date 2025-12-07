========================================
  PictriKit 部署包
========================================

此文件夹包含所有需要上传到服务器的文件。

========================================
部署前必须完成的 3 件事：
========================================

1. 生成 Favicon 图标
   - 需要生成 10 个不同尺寸的 PNG 图标
   - 保存到 assets/images/favicon/ 目录
   - 参考项目根目录的 _FAVICON-NOTE.txt

2. 创建 OG 分享图片
   - 文件名：og-image.png
   - 尺寸：1200x630px
   - 保存到 assets/images/og-image.png

3. 替换所有配置项
   - 所有 yourdomain.com → 你的实际域名
   - G-XXXXXXXXXX → 你的 GA4 Measurement ID
   - YOUR_VERIFICATION_CODE_HERE → Search Console 验证码
   - 所有联系邮箱 → 你的实际邮箱

========================================
上传步骤：
========================================

1. 完成上述 3 件事
2. 将此文件夹中的所有文件上传到服务器根目录
3. 确保 .htaccess 文件也被上传（Apache 服务器）
4. 配置 SSL 证书（推荐 Let's Encrypt）
5. 测试网站是否正常访问

========================================
文件清单：
========================================

HTML 文件：
- index.html (主页)
- app.html (应用界面)
- about.html (关于)
- tutorial.html (教程)
- features.html (功能)
- faq.html (FAQ)
- privacy.html (隐私政策)
- terms.html (使用条款)
- contact.html (联系我们)
- 404.html (错误页面)

配置文件：
- manifest.json (PWA 配置)
- robots.txt (搜索引擎规则)
- sitemap.xml (网站地图)
- favicon.svg (SVG 图标)
- .htaccess (Apache 配置)

文件夹：
- assets/ (CSS, JS, 图片)
  - css/ (样式文件)
  - js/ (JavaScript 文件)
  - images/ (图片资源)
- lang/ (多语言文件)

========================================
详细文档：
========================================

请参考项目根目录的以下文档：
- DEPLOYMENT-GUIDE.md (完整部署指南)
- DEPLOYMENT-CHECKLIST.md (部署检查清单)
- ADSENSE-GUIDE.md (AdSense 申请指南)
- _DEPLOYMENT-SUMMARY.md (快速部署总结)

========================================
需要帮助？
========================================

查看项目根目录的文档或访问：
- Google Search Console: https://search.google.com/search-console/
- Google Analytics: https://analytics.google.com/
- Google AdSense: https://www.google.com/adsense/

========================================
祝部署顺利！🚀
========================================
