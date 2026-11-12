# 파이썬 콘텐츠 형식

이 형식은 파이썬 기초 9챕터 `python-ch01`~`python-ch09`의 콘텐츠 구현용이다. 수학 중1의 `content/SCHEMA.md`와 별개이며, 후속 챕터에서도 목록형 문제를 유지하며 기존 ID를 바꾸지 않는다. 집필 의도와 범위는 [시작 문서](../../docs/START-HERE.md), [집필 기준](../../docs/AUTHORING.md), [파이썬 목차](../../docs/curriculum/python.md)를 먼저 읽는다.

## 원본과 생성물

| 경로 | 역할 |
| --- | --- |
| `content/python/ch01/python-l001.json` ~ `python-l005.json` | 파일마다 레슨 객체 1개, 각 레슨에 예제 5개 |
| `content/python/ch01/review.json` | 복습 문항 객체 10개의 배열 |
| `content/python/ch02/python-l006.json` ~ `python-l010.json` | 챕터 2의 레슨 객체, 각각 예제 5개 |
| `content/python/ch02/review.json` | 챕터 2 복습 10개 |
| `content/python/ch03/python-l011.json` ~ `python-l015.json` | 챕터 3의 레슨 객체, 각각 예제 5개 |
| `content/python/ch03/review.json` | 챕터 3 복습 10개 |
| `content/python/ch04/python-l016.json` ~ `python-l020.json` | 챕터 4의 레슨 객체, 각각 예제 5개 |
| `content/python/ch04/review.json` | 챕터 4 복습 10개 |
| `content/python/ch05/python-l021.json` ~ `python-l025.json` | 챕터 5의 레슨 객체 5개, 각각 예제 5개 |
| `content/python/ch05/review.json` | 챕터 5 복습 10개 |
| `content/python/ch06/python-l026.json` ~ `python-l031.json` | 챕터 6의 레슨 객체 6개, 각각 예제 5개 |
| `content/python/ch06/review.json` | 챕터 6 복습 10개 |
| `content/python/ch07/python-l032.json` ~ `python-l036.json` | 챕터 7의 레슨 객체 5개, 각각 예제 5개 |
| `content/python/ch07/review.json` | 챕터 7 복습 10개 |
| `content/python/ch08/python-l037.json` ~ `python-l041.json` | 챕터 8의 레슨 객체 5개, 각각 예제 5개 |
| `content/python/ch08/review.json` | 챕터 8 복습 10개 |
| `content/python/ch09/python-l042.json` ~ `python-l046.json` | 챕터 9의 레슨 객체 5개, 각각 예제 5개 |
| `content/python/ch09/review.json` | 챕터 9 복습 10개 |
| `build-python.py` | 원본 검사와 콘텐츠 묶음 생성 |
| `python-content.js` | 자동 생성된 `window.PYTHON_COURSES` 배열과 `PYTHON_CH01`·`PYTHON_CH02`·`PYTHON_CH03`·`PYTHON_CH04`·`PYTHON_CH05`·`PYTHON_CH06`·`PYTHON_CH07`·`PYTHON_CH08`·`PYTHON_CH09` 별칭, 직접 수정하지 않음 |
| `python-ui.js` · `python.css` | 본문·코드·문제 세로 목록·접힌 예시 답과 해설·복습 화면 및 반응형 디자인 |
| `app.js` | 경로, 과목별 읽음·최근 레슨 저장 상태 연결. 수학 문제 기능은 기존 방식 유지 |

레슨 ID는 챕터 1 `python-l001`~`python-l005`, 챕터 2 `python-l006`~`python-l010`, 챕터 3 `python-l011`~`python-l015`, 챕터 4 `python-l016`~`python-l020`, 챕터 5 `python-l021`~`python-l025`, 챕터 6 `python-l026`~`python-l031`, 챕터 7 `python-l032`~`python-l036`, 챕터 8 `python-l037`~`python-l041`, 챕터 9 `python-l042`~`python-l046`이다. 챕터 안의 `order`는 챕터 6만 1~6이고 나머지는 1~5다. 제목은 과목 문서와 정확히 맞춘다. 설계된 기초 9챕터·46레슨·230예제·90복습을 모두 구현했으며 추가 집필 범위는 사용자 요청에 따른다.

