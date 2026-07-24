import type { Language } from '../types'

type SideDrawerProps = {
  language: Language
  open: boolean
  onToggle: () => void
  onClose: () => void
  onOpenSettings: () => void
}

export function SideDrawer({ language, open, onToggle, onClose, onOpenSettings }: SideDrawerProps) {
  const copy =
    language === 'zh'
      ? {
          menu: '主要選單',
          close: '關閉選單',
          learning: '學習',
          english: '英文',
          math: '數學',
          note: '登入與學習功能會在後續階段接回 Supabase。',
          settings: '設定',
        }
      : {
          menu: 'Main menu',
          close: 'Close menu',
          learning: 'Learning',
          english: 'English',
          math: 'Math',
          note: 'Sign-in and learning will reconnect to Supabase in a later phase.',
          settings: 'Settings',
        }

  return (
    <>
      <button
        className="drawer-trigger"
        type="button"
        aria-label={copy.menu}
        aria-expanded={open}
        onClick={onToggle}
      >
        <span />
        <span />
        <span />
      </button>

      <aside className={`side-drawer${open ? ' open' : ''}`} aria-hidden={!open}>
        <div className="drawer-head">
          <div className="brand-mark">B</div>
          <div>
            <p className="eyebrow">PERSONAL SPACE</p>
            <h2>Bubble Space</h2>
          </div>
          <button className="icon-button" type="button" aria-label={copy.close} onClick={onClose}>
            ×
          </button>
        </div>

        <nav className="member-nav" aria-label={copy.learning}>
          <p className="drawer-section-label">{copy.learning}</p>
          <button className="nav-single" type="button">
            <span>EN</span>
            {copy.english}
            <small>Preview</small>
          </button>
          <button className="nav-single" type="button">
            <span>∑</span>
            {copy.math}
            <small>Preview</small>
          </button>
        </nav>

        <div className="guest-drawer-note">
          <span className="note-orb">✦</span>
          <p>{copy.note}</p>
        </div>

        <button className="settings-button" type="button" onClick={onOpenSettings}>
          <span className="settings-icon" aria-hidden="true">⚙</span>
          <span>{copy.settings}</span>
          <span className="settings-arrow" aria-hidden="true">›</span>
        </button>
      </aside>

      {open ? <button className="drawer-backdrop" type="button" aria-label={copy.close} onClick={onClose} /> : null}
    </>
  )
}
