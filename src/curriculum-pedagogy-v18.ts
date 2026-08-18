import {
  inspectTextbookUnitV18 as inspectLegacyV18,
  getTextbookUnitContentV18 as getLegacyV18,
  getConceptChecksV18 as getLegacyConceptChecksV18,
} from './curriculum-pedagogy-v18-final'
import { getCachedTextbookUnitContentV20Pass1 } from './curriculum-textbook-v20-pass1'
import type { TextbookUnitContentV14 } from './curriculum-textbook-v14'

// V20 is now the learner-facing editorial layer. The recursion guard is deliberate:
// V20 rebuilds from the validated V18 baseline, so its internal request for V18 must
// resolve to the legacy validated unit rather than recursively re-entering V20.
// Static QA trace: curriculum-textbook-v20-pass1 wraps getTextbookUnitContentV20.
const resolvingV20 = new Set<string>()

export function getTextbookUnitContentV18(unitId: string) {
  if (resolvingV20.has(unitId)) return getLegacyV18(unitId)
  resolvingV20.add(unitId)
  try {
    return getCachedTextbookUnitContentV20Pass1(unitId)
  } finally {
    resolvingV20.delete(unitId)
  }
}

// Keep the historic V18 inspector available for V14–V18 regression gates.
// V20 readiness is audited separately and never inferred from this result.
export const inspectTextbookUnitV18 = inspectLegacyV18

export function getConceptChecksV18(unit: TextbookUnitContentV14) {
  return getLegacyConceptChecksV18(unit)
}

export { isMetaLearnerPromptV18 } from './curriculum-pedagogy-v18-base'
