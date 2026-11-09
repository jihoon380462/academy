"""Validate published Python chapters and emit their static browser bundle.

Optional --check-code executes trusted author snippets with recorded sample input.
The website only displays code and never runs learner input.
"""
import argparse
import json
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).parent
SPECS = [
    dict(number=1, first=1, title='프로그램을 읽고 실행하기',
         description='입력과 처리, 코드와 출력, 실행과 오류의 차이를 작은 프로그램으로 이해합니다.',
         prerequisite='처음 시작해도 괜찮아요.',
         titles=['프로그램·명령·실행 결과', '인터프리터와 코드 파일', '첫 출력과 문자열 리터럴', '순서·들여쓰기·주석', '문법 오류와 실행 중 오류']),
    dict(number=2, first=6, title='값·이름·연산',
         description='값에 이름을 붙이고, 알맞은 연산과 변환을 골라 입력을 결과로 연결합니다.',
         prerequisite='선행 학습: 챕터 1 · 프로그램을 읽고 실행하기',
         titles=['변수는 값에 붙이는 이름', '정수와 실수의 계산', '문자열과 숫자 변환', '비교·불리언·논리 연산', '입력받아 계산하고 출력하기']),
    dict(number=3, first=11, title='문자열을 다루는 기본 도구',
         description='문자의 위치와 범위를 읽고, 문자열을 정리하고 나누고 합쳐 읽기 좋은 결과를 만듭니다.',
         prerequisite='선행 학습: 챕터 2 · 값·이름·연산',
         titles=['인덱스와 음수 인덱스', '슬라이싱과 범위', '문자열 메서드와 반환값', '나누기·합치기·검색하기', '형식에 맞춰 출력하기']),
    dict(number=4, first=16, title='조건에 따라 흐름 바꾸기',
         description='조건으로 실행할 블록을 나누고, 빈 값과 경계값에서도 의도한 흐름인지 확인합니다.',
         prerequisite='선행 학습: 챕터 2 · 값·이름·연산',
         titles=['if와 들여쓰기 블록', 'elif와 else로 경우 나누기', '여러 조건을 연결하기', '빈 값·None·참 거짓 판정', '경계값과 중첩 조건']),
    dict(number=5, first=21, title='반복으로 같은 규칙 적용하기',
         description='반복 대상과 종료 조건을 읽고, 합계·개수·최댓값을 갱신하며 반복 흐름을 조절합니다.',
         prerequisite='선행 학습: 챕터 4 · 조건에 따라 흐름 바꾸기',
         titles=['for와 반복 대상', 'range와 횟수·범위', 'while과 종료 조건', '누적값과 개수 세기', 'break·continue와 중첩 반복']),
    dict(number=6, first=26, title='여러 값을 담는 방법',
         description='목적에 맞게 컬렉션을 고르고, 조회·변경·순회와 별칭·얕은 복사의 차이를 확인합니다.',
         prerequisite='선행 학습: 챕터 3 · 문자열을 다루는 기본 도구, 챕터 5 · 반복으로 같은 규칙 적용하기',
         titles=['리스트의 생성·조회·변경', '튜플과 언패킹', '딕셔너리의 키와 값', '집합과 중복 제거', '컬렉션 순회와 간단한 컴프리헨션', '컬렉션의 별칭과 얕은 복사']),
]
parser = argparse.ArgumentParser()
parser.add_argument('--check-code', action='store_true')
args = parser.parse_args()
blocks = []
courses = []
all_ids = set()


def validate_block(block, owner):
    assert block['kind'] in ['python', 'console', 'text'], (owner, 'code kind')
    assert isinstance(block['source'], str) and block['source'].strip(), (owner, 'code source')
    if 'input' in block:
        assert block['kind'] == 'python' and isinstance(block['input'], str), (owner, 'sample input')
    if 'output' in block:
        assert isinstance(block['output'], str), (owner, 'output')
    assert block.get('error') is None or isinstance(block['error'], str), (owner, 'error')
    if block['kind'] == 'python':
        assert 'output' in block, (owner, 'missing expected output')
        blocks.append((owner, block))


