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


## 파이썬 직접 작성 문제 목록으로 변경 (2026-11-10 KST)
- 사용자 요청에 따라 파이썬 예제 25개·챕터 복습 10개를 페이지에 순서대로 나열했습니다. 선택지·파이썬 퀴즈 모달·자동 채점·점수 표시를 제거하고, PC에서 직접 작성·실행·수정·예측하는 문항으로 개작했습니다.
- 각 문항의 예시 답·해설은 기본 접힘이며, 복습 해설에서 관련 레슨으로 돌아갈 수 있습니다. 읽음·최근 레슨은 유지하고, 이전에 저장된 파이썬 점수는 삭제하거나 새 점수로 덮어쓰지 않습니다. 수학의 기존 문제 풀이·점수 기능은 유지합니다.
- 파이썬 5개 레슨의 본문은 변경하지 않았습니다. 5개 examples 배열만 변경 전후 제외 비교하여 나머지 필드 동일 확인. 새 question/solution 모델과 --check-code 실행 범위를 문서에 반영했습니다.
- `python3 build-python.py --check-code`: 본문·풀이 예시·문항 예시 답 코드 53개를 CPython 3.12.14로 실행, 예상 stdout과 의도된 오류 종류 확인. 레슨 25개·복습 10개 수량과 관련 레슨 전체 연결, 선택형 필드 제거 검증 통과.
- 작성자 검토: 레슨 답 코드 24개·문제 코드 18개, 복습 답 10개·추가 시작 코드 2개의 실행 결과 검토. 별도 독립 검토에서 실제 35문항의 요구와 예시 답, 선행 범위, 코드 escaping, 해설 기본 접힘, 생성 번들과 원본 일치 확인.
- 독립 통합 검사: 읽음 토글·최근 레슨, 이전 파이썬 점수 보존·미표시, 수학 복습 10/10 저장과 파이썬 점수 불변 확인.
- 브라우저: 1440px PC와 390px 모바일 프레임에서 레슨 예제 5개·복습 10개가 모두 본문에 있고, 각각 해설 5개·10개가 기본 접힘임을 확인했습니다. 예시 답 펼치기, 복습의 관련 레슨 이동 확인. 대표 레슨과 복습의 모바일 document 폭과 scrollWidth는 모두 375px(스크롤바 제외)입니다.
- 통합 학습 화면에서 파이썬 읽음 1/5·최근 레슨 유지와 점수 미표시, 기존 수학 읽음 1/30·예제 1/30·복습 최고 9/10 보존 확인. 숫자는 검증용 브라우저 기록이며 배포 콘텐츠에 포함하지 않습니다.
- 화면 기록: `previews/python-problem-list.jpg`. 앞 절의 선택형 파이썬 퀴즈 검증은 이전 버전의 기록이며 현재 학습 방식은 이 절을 따릅니다.


## 화면 테마 설정 (2026-11-10 KST)
- 상단 설정 (`#/settings`)에 기본 밝은 테마와 다크 6개 선택 카드를 구현했습니다. 선택 즉시 사이트 전체에 적용하며 `academy-theme-v1`로 별도 저장합니다. 첫 CSS 적용 전에 저장값을 복원하고, 동일 브라우저의 탭에는 storage 이벤트로 반영합니다. 기기 간 동기화는 없습니다.
- 유효한 저장값만 허용하며 잘못된 값은 밝은 기본 화면으로 처리합니다. 저장 차단 시 현재 화면에 적용하고 저장 불가 안내를 표시합니다. 테마 변경은 학습 기록을 읽거나 쓰지 않습니다.
- 독립 Node VM 검사: 7개 선택, 초기 복원·잘못된 값·읽기/쓰기 차단·저장 복구·storage/clear 이벤트, 다른 탭으로의 쓰기 반복 0회, 수학/파이썬 기존 저장 키 불변, 설정 라우팅 및 열린 수학 모달 상태 유지 확인. 변경 JS 구문 검사 통과.
- 브라우저에서 7개 카드 각각 선택 후 data-theme/실제 배경색/라디오 선택 일치 확인. 먹빛 선택 후 새로고침 유지, 다른 탭/프레임에도 같은 선택 반영 확인.
- 기본/다크 설정 페이지를 390px 및 320px 프레임으로 확인. 문서 clientWidth/scrollWidth는 375/375, 305/305이며 상단 메뉴 5개와 선택 카드 7개가 표시됩니다.
- 실제 22개 분야 홈, 먹빛 수학 본문·소인수분해 SVG·반전 숫자, 블랙 글래스 수학 문제 정답/해설, 파이썬 레슨 5의 코드·출력·오류 및 문제 5개/해설 펼치기 확인. 수학 문제 해설을 연 상태에서 다른 탭으로 테마를 바꿔도 열린 모달과 답 확인 상태 유지.
- 390px 파이썬 오류 레슨, 320px 수학 SVG 레슨에서 가로 넘침 없음. 전체 도식 색은 CSS 변수로 전환했고, 30개 레슨+fallback 2개의 기존색 fallback을 적용한 SVG/HTML이 변경 전과 동일함을 독립 검증했습니다. 기하와 콘텐츠는 변경하지 않았습니다.
- themes.css의 196개 규칙은 다크 루트·screen에 한정합니다. 본문/보조/코드/오류 대비를 수치 확인했고, 모든 개별 페이지의 모든 상태를 각각 시각 검사한 것은 아닙니다.
- 설정 선택 화면: `previews/theme-settings.jpg`.


