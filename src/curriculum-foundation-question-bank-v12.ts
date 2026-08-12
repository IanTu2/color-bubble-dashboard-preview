import type { FoundationUnitContent } from './curriculum-foundation-content'
import type {
  ReviewedChoiceQuestion,
  ReviewedConcept,
  ReviewedQuestion,
  ReviewedResponseQuestion,
} from './curriculum-reviewed-social10'

export type CurriculumQuestionEnhancement = {
  optionFeedback?: string[]
  mediaAssetId?: string
  audioText?: string
  rubric?: string[]
}

type EnhancedChoice = ReviewedChoiceQuestion & CurriculumQuestionEnhancement
type EnhancedResponse = ReviewedResponseQuestion & CurriculumQuestionEnhancement

type Unit = FoundationUnitContent

function choice(
  level: ReviewedChoiceQuestion['level'],
  prompt: string,
  options: string[],
  correctIndex: number,
  explanation: string,
  context?: string,
  enhancement: CurriculumQuestionEnhancement = {},
): EnhancedChoice {
  return {
    id: '',
    kind: 'choice',
    level,
    context,
    prompt,
    options,
    correctIndex,
    explanation,
    ...enhancement,
  }
}

function response(
  level: ReviewedResponseQuestion['level'],
  prompt: string,
  sampleAnswer: string,
  explanation: string,
  context?: string,
  enhancement: CurriculumQuestionEnhancement = {},
): EnhancedResponse {
  return {
    id: '',
    kind: 'response',
    level,
    context,
    prompt,
    sampleAnswer,
    explanation,
    ...enhancement,
  }
}

function feedback(correct: string, ...wrong: string[]) {
  return [correct, ...wrong]
}

function unitText(unit: Unit) {
  return `${unit.overview} ${unit.concepts.map((item) => `${item.title} ${item.explanation} ${item.example ?? ''}`).join(' ')}`
}

function firstConcept(unit: Unit, match?: RegExp): ReviewedConcept {
  if (match) {
    const found = unit.concepts.find((item) => match.test(`${item.title} ${item.explanation} ${item.example ?? ''}`))
    if (found) return found
  }
  return unit.concepts[0] ?? { title: '本單元核心概念', explanation: unit.overview }
}

