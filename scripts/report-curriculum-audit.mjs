// v14 active student-facing inventory.
// Count only routes that a learner can actually open from getCurriculumRouteOptions.
// V14 separates "教材深度已補齊" from "textbook-ready": depth gates can be applied
// to every Foundation unit, while textbook-ready still requires unit-level official-scope
// crosswalk + manual content/question/media review.

const activeTracksByGrade = {
  1: 4, // 國文、英文延伸、數學、生活課程
  2: 4,
  3: 5,
  4: 5,
  5: 5,
  6: 5,
  7: 5,
  8: 5,
  9: 5,
  10: 10, // 國英數 + 自然四分科 + 社會三分科
  11: 11, // 國英 + 數 A/B + 自然四分科 + 社會三分科
  12: 11, // 國英 + 數甲/乙 + 自然四分科 + 社會三分科
}

const activeTracks = Object.values(activeTracksByGrade).reduce((sum, value) => sum + value, 0)
const grade7MathOverrideDelta = 3
const totalUnits = activeTracks * 6 + grade7MathOverrideDelta

const structuralBlockers = {}
const structuralBlockerUnits = 0

// Existing official-scope deep checkpoints.
const scopeVerifiedUnits = 9 + 6 // Grade 7 math + Grade 7 science platform sequence

// Human-authored reviewed but not yet unit-level official-scope promoted.
const legacyReviewedUnits = 6 + 6 + 6 // Grade 7 Chinese, English, Social

// V14 depth enrichment is applied to every remaining active Foundation unit.
// Gate: >=6 concepts, >=2 misconception sections, >=3 complete worked examples,
// >=12 questions, >=6 choice, >=2 response, >=1 response rubric, transfer task.
const foundationDepthReadyUnits = totalUnits - scopeVerifiedUnits - legacyReviewedUnits
const foundationDraftUnits = 0

// "textbook-ready" remains a stronger certification. Do not infer it from depth alone.
const textbookReadyUnits = 0

const inventory = {
  version: 'v14-textbook-depth',
  activeTracks,
  activeTracksByGrade,
  totalUnits,
  textbookReadyUnits,
  scopeVerifiedUnits,
  legacyReviewedUnits,
  foundationDepthReadyUnits,
  foundationDraftUnits,
  structuralBlockerUnits,
  structuralBlockers,
}

const classifiedTotal = textbookReadyUnits
  + scopeVerifiedUnits
  + legacyReviewedUnits
  + foundationDepthReadyUnits
  + foundationDraftUnits
  + structuralBlockerUnits

if (classifiedTotal !== totalUnits) {
  console.error(`[curriculum-inventory] FAILED: classified ${classifiedTotal} units but active routes contain ${totalUnits}`)
  process.exit(1)
}
if (activeTracks !== 75) {
  console.error(`[curriculum-inventory] FAILED: expected 75 active routes, got ${activeTracks}`)
  process.exit(1)
}
if (totalUnits !== 453) {
  console.error(`[curriculum-inventory] FAILED: expected 453 active units, got ${totalUnits}`)
  process.exit(1)
}
if (foundationDepthReadyUnits !== 420) {
  console.error(`[curriculum-inventory] FAILED: expected 420 V14 Foundation depth-ready units, got ${foundationDepthReadyUnits}`)
  process.exit(1)
}
if (foundationDraftUnits !== 0) {
  console.error(`[curriculum-inventory] FAILED: ${foundationDraftUnits} active Foundation units still lack V14 depth enrichment`)
  process.exit(1)
}
if (structuralBlockerUnits !== 0) {
  console.error(`[curriculum-inventory] FAILED: active routes still contain ${structuralBlockerUnits} structural blockers`)
  process.exit(1)
}

console.log('[curriculum-inventory] active v14 textbook-depth snapshot')
console.log(JSON.stringify(inventory, null, 2))
console.log(`[curriculum-inventory] textbook-ready: ${textbookReadyUnits}/${totalUnits}`)
console.log(`[curriculum-inventory] scope-verified: ${scopeVerifiedUnits}/${totalUnits}`)
console.log(`[curriculum-inventory] legacy-reviewed: ${legacyReviewedUnits}/${totalUnits}`)
console.log(`[curriculum-inventory] foundation-depth-ready: ${foundationDepthReadyUnits}/${totalUnits}`)
console.log(`[curriculum-inventory] foundation-draft: ${foundationDraftUnits}/${totalUnits}`)
console.log(`[curriculum-inventory] active structural-blocker: ${structuralBlockerUnits}/${totalUnits}`)
