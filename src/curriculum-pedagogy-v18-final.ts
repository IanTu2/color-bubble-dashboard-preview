import type { ReviewedQuestion } from './curriculum-reviewed-social10'
import { validateTextbookUnitV14, type TextbookUnitContentV14 } from './curriculum-textbook-v14'
import { inspectTextbookUnitV18 as inspectConcreteV18 } from './curriculum-pedagogy-v18-base'

const GENERIC_DISTRACTOR = /^其他不符合條件的結果\s*\d+$/
const META_MISCONCEPTION = /只要記住|最後結論|重新檢查題目條件|整理已知與未知|建立表示與關係|推理或計算|驗算與檢查|回答原情境|不能只看表面詞|不能只看表面現象|先讀情境/

function promptKey(value: string) {
  return value.toLowerCase().replace(/[\s，。！？；：,.!?;:'"「」『』（）()\-—]/g, '')
}

function contextClue(question: ReviewedQuestion, max = 54) {
  const source = String(question.context ?? '').replace(/\s+/g, ' ').trim()
  if (!source) return '題目提供的實際資料'
  return source.length > max ? `${source.slice(0, max - 1).replace(/[，、；：,.!?。！？\s]+$/g, '')}…` : source
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

function repairGenericDistractors(unit: TextbookUnitContentV14) {
  const questions = unit.questions.map((question) => {
    if (question.kind !== 'choice' || !question.options.some((option) => GENERIC_DISTRACTOR.test(option))) return question

    const correct = question.options[question.correctIndex]
    const numeric = Number(correct)
    const used = new Set(question.options.filter((option) => !GENERIC_DISTRACTOR.test(option)))
    const replacements = Number.isFinite(numeric)
      ? [numeric + 1, numeric - 1, numeric + 2, numeric - 2, numeric + 5, -numeric - 1].map(String)
      : [
          `把題目中的條件顛倒後得到的結論`,
          `只看其中一個數字或詞語得到的結論`,
          `忽略單位、時間或證據範圍得到的結論`,
        ]
    let cursor = 0
    const options = question.options.map((option) => {
      if (!GENERIC_DISTRACTOR.test(option)) return option
      while (cursor < replacements.length && used.has(replacements[cursor])) cursor += 1
      const replacement = replacements[cursor] ?? `與題目資料不一致的另一個結果`
      cursor += 1
      used.add(replacement)
      return replacement
    })
    const optionFeedback = options.map((option, index) => index === question.correctIndex
      ? `正確。${question.explanation}`
      : `「${option}」和題目中的實際數字、文字或觀察條件不一致。請回到原情境重新核對。`)
    return { ...question, options, optionFeedback }
  })
  return { ...unit, questions }
}

function replaceMetaMisconceptions(unit: TextbookUnitContentV14) {
  const concreteChoices = unit.questions.filter((question) => question.kind === 'choice')
  if (!concreteChoices.length) return unit
  const misconceptions = unit.misconceptions.map((misconception, index) => {
    const existing = `${misconception.claim} ${misconception.correction} ${misconception.reason}`
    if (!META_MISCONCEPTION.test(existing)) return misconception
    const question = concreteChoices[index % concreteChoices.length]
    if (question.kind !== 'choice') return misconception
    const correct = question.options[question.correctIndex]
    const wrongIndex = question.options.findIndex((_, optionIndex) => optionIndex !== question.correctIndex)
    const wrong = question.options[Math.max(0, wrongIndex)]
    return {
      ...misconception,
      title: `容易搞混 ${index + 1}｜用實際題目辨認`,
      claim: `讀到「${contextClue(question, 62)}」時，有人選了「${wrong}」。`,
      correction: `應改成「${correct}」。`,
      reason: `回到題目「${question.prompt}」逐項核對：${question.explanation}`,
    }
  })
  return { ...unit, misconceptions }
}

export function inspectTextbookUnitV18(unitId: string) {
  const inspected = inspectConcreteV18(unitId)
  if (!inspected.unit) return inspected
  const unique = ensureUniqueLearnerPrompts(inspected.unit)
  const withDistractors = repairGenericDistractors(unique)
  const unit = replaceMetaMisconceptions(withDistractors)
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