function mathQuestions(unit: Unit): ReviewedQuestion[] {
  const text = unitText(unit)
  const questions: ReviewedQuestion[] = []

  if (unit.grade <= 2) {
    questions.push(
      choice('理解', '小安有 5 顆球，又拿到 3 顆。現在共有幾顆？', ['8 顆', '2 顆', '5 顆', '15 顆'], 0, '5+3=8。把兩次拿到的數量合起來就是加法。', undefined, { optionFeedback: feedback('正確，5 和 3 合起來是 8。', '2 是把 3 從 5 拿走的結果。', '只算到原本的 5 顆。', '把 5 和 3 直接併成 53 或相乘都不符合題意。') }),
      choice('理解', '哪一個數最大？', ['14', '9', '11', '6'], 0, '比較兩位數時先看十位；14 的十位是 1，再比較個位後可知 14 最大。'),
      choice('應用', '桌上有 9 本書，拿走 4 本，還剩幾本？', ['5 本', '13 本', '4 本', '6 本'], 0, '9−4=5。題目描述的是原有數量減少。'),
      choice('理解', '哪一個圖形有 4 條一樣長的邊和 4 個直角？', ['正方形', '三角形', '圓形', '長方形一定四邊等長'], 0, '正方形四邊等長且四個角都是直角。'),
      response('應用', '請自己舉一個生活中的加法或減法例子，並寫出算式。', '例如：盒子裡有 6 枝筆，再放進 2 枝，6+2=8，所以共有 8 枝。', '能把故事中的「增加／減少」和正確算式連起來即可。', undefined, { rubric: ['情境中的數量清楚', '算式和情境方向一致', '答案有單位或完整語句'] }),
    )
  }

  if (/負數|數線|絕對值/.test(text)) {
    questions.push(choice('理解', '溫度原本是 3°C，下降 7°C 後是多少？', ['−4°C', '4°C', '10°C', '−10°C'], 0, '3−7=−4，所以降溫後是 −4°C。', undefined, { optionFeedback: feedback('正確，從 3 往數線左邊移 7 格到 −4。', '4 忽略了下降方向。', '10 是把下降誤當增加。', '−10 多減了一次原本的 3。') }))
  }
  if (/指數|科學記號/.test(text)) {
    questions.push(choice('理解', '2³×2² 等於哪一個式子？', ['2⁵', '4⁵', '2⁶', '2¹'], 0, '同底數相乘時指數相加：2³×2²=2⁵。'))
  }
  if (/質數|因數|倍數|質因數/.test(text)) {
    questions.push(choice('應用', '84 的質因數分解是哪一個？', ['2²×3×7', '2×42', '4×21', '2³×3×7'], 0, '84=2×42=2²×21=2²×3×7，最後每個因數都必須是質數。'))
  }
  if (/分數/.test(text)) {
    questions.push(choice('應用', '3/4−1/6 等於多少？', ['7/12', '2/2', '1/2', '5/12'], 0, '通分成十二分之一：9/12−2/12=7/12。'))
  }
  if (/方程式|一次式/.test(text)) {
    questions.push(choice('應用', '解方程式 3x+5=20，x 是多少？', ['5', '25/3', '15', '8'], 0, '兩邊先同減 5 得 3x=15，再同除以 3 得 x=5。', undefined, { optionFeedback: feedback('正確，代回可得 3×5+5=20。', '只把 20 除以 3，沒有先處理 +5。', '15 是 3x 的值，不是 x。', '把 20−5 算錯或漏除以 3。') }))
  }
  if (/聯立/.test(text)) {
    questions.push(choice('應用', '若 x+y=10 且 x−y=2，則 x 是多少？', ['6', '4', '8', '12'], 0, '兩式相加得到 2x=12，所以 x=6。'))
  }
  if (/坐標|象限/.test(text)) {
    questions.push(choice('理解', '點 (−3, 2) 位於哪一象限？', ['第二象限', '第一象限', '第三象限', '第四象限'], 0, 'x<0、y>0，因此位於第二象限。'))
  }
  if (/比例|正比|反比|百分/.test(text)) {
    questions.push(choice('應用', '3 枝筆售價 45 元，若單價不變，5 枝多少元？', ['75 元', '60 元', '90 元', '225 元'], 0, '每枝 45÷3=15 元，5 枝為 15×5=75 元。'))
  }
  if (/不等式/.test(text)) {
    questions.push(choice('應用', '解 −2x>6，下列何者正確？', ['x<−3', 'x>−3', 'x<3', 'x>3'], 0, '兩邊除以負數 −2 時，不等號方向要反轉，因此 x<−3。'))
  }
  if (/統計|平均|中位|眾數/.test(text)) {
    questions.push(choice('應用', '資料 4、6、8、12 的平均數是多少？', ['7.5', '8', '6', '30'], 0, '(4+6+8+12)÷4=30÷4=7.5。'))
  }
  if (/幾何|角|三角|多邊形/.test(text)) {
    questions.push(choice('理解', '三角形兩個內角是 50°、60°，第三個內角是多少？', ['70°', '80°', '90°', '110°'], 0, '三角形內角和 180°，所以 180−50−60=70°。'))
  }
  if (/函數/.test(text)) {
    questions.push(choice('應用', '若 y=2x+3，當 x=4 時 y 等於多少？', ['11', '8', '7', '14'], 0, '把 x=4 代入：y=2×4+3=11。'))
  }
  if (/機率/.test(text)) {
    questions.push(choice('應用', '袋中有 3 顆紅球、2 顆藍球，隨機取 1 顆，取到紅球的機率是？', ['3/5', '2/5', '1/2', '3/2'], 0, '共有 5 顆球，其中 3 顆紅球，所以機率是 3/5。'))
  }

  return fillWithConceptResponses(unit, questions, 'math')
}

