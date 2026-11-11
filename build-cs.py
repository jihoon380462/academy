"""Validate authored CS reading material and emit its static browser bundle.

Text diagrams are displayed as reading material; no code is executed.
"""
import argparse
import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / 'content' / 'cs'
OUTPUT = ROOT / 'cs-content.js'


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
    require(path.is_file(), path, 'source file missing')
    return json.loads(path.read_text(encoding='utf-8'))


def planned_lessons(course):
    plan = (ROOT / 'docs' / 'curriculum' / 'cs.md').read_text(encoding='utf-8')
    header = re.search(r'^### ' + re.escape(course['id']) + r' · (.+)$', plan, re.M)
    require(header is not None, course['id'], 'chapter missing from curriculum')
    require(header.group(1).strip() == course['title'], course['id'], 'curriculum chapter title mismatch')
    body = plan[header.end():].split('\n### ', 1)[0]
    lessons = re.findall(r'^\| `(cs-l\d{3})` \| ([^|]+) \|', body, re.M)
    require(bool(lessons), course['id'], 'curriculum lesson table missing')
    return [(lesson_id, title.strip()) for lesson_id, title in lessons]


def validate_block(block, owner):
    require(isinstance(block, dict), owner, 'text block object required')
    require(set(block) <= {'kind', 'source', 'caption'}, owner, 'unsupported text block field')
    require(block.get('kind') == 'text', owner, 'only reading-material text blocks are supported')
    text(block.get('source'), owner + '/source')
    if 'caption' in block:
        text(block['caption'], owner + '/caption')


def validate_visual(visual, owner):
    require(isinstance(visual, dict), owner, 'visual object required')
    kind = visual.get('type')
    require(kind in ('cells', 'flow', 'table'), owner, 'unsupported visual type')
    for field in ('title', 'caption'):
        text(visual.get(field), owner + '/' + field)
    common = {'type', 'title', 'caption'}
    if kind == 'table':
        require(set(visual) <= common | {'headers', 'rows'}, owner, 'unsupported table field')
        text_list(visual.get('headers'), owner + '/headers')
        rows = visual.get('rows')
        require(isinstance(rows, list) and bool(rows), owner, 'nonempty table rows required')
        for index, row in enumerate(rows, 1):
            text_list(row, f'{owner}/row{index}')
            require(len(row) == len(visual['headers']), owner, 'table row/header width mismatch')
    else:
        require(set(visual) <= common | {'items'}, owner, 'unsupported diagram field')
        items = visual.get('items')
        require(isinstance(items, list) and bool(items), owner, 'nonempty diagram items required')
        for index, item in enumerate(items, 1):
            item_owner = f'{owner}/item{index}'
            require(isinstance(item, dict) and set(item) <= {'label', 'value', 'note'},
                    item_owner, 'diagram item object with label/value/optional note required')
            for field in ('label', 'value'):
                text(item.get(field), item_owner + '/' + field)
            if 'note' in item:
                text(item['note'], item_owner + '/note')


def validate_guidance(block, owner):
    if 'instructions' in block:
        text_list(block['instructions'], owner + '/instructions')
    if 'answerFormat' in block:
        text(block['answerFormat'], owner + '/answerFormat')
    if 'visual' in block:
        validate_visual(block['visual'], owner + '/visual')


def validate_question(question, owner, ids, is_review=False):
    require(isinstance(question, dict), owner, 'question object required')
    require(not {'options', 'optionFormat', 'answer'} & set(question), owner, 'written exercises only')
    for field in ['skill', 'question', 'explanation']:
        text(question.get(field), owner + '/' + field)
    validate_guidance(question, owner)
    if 'exerciseType' in question:
        require(question['exerciseType'] == 'explain', owner, 'CS exercises explain concepts without code execution')
    solution = question.get('solution')
    require(isinstance(solution, dict), owner, 'solution object required')
    text(solution.get('answer'), owner + '/solution/answer')
    if 'code' in solution:
        validate_block(solution['code'], owner + '/solution/code')
    if 'code' in question:
        text(question['code'], owner + '/code')
        require(question.get('codeKind') == 'text', owner, 'question diagrams need codeKind text')
    else:
        require('codeKind' not in question, owner, 'codeKind requires a question diagram')
    related = question.get('related', [])
    require(isinstance(related, list) and all(isinstance(item, str) and item in ids for item in related),
            owner, 'related lesson must belong to this chapter')
    require(len(related) == len(set(related)), owner, 'duplicate related lesson')
    if is_review:
        require(bool(related), owner, 'review needs related lessons')


