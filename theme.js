// Runs before styles paint. Theme preferences are separate from learning records.
(() => {
  'use strict';
  const STORE = 'academy-theme-v1';
  const themes = [
    { id:'light', name:'여백의 교과서', number:'기본', description:'아이보리 종이와 포레스트 포인트의 밝은 화면.', paper:'#f7f6ef', surface:'#ecefe3', ink:'#273e32', accent:'#31553e' },
    { id:'forest', name:'딥 포레스트', number:'01', description:'깊은 초록과 부드러운 세이지.', paper:'#111b18', surface:'#203328', ink:'#e1e9dd', accent:'#a6c495' },
    { id:'midnight', name:'미드나이트 블루', number:'02', description:'잉크빛 네이비와 또렷한 블루.', paper:'#10151f', surface:'#202d43', ink:'#e4eaf4', accent:'#8fb9f4' },
    { id:'charcoal', name:'웜 차콜', number:'03', description:'따뜻한 차콜과 은은한 샌드.', paper:'#1c1a17', surface:'#333029', ink:'#eee5d5', accent:'#d9bc83' },
    { id:'matte', name:'매트 블랙', number:'04', description:'무채색 블랙과 간결한 글꼴.', paper:'#0e0e10', surface:'#242428', ink:'#f0f0f2', accent:'#e6e6eb' },
    { id:'glass', name:'블랙 글래스', number:'05', description:'깊은 블랙, 블루 포인트와 부드러운 패널.', paper:'#08090b', surface:'#1d2129', ink:'#edf0f6', accent:'#91b5ff' },
    { id:'ink', name:'먹빛 서재', number:'06', description:'먹 번짐과 종이 질감, 차분한 명조 제목.', paper:'#10110f', surface:'#282923', ink:'#e6dfcf', accent:'#c9c9b4' }
  ];
  const find = id => themes.find(theme => theme.id === id) || themes[0];
  let current = 'light';
  let storageOK = true;
  try { current = find(localStorage.getItem(STORE)).id; }
  catch { storageOK = false; }

  function apply(id) {
    const theme = find(id);
    current = theme.id;
    document.documentElement.dataset.theme = current;
    document.documentElement.style.colorScheme = current === 'light' ? 'light' : 'dark';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.paper);
  }
  apply(current);

  function statusText() {
    return storageOK ? '선택한 테마는 이 브라우저에 자동 저장됩니다. 다른 기기로 옮길 때 화면 테마도 함께 가져올 수 있습니다.' : '이 브라우저에서 설정을 저장할 수 없어, 현재 열린 화면에만 적용됩니다.';
  }
  function syncControls(announce = false) {
    const root = document.getElementById('theme-settings');
    if (!root) return;
    root.querySelectorAll('input[name="academy-theme"]').forEach(input => { input.checked = input.value === current; });
    root.querySelector('[data-theme-current]').textContent = find(current).name;
    root.querySelector('[data-theme-storage]').textContent = statusText();
    root.querySelector('[data-theme-status]').textContent = announce ? find(current).name + ' 테마를 적용했어요.' : '';
  }
  function choose(id) {
    apply(id);
    try { localStorage.setItem(STORE, current); storageOK = true; }
    catch { storageOK = false; }
    syncControls(true);
  }
  function card(theme) {
    const modern = theme.id === 'matte' || theme.id === 'glass';
    return `<div class="theme-choice${theme.id === 'light' ? ' theme-choice-light' : ''}">
      <input class="theme-radio" type="radio" name="academy-theme" id="theme-${theme.id}" value="${theme.id}" ${current === theme.id ? 'checked' : ''} aria-labelledby="theme-name-${theme.id}" aria-describedby="theme-description-${theme.id}">
      <label class="theme-card" for="theme-${theme.id}">
        <span class="theme-mini ${modern ? 'theme-mini-modern' : ''} theme-mini-${theme.id}" aria-hidden="true" style="--mini-paper:${theme.paper};--mini-surface:${theme.surface};--mini-ink:${theme.ink};--mini-accent:${theme.accent}">
          <span class="theme-mini-bar"><span>Academy</span><i></i><i></i></span>
          <span class="theme-mini-body"><span class="theme-mini-copy"><span class="theme-mini-caption">작은 이해의 시작</span><strong>개념을 읽고,<br>원리를 연결해요.</strong><span class="theme-mini-line"></span></span><span class="theme-mini-code"><span>print(2 + 3)</span><b>5</b></span></span>
        </span>
        <span class="theme-card-copy"><span class="theme-card-top"><span class="theme-card-number">${theme.number}</span><strong id="theme-name-${theme.id}">${theme.name}</strong><span class="theme-check" aria-hidden="true">✓</span></span><span class="theme-card-description" id="theme-description-${theme.id}">${theme.description}</span></span>
      </label>
    </div>`;
  }
  function render(extra = '') {
    return `<main id="main" class="wrap settings-page"><div class="page-title"><div class="crumb"><a href="#/">학습 분야</a> / 설정</div><div class="eyebrow">MAKE ROOM FOR LEARNING</div><h1>설정</h1><p>학습 기록을 옮기고, 읽기 편한 화면을 골라 보세요.</p></div>
      ${extra}<section id="theme-settings" aria-labelledby="theme-settings-title"><div class="settings-section-head"><div><h2 id="theme-settings-title">화면 테마</h2><p>카드를 선택하면 사이트 전체에 바로 적용됩니다.</p></div><p class="theme-current">사용 중 <strong data-theme-current>${find(current).name}</strong></p></div>
      <fieldset class="theme-grid"><legend class="sr-only">화면 테마 선택</legend>${themes.map(card).join('')}</fieldset>
      <p class="theme-storage" data-theme-storage>${statusText()}</p><p class="sr-only" data-theme-status role="status" aria-live="polite"></p></section>
    </main>`;
  }
  function bind() {
    const root = document.getElementById('theme-settings');
    if (!root) return;
    root.addEventListener('change', event => {
      if (event.target.matches('input[name="academy-theme"]') && event.target.checked) choose(event.target.value);
    });
  }
  window.addEventListener('storage', event => {
    if (event.key !== STORE && event.key !== null) return;
    apply(event.key === null ? 'light' : event.newValue);
    syncControls(true);
  });
  function refresh() {
    try { apply(localStorage.getItem(STORE)); storageOK = true; }
    catch { storageOK = false; }
    syncControls();
  }
  window.AcademyTheme = Object.freeze({ render, bind, refresh });
})();
