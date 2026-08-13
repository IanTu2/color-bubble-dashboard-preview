import type { FoundationUnitContent } from './curriculum-foundation-content'
import type { CurriculumQuestionEnhancement } from './curriculum-foundation-question-bank-v12'
import type {
  ReviewedChoiceQuestion,
  ReviewedQuestion,
  ReviewedResponseQuestion,
  ReviewedWorkedExample,
} from './curriculum-reviewed-social10'

type EnhancedChoice = ReviewedChoiceQuestion & CurriculumQuestionEnhancement
type EnhancedResponse = ReviewedResponseQuestion & CurriculumQuestionEnhancement

function lifeDiagnostic(unit: FoundationUnitContent): EnhancedChoice {
  return {
    id: `${unit.unitId}-v14-diagnostic`,
    kind: 'choice',
    level: '應用',
    prompt: '做生活課程探究時，哪個做法最能避免「只有感覺、沒有觀察」？',
    options: [
      '先提出生活問題，再用觀察、訪問、操作或記錄留下可以比較的線索',
      '想到什麼答案就直接寫，不必再看或問',
      '只要同學同意，就不用留下任何紀錄',
      '只記自己最喜歡的結果，其他發現全部省略',
    ],
    correctIndex: 0,
    explanation: '生活課程不是把生活經驗背成答案，而是從真實生活問題出發，用觀察、實作、合作與表達形成可分享的發現。',
    optionFeedback: [
      '正確：有問題、有方法、有可比較的紀錄，也能回到生活行動。',
      '感覺可以成為問題的起點，但不能取代實際觀察。',
      '合作仍需要說明彼此看到什麼、怎麼知道。',
      '只挑喜歡的結果會漏掉重要線索。',
    ],
  }
}

function lifeTransfer(unit: FoundationUnitContent): EnhancedResponse {
  const anchor = unit.concepts.find((item) => !/常見迷思/.test(item.title))?.title ?? unit.overview
  return {
    id: `${unit.unitId}-v14-transfer`,
    kind: 'response',
    level: '檢核',
    context: `本單元核心：${anchor}`,
    prompt: '把今天學到的方法帶回家裡、校園或社區。請提出一個新的生活問題，寫出你會怎麼觀察或訪問，以及你會怎麼記錄。',
    sampleAnswer: '例如我想知道「放學時校門口哪一區最擁擠」。我會在同一個放學時段站在安全位置觀察三天，畫簡單位置圖並記下每區大約的人數，再和家人或老師討論可能的安全做法。',
    explanation: '生活課程的轉移不是換一組題目數字，而是能把「提問→觀察／訪問／實作→記錄→比較→分享與行動」帶到新的生活情境。',
    rubric: ['問題是真實生活中可以觀察或詢問的', '方法說得出要看／問／做什麼', '有具體記錄方式', '能說明發現可以怎麼分享或形成行動'],
  }
}

const LIFE_MISCONCEPTIONS = [
  {
    title: '常見迷思：我覺得就是我觀察到的事實',
    explanation: '「我喜歡、我覺得、我猜」是感受或推測；觀察則要說出實際看到、聽到、量到、訪問到或操作後發生的事情。兩者都可以說，但要分清楚。',
    example: '「這棵樹很漂亮」是感受；「這棵樹今天有 5 片落葉，昨天記錄到 2 片」才是可以比較的觀察。',
  },
  {
    title: '常見迷思：合作就是大家一起做，不需要分工和比較',
    explanation: '生活課程的合作包含分工、傾聽、交換紀錄、比較不同發現和共同決定下一步。只是在同一組裡各做各的，還不算完成合作探究。',
    example: '一人記錄位置、一人訪問、一人畫圖，最後一起比較三種資料並討論結論，才把分工重新整合成共同發現。',
  },
]

const LIFE_EXAMPLES: ReviewedWorkedExample[] = [
  {
    title: '錯誤診斷：把「我覺得」改成可以比較的觀察',
    context: '學生寫：「我覺得學校中庭下午比較熱，所以一定是因為沒有樹。」',
    prompt: '這句話混在一起的「感受、觀察、原因推測」要怎麼拆開？',
    steps: [
      '先保留感受：「我覺得下午中庭比較熱」。',
      '補可觀察的線索：在固定位置、相近時間記錄溫度、陰影或觸摸地面的感受。',
      '把「沒有樹造成」改成待確認的推測，不當成已證明事實。',
      '比較有樹蔭和沒有樹蔭的位置，再討論是否還有風、建築遮蔽等其他差異。',
    ],
    answer: '把感受、可記錄觀察和原因推測分開後，才知道下一步要觀察什麼，而不是先把猜想當答案。',
    explanation: '生活課程可以從感受出發，但要透過觀察、比較與分享讓想法變得更可檢查。',
  },
  {
    title: '轉移示範：把探究方法帶到新的生活問題',
    context: '原本在課堂觀察植物，現在改成想知道「哪條上學路線比較安全」。',
    prompt: '怎麼把同一套生活探究方法轉過去？',
    steps: [
      '先說清楚「安全」要觀察哪些線索，例如車流、紅綠燈、人行道、轉角視線。',
      '在大人陪同與安全前提下，對兩條路線用同一張簡單紀錄表觀察。',
      '把路線畫成簡圖，標出看到的安全設施和需要注意的位置。',
      '比較資料並和家人討論；若資料不足，就說明還想再觀察什麼。',
    ],
    answer: '可以轉移的是「提問、觀察、記錄、比較、分享」的方法，不是把上一個植物單元的答案搬過來。',
    explanation: '生活課程的核心能力要能回到真實生活中再次使用。',
  },
]

export function specializeLifeDepthV14(unit: FoundationUnitContent): FoundationUnitContent {
  const concepts = unit.concepts
    .filter((item) => !/^常見迷思：觀察到/.test(item.title) && item.title !== '常見迷思：科學模型就是實物本身')
    .concat(LIFE_MISCONCEPTIONS)

  const workedExamples = unit.workedExamples
    .filter((item) => item.title !== '錯誤診斷：把觀察和因果分開' && item.title !== '轉移示範：用同一模型預測新的觀察')
    .concat(LIFE_EXAMPLES)

  const questions: ReviewedQuestion[] = unit.questions.map((question) => {
    if (question.id === `${unit.unitId}-v14-diagnostic`) return lifeDiagnostic(unit)
    if (question.id === `${unit.unitId}-v14-transfer`) return lifeTransfer(unit)
    return question
  })

  return {
    ...unit,
    researchBasis: Array.from(new Set([
      ...unit.researchBasis,
      '國家教育研究院：十二年國民基本教育國民小學生活課程課程綱要',
      'V14 Life Curriculum：以生活探究、自然觀察、社會互動、表達與行動整合，不回退成自然科單科模板',
    ])),
    concepts,
    workedExamples,
    questions,
    takeaway: Array.from(new Set([...unit.takeaway, ...LIFE_MISCONCEPTIONS.map((item) => item.title)])).slice(0, 8),
  }
}