## 다크 테마 챕터 카드 여백 수정 (2026-11-10 KST)
- 배경/테두리를 추가한 챕터 카드가 기존 밝은 화면의 좌우 padding 0을 물려받아 제목·설명·통계가 테두리에 붙는 문제를 수정했습니다. 수학과 파이썬이 공유하는 다크 챕터 배너에 PC 30px/32px, 760px 이하 24px/20px의 상하/좌우 여백을 적용했습니다.
- 모바일 통계를 같은 폭의 4칸(수학)/3칸(파이썬)에 가운데 정렬하고 최소폭·숫자 크기·레이블 단어 줄바꿈을 조정했습니다. CSS URL 버전을 갱신했습니다.
- PC 1348px 문서와 카드에 가로 넘침 없음. 390px·320px 프레임에서 수학/파이썬 문서 폭과 scrollWidth는 375/375·305/305, 통계 자식 전체가 각 칸 안에 들어옴을 확인했습니다. 두 과목 모바일 카드 화면: `previews/chapter-spacing.jpg`.

## 파이썬 챕터 2 · 값·이름·연산 (2026-11-10 KST)

- `python-l006`~`python-l010`의 개념 설명·작동 예시·오해·핵심 정리와 직접 풀기 25문항, 별도 복습 10문항을 추가했다. 복습 분포는 값과 이름 3 / 연산 예측 3 / 변환 오류 2 / 입출력 적용 2다.
- 전체 Python 콘텐츠는 2챕터·10레슨·50예제·20복습이다. 챕터 3 이후는 집필하지 않았다. `PYTHON_COURSES` 배열과 기존 `PYTHON_CH01` 별칭을 함께 제공하며 이전 시안도 호환된다.
- Python 3.12.14에서 작성자 코드 113개(챕터 1·2 합계)를 `-I`로 실행해 stdout과 의도한 오류 종류가 일치했다. 챕터 2의 코드 60개, 오류 질문 원본 6개와 비교식 1개는 별도 검토자가 독립 검증했다. 입력을 쓰는 12개 블록은 예시 stdin을 전달했다.
- 변수 연결·내림 나눗셈·숫자 변환·부동소수점·불리언·input을 공식 Python 3.12 자료와 대조했다. 단락 평가의 설명을 명확히 했으며 후속 챕터 문법을 풀이 전제로 넣지 않았다.
- 저장과 경로 통합 검사 10개 통과: ch01 기록·유효한 과거 점수 보존, ch02 키 분리, 읽음 토글, 최신 레슨 연결, storage 이벤트의 재저장 방지, 잘못된 챕터/레슨 경로 거절, 수학 이전 URL, 저장 차단 시 메모리 동작.
- 실제 콘텐츠로 18개 화면을 렌더해 내부 Python 링크 271개, 문항 수, 접힌 해설, 중복 ID 없음, 이전 시안 호환, 입력 문자열 HTML 이스케이프를 확인했다.
- 브라우저: 390px 프레임(실제 콘텐츠 폭 375px)에서 새 레슨 5개를 이전/다음 링크로 이동했고 각 5문항·접힌 해설과 가로 넘침 없음을 확인했다. 복습 10문항과 9번 입력 문제의 해설·예시 입력·예상 출력 분리를 확인했다.
- 입력 레슨을 320px 프레임(실제 305px)에서도 확인했다. 밝은/블랙 글래스 테마의 입력 영역을 검사했고, 챕터 카드 안쪽 여백 24px 20px와 가로 넘침 없음을 확인했다. PC 목차도 확인했다.
- 새 레슨 읽음 표시가 새로고침 후 유지되고, 홈의 2챕터·10레슨·최근 레슨 연결이 맞으며 기존 ch01 읽음 기록도 남아 있음을 브라우저에서 확인했다. 실제 입력·실행은 사용자 PC에서 하는 방식이며 사이트 실행기·자동 채점·기기 간 동기화는 추가하지 않았다.
- 화면 기록: `previews/python-ch02.jpg`. 배포 상태는 이 변경을 포함한 GitHub Pages 실행 결과와 별도로 확인한다.

## 홈의 학습·복습 카드 여백 수정 (2026-11-10 KST)

- 다크 테마의 `.home-bottom > div`에 배경만 적용되고 내부 여백이 없던 문제를 수정했다. 수학과 파이썬 홈에 공통으로 적용한다.
- PC는 카드마다 28px 32px 여백과 24px 사이 간격, 모바일은 24px 20px 여백과 20px 간격을 사용한다. 블랙 글래스는 14px, 매트 블랙은 8px 모서리로 기존 테마의 카드 스타일을 따른다.
- 840px PC, 390px 모바일, 320px 좁은 화면에서 가로 넘침 없음을 확인했다. 진행 막대도 카드 테두리에서 PC 33px, 모바일 21px 안쪽에 놓인다(테두리 1px 포함).
- 밝은 테마의 기존 배경 없는 배치를 유지하며 전체 7개 테마의 모바일 가로 넘침을 검사했다. 수학 홈에도 같은 카드 여백을 확인하고 파이썬 카드의 챕터 2 복습 링크 이동을 확인했다.
- 변경 범위는 `themes.css`, CSS 캐시 버전, 검증 기록과 `previews/home-cards-fixed.jpg`다. 콘텐츠·읽음 기록·라우팅 로직은 변경하지 않았다.
