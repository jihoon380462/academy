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
| 02 | 파이썬 | 기초 9챕터·46레슨 구현, 챕터 7~9 로컬 검증·PR #6 병합·Pages 배포·공개 화면 확인 완료. 확인 범위는 검증 기록 참고 |
| 03 | C++/# | 준비 중 |
| 04 | 알고리즘·자료구조 | 챕터 1~9 · 56레슨·280예제·90복습 구현. 학습 단계 보완도 PR #23 병합·Pages 배포·공개 확인 완료. 병합·공개 배포는 검증 기록과 구분 |
| 05 | CS | 챕터 1 초기판의 5레슨·25예제·10복습 공개(PR #25 / SHA `593de2a`), 초보 안내 개정은 PR #29 / SHA `5d0210c`의 main 병합·Pages 배포 완료, 공개 PC·모바일 확인 완료. 챕터 2 「데이터를 비트로 표현하기」의 새 5레슨·25예제·10복습은 PR #27 / SHA `733d7bc`의 main 병합·Pages 배포 완료, 공개 PC·모바일 확인 완료 |
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

현재 공개 사이트에는 수학·파이썬·알고리즘·자료구조·CS의 **4개 분야 · 총 142개 레슨**이 연결되어 있습니다. 수학 30레슨·파이썬 46레슨·알고리즘 56레슨·CS 10레슨이며, 나머지 18개 분야는 준비 중입니다. CS는 2챕터·10레슨·50예제·20복습이며 사이트 전체는 21개 과정 키를 사용합니다. 챕터 2는 [PR #27](https://github.com/jihoon380462/academy/pull/27)로 main에 병합했고 SHA `733d7bc`의 [Pages 실행](https://github.com/jihoon380462/academy/actions/runs/43024153876)이 성공했습니다. 공개 PC·모바일 확인을 완료했으며 챕터 1 공개 당시 137레슨·20개 과정 키의 검증 이력과 구분합니다. CS 챕터 1은 PR #25로 main에 병합했고 SHA `593de2a`의 Pages 배포·공개 PC/모바일 확인을 완료했습니다. CS 추가 전 공개 3개 분야·132레슨의 검증과 이번 확인 범위는 검증 기록에서 구분합니다. 알고리즘 챕터 1은 PR #10, 챕터 2·3은 [PR #11](https://github.com/jihoon380462/academy/pull/11)로 main에 병합했고, 병합 SHA `4c85004`의 [Pages 배포](https://github.com/jihoon380462/academy/actions/runs/42775841237)가 성공했고 공개 브라우저에서 새 챕터와 기록 이동을 확인했습니다. 실제 확인 범위와 소스는 검증 기록으로 구분합니다. 챕터 4·5도 [PR #15](https://github.com/jihoon380462/academy/pull/15)로 main에 병합했고 SHA `91e4e82`의 [Pages 배포](https://github.com/jihoon380462/academy/actions/runs/42835323465)와 공개 브라우저 확인을 완료했습니다. 챕터 6~9의 23레슨도 [PR #17](https://github.com/jihoon380462/academy/pull/17)로 main에 병합했고 SHA `3966739`의 [Pages 배포](https://github.com/jihoon380462/academy/actions/runs/42840665951)와 공개 브라우저 확인을 완료했습니다. 파이썬 기초와 파이썬 실전, 터미널·Git과 GitHub 등은 각각 별도의 분야로 구분합니다. 실제 배포·화면 검증 기록은 [verification.md](verification.md)를 확인합니다.

## 수학 과정 구성

- 하나의 중1 챕터 안에 **8개 단원 · 30개 레슨**
- 레슨마다 원리 설명 3단계, 도식, 풀이 예시, 오개념 설명, 핵심 정리
- 레슨별 예제 5개: **총 150문제**
- 챕터 종합 복습 **10문제**, 해설과 관련 레슨 연결
- 개념 검색, 이어 배우기, 읽음 표시, 예제·복습 결과 기록
- 레슨 하단과 예제 풀이 결과에서 해당 단원이 펼쳐진 목차로 돌아가기
- 한 단원의 모든 레슨을 읽음 표시하면 수학 홈·목차·레슨 사이드바·복습의 단원 제목에 ‘✓ 모두 읽음’ 표시. 읽음 취소 시 해제하며 문제 점수와 별도로 계산
- 설치나 패키지 다운로드 없이 실행하는 HTML/CSS/JavaScript 정적 사이트

## CS 과정 구성

현재 챕터 1의 5레슨·25예제·10복습을 초보자가 따라가기 쉽게 개정하고 로컬 검증을 완료했습니다. 이번 개정은 [PR #29](https://github.com/jihoon380462/academy/pull/29)로 main에 병합했고 SHA `5d0210c`의 [Pages 실행](https://github.com/jihoon380462/academy/actions/runs/43028002455)이 성공했습니다. 공개 PC·모바일 확인을 완료했습니다. 용어 정의와 작은 작동 예·중간 과정을 먼저 설명하고, 실제 도식·핵심 강조·모든 예제/복습의 해야 할 일과 답 형식을 제공합니다. 관찰 가능한 범위와 고쳐 쓸 문장·조건을 명시합니다. 기존 공개 초기판과 이번 개정의 검증·병합·배포·공개 확인을 구분하며, 레슨 수·ID·URL·기록 키와 챕터 2 콘텐츠는 유지합니다.

[과목 문서](docs/curriculum/cs.md)의 챕터 1 「컴퓨터를 설명하는 층」 초기판을 구현했습니다. [PR #25](https://github.com/jihoon380462/academy/pull/25)로 main에 병합했고 SHA `593de2a`의 [Pages 실행](https://github.com/jihoon380462/academy/actions/runs/43016086263) 성공과 공개 PC·모바일 화면 확인을 완료했습니다. 특별한 프로그래밍 선행 없이 작은 학습 메모 사례로 입력·처리·출력·저장, 하드웨어·운영체제·응용 프로그램의 책임, 추상화·인터페이스, 프로그램·데이터, 상태 변화를 설명합니다.

- 개정판의 main 병합·Pages 배포·공개 확인을 마친 챕터 1: `cs-l001`~`cs-l005`의 5레슨·25예제·10복습
- main 병합·Pages 배포를 마친 챕터 2 「데이터를 비트로 표현하기」: `cs-l006`~`cs-l010`의 5레슨·25예제·10복습. 두 챕터를 합친 현재 소스는 10레슨·50예제·20복습
- 챕터 2의 실제 도식(cells/flow/table), 핵심 강조·문항 안내 방식을 챕터 1에도 적용하는 개정. 챕터 1~2의 모든 예제·복습에 해야 할 일과 답 형식을 명시
- 자기 말로 설명·역할 구분·작은 흐름 추적을 연습하는 세로 문제 목록과 접힌 예시 답·해설
- 분야 홈·접힌 챕터 목차·레슨·복습·내 학습과 읽음·최근 레슨 연결
- `academy-cs-ch01-v1`·`academy-cs-ch02-v1`에 챕터별로 독립 기록하며 파일·복사 코드 옮기기에 포함. 챕터 2 추가 전 20개 과정 키·테마를 보존하고 챕터 2가 없는 옛 자료를 가져와도 현재 챕터 2 원문 기록을 지우지 않음
- 텍스트·도식은 읽기 자료이며 코드 실행·자동 채점·점수를 제공하지 않음

원본은 `content/cs/ch01/`·`ch02/`이며 [콘텐츠 형식](content/cs/SCHEMA.md)에 따라 `python3 build-cs.py`로 `cs-content.js`를 생성하고 `python3 build-cs.py --check`로 구조·생성물 일치를 확인합니다. `window.CS_COURSES`와 `window.CS_CH01`을 제공하며 `cs-ui.js`가 화면을 렌더합니다. 챕터 2는 main 병합·Pages 배포를 완료했고 공개 PC·모바일 확인을 완료했습니다. 챕터 3~9는 설계만 완료했습니다. 챕터 1의 공개 이력과 새 챕터 2의 실제 검증 결과·main 병합·Pages 배포·공개 확인은 [verification.md](verification.md)에서 구분합니다.

## 알고리즘·자료구조 과정 구성

알고리즘 이름은 `DFS(깊이 우선 탐색)`, `BFS(너비 우선 탐색)`, `DP(동적 계획법)`, `Binary Search(이진 탐색)`처럼 영어/표준 약어와 한글을 함께 표시합니다. 이름 표기 개편은 [PR #21](https://github.com/jihoon380462/academy/pull/21)로 main에 병합했고 해당 코드의 Pages 배포·공개 PC/모바일 확인을 완료했습니다. 정확한 소스와 검증 범위는 검증 기록을 따릅니다.

레슨의 예제는 1번에서 핵심 개념을 설명하고, 중요한 개념은 2번까지 설명합니다. 나머지는 함수의 입력·반환 조건과 확인 사례를 보고 알고리즘을 직접 작성·실행하는 문제입니다. 예시 구현과 출력은 접힌 풀이에서 확인합니다. 전체 54레슨의 설명 55개·직접 구현 215개 개편은 [PR #19](https://github.com/jihoon380462/academy/pull/19)로 main에 병합했고 해당 코드의 Pages 배포·공개 PC/모바일 확인을 완료했습니다. 정확한 소스와 검증 범위는 `verification.md`에 구분합니다.

[과목 문서](docs/curriculum/algorithms.md)의 **전체 9챕터 · 56레슨·280예제·90복습**을 현재 소스에 구현했습니다. [학습 단계 보완](docs/ALGORITHMS-PROGRESSION.md)에 따라 동적 배열 실습 l055와 0/1 DP l056을 추가하고 연결 리스트·검색·트리·BFS·DP·윈도우의 발판을 보완했습니다. 기존 ID·URL·저장 키와 예제/복습 수량을 유지합니다. 학습 단계 보완도 [PR #23](https://github.com/jihoon380462/academy/pull/23)으로 main에 병합했고 SHA `4cf32b7`의 [Pages 실행](https://github.com/jihoon380462/academy/actions/runs/42956725084)과 공개 PC·모바일 확인을 완료했습니다. 기존 54레슨의 검증과 이번 변경의 로컬·공개 확인 범위는 검증 기록에서 구분합니다.

- 챕터 1 ‘문제를 절차로 바꾸기’ (`algorithms-l001`~`algorithms-l006`): 계약·제약·작은 사례·반례·불변식·종료와 경계
- 챕터 2 ‘시간과 공간을 세는 법’ (`algorithms-l007`~`algorithms-l012`): 연산 수·성장률·반복 비용·경우별 비용·추가 공간·분할 상환과 측정
- 챕터 3 ‘순서를 저장하는 구조’ (`algorithms-l013` → `algorithms-l055` → `algorithms-l014`~`algorithms-l018`): 배열·확장 직접 구현·연결 리스트·삽입과 삭제·스택·큐/덱·추상 자료형
- 챕터 4 ‘키로 찾는 집합과 맵’ (`algorithms-l019`~`algorithms-l024`): 집합·맵·해시·충돌·부하율·키의 동일성·중복 제거/빈도표
- 챕터 5 ‘정렬하고 찾기’ (`algorithms-l025`~`algorithms-l031`): 선형/이진 탐색·경계 위치·선택/삽입 정렬·재귀·병합 정렬·정렬 키와 안정성
- 챕터 6 ‘트리와 우선순위’ (`algorithms-l032`~`algorithms-l036`): 트리 구조·순회·탐색 트리·힙·상위 항목 선택
- 챕터 7 ‘관계를 그래프로 다루기’ (`algorithms-l037`~`algorithms-l042`): 그래프 표현·DFS/BFS·순환과 위상 정렬·다익스트라·비용
- 챕터 8 ‘문제를 나누는 전략’ (`algorithms-l043`~`algorithms-l047` → `algorithms-l056` → `algorithms-l048`): 완전 탐색·백트래킹·탐욕·메모이제이션·동적 계획법·결과 복원
- 챕터 9 ‘실제 데이터 처리에 적용하기’ (`algorithms-l049`~`algorithms-l054`): 누적값·두 포인터·문자열·스트리밍·캐시·두 해법 선택 보고서
- 챕터 3·5·8은 각각 7레슨·35예제, 챕터 6은 5레슨·25예제이며 나머지 5챕터는 각각 6레슨·30예제입니다. 모든 챕터에 복습 10개와 관련 레슨 연결을 둡니다. 레슨마다 원리 설명·의사코드·추적·작동 예시·오개념·핵심 정리·예제 5개를 제공합니다.
- 손으로 명세·상태·비용을 적고 Python 구현은 PC에서 직접 실행합니다. 예시 답·해설은 접혀 있으며 사이트 내부 실행·자동 채점·점수는 제공하지 않습니다.
- 읽음·최근 레슨은 `academy-algorithms-ch01-v1`·`academy-algorithms-ch02-v1`·`academy-algorithms-ch03-v1`·`academy-algorithms-ch04-v1`·`academy-algorithms-ch05-v1`·`academy-algorithms-ch06-v1`·`academy-algorithms-ch07-v1`·`academy-algorithms-ch08-v1`·`academy-algorithms-ch09-v1`에 각각 저장하며 내 학습과 파일·복사 코드 옮기기에 포함합니다. 이전 10개/11개/13개/15개 과정만 든 자료를 가져와도 새 챕터 기록은 지우지 않습니다. 새 키를 포함한 자료는 해당 챕터를 지원하는 사이트에서 가져와야 합니다.

[콘텐츠 형식](content/algorithms/SCHEMA.md)에 따라 `python3 build-algorithms.py --check-code`로 작성자 코드의 예상 출력을 검증하고 `algorithms-content.js`를 생성합니다. `python3 build-algorithms.py --check --check-code`는 생성물의 최신 여부까지 확인합니다. 이론 모델과 CPython 구현, 연산 횟수와 실측 시간, 평균과 분할 상환을 구분하며 실행 환경은 CPython 3.12.14 / Linux입니다. 병합·Pages 배포·공개 화면 확인은 [검증 기록](verification.md)을 따릅니다.

## 파이썬 과정 구성

기초 과정의 설계된 **9챕터·46레슨**을 모두 구현했습니다. 챕터 1~5·7~9는 각각 5레슨, 챕터 6은 6레슨입니다. 챕터 7~9는 구현·로컬 검증 후 [PR #6](https://github.com/jihoon380462/academy/pull/6)으로 main에 병합했습니다. 병합 SHA `e6f8c77`의 [Pages 배포](https://github.com/jihoon380462/academy/actions/runs/42688604917)가 성공했고 [공개 사이트](https://jihoon380462.github.io/academy/)의 PC·모바일 화면을 확인했습니다. 실제 확인 범위와 소스 SHA는 [검증 기록](verification.md)에 구분합니다. 현재 기초 목차에 미구현 레슨은 없으며 추가 집필은 사용자 요청에 따릅니다. 목표와 과목 경계는 [파이썬 과목 문서](docs/curriculum/python.md)에 있습니다. 이후 운영 문서 변경은 위 코드 배포 SHA와 별도이며, `VERSION`의 `0.1.0`은 아직 릴리스 태그로 확정하지 않은 목표 번호입니다.

- 챕터 1: 프로그램·실행 결과, 인터프리터·파일, 문자열 출력, 순서·들여쓰기·주석, 오류 읽기의 5레슨
- 챕터 2: 변수와 재대입, 정수·실수 연산, 문자열·숫자 변환, 비교·불리언·논리 연산, 입력받아 계산하고 출력하는 5레슨
- 챕터 3: 인덱스·음수 인덱스, 슬라이싱, 문자열 메서드·반환값, 나누기·합치기·검색, f-string 출력의 5레슨
- 챕터 4: if와 들여쓰기, elif·else, 논리 조건 결합, 빈 값·None·참 거짓 판정, 경계값·중첩 조건의 5레슨
- 챕터 5: for·range·while, 합계·개수·최댓값 누적, break·continue·중첩 반복의 5레슨
- 챕터 6: 리스트·튜플·딕셔너리·집합, 순회·컴프리헨션, 별칭·얕은 복사의 6레슨
- 챕터 7: 함수 정의·호출, 매개변수·반환값, 이름 범위, 기본값·가변 객체 공유, 작은 함수 조합의 5레슨
- 챕터 8: 표준·내 모듈, 실행 진입점, traceback·예외 처리, 텍스트 파일·with, 가상환경·패키지의 5레슨
- 챕터 9: 객체·타입·메서드, 클래스·인스턴스, 초기화·상태, 함수와 클래스 선택, 기초 스크립트 통합의 5레슨
- 레슨별 개념 설명, 코드와 예상 출력, 작동 예시, 오해 바로잡기, 핵심 요점
- 레슨마다 예제 5개: **총 230문제**를 본문에 세로로 나열
- 챕터마다 복습 10개: **총 90문제**를 세로로 나열하고, 각 챕터의 핵심 다시 보기·관련 레슨 연결 제공
- 각 문제의 접힌 예시 답·해설을 펼쳐 자신의 코드와 비교
- 읽음 표시, 최근 레슨에서 이어 배우기

파이썬 문제는 사용자가 PC에서 직접 타이핑할 수 있도록 나열하는 방식입니다. 코드를 작성·실행·수정하거나 예상 결과와 이유를 적은 뒤, 필요한 문제의 예시 답과 해설을 펼쳐 확인합니다. 객관식 선택, 퀴즈 모달, 자동 채점과 점수 표시는 제공하지 않습니다. 다음 파이썬 챕터도 이 형식을 이어갑니다.

기본 Python 3 코드로 작성했으며 코드 검증 환경은 **Python 3.12.14**입니다. PC·모바일에서 문제와 설명을 읽을 수 있고, 직접 실행하는 IDLE·터미널 절차는 레슨 2에서 안내합니다. `input()` 예시 입력과 여러 파일 실습의 파일명·함께 둘 파일·실행 후 파일은 읽기 전용 자료입니다. 학습자는 PC에서 파일을 준비하고 실행하며 사이트에 코드 실행기는 없습니다. 가상환경의 경로·버전처럼 환경별로 다른 출력은 고정 정답으로 표시하지 않으며, 연습용 venv 생성·실행 경로·pip 확인은 네트워크 패키지 설치 없이 검증했습니다. 공식 문서와 확인 범위는 [파이썬 과목 문서](docs/curriculum/python.md)에 기록했습니다.

## 실행

저장소 루트에서 다음 명령을 실행하고 `http://localhost:8000`에 접속합니다.

```bash
python3 -m http.server 8000
```

## 기록 이동 기능 검증

데이터 검증·병합·저장 실패 복구와 비동기 UI 회귀 검사는 Node.js에서 실행합니다.

```bash
node tests/progress-transfer.test.cjs
node tests/progress-transfer-ui.test.cjs
```

로컬 서버를 켜 둔 상태에서 Playwright·Chromium이 설치된 개발 환경이라면 `node tests/progress-transfer-browser.cjs`로 별도 PC·모바일 브라우저의 파일·코드 이동을 확인할 수 있습니다. 필요한 경우 `ACADEMY_BASE_URL`과 `CHROMIUM_PATH`로 사이트 주소와 브라우저 경로를 지정합니다. 사이트 실행에는 이 테스트 도구가 필요하지 않습니다.

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
| `settings.css` | 화면 테마·기록 옮기기 설정의 반응형 배치 |
| `progress-transfer.js` | 학습 기록 내보내기 자료 생성·입력 검증·기존 기록 병합·저장 실패 복구 |
| `transfer-ui.js` | 설정의 파일·복사 코드 옮기기, 가져올 기록 미리보기와 반영 |
| `app.js` | 과목·과정 페이지 이동, 수학 목차 검색·문제 풀이, 과목별 학습 기록 |
| `python.css` | 파이썬 페이지·코드 블록의 반응형 디자인 |
| `python-ui.js` | 파이썬 분야·챕터·레슨·복습·학습 기록 화면 |
| `algorithms-ui.js` | 알고리즘 분야·목차·레슨·복습·학습 기록 화면 |
| `algorithms-content.js` | 알고리즘 콘텐츠 생성 묶음 |
| `cs-ui.js` | CS 분야·목차·레슨·복습·학습 기록 화면 |
| `cs-content.js` | CS 콘텐츠 생성 묶음 |
| `content/cs/ch01/` | CS 챕터 1의 메타데이터·5레슨·25예제·10복습 원본 |
| `content/cs/ch02/` | 로컬 검증을 마친 CS 챕터 2의 메타데이터·5레슨·25예제·10복습 원본 |
| `content/cs/SCHEMA.md` | CS 텍스트 도식·레슨·문제의 데이터 형식 |
| `build-cs.py` | CS 구조·ID·수량 검사와 묶음 생성 |
| `content/algorithms/ch01/` | 알고리즘 챕터 1의 원본·6레슨·30예제·10복습 |
| `content/algorithms/ch02/`·`ch03/` | 알고리즘 챕터 2·3의 원본·13레슨·65예제·20복습 |
| `content/algorithms/ch04/`·`ch05/` | 알고리즘 챕터 4·5의 원본·13레슨·65예제·20복습 |
| `content/algorithms/ch06/`~`ch09/` | 알고리즘 챕터 6~9의 원본·24레슨·120예제·40복습 |
| `build-algorithms.py` | 알고리즘 구조·작성자 코드 검증과 묶음 생성 |
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
| `content/python/ch07/python-l032.json` ~ `python-l036.json` | 파이썬 챕터 7의 5레슨과 25예제 |
| `content/python/ch07/review.json` | 파이썬 챕터 7 복습 10문제 |
| `content/python/ch08/python-l037.json` ~ `python-l041.json` | 파이썬 챕터 8의 5레슨과 25예제 |
| `content/python/ch08/review.json` | 파이썬 챕터 8 복습 10문제 |
| `content/python/ch09/python-l042.json` ~ `python-l046.json` | 파이썬 챕터 9의 5레슨과 25예제 |
| `content/python/ch09/review.json` | 파이썬 챕터 9 복습 10문제 |
| `content/python/SCHEMA.md` | 파이썬 레슨·문제·코드 블록 형식과 검증 범위 |
| `build-python.py` | 파이썬 구조 검사, 선택적 코드 실행 검사, 묶음 생성 |
| `python-content.js` | `window.PYTHON_COURSES`의 아홉 챕터 콘텐츠 묶음, 자동 생성 |
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

수정한 `content/python/ch01/*.json`·`content/python/ch02/*.json`·`content/python/ch03/*.json`·`content/python/ch04/*.json`·`content/python/ch05/*.json`·`content/python/ch06/*.json`·`content/python/ch07/*.json`·`content/python/ch08/*.json`·`content/python/ch09/*.json`과 생성된 `python-content.js`를 함께 커밋합니다. 생성물은 `window.PYTHON_COURSES` 배열이며 `window.PYTHON_CH01`·`window.PYTHON_CH02`·`window.PYTHON_CH03`·`window.PYTHON_CH04`·`window.PYTHON_CH05`·`window.PYTHON_CH06`·`window.PYTHON_CH07`·`window.PYTHON_CH08`·`window.PYTHON_CH09` 별칭도 제공해 기존 미리보기와 호환합니다. `--check-code`는 본문·풀이 예시 및 문항의 `solution.code` 중 Python 블록을 각각 새 임시 폴더에서 실행합니다. `input`은 고정 stdin, `files`는 함께 둘 UTF-8 파일, `expectedFiles`는 실행 후 파일의 정확한 내용입니다. 파일 결과는 마지막 줄바꿈까지 비교하고, 예상 stdout은 끝의 개행만 제외해 비교합니다. `filename`으로 주 실행 파일명을 정할 수 있으며 로컬 모듈을 함께 둘 때는 해당 블록 폴더만 검색 경로에 추가합니다. 필드 제약과 표시 방식은 [콘텐츠 스키마](content/python/SCHEMA.md)를 따릅니다. 터미널 명령·환경별 출력 코드·질문의 코드 문자열은 자동 실행 대상이 아니므로 문항의 요구·예시 답·해설과 실제 환경은 별도로 검토합니다. 이 검사는 브라우저 사용성이나 배포 검증을 대신하지 않습니다.

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
- `#/python/ch07`: 파이썬 챕터 7 목차
- `#/python/ch07/lesson/python-l032`: 파이썬 챕터 7 첫 레슨 (`python-l036`까지)
- `#/python/ch07/review`: 파이썬 챕터 7 복습
- `#/python/ch08`: 파이썬 챕터 8 목차
- `#/python/ch08/lesson/python-l037`: 파이썬 챕터 8 첫 레슨 (`python-l041`까지)
- `#/python/ch08/review`: 파이썬 챕터 8 복습
- `#/python/ch09`: 파이썬 챕터 9 목차
- `#/python/ch09/lesson/python-l042`: 파이썬 챕터 9 첫 레슨 (`python-l046`까지)
- `#/python/ch09/review`: 파이썬 챕터 9 복습
- `#/subjects/cs`: CS 분야 홈
- `#/cs/ch01`: CS 챕터 1 목차
- `#/cs/ch01/lesson/cs-l001`: CS 첫 레슨 (`cs-l005`까지)
- `#/cs/ch01/review`: CS 챕터 1 복습
- `#/cs/ch02`: CS 챕터 2 목차
- `#/cs/ch02/lesson/cs-l006`: CS 챕터 2 첫 레슨 (`cs-l010`까지)
- `#/cs/ch02/review`: CS 챕터 2 복습
- `#/subjects/algorithms`: 알고리즘·자료구조 분야 홈
- `#/algorithms/ch01`: 알고리즘 챕터 1 목차
- `#/algorithms/ch01/lesson/algorithms-l001`: 알고리즘 첫 레슨 (`algorithms-l006`까지)
- `#/algorithms/ch01/review`: 알고리즘 챕터 1 복습
- `#/algorithms/ch02` · `#/algorithms/ch02/lesson/algorithms-l007` · `#/algorithms/ch02/review`: 챕터 2 목차·첫 레슨(`algorithms-l012`까지)·복습
- `#/algorithms/ch03` · `#/algorithms/ch03/lesson/algorithms-l013` · `#/algorithms/ch03/review`: 챕터 3 목차·첫 레슨(`algorithms-l018`까지)·복습
- `#/algorithms/ch04` · `#/algorithms/ch04/lesson/algorithms-l019` · `#/algorithms/ch04/review`: 챕터 4 목차·첫 레슨(`algorithms-l024`까지)·복습
- `#/algorithms/ch05` · `#/algorithms/ch05/lesson/algorithms-l025` · `#/algorithms/ch05/review`: 챕터 5 목차·첫 레슨(`algorithms-l031`까지)·복습
- `#/algorithms/ch06` · `#/algorithms/ch06/lesson/algorithms-l032` · `#/algorithms/ch06/review`: 챕터 6 목차·첫 레슨(`algorithms-l036`까지)·복습
- `#/algorithms/ch07` · `#/algorithms/ch07/lesson/algorithms-l037` · `#/algorithms/ch07/review`: 챕터 7 목차·첫 레슨(`algorithms-l042`까지)·복습
- `#/algorithms/ch08` · `#/algorithms/ch08/lesson/algorithms-l043` · `#/algorithms/ch08/review`: 챕터 8 목차·첫 레슨(`algorithms-l048`까지)·복습
- `#/algorithms/ch09` · `#/algorithms/ch09/lesson/algorithms-l049` · `#/algorithms/ch09/review`: 챕터 9 목차·첫 레슨(`algorithms-l054`까지)·복습
- `#/math/middle-1`: 중학교 1학년 목차
- `#/math/middle-1/lesson/<레슨 ID>`: 수학 레슨
- `#/math/middle-1/review`: 중1 챕터 복습
- `#/progress`: 내 학습
- `#/settings`: 화면 테마와 학습 기록 옮기기 설정

기존 `#/chapter`, `#/lesson/<레슨 ID>`, `#/review` 링크도 새 경로로 연결됩니다.
새 분야는 `subjects.js`에서 관리하며 실제 학습 과정이 추가되면 해당 분야의 경로와 화면도 연결합니다.

## 학습 기록

기존 수학 저장 키(`understand-math-grade1-v1`)와 수학의 예제·복습 점수 기능을 유지합니다. 파이썬은 `academy-python-ch01-v1`·`academy-python-ch02-v1`·`academy-python-ch03-v1`·`academy-python-ch04-v1`·`academy-python-ch05-v1`·`academy-python-ch06-v1`·`academy-python-ch07-v1`·`academy-python-ch08-v1`·`academy-python-ch09-v1`에 챕터별 읽음 표시와 최근 레슨을 따로 기록합니다. 파이썬의 이전 버전에서 저장한 유효한 `scores` 데이터는 삭제하지 않지만 표시하거나 새로 채점하지 않습니다. 알고리즘 챕터 1~9의 읽음·최근 레슨은 `academy-algorithms-ch01-v1`·`academy-algorithms-ch02-v1`·`academy-algorithms-ch03-v1`·`academy-algorithms-ch04-v1`·`academy-algorithms-ch05-v1`·`academy-algorithms-ch06-v1`·`academy-algorithms-ch07-v1`·`academy-algorithms-ch08-v1`·`academy-algorithms-ch09-v1`에 각각 따로 저장하며 점수를 새로 기록하지 않습니다. CS 챕터 1은 `academy-cs-ch01-v1`, 이번 챕터 2는 `academy-cs-ch02-v1`에 읽음·최근 레슨을 따로 저장하는 구성입니다. 현재 소스는 전체 21개 과정 키를 사용하며 챕터 2 추가 전 20개 키를 보존합니다. 챕터 2가 없는 이전 기록 자료를 가져와도 현재 해당 챕터 원문 기록을 지우지 않습니다. 새 챕터를 추가해도 기존 모든 파이썬 챕터·알고리즘·수학 기록과 테마 설정은 유지합니다.

학습 기록은 현재 브라우저의 `localStorage`에 저장됩니다. **기록은 이 브라우저에 저장되며, 설정에서 다른 기기로 옮길 수 있습니다.** 계정이나 서버 저장소를 사용하지 않고, 사이트가 기록을 서버로 보내지 않습니다. 기기 간 자동 동기화는 없으며 다른 브라우저·도메인으로 접속해도 기록이 자동으로 나타나지 않습니다.

### 다른 기기로 기록 옮기기

구현·main 병합·Pages 배포를 마쳤고 공개 사이트의 PC·모바일 브라우저에서 기록 이동을 확인했습니다. 실제 검증 범위와 배포 소스는 [검증 기록](verification.md)에 별도로 기록합니다.

1. 원래 기기의 **설정 → 학습 기록 옮기기**에서 기록 파일을 저장하거나 복사 코드를 만듭니다.
2. 자료를 원하는 기기로 직접 전달한 뒤, 그 기기의 같은 설정에서 파일을 선택하거나 코드를 붙여 넣습니다.
3. 파일을 선택하면 미리보기가 열립니다. 코드를 붙여 넣었다면 **가져올 기록 확인**을 누릅니다. 읽음 수·점수 기록 수·내보낸 시각을 확인하며, 미리보기만으로 현재 기록이 바뀌지는 않습니다.
4. 내용을 확인한 뒤 **기존 기록과 합쳐 가져오기**를 누릅니다. 화면 테마를 함께 가져오는 항목은 기본으로 선택되지 않으며, 선택한 경우에만 가져온 테마를 적용합니다.

읽음 표시는 두 기록을 합칩니다. 한 기기에서 읽음을 취소한 사실은 다른 기기로 전파하지 않으므로, 이전 파일을 다시 가져오면 그 파일의 읽음 표시가 다시 추가될 수 있습니다. 수학 최고 점수는 더 높은 값을 유지하고 최근 점수는 풀이 날짜가 더 최근인 기록을 사용합니다. 최근 레슨은 방문 시각이 더 최근인 쪽을 사용하며, 시각이 같으면 현재 기기의 기록을 우선합니다. 파이썬 9개 챕터의 과거 유효한 점수도 숨긴 상태로 보존하며 새 채점 기능을 만들지 않습니다.

가져올 자료를 검사하고 미리보기를 거쳐 사용자가 합치기를 요청한 뒤 저장합니다. 저장 중 실패하면 변경 전 저장 원문으로 복구를 시도하고, 복구하지 못한 항목이 있으면 안내합니다. 기존 수학·파이썬·테마 저장 키는 유지하며, 가져온 뒤에도 기록은 그 사이트와 브라우저 안에 저장됩니다. 다른 기기에서 이어 공부한 결과를 다시 옮기려면 새 파일이나 코드를 만들어 같은 절차를 반복합니다.

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

상단 **설정** (`#/settings`)에서 여백의 교과서(기본 밝은 화면), 딥 포레스트, 미드나이트 블루, 웜 차콜, 매트 블랙, 블랙 글래스, 먹빛 서재 중 선택합니다. 선택 즉시 홈·수학·파이썬·문제 풀이·내 학습에 적용되며, `academy-theme-v1`에 저장해 다음 접속 때 첫 화면부터 복원합니다. 같은 브라우저의 다른 탭에도 반영됩니다. 기기 간 자동 동기화는 없으며 PC와 모바일에서 각각 고를 수 있습니다. 학습 기록을 옮길 때 테마도 가져오는 항목을 선택하면 함께 적용할 수 있고, 선택하지 않으면 현재 테마를 유지합니다. 브라우저가 저장을 차단하면 현재 화면에는 적용하고 저장할 수 없음을 안내합니다. 테마 설정은 수학·파이썬 학습 기록과 별개입니다.
