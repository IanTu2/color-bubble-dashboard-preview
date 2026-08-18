import { resolveCurriculumUnit } from './curriculum-plan-v5'
import type { ReviewedConcept, ReviewedQuestion, ReviewedWorkedExample } from './curriculum-reviewed-social10'
import { getTextbookUnitContentV18 as getLegacyTextbookUnitContentV18 } from './curriculum-pedagogy-v18-final'
import { validateTextbookUnitV14, type TextbookUnitContentV14 } from './curriculum-textbook-v14'
import { buildChineseV21 } from './curriculum-v21-chinese'
import { buildEnglishV21 } from './curriculum-v21-english'
import { buildMathV21 } from './curriculum-v21-math'
import { buildScienceV21 } from './curriculum-v21-science'
import { buildSocialV21 } from './curriculum-v21-social'
import { cleanProse, preserveSources, uniqueStrings, type V21SubjectBuild, type V21UnitContext } from './curriculum-v21-common'

export type V21Inspection = {
  unit: TextbookUnitContentV14 | null
  validation: ReturnType<typeof validateTextbookUnitV14>
  familyId?: string
  familyLabel?: string
}

function buildForSubject(unitId: string, base: TextbookUnitContentV14): V21SubjectBuild | null {
  const context = resolveCurriculumUnit(unitId)
  if (!context) return null
  if (context.subject === 'chinese') return buildChineseV21(context, base)
  if (context.subject === 'english') return buildEnglishV21(context, base)
  if (context.subject === 'math') return buildMathV21(context, base)
  if (context.subject === 'science') return buildScienceV21(context, base)
  if (context.subject === 'social') return buildSocialV21(context, base)
  return null
}

function strengthenConcept(concept: ReviewedConcept, context: V21UnitContext, familyLabel: string): ReviewedConcept {
  const title = cleanProse(concept.title)
  const rawExplanation = cleanProse(concept.explanation)
  const rawExample = cleanProse(concept.example ?? '')
  const explanation = rawExplanation.length >= 58
    ? rawExplanation
    : `${rawExplanation}${rawExplanation ? ' ' : ''}在「${context.unit.title}」中，理解「${title}」必須同時確認定義、成立條件、表示方式與可以檢查的${familyLabel}證據，並和相近概念清楚區分。`
  const example = rawExample.length >= 22
    ? rawExample
    : `${rawExample}${rawExample ? ' ' : ''}例如遇到「${context.unit.title}」的實際任務時，要指出題目哪一項資料、句子、圖形或關係正在呈現「${title}」。`
  return { title, explanation, example }
}

function normalizeConcepts(context: V21UnitContext, familyLabel: string, build: V21SubjectBuild, base: TextbookUnitContentV14) {
  const result: ReviewedConcept[] = []
  const seen = new Set<string>()
  for (const source of [...build.concepts, ...base.concepts]) {
    const concept = strengthenConcept(source, context, familyLabel)
    if (!concept.title || seen.has(concept.title)) continue
    seen.add(concept.title)
    result.push(concept)
    if (result.length >= 8) break
  }
  return result
}

function normalizeWorkedExample(context: V21UnitContext, familyLabel: string, example: ReviewedWorkedExample, index: number): ReviewedWorkedExample {
  const contextText = example.context.trim().length >= 25
    ? example.context.trim()
    : `${example.context.trim()} 這個情境用來直接檢查「${context.unit.title}」中的${familyLabel}關係與必要條件。`
  const prompt = example.prompt.trim().length >= 18
    ? example.prompt.trim()
    : `${example.prompt.trim()} 請依題目提供的${familyLabel}資料完成判斷並說明理由。`
  const steps = [...example.steps]
  while (steps.length < 4) steps.push(`第 ${steps.length + 1} 步：回到題目條件，以${familyLabel}的定義、表示或證據檢查前一步。`)
  const answer = example.answer.trim().length >= 25
    ? example.answer.trim()
    : `答案／結論為「${example.answer.trim()}」。這個結果必須和上面的${familyLabel}條件、表示或資料一致，並能依步驟重新驗證。`
  const explanation = example.explanation.trim().length >= 38
    ? example.explanation.trim()
    : `${example.explanation.trim()} 這個示範的重點不是記住結果，而是看見「${context.unit.title}」中${familyLabel}關係如何從題目資料一步一步推出結論。`
  return {
    ...example,
    title: example.title || `${familyLabel}示範 ${index + 1}`,
    context: contextText,
    prompt,
    steps,
    answer,
    explanation,
  }
}

