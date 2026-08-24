import { useMemo, useState } from 'react'
import type { Dispatch, FormEvent, SetStateAction } from 'react'
import type { EnglishQuestion } from '../english-data'
import { GRAMMAR_READING_QUESTION_BANK } from '../english-grammar-reading-bank'
import { CEFR_LEVEL_COUNTS, CEFR_LEXICON, CEFR_SOURCE_NOTE } from '../generated/cefr-lexicon'
import type { GeneratedCefrLevel } from '../generated/cefr-lexicon'
import { EXPANDED_ENGLISH_WORDS } from '../english-expanded-data'
import type { ExpandedEnglishWord } from '../english-expanded-data'
import {
  completeEnglishGameSessionV7,
  completeGrammarSentenceV7,
  dueEnglishGameReviewsV7,
  grammarBaseIdV7,
  nextDueEnglishGameReviewV7,
  nextScheduledReviewAtV7,
  phraseHintV7,
  readEnglishGameMemoryV7,
  reviewTimingLabelV7,
  scheduleEnglishGameReviewV7,
  tokenizeSentenceV7,
  writeEnglishGameMemoryV7,
  type EnglishGameMemoryV7,
  type EnglishGameReviewRecordV7,
  type EnglishGameReviewRefV7,
  type EnglishGameTrackV7,
} from '../english-game-v7-engine'
import { smartGradeEnglishAnswer, smartGradeLabel, targetLetterHint } from '../english-smart-grading'
import { englishTodayKey, normalizeEnglishAnswer } from '../english-learning'
import type { LearnerProfile, LearningHistory } from '../english-learning'
import type { Language } from '../types'
import '../english-casual-practice-v7.css'

type GameRange = 'adaptive' | 'learned' | 'challenge'
type SessionLength = 10 | 15 | 20
type SessionPhase = 'setup' | 'playing' | 'summary'
type ChallengeKind =
  | 'meaning'
  | 'cloze'
  | 'dictation-word'
  | 'dictation-sentence'
  | 'spelling'
  | 'sentence-order'
  | 'grammar-choice'
  | 'grammar-order'
  | 'grammar-repair'
  | 'speech-recall'

type GameEntry = {
  id: string
  word: string
  pos: string
  level: GeneratedCefrLevel
  source: string
  topic: string
  detail: ExpandedEnglishWord | null
}

type Token = { id: string; text: string }

type Challenge = {
  id: string
  kind: ChallengeKind
  prompt: string
  answer: string
  acceptedAnswers: string[]
  choices?: string[]
  tokens?: Token[]
  context?: string
  hint?: string
  explanation: string
  preAnswerAudio?: string
  postAnswerAudio?: string
  entry?: GameEntry
  grammarId?: string
  level: GeneratedCefrLevel
  reviewOf?: string
  reviewRef: EnglishGameReviewRefV7
  learningPoint: string
}

type ReviewItem = { challenge: Challenge; dueAtAttempt: number }

type SessionStats = {
  attempts: number
  earned: number
  exact: number
  streak: number
  bestStreak: number
  xp: number
  reviewHits: number
}

type Feedback = {
  score: number
  text: string
  explanation: string
  reviewNote: string
}

type Props = {
  language: Language
  userId: string
  profile: LearnerProfile
  history: LearningHistory
  setHistory: Dispatch<SetStateAction<LearningHistory>>
  onOpenWord: (wordId: string) => void
}

const LEVELS: GeneratedCefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const EMPTY_STATS: SessionStats = { attempts: 0, earned: 0, exact: 0, streak: 0, bestStreak: 0, xp: 0, reviewHits: 0 }
const GRAMMAR_ALL = GRAMMAR_READING_QUESTION_BANK.filter((item) => item.skill === 'grammar')
const GRAMMAR_CHOICES = GRAMMAR_ALL.filter((item) => item.id.endsWith('-choice'))
const GRAMMAR_CORRECTIONS = new Map(
  GRAMMAR_ALL.filter((item) => item.id.endsWith('-correction')).map((item) => [grammarBaseIdV7(item.id), item]),
)

function shuffle<T>(items: T[]) {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }
  return result
}

function pick<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)]
}

function uniqueChoices(answer: string, candidates: string[]) {
  const alternatives = Array.from(new Set(candidates.filter((item) => item && normalizeEnglishAnswer(item) !== normalizeEnglishAnswer(answer))))
  return shuffle([answer, ...shuffle(alternatives).slice(0, 3)])
}

function userLevel(profile: LearnerProfile): GeneratedCefrLevel {
  return LEVELS.includes(profile.level as GeneratedCefrLevel) ? profile.level as GeneratedCefrLevel : 'A2'
}

function levelNumber(level: GeneratedCefrLevel) {
  return LEVELS.indexOf(level) + 1
}

function levelFromDifficulty(value: number): GeneratedCefrLevel {
  return LEVELS[Math.max(0, Math.min(LEVELS.length - 1, Math.round(value) - 1))]
}

function offsetLevel(level: GeneratedCefrLevel, offset: number) {
  return LEVELS[Math.max(0, Math.min(LEVELS.length - 1, LEVELS.indexOf(level) + offset))]
}

function buildEntries() {
  const details = new Map(EXPANDED_ENGLISH_WORDS.map((item) => [item.word.toLowerCase(), item]))
  const seen = new Set<string>()
  const result: GameEntry[] = []
  for (const item of CEFR_LEXICON) {
    const word = item.word.split('/')[0]?.trim() || item.word.trim()
    const key = `${word.toLowerCase()}|${item.level}`
    if (!word || seen.has(key)) continue
    seen.add(key)
    result.push({
      id: word.toLowerCase(),
      word,
      pos: item.pos,
      level: item.level,
      source: item.source,
      topic: item.topic,
      detail: details.get(word.toLowerCase()) ?? null,
    })
  }
  for (const detail of EXPANDED_ENGLISH_WORDS) {
    const level = LEVELS[Math.max(0, Math.min(LEVELS.length - 1, detail.level - 1))]
    const key = `${detail.word.toLowerCase()}|${level}`
    if (seen.has(key)) continue
    result.push({ id: detail.id, word: detail.word, pos: detail.partOfSpeech, level, source: 'Bubble English curated', topic: '', detail })
  }
  return result
}

