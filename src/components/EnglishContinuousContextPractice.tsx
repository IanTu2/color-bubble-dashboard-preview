import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  CONTEXT_CLOZE_ITEMS,
  contextClozeAnswerScore,
  selectContextClozeItems,
} from '../english-context-cloze'
import type { ContextClozeItem } from '../english-context-cloze'
import { CEFR_LEXICON } from '../generated/cefr-lexicon'
import type { GeneratedCefrEntry } from '../generated/cefr-lexicon'
import {
  DEFAULT_PROFILE,
  englishLevelNumber,
  englishStorageKey,
  englishTodayKey,
  normalizeEnglishAnswer,
  readEnglishStored,
  speakEnglish,
} from '../english-learning'
import type { LearnerProfile } from '../english-learning'
import {
  applyJourneyReward,
  cefrBaseMicroLevel,
  microLevelToCefr,
  readJourneyState,
  scheduleReview,
  writeJourneyState,
} from '../english-journey'
import type { JourneyState } from '../english-journey'
import type { Language } from '../types'
import '../english-context-cloze.css'
import '../english-context-cloze-v2.css'
import '../english-continuous-practice.css'

type Props = {
  language: Language
  userId: string
  onBack: () => void
  onRetest: () => void
}

type Feedback = {
  score: number
}

type RoundSummary = {
  correct: number
  total: number
  xp: number
}

const ROUND_SIZE = 8

function ChineseCue({ item, language }: { item: ContextClozeItem; language: Language }) {
  const token = item.highlightedMeaning
  const tokenIndex = token ? item.chineseSentence.indexOf(token) : -1

  return (
    <div className="context-chinese-cue">
      <span>{language === 'zh' ? '目標意思' : 'Target meaning'}：<strong>{item.targetMeaning}</strong></span>
      <p>
        {token && tokenIndex >= 0 ? (
          <>
            {item.chineseSentence.slice(0, tokenIndex)}
            <mark>{token}</mark>
            {item.chineseSentence.slice(tokenIndex + token.length)}
          </>
        ) : item.chineseSentence}
      </p>
    </div>
  )
}