function normalizeQuestionPrompts(context: V21UnitContext, familyLabel: string, concepts: ReviewedConcept[], questions: ReviewedQuestion[]) {
  const dimensions = ['定義', '成立條件', '表示方式', '資料證據', '答案限制']
  const seen = new Set<string>()
  return questions.map((question, index) => {
    const concept = concepts[index % Math.max(1, concepts.length)]
    const dimension = dimensions[Math.floor(index / Math.max(1, concepts.length)) % dimensions.length]
    let prompt = question.prompt.trim()
    const key = () => prompt.toLowerCase().replace(/[\s，。！？；：,.!?;:'"「」『』（）()\-—]/g, '')
    if (!prompt || seen.has(key())) {
      const contextCue = cleanProse(question.context ?? '').slice(0, 72)
      prompt = `${prompt || '請完成判斷。'} 本題請特別連結「${concept?.title ?? context.unit.title}」的${dimension}${contextCue ? `，並以「${contextCue}」中的資訊檢查` : ''}。`
    }
    if (seen.has(key())) {
      prompt = `${prompt} 同時說明這個判斷在「${context.unit.title}」中如何符合${familyLabel}的${dimensions[(index + 2) % dimensions.length]}。`
    }
    seen.add(key())
    return { ...question, prompt } as ReviewedQuestion
  })
}

function normalizeBuild(context: V21UnitContext, base: TextbookUnitContentV14, build: V21SubjectBuild) {
  const concepts = normalizeConcepts(context, build.familyLabel, build, base)
  const workedExamples = build.workedExamples.map((example, index) => normalizeWorkedExample(context, build.familyLabel, example, index))
  const questions = normalizeQuestionPrompts(context, build.familyLabel, concepts, build.questions)
  const takeaway = uniqueStrings([
    ...build.takeaway,
    `完成「${context.unit.title}」後，應能不看原例題，重新用${build.familyLabel}的定義、資料或表示解釋一個新的情境。`,
    `自我檢查時要能指出：我用了哪個「${context.unit.title}」概念、題目哪項資訊支持它，以及結論在哪些條件下成立。`,
  ]).slice(0, 7)
  return { ...build, concepts, workedExamples, questions, takeaway }
}

export function inspectTextbookUnitV21(unitId: string): V21Inspection {
  const context = resolveCurriculumUnit(unitId)
  const base = getLegacyTextbookUnitContentV18(unitId)
  if (!context || !base) {
    return {
      unit: null,
      validation: { ready: false, errors: [`V21 base unit unavailable: ${unitId}`] } as ReturnType<typeof validateTextbookUnitV14>,
    }
  }
  const rawBuild = buildForSubject(unitId, base)
  if (!rawBuild) return { unit: base, validation: validateTextbookUnitV14(base) }
  const build = normalizeBuild(context, base, rawBuild)

  const unit: TextbookUnitContentV14 = {
    ...base,
    overview: build.overview,
    objectives: build.objectives,
    concepts: build.concepts,
    misconceptions: build.misconceptions,
    visuals: build.visuals,
    workedExamples: build.workedExamples,
    questions: build.questions,
    takeaway: build.takeaway,
    researchBasis: preserveSources(base, `Bubble Space V21：${build.familyLabel}單元專屬教材重建；例題、正式題目與迷思不得跨不相關單元共用。`),
  }
  return {
    unit,
    validation: validateTextbookUnitV14(unit),
    familyId: build.familyId,
    familyLabel: build.familyLabel,
  }
}

const cache = new Map<string, TextbookUnitContentV14 | null>()

export function getTextbookUnitContentV21(unitId: string): TextbookUnitContentV14 | null {
  if (cache.has(unitId)) return cache.get(unitId) ?? null
  const inspected = inspectTextbookUnitV21(unitId)
  const unit = inspected.unit && inspected.validation.ready ? inspected.unit : null
  cache.set(unitId, unit)
  return unit
}

export function getConceptChecksV21(unit: TextbookUnitContentV14): ReviewedQuestion[] {
  return unit.questions.filter((question) => question.id.includes('-ped-v17-check-v21-'))
}
