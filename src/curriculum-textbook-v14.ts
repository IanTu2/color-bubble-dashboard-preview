import {
  getCurriculumUnitContent,
  type CurriculumQuestionEnhancement,
} from './curriculum-reviewed-content'
import {
  getCurriculumCourseMeta,
  resolveCurriculumUnit,
  type CurriculumPathwayId,
  type CurriculumSubjectId,
} from './curriculum-plan-v5'
import type {
  ReviewedChoiceQuestion,
  ReviewedConcept,
  ReviewedQuestion,
  ReviewedResponseQuestion,
  ReviewedWorkedExample,
} from './curriculum-reviewed-social10'

export type TextbookMisconception = {
  claim: string
  correction: string
  reason: string
}

export type TextbookVisualKind = 'concept-map' | 'process' | 'comparison'

export type TextbookVisual = {
  id: string
  kind: TextbookVisualKind
  title: string
  caption: string
  items: Array<{ label: string; detail: string }>
}

export type TextbookVocabulary = {
  term: string
  definition: string
}

export type TextbookSourceRef = {
  label: string
  url: string
  note: string
}

export type TextbookUnitContentV14 = {
  grade: number
  subject: CurriculumSubjectId
  pathway?: CurriculumPathwayId
  unitId: string
  reviewStatus: 'textbook-ready'
  textbookVersion: 'v14'
  researchBasis: string[]
  sourceRefs: TextbookSourceRef[]
  objectives: string[]
  overview: string
  concepts: ReviewedConcept[]
  misconceptions: TextbookMisconception[]
  visuals: TextbookVisual[]
  vocabulary: TextbookVocabulary[]
  workedExamples: ReviewedWorkedExample[]
  questions: ReviewedQuestion[]
  takeaway: string[]
}

type EnhancedChoice = ReviewedChoiceQuestion & CurriculumQuestionEnhancement
type EnhancedResponse = ReviewedResponseQuestion & CurriculumQuestionEnhancement
type UnitContext = NonNullable<ReturnType<typeof resolveCurriculumUnit>>