def validate_lesson(lesson, expected, order, ids):
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
        section_owner = f'{owner}/section{index}'
        require(isinstance(section, dict), section_owner, 'section object required')
        text(section.get('title'), section_owner + '/title')
        text_list(section.get('body'), section_owner + '/body')
        if 'code' in section:
            validate_block(section['code'], section_owner + '/code')
        if 'visual' in section:
            validate_visual(section['visual'], section_owner + '/visual')
    worked = lesson.get('worked')
    require(isinstance(worked, dict), owner, 'worked example required')
    text(worked.get('question'), owner + '/worked/question')
    text_list(worked.get('steps'), owner + '/worked/steps')
    text(worked.get('answer'), owner + '/worked/answer')
    validate_guidance(worked, owner + '/worked')
    if 'code' in worked:
        validate_block(worked['code'], owner + '/worked/code')
    misconception = lesson.get('misconception')
    require(isinstance(misconception, dict), owner, 'misconception required')
    for field in ['question', 'answer']:
        text(misconception.get(field), owner + '/misconception/' + field)
    text_list(lesson.get('keypoints'), owner + '/keypoints')
    require(len(lesson['keypoints']) == 3, owner, 'exactly three keypoints required')
    examples = lesson.get('examples')
    require(isinstance(examples, list) and len(examples) == 5, owner, 'exactly five examples required')
    for index, question in enumerate(examples, 1):
        validate_question(question, f'{owner}/example{index}', ids)


def read_courses():
    courses, all_ids, chapter_ids = [], set(), set()
    for path in sorted(SOURCE.glob('ch[0-9][0-9]/course.json')):
        metadata = load(path)
        require(isinstance(metadata, dict), path, 'course metadata object required')
        for field in ['id', 'slug', 'title', 'description', 'prerequisite', 'runtime']:
            text(metadata.get(field), f'{path}/{field}')
        number = metadata.get('number')
        require(type(number) is int and number > 0, path, 'positive chapter number required')
        require(metadata['slug'] == path.parent.name == f'ch{number:02d}', path, 'chapter slug mismatch')
        require(metadata['id'] == 'cs-' + metadata['slug'], path, 'chapter ID mismatch')
        require(metadata['id'] not in chapter_ids, path, 'duplicate chapter ID')
        chapter_ids.add(metadata['id'])
        references = metadata.get('references', [])
        require(isinstance(references, list), path, 'references array required')
        for index, reference in enumerate(references, 1):
            owner = f'{path}/reference{index}'
            require(isinstance(reference, dict), owner, 'reference object required')
            text(reference.get('title'), owner + '/title')
            text(reference.get('url'), owner + '/url')
            require(reference['url'].startswith('https://'), owner, 'HTTPS reference URL required')
        for field in ['referenceCheckedAt', 'validationEnvironment']:
            if field in metadata:
                text(metadata[field], f'{path}/{field}')
        plan = planned_lessons(metadata)
        files = metadata.get('lessonFiles')
        require(isinstance(files, list) and len(files) == len(plan), path, 'lesson files must match curriculum')
        require(all(isinstance(name, str) and re.fullmatch(r'lesson-\d{2}\.json', name) for name in files),
                path, 'flat lesson filenames required')
        require(len(files) == len(set(files)), path, 'duplicate lesson file')
        ids = {lesson_id for lesson_id, _ in plan}
        require(len(ids) == len(plan) and not ids & all_ids, path, 'unique lesson IDs required')
        all_ids.update(ids)
        lessons = [load(path.parent / name) for name in files]
        for order, (lesson, expected) in enumerate(zip(lessons, plan), 1):
            validate_lesson(lesson, expected, order, ids)
        review = load(path.parent / 'review.json')
        require(isinstance(review, list) and len(review) == 10, path, 'exactly ten review questions required')
        for index, question in enumerate(review, 1):
            validate_question(question, f'{metadata["id"]}/review{index}', ids, True)
        require(set().union(*(set(question['related']) for question in review)) == ids,
                path, 'review must cover all lessons')
        course = {key: value for key, value in metadata.items() if key != 'lessonFiles'}
        course.update(lessons=lessons, review=review)
        courses.append(course)
    require(bool(courses), SOURCE, 'no authored courses found')
    return courses, all_ids


def render_bundle(courses):
    payload = json.dumps(courses, ensure_ascii=False, separators=(',', ':'))
    payload = payload.replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')
    return ('// Generated by build-cs.py; edit content/cs instead.\n'
            'window.CS_COURSES = ' + payload + ';\n'
            "window.CS_CH01 = window.CS_COURSES.find(course => course.id === 'cs-ch01');\n")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='check generated bundle without writing it')
    args = parser.parse_args()
    courses, ids = read_courses()
    bundle = render_bundle(courses)
    if args.check:
        require(OUTPUT.is_file() and OUTPUT.read_bytes() == bundle.encode('utf-8'), OUTPUT, 'generated bundle is stale')
    else:
        OUTPUT.write_text(bundle, encoding='utf-8', newline='')
    action = 'checked' if args.check else 'wrote'
    print(f'Validated {len(courses)} CS chapters, {len(ids)} lessons, {len(ids) * 5} examples, '
          f'{len(courses) * 10} review questions; {action} cs-content.js.')


if __name__ == '__main__':
    try:
        main()
    except (ValueError, KeyError, TypeError, OSError) as error:
        sys.exit(f'CS validation failed: {error}')
