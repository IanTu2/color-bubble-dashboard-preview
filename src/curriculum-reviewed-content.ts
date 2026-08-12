export type {
  ReviewedChoiceQuestion,
  ReviewedResponseQuestion,
  ReviewedQuestion,
  ReviewedConcept,
  ReviewedWorkedExample,
  ReviewedUnitContent,
} from './curriculum-reviewed-social10'
export type { FoundationUnitContent } from './curriculum-foundation-content'
export type { CurriculumQuestionEnhancement } from './curriculum-foundation-question-bank-v12'

import { getReviewedUnitContent as getSocial10UnitContent } from './curriculum-reviewed-social10'
import { getReviewedMath7UnitContentV2 } from './curriculum-reviewed-math7-v2'
import { getReviewedScience7UnitContent } from './curriculum-reviewed-science7'
import { getReviewedChinese7UnitContent } from './curriculum-reviewed-chinese7'
import { getReviewedEnglish7UnitContent } from './curriculum-reviewed-english7'
import { getReviewedSocial7UnitContent } from './curriculum-reviewed-social7'
import { getFoundationUnitContent, type FoundationUnitContent } from './curriculum-foundation-content'
import { getPathwayFoundationUnitContent } from './curriculum-pathway-foundation-v13'
import { buildLifeCurriculumQuestionsV13 } from './curriculum-life-question-bank-v13'
import { enrichFoundationUnitV14 } from './curriculum-textbook-depth-v14'
import { specializeLifeDepthV14 } from './curriculum-life-depth-v14'
import { getMath7TextbookSupplement } from './curriculum-textbook-supplement-math7'
import { getScience7TextbookSupplement } from './curriculum-textbook-supplement-science7'
import {
  upgradeFoundationUnitV12,
  type CurriculumQuestionEnhancement,
} from './curriculum-foundation-question-bank-v12'
import type {
  ReviewedChoiceQuestion,
  ReviewedQuestion,
  ReviewedResponseQuestion,
  ReviewedUnitContent,
} from './curriculum-reviewed-social10'

export type CurriculumUnitContent = ReviewedUnitContent | FoundationUnitContent
export type EnhancedCurriculumQuestion = ReviewedQuestion & CurriculumQuestionEnhancement

function stableHash(value: string) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0
  return Math.abs(hash)
}

function rotate<T>(items: T[], shift: number) {
  if (!items.length) return items
  return [...items.slice(shift), ...items.slice(0, shift)]
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
  const rawFeedback = Array.isArray(question.optionFeedback)
    ? question.optionFeedback.map((item) => String(item))
    : []
  const optionFeedback = rawFeedback.length === options.length ? rotate(rawFeedback, shift) : undefined

  const normalized = {
    id,
    kind: 'choice',
    level: (question.level as ReviewedChoiceQuestion['level']) ?? '理解',
    context: typeof question.context === 'string' ? question.context : undefined,
    prompt: String(question.prompt ?? ''),
    options: rotate(options, shift),
    correctIndex: (safeCorrectIndex - shift + options.length) % options.length,
    explanation: String(question.explanation ?? ''),
    optionFeedback,
    mediaAssetId: typeof question.mediaAssetId === 'string' ? question.mediaAssetId : undefined,
    audioText: typeof question.audioText === 'string' ? question.audioText : undefined,
  } as ReviewedChoiceQuestion & CurriculumQuestionEnhancement

  return normalized
}

