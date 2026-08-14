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
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).replace(/[，、；：,.!?。！？\s]+$/g, '')}…`
}
const ensureLength = (value: string | undefined, minimum: number, fallback: string) => {
  const clean = (value ?? '').replace(/\s+/g, ' ').trim()
  return clean.length >= minimum ? clean : `${clean}${clean ? ' ' : ''}${fallback}`.trim()
}
const unique = (values: string[]) => {
  const seen = new Set<string>()
  return values.filter((value) => {
    const key = value.replace(/\s+/g, ' ').trim()
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}
const rotate = <T,>(values: T[], offset: number) => {
  if (!values.length) return values
  const n = ((offset % values.length) + values.length) % values.length
  return [...values.slice(n), ...values.slice(0, n)]
}

function scenario(context: UnitContext, concept: ReviewedConcept, index: number) {
  const focus = compact(context.unit.focus, 150)
  const existing = compact(concept.example ?? '', 190)
  if (existing.length >= 24 && (existing.includes(context.unit.title) || focus.split(/[，、；。]/).some((p) => p.length >= 3 && existing.includes(p)))) return existing
  if (context.subject === 'math') return `在「${context.unit.title}」處理「${focus}」時，題目提供一組具體數量、單位與限制。請利用「${concept.title}」建立可以計算、畫圖、列表或估算檢查的數學關係。（情境 ${index + 1}）`
  if (context.subject === 'science') return `在「${context.unit.title}」探究「${focus}」時，學生留下可比較的觀察或量測紀錄，接著要用「${concept.title}」解釋現象，並把直接證據、模型與推測分開。（情境 ${index + 1}）`
  if (context.subject === 'social') return `在「${context.unit.title}」討論「${focus}」時，手上有不同時間、地點、來源或群體的資料，需要利用「${concept.title}」比較證據後再形成有限度結論。（情境 ${index + 1}）`
  if (context.subject === 'english') return `In “${context.unit.title}”, a learner communicates about ${focus}. The learner must use “${concept.title}” in a complete message and check speaker, time, purpose, meaning, form, and register. (Situation ${index + 1})`
  return `在「${context.unit.title}」處理「${focus}」的文本或表達任務時，學生要利用「${concept.title}」找出具體詞句、篇章結構或上下文線索，再說明線索如何支持判斷。（情境 ${index + 1}）`
}

function subjectSteps(context: UnitContext, concept: ReviewedConcept, scene: string) {
  if (context.subject === 'math') return [
    `先從「${compact(scene, 92)}」標出已知量、未知量、單位與限制。`,
    `把條件轉成和「${concept.title}」有關的式子、圖形、表格、數線或其他數學表示。`,
    '逐步完成推理或計算，確認每一步仍符合原始條件。',
    '用代回、估算、圖形、單位或合理範圍檢查結果，再回答原本情境。',
  ]
  if (context.subject === 'science') return [
    `把「${compact(scene, 92)}」中直接觀察或量到的結果和原因推測分開。`,
    `找出和「${concept.title}」相關的變因、量測方式、模型或可比較條件。`,
    '用資料或模型說明結果，也比較其他可能影響結果的條件。',
    '限制結論範圍：指出目前證據支持什麼，以及還不能宣稱什麼。',
  ]
  if (context.subject === 'social') return [
    `確認「${compact(scene, 92)}」的來源、時間、地點、尺度與群體。`,
    '把資料事實和原因解釋、價值判斷或政策選擇分開。',
    `利用「${concept.title}」比較至少兩項證據或觀點。`,
    '形成有限度結論，並說明換時間、地區、尺度或群體時哪些部分要重查。',
  ]
  if (context.subject === 'english') return [
    `Identify the speaker, purpose, time, and situation in “${compact(scene, 92)}”.`,
    `Use “${concept.title}” to connect meaning, form, word order, reference, and surrounding clues.`,
    'Try the expression as a complete message and compare it with another possible wording.',
    'Check that the final wording is both grammatical and natural for this situation.',
  ]
  return [
    `讀完整情境「${compact(scene, 92)}」，確認人物、事件、語氣、段落或表達目的。`,
    `找出能支持「${concept.title}」的實際詞句、結構或上下文線索。`,
    '說明線索如何支持意思、語氣、主旨或表達效果的判斷。',
    '回到全文檢查是否有其他線索反駁或限制這個解釋。',
  ]
}

function upgradeConcepts(context: UnitContext, source: ReviewedConcept[]) {
  const focus = compact(context.unit.focus, 150)
  return source.map((concept, index): ReviewedConcept => {
    const anchor = context.subject === 'english'
      ? `In “${context.unit.title}”, this idea is used while learning ${focus}.`
      : `在「${context.unit.title}」中，這個觀念要直接用來處理「${focus}」。`
    const method = context.subject === 'math'
      ? '重點是把條件轉成可檢查的數學表示，說明量與量的關係，再用計算、圖形或估算驗證。'
      : context.subject === 'science'
        ? '重點是把觀察、模型與推論分開，用可比較的證據支持解釋，並知道結論的適用範圍。'
        : context.subject === 'social'
          ? '重點是連同來源、時間、空間尺度與不同群體觀點判讀資料，不把單一證據誇大成唯一原因。'
          : context.subject === 'english'
            ? 'Connect meaning, form, word order, time clues, reference, and register so the language works as a complete message rather than an isolated rule.'
            : '重點是回到完整語境，指出實際詞句、篇章結構或表達線索，再說明線索如何支持判斷。'
    return {
      ...concept,
      explanation: ensureLength(`${anchor} ${concept.explanation} ${method}`, 72, method),
      example: ensureLength(scenario(context, concept, index), 26, anchor),
    }
  })
}

function correctAction(context: UnitContext, concept: ReviewedConcept) {
  if (context.subject === 'math') return `先確認量、單位與限制，再把它們轉成和「${concept.title}」一致的數學表示，完成推理後主動驗算。`
  if (context.subject === 'science') return `先找出和「${concept.title}」有關的可觀察證據、變因與控制條件，再用模型解釋並限制結論。`
  if (context.subject === 'social') return `先用「${concept.title}」整理資料事實與脈絡，再比較來源和觀點，最後形成不超出證據的結論。`
  if (context.subject === 'english') return `Use “${concept.title}” together with speaker, purpose, meaning, form, time clues, and register before choosing the final message.`
  return `先找出文本中能支持「${concept.title}」的具體詞句、篇章或語言線索，再說明線索如何支持判斷。`
}

function distractors(context: UnitContext, concept: ReviewedConcept, others: ReviewedConcept[]) {
  const other = others[0]?.title ?? context.unit.title
  if (context.subject === 'math') return [
    `看到「${concept.title}」就立刻套固定公式，不先確認量、單位與關係。`,
    `直接搬用「${other}」的做法，即使新情境條件已改變。`,
    '算出一個數字就停止，不檢查單位、範圍或是否回答原問題。',
  ]
  if (context.subject === 'science') return [
    `看到一次和「${concept.title}」相符的現象，就把同時發生直接當成因果。`,
    `把「${other}」的模型當成實物本身，不檢查適用尺度與條件。`,
    '先寫結論再挑支持資料，不比較其他可能改變結果的條件。',
  ]
  if (context.subject === 'social') return [
    `拿一份和「${concept.title}」有關的資料，就把它當成唯一原因。`,
    `把「${other}」的觀點當成所有群體都同意的事實，不檢查來源與立場。`,
    '還沒分清資料事實與價值選擇，就直接提出唯一政策答案。',
  ]
  if (context.subject === 'english') return [
    `Choose a sentence only because it contains words related to “${concept.title}”, without checking the situation.`,
    `Use the form connected with “${other}” even when speaker, time, or purpose is different.`,
    'Translate word by word and ignore whether the complete message sounds natural.',
  ]
  return [
    `看到「${concept.title}」相關關鍵字就決定意思或主旨，不讀完整前後文。`,
    `把「${other}」的說法套進來，卻沒有指出任何實際文本證據。`,
    '只寫個人感受，不說明篇章線索如何支持判斷。',
  ]
}

function makeChoice(context: UnitContext, id: string, level: ReviewedChoiceQuestion['level'], prompt: string, scene: string, concept: ReviewedConcept, rotation: number): EnhancedChoice {
  const correct = correctAction(context, concept)
  const choices = unique([correct, ...distractors(context, concept, [])]).slice(0, 4)
  while (choices.length < 4) choices.push(`這個做法仍缺少必要條件或證據 ${choices.length + 1}`)
  const options = rotate(choices, rotation)
  const correctIndex = options.indexOf(correct)
  const explanation = ensureLength(`${concept.explanation} 在這個情境中要先確認概念成立條件，再把具體線索連到判斷。`, 35, `請回到「${context.unit.title}」的實際條件重新檢查。`)
  return {
    id, kind: 'choice', level,
    context: ensureLength(scene, 24, `本題屬於「${context.unit.title}」：${context.unit.focus}`),
    prompt, options, correctIndex, explanation,
    optionFeedback: options.map((option) => option === correct
      ? `正確。這個做法先確認「${concept.title}」成立條件，再使用「${context.unit.title}」中的具體線索。`
      : `這個選項漏掉了條件、證據、表示方式或語境檢查；請回到題目線索確認「${concept.title}」是否真的適用。`),
  } as EnhancedChoice
}

function makeResponse(context: UnitContext, id: string, level: ReviewedResponseQuestion['level'], concept: ReviewedConcept, scene: string, index: number): EnhancedResponse {
  const steps = subjectSteps(context, concept, scene)
  const prompt = context.subject === 'math'
    ? `情境 ${index + 1}：請用「${concept.title}」建立表示、完成推理，並說明如何檢查「${context.unit.title}」這題的答案。`
    : context.subject === 'science'
      ? `情境 ${index + 1}：請用「${concept.title}」解釋「${context.unit.title}」中的現象，寫出至少兩項證據或控制條件與結論限制。`
      : context.subject === 'social'
        ? `情境 ${index + 1}：請用「${concept.title}」分析「${context.unit.title}」的資料，區分事實與解釋並形成有限度結論。`
        : context.subject === 'english'
          ? `Situation ${index + 1}: use “${concept.title}” in “${context.unit.title}”. Explain two clues that guide your wording and why the message fits.`
          : `情境 ${index + 1}：請用「${concept.title}」分析「${context.unit.title}」的文本，引用至少兩個具體線索並說明如何支持結論。`
  return {
    id, kind: 'response', level,
    context: ensureLength(scene, 28, `本單元範圍：${context.unit.focus}`),
    prompt,
    sampleAnswer: ensureLength(`${steps.join(' ')} 因此完整答案要讓別人能沿著證據、條件或表示方式重新檢查。`, 60, `最後回到「${context.unit.title}」確認結論。`),
    explanation: ensureLength(`這題檢查能否把「${concept.title}」真正用在「${context.unit.title}」的新情境，而不是只背定義。`, 32, `請重新核對「${context.unit.focus}」。`),
    rubric: context.subject === 'math'
      ? ['有整理已知量、未知量、單位或限制', `有正確使用「${concept.title}」建立表示並完成推理`, '有用代回、估算、圖形或範圍檢查答案']
      : context.subject === 'science'
        ? ['有區分直接觀察或量測與推論', `有使用「${concept.title}」連結至少兩項證據或控制條件`, '有說明結論能支持到哪裡及目前限制']
        : context.subject === 'social'
          ? ['有交代來源、時間、地點、尺度或群體脈絡', `有使用「${concept.title}」比較至少兩項證據或觀點`, '結論沒有把局部資料誇大成唯一答案']
          : context.subject === 'english'
            ? ['The response fits speaker, purpose, time, and situation', `The response uses “${concept.title}” accurately`, 'The explanation points to at least two concrete clues']
            : ['有指出至少兩個具體文本、結構或語言線索', `有用「${concept.title}」說明線索和判斷的關係`, '結論能回到完整語境檢查'],
  } as EnhancedResponse
}

function normalizeMediaQuestion(context: UnitContext, question: ReviewedQuestion, index: number): ReviewedQuestion | null {
  const extra = question as ReviewedQuestion & CurriculumQuestionEnhancement
  if (!extra.mediaAssetId && !extra.audioText) return null
  const scene = ensureLength(question.context, 28, `這是一題屬於「${context.unit.title}」的圖片或聽力情境，請同時使用素材和「${context.unit.focus}」的線索。`)
  if (question.kind === 'choice' && question.options.length === 4 && new Set(question.options.map((o) => o.trim())).size === 4) {
    const correct = question.options[question.correctIndex]
    if (!correct) return null
    return {
      ...question,
      id: `${context.unit.id}-ped-v17-media-choice-${index + 1}`,
      context: scene,
      explanation: ensureLength(question.explanation, 32, `請把素材線索和「${context.unit.title}」的學習重點逐項對照。`),
      optionFeedback: question.options.map((option) => option === correct
        ? `正確。這個選項同時符合素材線索和「${context.unit.title}」的判斷條件。`
        : `這個選項和素材中的部分線索或「${context.unit.title}」的條件不一致，請找出衝突再判斷。`),
    } as EnhancedChoice
  }
  if (question.kind === 'response') {
    return {
      ...question,
      id: `${context.unit.id}-ped-v17-media-response-${index + 1}`,
      context: scene,
      explanation: ensureLength(question.explanation, 32, `請把素材線索和「${context.unit.title}」的重點連起來。`),
      sampleAnswer: ensureLength(question.sampleAnswer, 55, `完整答案要指出素材中的具體證據，再用「${context.unit.focus}」說明證據如何支持結論。`),
      rubric: unique([...(extra.rubric ?? []), '有指出素材中的具體線索或證據。', '有把素材線索和本單元核心觀念正確連接。', '結論沒有超出素材與題目條件能支持的範圍。']).slice(0, 5),
    } as EnhancedResponse
  }
  return null
}

function buildPedagogyQuestions(context: UnitContext, concepts: ReviewedConcept[], source: ReviewedQuestion[]) {
  const selected = concepts.slice(0, 6)
  const questions: ReviewedQuestion[] = []

  selected.forEach((concept, index) => {
    const prompts = context.subject === 'english'
      ? [`Which action best uses “${concept.title}” in this “${context.unit.title}” situation?`, `What should be checked before applying “${concept.title}” here?`, `Which explanation keeps “${concept.title}” connected to the full context?`, `Which check best shows that “${concept.title}” was used appropriately?`]
      : [`在「${context.unit.title}」這個情境中，哪個做法最能正確使用「${concept.title}」？`, `處理這個「${concept.title}」情境時，最應先檢查哪件事？`, `在「${context.unit.title}」裡，哪個說明最能把「${concept.title}」和實際條件連起來？`, `要確認真的會用「${concept.title}」，下面哪個檢查最有意義？`]
    questions.push(makeChoice(context, `${context.unit.id}-ped-v17-check-${index + 1}`, index < 2 ? '理解' : '應用', prompts[index % 4], scenario(context, concept, index), concept, index))
  })

  selected.slice(0, 4).forEach((concept, index) => {
    const prompt = context.subject === 'english'
      ? `A learner misuses “${concept.title}” in “${context.unit.title}”. Which correction fixes the reasoning rather than only replacing the answer?`
      : `有同學在「${context.unit.title}」中誤用了「${concept.title}」。哪個修正最能指出錯在哪個條件或推理步驟？`
    questions.push(makeChoice(context, `${context.unit.id}-ped-v17-diagnose-${index + 1}`, '檢核', prompt, scenario(context, concept, index + 7), concept, index + 1))
  })

  selected.slice(0, 5).forEach((concept, index) => {
    questions.push(makeResponse(context, `${context.unit.id}-ped-v17-response-${index + 1}`, index === 0 ? '理解' : index === 4 ? '檢核' : '應用', concept, scenario(context, concept, index + 12), index))
  })

  source.forEach((question, index) => {
    if (questions.length >= 18) return
    const normalized = normalizeMediaQuestion(context, question, index)
    if (normalized) questions.push(normalized)
  })

  const seen = new Set<string>()
  const deduped = questions.filter((question) => {
    const key = question.prompt.toLowerCase().replace(/[\s，。！？；：,.!?;:'"「」『』（）()\-—]/g, '')
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })

  let cursor = 0
  while (deduped.length < 15 && selected.length) {
    const concept = selected[cursor % selected.length]
    const question = makeResponse(context, `${context.unit.id}-ped-v17-floor-${cursor + 1}`, '檢核', concept, `這是「${context.unit.title}」的延伸情境 ${cursor + 1}：${context.unit.focus}`, cursor + 30)
    const key = question.prompt.toLowerCase().replace(/[\s，。！？；：,.!?;:'"「」『』（）()\-—]/g, '')
    if (!seen.has(key)) { seen.add(key); deduped.push(question) }
    cursor += 1
    if (cursor > 20) break
  }
  return deduped
}

function upgradeExamples(context: UnitContext, concepts: ReviewedConcept[], _source: ReviewedWorkedExample[]) {
  return concepts.slice(0, 4).map((concept, index): ReviewedWorkedExample => {
    const scene = scenario(context, concept, index + 30)
    const prompt = context.subject === 'math'
      ? `在這個「${context.unit.title}」具體情境裡，如何用「${concept.title}」建立數學表示並得到可檢查的結果？`
      : context.subject === 'science'
        ? `這個「${context.unit.title}」現象可以如何用「${concept.title}」提出證據導向的解釋？`
        : context.subject === 'social'
          ? `如何利用「${concept.title}」從這個「${context.unit.title}」資料情境形成不超出證據的判斷？`
          : context.subject === 'english'
            ? `How would you use “${concept.title}” to understand or respond to this complete “${context.unit.title}” situation?`
            : `如何用「${concept.title}」從這個「${context.unit.title}」文本情境形成可回到文本檢查的判斷？`
    const answer = context.subject === 'english'
      ? `A strong answer follows the situation clues, applies “${concept.title}” to the complete message, and checks whether the wording remains accurate and natural within “${context.unit.title}”.`
      : `完整答案要把「${concept.title}」和「${context.unit.title}」的具體條件連起來，依步驟完成判斷，最後主動檢查答案、證據或結論是否超出「${context.unit.focus}」能支持的範圍。`
    return {
      title: `${context.unit.title}｜情境例題 ${index + 1}：${concept.title}`,
      context: ensureLength(scene, 32, `本題屬於「${context.unit.title}」：${context.unit.focus}`),
      prompt: ensureLength(prompt, 24, `請完整寫出處理「${concept.title}」的過程。`),
      steps: subjectSteps(context, concept, scene),
      answer: ensureLength(answer, 36, `最後要回到「${context.unit.title}」原始條件檢查。`),
      explanation: ensureLength(`這個例題把「${context.unit.focus}」轉成一條可重做的思考流程。即使數值、文本、資料或情境改變，也要能重新判斷，而不是複製最後答案。`, 45, '每一步都要能說明理由。'),
    }
  })
}

function transform(unit: TextbookUnitContentV14): TextbookUnitContentV14 {
  const context = resolveCurriculumUnit(unit.unitId)
  if (!context) return unit
  const concepts = upgradeConcepts(context, unit.concepts)
  return {
    ...unit,
    concepts,
    workedExamples: upgradeExamples(context, concepts, unit.workedExamples),
    questions: buildPedagogyQuestions(context, concepts, unit.questions),
    researchBasis: Array.from(new Set([...unit.researchBasis, 'Bubble Space V17 pedagogy：用單元具體情境重建題庫、例題與回饋，降低通用模板依賴，並支援概念後立即檢索練習。'])),
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
