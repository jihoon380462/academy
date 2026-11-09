# Academy

개념과 원리를 차근차근 배우는 PC·모바일 반응형 학습 사이트입니다.
홈페이지에서 학습 분야를 선택하고, 각 분야 안에서 과정과 레슨을 탐색합니다. 기본 ‘여백의 교과서’와 다크 테마 6개를 설정에서 선택할 수 있습니다.

## 교육과정 설계와 이어서 작업하기

22개 분야의 챕터·레슨 뼈대와 후속 집필 기준을 [docs/START-HERE.md](docs/START-HERE.md)에 정리했습니다. 새 대화에서는 [AGENTS.md](AGENTS.md)부터 읽고, [전체 교육과정](docs/CURRICULUM.md)에서 담당 분야 문서로 이동합니다.

파이썬은 기초, 파이썬 실전은 중고급, AI·머신러닝 기초와 LLM 기초는 기초 한정입니다. 나머지 분야는 기초부터 실무 활용까지 설계합니다. 대분류 간 학습 순서와 구현 우선순위는 아직 정하지 않았습니다. 이 설계 문서의 예정 레슨은 현재 공개된 수업 수에 포함하지 않습니다.

## 버전 관리

버전 관리와 작업 이력은 [버전 관리 규칙](docs/VERSIONING.md), [목표 버전](VERSION), [변경 기록](CHANGELOG.md)을 함께 확인합니다. 코드·학습 콘텐츠 변경마다 변경 기록을 남기고, 운영 문서만 수정할 때는 앱 버전을 올리지 않습니다. `VERSION`은 소스의 목표 버전이며 실제 공개 반영 상태는 [검증 기록](verification.md)에서 배포 SHA와 확인 결과로 구분합니다.

## 학습 분야

총 **22개 분야**를 아래 순서로 표시합니다. 표시 순서는 학습 우선순위나 필수 수강 순서를 뜻하지 않으며, 관심 있는 분야부터 선택할 수 있습니다.

| 표시 순서 | 대분류 | 현재 상태 |
| --- | --- | --- |
| 01 | 수학 | 중학교 1학년 과정 학습 가능 |
| 02 | 파이썬 | 기초 챕터 1~6 소스 구현 (챕터 5·6 로컬 검증 완료, 배포 상태는 검증 기록 참고) |
| 03 | C++/# | 준비 중 |
| 04 | 알고리즘·자료구조 | 준비 중 |
| 05 | CS | 준비 중 |
| 06 | 운영체제 | 준비 중 |
| 07 | 디버깅·테스트 | 준비 중 |
| 08 | 개체지향·설계 | 준비 중 |
| 09 | AI와 협업 | 준비 중 |
| 10 | 데이터 파일 다루기 | 준비 중 |
| 11 | 파이썬 실전 | 준비 중 |
| 12 | 웹 | 준비 중 |
| 13 | HTTP·API·SDK | 준비 중 |
| 14 | SQL | 준비 중 |
| 15 | 데이터 분석 | 준비 중 |
| 16 | AI·머신러닝 기초 | 준비 중 |
| 17 | LLM 기초 | 준비 중 |
| 18 | 리눅스 | 준비 중 |
| 19 | 어셈블리어 | 준비 중 |
| 20 | 터미널·Git | 준비 중 |
| 21 | GitHub | 준비 중 |
| 22 | vim | 준비 중 |

현재 수학과 파이썬의 **2개 분야 · 총 61개 레슨**이 구현되어 있습니다. 나머지 20개 분야에는 예정 주제와 안내 화면만 있으며, 아직 레슨은 제공하지 않습니다. 파이썬 기초와 파이썬 실전, 터미널·Git과 GitHub 등은 각각 별도의 분야로 구분합니다. 실제 배포·화면 검증 기록은 [verification.md](verification.md)를 확인합니다.

## 수학 과정 구성

