import type { Language } from '../types'
import { EnglishBilingualCardLibrary } from './EnglishBilingualCardLibrary'
import { EnglishLearningStudio as EnglishLearningStudioV4 } from './EnglishLearningStudioV4'
import { readEnglishStored, englishStorageKey, DEFAULT_PROFILE } from '../english-learning'
import type { LearnerProfile } from '../english-learning'

type Props = {
  language: Language
  userId: string
}

export function EnglishLearningStudio({ language, userId }: Props) {
  const profile = readEnglishStored<LearnerProfile>(englishStorageKey(userId, 'profile'), DEFAULT_PROFILE)

  return (
    <div className="english-studio-v5-shell">
      <EnglishLearningStudioV4 language={language} userId={userId} />
      <EnglishBilingualCardLibrary language={language} profile={profile} />
    </div>
  )
}
