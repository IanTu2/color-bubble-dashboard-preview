import { ENGLISH_WORDS } from './english-data'
import type { EnglishWord } from './english-data'
import type { JourneyCourseId } from './english-journey'

export type ContextClozeItem = {
  id: string
  word: EnglishWord
  prompt: string
  fullSentence: string
  chineseSentence: string
  targetMeaning: string
  highlightedMeaning: string | null
}

const COURSE_KEYWORDS: Record<JourneyCourseId, string[]> = {
  general: [],
  travel: [
    'airport', 'arrive', 'book', 'bus', 'cancel', 'delay', 'food', 'hotel', 'leave', 'map',
    'order', 'passport', 'pay', 'restaurant', 'room', 'station', 'ticket', 'train', 'travel', 'trip',
  ],
  business: [
    'budget', 'client', 'company', 'confirm', 'deadline', 'decision', 'discuss', 'email', 'improve',
    'manager', 'meeting', 'plan', 'postpone', 'project', 'report', 'schedule', 'team', 'work',
  ],
  exam: [
    'analyze', 'compare', 'conclude', 'evidence', 'explain', 'infer', 'interpret', 'reason', 'result',
    'study', 'summarize', 'understand',
  ],
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function wordPattern(word: string) {
  const escaped = escapeRegExp(word.trim())
  return new RegExp(`\\b${escaped}\\b`, 'i')
}

function meaningParts(value: string) {
  return value
    .split(/[；;、,/]|\s+or\s+/i)
    .map((item) => item.trim().replace(/^\([^)]*\)\s*/, ''))
    .filter(Boolean)
}

function findHighlightedMeaning(word: EnglishWord) {
  return meaningParts(word.meaning)
    .sort((left, right) => right.length - left.length)
    .find((item) => word.exampleZh.includes(item)) ?? null
}

function buildItem(word: EnglishWord): ContextClozeItem | null {
  const pattern = wordPattern(word.word)
  if (!pattern.test(word.example)) return null

  const highlightedMeaning = findHighlightedMeaning(word)
  return {
    id: `context-${word.id}`,
    word,
    prompt: word.example.replace(pattern, '_____'),
    fullSentence: word.example,
    chineseSentence: word.exampleZh,
    targetMeaning: highlightedMeaning ?? meaningParts(word.meaning)[0] ?? word.meaning,
    highlightedMeaning,
  }
}

function hashString(value: string) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function coursePriority(item: ContextClozeItem, course: JourneyCourseId) {
  if (course === 'general') return 0
  const searchable = [
    item.word.word,
    item.word.meaning,
    item.word.definition,
    item.word.example,
    item.word.collocations.join(' '),
  ].join(' ').toLowerCase()
  return COURSE_KEYWORDS[course].some((keyword) => searchable.includes(keyword)) ? 0 : 1
}

export const CONTEXT_CLOZE_ITEMS = ENGLISH_WORDS
  .map(buildItem)
  .filter((item): item is ContextClozeItem => Boolean(item))

export const CONTEXT_CLOZE_BY_WORD = new Map(
  CONTEXT_CLOZE_ITEMS.map((item) => [item.word.word.trim().toLowerCase(), item]),
)

export function selectContextClozeItems(
  level: number,
  course: JourneyCourseId,
  seed: string,
  count: number,
) {
  const nearLevel = CONTEXT_CLOZE_ITEMS.filter((item) => Math.abs(item.word.level - level) <= 1)
  const pool = nearLevel.length >= count ? nearLevel : CONTEXT_CLOZE_ITEMS

  return [...pool]
    .sort((left, right) => {
      const courseDifference = coursePriority(left, course) - coursePriority(right, course)
      if (courseDifference !== 0) return courseDifference

      const levelDifference = Math.abs(left.word.level - level) - Math.abs(right.word.level - level)
      if (levelDifference !== 0) return levelDifference

      return hashString(`${seed}-${left.id}`) - hashString(`${seed}-${right.id}`)
    })
    .slice(0, count)
}

function editDistance(left: string, right: string) {
  const matrix = Array.from({ length: left.length + 1 }, () => Array<number>(right.length + 1).fill(0))
  for (let row = 0; row <= left.length; row += 1) matrix[row][0] = row
  for (let column = 0; column <= right.length; column += 1) matrix[0][column] = column

  for (let row = 1; row <= left.length; row += 1) {
    for (let column = 1; column <= right.length; column += 1) {
      const cost = left[row - 1] === right[column - 1] ? 0 : 1
      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + cost,
      )
    }
  }

  return matrix[left.length][right.length]
}

export function contextClozeAnswerScore(answer: string, expected: string) {
  const normalized = answer.trim().toLowerCase().replace(/[.!?]+$/g, '').replace(/\s+/g, ' ')
  const target = expected.trim().toLowerCase().replace(/[.!?]+$/g, '').replace(/\s+/g, ' ')
  if (normalized === target) return 1
  if (target.length >= 5 && editDistance(normalized, target) === 1) return 0.5
  return 0
}
