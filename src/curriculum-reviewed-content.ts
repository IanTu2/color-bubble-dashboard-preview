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
  ReviewedResponseQuestion,
  ReviewedUnitContent,
} from './curriculum-reviewed-social10'

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

function sanitizeReviewedUnit(unit: ReviewedUnitContent | null): ReviewedUnitContent | null {
  if (!unit) return null
  return {
    ...unit,
    questions: unit.questions.map((question): ReviewedQuestion => {
      const raw = question as unknown as Record<string, unknown>
      // 以實際資料欄位決定題型，而不是完全相信作者檔的 kind 字串。
      // 這可避免編輯時誤打 kind 讓有選項的題目被 UI 當成開放題。
      const normalizedChoice = normalizeChoiceQuestion(raw)
      if (normalizedChoice) return normalizedChoice

      const normalizedResponse = normalizeResponseQuestion(raw)
      if (normalizedResponse) return normalizedResponse

      // Reviewed source 正常情況不會進到這裡；保留原題讓 TypeScript 與 QA
      // 能繼續暴露資料缺欄，而不是偷偷造一個假的參考答案。
      return question
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