- 하나의 중1 챕터 안에 **8개 단원 · 30개 레슨**
- 레슨마다 원리 설명 3단계, 도식, 풀이 예시, 오개념 설명, 핵심 정리
- 레슨별 예제 5개: **총 150문제**
- 챕터 종합 복습 **10문제**, 해설과 관련 레슨 연결
- 개념 검색, 이어 배우기, 읽음 표시, 예제·복습 결과 기록
- 설치나 패키지 다운로드 없이 실행하는 HTML/CSS/JavaScript 정적 사이트

## 파이썬 과정 구성

기초 과정의 챕터 1 **프로그램을 읽고 실행하기**, 챕터 2 **값·이름·연산**, 챕터 3 **문자열을 다루는 기본 도구**, 챕터 4 **조건에 따라 흐름 바꾸기**, 챕터 5 **반복으로 같은 규칙 적용하기**, 챕터 6 **여러 값을 담는 방법**을 구성합니다. 챕터 1~5는 각각 5레슨, 챕터 6은 6레슨이며, 챕터 5·6은 구현·로컬 검증 완료입니다. 병합·Pages 배포·공개 화면 확인은 검증 기록에서 구분합니다. 다음 미구현 범위는 챕터 7과 `python-l032`입니다. 이후 목표와 목차는 [파이썬 설계 문서](docs/curriculum/python.md)에 있습니다.

- 챕터 1: 프로그램·실행 결과, 인터프리터·파일, 문자열 출력, 순서·들여쓰기·주석, 오류 읽기의 5레슨
- 챕터 2: 변수와 재대입, 정수·실수 연산, 문자열·숫자 변환, 비교·불리언·논리 연산, 입력받아 계산하고 출력하는 5레슨
- 챕터 3: 인덱스·음수 인덱스, 슬라이싱, 문자열 메서드·반환값, 나누기·합치기·검색, f-string 출력의 5레슨
- 챕터 4: if와 들여쓰기, elif·else, 논리 조건 결합, 빈 값·None·참 거짓 판정, 경계값·중첩 조건의 5레슨
- 챕터 5: for·range·while, 합계·개수·최댓값 누적, break·continue·중첩 반복의 5레슨
- 챕터 6: 리스트·튜플·딕셔너리·집합, 순회·컴프리헨션, 별칭·얕은 복사의 6레슨
- 레슨별 개념 설명, 코드와 예상 출력, 작동 예시, 오해 바로잡기, 핵심 요점
- 레슨마다 예제 5개: **총 155문제**를 본문에 세로로 나열
- 챕터마다 복습 10개: **총 60문제**를 세로로 나열하고, 각 챕터의 핵심 다시 보기·관련 레슨 연결 제공
- 각 문제의 접힌 예시 답·해설을 펼쳐 자신의 코드와 비교
- 읽음 표시, 최근 레슨에서 이어 배우기

파이썬 문제는 사용자가 PC에서 직접 타이핑할 수 있도록 나열하는 방식입니다. 코드를 작성·실행·수정하거나 예상 결과와 이유를 적은 뒤, 필요한 문제의 예시 답과 해설을 펼쳐 확인합니다. 객관식 선택, 퀴즈 모달, 자동 채점과 점수 표시는 제공하지 않습니다. 다음 파이썬 챕터도 이 형식을 이어갑니다.

기본 Python 3 코드로 작성했으며 코드 검증 환경은 **Python 3.12.14**입니다. PC·모바일에서 문제와 설명을 읽을 수 있고, 직접 실행하는 IDLE·터미널 절차는 레슨 2에서 안내합니다. 챕터 2의 `input()` 코드에 표시된 입력 예시는 읽기 전용 자료입니다. 실제 입력은 PC에서 코드를 실행할 때 하며 사이트에 코드 실행기는 없습니다. 공식 문서와 확인 범위는 [파이썬 과목 문서](docs/curriculum/python.md)에 기록했습니다.

## 실행

저장소 루트에서 다음 명령을 실행하고 `http://localhost:8000`에 접속합니다.

