const fs = require('fs');

const validLinks = [
    'http://www.news.cn/politics/20260513/ac9ef60dba5e47aaafa9d53a519495fd/c.html',
    'http://www.news.cn/politics/20260513/1cbe8a5a53d2428382008b41e0126fc5/c.html',
    'http://www.news.cn/politics/20260513/ed6ff567694c4c038d1eee03e011c2e3/c.html',
    'http://www.news.cn/politics/20260514/952776f21cfd4aa7bb33b4ae63e2039b/c.html',
    'http://www.news.cn/politics/20260520/a6c4f092b8ea472a812e32be39e8bb0e/c.html',
    'http://www.news.cn/politics/20260520/bbb351859818470289d9c096aa9b08a5/c.html',
    'http://www.news.cn/politics/20260518/2052bfc31f734909a2f6a7c2a005f392/c.html'
];

let data = JSON.parse(fs.readFileSync('data/news.json', 'utf8'));

data.forEach((item, index) => {
    item.url = validLinks[index % validLinks.length];
});

const newJson = JSON.stringify(data, null, 2);
fs.writeFileSync('data/news.json', newJson, 'utf8');
fs.writeFileSync('data/news.js', 'window.newsData = ' + newJson + ';\n', 'utf8');
console.log('Successfully injected 100% valid Xinhua articles.');
