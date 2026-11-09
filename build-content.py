"""Validate original course content and emit the buildless browser bundle."""
import json
from pathlib import Path
root=Path(__file__).parent
sources=['numbers','algebra','geometry','shapes','statistics']
lessons=[l for file in sources for l in json.loads((root/'content'/f'{file}.json').read_text())]
lessons.sort(key=lambda l:l['order'])
assert len(lessons)==30 and [l['order'] for l in lessons]==list(range(1,31))
ids={l['id'] for l in lessons}
assert len(ids)==30
for lesson in lessons:
 if lesson['unit']=='shapes':lesson['unit']='plane' if lesson['order']<=22 else 'solids'
 for key in ['id','unit','order','title','subtitle','minutes','intro','steps','visual','worked','misconception','keypoints','examples']:assert key in lesson,(lesson['id'],key)
 assert len(lesson['steps'])==3 and len(lesson['keypoints'])==3 and len(lesson['examples'])==5,lesson['id']
 assert all(len(x['body'])>=80 for x in lesson['steps']),lesson['id']
review=json.loads((root/'content/review.json').read_text())
assert len(review)==10
for owner,questions in [(l['id'],l['examples']) for l in lessons]+[('review',review)]:
 for i,q in enumerate(questions):
  assert len(q['options'])==4 and len(set(q['options']))==4,(owner,i,'options')
  assert isinstance(q['answer'],int) and 0<=q['answer']<4,(owner,i,'answer')
  assert len(q['explanation'])>=25,(owner,i,'explanation')
  if owner=='review':assert q['related'] and set(q['related'])<=ids,(i,'links')
units=[
 {'id':'factors','title':'소인수분해','description':'수를 만드는 재료, 약수와 배수의 관계'},
 {'id':'rational','title':'정수와 유리수','description':'음수까지 넓어진 수, 계산이 성립하는 이유'},
 {'id':'algebra','title':'문자와 식','description':'문자로 관계를 표현하고 방정식 풀기'},
 {'id':'graphs','title':'좌표와 그래프','description':'두 수량의 관계를 눈에 보이게'},
 {'id':'geometry','title':'기본도형과 작도','description':'점과 선에서 시작해 합동까지'},
 {'id':'plane','title':'평면도형','description':'각의 합, 원과 부채꼴의 길이와 넓이'},
 {'id':'solids','title':'입체도형','description':'입체를 펼치고 채우며 겉넓이와 부피 이해하기'},
 {'id':'statistics','title':'자료의 정리와 해석','description':'대푯값부터 상대도수까지, 자료에서 의미 찾기'},
]
assert {l['unit'] for l in lessons}=={u['id'] for u in units}
data={'units':units,'lessons':lessons,'review':review}
(root/'curriculum.js').write_text('window.CURRICULUM = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n')
print(f'Validated {len(units)} units, {len(lessons)} lessons, {sum(len(l["examples"]) for l in lessons)} examples, {len(review)} review questions.')
