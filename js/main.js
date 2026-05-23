/**
 * 中国农业大学“耘思”大思政平台 - 门户首页 JavaScript 交互与动态渲染
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. 初始化动态日期
    initDateDisplay();

    // 2. 导航栏交互 (实现点击大类切换轮播与推荐内容)
    initNavInteraction();

    // 3. 新增顶部大图横幅自动轮播
    initBannerCarousel();

    // 4. 新增可交互本地搜索引擎接口
    initSearch();

    // 5. 加载并渲染动态数据
    loadAppData();
});

/**
 * 格式化并显示当前日期
 */
function initDateDisplay() {
    const dateEl = document.getElementById('current-date');
    if (!dateEl) return;

    const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const day = days[now.getDay()];

    dateEl.textContent = `今天是：${year}年${month}月${date}日 ${day}`;
}

/**
 * 导航栏点击切换 Active 状态，并实时过滤轮播图和重点推荐内容
 */
function initNavInteraction() {
    const navItems = document.querySelectorAll('.nav-menu-item');
    navItems.forEach(item => {
        const link = item.querySelector('a');
        if (link) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                navItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                const categoryName = link.textContent.trim();
                updateCategoryContent(categoryName);
            });
        }
    });
}

/**
 * 统一加载项目数据并渲染（直接读取全局注入的数据变量）
 */
function loadAppData() {
    try {
        const hasNews = window.newsAdminData || window.newsFacultyData || window.newsStudentData || window.newsCommonData;
        if (hasNews) {
            renderAllNews();
        } else {
            console.warn('本地新闻数据未加载或为空');
        }

        if (window.resourcesData && window.resourcesData.length > 0) {
            renderResources(window.resourcesData);
        } else {
            console.warn('本地 resourcesData 数据未加载或为空');
        }
    } catch (error) {
        console.error('数据渲染过程发生错误:', error);
    }
}

/**
 * 格式化目标链接，直接跳转到外部链接
 */
function getTargetUrl(item) {
    return item.url && item.url !== '#' ? item.url : '#';
}

/**
 * 统一分发渲染各模块新闻 (初始化时调用)
 */
function renderAllNews() {
    // 1. 初始化渲染“推荐”分类下的轮播图和重点推荐 (会自动识别当前是哪个角色的专属推荐)
    updateCategoryContent('推荐');

    // 2. 渲染下方的四个固定分类卡片模块，使用完全独立且统一的数据源
    const theoryNews = window.theoryData || [];
    renderCategoryList('theory-list', theoryNews.slice(0, 5));

    const agriNews = window.agricultureData || [];
    renderCategoryList('agri-list', agriNews.slice(0, 5));

    const beijingNews = window.practiceData || [];
    renderCategoryList('beijing-list', beijingNews.slice(0, 5));

    const campusNews = window.campusData || [];
    renderCategoryList('campus-list', campusNews.slice(0, 5));
}

/**
 * 根据所选分类，动态切换上方轮播图与重点推荐列表
 */
function updateCategoryContent(categoryName) {
    // 每日答题、每日十分钟只在推荐栏目时出现，选择其他导航时隐藏
    const specialLearningBanner = document.querySelector('.special-learning-banner');
    if (specialLearningBanner) {
        if (categoryName === '推荐') {
            specialLearningBanner.style.display = '';
        } else {
            specialLearningBanner.style.display = 'none';
        }
    }

    // 顶部大图横幅轮播只在推荐栏目时出现，选择其他导航时隐藏
    const topBannerSection = document.querySelector('.top-banner-carousel-section');
    if (topBannerSection) {
        if (categoryName === '推荐') {
            topBannerSection.style.display = '';
        } else {
            topBannerSection.style.display = 'none';
        }
    }

    let news = [];

    // 只有“推荐”分类具有角色差异化：根据当前页面加载的专属变量获取数据
    if (categoryName === '推荐') {
        if (window.newsAdminData) {
            news = window.newsAdminData;
        } else if (window.newsFacultyData) {
            news = window.newsFacultyData;
        } else if (window.newsStudentData) {
            news = window.newsStudentData;
        }
    } else {
        // “要闻”、“学习”、“北京”、“学校”分类为全局公用新闻，统一用 newsCommonData 渲染
        news = window.newsCommonData || [];
    }

    let carouselNews = [];
    let recommendNews = [];

    if (categoryName === '推荐') {
        // 推荐分类：展示该角色专属库下的 isTop 与 isRecommend
        carouselNews = news.filter(item => item.isTop).slice(0, 5);
        recommendNews = news.filter(item => item.isRecommend).slice(0, 7);

        // 如果该角色下没有设 Top 或 Recommend，以前几条兜底展示
        if (carouselNews.length === 0) carouselNews = news.slice(0, 5);
        if (recommendNews.length === 0) recommendNews = news.slice(0, 7);
    } else {
        // 其他公用分类：在公用库下过滤对应的 category
        const categoryFiltered = news.filter(item => item.category === categoryName);

        carouselNews = categoryFiltered.filter(item => item.isTop);
        if (carouselNews.length === 0) {
            carouselNews = categoryFiltered.slice(0, 5);
        } else {
            carouselNews = carouselNews.slice(0, 5);
        }

        recommendNews = categoryFiltered.filter(item => item.isRecommend);
        if (recommendNews.length === 0) {
            recommendNews = categoryFiltered.slice(0, 7);
        } else {
            recommendNews = recommendNews.slice(0, 7);
        }
    }

    // 重新渲染轮播图与右侧重点推荐
    renderCarousel(carouselNews);
    renderRecommendList(recommendNews);
}

