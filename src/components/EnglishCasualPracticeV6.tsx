import { useMemo, useState } from 'react'
import type { Dispatch, FormEvent, SetStateAction } from 'react'
import type { EnglishQuestion } from '../english-data'
import { GRAMMAR_READING_QUESTION_BANK } from '../english-grammar-reading-bank'
import { CEFR_LEVEL_COUNTS, CEFR_LEXICON, CEFR_SOURCE_NOTE } from '../generated/cefr-lexicon'
import type { GeneratedCefrLevel } from '../generated/cefr-lexicon'
import { EXPANDED_ENGLISH_WORDS } from '../english-expanded-data'
import type { ExpandedEnglishWord } from '../english-expanded-data'
import { smartGradeEnglishAnswer, smartGradeLabel, targetLetterHint } from '../english-smart-grading'
import { englishTodayKey, normalizeEnglishAnswer, speakEnglish } from '../english-learning'
import type { LearnerProfile, LearningHistory } from '../english-learning'
import type { Language } from '../types'
import '../english-casual-practice-v6.css'

type GameRange = 'adaptive' | 'learned' | 'challenge'
type GameTrack = 'mix' | 'vocabulary' | 'grammar' | 'listening'
type SessionLength = 10 | 15 | 20
type SessionPhase = 'setup' | 'playing' | 'summary'
type ChallengeKind = 'meaning' | 'cloze' | 'dictation' | 'spelling' | 'sentence-order' | 'grammar-choice' | 'grammar-repair'

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
  speakText?: string
  entry?: GameEntry
  grammarId?: string
  level: GeneratedCefrLevel
  reviewOf?: string
}

type ReviewItem = { challenge: Challenge; dueAt: number }

type SessionStats = {
  attempts: number
  earned: number
  exact: number
  streak: number
  bestStreak: number
  xp: number
  reviewHits: number
}

type Props = {
  language: Language
  profile: LearnerProfile
  history: LearningHistory
  setHistory: Dispatch<SetStateAction<LearningHistory>>
  onOpenWord: (wordId: string) => void
}

const LEVELS: GeneratedCefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const EMPTY_STATS: SessionStats = { attempts: 0, earned: 0, exact: 0, streak: 0, bestStreak: 0, xp: 0, reviewHits: 0 }
const GRAMMAR_QUESTIONS = GRAMMAR_READING_QUESTION_BANK.filter((item) => item.skill === 'grammar')

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
  const alternatives = Array.from(new Set(candidates.filter((item) => item && item.toLowerCase() !== answer.toLowerCase())))
  return shuffle([answer, ...shuffle(alternatives).slice(0, 3)])
}

function userLevel(profile: LearnerProfile): GeneratedCefrLevel {
  return LEVELS.includes(profile.level as GeneratedCefrLevel) ? profile.level as GeneratedCefrLevel : 'A2'
}

