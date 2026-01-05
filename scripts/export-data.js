// 数据导出脚本 - 导出 Trending 数据为多种格式
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const EXPORT_DIR = path.join(process.cwd(), 'exports');

/**
 * 导出为单个 JSON 文件
 */
async function exportToMergedJSON() {
  try {
    await fs.mkdir(EXPORT_DIR, { recursive: true });

    const files = await fs.readdir(DATA_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    const allData = {
      exportedAt: new Date().toISOString(),
      daily: [],
      weekly: [],
      monthly: []
    };

    for (const file of jsonFiles) {
      const parts = file.replace('.json', '').split('-');
      const period = parts[0];
      const date = parts.slice(1).join('-');

      const content = JSON.parse(await fs.readFile(path.join(DATA_DIR, file), 'utf-8'));
      allData[period].push({
        date,
        filename: file,
        data: content
      });
    }

    // 排序
    allData.daily.sort((a, b) => b.date.localeCompare(a.date));
    allData.weekly.sort((a, b) => b.date.localeCompare(a.date));
    allData.monthly.sort((a, b) => b.date.localeCompare(a.date));

    const outputPath = path.join(EXPORT_DIR, `trending-data-${new Date().toISOString().split('T')[0]}.json`);
    await fs.writeFile(outputPath, JSON.stringify(allData, null, 2));

    console.log(`✅ 导出为 JSON: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('❌ JSON 导出失败:', error.message);
  }
}

/**
 * 导出为 CSV 格式
 */
async function exportToCSV(period = 'daily') {
  try {
    await fs.mkdir(EXPORT_DIR, { recursive: true });

    const files = await fs.readdir(DATA_DIR);
    const periodFiles = files
      .filter(f => f.startsWith(`${period}-`) && f.endsWith('.json'))
      .sort()
      .reverse();

    if (periodFiles.length === 0) {
      console.log(`⚠️  没有找到 ${period} 数据`);
      return;
    }

    const csvRows = ['Date,Position,Author,Repo,Description,Language,Stars,Forks,PeriodStars,URL'];

    for (const file of periodFiles) {
      const content = JSON.parse(await fs.readFile(path.join(DATA_DIR, file), 'utf-8'));
      const date = content.date;

      content.repositories.forEach(repo => {
        csvRows.push([
          date,
          repo.position,
          repo.author,
          repo.repoName,
          `"${(repo.description || '').replace(/"/g, '""')}"`,
          repo.language || '',
          repo.stars,
          repo.forks,
          repo.periodStars,
          repo.url
        ].join(','));
      });
    }

    const csvContent = csvRows.join('\n');
    const outputPath = path.join(EXPORT_DIR, `${period}-trending-${new Date().toISOString().split('T')[0]}.csv`);
    await fs.writeFile(outputPath, csvContent);

    console.log(`✅ 导出为 CSV: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('❌ CSV 导出失败:', error.message);
  }
}

/**
 * 导出为 Markdown 报告
 */
async function exportToMarkdown(period = 'daily') {
  try {
    await fs.mkdir(EXPORT_DIR, { recursive: true });

    const files = await fs.readdir(DATA_DIR);
    const periodFiles = files
      .filter(f => f.startsWith(`${period}-`) && f.endsWith('.json'))
      .sort()
      .reverse();

    if (periodFiles.length === 0) {
      console.log(`⚠️  没有找到 ${period} 数据`);
      return;
    }

    let markdown = `# GitHub Trending - ${period.charAt(0).toUpperCase() + period.slice(1)} Report\n\n`;
    markdown += `生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`;

    const latestFile = periodFiles[0];
    const content = JSON.parse(await fs.readFile(path.join(DATA_DIR, latestFile), 'utf-8'));

    markdown += `## ${content.date} 热门项目\n\n`;

    content.repositories.forEach(repo => {
      markdown += `### ${repo.position}. [${repo.fullName}](${repo.url})\n\n`;
      markdown += `- **描述**: ${repo.description || 'N/A'}\n`;
      markdown += `- **语言**: ${repo.language || 'N/A'}\n`;
      markdown += `- **⭐ Stars**: ${repo.stars.toLocaleString()}\n`;
      markdown += `- **🍴 Forks**: ${repo.forks.toLocaleString()}\n`;
      markdown += `- **📈 本${period === 'daily' ? '日' : period === 'weekly' ? '周' : '月'}新增**: ${repo.periodStars.toLocaleString()}\n\n`;
    });

    const outputPath = path.join(EXPORT_DIR, `${period}-report-${new Date().toISOString().split('T')[0]}.md`);
    await fs.writeFile(outputPath, markdown);

    console.log(`✅ 导出为 Markdown: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('❌ Markdown 导出失败:', error.message);
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('📊 开始导出 GitHub Trending 数据...\n');

  // 检查数据目录
  try {
    await fs.access(DATA_DIR);
  } catch {
    console.log('❌ 数据目录不存在，请先运行 npm run fetch');
    return;
  }

  // 导出所有格式
  await exportToMergedJSON();
  await exportToCSV('daily');
  await exportToCSV('weekly');
  await exportToCSV('monthly');
  await exportToMarkdown('daily');
  await exportToMarkdown('weekly');
  await exportToMarkdown('monthly');

  console.log('\n✅ 所有导出完成！');
  console.log(`📁 导出目录: ${EXPORT_DIR}`);
}

main().catch(console.error);
