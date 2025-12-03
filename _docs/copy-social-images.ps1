# 复制社交媒体图片脚本

Write-Host "`n📸 复制社交媒体图片..." -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# 确保目标目录存在
$targetDir = "dist\assets\images"
if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    Write-Host "✅ 创建目录: $targetDir" -ForegroundColor Green
}

# 查找最近上传的图片
Write-Host "🔍 查找上传的图片..." -ForegroundColor Yellow

# 可能的图片位置
$possiblePaths = @(
    "pictrikit-social.png",
    "social-image.png",
    "og-image.png",
    "twitter-image.png",
    "*.png"
)

$sourceImage = $null
foreach ($pattern in $possiblePaths) {
    $found = Get-ChildItem -Path "." -Filter $pattern -File -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) {
        $sourceImage = $found.FullName
        Write-Host "✅ 找到图片: $($found.Name)" -ForegroundColor Green
        break
    }
}

if ($sourceImage) {
    # 复制为 og-image.png
    Copy-Item $sourceImage -Destination "$targetDir\og-image.png" -Force
    Write-Host "✅ 已复制到: $targetDir\og-image.png" -ForegroundColor Green
    
    # 复制为 twitter-image.png
    Copy-Item $sourceImage -Destination "$targetDir\twitter-image.png" -Force
    Write-Host "✅ 已复制到: $targetDir\twitter-image.png" -ForegroundColor Green
    
    Write-Host "`n🎉 社交媒体图片复制完成！" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  未找到图片文件" -ForegroundColor Yellow
    Write-Host "`n请手动执行以下操作:" -ForegroundColor Cyan
    Write-Host "1. 找到你上传的 PictriKit 图片" -ForegroundColor White
    Write-Host "2. 复制该图片两次到 dist\assets\images\" -ForegroundColor White
    Write-Host "   - 第一个命名为: og-image.png" -ForegroundColor White
    Write-Host "   - 第二个命名为: twitter-image.png" -ForegroundColor White
}

Write-Host "`n================================" -ForegroundColor Cyan
