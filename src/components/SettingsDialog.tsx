import type { ChangeEvent, MouseEvent } from 'react'
import type { Language } from '../types'

type SettingsDialogProps = {
  language: Language
  fontScale: number
  open: boolean
  onClose: () => void
  onLanguageChange: (language: Language) => void
  onFontScaleChange: (fontScale: number) => void
}

export function SettingsDialog({
  language,
  fontScale,
  open,
  onClose,
  onLanguageChange,
  onFontScaleChange,
}: SettingsDialogProps) {
  if (!open) {
    return null
  }

  const copy =
    language === 'zh'
      ? {
          close: '關閉',
          title: '顯示設定',
          subtitle: '調整適合你的語言與閱讀大小。',
          language: '語言',
          fontSize: '字體大小',
          hint: '設定會保存在這個瀏覽器中。',
          reset: '恢復標準大小',
        }
      : {
          close: 'Close',
          title: 'Display settings',
          subtitle: 'Adjust the language and reading size.',
          language: 'Language',
          fontSize: 'Font size',
          hint: 'Settings are saved in this browser.',
          reset: 'Reset font size',
        }

  return (
    <div className="modal" role="presentation" onMouseDown={onClose}>
      <section
        className="settings-shell"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onMouseDown={(event: MouseEvent<HTMLElement>) => event.stopPropagation()}
      >
        <button className="modal-close" type="button" aria-label={copy.close} onClick={onClose}>×</button>
        <p className="eyebrow">BUBBLE SPACE V2</p>
        <h2 id="settings-title">{copy.title}</h2>
        <p className="settings-subtitle">{copy.subtitle}</p>

        <section className="settings-section">
          <h3>{copy.language}</h3>
          <div className="segmented settings-segmented">
            <button className={`language-option${language === 'zh' ? ' active' : ''}`} type="button" onClick={() => onLanguageChange('zh')}>中文</button>
            <button className={`language-option${language === 'en' ? ' active' : ''}`} type="button" onClick={() => onLanguageChange('en')}>English</button>
          </div>
        </section>

        <section className="settings-section">
          <div className="settings-row">
            <h3>{copy.fontSize}</h3>
            <output>{fontScale}%</output>
          </div>
          <input
            className="font-size-range"
            type="range"
            min="85"
            max="125"
            step="5"
            value={fontScale}
            onChange={(event: ChangeEvent<HTMLInputElement>) => onFontScaleChange(Number(event.target.value))}
          />
          <div className="range-labels" aria-hidden="true"><span>A</span><span>A</span></div>
          <p className="setting-hint">{copy.hint}</p>
          <button className="secondary-button settings-reset" type="button" onClick={() => onFontScaleChange(100)}>{copy.reset}</button>
        </section>
      </section>
    </div>
  )
}
