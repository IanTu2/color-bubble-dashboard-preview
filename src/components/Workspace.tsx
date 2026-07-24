import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { MusicStudio } from './MusicStudio'
import type { Language } from '../types'

export type WorkspacePanel = 'notes' | 'search' | 'music'

type WorkspaceProps = {
  language: Language
  userId: string
  open: boolean
  panel: WorkspacePanel
  onPanelChange: (panel: WorkspacePanel) => void
  onClose: () => void
  onNotice: (message: string) => void
}

type WorkspaceLauncherProps = {
  language: Language
  onOpen: (panel: WorkspacePanel) => void
}

type Note = {
  id: string
  title: string
  body: string
  updatedAt: string
}

type Geometry = {
  x: number
  y: number
  width: number
  height: number
}

type DragState = {
  type: 'move' | 'resize'
  startX: number
  startY: number
  geometry: Geometry
}

type SearchEngine = 'google' | 'duckduckgo' | 'bing'

type SearchHistoryItem = {
  query: string
  engine: SearchEngine
  createdAt: string
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const stored = window.localStorage.getItem(key)
    return stored ? (JSON.parse(stored) as T) : fallback
  } catch {
    return fallback
  }
}

function defaultGeometry(): Geometry {
  const width = Math.min(980, Math.max(640, window.innerWidth - 410))
  const height = Math.min(720, Math.max(500, window.innerHeight - 160))
  return {
    width,
    height,
    x: Math.max(42, (window.innerWidth - width - 280) / 2),
    y: 90,
  }
}

function clampGeometry(value: Geometry): Geometry {
  const minWidth = 560
  const minHeight = 420
  const maxWidth = Math.max(minWidth, window.innerWidth - 32)
  const maxHeight = Math.max(minHeight, window.innerHeight - 32)
  const width = Math.min(Math.max(value.width, minWidth), maxWidth)
  const height = Math.min(Math.max(value.height, minHeight), maxHeight)
  return {
    width,
    height,
    x: Math.min(Math.max(value.x, 8), Math.max(8, window.innerWidth - width - 8)),
    y: Math.min(Math.max(value.y, 8), Math.max(8, window.innerHeight - height - 8)),
  }
}

function panelIcon(panel: WorkspacePanel) {
  if (panel === 'notes') return '✎'
  if (panel === 'search') return '⌕'
  return '♫'
}

export function WorkspaceLauncher({ language, onOpen }: WorkspaceLauncherProps) {
  const copy = language === 'zh'
    ? { label: '開啟工作區', notes: '記事本', search: '搜尋', music: '音樂' }
    : { label: 'Open workspace', notes: 'Notes', search: 'Search', music: 'Music' }

  return (
    <nav className="workspace-launcher" aria-label={copy.label}>
      {(['notes', 'search', 'music'] as WorkspacePanel[]).map((panel) => (
        <button key={panel} type="button" title={copy[panel]} onClick={() => onOpen(panel)}>
          <span>{panelIcon(panel)}</span>
          <small>{copy[panel]}</small>
        </button>
      ))}
    </nav>
  )
}