function wordReviewRef(entry: GameEntry): EnglishGameReviewRefV7 {
  return {
    key: `word:${entry.id}:${entry.level}`,
    source: 'word',
    refId: entry.id,
    level: entry.level,
    label: entry.word,
  }
}

function grammarReviewRef(question: EnglishQuestion): EnglishGameReviewRefV7 {
  const focus = String(question.context ?? '').replace(/^文法重點：/, '').trim() || 'Grammar'
  return {
    key: `grammar:${grammarBaseIdV7(question.id)}`,
    source: 'grammar',
    refId: question.id,
    level: levelFromDifficulty(question.difficulty),
    label: focus,
  }
}

function chooseEntry(entries: GameEntry[], range: GameRange, level: GeneratedCefrLevel, history: LearningHistory, recent: string[], stats: SessionStats) {
  const fresh = entries.filter((entry) => !recent.includes(`${entry.id}:${entry.level}`))
  const pool = fresh.length > 24 ? fresh : entries
  const byLevel = (target: GeneratedCefrLevel) => pool.filter((entry) => entry.level === target)
  const safePick = (items: GameEntry[]) => pick(items.length ? items : pool)
  if (range === 'learned') {
    const known = new Set([...history.learnedWordIds, ...history.difficultWordIds])
    const learned = pool.filter((entry) => known.has(entry.id))
    return learned.length ? pick(learned) : safePick(byLevel(level))
  }
  if (range === 'challenge') return Math.random() < 0.72 ? safePick(byLevel(offsetLevel(level, 1))) : safePick(byLevel(level))
  const difficult = new Set(history.difficultWordIds)
  const difficultPool = pool.filter((entry) => difficult.has(entry.id) && [level, offsetLevel(level, -1)].includes(entry.level))
  if (stats.attempts >= 3 && stats.earned / Math.max(1, stats.attempts) < 0.58) return safePick(byLevel(offsetLevel(level, -1)))
  if (stats.streak >= 4 && Math.random() < 0.35) return safePick(byLevel(offsetLevel(level, 1)))
  const roll = Math.random()
  if (roll < 0.35 && difficultPool.length) return pick(difficultPool)
  if (roll < 0.78) return safePick(byLevel(level))
  if (roll < 0.92) return safePick(byLevel(offsetLevel(level, -1)))
  return safePick(byLevel(offsetLevel(level, 1)))
}

function makeTokens(sentence: string): Token[] {
  return shuffle(tokenizeSentenceV7(sentence).map((text, index) => ({ id: `${index}-${text}-${Math.random().toString(36).slice(2, 7)}`, text })))
}

function stripEndPunctuation(value: string) {
  return value.trim().replace(/[.!?]+$/g, '')
}

