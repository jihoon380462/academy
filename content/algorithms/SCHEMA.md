# 알고리즘·자료구조 콘텐츠 형식

현재 집필 범위는 `ch01`의 6레슨(`algorithms-l001`~`algorithms-l006`), 예제 30개와 복습 10개다. 다음 챕터 목차는 설계이며 본문이 구현되었다는 뜻이 아니다. [집필 기준](../../docs/AUTHORING.md)과 [과목 문서](../../docs/curriculum/algorithms.md)를 함께 따른다.

## 파일과 생성물

- `ch01/course.json`: 과목/챕터 ID, 표시 제목, 도달점 설명, 선행 지식, 언어·공식 참고 자료, `lessonFiles`의 집필 파일 순서.
- `ch01/lesson-01.json`~`lesson-06.json`: 실제 레슨 본문과 각각 5예제. 파일명을 바꿔도 기존 레슨 ID를 바꾸지 않는다.
- `ch01/review.json`: 10개의 직접 풀기 문항. 명세 3·절차 추적 3·정확성 판단 2·경계 입력 2로 구성한다.
- 루트 `algorithms-content.js`: 브라우저가 읽는 `window.ALGORITHMS_COURSES` 배열. JSON을 수정한 뒤 생성물도 함께 갱신한다.

검사와 생성은 Python 표준 라이브러리만 사용한다.

```bash
python3 build-algorithms.py --check-code
python3 build-algorithms.py --check --check-code
node --check algorithms-content.js
```

첫 명령은 검사 후 생성하고, `--check`는 생성물을 쓰지 않고 현재 JSON으로 만든 결과와 바이트 단위로 비교한다. 생성 결과에는 명령 실행 여부나 실행 시각이 들어가지 않는다.

## 레슨과 문항

레슨은 `id`, `order`, `title`, `subtitle`, 양의 정수 `minutes`, `goal`, `intro`, `sections`, `worked`, `misconception`, `keypoints`, `examples`를 가진다. ID·제목·순서는 과목 문서의 해당 챕터와 일치해야 한다.

- `sections`: 3개 이상의 개념 설명. 각 항목은 `title`, 비어 있지 않은 문단 문자열 배열 `body`, 선택적 `code`를 가진다. 먼저 언어 중립 절차나 작은 입력의 상태를 설명하고 필요한 Python 구현을 연결한다.
- `worked`: `question`, 단계별 문자열 배열 `steps`, 결과와 이유인 `answer`, 선택적 `code`를 가진다.
- `misconception`: `question`, `answer`로 오개념과 적용 경계를 설명한다.
- `keypoints`: 비어 있지 않은 핵심 정리 문자열 정확히 3개.
- `examples`: 아래 문항 형식 정확히 5개. 서로 다른 확인 목적을 가지며 문항 요구·예시 답·해설이 일치해야 한다.

예제·복습 문항은 다음 형식을 쓴다.

```json
{
  "skill": "절차 추적 · 누적 합",
  "question": "[2, 3]을 처리한 직후 total을 차례로 적으세요.",
  "code": "total ← 0\n각 value에 대해 total ← total + value",
  "codeKind": "text",
  "solution": {
    "answer": "2 → 5입니다.",
    "code": {
      "kind": "python",
      "source": "total = 0\nfor value in [2, 3]:\n    total = total + value\n    print(total)",
      "output": "2\n5\n"
    }
  },
  "explanation": "total은 이번 값만이 아니라 지금까지 처리한 값들의 합입니다.",
  "related": ["algorithms-l003"]
}
```

`skill`, `question`, `solution.answer`, `explanation`은 필수 문자열이다. `code`는 질문 자료 문자열이며 `codeKind`는 `python` 또는 `text`다. 의사코드·추적표·잘못된 비종료 절차는 `text`로 표시하고, 실행하지 않고 손으로 추적할 자료임을 설명한다. Python 질문 자료는 구문만 자동 검사하므로 요구·예시 답과의 일치 및 실행 결과는 별도로 검토한다.

`related`는 해당 챕터 레슨 ID만 허용한다. 복습에는 한 개 이상이 필수이며 10문항 전체가 6레슨을 모두 연결해야 한다. `options`, `optionFormat`, 최상위 `answer`는 쓰지 않는다. 예제·복습은 페이지 안에 세로로 나열하고 각 예시 답·해설을 접어서 제공한다. 손으로 명세·추적·이유를 적거나 PC에서 Python 예시를 작성하며 확인한다. 사이트에는 코드 실행기·자동 채점·점수 표시가 없다.

## 코드 블록과 작성자 실행 검사

본문·작동 예시·`solution.code`의 블록은 `source`, `kind`를 가진다. `kind`는 `text`(의사코드·표) 또는 `python`이다. `caption`은 선택 설명이며 Python 블록에는 정확한 stdout 문자열 `output`을 반드시 둔다. 예상 오류를 다룰 때만 `error`에 `ValueError` 같은 클래스 이름을 적는다. `output`은 마지막 줄바꿈까지 비교한다. 출력이 없으면 빈 문자열을 쓴다.

`--check-code`는 신뢰된 저장소 작성자 Python 블록만 각각 새 임시 폴더의 파일로 만들고, 현재 Python의 격리 모드 `-I`에서 실행한다. 고정 stdin은 빈 문자열이며 시간 제한은 블록당 5초다. stdout과 의도한 오류 종류를 검사하며 정상 예제의 stderr·비정상 종료도 거절한다. 파일·네트워크·사용자 입력에 의존하는 블록은 이 챕터 형식에서 지원하지 않는다. 이것은 임의 사용자 코드를 안전하게 격리하는 실행 서비스가 아니다.

구조·자동 실행 검사는 올바른 문제 명세와 정확성 설명을 대신하지 않는다. 반례가 입력 계약 안에 있는지, 불변식의 시작·유지·종료와 종료 증거가 구분되는지, 빈 목록과 원소 하나의 동작, 브라우저 연결과 기록 보존은 별도로 확인하고 [검증 기록](../../verification.md)에 남긴다.
