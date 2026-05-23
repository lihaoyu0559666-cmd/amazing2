const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const { URL } = require('url');

const IMAGE_DIR = path.join(__dirname, '../images/auto');

// 8 个需要自动处理的独立数据库及数据源定义
const TARGET_DATABASES = [
    {
        name: 'news_admin',
        jsonPath: path.join(__dirname, '../data/news_admin.json'),
        jsPath: path.join(__dirname, '../data/news_admin.js'),
        varName: 'window.newsAdminData'
    },
    {
        name: 'news_faculty',
        jsonPath: path.join(__dirname, '../data/news_faculty.json'),
        jsPath: path.join(__dirname, '../data/news_faculty.js'),
        varName: 'window.newsFacultyData'
    },
    {
        name: 'news_student',
        jsonPath: path.join(__dirname, '../data/news_student.json'),
        jsPath: path.join(__dirname, '../data/news_student.js'),
        varName: 'window.newsStudentData'
    },
    {
        name: 'news_common',
        jsonPath: path.join(__dirname, '../data/news_common.json'),
        jsPath: path.join(__dirname, '../data/news_common.js'),
        varName: 'window.newsCommonData'
    },
    {
        name: 'theory',
        jsonPath: path.join(__dirname, '../data/theory.json'),
        jsPath: path.join(__dirname, '../data/theory.js'),
        varName: 'window.theoryData'
    },
    {
        name: 'agriculture',
        jsonPath: path.join(__dirname, '../data/agriculture.json'),
        jsPath: path.join(__dirname, '../data/agriculture.js'),
        varName: 'window.agricultureData'
    },
    {
        name: 'practice',
        jsonPath: path.join(__dirname, '../data/practice.json'),
        jsPath: path.join(__dirname, '../data/practice.js'),
        varName: 'window.practiceData'
    },
    {
        name: 'campus',
        jsonPath: path.join(__dirname, '../data/campus.json'),
        jsPath: path.join(__dirname, '../data/campus.js'),
        varName: 'window.campusData'
    }
];

// 辅助 sleep 函数
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 简易请求工具，支持 UA 伪装、忽略 SSL 错误、重定向跟随
function fetchUrl(urlStr, isBinary = false, redirects = 3) {
    return new Promise((resolve, reject) => {
        if (redirects < 0) {
            return reject(new Error('Too many redirects'));
        }

        let parsedUrl;
        try {
            parsedUrl = new URL(urlStr);
        } catch (e) {
            return reject(new Error(`Invalid URL: ${urlStr}`));
        }

        const client = parsedUrl.protocol === 'https:' ? https : http;
        
        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
            path: parsedUrl.pathname + parsedUrl.search + parsedUrl.hash,
            method: 'GET',
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'Referer': parsedUrl.origin
            }
        };

        if (parsedUrl.protocol === 'https:') {
            options.rejectUnauthorized = false;
        }

        const req = client.request(options, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                let redirectUrl = res.headers.location;
                if (!redirectUrl.startsWith('http')) {
                    redirectUrl = new URL(redirectUrl, urlStr).href;
                }
                return resolve(fetchUrl(redirectUrl, isBinary, redirects - 1));
            }

            if (res.statusCode !== 200) {
                return reject(new Error(`Failed with status ${res.statusCode}`));
            }

            if (isBinary) {
                const chunks = [];
                res.on('data', chunk => chunks.push(chunk));
                res.on('end', () => resolve(Buffer.concat(chunks)));
                res.on('error', (err) => reject(err));
            } else {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(data));
                res.on('error', (err) => reject(err));
            }
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.end();
    });
}

