export type {
  ReviewedChoiceQuestion,
  ReviewedResponseQuestion,
  ReviewedQuestion,
  ReviewedConcept,
  ReviewedWorkedExample,
  ReviewedUnitContent,
} from './curriculum-reviewed-social10'
export type { FoundationUnitContent } from './curriculum-foundation-content'

import { getReviewedUnitContent as getSocial10UnitContent } from './curriculum-reviewed-social10'
import { getReviewedMath7UnitContentV2 } from './curriculum-reviewed-math7-v2'
import { getReviewedScience7UnitContent } from './curriculum-reviewed-science7'
import { getReviewedChinese7UnitContent } from './curriculum-reviewed-chinese7'
import { getReviewedEnglish7UnitContent } from './curriculum-reviewed-english7'
import { getReviewedSocial7UnitContent } from './curriculum-reviewed-social7'
import { getFoundationUnitContent, type FoundationUnitContent } from './curriculum-foundation-content'
import type {
  ReviewedChoiceQuestion,
  ReviewedQuestion,
  ReviewedResponseQuestion,
  ReviewedUnitContent,
} from './curriculum-reviewed-social10'

export type CurriculumUnitContent = ReviewedUnitContent | FoundationUnitContent

function stableHash(value: string) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0
  return Math.abs(hash)
}

function normalizeChoiceQuestion(question: Record<string, unknown>): ReviewedChoiceQuestion | null {
  const options = Array.isArray(question.options)
    ? question.options.map((option) => String(option).replace(/\s*בלבד/g, '').trim())
    : []
  if (options.length < 2) return null

  const id = String(question.id ?? '')
  const rawCorrectIndex = Number(question.correctIndex ?? 0)
  const safeCorrectIndex = Number.isInteger(rawCorrectIndex) && rawCorrectIndex >= 0 && rawCorrectIndex < options.length ? rawCorrectIndex : 0
  const shift = stableHash(id) % options.length

  return {
    id,
    kind: 'choice',
    level: (question.level as ReviewedChoiceQuestion['level']) ?? '理解',
    context: typeof question.context === 'string' ? question.context : undefined,
    prompt: String(question.prompt ?? ''),
    options: [...options.slice(shift), ...options.slice(0, shift)],
    correctIndex: (safeCorrectIndex - shift + options.length) % options.length,
    explanation: String(question.explanation ?? ''),
  }
}

function normalizeResponseQuestion(question: Record<string, unknown>): ReviewedResponseQuestion | null {
  if (typeof question.sampleAnswer !== 'string') return null
  return {
    id: String(question.id ?? ''),
    kind: 'response',
    level: (question.level as ReviewedResponseQuestion['level']) ?? '理解',
    context: typeof question.context === 'string' ? question.context : undefined,
    prompt: String(question.prompt ?? ''),
    sampleAnswer: question.sampleAnswer,
    explanation: String(question.explanation ?? ''),
  }
}

function sanitizeQuestions<T extends CurriculumUnitContent>(unit: T | null): T | null {
  if (!unit) return null
  return {
    ...unit,
    questions: unit.questions.map((question): ReviewedQuestion => {
      const raw = question as unknown as Record<string, unknown>
      const normalizedChoice = normalizeChoiceQuestion(raw)
      if (normalizedChoice) return normalizedChoice

      const normalizedResponse = normalizeResponseQuestion(raw)
      if (normalizedResponse) return normalizedResponse

      return question
    }),
  } as T
}

export function getStrictReviewedUnitContent(unitId: string): ReviewedUnitContent | null {
  const raw = getSocial10UnitContent(unitId)
    ?? getReviewedMath7UnitContentV2(unitId)
    ?? getReviewedScience7UnitContent(unitId)
    ?? getReviewedChinese7UnitContent(unitId)
    ?? getReviewedEnglish7UnitContent(unitId)
    ?? getReviewedSocial7UnitContent(unitId)
  return sanitizeQuestions(raw)
}

export function getCurriculumUnitContent(unitId: string): CurriculumUnitContent | null {
  const reviewed = getStrictReviewedUnitContent(unitId)
  if (reviewed) return reviewed
  return sanitizeQuestions(getFoundationUnitContent(unitId))
}

// 舊 player 的 buildPages 型別仍接受 ReviewedUnitContent；v9 foundation 在執行期
// 擁有完全相同的 concepts/workedExamples/questions/takeaway 結構，只把審閱狀態另外交給
// isReviewedUnit / getCurriculumUnitContent 判斷，避免 UI 把「有內容」誤寫成「已審閱」。
export function getReviewedUnitContent(unitId: string): ReviewedUnitContent | null {
  return getCurriculumUnitContent(unitId) as ReviewedUnitContent | null
}

export function isReviewedUnit(unitId: string) {
  return Boolean(getStrictReviewedUnitContent(unitId))
}

export function hasCurriculumUnitContent(unitId: string) {
  return Boolean(getCurriculumUnitContent(unitId))
}
