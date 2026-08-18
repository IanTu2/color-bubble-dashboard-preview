export type CurriculumV20ReviewStatus =
  | 'v20-reviewing'
  | 'v20-internal-ready'
  | 'v20-human-verified'

/**
 * V20 intentionally uses explicit allow-lists.
 *
 * A unit may be added to V20_INTERNAL_READY_UNITS only after its V20 review record proves:
 * - P0 = 0 and P1 = 0;
 * - all eight V20 dimensions >= 3 and weighted score >= 90/100;
 * - official curriculum mapping evidence is recorded;
 * - prerequisites are traced with source/check/bridge;
 * - every objective question has been blind-solved/verified;
 * - every open-response rubric has been reviewed;
 * - visuals, difficulty and publication copyediting have been reviewed;
 * - desktop and mobile student walkthroughs are complete.
 *
 * Automated V14–V19 gates must never add units here.
 */
export const V20_INTERNAL_READY_UNITS = new Set<string>([])

/**
 * Human-verified is a separate, stricter state. It requires an independent
 * subject/editorial review after internal-ready. It is not official government approval.
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
