const fs = require('fs');
const http = require('http');
const https = require('https');

function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function run() {
    try {
        let cauHtml = await fetchUrl('http://news.cau.edu.cn/');
        let cauLinks = [...cauHtml.matchAll(/href=\"(art\/[^\"']+\.html)\"/g)].map(m => 'http://news.cau.edu.cn/' + m[1]);
        
        let xinhuaHtml = await fetchUrl('http://www.news.cn/politics/');
        let xinhuaLinks = [...xinhuaHtml.matchAll(/href=\"(http:\/\/www\.news\.cn\/politics\/[^\"']+\.htm)\"/g)].map(m => m[1]);
        
        // People's daily uses relative or absolute
        let peopleHtml = await fetchUrl('http://theory.people.com.cn/');
        let peopleLinks = [...peopleHtml.matchAll(/href=\"(\/n1\/[^\"']+\.html)\"/g)].map(m => 'http://theory.people.com.cn' + m[1]);
        
        let cauValid = [...new Set(cauLinks)].filter(l => l.length > 20);
        let xinhuaValid = [...new Set(xinhuaLinks)].filter(l => l.length > 20);
        let peopleValid = [...new Set(peopleLinks)].filter(l => l.length > 20);

        let data = JSON.parse(fs.readFileSync('data/news.json', 'utf8'));
        
        let cauIndex = 0;
        let xinhuaIndex = 0;
        let peopleIndex = 0;

        data.forEach(item => {
            if (item.source.includes('农大') && cauValid.length > 0) {
                item.url = cauValid[cauIndex % cauValid.length];
                cauIndex++;
            } else if (item.source.includes('新华') && xinhuaValid.length > 0) {
                item.url = xinhuaValid[xinhuaIndex % xinhuaValid.length];
                xinhuaIndex++;
            } else if (item.source.includes('人民') && peopleValid.length > 0) {
                item.url = peopleValid[peopleIndex % peopleValid.length];
                peopleIndex++;
            } else {
                if (cauValid.length > 0) item.url = cauValid[0];
            }
        });

        const newJson = JSON.stringify(data, null, 2);
        fs.writeFileSync('data/news.json', newJson, 'utf8');
        fs.writeFileSync('data/news.js', 'window.newsData = ' + newJson + ';\n', 'utf8');
        console.log('Updated URLs successfully', {
            cauCount: cauValid.length,
            xinhuaCount: xinhuaValid.length,
            peopleCount: peopleValid.length
        });
    } catch (e) {
        console.error(e);
    }
}
run();
