import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 静态文件服务
app.use(express.static('public'));
app.use('/data', express.static('data'));

// API: 获取所有可用的数据文件
app.get('/api/data-files', async (req, res) => {
  try {
    const dataDir = path.join(__dirname, 'data');
    const files = await fs.readdir(dataDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    const fileData = jsonFiles.map(filename => {
      const parts = filename.replace('.json', '').split('-');
      const period = parts[0];
      const date = parts.slice(1).join('-');
      return { filename, period, date };
    });

    res.json({
      daily: fileData.filter(f => f.period === 'daily').sort((a, b) => b.date.localeCompare(a.date)),
      weekly: fileData.filter(f => f.period === 'weekly').sort((a, b) => b.date.localeCompare(a.date)),
      monthly: fileData.filter(f => f.period === 'monthly').sort((a, b) => b.date.localeCompare(a.date))
    });
  } catch (error) {
    res.status(500).json({ error: '读取数据文件失败' });
  }
});

// API: 获取指定周期的数据
app.get('/api/trending/:period', async (req, res) => {
  try {
    const { period } = req.params;
    const { date } = req.query;

    if (!['daily', 'weekly', 'monthly'].includes(period)) {
      return res.status(400).json({ error: '无效的周期参数' });
    }

    const dataDir = path.join(__dirname, 'data');
    const files = await fs.readdir(dataDir);

    let targetFile;
    if (date) {
      targetFile = `${period}-${date}.json`;
    } else {
      // 获取最新的文件
      const periodFiles = files
        .filter(f => f.startsWith(`${period}-`) && f.endsWith('.json'))
        .sort()
        .reverse();
      targetFile = periodFiles[0];
    }

    if (!targetFile) {
      return res.status(404).json({ error: '未找到数据文件' });
    }

    const filePath = path.join(dataDir, targetFile);
    const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));

    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: '读取数据失败' });
  }
});

// API: 获取趋势对比数据
app.get('/api/trending/:period/compare', async (req, res) => {
  try {
    const { period } = req.params;
    const { days = 7 } = req.query;

    const dataDir = path.join(__dirname, 'data');
    const files = await fs.readdir(dataDir);

    const periodFiles = files
      .filter(f => f.startsWith(`${period}-`) && f.endsWith('.json'))
      .sort()
      .reverse()
      .slice(0, parseInt(days));

    const history = await Promise.all(
      periodFiles.map(async (file) => {
        const filePath = path.join(dataDir, file);
        return JSON.parse(await fs.readFile(filePath, 'utf-8'));
      })
    );

    // 聚合数据：统计出现频率最高的仓库
    const repoStats = new Map();

    history.forEach(data => {
      data.repositories.forEach(repo => {
        const key = repo.fullName;
        if (!repoStats.has(key)) {
          repoStats.set(key, {
            fullName: repo.fullName,
            author: repo.author,
            repoName: repo.repoName,
            description: repo.description,
            language: repo.language,
            url: repo.url,
            appearances: [],
            totalStars: 0
          });
        }

        const stats = repoStats.get(key);
        stats.appearances.push({
          date: data.date,
          position: repo.position,
          periodStars: repo.periodStars,
          stars: repo.stars
        });
      });
    });

    // 排序：出现次数多且排名靠前的优先
    const sortedRepos = Array.from(repoStats.values())
      .map(repo => ({
        ...repo,
        appearanceCount: repo.appearances.length,
        avgPosition: repo.appearances.reduce((sum, a) => sum + a.position, 0) / repo.appearances.length,
        totalStars: repo.appearances.reduce((sum, a) => sum + a.periodStars, 0)
      }))
      .sort((a, b) => {
        if (a.appearanceCount !== b.appearanceCount) {
          return b.appearanceCount - a.appearanceCount;
        }
        return a.avgPosition - b.avgPosition;
      });

    res.json({
      period,
      days: parseInt(days),
      dataPoints: history.length,
      repositories: sortedRepos.slice(0, 50) // 返回前50个
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: '获取对比数据失败' });
  }
});

// API: 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
});
