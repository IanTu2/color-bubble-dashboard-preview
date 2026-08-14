import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { AuthDialog } from './components/AuthDialog'
import { Background } from './components/Background'
import { DesktopWorkspace, type DesktopAppKind, type DesktopRequest } from './components/DesktopWorkspace'
import { HomeDashboard } from './components/HomeDashboard'
import { PersistentMusicPlayer } from './components/PersistentMusicPlayer'
import { SettingsDialog } from './components/SettingsDialog'
import { SideDrawer } from './components/SideDrawer'
import { Topbar } from './components/Topbar'
import type { CurriculumPathwayId, CurriculumSubjectId } from './curriculum-plan-v5'
import { supabase } from './lib/supabase'
import {
  APP_PREFERENCES_KEY,
  DEFAULT_APP_PREFERENCES,
  readAppPreferences,
  type AppPreferences,
} from './preferences'
import type { Language } from './types'

const LANGUAGE_KEY = 'bubble-space-v2-language'
const FONT_SCALE_KEY = 'bubble-space-v2-font-scale'

function readLanguage(): Language {
  return window.localStorage.getItem(LANGUAGE_KEY) === 'en' ? 'en' : 'zh'
}

function readFontScale() {
  const storedValue = Number(window.localStorage.getItem(FONT_SCALE_KEY))
  return Number.isFinite(storedValue) && storedValue >= 50 && storedValue <= 125 ? storedValue : 100
}

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [desktopRequest, setDesktopRequest] = useState<DesktopRequest | null>(null)
  const [language, setLanguage] = useState<Language>(readLanguage)
  const [fontScale, setFontScale] = useState(readFontScale)
  const [preferences, setPreferences] = useState<AppPreferences>(readAppPreferences)
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [toast, setToast] = useState('')

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-Hant' : 'en'
    window.localStorage.setItem(LANGUAGE_KEY, language)
  }, [language])

  useEffect(() => {
    const scale = fontScale / 100
    document.documentElement.style.fontSize = `${fontScale}%`
    document.documentElement.style.setProperty('--bubble-font-scale', String(scale))
    document.documentElement.style.setProperty('--bubble-font-scale-inverse', `${100 / scale}%`)
    window.localStorage.setItem(FONT_SCALE_KEY, String(fontScale))
  }, [fontScale])

  useEffect(() => {
    window.localStorage.setItem(APP_PREFERENCES_KEY, JSON.stringify(preferences))
  }, [preferences])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const applyTheme = () => {
      const resolvedTheme = preferences.themeMode === 'system'
        ? media.matches ? 'dark' : 'light'
        : preferences.themeMode
      document.documentElement.dataset.theme = resolvedTheme
      document.documentElement.style.colorScheme = resolvedTheme
    }

    applyTheme()
    if (preferences.themeMode !== 'system') return
    media.addEventListener('change', applyTheme)
    return () => media.removeEventListener('change', applyTheme)
  }, [preferences.themeMode])

  useEffect(() => {
    document.body.classList.toggle('dialog-open', settingsOpen || authOpen)
    return () => document.body.classList.remove('dialog-open')
  }, [settingsOpen, authOpen])

  useEffect(() => {
    let mounted = true

    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setUser(data.session?.user ?? null)
      setAuthLoading(false)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
      if (!session?.user) setDesktopRequest(null)
    })

    return () => {
      mounted = false
      data.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 3200)
    return () => window.clearTimeout(timer)
  }, [toast])

  const openAuth = () => {
    setSettingsOpen(false)
    setAuthOpen(true)
  }

  const requestDesktopApp = (kind: DesktopAppKind) => {
    setDesktopRequest({ id: Date.now() + Math.random(), kind })
  }

  const requestCurriculumCourse = (grade: number, subject: CurriculumSubjectId, pathway?: CurriculumPathwayId) => {
    setDrawerOpen(false)
    setDesktopRequest({ id: Date.now() + Math.random(), kind: 'course', course: { grade, subject, pathway } })
  }

  const resetAllSettings = () => {
    setLanguage('zh')
    setFontScale(100)
    setPreferences({ ...DEFAULT_APP_PREFERENCES })
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    setToast(error ? error.message : language === 'zh' ? '已安全登出。' : 'You are safely logged out.')
  }

  return (
    <div className="app-shell">
      <Background animationLevel={preferences.animationLevel} bubbleCount={preferences.bubbleCount} />
      <SideDrawer
        language={language}
        open={drawerOpen}
        loggedIn={Boolean(user)}
        onToggle={() => setDrawerOpen((current) => !current)}
        onClose={() => setDrawerOpen(false)}
        onOpenSettings={() => { setDrawerOpen(false); setAuthOpen(false); setSettingsOpen(true) }}
        onOpenAuth={openAuth}
        onOpenDesktopApp={requestDesktopApp}
        onOpenCourse={requestCurriculumCourse}
      />
      <Topbar language={language} user={user} authLoading={authLoading} onOpenAuth={openAuth} onLogout={logout} />
      <HomeDashboard
        language={language}
        loggedIn={Boolean(user)}
        userId={user?.id}
        onNotice={setToast}
        onBrowseCourses={() => setDrawerOpen(true)}
        onOpenCourse={requestCurriculumCourse}
      />
      {user ? <DesktopWorkspace language={language} userId={user.id} request={desktopRequest} rememberWindows={preferences.rememberWindows} /> : null}
      {user ? <PersistentMusicPlayer language={language} userId={user.id} enabled={preferences.musicEnabled} onNotice={setToast} /> : null}
      <SettingsDialog
        language={language}
        fontScale={fontScale}
        preferences={preferences}
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onLanguageChange={setLanguage}
        onFontScaleChange={setFontScale}
        onPreferencesChange={setPreferences}
        onResetAll={resetAllSettings}
      />
      <AuthDialog language={language} open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={setToast} />
      {toast ? <div className="toast" role="status">{toast}</div> : null}
    </div>
  )
}

export default App
