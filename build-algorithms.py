"""Validate authored algorithms content and emit its static browser bundle.

--check-code runs only trusted repository-authored Python blocks, one temporary
directory per block. It is not a sandbox for arbitrary or learner-supplied code.
The website displays code and never executes it.
"""
import argparse
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / 'content' / 'algorithms'
OUTPUT = ROOT / 'algorithms-content.js'
BLOCK_FIELDS = {'source', 'kind', 'output', 'error', 'caption'}


def require(condition, owner, message):
    if not condition:
        raise ValueError(f'{owner}: {message}')


def text(value, owner):
    require(isinstance(value, str) and bool(value.strip()), owner, 'nonempty text required')


def text_list(value, owner):
    require(isinstance(value, list) and bool(value), owner, 'nonempty text array required')
    for index, item in enumerate(value, 1):
        text(item, f'{owner}/{index}')


def load(path):
    return json.loads(path.read_text(encoding='utf-8'))


def planned_lessons(course):
    """Read the chapter title and lesson IDs/titles from the authored curriculum."""
    plan = (ROOT / 'docs' / 'curriculum' / 'algorithms.md').read_text(encoding='utf-8')
    header = re.search(r'^### ' + re.escape(course['id']) + r' · (.+)$', plan, re.M)
    require(header is not None, course['id'], 'chapter missing from curriculum')
    require(header.group(1).strip() == course['title'], course['id'], 'curriculum chapter title mismatch')
    body = plan[header.end():].split('\n### ', 1)[0]
    lessons = re.findall(r'^\| `(algorithms-l\d{3})` \| ([^|]+) \|', body, re.M)
    require(bool(lessons), course['id'], 'curriculum lesson table missing')
    return [(lesson_id, title.strip()) for lesson_id, title in lessons]


def validate_block(block, owner, blocks):
    require(isinstance(block, dict), owner, 'code block object required')
    require(set(block) <= BLOCK_FIELDS, owner, 'unsupported code block field')
    text(block.get('source'), owner + '/source')
    require(block.get('kind') in {'python', 'text'}, owner, 'kind must be python or text')
    if 'caption' in block:
        text(block['caption'], owner + '/caption')
    if 'output' in block:
        require(isinstance(block['output'], str), owner, 'output must be text')
    if block['kind'] == 'text':
        require('error' not in block, owner, 'text blocks cannot declare Python errors')
        return
    require('output' in block, owner, 'Python block needs exact expected stdout')
    if 'error' in block:
        require(isinstance(block['error'], str) and
                re.fullmatch(r'[A-Za-z_][A-Za-z0-9_]*', block['error']), owner, 'invalid error class')
    try:
        compile(block['source'], owner, 'exec')
    except SyntaxError:
        # An explicitly authored syntax-error example is verified by execution.
        if block.get('error') != 'SyntaxError':
            raise
    blocks.append((owner, block))


def validate_question(question, owner, ids, blocks, prompt_sources, is_review=False):
    require(isinstance(question, dict), owner, 'question object required')
    require(not {'options', 'optionFormat', 'answer'} & set(question), owner, 'written exercises only')
    for field in ['skill', 'question', 'explanation']:
        text(question.get(field), owner + '/' + field)
    solution = question.get('solution')
    require(isinstance(solution, dict), owner, 'solution object required')
    text(solution.get('answer'), owner + '/solution/answer')
    if 'code' in solution:
        validate_block(solution['code'], owner + '/solution/code', blocks)
    if 'code' in question:
        text(question['code'], owner + '/code')
        require(question.get('codeKind', 'python') in {'python', 'text'}, owner, 'invalid question code kind')
        if question.get('codeKind', 'python') == 'python':
            compile(question['code'], owner, 'exec')
            prompt_sources.append(owner)
    related = question.get('related', [])
    require(isinstance(related, list) and all(isinstance(item, str) and item in ids for item in related),
            owner, 'related lesson must belong to this chapter')
    require(len(related) == len(set(related)), owner, 'duplicate related lesson')
    if is_review:
        require(bool(related), owner, 'review needs related lessons')


def validate_lesson(lesson, expected, order, ids, blocks, prompt_sources):
    owner = expected[0]
    require(isinstance(lesson, dict), owner, 'lesson object required')
    require((lesson.get('id'), lesson.get('title')) == expected, owner, 'curriculum ID/title mismatch')
    require(type(lesson.get('order')) is int and lesson['order'] == order, owner, 'lesson order mismatch')
    require(type(lesson.get('minutes')) is int and lesson['minutes'] > 0, owner, 'positive minutes required')
    for field in ['subtitle', 'goal', 'intro']:
        text(lesson.get(field), owner + '/' + field)
    sections = lesson.get('sections')
    require(isinstance(sections, list) and len(sections) >= 3, owner, 'at least three concept sections required')
    for index, section in enumerate(sections, 1):
        require(isinstance(section, dict), owner, 'section object required')
        text(section.get('title'), f'{owner}/section{index}/title')
        text_list(section.get('body'), f'{owner}/section{index}/body')
        if 'code' in section:
            validate_block(section['code'], f'{owner}/section{index}/code', blocks)
    worked = lesson.get('worked')
    require(isinstance(worked, dict), owner, 'worked example required')
    text(worked.get('question'), owner + '/worked/question')
    text_list(worked.get('steps'), owner + '/worked/steps')
    text(worked.get('answer'), owner + '/worked/answer')
    if 'code' in worked:
        validate_block(worked['code'], owner + '/worked/code', blocks)
    misconception = lesson.get('misconception')
    require(isinstance(misconception, dict), owner, 'misconception required')
    for field in ['question', 'answer']:
        text(misconception.get(field), owner + '/misconception/' + field)
    text_list(lesson.get('keypoints'), owner + '/keypoints')
    require(len(lesson['keypoints']) == 3, owner, 'exactly three keypoints required')
    examples = lesson.get('examples')
    require(isinstance(examples, list) and len(examples) == 5, owner, 'exactly five examples required')
    for index, question in enumerate(examples, 1):
        validate_question(question, f'{owner}/example{index}', ids, blocks, prompt_sources)


