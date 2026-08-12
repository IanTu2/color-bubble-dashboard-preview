export type Social7ScopeItem = {
  code: string
  summary: string
}

export type Social7UnitScope = {
  unitId: string
  title: string
  discipline: 'geography' | 'history' | 'civics'
  items: Social7ScopeItem[]
  note?: string
}

// 社會領域國中學習內容已把臺灣地理、臺灣史與社會生活等主題分組。
// Bubble Space 目前將這些群組安排在七年級；仍保留問題探究、田野觀察、史料判讀與公共議題，而不是只背名詞。
export const SOCIAL7_SCOPE: Social7UnitScope[] = [
  {
    unitId: 'g7-social-s1-u1',
    title: '地理：臺灣的位置、地形與海域',
    discipline: 'geography',
    items: [
      { code: '地 Aa-Ⅳ-1～4', summary: '全球經緯度、海陸分布、臺灣位置特性與臺灣—世界關聯探究' },
      { code: '地 Ab-Ⅳ-1～4', summary: '地形／海岸分類、臺灣主要地形、領海／經濟海域與土地／災害探究' },
      { code: '田野觀察 Aa/Ab/Ac', summary: '以學校附近自然環境進行觀察、紀錄與跨科探究' },
    ],
  },
  {
    unitId: 'g7-social-s1-u2',
    title: '歷史：史前、原住民族與大航海時代',
    discipline: 'history',
    items: [
      { code: '歷 Ba-Ⅳ-1～2', summary: '考古發掘與史前文化、原住民族遷徙與傳說' },
      { code: '歷 Bb-Ⅳ-1～2', summary: '十六、十七世紀東亞海域勢力與原住民族／外來者接觸' },
      { code: '歷 D-Ⅳ-1～2', summary: '地方史探究、踏查或展演，建立史料與證據思維' },
    ],
  },
  {
    unitId: 'g7-social-s1-u3',
    title: '公民：自我、家庭與社區',
    discipline: 'civics',
    items: [
      { code: '公 Ba-Ⅳ-1～5', summary: '家庭的社會化、部落、親屬關係、多元家庭與公權力支持家庭功能' },
      { code: '公 Bb-Ⅳ-1～2', summary: '個人參與團體、志願結社與公共生活' },
      { code: '公民素養探究', summary: '由生活案例討論權利、責任、差異與公共資源，不把單一家庭型態當標準答案' },
    ],
  },
  {
    unitId: 'g7-social-s2-u1',
    title: '地理：氣候水文、人口、產業與區域',
    discipline: 'geography',
    items: [
      { code: '地 Ac-Ⅳ-1～4', summary: '天氣／氣候、臺灣氣候、水資源與颱風生活探究' },
      { code: '地 Ad-Ⅳ-1～4', summary: '人口成長／分布、人口組成、多元文化與人口問題探究' },
      { code: '地 Ae-Ⅳ-1～4', summary: '農業、工業、國際貿易／全球關連與產業調適' },
      { code: '地 Af-Ⅳ-1～4', summary: '聚落／交通、都市化、區域差異與原住民族生活空間／生態保育探究' },
      { code: '田野觀察 Ad/Ae/Af', summary: '觀察學校附近人文景觀並以文字、圖像、影音等方式呈現' },
    ],
  },
  {
    unitId: 'g7-social-s2-u2',
    title: '歷史：清帝國、日治與戰後臺灣',
    discipline: 'history',
    items: [
      { code: '歷 Ca-Ⅳ-1～2', summary: '清帝國統治政策與農商業發展' },
      { code: '歷 Cb-Ⅳ-1～2', summary: '原住民族社會變化與漢人社會活動' },
      { code: '歷 Ea-Ⅳ-1～3 / Eb-Ⅳ-1～3', summary: '日治統治體制、基礎建設／產業政策、原住民族政策與社會文化變遷' },
      { code: '歷 Fa-Ⅳ-1～4 / Fb-Ⅳ-1～2', summary: '戰後政治外交、二二八／白色恐怖、原住民族政策、兩岸／國際、經濟社會與大眾文化' },
      { code: '歷 G-Ⅳ-1～2', summary: '地方史探究（二）與史料／踏查' },
    ],
  },
  {
    unitId: 'g7-social-s2-u3',
    title: '公民：社會互動、規範、文化與福利',
    discipline: 'civics',
    items: [
      { code: '公 Bb-Ⅳ-1～2', summary: '團體、志願結社與公共生活' },
      { code: '公 Bc-Ⅳ-1～3', summary: '社會規範、法律與其他規範、文化關係及規範隨時空變動' },
      { code: '公共議題探究', summary: '以具體案例比較規範、文化、群體差異與公平，不提前把八年級政治／法律主軸搬入七年級' },
    ],
  },
]

export function getSocial7Scope(unitId: string) {
  return SOCIAL7_SCOPE.find((item) => item.unitId === unitId) ?? null
}

export function social7ScopeUnitIds() {
  return SOCIAL7_SCOPE.map((item) => item.unitId)
}
