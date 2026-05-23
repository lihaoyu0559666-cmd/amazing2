const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const crypto = require('crypto');
const { URL } = require('url');

const DATA_DIR = 'f:\\反重力\\御丞的奇妙比赛项目\\data';
const IMAGE_DIR = 'f:\\反重力\\御丞的奇妙比赛项目\\images\\auto';

// Blacklisted MD5 hashes for site-wide logos/banners/placeholders
const BLACKLISTED_HASHES = new Set([
    '89a29593a2d52cfde33a0a6a19606be1', // dxs.moe.gov.cn logo
    '38faa441068857330a046769aaa54508', // sizhengwang.cn header banner
    'd817b5e9c3d59c9defe528dbd2b964f3', // sizhengwang.cn logo
    '6f4ea44057183114c8f053c67be3eca7', // old 4.2KB PNG placeholders
    '0e9ff711a88f1b668f3bd36afd8cdac9', // static.bjnews.com.cn footer placeholder
    'c86c76bef42b4db9aa94ad9d87b69360'  // sizhengwang.cn generic text placeholder
]);

const items = [
  {
    "id": 401,
    "site": "人民网",
    "source": "人民网",
    "title": "国家防总针对湖北、重庆启动防汛四级应急响应",
    "date": "2026-05-23",
    "url": "https://society.people.com.cn/n1/2026/0523/c1008-40725910.html",
    "summary": "根据降雨和江河汛情，国家防总针对湖北、重庆两省市启动防汛四级应急响应，指导防汛减灾工作。",
    "category": "要闻",
    "tags": ["防汛响应", "应急抢险", "防灾减灾"]
  },
  {
    "id": 402,
    "site": "人民网",
    "source": "人民网",
    "title": "中国驻泰使馆：4名失联中国公民已找到",
    "date": "2026-05-23 13:28",
    "url": "https://world.people.com.cn/n1/2026/0523/c1002-40725900.html",
    "summary": "中国驻泰国大使馆通报，在泰国普吉附近海域失联的4名中国公民已全部找到并获得安全安置。",
    "category": "要闻",
    "tags": ["领事保护", "使馆通报", "出境安全"]
  },
  {
    "id": 403,
    "site": "新华网",
    "source": "新华网",
    "title": "韩国总统说将坚定不移走韩朝和平共存与共同发展的道路",
    "date": "2026-05-23 17:11:33",
    "url": "https://www.xinhuanet.com/20260523/9fc91c9fb15f48068a7c18cc9e3336fd/c.html",
    "summary": "韩国总统李在明在公开演说中表示，将坚定不移推进韩朝对话，谋求半岛和平共存与共同繁荣的合作道路。",
    "category": "要闻",
    "tags": ["国际政要", "半岛局势", "和平共存"]
  },
  {
    "id": 404,
    "site": "新华网",
    "source": "新华网",
    "title": "美国夏威夷发生6.0级地震",
    "date": "2026-05-23 16:59:42",
    "url": "https://www.xinhuanet.com/20260523/5f654ba3bbee438e81aa72b9f2c51572/c.html",
    "summary": "据美国地质调查局测定，美国夏威夷霍瑙瑙-纳波奥波奥以南发生6.0级地震，目前尚无严重伤亡报告。",
    "category": "要闻",
    "tags": ["国际地震", "自然灾害", "夏威夷"]
  },
  {
    "id": 405,
    "site": "新京报",
    "source": "新京报",
    "title": "播种机器人、嫁接机器人、糖度检测仪……科技赋能大兴西瓜节",
    "date": "2026-05-23 17:13",
    "url": "https://www.bjnews.com.cn/detail/1779524655129802.html",
    "summary": "第38届北京大兴西瓜节拉开帷幕，播种机器人、嫁接机器人、糖度检测仪等一系列农业黑科技设备亮相大展风采。",
    "category": "要闻",
    "tags": ["科技农业", "大兴西瓜节", "智慧种植"]
  },
  {
    "id": 406,
    "site": "新京报",
    "source": "新京报",
    "title": "征服了欧洲和北美社会所有阶层的马铃薯，是何时引入中国的呢？",
    "date": "2026-05-23 17:11",
    "url": "https://www.bjnews.com.cn/detail/1779527473169840.html",
    "summary": "文章围绕马铃薯的全球作物传播史进行科普，重点剖析了马铃薯引入中国的时间节点与核心地理路径。",
    "category": "要闻",
    "tags": ["农史科普", "马铃薯传播", "农业历史"]
  },
  {
    "id": 407,
    "site": "中国农业大学新闻网",
    "source": "中国农业大学新闻网",
    "title": "校团委“青思铸魂”思想引领行动举办系列专题学习会 推动理论学习入脑入心",
    "date": "2026-05-22",
    "url": "https://news.cau.edu.cn/jcdt/88e640c60ed6443a94f56b9ba1d53733.htm",
    "summary": "中国农业大学校团委紧扣青年发展大局，举办思想引领系列专题学习会，推动重要精神入脑入心。",
    "category": "要闻",
    "tags": ["思想引领", "校团委工作", "青年担当"]
  },
  {
    "id": 408,
    "site": "中国农业大学新闻网",
    "source": "中国农业大学新闻网",
    "title": "2026WAFI畜牧科技创新论坛启动会在成都举行",
    "date": "2026-05-22",
    "url": "https://news.cau.edu.cn/jcdt/3b37feaf19b546a48e3ceccec638c5d5.htm",
    "summary": "2026WAFI畜牧科技创新论坛启动会在成都正式召开，共商畜牧业科技创新、种业攻坚与产学研合作新思路。",
    "category": "要闻",
    "tags": ["畜牧科技", "wafi论坛", "种业发展"]
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
  console.log('--- Starting Crawler for 8 Yaowen (Important) News Articles ---');
  
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
          
          // Compute MD5 Hash
          const md5 = crypto.createHash('md5').update(buffer).digest('hex');
          if (BLACKLISTED_HASHES.has(md5)) {
              console.log(`  Candidate matches blacklisted header/logo hash (${md5}), skipping.`);
              continue;
          }

          if (buffer.length > 15000) { // filter out small images (logos, icons)
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
    await new Promise(r => setTimeout(r, 400));
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

  // Filter out any existing entries with IDs 401-408 to allow safe re-runs without duplication
  existingItems = existingItems.filter(x => x.id < 401 || x.id > 408);

  // Append new items
  const finalItems = existingItems.concat(items);
  const jsonStr = JSON.stringify(finalItems, null, 2);

  fs.writeFileSync(jsonPath, jsonStr + '\n', 'utf8');
  fs.writeFileSync(jsPath, `window.newsCommonData = ${jsonStr};\n`, 'utf8');

  console.log('\nCrawler successfully finished and appended new Yaowen articles.');
}

run();
