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

type CurriculumStage = 'elementary' | 'junior' | 'senior'

type CurriculumStageOption = {
  id: CurriculumStage
  labelZh: string
  labelEn: string
  rangeZh: string
  rangeEn: string
  gradesZh: string[]
  gradesEn: string[]
}

type CurriculumSubject = {
  id: 'chinese' | 'english' | 'math' | 'science' | 'social'
  icon: string
  labelZh: string
  labelEn: string
  available: boolean
}

const CURRICULUM_STAGES: CurriculumStageOption[] = [
  {
    id: 'elementary',
    labelZh: '國小',
    labelEn: 'Elementary',
    rangeZh: '一年級～六年級',
    rangeEn: 'Grades 1–6',
    gradesZh: ['一年級', '二年級', '三年級', '四年級', '五年級', '六年級'],
    gradesEn: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'],
  },
  {
    id: 'junior',
    labelZh: '國中',
    labelEn: 'Junior high',
    rangeZh: '七年級～九年級',
    rangeEn: 'Grades 7–9',
    gradesZh: ['七年級', '八年級', '九年級'],
    gradesEn: ['Grade 7', 'Grade 8', 'Grade 9'],
  },
  {
    id: 'senior',
    labelZh: '高中',
    labelEn: 'Senior high',
    rangeZh: '高一～高三',
    rangeEn: 'Grades 10–12',
    gradesZh: ['高一', '高二', '高三'],
    gradesEn: ['Grade 10', 'Grade 11', 'Grade 12'],
  },
]

