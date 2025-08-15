/*
 * Global Lenis Smooth Scroll Initialization
 * This script should be loaded once in theme.liquid to provide a single
 * smooth scroll instance for the entire site, preventing conflicts.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Check if Lenis is available and not already initialized.
  if (typeof Lenis !== 'undefined' && !window.lenis) {
    const lenis = new Lenis();
    window.lenis = lenis; // Store globally

    // Connect Lenis to GSAP's ticker for synchronized updates
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    console.log('Global Lenis initialized.');

    // After a short delay, refresh ScrollTrigger to ensure all positions are calculated correctly.
    // This is crucial when dealing with multiple complex sections.
    setTimeout(() => {
      ScrollTrigger.refresh();
      console.log('ScrollTrigger refreshed.');
    }, 100);
  }
});