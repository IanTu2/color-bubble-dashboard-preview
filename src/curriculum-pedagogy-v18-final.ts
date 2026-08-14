import type { ReviewedQuestion } from './curriculum-reviewed-social10'
import { validateTextbookUnitV14, type TextbookUnitContentV14 } from './curriculum-textbook-v14'
import { inspectTextbookUnitV18 as inspectConcreteV18 } from './curriculum-pedagogy-v18-base'

function promptKey(value: string) {
  return value.toLowerCase().replace(/[\s，。！？；：,.!?;:'"「」『』（）()\-—]/g, '')
}

function contextClue(question: ReviewedQuestion) {
  const source = String(question.context ?? '').replace(/\s+/g, ' ').trim()
  if (!source) return '題目提供的實際資料'
  const clipped = source.length > 54 ? `${source.slice(0, 53).replace(/[，、；：,.!?。！？\s]+$/g, '')}…` : source
  return clipped
}

function ensureUniqueLearnerPrompts(unit: TextbookUnitContentV14) {
  const seen = new Set<string>()
  const questions = unit.questions.map((question) => {
    let prompt = question.prompt
    let key = promptKey(prompt)
    if (key && !seen.has(key)) {
      seen.add(key)
      return question
    }

    const clue = contextClue(question)
    prompt = `${question.prompt} 請依「${clue}」這筆實際資料作答。`
    key = promptKey(prompt)
    if (!key || seen.has(key)) {
      prompt = `${question.prompt} 請把「${clue}」中的具體文字或數值一起納入判斷。`
      key = promptKey(prompt)
    }
    seen.add(key)
    return { ...question, prompt }
  })
  return { ...unit, questions }
}

export function inspectTextbookUnitV18(unitId: string) {
  const inspected = inspectConcreteV18(unitId)
  if (!inspected.unit) return inspected
  const unit = ensureUniqueLearnerPrompts(inspected.unit)
  return { unit, validation: validateTextbookUnitV14(unit) }
}

const cache = new Map<string, TextbookUnitContentV14 | null>()

export function getTextbookUnitContentV18(unitId: string): TextbookUnitContentV14 | null {
  if (cache.has(unitId)) return cache.get(unitId) ?? null
  const inspected = inspectTextbookUnitV18(unitId)
  const unit = inspected.unit && inspected.validation.ready ? inspected.unit : null
  cache.set(unitId, unit)
  return unit
}

export function getConceptChecksV18(unit: TextbookUnitContentV14) {
  return unit.questions.filter((question) => question.id.includes('-ped-v17-check-'))
}
