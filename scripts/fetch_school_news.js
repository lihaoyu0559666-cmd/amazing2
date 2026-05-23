const fs = require('fs');
const path = require('path');

const DATA_DIR = 'f:\\反重力\\御丞的奇妙比赛项目\\data';

async function run() {
  console.log('--- Correcting Category: Moving articles from "北京" to "学校" ---');
  
  const jsonPath = path.join(DATA_DIR, 'news_common.json');
  const jsPath = path.join(DATA_DIR, 'news_common.js');
  
  if (!fs.existsSync(jsonPath)) {
      console.error('news_common.json does not exist! Cannot correct category.');
      return;
  }

  // Load news_common database
  const items = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  
  let correctedCount = 0;
  for (let item of items) {
      if (item.id >= 301 && item.id <= 310) {
          item.category = '学校';
          correctedCount++;
      }
  }

  console.log(`Successfully moved ${correctedCount} articles from "北京" to "学校" category.`);

  // Save changes
  const jsonStr = JSON.stringify(items, null, 2);
  fs.writeFileSync(jsonPath, jsonStr + '\n', 'utf8');
  fs.writeFileSync(jsPath, `window.newsCommonData = ${jsonStr};\n`, 'utf8');

  console.log('Successfully saved database updates.');
}

run();
