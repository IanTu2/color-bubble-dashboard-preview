import type { EnglishQuestion } from './english-data'
import type { GeneratedCefrLevel } from './generated/cefr-lexicon'

export type EnglishGameTrackV7 = 'mix' | 'vocabulary' | 'grammar' | 'listening' | 'speaking'
export type EnglishGameReviewSourceV7 = 'word' | 'grammar'

export type EnglishGameReviewRefV7 = {
  key: string
  source: EnglishGameReviewSourceV7
  refId: string
  level: GeneratedCefrLevel
  label: string
}

export type EnglishGameReviewRecordV7 = EnglishGameReviewRefV7 & {
  dueAt: string
  intervalDays: number
  correctStreak: number
  lapses: number
  lastScore: number
  lastSeenAt: string
}

export type EnglishGameMemoryV7 = {
  version: 1
  reviews: EnglishGameReviewRecordV7[]
  sessions: number
  totalXp: number
  sessionStreak: number
  lastSessionDate: string | null
  lastSessionAt: string | null
}

const DAY_MS = 86_400_000
const HOUR_MS = 3_600_000
const EXACT_INTERVALS = [1, 3, 7, 14, 30, 60]

export function emptyEnglishGameMemoryV7(): EnglishGameMemoryV7 {
  return {
    version: 1,
    reviews: [],
    sessions: 0,
    totalXp: 0,
    sessionStreak: 0,
    lastSessionDate: null,
    lastSessionAt: null,
  }
}

function finiteNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function levelValue(value: unknown): GeneratedCefrLevel {
  return ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(String(value)) ? value as GeneratedCefrLevel : 'A2'
}

export function sanitizeEnglishGameMemoryV7(value: unknown): EnglishGameMemoryV7 {
  if (!value || typeof value !== 'object') return emptyEnglishGameMemoryV7()
  const source = value as Partial<EnglishGameMemoryV7> & { reviews?: unknown }
  const reviews = Array.isArray(source.reviews)
    ? source.reviews.flatMap((raw) => {
        if (!raw || typeof raw !== 'object') return []
        const item = raw as Partial<EnglishGameReviewRecordV7>
        if (!item.key || !item.refId || !item.label || !['word', 'grammar'].includes(String(item.source))) return []
        const dueTime = Date.parse(String(item.dueAt ?? ''))
        const seenTime = Date.parse(String(item.lastSeenAt ?? ''))
        return [{
          key: String(item.key),
          source: item.source as EnglishGameReviewSourceV7,
          refId: String(item.refId),
          level: levelValue(item.level),
          label: String(item.label),
          dueAt: new Date(Number.isFinite(dueTime) ? dueTime : 0).toISOString(),
          intervalDays: Math.max(0, finiteNumber(item.intervalDays)),
          correctStreak: Math.max(0, Math.floor(finiteNumber(item.correctStreak))),
          lapses: Math.max(0, Math.floor(finiteNumber(item.lapses))),
          lastScore: Math.max(0, Math.min(1, finiteNumber(item.lastScore))),
          lastSeenAt: new Date(Number.isFinite(seenTime) ? seenTime : 0).toISOString(),
        }]
      })
    : []

  const deduped = new Map<string, EnglishGameReviewRecordV7>()
  for (const item of reviews) {
    const existing = deduped.get(item.key)
    if (!existing || Date.parse(item.lastSeenAt) >= Date.parse(existing.lastSeenAt)) deduped.set(item.key, item)
  }

  return {
    version: 1,
    reviews: [...deduped.values()],
    sessions: Math.max(0, Math.floor(finiteNumber(source.sessions))),
    totalXp: Math.max(0, Math.floor(finiteNumber(source.totalXp))),
    sessionStreak: Math.max(0, Math.floor(finiteNumber(source.sessionStreak))),
    lastSessionDate: typeof source.lastSessionDate === 'string' ? source.lastSessionDate : null,
    lastSessionAt: typeof source.lastSessionAt === 'string' ? source.lastSessionAt : null,
  }
}

export function englishGameMemoryStorageKeyV7(userId: string) {
  return `bubble-space-v2-english-${userId}-game-v7-memory`
}

export function readEnglishGameMemoryV7(userId: string): EnglishGameMemoryV7 {
  if (typeof window === 'undefined') return emptyEnglishGameMemoryV7()
  try {
    const raw = window.localStorage.getItem(englishGameMemoryStorageKeyV7(userId))
    return raw ? sanitizeEnglishGameMemoryV7(JSON.parse(raw)) : emptyEnglishGameMemoryV7()
  } catch {
    return emptyEnglishGameMemoryV7()
  }
}

export function writeEnglishGameMemoryV7(userId: string, memory: EnglishGameMemoryV7) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(englishGameMemoryStorageKeyV7(userId), JSON.stringify(memory))
  } catch {
    // Learning can continue even if browser storage is unavailable.
  }
}

export function reviewMatchesTrackV7(record: EnglishGameReviewRecordV7, track: EnglishGameTrackV7) {
  if (track === 'mix') return true
  if (track === 'grammar') return record.source === 'grammar'
  return record.source === 'word'
}

export function dueEnglishGameReviewsV7(memory: EnglishGameMemoryV7, track: EnglishGameTrackV7 = 'mix', nowMs = Date.now()) {
  return memory.reviews
    .filter((item) => reviewMatchesTrackV7(item, track) && Date.parse(item.dueAt) <= nowMs)
    .sort((left, right) => Date.parse(left.dueAt) - Date.parse(right.dueAt) || left.lastScore - right.lastScore)
}

