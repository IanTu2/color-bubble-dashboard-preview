import type { CurriculumLessonPlan, CurriculumUnitBundle } from './curriculum-course-engine'
import type { CurriculumSubjectId } from './curriculum-plan'

export type TeachingExample = {
  prompt: string
  steps: string[]
  answer: string
}

export type TeachingBlock = {
  id: string
  eyebrow: string
  title: string
  paragraphs: string[]
  bullets?: string[]
  example?: TeachingExample
}

function includesAny(value: string, keywords: string[]) {
  return keywords.some((keyword) => value.includes(keyword))
}

function mathExample(title: string, grade: number): TeachingExample {
  if (includesAny(title, ['正負', '有向數', '數線', '絕對值'])) return {
    prompt: '早上氣溫是 −3°C，中午升高 5°C。中午是多少度？',
    steps: ['「升高 5」表示從 −3 往數線右邊移動 5 格。', '−3 + 5 = 2。', '答案是 2°C；正負號代表方向或相對位置，不只是計算符號。'],
    answer: '2°C',
  }
  if (includesAny(title, ['分數'])) return {
    prompt: '計算 3/4 + 1/8。',
    steps: ['分母不同，先找共同分母 8。', '3/4 = 6/8。', '6/8 + 1/8 = 7/8。'],
    answer: '7/8',
  }
  if (includesAny(title, ['小數'])) return {
    prompt: '計算 2.35 + 0.8。',
    steps: ['把小數點上下對齊。', '0.8 可以寫成 0.80。', '2.35 + 0.80 = 3.15。'],
    answer: '3.15',
  }
  if (includesAny(title, ['百分', '比例', '比率'])) return {
    prompt: '一件 250 元的商品打 8 折，售價是多少？',
    steps: ['8 折代表原價的 80%。', '250 × 0.8 = 200。', '百分率題先確認「誰是基準量」。'],
    answer: '200 元',
  }
  if (includesAny(title, ['方程', '代數式'])) return {
    prompt: '解方程式 3x + 5 = 20。',
    steps: ['先讓含 x 的項單獨留下：兩邊都減 5，得到 3x = 15。', '兩邊都除以 3，得到 x = 5。', '代回原式：3×5+5=20，成立。'],
    answer: 'x = 5',
  }
  if (includesAny(title, ['函數', '直線'])) return {
    prompt: '若 y = 2x + 1，當 x = 3 時 y 是多少？',
    steps: ['把 x = 3 代入函數式。', 'y = 2×3 + 1。', '所以 y = 7。'],
    answer: '7',
  }
  if (includesAny(title, ['指數', '科學記號'])) return {
    prompt: '計算 2³ × 2⁴。',
    steps: ['底數相同相乘，指數相加。', '2³ × 2⁴ = 2⁷。', '2⁷ = 128。'],
    answer: '128',
  }
  if (includesAny(title, ['對數'])) return {
    prompt: '因為 10² = 100，所以 log₁₀(100) 是多少？',
    steps: ['對數是在問：「底數要幾次方才會得到這個數？」', '10 的 2 次方等於 100。', '因此 log₁₀(100) = 2。'],
    answer: '2',
  }
  if (includesAny(title, ['機率'])) return {
    prompt: '袋中有 3 顆紅球、2 顆藍球，隨機取 1 顆，取到紅球的機率？',
    steps: ['全部共有 5 顆球。', '符合「紅球」的結果有 3 個。', '機率 = 有利結果 ÷ 全部可能結果 = 3/5。'],
    answer: '3/5',
  }
  if (includesAny(title, ['統計', '資料'])) return {
    prompt: '資料 2、4、6 的平均數是多少？',
    steps: ['先把資料加總：2+4+6=12。', '共有 3 筆資料。', '平均數 = 12÷3=4。'],
    answer: '4',
  }
  if (includesAny(title, ['數列'])) return {
    prompt: '等差數列 3、7、11、15……下一項是多少？',
    steps: ['相鄰兩項都增加 4，所以公差 d=4。', '15+4=19。', '等差數列的核心是「每次增加相同的量」。'],
    answer: '19',
  }
  if (includesAny(title, ['微分', '導數'])) return {
    prompt: '若 f(x)=x²，求 f′(3)。',
    steps: ['x² 的導數是 2x。', '把 x=3 代入 2x。', 'f′(3)=6，代表曲線在 x=3 的瞬時斜率。'],
    answer: '6',
  }
  if (includesAny(title, ['圓'])) return {
    prompt: '半徑 4 公分的圓，圓周長是多少？',
    steps: ['圓周長公式 C=2πr。', '代入 r=4：C=2π×4。', '所以 C=8π 公分，約 25.13 公分。'],
    answer: '8π 公分',
  }
  if (includesAny(title, ['三角', '角', '幾何'])) return {
    prompt: '三角形兩個內角是 50°、60°，第三個內角是多少？',
    steps: ['三角形內角和是 180°。', '第三角 = 180−50−60。', '得到 70°。'],
    answer: '70°',
  }
  const base = grade <= 3 ? '小明有 8 顆球，又得到 5 顆，現在有幾顆？' : '把題目的已知量、未知量與關係寫成算式，再求解。'
  return {
    prompt: base,
    steps: grade <= 3 ? ['「又得到」表示數量增加。', '8+5=13。', '最後用題目的單位回答。'] : ['先找已知與未知。', '把文字關係轉成數學式。', '計算後檢查答案是否符合題意。'],
    answer: grade <= 3 ? '13 顆' : '依本單元條件完成列式與檢查。',
  }
}

