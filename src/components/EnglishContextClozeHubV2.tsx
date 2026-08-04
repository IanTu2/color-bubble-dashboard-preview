import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  CONTEXT_CLOZE_BY_WORD,
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
  COURSE_TRACKS,
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

type ContextTab = 'today' | 'review' | 'principles'
type SessionMode = 'daily' | 'review'
type QuestionMode = 'context' | 'listening'
type HintStage = 0 | 1 | 2

type Props = {
  language: Language
  userId: string
  onOpenJourney: () => void
  onOpenStudio: () => void
}

type SessionQuestion = {
  item: ContextClozeItem
  mode: QuestionMode
}

type ActiveSession = {
  mode: SessionMode
  questions: SessionQuestion[]
  index: number
  response: string
  feedback: { score: number; revealed: boolean } | null
  correct: number
  hintStage: HintStage
}

type ContextReviewRow = {
  item: ContextClozeItem
  entry: GeneratedCefrEntry
}

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

function makeSessionQuestions(items: ContextClozeItem[]): SessionQuestion[] {
  return items.map((item, index) => ({
    item,
    mode: index % 3 === 1 ? 'listening' : 'context',
  }))
}

export function EnglishContextClozeHubV2({ language, userId, onOpenJourney, onOpenStudio }: Props) {
  const profile = readEnglishStored<LearnerProfile>(englishStorageKey(userId, 'profile'), DEFAULT_PROFILE)
  const [journey, setJourney] = useState<JourneyState>(() => {
    const stored = readJourneyState(userId)
    return {
      ...stored,
      microLevel: Math.max(stored.microLevel, cefrBaseMicroLevel(profile.level)),
    }
  })
  const [tab, setTab] = useState<ContextTab>('today')
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null)
  const [summary, setSummary] = useState<{ correct: number; total: number; xp: number } | null>(null)

  useEffect(() => {
    writeJourneyState(userId, journey)
  }, [journey, userId])

  const copy = language === 'zh'
    ? {
        title: '情境挖空英文課',
        subtitle: '完整語境、完整句子聽力，以及真的卡住時才展開的兩段式提示。',
        today: '今日課程', review: '智慧複習', principles: '題型原則',
        journey: '完整學習旅程', studio: '程度測驗與完整題庫',
        start: '開始今日情境課', startReview: '開始到期複習',
        check: '檢查答案', next: '下一題', finish: '完成課程',
        saved: '已加入智慧複習', save: '加入智慧複習', hear: '播放完整句子',
        noReview: '目前沒有到期的高品質情境題。答錯或顯示答案的單字會排入隔天複習。',
        level: '目前程度', course: '課程方向', due: '今日到期', curated: '可用情境題',
        answerCorrect: '答對了', answerAlmost: '只差一個字母', answerWrong: '正確答案',
        unsupported: '舊收藏中有些詞條還沒有人工雙語例句，因此暫時不拿來出題。',
        contextMode: '看語境填單字', listeningMode: '完整句子聽力',
        listeningInstruction: '播放的是完整英文句子，請把你聽到的缺字填回句中。',
        hint: '不會，給我提示', reveal: '顯示答案',
        hintText: '提示', letters: '個字母', startsWith: '開頭是',
        revealed: '已顯示答案，本題不計答對，並已加入智慧複習。',
      }
    : {
        title: 'Context Cloze English',
        subtitle: 'Complete context, full-sentence listening, and a two-step hint only when you need it.',
        today: 'Today', review: 'Smart review', principles: 'Question rules',
        journey: 'Full learning journey', studio: 'Placement and full bank',
        start: 'Start today’s context lesson', startReview: 'Review due cards',
        check: 'Check answer', next: 'Next', finish: 'Finish lesson',
        saved: 'Added to smart review', save: 'Add to smart review', hear: 'Play full sentence',
        noReview: 'No high-quality context cards are due. Missed or revealed words return tomorrow.',
        level: 'Current level', course: 'Course focus', due: 'Due today', curated: 'Context items',
        answerCorrect: 'Correct', answerAlmost: 'One letter away', answerWrong: 'Correct answer',
        unsupported: 'Some older saved entries do not yet have a human-written bilingual example, so they are excluded from exercises.',
        contextMode: 'Context cloze', listeningMode: 'Full-sentence listening',
        listeningInstruction: 'The audio plays the complete English sentence. Fill the missing word you hear.',
        hint: 'I need a hint', reveal: 'Show answer',
        hintText: 'Hint', letters: 'letters', startsWith: 'starts with',
        revealed: 'Answer revealed. This question is not counted as correct and was added to smart review.',
      }

  const today = englishTodayKey()
  const targetLevel = profile.level
    ? englishLevelNumber(profile.level)
    : Math.max(1, Math.min(6, Math.ceil(journey.microLevel / 5)))

  const lexiconByWord = useMemo(() => {
    const map = new Map<string, GeneratedCefrEntry>()
    CEFR_LEXICON.forEach((entry) => {
      const key = normalizeEnglishAnswer(entry.word)
      const current = map.get(key)
      if (!current || (!current.translation && entry.translation)) map.set(key, entry)
    })
    return map
  }, [])

  const lexiconById = useMemo(() => new Map(CEFR_LEXICON.map((entry) => [entry.id, entry])), [])

  const dailyItems = useMemo(
    () => selectContextClozeItems(targetLevel, journey.selectedCourse, `${today}-${journey.selectedCourse}`, 8),
    [journey.selectedCourse, targetLevel, today],
  )

  const savedContextRows = useMemo(() => journey.savedWordIds
    .map((id) => {
      const entry = lexiconById.get(id)
      const item = entry ? CONTEXT_CLOZE_BY_WORD.get(normalizeEnglishAnswer(entry.word)) : undefined
      return entry && item ? { entry, item } : null
    })
    .filter((row): row is ContextReviewRow => Boolean(row)), [journey.savedWordIds, lexiconById])

  const dueRows = useMemo(() => savedContextRows.filter(({ entry }) => {
    const schedule = journey.reviewSchedule[entry.id]
    return !schedule || schedule.dueDate <= today
  }), [journey.reviewSchedule, savedContextRows, today])

  const unsupportedSavedCount = Math.max(0, journey.savedWordIds.length - savedContextRows.length)
  const todayXp = journey.dailyXp[today] ?? 0
  const dailyProgress = Math.min(100, Math.round((todayXp / journey.dailyTargetXp) * 100))
  const currentQuestion = activeSession?.questions[activeSession.index] ?? null
  const sessionItem = currentQuestion?.item ?? null
  const sessionEntry = sessionItem ? lexiconByWord.get(normalizeEnglishAnswer(sessionItem.word.word)) ?? null : null
  const sessionIsSaved = sessionEntry ? journey.savedWordIds.includes(sessionEntry.id) : false

  const updateJourney = (updater: (current: JourneyState) => JourneyState) => {
    setJourney((current) => updater(current))
  }

  const saveItem = (item: ContextClozeItem, markIncorrect = false) => {
    const entry = lexiconByWord.get(normalizeEnglishAnswer(item.word.word))
    if (!entry) return
    updateJourney((current) => ({
      ...current,
      savedWordIds: Array.from(new Set([...current.savedWordIds, entry.id])),
      reviewSchedule: {
        ...current.reviewSchedule,
        [entry.id]: markIncorrect
          ? scheduleReview(current.reviewSchedule[entry.id], false)
          : current.reviewSchedule[entry.id] ?? scheduleReview(undefined, true),
      },
    }))
  }

  const removeSavedItem = (entryId: string) => {
    updateJourney((current) => {
      const nextSchedule = { ...current.reviewSchedule }
      delete nextSchedule[entryId]
      return {
        ...current,
        savedWordIds: current.savedWordIds.filter((id) => id !== entryId),
        reviewSchedule: nextSchedule,
      }
    })
  }

  const startSession = (mode: SessionMode) => {
    const items = mode === 'review' ? dueRows.map((row) => row.item).slice(0, 8) : dailyItems
    if (items.length === 0) return
    setSummary(null)
    setActiveSession({
      mode,
      questions: makeSessionQuestions(items),
      index: 0,
      response: '',
      feedback: null,
      correct: 0,
      hintStage: 0,
    })
  }

  const submitAnswer = (event: FormEvent) => {
    event.preventDefault()
    if (!activeSession || !sessionItem || activeSession.feedback || !activeSession.response.trim()) return

    const score = contextClozeAnswerScore(activeSession.response, sessionItem.word.word)
    const entry = lexiconByWord.get(normalizeEnglishAnswer(sessionItem.word.word))
    const alreadySaved = entry ? journey.savedWordIds.includes(entry.id) : false

    setActiveSession((current) => current ? {
      ...current,
      feedback: { score, revealed: false },
      correct: current.correct + (score === 1 ? 1 : 0),
    } : current)

    if (entry && (activeSession.mode === 'review' || alreadySaved || score < 1)) {
      updateJourney((current) => ({
        ...current,
        savedWordIds: score < 1
          ? Array.from(new Set([...current.savedWordIds, entry.id]))
          : current.savedWordIds,
        reviewSchedule: {
          ...current.reviewSchedule,
          [entry.id]: scheduleReview(current.reviewSchedule[entry.id], score === 1),
        },
      }))
    }
  }

  const useHint = () => {
    if (!activeSession || !sessionItem || activeSession.feedback) return
    if (activeSession.hintStage === 0) {
      setActiveSession((current) => current ? { ...current, hintStage: 1 } : current)
      return
    }

    saveItem(sessionItem, true)
    setActiveSession((current) => current ? {
      ...current,
      response: sessionItem.word.word,
      feedback: { score: 0, revealed: true },
      hintStage: 2,
    } : current)
  }

  const nextQuestion = () => {
    if (!activeSession?.feedback) return
    if (activeSession.index >= activeSession.questions.length - 1) {
      const earnedXp = (activeSession.mode === 'daily' ? 25 : 15) + activeSession.correct * 6
      const lessonId = activeSession.mode === 'daily' ? `context-daily-${today}` : `context-review-${today}`
      updateJourney((current) => {
        const rewarded = applyJourneyReward(current, earnedXp, 8 + activeSession.correct * 2, lessonId)
        return {
          ...rewarded,
          completedMissionIds: Array.from(new Set([...rewarded.completedMissionIds, lessonId])),
        }
      })
      setSummary({ correct: activeSession.correct, total: activeSession.questions.length, xp: earnedXp })
      setActiveSession(null)
      return
    }

    setActiveSession((current) => current ? {
      ...current,
      index: current.index + 1,
      response: '',
      feedback: null,
      hintStage: 0,
    } : current)
  }

  if (activeSession && sessionItem && currentQuestion) {
    const feedbackLabel = activeSession.feedback?.revealed
      ? copy.revealed
      : activeSession.feedback?.score === 1
        ? copy.answerCorrect
        : activeSession.feedback?.score === 0.5
          ? copy.answerAlmost
          : `${copy.answerWrong}：${sessionItem.word.word}`

    return (
      <div className="context-cloze-shell context-session-shell">
        <header className="context-session-header">
          <button type="button" onClick={() => setActiveSession(null)}>← {copy.today}</button>
          <div>
            <span>{activeSession.index + 1} / {activeSession.questions.length}</span>
            <strong>{currentQuestion.mode === 'listening' ? copy.listeningMode : copy.contextMode}</strong>
          </div>
        </header>
        <div className="context-session-progress"><span style={{ width: `${((activeSession.index + 1) / activeSession.questions.length) * 100}%` }} /></div>

        <main className="context-question-card context-question-card-v2">
          <p className="context-eyebrow">{currentQuestion.mode === 'listening' ? 'LISTENING IN CONTEXT' : 'CONTEXT CLOZE'} · {microLevelToCefr(journey.microLevel)}</p>
          <h1>{sessionItem.prompt}</h1>

          {currentQuestion.mode === 'listening' ? (
            <section className="context-listening-panel">
              <p>{copy.listeningInstruction}</p>
              <button type="button" onClick={() => speakEnglish(sessionItem.fullSentence, profile.accent)}>🔊 {copy.hear}</button>
            </section>
          ) : null}

          <ChineseCue item={sessionItem} language={language} />

          {activeSession.hintStage >= 1 && !activeSession.feedback ? (
            <aside className="context-hint-panel">
              <span>{copy.hintText}</span>
              <strong>{copy.startsWith}「{sessionItem.word.word.slice(0, 1)}」，{sessionItem.word.word.length} {copy.letters}</strong>
            </aside>
          ) : null}

          <form onSubmit={submitAnswer}>
            <input
              value={activeSession.response}
              disabled={Boolean(activeSession.feedback)}
              autoFocus
              autoComplete="off"
              spellCheck={false}
              aria-label={copy.check}
              onChange={(event) => setActiveSession((current) => current ? { ...current, response: event.target.value } : current)}
            />

            {!activeSession.feedback ? (
              <div className="context-question-actions-v2">
                <button className="context-hint-button" type="button" onClick={useHint}>
                  {activeSession.hintStage === 0 ? `💡 ${copy.hint}` : `👁 ${copy.reveal}`}
                </button>
                <button className="context-primary" type="submit" disabled={!activeSession.response.trim()}>{copy.check}</button>
              </div>
            ) : (
              <section className={`context-answer-feedback ${activeSession.feedback.score === 1 ? 'correct' : activeSession.feedback.score === 0.5 ? 'almost' : 'wrong'}`}>
                <strong>{feedbackLabel}</strong>
                <div className="context-answer-word">
                  <div><b>{sessionItem.word.word}</b><span>{sessionItem.word.phoneticUS} · {sessionItem.word.partOfSpeech}</span></div>
                  <button type="button" onClick={() => speakEnglish(sessionItem.fullSentence, profile.accent)}>🔊 {copy.hear}</button>
                </div>
                <p>{sessionItem.fullSentence}</p>
                <small>{sessionItem.word.definition}</small>
                {sessionItem.word.collocations.length > 0 ? <em>{sessionItem.word.collocations.slice(0, 3).join(' · ')}</em> : null}
                <div className="context-feedback-actions">
                  {sessionEntry ? <button type="button" disabled={sessionIsSaved} onClick={() => saveItem(sessionItem)}>{sessionIsSaved ? copy.saved : copy.save}</button> : null}
                  <button className="context-primary" type="button" onClick={nextQuestion}>{activeSession.index >= activeSession.questions.length - 1 ? copy.finish : copy.next}</button>
                </div>
              </section>
            )}
          </form>
        </main>
      </div>
    )
  }

  return (
    <div className="context-cloze-shell">
      <header className="context-main-header">
        <div className="context-brand">
          <div>{journey.avatar}</div>
          <section><p className="context-eyebrow">BUBBLE ENGLISH · CONTEXT V2</p><h1>{copy.title}</h1><span>{copy.subtitle}</span></section>
        </div>
        <div className="context-header-actions">
          <span>🔥 {journey.streak}</span><span>XP {journey.xp.toLocaleString()}</span>
          <button type="button" onClick={onOpenJourney}>{copy.journey}</button>
          <button type="button" onClick={onOpenStudio}>{copy.studio}</button>
        </div>
      </header>

      <nav className="context-tabs">
        <button className={tab === 'today' ? 'active' : ''} type="button" onClick={() => setTab('today')}>☀️ {copy.today}</button>
        <button className={tab === 'review' ? 'active' : ''} type="button" onClick={() => setTab('review')}>🧠 {copy.review}</button>
        <button className={tab === 'principles' ? 'active' : ''} type="button" onClick={() => setTab('principles')}>✓ {copy.principles}</button>
      </nav>

      {summary ? <div className="context-toast"><strong>+{summary.xp} XP</strong><span>{summary.correct} / {summary.total}</span><button type="button" onClick={() => setSummary(null)}>×</button></div> : null}

      {tab === 'today' ? (
        <main className="context-today-page">
          <section className="context-hero">
            <div>
              <p className="context-eyebrow">CONTEXT + FULL-SENTENCE LISTENING</p>
              <h2>{language === 'zh' ? '同一個單字放進完整語境，也用完整句子練聽力。' : 'Learn each word in context and hear it inside a complete sentence.'}</h2>
              <span>{language === 'zh'
                ? `今日從 ${CONTEXT_CLOZE_ITEMS.length} 題人工雙語例句中安排 8 題，其中固定穿插完整句子聽力。`
                : `Eight items are selected from ${CONTEXT_CLOZE_ITEMS.length} human-written bilingual examples, with full-sentence listening mixed in.`}</span>
              <div className="context-progress-line"><i><b style={{ width: `${dailyProgress}%` }} /></i><small>{todayXp} / {journey.dailyTargetXp} XP</small></div>
              <button className="context-primary context-start-button" type="button" onClick={() => startSession('daily')}>{copy.start}</button>
            </div>
            {dailyItems[0] ? (
              <article className="context-example-card">
                <small>{language === 'zh' ? '實際題型預覽' : 'Question preview'}</small>
                <h3>{dailyItems[0].prompt}</h3>
                <ChineseCue item={dailyItems[0]} language={language} />
                <div><span>🔊 完整句子聽力</span><span>💡 兩段式提示</span><strong>✓ 完整語境</strong></div>
              </article>
            ) : null}
          </section>

          <section className="context-stat-grid">
            <article><span>🎓</span><strong>{microLevelToCefr(journey.microLevel)}</strong><small>{copy.level}</small></article>
            <article><span>🧭</span><strong>{COURSE_TRACKS.find((course) => course.id === journey.selectedCourse)?.zhTitle}</strong><small>{copy.course}</small></article>
            <article><span>🧠</span><strong>{dueRows.length}</strong><small>{copy.due}</small></article>
            <article><span>📝</span><strong>{CONTEXT_CLOZE_ITEMS.length}</strong><small>{copy.curated}</small></article>
          </section>

          <section className="context-course-section">
            <div><p className="context-eyebrow">COURSE FOCUS</p><h2>{language === 'zh' ? '今天想練哪個方向？' : 'Choose today’s focus'}</h2></div>
            <div className="context-course-tabs">
              {COURSE_TRACKS.map((course) => (
                <button className={journey.selectedCourse === course.id ? 'active' : ''} type="button" key={course.id} onClick={() => updateJourney((current) => ({ ...current, selectedCourse: course.id }))}>
                  <span>{course.icon}</span><strong>{language === 'zh' ? course.zhTitle : course.enTitle}</strong>
                </button>
              ))}
            </div>
          </section>

          <section className="context-preview-grid">
            {dailyItems.slice(0, 4).map((item, index) => (
              <article key={item.id}>
                <small>{index % 3 === 1 ? `🔊 ${copy.listeningMode}` : `✍ ${copy.contextMode}`}</small>
                <h3>{item.prompt}</h3><span>{item.targetMeaning}</span><p>{item.chineseSentence}</p>
              </article>
            ))}
          </section>
        </main>
      ) : null}

      {tab === 'review' ? (
        <main className="context-review-page">
          <section className="context-review-hero">
            <div><p className="context-eyebrow">SPACED CONTEXT REVIEW</p><h2>{copy.review}</h2><span>{language === 'zh' ? '答錯或顯示答案會排入隔天；持續答對後延長為 3、7、14 天以上。' : 'Missed or revealed words return tomorrow; correct recalls expand to 3, 7, and 14+ days.'}</span></div>
            <div><strong>{dueRows.length}</strong><span>{copy.due}</span><button className="context-primary" type="button" disabled={dueRows.length === 0} onClick={() => startSession('review')}>{copy.startReview}</button></div>
          </section>

          {unsupportedSavedCount > 0 ? <p className="context-quality-note">⚠ {copy.unsupported}（{unsupportedSavedCount}）</p> : null}
          {savedContextRows.length === 0 ? <p className="context-empty">{copy.noReview}</p> : (
            <div className="context-review-list">
              {savedContextRows.map(({ item, entry }) => {
                const schedule = journey.reviewSchedule[entry.id]
                const isDue = !schedule || schedule.dueDate <= today
                return (
                  <article key={entry.id}>
                    <button type="button" onClick={() => speakEnglish(item.fullSentence, profile.accent)}>🔊</button>
                    <div><strong>{item.word.word}</strong><span>{item.targetMeaning}</span><p>{item.prompt}</p></div>
                    <small className={isDue ? 'due' : ''}>{isDue ? (language === 'zh' ? '今天' : 'Today') : schedule?.dueDate}</small>
                    <button type="button" aria-label="remove" onClick={() => removeSavedItem(entry.id)}>×</button>
                  </article>
                )
              })}
            </div>
          )}
        </main>
      ) : null}

      {tab === 'principles' ? (
        <main className="context-principles-page">
          <section>
            <p className="context-eyebrow">QUESTION QUALITY RULES</p>
            <h2>{language === 'zh' ? '提示是救援，不是作答前直接洩漏。' : 'Hints are a rescue path, not an answer leak.'}</h2>
            <div className="context-rule-grid">
              <article><span>1</span><div><strong>{language === 'zh' ? '完整英文語境' : 'Complete English context'}</strong><p>{language === 'zh' ? '挖掉目標字，但保留足以判斷語意與文法的整句。' : 'Blank only the target word while preserving enough meaning and grammar.'}</p></div></article>
              <article><span>2</span><div><strong>{language === 'zh' ? '完整句子聽力' : 'Full-sentence listening'}</strong><p>{language === 'zh' ? '聽力播放整句，不再只播放孤立單字。' : 'Listening plays the whole sentence rather than an isolated word.'}</p></div></article>
              <article><span>3</span><div><strong>{language === 'zh' ? '提示再答案' : 'Hint, then answer'}</strong><p>{language === 'zh' ? '第一次只顯示開頭與長度；第二次才顯示答案，且自動加入複習。' : 'The first tap shows the initial and length; the second reveals the answer and schedules review.'}</p></div></article>
              <article><span>4</span><div><strong>{language === 'zh' ? '品質優先於數量' : 'Quality before quantity'}</strong><p>{language === 'zh' ? '只啟用有人工雙語例句的內容，其餘詞條保留查詢。' : 'Only human-written bilingual examples are active; other entries remain reference material.'}</p></div></article>
            </div>
          </section>
        </main>
      ) : null}
    </div>
  )
}