def read_courses():
    courses, blocks, prompts, all_ids = [], [], [], set()
    for path in sorted(SOURCE.glob('ch[0-9][0-9]/course.json')):
        metadata = load(path)
        require(isinstance(metadata, dict), path, 'course metadata object required')
        for field in ['id', 'slug', 'title', 'description', 'prerequisite', 'runtime']:
            text(metadata.get(field), f'{path}/{field}')
        number = metadata.get('number')
        require(type(number) is int and number > 0, path, 'positive chapter number required')
        require(metadata['slug'] == path.parent.name == f'ch{number:02d}', path, 'chapter slug mismatch')
        require(metadata['id'] == 'algorithms-' + metadata['slug'], path, 'chapter ID mismatch')
        plan = planned_lessons(metadata)
        files = metadata.get('lessonFiles')
        require(isinstance(files, list) and len(files) == len(plan), path, 'lesson files must match curriculum')
        require(all(isinstance(name, str) and re.fullmatch(r'lesson-\d{2}\.json', name) for name in files),
                path, 'flat lesson filenames required')
        require(len(files) == len(set(files)), path, 'duplicate lesson file')
        lessons = [load(path.parent / name) for name in files]
        ids = {lesson_id for lesson_id, _ in plan}
        require(len(ids) == len(plan) and not ids & all_ids, path, 'unique lesson IDs required')
        all_ids.update(ids)
        for order, (lesson, expected) in enumerate(zip(lessons, plan), 1):
            validate_lesson(lesson, expected, order, ids, blocks, prompts)
        review = load(path.parent / 'review.json')
        require(isinstance(review, list) and len(review) == 10, path, 'exactly ten review questions required')
        for index, question in enumerate(review, 1):
            validate_question(question, f'{metadata["id"]}/review{index}', ids, blocks, prompts, True)
        require(set().union(*(set(question['related']) for question in review)) == ids, path, 'review must cover all lessons')
        if number == 1:
            counts = {name: sum(question['skill'].startswith(name + ' ·') for question in review)
                      for name in ['명세', '절차 추적', '정확성 판단', '경계 입력']}
            require(counts == {'명세': 3, '절차 추적': 3, '정확성 판단': 2, '경계 입력': 2}, path,
                    'chapter one review needs specification3/trace3/correctness2/boundary2')
        course = {key: value for key, value in metadata.items() if key != 'lessonFiles'}
        course.update(lessons=lessons, review=review)
        courses.append(course)
    require(bool(courses), SOURCE, 'no authored courses found')
    return courses, blocks, prompts, all_ids


def execute_blocks(blocks):
    for owner, block in blocks:
        with tempfile.TemporaryDirectory(prefix='academy-algorithms-') as directory:
            source = Path(directory) / 'example.py'
            source.write_text(block['source'] + '\n', encoding='utf-8', newline='')
            try:
                run = subprocess.run([sys.executable, '-I', str(source)], cwd=directory,
                                     input='', capture_output=True, text=True, encoding='utf-8', timeout=5)
            except subprocess.TimeoutExpired as error:
                raise ValueError(f'{owner}: Python block did not terminate within five seconds') from error
            require(run.stdout == block['output'], owner,
                    f'expected stdout {block["output"]!r}, got {run.stdout!r}')
            if block.get('error'):
                require(run.returncode != 0 and
                        re.search(r'^' + re.escape(block['error']) + r'(?::|$)', run.stderr, re.M), owner,
                        f'expected {block["error"]}, got {run.stderr!r}')
            else:
                require(run.returncode == 0 and run.stderr == '', owner, f'unexpected error {run.stderr!r}')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check-code', action='store_true', help='execute trusted author blocks with exact stdout comparison')
    parser.add_argument('--check', action='store_true', help='check generated bundle without writing it')
    args = parser.parse_args()
    courses, blocks, prompts, ids = read_courses()
    if args.check_code:
        execute_blocks(blocks)
        print(f'Executed {len(blocks)} trusted Python blocks with Python {sys.version.split()[0]}; exact stdout/error checks passed.')
    bundle = ('// Generated by build-algorithms.py; edit content/algorithms instead.\n'
              'window.ALGORITHMS_COURSES = ' + json.dumps(courses, ensure_ascii=False, separators=(',', ':')) + ';\n')
    if args.check:
        require(OUTPUT.is_file() and OUTPUT.read_bytes() == bundle.encode('utf-8'), OUTPUT, 'generated bundle is stale')
    else:
        OUTPUT.write_text(bundle, encoding='utf-8', newline='')
    action = 'checked' if args.check else 'wrote'
    print(f'Validated {len(courses)} algorithms chapters, {len(ids)} lessons, {len(ids) * 5} examples, '
          f'{len(courses) * 10} review questions; syntax-checked {len(prompts)} Python prompts; {action} algorithms-content.js.')


if __name__ == '__main__':
    try:
        main()
    except (ValueError, KeyError, TypeError, SyntaxError, OSError, json.JSONDecodeError) as error:
        sys.exit(f'Algorithms validation failed: {error}')
