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
import { getReviewedChinese7UnitContent } from './curriculum-reviewed-chinese7'
import { getReviewedEnglish7UnitContent } from './curriculum-reviewed-english7'
import { getReviewedSocial7UnitContent } from './curriculum-reviewed-social7'
import type {
  ReviewedChoiceQuestion,
  ReviewedQuestion,
  ReviewedUnitContent,
} from './curriculum-reviewed-social10'

function stableHash(value: string) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0
  return Math.abs(hash)
}

function normalizeChoiceQuestion(question: ReviewedQuestion | Record<string, unknown>): ReviewedChoiceQuestion | null {
  const options = Array.isArray((question as { options?: unknown }).options)
    ? (question as { options: unknown[] }).options.map((option) => String(option).replace(/\s*בלבד/g, '').trim())
    : []
  if (options.length < 2) return null

  const id = String((question as { id?: unknown }).id ?? '')
  const rawCorrectIndex = Number((question as { correctIndex?: unknown }).correctIndex ?? 0)
  const safeCorrectIndex = Number.isInteger(rawCorrectIndex) && rawCorrectIndex >= 0 && rawCorrectIndex < options.length ? rawCorrectIndex : 0
  const shift = stableHash(id) % options.length

  return {
    id,
    kind: 'choice',
    level: (question as ReviewedChoiceQuestion).level ?? '理解',
    context: (question as ReviewedChoiceQuestion).context,
    prompt: String((question as { prompt?: unknown }).prompt ?? ''),
    options: [...options.slice(shift), ...options.slice(0, shift)],
    correctIndex: (safeCorrectIndex - shift + options.length) % options.length,
    explanation: String((question as { explanation?: unknown }).explanation ?? ''),
  }
}

function sanitizeReviewedUnit(unit: ReviewedUnitContent | null): ReviewedUnitContent | null {
  if (!unit) return null
  return {
    ...unit,
    questions: unit.questions.map((question) => {
      // 來源作者檔以「是否有 options」判斷選擇題，避免一個誤打的 kind 字串讓 UI 把選擇題當開放題。
      const normalizedChoice = normalizeChoiceQuestion(question as unknown as Record<string, unknown>)
      if (normalizedChoice) return normalizedChoice
      return {
        ...question,
        kind: 'response' as const,
      }
    }),
  }
}

export function getReviewedUnitContent(unitId: string) {
  const raw = getSocial10UnitContent(unitId)
    ?? getReviewedMath7UnitContentV2(unitId)
    ?? getReviewedScience7UnitContent(unitId)
    ?? getReviewedChinese7UnitContent(unitId)
    ?? getReviewedEnglish7UnitContent(unitId)
    ?? getReviewedSocial7UnitContent(unitId)
  return sanitizeReviewedUnit(raw)
}

export function isReviewedUnit(unitId: string) {
  return Boolean(getReviewedUnitContent(unitId))
}
