'use strict';

// Run against a local static server: node tests/progress-transfer-browser.cjs
// ACADEMY_BASE_URL may include a path, e.g. http://127.0.0.1:8000/academy/.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
let playwright;
try { playwright = require('playwright'); }
catch { playwright = require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'); }
const { chromium } = playwright;
const BASE = (process.env.ACADEMY_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const MATH = 'understand-math-grade1-v1';
const ALGORITHMS = 'academy-algorithms-ch01-v1';
const algorithmKeys = ['academy-algorithms-ch01-v1', 'academy-algorithms-ch02-v1', 'academy-algorithms-ch03-v1'];
const THEME = 'academy-theme-v1';
const OTHER = 'transfer-test-unrelated';
const checks = [], errors = [];
let browser;

function passed(name) { checks.push(name); }
async function settings(page) {
  await page.goto(BASE + '/#/settings');
  await page.locator('#progress-transfer').waitFor();
}
async function snapshot(page) {
  return page.evaluate(() => Object.fromEntries(Object.keys(localStorage).sort().map(key => [key, localStorage.getItem(key)])));
}
async function preview(page, text) {
  await page.locator('#transfer-import-code').fill(text);
  await page.locator('[data-transfer-preview]').click();
  await page.locator('[data-transfer-preview-panel]').waitFor({ state: 'visible' });
  assert.ok((await page.locator('[data-transfer-summary]').innerText()).trim());
}
async function seed(page, records, theme) {
  await page.evaluate(({ records, theme, other, themeKey }) => {
    for (const [key, value] of Object.entries(records)) localStorage.setItem(key, JSON.stringify(value));
    localStorage.setItem(themeKey, theme);
    localStorage.setItem(other, '다른 기능의 값 <보존>');
  }, { records, theme, other: OTHER, themeKey: THEME });
  await page.reload();
  await page.locator('#progress-transfer').waitFor();
}
async function records(page) { return (await page.evaluate(() => window.AcademyProgressTransfer.capture())).records; }
async function expectMerged(page, fixture, theme) {
  const actual = await records(page);
  for (const [key, ids] of Object.entries(fixture.ids)) {
    assert.deepEqual([...actual[key].completed].sort(), ids.slice(0, 3).sort(), key + ': read union');
    assert.equal(actual[key].last, ids[1], key + ': newest lesson');
    assert.equal(actual[key].visitedAt, fixture.source[key].visitedAt, key + ': timestamp retained');
  }
  assert.deepEqual(actual[MATH].scores[fixture.ids[MATH][0]], { latest: 3, best: 5, date: fixture.newDate });
  assert.deepEqual(actual[MATH].scores.review, { latest: 8, best: 10, date: fixture.newDate });
  const pyKey = 'academy-python-ch01-v1';
  assert.deepEqual(actual[pyKey].scores[fixture.ids[pyKey][0]], { latest: 2, best: 5, date: fixture.newDate });
  assert.equal(await page.evaluate(key => localStorage.getItem(key), THEME), theme);
  assert.equal(await page.evaluate(key => localStorage.getItem(key), OTHER), '다른 기능의 값 <보존>');
}
async function assertNoOverflow(page, label) {
  const sizes = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  assert.ok(sizes.scroll <= sizes.width, label + ': ' + JSON.stringify(sizes));
}
function watch(page) { page.on('pageerror', error => errors.push(error.message)); }

(async () => {
  const launchOptions = { headless: true, args: ['--no-sandbox'] };
  if (process.env.CHROMIUM_PATH) launchOptions.executablePath = process.env.CHROMIUM_PATH;
  else if (require('node:fs').existsSync('/usr/bin/chromium')) launchOptions.executablePath = '/usr/bin/chromium';
  if (process.env.ACADEMY_TEST_PROXY) launchOptions.proxy = { server: process.env.ACADEMY_TEST_PROXY };
  browser = await chromium.launch(launchOptions);
  const pcContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
  // Clipboard rejection must leave a usable text fallback, without needing browser permission.
  await pcContext.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new DOMException('Denied', 'NotAllowedError'); } } });
  });
  const pc = await pcContext.newPage(); watch(pc); await settings(pc);
  const fixture = await pc.evaluate(() => {
    const ids = { 'understand-math-grade1-v1': window.CURRICULUM.lessons.map(lesson => lesson.id) };
    for (const course of window.PYTHON_COURSES) ids['academy-python-' + course.slug + '-v1'] = course.lessons.map(lesson => lesson.id);
    for (const course of window.ALGORITHMS_COURSES) ids['academy-algorithms-' + course.slug + '-v1'] = course.lessons.map(lesson => lesson.id);
    const source = {}, local = {}, time = Date.parse('2026-11-01T10:00:00.000Z');
    for (const [index, [key, values]] of Object.entries(ids).entries()) {
      source[key] = { completed: values.slice(0, 2), scores: {}, last: values[1], visitedAt: time + 10000 + index };
      local[key] = { completed: [values[0], values[2]], scores: {}, last: values[2], visitedAt: time + index };
    }
    const oldDate = '2026-10-01T10:00:00.000Z', newDate = '2026-11-01T10:00:00.000Z';
    const math = 'understand-math-grade1-v1', py = 'academy-python-ch01-v1';
    source[math].scores[ids[math][0]] = { latest: 3, best: 4, date: newDate };
    local[math].scores[ids[math][0]] = { latest: 4, best: 5, date: oldDate };
    source[math].scores.review = { latest: 8, best: 9, date: newDate };
    local[math].scores.review = { latest: 10, best: 10, date: oldDate };
    source[py].scores[ids[py][0]] = { latest: 2, best: 4, date: newDate };
    local[py].scores[ids[py][0]] = { latest: 1, best: 5, date: oldDate };
    return { ids, source, local, newDate };
  });
  assert.equal(Object.keys(fixture.ids).length, 13);
  await seed(pc, fixture.source, 'glass');
  const captured = await pc.evaluate(() => window.AcademyProgressTransfer.capture());
  const summary = await pc.evaluate(() => window.AcademyProgressTransfer.summary(window.AcademyProgressTransfer.capture()));
  assert.equal(summary.total, 94);
  assert.equal(summary.pythonCompleted, 18);
  assert.equal(summary.algorithmsCompleted, 6);
  const downloadPromise = pc.waitForEvent('download');
  await pc.locator('[data-transfer-download]').click();
  const download = await downloadPromise;
  const fileText = await fs.readFile(await download.path(), 'utf8');
  assert.deepEqual((await pc.evaluate(text => window.AcademyProgressTransfer.parse(text), fileText)).records, captured.records);
  await pc.locator('[data-transfer-code]').click();
  await pc.locator('#transfer-export-code').waitFor({ state: 'visible' });
  const exportCode = await pc.locator('#transfer-export-code').inputValue();
  assert.ok(exportCode.startsWith('ACADEMY1.'));
  assert.ok(await pc.locator('#transfer-export-code').evaluate(element => element.readOnly));
  assert.ok((await pc.locator('[data-transfer-status]').innerText()).trim());
  assert.deepEqual((await pc.evaluate(text => window.AcademyProgressTransfer.parse(text), exportCode)).records, captured.records);
  passed('PC file/code export and denied-clipboard selectable fallback');

  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobile = await mobileContext.newPage(); watch(mobile); await settings(mobile);
  await seed(mobile, fixture.local, 'forest');
  let before = await snapshot(mobile);
  await mobile.locator('#transfer-file').setInputFiles({ name: 'academy-records.json', mimeType: 'application/json', buffer: Buffer.from(fileText) });
  await mobile.locator('[data-transfer-preview-panel]').waitFor({ state: 'visible' });
  assert.match(await mobile.locator('[data-transfer-summary]').innerText(), /알고리즘·자료구조 6개/);
  assert.deepEqual(await snapshot(mobile), before, 'file preview must not write');
  assert.equal(await mobile.locator('#transfer-include-theme').isChecked(), false);
  await mobile.locator('[data-transfer-confirm]').click();
  await mobile.waitForFunction(({ key, id }) => JSON.parse(localStorage.getItem(key)).completed.includes(id), { key: MATH, id: fixture.ids[MATH][1] });
  await expectMerged(mobile, fixture, 'forest');
  await mobile.evaluate(() => { location.hash = '#/progress'; });
  await mobile.locator('.py-progress:not(.algo-progress)').first().waitFor();
  assert.equal(await mobile.locator('.py-progress:not(.algo-progress)').count(), 9);
  assert.equal(await mobile.locator('.algo-progress').count(), 3);
  for (const panel of await mobile.locator('.algo-progress').all()) assert.match(await panel.innerText(), /3\s*\/\s*6/);
  assert.match(await mobile.locator('.py-progress:not(.algo-progress)').first().locator('.py-reading-count').innerText(), /3\s*\/\s*5/);
  assert.equal(await mobile.locator('.py-progress:not(.algo-progress)').first().getByText(/최고|최근 결과|점수/).count(), 0);
  await mobile.reload();
  await mobile.locator('.py-progress:not(.algo-progress)').first().waitFor();
  await expectMerged(mobile, fixture, 'forest');
  passed('Separate mobile context: JSON file preview, merge, score preservation, same-tab state and reload');

  await settings(mobile); await seed(mobile, fixture.local, 'forest');
  before = await snapshot(mobile);
  await preview(mobile, exportCode);
  assert.deepEqual(await snapshot(mobile), before, 'code preview must not write');
  await mobile.locator('#transfer-include-theme').check();
  await mobile.locator('[data-transfer-confirm]').click();
  await mobile.waitForFunction(() => document.documentElement.dataset.theme === 'glass');
  await expectMerged(mobile, fixture, 'glass');
  const once = await snapshot(mobile);
  await preview(mobile, exportCode);
  await mobile.locator('[data-transfer-confirm]').click();
  assert.deepEqual(await snapshot(mobile), once, 'repeated import must be idempotent');
  passed('Copy-code merge, explicit theme import, and repeated-import idempotence');

  for (const count of [10, 11]) {
    const legacyRecords = Object.fromEntries(Object.entries(captured.records).slice(0, count));
    const legacy = { ...captured, records: legacyRecords };
    const prior = await snapshot(mobile);
    await preview(mobile, JSON.stringify(legacy));
    assert.match(await mobile.locator('[data-transfer-summary]').innerText(), new RegExp('알고리즘·자료구조 ' + (count === 10 ? 0 : 2) + '개'));
    await mobile.locator('[data-transfer-confirm]').click();
    const after = await snapshot(mobile);
    for (const key of algorithmKeys.slice(count === 10 ? 0 : 1)) assert.equal(after[key], prior[key], 'old ' + count + '-course files preserve omitted algorithms state ' + key);
  }
  passed('Old ten/eleven-course files preserve omitted algorithms chapters');

  before = await snapshot(mobile);
  await preview(mobile, exportCode);
  await mobile.locator('[data-transfer-cancel]').click();
  assert.deepEqual(await snapshot(mobile), before);
  await preview(mobile, exportCode);
  await mobile.locator('#transfer-import-code').fill(exportCode + '!');
  assert.ok(await mobile.locator('[data-transfer-preview-panel]').isHidden() || await mobile.locator('[data-transfer-confirm]').isDisabled(), 'editing must invalidate stale preview');
  assert.deepEqual(await snapshot(mobile), before);
  for (const bad of ['{', 'null', '{"format":"another-app","version":1}', 'ACADEMY1.!broken']) {
    await mobile.locator('#transfer-import-code').fill(bad);
    await mobile.locator('[data-transfer-preview]').click();
    assert.ok((await mobile.locator('[data-transfer-status]').innerText()).trim());
    assert.ok(await mobile.locator('[data-transfer-preview-panel]').isHidden() || await mobile.locator('[data-transfer-confirm]').isDisabled());
    assert.deepEqual(await snapshot(mobile), before, 'invalid input must not write');
  }
  passed('Cancel, stale-preview editing, and invalid input preserve storage');

  const oldTab = await mobileContext.newPage(); watch(oldTab); await settings(oldTab);
  const pending = '붙여넣는 중인 코드: 아직 검사하지 않음';
  await oldTab.locator('#transfer-import-code').fill(pending);
  await oldTab.locator('#transfer-import-code').focus();
  await mobile.evaluate(({ key, id }) => {
    const state = JSON.parse(localStorage.getItem(key));
    state.completed.push(id);
    localStorage.setItem(key, JSON.stringify(state));
  }, { key: 'academy-python-ch01-v1', id: fixture.ids['academy-python-ch01-v1'][3] });
  await oldTab.waitForFunction(({ key, id }) => JSON.parse(localStorage.getItem(key)).completed.includes(id), { key: 'academy-python-ch01-v1', id: fixture.ids['academy-python-ch01-v1'][3] });
  // Wait for the actual storage event, rather than relying on a visual sleep.
  await oldTab.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  assert.equal(await oldTab.locator('#transfer-import-code').inputValue(), pending);
  assert.ok(await oldTab.locator('#transfer-import-code').evaluate(element => element === document.activeElement));
  await oldTab.evaluate(() => { location.hash = '#/progress'; });
  await oldTab.locator('.py-progress:not(.algo-progress)').first().waitFor();
  assert.match(await oldTab.locator('.py-progress:not(.algo-progress)').first().locator('.py-reading-count').innerText(), /4\s*\/\s*5/);
  await oldTab.close();
  passed('Other-tab progress updates preserve pending input/focus and refresh learning state');

  await settings(mobile); await seed(mobile, fixture.local, 'forest');
  await preview(mobile, exportCode);
  // A newer read after preview must survive the eventual merge.
  await mobile.evaluate(({ key, id }) => {
    const state = JSON.parse(localStorage.getItem(key)); state.completed.push(id);
    localStorage.setItem(key, JSON.stringify(state));
  }, { key: MATH, id: fixture.ids[MATH][3] });
  await mobile.locator('[data-transfer-confirm]').click();
  assert.ok((await records(mobile))[MATH].completed.includes(fixture.ids[MATH][3]));
  passed('Import rereads current storage after preview');

  await seed(mobile, fixture.local, 'forest');
  before = await snapshot(mobile);
  await preview(mobile, exportCode);
  await mobile.evaluate(() => {
    const original = Storage.prototype.setItem;
    window.__restoreTransferStorage = () => { Storage.prototype.setItem = original; };
    let writes = 0;
    Storage.prototype.setItem = function (key, value) {
      if (key === 'understand-math-grade1-v1' || /^academy-(?:python|algorithms)-ch\d+-v1$/.test(key)) {
        writes += 1;
        if (writes === 2) throw new DOMException('Injected quota failure', 'QuotaExceededError');
      }
      return original.call(this, key, value);
    };
  });
  await mobile.locator('[data-transfer-confirm]').click();
  await mobile.evaluate(() => { window.__restoreTransferStorage(); delete window.__restoreTransferStorage; });
  assert.deepEqual(await snapshot(mobile), before, 'partial write failure must restore exact original raw values');
  assert.ok((await mobile.locator('[data-transfer-status]').innerText()).trim());
  await mobile.evaluate(() => { location.hash = '#/progress'; });
  await mobile.locator('.py-progress:not(.algo-progress)').first().waitFor();
  assert.match(await mobile.locator('.py-progress:not(.algo-progress)').first().locator('.py-reading-count').innerText(), /2\s*\/\s*5/);
  passed('Mid-import quota failure rolls back records and leaves same-tab state unchanged');

  await settings(mobile);
  const themes = ['light', 'forest', 'midnight', 'charcoal', 'matte', 'glass', 'ink'];
  for (const width of [1440, 390, 320]) {
    await mobile.setViewportSize({ width, height: 1000 });
    for (const theme of ['light', 'glass']) {
      await mobile.locator('label[for="theme-' + theme + '"]').click();
      await mobile.locator('[data-transfer-code]').click();
      await preview(mobile, exportCode);
      await assertNoOverflow(mobile, width + 'px ' + theme + ' with full export and preview');
      await mobile.locator('[data-transfer-cancel]').click();
    }
  }
  await mobile.setViewportSize({ width: 390, height: 844 });
  for (const theme of themes) {
    await mobile.locator('label[for="theme-' + theme + '"]').click();
    await assertNoOverflow(mobile, '390px ' + theme);
  }
  const accessibility = await mobile.evaluate(() => {
    const ids = ['transfer-file', 'transfer-import-code', 'transfer-export-code', 'transfer-include-theme'];
    return ids.map(id => {
      const element = document.getElementById(id);
      return { id, labelled: Boolean(element.labels?.length || element.getAttribute('aria-label') || element.getAttribute('aria-labelledby')) };
    });
  });
  assert.ok(accessibility.every(item => item.labelled), JSON.stringify(accessibility));
  assert.equal(await mobile.locator('[data-transfer-status]').getAttribute('role'), 'status');
  await mobile.locator('#transfer-import-code').fill(exportCode);
  await mobile.locator('[data-transfer-preview]').focus();
  await mobile.keyboard.press('Enter');
  await mobile.locator('[data-transfer-preview-panel]').waitFor({ state: 'visible' });
  await mobile.locator('[data-transfer-cancel]').focus();
  await mobile.keyboard.press('Enter');
  await mobile.locator('[data-transfer-preview-panel]').waitFor({ state: 'hidden' });
  passed('Responsive transfer UI, all themes, associated labels, status role, and keyboard preview/cancel');

  await mobile.goto(BASE + '/#/lesson/prime');
  await mobile.waitForURL('**/#/math/middle-1/lesson/prime');
  await mobile.locator('[data-quiz="prime"]').click();
  await mobile.locator('#quiz[open]').waitFor();
  assert.equal(await mobile.locator('#quiz .quiz-option').count(), 4);
  await mobile.locator('#quiz .quiz-option').first().click();
  await mobile.locator('#quiz [data-action="check"]').click();
  assert.ok(await mobile.locator('#quiz .quiz-feedback').isVisible());
  await mobile.locator('#quiz .quiz-close').click();
  assert.equal(await mobile.locator('#quiz').evaluate(dialog => dialog.open), false);
  passed('Legacy math URL and existing quiz interaction');

  assert.deepEqual(errors, [], 'page JavaScript errors');
  console.log(JSON.stringify({ status: 'passed', groups: checks.length, checks, pageErrors: errors }, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => { await browser?.close(); });