/**
 * 渲染轮播图
 */
function renderCarousel(newsList) {
    const container = document.getElementById('carousel-inner');
    const dotsContainer = document.querySelector('.carousel-dots');

    if (!container) return;

    // 当列表为空时显示优雅的占位图
    if (newsList.length === 0) {
        container.innerHTML = `
            <div class="carousel-slide active">
                <div class="image-placeholder-gradient slide-1" style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%;">
                    <svg class="placeholder-icon" viewBox="0 0 24 24" style="width: 64px; height: 64px; fill: rgba(255,255,255,0.4); margin-bottom: 15px;">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71z"/>
                    </svg>
                    <span style="font-size: 1.15rem; font-weight: bold; color: rgba(255,255,255,0.85); text-shadow: 1px 1px 3px rgba(0,0,0,0.3);">暂无对应分类的头条新闻，等待录入...</span>
                </div>
            </div>
        `;
        if (dotsContainer) dotsContainer.innerHTML = '';
        return;
    }

    let html = '';
    let dotsHtml = '';

    newsList.forEach((item, index) => {
        const isActive = index === 0 ? 'active' : '';
        const targetUrl = getTargetUrl(item);

        const hasImage = item.image && item.image.trim() !== '';
        const bgStyle = hasImage ? `background-image: url('${item.image}'); background-size: cover; background-position: center;` : '';

        html += `
            <div class="carousel-slide ${isActive}" onclick="window.open('${targetUrl}', '_blank')" style="cursor: pointer;">
                <div class="image-placeholder-gradient slide-${(index % 3) + 1}" style="${bgStyle}">
                    ${!hasImage ? `
                    <svg class="placeholder-icon" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <span class="placeholder-text" style="font-size: 1.2rem; margin-top: 10px; font-weight: bold; text-shadow: 1px 1px 3px rgba(0,0,0,0.5);">${item.title}</span>
                    ` : ''}
                </div>
                <div class="carousel-caption">
                    <span class="caption-tag">${item.category}</span>
                    <h2>${item.title}</h2>
                    <p>${item.summary}</p>
                </div>
            </div>
        `;

        dotsHtml += `<span class="dot ${isActive}" data-index="${index}"></span>`;
    });

    container.innerHTML = html;
    if (dotsContainer) dotsContainer.innerHTML = dotsHtml;

    // 渲染完成后重新初始化轮播图事件
    initCarouselEvents();
}

/**
 * 渲染右侧重点推荐列表
 */
function renderRecommendList(newsList) {
    const container = document.getElementById('recommend-list');
    if (!container) return;

    if (newsList.length === 0) {
        container.innerHTML = `
            <li class="recommend-item" style="text-align: center; color: var(--text-muted); padding: 30px 0; font-size: 0.95rem;">
                暂无推荐文章
            </li>
        `;
        return;
    }

    let html = '';
    newsList.forEach((item, index) => {
        const isHighlight = index === 0 ? 'highlight' : '';
        const dateStr = item.date && item.date !== '长期更新' ? item.date.substring(5, 10) : '学习';
        const titlePrefix = isHighlight ? '【高亮推荐】' : '';
        const targetUrl = getTargetUrl(item);

        html += `
            <li class="recommend-item ${isHighlight}">
                <a href="${targetUrl}" target="_blank" class="recommend-item-link" title="${item.title}">${titlePrefix}${item.title}</a>
                <span class="recommend-item-date">${dateStr}</span>
            </li>
        `;
    });
    container.innerHTML = html;
}

