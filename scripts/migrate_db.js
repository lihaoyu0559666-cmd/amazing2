const fs = require('fs');
const path = require('path');

const newsBakPath = path.join(__dirname, '../data/news_bak.json');

// Target databases configuration
const targets = {
    news_admin: {
        json: path.join(__dirname, '../data/news_admin.json'),
        js: path.join(__dirname, '../data/news_admin.js'),
        varName: 'window.newsAdminData'
    },
    news_faculty: {
        json: path.join(__dirname, '../data/news_faculty.json'),
        js: path.join(__dirname, '../data/news_faculty.js'),
        varName: 'window.newsFacultyData'
    },
    news_student: {
        json: path.join(__dirname, '../data/news_student.json'),
        js: path.join(__dirname, '../data/news_student.js'),
        varName: 'window.newsStudentData'
    },
    news_common: {
        json: path.join(__dirname, '../data/news_common.json'),
        js: path.join(__dirname, '../data/news_common.js'),
        varName: 'window.newsCommonData'
    },
    agriculture: {
        json: path.join(__dirname, '../data/agriculture.json'),
        js: path.join(__dirname, '../data/agriculture.js'),
        varName: 'window.agricultureData'
    },
    practice: {
        json: path.join(__dirname, '../data/practice.json'),
        js: path.join(__dirname, '../data/practice.js'),
        varName: 'window.practiceData'
    },
    campus: {
        json: path.join(__dirname, '../data/campus.json'),
        js: path.join(__dirname, '../data/campus.js'),
        varName: 'window.campusData'
    }
};

function saveDb(data, target) {
    const jsonStr = JSON.stringify(data, null, 2);
    fs.writeFileSync(target.json, jsonStr + '\n', 'utf8');
    fs.writeFileSync(target.js, `${target.varName} = ${jsonStr};\n`, 'utf8');
}

function runMigration() {
    console.log('Starting unified database migration...');

    if (!fs.existsSync(newsBakPath)) {
        console.error(`Error: Backup database not found at ${newsBakPath}`);
        process.exit(1);
    }

    const backupData = JSON.parse(fs.readFileSync(newsBakPath, 'utf8'));
    console.log(`Successfully loaded ${backupData.length} items from backup database.`);

    // 1. news_admin, news_faculty, news_student (Recommend category items)
    const recommendItems = backupData.filter(item => item.category === '推荐').map(item => {
        const newItem = { ...item };
        newItem.image = ''; // Reset image so it can be auto-scraped
        return newItem;
    });
    console.log(`Found ${recommendItems.length} "推荐" items. Syncing to role databases...`);
    saveDb(recommendItems, targets.news_admin);
    saveDb(recommendItems, targets.news_faculty);
    saveDb(recommendItems, targets.news_student);

    // 2. news_common (Shared common database for navigation: 要闻, 学习, 北京, 学校)
    const commonCategories = ['要闻', '学习', '北京', '学校'];
    const commonItems = backupData.filter(item => commonCategories.includes(item.category)).map(item => {
        const newItem = { ...item };
        newItem.image = ''; // Reset image so it can be auto-scraped
        return newItem;
    });
    console.log(`Found ${commonItems.length} common items. Syncing to news_common database...`);
    saveDb(commonItems, targets.news_common);

    // 3. agriculture (Agriculture category items)
    const agricultureItems = backupData.filter(item => item.category === '强农兴农').map(item => {
        const newItem = { ...item };
        newItem.image = '';
        return newItem;
    });
    console.log(`Found ${agricultureItems.length} "强农兴农" items. Syncing to agriculture database...`);
    saveDb(agricultureItems, targets.agriculture);

    // 4. practice (Beijing category items ➡️ renamed to "思政育人")
    const practiceItems = backupData.filter(item => item.category === '北京').map(item => {
        const newItem = { ...item };
        newItem.category = '思政育人'; // Rename category to "思政育人" in practice.json
        newItem.image = '';
        return newItem;
    });
    console.log(`Found ${practiceItems.length} "北京" items. Renaming to "思政育人" and syncing to practice database...`);
    saveDb(practiceItems, targets.practice);

    // 5. campus (School category items)
    const campusItems = backupData.filter(item => item.category === '学校').map(item => {
        const newItem = { ...item };
        newItem.image = '';
        return newItem;
    });
    console.log(`Found ${campusItems.length} "学校" items. Syncing to campus database...`);
    saveDb(campusItems, targets.campus);

    console.log('Database migration successfully completed!');
}

runMigration();
