(() => {
  'use strict';
  const html = document.documentElement;
  if (!html.classList.contains('intro-loading')) return;
  const main = document.querySelector('#measles-story');
  const lockedElements = [main, ...document.querySelectorAll('.story-progress, .language-switcher')];
  const previousInert = lockedElements.map(element => element.inert);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const frames = [...document.querySelectorAll('.intro-frame')];
  const heroImage = document.querySelector('.hero-character img');
  const white = document.querySelector('.intro-white');
  const reveal = { progress: 0 };
  let revealBounds;
  let revealObserver;
  const meter = document.querySelector('.intro-meter');
  const bar = document.querySelector('.intro-track span');
  const percent = document.querySelector('.intro-percent');
  let timeline;
  let finished = false;
  const preventScroll = event => event.preventDefault();
  const preventKeys = event => {
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) event.preventDefault();
  };
  function cleanup() {
    if (finished) return;
    finished = true;
    clearTimeout(window.storyIntroTimeout);
    timeline?.kill();
    revealObserver?.disconnect();
    window.removeEventListener('resize', measureReveal);
    lockedElements.forEach((element, index) => { element.inert = previousInert[index]; });
    window.removeEventListener('wheel', preventScroll);
    window.removeEventListener('touchmove', preventScroll);
    window.removeEventListener('keydown', preventKeys);
    window.removeEventListener('story:intro-finished', cleanup);
    motion.removeEventListener('change', finish);
    ['--intro-white', '--intro-character', '--intro-title', '--intro-logos', '--intro-foot', '--intro-nav', '--intro-meter'].forEach(property => html.style.removeProperty(property));
  }
  // Read layout only on setup/resize; animation frames interpolate cached radii.
  function measureReveal() {
    const box = heroImage.getBoundingClientRect();
    const padding = Math.min(box.width, box.height) * 0.075;
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;
    const rx = box.width / 2 + padding;
    const ry = box.height / 2 + padding;
    const cover = Math.max(...[0, innerWidth].flatMap(x =>
      [0, innerHeight].map(y => Math.hypot((x - cx) / rx, (y - cy) / ry)))) + 0.02;
    revealBounds = { cx, cy, rx, ry, cover };
    renderReveal();
  }
  function renderReveal() {
    if (!revealBounds) return;
    const { cx, cy, rx, ry, cover } = revealBounds;
    const scale = 1 + (cover - 1) * reveal.progress;
    white.style.clipPath = `ellipse(${rx * scale}px ${ry * scale}px at ${cx}px ${cy}px)`;
  }
  function finish() { window.finishStoryIntro(); }
  window.addEventListener('story:intro-finished', cleanup);
  motion.addEventListener('change', finish);
  if (!window.gsap || window.scrollY > 0) { finish(); return; }
  lockedElements.forEach(element => { element.inert = true; });
  window.addEventListener('wheel', preventScroll, { passive: false });
  window.addEventListener('touchmove', preventScroll, { passive: false });
  window.addEventListener('keydown', preventKeys);
  const progress = { value: 0 };
  function renderProgress() {
    percent.textContent = `${Math.round(progress.value)}%`;
    bar.style.transform = `scaleX(${progress.value / 100})`;
  }
  // Progress measures this short opening sequence; no simulated network bytes.
  // Decode every supplied frame and the real hero before starting any wipe.
  Promise.all([...frames.map(frame => frame.querySelector('img')), heroImage].map(image => image.decode()).concat(document.fonts.ready))
    .then(() => {
      if (finished) return;
      if (motion.matches) { finish(); return; }
      measureReveal();
      revealObserver = new ResizeObserver(measureReveal);
      revealObserver.observe(heroImage);
      window.addEventListener('resize', measureReveal);
      timeline = gsap.timeline({ defaults: { ease: 'power2.inOut' }, onComplete: finish });
      timeline.to(html, { '--intro-meter': 1, duration: 0.3, ease: 'power2.out' }, 0);
      frames.forEach((frame, index) => {
        const start = index * 0.86;
        timeline.addLabel(`frame-${index + 1}`, start)
          .set(progress, { value: [0, 34, 67][index], onUpdate: renderProgress }, start)
          .to(frame, { clipPath: 'inset(0 0% 0 0%)', duration: 0.32 }, start)
          .to(progress, { value: index === 2 ? 99 : (index + 1) * 33, duration: 0.58, ease: 'none', onUpdate: renderProgress }, start)
          .to(frame, { clipPath: 'inset(0 0% 0 100%)', duration: 0.28 }, index === 2 ? 2.80 : start + 0.58);
      });
      // Hold 99% for 320ms, then emphasize completion before the final wipe.
      timeline.addLabel('hold-99', 2.30)
        .addLabel('complete-100', 2.62)
        .set(progress, { value: 100, onUpdate: renderProgress }, 'complete-100')
        .to(percent, { scale: 1.24, duration: 0.18, ease: 'power2.out' }, 'complete-100')
        .to(percent, { scale: 1.16, duration: 0.14, ease: 'power2.out' }, 2.80)
        .addLabel('hero-character', 3.08)
        .to(html, { '--intro-character': 1, duration: 0.38 }, 'hero-character')
        .to(meter, { opacity: 0, duration: 0.2 }, 'hero-character')
        .addLabel('white-reveal', 3.46)
        .to(white, { opacity: 1, duration: 0.16, ease: 'power2.out' }, 'white-reveal')
        .addLabel('white-expand', 3.62)
        .to(reveal, { progress: 1, duration: 0.85, ease: 'power3.inOut', onUpdate: renderReveal }, 'white-expand')
        .addLabel('hero-content', 4.47)
        .to(html, { '--intro-title': 1, duration: 0.65, ease: 'power3.out' }, 'hero-content')
        .addLabel('hero-logos', 4.64)
        .to(html, { '--intro-logos': 1, duration: 0.55, ease: 'power2.out' }, 'hero-logos')
        .addLabel('hero-footer', 4.85)
        .to(html, { '--intro-foot': 1, duration: 0.5, ease: 'power2.out' }, 'hero-footer')
        .addLabel('story-progress', 5.04)
        .to(html, { '--intro-nav': 1, duration: 0.42, ease: 'power2.out' }, 'story-progress');
    }).catch(finish);
})();
