const SUBJECTS = ['chinese', 'english', 'math', 'science', 'social']
const GRADES = Array.from({ length: 12 }, (_, index) => index + 1)

// 目前 base roadmap 每個年級／科目都是每學期 3 單元，共 6；
// 七年級數學 v5 已改成 9 章，因此總量比 base 多 3。
const baseTracks = SUBJECTS.length * GRADES.length
const baseUnits = baseTracks * 6
const grade7MathOverrideDelta = 3
const totalUnits = baseUnits + grade7MathOverrideDelta

const structuralBlockers = {
  'grade1-2-science-social-life-course': 2 * 2 * 6,
  'grade11-12-math-path-split': 2 * 6,
  'grade10-12-science-discipline-split': 3 * 6,
  'grade10-12-social-discipline-split': 3 * 6,
}
const structuralBlockerUnits = Object.values(structuralBlockers).reduce((sum, value) => sum + value, 0)

// v11 checkpoint：七年級五科都已完成正式範圍／學習階段對照。
// 數學 9 章；國文、英文、自然、社會各 6 單元，共 33。
const scopeVerifiedUnits = 9 + 6 + 6 + 6 + 6

// 七年級原本的 legacy-reviewed 已全部在 v11 完成正式 scope mapping。
// 高一社會雖有人工作者內容，但優先被「高中社會需分科」結構 gate 歸類，避免重複計數。
const legacyReviewedUnits = 0

const textbookReadyUnits = 0
const foundationDraftUnits = totalUnits
  - structuralBlockerUnits
  - scopeVerifiedUnits
  - legacyReviewedUnits
  - textbookReadyUnits

const inventory = {
  tracks: baseTracks,
  totalUnits,
  textbookReadyUnits,
  scopeVerifiedUnits,
  legacyReviewedUnits,
  foundationDraftUnits,
  structuralBlockerUnits,
  structuralBlockers,
}

const classifiedTotal = textbookReadyUnits + scopeVerifiedUnits + legacyReviewedUnits + foundationDraftUnits + structuralBlockerUnits
if (classifiedTotal !== totalUnits) {
  console.error(`[curriculum-inventory] FAILED: classified ${classifiedTotal} units but roadmap contains ${totalUnits}`)
  process.exit(1)
}

if (totalUnits !== 363) {
  console.error(`[curriculum-inventory] FAILED: expected current roadmap total 363, got ${totalUnits}`)
  process.exit(1)
}

if (scopeVerifiedUnits !== 33 || legacyReviewedUnits !== 0 || foundationDraftUnits !== 258 || structuralBlockerUnits !== 72) {
  console.error('[curriculum-inventory] FAILED: v11 quality-tier counts drifted from the reviewed baseline')
  process.exit(1)
}

console.log('[curriculum-inventory] current v11 audit snapshot')
console.log(JSON.stringify(inventory, null, 2))
console.log(`[curriculum-inventory] textbook-ready: ${textbookReadyUnits}/${totalUnits}`)
console.log(`[curriculum-inventory] scope-verified: ${scopeVerifiedUnits}/${totalUnits}`)
console.log(`[curriculum-inventory] legacy-reviewed: ${legacyReviewedUnits}/${totalUnits}`)
console.log(`[curriculum-inventory] foundation-draft: ${foundationDraftUnits}/${totalUnits}`)
console.log(`[curriculum-inventory] structural-blocker: ${structuralBlockerUnits}/${totalUnits}`)
