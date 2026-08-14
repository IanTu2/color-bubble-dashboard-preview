import { useCallback, useEffect, useRef, useState } from 'react'
import { CurriculumCourseApp, type CurriculumCourseSelection } from './CurriculumCourseApp'
import { EnglishLearningStudio } from './EnglishLearningStudioV3'
import { NotesApp } from './NotesApp'
import { SearchApp } from './SearchApp'
import { WindowFrame, clampWindowGeometry, type WindowGeometry } from './WindowFrame'
import { getCurriculumCourseMeta, getCurriculumTrack } from '../curriculum-plan-v5'
import type { Language } from '../types'

export type DesktopAppKind = 'notes' | 'search' | 'english' | 'course'

export type DesktopRequest = {
  id: number
  kind: DesktopAppKind
  course?: CurriculumCourseSelection
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
  course?: CurriculumCourseSelection
}

type StoredWindow = Pick<ManagedWindow, 'id' | 'app' | 'sequence' | 'geometry' | 'minimized' | 'maximized' | 'course'>

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function storageKey(userId: string) {
  return `bubble-space-v2-desktop-windows-${userId}`
}

function appGeometry(app: DesktopAppKind, offset: number): WindowGeometry {
  if (app === 'english' || app === 'course') {
    return clampWindowGeometry({
      x: 8,
      y: 8,
      width: Math.max(520, window.innerWidth - 16),
      height: Math.max(420, window.innerHeight - 16),
    })
  }

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

function validCourse(course: CurriculumCourseSelection | undefined) {
  return Boolean(course
    && Number.isInteger(course.grade)
    && course.grade >= 1
    && course.grade <= 12
    && ['chinese', 'english', 'math', 'science', 'social'].includes(course.subject)
    && getCurriculumTrack(course.grade, course.subject, course.pathway))
}

function readStoredWindows(userId: string, rememberWindows: boolean): ManagedWindow[] {
  if (!rememberWindows) return []

  try {
    const stored = window.localStorage.getItem(storageKey(userId))
    if (!stored) return []
    const parsed = JSON.parse(stored) as StoredWindow[]
    if (!Array.isArray(parsed)) return []

    return parsed
      .filter((item) => item && (item.app === 'notes' || item.app === 'search' || item.app === 'english' || item.app === 'course'))
      .filter((item) => item.app !== 'course' || validCourse(item.course))
      .slice(0, 10)
      .map((item, index) => ({
        id: typeof item.id === 'string' ? item.id : createId(),
        app: item.app,
        sequence: Number.isFinite(item.sequence) ? item.sequence : index + 1,
        geometry: clampWindowGeometry(item.geometry),
        minimized: Boolean(item.minimized),
        maximized: Boolean(item.maximized),
        zIndex: 60 + index,
        course: item.course,
      }))
  } catch {
    return []
  }
}

function appIcon(app: DesktopAppKind) {
  if (app === 'notes') return '✎'
  if (app === 'english') return 'EN'
  if (app === 'course') return '學'
  return '⌕'
}

function courseTitle(course: CurriculumCourseSelection | undefined, language: Language) {
  if (!course) return language === 'zh' ? '正式課程' : 'Course'
  const meta = getCurriculumCourseMeta(course.subject, course.pathway)
  const gradeZh = course.grade <= 6
    ? `${['一', '二', '三', '四', '五', '六'][course.grade - 1]}年級`
    : course.grade <= 9
      ? `${['七', '八', '九'][course.grade - 7]}年級`
      : `高${['一', '二', '三'][course.grade - 10]}`
  return language === 'zh' ? `${gradeZh} ${meta.labelZh}` : `Grade ${course.grade} ${meta.labelEn}`
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
    course: Math.max(0, ...windows.filter((item) => item.app === 'course').map((item) => item.sequence)),
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

  const openApp = useCallback((kind: DesktopAppKind, course?: CurriculumCourseSelection) => {
    setWindows((current) => {
      if (kind === 'notes' || kind === 'english' || kind === 'course') {
        const existing = current.find((item) => item.app === kind)
        if (existing) {
          const zIndex = nextZIndex()
          return current.map((item) => item.id === existing.id
            ? {
                ...item,
                course: kind === 'course' && course ? course : item.course,
                minimized: false,
                maximized: kind === 'course' ? true : item.maximized,
                zIndex,
              }
            : item)
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
          maximized: kind === 'english' || kind === 'course',
          zIndex: nextZIndex(),
          course,
        },
      ]
    })
  }, [])

  useEffect(() => {
    if (!request || request.id === lastRequestRef.current) return
    lastRequestRef.current = request.id
    openApp(request.kind, request.course)
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
      maximized: item.maximized,
      course: item.course,
    }))
    window.localStorage.setItem(key, JSON.stringify(storedWindows))
  }, [rememberWindows, userId, windows])

  const copy = language === 'zh'
    ? { launch: '開啟應用程式', running: '正在執行', notes: '記事本', search: '搜尋', english: '英文練習', newSearch: '新增搜尋視窗' }
    : { launch: 'Open applications', running: 'Running applications', notes: 'Notes', search: 'Search', english: 'English practice', newSearch: 'New search window' }

  const windowTitle = (item: ManagedWindow) => {
    if (item.app === 'notes') return copy.notes
    if (item.app === 'english') return copy.english
    if (item.app === 'course') return courseTitle(item.course, language)
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
    if (item.app === 'course' && item.course) {
      return <CurriculumCourseApp language={language} userId={userId} grade={item.course.grade} subject={item.course.subject} pathway={item.course.pathway} />
    }
    return <SearchApp language={language} userId={userId} instanceId={item.id} />
  }

  const visibleWindows = windows.filter((item) => !item.minimized)
  const foregroundWindow = visibleWindows.reduce<ManagedWindow | null>((top, item) => (!top || item.zIndex > top.zIndex ? item : top), null)
  const immersiveCourseOpen = foregroundWindow?.app === 'course'

  return (
    <>
      {windows.map((item) => (
        <div
          key={item.id}
          aria-hidden={item.minimized}
          style={{ display: item.minimized ? 'none' : 'contents' }}
        >
          <WindowFrame
            title={windowTitle(item)}
            icon={appIcon(item.app)}
            geometry={item.geometry}
            maximized={item.maximized}
            immersive={item.app === 'course'}
            zIndex={item.zIndex}
            onFocus={() => focusWindow(item.id)}
            onMinimize={() => updateWindow(item.id, { minimized: true })}
            onToggleMaximize={() => updateWindow(item.id, { maximized: !item.maximized, minimized: false, zIndex: nextZIndex() })}
            onClose={() => setWindows((current) => current.filter((windowItem) => windowItem.id !== item.id))}
            onGeometryChange={(geometry) => updateWindow(item.id, { geometry })}
          >
            {appContent(item)}
          </WindowFrame>
        </div>
      ))}

      <nav className={`desktop-dock${immersiveCourseOpen ? ' desktop-dock-hidden' : ''}`} aria-label={copy.launch}>
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