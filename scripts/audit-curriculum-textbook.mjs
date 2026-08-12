import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const failures = []
const warnings = []

const registry = read('src/curriculum-audit-registry.ts')
const scope7 = read('src/curriculum-official-scope-math7.ts')
const supplement7 = read('src/curriculum-textbook-supplement-math7.ts')
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
  if (!scope7.includes(`'${code}'`)) failures.push(`grade 7 math official scope mapping missing ${code}`)
}

const math7UnitIds = [...scope7.matchAll(/unitId:\s*'([^']+)'/g)].map((match) => match[1])
const uniqueMath7UnitIds = new Set(math7UnitIds)
if (uniqueMath7UnitIds.size !== 9) failures.push(`grade 7 math official scope should map 9 units, found ${uniqueMath7UnitIds.size}`)

for (const unitId of uniqueMath7UnitIds) {
  if (!supplement7.includes(`unitId: '${unitId}'`)) failures.push(`grade 7 math textbook supplement missing ${unitId}`)
}
const supplementalQuestionCount = (supplement7.match(/supp-q\d+/g) ?? []).length
const supplementalExampleCount = (supplement7.match(/workedExamples:\s*\[/g) ?? []).length
const misconceptionCount = (supplement7.match(/title:\s*'常見迷思/g) ?? []).length
if (supplementalQuestionCount < 36) failures.push(`grade 7 math supplement questions ${supplementalQuestionCount} < 36`)
if (supplementalExampleCount < 9) failures.push(`grade 7 math supplement worked examples ${supplementalExampleCount < 9 ? supplementalExampleCount : 9} < 9`)
if (misconceptionCount < 18) failures.push(`grade 7 math misconception concepts ${misconceptionCount} < 18`)
if (!aggregator.includes('getMath7TextbookSupplement')) failures.push('grade 7 math textbook supplement is not wired into reviewed content')

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
console.log(`[textbook-audit] grade 7 math supplement: 9 units, ${supplementalQuestionCount} extra subject questions, ${misconceptionCount} misconception concepts`)
for (const warning of warnings) console.log(`[textbook-audit] NOTE: ${warning}`)
console.log('[textbook-audit] textbook-ready units: 0 (intentional until full per-unit promotion gates are met)')
