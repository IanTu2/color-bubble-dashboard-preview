import type { EnglishQuestion } from './english-data'
import { CEFR_LEXICON } from './generated/cefr-lexicon'
import { EXPANDED_ASSESSMENT_QUESTION_BANK } from './english-question-bank-v3'

const levelDifficulty = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 5.8,
} as const

const dynamicListeningQuestions: EnglishQuestion[] = CEFR_LEXICON.map((entry, index) => ({
  id: `cefr-listening-${index}-${entry.id}`,
  type: 'listening',
  skill: 'listening',
  difficulty: levelDifficulty[entry.level],
  prompt: '播放後，輸入你聽到的單字或片語。',
  answer: entry.word,
  audioText: entry.word,
  context: `${entry.level} · ${entry.pos}${entry.topic ? ` · ${entry.topic}` : ''}`,
  explanation: `${entry.word} 收錄於 ${entry.source}，分級為 ${entry.level}。`,
}))

export const FULL_ASSESSMENT_QUESTION_BANK: EnglishQuestion[] = [
  ...EXPANDED_ASSESSMENT_QUESTION_BANK,
  ...dynamicListeningQuestions,
]

export const FULL_ASSESSMENT_QUESTION_COUNT = FULL_ASSESSMENT_QUESTION_BANK.length
