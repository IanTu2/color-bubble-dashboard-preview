export type OfficialScopeItem = {
  code: string
  summary: string
}

export type OfficialUnitScope = {
  unitId: string
  title: string
  items: OfficialScopeItem[]
}

// 依國教院《十二年國民基本教育課程綱要－數學領域》第四學習階段
// 七年級學習內容整理。summary 為 Bubble Space 自行摘要，不複製課綱全文。
export const GRADE7_MATH_OFFICIAL_SCOPE: OfficialUnitScope[] = [
  {
    unitId: 'g7-math-s1-u1',
    title: '整數運算與科學記號',
    items: [
      { code: 'N-7-3', summary: '負數、數線、絕對值與大小比較' },
      { code: 'N-7-4', summary: '正負數的乘除與符號規則' },
      { code: 'N-7-5', summary: '正負數的冪與運算優先順序' },
      { code: 'N-7-6', summary: '指數律的數值運用' },
      { code: 'N-7-7', summary: '指數律的代數運用' },
      { code: 'N-7-8', summary: '科學記號' },
    ],
  },
  {
    unitId: 'g7-math-s1-u2',
    title: '因數分解與分數運算',
    items: [
      { code: 'N-7-1', summary: '質數、質因數與標準分解式' },
      { code: 'N-7-2', summary: '質因數分解、最大公因數與最小公倍數' },
      { code: 'N-7-3', summary: '負分數等負數概念延伸到有理數運算' },
    ],
  },
  {
    unitId: 'g7-math-s1-u3',
    title: '一元一次方程式',
    items: [
      { code: 'A-7-1', summary: '代數符號、式的表示與代入求值' },
      { code: 'A-7-2', summary: '一元一次式化簡與運算' },
      { code: 'A-7-3', summary: '一元一次方程式、等量公理與情境建模' },
    ],
  },
  {
    unitId: 'g7-math-s2-u1',
    title: '簡單圖形與幾何符號',
    items: [
      { code: 'S-7-1', summary: '簡單圖形、點線角與基本幾何符號' },
      { code: 'S-7-2', summary: '三視圖與立體視覺' },
      { code: 'S-7-3', summary: '垂直、線段中點與基本尺規概念' },
      { code: 'S-7-4', summary: '線對稱與對稱性質' },
      { code: 'S-7-5', summary: '線對稱的幾何圖形' },
    ],
  },
  {
    unitId: 'g7-math-s2-u2',
    title: '二元一次聯立方程式',
    items: [
      { code: 'A-7-4', summary: '二元一次聯立方程式的意義與解法' },
      { code: 'A-7-5', summary: '二元一次聯立方程式的生活情境建模' },
    ],
  },
  {
    unitId: 'g7-math-s2-u3',
    title: '直角坐標與二元一次方程式圖形',
    items: [
      { code: 'G-7-1', summary: '平面直角坐標、象限與位置表示' },
      { code: 'A-7-6', summary: '二元一次聯立方程式的幾何意義與交點' },
    ],
  },
  {
    unitId: 'g7-math-s2-u4',
    title: '比例與正反比',
    items: [
      { code: 'N-7-9', summary: '比、比例式、正比與反比的意義與運用' },
    ],
  },
  {
    unitId: 'g7-math-s2-u5',
    title: '一元一次不等式',
    items: [
      { code: 'A-7-7', summary: '一元一次不等式的意義與解法' },
      { code: 'A-7-8', summary: '一元一次不等式的情境建模與應用' },
    ],
  },
  {
    unitId: 'g7-math-s2-u6',
    title: '統計圖表與統計數據',
    items: [
      { code: 'D-7-1', summary: '統計圖表、資料整理與視覺判讀' },
      { code: 'D-7-2', summary: '平均數、中位數、眾數等代表值與資料解讀' },
    ],
  },
]

export const GRADE7_MATH_REQUIRED_CODES = [
  'N-7-1', 'N-7-2', 'N-7-3', 'N-7-4', 'N-7-5', 'N-7-6', 'N-7-7', 'N-7-8', 'N-7-9',
  'S-7-1', 'S-7-2', 'S-7-3', 'S-7-4', 'S-7-5',
  'G-7-1',
  'A-7-1', 'A-7-2', 'A-7-3', 'A-7-4', 'A-7-5', 'A-7-6', 'A-7-7', 'A-7-8',
  'D-7-1', 'D-7-2',
] as const

export function getGrade7MathOfficialScope(unitId: string) {
  return GRADE7_MATH_OFFICIAL_SCOPE.find((item) => item.unitId === unitId) ?? null
}

export function grade7MathScopeCodes() {
  return Array.from(new Set(GRADE7_MATH_OFFICIAL_SCOPE.flatMap((unit) => unit.items.map((item) => item.code))))
}
