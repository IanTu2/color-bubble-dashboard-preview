import { useState } from 'react'
import type { Language } from '../types'
import { EnglishBilingualCardLibrary } from './EnglishBilingualCardLibrary'
import { EnglishContextClozeHubV2 } from './EnglishContextClozeHubV2'
import { EnglishContinuousContextPractice } from './EnglishContinuousContextPractice'
import { EnglishJourneyHub } from './EnglishJourneyHub'
import { EnglishLearningStudio as EnglishLearningStudioV4 } from './EnglishLearningStudioV4'
import { readEnglishStored, englishStorageKey, DEFAULT_PROFILE } from '../english-learning'
import type { LearnerProfile } from '../english-learning'

type Props = {
  language: Language
  userId: string
}

type EnglishMode = 'context' | 'continuous' | 'journey' | 'studio'

export function EnglishLearningStudio({ language, userId }: Props) {
  const [mode, setMode] = useState<EnglishMode>('context')
  const [studioInstance, setStudioInstance] = useState(0)
  const profile = readEnglishStored<LearnerProfile>(englishStorageKey(userId, 'profile'), DEFAULT_PROFILE)

  const restartAssessment = () => {
    window.localStorage.removeItem(englishStorageKey(userId, 'assessment-result'))
    setStudioInstance((value) => value + 1)
    setMode('studio')
  }

  return (
    <div className="english-studio-v5-shell">
      {mode === 'context' ? (
        <div className="english-context-mode-shell">
          <EnglishContextClozeHubV2
            language={language}
            userId={userId}
            onOpenJourney={() => setMode('journey')}
            onOpenStudio={() => setMode('studio')}
          />
          <div className="english-context-quick-actions" aria-label={language === 'zh' ? '英文學習快速操作' : 'English learning quick actions'}>
            <button type="button" onClick={() => setMode('continuous')}>
              ∞ {language === 'zh' ? '繼續無限練習' : 'Continuous practice'}
            </button>
            <button type="button" onClick={restartAssessment}>
              🎯 {language === 'zh' ? '重新測驗實力' : 'Retake placement'}
            </button>
          </div>
        </div>
      ) : null}

      {mode === 'continuous' ? (
        <EnglishContinuousContextPractice
          language={language}
          userId={userId}
          onBack={() => setMode('context')}
          onRetest={restartAssessment}
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
            <button type="button" onClick={restartAssessment}>
              🎯 {language === 'zh' ? '重新測驗實力' : 'Retake placement'}
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
            <button type="button" onClick={restartAssessment}>
              🎯 {language === 'zh' ? '重新測驗實力' : 'Retake placement'}
            </button>
            <span>{language === 'zh' ? '程度測驗、完整單字庫與原有深度課程' : 'Placement, full lexicon, and the original deep-learning studio'}</span>
          </div>
          <EnglishLearningStudioV4 key={`studio-${studioInstance}`} language={language} userId={userId} />
        </div>
      ) : null}

      <EnglishBilingualCardLibrary language={language} profile={profile} />
    </div>
  )
}
