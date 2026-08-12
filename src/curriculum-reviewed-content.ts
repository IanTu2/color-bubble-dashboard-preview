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

// 舊 player 仍使用這個名稱取教材；v9 起這裡回傳「可教學內容」，
// 但是否真的完成逐題人工審閱必須用 isReviewedUnit 判斷，不能只看內容是否存在。
export function getReviewedUnitContent(unitId: string): CurriculumUnitContent | null {
  return getCurriculumUnitContent(unitId)
}

export function isReviewedUnit(unitId: string) {
  return Boolean(getStrictReviewedUnitContent(unitId))
}

export function hasCurriculumUnitContent(unitId: string) {
  return Boolean(getCurriculumUnitContent(unitId))
}
