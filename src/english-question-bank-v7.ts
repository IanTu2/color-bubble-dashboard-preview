import type { EnglishQuestion } from './english-data'
import { CEFR_LEXICON } from './generated/cefr-lexicon'
import type { GeneratedCefrEntry } from './generated/cefr-lexicon'
import {
  COMPLETE_QUESTION_COVERAGE,
  FULL_ASSESSMENT_QUESTION_BANK_V6,
} from './english-question-bank-v6'

function normalizeLookup(value: string) {
  return value.trim().toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ')
}

function compact(value: string, limit: number) {
  const cleaned = value.replace(/\r/g, '').replace(/\n+/g, '；').replace(/\s+/g, ' ').trim()
  return cleaned.length > limit ? `${cleaned.slice(0, limit).trim()}…` : cleaned
}

const lexiconByWord = CEFR_LEXICON.reduce<Map<string, GeneratedCefrEntry>>((map, entry) => {
  const key = normalizeLookup(entry.word)
  const current = map.get(key)
  const currentScore = current
    ? Number(Boolean(current.translation)) * 4 + Number(Boolean(current.definition)) * 2 + Number(Boolean(current.phonetic))
    : -1
  const nextScore = Number(Boolean(entry.translation)) * 4 + Number(Boolean(entry.definition)) * 2 + Number(Boolean(entry.phonetic))
  if (!current || nextScore > currentScore) map.set(key, entry)
  return map
}, new Map())

function listeningLearningFeedback(question: EnglishQuestion) {
  const entry = lexiconByWord.get(normalizeLookup(question.answer))
  if (!entry) return question.explanation

  const partOfSpeech = entry.dictionaryPos || entry.pos
  const lines = [
    `單字：${entry.word}${entry.phonetic ? ` /${entry.phonetic}/` : ''}`,
    entry.translation ? `中文：${compact(entry.translation, 320)}` : '',
    partOfSpeech ? `詞性：${compact(partOfSpeech, 100)} · CEFR ${entry.level}` : `CEFR：${entry.level}`,
    entry.definition ? `英文解釋：${compact(entry.definition, 320)}` : '',
    entry.exchange ? `詞形變化：${compact(entry.exchange, 220)}` : '',
    entry.topic ? `主題：${compact(entry.topic, 140)}` : '',
  ].filter(Boolean)

  return lines.join('\n')
}

function asksForMeaning(question: EnglishQuestion) {
  if (question.skill === 'reading') return false
  return /中文意思|哪個意思|最接近哪個意思|meaning/i.test(question.prompt)
}

function isCefrVocabularyQuestion(question: EnglishQuestion) {
  return question.id.startsWith('cefr-')
}

function shouldHideContextUntilAnswered(question: EnglishQuestion) {
  return question.skill === 'grammar'
    || question.skill === 'listening'
    || asksForMeaning(question)
    || isCefrVocabularyQuestion(question)
}

function makeAssessmentFair(question: EnglishQuestion): EnglishQuestion {
  if (!shouldHideContextUntilAnswered(question)) return question

  const hiddenContext = question.context?.trim()
  const explanation = question.skill === 'listening'
    ? listeningLearningFeedback(question)
    : [
        question.explanation,
        hiddenContext ? `作答後補充：${hiddenContext}` : '',
      ].filter(Boolean).join('\n')

  return {
    ...question,
    context: undefined,
    explanation,
  }
}

export const FULL_ASSESSMENT_QUESTION_BANK_V7: EnglishQuestion[] =
  FULL_ASSESSMENT_QUESTION_BANK_V6.map(makeAssessmentFair)

const preAnswerGrammarHints = FULL_ASSESSMENT_QUESTION_BANK_V7.filter(
  (question) => question.skill === 'grammar' && Boolean(question.context),
).length
const preAnswerListeningHints = FULL_ASSESSMENT_QUESTION_BANK_V7.filter(
  (question) => question.skill === 'listening' && Boolean(question.context),
).length
const preAnswerMeaningHints = FULL_ASSESSMENT_QUESTION_BANK_V7.filter(
  (question) => asksForMeaning(question) && Boolean(question.context),
).length
const preAnswerCefrMetadata = FULL_ASSESSMENT_QUESTION_BANK_V7.filter(
  (question) => isCefrVocabularyQuestion(question) && Boolean(question.context),
).length
const trivialSpellingChoiceQuestions = FULL_ASSESSMENT_QUESTION_BANK_V7.filter(
  (question) => (
    question.id.startsWith('cefr-recognition-')
    && question.type === 'choice'
    && (/拼字線索/.test(question.prompt) || /_{2,}/.test(question.prompt))
  ),
).length
const semanticSpellingCueMissing = FULL_ASSESSMENT_QUESTION_BANK_V7.filter(
  (question) => (
    (question.id.startsWith('cefr-repair-') || question.id.startsWith('cefr-unscramble-'))
    && question.type === 'typing'
    && !/中文意思：|英文解釋：/.test(question.prompt)
  ),
).length
const directAnswerPrompts = FULL_ASSESSMENT_QUESTION_BANK_V7.filter(
  (question) => (
    isCefrVocabularyQuestion(question)
    && question.type === 'typing'
    && normalizeLookup(question.prompt) === normalizeLookup(question.answer)
  ),
).length

const qualityFailureCount = preAnswerGrammarHints
  + preAnswerListeningHints
  + preAnswerMeaningHints
  + preAnswerCefrMetadata
  + trivialSpellingChoiceQuestions
  + semanticSpellingCueMissing
  + directAnswerPrompts

if (qualityFailureCount > 0) {
  throw new Error(
    [
      'Assessment quality validation failed',
      `grammarHints=${preAnswerGrammarHints}`,
      `listeningHints=${preAnswerListeningHints}`,
      `meaningHints=${preAnswerMeaningHints}`,
      `cefrMetadata=${preAnswerCefrMetadata}`,
      `trivialSpellingChoices=${trivialSpellingChoiceQuestions}`,
      `missingSemanticSpellingCues=${semanticSpellingCueMissing}`,
      `directAnswerPrompts=${directAnswerPrompts}`,
    ].join(', '),
  )
}

export const FAIR_ASSESSMENT_COVERAGE = {
  ...COMPLETE_QUESTION_COVERAGE,
  totalQuestions: FULL_ASSESSMENT_QUESTION_BANK_V7.length,
  preAnswerGrammarHints,
  preAnswerListeningHints,
  preAnswerMeaningHints,
  preAnswerCefrMetadata,
  trivialSpellingChoiceQuestions,
  semanticSpellingCueMissing,
  directAnswerPrompts,
}
