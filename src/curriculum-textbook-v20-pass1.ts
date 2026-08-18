import { getTextbookUnitContentV20 } from './curriculum-textbook-v20-runtime'
import { resolveCurriculumUnit } from './curriculum-plan-v5'
import type { ReviewedQuestion } from './curriculum-reviewed-social10'
import type { TextbookUnitContentV14 } from './curriculum-textbook-v14'

function compact(value: string, max = 126) {
  const clean = String(value ?? '').replace(/\s+/g, ' ').trim()
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).replace(/[，、；：,.!?。！？\s]+$/g, '')}…`
}

function evidenceFrame(subject: string, unitTitle: string, focus: string, conceptTitle: string) {
  const focusLead = compact(focus, 92)
  if (subject === 'english') {
    return `Unit focus: ${unitTitle}. Target: ${conceptTitle}. Use this task only as evidence for the lesson focus “${focusLead}”.`
  }
  if (subject === 'math') {
    return `這題屬於「${unitTitle}」的「${conceptTitle}」；數值與表示必須在本單元焦點「${focusLead}」的範圍內解讀。`
  }
  if (subject === 'science') {
    return `這份觀察／資料用來檢查「${unitTitle}」中的「${conceptTitle}」；結論只能落在「${focusLead}」可支持的範圍。`
  }
  if (subject === 'social') {
    return `這份資料屬於「${unitTitle}」的「${conceptTitle}」；判讀時要連同本單元焦點「${focusLead}」的時間、空間或制度脈絡。`
  }
  return `這段素材屬於「${unitTitle}」的「${conceptTitle}」；解讀與表達須回到本單元焦點「${focusLead}」。`
}

function bindQuestionToUnit(question: ReviewedQuestion, frame: string, conceptTitle: string): ReviewedQuestion {
  const context = `${frame} ${String(question.context ?? '').trim()}`.trim()
  if (question.kind === 'choice') {
    return {
      ...question,
      context,
      explanation: `${question.explanation} 本題在 V20 中只作為「${conceptTitle}」的學習證據，不可跨單元挪作另一個概念的替代題。`,
      optionFeedback: question.optionFeedback?.map((feedback) => `${feedback} 請再核對「${conceptTitle}」的條件。`),
    }
  }
  return {
    ...question,
    context,
    explanation: `${question.explanation} 本題在 V20 中只作為「${conceptTitle}」的學習證據，不可跨單元挪用。`,
    rubric: [
      ...(question.rubric ?? []),
      `答案必須明確連回「${conceptTitle}」而不是只給泛用解題策略。`,
    ],
  }
}

/**
 * V20 rebuild pass 1: bind every learner item to its real unit + concept scope.
 *
 * This is intentionally NOT a readiness layer. It prevents a concrete task from
 * being silently reused as if it taught an unrelated unit, while the explicit
 * fallback list still records task families that need later human specialization.
 */
export function getTextbookUnitContentV20Pass1(unitId: string): TextbookUnitContentV14 | null {
  const source = getTextbookUnitContentV20(unitId)
  const context = resolveCurriculumUnit(unitId)
  if (!source || !context) return null

  const questions = source.questions.map((question, index) => {
    const concept = source.concepts[index % source.concepts.length]
    const frame = evidenceFrame(context.subject, context.unit.title, context.unit.focus, concept.title)
    return bindQuestionToUnit(question, frame, concept.title)
  })

  const workedExamples = source.workedExamples.map((example, index) => {
    const concept = source.concepts[index % source.concepts.length]
    const frame = evidenceFrame(context.subject, context.unit.title, context.unit.focus, concept.title)
    return {
      ...example,
      context: `${frame} ${example.context}`,
      explanation: `${example.explanation} 這個例題的有效範圍限定在「${context.unit.title}／${concept.title}」。`,
    }
  })

  return { ...source, questions, workedExamples }
}

const cache = new Map<string, TextbookUnitContentV14 | null>()

export function getCachedTextbookUnitContentV20Pass1(unitId: string) {
  if (cache.has(unitId)) return cache.get(unitId) ?? null
  const unit = getTextbookUnitContentV20Pass1(unitId)
  cache.set(unitId, unit)
  return unit
}
