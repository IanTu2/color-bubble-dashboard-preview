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

export type CurriculumPathwayId =
  | 'life'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'earth-science'
  | 'geography'
  | 'history'
  | 'civics'
  | 'math-a'
  | 'math-b'
  | 'math-alpha'
  | 'math-beta'

export type CurriculumRouteOption = {
  id: string
  subject: CurriculumSubjectId
  pathway?: CurriculumPathwayId
  icon: string
  labelZh: string
  labelEn: string
  hintZh: string
  hintEn: string
  extension?: boolean
}

export type ResolvedCurriculumUnit = {
  grade: number
  subject: CurriculumSubjectId
  pathway?: CurriculumPathwayId
  semester: CurriculumSemester
  unitIndex: number
  unit: CurriculumUnitPlan
}

type UnitSeed = [title: string, focus: string, difficulty?: CurriculumDifficultyBand, prerequisites?: string[]]
type PathwaySeed = { semesterOne: UnitSeed[]; semesterTwo: UnitSeed[]; note: string; sourceBasis: string }

const BASE_ROUTE_META: Record<CurriculumSubjectId, Omit<CurriculumRouteOption, 'id' | 'subject'>> = {
  chinese: { icon: '文', labelZh: '國文', labelEn: 'Chinese', hintZh: '閱讀・語文・寫作', hintEn: 'Reading · language · writing' },
  english: { icon: 'EN', labelZh: '英文', labelEn: 'English', hintZh: '字彙・句型・聽讀寫', hintEn: 'Words · patterns · listening & reading' },
  math: { icon: '∑', labelZh: '數學', labelEn: 'Math', hintZh: '觀念・例題・解題', hintEn: 'Concepts · examples · problem solving' },
  science: { icon: '⚗', labelZh: '自然', labelEn: 'Science', hintZh: '觀察・實驗・推理', hintEn: 'Observation · experiments · reasoning' },
  social: { icon: '社', labelZh: '社會', labelEn: 'Social studies', hintZh: '歷史・地理・公民', hintEn: 'History · geography · civics' },
}

const PATHWAY_META: Record<CurriculumPathwayId, Omit<CurriculumRouteOption, 'id' | 'subject' | 'pathway'>> = {
  life: { icon: '生', labelZh: '生活課程', labelEn: 'Life curriculum', hintZh: '生活探索・自然觀察・社會互動', hintEn: 'Life inquiry · nature · community' },
  physics: { icon: '物', labelZh: '物理', labelEn: 'Physics', hintZh: '運動・力・能量・波與電磁', hintEn: 'Motion · force · energy · waves' },
  chemistry: { icon: '化', labelZh: '化學', labelEn: 'Chemistry', hintZh: '物質・反應・平衡・材料', hintEn: 'Matter · reactions · equilibrium' },
  biology: { icon: '生', labelZh: '生物', labelEn: 'Biology', hintZh: '細胞・遺傳・生理・生態', hintEn: 'Cells · genetics · physiology' },
  'earth-science': { icon: '地', labelZh: '地球科學', labelEn: 'Earth science', hintZh: '地質・大氣・海洋・天文', hintEn: 'Geology · atmosphere · ocean · space' },
  geography: { icon: '圖', labelZh: '地理', labelEn: 'Geography', hintZh: '空間・區域・人地關係', hintEn: 'Space · regions · human-environment' },
  history: { icon: '史', labelZh: '歷史', labelEn: 'History', hintZh: '史料・時序・變遷・因果', hintEn: 'Sources · chronology · change' },
  civics: { icon: '公', labelZh: '公民與社會', labelEn: 'Civics and society', hintZh: '社會・政治・法律・經濟', hintEn: 'Society · politics · law · economics' },
  'math-a': { icon: 'A', labelZh: '數學 A', labelEn: 'Mathematics A', hintZh: '高二必修 A 類路線', hintEn: 'Grade 11 required A track' },
  'math-b': { icon: 'B', labelZh: '數學 B', labelEn: 'Mathematics B', hintZh: '高二必修 B 類路線', hintEn: 'Grade 11 required B track' },
  'math-alpha': { icon: '甲', labelZh: '數學甲', labelEn: 'Advanced Mathematics I', hintZh: '高三加深加廣選修', hintEn: 'Grade 12 advanced elective' },
  'math-beta': { icon: '乙', labelZh: '數學乙', labelEn: 'Advanced Mathematics II', hintZh: '高三加深加廣選修', hintEn: 'Grade 12 advanced elective' },
}

