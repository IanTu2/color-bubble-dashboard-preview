import { getCurriculumTrack, type CurriculumDifficultyBand, type CurriculumSubjectId, type CurriculumUnitPlan } from './curriculum-plan'

export type CurriculumLessonKind = 'launch' | 'concept' | 'example' | 'guided' | 'practice' | 'assessment'

export type CurriculumLessonPlan = {
  id: string
  unitId: string
  order: number
  kind: CurriculumLessonKind
  title: string
  objective: string
  teachingFocus: string
  learnerTask: string
  successCriteria: string[]
  estimatedMinutes: number
  difficultyBand: CurriculumDifficultyBand
  prerequisiteSkills: string[]
}

export type CurriculumUnitBundle = CurriculumUnitPlan & {
  lessons: CurriculumLessonPlan[]
}

export type CurriculumCourseBundle = {
  grade: number
  subject: CurriculumSubjectId
  sourceBasis: string
  note?: string
  semesters: Array<{
    semester: 1 | 2
    units: CurriculumUnitBundle[]
  }>
}

const SUBJECT_PEDAGOGY: Record<CurriculumSubjectId, {
  launch: string
  concept: string
  example: string
  guided: string
  practice: string
  assessment: string
  criteria: string[]
}> = {
  chinese: {
    launch: '從文本、生活情境或語文現象提出問題，先讀懂今天要處理的語文任務。',
    concept: '整理字詞、篇章結構、文體特色或閱讀策略，建立可重複使用的語文觀念。',
    example: '用短文、句子或段落示範如何找線索、做推論、比較表達效果。',
    guided: '依提示完成標記、改寫、排序、摘要或段落分析，逐步把策略用出來。',
    practice: '換一篇新文本或新題型獨立練習，並要求說明判斷依據。',
    assessment: '整合閱讀、語文知識與表達，完成單元檢核與短篇輸出。',
    criteria: ['能找到文本中的關鍵線索', '能用自己的話說明理解結果', '能把策略用在新的文本或表達任務'],
  },
  english: {
    launch: '用圖片、簡短對話、聲音或生活任務建立情境，先理解要表達的意思。',
    concept: '整理本單元核心字彙、句型、語音或閱讀規則，先建立可理解的語言框架。',
    example: '以完整句子與短對話示範目標語言如何出現在真實情境。',
    guided: '透過聽辨、配對、挖空、重組或跟讀，在提示下完成輸入與輸出。',
    practice: '改用新的生活情境獨立完成聽說讀寫任務，不只背單字翻譯。',
    assessment: '以短篇閱讀、聽力與情境表達檢查是否能真正理解並使用本單元語言。',
    criteria: ['能理解核心字詞與句型', '能在完整語境中辨識或使用目標語言', '能完成符合年級程度的聽讀或簡短表達'],
  },
  math: {
    launch: '從可觀察的數量、圖形或生活問題切入，先猜想規律與需要解決的問題。',
    concept: '用圖像、符號與語言建立定義、性質、公式或運算規則，說清楚為什麼成立。',
    example: '完整示範一題，逐步標出已知、策略、計算與檢查，不只給答案。',
    guided: '把新題拆成小步驟，在每一步判斷應使用哪個觀念與理由。',
    practice: '安排基礎題、變化題與情境題，區分觀念錯誤、列式錯誤與計算錯誤。',
    assessment: '用跨題型單元檢核確認學生能選擇方法、完成計算並解釋結果。',
    criteria: ['能說明使用哪個數學觀念', '能完成關鍵步驟並檢查答案合理性', '能把方法轉用到不同形式的問題'],
  },
  science: {
    launch: '從生活現象、圖片、觀察或簡單實驗提出可探究的問題。',
    concept: '整理觀察證據與核心科學概念，區分現象、推論與解釋。',
    example: '用資料、圖表、模型或實驗結果示範如何由證據形成科學解釋。',
    guided: '在提示下預測、觀察、分類、測量或解讀資料，練習探究步驟。',
    practice: '換一組資料或情境，獨立判讀變因、證據、因果與限制。',
    assessment: '以現象解釋、資料判讀與探究設計完成單元檢核。',
    criteria: ['能區分觀察結果與推論', '能用證據支持科學解釋', '能把概念用於新的自然現象或資料'],
  },
  social: {
    launch: '從地圖、時間軸、人物、公共議題或生活案例提出需要理解的社會問題。',
    concept: '建立時間、空間、制度、文化、經濟或公民概念，釐清重要名詞與關係。',
    example: '用史料、地圖、統計圖表或案例示範如何判讀來源與因果。',
    guided: '在提示下比較資料、排序事件、找地理關係或辨識不同立場。',
    practice: '面對新的資料與公共情境，提出有依據的判斷，而不是只背年份與名詞。',
    assessment: '整合地圖、文本、圖表或情境題完成單元素養檢核。',
    criteria: ['能讀懂至少一種社會資料來源', '能說明事件或現象之間的關係', '能用證據支持自己的判斷'],
  },
}

