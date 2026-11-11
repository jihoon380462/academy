const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const root = path.join(__dirname, '..');
const curriculum = vm.createContext({ window: {} });
for (const file of ['curriculum.js', 'python-content.js', 'algorithms-content.js', 'cs-content.js']) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), curriculum);
const source = fs.readFileSync(path.join(root, 'progress-transfer.js'), 'utf8');
const MATH = 'understand-math-grade1-v1';
const CS = 'academy-cs-ch01-v1';
const csLessonIds = ['cs-l001', 'cs-l002', 'cs-l003', 'cs-l004', 'cs-l005'];
const ALGORITHMS = 'academy-algorithms-ch01-v1';
const algorithmKeys = Array.from({ length: 9 }, (_, index) => 'academy-algorithms-ch' + String(index + 1).padStart(2, '0') + '-v1');
const algorithmLessonIds = [
  [1, 2, 3, 4, 5, 6],
  [7, 8, 9, 10, 11, 12],
  [13, 55, 14, 15, 16, 17, 18],
  [19, 20, 21, 22, 23, 24],
  [25, 26, 27, 28, 29, 30, 31],
  [32, 33, 34, 35, 36],
  [37, 38, 39, 40, 41, 42],
  [43, 44, 45, 46, 47, 56, 48],
  [49, 50, 51, 52, 53, 54]
].map(numbers => numbers.map(number => 'algorithms-l' + String(number).padStart(3, '0')));
const THEME = 'academy-theme-v1';
const pyKey = number => `academy-python-ch${String(number).padStart(2, '0')}-v1`;
const date = '2026-11-10T12:00:00.000Z';
const earlier = '2026-11-09T12:00:00.000Z';
const later = '2026-11-11T12:00:00.000Z';
const json = value => JSON.parse(JSON.stringify(value));
const state = overrides => ({ completed: [], scores: {}, last: null, visitedAt: 0, ...overrides });
const snapshot = (records = {}, extra = {}) => ({ format: 'academy-progress', version: 1, exportedAt: date, records, ...extra });
const score = (latest, best = latest, time = date) => ({ latest, best, date: time });

function memory(entries = {}) {
  const values = new Map(Object.entries(entries));
  const calls = [];
  return {
    values, calls,
    getItem(key) { calls.push(['get', key]); return values.get(key) ?? null; },
    setItem(key, value) { calls.push(['set', key, value]); values.set(key, String(value)); },
    removeItem(key) { calls.push(['remove', key]); values.delete(key); }
  };
}

function engine(storage = memory(), data = curriculum.window) {
  const window = { CURRICULUM: data.CURRICULUM, PYTHON_COURSES: data.PYTHON_COURSES, ALGORITHMS_COURSES: data.ALGORITHMS_COURSES, CS_COURSES: data.CS_COURSES, localStorage: storage };
  const context = vm.createContext({ window, TextEncoder, TextDecoder, btoa, atob });
  vm.runInContext(source, context, { filename: 'progress-transfer.js' });
  return window.AcademyProgressTransfer;
}

function expectCode(fn, code) {
  assert.throws(fn, error => error.code === code && /[가-힣]/.test(error.message));
}

function mutations(storage) {
  return storage.calls.filter(call => call[0] !== 'get');
}

test('exports the frozen API and captures all twenty courses with the real 137 lesson IDs in learning order', () => {
  const storage = memory(), api = engine(storage), captured = api.capture();
  assert.ok(Object.isFrozen(api));
  assert.equal(api.MAX_BYTES, 1048576);
  assert.deepEqual(Object.keys(api), ['MAX_BYTES', 'capture', 'encode', 'parse', 'summary', 'apply']);
  assert.deepEqual(Object.keys(captured.records), [MATH, ...Array.from({ length: 9 }, (_, index) => pyKey(index + 1)), ...algorithmKeys, CS]);
  assert.equal(captured.theme, 'light');
  assert.deepEqual(json(curriculum.window.ALGORITHMS_COURSES.map(course => course.lessons.map(lesson => lesson.id))), algorithmLessonIds);
  assert.equal(algorithmLessonIds.flat().length, 56);
  assert.deepEqual(json(curriculum.window.CS_COURSES.map(course => course.lessons.map(lesson => lesson.id))), [csLessonIds]);
  assert.equal(api.summary(captured).total, 137);
  assert.equal(api.summary(captured).completed, 0);
  assert.ok(Number.isFinite(Date.parse(captured.exportedAt)));
  assert.equal(mutations(storage).length, 0);
});

test('JSON and copy-code round trips preserve every course, review score and optional theme', () => {
  const api = engine(), captured = api.capture();
  for (const [index, [key, record]] of Object.entries(captured.records).entries()) {
    const course = [...curriculum.window.PYTHON_COURSES, ...curriculum.window.ALGORITHMS_COURSES, ...curriculum.window.CS_COURSES].find(item => key === 'academy-' + item.id + '-v1');
    const id = index === 0 ? 'prime' : course.lessons[0].id;
    Object.assign(record, state({ completed: [id], scores: { [id]: score(3, 5), review: score(8, 10) }, last: id, visitedAt: 1234 }));
  }
  captured.theme = 'ink';
  const expected = json(captured);
  assert.deepEqual(json(api.parse(JSON.stringify(captured))), expected);
  const code = api.encode(captured);
  assert.match(code, /^ACADEMY1\./);
  assert.deepEqual(json(api.parse(` \n${code}\n `)), expected);
  assert.deepEqual(json(api.summary(captured)), { completed: 20, total: 137, mathCompleted: 1, pythonCompleted: 9, algorithmsCompleted: 9, csCompleted: 1, scoreCount: 40, exportedAt: captured.exportedAt, theme: 'ink' });
});

