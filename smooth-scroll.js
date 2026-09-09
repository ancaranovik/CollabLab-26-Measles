(() => {
  'use strict';
  if (window.StoryScroll) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const html = document.documentElement;
  let lenis = null;
  const tick = time => lenis?.raf(time * 1000);
  const easeInOut = value => (1 - Math.cos(Math.PI * value)) / 2;

  function configure() {
    if (motion.matches || html.classList.contains('intro-loading')) {
      if (lenis) {
        gsap.ticker.remove(tick);
        lenis.destroy();
        lenis = null;
      }
      return;
    }
    if (lenis || !window.Lenis || !window.gsap || !window.ScrollTrigger) return;
    lenis = new Lenis({ autoRaf: false, smoothWheel: true, syncTouch: false, lerp: 0.16 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
  }

  function scrollTo(top, onComplete) {
    if (html.classList.contains('intro-loading')) return;
    top = Math.max(0, Math.min(top, document.documentElement.scrollHeight - innerHeight));
    if (lenis) {
      lenis.resize();
      lenis.scrollTo(top, {
        duration: Math.min(1.5, Math.max(0.65, Math.abs(top - scrollY) / 6000)),
        easing: easeInOut,
        onComplete
      });
    } else {
      window.scrollTo({ top, behavior: motion.matches ? 'instant' : 'smooth' });
      if (motion.matches) onComplete?.();
    }
  }

  window.StoryScroll = { to: scrollTo, get instance() { return lenis; } };
  document.querySelector('.reading-cue')?.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.querySelector('#study-intro');
    if (!target) return;
    event.preventDefault();
    scrollTo(target.getBoundingClientRect().top + scrollY - 44, () => {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
  motion.addEventListener('change', configure);
  window.addEventListener('story:intro-finished', configure);
  window.ScrollTrigger?.addEventListener('refresh', () => lenis?.resize());
  configure();
})();
