import { useMemo, useState } from 'react'
import type { Dispatch, FormEvent, SetStateAction } from 'react'
import { ENGLISH_WORDS } from '../english-data'
import type { EnglishWord } from '../english-data'
import {
  englishAnswerScore,
  englishTodayKey,
  normalizeEnglishAnswer,
  speakEnglish,
} from '../english-learning'
import type { LearnerProfile, LearningHistory } from '../english-learning'
import type { Language } from '../types'

type CasualMode = 'meaning' | 'spelling' | 'listening' | 'cloze' | 'synonym' | 'antonym' | 'collocation' | 'sentence'

type CasualChallenge = {
  id: string
  word: EnglishWord
  mode: CasualMode
  prompt: string
  answer: string
  choices?: string[]
  context?: string
}

type SessionStats = {
  attempts: number
  correct: number
  streak: number
  bestStreak: number
}

type EnglishCasualPracticeProps = {
  language: Language
  profile: LearnerProfile
  history: LearningHistory
  setHistory: Dispatch<SetStateAction<LearningHistory>>
  onOpenWord: (wordId: string) => void
}

const ALL_MODES: CasualMode[] = ['meaning', 'spelling', 'listening', 'cloze', 'synonym', 'antonym', 'collocation', 'sentence']

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
  const distinct = Array.from(new Set(candidates.filter((item) => item && item !== answer)))
  return shuffleArray([answer, ...shuffleArray(distinct).slice(0, 3)])
}

