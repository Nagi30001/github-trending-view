#!/bin/bash

# 部署到 GitHub Pages 的脚本
# 将 public 目录部署到 gh-pages 分支

set -e

echo "🚀 开始部署到 GitHub Pages..."

# 检查是否在 git 仓库中
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ 错误：不在 git 仓库中"
    exit 1
fi

# 检查是否有未提交的更改
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  警告：有未提交的更改"
    echo "请先提交更改："
    echo "  git add ."
    echo "  git commit -m 'your message'"
    exit 1
fi

# 生成静态数据
echo "📊 生成静态数据..."
npm run build:data

# 部署到 gh-pages 分支
echo "📦 部署到 gh-pages 分支..."

# 使用 git subtree 推送（不使用 --force）
git subtree push --prefix public origin gh-pages

echo "✅ 部署完成！"
echo ""
echo "📝 下一步："
echo "1. 访问 https://github.com/Nagi30001/github-trending-view/settings/pages"
echo "2. 在 'Source' 下选择 'gh-pages' 分支"
echo "3. 在 'Folder' 选择 '/ (root)'"
echo "4. 点击 Save"
echo ""
echo "🌐 几分钟后，你的网站将在以下地址可用："
echo "   https://nagi30001.github.io/github-trending-view/"
