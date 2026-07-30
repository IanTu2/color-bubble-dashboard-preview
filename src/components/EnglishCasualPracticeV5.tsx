import { useMemo, useState } from 'react'
import type { Dispatch, FormEvent, SetStateAction } from 'react'
import { CEFR_LEVEL_COUNTS, CEFR_LEXICON, CEFR_SOURCE_NOTE } from '../generated/cefr-lexicon'
import type { GeneratedCefrLevel } from '../generated/cefr-lexicon'
import { EXPANDED_ENGLISH_WORDS } from '../english-expanded-data'
import type { ExpandedEnglishWord } from '../english-expanded-data'
import { smartGradeEnglishAnswer, smartGradeLabel, targetLetterHint } from '../english-smart-grading'
import { englishTodayKey, speakEnglish } from '../english-learning'
import type { LearnerProfile, LearningHistory } from '../english-learning'
import type { Language } from '../types'

type GameRange = 'adaptive' | 'learned' | 'challenge' | 'all'
type ChallengeMode = 'meaning' | 'translation' | 'listening' | 'cloze' | 'repair' | 'unscramble' | 'pos'

type GameEntry = {
  id: string
  word: string
  pos: string
  level: GeneratedCefrLevel
  source: string
  topic: string
  detail: ExpandedEnglishWord | null
}

type Challenge = {
  id: string
  entry: GameEntry
  mode: ChallengeMode
  prompt: string
  answer: string
  acceptedAnswers: string[]
  choices?: string[]
  context?: string
  hint?: string
  speakText?: string
}

type Stats = {
  attempts: number
  points: number
  streak: number
  bestStreak: number
  lastScore: number
}

type Props = {
  language: Language
  profile: LearnerProfile
  history: LearningHistory
  setHistory: Dispatch<SetStateAction<LearningHistory>>
  onOpenWord: (wordId: string) => void
}

const LEVELS: GeneratedCefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const POS_CHOICES = ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'pronoun', 'determiner']
const EMPTY_STATS: Stats = { attempts: 0, points: 0, streak: 0, bestStreak: 0, lastScore: 1 }

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

