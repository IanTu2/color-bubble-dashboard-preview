import { useCallback, useEffect, useRef, useState } from 'react'
import { MusicWindow } from './MusicWindow'
import { NotesApp } from './NotesApp'
import { SearchApp } from './SearchApp'
import { WindowFrame, clampWindowGeometry, type WindowGeometry } from './WindowFrame'
import type { Language } from '../types'

export type DesktopAppKind = 'notes' | 'search' | 'music'

export type DesktopRequest = {
  id: number
  kind: DesktopAppKind
}

type DesktopWorkspaceProps = {
  language: Language
  userId: string
  request: DesktopRequest | null
  onNotice: (message: string) => void
}

type WindowApp = Exclude<DesktopAppKind, 'music'>

type ManagedWindow = {
  id: string
  app: WindowApp
  sequence: number
  geometry: WindowGeometry
  minimized: boolean
  maximized: boolean
  zIndex: number
}

type MusicState = {
  open: boolean
  minimized: boolean
  geometry: WindowGeometry
  zIndex: number
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function appGeometry(app: WindowApp, offset: number): WindowGeometry {
  const preferredWidth = app === 'search' ? 780 : 760
  const preferredHeight = app === 'search' ? 610 : 560
  const width = Math.min(preferredWidth, Math.max(520, window.innerWidth - 360))
  const height = Math.min(preferredHeight, Math.max(380, window.innerHeight - 150))
  return clampWindowGeometry({
    x: 58 + (offset % 7) * 34,
    y: 86 + (offset % 6) * 28,
    width,
    height,
  })
}

function musicGeometry(): WindowGeometry {
  return clampWindowGeometry({
    x: Math.max(28, window.innerWidth - 940),
    y: 82,
    width: Math.min(900, Math.max(620, window.innerWidth - 370)),
    height: Math.min(650, Math.max(440, window.innerHeight - 170)),
  })
}

function appIcon(app: DesktopAppKind) {
  if (app === 'notes') return '✎'
  if (app === 'search') return '⌕'
  return '♫'
}

export function DesktopWorkspace({ language, userId, request, onNotice }: DesktopWorkspaceProps) {
  const [windows, setWindows] = useState<ManagedWindow[]>([])
  const [music, setMusic] = useState<MusicState>(() => ({
    open: false,
    minimized: false,
    geometry: musicGeometry(),
    zIndex: 50,
  }))
  const zIndexRef = useRef(60)
  const sequenceRef = useRef({ notes: 0, search: 0 })
  const lastRequestRef = useRef<number | null>(null)

  const nextZIndex = () => {
    zIndexRef.current += 1
    return zIndexRef.current
  }

  const focusWindow = useCallback((id: string) => {
    const zIndex = nextZIndex()
    setWindows((current) => current.map((item) => item.id === id ? { ...item, zIndex } : item))
  }, [])

  const focusMusic = useCallback(() => {
    const zIndex = nextZIndex()
    setMusic((current) => ({ ...current, zIndex }))
  }, [])

  const openApp = useCallback((kind: DesktopAppKind) => {
    if (kind === 'music') {
      const zIndex = nextZIndex()
      setMusic((current) => ({ ...current, open: true, minimized: false, zIndex }))
      return
    }

    if (kind === 'notes') {
      const existing = windows.find((item) => item.app === 'notes')
      if (existing) {
        const zIndex = nextZIndex()
        setWindows((current) => current.map((item) => item.id === existing.id
          ? { ...item, minimized: false, zIndex }
          : item))
        return
      }
    }

    sequenceRef.current[kind] += 1
    const sequence = sequenceRef.current[kind]
    const zIndex = nextZIndex()
    setWindows((current) => [
      ...current,
      {
        id: createId(),
        app: kind,
        sequence,
        geometry: appGeometry(kind, current.length),
        minimized: false,
        maximized: false,
        zIndex,
      },
    ])
  }, [windows])

  useEffect(() => {
    if (!request || request.id === lastRequestRef.current) return
    lastRequestRef.current = request.id
    openApp(request.kind)
  }, [openApp, request])

  const copy = language === 'zh'
    ? {
        launch: '開啟應用程式',
        running: '正在執行',
        notes: '記事本',
        search: '搜尋',
        music: '音樂',
        newSearch: '新增搜尋視窗',
      }
    : {
        launch: 'Open applications',
        running: 'Running applications',
        notes: 'Notes',
        search: 'Search',
        music: 'Music',
        newSearch: 'New search window',
      }

  const windowTitle = (item: ManagedWindow) => {
    if (item.app === 'notes') return copy.notes
    return `${copy.search} ${item.sequence}`
  }

  const updateWindow = (id: string, changes: Partial<ManagedWindow>) => {
    setWindows((current) => current.map((item) => item.id === id ? { ...item, ...changes } : item))
  }

  const toggleTaskWindow = (item: ManagedWindow) => {
    const highestZ = Math.max(music.open ? music.zIndex : 0, ...windows.map((windowItem) => windowItem.zIndex))
    if (!item.minimized && item.zIndex === highestZ) {
      updateWindow(item.id, { minimized: true })
      return
    }
    updateWindow(item.id, { minimized: false, zIndex: nextZIndex() })
  }

  const toggleMusicTask = () => {
    const highestZ = Math.max(music.zIndex, ...windows.map((item) => item.zIndex))
    if (!music.minimized && music.zIndex === highestZ) {
      setMusic((current) => ({ ...current, minimized: true }))
      return
    }
    setMusic((current) => ({ ...current, minimized: false, zIndex: nextZIndex() }))
  }

  return (
    <>
      {windows.map((item) => item.minimized ? null : (
        <WindowFrame
          key={item.id}
          title={windowTitle(item)}
          icon={appIcon(item.app)}
          geometry={item.geometry}
          maximized={item.maximized}
          zIndex={item.zIndex}
          onFocus={() => focusWindow(item.id)}
          onMinimize={() => updateWindow(item.id, { minimized: true })}
          onToggleMaximize={() => updateWindow(item.id, {
            maximized: !item.maximized,
            minimized: false,
            zIndex: nextZIndex(),
          })}
          onClose={() => setWindows((current) => current.filter((windowItem) => windowItem.id !== item.id))}
          onGeometryChange={(geometry) => updateWindow(item.id, { geometry })}
        >
          {item.app === 'notes'
            ? <NotesApp language={language} userId={userId} />
            : <SearchApp language={language} userId={userId} instanceId={item.id} />}
        </WindowFrame>
      ))}

      <MusicWindow
        language={language}
        userId={userId}
        open={music.open}
        minimized={music.minimized}
        geometry={music.geometry}
        zIndex={music.zIndex}
        onFocus={focusMusic}
        onMinimize={() => setMusic((current) => ({ ...current, minimized: true }))}
        onClose={() => setMusic((current) => ({ ...current, open: false, minimized: false }))}
        onGeometryChange={(geometry) => setMusic((current) => ({ ...current, geometry }))}
        onNotice={onNotice}
      />

      <nav className="desktop-dock" aria-label={copy.launch}>
        <div className="desktop-dock-launchers">
          <button type="button" title={copy.notes} onClick={() => openApp('notes')}>
            <span>✎</span><small>{copy.notes}</small>
          </button>
          <button type="button" title={copy.newSearch} onClick={() => openApp('search')}>
            <span>⌕＋</span><small>{copy.search}</small>
          </button>
          <button type="button" title={copy.music} onClick={() => openApp('music')}>
            <span>♫</span><small>{copy.music}</small>
          </button>
        </div>

        {(windows.length > 0 || music.open) ? <span className="desktop-dock-divider" aria-hidden="true" /> : null}

        <div className="desktop-running-apps" aria-label={copy.running}>
          {windows.map((item) => (
            <button
              className={`${item.minimized ? 'minimized ' : ''}${item.zIndex === Math.max(...windows.map((windowItem) => windowItem.zIndex), music.open ? music.zIndex : 0) ? 'active' : ''}`.trim()}
              type="button"
              key={item.id}
              title={windowTitle(item)}
              onClick={() => toggleTaskWindow(item)}
            >
              <span>{appIcon(item.app)}</span>
              <small>{windowTitle(item)}</small>
            </button>
          ))}
          {music.open ? (
            <button
              className={`${music.minimized ? 'minimized ' : ''}${music.zIndex === Math.max(...windows.map((item) => item.zIndex), music.zIndex) ? 'active' : ''}`.trim()}
              type="button"
              title={copy.music}
              onClick={toggleMusicTask}
            >
              <span>♫</span><small>{copy.music}</small>
            </button>
          ) : null}
        </div>
      </nav>
    </>
  )
}
