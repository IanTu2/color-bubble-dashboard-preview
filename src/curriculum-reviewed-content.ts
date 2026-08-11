export type {
  ReviewedChoiceQuestion,
  ReviewedResponseQuestion,
  ReviewedQuestion,
  ReviewedConcept,
  ReviewedWorkedExample,
  ReviewedUnitContent,
} from './curriculum-reviewed-social10'

import { getReviewedUnitContent as getSocial10UnitContent } from './curriculum-reviewed-social10'
import { getReviewedMath7UnitContentV2 } from './curriculum-reviewed-math7-v2'
import { getReviewedScience7UnitContent } from './curriculum-reviewed-science7'
import type { ReviewedUnitContent } from './curriculum-reviewed-social10'

function sanitizeReviewedUnit(unit: ReviewedUnitContent | null): ReviewedUnitContent | null {
  if (!unit) return null
  return {
    ...unit,
    questions: unit.questions.map((question) => question.kind === 'choice'
      ? {
          ...question,
          options: question.options.map((option) => option.replace(/\s*בלבד/g, '').trim()),
        }
      : question),
  }
}

export function getReviewedUnitContent(unitId: string) {
  return getSocial10UnitContent(unitId)
    ?? getReviewedMath7UnitContentV2(unitId)
    ?? sanitizeReviewedUnit(getReviewedScience7UnitContent(unitId))
}

export function isReviewedUnit(unitId: string) {
  return Boolean(getReviewedUnitContent(unitId))
}
