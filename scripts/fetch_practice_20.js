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
    '0e9ff711a88f1b668f3bd36afd8cdac9'  // static.bjnews.com.cn footer placeholder
]);

const items = [
  {
    "id": 1,
    "title": "北京工业大学：创新“四六四五”教育模式深化“青马工程”育人实效",
    "category": "思政育人",
    "source": "全国高校思想政治工作网",
    "date": "2026-05-22",
    "summary": "围绕青马工程培养机制，展示高校青年政治骨干培养与思政育人提质增效实践。",
    "url": "https://www.sizhengwang.cn/a/dxjy_gzal/260522/2398136.shtml",
    "image": "images/news-placeholder-sizheng.jpg",
    "isTop": false,
    "isRecommend": true,
    "tags": ["青马工程", "青年培养", "思政育人"]
  },
  {
    "id": 2,
    "title": "武汉理工大学：巧用“1234”与“1235”，打好研究生导师思政能力提升组合拳",
    "category": "思政育人",
    "source": "全国高校思想政治工作网",
    "date": "2026-05-18",
    "summary": "聚焦研究生导师思政能力提升，探索导师队伍在研究生思想政治教育中的育人作用。",
    "url": "https://www.sizhengwang.cn/a/dxjy_gzal/260518/2389674.shtml",
    "image": "images/news-placeholder-sizheng.jpg",
    "isTop": false,
    "isRecommend": true,
    "tags": ["研究生教育", "导师思政", "队伍建设"]
  },
  {
    "id": 3,
    "title": "山西工商学院：一体化推进融合思政育人建设纪实",
    "category": "思政育人",
    "source": "全国高校思想政治工作网",
    "date": "2026-05-15",
    "summary": "以融合思政为主线，展示思政课、课程思政、网络思政和项目思政协同育人的实践。",
    "url": "https://www.sizhengwang.cn/a/dxjy_gzal/260515/2392230.shtml",
    "image": "images/news-placeholder-sizheng.jpg",
    "isTop": false,
    "isRecommend": true,
    "tags": ["融合思政", "三全育人", "高校案例"]
  },
  {
    "id": 4,
    "title": "西安工业大学：以三大典礼为载体探索思政育人新模式",
    "category": "思政育人",
    "source": "全国高校思想政治工作网",
    "date": "2026-05-15",
    "summary": "依托入学、毕业等典礼场景，构建有温度、有仪式感的思政育人新模式。",
    "url": "https://sizhengwang.cn/a/dxjy_gzal/260515/2383237.shtml",
    "image": "images/news-placeholder-sizheng.jpg",
    "isTop": false,
    "isRecommend": true,
    "tags": ["典礼育人", "校园文化", "思政育人"]
  },
  {
    "id": 5,
    "title": "山东信息职业技术学院：校地双向赋能，打造思政育人新范式",
    "category": "思政育人",
    "source": "全国高校思想政治工作网",
    "date": "2026-05-09",
    "summary": "以校地协同为路径，整合区域资源，推动实践育人与思想政治教育融合。",
    "url": "https://www.sizhengwang.cn/a/xcjy_sjyr/260509/2383256.shtml",
    "image": "images/news-placeholder-sizheng.jpg",
    "isTop": false,
    "isRecommend": true,
    "tags": ["校地协同", "实践育人", "思政育人"]
  },
  {
    "id": 6,
    "title": "武汉东湖学院：构建高校“三在一体”大思政课铸魂育人新范式",
    "category": "思政育人",
    "source": "全国高校思想政治工作网",
    "date": "2026-04-28",
    "summary": "围绕校内外育人空间建设，探索大思政课铸魂育人体系化建设路径。",
    "url": "https://www.sizhengwang.cn/a/dxjy_gzal/260428/2381943.shtml",
    "image": "images/news-placeholder-sizheng.jpg",
    "isTop": false,
    "isRecommend": true,
    "tags": ["大思政课", "铸魂育人", "育人空间"]
  },
  {
    "id": 7,
    "title": "北京工业大学：“数据+精准+协同”构建第二课堂思政育人新模式",
    "category": "思政育人",
    "source": "全国高校思想政治工作网",
    "date": "2026-04-09",
    "summary": "依托第二课堂数据，探索数据驱动、精准适配、协同联动的思政工作模式。",
    "url": "https://www.sizhengwang.cn/a/dxjy_gzal/260409/2358552.shtml",
    "image": "images/news-placeholder-sizheng.jpg",
    "isTop": false,
    "isRecommend": true,
    "tags": ["第二课堂", "精准思政", "数字赋能"]
  },
  {
    "id": 8,
    "title": "新乡学院：聚焦“大思政”育人理念，构筑“五维”实践教学体系",
    "category": "思政育人",
    "source": "全国高校思想政治工作网",
    "date": "2026-03-31",
    "summary": "以大思政育人理念为牵引，构建多维实践教学体系，推动理论学习与实践育人结合。",
    "url": "https://www.sizhengwang.cn/a/dxjy_gzal/260331/2358805.shtml",
    "image": "images/news-placeholder-sizheng.jpg",
    "isTop": false,
    "isRecommend": true,
    "tags": ["大思政", "实践教学", "五维体系"]
  },
  {
    "id": 9,
    "title": "四川工业科技学院：“四维协同”构建思政教育新格局",
    "category": "思政育人",
    "source": "全国高校思想政治工作网",
    "date": "2026-05-14",
    "summary": "围绕网络思政、课程思政与校园育人矩阵建设，展示高校思政教育协同路径。",
    "url": "https://www.sizhengwang.cn/a/dxjy_gzal/260514/2392206.shtml",
    "image": "images/news-placeholder-sizheng.jpg",
    "isTop": false,
    "isRecommend": true,
    "tags": ["四维协同", "网络思政", "思政教育"]
  },
  {
    "id": 10,
    "title": "南京林业大学：三个坚持打造数字化思政育人新生态",
    "category": "思政育人",
    "source": "全国高校思想政治工作网",
    "date": "2025-08-25",
    "summary": "以数字化建设赋能高校思想政治工作，探索数字化思政育人新生态。",
    "url": "https://www.sizhengwang.cn/a/zyfwpt_szfn_aiszal/250825/2208707.shtml",
    "image": "images/news-placeholder-sizheng.jpg",
    "isTop": false,
    "isRecommend": true,
    "tags": ["数字思政", "AI思政", "智慧育人"]
  },
  {
    "id": 11,
    "title": "福州大学：四维发力，打造“行见八闽”思政实践育人新范式",
    "category": "思政育人",
    "source": "全国高校思想政治工作网",
    "date": "2026-03-25",
    "summary": "依托地方文化与社会资源，构建实践育人共同体，拓展思政育人场景。",
    "url": "https://www.sizhengwang.cn/a/xcjy_sjyr/260325/2351119.shtml",
    "image": "images/news-placeholder-sizheng.jpg",
    "isTop": false,
    "isRecommend": true,
    "tags": ["实践育人", "地方资源", "大思政课"]
  },
  {
    "id": 12,
    "title": "“四点四维”融合赋能绘就思政引领下急救育人新图景",
    "category": "思政育人",
    "source": "全国高校思想政治工作网",
    "date": "2026-04-03",
    "summary": "将思政引领融入急救实践教育，推动技能提升与思想淬炼双向赋能。",
    "url": "https://www.sizhengwang.cn/a/xcjy_sjyr/260403/2358527.shtml",
    "image": "images/news-placeholder-sizheng.jpg",
    "isTop": false,
    "isRecommend": true,
    "tags": ["急救育人", "实践育人", "思政引领"]
  },
  {
    "id": 13,
    "title": "南京航空航天大学：以校馆协同为牵引打造“大中小”思政教育共同体",
    "category": "思政育人",
    "source": "全国高校思想政治工作网",
    "date": "2026-04-27",
    "summary": "依托校馆协同机制，推动生命教育、历史教育与航空报国教育融入思政教育。",
    "url": "https://www.sizhengwang.cn/a/xcjy_sjyr/260427/2377822.shtml",
    "image": "images/news-placeholder-sizheng.jpg",
    "isTop": false,
    "isRecommend": true,
    "tags": ["校馆协同", "大中小思政", "航空报国"]
  },
  {
    "id": 14,
    "title": "打造“暖阳”义教品牌，上好志愿服务这堂“大思政课”",
    "category": "思政育人",
    "source": "全国高校思想政治工作网",
    "date": "2026-04-16",
    "summary": "以志愿服务 brand 建设为抓手，拓展大学生思想政治教育和大思政课实践场景。",
    "url": "https://www.sizhengwang.cn/a/xcjy_sjyr/260416/2368632.shtml",
    "image": "images/news-placeholder-sizheng.jpg",
    "isTop": false,
    "isRecommend": true,
    "tags": ["志愿服务", "大思政课", "实践育人"]
  },
  {
    "id": 15,
    "title": "西安工业大学：构建“红色文化赋能专业知识赋智社会实践赋行”育人模式",
    "category": "思政育人",
    "source": "全国高校思想政治工作网",
    "date": "2026-04-13",
    "summary": "将红色文化、专业知识和社会实践贯通起来，推动大思政课建设走深走实。",
    "url": "https://www.sizhengwang.cn/a/xcjy_sjyr/260413/2368612.shtml",
    "image": "images/news-placeholder-sizheng.jpg",
    "isTop": false,
    "isRecommend": true,
    "tags": ["红色文化", "专业教育", "实践赋能"]
  },
  {
    "id": 16,
    "title": "东莞城市学院：“四维融合”赋能红色育人实践创新",
    "category": "思政育人",
    "source": "全国高校思想政治工作网",
    "date": "2025-04-09",
    "summary": "围绕红色育人实践，构建课程、活动、实践、环境联动的育人矩阵。",
    "url": "https://www.sizhengwang.cn/a/xcjy_sjyr/250409/2059435.shtml",
    "image": "images/news-placeholder-sizheng.jpg",
    "isTop": false,
    "isRecommend": true,
    "tags": ["红色育人", "四维融合", "实践创新"]
  },
  {
    "id": 17,
    "title": "西北农林科技大学：四方面生动实践育新人",
    "category": "思政育人",
    "source": "全国高校思想政治工作网",
    "date": "2026-03-05",
    "summary": "聚焦高校思政工作与国家战略需求，将实践活动转化为学生价值认同与成长动力。",
    "url": "https://www.sizhengwang.cn/a/xcjy_sjyr/260305/2339115.shtml",
    "image": "images/news-placeholder-sizheng.jpg",
    "isTop": false,
    "isRecommend": true,
    "tags": ["实践育人", "农业高校", "价值引领"]
  },
  {
    "id": 18,
    "title": "上海工程技术大学：ABCD四步法，推动“AI+思政”育人高质量发展",
    "category": "思政育人",
    "source": "全国高校思想政治工作网",
    "date": "2025-03-10",
    "summary": "以人工智能技术赋能思政教育工作，探索AI与高校立德树人深度融合。",
    "url": "https://www.sizhengwang.cn/a/dxjy_gzal/250310/2021711.shtml",
    "image": "images/news-placeholder-sizheng.jpg",
    "isTop": false,
    "isRecommend": true,
    "tags": ["AI思政", "数字赋能", "高质量发展"]
  },
  {
    "id": 19,
    "title": "中国石油大学（华东）：以“思政+”构建校园文化育人新生态",
    "category": "思政育人",
    "source": "全国高校思想政治工作网",
    "date": "2025-12-23",
    "summary": "以思政与美育、校园文化融合为路径，拓展文化育人场场和育人生态。",
    "url": "https://www.sizhengwang.cn/a/dxjy_gzal/251223/2302380.shtml",
    "image": "images/news-placeholder-sizheng.jpg",
    "isTop": false,
    "isRecommend": true,
    "tags": ["思政+", "文化育人", "美育融合"]
  },
  {
    "id": 20,
    "title": "四川外国语大学：深挖红色校史底蕴，厚植外语育人根基",
    "category": "思政育人",
    "source": "全国高校思想政治工作网",
    "date": "2026-03-09",
    "summary": "依托红色校史与红岩精神，构建校史教育和外语专业育人相融合的思政育人模式。",
    "url": "https://www.sizhengwang.cn/a/dxjy_gzal/260309/2339113.shtml",
    "image": "images/news-placeholder-sizheng.jpg",
    "isTop": false,
    "isRecommend": true,
    "tags": ["红色校史", "外语育人", "红岩精神"]
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
  console.log('--- Starting Crawler for 20 Practice News Articles ---');
  
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
          
          // Calculate MD5 hash
          const md5 = crypto.createHash('md5').update(buffer).digest('hex');
          
          if (BLACKLISTED_HASHES.has(md5)) {
              console.log(`  Candidate matches blacklisted header/logo hash (${md5}), skipping.`);
              continue;
          }

          if (buffer.length > 15000) { // filter out small images (logos, icons)
            const ext = getExtension(buffer);
            const filename = `cover_practice_${item.id}${ext}`;
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

  // Write initial database files
  const jsonPath = path.join(DATA_DIR, 'practice.json');
  const jsPath = path.join(DATA_DIR, 'practice.js');
  const jsonStr = JSON.stringify(items, null, 2);

  fs.writeFileSync(jsonPath, jsonStr + '\n', 'utf8');
  fs.writeFileSync(jsPath, `window.practiceData = ${jsonStr};\n`, 'utf8');

  console.log('\nCrawler successfully finished and saved initial database files.');
}

run();
