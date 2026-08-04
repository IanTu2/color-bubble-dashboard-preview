import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ASSESSMENT_QUESTION_BANK } from '../english-question-bank'
import type { EnglishQuestion, EnglishSkill } from '../english-data'
import { CEFR_BILINGUAL_CARD_COUNT, CEFR_LEXICON } from '../generated/cefr-lexicon'
import type { GeneratedCefrEntry } from '../generated/cefr-lexicon'
import {
  DEFAULT_PROFILE,
  englishAnswerScore,
  englishLevelNumber,
  englishStorageKey,
  englishTodayKey,
  normalizeEnglishAnswer,
  readEnglishStored,
  speakEnglish,
} from '../english-learning'
import type { AssessmentResult, LearnerProfile } from '../english-learning'
import {
  COURSE_TRACKS,
  ROLEPLAY_SCENARIOS,
  applyJourneyReward,
  cefrBaseMicroLevel,
  localLeagueRows,
  microLevelToCefr,
  readJourneyState,
  scheduleReview,
  weeklyXp,
  writeJourneyState,
} from '../english-journey'
import type { JourneyCourseId, JourneyState, RoleplayScenario } from '../english-journey'
import type { Language } from '../types'

type JourneyTab = 'today' | 'path' | 'review' | 'conversation' | 'collection' | 'league' | 'profile'
type SessionKind = 'mixed' | 'vocabulary' | 'grammar' | 'listening' | 'review'

type Props = {
  language: Language
  userId: string
  onOpenStudio: () => void
}

type ActiveSession = {
  kind: SessionKind
  lessonId: string
  questions: EnglishQuestion[]
  index: number
  response: string
  feedback: { score: number; explanation: string } | null
  correct: number
}

type SpeechRecognitionEventLike = {
  results: {
    [index: number]: {
      [index: number]: { transcript: string }
    }
  }
}

type SpeechRecognitionLike = {
  lang: string
  interimResults: boolean
  continuous: boolean
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

const SKILLS: EnglishSkill[] = ['recognition', 'spelling', 'grammar', 'reading', 'listening']
const AVATARS = ['🐧', '🦊', '🐼', '🐰', '🦉', '🐯', '🐨', '🦦']
const FRAMES: JourneyState['frame'][] = ['aurora', 'sunset', 'ocean', 'mono']

function shuffle<T>(items: T[]) {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }
  return result
}

function prepareQuestion(question: EnglishQuestion) {
  return question.choices ? { ...question, choices: shuffle(question.choices) } : question
}

function primaryMeaning(entry: GeneratedCefrEntry) {
  const first = entry.translation
    .split(/\n+/)
    .map((item) => item.trim())
    .find((item) => item && !/^\[網路\]|^\[网络\]/.test(item))
  return first || entry.translation.trim() || entry.definition.trim()
}

function skillLabel(skill: EnglishSkill, language: Language) {
  const labels = language === 'zh'
    ? { recognition: '單字辨識', spelling: '主動拼字', grammar: '文法', reading: '閱讀', listening: '聽力' }
    : { recognition: 'Vocabulary', spelling: 'Spelling', grammar: 'Grammar', reading: 'Reading', listening: 'Listening' }
  return labels[skill]
}

function speechRecognitionConstructor() {
  const target = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
  return target.SpeechRecognition ?? target.webkitSpeechRecognition ?? null
}

function buildReviewQuestions(entries: GeneratedCefrEntry[]) {
  return entries.slice(0, 8).map<EnglishQuestion>((entry, index) => ({
    id: `journey-review-${entry.id}-${index}`,
    type: 'typing',
    skill: 'spelling',
    difficulty: ({ A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 5.8 } as Record<string, number>)[entry.level] ?? 2,
    prompt: `請依照意思輸入英文單字：${primaryMeaning(entry) || entry.definition}`,
    answer: entry.word,
    explanation: `${entry.word}${entry.phonetic ? ` /${entry.phonetic}/` : ''}：${primaryMeaning(entry) || entry.definition}`,
  }))
}

function selectSessionQuestions(kind: SessionKind, ability: number, reviewEntries: GeneratedCefrEntry[]) {
  if (kind === 'review' && reviewEntries.length > 0) return buildReviewQuestions(shuffle(reviewEntries))

  const allowedSkills: EnglishSkill[] = kind === 'vocabulary'
    ? ['recognition', 'spelling']
    : kind === 'grammar'
      ? ['grammar']
      : kind === 'listening'
        ? ['listening']
        : SKILLS

  const candidates = ASSESSMENT_QUESTION_BANK.filter((question) => (
    allowedSkills.includes(question.skill)
    && Math.abs(question.difficulty - ability) <= 0.9
  ))
  const fallback = ASSESSMENT_QUESTION_BANK.filter((question) => allowedSkills.includes(question.skill))
  return shuffle(candidates.length >= 8 ? candidates : fallback)
    .slice(0, kind === 'mixed' ? 7 : 6)
    .map(prepareQuestion)
}

