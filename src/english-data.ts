export type EnglishGoal = 'daily' | 'work' | 'travel' | 'exam' | 'tech'
export type EnglishAccent = 'en-US' | 'en-GB' | 'mixed'
export type EnglishSkill = 'recognition' | 'spelling' | 'grammar' | 'reading' | 'listening'
export type EnglishQuestionType = 'choice' | 'typing' | 'cloze' | 'listening' | 'correction'

export type EnglishWord = {
  id: string
  word: string
  meaning: string
  partOfSpeech: string
  level: number
  phoneticUS: string
  phoneticUK: string
  definition: string
  morphology: string[]
  memory: string
  synonyms: string[]
  antonyms: string[]
  confused: string[]
  collocations: string[]
  example: string
  exampleZh: string
}

export type EnglishQuestion = {
  id: string
  type: EnglishQuestionType
  skill: EnglishSkill
  difficulty: number
  prompt: string
  answer: string
  choices?: string[]
  audioText?: string
  context?: string
  explanation: string
}

export { EXPANDED_ENGLISH_WORDS as ENGLISH_WORDS } from './english-expanded-data'

export const ENGLISH_QUESTIONS: EnglishQuestion[] = []
