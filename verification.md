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

## 학습 목표 분야 확장 (2026-11-09)
- 기존 6개 분야 뒤에 요청한 16개 분야를 입력 순서대로 추가했습니다. 총 22개이며, 표시 순서는 학습 우선순위를 정하지 않습니다.
- C 계열 표시명을 C++/#로 바꾸고 기존 c-family 링크를 유지했습니다.
- 수학만 학습 가능 상태이며 나머지 21개 분야는 예정 주제와 준비 안내를 제공합니다.
- 명칭·순서를 요청 및 README와 대조했고 ID 중복이 없음을 확인했습니다.
- 브라우저에서 PC 목록 22개, C++/# 및 새 분야 상세 안내, 모바일 390px 프레임의 가로 넘침 없음을 확인했습니다.
- 과목 데이터 캐시 버전을 갱신하고 미리보기 명칭도 같은 과목 데이터에서 가져오도록 변경했습니다.


## 전체 교육과정 뼈대 설계 (2026-11-10 KST)
- 22개 분야의 209개 챕터·1,100개 레슨 목차를 docs/curriculum/에 설계했습니다. 기존 중1 30개를 포함한 목차 수이며 실제 공개 수업 수가 아닙니다.
- 범위, ID·참조·링크, 복습 배분 합계, 중1 기존 ID·제목 보존을 확인했습니다.
- 독립 범위·선행 관계 검토와 수정 사항은 docs/REVIEW.md에 기록했습니다.
- AGENTS.md와 docs/START-HERE.md를 통해 다른 대화에서 같은 의도로 이어서 작업할 수 있게 했습니다.
- 본문·문제·새 웹 화면은 작성하지 않았고, 사이트 실행 코드와 기존 수학 콘텐츠는 변경하지 않았습니다.


## 파이썬 챕터 1 구현 (2026-11-10 KST)
- `python-ch01`의 `python-l001`~`python-l005` 본문·작동 예시·오개념·핵심 정리, 예제 25개와 복습 10개를 구현했습니다. 파이썬 홈·목차·레슨·복습·과목별 학습 기록을 연결했습니다. 챕터 2 이후와 나머지 준비 중 분야는 집필하지 않았습니다.
- `build-python.py --check-code`: 5개 ID·제목·순서, 25개 예제, 복습 10개와 모든 레슨의 연결을 확인하고 신뢰된 본문 코드 19개를 CPython 3.12.14로 실행했습니다. 예상 stdout과 의도된 오류 종류를 대조했습니다.
- 집필자별 실행 검사와 별도 독립 검토로 코드 선택지·정답·해설·REPL/파일 실행 차이를 확인했습니다. 대화형 창에서 미닫힌 괄호는 즉시 오류가 아니라 추가 입력을 기다리는 점을 반영해 오류 문항을 수정했습니다.
- 실제 브라우저: 전체 홈 22분야·2개 학습 가능·35개 공개 레슨, 파이썬 홈→챕터→레슨, 읽음 표시, 레슨 3 예제 전체 5/5, 복습 전체 9/10(1개 의도적 오답), 오답 관련 파이썬 레슨 연결 및 대화상자 닫힘을 확인했습니다.
- 새로고침 후 파이썬 읽음 표시와 예제 5/5 기록 유지. 통합 학습 화면에서 파이썬 읽음 1/5·예제 1/5·복습 9/10과 기존 수학 읽음 1/30·예제 1/30·복습 9/10이 함께 보존됨을 확인했습니다. 기존 수학 예제의 답·해설 표시도 확인했습니다. 이 수치는 검증용 브라우저 기록이며 배포 파일에 포함하지 않습니다.
- 1440px PC / 390px 모바일 프레임에서 화면 확인. 파이썬 5개 레슨 모두 모바일 document 폭 375px(스크롤바 제외)과 scrollWidth가 일치했습니다. 들여쓰기 코드·줄바꿈·출력·오류 패널, 모바일 코드 선택형 문제의 가로 넘침 없음 확인.
- 독립 통합 검토에서 두 탭의 저장 이벤트가 방문 시간을 다시 저장하며 반복되는 문제를 발견해 수정했습니다. 저장 이벤트 렌더는 방문 기록을 쓰지 않고 스크롤과 열린 퀴즈를 유지합니다. 두 탭 모의 검사에서 이벤트 1회 후 추가 쓰기 0회, 원격 갱신 후 최고점·읽음 보존 확인.
- 수학 기존 저장 키와 레슨 ID·레거시 경로 보존, 두 과목 점수 격리, 과목별 복습 링크·진도 집계에 대한 독립 검토 통과.
- 브라우저 콘솔에 사이트 코드 오류 없음. 브라우저 확장의 메타데이터 전송 오류는 사이트 밖에서 발생했습니다.
- PC 설치 절차는 공식 문서 확인 및 명령 예시 검토 범위입니다. Windows/macOS 설치 화면을 직접 실행한 검증은 아닙니다. 사이트 내 코드 실행기는 없고, Python 3 코드 읽기·선택형 이해 점검과 PC 로컬 실행 안내를 제공합니다.
- 본문 수정 시 `content/python/SCHEMA.md`를 따르고 `python3 build-python.py --check-code` 후 생성된 `python-content.js`도 함께 반영합니다.
- PC·모바일 화면 기록: `previews/python-ch01.jpg`.
