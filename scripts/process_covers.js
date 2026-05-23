const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = 'f:\\反重力\\御丞的奇妙比赛项目\\data';
const IMAGE_DIR = 'f:\\反重力\\御丞的奇妙比赛项目\\images\\auto';

// Blacklisted MD5 hashes for site-wide logos/banners/placeholders
const BLACKLISTED_HASHES = new Set([
    '89a29593a2d52cfde33a0a6a19606be1', // dxs.moe.gov.cn logo (26,889 bytes)
    '38faa441068857330a046769aaa54508', // sizhengwang.cn header banner (971,355 bytes)
    'd817b5e9c3d59c9defe528dbd2b964f3', // sizhengwang.cn logo (34,320 bytes)
    '6f4ea44057183114c8f053c67be3eca7', // old 4.2KB PNG placeholders
    '0e9ff711a88f1b668f3bd36afd8cdac9', // static.bjnews.com.cn footer placeholder (49,862 bytes)
    'c86c76bef42b4db9aa94ad9d87b69360', // sizhengwang.cn generic text placeholder (54,484 bytes)
    'b8f0a971b20b86c0ec29b3ab747c0e00', // people.com.cn audio headphones icon (176,532 bytes)
    '0f77e7f268d27f564bb0a24ba64baab3', // xinhuanet.com app QR code placeholder (29,344 bytes)
    '953cf057f7df302bd348a63611681039'  // bjnews.com.cn app QR code placeholder (35,963 bytes)
]);

const DATABASES = [
    { name: 'news_admin', varName: 'window.newsAdminData', hasCarousel: true },
    { name: 'news_faculty', varName: 'window.newsFacultyData', hasCarousel: true },
    { name: 'news_student', varName: 'window.newsStudentData', hasCarousel: true },
    { name: 'news_common', varName: 'window.newsCommonData', hasCarousel: true, isCommon: true },
    { name: 'theory', varName: 'window.theoryData', hasCarousel: false },
    { name: 'agriculture', varName: 'window.agricultureData', hasCarousel: false, isAgri: true },
    { name: 'practice', varName: 'window.practiceData', hasCarousel: true },
    { name: 'campus', varName: 'window.campusData', hasCarousel: true }
];

function saveDatabase(items, name, varName) {
    const jsonPath = path.join(DATA_DIR, `${name}.json`);
    const jsPath = path.join(DATA_DIR, `${name}.js`);
    
    // JSON file
    const jsonStr = JSON.stringify(items, null, 2);
    fs.writeFileSync(jsonPath, jsonStr + '\n', 'utf8');
    
    // JS file
    fs.writeFileSync(jsPath, `${varName} = ${jsonStr};\n`, 'utf8');
    console.log(`  Saved database ${name} successfully (total items: ${items.length}).`);
}

function getCrawledImage(dbName, itemId) {
    const exts = ['.jpg', '.png', '.jpeg', '.webp'];
    for (const ext of exts) {
        const filename = `cover_${dbName}_${itemId}${ext}`;
        const fullPath = path.join(IMAGE_DIR, filename);
        if (fs.existsSync(fullPath)) {
            const size = fs.statSync(fullPath).size;
            if (size > 15000) {
                // Calculate MD5 hash to filter out blacklisted logos
                const buffer = fs.readFileSync(fullPath);
                const hash = crypto.createHash('md5').update(buffer).digest('hex');
                if (BLACKLISTED_HASHES.has(hash)) {
                    return null;
                }
                return `images/auto/${filename}`;
            }
        }
    }
    return null;
}

