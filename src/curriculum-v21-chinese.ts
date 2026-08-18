import type { ReviewedQuestion, ReviewedWorkedExample } from './curriculum-reviewed-social10'
import type { TextbookUnitContentV14 } from './curriculum-textbook-v14'
import {
  buildMisconceptions,
  choiceQuestion,
  cleanConcepts,
  formalQuestionSet,
  quickCheckSet,
  responseQuestion,
  seededInt,
  seededPick,
  stableHash,
  unitObjectives,
  unitOverview,
  visualSet,
  type V21SubjectBuild,
  type V21UnitContext,
} from './curriculum-v21-common'

type ChineseFamily =
  | 'phonetics-characters'
  | 'sentence-punctuation'
  | 'narrative'
  | 'expository'
  | 'rhetoric'
  | 'poetry'
  | 'classical'
  | 'argument-media'
  | 'cross-text'
  | 'writing-expression'
  | 'literature'
  | 'public-academic'

type ChineseCase = {
  context: string
  prompt: string
  answer: string
  distractors: string[]
  steps: string[]
  explanation: string
}

function chineseFamily(context: V21UnitContext): ChineseFamily {
  const text = `${context.unit.title} ${context.unit.focus}`
  if (/注音|聲韻|識字|字形|字音|部件|字詞|詞語|成語|語文基礎|工具/.test(text)) return 'phonetics-characters'
  if (/完整句子|句型|標點|語法/.test(text)) return 'sentence-punctuation'
  if (/敘事|人物|情節|記敘|描寫|故事/.test(text)) return 'narrative'
  if (/說明文|說明短文|資訊與說明/.test(text)) return 'expository'
  if (/修辭|語感/.test(text)) return 'rhetoric'
  if (/詩歌|童詩|詩詞|新詩|意象/.test(text)) return 'poetry'
  if (/文言|古典|古文|經典|思想/.test(text)) return 'classical'
  if (/論說|論證|思辨|媒體|公共議題/.test(text)) return 'argument-media'
  if (/跨文本|閱讀理解|閱讀整合|深度閱讀|圖表|多文本/.test(text)) return 'cross-text'
  if (/寫作|作文|寫話|日記|書信|口語表達|表達/.test(text)) return 'writing-expression'
  if (/文學|散文|小說|文體|流變|社會/.test(text)) return 'literature'
  return 'public-academic'
}

function familyLabel(family: ChineseFamily) {
  const labels: Record<ChineseFamily, string> = {
    'phonetics-characters': '字音、字形、字義與語文工具',
    'sentence-punctuation': '句子結構與標點',
    narrative: '敘事、人物與描寫',
    expository: '說明與資訊組織',
    rhetoric: '修辭與語感',
    poetry: '詩歌、節奏與意象',
    classical: '文言、古典文本與文化語境',
    'argument-media': '論證、媒體與觀點判讀',
    'cross-text': '跨文本閱讀與證據統整',
    'writing-expression': '寫作、修訂與口語表達',
    literature: '文學閱讀、敘事視角與作品脈絡',
    'public-academic': '公共／學術閱讀與專題表達',
  }
  return labels[family]
}

const CHARACTER_ITEMS = [
  { sentence: '我已經把作業寫完了。', target: '已經', wrong: '以經', why: '「已」表示事情完成或時間已到；「以」多表示用、憑藉。' },
  { sentence: '放學後，我在圖書館等媽媽。', target: '在', wrong: '再', why: '「在」表示處所；「再」表示又一次或下一次。' },
  { sentence: '大家一起整理教室。', target: '整理', wrong: '整裡', why: '「理」在此表示整理、處理，不是表示內部的「裡」。' },
  { sentence: '清晨的天空很明亮。', target: '清晨', wrong: '青晨', why: '「清」有清澈、清早之意；「青」主要表示顏色。' },
] as const

const NARRATIVE_ITEMS = [
  ['小雨忘了帶傘，只好站在騎樓等雨變小。', '同學阿哲折回教室拿出備用傘，陪她一起走到公車站。', '到了站牌，小雨向阿哲道謝，也決定明天把自己的備用傘放進書包。'],
  ['比賽前，子安一直怕自己跑最後。', '起跑後他先照教練說的控制速度，最後一圈才加速。', '雖然沒有得第一名，他卻發現自己比上次快了十二秒。'],
  ['奶奶把一盆快枯萎的薄荷交給小晴照顧。', '小晴查了日照與澆水需求，每天固定觀察土壤。', '兩週後長出新葉，她把每天的變化整理成小卡送給奶奶。'],
] as const

