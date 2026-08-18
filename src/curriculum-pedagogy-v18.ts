import {
  inspectTextbookUnitV18 as inspectLegacyV18,
  getTextbookUnitContentV18 as getLegacyV18,
  getConceptChecksV18 as getLegacyConceptChecksV18,
} from './curriculum-pedagogy-v18-final'
import { getCachedTextbookUnitContentV20Editorial } from './curriculum-textbook-v20-editorial'
import type { TextbookUnitContentV14 } from './curriculum-textbook-v14'

// V20 is now the learner-facing editorial layer. The recursion guard is deliberate:
// V20 editorial rebuilds from the validated V18 baseline, so its internal request for V18
// must resolve to the legacy validated unit rather than recursively re-entering V20.
const resolvingV20 = new Set<string>()

export function getTextbookUnitContentV18(unitId: string) {
  if (resolvingV20.has(unitId)) return getLegacyV18(unitId)
  resolvingV20.add(unitId)
  try {
    return getCachedTextbookUnitContentV20Editorial(unitId)
  } finally {
    resolvingV20.delete(unitId)
  }
}

// Compatibility export: older V20 tooling can keep this name while receiving the
// same fully rebuilt editorial content that the active learner reader receives.
export { getTextbookUnitContentV20Editorial as getTextbookUnitContentV20 } from './curriculum-textbook-v20-editorial'

// Keep the historic V18 inspector available for V14–V18 regression gates.
export const inspectTextbookUnitV18 = inspectLegacyV18

export function getConceptChecksV18(unit: TextbookUnitContentV14) {
  return getLegacyConceptChecksV18(unit)
}

export { isMetaLearnerPromptV18 } from './curriculum-pedagogy-v18-base'
