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

type ContextTab = 'today' | 'review' | 'principles'
type SessionMode = 'daily' | 'review'

type Props = {
  language: Language
  userId: string
  onOpenJourney: () => void
  onOpenStudio: () => void
}

type ActiveSession = {
  mode: SessionMode
  items: ContextClozeItem[]
  index: number
  response: string
  feedback: { score: number } | null
  correct: number
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

export function EnglishContextClozeHub({ language, userId, onOpenJourney, onOpenStudio }: Props) {
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
        subtitle: '先看完整語境與中文提示，再主動回想真正需要的單字。',
        today: '今日課程', review: '智慧複習', principles: '題型原則',
        journey: '完整學習旅程', studio: '程度測驗與完整題庫',
        start: '開始今日情境課', startReview: '開始到期複習',
        target: '目標意思', check: '檢查答案', next: '下一題', finish: '完成課程',
        saved: '已加入智慧複習', save: '加入智慧複習', hear: '播放完整句子',
        noReview: '目前沒有到期的高品質情境題。答錯的單字會自動排入隔天複習。',
        level: '目前程度', course: '課程方向', due: '今日到期', curated: '可用情境題',
        answerCorrect: '答對了', answerAlmost: '只差一個字母', answerWrong: '正確答案',
        unsupported: '舊收藏中有些詞條還沒有人工雙語例句，因此暫時不拿來出題。',
      }
    : {
        title: 'Context Cloze English',
        subtitle: 'Use a complete sentence and a clear Chinese cue to actively recall the missing word.',
        today: 'Today', review: 'Smart review', principles: 'Question rules',
        journey: 'Full learning journey', studio: 'Placement and full bank',
        start: 'Start today’s context lesson', startReview: 'Review due cards',
        target: 'Target meaning', check: 'Check answer', next: 'Next', finish: 'Finish lesson',
        saved: 'Added to smart review', save: 'Add to smart review', hear: 'Play full sentence',
        noReview: 'No high-quality context cards are due. Missed words are automatically scheduled for tomorrow.',
        level: 'Current level', course: 'Course focus', due: 'Due today', curated: 'Context items',
        answerCorrect: 'Correct', answerAlmost: 'One letter away', answerWrong: 'Correct answer',
        unsupported: 'Some older saved entries do not yet have a human-written bilingual example, so they are excluded from exercises.',
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

  const lexiconById = useMemo(
    () => new Map(CEFR_LEXICON.map((entry) => [entry.id, entry])),
    [],
  )

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
  const sessionItem = activeSession?.items[activeSession.index] ?? null
  const sessionEntry = sessionItem ? lexiconByWord.get(normalizeEnglishAnswer(sessionItem.word.word)) ?? null : null
  const sessionIsSaved = sessionEntry ? journey.savedWordIds.includes(sessionEntry.id) : false

  const updateJourney = (updater: (current: JourneyState) => JourneyState) => {
    setJourney((current) => updater(current))
  }

  const saveItem = (item: ContextClozeItem) => {
    const entry = lexiconByWord.get(normalizeEnglishAnswer(item.word.word))
    if (!entry) return
    updateJourney((current) => ({
      ...current,
      savedWordIds: Array.from(new Set([...current.savedWordIds, entry.id])),
      reviewSchedule: {
        ...current.reviewSchedule,
        [entry.id]: current.reviewSchedule[entry.id] ?? scheduleReview(undefined, true),
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
    setActiveSession({ mode, items, index: 0, response: '', feedback: null, correct: 0 })
  }

  const submitAnswer = (event: FormEvent) => {
    event.preventDefault()
    if (!activeSession || !sessionItem || activeSession.feedback || !activeSession.response.trim()) return

    const score = contextClozeAnswerScore(activeSession.response, sessionItem.word.word)
    const entry = lexiconByWord.get(normalizeEnglishAnswer(sessionItem.word.word))
    const alreadySaved = entry ? journey.savedWordIds.includes(entry.id) : false

    setActiveSession((current) => current ? {
      ...current,
      feedback: { score },
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

  const nextQuestion = () => {
    if (!activeSession?.feedback) return
    if (activeSession.index >= activeSession.items.length - 1) {
      const earnedXp = (activeSession.mode === 'daily' ? 25 : 15) + activeSession.correct * 6
      const lessonId = activeSession.mode === 'daily' ? `context-daily-${today}` : `context-review-${today}`
      updateJourney((current) => {
        const rewarded = applyJourneyReward(current, earnedXp, 8 + activeSession.correct * 2, lessonId)
        return {
          ...rewarded,
          completedMissionIds: Array.from(new Set([...rewarded.completedMissionIds, lessonId])),
        }
      })
      setSummary({ correct: activeSession.correct, total: activeSession.items.length, xp: earnedXp })
      setActiveSession(null)
      return
    }

    setActiveSession((current) => current ? {
      ...current,
      index: current.index + 1,
      response: '',
      feedback: null,
    } : current)
  }

  if (activeSession && sessionItem) {
    const feedbackLabel = activeSession.feedback?.score === 1
      ? copy.answerCorrect
      : activeSession.feedback?.score === 0.5
        ? copy.answerAlmost
        : `${copy.answerWrong}：${sessionItem.word.word}`

    return (
      <div className="context-cloze-shell context-session-shell">
        <header className="context-session-header">
          <button type="button" onClick={() => setActiveSession(null)}>← {copy.today}</button>
          <div><span>{activeSession.index + 1} / {activeSession.items.length}</span><strong>{activeSession.mode === 'review' ? copy.review : copy.today}</strong></div>
        </header>
        <div className="context-session-progress"><span style={{ width: `${((activeSession.index + 1) / activeSession.items.length) * 100}%` }} /></div>

        <main className="context-question-card">
          <p className="context-eyebrow">CONTEXT · {microLevelToCefr(journey.microLevel)}</p>
          <h1>{sessionItem.prompt}</h1>
          <ChineseCue item={sessionItem} language={language} />

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
              <button className="context-primary" type="submit" disabled={!activeSession.response.trim()}>{copy.check}</button>
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
                  <button className="context-primary" type="button" onClick={nextQuestion}>{activeSession.index >= activeSession.items.length - 1 ? copy.finish : copy.next}</button>
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
          <section><p className="context-eyebrow">BUBBLE ENGLISH · REBUILT</p><h1>{copy.title}</h1><span>{copy.subtitle}</span></section>
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
              <p className="context-eyebrow">CONTEXT FIRST</p>
              <h2>{language === 'zh' ? '不再猜題庫預設字，先理解句子再回想。' : 'Understand the sentence first, then recall the word.'}</h2>
              <span>{language === 'zh'
                ? `今日從 ${CONTEXT_CLOZE_ITEMS.length} 題人工雙語例句中，依 ${microLevelToCefr(journey.microLevel)} 程度安排 8 題。`
                : `Today uses eight items selected from ${CONTEXT_CLOZE_ITEMS.length} human-written bilingual examples.`}</span>
              <div className="context-progress-line"><i><b style={{ width: `${dailyProgress}%` }} /></i><small>{todayXp} / {journey.dailyTargetXp} XP</small></div>
              <button className="context-primary context-start-button" type="button" onClick={() => startSession('daily')}>{copy.start}</button>
            </div>
            {dailyItems[0] ? (
              <article className="context-example-card">
                <small>{language === 'zh' ? '實際題型預覽' : 'Question preview'}</small>
                <h3>{dailyItems[0].prompt}</h3>
                <ChineseCue item={dailyItems[0]} language={language} />
                <div><span>✕ 字母重組</span><span>✕ 孤立翻譯</span><strong>✓ 完整語境</strong></div>
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
            {dailyItems.slice(0, 4).map((item) => (
              <article key={item.id}><small>Level {item.word.level}</small><h3>{item.prompt}</h3><span>{item.targetMeaning}</span><p>{item.chineseSentence}</p></article>
            ))}
          </section>
        </main>
      ) : null}

      {tab === 'review' ? (
        <main className="context-review-page">
          <section className="context-review-hero">
            <div><p className="context-eyebrow">SPACED CONTEXT REVIEW</p><h2>{copy.review}</h2><span>{language === 'zh' ? '答錯會自動排入隔天；持續答對後延長為 3、7、14 天以上。' : 'Missed words return tomorrow; correct recalls expand to 3, 7, and 14+ days.'}</span></div>
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
            <h2>{language === 'zh' ? '題目必須先有學習價值，才有資格算進題庫。' : 'A question must teach something before it counts.'}</h2>
            <div className="context-rule-grid">
              <article><span>1</span><div><strong>{language === 'zh' ? '完整英文語境' : 'Complete English context'}</strong><p>{language === 'zh' ? '挖掉目標字，但保留足以判斷語意與文法的整句。' : 'Blank only the target word while preserving enough meaning and grammar.'}</p></div></article>
              <article><span>2</span><div><strong>{language === 'zh' ? '明確中文提示' : 'Clear Chinese cue'}</strong><p>{language === 'zh' ? '中文句子保留，目標詞義以紅字標出，不要求猜題庫預設答案。' : 'Keep the Chinese sentence and show the target meaning in red.'}</p></div></article>
              <article><span>3</span><div><strong>{language === 'zh' ? '答完才顯示解析' : 'Reveal details after answering'}</strong><p>{language === 'zh' ? '發音、完整句子、詞性、定義與搭配都放在作答後。' : 'Pronunciation, the complete sentence, POS, definition, and collocations appear after answering.'}</p></div></article>
              <article><span>4</span><div><strong>{language === 'zh' ? '品質優先於數量' : 'Quality before quantity'}</strong><p>{language === 'zh' ? '目前只啟用有人工雙語例句的內容；其餘詞條保留查詢，不拿來湊題數。' : 'Only human-written bilingual examples are active; other entries remain reference material.'}</p></div></article>
            </div>
          </section>
          <section className="context-removed-types">
            <h3>{language === 'zh' ? '從主要學習流程移除' : 'Removed from the main learning flow'}</h3>
            <div><span>字母亂序重組</span><span>只給中文孤立翻譯</span><span>看著答案照抄</span><span>靠首尾字母猜字</span><span>沒有唯一答案的填空</span></div>
          </section>
        </main>
      ) : null}
    </div>
  )
}