function levelNumber(level: GeneratedCefrLevel) {
  return LEVELS.indexOf(level) + 1
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

function sentenceTokens(sentence: string) {
  const words = sentence.replace(/[.!?]+$/g, '').split(/\s+/).filter(Boolean)
  return shuffle(words.map((text, index) => ({ id: `${index}-${text}-${Math.random().toString(36).slice(2, 7)}`, text })))
}

function vocabularyChallenge(entry: GameEntry, track: GameTrack, previous: ChallengeKind | null, language: Language): Challenge {
  const detail = entry.detail
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}-${entry.id}`
  let kinds: ChallengeKind[] = detail
    ? ['meaning', 'cloze', 'dictation', 'spelling', 'sentence-order']
    : ['dictation', 'spelling']
  if (track === 'listening') kinds = ['dictation']
  const available = kinds.filter((kind) => kind !== previous)
  const kind = pick(available.length ? available : kinds)

  if (kind === 'meaning' && detail) {
    return {
      id, kind, entry, level: entry.level,
      prompt: language === 'zh' ? `「${entry.word}」在這裡最接近哪個意思？` : `Which meaning best matches “${entry.word}”?`,
      answer: detail.meaning, acceptedAnswers: [],
      choices: uniqueChoices(detail.meaning, EXPANDED_ENGLISH_WORDS.filter((item) => item.id !== detail.id).map((item) => item.meaning)),
      context: `${entry.level} · ${entry.pos}${entry.topic ? ` · ${entry.topic}` : ''}`,
      explanation: `${detail.definition} ${detail.example}`,
      speakText: entry.word,
    }
  }

  if (kind === 'cloze' && detail) {
    return {
      id, kind, entry, level: entry.level,
      prompt: detail.example.replace(new RegExp(`\\b${detail.word.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'i'), '______'),
      answer: detail.word, acceptedAnswers: detail.acceptedTranslations,
      context: language === 'zh' ? detail.exampleZh : detail.definition,
      hint: `${detail.meaning} · ${targetLetterHint(detail.word)}`,
      explanation: `${detail.definition} ${detail.memory}`,
      speakText: detail.example,
    }
  }

  if (kind === 'sentence-order' && detail) {
    return {
      id, kind, entry, level: entry.level,
      prompt: language === 'zh' ? '把字卡排成自然、完整的英文句子。' : 'Arrange the cards into a natural complete sentence.',
      answer: detail.example.replace(/[.!?]+$/g, ''), acceptedAnswers: [],
      tokens: sentenceTokens(detail.example),
      context: language === 'zh' ? detail.exampleZh : detail.definition,
      explanation: `${detail.example} — ${detail.exampleZh}`,
      speakText: detail.example,
    }
  }

  if (kind === 'spelling') {
    return {
      id, kind, entry, level: entry.level,
      prompt: language === 'zh' ? `補完整拼字：${targetLetterHint(entry.word)}` : `Complete the spelling: ${targetLetterHint(entry.word)}`,
      answer: entry.word, acceptedAnswers: [],
      context: `${entry.level} · ${entry.pos}${detail?.meaning ? ` · ${detail.meaning}` : ''}`,
      hint: language === 'zh' ? '先想聲音，再輸入完整單字。' : 'Recall the sound, then type the complete word.',
      explanation: detail ? `${detail.definition} ${detail.example}` : `${entry.word} · ${entry.pos} · ${entry.level}`,
      speakText: entry.word,
    }
  }

  return {
    id, kind: 'dictation', entry, level: entry.level,
    prompt: language === 'zh' ? '聽一次，輸入你聽到的英文。' : 'Listen once and type what you hear.',
    answer: entry.word, acceptedAnswers: [],
    context: language === 'zh' ? '先不要看提示；真的卡住再展開。' : 'Try without a hint first.',
    hint: `${targetLetterHint(entry.word)} · ${entry.pos}`,
    explanation: detail ? `${detail.meaning}｜${detail.definition}` : `${entry.word} · ${entry.pos} · ${entry.level}`,
    speakText: entry.word,
  }
}

function chooseGrammarQuestion(level: GeneratedCefrLevel, recent: string[], stats: SessionStats) {
  const target = levelNumber(level) + (stats.streak >= 4 ? 0.35 : stats.attempts >= 3 && stats.earned / Math.max(1, stats.attempts) < 0.55 ? -0.45 : 0)
  const fresh = GRAMMAR_QUESTIONS.filter((item) => !recent.includes(item.id))
  const pool = fresh.length > 8 ? fresh : GRAMMAR_QUESTIONS
  return [...pool].sort((a, b) => Math.abs(a.difficulty - target) - Math.abs(b.difficulty - target) + (Math.random() - 0.5) * 0.18)[0]
}

