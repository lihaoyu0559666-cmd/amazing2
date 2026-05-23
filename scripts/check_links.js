const http = require('http');
const https = require('https');
const { URL } = require('url');

const links = [
  "https://www.sizhengwang.cn/a/zcwj_llwztx/250816/2205072.shtml",
  "https://www.sizhengwang.cn/a/zcwj_llwztx/250228/2015498.shtml",
  "https://www.sizhengwang.cn/a/tbtj_zsj/250120/2004319.shtml",
  "https://www.sizhengwang.cn/a/zcwj_llwztx/240229/1745907.shtml",
  "https://sizhengwang.cn/a/zcwj_llwztx/240226/1743458.shtml",
  "https://www.sizhengwang.cn/a/zcwj_llwztx/231025/1646123.shtml",
  "https://www.sizhengwang.cn/a/zcwj_llwztx/231121/1671943.shtml",
  "https://sizhengwang.cn/a/zcwj_llwztx/231025/1646122.shtml",
  "https://www.sizhengwang.cn/a/zcwj_llwztx/231025/1646126.shtml",
  "https://sizhengwang.cn/a/zcwj_llwztx/250305/1206045.shtml",
  "https://www.xuexi.cn/lgpage/detail/index.html?id=763656619908832233&item_id=763656619908832233",
  "https://www.xuexi.cn/lgpage/detail/index.html?id=11091276824524465434&item_id=11091276824524465434",
  "https://www.xuexi.cn/lgpage/detail/index.html?id=13798633277324637773&item_id=13798633277324637773",
  "https://www.xuexi.cn/lgpage/detail/index.html?id=7602641083862029823",
  "https://www.xuexi.cn/lgpage/detail/index.html?id=18001870030766048708",
  "https://www.xuexi.cn/lgpage/detail/index.html?id=16039265050595836215&item_id=16039265050595836215",
  "https://www.xuexi.cn/lgpage/detail/index.html?id=935355700492617639&item_id=935355700492617639",
  "https://www.xuexi.cn/lgpage/detail/index.html?id=7506363871922326716&item_id=7506363871922326716",
  "https://www.xuexi.cn/lgpage/detail/index.html?id=15954521737384104190&item_id=15954521737384104190",
  "https://www.xuexi.cn/lgpage/detail/index.html?id=6969488568034067655&item_id=6969488568034067655"
];

function checkUrl(urlStr) {
    return new Promise((resolve) => {
        let parsedUrl;
        try {
            parsedUrl = new URL(urlStr);
        } catch (e) {
            return resolve({ url: urlStr, valid: false, status: 'Invalid URL' });
        }

        const client = parsedUrl.protocol === 'https:' ? https : http;
        
        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
            path: parsedUrl.pathname + parsedUrl.search,
            method: 'GET',
            timeout: 6000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
        };

        if (parsedUrl.protocol === 'https:') {
            options.rejectUnauthorized = false;
        }

        const req = client.request(options, (res) => {
            // 200, 301, 302 等都算有效
            if (res.statusCode >= 200 && res.statusCode < 400) {
                resolve({ url: urlStr, valid: true, status: res.statusCode });
            } else {
                resolve({ url: urlStr, valid: false, status: res.statusCode });
            }
        });

        req.on('error', (err) => {
            resolve({ url: urlStr, valid: false, status: `Error: ${err.message}` });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({ url: urlStr, valid: false, status: 'Timeout' });
        });

        req.end();
    });
}

async function run() {
    console.log("开始检测 20 条链接的可访问性...");
    for (let i = 0; i < links.length; i++) {
        const res = await checkUrl(links[i]);
        console.log(`[${i + 1}/20] ${res.valid ? 'OK' : 'FAIL'} (${res.status}): ${res.url}`);
    }
}

run();
