# 이해수학 중학교 1학년

## Scope
- Selected design 01: warm ivory, forest green, editorial typography.
- Home, one grade-one chapter, eight units, thirty lessons.
- Each lesson: original introduction, three concept explanations, exact diagram or concept cards, worked example, misconception, three takeaways, five examples.
- 150 examples and 10 integrative review questions with explanations and links to relevant lessons.
- Curriculum scope checked against EBS 2022-revised middle-school grade-one upper/lower course contents; 대푯값 included.

## Verification
- build-content.py validates all required fields, 30 sequential lesson orders, 150 examples, 10 review questions, unique choices, answer ranges and review links.
- All JS syntax checked.
- Independent mathematical review of lesson text, arithmetic, choices and SVG diagrams; corrections applied for equiangular polygons, graph context, construction and perpendicular distances.
- Browser: home and mobile home, chapter search, lesson navigation, read marker, five-question example completion (5/5), ten-question review completion (9/10 with intentional wrong response), relevant-lesson return and dialog dismissal.
- Browser reload retained completion, example score, review score.
- Representative mobile layouts checked at 390px iframe (375px content excluding scrollbar); no horizontal overflow in eight representative lessons across numeric, algebra, geometry and statistics domains.
- Screenshots: previews/grade1/homepage.jpg and lesson.jpg.

## Limits
- Records use localStorage in the current browser; no automatic cross-device synchronization.
- Ten review questions check broad principles and link to detailed lessons; they do not test every minor skill independently.
- EBS is a scope reference, not the source of lesson prose or questions.
