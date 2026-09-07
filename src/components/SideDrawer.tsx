import { useState } from 'react'
import type { Language } from '../types'
import type { DesktopAppKind } from './DesktopWorkspace'

type SideDrawerProps = {
  language: Language
  open: boolean
  loggedIn: boolean
  onToggle: () => void
  onClose: () => void
  onOpenSettings: () => void
  onOpenAuth: () => void
  onOpenDesktopApp: (app: DesktopAppKind) => void
}

export function SideDrawer({ language, open, loggedIn, onToggle, onClose, onOpenSettings, onOpenAuth, onOpenDesktopApp }: SideDrawerProps) {
  const [gamesOpen, setGamesOpen] = useState(false)

  const copy = language === 'zh'
    ? {
        menu: '主要選單', close: '關閉選單', workspace: '工作視窗', notes: '記事本', search: '新增搜尋視窗', searchHint: '可同時開啟多個',
        learning: '學習', games: '遊戲區', gamesHint: '用遊戲開始今天的學習', gamesSubHint: '短回合練習・智慧複習・學習進度', guestNote: '登入後即可使用工作視窗、學習遊戲、月曆與待辦事項。',
        login: '登入或註冊', settings: '設定', gamesTitle: '學習遊戲', gamesDescription: '用短回合、即時回饋與重複複習，把每天學到的內容記得更久。',
        english: '英文', englishHint: '情境題、無限練習、智慧複習與單字工具', open: '開啟', coming: '更多學習遊戲會陸續加入',
      }
    : {
        menu: 'Main menu', close: 'Close menu', workspace: 'Work windows', notes: 'Notes', search: 'New search window', searchHint: 'Open multiple windows',
        learning: 'Learning', games: 'Games', gamesHint: 'Start today’s learning through play', gamesSubHint: 'Short sessions · Smart review · Progress', guestNote: 'Sign in to unlock work windows, learning games, calendar, and to-dos.',
        login: 'Log in or register', settings: 'Settings', gamesTitle: 'Learning games', gamesDescription: 'Learn in short sessions with instant feedback and repeated review for stronger memory.',
        english: 'English', englishHint: 'Context questions, continuous practice, smart review, and vocabulary tools', open: 'Open', coming: 'More learning games will be added later',
      }

  const closeAll = () => {
    setGamesOpen(false)
    onClose()
  }

  const openDesktopApp = (app: DesktopAppKind) => {
    closeAll()
    onOpenDesktopApp(app)
  }

  return (
    <>
      <button className="drawer-trigger" type="button" aria-label={copy.menu} aria-expanded={open} onClick={onToggle}><span /><span /><span /></button>

      <aside className={`side-drawer learning-side-drawer${open ? ' open' : ''}`} aria-hidden={!open}>
        <div className="drawer-head">
          <div className="brand-mark">B</div>
          <div><p className="eyebrow">PERSONAL SPACE</p><h2>Bubble Space</h2></div>
          <button className="icon-button" type="button" aria-label={copy.close} onClick={closeAll}>×</button>
        </div>

        {loggedIn ? (
          <>
            <nav className="member-nav" aria-label={copy.workspace}>
              <p className="drawer-section-label">{copy.workspace}</p>
              <button className="nav-single" type="button" onClick={() => openDesktopApp('notes')}><span>✎</span>{copy.notes}<small>Auto save</small></button>
              <button className="nav-single" type="button" onClick={() => openDesktopApp('search')}><span>⌕＋</span>{copy.search}<small>{copy.searchHint}</small></button>
            </nav>

            <nav className="member-nav learning-nav learning-curriculum-nav" aria-label={copy.learning}>
              <p className="drawer-section-label">{copy.learning}</p>
              <button className={`curriculum-entry practice-entry${gamesOpen ? ' active' : ''}`} type="button" onClick={() => setGamesOpen((current) => !current)}>
                <span className="curriculum-entry-icon practice-entry-icon">◇</span>
                <span className="curriculum-entry-copy"><strong>{copy.games}</strong><small>{copy.gamesHint}</small><em>{copy.gamesSubHint}</em></span>
                <span className="curriculum-entry-arrow">›</span>
              </button>
            </nav>
          </>
        ) : (
          <div className="guest-drawer-note"><span className="note-orb">✦</span><div><p>{copy.guestNote}</p><button className="drawer-login-button" type="button" onClick={() => { closeAll(); onOpenAuth() }}>{copy.login}</button></div></div>
        )}

        <button className="settings-button" type="button" onClick={() => { setGamesOpen(false); onOpenSettings() }}><span className="settings-icon">⚙</span><span>{copy.settings}</span><span className="settings-arrow">›</span></button>
      </aside>

      {loggedIn ? (
        <section id="practice-curtain" className={`curriculum-curtain practice-curtain${open && gamesOpen ? ' open' : ''}`} aria-hidden={!(open && gamesOpen)}>
          <header className="curriculum-curtain-head practice-curtain-head">
            <button className="curriculum-back" type="button" aria-label={language === 'zh' ? '返回主選單' : 'Back to main menu'} onClick={() => setGamesOpen(false)}>‹</button>
            <div><p className="eyebrow">LEARNING GAMES</p><h2>{copy.gamesTitle}</h2><span>{copy.gamesDescription}</span></div>
          </header>
          <section className="practice-tool-list">
            <button className="practice-tool-card" type="button" onClick={() => openDesktopApp('english')}>
              <span className="practice-tool-icon">EN</span><span className="practice-tool-copy"><strong>{copy.english}</strong><small>{copy.englishHint}</small></span><span className="practice-tool-open">{copy.open} ›</span>
            </button>
          </section>
          <div className="practice-coming-note"><span>＋</span><p>{copy.coming}</p></div>
        </section>
      ) : null}

      {open ? <button className="drawer-backdrop" type="button" aria-label={copy.close} onClick={closeAll} /> : null}
    </>
  )
}
