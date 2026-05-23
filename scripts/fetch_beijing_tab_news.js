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
    'c86c76bef42b4db9aa94ad9d87b69360', // sizhengwang.cn generic text placeholder
    'b8f0a971b20b86c0ec29b3ab747c0e00', // people.com.cn audio headphones icon (176,532 bytes)
    '0f77e7f268d27f564bb0a24ba64baab3', // xinhuanet.com app QR code placeholder (29,344 bytes)
    '953cf057f7df302bd348a63611681039'  // bjnews.com.cn app QR code placeholder (35,963 bytes)
]);

const items = [
  {
    "id": 501,
    "site": "新京报",
    "source": "新京报",
    "title": "播种机器人、嫁接机器人、糖度检测仪……科技赋能大兴西瓜节",
    "date": "2026-05-23 17:13",
    "url": "https://www.bjnews.com.cn/detail/1779524655129802.html",
    "summary": "第38届北京大兴西瓜节开幕，播种机器人、嫁接机器人、糖度检测仪等科技设备赋能西甜瓜产业高质量发展。",
    "category": "北京",
    "tags": ["大兴西瓜节", "科技农业", "智慧种植"]
  },
  {
    "id": 502,
    "site": "新京报",
    "source": "新京报",
    "title": "征服了欧洲和北美社会所有阶层的马铃薯，是何时引入中国的呢？",
    "date": "2026-05-23 17:11",
    "url": "https://www.bjnews.com.cn/detail/1779527473169840.html",
    "summary": "文章围绕马铃薯的全球传播史及其引入中国的时间与路径展开介绍。",
    "category": "北京",
    "tags": ["马铃薯科普", "农史介绍", "作物传播"]
  },
  {
    "id": 503,
    "site": "新京报",
    "source": "新京报",
    "title": "韩国总统李在明：将坚定不移走韩朝和平共存与共同发展的道路",
    "date": "2026-05-23 17:10",
    "url": "https://www.bjnews.com.cn/detail/1779527354129836.html",
    "summary": "韩国总统李在明表示，将坚定不移地走韩朝和平共存与共同发展的道路。",
    "category": "北京",
    "tags": ["国际形势", "半岛合作", "和平共存"]
  },
  {
    "id": 504,
    "site": "京报网",
    "source": "京报网",
    "title": "京津冀三地协同发展迈上新台阶",
    "date": "2026-05-23 07:02",
    "url": "https://news.bjd.com.cn/2026/05/23/11761317.shtml",
    "summary": "城市副中心规划建设十周年京津冀协同发展专场新闻发布会展示交通、产业、民生等领域协同发展成效。",
    "category": "北京",
    "tags": ["京津冀协同", "城市建设", "区域协同"]
  },
  {
    "id": 505,
    "site": "京报网",
    "source": "京报网",
    "title": "文博会北京展区十大打卡点，每个都出片！",
    "date": "2026-05-23 15:36",
    "url": "https://news.bjd.com.cn/2026/05/23/11762246.shtml",
    "summary": "第二十二届深圳文博会北京展区集中展示数字文化、非遗技艺、京味文创等十大打卡点。",
    "category": "北京",
    "tags": ["深圳文博会", "北京展区", "非遗文化"]
  },
  {
    "id": 506,
    "site": "京报网",
    "source": "京报网",
    "title": "北京养老服务地图上线！全市1500余家机构一键导航——",
    "date": "2026-05-22 10:54",
    "url": "https://news.bjd.com.cn/2026/05/22/11759460.shtml",
    "summary": "北京养老服务地图1.0版上线，整合全市养老机构和社区养老服务驿站等1500余家服务设施。",
    "category": "北京",
    "tags": ["养老地图", "社会服务", "便民导航"]
  },
  {
    "id": 507,
    "site": "北京时间",
    "source": "北京时间",
    "title": "山西省调集7支队伍共755人全力开展山西煤矿瓦斯爆炸事故救援",
    "date": "未标明",
    "url": "https://item.btime.com/66h45psfor31ucefi6slmhcbmj0",
    "summary": "山西通洲集团留神峪煤矿瓦斯爆炸事故发生后，山西省调集救援、医疗等7支队伍755人开展救援处置。",
    "category": "北京",
    "tags": ["煤矿救援", "应急响应", "安全生产"]
  },
  {
    "id": 508,
    "site": "北京时间",
    "source": "北京时间",
    "title": "请把话筒交给它们——",
    "date": "未标明",
    "url": "https://item.btime.com/4201oovvsk69jkr45p2ckbk8n1f",
    "summary": "围绕国际生物多样性日，介绍昌平区野生动物、候鸟栖息、珍稀植物和生态保护成果。",
    "category": "北京",
    "tags": ["生物多样性", "生态保护", "绿色北京"]
  },
  {
    "id": 509,
    "site": "北京时间",
    "source": "北京时间",
    "title": "速来！这个周末北京朝阳公园最好玩！",
    "date": "未标明",
    "url": "https://item.btime.com/f3go322oh4l8tb9s4aik66vlssc",
    "summary": "介绍2026中国新文创市集暨潮玩游园会在北京朝阳公园的周末活动与特色文创内容。",
    "category": "北京",
    "tags": ["新文创市集", "朝阳公园", "文旅活动"]
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
  console.log('--- Starting Crawler for 9 Beijing Tab News Articles ---');
  
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

  // Filter out any existing entries with IDs 501-509 to allow safe re-runs without duplication
  // and clear any lingering category "北京" items with ID >= 301 and ID <= 310
  existingItems = existingItems.filter(x => (x.id < 501 || x.id > 509) && !(x.category === '北京'));

  // Append new items
  const finalItems = existingItems.concat(items);
  const jsonStr = JSON.stringify(finalItems, null, 2);

  fs.writeFileSync(jsonPath, jsonStr + '\n', 'utf8');
  fs.writeFileSync(jsPath, `window.newsCommonData = ${jsonStr};\n`, 'utf8');

  console.log('\nCrawler successfully finished and appended new Beijing articles.');
}

run();
