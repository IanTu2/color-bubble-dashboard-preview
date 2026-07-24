import type { Language } from '../types'

type TopbarProps = {
  language: Language
}

export function Topbar({ language }: TopbarProps) {
  const copy =
    language === 'zh'
      ? { status: 'v2 測試服', profile: '帳號功能搬移中' }
      : { status: 'v2 Preview', profile: 'Account migration in progress' }

  return (
    <header className="topbar">
      <div className="status-pill member">
        <span aria-hidden="true" />
        <span>{copy.status}</span>
      </div>
      <button className="profile-button" type="button" aria-label={copy.profile} title={copy.profile}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 12a4.25 4.25 0 1 0 0-8.5 4.25 4.25 0 0 0 0 8.5Zm7.2 8.5a7.2 7.2 0 0 0-14.4 0" />
        </svg>
        <span className="preview-badge">V2</span>
      </button>
    </header>
  )
}
