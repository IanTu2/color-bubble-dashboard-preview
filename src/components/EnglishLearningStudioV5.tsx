import { useState } from 'react'
import type { Language } from '../types'
import { EnglishBilingualCardLibrary } from './EnglishBilingualCardLibrary'
import { EnglishJourneyHub } from './EnglishJourneyHub'
import { EnglishLearningStudio as EnglishLearningStudioV4 } from './EnglishLearningStudioV4'
import { readEnglishStored, englishStorageKey, DEFAULT_PROFILE } from '../english-learning'
import type { LearnerProfile } from '../english-learning'

type Props = {
  language: Language
  userId: string
}

type EnglishMode = 'journey' | 'studio'

export function EnglishLearningStudio({ language, userId }: Props) {
  const [mode, setMode] = useState<EnglishMode>('journey')
  const profile = readEnglishStored<LearnerProfile>(englishStorageKey(userId, 'profile'), DEFAULT_PROFILE)

  return (
    <div className="english-studio-v5-shell">
      {mode === 'journey' ? (
        <EnglishJourneyHub language={language} userId={userId} onOpenStudio={() => setMode('studio')} />
      ) : (
        <div className="journey-legacy-studio-shell">
          <div className="journey-legacy-return">
            <button type="button" onClick={() => setMode('journey')}>
              ← {language === 'zh' ? '返回英文學習旅程' : 'Back to English journey'}
            </button>
            <span>{language === 'zh' ? '能力測驗、完整單字庫與原有深度課程' : 'Placement, full lexicon, and the original deep-learning studio'}</span>
          </div>
          <EnglishLearningStudioV4 language={language} userId={userId} />
        </div>
      )}
      <EnglishBilingualCardLibrary language={language} profile={profile} />
    </div>
  )
}
