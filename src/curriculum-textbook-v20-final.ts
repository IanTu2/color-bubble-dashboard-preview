import { getTextbookUnitContentV20Pass1 } from './curriculum-textbook-v20-pass1'
import { CURRICULUM_OFFICIAL_SOURCES } from './curriculum-audit-registry'
import { getCurriculumTrack, resolveCurriculumUnit } from './curriculum-plan-v5'
import type {
  ReviewedChoiceQuestion,
  ReviewedQuestion,
  ReviewedResponseQuestion,
  ReviewedWorkedExample,
} from './curriculum-reviewed-social10'
import type {
  TextbookMisconception,
  TextbookUnitContentV14,
  TextbookVisual,
  TextbookVocabulary,
} from './curriculum-textbook-v14'

type UnitContext = NonNullable<ReturnType<typeof resolveCurriculumUnit>>
type ExtendedQuestion = ReviewedQuestion & { audioText?: string; mediaAssetId?: string }

export type V20ReviewEvidence = {
  scope: {
    mode: 'official-source-linked' | 'platform-extension'
    stage: string
    sourceUrl: string
    sourceLabel: string
    mappingNote: string
  }
  prerequisite: {
    source: string
    check: string
    bridge: string
  }
  reviewedAt: '2026-08-18'
  reviewMethod: 'V20 final internal editorial pass'
}

export type TextbookUnitContentV20Final = TextbookUnitContentV14 & {
  v20ReviewEvidence: V20ReviewEvidence
}

