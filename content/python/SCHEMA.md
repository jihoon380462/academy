# 파이썬 챕터 1 콘텐츠 형식

이 형식은 `python-ch01`의 실제 구현용이다. 수학 중1의 `content/SCHEMA.md`와 별개이며, 다른 챕터에 자동 적용하거나 기존 ID를 바꾸지 않는다. 집필 의도와 범위는 [시작 문서](../../docs/START-HERE.md), [집필 기준](../../docs/AUTHORING.md), [파이썬 목차](../../docs/curriculum/python.md)를 먼저 읽는다.

## 원본과 생성물

| 경로 | 역할 |
| --- | --- |
| `content/python/ch01/python-l001.json` ~ `python-l005.json` | 파일마다 레슨 객체 1개, 각 레슨에 예제 5개 |
| `content/python/ch01/review.json` | 복습 문항 객체 10개의 배열 |
| `build-python.py` | 원본 검사와 콘텐츠 묶음 생성 |
| `python-content.js` | 자동 생성된 `window.PYTHON_CH01`, 직접 수정하지 않음 |
| `python-ui.js` · `python.css` | 본문·코드·예상 출력·복습 화면과 반응형 디자인 |
| `app.js` | 경로, 문제 풀이, 검색, 과목별 저장 상태 연결 |

레슨 ID는 `python-l001`부터 `python-l005`, 순서는 1~5다. 제목은 과목 문서의 기존 제목과 정확히 맞춘다. 다음 챕터의 첫 ID는 `python-l006`이지만 현재 구현 범위에 포함하지 않는다.

## 레슨 객체

| 필드 | 형식과 집필 기준 |
| --- | --- |
| `id` | 고정 레슨 ID 문자열 |
| `order` | 챕터 1 안의 순서, 정수 1~5 |
| `title` | 설계 목차와 동일한 제목 |
| `subtitle` | 배우는 원리를 요약한 한국어 문장 |
| `minutes` | 개념을 읽는 대략적인 시간, 양의 정수 |
| `goal` | 이해하거나 수행할 수 있게 되는 목표 |
| `intro` | 왜 이 원리가 필요한지 연결하는 도입 |
| `sections` | 개념 설명 3~4개. 각 객체에 `title`, 문단 문자열 배열 `body`, 선택적 `code` |
| `worked` | 작동 예시. `question`, 이유를 따라가는 문자열 배열 `steps`, `answer`, 선택적 `code` |
| `misconception` | 대표 오해를 다루는 `question`과 `answer` |
| `keypoints` | 핵심 요점 문자열 3개 |
| `examples` | 이 레슨의 선택형 예제 5개 |

일반 본문은 HTML·Markdown을 포함하지 않는 평문이다. 코드 들여쓰기와 줄바꿈은 코드 문자열 안에 유지한다. 수업 설명은 직접 집필하며, 공식 문서의 예시를 복사해 목차를 채우는 방식으로 만들지 않는다.

## 본문·작동 예시의 코드 블록

```json
{
  "source": "print(\"안녕\")\nprint(2 + 3)",
  "kind": "python",
  "output": "안녕\n5",
  "error": null,
  "caption": "코드 파일을 실행하면 두 줄의 출력이 나타납니다."
}
```

| 필드 | 의미 |
| --- | --- |
| `source` | 비어 있지 않은 원문 문자열. 줄바꿈·들여쓰기 보존 |
| `kind` | `python`, `console`, `text` 중 하나 |
| `output` | 예상 표준 출력 문자열. `python` 블록에는 필수. 출력이 없으면 빈 문자열 `""` |
| `error` | 정상 실행이면 생략 또는 `null`. 의도적인 실패이면 `SyntaxError`, `ZeroDivisionError` 같은 오류 종류 |
| `caption` | 코드·예상 결과를 어떻게 읽을지 설명하는 선택적 문장 |

`python`은 저장한 Python 코드로 실행 가능한 블록이다. `console`은 운영체제 명령 또는 `>>>`가 포함된 대화형 화면 기록이며, `text`는 오류 메시지 등 읽을 텍스트다. 콘솔 기록을 Python 파일로 실행하거나 `>>>`를 코드 자체로 가르치지 않는다.

`output`은 stdout만 뜻한다. 오류가 나기 전에 출력된 글이 있다면 그 글을 적고 오류 종류는 `error`에 따로 기록한다. 버전에 따라 달라질 수 있는 traceback의 전체 문구·파일 경로·밑줄 모양을 고정된 검증값으로 삼지 않는다. 필요한 메시지 예시는 `text` 블록에 두고 설명한다.

사이트는 소스·예상 결과를 표시할 뿐 코드를 실행하지 않는다. `build-python.py --check-code`의 작성자 검증과 웹사이트의 학습자 기능을 혼동하지 않는다.

## 예제와 챕터 복습 문항

```json
{
  "question": "아래 코드는 어떤 값을 출력하나요?",
  "code": "print(2 + 3)",
  "codeKind": "python",
  "options": ["2 + 3", "5", "print(2 + 3)", "출력 없음"],
  "optionFormat": "text",
  "answer": 1,
  "explanation": "먼저 덧셈을 계산하고, print가 그 값 5를 출력합니다.",
  "skill": "코드와 실행 결과"
}
```

