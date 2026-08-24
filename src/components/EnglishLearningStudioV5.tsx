import { useState } from 'react'
import type { Language } from '../types'
import { EnglishBilingualCardLibrary } from './EnglishBilingualCardLibrary'
import { EnglishContextClozeHubV2 } from './EnglishContextClozeHubV2'
import { EnglishContinuousContextPractice } from './EnglishContinuousContextPractice'
import { EnglishGameV7Portal } from './EnglishGameV7Portal'
import { EnglishJourneyHub } from './EnglishJourneyHub'
import { EnglishLearningStudio as EnglishLearningStudioV4 } from './EnglishLearningStudioV4'
import { readEnglishStored, englishStorageKey, DEFAULT_PROFILE } from '../english-learning'
import type { LearnerProfile } from '../english-learning'

type Props = {
  language: Language
  userId: string
}

type EnglishMode = 'game' | 'context' | 'continuous' | 'journey' | 'studio' | 'library'

export function EnglishLearningStudio({ language, userId }: Props) {
  const [mode, setMode] = useState<EnglishMode>('game')
  const [toolMenuOpen, setToolMenuOpen] = useState(false)
  const [studioInstance, setStudioInstance] = useState(0)
  const profile = readEnglishStored<LearnerProfile>(englishStorageKey(userId, 'profile'), DEFAULT_PROFILE)

  const copy = language === 'zh'
    ? {
        menu: '功能', close: '關閉功能選單', title: '英文練習功能', subtitle: '英文遊戲放在主畫面，其他工具需要時再打開。',
        game: '英文遊戲', gameHint: 'EPOP 風格短回合、到期複習、單字、文法、聽力與口說回想',
        context: '情境挖空', contextHint: '今日課程與智慧複習', continuous: '無限練習', continuousHint: '每 8 題一組持續練習',
        journey: '完整學習旅程', journeyHint: '路線、口說、收藏與角色', studio: '程度測驗與完整題庫', studioHint: '程度測驗、完整單字庫與深度課程',
        library: '雙語卡片', libraryHint: '需要查單字時再打開', retest: '重新測驗實力', retestHint: '清除上一次程度測驗結果並重新開始',
      }
    : {
        menu: 'Tools', close: 'Close tool menu', title: 'English practice tools', subtitle: 'Keep the English game on the main screen and open other tools only when needed.',
        game: 'English game', gameHint: 'EPOP-inspired short rounds, due review, vocabulary, grammar, listening, and speaking recall',
        context: 'Context cloze', contextHint: 'Today lesson and smart review', continuous: 'Continuous practice', continuousHint: 'Keep practicing in sets of eight',
        journey: 'Full learning journey', journeyHint: 'Paths, speaking, collections, and avatars', studio: 'Placement and full bank', studioHint: 'Placement, full lexicon, and deeper lessons',
        library: 'Bilingual cards', libraryHint: 'Open vocabulary cards only when needed', retest: 'Retake placement', retestHint: 'Clear the previous placement result and start again',
      }

  const openMode = (nextMode: EnglishMode) => {
    setMode(nextMode)
    setToolMenuOpen(false)
  }

  const restartAssessment = () => {
    window.localStorage.removeItem(englishStorageKey(userId, 'assessment-result'))
    setStudioInstance((value) => value + 1)
    setMode('studio')
    setToolMenuOpen(false)
  }

  const toolItems: Array<{ id: EnglishMode; icon: string; title: string; hint: string }> = [
    { id: 'game', icon: '✦', title: copy.game, hint: copy.gameHint },
    { id: 'context', icon: '✎', title: copy.context, hint: copy.contextHint },
    { id: 'continuous', icon: '∞', title: copy.continuous, hint: copy.continuousHint },
    { id: 'journey', icon: '⌁', title: copy.journey, hint: copy.journeyHint },
    { id: 'studio', icon: '◎', title: copy.studio, hint: copy.studioHint },
    { id: 'library', icon: 'A', title: copy.library, hint: copy.libraryHint },
  ]

  return (
    <div className="english-studio-v5-shell english-tool-shell">
      <button
        className={`english-tool-menu-trigger${toolMenuOpen ? ' active' : ''}`}
        type="button"
        aria-expanded={toolMenuOpen}
        aria-controls="english-tool-curtain"
        onClick={() => setToolMenuOpen((current) => !current)}
      >
        <span aria-hidden="true">☰</span>{copy.menu}
      </button>

      {toolMenuOpen ? (
        <button className="english-tool-curtain-backdrop" type="button" aria-label={copy.close} onClick={() => setToolMenuOpen(false)} />
      ) : null}

      <aside id="english-tool-curtain" className={`english-tool-curtain${toolMenuOpen ? ' open' : ''}`} aria-hidden={!toolMenuOpen}>
        <header className="english-tool-curtain-head">
          <div>
            <p>ENGLISH PRACTICE</p>
            <h2>{copy.title}</h2>
            <span>{copy.subtitle}</span>
          </div>
          <button type="button" aria-label={copy.close} onClick={() => setToolMenuOpen(false)}>×</button>
        </header>

        <nav className="english-tool-list" aria-label={copy.title}>
          {toolItems.map((item) => (
            <button className={mode === item.id ? 'active' : ''} type="button" key={item.id} onClick={() => openMode(item.id)}>
              <span className="english-tool-icon">{item.icon}</span>
              <span><strong>{item.title}</strong><small>{item.hint}</small></span>
              <i aria-hidden="true">›</i>
            </button>
          ))}
        </nav>

        <button className="english-retest-tool" type="button" onClick={restartAssessment}>
          <span>🎯</span>
          <span><strong>{copy.retest}</strong><small>{copy.retestHint}</small></span>
        </button>
      </aside>

      {mode === 'game' ? (
        <EnglishGameV7Portal language={language} userId={userId} onOpenStudio={() => openMode('studio')} />
      ) : null}

      {mode === 'context' ? (
        <EnglishContextClozeHubV2
          language={language}
          userId={userId}
          onOpenJourney={() => openMode('journey')}
          onOpenStudio={() => openMode('studio')}
        />
      ) : null}

      {mode === 'continuous' ? (
        <EnglishContinuousContextPractice
          language={language}
          userId={userId}
          onBack={() => openMode('context')}
          onRetest={restartAssessment}
        />
      ) : null}

      {mode === 'journey' ? (
        <EnglishJourneyHub language={language} userId={userId} onOpenStudio={() => openMode('studio')} />
      ) : null}

      {mode === 'studio' ? (
        <EnglishLearningStudioV4 key={`studio-${studioInstance}`} language={language} userId={userId} />
      ) : null}

      {mode === 'library' ? (
        <div className="english-library-only-shell">
          <EnglishBilingualCardLibrary language={language} profile={profile} />
        </div>
      ) : null}
    </div>
  )
}
