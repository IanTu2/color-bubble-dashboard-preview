import type { EnglishAccent, EnglishSkill } from './english-data'

export type LearnerProfile = {
  goals: Array<'daily' | 'work' | 'travel' | 'exam' | 'tech'>
  accent: EnglishAccent
  dailyMinutes: number
  listeningEnabled: boolean
  level: string | null
  assessmentCompletedAt: string | null
}

export type AssessmentAnswer = {
  questionId: string
  skill: EnglishSkill
  difficulty: number
  score: number
  seconds: number
  confidence: number
}

export type AssessmentResult = {
  level: string
  confidence: 'medium' | 'high'
  skillScores: Record<EnglishSkill, number>
  averageSeconds: number
  completedAt: string
}

export type LearningHistory = {
  attempts: number
  correct: number
  learnedWordIds: string[]
  difficultWordIds: string[]
  streak: number
  lastStudyDate: string | null
}

export const DEFAULT_PROFILE: LearnerProfile = {
  goals: ['daily'],
  accent: 'en-US',
  dailyMinutes: 15,
  listeningEnabled: true,
  level: null,
  assessmentCompletedAt: null,
}

export const DEFAULT_HISTORY: LearningHistory = {
  attempts: 0,
  correct: 0,
  learnedWordIds: [],
  difficultWordIds: [],
  streak: 0,
  lastStudyDate: null,
}

export function englishStorageKey(userId: string, suffix: string) {
  return `bubble-space-v2-english-${userId}-${suffix}`
}

export function readEnglishStored<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

export function normalizeEnglishAnswer(value: string) {
  return value.trim().toLowerCase().replace(/[.!?]+$/g, '').replace(/\s+/g, ' ')
}

function editDistance(a: string, b: string) {
  const matrix = Array.from({ length: a.length + 1 }, () => Array<number>(b.length + 1).fill(0))
  for (let row = 0; row <= a.length; row += 1) matrix[row][0] = row
  for (let column = 0; column <= b.length; column += 1) matrix[0][column] = column
  for (let row = 1; row <= a.length; row += 1) {
    for (let column = 1; column <= b.length; column += 1) {
      const cost = a[row - 1] === b[column - 1] ? 0 : 1
      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + cost,
      )
    }
  }
  return matrix[a.length][b.length]
}

export function englishAnswerScore(answer: string, expected: string) {
  const normalized = normalizeEnglishAnswer(answer)
  const target = normalizeEnglishAnswer(expected)
  if (normalized === target) return 1
  if (target.length >= 6 && editDistance(normalized, target) === 1) return 0.5
  return 0
}

export function englishLevelFromNumber(value: number) {
  if (value < 1.7) return 'A1'
  if (value < 2.7) return 'A2'
  if (value < 3.7) return 'B1'
  if (value < 4.7) return 'B2'
  if (value < 5.4) return 'C1'
  return 'C2'
}

export function englishLevelNumber(level: string | null) {
  return ({ A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 } as Record<string, number>)[level ?? ''] ?? 2
}

export function buildAssessmentResult(answers: AssessmentAnswer[], finalAbility: number): AssessmentResult {
  const skills: EnglishSkill[] = ['recognition', 'spelling', 'grammar', 'reading', 'listening']
  const skillScores = skills.reduce<Record<EnglishSkill, number>>((record, skill) => {
    const items = answers.filter((item) => item.skill === skill)
    if (items.length === 0) return { ...record, [skill]: 0 }
    const total = items.reduce((sum, item) => {
      const expectedSeconds = 8 + item.difficulty * 3.2
      const speedFactor = Math.max(0.45, Math.min(1, expectedSeconds / Math.max(1, item.seconds)))
      const familiarity = item.score * 0.78 + (item.score > 0 ? speedFactor * 0.14 : 0) + (item.confidence / 3) * 0.08
      return sum + familiarity
    }, 0)
    return { ...record, [skill]: Math.round((total / items.length) * 100) }
  }, { recognition: 0, spelling: 0, grammar: 0, reading: 0, listening: 0 })
  return {
    level: englishLevelFromNumber(Math.max(1, Math.min(6, finalAbility))),
    confidence: answers.length >= 13 ? 'high' : 'medium',
    skillScores,
    averageSeconds: Math.round(answers.reduce((sum, item) => sum + item.seconds, 0) / Math.max(1, answers.length)),
    completedAt: new Date().toISOString(),
  }
}

export function englishTodayKey() {
  return new Date().toISOString().slice(0, 10)
}

export function maskEnglishWord(word: string) {
  return word.split('').map((letter, index) => index > 0 && index < word.length - 1 && /[aeiou]/i.test(letter) ? '_' : letter).join('')
}

export function speakEnglish(text: string, accent: EnglishAccent) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = accent === 'mixed' ? 'en-US' : accent
  utterance.rate = 0.88
  window.speechSynthesis.speak(utterance)
}
