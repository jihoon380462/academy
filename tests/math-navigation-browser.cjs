'use strict';

// Start a static server first: python3 -m http.server 8000
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
let playwright;
try { playwright = require('playwright'); }
catch { playwright = require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'); }

const BASE = (process.env.ACADEMY_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const STORE = 'understand-math-grade1-v1';
const THEME = 'academy-theme-v1';
const chapter = '#/math/middle-1';
const lessonPath = id => chapter + '/lesson/' + id;
const unitPath = id => chapter + '?unit=' + id;
const errors = [], checks = [];
let browser;

async function visit(page, hash) {
  await page.goto(BASE + '/' + hash);
  await page.locator('#main h1').waitFor();
  if (hash.includes('/lesson/')) await page.locator('[data-complete="' + hash.split('/').at(-1) + '"]').waitFor();
}
async function noOverflow(page, label) {
  const size = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  assert.ok(size.scroll <= size.width, label + ': ' + JSON.stringify(size));
}
async function largeTarget(link, label) {
  const size = await link.boundingBox();
  assert.ok(size && size.width >= 44 && size.height >= 44, label + ': ' + JSON.stringify(size));
}
async function readBadge(page, id, complete, root = '#main') {
  const badges = page.locator(root + ' [data-unit-read="' + id + '"]');
  assert.ok(await badges.count() > 0, 'unit badge exists: ' + id);
  for (const badge of await badges.all()) {
    assert.equal(await badge.evaluate(element => element.hidden), !complete, id + ': complete iff all actual child lessons are read');
    assert.equal((await badge.textContent()).trim(), '✓ 모두 읽음');
  }
}
async function stored(page) { return page.evaluate(key => JSON.parse(localStorage.getItem(key)), STORE); }
async function seedMath(page, fixture, completed) {
  await page.evaluate(({ key, fixture, completed }) => localStorage.setItem(key, JSON.stringify({ ...fixture, completed })), { key: STORE, fixture, completed });
  await page.reload();
  await page.locator('#main h1').waitFor();
}
async function completeQuiz(page, id) {
  const answers = await page.evaluate(id => (id === 'review' ? window.CURRICULUM.review : window.CURRICULUM.lessons.find(lesson => lesson.id === id).examples).map(question => question.answer), id);
  await page.locator('[data-quiz="' + id + '"]').first().click();
  await page.locator('#quiz[open]').waitFor();
  for (const answer of answers) {
    await page.locator('#quiz [data-answer="' + answer + '"]').click();
    await page.locator('#quiz [data-action="check"]').click();
    await page.locator('#quiz [data-action="next"]').click();
  }
  await page.locator('#quiz .quiz-result').waitFor();
  assert.match(await page.locator('#quiz .quiz-result h3').innerText(), new RegExp(answers.length + ' / ' + answers.length));
}

(async () => {
  const options = { headless: true, args: ['--no-sandbox'] };
  if (process.env.CHROMIUM_PATH) options.executablePath = process.env.CHROMIUM_PATH;
  else if (require('node:fs').existsSync('/usr/bin/chromium')) options.executablePath = '/usr/bin/chromium';
  if (process.env.ACADEMY_TEST_PROXY) options.proxy = { server: process.env.ACADEMY_TEST_PROXY };
  browser = await playwright.chromium.launch(options);
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await visit(page, lessonPath('gcd-lcm'));
  const data = await page.evaluate(() => ({ lessons: window.CURRICULUM.lessons.map(lesson => ({ id: lesson.id, unit: lesson.unit })), units: window.CURRICULUM.units.map(unit => unit.id) }));
  const factors = data.lessons.filter(lesson => lesson.unit === 'factors').map(lesson => lesson.id);
  assert.deepEqual(factors, ['prime', 'factorization', 'gcd-lcm']);
  const last = data.lessons.at(-1);
  const score = { latest: 2, best: 5, date: '2026-11-01T10:00:00.000Z' };
  const scores = Object.fromEntries(factors.map(id => [id, { ...score }]));
  scores.review = { latest: 8, best: 10, date: score.date };
  const fixture = { completed: factors.slice(0, 2), scores, last: null, visitedAt: 0 };
  const untouched = await page.evaluate(() => {
    const values = {};
    for (const course of [...window.PYTHON_COURSES, ...window.ALGORITHMS_COURSES]) {
      const id = course.lessons[0].id, key = 'academy-' + course.id + '-v1';
      values[key] = JSON.stringify({ completed: [id], scores: { [id]: { latest: 2, best: 4, date: '2026-11-01T10:00:00.000Z' } }, last: id, visitedAt: 100 });
    }
    values['math-navigation-unrelated'] = '보존할 원문 <&>';
    values['academy-theme-v1'] = 'midnight';
    localStorage.clear();
    for (const [key, value] of Object.entries(values)) localStorage.setItem(key, value);
    return values;
  });
  await seedMath(page, fixture, factors.slice(0, 2));

  // Completing examples must leave the independent read marker unchanged.
  await readBadge(page, 'factors', false, '.lesson-sidebar');
  await completeQuiz(page, 'gcd-lcm');
  const resultBack = page.locator('#quiz a[data-math-contents]');
  assert.equal(await resultBack.getAttribute('href'), unitPath('factors'));
  await largeTarget(resultBack, 'quiz result contents link');
  await resultBack.focus();
  assert.equal(await resultBack.evaluate(link => link === document.activeElement), true);
  await page.keyboard.press('Enter');
  await page.waitForFunction(hash => location.hash === hash, unitPath('factors'));
  assert.equal(await page.locator('#quiz').evaluate(dialog => dialog.open), false);
  assert.equal(await page.locator('#unit-factors').evaluate(unit => unit.open), true);
  await readBadge(page, 'factors', false);
  let saved = await stored(page);
  assert.deepEqual(saved.completed, factors.slice(0, 2));
  assert.equal(saved.scores['gcd-lcm'].latest, 5);
  assert.equal(saved.scores['gcd-lcm'].best, 5);
  assert.deepEqual(saved.scores.prime, score);
  assert.deepEqual(saved.scores.review, scores.review);
  checks.push('five-question result returns to its expanded unit; score and read records remain independent');

  await visit(page, lessonPath('gcd-lcm'));
  await page.locator('[data-complete="gcd-lcm"]').click();
  await readBadge(page, 'factors', true, '.lesson-sidebar');
  await readBadge(page, 'rational', false, '.lesson-sidebar');
  await page.locator('[data-complete="gcd-lcm"]').click();
  await readBadge(page, 'factors', false, '.lesson-sidebar');
  await page.locator('[data-complete="gcd-lcm"]').click();
  await page.reload();
  await readBadge(page, 'factors', true, '.lesson-sidebar');
  await visit(page, '#/subjects/math');
  await readBadge(page, 'factors', true);
  await readBadge(page, 'rational', false);
  await visit(page, unitPath('factors'));
  await readBadge(page, 'factors', true);
  await seedMath(page, fixture, [factors[0]]);
  await page.locator('#lesson-search').fill('소수와 합성수');
  assert.equal(await page.locator('#chapter-list .lesson-row').count(), 1);
  await readBadge(page, 'factors', false);
  await seedMath(page, fixture, factors);
  await page.locator('#lesson-search').fill('소수와 합성수');
  assert.equal(await page.locator('#chapter-list .lesson-row').count(), 1);
  await readBadge(page, 'factors', true);
  checks.push('all three reads, cancellation, reload, home/sidebar badges and filtered search use the whole unit');

  // Existing stored reads and cross-tab changes derive badges without extra writes.
  await seedMath(page, fixture, factors.slice(0, 2));
  await page.evaluate(() => {
    window.__mathNavigationWrites = 0;
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (...args) { window.__mathNavigationWrites++; return original.apply(this, args); };
  });
  const other = await context.newPage();
  other.on('pageerror', error => errors.push(error.message));
  await visit(other, '#/');
  await other.evaluate(({ key, ids }) => {
    const state = JSON.parse(localStorage.getItem(key));
    state.completed = ids;
    localStorage.setItem(key, JSON.stringify(state));
  }, { key: STORE, ids: factors });
  await page.waitForFunction(() => !document.querySelector('#unit-factors [data-unit-read="factors"]').hidden);
  assert.equal(await page.evaluate(() => window.__mathNavigationWrites), 0);
  await other.evaluate(key => {
    const state = JSON.parse(localStorage.getItem(key));
    state.completed.pop();
    localStorage.setItem(key, JSON.stringify(state));
  }, STORE);
  await page.waitForFunction(() => document.querySelector('#unit-factors [data-unit-read="factors"]').hidden);
  assert.equal(await page.evaluate(() => window.__mathNavigationWrites), 0);
  for (const close of ['button', 'Escape']) {
    await visit(page, lessonPath('gcd-lcm'));
    await page.locator('[data-quiz="gcd-lcm"]').click();
    await page.locator('#quiz [data-answer]').first().click();
    const modal = await page.evaluate(() => {
      window.__mathModalFocus = document.activeElement;
      return {
        question: document.querySelector('#quiz .quiz-question').textContent,
        selected: document.querySelector('#quiz [data-answer][aria-pressed="true"]').dataset.answer,
        writes: window.__mathNavigationWrites
      };
    });
    for (const complete of [true, false]) {
      await other.evaluate(({ key, ids }) => {
        const state = JSON.parse(localStorage.getItem(key));
        state.completed = ids;
        localStorage.setItem(key, JSON.stringify(state));
      }, { key: STORE, ids: complete ? factors : factors.slice(0, 2) });
      await page.waitForFunction(complete => document.querySelector('.lesson-sidebar [data-unit-read="factors"]').hidden === !complete, complete);
      assert.deepEqual(await page.evaluate(() => ({
        open: document.querySelector('#quiz').open,
        question: document.querySelector('#quiz .quiz-question').textContent,
        selected: document.querySelector('#quiz [data-answer][aria-pressed="true"]').dataset.answer,
        sameFocus: document.activeElement === window.__mathModalFocus && window.__mathModalFocus.isConnected,
        writes: window.__mathNavigationWrites
      })), { open: true, question: modal.question, selected: modal.selected, sameFocus: true, writes: modal.writes });
    }
    if (close === 'button') await page.locator('#quiz .quiz-close').click();
    else await page.keyboard.press('Escape');
    assert.equal(await page.locator('#quiz').evaluate(dialog => dialog.open), false);
    await readBadge(page, 'factors', false, '.lesson-sidebar');
    assert.equal(await page.locator('[data-quiz="gcd-lcm"]').evaluate(button => button === document.activeElement), true);
  }
  await other.close();
  checks.push('cross-tab reads refresh badges behind an open quiz without changing question, selection, focus or storage');

  await visit(page, '#/settings');
  const incoming = await page.evaluate(({ key, id }) => ({ format: 'academy-progress', version: 1, exportedAt: new Date().toISOString(), records: { [key]: { completed: [id], scores: {}, last: null, visitedAt: 0 } } }), { key: STORE, id: factors.at(-1) });
  const beforePreview = await page.evaluate(key => localStorage.getItem(key), STORE);
  await page.locator('#transfer-import-code').fill(JSON.stringify(incoming));
  await page.locator('[data-transfer-preview]').click();
  await page.locator('[data-transfer-preview-panel]').waitFor({ state: 'visible' });
  assert.equal(await page.evaluate(key => localStorage.getItem(key), STORE), beforePreview);
  await page.locator('[data-transfer-confirm]').click();
  await visit(page, unitPath('factors'));
  await readBadge(page, 'factors', true);
  saved = await stored(page);
  assert.deepEqual(saved.completed, factors);
  assert.deepEqual(saved.scores, fixture.scores);
  assert.deepEqual(Object.keys(saved).sort(), ['completed', 'last', 'scores', 'visitedAt']);
  checks.push('cross-tab changes and imported read union derive status without a new store or stored unit flag');

  // No browser history is needed to return from direct or legacy lesson links.
  for (const item of [{ id: 'prime', unit: 'factors' }, { id: 'gcd-lcm', unit: 'factors' }, last]) {
    const direct = await context.newPage();
    direct.on('pageerror', error => errors.push(error.message));
    await visit(direct, lessonPath(item.id));
    const back = direct.locator('a.math-contents-back');
    assert.equal(await back.getAttribute('href'), unitPath(item.unit));
    await back.click();
    await direct.waitForFunction(hash => location.hash === hash, unitPath(item.unit));
    assert.equal(await direct.locator('#unit-' + item.unit).evaluate(unit => unit.open), true);
    await direct.close();
  }
  await page.goto(BASE + '/#/lesson/gcd-lcm');
  await page.waitForFunction(hash => location.hash === hash, lessonPath('gcd-lcm'));
  assert.equal(await page.locator('.lesson-nav a').first().getAttribute('href'), lessonPath('factorization'));
  assert.equal(await page.locator('.lesson-nav a').last().getAttribute('href'), lessonPath('signed-number'));
  await page.locator('a.math-contents-back').click();
  await page.waitForFunction(hash => location.hash === hash, unitPath('factors'));
  await visit(page, chapter + '/review');
  await completeQuiz(page, 'review');
  assert.equal(await page.locator('#quiz a[data-math-contents]').getAttribute('href'), chapter);
  await page.locator('#quiz a[data-math-contents]').click();
  await page.waitForFunction(hash => location.hash === hash, chapter);
  assert.equal(await page.locator('#quiz').evaluate(dialog => dialog.open), false);
  checks.push('direct-entry, last lesson and legacy returns preserve previous/next; review returns to the full chapter');

  let combinations = 0;
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const theme of ['light', 'midnight', 'glass']) {
      await page.evaluate(({ key, theme }) => { localStorage.setItem(key, theme); window.AcademyTheme.refresh(); }, { key: THEME, theme });
      for (const hash of ['#/subjects/math', unitPath('factors'), lessonPath('prime'), lessonPath('gcd-lcm'), lessonPath(last.id)]) {
        await visit(page, hash);
        await noOverflow(page, `${width}px ${theme} ${hash}`);
        if (hash.includes('/lesson/')) {
          const back = page.locator('a.math-contents-back');
          await largeTarget(back, `${width}px ${theme} lesson contents link`);
          await back.focus();
          assert.equal(await back.evaluate(link => link === document.activeElement), true);
        }
        combinations++;
      }
      await visit(page, lessonPath('gcd-lcm'));
      await completeQuiz(page, 'gcd-lcm');
      await largeTarget(page.locator('#quiz a[data-math-contents]'), `${width}px ${theme} quiz result contents link`);
      await noOverflow(page, `${width}px ${theme} quiz result`);
      const quizSize = await page.locator('#quiz').evaluate(dialog => ({ width: dialog.clientWidth, scroll: dialog.scrollWidth }));
      assert.ok(quizSize.scroll <= quizSize.width, JSON.stringify(quizSize));
      await page.locator('#quiz a[data-math-contents]').click();
      combinations++;
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  for (const theme of ['light', 'forest', 'midnight', 'charcoal', 'matte', 'glass', 'ink']) {
    await page.evaluate(({ key, theme }) => { localStorage.setItem(key, theme); window.AcademyTheme.refresh(); }, { key: THEME, theme });
    await visit(page, lessonPath('gcd-lcm'));
    assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
    await noOverflow(page, '390px all-theme smoke: ' + theme);
    await largeTarget(page.locator('a.math-contents-back'), theme + ' contents link');
  }
  checks.push(`${combinations} width/theme/page combinations, 44px return targets, keyboard focus and seven mobile themes`);

  // The only changed persistent values are the existing math state and chosen theme.
  const current = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).map(key => [key, localStorage.getItem(key)])));
  for (const [key, value] of Object.entries(untouched)) if (key !== THEME) assert.equal(current[key], value, key + ' unchanged');
  assert.deepEqual(Object.keys(current).sort(), [...Object.keys(untouched), STORE].sort());
  await page.evaluate(key => { localStorage.setItem(key, 'midnight'); window.AcademyTheme.refresh(); }, THEME);
  const directory = '/tmp/academy-math-navigation';
  await fs.mkdir(directory, { recursive: true });
  await visit(page, lessonPath('gcd-lcm'));
  await page.locator('a.math-contents-back').scrollIntoViewIfNeeded();
  await page.screenshot({ path: directory + '/lesson-return-mobile.png' });
  await visit(page, unitPath('factors'));
  await page.screenshot({ path: directory + '/unit-read-mobile.png' });
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ browser: browser.version(), groups: checks.length, checks, combinations, pageErrors: errors, screenshots: [directory + '/lesson-return-mobile.png', directory + '/unit-read-mobile.png'] }, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => { await browser?.close(); });