const LESSON_TITLES: Record<CurriculumLessonKind, string> = {
  launch: '先看懂問題',
  concept: '核心觀念',
  example: '一起看例子',
  guided: '跟著做一次',
  practice: '換你試試看',
  assessment: '單元檢核',
}

const LESSON_KINDS: CurriculumLessonKind[] = ['launch', 'concept', 'example', 'guided', 'practice', 'assessment']

function estimatedMinutes(grade: number, kind: CurriculumLessonKind) {
  const base = grade <= 2 ? 12 : grade <= 6 ? 18 : grade <= 9 ? 24 : 30
  if (kind === 'launch') return Math.max(8, base - 6)
  if (kind === 'assessment') return base + 8
  return base
}

function objectiveFor(unit: CurriculumUnitPlan, kind: CurriculumLessonKind) {
  if (kind === 'launch') return `先理解「${unit.title}」要處理的核心問題，連結既有經驗與先備知識。`
  if (kind === 'concept') return `掌握「${unit.title}」的核心概念：${unit.focus}`
  if (kind === 'example') return `看懂「${unit.title}」的完整示範，能指出每一步使用的線索或理由。`
  if (kind === 'guided') return `在提示下把「${unit.title}」的觀念實際用一次，並辨識容易出錯的位置。`
  if (kind === 'practice') return `獨立把「${unit.title}」運用到新題目、新文本或新情境。`
  return `完成「${unit.title}」單元檢核，確認理解、應用與解釋能力。`
}

function taskFor(subject: CurriculumSubjectId, unit: CurriculumUnitPlan, kind: CurriculumLessonKind) {
  const pedagogy = SUBJECT_PEDAGOGY[subject]
  if (kind === 'launch') return `${pedagogy.launch} 本單元聚焦：${unit.focus}`
  if (kind === 'concept') return pedagogy.concept
  if (kind === 'example') return pedagogy.example
  if (kind === 'guided') return pedagogy.guided
  if (kind === 'practice') return pedagogy.practice
  return pedagogy.assessment
}

export function buildUnitLessons(grade: number, subject: CurriculumSubjectId, unit: CurriculumUnitPlan): CurriculumLessonPlan[] {
  const pedagogy = SUBJECT_PEDAGOGY[subject]
  return LESSON_KINDS.map((kind, index) => ({
    id: `${unit.id}-l${index + 1}`,
    unitId: unit.id,
    order: index + 1,
    kind,
    title: `${LESSON_TITLES[kind]}｜${unit.title}`,
    objective: objectiveFor(unit, kind),
    teachingFocus: taskFor(subject, unit, kind),
    learnerTask: kind === 'assessment'
      ? '完成單元檢核後，標記最有把握與最需要再學一次的概念。'
      : '完成本課的小任務，並用一句話說出你今天真正理解了什麼。',
    successCriteria: pedagogy.criteria,
    estimatedMinutes: estimatedMinutes(grade, kind),
    difficultyBand: kind === 'launch' ? 'foundation' : kind === 'assessment' ? 'stretch' : unit.difficultyBand,
    prerequisiteSkills: unit.prerequisiteSkills,
  }))
}

export function getCurriculumCourseBundle(grade: number, subject: CurriculumSubjectId): CurriculumCourseBundle | null {
  const track = getCurriculumTrack(grade, subject)
  if (!track) return null
  return {
    grade: track.grade,
    subject: track.subject,
    sourceBasis: track.sourceBasis,
    note: track.note,
    semesters: track.semesters.map((semester) => ({
      semester: semester.semester,
      units: semester.units.map((unit) => ({
        ...unit,
        lessons: buildUnitLessons(grade, subject, unit),
      })),
    })),
  }
}

export type CurriculumDifficultyFeedback = 'too-hard' | 'about-right' | 'too-easy' | 'unclear'

export type CurriculumLessonFeedback = {
  lessonId: string
  unitId: string
  grade: number
  subject: CurriculumSubjectId
  feedback: CurriculumDifficultyFeedback
  createdAt: string
}

export function curriculumFeedbackStorageKey(userId: string) {
  return `bubble-space-curriculum-feedback-${userId}`
}

export function readCurriculumFeedback(userId: string): CurriculumLessonFeedback[] {
  try {
    const raw = window.localStorage.getItem(curriculumFeedbackStorageKey(userId))
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveCurriculumFeedback(userId: string, entry: CurriculumLessonFeedback) {
  const current = readCurriculumFeedback(userId)
  const next = [...current.filter((item) => item.lessonId !== entry.lessonId), entry].slice(-500)
  window.localStorage.setItem(curriculumFeedbackStorageKey(userId), JSON.stringify(next))
}

export function curriculumProgressStorageKey(userId: string) {
  return `bubble-space-curriculum-progress-${userId}`
}

export function readCurriculumProgress(userId: string): string[] {
  try {
    const raw = window.localStorage.getItem(curriculumProgressStorageKey(userId))
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((value) => typeof value === 'string') : []
  } catch {
    return []
  }
}

export function writeCurriculumProgress(userId: string, lessonIds: string[]) {
  window.localStorage.setItem(curriculumProgressStorageKey(userId), JSON.stringify(Array.from(new Set(lessonIds))))
}
