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

export function SideDrawer({
  language,
  open,
  loggedIn,
  onToggle,
  onClose,
  onOpenSettings,
  onOpenAuth,
  onOpenDesktopApp,
}: SideDrawerProps) {
  const copy = language === 'zh'
    ? {
        menu: '主要選單', close: '關閉選單', workspace: '工作視窗', notes: '記事本', search: '新增搜尋視窗', searchHint: '可同時開啟多個',
        learning: '學習', english: '英文', englishHint: '分級測驗與個人課程', math: '數學', guestNote: '登入後即可使用工作視窗、學習選單、月曆與待辦事項。',
        login: '登入或註冊', settings: '設定',
      }
    : {
        menu: 'Main menu', close: 'Close menu', workspace: 'Work windows', notes: 'Notes', search: 'New search window', searchHint: 'Open multiple windows',
        learning: 'Learning', english: 'English', englishHint: 'Placement and personal course', math: 'Math', guestNote: 'Sign in to unlock work windows, learning, calendar, and to-dos.',
        login: 'Log in or register', settings: 'Settings',
      }

  const openAuth = () => {
    onClose()
    onOpenAuth()
  }

  const openDesktopApp = (app: DesktopAppKind) => {
    onClose()
    onOpenDesktopApp(app)
  }

  return (
    <>
      <button className="drawer-trigger" type="button" aria-label={copy.menu} aria-expanded={open} onClick={onToggle}>
        <span /><span /><span />
      </button>

      <aside className={`side-drawer${open ? ' open' : ''}`} aria-hidden={!open}>
        <div className="drawer-head">
          <div className="brand-mark">B</div>
          <div><p className="eyebrow">PERSONAL SPACE</p><h2>Bubble Space</h2></div>
          <button className="icon-button" type="button" aria-label={copy.close} onClick={onClose}>×</button>
        </div>

        {loggedIn ? (
          <>
            <nav className="member-nav" aria-label={copy.workspace}>
              <p className="drawer-section-label">{copy.workspace}</p>
              <button className="nav-single" type="button" onClick={() => openDesktopApp('notes')}><span>✎</span>{copy.notes}<small>Auto save</small></button>
              <button className="nav-single" type="button" onClick={() => openDesktopApp('search')}><span>⌕＋</span>{copy.search}<small>{copy.searchHint}</small></button>
            </nav>

            <nav className="member-nav learning-nav" aria-label={copy.learning}>
              <p className="drawer-section-label">{copy.learning}</p>
              <button className="nav-single" type="button" onClick={() => openDesktopApp('english')}><span>EN</span>{copy.english}<small>{copy.englishHint}</small></button>
              <button className="nav-single" type="button"><span>∑</span>{copy.math}<small>Preview</small></button>
            </nav>
          </>
        ) : (
          <div className="guest-drawer-note">
            <span className="note-orb">✦</span>
            <div><p>{copy.guestNote}</p><button className="drawer-login-button" type="button" onClick={openAuth}>{copy.login}</button></div>
          </div>
        )}

        <button className="settings-button" type="button" onClick={onOpenSettings}>
          <span className="settings-icon" aria-hidden="true">⚙</span><span>{copy.settings}</span><span className="settings-arrow" aria-hidden="true">›</span>
        </button>
      </aside>

      {open ? <button className="drawer-backdrop" type="button" aria-label={copy.close} onClick={onClose} /> : null}
    </>
  )
}
