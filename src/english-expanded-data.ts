import type { EnglishQuestion, EnglishWord } from './english-data'

export type ExpandedEnglishWord = EnglishWord & {
  acceptedTranslations: string[]
  targetHint: string
}

export type SmartEnglishQuestion = EnglishQuestion & {
  acceptedAnswers?: string[]
  hint?: string
  answerPolicy?: 'exact' | 'semantic'
}

function targetHint(word: string) {
  if (word.length <= 2) return word
  return `${word[0]}${'_'.repeat(Math.max(1, word.length - 2))}${word[word.length - 1]}`
}

type WordSeed = {
  word: string
  meaning: string
  partOfSpeech: string
  level: number
  definition: string
  example: string
  exampleZh: string
  synonyms: string[]
  antonyms: string[]
  confused: string[]
  collocations: string[]
  accepted: string[]
  phoneticUS?: string
  phoneticUK?: string
  morphology?: string[]
  memory?: string
}

function makeWord(seed: WordSeed): ExpandedEnglishWord {
  const memory = seed.memory
    ?? [
      seed.collocations.length > 0 ? `常用搭配：${seed.collocations.slice(0, 2).join(' / ')}。` : '',
      seed.confused.length > 0 ? `注意不要和 ${seed.confused.slice(0, 2).join('、')} 混淆。` : '',
    ].filter(Boolean).join(' ')

  return {
    id: seed.word,
    word: seed.word,
    meaning: seed.meaning,
    partOfSpeech: seed.partOfSpeech,
    level: seed.level,
    phoneticUS: seed.phoneticUS ?? '',
    phoneticUK: seed.phoneticUK ?? '',
    definition: seed.definition,
    morphology: seed.morphology ?? [],
    memory,
    synonyms: seed.synonyms,
    antonyms: seed.antonyms,
    confused: seed.confused,
    collocations: seed.collocations,
    example: seed.example,
    exampleZh: seed.exampleZh,
    acceptedTranslations: Array.from(new Set([seed.word, ...seed.accepted])),
    targetHint: targetHint(seed.word),
  }
}

