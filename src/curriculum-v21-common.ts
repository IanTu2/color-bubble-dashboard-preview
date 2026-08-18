import type {
  ReviewedChoiceQuestion,
  ReviewedConcept,
  ReviewedQuestion,
  ReviewedResponseQuestion,
  ReviewedWorkedExample,
} from './curriculum-reviewed-social10'
import { resolveCurriculumUnit } from './curriculum-plan-v5'
import type {
  TextbookMisconception,
  TextbookUnitContentV14,
  TextbookVisual,
} from './curriculum-textbook-v14'

export type V21UnitContext = NonNullable<ReturnType<typeof resolveCurriculumUnit>>

export type V21SubjectBuild = {
  familyId: string
  familyLabel: string
  overview: string
  objectives: string[]
  concepts: ReviewedConcept[]
  misconceptions: TextbookMisconception[]
  visuals: TextbookVisual[]
  workedExamples: ReviewedWorkedExample[]
  questions: ReviewedQuestion[]
  takeaway: string[]
}

export function stableHash(value: string) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash >>> 0)
}

export function seededInt(seed: string | number, min: number, max: number) {
  const value = typeof seed === 'number' ? Math.abs(seed) : stableHash(seed)
  return min + (value % Math.max(1, max - min + 1))
}

export function seededPick<T>(items: readonly T[], seed: string | number): T {
  return items[seededInt(seed, 0, items.length - 1)]
}

export function uniqueStrings(items: string[]) {
  const result: string[] = []
  for (const raw of items) {
    const value = String(raw ?? '').replace(/\s+/g, ' ').trim()
    if (value && !result.includes(value)) result.push(value)
  }
  return result
}

export function choiceQuestion(args: {
  id: string
  level: ReviewedChoiceQuestion['level']
  context?: string
  prompt: string
  correct: string
  distractors: string[]
  explanation: string
}): ReviewedChoiceQuestion {
  const options = uniqueStrings([args.correct, ...args.distractors]).slice(0, 4)
  while (options.length < 4) options.push(`需重新檢查的選項 ${options.length + 1}`)
  const shift = stableHash(args.id) % options.length
  const rotated = [...options.slice(shift), ...options.slice(0, shift)]
  return {
    id: args.id,
    kind: 'choice',
    level: args.level,
    context: args.context,
    prompt: args.prompt,
    options: rotated,
    correctIndex: rotated.indexOf(args.correct),
    explanation: args.explanation,
  }
}

export function responseQuestion(args: {
  id: string
  level: ReviewedResponseQuestion['level']
  context?: string
  prompt: string
  sampleAnswer: string
  explanation: string
  rubric?: string[]
}): ReviewedResponseQuestion {
  return {
    id: args.id,
    kind: 'response',
    level: args.level,
    context: args.context,
    prompt: args.prompt,
    sampleAnswer: args.sampleAnswer,
    explanation: args.explanation,
    ...(args.rubric?.length ? { rubric: args.rubric } : {}),
  } as ReviewedResponseQuestion
}

const SUBJECT_CLOSURES = [
  /重點是回到完整語境[^。！？]*[。！？]?/g,
  /Connect meaning, form, word order, time clues, reference, and register[^.?!]*[.?!]?/gi,
  /重點是把條件轉成可檢查的數學表示[^。！？]*[。！？]?/g,
  /重點是把觀察、模型與推論分開[^。！？]*[。！？]?/g,
  /重點是連同來源、時間、空間尺度與不同群體觀點判讀資料[^。！？]*[。！？]?/g,
  /理解「[^」]+」時，要把它放回「[^」]+」的完整範圍[^。！？]*[。！？]?/g,
  /學習不能只背最後一句[^。！？]*[。！？]?/g,
]

export function cleanProse(value: string) {
  let text = String(value ?? '').replace(/\s+/g, ' ').trim()
  for (const pattern of SUBJECT_CLOSURES) text = text.replace(pattern, ' ')
  return text.replace(/\s+/g, ' ').replace(/^[，。；：,.!?\s]+|[，；：,\s]+$/g, '').trim()
}

