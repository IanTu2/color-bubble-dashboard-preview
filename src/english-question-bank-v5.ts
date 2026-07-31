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

function compactCue(value: string, limit = 220) {
  const cleaned = value.replace(/\r/g, '').replace(/\n+/g, '；').replace(/\s+/g, ' ').trim()
  return cleaned.length > limit ? `${cleaned.slice(0, limit).trim()}…` : cleaned
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
  return compactCue(lines[0] ?? entry.translation.trim(), 180)
}

function semanticCue(entry: GeneratedCefrEntry) {
  const meaning = primaryTranslation(entry)
  if (meaning) return `中文意思：${meaning}`

  const definition = compactCue(entry.definition)
  if (definition) return `英文解釋：${definition}`

  return null
}

function partOfSpeechKey(entry: GeneratedCefrEntry) {
  const value = `${entry.dictionaryPos || ''} ${entry.pos || ''}`.toLowerCase()
  if (value.includes('noun') || /(^|[\s;,/])n\./.test(value)) return 'noun'
  if (value.includes('verb') || /(^|[\s;,/])v\./.test(value)) return 'verb'
  if (value.includes('adjective') || value.includes('adj.')) return 'adjective'
  if (value.includes('adverb') || value.includes('adv.')) return 'adverb'
  if (value.includes('preposition') || value.includes('prep.')) return 'preposition'
  if (value.includes('pronoun') || value.includes('pron.')) return 'pronoun'
  if (value.includes('conjunction') || value.includes('conj.')) return 'conjunction'
  if (value.includes('phrase') || entry.word.trim().includes(' ')) return 'phrase'
  return value.split(/[\s;,/]+/).find(Boolean) ?? 'other'
}

const entriesByLevel = CEFR_LEXICON.reduce<Record<GeneratedCefrLevel, GeneratedCefrEntry[]>>(
  (record, entry) => {
    record[entry.level].push(entry)
    return record
  },
  { A1: [], A2: [], B1: [], B2: [], C1: [], C2: [] },
)

function orderedDistractorPool(entry: GeneratedCefrEntry, requireTranslation = false) {
  const targetPos = partOfSpeechKey(entry)
  const targetTopic = entry.topic.trim().toLowerCase()
  const pool = entriesByLevel[entry.level].filter((candidate) => (
    candidate.id !== entry.id
    && (!requireTranslation || Boolean(primaryTranslation(candidate)))
  ))

  const groups = [
    pool.filter((candidate) => partOfSpeechKey(candidate) === targetPos && Boolean(targetTopic) && candidate.topic.trim().toLowerCase() === targetTopic),
    pool.filter((candidate) => partOfSpeechKey(candidate) === targetPos),
    pool.filter((candidate) => Boolean(targetTopic) && candidate.topic.trim().toLowerCase() === targetTopic),
    pool,
  ]

  const seen = new Set<string>()
  return groups.flatMap((group) => group.filter((candidate) => {
    const key = candidate.word.trim().toLowerCase()
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  }))
}

function recognitionChoices(entry: GeneratedCefrEntry) {
  const source = orderedDistractorPool(entry)
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
  const source = orderedDistractorPool(entry, true)
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

function entryExplanation(entry: GeneratedCefrEntry) {
  return [
    `${entry.word} 收錄於 ${entry.source}，分級為 ${entry.level}。`,
    entry.translation ? `中文：${compactCue(entry.translation, 320)}` : '',
    entry.definition ? `英文解釋：${compactCue(entry.definition, 320)}` : '',
  ].filter(Boolean).join('\n')
}

function listeningQuestion(
  entry: GeneratedCefrEntry,
  id: string,
  difficulty: number,
  prompt: string,
): EnglishQuestion {
  return {
    id,
    type: 'listening',
    skill: 'listening',
    difficulty,
    prompt,
    answer: entry.word,
    audioText: entry.word,
    explanation: entryExplanation(entry),
  }
}

function baseQuestionsForEntry(entry: GeneratedCefrEntry, index: number): EnglishQuestion[] {
  const difficulty = levelDifficulty[entry.level]
  const metadata = `${entry.level} · ${entry.pos}${entry.topic ? ` · ${entry.topic}` : ''}`
  const cue = semanticCue(entry)
  const listening = listeningQuestion(
    entry,
    `cefr-listening-${index}-${entry.id}`,
    difficulty,
    '播放後，輸入你聽到的完整單字或片語。',
  )

  if (!cue) {
    return [
      listening,
      listeningQuestion(
        entry,
        `cefr-repair-${index}-${entry.id}`,
        Math.min(6, difficulty + 0.05),
        '再次播放發音，完整輸入你聽到的單字或片語。',
      ),
      listeningQuestion(
        entry,
        `cefr-unscramble-${index}-${entry.id}`,
        Math.min(6, difficulty + 0.15),
        '仔細分辨每個音節，輸入完整拼字。',
      ),
      listeningQuestion(
        entry,
        `cefr-recognition-${index}-${entry.id}`,
        Math.max(1, difficulty - 0.1),
        '播放發音後，輸入完整內容；不要只填部分字母。',
      ),
    ]
  }

  const explanation = entryExplanation(entry)

  return [
    listening,
    {
      id: `cefr-repair-${index}-${entry.id}`,
      type: 'typing',
      skill: 'spelling',
      difficulty: Math.min(6, difficulty + 0.05),
      prompt: `請依語意與拼字格完成單字或片語：\n${cue}\n拼字格：${spellingPattern(entry.word)}`,
      answer: entry.word,
      context: metadata,
      explanation: `完整拼法是 ${entry.word}。\n${explanation}`,
    },
    {
      id: `cefr-unscramble-${index}-${entry.id}`,
      type: 'typing',
      skill: 'spelling',
      difficulty: Math.min(6, difficulty + 0.15),
      prompt: `請依語意重新排列成正確單字或片語：\n${cue}\n字母／詞序：${scrambleCue(entry)}`,
      answer: entry.word,
      context: metadata,
      explanation: `正確排列是 ${entry.word}。\n${explanation}`,
    },
    {
      id: `cefr-recognition-${index}-${entry.id}`,
      type: 'choice',
      skill: 'recognition',
      difficulty: Math.max(1, difficulty - 0.1),
      prompt: `哪個單字或片語最符合以下內容？\n${cue}`,
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
      prompt: `請依中文意思輸入本卡目標字：\n中文意思：${meaning}`,
      answer: entry.word,
      context: metadata,
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
