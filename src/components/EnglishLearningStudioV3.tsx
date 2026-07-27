import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ASSESSMENT_QUESTION_BANK } from '../english-question-bank'
import { ENGLISH_WORDS } from '../english-data'
import type { EnglishGoal, EnglishQuestion, EnglishSkill } from '../english-data'
import {
  DEFAULT_HISTORY,
  DEFAULT_PROFILE,
  buildAssessmentResult,
  englishAnswerScore,
  englishLevelFromNumber,
  englishLevelNumber,
  englishStorageKey,
  englishTodayKey,
  maskEnglishWord,
  normalizeEnglishAnswer,
  readEnglishStored,
  speakEnglish,
} from '../english-learning'
import type { AssessmentAnswer, AssessmentResult, LearnerProfile, LearningHistory } from '../english-learning'
import type { Language } from '../types'
import { EnglishCasualPractice } from './EnglishCasualPractice'

type StudioView = 'welcome' | 'assessment' | 'result' | 'dashboard'
type DashboardTab = 'today' | 'casual' | 'words' | 'progress' | 'settings'
type PracticeMode = 'copy' | 'masked' | 'translation' | 'listening' | 'cloze' | 'sentence'

type EnglishLearningStudioProps = {
  language: Language
  userId: string
}

type AssessmentFeedback = {
  score: number
  explanation: string
}

const ASSESSMENT_LENGTH = 15
const RECENT_QUESTION_LIMIT = 30
const ASSESSMENT_SKILLS: EnglishSkill[] = ['recognition', 'spelling', 'grammar', 'reading', 'listening']
const PRACTICE_MODES: PracticeMode[] = ['copy', 'masked', 'translation', 'listening', 'cloze', 'sentence']

function skillLabel(skill: EnglishSkill, language: Language) {
  const labels = language === 'zh'
    ? { recognition: '單字辨識', spelling: '主動拼字', grammar: '文法句型', reading: '閱讀理解', listening: '聽力理解' }
    : { recognition: 'Recognition', spelling: 'Spelling', grammar: 'Grammar', reading: 'Reading', listening: 'Listening' }
  return labels[skill]
}

function shuffleArray<T>(items: T[]) {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }
  return result
}

function prepareAssessmentQuestion(question: EnglishQuestion) {
  return question.choices ? { ...question, choices: shuffleArray(question.choices) } : question
}

function assessmentSkillCounts(answers: AssessmentAnswer[]) {
  return answers.reduce<Record<EnglishSkill, number>>(
    (record, answer) => ({ ...record, [answer.skill]: record[answer.skill] + 1 }),
    { recognition: 0, spelling: 0, grammar: 0, reading: 0, listening: 0 },
  )
}

function selectAssessmentQuestion(
  ability: number,
  askedIds: string[],
  answers: AssessmentAnswer[],
  recentIds: string[],
) {
  const unanswered = ASSESSMENT_QUESTION_BANK.filter((item) => !askedIds.includes(item.id))
  if (unanswered.length === 0) return null

  const counts = assessmentSkillCounts(answers)
  const remainingSlots = ASSESSMENT_LENGTH - answers.length
  const underrepresentedSkills = ASSESSMENT_SKILLS.filter((skill) => counts[skill] < 2)
  const balancedCandidates = remainingSlots <= underrepresentedSkills.length
    ? unanswered.filter((item) => underrepresentedSkills.includes(item.skill))
    : unanswered
  const candidates = balancedCandidates.length > 0 ? balancedCandidates : unanswered

  const ranked = candidates
    .map((item) => ({
      item,
      score:
        Math.abs(item.difficulty - ability)
        + counts[item.skill] * 0.32
        + (recentIds.includes(item.id) ? 2.8 : 0)
        + Math.random() * 0.72,
    }))
    .sort((left, right) => left.score - right.score)

  return ranked[0] ? prepareAssessmentQuestion(ranked[0].item) : null
}