/**
 * 通用分类列表渲染
 */
function renderCategoryList(containerId, newsList) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const moduleBox = container.closest('.card-module');
    const placeholder = moduleBox ? moduleBox.querySelector('.small-image-placeholder') : null;

    // 默认显示的图片项（刚开始设置为序号一）
    const defaultImageItem = newsList[0];

    // 1. 如果数据为空，清空卡片列表，并复原占位图
    if (newsList.length === 0) {
        container.innerHTML = `
            <li class="card-list-item" style="justify-content: center; color: var(--text-muted); padding: 25px 0; font-size: 0.95rem;">
                暂无文章数据
            </li>
        `;
        if (placeholder) {
            placeholder.style.backgroundImage = 'none';
            const svg = placeholder.querySelector('svg');
            const span = placeholder.querySelector('span');
            if (svg) svg.style.display = '';
            if (span) span.style.display = '';
            const oldLink = placeholder.querySelector('.img-cover-link');
            if (oldLink) oldLink.remove();
        }
        return;
    }

    // 设置占位图样式的辅助函数
    function setPlaceholderImage(item) {
        if (!placeholder) return;
        if (item && item.image && item.image.trim() !== '') {
            placeholder.style.position = 'relative';
            placeholder.style.backgroundImage = `url('${item.image}')`;
            placeholder.style.backgroundSize = 'cover';
            placeholder.style.backgroundPosition = 'center';

            // 隐藏原有的图标和文字
            const svg = placeholder.querySelector('svg');
            const span = placeholder.querySelector('span');
            if (svg) svg.style.display = 'none';
            if (span) span.style.display = 'none';

            // 添加/重置绝对定位的跳转遮罩链接
            let coverLink = placeholder.querySelector('.img-cover-link');
            if (!coverLink) {
                coverLink = document.createElement('a');
                coverLink.className = 'img-cover-link';
                coverLink.target = '_blank';
                coverLink.style.cssText = 'display:block; width:100%; height:100%; position:absolute; left:0; top:0; z-index:2;';
                placeholder.appendChild(coverLink);
            }
            coverLink.href = getTargetUrl(item);
        } else {
            // 复原默认占位显示
            placeholder.style.backgroundImage = 'none';
            const svg = placeholder.querySelector('svg');
            const span = placeholder.querySelector('span');
            if (svg) svg.style.display = '';
            if (span) span.style.display = '';
            const oldLink = placeholder.querySelector('.img-cover-link');
            if (oldLink) oldLink.remove();
        }
    }

    // 2. 初始化默认封面图展示 (首次加载置为序号一)
    setPlaceholderImage(defaultImageItem);

    // 3. 渲染 HTML 列表内容
    let html = '';
    newsList.forEach(item => {
        const dateStr = item.date && item.date !== '长期更新' ? item.date.substring(5, 10) : '学习';
        const targetUrl = getTargetUrl(item);
        const itemImage = item.image && item.image.trim() !== '' ? item.image : '';

        html += `
            <li class="card-list-item" data-image="${itemImage}" data-url="${targetUrl}">
                <a href="${targetUrl}" target="_blank" class="card-list-link" title="${item.title}">${item.title}</a>
                <span class="card-list-date">${dateStr}</span>
            </li>
        `;
    });
    container.innerHTML = html;

    // 4. 绑定鼠标滑过标题时，动态切换对应图片与跳转链接的事件
    if (placeholder) {
        const items = container.querySelectorAll('.card-list-item');
        items.forEach(itemEl => {
            const imgUrl = itemEl.getAttribute('data-image');
            const targetUrl = itemEl.getAttribute('data-url');

            // 鼠标悬浮移入：改变图片，当鼠标移出时，保留上一次滑过的状态，不设 mouseleave 复位
            itemEl.addEventListener('mouseenter', () => {
                setPlaceholderImage({ image: imgUrl, url: targetUrl });
            });
        });
    }
}

/**
 * 渲染学习资源入口卡片
 */
