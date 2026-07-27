import { EXPANDED_ENGLISH_WORDS, wordsAtSimilarLevel } from './english-expanded-data'
import type { SmartEnglishQuestion } from './english-expanded-data'

function shuffleArray<T>(items: T[]) {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }
  return result
}

function uniqueChoices(answer: string, candidates: string[]) {
  const distinct = Array.from(new Set(candidates.filter((item) => item && item !== answer)))
  return shuffleArray([answer, ...shuffleArray(distinct).slice(0, 3)])
}

const generatedVocabularyQuestions: SmartEnglishQuestion[] = EXPANDED_ENGLISH_WORDS.flatMap((word) => {
  const distractors = wordsAtSimilarLevel(word.level, word.id)

  return [
    {
      id: `recognition-${word.id}`,
      type: 'choice',
      skill: 'recognition',
      difficulty: Math.max(1, word.level - 0.15),
      prompt: `${word.word} 最接近哪個意思？`,
      answer: word.meaning,
      choices: uniqueChoices(word.meaning, distractors.map((item) => item.meaning)),
      context: `${word.partOfSpeech} · CEFR ${word.level}`,
      explanation: `${word.word}：${word.meaning}。${word.definition}`,
      answerPolicy: 'exact',
    },
    {
      id: `spelling-${word.id}`,
      type: 'typing',
      skill: 'spelling',
      difficulty: word.level,
      prompt: `請輸入本課目標字：${word.example.replace(new RegExp(word.word, 'i'), '________')}`,
      answer: word.word,
      acceptedAnswers: word.acceptedTranslations,
      hint: `${word.meaning} · ${word.targetHint} · ${word.partOfSpeech}`,
      context: `中文：${word.exampleZh}`,
      explanation: `${word.word}：${word.meaning}。${word.memory}`,
      answerPolicy: 'semantic',
    },
    {
      id: `listening-${word.id}`,
      type: 'listening',
      skill: 'listening',
      difficulty: Math.min(6, word.level + 0.1),
      prompt: '播放發音後，輸入你聽到的單字。',
      answer: word.word,
      audioText: word.word,
      hint: `${word.targetHint} · ${word.partOfSpeech}`,
      explanation: `${word.word}：${word.meaning}。${word.memory}`,
      answerPolicy: 'exact',
    },
    {
      id: `cloze-${word.id}`,
      type: 'cloze',
      skill: 'grammar',
      difficulty: Math.min(6, word.level + 0.2),
      prompt: word.example.replace(new RegExp(word.word, 'i'), '________'),
      answer: word.word,
      hint: `${word.targetHint} · ${word.partOfSpeech}`,
      context: `中文：${word.exampleZh}`,
      explanation: `完整句子：${word.example}`,
      answerPolicy: 'exact',
    },
  ]
})

