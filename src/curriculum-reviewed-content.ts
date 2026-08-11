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

function stableHash(value: string) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0
  return Math.abs(hash)
}

function sanitizeReviewedUnit(unit: ReviewedUnitContent | null): ReviewedUnitContent | null {
  if (!unit) return null
  return {
    ...unit,
    questions: unit.questions.map((question) => {
      if (question.kind !== 'choice') return question
      const cleaned = question.options.map((option) => option.replace(/\s*בלבד/g, '').trim())
      if (cleaned.length < 2) return { ...question, options: cleaned }

      // 編輯檔可以把正解放在方便校對的位置；正式畫面依題目 ID 固定旋轉選項。
      // 同一題重開順序一致，但整份題庫不會形成「一直選 A」的答案模式。
      const shift = stableHash(question.id) % cleaned.length
      const options = [...cleaned.slice(shift), ...cleaned.slice(0, shift)]
      const correctIndex = (question.correctIndex - shift + cleaned.length) % cleaned.length
      return { ...question, options, correctIndex }
    }),
  }
}

export function getReviewedUnitContent(unitId: string) {
  const raw = getSocial10UnitContent(unitId)
    ?? getReviewedMath7UnitContentV2(unitId)
    ?? getReviewedScience7UnitContent(unitId)
  return sanitizeReviewedUnit(raw)
}

export function isReviewedUnit(unitId: string) {
  return Boolean(getReviewedUnitContent(unitId))
}
