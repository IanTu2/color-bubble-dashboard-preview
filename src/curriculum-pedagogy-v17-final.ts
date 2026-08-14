import type { CurriculumQuestionEnhancement } from './curriculum-reviewed-content'
import { resolveCurriculumUnit } from './curriculum-plan-v5'
import type {
  ReviewedChoiceQuestion,
  ReviewedQuestion,
  ReviewedResponseQuestion,
} from './curriculum-reviewed-social10'
import {
  validateTextbookUnitV14,
  type TextbookUnitContentV14,
} from './curriculum-textbook-v14'
import { inspectTextbookUnitV17 } from './curriculum-pedagogy-v17'

type EnhancedChoice = ReviewedChoiceQuestion & CurriculumQuestionEnhancement
type EnhancedResponse = ReviewedResponseQuestion & CurriculumQuestionEnhancement

function uniqueId(unit: TextbookUnitContentV14, suffix: string) {
  const existing = new Set(unit.questions.map((question) => question.id))
  let cursor = 1
  let id = `${unit.unitId}-ped-v17-final-${suffix}-${cursor}`
  while (existing.has(id)) {
    cursor += 1
    id = `${unit.unitId}-ped-v17-final-${suffix}-${cursor}`
  }
  return id
}

function makeFinalResponse(unit: TextbookUnitContentV14, index: number): EnhancedResponse {
  const context = resolveCurriculumUnit(unit.unitId)
  const concept = unit.concepts[index % unit.concepts.length]
  const title = context?.unit.title ?? unit.unitId
  const focus = context?.unit.focus ?? unit.overview
  const subject = context?.subject ?? unit.subject
  const prompt = subject === 'english'
    ? `Use “${concept.title}” in a new situation from “${title}”. Explain the evidence or language clues you used and one way to check your answer.`
    : `請把「${concept.title}」用在「${title}」的另一個完整情境：寫出你依據的條件、證據或表示方式，並說明最後要怎麼檢查結論。`
  const contextText = subject === 'english'
    ? `Unit focus: ${focus}. Build a complete example that is different from the worked example but still belongs to the same learning focus.`
    : `本單元重點：${focus}。請自行換一個和課本例題不同、但仍屬於同一學習範圍的具體情境。`
  const sampleAnswer = subject === 'english'
    ? `A complete answer should identify the situation, use “${concept.title}” with the correct meaning and form, point to concrete clues, and then check whether the final message is natural and consistent with the unit focus.`
    : `完整作答要先交代新情境中的具體條件或證據，再用「${concept.title}」完成推理，最後回到「${title}」的學習範圍檢查答案是否合理、是否超出題目能支持的結論。`
  return {
    id: uniqueId(unit, 'transfer'),
    kind: 'response',
    level: '檢核',
    context: contextText,
    prompt,
    sampleAnswer,
    explanation: `這題刻意要求換情境，檢查學生能不能轉移「${concept.title}」，而不是重複背同一個例題或固定答案。`,
    rubric: subject === 'english'
      ? [
          'The new situation clearly belongs to the unit focus.',
          `“${concept.title}” is used accurately in meaning and form.`,
          'The answer names concrete clues and includes a reasonable self-check.',
        ]
      : [
          '新情境確實屬於本單元範圍，而不是只改幾個字。',
          `有正確使用「${concept.title}」連結具體條件、證據或表示方式。`,
          '有主動檢查答案、證據範圍或推理限制。',
        ],
  } as EnhancedResponse
}

function makeFinalChoice(unit: TextbookUnitContentV14, index: number): EnhancedChoice {
  const context = resolveCurriculumUnit(unit.unitId)
  const concept = unit.concepts[index % unit.concepts.length]
  const title = context?.unit.title ?? unit.unitId
  const focus = context?.unit.focus ?? unit.overview
  const correct = `先確認新情境仍符合「${concept.title}」的必要條件，再用本單元的方法處理並檢查結果。`
  const options = [
    correct,
    `只要題目出現和「${concept.title}」相似的字，就直接使用和上一題完全相同的做法。`,
    `先決定想得到的答案，再從「${title}」中挑一段看起來支持它的內容。`,
    `只比較最後答案是否一樣，不檢查新情境中的條件、證據或表示方式是否改變。`,
  ]
  const shift = index % options.length
  const rotated = [...options.slice(shift), ...options.slice(0, shift)]
  const correctIndex = rotated.indexOf(correct)
  return {
    id: uniqueId(unit, 'choice'),
    kind: 'choice',
    level: '檢核',
    context: `「${title}」的學習重點是「${focus}」。現在把原本例題換成另一個完整情境。`,
    prompt: `換情境後，如果仍想正確使用「${concept.title}」，哪一個做法最可靠？`,
    options: rotated,
    correctIndex,
    explanation: `真正能轉移的是概念成立的條件與推理方式；表面字詞相似，不代表可以直接複製原本答案。`,
    optionFeedback: rotated.map((option) => option === correct
      ? `正確。先重查概念成立條件，才能確定換情境後仍可使用同一方法。`
      : `這個選項把表面相似、預設答案或最後結果放在條件檢查之前，因此不能證明真的理解「${concept.title}」。`),
  } as EnhancedChoice
}

function ensureStructuralQuestionFloor(unit: TextbookUnitContentV14) {
  const questions: ReviewedQuestion[] = [...unit.questions]
  let cursor = 0
  while (questions.length < 15) {
    const addition = cursor % 2 === 0 ? makeFinalResponse({ ...unit, questions }, cursor) : makeFinalChoice({ ...unit, questions }, cursor)
    questions.push(addition)
    cursor += 1
  }
  return { ...unit, questions }
}

export function inspectTextbookUnitV17Final(unitId: string) {
  const inspected = inspectTextbookUnitV17(unitId)
  if (!inspected.unit) return inspected
  const unit = ensureStructuralQuestionFloor(inspected.unit)
  return { unit, validation: validateTextbookUnitV14(unit) }
}

const cache = new Map<string, TextbookUnitContentV14 | null>()

export function getTextbookUnitContentV17Final(unitId: string): TextbookUnitContentV14 | null {
  if (cache.has(unitId)) return cache.get(unitId) ?? null
  const inspected = inspectTextbookUnitV17Final(unitId)
  const unit = inspected.unit && inspected.validation.ready ? inspected.unit : null
  cache.set(unitId, unit)
  return unit
}

export function getConceptChecksV17Final(unit: TextbookUnitContentV14) {
  return unit.questions.filter((question) => question.id.includes('-ped-v17-check-'))
}
