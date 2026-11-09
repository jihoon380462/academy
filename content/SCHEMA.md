# Legacy middle-school grade-one content schema

This schema applies only to the existing published math/middle-1 content. Its 3-step/4-choice requirements and ban on high-school topics are local to that course, not global curriculum limits. For new subjects or higher math courses, read `../docs/START-HERE.md`, `../docs/AUTHORING.md`, and the matching `../docs/curriculum/<subject-id>.md` first. Preserve the existing content format and IDs when editing middle-1.

Each output JSON is an array of lesson objects. Required shape:
{
 "id":"prime", "unit":"factors", "order":1,
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
Exactly 3 concept steps, 5 examples, 4 unique options each, one correct answer index 0-3. Plain text only, unicode math okay, no Markdown or HTML, no LaTex backslashes. Examples easy but varied (meaning, calculation, counterexample/reason). Explicitly avoid advanced/highschool topics and killer problems. No copying textbook prose. Accurate enough to teach principles. Visual SVGs are rendered by `../visuals.js`; each visual type and caption must match the actual rendered diagram. If no specific diagram is implemented, use "concept-cards" without describing a nonexistent image. Preserve existing IDs and check all affected JSON sources together with the generated curriculum.js. This file describes the existing middle-1 format only; the task scope is determined by the current user request and repository AGENTS.md.
