// 测试翻译功能
import fetch from 'node-fetch';

const TRANSLATE_API = 'https://api.mymemory.translated.net/get';

async function translateToChinese(text) {
  if (!text || text.trim() === '') return text;

  try {
    console.log(`🌐 翻译: "${text}"`);

    // 如果已经包含中文字符，跳过翻译
    if (/[\u4e00-\u9fa5]/.test(text)) {
      console.log('   ⏭️  已是中文，跳过翻译');
      return text;
    }

    const response = await fetch(`${TRANSLATE_API}?q=${encodeURIComponent(text)}&langpair=en|zh-CN`);

    if (!response.ok) {
      console.warn('   ⚠️  翻译服务不可用');
      return text;
    }

    const data = await response.json();

    // 检查翻译结果
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      const translated = data.responseData.translatedText;
      if (translated !== text) {
        console.log(`   ✅ 翻译结果: "${translated}"`);
        return translated;
      }
    }

    // 尝试使用 matches 数据
    if (data.matches && data.matches.length > 0) {
      const bestMatch = data.matches.find(m => m.quality > 70);
      if (bestMatch && bestMatch.translation !== text) {
        console.log(`   ✅ 翻译结果: "${bestMatch.translation}"`);
        return bestMatch.translation;
      }
    }

    console.log('   ⚠️  未能翻译，返回原文');
    return text;
  } catch (error) {
    console.warn('   ⚠️  翻译失败:', error.message);
    return text;
  }
}

async function main() {
  console.log('🧪 测试翻译功能\n');

  const testCases = [
    'The open source coding agent.',
    'An open-source, self-hosted note-taking service.',
    'Financial data platform for analysts, quants and AI agents.',
    'Animation engine for explanatory math videos'
  ];

  for (const text of testCases) {
    await translateToChinese(text);
    console.log('');
  }

  console.log('✅ 测试完成！');
}

main().catch(console.error);
