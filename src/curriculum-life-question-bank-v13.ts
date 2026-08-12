import type { FoundationUnitContent } from './curriculum-foundation-content'
import type { CurriculumQuestionEnhancement } from './curriculum-foundation-question-bank-v12'
import type { ReviewedChoiceQuestion, ReviewedQuestion, ReviewedResponseQuestion } from './curriculum-reviewed-social10'

type EnhancedQuestion = ReviewedQuestion & CurriculumQuestionEnhancement

function choice(
  id: string,
  level: ReviewedChoiceQuestion['level'],
  prompt: string,
  options: string[],
  correctIndex: number,
  explanation: string,
  context?: string,
  optionFeedback?: string[],
): EnhancedQuestion {
  return { id, kind: 'choice', level, prompt, options, correctIndex, explanation, context, optionFeedback }
}

function response(
  id: string,
  level: ReviewedResponseQuestion['level'],
  prompt: string,
  sampleAnswer: string,
  explanation: string,
  context?: string,
  rubric?: string[],
): EnhancedQuestion {
  return { id, kind: 'response', level, prompt, sampleAnswer, explanation, context, rubric }
}

function textOf(unit: FoundationUnitContent) {
  return `${unit.overview} ${unit.concepts.map((item) => `${item.title} ${item.explanation} ${item.example ?? ''}`).join(' ')}`
}

function ids(unit: FoundationUnitContent) {
  return Array.from({ length: 8 }, (_, index) => `${unit.unitId}-life-v13-q${index + 1}`)
}

function targetedQuestion(unit: FoundationUnitContent, id: string): EnhancedQuestion {
  const text = textOf(unit)
  if (/校園|安全|求助|路線/.test(text)) {
    return choice(id, '應用', '在校園走廊看到地上有一大片水，最合適的做法是？', ['先繞開並告訴老師或大人處理', '故意跑過去試試會不會滑', '假裝沒看到', '把其他同學叫來比賽滑行'], 0, '生活課程的安全探究不只要「知道危險」，也要能採取保護自己與他人的行動。', undefined, ['正確：先避免危險，再找能處理的大人。', '這會增加跌倒風險。', '忽略可能讓更多人受傷。', '把危險當遊戲會讓風險更高。'])
  }
  if (/家庭|社區|工作|服務|互助/.test(text)) {
    return choice(id, '應用', '想知道社區圖書館員平常做哪些工作，哪個方法最可靠？', ['先想好問題，再禮貌訪問並記下回答', '只看制服顏色猜工作', '問一位同學後就當成全部答案', '自己編一個故事當資料'], 0, '認識社區可以透過訪問、觀察與記錄取得第一手線索，再和其他資料比較。')
  }
  if (/動物|植物|季節|天氣|光影|聲音/.test(text)) {
    return choice(id, '應用', '要比較一週中每天中午影子的長短，哪個做法比較公平？', ['每天盡量在相近時間、同一位置量影子', '每天換不同時間和不同地方', '只量一天就下結論', '只用記憶猜哪天比較長'], 0, '比較觀察時，盡量讓時間、位置與量法一致，才能比較出真正的差異。')
  }
  if (/材料|工具|力|推拉|磁鐵|創作/.test(text)) {
    return choice(id, '應用', '做紙橋測試時，想知道「折法」會不會影響承重，哪個做法比較好？', ['只改折法，其他紙張大小和測試方式盡量相同', '每次紙張、折法、重物都一起換', '只挑最成功的一次看', '先決定答案再做'], 0, '一次主要改一個條件，才比較能看出折法和結果的關係。')
  }
  return choice(id, '應用', `學「${unit.concepts[0]?.title ?? unit.overview}」時，哪個做法最像真正的生活探究？`, ['先提出問題，實際觀察或操作，記下發現再分享', '只背老師說的最後一句', '沒有觀察就先決定答案', '只看別人的答案，不自己試'], 0, '生活課程重視從生活問題出發，透過觀察、實作、合作與表達形成自己的發現。')
}

export function buildLifeCurriculumQuestionsV13(unit: FoundationUnitContent): EnhancedQuestion[] {
  const questionIds = ids(unit)
  const core = unit.concepts[0]?.title ?? unit.overview
  const second = unit.concepts[1]?.title ?? '生活中的線索'

  return [
    choice(questionIds[0], '理解', '想知道一盆植物這幾天有沒有變化，哪一種紀錄最有幫助？', ['每天在差不多時間觀察並畫下或量下變化', '看一次後全部靠記憶', '只寫「很好看」', '先猜答案，不再觀察'], 0, '連續、可比較的生活觀察比單次印象更能看出變化。', undefined, ['正確：有固定觀察和可比較紀錄。', '只靠記憶容易漏掉變化。', '「很好看」是感受，不是可比較的變化紀錄。', '猜測不能取代觀察。']),
    choice(questionIds[1], '理解', '和同學一起做生活探索時，哪個做法最有助合作？', ['先分工，也聽別人的發現，再一起整理結果', '只讓一個人做完全部', '不同意就不讓對方說話', '每個人都做不同題目而且完全不分享'], 0, '合作包含分工、傾聽、比較與共同整理，不只是很多人待在一起。'),
    choice(questionIds[2], '理解', '要把「早上起床、刷牙、吃早餐、出門上學」排成生活順序，最重要的是看什麼？', ['事情實際發生的先後', '每個詞有幾個字', '自己最喜歡哪件事', '哪個詞寫得最大'], 0, '生活中的時間概念先從事件先後建立。'),
    targetedQuestion(unit, questionIds[3]),
    choice(questionIds[4], '應用', `學到「${core}」後，想把發現說給家人聽，哪種方式最好？`, ['說明自己觀察了什麼、怎麼知道，必要時配圖或紀錄', '只說「答案就是這樣」', '把不確定的地方說成一定正確', '只念課程標題'], 0, '表達生活發現要把觀察、方法和結果連起來，也可以保留還不確定的地方。'),
    response(questionIds[5], '應用', `請從「${core}」找一個你在家裡、校園或社區真的看得到的例子，寫下你會觀察什麼。`, `例如選一個生活中的實際場景，說明要看哪個變化、人物行動、位置或物件特徵，並寫下至少一項可以記錄的線索。`, '這題不是要背定義，而是把課程帶回自己的生活。', `本單元：${unit.overview}`, ['例子真的可能出現在生活中', '說得出要觀察的對象', '至少有一項可記錄的線索']),
    response(questionIds[6], '應用', `如果你和同學對「${second}」看到的結果不一樣，你會怎麼一起確認？`, '可以先比較兩人觀察的時間、位置和方法，再回到現場重看或重新操作；若仍不同，就把兩種結果都記下來並說明可能原因。', '生活探究允許不同觀察，重點是用可再檢查的方法處理差異。', undefined, ['願意比較彼此的觀察條件', '提出可以重新確認的方法', '不因意見不同就直接判定對方錯']),
    response(questionIds[7], '檢核', '請完成一個「我發現了……，因為我觀察到……，所以下次我會……」的生活課程小結。', '例如：「我發現雨後走廊容易滑，因為我看到地面有水、有人走路會放慢，所以下次我會繞開積水並告訴老師。」', '完整小結要把發現、觀察證據和可以採取的生活行動連起來。', undefined, ['有清楚的發現', '有支持發現的觀察', '有合理的下一步行動']),
  ]
}