test('old ten-course version 1 files preserve the local algorithms record and unrelated keys', () => {
  const algorithmsRaw = '{ "completed": ["algorithms-l002"], "scores": {}, "last": "algorithms-l002", "visitedAt": 200 }';
  const ch02Raw = '{ "completed": ["algorithms-l008"], "scores": {}, "last": "algorithms-l008", "visitedAt": 201 }';
  const ch03Raw = '{ "completed": ["algorithms-l014"], "scores": {}, "last": "algorithms-l014", "visitedAt": 202 }';
  const storage = memory({ [ALGORITHMS]: algorithmsRaw, [algorithmKeys[1]]: ch02Raw, [algorithmKeys[2]]: ch03Raw, unrelated: 'keep raw value', [THEME]: 'forest' });
  const api = engine(storage), old = api.capture();
  for (const key of [...algorithmKeys, CS]) delete old.records[key];
  old.records[MATH] = state({ completed: ['prime'] });
  old.records[pyKey(1)] = state({ completed: ['python-l001'] });
  assert.equal(Object.keys(old.records).length, 10);
  const parsed = api.parse(api.encode(old));
  assert.equal(parsed.version, 1);
  assert.equal(Object.hasOwn(parsed.records, ALGORITHMS), false);
  const result = api.apply(parsed);
  assert.deepEqual(json(result.records[ALGORITHMS]), state({ completed: ['algorithms-l002'], last: 'algorithms-l002', visitedAt: 200 }));
  assert.equal(storage.values.get(ALGORITHMS), algorithmsRaw);
  assert.equal(storage.values.get(algorithmKeys[1]), ch02Raw);
  assert.equal(storage.values.get(algorithmKeys[2]), ch03Raw);
  assert.equal(storage.values.get('unrelated'), 'keep raw value');
  assert.equal(storage.values.get(THEME), 'forest');
  assert.deepEqual(mutations(storage).map(call => call[1]), [MATH, pyKey(1)]);
});

test('algorithms records round-trip, merge independently and count under their own subject', () => {
  const mathRaw = JSON.stringify(state({ completed: ['prime'] }));
  const pythonRaw = JSON.stringify(state({ completed: ['python-l001'], scores: { 'python-l001': score(4, 5) } }));
  const storage = memory({ [MATH]: mathRaw, [pyKey(1)]: pythonRaw, [ALGORITHMS]: JSON.stringify(state({ completed: ['algorithms-l001'], last: 'algorithms-l001', visitedAt: 10 })) });
  const api = engine(storage);
  const incoming = snapshot({ [ALGORITHMS]: state({ completed: ['algorithms-l002', 'algorithms-l006'], last: 'algorithms-l006', visitedAt: 20 }) });
  const parsed = api.parse(api.encode(incoming));
  assert.deepEqual(json(parsed), incoming);
  assert.deepEqual(json(api.summary(parsed)), { completed: 2, total: 137, mathCompleted: 0, pythonCompleted: 0, algorithmsCompleted: 2, csCompleted: 0, scoreCount: 0, exportedAt: date });
  const result = api.apply(parsed);
  assert.equal(result.addedCompleted, 2);
  assert.deepEqual(json(result.records[ALGORITHMS]), state({ completed: ['algorithms-l001', 'algorithms-l002', 'algorithms-l006'], last: 'algorithms-l006', visitedAt: 20 }));
  assert.equal(storage.values.get(MATH), mathRaw);
  assert.equal(storage.values.get(pyKey(1)), pythonRaw);
  assert.deepEqual(mutations(storage).map(call => call[1]), [ALGORITHMS]);
  expectCode(() => api.parse(JSON.stringify(snapshot({ [ALGORITHMS]: state({ completed: ['python-l001'] }) }))), 'INVALID_DATA');
  expectCode(() => api.parse(JSON.stringify(snapshot({ [ALGORITHMS]: state({ last: 'algorithms-l007' }) }))), 'INVALID_DATA');
});

test('old eleven-course files preserve new chapters byte-for-byte and cross-chapter merges stay isolated', () => {
  const oldRaw = JSON.stringify(state({ completed: ['algorithms-l001'], last: 'algorithms-l001', visitedAt: 100 }));
  const ch02Raw = '{ "completed": ["algorithms-l008"], "scores": {}, "last": "algorithms-l008", "visitedAt": 200 }';
  const ch03Raw = '{ "completed": ["algorithms-l014"], "scores": {}, "last": "algorithms-l014", "visitedAt": 300 }';
  const storage = memory({ [algorithmKeys[0]]: oldRaw, [algorithmKeys[1]]: ch02Raw, [algorithmKeys[2]]: ch03Raw, unrelated: 'keep' });
  const api = engine(storage), old = api.capture();
  for (const key of [...algorithmKeys.slice(1), CS]) delete old.records[key];
  old.records[ALGORITHMS] = state({ completed: ['algorithms-l002'], last: 'algorithms-l002', visitedAt: 101 });
  assert.equal(Object.keys(old.records).length, 11);
  const parsed = api.parse(api.encode(old));
  api.apply(parsed);
  assert.equal(storage.values.get(algorithmKeys[1]), ch02Raw);
  assert.equal(storage.values.get(algorithmKeys[2]), ch03Raw);
  assert.equal(storage.values.get('unrelated'), 'keep');
  assert.deepEqual(mutations(storage).map(call => call[1]), [ALGORITHMS]);

  storage.calls.length = 0;
  const incoming = snapshot({
    [algorithmKeys[1]]: state({ completed: ['algorithms-l007', 'algorithms-l012'], last: 'algorithms-l012', visitedAt: 400 }),
    [algorithmKeys[2]]: state({ completed: ['algorithms-l013', 'algorithms-l018'], last: 'algorithms-l018', visitedAt: 500 })
  });
  const result = api.apply(api.parse(api.encode(incoming)));
  assert.deepEqual(json(result.records[algorithmKeys[1]]), state({ completed: ['algorithms-l007', 'algorithms-l008', 'algorithms-l012'], last: 'algorithms-l012', visitedAt: 400 }));
  assert.deepEqual(json(result.records[algorithmKeys[2]]), state({ completed: ['algorithms-l013', 'algorithms-l014', 'algorithms-l018'], last: 'algorithms-l018', visitedAt: 500 }));
  assert.equal(result.addedCompleted, 4);
  assert.deepEqual(mutations(storage).map(call => call[1]), algorithmKeys.slice(1, 3));
  assert.deepEqual(json(api.summary(incoming)), { completed: 4, total: 137, mathCompleted: 0, pythonCompleted: 0, algorithmsCompleted: 4, csCompleted: 0, scoreCount: 0, exportedAt: date });
  for (const [key, wrongId] of [[algorithmKeys[1], 'algorithms-l013'], [algorithmKeys[2], 'algorithms-l007']]) {
    expectCode(() => api.parse(JSON.stringify(snapshot({ [key]: state({ completed: [wrongId] }) }))), 'INVALID_DATA');
  }
});

