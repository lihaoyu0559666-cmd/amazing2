const fs = require('fs');
const https = require('https');

const url = 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json';
const dest = 'data/china.json';

console.log(`Downloading map data from ${url}...`);

const file = fs.createWriteStream(dest);
https.get(url, (response) => {
    if (response.statusCode !== 200) {
        console.error(`Failed to download map data. Status code: ${response.statusCode}`);
        return;
    }
    response.pipe(file);
    file.on('finish', () => {
        file.close();
        console.log('Map data downloaded successfully and saved to data/china.json');
    });
}).on('error', (err) => {
    fs.unlink(dest, () => {});
    console.error(`Error downloading map data: ${err.message}`);
});
