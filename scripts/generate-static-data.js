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
    // 读取所有日期文件夹
    const dateDirs = await fs.readdir(DATA_DIR);

    // 过滤出日期格式的文件夹（YYYY-MM-DD）
    const validDateDirs = dateDirs
      .filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d))
      .sort()
      .reverse();

    // 删除超出限制的旧日期文件夹
    const deleteDateDir = async (dateDir) => {
      try {
        const dirPath = path.join(DATA_DIR, dateDir);
        await fs.rm(dirPath, { recursive: true, force: true });
        console.log(`🗑️  删除旧日期文件夹: ${dateDir}`);
      } catch (error) {
        console.warn(`⚠️  无法删除 ${dateDir}:`, error.message);
      }
    };

    // 保留最近 N 个日期
    const keepDates = validDateDirs.slice(0, CONFIG.maxDailyFiles);
    const deleteDates = validDateDirs.slice(CONFIG.maxDailyFiles);

    if (deleteDates.length > 0) {
      await Promise.all(deleteDates.map(deleteDateDir));
    }

    return {
      dates: keepDates,
    };
  } catch (error) {
    console.error('❌ 清理旧数据失败:', error);
    return { dates: [] };
  }
}

async function generateStaticData() {
  try {
    // 检查是否有日期文件夹
    const dateDirs = await fs.readdir(DATA_DIR);
    const validDateDirs = dateDirs.filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d));

    if (validDateDirs.length === 0) {
      console.log('⚠️  未找到数据文件，请先运行 npm run fetch');
      return;
    }

    console.log(`\n📊 开始生成静态数据...`);
    console.log(`   找到 ${validDateDirs.length} 个日期文件夹`);

    // 清理旧数据，保留最近的日期
    const { dates } = await cleanupOldData();

    const data = {
      daily: [],
      weekly: [],
      monthly: [],
      meta: {
        generatedAt: new Date().toISOString(),
        totalDates: dates.length,
        config: CONFIG
      }
    };

    // 处理每个日期文件夹
    for (const date of dates) {
      try {
        const dateDirPath = path.join(DATA_DIR, date);

        // 检查是否存在 daily.json
        try {
          const dailyPath = path.join(dateDirPath, 'daily.json');
          const content = JSON.parse(await fs.readFile(dailyPath, 'utf-8'));
          const { repositories, ...restData } = content;

          data.daily.push({
            date,
            period: 'daily',
            data: {
              ...restData,
              repositories: repositories.slice(0, 25),
              totalCount: repositories.length
            }
          });
        } catch (error) {
          // 该日期没有 daily 数据
        }

        // 检查是否存在 weekly.json
        try {
          const weeklyPath = path.join(dateDirPath, 'weekly.json');
          const content = JSON.parse(await fs.readFile(weeklyPath, 'utf-8'));
          const { repositories, ...restData } = content;

          data.weekly.push({
            date,
            period: 'weekly',
            data: {
              ...restData,
              repositories: repositories.slice(0, 25),
              totalCount: repositories.length
            }
          });
        } catch (error) {
          // 该日期没有 weekly 数据
        }

        // 检查是否存在 monthly.json
        try {
          const monthlyPath = path.join(dateDirPath, 'monthly.json');
          const content = JSON.parse(await fs.readFile(monthlyPath, 'utf-8'));
          const { repositories, ...restData } = content;

          data.monthly.push({
            date,
            period: 'monthly',
            data: {
              ...restData,
              repositories: repositories.slice(0, 25),
              totalCount: repositories.length
            }
          });
        } catch (error) {
          // 该日期没有 monthly 数据
        }

      } catch (error) {
        console.warn(`   ⚠️  处理日期 ${date} 失败:`, error.message);
      }
    }

    // 生成 JS 文件
    const jsContent = `// 自动生成的数据文件 - 请勿手动编辑
// 生成时间: ${new Date().toISOString()}
// 包含数据: ${data.daily.length + data.weekly.length + data.monthly.length} 个文件
// 配置: 保留最近 ${CONFIG.maxDailyFiles} 天的数据

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
      dates: dates,
      config: CONFIG
    });

  } catch (error) {
    console.error('❌ 生成失败:', error);
    process.exit(1);
  }
}

generateStaticData();