const grammarQuestions: SmartEnglishQuestion[] = [
  { id: 'g-a1-1', type: 'cloze', skill: 'grammar', difficulty: 1, prompt: 'I _____ a student.', answer: 'am', context: '請填入正確的 be 動詞。', acceptedAnswers: ["'m"], explanation: '主詞 I 搭配 am。', answerPolicy: 'semantic' },
  { id: 'g-a1-2', type: 'correction', skill: 'grammar', difficulty: 1.2, prompt: '請改正句子：He have a car.', answer: 'he has a car', acceptedAnswers: ["he's got a car"], explanation: '第三人稱單數 he 搭配 has。', answerPolicy: 'semantic' },
  { id: 'g-a1-3', type: 'cloze', skill: 'grammar', difficulty: 1.4, prompt: 'There _____ two books on the desk.', answer: 'are', context: '請填入正確的 be 動詞。', explanation: 'two books 是複數，所以使用 are。', answerPolicy: 'semantic' },
  { id: 'g-a1-4', type: 'correction', skill: 'grammar', difficulty: 1.6, prompt: '請改正句子：She go to school every day.', answer: 'she goes to school every day', explanation: '第三人稱單數的一般現在式動詞加 -s。', answerPolicy: 'semantic' },
  { id: 'g-a2-1', type: 'cloze', skill: 'grammar', difficulty: 2, prompt: 'I have lived here _____ 2024.', answer: 'since', context: 'since 後面接明確起始時間。', explanation: 'since 接起始點；for 接一段時間。', answerPolicy: 'semantic' },
  { id: 'g-a2-2', type: 'cloze', skill: 'grammar', difficulty: 2.2, prompt: 'We _____ dinner when the phone rang.', answer: 'were having', context: '請使用過去進行式。', acceptedAnswers: ['were eating'], explanation: '過去某動作進行中，被另一個短動作打斷。', answerPolicy: 'semantic' },
  { id: 'g-a2-3', type: 'correction', skill: 'grammar', difficulty: 2.4, prompt: "請改正句子：I didn't went yesterday.", answer: "i didn't go yesterday", explanation: "didn't 後面的動詞使用原形 go。", answerPolicy: 'semantic' },
  { id: 'g-a2-4', type: 'cloze', skill: 'grammar', difficulty: 2.6, prompt: 'This bag is _____ than that one.', answer: 'heavier', context: '請使用 heavy 的比較級。', explanation: 'heavy 變比較級時 y 改 i 再加 -er。', answerPolicy: 'semantic' },
  { id: 'g-b1-1', type: 'correction', skill: 'grammar', difficulty: 3, prompt: '請改正句子：I have finished the task yesterday.', answer: 'i finished the task yesterday', explanation: 'yesterday 是明確過去時間，使用過去式。', answerPolicy: 'semantic' },
  { id: 'g-b1-2', type: 'cloze', skill: 'grammar', difficulty: 3.2, prompt: 'If it rains tomorrow, we _____ at home.', answer: 'will stay', context: '第一類條件句。', explanation: 'if 子句用現在式，主要子句用 will。', answerPolicy: 'semantic' },
  { id: 'g-b1-3', type: 'cloze', skill: 'grammar', difficulty: 3.4, prompt: 'The report _____ by the manager yesterday.', answer: 'was reviewed', context: '請使用被動語態。', explanation: '過去式被動語態為 was/were + 過去分詞。', answerPolicy: 'semantic' },
  { id: 'g-b1-4', type: 'correction', skill: 'grammar', difficulty: 3.6, prompt: '請改正句子：She suggested to take a break.', answer: 'she suggested taking a break', acceptedAnswers: ['she suggested that we take a break'], explanation: 'suggest 後常接動名詞。', answerPolicy: 'semantic' },
  { id: 'g-b2-1', type: 'correction', skill: 'grammar', difficulty: 4, prompt: '請改正句子：The information are not complete.', answer: 'the information is not complete', explanation: 'information 是不可數名詞，搭配單數動詞。', answerPolicy: 'semantic' },
  { id: 'g-b2-2', type: 'cloze', skill: 'grammar', difficulty: 4.2, prompt: 'By next Friday, we _____ the migration.', answer: 'will have completed', context: '請使用未來完成式。', explanation: 'by + 未來時間常搭配 will have + 過去分詞。', answerPolicy: 'semantic' },
  { id: 'g-b2-3', type: 'cloze', skill: 'grammar', difficulty: 4.4, prompt: 'The feature, _____ was released yesterday, has a bug.', answer: 'which', context: '非限定關係子句。', explanation: '非限定關係子句描述事物時使用 which。', answerPolicy: 'semantic' },
  { id: 'g-b2-4', type: 'correction', skill: 'grammar', difficulty: 4.6, prompt: '請改正句子：Despite of the delay, we finished on time.', answer: 'despite the delay, we finished on time', acceptedAnswers: ['in spite of the delay, we finished on time'], explanation: 'despite 後直接接名詞，不加 of。', answerPolicy: 'semantic' },
  { id: 'g-c1-1', type: 'cloze', skill: 'grammar', difficulty: 5, prompt: 'Had I known about the delay, I _____ earlier.', answer: 'would have left', context: '與過去事實相反的條件句。', explanation: '倒裝省略 if；主要子句用 would have + 過去分詞。', answerPolicy: 'semantic' },
  { id: 'g-c1-2', type: 'correction', skill: 'grammar', difficulty: 5.1, prompt: '請改正句子：Neither of the answers are correct.', answer: 'neither of the answers is correct', explanation: '正式用法中 neither 通常視為單數。', answerPolicy: 'semantic' },
  { id: 'g-c1-3', type: 'cloze', skill: 'grammar', difficulty: 5.2, prompt: 'It is essential that every request _____ logged.', answer: 'be', context: '正式虛擬語氣。', explanation: 'essential that 後可使用原形動詞 be。', answerPolicy: 'semantic' },
  { id: 'g-c1-4', type: 'correction', skill: 'grammar', difficulty: 5.3, prompt: '請改正句子：No sooner we arrived than it started raining.', answer: 'no sooner had we arrived than it started raining', explanation: 'No sooner 置首時使用倒裝，搭配 than。', answerPolicy: 'semantic' },
  { id: 'g-c2-1', type: 'cloze', skill: 'grammar', difficulty: 5.5, prompt: 'Rarely _____ such a comprehensive analysis.', answer: 'have we seen', context: '否定副詞置首倒裝。', explanation: 'Rarely 置首時助動詞要放在主詞前。', answerPolicy: 'semantic' },
  { id: 'g-c2-2', type: 'correction', skill: 'grammar', difficulty: 5.6, prompt: '請改正句子：Were the policy to fail, the consequences will be severe.', answer: 'were the policy to fail, the consequences would be severe', explanation: '假設語氣需搭配 would。', answerPolicy: 'semantic' },
  { id: 'g-c2-3', type: 'cloze', skill: 'grammar', difficulty: 5.7, prompt: 'So compelling _____ the evidence that the board changed its decision.', answer: 'was', context: 'So + 形容詞置首造成倒裝。', explanation: '結構為 So compelling was the evidence that...。', answerPolicy: 'semantic' },
  { id: 'g-c2-4', type: 'correction', skill: 'grammar', difficulty: 5.8, prompt: '請改正句子：The proposal is not only costly but also it is impractical.', answer: 'the proposal is not only costly but also impractical', explanation: 'not only...but also... 的平行結構需一致。', answerPolicy: 'semantic' },
]

