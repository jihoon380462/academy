'use strict';

// Start a static server first. Public checks can set ACADEMY_BASE_URL,
// ACADEMY_TEST_PROXY and ACADEMY_SCREENSHOT_DIR without replacing stored evidence.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
let playwright;
try { playwright = require('playwright'); }
catch { playwright = require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'); }

const ROOT = path.join(__dirname, '..');
const BASE = (process.env.ACADEMY_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const BASELINE = process.env.ACADEMY_TRAINING_BASELINE || '2444a18';
const THEME = 'academy-theme-v1';
const KEY = 'academy-python-ch01-v1';
const IDS = ['python-l001', 'python-l002', 'python-l003', 'python-l004', 'python-l005'];
const STAGES = ['guided', 'completion', 'independent', 'recall', 'transfer'];
const LABELS = { guided: '따라 작성', completion: '일부 완성', independent: '혼자 작성', recall: '가리고 재현', transfer: '조건 바꾸기' };
const TRAINING = '.py-learning-guide,.py-spaced-review,.py-training-task,.py-practice-stage,.py-instructions,.py-answer-format,.py-hints,.py-self-check,.py-review-schedule,[data-practice-stage],.py-guided-ch01';
const lessonPath = id => '#/python/ch01/lesson/' + id;
const ROUTES = ['#/subjects/python', '#/python/ch01', ...IDS.map(lessonPath), '#/python/ch01/review'];
const plain = value => String(value).replace(/\*\*([^*\n]+)\*\*/g, '$1');
const emphasized = value => [...String(value).matchAll(/\*\*([^*\n]+)\*\*/g)].map(match => match[1]);
const json = value => JSON.parse(JSON.stringify(value));
const groups = [], errors = [], requestErrors = [];
let browser, combinations = 0, legacyRoutes = 0;

function oldFile(name) {
  return execFileSync('git', ['show', BASELINE + ':' + name], { cwd: ROOT, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
}
function world(content, ui) {
  const context = vm.createContext({ window: {} });
  vm.runInContext(content, context, { filename: 'python-content.js' });
  vm.runInContext(ui, context, { filename: 'python-ui.js' });
  return context;
}
function contexts(courses) {
  return courses.map((course, index) => ({ course, storageOK: index % 2 === 0,
    state: { completed: [course.lessons[0].id], scores: {}, last: course.lessons.at(-1).id, visitedAt: index + 1 } }));
}
function compareRenderers(older, newer, courses, indices) {
  let count = 0;
  const chapters = contexts(courses);
  for (const index of indices) {
    const ctx = { ...chapters[index], chapters };
    for (const method of ['chapter', 'review', 'progress']) {
      assert.equal(newer[method](ctx), older[method](ctx), courses[index].id + ' ' + method + ' HTML changed');
      count++;
    }
    for (const lesson of courses[index].lessons) {
      assert.equal(newer.lesson(lesson, ctx), older.lesson(lesson, ctx), lesson.id + ' HTML changed');
      count++;
    }
  }
  return count;
}
function watch(page) {
  page.on('pageerror', error => errors.push(error.message));
  page.on('requestfailed', request => {
    if (new URL(request.url()).origin === new URL(BASE).origin && request.failure()?.errorText !== 'net::ERR_ABORTED') requestErrors.push(request.url() + ': ' + request.failure()?.errorText);
  });
  page.on('response', response => {
    if (new URL(response.url()).origin === new URL(BASE).origin && response.status() >= 400) requestErrors.push(response.status() + ' ' + response.url());
  });
}
async function visit(page, route) {
  await page.goto(BASE + '/' + route);
  await page.locator('#main h1').waitFor();
  const id = route.match(/\/lesson\/([^/]+)$/)?.[1];
  if (id) await page.locator('[data-py-complete="' + id + '"]').waitFor();
  else if (route.endsWith('/review')) await page.locator('.py-review-problems').waitFor();
}
async function noOverflow(page, label) {
  const size = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  assert.ok(size.scroll <= size.width, label + ': ' + JSON.stringify(size));
}
async function rich(node, expected) {
  assert.equal(await node.textContent(), plain(expected));
  assert.deepEqual(await node.locator('strong.py-emphasis').allTextContents(), emphasized(expected));
}
async function richList(nodes, expected) {
  assert.deepEqual(await nodes.allTextContents(), expected.map(plain));
  assert.deepEqual(await nodes.locator('strong.py-emphasis').allTextContents(), expected.flatMap(emphasized));
}
async function codeBlock(container, block) {
  const figure = container.locator(':scope > figure.py-code');
  assert.equal(await figure.count(), block ? 1 : 0);
  if (!block) return;
  assert.equal(await figure.locator('.py-code-source code').textContent(), block.source);
  assert.equal(await figure.locator('pre strong').count(), 0, 'code never interprets authored emphasis');
  if (Object.hasOwn(block, 'input')) assert.equal(await figure.locator(':scope > .py-code-input:not(.py-code-file) code').textContent(), block.input);
  if (Object.hasOwn(block, 'output')) {
    if (block.output === '') assert.equal(await figure.locator(':scope > .py-code-output:not(.py-code-file) > p').textContent(), '출력 없음');
    else assert.equal(await figure.locator(':scope > .py-code-output:not(.py-code-file) code').textContent(), block.output);
  }
  if (block.error) assert.equal(await figure.locator('.py-code-error code').textContent(), block.error);
  if (block.caption) await rich(figure.locator('figcaption'), block.caption);
  for (const pre of await figure.locator('pre').all()) {
    assert.equal(await pre.getAttribute('tabindex'), '0');
    const state = await pre.evaluate(element => {
      const maximum = element.scrollWidth - element.clientWidth;
      element.scrollLeft = maximum;
      return { maximum, moved: element.scrollLeft, overflow: getComputedStyle(element).overflowX };
    });
    assert.ok(['auto', 'scroll'].includes(state.overflow));
    if (state.maximum > 1) assert.ok(state.moved > 0, 'long code scrolls inside its own panel');
  }
}
async function questions(page, data) {
  const rows = page.locator('.py-problem');
  assert.equal(await rows.count(), data.length);
  for (const [index, q] of data.entries()) {
    const row = rows.nth(index), answer = row.locator(':scope > details.py-solution'), hints = row.locator('details.py-hints');
    assert.equal(await row.getAttribute('data-practice-stage'), q.practiceStage);
    assert.ok((await row.locator('.py-practice-stage').textContent()).includes(LABELS[q.practiceStage]));
    await rich(row.locator(':scope > h3'), q.question);
    await richList(row.locator('.py-instructions > li'), q.instructions);
    assert.equal(await row.locator('.py-instructions').evaluate(element => element.tagName), 'OL');
    assert.equal(await row.locator('.py-instructions').isVisible(), true);
    await rich(row.locator('.py-answer-format > p'), q.answerFormat);
    assert.equal(await row.locator('.py-answer-format').isVisible(), true);
    await richList(row.locator('.py-self-check > ul > li'), q.selfCheck);
    assert.equal(await row.locator('.py-self-check').isVisible(), true);
    assert.equal(await answer.count(), 1);
    assert.equal(await answer.evaluate(element => element.open), false);
    assert.equal(await hints.count(), q.hints.length);
    assert.equal(await hints.locator(':scope > summary').count(), q.hints.length);
    assert.deepEqual(await hints.evaluateAll(elements => elements.map(element => element.open)), q.hints.map(() => false));
    await richList(hints.locator(':scope > p'), q.hints);
    assert.equal(await row.locator('.py-solution details.py-hints, .py-hints details.py-solution').count(), 0, 'hints and answers are independent controls');
    if (q.code) await codeBlock(row, { source: q.code, kind: q.codeKind || 'python', caption: q.codeLabel || '문제의 코드' });
    else await codeBlock(row, null);
    await hints.first().locator('summary').click();
    assert.equal(await hints.first().evaluate(element => element.open), true);
    assert.equal(await hints.first().locator(':scope > p').isVisible(), true);
    assert.equal(await answer.evaluate(element => element.open), false, 'opening a hint does not reveal the answer');
    assert.deepEqual(await hints.evaluateAll(elements => elements.map(element => element.open)), q.hints.map((_, hintIndex) => hintIndex === 0));
    await hints.first().locator('summary').click();
    await answer.locator('summary').click();
    assert.equal(await answer.evaluate(element => element.open), true);
    assert.equal(await answer.locator('.py-solution-body').isVisible(), true);
    assert.deepEqual(await hints.evaluateAll(elements => elements.map(element => element.open)), q.hints.map(() => false));
    await rich(answer.locator('.py-solution-body > p').first(), q.solution.answer);
    await rich(answer.locator('.py-solution-body > p').last(), q.explanation);
    await codeBlock(answer.locator('.py-solution-body'), q.solution.code);
    await noOverflow(page, 'question ' + (index + 1) + ' opened');
    await answer.locator('summary').click();
  }
}
async function values(page) {
  return page.evaluate(() => Object.fromEntries(Object.keys(localStorage).map(key => [key, localStorage.getItem(key)])));
}

(async () => {
  const [baselineBundle, baselineUI, currentBundle, currentUI] = await Promise.all([
    Promise.resolve(oldFile('python-content.js')), Promise.resolve(oldFile('python-ui.js')),
    fs.readFile(path.join(ROOT, 'python-content.js'), 'utf8'), fs.readFile(path.join(ROOT, 'python-ui.js'), 'utf8')
  ]);
  const older = world(baselineBundle, baselineUI), current = world(currentBundle, currentUI);
  const oldCourses = json(older.window.PYTHON_COURSES), courses = json(current.window.PYTHON_COURSES), course = courses[0];
  assert.equal(courses.length, 9);
  assert.equal(courses.reduce((sum, item) => sum + item.lessons.length, 0), 46);
  assert.deepEqual(courses.slice(1), oldCourses.slice(1), 'Python chapters 2–9 source objects remain identical to the backup');
  assert.deepEqual(course.lessons.map(item => item.id), IDS);
  assert.equal(course.review.length, 10);
  for (const lesson of course.lessons) {
    assert.deepEqual(lesson.examples.map(q => q.practiceStage), STAGES);
    assert.ok(lesson.learningGuide?.length);
    assert.ok(lesson.spacedReview?.length);
    assert.deepEqual(lesson, JSON.parse(await fs.readFile(path.join(ROOT, 'content/python/ch01', lesson.id + '.json'), 'utf8')));
  }
  assert.deepEqual(course.review, JSON.parse(await fs.readFile(path.join(ROOT, 'content/python/ch01/review.json'), 'utf8')));
  const allQuestions = [...course.lessons.flatMap(item => item.examples), ...course.review];
  assert.equal(allQuestions.length, 35);
  for (const q of allQuestions) {
    assert.ok(STAGES.includes(q.practiceStage));
    for (const field of ['instructions', 'hints', 'selfCheck']) assert.ok(Array.isArray(q[field]) && q[field].length && q[field].every(item => typeof item === 'string' && item.trim()), field + ' must be supplied');
    assert.ok(typeof q.answerFormat === 'string' && q.answerFormat.trim());
  }
  const fallbackChecks = compareRenderers(older.window.PythonCourseUI, current.window.PythonCourseUI, oldCourses, oldCourses.map((_, index) => index));
  const oldContexts = contexts(oldCourses), oldHome = { ...oldContexts[0], chapters: oldContexts };
  assert.equal(current.window.PythonCourseUI.home(oldHome), older.window.PythonCourseUI.home(oldHome), 'restoring the old bundle also restores the old home HTML');
  const unchangedChecks = compareRenderers(older.window.PythonCourseUI, current.window.PythonCourseUI, courses, courses.slice(1).map((_, index) => index + 1));
  const blockCases = [null, { source: '**<tag>** & "text"', kind: 'text', caption: '**literal caption**' },
    { source: 'print("**<tag>**")\n', kind: 'python', output: '**<output>**\n', input: '<&>\n', filename: 'main.py', files: { 'input.txt': '**<&>**\n' }, expectedFiles: { 'result.txt': '<&>\n' }, caption: '**<caption>** & "quoted"' },
    { source: 'raise ValueError("<&>")', kind: 'python', error: 'ValueError', output: '' },
    { source: '>>> print("**<tag>**")', kind: 'console', output: '**<tag>**' }];
  for (const block of blockCases) assert.equal(current.window.PythonCourseUI.codeBlock(block), older.window.PythonCourseUI.codeBlock(block), 'the shared codeBlock output remains identical');
  for (const [bundle, ui, registry, exported] of [
    ['algorithms-content.js', 'algorithms-ui.js', 'ALGORITHMS_COURSES', 'AlgorithmsCourseUI'],
    ['cs-content.js', 'cs-ui.js', 'CS_COURSES', 'CSCourseUI']
  ]) {
    const content = await fs.readFile(path.join(ROOT, bundle), 'utf8'), renderer = await fs.readFile(path.join(ROOT, ui), 'utf8');
    assert.equal(content, oldFile(bundle), bundle + ' was outside the requested chapter');
    assert.equal(renderer, oldFile(ui), ui + ' was outside the requested chapter');
    for (const target of [older, current]) { vm.runInContext(content, target); vm.runInContext(renderer, target); }
    const subjectCourses = json(current.window[registry]);
    compareRenderers(older.window[exported], current.window[exported], subjectCourses, subjectCourses.map((_, index) => index));
  }
  groups.push('backup ' + BASELINE + ': ch2–9 source unchanged, ' + unchangedChecks + ' legacy renderer outputs, ' + (fallbackChecks + 1) + ' restored-old-bundle outputs, and shared codeBlock/CS/algorithms unchanged');

  const options = { headless: true, args: ['--no-sandbox'] };
  if (process.env.CHROMIUM_PATH) options.executablePath = process.env.CHROMIUM_PATH;
  else if (require('node:fs').existsSync('/usr/bin/chromium')) options.executablePath = '/usr/bin/chromium';
  if (process.env.ACADEMY_TEST_PROXY) options.proxy = { server: process.env.ACADEMY_TEST_PROXY };
  browser = await playwright.chromium.launch(options);
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
  const page = await context.newPage(); watch(page);
  await visit(page, '#/');
  assert.deepEqual(await page.evaluate(() => window.PYTHON_COURSES), courses);
  assert.deepEqual(await page.locator('.catalog-totals b').allTextContents(), ['22', '4', '157']);
  const inventory = await page.evaluate(() => { const api = window.AcademyProgressTransfer; const saved = api.capture(); return { keys: Object.keys(saved.records), total: api.summary(saved).total }; });
  assert.equal(inventory.keys.length, 24);
  assert.equal(inventory.total, 157);
  groups.push('loaded bundle equals author JSON, unchanged catalog 157 lessons/24 course keys');

  const escaped = await page.evaluate(() => {
    const raw = '<img src=x onerror=window.__trainingInjected=true>', value = '**' + raw + '** & <script>window.__trainingInjected=true</script>';
    const course = structuredClone(window.PYTHON_COURSES[0]), lesson = course.lessons[0];
    for (const field of ['title', 'subtitle', 'intro', 'goal']) lesson[field] = value;
    lesson.learningGuide = [value];
    lesson.spacedReview = [{ when: value, task: value, lessonId: lesson.id, exampleNumber: 4 }];
    lesson.sections = [{ title: value, body: [value], code: { source: value, kind: 'python', output: value, caption: value } }];
    lesson.worked = { question: value, steps: [value], answer: value, code: { source: value, kind: 'python', output: value } };
    lesson.misconception = { question: value, answer: value }; lesson.keypoints = [value];
    lesson.examples = [{ practiceStage: 'guided', skill: value, question: value, instructions: [value], answerFormat: value, hints: [value], selfCheck: [value], code: value, codeKind: 'python', solution: { answer: value, code: { source: value, kind: 'python', output: value } }, explanation: value }];
    const state = { completed: [], scores: {}, last: null }, ctx = { course, state, storageOK: true, chapters: [{ course, state }] };
    const template = document.createElement('template'); template.innerHTML = window.PythonCourseUI.lesson(lesson, ctx);
    return { raw, value, bad: template.content.querySelectorAll('img,script,iframe,svg,[onerror],[onclick]').length,
      emphasis: [...template.content.querySelectorAll('strong.py-emphasis')].map(item => item.textContent),
      source: [...template.content.querySelectorAll('.py-code-source code')].map(item => item.textContent),
      output: [...template.content.querySelectorAll('.py-code-output code')].map(item => item.textContent),
      codeEmphasis: template.content.querySelectorAll('pre strong').length, injected: window.__trainingInjected === true };
  });
  assert.equal(escaped.bad, 0); assert.equal(escaped.injected, false); assert.equal(escaped.codeEmphasis, 0);
  assert.ok(escaped.emphasis.length >= 15);
  assert.ok(escaped.emphasis.every(item => item === escaped.raw));
  assert.ok(escaped.source.length >= 3 && escaped.source.every(item => item === escaped.value));
  assert.ok(escaped.output.length >= 2 && escaped.output.every(item => item === escaped.value));
  groups.push('chapter 1 prose supports only escaped emphasis; instructions/hints/self-check and code/output cannot inject HTML');

  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1100 });
    for (const theme of ['light', 'glass']) {
      await page.evaluate(([key, value]) => { localStorage.setItem(key, value); window.AcademyTheme.refresh(); }, [THEME, theme]);
      for (const route of ROUTES) {
        await visit(page, route);
        await noOverflow(page, width + ' ' + theme + ' ' + route);
        const lesson = course.lessons.find(item => route === lessonPath(item.id));
        const data = lesson ? lesson.examples : route.endsWith('/review') ? course.review : [];
        if (lesson) {
          await rich(page.locator('#main h1'), lesson.title);
          await rich(page.locator('.intro-text'), lesson.intro);
          await rich(page.locator('.py-goal > p'), lesson.goal);
          await richList(page.locator('.py-learning-guide > ol > li'), lesson.learningGuide);
          await richList(page.locator('#concept .concept-step > p'), lesson.sections.flatMap(item => item.body));
          for (const [index, section] of lesson.sections.entries()) await codeBlock(page.locator('#concept .concept-step').nth(index), section.code);
          await codeBlock(page.locator('#worked'), lesson.worked.code);
          await richList(page.locator('#worked > ol > li'), lesson.worked.steps);
          await richList(page.locator('.keypoints li'), lesson.keypoints);
          const retry = page.locator('.py-spaced-review > ol > li');
          assert.equal(await retry.count(), lesson.spacedReview.length);
          for (const [index, item] of lesson.spacedReview.entries()) {
            await rich(retry.nth(index).locator(':scope > strong'), item.when);
            await rich(retry.nth(index).locator(':scope > p'), item.task);
            assert.equal(await retry.nth(index).locator('a').getAttribute('href'), lessonPath(item.lessonId));
            if (item.lessonId === lesson.id) assert.equal(await retry.nth(index).locator('a').getAttribute('data-scroll'), 'practice-' + item.exampleNumber);
          }
        } else if (route === '#/subjects/python') {
          const cards = page.locator('.py-home-chapter');
          assert.equal(await cards.count(), 9);
          assert.deepEqual(await cards.evaluateAll(elements => elements.map(element => element.open)), Array(9).fill(false));
          await cards.first().locator('summary').click();
          assert.equal(await cards.first().evaluate(element => element.open), true);
          assert.equal(await cards.first().locator('a[href="#/python/ch01"]').count(), 1);
          await cards.first().locator('summary').click();
        } else assert.equal(await page.locator('.py-review-schedule').count(), 1);
        assert.equal(await page.locator('#main [data-quiz],#main .quiz-options,#main textarea,#main input').count(), 0);
        await questions(page, data);
        assert.equal(await page.locator('.py-solution[open], .py-hints[open]').count(), 0);
        combinations++;
      }
    }
  }
  assert.equal(combinations, 48);
  groups.push('48 combinations: 8 routes × 1440/390/320 × light/glass, all 35 staged tasks and independently collapsed/clicked hints and answers');

  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.evaluate(source => { window.__legacyPythonUI = new Function('window', source + '; return window.PythonCourseUI;')({}); }, baselineUI);
  for (const legacy of courses.slice(1)) {
    for (const route of ['#/python/' + legacy.slug, ...legacy.lessons.map(item => '#/python/' + legacy.slug + '/lesson/' + item.id), '#/python/' + legacy.slug + '/review']) {
      await visit(page, route);
      assert.equal(await page.locator(TRAINING).count(), 0, route + ': new training DOM must be absent');
      const matches = await page.evaluate(({ slug, route }) => {
        const records = window.AcademyProgressTransfer.capture().records;
        const chapters = window.PYTHON_COURSES.map(course => ({ course, state: records['academy-python-' + course.slug + '-v1'], storageOK: true }));
        const ctx = { ...chapters.find(item => item.course.slug === slug), chapters }, ui = window.__legacyPythonUI;
        const id = route.match(/\/lesson\/([^/]+)$/)?.[1];
        const html = id ? ui.lesson(ctx.course.lessons.find(item => item.id === id), ctx) : route.endsWith('/review') ? ui.review(ctx) : ui.chapter(ctx);
        const template = document.createElement('template'); template.innerHTML = html;
        return document.getElementById('app').innerHTML === template.innerHTML;
      }, { slug: legacy.slug, route });
      assert.equal(matches, true, route + ': actual legacy DOM differs from backup renderer');
      await noOverflow(page, route);
      legacyRoutes++;
    }
  }
  assert.equal(legacyRoutes, 57);
  groups.push('57 actual chapter 2–9 routes match backup-renderer DOM and contain no new training controls');

  for (const lesson of course.lessons) {
    await visit(page, lessonPath(lesson.id));
    for (const [index, item] of lesson.spacedReview.entries()) {
      const link = page.locator('.py-spaced-review > ol > li').nth(index).locator('a');
      const before = await values(page);
      await link.click();
      if (item.lessonId === lesson.id) {
        const target = page.locator('#practice-' + item.exampleNumber);
        // Both root scroll-padding (105px) and target scroll-margin (120px)
        // apply. Check that the requested question is visibly near the top.
        await page.waitForFunction(id => {
          const top = document.getElementById(id).getBoundingClientRect().top;
          return top >= 0 && top < innerHeight / 2;
        }, 'practice-' + item.exampleNumber);
        assert.equal(new URL(page.url()).hash, lessonPath(lesson.id));
        assert.deepEqual(await values(page), before, 'same-lesson retry scroll must not rewrite progress');
        assert.equal(await target.count(), 1);
      } else {
        await page.waitForFunction(hash => location.hash === hash, lessonPath(item.lessonId));
        await page.locator('[data-py-complete="' + item.lessonId + '"]').waitFor();
        await visit(page, lessonPath(lesson.id));
      }
    }
  }
  await visit(page, '#/python/ch01/review');
  for (const id of ['review-1', 'review-6']) {
    await page.locator('.py-review-schedule [data-scroll="' + id + '"]').click();
    await page.waitForFunction(target => {
      const top = document.getElementById(target).getBoundingClientRect().top;
      return top >= 0 && top < innerHeight / 2;
    }, id);
    assert.equal(new URL(page.url()).hash, '#/python/ch01/review');
  }
  groups.push('lesson spaced-review links and today/next-day review anchors navigate or scroll without extra storage writes');

  await visit(page, '#/');
  const originals = await page.evaluate(({ theme, key }) => {
    localStorage.clear();
    const snapshot = window.AcademyProgressTransfer.capture(), result = {};
    for (const [index, name] of Object.keys(snapshot.records).entries()) {
      const course = name === 'understand-math-grade1-v1' ? window.CURRICULUM : [...window.PYTHON_COURSES, ...window.ALGORITHMS_COURSES, ...window.CS_COURSES].find(item => name === 'academy-' + item.id + '-v1');
      const id = course.lessons[0].id;
      result[name] = JSON.stringify({ completed: name === key ? [] : [id], scores: { [id]: { latest: 2, best: 5, date: '2026-11-01T10:00:00.000Z' }, review: { latest: 7, best: 10, date: '2026-11-01T10:00:00.000Z' } }, last: id, visitedAt: index + 10 }, null, 2);
    }
    result[theme] = 'glass'; result['training-unrelated'] = 'keep <&> raw';
    for (const [name, value] of Object.entries(result)) localStorage.setItem(name, value);
    return result;
  }, { theme: THEME, key: KEY });
  await page.reload();
  for (const id of IDS) {
    await visit(page, lessonPath(id));
    const button = page.locator('[data-py-complete="' + id + '"]');
    await button.click();
    assert.ok(JSON.parse((await values(page))[KEY]).completed.includes(id));
    assert.match(await page.locator('[data-py-read-status]').innerText(), /읽음 표시됨/);
    await page.reload(); await button.waitFor();
    assert.ok(JSON.parse((await values(page))[KEY]).completed.includes(id));
    await button.click();
    assert.equal(JSON.parse((await values(page))[KEY]).completed.includes(id), false);
    const beforeHelp = await values(page);
    await page.locator('.py-hints').first().locator('summary').click();
    await page.locator('.py-solution').first().locator('summary').click();
    assert.deepEqual(await values(page), beforeHelp, 'viewing hints or solutions never grades or changes progress');
    const after = await values(page);
    for (const [name, raw] of Object.entries(originals)) if (name !== KEY) assert.equal(after[name], raw, name + ' raw data changed');
    assert.deepEqual(JSON.parse(after[KEY]).scores, JSON.parse(originals[KEY]).scores, 'valid historical scores remain hidden and unchanged');
    assert.deepEqual(Object.keys(after).sort(), Object.keys(originals).sort(), 'no training key or timer is introduced');
  }
  const transfer = await page.evaluate(() => {
    const api = window.AcademyProgressTransfer, snapshot = api.capture();
    return { total: api.summary(snapshot).total, records: snapshot.records, roundTrip: api.parse(api.encode(snapshot)).records };
  });
  assert.equal(transfer.total, 157); assert.equal(Object.keys(transfer.records).length, 24); assert.deepEqual(transfer.roundTrip, transfer.records);
  groups.push('five existing read toggles survive reload/cancel; old scores and every other chapter/theme raw value remain intact; no new storage key or score');

  const screenshotDir = process.env.ACADEMY_SCREENSHOT_DIR || path.join(ROOT, 'previews');
  await fs.mkdir(screenshotDir, { recursive: true });
  const screenshots = [];
  for (const shot of [{ width: 1440, theme: 'light', name: 'pc', opened: true }, { width: 390, theme: 'glass', name: 'mobile', opened: false }]) {
    await page.setViewportSize({ width: shot.width, height: 1100 });
    await page.evaluate(([key, value]) => { localStorage.setItem(key, value); window.AcademyTheme.refresh(); }, [THEME, shot.theme]);
    await visit(page, lessonPath(IDS[0]));
    // A repeated hash route can reuse its current DOM. Set each evidence
    // state explicitly so the previous screenshot cannot leave hints open.
    await page.locator('.py-hints,.py-solution').evaluateAll(elements => elements.forEach(element => { element.open = false; }));
    const target = page.locator('#practice-1');
    if (shot.opened) await target.locator('.py-hints').first().locator('summary').click();
    assert.equal(await page.locator('.py-hints[open]').count(), shot.opened ? 1 : 0);
    assert.equal(await page.locator('.py-solution[open]').count(), 0);
    await page.waitForFunction(() => {
      const toast = document.getElementById('toast');
      return !toast || (!toast.classList.contains('visible') && Number(getComputedStyle(toast).opacity) === 0);
    });
    await target.evaluate(element => window.scrollTo({ top: window.scrollY + element.getBoundingClientRect().top - 16, behavior: 'instant' }));
    const file = path.join(screenshotDir, 'python-ch01-training-' + shot.name + '.png');
    await page.screenshot({ path: file }); screenshots.push(file);
  }
  assert.deepEqual(errors, []); assert.deepEqual(requestErrors, []);
  console.log(JSON.stringify({ status: 'passed', browser: browser.version(), baseline: BASELINE, groups, combinations, questionChecks: 35 * 6, legacyRoutes, pageErrors: errors, requestErrors, screenshots }, null, 2));
})().catch(error => {
  console.error(JSON.stringify({ groups, combinations, legacyRoutes, pageErrors: errors, requestErrors }, null, 2));
  console.error(error); process.exitCode = 1;
}).finally(async () => { await browser?.close(); });
