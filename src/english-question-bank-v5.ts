import type { EnglishQuestion } from './english-data'
import { CEFR_BILINGUAL_COUNTS, CEFR_LEXICON, CEFR_LEVEL_COUNTS } from './generated/cefr-lexicon'
import type { GeneratedCefrEntry, GeneratedCefrLevel } from './generated/cefr-lexicon'
import { EXPANDED_ASSESSMENT_QUESTION_BANK } from './english-question-bank-v3'

const BASE_QUESTIONS_PER_ENTRY = 4
const BILINGUAL_QUESTIONS_PER_ENTRY = 2
const MIN_WORDS_PER_LEVEL = 1000
const MIN_BILINGUAL_CARDS_PER_LEVEL = 1000

const levelDifficulty: Record<GeneratedCefrLevel, number> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 5.8,
}

function cleanLetters(value: string) {
  return value.replace(/[^A-Za-z]/g, '').toLowerCase()
}

function spellingPattern(value: string) {
  return value
    .split(/(\s+|-)/)
    .map((part) => {
      const letters = part.replace(/[^A-Za-z]/g, '')
      if (letters.length <= 2) return part
      return `${part[0]}${'_'.repeat(Math.max(1, part.length - 2))}${part[part.length - 1]}`
    })
    .join('')
}

function seededNumber(seed: string) {
  let value = 2166136261
  for (let index = 0; index < seed.length; index += 1) {
    value ^= seed.charCodeAt(index)
    value = Math.imul(value, 16777619)
  }
  return Math.abs(value >>> 0)
}

function deterministicShuffle<T>(items: T[], seed: string) {
  const result = [...items]
  let value = seededNumber(seed)
  for (let index = result.length - 1; index > 0; index -= 1) {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0
    const swapIndex = value % (index + 1)
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }
  return result
}

function scrambleCue(entry: GeneratedCefrEntry) {
  const words = entry.word.trim().split(/\s+/)
  if (words.length > 1) {
    return deterministicShuffle(words, `${entry.id}:words`).join(' · ')
  }
  return deterministicShuffle(cleanLetters(entry.word).split(''), `${entry.id}:letters`).join(' · ')
}

function primaryTranslation(entry: GeneratedCefrEntry) {
  const lines = entry.translation
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^\[网络\]/.test(line))
  return (lines[0] ?? entry.translation.trim()).slice(0, 180)
}

const entriesByLevel = CEFR_LEXICON.reduce<Record<GeneratedCefrLevel, GeneratedCefrEntry[]>>(
  (record, entry) => {
    record[entry.level].push(entry)
    return record
  },
  { A1: [], A2: [], B1: [], B2: [], C1: [], C2: [] },
)

function recognitionChoices(entry: GeneratedCefrEntry) {
  const pool = entriesByLevel[entry.level]
  const targetLength = cleanLetters(entry.word).length
  const similar = pool.filter((candidate) => (
    candidate.id !== entry.id
    && Math.abs(cleanLetters(candidate.word).length - targetLength) <= 2
  ))
  const source = similar.length >= 3 ? similar : pool.filter((candidate) => candidate.id !== entry.id)
  const start = seededNumber(entry.id) % Math.max(1, source.length)
  const alternatives: string[] = []

  for (let offset = 0; alternatives.length < 3 && offset < source.length; offset += 1) {
    const candidate = source[(start + offset * 37) % source.length]
    if (candidate && !alternatives.some((word) => word.toLowerCase() === candidate.word.toLowerCase())) {
      alternatives.push(candidate.word)
    }
  }

  return deterministicShuffle([entry.word, ...alternatives], `${entry.id}:choices`)
}

function meaningChoices(entry: GeneratedCefrEntry) {
  const answer = primaryTranslation(entry)
  const source = entriesByLevel[entry.level].filter((candidate) => candidate.id !== entry.id && candidate.translation)
  const start = seededNumber(`${entry.id}:meaning`) % Math.max(1, source.length)
  const alternatives: string[] = []

  for (let offset = 0; alternatives.length < 3 && offset < source.length; offset += 1) {
    const candidate = source[(start + offset * 43) % source.length]
    if (!candidate) continue
    const meaning = primaryTranslation(candidate)
    if (meaning && meaning !== answer && !alternatives.includes(meaning)) alternatives.push(meaning)
  }

  return deterministicShuffle([answer, ...alternatives], `${entry.id}:meaning-choices`)
}