function normalizeResponseQuestion(question: Record<string, unknown>): ReviewedResponseQuestion | null {
  if (typeof question.sampleAnswer !== 'string') return null
  const normalized = {
    id: String(question.id ?? ''),
    kind: 'response',
    level: (question.level as ReviewedResponseQuestion['level']) ?? '理解',
    context: typeof question.context === 'string' ? question.context : undefined,
    prompt: String(question.prompt ?? ''),
    sampleAnswer: question.sampleAnswer,
    explanation: String(question.explanation ?? ''),
    mediaAssetId: typeof question.mediaAssetId === 'string' ? question.mediaAssetId : undefined,
    audioText: typeof question.audioText === 'string' ? question.audioText : undefined,
    rubric: Array.isArray(question.rubric) ? question.rubric.map((item) => String(item)) : undefined,
  } as ReviewedResponseQuestion & CurriculumQuestionEnhancement
  return normalized
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

function enrichStrictReviewedUnit(unit: ReviewedUnitContent, unitId: string): ReviewedUnitContent {
  const math7Supplement = getMath7TextbookSupplement(unitId)
  if (math7Supplement) {
    return {
      ...unit,
      researchBasis: Array.from(new Set([
        ...unit.researchBasis,
        'Bubble Space v10：國教院七年級數學學習內容代碼逐章核對＋教科書深度補強',
      ])),
      concepts: [...unit.concepts, ...math7Supplement.misconceptionConcepts],
      workedExamples: [...unit.workedExamples, ...math7Supplement.workedExamples],
      questions: [...unit.questions, ...math7Supplement.questions],
      takeaway: Array.from(new Set([
        ...unit.takeaway,
        '除了會算，也要能辨認常見迷思、解釋方法理由，並把方法轉用到新的題型。',
      ])),
    }
  }

  const science7Supplement = getScience7TextbookSupplement(unitId)
  if (science7Supplement) {
    return {
      ...unit,
      researchBasis: Array.from(new Set([
        ...unit.researchBasis,
        'Bubble Space v10：國教院國中自然科學第四學習階段生物內容對照＋常見迷思與探究題補強',
      ])),
      concepts: [...unit.concepts, ...science7Supplement.misconceptionConcepts],
      workedExamples: [...unit.workedExamples, ...science7Supplement.workedExamples],
      questions: [...unit.questions, ...science7Supplement.questions],
      takeaway: Array.from(new Set([
        ...unit.takeaway,
        '科學結論要區分觀察、推論與證據範圍；能說明常見錯誤為什麼錯，才算真正理解。',
      ])),
    }
  }

  return unit
}

export function getStrictReviewedUnitContent(unitId: string): ReviewedUnitContent | null {
  const raw = getSocial10UnitContent(unitId)
    ?? getReviewedMath7UnitContentV2(unitId)
    ?? getReviewedScience7UnitContent(unitId)
    ?? getReviewedChinese7UnitContent(unitId)
    ?? getReviewedEnglish7UnitContent(unitId)
    ?? getReviewedSocial7UnitContent(unitId)
  if (!raw) return null
  return sanitizeQuestions(enrichStrictReviewedUnit(raw, unitId))
}

export function getCurriculumUnitContent(unitId: string): CurriculumUnitContent | null {
  const reviewed = getStrictReviewedUnitContent(unitId)
  if (reviewed) return reviewed
  const foundation = getFoundationUnitContent(unitId) ?? getPathwayFoundationUnitContent(unitId)
  const upgraded = upgradeFoundationUnitV12(foundation)
  if (!upgraded) return null
  const withLifeQuestions = unitId.includes('-life-')
    ? { ...upgraded, questions: buildLifeCurriculumQuestionsV13(upgraded) }
    : upgraded
  const deepened = enrichFoundationUnitV14(withLifeQuestions)
  if (!deepened) return null
  const specialized = unitId.includes('-life-') ? specializeLifeDepthV14(deepened) : deepened
  return sanitizeQuestions(specialized)
}

// 保留舊 API 給仍未遷移的呼叫端；品質層級請使用 isReviewedUnit 與內部 audit registry 判斷。
export function getReviewedUnitContent(unitId: string): ReviewedUnitContent | null {
  return getCurriculumUnitContent(unitId) as ReviewedUnitContent | null
}

export function isReviewedUnit(unitId: string) {
  return Boolean(getStrictReviewedUnitContent(unitId))
}

export function hasCurriculumUnitContent(unitId: string) {
  return Boolean(getCurriculumUnitContent(unitId))
}