```bash
python3 -m http.server 8000
```

## GitHub Pages

사이트 파일은 저장소 루트에 있습니다. 저장소 공개 범위와 Pages 설정은 소유자가 직접 지정합니다.

- Source: Deploy from a branch
- Branch: `main`
- Folder: `/ (root)`

`.nojekyll`을 포함했습니다. 모든 내부 파일 경로는 상대 경로이며, 페이지 이동은 해시 라우팅이므로 `/academy/` 같은 하위 경로에서도 동작합니다.

## 콘텐츠 수정

| 파일 | 용도 |
| --- | --- |
| `index.html` | 사이트 진입점과 공통 구조 |
| `app.css` | 기본 PC·모바일 디자인 |
| `themes.css` | 다크 테마 6개, 수학 도식·퀴즈·파이썬 공통 테마 |
| `theme.js` | 첫 화면 테마 복원, 설정 화면, 테마 선택·저장 |
| `settings.css` | 설정 카드와 반응형 배치 |
| `app.js` | 과목·과정 페이지 이동, 수학 목차 검색·문제 풀이, 과목별 학습 기록 |
| `python.css` | 파이썬 페이지·코드 블록의 반응형 디자인 |
| `python-ui.js` | 파이썬 분야·챕터·레슨·복습·학습 기록 화면 |
| `subjects.js` | 학습 분야, 소개, 준비 상태, 예정 주제 |
| `visuals.js` | 정확한 수학 SVG 도식 |
| `curriculum.js` | 브라우저에서 사용하는 콘텐츠 묶음, 자동 생성 |
| `content/numbers.json` | 소인수분해, 정수와 유리수 |
| `content/algebra.json` | 문자와 식, 좌표와 그래프 |
| `content/geometry.json` | 기본도형, 위치 관계, 작도와 합동 |
| `content/shapes.json` | 평면도형과 입체도형 |
| `content/statistics.json` | 대푯값과 자료의 정리·해석 |
| `content/review.json` | 챕터 복습 10문제 |
| `content/SCHEMA.md` | 레슨 데이터 형식 |
| `build-content.py` | 콘텐츠 구조 검사와 묶음 생성 |
| `content/python/ch01/python-l001.json` ~ `python-l005.json` | 파이썬 챕터 1의 레슨과 25예제 |
| `content/python/ch01/review.json` | 파이썬 챕터 1 복습 10문제 |
| `content/python/ch02/python-l006.json` ~ `python-l010.json` | 파이썬 챕터 2의 레슨과 25예제 |
| `content/python/ch02/review.json` | 파이썬 챕터 2 복습 10문제 |
| `content/python/ch03/python-l011.json` ~ `python-l015.json` | 파이썬 챕터 3의 레슨과 25예제 |
| `content/python/ch03/review.json` | 파이썬 챕터 3 복습 10문제 |
| `content/python/ch04/python-l016.json` ~ `python-l020.json` | 파이썬 챕터 4의 레슨과 25예제 |
| `content/python/ch04/review.json` | 파이썬 챕터 4 복습 10문제 |
| `content/python/ch05/python-l021.json` ~ `python-l025.json` | 파이썬 챕터 5의 5레슨과 25예제 |
| `content/python/ch05/review.json` | 파이썬 챕터 5 복습 10문제 |
| `content/python/ch06/python-l026.json` ~ `python-l031.json` | 파이썬 챕터 6의 6레슨과 30예제 |
| `content/python/ch06/review.json` | 파이썬 챕터 6 복습 10문제 |
| `content/python/SCHEMA.md` | 파이썬 레슨·문제·코드 블록 형식과 검증 범위 |
| `build-python.py` | 파이썬 구조 검사, 선택적 코드 실행 검사, 묶음 생성 |
| `python-content.js` | `window.PYTHON_COURSES`의 여섯 챕터 콘텐츠 묶음, 자동 생성 |
| `preview.html` | PC·모바일 화면 비교 |
| `previews/` | 과목 홈페이지와 기존 중1 화면 캡처 |
| `verification.md` | 검증 범위와 알려진 제약 |

