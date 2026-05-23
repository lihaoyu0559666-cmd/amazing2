const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { URL } = require('url');

const DATA_DIR = 'f:\\反重力\\御丞的奇妙比赛项目\\data';
const IMAGE_DIR = 'f:\\反重力\\御丞的奇妙比赛项目\\images\\auto';

const items = [
  {
    "id": 301,
    "site": "中国农业大学新闻网",
    "source": "中国农业大学新闻网",
    "title": "学校召开第四届党委第九轮内部巡视工作动员部署会",
    "date": "2026-05-22",
    "url": "https://news.cau.edu.cn/ttgznew/02f2dd94216b454296ea7b35a580c4fc.htm",
    "summary": "中国农业大学党委召开第九轮内部巡视工作动员部署会，对校团委、校工会、继续教育学院等单位开展常规巡视作出部署。",
    "category": "北京",
    "tags": ["党委工作", "内部巡视", "学校治理"]
  },
  {
    "id": 302,
    "site": "中国农业大学新闻网",
    "source": "中国农业大学新闻网",
    "title": "新闻发布厅 | 《科学》发表中国农大丁杨林/杨淑华团队研究成果：发现植物高温信号感知“纳米开关”",
    "date": "2026-05-22",
    "url": "https://news.cau.edu.cn/ttgznew/4dd4515f56394b5080ed521ab3756f75.htm",
    "summary": "中国农大丁杨林、杨淑华教授团队在《科学》发表研究成果，揭示植物高温信号感知与耐热调控的新机制。",
    "category": "北京",
    "tags": ["科研进展", "高温信号", "纳米开关"]
  },
  {
    "id": 303,
    "site": "中国农业大学新闻网",
    "source": "中国农业大学新闻网",
    "title": "学校党委常委会召开2026-18次会议",
    "date": "2026-05-21",
    "url": "https://news.cau.edu.cn/ttgznew/9684cc72aff54f07bbdbda0050b42cf3.htm",
    "summary": "学校党委常委会召开会议，研究科技小院“出海计划”、自主科研经费项目及相关学校重点工作。",
    "category": "北京",
    "tags": ["党委常委会", "科技小院", "学校工作"]
  },
  {
    "id": 304,
    "site": "中国农业大学新闻网",
    "source": "中国农业大学新闻网",
    "title": "学校党委常委会专题学习习近平总书记关于推动哲学社会科学高质量发展的重要指示精神",
    "date": "2026-05-21",
    "url": "https://news.cau.edu.cn/ttgznew/ab44b2e6ef034fcbaf527522d229b0c3.htm",
    "summary": "学校党委常委会专题学习习近平总书记关于推动哲学社会科学高质量发展的重要指示精神，研究部署贯彻落实工作。",
    "category": "北京",
    "tags": ["哲学社会科学", "理论学习", "党委工作"]
  },
  {
    "id": 305,
    "site": "中国农业大学新闻网",
    "source": "中国农业大学新闻网",
    "title": "新闻发布厅 | 《自然》发表中国农大秦峰团队研究成果 揭示玉米抗旱稳产新机制",
    "date": "2026-05-21",
    "url": "https://news.cau.edu.cn/ttgznew/a211ed60d4694af2a5ca21313e556693.htm",
    "summary": "中国农业大学秦峰教授团队在《自然》发表研究成果，揭示玉米抗旱稳产相关新机制。",
    "category": "北京",
    "tags": ["科研进展", "玉米抗旱", "稳产机制"]
  },
  {
    "id": 306,
    "site": "中国农业大学新闻网",
    "source": "中国农业大学新闻网",
    "title": "校长办公会召开第2026-16次会议",
    "date": "2026-05-20",
    "url": "https://news.cau.edu.cn/ttgznew/70bddb3809dd472dbdfcb6fc24f8c59d.htm",
    "summary": "校长办公会研究校历、继续教育办学风险检查、自主科研经费项目及基本科研业务费立项等事项。",
    "category": "北京",
    "tags": ["校长办公会", "学校管理", "科研经费"]
  },
  {
    "id": 307,
    "site": "中国农业大学新闻网",
    "source": "中国农业大学新闻网",
    "title": "校长陈卫会见山东农业大学党委书记、校长一行",
    "date": "2026-05-20",
    "url": "https://news.cau.edu.cn/ttgznew/cdc8d8f7b93f4211ba4db69cf5a78c3d.htm",
    "summary": "山东农业大学党委书记、校长一行来校访问，双方围绕对口帮扶合作等内容进行交流。",
    "category": "北京",
    "tags": ["校际交流", "对口帮扶", "合作交流"]
  },
  {
    "id": 308,
    "site": "中国农业大学新闻网",
    "source": "中国农业大学新闻网",
    "title": "赓续红色基因 讲好强农故事 中国农大学子在延河联盟讲解员大赛斩获佳绩",
    "date": "2026-05-22",
    "url": "https://news.cau.edu.cn/zhxwnew/7f2c88b52fcc4deaba2350e652ff1247.htm",
    "summary": "中国农大学子参加第二届延河联盟高校讲解员大赛，围绕红色校史与强农故事开展展示并取得佳绩。",
    "category": "北京",
    "tags": ["红色校史", "学生风采", "讲解大赛"]
  },
  {
    "id": 309,
    "site": "中国农业大学新闻网",
    "source": "中国农业大学新闻网",
    "title": "喜报 | 动科学院学子在第一届“嘉吉杯”智慧牧业大学生创新竞赛中斩获佳绩",
    "date": "2026-05-22",
    "url": "https://news.cau.edu.cn/zhxwnew/5f825eb21d954ca7aa44c80243636043.htm",
    "summary": "动科学院学生在第一届“嘉吉杯”智慧牧业大学生创新竞赛决赛中获得一等奖、三等奖等成绩。",
    "category": "北京",
    "tags": ["学生竞赛", "动科学院", "智慧牧业"]
  },
  {
    "id": 310,
    "site": "中国农业大学新闻网",
    "source": "中国农业大学新闻网",
    "title": "张永生副校长带队开展基坑气膜安全专项检查",
    "date": "2026-05-22",
    "url": "https://news.cau.edu.cn/zhxwnew/00943ad9bc7b488ebd1415b71dac5e09.htm",
    "summary": "张永生副校长带队深入水利楼项目现场，对基坑气膜实施情况进行专项检查并部署安全生产工作。",
    "category": "北京",
    "tags": ["安全检查", "基建工程", "安全生产"]
  }
];

