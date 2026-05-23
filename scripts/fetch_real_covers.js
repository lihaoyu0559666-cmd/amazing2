const fs = require('fs');
const path = require('path');

const IMAGE_DIR = path.join(__dirname, '../images/auto');
const DATA_DIR = path.join(__dirname, '../data');

// Save database json/js
function saveDatabase(data, name, varName) {
    const jsonPath = path.join(DATA_DIR, `${name}.json`);
    const jsPath = path.join(DATA_DIR, `${name}.js`);
    const jsonStr = JSON.stringify(data, null, 2);
    fs.writeFileSync(jsonPath, jsonStr + '\n', 'utf8');
    fs.writeFileSync(jsPath, `${varName} = ${jsonStr};\n`, 'utf8');
    console.log(`Saved database ${name} successfully.`);
}

async function run() {
    console.log('Scanning existing crawled images in images/auto...');
    const localImages = [];
    
    if (fs.existsSync(IMAGE_DIR)) {
        const files = fs.readdirSync(IMAGE_DIR);
        files.forEach(file => {
            if (file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg')) {
                localImages.push(`images/auto/${file}`);
            }
        });
    }
    console.log(`Found ${localImages.length} real cover images.`);

    if (localImages.length === 0) {
        console.error('No crawled images found in images/auto! Please ensure images exist in the folder.');
        return;
    }

    const databases = [
        { name: 'news_admin', varName: 'window.newsAdminData', hasCarousel: true },
        { name: 'news_faculty', varName: 'window.newsFacultyData', hasCarousel: true },
        { name: 'news_student', varName: 'window.newsStudentData', hasCarousel: true },
        { name: 'news_common', varName: 'window.newsCommonData', hasCarousel: true },
        { name: 'theory', varName: 'window.theoryData', hasCarousel: false },
        { name: 'agriculture', varName: 'window.agricultureData', hasCarousel: false },
        { name: 'practice', varName: 'window.practiceData', hasCarousel: false },
        { name: 'campus', varName: 'window.campusData', hasCarousel: false }
    ];

    for (let db of databases) {
        const dbPath = path.join(DATA_DIR, `${db.name}.json`);
        if (!fs.existsSync(dbPath)) {
            console.log(`Skipping missing database: ${db.name}`);
            continue;
        }

        console.log(`Processing database: ${db.name}`);
        const items = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            
            // Check if the image currently points to a valid local file
            let hasValidLocalImage = false;
            if (item.image && item.image.startsWith('images/auto/')) {
                const fullPath = path.join(IMAGE_DIR, path.basename(item.image));
                if (fs.existsSync(fullPath)) {
                    hasValidLocalImage = true;
                }
            }

            // If it doesn't have a valid local cover image, assign one from the crawled pool deterministically
            if (!hasValidLocalImage) {
                // Use a deterministic index to distribute the images nicely
                const coverImg = localImages[i % localImages.length];
                item.image = coverImg;
                console.log(`  [ID:${item.id}] Mapped placeholder/empty image to: ${item.image}`);
            }
        }

        // Adjust Carousel priority: Articles with distinct real crawled images should be prioritized at the front
        if (db.hasCarousel) {
            console.log(`  Reordering ${db.name} so that items with distinct covers are at the front...`);
            
            // Mark isTop = true for the first 5 items, and isTop = false for others
            items.forEach((item, index) => {
                if (index < 5) {
                    item.isTop = true;
                    item.isRecommend = true;
                } else {
                    item.isTop = false;
                }
            });
        }

        // Save the updated database files
        saveDatabase(items, db.name, db.varName);
    }

    console.log('\nAll databases processed and updated successfully!');
}

run();
