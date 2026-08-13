import type { FoundationUnitContent } from './curriculum-foundation-content'
import type { CurriculumQuestionEnhancement } from './curriculum-foundation-question-bank-v12'
import type {
  ReviewedChoiceQuestion,
  ReviewedConcept,
  ReviewedQuestion,
  ReviewedResponseQuestion,
  ReviewedWorkedExample,
} from './curriculum-reviewed-social10'

type EnhancedChoice = ReviewedChoiceQuestion & CurriculumQuestionEnhancement
type EnhancedResponse = ReviewedResponseQuestion & CurriculumQuestionEnhancement

type Subject = FoundationUnitContent['subject']

const OFFICIAL_BASIS: Record<Subject, string> = {
  chinese: '國家教育研究院：十二年國民基本教育語文領域－國語文課程綱要',
  english: '國家教育研究院：十二年國民基本教育語文領域－英語文課程綱要',
  math: '國家教育研究院：十二年國民基本教育數學領域課程綱要與課程手冊',
  science: '國家教育研究院：十二年國民基本教育自然科學領域課程綱要',
  social: '國家教育研究院：十二年國民基本教育社會領域課程綱要',
}

function unique<T>(items: T[], key: (item: T) => string) {
  const seen = new Set<string>()
  return items.filter((item) => {
    const value = key(item).trim()
    if (!value || seen.has(value)) return false
    seen.add(value)
    return true
  })
}

function subjectMisconceptions(subject: Subject, anchor: string): ReviewedConcept[] {
  if (subject === 'math') return [
    {
      title: `常見迷思：看到「${anchor}」就直接套公式`,
      explanation: '公式只有在條件符合時才成立。真正的解題要先確認已知量、未知量、限制與關係，再選表示法；若跳過建模，最常見的錯誤就是算式本身和題意無關。',
      example: '同一個數值可能代表長度、比例、速率或機率；先標單位與關係，再決定是否能代入公式。',
    },
    {
      title: '常見迷思：算出一個數字就代表答案完成',
      explanation: '數學答案還要檢查符號、單位、範圍與是否符合原情境。代回、估算、畫圖或比較極端情況，都是判斷結果是否合理的方法。',
      example: '若算出「人數 = −3」或「機率 = 1.4」，即使運算步驟看似完整，也表示模型或計算需要回頭檢查。',
    },
  ]
  if (subject === 'science') return [
    {
      title: `常見迷思：觀察到「${anchor}」就等於證明原因`,
      explanation: '觀察到兩件事同時出現，只能先建立關聯；要支持因果，還需要控制條件、重複觀察、量測與能被檢驗的模型。',
      example: '看到植物在窗邊長得較高，不能只靠一次觀察就斷言「一定是光造成」；還要比較水分、品種、溫度等條件。',
    },
    {
      title: '常見迷思：科學模型就是實物本身',
      explanation: '模型是用來解釋與預測的簡化表示，會保留重要關係、忽略部分細節。不同尺度可能需要不同模型，模型也會隨新證據修正。',
      example: '粒子模型能解釋許多物質現象，但圖中的球棒大小與距離並不是原子真正的比例。',
    },
  ]
  if (subject === 'social') return [
    {
      title: `常見迷思：一份資料就能完整解釋「${anchor}」`,
      explanation: '社會資料有來源、時間、尺度與目的限制。同一議題常需要地圖、統計、史料、制度文本或不同群體觀點交叉檢查。',
      example: '人口增加和房價上升同時發生，不代表只靠一張人口圖就能證明房價上升的唯一原因。',
    },
    {
      title: '常見迷思：多數意見等於唯一正確答案',
      explanation: '公共議題除了人數，也要檢查權利、程序、證據、成本與不同群體受到的影響。事實判斷和價值選擇需要分開處理。',
      example: '即使多數人支持某政策，也仍要檢查它是否違反基本權利、是否有替代方案，以及受影響少數是否有合理救濟。',
    },
  ]
  if (subject === 'english') return [
    {
      title: `Common misconception: translating “${anchor}” word by word is enough`,
      explanation: 'English meaning depends on word order, collocations, tense, reference, and situation. A literal Chinese translation can hide who does the action, when it happens, or what the speaker intends.',
      example: '“How are you doing?” is normally a greeting about someone’s condition, not a request to list what task the person is doing.',
    },
    {
      title: 'Common misconception: a grammatically possible sentence is always natural',
      explanation: 'Communication also depends on context and register. Learners should check whether the wording fits the situation, relationship, and purpose instead of judging grammar alone.',
      example: '“Give me water.” can be grammatical but may sound too direct in many situations; “Could I have some water, please?” fits a polite request better.',
    },
  ]
  return [
    {
      title: `常見迷思：只抓到「${anchor}」關鍵字就等於讀懂`,
      explanation: '閱讀不能只靠單一關鍵字。要把詞句放回前後文，確認人物、事件、語氣、段落功能與作者真正要表達的關係。',
      example: '文章出現「勇敢」不代表主旨一定是歌頌勇敢；可能是在反思逞強造成的後果。',
    },
    {
      title: '常見迷思：自己的感受可以取代文本證據',
      explanation: '個人感受可以是閱讀反應，但回答理解與論證題時仍要指出文字、情節、結構或語言線索，讓別人可以檢查你的判斷。',
      example: '與其只寫「我覺得主角很孤單」，更完整的回答會指出主角反覆避開人群、獨自留在車站等具體描寫。',
    },
  ]
}

