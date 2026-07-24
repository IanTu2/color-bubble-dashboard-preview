import { useEffect, useState } from 'react'
import { Background } from './components/Background'
import { HomeDashboard } from './components/HomeDashboard'
import { SettingsDialog } from './components/SettingsDialog'
import { SideDrawer } from './components/SideDrawer'
import { Topbar } from './components/Topbar'
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
  const [language, setLanguage] = useState<Language>(readLanguage)
  const [fontScale, setFontScale] = useState(readFontScale)

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-Hant' : 'en'
    window.localStorage.setItem(LANGUAGE_KEY, language)
  }, [language])

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontScale}%`
    window.localStorage.setItem(FONT_SCALE_KEY, String(fontScale))
  }, [fontScale])

  useEffect(() => {
    document.body.classList.toggle('dialog-open', settingsOpen)
    return () => document.body.classList.remove('dialog-open')
  }, [settingsOpen])

  return (
    <div className="app-shell">
      <Background />
      <SideDrawer
        language={language}
        open={drawerOpen}
        onToggle={() => setDrawerOpen((current) => !current)}
        onClose={() => setDrawerOpen(false)}
        onOpenSettings={() => {
          setDrawerOpen(false)
          setSettingsOpen(true)
        }}
      />
      <Topbar language={language} />
      <HomeDashboard language={language} />
      <SettingsDialog
        language={language}
        fontScale={fontScale}
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onLanguageChange={setLanguage}
        onFontScaleChange={setFontScale}
      />
    </div>
  )
}

export default App