const EXPLANATION_ITEMS = [
  { title: '保溫瓶為什麼能延緩散熱', text: '保溫瓶通常利用真空層減少熱的傳導與對流，內壁的反射層則可減少輻射造成的能量傳遞。因此，它不是讓熱「完全不會消失」，而是降低熱交換速度。', key: '利用不同構造降低熱交換速度' },
  { title: '校園雨水花園', text: '雨水花園是一塊略低於周圍地面的植栽區。下雨時，部分雨水先流入植栽區，經土壤滲透與植物根系附近的空間暫時儲存，能減少短時間內直接流入排水系統的水量。', key: '用低窪植栽區暫存並滲透雨水' },
  { title: '圖書分類標籤', text: '圖書館會依主題替書籍建立分類號，再把相近主題放在鄰近位置。分類號的目的不是表示書籍優劣，而是讓讀者可以依主題快速找到資料。', key: '依主題建立位置秩序以方便檢索' },
] as const

const ARGUMENT_ITEMS = [
  { claim: '校園午休後應保留十分鐘安靜閱讀時間。', evidence: '試辦兩週後，三個班級有 78% 的學生表示下午第一節比較容易進入學習狀態。', weak: '很多人都說閱讀很好，所以一定要做。' },
  { claim: '校門口應增設遮雨等候區。', evidence: '連續四個雨天觀察顯示，每天放學約有 60 至 85 人在沒有遮蔽物的人行道停留等候。', weak: '下雨很討厭，因此任何地方都應該蓋棚子。' },
  { claim: '班級借用平板前應先確認用途與使用時間。', evidence: '上月 12 次借用紀錄中，有 5 次因未事先確認應用程式與帳號而延遲超過 10 分鐘。', weak: '平板是科技產品，所以一定能提高學習效果。' },
] as const

