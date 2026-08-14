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

const compact = (value: string, max = 150) => {
  const clean = value.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, max - 1).replace(/[，、；：,.!?。！？\s]+$/g, '')}…`
}

const ensureLength = (value: string | undefined, minimum: number, fallback: string) => {
  const clean = (value ?? '').replace(/\s+/g, ' ').trim()
  if (clean.length >= minimum) return clean
  return `${clean}${clean ? ' ' : ''}${fallback}`.trim()
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

function focusPhrases(context: UnitContext) {
  return unique(`${context.unit.title}。${context.unit.focus}`
    .split(/[。；，、：:（）()／/]|以及|並且|並|與|和/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 2 && item.length <= 32))
}

function concreteScenario(context: UnitContext, concept: ReviewedConcept, index: number) {
  const existing = compact(concept.example ?? '', 200)
  const unitPhrase = focusPhrases(context).find((phrase) => existing.includes(phrase))
  if (existing.length >= 22 && unitPhrase && !/新情境|本單元方法|先找出和/.test(existing)) return existing

  const focus = compact(context.unit.focus, 155)
  if (context.subject === 'math') {
    return `在「${context.unit.title}」的「${focus}」情境中，先整理題目給的數量、單位與限制，再把「${concept.title}」表示成可以計算、列表、畫圖或估算檢查的關係。（情境 ${index + 1}）`
  }
  if (context.subject === 'science') {
    return `在「${context.unit.title}」探究「${focus}」時，學生留下可比較的觀察或量測紀錄，接著要用「${concept.title}」解釋現象，並區分直接證據和推測。（情境 ${index + 1}）`
  }
  if (context.subject === 'social') {
    return `在「${context.unit.title}」討論「${focus}」時，手上有不同時間、地點、來源或群體的資料，需要利用「${concept.title}」比較證據後再形成有限度結論。（情境 ${index + 1}）`
  }
  if (context.subject === 'english') {
    return `In “${context.unit.title}”, a learner communicates about ${focus}. The learner must use “${concept.title}” in a complete message and check the speaker, time, purpose, meaning, form, and register. (Situation ${index + 1})`
  }
  return `在「${context.unit.title}」處理「${focus}」的文本或表達任務時，學生要利用「${concept.title}」找出具體詞句、篇章結構或上下文線索，再說明這些線索如何支持判斷。（情境 ${index + 1}）`
}

function subjectSteps(context: UnitContext, concept: ReviewedConcept, scenario: string) {
  if (context.subject === 'math') return [
    `先從「${compact(scenario, 95)}」標出已知量、未知量、單位與限制。`,
    `把條件轉成和「${concept.title}」有關的式子、圖形、表格、數線或其他數學表示。`,
    `逐步完成推理或計算，確認每一步都仍符合「${context.unit.title}」的原始條件。`,
    '最後用代回、估算、圖形、單位或合理範圍檢查結果，再回答原本情境。',
  ]
  if (context.subject === 'science') return [
    `先把「${compact(scenario, 95)}」中直接觀察或量到的結果，和原因推測分開。`,
    `找出和「${concept.title}」直接相關的變因、量測方式、模型或可比較條件。`,
    '用資料或模型說明結果，同時檢查是否還有其他條件可能造成相同現象。',
    '最後限定結論範圍：指出證據目前支持什麼，以及還不能宣稱什麼。',
  ]
  if (context.subject === 'social') return [
    `先確認「${compact(scenario, 95)}」中的來源、時間、地點、尺度與觀察群體。`,
    '把資料能直接支持的事實，和原因解釋、價值判斷或政策選擇分開。',
    `利用「${concept.title}」比較至少兩項證據或觀點，不讓單一資料替整個議題下結論。`,
    '形成有限度結論，並說明若換時間、地區、尺度或群體，哪些部分需要重新檢查。',
  ]
  if (context.subject === 'english') return [
    `Identify the speaker, purpose, time, and situation in “${compact(scenario, 95)}”.`,
    `Use “${concept.title}” to connect meaning, form, word order, reference, and surrounding clues.`,
    'Try the expression as a complete message and compare it with another possible wording.',
    'Check that the final wording is both grammatically possible and natural for this situation.',
  ]
  return [
    `先讀完整情境「${compact(scenario, 95)}」，確認人物、事件、語氣、段落或表達目的。`,
    `找出能支持「${concept.title}」的實際詞句、結構或上下文線索。`,
    '把線索和判斷連起來，說明它如何影響意思、語氣、主旨或表達效果。',
    '最後回到全文檢查：是否有其他線索反駁這個解釋，或需要把結論說得更精確。',
  ]
}

function upgradeConcepts(context: UnitContext, source: ReviewedConcept[]) {
  const focus = compact(context.unit.focus, 155)
  return source.map((concept, index): ReviewedConcept => {
    const scenario = concreteScenario(context, concept, index)
    const unitAnchor = context.subject === 'english'
      ? `In “${context.unit.title}”, this idea is specifically used while learning ${focus}.`
      : `在「${context.unit.title}」中，這個觀念要直接用來處理「${focus}」。`
    const subjectExplanation = context.subject === 'math'
      ? '學習重點是把條件轉成可檢查的數學表示，說明量與量的關係，再用計算、圖形或估算驗證。'
      : context.subject === 'science'
        ? '學習重點是把觀察、模型與推論分開，用可比較的證據支持解釋，並知道結論的適用範圍。'
        : context.subject === 'social'
          ? '學習重點是連同來源、時間、空間尺度與不同群體觀點判讀資料，不把單一證據誇大成唯一原因。'
          : context.subject === 'english'
            ? 'Learners connect meaning, form, word order, time clues, reference, and register so the language works as a complete message instead of an isolated rule.'
            : '學習重點是回到完整語境，指出實際詞句、篇章結構或表達線索，再說明線索如何支持判斷。'
    return {
      ...concept,
      explanation: ensureLength(`${unitAnchor} ${concept.explanation} ${subjectExplanation}`, 72, subjectExplanation),
      example: ensureLength(scenario, 26, unitAnchor),
    }
  })
}

function correctAction(context: UnitContext, concept: ReviewedConcept) {
  if (context.subject === 'math') return `先確認情境中的量、單位與限制，再把它們轉成和「${concept.title}」一致的數學表示，完成推理後主動驗算。`
  if (context.subject === 'science') return `先找出和「${concept.title}」有關的可觀察證據、變因與控制條件，再用模型解釋並限制結論。`
  if (context.subject === 'social') return `先用「${concept.title}」整理資料事實與脈絡，再比較來源和觀點，最後形成不超出證據的結論。`
  if (context.subject === 'english') return `Use “${concept.title}” together with the speaker, purpose, meaning, form, time clues, and register before choosing the final message.`
  return `先找出文本中能支持「${concept.title}」的具體詞句、篇章或語言線索，再說明這些線索如何支持判斷。`
}

function distractorActions(context: UnitContext, concept: ReviewedConcept, others: ReviewedConcept[]) {
  const otherA = others[0]?.title ?? context.unit.title
  const otherB = others[1]?.title ?? context.unit.focus
  if (context.subject === 'math') return [
    `只因題目出現「${concept.title}」就立刻套固定公式，不先確認量、單位與關係。`,
    `直接搬用「${otherA}」的做法，即使新情境的條件和表示方式已經改變。`,
    `算出一個數字就停止，不檢查它是否符合「${context.unit.title}」的單位、範圍或原問題。`,
  ]
  if (context.subject === 'science') return [
    `只看到一次和「${concept.title}」相符的現象，就把同時發生直接當成因果。`,
    `把「${otherA}」的模型當成實物本身，不檢查模型在這個尺度和條件下是否適用。`,
    `先寫結論，再挑支持它的資料，不比較「${otherB}」等其他可能改變結果的條件。`,
  ]
  if (context.subject === 'social') return [
    `只拿一份和「${concept.title}」有關的資料，就把它當成「${context.unit.title}」的唯一原因。`,
    `把「${otherA}」的觀點當成所有群體都同意的事實，不檢查來源、時間與立場。`,
    '還沒分清資料事實與價值選擇，就直接提出唯一政策答案。',
  ]
  if (context.subject === 'english') return [
    `Choose a sentence only because it contains words related to “${concept.title}”, without checking the situation.`,
    `Use the form connected with “${otherA}” even when the speaker, time, or purpose is different.`,
    'Translate word by word and ignore whether the complete message sounds natural in this context.',
  ]
  return [
    `只看到「${concept.title}」相關關鍵字，就直接決定意思或主旨，不讀完整前後文。`,
    `把「${otherA}」的說法套進來，卻沒有指出任何實際文本證據。`,
    `只寫個人感受，不說明「${otherB}」或其他篇章線索如何支持判斷。`,
  ]
}

function makeChoice(
  context: UnitContext,
  id: string,
  level: ReviewedChoiceQuestion['level'],
  prompt: string,
  scenario: string,
  concept: ReviewedConcept,
  distractors: string[],
  rotation: number,
): EnhancedChoice {
  const correct = correctAction(context, concept)
  const raw = unique([correct, ...distractors]).slice(0, 4)
  while (raw.length < 4) raw.push(`這個做法在「${context.unit.title}」中仍缺少一項必要條件或證據 ${raw.length + 1}`)
  const options = rotate(raw, rotation)
  const correctIndex = options.indexOf(correct)
  const explanation = ensureLength(
    `${concept.explanation} 在這個情境中，重點是先確認概念成立條件，再把具體線索連到判斷，而不是只辨認關鍵字。`,
    36,
    `請回到「${context.unit.title}」的實際條件重新檢查。`,
  )
  return {
    id,
    kind: 'choice',
    level,
    context: ensureLength(scenario, 24, `本題屬於「${context.unit.title}」：${context.unit.focus}`),
    prompt,
    options,
    correctIndex,
    explanation,
    optionFeedback: options.map((option) => option === correct
      ? `正確。這個做法先確認「${concept.title}」成立的條件，再用「${context.unit.title}」中的具體線索完成判斷。`
      : `這個選項在目前情境中漏掉了條件、證據、表示方式或語境檢查。請先比較題目線索，再回頭確認「${concept.title}」是否真的適用。`),
  } as EnhancedChoice
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
    ? `請處理上面的「${context.unit.title}」情境：用「${concept.title}」建立表示、完成推理，並說明最後如何檢查答案。`
    : context.subject === 'science'
      ? `根據上面的「${context.unit.title}」情境，用「${concept.title}」提出可檢查的解釋；至少寫出兩項證據或控制條件，以及結論限制。`
      : context.subject === 'social'
        ? `根據上面的「${context.unit.title}」資料情境，用「${concept.title}」區分事實與解釋，再寫出不超出證據的結論。`
        : context.subject === 'english'
          ? `Use “${concept.title}” to respond to the “${context.unit.title}” situation above. Explain two clues that guide your wording and why the final message fits the context.`
          : `根據上面的「${context.unit.title}」文本情境，用「${concept.title}」提出判斷，至少引用兩個具體線索，並說明線索如何支持結論。`
  return {
    id,
    kind: 'response',
    level,
    context: ensureLength(scenario, 28, `本單元範圍：${context.unit.focus}`),
    prompt,
    sampleAnswer: ensureLength(
      `${steps.join(' ')} 因此完整答案不只寫結論，也要讓別人能沿著證據、條件或表示方式重新檢查。`,
      60,
      `最後要回到「${context.unit.title}」的原始問題確認結論。`,
    ),
    explanation: ensureLength(
      `這題檢查能否把「${concept.title}」真正用在「${context.unit.title}」的新情境，而不是只背定義或重複例題。`,
      32,
      `請重新核對「${context.unit.focus}」。`,
    ),
    rubric: context.subject === 'math'
      ? ['有整理已知量、未知量、單位或限制', `有正確使用「${concept.title}」建立表示並完成推理`, '有用代回、估算、圖形或範圍檢查答案']
      : context.subject === 'science'
        ? ['有區分直接觀察或量測與推論', `有使用「${concept.title}」連結至少兩項證據或控制條件`, '有說明結論能支持到哪裡及目前限制']
        : context.subject === 'social'
          ? ['有交代來源、時間、地點、尺度或群體脈絡', `有使用「${concept.title}」比較至少兩項證據或觀點`, '結論沒有把局部資料誇大成唯一原因或答案']
          : context.subject === 'english'
            ? ['The response fits the speaker, purpose, time, and situation', `The response uses “${concept.title}” accurately in meaning and form`, 'The explanation points to at least two concrete language or context clues']
            : ['有指出至少兩個具體文本、結構或語言線索', `有用「${concept.title}」說明線索和判斷之間的關係`, '結論能回到完整語境檢查，不只靠關鍵字或感受'],
  } as EnhancedResponse
}

function normalizeValuableSourceQuestion(context: UnitContext, question: ReviewedQuestion, index: number): ReviewedQuestion | null {
  const extra = question as ReviewedQuestion & CurriculumQuestionEnhancement
  if (!extra.mediaAssetId && !extra.audioText) return null
  const concept = ({
    title: context.unit.title,
    explanation: `本題的圖片或聽力素材要和「${context.unit.focus}」一起判讀，不能只看單一關鍵字。`,
    example: question.context,
  }) as ReviewedConcept
  const scenario = ensureLength(
    question.context,
    28,
    `這是一題屬於「${context.unit.title}」的媒體或聽力情境，作答時要同時使用素材與「${context.unit.focus}」中的相關線索。`,
  )
  if (question.kind === 'choice' && question.options.length === 4 && new Set(question.options.map((item) => item.trim())).size === 4) {
    const correct = question.options[question.correctIndex]
    if (!correct) return null
    const explanation = ensureLength(question.explanation, 32, `請把素材線索和「${context.unit.title}」的學習重點逐項對照。`)
    return {
      ...question,
      id: `${context.unit.id}-ped-v17-media-choice-${index + 1}`,
      context: scenario,
      prompt: question.prompt,
      explanation,
      optionFeedback: question.options.map((option) => option === correct
        ? `正確。這個選項同時符合素材中的具體線索和「${context.unit.title}」的判斷條件。`
        : `這個選項和目前素材中的部分線索或「${context.unit.title}」的條件不一致；請指出衝突位置再重新選擇。`),
    } as EnhancedChoice
  }
  if (question.kind === 'response') {
    return {
      ...question,
      id: `${context.unit.id}-ped-v17-media-response-${index + 1}`,
      context: scenario,
      explanation: ensureLength(question.explanation, 32, `請把素材線索和「${context.unit.title}」的重點連起來。`),
      sampleAnswer: ensureLength(question.sampleAnswer, 55, `完整答案要指出素材中的具體證據，再用「${context.unit.focus}」說明證據如何支持結論。`),
      rubric: unique([
        ...(extra.rubric ?? []),
        '有指出素材中的具體線索或證據。',
        '有把素材線索和本單元核心觀念正確連接。',
        '結論沒有超出素材與題目條件能支持的範圍。',
      ]).slice(0, 5),
    } as EnhancedResponse
  }
  void concept
  return null
}

function buildPedagogyQuestions(context: UnitContext, concepts: ReviewedConcept[], source: ReviewedQuestion[]) {
  const questions: ReviewedQuestion[] = []
  const selected = concepts.slice(0, Math.min(6, concepts.length))

  selected.forEach((concept, index) => {
    const others = selected.filter((_, itemIndex) => itemIndex !== index)
    const prompts = context.subject === 'english'
      ? [
          `Which action best uses “${concept.title}” in this “${context.unit.title}” situation?`,
          `What should the learner check first before applying “${concept.title}” here?`,
          `Which explanation keeps “${concept.title}” connected to the full context?`,
          `Which check gives the strongest evidence that “${concept.title}” was used appropriately?`,
        ]
      : [
          `面對這個「${context.unit.title}」情境，哪一個做法最能正確使用「${concept.title}」？`,
          `如果不想只背結論，處理這個「${concept.title}」情境時最應先檢查哪件事？`,
          `在「${context.unit.title}」裡，哪個說明最能把「${concept.title}」和實際條件連起來？`,
          `要確認自己真的會用「${concept.title}」，下面哪個檢查最有意義？`,
        ]
    questions.push(makeChoice(
      context,
      `${context.unit.id}-ped-v17-check-${index + 1}`,
      index < 2 ? '理解' : '應用',
      prompts[index % prompts.length],
      concreteScenario(context, concept, index),
      concept,
      distractorActions(context, concept, others),
      index,
    ))
  })

  selected.slice(0, 4).forEach((concept, index) => {
    const others = selected.filter((item) => item !== concept)
    const prompt = context.subject === 'english'
      ? `A learner misuses “${concept.title}” in this “${context.unit.title}” situation. Which correction fixes the reasoning rather than only replacing the answer?`
      : `有同學在這個「${context.unit.title}」情境中誤用了「${concept.title}」。哪個修正最能指出問題發生在哪個條件或推理步驟？`
    questions.push(makeChoice(
      context,
      `${context.unit.id}-ped-v17-diagnose-${index + 1}`,
      '檢核',
      prompt,
      concreteScenario(context, concept, index + 7),
      concept,
      distractorActions(context, concept, others),
      index + 1,
    ))
  })

  selected.slice(0, 4).forEach((concept, index) => {
    questions.push(makeResponse(
      context,
      `${context.unit.id}-ped-v17-response-${index + 1}`,
      index === 0 ? '理解' : index === 3 ? '檢核' : '應用',
      concept,
      concreteScenario(context, concept, index + 12),
      index,
    ))
  })

  const synthesisConcept = selected[0]
  if (synthesisConcept) {
    questions.push(makeResponse(
      context,
      `${context.unit.id}-ped-v17-synthesis`,
      '檢核',
      synthesisConcept,
      context.subject === 'english'
        ? `Create a different complete situation for “${context.unit.title}” that still belongs to this focus: ${context.unit.focus}.`
        : `請自行換一個和課本例題不同、但仍屬於「${context.unit.title}」範圍「${context.unit.focus}」的完整情境。`,
      20,
    ))
  }

  source.forEach((question, index) => {
    if (questions.length >= 18) return
    const normalized = normalizeValuableSourceQuestion(context, question, index)
    if (normalized) questions.push(normalized)
  })

  const seen = new Set<string>()
  return questions.filter((question) => {
    const key = question.prompt.toLowerCase().replace(/[\s，。！？；：,.!?;:'"「」『』（）()\-—]/g, '')
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function upgradeExamples(context: UnitContext, concepts: ReviewedConcept[], source: ReviewedWorkedExample[]) {
  const generated = concepts.slice(0, 4).map((concept, index): ReviewedWorkedExample => {
    const scenario = concreteScenario(context, concept, index + 30)
    const steps = subjectSteps(context, concept, scenario)
    const prompt = context.subject === 'math'
      ? `在這個「${context.unit.title}」具體情境裡，如何用「${concept.title}」建立數學表示並得到可檢查的結果？`
      : context.subject === 'science'
        ? `這個「${context.unit.title}」現象可以如何用「${concept.title}」提出證據導向的解釋？`
        : context.subject === 'social'
          ? `如何利用「${concept.title}」從這個「${context.unit.title}」資料情境形成不超出證據的判斷？`
          : context.subject === 'english'
            ? `How would you use “${concept.title}” to understand or respond to this complete “${context.unit.title}” situation?`
            : `如何用「${concept.title}」從這個「${context.unit.title}」文本情境形成可以回到文本檢查的判斷？`
    const answer = context.subject === 'english'
      ? `A strong answer follows the situation clues, applies “${concept.title}” to the complete message, and checks whether the wording remains accurate and natural within the focus of “${context.unit.title}”.`
      : `完整答案要把「${concept.title}」和「${context.unit.title}」的具體條件連起來，依步驟完成判斷，最後主動檢查答案、證據或結論是否超出「${context.unit.focus}」能支持的範圍。`
    return {
      title: `${context.unit.title}｜情境例題 ${index + 1}：${concept.title}`,
      context: ensureLength(scenario, 32, `本題屬於「${context.unit.title}」：${context.unit.focus}`),
      prompt: ensureLength(prompt, 24, `請完整寫出處理「${concept.title}」的過程。`),
      steps,
      answer: ensureLength(answer, 36, `最後要回到「${context.unit.title}」原始條件檢查。`),
      explanation: ensureLength(
        `這個例題刻意把「${context.unit.focus}」轉成一條可重做的思考流程。學會後，即使數值、文本、資料或情境改變，也要能重新判斷，而不是複製最後答案。`,
        45,
        '每一步都要能說明理由。',
      ),
    }
  })

  const mediaExample = source.find((example) => {
    const text = `${example.title} ${example.context} ${example.prompt}`
    return focusPhrases(context).some((phrase) => text.includes(phrase))
  })
  if (!mediaExample || generated.length >= 5) return generated

  const concept = concepts[generated.length % concepts.length]
  const fallbackScenario = concreteScenario(context, concept, 40)
  return [...generated, {
    ...mediaExample,
    title: ensureLength(mediaExample.title, 8, `${context.unit.title}｜補充例題`),
    context: ensureLength(mediaExample.context, 32, fallbackScenario),
    prompt: ensureLength(mediaExample.prompt, 24, `請依「${context.unit.title}」的條件完整說明判斷。`),
    steps: mediaExample.steps.length >= 4 ? mediaExample.steps : subjectSteps(context, concept, fallbackScenario),
    answer: ensureLength(mediaExample.answer, 36, `答案要能回到「${context.unit.title}」的實際條件驗證。`),
    explanation: ensureLength(mediaExample.explanation, 45, `這個補充例題用來比較不同情境下「${concept.title}」是否仍適用，不能只記最後答案。`),
  }].slice(0, 5)
}

function transform(unit: TextbookUnitContentV14): TextbookUnitContentV14 {
  const context = resolveCurriculumUnit(unit.unitId)
  if (!context) return unit
  const concepts = upgradeConcepts(context, unit.concepts)
  const workedExamples = upgradeExamples(context, concepts, unit.workedExamples)
  const questions = buildPedagogyQuestions(context, concepts, unit.questions)
  return {
    ...unit,
    concepts,
    workedExamples,
    questions,
    researchBasis: Array.from(new Set([
      ...unit.researchBasis,
      'Bubble Space V17 pedagogy：用單元具體情境重建題庫、例題與回饋，降低通用模板依賴，並支援概念後立即檢索練習。',
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
