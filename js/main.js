/**
 * 中国农业大学“耘思”大思政平台 - 门户首页 JavaScript 交互与动态渲染
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. 初始化动态日期
    initDateDisplay();

    // 2. 导航栏交互 (原型演示用)
    initNavInteraction();

    // 3. 加载并渲染动态数据
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
 * 导航栏点击切换 Active 状态
 */
function initNavInteraction() {
    const navItems = document.querySelectorAll('.nav-menu-item');
    navItems.forEach(item => {
        const link = item.querySelector('a');
        if (link) {
            link.addEventListener('click', (e) => {
                if (link.getAttribute('href') === '#') {
                    e.preventDefault();
                    navItems.forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                }
            });
        }
    });
}

/**
 * 统一加载项目数据并渲染（直接读取全局注入的数据变量）
 */
function loadAppData() {
    try {
        if (window.newsData && window.newsData.length > 0) {
            renderAllNews(window.newsData);
        } else {
            console.warn('本地 newsData 数据未加载或为空');
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
 * 统一分发渲染各模块新闻
 */
function renderAllNews(news) {
    // 1. 渲染轮播图
    const topNews = news.filter(item => item.isTop);
    renderCarousel(topNews.slice(0, 5)); // 最多5条

    // 2. 渲染重点推荐
    const recommendNews = news.filter(item => item.isRecommend);
    renderRecommendList(recommendNews.slice(0, 7));

    // 3. 渲染分类模块
    const theoryNews = news.filter(item => item.category === '学习' || item.category === '理论学习');
    renderCategoryList('theory-list', theoryNews.slice(0, 5));

    const agriNews = news.filter(item => item.category === '强农兴农' || item.category === '推荐');
    renderCategoryList('agri-list', agriNews.slice(0, 5));

    const beijingNews = news.filter(item => item.category === '北京');
    renderCategoryList('beijing-list', beijingNews.slice(0, 5));

    const campusNews = news.filter(item => item.category === '学校');
    renderCategoryList('campus-list', campusNews.slice(0, 5));
}

/**
 * 渲染轮播图
 */
function renderCarousel(newsList) {
    const container = document.getElementById('carousel-inner');
    const dotsContainer = document.querySelector('.carousel-dots');
    
    if (!container || newsList.length === 0) return;
    
    let html = '';
    let dotsHtml = '';
    
    newsList.forEach((item, index) => {
        const isActive = index === 0 ? 'active' : '';
        const targetUrl = getTargetUrl(item);
        
        // 生成背景样式（如果图片加载失败或不存在时的兼容）
        const bgStyle = `background-image: url('${item.image}'); background-size: cover; background-position: center;`;
        
        html += `
            <div class="carousel-slide ${isActive}" onclick="window.open('${targetUrl}', '_blank')" style="cursor: pointer;">
                <div class="image-placeholder-gradient slide-${(index % 3) + 1}">
                    <svg class="placeholder-icon" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <span class="placeholder-text" style="font-size: 1.2rem; margin-top: 10px; font-weight: bold; text-shadow: 1px 1px 3px rgba(0,0,0,0.5);">${item.title}</span>
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
    
    let html = '';
    newsList.forEach((item, index) => {
        const isHighlight = index === 0 ? 'highlight' : '';
        const dateStr = item.date.substring(5, 10); // 提取 MM-DD
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
    
    let html = '';
    newsList.forEach(item => {
        const dateStr = item.date.substring(5, 10);
        const targetUrl = getTargetUrl(item);
        
        html += `
            <li class="card-list-item">
                <a href="${targetUrl}" target="_blank" class="card-list-link" title="${item.title}">${item.title}</a>
                <span class="card-list-date">${dateStr}</span>
            </li>
        `;
    });
    container.innerHTML = html;
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
