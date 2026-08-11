import {
  getCurriculumTrack as getBaseCurriculumTrack,
  type CurriculumDifficultyBand,
  type CurriculumSemester,
  type CurriculumSubjectId,
  type CurriculumTrackPlan,
  type CurriculumUnitPlan,
} from './curriculum-plan'

export type {
  CurriculumDifficultyBand,
  CurriculumSemester,
  CurriculumSubjectId,
  CurriculumTrackPlan,
  CurriculumUnitPlan,
} from './curriculum-plan'

type UnitSeed = [title: string, focus: string, difficulty?: CurriculumDifficultyBand, prerequisites?: string[]]

function unit(subject: CurriculumSubjectId, semester: CurriculumSemester, index: number, seed: UnitSeed): CurriculumUnitPlan {
  return {
    id: `g7-${subject}-s${semester}-u${index + 1}`,
    title: seed[0],
    focus: seed[1],
    difficultyBand: seed[2] ?? 'core',
    prerequisiteSkills: seed[3] ?? [],
    lessonIds: [],
  }
}

const MATH7_SEMESTER_ONE: UnitSeed[] = [
  ['整數運算與科學記號', '負數與數線、絕對值、整數四則混合運算、指數與指數律，以及以科學記號表示與比較極大或極小的正數。', 'foundation', ['國小整數四則運算', '分數與小數基本運算', '位值概念']],
  ['因數分解與分數運算', '質數與合數、標準質因數分解、最大公因數、最小公倍數，以及正負分數的四則運算與應用。', 'core', ['整數乘除', '分數等值與約分通分']],
  ['一元一次方程式', '以代數符號記錄數量關係，理解一次式、同類項、方程式與解的意義，使用等量公理與移項求解並處理應用問題。', 'core', ['整數與分數四則', '分配律']],
]

const MATH7_SEMESTER_TWO: UnitSeed[] = [
  ['簡單圖形與幾何符號', '點、線、線段、射線、角、基本幾何符號、三視圖、垂直、中垂線、點到直線距離與線對稱的基本性質。', 'foundation', ['國小平面與立體圖形', '角度概念']],
  ['二元一次聯立方程式', '理解二元一次方程式、解與聯立方程式的意義，使用代入消去法與加減消去法求解並處理生活情境。', 'core', ['一元一次方程式', '代數式化簡']],
  ['直角坐標與二元一次方程式圖形', '建立平面直角坐標系、象限與方位距離觀念，理解二元一次方程式的圖形以及聯立方程式解與交點的關係。', 'core', ['二元一次方程式', '數線與有向數']],
  ['比例與正反比', '理解比、比值、比例式、連比例、正比與反比，並將比例關係用於實際數量問題。', 'core', ['分數除法', '等值分數']],
  ['一元一次不等式', '理解不等式與解的意義，解一元一次不等式並在數線上表示解的範圍，處理具體情境中的限制條件。', 'stretch', ['一元一次方程式', '數線大小比較']],
  ['統計圖表與統計數據', '蒐集、整理與呈現資料，判讀長條圖、折線圖、圓形圖、直方圖與列聯表，使用平均數、中位數與眾數描述資料特性。', 'core', ['百分率', '四則運算']],
]

const SOCIAL7_SEMESTER_ONE: UnitSeed[] = [
  ['地理：臺灣的位置、地形與海域', '從全球經緯度與海陸位置理解臺灣位置特性，再進入主要地形、海岸、海域與地形形成作用。', 'foundation', ['國小地圖方位', '基本比例尺與圖例']],
  ['歷史：史前、原住民族與大航海時代', '從史前遺址與原住民族多樣性出發，理解十六至十七世紀東亞海域交流、歐洲勢力、鄭氏與不同群體互動。', 'core', ['時間順序', '史料基本概念']],
  ['公民：自我、家庭與社區', '理解自我成長、性別尊重、家庭型態與功能、親屬關係、校園生活、終身學習與社區參與。', 'foundation', ['生活規範', '尊重差異與合作']],
]

const SOCIAL7_SEMESTER_TWO: UnitSeed[] = [
  ['地理：氣候水文、人口、產業與區域', '理解臺灣氣候水文、人口與文化、三級產業、聚落交通、都市化與不同區域發展的空間差異。', 'core', ['臺灣位置與地形', '統計圖表基本判讀']],
  ['歷史：清帝國、日治與戰後臺灣', '依時間與主題理解清帝國統治與社會變遷、日治治理與現代化、戰後政治經濟社會變化與民主化歷程。', 'core', ['大航海時代與鄭氏', '史料來源判讀']],
  ['公民：社會互動、規範、文化與福利', '理解社會互動與團體、社會規範、多元文化、社會變遷、社會福利與公平議題；不提前把八年級政治與法律當七年級主軸。', 'core', ['家庭與社區', '尊重差異與公共討論']],
]

function grade7MathTrack(): CurriculumTrackPlan {
  return {
    grade: 7,
    subject: 'math',
    sourceBasis: '十二年國民基本教育數學領域七年級學習內容（Bubble Space v5 researched roadmap）',
    note: '此路線依七年級 108 課綱 N／S／G／A／D 學習內容重新整理；章節名稱採平台自有表述，教材內容另行撰寫。',
    semesters: [
      { semester: 1, units: MATH7_SEMESTER_ONE.map((seed, index) => unit('math', 1, index, seed)) },
      { semester: 2, units: MATH7_SEMESTER_TWO.map((seed, index) => unit('math', 2, index, seed)) },
    ],
  }
}

function grade7SocialTrack(): CurriculumTrackPlan {
  return {
    grade: 7,
    subject: 'social',
    sourceBasis: '十二年國民基本教育社會領域第四學習階段方向＋公開七年級地理／歷史／公民課程結構（Bubble Space v5 researched roadmap）',
    note: '七年級公民依「家庭與社區 → 社會」安排；政治與法律留到後續年級。地理、歷史、公民仍以同一「社會」入口呈現，但各單元保留學科身分。',
    semesters: [
      { semester: 1, units: SOCIAL7_SEMESTER_ONE.map((seed, index) => unit('social', 1, index, seed)) },
      { semester: 2, units: SOCIAL7_SEMESTER_TWO.map((seed, index) => unit('social', 2, index, seed)) },
    ],
  }
}

export function getCurriculumTrack(grade: number, subject: CurriculumSubjectId): CurriculumTrackPlan | null {
  if (grade === 7 && subject === 'math') return grade7MathTrack()
  if (grade === 7 && subject === 'social') return grade7SocialTrack()
  return getBaseCurriculumTrack(grade, subject)
}
