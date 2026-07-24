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
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!enabled) setExpanded(false)
  }, [enabled])

  if (!enabled) return null

  const closeLabel = language === 'zh' ? '收合音樂工作室' : 'Collapse music studio'

  return (
    <div className={`persistent-music-player${expanded ? ' expanded' : ' compact'}`}>
      {expanded ? (
        <button
          className="persistent-music-backdrop"
          type="button"
          aria-label={closeLabel}
          onClick={() => setExpanded(false)}
        />
      ) : null}
      <div className="persistent-music-surface">
        <MusicStudio
          language={language}
          userId={userId}
          onNotice={onNotice}
          mode={expanded ? 'full' : 'compact'}
          onExpand={() => setExpanded(true)}
          onCollapse={() => setExpanded(false)}
        />
      </div>
    </div>
  )
}