function renderResources(resourcesList) {
    const container = document.getElementById('resource-grid');
    if (!container) return;

    // 预设卡片样式类数组
    const cardClasses = ['card-xuexi', 'card-people', 'card-xinhua', 'card-cau', 'card-cyol'];

    let html = '';
    resourcesList.forEach((item, index) => {
        const cardClass = cardClasses[index % cardClasses.length];

        // 提取名称的前4个字作为 logo 文字，按两行换行
        const shortName = item.name.substring(0, 4);
        const logoText = shortName.length > 2 ? `${shortName.substring(0, 2)}<br>${shortName.substring(2, 4)}` : shortName;

        html += `
            <div class="resource-card ${cardClass}">
                <div class="resource-header">
                    <div class="resource-logo-box">
                        <span class="text-logo">${logoText}</span>
                    </div>
                    <h4>${item.name}</h4>
                </div>
                <p class="resource-desc">${item.description}</p>
                <a href="${item.url}" class="resource-link-btn" target="${item.url !== '#' ? '_blank' : '_self'}">进入学习 &raquo;</a>
            </div>
        `;
    });

    container.innerHTML = html;
}

/**
 * 轮播图核心逻辑事件绑定
 */
function initCarouselEvents() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    const carouselWrapper = document.querySelector('.carousel-wrapper');

    if (slides.length === 0) return;

    let currentIndex = 0;
    let timer = null;
    const intervalTime = 5000;

    function goToSlide(index) {
        slides[currentIndex].classList.remove('active');
        if (dots[currentIndex]) dots[currentIndex].classList.remove('active');

        currentIndex = (index + slides.length) % slides.length;

        slides[currentIndex].classList.add('active');
        if (dots[currentIndex]) dots[currentIndex].classList.add('active');
    }

    function nextSlide() { goToSlide(currentIndex + 1); }
    function prevSlide() { goToSlide(currentIndex - 1); }

    function startAutoPlay() {
        if (!timer) timer = setInterval(nextSlide, intervalTime);
    }
    function stopAutoPlay() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }

    // 清理旧事件再绑定（避免多次执行 loadAppData 导致重复绑定）
    if (prevBtn) {
        const newPrev = prevBtn.cloneNode(true);
        prevBtn.parentNode.replaceChild(newPrev, prevBtn);
        newPrev.addEventListener('click', (e) => { e.preventDefault(); prevSlide(); });
    }

    if (nextBtn) {
        const newNext = nextBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(newNext, nextBtn);
        newNext.addEventListener('click', (e) => { e.preventDefault(); nextSlide(); });
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', (e) => {
            e.preventDefault();
            goToSlide(index);
        });
    });

    if (carouselWrapper) {
        carouselWrapper.addEventListener('mouseenter', stopAutoPlay);
        carouselWrapper.addEventListener('mouseleave', startAutoPlay);
    }

    startAutoPlay();
}

/**
 * 初始化顶部大图横幅轮播 (Banner Carousel)
 */
function initBannerCarousel() {
    const slides = document.querySelectorAll('.banner-carousel-slide');
    const dots = document.querySelectorAll('.banner-carousel-dots .banner-dot');
    const prevBtn = document.querySelector('.banner-carousel-btn.prev');
    const nextBtn = document.querySelector('.banner-carousel-btn.next');
    const wrapper = document.querySelector('.banner-carousel-wrapper');

    if (slides.length === 0) return;

    let currentIndex = 0;
    let timer = null;
    const intervalTime = 3000; // 轮播时间设置为 3 秒

    function goToSlide(index) {
        slides[currentIndex].classList.remove('active');
        if (dots[currentIndex]) dots[currentIndex].classList.remove('active');

        currentIndex = (index + slides.length) % slides.length;

        slides[currentIndex].classList.add('active');
        if (dots[currentIndex]) dots[currentIndex].classList.add('active');
    }

    function nextSlide() { goToSlide(currentIndex + 1); }
    function prevSlide() { goToSlide(currentIndex - 1); }

    function startAutoPlay() {
        if (!timer) timer = setInterval(nextSlide, intervalTime);
    }
    function stopAutoPlay() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            prevSlide();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            nextSlide();
        });
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', (e) => {
            e.preventDefault();
            goToSlide(index);
        });
    });

    if (wrapper) {
        wrapper.addEventListener('mouseenter', stopAutoPlay);
        wrapper.addEventListener('mouseleave', startAutoPlay);
    }

    startAutoPlay();
}

