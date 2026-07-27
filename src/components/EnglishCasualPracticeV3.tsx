import { useMemo, useState } from 'react'
import type { Dispatch, FormEvent, SetStateAction } from 'react'
import { CEFR_LEVEL_COUNTS, CEFR_LEXICON, CEFR_SOURCE_NOTE } from '../generated/cefr-lexicon'
import type { GeneratedCefrEntry, GeneratedCefrLevel } from '../generated/cefr-lexicon'
import { EXPANDED_ENGLISH_WORDS } from '../english-expanded-data'
import type { ExpandedEnglishWord } from '../english-expanded-data'
import { smartGradeEnglishAnswer, smartGradeLabel, targetLetterHint } from '../english-smart-grading'
import { englishTodayKey, normalizeEnglishAnswer, speakEnglish } from '../english-learning'
import type { LearnerProfile, LearningHistory } from '../english-learning'
import type { Language } from '../types'

type GameRange = 'adaptive' | 'learned' | 'challenge' | 'all'
type ChallengeMode = 'meaning' | 'translation' | 'listening' | 'cloze' | 'synonym' | 'antonym' | 'collocation' | 'sentence' | 'repair' | 'unscramble' | 'pos' | 'level'

type GameEntry = {
  id: string
  word: string
  pos: string
  level: GeneratedCefrLevel
  source: string
  topic: string
  note: string
  detail: ExpandedEnglishWord | null
}

type CasualChallenge = {
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

type SessionStats = {
  attempts: number
  correctPoints: number
  exactStreak: number
  bestStreak: number
  lastScore: number
}

type EnglishCasualPracticeV3Props = {
  language: Language
  profile: LearnerProfile
  history: LearningHistory
  setHistory: Dispatch<SetStateAction<LearningHistory>>
  onOpenWord: (wordId: string) => void
}

const LEVELS: GeneratedCefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const POS_OPTIONS = ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'pronoun', 'determiner']

function shuffleArray<T>(items: T[]) {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }
  return result
}

function pickRandom<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)]
}

function uniqueChoices(answer: string, candidates: string[]) {
  const normalizedAnswer = answer.toLowerCase()
  const distinct = Array.from(new Set(candidates.filter((item) => item && item.toLowerCase() !== normalizedAnswer)))
  return shuffleArray([answer, ...shuffleArray(distinct).slice(0, 3)])
}

function firstVariant(word: string) {
  return word.split('/')[0]?.trim() || word.trim()
}

function gameEntryId(word: string) {
  return firstVariant(word).toLowerCase()
}

function buildGameEntries() {
  const detailByWord = new Map(EXPANDED_ENGLISH_WORDS.map((word) => [word.word.toLowerCase(), word]))
  const seen = new Set<string>()
  const result: GameEntry[] = []

  for (const item of CEFR_LEXICON) {
    const word = firstVariant(item.word)
    const key = `${word.toLowerCase()}|${item.level}`
    if (!word || seen.has(key)) continue
    seen.add(key)
    result.push({
      id: gameEntryId(word),
      word,
      pos: item.pos,
      level: item.level,
      source: item.source,
      topic: item.topic,
      note: item.note,
      detail: detailByWord.get(word.toLowerCase()) ?? null,
    })
  }

  for (const detail of EXPANDED_ENGLISH_WORDS) {
    const level = LEVELS[Math.max(0, Math.min(LEVELS.length - 1, detail.level - 1))]
    const key = `${detail.word.toLowerCase()}|${level}`
    if (seen.has(key)) continue
    seen.add(key)
    result.push({
      id: detail.id,
      word: detail.word,
      pos: detail.partOfSpeech,
      level,
      source: 'Bubble English curated',
      topic: '',
      note: '',
      detail,
    })
  }

  return result
}

function levelAround(level: GeneratedCefrLevel, offset: number) {
  const index = LEVELS.indexOf(level)
  return LEVELS[Math.max(0, Math.min(LEVELS.length - 1, index + offset))]
}

