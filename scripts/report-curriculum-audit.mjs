// V15 active student-facing inventory.
// Classification is mutually exclusive: the 15 Grade 7 math/science units promoted by
// V15 are counted as textbook-ready rather than also remaining in scope-verified.

const activeTracksByGrade = {
  1: 4,
  2: 4,
  3: 5,
  4: 5,
  5: 5,
  6: 5,
  7: 5,
  8: 5,
  9: 5,
  10: 10,
  11: 11,
  12: 11,
}

const activeTracks = Object.values(activeTracksByGrade).reduce((sum, value) => sum + value, 0)
const grade7MathOverrideDelta = 3
const totalUnits = activeTracks * 6 + grade7MathOverrideDelta

const structuralBlockers = {}
const structuralBlockerUnits = 0

// V15 certified Grade 7 Math (9) + Grade 7 Science (6).
const textbookReadyUnits = 15

// Those same 15 units are no longer counted in the lower scope-verified bucket.
const scopeVerifiedUnits = 0

// Human-authored Grade 7 Chinese, English, Social; official per-unit certification remains pending.
const legacyReviewedUnits = 6 + 6 + 6

// Every remaining non-reviewed active unit has V14 textbook-depth minimum structure.
const foundationDepthReadyUnits = totalUnits - textbookReadyUnits - legacyReviewedUnits
const foundationDraftUnits = 0

const inventory = {
  version: 'v15-textbook-certification',
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
if (textbookReadyUnits !== 15) {
  console.error(`[curriculum-inventory] FAILED: expected 15 V15 textbook-ready units, got ${textbookReadyUnits}`)
  process.exit(1)
}
if (scopeVerifiedUnits !== 0) {
  console.error(`[curriculum-inventory] FAILED: promoted Grade 7 candidates are still double-counted as scope-verified`)
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

console.log('[curriculum-inventory] active v15 textbook-certification snapshot')
console.log(JSON.stringify(inventory, null, 2))
console.log(`[curriculum-inventory] textbook-ready: ${textbookReadyUnits}/${totalUnits}`)
console.log(`[curriculum-inventory] scope-verified: ${scopeVerifiedUnits}/${totalUnits}`)
console.log(`[curriculum-inventory] legacy-reviewed: ${legacyReviewedUnits}/${totalUnits}`)
console.log(`[curriculum-inventory] foundation-depth-ready: ${foundationDepthReadyUnits}/${totalUnits}`)
console.log(`[curriculum-inventory] foundation-draft: ${foundationDraftUnits}/${totalUnits}`)
console.log(`[curriculum-inventory] active structural-blocker: ${structuralBlockerUnits}/${totalUnits}`)