function normalize(value: unknown) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function compact(value: string, max = 96) {
  const clean = normalize(value)
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).replace(/[，、；：,.!?。！？\s]+$/g, '')}…`
}

function stableHash(value: string) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash >>> 0)
}

function stageName(grade: number) {
  if (grade <= 2) return '第一學習階段'
  if (grade <= 4) return '第二學習階段'
  if (grade <= 6) return '第三學習階段'
  if (grade <= 9) return '第四學習階段'
  return '第五學習階段／普通型高中'
}

function officialSource(context: UnitContext) {
  if (context.pathway === 'life') return { label: '生活課程課程綱要', url: CURRICULUM_OFFICIAL_SOURCES.life }
  const key = context.subject as 'chinese' | 'english' | 'math' | 'science' | 'social'
  return { label: `${context.subject}領域課程綱要`, url: CURRICULUM_OFFICIAL_SOURCES[key] }
}

function previousUnit(context: UnitContext) {
  const track = getCurriculumTrack(context.grade, context.subject, context.pathway)
  if (track) {
    const semester = track.semesters.find((item) => item.semester === context.semester)
    if (semester && context.unitIndex > 0) return semester.units[context.unitIndex - 1]
    if (context.semester === 2) {
      const firstSemester = track.semesters.find((item) => item.semester === 1)
      if (firstSemester?.units.length) return firstSemester.units[firstSemester.units.length - 1]
    }
  }
  if (context.grade > 1) {
    const priorTrack = getCurriculumTrack(context.grade - 1, context.subject, context.pathway)
    const priorUnits = priorTrack?.semesters.flatMap((item) => item.units) ?? []
    if (priorUnits.length) return priorUnits[priorUnits.length - 1]
  }
  return null
}

function reviewEvidence(context: UnitContext): V20ReviewEvidence {
  const source = officialSource(context)
  const previous = previousUnit(context)
  const explicit = context.unit.prerequisiteSkills ?? []
  const prerequisiteSource = explicit.length
    ? `課程路線明列先備：${explicit.join('、')}`
    : previous
      ? `前序單元「${previous.title}」：${compact(previous.focus, 70)}`
      : `${stageName(context.grade)}入口診斷：確認進入「${context.unit.title}」前的基本閱讀、表示與任務理解能力。`
  const bridge = previous
    ? `若先備檢核未通過，先回到「${previous.title}」複習與本單元直接相連的概念，再進入「${context.unit.title}」。`
    : `若入口診斷未通過，先用本單元前置複習頁補齊「${compact(context.unit.focus, 62)}」所需基礎，再開始正式例題。`
  const mode = context.grade <= 2 && context.subject === 'english' ? 'platform-extension' : 'official-source-linked'
  return {
    scope: {
      mode,
      stage: stageName(context.grade),
      sourceUrl: source.url,
      sourceLabel: source.label,
      mappingNote: mode === 'platform-extension'
        ? '低年級英語保留平台／校本啟蒙延伸身分；只以正式英語文課綱作能力方向參照，不宣稱全國一致年級進度。'
        : `本單元以「${context.unit.title}」與焦點「${compact(context.unit.focus, 74)}」對照該學習階段的正式領域／科目課綱方向；平台章節名稱不是教育部固定課本目錄。`,
    },
    prerequisite: {
      source: prerequisiteSource,
      check: `進入「${context.unit.title}」前，先以 3 題短診斷確認學生能說明或操作：${compact(explicit.join('、') || previous?.focus || context.unit.focus, 88)}。`,
      bridge,
    },
    reviewedAt: '2026-08-18',
    reviewMethod: 'V20 final internal editorial pass',
  }
}

type QuadraticTask = {
  context: string
  prompt: string
  correct: string
  options: string[]
  explanation: string
}

function quadraticTask(seed: string): QuadraticTask {
  const r1 = 1 + stableHash(`${seed}:r1`) % 4
  const r2 = r1 + 1 + stableHash(`${seed}:r2`) % 3
  const sum = r1 + r2
  const product = r1 * r2
  const correct = `x = ${r1} 或 x = ${r2}`
  return {
    context: `解一元二次方程式 x² - ${sum}x + ${product} = 0；完成後要把兩個根代回原式檢查。`,
    prompt: '用因式分解求出方程式的所有實數解。',
    correct,
    options: [correct, `x = ${sum}`, `x = ${product}`, `x = -${r1} 或 x = -${r2}`],
    explanation: `x² - ${sum}x + ${product} = (x-${r1})(x-${r2})，乘積為 0 時 x=${r1} 或 x=${r2}；兩個值代回原式都成立。`,
  }
}

function repairQuadraticQuestion(question: ReviewedQuestion, index: number): ReviewedQuestion {
  const extra = question as ExtendedQuestion
  if (extra.audioText || extra.mediaAssetId) return question
  const task = quadraticTask(`${question.id}:${index}`)
  if (question.kind === 'choice') {
    const choice = question as ReviewedChoiceQuestion
    return {
      ...choice,
      context: task.context,
      prompt: task.prompt,
      options: task.options,
      correctIndex: 0,
      explanation: task.explanation,
    }
  }
  const response = question as ReviewedResponseQuestion
  return {
    ...response,
    context: task.context,
    prompt: `${task.prompt} 請寫出因式分解、兩個根與至少一次代回驗算。`,
    sampleAnswer: `${task.correct}。${task.explanation}`,
    explanation: task.explanation,
  }
}

function repairQuadraticExample(example: ReviewedWorkedExample, index: number): ReviewedWorkedExample {
  const task = quadraticTask(`worked:${index}`)
  return {
    ...example,
    title: '一元二次方程式｜因式分解、雙根與驗算',
    context: task.context,
    prompt: task.prompt,
    steps: [
      '先確認方程式已整理成 ax²+bx+c=0 的形式。',
      '尋找兩數，使乘積等於常數項、和等於一次項係數的相反數。',
      `把左式寫成兩個一次因式的乘積，令每個因式分別等於 0，得到 ${task.correct}。`,
      '把兩個根各自代回原方程式；兩邊相等才保留該根。',
    ],
    answer: `${task.correct}。`,
    explanation: task.explanation,
  }
}

const QUADRATIC_MISCONCEPTIONS: TextbookMisconception[] = [
  {
    claim: '因式分解後只要找到其中一個根就可以停止。',
    correction: '若 (x-a)(x-b)=0，必須分別檢查 x=a 與 x=b；除非兩根重合，通常要保留兩個根。',
    reason: '零乘積性質表示任一因式為 0 都能使乘積為 0，只寫一個根會漏解。',
  },
  {
    claim: '把 x²-sx+p 直接讀成 x=s 或 x=p。',
    correction: '係數與根不是直接對應；要先完成因式分解或使用公式，再由因式等於 0 求根。',
    reason: '根必須讓原方程式成立，不能把一次項係數或常數項直接當成答案。',
  },
  {
    claim: '算出根後不用代回原式。',
    correction: '至少選一個步驟做代回驗算，確認符號、因式與根沒有抄寫或計算錯誤。',
    reason: '代回原式是檢查解是否真正滿足方程式最直接的方法。',
  },
]

const QUADRATIC_VISUAL: TextbookVisual = {
  id: 'g9-math-s1-u1-v20-final-quadratic-process',
  kind: 'process',
  title: '一元二次方程式：從標準式到兩個根',
  caption: '把「整理 → 因式分解 → 零乘積 → 求根 → 代回」連成同一條可檢查流程。',
  items: [
    { label: '1｜整理', detail: '先把所有項移到同一邊，整理成 ax²+bx+c=0。' },
    { label: '2｜分解', detail: '若可分解，將二次式寫成兩個一次因式的乘積。' },
    { label: '3｜零乘積', detail: '乘積為 0 代表至少一個因式為 0，因此要分別求解。' },
    { label: '4｜驗算', detail: '把每個候選根代回原式，確認等式成立且沒有漏根。' },
  ],
}

const QUADRATIC_VOCABULARY: TextbookVocabulary[] = [
  { term: '一元二次方程式', definition: '只含一個未知數，整理後最高次為 2 的方程式。' },
  { term: '根／解', definition: '代入後能使原方程式成立的未知數值。' },
  { term: '因式分解', definition: '把多項式改寫成若干因式乘積，以利使用零乘積性質求解。' },
]

function repairKnownUnitContamination(unit: TextbookUnitContentV14): TextbookUnitContentV14 {
  if (unit.unitId !== 'g9-math-s1-u1') return unit
  const concepts = unit.concepts.map((concept, index) => {
    const task = quadraticTask(`concept:${index}`)
    return { ...concept, example: `${task.context} ${task.prompt}` }
  })
  return {
    ...unit,
    concepts,
    questions: unit.questions.map(repairQuadraticQuestion),
    workedExamples: unit.workedExamples.map(repairQuadraticExample),
    misconceptions: QUADRATIC_MISCONCEPTIONS,
    visuals: [
      ...unit.visuals.filter((visual) => !/科學記號|10\^|a\s*[×x]\s*10/i.test(normalize(`${visual.title} ${visual.caption} ${(visual.items ?? []).map((item) => `${item.label} ${item.detail}`).join(' ')}`))),
      QUADRATIC_VISUAL,
    ],
    vocabulary: [
      ...unit.vocabulary.filter((item) => !/科學記號|指數律/.test(`${item.term} ${item.definition}`)),
      ...QUADRATIC_VOCABULARY,
    ],
    takeaway: [
      '一元二次方程式先整理成 ax²+bx+c=0，再選擇因式分解或其他合適方法求根。',
      '使用因式分解時要套用零乘積性質，逐一求出所有可能的根。',
      '根必須代回原方程式檢查；不能把係數或常數項直接當成解。',
    ],
  }
}

export function getTextbookUnitContentV20Final(unitId: string): TextbookUnitContentV20Final | null {
  const source = getTextbookUnitContentV20Pass1(unitId)
  const context = resolveCurriculumUnit(unitId)
  if (!source || !context) return null
  const repaired = repairKnownUnitContamination(source)
  return {
    ...repaired,
    v20ReviewEvidence: reviewEvidence(context),
  }
}

const cache = new Map<string, TextbookUnitContentV20Final | null>()

export function getCachedTextbookUnitContentV20Final(unitId: string) {
  if (cache.has(unitId)) return cache.get(unitId) ?? null
  const unit = getTextbookUnitContentV20Final(unitId)
  cache.set(unitId, unit)
  return unit
}
