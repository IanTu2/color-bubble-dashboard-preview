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
const player = read('src/components/CurriculumCourseAppV5.tsx')
const activeExport = read('src/components/CurriculumCourseApp.tsx')

for (const structure of [
  'integrated-life',
  'platform-extension',
  'discipline-split-required',
  'path-selection-required',
]) {
  if (!registry.includes(structure)) failures.push(`audit registry missing structural policy: ${structure}`)
}

if (!registry.includes('TEXTBOOK_READY_UNITS = new Set<string>()')) {
  failures.push('v10 must start with an explicit empty textbook-ready registry; units may only be promoted after full gates')
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
  failures.push('grade 7 science scope mapping must explicitly state that stage-IV codes cover grades 7-9 rather than a nationally fixed grade-7 semester sequence')
}
const science7QuestionCount = (science7Supplement.match(/supp-q\d+/g) ?? []).length
const science7ExampleCount = (science7Supplement.match(/workedExamples:\s*\[/g) ?? []).length
const science7MisconceptionCount = (science7Supplement.match(/title:\s*'常見迷思/g) ?? []).length
if (science7QuestionCount < 24) failures.push(`grade 7 science supplement questions ${science7QuestionCount} < 24`)
if (science7ExampleCount < 6) failures.push(`grade 7 science supplement worked examples ${science7ExampleCount} < 6`)
if (science7MisconceptionCount < 15) failures.push(`grade 7 science misconception concepts ${science7MisconceptionCount} < 15`)
if (!aggregator.includes('getScience7TextbookSupplement')) failures.push('grade 7 science textbook supplement is not wired into reviewed content')
if (science7Source.includes('בלבד')) {
  warnings.push('grade 7 science reviewed source still contains a legacy foreign-token artifact; runtime sanitizer removes it, but source cleanup is required before any science unit can become textbook-ready')
}

const genericQuestionSignals = [
  'applicationPrompt',
  'goodApplication',
  'distractors',
  '如果同學在',
  '容易犯的錯',
]
for (const signal of genericQuestionSignals) {
  if (!foundation.includes(signal)) failures.push(`foundation audit expectation changed: missing known metacognitive signal ${signal}`)
}
warnings.push('foundation question generator is intentionally classified as metacognitive/self-check content, not a textbook subject question bank')

if (!player.includes('getUnitAuditSnapshot')) failures.push('active paged player must render v10 curriculum audit status directly')
if (!player.includes('getCurriculumUnitContent')) failures.push('active paged player must distinguish available content from strict reviewed content')
if (!player.includes('isReviewedUnit')) failures.push('active paged player must use strict human-review status')
const explicitQuestionBankWarnings = [
  '非正式題庫',
  '非教科書級題庫',
  '不能當作正式教科書題庫',
  '不能計入正式教科書題庫',
]
if (!explicitQuestionBankWarnings.some((phrase) => player.includes(phrase))) {
  failures.push('foundation content must visibly warn that generic checks are not a formal textbook question bank')
}

if (!activeExport.includes("from './CurriculumCourseAppV8'")) failures.push('active export must use stable v8 visual layer directly; v9 DOM status observer should be retired after v10 status is rendered in V5')
if (activeExport.includes('CurriculumCourseAppV9')) failures.push('active export must not route through the old v9 status MutationObserver')

if (failures.length) {
  console.error('[textbook-audit] FAILED')
  for (const failure of failures) console.error(`- ${failure}`)
  for (const warning of warnings) console.warn(`! ${warning}`)
  process.exit(1)
}

console.log('[textbook-audit] structural and quality-label gates passed')
console.log(`[textbook-audit] grade 7 math supplement: 9 units, ${math7QuestionCount} extra subject questions, ${math7MisconceptionCount} misconception concepts`)
console.log(`[textbook-audit] grade 7 science supplement: 6 units, ${science7QuestionCount} extra subject questions, ${science7MisconceptionCount} misconception concepts`)
for (const warning of warnings) console.log(`[textbook-audit] NOTE: ${warning}`)
console.log('[textbook-audit] textbook-ready units: 0 (intentional until full per-unit promotion gates are met)')
