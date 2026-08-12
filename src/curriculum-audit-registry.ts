import type { CurriculumSubjectId } from './curriculum-plan'
import { GRADE7_MATH_OFFICIAL_SCOPE } from './curriculum-official-scope-math7'

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

// v10 起 textbook-ready 必須通過課綱範圍、內容、題庫、媒體與整體教學流程五道 gate。
// 現階段刻意保持空集合：舊的 reviewed 不自動等於教科書級。
const TEXTBOOK_READY_UNITS = new Set<string>()

export function getTrackPolicy(grade: number, subject: CurriculumSubjectId): CurriculumTrackPolicy {
  if (grade <= 2 && (subject === 'science' || subject === 'social')) {
    return {
      structure: 'integrated-life',
      label: '生活課程映射',
      note: '國小一、二年級正式課程以「生活課程」統整自然科學、社會、藝術與綜合活動；平台目前為了維持五科入口而做導航映射，不能視為獨立的正式自然／社會課本。',
      textbookBlocked: true,
    }
  }

  if (grade <= 2 && subject === 'english') {
    return {
      structure: 'platform-extension',
      label: '平台延伸課程',
      note: '英語文正式學習表現主要自第二學習階段（國小三、四年級）展開；一、二年級內容應明確標示為英語啟蒙延伸，不冒充全國一致的國定年級進度。',
      textbookBlocked: false,
    }
  }

  if (subject === 'math' && grade >= 11) {
    return {
      structure: 'path-selection-required',
      label: '數學路線需分流',
      note: grade === 11
        ? '十一年級正式數學必須區分數學 A／數學 B，不能再用單一路線涵蓋所有學生。'
        : '十二年級加深加廣數學需依甲／乙等路線與學生需求呈現，不能以單一共同課程假裝完整。',
      textbookBlocked: true,
    }
  }

  if (grade >= 10 && subject === 'science') {
    return {
      structure: 'discipline-split-required',
      label: '高中自然需分科',
      note: '普通型高中自然科學領域以物理、化學、生物、地球科學等科目配置必修與選修；「自然」只能當入口，教科書級內容必須進一步分科。',
      textbookBlocked: true,
    }
  }

  if (grade >= 10 && subject === 'social') {
    return {
      structure: 'discipline-split-required',
      label: '高中社會需分科',
      note: '普通型高中社會領域以歷史、地理、公民與社會分科教學為原則；「社會」只能當入口，教科書級內容必須進一步分科。',
      textbookBlocked: true,
    }
  }

  return {
    structure: 'official-subject',
    label: '正式領域／科目',
    note: '目前入口可直接依該領域／科目的課綱與學習階段繼續做逐單元內容審核。',
    textbookBlocked: false,
  }
}

export function getUnitAuditSnapshot(args: {
  grade: number
  subject: CurriculumSubjectId
  unitId: string
  strictReviewed: boolean
}): CurriculumAuditSnapshot {
  const policy = getTrackPolicy(args.grade, args.subject)
  const textbookReady = TEXTBOOK_READY_UNITS.has(args.unitId)
  const scopeChecked = GRADE7_MATH_SCOPE_VERIFIED.has(args.unitId)

  if (textbookReady) {
    return {
      tier: 'textbook-ready',
      label: '✓ 教科書級 QA 通過',
      scopeChecked: true,
      contentChecked: true,
      questionsChecked: true,
      textbookReady: true,
      warnings: [],
    }
  }

  if (policy.textbookBlocked) {
    return {
      tier: 'structural-blocker',
      label: policy.label,
      scopeChecked: false,
      contentChecked: args.strictReviewed,
      questionsChecked: args.strictReviewed,
      textbookReady: false,
      warnings: [policy.note],
    }
  }

  if (scopeChecked && args.strictReviewed) {
    return {
      tier: 'scope-verified',
      label: '課綱範圍已核對 · 內容待教科書級加厚',
      scopeChecked: true,
      contentChecked: true,
      questionsChecked: true,
      textbookReady: false,
      warnings: ['目前內容已有人工編寫與題目 QA，但仍缺教科書級的多例題、常見迷思、分層題組與完整媒體配置。'],
    }
  }

  if (args.strictReviewed) {
    return {
      tier: 'legacy-reviewed',
      label: '人工內容 · 待 v10 課綱複核',
      scopeChecked: false,
      contentChecked: true,
      questionsChecked: true,
      textbookReady: false,
      warnings: ['舊版「已審閱」只代表人工內容與題幹檢查，不代表已完成 v10 的官方課綱對照與教科書級 QA。'],
    }
  }

  return {
    tier: 'foundation-draft',
    label: '教材初稿 · 非教科書級題庫',
    scopeChecked: false,
    contentChecked: false,
    questionsChecked: false,
    textbookReady: false,
    warnings: ['目前內容由 roadmap 與科目規則產生，可作預習骨架；泛用自我檢核題不能計入正式題庫，必須逐單元重寫。'],
  }
}
