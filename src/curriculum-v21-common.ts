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

function longEnoughExplanation(value: string, fallback: string) {
  const trimmed = String(value ?? '').trim()
  if (trimmed.length >= 28) return trimmed
  return `${trimmed}${trimmed ? ' ' : ''}${fallback}`.trim()
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
  while (options.length < 4) options.push(`資訊不足，不能依題目條件得到此結論（${options.length + 1}）`)
  const shift = stableHash(args.id) % options.length
  const rotated = [...options.slice(shift), ...options.slice(0, shift)]
  const explanation = longEnoughExplanation(
    args.explanation,
    '作答時必須把題目中的具體條件、資料或文本線索和本單元概念連起來檢查。',
  )
  const optionFeedback = rotated.map((option) => option === args.correct
    ? `這個選項符合題目提供的條件與本單元判準。${explanation}`
    : `這個選項與題目中的關鍵條件或本單元判準不一致。請回到題幹提供的資料、文本或數學／科學關係逐項核對。`)
  return {
    id: args.id,
    kind: 'choice',
    level: args.level,
    context: args.context,
    prompt: args.prompt,
    options: rotated,
    correctIndex: rotated.indexOf(args.correct),
    explanation,
    optionFeedback,
  } as ReviewedChoiceQuestion
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
  const sampleAnswer = args.sampleAnswer.trim().length >= 48
    ? args.sampleAnswer.trim()
    : `${args.sampleAnswer.trim()} 完整作答還要指出題目中的具體條件、資料、文本或表示，並說明它如何支持這個結論。`
  const explanation = longEnoughExplanation(
    args.explanation,
    '本題重點是把答案和題目中的實際證據或關係連結，不能只寫一個沒有理由的結論。',
  )
  return {
    id: args.id,
    kind: 'response',
    level: args.level,
    context: args.context,
    prompt: args.prompt,
    sampleAnswer,
    explanation,
    rubric: args.rubric?.length && args.rubric.length >= 3
      ? args.rubric
      : ['回答本題核心要求', '使用至少一項題目中的具體證據或關係', '清楚說明證據如何支持結論並檢查限制'],
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
    const rawExplanation = cleanProse(concept.explanation)
    const rawExample = cleanProse(concept.example ?? '')
    const explanation = rawExplanation.length >= 58
      ? rawExplanation
      : `${rawExplanation}${rawExplanation ? ' ' : ''}${fallbackLead}判斷「${title}」時，要把定義、成立條件、表示方式與可以檢查的證據連起來，並和相近概念區分。`
    const example = rawExample.length >= 22
      ? rawExample
      : `${rawExample}${rawExample ? ' ' : ''}例如在本單元的實際題目中，要先指出「${title}」出現在哪個資料、句子、圖形或關係，再據此完成判斷。`
    concepts.push({ title, explanation, example })
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
    detail: cleanProse(concept.example ?? concept.explanation).slice(0, 110) || `核心觀念 ${index + 1}`,
  }))
  const comparisonItems = args.compare.length >= 4
    ? args.compare
    : [...args.compare, ...conceptItems.map((item) => ({ label: `辨析｜${item.label}`, detail: item.detail }))].slice(0, 4)
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
      items: comparisonItems,
    },
  ]
}

export function buildMisconceptions(args: {
  familyLabel: string
  unitTitle?: string
  pairs: Array<{ wrong: string; right: string; why: string }>
}): TextbookMisconception[] {
  const anchor = args.unitTitle ? `「${args.unitTitle}」` : `「${args.familyLabel}」`
  const expanded = [...args.pairs]
  if (expanded.length < 3) {
    expanded.push({
      wrong: `在${anchor}中，只要看到熟悉的關鍵詞，就可以直接套用以前的結論，不需要區分這一單元的定義、條件與表示。`,
      right: `處理${anchor}時，要先確認這一單元真正使用的定義與成立條件，再依題目中的文本、數據、圖形、語法或證據決定是否能套用結論。`,
      why: `相似詞語或表面形式可能出現在不同概念中；若忽略${args.familyLabel}的關鍵條件，容易把相近但不等同的情況混為一談。`,
    })
  }
  if (expanded.length < 4) {
    expanded.push({
      wrong: `只要${anchor}最後得到一個看起來合理的答案，就可以省略中間用到的關係、資料來源、語境或適用範圍。`,
      right: `即使結果看起來合理，也要能指出${anchor}中使用了哪個${args.familyLabel}關係，以及題目哪些具體資訊真正支持這個結果。`,
      why: `同一個表面結果可能由錯誤推理碰巧得到；保留可重做的證據鏈、計算、文本線索或制度條件，才能判斷答案是否真的成立。`,
    })
  }
  return expanded.slice(0, 5).map((item) => ({
    claim: item.wrong.trim().length >= 26 ? item.wrong : `${item.wrong} 這種判斷忽略了${anchor}中的必要條件與資訊。`,
    correction: item.right.trim().length >= 26 ? item.right : `${item.right} 判斷時必須回到${anchor}的定義、條件與具體證據。`,
    reason: item.why.trim().length >= 36 ? item.why : `${item.why} 因為${args.familyLabel}中的概念需要由具體條件、表示或證據區分，不能只靠表面相似。`,
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