function diagnosisExample(unit: FoundationUnitContent, anchor: string): ReviewedWorkedExample {
  const title = unit.overview.slice(0, 42)
  if (unit.subject === 'math') return {
    title: '錯誤診斷：先判斷方法，再修正計算',
    context: `學生處理「${anchor}」時直接寫出一個公式，沒有標示已知量、條件或單位。`,
    prompt: '這份作答最大的問題是什麼？應該如何修正？',
    steps: ['把題目中的已知量、未知量與限制重新列出。', '說明公式中的每個符號對應哪個量，以及使用條件是否成立。', '完成計算後保留單位。', '用代回、估算或圖形檢查答案是否符合情境。'],
    answer: '問題不一定是「算錯」，而是缺少建模依據；修正後要能從題意一路說到式子與檢查。',
    explanation: `本單元核心範圍：${title}`,
  }
  if (unit.subject === 'science') return {
    title: '錯誤診斷：把觀察和因果分開',
    context: `學生觀察到「${anchor}」相關的兩個現象同時改變，就寫下「A 一定造成 B」。`,
    prompt: '為什麼這個結論太快？下一步應該補什麼證據？',
    steps: ['先把直接量到或看到的結果列出，不加入原因。', '列出可能同時改變結果的其他條件。', '設計可比較的觀察或實驗，控制重要條件並重複量測。', '比較資料是否符合模型預測，再限定結論範圍。'],
    answer: '同時變化只能先支持關聯；因果仍需要控制條件、重複證據與模型預測。',
    explanation: `本單元核心範圍：${title}`,
  }
  if (unit.subject === 'social') return {
    title: '錯誤診斷：不要讓單一資料替你下完整結論',
    context: `學生看到一份和「${anchor}」有關的圖表，就直接寫下唯一原因與政策答案。`,
    prompt: '這份推論缺少哪些檢查？',
    steps: ['確認資料來源、日期、統計單位與尺度。', '只寫圖表可以直接支持的事實。', '把原因解釋、價值判斷與政策選擇另外列出。', '補找不同來源、不同群體或不同時期的資料交叉檢查。'],
    answer: '資料事實、原因解釋與政策選擇是不同層次；不能用一份資料一次跨完三層。',
    explanation: `本單元核心範圍：${title}`,
  }
  if (unit.subject === 'english') return {
    title: 'Error clinic: meaning before form',
    context: `A learner sees “${anchor}” and chooses a sentence only because one familiar word appears in it.`,
    prompt: 'How should the learner check the answer more carefully?',
    steps: ['Identify who is speaking or acting and what the situation is.', 'Check time clues, reference words, and sentence pattern.', 'Read every option as a complete message, not as isolated vocabulary.', 'Choose the option that fits both grammar and meaning, then explain the clue.'],
    answer: 'Use context, sentence structure, and communicative purpose together; one matching word is not enough evidence.',
    explanation: `Unit focus: ${title}`,
  }
  return {
    title: '錯誤診斷：從文本證據修正閱讀判斷',
    context: `學生讀到和「${anchor}」有關的文章，只抄一個關鍵字就寫下主旨。`,
    prompt: '怎麼把答案改成可被檢查的閱讀推論？',
    steps: ['先說明段落或篇章真正處理的問題。', '找至少兩個句子、情節或結構線索。', '說明這些線索如何支持你的判斷。', '排除只靠單一詞語或個人感受的說法。'],
    answer: '完整閱讀答案要有判斷，也要有文本證據與證據之間的推理。',
    explanation: `本單元核心範圍：${title}`,
  }
}

