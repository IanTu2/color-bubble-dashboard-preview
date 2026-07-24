import { MusicStudio } from './MusicStudio'
import { WindowFrame, type WindowGeometry } from './WindowFrame'
import type { Language } from '../types'

type MusicWindowProps = {
  language: Language
  userId: string
  open: boolean
  minimized: boolean
  geometry: WindowGeometry
  zIndex: number
  onFocus: () => void
  onMinimize: () => void
  onClose: () => void
  onGeometryChange: (geometry: WindowGeometry) => void
  onNotice: (message: string) => void
}

export function MusicWindow({
  language,
  userId,
  open,
  minimized,
  geometry,
  zIndex,
  onFocus,
  onMinimize,
  onClose,
  onGeometryChange,
  onNotice,
}: MusicWindowProps) {
  if (!open) return null

  const title = language === 'zh' ? '音樂播放器' : 'Music player'

  return (
    <div className={minimized ? 'music-window-mounted is-minimized' : 'music-window-mounted'}>
      <WindowFrame
        title={title}
        icon="♫"
        geometry={geometry}
        maximized={false}
        zIndex={zIndex}
        hideMaximize
        onFocus={onFocus}
        onMinimize={onMinimize}
        onToggleMaximize={() => undefined}
        onClose={onClose}
        onGeometryChange={onGeometryChange}
      >
        <MusicStudio language={language} userId={userId} onNotice={onNotice} />
      </WindowFrame>
    </div>
  )
}