function chineseQuestions(unit: Unit): ReviewedQuestion[] {
  const text = unitText(unit)
  const questions: ReviewedQuestion[] = []

  if (/注音|聲韻|聲調/.test(text)) {
    questions.push(choice('理解', '「媽、麻、馬、罵」主要是哪一個語音特徵不同？', ['聲調', '聲母', '韻母', '字數'], 0, '四個字的聲母與韻母相近，聲調不同會造成字義不同。'))
  }
  if (/字詞|詞義|語境|成語/.test(text)) {
    questions.push(choice('理解', '句子「比賽最後一分鐘，他仍然很沉著地完成投籃」中的「沉著」最接近哪個意思？', ['冷靜不慌張', '非常疲倦', '動作很慢', '心情很悲傷'], 0, '從「最後一分鐘」的壓力情境和「仍然」可以推知沉著指冷靜不慌張。'))
  }
  if (/句型|句法|標點|因果/.test(text)) {
    questions.push(choice('理解', '哪一句最清楚表達「因果」關係？', ['因為下大雨，所以比賽延期。', '下大雨，比賽，延期。', '比賽很精彩，而且下雨。', '雖然延期，所以晴天。'], 0, '「因為…所以…」清楚標示原因與結果。'))
  }
  if (/故事|敘事|人物|情節|描寫/.test(text)) {
    questions.push(choice('應用', '閱讀：「小晴走到校門口才發現作業本留在桌上。她看了看時間，轉身快跑回家。」哪個細節最能表現她的焦急？', ['轉身快跑回家', '走到校門口', '作業本在桌上', '她叫小晴'], 0, '「快跑」是直接表現急迫狀態的動作描寫。'))
  }
  if (/段落|主旨|篇章|說明文/.test(text)) {
    questions.push(choice('應用', '閱讀：「樹蔭能降低地表受日照的程度，也能讓行人停留休息。都市增加適當的行道樹，有助改善步行環境。」這段主要在說什麼？', ['行道樹能改善都市步行環境', '所有城市都很炎熱', '樹木只用來裝飾', '行人一定喜歡散步'], 0, '前兩句提供樹蔭的作用，最後一句統整成行道樹改善步行環境的主旨。'))
  }
  if (/修辭|擬人|譬喻/.test(text)) {
    questions.push(choice('理解', '「晚風吹進窗子，把窗簾叫醒了。」主要用了哪一種表達方式？', ['擬人', '排比', '引用', '設問'], 0, '把窗簾寫成能被「叫醒」的人，是擬人。'))
  }
  if (/文言|古文|古典/.test(text)) {
    questions.push(choice('應用', '自寫古文：「童見雨驟，急收書入室。」最接近哪個意思？', ['孩子看見雨突然變大，趕快把書收進屋內。', '孩子在屋內看書直到下雨。', '孩子把雨水收進書裡。', '孩子因為書很多所以不出門。'], 0, '「驟」是突然、急促；「入室」是進入屋內。'))
  }
  if (/詩|意象|韻文/.test(text)) {
    questions.push(choice('應用', '短詩：「空車站／一盞燈／把晚風等得更長」最可能營造哪種感受？', ['等待與孤單', '熱鬧慶典', '緊張比賽', '歡樂聚餐'], 0, '空車站、單獨的燈與「等」共同形成等待、寂寥的意象。'))
  }
  if (/論說|論證|證據|主張/.test(text)) {
    questions.push(choice('應用', '主張「學校應增加飲水機」。哪一項最適合作為可檢查的證據？', ['現有飲水機尖峰時段平均排隊 8 分鐘的紀錄', '我覺得飲水機越多越好', '很多人都這樣說', '飲水很重要，所以一定要增加'], 0, '可量測、可查證且和問題直接相關的資料，比感覺或循環論證更有證據力。'))
  }

  return fillWithConceptResponses(unit, questions, 'chinese')
}

