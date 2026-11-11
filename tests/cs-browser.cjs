'use strict';

// Start the static server first: python3 -m http.server 8000
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
let playwright;
try { playwright = require('playwright'); }
catch { playwright = require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'); }

const BASE = (process.env.ACADEMY_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const THEME_KEY = 'academy-theme-v1';
const chapters = [
  { slug: 'ch01', ids: ['cs-l001', 'cs-l002', 'cs-l003', 'cs-l004', 'cs-l005'], titles: ['입력·처리·출력·저장', '하드웨어·운영체제·응용 프로그램', '추상화와 인터페이스', '프로그램과 데이터', '상태와 시간의 흐름'] },
  { slug: 'ch02', ids: ['cs-l006', 'cs-l007', 'cs-l008', 'cs-l009', 'cs-l010'], titles: ['비트·바이트·진법', '정수의 범위와 부호', '실수와 근삿값', '문자·인코딩·유니코드', '구조화·직렬화·압축'] },
  { slug: 'ch03', ids: ['cs-l011', 'cs-l012', 'cs-l013', 'cs-l014', 'cs-l015'], titles: ['CPU·레지스터·메모리', '명령어와 논리 연산', '캐시와 메모리 계층', '컴파일·인터프리트·가상머신', '빌드·링크·로드'] },
  { slug: 'ch04', ids: ['cs-l016', 'cs-l017', 'cs-l018', 'cs-l019', 'cs-l020'], titles: ['프로세스와 스레드의 역할', '스택·힙·객체 수명', '동시성과 병렬성', '계산량·메모리량·입출력 비용', '한계와 병목'] },
  { slug: 'ch05', ids: ['cs-l021', 'cs-l022', 'cs-l023', 'cs-l024', 'cs-l025'], titles: ['패킷과 네트워크 계층', 'IP 주소·포트·라우팅', 'DNS 이름 해석', 'TCP·UDP·전송의 신뢰성', '지연·대역폭·TLS'] }
];
const ids = chapters.flatMap(chapter => chapter.ids);
const csKey = chapter => 'academy-cs-' + chapter.slug + '-v1';
const lessonRoute = id => '#/cs/' + chapters.find(chapter => chapter.ids.includes(id)).slug + '/lesson/' + id;
const routes = ['#/subjects/cs', ...chapters.flatMap(chapter => ['#/cs/' + chapter.slug, ...chapter.ids.map(lessonRoute), '#/cs/' + chapter.slug + '/review'])];
const plain = value => String(value).replace(/\*\*([^*]+)\*\*/g, '$1');
const emphasis = value => [...String(value).matchAll(/\*\*([^*]+)\*\*/g)].map(match => match[1]);
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
  if (/^#\/cs\/ch0[1-5]$/.test(hash)) await page.locator('#main.cs-chapter').waitFor();
  if (/^#\/cs\/ch0[1-5]\/review$/.test(hash)) await page.locator('#main.cs-review').waitFor();
}
async function expectHash(page, hash) {
  await page.waitForFunction(expected => location.hash === expected, hash);
  await page.locator('#main h1').waitFor();
  const lesson = ids.find(id => hash === lessonRoute(id));
  if (lesson) await page.locator('[data-cs-complete="' + lesson + '"]').waitFor();
  else if (hash.endsWith('/review')) {
    const chapterNumber = Number(hash.split('/')[2].slice(2));
    await page.waitForFunction(number => document.querySelector('#main.cs-review h1')?.textContent.includes('챕터 ' + number + ' 복습'), chapterNumber);
  } else if (hash.startsWith('#/cs/')) {
    const chapter = chapters.find(item => hash === '#/cs/' + item.slug);
    await page.waitForFunction(title => document.querySelector('#main.cs-chapter h1')?.textContent === title, plain(chapter.metadata.title));
  } else if (hash === '#/subjects/cs') await page.locator('#main.cs-home').waitFor();
}
async function noOverflow(page, label) {
  const sizes = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  assert.ok(sizes.scroll <= sizes.client, label + ': ' + JSON.stringify(sizes));
}
async function values(page) {
  return page.evaluate(() => Object.fromEntries(Object.keys(localStorage).map(key => [key, localStorage.getItem(key)])));
}
async function checkRichText(locator, expected) {
  assert.equal(await locator.textContent(), plain(expected));
  assert.deepEqual(await locator.locator('strong.cs-emphasis').allTextContents(), emphasis(expected));
}
async function checkRichList(locator, expected) {
  assert.deepEqual(await locator.allTextContents(), expected.map(plain));
  assert.deepEqual(await locator.locator('strong.cs-emphasis').allTextContents(), expected.flatMap(emphasis));
}
async function checkTask(container, task) {
  const box = container.locator(':scope > .cs-task');
  assert.equal(await box.count(), task.instructions || task.answerFormat ? 1 : 0);
  if (task.instructions) {
    await checkRichList(box.locator('.cs-instructions > li'), task.instructions);
    assert.equal(await box.locator('.cs-instructions').evaluate(element => element.tagName), 'OL');
    assert.equal(await box.locator('.cs-instructions').isVisible(), true);
  }
  if (task.answerFormat) {
    assert.equal(await box.locator('.cs-answer-format > strong').textContent(), '답 적는 형식');
    await checkRichText(box.locator('.cs-answer-format > p'), task.answerFormat);
    assert.equal(await box.locator('.cs-answer-format').isVisible(), true);
  }
}
async function checkVisual(container, visual) {
  const figure = container.locator(':scope > figure.cs-visual');
  assert.equal(await figure.count(), visual ? 1 : 0);
  if (!visual) return;
  assert.equal(await figure.evaluate(element => element.tagName), 'FIGURE');
  assert.ok((await figure.getAttribute('class')).split(/\s+/).includes('cs-visual-' + visual.type));
  await checkRichText(figure.locator('.cs-visual-caption > strong'), visual.title);
  await checkRichText(figure.locator('.cs-visual-caption > span'), visual.caption);
  assert.equal(await figure.locator('figcaption').isVisible(), true);
  let panel;
  if (visual.type === 'table') {
    panel = figure.locator('.cs-table-wrap');
    assert.equal(await panel.locator('table').count(), 1);
    await checkRichList(panel.locator('thead th'), visual.headers);
    assert.equal(await panel.locator('tbody tr').count(), visual.rows.length);
    for (const [index, row] of visual.rows.entries()) {
      const renderedRow = panel.locator('tbody tr').nth(index);
      await checkRichList(renderedRow.locator('th, td'), row);
      assert.equal(await renderedRow.locator('th[scope="row"]').count(), 1);
    }
  } else {
    if (visual.type === 'cells') panel = figure.locator('.cs-visual-body');
    const list = figure.locator(visual.type === 'cells' ? 'ol.cs-cells' : 'ol.cs-flow');
    const selector = visual.type === 'cells' ? '.cs-cell' : '.cs-flow-step';
    const prefix = visual.type === 'cells' ? '.cs-cell-' : '.cs-flow-';
    assert.equal(await list.locator(':scope > ' + selector).count(), visual.items.length);
    for (const [index, item] of visual.items.entries()) {
      const entry = list.locator(':scope > ' + selector).nth(index);
      await checkRichText(entry.locator(prefix + 'label'), item.label);
      await checkRichText(entry.locator(prefix + 'value'), item.value);
      if (item.note) await checkRichText(entry.locator(prefix + 'note'), item.note);
      else assert.equal(await entry.locator(prefix + 'note').count(), 0);
    }
    if (visual.type === 'flow') {
      assert.equal(await list.evaluate(element => getComputedStyle(element).flexDirection),
        (await container.page().viewportSize()).width <= 700 ? 'column' : 'row');
      assert.equal(await list.locator('.cs-flow-arrow[aria-hidden="true"]').count(), visual.items.length - 1);
      return;
    }
  }
  assert.equal(await panel.getAttribute('tabindex'), '0');
  const scroll = await panel.evaluate(element => {
    const maximum = element.scrollWidth - element.clientWidth;
    element.scrollLeft = maximum;
    const moved = element.scrollLeft;
    element.scrollLeft = 0;
    return { maximum, moved, overflow: getComputedStyle(element).overflowX };
  });
  assert.ok(['auto', 'scroll'].includes(scroll.overflow), 'visual supports keyboard-accessible internal scrolling');
  const hint = figure.locator(':scope > .cs-scroll-hint');
  assert.equal(await hint.count(), 1);
  assert.match(await hint.textContent(), /옆으로 밀어/);
  if (scroll.maximum > 1) {
    assert.ok(scroll.moved > 0, 'wide visual scrolls inside its panel');
    assert.equal(await hint.isVisible(), true, 'overflowing visual explains how to see its remaining cells or columns');
  }
}
async function checkCode(container, block) {
  const figure = container.locator(':scope > figure.py-code');
  assert.equal(await figure.count(), block ? 1 : 0);
  if (!block) return;
  assert.equal(await figure.locator('.py-code-source code').textContent(), block.source);
  if (block.caption) await checkRichText(figure.locator('figcaption'), block.caption);
  else assert.equal(await figure.locator('figcaption').count(), 0);
}
async function checkQuestions(page, questions) {
  await checkRichList(page.locator('.py-problem > h3'), questions.map(question => question.question));
  await checkRichList(page.locator('.py-problem-meta > span:last-child'), questions.map(question => question.skill));
  await checkRichList(page.locator('.py-solution-body > p:first-child'), questions.map(question => question.solution.answer));
  await checkRichList(page.locator('.py-solution-body > p:last-of-type'), questions.map(question => question.explanation));
  for (const [index, question] of questions.entries()) {
    const problem = page.locator('.py-problem').nth(index);
    assert.ok(Array.isArray(question.instructions) && question.instructions.length > 0, 'every CS question has explicit steps');
    assert.ok(typeof question.answerFormat === 'string' && question.answerFormat.trim(), 'every CS question gives an answer format');
    await checkTask(problem, question);
    await checkVisual(problem, question.visual);
    if (question.code) assert.equal(await problem.locator(':scope > .py-code .py-code-source code').textContent(), question.code);
    await checkCode(problem.locator('.py-solution-body'), question.solution.code);
  }
}

(async () => {
  const root = path.resolve(__dirname, '..');
  for (const chapter of chapters) {
    const directory = path.join(root, 'content/cs', chapter.slug);
    chapter.metadata = JSON.parse(await fs.readFile(path.join(directory, 'course.json'), 'utf8'));
    chapter.lessons = await Promise.all(chapter.metadata.lessonFiles.map(name => fs.readFile(path.join(directory, name), 'utf8').then(JSON.parse)));
    chapter.review = JSON.parse(await fs.readFile(path.join(directory, 'review.json'), 'utf8'));
    assert.deepEqual(chapter.lessons.map(lesson => lesson.id), chapter.ids);
    assert.deepEqual(chapter.lessons.map(lesson => lesson.title), chapter.titles);
    chapter.expected = { ...chapter.metadata, lessons: chapter.lessons, review: chapter.review };
    delete chapter.expected.lessonFiles;
  }
  const lessons = chapters.flatMap(chapter => chapter.lessons);
  const chapterVisuals = chapter => chapter.lessons.flatMap(lesson => [...lesson.sections.map(section => section.visual), lesson.worked.visual, ...lesson.examples.map(question => question.visual)]).concat(chapter.review.map(question => question.visual)).filter(Boolean);
  const sourceVisuals = chapters.flatMap(chapterVisuals);
  assert.deepEqual([...new Set(sourceVisuals.map(visual => visual.type))].sort(), ['cells', 'flow', 'table']);
  for (const chapter of chapters) {
    for (const lesson of chapter.lessons) {
      assert.ok(lesson.sections.some(section => section.visual) || lesson.worked.visual, lesson.id + ' explains concepts with an authored visual');
      assert.ok(lesson.sections.some(section => section.body.some(paragraph => emphasis(paragraph).length > 0)), lesson.id + ' emphasizes key ideas in its body');
    }
  }
  assert.equal(routes.length, 36, 'one shared subject home and seven routes per chapter');
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
  assert.deepEqual(await page.locator('.catalog-totals b').allTextContents(), ['22', '4', '157']);
  await page.locator('.subject-card[href="#/subjects/cs"]').click();
  await expectHash(page, '#/subjects/cs');
  assert.deepEqual(await page.evaluate(() => window.CS_COURSES), chapters.map(chapter => chapter.expected));
  assert.equal(await page.evaluate(() => window.CS_CH01 === window.CS_COURSES[0]), true);
  const cards = page.locator('.py-home-chapter');
  assert.equal(await cards.count(), 5);
  for (const [index, chapter] of chapters.entries()) {
    const card = cards.nth(index);
    assert.equal(await card.evaluate(element => element.open), false);
    await card.locator('summary').click();
    assert.equal(await card.evaluate(element => element.open), true);
    assert.deepEqual(await card.locator('.lesson-row').evaluateAll(links => links.map(link => link.getAttribute('href'))), chapter.ids.map(lessonRoute));
    await card.locator('summary').click();
    assert.equal(await card.evaluate(element => element.open), false);
  }
  assert.match(await page.locator('.py-course-note').innerText(), /준비 중/);
  assert.equal(await page.locator('a[href^="#/cs/ch06"]').count(), 0);
  groups.push('catalog 22/4/157, exact five-chapter source bundle and collapsed/open/closed contents');

  const escaping = await page.evaluate(() => {
    const raw = '<img src=x onerror=window.__csInjected=true>';
    const payload = '**' + raw + '** & <script>window.__csInjected=true</script>';
    const course = structuredClone(window.CS_COURSES[1]);
    const lesson = course.lessons[0];
    for (const field of ['title', 'subtitle', 'goal', 'intro']) lesson[field] = payload;
    lesson.sections = [{ title: payload, body: [payload], code: { kind: 'text', source: payload, caption: payload }, visual: { type: 'cells', title: payload, caption: payload, items: [{ label: payload, value: payload, note: payload }] } }];
    lesson.worked = { question: payload, steps: [payload], answer: payload, instructions: [payload], answerFormat: payload, visual: { type: 'flow', title: payload, caption: payload, items: [{ label: payload, value: payload, note: payload }] } };
    lesson.misconception = { question: payload, answer: payload };
    lesson.keypoints = [payload];
    lesson.examples = [{ skill: payload, question: payload, instructions: [payload], answerFormat: payload, solution: { answer: payload }, explanation: payload, visual: { type: 'table', title: payload, caption: payload, headers: [payload], rows: [[payload]] } }];
    const state = { completed: [], scores: {}, last: null };
    const context = { course, state, chapters: [{ course, state }] };
    const template = document.createElement('template');
    template.innerHTML = window.CSCourseUI.lesson(lesson, context);
    return {
      raw, payload,
      dangerous: template.content.querySelectorAll('img,script,iframe,svg,[onerror],[onclick]').length,
      emphasized: [...template.content.querySelectorAll('strong.cs-emphasis')].map(element => element.textContent),
      codeText: template.content.querySelector('.py-code-source code').textContent,
      codeStrong: template.content.querySelectorAll('.py-code-source strong').length,
      injected: window.__csInjected === true
    };
  });
  assert.equal(escaping.dangerous, 0, 'authored text cannot introduce HTML elements or event handlers');
  assert.equal(escaping.injected, false);
  assert.ok(escaping.emphasized.length >= 20, 'emphasis covers prose, task instructions and all visual types');
  assert.ok(escaping.emphasized.every(value => value === escaping.raw), 'only the literal marked text becomes semantic strong');
  assert.equal(escaping.codeText, escaping.payload, 'text-code source preserves literal emphasis markers');
  assert.equal(escaping.codeStrong, 0);
  groups.push('inline emphasis escapes HTML/event handlers in prose/tasks/cells/flow/tables and preserves code source verbatim');

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
        const chapter = chapters.find(item => route.startsWith('#/cs/' + item.slug));
        const questions = lesson ? lesson.examples : route.endsWith('/review') ? chapter.review : [];
        assert.equal(await page.locator('.py-problem').count(), questions.length);
        assert.equal(await page.locator('#main [data-quiz], #main .quiz-options, #main textarea, #main input').count(), 0);
        if (lesson) {
          await checkRichText(page.locator('#main h1'), lesson.title);
          await checkRichText(page.locator('.lesson-heading .subtitle'), lesson.subtitle);
          await checkRichText(page.locator('.intro-text'), lesson.intro);
          await checkRichText(page.locator('.py-goal > p'), lesson.goal);
          await checkRichList(page.locator('#concept .concept-step > p'), lesson.sections.flatMap(section => section.body));
          for (const [index, section] of lesson.sections.entries()) {
            const sectionNode = page.locator('#concept .concept-step').nth(index);
            assert.equal(await sectionNode.locator('h2').evaluate(element => { const copy = element.cloneNode(true); copy.querySelector('span').remove(); return copy.textContent; }), plain(section.title));
            assert.deepEqual(await sectionNode.locator('h2 strong.cs-emphasis').allTextContents(), emphasis(section.title));
            await checkCode(sectionNode, section.code);
            await checkVisual(sectionNode, section.visual);
          }
          await checkRichText(page.locator('#worked > .question'), lesson.worked.question);
          await checkCode(page.locator('#worked'), lesson.worked.code);
          await checkRichList(page.locator('#worked > ol > li'), lesson.worked.steps);
          await checkRichText(page.locator('#worked > .answer'), lesson.worked.answer);
          await checkTask(page.locator('#worked'), lesson.worked);
          await checkVisual(page.locator('#worked'), lesson.worked.visual);
          await checkRichList(page.locator('.keypoints li'), lesson.keypoints);
          await checkRichText(page.locator('.misconception > summary'), lesson.misconception.question);
          await checkRichText(page.locator('.misconception > p'), lesson.misconception.answer);
          assert.equal(await page.locator('[data-cs-complete]').count(), 1);
        } else if (route.endsWith('/review')) assert.match(await page.locator('#main h1').innerText(), /복습 10문제/);
        assert.doesNotMatch(await page.locator('#main').evaluate(element => { const copy = element.cloneNode(true); copy.querySelectorAll('pre').forEach(panel => panel.remove()); return copy.textContent; }), /\*\*/, 'prose emphasis renders as strong text while code source stays literal');
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
  assert.equal(combinations, 216);
  groups.push('216 combinations: 36 routes × 1440/390/320px × light/glass; exact text, body emphasis and visuals in all 25 lessons, instructions/answer formats in all 175 questions, and internal scrolling');

  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const chapter of chapters) {
    await visit(page, lessonRoute(chapter.ids[0]));
    await page.locator('.lesson-nav a').first().click();
    await expectHash(page, '#/cs/' + chapter.slug);
    await page.locator('.lesson-row').first().click();
    await expectHash(page, lessonRoute(chapter.ids[0]));
    for (let index = 1; index < chapter.ids.length; index++) {
      await page.locator('.lesson-nav a').last().click();
      await expectHash(page, lessonRoute(chapter.ids[index]));
      await page.locator('.lesson-nav a').first().click();
      await expectHash(page, lessonRoute(chapter.ids[index - 1]));
      await page.locator('.lesson-nav a').last().click();
      await expectHash(page, lessonRoute(chapter.ids[index]));
    }
    await page.locator('.lesson-nav a').last().click();
    await expectHash(page, '#/cs/' + chapter.slug + '/review');
    const nextChapter = chapters[chapters.indexOf(chapter) + 1];
    if (nextChapter) {
      const next = page.locator('.actions a[href="#/cs/' + nextChapter.slug + '"]');
      assert.equal(await next.count(), 1);
      await next.click();
      await expectHash(page, '#/cs/' + nextChapter.slug);
      await visit(page, '#/cs/' + chapter.slug + '/review');
    } else assert.equal(await page.locator('a[href^="#/cs/ch06"]').count(), 0);
    await page.locator('.py-solution').first().locator('summary').click();
    const related = page.locator('.py-related a').first(), relatedHash = await related.getAttribute('href');
    assert.ok(ids.map(lessonRoute).includes(relatedHash));
    await related.click();
    await expectHash(page, relatedHash);
  }
  const invalidRoutes = [
    '#/cs/ch06', '#/cs/ch06/lesson/cs-l026', '#/cs/ch05/lesson/cs-l026',
    ...chapters.map((chapter, index) => '#/cs/' + chapter.slug + '/lesson/' + chapters[(index + 1) % chapters.length].ids[0]),
    '#/cs/ch05/lesson/python-l001', '#/cs/ch05/review/extra', '#/cs/ch05/extra'
  ];
  for (const route of invalidRoutes) {
    await visit(page, route);
    assert.match(await page.locator('#main h1').innerText(), /찾는 페이지/);
  }
  groups.push('five chapters bidirectional/contents/review/related routes, four chapter continuations and ' + invalidRoutes.length + ' invalid route rejections');

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
  for (const chapter of chapters) {
    const before = await values(page);
    await visit(page, lessonRoute(chapter.ids[0]));
    const complete = page.locator('[data-cs-complete]');
    assert.equal(await complete.getAttribute('aria-pressed'), 'false');
    await complete.click();
    assert.equal(await complete.getAttribute('aria-pressed'), 'true');
    assert.match(await page.locator('[data-cs-read-status]').innerText(), /읽음 표시됨/);
    assert.match(await page.locator('[data-cs-lesson="' + chapter.ids[0] + '"]').innerText(), /^✓/);
    await page.reload();
    await complete.waitFor();
    assert.equal(await complete.getAttribute('aria-pressed'), 'true');
    await complete.click();
    assert.equal(await complete.getAttribute('aria-pressed'), 'false');
    assert.doesNotMatch(await page.locator('[data-cs-lesson="' + chapter.ids[0] + '"]').innerText(), /^✓/);
    assert.deepEqual(JSON.parse((await values(page))[csKey(chapter)]).completed, []);
    await complete.click();
    const current = await values(page), marked = JSON.parse(current[csKey(chapter)]);
    assert.deepEqual(marked.completed, [chapter.ids[0]]);
    assert.deepEqual(marked.scores, {});
    assert.equal(marked.last, chapter.ids[0]);
    assert.ok(marked.visitedAt > 3000);
    for (const [key, value] of Object.entries(before)) if (key !== csKey(chapter)) assert.equal(current[key], value, key + ' raw record preserved while visiting ' + chapter.slug);
    for (const [key, value] of Object.entries(seeded)) assert.equal(current[key], value, key + ' original raw record preserved');
  }
  const current = await values(page);
  assert.deepEqual(Object.keys(current).sort(), [...Object.keys(seeded), ...chapters.map(csKey)].sort());
  const exports = await page.evaluate(() => {
    const api = window.AcademyProgressTransfer, snapshot = api.capture();
    return { total: api.summary(snapshot).total, snapshot, parsed: api.parse(api.encode(snapshot)), fileParsed: api.parse(JSON.stringify(snapshot)) };
  });
  assert.equal(exports.total, 157);
  assert.equal(Object.keys(exports.snapshot.records).length, 24);
  assert.deepEqual(exports.parsed.records, exports.snapshot.records);
  assert.deepEqual(exports.fileParsed.records, exports.snapshot.records);
  for (const chapter of chapters) assert.deepEqual(exports.parsed.records[csKey(chapter)].completed, [chapter.ids[0]]);
  groups.push('all five CS keys read/reload/cancel independently, file/copy-code export preserves 24 courses, and every earlier raw record/score/theme stays intact');

  const activeChapter = chapters.at(-1);
  await page.evaluate(() => {
    window.__csWrites = 0;
    window.__csStorageEvents = [];
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (...args) { window.__csWrites++; return setItem.apply(this, args); };
    window.addEventListener('storage', event => { if (event.key?.startsWith('academy-cs-')) window.__csStorageEvents.push(event.key); });
  });
  const other = await context.newPage(); watch(other);
  await visit(other, '#/');
  const activeRaw = (await values(page))[csKey(activeChapter)];
  for (const chapter of chapters) {
    await other.evaluate(({ key, id }) => {
      const record = JSON.parse(localStorage.getItem(key));
      record.completed = [];
      record.last = id;
      record.visitedAt = Date.now() - 10000;
      localStorage.setItem(key, JSON.stringify(record));
    }, { key: csKey(chapter), id: chapter.ids.at(-1) });
    await page.waitForFunction(key => window.__csStorageEvents.includes(key), csKey(chapter));
    assert.equal(await page.locator('[data-cs-complete]').getAttribute('aria-pressed'), chapter === activeChapter ? 'false' : 'true');
    if (chapter !== activeChapter) assert.equal((await values(page))[csKey(activeChapter)], activeRaw, 'another chapter storage event preserves active chapter raw state');
  }
  assert.equal(await page.evaluate(() => window.__csWrites), 0, 'storage refresh never rewrites the visit');
  await other.close();
  await visit(page, lessonRoute(activeChapter.ids[4]));
  await visit(page, '#/progress');
  assert.equal(await page.locator('.cs-progress').count(), 5);
  assert.equal(await page.locator('.algo-progress').count(), 9);
  assert.equal(await page.locator('.py-progress:not(.algo-progress):not(.cs-progress)').count(), 9);
  assert.equal(await page.locator('.learning-resume a').getAttribute('href'), lessonRoute(activeChapter.ids[4]));
  await noOverflow(page, 'progress with five CS chapters');
  await visit(page, '#/');
  assert.equal(await page.locator('.catalog-footer a').getAttribute('href'), lessonRoute(activeChapter.ids[4]));
  await visit(page, '#/subjects/cs');
  assert.equal(await page.locator('.actions .btn').first().getAttribute('href'), lessonRoute(activeChapter.ids[4]));
  const after = await values(page);
  for (const [key, value] of Object.entries(seeded)) assert.equal(after[key], value, key + ' preserved after cross-tab and resume');
  groups.push('all five chapter keys refresh across tabs without visit writes and chapter 5 latest lesson resumes on catalog/subject/progress');

  const previewCases = [
    ['subject=cs', '/subjects/cs', 0, /CS/],
    ...chapters.flatMap((chapter, index) => [
      ['page=cs-chapter&chapter=' + chapter.slug, '/cs/' + chapter.slug, 0, new RegExp('CS · 챕터 ' + (index + 1) + ' 목차')],
      ['lesson=' + chapter.ids[0], lessonRoute(chapter.ids[0]).slice(1), 5, /CS/],
      ['lesson=' + chapter.ids[4], lessonRoute(chapter.ids[4]).slice(1), 5, /CS/],
      ['page=cs-review&chapter=' + chapter.slug, '/cs/' + chapter.slug + '/review', 10, new RegExp('CS · 챕터 ' + (index + 1) + ' 복습')]
    ])
  ];
  for (const [query, route, count, title] of previewCases) {
    await page.goto(BASE + '/preview.html?' + query);
    await page.waitForFunction(() => document.querySelector('#desktop').src.includes('index.html#'));
    assert.equal(await page.locator('#open-page').getAttribute('href'), 'index.html#' + route);
    assert.match(await page.locator('#title').innerText(), title);
    for (const id of ['desktop', 'mobile']) {
      const frame = await (await page.$('#' + id)).contentFrame();
      await frame.locator('#main h1').waitFor();
      assert.equal(new URL(frame.url()).hash, '#' + route);
      assert.equal(await frame.locator('.py-problem').count(), count);
      assert.ok((await frame.evaluate(() => document.documentElement.scrollWidth)) <= (await frame.evaluate(() => document.documentElement.clientWidth)));
    }
  }
  groups.push('21 CS PC/mobile preview destinations for five chapters, correct titles and no frame document overflow');

  const previewDir = process.env.ACADEMY_SCREENSHOT_DIR || path.join(root, 'previews');
  // Default to new evidence only; an explicit chapter selection can refresh older captures.
  const screenshotSlugs = (process.env.ACADEMY_SCREENSHOT_CHAPTERS || process.env.ACADEMY_SCREENSHOT_CHAPTER || 'ch03,ch04,ch05').split(',').map(value => value.trim());
  assert.ok(screenshotSlugs.length && screenshotSlugs.every(slug => chapters.some(chapter => chapter.slug === slug)), 'screenshot chapters must be implemented ch01 through ch05');
  await fs.mkdir(previewDir, { recursive: true });
  const screenshots = [];
  for (const screenshotSlug of screenshotSlugs) {
    const screenshotChapter = chapters.find(chapter => chapter.slug === screenshotSlug);
    const screenshotExample = screenshotSlug === 'ch01' ? 0 : 1;
    for (const shot of [{ width: 1440, theme: 'light', name: 'pc', open: true }, { width: 390, theme: 'glass', name: 'mobile', open: false }]) {
      await page.setViewportSize({ width: shot.width, height: 1100 });
      await visit(page, lessonRoute(screenshotChapter.ids[0]));
      await page.reload();
      await page.locator('[data-cs-complete="' + screenshotChapter.ids[0] + '"]').waitFor();
      await page.evaluate(([key, value]) => { localStorage.setItem(key, value); window.AcademyTheme.refresh(); }, [THEME_KEY, shot.theme]);
      if (shot.open) await page.locator('.py-solution').nth(screenshotExample).locator('summary').click();
      else assert.equal(await page.locator('.py-solution[open]').count(), 0);
      const target = shot.open ? page.locator('#practice-' + (screenshotExample + 1)) : screenshotSlug === 'ch01' ? page.locator('#concept .concept-step').first().locator(':scope > p').last() : page.locator('#concept figure.cs-visual').first();
      await target.evaluate(element => window.scrollTo({ top: window.scrollY + element.getBoundingClientRect().top - 16, behavior: 'instant' }));
      const file = path.join(previewDir, 'cs-' + screenshotSlug + '-' + shot.name + '.png');
      await page.screenshot({ path: file });
      screenshots.push(file);
    }
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(requestErrors, []);
  console.log(JSON.stringify({ browser: browser.version(), groups, combinations, authoredVisuals: sourceVisuals.length, visualsByChapter: Object.fromEntries(chapters.map(chapter => [chapter.slug, chapterVisuals(chapter).length])), pageErrors: errors, requestErrors, screenshots }, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => { await browser?.close(); });