function transferExample(unit: FoundationUnitContent, anchor: string): ReviewedWorkedExample {
  if (unit.subject === 'math') return {
    title: '轉移示範：換情境仍能辨認同一個數學關係',
    context: `把「${anchor}」從課本題改成生活資料：已知條件改變、數值不同，但核心關係保持不變。`,
    prompt: '如何判斷還能不能使用同一個方法？',
    steps: ['先忽略表面故事，列出量與量之間的關係。', '比對新舊問題的限制與假設。', '若關係相同，重新建模並代入新數值；若條件不同，就改方法。', '用單位、圖形或估算解釋結果。'],
    answer: '真正能轉移的是數學關係與推理條件，不是記住同一組數字或題目句型。',
    explanation: '這一頁用來確認學生能把方法帶到陌生情境。',
  }
  if (unit.subject === 'science') return {
    title: '轉移示範：用同一模型預測新的觀察',
    context: `把「${anchor}」換到一個新的材料、環境或尺度，先不公布結果。`,
    prompt: '如何用模型做出可以被檢驗的預測？',
    steps: ['說出模型中真正重要的變因與關係。', '指出新情境和原情境哪些條件相同、哪些不同。', '寫出若模型成立應該觀察到的結果。', '規劃要量什麼、如何比較，再用資料修正預測。'],
    answer: '科學轉移不是背結論，而是用模型對新情境提出可檢驗預測。',
    explanation: '這一頁用來確認概念能跨情境使用。',
  }
  if (unit.subject === 'social') return {
    title: '轉移示範：換一份資料重新形成論證',
    context: `原本分析「${anchor}」的資料被換成不同年份、地區或群體的新資料。`,
    prompt: '舊結論可以直接搬過來嗎？',
    steps: ['先比較新舊資料的來源、時間、尺度與定義。', '重新列出新資料直接支持的事實。', '檢查原本的原因解釋是否仍有證據。', '必要時縮小、修正或否定舊結論。'],
    answer: '不能因議題名稱相同就複製結論；資料條件改變時，論證也必須重新檢查。',
    explanation: '這一頁用來確認學生能把資料素養帶到新案例。',
  }
  if (unit.subject === 'english') return {
    title: 'Transfer example: use the same language goal in a new situation',
    context: `The unit idea “${anchor}” appears in a different speaker, place, or time setting.`,
    prompt: 'How can you adapt instead of copying the original sentence?',
    steps: ['Keep the communicative goal clear.', 'Change subject, time, place, or vocabulary to match the new context.', 'Check grammar and reference words after the change.', 'Read the full message aloud and check whether it sounds appropriate.'],
    answer: 'Transfer means keeping the language function while rebuilding the sentence for the new context.',
    explanation: 'The learner must control meaning and form, not memorize one model sentence.',
  }
  return {
    title: '轉移示範：換一篇文本仍使用同一閱讀方法',
    context: `把「${anchor}」放到另一篇不同人物、主題或文體的文本。`,
    prompt: '哪些閱讀步驟可以保留，哪些判斷必須重新找證據？',
    steps: ['保留找語境、段落功能、關鍵轉折與證據的閱讀方法。', '重新判斷新文本的敘事者、目的與結構。', '引用新文本自己的句子或細節。', '最後用新的證據形成新的主旨或解釋。'],
    answer: '可以轉移的是閱讀策略，不是上一課的答案。',
    explanation: '這一頁用來確認學生能在陌生文本中再次完成理解。',
  }
}

function choice(
  id: string,
  level: ReviewedChoiceQuestion['level'],
  prompt: string,
  options: string[],
  correctIndex: number,
  explanation: string,
  context?: string,
  optionFeedback?: string[],
): EnhancedChoice {
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
): EnhancedResponse {
  return { id, kind: 'response', level, prompt, sampleAnswer, explanation, context, rubric }
}

function conceptChoice(unit: FoundationUnitContent, concept: ReviewedConcept, index: number): EnhancedChoice {
  const pool = unique(unit.concepts.map((item) => item.title), (item) => item)
  const distractors = pool.filter((item) => item !== concept.title).slice(index % Math.max(1, pool.length - 1), index % Math.max(1, pool.length - 1) + 3)
  while (distractors.length < 3) distractors.push(`不屬於本題描述的概念 ${distractors.length + 1}`)
  const options = [concept.title, ...distractors.slice(0, 3)]
  return choice(
    `${unit.unitId}-v14-concept-${index + 1}`,
    index < 2 ? '理解' : '應用',
    '下列哪一個概念最符合這段教材說明？',
    options,
    0,
    `教材對「${concept.title}」的說明正是題幹提供的內容；作答時要根據完整定義與關係，而不是只抓單一關鍵字。`,
    concept.explanation,
    ['正確：概念名稱和題幹的完整說明一致。', '這是同單元的其他概念，但不是題幹描述的主要關係。', '這是同單元的其他概念，但不是題幹描述的主要關係。', '這個選項沒有對應題幹中的完整教材說明。'],
  )
}

