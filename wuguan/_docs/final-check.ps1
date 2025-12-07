# PictriKit 最终检查脚本

Write-Host "`n" -NoNewline
Write-Host "🔍 PictriKit 网站最终检查报告" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

$allGood = $true

# 1. 检查品牌名称
Write-Host "1. 品牌名称检查:" -ForegroundColor Yellow
$indexContent = Get-Content "dist\index.html" -Raw -Encoding UTF8
$pictrikitCount = ([regex]::Matches($indexContent, "PictriKit")).Count
if ($pictrikitCount -gt 0) {
    Write-Host "   ✅ 品牌名称已更新为 PictriKit (出现 $pictrikitCount 次)" -ForegroundColor Green
} else {
    Write-Host "   ❌ 品牌名称未更新" -ForegroundColor Red
    $allGood = $false
}

# 2. 检查域名
Write-Host "`n2. 域名检查:" -ForegroundColor Yellow
$domainCount = ([regex]::Matches($indexContent, "pictrikit\.com")).Count
if ($domainCount -gt 0) {
    Write-Host "   ✅ 域名已更新为 pictrikit.com (出现 $domainCount 次)" -ForegroundColor Green
} else {
    Write-Host "   ❌ 域名未更新" -ForegroundColor Red
    $allGood = $false
}

# 检查是否还有旧域名
if ($indexContent -match "yourdomain\.com") {
    Write-Host "   ⚠️  警告: 仍有 yourdomain.com 未替换" -ForegroundColor Yellow
    $allGood = $false
}

# 3. 检查 Google Analytics
Write-Host "`n3. Google Analytics 检查:" -ForegroundColor Yellow
if ($indexContent -match "G-F3GLBLC9JW") {
    Write-Host "   ✅ Google Analytics (G-F3GLBLC9JW) 已添加" -ForegroundColor Green
    if ($indexContent -match "googletagmanager\.com/gtag/js") {
        Write-Host "   ✅ GA 脚本标签正确" -ForegroundColor Green
    }
} else {
    Write-Host "   ❌ Google Analytics 未添加" -ForegroundColor Red
    $allGood = $false
}

# 4. 检查社交媒体图片
Write-Host "`n4. 社交媒体图片检查:" -ForegroundColor Yellow
if (Test-Path "dist\assets\images\og-image.png") {
    $ogSize = (Get-Item "dist\assets\images\og-image.png").Length / 1KB
    Write-Host "   ✅ og-image.png 存在 ($([math]::Round($ogSize, 2)) KB)" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  og-image.png 需要手动添加到 dist\assets\images\" -ForegroundColor Yellow
    Write-Host "      建议尺寸: 1200x630px" -ForegroundColor Gray
}

if (Test-Path "dist\assets\images\twitter-image.png") {
    $twSize = (Get-Item "dist\assets\images\twitter-image.png").Length / 1KB
    Write-Host "   ✅ twitter-image.png 存在 ($([math]::Round($twSize, 2)) KB)" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  twitter-image.png 需要手动添加到 dist\assets\images\" -ForegroundColor Yellow
    Write-Host "      建议尺寸: 1200x600px" -ForegroundColor Gray
}

# 5. 检查关键HTML文件
Write-Host "`n5. 关键HTML文件检查:" -ForegroundColor Yellow
$htmlFiles = @("index.html", "app.html", "features.html", "tutorial.html", "faq.html", "contact.html", "about.html", "privacy.html", "terms.html", "404.html")
$htmlOk = $true
foreach ($f in $htmlFiles) {
    if (Test-Path "dist\$f") {
        Write-Host "   ✅ $f" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $f 缺失" -ForegroundColor Red
        $htmlOk = $false
        $allGood = $false
    }
}

# 6. 检查配置文件
Write-Host "`n6. 配置文件检查:" -ForegroundColor Yellow
$configFiles = @("robots.txt", "sitemap.xml", "manifest.json", ".htaccess")
foreach ($f in $configFiles) {
    if (Test-Path "dist\$f") {
        Write-Host "   ✅ $f" -ForegroundColor Green
        
        # 检查配置文件中的域名
        $content = Get-Content "dist\$f" -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
        if ($content -and $content -match "yourdomain\.com") {
            Write-Host "      ⚠️  警告: $f 中仍有 yourdomain.com" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ❌ $f 缺失" -ForegroundColor Red
        $allGood = $false
    }
}

# 7. 检查资源文件夹
Write-Host "`n7. 资源文件夹检查:" -ForegroundColor Yellow
$folders = @("assets\css", "assets\js", "assets\images", "lang")
foreach ($folder in $folders) {
    if (Test-Path "dist\$folder") {
        $fileCount = (Get-ChildItem "dist\$folder" -File).Count
        Write-Host "   ✅ $folder ($fileCount 个文件)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $folder 缺失" -ForegroundColor Red
        $allGood = $false
    }
}

# 8. 检查语言文件
Write-Host "`n8. 多语言文件检查:" -ForegroundColor Yellow
$langFiles = @("en.json", "zh-CN.json", "ja.json")
foreach ($f in $langFiles) {
    if (Test-Path "dist\lang\$f") {
        Write-Host "   ✅ $f" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $f 缺失" -ForegroundColor Red
        $allGood = $false
    }
}

# 9. 检查 Meta 标签
Write-Host "`n9. SEO Meta 标签检查:" -ForegroundColor Yellow
if ($indexContent -match '<meta property="og:image"') {
    Write-Host "   ✅ Open Graph 图片标签存在" -ForegroundColor Green
}
if ($indexContent -match '<meta name="twitter:image"') {
    Write-Host "   ✅ Twitter Card 图片标签存在" -ForegroundColor Green
}
if ($indexContent -match 'application/ld\+json') {
    Write-Host "   ✅ 结构化数据存在" -ForegroundColor Green
}

# 最终总结
Write-Host "`n================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "✅ 所有检查通过！网站已准备好部署！" -ForegroundColor Green
} else {
    Write-Host "⚠️  发现一些问题，请查看上面的详细信息" -ForegroundColor Yellow
}
Write-Host "================================`n" -ForegroundColor Cyan

# 显示下一步
Write-Host "📋 下一步操作:" -ForegroundColor Cyan
Write-Host "1. 如果图片未添加，请手动复制 og-image.png 和 twitter-image.png 到 dist\assets\images\" -ForegroundColor White
Write-Host "2. 运行本地测试: cd dist && python -m http.server 8000" -ForegroundColor White
Write-Host "3. 部署到服务器: vercel --prod 或 netlify deploy --prod" -ForegroundColor White
Write-Host ""