function chineseCase(context: V21UnitContext, family: ChineseFamily, index: number): ChineseCase {
  const seed = stableHash(`${context.unit.id}-${family}-${index}`)
  const n = (min: number, max: number, shift = 0) => seededInt(seed + shift * 3571, min, max)

  if (family === 'phonetics-characters') {
    const item = CHARACTER_ITEMS[n(0, CHARACTER_ITEMS.length - 1, 1)]
    if (/注音|聲韻/.test(context.unit.title)) {
      const pairs = [
        { word: '學校', sound: 'ㄒㄩㄝˊ ㄒㄧㄠˋ', wrong: ['ㄒㄩㄝ ㄒㄧㄠ', 'ㄒㄩㄝˋ ㄒㄧㄠˋ', 'ㄒㄩㄝˊ ㄒㄧㄠ'] },
        { word: '朋友', sound: 'ㄆㄥˊ ㄧㄡˇ', wrong: ['ㄆㄣˊ ㄧㄡˇ', 'ㄆㄥ ㄧㄡ', 'ㄆㄥˊ ㄧㄡˋ'] },
        { word: '天空', sound: 'ㄊㄧㄢ ㄎㄨㄥ', wrong: ['ㄊㄧㄤ ㄎㄨㄥ', 'ㄊㄧㄢ ㄍㄨㄥ', 'ㄊㄧㄢˊ ㄎㄨㄥ'] },
      ]
      const pair = pairs[n(0, pairs.length - 1, 2)]
      return {
        context: `本題練習「${context.unit.title}」中的聲音與符號對應。`,
        prompt: `「${pair.word}」的注音哪一個正確？`,
        answer: pair.sound,
        distractors: pair.wrong,
        steps: ['先逐字讀出聲音', '分辨聲母、韻母與聲調', '再對照完整詞語', '避免只憑字形猜讀音'],
        explanation: `「${pair.word}」讀作 ${pair.sound}。注音要同時對到每個字的音節與聲調。`,
      }
    }
    return {
      context: item.sentence,
      prompt: `句子中「${item.target}」的用字為什麼正確？`,
      answer: item.why,
      distractors: [`因為「${item.wrong}」和「${item.target}」意思完全相同`, '只要讀音接近，任何字都可以互換', '字形選擇和句子語意沒有關係'],
      steps: ['先讀完整句子', `比較「${item.target}」與「${item.wrong}」的字義`, '用句意判斷需要哪個字', '再檢查常見形近／音近字'],
      explanation: item.why,
    }
  }

  if (family === 'sentence-punctuation') {
    const name = seededPick(['小安', '子晴', '宇辰', '品妤'], seed + 1)
    const place = seededPick(['圖書館', '操場', '科學教室', '車站'], seed + 2)
    const correct = `${name}問：「我們今天要去${place}嗎？」`
    return {
      context: `原意是：${name}開口詢問大家今天是否要去${place}。`,
      prompt: '哪一個句子最能用標點清楚呈現「人物發問」？',
      answer: correct,
      distractors: [`${name}問，我們今天要去${place}嗎。`, `${name}問：「我們今天要去${place}嗎。」`, `${name}問我們：「今天要去${place}。」`],
      steps: ['辨認這是人物直接說話', '說話內容用引號框住', '疑問語氣用問號', '句末標點放在引號內的說話內容中'],
      explanation: '直接引語要用引號標示；因為說話內容本身是疑問句，所以使用問號。',
    }
  }

  if (family === 'narrative') {
    const story = NARRATIVE_ITEMS[n(0, NARRATIVE_ITEMS.length - 1, 1)]
    return {
      context: story.join(''),
      prompt: index % 2 === 0 ? '哪一項最能概括人物在故事中的變化？' : '哪一個事件最直接造成故事後面的轉折？',
      answer: index % 2 === 0 ? '人物因一個具體事件調整想法或行動' : story[1],
      distractors: index % 2 === 0 ? ['人物從頭到尾完全沒有改變', '故事只是在列出三個互不相關的景物', '只要看最後一句就不需要理解前因'] : [story[0], story[2], '故事中的所有句子都同樣是轉折點'],
      steps: ['先找故事起點', '標出關鍵事件', '比較事件前後人物想法／行動', '用文本句子支持判斷'],
      explanation: '敘事閱讀要把「事件」和「人物前後變化」連起來，不能只抽出一句話孤立判斷。',
    }
  }

  if (family === 'expository') {
    const item = EXPLANATION_ITEMS[n(0, EXPLANATION_ITEMS.length - 1, 1)]
    return {
      context: `${item.title}：${item.text}`,
      prompt: '這段說明文字的核心資訊是什麼？',
      answer: item.key,
      distractors: ['作者主要在抒發個人悲傷情緒', '文字只是在描述一個人物衝突', '只要記住第一個名詞就等於理解全文'],
      steps: ['先找說明對象', '圈出構造／原因／功能等關鍵關係', '刪去細節後保留主幹', '用一句話重述核心資訊'],
      explanation: `這段文字圍繞「${item.key}」組織資訊，其他細節都是用來解釋這個核心。`,
    }
  }

  if (family === 'rhetoric') {
    const items = [
      { text: '夕陽像一顆慢慢沉進海裡的橘色球。', answer: '譬喻', effect: '把夕陽的形狀與顏色具體化' },
      { text: '風沿著走廊奔跑，推著窗簾不停招手。', answer: '擬人', effect: '把風與窗簾的動態寫得有生命感' },
      { text: '教室安靜得連翻一頁紙的聲音都聽得見。', answer: '誇飾', effect: '強化環境非常安靜的感受' },
    ]
    const item = items[n(0, items.length - 1, 1)]
    return {
      context: item.text,
      prompt: '這句話主要使用哪一種修辭？它的作用是什麼？',
      answer: `${item.answer}；${item.effect}`,
      distractors: ['排比；只是讓句子變長', '設問；要求讀者真的回答', '引用；提供外部資料來源'],
      steps: ['先讀句子實際寫了什麼', '找不按字面直述的表達', `辨認為${item.answer}`, `說明它如何${item.effect}`],
      explanation: `修辭判斷不能只背名稱；還要回到句子說明表達效果。這裡是${item.answer}，作用是${item.effect}。`,
    }
  }

  if (family === 'poetry') {
    const items = [
      { text: '雨停了／屋簷還掛著一排透明的鐘／風一吹／它們才一顆顆落下', image: '雨後屋簷水滴', mood: '雨後安靜而細微的動態' },
      { text: '黃昏把操場拉長／最後一顆球停在白線旁／沒有人催促它回家', image: '黃昏操場與停下的球', mood: '一天結束時的寧靜與留戀' },
      { text: '晨光從窗縫進來／先照亮桌角／再慢慢走到攤開的書頁', image: '晨光移動到書頁', mood: '清晨逐漸甦醒的感受' },
    ]
    const item = items[n(0, items.length - 1, 1)]
    return {
      context: item.text,
      prompt: '這段短詩主要透過哪個意象形成整體感受？',
      answer: `${item.image}；形成${item.mood}`,
      distractors: ['只靠押韻，內容沒有任何畫面', '主要是在列數學公式', '只要知道作者名字就能決定情緒'],
      steps: ['圈出具體可感的物象', '觀察動詞、色彩、聲音或光線', '連接意象與情緒', '用詩句本身支持解讀'],
      explanation: `詩歌的意象來自文本中的具體物象與動作。此處以${item.image}形成${item.mood}。`,
    }
  }

  if (family === 'classical') {
    const items = [
      { text: '晨起，見庭中積水，遂取帚掃之。', word: '遂', answer: '於是、就', paraphrase: '早晨起床，看見院子裡積水，於是拿掃帚清理。' },
      { text: '友人至，主人喜，乃設茶共坐。', word: '乃', answer: '於是、便', paraphrase: '朋友到了，主人很高興，便準備茶一起坐下。' },
      { text: '天將雨，行人皆疾步而歸。', word: '疾', answer: '快速地', paraphrase: '天快下雨了，路上的人都加快腳步回去。' },
    ]
    const item = items[n(0, items.length - 1, 1)]
    return {
      context: item.text,
      prompt: `依上下文，「${item.word}」在這句話中的意思最接近哪一項？`,
      answer: item.answer,
      distractors: ['永遠只能照現代最常見字義解釋', '表示否定', '表示數量很多'],
      steps: ['先讀整句事件關係', `定位「${item.word}」前後語意`, '用可替換的現代詞測試', '再完成整句翻譯'],
      explanation: `依句意，「${item.word}」在此是「${item.answer}」。整句可譯為：${item.paraphrase}`, 
    }
  }

  if (family === 'argument-media') {
    const item = ARGUMENT_ITEMS[n(0, ARGUMENT_ITEMS.length - 1, 1)]
    return {
      context: `主張：${item.claim}\n證據 A：${item.evidence}\n說法 B：${item.weak}`,
      prompt: '哪一項最適合作為支持這個主張的「可檢查證據」？',
      answer: item.evidence,
      distractors: [item.weak, '因為提出主張的人很有自信', '只要在社群媒體上被轉傳很多次就算證明'],
      steps: ['先把主張和證據分開', '檢查證據是否可觀察／可查核', '判斷證據和主張是否直接相關', '再思考樣本與限制'],
      explanation: '論證需要可以查核、而且和主張有關的證據；情緒、人氣或籠統常識不能自動取代證據。',
    }
  }

  if (family === 'cross-text') {
    const topics = [
      { a: '甲文指出共享單車能補足短程交通，但需要足夠停車管理。', b: '乙文以社區調查說明，亂停車是居民最常反映的共享單車問題。', common: '兩文都承認共享單車有使用價值，同時涉及管理問題。' },
      { a: '甲文說校園樹木可提供遮蔭並降低部分地表溫度。', b: '乙文記錄同一天中，樹蔭下量得的地表溫度低於沒有遮蔭的區域。', common: '乙文的量測可作為甲文「遮蔭與地表溫度」說法的具體證據。' },
      { a: '甲文介紹紙本筆記方便在頁面上自由畫記與建立空間位置。', b: '乙文介紹數位筆記容易搜尋、複製與跨裝置同步。', common: '兩文呈現不同工具的優點，適合依任務需求比較。' },
    ]
    const item = topics[n(0, topics.length - 1, 1)]
    return {
      context: `甲文：${item.a}\n乙文：${item.b}`,
      prompt: '綜合兩個文本，哪一項判斷最有文本證據？',
      answer: item.common,
      distractors: ['甲乙兩文一定互相矛盾，不能同時成立', '只讀甲文標題就足以代表乙文內容', '跨文本閱讀只要挑自己比較喜歡的一篇'],
      steps: ['各自找甲、乙文核心訊息', '比較相同與不同之處', '確認哪個判斷同時被兩文支持', '不要把未出現的資訊自行補進去'],
      explanation: item.common,
    }
  }

  if (family === 'writing-expression') {
    const topic = seededPick(['校外教學', '一次合作經驗', '雨天上學', '我想改善的校園角落'], seed + 1)
    const vague = `今天發生很多事情，我覺得很特別，也學到很多。`
    const concrete = `寫「${topic}」時，先交代一個具體場景，再選一個關鍵事件，補上人物動作、對話或觀察，最後說明這件事讓自己改變了什麼想法。`
    return {
      context: `草稿：「${vague}」題目是〈${topic}〉。`,
      prompt: '如果要把草稿修得更具體，哪一個修改方向最好？',
      answer: concrete,
      distractors: ['把「很多」再重複三次以增加字數', '刪除所有時間、人物與事件，只留下感想', '加入和題目無關的成語越多越好'],
      steps: ['確認題目中心', '補一個具體事件', '用動作／對話／細節呈現', '讓結尾回扣事件造成的想法'],
      explanation: '有效修訂不是單純增加字數，而是讓內容有可看見的事件與細節，並讓段落服務同一個中心。',
    }
  }

  if (family === 'literature') {
    const item = {
      text: '我推開多年沒開的木門，灰塵在午後的光裡浮動。牆上的身高刻痕還停在國小六年級，我伸手比了比，才發現自己早已高出許多。',
      answer: '以第一人稱回到舊空間，透過身高刻痕表現時間流逝與自我成長。',
    }
    return {
      context: item.text,
      prompt: '哪一項最能同時說明敘事視角、物件細節與主題作用？',
      answer: item.answer,
      distractors: ['文章只在客觀介紹木門材質', '「身高刻痕」與人物情感完全無關', '只要出現午後光線就一定是說明文'],
      steps: ['先判斷誰在說故事', '找反覆或突出的物件／空間', '比較現在與過去的關係', '把細節和主題連起來'],
      explanation: '文學閱讀要把敘事視角、細節與主題一起看；物件常不只交代場景，也承載時間與情感。',
    }
  }

  const item = ARGUMENT_ITEMS[n(0, ARGUMENT_ITEMS.length - 1, 3)]
  return {
    context: `研究摘要草稿：${item.evidence}。作者據此提出「${item.claim}」的建議。`,
    prompt: '若要把這段改成較嚴謹的公共／學術表達，最需要補哪一項？',
    answer: '交代資料如何蒐集、樣本範圍與這份證據能支持到什麼程度',
    distractors: ['把所有限制刪掉，讓結論更有力', '只把句子改得更長', '加入更多形容詞取代資料'],
    steps: ['辨認資料來源', '確認樣本與方法', '區分資料結果與作者推論', '在結論中保留適當限制'],
    explanation: '公共與學術論述重視可追溯的資料與推論範圍；結論不能比證據本身更強。',
  }
}