function englishQuestions(unit: Unit): ReviewedQuestion[] {
  const text = unitText(unit).toLowerCase()
  const questions: ReviewedQuestion[] = []

  if (unit.grade <= 2 || /字母|letter|phonics|字母音/.test(text)) {
    questions.push(
      choice('理解', 'Which letter begins the word “ball”?', ['B', 'D', 'P', 'T'], 0, '“ball” begins with the /b/ sound and the letter B.'),
      choice('理解', 'What is the best reply to “Hello!”?', ['Hi!', 'Good night.', 'No, I am not.', 'Five books.'], 0, '“Hi!” is a natural greeting reply.'),
    )
  }
  if (/be 動詞|am|is|are|自我介紹|招呼/.test(text)) {
    questions.push(choice('理解', 'Choose the correct sentence.', ['I am Kevin.', 'I is Kevin.', 'I are Kevin.', 'I be Kevin.'], 0, 'The subject “I” uses “am”.'))
  }
  if (/作息|現在簡單|routine|每天|present simple/.test(text)) {
    questions.push(choice('應用', 'Mia ___ to school at 7:30 every day.', ['walks', 'walk', 'walking', 'walked'], 0, 'A regular routine uses the simple present; third-person singular “Mia” takes “walks”.'))
  }
  if (/現在進行|happening now|進行式/.test(text)) {
    questions.push(choice('應用', 'Look! The students ___ basketball now.', ['are playing', 'play', 'played', 'plays'], 0, '“Look!” and “now” signal an action happening at this moment, so use “are playing”.'))
  }
  if (/過去|past/.test(text)) {
    questions.push(choice('應用', 'Yesterday, we ___ to the museum.', ['went', 'go', 'goes', 'going'], 0, '“Yesterday” indicates past time; the past form of “go” is “went”.'))
  }
  if (/比較|comparative|最高級/.test(text)) {
    questions.push(choice('理解', 'Which sentence is correct?', ['Amy is taller than Ben.', 'Amy is more tall Ben.', 'Amy taller Ben.', 'Amy is tallest than Ben.'], 0, 'For a short adjective such as “tall,” use “taller than”.'))
  }
  if (/規則|must|can|祈使|情態/.test(text)) {
    questions.push(choice('應用', 'A sign says “Quiet zone.” Which sentence fits best?', ['You must speak quietly here.', 'You can shout here.', 'You must run here.', 'You are eating yesterday.'], 0, 'A quiet-zone rule requires quiet behavior.'))
  }

  questions.push(choice('應用', 'Listen and answer: When does Mia go to the library?', ['On Tuesday after school.', 'On Monday morning.', 'Every Sunday night.', 'Before breakfast.'], 0, 'The audio says Mia goes to the library after school on Tuesday.', undefined, {
    audioText: 'Mia goes to the library after school on Tuesday.',
    optionFeedback: feedback('Correct. The audio gives both the day and the time.', 'The audio does not say Monday morning.', 'The audio does not mention Sunday.', 'The audio says after school, not before breakfast.'),
  }))

  return fillWithConceptResponses(unit, questions, 'english')
}

function scienceQuestions(unit: Unit): ReviewedQuestion[] {
  const text = unitText(unit)
  const questions: ReviewedQuestion[] = []

  if (/細胞|胞器|細胞核|粒線體/.test(text)) {
    questions.push(choice('理解', '依教材圖判斷，這張圖最適合用來辨認哪一類構造？', ['動物細胞的胞器', '臺灣山脈', '電路元件', '歷史年代'], 0, '圖中標示細胞核、粒線體、內質網等動物細胞構造。', undefined, { mediaAssetId: 'science-animal-cell-zhtw' }))
  }
  if (/有絲分裂|細胞分裂|染色體/.test(text)) {
    questions.push(choice('應用', '有絲分裂中，染色體分離的主要意義是什麼？', ['讓兩個子細胞各得到一套遺傳物質', '讓細胞把養分全部排出', '讓染色體數目每次都加倍留在同一細胞', '讓細胞立即變成不同物種'], 0, '染色體正確分離能讓形成的子細胞各取得一套遺傳物質。', undefined, { mediaAssetId: 'science-mitosis-animation' }))
  }
  if (/消化|小腸|胃|營養/.test(text)) {
    questions.push(choice('理解', '大部分已消化的小分子養分主要在哪個器官被吸收進入體內？', ['小腸', '食道', '口腔', '大腸只負責所有養分吸收'], 0, '小腸具有很大的吸收表面，是多數養分吸收的重要場所。'))
  }
  if (/血液|循環|心臟|動脈|靜脈/.test(text)) {
    questions.push(choice('應用', '判斷一條血管是動脈或靜脈，最可靠的定義依據是什麼？', ['血液相對心臟的流向', '血液一定含氧或缺氧', '血管顏色一定紅或藍', '血管一定粗或細'], 0, '動脈把血液帶離心臟，靜脈把血液帶回心臟；含氧量不是定義。', undefined, { mediaAssetId: 'science-blood-circulation-animation' }))
  }
  if (/遺傳|基因|顯性|隱性/.test(text)) {
    questions.push(choice('理解', '「顯性性狀」代表什麼？', ['在特定基因型組合下能表現出來', '一定比較好', '一定比較常見', '一定比隱性基因強壯'], 0, '顯性描述的是表現關係，不代表好壞、常見程度或生物優劣。'))
  }
  if (/生態|食物鏈|食物網|生產者|消費者/.test(text)) {
    questions.push(choice('應用', '食物網中的箭頭通常表示什麼方向？', ['物質與能量由被吃者流向取食者', '動物逃跑方向', '體型由大到小', '族群數量一定增加的方向'], 0, '食物關係箭頭用來表示物質與能量傳遞方向。', undefined, { mediaAssetId: 'science-food-web' }))
  }
  if (/物質|溶解|溶液|酸鹼/.test(text)) {
    questions.push(choice('應用', '5 g 食鹽完全溶入 100 g 水中。哪個說法最合理？', ['食鹽仍存在，只是分散在水中', '食鹽變成不存在', '總質量一定只剩 100 g', '食鹽一定變成氣體'], 0, '溶解不是消失；食鹽粒子仍存在於溶液中。'))
  }
  if (/力|運動|速度|加速度|摩擦/.test(text)) {
    questions.push(choice('應用', '玩具車向右滑行但速度愈來愈慢，若主要受到摩擦力，合力方向最可能是？', ['向左', '向右', '一定為零', '垂直向上'], 0, '速度向右但正在減少，表示加速度與速度方向相反，合力大致向左。'))
  }
  if (/電路|電流|電壓|電阻/.test(text)) {
    questions.push(choice('理解', '兩顆燈泡並聯，其中一條支路斷路，另一條支路仍完整。最可能發生什麼？', ['另一顆仍可能發亮', '兩顆一定一起熄滅', '電壓一定變成零', '電池立刻消失'], 0, '並聯支路各自形成路徑，一支路中斷不一定切斷另一支路。'))
  }
  if (/季節|地球公轉|地軸/.test(text)) {
    questions.push(choice('應用', '四季形成的主要原因是哪一個？', ['地軸傾斜加上地球公轉，使日照角度與晝長改變', '夏天地球一定離太陽最近', '月球遮住太陽的時間不同', '地球每天自轉速度大幅改變'], 0, '季節主要和地軸傾斜、公轉造成的日照角度與晝夜長短變化有關。', undefined, { mediaAssetId: 'science-earth-tilt-orbit-animation' }))
  }

  return fillWithConceptResponses(unit, questions, 'science')
}

