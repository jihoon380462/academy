// Manual, account-free transfer. Load after the available subject content bundles.
(() => {
  'use strict';

  const MAX_BYTES = 1024 * 1024;
  const MAX_TIME = 8640000000000000;
  const FORMAT = 'academy-progress';
  const PREFIX = 'ACADEMY1.';
  const MATH_KEY = 'understand-math-grade1-v1';
  const THEME_KEY = 'academy-theme-v1';
  const THEMES = new Set(['light', 'forest', 'midnight', 'charcoal', 'matte', 'glass', 'ink']);
  const courses = new Map([[MATH_KEY, window.CURRICULUM.lessons.map(lesson => lesson.id)]]);
  for (const course of window.PYTHON_COURSES) {
    courses.set('academy-python-' + (course.slug || course.id.replace('python-', '')) + '-v1', course.lessons.map(lesson => lesson.id));
  }
  for (const course of window.ALGORITHMS_COURSES || []) {
    courses.set('academy-algorithms-' + (course.slug || course.id.replace('algorithms-', '')) + '-v1', course.lessons.map(lesson => lesson.id));
  }
  for (const course of window.CS_COURSES || []) {
    courses.set('academy-cs-' + (course.slug || course.id.replace('cs-', '')) + '-v1', course.lessons.map(lesson => lesson.id));
  }
  const total = [...courses.values()].reduce((count, ids) => count + ids.length, 0);
  const encoder = new TextEncoder();
  const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

  function fail(message, code = 'INVALID_DATA') {
    const error = new Error(message);
    error.code = code;
    throw error;
  }

  function invalid() {
    fail('기록의 형식이나 값이 올바르지 않아요. Academy에서 내보낸 파일이나 코드를 확인해 주세요.');
  }

  // Accept ordinary objects (including another realm), never custom prototypes.
  function isObject(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === null || (Object.getPrototypeOf(prototype) === null &&
      Object.getOwnPropertyDescriptor(prototype, 'constructor')?.value?.name === 'Object');
  }

  function fields(value, allowed, required = []) {
    if (!isObject(value)) invalid();
    for (const key of Reflect.ownKeys(value)) {
      if (typeof key !== 'string' || !allowed.has(key) || !own(Object.getOwnPropertyDescriptor(value, key), 'value')) invalid();
    }
    if (required.some(key => !own(value, key))) invalid();
  }

  function validTime(value) {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= MAX_TIME;
  }

  function validDate(value, allowEmpty = true) {
    if (typeof value !== 'string' || value.length > 35) return false;
    if (value === '') return allowEmpty;
    const parts = /^(\d{4}|[+-]\d{6})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/.exec(value);
    if (!parts) return false;
    const [, yearText, monthText, dayText, hourText, minuteText, secondText, zone] = parts;
    const year = Number(yearText), month = Number(monthText), day = Number(dayText);
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (month < 1 || month > 12 || day < 1 || day > days[month - 1] || Number(hourText) > 23 || Number(minuteText) > 59 || Number(secondText) > 59) return false;
    if (zone !== 'Z' && (Number(zone.slice(1, 3)) > 23 || Number(zone.slice(4)) > 59)) return false;
    return validTime(Date.parse(value));
  }

  function emptyState() {
    return { completed: [], scores: {}, last: null, visitedAt: 0 };
  }

  function normalizeState(value, ids, strict) {
    if (strict) fields(value, new Set(['completed', 'scores', 'last', 'visitedAt']));
    else if (!isObject(value)) return emptyState();
    const result = emptyState(), allowed = new Set(ids);
    if (own(value, 'completed')) {
      if (strict && (!Array.isArray(value.completed) || value.completed.length > ids.length)) invalid();
      if (Array.isArray(value.completed)) {
        if (strict) {
          if (Reflect.ownKeys(value.completed).length !== value.completed.length + 1) invalid();
          for (let index = 0; index < value.completed.length; index++) {
            const item = Object.getOwnPropertyDescriptor(value.completed, String(index));
            if (!item || !own(item, 'value') || typeof item.value !== 'string' || !allowed.has(item.value)) invalid();
          }
        }
        const completed = new Set(value.completed.filter(id => typeof id === 'string' && allowed.has(id)));
        result.completed = ids.filter(id => completed.has(id));
      }
    }
    if (own(value, 'last')) {
      if (strict && value.last !== null && !allowed.has(value.last)) invalid();
      if (allowed.has(value.last)) result.last = value.last;
    }
    if (own(value, 'visitedAt')) {
      if (strict && !validTime(value.visitedAt)) invalid();
      if (validTime(value.visitedAt)) result.visitedAt = value.visitedAt;
    }
    if (own(value, 'scores')) {
      if (strict) fields(value.scores, new Set([...ids, 'review']));
      if (isObject(value.scores)) {
        for (const id of [...ids, 'review']) {
          if (!own(value.scores, id)) continue;
          const score = value.scores[id], max = id === 'review' ? 10 : 5;
          if (strict) fields(score, new Set(['latest', 'best', 'date']), ['latest', 'best']);
          if (!isObject(score)) continue;
          const valid = Number.isInteger(score.latest) && Number.isInteger(score.best) &&
            score.latest >= 0 && score.latest <= max && score.best >= score.latest && score.best <= max;
          if (strict && (!valid || (own(score, 'date') && !validDate(score.date)))) invalid();
          if (valid) result.scores[id] = { latest: score.latest, best: score.best, date: validDate(score.date) ? score.date : '' };
        }
      }
    }
    // A timestamp without a lesson cannot select a recent lesson during merging.
    if (result.last === null) result.visitedAt = 0;
    return result;
  }

  function normalizeSnapshot(snapshot) {
    fields(snapshot, new Set(['format', 'version', 'exportedAt', 'records', 'theme']), ['format', 'version', 'exportedAt', 'records']);
    if (snapshot.format !== FORMAT) invalid();
    if (snapshot.version !== 1) fail('지원하지 않는 기록 버전이에요. 같은 버전의 Academy에서 내보낸 기록을 사용해 주세요.', 'UNSUPPORTED_VERSION');
    if (!validDate(snapshot.exportedAt, false)) invalid();
    fields(snapshot.records, new Set(courses.keys()));
    if (own(snapshot, 'theme') && !THEMES.has(snapshot.theme)) invalid();
    const records = {};
    for (const [key, ids] of courses) {
      if (own(snapshot.records, key)) records[key] = normalizeState(snapshot.records[key], ids, true);
    }
    const clean = { format: FORMAT, version: 1, exportedAt: snapshot.exportedAt, records };
    if (own(snapshot, 'theme')) clean.theme = snapshot.theme;
    return clean;
  }

  function limitedBytes(text) {
    if (typeof text !== 'string') invalid();
    if (text.length > MAX_BYTES) fail('기록은 1 MiB 이하만 가져올 수 있어요.', 'TOO_LARGE');
    const bytes = encoder.encode(text);
    if (bytes.length > MAX_BYTES) fail('기록은 1 MiB 이하만 가져올 수 있어요.', 'TOO_LARGE');
    return bytes;
  }

  function toBase64(bytes) {
    let binary = '';
    for (let index = 0; index < bytes.length; index += 8192) {
      binary += String.fromCharCode(...bytes.subarray(index, index + 8192));
    }
    return btoa(binary);
  }

  function encode(snapshot) {
    const code = PREFIX + toBase64(limitedBytes(JSON.stringify(normalizeSnapshot(snapshot))));
    limitedBytes(code);
    return code;
  }

  function parse(text) {
    limitedBytes(text);
    let json = text.trim();
    if (json.startsWith(PREFIX)) {
      const encoded = json.slice(PREFIX.length);
      if (!encoded || encoded.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(encoded)) invalid();
      try {
        const binary = atob(encoded);
        const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
        if (bytes.length > MAX_BYTES || toBase64(bytes) !== encoded) invalid();
        json = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
      } catch {
        invalid();
      }
    }
    let snapshot;
    try { snapshot = JSON.parse(json); }
    catch { invalid(); }
    return normalizeSnapshot(snapshot);
  }

  function storageFor(storage) {
    try { return storage === undefined ? window.localStorage : storage; }
    catch { fail('브라우저의 학습 기록을 읽을 수 없어요. 저장 권한을 확인해 주세요.', 'READ_FAILED'); }
  }

  function readStorage(storage) {
    const originals = new Map(), records = {};
    try {
      for (const key of [...courses.keys(), THEME_KEY]) originals.set(key, storage.getItem(key));
    } catch {
      fail('브라우저의 학습 기록을 읽을 수 없어요. 저장 권한을 확인해 주세요.', 'READ_FAILED');
    }
    for (const [key, ids] of courses) {
      let saved;
      try { saved = JSON.parse(originals.get(key)); }
      catch { saved = null; }
      records[key] = normalizeState(saved, ids, false);
    }
    const theme = originals.get(THEME_KEY);
    return { originals, records, theme: THEMES.has(theme) ? theme : 'light' };
  }

  function capture(storage) {
    const current = readStorage(storageFor(storage));
    return { format: FORMAT, version: 1, exportedAt: new Date().toISOString(), records: current.records, theme: current.theme };
  }

  function summary(snapshot) {
    const clean = normalizeSnapshot(snapshot);
    let completed = 0, scoreCount = 0;
    for (const record of Object.values(clean.records)) {
      completed += record.completed.length;
      scoreCount += Object.keys(record.scores).length;
    }
    const mathCompleted = clean.records[MATH_KEY]?.completed.length || 0;
    const countSubject = prefix => Object.entries(clean.records).reduce((sum, [key, record]) => sum + (key.startsWith(prefix) ? record.completed.length : 0), 0);
    const pythonCompleted = countSubject('academy-python-');
    const algorithmsCompleted = countSubject('academy-algorithms-');
    const csCompleted = countSubject('academy-cs-');
    return { completed, total, mathCompleted, pythonCompleted, algorithmsCompleted, csCompleted, scoreCount, exportedAt: clean.exportedAt, theme: clean.theme };
  }

  function mergeState(local, incoming, ids) {
    const read = new Set([...local.completed, ...incoming.completed]);
    const merged = { completed: ids.filter(id => read.has(id)), scores: {}, last: local.last, visitedAt: local.visitedAt };
    for (const id of [...ids, 'review']) {
      const here = local.scores[id], there = incoming.scores[id];
      if (!here && !there) continue;
      const latest = !here ? there : !there ? here :
        (there.date ? Date.parse(there.date) : -Infinity) > (here.date ? Date.parse(here.date) : -Infinity) ? there : here;
      merged.scores[id] = { latest: latest.latest, best: Math.max(here?.best || 0, there?.best || 0), date: latest.date };
    }
    if (incoming.last !== null && (local.last === null || incoming.visitedAt > local.visitedAt)) {
      merged.last = incoming.last;
      merged.visitedAt = incoming.visitedAt;
    }
    return merged;
  }

  function apply(snapshot, storage, { includeTheme = false } = {}) {
    const incoming = normalizeSnapshot(snapshot);
    const target = storageFor(storage), current = readStorage(target), writes = [];
    let addedCompleted = 0;
    for (const [key, ids] of courses) {
      if (!own(incoming.records, key)) continue;
      const local = current.records[key], merged = mergeState(local, incoming.records[key], ids);
      addedCompleted += merged.completed.length - local.completed.length;
      // Compare normalized values: an empty/idempotent import need not rewrite storage.
      if (JSON.stringify(local) !== JSON.stringify(merged)) writes.push({ key, value: JSON.stringify(merged) });
      current.records[key] = merged;
    }
    const theme = includeTheme === true && own(incoming, 'theme') ? incoming.theme : current.theme;
    if (includeTheme === true && own(incoming, 'theme') && current.originals.get(THEME_KEY) !== theme) writes.push({ key: THEME_KEY, value: theme });
    const written = [];
    try {
      for (const change of writes) {
        target.setItem(change.key, change.value);
        written.push(change.key);
      }
    } catch {
      let incomplete = false;
      for (const key of written.reverse()) {
        try {
          const original = current.originals.get(key);
          if (original === null) target.removeItem(key);
          else target.setItem(key, original);
        } catch { incomplete = true; }
      }
      if (incomplete) fail('기록을 저장하지 못했고 일부 기록을 원래대로 복구하지 못했어요. 현재 기록을 확인하고 원본 파일을 보관해 주세요.', 'ROLLBACK_FAILED');
      fail('기록을 저장하지 못해 변경을 취소했어요. 브라우저의 저장 공간과 권한을 확인해 주세요.', 'WRITE_FAILED');
    }
    return { records: current.records, theme, addedCompleted };
  }

  window.AcademyProgressTransfer = Object.freeze({ MAX_BYTES, capture, encode, parse, summary, apply });
})();