function exampleFromCase(context: V21UnitContext, family: ChineseFamily, index: number): ReviewedWorkedExample {
  const item = chineseCase(context, family, index)
  return {
    title: `${familyLabel(family)}示範 ${index + 1}`,
    context: item.context,
    prompt: item.prompt,
    steps: item.steps,
    answer: item.answer,
    explanation: item.explanation,
  }
}

function questionFromCase(context: V21UnitContext, family: ChineseFamily, index: number, id: string, level: '理解' | '應用' | '檢核'): ReviewedQuestion {
  const item = chineseCase(context, family, index + 9)
  if (index % 5 === 4) {
    return responseQuestion({
      id,
      level,
      context: item.context,
      prompt: `${item.prompt} 請引用題目中的具體字詞或句子支持你的回答。`,
      sampleAnswer: `${item.answer}。可從題目中的具體語句看出這個判斷；判斷時依序做：${item.steps.join(' → ')}。`,
      explanation: item.explanation,
      rubric: ['答案回應題目核心', '引用或指出具體文本證據', '能解釋證據與結論的關係'],
    })
  }
  return choiceQuestion({ id, level, context: item.context, prompt: item.prompt, correct: item.answer, distractors: item.distractors, explanation: item.explanation })
}

function misconceptionPairs(family: ChineseFamily) {
  const common: Record<ChineseFamily, Array<{ wrong: string; right: string; why: string }>> = {
    'phonetics-characters': [
      { wrong: '兩個字讀音相近，就可以在句子中互相替換。', right: '用字要同時符合字義、詞義與句子語境。', why: '同音或近音字常有不同意義，例如「再／在」、「已／以」。' },
      { wrong: '只看字的一個部件就一定能完全猜出讀音與意思。', right: '部件能提供線索，但仍要依完整字形與實際用法確認。', why: '形聲字的聲符與現代讀音可能已發生變化。' },
    ],
    'sentence-punctuation': [
      { wrong: '標點只是停頓裝飾，換哪一個都不影響意思。', right: '標點會標示語氣、層次、引語與句子關係。', why: '問號、冒號、引號等會直接改變讀者對句子結構的理解。' },
      { wrong: '句子越長就越完整。', right: '完整句子要有清楚的語意關係，不是只把很多詞接在一起。', why: '缺少主幹或連接關係時，長句仍可能不通順。' },
    ],
    narrative: [
      { wrong: '故事最後一句一定就是主旨。', right: '主旨要綜合事件、人物變化與關鍵細節。', why: '結尾可以提示主題，但不能脫離前文事件單獨判斷。' },
      { wrong: '人物做了什麼和人物怎麼改變是同一件事。', right: '事件是行動／發生的事；人物變化要比較事件前後的想法、態度或選擇。', why: '敘事分析要能說出事件如何造成變化。' },
    ],
    expository: [
      { wrong: '說明文只要找到最多次出現的名詞就等於找到主旨。', right: '要找說明對象以及各段之間的原因、功能、分類或步驟關係。', why: '高頻詞可能只是主題名稱，核心資訊在它和其他資訊的關係。' },
      { wrong: '任何細節都和核心資訊同等重要。', right: '要區分核心說明與支持細節。', why: '摘要時需要保留主幹，不能把所有例子原封不動抄下來。' },
    ],
    rhetoric: [
      { wrong: '只要句子裡有「像」就是譬喻。', right: '要看「像」是否真的建立兩個事物的相似關係。', why: '「他好像沒來」的「好像」表推測，不是把兩個形象拿來比較。' },
      { wrong: '指出修辭名稱就完成分析。', right: '還要說明修辭如何改變畫面、語氣或情感效果。', why: '修辭的價值在表達作用，不只是分類標籤。' },
    ],
    poetry: [
      { wrong: '詩句越短就一定越沒有內容。', right: '詩歌常用意象、節奏與省略讓少量文字承載多層感受。', why: '理解詩要觀察具體物象、聲音、動作與它們的組合。' },
      { wrong: '任何情緒解讀都可以，不需要文本證據。', right: '詮釋可以多元，但仍需回到詩句中的意象與語言線索。', why: '沒有文本依據的感想不能取代閱讀分析。' },
    ],
    classical: [
      { wrong: '文言文字詞永遠和現代常用義完全相同。', right: '字義要依句法、上下文與時代語境判斷。', why: '古今詞義可能改變，一字也可能多義。' },
      { wrong: '逐字翻成現代詞就一定能得到通順正確的句意。', right: '翻譯還要處理省略、語序與虛詞關係。', why: '文言句法與現代漢語不完全相同。' },
    ],
    'argument-media': [
      { wrong: '只要很多人轉傳的說法就是可靠證據。', right: '要檢查來源、資料、方法與說法是否真的支持主張。', why: '人氣代表傳播程度，不等於事實查核。' },
      { wrong: '反對一個主張只要批評提出主張的人。', right: '應回應主張本身的理由、證據或推論。', why: '攻擊人物不能取代對論證的檢驗。' },
    ],
    'cross-text': [
      { wrong: '跨文本閱讀只要找兩篇都出現的相同詞。', right: '要比較觀點、證據、目的、資料與彼此關係。', why: '同詞可能用在不同立場；不同詞也可能描述同一概念。' },
      { wrong: '兩篇文字有不同重點就一定互相矛盾。', right: '先判斷它們是在互補、比較、不同尺度，還是真正提出互斥主張。', why: '差異不等於邏輯矛盾。' },
    ],
    'writing-expression': [
      { wrong: '作文越多成語越好。', right: '詞語要符合情境並服務中心，具體細節通常比堆砌成語更重要。', why: '不自然的華麗詞語反而會讓意思模糊。' },
      { wrong: '修訂就是改錯字，不需要改內容結構。', right: '修訂還包括中心、段落順序、例子、句子銜接與語氣。', why: '出版與有效表達都需要多層次修改。' },
    ],
    literature: [
      { wrong: '文學閱讀只要找作者真正想表達的唯一答案。', right: '詮釋可以有差異，但必須以文本細節、作品結構與脈絡支持。', why: '文本證據能區分合理詮釋和沒有依據的猜測。' },
      { wrong: '第一人稱敘述等於作者本人所有經驗。', right: '敘事者是作品中的聲音，不能自動和現實作者完全等同。', why: '文學作品可能虛構人物、事件與視角。' },
    ],
    'public-academic': [
      { wrong: '引用一個數字就代表論述已經客觀。', right: '數字也要檢查來源、定義、樣本、年份與比較方式。', why: '缺少脈絡的數據可能造成誤導。' },
      { wrong: '摘要就是把原文每句縮短一點。', right: '摘要要重組核心問題、主要證據與結論，刪去不影響主幹的細節。', why: '有效摘要反映篇章結構，而不是機械刪字。' },
    ],
  }
  return common[family]
}

