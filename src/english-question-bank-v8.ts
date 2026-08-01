import type { EnglishQuestion } from './english-data'
import {
  FAIR_ASSESSMENT_COVERAGE,
  FULL_ASSESSMENT_QUESTION_BANK_V7,
} from './english-question-bank-v7'

function fillGrammarBlank(sentence: string, value: string) {
  return sentence.replace(/_{3,}/, value)
}

function unique(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)))
}

const questionById = new Map(
  FULL_ASSESSMENT_QUESTION_BANK_V7.map((question) => [question.id, question]),
)

let convertedGrammarClozeCount = 0
let removedAmbiguousGrammarClozeCount = 0

function makeGrammarQuestionUnambiguous(question: EnglishQuestion): EnglishQuestion | null {
  if (question.skill !== 'grammar' || question.type !== 'cloze') return question

  const siblingChoiceId = question.id.replace(/-cloze$/, '-choice')
  const siblingChoice = questionById.get(siblingChoiceId)
  const sourceChoices = siblingChoice?.choices

  if (!sourceChoices || sourceChoices.length < 2 || !/_{3,}/.test(question.prompt)) {
    removedAmbiguousGrammarClozeCount += 1
    return null
  }

  const fullSentenceChoices = unique(
    sourceChoices.map((choice) => fillGrammarBlank(question.prompt, choice)),
  )
  const fullAnswer = fillGrammarBlank(question.prompt, question.answer)

  if (fullSentenceChoices.length < 2 || !fullSentenceChoices.includes(fullAnswer)) {
    removedAmbiguousGrammarClozeCount += 1
    return null
  }

  convertedGrammarClozeCount += 1
  return {
    ...question,
    type: 'choice',
    prompt: '哪個完整句子在文法與語意上最合適？',
    answer: fullAnswer,
    choices: fullSentenceChoices,
    context: undefined,
  }
}

export const FULL_ASSESSMENT_QUESTION_BANK_V8: EnglishQuestion[] =
  FULL_ASSESSMENT_QUESTION_BANK_V7
    .map(makeGrammarQuestionUnambiguous)
    .filter((question): question is EnglishQuestion => Boolean(question))

const remainingFreeTextGrammarCloze = FULL_ASSESSMENT_QUESTION_BANK_V8.filter(
  (question) => question.skill === 'grammar' && question.type === 'cloze',
).length

const invalidGrammarChoiceAnswers = FULL_ASSESSMENT_QUESTION_BANK_V8.filter(
  (question) => question.skill === 'grammar'
    && question.type === 'choice'
    && (!question.choices || !question.choices.includes(question.answer)),
).length

const pluralQuestion = FULL_ASSESSMENT_QUESTION_BANK_V8.find(
  (question) => question.id === 'grammar-expanded-a1-plural-cloze',
)

const pluralQuestionFixed = Boolean(
  pluralQuestion
    && pluralQuestion.type === 'choice'
    && pluralQuestion.choices?.includes('We bought three tomatoes at the market.')
    && pluralQuestion.answer === 'We bought three tomatoes at the market.',
)

if (remainingFreeTextGrammarCloze > 0 || invalidGrammarChoiceAnswers > 0 || !pluralQuestionFixed) {
  throw new Error(
    `Ambiguous grammar assessment detected: freeTextCloze=${remainingFreeTextGrammarCloze}, invalidChoiceAnswers=${invalidGrammarChoiceAnswers}, pluralQuestionFixed=${pluralQuestionFixed}`,
  )
}

export const UNAMBIGUOUS_GRAMMAR_COVERAGE = {
  ...FAIR_ASSESSMENT_COVERAGE,
  totalQuestions: FULL_ASSESSMENT_QUESTION_BANK_V8.length,
  convertedGrammarClozeCount,
  removedAmbiguousGrammarClozeCount,
  remainingFreeTextGrammarCloze,
  invalidGrammarChoiceAnswers,
  pluralQuestionFixed,
}