function vocabularyChallenge(entry: GameEntry, track: EnglishGameTrackV7, previous: ChallengeKind | null, language: Language): Challenge {
  const detail = entry.detail
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}-${entry.id}`
  const reviewRef = wordReviewRef(entry)

  if (track === 'speaking') {
    const answer = detail ? stripEndPunctuation(detail.example) : entry.word
    return {
      id, kind: 'speech-recall', entry, level: entry.level, reviewRef,
      prompt: language === 'zh' ? (detail ? `請用英文說出：${detail.exampleZh}` : `請說出這個英文：${entry.word}`) : (detail ? 'Say the English sentence for this meaning.' : `Say “${entry.word}”.`),
      answer, acceptedAnswers: [],
      context: language === 'zh' ? '使用麥克風作答；系統只比對語音辨識出的文字，不評分口音或語調。' : 'Answer by microphone. This checks recognized words, not pronunciation quality.',
      hint: detail ? phraseHintV7(answer) : targetLetterHint(entry.word),
      explanation: detail ? `${detail.example} — ${detail.exampleZh} ${detail.memory}` : `${entry.word} · ${entry.pos} · ${entry.level}`,
      postAnswerAudio: detail?.example ?? entry.word,
      learningPoint: detail?.meaning ?? entry.word,
    }
  }

  if (track === 'listening') {
    if (detail && Math.random() < 0.58) {
      const answer = stripEndPunctuation(detail.example)
      return {
        id, kind: 'dictation-sentence', entry, level: entry.level, reviewRef,
        prompt: language === 'zh' ? '聽完整句子，輸入你聽到的英文。' : 'Listen to the full sentence and type what you hear.',
        answer, acceptedAnswers: [],
        context: language === 'zh' ? '先用正常速度；需要時可以切換慢速再聽。' : 'Try normal speed first; slow replay is available if needed.',
        hint: phraseHintV7(answer),
        explanation: `${detail.example} — ${detail.exampleZh}`,
        preAnswerAudio: detail.example,
        postAnswerAudio: detail.example,
        learningPoint: `${entry.word} · sentence listening`,
      }
    }
    return {
      id, kind: 'dictation-word', entry, level: entry.level, reviewRef,
      prompt: language === 'zh' ? '聽一次，輸入你聽到的單字。' : 'Listen and type the word you hear.',
      answer: entry.word, acceptedAnswers: [],
      context: language === 'zh' ? '先不要看提示；真的卡住再展開。' : 'Try without a hint first.',
      hint: `${targetLetterHint(entry.word)} · ${entry.pos}`,
      explanation: detail ? `${detail.meaning}｜${detail.definition}` : `${entry.word} · ${entry.pos} · ${entry.level}`,
      preAnswerAudio: entry.word,
      postAnswerAudio: entry.word,
      learningPoint: detail?.meaning ?? entry.word,
    }
  }

  const kinds: ChallengeKind[] = detail
    ? ['meaning', 'cloze', 'spelling', 'sentence-order']
    : ['spelling']
  const available = kinds.filter((kind) => kind !== previous)
  const kind = pick(available.length ? available : kinds)

  if (kind === 'meaning' && detail) {
    return {
      id, kind, entry, level: entry.level, reviewRef,
      prompt: language === 'zh' ? `「${entry.word}」在這裡最接近哪個意思？` : `Which meaning best matches “${entry.word}”?`,
      answer: detail.meaning, acceptedAnswers: [],
      choices: uniqueChoices(detail.meaning, EXPANDED_ENGLISH_WORDS.filter((item) => item.id !== detail.id).map((item) => item.meaning)),
      context: `${entry.level} · ${entry.pos}${entry.topic ? ` · ${entry.topic}` : ''}`,
      explanation: `${detail.definition} ${detail.example} — ${detail.exampleZh}`,
      preAnswerAudio: entry.word,
      postAnswerAudio: detail.example,
      learningPoint: detail.meaning,
    }
  }

  if (kind === 'cloze' && detail) {
    const escaped = detail.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return {
      id, kind, entry, level: entry.level, reviewRef,
      prompt: detail.example.replace(new RegExp(`\\b${escaped}\\b`, 'i'), '______'),
      answer: detail.word, acceptedAnswers: [],
      context: language === 'zh' ? `中文：${detail.exampleZh}` : detail.definition,
      hint: `${detail.meaning} · ${targetLetterHint(detail.word)}`,
      explanation: `${detail.definition} ${detail.memory}`,
      postAnswerAudio: detail.example,
      learningPoint: detail.meaning,
    }
  }

  if (kind === 'sentence-order' && detail) {
    const answer = stripEndPunctuation(detail.example)
    return {
      id, kind, entry, level: entry.level, reviewRef,
      prompt: language === 'zh' ? '把字卡排成自然、完整的英文句子。' : 'Arrange the cards into a natural complete sentence.',
      answer, acceptedAnswers: [], tokens: makeTokens(answer),
      context: language === 'zh' ? detail.exampleZh : detail.definition,
      hint: language === 'zh' ? '先找主詞與動詞，再放時間、地點或受詞。' : 'Find the subject and verb first, then add the remaining details.',
      explanation: `${detail.example} — ${detail.exampleZh}`,
      postAnswerAudio: detail.example,
      learningPoint: `${entry.word} · sentence pattern`,
    }
  }

  return {
    id, kind: 'spelling', entry, level: entry.level, reviewRef,
    prompt: language === 'zh' ? `補完整拼字：${targetLetterHint(entry.word)}` : `Complete the spelling: ${targetLetterHint(entry.word)}`,
    answer: entry.word, acceptedAnswers: [],
    context: `${entry.level} · ${entry.pos}${detail?.meaning ? ` · ${detail.meaning}` : ''}`,
    hint: language === 'zh' ? '先想聲音，再輸入完整單字。' : 'Recall the sound, then type the complete word.',
    explanation: detail ? `${detail.definition} ${detail.example} — ${detail.exampleZh}` : `${entry.word} · ${entry.pos} · ${entry.level}`,
    preAnswerAudio: entry.word,
    postAnswerAudio: detail?.example ?? entry.word,
    learningPoint: detail?.meaning ?? entry.word,
  }
}

function chooseGrammarQuestion(level: GeneratedCefrLevel, recent: string[], stats: SessionStats) {
  const target = levelNumber(level) + (stats.streak >= 4 ? 0.35 : stats.attempts >= 3 && stats.earned / Math.max(1, stats.attempts) < 0.55 ? -0.45 : 0)
  const fresh = GRAMMAR_CHOICES.filter((item) => !recent.includes(grammarBaseIdV7(item.id)))
  const pool = fresh.length > 8 ? fresh : GRAMMAR_CHOICES
  return [...pool].sort((a, b) => Math.abs(a.difficulty - target) - Math.abs(b.difficulty - target) + (Math.random() - 0.5) * 0.18)[0]
}

function grammarChallenge(question: EnglishQuestion, previous: ChallengeKind | null, language: Language): Challenge {
  const baseId = grammarBaseIdV7(question.id)
  const correction = GRAMMAR_CORRECTIONS.get(baseId)
  const completed = completeGrammarSentenceV7(question)
  const possible: ChallengeKind[] = ['grammar-choice']
  if (completed) possible.push('grammar-order')
  if (correction) possible.push('grammar-repair')
  const available = possible.filter((kind) => kind !== previous)
  const kind = pick(available.length ? available : possible)
  const focus = String(question.context ?? '').replace(/^文法重點：/, '').trim() || (language === 'zh' ? '文法句型' : 'Grammar pattern')
  const reviewRef = grammarReviewRef(question)

  if (kind === 'grammar-order' && completed) {
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}-${baseId}-order`,
      kind, grammarId: baseId, level: levelFromDifficulty(question.difficulty), reviewRef,
      prompt: language === 'zh' ? `排列字卡，完成「${focus}」的正確句子。` : `Arrange the cards to build the “${focus}” sentence.`,
      answer: completed, acceptedAnswers: [], tokens: makeTokens(completed),
      context: question.prompt.split(/\n/).at(-1)?.trim() || focus,
      hint: language === 'zh' ? '先確認主詞，再找助動詞／動詞，最後補上其他成分。' : 'Start with the subject, then the auxiliary/verb, then the remaining parts.',
      explanation: question.explanation,
      postAnswerAudio: completed,
      learningPoint: focus,
    }
  }

  if (kind === 'grammar-repair' && correction) {
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}-${baseId}-repair`,
      kind, grammarId: baseId, level: levelFromDifficulty(correction.difficulty), reviewRef,
      prompt: correction.prompt,
      answer: stripEndPunctuation(correction.answer), acceptedAnswers: [],
      context: language === 'zh' ? `文法重點：${focus}` : `Grammar focus: ${focus}`,
      hint: language === 'zh' ? '不要只改一個字；先確認主詞、時態與句型結構。' : 'Check the subject, tense, and sentence structure before changing a word.',
      explanation: correction.explanation,
      postAnswerAudio: stripEndPunctuation(correction.answer),
      learningPoint: focus,
    }
  }

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}-${baseId}-choice`,
    kind: 'grammar-choice', grammarId: baseId, level: levelFromDifficulty(question.difficulty), reviewRef,
    prompt: question.prompt,
    answer: question.answer, acceptedAnswers: [],
    choices: question.choices ? shuffle(question.choices) : undefined,
    context: language === 'zh' ? `文法重點：${focus}` : `Grammar focus: ${focus}`,
    hint: language === 'zh' ? '先看時間線索、主詞與句型，再選答案。' : 'Check time clues, the subject, and sentence structure first.',
    explanation: question.explanation,
    postAnswerAudio: completed ?? question.answer,
    learningPoint: focus,
  }
}

