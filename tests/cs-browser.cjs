'use strict';

// Start the static server first: python3 -m http.server 8000
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
let playwright;
try { playwright = require('playwright'); }
catch { playwright = require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'); }

const BASE = (process.env.ACADEMY_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const CS_KEY = 'academy-cs-ch01-v1';
const THEME_KEY = 'academy-theme-v1';
const ids = ['cs-l001', 'cs-l002', 'cs-l003', 'cs-l004', 'cs-l005'];
const titles = ['입력·처리·출력·저장', '하드웨어·운영체제·응용 프로그램', '추상화와 인터페이스', '프로그램과 데이터', '상태와 시간의 흐름'];
const lessonRoute = id => '#/cs/ch01/lesson/' + id;
const routes = ['#/subjects/cs', '#/cs/ch01', ...ids.map(lessonRoute), '#/cs/ch01/review'];
const errors = [], requestErrors = [], groups = [];
const sameOrigin = url => new URL(url).origin === new URL(BASE).origin;
let browser;

function watch(page) {
  page.on('pageerror', error => errors.push(error.message));
  page.on('requestfailed', request => {
    if (sameOrigin(request.url()) && request.failure()?.errorText !== 'net::ERR_ABORTED') requestErrors.push(request.url() + ': ' + request.failure()?.errorText);
  });
  page.on('response', response => {
    if (sameOrigin(response.url()) && response.status() >= 400) requestErrors.push(response.status() + ' ' + response.url());
  });
}
async function visit(page, hash) {
  await page.goto(BASE + '/' + hash);
  await page.locator('#main h1').waitFor();
  if (ids.some(id => hash === lessonRoute(id))) await page.locator('[data-cs-complete="' + hash.split('/').at(-1) + '"]').waitFor();
  if (hash === '#/subjects/cs') await page.locator('#main.cs-home').waitFor();
  if (hash === '#/cs/ch01') await page.locator('#main.cs-chapter').waitFor();
  if (hash === '#/cs/ch01/review') await page.locator('#main.cs-review').waitFor();
}
async function expectHash(page, hash) {
  await page.waitForFunction(expected => location.hash === expected, hash);
  await page.locator('#main h1').waitFor();
}
async function noOverflow(page, label) {
  const sizes = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  assert.ok(sizes.scroll <= sizes.client, label + ': ' + JSON.stringify(sizes));
}
async function values(page) {
  return page.evaluate(() => Object.fromEntries(Object.keys(localStorage).map(key => [key, localStorage.getItem(key)])));
}
async function checkQuestions(page, questions) {
  assert.deepEqual(await page.locator('.py-problem > h3').allTextContents(), questions.map(question => question.question));
  assert.deepEqual(await page.locator('.py-solution-body > p:first-child').allTextContents(), questions.map(question => question.solution.answer));
  assert.deepEqual(await page.locator('.py-solution-body > p:last-of-type').allTextContents(), questions.map(question => question.explanation));
  for (const [index, question] of questions.entries()) {
    const problem = page.locator('.py-problem').nth(index);
    if (question.code) assert.equal(await problem.locator(':scope > .py-code .py-code-source code').textContent(), question.code);
    if (question.solution.code) assert.equal(await problem.locator('.py-solution .py-code-source code').textContent(), question.solution.code.source);
  }
}

(async () => {
  const root = path.resolve(__dirname, '..');
  const lessons = await Promise.all(ids.map((_, index) => fs.readFile(path.join(root, 'content/cs/ch01/lesson-0' + (index + 1) + '.json'), 'utf8').then(JSON.parse)));
  const review = JSON.parse(await fs.readFile(path.join(root, 'content/cs/ch01/review.json'), 'utf8'));
  assert.deepEqual(lessons.map(lesson => lesson.id), ids);
  assert.deepEqual(lessons.map(lesson => lesson.title), titles);
  const options = { headless: true, args: ['--no-sandbox'] };
  if (process.env.CHROMIUM_PATH) options.executablePath = process.env.CHROMIUM_PATH;
  else if (require('node:fs').existsSync('/usr/bin/chromium')) options.executablePath = '/usr/bin/chromium';
  if (process.env.ACADEMY_TEST_PROXY) options.proxy = { server: process.env.ACADEMY_TEST_PROXY };
  browser = await playwright.chromium.launch(options);
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage(); watch(page);
  await visit(page, '#/');
  assert.equal(await page.locator('.subject-card').count(), 22);
  assert.equal(await page.locator('.subject-card.available').count(), 4);
  assert.deepEqual(await page.locator('.catalog-totals b').allTextContents(), ['22', '4', '137']);
  await page.locator('.subject-card[href="#/subjects/cs"]').click();
  await expectHash(page, '#/subjects/cs');
  assert.deepEqual(await page.evaluate(() => window.CS_COURSES.map(course => ({ id: course.id, ids: course.lessons.map(lesson => lesson.id) }))), [{ id: 'cs-ch01', ids }]);
  const card = page.locator('.py-home-chapter');
  assert.equal(await card.count(), 1);
  assert.equal(await card.evaluate(element => element.open), false);
  await card.locator('summary').click();
  assert.equal(await card.evaluate(element => element.open), true);
  assert.deepEqual(await card.locator('.lesson-row').evaluateAll(links => links.map(link => link.getAttribute('href'))), ids.map(lessonRoute));
  await card.locator('summary').click();
  assert.equal(await card.evaluate(element => element.open), false);
  assert.match(await page.locator('.py-course-note').innerText(), /준비 중/);
  assert.equal(await page.locator('a[href^="#/cs/ch02"]').count(), 0);
  groups.push('catalog 22/4/137, one CS chapter and collapsed/open/closed contents');

  let combinations = 0;
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const theme of ['light', 'glass']) {
      await page.evaluate(([key, value]) => { localStorage.setItem(key, value); window.AcademyTheme.refresh(); }, [THEME_KEY, theme]);
      for (const route of routes) {
        await visit(page, route);
        assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
        assert.equal(await page.locator('body').getAttribute('data-section'), 'cs');
        await noOverflow(page, width + ' ' + theme + ' ' + route + ' closed');
        const lesson = lessons.find(item => route === lessonRoute(item.id));
        const questions = lesson ? lesson.examples : route.endsWith('/review') ? review : [];
        assert.equal(await page.locator('.py-problem').count(), questions.length);
        assert.equal(await page.locator('#main [data-quiz], #main .quiz-options, #main textarea, #main input').count(), 0);
        if (lesson) {
          assert.equal(await page.locator('#main h1').textContent(), lesson.title);
          assert.equal(await page.locator('.intro-text').textContent(), lesson.intro);
          assert.deepEqual(await page.locator('#concept .concept-step > p').allTextContents(), lesson.sections.flatMap(section => section.body));
          assert.deepEqual(await page.locator('#worked > ol > li').allTextContents(), lesson.worked.steps);
          assert.equal(await page.locator('#worked > .answer').textContent(), lesson.worked.answer);
          assert.deepEqual(await page.locator('.keypoints li').allTextContents(), lesson.keypoints);
          assert.equal(await page.locator('[data-cs-complete]').count(), 1);
        } else if (route.endsWith('/review')) assert.match(await page.locator('#main h1').innerText(), /복습 10문제/);
        if (questions.length) {
          await checkQuestions(page, questions);
          assert.equal(await page.locator('.py-solution[open]').count(), 0);
          const first = page.locator('.py-solution').first();
          await first.locator('summary').click();
          assert.equal(await first.evaluate(element => element.open), true);
          assert.equal(await first.locator('.py-solution-body').isVisible(), true);
          await page.locator('.py-solution').evaluateAll(elements => elements.forEach(element => { element.open = true; }));
          for (const panel of await page.locator('.py-code-source').all()) {
            assert.equal(await panel.getAttribute('tabindex'), '0');
            const scroll = await panel.evaluate(element => {
              const maximum = element.scrollWidth - element.clientWidth;
              element.scrollLeft = maximum;
              return { maximum, moved: element.scrollLeft, overflow: getComputedStyle(element).overflowX };
            });
            assert.ok(['auto', 'scroll'].includes(scroll.overflow));
            if (scroll.maximum > 1) assert.ok(scroll.moved > 0, 'text panel scrolls internally');
          }
          await noOverflow(page, width + ' ' + theme + ' ' + route + ' open');
        }
        combinations++;
      }
    }
  }
  assert.equal(combinations, 48);
  groups.push('48 PC/mobile/theme/page combinations, actual authored paragraphs/questions/answers and text-panel scrolling');

  await page.setViewportSize({ width: 1440, height: 1000 });
  await visit(page, lessonRoute(ids[0]));
  await page.locator('.lesson-nav a').first().click();
  await expectHash(page, '#/cs/ch01');
  await page.locator('.lesson-row').first().click();
  await expectHash(page, lessonRoute(ids[0]));
  for (let index = 1; index < ids.length; index++) {
    await page.locator('.lesson-nav a').last().click();
    await expectHash(page, lessonRoute(ids[index]));
    await page.locator('.lesson-nav a').first().click();
    await expectHash(page, lessonRoute(ids[index - 1]));
    await page.locator('.lesson-nav a').last().click();
    await expectHash(page, lessonRoute(ids[index]));
  }
  await page.locator('.lesson-nav a').last().click();
  await expectHash(page, '#/cs/ch01/review');
  assert.equal(await page.locator('a[href^="#/cs/ch02"]').count(), 0);
  await page.locator('.py-solution').first().locator('summary').click();
  const related = page.locator('.py-related a').first(), relatedHash = await related.getAttribute('href');
  assert.ok(ids.map(lessonRoute).includes(relatedHash));
  await related.click();
  await expectHash(page, relatedHash);
  for (const route of ['#/cs/ch02', '#/cs/ch02/lesson/cs-l006', '#/cs/ch01/lesson/cs-l006', '#/cs/ch01/lesson/python-l001', '#/cs/ch01/review/extra', '#/cs/ch01/extra']) {
    await visit(page, route);
    assert.match(await page.locator('#main h1').innerText(), /찾는 페이지/);
  }
  groups.push('bidirectional lesson/contents/review/related links and rejection of six invalid routes');

  await visit(page, '#/');
  const seeded = await page.evaluate(themeKey => {
    localStorage.clear();
    const records = {};
    const state = (id, at) => ({ completed: [id], scores: { [id]: { latest: 2, best: 5, date: '2026-10-01T10:00:00.000Z' } }, last: id, visitedAt: at });
    records['understand-math-grade1-v1'] = JSON.stringify(state(window.CURRICULUM.lessons[0].id, 1000), null, 1);
    for (const [index, course] of window.PYTHON_COURSES.entries()) records['academy-python-' + course.slug + '-v1'] = JSON.stringify(state(course.lessons[0].id, 2000 + index), null, 1);
    for (const [index, course] of window.ALGORITHMS_COURSES.entries()) records['academy-algorithms-' + course.slug + '-v1'] = JSON.stringify(state(course.lessons[0].id, 3000 + index), null, 1);
    records[themeKey] = 'ink';
    records['cs-test-unrelated'] = '보존할 원문 <&>';
    for (const [key, value] of Object.entries(records)) localStorage.setItem(key, value);
    return records;
  }, THEME_KEY);
  await visit(page, lessonRoute(ids[0]));
  const complete = page.locator('[data-cs-complete]');
  assert.equal(await complete.getAttribute('aria-pressed'), 'false');
  await complete.click();
  assert.equal(await complete.getAttribute('aria-pressed'), 'true');
  assert.match(await page.locator('[data-cs-read-status]').innerText(), /읽음 표시됨/);
  assert.match(await page.locator('[data-cs-lesson="cs-l001"]').innerText(), /^✓/);
  await page.reload();
  await complete.waitFor();
  assert.equal(await complete.getAttribute('aria-pressed'), 'true');
  await complete.click();
  assert.equal(await complete.getAttribute('aria-pressed'), 'false');
  assert.doesNotMatch(await page.locator('[data-cs-lesson="cs-l001"]').innerText(), /^✓/);
  assert.deepEqual(JSON.parse((await values(page))[CS_KEY]).completed, []);
  await complete.click();
  const marked = JSON.parse((await values(page))[CS_KEY]);
  assert.deepEqual(marked.completed, [ids[0]]);
  assert.deepEqual(marked.scores, {});
  assert.equal(marked.last, ids[0]);
  assert.ok(marked.visitedAt > 3000);
  const current = await values(page);
  for (const [key, value] of Object.entries(seeded)) assert.equal(current[key], value, key + ' raw record preserved');
  assert.deepEqual(Object.keys(current).sort(), [...Object.keys(seeded), CS_KEY].sort());
  groups.push('read/reload/cancel and one independent CS key preserving all 19 prior course records, scores and theme');

  await page.evaluate(() => {
    window.__csWrites = 0;
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (...args) { window.__csWrites++; return setItem.apply(this, args); };
  });
  const other = await context.newPage(); watch(other);
  await visit(other, '#/');
  await other.evaluate(key => {
    const record = JSON.parse(localStorage.getItem(key));
    record.completed = [];
    record.last = 'cs-l005';
    record.visitedAt = Date.now();
    localStorage.setItem(key, JSON.stringify(record));
  }, CS_KEY);
  await page.waitForFunction(() => document.querySelector('[data-cs-complete]').getAttribute('aria-pressed') === 'false');
  assert.equal(await page.evaluate(() => window.__csWrites), 0, 'storage refresh never rewrites the visit');
  await other.close();
  await visit(page, lessonRoute(ids[4]));
  await visit(page, '#/progress');
  assert.equal(await page.locator('.cs-progress').count(), 1);
  assert.equal(await page.locator('.algo-progress').count(), 9);
  assert.equal(await page.locator('.py-progress:not(.algo-progress):not(.cs-progress)').count(), 9);
  assert.equal(await page.locator('.learning-resume a').getAttribute('href'), lessonRoute(ids[4]));
  await visit(page, '#/');
  assert.equal(await page.locator('.catalog-footer a').getAttribute('href'), lessonRoute(ids[4]));
  await visit(page, '#/subjects/cs');
  assert.equal(await page.locator('.actions .btn').first().getAttribute('href'), lessonRoute(ids[4]));
  const after = await values(page);
  for (const [key, value] of Object.entries(seeded)) assert.equal(after[key], value, key + ' preserved after cross-tab and resume');
  groups.push('cross-tab refresh without writing visits, CS latest lesson and catalog/subject/progress resume');

  for (const [query, route, count, title] of [
    ['subject=cs', '/subjects/cs', 0, /CS/],
    ['page=cs-chapter', '/cs/ch01', 0, /CS · 챕터 1 목차/],
    ['lesson=cs-l001', '/cs/ch01/lesson/cs-l001', 5, /CS/],
    ['lesson=cs-l005', '/cs/ch01/lesson/cs-l005', 5, /CS/],
    ['page=cs-review', '/cs/ch01/review', 10, /CS · 챕터 1 복습/]
  ]) {
    await page.goto(BASE + '/preview.html?' + query);
    await page.waitForFunction(() => document.querySelector('#desktop').src.includes('index.html#'));
    assert.equal(await page.locator('#open-page').getAttribute('href'), 'index.html#' + route);
    assert.match(await page.locator('#title').innerText(), title);
    for (const id of ['desktop', 'mobile']) {
      const frame = await (await page.$('#' + id)).contentFrame();
      await frame.locator('#main h1').waitFor();
      assert.equal(new URL(frame.url()).hash, '#' + route);
      assert.equal(await frame.locator('.py-problem').count(), count);
    }
  }
  groups.push('five CS PC/mobile preview destinations and readable preview titles');

  const previewDir = process.env.ACADEMY_SCREENSHOT_DIR || path.join(root, 'previews');
  await fs.mkdir(previewDir, { recursive: true });
  const screenshots = [];
  for (const shot of [{ width: 1440, theme: 'light', name: 'pc', open: true }, { width: 390, theme: 'glass', name: 'mobile', open: false }]) {
    await page.setViewportSize({ width: shot.width, height: 1100 });
    await visit(page, lessonRoute(ids[4]));
    await page.reload();
    await page.locator('[data-cs-complete="cs-l005"]').waitFor();
    await page.evaluate(([key, value]) => { localStorage.setItem(key, value); window.AcademyTheme.refresh(); }, [THEME_KEY, shot.theme]);
    if (shot.open) await page.locator('.py-solution').first().locator('summary').click();
    else assert.equal(await page.locator('.py-solution[open]').count(), 0);
    await page.locator('#practice').evaluate(element => window.scrollTo({ top: window.scrollY + element.getBoundingClientRect().top - 16, behavior: 'instant' }));
    const file = path.join(previewDir, 'cs-ch01-' + shot.name + '.png');
    await page.screenshot({ path: file });
    screenshots.push(file);
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(requestErrors, []);
  console.log(JSON.stringify({ browser: browser.version(), groups, combinations, pageErrors: errors, requestErrors, screenshots }, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => { await browser?.close(); });