test('old ten, eleven, thirteen and fifteen-course files preserve omitted current algorithm records', () => {
  for (const count of [10, 11, 13, 15]) {
    const raw = Object.fromEntries(algorithmLessonIds.map((ids, index) => {
      const id = ids.at(-1);
      return [algorithmKeys[index], JSON.stringify(state({ completed: [id], scores: { [id]: score(2, 4) }, last: id, visitedAt: 100 + index }), null, 2)];
    }));
    const storage = memory({ ...raw, unrelated: 'preserve' }), api = engine(storage);
    const old = api.capture();
    for (const key of [...algorithmKeys.slice(count - 10), CS]) delete old.records[key];
    assert.equal(Object.keys(old.records).length, count);
    const result = api.apply(api.parse(api.encode(old)));
    for (const key of algorithmKeys.slice(count - 10)) {
      assert.equal(storage.values.get(key), raw[key], count + ': omitted raw key ' + key);
      assert.deepEqual(json(result.records[key]), JSON.parse(raw[key]));
    }
    assert.equal(storage.values.get('unrelated'), 'preserve');
    assert.deepEqual(mutations(storage), []);
  }
});

test('chapters four and five merge in isolation, retain prior thirteen stores and reject foreign lesson IDs', () => {
  const storage = memory(), api = engine(storage), all = api.capture();
  for (const [index, [key, value]] of Object.entries(all.records).entries()) {
    const course = [...curriculum.window.PYTHON_COURSES, ...curriculum.window.ALGORITHMS_COURSES, ...curriculum.window.CS_COURSES].find(item => key === 'academy-' + item.id + '-v1');
    const id = index === 0 ? 'prime' : course.lessons[0].id;
    storage.values.set(key, JSON.stringify(state({ completed: [id], scores: { [id]: score(2, 4) }, last: id, visitedAt: 100 + index }), null, 1));
  }
  const before = new Map(storage.values);
  const incoming = snapshot({
    [algorithmKeys[3]]: state({ completed: ['algorithms-l020', 'algorithms-l024'], last: 'algorithms-l024', visitedAt: 400 }),
    [algorithmKeys[4]]: state({ completed: ['algorithms-l030', 'algorithms-l031'], last: 'algorithms-l031', visitedAt: 500 })
  });
  const result = api.apply(api.parse(api.encode(incoming)));
  assert.deepEqual(json(result.records[algorithmKeys[3]].completed), ['algorithms-l019', 'algorithms-l020', 'algorithms-l024']);
  assert.deepEqual(json(result.records[algorithmKeys[4]].completed), ['algorithms-l025', 'algorithms-l030', 'algorithms-l031']);
  assert.equal(result.records[algorithmKeys[4]].last, 'algorithms-l031');
  assert.equal(result.addedCompleted, 4);
  for (const key of [...before.keys()].slice(0, 13)) assert.equal(storage.values.get(key), before.get(key), key + ' raw state retained');
  assert.deepEqual(mutations(storage).map(call => call[1]), algorithmKeys.slice(3, 5));
  for (const [key, wrongId] of [[algorithmKeys[3], 'algorithms-l025'], [algorithmKeys[4], 'algorithms-l024'], [algorithmKeys[4], 'algorithms-l032']]) {
    expectCode(() => api.parse(JSON.stringify(snapshot({ [key]: state({ completed: [wrongId], last: wrongId }) }))), 'INVALID_DATA');
  }
});

test('chapters six through nine retain prior fifteen raw records and merge only their own lesson IDs', () => {
  const storage = memory(), api = engine(storage), all = api.capture();
  for (const [index, [key]] of Object.entries(all.records).entries()) {
    const course = [...curriculum.window.PYTHON_COURSES, ...curriculum.window.ALGORITHMS_COURSES, ...curriculum.window.CS_COURSES].find(item => key === 'academy-' + item.id + '-v1');
    const id = index === 0 ? 'prime' : course.lessons[0].id;
    storage.values.set(key, JSON.stringify(state({ completed: [id], scores: { [id]: score(2, 4) }, last: id, visitedAt: 100 + index }), null, 1));
  }
  const before = new Map(storage.values), incoming = snapshot({});
  const existingTailReads = [
    ['algorithms-l035', 'algorithms-l036'],
    ['algorithms-l041', 'algorithms-l042'],
    ['algorithms-l047', 'algorithms-l048'],
    ['algorithms-l053', 'algorithms-l054']
  ];
  for (const index of [5, 6, 7, 8]) {
    const ids = existingTailReads[index - 5];
    incoming.records[algorithmKeys[index]] = state({ completed: ids, last: ids.at(-1), visitedAt: 500 + index });
  }
  const result = api.apply(api.parse(api.encode(incoming)));
  assert.equal(result.addedCompleted, 8);
  for (const [key, value] of [...before.entries()].slice(0, 15)) assert.equal(storage.values.get(key), value, key + ' raw record retained');
  for (const [index, ids] of algorithmLessonIds.entries()) {
    if (index < 5) continue;
    const record = result.records[algorithmKeys[index]];
    assert.deepEqual(json(record.completed), [ids[0], ...existingTailReads[index - 5]]);
    assert.equal(record.last, existingTailReads[index - 5].at(-1));
    assert.deepEqual(json(record.scores), { [ids[0]]: score(2, 4) });
    const wrongId = algorithmLessonIds[index - 1].at(-1);
    expectCode(() => api.parse(JSON.stringify(snapshot({ [algorithmKeys[index]]: state({ completed: [wrongId], last: wrongId }) }))), 'INVALID_DATA');
  }
  assert.deepEqual(mutations(storage).map(call => call[1]), algorithmKeys.slice(5));
  expectCode(() => api.parse(JSON.stringify(snapshot({ [algorithmKeys[8]]: state({ completed: ['algorithms-l055'] }) }))), 'INVALID_DATA');
});

