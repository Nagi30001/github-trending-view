// 测试脚本 - 查看原始 HTML 格式
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

async function testFetch() {
  const url = 'https://github.com/trending?since=weekly';

  console.log(`🔍 抓取: ${url}\n`);

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
  });

  const html = await response.text();
  const $ = cheerio.load(html);

  console.log('📊 第一个项目的 stars 相关文本:\n');

  $('article.Box-row').first().find('*').each((i, el) => {
    const text = $(el).text().trim();
    if (text.match(/stars/i) && text.length < 100) {
      console.log(`  "${text}"`);
    }
  });

  console.log('\n📌 span.d-inline-block.float-sm-right 的内容:');
  const floatText = $('article.Box-row').first().find('span.d-inline-block.float-sm-right').text();
  console.log(`  "${floatText}"`);

  console.log('\n🔍 第一个项目完整的HTML结构:');
  const firstRepo = $('article.Box-row').first();
  console.log('float-sm-right element HTML:', firstRepo.find('span.d-inline-block.float-sm-right').html());
  console.log('All span elements with star info:');
  firstRepo.find('span').each((i, el) => {
    const className = $(el).attr('class') || '';
    const text = $(el).text().trim();
    if (text.match(/star/i) || className.includes('float')) {
      console.log(`  class="${className}" -> "${text}"`);
    }
  });
}

testFetch().catch(console.error);
