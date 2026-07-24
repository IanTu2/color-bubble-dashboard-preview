import { useState } from 'react'
import type { FormEvent, MouseEvent } from 'react'
import { supabase } from '../lib/supabase'
import type { Language } from '../types'

type AuthDialogProps = {
  language: Language
  open: boolean
  onClose: () => void
  onSuccess: (message: string) => void
}

type AuthTab = 'login' | 'register'

type RegistrationDraft = {
  email: string
  displayName: string
  password: string
}

export function AuthDialog({ language, open, onClose, onSuccess }: AuthDialogProps) {
  const [tab, setTab] = useState<AuthTab>('login')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [registrationDraft, setRegistrationDraft] = useState<RegistrationDraft | null>(null)

  if (!open) {
    return null
  }

  const copy =
    language === 'zh'
      ? {
          close: '關閉',
          eyebrow: 'BUBBLE SPACE ACCOUNT',
          title: '開始你的專屬空間',
          subtitle: '登入後，月曆、待辦與學習資料會與你的帳號連動。',
          login: '登入',
          register: '註冊',
          email: 'Email',
          password: '密碼',
          displayName: '顯示名稱',
          passwordHint: '至少 8 個字元',
          loginButton: '登入帳號',
          sendCode: '寄送驗證碼',
          otp: 'Email 驗證碼',
          verify: '驗證並建立帳號',
          edit: '返回修改資料',
          codeSent: '驗證碼已寄到信箱，請查看收件匣與垃圾郵件。',
          loginSuccess: '登入成功。',
          registerSuccess: '帳號建立完成，歡迎加入！',
          invalidCode: '請輸入 Email 中的數字驗證碼。',
        }
      : {
          close: 'Close',
          eyebrow: 'BUBBLE SPACE ACCOUNT',
          title: 'Enter your personal space',
          subtitle: 'Your calendar, to-dos, and learning data will follow your account.',
          login: 'Log in',
          register: 'Register',
          email: 'Email',
          password: 'Password',
          displayName: 'Display name',
          passwordHint: 'At least 8 characters',
          loginButton: 'Log in',
          sendCode: 'Send verification code',
          otp: 'Email verification code',
          verify: 'Verify and create account',
          edit: 'Edit details',
          codeSent: 'A verification code was sent. Check your inbox and spam folder.',
          loginSuccess: 'You are signed in.',
          registerSuccess: 'Your account is ready. Welcome!',
          invalidCode: 'Enter the numeric code from the email.',
        }

  const resetRegistration = () => {
    setRegistrationDraft(null)
    setMessage('')
  }

  const switchTab = (nextTab: AuthTab) => {
    setTab(nextTab)
    setMessage('')
    if (nextTab === 'login') {
      setRegistrationDraft(null)
    }
  }

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') || '').trim()
    const password = String(form.get('password') || '')

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)

    if (error) {
      setMessage(error.message)
      return
    }

    onSuccess(copy.loginSuccess)
    onClose()
  }

  const handleStartRegistration = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    const form = new FormData(event.currentTarget)
    const displayName = String(form.get('displayName') || '').trim()
    const email = String(form.get('email') || '').trim().toLowerCase()
    const password = String(form.get('password') || '')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        data: { display_name: displayName },
      },
    })
    setBusy(false)

    if (error) {
      setMessage(error.message)
      return
    }

    setRegistrationDraft({ email, displayName, password })
    setMessage(copy.codeSent)
  }

  const handleVerifyRegistration = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!registrationDraft) {
      return
    }

    const form = new FormData(event.currentTarget)
    const token = String(form.get('token') || '').replace(/\D/g, '')
    if (!/^\d{6,10}$/.test(token)) {
      setMessage(copy.invalidCode)
      return
    }

    setBusy(true)
    setMessage('')
    const verification = await supabase.auth.verifyOtp({
      email: registrationDraft.email,
      token,
      type: 'email',
    })

    if (verification.error) {
      setBusy(false)
      setMessage(verification.error.message)
      return
    }

    const update = await supabase.auth.updateUser({
      password: registrationDraft.password,
      data: { display_name: registrationDraft.displayName },
    })
    setBusy(false)

    if (update.error) {
      setMessage(update.error.message)
      return
    }

    setRegistrationDraft(null)
    onSuccess(copy.registerSuccess)
    onClose()
  }

  return (
    <div className="modal auth-modal" role="presentation" onMouseDown={onClose}>
      <section
        className="auth-shell"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        onMouseDown={(event: MouseEvent<HTMLElement>) => event.stopPropagation()}
      >
        <button className="modal-close" type="button" aria-label={copy.close} onClick={onClose}>×</button>

        <div className="auth-intro">
          <div className="auth-orbit" aria-hidden="true"><span /><span /><strong>B</strong></div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2 id="auth-title">{copy.title}</h2>
          <p>{copy.subtitle}</p>
        </div>

        <div className="auth-content">
          <div className="auth-tabs" role="tablist">
            <button className={`auth-tab${tab === 'login' ? ' active' : ''}`} type="button" role="tab" aria-selected={tab === 'login'} onClick={() => switchTab('login')}>{copy.login}</button>
            <button className={`auth-tab${tab === 'register' ? ' active' : ''}`} type="button" role="tab" aria-selected={tab === 'register'} onClick={() => switchTab('register')}>{copy.register}</button>
          </div>

          {tab === 'login' ? (
            <form className="auth-form" onSubmit={handleLogin}>
              <label><span>{copy.email}</span><input name="email" type="email" autoComplete="email" required placeholder="name@example.com" /></label>
              <label><span>{copy.password}</span><input name="password" type="password" autoComplete="current-password" minLength={8} required placeholder={copy.passwordHint} /></label>
              <button className="primary-button" type="submit" disabled={busy}>{busy ? '…' : copy.loginButton}</button>
            </form>
          ) : registrationDraft ? (
            <form className="auth-form" onSubmit={handleVerifyRegistration}>
              <p className="form-note">{copy.codeSent}<br />{registrationDraft.email}</p>
              <label><span>{copy.otp}</span><input className="otp-input" name="token" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,10}" maxLength={10} required /></label>
              <button className="primary-button" type="submit" disabled={busy}>{busy ? '…' : copy.verify}</button>
              <button className="text-button" type="button" onClick={resetRegistration}>{copy.edit}</button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleStartRegistration}>
              <label><span>{copy.displayName}</span><input name="displayName" type="text" autoComplete="name" maxLength={40} required /></label>
              <label><span>{copy.email}</span><input name="email" type="email" autoComplete="email" required placeholder="name@example.com" /></label>
              <label><span>{copy.password}</span><input name="password" type="password" autoComplete="new-password" minLength={8} required placeholder={copy.passwordHint} /></label>
              <button className="primary-button" type="submit" disabled={busy}>{busy ? '…' : copy.sendCode}</button>
            </form>
          )}

          {message ? <div className="auth-message" role="status">{message}</div> : null}
        </div>
      </section>
    </div>
  )
}