function learnerLevel(profile: LearnerProfile): GeneratedCefrLevel {
  return LEVELS.includes(profile.level as GeneratedCefrLevel) ? profile.level as GeneratedCefrLevel : 'A2'
}

function shuffledLetters(word: string) {
  const letters = word.replace(/[^A-Za-z]/g, '').toLowerCase().split('')
  let shuffled = shuffleArray(letters)
  if (shuffled.join('') === letters.join('') && letters.length > 2) shuffled = [...letters.slice(1), letters[0]]
  return shuffled.join(' · ')
}

function chooseEntry(
  entries: GameEntry[],
  range: GameRange,
  level: GeneratedCefrLevel,
  history: LearningHistory,
  recentIds: string[],
  lastScore: number,
  exactStreak: number,
) {
  const nonRecent = entries.filter((entry) => !recentIds.includes(`${entry.id}:${entry.level}`))
  const available = nonRecent.length > 20 ? nonRecent : entries
  const learnedIds = new Set([...history.learnedWordIds, ...history.difficultWordIds])
  const difficultIds = new Set(history.difficultWordIds)

  const pickFrom = (pool: GameEntry[]) => pickRandom(pool.length > 0 ? pool : available)
  const atLevel = (target: GeneratedCefrLevel) => available.filter((entry) => entry.level === target)

  if (range === 'all') return pickFrom(available)
  if (range === 'learned') {
    const learned = available.filter((entry) => learnedIds.has(entry.id))
    return learned.length > 0 ? pickRandom(learned) : pickFrom(atLevel(level))
  }
  if (range === 'challenge') {
    const challengeLevel = levelAround(level, 1)
    return Math.random() < 0.75 ? pickFrom(atLevel(challengeLevel)) : pickFrom(atLevel(level))
  }

  const current = atLevel(level)
  const previous = atLevel(levelAround(level, -1))
  const next = atLevel(levelAround(level, 1))
  const difficult = available.filter((entry) => difficultIds.has(entry.id) && (entry.level === level || entry.level === levelAround(level, -1)))

  if (lastScore < 0.5 && previous.length > 0 && Math.random() < 0.55) return pickRandom(previous)
  if (exactStreak >= 5 && next.length > 0 && Math.random() < 0.28) return pickRandom(next)

  const roll = Math.random()
  if (roll < 0.35 && difficult.length > 0) return pickRandom(difficult)
  if (roll < 0.75) return pickFrom(current)
  if (roll < 0.9) return pickFrom(previous)
  return pickFrom(next)
}

