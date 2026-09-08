const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
import fs from 'node:fs';
const browser = await chromium.launch({ executablePath: process.env.BROWSER_EXECUTABLE || (process.platform === 'win32' ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : undefined), headless: true });
const url = process.env.TEST_URL || 'http://127.0.0.1:4173/_site/';
fs.mkdirSync('verification', { recursive: true });
const results = [];
for (const [width, height, reducedMotion] of [[1440, 900, 'no-preference'], [390, 844, 'no-preference'], [844, 390, 'no-preference'], [390, 844, 'reduce']]) {
  const page = await browser.newPage({ viewport: { width, height }, reducedMotion });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  let releaseScript;
  const gate = new Promise(resolve => { releaseScript = resolve; });
  await page.route(/\/script\.js\?/, async route => { await gate; await route.continue(); });
  await page.goto(url, { waitUntil: 'commit' });
  await page.waitForFunction(() => document.querySelector('.diagnosis-track i') && getComputedStyle(document.body).margin === '0px');
  const prepaint = await page.evaluate(() => [...document.querySelectorAll('#analysis .chart-track i, #analysis .diagnosis-track i')].map(el => new DOMMatrix(getComputedStyle(el).transform).a));
  assert.ok(prepaint.every(value => value === (reducedMotion === 'reduce' ? 1 : 0)), JSON.stringify(prepaint));
  releaseScript();
  await page.waitForFunction(() => window.__MEASLES_STORY__?.getState().initialized);
  await page.evaluate(() => MeaslesI18n.setLanguage('vi'));
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `verification/targeted-hero-${width}-${reducedMotion}.png` });

  // Inspect fonts actually used by Chromium, rather than just declared families.
  await page.evaluate(() => {
    const sample = 'Đối tượng nghiên cứu gồm trẻ em từ 0–15 tuổi được nhập viện trong thời gian nghiên cứu. Ăă Ââ Êê Ôô Ơơ Ưư Đđ Ắằ Ẩẫ Ếề Ỗộ Ớờ Ựữ Ỳỵ “…”';
    const host = document.createElement('div');
    host.id = 'font-probes';
    host.style.cssText = 'position:fixed;top:50px;left:0;z-index:9999;background:white;width:90vw';
    const sources = ['#article-title', '.intro-copy h2', '.intro-copy p', '.finding-quiz legend', '.quiz-option', '.group-label h3', '.legend-title', '.term-note'];
    for (const [index, selector] of sources.entries()) {
      const family = getComputedStyle(document.querySelector(selector)).fontFamily;
      for (const [variant, style, weight] of [['regular', 'normal', 400], ['italic', 'italic', 400], ['bold', 'normal', 700], ['bolditalic', 'italic', 700]]) {
        const node = document.createElement('div');
        node.id = `probe-${index}-${variant}`;
        node.style.cssText = `font-family:${family};font-size:16px;font-style:${style};font-weight:${weight}`;
        node.textContent = sample;
        host.append(node);
      }
    }
    document.body.append(host);
  });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
  const { root } = await cdp.send('DOM.getDocument');
  const { nodeIds } = await cdp.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector: '#font-probes > div' });
  const fonts = [];
  for (const nodeId of nodeIds) {
    const result = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
    const families = [...new Set(result.fonts.filter(font => font.glyphCount).map(font => font.familyName))];
    assert.equal(families.length, 1, JSON.stringify(result));
    fonts.push(families[0]);
  }
  assert.equal(fonts[0], 'Lora');
  await page.evaluate(() => document.querySelector('#font-probes').remove());
  await page.evaluate(() => MeaslesI18n.setLanguage('en'));
  assert.match(await page.locator('#article-title').evaluate(el => getComputedStyle(el).fontFamily), /^Georgia/);

  const age = await page.evaluate(() => {
    const trigger = ScrollTrigger.getAll().find(t => t.vars.trigger === '.age-scene');
    return trigger ? { start: trigger.vars.start, actions: trigger.vars.toggleActions, pin: !!trigger.pin, duration: trigger.animation.vars.duration, stagger: trigger.animation.vars.stagger } : null;
  });
  assert.equal(await page.locator('.age-frame').count(), 0);
  if (reducedMotion === 'reduce') assert.equal(age, null);
  else {
    assert.deepEqual(age, { start: 'top 85%', actions: 'play none none reverse', pin: false, duration: .65, stagger: .1 });
    for (const [offset, opacity] of [[5, 1], [-10, 0]]) {
      await page.evaluate(offset => { const t = ScrollTrigger.getAll().find(t => t.vars.trigger === '.age-scene'); scrollTo(0, t.start + offset); ScrollTrigger.update(); }, offset);
      await page.waitForTimeout(1400);
      assert.equal(await page.locator('.age-lineup img').last().evaluate(el => +getComputedStyle(el).opacity), opacity);
    }
  }
  for (let quiz = 1; quiz <= 3; quiz++) {
    await page.locator(`[data-quiz="${quiz}"] .quiz-option`).first().click();
    await page.waitForFunction(quiz => document.querySelector(`[data-quiz="${quiz}"]`).dataset.completed === 'true', quiz);
  }
  const lifecycle = [];
  for (const kind of ['annual', 'diagnosis']) {
    const selector = `#analysis .${kind}-chart`;
    const snapshot = () => page.locator(selector).evaluate(el => ({ state: el.dataset.chartState, fills: [...el.querySelectorAll('.chart-track i, .diagnosis-track i')].map(fill => +gsap.getProperty(fill, 'scaleX')) }));
    await page.locator(selector).evaluate(el => { scrollTo(0, el.getBoundingClientRect().top + scrollY - innerHeight * .82 - 160); ScrollTrigger.update(); });
    const pending = await snapshot();
    if (reducedMotion !== 'reduce') {
      assert.equal(pending.state, 'pending');
      assert.ok(pending.fills.every(v => v === 0));
    }
    await page.evaluate(() => MeaslesI18n.setLanguage('vi'));
    await page.evaluate(() => MeaslesI18n.setLanguage('en'));
    assert.deepEqual(await snapshot(), pending);
    await page.evaluate(() => {
      window.fillFrames = [];
      window.sampling = true;
      const record = () => {
        if (!window.sampling) return;
        fillFrames.push([...document.querySelectorAll('#analysis .chart-track i, #analysis .diagnosis-track i')].map(el => +gsap.getProperty(el, 'scaleX')));
        requestAnimationFrame(record);
      };
      requestAnimationFrame(record);
    });
    for (let step = 0; step < 6; step++) {
      await page.evaluate(() => { scrollBy(0, 40); ScrollTrigger.update(); });
      await page.waitForTimeout(90);
    }
    if (reducedMotion !== 'reduce') {
      assert.equal((await snapshot()).state, 'running');
      // Refresh and resize during the fill must preserve the same timeline.
      await page.evaluate(() => { window.savedTimeline = gsap.getTweensOf(document.querySelector('#analysis .annual-chart .chart-track i'))[0]?.parent; ScrollTrigger.refresh(); });
      await page.setViewportSize({ width: width + 12, height });
      await page.evaluate(() => MeaslesI18n.setLanguage('vi'));
    }
    await page.waitForFunction(selector => document.querySelector(selector).dataset.chartState === 'complete', selector);
    const final = await snapshot();
    assert.ok(final.fills.every(v => v === 1));
    await page.evaluate(() => { ScrollTrigger.refresh(); scrollBy(0, -400); ScrollTrigger.update(); });
    await page.evaluate(() => MeaslesI18n.setLanguage('en'));
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(350);
    await page.evaluate(() => MeaslesI18n.setLanguage('vi'));
    assert.deepEqual(await snapshot(), final);
    const samples = await page.evaluate(() => { window.sampling = false; return fillFrames; });
    const indices = kind === 'annual' ? [0, 1, 2] : [3];
    for (const index of indices) {
      for (let i = 1; i < samples.length; i++) assert.ok(samples[i][index] >= samples[i - 1][index] - .0001, `fill reset: ${kind} ${i}`);
    }
    lifecycle.push({ kind, pending, final, frames: samples.length });
  }
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(250);
  assert.ok((await page.locator('#analysis .editorial-chart').evaluateAll(charts => charts.map(c => c.dataset.chartState))).every(s => s === 'complete'));
  await page.emulateMedia({ reducedMotion });
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await page.reload();
  await page.waitForFunction(() => window.__MEASLES_STORY__?.getState().initialized);
  const reloaded = await page.locator('#analysis .chart-track i, #analysis .diagnosis-track i').evaluateAll(fills => fills.map(el => new DOMMatrix(getComputedStyle(el).transform).a));
  assert.ok(reloaded.every(value => value === (reducedMotion === 'reduce' ? 1 : 0)), JSON.stringify({ width, reducedMotion, reloaded }));
  assert.deepEqual(errors, []);
  results.push({ width, height, reducedMotion, prepaint, reloaded, fonts: [...new Set(fonts)], age, lifecycle, errors });
  console.log(JSON.stringify(results.at(-1)));
  await page.close();
}
// Without JavaScript, the accessible charts must still show their values.
const fallback = await browser.newPage({ javaScriptEnabled: false });
await fallback.goto(url);
assert.equal(await fallback.locator('#analysis .chart-track i').first().evaluate(el => getComputedStyle(el).transform), 'none');
await browser.close();
fs.writeFileSync('verification/targeted-fixes-results.json', JSON.stringify(results, null, 2));
