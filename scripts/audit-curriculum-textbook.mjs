import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const failures = []
const warnings = []

const registry = read('src/curriculum-audit-registry.ts')
const math7Scope = read('src/curriculum-official-scope-math7.ts')
const math7Supplement = read('src/curriculum-textbook-supplement-math7.ts')
const science7Scope = read('src/curriculum-official-scope-science7.ts')
const science7Supplement = read('src/curriculum-textbook-supplement-science7.ts')
const science7Source = read('src/curriculum-reviewed-science7.ts')
const aggregator = read('src/curriculum-reviewed-content.ts')
const foundation = read('src/curriculum-foundation-content.ts')
const foundationV12 = read('src/curriculum-foundation-question-bank-v12.ts')
const player = read('src/components/CurriculumCourseAppV12.tsx')
const activeExport = read('src/components/CurriculumCourseApp.tsx')
const visualLayer = read('src/components/CurriculumCourseAppV8.tsx')

for (const structure of [
  'integrated-life',
  'platform-extension',
  'discipline-split-required',
  'path-selection-required',
]) {
  if (!registry.includes(structure)) failures.push(`audit registry missing structural policy: ${structure}`)
}

if (!registry.includes('TEXTBOOK_READY_UNITS = new Set<string>()')) {
  failures.push('textbook-ready registry must remain explicit; units may only be promoted after full gates')
}

const requiredMath7Codes = [
  'N-7-1', 'N-7-2', 'N-7-3', 'N-7-4', 'N-7-5', 'N-7-6', 'N-7-7', 'N-7-8', 'N-7-9',
  'S-7-1', 'S-7-2', 'S-7-3', 'S-7-4', 'S-7-5',
  'G-7-1',
  'A-7-1', 'A-7-2', 'A-7-3', 'A-7-4', 'A-7-5', 'A-7-6', 'A-7-7', 'A-7-8',
  'D-7-1', 'D-7-2',
]
for (const code of requiredMath7Codes) {
  if (!math7Scope.includes(`'${code}'`)) failures.push(`grade 7 math official scope mapping missing ${code}`)
}

