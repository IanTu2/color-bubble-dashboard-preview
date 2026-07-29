import { useCallback, useEffect, useRef, useState } from 'react'
import { EnglishLearningStudio } from './EnglishLearningStudioV3'
import { NotesApp } from './NotesApp'
import { SearchApp } from './SearchApp'
import { WindowFrame, clampWindowGeometry, type WindowGeometry } from './WindowFrame'
import type { Language } from '../types'

export type DesktopAppKind = 'notes' | 'search' | 'english'

export type DesktopRequest = {
  id: number
  kind: DesktopAppKind
}

type DesktopWorkspaceProps = {
  language: Language
  userId: string
  request: DesktopRequest | null
  rememberWindows: boolean
}

type ManagedWindow = {
  id: string
  app: DesktopAppKind
  sequence: number
  geometry: WindowGeometry
  minimized: boolean
  maximized: boolean
  zIndex: number
}

type StoredWindow = Pick<ManagedWindow, 'id' | 'app' | 'sequence' | 'geometry' | 'minimized'>

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function storageKey(userId: string) {
  return `bubble-space-v2-desktop-windows-${userId}`
}

function appGeometry(app: DesktopAppKind, offset: number): WindowGeometry {
  const preferredWidth = app === 'english' ? 1180 : app === 'search' ? 780 : 760
  const preferredHeight = app === 'english' ? 820 : app === 'search' ? 610 : 560
  const width = Math.min(preferredWidth, Math.max(520, window.innerWidth - (app === 'english' ? 32 : 360)))
  const height = app === 'english'
    ? Math.min(preferredHeight, Math.max(420, window.innerHeight - 94))
    : Math.min(preferredHeight, Math.max(380, window.innerHeight - 150))
  return clampWindowGeometry({
    x: app === 'english' ? Math.max(8, Math.round((window.innerWidth - width) / 2)) : 58 + (offset % 7) * 34,
    y: app === 'english' ? 8 : 86 + (offset % 6) * 28,
    width,
    height,
  })
}

function readStoredWindows(userId: string, rememberWindows: boolean): ManagedWindow[] {
  if (!rememberWindows) return []

  try {
    const stored = window.localStorage.getItem(storageKey(userId))
    if (!stored) return []
    const parsed = JSON.parse(stored) as StoredWindow[]
    if (!Array.isArray(parsed)) return []

    return parsed
      .filter((item) => item && (item.app === 'notes' || item.app === 'search' || item.app === 'english'))
      .slice(0, 10)
      .map((item, index) => ({
        id: typeof item.id === 'string' ? item.id : createId(),
        app: item.app,
        sequence: Number.isFinite(item.sequence) ? item.sequence : index + 1,
        geometry: clampWindowGeometry(item.geometry),
        minimized: Boolean(item.minimized),
        maximized: false,
        zIndex: 60 + index,
      }))
  } catch {
    return []
  }
}

function appIcon(app: DesktopAppKind) {
  if (app === 'notes') return '✎'
  if (app === 'english') return 'EN'
  return '⌕'
}