function baseQuestionsForEntry(entry: GeneratedCefrEntry, index: number): EnglishQuestion[] {
  const difficulty = levelDifficulty[entry.level]
  const metadata = `${entry.level} · ${entry.pos}${entry.topic ? ` · ${entry.topic}` : ''}`
  const explanation = `${entry.word} 收錄於 ${entry.source}，分級為 ${entry.level}。`

  return [
    {
      id: `cefr-listening-${index}-${entry.id}`,
      type: 'listening',
      skill: 'listening',
      difficulty,
      prompt: '播放後，輸入你聽到的單字或片語。',
      answer: entry.word,
      audioText: entry.word,
      context: metadata,
      explanation,
    },
    {
      id: `cefr-repair-${index}-${entry.id}`,
      type: 'typing',
      skill: 'spelling',
      difficulty: Math.min(6, difficulty + 0.05),
      prompt: `請依首尾字母完成拼字：${spellingPattern(entry.word)}`,
      answer: entry.word,
      context: metadata,
      explanation: `完整拼法是 ${entry.word}。${explanation}`,
    },
    {
      id: `cefr-unscramble-${index}-${entry.id}`,
      type: 'typing',
      skill: 'spelling',
      difficulty: Math.min(6, difficulty + 0.15),
      prompt: `重新排列成正確單字或片語：${scrambleCue(entry)}`,
      answer: entry.word,
      context: `${metadata} · 提示 ${spellingPattern(entry.word)}`,
      explanation: `正確排列是 ${entry.word}。${explanation}`,
    },
    {
      id: `cefr-recognition-${index}-${entry.id}`,
      type: 'choice',
      skill: 'recognition',
      difficulty: Math.max(1, difficulty - 0.1),
      prompt: `哪個單字或片語符合拼字線索「${spellingPattern(entry.word)}」？`,
      answer: entry.word,
      choices: recognitionChoices(entry),
      context: metadata,
      explanation,
    },
  ]
}

function bilingualQuestionsForEntry(entry: GeneratedCefrEntry, index: number): EnglishQuestion[] {
  if (!entry.translation) return []

  const difficulty = levelDifficulty[entry.level]
  const meaning = primaryTranslation(entry)
  const metadata = `${entry.level} · ${entry.pos}${entry.phonetic ? ` · /${entry.phonetic}/` : ''}`
  const explanation = `${entry.word}：${entry.translation}\n${entry.definition || `分級來源：${entry.source}`}`

  return [
    {
      id: `cefr-meaning-${index}-${entry.id}`,
      type: 'choice',
      skill: 'recognition',
      difficulty: Math.max(1, difficulty - 0.15),
      prompt: `「${entry.word}」在這張學習卡中最接近哪個中文意思？`,
      answer: meaning,
      choices: meaningChoices(entry),
      context: metadata,
      explanation,
    },
    {
      id: `cefr-target-recall-${index}-${entry.id}`,
      type: 'typing',
      skill: 'spelling',
      difficulty: Math.min(6, difficulty + 0.1),
      prompt: `請輸入本卡目標字：${meaning}`,
      answer: entry.word,
      context: `${metadata} · 首尾字母提示 ${spellingPattern(entry.word)}`,
      explanation: `本卡目標字是 ${entry.word}。${explanation}`,
    },
  ]
}

function questionsForEntry(entry: GeneratedCefrEntry, index: number): EnglishQuestion[] {
  return [
    ...baseQuestionsForEntry(entry, index),
    ...bilingualQuestionsForEntry(entry, index),
  ]
}

export const CEFR_PER_WORD_QUESTIONS: EnglishQuestion[] = CEFR_LEXICON.flatMap(questionsForEntry)

export const FULL_ASSESSMENT_QUESTION_BANK_V5: EnglishQuestion[] = [
  ...EXPANDED_ASSESSMENT_QUESTION_BANK,
  ...CEFR_PER_WORD_QUESTIONS,
]

export const PER_WORD_QUESTION_COVERAGE = {
  words: CEFR_LEXICON.length,
  baseQuestionsPerWord: BASE_QUESTIONS_PER_ENTRY,
  bilingualQuestionsPerWord: BILINGUAL_QUESTIONS_PER_ENTRY,
  generatedQuestions: CEFR_PER_WORD_QUESTIONS.length,
  richQuestions: EXPANDED_ASSESSMENT_QUESTION_BANK.length,
  totalQuestions: FULL_ASSESSMENT_QUESTION_BANK_V5.length,
  minimumWordsPerLevel: MIN_WORDS_PER_LEVEL,
  minimumBilingualCardsPerLevel: MIN_BILINGUAL_CARDS_PER_LEVEL,
  levelCounts: CEFR_LEVEL_COUNTS,
  bilingualCounts: CEFR_BILINGUAL_COUNTS,
  allLevelsMeetMinimum: Object.values(CEFR_LEVEL_COUNTS).every((count) => count >= MIN_WORDS_PER_LEVEL),
  allLevelsMeetBilingualMinimum: Object.values(CEFR_BILINGUAL_COUNTS).every((count) => count >= MIN_BILINGUAL_CARDS_PER_LEVEL),
}