function socialQuestions(unit: Unit): ReviewedQuestion[] {
  const text = unitText(unit)
  const questions: ReviewedQuestion[] = []

  if (/臺灣.*地形|台灣.*地形|山脈|平原|盆地/.test(text)) {
    questions.push(choice('應用', '從臺灣地形陰影圖最直接可以先描述哪個現象？', ['中東部山地起伏較明顯，西部有較多低地', '所有人口都住在東部山區', '西部完全沒有山地', '地形圖可以直接證明所有產業分布原因'], 0, '地形圖能直接支持高低起伏與分布描述；人口或產業因果還需要其他資料。', undefined, { mediaAssetId: 'social-taiwan-relief' }))
  }
  if (/地圖|比例尺|經緯|位置|方位/.test(text)) {
    questions.push(choice('理解', '同樣在圖上量到 2 公分，哪張地圖代表的實際距離較大？', ['比例尺 1:1,000,000', '比例尺 1:10,000', '兩張一定相同', '無法知道，比例尺與距離無關'], 0, '1:1,000,000 的 1 公分代表更大的實際距離。'))
  }
  if (/人口|密度|產業|都市|聚落/.test(text)) {
    questions.push(choice('應用', '甲地人口 100 萬、面積 100 km²；乙地人口 80 萬、面積 40 km²。哪地人口密度較高？', ['乙地', '甲地', '兩地相同', '只看總人口就能判斷甲地'], 0, '甲為 10,000 人/km²；乙為 20,000 人/km²，所以乙較高。'))
  }
  if (/歷史|史料|日治|清|戰後|史前/.test(text)) {
    questions.push(choice('應用', '同一政策的政府公告和居民日記描述不同，最合理的處理方式是？', ['保留兩者差異並比較來源目的，再找其他證據', '只相信政府公告', '只相信居民日記', '兩份不同就代表都不能使用'], 0, '不同來源能回答不同問題；應比較製作者、目的、時間與其他證據。'))
  }
  if (/家庭|社區|規範|公民|權利|責任/.test(text)) {
    questions.push(choice('應用', '社區要改建公共空地，哪個做法最符合公共決策？', ['公開資料、聽取不同受影響者意見並比較替代方案', '只讓人數最多的一方決定且不說明理由', '只採納最有錢居民意見', '先決定結果再找理由'], 0, '公共決策除了多數意見，也要考量程序、權利、證據與不同群體影響。'))
  }
  if (/經濟|市場|供需|機會成本/.test(text)) {
    questions.push(choice('理解', '你有 100 元，只能在一本書和一張電影票中選一個。若你選書，這個選擇的機會成本最接近什麼？', ['你放棄的電影票價值', '書本身的價格一定等於零', '100 元以外所有東西', '沒有任何成本'], 0, '機會成本是做選擇時放棄的最佳替代方案價值。'))
  }

  return fillWithConceptResponses(unit, questions, 'social')
}