test('a nineteen-course file from before the inserted lessons retains old reads and never invents new completions', () => {
  const storage = memory(), api = engine(storage), legacy = api.capture();
  delete legacy.records[CS];
  legacy.records[algorithmKeys[2]] = state({ completed: ['algorithms-l013', 'algorithms-l014', 'algorithms-l018'], scores: { 'algorithms-l014': score(2, 4) }, last: 'algorithms-l018', visitedAt: 100 });
  legacy.records[algorithmKeys[7]] = state({ completed: ['algorithms-l043', 'algorithms-l047', 'algorithms-l048'], scores: { 'algorithms-l047': score(3, 5) }, last: 'algorithms-l048', visitedAt: 200 });
  assert.equal(Object.keys(legacy.records).length, 19);
  const result = api.apply(api.parse(api.encode(legacy)));
  assert.equal(result.addedCompleted, 6);
  assert.deepEqual(json(result.records[algorithmKeys[2]]), legacy.records[algorithmKeys[2]]);
  assert.deepEqual(json(result.records[algorithmKeys[7]]), legacy.records[algorithmKeys[7]]);
  assert.ok(!result.records[algorithmKeys[2]].completed.includes('algorithms-l055'));
  assert.ok(!result.records[algorithmKeys[7]].completed.includes('algorithms-l056'));
  assert.deepEqual(mutations(storage).map(call => call[1]), [algorithmKeys[2], algorithmKeys[7]]);
  assert.equal(api.summary(api.capture()).total, 137);
});

test('inserted lessons round-trip under existing chapter keys and survive merging older nineteen-course records', () => {
  const sourceStorage = memory({
    [algorithmKeys[2]]: JSON.stringify(state({ completed: ['algorithms-l055'], last: 'algorithms-l055', visitedAt: 500 })),
    [algorithmKeys[7]]: JSON.stringify(state({ completed: ['algorithms-l056'], last: 'algorithms-l056', visitedAt: 600 }))
  });
  const api = engine(sourceStorage), captured = api.capture();
  assert.equal(Object.keys(captured.records).length, 20);
  for (const text of [JSON.stringify(captured), api.encode(captured)]) {
    const parsed = api.parse(text);
    assert.deepEqual(json(parsed), json(captured));
    const mathRaw = '{ "completed": ["prime"], "scores": {}, "last": "prime", "visitedAt": 12 }';
    const pythonRaw = JSON.stringify(state({ completed: ['python-l046'], scores: { 'python-l046': score(2, 5) } }));
    const target = memory({
      [MATH]: mathRaw, [pyKey(9)]: pythonRaw, [THEME]: 'forest', unrelated: 'keep exact raw text',
      [algorithmKeys[2]]: JSON.stringify(state({ completed: ['algorithms-l013', 'algorithms-l014'], scores: { 'algorithms-l014': score(2, 4) }, last: 'algorithms-l014', visitedAt: 100 })),
      [algorithmKeys[7]]: JSON.stringify(state({ completed: ['algorithms-l047', 'algorithms-l048'], scores: { 'algorithms-l047': score(3, 5) }, last: 'algorithms-l048', visitedAt: 200 }))
    });
    const targetApi = engine(target), merged = targetApi.apply(parsed);
    assert.equal(merged.addedCompleted, 2);
    assert.deepEqual(json(merged.records[algorithmKeys[2]]), state({ completed: ['algorithms-l013', 'algorithms-l055', 'algorithms-l014'], scores: { 'algorithms-l014': score(2, 4) }, last: 'algorithms-l055', visitedAt: 500 }));
    assert.deepEqual(json(merged.records[algorithmKeys[7]]), state({ completed: ['algorithms-l047', 'algorithms-l056', 'algorithms-l048'], scores: { 'algorithms-l047': score(3, 5) }, last: 'algorithms-l056', visitedAt: 600 }));
    assert.equal(target.values.get(MATH), mathRaw);
    assert.equal(target.values.get(pyKey(9)), pythonRaw);
    assert.equal(target.values.get(THEME), 'forest');
    assert.equal(target.values.get('unrelated'), 'keep exact raw text');
    assert.deepEqual(mutations(target).map(call => call[1]), [algorithmKeys[2], algorithmKeys[7]]);

    const before = [...target.values], legacy = targetApi.capture();
    delete legacy.records[CS];
    legacy.records[algorithmKeys[2]] = state({ completed: ['algorithms-l013', 'algorithms-l014'], last: 'algorithms-l014', visitedAt: 100 });
    legacy.records[algorithmKeys[7]] = state({ completed: ['algorithms-l047', 'algorithms-l048'], last: 'algorithms-l048', visitedAt: 200 });
    assert.equal(Object.keys(legacy.records).length, 19);
    target.calls.length = 0;
    assert.equal(targetApi.apply(targetApi.parse(JSON.stringify(legacy))).addedCompleted, 0);
    assert.deepEqual([...target.values], before, 'older same-course files cannot erase new reads, recent visits or old scores');
    assert.deepEqual(mutations(target), []);
  }
  for (const [key, id] of [[algorithmKeys[2], 'algorithms-l056'], [algorithmKeys[7], 'algorithms-l055'], [algorithmKeys[2], 'algorithms-l057']]) {
    expectCode(() => api.parse(JSON.stringify(snapshot({ [key]: state({ completed: [id], last: id }) }))), 'INVALID_DATA');
  }
});

