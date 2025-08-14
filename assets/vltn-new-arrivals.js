document.addEventListener("DOMContentLoaded", function () {
  const container = document.querySelector(".section-new-arrivals");
  if (!container) return;

  const slidesData = JSON.parse(container.querySelector("[data-slides]").innerHTML) || [];

  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.querySelector('.new-arrivals-container').appendChild(renderer.domElement);

  const geometry = new THREE.PlaneGeometry(2, 2);
  const uniforms = {
    iTime: { value: 0 },
    iResolution: {
      value: new THREE.Vector2(window.innerWidth, window.innerHeight),
    },
    scrollOffset: { value: 0 },
  };

  const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: document.getElementById("vertexShader").textContent,
    fragmentShader: document.getElementById("fragmentShader").textContent,
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  let lastTime = 0;
  function animateTunnel(time) {
    const deltaTime = time - lastTime;
    lastTime = time;
    uniforms.iTime.value += deltaTime * 0.001;
    renderer.render(scene, camera);
    requestAnimationFrame(animateTunnel);
  }

  animateTunnel(0);

  window.addEventListener("resize", () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    uniforms.iResolution.value.set(width, height);
  });

  gsap.registerPlugin(ScrollTrigger);

  const totalSlides = slidesData.length;
  const zStep = 2500;
  const initialZ = -12000;

  function generateSlides() {
    const slider = container.querySelector(".slider");
    slider.innerHTML = "";

    slidesData.forEach((slideData, i) => {
      const slide = document.createElement("div");
      slide.className = "slide";
      slide.id = `slide-${i + 1}`;

      const wrapper = document.createElement("div");
      wrapper.className = "slide-wrapper";

      // Left Image
      if (slideData.image_left) {
        const leftImgContainer = document.createElement("div");
        leftImgContainer.className = "featured-image-container image-left";
        const leftImg = document.createElement("img");
        leftImg.src = slideData.image_left;
        leftImg.alt = slideData.title + " model left";
        leftImgContainer.appendChild(leftImg);
        wrapper.appendChild(leftImgContainer);
      }

      // Product Card (Center)
      const productCard = document.createElement("a");
      productCard.href = slideData.url;
      productCard.className = "product-card";

      const slideImg = document.createElement("div");
      slideImg.className = "slide-img";
      const img = document.createElement("img");
      img.src = slideData.product_image;
      img.alt = slideData.title;
      slideImg.appendChild(img);

      const slideCopy = document.createElement("div");
      slideCopy.classList.add("slide-copy");
      slideCopy.innerHTML = `<p>${slideData.title}</p><p>${slideData.price || ''}</p>`;

      productCard.appendChild(slideImg);
      productCard.appendChild(slideCopy);
      wrapper.appendChild(productCard);

      // Right Image
      if (slideData.image_right) {
        const rightImgContainer = document.createElement("div");
        rightImgContainer.className = "featured-image-container image-right";
        const rightImg = document.createElement("img");
        rightImg.src = slideData.image_right;
        rightImg.alt = slideData.title + " model right";
        rightImgContainer.appendChild(rightImg);
        wrapper.appendChild(rightImgContainer);
      }
      
      slide.appendChild(wrapper);
      slider.appendChild(slide);

      const zPosition = initialZ + i * zStep;
      const xPosition = (i + 1) % 2 === 0 ? "50%" : "50%";
      
      // Store the initial Z position for later calculations
      slide.dataset.initialZ = zPosition;

      gsap.set(slide, {
        top: "50%",
        left: xPosition,
        xPercent: -50,
        yPercent: -50,
        z: zPosition,
        opacity: 0, // All slides start invisible
      });
    });
  }

  window.addEventListener("load", function () {
    generateSlides();

    const slides = gsap.utils.toArray(".slide");

    function getInitialTranslateZ(slide) {
      return gsap.getProperty(slide, "z");
    }

    function mapRange(value, inMin, inMax, outMin, outMax) {
      return (
        ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
      );
    }

    ScrollTrigger.matchMedia({
      // Desktop settings
      "(min-width: 768px)": function() {
        ScrollTrigger.create({
          trigger: container,
          start: "top top",
          end: `+=${totalSlides * 150}%`,
          scrub: 1,
          pin: true,
          onUpdate: (self) => {
            updateAnimation(self);
          },
        });
      },
      // Mobile settings
      "(max-width: 767px)": function() {
        ScrollTrigger.create({
          trigger: container,
          start: "top top",
          end: `+=${totalSlides * 100}%`, // Shorter scroll on mobile
          scrub: 1,
          pin: true,
          onUpdate: (self) => {
            updateAnimation(self);
          },
        });
      }
    });

    function updateAnimation(self) {
      slides.forEach((slide) => {
        const initialZ = parseFloat(slide.dataset.initialZ);
        const totalTravelDistance = (totalSlides * zStep) + Math.abs(initialZ);
        const currentZ = initialZ + self.progress * totalTravelDistance;
        const distanceFromCamera = Math.abs(currentZ);
        const fadeDistance = zStep * 1.5;
        const opacity = Math.max(0, 1 - distanceFromCamera / fadeDistance);

        slide.style.opacity = opacity;
        slide.style.transform = `translateX(-50%) translateY(-50%) translateZ(${currentZ}px)`;
      });

      uniforms.scrollOffset.value = self.progress;
      renderer.render(scene, camera);

      gsap.set(container.querySelector(".new-arrivals-heading"), { opacity: 1 - (self.progress * 10) });

      const outro = container.querySelector(".new-arrivals-outro");
      const whiteOverlay = container.querySelector(".white-reveal-overlay");
      
      // Ensure revealProgress is clamped between 0 and 1
      const revealProgress = Math.max(0, Math.min(1, mapRange(self.progress, 0.8, 1.0, 0, 1)));
      
      gsap.set(whiteOverlay, { clipPath: `circle(${revealProgress * 150}% at 50% 50%)` });
      gsap.set(outro, { opacity: revealProgress, pointerEvents: self.progress > 0.9 ? 'auto' : 'none' });
    }
  });
});