/**
 * 初始化搜索功能 (Local Interactive Search)
 */
function initSearch() {
    const searchInput = document.querySelector('.search-box input');
    const searchBtn = document.querySelector('.search-btn');

    if (!searchInput || !searchBtn) return;

    // 监听回车按键
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const keyword = searchInput.value.trim();
            if (keyword) {
                performSearch(keyword);
            }
        }
    });

    // 监听搜索按钮点击
    searchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const keyword = searchInput.value.trim();
        if (keyword) {
            performSearch(keyword);
        }
    });
}

/**
 * 聚合全站所有本地数据库链接
 */
function getSearchData() {
    let allData = [];

    // 1. 公共板块新闻 (学习、要闻、北京、学校)
    if (window.newsCommonData) {
        window.newsCommonData.forEach(item => {
            allData.push({
                ...item,
                dbSource: '公共新闻',
                sourceCategory: item.category || '其它'
            });
        });
    }

    // 2. 角色专有推荐新闻
    const roleNews = window.newsAdminData || window.newsFacultyData || window.newsStudentData;
    if (roleNews) {
        roleNews.forEach(item => {
            allData.push({
                ...item,
                dbSource: '推荐新闻',
                sourceCategory: '特别推荐'
            });
        });
    }

    // 3. 理论学习板块新闻
    if (window.theoryData) {
        window.theoryData.forEach(item => {
            allData.push({
                ...item,
                dbSource: '理论学习',
                sourceCategory: '理论学习'
            });
        });
    }

    // 4. 强农兴农板块新闻
    if (window.agricultureData) {
        window.agricultureData.forEach(item => {
            allData.push({
                ...item,
                dbSource: '强农兴农',
                sourceCategory: '强农兴农'
            });
        });
    }

    // 5. 思政育人/实践板块新闻
    if (window.practiceData) {
        window.practiceData.forEach(item => {
            allData.push({
                ...item,
                dbSource: '思政育人',
                sourceCategory: '思政育人'
            });
        });
    }

    // 6. 校园动态板块新闻
    if (window.campusData) {
        window.campusData.forEach(item => {
            allData.push({
                ...item,
                dbSource: '校园动态',
                sourceCategory: '校园动态'
            });
        });
    }

    // 7. 学习资源入口数据
    if (window.resourcesData) {
        window.resourcesData.forEach(item => {
            allData.push({
                id: item.id,
                title: item.name,
                url: item.url,
                summary: item.description,
                date: '长期有效',
                source: item.name,
                dbSource: '学习资源',
                sourceCategory: '资源入口',
                tags: ['资源平台', '外部链接']
            });
        });
    }

    // 去重处理 (优先保留非空url条目，基于 url 去重)
    const uniqueData = [];
    const seenUrls = new Set();

    allData.forEach(item => {
        if (item.url && item.url !== '#') {
            if (!seenUrls.has(item.url)) {
                seenUrls.add(item.url);
                uniqueData.push(item);
            }
        } else {
            uniqueData.push(item);
        }
    });

    return uniqueData;
}

/**
 * 执行搜索渲染
 */