test('CS file and copy-code imports merge only CS reads and newest visits without changing other raw stores', () => {
  const sourceStorage = memory({ [CS]: JSON.stringify(state({ completed: ['cs-l002', 'cs-l005'], last: 'cs-l005', visitedAt: 500 })) });
  const sourceApi = engine(sourceStorage), captured = sourceApi.capture();
  assert.equal(sourceApi.summary(captured).csCompleted, 2);
  for (const text of [JSON.stringify(captured), sourceApi.encode(captured)]) {
    const preserved = {
      [MATH]: '{ "completed": ["prime"], "scores": {"prime":{"latest":3,"best":5,"date":"2026-11-10T12:00:00.000Z"}}, "last": "prime" }',
      [pyKey(1)]: JSON.stringify(state({ completed: ['python-l001'], scores: { 'python-l001': score(2, 5) } })),
      [ALGORITHMS]: JSON.stringify(state({ completed: ['algorithms-l001'], last: 'algorithms-l001', visitedAt: 100 })),
      [THEME]: 'forest', unrelated: 'keep exact raw text'
    };
    const storage = memory({ ...preserved, [CS]: JSON.stringify(state({ completed: ['cs-l001', 'cs-l002'], last: 'cs-l001', visitedAt: 200 })) });
    const api = engine(storage), before = [...storage.values];
    const parsed = api.parse(text), summary = api.summary(parsed);
    assert.equal(summary.csCompleted, 2);
    assert.equal(summary.completed, 2);
    assert.equal(summary.total, 137);
    assert.deepEqual([...storage.values], before, 'parse and summary must not change storage');
    assert.deepEqual(mutations(storage), []);
    const result = api.apply(parsed);
    assert.equal(result.addedCompleted, 1);
    assert.deepEqual(json(result.records[CS]), state({ completed: ['cs-l001', 'cs-l002', 'cs-l005'], last: 'cs-l005', visitedAt: 500 }));
    for (const [key, raw] of Object.entries(preserved)) assert.equal(storage.values.get(key), raw, key + ' preserved');
    assert.deepEqual(mutations(storage).map(call => call[1]), [CS]);
    storage.calls.length = 0;
    assert.equal(api.apply(parsed).addedCompleted, 0);
    assert.deepEqual(mutations(storage), []);
  }
});

test('old ten, eleven, thirteen, fifteen and nineteen-course files preserve omitted CS raw state', () => {
  for (const count of [10, 11, 13, 15, 19]) {
    const raw = '{ "completed": ["cs-l004"], "scores": {}, "last": "cs-l004", "visitedAt": 600, "legacyExtra": "preserve" }';
    const storage = memory({ [CS]: raw, [THEME]: 'ink' }), api = engine(storage);
    const captured = api.capture();
    const legacy = { ...captured, records: Object.fromEntries(Object.entries(captured.records).slice(0, count)) };
    assert.equal(Object.keys(legacy.records).length, count);
    assert.equal(Object.hasOwn(legacy.records, CS), false);
    const parsed = api.parse(api.encode(legacy));
    assert.equal(api.summary(parsed).csCompleted, 0);
    assert.equal(api.apply(parsed).addedCompleted, 0);
    assert.equal(storage.values.get(CS), raw);
    assert.equal(storage.values.get(THEME), 'ink');
    assert.deepEqual(mutations(storage), []);
  }
});

test('failure at the CS write restores earlier subjects and leaves the original CS record intact', () => {
  const mathRaw = '{ "completed": ["prime"], "scores": {}, "last": null }';
  const csRaw = '{ "completed": ["cs-l001"], "scores": {}, "last": "cs-l001", "visitedAt": 1 }';
  const storage = memory({ [MATH]: mathRaw, [CS]: csRaw, [THEME]: 'forest' }), api = engine(storage);
  const original = [...storage.values], set = storage.setItem;
  storage.setItem = function (key, value) {
    if (key === CS) throw new Error('quota');
    return set.call(this, key, value);
  };
  const incoming = snapshot({ [MATH]: state({ completed: ['factorization'] }), [CS]: state({ completed: ['cs-l005'], last: 'cs-l005', visitedAt: 100 }) });
  expectCode(() => api.apply(incoming), 'WRITE_FAILED');
  assert.deepEqual([...storage.values], original);
  assert.equal(storage.values.get(MATH), mathRaw);
  assert.equal(storage.values.get(CS), csRaw);
});

test('CS imports reject unknown chapters, future lessons and IDs owned by another subject', () => {
  const storage = memory(), api = engine(storage);
  for (const id of ['cs-l006', 'python-l001', 'algorithms-l001', 'prime']) {
    for (const field of ['completed', 'last']) {
      const value = field === 'completed' ? [id] : id;
      expectCode(() => api.parse(JSON.stringify(snapshot({ [CS]: state({ [field]: value }) }))), 'INVALID_DATA');
    }
  }
  expectCode(() => api.parse(JSON.stringify(snapshot({ 'academy-cs-ch02-v1': state() }))), 'INVALID_DATA');
  assert.deepEqual(mutations(storage), []);
});

test('UTF-8 copy codes preserve Korean and non-BMP curriculum IDs', () => {
  const data = { CURRICULUM: { lessons: [{ id: '학습-🧠' }] }, PYTHON_COURSES: [] };
  const api = engine(memory(), data);
  const original = snapshot({ [MATH]: state({ completed: ['학습-🧠'], scores: { '학습-🧠': score(5) }, last: '학습-🧠', visitedAt: 12 }) });
  assert.deepEqual(json(api.parse(api.encode(original))), original);
  assert.equal(api.summary(original).total, 1);
});

test('capture tolerates corrupt local values, filters IDs and retains valid hidden Python scores', () => {
  const storage = memory({
    [MATH]: '{ broken',
    [pyKey(1)]: JSON.stringify({ completed: ['python-l001', 'python-l001', 'prime', null], scores: { 'python-l001': score(2, 5, 'bad date'), 'python-l002': score(6), review: score(7, 9), evil: score(5) }, last: 'python-l046', visitedAt: -1, unknown: 'ignore' }),
    [pyKey(2)]: '[]',
    [THEME]: 'unknown-theme', unrelated: 'untouched'
  });
  const captured = engine(storage).capture();
  assert.deepEqual(json(captured.records[MATH]), state());
  assert.deepEqual(json(captured.records[pyKey(1)]), state({ completed: ['python-l001'], scores: { 'python-l001': score(2, 5, ''), review: score(7, 9) } }));
  assert.deepEqual(json(captured.records[pyKey(2)]), state());
  assert.equal(captured.theme, 'light');
  assert.equal(storage.values.get('unrelated'), 'untouched');
  assert.equal(mutations(storage).length, 0);
});

test('partial records normalize omitted fields and duplicate completions', () => {
  const api = engine();
  const parsed = api.parse(JSON.stringify(snapshot({ [MATH]: { completed: ['prime', 'prime'], scores: { prime: { latest: 2, best: 3 } } }, [pyKey(1)]: {} })));
  assert.deepEqual(json(parsed.records), { [MATH]: state({ completed: ['prime'], scores: { prime: score(2, 3, '') } }), [pyKey(1)]: state() });
  assert.equal(Object.hasOwn(parsed, 'theme'), false);
});