function buildChallenge(
  pool: EnglishWord[],
  listeningEnabled: boolean,
  recentWordIds: string[],
  previousMode: CasualMode | null,
  language: Language,
): CasualChallenge {
  const availableWords = pool.length > 3
    ? pool.filter((word) => !recentWordIds.includes(word.id))
    : pool
  const word = pickRandom(availableWords.length > 0 ? availableWords : pool)
  const allowedModes = ALL_MODES.filter((mode) => listeningEnabled || mode !== 'listening')
  const nextModes = allowedModes.length > 1 ? allowedModes.filter((mode) => mode !== previousMode) : allowedModes
  const mode = pickRandom(nextModes)
  const otherWords = ENGLISH_WORDS.filter((item) => item.id !== word.id)
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}-${word.id}-${mode}`

  if (mode === 'meaning') {
    return {
      id,
      word,
      mode,
      prompt: language === 'zh' ? `「${word.word}」最接近哪個意思？` : `Which meaning best matches “${word.word}”?`,
      answer: word.meaning,
      choices: uniqueChoices(word.meaning, otherWords.map((item) => item.meaning)),
      context: `${word.phoneticUS} · ${word.partOfSpeech}`,
    }
  }

  if (mode === 'spelling') {
    return {
      id,
      word,
      mode,
      prompt: language === 'zh' ? `請輸入「${word.meaning}」的英文。` : `Type the English word for “${word.meaning}”.`,
      answer: word.word,
      context: language === 'zh' ? `詞性：${word.partOfSpeech}` : `Part of speech: ${word.partOfSpeech}`,
    }
  }

  if (mode === 'listening') {
    return {
      id,
      word,
      mode,
      prompt: language === 'zh' ? '播放發音後，輸入你聽到的單字。' : 'Play the audio and type the word you hear.',
      answer: word.word,
      context: language === 'zh' ? '這題不會顯示中文提示。' : 'No meaning hint is shown for this item.',
    }
  }

  if (mode === 'cloze') {
    return {
      id,
      word,
      mode,
      prompt: word.example.replace(new RegExp(word.word, 'i'), '________'),
      answer: word.word,
      context: language === 'zh' ? `中文：${word.exampleZh}` : word.definition,
    }
  }

  if (mode === 'synonym') {
    const answer = pickRandom(word.synonyms)
    return {
      id,
      word,
      mode,
      prompt: language === 'zh' ? `哪個字最接近「${word.word}」？` : `Which word is closest in meaning to “${word.word}”?`,
      answer,
      choices: uniqueChoices(answer, otherWords.flatMap((item) => item.synonyms)),
      context: word.definition,
    }
  }

  if (mode === 'antonym') {
    const answer = pickRandom(word.antonyms)
    return {
      id,
      word,
      mode,
      prompt: language === 'zh' ? `哪個字是「${word.word}」的反義詞？` : `Which word is an antonym of “${word.word}”?`,
      answer,
      choices: uniqueChoices(answer, otherWords.flatMap((item) => item.antonyms)),
      context: word.meaning,
    }
  }

  if (mode === 'collocation') {
    const answer = pickRandom(word.collocations)
    return {
      id,
      word,
      mode,
      prompt: language === 'zh' ? `哪個搭配最適合「${word.word}」？` : `Which collocation best matches “${word.word}”?`,
      answer,
      choices: uniqueChoices(answer, otherWords.flatMap((item) => item.collocations)),
      context: word.meaning,
    }
  }

  return {
    id,
    word,
    mode,
    prompt: language === 'zh'
      ? `請用「${word.word}」寫一句至少四個英文單字的句子。`
      : `Write a sentence of at least four words using “${word.word}”.`,
    answer: word.word,
    context: `${word.meaning} · ${word.memory}`,
  }
}

function modeLabel(mode: CasualMode, language: Language) {
  const labels = language === 'zh'
    ? {
        meaning: '意思辨識', spelling: '中文轉英文', listening: '聽力拼字', cloze: '句子填空',
        synonym: '同義詞', antonym: '反義詞', collocation: '常見搭配', sentence: '自由造句',
      }
    : {
        meaning: 'Meaning', spelling: 'Spelling', listening: 'Dictation', cloze: 'Cloze',
        synonym: 'Synonym', antonym: 'Antonym', collocation: 'Collocation', sentence: 'Sentence',
      }
  return labels[mode]
}

export function EnglishCasualPractice({ language, profile, history, setHistory, onOpenWord }: EnglishCasualPracticeProps) {
  const reviewIds = useMemo(
    () => Array.from(new Set([...history.learnedWordIds, ...history.difficultWordIds])),
    [history.difficultWordIds, history.learnedWordIds],
  )
  const reviewPool = useMemo(() => {
    const matched = ENGLISH_WORDS.filter((word) => reviewIds.includes(word.id))
    return matched.length > 0 ? matched : ENGLISH_WORDS
  }, [reviewIds])
  const isFallbackPool = reviewIds.length === 0

  const [recentWordIds, setRecentWordIds] = useState<string[]>([])
  const [challenge, setChallenge] = useState<CasualChallenge>(() => buildChallenge(reviewPool, profile.listeningEnabled, [], null, language))
  const [response, setResponse] = useState('')
  const [feedback, setFeedback] = useState<{ score: number; text: string } | null>(null)
  const [stats, setStats] = useState<SessionStats>({ attempts: 0, correct: 0, streak: 0, bestStreak: 0 })

  const recordHistory = (score: number) => {
    setHistory((current) => {
      const today = englishTodayKey()
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
      return {
        ...current,
        attempts: current.attempts + 1,
        correct: current.correct + (score === 1 ? 1 : 0),
        difficultWordIds: score < 1
          ? Array.from(new Set([...current.difficultWordIds, challenge.word.id]))
          : current.difficultWordIds,
        streak: current.lastStudyDate === today
          ? current.streak
          : current.lastStudyDate === yesterday
            ? current.streak + 1
            : 1,
        lastStudyDate: today,
      }
    })
  }

  const gradeResponse = (answerText: string, isUnknown = false) => {
    if (feedback) return
    const score = isUnknown
      ? 0
      : challenge.mode === 'sentence'
        ? (normalizeEnglishAnswer(answerText).includes(challenge.word.word.toLowerCase()) && answerText.trim().split(/\s+/).length >= 4 ? 1 : 0)
        : englishAnswerScore(answerText, challenge.answer)

    const text = score === 1
      ? (language === 'zh' ? '答對了。這題會計入本次休閒練習紀錄。' : 'Correct. This item counts toward the casual session.')
      : score === 0.5
        ? (language === 'zh' ? `非常接近，正確答案是 ${challenge.answer}。` : `Very close. The answer is ${challenge.answer}.`)
        : (language === 'zh' ? `正確答案是 ${challenge.answer}。${challenge.word.memory}` : `The answer is ${challenge.answer}. ${challenge.word.memory}`)

    setResponse(answerText)
    setFeedback({ score, text })
    setStats((current) => {
      const nextStreak = score === 1 ? current.streak + 1 : 0
      return {
        attempts: current.attempts + 1,
        correct: current.correct + (score === 1 ? 1 : 0),
        streak: nextStreak,
        bestStreak: Math.max(current.bestStreak, nextStreak),
      }
    })
    recordHistory(score)
  }

  const submitResponse = (event: FormEvent) => {
    event.preventDefault()
    if (!response.trim()) return
    gradeResponse(response)
  }

  const nextRandomChallenge = () => {
    const nextRecentIds = [challenge.word.id, ...recentWordIds.filter((id) => id !== challenge.word.id)].slice(0, 3)
    setRecentWordIds(nextRecentIds)
    setChallenge(buildChallenge(reviewPool, profile.listeningEnabled, nextRecentIds, challenge.mode, language))
    setResponse('')
    setFeedback(null)
  }

  const resetSession = () => {
    setRecentWordIds([])
    setStats({ attempts: 0, correct: 0, streak: 0, bestStreak: 0 })
    setChallenge(buildChallenge(reviewPool, profile.listeningEnabled, [], null, language))
    setResponse('')
    setFeedback(null)
  }

  const sessionAccuracy = stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0

  return (
    <div className="casual-practice-layout">
      <section className="casual-practice-card">
        <header className="casual-practice-head">
          <div>
            <p className="eyebrow">RANDOM REVIEW · ENDLESS</p>
            <h3>{language === 'zh' ? '休閒隨機練習' : 'Casual random practice'}</h3>
            <p>{language === 'zh'
              ? '沒有固定題數、沒有固定順序，每按下一題都會重新抽單字、題型與答案位置。'
              : 'No fixed length or order. Every next item reshuffles the word, format, and answer positions.'}</p>
          </div>
          <button type="button" onClick={resetSession}>{language === 'zh' ? '重新洗牌' : 'Reshuffle'}</button>
        </header>

        <div className="casual-session-stats">
          <div><strong>{stats.attempts}</strong><span>{language === 'zh' ? '本次題數' : 'Items'}</span></div>
          <div><strong>{sessionAccuracy}%</strong><span>{language === 'zh' ? '本次正確率' : 'Accuracy'}</span></div>
          <div><strong>{stats.streak}</strong><span>{language === 'zh' ? '目前連對' : 'Current streak'}</span></div>
          <div><strong>{stats.bestStreak}</strong><span>{language === 'zh' ? '最高連對' : 'Best streak'}</span></div>
        </div>

        <article className="casual-challenge" key={challenge.id}>
          <div className="casual-challenge-meta">
            <span>{modeLabel(challenge.mode, language)}</span>
            <span>{language === 'zh' ? `隨機複習池 ${reviewPool.length} 個單字` : `${reviewPool.length} words in review pool`}</span>
          </div>
          <h4>{challenge.prompt}</h4>
          {challenge.context ? <p className="casual-challenge-context">{challenge.context}</p> : null}

          {challenge.mode === 'listening' ? (
            <button className="listen-button" type="button" onClick={() => speakEnglish(challenge.word.word, profile.accent)}>
              🔊 {language === 'zh' ? '播放發音' : 'Play audio'}
            </button>
          ) : null}

          <form onSubmit={submitResponse}>
            {challenge.choices ? (
              <div className="casual-choice-grid">
                {challenge.choices.map((choice) => (
                  <button
                    className={response === choice ? 'active' : ''}
                    type="button"
                    key={choice}
                    disabled={Boolean(feedback)}
                    onClick={() => setResponse(choice)}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            ) : (
              <input
                autoFocus
                autoComplete="off"
                disabled={Boolean(feedback)}
                value={response}
                placeholder={challenge.mode === 'sentence'
                  ? (language === 'zh' ? '輸入完整英文句子' : 'Type a complete sentence')
                  : (language === 'zh' ? '輸入答案' : 'Type your answer')}
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
                <strong>{feedback.score === 1 ? '✓' : feedback.score === 0.5 ? '△' : '✕'}</strong>
                <p>{feedback.text}</p>
                <div>
                  <button type="button" onClick={() => onOpenWord(challenge.word.id)}>{language === 'zh' ? '查看單字卡' : 'Open word card'}</button>
                  <button className="primary-button" type="button" onClick={nextRandomChallenge}>{language === 'zh' ? '下一題（重新隨機）' : 'Next random item'}</button>
                </div>
              </div>
            )}
          </form>
        </article>
      </section>

      <aside className="casual-practice-info">
        <span>{isFallbackPool ? (language === 'zh' ? '目前使用完整單字庫' : 'Using the full word library') : (language === 'zh' ? '目前使用你的複習內容' : 'Using your review history')}</span>
        <h4>{language === 'zh' ? '隨機規則' : 'Random rules'}</h4>
        <p>{language === 'zh'
          ? '單字會優先來自已熟悉與待加強清單；沒有紀錄時才使用完整單字庫。最近三個單字不會立刻重複，題型也不會連續相同。'
          : 'Words come from learned and difficult lists first. The last three words and the previous format are avoided when possible.'}</p>
        <ul>
          <li>{language === 'zh' ? '意思、拼字、聽力與填空' : 'Meaning, spelling, listening, and cloze'}</li>
          <li>{language === 'zh' ? '同義詞、反義詞與常見搭配' : 'Synonyms, antonyms, and collocations'}</li>
          <li>{language === 'zh' ? '自由造句與隨機答案順序' : 'Free sentences and shuffled choices'}</li>
        </ul>
        <small>{language === 'zh'
          ? '休閒練習沒有每日完成壓力，但答題仍會更新整體正確率、連續學習天數與待加強單字。'
          : 'Casual practice has no daily quota, but it still updates accuracy, study streaks, and difficult words.'}</small>
      </aside>
    </div>
  )
}