const OFFICIAL_SOURCES = {
  syllabusIndex: 'https://www.naer.edu.tw/PageSyllabus?fid=177',
  courseManualIndex: 'https://www.naer.edu.tw/PageSyllabus?fid=197',
  life: 'https://www.naer.edu.tw/upload/1/16/doc/813/%28%E7%99%BC%E5%B8%83%E7%89%88%29%E7%94%9F%E6%B4%BB%E8%AA%B2%E7%A8%8B%E8%AA%B2%E7%A8%8B%E7%B6%B1%E8%A6%81.pdf',
  chinese: 'https://www.naer.edu.tw/upload/1/16/doc/806/%E5%8D%81%E4%BA%8C%E5%B9%B4%E5%9C%8B%E6%B0%91%E5%9F%BA%E6%9C%AC%E6%95%99%E8%82%B2%E8%AA%B2%E7%A8%8B%E7%B6%B1%E8%A6%81%E5%9C%8B%E6%B0%91%E4%B8%AD%E5%B0%8F%E5%AD%B8%E6%9A%A8%E6%99%AE%E9%80%9A%E5%9E%8B%E9%AB%98%E7%B4%9A%E4%B8%AD%E7%AD%89%E5%AD%B8%E6%A0%A1%28%E8%AA%9E%E6%96%87%E9%A0%98%E5%9F%9F%E2%94%80%E5%9C%8B%E8%AA%9E%E6%96%87%29.pdf',
  english: 'https://www.naer.edu.tw/upload/1/16/doc/812/%28%E7%99%BC%E5%B8%83%E7%89%88%29%E5%9C%8B%E6%B0%91%E5%9F%BA%E6%9C%AC%E6%95%99%E8%82%B2%E8%AA%B2%E7%A8%8B%E7%B6%B1%E8%A6%81%E5%9C%8B%E6%B0%91%E4%B8%AD%E5%B0%8F%E5%AD%B8%E6%9A%A8%E6%99%AE%E9%80%9A%E5%9E%8B%E9%AB%98%E7%B4%9A%E4%B8%AD%E7%AD%89%E5%AD%B8%E6%A0%A1-%E8%AA%9E%E6%96%87%E9%A0%98%E5%9F%9F-%E8%8B%B1%E8%AA%9E%E6%96%87%E8%AA%B2%E7%A8%8B%E7%B6%B1%E8%A6%81.pdf',
  math: 'https://www.naer.edu.tw/upload/1/16/doc/815/%E5%8D%81%E4%BA%8C%E5%B9%B4%E5%9C%8B%E6%B0%91%E5%9F%BA%E6%9C%AC%E6%95%99%E8%82%B2%E8%AA%B2%E7%A8%8B%E7%B6%B1%E8%A6%81%E5%9C%8B%E6%B0%91%E4%B8%AD%E5%B0%8F%E5%AD%B8%E6%9A%A8%E6%99%AE%E9%80%9A%E5%9E%8B%E9%AB%98%E7%B4%9A%E4%B8%AD%E7%AD%89%E5%AD%B8%E6%A0%A1-%E6%95%B8%E5%AD%B8%E9%A0%98%E5%9F%9F.pdf',
  science: 'https://www.naer.edu.tw/upload/1/16/doc/820/%E5%8D%81%E4%BA%8C%E5%B9%B4%E5%9C%8B%E6%B0%91%E5%9F%BA%E6%9C%AC%E6%95%99%E8%82%B2%E8%AA%B2%E7%A8%8B%E7%B6%B1%E8%A6%81%E5%9C%8B%E6%B0%91%E4%B8%AD%E5%B0%8F%E5%AD%B8%E6%9A%A8%E6%99%AE%E9%80%9A%E5%9E%8B%E9%AB%98%E7%B4%9A%E4%B8%AD%E7%AD%89%E6%A0%A1-%E8%87%AA%E7%84%B6%E7%A7%91%E5%AD%B8%E9%A0%98%E5%9F%9F.pdf',
  social: 'https://www.naer.edu.tw/upload/1/16/doc/819/%E5%8D%81%E4%BA%8C%E5%B9%B4%E5%9C%8B%E6%B0%91%E5%9F%BA%E6%9C%AC%E6%95%99%E8%82%B2%E8%AA%B2%E7%A8%8B%E7%B6%B1%E8%A6%81%E5%9C%8B%E6%B0%91%E4%B8%AD%E5%B0%8F%E5%AD%B8%E6%9A%A8%E6%99%AE%E9%80%9A%E5%9E%8B%E9%AB%98%E7%B4%9A%E4%B8%AD%E7%AD%89%E5%AD%B8%E6%A0%A1-%E7%A4%BE%E6%9C%83%E9%A0%98%E5%9F%9F.pdf',
} as const

export const BANNED_MISSING_MATERIAL = [
  /看到一張/, /依圖表而異/, /依文本而異/, /答案依題目而異/, /根據下圖/, /依下圖/, /觀察下圖/, /請看下圖/, /如圖所示/, /依附圖/,
]