function englishExample(title: string, grade: number): TeachingExample {
  if (includesAny(title.toLowerCase(), ['be', '自我介紹', '招呼'])) return {
    prompt: '完成句子：I ___ a student. She ___ my friend.',
    steps: ['I 搭配 am。', 'She 是第三人稱單數，搭配 is。', '完整句：I am a student. She is my friend.'],
    answer: 'am；is',
  }
  if (includesAny(title, ['現在式', '日常', '作息'])) return {
    prompt: '選出正確句子：He play basketball. / He plays basketball.',
    steps: ['一般現在式描述習慣或固定事實。', '主詞 He 是第三人稱單數，動詞通常加 -s。', '因此使用 plays。'],
    answer: 'He plays basketball.',
  }
  if (includesAny(title, ['過去'])) return {
    prompt: '把「I visit my grandma every Sunday.」改成昨天發生。',
    steps: ['昨天是已完成的過去時間。', 'visit 的過去式是 visited。', '時間詞可改成 yesterday。'],
    answer: 'I visited my grandma yesterday.',
  }
  if (includesAny(title, ['比較'])) return {
    prompt: '完成句子：A train is ___ than a bicycle. (fast)',
    steps: ['兩者比較使用比較級。', 'fast 是短形容詞，加 -er。', '句型：A is faster than B.'],
    answer: 'faster',
  }
  if (includesAny(title, ['被動'])) return {
    prompt: '把 People use English around the world. 改成被動語態。',
    steps: ['把受詞 English 移到主詞位置。', '一般現在式被動：be + p.p.。', 'English 是單數，使用 is used。'],
    answer: 'English is used around the world.',
  }
  if (includesAny(title, ['完成'])) return {
    prompt: '完成句子：I ___ already ___ my homework. (finish)',
    steps: ['already 常搭配現在完成式。', 'I 使用 have。', 'finish 的過去分詞是 finished。'],
    answer: 'I have already finished my homework.',
  }
  return {
    prompt: grade <= 3 ? '看圖想像你遇到新同學，說一句簡單招呼。' : '把本單元的核心句型放進一個完整生活句子。',
    steps: grade <= 3 ? ['先說 Hello。', '再介紹名字：I am / I’m ...。', '句子要完整，不只背單字。'] : ['先確認主詞與時間。', '選擇正確動詞形式或句型。', '最後把句子放回情境，確認意思自然。'],
    answer: grade <= 3 ? 'Hello! I’m Amy.' : '答案依本單元句型而定，但必須是完整、符合情境的句子。',
  }
}

