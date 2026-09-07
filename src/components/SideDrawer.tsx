import { useState } from 'react'
import type { Language } from '../types'
import type { DesktopAppKind } from './DesktopWorkspace'

type Props = {
  language: Language; open: boolean; loggedIn: boolean
  onToggle: () => void; onClose: () => void; onOpenSettings: () => void
  onOpenAuth: () => void; onOpenDesktopApp: (app: DesktopAppKind) => void
}

export function SideDrawer({ language, open, loggedIn, onToggle, onClose, onOpenSettings, onOpenAuth, onOpenDesktopApp }: Props) {
  const [materialsOpen, setMaterialsOpen] = useState(false)
  const zh = language === 'zh'
  const close = () => { setMaterialsOpen(false); onClose() }
  const launch = (app: DesktopAppKind) => { close(); onOpenDesktopApp(app) }
  return <>
    <button className="drawer-trigger" type="button" aria-label={zh ? '主要選單' : 'Main menu'} aria-expanded={open} onClick={onToggle}><span/><span/><span/></button>
    <aside className={`side-drawer learning-side-drawer${open ? ' open' : ''}`} inert={!open} aria-hidden={!open}>
      <div className="drawer-head"><div className="brand-mark">B</div><div><p className="eyebrow">PERSONAL SPACE</p><h2>Bubble Space</h2></div><button className="icon-button" aria-label={zh ? '關閉選單' : 'Close menu'} onClick={close}>×</button></div>
      {loggedIn ? <>
        <nav className="member-nav" aria-label={zh ? '工作視窗' : 'Work windows'}><p className="drawer-section-label">{zh ? '工作視窗' : 'Work windows'}</p>
          <button className="nav-single" onClick={() => launch('notes')}><span>✎</span>{zh ? '記事本' : 'Notes'}</button>
          <button className="nav-single" onClick={() => launch('search')}><span>⌕＋</span>{zh ? '新增搜尋視窗' : 'New search window'}</button>
        </nav>
        <nav className="member-nav learning-nav" aria-label={zh ? '學習' : 'Learning'}><p className="drawer-section-label">{zh ? '學習' : 'Learning'}</p>
          <button className={`curriculum-entry practice-entry${materialsOpen ? ' active' : ''}`} aria-expanded={materialsOpen} aria-controls="materials-curtain" onClick={() => setMaterialsOpen(v => !v)}>
            <span className="curriculum-entry-icon">▤</span><span className="curriculum-entry-copy"><strong>{zh ? '輔助教材區' : 'Learning materials'}</strong><small>{zh ? '英文・歷史・人體生物' : 'English · History · Human biology'}</small></span><span>›</span>
          </button>
        </nav>
      </> : <div className="guest-drawer-note"><div><p>{zh ? '登入後即可使用輔助教材、工作視窗、月曆與待辦事項。' : 'Sign in to use learning materials, work windows, calendar and to-dos.'}</p><button className="drawer-login-button" onClick={() => { close(); onOpenAuth() }}>{zh ? '登入或註冊' : 'Sign in or register'}</button></div></div>}
      <button className="settings-button" onClick={() => { close(); onOpenSettings() }}><span>⚙</span><span>{zh ? '設定' : 'Settings'}</span><span>›</span></button>
    </aside>
    {loggedIn && open && materialsOpen ? <section id="materials-curtain" className="curriculum-curtain practice-curtain open">
      <header className="curriculum-curtain-head"><button className="curriculum-back" aria-label={zh ? '返回主選單' : 'Back to menu'} onClick={() => setMaterialsOpen(false)}>‹</button><div><p className="eyebrow">LEARNING MATERIALS</p><h2>{zh ? '輔助教材區' : 'Learning materials'}</h2></div></header>
      <div className="practice-tool-list">
        <button className="practice-tool-card" onClick={() => launch('english')}><span className="practice-tool-icon">EN</span><span className="practice-tool-copy"><strong>{zh ? '英文' : 'English'}</strong><small>{zh ? 'EPOP 式情境練習・多鄰國式闖關' : 'EPOP-style context practice · Duolingo-style path'}</small></span><span>›</span></button>
        {[['歷史', 'History'], ['人體生物', 'Human biology']].map(([cn, en]) => <div className="practice-tool-card materials-coming" key={en}><span className="practice-tool-copy"><strong>{zh ? cn : en}</strong><small>{zh ? '籌備中' : 'Coming later'}</small></span></div>)}
      </div>
    </section> : null}
    {open ? <button className="drawer-backdrop" aria-label={zh ? '關閉選單' : 'Close menu'} onClick={close}/> : null}
  </>
}
