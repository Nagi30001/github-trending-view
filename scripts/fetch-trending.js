import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';

const GITHUB_TRENDING_URL = 'https://github.com/trending';

// 翻译 API 配置 - 使用 MyMemory Translation API（免费，无需密钥，每日限制）
const TRANSLATE_API = 'https://api.mymemory.translated.net/get';

/**
 * 抓取 GitHub Trending 数据
 * @param {string} period - since: daily, weekly, monthly
 */
async function fetchTrending(period = 'daily') {
  try {
    const url = `${GITHUB_TRENDING_URL}?since=${period}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });

    const html = await response.text();
    const $ = cheerio.load(html);
    const repositories = [];

    $('article.Box-row').each((index, element) => {
      const $el = $(element);

      // 仓库名和作者
      const repoFullName = $el.find('h2 a').attr('href').slice(1);
      const [author, repoName] = repoFullName.split('/');

      // 描述
      const description = $el.find('p').first().text().trim() || '';

      // 程序语言
      const language = $el.find('[itemprop="programmingLanguage"]').first().text().trim();

      // Stars 数量
      const starsText = $el.find('a[href$="/stargazers"]').text().trim();
      const stars = parseNumber(starsText);

      // Forks 数量
      const forksText = $el.find('a[href$="/forks"]').text().trim();
      const forks = parseNumber(forksText);

      // 今日/本周/本月新增 stars
      // GitHub Trending 页面结构可能变化，尝试多个选择器
      let todayStarsText = $el.find('span.d-inline-block.float-sm-right').text().trim();
      if (!todayStarsText) {
        todayStarsText = $el.find('span[data-view-component]').filter(function() {
          return $(this).text().match(/stars\s+(today|week|month)/i);
        }).text().trim();
      }
      if (!todayStarsText) {
        // 尝试获取包含 "stars in" 的文本
        $el.find('span').each(function() {
          const text = $(this).text();
          if (text.match(/stars\s+(in|today|this\sweek|this\smonth)/i)) {
            todayStarsText = text.trim();
            return false;
          }
        });
      }

      const todayStars = parseNumber(todayStarsText);

      repositories.push({
        position: index + 1,
        author,
        repoName,
        fullName: repoFullName,
        description,
        language,
        stars,
        forks,
        periodStars: todayStars,
        url: `https://github.com/${repoFullName}`
      });
    });

    return repositories;
  } catch (error) {
    console.error(`抓取 ${period} trending 数据失败:`, error);
    throw error;
  }
}

/**
 * 翻译文本为中文
 * @param {string} text - 要翻译的文本
 * @returns {Promise<string>} 翻译后的文本
 */
async function translateToChinese(text) {
  if (!text || text.trim() === '') return text;

  try {
    // 如果已经包含中文字符，跳过翻译
    if (/[\u4e00-\u9fa5]/.test(text)) {
      return text;
    }

    const response = await fetch(`${TRANSLATE_API}?q=${encodeURIComponent(text)}&langpair=en|zh-CN`);

    if (!response.ok) {
      console.warn('   ⚠️  翻译服务不可用，保留原文');
      return text;
    }

    const data = await response.json();

    // 检查翻译结果
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      const translated = data.responseData.translatedText;
      // 如果翻译结果和原文相同，说明可能是翻译失败
      if (translated !== text) {
        return translated;
      }
    }

    // 尝试使用 matches 数据
    if (data.matches && data.matches.length > 0) {
      const bestMatch = data.matches.find(m => m.quality > 70);
      if (bestMatch && bestMatch.translation !== text) {
        return bestMatch.translation;
      }
    }

    return text;
  } catch (error) {
    console.warn('   ⚠️  翻译失败，保留原文:', error.message);
    return text;
  }
}

/**
 * 批量翻译（限制并发数）
 * @param {Array} items - 需要翻译的项目数组
 * @param {number} concurrency - 并发数
 * @returns {Promise<Array>} 翻译后的数组
 */
