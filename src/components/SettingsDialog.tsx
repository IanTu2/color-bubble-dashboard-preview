import type { ChangeEvent, MouseEvent } from 'react'
import type { AppPreferences, AnimationLevel, ThemeMode } from '../preferences'
import type { Language } from '../types'

type SettingsDialogProps = {
  language: Language
  fontScale: number
  preferences: AppPreferences
  open: boolean
  onClose: () => void
  onLanguageChange: (language: Language) => void
  onFontScaleChange: (fontScale: number) => void
  onPreferencesChange: (preferences: AppPreferences) => void
  onResetAll: () => void
}

export function SettingsDialog({ language, fontScale, preferences, open, onClose, onLanguageChange, onFontScaleChange, onPreferencesChange, onResetAll }: SettingsDialogProps) {
  if (!open) return null

  const copy = language === 'zh'
    ? {
        close: '關閉', title: '設定', subtitle: '調整外觀、顯示、背景動畫、音樂與工作區行為。', language: '語言', appearance: '外觀主題', appearanceHint: '淺色適合長時間閱讀課程；也可以切回深色或跟隨作業系統。',
        light: '淺色', dark: '深色', system: '跟隨系統', fontSize: '字體大小', fontSmall: '50% / 小', fontLarge: '125% / 大', motion: '背景動畫', motionHint: '降低動畫可減少電腦負擔，也比較不容易分心。', low: '柔和', normal: '標準', high: '活潑', bubbles: '泡泡數量', backgroundTools: '背景工具', music: '常駐音樂播放器', musicHint: '啟用後，右下角會顯示小型播放器，可展開完整音樂工作室。', workspace: '工作區', rememberWindows: '記住開啟中的視窗', rememberHint: '重新整理後恢復記事本、搜尋、英文與課程視窗；關閉的視窗不會恢復。', saved: '設定會保存在這個瀏覽器中。', reset: '恢復所有預設設定',
      }
    : {
        close: 'Close', title: 'Settings', subtitle: 'Adjust appearance, display, background motion, music, and workspace behavior.', language: 'Language', appearance: 'Appearance', appearanceHint: 'Light mode is tuned for longer study sessions; you can also use dark mode or follow your system.',
        light: 'Light', dark: 'Dark', system: 'System', fontSize: 'Font size', fontSmall: '50% / Small', fontLarge: '125% / Large', motion: 'Background motion', motionHint: 'Lower motion reduces system load and visual distraction.', low: 'Gentle', normal: 'Standard', high: 'Lively', bubbles: 'Bubble count', backgroundTools: 'Background tools', music: 'Persistent music player', musicHint: 'Shows a compact player at the bottom-right with an expandable music studio.', workspace: 'Workspace', rememberWindows: 'Remember open windows', rememberHint: 'Restores notes, search, English, and course windows after refresh. Closed windows stay closed.', saved: 'Settings are saved in this browser.', reset: 'Reset all settings',
      }

  const updatePreferences = (changes: Partial<AppPreferences>) => onPreferencesChange({ ...preferences, ...changes })

  const animationOptions: Array<{ value: AnimationLevel; label: string }> = [
    { value: 'low', label: copy.low }, { value: 'normal', label: copy.normal }, { value: 'high', label: copy.high },
  ]
  const themeOptions: Array<{ value: ThemeMode; label: string; icon: string }> = [
    { value: 'light', label: copy.light, icon: '☀' },
    { value: 'dark', label: copy.dark, icon: '☾' },
    { value: 'system', label: copy.system, icon: '◐' },
  ]

  return (
    <div className="modal" role="presentation" onMouseDown={onClose}>
      <section className="settings-shell settings-shell-wide" role="dialog" aria-modal="true" aria-labelledby="settings-title" onMouseDown={(event: MouseEvent<HTMLElement>) => event.stopPropagation()}>
        <button className="modal-close" type="button" aria-label={copy.close} onClick={onClose}>×</button>
        <p className="eyebrow">BUBBLE SPACE V2</p>
        <h2 id="settings-title">{copy.title}</h2>
        <p className="settings-subtitle">{copy.subtitle}</p>

        <div className="settings-grid">
          <section className="settings-section">
            <h3>{copy.language}</h3>
            <div className="segmented settings-segmented">
              <button className={`language-option${language === 'zh' ? ' active' : ''}`} type="button" onClick={() => onLanguageChange('zh')}>中文</button>
              <button className={`language-option${language === 'en' ? ' active' : ''}`} type="button" onClick={() => onLanguageChange('en')}>English</button>
            </div>
          </section>

          <section className="settings-section">
            <h3>{copy.appearance}</h3>
            <p className="setting-description">{copy.appearanceHint}</p>
            <div className="segmented settings-segmented theme-options">
              {themeOptions.map((option) => (
                <button className={`language-option${preferences.themeMode === option.value ? ' active' : ''}`} type="button" key={option.value} onClick={() => updatePreferences({ themeMode: option.value })}>
                  <span aria-hidden="true">{option.icon}</span> {option.label}
                </button>
              ))}
            </div>
          </section>

          <section className="settings-section">
            <div className="settings-row"><h3>{copy.fontSize}</h3><output>{fontScale}%</output></div>
            <input className="font-size-range" type="range" min="50" max="125" step="5" value={fontScale} onChange={(event: ChangeEvent<HTMLInputElement>) => onFontScaleChange(Number(event.target.value))} />
            <div className="range-labels font-scale-labels" aria-hidden="true"><span>{copy.fontSmall}</span><span>{copy.fontLarge}</span></div>
          </section>

          <section className="settings-section settings-section-span">
            <div className="settings-row settings-row-start"><div><h3>{copy.motion}</h3><p className="setting-description">{copy.motionHint}</p></div></div>
            <div className="segmented settings-segmented motion-options">
              {animationOptions.map((option) => <button className={`language-option${preferences.animationLevel === option.value ? ' active' : ''}`} type="button" key={option.value} onClick={() => updatePreferences({ animationLevel: option.value })}>{option.label}</button>)}
            </div>
            <div className="settings-row settings-slider-row"><label htmlFor="bubble-count">{copy.bubbles}</label><output>{preferences.bubbleCount}</output></div>
            <input id="bubble-count" className="font-size-range" type="range" min="0" max="36" step="6" value={preferences.bubbleCount} onChange={(event: ChangeEvent<HTMLInputElement>) => updatePreferences({ bubbleCount: Number(event.target.value) })} />
          </section>

          <section className="settings-section">
            <p className="settings-section-kicker">{copy.backgroundTools}</p>
            <div className="settings-toggle-row"><div><h3>{copy.music}</h3><p className="setting-description">{copy.musicHint}</p></div><button className={`settings-switch${preferences.musicEnabled ? ' active' : ''}`} type="button" role="switch" aria-checked={preferences.musicEnabled} onClick={() => updatePreferences({ musicEnabled: !preferences.musicEnabled })}><span /></button></div>
          </section>

          <section className="settings-section">
            <p className="settings-section-kicker">{copy.workspace}</p>
            <div className="settings-toggle-row"><div><h3>{copy.rememberWindows}</h3><p className="setting-description">{copy.rememberHint}</p></div><button className={`settings-switch${preferences.rememberWindows ? ' active' : ''}`} type="button" role="switch" aria-checked={preferences.rememberWindows} onClick={() => updatePreferences({ rememberWindows: !preferences.rememberWindows })}><span /></button></div>
          </section>
        </div>

        <p className="setting-hint settings-save-hint">{copy.saved}</p>
        <button className="secondary-button settings-reset" type="button" onClick={onResetAll}>{copy.reset}</button>
      </section>
    </div>
  )
}
