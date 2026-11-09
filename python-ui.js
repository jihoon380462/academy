// Presentation only. Python exercises are read here and solved on the learner's PC.
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pad = value => esc(String(value).padStart(2, '0'));
  const lessonList = ctx => ctx.course.lessons;
  const chapterContexts = ctx => Array.isArray(ctx.chapters) && ctx.chapters.length ? ctx.chapters : [ctx];
  const chapterNumber = ctx => Number(ctx.course.number) || Number(String(ctx.course.slug || ctx.course.id || '').match(/ch(\d+)$/)?.[1]) || 1;
  const chapterSlug = ctx => /^ch\d+$/.test(ctx.course.slug || '') ? ctx.course.slug : 'ch' + String(chapterNumber(ctx)).padStart(2, '0');
  const chapterPath = ctx => '#/python/' + encodeURIComponent(chapterSlug(ctx));
  const lessonPath = (id, ctx) => chapterPath(ctx) + '/lesson/' + encodeURIComponent(id);
  const reviewPath = ctx => chapterPath(ctx) + '/review';
  const lessonNumber = (l, ctx) => {
    const index = lessonList(ctx).findIndex(item => item.id === l.id);
    return index < 0 ? l.order : index + 1;
  };
  const isRead = (ctx, id) => ctx.state.completed.includes(id);
  const readCount = ctx => lessonList(ctx).filter(l => isRead(ctx, l.id)).length;
  const nextLesson = ctx => lessonList(ctx).find(l => l.id === ctx.state.last) || lessonList(ctx).find(l => !isRead(ctx, l.id)) || lessonList(ctx)[0];
  const description = ctx => ctx.course.description || '짧은 코드를 읽고, 결과를 예상하고, 직접 실행하며 원리를 이해합니다.';
  const prerequisite = ctx => {
    const value = ctx.course.prerequisite;
    if (!value) return chapterNumber(ctx) === 1 ? '선행 지식 없음' : '선행 학습: 챕터 ' + (chapterNumber(ctx) - 1);
    const match = String(value).match(/^python-ch(\d+)$/);
    return match ? '선행 학습: 챕터 ' + Number(match[1]) : String(value);
  };
  const summary = ctx => `<div class="chapter-stats py-course-stats"><div><b>${lessonList(ctx).length}</b><span>개념 레슨</span></div><div><b>${lessonList(ctx).reduce((total, l) => total + l.examples.length, 0)}</b><span>간단한 예제</span></div><div><b>${ctx.course.review.length}</b><span>챕터 복습</span></div></div>`;
  const readingBar = (count, total, label) => `<div class="mini-progress" role="progressbar" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${count}"><span style="--progress:${total ? 100 * count / total : 0}%"></span></div>`;
  const progressBar = ctx => readingBar(readCount(ctx), lessonList(ctx).length, '파이썬 챕터 ' + chapterNumber(ctx) + ' 읽음');

  function continueFrom(chapters) {
    const visited = chapters.filter(ctx => lessonList(ctx).some(l => l.id === ctx.state.last));
    if (visited.length) {
      const ctx = visited.reduce((recent, item) => Number(item.state.visitedAt || 0) > Number(recent.state.visitedAt || 0) ? item : recent);
      return { ctx, lesson: nextLesson(ctx), continuing: true };
    }
    const ctx = chapters.find(item => lessonList(item).some(l => !isRead(item, l.id))) || chapters[0];
    return { ctx, lesson: nextLesson(ctx), continuing: false };
  }

  function codeBlock(block) {
    if (!block || block.source === undefined) return '';
    const kind = block.kind === 'console' ? '터미널 / 대화형 화면' : block.kind === 'text' ? '텍스트' : 'Python 3';
    const hasOutput = Object.prototype.hasOwnProperty.call(block, 'output');
    const hasInput = Object.prototype.hasOwnProperty.call(block, 'input');
    const filePanels = (files, label, css) => Object.entries(files || {}).map(([name, source]) => `<div class="${css} py-code-file"><strong>${esc(label)} · ${esc(name)}</strong><pre tabindex="0" aria-label="${esc(label + ' ' + name)}"><code>${esc(source)}</code></pre></div>`).join('');
    const sourceLabel = block.filename ? '실행할 파일 · ' + block.filename : block.kind === 'python' || !block.kind ? '코드' : '입력과 화면 읽기';
    return `<figure class="py-code"><div class="py-code-head"><span class="py-code-label">${esc(sourceLabel)}</span><span class="py-code-kind">${esc(kind)}</span></div>${filePanels(block.files, '함께 둘 파일', 'py-code-input')}<pre class="py-code-source" tabindex="0" aria-label="${esc(kind)} 코드"><code>${esc(block.source)}</code></pre>${hasInput ? `<div class="py-code-input"><strong>예시 입력</strong><pre tabindex="0" aria-label="예시 입력"><code>${esc(block.input)}</code></pre></div>` : ''}${hasOutput ? `<div class="py-code-output"><strong>예상 출력</strong>${block.output === '' ? '<p>출력 없음</p>' : `<pre tabindex="0" aria-label="예상 출력"><code>${esc(block.output)}</code></pre>`}</div>` : ''}${filePanels(block.expectedFiles, '실행 후 파일', 'py-code-output')}${block.error ? `<div class="py-code-error"><strong>예상 오류</strong><code>${esc(block.error)}</code></div>` : ''}${block.caption ? `<figcaption class="py-code-caption">${esc(block.caption)}</figcaption>` : ''}</figure>`;
  }

  function row(l, ctx) {
    return `<a class="lesson-row py-lesson-row" href="${lessonPath(l.id, ctx)}"><span class="lesson-no">${pad(lessonNumber(l, ctx))}</span><div><strong>${esc(l.title)}</strong><p>${esc(l.subtitle)}</p></div><span class="lesson-state ${isRead(ctx, l.id) ? 'done' : ''}">${isRead(ctx, l.id) ? '✓ 읽음' : esc(l.minutes) + '분 · 예제 ' + l.examples.length + '개'}</span></a>`;
  }

  function home(ctx) {
    const chapters = chapterContexts(ctx), next = continueFrom(chapters);
    const total = chapters.reduce((sum, item) => sum + lessonList(item).length, 0);
    const read = chapters.reduce((sum, item) => sum + readCount(item), 0);
    const first = chapters[0], lastNumber = Math.max(...chapters.map(chapterNumber));
    return `<main id="main" class="wrap py-home"><div class="crumb subject-crumb"><a href="#/">학습 분야</a> / 파이썬</div>
      <section class="home-hero py-hero"><div><div class="eyebrow">PYTHON · THE FOUNDATIONS</div><h1>파이썬</h1><p class="subject-lead">한 줄을 읽고,<br>어떤 일이 일어나는지 이해해요.</p><p class="hero-copy">코드가 처음이어도 괜찮아요.<br>명령과 실행 결과의 관계부터 천천히 시작합니다.<br>파이썬 기초 · ${chapters.length}개 챕터 · ${total}개 레슨</p><div class="actions"><a class="btn primary" href="${lessonPath(next.lesson.id, next.ctx)}">${next.continuing ? '이어서 배우기' : '첫 레슨 시작하기'} <span>→</span></a><a class="text-link" href="${chapterPath(first)}">챕터 ${chapterNumber(first)} 목차 보기</a></div></div><div class="py-intro-card"><div class="eyebrow">FROM CODE TO RESULT</div>${codeBlock({source:'print("안녕하세요")\nprint(2 + 3)', kind:'python', output:'안녕하세요\n5', caption:'글자를 보여 주고, 계산한 값을 보여 줍니다. 코드와 결과를 나란히 읽는 것부터 시작해요.'})}</div></section>
      <div class="section-head"><div><div class="eyebrow">BUILD YOUR FOUNDATIONS</div><h2>개념을 연결하는 ${chapters.length}개 챕터.</h2></div><p>챕터를 누르면 레슨 목차가 펼쳐집니다.</p></div>
      ${chapters.map(item => `<details class="py-home-chapter"><summary class="chapter-banner py-chapter-toggle" aria-labelledby="py-home-${esc(chapterSlug(item))}"><div><div class="eyebrow">CHAPTER ${pad(chapterNumber(item))} · 학습 가능</div><h2 id="py-home-${esc(chapterSlug(item))}">${esc(item.course.title)}</h2><p>${esc(description(item))}</p></div><div class="py-chapter-overview">${summary(item)}<span class="py-chapter-disclosure" aria-hidden="true"><span class="py-disclosure-closed">목차 펼치기</span><span class="py-disclosure-open">목차 접기</span><span class="py-disclosure-chevron"></span></span></div></summary><div class="py-chapter-contents"><div class="actions py-chapter-actions"><a class="text-link" href="${chapterPath(item)}">챕터 ${chapterNumber(item)} 전체 목차 ↗</a><a class="text-link" href="${reviewPath(item)}">챕터 ${chapterNumber(item)} 복습 ${item.course.review.length}문제 ↗</a></div><div class="py-lesson-list">${lessonList(item).map(l => row(l, item)).join('')}</div></div></details>`).join('')}
      <p class="py-reading-note">예제와 복습 문제를 읽고 PC에서 직접 코드를 작성해 보세요. 파일 저장과 실행 방법은 <a href="#/python/ch01/lesson/python-l002">챕터 1의 레슨 2</a>에서 안내합니다.</p>
      <section class="home-bottom"><div><div class="eyebrow">YOUR READING</div><h3>조금씩 읽고, 이해를 남겨요.</h3><p>파이썬 · ${read} / ${total} 레슨 읽음<br>읽음 표시를 남기고 마지막 레슨에서 이어갈 수 있어요.</p>${readingBar(read, total, '파이썬 전체 읽음')}<a class="text-link" href="#/progress">내 학습 기록 →</a></div><div><div class="eyebrow">CHAPTER REVIEW</div><h3>다시 볼 때는 핵심부터.</h3><p>챕터마다 핵심 정리를 되짚고<br>열 문제로 배운 원리를 직접 적용해 보세요.</p><div class="actions">${chapters.map(item => `<a class="text-link" href="${reviewPath(item)}">챕터 ${chapterNumber(item)} 복습 →</a>`).join('')}</div></div></section>
      ${chapters.length === 9 && lastNumber === 9 ? '<aside class="py-course-note"><span class="status-badge">기초 과정 구성 완료</span><p>9개 챕터에서 배운 원리를 연결하고, 필요한 레슨과 복습으로 돌아가 직접 작성한 코드를 확인해 보세요.</p></aside>' : `<aside class="py-course-note"><span class="status-badge">다음 챕터 준비 중</span><p>현재 공개된 ${chapters.length}개 챕터를 학습할 수 있습니다. 챕터 ${lastNumber + 1}부터는 순차적으로 준비합니다.</p></aside>`}</main>`;
  }

  function chapter(ctx) {
    const number = chapterNumber(ctx);
    return `<main id="main" class="wrap py-chapter"><div class="page-title"><div class="crumb"><a href="#/">학습 분야</a> / <a href="#/subjects/python">파이썬</a> / 챕터 ${number}</div><div class="eyebrow">CHAPTER ${pad(number)} · PYTHON FOUNDATIONS</div><h1>${esc(ctx.course.title)}</h1><p>${esc(description(ctx))}</p></div>
      <section class="chapter-banner"><div><h2>챕터 ${number} · ${lessonList(ctx).length}개 레슨</h2><p>${esc(prerequisite(ctx))} · Python 3<br>${readCount(ctx)} / ${lessonList(ctx).length} 레슨 읽음</p></div>${summary(ctx)}</section><div class="section-head"><div><div class="eyebrow">THE CONTENTS</div><h2>한 가지 원리씩 차근차근.</h2></div><p>레슨마다 개념 설명과 예제 5문제</p></div><div class="py-lesson-list">${lessonList(ctx).map(l => row(l, ctx)).join('')}</div>
      <aside class="py-reading-note"><strong>학습 환경 · Python 3</strong><br>문제는 각 레슨과 복습 페이지에 순서대로 나열되어 있습니다. PC에서 직접 코드를 작성하고 실행해 보세요. 파일 저장과 실행 방법은 <a href="#/python/ch01/lesson/python-l002">챕터 1의 레슨 2</a>에서 안내합니다.</aside>
      <section class="review-band"><div><div class="eyebrow">CHAPTER ${pad(number)} REVIEW</div><h2>배운 개념을, ${ctx.course.review.length}문제로.</h2><p>핵심 정리를 읽고 직접 코드를 작성하며 다시 확인해요.</p></div><a class="btn primary" href="${reviewPath(ctx)}">챕터 복습 시작 <span>→</span></a></section><aside class="py-course-note"><h2>직접 실행해 보고 싶다면</h2><p><a href="#/python/ch01/lesson/python-l002">챕터 1의 레슨 2</a>에서 코드 파일을 저장하고 실행하는 순서를 안내합니다.<br>필요할 때 공식 자료를 함께 확인하세요.</p><div class="actions"><a class="text-link" href="https://www.python.org/downloads/" target="_blank" rel="noopener noreferrer">Python 공식 다운로드 ↗</a><a class="text-link" href="https://docs.python.org/3/tutorial/" target="_blank" rel="noopener noreferrer">Python 공식 튜토리얼 ↗</a></div></aside></main>`;
  }

  function sidebar(l, ctx) {
    return `<aside class="lesson-sidebar py-sidebar" aria-label="파이썬 챕터 ${chapterNumber(ctx)} 목차"><a class="eyebrow" href="#/subjects/python">파이썬 / CHAPTER ${pad(chapterNumber(ctx))}</a><h2>${esc(ctx.course.title)}</h2><nav class="py-sidebar-links" aria-label="챕터 레슨">${lessonList(ctx).map(item => `<a href="${lessonPath(item.id, ctx)}" data-py-lesson="${esc(item.id)}" ${item.id === l.id ? 'class="current" aria-current="page"' : ''}>${isRead(ctx, item.id) ? '✓ ' : ''}${pad(lessonNumber(item, ctx))} ${esc(item.title)}</a>`).join('')}</nav><a class="side-review" href="${reviewPath(ctx)}">↗ 챕터 복습 · ${ctx.course.review.length}문제</a><a class="eyebrow" href="${chapterPath(ctx)}">챕터 목차 보기</a></aside>`;
  }

  function lesson(l, ctx) {
    const items = lessonList(ctx), index = items.findIndex(item => item.id === l.id), prev = items[index - 1], next = items[index + 1], number = chapterNumber(ctx);
    return `<div class="lesson-shell py-lesson-shell">${sidebar(l, ctx)}<main id="main" class="article py-article"><div class="mobile-contents"><span>파이썬 · 챕터 ${number}</span><a href="${chapterPath(ctx)}">전체 목차 ↗</a></div><div class="crumb"><a href="#/subjects/python">파이썬</a> / <a href="${chapterPath(ctx)}">챕터 ${number}</a> / 레슨 ${pad(index + 1)}</div><header class="lesson-heading"><div class="eyebrow">LESSON ${pad(index + 1)} / ${items.length} · PYTHON 3</div><h1>${esc(l.title)}</h1><p class="subtitle">${esc(l.subtitle)}</p><div class="lesson-meta"><span>개념 읽기 약 ${esc(l.minutes)}분</span><span>예제 ${l.examples.length}문제</span><span class="py-read-state" data-py-read-status>${isRead(ctx, l.id) ? '✓ 읽음 표시됨' : '천천히 이해해도 괜찮아요'}</span></div></header><nav class="lesson-tabs" aria-label="이 레슨에서"><a href="${lessonPath(l.id, ctx)}" data-scroll="concept">01 개념 이해</a><a href="${lessonPath(l.id, ctx)}" data-scroll="worked">02 작동 예시</a><a href="${lessonPath(l.id, ctx)}" data-scroll="practice">03 예제 ${l.examples.length}문제</a></nav>
      <section id="concept"><aside class="py-goal"><strong>이 레슨의 목표</strong><p>${esc(l.goal)}</p></aside><p class="intro-text">${esc(l.intro)}</p>${l.sections.map((section, i) => `<section class="concept-step"><h2><span>${pad(i + 1)}.</span>${esc(section.title)}</h2>${section.body.map(p => `<p>${esc(p)}</p>`).join('')}${codeBlock(section.code)}</section>`).join('')}</section><section class="worked" id="worked"><div class="eyebrow">READ THE CODE, FOLLOW THE REASON</div><h2>코드와 결과를 연결해 볼까요?</h2><p class="question">${esc(l.worked.question)}</p>${codeBlock(l.worked.code)}<ol>${l.worked.steps.map(step => `<li>${esc(step)}</li>`).join('')}</ol><div class="answer">${esc(l.worked.answer)}</div></section><details class="misconception"><summary>${esc(l.misconception.question)}</summary><p>${esc(l.misconception.answer)}</p></details><section class="keypoints"><h2>이 레슨에서 가져갈 세 가지</h2><ul>${l.keypoints.map(point => `<li>${esc(point)}</li>`).join('')}</ul></section>
      <section class="py-practice" id="practice"><div class="eyebrow">PUT IT INTO PRACTICE</div><h2>직접 풀어 보는 ${l.examples.length}문제</h2><p class="py-practice-note">PC에서 코드를 직접 입력하고 실행해 보세요. 풀어 본 뒤 각 문제의 예시 답과 해설을 펼쳐 비교할 수 있습니다.</p>${problemList(l.examples, '예제', ctx, 'practice')}</section><div class="finish"><button class="btn" data-py-complete="${esc(l.id)}">${isRead(ctx, l.id) ? '✓ 읽음 표시됨 · 취소하기' : '이 레슨 읽음 표시하기'}</button><p>개념을 읽었다면 표시를 남겨 두세요.<br>문제는 자신의 속도에 맞춰 풀면 됩니다.</p></div><nav class="lesson-nav" aria-label="이전 다음 레슨">${prev ? `<a href="${lessonPath(prev.id, ctx)}"><small>← 이전 레슨</small>${esc(prev.title)}</a>` : `<a href="${chapterPath(ctx)}"><small>← CONTENTS</small>챕터 ${number} 목차</a>`}${next ? `<a href="${lessonPath(next.id, ctx)}"><small>다음 레슨 →</small>${esc(next.title)}</a>` : `<a href="${reviewPath(ctx)}"><small>CHAPTER REVIEW →</small>챕터 복습 ${ctx.course.review.length}문제</a>`}</nav></main></div>`;
  }

  function problemList(questions, label, ctx, prefix) {
    return `<ol class="py-problems" aria-label="${esc(label)} 문제 목록">${questions.map((q, i) => `<li class="py-problem" id="${esc(prefix)}-${i + 1}"><div class="py-problem-meta"><span>${esc(label)} ${pad(i + 1)}</span><span>${esc(q.skill)}</span></div><h3>${esc(q.question)}</h3>${q.code ? codeBlock({source:q.code, kind:q.codeKind || 'python', caption:q.codeLabel || '문제의 코드'}) : ''}<details class="py-solution"><summary><span class="sr-only">${esc(label)} ${i + 1} </span>예시 답·해설 보기</summary><div class="py-solution-body"><p>${esc(q.solution.answer)}</p>${codeBlock(q.solution.code)}<p>${esc(q.explanation)}</p>${q.related?.length ? `<nav class="py-related" aria-label="${esc(label)} ${i + 1} 관련 레슨">${q.related.map(id => {
      const owner = lessonList(ctx).some(l => l.id === id) ? ctx : chapterContexts(ctx).find(item => lessonList(item).some(l => l.id === id)) || ctx;
      return `<a href="${lessonPath(id, owner)}">${esc(lessonList(owner).find(l => l.id === id)?.title || id)} ↗</a>`;
    }).join('')}</nav>` : ''}</div></details></li>`).join('')}</ol>`;
  }

  function review(ctx) {
    const number = chapterNumber(ctx);
    return `<main id="main" class="wrap py-review"><div class="page-title"><div class="crumb"><a href="#/subjects/python">파이썬</a> / <a href="${chapterPath(ctx)}">챕터 ${number}</a> / 복습</div><div class="eyebrow">CHAPTER ${pad(number)} · REVISIT THE IDEAS</div><h1>직접 풀어 보는<br>챕터 ${number} 복습 ${ctx.course.review.length}문제</h1><p>${esc(ctx.course.title)}.<br>PC에서 코드를 작성하며 이 챕터의 핵심을 다시 연결해 보세요.</p></div><section class="py-review-problems" aria-label="챕터 ${number} 복습 문제"><p class="py-practice-note">문제를 먼저 풀고, 필요한 때 예시 답과 해설을 펼쳐 보세요. 자신의 코드가 다르더라도 요구한 결과와 원리를 만족하는지 확인하면 됩니다.</p>${problemList(ctx.course.review, '복습', ctx, 'review')}</section><section class="py-review-keypoints"><div class="section-head"><div><div class="eyebrow">IDEAS TO KEEP</div><h2>필요할 때 다시 보는 핵심 정리</h2></div></div>${lessonList(ctx).map(l => `<details class="review-overview"><summary>${pad(lessonNumber(l, ctx))} · ${esc(l.title)}</summary><ul class="summary-list py-review-summary">${l.keypoints.map(point => `<li>${esc(point)}</li>`).join('')}</ul><a href="${lessonPath(l.id, ctx)}">이 레슨 다시 읽기 ↗</a></details>`).join('')}</section><div class="actions"><a class="text-link" href="${chapterPath(ctx)}">챕터 ${number} 목차로 →</a></div></main>`;
  }

  function progress(ctx) {
    const items = lessonList(ctx), history = items.filter(l => isRead(ctx, l.id)), next = nextLesson(ctx), headingId = 'py-progress-' + chapterSlug(ctx) + '-heading';
    return `<section class="py-progress" aria-labelledby="${esc(headingId)}"><div class="py-progress-head"><div><div class="eyebrow">PYTHON · CHAPTER ${pad(chapterNumber(ctx))}</div><h2 id="${esc(headingId)}">파이썬 · ${esc(ctx.course.title)}</h2></div><a class="text-link" href="${chapterPath(ctx)}">챕터 목차 ↗</a></div><p class="py-reading-count">읽음 표시한 레슨 <strong>${readCount(ctx)} / ${items.length}</strong></p>${progressBar(ctx)}${ctx.storageOK === false ? '<p class="empty">현재 브라우저에서 파이썬 학습 기록을 저장할 수 없습니다.</p>' : ''}<div class="section-head"><h3>${ctx.state.last ? '이어서 읽을 레슨' : '첫 레슨부터 시작해 볼까요?'}</h3></div>${row(next, ctx)}${history.length ? `<div class="section-head"><h3>읽음 표시한 파이썬 레슨</h3></div><div class="py-lesson-list">${history.map(l => row(l, ctx)).join('')}</div>` : '<p class="empty">레슨을 읽고 읽음 표시를 남기면 여기에 기록됩니다.</p>'}<a class="text-link" href="${reviewPath(ctx)}">챕터 ${chapterNumber(ctx)} 복습 ${ctx.course.review.length}문제 보기 →</a></section>`;
  }

  window.PythonCourseUI = Object.freeze({home, chapter, lesson, review, progress, row, codeBlock});
})();
