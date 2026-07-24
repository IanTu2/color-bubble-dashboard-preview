import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { AuthDialog } from './components/AuthDialog'
import { Background } from './components/Background'
import { HomeDashboard } from './components/HomeDashboard'
import { SettingsDialog } from './components/SettingsDialog'
import { SideDrawer } from './components/SideDrawer'
import { Topbar } from './components/Topbar'
import { supabase } from './lib/supabase'
import type { Language } from './types'

const LANGUAGE_KEY = 'bubble-space-v2-language'
const FONT_SCALE_KEY = 'bubble-space-v2-font-scale'

function readLanguage(): Language {
  return window.localStorage.getItem(LANGUAGE_KEY) === 'en' ? 'en' : 'zh'
}

function readFontScale() {
  const storedValue = Number(window.localStorage.getItem(FONT_SCALE_KEY))
  return Number.isFinite(storedValue) && storedValue >= 85 && storedValue <= 125 ? storedValue : 100
}

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [language, setLanguage] = useState<Language>(readLanguage)
  const [fontScale, setFontScale] = useState(readFontScale)
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [toast, setToast] = useState('')

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-Hant' : 'en'
    window.localStorage.setItem(LANGUAGE_KEY, language)
  }, [language])

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontScale}%`
    window.localStorage.setItem(FONT_SCALE_KEY, String(fontScale))
  }, [fontScale])

  useEffect(() => {
    document.body.classList.toggle('dialog-open', settingsOpen || authOpen)
    return () => document.body.classList.remove('dialog-open')
  }, [settingsOpen, authOpen])

  useEffect(() => {
    let mounted = true

    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) {
        return
      }
      setUser(data.session?.user ?? null)
      setAuthLoading(false)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })

    return () => {
      mounted = false
      data.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!toast) {
      return
    }
    const timer = window.setTimeout(() => setToast(''), 3200)
    return () => window.clearTimeout(timer)
  }, [toast])

  const openAuth = () => {
    setSettingsOpen(false)
    setAuthOpen(true)
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    setToast(
      error
        ? error.message
        : language === 'zh'
          ? '已安全登出。'
          : 'You are safely logged out.',
    )
  }

  return (
    <div className="app-shell">
      <Background />
      <SideDrawer
        language={language}
        open={drawerOpen}
        loggedIn={Boolean(user)}
        onToggle={() => setDrawerOpen((current) => !current)}
        onClose={() => setDrawerOpen(false)}
        onOpenSettings={() => {
          setDrawerOpen(false)
          setAuthOpen(false)
          setSettingsOpen(true)
        }}
        onOpenAuth={openAuth}
      />
      <Topbar
        language={language}
        user={user}
        authLoading={authLoading}
        onOpenAuth={openAuth}
        onLogout={logout}
      />
      <HomeDashboard language={language} loggedIn={Boolean(user)} userId={user?.id} />
      <SettingsDialog
        language={language}
        fontScale={fontScale}
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onLanguageChange={setLanguage}
        onFontScaleChange={setFontScale}
      />
      <AuthDialog
        language={language}
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={setToast}
      />
      {toast ? <div className="toast" role="status">{toast}</div> : null}
    </div>
  )
}

export default App
