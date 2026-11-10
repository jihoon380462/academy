// Presentation only. Learners describe and trace procedures, then run Python on their PC.
(() => {
  'use strict';

  const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));
  const pad = value => esc(String(value).padStart(2, '0'));
  const items = ctx => ctx.course.lessons;
  const chapters = ctx => ctx.chapters?.length ? ctx.chapters : [ctx];
  const number = ctx => Number(ctx.course.number);
  const chapterPath = ctx => '#/algorithms/' + encodeURIComponent(ctx.course.slug);
  const lessonPath = (id, ctx) => chapterPath(ctx) + '/lesson/' + encodeURIComponent(id);
  const reviewPath = ctx => chapterPath(ctx) + '/review';
  const read = (id, ctx) => ctx.state.completed.includes(id);
  const readCount = ctx => items(ctx).filter(item => read(item.id, ctx)).length;
  const lessonNumber = (id, ctx) => items(ctx).findIndex(item => item.id === id) + 1;
  // Reuse the existing escaped, scrollable code/output presentation and its theme styles.
  const codeBlock = block => window.PythonCourseUI.codeBlock(block);
  const nextLesson = ctx => items(ctx).find(item => item.id === ctx.state.last) ||
    items(ctx).find(item => !read(item.id, ctx)) || items(ctx)[0];

  function readingBar(count, total, label) {
    return `<div class="mini-progress" role="progressbar" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${count}"><span style="--progress:${total ? count * 100 / total : 0}%"></span></div>`;
  }

  function stats(ctx) {
    return `<div class="chapter-stats py-course-stats"><div><b>${items(ctx).length}</b><span>개념 레슨</span></div><div><b>${items(ctx).reduce((total, item) => total + item.examples.length, 0)}</b><span>직접 풀기 예제</span></div><div><b>${ctx.course.review.length}</b><span>챕터 복습</span></div></div>`;
  }

  function row(item, ctx) {
    return `<a class="lesson-row py-lesson-row" href="${lessonPath(item.id, ctx)}"><span class="lesson-no">${pad(lessonNumber(item.id, ctx))}</span><div><strong>${esc(item.title)}</strong><p>${esc(item.subtitle)}</p></div><span class="lesson-state ${read(item.id, ctx) ? 'done' : ''}">${read(item.id, ctx) ? '✓ 읽음' : esc(item.minutes) + '분 · 예제 ' + item.examples.length + '개'}</span></a>`;
  }

  function learningNote() {
    return `<aside class="py-reading-note"><strong>먼저 필요한 개념</strong><br>변수·조건·반복·함수·배열 또는 리스트를 읽을 수 있으면 시작할 수 있습니다. 절차는 말과 의사코드로 먼저 살펴보고, Python 3 구현 예시로 확인합니다. 익숙한 언어로 같은 절차를 적어도 좋아요.<br>Python이 낯설다면 <a href="#/python/ch04">조건</a> · <a href="#/python/ch05">반복</a> · <a href="#/python/ch06">리스트</a> · <a href="#/python/ch07">함수</a>에서 필요한 부분만 다시 읽어 보세요.</aside>`;
  }

  function home(ctx) {
    const all = chapters(ctx);
    const visited = all.filter(item => items(item).some(lesson => lesson.id === item.state.last));
    const current = visited.length ? visited.reduce((latest, item) =>
      Number(item.state.visitedAt || 0) > Number(latest.state.visitedAt || 0) ? item : latest) :
      all.find(item => readCount(item) < items(item).length) || all[0];
    const next = nextLesson(current), total = all.reduce((sum, item) => sum + items(item).length, 0);
    const completed = all.reduce((sum, item) => sum + readCount(item), 0);
    return `<main id="main" class="wrap py-home algo-home"><div class="crumb subject-crumb"><a href="#/">학습 분야</a> / 알고리즘·자료구조</div>
      <section class="home-hero py-hero"><div><div class="eyebrow">ALGORITHMS &amp; DATA STRUCTURES</div><h1>알고리즘·<br>자료구조</h1><p class="subject-lead">문제를 분명히 적고,<br>해결하는 절차를 설명해요.</p><p class="hero-copy">어떤 입력을 받아 무엇을 돌려줄까요?<br>작은 사례부터 따라가며 절차가 맞는 이유를 이해합니다.<br>현재 ${all.length}개 챕터 · ${total}개 레슨을 학습할 수 있어요.</p><div class="actions"><a class="btn primary" href="${lessonPath(next.id, current)}">${visited.length ? '이어서 배우기' : '첫 레슨 시작하기'} <span>→</span></a><a class="text-link" href="${chapterPath(all[0])}">챕터 ${number(all[0])} 목차 보기</a></div></div>
      <div class="py-intro-card"><div class="eyebrow">FROM A QUESTION TO A PROCEDURE</div>${codeBlock({
        kind: 'text', source: '입력: 정수 목록 [4, 1, 4]\n목표: 모든 원소의 합\n\n합계를 0으로 시작한다.\n왼쪽부터 한 번씩 더한다.\n0 → 4 → 5 → 9\n\n결과: 9',
        caption: '값이 같아도 서로 다른 위치의 원소입니다. 무엇을 셀지 정하고, 중간 상태를 적어 절차를 확인해요.'
      })}</div></section>
      ${learningNote()}
      <div class="section-head"><div><div class="eyebrow">THE FIRST STEPS</div><h2>작은 절차부터 차근차근.</h2></div><p>챕터를 누르면 레슨 목차가 펼쳐집니다.</p></div>
      ${all.map(item => `<details class="py-home-chapter"><summary class="chapter-banner py-chapter-toggle" aria-labelledby="algo-home-${esc(item.course.slug)}"><div><div class="eyebrow">CHAPTER ${pad(number(item))} · 학습 가능</div><h2 id="algo-home-${esc(item.course.slug)}">${esc(item.course.title)}</h2><p>${esc(item.course.description)}</p></div><div class="py-chapter-overview">${stats(item)}<span class="py-chapter-disclosure" aria-hidden="true"><span class="py-disclosure-closed">목차 펼치기</span><span class="py-disclosure-open">목차 접기</span><span class="py-disclosure-chevron"></span></span></div></summary><div class="py-chapter-contents"><div class="actions py-chapter-actions"><a class="text-link" href="${chapterPath(item)}">챕터 ${number(item)} 전체 목차 ↗</a><a class="text-link" href="${reviewPath(item)}">챕터 ${number(item)} 복습 ${item.course.review.length}문제 ↗</a></div><div class="py-lesson-list">${items(item).map(lesson => row(lesson, item)).join('')}</div></div></details>`).join('')}
      <section class="home-bottom"><div><div class="eyebrow">YOUR READING</div><h3>생각한 과정을 남겨요.</h3><p>알고리즘·자료구조 · ${completed} / ${total} 레슨 읽음<br>읽음 표시와 마지막 레슨에서 이어갈 수 있습니다.</p>${readingBar(completed, total, '알고리즘·자료구조 전체 읽음')}<a class="text-link" href="#/progress">내 학습 기록 →</a></div><div><div class="eyebrow">DESCRIBE, TRACE, EXPLAIN</div><h3>답과 함께 이유를 확인해요.</h3><p>요구 사항과 중간 상태를 손으로 적어 보세요.<br>Python 예시는 PC에서 직접 실행하고,<br>접힌 예시 답·해설을 펼쳐 자신의 생각과 비교합니다.</p><a class="text-link" href="${reviewPath(current)}">챕터 ${number(current)} 복습 →</a></div></section>
      <aside class="py-course-note"><span class="status-badge">챕터 2~9 준비 중</span><p>전체 교육과정은 9개 챕터로 설계되어 있습니다. 현재는 챕터 1 ‘문제를 절차로 바꾸기’를 학습할 수 있습니다. 시간·공간 비용, 자료구조와 탐색·정렬 등은 다음 챕터에서 이어갑니다.</p></aside></main>`;
  }

  function chapter(ctx) {
    return `<main id="main" class="wrap py-chapter algo-chapter"><div class="page-title"><div class="crumb"><a href="#/">학습 분야</a> / <a href="#/subjects/algorithms">알고리즘·자료구조</a> / 챕터 ${number(ctx)}</div><div class="eyebrow">CHAPTER ${pad(number(ctx))} · ALGORITHMS</div><h1>${esc(ctx.course.title)}</h1><p>${esc(ctx.course.description)}</p></div>
      <section class="chapter-banner"><div><h2>챕터 ${number(ctx)} · ${items(ctx).length}개 레슨</h2><p>${esc(ctx.course.prerequisite)}<br>${readCount(ctx)} / ${items(ctx).length} 레슨 읽음</p></div>${stats(ctx)}</section>
      ${learningNote()}<div class="section-head"><div><div class="eyebrow">THE CONTENTS</div><h2>입력에서 결과까지, 이유를 따라가요.</h2></div><p>레슨마다 원리 설명과 예제 5문제</p></div><div class="py-lesson-list">${items(ctx).map(item => row(item, ctx)).join('')}</div>
      <section class="review-band"><div><div class="eyebrow">CHAPTER ${pad(number(ctx))} REVIEW</div><h2>배운 절차를, ${ctx.course.review.length}문제로.</h2><p>명세·추적·정확성·경계 입력을 연결해 다시 생각합니다.</p></div><a class="btn primary" href="${reviewPath(ctx)}">챕터 복습 시작 <span>→</span></a></section></main>`;
  }

  function sidebar(lesson, ctx) {
    return `<aside class="lesson-sidebar py-sidebar" aria-label="알고리즘·자료구조 챕터 ${number(ctx)} 목차"><a class="eyebrow" href="#/subjects/algorithms">알고리즘·자료구조 / CHAPTER ${pad(number(ctx))}</a><h2>${esc(ctx.course.title)}</h2><nav class="py-sidebar-links" aria-label="챕터 레슨">${items(ctx).map(item => `<a href="${lessonPath(item.id, ctx)}" data-algo-lesson="${esc(item.id)}" ${item.id === lesson.id ? 'class="current" aria-current="page"' : ''}>${read(item.id, ctx) ? '✓ ' : ''}${pad(lessonNumber(item.id, ctx))} ${esc(item.title)}</a>`).join('')}</nav><a class="side-review" href="${reviewPath(ctx)}">↗ 챕터 복습 · ${ctx.course.review.length}문제</a><a class="eyebrow" href="${chapterPath(ctx)}">챕터 목차 보기</a></aside>`;
  }

  function problems(questions, label, ctx, prefix) {
    return `<ol class="py-problems" aria-label="${esc(label)} 문제 목록">${questions.map((question, index) => `<li class="py-problem" id="${esc(prefix)}-${index + 1}"><div class="py-problem-meta"><span>${esc(label)} ${pad(index + 1)}</span><span>${esc(question.skill)}</span></div><h3>${esc(question.question)}</h3>${question.code ? codeBlock({source: question.code, kind: question.codeKind || 'python', caption: question.codeLabel || '문제의 절차 또는 코드'}) : ''}<details class="py-solution"><summary><span class="sr-only">${esc(label)} ${index + 1} </span>예시 답·해설 보기</summary><div class="py-solution-body"><p>${esc(question.solution.answer)}</p>${codeBlock(question.solution.code)}<p>${esc(question.explanation)}</p>${question.related?.length ? `<nav class="py-related" aria-label="${esc(label)} ${index + 1} 관련 레슨">${question.related.map(id => {
      const owner = chapters(ctx).find(item => items(item).some(lesson => lesson.id === id));
      const related = owner && items(owner).find(lesson => lesson.id === id);
      return related ? `<a href="${lessonPath(id, owner)}">${esc(related.title)} ↗</a>` : '';
    }).join('')}</nav>` : ''}</div></details></li>`).join('')}</ol>`;
  }

  function lesson(item, ctx) {
    const index = items(ctx).findIndex(lesson => lesson.id === item.id), previous = items(ctx)[index - 1], next = items(ctx)[index + 1];
    return `<div class="lesson-shell py-lesson-shell algo-lesson-shell">${sidebar(item, ctx)}<main id="main" class="article py-article"><div class="mobile-contents"><span>알고리즘·자료구조 · 챕터 ${number(ctx)}</span><a href="${chapterPath(ctx)}">전체 목차 ↗</a></div><div class="crumb"><a href="#/subjects/algorithms">알고리즘·자료구조</a> / <a href="${chapterPath(ctx)}">챕터 ${number(ctx)}</a> / 레슨 ${pad(index + 1)}</div>
      <header class="lesson-heading"><div class="eyebrow">LESSON ${pad(index + 1)} / ${items(ctx).length} · ALGORITHMS</div><h1>${esc(item.title)}</h1><p class="subtitle">${esc(item.subtitle)}</p><div class="lesson-meta"><span>개념 읽기 약 ${esc(item.minutes)}분</span><span>예제 ${item.examples.length}문제</span><span class="py-read-state" data-algo-read-status>${read(item.id, ctx) ? '✓ 읽음 표시됨' : '천천히 이해해도 괜찮아요'}</span></div></header>
      <nav class="lesson-tabs" aria-label="이 레슨에서"><a href="${lessonPath(item.id, ctx)}" data-scroll="concept">01 개념 이해</a><a href="${lessonPath(item.id, ctx)}" data-scroll="worked">02 절차 추적</a><a href="${lessonPath(item.id, ctx)}" data-scroll="practice">03 예제 ${item.examples.length}문제</a></nav>
      <section id="concept"><aside class="py-goal"><strong>이 레슨의 목표</strong><p>${esc(item.goal)}</p></aside><p class="intro-text">${esc(item.intro)}</p>${item.sections.map((section, sectionIndex) => `<section class="concept-step"><h2><span>${pad(sectionIndex + 1)}.</span>${esc(section.title)}</h2>${section.body.map(paragraph => `<p>${esc(paragraph)}</p>`).join('')}${codeBlock(section.code)}</section>`).join('')}</section>
      <section class="worked" id="worked"><div class="eyebrow">FOLLOW THE PROCEDURE AND THE REASON</div><h2>절차와 결과를 연결해 볼까요?</h2><p class="question">${esc(item.worked.question)}</p>${codeBlock(item.worked.code)}<ol>${item.worked.steps.map(step => `<li>${esc(step)}</li>`).join('')}</ol><div class="answer">${esc(item.worked.answer)}</div></section>
      <details class="misconception"><summary>${esc(item.misconception.question)}</summary><p>${esc(item.misconception.answer)}</p></details><section class="keypoints"><h2>이 레슨에서 가져갈 세 가지</h2><ul>${item.keypoints.map(point => `<li>${esc(point)}</li>`).join('')}</ul></section>
      <section class="py-practice" id="practice"><div class="eyebrow">PUT IT INTO PRACTICE</div><h2>직접 풀어 보는 ${item.examples.length}문제</h2><p class="py-practice-note">먼저 요구 사항과 절차를 적고, 중간 상태를 손으로 따라가 보세요. Python 코드는 PC에서 직접 입력하고 실행할 수 있습니다. 풀어 본 뒤 예시 답·해설과 비교해 보세요.</p>${problems(item.examples, '예제', ctx, 'practice')}</section>
      <div class="finish"><button class="btn" data-algo-complete="${esc(item.id)}" aria-pressed="${read(item.id, ctx)}">${read(item.id, ctx) ? '✓ 읽음 표시됨 · 취소하기' : '이 레슨 읽음 표시하기'}</button><p>생각한 과정을 자신의 말로 설명해 보세요.<br>개념을 읽었다면 읽음 표시를 남길 수 있어요.</p></div>
      <nav class="lesson-nav" aria-label="이전 다음 레슨">${previous ? `<a href="${lessonPath(previous.id, ctx)}"><small>← 이전 레슨</small>${esc(previous.title)}</a>` : `<a href="${chapterPath(ctx)}"><small>← CONTENTS</small>챕터 ${number(ctx)} 목차</a>`}${next ? `<a href="${lessonPath(next.id, ctx)}"><small>다음 레슨 →</small>${esc(next.title)}</a>` : `<a href="${reviewPath(ctx)}"><small>CHAPTER REVIEW →</small>챕터 복습 ${ctx.course.review.length}문제</a>`}</nav></main></div>`;
  }

  function review(ctx) {
    return `<main id="main" class="wrap py-review algo-review"><div class="page-title"><div class="crumb"><a href="#/subjects/algorithms">알고리즘·자료구조</a> / <a href="${chapterPath(ctx)}">챕터 ${number(ctx)}</a> / 복습</div><div class="eyebrow">CHAPTER ${pad(number(ctx))} · REVISIT THE IDEAS</div><h1>생각을 연결하는<br>챕터 ${number(ctx)} 복습 ${ctx.course.review.length}문제</h1><p>${esc(ctx.course.title)}.<br>입출력 계약부터 불변식·종료까지, 절차가 맞는 이유를 설명해 보세요.</p></div>
      <section class="py-review-problems" aria-label="챕터 ${number(ctx)} 복습 문제"><p class="py-practice-note">문제의 요구를 먼저 적고 자신의 절차를 따라가 보세요. 필요한 때 예시 답·해설을 펼치고 관련 레슨으로 돌아갈 수 있습니다. 다른 절차도 계약을 지키는 이유를 설명할 수 있다면 가능합니다.</p>${problems(ctx.course.review, '복습', ctx, 'review')}</section>
      <section class="py-review-keypoints"><div class="section-head"><div><div class="eyebrow">IDEAS TO KEEP</div><h2>필요할 때 다시 보는 핵심 정리</h2></div></div>${items(ctx).map(item => `<details class="review-overview"><summary>${pad(lessonNumber(item.id, ctx))} · ${esc(item.title)}</summary><ul class="summary-list py-review-summary">${item.keypoints.map(point => `<li>${esc(point)}</li>`).join('')}</ul><a href="${lessonPath(item.id, ctx)}">이 레슨 다시 읽기 ↗</a></details>`).join('')}</section><div class="actions"><a class="text-link" href="${chapterPath(ctx)}">챕터 ${number(ctx)} 목차로 →</a></div></main>`;
  }

  function progress(ctx) {
    const history = items(ctx).filter(item => read(item.id, ctx)), next = nextLesson(ctx), headingId = 'algo-progress-' + ctx.course.slug;
    return `<section class="py-progress algo-progress" aria-labelledby="${esc(headingId)}"><div class="py-progress-head"><div><div class="eyebrow">ALGORITHMS · CHAPTER ${pad(number(ctx))}</div><h2 id="${esc(headingId)}">알고리즘·자료구조 · ${esc(ctx.course.title)}</h2></div><a class="text-link" href="${chapterPath(ctx)}">챕터 목차 ↗</a></div><p class="py-reading-count">읽음 표시한 레슨 <strong>${readCount(ctx)} / ${items(ctx).length}</strong></p>${readingBar(readCount(ctx), items(ctx).length, '알고리즘·자료구조 챕터 ' + number(ctx) + ' 읽음')}${ctx.storageOK === false ? '<p class="empty">현재 브라우저에서 알고리즘·자료구조 학습 기록을 저장할 수 없습니다.</p>' : ''}<div class="section-head"><h3>${ctx.state.last ? '이어서 읽을 레슨' : '첫 레슨부터 시작해 볼까요?'}</h3></div>${row(next, ctx)}${history.length ? `<div class="section-head"><h3>읽음 표시한 알고리즘·자료구조 레슨</h3></div><div class="py-lesson-list">${history.map(item => row(item, ctx)).join('')}</div>` : '<p class="empty">레슨을 읽고 읽음 표시를 남기면 여기에 기록됩니다.</p>'}<a class="text-link" href="${reviewPath(ctx)}">챕터 ${number(ctx)} 복습 ${ctx.course.review.length}문제 보기 →</a></section>`;
  }

  window.AlgorithmsCourseUI = Object.freeze({ home, chapter, lesson, review, progress });
})();