function fetchUrl(urlStr, isBinary = false, redirects = 3) {
  return new Promise((resolve, reject) => {
    if (redirects < 0) return reject(new Error('Too many redirects'));
    let parsedUrl;
    try {
      parsedUrl = new URL(urlStr);
    } catch (e) {
      return reject(e);
    }
    const client = parsedUrl.protocol === 'https:' ? https : http;
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': isBinary ? 'image/*' : 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Referer': parsedUrl.origin
      },
      rejectUnauthorized: false
    };

    const req = client.request(options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          redirectUrl = new URL(redirectUrl, urlStr).href;
        }
        return resolve(fetchUrl(redirectUrl, isBinary, redirects - 1));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Status ${res.statusCode}`));
      }

      if (isBinary) {
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      } else {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

function extractImages(html, baseUrl) {
  const list = [];
  const imgMatches = [...html.matchAll(/<img[^>]+src=['"]([^'"]+)['"][^>]*>/gi)];
  for (let match of imgMatches) {
    const src = match[1];
    const lowerSrc = src.toLowerCase();
    if (
      !lowerSrc.includes('base64') &&
      !lowerSrc.includes('icon') &&
      !lowerSrc.includes('logo') &&
      !lowerSrc.includes('avatar') &&
      !lowerSrc.includes('code2.jpg') &&
      !lowerSrc.includes('wechet.png') &&
      !lowerSrc.includes('sina.png') &&
      !lowerSrc.includes('study.png')
    ) {
      try {
        list.push(new URL(src, baseUrl).href);
      } catch (e) {}
    }
  }
  return [...new Set(list)];
}

function getExtension(buffer) {
  if (buffer.length < 4) return '.jpg';
  const hex = buffer.toString('hex', 0, 4);
  if (hex.startsWith('89504e47')) return '.png';
  if (hex.startsWith('ffd8ff')) return '.jpg';
  return '.jpg';
}

async function run() {
  console.log('--- Starting Crawler for 10 Beijing (Campus) News Articles ---');
  
  if (!fs.existsSync(IMAGE_DIR)) {
    fs.mkdirSync(IMAGE_DIR, { recursive: true });
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    item.image = ""; // Reset to empty by default

    console.log(`[ID:${item.id}] Fetching page: ${item.url}`);
    try {
      const html = await fetchUrl(item.url);
      const imageUrls = extractImages(html, item.url);
      console.log(`  Found ${imageUrls.length} image candidates.`);
      
      let saved = false;
      for (const imgUrl of imageUrls) {
        console.log(`  Downloading candidate: ${imgUrl}`);
        try {
          const buffer = await fetchUrl(imgUrl, true);
          if (buffer.length > 20000) { // filter out small images (logos, icons)
            const ext = getExtension(buffer);
            const filename = `cover_news_common_${item.id}${ext}`;
            const localPath = path.join(IMAGE_DIR, filename);
            fs.writeFileSync(localPath, buffer);
            
            item.image = `images/auto/${filename}`;
            saved = true;
            console.log(`  Successfully saved image to ${item.image} (${buffer.length} bytes)`);
            break;
          } else {
            console.log(`  Candidate too small (${buffer.length} bytes), skipping.`);
          }
        } catch (dlErr) {
          console.log(`  Failed to download candidate: ${dlErr.message}`);
        }
      }
      if (!saved) {
        console.log(`  No valid unique cover photo retrieved.`);
      }
    } catch (err) {
      console.log(`  Failed to crawl: ${err.message}`);
    }
    // Wait briefly between requests to prevent rate limit
    await new Promise(r => setTimeout(r, 300));
  }

  // Load existing news_common database
  const jsonPath = path.join(DATA_DIR, 'news_common.json');
  const jsPath = path.join(DATA_DIR, 'news_common.js');
  
  let existingItems = [];
  if (fs.existsSync(jsonPath)) {
      try {
          existingItems = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      } catch (e) {
          console.error('Failed to parse existing news_common.json, using empty array.');
      }
  }

  // Filter out any existing entries with IDs 301-310 to allow safe re-runs without duplication
  existingItems = existingItems.filter(x => x.id < 301 || x.id > 310);

  // Append new items
  const finalItems = existingItems.concat(items);
  const jsonStr = JSON.stringify(finalItems, null, 2);

  fs.writeFileSync(jsonPath, jsonStr + '\n', 'utf8');
  fs.writeFileSync(jsPath, `window.newsCommonData = ${jsonStr};\n`, 'utf8');

  console.log('\nCrawler successfully finished and appended new Beijing articles.');
}

run();
