import type { CurriculumSubjectId } from './curriculum-plan'
import type { CurriculumPathwayId } from './curriculum-plan-v5'
import { GRADE7_MATH_OFFICIAL_SCOPE } from './curriculum-official-scope-math7'
import { SCIENCE7_STAGE_IV_SCOPE } from './curriculum-official-scope-science7'

export type CurriculumAuditTier =
  | 'textbook-ready'
  | 'scope-verified'
  | 'legacy-reviewed'
  | 'foundation-draft'
  | 'structural-blocker'

export type CurriculumTrackStructure =
  | 'official-subject'
  | 'integrated-life'
  | 'platform-extension'
  | 'discipline-split'
  | 'path-selected'
  | 'discipline-split-required'
  | 'path-selection-required'

export type CurriculumTrackPolicy = {
  structure: CurriculumTrackStructure
  label: string
  note: string
  textbookBlocked: boolean
}

export type CurriculumAuditSnapshot = {
  tier: CurriculumAuditTier
  label: string
  scopeChecked: boolean
  contentChecked: boolean
  questionsChecked: boolean
  textbookReady: boolean
  warnings: string[]
}

export const CURRICULUM_OFFICIAL_SOURCES = {
  syllabusIndex: 'https://www.naer.edu.tw/PageSyllabus?fid=177',
  courseManualIndex: 'https://www.naer.edu.tw/PageSyllabus?fid=197',
  life: 'https://www.naer.edu.tw/upload/1/16/doc/813/%28%E7%99%BC%E5%B8%83%E7%89%88%29%E7%94%9F%E6%B4%BB%E8%AA%B2%E7%A8%8B%E8%AA%B2%E7%A8%8B%E7%B6%B1%E8%A6%81.pdf',
  chinese: 'https://www.naer.edu.tw/upload/1/16/doc/806/%E5%8D%81%E4%BA%8C%E5%B9%B4%E5%9C%8B%E6%B0%91%E5%9F%BA%E6%9C%AC%E6%95%99%E8%82%B2%E8%AA%B2%E7%A8%8B%E7%B6%B1%E8%A6%81%E5%9C%8B%E6%B0%91%E4%B8%AD%E5%B0%8F%E5%AD%B8%E6%9A%A8%E6%99%AE%E9%80%9A%E5%9E%8B%E9%AB%98%E7%B4%9A%E4%B8%AD%E7%AD%89%E5%AD%B8%E6%A0%A1%28%E8%AA%9E%E6%96%87%E9%A0%98%E5%9F%9F%E2%94%80%E5%9C%8B%E8%AA%9E%E6%96%87%29.pdf',
  english: 'https://www.naer.edu.tw/upload/1/16/doc/812/%28%E7%99%BC%E5%B8%83%E7%89%88%29%E5%9C%8B%E6%B0%91%E4%B8%AD%E5%B0%8F%E5%AD%B8%E6%9A%A8%E6%99%AE%E9%80%9A%E5%9E%8B%E9%AB%98%E7%B4%9A%E4%B8%AD%E7%AD%89%E5%AD%B8%E6%A0%A1-%E8%AA%9E%E6%96%87%E9%A0%98%E5%9F%9F-%E8%8B%B1%E8%AA%9E%E6%96%87%E8%AA%B2%E7%A8%8B%E7%B6%B1%E8%A6%81.pdf',
  math: 'https://www.naer.edu.tw/upload/1/16/doc/815/%E5%8D%81%E4%BA%8C%E5%B9%B4%E5%9C%8B%E6%B0%91%E5%9F%BA%E6%9C%AC%E6%95%99%E8%82%B2%E8%AA%B2%E7%A8%8B%E7%B6%B1%E8%A6%81%E5%9C%8B%E6%B0%91%E4%B8%AD%E5%B0%8F%E5%AD%B8%E6%9A%A8%E6%99%AE%E9%80%9A%E5%9E%8B%E9%AB%98%E7%B4%9A%E4%B8%AD%E7%AD%89%E5%AD%B8%E6%A0%A1-%E6%95%B8%E5%AD%B8%E9%A0%98%E5%9F%9F.pdf',
  science: 'https://www.naer.edu.tw/upload/1/16/doc/820/%E5%8D%81%E4%BA%8C%E5%B9%B4%E5%9C%8B%E6%B0%91%E5%9F%BA%E6%9C%AC%E6%95%99%E8%82%B2%E8%AA%B2%E7%A8%8B%E7%B6%B1%E8%A6%81%E5%9C%8B%E6%B0%91%E4%B8%AD%E5%B0%8F%E5%AD%B8%E6%9A%A8%E6%99%AE%E9%80%9A%E5%9E%8B%E9%AB%98%E7%B4%9A%E4%B8%AD%E7%AD%89%E6%A0%A1-%E8%87%AA%E7%84%B6%E7%A7%91%E5%AD%B8%E9%A0%98%E5%9F%9F.pdf',
  social: 'https://www.naer.edu.tw/upload/1/16/doc/819/%E5%8D%81%E4%BA%8C%E5%B9%B4%E5%9C%8B%E6%B0%91%E5%9F%BA%E6%9C%AC%E6%95%99%E8%82%B2%E8%AA%B2%E7%A8%8B%E7%B6%B1%E8%A6%81%E5%9C%8B%E6%B0%91%E4%B8%AD%E5%B0%8F%E5%AD%B8%E6%9A%A8%E6%99%AE%E9%80%9A%E5%9E%8B%E9%AB%98%E7%B4%9A%E4%B8%AD%E7%AD%89%E5%AD%B8%E6%A0%A1-%E7%A4%BE%E6%9C%83%E9%A0%98%E5%9F%9F.pdf',
} as const

