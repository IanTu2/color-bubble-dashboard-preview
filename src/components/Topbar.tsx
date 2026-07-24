import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Language } from '../types'

type TopbarProps = {
  language: Language
  user: User | null
  authLoading: boolean
  onOpenAuth: () => void
  onLogout: () => Promise<void>
}

function getUserName(user: User) {
  const displayName = user.user_metadata?.display_name
  if (typeof displayName === 'string' && displayName.trim()) {
    return displayName.trim()
  }
  return user.email?.split('@')[0] || 'Member'
}

export function Topbar({ language, user, authLoading, onOpenAuth, onLogout }: TopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const copy =
    language === 'zh'
      ? {
          guest: '訪客模式',
          member: '個人空間',
          loading: '確認帳號中',
          openAccount: '開啟帳號',
          logout: '登出',
        }
      : {
          guest: 'Guest mode',
          member: 'Personal space',
          loading: 'Checking account',
          openAccount: 'Open account',
          logout: 'Log out',
        }

  const handleProfileClick = () => {
    if (authLoading) {
      return
    }
    if (!user) {
      onOpenAuth()
      return
    }
    setMenuOpen((current) => !current)
  }

  const handleLogout = async () => {
    setMenuOpen(false)
    await onLogout()
  }

  return (
    <header className="topbar">
      <div className={`status-pill${user ? ' member' : ''}`}>
        <span aria-hidden="true" />
        <span>{authLoading ? copy.loading : user ? copy.member : copy.guest}</span>
      </div>
      <div className="profile-area">
        <button
          className="profile-button"
          type="button"
          aria-label={copy.openAccount}
          aria-expanded={menuOpen}
          onClick={handleProfileClick}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 12a4.25 4.25 0 1 0 0-8.5 4.25 4.25 0 0 0 0 8.5Zm7.2 8.5a7.2 7.2 0 0 0-14.4 0" />
          </svg>
          {user ? <span className="profile-badge">{getUserName(user).slice(0, 1).toUpperCase()}</span> : null}
        </button>

        {user && menuOpen ? (
          <div className="profile-menu">
            <div className="profile-summary">
              <strong>{getUserName(user)}</strong>
              <span>{user.email}</span>
            </div>
            <button className="menu-action danger" type="button" onClick={handleLogout}>{copy.logout}</button>
          </div>
        ) : null}
      </div>
    </header>
  )
}
