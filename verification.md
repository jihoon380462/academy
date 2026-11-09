# Academy 검증 기록

## 수학 과정 초기 구현 범위
- Selected design 01: warm ivory, forest green, editorial typography.
- Home, one grade-one chapter, eight units, thirty lessons.
- Each lesson: original introduction, three concept explanations, exact diagram or concept cards, worked example, misconception, three takeaways, five examples.
- 150 examples and 10 integrative review questions with explanations and links to relevant lessons.
- Curriculum scope checked against EBS 2022-revised middle-school grade-one upper/lower course contents; 대푯값 included.

## Verification
- build-content.py validates all required fields, 30 sequential lesson orders, 150 examples, 10 review questions, unique choices, answer ranges and review links.
- All JS syntax checked.
- Independent mathematical review of lesson text, arithmetic, choices and SVG diagrams; corrections applied for equiangular polygons, graph context, construction and perpendicular distances.
- Browser: home and mobile home, chapter search, lesson navigation, read marker, five-question example completion (5/5), ten-question review completion (9/10 with intentional wrong response), relevant-lesson return and dialog dismissal.
- Browser reload retained completion, example score, review score.
- Representative mobile layouts checked at 390px iframe (375px content excluding scrollbar); no horizontal overflow in eight representative lessons across numeric, algebra, geometry and statistics domains.
- Screenshots: previews/grade1/homepage.jpg and lesson.jpg.

## Limits
- Records use localStorage in the current browser; no automatic cross-device synchronization.
- Ten review questions check broad principles and link to detailed lessons; they do not test every minor skill independently.
- EBS is a scope reference, not the source of lesson prose or questions.

## Academy 학습 분야 개편 (2026-11-09)
- 전체 홈을 과목 카탈로그로 바꾸고, 수학을 6개 대분류 중 하나로 배치했습니다.
- 파이썬, C 계열, 알고리즘·자료구조, CS, 운영체제에는 준비 상태와 예정 주제만 표시합니다.
- 기존 수학 콘텐츠 8개 단원, 30개 레슨, 150개 예제, 복습 10문제는 그대로 보존하고 콘텐츠 검증을 다시 통과했습니다.
- 신규·기존 경로 14개와 저장된 읽음·예제·복습 기록을 독립적으로 검토했습니다. 이전 주소는 새 수학 경로로 연결하고 단원 쿼리를 유지합니다.
- 실제 브라우저에서 과목 홈 → 수학 → 목차 → 검색 → 일차방정식 레슨 → 예제 답·해설 흐름을 확인했습니다.
- 기존 #/review 주소에서 새 경로로 이동하며 이전 복습 점수 9/10이 남아 있음을 확인했습니다.
- 모바일 390px 프레임에서 홈페이지, 긴 과목명 안내, 수학 레슨·예제의 가로 넘침이 없음을 확인했습니다.
- PC·모바일 비교 화면: previews/catalog-homepage.jpg.
- 실제 배포에서 이전 브라우저 캐시와 새 HTML이 섞이는 현상을 확인하여 변경된 CSS·JS 참조에 버전을 추가했습니다.