export function EnglishContinuousContextPractice({ language, userId, onBack, onRetest }: Props) {
  const profile = readEnglishStored<LearnerProfile>(englishStorageKey(userId, 'profile'), DEFAULT_PROFILE)
  const [journey, setJourney] = useState<JourneyState>(() => {
    const stored = readJourneyState(userId)
    return {
      ...stored,
      microLevel: Math.max(stored.microLevel, cefrBaseMicroLevel(profile.level)),
    }
  })
  const [round, setRound] = useState(1)
  const [seed, setSeed] = useState(() => `${Date.now()}-${Math.random()}`)
  const [index, setIndex] = useState(0)
  const [response, setResponse] = useState('')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [correct, setCorrect] = useState(0)
  const [hintVisible, setHintVisible] = useState(false)
  const [summary, setSummary] = useState<RoundSummary | null>(null)

  useEffect(() => {
    writeJourneyState(userId, journey)
  }, [journey, userId])

  const today = englishTodayKey()
  const targetLevel = profile.level
    ? englishLevelNumber(profile.level)
    : Math.max(1, Math.min(6, Math.ceil(journey.microLevel / 5)))

  const questions = useMemo(
    () => selectContextClozeItems(targetLevel, journey.selectedCourse, `${today}-${seed}`, ROUND_SIZE),
    [journey.selectedCourse, seed, targetLevel, today],
  )
  const current = questions[index] ?? null
  const listening = index % 3 === 1

  const lexiconByWord = useMemo(() => {
    const map = new Map<string, GeneratedCefrEntry>()
    CEFR_LEXICON.forEach((entry) => {
      const key = normalizeEnglishAnswer(entry.word)
      const existing = map.get(key)
      if (!existing || (!existing.translation && entry.translation)) map.set(key, entry)
    })
    return map
  }, [])

  const copy = language === 'zh'
    ? {
        title: '無限情境練習',
        subtitle: '每組 8 題只是小結，不是練習上限；完成後可立即換一批新題。',
        back: '返回今日課程',
        retest: '重新測驗實力',
        round: '第',
        group: '組',
        context: '情境挖空',
        listening: '完整句子聽力',
        listenInstruction: '播放完整英文句子，再把缺少的單字填回去。',
        play: '播放完整句子',
        hint: '提示第一個字母',
        check: '檢查答案',
        next: '下一題 →',
        finish: '查看本組結果 →',
        correct: '答對了',
        almost: '只差一個字母',
        wrong: '正確答案',
        scheduled: '答錯的單字已加入智慧複習。',
        completed: '本組完成',
        continue: '繼續下一組 8 題 →',
        totalBank: '可用人工雙語情境題',
      }
    : {
        title: 'Continuous Context Practice',
        subtitle: 'Eight questions form a checkpoint, not a limit. Continue immediately with a fresh set.',
        back: 'Back to today',
        retest: 'Retake placement test',
        round: 'Round',
        group: '',
        context: 'Context cloze',
        listening: 'Full-sentence listening',
        listenInstruction: 'Play the complete sentence and restore the missing word.',
        play: 'Play full sentence',
        hint: 'Show first letter',
        check: 'Check answer',
        next: 'Next →',
        finish: 'View round result →',
        correct: 'Correct',
        almost: 'One letter away',
        wrong: 'Correct answer',
        scheduled: 'Missed words were added to smart review.',
        completed: 'Round complete',
        continue: 'Continue with 8 new questions →',
        totalBank: 'Human-written bilingual context items',
      }

  const scheduleIncorrect = (item: ContextClozeItem) => {
    const entry = lexiconByWord.get(normalizeEnglishAnswer(item.word.word))
    if (!entry) return
    setJourney((currentJourney) => ({
      ...currentJourney,
      savedWordIds: Array.from(new Set([...currentJourney.savedWordIds, entry.id])),
      reviewSchedule: {
        ...currentJourney.reviewSchedule,
        [entry.id]: scheduleReview(currentJourney.reviewSchedule[entry.id], false),
      },
    }))
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!current || feedback || !response.trim()) return

    const score = contextClozeAnswerScore(response, current.word.word)
    setFeedback({ score })
    if (score === 1) setCorrect((value) => value + 1)
    if (score < 1) scheduleIncorrect(current)
  }

  const next = () => {
    if (!current || !feedback) return

    if (index >= questions.length - 1) {
      const earnedXp = 12 + correct * 4
      const lessonId = `continuous-context-${today}-${seed}`
      setJourney((currentJourney) => applyJourneyReward(currentJourney, earnedXp, 4 + correct, lessonId))
      setSummary({ correct, total: questions.length, xp: earnedXp })
      return
    }

    setIndex((value) => value + 1)
    setResponse('')
    setFeedback(null)
    setHintVisible(false)
  }

  const continuePractice = () => {
    setRound((value) => value + 1)
    setSeed(`${Date.now()}-${Math.random()}`)
    setIndex(0)
    setResponse('')
    setFeedback(null)
    setCorrect(0)
    setHintVisible(false)
    setSummary(null)
  }

  if (summary) {
    return (
      <div className="context-cloze-shell continuous-practice-shell">
        <header className="continuous-practice-topbar">
          <button type="button" onClick={onBack}>← {copy.back}</button>
          <button type="button" onClick={onRetest}>🎯 {copy.retest}</button>
        </header>
        <main className="continuous-summary-card">
          <p className="context-eyebrow">CONTINUOUS PRACTICE · {microLevelToCefr(journey.microLevel)}</p>
          <h1>{copy.completed}</h1>
          <strong>{summary.correct} / {summary.total}</strong>
          <span>+{summary.xp} XP</span>
          <p>{copy.subtitle}</p>
          <div>
            <button className="context-primary" type="button" onClick={continuePractice}>{copy.continue}</button>
            <button type="button" onClick={onRetest}>🎯 {copy.retest}</button>
            <button type="button" onClick={onBack}>← {copy.back}</button>
          </div>
        </main>
      </div>
    )
  }

  if (!current) {
    return (
      <div className="context-cloze-shell continuous-practice-shell">
        <main className="continuous-summary-card">
          <h1>{language === 'zh' ? '目前沒有可用題目' : 'No questions available'}</h1>
          <button type="button" onClick={onBack}>← {copy.back}</button>
        </main>
      </div>
    )
  }

  const feedbackLabel = feedback?.score === 1
    ? copy.correct
    : feedback?.score === 0.5
      ? copy.almost
      : `${copy.wrong}：${current.word.word}`

  return (
    <div className="context-cloze-shell context-session-shell continuous-practice-shell">
      <header className="continuous-practice-topbar">
        <button type="button" onClick={onBack}>← {copy.back}</button>
        <div>
          <span>{copy.round} {round} {copy.group}</span>
          <strong>{index + 1} / {questions.length}</strong>
        </div>
        <button type="button" onClick={onRetest}>🎯 {copy.retest}</button>
      </header>

      <div className="context-session-progress">
        <span style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
      </div>

      <main className="context-question-card context-question-card-v2 continuous-question-card">
        <p className="context-eyebrow">
          {listening ? copy.listening : copy.context} · {microLevelToCefr(journey.microLevel)}
        </p>
        <h1>{current.prompt}</h1>

        {listening ? (
          <section className="context-listening-panel">
            <p>{copy.listenInstruction}</p>
            <button type="button" onClick={() => speakEnglish(current.fullSentence, profile.accent)}>🔊 {copy.play}</button>
          </section>
        ) : null}

        <ChineseCue item={current} language={language} />

        {hintVisible && !feedback ? (
          <aside className="context-hint-panel">
            <span>{language === 'zh' ? '提示' : 'Hint'}</span>
            <strong>{current.word.word.slice(0, 1).toUpperCase()} · {current.word.word.length} {language === 'zh' ? '個字母' : 'letters'}</strong>
          </aside>
        ) : null}

        <form onSubmit={submit}>
          <input
            value={response}
            disabled={Boolean(feedback)}
            autoFocus
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => setResponse(event.target.value)}
          />

          {!feedback ? (
            <div className="context-question-actions-v2">
              <button className="context-hint-button" type="button" onClick={() => setHintVisible(true)}>💡 {copy.hint}</button>
              <button className="context-primary" type="submit" disabled={!response.trim()}>{copy.check}</button>
            </div>
          ) : (
            <section className={`context-answer-feedback ${feedback.score === 1 ? 'correct' : feedback.score === 0.5 ? 'almost' : 'wrong'}`}>
              <strong>{feedbackLabel}</strong>
              <div className="context-answer-word">
                <div>
                  <b>{current.word.word}</b>
                  <span>{current.word.phoneticUS} · {current.word.partOfSpeech}</span>
                </div>
                <button type="button" onClick={() => speakEnglish(current.fullSentence, profile.accent)}>🔊 {copy.play}</button>
              </div>
              <p>{current.fullSentence}</p>
              <small>{current.word.definition}</small>
              {feedback.score < 1 ? <em>{copy.scheduled}</em> : null}
              <div className="context-feedback-actions">
                <button className="context-primary" type="button" onClick={next}>
                  {index >= questions.length - 1 ? copy.finish : copy.next}
                </button>
              </div>
            </section>
          )}
        </form>

        <footer className="continuous-bank-note">{copy.totalBank}：{CONTEXT_CLOZE_ITEMS.length}</footer>
      </main>
    </div>
  )
}