## 레슨 객체

| 필드 | 형식과 집필 기준 |
| --- | --- |
| `id` | 고정 레슨 ID 문자열 |
| `order` | 해당 챕터 안의 순서. 챕터 6만 정수 1~6, 나머지 8챕터는 정수 1~5 |
| `title` | 설계 목차와 동일한 제목 |
| `subtitle` | 배우는 원리를 요약한 한국어 문장 |
| `minutes` | 개념을 읽는 대략적인 시간, 양의 정수 |
| `goal` | 이해하거나 수행할 수 있게 되는 목표 |
| `intro` | 왜 이 원리가 필요한지 연결하는 도입 |
| `sections` | 개념 설명 3~4개. 각 객체에 `title`, 문단 문자열 배열 `body`, 선택적 `code` |
| `worked` | 작동 예시. `question`, 이유를 따라가는 문자열 배열 `steps`, `answer`, 선택적 `code` |
| `misconception` | 대표 오해를 다루는 `question`과 `answer` |
| `keypoints` | 핵심 요점 문자열 3개 |
| `examples` | 이 레슨의 직접 풀어 보는 예제 5개. 페이지에 세로로 나열 |

일반 본문은 HTML·Markdown을 포함하지 않는 평문이다. 단, 챕터 1의 단계별 연습 시범에서는 설명의 중요한 단어·문장에 `**강조**`를 사용할 수 있다. 화면은 먼저 HTML 문자를 이스케이프한 뒤 이 표기만 `strong`으로 바꾼다. 일반 HTML·다른 Markdown 문법은 지원하지 않으며 코드 원문·입출력은 강조 변환하지 않는다. 코드 들여쓰기와 줄바꿈은 코드 문자열 안에 유지한다. 수업 설명은 직접 집필하며, 공식 문서의 예시를 복사해 목차를 채우는 방식으로 만들지 않는다.

### 챕터 1의 단계별 연습 시범

수정 전 원본은 [백업 기록](../../docs/backups/python-ch01-2026-11-12.md)에 보관한다. 아래 필드는 챕터 1에만 사용하는 선택 확장이다. 옛 원본에 필드가 없으면 기존 형식으로 생성·표시할 수 있다. 이번 시범의 5레슨과 35문항은 모두 해당 필드를 제공하며, 챕터 2~9에는 적용하지 않는다.

| 필드 | 형식과 기준 |
| --- | --- |
| 레슨 `learningGuide` | 비어 있지 않은 문자열 배열. 준비 방법과 이 레슨에서 도움을 줄이는 연습 순서를 안내 |
| 레슨 `spacedReview` | `{when, task, lessonId, exampleNumber}` 객체 2개. `when`·`task`는 비어 있지 않은 문자열, `lessonId`는 챕터 1의 기존 레슨 ID, `exampleNumber`는 정수 4 또는 5 |
| 문항 `practiceStage` | 레슨 예제 1~5는 `guided` → `completion` → `independent` → `recall` → `transfer` 순서. 복습 10문항은 `recall` |
| 문항 `instructions` | 비어 있지 않은 문자열 배열. 학습자가 할 일을 순서대로 명시 |
| 문항 `answerFormat` | 작성할 코드·기록·설명의 형태를 밝히는 비어 있지 않은 문자열 |
| 문항 `hints` | 비어 있지 않은 문자열 배열. 완성 답 대신 필요한 개념·관계를 짚는 단서. 힌트마다 독립적으로 접혀 있고 풀이와 별도로 열 수 있음 |
| 문항 `selfCheck` | 비어 있지 않은 문자열 배열. 직접 작성·실행한 결과와 대조할 관찰 가능한 확인 기준 |

