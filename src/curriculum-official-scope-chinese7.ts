export type Chinese7ScopeItem = {
  code: string
  summary: string
}

export type Chinese7UnitScope = {
  unitId: string
  title: string
  items: Chinese7ScopeItem[]
  note?: string
}

// 國語文課綱中的「Ⅳ」代表第四學習階段（國中七～九年級）。
// Bubble Space 的六個七年級單元是平台為初入國中的學習者設計的教學序列，
// 需對應第四學習階段能力與內容，但不宣稱是國家規定的唯一七年級學期順序。
export const CHINESE7_STAGE_IV_SCOPE: Chinese7UnitScope[] = [
  {
    unitId: 'g7-chinese-s1-u1',
    title: '語文基礎與工具',
    items: [
      { code: 'Ab-Ⅳ-1～7', summary: '常用字詞、造字原則、詞義與常用文言字詞／虛字' },
      { code: 'Ac-Ⅳ-1～3', summary: '標點效果、基本句型與文句邏輯／意義' },
      { code: '5-Ⅳ-2～4', summary: '理解句段與主要概念、文本形式特色及閱讀策略' },
      { code: '5-Ⅳ-6', summary: '使用圖書館與科技工具蒐集、組織資訊' },
    ],
  },
  {
    unitId: 'g7-chinese-s1-u2',
    title: '敘事與描寫',
    items: [
      { code: 'Ba-Ⅳ-1', summary: '順敘、倒敘、插敘與補敘等敘事順序' },
      { code: 'Ba-Ⅳ-2', summary: '各種描寫方法的作用與呈現效果' },
      { code: 'Ad-Ⅳ-1～2', summary: '篇章主旨、結構與現代散文／小說等文本閱讀' },
      { code: '5-Ⅳ-2～3', summary: '指出寫作目的、觀點並理解文本形式與特色' },
      { code: '6-Ⅳ', summary: '將觀察、取材、組織、遣詞與修訂運用於寫作' },
    ],
  },
  {
    unitId: 'g7-chinese-s1-u3',
    title: '文言文基礎',
    items: [
      { code: 'Ab-Ⅳ-6～7', summary: '常用文言詞義、語詞結構、虛字與古今義變' },
      { code: 'Ad-Ⅳ-4', summary: '閱讀古典散文、古典小說、語錄體與寓言等非韻文文本' },
      { code: '5-Ⅳ-2～4', summary: '理解句段、篇章與閱讀策略，避免只做逐字翻譯' },
    ],
  },
  {
    unitId: 'g7-chinese-s2-u1',
    title: '詩詞賞析',
    items: [
      { code: 'Ad-Ⅳ-3', summary: '韻文文本：古體詩、樂府詩、近體詩、詞、曲等' },
      { code: 'Bb-Ⅳ', summary: '自我、人際、自然等情感及直接／間接抒情的表達' },
      { code: '5-Ⅳ-1', summary: '朗讀文本並比較標點、節奏與情感表達效果' },
      { code: '5-Ⅳ-3', summary: '理解文本內容、形式與寫作特色' },
    ],
  },
  {
    unitId: 'g7-chinese-s2-u2',
    title: '說明與論說',
    items: [
      { code: 'Bc-Ⅳ-1～3', summary: '邏輯客觀的說明文本、說明方法及數據／圖表等輔助' },
      { code: 'Bd-Ⅳ', summary: '以事實、理論作論據，辨識論點、論據與論證關係' },
      { code: '5-Ⅳ-2～5', summary: '理解目的觀點、寫作特色、閱讀策略與議題關聯' },
    ],
  },
  {
    unitId: 'g7-chinese-s2-u3',
    title: '作文結構',
    items: [
      { code: '6-Ⅳ-1～6', summary: '標點、審題、取材、組織、遣詞、修訂、仿寫／改寫與多文體創作' },
      { code: 'Ba-Ⅳ-1～2', summary: '在寫作中運用敘事順序與描寫效果' },
      { code: 'Bc-Ⅳ / Bd-Ⅳ', summary: '依寫作目的選擇說明或議論結構與證據' },
      { code: '5-Ⅳ-6', summary: '以科技工具蒐集資訊、組織材料並擴充寫作內容' },
    ],
  },
]

export function getChinese7StageIVScope(unitId: string) {
  return CHINESE7_STAGE_IV_SCOPE.find((item) => item.unitId === unitId) ?? null
}

export function chinese7StageIVScopeUnitIds() {
  return CHINESE7_STAGE_IV_SCOPE.map((item) => item.unitId)
}
