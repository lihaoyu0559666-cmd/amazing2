const fs = require('fs');
const path = require('path');

const projectDir = 'f:/反重力/御丞的奇妙比赛项目';
const dataDir = path.join(projectDir, 'data');
const autoImagesDir = path.join(projectDir, 'images/auto');

console.log('--- 开始清除思政育人、校园动态板块的数据及图片库 ---');

// 1. 清空思政育人 (practice) 和 校园动态 (campus) 数据库
const emptyData = [];

fs.writeFileSync(path.join(dataDir, 'practice.json'), JSON.stringify(emptyData, null, 2), 'utf8');
fs.writeFileSync(path.join(dataDir, 'practice.js'), 'window.practiceData = [];\n', 'utf8');
console.log('已清空 思政育人 (practice) 数据库。');

fs.writeFileSync(path.join(dataDir, 'campus.json'), JSON.stringify(emptyData, null, 2), 'utf8');
fs.writeFileSync(path.join(dataDir, 'campus.js'), 'window.campusData = [];\n', 'utf8');
console.log('已清空 校园动态 (campus) 数据库。');

// 2. 清理物理图片文件夹 images/auto/ 中对应板块的图片
if (fs.existsSync(autoImagesDir)) {
    const files = fs.readdirSync(autoImagesDir);
    let deleteCount = 0;

    files.forEach(file => {
        if (file.startsWith('cover_practice_') || file.startsWith('cover_campus_')) {
            const filePath = path.join(autoImagesDir, file);
            try {
                fs.unlinkSync(filePath);
                deleteCount++;
            } catch (err) {
                console.error(`删除图片文件 ${file} 失败:`, err.message);
            }
        }
    });

    console.log(`物理图片清理完毕！共成功删除了 ${deleteCount} 张思政育人和校园动态的封面图。`);
} else {
    console.log('未找到 images/auto 目录，跳过物理图片删除。');
}

console.log('--- 清除成功结束 ---');