function baseRoute(subject: CurriculumSubjectId, extension = false): CurriculumRouteOption {
  return { id: subject, subject, ...BASE_ROUTE_META[subject], extension }
}

function pathwayRoute(subject: CurriculumSubjectId, pathway: CurriculumPathwayId): CurriculumRouteOption {
  return { id: pathway, subject, pathway, ...PATHWAY_META[pathway] }
}

export function getCurriculumRouteOptions(grade: number): CurriculumRouteOption[] {
  if (grade <= 2) {
    return [
      baseRoute('chinese'),
      baseRoute('english', true),
      baseRoute('math'),
      pathwayRoute('science', 'life'),
    ]
  }

  if (grade <= 9) return ['chinese', 'english', 'math', 'science', 'social'].map((subject) => baseRoute(subject as CurriculumSubjectId))

  const languages = [baseRoute('chinese'), baseRoute('english')]
  const math = grade === 10
    ? [baseRoute('math')]
    : grade === 11
      ? [pathwayRoute('math', 'math-a'), pathwayRoute('math', 'math-b')]
      : [pathwayRoute('math', 'math-alpha'), pathwayRoute('math', 'math-beta')]
  const sciences = [
    pathwayRoute('science', 'physics'),
    pathwayRoute('science', 'chemistry'),
    pathwayRoute('science', 'biology'),
    pathwayRoute('science', 'earth-science'),
  ]
  const socials = [
    pathwayRoute('social', 'geography'),
    pathwayRoute('social', 'history'),
    pathwayRoute('social', 'civics'),
  ]
  return [...languages, ...math, ...sciences, ...socials]
}

export function getCurriculumCourseMeta(subject: CurriculumSubjectId, pathway?: CurriculumPathwayId) {
  if (pathway) return PATHWAY_META[pathway]
  return BASE_ROUTE_META[subject]
}

function routeToken(subject: CurriculumSubjectId, pathway?: CurriculumPathwayId) {
  return pathway ?? subject
}

function customUnit(grade: number, subject: CurriculumSubjectId, pathway: CurriculumPathwayId | undefined, semester: CurriculumSemester, index: number, seed: UnitSeed): CurriculumUnitPlan {
  return {
    id: `g${grade}-${routeToken(subject, pathway)}-s${semester}-u${index + 1}`,
    title: seed[0],
    focus: seed[1],
    difficultyBand: seed[2] ?? (index === 0 ? 'foundation' : 'core'),
    prerequisiteSkills: seed[3] ?? [],
    lessonIds: [],
  }
}

function customTrack(grade: number, subject: CurriculumSubjectId, pathway: CurriculumPathwayId | undefined, seed: PathwaySeed): CurriculumTrackPlan {
  return {
    grade,
    subject,
    sourceBasis: seed.sourceBasis,
    note: seed.note,
    semesters: [
      { semester: 1, units: seed.semesterOne.map((item, index) => customUnit(grade, subject, pathway, 1, index, item)) },
      { semester: 2, units: seed.semesterTwo.map((item, index) => customUnit(grade, subject, pathway, 2, index, item)) },
    ],
  }
}

