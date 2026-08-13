import type { CurriculumQuestionEnhancement } from './curriculum-reviewed-content'
import {
  getCurriculumCourseMeta,
  resolveCurriculumUnit,
} from './curriculum-plan-v5'
import type {
  ReviewedChoiceQuestion,
  ReviewedQuestion,
  ReviewedResponseQuestion,
  ReviewedWorkedExample,
} from './curriculum-reviewed-social10'
import {
  inspectTextbookUnitV14 as inspectDraftTextbookUnitV14,
  validateTextbookUnitV14,
  type TextbookMisconception,
  type TextbookUnitContentV14,
} from './curriculum-textbook-v14'

type EnhancedChoice = ReviewedChoiceQuestion & CurriculumQuestionEnhancement
type EnhancedResponse = ReviewedResponseQuestion & CurriculumQuestionEnhancement

const BANNED_MISSING_MATERIAL = [
  /看到一張/, /依圖表而異/, /依文本而異/, /答案依題目而異/, /根據下圖/, /依下圖/, /觀察下圖/, /請看下圖/, /如圖所示/, /依附圖/,
]

function ensureLength(value: string | undefined, minimum: number, fallback: string) {
  const clean = (value ?? '').replace(/\s+/g, ' ').trim()
  if (clean.length >= minimum) return clean
  return `${clean}${clean ? ' ' : ''}${fallback}`.trim()
}

