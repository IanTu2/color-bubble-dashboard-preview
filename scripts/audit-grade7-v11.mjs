import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const failures = []

const subjects = [
  { key: 'chinese', scope: 'src/curriculum-official-scope-chinese7.ts', supplement: 'src/curriculum-textbook-supplement-chinese7.ts', minMisconceptions: 12 },
  { key: 'english', scope: 'src/curriculum-official-scope-english7.ts', supplement: 'src/curriculum-textbook-supplement-english7.ts', minMisconceptions: 12 },
  { key: 'social', scope: 'src/curriculum-official-scope-social7.ts', supplement: 'src/curriculum-textbook-supplement-social7.ts', minMisconceptions: 15 },
]

const aggregator = read('src/curriculum-reviewed-content.ts')
const registry = read('src/curriculum-audit-registry.ts')
const inventory = read('scripts/report-curriculum-audit.mjs')

for (const subject of subjects) {
  const scope = read(subject.scope)
  const supplement = read(subject.supplement)
  const scopeUnitIds = new Set([...scope.matchAll(/unitId:\s*'([^']+)'/g)].map((match) => match[1]))
  const supplementUnitIds = new Set([...supplement.matchAll(/(?:supplement\()?['"]?(g7-[a-z]+-s[12]-u\d+)['"]?/g)].map((match) => match[1]))

  if (scopeUnitIds.size !== 6) failures.push(`${subject.key}: official scope mapping should cover 6 units, found ${scopeUnitIds.size}`)
  for (const unitId of scopeUnitIds) {
    if (!supplement.includes(unitId)) failures.push(`${subject.key}: supplement missing ${unitId}`)
  }

  const questionCount = (supplement.match(/supp-q\d+/g) ?? []).length
  const exampleCount = (supplement.match(/title:\s*['"][^'"]+['"],?\s*\n?\s*context:/g) ?? []).length
  const misconceptionCount = (supplement.match(/(?:常見迷思|Common mistake)｜/g) ?? []).length
  if (questionCount < 24) failures.push(`${subject.key}: supplement questions ${questionCount} < 24`)
  if (exampleCount < 6) failures.push(`${subject.key}: worked examples ${exampleCount} < 6`)
  if (misconceptionCount < subject.minMisconceptions) failures.push(`${subject.key}: misconception concepts ${misconceptionCount} < ${subject.minMisconceptions}`)

  const missingMaterial = ['根據下圖', '觀察下圖', '依下圖', '如圖所示', '看到一張統計圖後']
  for (const phrase of missingMaterial) if (supplement.includes(phrase)) failures.push(`${subject.key}: supplement contains missing-material wording ${phrase}`)

  const getterName = `${subject.key[0].toUpperCase()}${subject.key.slice(1)}7TextbookSupplement`
  if (!aggregator.includes(getterName)) failures.push(`${subject.key}: supplement is not wired into reviewed-content aggregator`)
}

const english = read('src/curriculum-textbook-supplement-english7.ts')
if (english.includes("as 'choice'")) failures.push('english: source must not rely on a kind type assertion')
if (!english.includes('ROBOT CLUB OPEN DAY') || !english.includes('weekly schedule') && !english.includes('weekly')) failures.push('english: communication materials must include notice/table-like contexts')

const chinese = read('src/curriculum-textbook-supplement-chinese7.ts')
for (const expected of ['自寫短文', '自寫小詩', '自寫仿古短文']) {
  if (!chinese.includes(expected)) failures.push(`chinese: missing self-authored-text marker ${expected}`)
}

const social = read('src/curriculum-textbook-supplement-social7.ts')
for (const expected of ['田野觀察', '史料', '公共']) {
  if (!social.includes(expected)) failures.push(`social: expected data/source/civic task marker missing: ${expected}`)
}

for (const scopeFile of ['CHINESE7_STAGE_IV_SCOPE', 'ENGLISH7_STAGE_IV_SCOPE', 'SOCIAL7_SCOPE']) {
  if (!registry.includes(scopeFile)) failures.push(`audit registry missing ${scopeFile}`)
}
if (!inventory.includes('const scopeVerifiedUnits = 9 + 6 + 6 + 6 + 6')) failures.push('inventory must record all 33 grade-7 scope-verified units')
if (!inventory.includes('const legacyReviewedUnits = 0')) failures.push('all grade-7 legacy-reviewed units should move to scope-verified in v11')

if (failures.length) {
  console.error('[grade7-v11-audit] FAILED')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('[grade7-v11-audit] Chinese / English / social scope + depth gates passed')
console.log('[grade7-v11-audit] all five grade-7 subjects are now scope-verified, not textbook-ready')
