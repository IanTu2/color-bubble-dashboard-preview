import type { CurriculumSubjectId } from './curriculum-plan'
import { GRADE7_MATH_OFFICIAL_SCOPE } from './curriculum-official-scope-math7'
import { SCIENCE7_STAGE_IV_SCOPE } from './curriculum-official-scope-science7'
import { CHINESE7_STAGE_IV_SCOPE } from './curriculum-official-scope-chinese7'
import { ENGLISH7_STAGE_IV_SCOPE } from './curriculum-official-scope-english7'
import { SOCIAL7_SCOPE } from './curriculum-official-scope-social7'

export type CurriculumAuditTier = 'textbook-ready' | 'scope-verified' | 'legacy-reviewed' | 'foundation-draft' | 'structural-blocker'
export type CurriculumTrackStructure = 'official-subject' | 'integrated-life' | 'platform-extension' | 'discipline-split-required' | 'path-selection-required'
export type CurriculumTrackPolicy = { structure: CurriculumTrackStructure; label: string; note: string; textbookBlocked: boolean }
export type CurriculumAuditSnapshot = { tier: CurriculumAuditTier; label: string; scopeChecked: boolean; contentChecked: boolean; questionsChecked: boolean; textbookReady: boolean; warnings: string[] }

export const CURRICULUM_OFFICIAL_SOURCES = {
  syllabusIndex: 'https://www.naer.edu.tw/PageSyllabus?fid=177',
  courseManualIndex: 'https://www.naer.edu.tw/PageSyllabus?fid=197',
} as const

const STAGE_SCOPE_VERIFIED = new Set([
  ...GRADE7_MATH_OFFICIAL_SCOPE.map((item) => item.unitId),
  ...SCIENCE7_STAGE_IV_SCOPE.map((item) => item.unitId),
  ...CHINESE7_STAGE_IV_SCOPE.map((item) => item.unitId),
  ...ENGLISH7_STAGE_IV_SCOPE.map((item) => item.unitId),
  ...SOCIAL7_SCOPE.map((item) => item.unitId),
])

// 只有真正通過 scope、教學、題庫、媒體、無障礙與人工逐頁 QA 的單元才能手動加入。
const TEXTBOOK_READY_UNITS = new Set<string>()

export function getTrackPolicy(grade: number, subject: CurriculumSubjectId): CurriculumTrackPolicy {
  if (grade <= 2 && (subject === 'science' || subject === 'social')) return {
    structure: 'integrated-life', label: '生活課程映射', textbookBlocked: true,
    note: '國小一、二年級正式課程以生活課程統整自然科學、社會、藝術與綜合活動；目前自然／社會入口只是平台導航映射，教科書級版本需改成正式生活課程架構。',
  }
  if (grade <= 2 && subject === 'english') return {
    structure: 'platform-extension', label: '平台延伸課程', textbookBlocked: false,
    note: '一、二年級英語在此標示為平台啟蒙延伸，不冒充全國一致的國定年級進度。',
  }
  if (subject === 'math' && grade >= 11) return {
    structure: 'path-selection-required', label: '數學路線需分流', textbookBlocked: true,
    note: grade === 11 ? '十一年級正式數學需區分數學 A／B 等路線。' : '十二年級加深加廣數學需依正式課程路線與學生需求分流。',
  }
  if (grade >= 10 && subject === 'science') return {
    structure: 'discipline-split-required', label: '高中自然需分科', textbookBlocked: true,
    note: '高中自然入口需進一步分成物理、化學、生物、地球科學及必／選修路線，不能用單一「自然」課本代替。',
  }
  if (grade >= 10 && subject === 'social') return {
    structure: 'discipline-split-required', label: '高中社會需分科', textbookBlocked: true,
    note: '高中社會入口需進一步分成歷史、地理、公民與社會等分科課程，不能用單一「社會」課本代替。',
  }
  return { structure: 'official-subject', label: '正式領域／科目', textbookBlocked: false, note: '可依正式課綱與學習階段繼續做逐單元審核。' }
}

export function getUnitAuditSnapshot(args: { grade: number; subject: CurriculumSubjectId; unitId: string; strictReviewed: boolean }): CurriculumAuditSnapshot {
  const policy = getTrackPolicy(args.grade, args.subject)
  if (TEXTBOOK_READY_UNITS.has(args.unitId)) return { tier: 'textbook-ready', label: '✓ 教科書級 QA 通過', scopeChecked: true, contentChecked: true, questionsChecked: true, textbookReady: true, warnings: [] }
  if (policy.textbookBlocked) return { tier: 'structural-blocker', label: policy.label, scopeChecked: false, contentChecked: args.strictReviewed, questionsChecked: args.strictReviewed, textbookReady: false, warnings: [policy.note] }

  const scopeChecked = STAGE_SCOPE_VERIFIED.has(args.unitId)
  if (scopeChecked && args.strictReviewed) {
    const stageWide = args.grade === 7 && (args.subject === 'chinese' || args.subject === 'english' || args.subject === 'science')
    return {
      tier: 'scope-verified',
      label: stageWide ? '第四學習階段範圍已核對 · 平台七年級序列' : '課綱範圍已核對 · 內容持續加厚',
      scopeChecked: true,
      contentChecked: true,
      questionsChecked: true,
      textbookReady: false,
      warnings: [stageWide
        ? '「Ⅳ」代表國中七～九年級的第四學習階段；目前代表平台七年級教學序列已對照正式能力／內容，不宣稱國家規定每一項固定在七年級某學期。仍需完成更大型正式題庫、媒體與人工逐頁 QA。'
        : '目前單元已完成正式範圍對照與人工內容補強，但仍需擴充正式題庫、必要媒體、先備診斷與人工逐頁 QA 才能升級教科書級。'],
    }
  }
  if (args.strictReviewed) return { tier: 'legacy-reviewed', label: '人工內容 · 待正式範圍複核', scopeChecked: false, contentChecked: true, questionsChecked: true, textbookReady: false, warnings: ['舊版人工內容不自動等於教科書級。'] }
  return { tier: 'foundation-draft', label: '教材初稿 · 非教科書級題庫', scopeChecked: false, contentChecked: false, questionsChecked: false, textbookReady: false, warnings: ['目前 foundation 可作預習骨架；泛用自我檢核不能計入正式科目題庫。'] }
}