function chineseExample(title: string): TeachingExample {
  if (includesAny(title, ['主旨', '篇章', '段落'])) return {
    prompt: '短文：「下雨後，操場積了水。午休後太陽出來，水漸漸不見了。」這段主要在說什麼？',
    steps: ['先找重複或最重要的事件：操場的水。', '再看事件變化：下雨積水 → 出太陽 → 水消失。', '主旨不是抄一句話，而是用一句話概括整段。'],
    answer: '雨後操場的積水在太陽照射後漸漸消失。',
  }
  if (includesAny(title, ['修辭', '譬喻', '擬人'])) return {
    prompt: '「風在窗外唱歌。」用了什麼修辭？',
    steps: ['「唱歌」原本是人的動作。', '句子把人的動作給了「風」。', '這是擬人。'],
    answer: '擬人',
  }
  if (includesAny(title, ['文言', '古文'])) return {
    prompt: '讀文言句子時，遇到不熟的字詞應先做什麼？',
    steps: ['先看上下文，不急著逐字硬翻。', '找主詞、動作與前後關係。', '再利用註釋或常見古今義確認。'],
    answer: '先依語境判斷，再用註釋驗證，不要只靠單字直譯。',
  }
  if (includesAny(title, ['論說', '論證', '思辨'])) return {
    prompt: '主張：「學校應增加閱讀時間。」什麼內容能當作較好的理由？',
    steps: ['理由要直接支持主張。', '「我喜歡閱讀」只是個人偏好，支持力較弱。', '若能提出閱讀提升理解力的資料或具體案例，論證會更完整。'],
    answer: '使用與閱讀成效相關的資料、研究或具體案例作為證據。',
  }
  return {
    prompt: '閱讀一段文字時，怎麼避免只看見表面句子？',
    steps: ['先找關鍵人物、事件或觀點。', '再看前後句的因果、轉折或對比。', '最後用自己的話說出「作者真正想表達什麼」。'],
    answer: '從關鍵線索、篇章關係與語境整理出自己的理解。',
  }
}

function scienceExample(title: string): TeachingExample {
  if (includesAny(title, ['物質', '水', '狀態', '熱'])) return {
    prompt: '冰水杯外面出現水珠，水是從杯子裡漏出來的嗎？',
    steps: ['先觀察：水珠出現在杯子外表面。', '空氣中的水蒸氣遇到較冷的杯壁會凝結成液態水。', '因此要區分「觀察到水珠」與「推論水從哪裡來」。'],
    answer: '主要是空氣中的水蒸氣在冷杯壁上凝結，不是杯內的水穿過杯壁。',
  }
  if (includesAny(title, ['力', '運動'])) return {
    prompt: '同一台玩具車，施力更大時通常會發生什麼變化？',
    steps: ['力可以改變物體的運動狀態。', '在其他條件相近時，較大的合力會造成較大的加速度。', '實驗時要控制車子、路面等條件。'],
    answer: '通常加速更明顯，但要控制其他變因才能公平比較。',
  }
  if (includesAny(title, ['電', '電路'])) return {
    prompt: '燈泡要亮，電池、導線與燈泡至少要形成什麼條件？',
    steps: ['電流需要完整路徑。', '如果路徑中斷就是開路。', '形成閉合電路後，電流才能通過燈泡。'],
    answer: '閉合電路。',
  }
  if (includesAny(title, ['生態', '生物'])) return {
    prompt: '某地昆蟲大量減少，可能如何影響以昆蟲為食的鳥？',
    steps: ['先看食物關係：鳥需要昆蟲作為食物來源。', '昆蟲減少可能使鳥的食物不足。', '生態系的影響常是連鎖的，不能只看單一物種。'],
    answer: '鳥的食物來源可能減少，族群數量或活動範圍可能受到影響。',
  }
  return {
    prompt: '面對一個自然現象，科學解釋最重要的依據是什麼？',
    steps: ['先把可直接觀察或測量的結果記錄下來。', '再提出可以被檢驗的解釋。', '用實驗、資料或重複觀察確認解釋是否合理。'],
    answer: '可觀察、可測量、可重複檢驗的證據。',
  }
}

