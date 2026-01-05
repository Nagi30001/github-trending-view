// 静态数据生成脚本 - 支持增量更新和历史数据管理
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const OUTPUT_FILE = path.join(process.cwd(), 'public', 'data.js');
const CONFIG_FILE = path.join(process.cwd(), 'data-config.json');

// 配置：保留最近多少天的数据
const CONFIG = {
  maxDailyFiles: 30,    // 保留最近 30 天的每日数据
  maxWeeklyFiles: 12,   // 保留最近 12 周的每周数据
  maxMonthlyFiles: 12,  // 保留最近 12 个月的每月数据
  enableLazyLoad: true, // 启用懒加载模式（可选）
};

async function loadDataConfig() {
  try {
    const content = await fs.readFile(CONFIG_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { lastUpdate: null, files: [] };
  }
}

async function saveDataConfig(config) {
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
}

async function cleanupOldData() {
  try {
    const files = await fs.readdir(DATA_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    // 按类型分组
    const dailyFiles = jsonFiles.filter(f => f.startsWith('daily-')).sort().reverse();
    const weeklyFiles = jsonFiles.filter(f => f.startsWith('weekly-')).sort().reverse();
    const monthlyFiles = jsonFiles.filter(f => f.startsWith('monthly-')).sort().reverse();

    // 删除超出限制的旧文件
    const deleteFile = async (file) => {
      try {
        await fs.unlink(path.join(DATA_DIR, file));
        console.log(`🗑️  删除旧文件: ${file}`);
      } catch (error) {
        console.warn(`⚠️  无法删除 ${file}:`, error.message);
      }
    };

    // 清理每日数据（保留最近 N 天）
    if (dailyFiles.length > CONFIG.maxDailyFiles) {
      const toDelete = dailyFiles.slice(CONFIG.maxDailyFiles);
      await Promise.all(toDelete.map(deleteFile));
    }

    // 清理每周数据
    if (weeklyFiles.length > CONFIG.maxWeeklyFiles) {
      const toDelete = weeklyFiles.slice(CONFIG.maxWeeklyFiles);
      await Promise.all(toDelete.map(deleteFile));
    }

    // 清理每月数据
    if (monthlyFiles.length > CONFIG.maxMonthlyFiles) {
      const toDelete = monthlyFiles.slice(CONFIG.maxMonthlyFiles);
      await Promise.all(toDelete.map(deleteFile));
    }

    return {
      daily: dailyFiles.slice(0, CONFIG.maxDailyFiles),
      weekly: weeklyFiles.slice(0, CONFIG.maxWeeklyFiles),
      monthly: monthlyFiles.slice(0, CONFIG.maxMonthlyFiles),
    };
  } catch (error) {
    console.error('❌ 清理旧数据失败:', error);
    return { daily: [], weekly: [], monthly: [] };
  }
}

async function generateStaticData() {
  try {
    const files = await fs.readdir(DATA_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    if (jsonFiles.length === 0) {
      console.log('⚠️  未找到数据文件，请先运行 npm run fetch');
      return;
    }

    console.log(`\n📊 开始生成静态数据...`);
    console.log(`   找到 ${jsonFiles.length} 个数据文件`);

    // 清理旧数据
    const { daily: dailyFiles, weekly: weeklyFiles, monthly: monthlyFiles } = await cleanupOldData();

    const data = {
      daily: [],
      weekly: [],
      monthly: [],
      meta: {
        generatedAt: new Date().toISOString(),
        totalFiles: jsonFiles.length,
        config: CONFIG
      }
    };

    // 读取并处理数据文件
    const processFile = async (file) => {
      const parts = file.replace('.json', '').split('-');
      const period = parts[0];
      const date = parts.slice(1).join('-');

      const filePath = path.join(DATA_DIR, file);
      const content = JSON.parse(await fs.readFile(filePath, 'utf-8'));

      // 只保存元数据和前 10 个项目（减小文件大小）
      const { repositories, ...restData } = content;

      return {
        filename: file,
        period,
        date,
        data: {
          ...restData,
          repositories: repositories.slice(0, 25), // 只保存前 25 个
          totalCount: repositories.length
        }
      };
    };

    // 处理每日数据
    console.log('\n📅 处理每日数据...');
    for (const file of dailyFiles) {
      const item = await processFile(file);
      data.daily.push(item);
      console.log(`   ✓ ${file}`);
    }

    // 处理每周数据
    console.log('\n📆 处理每周数据...');
    for (const file of weeklyFiles) {
      const item = await processFile(file);
      data.weekly.push(item);
      console.log(`   ✓ ${file}`);
    }

    // 处理每月数据
    console.log('\n🗓️  处理每月数据...');
    for (const file of monthlyFiles) {
      const item = await processFile(file);
      data.monthly.push(item);
      console.log(`   ✓ ${file}`);
    }

    // 生成 JS 文件
    const jsContent = `// 自动生成的数据文件 - 请勿手动编辑
// 生成时间: ${new Date().toISOString()}
// 包含数据: ${data.daily.length + data.weekly.length + data.monthly.length} 个文件
// 配置: 保留最近 ${CONFIG.maxDailyFiles} 天、${CONFIG.maxWeeklyFiles} 周、${CONFIG.maxMonthlyFiles} 月的数据

window.GITHUB_TRENDING_DATA = ${JSON.stringify(data, null, 2)};
`;

    await fs.writeFile(OUTPUT_FILE, jsContent);

    // 获取文件大小
    const stats = await fs.stat(OUTPUT_FILE);
    const fileSizeKB = (stats.size / 1024).toFixed(2);

    console.log('\n✅ 静态数据生成成功！');
    console.log(`   📁 输出文件: public/data.js`);
    console.log(`   📦 文件大小: ${fileSizeKB} KB`);
    console.log(`   📊 数据统计:`);
    console.log(`      - Daily: ${data.daily.length} 个文件`);
    console.log(`      - Weekly: ${data.weekly.length} 个文件`);
    console.log(`      - Monthly: ${data.monthly.length} 个文件`);
    console.log(`      - 总计: ${data.daily.length + data.weekly.length + data.monthly.length} 个文件`);

    // 保存配置
    await saveDataConfig({
      lastUpdate: new Date().toISOString(),
      files: jsonFiles,
      config: CONFIG
    });

  } catch (error) {
    console.error('❌ 生成失败:', error);
    process.exit(1);
  }
}

generateStaticData();
