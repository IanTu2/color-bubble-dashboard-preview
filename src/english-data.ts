export type EnglishGoal = 'daily' | 'work' | 'travel' | 'exam' | 'tech'
export type EnglishAccent = 'en-US' | 'en-GB' | 'mixed'
export type EnglishSkill = 'recognition' | 'spelling' | 'grammar' | 'reading' | 'listening'
export type EnglishQuestionType = 'choice' | 'typing' | 'cloze' | 'listening' | 'correction'

export type EnglishWord = {
  id: string
  word: string
  meaning: string
  partOfSpeech: string
  level: number
  phoneticUS: string
  phoneticUK: string
  definition: string
  morphology: string[]
  memory: string
  synonyms: string[]
  antonyms: string[]
  confused: string[]
  collocations: string[]
  example: string
  exampleZh: string
}

export type EnglishQuestion = {
  id: string
  type: EnglishQuestionType
  skill: EnglishSkill
  difficulty: number
  prompt: string
  answer: string
  choices?: string[]
  audioText?: string
  context?: string
  explanation: string
}

export const ENGLISH_WORDS: EnglishWord[] = [
  { id: 'environment', word: 'environment', meaning: '環境', partOfSpeech: 'noun', level: 2, phoneticUS: '/ɪnˈvaɪrənmənt/', phoneticUK: '/ɪnˈvaɪrənmənt/', definition: 'the natural or social conditions around a person or thing', morphology: ['en-（使進入）', 'viron（周圍）', '-ment（名詞字尾）'], memory: 'environ + ment；注意中間有 n，不是 enviroment。', synonyms: ['surroundings', 'setting'], antonyms: ['isolation'], confused: ['environmental', 'circumstance'], collocations: ['protect the environment', 'working environment', 'natural environment'], example: 'We should protect the environment for future generations.', exampleZh: '我們應為下一代保護環境。' },
  { id: 'responsible', word: 'responsible', meaning: '負責任的', partOfSpeech: 'adjective', level: 2, phoneticUS: '/rɪˈspɑːnsəbəl/', phoneticUK: '/rɪˈspɒnsəbəl/', definition: 'having a duty to deal with something or being dependable', morphology: ['spons（承諾）', '-ible（能夠……的）'], memory: 'response 與 responsible 都帶有「回應、承擔」的概念。', synonyms: ['reliable', 'accountable'], antonyms: ['irresponsible', 'careless'], confused: ['responsive', 'responsibility'], collocations: ['be responsible for', 'responsible adult', 'socially responsible'], example: 'She is responsible for checking every order.', exampleZh: '她負責檢查每一筆訂單。' },
  { id: 'available', word: 'available', meaning: '可用的；有空的', partOfSpeech: 'adjective', level: 2, phoneticUS: '/əˈveɪləbəl/', phoneticUK: '/əˈveɪləbəl/', definition: 'able to be used, obtained, or contacted', morphology: ['avail（有用、可利用）', '-able（能夠……的）'], memory: 'avail + able，表示「能夠被利用」。', synonyms: ['accessible', 'obtainable'], antonyms: ['unavailable', 'occupied'], confused: ['valuable', 'avoidable'], collocations: ['available now', 'make available', 'available resources'], example: 'The service is available twenty-four hours a day.', exampleZh: '這項服務全天候可用。' },
  { id: 'efficient', word: 'efficient', meaning: '有效率的', partOfSpeech: 'adjective', level: 3, phoneticUS: '/ɪˈfɪʃənt/', phoneticUK: '/ɪˈfɪʃənt/', definition: 'working well without wasting time, energy, or resources', morphology: ['fic / fact（做）', '-ent（具有……性質）'], memory: 'efficient 是有效率；effective 是有效果，兩者不完全相同。', synonyms: ['productive', 'streamlined'], antonyms: ['inefficient', 'wasteful'], confused: ['effective', 'sufficient'], collocations: ['energy-efficient', 'efficient system', 'work efficiently'], example: 'This shortcut makes the workflow more efficient.', exampleZh: '這個捷徑讓工作流程更有效率。' },
  { id: 'maintain', word: 'maintain', meaning: '維持；保養', partOfSpeech: 'verb', level: 3, phoneticUS: '/meɪnˈteɪn/', phoneticUK: '/meɪnˈteɪn/', definition: 'to keep something in good condition or at the same level', morphology: ['manu（手）', 'ten（握住）'], memory: '用手握住、不讓它掉下來，因此延伸成「維持」。', synonyms: ['preserve', 'sustain'], antonyms: ['neglect', 'abandon'], confused: ['retain', 'maintenance'], collocations: ['maintain quality', 'maintain a system', 'maintain contact'], example: 'Regular updates help maintain system security.', exampleZh: '定期更新有助於維持系統安全。' },
  { id: 'significant', word: 'significant', meaning: '重要的；顯著的', partOfSpeech: 'adjective', level: 3, phoneticUS: '/sɪɡˈnɪfɪkənt/', phoneticUK: '/sɪɡˈnɪfɪkənt/', definition: 'large or important enough to have an effect or be noticed', morphology: ['sign（記號）', 'fic（做）', '-ant（具有……性質）'], memory: '能「做出明顯記號」的事情，就是顯著且重要的。', synonyms: ['important', 'considerable'], antonyms: ['minor', 'insignificant'], confused: ['meaningful', 'substantial'], collocations: ['significant change', 'significant impact', 'statistically significant'], example: 'The update produced a significant improvement.', exampleZh: '這次更新帶來顯著改善。' },
  { id: 'implement', word: 'implement', meaning: '實施；執行', partOfSpeech: 'verb', level: 4, phoneticUS: '/ˈɪmpləment/', phoneticUK: '/ˈɪmplɪment/', definition: 'to put a plan, decision, or system into operation', morphology: ['im-（進入）', 'ple（填滿）', '-ment（結果、工具）'], memory: '把計畫「填進現實」並真正做出來。', synonyms: ['execute', 'apply'], antonyms: ['cancel', 'discard'], confused: ['deploy', 'implementation'], collocations: ['implement a feature', 'implement changes', 'fully implemented'], example: 'The team will implement the new login flow next week.', exampleZh: '團隊下週會實施新的登入流程。' },
  { id: 'comprehensive', word: 'comprehensive', meaning: '全面的；綜合的', partOfSpeech: 'adjective', level: 4, phoneticUS: '/ˌkɑːmprɪˈhensɪv/', phoneticUK: '/ˌkɒmprɪˈhensɪv/', definition: 'including nearly all elements or details', morphology: ['com-（一起）', 'prehend（抓住、理解）', '-ive（具有……性質）'], memory: '把各部分一起抓住，因此是全面而完整的。', synonyms: ['thorough', 'complete'], antonyms: ['limited', 'partial'], confused: ['comprehensible', 'complicated'], collocations: ['comprehensive report', 'comprehensive review', 'comprehensive solution'], example: 'We need a comprehensive test plan before release.', exampleZh: '發布前我們需要一份全面的測試計畫。' },
  { id: 'inevitable', word: 'inevitable', meaning: '不可避免的', partOfSpeech: 'adjective', level: 5, phoneticUS: '/ɪnˈevɪtəbəl/', phoneticUK: '/ɪnˈevɪtəbəl/', definition: 'certain to happen and impossible to prevent', morphology: ['in-（不）', 'evit（避免）', '-able（能夠……的）'], memory: 'in + evit + able，字面就是「不能避免的」。', synonyms: ['unavoidable', 'certain'], antonyms: ['avoidable', 'uncertain'], confused: ['evitable', 'eventual'], collocations: ['seem inevitable', 'inevitable result', 'almost inevitable'], example: 'Some mistakes are inevitable during a major migration.', exampleZh: '大型遷移過程中，有些錯誤難以避免。' },
  { id: 'meticulous', word: 'meticulous', meaning: '一絲不苟的', partOfSpeech: 'adjective', level: 5, phoneticUS: '/məˈtɪkjələs/', phoneticUK: '/məˈtɪkjələs/', definition: 'showing very careful attention to every detail', morphology: ['meticul（小心、謹慎）', '-ous（充滿……的）'], memory: '把每個小細節都仔細檢查，就是 meticulous。', synonyms: ['precise', 'careful'], antonyms: ['careless', 'sloppy'], confused: ['methodical', 'particular'], collocations: ['meticulous planning', 'meticulous attention', 'meticulous records'], example: 'Her meticulous notes made the handover much easier.', exampleZh: '她一絲不苟的筆記讓交接容易許多。' },
]

