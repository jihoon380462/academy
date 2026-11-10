// Manual device transfer: no account, network request, or shared server storage.
(() => {
  'use strict';
  const engine = () => window.AcademyProgressTransfer;
  const themeNames = {light:'여백의 교과서',forest:'딥 포레스트',midnight:'미드나이트 블루',charcoal:'웜 차콜',matte:'매트 블랙',glass:'블랙 글래스',ink:'먹빛 서재'};

  function render() {
    return `<section id="progress-transfer" aria-labelledby="transfer-title">
      <div class="settings-section-head"><div><h2 id="transfer-title">학습 기록 옮기기</h2><p>PC와 모바일 사이에 읽음·점수·이어 배우기 기록을 옮깁니다.<br>새로 공부한 뒤에는 최신 기록을 다시 옮겨 주세요.</p></div><a class="text-link" href="#/progress">내 학습 보기 →</a></div>
      <div class="transfer-grid">
        <section class="transfer-card" aria-labelledby="transfer-export-title"><span class="eyebrow">1 · 이 기기에서</span><h3 id="transfer-export-title">기록 내보내기</h3><p>파일을 저장하거나 복사 코드를 만들어 다른 기기로 보내세요. 학습 기록과 화면 테마가 담깁니다.</p>
          <div class="transfer-actions"><button class="btn" type="button" data-transfer-download>파일로 저장</button><button class="btn" type="button" data-transfer-code>복사 코드 만들기</button></div>
          <div data-transfer-export hidden><label for="transfer-export-code">다른 기기로 보낼 복사 코드</label><textarea id="transfer-export-code" rows="4" readonly spellcheck="false" aria-describedby="transfer-export-help"></textarea><p id="transfer-export-help">복사가 안 되면 코드 전체를 직접 선택해 복사하세요.</p></div>
        </section>
        <section class="transfer-card" aria-labelledby="transfer-import-title"><span class="eyebrow">2 · 다른 기기에서</span><h3 id="transfer-import-title">기록 가져오기</h3><p>이 설정 화면에서 받은 파일을 선택하거나 복사 코드를 붙여 넣으세요. 확인 전에는 기록이 바뀌지 않습니다.</p>
          <label for="transfer-file">학습 기록 파일</label><input id="transfer-file" type="file" accept=".json,.txt,application/json,text/plain" aria-describedby="transfer-status">
          <div class="transfer-or">또는</div><label for="transfer-import-code">복사 코드 또는 기록 JSON</label><textarea id="transfer-import-code" rows="4" spellcheck="false" autocapitalize="off" autocorrect="off" placeholder="ACADEMY1.로 시작하는 코드를 붙여 넣으세요." aria-describedby="transfer-status"></textarea>
          <button class="btn" type="button" data-transfer-preview>가져올 기록 확인</button>
        </section>
      </div>
      <section class="transfer-preview" data-transfer-preview-panel hidden aria-labelledby="transfer-preview-title"><h3 id="transfer-preview-title" tabindex="-1">가져올 기록을 확인해 주세요.</h3><p data-transfer-summary></p><p>기존 읽음과 합치고 최고 점수는 높은 쪽을 유지합니다. 최근 점수와 이어 배우기는 더 최근 기록을 따릅니다.</p><p>읽음 취소는 옮겨지지 않으며, 예전 기록을 가져오면 다시 읽음으로 표시될 수 있어요.</p>
        <label class="transfer-theme"><input id="transfer-include-theme" type="checkbox"> <span>화면 테마도 가져오기 <strong data-transfer-theme></strong></span></label>
        <div class="transfer-actions"><button class="btn primary" type="button" data-transfer-confirm>기존 기록과 합쳐 가져오기</button><button class="btn" type="button" data-transfer-cancel>취소</button></div>
      </section>
      <p id="transfer-status" class="transfer-status" data-transfer-status role="status" aria-live="polite" tabindex="-1"></p>
      <p class="theme-storage">기록은 이 브라우저에 저장됩니다. 파일·코드는 서버로 전송하지 않으며, 기기 간 자동 동기화는 하지 않습니다.</p>
    </section>`;
  }

  function bind({onImported = () => {}} = {}) {
    const root = document.getElementById('progress-transfer');
    if (!root) return;
    const find = selector => root.querySelector(selector);
    const status = find('[data-transfer-status]'), panel = find('[data-transfer-preview-panel]');
    const input = find('#transfer-import-code'), fileInput = find('#transfer-file'), theme = find('#transfer-include-theme');
    let pending = null, revision = 0, copyRequest = 0;
    function announce(message, error = false, focus = false) {
      status.textContent = message;
      status.dataset.error = String(error);
      if (focus) status.focus();
    }
    function invalidate() {
      revision++;
      copyRequest++;
      pending = null;
      panel.hidden = true;
      theme.checked = false;
      input.removeAttribute('aria-invalid');
      fileInput.removeAttribute('aria-invalid');
    }
    function showPreview(text, source) {
      try {
        pending = engine().parse(text);
        const s = engine().summary(pending);
        const date = new Date(s.exportedAt).toLocaleString('ko-KR', {timeZone:'Asia/Seoul'});
        find('[data-transfer-summary]').textContent = `읽음 ${s.completed} / ${s.total}개 · 수학 ${s.mathCompleted}개 · 파이썬 ${s.pythonCompleted}개 · 알고리즘·자료구조 ${s.algorithmsCompleted}개 · 점수 기록 ${s.scoreCount}개 · 내보낸 시각 ${date} (한국 시간)`;
        theme.checked = false;
        theme.disabled = !pending.theme;
        find('[data-transfer-theme]').textContent = pending.theme ? `(${themeNames[pending.theme]})` : '(포함되지 않음)';
        panel.hidden = false;
        announce('아직 저장하지 않았어요. 내용을 확인하고 가져오기를 눌러 주세요.');
        find('#transfer-preview-title').focus();
      } catch (error) {
        pending = null;
        panel.hidden = true;
        source.setAttribute('aria-invalid', 'true');
        announce(error.message || '기록을 읽을 수 없어요. 파일이나 코드를 다시 확인해 주세요.', true, true);
      }
    }
    input.addEventListener('input', () => { invalidate(); fileInput.value = ''; announce('코드를 수정했어요. 가져올 기록을 다시 확인해 주세요.'); });
    fileInput.addEventListener('change', async () => {
      invalidate();
      input.value = '';
      const file = fileInput.files[0], token = revision;
      if (!file) { announce('파일을 선택하거나 코드를 붙여 넣어 주세요.'); return; }
      if (file.size > engine().MAX_BYTES) { fileInput.setAttribute('aria-invalid','true'); announce('기록 파일은 1MB 이하만 가져올 수 있어요.', true, true); return; }
      announce('파일을 읽고 있어요.');
      try {
        const text = await file.text();
        if (token === revision && root.isConnected) showPreview(text, fileInput);
      } catch {
        if (token === revision && root.isConnected) announce('파일을 읽지 못했어요. 파일을 다시 선택하거나 복사 코드를 이용해 주세요.', true, true);
      }
      // Clearing the file control permits selecting the same file again.
      if (token === revision) fileInput.value = '';
    });
    find('[data-transfer-preview]').addEventListener('click', () => { invalidate(); showPreview(input.value, input); });
    find('[data-transfer-cancel]').addEventListener('click', () => { invalidate(); announce('가져오기를 취소했어요. 기존 기록은 그대로입니다.'); input.focus(); });
    find('[data-transfer-confirm]').addEventListener('click', () => {
      if (!pending) return;
      copyRequest++;
      let result;
      try { result = engine().apply(pending, localStorage, {includeTheme:theme.checked}); }
      catch (error) { announce(error.message || '기록을 저장하지 못했어요. 브라우저 저장 설정을 확인해 주세요.', true, true); return; }
      onImported(result);
      invalidate();
      input.value = '';
      announce(`기록을 가져왔어요. 읽음 ${result.addedCompleted}개를 새로 추가했습니다. 내 학습에서 이어서 공부하세요.`, false, true);
    });
    find('[data-transfer-download]').addEventListener('click', () => {
      copyRequest++;
      let href;
      try {
        const snapshot = engine().capture(localStorage);
        href = URL.createObjectURL(new Blob([JSON.stringify(snapshot, null, 2)+'\n'], {type:'application/json;charset=utf-8'}));
        const a = document.createElement('a');
        a.href = href;
        a.download = 'academy-progress-'+snapshot.exportedAt.slice(0,10)+'.json';
        root.append(a); a.click(); a.remove();
        announce('기록 파일 다운로드를 시작했어요. 다른 기기에서 이 파일을 가져와 주세요.');
      } catch (error) { announce(error.message || '기록 파일을 만들지 못했어요. 브라우저 저장 설정을 확인해 주세요.', true, true); }
      finally { if (href) setTimeout(() => URL.revokeObjectURL(href), 30000); }
    });
    find('[data-transfer-code]').addEventListener('click', async () => {
      const request = ++copyRequest;
      let code;
      try { code = engine().encode(engine().capture(localStorage)); }
      catch (error) { announce(error.message || '복사 코드를 만들지 못했어요. 브라우저 저장 설정을 확인해 주세요.', true, true); return; }
      find('[data-transfer-export]').hidden = false;
      const output = find('#transfer-export-code');
      output.value = code;
      output.focus(); output.select();
      try {
        await navigator.clipboard.writeText(code);
        if (root.isConnected && request === copyRequest) announce('복사 코드를 복사했어요. 다른 기기의 설정에서 붙여 넣어 주세요.');
      } catch { if (root.isConnected && request === copyRequest) announce('복사 코드를 만들었어요. 코드 전체를 직접 선택해 복사해 주세요.'); }
    });
  }
  window.AcademyProgressUI = Object.freeze({render, bind});
})();