export function cleanConcepts(base: TextbookUnitContentV14, fallbackLead: string) {
  const seen = new Set<string>()
  const concepts: ReviewedConcept[] = []
  for (const concept of base.concepts) {
    const title = cleanProse(concept.title)
    if (!title || seen.has(title)) continue
    seen.add(title)
    const explanation = cleanProse(concept.explanation)
    const example = cleanProse(concept.example ?? '')
    concepts.push({
      title,
      explanation: explanation.length >= 28 ? explanation : `${fallbackLead}「${title}」要先辨認定義、條件與可觀察或可驗證的關係，再用本單元的表示方式說明。`,
      ...(example ? { example } : {}),
    })
  }
  return concepts.slice(0, 8)
}

export function conceptTitles(concepts: ReviewedConcept[], max = 6) {
  return concepts.slice(0, max).map((item) => item.title)
}

export function visualSet(args: {
  unitId: string
  familyLabel: string
  concepts: ReviewedConcept[]
  process: Array<{ label: string; detail: string }>
  compare: Array<{ label: string; detail: string }>
}): TextbookVisual[] {
  const conceptItems = args.concepts.slice(0, 6).map((concept, index) => ({
    label: concept.title,
    detail: cleanProse(concept.example ?? concept.explanation).slice(0, 92) || `核心觀念 ${index + 1}`,
  }))
  return [
    {
      id: `${args.unitId}-v21-concept-map`,
      kind: 'concept-map',
      title: `${args.familyLabel}｜核心關係`,
      caption: '用概念之間的關係先建立整體圖像，再進入例題。',
      items: conceptItems,
    },
    {
      id: `${args.unitId}-v21-process`,
      kind: 'process',
      title: `${args.familyLabel}｜解讀／推理流程`,
      caption: '每一步都對應本單元真正需要使用的資料、表示或證據。',
      items: args.process,
    },
    {
      id: `${args.unitId}-v21-comparison`,
      kind: 'comparison',
      title: `${args.familyLabel}｜容易混淆的地方`,
      caption: '比較相近概念的關鍵差異，而不是只提醒「要仔細」。',
      items: args.compare,
    },
  ]
}

export function buildMisconceptions(args: {
  familyLabel: string
  pairs: Array<{ wrong: string; right: string; why: string }>
}): TextbookMisconception[] {
  return args.pairs.map((item) => ({
    claim: item.wrong,
    correction: item.right,
    reason: item.why,
  }))
}

export function formalQuestionSet(args: {
  unitId: string
  familyId: string
  makers: Array<(index: number, id: string, level: ReviewedChoiceQuestion['level']) => ReviewedQuestion>
  count?: number
}) {
  const count = args.count ?? 15
  const levels: ReviewedChoiceQuestion['level'][] = ['理解', '理解', '應用', '應用', '檢核']
  return Array.from({ length: count }, (_, index) => {
    const id = `${args.unitId}-v21-${args.familyId}-q${index + 1}`
    const maker = args.makers[index % args.makers.length]
    return maker(index, id, levels[index % levels.length])
  })
}

export function quickCheckSet(args: {
  unitId: string
  familyId: string
  concepts: ReviewedConcept[]
  maker: (concept: ReviewedConcept, index: number, id: string) => ReviewedQuestion
}) {
  return args.concepts.slice(0, 6).map((concept, index) => args.maker(
    concept,
    index,
    `${args.unitId}-ped-v17-check-v21-${args.familyId}-${index + 1}`,
  ))
}

export function unitOverview(context: V21UnitContext, familyLabel: string, core: string) {
  return `「${context.unit.title}」這一單元聚焦在${core}。學習時會直接操作${familyLabel}真正使用的表示、文本、數據或證據，不用泛用情境代替本單元內容。`
}

export function unitObjectives(context: V21UnitContext, familyLabel: string, skills: string[]) {
  return uniqueStrings([
    `能說明「${context.unit.title}」的核心概念與必要條件。`,
    ...skills.map((skill) => `能${skill}。`),
    `能用${familyLabel}的表示方式解釋答案或結論，而不是只選出結果。`,
    '能辨認本單元常見的具體錯誤，並指出錯誤發生在哪個概念或步驟。',
  ]).slice(0, 6)
}

export function preserveSources(base: TextbookUnitContentV14, note: string) {
  return uniqueStrings([...base.researchBasis, note])
}
