(() => {
  'use strict';
  const t = text => window.MeaslesI18n?.t(text) ?? text;
  if (!window.ScrollTrigger || !window.__MEASLES_STORY__) return;
  const sections = [
    { label: 'Hero', selector: '.article-hero' },
    { label: 'Study population', selector: '#study-intro' },
    { label: 'Key Finding 1', selector: '#finding-1' },
    { label: 'Key Finding 2', selector: '#finding-2' },
    { label: 'Key Finding 3', selector: '#finding-3' },
    { label: 'Conclusion', selector: '[data-chapter]:last-child' }
  ];
  const chapters = [...document.querySelectorAll('[data-chapter]')];
  sections[5].element = chapters.at(-1);
  const rail = document.createElement('nav');
  rail.className = 'story-progress';
  rail.setAttribute('aria-label', 'Story progress');
  const currentLabel = document.createElement('span');
  currentLabel.className = 'story-progress-current';
  const list = document.createElement('ol');
  sections.forEach((section, index) => {
    section.element ||= document.querySelector(section.selector);
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.style.setProperty('--section-color', ['#80c5ff', '#f1e500', '#f26ba0', '#be7bff', '#f49e4d', '#b3ed49'][index]);
    button.innerHTML = `<span class="progress-mark" aria-hidden="true"></span><span class="progress-label">${section.label}</span>`;
    button.setAttribute('aria-label', section.label);
    button.addEventListener('click', () => {
      if (section.element.hidden || section.element.closest('[hidden]')) return;
      // Navigating to an available chapter never answers or bypasses a quiz.
      const top = Math.max(0, section.top - 44);
      if (window.StoryScroll) StoryScroll.to(top);
      else window.scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
    section.button = button;
    section.index = index;
    item.append(button);
    list.append(item);
  });
  rail.append(currentLabel, list);
  document.body.append(rail);
  document.documentElement.classList.add('has-story-progress');
  let activeIndex = -1;
  function update() {
    const point = window.scrollY + Math.min(innerHeight * 0.25, 180);
    let index = 0;
    sections.forEach(section => { if (!section.button.disabled && section.top <= point) index = section.index; });
    if (index === activeIndex) return;
    activeIndex = index;
    currentLabel.textContent = `${index + 1} / ${sections.length} · ${t(sections[index].label)}`;
    sections.forEach(section => {
      section.button.dataset.status = section.index < index ? 'complete' : section.index === index ? 'active' : 'remaining';
      if (section.index === index) section.button.setAttribute('aria-current', 'step');
      else section.button.removeAttribute('aria-current');
    });
  }
  function measure() {
    sections.forEach(section => {
      const locked = !!section.element.closest('[hidden]');
      section.button.disabled = locked;
      section.button.setAttribute('aria-label', t(section.label) + (locked ? t(' — complete the preceding quiz to unlock') : ''));
      section.button.querySelector('.progress-label').textContent = t(section.label);
      section.top = locked ? Infinity : section.element.getBoundingClientRect().top + window.scrollY;
    });
    activeIndex = -1;
    update();
  }
  ScrollTrigger.create({ id: 'story-progress', start: 0, end: 'max', onUpdate: update });
  ScrollTrigger.addEventListener('refresh', measure);
  window.addEventListener('story:languagechange', () => { rail.setAttribute('aria-label', t('Story progress')); measure(); });
  const observer = new MutationObserver(measure);
  chapters.forEach(chapter => observer.observe(chapter, { attributes: true, attributeFilter: ['hidden'] }));
  window.dispatchEvent(new Event('story:viewportchange'));
})();
