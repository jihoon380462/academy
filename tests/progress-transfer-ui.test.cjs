const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const source = fs.readFileSync(path.join(__dirname, '..', 'transfer-ui.js'), 'utf8');

// Exercise the real UI handlers; the engine has its own data/storage tests.
function ui({ importFails = false, total = 137 } = {}) {
  const elements = new Map(), copies = [], imported = [];
  function element(selector) {
    if (!elements.has(selector)) elements.set(selector, {
      textContent: '', value: '', hidden: false, checked: false, dataset: {},
      attributes: new Map(), listeners: new Map(), focused: false,
      addEventListener(type, handler) { this.listeners.set(type, handler); },
      setAttribute(name, value) { this.attributes.set(name, value); },
      removeAttribute(name) { this.attributes.delete(name); },
      focus() { this.focused = true; },
      select() {}
    });
    return elements.get(selector);
  }
  const root = { isConnected: true, querySelector: element };
  const engine = {
    capture() { return { sequence: copies.length }; },
    encode(snapshot) { return 'ACADEMY1.request-' + snapshot.sequence; },
    parse() { return { theme: 'light' }; },
    summary() {
      return { completed: 4, total, mathCompleted: 1, pythonCompleted: 0, algorithmsCompleted: 2, csCompleted: 1,
        scoreCount: 0, exportedAt: '2026-11-10T00:00:00.000Z' };
    },
    apply() {
      if (importFails) throw new Error('저장에 실패해 기존 기록을 복원했어요.');
      return { addedCompleted: 1 };
    }
  };
  const context = vm.createContext({
    window: { AcademyProgressTransfer: engine },
    document: { getElementById: id => id === 'progress-transfer' ? root : null },
    localStorage: {},
    navigator: { clipboard: { writeText(code) {
      return new Promise((resolve, reject) => copies.push({ code, resolve, reject }));
    } } }
  });
  vm.runInContext(source, context, { filename: 'transfer-ui.js' });
  context.window.AcademyProgressUI.bind({ onImported: result => imported.push(result) });
  const click = name => element('[data-transfer-' + name + ']').listeners.get('click')();
  return { element, click, copies, imported, status: element('[data-transfer-status]') };
}

test('late clipboard completion preserves the successful import announcement', async () => {
  const view = ui();
  view.click('preview');
  const copying = view.click('code');
  view.click('confirm');
  const message = view.status.textContent;
  assert.match(message, /기록을 가져왔어요/);
  assert.equal(view.imported.length, 1);
  assert.equal(view.element('[data-transfer-preview-panel]').hidden, true);
  view.copies[0].resolve();
  await copying;
  assert.equal(view.status.textContent, message);
  assert.equal(view.status.dataset.error, 'false');
  assert.equal(view.status.focused, true);
});

test('the preview identifies algorithms and CS separately and displays the engine supplied total', () => {
  // This handler fixture does not load the catalog; real totals belong to engine/browser tests.
  for (const [total, expected] of [
    [130, /읽음 4 \/ 130개 · 수학 1개 · 파이썬 0개 · 알고리즘·자료구조 2개 · CS 1개/],
    [132, /읽음 4 \/ 132개 · 수학 1개 · 파이썬 0개 · 알고리즘·자료구조 2개 · CS 1개/],
    [137, /읽음 4 \/ 137개 · 수학 1개 · 파이썬 0개 · 알고리즘·자료구조 2개 · CS 1개/]
  ]) {
    const view = ui({ total });
    view.click('preview');
    assert.match(view.element('[data-transfer-summary]').textContent, expected);
    assert.equal(view.imported.length, 0);
  }
});

test('late clipboard completion preserves an import failure and its retry preview', async () => {
  const view = ui({ importFails: true });
  view.click('preview');
  const copying = view.click('code');
  view.click('confirm');
  const message = view.status.textContent;
  assert.match(message, /저장에 실패/);
  view.copies[0].resolve();
  await copying;
  assert.equal(view.status.textContent, message);
  assert.equal(view.status.dataset.error, 'true');
  assert.equal(view.status.focused, true);
  assert.equal(view.imported.length, 0);
  assert.equal(view.element('[data-transfer-preview-panel]').hidden, false);
});

test('older copy requests cannot overwrite the latest copy success or failure', async () => {
  for (const latestSucceeds of [true, false]) {
    const view = ui();
    const first = view.click('code'), second = view.click('code');
    assert.notEqual(view.copies[0].code, view.copies[1].code);
    assert.equal(view.element('#transfer-export-code').value, view.copies[1].code);
    if (latestSucceeds) view.copies[1].resolve();
    else view.copies[1].reject(new Error('Clipboard unavailable'));
    await second;
    const message = view.status.textContent;
    assert.match(message, latestSucceeds ? /복사했어요/ : /직접 선택해 복사/);
    if (latestSucceeds) view.copies[0].reject(new Error('Older clipboard failure'));
    else view.copies[0].resolve();
    await first;
    assert.equal(view.status.textContent, message);
    assert.equal(view.element('#transfer-export-code').value, view.copies[1].code);
  }
});
