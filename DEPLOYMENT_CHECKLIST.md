# GitHub Pages 部署检查清单

使用此清单确保你的 GitHub Trending 可视化项目成功部署到 GitHub Pages。

## ✅ 部署前检查

- [ ] 已安装 Node.js (v18+)
- [ ] 已安装 Git
- [ ] 已创建 GitHub 仓库
- [ ] 已克隆或初始化本地仓库

## ✅ 代码准备

- [ ] 已运行 `npm install` 安装依赖
- [ ] 已运行 `npm run build` 生成静态数据
- [ ] `public/data.js` 文件已生成
- [ ] `public/.nojekyll` 文件存在
- [ ] `.github/workflows/deploy.yml` 文件存在

## ✅ 推送到 GitHub

```bash
git add .
git commit -m "Prepare for GitHub Pages deployment"
git push origin main
```

- [ ] 代码已成功推送到 main 分支
- [ ] 在 GitHub 仓库页面可以看到所有文件

## ✅ 配置 GitHub Pages

1. 进入仓库 **Settings**
2. 左侧菜单点击 **Pages**
3. **Build and deployment** 部分：
   - [ ] **Source** 选择 **GitHub Actions**
   - [ ] （不要选择 "Deploy from a branch"）

## ✅ 检查 Actions 工作流

1. 进入仓库 **Actions** 标签
2. 查看 "Deploy to GitHub Pages" 工作流
   - [ ] 工作流已触发
   - [ ] 所有步骤都成功（绿色 ✅）
   - [ ] 没有错误或警告

## ✅ 访问网站

```
https://你的用户名.github.io/仓库名/
```

- [ ] 网站可以访问
- [ ] 页面显示正常（不是 404）
- [ ] 可以看到 Trending 数据
- [ ] 可以切换每日/每周/每月
- [ ] 可以选择日期

## ✅ 验证功能

在网站上测试以下功能：

- [ ] Tab 切换（每日/每周/每月）正常
- [ ] 日期选择器可用
- [ ] 统计卡片显示数据
- [ ] 仓库列表显示项目
- [ ] 语言分布图正常显示
- [ ] 点击项目链接可以跳转到 GitHub

## ✅ 检查自动更新

1. 进入 **Actions** 标签
2. 查看 "Fetch GitHub Trending" 工作流
   - [ ] 定时任务已设置（每 8 小时）
   - [ ] 可以手动触发
   - [ ] 工作流运行后会更新数据

## ✅ 故障排查（如果有问题）

### 网站显示 404

- [ ] 确认 Pages Source 选择的是 "GitHub Actions"
- [ ] 等待 2-3 分钟后刷新页面
- [ ] 检查 Actions 工作流是否成功

### 没有数据显示

- [ ] 检查 `public/data.js` 文件是否存在
- [ ] 运行 `npm run build` 重新生成数据
- [ ] 提交并推送 `public/data.js`

### Actions 工作流失败

- [ ] 点击失败的工作流查看详细日志
- [ ] 检查 `package.json` 依赖是否正确
- [ ] 确认仓库设置了正确的权限

### 样式或布局问题

- [ ] 清除浏览器缓存
- [ ] 使用隐私模式/无痕模式测试
- [ ] 检查浏览器控制台是否有错误

## 📱 移动端测试

- [ ] 在手机浏览器中访问网站
- [ ] 界面自适应正常
- [ ] 所有按钮可以点击
- [ ] 图表显示正常

## 🎉 部署成功！

如果以上所有项目都已完成，恭喜你成功部署了 GitHub Trending 可视化网站！

### 下一步：

- [ ] 分享你的网站链接
- [ ] 设置自定义域名（可选）
- [ ] 监控 Actions 工作流运行情况
- [ ] 定期查看数据更新

---

## 📞 需要帮助？

- 查看 [DEPLOYMENT.md](DEPLOYMENT.md) 获取详细部署指南
- 查看 [README.md](README.md) 了解项目功能
- 提交 Issue 寻求帮助

---

**最后更新**: 2025-01-05