수학 JSON 콘텐츠를 수정한 뒤 아래 명령으로 `curriculum.js`를 다시 생성합니다.

```bash
python3 build-content.py
node --check app.js
node --check subjects.js
node --check visuals.js
node --check curriculum.js
```

`content/*.json`과 생성된 `curriculum.js`를 함께 커밋합니다. 콘텐츠 생성에는 Python 표준 라이브러리만 사용합니다.

파이썬 JSON을 수정한 뒤에는 다음 명령으로 구조와 본문·풀이 예시·문항의 예시 답에 있는 코드의 예상 출력 및 오류 종류를 확인하고 `python-content.js`를 생성합니다.

```bash
python3 build-python.py --check-code
node --check python-content.js
node --check python-ui.js
node --check app.js
```

수정한 `content/python/ch01/*.json`·`content/python/ch02/*.json`·`content/python/ch03/*.json`·`content/python/ch04/*.json`·`content/python/ch05/*.json`·`content/python/ch06/*.json`과 생성된 `python-content.js`를 함께 커밋합니다. 생성물은 `window.PYTHON_COURSES` 배열이며 `window.PYTHON_CH01`·`window.PYTHON_CH02`·`window.PYTHON_CH03`·`window.PYTHON_CH04`·`window.PYTHON_CH05`·`window.PYTHON_CH06` 별칭도 제공해 기존 미리보기와 호환합니다. `--check-code`는 본문·풀이 예시 및 문항의 `solution.code` 중 Python 코드 블록을 임시 파일에서 실행하며, `input()` 코드에는 블록의 고정 입력 예시를 전달합니다. 터미널 명령·대화형 기록과 질문에 제시한 코드 문자열은 자동 실행 대상이 아니므로 문항의 요구, 예시 답과 해설이 맞는지도 별도로 검토합니다. 이 검사는 브라우저 사용성이나 배포 검증을 대신하지 않습니다.

## 페이지 경로

- `#/`: 전체 학습 분야
- `#/subjects/math`: 수학
- `#/subjects/python`: 파이썬 기초 분야 홈
- `#/python/ch01`: 파이썬 챕터 1 목차
- `#/python/ch01/lesson/python-l001`: 파이썬 첫 레슨 (`python-l005`까지)
- `#/python/ch01/review`: 파이썬 챕터 1 복습
- `#/python/ch02`: 파이썬 챕터 2 목차
- `#/python/ch02/lesson/python-l006`: 파이썬 챕터 2 첫 레슨 (`python-l010`까지)
- `#/python/ch02/review`: 파이썬 챕터 2 복습
- `#/python/ch03`: 파이썬 챕터 3 목차
- `#/python/ch03/lesson/python-l011`: 파이썬 챕터 3 첫 레슨 (`python-l015`까지)
- `#/python/ch03/review`: 파이썬 챕터 3 복습
- `#/python/ch04`: 파이썬 챕터 4 목차
- `#/python/ch04/lesson/python-l016`: 파이썬 챕터 4 첫 레슨 (`python-l020`까지)
- `#/python/ch04/review`: 파이썬 챕터 4 복습
- `#/python/ch05`: 파이썬 챕터 5 목차
- `#/python/ch05/lesson/python-l021`: 파이썬 챕터 5 첫 레슨 (`python-l025`까지)
- `#/python/ch05/review`: 파이썬 챕터 5 복습
- `#/python/ch06`: 파이썬 챕터 6 목차
- `#/python/ch06/lesson/python-l026`: 파이썬 챕터 6 첫 레슨 (`python-l031`까지)
- `#/python/ch06/review`: 파이썬 챕터 6 복습
- `#/math/middle-1`: 중학교 1학년 목차
- `#/math/middle-1/lesson/<레슨 ID>`: 수학 레슨
- `#/math/middle-1/review`: 중1 챕터 복습
- `#/progress`: 내 학습
- `#/settings`: 화면 테마 설정

