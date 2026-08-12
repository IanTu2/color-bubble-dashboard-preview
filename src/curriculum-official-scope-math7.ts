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
      { code: 'N-7-3', summary: '以正負數表徵生活量，並做含分數、小數的四則混合運算' },
      { code: 'N-7-4', summary: '交換律、結合律、分配律與負號括號等數的運算規律' },
      { code: 'N-7-5', summary: '含負數的數線、大小比較、絕對值與兩點距離' },
      { code: 'N-7-6', summary: '非負整數指數、零次方、同底數大小比較與指數運算' },
      { code: 'N-7-7', summary: '以數值例理解同底數乘除、冪的冪與積的乘方等指數律' },
      { code: 'N-7-8', summary: '以科學記號表示很大或很小的正數，包含 10 的負整數次方' },
    ],
  },
  {
    unitId: 'g7-math-s1-u2',
    title: '因數分解與分數運算',
    items: [
      { code: 'N-7-1', summary: '100 以內質數、合數與質數篩法' },
      { code: 'N-7-2', summary: '質因數分解的標準分解式及其因數、倍數應用' },
      { code: 'N-7-3', summary: '把正負數四則混合運算延伸到分數與小數' },
    ],
  },
  {
    unitId: 'g7-math-s1-u3',
    title: '一元一次方程式',
    items: [
      { code: 'A-7-1', summary: '以代數符號表示運算規律、化簡一次式與記錄生活情境' },
      { code: 'A-7-2', summary: '理解一元一次方程式與其解，並由具體情境列式' },
      { code: 'A-7-3', summary: '以等量公理、移項與驗算解一元一次方程式及應用問題' },
    ],
  },
  {
    unitId: 'g7-math-s2-u1',
    title: '簡單圖形與幾何符號',
    items: [
      { code: 'S-7-1', summary: '點、線、線段、射線、角、三角形與基本幾何符號' },
      { code: 'S-7-2', summary: '立體圖形的前視圖、上視圖與左／右視圖' },
      { code: 'S-7-3', summary: '垂直、中垂線與點到直線距離的意義' },
      { code: 'S-7-4', summary: '線對稱的等長、等角與對稱點連線被對稱軸垂直平分等性質' },
      { code: 'S-7-5', summary: '等腰三角形、正方形、菱形、箏形、正多邊形等基本線對稱圖形' },
    ],
  },
  {
    unitId: 'g7-math-s2-u2',
    title: '二元一次聯立方程式',
    items: [
      { code: 'A-7-4', summary: '二元一次方程式、聯立方程式及其解的意義與情境列式' },
      { code: 'A-7-5', summary: '代入消去、加減消去與二元一次聯立方程式應用問題' },
    ],
  },
  {
    unitId: 'g7-math-s2-u3',
    title: '直角坐標與二元一次方程式圖形',
    items: [
      { code: 'G-7-1', summary: '平面直角坐標、象限、方位與距離的位置表示' },
      { code: 'A-7-6', summary: 'ax+by=c、x=c、y=c 的圖形，以及聯立方程式解的交點意義' },
    ],
  },
  {
    unitId: 'g7-math-s2-u4',
    title: '比例與正反比',
    items: [
      { code: 'N-7-9', summary: '比、比例式、正比、反比及有意義比值的基本運算與應用' },
    ],
  },
  {
    unitId: 'g7-math-s2-u5',
    title: '一元一次不等式',
    items: [
      { code: 'A-7-7', summary: '不等式的意義，以及由具體情境列出一元一次不等式' },
      { code: 'A-7-8', summary: '解單一一元一次不等式、在數線表示解的範圍並處理應用問題' },
    ],
  },
  {
    unitId: 'g7-math-s2-u6',
    title: '統計圖表與統計數據',
    items: [
      { code: 'D-7-1', summary: '蒐集與整理生活數據，繪製與判讀直方圖、長條圖、圓形圖、折線圖與列聯表' },
      { code: 'D-7-2', summary: '以平均數、中位數與眾數描述一組資料的特性' },
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
