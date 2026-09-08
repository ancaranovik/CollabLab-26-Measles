const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
import fs from 'node:fs';
const browser = await chromium.launch({ executablePath: process.env.BROWSER_EXECUTABLE || (process.platform === 'win32' ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : undefined), headless: true });
fs.mkdirSync('verification', { recursive: true });
const results = [];
for (const [width, height, reducedMotion] of [[1440, 900, 'no-preference'], [390, 844, 'no-preference'], [844, 390, 'no-preference'], [390, 844, 'reduce']]) {
  const page = await browser.newPage({ viewport: { width, height }, reducedMotion });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4173/_site/');
  await page.waitForFunction(() => window.__MEASLES_STORY__?.getState().initialized && window.MeaslesI18n);
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    window.originalPeople = [...document.querySelectorAll('.person')];
    window.originalOptions = [...document.querySelectorAll('.quiz-option')];
    window.originalTriggers = ScrollTrigger.getAll();
  });
  const heroEnglish = await page.locator('#article-title').innerText();
  await page.getByRole('button', { name: 'Tiếng Việt', exact: true }).click();
  assert.equal(await page.locator('html').getAttribute('lang'), 'vi');
  assert.match(await page.locator('#article-title').innerText(), /Bệnh sởi/);
  const missing = await page.evaluate(() => {
    const missing = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.parentElement.closest('script, style, noscript, .language-switcher')) continue;
      const text = node.data.trim().replace(/\s+/g, ' ');
      if (Object.hasOwn(MEASLES_VI, text) && MEASLES_VI[text] !== text) missing.push(text);
    }
    return missing;
  });
  assert.deepEqual(missing, []);
  await page.screenshot({ path: `verification/vi-hero-${width}-${reducedMotion}.png` });
  const overflow = () => page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  assert.equal(await overflow(), false);
  await page.getByRole('button', { name: 'English', exact: true }).click();
  assert.equal(await page.locator('#article-title').innerText(), heroEnglish);
  assert.equal(await page.evaluate(() => !!ScrollTrigger.getById('age-sequence')), false);
  assert.equal(await page.locator('.age-frame').count(), 0);
  await page.evaluate(() => MeaslesI18n.setLanguage('vi'));
  await page.locator('.technical-term[data-term="herd-immunity"]').first().focus();
  await page.waitForTimeout(150);
  assert.match(await page.locator('#editorial-term-note').innerText(), /miễn dịch cộng đồng/i);
  await page.keyboard.press('Escape');
  for (let quiz = 1; quiz <= 3; quiz++) {
    await page.locator(`[data-quiz="${quiz}"] .quiz-option`).first().click();
    await page.waitForFunction(quiz => document.querySelector(`[data-quiz="${quiz}"]`).dataset.completed === 'true', quiz);
    const selected = await page.locator(`[data-quiz="${quiz}"] .quiz-option[aria-pressed="true"]`).getAttribute('data-correct');
    const triggers = await page.evaluate(() => { window.quizTriggers = ScrollTrigger.getAll(); return quizTriggers.length; });
    await page.getByRole('button', { name: 'English', exact: true }).click();
    await page.getByRole('button', { name: 'Tiếng Việt', exact: true }).click();
    assert.equal(await page.locator(`[data-quiz="${quiz}"] .quiz-option[aria-pressed="true"]`).getAttribute('data-correct'), selected);
    assert.equal(await page.locator(`[data-quiz="${quiz}"]`).getAttribute('data-completed'), 'true');
    assert.equal(await page.evaluate(() => ScrollTrigger.getAll().length), triggers);
    assert.equal(await page.evaluate(() => quizTriggers.every(trigger => ScrollTrigger.getAll().includes(trigger))), true);
    assert.equal(await overflow(), false);
  }
  for (const key of ['VACCINE_COMPARE', 'CHRONIC_COMPARE', 'COVERAGE_OLDER', 'VACCINE_COMPARE']) {
    await page.evaluate(key => {
      const step = document.querySelector(`[data-visual-state="${key}"]`);
      scrollTo(0, step.getBoundingClientRect().top + scrollY + step.offsetHeight * .5 - innerHeight * .5);
      ScrollTrigger.update();
    }, key);
    await page.waitForTimeout(1500);
    const state = await page.evaluate(() => stage.dataset.state);
    await page.getByRole('button', { name: 'English', exact: true }).click();
    await page.getByRole('button', { name: 'Tiếng Việt', exact: true }).click();
    assert.equal(await page.evaluate(() => stage.dataset.state), state);
    assert.equal(await overflow(), false);
  }
  await page.screenshot({ path: `verification/vi-compare-${width}-${reducedMotion}.png` });
  assert.equal(await page.evaluate(() => originalPeople.every((node, i) => node === document.querySelectorAll('.person')[i])), true);
  assert.equal(await page.evaluate(() => originalOptions.every(node => node.isConnected)), true);
  assert.deepEqual(errors, []);
  results.push({ width, height, reducedMotion, missing, errors, quizzesPreserved: true, nodesPreserved: true, reversible: true });
  console.log(JSON.stringify(results.at(-1)));
  await page.close();
}
await browser.close();
fs.writeFileSync('verification/localization-results.json', JSON.stringify(results, null, 2));
