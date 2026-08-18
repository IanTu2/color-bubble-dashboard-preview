import {
  inspectTextbookUnitV18 as inspectLegacyV18,
  getTextbookUnitContentV18 as getLegacyV18,
  getConceptChecksV18 as getLegacyConceptChecksV18,
} from './curriculum-pedagogy-v18-final'
import { getCachedTextbookUnitContentV20Published } from './curriculum-textbook-v20-published'
import type { TextbookUnitContentV14 } from './curriculum-textbook-v14'

// V20 is now the learner-facing publication-clean editorial layer. The recursion guard
// keeps the V20 rebuild anchored to the validated legacy V18 source without re-entering itself.
const resolvingV20 = new Set<string>()

export function getTextbookUnitContentV18(unitId: string) {
  if (resolvingV20.has(unitId)) return getLegacyV18(unitId)
  resolvingV20.add(unitId)
  try {
    return getCachedTextbookUnitContentV20Published(unitId)
  } finally {
    resolvingV20.delete(unitId)
  }
}

// Compatibility export: V20 tooling receives the exact publication-clean content used
// by the active learner reader.
export { getTextbookUnitContentV20Published as getTextbookUnitContentV20 } from './curriculum-textbook-v20-published'

export const inspectTextbookUnitV18 = inspectLegacyV18

export function getConceptChecksV18(unit: TextbookUnitContentV14) {
  return getLegacyConceptChecksV18(unit)
}

export { isMetaLearnerPromptV18 } from './curriculum-pedagogy-v18-base'
