if (!customElements.get("m-featured-slider")) {
  class MFeaturedSlider extends HTMLElement {
    constructor() {
      super();

      this.selectors = {
        sliderContainer: ".m-featured-slider__products",
        slideImages: ["m-featured-slider__img"],
        slideImagesContainer: ".m-featured-slider__images",
        sliderControls: ".m-slider-controls",
        prevBtn: ".m-slider-controls__button-prev",
        nextBtn: ".m-slider-controls__button-next",
      };
      this.domNodes = queryDomNodes(this.selectors, this);
    }

    connectedCallback() {
      this.initSlider();
      this.initModelChanger();
    }

    initModelChanger() {
      const changeModelBtns = this.querySelectorAll('.change-model-btn');
      const nextProductBtns = this.querySelectorAll('.next-product-btn');

      changeModelBtns.forEach(btn => {
        btn.addEventListener('click', (event) => {
          const slide = event.target.closest('.m-featured-slider__img');
          if (!slide) return;

          const modelImages = slide.querySelectorAll('.model-image');
          if (modelImages.length <= 1) return;

          const activeImage = slide.querySelector('.model-image.active');
          const allImages = Array.from(modelImages);
          const currentIndex = allImages.indexOf(activeImage);

          activeImage.classList.remove('active');

          let nextIndex = currentIndex + 1;
          if (nextIndex >= allImages.length) {
            nextIndex = 0;
          }

          allImages[nextIndex].classList.add('active');
        });
      });

      nextProductBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          if (this.slider) {
            this.slider.slideNext();
          }
        });
      });
    }

    initSlider() {
      const showNavigation = this.dataset.showNavigation === "true";
      const showPagination = this.dataset.showPagination === "true";
      const autoplay = this.dataset.autoplay === "true";
      const timeout = this.dataset.timeout;

      this.slider = new MinimogLibs.Swiper(this.domNodes.sliderContainer, {
        speed: 400,
        loop: true,
        autoplay: autoplay
          ? {
              delay: parseInt(timeout),
              disableOnInteraction: false,
            }
          : false,
        pagination: showPagination
          ? {
              el: this.querySelector(".swiper-pagination"),
              type: "bullets",
              clickable: true,
            }
          : false,
        on: {
          init: () => {
            if (showNavigation) {
              if (this.domNodes.prevBtn) this.domNodes.prevBtn.addEventListener("click", () => this.slider.slidePrev());
              if (this.domNodes.nextBtn) this.domNodes.nextBtn.addEventListener("click", () => this.slider.slideNext());
            }
          },
        },
      });

      // Sync 2 sliders
      this.imageSlider = new MinimogLibs.Swiper(this.domNodes.slideImagesContainer, {
        speed: 500,
        loop: true,
        effect: "fade",
        fadeEffect: {
          crossFade: true,
        },
      });

      this.slider.on("activeIndexChange", (swiper) => {
        const { realIndex, activeIndex } = swiper;
        this.imageSlider.slideTo(activeIndex);
      });

      this.imageSlider.on("activeIndexChange", (swiper) => {
        const { realIndex, activeIndex } = swiper;
        this.slider.slideTo(activeIndex);
      });

      if (Shopify.designMode) {
        document.addEventListener("shopify:block:select", (e) => this.onBlockSelect(e));
      }
    }

    onBlockSelect(evt) {
      const block = evt.target;
      const index = Number(block.dataset.index);
      if (this.slider) this.slider.slideToLoop(index);
      if (this.imageSlider) this.imageSlider.slideToLoop(index);
    }
  }

  customElements.define("m-featured-slider", MFeaturedSlider);
}