test('apply rereads fresh storage and merges union, maximum best, newest latest and recent lesson', () => {
  const storage = memory({
    [MATH]: JSON.stringify(state({ completed: ['prime'], scores: { prime: score(5, 5, earlier), factorization: score(2, 4, later), review: score(9, 10, earlier) }, last: 'prime', visitedAt: 200 })),
    [pyKey(9)]: JSON.stringify(state({ completed: ['python-l046'], scores: { 'python-l046': score(4, 5) } })),
    [THEME]: 'forest', unrelated: '{ unchanged }'
  });
  const api = engine(storage);
  const incoming = snapshot({ [MATH]: state({ completed: ['factorization'], scores: { prime: score(1, 3, later), factorization: score(5, 5, earlier), review: score(7, 8, later) }, last: 'factorization', visitedAt: 250 }) }, { theme: 'ink' });
  api.summary(incoming);
  const live = JSON.parse(storage.values.get(MATH));
  live.completed.push('gcd-lcm');
  storage.values.set(MATH, JSON.stringify(live));
  const result = api.apply(incoming);
  assert.equal(result.addedCompleted, 1);
  assert.equal(Object.keys(result.records).length, 20);
  assert.deepEqual(json(result.records[MATH]), state({ completed: ['prime', 'factorization', 'gcd-lcm'], scores: { prime: score(1, 5, later), factorization: score(2, 5, later), review: score(7, 10, later) }, last: 'factorization', visitedAt: 250 }));
  assert.deepEqual(json(result.records[pyKey(9)].scores), { 'python-l046': score(4, 5) });
  assert.equal(result.theme, 'forest');
  assert.equal(storage.values.get(THEME), 'forest');
  assert.equal(storage.values.get('unrelated'), '{ unchanged }');
  assert.deepEqual(mutations(storage).map(call => call[1]), [MATH]);
});

test('score date ties, equivalent timezone instants and empty dates preserve local latest', () => {
  const api = engine();
  const cases = [
    [date, date, 2, date],
    ['2026-11-10T21:00:00+09:00', date, 2, '2026-11-10T21:00:00+09:00'],
    ['', '', 2, ''],
    [date, '', 2, date],
    ['', date, 4, date],
    ['', '1970-01-01T00:00:00.000Z', 4, '1970-01-01T00:00:00.000Z']
  ];
  for (const [localDate, incomingDate, expectedLatest, expectedDate] of cases) {
    const storage = memory({ [MATH]: JSON.stringify(state({ scores: { prime: score(2, 3, localDate) } })) });
    const result = api.apply(snapshot({ [MATH]: state({ scores: { prime: score(4, 5, incomingDate) } }) }), storage);
    assert.deepEqual(json(result.records[MATH].scores.prime), score(expectedLatest, 5, expectedDate));
  }
});

test('last lesson uses its own timestamp, keeps ties and fills a missing local lesson', () => {
  const api = engine();
  for (const [last, visitedAt, expected] of [['prime', 100, 'prime'], ['prime', 101, 'prime'], ['prime', 99, 'factorization'], [null, 1000, 'factorization']]) {
    const storage = memory({ [MATH]: JSON.stringify(state({ last, visitedAt })) });
    const result = api.apply(snapshot({ [MATH]: state({ last: 'factorization', visitedAt: 100 }) }), storage);
    assert.equal(result.records[MATH].last, expected);
  }
  const storage = memory({ [MATH]: JSON.stringify(state({ last: 'prime', visitedAt: 100 })) });
  const result = api.apply(snapshot({ [MATH]: state({ last: null, visitedAt: 999 }) }), storage);
  assert.equal(result.records[MATH].last, 'prime');
  assert.equal(result.records[MATH].visitedAt, 100);
});

test('empty and repeated imports preserve raw existing records and perform no redundant writes', () => {
  const raw = '{ "scores": {}, "completed": ["prime"], "last": "prime", "visitedAt": 5, "oldExtra": true }';
  const storage = memory({ [MATH]: raw, [THEME]: 'glass' }), api = engine(storage);
  assert.equal(api.apply(snapshot({ [MATH]: state(), [pyKey(1)]: state() })).addedCompleted, 0);
  assert.equal(storage.values.get(MATH), raw);
  assert.equal(storage.values.has(pyKey(1)), false);
  assert.equal(mutations(storage).length, 0);
  const incoming = snapshot({ [MATH]: state({ completed: ['factorization'] }) });
  assert.equal(api.apply(incoming).addedCompleted, 1);
  const writes = mutations(storage).length;
  assert.equal(api.apply(incoming).addedCompleted, 0);
  assert.equal(mutations(storage).length, writes);
  assert.equal(storage.values.get(THEME), 'glass');
});

test('theme changes only with explicit opt-in and absent imported theme leaves it untouched', () => {
  const storage = memory({ [THEME]: 'forest' }), api = engine(storage);
  const incoming = snapshot({}, { theme: 'ink' });
  assert.equal(api.apply(incoming).theme, 'forest');
  assert.equal(api.apply(incoming, storage, { includeTheme: true }).theme, 'ink');
  assert.equal(api.apply(snapshot(), storage, { includeTheme: true }).theme, 'ink');
  assert.deepEqual(mutations(storage), [['set', THEME, 'ink']]);
});

test('invalid top-level documents, formats, versions, fields and storage keys are rejected', () => {
  const api = engine();
  const malformed = ['', 'null', '[]', '{}', '{', '"hello"'];
  for (const text of malformed) expectCode(() => api.parse(text), 'INVALID_DATA');
  for (const value of [snapshot({}, { format: 'other' }), snapshot({}, { extra: true }), snapshot({ unknown: {} }), snapshot({ [pyKey(10)]: {} }), snapshot([], {}), snapshot({}, { theme: 'unknown' }), snapshot({}, { exportedAt: '' })]) {
    expectCode(() => api.parse(JSON.stringify(value)), 'INVALID_DATA');
  }
  for (const version of [0, 2, '1', null]) expectCode(() => api.parse(JSON.stringify(snapshot({}, { version }))), 'UNSUPPORTED_VERSION');
});

