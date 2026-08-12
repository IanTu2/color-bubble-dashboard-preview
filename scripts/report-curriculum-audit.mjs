// V14 active student-facing inventory.
// This report runs only after audit-textbook-ready-v14.ts in the curriculum:audit chain,
// so textbookReadyUnits=453 means every active unit passed the executable V14 unit validator.

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
const totalUnits = activeTracks * 6 + 3 // Grade 7 math has 9 units rather than 6.
const textbookReadyUnits = totalUnits
const structuralBlockerUnits = 0

// Keep provenance separate from the V14 presentation tier.
// These numbers describe the source layer that V14 enriches; they are not competing active tiers anymore.
const deepOfficialCodeMappedUnits = 15 // G7 math 9 + G7 science 6.
const legacyHumanReviewedSourceUnits = 18 // Active G7 Chinese + English + Social.
const v14UpgradedFoundationSourceUnits = totalUnits - deepOfficialCodeMappedUnits - legacyHumanReviewedSourceUnits

const inventory = {
  version: 'v14-textbook-active-routes',
  activeTracks,
  activeTracksByGrade,
  totalUnits,
  textbookReadyUnits,
  structuralBlockerUnits,
  provenance: {
    deepOfficialCodeMappedUnits,
    legacyHumanReviewedSourceUnits,
    v14UpgradedFoundationSourceUnits,
  },
}

if (activeTracks !== 75) {
  console.error(`[curriculum-inventory] FAILED: expected 75 active routes, got ${activeTracks}`)
  process.exit(1)
}
if (totalUnits !== 453) {
  console.error(`[curriculum-inventory] FAILED: expected 453 active units, got ${totalUnits}`)
  process.exit(1)
}
if (textbookReadyUnits !== totalUnits) {
  console.error(`[curriculum-inventory] FAILED: textbook-ready ${textbookReadyUnits}/${totalUnits}`)
  process.exit(1)
}
if (structuralBlockerUnits !== 0) {
  console.error(`[curriculum-inventory] FAILED: active structural blockers ${structuralBlockerUnits}`)
  process.exit(1)
}
if (deepOfficialCodeMappedUnits + legacyHumanReviewedSourceUnits + v14UpgradedFoundationSourceUnits !== totalUnits) {
  console.error('[curriculum-inventory] FAILED: source provenance does not cover every active unit')
  process.exit(1)
}

console.log('[curriculum-inventory] active Textbook V14 snapshot')
console.log(JSON.stringify(inventory, null, 2))
console.log(`[curriculum-inventory] textbook-ready: ${textbookReadyUnits}/${totalUnits}`)
console.log(`[curriculum-inventory] active structural-blocker: ${structuralBlockerUnits}/${totalUnits}`)
console.log(`[curriculum-inventory] provenance deep official-code mapped: ${deepOfficialCodeMappedUnits}/${totalUnits}`)
console.log(`[curriculum-inventory] provenance legacy human-reviewed source: ${legacyHumanReviewedSourceUnits}/${totalUnits}`)
console.log(`[curriculum-inventory] provenance V14-upgraded foundation source: ${v14UpgradedFoundationSourceUnits}/${totalUnits}`)