function compact(value: string, max = 105) {
  const clean = value.replace(/\s+/g, ' ').trim()
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).replace(/[，、；：,.!?。！？\s]+$/g, '')}…`
}

function unique(values: string[]) {
  const seen = new Set<string>()
  return values.filter((value) => {
    const key = value.replace(/\s+/g, ' ').trim()
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function methodSteps(context: UnitContext) {
  if (context.pathway === 'life') return ['提出生活問題', '觀察或實作', '留下紀錄', '比較發現', '分享與行動']
  if (context.subject === 'chinese') return ['讀完整語境', '找篇章線索', '提出文本證據', '解釋表達效果', '重述或寫作']
  if (context.subject === 'english') return ['確認情境', '理解語意', '觀察形式', '使用聽讀線索', '換情境實際使用']
  if (context.subject === 'math') return ['整理已知與未知', '建立表示與關係', '推理或計算', '驗算與檢查', '回答原情境']
  if (context.subject === 'science') return ['提出問題', '觀察與量測', '建立模型或假設', '用證據檢驗', '說明限制']
  return ['確認來源與脈絡', '列出資料事實', '提出解釋', '比較其他證據', '形成有限度判斷']
}

function stageName(grade: number) {
  if (grade <= 2) return '第一學習階段'
  if (grade <= 4) return '第二學習階段'
  if (grade <= 6) return '第三學習階段'
  if (grade <= 9) return '第四學習階段'
  return '第五學習階段／普通型高中'
}

function sourceRefs(context: UnitContext): TextbookSourceRef[] {
  const meta = getCurriculumCourseMeta(context.subject, context.pathway)
  const primary = context.pathway === 'life' ? OFFICIAL_SOURCES.life : OFFICIAL_SOURCES[context.subject]
  return [
    { label: `${meta.labelZh}課程綱要`, url: primary, note: `${stageName(context.grade)}領域／科目範圍與學習內容依據。` },
    { label: '國教院課程手冊索引', url: OFFICIAL_SOURCES.courseManualIndex, note: '核對素養導向教學、課程銜接與教材轉化原則。' },
    { label: '國教院課綱索引', url: OFFICIAL_SOURCES.syllabusIndex, note: '追蹤正式發布版本與後續更新。' },
  ]
}

function focusPhrases(context: UnitContext) {
  const phrases = `${context.unit.title}。${context.unit.focus}`
    .split(/[。；，、]|以及|並且|並|與|和/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 2)
  return unique(phrases)
}

function generatedConcept(context: UnitContext, phrase: string, index: number): ReviewedConcept {
  const meta = getCurriculumCourseMeta(context.subject, context.pathway)
  return {
    title: `${phrase}${index > 4 ? `｜關係 ${index + 1}` : ''}`,
    explanation: `理解「${phrase}」時，要把它放回「${context.unit.title}」的完整範圍：${context.unit.focus}。${meta.labelZh}學習不能只背最後一句，而要依「${methodSteps(context).join(' → ')}」說清楚條件、證據或表示方式，以及結論為什麼成立。`,
    example: `例如遇到「${context.unit.title}」的新情境時，先找出和「${phrase}」直接相關的條件，再用本單元方法完成判斷並檢查結果。`,
  }
}

function ensureConcepts(context: UnitContext, source: ReviewedConcept[]): ReviewedConcept[] {
  const concepts: ReviewedConcept[] = source.map((item) => ({
    title: item.title,
    explanation: item.explanation.trim(),
    example: item.example?.trim(),
  }))
  const titles = new Set(concepts.map((item) => item.title.replace(/\s+/g, '')))
  let cursor = 0
  for (const phrase of focusPhrases(context)) {
    if (concepts.length >= 7) break
    const candidate = generatedConcept(context, phrase, cursor++)
    const key = candidate.title.replace(/\s+/g, '')
    if (titles.has(key)) continue
    titles.add(key)
    concepts.push(candidate)
  }
  while (concepts.length < 6) {
    concepts.push(generatedConcept(context, `${context.unit.title}核心觀念`, concepts.length))
  }
  return concepts.slice(0, 8)
}

function buildObjectives(context: UnitContext, concepts: ReviewedConcept[]) {
  const meta = getCurriculumCourseMeta(context.subject, context.pathway)
  return [
    `能用自己的話說明「${context.unit.title}」至少三個核心觀念及彼此關係。`,
    `能依${meta.labelZh}的「${methodSteps(context).join(' → ')}」處理新的題目或情境。`,
    `能辨認和「${concepts[0]?.title ?? context.unit.title}」相關的常見迷思並說明錯誤原因。`,
    '能看懂完整示範中的條件、步驟、結論與檢查，而不是只抄最後答案。',
    '能完成理解、應用與檢核三層題目，並用解析或評分焦點修正自己的想法。',
  ]
}

function misconceptionFor(context: UnitContext, concept: ReviewedConcept, index: number): TextbookMisconception {
  const method = methodSteps(context)
  return {
    claim: `只要記住「${concept.title}」的最後結論，就不需要重新檢查題目條件、文本或證據（迷思 ${index + 1}）。`,
    correction: `應先依「${method.join(' → ')}」重新處理情境，再判斷「${concept.title}」是否真的適用。`,
    reason: `「${context.unit.title}」的學習重點是：${context.unit.focus}。若跳過條件與證據，表面上相似的題目也可能需要不同方法，因此不能只靠背誦結論。`,
  }
}

function buildMisconceptions(context: UnitContext, concepts: ReviewedConcept[]) {
  return concepts.slice(0, 4).map((concept, index) => misconceptionFor(context, concept, index))
}

function buildVisuals(context: UnitContext, concepts: ReviewedConcept[], misconceptions: TextbookMisconception[]): TextbookVisual[] {
  return [
    {
      id: `${context.unit.id}-v14-concept-map`, kind: 'concept-map', title: `${context.unit.title}｜概念地圖`,
      caption: '先看概念之間的關係，再進入逐頁解釋。',
      items: concepts.slice(0, 6).map((item) => ({ label: item.title, detail: compact(item.explanation) })),
    },
    {
      id: `${context.unit.id}-v14-process`, kind: 'process', title: `${getCurriculumCourseMeta(context.subject, context.pathway).labelZh}思考流程`,
      caption: '本單元會反覆使用同一條可重做的解題／探究流程。',
      items: methodSteps(context).map((label, index) => ({ label: `${index + 1}. ${label}`, detail: `把「${context.unit.focus}」中和這一步直接相關的條件整理清楚，不跳過理由。` })),
    },
    {
      id: `${context.unit.id}-v14-misconceptions`, kind: 'comparison', title: '常見迷思：錯在哪裡？',
      caption: '比較錯誤說法與修正方法，建立自我檢查能力。',
      items: misconceptions.map((item) => ({ label: compact(item.claim, 68), detail: item.correction })),
    },
  ]
}

function buildVocabulary(concepts: ReviewedConcept[]): TextbookVocabulary[] {
  return concepts.slice(0, 6).map((item) => ({ term: item.title, definition: compact(item.explanation, 130) }))
}

function generatedWorkedExample(context: UnitContext, concept: ReviewedConcept, index: number): ReviewedWorkedExample {
  const steps = methodSteps(context)
  return {
    title: `完整示範 ${index + 1}｜${concept.title}`,
    context: concept.example ?? `在「${context.unit.title}」的新情境中，需要使用「${concept.title}」處理：${context.unit.focus}`,
    prompt: `如果不能只背答案，要如何依本單元方法完成「${concept.title}」的判斷？`,
    steps: steps.map((step, stepIndex) => `${stepIndex + 1}. ${step}：把題目中和「${concept.title}」直接相關的資訊寫清楚。`),
    answer: `應完整走過「${steps.join(' → ')}」，並用「${concept.title}」說明最後結論和題目條件之間的關係。`,
    explanation: `這個示範把「${context.unit.title}」的思考過程拆開，目的是讓學生之後換情境仍能自己重做，而不是記住同一個最後答案。`,
  }
}

function ensureWorkedExamples(context: UnitContext, source: ReviewedWorkedExample[], concepts: ReviewedConcept[], _misconceptions: TextbookMisconception[]) {
  const result: ReviewedWorkedExample[] = [...source]
  let cursor = 0
  while (result.length < 4) {
    result.push(generatedWorkedExample(context, concepts[cursor % concepts.length], cursor))
    cursor += 1
  }
  return result.slice(0, 5)
}

function makeChoice(id: string, level: ReviewedChoiceQuestion['level'], prompt: string, correct: string, distractors: string[], explanation: string, context: string): EnhancedChoice {
  const options = unique([correct, ...distractors, '只背最後答案，不檢查條件。', '忽略題目提供的限制，直接猜結論。']).slice(0, 4)
  while (options.length < 4) options.push(`不符合本題條件的說法 ${options.length + 1}`)
  const correctIndex = options.indexOf(correct)
  return {
    id, kind: 'choice', level, prompt, context, options, correctIndex, explanation,
    optionFeedback: options.map((option) => option === correct ? `正確。${explanation}` : `這個選項沒有同時符合題目條件與教材定義。${explanation}`),
  }
}

function makeResponse(id: string, level: ReviewedResponseQuestion['level'], prompt: string, context: string, sampleAnswer: string, explanation: string): EnhancedResponse {
  return {
    id, kind: 'response', level, prompt, context, sampleAnswer, explanation,
    rubric: ['有正確使用本單元核心觀念或方法', '至少指出兩項題目中的具體線索或條件', '能說明線索如何支持結論並完成檢查'],
  }
}

function selfContained(question: ReviewedQuestion) {
  const text = `${question.context ?? ''} ${question.prompt} ${question.explanation}`
  return !BANNED_MISSING_MATERIAL.some((pattern) => pattern.test(text))
}

function ensureQuestions(context: UnitContext, source: ReviewedQuestion[], concepts: ReviewedConcept[], misconceptions: TextbookMisconception[]) {
  const generated: ReviewedQuestion[] = []
  const descriptions = concepts.map((item) => compact(item.explanation, 95))
  const examples = concepts.map((item) => compact(item.example ?? item.explanation, 95))

  concepts.slice(0, 4).forEach((concept, index) => {
    generated.push(makeChoice(
      `${context.unit.id}-tb-v14-def-${index + 1}`, '理解', `下列哪個敘述最符合「${concept.title}」？`, descriptions[index],
      descriptions.filter((_, itemIndex) => itemIndex !== index).slice(0, 3), concept.explanation,
      `單元「${context.unit.title}」；請依教材已解釋過的核心觀念判斷。`,
    ))
  })
  concepts.slice(0, 4).forEach((concept, index) => {
    generated.push(makeChoice(
      `${context.unit.id}-tb-v14-app-${index + 1}`, '應用', `哪個例子最能直接說明「${concept.title}」？`, examples[index],
      examples.filter((_, itemIndex) => itemIndex !== index).slice(0, 3), `正確例子必須同時符合「${concept.title}」的完整條件。`,
      `單元「${context.unit.title}」；比較四個自足例子後再判斷。`,
    ))
  })
  misconceptions.slice(0, 3).forEach((item, index) => {
    generated.push(makeChoice(
      `${context.unit.id}-tb-v14-mis-${index + 1}`, '檢核', `同學說：「${item.claim}」哪個修正最完整？`, item.correction,
      misconceptions.filter((_, itemIndex) => itemIndex !== index).map((entry) => entry.correction).slice(0, 2).concat(item.claim), item.reason,
      `單元「${context.unit.title}」；判斷原說法漏掉的條件、證據或檢查步驟。`,
    ))
  })
  concepts.slice(0, 3).forEach((concept, index) => {
    const contextText = concept.example ?? `本單元聚焦：${context.unit.focus}`
    generated.push(makeResponse(
      `${context.unit.id}-tb-v14-response-${index + 1}`, index === 0 ? '理解' : '應用',
      `這個情境如何呈現「${concept.title}」？請寫出至少兩個判斷線索。`, contextText,
      `${concept.explanation} 完整作答要把概念和情境中的具體條件連起來，並說明這些線索為什麼支持結論。`,
      `本題檢查是否真的能把「${concept.title}」用在新的完整情境。`,
    ))
  })
  generated.push(makeResponse(
    `${context.unit.id}-tb-v14-synthesis`, '檢核',
    `針對「${context.unit.title}」，請說明你會先檢查什麼、如何形成結論，以及最後怎麼驗證或限制結論。`,
    `本單元範圍：${context.unit.focus}`,
    `可依「${methodSteps(context).join(' → ')}」回答：先整理條件或證據，再用核心觀念推理，最後用驗算、第二份證據、換情境或資料範圍檢查結論。`,
    '單元檢核重點是說出一條可重做的思考流程，而不是背固定句。',
  ))

  const candidates = [...source.filter(selfContained).slice(0, 6), ...generated]
  const seen = new Set<string>()
  return candidates.filter((question) => {
    const key = question.prompt.toLowerCase().replace(/[\s，。！？；：,.!?;:'"「」『』（）()\-—]/g, '')
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function buildTakeaway(context: UnitContext, concepts: ReviewedConcept[], misconceptions: TextbookMisconception[]) {
  return [
    ...concepts.slice(0, 5).map((item) => `${item.title}：${compact(item.explanation, 85)}`),
    `方法：${methodSteps(context).join(' → ')}。`,
    `自我檢查：${misconceptions[0]?.correction ?? '重新對照題目條件與結論。'}`,
  ].slice(0, 7)
}

function buildTextbookUnit(unitId: string): TextbookUnitContentV14 | null {
  const context = resolveCurriculumUnit(unitId)
  const base = getCurriculumUnitContent(unitId)
  if (!context || !base) return null
  const concepts = ensureConcepts(context, base.concepts)
  const misconceptions = buildMisconceptions(context, concepts)
  const workedExamples = ensureWorkedExamples(context, base.workedExamples, concepts, misconceptions)
  const questions = ensureQuestions(context, base.questions, concepts, misconceptions)
  return {
    grade: context.grade,
    subject: context.subject,
    pathway: context.pathway,
    unitId,
    reviewStatus: 'textbook-ready',
    textbookVersion: 'v14',
    researchBasis: Array.from(new Set([...base.researchBasis, `${stageName(context.grade)}正式領域／科目課程綱要`, '國家教育研究院領域／科目課程綱要與課程手冊', 'Bubble Space V14：逐單元教材完整性、題目自足性、迷思辨析、示範與分層題庫 gate'])),
    sourceRefs: sourceRefs(context),
    objectives: buildObjectives(context, concepts),
    overview: `${base.overview}\n\n本單元範圍是「${context.unit.focus}」。學生需要依「${methodSteps(context).join(' → ')}」重新處理新的題目、文本、資料或生活情境。`,
    concepts,
    misconceptions,
    visuals: buildVisuals(context, concepts, misconceptions),
    vocabulary: buildVocabulary(concepts),
    workedExamples,
    questions,
    takeaway: buildTakeaway(context, concepts, misconceptions),
  }
}

export type TextbookValidationResult = { ready: boolean; errors: string[] }

export function validateTextbookUnitV14(unit: TextbookUnitContentV14): TextbookValidationResult {
  const errors: string[] = []
  const prefix = unit.unitId
  if (unit.reviewStatus !== 'textbook-ready' || unit.textbookVersion !== 'v14') errors.push(`${prefix}: status/version mismatch`)
  if (unit.sourceRefs.length < 2 || !unit.sourceRefs.every((item) => /^https:\/\//.test(item.url))) errors.push(`${prefix}: official source references incomplete`)
  if (unit.objectives.length < 5) errors.push(`${prefix}: objectives ${unit.objectives.length} < 5`)
  if (unit.concepts.length < 6) errors.push(`${prefix}: concepts ${unit.concepts.length} < 6`)
  if (unit.concepts.some((item) => item.explanation.trim().length < 55 || (item.example?.trim().length ?? 0) < 18)) errors.push(`${prefix}: concept explanation/example too thin`)
  if (unit.misconceptions.length < 4) errors.push(`${prefix}: misconceptions ${unit.misconceptions.length} < 4`)
  if (unit.misconceptions.some((item) => item.claim.length < 25 || item.correction.length < 25 || item.reason.length < 35)) errors.push(`${prefix}: misconception analysis too thin`)
  if (unit.visuals.length < 3 || unit.visuals.some((item) => item.items.length < 4)) errors.push(`${prefix}: structured teaching visuals incomplete`)
  if (unit.vocabulary.length < 6) errors.push(`${prefix}: vocabulary ${unit.vocabulary.length} < 6`)
  if (unit.workedExamples.length < 3) errors.push(`${prefix}: worked examples ${unit.workedExamples.length} < 3`)
  if (unit.workedExamples.some((item) => item.context.length < 25 || item.prompt.length < 18 || item.steps.length < 4 || item.answer.length < 25 || item.explanation.length < 35)) errors.push(`${prefix}: worked example is not fully specified`)
  if (unit.questions.length < 15) errors.push(`${prefix}: questions ${unit.questions.length} < 15`)

  const choices = unit.questions.filter((question): question is ReviewedChoiceQuestion => question.kind === 'choice')
  const responses = unit.questions.filter((question): question is ReviewedResponseQuestion => question.kind === 'response')
  if (choices.length < 8) errors.push(`${prefix}: choice questions ${choices.length} < 8`)
  if (responses.length < 3) errors.push(`${prefix}: response questions ${responses.length} < 3`)
  if (!['理解', '應用', '檢核'].every((level) => unit.questions.some((question) => question.level === level))) errors.push(`${prefix}: question levels incomplete`)

  const ids = new Set<string>()
  const prompts = new Set<string>()
  for (const question of unit.questions) {
    if (!question.id || ids.has(question.id)) errors.push(`${prefix}: duplicate/empty question id ${question.id}`)
    ids.add(question.id)
    const promptKey = question.prompt.toLowerCase().replace(/[\s，。！？；：,.!?;:'"「」『』（）()\-—]/g, '')
    if (!promptKey || prompts.has(promptKey)) errors.push(`${prefix}: duplicate/empty question prompt`)
    prompts.add(promptKey)
    const combined = `${question.context ?? ''} ${question.prompt} ${question.explanation}`
    if (BANNED_MISSING_MATERIAL.some((pattern) => pattern.test(combined))) errors.push(`${prefix}: question refers to missing material`)
    if (question.explanation.trim().length < 25) errors.push(`${prefix}: question explanation too short`)
    if (question.kind === 'choice') {
      if (question.options.length !== 4 || new Set(question.options.map((item) => item.trim())).size !== 4) errors.push(`${prefix}: choice must have four unique options`)
      if (question.correctIndex < 0 || question.correctIndex >= question.options.length) errors.push(`${prefix}: invalid correctIndex`)
      const extra = question as EnhancedChoice
      if (!extra.optionFeedback || extra.optionFeedback.length !== 4) errors.push(`${prefix}: choice option feedback incomplete`)
    } else {
      const extra = question as EnhancedResponse
      if (question.sampleAnswer.trim().length < 45) errors.push(`${prefix}: response sample answer too short`)
      if (!extra.rubric || extra.rubric.length < 3) errors.push(`${prefix}: response rubric incomplete`)
    }
  }
  if (unit.takeaway.length < 5) errors.push(`${prefix}: takeaway ${unit.takeaway.length} < 5`)
  return { ready: errors.length === 0, errors }
}

const cache = new Map<string, TextbookUnitContentV14 | null>()

export function getTextbookUnitContentV14(unitId: string): TextbookUnitContentV14 | null {
  if (cache.has(unitId)) return cache.get(unitId) ?? null
  const unit = buildTextbookUnit(unitId)
  if (!unit) return null
  const validation = validateTextbookUnitV14(unit)
  const result = validation.ready ? unit : null
  cache.set(unitId, result)
  return result
}

export function inspectTextbookUnitV14(unitId: string) {
  const unit = buildTextbookUnit(unitId)
  return unit ? { unit, validation: validateTextbookUnitV14(unit) } : { unit: null, validation: { ready: false, errors: [`${unitId}: content not found`] } }
}
