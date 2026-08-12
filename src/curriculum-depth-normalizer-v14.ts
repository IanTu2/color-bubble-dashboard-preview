import type { FoundationUnitContent } from './curriculum-foundation-content'
import type { CurriculumQuestionEnhancement } from './curriculum-foundation-question-bank-v12'
import type {
  ReviewedChoiceQuestion,
  ReviewedQuestion,
  ReviewedResponseQuestion,
} from './curriculum-reviewed-social10'

type EnhancedChoice = ReviewedChoiceQuestion & CurriculumQuestionEnhancement
type EnhancedResponse = ReviewedResponseQuestion & CurriculumQuestionEnhancement

function normalizedPrompt(value: string) {
  return value.replace(/\s+/g, ' ').trim().toLowerCase()
}

function uniqueQuestions(questions: ReviewedQuestion[]) {
  const ids = new Set<string>()
  const prompts = new Set<string>()
  return questions.filter((question) => {
    const prompt = normalizedPrompt(question.prompt)
    if (!question.id || ids.has(question.id) || !prompt || prompts.has(prompt)) return false
    ids.add(question.id)
    prompts.add(prompt)
    return true
  })
}

function conceptOptions(unit: FoundationUnitContent, correctTitle: string, seed: number) {
  const titles = unit.concepts.map((item) => item.title).filter((title, index, all) => title && all.indexOf(title) === index)
  const wrong = titles.filter((title) => title !== correctTitle)
  const start = wrong.length ? seed % wrong.length : 0
  const rotated = wrong.length ? [...wrong.slice(start), ...wrong.slice(0, start)] : []
  const distractors = rotated.slice(0, 3)
  while (distractors.length < 3) distractors.push(`不符合這段說明的其他判斷 ${distractors.length + 1}`)
  return [correctTitle, ...distractors]
}

function supplementalChoice(unit: FoundationUnitContent, index: number): EnhancedChoice {
  const concept = unit.concepts[index % unit.concepts.length]
  const english = unit.subject === 'english'
  return {
    id: `${unit.unitId}-v14-balance-choice-${index + 1}`,
    kind: 'choice',
    level: index % 2 === 0 ? '理解' : '應用',
    context: concept.explanation,
    prompt: english
      ? `Checkpoint ${index + 1}: Which concept best matches the teaching note above?`
      : `概念檢核 ${index + 1}：上面的教材說明最符合哪一個概念？`,
    options: conceptOptions(unit, concept.title, index),
    correctIndex: 0,
    explanation: english
      ? `The teaching note explains “${concept.title}”. Use the whole description, not one isolated word.`
      : `題幹完整說明的是「${concept.title}」。判斷時要看整段關係，而不是只抓一個關鍵字。`,
    optionFeedback: english
      ? ['Correct: the full description matches this concept.', 'This is another unit concept, but it does not match the full note.', 'This is another unit concept, but it does not match the full note.', 'This option does not match the full teaching note.']
      : ['正確：完整說明與這個概念一致。', '這是同單元概念，但不是上方說明的主要關係。', '這是同單元概念，但不是上方說明的主要關係。', '這個選項沒有對應上方的完整說明。'],
  }
}

function supplementalResponse(unit: FoundationUnitContent, index: number): EnhancedResponse {
  const concept = unit.concepts[index % unit.concepts.length]
  const english = unit.subject === 'english'
  return {
    id: `${unit.unitId}-v14-balance-response-${index + 1}`,
    kind: 'response',
    level: '應用',
    context: concept.example ?? concept.explanation,
    prompt: english
      ? `Transfer check ${index + 1}: Explain “${concept.title}” in your own words and create one new example.`
      : `轉述檢核 ${index + 1}：請用自己的話說明「${concept.title}」，並舉一個新的例子。`,
    sampleAnswer: english
      ? `A complete response states the key relationship in “${concept.title}” and gives a different situation that still follows the same relationship or language purpose.`
      : `完整答案要說出「${concept.title}」的核心關係，再提供不同於教材原例的新情境，並指出新例子為什麼符合這個概念。`,
    explanation: english
      ? 'This checks whether the learner can reconstruct and transfer the idea instead of copying the model.'
      : '這題確認學生能重新組織概念並轉移到新情境，而不是照抄示範。',
    rubric: english
      ? ['Core relationship is accurate', 'Example is genuinely new', 'Connection between example and concept is explained']
      : ['核心關係正確', '例子確實是新的', '有說明例子和概念的連結'],
  }
}

export function normalizeFoundationDepthV14(unit: FoundationUnitContent): FoundationUnitContent {
  const questions = uniqueQuestions(unit.questions)
  let choiceCount = questions.filter((item) => item.kind === 'choice').length
  let responseCount = questions.filter((item) => item.kind === 'response').length
  let choiceCursor = 0
  let responseCursor = 0

  while (choiceCount < 6) {
    const candidate = supplementalChoice(unit, choiceCursor++)
    if (!questions.some((item) => normalizedPrompt(item.prompt) === normalizedPrompt(candidate.prompt))) {
      questions.push(candidate)
      choiceCount += 1
    }
  }

  while (responseCount < 2) {
    const candidate = supplementalResponse(unit, responseCursor++)
    if (!questions.some((item) => normalizedPrompt(item.prompt) === normalizedPrompt(candidate.prompt))) {
      questions.push(candidate)
      responseCount += 1
    }
  }

  while (questions.length < 12) {
    const candidate = supplementalChoice(unit, choiceCursor++)
    if (!questions.some((item) => normalizedPrompt(item.prompt) === normalizedPrompt(candidate.prompt))) questions.push(candidate)
  }

  return { ...unit, questions }
}