const math7UnitIds = [...math7Scope.matchAll(/unitId:\s*'([^']+)'/g)].map((match) => match[1])
const uniqueMath7UnitIds = new Set(math7UnitIds)
if (uniqueMath7UnitIds.size !== 9) failures.push(`grade 7 math official scope should map 9 units, found ${uniqueMath7UnitIds.size}`)
for (const unitId of uniqueMath7UnitIds) {
  if (!math7Supplement.includes(`unitId: '${unitId}'`)) failures.push(`grade 7 math textbook supplement missing ${unitId}`)
}
const math7QuestionCount = (math7Supplement.match(/supp-q\d+/g) ?? []).length
const math7ExampleCount = (math7Supplement.match(/workedExamples:\s*\[/g) ?? []).length
const math7MisconceptionCount = (math7Supplement.match(/title:\s*'常見迷思/g) ?? []).length
if (math7QuestionCount < 36) failures.push(`grade 7 math supplement questions ${math7QuestionCount} < 36`)
if (math7ExampleCount < 9) failures.push(`grade 7 math supplement worked examples ${math7ExampleCount} < 9`)
if (math7MisconceptionCount < 18) failures.push(`grade 7 math misconception concepts ${math7MisconceptionCount} < 18`)
if (!aggregator.includes('getMath7TextbookSupplement')) failures.push('grade 7 math textbook supplement is not wired into reviewed content')

const science7UnitIds = [...science7Scope.matchAll(/unitId:\s*'([^']+)'/g)].map((match) => match[1])
const uniqueScience7UnitIds = new Set(science7UnitIds)
if (uniqueScience7UnitIds.size !== 6) failures.push(`grade 7 biology sequence should map 6 units to stage-IV scope, found ${uniqueScience7UnitIds.size}`)
for (const unitId of uniqueScience7UnitIds) {
  if (!science7Supplement.includes(`unitId: '${unitId}'`)) failures.push(`grade 7 science textbook supplement missing ${unitId}`)
}
for (const requiredScienceCode of ['Da-Ⅳ-1', 'Da-Ⅳ-4', 'Bc-Ⅳ-1', 'Bc-Ⅳ-4', 'Db-Ⅳ-1', 'Dc-Ⅳ-5', 'Ga-Ⅳ-6', 'Gb-Ⅳ-1', 'Gc-Ⅳ-4', 'Bd-Ⅳ-3', 'Lb-Ⅳ-3']) {
  if (!science7Scope.includes(requiredScienceCode)) failures.push(`grade 7 science stage-IV mapping missing ${requiredScienceCode}`)
}
if (!science7Scope.includes('第四學習階段') || !science7Scope.includes('七～九年級')) {
  failures.push('grade 7 science scope mapping must state that stage-IV codes cover grades 7-9 rather than a nationally fixed grade-7 semester sequence')
}
const science7QuestionCount = (science7Supplement.match(/supp-q\d+/g) ?? []).length
const science7ExampleCount = (science7Supplement.match(/workedExamples:\s*\[/g) ?? []).length
const science7MisconceptionCount = (science7Supplement.match(/title:\s*'常見迷思/g) ?? []).length
if (science7QuestionCount < 24) failures.push(`grade 7 science supplement questions ${science7QuestionCount} < 24`)
if (science7ExampleCount < 6) failures.push(`grade 7 science supplement worked examples ${science7ExampleCount} < 6`)
if (science7MisconceptionCount < 15) failures.push(`grade 7 science misconception concepts ${science7MisconceptionCount} < 15`)
if (!aggregator.includes('getScience7TextbookSupplement')) failures.push('grade 7 science textbook supplement is not wired into reviewed content')
if (science7Source.includes('בלבד')) {
  warnings.push('grade 7 science source still contains a legacy foreign-token artifact; sanitizer protects runtime, but source cleanup is required before textbook-ready promotion')
}

for (const oldMetaSignal of ['applicationPrompt', 'goodApplication', 'distractors']) {
  if (!foundation.includes(oldMetaSignal)) warnings.push(`legacy foundation generator signal not found: ${oldMetaSignal}`)
}
if (!aggregator.includes('upgradeFoundationUnitV12')) failures.push('foundation content must be upgraded through the v12 subject-question layer before rendering')
for (const subjectSignal of [
  '3x+5=20',
  '沉著',
  'Mia goes to the library after school on Tuesday',
  'science-animal-cell-zhtw',
  'social-taiwan-relief',
]) {
  if (!foundationV12.includes(subjectSignal)) failures.push(`v12 foundation subject question evidence missing: ${subjectSignal}`)
}

for (const disjointSignal of [
  'splitQuestionBank',
  'groups.guided',
  'groups.practice',
  'groups.assessment',
]) {
  if (!player.includes(disjointSignal)) failures.push(`V12 lesson question partition missing ${disjointSignal}`)
}
if (player.includes("lesson.kind === 'launch') return all.slice") failures.push('launch must not reuse the same question pool as later lessons')
if (player.includes("lesson.kind === 'example') return all.slice") failures.push('worked-example lesson must not reuse the same question pool as later lessons')

for (const readerLeak of [
  'getUnitAuditSnapshot',
  'getTrackPolicy',
  'compactAuditLabel',
  '課綱範圍已核對',
  '教材初稿',
  '教科書級 QA',
  '品質層級',
]) {
  if (player.includes(readerLeak)) failures.push(`reader-facing V12 leaks internal audit detail: ${readerLeak}`)
}
if (!activeExport.includes("from './CurriculumCourseAppV8'")) failures.push('active export must use stable v8 visual layer')
if (activeExport.includes('MutationObserver') || activeExport.includes('requestAnimationFrame')) failures.push('active export must not rewrite reader-facing DOM after render')
if (!visualLayer.includes("from './CurriculumCourseAppV12'")) failures.push('stable visual layer must wrap V12 directly')

for (const feature of ['optionFeedback', 'mediaAssetId', 'audioText', 'rubric']) {
  if (!aggregator.includes(feature)) failures.push(`aggregator must preserve enhanced question field: ${feature}`)
  if (!foundationV12.includes(feature)) failures.push(`foundation subject bank must be able to create enhanced field: ${feature}`)
}
if (!player.includes('QuestionMedia')) failures.push('reader player lacks question-bound media rendering')
if (!player.includes('AudioPrompt')) failures.push('reader player lacks audio/TTS question rendering')
if (!player.includes('curriculum-response-rubric')) failures.push('reader player lacks response rubric rendering')
if (!player.includes('selectedFeedback')) failures.push('reader player lacks per-option diagnostic feedback')

if (failures.length) {
  console.error('[textbook-audit] FAILED')
  for (const failure of failures) console.error(`- ${failure}`)
  for (const warning of warnings) console.warn(`! ${warning}`)
  process.exit(1)
}

console.log('[textbook-audit] structural + scope + reader-separation + disjoint-question + enhanced-feedback gates passed')
console.log(`[textbook-audit] grade 7 math supplement: 9 units, ${math7QuestionCount} extra subject questions, ${math7MisconceptionCount} misconception concepts`)
console.log(`[textbook-audit] grade 7 science supplement: 6 units, ${science7QuestionCount} extra subject questions, ${science7MisconceptionCount} misconception concepts`)
for (const warning of warnings) console.log(`[textbook-audit] NOTE: ${warning}`)
console.log('[textbook-audit] textbook-ready units remain controlled by the internal promotion registry')
