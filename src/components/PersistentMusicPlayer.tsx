import { useEffect, useState } from 'react'
import { MusicStudio } from './MusicStudio'
import type { Language } from '../types'

type PersistentMusicPlayerProps = {
  language: Language
  userId: string
  enabled: boolean
  onNotice: (message: string) => void
}

export function PersistentMusicPlayer({
  language,
  userId,
  enabled,
  onNotice,
}: PersistentMusicPlayerProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [musicOpen, setMusicOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)

  useEffect(() => {
    if (!enabled) setMusicOpen(false)
  }, [enabled])

  const copy = language === 'zh'
    ? {
        tools: '開啟快速工具',
        closeTools: '收合快速工具',
        ai: 'AI 助手',
        music: '音樂播放器',
        closeMusic: '收合音樂工作室',
        closeAi: '關閉 AI 助手',
        aiTitle: 'Bubble AI',
        aiStatus: 'AI 助手入口已建立',
        aiDescription: '目前先完成頭像與入口；對話模型尚未連接。之後 AI 搜尋與助理功能會從這裡開啟，不會再另外占用工作區。',
      }
    : {
        tools: 'Open quick tools',
        closeTools: 'Close quick tools',
        ai: 'AI assistant',
        music: 'Music player',
        closeMusic: 'Collapse music studio',
        closeAi: 'Close AI assistant',
        aiTitle: 'Bubble AI',
        aiStatus: 'AI assistant entry is ready',
        aiDescription: 'The avatar and entry point are ready. The conversation model is not connected yet; future AI search and assistant features will open here without taking over the workspace.',
      }

  return (
    <>
      {enabled ? (
        <div className={musicOpen ? 'persistent-music-player expanded' : 'persistent-music-runtime'}>
          {musicOpen ? (
            <button
              className="persistent-music-backdrop"
              type="button"
              aria-label={copy.closeMusic}
              onClick={() => setMusicOpen(false)}
            />
          ) : null}
          <div className={musicOpen ? 'persistent-music-surface' : 'persistent-music-runtime-surface'}>
            <MusicStudio
              language={language}
              userId={userId}
              onNotice={onNotice}
              mode={musicOpen ? 'full' : 'headless'}
              onCollapse={() => setMusicOpen(false)}
            />
          </div>
        </div>
      ) : null}

      {aiOpen ? (
        <section className="ai-assistant-card" aria-label={copy.aiTitle}>
          <button className="ai-assistant-close" type="button" aria-label={copy.closeAi} onClick={() => setAiOpen(false)}>×</button>
          <div className="ai-assistant-avatar" aria-hidden="true">
            <span className="ai-face-eye" />
            <span className="ai-face-eye" />
            <span className="ai-face-mouth" />
          </div>
          <p className="eyebrow">PERSONAL ASSISTANT</p>
          <h3>{copy.aiTitle}</h3>
          <strong>{copy.aiStatus}</strong>
          <p>{copy.aiDescription}</p>
        </section>
      ) : null}

      <div className={`assistant-tool-hub${menuOpen ? ' open' : ''}`}>
        <div className="assistant-tool-menu" aria-hidden={!menuOpen}>
          <button
            className={`assistant-tool-option ai-option${aiOpen ? ' active' : ''}`}
            type="button"
            title={copy.ai}
            aria-label={copy.ai}
            tabIndex={menuOpen ? 0 : -1}
            onClick={() => {
              setMusicOpen(false)
              setAiOpen((current) => !current)
              setMenuOpen(false)
            }}
          >
            <span className="mini-ai-face" aria-hidden="true"><i /><i /><b /></span>
            <small>{copy.ai}</small>
          </button>

          {enabled ? (
            <button
              className={`assistant-tool-option music-option${musicOpen ? ' active' : ''}`}
              type="button"
              title={copy.music}
              aria-label={copy.music}
              tabIndex={menuOpen ? 0 : -1}
              onClick={() => {
                setAiOpen(false)
                setMusicOpen(true)
                setMenuOpen(false)
              }}
            >
              <span aria-hidden="true">♫</span>
              <small>{copy.music}</small>
            </button>
          ) : null}
        </div>

        <button
          className="assistant-tool-main"
          type="button"
          aria-label={menuOpen ? copy.closeTools : copy.tools}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
        >
          <span className="tool-main-grid" aria-hidden="true"><i /><i /><i /><i /></span>
        </button>
      </div>
    </>
  )
}
