/**
 * 中国农业大学“耘思”大思政平台 - 门户首页 JavaScript 交互
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. 初始化动态日期
    initDateDisplay();

    // 2. 初始化轮播图 (Carousel)
    initCarousel();

    // 3. 导航栏交互 (仅用作演示：点击切换 Active 状态)
    initNavInteraction();
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
 * 轮播图核心逻辑
 */
function initCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    const carouselWrapper = document.querySelector('.carousel-wrapper');

    if (slides.length === 0) return;

    let currentIndex = 0;
    let timer = null;
    const intervalTime = 5000; // 自动播放间隔 5 秒 (让用户看清内容)

    // 切换到指定索引的幻灯片
    function goToSlide(index) {
        // 清理旧状态
        slides[currentIndex].classList.remove('active');
        dots[currentIndex].classList.remove('active');

        // 更新索引
        currentIndex = (index + slides.length) % slides.length;

        // 设置新状态
        slides[currentIndex].classList.add('active');
        dots[currentIndex].classList.add('active');
    }

    // 下一张
    function nextSlide() {
        goToSlide(currentIndex + 1);
    }

    // 上一张
    function prevSlide() {
        goToSlide(currentIndex - 1);
    }

    // 启动自动轮播
    function startAutoPlay() {
        if (!timer) {
            timer = setInterval(nextSlide, intervalTime);
        }
    }

    // 停止自动轮播
    function stopAutoPlay() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }

    // 事件绑定 - 左右箭头
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

    // 事件绑定 - 轮播圆点
    dots.forEach((dot, index) => {
        dot.addEventListener('click', (e) => {
            e.preventDefault();
            goToSlide(index);
        });
    });

    // 悬停暂停播放
    if (carouselWrapper) {
        carouselWrapper.addEventListener('mouseenter', stopAutoPlay);
        carouselWrapper.addEventListener('mouseleave', startAutoPlay);
    }

    // 启动
    startAutoPlay();
}

/**
 * 导航栏点击切换 Active 状态 (原型交互展示)
 */
function initNavInteraction() {
    // 绑定类名已更新为 .nav-menu-item 
    const navItems = document.querySelectorAll('.nav-menu-item');
    
    navItems.forEach(item => {
        const link = item.querySelector('a');
        if (link) {
            link.addEventListener('click', (e) => {
                // 如果是 # 占位，则阻止默认跳转并切换 active 类
                if (link.getAttribute('href') === '#') {
                    e.preventDefault();
                    
                    // 移除其他 active
                    navItems.forEach(i => i.classList.remove('active'));
                    
                    // 为当前点击项添加 active
                    item.classList.add('active');
                }
            });
        }
    });
}
