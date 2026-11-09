# 이해수학

개념과 원리를 먼저 이해하는 PC·모바일 반응형 수학 교과서입니다.
선택한 ‘여백의 교과서’ 디자인을 바탕으로 홈페이지와 중학교 1학년 전 범위를 구현했습니다.

## 구성

- 하나의 중1 챕터 안에 **8개 단원 · 30개 레슨**
- 레슨마다 원리 설명 3단계, 도식, 풀이 예시, 오개념 설명, 핵심 정리
- 레슨별 예제 5개: **총 150문제**
- 챕터 종합 복습 **10문제**, 해설과 관련 레슨 연결
- 개념 검색, 이어 배우기, 읽음 표시, 예제·복습 결과 기록
- 설치나 패키지 다운로드 없이 실행하는 HTML/CSS/JavaScript 정적 사이트

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
| `app.css` | PC·모바일 디자인 |
| `app.js` | 페이지 이동, 검색, 문제 풀이, 학습 기록 |
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
| `preview.html` | PC·모바일 화면 비교 |
| `previews/grade1/` | 홈페이지·레슨 화면 캡처 |
| `verification.md` | 검증 범위와 알려진 제약 |

JSON 콘텐츠를 수정한 뒤 아래 명령으로 `curriculum.js`를 다시 생성합니다.

```bash
python3 build-content.py
node --check app.js
node --check visuals.js
node --check curriculum.js
```

`content/*.json`과 생성된 `curriculum.js`를 함께 커밋합니다. 콘텐츠 생성에는 Python 표준 라이브러리만 사용합니다.

## 학습 기록

읽음 표시와 예제·복습 점수는 현재 브라우저의 `localStorage`에 저장됩니다. 서버 계정 기반 저장이나 기기 간 자동 동기화는 구현하지 않았습니다. 다른 도메인으로 접속하면 기존 사이트의 학습 기록은 자동 이전되지 않습니다.

## 교육 범위

2022 개정 중학교 1학년 범위를 기준으로 독자적으로 작성한 설명과 문제입니다. 범위 확인에 참고한 목차:

- [EBS 중1 상](https://mid.ebs.co.kr/course/view?courseId=100006134)
- [EBS 중1 하](https://mid.ebs.co.kr/course/view?courseId=100006214)

복습 10문제는 전 범위의 핵심 원리를 연결하는 종합 점검이며, 모든 세부 기능을 각각 평가하지는 않습니다. 필요한 세부 개념은 연결된 레슨과 예제에서 다시 확인할 수 있습니다.

## 배포 관계

이 저장소는 완성한 사이트의 소스 사본입니다. 기존 ChatGPT Sites 주소와의 자동 동기화는 설정하지 않았습니다. 사이트 고유 배포 식별자나 접근 자격증명은 포함하지 않습니다.
