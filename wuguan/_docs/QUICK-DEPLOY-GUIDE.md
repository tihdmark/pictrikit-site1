# 🚀 ScreenStitch 快速部署指南

## 📦 已完成的准备工作

✅ 生产环境文件已打包到 `dist/` 目录
✅ 所有必需文件已复制
✅ .htaccess 配置已优化
✅ 部署清单已创建

---

## ⚡ 5分钟快速部署

### 步骤 1: 配置域名信息（必需）

在 `dist/` 目录中，使用文本编辑器批量替换：

```
查找: https://yourdomain.com
替换为: https://你的实际域名.com
```

需要替换的文件：
- index.html
- sitemap.xml
- robots.txt

### 步骤 2: 添加 Google Analytics（推荐）

在 `dist/index.html` 的 `</head>` 标签前添加：

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### 步骤 3: 准备图片资源（推荐）

创建以下图片并放入 `dist/assets/images/`：

1. **og-image.png** (1200x630px) - 用于社交媒体分享
2. **twitter-image.png** (1200x600px) - 用于 Twitter 卡片
3. **favicon 套件**：
   - icon-16x16.png
   - icon-32x32.png
   - icon-192x192.png
   - icon-512x512.png
   - apple-touch-icon.png (180x180px)

### 步骤 4: 选择部署方式

#### 方案 A: Vercel（最简单，推荐）

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 进入 dist 目录
cd dist

# 3. 部署
vercel --prod
```

#### 方案 B: Netlify

```bash
# 1. 安装 Netlify CLI
npm install -g netlify-cli

# 2. 进入 dist 目录
cd dist

# 3. 部署
netlify deploy --prod --dir .
```

#### 方案 C: GitHub Pages

```bash
# 1. 创建 GitHub 仓库
# 2. 推送 dist 目录内容到仓库
cd dist
git init
git add .
git commit -m "Initial deployment"
git branch -M main
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main

# 3. 在 GitHub 仓库设置中启用 Pages
# Settings → Pages → Source: main branch
```

#### 方案 D: 传统服务器（FTP/SFTP）

1. 使用 FTP 客户端（如 FileZilla）
2. 连接到服务器
3. 上传 `dist/` 目录中的所有文件到网站根目录
4. 确保文件权限正确（644 for files, 755 for directories）

---

## ✅ 部署后立即检查

### 1. 基础功能测试
```
□ 访问首页是否正常显示
□ 点击"Launch App"是否能打开应用
□ 测试语言切换功能
□ 测试图片上传功能
□ 测试截图拼接功能
□ 测试导出功能
```

### 2. 移动端测试
```
□ 在手机浏览器中打开网站
□ 测试响应式布局
□ 测试触摸操作
```

### 3. SEO 检查
```
□ 查看页面源代码，确认 meta 标签正确
□ 访问 /robots.txt 确认可访问
□ 访问 /sitemap.xml 确认可访问
□ 使用 Google 的富媒体测试工具检查结构化数据
```

### 4. 性能检查
```
□ 使用 Google PageSpeed Insights 测试
□ 使用 GTmetrix 测试加载速度
□ 检查浏览器控制台是否有错误
```

---

## 📊 提交到搜索引擎

### Google Search Console
1. 访问 https://search.google.com/search-console
2. 添加网站
3. 验证所有权
4. 提交 sitemap.xml

### Bing Webmaster Tools
1. 访问 https://www.bing.com/webmasters
2. 添加网站
3. 验证所有权
4. 提交 sitemap.xml

### 百度站长平台（如果需要）
1. 访问 https://ziyuan.baidu.com
2. 添加网站
3. 验证所有权
4. 提交 sitemap.xml

---

## 🔧 常见问题

### Q: 网站显示 404 错误
A: 检查文件是否正确上传，确认服务器配置正确

### Q: CSS/JS 文件无法加载
A: 检查文件路径是否正确，确认服务器支持相应的 MIME 类型

### Q: HTTPS 不工作
A: 确认 SSL 证书已正确安装，检查 .htaccess 重定向规则

### Q: 语言切换不工作
A: 检查 lang/ 目录是否正确上传，确认 i18n.js 文件可访问

---

## 📞 需要帮助？

- 查看完整部署清单: `DEPLOYMENT-CHECKLIST.md`
- 查看技术文档: `README.md`
- 提交问题: GitHub Issues

---

## 🎉 恭喜！

如果所有检查都通过，你的网站已经成功上线！

**下一步建议：**
1. 监控网站性能和用户行为
2. 定期备份网站数据
3. 关注用户反馈并持续优化
4. 定期更新内容和功能

祝你的网站运营顺利！🚀