async function batchTranslate(items, concurrency = 3) {
  const results = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const translated = await Promise.all(
      batch.map(async (item) => {
        if (item.description) {
          process.stdout.write(`   🌐 翻译中 ${item.position}/${items.length}...\r`);
          const translatedDesc = await translateToChinese(item.description);
          return { ...item, description: translatedDesc };
        }
        return item;
      })
    );
    results.push(...translated);
    // 添加延迟避免请求过快
    if (i + concurrency < items.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  process.stdout.write('   ✅ 翻译完成\n');
  return results;
}

/**
 * 解析数字 (k, M 等单位)
 */
function parseNumber(text) {
  if (!text) return 0;

  const lowerText = text.toLowerCase();

  // 检查是否有 k/m 单位（使用 lookbehind + lookahead 确保是独立的单位字符）
  // (?<=\d|\.) 表示前面必须是数字或小数点
  // (?=\s|$) 表示后面必须是空格或字符串结束
  const hasK = /(?<=\d|\.)k(?=\s|$)/.test(lowerText);
  const hasM = /(?<=\d|\.)m(?=\s|$)/.test(lowerText);

  // 提取数字部分（包括逗号和小数点）
  let numStr = lowerText.replace(/[^0-9.,]/g, '');
  if (!numStr) return 0;

  // 如果没有 k/m 单位，逗号是千位分隔符，直接移除
  if (!hasK && !hasM) {
    numStr = numStr.replace(/,/g, '');
    const number = parseFloat(numStr);
    return isNaN(number) ? 0 : Math.round(number);
  }

  // 有 k/m 单位时，小数点是十进制，逗号需要移除
  numStr = numStr.replace(/,/g, '');
  const numberPart = parseFloat(numStr);
  if (isNaN(numberPart)) return 0;

  // 根据单位进行转换
  if (hasM) {
    return Math.round(numberPart * 1000000);
  } else if (hasK) {
    return Math.round(numberPart * 1000);
  }

  return Math.round(numberPart);
}

/**
 * 获取昨天的数据并计算排名变化（支持新的目录结构）
 * @param {string} period - 周期类型
 * @param {Array} currentData - 当前数据
 * @returns {Promise<Array>} 包含排名变化的数据
 */
async function calculateRankChange(period, currentData) {
  const dataDir = path.join(process.cwd(), 'data');
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // 新的文件路径：data/YYYY-MM-DD/period.json
  const yesterdayFile = path.join(dataDir, yesterdayStr, `${period}.json`);

  try {
    const yesterdayData = JSON.parse(await fs.readFile(yesterdayFile, 'utf-8'));
    const yesterdayRankMap = new Map();

    // 创建昨天的排名映射
    yesterdayData.repositories.forEach((repo, index) => {
      yesterdayRankMap.set(repo.fullName, index + 1);
    });

    // 为今天的数据添加排名变化
    return currentData.map(repo => {
      const yesterdayPosition = yesterdayRankMap.get(repo.fullName);

      if (yesterdayPosition === undefined) {
        // 新上榜
        return {
          ...repo,
          rankChange: 'new',
          rankChangeValue: null
        };
      } else {
        const change = yesterdayPosition - repo.position;

        let rankChange;
        if (change > 0) {
          rankChange = 'up'; // 上升
        } else if (change < 0) {
          rankChange = 'down'; // 下降
        } else {
          rankChange = 'same'; // 不变
        }

        return {
          ...repo,
          rankChange,
          rankChangeValue: change,
          yesterdayPosition
        };
      }
    });
  } catch (error) {
    // 如果没有昨天的数据，所有项目标记为新上榜
    console.log('   ℹ️  未找到昨天数据，所有项目标记为新上榜');
    return currentData.map(repo => ({
      ...repo,
      rankChange: 'new',
      rankChangeValue: null
    }));
  }
}

/**
 * 保存数据到文件（新的目录结构：data/YYYY-MM-DD/period.json）
 */
async function saveData(period, data) {
  const date = new Date().toISOString().split('T')[0];
  const timestamp = new Date().toISOString();

  // 新的目录结构：data/YYYY-MM-DD/
  const dateDir = path.join(process.cwd(), 'data', date);
  await fs.mkdir(dateDir, { recursive: true });

  // 文件名：daily.json, weekly.json, monthly.json
  const fileName = `${period}.json`;
  const filePath = path.join(dateDir, fileName);

  const fileData = {
    date,
    timestamp,
    period,
    repositories: data
  };

  await fs.writeFile(filePath, JSON.stringify(fileData, null, 2));
  console.log(`✅ 数据已保存到: ${date}/${fileName}`);

  return filePath;
}

/**
 * 获取历史数据（支持新的目录结构）
 */
async function getHistory(period) {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    const dates = await fs.readdir(dataDir);

    // 过滤出日期格式的文件夹（YYYY-MM-DD）
    const dateDirs = dates
      .filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d))
      .sort()
      .reverse()
      .slice(0, 30); // 最近30天

    const history = [];
    for (const dateDir of dateDirs) {
      try {
        const filePath = path.join(dataDir, dateDir, `${period}.json`);
        const content = JSON.parse(await fs.readFile(filePath, 'utf-8'));
        history.push(content);
      } catch (error) {
        // 某个日期可能没有该周期的数据，跳过
        continue;
      }
    }
    return history;
  } catch (error) {
    return [];
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始抓取 GitHub Trending 数据...\n');

  const periods = ['daily', 'weekly', 'monthly'];

  for (const period of periods) {
    console.log(`📊 抓取 ${period} trending...`);
    const data = await fetchTrending(period);
    console.log(`   找到 ${data.length} 个仓库`);

    // 翻译描述
    console.log('   🌐 开始翻译描述为中文...');
    const translatedData = await batchTranslate(data, 3);

    // 计算排名变化
    console.log('   📈 计算排名变化...');
    const dataWithRankChange = await calculateRankChange(period, translatedData);

    // 显示排名变化统计
    const rankUpCount = dataWithRankChange.filter(r => r.rankChange === 'up').length;
    const rankDownCount = dataWithRankChange.filter(r => r.rankChange === 'down').length;
    const newCount = dataWithRankChange.filter(r => r.rankChange === 'new').length;
    const sameCount = dataWithRankChange.filter(r => r.rankChange === 'same').length;

    console.log(`   上升: ${rankUpCount} | 下降: ${rankDownCount} | 新上榜: ${newCount} | 不变: ${sameCount}`);

    await saveData(period, dataWithRankChange);

    // 显示前3个
    console.log('   Top 3:');
    dataWithRankChange.slice(0, 3).forEach((repo, i) => {
      const desc = repo.description ? ` - ${repo.description.substring(0, 50)}...` : '';
      const rankSymbol = repo.rankChange === 'up' ? '↑' : repo.rankChange === 'down' ? '↓' : repo.rankChange === 'new' ? '✨' : '→';
      const rankText = repo.rankChangeValue ? ` (${repo.rankChangeValue > 0 ? '+' : ''}${repo.rankChangeValue})` : '';
      console.log(`     ${i + 1}. ${repo.fullName} ${rankSymbol}${rankText} - ⭐ ${repo.periodStars} (${repo.language || 'N/A'})${desc}`);
    });
    console.log('');
  }

  console.log('✅ 所有数据抓取完成！');
}

main().catch(console.error);