function buildChallenge(entry: GameEntry, previousMode: ChallengeMode | null, language: Language): CasualChallenge {
  const detail = entry.detail
  const richModes: ChallengeMode[] = detail
    ? ['meaning', 'translation', 'listening', 'cloze', 'synonym', 'antonym', 'collocation', 'sentence', 'repair', 'unscramble', 'pos']
    : ['listening', 'repair', 'unscramble', 'pos', 'level']
  const allowedModes = richModes.filter((mode) => mode !== previousMode)
    .filter((mode) => mode !== 'antonym' || Boolean(detail?.antonyms.length))
    .filter((mode) => mode !== 'synonym' || Boolean(detail?.synonyms.length))
    .filter((mode) => mode !== 'collocation' || Boolean(detail?.collocations.length))
  const mode = pickRandom(allowedModes.length > 0 ? allowedModes : richModes)
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}-${entry.id}-${mode}`

  if (mode === 'meaning' && detail) {
    const others = EXPANDED_ENGLISH_WORDS.filter((item) => item.id !== detail.id)
    return {
      id, entry, mode,
      prompt: language === 'zh' ? `「${entry.word}」最接近哪個意思？` : `Which meaning best matches “${entry.word}”?`,
      answer: detail.meaning,
      acceptedAnswers: [],
      choices: uniqueChoices(detail.meaning, others.map((item) => item.meaning)),
      context: `${entry.level} · ${entry.pos}`,
    }
  }

  if (mode === 'translation' && detail) {
    return {
      id, entry, mode,
      prompt: detail.example.replace(new RegExp(detail.word, 'i'), '________'),
      answer: detail.word,
      acceptedAnswers: detail.acceptedTranslations,
      context: language === 'zh' ? `中文：${detail.exampleZh}` : detail.definition,
      hint: `${detail.meaning} · ${targetLetterHint(detail.word)} · ${detail.partOfSpeech}`,
    }
  }

  if (mode === 'listening') {
    return {
      id, entry, mode,
      prompt: language === 'zh' ? '播放發音後，輸入你聽到的單字或片語。' : 'Play the audio and type the word or phrase you hear.',
      answer: entry.word,
      acceptedAnswers: [],
      context: `${entry.level} · ${entry.pos}${entry.topic ? ` · ${entry.topic}` : ''}`,
      hint: `${targetLetterHint(entry.word)} · ${entry.pos}`,
      speakText: entry.word,
    }
  }

  if (mode === 'cloze' && detail) {
    return {
      id, entry, mode,
      prompt: detail.example.replace(new RegExp(detail.word, 'i'), '________'),
      answer: detail.word,
      acceptedAnswers: [],
      context: language === 'zh' ? `中文：${detail.exampleZh}` : detail.definition,
      hint: `${targetLetterHint(detail.word)} · ${detail.partOfSpeech}`,
    }
  }

  if (mode === 'synonym' && detail) {
    const answer = pickRandom(detail.synonyms)
    return {
      id, entry, mode,
      prompt: language === 'zh' ? `哪個字最接近「${detail.word}」？` : `Which word is closest in meaning to “${detail.word}”?`,
      answer,
      acceptedAnswers: [],
      choices: uniqueChoices(answer, EXPANDED_ENGLISH_WORDS.flatMap((item) => item.synonyms)),
      context: detail.definition,
    }
  }

  if (mode === 'antonym' && detail) {
    const answer = pickRandom(detail.antonyms)
    return {
      id, entry, mode,
      prompt: language === 'zh' ? `哪個字是「${detail.word}」的反義詞？` : `Which word is an antonym of “${detail.word}”?`,
      answer,
      acceptedAnswers: [],
      choices: uniqueChoices(answer, EXPANDED_ENGLISH_WORDS.flatMap((item) => item.antonyms)),
      context: detail.meaning,
    }
  }

  if (mode === 'collocation' && detail) {
    const answer = pickRandom(detail.collocations)
    return {
      id, entry, mode,
      prompt: language === 'zh' ? `哪個搭配最適合「${detail.word}」？` : `Which collocation best matches “${detail.word}”?`,
      answer,
      acceptedAnswers: [],
      choices: uniqueChoices(answer, EXPANDED_ENGLISH_WORDS.flatMap((item) => item.collocations)),
      context: detail.meaning,
    }
  }

  if (mode === 'sentence' && detail) {
    return {
      id, entry, mode,
      prompt: language === 'zh' ? `請用「${detail.word}」寫一句至少四個英文單字的句子。` : `Write a sentence of at least four words using “${detail.word}”.`,
      answer: detail.word,
      acceptedAnswers: [],
      context: `${detail.meaning} · ${detail.memory}`,
    }
  }

  if (mode === 'pos') {
    return {
      id, entry, mode,
      prompt: language === 'zh' ? `「${entry.word}」在這筆 CEFR 詞條中的詞性是？` : `What is the listed part of speech for “${entry.word}”?`,
      answer: entry.pos,
      acceptedAnswers: [],
      choices: uniqueChoices(entry.pos, POS_OPTIONS),
      context: `${entry.level}${entry.topic ? ` · ${entry.topic}` : ''}`,
    }
  }

  if (mode === 'level') {
    return {
      id, entry, mode,
      prompt: language === 'zh' ? `「${entry.word}」在目前使用的分級資料中屬於哪一級？` : `Which level is “${entry.word}” assigned to in the current profile?`,
      answer: entry.level,
      acceptedAnswers: [],
      choices: uniqueChoices(entry.level, LEVELS),
      context: `${entry.pos} · ${entry.source}`,
    }
  }

  if (mode === 'unscramble') {
    return {
      id, entry, mode,
      prompt: language === 'zh' ? `重新排列字母並輸入完整單字：${shuffledLetters(entry.word)}` : `Unscramble and type the word: ${shuffledLetters(entry.word)}`,
      answer: entry.word,
      acceptedAnswers: [],
      context: `${entry.level} · ${entry.pos}`,
      hint: targetLetterHint(entry.word),
    }
  }

  return {
    id, entry, mode: 'repair',
    prompt: language === 'zh' ? `請修復拼字：${targetLetterHint(entry.word)}` : `Repair the spelling: ${targetLetterHint(entry.word)}`,
    answer: entry.word,
    acceptedAnswers: [],
    context: `${entry.level} · ${entry.pos}${entry.topic ? ` · ${entry.topic}` : ''}`,
    hint: language === 'zh' ? `內部字母：${shuffledLetters(entry.word)}` : `Inner letters: ${shuffledLetters(entry.word)}`,
  }
}

function modeLabel(mode: ChallengeMode, language: Language) {
  const labels = language === 'zh'
    ? { meaning: '意思辨識', translation: '情境翻譯', listening: '聽力拼字', cloze: '句子填空', synonym: '同義詞', antonym: '反義詞', collocation: '常見搭配', sentence: '自由造句', repair: '拼字修復', unscramble: '字母重組', pos: '詞性辨識', level: '分級辨識' }
    : { meaning: 'Meaning', translation: 'Context translation', listening: 'Dictation', cloze: 'Cloze', synonym: 'Synonym', antonym: 'Antonym', collocation: 'Collocation', sentence: 'Sentence', repair: 'Spelling repair', unscramble: 'Unscramble', pos: 'Part of speech', level: 'Level recognition' }
  return labels[mode]
}

export function EnglishCasualPracticeV3({ language, profile, history, setHistory, onOpenWord }: EnglishCasualPracticeV3Props) {
  const entries = useMemo(buildGameEntries, [])
  const currentLevel = learnerLevel(profile)
  const [range, setRange] = useState<GameRange>('adaptive')
  const [recentIds, setRecentIds] = useState<string[]>([])
  const [stats, setStats] = useState<SessionStats>({ attempts: 0, correctPoints: 0, exactStreak: 0, bestStreak: 0, lastScore: 1 })
  const [challenge, setChallenge] = useState<CasualChallenge>(() => {
    const entry = chooseEntry(entries, 'adaptive', currentLevel, history, [], 1, 0)
    return buildChallenge(entry, null, language)
  })
  const [response, setResponse] = useState('')
  const [feedback, setFeedback] = useState<{ score: number; text: string } | null>(null)

  const recordHistory = (score: number) => {
    setHistory((current) => {
      const today = englishTodayKey()
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
      const successful = score >= 0.75
      return {
        ...current,
        attempts: current.attempts + 1,
        correct: current.correct + (successful ? 1 : 0),
        learnedWordIds: score === 1 ? Array.from(new Set([...current.learnedWordIds, challenge.entry.id])) : current.learnedWordIds,
        difficultWordIds: score < 0.75
          ? Array.from(new Set([...current.difficultWordIds, challenge.entry.id]))
          : current.difficultWordIds.filter((id) => id !== challenge.entry.id),
        streak: current.lastStudyDate === today ? current.streak : current.lastStudyDate === yesterday ? current.streak + 1 : 1,
        lastStudyDate: today,
      }
    })
  }

  const gradeResponse = (answerText: string, isUnknown = false) => {
    if (feedback) return
    const grade = isUnknown
      ? { score: 0, kind: 'wrong' as const, matchedAnswer: null }
      : challenge.mode === 'sentence'
        ? normalizeEnglishAnswer(answerText).includes(challenge.entry.word.toLowerCase()) && answerText.trim().split(/\s+/).length >= 4
          ? { score: 1, kind: 'exact' as const, matchedAnswer: challenge.entry.word }
          : { score: 0, kind: 'wrong' as const, matchedAnswer: null }
        : smartGradeEnglishAnswer(answerText, challenge.answer, challenge.acceptedAnswers)

    const memory = challenge.entry.detail?.memory ?? (language === 'zh'
      ? `此詞條來自 ${challenge.entry.source}；大量詞庫目前先提供分級、詞性、聽力與拼字練習。`
      : `This entry comes from ${challenge.entry.source}; the large bank currently supports level, POS, listening, and spelling practice.`)
    const text = [smartGradeLabel(grade, challenge.answer, language), memory].filter(Boolean).join(' ')

    setResponse(answerText)
    setFeedback({ score: grade.score, text })
    setStats((current) => {
      const exactStreak = grade.score === 1 ? current.exactStreak + 1 : 0
      return {
        attempts: current.attempts + 1,
        correctPoints: current.correctPoints + grade.score,
        exactStreak,
        bestStreak: Math.max(current.bestStreak, exactStreak),
        lastScore: grade.score,
      }
    })
    recordHistory(grade.score)
  }

  const submitResponse = (event: FormEvent) => {
    event.preventDefault()
    if (!response.trim()) return
    gradeResponse(response)
  }

  const nextChallenge = (nextRange = range, resetStats = false) => {
    const recentKey = `${challenge.entry.id}:${challenge.entry.level}`
    const nextRecent = [recentKey, ...recentIds.filter((id) => id !== recentKey)].slice(0, 5)
    const nextStats = resetStats ? { attempts: 0, correctPoints: 0, exactStreak: 0, bestStreak: 0, lastScore: 1 } : stats
    const entry = chooseEntry(entries, nextRange, currentLevel, history, nextRecent, nextStats.lastScore, nextStats.exactStreak)
    setRecentIds(nextRecent)
    setChallenge(buildChallenge(entry, challenge.mode, language))
    setResponse('')
    setFeedback(null)
    if (resetStats) setStats(nextStats)
  }

  const changeRange = (nextRange: GameRange) => {
    setRange(nextRange)
    setRecentIds([])
    nextChallenge(nextRange, true)
  }

  const accuracy = stats.attempts > 0 ? Math.round((stats.correctPoints / stats.attempts) * 100) : 0
  const rangeLabels = language === 'zh'
    ? { adaptive: '依我的程度', learned: '只複習學過的', challenge: '挑戰下一級', all: '全程度隨機' }
    : { adaptive: 'My level', learned: 'Learned only', challenge: 'Next-level challenge', all: 'All levels' }

  return (
    <div className="casual-practice-layout">
      <section className="casual-practice-card">
        <header className="casual-practice-head">
          <div>
            <p className="eyebrow">CEFR ADAPTIVE WORD GAME</p>
            <h3>{language === 'zh' ? '程度自適應單字遊戲' : 'Level-adaptive word game'}</h3>
            <p>{language === 'zh'
              ? `目前程度 ${currentLevel}。預設以同級為主，混合前一級複習、錯題與少量下一級挑戰。`
              : `Current level: ${currentLevel}. The default mix prioritizes your level, review, difficult items, and a small next-level challenge.`}</p>
          </div>
          <button type="button" onClick={() => nextChallenge(range, true)}>{language === 'zh' ? '重新開始' : 'Restart'}</button>
        </header>

        <div className="english-chip-grid" style={{ marginBottom: 14 }}>
          {(Object.keys(rangeLabels) as GameRange[]).map((item) => (
            <button className={range === item ? 'active' : ''} type="button" key={item} onClick={() => changeRange(item)}>{rangeLabels[item]}</button>
          ))}
        </div>

        <div className="casual-session-stats">
          <div><strong>{stats.attempts}</strong><span>{language === 'zh' ? '本次題數' : 'Items'}</span></div>
          <div><strong>{accuracy}%</strong><span>{language === 'zh' ? '加權正確率' : 'Weighted accuracy'}</span></div>
          <div><strong>{stats.exactStreak}</strong><span>{language === 'zh' ? '目前全對連擊' : 'Exact streak'}</span></div>
          <div><strong>{stats.bestStreak}</strong><span>{language === 'zh' ? '最高連擊' : 'Best streak'}</span></div>
        </div>

        <article className="casual-challenge" key={challenge.id}>
          <div className="casual-challenge-meta">
            <span>{modeLabel(challenge.mode, language)}</span>
            <span>{challenge.entry.level} · {challenge.entry.pos}</span>
          </div>
          <h4>{challenge.prompt}</h4>
          {challenge.context ? <p className="casual-challenge-context">{challenge.context}</p> : null}
          {challenge.hint ? <p className="casual-challenge-context">{language === 'zh' ? '提示：' : 'Hint: '}{challenge.hint}</p> : null}

          {challenge.speakText ? (
            <button className="listen-button" type="button" onClick={() => speakEnglish(challenge.speakText ?? challenge.answer, profile.accent)}>
              🔊 {language === 'zh' ? '播放發音' : 'Play audio'}
            </button>
          ) : null}

          <form onSubmit={submitResponse}>
            {challenge.choices ? (
              <div className="casual-choice-grid">
                {challenge.choices.map((choice) => (
                  <button className={response === choice ? 'active' : ''} type="button" key={choice} disabled={Boolean(feedback)} onClick={() => setResponse(choice)}>{choice}</button>
                ))}
              </div>
            ) : (
              <input
                autoFocus
                autoComplete="off"
                disabled={Boolean(feedback)}
                value={response}
                placeholder={challenge.mode === 'sentence' ? (language === 'zh' ? '輸入完整英文句子' : 'Type a complete sentence') : (language === 'zh' ? '輸入答案' : 'Type your answer')}
                onChange={(event) => setResponse(event.target.value)}
              />
            )}

            {!feedback ? (
              <div className="casual-actions">
                <button type="button" onClick={() => gradeResponse('', true)}>{language === 'zh' ? '我不知道' : 'I do not know'}</button>
                <button className="primary-button" type="submit" disabled={!response.trim()}>{language === 'zh' ? '檢查答案' : 'Check'}</button>
              </div>
            ) : (
              <div className={`casual-feedback score-${feedback.score}`}>
                <strong>{feedback.score === 1 ? '✓' : feedback.score >= 0.75 ? '◒' : feedback.score === 0.5 ? '△' : '✕'}</strong>
                <p>{feedback.text}</p>
                <div>
                  {challenge.entry.detail ? <button type="button" onClick={() => onOpenWord(challenge.entry.detail?.id ?? challenge.entry.id)}>{language === 'zh' ? '查看完整單字卡' : 'Open full word card'}</button> : null}
                  <button className="primary-button" type="button" onClick={() => nextChallenge()}>{language === 'zh' ? '下一題' : 'Next item'}</button>
                </div>
              </div>
            )}
          </form>
        </article>
      </section>

      <aside className="casual-practice-info">
        <span>{language === 'zh' ? `完整分級詞庫：${entries.length.toLocaleString()} 個可玩詞條` : `${entries.length.toLocaleString()} playable entries`}</span>
        <h4>{language === 'zh' ? '各級資料量' : 'Entries by level'}</h4>
        <ul>
          {LEVELS.map((level) => <li key={level}>{level}：{CEFR_LEVEL_COUNTS[level].toLocaleString()}</li>)}
        </ul>
        <p>{language === 'zh'
          ? '詳細中文單字卡可使用全部題型；大量分級詞條先提供聽力、拼字修復、字母重組、詞性與分級題，避免為了湊數產生假的中文解釋。'
          : 'Curated Chinese entries use all exercise types. The large profile bank focuses on listening, spelling, POS, and level tasks rather than fabricated translations.'}</p>
        <small>{CEFR_SOURCE_NOTE}</small>
      </aside>
    </div>
  )
}