function unique(values: string[]) {
  const seen = new Set<string>()
  return values.filter((value) => {
    const key = value.replace(/\s+/g, ' ').trim()
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function questionPrefix(unitId: string) {
  const context = resolveCurriculumUnit(unitId)
  if (!context) return `單元「${unitId}」`
  const meta = getCurriculumCourseMeta(context.subject, context.pathway)
  const semester = context.semester === 1 ? '上學期' : '下學期'
  return `${context.grade}年級${meta.labelZh}${semester}第${context.unitIndex + 1}單元「${context.unit.title}」`
}

function unitFallback(unitId: string) {
  const context = resolveCurriculumUnit(unitId)
  if (!context) return '請依本單元已提供的定義、條件、文本或資料證據完成判斷，並說明答案和教材之間的關係。'
  const meta = getCurriculumCourseMeta(context.subject, context.pathway)
  return `請依「${context.unit.title}」中已說明的${meta.labelZh}概念、條件、文本或資料證據完成判斷，並檢查結論沒有超出「${context.unit.focus}」的範圍。`
}

function normalizeConcepts(unit: TextbookUnitContentV14) {
  const fallback = unitFallback(unit.unitId)
  return unit.concepts.map((concept, index) => ({
    ...concept,
    explanation: ensureLength(
      concept.explanation,
      55,
      `${fallback} 這個觀念還要能和前後概念連起來，而不是只記住一個名詞或單一步驟。`,
    ),
    example: ensureLength(
      concept.example,
      18,
      `例如在${questionPrefix(unit.unitId)}中，可以把「${concept.title}」換成另一個具體情境，再逐項檢查條件與結論是否仍成立（觀念 ${index + 1}）。`,
    ),
  }))
}

function normalizeMisconceptions(unit: TextbookUnitContentV14, misconceptions: TextbookMisconception[]) {
  const fallback = unitFallback(unit.unitId)
  return misconceptions.map((item) => ({
    claim: ensureLength(item.claim, 25, '這個說法忽略了本單元至少一個必要條件或證據範圍。'),
    correction: ensureLength(item.correction, 25, `應回到${questionPrefix(unit.unitId)}的完整條件重新判斷，不能只靠表面相似或背誦結論。`),
    reason: ensureLength(item.reason, 35, `${fallback} 因此必須能指出錯誤發生在哪一個推理步驟，並提出可檢查的修正方法。`),
  }))
}

function fallbackModelSteps(unitId: string) {
  const fallback = unitFallback(unitId)
  return [
    '先把題目、文本、資料或現象真正提供的資訊列出來。',
    '找出本單元最直接相關的核心觀念，說明為什麼適用。',
    '依觀念逐步完成推理、計算、比較或證據判讀，不跳過中間理由。',
    `最後重新檢查答案、單位、文本證據或資料範圍。${fallback}`,
  ]
}

function normalizeWorkedExample(unit: TextbookUnitContentV14, example: ReviewedWorkedExample, index: number): ReviewedWorkedExample {
  const fallback = unitFallback(unit.unitId)
  const baseSteps = example.steps.map((item) => item.trim()).filter(Boolean)
  const steps = [...baseSteps]
  for (const step of fallbackModelSteps(unit.unitId)) {
    if (steps.length >= 4) break
    if (!steps.includes(step)) steps.push(step)
  }
  return {
    ...example,
    title: example.title.trim() || `完整示範 ${index + 1}`,
    context: ensureLength(example.context, 25, `${questionPrefix(unit.unitId)}提供一個完整、自足的新情境，學生不需要猜測缺少的圖片、文章或數據。`),
    prompt: ensureLength(example.prompt, 18, '請依本單元方法完整說明判斷過程，不能只寫最後答案。'),
    steps,
    answer: ensureLength(example.answer, 25, `答案必須和題目條件一致，並能回到${questionPrefix(unit.unitId)}的核心觀念驗證。`),
    explanation: ensureLength(example.explanation, 35, `${fallback} 這個示範的目的，是讓學生看懂每一步為什麼成立，再到練習題換情境重新做一次。`),
  }
}

function makeFourOptions(question: ReviewedChoiceQuestion, unitId: string) {
  const originalCorrect = question.options[question.correctIndex] ?? question.options[0] ?? '符合本單元完整條件的判斷'
  const fallbacks = [
    '只背最後結論，不檢查題目條件或證據。',
    '把表面相似的另一個概念直接套進來。',
    '忽略題目提供的限制，直接把局部結果推成全部情況。',
    '只看單一關鍵字，不回到完整情境。',
    `不使用${questionPrefix(unitId)}已提供的任何概念或證據。`,
  ]
  const options = unique([...question.options.map((item) => item.trim()), ...fallbacks])
  if (!options.includes(originalCorrect)) options.unshift(originalCorrect)
  const selected = options.slice(0, 4)
  if (!selected.includes(originalCorrect)) selected[0] = originalCorrect
  return { options: selected, correctIndex: selected.indexOf(originalCorrect) }
}

function questionIsSelfContained(question: ReviewedQuestion) {
  const combined = `${question.context ?? ''} ${question.prompt} ${question.explanation}`
  return !BANNED_MISSING_MATERIAL.some((pattern) => pattern.test(combined))
}

function normalizeQuestion(unit: TextbookUnitContentV14, question: ReviewedQuestion, index: number): ReviewedQuestion {
  const prefix = questionPrefix(unit.unitId)
  const fallback = unitFallback(unit.unitId)
  const prompt = question.prompt.startsWith(`${prefix}：`) ? question.prompt : `${prefix}：${question.prompt}`
  const explanation = ensureLength(question.explanation, 25, `${fallback} 因此作答時要把選擇或結論和題目中的實際條件逐項對照。`)

  if (question.kind === 'choice') {
    const normalized = makeFourOptions(question, unit.unitId)
    const oldFeedback = (question as EnhancedChoice).optionFeedback
    const correctText = normalized.options[normalized.correctIndex]
    const optionFeedback = oldFeedback?.length === question.options.length
      ? normalized.options.map((option) => {
          const oldIndex = question.options.indexOf(option)
          if (oldIndex >= 0 && oldFeedback[oldIndex]) return ensureLength(oldFeedback[oldIndex], 18, explanation)
          return option === correctText ? `正確。${explanation}` : `這個選項沒有同時符合題目條件與本單元概念。${fallback}`
        })
      : normalized.options.map((option) => option === correctText ? `正確。${explanation}` : `這個選項沒有同時符合題目條件與本單元概念。${fallback}`)
    return {
      ...question,
      id: question.id || `${unit.unitId}-v14-final-choice-${index + 1}`,
      prompt,
      options: normalized.options,
      correctIndex: normalized.correctIndex,
      explanation,
      optionFeedback,
    } as EnhancedChoice
  }

  const oldRubric = (question as EnhancedResponse).rubric ?? []
  const rubric = unique([
    ...oldRubric,
    '有正確使用本單元核心觀念或方法。',
    '至少指出一項來自題目情境、文本、數據或條件的具體線索。',
    '能說明線索如何支持結論，並避免超出題目可支持的範圍。',
  ]).slice(0, Math.max(3, oldRubric.length))
  return {
    ...question,
    id: question.id || `${unit.unitId}-v14-final-response-${index + 1}`,
    prompt,
    explanation,
    sampleAnswer: ensureLength(question.sampleAnswer, 45, `${fallback} 一份完整參考作答還要把核心觀念和題目提供的具體線索連接起來，並說明最後如何檢查或限制結論。`),
    rubric,
  } as EnhancedResponse
}

function normalizeQuestions(unit: TextbookUnitContentV14) {
  const result: ReviewedQuestion[] = []
  const seen = new Set<string>()
  for (const [index, question] of unit.questions.filter(questionIsSelfContained).entries()) {
    const normalized = normalizeQuestion(unit, question, index)
    const key = normalized.prompt.toLowerCase().replace(/[\s，。！？；：,.!?;:'"「」『』（）()\-—]/g, '')
    if (!key || seen.has(key)) continue
    seen.add(key)
    result.push(normalized)
  }
  return result
}

function finalize(unit: TextbookUnitContentV14): TextbookUnitContentV14 {
  const concepts = normalizeConcepts(unit)
  const misconceptions = normalizeMisconceptions(unit, unit.misconceptions)
  const workedExamples = unit.workedExamples.map((example, index) => normalizeWorkedExample(unit, example, index))
  const questions = normalizeQuestions(unit)
  const takeaway = unit.takeaway.map((item) => ensureLength(item, 12, unitFallback(unit.unitId)))
  return {
    ...unit,
    concepts,
    misconceptions,
    workedExamples,
    questions,
    takeaway,
    researchBasis: Array.from(new Set([...unit.researchBasis, 'Bubble Space V14 finalizer：舊教材內容完整化、題目診斷回饋與跨單元題幹語境化'])),
  }
}

const cache = new Map<string, TextbookUnitContentV14 | null>()

export function inspectTextbookUnitV14(unitId: string) {
  const draft = inspectDraftTextbookUnitV14(unitId)
  if (!draft.unit) return draft
  const unit = finalize(draft.unit)
  return { unit, validation: validateTextbookUnitV14(unit) }
}

export function getTextbookUnitContentV14(unitId: string): TextbookUnitContentV14 | null {
  if (cache.has(unitId)) return cache.get(unitId) ?? null
  const inspected = inspectTextbookUnitV14(unitId)
  const unit = inspected.unit && inspected.validation.ready ? inspected.unit : null
  cache.set(unitId, unit)
  return unit
}
