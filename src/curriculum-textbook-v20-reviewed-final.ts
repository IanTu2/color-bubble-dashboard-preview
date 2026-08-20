import { getTextbookUnitContentV20Semantic } from './curriculum-textbook-v20-semantic'
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

function unitFrame(subject: string, grade: number, semester: number, title: string, focus: string) {
  if (subject === 'english') {
    return `Grade ${grade}, Semester ${semester}, unit “${title}”. Learning focus: ${focus}`
  }
  return `${grade} 年級第 ${semester} 學期「${title}」。本章焦點：${focus}`
}

function questionExplanation(subject: string, answer: string, original: string) {
  const explanation = norm(original)
  const answerLead = subject === 'english'
    ? `The supported answer is “${answer}”.`
    : `依題幹可支持的答案是「${answer}」。`
  return `${answerLead} ${explanation}`.trim()
}

function deepenExampleExplanation(subject: string, title: string, original: string) {
  const explanation = norm(original)
  const check = subject === 'math'
    ? `這裡先依「${title}」的數量或符號關係選方法；完成後要用代回、估算、圖形、單位或另一種表示再次檢查結果。`
    : subject === 'english'
      ? `This method follows the meaning and form practiced in “${title}”. Read the complete sentence or passage again to check meaning, word form, reference/time clues, and word order.`
      : subject === 'science'
        ? `這個判斷要回到「${title}」的觀察、量測與模型；完成後再確認結論沒有超過題目證據與條件能支持的範圍。`
        : subject === 'social'
          ? `這個判斷要回到「${title}」的來源與時空脈絡；完成後再核對資料年代、尺度、立場與結論的證據界線。`
          : `這個判斷要回到「${title}」的完整文本與語境；完成後再指出支持答案的具體字詞、句段或篇章線索。`
  return `${explanation}${explanation && !/[。.!?！？]$/.test(explanation) ? '。' : ''} ${check}`.trim()
}

export function getTextbookUnitContentV20ReviewedFinal(unitId: string): TextbookUnitContentV20Final | null {
  // Final learner output must inherit the subject/unit-specific semantic task layer.
  // The previous chain read directly from V20Reviewed, whose parallel task generator
  // could overwrite the more complete semantic families and create unit mismatches.
  const source = getTextbookUnitContentV20Semantic(unitId)
  const context = resolveCurriculumUnit(unitId)
  if (!source || !context) return null
  const parts = focusParts(context.unit.title, context.unit.focus)
  const frame = unitFrame(context.subject, context.grade, context.semester, context.unit.title, context.unit.focus)
  const questions = source.questions.map((question, index) => {
    const prompt = promptFor(context.subject, question.level, parts[index % parts.length], question.prompt)
    const questionContext = `${frame} ${norm(question.context)}`.trim()
    if (question.kind === 'choice') {
      const answer = norm(question.options?.[question.correctIndex])
      return {
        ...question,
        context: questionContext,
        prompt,
        explanation: questionExplanation(context.subject, answer, question.explanation),
      }
    }
    const response = question as ResponseWithRubric
    const answer = norm(response.sampleAnswer)
    return {
      ...response,
      context: questionContext,
      prompt,
      explanation: questionExplanation(context.subject, answer, response.explanation),
      rubric: [
        `直接回答「${prompt.slice(0, 92)}${prompt.length > 92 ? '…' : ''}」。`,
        '至少指出一項題幹中的具體數字、語句、資料、觀察或計算。',
        `理由與「${context.unit.title}」的單元焦點一致，而且沒有超出題目資訊。`,
      ],
    } as ReviewedQuestion
  })
  const workedExamples = source.workedExamples.map((example) => ({
    ...example,
    context: `${frame} ${norm(example.context)}`.trim(),
    explanation: deepenExampleExplanation(context.subject, context.unit.title, example.explanation),
  }))
  return { ...source, questions, workedExamples }
}

const cache = new Map<string, TextbookUnitContentV20Final | null>()
export function getCachedTextbookUnitContentV20ReviewedFinal(unitId: string) {
  if (cache.has(unitId)) return cache.get(unitId) ?? null
  const unit = getTextbookUnitContentV20ReviewedFinal(unitId)
  cache.set(unitId, unit)
  return unit
}
