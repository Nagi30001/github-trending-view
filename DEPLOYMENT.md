# GitHub Pages 部署指南

本指南将帮助你将 GitHub Trending 可视化项目部署到 GitHub Pages。

## 📋 前提条件

- GitHub 账号
- 已安装 Git
- 已安装 Node.js (v18 或更高版本)

## 🚀 快速部署（推荐）

### 第 1 步：推送代码到 GitHub

如果还没有创建 GitHub 仓库：

```bash
# 在 GitHub 上创建一个新仓库（例如：github-trending-view）

# 初始化本地 Git 仓库（如果还没有）
git init
git add .
git commit -m "Initial commit"

# 添加远程仓库
git remote add origin https://github.com/你的用户名/仓库名.git

# 推送代码
git branch -M main
git push -u origin main
```

### 第 2 步：启用 GitHub Pages

1. 打开你的 GitHub 仓库页面
2. 点击 **Settings** (设置)
3. 在左侧菜单中找到 **Pages**
4. 在 **Build and deployment** 部分：
   - **Source**: 选择 **GitHub Actions**
   - （不要选择 Deploy from a branch）

### 第 3 步：等待部署完成

1. 点击仓库顶部的 **Actions** 标签
2. 你会看到工作流正在运行
3. 等待 "Deploy to GitHub Pages" 工作流完成（约 1-2 分钟）
4. 如果成功，你会看到绿色的 ✅

### 第 4 步：访问你的网站

部署成功后，你的网站将在以下地址可用：

```
https://你的用户名.github.io/仓库名/
```

例如：
- 仓库：`nagi30001/github-trending-view`
- 网址：`https://nagi30001.github.io/github-trending-view/`

## 🔄 自动更新

项目已配置好自动化工作流：

### 数据自动更新

- **文件**: `.github/workflows/fetch-trending.yml`
- **频率**: 每 8 小时自动运行（UTC 0:00, 8:00, 16:00）
- **功能**:
  - 抓取最新的 GitHub Trending 数据
  - 提交数据到仓库
  - 触发部署更新

### 网站自动部署

- **文件**: `.github/workflows/deploy.yml`
- **触发条件**:
  - 推送代码到 main 分支
  - 数据更新后自动触发
- **功能**:
  - 生成静态数据文件
  - 部署到 GitHub Pages

## 🛠️ 工作原理

```
推送代码/定时任务
    ↓
GitHub Actions 触发
    ↓
抓取 GitHub Trending 数据
    ↓
生成 public/data.js (静态数据)
    ↓
部署 public/ 到 GitHub Pages
    ↓
网站更新完成
```

## 📁 项目结构说明

```
github-starts-view/
├── .github/workflows/
│   ├── fetch-trending.yml   # 数据抓取定时任务
│   └── deploy.yml            # 部署到 GitHub Pages
├── public/
│   ├── index.html            # 主页面（支持静态+动态模式）
│   ├── data.js               # 自动生成的静态数据
│   └── .nojekyll             # 告诉 GitHub Pages 不要处理
├── data/                     # JSON 数据文件
└── scripts/
    ├── fetch-trending.js     # 数据抓取脚本
    └── generate-static-data.js  # 静态数据生成脚本
```

## 🐛 常见问题

### 1. 部署后看到 404 错误

**原因**: GitHub Pages Source 配置错误

**解决**:
- Settings → Pages → Source
- 选择 **GitHub Actions**（不是 Deploy from a branch）

### 2. 网站显示但没有数据

**原因**: 静态数据文件未生成

**解决**:
```bash
# 本地生成数据
npm run build

# 推送更新
git add public/data.js
git commit -m "Add static data"
git push
```

### 3. Actions 工作流失败

**检查**:
- 查看工作流日志了解具体错误
- 确保仓库中启用了 Actions
- 检查 `package.json` 中的依赖是否正确

### 4. 定时任务不运行

**原因**: GitHub Actions 定时任务有延迟

**说明**:
- 定时任务不是精确到秒
- 通常会在 scheduled 时间后的几分钟内运行
- GitHub Actions 有负载限制，可能延迟

### 5. 如何手动触发数据更新？

**方式 1**: 在 Actions 页面手动运行
1. 进入 Actions 标签
2. 选择 "Fetch GitHub Trending" 工作流
3. 点击 "Run workflow" 按钮

**方式 2**: 本地手动更新
```bash
npm run fetch
npm run build:data
git add .
git commit -m "Update data"
git push
```

## 📊 查看部署状态

### GitHub Actions 日志

1. 进入仓库的 **Actions** 标签
2. 点击具体的工作流运行
3. 查看详细日志

### GitHub Pages 部署历史

1. 进入 **Settings** → **Pages**
2. 查看 "Deployment" 部分
3. 可以看到历史部署记录

## 🎨 自定义域名（可选）

如果你想使用自定义域名：

1. **购买域名**（例如从 Namecheap, GoDaddy 等）
2. **在仓库中添加 CNAME 文件**:
   ```bash
   echo "yourdomain.com" > public/CNAME
   git add public/CNAME
   git commit -m "Add custom domain"
   git push
   ```
3. **配置 DNS**:
   - 在域名注册商处添加 CNAME 记录
   - 指向 `你的用户名.github.io`

## 📈 监控和维护

### 检查数据更新

访问 `https://你的用户名.github.io/仓库名/data.js` 查看数据文件是否更新。

### 查看数据文件大小

```bash
ls -lh public/data.js
```

正常大小应该在 10KB - 100KB 之间（取决于数据量）。

### 定期检查

建议每月检查一次：
- Actions 工作流是否正常运行
- 数据是否定期更新
- 网站是否可以正常访问

## 🔐 权限设置

确保 GitHub Actions 有正确的权限：

1. Settings → Actions → General
2. 在 "Workflow permissions" 部分
3. 选择 **Read and write permissions**

## 💡 提示和最佳实践

1. **首次部署**: 可能需要 5-10 分钟才能访问网站
2. **数据更新**: 每次更新会自动触发部署，无需手动操作
3. **本地测试**: 使用 `npm run serve` 本地测试
4. **查看源码**: 浏览器 F12 可以查看静态数据结构

## 🆘 获取帮助

如果遇到问题：

1. 查看 [GitHub Pages 文档](https://docs.github.com/pages)
2. 查看 [GitHub Actions 文档](https://docs.github.com/actions)
3. 检查项目的 Issues 页面
4. 提交新的 Issue 寻求帮助

---

祝你部署顺利！🎉