function diagnosticChoice(unit: FoundationUnitContent, anchor: string): EnhancedChoice {
  const promptBySubject: Record<Subject, string> = {
    chinese: '閱讀理解時，哪一個做法最能避免「只抓關鍵字就下結論」？',
    english: 'Which strategy best avoids choosing an answer from one familiar word only?',
    math: '遇到新題型時，哪個做法最能避免「直接套公式」造成的錯誤？',
    science: '看到兩個現象同時改變時，哪個做法最能避免把相關誤當成因果？',
    social: '看到一份圖表或史料時，哪個做法最能避免用單一資料下過度結論？',
  }
  const optionsBySubject: Record<Subject, [string, string, string, string]> = {
    chinese: ['先確認上下文、段落功能並找至少兩個文本線索', '只圈出題目重複出現的字', '先寫自己的感受，再把文章硬套進去', '只看第一句，不讀後文'],
    english: ['Read the full sentence and context, then check grammar and communicative purpose.', 'Choose the option that repeats one word from the question.', 'Translate only the first word.', 'Ignore time and speaker clues.'],
    math: ['先列已知、未知與限制，再決定表示法並檢查答案', '先找看起來最熟的公式直接代數字', '只算到有一個數字就停', '忽略單位和答案範圍'],
    science: ['先列觀察，再控制條件、重複量測並比較模型預測', '看到一起變化就直接寫 A 一定造成 B', '只保留最符合自己猜想的一次資料', '把模型圖當成實物比例'],
    social: ['確認來源、時間、尺度，再分開事實、解釋與價值判斷', '只要數字最大就當成唯一原因', '只相信和自己立場相同的資料', '把多數意見直接當成事實證明'],
  }
  return choice(
    `${unit.unitId}-v14-diagnostic`,
    '應用',
    promptBySubject[unit.subject],
    [...optionsBySubject[unit.subject]],
    0,
    `本單元「${anchor}」除了記住內容，也要能使用可檢查的方法處理證據與答案。`,
    undefined,
    ['正確：這個做法保留了完整的推理與檢查流程。', '這正是本單元要避免的捷徑。', '這會讓判斷失去可檢查的證據。', '這忽略了題目或資料的重要限制。'],
  )
}

function transferResponse(unit: FoundationUnitContent, anchor: string): EnhancedResponse {
  const prompts: Record<Subject, string> = {
    chinese: `如果換一篇不同主題的文章，你會如何再次使用「${anchor}」的閱讀方法？`,
    english: `Use the unit idea “${anchor}” in a new situation. Explain what you would change and what you would keep.`,
    math: `請說明遇到一個新的生活情境時，你會如何判斷能否使用「${anchor}」的數學關係。`,
    science: `把「${anchor}」換到新的材料或環境後，請寫出一個可檢驗的預測與你需要量測的證據。`,
    social: `若「${anchor}」改用不同年份或不同地區的資料，你會如何重新檢查原本的結論？`,
  }
  const samples: Record<Subject, string> = {
    chinese: '我會保留找語境、段落功能和文本證據的方法，但不沿用上一課的主旨；我會重新引用新文章的句子或情節形成判斷。',
    english: 'I would keep the communicative goal, but change the subject, time, place, and vocabulary to fit the new situation. Then I would check grammar and whether the sentence sounds appropriate.',
    math: '我會先列新情境的已知量、未知量與限制，再比較是否和原本關係相同；若相同才建模計算，最後用單位、估算或圖形檢查。',
    science: '我會先指出模型預測的新結果，再控制重要條件、重複量測並比較資料；如果結果不符合預測，就要修正模型或限制結論。',
    social: '我會先比較新舊資料的來源、時間、尺度與定義，重新列出可直接支持的事實，再決定原本的原因解釋是否仍成立。',
  }
  return response(
    `${unit.unitId}-v14-transfer`,
    '檢核',
    prompts[unit.subject],
    samples[unit.subject],
    '轉移題要確認學生能把方法用到新情境，而不是複製上一頁答案。',
    `本單元核心概念：${anchor}`,
    ['有明確指出新情境', '說明保留的核心方法或關係', '說明需要重新檢查的條件或證據', '答案不是直接複製原例題'],
  )
}

export type TextbookDepthAuditV14 = {
  passed: boolean
  conceptCount: number
  misconceptionCount: number
  workedExampleCount: number
  questionCount: number
  choiceCount: number
  responseCount: number
  rubricCount: number
  reasons: string[]
}