const LIFE_TRACKS: Record<1 | 2, PathwaySeed> = {
  1: {
    sourceBasis: '十二年國民基本教育國民小學生活課程第一學習階段方向（Bubble Space v13 路線）',
    note: '一年級以「生活課程」統整自然觀察、社會互動、表達與生活實作，不再拆成獨立自然與社會。',
    semesterOne: [
      ['認識自己與新生活', '從身體感受、情緒、作息與新環境建立自我照顧和表達能力。'],
      ['校園探索與安全', '觀察校園空間、人物與設施，練習路線、安全規則與求助。'],
      ['用感官發現世界', '透過看、聽、聞、觸等方式觀察生活物件與自然現象，練習描述差異。'],
    ],
    semesterTwo: [
      ['家庭、社區與互助', '認識家庭與社區中的人物、場所、工作與互相幫助。'],
      ['動植物與季節', '觀察常見生物、天氣與季節變化，連結生活中的照顧與行動。'],
      ['材料、遊戲與創作', '比較生活材料的性質，在遊戲、製作與整理過程中提出問題並改進。'],
    ],
  },
  2: {
    sourceBasis: '十二年國民基本教育國民小學生活課程第一學習階段方向（Bubble Space v13 路線）',
    note: '二年級延續生活課程統整，以生活問題、觀察、實作、合作與表達串起自然與社會經驗。',
    semesterOne: [
      ['成長、關係與責任', '覺察自己的成長與需要，理解同學、家庭成員之間的關係、分工與尊重。'],
      ['社區的人與服務', '透過走訪、訪問與地圖初步認識社區工作、公共場所與生活服務。'],
      ['天氣、光影與聲音', '從生活情境觀察天氣、光影、聲音與環境變化，練習記錄與比較。'],
    ],
    semesterTwo: [
      ['植物、動物與環境', '觀察生物成長、需求與棲地，思考人如何照顧環境。'],
      ['力、材料與生活工具', '從推拉、磁鐵、材料與工具探索物體的變化和用途。'],
      ['生活問題小探究', '從真實生活問題提出問題、蒐集觀察、合作實作並分享改進結果。'],
    ],
  },
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

const HS_SOURCE = '十二年國民基本教育普通型高級中等學校領域／科目課程綱要方向（Bubble Space v13 分科路線）'

const HIGH_SCHOOL_PATHWAYS: Partial<Record<CurriculumPathwayId, Record<number, PathwaySeed>>> = {
  physics: {
    10: { sourceBasis: HS_SOURCE, note: '高一物理基礎路線，和化學、生物、地球科學分開呈現。', semesterOne: [['測量、運動與模型', '物理量、單位、向量初步、位置與運動圖表。'], ['力與交互作用', '力、牛頓運動觀念、摩擦與受力分析。'], ['功、能量與守恆', '功、動能、位能、能量轉換與效率。']], semesterTwo: [['波與聲音', '週期、頻率、波的傳播與聲音現象。'], ['光與成像', '反射、折射、透鏡與基本成像。'], ['電、磁與能源', '電路、電能、磁現象及能源科技的基礎。']] },
    11: { sourceBasis: HS_SOURCE, note: '高二物理以學科模型與量化推理深化。', semesterOne: [['力學深化', '運動方程、牛頓定律、圓周運動與力學模型。'], ['動量與碰撞', '動量、衝量、碰撞與守恆。'], ['熱與能量', '熱、溫度、能量傳遞與熱力學基礎。']], semesterTwo: [['振動與波動', '簡諧運動、波的疊加、共振與波動現象。'], ['電場與電位', '電荷、電場、電位與電容的模型。'], ['磁場與電磁感應', '磁力、磁場與電磁感應的基本關係。']] },
    12: { sourceBasis: HS_SOURCE, note: '高三物理採加深加廣取向，內容仍以平台自有章節名稱呈現。', semesterOne: [['進階力學與模型', '以向量、守恆與數學模型處理複合力學問題。'], ['電磁學整合', '整合電場、磁場、感應與電磁波。'], ['波動與光學深化', '干涉、繞射、幾何與波動光學的比較。']], semesterTwo: [['近代物理初探', '量子、原子與相對論的基礎觀念。'], ['物理資料與實驗', '不確定性、擬合、模型檢驗與實驗設計。'], ['物理專題與跨域', '以真實問題整合力學、電磁、波與近代物理。']] },
  },
  chemistry: {
    10: { sourceBasis: HS_SOURCE, note: '高一化學基礎路線，和其他自然科分開呈現。', semesterOne: [['物質、原子與週期', '物質分類、原子結構、元素週期性與模型。'], ['化學鍵與物質性質', '離子鍵、共價鍵、分子結構與性質關係。'], ['化學計量', '莫耳、化學式、反應式與定量關係。']], semesterTwo: [['溶液與氣體', '濃度、溶解、氣體性質與粒子觀點。'], ['化學反應與能量', '反應類型、能量變化與反應條件。'], ['化學、材料與環境', '生活材料、能源、污染與化學應用。']] },
    11: { sourceBasis: HS_SOURCE, note: '高二化學深化反應、平衡與物質結構。', semesterOne: [['原子結構與分子形狀', '電子結構、鍵結、分子形狀與作用力。'], ['反應熱與速率', '能量變化、碰撞觀點與速率因素。'], ['化學平衡', '動態平衡、平衡常數與條件改變。']], semesterTwo: [['酸鹼與緩衝', '酸鹼模型、pH、中和與緩衝觀念。'], ['氧化還原與電化學', '電子轉移、電池與電解的基本模型。'], ['有機化學基礎', '官能基、結構、反應與生活有機物。']] },
    12: { sourceBasis: HS_SOURCE, note: '高三化學以選修與探究取向整合。', semesterOne: [['有機與生物分子', '有機結構、反應與生物分子的化學基礎。'], ['材料與高分子', '高分子、材料性質與設計。'], ['化學分析', '定量、儀器、誤差與證據判讀。']], semesterTwo: [['環境與能源化學', '能源轉換、污染、循環與永續。'], ['化學實驗設計', '控制變因、量測、不確定性與安全。'], ['化學專題', '以資料與模型處理跨域化學問題。']] },
  },
  biology: {
    10: { sourceBasis: HS_SOURCE, note: '高一生物基礎路線，獨立呈現生命科學概念。', semesterOne: [['細胞與生命物質', '細胞構造、膜、蛋白質與生命物質。'], ['代謝與能量', '酵素、呼吸、光合作用與能量轉換。'], ['遺傳資訊', 'DNA、基因、染色體與遺傳基本概念。']], semesterTwo: [['生物體的調節', '恆定、神經、內分泌與生理調節。'], ['生殖、發育與遺傳', '細胞分裂、生殖、遺傳與變異。'], ['演化、生態與多樣性', '演化、生物多樣性、生態關係與保育。']] },
    11: { sourceBasis: HS_SOURCE, note: '高二生物深化分子、生理、演化與生態。', semesterOne: [['分子遺傳', 'DNA 複製、基因表現、突變與調控。'], ['細胞訊息與代謝', '細胞訊息、酵素、能量與代謝網絡。'], ['植物生理', '運輸、光合作用、激素與環境反應。']], semesterTwo: [['動物生理', '循環、呼吸、排泄、神經與內分泌。'], ['遺傳與演化', '遺傳模式、族群變異、天擇與演化證據。'], ['生態系統', '能量流、物質循環、族群與群集。']] },
    12: { sourceBasis: HS_SOURCE, note: '高三生物採加深加廣與探究取向。', semesterOne: [['基因體與生物技術', '基因體、基因工程、技術證據與倫理。'], ['生理調控深化', '多系統整合、恆定與疾病機制。'], ['演化與分類深化', '系統發育、演化機制與證據。']], semesterTwo: [['生態與全球變遷', '族群、生態系、氣候變遷與保育。'], ['生物資料分析', '圖表、統計、實驗設計與因果限制。'], ['生命科學專題', '以真實資料整合分子、生理、演化與生態。']] },
  },
  'earth-science': {
    10: { sourceBasis: HS_SOURCE, note: '高一地球科學基礎路線，和物理、化學、生物分開。', semesterOne: [['地球系統與觀測', '地球圈層、尺度、觀測資料與系統觀。'], ['板塊與地質作用', '板塊運動、岩石、地震與地表作用。'], ['大氣與天氣', '大氣結構、氣象要素與天氣系統。']], semesterTwo: [['海洋與水循環', '海水性質、洋流、水循環與海氣交互作用。'], ['氣候與環境變遷', '氣候系統、自然變率、人為影響與證據。'], ['太陽系與宇宙', '地球運動、太陽系、恆星與宇宙尺度。']] },
    11: { sourceBasis: HS_SOURCE, note: '高二地科深化地質、海氣與天文資料判讀。', semesterOne: [['地球內部與地史', '地震波、地球內部、岩層與地史證據。'], ['地表與天然災害', '侵蝕、沉積、坡地、地震與災害風險。'], ['大氣動力與天氣', '氣壓、風、鋒面、颱風與天氣圖。']], semesterTwo: [['海洋環流', '洋流、海氣交換與氣候連結。'], ['氣候系統', '能量收支、氣候回饋與長期變化。'], ['恆星與宇宙', '恆星性質、演化、星系與宇宙觀測。']] },
    12: { sourceBasis: HS_SOURCE, note: '高三地科採資料、模型與跨系統整合取向。', semesterOne: [['地球歷史與證據', '年代、地層、化石與地球演變。'], ['氣候變遷證據', '觀測紀錄、代理資料、模型與不確定性。'], ['海氣耦合', '海洋與大氣互動、極端事件與全球變化。']], semesterTwo: [['太空觀測與行星科學', '觀測工具、行星系統與太空資料。'], ['地球科學資料分析', '時間序列、空間資料、相關與因果限制。'], ['地球系統專題', '整合地質、大氣、海洋與天文處理真實問題。']] },
  },
  geography: {
    10: { sourceBasis: HS_SOURCE, note: '高中社會領域以地理、歷史、公民與社會分科呈現。', semesterOne: [['地理方法與空間資料', '地圖、比例尺、GIS、定位與空間資料判讀。'], ['自然環境與地形', '地形、氣候、水文與自然作用的空間差異。'], ['人口、聚落與都市', '人口變遷、遷移、聚落與都市化。']], semesterTwo: [['產業與全球經濟', '農業、工業、服務業與全球生產網絡。'], ['區域與文化', '區域形成、文化景觀與空間認同。'], ['人地關係與風險', '災害、資源、環境與永續的空間分析。']] },
    11: { sourceBasis: HS_SOURCE, note: '高二地理深化區域、經濟與人地議題。', semesterOne: [['區域分析', '比較區域形成、核心邊陲與發展差異。'], ['全球人口與移動', '人口結構、遷移、都市與跨國移動。'], ['經濟地理', '產業區位、供應鏈、貿易與全球化。']], semesterTwo: [['環境變遷與調適', '氣候、資源、災害風險與調適。'], ['空間規劃', '土地使用、交通、都市與區域規劃。'], ['地理資料專題', '以 GIS、統計與地圖處理真實空間問題。']] },
    12: { sourceBasis: HS_SOURCE, note: '高三地理以議題研究、資料與空間決策為主。', semesterOne: [['全球議題與區域連結', '全球化、人口、能源、糧食與區域互賴。'], ['都市與治理', '都市問題、交通、住宅、公共空間與治理。'], ['環境正義與永續', '風險、資源分配、調適與環境正義。']], semesterTwo: [['地理資訊進階', '空間資料、圖層、尺度與模型限制。'], ['區域研究專題', '以多種資料比較不同區域的形成與變遷。'], ['地理探究與表達', '完成地圖、資料分析、論證與決策建議。']] },
  },
  history: {
    10: { sourceBasis: HS_SOURCE, note: '高中歷史獨立於地理與公民呈現，強調史料與歷史思考。', semesterOne: [['史料、時序與歷史解釋', '來源、脈絡、互證、因果、延續與變遷。'], ['臺灣史的多元脈絡', '族群、政權、社會、經濟與世界連結。'], ['東亞歷史互動', '國家、交流、文化與區域秩序。']], semesterTwo: [['世界史與近代轉型', '革命、工業化、帝國與民族國家。'], ['戰爭、冷戰與國際秩序', '戰爭動員、冷戰、去殖民與全球秩序。'], ['歷史記憶與公共史', '記憶、紀念、博物館與公共敘事。']] },
    11: { sourceBasis: HS_SOURCE, note: '高二歷史以主題與比較方法深化。', semesterOne: [['國家與社會變遷', '比較不同時代國家制度與社會關係。'], ['經濟、技術與生活', '生產、交易、技術與日常生活的長期變遷。'], ['思想、宗教與文化', '思想傳播、宗教、教育與文化交流。']], semesterTwo: [['帝國、殖民與抵抗', '殖民治理、全球連結與在地回應。'], ['戰爭、革命與民主化', '政治動員、制度變遷與人權。'], ['主題史研究', '以多份史料形成問題意識與歷史論證。']] },
    12: { sourceBasis: HS_SOURCE, note: '高三歷史以專題、史料與歷史論證為主。', semesterOne: [['臺灣與世界連結', '從貿易、移民、帝國與國際政治理解臺灣。'], ['全球史議題', '以跨區域視角分析人口、商品、技術與思想流動。'], ['歷史爭議與證據', '處理相互衝突史料、觀點與不確定性。']], semesterTwo: [['口述、影像與數位史料', '比較不同媒介史料的優勢與限制。'], ['公共歷史與記憶', '紀念、文化資產、轉型正義與公共敘事。'], ['歷史研究專題', '完成問題、史料、論證與引用完整研究。']] },
  },
  civics: {
    10: { sourceBasis: HS_SOURCE, note: '高中公民與社會獨立於歷史、地理呈現。', semesterOne: [['自我、社會與多元文化', '身分、社會化、群體、文化與不平等。'], ['民主政治與公共參與', '國家、政府、民主、選舉、媒體與參與。'], ['法律、權利與法治', '基本權利、法律位階、程序與救濟。']], semesterTwo: [['市場與經濟選擇', '機會成本、供需、市場、外部性與政府角色。'], ['公共政策與社會福利', '政策目標、利害關係人、財政、福利與公平。'], ['全球化與公民責任', '全球連結、人權、環境與跨國公共問題。']] },
    11: { sourceBasis: HS_SOURCE, note: '高二公民與社會深化政治、經濟、法律與政策分析。', semesterOne: [['憲政與民主治理', '權力分立、責任政治、監督與民主韌性。'], ['法律與權利保障', '比例原則、平等、程序與權利衝突。'], ['媒體與公共論證', '資訊來源、偏誤、輿論與公共討論。']], semesterTwo: [['總體經濟與政策', '景氣、物價、就業、財政與貨幣政策基礎。'], ['社會政策與公平', '福利、風險分擔、不平等與政策選擇。'], ['公共議題分析', '以資料、價值與替代方案形成政策判斷。']] },
    12: { sourceBasis: HS_SOURCE, note: '高三公民與社會以制度、全球議題與研究整合為主。', semesterOne: [['民主、人權與全球治理', '民主制度、人權保障、國際組織與全球治理。'], ['法律案例與制度分析', '從案例比較規範、權利、程序與救濟。'], ['經濟與社會變遷', '科技、勞動、人口、平台經濟與不平等。']], semesterTwo: [['公共政策評估', '政策效果、成本、分配、權利與證據。'], ['公民行動與社會參與', '倡議、組織、協作、溝通與民主責任。'], ['公民與社會專題', '以真實議題完成資料、論證、方案與反思。']] },
  },
  'math-a': {
    11: { sourceBasis: '十二年國民基本教育數學領域高中數學 A 類課程方向（Bubble Space v13）', note: '高二數學 A 為獨立必修路線，不再和數學 B 混成一套共同章節。', semesterOne: [['三角比與三角函數', '三角比、弧度、三角函數圖形與週期現象。'], ['平面向量', '向量運算、內積、坐標與幾何應用。'], ['空間與幾何關係', '空間坐標、直線平面與幾何推理。']], semesterTwo: [['矩陣與線性關係', '矩陣表示、運算與線性關係應用。'], ['排列組合與機率', '計數原理、排列組合、條件與機率模型。'], ['資料分析與推論', '統計量、資料分布、模型與解讀限制。']] },
  },
  'math-b': {
    11: { sourceBasis: '十二年國民基本教育數學領域高中數學 B 類課程方向（Bubble Space v13）', note: '高二數學 B 是為不同學習需求設計的獨立必修路線，不是把數學 A 刪減後重新命名。', semesterOne: [['函數、圖表與建模', '用函數、表格與圖形描述生活與社會資料。'], ['幾何、測量與設計', '以比例、坐標、圖形與測量處理實際問題。'], ['指數、成長與財務情境', '理解成長、衰減、利率與指數模型。']], semesterTwo: [['資料分析與統計', '資料整理、分布、統計量與圖表判讀。'], ['機率與風險', '基本機率、條件、風險與決策情境。'], ['數學素養專題', '以真實資料整合函數、幾何、統計與決策。']] },
  },
  'math-alpha': {
    12: { sourceBasis: '十二年國民基本教育數學領域高三數學甲加深加廣方向（Bubble Space v13）', note: '數學甲是高三加深加廣選修；平台不把它誤標成所有高三學生的共同必修。', semesterOne: [['極限與微分', '極限直觀、導數、變化率與函數局部性質。'], ['微分應用', '切線、單調、極值、最佳化與模型。'], ['積分與累積', '反導數、面積、累積量與微積分基本關係。']], semesterTwo: [['空間向量與幾何深化', '空間向量、平面、距離與位置關係。'], ['機率與統計深化', '隨機變數、分布、期望與資料推論。'], ['數學甲整合問題', '以微積分、幾何、機率與模型處理跨章問題。']] },
  },
  'math-beta': {
    12: { sourceBasis: '十二年國民基本教育數學領域高三數學乙加深加廣方向（Bubble Space v13）', note: '數學乙是高三加深加廣選修；它不是數學 B 的必然續修，學生可依升學與學習需求選擇。', semesterOne: [['函數與多項式變化', '以函數與多項式描述變化，銜接基礎微分觀念。'], ['微分與生活模型', '變化率、極值與經濟、社會資料的簡單模型。'], ['機率模型', '隨機、條件機率、期望與風險判讀。']], semesterTwo: [['統計與資料推論', '資料分布、抽樣、估計與不確定性。'], ['矩陣、資料與應用', '矩陣表示、資料關係與實際情境。'], ['數學乙整合專題', '以函數、機率、統計與資料完成實際問題分析。']] },
  },
}

function grade7MathTrack(): CurriculumTrackPlan {
  return customTrack(7, 'math', undefined, {
    sourceBasis: '十二年國民基本教育數學領域七年級學習內容（Bubble Space v5 researched roadmap）',
    note: '此路線依七年級 108 課綱 N／S／G／A／D 學習內容重新整理；章節名稱採平台自有表述，教材內容另行撰寫。',
    semesterOne: MATH7_SEMESTER_ONE,
    semesterTwo: MATH7_SEMESTER_TWO,
  })
}

function grade7SocialTrack(): CurriculumTrackPlan {
  return customTrack(7, 'social', undefined, {
    sourceBasis: '十二年國民基本教育社會領域第四學習階段方向＋公開七年級地理／歷史／公民課程結構（Bubble Space v5 researched roadmap）',
    note: '七年級公民依「家庭與社區 → 社會」安排；政治與法律留到後續年級。地理、歷史、公民仍以同一「社會」入口呈現，但各單元保留學科身分。',
    semesterOne: SOCIAL7_SEMESTER_ONE,
    semesterTwo: SOCIAL7_SEMESTER_TWO,
  })
}

function pathwayTrack(grade: number, subject: CurriculumSubjectId, pathway: CurriculumPathwayId): CurriculumTrackPlan | null {
  if (pathway === 'life') {
    if ((grade !== 1 && grade !== 2) || subject !== 'science') return null
    return customTrack(grade, subject, pathway, LIFE_TRACKS[grade])
  }
  const seed = HIGH_SCHOOL_PATHWAYS[pathway]?.[grade]
  if (!seed) return null
  return customTrack(grade, subject, pathway, seed)
}

function ambiguousBaseRoute(grade: number, subject: CurriculumSubjectId) {
  if (grade <= 2 && (subject === 'science' || subject === 'social')) return true
  if (grade >= 10 && (subject === 'science' || subject === 'social')) return true
  if (grade >= 11 && subject === 'math') return true
  return false
}

export function getCurriculumTrack(grade: number, subject: CurriculumSubjectId, pathway?: CurriculumPathwayId): CurriculumTrackPlan | null {
  if (pathway) return pathwayTrack(grade, subject, pathway)
  if (ambiguousBaseRoute(grade, subject)) return null
  if (grade === 7 && subject === 'math') return grade7MathTrack()
  if (grade === 7 && subject === 'social') return grade7SocialTrack()
  return getBaseCurriculumTrack(grade, subject)
}

export function resolveCurriculumUnit(unitId: string): ResolvedCurriculumUnit | null {
  for (let grade = 1; grade <= 12; grade += 1) {
    for (const route of getCurriculumRouteOptions(grade)) {
      const track = getCurriculumTrack(grade, route.subject, route.pathway)
      if (!track) continue
      for (const semesterPlan of track.semesters) {
        const unitIndex = semesterPlan.units.findIndex((unit) => unit.id === unitId)
        if (unitIndex >= 0) {
          return {
            grade,
            subject: route.subject,
            pathway: route.pathway,
            semester: semesterPlan.semester,
            unitIndex,
            unit: semesterPlan.units[unitIndex],
          }
        }
      }
    }
  }
  return null
}
