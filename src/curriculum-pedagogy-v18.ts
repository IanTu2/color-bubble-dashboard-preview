import {
  inspectTextbookUnitV18 as inspectLegacyV18,
  getTextbookUnitContentV18 as getLegacyV18,
  getConceptChecksV18 as getLegacyConceptChecksV18,
} from './curriculum-pedagogy-v18-final'
import { getCachedTextbookUnitContentV20Reviewed } from './curriculum-textbook-v20-reviewed'
import type { TextbookUnitContentV14 } from './curriculum-textbook-v14'

// V20 is now the learner-facing reviewed editorial layer. The recursion guard keeps
// the rebuild anchored to the validated legacy V18 source without re-entering itself.
const resolvingV20 = new Set<string>()

export function getTextbookUnitContentV18(unitId: string) {
  if (resolvingV20.has(unitId)) return getLegacyV18(unitId)
  resolvingV20.add(unitId)
  try {
    return getCachedTextbookUnitContentV20Reviewed(unitId)
  } finally {
    resolvingV20.delete(unitId)
  }
}

export { getTextbookUnitContentV20Reviewed as getTextbookUnitContentV20 } from './curriculum-textbook-v20-reviewed'
export const inspectTextbookUnitV18 = inspectLegacyV18

export function getConceptChecksV18(unit: TextbookUnitContentV14) {
  return getLegacyConceptChecksV18(unit)
}

export { isMetaLearnerPromptV18 } from './curriculum-pedagogy-v18-base'