function grammarChallenge(question: EnglishQuestion, level: GeneratedCefrLevel, language: Language): Challenge {
  const choice = Boolean(question.choices?.length)
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}-${question.id}`,
    kind: choice ? 'grammar-choice' : 'grammar-repair',
    grammarId: question.id,
    level,
    prompt: question.prompt,
    answer: question.answer,
    acceptedAnswers: [],
    choices: question.choices ? shuffle(question.choices) : undefined,
    context: question.context ?? (language === 'zh' ? '選出最自然、最符合句型規則的答案。' : 'Choose the most natural answer for the sentence.'),
    explanation: question.explanation,
    speakText: question.audioText,
  }
}

function kindLabel(kind: ChallengeKind, language: Language) {
  const zh: Record<ChallengeKind, string> = {
    meaning: '單字意思', cloze: '情境填空', dictation: '聽力', spelling: '拼字', 'sentence-order': '句型字卡', 'grammar-choice': '文法', 'grammar-repair': '改錯',
  }
  const en: Record<ChallengeKind, string> = {
    meaning: 'Meaning', cloze: 'Cloze', dictation: 'Listening', spelling: 'Spelling', 'sentence-order': 'Sentence cards', 'grammar-choice': 'Grammar', 'grammar-repair': 'Correction',
  }
  return (language === 'zh' ? zh : en)[kind]
}

function trackLabel(track: GameTrack, language: Language) {
  const zh = { mix: '綜合', vocabulary: '單字', grammar: '文法', listening: '聽力' }
  const en = { mix: 'Mix', vocabulary: 'Words', grammar: 'Grammar', listening: 'Listening' }
  return (language === 'zh' ? zh : en)[track]
}

function nextTrack(track: GameTrack, profile: LearnerProfile) {
  if (track !== 'mix') return track
  const roll = Math.random()
  if (profile.listeningEnabled && roll < 0.22) return 'listening'
  if (roll < 0.48) return 'grammar'
  return 'vocabulary'
}

function copyChallengeForReview(challenge: Challenge): Challenge {
  return {
    ...challenge,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}-review`,
    reviewOf: challenge.reviewOf ?? challenge.id,
    choices: challenge.choices ? shuffle(challenge.choices) : undefined,
    tokens: challenge.tokens ? shuffle(challenge.tokens) : undefined,
  }
}

