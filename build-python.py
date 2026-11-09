"""Validate Python chapter 1 content and emit its static browser bundle.

Optional --check-code executes the trusted lesson snippets in temporary files.
It never executes console blocks or learner input in the website.
"""
import argparse,json,subprocess,sys,tempfile
from pathlib import Path
ROOT=Path(__file__).parent
SOURCE=ROOT/'content/python/ch01'
TITLES=['프로그램·명령·실행 결과','인터프리터와 코드 파일','첫 출력과 문자열 리터럴','순서·들여쓰기·주석','문법 오류와 실행 중 오류']
parser=argparse.ArgumentParser();parser.add_argument('--check-code',action='store_true');args=parser.parse_args()
lessons=[json.loads((SOURCE/f'python-l{i:03d}.json').read_text()) for i in range(1,6)]
review=json.loads((SOURCE/'review.json').read_text())
ids={l['id'] for l in lessons}; assert len(ids)==5
blocks=[]
def validate_block(block,owner):
 assert block['kind'] in ['python','console','text'],(owner,'code kind')
 assert isinstance(block['source'],str) and block['source'].strip(),(owner,'code source')
 if 'output' in block:assert isinstance(block['output'],str),(owner,'output')
 assert block.get('error') is None or isinstance(block['error'],str),(owner,'error')
 if block['kind']=='python':
  assert 'output' in block,(owner,'missing expected output')
  blocks.append((owner,block))
for i,l in enumerate(lessons,1):
 assert l['id']==f'python-l{i:03d}' and l['order']==i and l['title']==TITLES[i-1]
 for key in ['subtitle','goal','intro']: assert isinstance(l[key],str) and l[key].strip(),(l['id'],key)
 assert isinstance(l['minutes'],int) and l['minutes']>0
 assert 3<=len(l['sections'])<=4
 for j,section in enumerate(l['sections'],1):
  assert section['title'] and isinstance(section['body'],list) and section['body']
  assert all(isinstance(x,str) and x.strip() for x in section['body'])
  if section.get('code'):validate_block(section['code'],f"{l['id']}/section{j}")
 assert l['worked']['question'] and l['worked']['steps'] and l['worked']['answer']
 if l['worked'].get('code'):validate_block(l['worked']['code'],l['id']+'/worked')
 assert l['misconception']['question'] and l['misconception']['answer']
 assert len(l['keypoints'])==3 and len(l['examples'])==5
assert len(review)==10
for owner,questions in [(l['id'],l['examples']) for l in lessons]+[('review',review)]:
 for i,q in enumerate(questions,1):
  assert q['question'] and q['skill'] and q['explanation'],(owner,i)
  assert len(q['options'])==4 and len(set(q['options']))==4,(owner,i,'choices')
  assert all(isinstance(o,str) and o for o in q['options'])
  assert type(q['answer']) is int and 0<=q['answer']<4,(owner,i,'answer')
  assert q.get('optionFormat','text') in ['text','code']
  assert q.get('codeKind','python') in ['python','console','text']
  if owner=='review':assert q['related'] and set(q['related'])<=ids,(owner,i,'related')
assert set().union(*(set(q['related']) for q in review))==ids,'Review must cover all lessons'
if args.check_code:
 with tempfile.TemporaryDirectory(prefix='academy-python-') as tmp:
  for owner,block in blocks:
   file=Path(tmp)/'lesson.py';file.write_text(block['source']+'\n')
   run=subprocess.run([sys.executable,'-I',str(file)],capture_output=True,text=True,timeout=5,cwd=tmp)
   assert run.stdout.rstrip('\n')==block['output'].rstrip('\n'),(owner,'stdout',run.stdout,block['output'])
   if block.get('error'):
    assert run.returncode!=0 and block['error']+':' in run.stderr,(owner,'expected error',run.stderr)
   else:assert run.returncode==0,(owner,'unexpected error',run.stderr)
 print(f'Executed {len(blocks)} trusted lesson snippets with Python {sys.version.split()[0]}.')
course={'id':'python-ch01','title':'프로그램을 읽고 실행하기','description':'입력과 처리, 코드와 출력, 실행과 오류의 차이를 작은 프로그램으로 이해합니다.','runtime':'Python 3','testedVersion':sys.version.split()[0] if args.check_code else None,'lessons':lessons,'review':review}
(ROOT/'python-content.js').write_text('window.PYTHON_CH01 = '+json.dumps(course,ensure_ascii=False,separators=(',',':'))+';\n')
print('Validated 5 Python lessons, 25 examples, 10 review questions; wrote python-content.js.')