const readingQuestions: SmartEnglishQuestion[] = [
  { id: 'r-a1-1', type: 'choice', skill: 'reading', difficulty: 1, prompt: '“Tom is tired, so he goes to bed early.” Tom 為什麼早睡？', answer: '因為他累了', choices: ['因為他累了', '因為他餓了', '因為他遲到了', '因為他生病了'], explanation: 'so 表示前面的 tired 是原因。', answerPolicy: 'exact' },
  { id: 'r-a1-2', type: 'choice', skill: 'reading', difficulty: 1.2, prompt: '“The shop closes at six.” 商店何時關門？', answer: '六點', choices: ['五點', '六點', '七點', '八點'], explanation: '句子直接說 closes at six。', answerPolicy: 'exact' },
  { id: 'r-a1-3', type: 'choice', skill: 'reading', difficulty: 1.4, prompt: '“Mia has a red bag and a blue coat.” 哪個敘述正確？', answer: '她有紅色包包', choices: ['她有紅色包包', '她有藍色包包', '她沒有外套', '她的包包是綠色'], explanation: '句子說 a red bag。', answerPolicy: 'exact' },
  { id: 'r-a1-4', type: 'choice', skill: 'reading', difficulty: 1.6, prompt: '“Please wait here until I return.” 說話者希望對方做什麼？', answer: '留在這裡等待', choices: ['立刻離開', '留在這裡等待', '打電話', '關門'], explanation: 'wait here 表示留在原地等。', answerPolicy: 'exact' },
  { id: 'r-a2-1', type: 'choice', skill: 'reading', difficulty: 2, prompt: '“Mia missed the bus, but she arrived on time by taxi.” 哪個敘述正確？', answer: '她搭計程車準時抵達', choices: ['她沒有出門', '她搭計程車準時抵達', '她搭公車遲到', '她取消行程'], explanation: '錯過公車後改搭計程車，仍準時抵達。', answerPolicy: 'exact' },
  { id: 'r-a2-2', type: 'choice', skill: 'reading', difficulty: 2.2, prompt: '“The library is closed on Mondays.” 星期一可以進圖書館嗎？', answer: '不可以', choices: ['可以', '不可以', '只有下午可以', '句子沒有說'], explanation: 'closed on Mondays 表示星期一不開放。', answerPolicy: 'exact' },
  { id: 'r-a2-3', type: 'choice', skill: 'reading', difficulty: 2.4, prompt: '“Anna chose the cheaper phone because both models had similar features.” 她為何選較便宜的？', answer: '兩款功能相近', choices: ['較便宜的更重', '兩款功能相近', '較貴的沒有螢幕', '她沒有比較'], explanation: 'because 後面說功能相似。', answerPolicy: 'exact' },
  { id: 'r-a2-4', type: 'choice', skill: 'reading', difficulty: 2.6, prompt: '“Please submit the form by Friday.” 最晚何時繳交？', answer: '星期五', choices: ['星期四', '星期五', '星期六', '下週一'], explanation: 'by Friday 表示最晚星期五。', answerPolicy: 'exact' },
  { id: 'r-b1-1', type: 'choice', skill: 'reading', difficulty: 3, prompt: '“The update made the process faster and reduced wasted steps.” 最接近哪個形容詞？', answer: 'efficient', choices: ['efficient', 'ancient', 'nervous', 'temporary'], explanation: '減少浪費並提升速度表示 efficient。', answerPolicy: 'exact' },
  { id: 'r-b1-2', type: 'choice', skill: 'reading', difficulty: 3.2, prompt: '“The server is running, but users still cannot log in.” 可以推論什麼？', answer: '服務啟動不代表登入功能正常', choices: ['伺服器一定關機', '服務啟動不代表登入功能正常', '所有帳號被刪除', '網路一定中斷'], explanation: '服務本身運作不代表每個功能正常。', answerPolicy: 'exact' },
  { id: 'r-b1-3', type: 'choice', skill: 'reading', difficulty: 3.4, prompt: '“Although the task was difficult, the team managed to finish it.” managed to 表示什麼？', answer: '最後成功完成', choices: ['拒絕執行', '最後成功完成', '尚未開始', '交給別人'], explanation: 'manage to 強調設法成功。', answerPolicy: 'exact' },
  { id: 'r-b1-4', type: 'choice', skill: 'reading', difficulty: 3.6, prompt: '“The company reduced prices to attract more customers.” 降價的目的為何？', answer: '吸引更多顧客', choices: ['減少商品', '吸引更多顧客', '關閉商店', '降低品質'], explanation: 'to attract 表示目的。', answerPolicy: 'exact' },
  { id: 'r-b2-1', type: 'choice', skill: 'reading', difficulty: 4, prompt: '“The policy was introduced to reduce unnecessary spending without affecting essential services.” 政策目標是什麼？', answer: '減少非必要支出並保留必要服務', choices: ['停止所有服務', '增加所有支出', '減少非必要支出並保留必要服務', '取消預算管理'], explanation: 'without affecting essential services 是重要限制。', answerPolicy: 'exact' },
  { id: 'r-b2-2', type: 'choice', skill: 'reading', difficulty: 4.2, prompt: '“Although the proposal is comprehensive, its cost may prevent immediate implementation.” 主要顧慮是什麼？', answer: '成本可能阻礙立即實施', choices: ['內容不完整', '成本可能阻礙立即實施', '沒有任何目標', '計畫已完成'], explanation: '轉折後指出 cost 是阻礙。', answerPolicy: 'exact' },
  { id: 'r-b2-3', type: 'choice', skill: 'reading', difficulty: 4.4, prompt: '“The evidence is relevant but not sufficient to support the conclusion.” 這句表示什麼？', answer: '證據有關但仍不夠', choices: ['證據完全無關', '證據有關但仍不夠', '結論已被證明', '沒有任何證據'], explanation: 'relevant 與 sufficient 是不同標準。', answerPolicy: 'exact' },
  { id: 'r-b2-4', type: 'choice', skill: 'reading', difficulty: 4.6, prompt: '“A flexible schedule can improve productivity, provided that deadlines remain clear.” 前提是什麼？', answer: '截止期限仍要明確', choices: ['沒有截止期限', '截止期限仍要明確', '所有人同時工作', '工作量減半'], explanation: 'provided that 表示條件。', answerPolicy: 'exact' },
  { id: 'r-c1-1', type: 'choice', skill: 'reading', difficulty: 5, prompt: '“The instructions were ambiguous, causing different teams to interpret them differently.” 問題根源是什麼？', answer: '指示有歧義', choices: ['團隊人數太少', '指示有歧義', '沒有任何文件', '所有人理解一致'], explanation: 'ambiguous 導致多種解讀。', answerPolicy: 'exact' },
  { id: 'r-c1-2', type: 'choice', skill: 'reading', difficulty: 5.1, prompt: '“The argument is coherent, yet it rests on an implausible assumption.” 評價為何？', answer: '論述連貫但前提不可信', choices: ['論述毫無邏輯', '論述連貫但前提不可信', '前提已證實', '沒有提出論點'], explanation: 'coherent 與 plausible 分別評估結構和可信度。', answerPolicy: 'exact' },
  { id: 'r-c1-3', type: 'choice', skill: 'reading', difficulty: 5.2, prompt: '“The new interface may facilitate adoption, but poor training could undermine its benefits.” 哪個因素可能削弱效益？', answer: '訓練不足', choices: ['介面改善', '訓練不足', '採用增加', '文件變短'], explanation: 'poor training could undermine。', answerPolicy: 'exact' },
  { id: 'r-c1-4', type: 'choice', skill: 'reading', difficulty: 5.3, prompt: '“Resources were allocated according to urgency rather than department size.” 分配依據是什麼？', answer: '緊急程度', choices: ['部門大小', '緊急程度', '員工年資', '隨機抽籤'], explanation: 'according to urgency。', answerPolicy: 'exact' },
  { id: 'r-c2-1', type: 'choice', skill: 'reading', difficulty: 5.5, prompt: '“The policy was ostensibly neutral, yet its effects were markedly uneven.” ostensibly 暗示什麼？', answer: '表面中立但實際效果可能不同', choices: ['政策明確偏袒', '表面中立但實際效果可能不同', '政策完全無效', '效果完全一致'], explanation: 'ostensibly 表示表面看似如此。', answerPolicy: 'exact' },
  { id: 'r-c2-2', type: 'choice', skill: 'reading', difficulty: 5.6, prompt: '“Her response was nuanced rather than unequivocal.” 最合理的解讀是什麼？', answer: '她保留細微差異而非給絕對答案', choices: ['她完全沒有回答', '她保留細微差異而非給絕對答案', '她給出明確無疑答案', '她只重複問題'], explanation: 'nuanced 與 unequivocal 形成對比。', answerPolicy: 'exact' },
  { id: 'r-c2-3', type: 'choice', skill: 'reading', difficulty: 5.7, prompt: '“The juxtaposition of the two cases reveals an otherwise difficult-to-discern pattern.” 並置比較的作用是什麼？', answer: '讓隱晦模式更容易被看見', choices: ['隱藏所有差異', '讓隱晦模式更容易被看見', '證明兩案完全相同', '刪除資料'], explanation: 'juxtaposition helps discern a pattern。', answerPolicy: 'exact' },
  { id: 'r-c2-4', type: 'choice', skill: 'reading', difficulty: 5.8, prompt: '“The proposed remedy may ameliorate symptoms while exacerbating the underlying cause.” 主要警告是什麼？', answer: '表面改善可能使根本原因惡化', choices: ['所有問題都會解決', '表面改善可能使根本原因惡化', '症狀一定不變', '根本原因不存在'], explanation: 'ameliorate 與 exacerbate 形成風險對比。', answerPolicy: 'exact' },
]

export const EXPANDED_ASSESSMENT_QUESTION_BANK: SmartEnglishQuestion[] = [
  ...generatedVocabularyQuestions,
  ...grammarQuestions,
  ...readingQuestions,
]

export const EXPANDED_ASSESSMENT_STATS = {
  words: EXPANDED_ENGLISH_WORDS.length,
  questions: EXPANDED_ASSESSMENT_QUESTION_BANK.length,
}
