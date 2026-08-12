export type English7ScopeItem = {
  code: string
  summary: string
}

export type English7UnitScope = {
  unitId: string
  title: string
  items: English7ScopeItem[]
  note?: string
}

// 英語文「Ⅳ」是第四學習階段（國中七～九年級）。
// 課綱以聽、說、讀、寫與綜合應用能力描述，不規定全國一致的七年級文法章節順序。
// Bubble Space 的六個單元是平台七年級生活溝通序列，必須用完整語境同時練習多種技能。
export const ENGLISH7_STAGE_IV_SCOPE: English7UnitScope[] = [
  {
    unitId: 'g7-english-s1-u1',
    title: '認識新朋友與 be 動詞',
    items: [
      { code: '1-Ⅳ-1～4', summary: '聽懂所學字詞、日常用語、基本句型與日常對話主旨' },
      { code: '2-Ⅳ-2～8', summary: '依情境使用生活用語，介紹人物、表達需求並做簡易問答' },
      { code: '3-Ⅳ-5～8', summary: '讀懂生活用語、基本句型、對話與短訊息' },
      { code: '5-Ⅳ-1～3', summary: '把基本字詞與句型用於真實日常溝通並做適當回應' },
    ],
  },
  {
    unitId: 'g7-english-s1-u2',
    title: '日常作息與現在簡單式',
    items: [
      { code: '1-Ⅳ-3～4', summary: '聽懂重要句型與日常生活對話主要內容' },
      { code: '2-Ⅳ-5～7', summary: '表達需求感受，依人事時地物描述、回答與提問' },
      { code: '3-Ⅳ-4～8', summary: '讀圖表、生活用語、基本句型、對話與短文／訊息' },
      { code: '5-Ⅳ-2 / 5-Ⅳ-11', summary: '在生活溝通中使用字詞句型，並讀寫簡單表格資料' },
    ],
  },
  {
    unitId: 'g7-english-s1-u3',
    title: '資訊問答與 Wh- 問句',
    items: [
      { code: '2-Ⅳ-6～7', summary: '依人物、事件、時間、地點、事物描述／回答並提出問題' },
      { code: '3-Ⅳ-7～12', summary: '理解對話、短文／簡訊／書信，並使用閱讀策略' },
      { code: '5-Ⅳ-6～7', summary: '轉述簡短談話並記下日常對話要點' },
      { code: '5-Ⅳ-10～12', summary: '摘要短文、填寫資料並回應簡易訊息／邀請' },
    ],
  },
  {
    unitId: 'g7-english-s2-u1',
    title: '規則、指令與 can / must',
    items: [
      { code: '1-Ⅳ-2～4', summary: '聽懂教室／生活用語、基本句型與對話' },
      { code: '2-Ⅳ-2～5', summary: '依情境使用生活／教室用語並表達需求意願' },
      { code: '3-Ⅳ-3～6', summary: '讀懂英文標示、圖表、生活用語與基本句型' },
      { code: '5-Ⅳ-3', summary: '理解日常應對語句並作適當回應' },
    ],
  },
  {
    unitId: 'g7-english-s2-u2',
    title: '正在發生的事與現在進行式',
    items: [
      { code: '1-Ⅳ-3～4', summary: '聽懂重要句型與描述當下情境的對話' },
      { code: '2-Ⅳ-6 / 2-Ⅳ-10', summary: '依人事時地物描述並用簡易英語描述圖片' },
      { code: '3-Ⅳ-4～8', summary: '從圖表／情境理解句型、對話與短文訊息' },
      { code: '5-Ⅳ-1～4', summary: '整合聽讀與口語表達，朗讀並使用目標句型溝通' },
    ],
  },
  {
    unitId: 'g7-english-s2-u3',
    title: '過去事件與過去簡單式',
    items: [
      { code: '1-Ⅳ-4～8', summary: '聽懂日常對話、簡易故事／短劇、簡短說明與影片主旨' },
      { code: '2-Ⅳ-6～9', summary: '描述事件、回答／提問並進行角色扮演' },
      { code: '3-Ⅳ-8～12', summary: '理解短文、訊息、故事情節與基本閱讀策略' },
      { code: '5-Ⅳ-6～10', summary: '轉述談話／故事、記下要點並說寫短文大意' },
    ],
  },
]

export function getEnglish7StageIVScope(unitId: string) {
  return ENGLISH7_STAGE_IV_SCOPE.find((item) => item.unitId === unitId) ?? null
}

export function english7StageIVScopeUnitIds() {
  return ENGLISH7_STAGE_IV_SCOPE.map((item) => item.unitId)
}
