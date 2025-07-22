class CardSlider {
    constructor(sliderId) {
        this.slider = document.getElementById('sliderWrapper-' + sliderId);
        this.cards = this.slider.querySelectorAll('.modern-card');
        this.prevBtn = document.getElementById('prevBtn-' + sliderId);
        this.nextBtn = document.getElementById('nextBtn-' + sliderId);
        this.dotsContainer = document.getElementById('dotsContainer-' + sliderId);

        this.currentIndex = 0;
        this.cardWidth = 0;
        this.visibleCards = 1;
        this.maxIndex = 0;

        this.init();
    }

    init() {
        this.calculateDimensions();
        this.createDots();
        this.updateSlider();
        this.bindEvents();

        // Auto-play functionality
        this.startAutoPlay();
    }

    calculateDimensions() {
        const containerWidth = this.slider.parentElement.clientWidth;
        const cardElement = this.cards[0];

        if (containerWidth > 1200) {
            this.visibleCards = 3;
        } else if (containerWidth > 768) {
            this.visibleCards = 2;
        } else {
            this.visibleCards = 1;
        }

        this.cardWidth = cardElement.offsetWidth + 32; // including gap
        this.maxIndex = Math.max(0, this.cards.length - this.visibleCards);
    }

    createDots() {
        this.dotsContainer.innerHTML = '';
        const totalDots = this.maxIndex + 1;

        for (let i = 0; i <= this.maxIndex; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            if (i === this.currentIndex) dot.classList.add('active');
            dot.addEventListener('click', () => this.goToSlide(i));
            this.dotsContainer.appendChild(dot);
        }
    }

    updateSlider() {
        let translateX;
        if (this.visibleCards === 1) {
            // Center the active card in the viewport
            const containerWidth = this.slider.parentElement.clientWidth;
            const cardWidth = this.cards[0].offsetWidth;
            const gap = parseInt(getComputedStyle(this.slider).gap) || 0;
            translateX = (containerWidth - cardWidth) / 2 - (this.currentIndex * (cardWidth + gap));
        } else {
            // Default: align left
            translateX = -this.currentIndex * this.cardWidth;
        }
        this.slider.style.transform = `translateX(${translateX}px)`;

        // Update navigation states
        this.prevBtn.disabled = this.currentIndex === 0;
        this.nextBtn.disabled = this.currentIndex === this.maxIndex;

        // Update dots
        this.dotsContainer.querySelectorAll('.dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    }
    goToSlide(index) {
        this.currentIndex = Math.max(0, Math.min(index, this.maxIndex));
        this.updateSlider();
        this.resetAutoPlay();
    }

    nextSlide() {
        if (this.currentIndex < this.maxIndex) {
            this.currentIndex++;
        } else {
            this.currentIndex = 0; // Loop back to start
        }
        this.updateSlider();
    }

    prevSlide() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
        } else {
            this.currentIndex = this.maxIndex; // Loop to end
        }
        this.updateSlider();
    }

    bindEvents() {
        this.prevBtn.addEventListener('click', () => {
            this.prevSlide();
            this.resetAutoPlay();
        });

        this.nextBtn.addEventListener('click', () => {
            this.nextSlide();
            this.resetAutoPlay();
        });

        // Touch/swipe support
        let startX = 0;
        let startY = 0;
        let distX = 0;
        let distY = 0;

        this.slider.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        // this.slider.addEventListener('touchmove', (e) => {
        //     e.preventDefault();
        // });

        this.slider.addEventListener('touchend', (e) => {
            distX = e.changedTouches[0].clientX - startX;
            distY = e.changedTouches[0].clientY - startY;

            if (Math.abs(distX) > Math.abs(distY) && Math.abs(distX) > 50) {
                if (distX > 0) {
                    this.prevSlide();
                } else {
                    this.nextSlide();
                }
                this.resetAutoPlay();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prevSlide();
                this.resetAutoPlay();
            } else if (e.key === 'ArrowRight') {
                this.nextSlide();
                this.resetAutoPlay();
            }
        });

        // Resize handler
        window.addEventListener('resize', () => {
            this.calculateDimensions();
            this.createDots();
            this.updateSlider();
        });

        // Pause on hover
        this.slider.addEventListener('mouseenter', () => this.stopAutoPlay());
        this.slider.addEventListener('mouseleave', () => this.startAutoPlay());
    }

    startAutoPlay() {
        this.stopAutoPlay();
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, 4000);
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    resetAutoPlay() {
        this.stopAutoPlay();
        setTimeout(() => this.startAutoPlay(), 1000);
    }
}