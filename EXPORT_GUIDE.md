# 数据导出指南

## 📂 数据存储位置

### 在 GitHub 仓库中
- **原始 JSON 数据**: `https://github.com/Nagi30001/github-trending-view/tree/main/data`
- **格式**: `{period}-{date}.json` (例如: `daily-2026-01-05.json`)

### 在本地
- **目录**: `./data/`
- **文件**: 所有抓取的 JSON 文件

## 📤 数据导出方法

### 方法 1: 使用导出脚本（推荐）

```bash
# 导出所有数据为多种格式
npm run export
```

**导出内容**：
- ✅ `exports/trending-data-YYYY-MM-DD.json` - 合并的 JSON 数据
- ✅ `exports/daily-trending-YYYY-MM-DD.csv` - 每日数据 CSV
- ✅ `exports/weekly-trending-YYYY-MM-DD.csv` - 每周数据 CSV
- ✅ `exports/monthly-trending-YYYY-MM-DD.csv` - 每月数据 CSV
- ✅ `exports/daily-report-YYYY-MM-DD.md` - Markdown 报告
- ✅ `exports/weekly-report-YYYY-MM-DD.md` - Markdown 报告
- ✅ `exports/monthly-report-YYYY-MM-DD.md` - Markdown 报告

### 方法 2: 直接从 GitHub 下载

1. **访问数据目录**
   ```
   https://github.com/Nagi30001/github-trending-view/tree/main/data
   ```

2. **下载单个文件**
   - 点击文件
   - 点击 "Raw" 按钮
   - 右键 "另存为" 保存

3. **下载整个目录**
   ```bash
   # 克隆仓库
   git clone https://github.com/Nagi30001/github-trending-view.git

   # 数据在 data/ 目录
   cd github-trending-view/data
   ```

### 方法 3: 使用 Git 命令

```bash
# 导出最新数据
git clone --depth 1 https://github.com/Nagi30001/github-trending-view.git
cd github-trending-view/data

# 打包所有数据
zip -r trending-data.zip *.json

# 或者只导出特定时期的数据
cp daily-*.json ~/my-export/
```

### 方法 4: API 方式（需要本地服务器）

```bash
# 启动服务器
npm run serve

# 下载每日数据
curl http://localhost:3000/api/trending/daily > daily.json

# 下载特定日期的数据
curl "http://localhost:3000/api/trending/daily?date=2026-01-05" > daily-2026-01-05.json

# 下载对比数据
curl "http://localhost:3000/api/trending/daily/compare?days=7" > weekly-comparison.json
```

## 📊 导出格式说明

### JSON 格式
适合：
- 编程处理
- 数据分析
- 备份存储

结构：
```json
{
  "daily": [
    {
      "date": "2026-01-05",
      "data": { ... }
    }
  ],
  "weekly": [...],
  "monthly": [...]
}
```

### CSV 格式
适合：
- Excel 打开
- 数据可视化工具
- 表格处理

列：
- Date, Position, Author, Repo, Description, Language, Stars, Forks, PeriodStars, URL

### Markdown 格式
适合：
- 文档展示
- 团队分享
- 报告生成

包含：
- 项目排名
- Stars 统计
- 项目描述
- 链接

## 🔧 高级导出

### 自定义导出范围

编辑 `scripts/export-data.js`，修改要导出的数据：

```javascript
// 只导出最近 7 天的数据
const recentFiles = periodFiles.slice(0, 7);

// 只导出 Top 10 项目
content.repositories.slice(0, 10).forEach(repo => { ... });
```

### 导出为其他格式

可以扩展脚本支持：
- Excel (xlsx)
- SQLite 数据库
- Pandas DataFrame
- 图表 JSON

## 📝 使用示例

### 示例 1: 分析数据趋势

```bash
# 导出数据
npm run export

# 使用 Python 分析
cd exports
python3 << EOF
import pandas as pd
import json

# 读取 CSV
df = pd.read_csv('daily-trending-2026-01-05.csv')

# 分析语言分布
print(df['Language'].value_counts())

# 分析平均 Stars
print(df.groupby('Language')['Stars'].mean())
EOF
```

### 示例 2: 生成月度报告

```bash
# 导出 Markdown 报告
npm run export

# 查看报告
cat exports/monthly-report-*.md
```

### 示例 3: 备份到本地

```bash
# 创建备份目录
mkdir -p ~/backups/trending

# 复制数据
cp -r data/* ~/backups/trending/

# 压缩备份
cd ~/backups
zip -r trending-$(date +%Y%m%d).zip trending/
```

## 🔄 定期自动导出

### 使用 cron 定时导出（Linux/Mac）

```bash
# 编辑 crontab
crontab -e

# 添加每天凌晨 2 点导出
0 2 * * * cd /path/to/github-trending-view && npm run export
```

### 使用 GitHub Actions 自动导出

数据已经在 GitHub 仓库中自动备份，无需额外操作。

## 💡 提示

1. **推荐使用 `npm run export`** - 最方便，支持多种格式
2. **CSV 适合 Excel** - 可以直接用 Excel 打开分析
3. **JSON 适合程序处理** - 完整保留数据结构
4. **Markdown 适合分享** - 格式美观，易于阅读

## 📞 需要帮助？

如果需要其他格式的导出或有特殊需求，可以：
- 修改 `scripts/export-data.js` 脚本
- 提交 Issue 说明需求
- 自己扩展导出功能