export const EXPANDED_ENGLISH_WORDS: ExpandedEnglishWord[] = [
  makeWord({
    word: "friend", meaning: "朋友", partOfSpeech: "noun", level: 1,
    definition: "a person you know well and like",
    example: "My friend helps me study English.", exampleZh: "我的朋友幫助我學英文。",
    synonyms: ["companion"], antonyms: ["enemy"], confused: ["friendly"],
    collocations: ["close friend", "best friend"], accepted: ["pal"],
  }),
  makeWord({
    word: "family", meaning: "家庭；家人", partOfSpeech: "noun", level: 1,
    definition: "a group of people related to one another",
    example: "My family eats dinner together.", exampleZh: "我的家人一起吃晚餐。",
    synonyms: ["relatives"], antonyms: [], confused: ["familiar"],
    collocations: ["family member", "family life"], accepted: [],
  }),
  makeWord({
    word: "work", meaning: "工作", partOfSpeech: "noun / verb", level: 1,
    definition: "a job or an activity that requires effort",
    example: "I work at a small company.", exampleZh: "我在一間小公司工作。",
    synonyms: ["job", "labor"], antonyms: ["rest"], confused: ["walk"],
    collocations: ["go to work", "work hard"], accepted: ["job"],
  }),
  makeWord({
    word: "school", meaning: "學校", partOfSpeech: "noun", level: 1,
    definition: "a place where people learn",
    example: "The school opens at eight.", exampleZh: "學校八點開門。",
    synonyms: ["academy"], antonyms: [], confused: ["scholar"],
    collocations: ["go to school", "school day"], accepted: [],
  }),
  makeWord({
    word: "happy", meaning: "快樂的", partOfSpeech: "adjective", level: 1,
    definition: "feeling pleased or satisfied",
    example: "She feels happy today.", exampleZh: "她今天感到快樂。",
    synonyms: ["glad", "pleased"], antonyms: ["sad"], confused: ["happen"],
    collocations: ["feel happy", "happy life"], accepted: ["glad"],
  }),
  makeWord({
    word: "tired", meaning: "疲倦的", partOfSpeech: "adjective", level: 1,
    definition: "needing rest or sleep",
    example: "I am tired after work.", exampleZh: "我下班後很累。",
    synonyms: ["sleepy", "exhausted"], antonyms: ["energetic"], confused: ["tried"],
    collocations: ["feel tired", "too tired"], accepted: ["sleepy"],
  }),
  makeWord({
    word: "early", meaning: "早的；提早", partOfSpeech: "adjective / adverb", level: 1,
    definition: "before the usual or expected time",
    example: "We arrived early for the meeting.", exampleZh: "我們提早到達會議。",
    synonyms: ["ahead of time"], antonyms: ["late"], confused: ["earlier"],
    collocations: ["early morning", "arrive early"], accepted: [],
  }),
  makeWord({
    word: "late", meaning: "遲的；晚到", partOfSpeech: "adjective / adverb", level: 1,
    definition: "after the expected time",
    example: "The bus is five minutes late.", exampleZh: "公車晚了五分鐘。",
    synonyms: ["delayed"], antonyms: ["early"], confused: ["lately"],
    collocations: ["be late", "late at night"], accepted: ["delayed"],
  }),
  makeWord({
    word: "borrow", meaning: "借入", partOfSpeech: "verb", level: 1,
    definition: "to take something for a time and return it later",
    example: "Can I borrow your pen?", exampleZh: "我可以借你的筆嗎？",
    synonyms: ["take on loan"], antonyms: ["lend"], confused: ["borrower"],
    collocations: ["borrow money", "borrow a book"], accepted: [],
  }),
  makeWord({
    word: "lend", meaning: "借出", partOfSpeech: "verb", level: 1,
    definition: "to give something to someone for a time",
    example: "Please lend me your umbrella.", exampleZh: "請把你的傘借給我。",
    synonyms: ["loan"], antonyms: ["borrow"], confused: ["length"],
    collocations: ["lend money", "lend a hand"], accepted: ["loan"],
  }),
  makeWord({
    word: "buy", meaning: "購買", partOfSpeech: "verb", level: 1,
    definition: "to get something by paying money",
    example: "I need to buy a new notebook.", exampleZh: "我需要買一本新筆記本。",
    synonyms: ["purchase"], antonyms: ["sell"], confused: ["by"],
    collocations: ["buy online", "buy a ticket"], accepted: ["purchase"],
  }),
  makeWord({
    word: "sell", meaning: "販售", partOfSpeech: "verb", level: 1,
    definition: "to give something in exchange for money",
    example: "They sell fruit near the station.", exampleZh: "他們在車站附近賣水果。",
    synonyms: ["market"], antonyms: ["buy"], confused: ["sale"],
    collocations: ["sell products", "sell online"], accepted: ["market"],
  }),
  makeWord({
    word: "start", meaning: "開始", partOfSpeech: "verb", level: 1,
    definition: "to begin doing or happening",
    example: "The class starts at nine.", exampleZh: "課程九點開始。",
    synonyms: ["begin"], antonyms: ["finish", "stop"], confused: ["starter"],
    collocations: ["start work", "start with"], accepted: ["begin"],
  }),
  makeWord({
    word: "finish", meaning: "完成；結束", partOfSpeech: "verb", level: 1,
    definition: "to complete something",
    example: "Please finish the report today.", exampleZh: "請今天完成報告。",
    synonyms: ["complete", "end"], antonyms: ["start"], confused: ["final"],
    collocations: ["finish work", "finish doing"], accepted: ["complete", "end"],
  }),
  makeWord({
    word: "keep", meaning: "保持；保留", partOfSpeech: "verb", level: 1,
    definition: "to continue having or doing something",
    example: "Please keep the room clean.", exampleZh: "請保持房間整潔。",
    synonyms: ["maintain", "retain"], antonyms: ["discard"], confused: ["kept"],
    collocations: ["keep calm", "keep a record"], accepted: ["maintain", "retain", "preserve"],
  }),
  makeWord({
    word: "change", meaning: "改變；零錢", partOfSpeech: "verb / noun", level: 1,
    definition: "to become different or make something different",
    example: "We need to change the meeting time.", exampleZh: "我們需要更改會議時間。",
    synonyms: ["alter", "modify"], antonyms: ["remain"], confused: ["chance"],
    collocations: ["change plans", "make a change"], accepted: ["alter", "modify"],
  }),
  makeWord({
    word: "environment", meaning: "環境", partOfSpeech: "noun", level: 2,
    definition: "the natural or social conditions around a person or thing",
    example: "We should protect the environment.", exampleZh: "我們應該保護環境。",
    synonyms: ["surroundings", "setting"], antonyms: ["isolation"], confused: ["environmental"],
    collocations: ["protect the environment", "working environment"], accepted: ["surroundings"],
    morphology: ['en-（使進入）', 'viron（周圍）', '-ment（名詞字尾）'], memory: 'environ + ment；注意中間有 n，不是 enviroment。',
  }),
  makeWord({
    word: "responsible", meaning: "負責任的", partOfSpeech: "adjective", level: 2,
    definition: "having a duty and being dependable",
    example: "She is responsible for every order.", exampleZh: "她負責每一筆訂單。",
    synonyms: ["reliable", "accountable"], antonyms: ["irresponsible", "careless"], confused: ["responsive"],
    collocations: ["be responsible for", "responsible adult"], accepted: ["reliable"],
    morphology: ['spons（承諾）', '-ible（能夠……的）'], memory: 'response 與 responsible 都帶有「回應、承擔」的概念。',
  }),
  makeWord({
    word: "available", meaning: "可用的；有空的", partOfSpeech: "adjective", level: 2,
    definition: "able to be used, obtained, or contacted",
    example: "The service is available all day.", exampleZh: "這項服務全天可用。",
    synonyms: ["accessible", "obtainable"], antonyms: ["unavailable", "occupied"], confused: ["valuable"],
    collocations: ["available now", "available resources"], accepted: ["accessible"],
    morphology: ['avail（有用、可利用）', '-able（能夠……的）'], memory: 'avail + able，表示「能夠被利用」。',
  }),
  makeWord({
    word: "improve", meaning: "改善；進步", partOfSpeech: "verb", level: 2,
    definition: "to become better or make something better",
    example: "Practice can improve your spelling.", exampleZh: "練習可以改善你的拼字。",
    synonyms: ["enhance", "develop"], antonyms: ["worsen"], confused: ["improvement"],
    collocations: ["improve skills", "improve quality"], accepted: ["enhance"],
  }),
  makeWord({
    word: "decide", meaning: "決定", partOfSpeech: "verb", level: 2,
    definition: "to choose after thinking",
    example: "We decided to leave early.", exampleZh: "我們決定提早離開。",
    synonyms: ["choose", "determine"], antonyms: ["hesitate"], confused: ["decision"],
    collocations: ["decide to", "decide whether"], accepted: ["choose"],
  }),
  makeWord({
    word: "explain", meaning: "解釋", partOfSpeech: "verb", level: 2,
    definition: "to make something clear",
    example: "Could you explain this rule again?", exampleZh: "你可以再解釋一次這條規則嗎？",
    synonyms: ["clarify", "describe"], antonyms: ["confuse"], confused: ["explanation"],
    collocations: ["explain why", "explain clearly"], accepted: ["clarify"],
  }),
  makeWord({
    word: "prepare", meaning: "準備", partOfSpeech: "verb", level: 2,
    definition: "to make ready for use or action",
    example: "I prepared the files before the meeting.", exampleZh: "我在會議前準備好檔案。",
    synonyms: ["get ready", "arrange"], antonyms: ["neglect"], confused: ["preparation"],
    collocations: ["prepare for", "prepare a report"], accepted: ["get ready"],
  }),
  makeWord({
    word: "travel", meaning: "旅行", partOfSpeech: "verb / noun", level: 2,
    definition: "to go from one place to another",
    example: "She travels by train every week.", exampleZh: "她每週搭火車旅行。",
    synonyms: ["journey"], antonyms: ["stay"], confused: ["traveler"],
    collocations: ["travel abroad", "business travel"], accepted: ["journey"],
  }),
  makeWord({
    word: "healthy", meaning: "健康的", partOfSpeech: "adjective", level: 2,
    definition: "in good physical or mental condition",
    example: "Walking is a healthy habit.", exampleZh: "走路是健康的習慣。",
    synonyms: ["fit", "well"], antonyms: ["unhealthy", "sick"], confused: ["health"],
    collocations: ["healthy food", "stay healthy"], accepted: ["fit"],
  }),
  makeWord({
    word: "careful", meaning: "小心的；仔細的", partOfSpeech: "adjective", level: 2,
    definition: "giving attention to avoid mistakes or danger",
    example: "Be careful with this glass.", exampleZh: "小心這個玻璃杯。",
    synonyms: ["cautious", "attentive"], antonyms: ["careless"], confused: ["carefully"],
    collocations: ["be careful", "careful review"], accepted: ["cautious"],
  }),
  makeWord({
    word: "possible", meaning: "可能的", partOfSpeech: "adjective", level: 2,
    definition: "able to happen or be done",
    example: "Is it possible to finish today?", exampleZh: "今天有可能完成嗎？",
    synonyms: ["feasible"], antonyms: ["impossible"], confused: ["possibly"],
    collocations: ["as soon as possible", "possible solution"], accepted: ["feasible"],
  }),
  makeWord({
    word: "different", meaning: "不同的", partOfSpeech: "adjective", level: 2,
    definition: "not the same",
    example: "These two plans are different.", exampleZh: "這兩個計畫不同。",
    synonyms: ["distinct", "unlike"], antonyms: ["same", "similar"], confused: ["difference"],
    collocations: ["different from", "completely different"], accepted: ["distinct"],
  }),
  makeWord({
    word: "remember", meaning: "記得", partOfSpeech: "verb", level: 2,
    definition: "to keep something in your mind",
    example: "Remember to save the file.", exampleZh: "記得儲存檔案。",
    synonyms: ["recall"], antonyms: ["forget"], confused: ["remind"],
    collocations: ["remember to", "remember doing"], accepted: ["recall"],
  }),
  makeWord({
    word: "choose", meaning: "選擇", partOfSpeech: "verb", level: 2,
    definition: "to select from several possibilities",
    example: "Choose the answer that fits best.", exampleZh: "選擇最適合的答案。",
    synonyms: ["select", "pick"], antonyms: ["reject"], confused: ["choice"],
    collocations: ["choose between", "choose wisely"], accepted: ["select", "pick"],
  }),
  makeWord({
    word: "return", meaning: "返回；歸還", partOfSpeech: "verb / noun", level: 2,
    definition: "to go back or give something back",
    example: "Please return the book tomorrow.", exampleZh: "請明天歸還這本書。",
    synonyms: ["go back", "give back"], antonyms: ["depart"], confused: ["refund"],
    collocations: ["return home", "return a product"], accepted: ["go back", "give back"],
  }),
  makeWord({
    word: "support", meaning: "支持；支援", partOfSpeech: "verb / noun", level: 2,
    definition: "to help someone or something succeed",
    example: "The team supports new members.", exampleZh: "團隊支持新成員。",
    synonyms: ["assist", "back"], antonyms: ["oppose"], confused: ["suppose"],
    collocations: ["technical support", "support a plan"], accepted: ["assist", "help"],
  }),
  makeWord({
    word: "efficient", meaning: "有效率的", partOfSpeech: "adjective", level: 3,
    definition: "working well without wasting time or resources",
    example: "This shortcut makes the process more efficient.", exampleZh: "這個捷徑讓流程更有效率。",
    synonyms: ["productive", "streamlined"], antonyms: ["inefficient", "wasteful"], confused: ["effective"],
    collocations: ["efficient system", "work efficiently"], accepted: ["productive"],
  }),
  makeWord({
    word: "maintain", meaning: "維持；保養", partOfSpeech: "verb", level: 3,
    definition: "to keep something in good condition or at the same level",
    example: "Regular updates help maintain system security.", exampleZh: "定期更新有助於維持系統安全。",
    synonyms: ["preserve", "sustain", "keep"], antonyms: ["neglect", "abandon"], confused: ["retain", "maintenance"],
    collocations: ["maintain quality", "maintain a system"], accepted: ["keep", "preserve", "sustain", "retain"],
    morphology: ['manu（手）', 'ten（握住）'], memory: '本課目標字是 maintain；單獨翻譯「保持」時 keep 也可能合理，句子與搭配會決定最自然用字。',
  }),
  makeWord({
    word: "significant", meaning: "重要的；顯著的", partOfSpeech: "adjective", level: 3,
    definition: "large or important enough to be noticed",
    example: "The update produced a significant improvement.", exampleZh: "這次更新帶來顯著改善。",
    synonyms: ["important", "considerable"], antonyms: ["minor", "insignificant"], confused: ["meaningful"],
    collocations: ["significant change", "significant impact"], accepted: ["important", "considerable"],
  }),
  makeWord({
    word: "require", meaning: "需要；要求", partOfSpeech: "verb", level: 3,
    definition: "to need something or make something necessary",
    example: "This task requires careful planning.", exampleZh: "這項任務需要仔細規劃。",
    synonyms: ["need", "demand"], antonyms: ["allow"], confused: ["request"],
    collocations: ["require approval", "require someone to"], accepted: ["need"],
  }),
  makeWord({
    word: "provide", meaning: "提供", partOfSpeech: "verb", level: 3,
    definition: "to give something that is needed",
    example: "The guide provides useful examples.", exampleZh: "這份指南提供實用範例。",
    synonyms: ["supply", "offer"], antonyms: ["withhold"], confused: ["provider"],
    collocations: ["provide support", "provide information"], accepted: ["supply", "offer"],
  }),
  makeWord({
    word: "achieve", meaning: "達成", partOfSpeech: "verb", level: 3,
    definition: "to succeed in reaching a goal",
    example: "She achieved her learning goal.", exampleZh: "她達成了學習目標。",
    synonyms: ["accomplish", "attain"], antonyms: ["fail"], confused: ["achievement"],
    collocations: ["achieve a goal", "achieve success"], accepted: ["accomplish", "attain"],
  }),
  makeWord({
    word: "reduce", meaning: "減少", partOfSpeech: "verb", level: 3,
    definition: "to make something smaller or less",
    example: "We reduced the loading time.", exampleZh: "我們縮短了載入時間。",
    synonyms: ["decrease", "lower"], antonyms: ["increase"], confused: ["reuse"],
    collocations: ["reduce costs", "reduce risk"], accepted: ["decrease", "lower"],
  }),
  makeWord({
    word: "increase", meaning: "增加", partOfSpeech: "verb / noun", level: 3,
    definition: "to become or make greater",
    example: "Sales increased by ten percent.", exampleZh: "銷售增加了百分之十。",
    synonyms: ["rise", "grow"], antonyms: ["decrease", "reduce"], confused: ["raise"],
    collocations: ["increase by", "increase to"], accepted: ["rise", "grow"],
  }),
  makeWord({
    word: "compare", meaning: "比較", partOfSpeech: "verb", level: 3,
    definition: "to examine similarities and differences",
    example: "Compare the two test results.", exampleZh: "比較這兩個測試結果。",
    synonyms: ["contrast", "evaluate"], antonyms: [], confused: ["comparison"],
    collocations: ["compare with", "compare prices"], accepted: ["contrast"],
  }),
  makeWord({
    word: "manage", meaning: "管理；設法完成", partOfSpeech: "verb", level: 3,
    definition: "to control work or succeed in doing something",
    example: "He manages a small development team.", exampleZh: "他管理一個小型開發團隊。",
    synonyms: ["supervise", "handle"], antonyms: ["mismanage"], confused: ["manager"],
    collocations: ["manage a team", "manage to"], accepted: ["handle", "supervise"],
  }),
  makeWord({
    word: "suggest", meaning: "建議；暗示", partOfSpeech: "verb", level: 3,
    definition: "to offer an idea for consideration",
    example: "I suggest testing the change first.", exampleZh: "我建議先測試這項變更。",
    synonyms: ["recommend", "propose"], antonyms: ["discourage"], confused: ["suggestion"],
    collocations: ["suggest doing", "strongly suggest"], accepted: ["recommend", "propose"],
  }),
  makeWord({
    word: "avoid", meaning: "避免", partOfSpeech: "verb", level: 3,
    definition: "to keep away from something",
    example: "Avoid sharing secret keys publicly.", exampleZh: "避免公開分享密鑰。",
    synonyms: ["prevent", "evade"], antonyms: ["confront"], confused: ["avoidable"],
    collocations: ["avoid doing", "avoid mistakes"], accepted: ["prevent"],
  }),
  makeWord({
    word: "experience", meaning: "經驗；體驗", partOfSpeech: "noun / verb", level: 3,
    definition: "knowledge gained by doing something",
    example: "She has experience with customer support.", exampleZh: "她有客服經驗。",
    synonyms: ["practice", "background"], antonyms: ["inexperience"], confused: ["experiment"],
    collocations: ["work experience", "experience problems"], accepted: ["background"],
  }),
  makeWord({
    word: "communicate", meaning: "溝通", partOfSpeech: "verb", level: 3,
    definition: "to share information or ideas",
    example: "Clear messages help teams communicate.", exampleZh: "清楚的訊息有助於團隊溝通。",
    synonyms: ["convey", "interact"], antonyms: ["miscommunicate"], confused: ["communication"],
    collocations: ["communicate with", "communicate clearly"], accepted: ["convey"],
  }),
  makeWord({
    word: "reliable", meaning: "可靠的", partOfSpeech: "adjective", level: 3,
    definition: "consistently good and trustworthy",
    example: "We need a reliable backup system.", exampleZh: "我們需要可靠的備份系統。",
    synonyms: ["dependable", "trustworthy"], antonyms: ["unreliable"], confused: ["reliant"],
    collocations: ["reliable source", "highly reliable"], accepted: ["dependable", "trustworthy"],
  }),
  makeWord({
    word: "opportunity", meaning: "機會", partOfSpeech: "noun", level: 3,
    definition: "a favorable chance to do something",
    example: "This project is a good learning opportunity.", exampleZh: "這個專案是很好的學習機會。",
    synonyms: ["chance", "opening"], antonyms: ["obstacle"], confused: ["possibility"],
    collocations: ["job opportunity", "opportunity to"], accepted: ["chance"],
  }),
  makeWord({
    word: "implement", meaning: "實施；執行", partOfSpeech: "verb", level: 4,
    definition: "to put a plan or system into operation",
    example: "The team will implement the new login flow.", exampleZh: "團隊將實施新的登入流程。",
    synonyms: ["execute", "apply"], antonyms: ["cancel", "discard"], confused: ["deploy"],
    collocations: ["implement a feature", "implement changes"], accepted: ["execute", "apply"],
  }),
  makeWord({
    word: "comprehensive", meaning: "全面的；綜合的", partOfSpeech: "adjective", level: 4,
    definition: "including nearly all elements or details",
    example: "We need a comprehensive test plan.", exampleZh: "我們需要一份全面的測試計畫。",
    synonyms: ["thorough", "complete"], antonyms: ["limited", "partial"], confused: ["comprehensible"],
    collocations: ["comprehensive report", "comprehensive review"], accepted: ["thorough", "complete"],
  }),
  makeWord({
    word: "evaluate", meaning: "評估", partOfSpeech: "verb", level: 4,
    definition: "to judge quality, value, or performance",
    example: "We evaluated the results before release.", exampleZh: "我們在發布前評估結果。",
    synonyms: ["assess", "appraise"], antonyms: ["ignore"], confused: ["evaluation"],
    collocations: ["evaluate performance", "carefully evaluate"], accepted: ["assess"],
  }),
  makeWord({
    word: "establish", meaning: "建立；確立", partOfSpeech: "verb", level: 4,
    definition: "to create something intended to last",
    example: "The company established a new process.", exampleZh: "公司建立了新流程。",
    synonyms: ["create", "found"], antonyms: ["abolish"], confused: ["estimate"],
    collocations: ["establish a rule", "well established"], accepted: ["create", "found"],
  }),
  makeWord({
    word: "contribute", meaning: "貢獻；促成", partOfSpeech: "verb", level: 4,
    definition: "to give something or help cause a result",
    example: "Everyone contributed to the solution.", exampleZh: "每個人都為解決方案做出貢獻。",
    synonyms: ["donate", "add"], antonyms: ["withhold"], confused: ["contribution"],
    collocations: ["contribute to", "contribute ideas"], accepted: ["donate"],
  }),
  makeWord({
    word: "emphasize", meaning: "強調", partOfSpeech: "verb", level: 4,
    definition: "to give special importance to something",
    example: "The report emphasizes data security.", exampleZh: "報告強調資料安全。",
    synonyms: ["stress", "highlight"], antonyms: ["downplay"], confused: ["emphasis"],
    collocations: ["emphasize that", "strongly emphasize"], accepted: ["stress", "highlight"],
  }),
  makeWord({
    word: "negotiate", meaning: "協商", partOfSpeech: "verb", level: 4,
    definition: "to discuss in order to reach agreement",
    example: "They negotiated a better contract.", exampleZh: "他們協商出更好的合約。",
    synonyms: ["bargain", "discuss"], antonyms: ["dictate"], confused: ["negotiation"],
    collocations: ["negotiate with", "negotiate terms"], accepted: ["bargain"],
  }),
  makeWord({
    word: "alternative", meaning: "替代方案；另一選擇", partOfSpeech: "noun / adjective", level: 4,
    definition: "another possible choice",
    example: "We need an alternative solution.", exampleZh: "我們需要替代方案。",
    synonyms: ["option", "substitute"], antonyms: [], confused: ["alternate"],
    collocations: ["alternative approach", "alternative to"], accepted: ["option", "substitute"],
  }),
  makeWord({
    word: "consequence", meaning: "後果；結果", partOfSpeech: "noun", level: 4,
    definition: "a result of an action or condition",
    example: "One consequence was a longer delay.", exampleZh: "其中一個後果是延遲更久。",
    synonyms: ["result", "outcome"], antonyms: ["cause"], confused: ["consequently"],
    collocations: ["serious consequence", "as a consequence"], accepted: ["result", "outcome"],
  }),
  makeWord({
    word: "appropriate", meaning: "適當的", partOfSpeech: "adjective", level: 4,
    definition: "suitable for a particular situation",
    example: "Choose an appropriate response.", exampleZh: "選擇適當的回應。",
    synonyms: ["suitable", "proper"], antonyms: ["inappropriate"], confused: ["appreciate"],
    collocations: ["appropriate action", "appropriate for"], accepted: ["suitable", "proper"],
  }),
  makeWord({
    word: "complex", meaning: "複雜的", partOfSpeech: "adjective", level: 4,
    definition: "having many connected parts",
    example: "The system has a complex structure.", exampleZh: "這個系統有複雜的結構。",
    synonyms: ["complicated", "intricate"], antonyms: ["simple"], confused: ["complicate"],
    collocations: ["complex problem", "highly complex"], accepted: ["complicated"],
  }),
  makeWord({
    word: "accurate", meaning: "準確的", partOfSpeech: "adjective", level: 4,
    definition: "correct and free from error",
    example: "The report contains accurate data.", exampleZh: "報告包含準確資料。",
    synonyms: ["precise", "correct"], antonyms: ["inaccurate"], confused: ["actual"],
    collocations: ["accurate result", "highly accurate"], accepted: ["precise", "correct"],
  }),
  makeWord({
    word: "flexible", meaning: "彈性的；靈活的", partOfSpeech: "adjective", level: 4,
    definition: "able to change or adapt easily",
    example: "The schedule is flexible.", exampleZh: "這個行程很有彈性。",
    synonyms: ["adaptable", "versatile"], antonyms: ["rigid"], confused: ["flexibility"],
    collocations: ["flexible schedule", "remain flexible"], accepted: ["adaptable"],
  }),
  makeWord({
    word: "sustainable", meaning: "永續的；可持續的", partOfSpeech: "adjective", level: 4,
    definition: "able to continue without causing serious harm",
    example: "We need a sustainable business model.", exampleZh: "我們需要可持續的商業模式。",
    synonyms: ["viable", "renewable"], antonyms: ["unsustainable"], confused: ["sustain"],
    collocations: ["sustainable growth", "environmentally sustainable"], accepted: ["viable"],
  }),
  makeWord({
    word: "relevant", meaning: "相關的", partOfSpeech: "adjective", level: 4,
    definition: "closely connected to the subject",
    example: "Please include only relevant details.", exampleZh: "請只包含相關細節。",
    synonyms: ["applicable", "pertinent"], antonyms: ["irrelevant"], confused: ["relative"],
    collocations: ["relevant information", "relevant to"], accepted: ["applicable"],
  }),
  makeWord({
    word: "perspective", meaning: "觀點；角度", partOfSpeech: "noun", level: 4,
    definition: "a particular way of viewing something",
    example: "Try to see the issue from another perspective.", exampleZh: "試著從另一個角度看問題。",
    synonyms: ["viewpoint", "outlook"], antonyms: [], confused: ["prospective"],
    collocations: ["from a perspective", "different perspective"], accepted: ["viewpoint"],
  }),
  makeWord({
    word: "inevitable", meaning: "不可避免的", partOfSpeech: "adjective", level: 5,
    definition: "certain to happen and impossible to prevent",
    example: "Some mistakes are inevitable during migration.", exampleZh: "遷移過程中有些錯誤不可避免。",
    synonyms: ["unavoidable", "certain"], antonyms: ["avoidable", "uncertain"], confused: ["eventual"],
    collocations: ["seem inevitable", "inevitable result"], accepted: ["unavoidable"],
    morphology: ['in-（不）', 'evit（避免）', '-able（能夠……的）'], memory: 'in + evit + able，字面就是「不能避免的」。',
  }),
  makeWord({
    word: "meticulous", meaning: "一絲不苟的", partOfSpeech: "adjective", level: 5,
    definition: "showing very careful attention to detail",
    example: "Her meticulous notes made the handover easier.", exampleZh: "她一絲不苟的筆記讓交接更容易。",
    synonyms: ["precise", "careful"], antonyms: ["careless", "sloppy"], confused: ["methodical"],
    collocations: ["meticulous planning", "meticulous attention"], accepted: ["precise", "careful"],
  }),
  makeWord({
    word: "ambiguous", meaning: "模糊不清的；有歧義的", partOfSpeech: "adjective", level: 5,
    definition: "having more than one possible meaning",
    example: "The instruction was too ambiguous.", exampleZh: "這項指示太模糊。",
    synonyms: ["unclear", "equivocal"], antonyms: ["clear", "explicit"], confused: ["ambitious"],
    collocations: ["ambiguous wording", "remain ambiguous"], accepted: ["unclear"],
  }),
  makeWord({
    word: "coherent", meaning: "連貫的；一致的", partOfSpeech: "adjective", level: 5,
    definition: "logical and easy to understand as a whole",
    example: "The proposal presents a coherent argument.", exampleZh: "這份提案提出連貫的論點。",
    synonyms: ["logical", "consistent"], antonyms: ["incoherent"], confused: ["cohesive"],
    collocations: ["coherent explanation", "coherent strategy"], accepted: ["logical", "consistent"],
  }),
  makeWord({
    word: "compelling", meaning: "有說服力的；引人注目的", partOfSpeech: "adjective", level: 5,
    definition: "strongly convincing or attracting attention",
    example: "The evidence was compelling.", exampleZh: "證據很有說服力。",
    synonyms: ["convincing", "persuasive"], antonyms: ["unconvincing"], confused: ["compulsory"],
    collocations: ["compelling evidence", "compelling reason"], accepted: ["convincing", "persuasive"],
  }),
  makeWord({
    word: "substantial", meaning: "大量的；重大的", partOfSpeech: "adjective", level: 5,
    definition: "large in amount, value, or importance",
    example: "The update brought substantial benefits.", exampleZh: "更新帶來重大效益。",
    synonyms: ["considerable", "significant"], antonyms: ["minor", "insubstantial"], confused: ["substantive"],
    collocations: ["substantial amount", "substantial improvement"], accepted: ["considerable", "significant"],
  }),
  makeWord({
    word: "sophisticated", meaning: "精密的；老練的", partOfSpeech: "adjective", level: 5,
    definition: "advanced, complex, or highly developed",
    example: "The tool uses a sophisticated algorithm.", exampleZh: "這個工具使用精密的演算法。",
    synonyms: ["advanced", "refined"], antonyms: ["simple", "naive"], confused: ["complicated"],
    collocations: ["sophisticated system", "highly sophisticated"], accepted: ["advanced"],
  }),
  makeWord({
    word: "undermine", meaning: "削弱；暗中破壞", partOfSpeech: "verb", level: 5,
    definition: "to make something weaker or less effective",
    example: "Poor communication can undermine trust.", exampleZh: "溝通不良可能削弱信任。",
    synonyms: ["weaken", "erode"], antonyms: ["strengthen"], confused: ["underestimate"],
    collocations: ["undermine confidence", "undermine efforts"], accepted: ["weaken"],
  }),
  makeWord({
    word: "facilitate", meaning: "促進；使便利", partOfSpeech: "verb", level: 5,
    definition: "to make an action or process easier",
    example: "The new tool facilitates collaboration.", exampleZh: "新工具促進協作。",
    synonyms: ["enable", "ease"], antonyms: ["hinder"], confused: ["facility"],
    collocations: ["facilitate learning", "facilitate communication"], accepted: ["enable"],
  }),
  makeWord({
    word: "allocate", meaning: "分配", partOfSpeech: "verb", level: 5,
    definition: "to distribute resources for a purpose",
    example: "We allocated more time to testing.", exampleZh: "我們分配更多時間給測試。",
    synonyms: ["assign", "distribute"], antonyms: ["withhold"], confused: ["location"],
    collocations: ["allocate resources", "allocate time"], accepted: ["assign", "distribute"],
  }),
  makeWord({
    word: "perceive", meaning: "察覺；理解", partOfSpeech: "verb", level: 5,
    definition: "to notice or understand something",
    example: "Users may perceive the change differently.", exampleZh: "使用者可能以不同方式理解這項變更。",
    synonyms: ["notice", "interpret"], antonyms: ["overlook"], confused: ["receive"],
    collocations: ["perceive as", "widely perceived"], accepted: ["notice", "interpret"],
  }),
  makeWord({
    word: "advocate", meaning: "提倡；擁護者", partOfSpeech: "verb / noun", level: 5,
    definition: "to publicly support an idea or cause",
    example: "She advocates clearer documentation.", exampleZh: "她提倡更清楚的文件。",
    synonyms: ["support", "promote"], antonyms: ["oppose"], confused: ["advice"],
    collocations: ["advocate for", "strongly advocate"], accepted: ["support", "promote"],
  }),
  makeWord({
    word: "reluctant", meaning: "不情願的", partOfSpeech: "adjective", level: 5,
    definition: "unwilling and hesitant",
    example: "He was reluctant to change the process.", exampleZh: "他不太願意更改流程。",
    synonyms: ["unwilling", "hesitant"], antonyms: ["eager", "willing"], confused: ["relevant"],
    collocations: ["reluctant to", "seem reluctant"], accepted: ["unwilling"],
  }),
  makeWord({
    word: "inherent", meaning: "固有的；內在的", partOfSpeech: "adjective", level: 5,
    definition: "existing as a natural part of something",
    example: "Every approach has inherent risks.", exampleZh: "每種方法都有固有風險。",
    synonyms: ["intrinsic", "built-in"], antonyms: ["external", "acquired"], confused: ["inherit"],
    collocations: ["inherent risk", "inherent in"], accepted: ["intrinsic"],
  }),
  makeWord({
    word: "plausible", meaning: "看似合理的", partOfSpeech: "adjective", level: 5,
    definition: "seeming reasonable or likely to be true",
    example: "That is a plausible explanation.", exampleZh: "那是個看似合理的解釋。",
    synonyms: ["credible", "believable"], antonyms: ["implausible"], confused: ["possible"],
    collocations: ["plausible reason", "sound plausible"], accepted: ["credible"],
  }),
  makeWord({
    word: "resilient", meaning: "有韌性的；能恢復的", partOfSpeech: "adjective", level: 5,
    definition: "able to recover quickly from difficulty",
    example: "The system must be resilient to failures.", exampleZh: "系統必須能從故障中恢復。",
    synonyms: ["robust", "adaptable"], antonyms: ["fragile"], confused: ["resistant"],
    collocations: ["resilient system", "highly resilient"], accepted: ["robust"],
  }),
  makeWord({
    word: "ubiquitous", meaning: "無所不在的", partOfSpeech: "adjective", level: 6,
    definition: "present or found everywhere",
    example: "Mobile devices have become ubiquitous.", exampleZh: "行動裝置已變得無所不在。",
    synonyms: ["omnipresent", "widespread"], antonyms: ["rare"], confused: ["unique"],
    collocations: ["ubiquitous presence", "seem ubiquitous"], accepted: ["widespread"],
  }),
  makeWord({
    word: "equivocal", meaning: "模稜兩可的", partOfSpeech: "adjective", level: 6,
    definition: "open to more than one interpretation",
    example: "His response was deliberately equivocal.", exampleZh: "他的回應刻意模稜兩可。",
    synonyms: ["ambiguous", "uncertain"], antonyms: ["unequivocal", "clear"], confused: ["equivalent"],
    collocations: ["equivocal answer", "remain equivocal"], accepted: ["ambiguous"],
  }),
  makeWord({
    word: "paradigm", meaning: "典範；思考模式", partOfSpeech: "noun", level: 6,
    definition: "a model or framework for understanding something",
    example: "Cloud computing changed the software paradigm.", exampleZh: "雲端運算改變了軟體思維模式。",
    synonyms: ["model", "framework"], antonyms: [], confused: ["parameter"],
    collocations: ["paradigm shift", "dominant paradigm"], accepted: ["model"],
  }),
  makeWord({
    word: "juxtapose", meaning: "並置比較", partOfSpeech: "verb", level: 6,
    definition: "to place things side by side for contrast",
    example: "The article juxtaposes two opposing views.", exampleZh: "文章並置比較兩種相反觀點。",
    synonyms: ["contrast", "place side by side"], antonyms: ["separate"], confused: ["suppose"],
    collocations: ["juxtapose with", "carefully juxtapose"], accepted: ["contrast"],
  }),
  makeWord({
    word: "exacerbate", meaning: "使惡化", partOfSpeech: "verb", level: 6,
    definition: "to make a problem or bad situation worse",
    example: "Rushed changes may exacerbate the problem.", exampleZh: "倉促變更可能使問題惡化。",
    synonyms: ["worsen", "aggravate"], antonyms: ["alleviate", "improve"], confused: ["exaggerate"],
    collocations: ["exacerbate tensions", "further exacerbate"], accepted: ["worsen"],
  }),
  makeWord({
    word: "ameliorate", meaning: "改善；緩和", partOfSpeech: "verb", level: 6,
    definition: "to make a bad situation better",
    example: "The patch may ameliorate performance issues.", exampleZh: "這個修補可能改善效能問題。",
    synonyms: ["improve", "alleviate"], antonyms: ["worsen", "exacerbate"], confused: ["elaborate"],
    collocations: ["ameliorate conditions", "help ameliorate"], accepted: ["improve", "alleviate"],
  }),
  makeWord({
    word: "cogent", meaning: "有說服力且清晰的", partOfSpeech: "adjective", level: 6,
    definition: "clear, logical, and convincing",
    example: "She gave a cogent explanation.", exampleZh: "她給出清楚有力的解釋。",
    synonyms: ["convincing", "logical"], antonyms: ["weak", "confused"], confused: ["coherent"],
    collocations: ["cogent argument", "cogent reason"], accepted: ["convincing"],
  }),
  makeWord({
    word: "nuanced", meaning: "細膩而有層次的", partOfSpeech: "adjective", level: 6,
    definition: "showing subtle distinctions",
    example: "The issue requires a nuanced response.", exampleZh: "這個議題需要細膩而有層次的回應。",
    synonyms: ["subtle", "refined"], antonyms: ["simplistic"], confused: ["new"],
    collocations: ["nuanced view", "highly nuanced"], accepted: ["subtle"],
  }),
  makeWord({
    word: "ostensibly", meaning: "表面上；看似", partOfSpeech: "adverb", level: 6,
    definition: "apparently true but possibly not actually true",
    example: "The change was ostensibly minor.", exampleZh: "這項變更表面上很小。",
    synonyms: ["apparently", "seemingly"], antonyms: ["genuinely"], confused: ["obviously"],
    collocations: ["ostensibly designed", "ostensibly simple"], accepted: ["apparently"],
  }),
  makeWord({
    word: "unequivocal", meaning: "明確無疑的", partOfSpeech: "adjective", level: 6,
    definition: "leaving no doubt or ambiguity",
    example: "The test produced an unequivocal result.", exampleZh: "測試產生明確無疑的結果。",
    synonyms: ["unambiguous", "definite"], antonyms: ["equivocal", "uncertain"], confused: ["equivalent"],
    collocations: ["unequivocal support", "unequivocal statement"], accepted: ["unambiguous"],
  }),
  makeWord({
    word: "idiosyncratic", meaning: "獨特怪異的；個人特有的", partOfSpeech: "adjective", level: 6,
    definition: "distinctive in a way peculiar to an individual",
    example: "The legacy system has idiosyncratic rules.", exampleZh: "舊系統有一些特有規則。",
    synonyms: ["peculiar", "distinctive"], antonyms: ["conventional"], confused: ["idiomatic"],
    collocations: ["idiosyncratic style", "highly idiosyncratic"], accepted: ["peculiar"],
  }),
  makeWord({
    word: "ephemeral", meaning: "短暫的", partOfSpeech: "adjective", level: 6,
    definition: "lasting for a very short time",
    example: "Online trends can be ephemeral.", exampleZh: "網路趨勢可能很短暫。",
    synonyms: ["fleeting", "short-lived"], antonyms: ["lasting", "permanent"], confused: ["eternal"],
    collocations: ["ephemeral nature", "ephemeral success"], accepted: ["fleeting"],
  }),
  makeWord({
    word: "pragmatic", meaning: "務實的", partOfSpeech: "adjective", level: 6,
    definition: "dealing with problems in a practical way",
    example: "We need a pragmatic solution.", exampleZh: "我們需要務實的解決方案。",
    synonyms: ["practical", "realistic"], antonyms: ["idealistic", "impractical"], confused: ["programmatic"],
    collocations: ["pragmatic approach", "pragmatic decision"], accepted: ["practical"],
  }),
  makeWord({
    word: "salient", meaning: "顯著的；最重要的", partOfSpeech: "adjective", level: 6,
    definition: "most noticeable or important",
    example: "The report highlights the salient points.", exampleZh: "報告強調最重要的重點。",
    synonyms: ["prominent", "notable"], antonyms: ["minor", "obscure"], confused: ["silent"],
    collocations: ["salient feature", "salient point"], accepted: ["prominent"],
  }),
  makeWord({
    word: "conundrum", meaning: "難題；令人困惑的問題", partOfSpeech: "noun", level: 6,
    definition: "a difficult and confusing problem",
    example: "Data privacy creates a complex conundrum.", exampleZh: "資料隱私造成複雜難題。",
    synonyms: ["dilemma", "puzzle"], antonyms: ["solution"], confused: ["continuum"],
    collocations: ["ethical conundrum", "face a conundrum"], accepted: ["dilemma"],
  }),
  makeWord({
    word: "discern", meaning: "辨識；察覺", partOfSpeech: "verb", level: 6,
    definition: "to perceive or recognize something subtle",
    example: "It is difficult to discern a clear pattern.", exampleZh: "很難辨識出清楚模式。",
    synonyms: ["detect", "distinguish"], antonyms: ["overlook"], confused: ["concern"],
    collocations: ["discern between", "clearly discern"], accepted: ["detect", "distinguish"],
  }),
]

export function expandedWordById(id: string) {
  return EXPANDED_ENGLISH_WORDS.find((word) => word.id === id) ?? null
}

export function wordsAtSimilarLevel(level: number, excludeId?: string) {
  const close = EXPANDED_ENGLISH_WORDS.filter(
    (word) => word.id !== excludeId && Math.abs(word.level - level) <= 1,
  )
  return close.length >= 3
    ? close
    : EXPANDED_ENGLISH_WORDS.filter((word) => word.id !== excludeId)
}
