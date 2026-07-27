import { useMemo, useState } from 'react'
import type { Dispatch, FormEvent, SetStateAction } from 'react'
import { EXPANDED_ENGLISH_WORDS } from '../english-expanded-data'
import type { ExpandedEnglishWord } from '../english-expanded-data'
import { smartGradeEnglishAnswer, smartGradeLabel } from '../english-smart-grading'
import { englishTodayKey, normalizeEnglishAnswer, speakEnglish } from '../english-learning'
import type { LearnerProfile, LearningHistory } from '../english-learning'
import type { Language } from '../types'

type CasualMode = 'meaning' | 'spelling' | 'listening' | 'cloze' | 'synonym' | 'antonym' | 'collocation' | 'sentence'

type CasualChallenge = {
  id: string
  word: ExpandedEnglishWord
  mode: CasualMode
  prompt: string
  answer: string
  acceptedAnswers: string[]
  choices?: string[]
  context?: string
  hint?: string
}

type SessionStats = {
  attempts: number
  correctPoints: number
  streak: number
  bestStreak: number
}

type EnglishCasualPracticeV2Props = {
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
  pool: ExpandedEnglishWord[],
  listeningEnabled: boolean,
  recentWordIds: string[],
  previousMode: CasualMode | null,
  language: Language,
): CasualChallenge {
  const availableWords = pool.length > 3 ? pool.filter((word) => !recentWordIds.includes(word.id)) : pool
  const word = pickRandom(availableWords.length > 0 ? availableWords : pool)
  const allowedModes = ALL_MODES.filter((mode) => listeningEnabled || mode !== 'listening')
    .filter((mode) => mode !== 'antonym' || word.antonyms.length > 0)
    .filter((mode) => mode !== 'synonym' || word.synonyms.length > 0)
  const nonRepeatingModes = allowedModes.length > 1 ? allowedModes.filter((mode) => mode !== previousMode) : allowedModes
  const mode = pickRandom(nonRepeatingModes)
  const otherWords = EXPANDED_ENGLISH_WORDS.filter((item) => item.id !== word.id)
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}-${word.id}-${mode}`

  if (mode === 'meaning') {
    return {
      id,
      word,
      mode,
      prompt: language === 'zh' ? `「${word.word}」最接近哪個意思？` : `Which meaning best matches “${word.word}”?`,
      answer: word.meaning,
      acceptedAnswers: [],
      choices: uniqueChoices(word.meaning, otherWords.map((item) => item.meaning)),
      context: `${word.partOfSpeech} · Level ${word.level}`,
    }
  }

  if (mode === 'spelling') {
    return {
      id,
      word,
      mode,
      prompt: language === 'zh'
        ? `請根據句子輸入本課目標字：${word.example.replace(new RegExp(word.word, 'i'), '________')}`
        : `Type the lesson target: ${word.example.replace(new RegExp(word.word, 'i'), '________')}`,
      answer: word.word,
      acceptedAnswers: word.acceptedTranslations,
      context: language === 'zh' ? `中文：${word.exampleZh}` : word.definition,
      hint: `${word.meaning} · ${word.targetHint} · ${word.partOfSpeech}`,
    }
  }

  if (mode === 'listening') {
    return {
      id,
      word,
      mode,
      prompt: language === 'zh' ? '播放發音後，輸入你聽到的單字。' : 'Play the audio and type the word you hear.',
      answer: word.word,
      acceptedAnswers: [],
      context: language === 'zh' ? '聽力題只接受實際播放的單字。' : 'Dictation requires the exact spoken word.',
      hint: `${word.targetHint} · ${word.partOfSpeech}`,
    }
  }

  if (mode === 'cloze') {
    return {
      id,
      word,
      mode,
      prompt: word.example.replace(new RegExp(word.word, 'i'), '________'),
      answer: word.word,
      acceptedAnswers: [],
      context: language === 'zh' ? `中文：${word.exampleZh}` : word.definition,
      hint: `${word.targetHint} · ${word.partOfSpeech}`,
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
      acceptedAnswers: [],
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
      acceptedAnswers: [],
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
      acceptedAnswers: [],
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
    acceptedAnswers: [],
    context: `${word.meaning} · ${word.memory}`,
  }
}

function modeLabel(mode: CasualMode, language: Language) {
  const labels = language === 'zh'
    ? { meaning: '意思辨識', spelling: '情境翻譯', listening: '聽力拼字', cloze: '句子填空', synonym: '同義詞', antonym: '反義詞', collocation: '常見搭配', sentence: '自由造句' }
    : { meaning: 'Meaning', spelling: 'Context translation', listening: 'Dictation', cloze: 'Cloze', synonym: 'Synonym', antonym: 'Antonym', collocation: 'Collocation', sentence: 'Sentence' }
  return labels[mode]
}

export function EnglishCasualPracticeV2({ language, profile, history, setHistory, onOpenWord }: EnglishCasualPracticeV2Props) {
  const reviewIds = useMemo(
    () => Array.from(new Set([...history.learnedWordIds, ...history.difficultWordIds])),
    [history.difficultWordIds, history.learnedWordIds],
  )
  const reviewPool = useMemo(() => {
    const matched = EXPANDED_ENGLISH_WORDS.filter((word) => reviewIds.includes(word.id))
    return matched.length >= 4 ? matched : EXPANDED_ENGLISH_WORDS
  }, [reviewIds])
  const isFallbackPool = reviewIds.length < 4

  const [recentWordIds, setRecentWordIds] = useState<string[]>([])
  const [challenge, setChallenge] = useState<CasualChallenge>(() => buildChallenge(reviewPool, profile.listeningEnabled, [], null, language))
  const [response, setResponse] = useState('')
  const [feedback, setFeedback] = useState<{ score: number; text: string } | null>(null)
  const [stats, setStats] = useState<SessionStats>({ attempts: 0, correctPoints: 0, streak: 0, bestStreak: 0 })

  const recordHistory = (score: number) => {
    setHistory((current) => {
      const today = englishTodayKey()
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
      const successful = score >= 0.75
      return {
        ...current,
        attempts: current.attempts + 1,
        correct: current.correct + (successful ? 1 : 0),
        learnedWordIds: score === 1 ? Array.from(new Set([...current.learnedWordIds, challenge.word.id])) : current.learnedWordIds,
        difficultWordIds: score < 0.75
          ? Array.from(new Set([...current.difficultWordIds, challenge.word.id]))
          : current.difficultWordIds.filter((id) => id !== challenge.word.id),
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
        ? normalizeEnglishAnswer(answerText).includes(challenge.word.word.toLowerCase()) && answerText.trim().split(/\s+/).length >= 4
          ? { score: 1, kind: 'exact' as const, matchedAnswer: challenge.word.word }
          : { score: 0, kind: 'wrong' as const, matchedAnswer: null }
        : smartGradeEnglishAnswer(answerText, challenge.answer, challenge.acceptedAnswers)

    const text = [
      smartGradeLabel(grade, challenge.answer, language),
      grade.kind === 'alternative'
        ? (language === 'zh' ? `你的答案「${answerText}」不會被當成完全錯誤。` : `Your answer “${answerText}” is not treated as fully wrong.`)
        : '',
      challenge.word.memory,
    ].filter(Boolean).join(' ')

    setResponse(answerText)
    setFeedback({ score: grade.score, text })
    setStats((current) => {
      const exact = grade.score === 1
      const nextStreak = exact ? current.streak + 1 : 0
      return {
        attempts: current.attempts + 1,
        correctPoints: current.correctPoints + grade.score,
        streak: nextStreak,
        bestStreak: Math.max(current.bestStreak, nextStreak),
      }
    })
    recordHistory(grade.score)
  }

  const submitResponse = (event: FormEvent) => {
    event.preventDefault()
    if (!response.trim()) return
    gradeResponse(response)
  }

  const nextRandomChallenge = () => {
    const nextRecentIds = [challenge.word.id, ...recentWordIds.filter((id) => id !== challenge.word.id)].slice(0, 4)
    setRecentWordIds(nextRecentIds)
    setChallenge(buildChallenge(reviewPool, profile.listeningEnabled, nextRecentIds, challenge.mode, language))
    setResponse('')
    setFeedback(null)
  }

  const resetSession = () => {
    setRecentWordIds([])
    setStats({ attempts: 0, correctPoints: 0, streak: 0, bestStreak: 0 })
    setChallenge(buildChallenge(reviewPool, profile.listeningEnabled, [], null, language))
    setResponse('')
    setFeedback(null)
  }

  const sessionAccuracy = stats.attempts > 0 ? Math.round((stats.correctPoints / stats.attempts) * 100) : 0

  return (
    <div className="casual-practice-layout">
      <section className="casual-practice-card">
        <header className="casual-practice-head">
          <div>
            <p className="eyebrow">RANDOM REVIEW · SMART ANSWERS</p>
            <h3>{language === 'zh' ? '休閒隨機練習' : 'Casual random practice'}</h3>
            <p>{language === 'zh'
              ? '翻譯題會顯示情境與首尾字母；合理同義詞會標成語意可接受，不再直接判錯。'
              : 'Translation items include context and letter hints. Reasonable alternatives receive semantic credit.'}</p>
          </div>
          <button type="button" onClick={resetSession}>{language === 'zh' ? '重新洗牌' : 'Reshuffle'}</button>
        </header>

        <div className="casual-session-stats">
          <div><strong>{stats.attempts}</strong><span>{language === 'zh' ? '本次題數' : 'Items'}</span></div>
          <div><strong>{sessionAccuracy}%</strong><span>{language === 'zh' ? '加權正確率' : 'Weighted accuracy'}</span></div>
          <div><strong>{stats.streak}</strong><span>{language === 'zh' ? '目前全對連擊' : 'Exact streak'}</span></div>
          <div><strong>{stats.bestStreak}</strong><span>{language === 'zh' ? '最高全對連擊' : 'Best streak'}</span></div>
        </div>

        <article className="casual-challenge" key={challenge.id}>
          <div className="casual-challenge-meta">
            <span>{modeLabel(challenge.mode, language)}</span>
            <span>{language === 'zh' ? `隨機複習池 ${reviewPool.length} 個單字` : `${reviewPool.length} words in review pool`}</span>
          </div>
          <h4>{challenge.prompt}</h4>
          {challenge.context ? <p className="casual-challenge-context">{challenge.context}</p> : null}
          {challenge.hint ? (
            <p className="casual-challenge-context" style={{ border: '1px solid rgba(88,226,210,.2)', borderRadius: 12, padding: '9px 12px' }}>
              {language === 'zh' ? '提示：' : 'Hint: '}{challenge.hint}
            </p>
          ) : null}

          {challenge.mode === 'listening' ? (
            <button className="listen-button" type="button" onClick={() => speakEnglish(challenge.word.word, profile.accent)}>
              🔊 {language === 'zh' ? '播放發音' : 'Play audio'}
            </button>
          ) : null}

          <form onSubmit={submitResponse}>
            {challenge.choices ? (
              <div className="casual-choice-grid">
                {challenge.choices.map((choice) => (
                  <button className={response === choice ? 'active' : ''} type="button" key={choice} disabled={Boolean(feedback)} onClick={() => setResponse(choice)}>
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
                  <button type="button" onClick={() => onOpenWord(challenge.word.id)}>{language === 'zh' ? '查看單字卡' : 'Open word card'}</button>
                  <button className="primary-button" type="button" onClick={nextRandomChallenge}>{language === 'zh' ? '下一題（重新隨機）' : 'Next random item'}</button>
                </div>
              </div>
            )}
          </form>
        </article>
      </section>

      <aside className="casual-practice-info">
        <span>{isFallbackPool ? (language === 'zh' ? '目前使用完整擴充單字庫' : 'Using the full expanded library') : (language === 'zh' ? '目前使用你的複習內容' : 'Using your review history')}</span>
        <h4>{language === 'zh' ? '智慧判題規則' : 'Smart grading'}</h4>
        <p>{language === 'zh'
          ? '目標字完全正確得滿分；合理同義詞得到語意分；差一個字母算接近。聽力題仍要求輸入實際播放的字。'
          : 'Exact targets receive full credit, reasonable alternatives semantic credit, and one-letter spelling errors partial credit.'}</p>
        <ul>
          <li>{language === 'zh' ? '情境句＋首尾字母提示' : 'Context plus first/last-letter hints'}</li>
          <li>{language === 'zh' ? '96 個 A1～C2 單字' : '96 words from A1 to C2'}</li>
          <li>{language === 'zh' ? '最近四個單字避免立即重複' : 'Avoids the last four words'}</li>
        </ul>
        <small>{language === 'zh' ? '休閒練習沒有每日完成壓力，但仍會更新整體學習紀錄。' : 'Casual practice has no daily quota but still updates learning history.'}</small>
      </aside>
    </div>
  )
}
