import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const failures = []

const depth = read('src/curriculum-textbook-depth-v14.ts')
const lifeDepth = read('src/curriculum-life-depth-v14.ts')
const aggregator = read('src/curriculum-reviewed-content.ts')
const inventory = read('scripts/report-curriculum-audit.mjs')
const registry = read('src/curriculum-audit-registry.ts')
const foundation = read('src/curriculum-foundation-content.ts')
const pathway = read('src/curriculum-pathway-foundation-v13.ts')
const life = read('src/curriculum-life-question-bank-v13.ts')

for (const token of [
  'enrichFoundationUnitV14',
  'auditTextbookDepthV14',
  'conceptCount < 6',
  'misconceptionCount < 2',
  'workedExampleCount < 3',
  'questionCount < 12',
  'choiceCount < 6',
  'responseCount < 2',
  'rubricCount < 1',
  'diagnosisExample',
  'transferExample',
  'transferResponse',
  '常見迷思',
  'Common misconception',
  '國家教育研究院',
]) {
  if (!depth.includes(token)) failures.push(`V14 depth engine missing contract: ${token}`)
}

for (const subjectBranch of [
  "unit.subject === 'math'",
  "unit.subject === 'science'",
  "unit.subject === 'social'",
  "unit.subject === 'english'",
]) {
  if (!depth.includes(subjectBranch)) failures.push(`V14 depth engine missing subject-specific branch: ${subjectBranch}`)
}

for (const token of [
  'specializeLifeDepthV14',
  '常見迷思：我覺得就是我觀察到的事實',
  '常見迷思：合作就是大家一起做，不需要分工和比較',
  '錯誤診斷：把「我覺得」改成可以比較的觀察',
  '轉移示範：把探究方法帶到新的生活問題',
  '生活課程課程綱要',
]) {
  if (!lifeDepth.includes(token)) failures.push(`V14 Life specialization missing: ${token}`)
}

if (!aggregator.includes('enrichFoundationUnitV14')) failures.push('content aggregator does not import V14 depth enrichment')
if (!aggregator.includes('specializeLifeDepthV14')) failures.push('content aggregator does not import Life V14 specialization')
if (!aggregator.includes('const deepened = enrichFoundationUnitV14(withLifeQuestions)')) failures.push('V14 depth enrichment must run after V12/Life question construction')
if (!aggregator.includes("const specialized = unitId.includes('-life-') ? specializeLifeDepthV14(deepened) : deepened")) failures.push('Life specialization must run after generic V14 enrichment')
if (!aggregator.includes('return sanitizeQuestions(specialized)')) failures.push('sanitization must run after V14/Life enrichment')
if (!aggregator.includes("unitId.includes('-life-')")) failures.push('Life Curriculum override must remain in aggregator')

for (const token of ['foundationDepthReadyUnits !== 420','foundationDraftUnits = 0','version: \'v14-textbook-depth\'']) {
  if (!inventory.includes(token)) failures.push(`V14 inventory missing assertion: ${token}`)
}

// Depth completion must not silently promote every unit to textbook-ready.
if (!registry.includes('const TEXTBOOK_READY_UNITS = new Set<string>()')) failures.push('textbook-ready registry must remain explicit')
if (!registry.includes("tier: 'foundation-draft'")) failures.push('registry must retain a non-certified state for units lacking official per-unit promotion')
if (depth.includes("reviewStatus: 'reviewed'") || depth.includes("reviewStatus: 'textbook-ready'")) {
  failures.push('V14 depth engine must not self-promote Foundation units to reviewed/textbook-ready')
}

// Existing sources remain required: V14 enriches them, it does not replace subject foundations.
for (const token of ['CHINESE_RULES','ENGLISH_RULES','MATH_RULES','SCIENCE_RULES','SOCIAL_RULES']) {
  if (!foundation.includes(token)) failures.push(`base Foundation subject rule regressed: ${token}`)
}
if (!pathway.includes('getPathwayFoundationUnitContent')) failures.push('pathway Foundation source regressed')
if (!life.includes('buildLifeCurriculumQuestionsV13')) failures.push('Life Curriculum integrated question source regressed')

// Content-quality hygiene: no missing-material placeholders or fake references.
for (const phrase of ['看到一張統計圖後','依圖表而異','依文本而異','答案依題目而異','根據下圖','依下圖','觀察下圖','請看下圖','如圖所示','依附圖']) {
  if (depth.includes(phrase) || lifeDepth.includes(phrase)) failures.push(`V14 depth content contains missing-material wording: ${phrase}`)
}

if (failures.length) {
  console.error('[curriculum-v14-depth] FAILED')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('[curriculum-v14-depth] Foundation textbook-depth + Life specialization contracts passed')
console.log('[curriculum-v14-depth] gate: concepts>=6 misconceptions>=2 workedExamples>=3 questions>=12 choice>=6 response>=2 rubric>=1 + diagnosis + transfer')
console.log('[curriculum-v14-depth] certification remains separate: depth-ready does not equal textbook-ready')