문항에 새 필드 중 하나를 넣으면 위 문항 필드 5개를 모두 제공한다. 레슨 학습 안내도 `learningGuide`·`spacedReview`를 함께 제공한다. 생성기는 필드 형식·단계 순서·기존 문항 참조를 검사한다. 도움을 실제로 줄였는지, 본문에서 필요한 개념을 먼저 가르쳤는지는 별도 내용 검토로 확인한다.

예제 1은 완성 예를 보며 직접 작성하고, 2는 일부를 채운다. 3은 요구만 보고 작성하고, 4는 앞 풀이를 가리고 재현하며, 5는 배운 원리에서 조건 하나를 바꿔 적용한다. 빈칸이 있는 미완성 코드는 `codeKind: "text"`로 표시하고 **빈칸을 채운 뒤 실행**하도록 명시한다. 접힌 `solution.code`에는 실행 가능한 완성본과 예상 결과를 둔다.

간격 복습은 다음 날·며칠 뒤에 기존 예제 4/5를 다시 푸는 권장 안내다. 챕터 복습도 오늘 1~5번·다음 날 6~10번·며칠 뒤 기존 문항 재시도를 권한다. 날짜 잠금·예약·알림·자동 채점·새 기록 키는 없으며 모든 문항은 언제든 접근할 수 있다. 막히면 힌트나 관련 본문을 확인한 뒤 닫고 다시 작성·실행하도록 안내한다. 기존 ‘읽음’은 읽은 표시이며 숙달 판정이 아니다.

## 본문·작동 예시·문항 해답의 코드 블록

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
| `filename` | 선택적 주 실행 파일명. `python` 블록만 사용하며 기본값은 `lesson.py`. 아래 파일명 규칙을 따르고 `.py`로 끝나야 함 |
| `files` | 선택적 객체. 함께 둘 파일명과 정확한 초기 UTF-8 텍스트의 대응. `python` 블록만 사용 |
| `expectedFiles` | 선택적 객체. 실행 후 존재해야 할 파일명과 정확한 UTF-8 텍스트의 대응. `python` 블록만 사용하며 줄바꿈까지 비교 |
| `input` | 선택적 예시 표준 입력 문자열. `python` 블록만 사용. `input()`이 읽을 줄을 개행으로 구분하며 화면에서는 읽기 전용 ‘예시 입력’으로 표시 |
| `output` | 예상 표준 출력 문자열. `python` 블록에는 필수. 출력이 없으면 빈 문자열 `""` |
| `error` | 정상 실행이면 생략 또는 `null`. 의도적인 실패이면 `SyntaxError`, `ZeroDivisionError` 같은 오류 종류 |
| `caption` | 코드·예상 결과를 어떻게 읽을지 설명하는 선택적 문장 |

`python`은 저장한 Python 코드로 실행 가능한 블록이다. `console`은 운영체제 명령 또는 `>>>`가 포함된 대화형 화면 기록이며, `text`는 오류 메시지 등 읽을 텍스트 또는 환경마다 출력이 달라 고정 실행 결과를 넣지 않는 코드다. 예를 들어 가상환경의 `sys.executable`·prefix 확인 코드는 Python 코드임을 본문·caption에 명시하고 `text`로 표시하며, 실제 실행 결과를 별도로 검증한다. 콘솔 기록을 Python 파일로 실행하거나 `>>>`를 코드 자체로 가르치지 않는다.

`output`은 stdout만 뜻한다. 오류가 나기 전에 출력된 글이 있다면 그 글을 적고 오류 종류는 `error`에 따로 기록한다. 버전에 따라 달라질 수 있는 traceback의 전체 문구·파일 경로·밑줄 모양을 고정된 검증값으로 삼지 않는다. 필요한 메시지 예시는 `text` 블록에 두고 설명한다.

입력 예시는 코드·예상 출력과 분리한다. 터미널이 보여 주는 입력 글자나 Enter는 stdout이 아니므로 `output`에 섞지 않는다. 현재 입력 레슨은 프롬프트 없는 `input()`으로 값을 한 줄씩 받으며 입력 순서와 Enter 동작을 설명한다. 예: `source: "print(int(input()) + 1)"`, `input: "4\n"`, `output: "5"`.

