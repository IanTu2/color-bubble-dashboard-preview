import { getTextbookUnitContentV20Reviewed } from './curriculum-textbook-v20-reviewed'
import { resolveCurriculumUnit } from './curriculum-plan-v5'
import type { ReviewedQuestion } from './curriculum-reviewed-social10'
import type { TextbookUnitContentV20Final } from './curriculum-textbook-v20-final'

type ResponseWithRubric = Extract<ReviewedQuestion, { kind: 'response' }> & { rubric?: string[] }

const norm = (value: unknown) => String(value ?? '').replace(/\s+/g, ' ').trim()

function focusParts(unitTitle: string, focus: string) {
  const parts = [...new Set([unitTitle, ...focus.split(/[，、；。]|以及|並且|並|與|和/).map(norm)].filter((item) => item.length >= 2))]
  while (parts.length < 3) parts.push(`${unitTitle}的檢查 ${parts.length + 1}`)
  return parts.slice(0, 6)
}

function promptFor(subject: string, level: string, focusPart: string, original: string) {
  if (subject === 'english') {
    if (level === '理解') return `Identify the key clue for “${focusPart},” then answer: ${original}`
    if (level === '應用') return `Apply “${focusPart}” to this new context: ${original}`
    return `Check a likely error about “${focusPart},” then answer: ${original}`
  }
  if (level === '理解') return `先確認「${focusPart}」的關鍵條件或證據，再回答：${original}`
  if (level === '應用') return `把「${focusPart}」用到這個新情境，完成：${original}`
  return `先排除「${focusPart}」最可能的錯法，再完成檢核：${original}`
}

export function getTextbookUnitContentV20ReviewedFinal(unitId: string): TextbookUnitContentV20Final | null {
  const source = getTextbookUnitContentV20Reviewed(unitId)
  const context = resolveCurriculumUnit(unitId)
  if (!source || !context) return null
  const parts = focusParts(context.unit.title, context.unit.focus)
  const questions = source.questions.map((question, index) => {
    const prompt = promptFor(context.subject, question.level, parts[index % parts.length], question.prompt)
    if (question.kind === 'choice') return { ...question, prompt }
    const response = question as ResponseWithRubric
    return {
      ...response,
      prompt,
      rubric: [
        `直接回答「${prompt.slice(0, 92)}${prompt.length > 92 ? '…' : ''}」。`,
        '至少指出一項題幹中的具體數字、語句、資料、觀察或計算。',
        `理由與「${context.unit.title}」的單元焦點一致，而且沒有超出題目資訊。`,
      ],
    } as ReviewedQuestion
  })
  return { ...source, questions }
}

const cache = new Map<string, TextbookUnitContentV20Final | null>()
export function getCachedTextbookUnitContentV20ReviewedFinal(unitId: string) {
  if (cache.has(unitId)) return cache.get(unitId) ?? null
  const unit = getTextbookUnitContentV20ReviewedFinal(unitId)
  cache.set(unitId, unit)
  return unit
}