function socialExample(title: string): TeachingExample {
  if (includesAny(title, ['地圖', '位置', '空間', '地理'])) return {
    prompt: '看地圖時，為什麼不能只看地名？',
    steps: ['先確認方向、比例尺與圖例。', '再比較地點之間的距離、位置與地形。', '最後把空間關係連回人口、交通或產業等現象。'],
    answer: '因為地圖的重點是呈現空間關係，不只是列出地名。',
  }
  if (includesAny(title, ['歷史', '時代', '事件'])) return {
    prompt: '判斷歷史事件的因果時，為什麼不能只記一個年份？',
    steps: ['年份只能告訴我們事件發生時間。', '還要看事件前的背景與條件。', '再比較事件造成的短期與長期影響。'],
    answer: '要把時間、背景、原因與後果連成關係，才能真正理解歷史。',
  }
  if (includesAny(title, ['公民', '權利', '政府', '法律'])) return {
    prompt: '遇到公共議題時，什麼樣的判斷比較可靠？',
    steps: ['先分清楚事實、意見與價值判斷。', '查找制度規則或可靠資料。', '比較不同立場的理由與可能影響。'],
    answer: '以可查證事實與制度資料為基礎，再比較不同立場。',
  }
  if (includesAny(title, ['經濟', '市場', '消費'])) return {
    prompt: '商品很熱門但數量有限時，價格為什麼可能上升？',
    steps: ['需求增加代表想買的人變多。', '如果供給短期沒有增加，就會出現較強的競爭。', '價格可能因供需變化而調整。'],
    answer: '需求增加而供給有限時，價格通常有上升壓力。',
  }
  return {
    prompt: '閱讀一張社會資料圖表時，第一步該做什麼？',
    steps: ['先看標題，確認資料主題。', '再看時間、單位、資料來源與圖例。', '最後才能比較數值並提出解釋。'],
    answer: '先確認資料的主題、時間、單位與來源。',
  }
}

function subjectExample(subject: CurriculumSubjectId, title: string, grade: number) {
  if (subject === 'math') return mathExample(title, grade)
  if (subject === 'english') return englishExample(title, grade)
  if (subject === 'chinese') return chineseExample(title)
  if (subject === 'science') return scienceExample(title)
  return socialExample(title)
}

function conceptParagraphs(subject: CurriculumSubjectId, unit: CurriculumUnitBundle) {
  const intro = `這個單元不是只要記住「${unit.title}」這個名稱。核心要掌握的是：${unit.focus}`
  if (subject === 'math') return [intro, '數學學習要把文字、圖像與算式連起來。每看到一個公式或運算規則，都要知道它在描述什麼關係，以及什麼時候能用。']
  if (subject === 'english') return [intro, '英文不把單字和文法分開死背。先理解完整句子的意思，再觀察字彙、句型與語音如何一起工作，最後換一個情境自己使用。']
  if (subject === 'chinese') return [intro, '國文學習的重點是從字詞進入句子，再從句子理解段落與整篇文章。每個判斷都要能回到文本找到線索。']
  if (subject === 'science') return [intro, '自然科學要把「看到的現象」、「測量得到的資料」和「我們提出的解釋」分開。解釋必須能由證據支持。']
  return [intro, '社會科不只記人名、年份和地名，而是理解時間、空間、制度與人群之間的關係，並學會判讀不同資料來源。']
}

export function buildTeachingBlocks(subject: CurriculumSubjectId, grade: number, unit: CurriculumUnitBundle, lesson: CurriculumLessonPlan): TeachingBlock[] {
  const example = subjectExample(subject, unit.title, grade)
  const concept = conceptParagraphs(subject, unit)
  const lessonLead = lesson.kind === 'launch'
    ? '先從一個具體例子開始，知道這個單元到底要解決什麼問題。'
    : lesson.kind === 'concept'
      ? '這一課會把核心觀念講清楚，再用例子驗證。'
      : lesson.kind === 'example'
        ? '這一課直接看完整示範，重點是理解每一步為什麼這樣做。'
        : lesson.kind === 'guided'
          ? '先跟著提示做一次，不需要一開始就自己猜完整答案。'
          : lesson.kind === 'practice'
            ? '先複習規則，再獨立處理一個新情境；卡住時可以回看示範。'
            : '先快速整理觀念，再完成檢核，確認不是只記住前面的例子。'

  return [
    {
      id: `${lesson.id}-teach`,
      eyebrow: 'TEACH',
      title: '先把觀念講懂',
      paragraphs: [lessonLead, ...concept],
      bullets: lesson.successCriteria,
    },
    {
      id: `${lesson.id}-example`,
      eyebrow: 'WORKED EXAMPLE',
      title: '老師示範一題',
      paragraphs: ['下面不是只給答案，而是把判斷過程拆開。先自己看題目，再逐步對照。'],
      example,
    },
    {
      id: `${lesson.id}-recap`,
      eyebrow: 'RECAP',
      title: '這一課要帶走的重點',
      paragraphs: [lesson.objective],
      bullets: [lesson.teachingFocus, lesson.learnerTask],
    },
  ]
}
