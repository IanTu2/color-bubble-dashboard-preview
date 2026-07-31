import type { EnglishQuestion } from './english-data'
import { GRAMMAR_READING_QUESTION_BANK, GRAMMAR_READING_COVERAGE } from './english-grammar-reading-bank'
import { FULL_ASSESSMENT_QUESTION_BANK_V5, PER_WORD_QUESTION_COVERAGE } from './english-question-bank-v5'

export const FULL_ASSESSMENT_QUESTION_BANK_V6: EnglishQuestion[] = [
  ...FULL_ASSESSMENT_QUESTION_BANK_V5,
  ...GRAMMAR_READING_QUESTION_BANK,
]

export const COMPLETE_QUESTION_COVERAGE = {
  vocabularyAndBilingual: PER_WORD_QUESTION_COVERAGE,
  grammarAndReading: GRAMMAR_READING_COVERAGE,
  totalQuestions: FULL_ASSESSMENT_QUESTION_BANK_V6.length,
  grammarQuestions: GRAMMAR_READING_COVERAGE.grammarQuestions,
  longReadingPassages: GRAMMAR_READING_COVERAGE.readingPassages,
  longReadingQuestions: GRAMMAR_READING_COVERAGE.readingQuestions,
}
