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
type DrawerPanel = 'curriculum' | 'practice' | null

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
  { id: 'chinese', icon: '文', labelZh: '國文', labelEn: 'Chinese' },
  { id: 'english', icon: 'EN', labelZh: '英文', labelEn: 'English' },
  { id: 'math', icon: '∑', labelZh: '數學', labelEn: 'Math' },
  { id: 'science', icon: '⚗', labelZh: '自然', labelEn: 'Science' },
  { id: 'social', icon: '社', labelZh: '社會', labelEn: 'Social studies' },
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
  const [panel, setPanel] = useState<DrawerPanel>(null)
  const [selectedStage, setSelectedStage] = useState<CurriculumStage>('elementary')
  const [selectedGradeIndex, setSelectedGradeIndex] = useState(0)
  const [plannedSubject, setPlannedSubject] = useState<string>('')

  const copy = language === 'zh'
    ? {
        menu: '主要選單', close: '關閉選單', workspace: '工作視窗', notes: '記事本', search: '新增搜尋視窗', searchHint: '可同時開啟多個',
        learning: '學習', learningHint: '國小・國中・高中', learningSubHint: '國英數自社', guestNote: '登入後即可使用工作視窗、學習選單、月曆與待辦事項。',
        login: '登入或註冊', settings: '設定', curriculum: '課程總覽', curriculumHint: '選擇學段、年級與科目', grade: '年級', subject: '科目',
        planned: '學校課程規劃中', plannedHint: '目前先建立完整的學段、年級與科目骨架，之後再接入章節、單元、教材與練習題。',
        back: '返回主選單', practice: '練習場', practiceHint: '測驗・題庫・單字・遊戲', practiceSubHint: '不綁學校年級的練習工具',
        practiceTitle: '練習場與學習工具', practiceDescription: '這裡放跨年級的練習 App；正式國英數自社教材則留在課程總覽。',
        englishPractice: '英文情境練習', englishPracticeHint: '程度測驗、情境挖空、無限練習、複習與單字工具', open: '開啟', coming: '更多練習工具會陸續加入',
      }
    : {
        menu: 'Main menu', close: 'Close menu', workspace: 'Work windows', notes: 'Notes', search: 'New search window', searchHint: 'Open multiple windows',
        learning: 'Learning', learningHint: 'Elementary · Junior · Senior', learningSubHint: '5 core subjects', guestNote: 'Sign in to unlock work windows, learning, calendar, and to-dos.',
        login: 'Log in or register', settings: 'Settings', curriculum: 'Course browser', curriculumHint: 'Choose school stage, grade, and subject', grade: 'Grade', subject: 'Subject',
        planned: 'School course in planning', plannedHint: 'The school-stage, grade, and subject structure comes first; chapters, lessons, resources, and exercises will be connected next.',
        back: 'Back to main menu', practice: 'Practice lab', practiceHint: 'Tests · banks · words · games', practiceSubHint: 'Practice tools outside the school-grade path',
        practiceTitle: 'Practice lab and learning tools', practiceDescription: 'Cross-grade practice apps live here; formal school-subject lessons stay in the course browser.',
        englishPractice: 'English context practice', englishPracticeHint: 'Placement, context cloze, continuous practice, review, and vocabulary tools', open: 'Open', coming: 'More practice tools will be added later',
      }

  const currentStage = CURRICULUM_STAGES.find((stage) => stage.id === selectedStage) ?? CURRICULUM_STAGES[0]
  const currentGrades = language === 'zh' ? currentStage.gradesZh : currentStage.gradesEn
  const selectedGrade = currentGrades[selectedGradeIndex] ?? currentGrades[0]

  const closeAll = () => {
    setPanel(null)
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
    const subjectLabel = language === 'zh' ? subject.labelZh : subject.labelEn
    setPlannedSubject(`${selectedGrade} · ${subjectLabel}`)
  }

  const togglePanel = (nextPanel: Exclude<DrawerPanel, null>) => {
    setPlannedSubject('')
    setPanel((current) => current === nextPanel ? null : nextPanel)
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
                className={`curriculum-entry${panel === 'curriculum' ? ' active' : ''}`}
                type="button"
                aria-expanded={panel === 'curriculum'}
                aria-controls="curriculum-curtain"
                onClick={() => togglePanel('curriculum')}
              >
                <span className="curriculum-entry-icon" aria-hidden="true">▦</span>
                <span className="curriculum-entry-copy">
                  <strong>{copy.curriculum}</strong>
                  <small>{copy.learningHint}</small>
                  <em>{copy.learningSubHint}</em>
                </span>
                <span className="curriculum-entry-arrow" aria-hidden="true">›</span>
              </button>

              <button
                className={`curriculum-entry practice-entry${panel === 'practice' ? ' active' : ''}`}
                type="button"
                aria-expanded={panel === 'practice'}
                aria-controls="practice-curtain"
                onClick={() => togglePanel('practice')}
              >
                <span className="curriculum-entry-icon practice-entry-icon" aria-hidden="true">◇</span>
                <span className="curriculum-entry-copy">
                  <strong>{copy.practice}</strong>
                  <small>{copy.practiceHint}</small>
                  <em>{copy.practiceSubHint}</em>
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
          setPanel(null)
          onOpenSettings()
        }}>
          <span className="settings-icon" aria-hidden="true">⚙</span><span>{copy.settings}</span><span className="settings-arrow" aria-hidden="true">›</span>
        </button>
      </aside>

      {loggedIn ? (
        <section
          id="curriculum-curtain"
          className={`curriculum-curtain${open && panel === 'curriculum' ? ' open' : ''}`}
          aria-hidden={!(open && panel === 'curriculum')}
        >
          <header className="curriculum-curtain-head">
            <button className="curriculum-back" type="button" onClick={() => setPanel(null)}>‹ <span>{copy.back}</span></button>
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
                  <small>{copy.planned}</small>
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

      {loggedIn ? (
        <section
          id="practice-curtain"
          className={`curriculum-curtain practice-curtain${open && panel === 'practice' ? ' open' : ''}`}
          aria-hidden={!(open && panel === 'practice')}
        >
          <header className="curriculum-curtain-head practice-curtain-head">
            <button className="curriculum-back" type="button" onClick={() => setPanel(null)}>‹ <span>{copy.back}</span></button>
            <div>
              <p className="eyebrow">PRACTICE LAB</p>
              <h2>{copy.practiceTitle}</h2>
              <span>{copy.practiceDescription}</span>
            </div>
          </header>

          <section className="practice-tool-list">
            <button className="practice-tool-card" type="button" onClick={() => openDesktopApp('english')}>
              <span className="practice-tool-icon">EN</span>
              <span className="practice-tool-copy">
                <strong>{copy.englishPractice}</strong>
                <small>{copy.englishPracticeHint}</small>
              </span>
              <span className="practice-tool-open">{copy.open} ›</span>
            </button>
          </section>

          <div className="practice-coming-note">
            <span>＋</span>
            <p>{copy.coming}</p>
          </div>
        </section>
      ) : null}

      {open ? <button className="drawer-backdrop" type="button" aria-label={copy.close} onClick={closeAll} /> : null}
    </>
  )
}