function courseLevelTitle(course: JourneyCourseId, level: number, language: Language) {
  const cycle = (level - 1) % 5
  const labels = language === 'zh'
    ? {
        general: ['基本表達', '生活互動', '資訊理解', '自然敘述', '綜合挑戰'],
        travel: ['出發準備', '交通移動', '住宿餐飲', '問題處理', '旅程挑戰'],
        business: ['職場基礎', '書信會議', '專案協作', '簡報協商', '商務挑戰'],
        exam: ['核心字彙', '文法速度', '聽讀整合', '推論表達', '模擬挑戰'],
      }
    : {
        general: ['Core expression', 'Daily interaction', 'Understanding', 'Natural narration', 'Checkpoint'],
        travel: ['Preparation', 'Transport', 'Hotel and food', 'Problem solving', 'Travel checkpoint'],
        business: ['Workplace basics', 'Email and meetings', 'Collaboration', 'Presentation', 'Business checkpoint'],
        exam: ['Core vocabulary', 'Grammar speed', 'Listening and reading', 'Inference', 'Mock checkpoint'],
      }
  return labels[course][cycle]
}

export function EnglishJourneyHub({ language, userId, onOpenStudio }: Props) {
  const profile = readEnglishStored<LearnerProfile>(englishStorageKey(userId, 'profile'), DEFAULT_PROFILE)
  const assessmentResult = readEnglishStored<AssessmentResult | null>(englishStorageKey(userId, 'assessment-result'), null)
  const [journey, setJourney] = useState<JourneyState>(() => {
    const stored = readJourneyState(userId)
    return {
      ...stored,
      microLevel: Math.max(stored.microLevel, cefrBaseMicroLevel(profile.level)),
    }
  })
  const [tab, setTab] = useState<JourneyTab>('today')
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null)
  const [sessionSummary, setSessionSummary] = useState<{ correct: number; total: number; xp: number } | null>(null)
  const [selectedScenarioId, setSelectedScenarioId] = useState(() => (
    ROLEPLAY_SCENARIOS.find((scenario) => scenario.course === journey.selectedCourse)?.id ?? ROLEPLAY_SCENARIOS[0].id
  ))
  const [roleplayTurn, setRoleplayTurn] = useState(0)
  const [roleplayResponse, setRoleplayResponse] = useState('')
  const [roleplayFeedback, setRoleplayFeedback] = useState<{ passed: boolean; message: string } | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [speechMessage, setSpeechMessage] = useState('')
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const [sentenceEnglish, setSentenceEnglish] = useState('')
  const [sentenceChinese, setSentenceChinese] = useState('')

  useEffect(() => {
    writeJourneyState(userId, journey)
  }, [journey, userId])

  useEffect(() => () => recognitionRef.current?.stop(), [])

  const copy = language === 'zh'
    ? {
        title: '英文學習旅程', subtitle: '30 級個人化路線 · 每日任務 · 智慧複習 · 情境口說',
        fullStudio: assessmentResult ? '能力測驗與完整學習室' : '先完成能力測驗',
        today: '今天', path: '學習路線', review: '智慧複習', conversation: '情境會話', collection: '收藏', league: '聯盟', profile: '角色',
        level: '旅程等級', dailyGoal: '今日目標', weak: '優先補強', due: '今日待複習', savedWords: '收藏單字', savedSentences: '收藏句子',
        continue: '開始任務', completed: '已完成', claim: '領取每日寶箱', claimed: '今日已領取', course: '目前課程',
        startReview: '開始智慧複習', noReview: '目前沒有到期卡片，先收藏幾個單字或完成課程。',
        mic: '開始語音輸入', stopMic: '停止錄音', textFallback: '也可以直接輸入文字回答', submit: '送出回答', next: '下一段',
        localCoach: '本機情境教練：語音由瀏覽器轉成文字，再依關鍵內容與完整度回饋；不是發音評分或生成式 AI。',
        localLeague: '本機練習聯盟：其他名次為固定模擬資料，用來呈現每週目標，不代表真人排名。',
        englishSentence: '英文句子', chineseNote: '中文意思或筆記', save: '儲存',
        noSavedWords: '尚未收藏單字。完成課程後，可在答案解析旁加入複習。', noSavedSentences: '尚未收藏句子。',
        avatar: '角色造型', frame: '名牌外框', dailyTarget: '每日 XP 目標', badges: '成就徽章',
        question: '題目', check: '檢查答案', hear: '播放', bookmark: '加入智慧複習', bookmarked: '已加入複習',
        returnJourney: '返回旅程', finish: '完成課程', correct: '答對',
      }
    : {
        title: 'English Learning Journey', subtitle: '30 personalized levels · Daily quests · Smart review · Roleplay speaking',
        fullStudio: assessmentResult ? 'Placement and full studio' : 'Take the placement test first',
        today: 'Today', path: 'Learning path', review: 'Smart review', conversation: 'Roleplay', collection: 'Collection', league: 'League', profile: 'Avatar',
        level: 'Journey level', dailyGoal: 'Daily goal', weak: 'Priority skill', due: 'Due today', savedWords: 'Saved words', savedSentences: 'Saved sentences',
        continue: 'Start quest', completed: 'Completed', claim: 'Claim daily chest', claimed: 'Claimed today', course: 'Current course',
        startReview: 'Start smart review', noReview: 'No cards are due. Save words or complete a lesson first.',
        mic: 'Start voice input', stopMic: 'Stop recording', textFallback: 'You can also type your answer', submit: 'Submit response', next: 'Next turn',
        localCoach: 'Local scenario coach: your browser transcribes speech and the app checks key content and completeness. It is not pronunciation scoring or generative AI.',
        localLeague: 'Local practice league: other positions are simulated weekly targets, not live people.',
        englishSentence: 'English sentence', chineseNote: 'Chinese meaning or note', save: 'Save',
        noSavedWords: 'No saved words yet. Add words from lesson feedback.', noSavedSentences: 'No saved sentences yet.',
        avatar: 'Avatar', frame: 'Nameplate frame', dailyTarget: 'Daily XP target', badges: 'Achievements',
        question: 'Question', check: 'Check answer', hear: 'Play', bookmark: 'Add to smart review', bookmarked: 'Added to review',
        returnJourney: 'Back to journey', finish: 'Finish lesson', correct: 'correct',
      }

  const weakestSkill = useMemo<EnglishSkill>(() => {
    if (!assessmentResult) return 'recognition'
    return (Object.entries(assessmentResult.skillScores) as Array<[EnglishSkill, number]>)
      .sort((left, right) => left[1] - right[1])[0]?.[0] ?? 'recognition'
  }, [assessmentResult])

  const ability = englishLevelNumber(profile.level)
  const today = englishTodayKey()
  const todayXp = journey.dailyXp[today] ?? 0
  const dailyProgress = Math.min(100, Math.round((todayXp / journey.dailyTargetXp) * 100))
  const currentCourse = COURSE_TRACKS.find((course) => course.id === journey.selectedCourse) ?? COURSE_TRACKS[0]
  const selectedScenario = ROLEPLAY_SCENARIOS.find((scenario) => scenario.id === selectedScenarioId) ?? ROLEPLAY_SCENARIOS[0]
  const currentStage = selectedScenario.stages[roleplayTurn] ?? selectedScenario.stages[0]

  const lexiconByWord = useMemo(() => {
    const map = new Map<string, GeneratedCefrEntry>()
    CEFR_LEXICON.forEach((entry) => {
      const key = normalizeEnglishAnswer(entry.word)
      const current = map.get(key)
      if (!current || (!current.translation && entry.translation)) map.set(key, entry)
    })
    return map
  }, [])

  const savedEntries = useMemo(() => journey.savedWordIds
    .map((id) => CEFR_LEXICON.find((entry) => entry.id === id))
    .filter((entry): entry is GeneratedCefrEntry => Boolean(entry)), [journey.savedWordIds])

  const dueEntries = useMemo(() => savedEntries.filter((entry) => {
    const item = journey.reviewSchedule[entry.id]
    return !item || item.dueDate <= today
  }), [journey.reviewSchedule, savedEntries, today])

  const recommendedEntries = useMemo(() => {
    const level = microLevelToCefr(journey.microLevel)
    const offset = (new Date().getDate() * 13) % 400
    return CEFR_LEXICON
      .filter((entry) => entry.level === level && entry.translation)
      .filter((entry) => !journey.savedWordIds.includes(entry.id))
      .slice(offset, offset + 8)
  }, [journey.microLevel, journey.savedWordIds])

  const missionDefinitions: Array<{
    id: string
    icon: string
    title: string
    detail: string
    kind: SessionKind | null
    xp: number
  }> = [
    {
      id: `${today}-weak-${weakestSkill}`,
      icon: '🧭',
      title: language === 'zh' ? `補強 ${skillLabel(weakestSkill, language)}` : `Strengthen ${skillLabel(weakestSkill, language)}`,
      detail: language === 'zh' ? '依程度測驗弱項安排 6 題。' : 'Six questions based on your weakest placement skill.',
      kind: weakestSkill === 'grammar' ? 'grammar' : weakestSkill === 'listening' ? 'listening' : 'vocabulary',
      xp: 45,
    },
    {
      id: `${today}-course-${journey.selectedCourse}`,
      icon: currentCourse.icon,
      title: language === 'zh' ? `${currentCourse.zhTitle}綜合課` : `${currentCourse.enTitle} mix`,
      detail: language === 'zh' ? '字彙、文法、閱讀與聽力混合。' : 'Mixed vocabulary, grammar, reading, and listening.',
      kind: 'mixed',
      xp: 55,
    },
    {
      id: `${today}-review`,
      icon: '🧠',
      title: language === 'zh' ? `智慧複習 ${dueEntries.length} 張` : `${dueEntries.length} smart reviews`,
      detail: language === 'zh' ? '依答題結果安排 1、3、7 天以上間隔。' : 'Spaced review expands from 1 to 3 to 7+ days.',
      kind: 'review',
      xp: 35,
    },
    {
      id: `${today}-speaking-${selectedScenario.id}`,
      icon: '🎙️',
      title: language === 'zh' ? selectedScenario.zhTitle : selectedScenario.enTitle,
      detail: language === 'zh' ? '完成三輪情境回答。' : 'Complete three roleplay turns.',
      kind: null,
      xp: 50,
    },
  ]

  const updateJourney = (updater: (current: JourneyState) => JourneyState) => {
    setJourney((current) => updater(current))
  }

  const saveWord = (entry: GeneratedCefrEntry) => {
    updateJourney((current) => ({
      ...current,
      savedWordIds: Array.from(new Set([...current.savedWordIds, entry.id])),
      reviewSchedule: current.reviewSchedule[entry.id]
        ? current.reviewSchedule
        : {
            ...current.reviewSchedule,
            [entry.id]: { dueDate: today, intervalDays: 0, ease: 2.3, lapses: 0, reviews: 0 },
          },
    }))
  }

  const startSession = (kind: SessionKind, lessonId: string) => {
    const questions = selectSessionQuestions(kind, ability, dueEntries)
    if (questions.length === 0) return
    setSessionSummary(null)
    setActiveSession({ kind, lessonId, questions, index: 0, response: '', feedback: null, correct: 0 })
  }

  const submitSessionAnswer = (event: FormEvent) => {
    event.preventDefault()
    if (!activeSession || activeSession.feedback || !activeSession.response.trim()) return
    const question = activeSession.questions[activeSession.index]
    const score = englishAnswerScore(activeSession.response, question.answer)
    const entry = lexiconByWord.get(normalizeEnglishAnswer(question.answer))
    setActiveSession((current) => current ? {
      ...current,
      feedback: { score, explanation: question.explanation },
      correct: current.correct + (score === 1 ? 1 : 0),
    } : current)
    if (entry && (activeSession.kind === 'review' || journey.savedWordIds.includes(entry.id))) {
      updateJourney((current) => ({
        ...current,
        reviewSchedule: {
          ...current.reviewSchedule,
          [entry.id]: scheduleReview(current.reviewSchedule[entry.id], score === 1),
        },
      }))
    }
  }

  const nextSessionQuestion = () => {
    if (!activeSession?.feedback) return
    if (activeSession.index >= activeSession.questions.length - 1) {
      const earnedXp = 20 + activeSession.correct * 7
      updateJourney((current) => {
        const rewarded = applyJourneyReward(current, earnedXp, 8 + activeSession.correct * 2, activeSession.lessonId)
        return {
          ...rewarded,
          completedMissionIds: Array.from(new Set([...rewarded.completedMissionIds, activeSession.lessonId])),
        }
      })
      setSessionSummary({ correct: activeSession.correct, total: activeSession.questions.length, xp: earnedXp })
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

  const claimDailyReward = () => {
    if (journey.claimedDailyRewardDate === today) return
    updateJourney((current) => ({
      ...applyJourneyReward(current, 15, 30, `${today}-daily-chest`),
      claimedDailyRewardDate: today,
    }))
  }

  const selectCourse = (course: JourneyCourseId) => {
    updateJourney((current) => ({ ...current, selectedCourse: course }))
    const firstScenario = ROLEPLAY_SCENARIOS.find((scenario) => scenario.course === course)
    if (firstScenario) setSelectedScenarioId(firstScenario.id)
  }

  const startSpeechInput = () => {
    const Constructor = speechRecognitionConstructor()
    if (!Constructor) {
      setSpeechMessage(language === 'zh' ? '此瀏覽器不支援語音辨識，請改用文字輸入。' : 'Speech recognition is unavailable. Please type your answer.')
      return
    }
    const recognition = new Constructor()
    recognition.lang = profile.accent === 'en-GB' ? 'en-GB' : 'en-US'
    recognition.interimResults = false
    recognition.continuous = false
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? ''
      setRoleplayResponse(transcript)
      setSpeechMessage(transcript ? (language === 'zh' ? '已完成語音轉文字，請確認後送出。' : 'Transcription ready. Review and submit.') : '')
    }
    recognition.onerror = () => setSpeechMessage(language === 'zh' ? '語音辨識失敗，請再試一次或直接輸入。' : 'Speech recognition failed. Try again or type instead.')
    recognition.onend = () => setIsListening(false)
    recognitionRef.current = recognition
    setIsListening(true)
    setSpeechMessage(language === 'zh' ? '正在聆聽…' : 'Listening…')
    recognition.start()
  }

  const stopSpeechInput = () => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }

  const submitRoleplay = (event: FormEvent) => {
    event.preventDefault()
    if (!roleplayResponse.trim() || roleplayFeedback) return
    const normalized = normalizeEnglishAnswer(roleplayResponse)
    const matches = currentStage.expectedKeywords.filter((keyword) => normalized.includes(keyword)).length
    const wordCount = roleplayResponse.trim().split(/\s+/).length
    const passed = matches > 0 && wordCount >= 3
    setRoleplayFeedback({
      passed,
      message: passed
        ? `${currentStage.successReply}\n${language === 'zh' ? `內容命中 ${matches} 個重點，句子共 ${wordCount} 字。` : `${matches} content target(s) matched in ${wordCount} words.`}`
        : `${currentStage.retryHint}\n${language === 'zh' ? `參考回答：${currentStage.sample}` : `Sample: ${currentStage.sample}`}`,
    })
  }

  const nextRoleplayTurn = () => {
    if (!roleplayFeedback?.passed) {
      setRoleplayFeedback(null)
      setRoleplayResponse('')
      return
    }
    if (roleplayTurn >= selectedScenario.stages.length - 1) {
      const missionId = `${today}-speaking-${selectedScenario.id}`
      updateJourney((current) => {
        const rewarded = applyJourneyReward(current, 50, 18, missionId)
        return {
          ...rewarded,
          speakingAttempts: rewarded.speakingAttempts + 1,
          roleplayCompletions: {
            ...rewarded.roleplayCompletions,
            [selectedScenario.id]: (rewarded.roleplayCompletions[selectedScenario.id] ?? 0) + 1,
          },
          completedMissionIds: Array.from(new Set([...rewarded.completedMissionIds, missionId])),
        }
      })
      setRoleplayTurn(0)
      setRoleplayResponse('')
      setRoleplayFeedback(null)
      setSpeechMessage(language === 'zh' ? '情境完成，獲得 50 XP。' : 'Scenario complete. You earned 50 XP.')
      return
    }
    setRoleplayTurn((current) => current + 1)
    setRoleplayResponse('')
    setRoleplayFeedback(null)
    setSpeechMessage('')
  }

  const changeScenario = (scenario: RoleplayScenario) => {
    setSelectedScenarioId(scenario.id)
    setRoleplayTurn(0)
    setRoleplayResponse('')
    setRoleplayFeedback(null)
    setSpeechMessage('')
  }

  const saveSentence = (event: FormEvent) => {
    event.preventDefault()
    if (!sentenceEnglish.trim()) return
    updateJourney((current) => ({
      ...current,
      savedSentences: [
        {
          id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
          english: sentenceEnglish.trim(),
          chinese: sentenceChinese.trim(),
          createdAt: new Date().toISOString(),
        },
        ...current.savedSentences,
      ].slice(0, 200),
    }))
    setSentenceEnglish('')
    setSentenceChinese('')
  }

  const badges = [
    { icon: '🌟', label: language === 'zh' ? '踏出第一步' : 'First step', unlocked: journey.xp > 0 },
    { icon: '🔥', label: language === 'zh' ? '連續 7 天' : '7-day streak', unlocked: journey.streak >= 7 },
    { icon: '🎙️', label: language === 'zh' ? '會話練習家' : 'Roleplay learner', unlocked: journey.speakingAttempts >= 5 },
    { icon: '🧠', label: language === 'zh' ? '收藏 20 字' : '20 saved words', unlocked: journey.savedWordIds.length >= 20 },
    { icon: '🏆', label: language === 'zh' ? '旅程 10 級' : 'Journey level 10', unlocked: journey.microLevel >= 10 },
    { icon: '👑', label: language === 'zh' ? '旅程 30 級' : 'Journey level 30', unlocked: journey.microLevel >= 30 },
  ]

  if (activeSession) {
    const question = activeSession.questions[activeSession.index]
    const entry = lexiconByWord.get(normalizeEnglishAnswer(question.answer))
    const isSaved = entry ? journey.savedWordIds.includes(entry.id) : false
    return (
      <div className="journey-shell journey-session-shell">
        <header className="journey-session-head">
          <button type="button" onClick={() => setActiveSession(null)}>← {copy.returnJourney}</button>
          <div><span>{activeSession.index + 1} / {activeSession.questions.length}</span><strong>{skillLabel(question.skill, language)}</strong></div>
        </header>
        <div className="journey-session-progress"><span style={{ width: `${((activeSession.index + 1) / activeSession.questions.length) * 100}%` }} /></div>
        <section className="journey-question-card">
          <p className="journey-kicker">{copy.question} · {microLevelToCefr(journey.microLevel)}</p>
          <h2>{question.prompt}</h2>
          {question.context ? <div className="journey-question-context">{question.context}</div> : null}
          {question.type === 'listening' ? <button className="journey-audio-button" type="button" onClick={() => speakEnglish(question.audioText ?? question.answer, profile.accent)}>🔊 {copy.hear}</button> : null}
          <form onSubmit={submitSessionAnswer}>
            {question.type === 'choice' && question.choices ? (
              <div className="journey-choice-grid">
                {question.choices.map((choice) => (
                  <button className={activeSession.response === choice ? 'active' : ''} type="button" key={choice} disabled={Boolean(activeSession.feedback)} onClick={() => setActiveSession((current) => current ? { ...current, response: choice } : current)}>{choice}</button>
                ))}
              </div>
            ) : <input className="journey-answer-input" value={activeSession.response} disabled={Boolean(activeSession.feedback)} autoFocus autoComplete="off" onChange={(event) => setActiveSession((current) => current ? { ...current, response: event.target.value } : current)} />}
            {!activeSession.feedback ? <button className="journey-primary" type="submit" disabled={!activeSession.response.trim()}>{copy.check}</button> : (
              <div className={`journey-feedback ${activeSession.feedback.score === 1 ? 'correct' : activeSession.feedback.score === 0.5 ? 'almost' : 'wrong'}`}>
                <strong>{activeSession.feedback.score === 1 ? '✓ Correct' : activeSession.feedback.score === 0.5 ? '△ Almost' : `✕ ${question.answer}`}</strong>
                <p>{activeSession.feedback.explanation}</p>
                <div>{entry ? <button type="button" disabled={isSaved} onClick={() => saveWord(entry)}>{isSaved ? copy.bookmarked : copy.bookmark}</button> : null}<button className="journey-primary" type="button" onClick={nextSessionQuestion}>{activeSession.index >= activeSession.questions.length - 1 ? copy.finish : copy.next}</button></div>
              </div>
            )}
          </form>
        </section>
      </div>
    )
  }

  return (
    <div className={`journey-shell frame-${journey.frame}`}>
      <header className="journey-header">
        <div className="journey-brand"><div className="journey-avatar">{journey.avatar}</div><div><p className="journey-kicker">BUBBLE ENGLISH JOURNEY</p><h1>{copy.title}</h1><span>{copy.subtitle}</span></div></div>
        <div className="journey-header-actions"><div><span>🔥</span><strong>{journey.streak}</strong></div><div><span>🪙</span><strong>{journey.coins}</strong></div><button type="button" onClick={onOpenStudio}>{copy.fullStudio}</button></div>
      </header>

      <nav className="journey-tabs">
        {([
          ['today', '☀️', copy.today], ['path', '🗺️', copy.path], ['review', '🧠', copy.review], ['conversation', '🎙️', copy.conversation],
          ['collection', '🔖', copy.collection], ['league', '🏆', copy.league], ['profile', journey.avatar, copy.profile],
        ] as Array<[JourneyTab, string, string]>).map(([id, icon, label]) => <button className={tab === id ? 'active' : ''} type="button" key={id} onClick={() => setTab(id)}><span>{icon}</span>{label}</button>)}
      </nav>

      {sessionSummary ? <div className="journey-toast"><strong>+{sessionSummary.xp} XP</strong><span>{sessionSummary.correct} / {sessionSummary.total} {copy.correct}</span><button type="button" onClick={() => setSessionSummary(null)}>×</button></div> : null}

      {tab === 'today' ? (
        <main className="journey-today">
          <section className="journey-hero-card">
            <div><p>{currentCourse.icon} {copy.course}</p><h2>{language === 'zh' ? currentCourse.zhTitle : currentCourse.enTitle}</h2><span>{language === 'zh' ? currentCourse.zhDescription : currentCourse.enDescription}</span><div className="journey-hero-actions"><button className="journey-primary" type="button" onClick={() => startSession('mixed', `${today}-hero-course`)}>{copy.continue}</button><button type="button" onClick={() => setTab('path')}>{copy.path}</button></div></div>
            <div className="journey-level-dial"><span>{copy.level}</span><strong>{journey.microLevel}</strong><small>{microLevelToCefr(journey.microLevel)} · {journey.xp.toLocaleString()} XP</small></div>
          </section>
          <section className="journey-stat-grid">
            <article><span>🎯</span><div><strong>{todayXp} / {journey.dailyTargetXp} XP</strong><small>{copy.dailyGoal}</small></div><i><b style={{ width: `${dailyProgress}%` }} /></i></article>
            <article><span>🧭</span><div><strong>{skillLabel(weakestSkill, language)}</strong><small>{copy.weak}</small></div></article>
            <article><span>🧠</span><div><strong>{dueEntries.length}</strong><small>{copy.due}</small></div></article>
            <article><span>📚</span><div><strong>{CEFR_BILINGUAL_CARD_COUNT.toLocaleString()}</strong><small>{language === 'zh' ? '中英雙語卡' : 'Bilingual cards'}</small></div></article>
          </section>
          <div className="journey-section-title"><div><p>DAILY QUESTS</p><h2>{language === 'zh' ? '今日任務' : 'Today’s quests'}</h2></div><button type="button" disabled={journey.claimedDailyRewardDate === today} onClick={claimDailyReward}>{journey.claimedDailyRewardDate === today ? copy.claimed : `🎁 ${copy.claim}`}</button></div>
          <section className="journey-mission-grid">
            {missionDefinitions.map((mission) => {
              const completed = journey.completedMissionIds.includes(mission.id)
              return <article className={completed ? 'completed' : ''} key={mission.id}><span>{mission.icon}</span><div><h3>{mission.title}</h3><p>{mission.detail}</p><small>+{mission.xp} XP</small></div><button type="button" disabled={completed || (mission.kind === 'review' && dueEntries.length === 0)} onClick={() => { if (mission.kind) startSession(mission.kind, mission.id); else { setTab('conversation'); changeScenario(selectedScenario) } }}>{completed ? copy.completed : copy.continue}</button></article>
            })}
          </section>
        </main>
      ) : null}

      {tab === 'path' ? (
        <main className="journey-path-page">
          <section className="journey-course-selector">{COURSE_TRACKS.map((course) => <button className={journey.selectedCourse === course.id ? 'active' : ''} type="button" key={course.id} onClick={() => selectCourse(course.id)}><span>{course.icon}</span><strong>{language === 'zh' ? course.zhTitle : course.enTitle}</strong><small>{language === 'zh' ? course.zhDescription : course.enDescription}</small></button>)}</section>
          <section className="journey-path-track">{Array.from({ length: 30 }, (_, index) => index + 1).map((level) => {
            const locked = level > journey.microLevel + 1
            const completed = level < journey.microLevel || journey.completedLessonIds.includes(`path-${journey.selectedCourse}-${level}`)
            return <button className={`${locked ? 'locked' : ''} ${completed ? 'completed' : ''} ${level === journey.microLevel ? 'current' : ''}`} type="button" key={level} disabled={locked} onClick={() => startSession('mixed', `path-${journey.selectedCourse}-${level}`)}><span>{completed ? '✓' : locked ? '🔒' : level}</span><div><strong>{courseLevelTitle(journey.selectedCourse, level, language)}</strong><small>Level {level} · {microLevelToCefr(level)}</small></div><i /></button>
          })}</section>
        </main>
      ) : null}

      {tab === 'review' ? (
        <main className="journey-review-page">
          <section className="journey-review-hero"><div><p>SPACED REVIEW</p><h2>{copy.review}</h2><span>{language === 'zh' ? '答錯後隔天再見；答對後逐步延長到 3、7、14 天以上。' : 'Wrong answers return tomorrow; correct answers expand toward 3, 7, and 14+ days.'}</span></div><div><strong>{dueEntries.length}</strong><span>{copy.due}</span><button className="journey-primary" type="button" disabled={dueEntries.length === 0} onClick={() => startSession('review', `${today}-review-page`)}>{copy.startReview}</button></div></section>
          {savedEntries.length === 0 ? <p className="journey-empty">{copy.noReview}</p> : <div className="journey-review-list">{savedEntries.map((entry) => { const schedule = journey.reviewSchedule[entry.id]; const isDue = !schedule || schedule.dueDate <= today; return <article key={entry.id}><button type="button" onClick={() => speakEnglish(entry.word, profile.accent)}>🔊</button><div><strong>{entry.word}</strong><p>{primaryMeaning(entry)}</p><small>{entry.level} · {entry.pos}</small></div><span className={isDue ? 'due' : ''}>{isDue ? (language === 'zh' ? '今天' : 'Today') : schedule?.dueDate}</span></article> })}</div>}
        </main>
      ) : null}

      {tab === 'conversation' ? (
        <main className="journey-conversation-page">
          <aside className="journey-scenario-list"><h2>{copy.conversation}</h2>{ROLEPLAY_SCENARIOS.map((scenario) => <button className={selectedScenario.id === scenario.id ? 'active' : ''} type="button" key={scenario.id} onClick={() => changeScenario(scenario)}><span>{scenario.icon}</span><div><strong>{language === 'zh' ? scenario.zhTitle : scenario.enTitle}</strong><small>{microLevelToCefr(scenario.level * 5)}</small></div></button>)}</aside>
          <section className="journey-roleplay-panel">
            <header><div><p>{selectedScenario.icon} ROLEPLAY</p><h2>{language === 'zh' ? selectedScenario.zhTitle : selectedScenario.enTitle}</h2><span>{language === 'zh' ? selectedScenario.zhDescription : selectedScenario.enDescription}</span></div><strong>{roleplayTurn + 1} / {selectedScenario.stages.length}</strong></header>
            <p className="journey-local-note">{copy.localCoach}</p>
            <div className="journey-dialogue-bubble"><span>{currentStage.speaker}</span><p>{currentStage.prompt}</p><button type="button" onClick={() => speakEnglish(currentStage.prompt, profile.accent)}>🔊</button></div>
            <form onSubmit={submitRoleplay}><textarea value={roleplayResponse} disabled={Boolean(roleplayFeedback)} placeholder={copy.textFallback} onChange={(event) => setRoleplayResponse(event.target.value)} /><div className="journey-roleplay-actions"><button type="button" disabled={Boolean(roleplayFeedback)} onClick={isListening ? stopSpeechInput : startSpeechInput}>{isListening ? `⏹ ${copy.stopMic}` : `🎙️ ${copy.mic}`}</button><button className="journey-primary" type="submit" disabled={!roleplayResponse.trim() || Boolean(roleplayFeedback)}>{copy.submit}</button></div></form>
            {speechMessage ? <p className="journey-speech-message">{speechMessage}</p> : null}
            {roleplayFeedback ? <div className={`journey-feedback ${roleplayFeedback.passed ? 'correct' : 'wrong'}`}><strong>{roleplayFeedback.passed ? '✓ Good response' : '△ Try again'}</strong><p>{roleplayFeedback.message}</p><button className="journey-primary" type="button" onClick={nextRoleplayTurn}>{roleplayFeedback.passed ? copy.next : (language === 'zh' ? '重新回答' : 'Try again')}</button></div> : null}
          </section>
        </main>
      ) : null}

      {tab === 'collection' ? (
        <main className="journey-collection-page">
          <section><div className="journey-section-title"><div><p>WORD COLLECTION</p><h2>{copy.savedWords} · {savedEntries.length}</h2></div></div>{savedEntries.length === 0 ? <p className="journey-empty">{copy.noSavedWords}</p> : <div className="journey-saved-word-grid">{savedEntries.map((entry) => <article key={entry.id}><button type="button" onClick={() => speakEnglish(entry.word, profile.accent)}>🔊</button><strong>{entry.word}</strong><span>{primaryMeaning(entry)}</span><small>{entry.level} · {entry.pos}</small></article>)}</div>}<div className="journey-section-title compact"><div><p>RECOMMENDED</p><h2>{language === 'zh' ? '今日推薦' : 'Today’s picks'}</h2></div></div><div className="journey-saved-word-grid">{recommendedEntries.map((entry) => <article key={entry.id}><button type="button" onClick={() => saveWord(entry)}>＋</button><strong>{entry.word}</strong><span>{primaryMeaning(entry)}</span><small>{entry.level} · {entry.pos}</small></article>)}</div></section>
          <section><div className="journey-section-title"><div><p>SENTENCE COLLECTION</p><h2>{copy.savedSentences} · {journey.savedSentences.length}</h2></div></div><form className="journey-sentence-form" onSubmit={saveSentence}><input value={sentenceEnglish} placeholder={copy.englishSentence} onChange={(event) => setSentenceEnglish(event.target.value)} /><input value={sentenceChinese} placeholder={copy.chineseNote} onChange={(event) => setSentenceChinese(event.target.value)} /><button className="journey-primary" type="submit" disabled={!sentenceEnglish.trim()}>{copy.save}</button></form>{journey.savedSentences.length === 0 ? <p className="journey-empty">{copy.noSavedSentences}</p> : <div className="journey-sentence-list">{journey.savedSentences.map((sentence) => <article key={sentence.id}><button type="button" onClick={() => speakEnglish(sentence.english, profile.accent)}>🔊</button><div><strong>{sentence.english}</strong><span>{sentence.chinese || '—'}</span></div><button type="button" onClick={() => updateJourney((current) => ({ ...current, savedSentences: current.savedSentences.filter((item) => item.id !== sentence.id) }))}>×</button></article>)}</div>}</section>
        </main>
      ) : null}

      {tab === 'league' ? <main className="journey-league-page"><section className="journey-league-card"><header><div><p>WEEKLY PRACTICE LEAGUE</p><h2>Crystal League</h2><span>{copy.localLeague}</span></div><div><strong>{weeklyXp(journey)}</strong><span>{language === 'zh' ? '本週 XP' : 'Weekly XP'}</span></div></header><div className="journey-league-table">{localLeagueRows(journey).map((row) => <article className={row.isUser ? 'user' : ''} key={row.name}><strong>#{row.rank}</strong><span>{row.avatar}</span><div>{row.name}{row.isUser ? <small>{language === 'zh' ? '（你）' : ' (you)'}</small> : null}</div><b>{row.xp} XP</b></article>)}</div></section></main> : null}

      {tab === 'profile' ? (
        <main className="journey-profile-page"><section className="journey-profile-preview"><div className={`journey-avatar-large frame-${journey.frame}`}>{journey.avatar}</div><h2>{language === 'zh' ? '你的學習角色' : 'Your learner avatar'}</h2><p>Level {journey.microLevel} · {microLevelToCefr(journey.microLevel)} · {journey.xp.toLocaleString()} XP</p></section><section className="journey-customization"><h3>{copy.avatar}</h3><div className="journey-avatar-options">{AVATARS.map((avatar) => <button className={journey.avatar === avatar ? 'active' : ''} type="button" key={avatar} onClick={() => updateJourney((current) => ({ ...current, avatar }))}>{avatar}</button>)}</div><h3>{copy.frame}</h3><div className="journey-frame-options">{FRAMES.map((frame) => <button className={journey.frame === frame ? 'active' : ''} type="button" key={frame} onClick={() => updateJourney((current) => ({ ...current, frame }))}>{frame}</button>)}</div><h3>{copy.dailyTarget}</h3><div className="journey-target-setting"><input type="range" min="20" max="150" step="10" value={journey.dailyTargetXp} onChange={(event) => updateJourney((current) => ({ ...current, dailyTargetXp: Number(event.target.value) }))} /><strong>{journey.dailyTargetXp} XP</strong></div></section><section className="journey-badges"><h3>{copy.badges}</h3><div>{badges.map((badge) => <article className={badge.unlocked ? 'unlocked' : ''} key={badge.label}><span>{badge.icon}</span><strong>{badge.label}</strong><small>{badge.unlocked ? '✓' : '🔒'}</small></article>)}</div></section></main>
      ) : null}
    </div>
  )
}
