// 直接测试 parseNumber 函数
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

// 测试用例
const testCases = [
  '5,400 stars this week',
  '5.4k stars this week',
  '1,234 stars today',
  '2.5k stars',
  '100 stars',
  '1.2M stars',
  '1,500,000 stars'
];

console.log('🧪 测试 parseNumber 函数:\n');
testCases.forEach(test => {
  const result = parseNumber(test);
  console.log(`  "${test}" => ${result.toLocaleString()}`);

  // Debug info
  const lowerText = test.toLowerCase();
  console.log(`    [DEBUG] hasK: ${/(?<=\d|\.)k(?=\s|$)/.test(lowerText)}, hasM: ${/(?<=\d|\.)m(?=\s|$)/.test(lowerText)}`);
  console.log(`    [DEBUG] numStr: ${lowerText.replace(/[^0-9.,]/g, '')}`);
});

// 导出函数用于其他脚本测试
export { parseNumber };
