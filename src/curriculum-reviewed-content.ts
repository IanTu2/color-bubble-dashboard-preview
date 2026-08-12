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
import { getMath7TextbookSupplement } from './curriculum-textbook-supplement-math7'
import { getScience7TextbookSupplement } from './curriculum-textbook-supplement-science7'
import { getChinese7TextbookSupplement } from './curriculum-textbook-supplement-chinese7'
import { getEnglish7TextbookSupplement } from './curriculum-textbook-supplement-english7'
import { getSocial7TextbookSupplement } from './curriculum-textbook-supplement-social7'
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

function mergeSupplement(unit: ReviewedUnitContent, supplement: {
  misconceptionConcepts: ReviewedUnitContent['concepts']
  workedExamples: ReviewedUnitContent['workedExamples']
  questions: ReviewedUnitContent['questions']
}, researchNote: string, takeaway: string): ReviewedUnitContent {
  return {
    ...unit,
    researchBasis: Array.from(new Set([...unit.researchBasis, researchNote])),
    concepts: [...unit.concepts, ...supplement.misconceptionConcepts],
    workedExamples: [...unit.workedExamples, ...supplement.workedExamples],
    questions: [...unit.questions, ...supplement.questions],
    takeaway: Array.from(new Set([...unit.takeaway, takeaway])),
  }
}

function enrichStrictReviewedUnit(unit: ReviewedUnitContent, unitId: string): ReviewedUnitContent {
  const math7Supplement = getMath7TextbookSupplement(unitId)
  if (math7Supplement) return mergeSupplement(
    unit,
    math7Supplement,
    'Bubble Space v10：國教院七年級數學學習內容代碼逐章核對＋教科書深度補強',
    '除了會算，也要能辨認常見迷思、解釋方法理由，並把方法轉用到新的題型。',
  )

  const science7Supplement = getScience7TextbookSupplement(unitId)
  if (science7Supplement) return mergeSupplement(
    unit,
    science7Supplement,
    'Bubble Space v10：國教院國中自然科學第四學習階段生物內容對照＋常見迷思與探究題補強',
    '科學結論要區分觀察、推論與證據範圍；能說明常見錯誤為什麼錯，才算真正理解。',
  )

  const chinese7Supplement = getChinese7TextbookSupplement(unitId)
  if (chinese7Supplement) return mergeSupplement(
    unit,
    chinese7Supplement,
    'Bubble Space v11：國教院國語文第四學習階段閱讀／篇章／文言／寫作內容對照＋自寫文本題補強',
    '國文理解要回到完整文本與可指出的語詞／篇章證據；寫作則要讓選材、結構與修訂服務表達目的。',
  )

  const english7Supplement = getEnglish7TextbookSupplement(unitId)
  if (english7Supplement) return mergeSupplement(
    unit,
    english7Supplement,
    'Bubble Space v11：國教院英語文第四學習階段聽說讀寫／綜合應用方向對照＋生活溝通題補強',
    '英文文法要放進訊息、對話、短文、表格與實際回應；只會選形式不等於能溝通。',
  )

  const social7Supplement = getSocial7TextbookSupplement(unitId)
  if (social7Supplement) return mergeSupplement(
    unit,
    social7Supplement,
    'Bubble Space v11：國教院社會領域國中臺灣地理／臺灣史／公民社會生活內容對照＋資料／史料／公共議題題補強',
    '社會科要能辨識資料來源、時間／空間尺度與制度脈絡，並用證據支持判斷。',
  )

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
  return sanitizeQuestions(getFoundationUnitContent(unitId))
}

// 保留舊 API 給仍未遷移的呼叫端；品質層級請使用 isReviewedUnit 與 audit registry 判斷。
export function getReviewedUnitContent(unitId: string): ReviewedUnitContent | null {
  return getCurriculumUnitContent(unitId) as ReviewedUnitContent | null
}

export function isReviewedUnit(unitId: string) {
  return Boolean(getStrictReviewedUnitContent(unitId))
}

export function hasCurriculumUnitContent(unitId: string) {
  return Boolean(getCurriculumUnitContent(unitId))
}