export function EnglishLearningStudio({ language, userId }: EnglishLearningStudioProps) {
  const profileKey = englishStorageKey(userId, 'profile')
  const resultKey = englishStorageKey(userId, 'assessment-result')
  const historyKey = englishStorageKey(userId, 'history')
  const recentQuestionKey = englishStorageKey(userId, 'assessment-recent-question-ids')
  const storedResult = readEnglishStored<AssessmentResult | null>(resultKey, null)

  const [profile, setProfile] = useState<LearnerProfile>(() => readEnglishStored(profileKey, DEFAULT_PROFILE))
  const [result, setResult] = useState<AssessmentResult | null>(storedResult)
  const [history, setHistory] = useState<LearningHistory>(() => readEnglishStored(historyKey, DEFAULT_HISTORY))
  const [view, setView] = useState<StudioView>(storedResult ? 'dashboard' : 'welcome')
  const [tab, setTab] = useState<DashboardTab>('today')

  const [answers, setAnswers] = useState<AssessmentAnswer[]>([])
  const [askedIds, setAskedIds] = useState<string[]>([])
  const [ability, setAbility] = useState(2.5)
  const [question, setQuestion] = useState<EnglishQuestion | null>(null)
  const [response, setResponse] = useState('')
  const [confidence, setConfidence] = useState(2)
  const [feedback, setFeedback] = useState<AssessmentFeedback | null>(null)
  const questionStartedAt = useRef(Date.now())

  const [practiceIndex, setPracticeIndex] = useState(0)
  const [practiceStep, setPracticeStep] = useState(0)
  const [practiceResponse, setPracticeResponse] = useState('')
  const [practiceFeedback, setPracticeFeedback] = useState('')
  const [wordSearch, setWordSearch] = useState('')
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null)

  useEffect(() => {
    window.localStorage.setItem(profileKey, JSON.stringify(profile))
  }, [profile, profileKey])

  useEffect(() => {
    window.localStorage.setItem(historyKey, JSON.stringify(history))
  }, [history, historyKey])

  useEffect(() => {
    if (result) window.localStorage.setItem(resultKey, JSON.stringify(result))
  }, [result, resultKey])

  const copy = language === 'zh'
    ? {
        title: '英文學習中心',
        subtitle: '分級測驗、每日課程、休閒隨機複習、拼字、聽力與單字記憶',
        start: '開始程度測驗',
        intro: '每次會從 50 題題庫動態抽出 15 題，並依正確率、作答時間與確定程度調整難度；近期考過的題目會優先避開。',
        goals: '學習目標（可複選）', accent: '偏好發音', minutes: '每日學習時間', listening: '加入聽力練習',
        daily: '日常', work: '工作', travel: '旅遊', exam: '考試', tech: '程式與技術', us: '美式', uk: '英式', mixed: '兩者混合',
        question: '題', certainty: '這題有多確定？', guess: '猜的', unsure: '不太確定', sure: '確定', submit: '送出答案', next: '下一題', listen: '播放發音', unknown: '我不知道',
        result: '程度分析完成', retest: '重新測驗', dashboard: '開始個人化課程', today: '今日課程', casual: '休閒練習', words: '單字庫', progress: '學習進度', settings: '學習設定',
        averageTime: '平均每題時間', recommendation: '個人化建議', minuteUnit: '分鐘', wordUnit: '個單字', accuracy: '正確率', streak: '連續學習', days: '天', learned: '已熟悉', difficult: '待加強',
        hearAgain: '再聽一次', check: '檢查', nextStep: '下一步', finishWord: '完成這個單字', sentenceHint: '請用這個單字寫一句完整英文。',
        copyMode: '看著輸入', maskedMode: '部分遮蔽', translationMode: '中文回想', listeningMode: '聽力拼字', clozeMode: '句子填空', sentenceMode: '自由造句',
        closeDetail: '關閉單字詳情', searchWords: '搜尋單字、中文或詞性', noWords: '沒有符合的單字', save: '設定會自動儲存', reset: '清除英文學習紀錄',
      }
    : {
        title: 'English Learning Center',
        subtitle: 'Placement, daily lessons, casual random review, spelling, listening, and word memory',
        start: 'Start placement test',
        intro: 'Each test draws 15 adaptive questions from a 50-question bank. Recently used questions are avoided whenever possible.',
        goals: 'Learning goals', accent: 'Preferred accent', minutes: 'Daily study time', listening: 'Include listening practice',
        daily: 'Daily', work: 'Work', travel: 'Travel', exam: 'Exam', tech: 'Tech English', us: 'US', uk: 'UK', mixed: 'Mixed',
        question: 'Question', certainty: 'How sure are you?', guess: 'Guessing', unsure: 'Unsure', sure: 'Sure', submit: 'Submit', next: 'Next question', listen: 'Play audio', unknown: 'I do not know',
        result: 'Placement analysis complete', retest: 'Retake test', dashboard: 'Start personalized course', today: 'Today', casual: 'Casual review', words: 'Word library', progress: 'Progress', settings: 'Settings',
        averageTime: 'Average time', recommendation: 'Personal recommendation', minuteUnit: 'minutes', wordUnit: 'words', accuracy: 'Accuracy', streak: 'Study streak', days: 'days', learned: 'Learned', difficult: 'Needs work',
        hearAgain: 'Hear again', check: 'Check', nextStep: 'Next step', finishWord: 'Finish word', sentenceHint: 'Write one complete sentence using this word.',
        copyMode: 'Copy typing', maskedMode: 'Masked recall', translationMode: 'Meaning recall', listeningMode: 'Dictation', clozeMode: 'Cloze', sentenceMode: 'Sentence',
        closeDetail: 'Close word details', searchWords: 'Search word, meaning, or part of speech', noWords: 'No matching words', save: 'Settings save automatically', reset: 'Reset English learning data',
      }

  const goalOptions: Array<{ id: EnglishGoal; label: string }> = [
    { id: 'daily', label: copy.daily },
    { id: 'work', label: copy.work },
    { id: 'travel', label: copy.travel },
    { id: 'exam', label: copy.exam },
    { id: 'tech', label: copy.tech },
  ]

  const filteredWords = useMemo(() => {
    const queryValue = wordSearch.trim().toLowerCase()
    if (!queryValue) return ENGLISH_WORDS
    return ENGLISH_WORDS.filter((word) => `${word.word} ${word.meaning} ${word.partOfSpeech}`.toLowerCase().includes(queryValue))
  }, [wordSearch])

  const dailyWords = useMemo(() => {
    const targetLevel = englishLevelNumber(profile.level)
    const count = Math.max(3, Math.min(10, Math.round(profile.dailyMinutes / 3)))
    return [...ENGLISH_WORDS]
      .sort((left, right) => {
        const leftPriority = Math.abs(left.level - targetLevel) + (history.difficultWordIds.includes(left.id) ? -2 : 0)
        const rightPriority = Math.abs(right.level - targetLevel) + (history.difficultWordIds.includes(right.id) ? -2 : 0)
        return leftPriority - rightPriority
      })
      .slice(0, count)
  }, [history.difficultWordIds, profile.dailyMinutes, profile.level])

  const practiceWord = dailyWords[practiceIndex % Math.max(1, dailyWords.length)] ?? ENGLISH_WORDS[0]
  const practiceMode = PRACTICE_MODES[practiceStep % PRACTICE_MODES.length]
  const selectedWord = ENGLISH_WORDS.find((word) => word.id === selectedWordId) ?? null
  const accuracy = history.attempts > 0 ? Math.round((history.correct / history.attempts) * 100) : 0

  const toggleGoal = (goal: EnglishGoal) => {
    setProfile((current) => {
      const next = current.goals.includes(goal)
        ? current.goals.filter((item) => item !== goal)
        : [...current.goals, goal]
      return { ...current, goals: next.length > 0 ? next : [goal] }
    })
  }

  const beginAssessment = () => {
    const recentIds = readEnglishStored<string[]>(recentQuestionKey, [])
    const first = selectAssessmentQuestion(2.5, [], [], recentIds)
    if (!first) return
    setAnswers([])
    setAskedIds([first.id])
    setAbility(2.5)
    setQuestion(first)
    setResponse('')
    setConfidence(2)
    setFeedback(null)
    questionStartedAt.current = Date.now()
    setView('assessment')
  }

  const finishAssessment = (finalAnswers: AssessmentAnswer[], finalAbility: number) => {
    const completed = buildAssessmentResult(finalAnswers, finalAbility)
    const previousRecentIds = readEnglishStored<string[]>(recentQuestionKey, [])
    const nextRecentIds = [
      ...askedIds,
      ...previousRecentIds.filter((id) => !askedIds.includes(id)),
    ].slice(0, RECENT_QUESTION_LIMIT)
    window.localStorage.setItem(recentQuestionKey, JSON.stringify(nextRecentIds))
    setResult(completed)
    setProfile((current) => ({ ...current, level: completed.level, assessmentCompletedAt: completed.completedAt }))
    setView('result')
  }

  const recordAssessmentAnswer = (answerText: string, answerConfidence: number) => {
    if (!question || feedback) return
    const answer: AssessmentAnswer = {
      questionId: question.id,
      skill: question.skill,
      difficulty: question.difficulty,
      score: answerText ? englishAnswerScore(answerText, question.answer) : 0,
      seconds: Math.max(1, Math.round((Date.now() - questionStartedAt.current) / 1000)),
      confidence: answerConfidence,
    }
    setResponse(answerText)
    setConfidence(answerConfidence)
    setAnswers((current) => [...current, answer])
    setFeedback({ score: answer.score, explanation: question.explanation })
  }

  const submitAssessment = (event: FormEvent) => {
    event.preventDefault()
    if (!response.trim()) return
    recordAssessmentAnswer(response, confidence)
  }

  const nextAssessmentQuestion = () => {
    if (!question || !feedback) return
    const latest = answers[answers.length - 1]
    const adjustment = latest?.score === 1 ? 0.38 : latest?.score === 0.5 ? 0.08 : -0.34
    const nextAbility = Math.max(1, Math.min(6, ability + adjustment + ((latest?.confidence ?? 2) - 2) * 0.05))
    if (answers.length >= ASSESSMENT_LENGTH) {
      finishAssessment(answers, nextAbility)
      return
    }
    const recentIds = readEnglishStored<string[]>(recentQuestionKey, [])
    const nextQuestion = selectAssessmentQuestion(nextAbility, askedIds, answers, recentIds)
    if (!nextQuestion) {
      finishAssessment(answers, nextAbility)
      return
    }
    setAbility(nextAbility)
    setQuestion(nextQuestion)
    setAskedIds((current) => [...current, nextQuestion.id])
    setResponse('')
    setConfidence(2)
    setFeedback(null)
    questionStartedAt.current = Date.now()
  }

  const practicePrompt = () => {
    if (practiceMode === 'copy') return practiceWord.word
    if (practiceMode === 'masked') return maskEnglishWord(practiceWord.word)
    if (practiceMode === 'translation') return practiceWord.meaning
    if (practiceMode === 'listening') return copy.listen
    if (practiceMode === 'cloze') return practiceWord.example.replace(new RegExp(practiceWord.word, 'i'), '________')
    return copy.sentenceHint
  }

  const practiceModeLabel = () => ({
    copy: copy.copyMode,
    masked: copy.maskedMode,
    translation: copy.translationMode,
    listening: copy.listeningMode,
    cloze: copy.clozeMode,
    sentence: copy.sentenceMode,
  })[practiceMode]

  const checkPractice = (event: FormEvent) => {
    event.preventDefault()
    const score = practiceMode === 'sentence'
      ? (normalizeEnglishAnswer(practiceResponse).includes(practiceWord.word.toLowerCase()) && practiceResponse.trim().split(/\s+/).length >= 4 ? 1 : 0)
      : englishAnswerScore(practiceResponse, practiceWord.word)

    setPracticeFeedback(score === 1
      ? (language === 'zh' ? '答對了，這次是主動回想成功。' : 'Correct — successful active recall.')
      : score === 0.5
        ? (language === 'zh' ? `非常接近。正確拼法是 ${practiceWord.word}。` : `Very close. Correct spelling: ${practiceWord.word}.`)
        : (language === 'zh' ? `再注意一次：${practiceWord.word}。${practiceWord.memory}` : `Review: ${practiceWord.word}. ${practiceWord.memory}`))

    setHistory((current) => {
      const today = englishTodayKey()
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
      return {
        ...current,
        attempts: current.attempts + 1,
        correct: current.correct + (score === 1 ? 1 : 0),
        learnedWordIds: score === 1 && practiceStep >= 4
          ? Array.from(new Set([...current.learnedWordIds, practiceWord.id]))
          : current.learnedWordIds,
        difficultWordIds: score < 1
          ? Array.from(new Set([...current.difficultWordIds, practiceWord.id]))
          : current.difficultWordIds.filter((id) => id !== practiceWord.id || practiceStep < 4),
        streak: current.lastStudyDate === today
          ? current.streak
          : current.lastStudyDate === yesterday
            ? current.streak + 1
            : 1,
        lastStudyDate: today,
      }
    })
  }

  const advancePractice = () => {
    setPracticeResponse('')
    setPracticeFeedback('')
    if (practiceStep < PRACTICE_MODES.length - 1) {
      setPracticeStep((current) => current + 1)
    } else {
      setPracticeStep(0)
      setPracticeIndex((current) => (current + 1) % Math.max(1, dailyWords.length))
    }
  }

  const resetLearningData = () => {
    window.localStorage.removeItem(profileKey)
    window.localStorage.removeItem(resultKey)
    window.localStorage.removeItem(historyKey)
    window.localStorage.removeItem(recentQuestionKey)
    setProfile(DEFAULT_PROFILE)
    setResult(null)
    setHistory(DEFAULT_HISTORY)
    setView('welcome')
  }

  const recommendation = result
    ? Object.entries(result.skillScores)
        .sort((left, right) => left[1] - right[1])
        .slice(0, 2)
        .map(([skill]) => skillLabel(skill as EnglishSkill, language))
        .join('、')
    : ''

  if (view === 'welcome') {
    return (
      <div className="english-studio english-welcome">
        <div className="english-hero">
          <p className="eyebrow">BUBBLE ENGLISH V2</p>
          <h2>{copy.title}</h2>
          <p>{copy.subtitle}</p>
          <div><span>Adaptive</span><span>Typing</span><span>Listening</span><span>CEFR</span><span>Random Review</span></div>
        </div>

        <div className="english-setup-grid">
          <section className="english-card">
            <h3>{copy.goals}</h3>
            <div className="english-chip-grid">
              {goalOptions.map((goal) => (
                <button className={profile.goals.includes(goal.id) ? 'active' : ''} type="button" key={goal.id} onClick={() => toggleGoal(goal.id)}>{goal.label}</button>
              ))}
            </div>
          </section>

          <section className="english-card">
            <h3>{copy.accent}</h3>
            <div className="english-segmented">
              <button className={profile.accent === 'en-US' ? 'active' : ''} type="button" onClick={() => setProfile((current) => ({ ...current, accent: 'en-US' }))}>{copy.us}</button>
              <button className={profile.accent === 'en-GB' ? 'active' : ''} type="button" onClick={() => setProfile((current) => ({ ...current, accent: 'en-GB' }))}>{copy.uk}</button>
              <button className={profile.accent === 'mixed' ? 'active' : ''} type="button" onClick={() => setProfile((current) => ({ ...current, accent: 'mixed' }))}>{copy.mixed}</button>
            </div>
          </section>

          <section className="english-card english-card-wide">
            <div className="english-setting-line">
              <div><h3>{copy.minutes}</h3><p>{profile.dailyMinutes} {copy.minuteUnit}</p></div>
              <input type="range" min="5" max="60" step="5" value={profile.dailyMinutes} onChange={(event) => setProfile((current) => ({ ...current, dailyMinutes: Number(event.target.value) }))} />
            </div>
            <label className="english-listening-toggle">
              <input type="checkbox" checked={profile.listeningEnabled} onChange={(event) => setProfile((current) => ({ ...current, listeningEnabled: event.target.checked }))} />
              <span>{copy.listening}</span>
            </label>
          </section>
        </div>

        <div className="english-welcome-action">
          <p>{copy.intro}</p>
          <button className="primary-button" type="button" onClick={beginAssessment}>{copy.start}</button>
        </div>
      </div>
    )
  }

  if (view === 'assessment' && question) {
    return (
      <div className="english-studio english-assessment">
        <header className="assessment-head">
          <div><p className="eyebrow">ADAPTIVE PLACEMENT · RANDOMIZED</p><h2>{copy.question} {answers.length + 1} / {ASSESSMENT_LENGTH}</h2></div>
          <div className="assessment-level">{englishLevelFromNumber(ability)}</div>
        </header>
        <div className="assessment-progress"><span style={{ width: `${Math.min(100, (answers.length / ASSESSMENT_LENGTH) * 100)}%` }} /></div>

        <section className="assessment-card">
          <div className="assessment-meta"><span>{skillLabel(question.skill, language)}</span><span>Difficulty {question.difficulty.toFixed(1)}</span></div>
          <h3>{question.prompt}</h3>
          {question.context ? <p>{question.context}</p> : null}
          {question.type === 'listening' ? <button className="listen-button" type="button" onClick={() => speakEnglish(question.audioText ?? question.answer, profile.accent)}>🔊 {copy.listen}</button> : null}

          <form onSubmit={submitAssessment}>
            {question.type === 'choice' && question.choices ? (
              <div className="assessment-choices">
                {question.choices.map((choice) => (
                  <button className={response === choice ? 'active' : ''} type="button" key={choice} disabled={Boolean(feedback)} onClick={() => setResponse(choice)}>{choice}</button>
                ))}
              </div>
            ) : (
              <input className="assessment-input" value={response} disabled={Boolean(feedback)} autoFocus autoComplete="off" onChange={(event) => setResponse(event.target.value)} />
            )}

            {!feedback ? (
              <>
                <div className="confidence-row">
                  <span>{copy.certainty}</span>
                  <div>
                    <button className={confidence === 1 ? 'active' : ''} type="button" onClick={() => setConfidence(1)}>{copy.guess}</button>
                    <button className={confidence === 2 ? 'active' : ''} type="button" onClick={() => setConfidence(2)}>{copy.unsure}</button>
                    <button className={confidence === 3 ? 'active' : ''} type="button" onClick={() => setConfidence(3)}>{copy.sure}</button>
                  </div>
                </div>
                <div className="assessment-actions">
                  <button type="button" onClick={() => recordAssessmentAnswer('', 1)}>{copy.unknown}</button>
                  <button className="primary-button" type="submit" disabled={!response.trim()}>{copy.submit}</button>
                </div>
              </>
            ) : (
              <div className={`assessment-feedback score-${feedback.score}`}>
                <strong>{feedback.score === 1 ? '✓ Correct' : feedback.score === 0.5 ? '△ Almost' : `✕ ${question.answer}`}</strong>
                <p>{feedback.explanation}</p>
                <button className="primary-button" type="button" onClick={nextAssessmentQuestion}>{answers.length >= ASSESSMENT_LENGTH ? copy.result : copy.next}</button>
              </div>
            )}
          </form>
        </section>
      </div>
    )
  }

  if (view === 'result' && result) {
    return (
      <div className="english-studio english-result">
        <header><p className="eyebrow">PLACEMENT PROFILE</p><h2>{copy.result}</h2></header>
        <div className="result-level-card">
          <span>{result.level}</span>
          <div><strong>{result.confidence === 'high' ? 'High confidence' : 'Medium confidence'}</strong><p>{copy.averageTime}：{result.averageSeconds}s</p></div>
        </div>
        <div className="skill-result-grid">
          {(Object.keys(result.skillScores) as EnglishSkill[]).map((skill) => (
            <article key={skill}><div><strong>{skillLabel(skill, language)}</strong><span>{result.skillScores[skill]}%</span></div><div><span style={{ width: `${result.skillScores[skill]}%` }} /></div></article>
          ))}
        </div>
        <section className="result-recommendation">
          <h3>{copy.recommendation}</h3>
          <p>{language === 'zh'
            ? `目前優先補強：${recommendation}。系統會增加輸入、聽寫與回想題，而不是只安排選擇題。`
            : `Priority areas: ${recommendation}. Your plan will emphasize typing, dictation, and active recall.`}</p>
        </section>
        <div className="result-actions">
          <button type="button" onClick={beginAssessment}>{copy.retest}</button>
          <button className="primary-button" type="button" onClick={() => setView('dashboard')}>{copy.dashboard}</button>
        </div>
      </div>
    )
  }

  return (
    <div className="english-studio english-dashboard">
      <header className="english-dashboard-head">
        <div>
          <p className="eyebrow">BUBBLE ENGLISH V2</p>
          <h2>{copy.title}</h2>
          <p>{profile.level ?? '—'} · {profile.dailyMinutes} {copy.minuteUnit} · {profile.goals.map((goal) => goalOptions.find((item) => item.id === goal)?.label).filter(Boolean).join(' / ')}</p>
        </div>
        <div className="english-level-orb">{profile.level ?? '—'}</div>
      </header>

      <nav className="english-tabs">
        <button className={tab === 'today' ? 'active' : ''} type="button" onClick={() => setTab('today')}>{copy.today}</button>
        <button className={tab === 'casual' ? 'active' : ''} type="button" onClick={() => setTab('casual')}>{copy.casual}</button>
        <button className={tab === 'words' ? 'active' : ''} type="button" onClick={() => setTab('words')}>{copy.words}</button>
        <button className={tab === 'progress' ? 'active' : ''} type="button" onClick={() => setTab('progress')}>{copy.progress}</button>
        <button className={tab === 'settings' ? 'active' : ''} type="button" onClick={() => setTab('settings')}>{copy.settings}</button>
      </nav>

      {tab === 'today' ? (
        <div className="english-today-grid">
          <section className="practice-card">
            <div className="practice-head">
              <div><p>{practiceModeLabel()}</p><h3>{practiceWord.word}</h3><span>{practiceWord.phoneticUS} · {practiceWord.partOfSpeech}</span></div>
              <button type="button" onClick={() => speakEnglish(practiceWord.word, profile.accent)}>🔊</button>
            </div>
            <div className={`practice-prompt mode-${practiceMode}`}>{practicePrompt()}</div>
            {practiceMode === 'listening' ? <button className="listen-button" type="button" onClick={() => speakEnglish(practiceWord.word, profile.accent)}>🔊 {copy.hearAgain}</button> : null}
            <form onSubmit={checkPractice}>
              <input value={practiceResponse} placeholder={practiceMode === 'sentence' ? copy.sentenceHint : ''} onChange={(event) => setPracticeResponse(event.target.value)} />
              <button className="primary-button" type="submit" disabled={!practiceResponse.trim() || Boolean(practiceFeedback)}>{copy.check}</button>
            </form>
            {practiceFeedback ? <div className="practice-feedback"><p>{practiceFeedback}</p><button type="button" onClick={advancePractice}>{practiceStep === PRACTICE_MODES.length - 1 ? copy.finishWord : copy.nextStep}</button></div> : null}
            <div className="practice-stepper">{PRACTICE_MODES.map((mode, index) => <span className={index <= practiceStep ? 'active' : ''} key={mode} />)}</div>
          </section>

          <aside className="word-memory-card">
            <div><span>{practiceWord.meaning}</span><button type="button" onClick={() => setSelectedWordId(practiceWord.id)}>＋</button></div>
            <p>{practiceWord.memory}</p>
            <dl>
              <div><dt>Root</dt><dd>{practiceWord.morphology.join(' · ')}</dd></div>
              <div><dt>Collocation</dt><dd>{practiceWord.collocations.slice(0, 2).join(' / ')}</dd></div>
              <div><dt>Synonym</dt><dd>{practiceWord.synonyms.join(' / ')}</dd></div>
            </dl>
          </aside>
        </div>
      ) : null}

      {tab === 'casual' ? (
        <EnglishCasualPractice
          language={language}
          profile={profile}
          history={history}
          setHistory={setHistory}
          onOpenWord={setSelectedWordId}
        />
      ) : null}

      {tab === 'words' ? (
        <div className="english-word-library">
          <input className="word-search" value={wordSearch} placeholder={copy.searchWords} onChange={(event) => setWordSearch(event.target.value)} />
          <div className="word-card-grid">
            {filteredWords.length === 0 ? <p>{copy.noWords}</p> : filteredWords.map((word) => (
              <button className={history.learnedWordIds.includes(word.id) ? 'learned' : history.difficultWordIds.includes(word.id) ? 'difficult' : ''} type="button" key={word.id} onClick={() => setSelectedWordId(word.id)}>
                <div><strong>{word.word}</strong><span>{word.phoneticUS}</span></div>
                <p>{word.meaning}</p>
                <small>{word.partOfSpeech} · L{word.level}</small>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {tab === 'progress' ? (
        <div className="english-progress-grid">
          <article><span>{accuracy}%</span><strong>{copy.accuracy}</strong><p>{history.correct} / {history.attempts}</p></article>
          <article><span>{history.streak}</span><strong>{copy.streak}</strong><p>{copy.days}</p></article>
          <article><span>{history.learnedWordIds.length}</span><strong>{copy.learned}</strong><p>{copy.wordUnit}</p></article>
          <article><span>{history.difficultWordIds.length}</span><strong>{copy.difficult}</strong><p>{copy.wordUnit}</p></article>
          {result ? (
            <section className="progress-skill-panel">
              {(Object.keys(result.skillScores) as EnglishSkill[]).map((skill) => (
                <div key={skill}><span>{skillLabel(skill, language)}</span><div><i style={{ width: `${result.skillScores[skill]}%` }} /></div><strong>{result.skillScores[skill]}%</strong></div>
              ))}
            </section>
          ) : null}
        </div>
      ) : null}

      {tab === 'settings' ? (
        <div className="english-settings-panel">
          <section><h3>{copy.goals}</h3><div className="english-chip-grid">{goalOptions.map((goal) => <button className={profile.goals.includes(goal.id) ? 'active' : ''} type="button" key={goal.id} onClick={() => toggleGoal(goal.id)}>{goal.label}</button>)}</div></section>
          <section><h3>{copy.minutes}</h3><div className="english-setting-line"><input type="range" min="5" max="60" step="5" value={profile.dailyMinutes} onChange={(event) => setProfile((current) => ({ ...current, dailyMinutes: Number(event.target.value) }))} /><strong>{profile.dailyMinutes} {copy.minuteUnit}</strong></div></section>
          <section><h3>{copy.accent}</h3><div className="english-segmented"><button className={profile.accent === 'en-US' ? 'active' : ''} type="button" onClick={() => setProfile((current) => ({ ...current, accent: 'en-US' }))}>{copy.us}</button><button className={profile.accent === 'en-GB' ? 'active' : ''} type="button" onClick={() => setProfile((current) => ({ ...current, accent: 'en-GB' }))}>{copy.uk}</button><button className={profile.accent === 'mixed' ? 'active' : ''} type="button" onClick={() => setProfile((current) => ({ ...current, accent: 'mixed' }))}>{copy.mixed}</button></div></section>
          <label className="english-listening-toggle"><input type="checkbox" checked={profile.listeningEnabled} onChange={(event) => setProfile((current) => ({ ...current, listeningEnabled: event.target.checked }))} /><span>{copy.listening}</span></label>
          <p>{copy.save}</p>
          <div className="english-danger-actions"><button type="button" onClick={beginAssessment}>{copy.retest}</button><button type="button" onClick={resetLearningData}>{copy.reset}</button></div>
        </div>
      ) : null}

      {selectedWord ? (
        <div className="word-detail-backdrop" role="presentation" onMouseDown={() => setSelectedWordId(null)}>
          <article className="word-detail" onMouseDown={(event) => event.stopPropagation()}>
            <header><div><p className="eyebrow">WORD MEMORY MAP</p><h3>{selectedWord.word}</h3><span>{selectedWord.phoneticUS} / {selectedWord.phoneticUK}</span></div><button type="button" aria-label={copy.closeDetail} onClick={() => setSelectedWordId(null)}>×</button></header>
            <div className="word-detail-meaning"><strong>{selectedWord.meaning}</strong><span>{selectedWord.partOfSpeech} · Level {selectedWord.level}</span><p>{selectedWord.definition}</p></div>
            <div className="word-detail-grid">
              <section><h4>Prefix / Root / Suffix</h4><p>{selectedWord.morphology.join(' · ')}</p><small>{selectedWord.memory}</small></section>
              <section><h4>Synonyms / Antonyms</h4><p>{selectedWord.synonyms.join(' / ')}</p><small>{selectedWord.antonyms.join(' / ')}</small></section>
              <section><h4>Often confused</h4><p>{selectedWord.confused.join(' / ')}</p></section>
              <section><h4>Collocations</h4><p>{selectedWord.collocations.join(' · ')}</p></section>
            </div>
            <blockquote>{selectedWord.example}<small>{selectedWord.exampleZh}</small></blockquote>
            <button className="listen-button" type="button" onClick={() => speakEnglish(selectedWord.word, profile.accent)}>🔊 {copy.listen}</button>
          </article>
        </div>
      ) : null}
    </div>
  )
}