function run() {
    console.log('Starting cover processing script with universal Theory AI mapping & custom filters...');
    
    DATABASES.forEach(db => {
        const jsonPath = path.join(DATA_DIR, `${db.name}.json`);
        if (!fs.existsSync(jsonPath)) {
            console.log(`Skipping missing database: ${db.name}`);
            return;
        }
        
        console.log(`Processing database: ${db.name}...`);
        let items = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        
        // 1. Map images
        items.forEach(item => {
            if (db.isAgri) {
                // Constraint: All agriculture images set to "" for manual update later
                item.image = "";
            } else if (db.name === 'theory') {
                // Constraint: All theory articles use the exact same AI fallback image
                item.image = "images/auto/theory_ai_cover.png";
            } else {
                const crawledPath = getCrawledImage(db.name, item.id);
                if (crawledPath) {
                    item.image = crawledPath;
                } else {
                    item.image = "";
                }
            }
        });
        
        // 2. Sort and update flags
        if (db.hasCarousel) {
            if (db.isCommon) {
                // For news_common, we group by category and sort/set isTop within each category
                const categories = ['学习', '要闻', '学校', '北京'];
                let processedItems = [];
                
                categories.forEach(cat => {
                    const catItems = items.filter(item => item.category === cat);
                    
                    if (cat === '北京' || cat === '学校' || cat === '要闻') {
                        // Sort by size of images
                        catItems.sort((a, b) => {
                            const aHas = a.image !== "" ? 1 : 0;
                            const bHas = b.image !== "" ? 1 : 0;
                            if (aHas !== bHas) return bHas - aHas;
                            
                            // If both have images, sort by file size descending (highest quality first)
                            if (aHas) {
                                const aPath = path.join(IMAGE_DIR, path.basename(a.image));
                                const bPath = path.join(IMAGE_DIR, path.basename(b.image));
                                const aSize = fs.existsSync(aPath) ? fs.statSync(aPath).size : 0;
                                const bSize = fs.existsSync(bPath) ? fs.statSync(bPath).size : 0;
                                return bSize - aSize;
                            }
                            return 0;
                        });
                        
                        // Mark flags strictly: top 5 as isTop, top 7 as isRecommend
                        catItems.forEach((item, idx) => {
                            const hasCover = item.image !== "";
                            if (hasCover && idx < 5) {
                                item.isTop = true;
                            } else {
                                item.isTop = false;
                            }
                            
                            if (idx < 7) {
                                item.isRecommend = true;
                            } else {
                                item.isRecommend = false;
                            }
                        });
                    } else {
                        // Sort so that items with images come first
                        catItems.sort((a, b) => {
                            const aHas = a.image !== "" ? 1 : 0;
                            const bHas = b.image !== "" ? 1 : 0;
                            return bHas - aHas; // 1s before 0s
                        });
                        
                        // Set isTop to true only for the first 5 that actually have images
                        let topCount = 0;
                        catItems.forEach(item => {
                            if (item.image !== "" && topCount < 5) {
                                item.isTop = true;
                                item.isRecommend = true;
                                topCount++;
                            } else {
                                item.isTop = false;
                            }
                        });
                    }
                    
                    processedItems = processedItems.concat(catItems);
                });
                
                // Add any categories not in the main list
                const otherItems = items.filter(item => !categories.includes(item.category));
                processedItems = processedItems.concat(otherItems);
                
                items = processedItems;
            } else {
                // For news_admin, news_faculty, news_student
                // Sort so that items with images come first
                items.sort((a, b) => {
                    const aHas = a.image !== "" ? 1 : 0;
                    const bHas = b.image !== "" ? 1 : 0;
                    return bHas - aHas;
                });
                
                // Set isTop to true only for the first 5 that have images
                let topCount = 0;
                items.forEach((item, idx) => {
                    if (item.image !== "" && topCount < 5) {
                        item.isTop = true;
                        item.isRecommend = true;
                        topCount++;
                    } else {
                        item.isTop = false;
                    }
                    // Keep the first 7 as recommend if possible
                    if (idx < 7) {
                        item.isRecommend = true;
                    }
                });
            }
        } else if (!db.isAgri) {
            // For theory, practice, campus: sort so that items with unique images are displayed first
            items.sort((a, b) => {
                const aHas = (a.image !== "" && a.image !== "images/auto/theory_ai_cover.png") ? 1 : 0;
                const bHas = (b.image !== "" && b.image !== "images/auto/theory_ai_cover.png") ? 1 : 0;
                return bHas - aHas;
            });
        }
        
        // Save database back
        saveDatabase(items, db.name, db.varName);
    });
    
    console.log('Cover processing completed successfully!');
}

run();