function offsetLevel(level: GeneratedCefrLevel, offset: number) {
  const index = LEVELS.indexOf(level)
  return LEVELS[Math.max(0, Math.min(LEVELS.length - 1, index + offset))]
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

function scrambledLetters(word: string) {
  return shuffle(word.replace(/[^A-Za-z]/g, '').toLowerCase().split('')).join(' · ')
}

function stableLetters(word: string) {
  return word.replace(/[^A-Za-z]/g, '').toLowerCase().split('').sort().join(' · ')
}

function chooseEntry(
  entries: GameEntry[],
  range: GameRange,
  level: GeneratedCefrLevel,
  history: LearningHistory,
  recent: string[],
  stats: Stats,
) {
  const filtered = entries.filter((entry) => !recent.includes(`${entry.id}:${entry.level}`))
  const pool = filtered.length > 20 ? filtered : entries
  const byLevel = (target: GeneratedCefrLevel) => pool.filter((entry) => entry.level === target)
  const safePick = (items: GameEntry[]) => pick(items.length > 0 ? items : pool)

  if (range === 'all') return safePick(pool)
  if (range === 'learned') {
    const known = new Set([...history.learnedWordIds, ...history.difficultWordIds])
    const learned = pool.filter((entry) => known.has(entry.id))
    return learned.length > 0 ? pick(learned) : safePick(byLevel(level))
  }
  if (range === 'challenge') {
    return Math.random() < 0.75 ? safePick(byLevel(offsetLevel(level, 1))) : safePick(byLevel(level))
  }

  const difficult = new Set(history.difficultWordIds)
  const difficultPool = pool.filter((entry) => difficult.has(entry.id) && [level, offsetLevel(level, -1)].includes(entry.level))
  if (stats.lastScore < 0.5 && Math.random() < 0.55) return safePick(byLevel(offsetLevel(level, -1)))
  if (stats.streak >= 5 && Math.random() < 0.28) return safePick(byLevel(offsetLevel(level, 1)))

  const roll = Math.random()
  if (roll < 0.35 && difficultPool.length > 0) return pick(difficultPool)
  if (roll < 0.75) return safePick(byLevel(level))
  if (roll < 0.9) return safePick(byLevel(offsetLevel(level, -1)))
  return safePick(byLevel(offsetLevel(level, 1)))
}

function buildChallenge(entry: GameEntry, previous: ChallengeMode | null, language: Language): Challenge {
  const detail = entry.detail
  const modes: ChallengeMode[] = detail
    ? ['meaning', 'translation', 'listening', 'cloze', 'repair', 'unscramble', 'pos']
    : ['listening', 'repair', 'unscramble', 'pos']
  const alternatives = modes.filter((mode) => mode !== previous)
  const mode = pick(alternatives.length > 0 ? alternatives : modes)
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}-${entry.id}-${mode}`

  if (mode === 'meaning' && detail) {
    return {
      id,
      entry,
      mode,
      prompt: language === 'zh' ? `「${entry.word}」最接近哪個意思？` : `Which meaning best matches “${entry.word}”?`,
      answer: detail.meaning,
      acceptedAnswers: [],
      choices: uniqueChoices(detail.meaning, EXPANDED_ENGLISH_WORDS.filter((item) => item.id !== detail.id).map((item) => item.meaning)),
      context: `${entry.level} · ${entry.pos}`,
    }
  }

  if (mode === 'translation' && detail) {
    return {
      id,
      entry,
      mode,
      prompt: detail.example.replace(new RegExp(detail.word, 'i'), '________'),
      answer: detail.word,
      acceptedAnswers: detail.acceptedTranslations,
      context: language === 'zh' ? `中文：${detail.exampleZh}` : detail.definition,
      hint: `${detail.meaning} · ${targetLetterHint(detail.word)} · ${detail.partOfSpeech}`,
    }
  }

  if (mode === 'cloze' && detail) {
    return {
      id,
      entry,
      mode,
      prompt: detail.example.replace(new RegExp(detail.word, 'i'), '________'),
      answer: detail.word,
      acceptedAnswers: [],
      context: language === 'zh' ? `中文：${detail.exampleZh}` : detail.definition,
      hint: `${targetLetterHint(detail.word)} · ${detail.partOfSpeech}`,
    }
  }

  if (mode === 'pos') {
    return {
      id,
      entry,
      mode,
      prompt: language === 'zh' ? `「${entry.word}」在這筆分級資料中的詞性是？` : `What is the listed part of speech for “${entry.word}”?`,
      answer: entry.pos,
      acceptedAnswers: [],
      choices: uniqueChoices(entry.pos, POS_CHOICES),
      context: `${entry.level}${entry.topic ? ` · ${entry.topic}` : ''}`,
    }
  }

  if (mode === 'unscramble') {
    return {
      id,
      entry,
      mode,
      prompt: language === 'zh' ? `重新排列字母：${scrambledLetters(entry.word)}` : `Unscramble: ${scrambledLetters(entry.word)}`,
      answer: entry.word,
      acceptedAnswers: [],
      context: `${entry.level} · ${entry.pos}`,
      hint: targetLetterHint(entry.word),
    }
  }

  if (mode === 'repair') {
    return {
      id,
      entry,
      mode,
      prompt: language === 'zh' ? `請修復拼字：${targetLetterHint(entry.word)}` : `Repair the spelling: ${targetLetterHint(entry.word)}`,
      answer: entry.word,
      acceptedAnswers: [],
      context: `${entry.level} · ${entry.pos}${entry.topic ? ` · ${entry.topic}` : ''}`,
      hint: language === 'zh' ? `可用字母：${scrambledLetters(entry.word)}` : `Letters: ${scrambledLetters(entry.word)}`,
    }
  }

  return {
    id,
    entry,
    mode: 'listening',
    prompt: language === 'zh' ? '播放發音後，輸入你聽到的單字或片語。' : 'Play the audio and type the word or phrase you hear.',
    answer: entry.word,
    acceptedAnswers: [],
    context: `${entry.level} · ${entry.pos}${entry.topic ? ` · ${entry.topic}` : ''}`,
    hint: `${targetLetterHint(entry.word)} · ${entry.pos}`,
    speakText: entry.word,
  }
}

function modeLabel(mode: ChallengeMode, language: Language) {
  const zh = { meaning: '意思辨識', translation: '情境翻譯', listening: '聽力拼字', cloze: '句子填空', repair: '拼字修復', unscramble: '字母重組', pos: '詞性辨識' }
  const en = { meaning: 'Meaning', translation: 'Context translation', listening: 'Dictation', cloze: 'Cloze', repair: 'Spelling repair', unscramble: 'Unscramble', pos: 'Part of speech' }
  return (language === 'zh' ? zh : en)[mode]
}

export function EnglishCasualPracticeV5({ language, profile, history, setHistory, onOpenWord }: Props) {
  const entries = useMemo(buildEntries, [])
  const level = userLevel(profile)
  const [range, setRange] = useState<GameRange>('adaptive')
  const [recent, setRecent] = useState<string[]>([])
  const [stats, setStats] = useState<Stats>(EMPTY_STATS)
  const [challenge, setChallenge] = useState<Challenge>(() => buildChallenge(chooseEntry(entries, 'adaptive', level, history, [], EMPTY_STATS), null, language))
  const [response, setResponse] = useState('')
  const [feedback, setFeedback] = useState<{ score: number; text: string } | null>(null)

  const recordHistory = (score: number) => {
    setHistory((current) => {
      const today = englishTodayKey()
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
      return {
        ...current,
        attempts: current.attempts + 1,
        correct: current.correct + (score >= 0.75 ? 1 : 0),
        learnedWordIds: score === 1 ? Array.from(new Set([...current.learnedWordIds, challenge.entry.id])) : current.learnedWordIds,
        difficultWordIds: score < 0.75
          ? Array.from(new Set([...current.difficultWordIds, challenge.entry.id]))
          : current.difficultWordIds.filter((id) => id !== challenge.entry.id),
        streak: current.lastStudyDate === today ? current.streak : current.lastStudyDate === yesterday ? current.streak + 1 : 1,
        lastStudyDate: today,
      }
    })
  }

  const grade = (answerText: string, unknown = false) => {
    if (feedback) return
    const result = unknown
      ? { score: 0, kind: 'wrong' as const, matchedAnswer: null }
      : smartGradeEnglishAnswer(answerText, challenge.answer, challenge.acceptedAnswers)
    const note = challenge.entry.detail?.memory ?? (language === 'zh'
      ? `此題來自 ${challenge.entry.source}；大量詞庫只使用可驗證的分級、詞性、發音與拼字資料。`
      : `This item comes from ${challenge.entry.source}; the large bank uses verified level, POS, audio, and spelling data.`)

    setResponse(answerText)
    setFeedback({ score: result.score, text: `${smartGradeLabel(result, challenge.answer, language)} ${note}` })
    setStats((current) => {
      const streak = result.score === 1 ? current.streak + 1 : 0
      return { attempts: current.attempts + 1, points: current.points + result.score, streak, bestStreak: Math.max(current.bestStreak, streak), lastScore: result.score }
    })
    recordHistory(result.score)
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (response.trim()) grade(response)
  }

  const moveNext = (nextRange = range, reset = false) => {
    const nextRecent = [`${challenge.entry.id}:${challenge.entry.level}`, ...recent].slice(0, 5)
    const nextStats = reset ? EMPTY_STATS : stats
    const entry = chooseEntry(entries, nextRange, level, history, nextRecent, nextStats)
    setChallenge(buildChallenge(entry, challenge.mode, language))
    setRecent(nextRecent)
    setResponse('')
    setFeedback(null)
    if (reset) setStats(EMPTY_STATS)
  }

  const switchRange = (nextRange: GameRange) => {
    setRange(nextRange)
    setRecent([])
    moveNext(nextRange, true)
  }

  const accuracy = stats.attempts > 0 ? Math.round((stats.points / stats.attempts) * 100) : 0
  const rangeLabels = language === 'zh'
    ? { adaptive: '依我的程度', learned: '只複習學過的', challenge: '挑戰下一級', all: '全程度隨機' }
    : { adaptive: 'My level', learned: 'Learned only', challenge: 'Next-level challenge', all: 'All levels' }
  const visiblePrompt = challenge.mode === 'repair'
    ? (language === 'zh'
      ? `請修復拼字：${targetLetterHint(challenge.answer)}`
      : `Repair the spelling: ${targetLetterHint(challenge.answer)}`)
    : challenge.prompt
  const visibleHint = challenge.mode === 'repair'
    ? (language === 'zh'
      ? `可用字母：${stableLetters(challenge.answer)}`
      : `Letters: ${stableLetters(challenge.answer)}`)
    : challenge.hint

  return (
    <div className="casual-practice-layout">
      <section className="casual-practice-card">
        <header className="casual-practice-head">
          <div>
            <p className="eyebrow">CEFR ADAPTIVE WORD GAME</p>
            <h3>{language === 'zh' ? '程度自適應單字遊戲' : 'Level-adaptive word game'}</h3>
            <p>{language === 'zh' ? `目前程度 ${level}；預設同級為主，混合前一級、錯題與少量下一級。` : `Current level: ${level}.`}</p>
          </div>
          <button type="button" onClick={() => moveNext(range, true)}>{language === 'zh' ? '重新開始' : 'Restart'}</button>
        </header>

        <div className="english-chip-grid" style={{ marginBottom: 14 }}>
          {(Object.keys(rangeLabels) as GameRange[]).map((item) => (
            <button className={range === item ? 'active' : ''} type="button" key={item} onClick={() => switchRange(item)}>{rangeLabels[item]}</button>
          ))}
        </div>

        <div className="casual-session-stats">
          <div><strong>{stats.attempts}</strong><span>{language === 'zh' ? '本次題數' : 'Items'}</span></div>
          <div><strong>{accuracy}%</strong><span>{language === 'zh' ? '加權正確率' : 'Accuracy'}</span></div>
          <div><strong>{stats.streak}</strong><span>{language === 'zh' ? '目前連擊' : 'Streak'}</span></div>
          <div><strong>{stats.bestStreak}</strong><span>{language === 'zh' ? '最高連擊' : 'Best'}</span></div>
        </div>

        <article className="casual-challenge" key={challenge.id}>
          <div className="casual-challenge-meta"><span>{modeLabel(challenge.mode, language)}</span><span>{challenge.entry.level} · {challenge.entry.pos}</span></div>
          <h4>{visiblePrompt}</h4>
          {challenge.context ? <p className="casual-challenge-context">{challenge.context}</p> : null}
          {visibleHint ? <p className="casual-challenge-context">{language === 'zh' ? '提示：' : 'Hint: '}{visibleHint}</p> : null}
          {challenge.speakText ? <button className="listen-button" type="button" onClick={() => speakEnglish(challenge.speakText ?? challenge.answer, profile.accent)}>🔊 {language === 'zh' ? '播放發音' : 'Play audio'}</button> : null}

          <form onSubmit={submit}>
            {challenge.choices ? (
              <div className="casual-choice-grid">
                {challenge.choices.map((choice) => <button className={response === choice ? 'active' : ''} type="button" key={choice} disabled={Boolean(feedback)} onClick={() => setResponse(choice)}>{choice}</button>)}
              </div>
            ) : (
              <input autoFocus autoComplete="off" disabled={Boolean(feedback)} value={response} placeholder={language === 'zh' ? '輸入答案' : 'Type your answer'} onChange={(event) => setResponse(event.target.value)} />
            )}

            {!feedback ? (
              <div className="casual-actions">
                <button type="button" onClick={() => grade('', true)}>{language === 'zh' ? '我不知道' : 'I do not know'}</button>
                <button className="primary-button" type="submit" disabled={!response.trim()}>{language === 'zh' ? '檢查答案' : 'Check'}</button>
              </div>
            ) : (
              <div className={`casual-feedback score-${feedback.score}`}>
                <strong>{feedback.score === 1 ? '✓' : feedback.score >= 0.75 ? '◒' : feedback.score === 0.5 ? '△' : '✕'}</strong>
                <p>{feedback.text}</p>
                <div>
                  {challenge.entry.detail ? <button type="button" onClick={() => onOpenWord(challenge.entry.detail?.id ?? challenge.entry.id)}>{language === 'zh' ? '查看完整單字卡' : 'Open word card'}</button> : null}
                  <button className="primary-button" type="button" onClick={() => moveNext()}>{language === 'zh' ? '下一題' : 'Next'}</button>
                </div>
              </div>
            )}
          </form>
        </article>
      </section>

      <aside className="casual-practice-info">
        <span>{language === 'zh' ? `${entries.length.toLocaleString()} 個可玩詞條` : `${entries.length.toLocaleString()} playable entries`}</span>
        <h4>{language === 'zh' ? '各級資料量' : 'Entries by level'}</h4>
        <ul>{LEVELS.map((item) => <li key={item}>{item}：{CEFR_LEVEL_COUNTS[item].toLocaleString()}</li>)}</ul>
        <p>{language === 'zh' ? '詳細中文詞條使用情境翻譯與意思題；大量詞庫使用聽力、拼字、字母重組與詞性題，不會為了湊數捏造中文解釋。' : 'Curated entries use Chinese-rich tasks; the full bank uses verified audio, spelling, and POS tasks.'}</p>
        <small>{CEFR_SOURCE_NOTE}</small>
      </aside>
    </div>
  )
}
