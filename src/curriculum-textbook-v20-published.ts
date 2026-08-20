import { getTextbookUnitContentV20Complete } from './curriculum-textbook-v20-complete'
import { resolveCurriculumUnit } from './curriculum-plan-v5'
import type { ReviewedQuestion } from './curriculum-reviewed-social10'
import type { TextbookMisconception, TextbookVisual } from './curriculum-textbook-v14'
import type { TextbookUnitContentV20Final } from './curriculum-textbook-v20-final'

type ExtendedChoice = Extract<ReviewedQuestion, { kind: 'choice' }> & { optionFeedback?: string[] }
type ExtendedResponse = Extract<ReviewedQuestion, { kind: 'response' }> & { rubric?: string[] }

const normalize = (value: unknown) => String(value ?? '').replace(/\s+/g, ' ').trim()

function compact(value: unknown, max = 150) {
  const clean = normalize(value)
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).replace(/[，、；：,.!?。！？\s]+$/g, '')}…`
}

function cleanLearnerCopy(value: unknown) {
  return normalize(value)
    .replace(/\s*本題在 V20 中只作為「[^」]+」的學習證據，不可跨單元挪作另一個概念的替代題。?/g, '')
    .replace(/\s*本題在 V20 中只作為「[^」]+」的學習證據，不可跨單元挪用。?/g, '')
    .replace(/\s*這仍是 V20 明確標記的 fallback，後續人工審稿不得把它視為完成。?/gi, '')
    .replace(/V20 第一輪保底題[:：]?/gi, '')
    .replace(/V20\s+(?:social|english|math|science|chinese)\s+fallback[:：]?/gi, '')
    .replace(/。」。/g, '。」')
    .replace(/\.。/g, '。')
    .trim()
}

function cleanQuestion(question: ReviewedQuestion, unitTitle: string): ReviewedQuestion {
  if (question.kind === 'choice') {
    const choice = question as ExtendedChoice
    const options = choice.options.map(cleanLearnerCopy)
    const correctIndex = choice.correctIndex
    const correct = options[correctIndex] ?? ''
    const explanation = cleanLearnerCopy(choice.explanation)
    const optionFeedback = options.map((option, index) => index === correctIndex
      ? `正確。${compact(explanation, 180)}`
      : `這個選項「${compact(option, 52)}」不符合目前題幹的關鍵條件。正確答案是「${compact(correct, 62)}」。${compact(explanation, 150)}`)
    return {
      ...choice,
      context: cleanLearnerCopy(choice.context),
      prompt: cleanLearnerCopy(choice.prompt),
      options,
      explanation,
      optionFeedback,
    } as ReviewedQuestion
  }

  const response = question as ExtendedResponse
  const explanation = cleanLearnerCopy(response.explanation)
  const sampleAnswer = cleanLearnerCopy(response.sampleAnswer)
  const rubric = [
    `直接回答「${compact(response.prompt, 72)}」所問的核心問題。`,
    '至少指出一項題幹中的具體數字、語句、觀察、資料或表示作為證據。',
    `理由必須和「${unitTitle}」的本單元概念一致，且不能超出題目資訊。`,
  ]
  return {
    ...response,
    context: cleanLearnerCopy(response.context),
    prompt: cleanLearnerCopy(response.prompt),
    sampleAnswer,
    explanation,
    rubric,
  } as ReviewedQuestion
}

function answerOf(question: ReviewedQuestion) {
  return question.kind === 'choice'
    ? normalize(question.options[question.correctIndex])
    : normalize(question.sampleAnswer)
}

function misconceptionsFromQuestions(questions: ReviewedQuestion[]): TextbookMisconception[] {
  const result: TextbookMisconception[] = []
  for (const question of questions) {
    if (result.length >= 4) break
    if (question.kind === 'choice') {
      const wrong = question.options.find((_, index) => index !== question.correctIndex)
      if (!wrong) continue
      result.push({
        claim: `作答「${compact(question.prompt, 58)}」時，選了「${compact(wrong, 46)}」。`,
        correction: `應改為「${compact(answerOf(question), 62)}」，並回到題幹指出支持這個答案的條件或證據。`,
        reason: compact(cleanLearnerCopy(question.explanation), 170),
      })
    } else {
      result.push({
        claim: `回答「${compact(question.prompt, 58)}」時只寫結果，沒有留下可檢查的依據。`,
        correction: '補上題幹中的具體線索、計算、資料、語句或觀察，再把它和結論連起來。',
        reason: compact(cleanLearnerCopy(question.explanation), 170),
      })
    }
  }
  return result
}

function misconceptionVisual(unitId: string, unitTitle: string, misconceptions: TextbookMisconception[]): TextbookVisual {
  return {
    id: `${unitId}-v20-published-errors`,
    kind: 'comparison',
    title: `${unitTitle}｜錯誤與修正`,
    caption: '把本章實際題目中的常見錯法、正確判斷與理由放在一起比較。',
    items: misconceptions.map((item, index) => ({
      label: `易錯 ${index + 1}｜${compact(item.claim, 48)}`,
      detail: `${compact(item.correction, 86)} ${compact(item.reason, 100)}`,
    })),
  }
}

export function getTextbookUnitContentV20Published(unitId: string): TextbookUnitContentV20Final | null {
  const source = getTextbookUnitContentV20Complete(unitId)
  const context = resolveCurriculumUnit(unitId)
  if (!source || !context) return null

  const questions = source.questions.map((question) => cleanQuestion(question, context.unit.title))
  const misconceptions = misconceptionsFromQuestions(questions)
  const visuals = source.visuals
    .filter((visual) => !/錯誤與修正|易錯|misconception/i.test(`${visual.title} ${visual.caption}`))
    .map((visual) => ({
      ...visual,
      title: cleanLearnerCopy(visual.title),
      caption: cleanLearnerCopy(visual.caption),
      items: visual.items.map((item) => ({ label: cleanLearnerCopy(item.label), detail: cleanLearnerCopy(item.detail) })),
    }))
  visuals.push(misconceptionVisual(unitId, context.unit.title, misconceptions))

  return {
    ...source,
    overview: cleanLearnerCopy(source.overview),
    objectives: source.objectives.map(cleanLearnerCopy),
    concepts: source.concepts.map((concept) => ({
      ...concept,
      title: cleanLearnerCopy(concept.title),
      explanation: cleanLearnerCopy(concept.explanation),
      example: concept.example ? cleanLearnerCopy(concept.example) : concept.example,
    })),
    questions,
    workedExamples: source.workedExamples.map((example) => ({
      ...example,
      title: cleanLearnerCopy(example.title),
      context: cleanLearnerCopy(example.context),
      prompt: cleanLearnerCopy(example.prompt),
      steps: example.steps.map(cleanLearnerCopy),
      answer: cleanLearnerCopy(example.answer),
      explanation: cleanLearnerCopy(example.explanation),
    })),
    misconceptions,
    visuals,
    vocabulary: source.vocabulary.map((item) => ({ term: cleanLearnerCopy(item.term), definition: cleanLearnerCopy(item.definition) })),
    takeaway: source.takeaway.map(cleanLearnerCopy),
  }
}

const cache = new Map<string, TextbookUnitContentV20Final | null>()

export function getCachedTextbookUnitContentV20Published(unitId: string) {
  if (cache.has(unitId)) return cache.get(unitId) ?? null
  const unit = getTextbookUnitContentV20Published(unitId)
  cache.set(unitId, unit)
  return unit
}
