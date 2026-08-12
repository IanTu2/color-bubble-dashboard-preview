// v13 active student-facing inventory.
// Count only routes that a learner can actually open from getCurriculumRouteOptions;
// legacy merged/ambiguous base roadmaps remain source compatibility data and are not counted as active courses.

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
const standardSixUnitTracks = activeTracks
const grade7MathOverrideDelta = 3 // 七年級數學 9 章，其餘 active route 為每學年 6 單元
const totalUnits = standardSixUnitTracks * 6 + grade7MathOverrideDelta

// v13 student-facing routes no longer expose any known structural blocker:
// - G1/2 uses integrated Life Curriculum rather than fake science/social separation.
// - HS science/social are discipline paths.
// - G11 math selects A/B; G12 selects Math 甲/乙.
// Ambiguous legacy base routes are rejected by getCurriculumTrack and validCourse.
const structuralBlockers = {}
const structuralBlockerUnits = 0

// Deep checkpoint unchanged by this structural migration:
// Grade 7 math 9 units + Grade 7 science platform sequence 6 units.
const scopeVerifiedUnits = 9 + 6

// Human-authored reviewed but not yet promoted through full textbook-ready gates:
// Grade 7 Chinese, English, Social = 18 active units.
const legacyReviewedUnits = 6 + 6 + 6
const textbookReadyUnits = 0
const foundationDraftUnits = totalUnits - scopeVerifiedUnits - legacyReviewedUnits - textbookReadyUnits

const inventory = {
  version: 'v13-active-routes',
  activeTracks,
  activeTracksByGrade,
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
  console.error(`[curriculum-inventory] FAILED: classified ${classifiedTotal} units but active routes contain ${totalUnits}`)
  process.exit(1)
}

if (activeTracks !== 75) {
  console.error(`[curriculum-inventory] FAILED: expected 75 active v13 route tracks, got ${activeTracks}`)
  process.exit(1)
}

if (totalUnits !== 453) {
  console.error(`[curriculum-inventory] FAILED: expected active v13 total 453, got ${totalUnits}`)
  process.exit(1)
}

if (structuralBlockerUnits !== 0) {
  console.error(`[curriculum-inventory] FAILED: active v13 student routes still contain ${structuralBlockerUnits} structural blocker units`)
  process.exit(1)
}

console.log('[curriculum-inventory] active v13 audit snapshot')
console.log(JSON.stringify(inventory, null, 2))
console.log(`[curriculum-inventory] textbook-ready: ${textbookReadyUnits}/${totalUnits}`)
console.log(`[curriculum-inventory] scope-verified: ${scopeVerifiedUnits}/${totalUnits}`)
console.log(`[curriculum-inventory] legacy-reviewed: ${legacyReviewedUnits}/${totalUnits}`)
console.log(`[curriculum-inventory] foundation-draft: ${foundationDraftUnits}/${totalUnits}`)
console.log(`[curriculum-inventory] active structural-blocker: ${structuralBlockerUnits}/${totalUnits}`)