export function buildChineseV21(context: V21UnitContext, base: TextbookUnitContentV14): V21SubjectBuild {
  const family = chineseFamily(context)
  const label = familyLabel(family)
  const concepts = cleanConcepts(base, '國語文學習中，')
  const misconceptions = buildMisconceptions({ familyLabel: label, pairs: misconceptionPairs(family) })
  const workedExamples = Array.from({ length: 4 }, (_, index) => exampleFromCase(context, family, index))
  const questions = [
    ...quickCheckSet({
      unitId: context.unit.id,
      familyId: family,
      concepts,
      maker: (_concept, index, id) => questionFromCase(context, family, index, id, '理解'),
    }),
    ...formalQuestionSet({
      unitId: context.unit.id,
      familyId: family,
      makers: [
        (index, id, level) => questionFromCase(context, family, index, id, level),
        (index, id, level) => questionFromCase(context, family, index + 13, id, level),
        (index, id, level) => questionFromCase(context, family, index + 27, id, level),
      ],
    }),
  ]
  const visuals = visualSet({
    unitId: context.unit.id,
    familyLabel: label,
    concepts,
    process: [
      { label: '讀完整材料', detail: '先讀句子、段落、文本或題目要求，不用單一關鍵詞代替全文。' },
      { label: '找語文線索', detail: `依${label}找字詞、句法、篇章、敘事、修辭、證據或脈絡。` },
      { label: '提出文本證據', detail: '回答時指出真正支持判斷的字、詞、句或篇章位置。' },
      { label: '解釋作用', detail: '說明線索如何支持語意、結構、觀點或表達效果。' },
    ],
    compare: misconceptions.map((item, index) => ({ label: `迷思 ${index + 1}`, detail: `${item.claim} → ${item.correction}` })),
  })
  return {
    familyId: family,
    familyLabel: label,
    overview: unitOverview(context, label, `「${label}」的實際語料、文本證據與表達選擇`),
    objectives: unitObjectives(context, label, ['從實際語料找出支持判斷的線索', '比較相近表達或不同文本的差異', '用清楚文字說明文本證據與結論之間的關係']),
    concepts,
    misconceptions,
    visuals,
    workedExamples,
    questions,
    takeaway: [
      `「${context.unit.title}」不是背一個固定答案，而是學會處理真正的語料。`,
      '閱讀判斷要回到文本證據；寫作選擇要回到目的、對象與語境。',
      '修辭、篇章、文言或論證的名稱都要能落到實際句子說明作用。',
      '遇到不同文本時，先保留差異，再用證據比較，不急著把所有內容說成同一件事。',
    ],
  }
}

export function getChineseFamilyV21(context: V21UnitContext) {
  return chineseFamily(context)
}