for spec in SPECS:
    slug = f"ch{spec['number']:02d}"
    source = ROOT / 'content/python' / slug
    lessons = [json.loads((source / f'python-l{i:03d}.json').read_text())
               for i in range(spec['first'], spec['first'] + len(spec['titles']))]
    review = json.loads((source / 'review.json').read_text())
    ids = {lesson['id'] for lesson in lessons}
    assert len(ids) == len(lessons) and not ids & all_ids, (slug, 'unique IDs')
    all_ids.update(ids)
    for order, lesson in enumerate(lessons, 1):
        owner = lesson['id']
        assert owner == f"python-l{spec['first'] + order - 1:03d}"
        assert lesson['order'] == order and lesson['title'] == spec['titles'][order - 1]
        for key in ['subtitle', 'goal', 'intro']:
            assert isinstance(lesson[key], str) and lesson[key].strip(), (owner, key)
        assert isinstance(lesson['minutes'], int) and lesson['minutes'] > 0
        assert 3 <= len(lesson['sections']) <= 4
        for j, section in enumerate(lesson['sections'], 1):
            assert section['title'] and isinstance(section['body'], list) and section['body']
            assert all(isinstance(x, str) and x.strip() for x in section['body'])
            if section.get('code'):
                validate_block(section['code'], f'{owner}/section{j}')
        assert lesson['worked']['question'] and lesson['worked']['steps'] and lesson['worked']['answer']
        if lesson['worked'].get('code'):
            validate_block(lesson['worked']['code'], owner + '/worked')
        assert lesson['misconception']['question'] and lesson['misconception']['answer']
        assert len(lesson['keypoints']) == 3 and len(lesson['examples']) == 5
    assert len(review) == 10, (slug, 'review count')
    for owner, questions in [(l['id'], l['examples']) for l in lessons] + [(slug + '/review', review)]:
        for i, question in enumerate(questions, 1):
            assert question['question'] and question['skill'] and question['explanation'], (owner, i)
            assert not any(key in question for key in ['options', 'optionFormat', 'answer']), (owner, i, 'written exercises only')
            assert isinstance(question['solution']['answer'], str) and question['solution']['answer'].strip(), (owner, i, 'solution')
            if question.get('code'):
                assert isinstance(question['code'], str), (owner, i, 'prompt code')
            assert question.get('codeKind', 'python') in ['python', 'console', 'text']
            if question['solution'].get('code'):
                validate_block(question['solution']['code'], f'{owner}/question{i}/solution')
            if owner.endswith('/review'):
                assert question['related'] and set(question['related']) <= ids, (owner, i, 'related')
    assert set().union(*(set(q['related']) for q in review)) == ids, (slug, 'review coverage')
    courses.append(dict(id='python-' + slug, slug=slug, number=spec['number'], title=spec['title'],
                        description=spec['description'], prerequisite=spec['prerequisite'],
                        runtime='Python 3', testedVersion=sys.version.split()[0] if args.check_code else None,
                        lessons=lessons, review=review))

if args.check_code:
    with tempfile.TemporaryDirectory(prefix='academy-python-') as tmp:
        for owner, block in blocks:
            file = Path(tmp) / 'lesson.py'
            file.write_text(block['source'] + '\n')
            run = subprocess.run([sys.executable, '-I', str(file)], input=block.get('input', ''),
                                 capture_output=True, text=True, timeout=5, cwd=tmp)
            assert run.stdout.rstrip('\n') == block['output'].rstrip('\n'), (owner, 'stdout', run.stdout, block['output'])
            if block.get('error'):
                assert run.returncode != 0 and block['error'] + ':' in run.stderr, (owner, 'expected error', run.stderr)
            else:
                assert run.returncode == 0, (owner, 'unexpected error', run.stderr)
    print(f'Executed {len(blocks)} trusted lesson and solution snippets with Python {sys.version.split()[0]}.')

bundle = 'window.PYTHON_COURSES = ' + json.dumps(courses, ensure_ascii=False, separators=(',', ':')) + ';\n'
# Retain aliases used by existing preview pages and links.
for index, course in enumerate(courses):
    bundle += f"window.PYTHON_CH{course['number']:02d} = window.PYTHON_COURSES[{index}];\n"
(ROOT / 'python-content.js').write_text(bundle)
print(f'Validated {len(courses)} Python chapters, {len(all_ids)} lessons, {len(all_ids) * 5} examples, {len(courses) * 10} review questions; wrote python-content.js.')