사이트는 소스·예시 입력·함께 둘 파일·예상 출력·실행 후 파일을 읽기 전용으로 표시할 뿐 코드를 실행하지 않는다. `build-python.py --check-code`의 작성자 검증과 웹사이트의 학습자 기능을 혼동하지 않는다.

### 여러 파일과 파일 결과

`filename`, `files`, `expectedFiles`의 이름은 경로가 아닌 단일 파일명이다. ASCII 영문·숫자·밑줄로 시작하고 이후에는 ASCII 영문·숫자·밑줄·점·하이픈만 허용한다(`^[A-Za-z0-9_][A-Za-z0-9_.-]*$`). `/`·`\`나 상위 폴더를 나타내는 `..` 경로를 넣지 않는다. `filename`은 `.py`로 끝나야 한다. `files`와 `expectedFiles`의 키는 주 실행 파일명(`filename` 또는 기본 `lesson.py`)과 같을 수 없다. 각 맵의 값은 문자열이며 빈 파일은 빈 문자열로 표현한다.

`files`에 있는 파일은 블록 실행 전에 준비한다. `expectedFiles`는 실행 후 파일 존재 여부와 내용을 확인하는 조건이므로 처음부터 없는 새 파일도 지정할 수 있다. 같은 자료 파일을 두 맵에 넣으면 실행 후에도 원본이 유지되는지 확인할 수 있다. 화면에서는 `files`를 ‘함께 둘 파일’, `expectedFiles`를 ‘실행 후 파일’로 구분하고 `filename`이 있으면 ‘실행할 파일’에 이름을 표시한다. 입력창·업로드·파일 다운로드·코드 실행 기능은 아니다.

```json
{
  "filename": "main.py",
  "source": "with open(\"notes.txt\", \"r\", encoding=\"utf-8\") as file:\n    text = file.read()\nwith open(\"result.txt\", \"w\", encoding=\"utf-8\") as file:\n    file.write(text.upper())\nprint(\"저장 완료\")",
  "kind": "python",
  "files": {"notes.txt": "hello\n"},
  "expectedFiles": {"notes.txt": "hello\n", "result.txt": "HELLO\n"},
  "output": "저장 완료",
  "error": null
}
```

위 블록에서 stdout은 ‘저장 완료’이고 result.txt 내용은 `HELLO\n`이다. 파일 내용과 화면 출력을 `output`에 섞지 않는다. 주 파일에는 `source`를 저장하고 함께 둘 `.py` 파일은 `files`에 넣는다. 문항의 `code`는 기존 문자열 형식을 유지하므로 필요한 초기 파일과 실행 조건을 질문에 명시하고 예시 답의 `solution.code.files`에도 넣는다. 실습은 지정한 연습 폴더와 파일만 사용하며 덮어쓰기·덧붙이기·재실행의 영향을 설명한다.

## 예제와 챕터 복습 문항

사용자가 PC에서 직접 타이핑하므로 예제 5개와 복습 10개는 각각 페이지의 세로 목록으로 제공한다. 직접 작성·실행·수정하거나 결과와 이유를 적으며 풀고, 문항마다 접힌 예시 답과 해설을 펼쳐 비교한다. 객관식 선택·퀴즈 모달·채점·점수 표시는 사용하지 않는다. 후속 파이썬 챕터에도 같은 형식을 적용한다.

```json
{
  "question": "2와 3을 더한 값을 출력하는 코드를 직접 작성하고 실행해 보세요.",
  "skill": "코드와 실행 결과",
  "solution": {
    "answer": "덧셈 결과를 print에 전달하면 5가 출력됩니다.",
    "code": {
      "source": "print(2 + 3)",
      "kind": "python",
      "output": "5",
      "error": null,
      "caption": "요구한 결과를 만드는 예시 코드입니다."
    }
  },
  "explanation": "먼저 덧셈을 계산하고, print가 그 값 5를 출력합니다.",
  "related": ["python-l001"]
}
```

위 예시는 복습에서 사용할 수 있는 문항이다. 레슨의 예제에는 `related`를 생략할 수 있다.

| 필드 | 형식과 기준 |
| --- | --- |
| `question` | 직접 작성·실행·수정 또는 설명할 내용을 명확히 요구하는 질문 |
| `code` | 선택 사항. 문제에서 읽을 코드/기록의 문자열 |
| `codeKind` | 선택 사항. `python`(기본), `console`, `text`. 대화형 화면 기록에는 `console`을 사용 |
| `codeLabel` | 선택 사항. 문제 코드에 붙일 짧은 표시, 예: `수정할 코드`, `대화형 창의 기록` |
| `skill` | 무엇을 확인하는 문제인지 나타내는 짧은 개념명 |
| `solution` | 예시 답 객체. 아래 `answer`와 선택적 `code`를 포함 |
| `solution.answer` | 예시 답이나 기대 결과를 설명하는 비어 있지 않은 문자열 |
| `solution.code` | 선택 사항. 앞 절의 코드 블록 객체와 동일. `kind: "python"`이면 `output` 필수 |
| `explanation` | 결과가 나오는 이유와 필요한 코드 흐름을 설명 |
| `related` | 복습에서 필수. 돌아갈 관련 레슨 ID의 비어 있지 않은 배열 |

문항에는 `options`, `optionFormat`, 문항 최상위의 숫자형 `answer`를 넣지 않는다. 예시 답은 `solution.answer` 문자열로 기록한다. 본문의 `worked.answer`와 `misconception.answer`는 기존 형식을 유지한다.

문제의 `code`는 읽거나 고칠 원본 문자열이고 `solution.code`는 예시 답의 코드 블록 객체다. 질문에 있는 오류 코드와 수정한 해답을 바꿔 넣지 않는다. 처음부터 해답이 보이지 않도록 `solution`과 `explanation`은 함께 접어서 표시한다. 같은 요구를 충족하는 다른 풀이도 가능하며 예시 코드를 유일한 정답으로 자동 채점하지 않는다.

첫 챕터에서는 변수·입력·반복 등 아직 배우지 않은 문법을 정답 도출의 전제로 삼지 않는다. 들여쓰기 소개의 `if True:`는 주어진 블록이 실행된다는 설명과 함께 구조를 읽는 데만 사용한다. 사이트 내부 입력창이나 코드 실행기를 요구하지 않고 PC의 편집기·터미널에서 타이핑하고 확인하도록 안내한다.

복습은 챕터마다 레슨의 예제와 별도 문항 10개다. 챕터 1은 실행 흐름 3개·코드 읽기 3개·오류 위치 2개·작은 수정 2개, 챕터 2는 값과 이름 3개·연산 예측 3개·변환 오류 2개·입출력 적용 2개, 챕터 3은 범위 해석 3개·결과 예측 3개·변환 조합 3개·불변성 오개념 1개, 챕터 4는 분기 추적 3개·조건 설계 3개·경계값 3개·None 오개념 1개, 챕터 5는 반복 추적 3개·누적 처리 3개·종료 오류 2개·범위 경계 2개, 챕터 6은 자료구조 선택 3개·변경 결과 3개·순회 적용 2개·별칭 오개념 2개, 챕터 7은 호출 추적 3개·인자와 반환 3개·범위·기본값 2개·함수 분리 2개, 챕터 8은 모듈 경계 2개·오류 해석 3개·파일 흐름 3개·환경 구분 2개, 챕터 9는 객체 개념 3개·상태 추적 2개·작은 구성 3개·통합 결과 확인 2개다. `related`는 해당 챕터에 속한 ID만 사용하고 합집합은 해당 챕터의 모든 레슨을 포함해야 한다. 이후 복습 문항을 바꿀 때도 실제 설명과 문제 수, 연결할 레슨을 함께 확인한다.

## 생성·검증 절차

저장소 루트에서 실행한다.

```bash
python3 build-python.py --check-code
node --check python-content.js
node --check python-ui.js
node --check app.js
```

`build-python.py`의 기본 실행은 ID·제목·순서, 주요 필드, 단락 수, 핵심 요점 3개, 레슨별 예제 5개, 복습 10개, 문항의 `solution.answer`와 선택적 코드 블록, 복습 관련 레슨을 검사한 뒤 묶음을 생성한다. 객관식 필드가 남아 있지 않아야 한다. 생성 결과에는 `id`, `slug`, `number`, `title`, `description`, `prerequisite`, `runtime`, `testedVersion`, `lessons`, `review`가 들어간다.

`--check-code`를 붙이면 작성자가 관리하는 본문·작동 예시와 문항의 `solution.code` 중 `kind: "python"` 블록마다 새 임시 폴더를 만든다. `files`를 준비하고 `source`를 `filename`(기본 `lesson.py`)에 저장한 뒤 그 폴더를 현재 작업 폴더로 하여 현재 Python의 격리 모드 `-I`에서 실행한다. 함께 둘 `.py` 파일이 있으면 로컬 모듈을 찾도록 해당 블록의 작성자 관리 폴더만 검색 경로에 추가하고, 주 파일은 `__name__ == "__main__"`으로 실행한다. 서로 다른 블록의 파일과 import 상태는 공유하지 않는다. `input` 문자열을 stdin으로 전달하며 생략하면 빈 stdin을 전달한다. 학습자 입력을 실행하는 기능은 아니다. 블록마다 5초 제한을 두고 예상 stdout과 오류 종류를 비교한다. 의도적인 오류는 비정상 종료 및 해당 오류 이름이 stderr에 있는지 확인한다. stdout 끝의 개행은 비교에서 제외하지만 줄 내부의 공백·순서·내용은 보존한다. 주 파일과 함께 둘 파일은 UTF-8로 쓰며 줄바꿈을 자동 변환하지 않는다. `expectedFiles`는 파일이 존재하는지 확인하고 UTF-8로 읽어 줄바꿈을 변환하거나 제거하지 않은 원문 문자열을 비교한다. 파일 끝의 줄바꿈도 검사하므로 stdout 비교와 다르다.

이 검사는 악성 코드를 위한 보안 샌드박스가 아니다. 작성자가 검토한 코드만 넣으며 네트워크 요청·연습 폴더 밖의 파일 변경·외부 패키지 설치가 필요한 블록을 넣지 않는다. 파일 실습의 변경은 해당 블록에 명시한 연습 파일에 한정한다. 콘솔 블록, 환경별 출력 코드·오류 메시지의 `text` 블록, 질문의 `code` 문자열은 자동 실행 대상이 아니므로 질문의 조건·예시 답·해설과 원문 코드·재실행 결과를 별도로 검토한다. 가상환경은 연습용 venv를 실제 생성하여 기본/venv 인터프리터의 경로와 prefix 관계, 같은 인터프리터의 `-m pip --version`을 별도로 확인한다. 기기별 경로·버전을 고정 stdout으로 꾸미지 않는다. 반복을 다루는 챕터 5부터는 본문·해답 코드가 실제로 종료하는지 확인한다. 무한 반복을 고치는 문항의 오류 원본은 질문의 `code`로만 제시하고, 실행 검증 대상인 `solution.code`에는 종료하는 수정본을 넣는다. 집합의 원래 출력·순회 순서는 고정된 예상 출력으로 삼지 않으며, 포함 여부·개수 또는 본문에서 설명한 정렬 방법으로 결과를 확인한다. 공식 근거와 코드 실험, PC·모바일 화면 검증을 각각 구분하여 기록한다.

코드 확인 환경은 Python 3.12.14다. 챕터별 실제 검증 결과는 `verification.md`에 기록한다. `--check-code` 실행 시 생성물의 `testedVersion`에는 실제 실행한 버전이 기록된다. 이 옵션 없이 재생성하면 `testedVersion`은 `null`이므로, 코드 검증 후 최종 생성물을 만들 때는 옵션을 포함한다. JSON 원본과 생성된 `python-content.js`를 함께 커밋한다.

## 경로와 학습 기록

- 분야 홈: `#/subjects/python`
- 챕터 목차: `#/python/ch01`
- 레슨: `#/python/ch01/lesson/python-l001`부터 `python-l005`까지
- 복습: `#/python/ch01/review`
- 챕터 2 목차: `#/python/ch02`
- 챕터 2 레슨: `#/python/ch02/lesson/python-l006`부터 `python-l010`까지
- 챕터 2 복습: `#/python/ch02/review`
- 챕터 3 목차: `#/python/ch03`
- 챕터 3 레슨: `#/python/ch03/lesson/python-l011`부터 `python-l015`까지
- 챕터 3 복습: `#/python/ch03/review`
- 챕터 4 목차: `#/python/ch04`
- 챕터 4 레슨: `#/python/ch04/lesson/python-l016`부터 `python-l020`까지
- 챕터 4 복습: `#/python/ch04/review`
- 챕터 5 목차: `#/python/ch05`
- 챕터 5 레슨: `#/python/ch05/lesson/python-l021`부터 `python-l025`까지
- 챕터 5 복습: `#/python/ch05/review`
- 챕터 6 목차: `#/python/ch06`
- 챕터 6 레슨: `#/python/ch06/lesson/python-l026`부터 `python-l031`까지
- 챕터 6 복습: `#/python/ch06/review`
- 챕터 7 목차: `#/python/ch07`
- 챕터 7 레슨: `#/python/ch07/lesson/python-l032`부터 `python-l036`까지
- 챕터 7 복습: `#/python/ch07/review`
- 챕터 8 목차: `#/python/ch08`
- 챕터 8 레슨: `#/python/ch08/lesson/python-l037`부터 `python-l041`까지
- 챕터 8 복습: `#/python/ch08/review`
- 챕터 9 목차: `#/python/ch09`
- 챕터 9 레슨: `#/python/ch09/lesson/python-l042`부터 `python-l046`까지
- 챕터 9 복습: `#/python/ch09/review`
- 통합 학습 기록: `#/progress`

