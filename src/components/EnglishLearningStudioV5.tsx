import { useState } from 'react'
import type { Language } from '../types'
import { EnglishBilingualCardLibrary } from './EnglishBilingualCardLibrary'
import { EnglishContextClozeHub } from './EnglishContextClozeHub'
import { EnglishJourneyHub } from './EnglishJourneyHub'
import { EnglishLearningStudio as EnglishLearningStudioV4 } from './EnglishLearningStudioV4'
import { readEnglishStored, englishStorageKey, DEFAULT_PROFILE } from '../english-learning'
import type { LearnerProfile } from '../english-learning'

type Props = {
  language: Language
  userId: string
}

type EnglishMode = 'context' | 'journey' | 'studio'

export function EnglishLearningStudio({ language, userId }: Props) {
  const [mode, setMode] = useState<EnglishMode>('context')
  const profile = readEnglishStored<LearnerProfile>(englishStorageKey(userId, 'profile'), DEFAULT_PROFILE)

  return (
    <div className="english-studio-v5-shell">
      {mode === 'context' ? (
        <EnglishContextClozeHub
          language={language}
          userId={userId}
          onOpenJourney={() => setMode('journey')}
          onOpenStudio={() => setMode('studio')}
        />
      ) : null}

      {mode === 'journey' ? (
        <div className="context-mode-shell">
          <div className="context-mode-bar">
            <button type="button" onClick={() => setMode('context')}>
              ← {language === 'zh' ? '返回情境挖空課' : 'Back to context cloze'}
            </button>
            <button type="button" onClick={() => setMode('studio')}>
              {language === 'zh' ? '程度測驗與完整題庫' : 'Placement and full bank'}
            </button>
            <span>{language === 'zh' ? '完整旅程保留課程路線、口說、聯盟、收藏與角色功能。' : 'The full journey keeps paths, roleplay, league, collections, and avatars.'}</span>
          </div>
          <EnglishJourneyHub language={language} userId={userId} onOpenStudio={() => setMode('studio')} />
        </div>
      ) : null}

      {mode === 'studio' ? (
        <div className="journey-legacy-studio-shell">
          <div className="journey-legacy-return">
            <button type="button" onClick={() => setMode('context')}>
              ← {language === 'zh' ? '返回情境挖空課' : 'Back to context cloze'}
            </button>
            <button type="button" onClick={() => setMode('journey')}>
              {language === 'zh' ? '開啟完整學習旅程' : 'Open full learning journey'}
            </button>
            <span>{language === 'zh' ? '程度測驗、完整單字庫與原有深度課程' : 'Placement, full lexicon, and the original deep-learning studio'}</span>
          </div>
          <EnglishLearningStudioV4 language={language} userId={userId} />
        </div>
      ) : null}

      <EnglishBilingualCardLibrary language={language} profile={profile} />
    </div>
  )
}