test('incoming state and scores reject invalid shapes, cross-course IDs and unknown fields', () => {
  const api = engine();
  const invalidStates = [null, [], 7, { extra: true }, { completed: 'prime' }, { completed: ['python-l001'] }, { completed: [null] }, { completed: ['prime', 'not-a-lesson'] }, { last: 'review' }, { last: 'python-l001' }, { scores: [] }, { scores: null }, { scores: { alien: score(1) } }, { scores: { prime: [] } }, { scores: { prime: { latest: 1 } } }, { scores: { prime: { ...score(2), payload: '<img>' } } }];
  for (const record of invalidStates) expectCode(() => api.parse(JSON.stringify(snapshot({ [MATH]: record }))), 'INVALID_DATA');
  expectCode(() => api.parse(JSON.stringify(snapshot({ [pyKey(1)]: state({ completed: ['python-l046'] }) }))), 'INVALID_DATA');
  expectCode(() => api.parse(JSON.stringify(snapshot({ [pyKey(1)]: state({ scores: { 'python-l046': score(1) } }) }))), 'INVALID_DATA');
});

test('scores are finite integers in the lesson/review range and best never trails latest', () => {
  const api = engine();
  for (const invalid of [score(-1), score(6), score(2.5), score('2'), score(4, 3), score(0, 6), score(NaN), score(Infinity), score(1, -Infinity)]) {
    expectCode(() => api.apply(snapshot({ [MATH]: state({ scores: { prime: invalid } }) })), 'INVALID_DATA');
  }
  expectCode(() => api.parse(JSON.stringify(snapshot({ [MATH]: state({ scores: { review: score(11) } }) }))), 'INVALID_DATA');
  assert.equal(api.parse(JSON.stringify(snapshot({ [MATH]: state({ scores: { review: score(10), prime: score(0) } }) }))).records[MATH].scores.review.best, 10);
  expectCode(() => api.parse(JSON.stringify(snapshot({ [MATH]: state({ scores: { prime: score(1) } }) })).replace('"latest":1', '"latest":1e999')), 'INVALID_DATA');
});

test('timestamps and ISO dates reject impossible calendars, missing zones and unsafe values', () => {
  const api = engine();
  for (const visitedAt of [-1, Infinity, NaN, '123', null, 8640000000000001]) expectCode(() => api.apply(snapshot({ [MATH]: state({ visitedAt }) })), 'INVALID_DATA');
  for (const invalidDate of ['2026-02-29T12:00:00Z', '2026-02-30T12:00:00Z', '2026-13-01T12:00:00Z', '2026-11-10', '2026-11-10T12:00:00', '2026-11-10T24:00:00Z', '2026-11-10T12:00:60Z', '2026-11-10T12:00:00+24:00', '<img src=x>', 'x'.repeat(100), 100]) {
    expectCode(() => api.parse(JSON.stringify(snapshot({}, { exportedAt: invalidDate }))), 'INVALID_DATA');
    expectCode(() => api.parse(JSON.stringify(snapshot({ [MATH]: state({ scores: { prime: score(1, 1, invalidDate) } }) }))), 'INVALID_DATA');
  }
  for (const valid of ['2024-02-29T12:00:00Z', '2026-11-10T21:00:00+09:00', '+275760-09-13T00:00:00.000Z']) {
    assert.equal(api.parse(JSON.stringify(snapshot({}, { exportedAt: valid }))).exportedAt, valid);
  }
  assert.equal(api.parse(JSON.stringify(snapshot({ [MATH]: state({ last: 'prime', visitedAt: 8640000000000000 }) }))).records[MATH].visitedAt, 8640000000000000);
});

test('prototype pollution payloads at every object boundary are rejected without mutation', () => {
  const storage = memory(), api = engine(storage);
  const placements = [
    ['top', ''], ['records', ''], ['state', MATH], ['scores', MATH], ['score', MATH]
  ];
  for (const name of ['__proto__', 'constructor', 'prototype']) {
    for (const [placement] of placements) {
      const value = snapshot({ [MATH]: state({ scores: { prime: score(2) } }) });
      const target = placement === 'top' ? value : placement === 'records' ? value.records : placement === 'state' ? value.records[MATH] : placement === 'scores' ? value.records[MATH].scores : value.records[MATH].scores.prime;
      Object.defineProperty(target, name, { value: { polluted: true }, enumerable: true });
      expectCode(() => api.parse(JSON.stringify(value)), 'INVALID_DATA');
      expectCode(() => api.apply(value, storage), 'INVALID_DATA');
    }
  }
  assert.equal({}.polluted, undefined);
  assert.equal(mutations(storage).length, 0);
});

test('direct API validation rejects inherited payloads, accessors, symbols and sparse arrays', () => {
  const api = engine(), value = snapshot();
  Object.setPrototypeOf(value, { attacker: true });
  expectCode(() => api.apply(value), 'INVALID_DATA');
  const accessor = snapshot();
  Object.defineProperty(accessor, 'theme', { get() { throw new Error('must not execute'); }, enumerable: true });
  expectCode(() => api.encode(accessor), 'INVALID_DATA');
  const symbols = snapshot();
  symbols[Symbol('hidden')] = true;
  expectCode(() => api.summary(symbols), 'INVALID_DATA');
  const sparse = new Array(2);
  sparse[0] = 'prime';
  Object.defineProperty(sparse, '__proto__', { value: 'prime', enumerable: true });
  expectCode(() => api.apply(snapshot({ [MATH]: state({ completed: sparse }) })), 'INVALID_DATA');
});

test('completion array length is bounded before duplicate normalization', () => {
  const api = engine();
  expectCode(() => api.parse(JSON.stringify(snapshot({ [MATH]: state({ completed: Array(31).fill('prime') }) }))), 'INVALID_DATA');
  expectCode(() => api.parse(JSON.stringify(snapshot({ [pyKey(1)]: state({ completed: Array(6).fill('python-l001') }) }))), 'INVALID_DATA');
  assert.equal(api.parse(JSON.stringify(snapshot({ [pyKey(6)]: state({ completed: Array(6).fill('python-l026') }) }))).records[pyKey(6)].completed.length, 1);
});

