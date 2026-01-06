// 数据迁移脚本：将旧的数据结构转换为新的按日期分文件夹的结构
// 旧结构：data/daily-2026-01-05.json
// 新结构：data/2026-01-05/daily.json

import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

async function migrateData() {
  try {
    console.log('🔄 开始迁移数据...\n');

    // 读取 data 目录
    const files = await fs.readdir(DATA_DIR);

    // 过滤出旧格式的 JSON 文件
    const oldFiles = files.filter(f => /^(daily|weekly|monthly)-\d{4}-\d{2}-\d{2}\.json$/.test(f));

    if (oldFiles.length === 0) {
      console.log('✅ 没有需要迁移的旧格式文件');
      return;
    }

    console.log(`📁 找到 ${oldFiles.length} 个旧格式文件\n`);

    let migratedCount = 0;
    let errorCount = 0;

    for (const file of oldFiles) {
      try {
        // 解析文件名：daily-2026-01-05.json
        const match = file.match(/^(daily|weekly|monthly)-(\d{4}-\d{2}-\d{2})\.json$/);
        if (!match) {
          console.warn(`⚠️  跳过无法解析的文件: ${file}`);
          continue;
        }

        const [, period, date] = match;

        // 创建日期目录
        const dateDir = path.join(DATA_DIR, date);
        await fs.mkdir(dateDir, { recursive: true });

        // 读取旧文件
        const oldPath = path.join(DATA_DIR, file);
        const content = await fs.readFile(oldPath, 'utf-8');

        // 写入新文件：data/2026-01-05/daily.json
        const newPath = path.join(dateDir, `${period}.json`);
        await fs.writeFile(newPath, content, 'utf-8');

        console.log(`✅ ${file} → ${date}/${period}.json`);

        // 删除旧文件
        await fs.unlink(oldPath);

        migratedCount++;
      } catch (error) {
        console.error(`❌ 迁移失败 ${file}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n✅ 迁移完成！`);
    console.log(`   成功: ${migratedCount} 个文件`);
    if (errorCount > 0) {
      console.log(`   失败: ${errorCount} 个文件`);
    }

    // 显示新的目录结构
    console.log('\n📂 新的目录结构:');
    const dateDirs = (await fs.readdir(DATA_DIR))
      .filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d))
      .sort()
      .reverse()
      .slice(0, 5); // 只显示最近5个日期

    for (const date of dateDirs) {
      const files = await fs.readdir(path.join(DATA_DIR, date));
      console.log(`   ${date}/`);
      files.forEach(f => console.log(`     └─ ${f}`));
    }

    if (dateDirs.length > 0) {
      console.log(`   ... 还有 ${dateDirs.length - 5} 个日期文件夹`);
    }

  } catch (error) {
    console.error('❌ 迁移失败:', error);
    process.exit(1);
  }
}

migrateData();
