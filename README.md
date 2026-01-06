# GitHub Trending 可视化项目

这是一个零成本的 GitHub Trending 数据收集和可视化展示系统。利用 GitHub 仓库存储数据，通过 GitHub Actions 自动定时收集趋势数据，并提供美观的可视化界面。

## ✨ 特性

- 📊 **自动数据收集**：每天、每周、每月自动收集 GitHub Trending 数据
- 📈 **排名变化追踪**：对比昨日排名，显示上升/下降/新上榜状态
- 💰 **零成本存储**：使用 GitHub 仓库免费存储数据
- 🔄 **完全自动化**：通过 GitHub Actions 定时自动收集和部署，无需服务器
- 🌐 **自动翻译**：项目描述自动翻译为中文
- 🎨 **美观可视化**：现代化界面、玻璃态设计、橙色主题
- 📱 **响应式设计**：完美适配桌面和移动设备
- 🚀 **即时部署**：数据更新后自动部署到 GitHub Pages

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

### 工作流说明

项目包含两个自动化工作流：

1. **Fetch GitHub Trending and Deploy** (自动运行)
   - 定时抓取数据并自动部署到 GitHub Pages
   - 每 8 小时运行一次（UTC 0:00, 8:00, 16:00 → 北京时间 8:00, 16:00, 0:00）
   - 支持手动触发
   - 当脚本文件有更新时也会触发

2. **Manual Deploy** (仅手动触发)
   - 紧急手动部署时使用
   - 需要在 GitHub Actions 页面手动运行

### 自动化流程

```
定时触发 → 抓取数据 → 生成静态文件 → 提交到 main → 部署到 gh-pages → GitHub Pages 更新
```

**关键特性：**
- ✅ 自动抓取最新数据
- ✅ 自动计算排名变化（与昨日对比）
- ✅ 自动翻译描述为中文
- ✅ 自动部署到 GitHub Pages
- ✅ 无需手动干预

### 修改运行频率

编辑 `.github/workflows/fetch-trending.yml` 中的 cron 表达式：

```yaml
schedule:
  - cron: '0 */8 * * *'  # 每 8 小时
  # 每天一次: '0 0 * * *'
  # 每 6 小时: '0 */6 * * *'
  # 每小时: '0 * * * *'
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

## 🌐 部署到 GitHub Pages

### 快速部署（推荐）

项目已配置好完整的自动化部署流程，只需几步即可上线：

**配置步骤：**

1. **推送代码到 GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **启用 GitHub Pages**
   - 进入仓库的 **Settings**（设置）
   - 左侧菜单找到 **Pages**
   - **Source** 选择 **Deploy from a branch**
   - **Branch** 选择 **gh-pages** 和 **/ (root)**
   - 点击 **Save**

3. **首次手动部署**（可选）
   ```bash
   npm run deploy:full
   ```
   或者在 GitHub Actions 页面手动触发 "Manual Deploy" 工作流

4. **访问你的网站**
   ```
   https://nagi30001.github.io/github-trending-view/
   ```

### 自动化工作原理

```
GitHub Actions 定时触发 (每8小时)
    ↓
1. 抓取 GitHub Trending 数据
2. 计算排名变化（对比昨日）
3. 翻译描述为中文
4. 生成静态数据文件
5. 提交数据到 main 分支
6. 部署 public/ 到 gh-pages 分支
7. GitHub Pages 自动更新
```

**特性：**
- ✅ 完全自动，无需手动干预
- ✅ 每 8 小时自动更新数据
- ✅ 自动部署，网站内容始终最新
- ✅ 支持手动触发紧急更新
- ✅ 排名变化可视化

### 本地开发

```bash
# 启动本地服务器（支持实时 API）
npm run dev

# 访问 http://localhost:3000
```

### 手动部署命令

```bash
# 只部署（不重新抓取数据）
npm run deploy

# 完整部署（抓取数据 + 部署）
npm run deploy:full
```

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
