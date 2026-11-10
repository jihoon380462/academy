'use strict';

// Start the static server first: python3 -m http.server 8000
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
let playwright;
try { playwright = require('playwright'); }
catch { playwright = require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'); }

const BASE = (process.env.ACADEMY_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const ALGO_KEY = 'academy-algorithms-ch01-v1';
const MATH_KEY = 'understand-math-grade1-v1';
const THEME_KEY = 'academy-theme-v1';
const ids = Array.from({ length: 6 }, (_, i) => 'algorithms-l' + String(i + 1).padStart(3, '0'));
const lessonRoute = id => '#/algorithms/ch01/lesson/' + id;
const routes = ['#/subjects/algorithms', '#/algorithms/ch01', ...ids.map(lessonRoute), '#/algorithms/ch01/review'];
const errors = [], groups = [];
let browser;

function watch(page) { page.on('pageerror', error => errors.push(error.message)); }
async function visit(page, hash) {
  await page.goto(BASE + '/' + hash);
  await page.locator('#main h1').waitFor();
  if (hash.includes('/algorithms/ch01/lesson/')) await page.locator('[data-algo-complete="' + hash.split('/').at(-1) + '"]').waitFor();
  else if (hash === '#/subjects/algorithms') await page.locator('#main .py-home-chapter').waitFor();
  else if (hash === '#/algorithms/ch01') await page.locator('#main.algo-chapter').waitFor();
  else if (hash === '#/algorithms/ch01/review') await page.locator('#main.algo-review').waitFor();
  assert.equal(await page.locator('#app .coming-panel h1').count(), 0, 'valid route: ' + hash);
}
async function noOverflow(page, label) {
  const size = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  assert.ok(size.scroll <= size.client, label + ': ' + JSON.stringify(size));
}
async function values(page) {
  return page.evaluate(() => Object.fromEntries(Object.keys(localStorage).map(key => [key, localStorage.getItem(key)])));
}
async function expectHash(page, hash) {
  await page.waitForFunction(expected => location.hash === expected, hash);
  await page.locator('#main h1').waitFor();
}

(async () => {
  const options = { headless: true, args: ['--no-sandbox'] };
  if (process.env.CHROMIUM_PATH) options.executablePath = process.env.CHROMIUM_PATH;
  else if (require('node:fs').existsSync('/usr/bin/chromium')) options.executablePath = '/usr/bin/chromium';
  if (process.env.ACADEMY_TEST_PROXY) options.proxy = { server: process.env.ACADEMY_TEST_PROXY };
  browser = await playwright.chromium.launch(options);
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage(); watch(page);
  await visit(page, '#/');

  assert.equal(await page.locator('.subject-card').count(), 22);
  assert.equal(await page.locator('.subject-card.available').count(), 3);
  const catalogTotals = await page.locator('.catalog-totals b').allTextContents();
  assert.deepEqual(catalogTotals, ['22', '3', '82']);
  await page.locator('.subject-card[href="#/subjects/algorithms"]').click();
  await expectHash(page, '#/subjects/algorithms');
  const card = page.locator('.py-home-chapter').first();
  assert.equal(await card.evaluate(el => el.open), false);
  await card.locator('summary').click();
  assert.equal(await card.evaluate(el => el.open), true);
  assert.equal(await card.locator('.lesson-row').count(), 6);
  await card.locator('summary').click();
  assert.equal(await card.evaluate(el => el.open), false);
  assert.match(await page.locator('#main').innerText(), /준비 중/);
  groups.push('catalog counts, subject entry and collapsed chapter toggle');

  let combinations = 0;
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const theme of ['light', 'glass']) {
      await page.evaluate(([key, value]) => { localStorage.setItem(key, value); window.AcademyTheme.refresh(); }, [THEME_KEY, theme]);
      for (const route of routes) {
        await visit(page, route);
        assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
        await noOverflow(page, `${width}px ${theme} ${route} closed`);
        const expected = route.includes('/lesson/') ? 5 : route.endsWith('/review') ? 10 : 0;
        assert.equal(await page.locator('.py-problem').count(), expected, route);
        if (expected) {
          assert.equal(await page.locator('.py-solution[open]').count(), 0, 'answers initially closed');
          assert.equal(await page.locator('#main [data-quiz], #main .quiz-options, #main textarea, #main input').count(), 0);
          const first = page.locator('.py-solution').first();
          await first.locator('summary').click();
          assert.equal(await first.evaluate(el => el.open), true);
          assert.ok((await first.locator('.py-solution-body').innerText()).trim().length > 20);
          // Opening every answer exposes long code and explanation overflow too.
          await page.locator('.py-solution').evaluateAll(items => items.forEach(item => { item.open = true; }));
          await noOverflow(page, `${width}px ${theme} ${route} open`);
        }
        combinations++;
      }
    }
  }
  groups.push(`${combinations} viewport/theme/page combinations, closed and expanded answers`);

  await page.setViewportSize({ width: 1440, height: 1000 });
  await visit(page, lessonRoute(ids[0]));
  await page.locator('.lesson-nav a').last().click();
  await expectHash(page, lessonRoute(ids[1]));
  await page.locator('.lesson-nav a').first().click();
  await expectHash(page, lessonRoute(ids[0]));
  for (let index = 1; index < ids.length; index++) {
    await page.locator('.lesson-nav a').last().click();
    await expectHash(page, lessonRoute(ids[index]));
  }
  await page.locator('.lesson-nav a').last().click();
  await expectHash(page, '#/algorithms/ch01/review');
  await page.locator('.py-solution').first().locator('summary').click();
  const related = page.locator('.py-related a').first();
  const relatedHash = await related.getAttribute('href');
  assert.ok(ids.some(id => relatedHash === lessonRoute(id)));
  await related.click();
  await expectHash(page, relatedHash);
  for (const route of ['#/algorithms/ch02', '#/algorithms/ch01/lesson/python-l001', '#/algorithms/ch01/lesson/algorithms-l007', '#/algorithms/ch01/review/extra']) {
    await page.goto(BASE + '/' + route);
    await page.locator('#main h1').waitFor();
    assert.match(await page.locator('#main h1').innerText(), /찾는 페이지/);
  }
  groups.push('previous/next, review/related navigation and invalid route rejection');

  await visit(page, '#/');
  const seeded = await page.evaluate(({ mathKey, themeKey }) => {
    const records = {};
    const mathId = window.CURRICULUM.lessons[0].id;
    records[mathKey] = JSON.stringify({ completed: [mathId], scores: { [mathId]: { latest: 3, best: 5, date: '2026-10-01T10:00:00.000Z' }, review: { latest: 8, best: 10, date: '2026-10-02T10:00:00.000Z' } }, last: mathId, visitedAt: 1000 });
    for (const [index, course] of window.PYTHON_COURSES.entries()) {
      const id = course.lessons[0].id;
      records['academy-python-' + course.slug + '-v1'] = JSON.stringify({ completed: [id], scores: { [id]: { latest: 2, best: 4, date: '2026-10-01T10:00:00.000Z' } }, last: id, visitedAt: 2000 + index });
    }
    records[themeKey] = 'ink';
    records['algorithms-test-unrelated'] = '보존할 값 <&>';
    localStorage.clear();
    for (const [key, value] of Object.entries(records)) localStorage.setItem(key, value);
    return records;
  }, { mathKey: MATH_KEY, themeKey: THEME_KEY });
  await page.reload();
  await page.locator('#main h1').waitFor();
  await visit(page, lessonRoute(ids[0]));
  await page.locator('[data-algo-complete]').click();
  assert.equal(await page.locator('[data-algo-complete]').getAttribute('aria-pressed'), 'true');
  assert.match(await page.locator('[data-algo-read-status]').innerText(), /읽음 표시됨/);
  await page.reload();
  await page.locator('[data-algo-complete]').waitFor();
  assert.match(await page.locator('[data-algo-complete]').innerText(), /취소/);
  let current = await values(page);
  for (const [key, value] of Object.entries(seeded)) assert.equal(current[key], value, key + ' raw value preserved');
  const saved = JSON.parse(current[ALGO_KEY]);
  assert.deepEqual(saved.completed, [ids[0]]);
  assert.equal(saved.last, ids[0]);
  assert.ok(saved.visitedAt > 2000);
  assert.deepEqual(saved.scores, {});
  await visit(page, lessonRoute(ids[5]));
  await visit(page, '#/progress');
  assert.equal(await page.locator('.learning-resume a').getAttribute('href'), lessonRoute(ids[5]));
  assert.match(await page.locator('#main').innerText(), /알고리즘·자료구조/);
  assert.equal(await page.locator('a[href="' + lessonRoute(ids[0]) + '"]').count() > 0, true);
  await visit(page, '#/');
  assert.equal(await page.locator('.catalog-footer a').getAttribute('href'), lessonRoute(ids[5]));
  current = await values(page);
  for (const [key, value] of Object.entries(seeded)) assert.equal(current[key], value, key + ' preserved after progress and resume');
  assert.deepEqual(JSON.parse(current[ALGO_KEY]).scores, {});
  groups.push('read/reload, latest lesson, independent store and existing raw record preservation');

  await visit(page, lessonRoute(ids[0]));
  await page.evaluate(() => {
    window.__algorithmWrites = 0;
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (...args) { window.__algorithmWrites++; return original.apply(this, args); };
  });
  const other = await context.newPage(); watch(other);
  await visit(other, '#/');
  await other.evaluate(({ key, id }) => {
    const value = JSON.parse(localStorage.getItem(key));
    value.completed = [];
    value.last = id;
    value.visitedAt = Date.now();
    localStorage.setItem(key, JSON.stringify(value));
  }, { key: ALGO_KEY, id: ids[5] });
  await page.waitForFunction(() => !document.querySelector('[data-algo-complete]').textContent.includes('취소'));
  assert.equal(await page.locator('[data-algo-complete]').getAttribute('aria-pressed'), 'false');
  assert.equal(await page.evaluate(() => window.__algorithmWrites), 0, 'storage refresh must not rewrite visit');
  await other.close();
  groups.push('cross-tab read refresh without writing a new visit');

  await visit(page, '#/lesson/prime');
  await expectHash(page, '#/math/middle-1/lesson/prime');
  await page.locator('[data-quiz="prime"]').click();
  await page.locator('#quiz[open]').waitFor();
  assert.equal(await page.locator('#quiz .quiz-option').count(), 4);
  await page.locator('#quiz .quiz-option').first().click();
  await page.locator('#quiz [data-action="check"]').click();
  assert.ok((await page.locator('#quiz .quiz-feedback').innerText()).length > 10);
  await page.locator('#quiz .quiz-close').click();
  groups.push('legacy math route and existing multiple choice feedback');

  for (const [query, route, count] of [
    ['lesson=algorithms-l005', '/algorithms/ch01/lesson/algorithms-l005', 5],
    ['page=algorithms-review', '/algorithms/ch01/review', 10],
    ['lesson=python-l001', '/python/ch01/lesson/python-l001', 5],
    ['page=python-review&chapter=ch09', '/python/ch09/review', 10]
  ]) {
    await page.goto(BASE + '/preview.html?' + query);
    assert.equal(await page.locator('#open-page').getAttribute('href'), 'index.html#' + route);
    for (const id of ['desktop', 'mobile']) {
      const element = await page.$('#' + id), frame = await element.contentFrame();
      await frame.locator('.py-problem').first().waitFor();
      assert.equal(await frame.locator('.py-problem').count(), count, query + ' ' + id);
      assert.equal(await frame.evaluate(() => location.hash), '#' + route);
      await noOverflow(frame, query + ' ' + id + ' preview');
    }
  }
  groups.push('new algorithm and existing Python PC/mobile preview links');

  const previewDir = path.join(__dirname, '..', 'previews');
  await fs.mkdir(previewDir, { recursive: true });
  await visit(page, lessonRoute(ids[4]));
  await page.screenshot({ path: path.join(previewDir, 'algorithms-ch01-pc.jpg'), type: 'jpeg', quality: 85, fullPage: false });
  await page.setViewportSize({ width: 390, height: 1000 });
  await visit(page, lessonRoute(ids[4]));
  await page.screenshot({ path: path.join(previewDir, 'algorithms-ch01-mobile.jpg'), type: 'jpeg', quality: 85, fullPage: false });
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ browser: browser.version(), groups, combinations, pageErrors: errors, screenshots: ['previews/algorithms-ch01-pc.jpg', 'previews/algorithms-ch01-mobile.jpg'] }, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => { await browser?.close(); });
