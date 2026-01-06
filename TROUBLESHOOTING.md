# 故障排除指南

## GitHub Actions 相关问题

### 1. 工作流没有自动运行

**可能原因：**
- GitHub Actions 未启用
- cron 表达式配置问题
- 时区差异

**解决方法：**

1. 检查 Actions 是否启用：
   - 进入仓库 → Settings → Actions → General
   - 确保 "Actions permissions" 设置为 "Allow all actions"

2. 手动触发工作流：
   - 进入 Actions 标签页
   - 选择 "Fetch GitHub Trending and Deploy"
   - 点击 "Run workflow" 按钮

3. 检查 cron 时间：
   - UTC 时间 vs 北京时间相差 8 小时
   - 当前配置：UTC 0:00, 8:00, 16:00
   - 对应北京时间：8:00, 16:00, 0:00

### 2. 部署后页面显示 README 内容

**原因：** GitHub Pages 配置错误

**解决方法：**

1. 进入 Settings → Pages
2. **Source** 选择 "Deploy from a branch"
3. **Branch** 选择：
   - Branch: `gh-pages`
   - Folder: `/ (root)`
4. 点击 Save

### 3. 数据更新后页面没有变化

**可能原因：**
- 浏览器缓存
- GitHub Pages 尚未重新构建
- 部署失败

**解决方法：**

1. 清除浏览器缓存：
   - 硬刷新：Ctrl+Shift+R (Windows) 或 Cmd+Shift+R (Mac)
   - 或打开隐私/无痕模式测试

2. 检查 GitHub Actions 运行状态：
   - 进入 Actions 标签页
   - 查看最近的工作流是否成功运行
   - 检查是否有红色错误标识

3. 检查 gh-pages 分支：
   - 进入 Code 标签页
   - 切换到 gh-pages 分支
   - 确认 data.js 文件存在且是最新版本

4. 手动触发部署：
   - Actions → Manual Deploy → Run workflow

### 4. 排名变化全部显示"新上榜"

**原因：** 第一次运行或缺少历史数据

**说明：**
- 首次运行时，没有昨天的数据，所有项目会被标记为"新上榜"
- 第二次运行（第二天）开始，会显示真实的排名变化
- 这是正常现象，无需修复

## 本地开发问题

### 1. npm install 失败

**解决方法：**

```bash
# 清除缓存
npm cache clean --force

# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

### 2. 端口 3000 被占用

**解决方法：**

```bash
# 查找占用端口的进程
lsof -i :3000

# 杀死进程（替换 PID）
kill -9 <PID>

# 或者修改 server.js 中的端口号
```

### 3. 翻译 API 不工作

**症状：** 描述保持英文，没有翻译

**原因：**
- MyMemory Translation API 有访问限制
- 网络连接问题

**解决方法：**
- 这是正常的，API 有每日限制
- 翻译失败时会保留原文，不影响使用
- 等待第二天或手动重新运行

## 数据问题

### 1. 抓取失败

**可能原因：**
- GitHub 网页结构变化
- 网络连接问题
- 被 GitHub 限流

**解决方法：**

1. 检查网络连接
2. 等待几分钟后重试
3. 查看 Actions 日志获取详细错误信息

### 2. 数据格式错误

**症状：** 页面显示"暂无数据"或加载失败

**解决方法：**

1. 检查 `data/` 目录下的 JSON 文件
2. 删除损坏的文件
3. 重新运行 `npm run fetch`

## GitHub Pages 配置

### 推荐配置

```
Settings → Pages
├── Source: Deploy from a branch
├── Branch: gh-pages / (root)
└── Save
```

### 不推荐

❌ Source: GitHub Actions
- 会导致页面显示 README 而不是应用
- 已废弃的部署方式

## 获取帮助

如果以上方法都无法解决问题：

1. 查看 [GitHub Actions 文档](https://docs.github.com/en/actions)
2. 查看 [GitHub Pages 文档](https://docs.github.com/en/pages)
3. 在仓库提 Issue

## 常用命令速查

```bash
# 本地运行
npm run dev              # 启动开发服务器

# 数据相关
npm run fetch            # 抓取数据
npm run build:data       # 生成静态数据
npm run build            # 抓取 + 生成

# 部署相关
npm run deploy           # 部署到 gh-pages
npm run deploy:full      # 完整部署（抓取 + 部署）

# Git 相关
git status               # 查看状态
git log --oneline -10    # 查看最近提交
```