const GRADE7_MATH_SCOPE_VERIFIED = new Set(GRADE7_MATH_OFFICIAL_SCOPE.map((item) => item.unitId))
const SCIENCE7_STAGE_IV_SCOPE_VERIFIED = new Set(SCIENCE7_STAGE_IV_SCOPE.map((item) => item.unitId))

// V15 certification: these units passed official-scope, human-content, misconception,
// worked-example, question/rubric/diagnostic-feedback gates; Grade 7 science also passed
// vetted-media source/license/accessibility checks. Keep this registry internal-only.
const TEXTBOOK_READY_UNITS = new Set<string>([
  ...GRADE7_MATH_OFFICIAL_SCOPE.map((item) => item.unitId),
  ...SCIENCE7_STAGE_IV_SCOPE.map((item) => item.unitId),
])

export function isTextbookReadyUnit(unitId: string) {
  return TEXTBOOK_READY_UNITS.has(unitId)
}

function isSciencePath(pathway?: CurriculumPathwayId) {
  return pathway === 'physics' || pathway === 'chemistry' || pathway === 'biology' || pathway === 'earth-science'
}

function isSocialPath(pathway?: CurriculumPathwayId) {
  return pathway === 'geography' || pathway === 'history' || pathway === 'civics'
}

function isMathPath(pathway?: CurriculumPathwayId) {
  return pathway === 'math-a' || pathway === 'math-b' || pathway === 'math-alpha' || pathway === 'math-beta'
}

