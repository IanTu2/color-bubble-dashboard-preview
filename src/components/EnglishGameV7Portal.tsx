import { useEffect, useState } from 'react'
import {
  DEFAULT_HISTORY,
  DEFAULT_PROFILE,
  englishStorageKey,
  readEnglishStored,
  type LearnerProfile,
  type LearningHistory,
} from '../english-learning'
import type { Language } from '../types'
import { EnglishCasualPracticeV7 } from './EnglishCasualPracticeV7'
import '../english-game-v7-portal.css'

type Props = {
  language: Language
  userId: string
  onOpenStudio: () => void
}

export function EnglishGameV7Portal({ language, userId, onOpenStudio }: Props) {
  const profileKey = englishStorageKey(userId, 'profile')
  const historyKey = englishStorageKey(userId, 'history')
  const [profile] = useState<LearnerProfile>(() => readEnglishStored(profileKey, DEFAULT_PROFILE))
  const [history, setHistory] = useState<LearningHistory>(() => readEnglishStored(historyKey, DEFAULT_HISTORY))
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null)

  useEffect(() => {
    window.localStorage.setItem(historyKey, JSON.stringify(history))
  }, [history, historyKey])

  if (!profile.level) {
    return (
      <section className="english-game-v7-gate" data-english-game-v7="placement-gate">
        <div aria-hidden="true">🎯</div>
        <p>BUBBLE ENGLISH · PLACEMENT FIRST</p>
        <h2>{language === 'zh' ? '先知道你的程度，遊戲才會真的適合你' : 'Set your level before the game adapts to you'}</h2>
        <p>{language === 'zh'
          ? '英文遊戲會依 CEFR 程度、錯題與到期複習出題。先完成既有的五能力程度測驗，再回來玩短回合。'
          : 'The game uses your CEFR level, mistakes, and due reviews. Complete the existing five-skill placement first, then return for short adaptive rounds.'}</p>
        <button type="button" onClick={onOpenStudio}>{language === 'zh' ? '前往程度測驗' : 'Open placement test'}</button>
      </section>
    )
  }

  return (
    <div className="english-game-v7-portal">
      <EnglishCasualPracticeV7
        language={language}
        userId={userId}
        profile={profile}
        history={history}
        setHistory={setHistory}
        onOpenWord={setSelectedWordId}
      />
      {selectedWordId ? (
        <div className="english-game-v7-word-return" role="status">
          <span>{language === 'zh' ? `已記下單字「${selectedWordId}」；完整單字卡可在「雙語卡片／完整題庫」查看。` : `Saved “${selectedWordId}”. Open Bilingual cards or the full bank for the detailed word card.`}</span>
          <button type="button" onClick={() => setSelectedWordId(null)} aria-label={language === 'zh' ? '關閉提示' : 'Dismiss'}>×</button>
        </div>
      ) : null}
    </div>
  )
}
