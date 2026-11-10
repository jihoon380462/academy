'use strict';

// Start the static server first: python3 -m http.server 8000
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
let playwright;
try { playwright = require('playwright'); }
catch { playwright = require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'); }

const BASE = (process.env.ACADEMY_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const ALGO_KEY = 'academy-algorithms-ch09-v1';
const MATH_KEY = 'understand-math-grade1-v1';
const THEME_KEY = 'academy-theme-v1';
const chapterSizes = [6, 6, 6, 6, 7, 5, 6, 6, 6];
const chapters = chapterSizes.map((size, index) => ({
  slug: 'ch' + String(index + 1).padStart(2, '0'),
  ids: Array.from({ length: size }, (_, offset) => 'algorithms-l' + String(chapterSizes.slice(0, index).reduce((sum, count) => sum + count, 0) + offset + 1).padStart(3, '0'))
}));
const ids = chapters.flatMap(chapter => chapter.ids);
const chapterOf = id => chapters.find(chapter => chapter.ids.includes(id));
const chapterRoute = chapter => '#/algorithms/' + chapter.slug;
const lessonRoute = id => chapterRoute(chapterOf(id)) + '/lesson/' + id;
const routes = ['#/subjects/algorithms', ...chapters.flatMap(chapter => [chapterRoute(chapter), ...chapter.ids.map(lessonRoute), chapterRoute(chapter) + '/review'])];
const errors = [], groups = [];
let browser;

function watch(page) { page.on('pageerror', error => errors.push(error.message)); }
async function visit(page, hash) {
  await page.goto(BASE + '/' + hash);
  await page.locator('#main h1').waitFor();
  if (/\/algorithms\/ch\d+\/lesson\//.test(hash)) await page.locator('[data-algo-complete="' + hash.split('/').at(-1) + '"]').waitFor();
  else if (hash === '#/subjects/algorithms') await page.locator('#main .py-home-chapter').first().waitFor();
  else if (/^#\/algorithms\/ch\d+$/.test(hash)) await page.locator('#main.algo-chapter').waitFor();
  else if (/^#\/algorithms\/ch\d+\/review$/.test(hash)) await page.locator('#main.algo-review').waitFor();
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
  assert.deepEqual(catalogTotals, ['22', '3', '130']);
  await page.locator('.subject-card[href="#/subjects/algorithms"]').click();
  await expectHash(page, '#/subjects/algorithms');
  const actualCourses = await page.evaluate(() => window.ALGORITHMS_COURSES.map(course => ({ slug: course.slug, ids: course.lessons.map(lesson => lesson.id) })));
  assert.deepEqual(actualCourses, chapters);
  assert.equal(await page.locator('.py-home-chapter').count(), 9);
  for (const [index, chapter] of chapters.entries()) {
    const card = page.locator('.py-home-chapter').nth(index);
    assert.equal(await card.evaluate(el => el.open), false);
    await card.locator('summary').click();
    assert.equal(await card.evaluate(el => el.open), true);
    assert.equal(await card.locator('.lesson-row').count(), chapter.ids.length);
    assert.deepEqual(await card.locator('.lesson-row').evaluateAll(links => links.map(link => link.getAttribute('href'))), chapter.ids.map(lessonRoute));
    await card.locator('summary').click();
    assert.equal(await card.evaluate(el => el.open), false);
  }
  assert.match(await page.locator('.py-course-note').innerText(), /과정 구성 완료/);
  assert.doesNotMatch(await page.locator('.py-course-note').innerText(), /준비 중/);
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
        let examples = [];
        if (route.includes('/lesson/')) {
          examples = await page.evaluate(id => window.ALGORITHMS_COURSES.flatMap(course => course.lessons).find(lesson => lesson.id === id).examples, route.split('/').at(-1));
          assert.equal(examples[0].exerciseType, 'explain', 'example 1 explains the concept');
          assert.ok(['explain', 'implement'].includes(examples[1].exerciseType), 'example 2 has an explicit supported type');
          assert.deepEqual(examples.slice(2).map(example => example.exerciseType), ['implement', 'implement', 'implement']);
          for (const [index, example] of examples.entries()) {
            const problem = page.locator('.py-problem').nth(index);
            assert.equal(await problem.getAttribute('data-exercise-type'), example.exerciseType);
            assert.match(await problem.locator('.py-problem-meta span').first().innerText(), example.exerciseType === 'implement' ? /직접 구현/ : /개념 설명/);
            assert.equal(await problem.locator('h3').textContent(), example.question, 'the learner sees the authored requirement');
            if (example.exerciseType === 'implement') {
              assert.equal(example.solution.code.kind, 'python');
              assert.equal(typeof example.solution.code.output, 'string');
              assert.equal(await problem.locator('.py-solution .py-code-source').isVisible(), false, 'implementation solution stays folded until opened');
            }
          }
        } else if (route.endsWith('/review')) {
          assert.equal(await page.locator('.py-problem[data-exercise-type]').count(), 0, 'review keeps its existing presentation');
        }
        if (expected) {
          assert.equal(await page.locator('.py-solution[open]').count(), 0, 'answers initially closed');
          assert.equal(await page.locator('#main [data-quiz], #main .quiz-options, #main textarea, #main input').count(), 0);
          const first = page.locator('.py-solution').first();
          await first.locator('summary').click();
          assert.equal(await first.evaluate(el => el.open), true);
          assert.ok((await first.locator('.py-solution-body').innerText()).trim().length > 20);
          if (examples.length) {
            const firstImplementation = examples.findIndex(example => example.exerciseType === 'implement');
            await page.locator('.py-problem').nth(firstImplementation).locator('.py-solution summary').click();
          }
          // Opening every answer exposes long code and explanation overflow too.
          await page.locator('.py-solution').evaluateAll(items => items.forEach(item => { item.open = true; }));
          for (const [index, example] of examples.entries()) {
            if (example.exerciseType !== 'implement') continue;
            const problem = page.locator('.py-problem').nth(index), source = problem.locator('.py-solution .py-code-source');
            assert.equal(await source.isVisible(), true);
            assert.equal(await source.locator('code').textContent(), example.solution.code.source);
            assert.equal(await source.getAttribute('tabindex'), '0', 'code can receive keyboard focus for scrolling');
            const scroll = await source.evaluate(element => {
              const maximum = element.scrollWidth - element.clientWidth;
              element.scrollLeft = maximum;
              const moved = element.scrollLeft;
              element.scrollLeft = 0;
              return { maximum, moved, overflow: getComputedStyle(element).overflowX };
            });
            assert.ok(['auto', 'scroll'].includes(scroll.overflow));
            if (scroll.maximum > 1) assert.ok(scroll.moved > 0, 'long implementation code scrolls within its own panel');
            const output = problem.locator('.py-solution .py-code-output');
            if (example.solution.code.output === '') assert.match(await output.innerText(), /출력 없음/);
            else assert.equal(await output.locator('pre code').textContent(), example.solution.code.output);
          }
          await noOverflow(page, `${width}px ${theme} ${route} open`);
        }
        combinations++;
      }
    }
  }
  groups.push(`${combinations} viewport/theme/page combinations, exercise types and folded/open runnable solutions with code scrolling`);

  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const chapter of chapters) {
    await visit(page, lessonRoute(chapter.ids[0]));
    await page.locator('.lesson-nav a').last().click();
    await expectHash(page, lessonRoute(chapter.ids[1]));
    await page.locator('.lesson-nav a').first().click();
    await expectHash(page, lessonRoute(chapter.ids[0]));
    for (let index = 1; index < chapter.ids.length; index++) {
      await page.locator('.lesson-nav a').last().click();
      await expectHash(page, lessonRoute(chapter.ids[index]));
    }
    await page.locator('.lesson-nav a').last().click();
    await expectHash(page, chapterRoute(chapter) + '/review');
    const nextChapter = chapters[chapters.indexOf(chapter) + 1];
    if (nextChapter) {
      await page.locator('#main .actions a[href="' + chapterRoute(nextChapter) + '"]').click();
      await expectHash(page, chapterRoute(nextChapter));
      await visit(page, chapterRoute(chapter) + '/review');
    } else assert.equal(await page.locator('#main a[href="#/algorithms/ch10"]').count(), 0);
    await page.locator('.py-solution').first().locator('summary').click();
    const related = page.locator('.py-related a').first();
    const relatedHash = await related.getAttribute('href');
    assert.ok(chapter.ids.some(id => relatedHash === lessonRoute(id)));
    await related.click();
    await expectHash(page, relatedHash);
  }
  for (const route of ['#/algorithms/ch10', '#/algorithms/ch09/lesson/python-l001', ...chapters.map((item, index) => chapterRoute(item) + '/lesson/' + chapters[(index + 1) % chapters.length].ids[0]), '#/algorithms/ch09/lesson/algorithms-l055', '#/algorithms/ch09/review/extra']) {
    await page.goto(BASE + '/' + route);
    await page.locator('#main h1').waitFor();
    assert.match(await page.locator('#main h1').innerText(), /찾는 페이지/);
  }
  groups.push('previous/next, review/related navigation and invalid route rejection');

  await visit(page, '#/');
  const seeded = await page.evaluate(({ mathKey, themeKey }) => {
    const records = {};
    const mathId = window.CURRICULUM.lessons[0].id;
    records[mathKey] = JSON.stringify({ completed: window.CURRICULUM.lessons.filter(lesson => lesson.unit === 'factors').map(lesson => lesson.id), scores: { [mathId]: { latest: 3, best: 5, date: '2026-10-01T10:00:00.000Z' }, review: { latest: 8, best: 10, date: '2026-10-02T10:00:00.000Z' } }, last: mathId, visitedAt: 1000 });
    for (const [index, course] of window.PYTHON_COURSES.entries()) {
      const id = course.lessons[0].id;
      records['academy-python-' + course.slug + '-v1'] = JSON.stringify({ completed: [id], scores: { [id]: { latest: 2, best: 4, date: '2026-10-01T10:00:00.000Z' } }, last: id, visitedAt: 2000 + index });
    }
    for (const [index, course] of window.ALGORITHMS_COURSES.slice(0, 5).entries()) {
      const id = course.lessons[1].id;
      records['academy-algorithms-' + course.slug + '-v1'] = JSON.stringify({ completed: [id], scores: { [id]: { latest: 2, best: 4, date: '2026-10-01T10:00:00.000Z' } }, last: id, visitedAt: 3000 + index }, null, 1);
    }
    records[themeKey] = 'ink';
    records['algorithms-test-unrelated'] = '보존할 값 <&>';
    localStorage.clear();
    for (const [key, value] of Object.entries(records)) localStorage.setItem(key, value);
    return records;
  }, { mathKey: MATH_KEY, themeKey: THEME_KEY });
  await page.reload();
  await page.locator('#main h1').waitFor();
  for (const chapter of chapters.slice(5)) {
    const before = await values(page);
    await visit(page, lessonRoute(chapter.ids[0]));
    await page.locator('[data-algo-complete]').click();
    assert.equal(await page.locator('[data-algo-complete]').getAttribute('aria-pressed'), 'true');
    assert.match(await page.locator('[data-algo-read-status]').innerText(), /읽음 표시됨/);
    await page.reload();
    await page.locator('[data-algo-complete]').waitFor();
    assert.match(await page.locator('[data-algo-complete]').innerText(), /취소/);
    const current = await values(page), key = 'academy-algorithms-' + chapter.slug + '-v1';
    for (const [oldKey, value] of Object.entries(before)) if (oldKey !== key) assert.equal(current[oldKey], value, oldKey + ' raw value preserved');
    const saved = JSON.parse(current[key]);
    assert.deepEqual(saved.completed, [chapter.ids[0]]);
    assert.equal(saved.last, chapter.ids[0]);
    assert.ok(saved.visitedAt > 3000);
    assert.deepEqual(saved.scores, {});
  }
  await visit(page, lessonRoute(ids.at(-1)));
  await visit(page, '#/progress');
  assert.equal(await page.locator('.learning-resume a').getAttribute('href'), lessonRoute(ids.at(-1)));
  assert.equal(await page.locator('.algo-progress').count(), 9);
  for (const chapter of chapters.slice(5)) assert.equal(await page.locator('.algo-progress a[href="' + lessonRoute(chapter.ids[0]) + '"]').count() > 0, true);
  await visit(page, '#/');
  assert.equal(await page.locator('.catalog-footer a').getAttribute('href'), lessonRoute(ids.at(-1)));
  const current = await values(page);
  for (const [key, value] of Object.entries(seeded)) assert.equal(current[key], value, key + ' preserved after progress and resume');
  for (const chapter of chapters.slice(5)) assert.deepEqual(JSON.parse(current['academy-algorithms-' + chapter.slug + '-v1']).scores, {});
  groups.push('read/reload, latest lesson, independent store and existing raw record preservation');

  await visit(page, lessonRoute(chapters.at(-1).ids[0]));
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
  }, { key: ALGO_KEY, id: ids.at(-1) });
  await page.waitForFunction(() => !document.querySelector('[data-algo-complete]').textContent.includes('취소'));
  assert.equal(await page.locator('[data-algo-complete]').getAttribute('aria-pressed'), 'false');
  assert.equal(await page.evaluate(() => window.__algorithmWrites), 0, 'storage refresh must not rewrite visit');
  await other.close();
  groups.push('cross-tab read refresh without writing a new visit');

  await visit(page, '#/lesson/prime');
  await expectHash(page, '#/math/middle-1/lesson/prime');
  assert.equal(await page.locator('.lesson-sidebar [data-unit-read="factors"]').evaluate(badge => badge.hidden), false);
  assert.equal(await page.locator('a.math-contents-back').getAttribute('href'), '#/math/middle-1?unit=factors');
  await page.locator('[data-quiz="prime"]').click();
  await page.locator('#quiz[open]').waitFor();
  assert.equal(await page.locator('#quiz .quiz-option').count(), 4);
  await page.locator('#quiz .quiz-option').first().click();
  await page.locator('#quiz [data-action="check"]').click();
  assert.ok((await page.locator('#quiz .quiz-feedback').innerText()).length > 10);
  await page.locator('#quiz .quiz-close').click();
  await page.locator('a.math-contents-back').click();
  await expectHash(page, '#/math/middle-1?unit=factors');
  assert.equal(await page.locator('#unit-factors').evaluate(unit => unit.open), true);
  assert.equal(await page.locator('#unit-factors [data-unit-read="factors"]').evaluate(badge => badge.hidden), false);
  groups.push('legacy math route, read aggregate, unit contents return and existing multiple choice feedback');

  for (const [query, route, count] of [
    ['lesson=algorithms-l005', '/algorithms/ch01/lesson/algorithms-l005', 5],
    ['page=algorithms-review', '/algorithms/ch01/review', 10],
    ['lesson=algorithms-l008', '/algorithms/ch02/lesson/algorithms-l008', 5],
    ['page=algorithms-review&chapter=ch02', '/algorithms/ch02/review', 10],
    ['lesson=algorithms-l017', '/algorithms/ch03/lesson/algorithms-l017', 5],
    ['page=algorithms-review&chapter=ch03', '/algorithms/ch03/review', 10],
    ['lesson=algorithms-l024', '/algorithms/ch04/lesson/algorithms-l024', 5],
    ['page=algorithms-review&chapter=ch04', '/algorithms/ch04/review', 10],
    ['lesson=algorithms-l030', '/algorithms/ch05/lesson/algorithms-l030', 5],
    ['lesson=algorithms-l031', '/algorithms/ch05/lesson/algorithms-l031', 5],
    ['page=algorithms-review&chapter=ch05', '/algorithms/ch05/review', 10],
    ...chapters.slice(5).flatMap(item => [
      ['page=algorithms-chapter&chapter=' + item.slug, '/algorithms/' + item.slug, 0],
      ['lesson=' + item.ids.at(-1), '/algorithms/' + item.slug + '/lesson/' + item.ids.at(-1), 5],
      ['page=algorithms-review&chapter=' + item.slug, '/algorithms/' + item.slug + '/review', 10]
    ]),
    ['lesson=python-l001', '/python/ch01/lesson/python-l001', 5],
    ['page=python-review&chapter=ch09', '/python/ch09/review', 10]
  ]) {
    await page.goto(BASE + '/preview.html?' + query);
    assert.equal(await page.locator('#open-page').getAttribute('href'), 'index.html#' + route);
    for (const id of ['desktop', 'mobile']) {
      const element = await page.$('#' + id), frame = await element.contentFrame();
      if (count) await frame.locator('.py-problem').first().waitFor();
      else await frame.locator('#main.algo-chapter').waitFor();
      assert.equal(await frame.locator('.py-problem').count(), count, query + ' ' + id);
      assert.equal(await frame.evaluate(() => location.hash), '#' + route);
      await noOverflow(frame, query + ' ' + id + ' preview');
      if (query.startsWith('lesson=algorithms-')) {
        const id = query.slice('lesson='.length), owner = chapterOf(id), order = owner.ids.indexOf(id) + 1;
        assert.match(await frame.locator('.lesson-heading .eyebrow').innerText(), new RegExp('LESSON ' + String(order).padStart(2, '0') + ' / ' + owner.ids.length));
        assert.equal(await frame.locator('[data-algo-lesson]').count(), owner.ids.length);
      }
    }
  }
  groups.push('new algorithm and existing Python PC/mobile preview links');

  const previewDir = process.env.ACADEMY_SCREENSHOT_DIR || '/tmp/academy-algorithms-practice/previews';
  await fs.mkdir(previewDir, { recursive: true });
  const screenshots = [];
  for (const shot of [
    { id: 'algorithms-l001', width: 390, state: 'closed' },
    { id: 'algorithms-l008', width: 1440, state: 'open' },
    { id: 'algorithms-l039', width: 390, state: 'closed' },
    { id: 'algorithms-l052', width: 1440, state: 'open' }
  ]) {
    await page.setViewportSize({ width: shot.width, height: 1100 });
    await visit(page, lessonRoute(shot.id));
    await page.reload();
    await page.locator('[data-algo-complete="' + shot.id + '"]').waitFor();
    await page.evaluate(theme => { localStorage.setItem('academy-theme-v1', theme); window.AcademyTheme.refresh(); }, shot.width < 500 ? 'glass' : 'light');
    const file = 'algorithms-practice-' + shot.id + '-' + (shot.width < 500 ? 'mobile' : 'pc') + '-' + shot.state + '.png';
    if (shot.state === 'closed') {
      await page.locator('#practice').evaluate(element => window.scrollTo({ top: window.scrollY + element.getBoundingClientRect().top - 16, behavior: 'instant' }));
      await page.screenshot({ path: path.join(previewDir, file) });
    } else {
      const implementation = page.locator('.py-problem[data-exercise-type="implement"]').first();
      await implementation.locator('.py-solution summary').click();
      await implementation.screenshot({ path: path.join(previewDir, file) });
    }
    screenshots.push(path.join(previewDir, file));
  }
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ browser: browser.version(), groups, combinations, pageErrors: errors, screenshots }, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => { await browser?.close(); });