기존 `#/chapter`, `#/lesson/<레슨 ID>`, `#/review` 링크도 새 경로로 연결됩니다.
새 분야는 `subjects.js`에서 관리하며 실제 학습 과정이 추가되면 해당 분야의 경로와 화면도 연결합니다.

## 학습 기록

기존 수학 저장 키(`understand-math-grade1-v1`)와 수학의 예제·복습 점수 기능을 유지합니다. 파이썬 챕터 1은 기존 `academy-python-ch01-v1`에서 읽음 표시와 최근 레슨을 이어가고, 챕터 2는 `academy-python-ch02-v1`, 챕터 3은 `academy-python-ch03-v1`, 챕터 4는 `academy-python-ch04-v1`, 챕터 5는 `academy-python-ch05-v1`, 챕터 6은 `academy-python-ch06-v1`에 별도로 기록합니다. 파이썬의 이전 버전에서 저장한 유효한 `scores` 데이터는 삭제하지 않지만 표시하거나 새로 채점하지 않습니다. 새 챕터를 추가해도 기존 챕터 1~4·수학 기록과 테마 설정은 유지합니다.

학습 기록은 현재 브라우저의 `localStorage`에 저장됩니다. 서버 계정 기반 저장이나 기기 간 자동 동기화는 구현하지 않았습니다. 다른 도메인으로 접속하면 기존 사이트의 학습 기록은 자동 이전되지 않습니다.

## 수학 교육 범위

2022 개정 중학교 1학년 범위를 기준으로 독자적으로 작성한 설명과 문제입니다. 범위 확인에 참고한 목차:

- [EBS 중1 상](https://mid.ebs.co.kr/course/view?courseId=100006134)
- [EBS 중1 하](https://mid.ebs.co.kr/course/view?courseId=100006214)

복습 10문제는 전 범위의 핵심 원리를 연결하는 종합 점검이며, 모든 세부 기능을 각각 평가하지는 않습니다. 필요한 세부 개념은 연결된 레슨과 예제에서 다시 확인할 수 있습니다.

## 배포 관계

이 저장소에서 GitHub Pages 사이트의 소스를 관리합니다. 기존 ChatGPT Sites 주소와의 자동 동기화는 설정하지 않았습니다. 사이트 고유 배포 식별자나 접근 자격증명은 포함하지 않습니다.


## 다크모드 시안

색감 비교용 [다크모드 시안 6개](designs/dark/index.html)를 별도 페이지에 준비했습니다. 포레스트·미드나이트·차콜에 모던 블랙 2개와 먹물 콘셉트를 추가했습니다. 같은 파이썬 레슨·예제 목록·홈을 PC와 모바일로 비교할 수 있습니다. 현재는 상단 **설정 → 화면 테마**에서 기본 밝은 테마와 다크 테마 6개를 모두 선택할 수 있습니다. 범위와 검증 기록은 [시안 문서](designs/dark/README.md)를 참고합니다.


## 화면 테마 설정

상단 **설정** (`#/settings`)에서 여백의 교과서(기본 밝은 화면), 딥 포레스트, 미드나이트 블루, 웜 차콜, 매트 블랙, 블랙 글래스, 먹빛 서재 중 선택합니다. 선택 즉시 홈·수학·파이썬·문제 풀이·내 학습에 적용되며, `academy-theme-v1`에 저장해 다음 접속 때 첫 화면부터 복원합니다. 같은 브라우저의 다른 탭에도 반영됩니다. 기기 간 자동 동기화는 없으므로 PC와 모바일에서는 각각 고릅니다. 브라우저가 저장을 차단하면 현재 화면에는 적용하고 저장할 수 없음을 안내합니다. 테마 설정은 수학·파이썬 학습 기록과 별개입니다.