| 필드 | 형식과 기준 |
| --- | --- |
| `question` | 명확한 조건을 포함한 질문 |
| `code` | 선택 사항. 문제에서 읽을 코드/기록의 문자열 |
| `codeKind` | 선택 사항. `python`(기본), `console`, `text`. 대화형 화면 기록에는 `console`을 사용 |
| `options` | 비어 있지 않은 서로 다른 문자열 4개, 정답은 한 개 |
| `optionFormat` | `text`(기본) 또는 `code`. 코드·여러 줄 출력의 공백이 의미 있으면 `code` |
| `answer` | 정답 선택지의 0부터 시작하는 정수 인덱스, 0~3 |
| `explanation` | 맞는 이유와 필요한 코드 흐름을 설명 |
| `skill` | 무엇을 확인하는 문제인지 나타내는 짧은 개념명 |
| `related` | 복습에서 필수. 돌아갈 관련 레슨 ID의 비어 있지 않은 배열 |

문제의 `code`는 본문 코드 블록 객체와 달리 문자열이다. 코드 보기와 실제 실행 요구를 구분하며, 첫 챕터에서는 변수·입력·반복 등 아직 배우지 않은 문법을 정답 도출의 전제로 삼지 않는다. 들여쓰기 소개의 `if True:`는 주어진 블록이 실행된다는 설명과 함께 구조를 읽는 데만 사용한다.

복습은 레슨의 예제와 별도 문항 10개다. 실행 흐름 3개, 코드 읽기 3개, 오류 위치 2개, 작은 수정 2개로 구성한다. `related`의 합집합은 다섯 레슨 전체를 포함해야 한다. 이후 복습 문항을 바꿀 때도 실제 설명과 문제 수, 연결할 레슨을 함께 확인한다.

## 생성·검증 절차

저장소 루트에서 실행한다.

```bash
python3 build-python.py --check-code
node --check python-content.js
node --check python-ui.js
node --check app.js
```

`build-python.py`의 기본 실행은 ID·제목·순서, 주요 필드, 단락 수, 핵심 요점 3개, 레슨별 예제 5개, 복습 10개, 선택지·정답 인덱스, 복습 관련 레슨을 검사한 뒤 묶음을 생성한다. 생성 결과에는 `id`, `title`, `description`, `runtime`, `testedVersion`, `lessons`, `review`가 들어간다.

`--check-code`를 붙이면 작성자가 관리하는 본문·작동 예시의 `kind: "python"` 블록을 임시 `.py` 파일로 만들어 현재 Python의 격리 모드 `-I`에서 실행한다. 블록마다 5초 제한을 두고 예상 stdout과 오류 종류를 비교한다. 의도적인 오류는 비정상 종료 및 해당 오류 이름이 stderr에 있는지 확인한다. 출력 끝의 개행은 비교에서 제외하지만 줄 내부의 공백·순서·내용은 보존한다.

이 검사는 악성 코드를 위한 보안 샌드박스가 아니다. 작성자가 검토한 코드만 넣으며 네트워크 요청·외부 파일 변경·패키지 설치가 필요한 블록을 첫 챕터에 넣지 않는다. 콘솔 블록, 오류 메시지 텍스트, 문항 코드, 선택지는 자동 실행 대상이 아니므로 문항의 결과·정답·해설은 별도로 검토한다. 공식 근거와 코드 실험, PC·모바일 화면 검증을 각각 구분하여 기록한다.

챕터 1의 코드 확인 환경은 Python 3.12.14다. `--check-code` 실행 시 생성물의 `testedVersion`에는 실제 실행한 버전이 기록된다. 이 옵션 없이 재생성하면 `testedVersion`은 `null`이므로, 코드 검증 후 최종 생성물을 만들 때는 옵션을 포함한다. JSON 원본과 생성된 `python-content.js`를 함께 커밋한다.

## 경로와 학습 기록

- 분야 홈: `#/subjects/python`
- 챕터 목차: `#/python/ch01`
- 레슨: `#/python/ch01/lesson/python-l001`부터 `python-l005`까지
- 복습: `#/python/ch01/review`
- 통합 학습 기록: `#/progress`

파이썬 챕터 1의 localStorage 키는 `academy-python-ch01-v1`이다. 상태는 읽음 레슨 배열 `completed`, 점수 사전 `scores`, 최근 레슨 `last`, 최근 방문 시각 `visitedAt`을 포함한다. 점수 사전의 키는 레슨 ID 또는 `review`이며, 각 값은 `latest`, `best`, ISO 시각 문자열 `date`다. 읽음과 점수는 별도로 기록한다.

기존 수학 키 `understand-math-grade1-v1`은 그대로 보존한다. 두 과목의 기록은 현재 사이트·브라우저에 저장되며 서버 계정이나 기기 간 자동 동기화는 없다. 화면·저장 복구·기존 수학 호환·배포 검증의 실제 결과는 [verification.md](../../verification.md)에 남긴다.
