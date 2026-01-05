# GitHub Trending 可视化项目

这是一个零成本的 GitHub Trending 数据收集和可视化展示系统。利用 GitHub 仓库存储数据，通过 GitHub Actions 自动定时收集趋势数据，并提供美观的可视化界面。

## ✨ 特性

- 📊 **自动数据收集**：每天、每周、每月自动收集 GitHub Trending 数据
- 💰 **零成本存储**：使用 GitHub 仓库免费存储数据
- 🔄 **自动化运行**：通过 GitHub Actions 定时自动收集，无需服务器
- 🎨 **美观可视化**：现代化界面展示趋势数据
- 📈 **趋势分析**：支持查看不同时间维度的热门项目
- 🌐 **简单部署**：可部署到 GitHub Pages 或任何静态托管平台

## 🏗️ 项目架构

```
github-starts-view/
├── .github/workflows/       # GitHub Actions 配置
│   └── fetch-trending.yml   # 定时任务配置
├── data/                    # 数据存储目录
│   └── *.json              # 按日期存储的 Trending 数据
├── public/                  # 前端静态文件
│   └── index.html          # 可视化页面
├── scripts/                 # 工具脚本
│   └── fetch-trending.js   # 数据抓取脚本
├── server.js               # Express API 服务器
└── package.json            # 项目配置
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 手动抓取数据

```bash
npm run fetch
```

这会抓取当天的 daily、weekly、monthly 三种维度的 Trending 数据，并保存到 `data/` 目录。

### 3. 启动本地服务器

```bash
npm run serve
```

访问 `http://localhost:3000` 查看可视化界面。

## ⚙️ 配置 GitHub Actions 自动收集

### 推送到 GitHub

1. 将代码推送到你的 GitHub 仓库
2. 在 GitHub 仓库页面启用 Actions

### 自动收集设置

GitHub Actions 默认配置：
- **运行频率**：每 8 小时一次（UTC 0:00, 8:00, 16:00）
- **手动触发**：支持在 Actions 页面手动运行

修改运行频率，编辑 `.github/workflows/fetch-trending.yml` 中的 cron 表达式：

```yaml
schedule:
  - cron: '0 */8 * * *'  # 每 8 小时
  # 每天一次: '0 0 * * *'
  # 每 6 小时: '0 */6 * * *'
```

## 📊 数据格式

每个数据文件包含以下结构：

```json
{
  "date": "2025-01-05",
  "timestamp": "2025-01-05T08:00:00.000Z",
  "period": "daily",
  "repositories": [
    {
      "position": 1,
      "author": "owner",
      "repoName": "repository",
      "fullName": "owner/repository",
      "description": "项目描述",
      "language": "TypeScript",
      "stars": 50000,
      "forks": 3000,
      "periodStars": 500,
      "url": "https://github.com/owner/repository"
    }
  ]
}
```

## 🎯 API 接口

本地服务器提供以下 API：

### 获取所有数据文件
```
GET /api/data-files
```

### 获取指定周期的最新数据
```
GET /api/trending/:period
```
参数：
- `period`: daily | weekly | monthly
- `date` (可选): 指定日期，格式 YYYY-MM-DD

### 获取趋势对比数据
```
GET /api/trending/:period/compare
```
参数：
- `period`: daily | weekly | monthly
- `days` (可选): 对比天数，默认 7 天

## 🌐 部署选项

### 方案 1: 本地/服务器运行

```bash
npm run serve
```

### 方案 2: 部署到 GitHub Pages

1. 修改 `server.js` 或使用静态页面生成
2. 启用 GitHub Pages
3. 每次更新数据后自动部署

### 方案 3: 部署到 Vercel/Netlify

由于需要 API 支持，建议使用 Vercel 的 Serverless Functions 或配置后端 API。

## 📝 使用场景

1. **开发者**：发现热门开源项目，学习最新技术
2. **投资者**：关注技术趋势，发现投资机会
3. **研究者**：分析开源社区发展趋势
4. **求职者**：了解市场需求的技术栈

## 🔧 技术栈

- **数据抓取**：Node.js + Cheerio
- **自动化**：GitHub Actions
- **后端**：Express.js
- **前端**：原生 JavaScript + CSS3
- **存储**：Git 仓库

## 📊 数据示例

可视化界面展示：

- **Top 25** 热门项目列表
- **语言分布**图表
- **统计数据**：总仓库数、主要语言、新增 Stars
- **时间维度**：每日/每周/每月切换

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- 数据来源：[GitHub Trending](https://github.com/trending)
- 灵感来源：所有开源贡献者

---

**注意**：本项目仅供学习交流使用，请遵守 GitHub 的使用条款和速率限制。