export function EnglishCasualPracticeV6({ language, profile, history, setHistory, onOpenWord }: Props) {
  const entries = useMemo(buildEntries, [])
  const level = userLevel(profile)
  const [phase, setPhase] = useState<SessionPhase>('setup')
  const [track, setTrack] = useState<GameTrack>('mix')
  const [range, setRange] = useState<GameRange>('adaptive')
  const [sessionLength, setSessionLength] = useState<SessionLength>(10)
  const [stats, setStats] = useState<SessionStats>(EMPTY_STATS)
  const [recentEntries, setRecentEntries] = useState<string[]>([])
  const [recentGrammar, setRecentGrammar] = useState<string[]>([])
  const [reviewQueue, setReviewQueue] = useState<ReviewItem[]>([])
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [response, setResponse] = useState('')
  const [feedback, setFeedback] = useState<{ score: number; text: string; explanation: string } | null>(null)
  const [orderedTokens, setOrderedTokens] = useState<Token[]>([])
  const [showHint, setShowHint] = useState(false)
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'unsupported'>('idle')

  const buildNextChallenge = (nextStats: SessionStats, queue: ReviewItem[], previousKind: ChallengeKind | null) => {
    const due = queue.find((item) => item.dueAt <= nextStats.attempts + 1)
    if (due) return { next: copyChallengeForReview(due.challenge), remaining: queue.filter((item) => item !== due) }

    const selectedTrack = nextTrack(track, profile)
    if (selectedTrack === 'grammar') {
      const question = chooseGrammarQuestion(level, recentGrammar, nextStats)
      return { next: grammarChallenge(question, level, language), remaining: queue }
    }
    const entry = chooseEntry(entries, range, level, history, recentEntries, nextStats)
    return { next: vocabularyChallenge(entry, selectedTrack, previousKind, language), remaining: queue }
  }

  const startSession = () => {
    const initialStats = EMPTY_STATS
    const built = buildNextChallenge(initialStats, [], null)
    setStats(initialStats)
    setReviewQueue([])
    setRecentEntries([])
    setRecentGrammar([])
    setChallenge(built.next)
    setResponse('')
    setFeedback(null)
    setOrderedTokens([])
    setShowHint(false)
    setVoiceState('idle')
    setPhase('playing')
  }

  const recordHistory = (score: number, active: Challenge) => {
    setHistory((current) => {
      const today = englishTodayKey()
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
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
    const finalAnswer = challenge.kind === 'sentence-order' ? orderedTokens.map((item) => item.text).join(' ') : answerText
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

    setResponse(finalAnswer)
    setStats(nextStats)
    setFeedback({
      score: result.score,
      text: smartGradeLabel(result, challenge.answer, language),
      explanation: challenge.explanation,
    })
    recordHistory(result.score, challenge)

    if (result.score < 0.75 && nextStats.attempts + 2 < sessionLength) {
      setReviewQueue((current) => [...current, { challenge, dueAt: nextStats.attempts + 2 }])
    }
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!challenge) return
    const value = challenge.kind === 'sentence-order' ? orderedTokens.map((item) => item.text).join(' ') : response
    if (value.trim()) grade(value)
  }

  const moveNext = () => {
    if (!challenge) return
    if (stats.attempts >= sessionLength) {
      setPhase('summary')
      return
    }

    const built = buildNextChallenge(stats, reviewQueue, challenge.kind)
    setReviewQueue(built.remaining)
    if (built.next.entry) setRecentEntries((current) => [`${built.next.entry?.id}:${built.next.entry?.level}`, ...current].slice(0, 10))
    if (built.next.grammarId) setRecentGrammar((current) => [built.next.grammarId!, ...current].slice(0, 12))
    setChallenge(built.next)
    setResponse('')
    setFeedback(null)
    setOrderedTokens([])
    setShowHint(false)
    setVoiceState('idle')
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

  if (phase === 'setup') {
    return (
      <section className="english-game-v6-shell setup" data-english-game-v6="setup">
        <header className="english-game-v6-hero">
          <div className="english-game-v6-mascot" aria-hidden="true"><span>●</span><span>●</span><i /></div>
          <div>
            <p className="english-game-v6-kicker">BUBBLE ENGLISH · QUICK PLAY</p>
            <h3>{language === 'zh' ? '今天玩一小回合英文' : 'Play one short English round'}</h3>
            <p>{language === 'zh' ? `目前程度 ${level}。題目會依你的作答調整，答錯的內容會在本回合稍後再出現。` : `Current level ${level}. Difficulty adapts and missed items return later in the round.`}</p>
          </div>
        </header>

        <div className="english-game-v6-section">
          <strong>{language === 'zh' ? '今天想練什麼？' : 'What do you want to practice?'}</strong>
          <div className="english-game-v6-track-grid">
            {(['mix', 'vocabulary', 'grammar', 'listening'] as GameTrack[]).map((item) => (
              <button type="button" key={item} className={track === item ? 'active' : ''} onClick={() => setTrack(item)}>
                <span>{item === 'mix' ? '✦' : item === 'vocabulary' ? 'Aa' : item === 'grammar' ? '▦' : '◖'}</span>
                <strong>{trackLabel(item, language)}</strong>
                <small>{language === 'zh'
                  ? item === 'mix' ? '單字＋文法＋聽力混合' : item === 'vocabulary' ? '意思、拼字、填空、字卡' : item === 'grammar' ? '依程度抽句型與改錯' : '聽音辨字與拼寫'
                  : item === 'mix' ? 'Words + grammar + listening' : item === 'vocabulary' ? 'Meaning, spelling, cloze, cards' : item === 'grammar' ? 'Adaptive grammar and correction' : 'Audio recall and dictation'}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="english-game-v6-config-row">
          <div>
            <strong>{language === 'zh' ? '難度' : 'Difficulty'}</strong>
            <div className="english-game-v6-segmented">{(Object.keys(rangeCopy) as GameRange[]).map((item) => <button type="button" className={range === item ? 'active' : ''} key={item} onClick={() => setRange(item)}>{rangeCopy[item]}</button>)}</div>
          </div>
          <div>
            <strong>{language === 'zh' ? '一回合' : 'Round length'}</strong>
            <div className="english-game-v6-segmented">{([10, 15, 20] as SessionLength[]).map((item) => <button type="button" className={sessionLength === item ? 'active' : ''} key={item} onClick={() => setSessionLength(item)}>{item} {language === 'zh' ? '題' : 'items'}</button>)}</div>
          </div>
        </div>

        <button className="english-game-v6-start" type="button" onClick={startSession}>{language === 'zh' ? '開始這一回合' : 'Start this round'} <span>→</span></button>
        <p className="english-game-v6-source">{language === 'zh' ? `詞彙依 CEFR 分級；文法題使用已整理的句型題庫。共 ${entries.length.toLocaleString()} 個可用詞條。` : `${entries.length.toLocaleString()} CEFR-linked word entries plus the curated grammar bank.`}</p>
      </section>
    )
  }

  if (phase === 'summary') {
    return (
      <section className="english-game-v6-shell summary" data-english-game-v6="summary">
        <div className="english-game-v6-summary-mark">✓</div>
        <p className="english-game-v6-kicker">ROUND COMPLETE</p>
        <h3>{language === 'zh' ? '這一回合完成了' : 'Round complete'}</h3>
        <p>{language === 'zh' ? '重點不是一次全答對，而是把不熟的內容重新叫回來。' : 'The goal is not perfection on the first try; it is bringing weak items back into memory.'}</p>
        <div className="english-game-v6-summary-grid">
          <div><strong>{accuracy}%</strong><span>{language === 'zh' ? '本回合正確率' : 'Accuracy'}</span></div>
          <div><strong>{stats.xp}</strong><span>XP</span></div>
          <div><strong>{stats.bestStreak}</strong><span>{language === 'zh' ? '最高連擊' : 'Best streak'}</span></div>
          <div><strong>{stats.reviewHits}</strong><span>{language === 'zh' ? '錯題回流' : 'Review returns'}</span></div>
        </div>
        <div className="english-game-v6-summary-actions">
          <button type="button" onClick={() => setPhase('setup')}>{language === 'zh' ? '調整模式' : 'Change mode'}</button>
          <button className="primary" type="button" onClick={startSession}>{language === 'zh' ? '再玩一回合' : 'Play again'}</button>
        </div>
      </section>
    )
  }

  if (!challenge) return null

  return (
    <section className="english-game-v6-shell playing" data-english-game-v6="playing">
      <header className="english-game-v6-topbar">
        <button type="button" aria-label={language === 'zh' ? '離開回合' : 'Leave round'} onClick={() => setPhase('setup')}>×</button>
        <div className="english-game-v6-progress"><i style={{ width: `${progress}%` }} /></div>
        <div className="english-game-v6-xp"><strong>{stats.xp}</strong><span>XP</span></div>
      </header>

      <div className="english-game-v6-status-row">
        <span>{kindLabel(challenge.kind, language)}</span>
        <span>{challenge.level}</span>
        {challenge.reviewOf ? <span className="review">↻ {language === 'zh' ? '再複習一次' : 'Review'}</span> : null}
        {stats.streak >= 2 ? <span className="streak">🔥 {stats.streak}</span> : null}
      </div>

      <article className="english-game-v6-question">
        {challenge.kind === 'dictation' ? (
          <button className="english-game-v6-audio-orb" type="button" onClick={() => speakEnglish(challenge.speakText ?? challenge.answer, profile.accent)} aria-label={language === 'zh' ? '播放英文' : 'Play English audio'}><span>▶</span></button>
        ) : challenge.speakText ? (
          <button className="english-game-v6-mini-audio" type="button" onClick={() => speakEnglish(challenge.speakText ?? challenge.answer, profile.accent)}>🔊 {language === 'zh' ? '聽英文' : 'Listen'}</button>
        ) : null}

        <h4>{challenge.prompt}</h4>
        {challenge.context ? <p className="english-game-v6-context">{challenge.context}</p> : null}

        <form onSubmit={submit}>
          {challenge.choices ? (
            <div className="english-game-v6-choice-grid">
              {challenge.choices.map((choice) => <button type="button" key={choice} disabled={Boolean(feedback)} className={response === choice ? 'active' : ''} onClick={() => setResponse(choice)}>{choice}</button>)}
            </div>
          ) : challenge.tokens ? (
            <div className="english-game-v6-token-task">
              <div className="english-game-v6-token-answer">
                {orderedTokens.length ? orderedTokens.map((token) => <button type="button" disabled={Boolean(feedback)} key={token.id} onClick={() => setOrderedTokens((current) => current.filter((item) => item.id !== token.id))}>{token.text}</button>) : <span>{language === 'zh' ? '依序點下面的字卡' : 'Tap the cards in order'}</span>}
              </div>
              <div className="english-game-v6-token-bank">{availableTokens.map((token) => <button type="button" disabled={Boolean(feedback)} key={token.id} onClick={() => setOrderedTokens((current) => [...current, token])}>{token.text}</button>)}</div>
            </div>
          ) : (
            <div className="english-game-v6-input-wrap">
              <input autoFocus autoComplete="off" spellCheck={false} disabled={Boolean(feedback)} value={response} placeholder={language === 'zh' ? '輸入答案' : 'Type your answer'} onChange={(event) => setResponse(event.target.value)} />
              <button type="button" disabled={Boolean(feedback) || voiceState === 'listening'} onClick={startVoiceInput}>{voiceState === 'listening' ? '●' : '🎙'}</button>
            </div>
          )}

          {!feedback && challenge.hint ? <button className="english-game-v6-hint" type="button" onClick={() => setShowHint((value) => !value)}>{showHint ? (language === 'zh' ? '收起提示' : 'Hide hint') : (language === 'zh' ? '需要提示' : 'Need a hint')}</button> : null}
          {showHint && challenge.hint ? <p className="english-game-v6-hint-text">{challenge.hint}</p> : null}
          {voiceState === 'unsupported' ? <p className="english-game-v6-hint-text">{language === 'zh' ? '這個瀏覽器目前不支援語音輸入，仍可使用鍵盤作答。' : 'Voice input is not supported in this browser; keyboard input still works.'}</p> : null}

          {!feedback ? (
            <div className="english-game-v6-actions">
              <button type="button" onClick={() => grade('', true)}>{language === 'zh' ? '我不知道' : 'I don’t know'}</button>
              <button className="primary" type="submit" disabled={challenge.kind === 'sentence-order' ? orderedTokens.length === 0 : !response.trim()}>{language === 'zh' ? '確認' : 'Check'}</button>
            </div>
          ) : (
            <div className={`english-game-v6-feedback ${feedback.score >= 0.75 ? 'correct' : 'wrong'}`} aria-live="polite">
              <div className="english-game-v6-feedback-title"><strong>{feedback.score >= 0.75 ? '✓' : '↻'}</strong><span>{feedback.text}</span></div>
              <p>{feedback.explanation}</p>
              {feedback.score < 0.75 ? <p className="answer">{language === 'zh' ? '正確答案：' : 'Answer: '}<strong>{challenge.answer}</strong></p> : null}
              <div className="english-game-v6-feedback-actions">
                {challenge.entry?.detail ? <button type="button" onClick={() => onOpenWord(challenge.entry?.detail?.id ?? challenge.entry?.id ?? '')}>{language === 'zh' ? '看單字卡' : 'Word card'}</button> : <span />}
                <button className="primary" type="button" onClick={moveNext}>{stats.attempts >= sessionLength ? (language === 'zh' ? '看結果' : 'See results') : (language === 'zh' ? '繼續' : 'Continue')}</button>
              </div>
            </div>
          )}
        </form>
      </article>

      <footer className="english-game-v6-round-footer">
        <span>{stats.attempts}/{sessionLength}</span>
        <span>{language === 'zh' ? `正確率 ${accuracy}%` : `${accuracy}% accuracy`}</span>
        <span>{language === 'zh' ? `待回流 ${reviewQueue.length}` : `${reviewQueue.length} queued reviews`}</span>
      </footer>
      <small className="english-game-v6-data-note">{CEFR_SOURCE_NOTE} · {LEVELS.map((item) => `${item} ${CEFR_LEVEL_COUNTS[item].toLocaleString()}`).join(' · ')}</small>
    </section>
  )
}