export const ENGLISH_QUESTIONS: EnglishQuestion[] = [
  { id: 'q1', type: 'choice', skill: 'recognition', difficulty: 1, prompt: 'available 最接近哪個意思？', answer: '可用的；有空的', choices: ['危險的', '可用的；有空的', '昂貴的', '安靜的'], explanation: 'available 表示某物可取得、可使用，或某人有空。' },
  { id: 'q2', type: 'typing', skill: 'spelling', difficulty: 1.5, prompt: '請輸入「環境」的英文。', answer: 'environment', explanation: 'environment 中間是 environ + ment，注意不要漏掉 n。' },
  { id: 'q3', type: 'listening', skill: 'listening', difficulty: 2, prompt: '播放後，輸入你聽到的單字。', answer: 'responsible', audioText: 'responsible', explanation: 'responsible 表示負責任的，常用 be responsible for。' },
  { id: 'q4', type: 'cloze', skill: 'grammar', difficulty: 2, prompt: 'The service is _____ twenty-four hours a day.', answer: 'available', context: '請輸入最自然的單字。', explanation: 'be available 表示可以使用或可以聯絡。' },
  { id: 'q5', type: 'correction', skill: 'grammar', difficulty: 2.5, prompt: '請改正句子：She go to work every day.', answer: 'she goes to work every day', explanation: '第三人稱單數 she 的一般現在式動詞需加 -s：goes。' },
  { id: 'q6', type: 'choice', skill: 'reading', difficulty: 2.5, prompt: '“The update made the process faster and reduced wasted steps.” 最接近哪個形容詞？', answer: 'efficient', choices: ['efficient', 'ancient', 'nervous', 'temporary'], explanation: '減少浪費並提升速度，表示流程更 efficient。' },
  { id: 'q7', type: 'typing', skill: 'spelling', difficulty: 3, prompt: '請輸入「維持；保養」的英文動詞。', answer: 'maintain', explanation: 'maintain 可表示維持狀態或保養設備。' },
  { id: 'q8', type: 'listening', skill: 'listening', difficulty: 3, prompt: '播放後，輸入你聽到的單字。', answer: 'significant', audioText: 'significant', explanation: 'significant 表示重要的或顯著的。' },
  { id: 'q9', type: 'cloze', skill: 'grammar', difficulty: 3.5, prompt: 'The team will _____ the new feature next week.', answer: 'implement', context: '意思是「實施新功能」。', explanation: 'implement a feature 表示把功能真正實作並投入使用。' },
  { id: 'q10', type: 'choice', skill: 'recognition', difficulty: 4, prompt: 'comprehensive 最接近哪個意思？', answer: '全面而完整的', choices: ['短暫的', '全面而完整的', '難以理解的', '不相關的'], explanation: 'comprehensive 表示涵蓋大部分細節的、全面的。' },
  { id: 'q11', type: 'typing', skill: 'spelling', difficulty: 4, prompt: '請輸入「不可避免的」英文。', answer: 'inevitable', explanation: 'in-（不）＋ evit（避免）＋ -able（能夠……的）。' },
  { id: 'q12', type: 'correction', skill: 'grammar', difficulty: 4.5, prompt: '請改正句子：The information are not complete.', answer: 'the information is not complete', explanation: 'information 是不可數名詞，在此搭配單數動詞 is。' },
  { id: 'q13', type: 'listening', skill: 'listening', difficulty: 5, prompt: '播放後，輸入你聽到的單字。', answer: 'meticulous', audioText: 'meticulous', explanation: 'meticulous 表示非常仔細、重視每個細節。' },
  { id: 'q14', type: 'choice', skill: 'reading', difficulty: 5, prompt: '“Her report checked every tiny detail and contained no careless errors.” 最符合哪個字？', answer: 'meticulous', choices: ['inevitable', 'meticulous', 'available', 'casual'], explanation: '仔細檢查每個細節可用 meticulous 描述。' },
  { id: 'q15', type: 'typing', skill: 'spelling', difficulty: 5.5, prompt: '請輸入「全面的；綜合的」英文。', answer: 'comprehensive', explanation: 'comprehensive 常搭配 report、review、solution。' },
]