function fillWithConceptResponses(unit: Unit, seed: ReviewedQuestion[], subject: Unit['subject']): ReviewedQuestion[] {
  const result = [...seed]
  let cursor = 0
  while (result.length < 8) {
    const concept = unit.concepts[cursor % Math.max(1, unit.concepts.length)] ?? firstConcept(unit)
    const example = concept.example ? `課程例子：${concept.example}` : `本單元重點：${concept.explanation}`
    if (subject === 'english') {
      result.push(response(
        result.length < 5 ? '應用' : '檢核',
        `Use “${concept.title}” in a new situation. Write one short English example and explain what it means.`,
        `A correct answer should use the target idea in a new sentence or short situation and keep the meaning clear.`,
        `The goal is to transfer “${concept.title}” to a new context, not copy the course example word for word.`,
        example,
        { rubric: ['英文句子或短對話語意完整', '有使用本概念', '不是直接照抄原例句'] },
      ))
    } else if (subject === 'math') {
      result.push(response(
        result.length < 5 ? '應用' : '檢核',
        `請用「${concept.title}」處理一個和課程例子不同的小題，寫出關鍵步驟並說明為什麼可以這樣做。`,
        `合理答案應正確使用「${concept.title}」，包含必要的式子、圖形或推理，最後檢查結果是否符合題意。`,
        concept.explanation,
        example,
        { rubric: ['方法和概念相符', '關鍵步驟可檢查', '結果有合理性檢查'] },
      ))
    } else if (subject === 'science') {
      result.push(response(
        result.length < 5 ? '應用' : '檢核',
        `針對「${concept.title}」，請寫出一個可以觀察或測量的證據，並說明它支持什麼解釋。`,
        `回答要把「觀察到的證據」和「由證據得到的解釋」分開，且結論不能超出資料範圍。`,
        concept.explanation,
        example,
        { rubric: ['有可觀察／測量證據', '證據與解釋分開', '結論沒有過度延伸'] },
      ))
    } else if (subject === 'social') {
      result.push(response(
        result.length < 5 ? '應用' : '檢核',
        `針對「${concept.title}」，請寫出一項資料能直接支持的事實，以及一項仍需要更多證據的解釋。`,
        `事實應能直接由資料、史料、地圖或情境確認；解釋則要指出可能原因並承認還需要其他來源驗證。`,
        concept.explanation,
        example,
        { rubric: ['事實與解釋有區分', '判斷有資料依據', '知道解釋仍需其他證據'] },
      ))
    } else {
      result.push(response(
        result.length < 5 ? '應用' : '檢核',
        `請用自己的話說明「${concept.title}」，再用一個不同於課程例子的句子、短文或情境證明你真的理解。`,
        `回答應先說清楚「${concept.title}」的意思，再提供一個新的語文例子，並指出例子和概念的關係。`,
        concept.explanation,
        example,
        { rubric: ['概念說明正確', '有新的語文例子', '能說明例子和概念的關係'] },
      ))
    }
    cursor += 1
  }
  return result.slice(0, 8)
}

export function buildFoundationSubjectQuestions(unit: FoundationUnitContent): ReviewedQuestion[] {
  let questions: ReviewedQuestion[]
  if (unit.subject === 'math') questions = mathQuestions(unit)
  else if (unit.subject === 'chinese') questions = chineseQuestions(unit)
  else if (unit.subject === 'english') questions = englishQuestions(unit)
  else if (unit.subject === 'science') questions = scienceQuestions(unit)
  else questions = socialQuestions(unit)

  return questions.map((question, index) => ({
    ...question,
    id: `${unit.unitId}-foundation-v12-q${index + 1}`,
    level: index < 3 ? '理解' : index < 6 ? '應用' : '檢核',
  }))
}

export function upgradeFoundationUnitV12(unit: FoundationUnitContent | null): FoundationUnitContent | null {
  if (!unit) return null
  return {
    ...unit,
    questions: buildFoundationSubjectQuestions(unit),
  }
}
