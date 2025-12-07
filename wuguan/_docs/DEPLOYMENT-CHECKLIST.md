# 🚀 ScreenStitch 上线部署清单

## 📦 生产环境文件清单

### ✅ 必需文件

#### HTML 页面
- [x] index.html - 首页
- [x] app.html - 应用主页面
- [x] features.html - 功能介绍页
- [x] tutorial.html - 使用教程页
- [x] faq.html - 常见问题页
- [x] contact.html - 联系我们页
- [x] about.html - 关于我们页
- [x] privacy.html - 隐私政策页
- [x] terms.html - 服务条款页
- [x] 404.html - 404错误页

#### 资源文件
- [x] assets/css/ - 所有CSS文件
  - main.css
  - homepage.css
  - pages.css
- [x] assets/js/ - 所有JavaScript文件
  - app.js
  - i18n.js
  - components.js
  - analytics.js
  - adblock-detect.js
- [x] assets/images/ - 所有图片资源
- [x] lang/ - 多语言文件
  - en.json
  - zh-CN.json
  - ja.json
  - ko.json (如果有)

#### 配置文件
- [x] manifest.json - PWA配置
- [x] robots.txt - 搜索引擎爬虫配置
- [x] sitemap.xml - 网站地图
- [x] .htaccess - Apache服务器配置
- [x] favicon.svg - 网站图标
- [x] ads.js - 广告配置

#### 服务器文件（可选）
- [x] server.js - Node.js服务器（开发用）

---

## 🔧 上线前配置检查

### 1. SEO 优化
- [ ] 更新 index.html 中的域名
  - 将 `https://yourdomain.com` 替换为实际域名
- [ ] 更新 sitemap.xml 中的域名
- [ ] 更新 robots.txt 中的 Sitemap 地址
- [ ] 添加 Google Search Console 验证码
- [ ] 添加 Google Analytics 跟踪代码

### 2. 社交媒体元数据
- [ ] 准备 Open Graph 图片 (1200x630px)
  - 保存到 `/assets/images/og-image.png`
- [ ] 准备 Twitter Card 图片 (1200x600px)
  - 保存到 `/assets/images/twitter-image.png`
- [ ] 更新社交媒体链接
  - Twitter: @screenstitch
  - Facebook: /screenstitch
  - GitHub: /screenstitch

### 3. Favicon 和图标
- [ ] 准备完整的 favicon 套件
  - favicon.ico (16x16, 32x32)
  - icon-16x16.png
  - icon-32x32.png
  - icon-192x192.png
  - icon-512x512.png
  - apple-touch-icon.png (180x180)

### 4. 性能优化
- [ ] 压缩所有 CSS 文件
- [ ] 压缩所有 JavaScript 文件
- [ ] 优化所有图片（使用 WebP 格式）
- [ ] 启用 Gzip/Brotli 压缩
- [ ] 配置浏览器缓存策略

### 5. 安全配置
- [ ] 配置 HTTPS（SSL证书）
- [ ] 添加安全响应头
  - Content-Security-Policy
  - X-Frame-Options
  - X-Content-Type-Options
- [ ] 配置 CORS 策略

### 6. 功能测试
- [ ] 测试所有页面链接
- [ ] 测试语言切换功能
- [ ] 测试图片上传功能
- [ ] 测试截图拼接功能
- [ ] 测试导出功能
- [ ] 测试移动端响应式
- [ ] 测试不同浏览器兼容性
  - Chrome
  - Firefox
  - Safari
  - Edge

### 7. 监控和分析
- [ ] 配置 Google Analytics
- [ ] 配置错误监控（如 Sentry）
- [ ] 配置性能监控
- [ ] 配置用户行为分析

---

## 📝 需要替换的占位符

### index.html
```
查找并替换：
- "https://yourdomain.com" → 实际域名
- "YOUR_VERIFICATION_CODE_HERE" → Google Search Console 验证码
- "support@yourdomain.com" → 实际邮箱地址
```

### sitemap.xml
```
查找并替换：
- "https://yourdomain.com" → 实际域名
```

### robots.txt
```
查找并替换：
- "https://yourdomain.com/sitemap.xml" → 实际 sitemap 地址
```

---

## 🌐 部署步骤

### 方案 A: 静态网站托管（推荐）

#### Vercel 部署
```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel --prod
```

#### Netlify 部署
```bash
# 1. 安装 Netlify CLI
npm install -g netlify-cli

# 2. 登录
netlify login

# 3. 部署
netlify deploy --prod
```

#### GitHub Pages 部署
```bash
# 1. 推送到 GitHub
git add .
git commit -m "Ready for production"
git push origin main

# 2. 在 GitHub 仓库设置中启用 GitHub Pages
# Settings → Pages → Source: main branch
```

### 方案 B: 传统服务器部署

#### 使用 FTP/SFTP
1. 连接到服务器
2. 上传 `dist/` 文件夹中的所有文件
3. 配置 Web 服务器（Apache/Nginx）

#### 使用 SSH
```bash
# 1. 压缩文件
tar -czf screenstitch.tar.gz dist/

# 2. 上传到服务器
scp screenstitch.tar.gz user@server:/var/www/

# 3. 解压
ssh user@server
cd /var/www/
tar -xzf screenstitch.tar.gz
```

---

## 🔍 上线后检查

### 立即检查
- [ ] 访问网站，确认正常显示
- [ ] 测试所有主要功能
- [ ] 检查移动端显示
- [ ] 测试语言切换
- [ ] 检查控制台是否有错误

### 24小时内检查
- [ ] 提交网站到 Google Search Console
- [ ] 提交网站到 Bing Webmaster Tools
- [ ] 检查 Google Analytics 数据
- [ ] 监控服务器性能
- [ ] 检查错误日志

### 一周内检查
- [ ] 检查搜索引擎收录情况
- [ ] 分析用户行为数据
- [ ] 收集用户反馈
- [ ] 优化性能瓶颈

---

## 📞 技术支持

如有问题，请联系：
- Email: support@yourdomain.com
- GitHub Issues: https://github.com/screenstitch/issues

---

## 📄 许可证

MIT License - 详见 LICENSE 文件

---

**最后更新**: 2024-12-02
**版本**: 1.0.0
