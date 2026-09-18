import { useState } from 'react'
import type { FormEvent, MouseEvent } from 'react'
import { supabase } from '../lib/supabase'
import type { Language } from '../types'

type AuthDialogProps = {
  language: Language
  open: boolean
  passwordRecovery: boolean
  onClose: () => void
  onSuccess: (message: string) => void
}

type AuthTab = 'login' | 'register'

type RegistrationDraft = {
  email: string
  displayName: string
  password: string
}

export function AuthDialog({ language, open, passwordRecovery, onClose, onSuccess }: AuthDialogProps) {
  const [tab, setTab] = useState<AuthTab>('login')
  const [forgotPassword, setForgotPassword] = useState(false)
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
          forgotPassword: '忘記密碼？',
          resetTitle: '重設密碼',
          resetHint: '輸入帳號 Email，我們會寄送安全的密碼重設連結。',
          sendResetLink: '寄送重設連結',
          resetSent: '重設連結已寄出，請查看收件匣與垃圾郵件。',
          backToLogin: '返回登入',
          newPassword: '新密碼',
          confirmPassword: '再次輸入新密碼',
          savePassword: '儲存新密碼',
          passwordUpdated: '密碼已更新，現在已登入。',
          passwordMismatch: '兩次輸入的密碼不一致。',
          serviceUnavailable: '登入服務暫時無法連線，請稍後再試。',
          incorrectCredentials: 'Email 或密碼不正確；若忘記密碼，請使用重設功能。',
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
          forgotPassword: 'Forgot password?',
          resetTitle: 'Reset password',
          resetHint: 'Enter your account email and we will send a secure reset link.',
          sendResetLink: 'Send reset link',
          resetSent: 'The reset link was sent. Check your inbox and spam folder.',
          backToLogin: 'Back to login',
          newPassword: 'New password',
          confirmPassword: 'Confirm new password',
          savePassword: 'Save new password',
          passwordUpdated: 'Your password is updated and you are signed in.',
          passwordMismatch: 'The passwords do not match.',
          serviceUnavailable: 'The sign-in service is temporarily unavailable. Try again shortly.',
          incorrectCredentials: 'The email or password is incorrect. Use password reset if needed.',
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
    setForgotPassword(false)
    setMessage('')
    if (nextTab === 'login') {
      setRegistrationDraft(null)
    }
  }

  const readableAuthError = (errorMessage: string) => {
    if (/failed to fetch|network request failed/i.test(errorMessage)) return copy.serviceUnavailable
    if (/invalid login credentials/i.test(errorMessage)) return copy.incorrectCredentials
    return errorMessage
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
      setMessage(readableAuthError(error.message))
      return
    }

    onSuccess(copy.loginSuccess)
    onClose()
  }

  const handleForgotPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') || '').trim().toLowerCase()
    const redirectTo = `${window.location.origin}${window.location.pathname}`
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
    setBusy(false)

    if (error) {
      setMessage(readableAuthError(error.message))
      return
    }

    setMessage(copy.resetSent)
  }

  const handlePasswordRecovery = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const password = String(form.get('password') || '')
    const confirmation = String(form.get('passwordConfirmation') || '')
    if (password !== confirmation) {
      setMessage(copy.passwordMismatch)
      return
    }

    setBusy(true)
    setMessage('')
    const { error } = await supabase.auth.updateUser({ password })
    setBusy(false)

    if (error) {
      setMessage(readableAuthError(error.message))
      return
    }

    onSuccess(copy.passwordUpdated)
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
          {!passwordRecovery ? <div className="auth-tabs" role="tablist">
            <button className={`auth-tab${tab === 'login' ? ' active' : ''}`} type="button" role="tab" aria-selected={tab === 'login'} onClick={() => switchTab('login')}>{copy.login}</button>
            <button className={`auth-tab${tab === 'register' ? ' active' : ''}`} type="button" role="tab" aria-selected={tab === 'register'} onClick={() => switchTab('register')}>{copy.register}</button>
          </div> : null}

          {passwordRecovery ? (
            <form className="auth-form" onSubmit={handlePasswordRecovery}>
              <div className="auth-form-heading">
                <h3>{copy.resetTitle}</h3>
              </div>
              <label><span>{copy.newPassword}</span><input name="password" type="password" autoComplete="new-password" minLength={8} required placeholder={copy.passwordHint} /></label>
              <label><span>{copy.confirmPassword}</span><input name="passwordConfirmation" type="password" autoComplete="new-password" minLength={8} required placeholder={copy.passwordHint} /></label>
              <button className="primary-button" type="submit" disabled={busy}>{busy ? '…' : copy.savePassword}</button>
            </form>
          ) : tab === 'login' && forgotPassword ? (
            <form className="auth-form" onSubmit={handleForgotPassword}>
              <div className="auth-form-heading">
                <h3>{copy.resetTitle}</h3>
                <p>{copy.resetHint}</p>
              </div>
              <label><span>{copy.email}</span><input name="email" type="email" autoComplete="email" required placeholder="name@example.com" /></label>
              <button className="primary-button" type="submit" disabled={busy}>{busy ? '…' : copy.sendResetLink}</button>
              <button className="text-button" type="button" onClick={() => { setForgotPassword(false); setMessage('') }}>{copy.backToLogin}</button>
            </form>
          ) : tab === 'login' ? (
            <form className="auth-form" onSubmit={handleLogin}>
              <label><span>{copy.email}</span><input name="email" type="email" autoComplete="email" required placeholder="name@example.com" /></label>
              <label><span>{copy.password}</span><input name="password" type="password" autoComplete="current-password" minLength={8} required placeholder={copy.passwordHint} /></label>
              <button className="text-button auth-forgot-button" type="button" onClick={() => { setForgotPassword(true); setMessage('') }}>{copy.forgotPassword}</button>
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
