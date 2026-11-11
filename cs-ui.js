// Presentation only. Learners explain computer layers and trace small changes in state.
(() => {
  'use strict';

  const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));
  // Author emphasis is the only supported inline markup; HTML stays escaped.
  const inlineText = value => esc(value).replace(/\*\*([^*\n]+)\*\*/g, '<strong class="cs-emphasis">$1</strong>');
  const pad = value => esc(String(value).padStart(2, '0'));
  const items = ctx => ctx.course.lessons;
  const chapters = ctx => ctx.chapters?.length ? ctx.chapters : [ctx];
  const number = ctx => Number(ctx.course.number);
  const chapterPath = ctx => '#/cs/' + encodeURIComponent(ctx.course.slug);
  const lessonPath = (id, ctx) => chapterPath(ctx) + '/lesson/' + encodeURIComponent(id);
  const reviewPath = ctx => chapterPath(ctx) + '/review';
  const read = (id, ctx) => ctx.state.completed.includes(id);
  const readCount = ctx => items(ctx).filter(item => read(item.id, ctx)).length;
  const lessonNumber = (id, ctx) => items(ctx).findIndex(item => item.id === id) + 1;
  // Text diagrams use the shared paper/code styles without a language runtime.
  function codeBlock(block) {
    if (!block || block.source === undefined) return '';
    return `<figure class="py-code"><div class="py-code-head"><span class="py-code-label">흐름과 자료 읽기</span><span class="py-code-kind">텍스트</span></div><pre class="py-code-source" tabindex="0" aria-label="텍스트 자료"><code>${esc(block.source)}</code></pre>${block.caption ? `<figcaption class="py-code-caption">${inlineText(block.caption)}</figcaption>` : ''}</figure>`;
  }

  function visual(data) {
    if (!data || !['cells', 'flow', 'table'].includes(data.type)) return '';
    const caption = `<figcaption class="cs-visual-caption"><strong>${inlineText(data.title)}</strong>${data.caption ? `<span>${inlineText(data.caption)}</span>` : ''}</figcaption>`;
    if (data.type === 'table') {
      return `<figure class="cs-visual cs-visual-table">${caption}<p class="cs-scroll-hint" data-columns="table">옆으로 밀어 나머지 열을 확인하세요.</p><div class="cs-table-wrap" tabindex="0" role="region" aria-label="${esc(data.title)} · 표 가로 스크롤"><table><thead><tr>${data.headers.map(header => `<th scope="col">${inlineText(header)}</th>`).join('')}</tr></thead><tbody>${data.rows.map(row => `<tr>${row.map((cell, index) => index === 0 ? `<th scope="row">${inlineText(cell)}</th>` : `<td>${inlineText(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></figure>`;
    }
    if (data.type === 'cells') {
      return `<figure class="cs-visual cs-visual-cells">${caption}<p class="cs-scroll-hint" data-columns="${data.items.length}">옆으로 밀어 나머지 칸을 확인하세요.</p><div class="cs-visual-body" tabindex="0" role="region" aria-label="${esc(data.title)} · 칸 가로 스크롤"><ol class="cs-cells" style="--cs-cell-count:${data.items.length}">${data.items.map(item => `<li class="cs-cell"><span class="cs-cell-label">${inlineText(item.label)}</span><strong class="cs-cell-value">${inlineText(item.value)}</strong>${item.note ? `<small class="cs-cell-note">${inlineText(item.note)}</small>` : ''}</li>`).join('')}</ol></div></figure>`;
    }
    return `<figure class="cs-visual cs-visual-flow">${caption}<ol class="cs-flow">${data.items.map((item, index) => `<li class="cs-flow-step"><span class="cs-flow-number" aria-hidden="true">${pad(index + 1)}</span><strong class="cs-flow-label">${inlineText(item.label)}</strong><span class="cs-flow-value">${inlineText(item.value)}</span>${item.note ? `<small class="cs-flow-note">${inlineText(item.note)}</small>` : ''}${index < data.items.length - 1 ? '<span class="cs-flow-arrow" aria-hidden="true">→</span>' : ''}</li>`).join('')}</ol></figure>`;
  }

  function task(data) {
    if (!data.instructions?.length && !data.answerFormat) return '';
    return `<aside class="cs-task" aria-label="풀이 안내">${data.instructions?.length ? `<strong class="cs-task-heading">해야 할 일</strong><ol class="cs-instructions">${data.instructions.map(instruction => `<li>${inlineText(instruction)}</li>`).join('')}</ol>` : ''}${data.answerFormat ? `<div class="cs-answer-format"><strong>답 적는 형식</strong><p>${inlineText(data.answerFormat)}</p></div>` : ''}</aside>`;
  }
  const nextLesson = ctx => items(ctx).find(item => item.id === ctx.state.last) ||
    items(ctx).find(item => !read(item.id, ctx)) || items(ctx)[0];

  function readingBar(count, total, label) {
    return `<div class="mini-progress" role="progressbar" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${count}"><span style="--progress:${total ? count * 100 / total : 0}%"></span></div>`;
  }

  function stats(ctx) {
    return `<div class="chapter-stats py-course-stats"><div><b>${items(ctx).length}</b><span>개념 레슨</span></div><div><b>${items(ctx).reduce((total, item) => total + item.examples.length, 0)}</b><span>직접 풀기 예제</span></div><div><b>${ctx.course.review.length}</b><span>챕터 복습</span></div></div>`;
  }

  function row(item, ctx) {
    return `<a class="lesson-row py-lesson-row" href="${lessonPath(item.id, ctx)}"><span class="lesson-no">${pad(lessonNumber(item.id, ctx))}</span><div><strong>${inlineText(item.title)}</strong><p>${inlineText(item.subtitle)}</p></div><span class="lesson-state ${read(item.id, ctx) ? 'done' : ''}">${read(item.id, ctx) ? '✓ 읽음' : esc(item.minutes) + '분 · 예제 ' + item.examples.length + '개'}</span></a>`;
  }

  function learningNote(ctx) {
    const introduction = !ctx ? '컴퓨터 안에서 일어나는 일을 작은 예로 나누어 배웁니다.' : number(ctx) === 1 ? '선행 지식 없이, 입력·저장처럼 익숙한 행동에서 컴퓨터의 역할을 찾습니다.' : '앞 챕터의 프로그램·데이터 개념을 바탕으로, 수와 글자를 비트로 표현하는 방법을 배웁니다.';
    return `<aside class="py-reading-note"><strong>이렇게 배워 보세요</strong><br>${introduction} 프로그램 설치 없이 읽을 수 있습니다. 그림의 이름과 값을 확인하고 종이나 메모장에 자신의 계산·설명을 적어 보세요. 문제마다 제시한 조건을 따라 답을 완성한 뒤 접힌 예시 답·해설과 비교합니다.</aside>`;
  }

  function home(ctx) {
    const all = chapters(ctx);
    const visited = all.filter(item => items(item).some(lesson => lesson.id === item.state.last));
    const current = visited.length ? visited.reduce((latest, item) =>
      Number(item.state.visitedAt || 0) > Number(latest.state.visitedAt || 0) ? item : latest) :
      all.find(item => readCount(item) < items(item).length) || all[0];
    const next = nextLesson(current), total = all.reduce((sum, item) => sum + items(item).length, 0);
    const completed = all.reduce((sum, item) => sum + readCount(item), 0);
    return `<main id="main" class="wrap py-home cs-home"><div class="crumb subject-crumb"><a href="#/">학습 분야</a> / CS</div>
      <section class="home-hero py-hero"><div><div class="eyebrow">COMPUTER SCIENCE · THE FOUNDATIONS</div><h1>CS</h1><p class="subject-lead">익숙한 작은 행동에서,<br>컴퓨터의 원리를 찾아요.</p><p class="hero-copy">같은 숫자와 글자를 컴퓨터는 어떻게 읽을까요?<br>컴퓨터의 역할에서 데이터 표현까지 원리를 연결합니다.<br>현재 ${all.length}개 챕터 · ${total}개 레슨을 학습할 수 있어요.</p><div class="actions"><a class="btn primary" href="${lessonPath(next.id, current)}">${visited.length ? '이어서 배우기' : '첫 레슨 시작하기'} <span>→</span></a><a class="text-link" href="${chapterPath(all[0])}">챕터 ${number(all[0])} 목차 보기</a></div></div>
      <div class="py-intro-card"><div class="eyebrow">FROM AN ACTION TO DATA</div>${visual({
        type: 'flow', title: '질문을 하나씩 넓혀 가요', items: [
          { label: '누가 이 일을 할까요?', value: '컴퓨터의 층과 역할', note: '챕터 1 · 입력·처리·출력·저장' },
          { label: '어떻게 표현할까요?', value: '비트·숫자·문자', note: '챕터 2 · 데이터의 표현과 해석' }
        ], caption: '화살표는 학습할 질문의 순서입니다. 익숙한 행동에서 시작해 안쪽의 표현 방법으로 이어 갑니다.'
      })}</div></section>
      ${learningNote()}
      <div class="section-head"><div><div class="eyebrow">THE FIRST STEPS</div><h2>한 가지 질문부터 차근차근.</h2></div><p>챕터를 누르면 레슨 목차가 펼쳐집니다.</p></div>
      ${all.map(item => `<details class="py-home-chapter"><summary class="chapter-banner py-chapter-toggle" aria-labelledby="cs-home-${esc(item.course.slug)}"><div><div class="eyebrow">CHAPTER ${pad(number(item))} · 학습 가능</div><h2 id="cs-home-${esc(item.course.slug)}">${inlineText(item.course.title)}</h2><p>${inlineText(item.course.description)}</p></div><div class="py-chapter-overview">${stats(item)}<span class="py-chapter-disclosure" aria-hidden="true"><span class="py-disclosure-closed">목차 펼치기</span><span class="py-disclosure-open">목차 접기</span><span class="py-disclosure-chevron"></span></span></div></summary><div class="py-chapter-contents"><div class="actions py-chapter-actions"><a class="text-link" href="${chapterPath(item)}">챕터 ${number(item)} 전체 목차 ↗</a><a class="text-link" href="${reviewPath(item)}">챕터 ${number(item)} 복습 ${item.course.review.length}문제 ↗</a></div><div class="py-lesson-list">${items(item).map(lesson => row(lesson, item)).join('')}</div></div></details>`).join('')}
      <section class="home-bottom"><div><div class="eyebrow">YOUR READING</div><h3>조금씩 읽고, 이해를 남겨요.</h3><p>CS · ${completed} / ${total} 레슨 읽음<br>읽음 표시와 마지막 레슨에서 이어갈 수 있습니다.</p>${readingBar(completed, total, 'CS 전체 읽음')}<a class="text-link" href="#/progress">내 학습 기록 →</a></div><div><div class="eyebrow">EXPLAIN, TRACE, COMPARE</div><h3>자신의 말로 설명해요.</h3><p>그림의 값과 위치를 하나씩 따라가고,<br>바뀐 결과의 이유를 자신의 말로 적어 보세요.<br>예시 답의 이유와 자신의 설명을 비교합니다.</p><a class="text-link" href="${reviewPath(current)}">챕터 ${number(current)} 복습 →</a></div></section>
      <aside class="py-course-note"><span class="status-badge">다음 챕터 준비 중</span><p>CS 전체 교육과정은 9개 챕터로 설계되어 있습니다. 현재 학습할 수 있는 ${all.length}개 챕터 · ${total}개 레슨만 목차와 읽음 기록에 포함합니다.</p></aside></main>`;
  }

  function chapter(ctx) {
    return `<main id="main" class="wrap py-chapter cs-chapter"><div class="page-title"><div class="crumb"><a href="#/">학습 분야</a> / <a href="#/subjects/cs">CS</a> / 챕터 ${number(ctx)}</div><div class="eyebrow">CHAPTER ${pad(number(ctx))} · CS</div><h1>${inlineText(ctx.course.title)}</h1><p>${inlineText(ctx.course.description)}</p></div>
      <section class="chapter-banner"><div><h2>챕터 ${number(ctx)} · ${items(ctx).length}개 레슨</h2><p>${inlineText(ctx.course.prerequisite)}<br>${readCount(ctx)} / ${items(ctx).length} 레슨 읽음</p></div>${stats(ctx)}</section>
      ${learningNote(ctx)}<div class="section-head"><div><div class="eyebrow">THE CONTENTS</div><h2>${number(ctx) === 1 ? '사용자 행동에서 각 층의 역할까지.' : '작은 수와 글자에서 표현 원리까지.'}</h2></div><p>레슨마다 원리 설명과 예제 5문제</p></div><div class="py-lesson-list">${items(ctx).map(item => row(item, ctx)).join('')}</div>
      <section class="review-band"><div><div class="eyebrow">CHAPTER ${pad(number(ctx))} REVIEW</div><h2>배운 원리를, ${ctx.course.review.length}문제로.</h2><p>${inlineText(ctx.course.description)}</p></div><a class="btn primary" href="${reviewPath(ctx)}">챕터 복습 시작 <span>→</span></a></section></main>`;
  }

  function sidebar(lesson, ctx) {
    return `<aside class="lesson-sidebar py-sidebar" aria-label="CS 챕터 ${number(ctx)} 목차"><a class="eyebrow" href="#/subjects/cs">CS / CHAPTER ${pad(number(ctx))}</a><h2>${inlineText(ctx.course.title)}</h2><nav class="py-sidebar-links" aria-label="챕터 레슨">${items(ctx).map(item => `<a href="${lessonPath(item.id, ctx)}" data-cs-lesson="${esc(item.id)}" ${item.id === lesson.id ? 'class="current" aria-current="page"' : ''}>${read(item.id, ctx) ? '✓ ' : ''}${pad(lessonNumber(item.id, ctx))} ${inlineText(item.title)}</a>`).join('')}</nav><a class="side-review" href="${reviewPath(ctx)}">↗ 챕터 복습 · ${ctx.course.review.length}문제</a><a class="eyebrow" href="${chapterPath(ctx)}">챕터 목차 보기</a></aside>`;
  }

  function problems(questions, label, ctx, prefix) {
    return `<ol class="py-problems" aria-label="${esc(label)} 문제 목록">${questions.map((question, index) => `<li class="py-problem" id="${esc(prefix)}-${index + 1}"><div class="py-problem-meta"><span>${esc(label)} ${pad(index + 1)}</span><span>${inlineText(question.skill)}</span></div><h3>${inlineText(question.question)}</h3>${task(question)}${visual(question.visual)}${question.code ? codeBlock({source: question.code, kind: 'text', caption: question.codeLabel || '문제의 자료와 흐름'}) : ''}<details class="py-solution"><summary><span class="sr-only">${esc(label)} ${index + 1} </span>예시 답·해설 보기</summary><div class="py-solution-body"><p>${inlineText(question.solution.answer)}</p>${codeBlock(question.solution.code)}<p>${inlineText(question.explanation)}</p>${question.related?.length ? `<nav class="py-related" aria-label="${esc(label)} ${index + 1} 관련 레슨">${question.related.map(id => {
      const owner = chapters(ctx).find(item => items(item).some(lesson => lesson.id === id));
      const related = owner && items(owner).find(lesson => lesson.id === id);
      return related ? `<a href="${lessonPath(id, owner)}">${inlineText(related.title)} ↗</a>` : '';
    }).join('')}</nav>` : ''}</div></details></li>`).join('')}</ol>`;
  }

  function lesson(item, ctx) {
    const index = items(ctx).findIndex(lesson => lesson.id === item.id), previous = items(ctx)[index - 1], next = items(ctx)[index + 1];
    return `<div class="lesson-shell py-lesson-shell cs-lesson-shell">${sidebar(item, ctx)}<main id="main" class="article py-article"><div class="mobile-contents"><span>CS · 챕터 ${number(ctx)}</span><a href="${chapterPath(ctx)}">전체 목차 ↗</a></div><div class="crumb"><a href="#/subjects/cs">CS</a> / <a href="${chapterPath(ctx)}">챕터 ${number(ctx)}</a> / 레슨 ${pad(index + 1)}</div>
      <header class="lesson-heading"><div class="eyebrow">LESSON ${pad(index + 1)} / ${items(ctx).length} · CS</div><h1>${inlineText(item.title)}</h1><p class="subtitle">${inlineText(item.subtitle)}</p><div class="lesson-meta"><span>개념 읽기 약 ${esc(item.minutes)}분</span><span>예제 ${item.examples.length}문제</span><span class="py-read-state" data-cs-read-status>${read(item.id, ctx) ? '✓ 읽음 표시됨' : '천천히 이해해도 괜찮아요'}</span></div></header>
      <nav class="lesson-tabs" aria-label="이 레슨에서"><a href="${lessonPath(item.id, ctx)}" data-scroll="concept">01 개념 이해</a><a href="${lessonPath(item.id, ctx)}" data-scroll="worked">02 흐름 추적</a><a href="${lessonPath(item.id, ctx)}" data-scroll="practice">03 예제 ${item.examples.length}문제</a></nav>
      <section id="concept"><aside class="py-goal"><strong>이 레슨의 목표</strong><p>${inlineText(item.goal)}</p></aside><p class="intro-text">${inlineText(item.intro)}</p>${item.sections.map((section, sectionIndex) => `<section class="concept-step"><h2><span>${pad(sectionIndex + 1)}.</span>${inlineText(section.title)}</h2>${section.body.map(paragraph => `<p>${inlineText(paragraph)}</p>`).join('')}${codeBlock(section.code)}${visual(section.visual)}</section>`).join('')}</section>
      <section class="worked" id="worked"><div class="eyebrow">FOLLOW THE FLOW AND THE REASON</div><h2>작은 동작을 순서대로 따라가 볼까요?</h2><p class="question">${inlineText(item.worked.question)}</p>${task(item.worked)}${visual(item.worked.visual)}${codeBlock(item.worked.code)}<ol>${item.worked.steps.map(step => `<li>${inlineText(step)}</li>`).join('')}</ol><div class="answer">${inlineText(item.worked.answer)}</div></section>
      <details class="misconception"><summary>${inlineText(item.misconception.question)}</summary><p>${inlineText(item.misconception.answer)}</p></details><section class="keypoints"><h2>이 레슨에서 가져갈 세 가지</h2><ul>${item.keypoints.map(point => `<li>${inlineText(point)}</li>`).join('')}</ul></section>
      <section class="py-practice" id="practice"><div class="eyebrow">PUT IT INTO PRACTICE</div><h2>직접 풀어 보는 ${item.examples.length}문제</h2><p class="py-practice-note">먼저 문제의 조건과 자료를 읽고, 종이나 메모장에 답을 적어 보세요. 해야 할 일과 답 적는 형식이 있으면 순서대로 따릅니다. 답을 완성한 뒤 예시 답·해설을 펼쳐 계산 과정과 이유를 비교하세요.</p>${problems(item.examples, '예제', ctx, 'practice')}</section>
      <div class="finish"><button class="btn" data-cs-complete="${esc(item.id)}" aria-pressed="${read(item.id, ctx)}">${read(item.id, ctx) ? '✓ 읽음 표시됨 · 취소하기' : '이 레슨 읽음 표시하기'}</button><p>생각한 과정을 자신의 말로 설명해 보세요.<br>개념을 읽었다면 읽음 표시를 남길 수 있어요.</p></div>
      <nav class="lesson-nav" aria-label="이전 다음 레슨">${previous ? `<a href="${lessonPath(previous.id, ctx)}"><small>← 이전 레슨</small>${inlineText(previous.title)}</a>` : `<a href="${chapterPath(ctx)}"><small>← CONTENTS</small>챕터 ${number(ctx)} 목차</a>`}${next ? `<a href="${lessonPath(next.id, ctx)}"><small>다음 레슨 →</small>${inlineText(next.title)}</a>` : `<a href="${reviewPath(ctx)}"><small>CHAPTER REVIEW →</small>챕터 복습 ${ctx.course.review.length}문제</a>`}</nav></main></div>`;
  }

  function review(ctx) {
    const nextChapter = chapters(ctx).find(item => number(item) === number(ctx) + 1);
    return `<main id="main" class="wrap py-review cs-review"><div class="page-title"><div class="crumb"><a href="#/subjects/cs">CS</a> / <a href="${chapterPath(ctx)}">챕터 ${number(ctx)}</a> / 복습</div><div class="eyebrow">CHAPTER ${pad(number(ctx))} · REVISIT THE IDEAS</div><h1>생각을 연결하는<br>챕터 ${number(ctx)} 복습 ${ctx.course.review.length}문제</h1><p>${inlineText(ctx.course.title)}.<br>${inlineText(ctx.course.description)}</p></div>
      <section class="py-review-problems" aria-label="챕터 ${number(ctx)} 복습 문제"><p class="py-practice-note">문제마다 주어진 조건과 자료를 확인하고 자신의 답과 이유를 적어 보세요. 예시 답·해설을 펼쳐 과정을 비교하고, 필요한 개념은 관련 레슨에서 다시 확인할 수 있습니다.</p>${problems(ctx.course.review, '복습', ctx, 'review')}</section>
      <section class="py-review-keypoints"><div class="section-head"><div><div class="eyebrow">IDEAS TO KEEP</div><h2>필요할 때 다시 보는 핵심 정리</h2></div></div>${items(ctx).map(item => `<details class="review-overview"><summary>${pad(lessonNumber(item.id, ctx))} · ${inlineText(item.title)}</summary><ul class="summary-list py-review-summary">${item.keypoints.map(point => `<li>${inlineText(point)}</li>`).join('')}</ul><a href="${lessonPath(item.id, ctx)}">이 레슨 다시 읽기 ↗</a></details>`).join('')}</section><div class="actions"><a class="text-link" href="${chapterPath(ctx)}">챕터 ${number(ctx)} 목차로 →</a>${nextChapter ? `<a class="text-link" href="${chapterPath(nextChapter)}">다음 챕터 · ${inlineText(nextChapter.course.title)} →</a>` : ''}</div></main>`;
  }

  function progress(ctx) {
    const history = items(ctx).filter(item => read(item.id, ctx)), next = nextLesson(ctx), headingId = 'cs-progress-' + ctx.course.slug;
    return `<section class="py-progress cs-progress" aria-labelledby="${esc(headingId)}"><div class="py-progress-head"><div><div class="eyebrow">CS · CHAPTER ${pad(number(ctx))}</div><h2 id="${esc(headingId)}">CS · ${inlineText(ctx.course.title)}</h2></div><a class="text-link" href="${chapterPath(ctx)}">챕터 목차 ↗</a></div><p class="py-reading-count">읽음 표시한 레슨 <strong>${readCount(ctx)} / ${items(ctx).length}</strong></p>${readingBar(readCount(ctx), items(ctx).length, 'CS 챕터 ' + number(ctx) + ' 읽음')}${ctx.storageOK === false ? '<p class="empty">현재 브라우저에서 CS 학습 기록을 저장할 수 없습니다.</p>' : ''}<div class="section-head"><h3>${ctx.state.last ? '이어서 읽을 레슨' : '첫 레슨부터 시작해 볼까요?'}</h3></div>${row(next, ctx)}${history.length ? `<div class="section-head"><h3>읽음 표시한 CS 레슨</h3></div><div class="py-lesson-list">${history.map(item => row(item, ctx)).join('')}</div>` : '<p class="empty">레슨을 읽고 읽음 표시를 남기면 여기에 기록됩니다.</p>'}<a class="text-link" href="${reviewPath(ctx)}">챕터 ${number(ctx)} 복습 ${ctx.course.review.length}문제 보기 →</a></section>`;
  }

  window.CSCourseUI = Object.freeze({ home, chapter, lesson, review, progress });
})();
