import type { CurriculumQuestionEnhancement } from './curriculum-reviewed-content'
import { resolveCurriculumUnit } from './curriculum-plan-v5'
import type {
  ReviewedChoiceQuestion,
  ReviewedConcept,
  ReviewedQuestion,
  ReviewedResponseQuestion,
  ReviewedWorkedExample,
} from './curriculum-reviewed-social10'
import {
  validateTextbookUnitV14,
  type TextbookUnitContentV14,
} from './curriculum-textbook-v14'
import { getTextbookUnitContentV14 } from './curriculum-textbook-v14-final'

type EnhancedChoice = ReviewedChoiceQuestion & CurriculumQuestionEnhancement
type EnhancedResponse = ReviewedResponseQuestion & CurriculumQuestionEnhancement
type UnitContext = NonNullable<ReturnType<typeof resolveCurriculumUnit>>

const oldTemplatePrompt = [
  /^下列哪個敘述最符合「/,
  /^哪個例子最能直接說明「/,
  /^同學說：「.+」哪個修正最完整？$/,
  /^這個情境如何呈現「/,
  /^針對「.+」，請說明你會先檢查什麼/,
]

const compact = (value: string, max = 130) => {
  const clean = value.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, max - 1).replace(/[，、；：,.!?。！？\s]+$/g, '')}…`
}

function unique(values: string[]) {
  const seen = new Set<string>()
  return values.filter((value) => {
    const key = value.replace(/\s+/g, ' ').trim()
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function rotate<T>(values: T[], offset: number) {
  if (!values.length) return values
  const n = ((offset % values.length) + values.length) % values.length
  return [...values.slice(n), ...values.slice(0, n)]
}

function concreteScenario(context: UnitContext, concept: ReviewedConcept, index: number) {
  const example = compact(concept.example ?? '', 190)
  if (example.length >= 18 && !/新情境|先找出和|再用本單元方法/.test(example)) return example
  const focus = compact(context.unit.focus, 150)
  const subjectFallback = context.subject === 'math'
    ? `在「${context.unit.title}」中，把題目給的量、單位與關係整理成可以計算或畫圖檢查的資料。`
    : context.subject === 'science'
      ? `在「${context.unit.title}」中，針對「${focus}」安排一次可觀察、可比較且能留下證據的探究。`
      : context.subject === 'social'
        ? `在「${context.unit.title}」中，比較和「${focus}」有關的來源、時間、地點或不同群體資料。`
        : context.subject === 'english'
          ? `In the unit “${context.unit.title}”, use “${concept.title}” in a complete situation related to ${focus}.`
          : `在「${context.unit.title}」的文本或表達情境中，利用「${concept.title}」處理「${focus}」。`
  return `${subjectFallback}（情境 ${index + 1}）`
}

function subjectSteps(context: UnitContext, concept: ReviewedConcept, scenario: string) {
  if (context.subject === 'math') return [
    `先從「${compact(scenario, 90)}」標出已知量、未知量、單位與限制。`,
    `把這些條件轉成和「${concept.title}」有關的式子、圖形、表格或數線表示。`,
    `逐步推理或計算，每一步都能說明為什麼仍符合「${context.unit.title}」的條件。`,
    `用代回、估算、圖形或極端情況檢查結果，再回答原本的問題。`,
  ]
  if (context.subject === 'science') return [
    `先把「${compact(scenario, 90)}」中真正觀察到或量到的現象與推測分開。`,
    `找出和「${concept.title}」直接相關的變因、量測方式、模型或可比較條件。`,
    `用資料或模型解釋結果，並比較是否還有其他可能造成相同現象的因素。`,
    `最後限制結論範圍：指出證據能支持什麼，以及目前還不能宣稱什麼。`,
  ]
  if (context.subject === 'social') return [
    `先確認「${compact(scenario, 90)}」的資料來源、時間、地點、尺度與觀察對象。`,
    `把能直接看出的事實，和需要進一步推論的原因或價值判斷分開。`,
    `利用「${concept.title}」比較至少兩項證據或觀點，避免只靠單一資料下結論。`,
    `形成有限度結論，並說明若換時間、地區或群體，哪些部分可能需要重新檢查。`,
  ]
  if (context.subject === 'english') return [
    `Identify who is speaking, the purpose, and the time or situation in “${compact(scenario, 90)}”.`,
    `Use “${concept.title}” to connect meaning, word order, form, and the surrounding clues.`,
    `Try the expression as a complete message and compare it with another possible wording.`,
    `Check whether the final sentence is both grammatically possible and natural for this situation.`,
  ]
  return [
    `先讀完整情境「${compact(scenario, 90)}」，確認人物、事件、語氣、段落或表達目的。`,
    `找出能支持「${concept.title}」的實際詞句、結構或上下文線索。`,
    `把線索和判斷連起來，說明它如何影響意思、語氣、主旨或表達效果。`,
    `最後回到全文檢查：是否有其他句子反駁這個解釋，或需要把結論說得更精確。`,
  ]
}

function upgradedConcept(context: UnitContext, concept: ReviewedConcept, index: number): ReviewedConcept {
  const scenario = concreteScenario(context, concept, index)
  const looksGeneric = /學習不能只背最後一句，而要依|例如遇到「.+」的新情境時，先找出|核心觀念(?:｜關係 \d+)?$/.test(`${concept.title} ${concept.explanation} ${concept.example ?? ''}`)
  if (!looksGeneric) return concept
  const focus = compact(context.unit.focus, 150)
  const explanation = context.subject === 'math'
    ? `在「${context.unit.title}」裡，「${concept.title}」要用來描述或處理「${focus}」中的量與關係。重點不是看到關鍵字就套公式，而是能把條件轉成式子、圖形、表格或數線，再用計算與檢查確認表示前後一致。`
    : context.subject === 'science'
      ? `在「${context.unit.title}」裡，「${concept.title}」用來解釋「${focus}」中的可觀察現象。學習時要分清楚觀察、模型與推論，並知道哪些變因或證據會讓原本的解釋需要修正。`
      : context.subject === 'social'
        ? `在「${context.unit.title}」裡，「${concept.title}」是理解「${focus}」的一個分析角度。必須連同資料來源、時間、空間尺度與不同群體觀點一起判讀，避免把單一資料直接當成唯一原因或唯一答案。`
        : context.subject === 'english'
          ? `In “${context.unit.title}”, “${concept.title}” is used to communicate about ${focus}. Learners should connect meaning, form, word order, time clues, and register so the language works in a complete situation rather than as an isolated rule.`
          : `在「${context.unit.title}」裡，「${concept.title}」要和「${focus}」的完整文本或表達目的連在一起。判讀時要指出實際詞句、篇章結構或上下文線索，不能只靠一個關鍵字或個人感受下結論。`
  return { ...concept, explanation, example: scenario }
}

function makeChoice(
  context: UnitContext,
  id: string,
  level: ReviewedChoiceQuestion['level'],
  prompt: string,
  scenario: string,
  correct: string,
  distractors: string[],
  explanation: string,
  rotation: number,
): EnhancedChoice {
  const raw = unique([correct, ...distractors]).slice(0, 4)
  while (raw.length < 4) raw.push(`在「${context.unit.title}」中仍缺少必要條件的判斷 ${raw.length + 1}`)
  const options = rotate(raw, rotation)
  const correctIndex = options.indexOf(correct)
  const optionFeedback = options.map((option) => {
    if (option === correct) return `這個選擇有把「${context.unit.title}」的實際情境和判斷條件連起來。${explanation}`
    return `這個做法在「${context.unit.title}」的情境裡漏掉了條件、證據或表示關係。先回到題目中的具體線索，再和「${compact(correct, 82)}」比較。`
  })
  return {
    id,
    kind: 'choice',
    level,
    context: scenario,
    prompt,
    options,
    correctIndex,
    explanation,
    optionFeedback,
  } as EnhancedChoice
}

function correctAction(context: UnitContext, concept: ReviewedConcept) {
  if (context.subject === 'math') return `先把題目條件轉成和「${concept.title}」一致的數學表示，再完成推理並驗算。`
  if (context.subject === 'science') return `先找出和「${concept.title}」有關的可觀察證據與控制條件，再用模型解釋。`
  if (context.subject === 'social') return `先用「${concept.title}」整理資料事實，再比較來源與觀點後形成有限度結論。`
  if (context.subject === 'english') return `Use “${concept.title}” together with the situation, meaning, form, and register before choosing the final expression.`
  return `先找出文本中能支持「${concept.title}」的具體詞句或結構，再說明它如何支持判斷。`
}

function distractorActions(context: UnitContext, concept: ReviewedConcept, others: ReviewedConcept[]) {
  const otherA = others[0]?.title ?? context.unit.title
  const otherB = others[1]?.title ?? context.unit.focus
  if (context.subject === 'math') return [
    `只因題目出現「${concept.title}」就立刻套用一個固定公式，不先確認量與關係。`,
    `把「${otherA}」的方法直接搬過來，即使題目條件和表示方式不同。`,
    `算出數字就停止，不檢查單位、範圍或是否符合「${context.unit.title}」的原情境。`,
  ]
  if (context.subject === 'science') return [
    `只看到一次和「${concept.title}」相符的現象，就直接把相關當成因果。`,
    `把「${otherA}」的模型當成實物本身，不檢查模型在這個尺度是否適用。`,
    `先寫結論，再挑選支持結論的資料，而不比較「${otherB}」等其他可能條件。`,
  ]
  if (context.subject === 'social') return [
    `只拿一份和「${concept.title}」有關的資料，就把它當成「${context.unit.title}」的唯一原因。`,
    `把「${otherA}」的觀點當成所有群體都同意的事實，不檢查來源與立場。`,
    `直接提出政策或價值結論，卻沒有先說資料能直接支持哪些事實。`,
  ]
  if (context.subject === 'english') return [
    `Choose a sentence only because it contains the words “${concept.title}”, without checking the situation.`,
    `Use the form connected with “${otherA}” even when the time, speaker, or purpose is different.`,
    `Translate word by word and ignore whether the complete message sounds natural in this context.`,
  ]
  return [
    `只看到「${concept.title}」相關關鍵字，就直接決定主旨或語意，不讀前後文。`,
    `把「${otherA}」的說法套到這一段，卻沒有指出任何實際文本證據。`,
    `只寫自己的感受，不說明「${otherB}」或其他篇章線索如何支持判斷。`,
  ]
}

function makeResponse(
  context: UnitContext,
  id: string,
  level: ReviewedResponseQuestion['level'],
  concept: ReviewedConcept,
  scenario: string,
  index: number,
): EnhancedResponse {
  const steps = subjectSteps(context, concept, scenario)
  const prompt = context.subject === 'math'
    ? `請處理上面的情境：寫出你會如何用「${concept.title}」建立表示、完成推理，並說明最後怎麼檢查答案。`
    : context.subject === 'science'
      ? `根據上面的情境，請用「${concept.title}」提出一個可檢查的解釋；至少寫出兩項證據或控制條件，以及結論的限制。`
      : context.subject === 'social'
        ? `根據上面的情境，請用「${concept.title}」區分資料事實與解釋，再寫出一個不超出證據範圍的結論。`
        : context.subject === 'english'
          ? `Use “${concept.title}” to respond to the situation above. Explain two clues that guide your wording and why your final message fits the context.`
          : `根據上面的情境，請用「${concept.title}」提出判斷，至少引用兩個文本或表達線索，並說明線索如何支持結論。`
  return {
    id,
    kind: 'response',
    level,
    context: scenario,
    prompt,
    sampleAnswer: `${steps.join(' ')} 因此完整答案不只寫結論，也要讓別人能沿著證據、條件或表示方式重新檢查。`,
    explanation: `這題檢查的是能否把「${concept.title}」真正用在「${context.unit.title}」的完整情境，而不是只背定義。`,
    rubric: context.subject === 'math'
      ? ['有把已知量、未知量、單位或限制整理清楚', `有正確使用「${concept.title}」建立數學表示並完成推理`, '有用代回、估算、圖形或範圍檢查答案是否合理']
      : context.subject === 'science'
        ? ['有區分直接觀察或量測與推論', `有使用「${concept.title}」連結至少兩項證據或控制條件`, '有說明結論能支持到哪裡，以及還有哪些限制']
        : context.subject === 'social'
          ? ['有交代來源、時間、地點、尺度或群體脈絡', `有使用「${concept.title}」比較至少兩項證據或觀點`, '結論沒有把局部資料誇大成唯一原因或唯一答案']
          : context.subject === 'english'
            ? ['The response fits the speaker, purpose, and situation', `The response uses “${concept.title}” accurately in meaning and form`, 'The explanation points to at least two concrete language or context clues']
            : ['有指出至少兩個具體文本、結構或語言線索', `有用「${concept.title}」說明線索和判斷之間的關係`, '結論能回到完整語境檢查，而不是只靠關鍵字或個人感受'],
  } as EnhancedResponse
}

function buildPedagogyQuestions(context: UnitContext, concepts: ReviewedConcept[], source: ReviewedQuestion[]) {
  const preserved = source.filter((question) => {
    if (/-tb-v14-|v14-final/.test(question.id)) return false
    return !oldTemplatePrompt.some((pattern) => pattern.test(question.prompt))
  }).slice(0, 5)

  const generated: ReviewedQuestion[] = []
  const selectedConcepts = concepts.slice(0, Math.min(6, concepts.length))

  selectedConcepts.forEach((concept, index) => {
    const scenario = concreteScenario(context, concept, index)
    const others = selectedConcepts.filter((_, itemIndex) => itemIndex !== index)
    const correct = correctAction(context, concept)
    const distractors = distractorActions(context, concept, others)
    const prompts = context.subject === 'english'
      ? [
          `Which action best uses “${concept.title}” in this situation?`,
          `What should the learner check first before applying “${concept.title}”?`,
          `Which explanation keeps the meaning of “${concept.title}” connected to the full context?`,
          `Which choice would give the strongest evidence that “${concept.title}” was used appropriately?`,
        ]
      : [
          `面對這個情境，哪一個做法最能正確使用「${concept.title}」？`,
          `如果要避免只背結論，處理「${concept.title}」時最應先檢查哪件事？`,
          `針對「${context.unit.title}」這個情境，哪個說明最能把「${concept.title}」和實際條件連起來？`,
          `要確認自己真的會用「${concept.title}」，下面哪個檢查最有意義？`,
        ]
    generated.push(makeChoice(
      context,
      `${context.unit.id}-ped-v17-check-${index + 1}`,
      index < 2 ? '理解' : '應用',
      prompts[index % prompts.length],
      scenario,
      correct,
      distractors,
      concept.explanation,
      index,
    ))
  })

  selectedConcepts.slice(0, 4).forEach((concept, index) => {
    const scenario = concreteScenario(context, concept, index + 7)
    const misconception = `把「${concept.title}」當成看到關鍵字就能直接使用的固定結論。`
    const correct = context.subject === 'english'
      ? `Return to the complete situation and use “${concept.title}” only after checking meaning, form, time, and register.`
      : `回到「${context.unit.title}」的完整情境，重新檢查「${concept.title}」成立所需要的條件、證據或表示方式。`
    const distractors = [
      misconception,
      `只把「${concept.title}」的定義再抄一次，但不處理情境中的任何具體線索。`,
      `因為題目和課本例子看起來相似，所以不需要重新檢查「${context.unit.focus}」的條件。`,
    ]
    generated.push(makeChoice(
      context,
      `${context.unit.id}-ped-v17-diagnose-${index + 1}`,
      '檢核',
      context.subject === 'english'
        ? `A learner misuses “${concept.title}” in the situation above. Which correction is most useful?`
        : `有同學在上面的情境中誤用了「${concept.title}」。哪個修正最能真正解決問題？`,
      scenario,
      correct,
      distractors,
      `修正錯誤時要指出錯在哪一個條件或推理步驟，而不只是把正確答案重說一次。`,
      index + 1,
    ))
  })

  selectedConcepts.slice(0, 4).forEach((concept, index) => {
    generated.push(makeResponse(
      context,
      `${context.unit.id}-ped-v17-response-${index + 1}`,
      index === 0 ? '理解' : index === 3 ? '檢核' : '應用',
      concept,
      concreteScenario(context, concept, index + 12),
      index,
    ))
  })

  const all = [...preserved, ...generated]
  const seen = new Set<string>()
  return all.filter((question) => {
    const key = question.prompt.toLowerCase().replace(/[\s，。！？；：,.!?;:'"「」『』（）()\-—]/g, '')
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function upgradeExamples(context: UnitContext, concepts: ReviewedConcept[], source: ReviewedWorkedExample[]) {
  const specific = source.filter((example) => {
    const text = `${example.title} ${example.context} ${example.prompt} ${example.answer}`
    return !/^完整示範/.test(example.title) && (text.includes(context.unit.title) || context.unit.focus.split(/[，、。；]/).some((phrase) => phrase.trim().length >= 3 && text.includes(phrase.trim())))
  }).slice(0, 2)

  const generated = concepts.slice(0, 4).map((concept, index): ReviewedWorkedExample => {
    const scenario = concreteScenario(context, concept, index)
    const steps = subjectSteps(context, concept, scenario)
    const prompt = context.subject === 'math'
      ? `在這個具體情境裡，如何用「${concept.title}」建立數學表示並得到可檢查的結果？`
      : context.subject === 'science'
        ? `這個現象可以如何用「${concept.title}」提出證據導向的解釋？`
        : context.subject === 'social'
          ? `如何利用「${concept.title}」從這份情境形成不超出證據的社會判斷？`
          : context.subject === 'english'
            ? `How would you use “${concept.title}” to understand or respond to this complete situation?`
            : `如何用「${concept.title}」從這個情境找出可被文本檢查的判斷？`
    const answer = context.subject === 'english'
      ? `A strong answer follows the context clues, applies “${concept.title}” to the complete message, and then checks whether the wording remains natural and accurate.`
      : `完整答案必須把「${concept.title}」和「${context.unit.title}」的具體條件連起來，依步驟完成判斷，並在最後主動檢查結論是否超出題目可支持的範圍。`
    return {
      title: `${context.unit.title}｜情境例題 ${index + 1}：${concept.title}`,
      context: scenario,
      prompt,
      steps,
      answer,
      explanation: `這個例題不是示範固定句型，而是把「${context.unit.focus}」轉成一條可以重做的思考流程；換數值、文本、資料或情境後，仍應能重新判斷。`,
    }
  })

  return [...specific, ...generated].slice(0, 5)
}

function transform(unit: TextbookUnitContentV14): TextbookUnitContentV14 {
  const context = resolveCurriculumUnit(unit.unitId)
  if (!context) return unit
  const concepts = unit.concepts.map((concept, index) => upgradedConcept(context, concept, index))
  const workedExamples = upgradeExamples(context, concepts, unit.workedExamples)
  const questions = buildPedagogyQuestions(context, concepts, unit.questions)
  return {
    ...unit,
    concepts,
    workedExamples,
    questions,
    researchBasis: Array.from(new Set([
      ...unit.researchBasis,
      'Bubble Space V17 pedagogy：以單元具體情境重建題庫與例題，降低通用模板比例，並支援概念後立即檢索練習。',
    ])),
  }
}

const cache = new Map<string, TextbookUnitContentV14 | null>()

export function inspectTextbookUnitV17(unitId: string) {
  const base = getTextbookUnitContentV14(unitId)
  if (!base) return { unit: null, validation: { ready: false, errors: [`${unitId}: V14 base content not found`] } }
  const unit = transform(base)
  return { unit, validation: validateTextbookUnitV14(unit) }
}

export function getTextbookUnitContentV17(unitId: string): TextbookUnitContentV14 | null {
  if (cache.has(unitId)) return cache.get(unitId) ?? null
  const inspected = inspectTextbookUnitV17(unitId)
  const unit = inspected.unit && inspected.validation.ready ? inspected.unit : null
  cache.set(unitId, unit)
  return unit
}

export function getConceptChecksV17(unit: TextbookUnitContentV14) {
  return unit.questions.filter((question) => question.id.includes('-ped-v17-check-'))
}