function copyChallengeForImmediateReview(challenge: Challenge): Challenge {
  return {
    ...challenge,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}-review`,
    reviewOf: challenge.reviewOf ?? challenge.reviewRef.key,
    choices: challenge.choices ? shuffle(challenge.choices) : undefined,
    tokens: challenge.tokens ? shuffle(challenge.tokens) : undefined,
  }
}

function kindLabel(kind: ChallengeKind, language: Language) {
  const zh: Record<ChallengeKind, string> = {
    meaning: '單字辨義', cloze: '情境填空', 'dictation-word': '單字聽寫', 'dictation-sentence': '句子聽寫', spelling: '拼字回想', 'sentence-order': '句型字卡', 'grammar-choice': '文法選擇', 'grammar-order': '文法字卡', 'grammar-repair': '文法改錯', 'speech-recall': '口說回想',
  }
  const en: Record<ChallengeKind, string> = {
    meaning: 'Meaning', cloze: 'Cloze', 'dictation-word': 'Word dictation', 'dictation-sentence': 'Sentence dictation', spelling: 'Spelling recall', 'sentence-order': 'Sentence cards', 'grammar-choice': 'Grammar choice', 'grammar-order': 'Grammar cards', 'grammar-repair': 'Grammar correction', 'speech-recall': 'Speaking recall',
  }
  return (language === 'zh' ? zh : en)[kind]
}

function trackLabel(track: EnglishGameTrackV7, language: Language) {
  const zh = { mix: '智慧綜合', vocabulary: '單字', grammar: '文法', listening: '聽力', speaking: '口說回想' }
  const en = { mix: 'Smart mix', vocabulary: 'Vocabulary', grammar: 'Grammar', listening: 'Listening', speaking: 'Speaking recall' }
  return (language === 'zh' ? zh : en)[track]
}

function nextTrack(track: EnglishGameTrackV7, profile: LearnerProfile, voiceSupported: boolean) {
  if (track !== 'mix') return track
  const roll = Math.random()
  if (voiceSupported && roll < 0.12) return 'speaking'
  if (profile.listeningEnabled && roll < 0.32) return 'listening'
  if (roll < 0.60) return 'grammar'
  return 'vocabulary'
}

function formatNextReview(value: string | null, language: Language) {
  if (!value) return language === 'zh' ? '還沒有排程' : 'No scheduled review yet'
  const diff = Date.parse(value) - Date.now()
  if (diff <= 0) return language === 'zh' ? '現在就有到期題' : 'Reviews are due now'
  const hours = diff / 3_600_000
  if (hours < 24) return language === 'zh' ? `約 ${Math.max(1, Math.ceil(hours))} 小時後` : `In about ${Math.max(1, Math.ceil(hours))} hours`
  const days = Math.ceil(hours / 24)
  return language === 'zh' ? `約 ${days} 天後` : `In about ${days} days`
}

function speakAtRate(text: string, accent: LearnerProfile['accent'], rate: number) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = accent === 'mixed' ? 'en-US' : accent
  utterance.rate = rate
  window.speechSynthesis.speak(utterance)
}

export function EnglishCasualPracticeV7({ language, userId, profile, history, setHistory, onOpenWord }: Props) {
  const entries = useMemo(buildEntries, [])
  const level = userLevel(profile)
  const [phase, setPhase] = useState<SessionPhase>('setup')
  const [track, setTrack] = useState<EnglishGameTrackV7>('mix')
  const [range, setRange] = useState<GameRange>('adaptive')
  const [sessionLength, setSessionLength] = useState<SessionLength>(10)
  const [stats, setStats] = useState<SessionStats>(EMPTY_STATS)
  const [recentEntries, setRecentEntries] = useState<string[]>([])
  const [recentGrammar, setRecentGrammar] = useState<string[]>([])
  const [recentReviewKeys, setRecentReviewKeys] = useState<string[]>([])
  const [reviewQueue, setReviewQueue] = useState<ReviewItem[]>([])
  const [memory, setMemory] = useState<EnglishGameMemoryV7>(() => readEnglishGameMemoryV7(userId))
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [response, setResponse] = useState('')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [orderedTokens, setOrderedTokens] = useState<Token[]>([])
  const [showHint, setShowHint] = useState(false)
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'unsupported'>('idle')
  const [sessionWeak, setSessionWeak] = useState<string[]>([])

  const voiceSupported = typeof window !== 'undefined' && Boolean(
    (window as typeof window & { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition
    ?? (window as typeof window & { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).webkitSpeechRecognition,
  )

  const dueForTrack = dueEnglishGameReviewsV7(memory, track).length
  const dueAll = dueEnglishGameReviewsV7(memory, 'mix').length
  const nextScheduled = nextScheduledReviewAtV7(memory)

  const reconstructPersistentReview = (record: EnglishGameReviewRecordV7, previousKind: ChallengeKind | null) => {
    if (record.source === 'grammar') {
      const question = GRAMMAR_CHOICES.find((item) => item.id === record.refId) ?? GRAMMAR_CHOICES.find((item) => grammarBaseIdV7(item.id) === grammarBaseIdV7(record.refId))
      if (!question) return null
      return { ...grammarChallenge(question, previousKind, language), reviewOf: record.key }
    }
    const entry = entries.find((item) => item.id === record.refId && item.level === record.level) ?? entries.find((item) => item.id === record.refId)
    if (!entry) return null
    const reviewTrack = track === 'mix' ? 'vocabulary' : track === 'grammar' ? 'vocabulary' : track
    return { ...vocabularyChallenge(entry, reviewTrack, previousKind, language), reviewOf: record.key }
  }

  const buildNextChallenge = (
    nextStats: SessionStats,
    queue: ReviewItem[],
    previousKind: ChallengeKind | null,
    entryHistory: string[],
    grammarHistory: string[],
    reviewHistory: string[],
    activeMemory: EnglishGameMemoryV7,
  ) => {
    const immediate = queue.find((item) => item.dueAtAttempt <= nextStats.attempts + 1)
    if (immediate) return { next: copyChallengeForImmediateReview(immediate.challenge), remaining: queue.filter((item) => item !== immediate) }

    const due = nextDueEnglishGameReviewV7(activeMemory, track, new Set(reviewHistory))
    if (due) {
      const rebuilt = reconstructPersistentReview(due, previousKind)
      if (rebuilt) return { next: rebuilt, remaining: queue }
    }

    const selectedTrack = nextTrack(track, profile, voiceSupported)
    if (selectedTrack === 'grammar') {
      const question = chooseGrammarQuestion(level, grammarHistory, nextStats)
      return { next: grammarChallenge(question, previousKind, language), remaining: queue }
    }
    const entry = chooseEntry(entries, range, level, history, entryHistory, nextStats)
    return { next: vocabularyChallenge(entry, selectedTrack, previousKind, language), remaining: queue }
  }

  const adoptChallenge = (next: Challenge, resetHistory = false) => {
    setChallenge(next)
    setResponse('')
    setFeedback(null)
    setOrderedTokens([])
    setShowHint(false)
    setVoiceState('idle')
    if (resetHistory) {
      setRecentEntries(next.entry ? [`${next.entry.id}:${next.entry.level}`] : [])
      setRecentGrammar(next.grammarId ? [next.grammarId] : [])
      setRecentReviewKeys(next.reviewOf ? [next.reviewRef.key] : [])
      return
    }
    if (next.entry) setRecentEntries((current) => [`${next.entry?.id}:${next.entry?.level}`, ...current].slice(0, 12))
    if (next.grammarId) setRecentGrammar((current) => [next.grammarId!, ...current].slice(0, 14))
    if (next.reviewOf) setRecentReviewKeys((current) => Array.from(new Set([next.reviewRef.key, ...current])).slice(0, 20))
  }

  const startSession = () => {
    const initialStats = EMPTY_STATS
    const built = buildNextChallenge(initialStats, [], null, [], [], [], memory)
    setStats(initialStats)
    setReviewQueue([])
    setSessionWeak([])
    adoptChallenge(built.next, true)
    setPhase('playing')
  }

  const recordHistory = (score: number, active: Challenge) => {
    setHistory((current) => {
      const today = englishTodayKey()
      const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)
      const wordId = active.entry?.id
      return {
        ...current,
        attempts: current.attempts + 1,
        correct: current.correct + (score >= 0.75 ? 1 : 0),
        learnedWordIds: wordId && score === 1 ? Array.from(new Set([...current.learnedWordIds, wordId])) : current.learnedWordIds,
        difficultWordIds: wordId && score < 0.75
          ? Array.from(new Set([...current.difficultWordIds, wordId]))
          : wordId && score === 1
            ? current.difficultWordIds.filter((id) => id !== wordId)
            : current.difficultWordIds,
        streak: current.lastStudyDate === today ? current.streak : current.lastStudyDate === yesterday ? current.streak + 1 : 1,
        lastStudyDate: today,
      }
    })
  }

  const grade = (answerText: string, unknown = false) => {
    if (!challenge || feedback) return
    const finalAnswer = (challenge.kind === 'sentence-order' || challenge.kind === 'grammar-order')
      ? orderedTokens.map((item) => item.text).join(' ')
      : answerText
    const result = unknown
      ? { score: 0, kind: 'wrong' as const, matchedAnswer: null }
      : smartGradeEnglishAnswer(finalAnswer, challenge.answer, challenge.acceptedAnswers)
    const nextStreak = result.score === 1 ? stats.streak + 1 : 0
    const xpGain = result.score === 1 ? 12 + Math.min(8, stats.streak * 2) : result.score >= 0.75 ? 8 : result.score >= 0.5 ? 4 : 0
    const nextStats: SessionStats = {
      attempts: stats.attempts + 1,
      earned: stats.earned + result.score,
      exact: stats.exact + (result.score === 1 ? 1 : 0),
      streak: nextStreak,
      bestStreak: Math.max(stats.bestStreak, nextStreak),
      xp: stats.xp + xpGain,
      reviewHits: stats.reviewHits + (challenge.reviewOf ? 1 : 0),
    }

    const nextMemory = scheduleEnglishGameReviewV7(memory, challenge.reviewRef, result.score)
    const scheduledRecord = nextMemory.reviews.find((item) => item.key === challenge.reviewRef.key)
    setMemory(nextMemory)
    writeEnglishGameMemoryV7(userId, nextMemory)
    setResponse(finalAnswer)
    setStats(nextStats)
    setFeedback({
      score: result.score,
      text: smartGradeLabel(result, challenge.answer, language),
      explanation: challenge.explanation,
      reviewNote: result.score < 0.75 && nextStats.attempts + 2 < sessionLength
        ? (language === 'zh' ? '這題會在本回合稍後再出現；跨回合複習也已排程。' : 'This item will return later this round and is also scheduled for future review.')
        : scheduledRecord ? reviewTimingLabelV7(scheduledRecord, language) : '',
    })
    recordHistory(result.score, challenge)

    if (result.score < 0.75) {
      setSessionWeak((current) => Array.from(new Set([...current, challenge.learningPoint])).slice(0, 8))
      if (nextStats.attempts + 2 < sessionLength) {
        setReviewQueue((current) => [
          ...current.filter((item) => item.challenge.reviewRef.key !== challenge.reviewRef.key),
          { challenge, dueAtAttempt: nextStats.attempts + 2 },
        ])
      }
    }
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!challenge) return
    const value = (challenge.kind === 'sentence-order' || challenge.kind === 'grammar-order')
      ? orderedTokens.map((item) => item.text).join(' ')
      : response
    if (value.trim()) grade(value)
  }

  const finishSession = () => {
    setMemory((current) => {
      const next = completeEnglishGameSessionV7(current, stats.xp)
      writeEnglishGameMemoryV7(userId, next)
      return next
    })
    setPhase('summary')
  }

  const moveNext = () => {
    if (!challenge) return
    if (stats.attempts >= sessionLength) {
      finishSession()
      return
    }
    const built = buildNextChallenge(stats, reviewQueue, challenge.kind, recentEntries, recentGrammar, recentReviewKeys, memory)
    setReviewQueue(built.remaining)
    adoptChallenge(built.next)
  }

  const startVoiceInput = () => {
    if (!challenge || feedback) return
    type Recognition = {
      lang: string
      interimResults: boolean
      maxAlternatives: number
      start: () => void
      onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null
      onerror: (() => void) | null
      onend: (() => void) | null
    }
    type RecognitionCtor = new () => Recognition
    const speechWindow = window as typeof window & { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor }
    const RecognitionApi = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition
    if (!RecognitionApi) {
      setVoiceState('unsupported')
      return
    }
    const recognition = new RecognitionApi()
    recognition.lang = profile.accent === 'en-GB' ? 'en-GB' : 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? ''
      setResponse(transcript)
      setVoiceState('idle')
    }
    recognition.onerror = () => setVoiceState('idle')
    recognition.onend = () => setVoiceState('idle')
    setVoiceState('listening')
    recognition.start()
  }

  const availableTokens = challenge?.tokens?.filter((token) => !orderedTokens.some((selected) => selected.id === token.id)) ?? []
  const progress = Math.min(100, Math.round((stats.attempts / sessionLength) * 100))
  const accuracy = stats.attempts ? Math.round((stats.earned / stats.attempts) * 100) : 0
  const rangeCopy = language === 'zh'
    ? { adaptive: '依程度', learned: '複習學過', challenge: '挑戰高一級' }
    : { adaptive: 'Adaptive', learned: 'Review learned', challenge: 'Level up' }
  const trackDescriptions: Record<EnglishGameTrackV7, string> = language === 'zh'
    ? {
        mix: '到期複習優先，再混合單字、文法、聽力與口說回想',
        vocabulary: '辨義、拼字、情境填空與句子字卡',
        grammar: '選擇、改錯與真正的句子排列字卡',
        listening: '單字與完整句子聽寫，可切正常／慢速',
        speaking: voiceSupported ? '看中文用英文說出來；只檢查辨識文字，不評口音' : '此瀏覽器目前不支援語音辨識',
      }
    : {
        mix: 'Due reviews first, then vocabulary, grammar, listening, and speaking recall',
        vocabulary: 'Meaning, spelling, cloze, and sentence cards',
        grammar: 'Choice, correction, and true sentence-building cards',
        listening: 'Word and full-sentence dictation with normal/slow replay',
        speaking: voiceSupported ? 'Recall English by voice; recognized text only, not accent scoring' : 'Speech recognition is not supported in this browser',
      }

  if (phase === 'setup') {
    return (
      <section className="english-game-v7-shell setup" data-english-game-v7="setup">
        <header className="english-game-v7-hero">
          <div className="english-game-v7-character" aria-hidden="true"><span /><span /><i /></div>
          <div>
            <p className="english-game-v7-kicker">BUBBLE ENGLISH · DAILY QUEST</p>
            <h3>{language === 'zh' ? '用一小回合，把英文叫回來' : 'Bring English back in one short round'}</h3>
            <p>{language === 'zh' ? `目前 ${level} · 今日學習目標 ${profile.dailyMinutes} 分鐘。到期錯題會優先回來，新的錯題也會跨回合保留。` : `${level} · ${profile.dailyMinutes}-minute daily goal. Due reviews come first and missed items persist across sessions.`}</p>
          </div>
        </header>

        <div className="english-game-v7-review-card">
          <div><span>{language === 'zh' ? '現在待複習' : 'Due now'}</span><strong>{dueAll}</strong></div>
          <div><span>{language === 'zh' ? '累積遊戲 XP' : 'Game XP'}</span><strong>{memory.totalXp}</strong></div>
          <div><span>{language === 'zh' ? '遊戲連續天數' : 'Game streak'}</span><strong>{memory.sessionStreak}</strong></div>
          <p>{language === 'zh' ? `下一個複習：${formatNextReview(nextScheduled, language)}` : `Next review: ${formatNextReview(nextScheduled, language)}`}</p>
        </div>

        <div className="english-game-v7-section">
          <div className="english-game-v7-section-title"><strong>{language === 'zh' ? '今天想練什麼？' : 'Choose today’s quest'}</strong><span>{dueForTrack > 0 ? (language === 'zh' ? `此模式有 ${dueForTrack} 題到期` : `${dueForTrack} due`) : ''}</span></div>
          <div className="english-game-v7-track-grid">
            {(['mix', 'vocabulary', 'grammar', 'listening', 'speaking'] as EnglishGameTrackV7[]).map((item) => (
              <button type="button" key={item} disabled={item === 'speaking' && !voiceSupported} className={track === item ? 'active' : ''} onClick={() => setTrack(item)}>
                <span>{item === 'mix' ? '✦' : item === 'vocabulary' ? 'Aa' : item === 'grammar' ? '▦' : item === 'listening' ? '◖' : '●'}</span>
                <strong>{trackLabel(item, language)}</strong>
                <small>{trackDescriptions[item]}</small>
              </button>
            ))}
          </div>
        </div>

        <div className={`english-game-v7-config-row${track === 'grammar' ? ' grammar-only' : ''}`}>
          {track !== 'grammar' ? (
            <div>
              <strong>{language === 'zh' ? '出題範圍' : 'Difficulty'}</strong>
              <div className="english-game-v7-segmented">{(Object.keys(rangeCopy) as GameRange[]).map((item) => <button type="button" className={range === item ? 'active' : ''} key={item} onClick={() => setRange(item)}>{rangeCopy[item]}</button>)}</div>
            </div>
          ) : null}
          <div>
            <strong>{language === 'zh' ? '一回合' : 'Round length'}</strong>
            <div className="english-game-v7-segmented">{([10, 15, 20] as SessionLength[]).map((item) => <button type="button" className={sessionLength === item ? 'active' : ''} key={item} onClick={() => setSessionLength(item)}>{item} {language === 'zh' ? '題' : 'items'}</button>)}</div>
          </div>
        </div>

        <button className="english-game-v7-start" type="button" onClick={startSession}><span>{dueForTrack > 0 ? '↻' : '▶'}</span>{dueForTrack > 0 ? (language === 'zh' ? `先從 ${dueForTrack} 題到期複習開始` : `Start with ${dueForTrack} due reviews`) : (language === 'zh' ? '開始今天這一回合' : 'Start today’s round')}</button>
        <p className="english-game-v7-source">{language === 'zh' ? `詞彙依 CEFR 分級；文法使用可追溯句型題庫。共 ${entries.length.toLocaleString()} 個可用詞條。` : `${entries.length.toLocaleString()} CEFR-linked entries plus a traceable grammar bank.`}</p>
      </section>
    )
  }

  if (phase === 'summary') {
    const currentDue = dueEnglishGameReviewsV7(memory, 'mix').length
    return (
      <section className="english-game-v7-shell summary" data-english-game-v7="summary">
        <div className="english-game-v7-summary-mark">✓</div>
        <p className="english-game-v7-kicker">QUEST COMPLETE</p>
        <h3>{language === 'zh' ? '這一回合完成了' : 'Quest complete'}</h3>
        <p>{language === 'zh' ? '答錯不是清零：不熟的內容已寫進複習排程，之後會再回來。' : 'A miss is not a reset: weak items are now scheduled to return.'}</p>
        <div className="english-game-v7-summary-grid">
          <div><strong>{accuracy}%</strong><span>{language === 'zh' ? '本回合正確率' : 'Accuracy'}</span></div>
          <div><strong>{stats.xp}</strong><span>XP</span></div>
          <div><strong>{stats.bestStreak}</strong><span>{language === 'zh' ? '最高連擊' : 'Best streak'}</span></div>
          <div><strong>{stats.reviewHits}</strong><span>{language === 'zh' ? '實際回收題' : 'Review returns'}</span></div>
        </div>
        <div className="english-game-v7-review-summary">
          <div><strong>{language === 'zh' ? '需要再加強' : 'Needs another look'}</strong><span>{sessionWeak.length ? sessionWeak.join(' · ') : (language === 'zh' ? '這回合沒有明顯弱點' : 'No clear weak item this round')}</span></div>
          <div><strong>{language === 'zh' ? '目前到期' : 'Due now'}</strong><span>{currentDue} {language === 'zh' ? '題' : 'items'}</span></div>
          <div><strong>{language === 'zh' ? '下一次排程' : 'Next scheduled review'}</strong><span>{formatNextReview(nextScheduledReviewAtV7(memory), language)}</span></div>
        </div>
        <div className="english-game-v7-summary-actions">
          <button type="button" onClick={() => setPhase('setup')}>{language === 'zh' ? '調整模式' : 'Change mode'}</button>
          <button className="primary" type="button" onClick={startSession}>{currentDue > 0 ? (language === 'zh' ? '繼續清到期題' : 'Keep reviewing due items') : (language === 'zh' ? '再玩一回合' : 'Play another round')}</button>
        </div>
      </section>
    )
  }

  if (!challenge) return null

  const isAudioTask = challenge.kind === 'dictation-word' || challenge.kind === 'dictation-sentence'
  const isTokenTask = challenge.kind === 'sentence-order' || challenge.kind === 'grammar-order'
  const isSpeakingTask = challenge.kind === 'speech-recall'

  return (
    <section className="english-game-v7-shell playing" data-english-game-v7="playing">
      <header className="english-game-v7-topbar">
        <button type="button" aria-label={language === 'zh' ? '離開回合' : 'Leave round'} onClick={() => setPhase('setup')}>×</button>
        <div className="english-game-v7-progress"><i style={{ width: `${progress}%` }} /></div>
        <div className="english-game-v7-xp"><strong>{stats.xp}</strong><span>XP</span></div>
      </header>

      <div className="english-game-v7-status-row">
        <span>{kindLabel(challenge.kind, language)}</span>
        <span>{challenge.level}</span>
        {challenge.reviewOf ? <span className="review">↻ {language === 'zh' ? '到期／錯題回收' : 'Review return'}</span> : null}
        {stats.streak >= 2 ? <span className="streak">🔥 {stats.streak}</span> : null}
      </div>

      <article className="english-game-v7-question">
        {isAudioTask && challenge.preAnswerAudio ? (
          <div className="english-game-v7-audio-stage">
            <button className="english-game-v7-audio-orb" type="button" onClick={() => speakAtRate(challenge.preAnswerAudio!, profile.accent, .92)} aria-label={language === 'zh' ? '正常速度播放英文' : 'Play English at normal speed'}><span>▶</span></button>
            <button type="button" onClick={() => speakAtRate(challenge.preAnswerAudio!, profile.accent, .72)}>{language === 'zh' ? '慢速再聽' : 'Slower'}</button>
          </div>
        ) : challenge.preAnswerAudio ? (
          <button className="english-game-v7-mini-audio" type="button" onClick={() => speakAtRate(challenge.preAnswerAudio!, profile.accent, .9)}>🔊 {language === 'zh' ? '聽發音' : 'Hear it'}</button>
        ) : null}

        <p className="english-game-v7-learning-point">{challenge.learningPoint}</p>
        <h4>{challenge.prompt}</h4>
        {challenge.context ? <p className="english-game-v7-context">{challenge.context}</p> : null}

        <form onSubmit={submit}>
          {challenge.choices ? (
            <div className="english-game-v7-choice-grid">
              {challenge.choices.map((choice) => {
                const correct = feedback && normalizeEnglishAnswer(choice) === normalizeEnglishAnswer(challenge.answer)
                const wrongSelected = feedback && response === choice && !correct
                return <button type="button" key={choice} disabled={Boolean(feedback)} className={`${response === choice ? 'active' : ''}${correct ? ' correct' : ''}${wrongSelected ? ' wrong' : ''}`} onClick={() => setResponse(choice)}>{choice}</button>
              })}
            </div>
          ) : isTokenTask ? (
            <div className="english-game-v7-token-task">
              <div className="english-game-v7-token-answer">
                {orderedTokens.length ? orderedTokens.map((token) => <button type="button" disabled={Boolean(feedback)} key={token.id} onClick={() => setOrderedTokens((current) => current.filter((item) => item.id !== token.id))}>{token.text}</button>) : <span>{language === 'zh' ? '依序點下面的字卡' : 'Tap the cards in order'}</span>}
              </div>
              <div className="english-game-v7-token-bank">{availableTokens.map((token) => <button type="button" disabled={Boolean(feedback)} key={token.id} onClick={() => setOrderedTokens((current) => [...current, token])}>{token.text}</button>)}</div>
            </div>
          ) : isSpeakingTask ? (
            <div className="english-game-v7-speaking-task">
              <button type="button" className={voiceState === 'listening' ? 'listening' : ''} disabled={Boolean(feedback) || voiceState === 'listening'} onClick={startVoiceInput}><span>🎙</span><strong>{voiceState === 'listening' ? (language === 'zh' ? '正在聽…' : 'Listening…') : (language === 'zh' ? '按住概念：點一下開始說' : 'Tap and speak')}</strong></button>
              <input autoFocus={false} autoComplete="off" spellCheck={false} disabled={Boolean(feedback)} value={response} placeholder={language === 'zh' ? '語音辨識結果會出現在這裡，也可用鍵盤修正' : 'Recognized speech appears here; keyboard correction is allowed'} onChange={(event) => setResponse(event.target.value)} />
              <small>{language === 'zh' ? '這裡只檢查辨識出的英文文字，不是發音或口音評分。' : 'This checks recognized English text only; it is not pronunciation or accent scoring.'}</small>
            </div>
          ) : (
            <div className="english-game-v7-input-wrap">
              <input autoFocus autoComplete="off" spellCheck={false} disabled={Boolean(feedback)} value={response} placeholder={language === 'zh' ? '輸入答案' : 'Type your answer'} onChange={(event) => setResponse(event.target.value)} />
              <button type="button" disabled={Boolean(feedback) || voiceState === 'listening'} onClick={startVoiceInput} aria-label={language === 'zh' ? '使用語音輸入' : 'Use voice input'}>{voiceState === 'listening' ? '●' : '🎙'}</button>
            </div>
          )}

          {!feedback && challenge.hint ? <button className="english-game-v7-hint" type="button" onClick={() => setShowHint((value) => !value)}>{showHint ? (language === 'zh' ? '收起提示' : 'Hide hint') : (language === 'zh' ? '需要提示' : 'Need a hint')}</button> : null}
          {showHint && challenge.hint ? <p className="english-game-v7-hint-text">{challenge.hint}</p> : null}
          {voiceState === 'unsupported' ? <p className="english-game-v7-hint-text">{language === 'zh' ? '這個瀏覽器目前不支援語音辨識，仍可使用鍵盤作答。' : 'Speech recognition is not supported in this browser; keyboard input still works.'}</p> : null}

          {!feedback ? (
            <div className="english-game-v7-actions">
              <button type="button" onClick={() => grade('', true)}>{language === 'zh' ? '我不知道' : 'I don’t know'}</button>
              <button className="primary" type="submit" disabled={isTokenTask ? orderedTokens.length === 0 : !response.trim()}>{language === 'zh' ? '確認' : 'Check'}</button>
            </div>
          ) : (
            <div className={`english-game-v7-feedback ${feedback.score >= 0.75 ? 'correct' : 'wrong'}`} aria-live="polite">
              <div className="english-game-v7-feedback-title"><strong>{feedback.score >= 0.75 ? '✓' : '↻'}</strong><span>{feedback.text}</span></div>
              <p>{feedback.explanation}</p>
              {feedback.score < 0.75 ? <p className="answer">{language === 'zh' ? '正確答案：' : 'Answer: '}<strong>{challenge.answer}</strong></p> : null}
              {challenge.postAnswerAudio ? <button className="english-game-v7-explanation-audio" type="button" onClick={() => speakAtRate(challenge.postAnswerAudio!, profile.accent, .88)}>🔊 {language === 'zh' ? '聽正確英文' : 'Hear the target'}</button> : null}
              <p className="review-note">↻ {feedback.reviewNote}</p>
              <div className="english-game-v7-feedback-actions">
                {challenge.entry?.detail ? <button type="button" onClick={() => onOpenWord(challenge.entry?.detail?.id ?? challenge.entry?.id ?? '')}>{language === 'zh' ? '看單字卡' : 'Word card'}</button> : <span />}
                <button className="primary" type="button" onClick={moveNext}>{stats.attempts >= sessionLength ? (language === 'zh' ? '看結果' : 'See results') : (language === 'zh' ? '繼續' : 'Continue')}</button>
              </div>
            </div>
          )}
        </form>
      </article>

      <footer className="english-game-v7-round-footer">
        <span>{stats.attempts}/{sessionLength}</span>
        <span>{language === 'zh' ? `正確率 ${accuracy}%` : `${accuracy}% accuracy`}</span>
        <span>{language === 'zh' ? `本回合待回流 ${reviewQueue.length}` : `${reviewQueue.length} same-round reviews`}</span>
      </footer>
      <small className="english-game-v7-data-note">{CEFR_SOURCE_NOTE} · {LEVELS.map((item) => `${item} ${CEFR_LEVEL_COUNTS[item].toLocaleString()}`).join(' · ')}</small>
    </section>
  )
}