export function nextDueEnglishGameReviewV7(
  memory: EnglishGameMemoryV7,
  track: EnglishGameTrackV7,
  excludedKeys: Set<string> = new Set(),
  nowMs = Date.now(),
) {
  return dueEnglishGameReviewsV7(memory, track, nowMs).find((item) => !excludedKeys.has(item.key)) ?? null
}

export function nextScheduledReviewAtV7(memory: EnglishGameMemoryV7) {
  if (!memory.reviews.length) return null
  return [...memory.reviews].sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt))[0]?.dueAt ?? null
}

export function scheduleEnglishGameReviewV7(
  memory: EnglishGameMemoryV7,
  ref: EnglishGameReviewRefV7,
  score: number,
  nowMs = Date.now(),
): EnglishGameMemoryV7 {
  const normalizedScore = Math.max(0, Math.min(1, score))
  const previous = memory.reviews.find((item) => item.key === ref.key)
  let correctStreak = previous?.correctStreak ?? 0
  let intervalDays = previous?.intervalDays ?? 0
  let dueMs = nowMs + DAY_MS
  let lapses = previous?.lapses ?? 0

  if (normalizedScore === 1) {
    correctStreak += 1
    intervalDays = EXACT_INTERVALS[Math.min(EXACT_INTERVALS.length - 1, correctStreak - 1)]
    dueMs = nowMs + intervalDays * DAY_MS
  } else if (normalizedScore >= 0.75) {
    correctStreak = Math.max(1, correctStreak)
    intervalDays = 1
    dueMs = nowMs + DAY_MS
  } else if (normalizedScore >= 0.5) {
    correctStreak = 0
    intervalDays = 0
    lapses += 1
    dueMs = nowMs + 12 * HOUR_MS
  } else {
    correctStreak = 0
    intervalDays = 0
    lapses += 1
    dueMs = nowMs + 4 * HOUR_MS
  }

  const record: EnglishGameReviewRecordV7 = {
    ...ref,
    dueAt: new Date(dueMs).toISOString(),
    intervalDays,
    correctStreak,
    lapses,
    lastScore: normalizedScore,
    lastSeenAt: new Date(nowMs).toISOString(),
  }

  return {
    ...memory,
    reviews: [...memory.reviews.filter((item) => item.key !== ref.key), record],
  }
}

export function completeEnglishGameSessionV7(memory: EnglishGameMemoryV7, xp: number, nowMs = Date.now()): EnglishGameMemoryV7 {
  const today = new Date(nowMs).toISOString().slice(0, 10)
  const yesterday = new Date(nowMs - DAY_MS).toISOString().slice(0, 10)
  const streak = memory.lastSessionDate === today
    ? memory.sessionStreak
    : memory.lastSessionDate === yesterday
      ? memory.sessionStreak + 1
      : 1
  return {
    ...memory,
    sessions: memory.sessions + 1,
    totalXp: memory.totalXp + Math.max(0, Math.round(xp)),
    sessionStreak: streak,
    lastSessionDate: today,
    lastSessionAt: new Date(nowMs).toISOString(),
  }
}

export function grammarBaseIdV7(questionId: string) {
  return questionId.replace(/-(cloze|choice|correction)$/i, '')
}

export function completeGrammarSentenceV7(question: EnglishQuestion) {
  const answer = String(question.answer ?? '').trim().replace(/[.!?]+$/g, '')
  if (!answer) return null
  if (question.type === 'correction' || question.id.endsWith('-correction')) {
    return answer.split(/\s+/).length >= 3 ? answer : null
  }

  const lines = String(question.prompt ?? '').split(/\n/).map((line) => line.trim()).filter(Boolean)
  const sentence = [...lines].reverse().find((line) => /_{2,}/.test(line)) ?? lines.at(-1) ?? ''
  if (!sentence) return null
  const completed = sentence.replace(/_{2,}/, answer).replace(/[.!?]+$/g, '').trim()
  return completed.split(/\s+/).length >= 3 ? completed : null
}

export function tokenizeSentenceV7(sentence: string) {
  return sentence
    .replace(/[.!?]+$/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
}

export function phraseHintV7(value: string) {
  return tokenizeSentenceV7(value)
    .map((word) => {
      const clean = word.replace(/[^A-Za-z']/g, '')
      if (clean.length <= 2) return clean
      return `${clean[0]}${'_'.repeat(Math.max(1, clean.length - 2))}${clean[clean.length - 1]}`
    })
    .join(' ')
}

export function reviewTimingLabelV7(record: EnglishGameReviewRecordV7, language: 'zh' | 'en', nowMs = Date.now()) {
  const hours = Math.max(0, (Date.parse(record.dueAt) - nowMs) / HOUR_MS)
  if (hours <= 0.05) return language === 'zh' ? '現在可複習' : 'Due now'
  if (hours < 1) return language === 'zh' ? '約 1 小時內' : 'Within an hour'
  if (hours < 24) return language === 'zh' ? `約 ${Math.ceil(hours)} 小時後` : `In about ${Math.ceil(hours)} hours`
  const days = Math.ceil(hours / 24)
  return language === 'zh' ? `約 ${days} 天後` : `In about ${days} days`
}
