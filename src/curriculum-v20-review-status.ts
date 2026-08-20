import { getCurriculumRouteOptions, getCurriculumTrack } from './curriculum-plan-v5'

export type CurriculumV20ReviewStatus =
  | 'v20-reviewing'
  | 'v20-internal-ready'
  | 'v20-human-verified'

export const V20_INTERNAL_REVIEW_CERTIFICATION = {
  certifiedAt: '2026-08-20',
  scope: '453 active curriculum units at the frozen V20 route snapshot',
  p0: 0,
  p1: 0,
  dimensionScores: {
    contentCorrectness: 4,
    curriculumAlignment: 3,
    prerequisitesAndContinuity: 4,
    visualExpression: 4,
    workedExamples: 4,
    questionQuality: 4,
    difficultyAndCognitiveLoad: 3,
    copyeditingConventionsAndSources: 4,
  },
  weightedScore: 93.75,
  evidence: {
    semanticAlignment: '453/453 title/pathway/subject semantic families pass',
    learnerOutput: '453/453 final learner units pass publication, feedback, prerequisite, source, diversity and exact-reuse gates',
    answerConsistency: '1305/1305 math questions independently parsed/recomputed; 5598/5598 non-math answers explicitly traceable',
    scopeMapping: '441 official-source-linked units plus 12 explicitly labelled low-grade English platform extensions',
    walkthrough: '453-unit synthetic student traversal plus V18/V19 responsive UX gates and GitHub Pages artifact verification',
  },
  limitations: [
    'Internal-ready is a Bubble Space project status, not National Academy for Educational Research textbook approval.',
    'The 12 Grade 1-2 English units remain platform extensions and are not represented as nationally fixed grade-level textbook scope.',
    'Independent human subject/editorial review is required before v20-human-verified.',
  ],
} as const

const CERTIFIED_ACTIVE_UNIT_COUNT = 453
const CERTIFIED_ACTIVE_UNIT_FINGERPRINT = '7ef1719a'

function stableFingerprint(value: string) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

function activeCurriculumUnitIds() {
  const ids: string[] = []
  for (let grade = 1; grade <= 12; grade += 1) {
    for (const route of getCurriculumRouteOptions(grade)) {
      const track = getCurriculumTrack(grade, route.subject, route.pathway)
      if (!track) continue
      for (const semester of track.semesters) {
        for (const unit of semester.units) ids.push(unit.id)
      }
    }
  }
  return [...new Set(ids)].sort()
}

const activeIds = activeCurriculumUnitIds()
const activeFingerprint = stableFingerprint(activeIds.join('|'))
const frozenSnapshotMatches =
  activeIds.length === CERTIFIED_ACTIVE_UNIT_COUNT &&
  activeFingerprint === CERTIFIED_ACTIVE_UNIT_FINGERPRINT

/**
 * V20 internal-ready is frozen to the exact 453-unit route snapshot certified on 2026-08-20.
 * If any active unit ID is added, removed or renamed, the fingerprint changes and this set
 * becomes empty until the complete V20 review is rerun and a new snapshot is certified.
 *
 * This promotion follows the V20 internal editorial gates. It is deliberately separate from
 * human-verified and from any official government/publisher textbook approval.
 */
export const V20_INTERNAL_READY_UNITS = new Set<string>(frozenSnapshotMatches ? activeIds : [])

/**
 * Human-verified requires an independent subject/editorial review after internal-ready.
 * No unit is promoted here by automation or by this internal V20 pass.
 */
export const V20_HUMAN_VERIFIED_UNITS = new Set<string>([])

export function getCurriculumV20ReviewStatus(unitId: string): CurriculumV20ReviewStatus {
  if (V20_HUMAN_VERIFIED_UNITS.has(unitId)) return 'v20-human-verified'
  if (V20_INTERNAL_READY_UNITS.has(unitId)) return 'v20-internal-ready'
  return 'v20-reviewing'
}

export function isCurriculumV20InternalReady(unitId: string) {
  return V20_INTERNAL_READY_UNITS.has(unitId)
}

export function isCurriculumV20HumanVerified(unitId: string) {
  return V20_HUMAN_VERIFIED_UNITS.has(unitId)
}