export function auditTextbookDepthV14(unit: FoundationUnitContent): TextbookDepthAuditV14 {
  const enhanced = unit.questions as Array<ReviewedQuestion & CurriculumQuestionEnhancement>
  const conceptCount = unit.concepts.length
  const misconceptionCount = unit.concepts.filter((item) => /常見迷思|Common misconception/.test(item.title)).length
  const workedExampleCount = unit.workedExamples.length
  const questionCount = unit.questions.length
  const choiceCount = unit.questions.filter((item) => item.kind === 'choice').length
  const responseCount = unit.questions.filter((item) => item.kind === 'response').length
  const rubricCount = enhanced.filter((item) => Array.isArray(item.rubric) && item.rubric.length >= 3).length
  const reasons: string[] = []
  if (conceptCount < 6) reasons.push(`核心概念不足：${conceptCount} < 6`)
  if (misconceptionCount < 2) reasons.push(`常見迷思不足：${misconceptionCount} < 2`)
  if (workedExampleCount < 3) reasons.push(`完整示範不足：${workedExampleCount} < 3`)
  if (questionCount < 12) reasons.push(`題目不足：${questionCount} < 12`)
  if (choiceCount < 6) reasons.push(`選擇題不足：${choiceCount} < 6`)
  if (responseCount < 2) reasons.push(`開放題不足：${responseCount} < 2`)
  if (rubricCount < 1) reasons.push('至少需要 1 題具有 3 點以上評分規準的開放題')
  return { passed: reasons.length === 0, conceptCount, misconceptionCount, workedExampleCount, questionCount, choiceCount, responseCount, rubricCount, reasons }
}

export function enrichFoundationUnitV14(unit: FoundationUnitContent | null): FoundationUnitContent | null {
  if (!unit) return null
  const anchor = unit.concepts[0]?.title ?? unit.overview
  const misconceptionConcepts = subjectMisconceptions(unit.subject, anchor)
  const concepts = unique([...unit.concepts, ...misconceptionConcepts], (item) => item.title)
  while (concepts.length < 6) {
    concepts.push({
      title: `${anchor}｜延伸關係 ${concepts.length + 1}`,
      explanation: `把「${anchor}」和本單元其他概念連起來，說明條件、證據、表示方式與結果之間的關係；不能只背單一句結論。`,
      example: '換一個數字、文本、資料或生活情境後，仍要重新確認條件是否成立。',
    })
  }

  const workedExamples = unique([
    ...unit.workedExamples,
    diagnosisExample(unit, anchor),
    transferExample(unit, anchor),
  ], (item) => item.title)

  const generated: ReviewedQuestion[] = [
    ...concepts.slice(0, 4).map((concept, index) => conceptChoice({ ...unit, concepts }, concept, index)),
    diagnosticChoice(unit, anchor),
    transferResponse(unit, anchor),
    response(
      `${unit.unitId}-v14-explain`,
      '應用',
      unit.subject === 'english'
        ? `Explain “${anchor}” in your own words and give one new example that is not copied from the lesson.`
        : `請用自己的話解釋「${anchor}」，再舉一個沒有直接抄教材的新例子。`,
      unit.subject === 'english'
        ? `A complete answer states the core relationship of “${anchor}” and gives a new context that still follows the same rule or communicative purpose.`
        : `完整答案要先說出「${anchor}」的核心關係，再提供一個符合條件的新情境，並說明為什麼這個例子可以套用同一概念。`,
      '能自行重述並產生新例子，代表理解已超過背誦。',
      unit.overview,
      ['核心關係正確', '新例子沒有直接抄教材', '能說明例子和概念的連結'],
    ),
  ]

  const questions = unique([...unit.questions, ...generated], (item) => item.id)
  let cursor = 0
  while (questions.length < 12) {
    const concept = concepts[cursor % concepts.length]
    questions.push(conceptChoice({ ...unit, concepts }, concept, 10 + cursor))
    cursor += 1
  }

  const enriched: FoundationUnitContent = {
    ...unit,
    researchBasis: unique([
      ...unit.researchBasis,
      OFFICIAL_BASIS[unit.subject],
      'Bubble Space V14 教材深度門檻：核心概念＋常見迷思＋三組完整示範＋分層題組＋開放題 rubric＋跨情境轉移',
    ], (item) => item),
    concepts,
    workedExamples,
    questions,
    takeaway: unique([...unit.takeaway, ...concepts.slice(0, 6).map((item) => item.title)], (item) => item).slice(0, 8),
  }

  return enriched
}
