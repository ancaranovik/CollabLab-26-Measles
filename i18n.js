(() => {
  'use strict';

  // English source strings are stable keys. Both languages use the same nodes;
  // inline emphasis, term buttons, chart marks and quiz listeners stay attached.
  const catalog = window.MEASLES_VI;
  let language = 'en';
  const bindings = [];
  const attributes = [];
  const normalize = text => text.trim().replace(/\s+/g, ' ');
  const t = text => language === 'vi' ? (catalog[text] ?? text) : text;
  const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement.closest('script, style, noscript')) continue;
    const key = normalize(node.data);
    if (Object.hasOwn(catalog, key)) bindings.push({ node, key, original: node.data });
  }
  document.querySelectorAll('[aria-label], [alt], [title], meta[name="description"]').forEach(element => {
    for (const name of ['aria-label', 'alt', 'title', 'content']) {
      const source = element.getAttribute(name);
      if (source && Object.hasOwn(catalog, source) && !element.matches('.percentage')) {
        attributes.push({ element, name, source });
      }
    }
  });
  // The published title and journal name remain in their source language.
  document.querySelectorAll('cite').forEach(element => { element.lang = 'en'; });

  const control = document.createElement('nav');
  control.className = 'language-switcher';
  control.setAttribute('aria-label', 'Article language');
  for (const [code, label] of [['en', 'English'], ['vi', 'Tiếng Việt']]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.lang = code;
    button.textContent = code.toUpperCase();
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-pressed', String(code === language));
    button.addEventListener('click', () => setLanguage(code));
    control.append(button);
  }
  document.body.append(control);

  function capturePosition() {
    const age = window.ScrollTrigger?.getById('age-sequence');
    if (age?.isActive) return { trigger: age, progress: age.progress };
    const point = Math.min(innerHeight * 0.4, 260);
    const candidates = [...document.querySelectorAll('.article-hero, .intro-scene, .story-step, .text-equivalent')]
      .filter(element => element.getClientRects().length && !element.closest('[hidden]'));
    const element = candidates.find(element => {
      const rect = element.getBoundingClientRect();
      return rect.top <= point && rect.bottom > point;
    });
    if (!element) return { y: scrollY };
    const rect = element.getBoundingClientRect();
    return { element, ratio: (point - rect.top) / rect.height, point };
  }

  function setLanguage(next) {
    if (!['en', 'vi'].includes(next) || next === language) return;
    const position = capturePosition();
    language = next;
    document.documentElement.lang = next;
    for (const { node, key, original } of bindings) {
      if (node.isConnected) {
        node.data = next === 'en' ? original : original.replace(original.trim(), t(key)).replace(/^\s+([.,;:?!])/, '$1');
      }
    }
    for (const { element, name, source } of attributes) element.setAttribute(name, t(source));
    control.setAttribute('aria-label', t('Article language'));
    [...control.children].forEach(button => button.setAttribute('aria-pressed', String(button.lang === next)));
    window.dispatchEvent(new Event('story:languagechange'));
    // Text changes can resize foreground panels. Refresh existing triggers only;
    // never rebuild the population, reshuffle answers or reset chapter gates.
    window.ScrollTrigger?.refresh();
    const y = position.trigger
      ? position.trigger.start + position.progress * (position.trigger.end - position.trigger.start)
      : position.element
        ? position.element.getBoundingClientRect().top + scrollY + position.ratio * position.element.offsetHeight - position.point
        : position.y;
    window.scrollTo({ top: Math.max(0, y), behavior: 'instant' });
    window.ScrollTrigger?.update();
    window.dispatchEvent(new Event('story:languagepositioned'));
  }

  window.MeaslesI18n = Object.freeze({ t, setLanguage, getLanguage: () => language });
})();
