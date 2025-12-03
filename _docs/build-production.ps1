# ScreenStitch 生产环境构建脚本
# PowerShell Script for Windows

Write-Host "🚀 开始构建 ScreenStitch 生产环境..." -ForegroundColor Green
Write-Host ""

# 创建 dist 目录
$distDir = "dist"
if (Test-Path $distDir) {
    Write-Host "📁 清理旧的 dist 目录..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $distDir
}

Write-Host "📁 创建新的 dist 目录..." -ForegroundColor Cyan
New-Item -ItemType Directory -Path $distDir | Out-Null

# 复制 HTML 文件
Write-Host "📄 复制 HTML 文件..." -ForegroundColor Cyan
$htmlFiles = @(
    "index.html",
    "app.html",
    "features.html",
    "tutorial.html",
    "faq.html",
    "contact.html",
    "about.html",
    "privacy.html",
    "terms.html",
    "404.html"
)

foreach ($file in $htmlFiles) {
    if (Test-Path $file) {
        Copy-Item $file -Destination $distDir
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file (未找到)" -ForegroundColor Red
    }
}

# 复制资源文件夹
Write-Host ""
Write-Host "📦 复制资源文件夹..." -ForegroundColor Cyan

$folders = @("assets", "lang")
foreach ($folder in $folders) {
    if (Test-Path $folder) {
        Copy-Item -Recurse $folder -Destination $distDir
        Write-Host "  ✓ $folder/" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $folder/ (未找到)" -ForegroundColor Red
    }
}

# 复制配置文件
Write-Host ""
Write-Host "⚙️  复制配置文件..." -ForegroundColor Cyan
$configFiles = @(
    "manifest.json",
    "robots.txt",
    "sitemap.xml",
    ".htaccess",
    "favicon.svg",
    "ads.js"
)

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Copy-Item $file -Destination $distDir
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ $file (未找到，可选)" -ForegroundColor Yellow
    }
}

# 创建部署说明文件
Write-Host ""
Write-Host "📝 创建部署说明..." -ForegroundColor Cyan

$deploymentInfo = @"
# ScreenStitch 生产环境部署包

## 📦 包含文件

### HTML 页面
- index.html - 首页
- app.html - 应用主页面
- features.html - 功能介绍
- tutorial.html - 使用教程
- faq.html - 常见问题
- contact.html - 联系我们
- about.html - 关于我们
- privacy.html - 隐私政策
- terms.html - 服务条款
- 404.html - 404错误页

### 资源文件
- assets/ - CSS、JS、图片等资源
- lang/ - 多语言文件

### 配置文件
- manifest.json - PWA配置
- robots.txt - 搜索引擎配置
- sitemap.xml - 网站地图
- .htaccess - Apache配置
- favicon.svg - 网站图标

## 🚀 部署步骤

1. 将此文件夹中的所有文件上传到服务器
2. 确保服务器支持 HTTPS
3. 配置域名指向
4. 更新 SEO 相关配置（见 DEPLOYMENT-CHECKLIST.md）

## ⚠️ 重要提醒

上线前请务必：
1. 替换所有 "yourdomain.com" 为实际域名
2. 添加 Google Analytics 跟踪代码
3. 添加 Google Search Console 验证码
4. 准备并上传 og-image.png 和 twitter-image.png
5. 测试所有功能

## 📞 技术支持

如有问题，请查看 DEPLOYMENT-CHECKLIST.md

---
构建时间: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
版本: 1.0.0
"@

$deploymentInfo | Out-File -FilePath "$distDir/README.txt" -Encoding UTF8

Write-Host ""
Write-Host "✅ 构建完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📂 生产环境文件位于: $distDir/" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 下一步:" -ForegroundColor Yellow
Write-Host "  1. 查看 DEPLOYMENT-CHECKLIST.md 完成上线前配置" -ForegroundColor White
Write-Host "  2. 测试 dist/ 目录中的文件" -ForegroundColor White
Write-Host "  3. 部署到服务器" -ForegroundColor White
Write-Host ""
Write-Host "🎉 祝部署顺利！" -ForegroundColor Green