function performSearch(keyword) {
    const searchData = getSearchData();
    const keywordLower = keyword.toLowerCase();

    // 进行多字段模糊过滤
    const results = searchData.filter(item => {
        const titleMatch = item.title && item.title.toLowerCase().includes(keywordLower);
        const summaryMatch = item.summary && item.summary.toLowerCase().includes(keywordLower);
        const sourceMatch = item.source && item.source.toLowerCase().includes(keywordLower);
        const tagsMatch = item.tags && item.tags.some(tag => tag.toLowerCase().includes(keywordLower));
        return titleMatch || summaryMatch || sourceMatch || tagsMatch;
    });

    // 隐藏主视图中的各个板块
    const sectionsToHide = [
        document.querySelector('.top-banner-carousel-section'),
        document.querySelector('.first-screen'),
        document.querySelector('.special-learning-banner'),
        document.querySelector('.content-grid-section')
    ];
    sectionsToHide.forEach(sec => {
        if (sec) sec.style.display = 'none';
    });

    // 清理可能已有的搜索结果区
    const oldResults = document.querySelector('.search-results-section');
    if (oldResults) oldResults.remove();

    // 创建搜索结果块
    const resultsSection = document.createElement('section');
    resultsSection.className = 'search-results-section';
    resultsSection.style.cssText = 'padding: 40px 0 60px 0; min-height: 60vh; background-color: var(--bg-page);';

    let resultsListHtml = '';
    if (results.length === 0) {
        // 无结果占位图
        resultsListHtml = `
            <div style="text-align: center; padding: 60px 0; color: var(--text-muted);">
                <svg class="placeholder-icon" viewBox="0 0 24 24" style="width: 64px; height: 64px; fill: #cbd5e1; margin-bottom: 15px;">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                <p style="font-size: 1.15rem; font-weight: 600; color: var(--text-main); margin-bottom: 8px;">未找到与 “${keyword}” 匹配的学习内容</p>
                <span style="font-size: 0.9rem;">请尝试使用其他关键字，如“习近平”、“农大”、“精神”、“科技”等。</span>
            </div>
        `;
    } else {
        // 卡片渲染列表
        resultsListHtml = `
            <div class="search-results-list" style="display: flex; flex-direction: column; gap: 20px;">
                ${results.map(item => {
            const dateStr = item.date && item.date !== '长期更新' ? item.date : '长期有效';
            const targetUrl = item.url && item.url !== '#' ? item.url : '#';
            const tagsHtml = item.tags ? item.tags.map(t => `<span class="tag" style="background-color: var(--primary-red-light); color: var(--primary-red); border: 1px solid var(--primary-red-border); padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-right: 8px; font-weight: 600;">${t}</span>`).join('') : '';

            const highlightedTitle = highlightKeyword(item.title || '', keyword);
            const highlightedSummary = highlightKeyword(item.summary || '暂无详细介绍。', keyword);

            return `
                        <div class="search-result-card">
                            <div class="search-result-card-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                <span class="search-result-source-badge">${item.dbSource} · ${item.sourceCategory}</span>
                                <span style="font-size: 13px; color: var(--text-muted); font-weight: 500;">${dateStr}</span>
                            </div>
                            <h4 style="margin: 0 0 10px 0; font-size: 1.25rem; font-weight: 800; line-height: 1.45;">
                                <a href="${targetUrl}" target="_blank" class="search-result-title-link">${highlightedTitle}</a>
                            </h4>
                            <p style="margin: 0 0 15px 0; font-size: 0.92rem; color: var(--text-body); line-height: 1.6;">${highlightedSummary}</p>
                            ${tagsHtml ? `<div style="display: flex; flex-wrap: wrap; gap: 4px;">${tagsHtml}</div>` : ''}
                        </div>
                    `;
        }).join('')}
            </div>
        `;
    }

    // 渲染整体结构
    resultsSection.innerHTML = `
        <div class="container">
            <div class="section-title-bar" style="margin-bottom: 25px; border-bottom: 2.5px solid var(--primary-red); padding-bottom: 12px;">
                <h3>搜索结果：关于 “${keyword}” 的检索结果（共找到 ${results.length} 条记录）</h3>
                <button class="btn-primary-red" id="close-search-btn" style="padding: 6px 18px; font-size: 0.88rem; font-weight: 700; border-radius: var(--radius-md);">返回首页</button>
            </div>
            ${resultsListHtml}
        </div>
    `;

    // 将结果插入在最上方（横幅轮播图原位置或main开头）
    const mainEl = document.querySelector('main');
    if (mainEl) {
        mainEl.insertBefore(resultsSection, mainEl.firstChild);
    }

    // 绑定返回首页按钮事件
    const closeBtn = document.getElementById('close-search-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // 移除搜索结果区块
            resultsSection.remove();
            // 恢复显示原本隐藏的所有板块
            sectionsToHide.forEach(sec => {
                if (sec) sec.style.display = '';
            });
            // 根据当前激活的分类重置大标题和特别推荐等模块的显示状态
            const activeNavItem = document.querySelector('.nav-menu-item.active a');
            const activeCategoryName = activeNavItem ? activeNavItem.textContent.trim() : '推荐';
            updateCategoryContent(activeCategoryName);

            // 清空搜索框内容
            const searchInput = document.querySelector('.search-box input');
            if (searchInput) searchInput.value = '';
        });
    }
}

/**
 * 辅助函数：高亮匹配的搜索关键词，保持原文本大小写，使用 RegExp 替换
 */
function highlightKeyword(text, keyword) {
    if (!text || !keyword) return text || '';
    const escapedKeyword = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedKeyword})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
}