파이썬 localStorage 키는 챕터 1 `academy-python-ch01-v1`, 챕터 2 `academy-python-ch02-v1`, 챕터 3 `academy-python-ch03-v1`, 챕터 4 `academy-python-ch04-v1`, 챕터 5 `academy-python-ch05-v1`, 챕터 6 `academy-python-ch06-v1`, 챕터 7 `academy-python-ch07-v1`, 챕터 8 `academy-python-ch08-v1`, 챕터 9 `academy-python-ch09-v1`이다. 각 키는 해당 챕터 레슨만 담으며 챕터 추가로 기존 기록을 초기화하지 않는다. 읽음 레슨 배열 `completed`, 최근 레슨 `last`, 최근 방문 시각 `visitedAt`을 이어서 사용한다. 문제별 답안이나 새 점수는 저장하지 않는다.

이전 객관식 버전의 `scores` 데이터는 삭제하지 않고 보존하되 UI에 표시하지 않는다. 과거 점수 사전의 키는 레슨 ID 또는 `review`이며 각 값에 `latest`, `best`, ISO 시각 문자열 `date`가 있었다. 이 필드는 기존 기록을 보존하기 위한 것이며 현재 문제 풀이·진도 판단에 사용하지 않는다. 점수를 없애려고 저장 키 전체를 초기화하거나 읽음·최근 레슨을 지우지 않는다.

기존 수학 키 `understand-math-grade1-v1`은 그대로 보존한다. 과목과 챕터별 기록은 현재 사이트·브라우저에 저장되며 서버 계정이나 기기 간 자동 동기화는 없다. 화면·저장 복구·기존 수학 호환·배포 검증의 실제 결과는 [verification.md](../../verification.md)에 남긴다.
