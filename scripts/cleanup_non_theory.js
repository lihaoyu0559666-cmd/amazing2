const fs = require('fs');
const path = require('path');

const projectDir = 'f:/反重力/御丞的奇妙比赛项目';
const dataDir = path.join(projectDir, 'data');
const autoImagesDir = path.join(projectDir, 'images/auto');

console.log('--- 开始清理非“理论学习”内容 ---');

// 1. 读取 theoryData 作为模板
const theoryJsonPath = path.join(dataDir, 'theory.json');
const theoryData = JSON.parse(fs.readFileSync(theoryJsonPath, 'utf8'));
console.log(`载入理论学习模板数据，共 ${theoryData.length} 条。`);

// 2. 清空强农兴农 (agriculture)、思政育人 (practice)、校园动态 (campus)
const emptyData = [];

fs.writeFileSync(path.join(dataDir, 'agriculture.json'), JSON.stringify(emptyData, null, 2), 'utf8');
fs.writeFileSync(path.join(dataDir, 'agriculture.js'), 'window.agricultureData = [];\n', 'utf8');
console.log('已清空 强农兴农 数据库。');

fs.writeFileSync(path.join(dataDir, 'practice.json'), JSON.stringify(emptyData, null, 2), 'utf8');
fs.writeFileSync(path.join(dataDir, 'practice.js'), 'window.practiceData = [];\n', 'utf8');
console.log('已清空 思政育人 数据库。');

fs.writeFileSync(path.join(dataDir, 'campus.json'), JSON.stringify(emptyData, null, 2), 'utf8');
fs.writeFileSync(path.join(dataDir, 'campus.js'), 'window.campusData = [];\n', 'utf8');
console.log('已清空 校园动态 数据库。');

// 3. 清洗公共新闻库 news_common.js / json，仅保留“学习”大类
const commonJsonPath = path.join(dataDir, 'news_common.json');
const commonData = JSON.parse(fs.readFileSync(commonJsonPath, 'utf8'));
const filteredCommon = commonData.filter(item => item.category === '学习');

fs.writeFileSync(commonJsonPath, JSON.stringify(filteredCommon, null, 2), 'utf8');
fs.writeFileSync(path.join(dataDir, 'news_common.js'), `window.newsCommonData = ${JSON.stringify(filteredCommon, null, 2)};\n`, 'utf8');
console.log(`公共新闻库清理完毕，仅保留“学习”类文章 ${filteredCommon.length} 条。`);

// 4. 重构推荐数据库 news_admin, news_faculty, news_student
// 选用 theoryData 中的前 10 条作为推荐文章，并改其分类为“推荐”
const baseRecommend = theoryData.slice(0, 10).map((item, idx) => {
    return {
        ...item,
        category: '推荐',
        isTop: idx < 3, // 前3条作为轮播头条
        isRecommend: true
    };
});

// 管理员推荐
fs.writeFileSync(path.join(dataDir, 'news_admin.json'), JSON.stringify(baseRecommend, null, 2), 'utf8');
fs.writeFileSync(path.join(dataDir, 'news_admin.js'), `window.newsAdminData = ${JSON.stringify(baseRecommend, null, 2)};\n`, 'utf8');
console.log('管理员推荐库重构完成（替换为理论学习文章）。');

// 教师推荐
fs.writeFileSync(path.join(dataDir, 'news_faculty.json'), JSON.stringify(baseRecommend, null, 2), 'utf8');
fs.writeFileSync(path.join(dataDir, 'news_faculty.js'), `window.newsFacultyData = ${JSON.stringify(baseRecommend, null, 2)};\n`, 'utf8');
console.log('专任教师推荐库重构完成（替换为理论学习文章）。');

// 学生推荐
fs.writeFileSync(path.join(dataDir, 'news_student.json'), JSON.stringify(baseRecommend, null, 2), 'utf8');
fs.writeFileSync(path.join(dataDir, 'news_student.js'), `window.newsStudentData = ${JSON.stringify(baseRecommend, null, 2)};\n`, 'utf8');
console.log('学生思政队伍推荐库重构完成（替换为理论学习文章）。');

// 5. 搜集保留所有依然在使用的图片路径
const keepImages = new Set();

// 收集 theory 里的图片
theoryData.forEach(item => {
    if (item.image) keepImages.add(path.basename(item.image));
});

// 收集 filteredCommon 里的图片
filteredCommon.forEach(item => {
    if (item.image) keepImages.add(path.basename(item.image));
});

// 收集 baseRecommend 里的图片
baseRecommend.forEach(item => {
    if (item.image) keepImages.add(path.basename(item.image));
});

console.log(`有效图片集数量: ${keepImages.size}`);
console.log('保留的图片名称样本:', Array.from(keepImages).slice(0, 5));

// 6. 清理物理图片文件夹 images/auto/
if (fs.existsSync(autoImagesDir)) {
    const files = fs.readdirSync(autoImagesDir);
    let deleteCount = 0;
    let keepCount = 0;

    files.forEach(file => {
        if (keepImages.has(file)) {
            keepCount++;
        } else {
            // 删除非理论学习的封面图片
            const filePath = path.join(autoImagesDir, file);
            fs.unlinkSync(filePath);
            deleteCount++;
        }
    });

    console.log(`物理图片清理完毕！共保留 ${keepCount} 张理论学习封面图，删除了 ${deleteCount} 张其他分类的无效封面图。`);
} else {
    console.log('未找到 images/auto 目录，跳过物理图片删除。');
}

console.log('--- 清理非“理论学习”内容 成功结束 ---');