export function DesktopWorkspace({
  language,
  userId,
  request,
  rememberWindows,
}: DesktopWorkspaceProps) {
  const [windows, setWindows] = useState<ManagedWindow[]>(() => readStoredWindows(userId, rememberWindows))
  const zIndexRef = useRef(80)
  const sequenceRef = useRef({
    notes: Math.max(0, ...windows.filter((item) => item.app === 'notes').map((item) => item.sequence)),
    search: Math.max(0, ...windows.filter((item) => item.app === 'search').map((item) => item.sequence)),
    english: Math.max(0, ...windows.filter((item) => item.app === 'english').map((item) => item.sequence)),
  })
  const lastRequestRef = useRef<number | null>(null)

  const nextZIndex = () => {
    zIndexRef.current += 1
    return zIndexRef.current
  }

  const focusWindow = useCallback((id: string) => {
    const zIndex = nextZIndex()
    setWindows((current) => current.map((item) => item.id === id ? { ...item, zIndex } : item))
  }, [])

  const openApp = useCallback((kind: DesktopAppKind) => {
    setWindows((current) => {
      if (kind === 'notes' || kind === 'english') {
        const existing = current.find((item) => item.app === kind)
        if (existing) {
          const zIndex = nextZIndex()
          return current.map((item) => item.id === existing.id ? { ...item, minimized: false, zIndex } : item)
        }
      }

      sequenceRef.current[kind] += 1
      const sequence = sequenceRef.current[kind]
      return [
        ...current,
        {
          id: createId(),
          app: kind,
          sequence,
          geometry: appGeometry(kind, current.length),
          minimized: false,
          maximized: false,
          zIndex: nextZIndex(),
        },
      ]
    })
  }, [])

  useEffect(() => {
    if (!request || request.id === lastRequestRef.current) return
    lastRequestRef.current = request.id
    openApp(request.kind)
  }, [openApp, request])

  useEffect(() => {
    const key = storageKey(userId)
    if (!rememberWindows) {
      window.localStorage.removeItem(key)
      return
    }

    const storedWindows: StoredWindow[] = windows.map((item) => ({
      id: item.id,
      app: item.app,
      sequence: item.sequence,
      geometry: item.geometry,
      minimized: item.minimized,
    }))
    window.localStorage.setItem(key, JSON.stringify(storedWindows))
  }, [rememberWindows, userId, windows])

  const copy = language === 'zh'
    ? { launch: '開啟應用程式', running: '正在執行', notes: '記事本', search: '搜尋', english: '英文學習', newSearch: '新增搜尋視窗' }
    : { launch: 'Open applications', running: 'Running applications', notes: 'Notes', search: 'Search', english: 'English', newSearch: 'New search window' }

  const windowTitle = (item: ManagedWindow) => {
    if (item.app === 'notes') return copy.notes
    if (item.app === 'english') return copy.english
    return `${copy.search} ${item.sequence}`
  }

  const updateWindow = (id: string, changes: Partial<ManagedWindow>) => {
    setWindows((current) => current.map((item) => item.id === id ? { ...item, ...changes } : item))
  }

  const toggleTaskWindow = (item: ManagedWindow) => {
    const highestZ = Math.max(0, ...windows.map((windowItem) => windowItem.zIndex))
    if (!item.minimized && item.zIndex === highestZ) {
      updateWindow(item.id, { minimized: true })
      return
    }
    updateWindow(item.id, { minimized: false, zIndex: nextZIndex() })
  }

  const appContent = (item: ManagedWindow) => {
    if (item.app === 'notes') return <NotesApp language={language} userId={userId} />
    if (item.app === 'english') return <EnglishLearningStudio language={language} userId={userId} />
    return <SearchApp language={language} userId={userId} instanceId={item.id} />
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
          onToggleMaximize={() => updateWindow(item.id, { maximized: !item.maximized, minimized: false, zIndex: nextZIndex() })}
          onClose={() => setWindows((current) => current.filter((windowItem) => windowItem.id !== item.id))}
          onGeometryChange={(geometry) => updateWindow(item.id, { geometry })}
        >
          {appContent(item)}
        </WindowFrame>
      ))}

      <nav className="desktop-dock" aria-label={copy.launch}>
        <div className="desktop-dock-launchers">
          <button type="button" title={copy.notes} onClick={() => openApp('notes')}><span>✎</span><small>{copy.notes}</small></button>
          <button type="button" title={copy.newSearch} onClick={() => openApp('search')}><span>⌕＋</span><small>{copy.search}</small></button>
          <button type="button" title={copy.english} onClick={() => openApp('english')}><span>EN</span><small>{copy.english}</small></button>
        </div>

        {windows.length > 0 ? <span className="desktop-dock-divider" aria-hidden="true" /> : null}

        <div className="desktop-running-apps" aria-label={copy.running}>
          {windows.map((item) => (
            <button
              className={`${item.minimized ? 'minimized ' : ''}${item.zIndex === Math.max(...windows.map((windowItem) => windowItem.zIndex)) ? 'active' : ''}`.trim()}
              type="button"
              key={item.id}
              title={windowTitle(item)}
              onClick={() => toggleTaskWindow(item)}
            >
              <span>{appIcon(item.app)}</span><small>{windowTitle(item)}</small>
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}