test('copy-code parser rejects invalid base64, noncanonical pad bits and malformed UTF-8', () => {
  const api = engine();
  for (const text of ['ACADEMY1.', 'ACADEMY1.====', 'ACADEMY1.A', 'ACADEMY1.e30', 'ACADEMY1.e3 0=', 'ACADEMY1.e30===', 'ACADEMY1.e31=', 'ACADEMY1.____', 'ACADEMY1./w==', 'ACADEMY2.e30=']) expectCode(() => api.parse(text), 'INVALID_DATA');
  const largeMalformed = 'ACADEMY1.' + 'A'.repeat(1000000);
  expectCode(() => api.parse(largeMalformed), 'INVALID_DATA');
});

test('the UTF-8 byte limit applies before parsing and includes surrounding whitespace', () => {
  const api = engine();
  expectCode(() => api.parse(' '.repeat(api.MAX_BYTES + 1)), 'TOO_LARGE');
  expectCode(() => api.parse('가'.repeat(Math.ceil(api.MAX_BYTES / 3))), 'TOO_LARGE');
  expectCode(() => api.parse('ACADEMY1.' + 'A'.repeat(api.MAX_BYTES)), 'TOO_LARGE');
  const content = JSON.stringify(snapshot());
  assert.equal(api.parse(content + ' '.repeat(api.MAX_BYTES - content.length)).version, 1);
});

test('storage read failures abort capture/apply before any write', () => {
  const storage = memory(), get = storage.getItem;
  storage.getItem = function (key) { if (key === pyKey(9)) throw new Error('denied'); return get.call(this, key); };
  const api = engine(storage);
  expectCode(() => api.capture(), 'READ_FAILED');
  expectCode(() => api.apply(snapshot({ [MATH]: state({ completed: ['prime'] }) })), 'READ_FAILED');
  assert.equal(mutations(storage).length, 0);
});

test('default localStorage property denial becomes a readable Korean error', () => {
  const window = { CURRICULUM: curriculum.window.CURRICULUM, PYTHON_COURSES: curriculum.window.PYTHON_COURSES };
  Object.defineProperty(window, 'localStorage', { get() { throw new Error('denied'); } });
  const context = vm.createContext({ window, TextEncoder, TextDecoder, btoa, atob });
  vm.runInContext(source, context);
  expectCode(() => window.AcademyProgressTransfer.capture(), 'READ_FAILED');
});

test('first write failure leaves every existing storage value unchanged', () => {
  const storage = memory({ [MATH]: 'null', unrelated: 'stay' }), original = [...storage.values];
  storage.setItem = () => { throw new Error('quota'); };
  const api = engine(storage);
  expectCode(() => api.apply(snapshot({ [MATH]: state({ completed: ['prime'] }) })), 'WRITE_FAILED');
  assert.deepEqual([...storage.values], original);
});

test('mid-transaction quota failure restores exact original strings in reverse order', () => {
  const mathRaw = '{"completed":["prime"], "scores":{}, "last":null}';
  const pyRaw = '{ "completed":[], "scores":{}, "last":null }';
  const storage = memory({ [MATH]: mathRaw, [pyKey(1)]: pyRaw, [THEME]: 'forest', unrelated: 'stay' });
  const original = [...storage.values], set = storage.setItem;
  storage.setItem = function (key, value) { if (key === pyKey(2)) throw new Error('quota'); set.call(this, key, value); };
  const incoming = snapshot({ [MATH]: state({ completed: ['factorization'] }), [pyKey(1)]: state({ completed: ['python-l001'] }), [pyKey(2)]: state({ completed: ['python-l006'] }) }, { theme: 'ink' });
  expectCode(() => engine(storage).apply(incoming, storage, { includeTheme: true }), 'WRITE_FAILED');
  assert.deepEqual([...storage.values], original);
  assert.deepEqual(mutations(storage).map(call => call[1]), [MATH, pyKey(1), pyKey(1), MATH]);
  assert.equal(storage.values.get(MATH), mathRaw);
});

test('rollback removes newly created records when a later theme write fails', () => {
  const storage = memory({ [THEME]: 'forest' }), set = storage.setItem;
  storage.setItem = function (key, value) { if (key === THEME) throw new Error('quota'); set.call(this, key, value); };
  expectCode(() => engine(storage).apply(snapshot({ [MATH]: state({ completed: ['prime'] }), [pyKey(1)]: state({ completed: ['python-l001'] }), [ALGORITHMS]: state({ completed: ['algorithms-l001'] }) }, { theme: 'ink' }), storage, { includeTheme: true }), 'WRITE_FAILED');
  assert.deepEqual([...storage.values], [[THEME, 'forest']]);
  assert.deepEqual(mutations(storage).slice(-3), [['remove', ALGORITHMS], ['remove', pyKey(1)], ['remove', MATH]]);
});

test('rollback failures are distinguished and remaining originals still get restored', () => {
  const storage = memory({ [MATH]: '{}', [THEME]: 'forest' }), set = storage.setItem;
  storage.setItem = function (key, value) { if (key === THEME) throw new Error('quota'); set.call(this, key, value); };
  storage.removeItem = () => { throw new Error('remove denied'); };
  expectCode(() => engine(storage).apply(snapshot({ [MATH]: state({ completed: ['prime'] }), [pyKey(1)]: state({ completed: ['python-l001'] }) }, { theme: 'ink' }), storage, { includeTheme: true }), 'ROLLBACK_FAILED');
  assert.equal(storage.values.get(MATH), '{}');
  assert.equal(storage.values.has(pyKey(1)), true);
  assert.equal(storage.values.get(THEME), 'forest');
});

test('invalid imports never read or write localStorage and do not modify the supplied snapshot', () => {
  const storage = memory(), api = engine(storage);
  expectCode(() => api.apply(snapshot({ [MATH]: state({ completed: ['evil'] }) })), 'INVALID_DATA');
  assert.equal(storage.calls.length, 0);
  const incoming = snapshot({ [MATH]: state({ completed: ['prime', 'prime'], scores: { prime: score(3) } }) }, { theme: 'ink' });
  const before = JSON.stringify(incoming);
  api.apply(incoming);
  api.encode(incoming);
  assert.equal(JSON.stringify(incoming), before);
});