function extractImage(html, baseUrl) {
    const ogMatch = html.match(/<meta\s+(?:property|name)=['"]og:image['"]\s+content=['"]([^'"]+)['"]/i);
    if (ogMatch && ogMatch[1]) {
        try {
            return new URL(ogMatch[1], baseUrl).href;
        } catch (e) {}
    }
    
    const imgMatches = [...html.matchAll(/<img[^>]+src=['"]([^'"]+)['"][^>]*>/gi)];
    for (let match of imgMatches) {
        const src = match[1];
        if (!src.includes('base64') && !src.includes('icon') && !src.includes('logo') && !src.includes('avatar') && !src.includes('code2.jpg')) {
            try {
                return new URL(src, baseUrl).href;
            } catch (e) {}
        }
    }
    return null;
}

// 增量保存指定数据库
function saveState(data, jsonPath, jsPath, varName) {
    const newJson = JSON.stringify(data, null, 2);
    fs.writeFileSync(jsonPath, newJson, 'utf8');
    fs.writeFileSync(jsPath, varName + ' = ' + newJson + ';\n', 'utf8');
}

async function run() {
    console.log('开始自动化抓取文章封面任务（多数据库独立扫描版）...');
    
    if (!fs.existsSync(IMAGE_DIR)) {
        fs.mkdirSync(IMAGE_DIR, { recursive: true });
    }

    let globalUpdatedCount = 0;

    for (let db of TARGET_DATABASES) {
        if (!fs.existsSync(db.jsonPath)) {
            console.log(`[数据库 ${db.name}] 路径不存在，跳过。`);
            continue;
        }

        console.log(`\n=================== 正在扫描数据库: ${db.name} ===================`);
        let newsData;
        try {
            newsData = JSON.parse(fs.readFileSync(db.jsonPath, 'utf8'));
        } catch (e) {
            console.error(`  -> 读取/解析数据库 ${db.name} 失败: ${e.message}`);
            continue;
        }

        if (!Array.isArray(newsData) || newsData.length === 0) {
            console.log(`  -> 数据库 ${db.name} 内容为空，跳过。`);
            continue;
        }

        // 1. 自动恢复该数据库下已下载但未保存的封面
        let restoredCount = 0;
        for (let i = 0; i < newsData.length; i++) {
            const item = newsData[i];
            const fileName = `cover_${db.name}_${item.id}.jpg`;
            const localPath = path.join(IMAGE_DIR, fileName);
            if (fs.existsSync(localPath)) {
                const expectedPath = `images/auto/${fileName}`;
                if (item.image !== expectedPath) {
                    item.image = expectedPath;
                    restoredCount++;
                }
            }
        }
        if (restoredCount > 0) {
            console.log(`  -> 成功从本地恢复已存在封面共 ${restoredCount} 条记录。`);
            saveState(newsData, db.jsonPath, db.jsPath, db.varName);
        }

        // 2. 依次抓取未下载封面的项
        let dbUpdatedCount = 0;
        for (let i = 0; i < newsData.length; i++) {
            const item = newsData[i];
            
            if (item.image && item.image.startsWith('images/auto/')) {
                continue;
            }

            if (item.url && item.url.startsWith('http')) {
                console.log(`  正在处理 [ID:${item.id}] ${item.title.substring(0, 15)}...`);
                try {
                    const html = await fetchUrl(item.url);
                    const imageUrl = extractImage(html, item.url);
                    
                    if (imageUrl) {
                        console.log(`    -> 发现图片: ${imageUrl}`);
                        try {
                            const imageBuffer = await fetchUrl(imageUrl, true);
                            const fileName = `cover_${db.name}_${item.id}.jpg`;
                            const localPath = path.join(IMAGE_DIR, fileName);
                            fs.writeFileSync(localPath, imageBuffer);
                            
                            item.image = `images/auto/${fileName}`;
                            dbUpdatedCount++;
                            globalUpdatedCount++;
                            console.log(`    -> 成功保存本地: ${item.image}`);
                            
                            // 增量保存当前数据库
                            saveState(newsData, db.jsonPath, db.jsPath, db.varName);
                        } catch (dlErr) {
                            console.log(`    -> 图片下载失败: ${dlErr.message}`);
                        }
                    } else {
                        console.log(`    -> 未发现可用配图。`);
                    }
                } catch (err) {
                    console.log(`    -> 页面抓取失败: ${err.message}`);
                }

                await sleep(300);
            }
        }
        console.log(`[数据库 ${db.name}] 处理完成，本次更新下载了 ${dbUpdatedCount} 张封面。`);
    }

    console.log(`\n=================== 所有数据库扫描处理完毕！共下载并同步了 ${globalUpdatedCount} 张封面。 ===================`);
}

run();
