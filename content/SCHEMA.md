Each output JSON is an array of lesson objects. Required shape:
{
 "id":"prime", "unit":"numbers", "order":1,
 "title":"소수와 합성수", "subtitle":"One Korean sentence with conceptual focus",
 "minutes":7,
 "intro":"2-3 Korean sentences motivating why, not mere definition",
 "steps":[{"title":"Short concept step title","body":"3-5 Korean sentences clearly explaining why with concrete numbers.","math":"Optional exact math equation unicode string"}],
 "visual":{"type":"factor-tree","caption":"Explain what visual shows and any exact values used"},
 "worked":{"question":"One worked example","steps":["First reason","Second reason","Result and meaning"],"answer":"answer"},
 "misconception":{"question":"Common conceptual confusion?","answer":"Clear correction with reason"},
 "keypoints":["Essential takeaway1","Essential takeaway2","Essential takeaway3"],
 "examples":[{"question":"Question", "options":["A","B","C","D"],"answer":0,"explanation":"Reason and calculation, not just answer", "skill":"short concept"}]
}
Exactly 3 concept steps, 5 examples, 4 unique options each, one correct answer index 0-3. Plain text only, unicode math okay, no Markdown or HTML, no LaTex backslashes. Examples easy but varied (meaning, calculation, counterexample/reason). Explicitly avoid advanced/highschool topics and killer problems. No copying textbook prose. Accurate enough to teach principles. Root provides visual SVGs; visual type below must match relevant lesson. Each lesson's visual.caption describes ROOT predefined SVG as assigned. If no exact visual assigned use "concept-cards", no claims about nonexistent visual. Root can create new appropriate diagram afterward. ids must unique and exact. Store only owned JSON file, no other edits.
