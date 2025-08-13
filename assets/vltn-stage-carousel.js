class CircularCarousel {
  constructor(element) {
    this.element = element;
    this.container = element.querySelector('.vltn-circular-carousel__container');
    this.items = element.querySelectorAll('.vltn-circular-carousel__item');
    this.nextButton = element.querySelector('.vltn-circular-carousel__button--next');
    this.prevButton = element.querySelector('.vltn-circular-carousel__button--prev');
    
    this.totalItems = this.items.length;
    if (this.totalItems === 0) return;

    this.currentIndex = 0;
    this.radiusX = parseInt(this.element.dataset.radiusX, 10) || 600;
    this.radiusY = parseInt(this.element.dataset.radiusY, 10) || 100;
    this.scrollAnimation = this.element.dataset.scrollAnimation === 'true';
    
    this.init();
  }

  init() {
    if (this.scrollAnimation) {
      this.initScrollAnimation();
    } else {
      this.nextButton.addEventListener('click', () => this.rotate(1));
      this.prevButton.addEventListener('click', () => this.rotate(-1));
      this.layout();
    }
  }

  rotate(direction) {
    this.currentIndex += direction;
    this.layout();
  }

  layout(progress = 0) {
    const angleIncrement = (2 * Math.PI) / this.totalItems;
    
    this.items.forEach((item, i) => {
      const rotationOffset = progress * this.totalItems;
      const itemIndex = (i - this.currentIndex - rotationOffset + this.totalItems) % this.totalItems;
      const angle = itemIndex * angleIncrement;

      const x = this.radiusX * Math.sin(angle);
      const y = this.radiusY * Math.cos(angle);
      const scale = (y + this.radiusY) / (2 * this.radiusY) * 0.9 + 0.4;
      const zIndex = Math.round(y + this.radiusY);
      const opacity = scale;

      item.style.transform = `translateX(${x}px) translateZ(${y}px) scale(${scale})`;
      item.style.zIndex = zIndex;
      item.style.opacity = opacity;

      const title = item.querySelector('.vltn-circular-carousel__title');
      const frontIndex = (Math.round(this.currentIndex + rotationOffset) % this.totalItems + this.totalItems) % this.totalItems;
      
      if (i === frontIndex) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  initScrollAnimation() {
    gsap.registerPlugin(ScrollTrigger);
    
    // Hide nav buttons in scroll mode
    if(this.nextButton) this.nextButton.style.display = 'none';
    if(this.prevButton) this.prevButton.style.display = 'none';

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: this.element,
        pin: true,
        scrub: 1,
        start: "top top",
        end: `+=${this.totalItems * 200}`, // Adjust duration of scroll
        onUpdate: (self) => {
          this.layout(self.progress);
        },
      },
    });
  }
}

function initializeCarousels() {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        const carousels = document.querySelectorAll('.vltn-circular-carousel');
        carousels.forEach(carousel => new CircularCarousel(carousel));
    } else {
        setTimeout(initializeCarousels, 100);
    }
}

document.addEventListener('DOMContentLoaded', initializeCarousels);