export function Workspace({ language, userId, open, panel, onPanelChange, onClose, onNotice }: WorkspaceProps) {
  const geometryKey = `bubble-space-v2-workspace-${userId}-geometry`
  const notesKey = `bubble-space-v2-workspace-${userId}-notes`
  const historyKey = `bubble-space-v2-workspace-${userId}-search-history`
  const [geometry, setGeometry] = useState<Geometry>(() => clampGeometry(readJson<Geometry>(geometryKey, defaultGeometry())))
  const [dragState, setDragState] = useState<DragState | null>(null)
  const [minimized, setMinimized] = useState(false)
  const [maximized, setMaximized] = useState(false)
  const previousGeometry = useRef<Geometry | null>(null)
  const [notes, setNotes] = useState<Note[]>(() => readJson<Note[]>(notesKey, []))
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(() => readJson<string | null>(`${notesKey}-selected`, null))
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>(() => readJson<SearchHistoryItem[]>(historyKey, []))
  const [engine, setEngine] = useState<SearchEngine>('google')

  const copy = language === 'zh'
    ? {
        workspace: '工作區',
        notes: '記事本',
        search: '搜尋',
        music: '音樂',
        minimize: '最小化',
        maximize: '最大化',
        restore: '還原',
        close: '關閉',
        newNote: '新增筆記',
        untitled: '未命名筆記',
        noteTitle: '筆記標題',
        noteBody: '開始輸入內容…',
        deleteNote: '刪除筆記',
        emptyNotes: '建立第一份筆記開始使用',
        searchTitle: '網頁搜尋',
        searchHint: '搜尋結果會安全地在新分頁開啟；搜尋紀錄保留在這個瀏覽器中。',
        query: '輸入搜尋關鍵字',
        go: '搜尋',
        history: '搜尋紀錄',
        clear: '清除紀錄',
        noHistory: '尚無搜尋紀錄',
      }
    : {
        workspace: 'Workspace',
        notes: 'Notes',
        search: 'Search',
        music: 'Music',
        minimize: 'Minimize',
        maximize: 'Maximize',
        restore: 'Restore',
        close: 'Close',
        newNote: 'New note',
        untitled: 'Untitled note',
        noteTitle: 'Note title',
        noteBody: 'Start writing…',
        deleteNote: 'Delete note',
        emptyNotes: 'Create your first note to get started',
        searchTitle: 'Web search',
        searchHint: 'Results open safely in a new tab. Search history stays in this browser.',
        query: 'Enter search keywords',
        go: 'Search',
        history: 'Search history',
        clear: 'Clear history',
        noHistory: 'No search history yet',
      }

  useEffect(() => {
    window.localStorage.setItem(geometryKey, JSON.stringify(geometry))
  }, [geometry, geometryKey])

  useEffect(() => {
    window.localStorage.setItem(notesKey, JSON.stringify(notes))
    window.localStorage.setItem(`${notesKey}-selected`, JSON.stringify(selectedNoteId))
  }, [notes, notesKey, selectedNoteId])

  useEffect(() => {
    window.localStorage.setItem(historyKey, JSON.stringify(searchHistory))
  }, [historyKey, searchHistory])

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      if (!dragState) return
      const deltaX = event.clientX - dragState.startX
      const deltaY = event.clientY - dragState.startY
      if (dragState.type === 'move') {
        setGeometry(clampGeometry({ ...dragState.geometry, x: dragState.geometry.x + deltaX, y: dragState.geometry.y + deltaY }))
      } else {
        setGeometry(clampGeometry({ ...dragState.geometry, width: dragState.geometry.width + deltaX, height: dragState.geometry.height + deltaY }))
      }
    }
    const stop = () => setDragState(null)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', stop)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', stop)
    }
  }, [dragState])

  useEffect(() => {
    const onResize = () => setGeometry((value) => clampGeometry(value))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const selectedNote = notes.find((note) => note.id === selectedNoteId) ?? notes[0] ?? null

  useEffect(() => {
    if (!selectedNoteId && notes[0]) setSelectedNoteId(notes[0].id)
  }, [notes, selectedNoteId])

  const startDrag = (event: ReactPointerEvent<HTMLElement>, type: DragState['type']) => {
    if (maximized || window.innerWidth <= 760) return
    event.preventDefault()
    setDragState({ type, startX: event.clientX, startY: event.clientY, geometry })
  }

  const toggleMaximize = () => {
    if (maximized) {
      setGeometry(previousGeometry.current ?? defaultGeometry())
      setMaximized(false)
      return
    }
    previousGeometry.current = geometry
    setGeometry({ x: 8, y: 8, width: window.innerWidth - 16, height: window.innerHeight - 16 })
    setMaximized(true)
    setMinimized(false)
  }

  const addNote = () => {
    const note: Note = { id: createId(), title: copy.untitled, body: '', updatedAt: new Date().toISOString() }
    setNotes((current) => [note, ...current])
    setSelectedNoteId(note.id)
  }

  const updateNote = (changes: Partial<Pick<Note, 'title' | 'body'>>) => {
    if (!selectedNote) return
    setNotes((current) => current.map((note) => note.id === selectedNote.id ? { ...note, ...changes, updatedAt: new Date().toISOString() } : note))
  }

  const removeSelectedNote = () => {
    if (!selectedNote) return
    const remaining = notes.filter((note) => note.id !== selectedNote.id)
    setNotes(remaining)
    setSelectedNoteId(remaining[0]?.id ?? null)
  }

  const runSearch = (query: string) => {
    const trimmed = query.trim()
    if (!trimmed) return
    const encoded = encodeURIComponent(trimmed)
    const url = engine === 'google'
      ? `https://www.google.com/search?q=${encoded}`
      : engine === 'duckduckgo'
        ? `https://duckduckgo.com/?q=${encoded}`
        : `https://www.bing.com/search?q=${encoded}`
    window.open(url, '_blank', 'noopener,noreferrer')
    setSearchHistory((current) => [
      { query: trimmed, engine, createdAt: new Date().toISOString() },
      ...current.filter((item) => item.query !== trimmed || item.engine !== engine),
    ].slice(0, 20))
  }

  const panelLabel = copy[panel]
  const windowStyle = {
    left: `${geometry.x}px`,
    top: `${geometry.y}px`,
    width: `${geometry.width}px`,
    height: minimized ? '62px' : `${geometry.height}px`,
  }

  if (!open) return null

  return (
    <section className={`workspace-window${minimized ? ' minimized' : ''}${maximized ? ' maximized' : ''}`} style={windowStyle} aria-label={copy.workspace}>
      <header className="workspace-titlebar" onPointerDown={(event) => startDrag(event, 'move')}>
        <div className="workspace-window-title"><span>{panelIcon(panel)}</span><strong>{panelLabel}</strong></div>
        <div className="workspace-window-actions">
          <button type="button" title={copy.minimize} aria-label={copy.minimize} onClick={() => setMinimized((value) => !value)}>—</button>
          <button type="button" title={maximized ? copy.restore : copy.maximize} aria-label={maximized ? copy.restore : copy.maximize} onClick={toggleMaximize}>{maximized ? '❐' : '□'}</button>
          <button type="button" title={copy.close} aria-label={copy.close} onClick={onClose}>×</button>
        </div>
      </header>

      {!minimized ? (
        <>
          <nav className="workspace-tabs" aria-label={copy.workspace}>
            {(['notes', 'search', 'music'] as WorkspacePanel[]).map((item) => (
              <button className={panel === item ? 'active' : ''} type="button" key={item} onClick={() => onPanelChange(item)}>
                <span>{panelIcon(item)}</span>{copy[item]}
              </button>
            ))}
          </nav>

          <div className="workspace-content">
            {panel === 'notes' ? (
              <section className="notes-workspace">
                <aside className="note-sidebar">
                  <button className="primary-button note-add-button" type="button" onClick={addNote}>＋ {copy.newNote}</button>
                  <div className="note-list">
                    {notes.length === 0 ? <p className="workspace-empty">{copy.emptyNotes}</p> : null}
                    {notes.map((note) => (
                      <button className={note.id === selectedNote?.id ? 'active' : ''} type="button" key={note.id} onClick={() => setSelectedNoteId(note.id)}>
                        <strong>{note.title || copy.untitled}</strong>
                        <span>{new Intl.DateTimeFormat(language === 'zh' ? 'zh-TW' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(note.updatedAt))}</span>
                      </button>
                    ))}
                  </div>
                </aside>
                <div className="note-editor">
                  {selectedNote ? (
                    <>
                      <div className="note-editor-head">
                        <input value={selectedNote.title} aria-label={copy.noteTitle} onChange={(event) => updateNote({ title: event.target.value })} />
                        <button type="button" onClick={removeSelectedNote}>{copy.deleteNote}</button>
                      </div>
                      <textarea value={selectedNote.body} placeholder={copy.noteBody} onChange={(event) => updateNote({ body: event.target.value })} />
                    </>
                  ) : <div className="workspace-empty centered">{copy.emptyNotes}</div>}
                </div>
              </section>
            ) : null}

            {panel === 'search' ? (
              <section className="search-workspace">
                <div className="search-hero">
                  <p className="eyebrow">BUBBLE SEARCH</p>
                  <h2>{copy.searchTitle}</h2>
                  <p>{copy.searchHint}</p>
                  <form onSubmit={(event) => {
                    event.preventDefault()
                    const form = new FormData(event.currentTarget)
                    runSearch(String(form.get('query') ?? ''))
                  }}>
                    <select value={engine} onChange={(event) => setEngine(event.target.value as SearchEngine)}>
                      <option value="google">Google</option>
                      <option value="duckduckgo">DuckDuckGo</option>
                      <option value="bing">Bing</option>
                    </select>
                    <input name="query" required autoFocus placeholder={copy.query} />
                    <button className="primary-button" type="submit">{copy.go} ↗</button>
                  </form>
                </div>
                <div className="search-history-panel">
                  <div><h3>{copy.history}</h3><button type="button" onClick={() => setSearchHistory([])}>{copy.clear}</button></div>
                  {searchHistory.length === 0 ? <p className="workspace-empty">{copy.noHistory}</p> : null}
                  {searchHistory.map((item) => (
                    <button className="search-history-row" type="button" key={`${item.engine}-${item.query}-${item.createdAt}`} onClick={() => {
                      setEngine(item.engine)
                      runSearch(item.query)
                    }}>
                      <span>⌕</span><strong>{item.query}</strong><small>{item.engine}</small>
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            {panel === 'music' ? <MusicStudio language={language} userId={userId} onNotice={onNotice} /> : null}
          </div>
          <button className="workspace-resize-handle" type="button" aria-label="Resize" onPointerDown={(event) => startDrag(event, 'resize')} />
        </>
      ) : null}
    </section>
  )
}