const CURRICULUM_SUBJECTS: CurriculumSubject[] = [
  { id: 'chinese', icon: '文', labelZh: '國文', labelEn: 'Chinese', available: false },
  { id: 'english', icon: 'EN', labelZh: '英文', labelEn: 'English', available: true },
  { id: 'math', icon: '∑', labelZh: '數學', labelEn: 'Math', available: false },
  { id: 'science', icon: '⚗', labelZh: '自然', labelEn: 'Science', available: false },
  { id: 'social', icon: '社', labelZh: '社會', labelEn: 'Social studies', available: false },
]

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
  const [curriculumOpen, setCurriculumOpen] = useState(false)
  const [selectedStage, setSelectedStage] = useState<CurriculumStage>('elementary')
  const [selectedGradeIndex, setSelectedGradeIndex] = useState(0)
  const [plannedSubject, setPlannedSubject] = useState<string>('')

  const copy = language === 'zh'
    ? {
        menu: '主要選單', close: '關閉選單', workspace: '工作視窗', notes: '記事本', search: '新增搜尋視窗', searchHint: '可同時開啟多個',
        learning: '學習課程', learningHint: '國小・國中・高中', learningSubHint: '國英數自社', guestNote: '登入後即可使用工作視窗、學習選單、月曆與待辦事項。',
        login: '登入或註冊', settings: '設定', curriculum: '課程總覽', curriculumHint: '選擇學段、年級與科目', grade: '年級', subject: '科目',
        existingEnglish: '開啟現有英文學習', planned: '課程內容規劃中', plannedHint: '目前先完成學習架構，之後再逐步接入教材、題庫與學習進度。',
        back: '返回主選單',
      }
    : {
        menu: 'Main menu', close: 'Close menu', workspace: 'Work windows', notes: 'Notes', search: 'New search window', searchHint: 'Open multiple windows',
        learning: 'Learning courses', learningHint: 'Elementary · Junior · Senior', learningSubHint: '5 core subjects', guestNote: 'Sign in to unlock work windows, learning, calendar, and to-dos.',
        login: 'Log in or register', settings: 'Settings', curriculum: 'Course browser', curriculumHint: 'Choose school stage, grade, and subject', grade: 'Grade', subject: 'Subject',
        existingEnglish: 'Open current English learning', planned: 'Course content is being planned', plannedHint: 'The curriculum structure is ready first; lessons, exercises, and progress tracking will be connected gradually.',
        back: 'Back to main menu',
      }

  const currentStage = CURRICULUM_STAGES.find((stage) => stage.id === selectedStage) ?? CURRICULUM_STAGES[0]
  const currentGrades = language === 'zh' ? currentStage.gradesZh : currentStage.gradesEn
  const selectedGrade = currentGrades[selectedGradeIndex] ?? currentGrades[0]

  const closeAll = () => {
    setCurriculumOpen(false)
    setPlannedSubject('')
    onClose()
  }

  const openAuth = () => {
    closeAll()
    onOpenAuth()
  }

  const openDesktopApp = (app: DesktopAppKind) => {
    closeAll()
    onOpenDesktopApp(app)
  }

  const chooseStage = (stage: CurriculumStage) => {
    setSelectedStage(stage)
    setSelectedGradeIndex(0)
    setPlannedSubject('')
  }

  const chooseSubject = (subject: CurriculumSubject) => {
    if (subject.id === 'english' && subject.available) {
      openDesktopApp('english')
      return
    }

    const subjectLabel = language === 'zh' ? subject.labelZh : subject.labelEn
    setPlannedSubject(`${selectedGrade} · ${subjectLabel}`)
  }

  return (
    <>
      <button className="drawer-trigger" type="button" aria-label={copy.menu} aria-expanded={open} onClick={onToggle}>
        <span /><span /><span />
      </button>

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
              <button
                className={`curriculum-entry${curriculumOpen ? ' active' : ''}`}
                type="button"
                aria-expanded={curriculumOpen}
                aria-controls="curriculum-curtain"
                onClick={() => {
                  setCurriculumOpen((current) => !current)
                  setPlannedSubject('')
                }}
              >
                <span className="curriculum-entry-icon" aria-hidden="true">▦</span>
                <span className="curriculum-entry-copy">
                  <strong>{copy.curriculum}</strong>
                  <small>{copy.learningHint}</small>
                  <em>{copy.learningSubHint}</em>
                </span>
                <span className="curriculum-entry-arrow" aria-hidden="true">›</span>
              </button>
            </nav>
          </>
        ) : (
          <div className="guest-drawer-note">
            <span className="note-orb">✦</span>
            <div><p>{copy.guestNote}</p><button className="drawer-login-button" type="button" onClick={openAuth}>{copy.login}</button></div>
          </div>
        )}

        <button className="settings-button" type="button" onClick={() => {
          setCurriculumOpen(false)
          onOpenSettings()
        }}>
          <span className="settings-icon" aria-hidden="true">⚙</span><span>{copy.settings}</span><span className="settings-arrow" aria-hidden="true">›</span>
        </button>
      </aside>

      {loggedIn ? (
        <section
          id="curriculum-curtain"
          className={`curriculum-curtain${open && curriculumOpen ? ' open' : ''}`}
          aria-hidden={!(open && curriculumOpen)}
        >
          <header className="curriculum-curtain-head">
            <button className="curriculum-back" type="button" onClick={() => setCurriculumOpen(false)}>‹ <span>{copy.back}</span></button>
            <div>
              <p className="eyebrow">LEARNING MAP</p>
              <h2>{copy.curriculum}</h2>
              <span>{copy.curriculumHint}</span>
            </div>
          </header>

          <div className="curriculum-stage-tabs" role="tablist" aria-label={copy.learning}>
            {CURRICULUM_STAGES.map((stage) => {
              const active = stage.id === selectedStage
              return (
                <button
                  className={active ? 'active' : ''}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  key={stage.id}
                  onClick={() => chooseStage(stage.id)}
                >
                  <strong>{language === 'zh' ? stage.labelZh : stage.labelEn}</strong>
                  <small>{language === 'zh' ? stage.rangeZh : stage.rangeEn}</small>
                </button>
              )
            })}
          </div>

          <section className="curriculum-section">
            <div className="curriculum-section-title"><span>01</span><strong>{copy.grade}</strong></div>
            <div className="curriculum-grade-grid">
              {currentGrades.map((grade, index) => (
                <button
                  className={selectedGradeIndex === index ? 'active' : ''}
                  type="button"
                  key={grade}
                  onClick={() => {
                    setSelectedGradeIndex(index)
                    setPlannedSubject('')
                  }}
                >
                  {grade}
                </button>
              ))}
            </div>
          </section>

          <section className="curriculum-section">
            <div className="curriculum-section-title"><span>02</span><strong>{copy.subject}</strong><small>{selectedGrade}</small></div>
            <div className="curriculum-subject-grid">
              {CURRICULUM_SUBJECTS.map((subject) => (
                <button type="button" key={subject.id} onClick={() => chooseSubject(subject)}>
                  <span className={`subject-icon subject-${subject.id}`}>{subject.icon}</span>
                  <strong>{language === 'zh' ? subject.labelZh : subject.labelEn}</strong>
                  <small>{subject.available ? copy.existingEnglish : copy.planned}</small>
                  <i aria-hidden="true">›</i>
                </button>
              ))}
            </div>
          </section>

          {plannedSubject ? (
            <div className="curriculum-planned-note" role="status">
              <span>✦</span>
              <div><strong>{plannedSubject}</strong><p>{copy.plannedHint}</p></div>
            </div>
          ) : null}
        </section>
      ) : null}

      {open ? <button className="drawer-backdrop" type="button" aria-label={copy.close} onClick={closeAll} /> : null}
    </>
  )
}
