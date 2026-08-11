export type {
  ReviewedChoiceQuestion,
  ReviewedResponseQuestion,
  ReviewedQuestion,
  ReviewedConcept,
  ReviewedWorkedExample,
  ReviewedUnitContent,
} from './curriculum-reviewed-social10'

import { getReviewedUnitContent as getSocial10UnitContent } from './curriculum-reviewed-social10'
import { getReviewedMath7UnitContent } from './curriculum-reviewed-math7'
import { getReviewedScience7UnitContent } from './curriculum-reviewed-science7'

export function getReviewedUnitContent(unitId: string) {
  return getSocial10UnitContent(unitId)
    ?? getReviewedMath7UnitContent(unitId)
    ?? getReviewedScience7UnitContent(unitId)
}

export function isReviewedUnit(unitId: string) {
  return Boolean(getReviewedUnitContent(unitId))
}