export function getTrackPolicy(grade: number, subject: CurriculumSubjectId, pathway?: CurriculumPathwayId): CurriculumTrackPolicy {
  if (grade <= 2 && pathway === 'life') {
    return {
      structure: 'integrated-life',
      label: '生活課程正式入口',
      note: '國小一、二年級以生活課程統整生活探究、自然觀察與社會互動；v13 已改為單一生活課程路線，不再把自然與社會偽裝成兩門正式分科。',
      textbookBlocked: false,
    }
  }

  if (grade <= 2 && (subject === 'science' || subject === 'social')) {
    return {
      structure: 'path-selection-required',
      label: '請改用生活課程',
      note: '低年級自然／社會的舊合成入口已停用；學生端必須改走生活課程 pathway。',
      textbookBlocked: true,
    }
  }

  if (grade <= 2 && subject === 'english') {
    return {
      structure: 'platform-extension',
      label: '平台延伸課程',
      note: '一、二年級英語明確標示為校本／平台啟蒙延伸，不冒充全國一致的國定年級進度。',
      textbookBlocked: false,
    }
  }

  if (subject === 'math' && grade >= 11) {
    if (isMathPath(pathway)) {
      return {
        structure: 'path-selected',
        label: '數學分流已選定',
        note: grade === 11 ? '已進入數學 A／數學 B 的其中一條獨立路線。' : '已進入高三數學甲／數學乙其中一條加深加廣路線。',
        textbookBlocked: false,
      }
    }
    return {
      structure: 'path-selection-required',
      label: '數學路線需分流',
      note: grade === 11 ? '十一年級需先選數學 A 或數學 B。' : '十二年級需先選數學甲或數學乙等加深加廣路線。',
      textbookBlocked: true,
    }
  }

  if (grade >= 10 && subject === 'science') {
    if (isSciencePath(pathway)) {
      return { structure: 'discipline-split', label: '高中自然分科已選定', note: '已進入物理、化學、生物或地球科學的獨立課程路線。', textbookBlocked: false }
    }
    return { structure: 'discipline-split-required', label: '高中自然需分科', note: '高中自然總入口不可直接當成一門合併教材，請先選物理、化學、生物或地球科學。', textbookBlocked: true }
  }

  if (grade >= 10 && subject === 'social') {
    if (isSocialPath(pathway)) {
      return { structure: 'discipline-split', label: '高中社會分科已選定', note: '已進入地理、歷史或公民與社會的獨立課程路線。', textbookBlocked: false }
    }
    return { structure: 'discipline-split-required', label: '高中社會需分科', note: '高中社會總入口不可直接當成一門合併教材，請先選地理、歷史或公民與社會。', textbookBlocked: true }
  }

  return {
    structure: 'official-subject',
    label: '正式領域／科目',
    note: '目前入口可依該領域／科目的課綱與學習階段繼續做逐單元內容審核。',
    textbookBlocked: false,
  }
}

export function getUnitAuditSnapshot(args: {
  grade: number
  subject: CurriculumSubjectId
  pathway?: CurriculumPathwayId
  unitId: string
  strictReviewed: boolean
}): CurriculumAuditSnapshot {
  const policy = getTrackPolicy(args.grade, args.subject, args.pathway)
  const textbookReady = TEXTBOOK_READY_UNITS.has(args.unitId)
  const mathScopeChecked = GRADE7_MATH_SCOPE_VERIFIED.has(args.unitId)
  const scienceStageScopeChecked = SCIENCE7_STAGE_IV_SCOPE_VERIFIED.has(args.unitId)
  const scopeChecked = mathScopeChecked || scienceStageScopeChecked

  if (textbookReady) {
    return { tier: 'textbook-ready', label: '✓ 教科書級 QA 通過', scopeChecked: true, contentChecked: true, questionsChecked: true, textbookReady: true, warnings: [] }
  }

  if (policy.textbookBlocked) {
    return { tier: 'structural-blocker', label: policy.label, scopeChecked: false, contentChecked: args.strictReviewed, questionsChecked: args.strictReviewed, textbookReady: false, warnings: [policy.note] }
  }

  if (scopeChecked && args.strictReviewed) {
    return {
      tier: 'scope-verified',
      label: scienceStageScopeChecked ? '第四學習階段範圍已核對 · 平台七年級序列待持續加厚' : '課綱範圍已核對 · 內容待教科書級加厚',
      scopeChecked: true,
      contentChecked: true,
      questionsChecked: true,
      textbookReady: false,
      warnings: scienceStageScopeChecked
        ? ['自然科學的「Ⅳ」代碼適用國中七～九年級；目前只代表 Bubble Space 的七年級生物編排已逐單元對照正式第四學習階段內容，不宣稱國家規定每一碼固定在七年級某學期。教科書級仍需補探究活動、更多資料題、媒體與人工逐頁 QA。']
        : ['目前內容已有人工編寫與題目 QA，但仍缺教科書級的多例題、常見迷思、分層題組與完整媒體配置。'],
    }
  }

  if (args.strictReviewed) {
    return { tier: 'legacy-reviewed', label: '人工內容 · 待課綱複核', scopeChecked: false, contentChecked: true, questionsChecked: true, textbookReady: false, warnings: ['舊版「已審閱」只代表人工內容與題幹檢查，不代表已完成官方課綱對照與教科書級 QA。'] }
  }

  return { tier: 'foundation-draft', label: '教材初稿 · 非教科書級題庫', scopeChecked: false, contentChecked: false, questionsChecked: false, textbookReady: false, warnings: ['目前已有正確課程路線與基礎內容，但仍需逐單元人工研究、重寫與媒體配置後才能升級。'] }
}
