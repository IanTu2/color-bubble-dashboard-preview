import { useState } from 'react'
import {
  getCurriculumTrack,
  gradeNumberFromStage,
  type CurriculumSemester,
  type CurriculumSubjectId,
} from '../curriculum-plan'
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
  onOpenCourse: (grade: number, subject: CurriculumSubjectId) => void
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
  id: CurriculumSubjectId
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
  onOpenCourse,
}: SideDrawerProps) {
  const [panel, setPanel] = useState<DrawerPanel>(null)
  const [selectedStage, setSelectedStage] = useState<CurriculumStage>('elementary')
  const [selectedGradeIndex, setSelectedGradeIndex] = useState(0)
  const [selectedSubject, setSelectedSubject] = useState<CurriculumSubjectId | null>(null)
  const [selectedSemester, setSelectedSemester] = useState<CurriculumSemester>(1)

  const copy = language === 'zh'
    ? {
        menu: '主要選單', close: '關閉選單', workspace: '工作視窗', notes: '記事本', search: '新增搜尋視窗', searchHint: '可同時開啟多個',
        learning: '學習', learningHint: '國小・國中・高中', learningSubHint: '國英數自社', guestNote: '登入後即可使用工作視窗、學習選單、月曆與待辦事項。',
        login: '登入或註冊', settings: '設定', curriculum: '課程總覽', curriculumHint: '選擇學段、年級與科目', grade: '年級', subject: '科目',
        roadmap: '課程規劃', roadmapHint: '依十二年國教領域方向整理的平台課程藍圖', viewPlan: '查看課程規劃', semesterOne: '上學期', semesterTwo: '下學期',
        sourceNote: '這是 Bubble Space 依官方課綱學習方向整理的課程藍圖，不是特定出版社課本目錄。', plannedLessons: '6 課教學流程已規劃', startCourse: '進入正式課程 →',
        foundation: '基礎', core: '核心', stretch: '延伸',
        back: '返回主選單', practice: '練習場', practiceHint: '測驗・題庫・單字・遊戲', practiceSubHint: '不綁學校年級的練習工具',
        practiceTitle: '練習場與學習工具', practiceDescription: '這裡放跨年級的練習 App；正式國英數自社教材則留在課程總覽。',
        englishPractice: '英文情境練習', englishPracticeHint: '程度測驗、情境挖空、無限練習、複習與單字工具', open: '開啟', coming: '更多練習工具會陸續加入',
      }
    : {
        menu: 'Main menu', close: 'Close menu', workspace: 'Work windows', notes: 'Notes', search: 'New search window', searchHint: 'Open multiple windows',
        learning: 'Learning', learningHint: 'Elementary · Junior · Senior', learningSubHint: '5 core subjects', guestNote: 'Sign in to unlock work windows, learning, calendar, and to-dos.',
        login: 'Log in or register', settings: 'Settings', curriculum: 'Course browser', curriculumHint: 'Choose school stage, grade, and subject', grade: 'Grade', subject: 'Subject',
        roadmap: 'Course roadmap', roadmapHint: 'Bubble Space roadmap aligned to Taiwan curriculum domains', viewPlan: 'View roadmap', semesterOne: 'Semester 1', semesterTwo: 'Semester 2',
        sourceNote: 'This is a Bubble Space learning roadmap aligned to official curriculum directions, not a textbook publisher table of contents.', plannedLessons: '6-lesson learning flow planned', startCourse: 'Open formal course →',
        foundation: 'Foundation', core: 'Core', stretch: 'Stretch',
        back: 'Back to main menu', practice: 'Practice lab', practiceHint: 'Tests · banks · words · games', practiceSubHint: 'Practice tools outside the school-grade path',
        practiceTitle: 'Practice lab and learning tools', practiceDescription: 'Cross-grade practice apps live here; formal school-subject lessons stay in the course browser.',
        englishPractice: 'English context practice', englishPracticeHint: 'Placement, context cloze, continuous practice, review, and vocabulary tools', open: 'Open', coming: 'More practice tools will be added later',
      }

  const currentStage = CURRICULUM_STAGES.find((stage) => stage.id === selectedStage) ?? CURRICULUM_STAGES[0]
  const currentGrades = language === 'zh' ? currentStage.gradesZh : currentStage.gradesEn
  const selectedGrade = currentGrades[selectedGradeIndex] ?? currentGrades[0]
  const selectedGradeNumber = gradeNumberFromStage(selectedStage, selectedGradeIndex)
  const selectedSubjectMeta = CURRICULUM_SUBJECTS.find((subject) => subject.id === selectedSubject) ?? null
  const selectedTrack = selectedSubject ? getCurriculumTrack(selectedGradeNumber, selectedSubject) : null
  const selectedSemesterPlan = selectedTrack?.semesters.find((item) => item.semester === selectedSemester) ?? null

  const resetCurriculumSelection = () => {
    setSelectedSubject(null)
    setSelectedSemester(1)
  }

  const closeAll = () => {
    setPanel(null)
    resetCurriculumSelection()
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

  const openCourse = () => {
    if (!selectedSubject) return
    const grade = selectedGradeNumber
    const subject = selectedSubject
    closeAll()
    onOpenCourse(grade, subject)
  }

  const chooseStage = (stage: CurriculumStage) => {
    setSelectedStage(stage)
    setSelectedGradeIndex(0)
    resetCurriculumSelection()
  }

  const chooseSubject = (subject: CurriculumSubject) => {
    setSelectedSubject(subject.id)
    setSelectedSemester(1)
  }

  const togglePanel = (nextPanel: Exclude<DrawerPanel, null>) => {
    resetCurriculumSelection()
    setPanel((current) => current === nextPanel ? null : nextPanel)
  }

  const difficultyLabel = (band: 'foundation' | 'core' | 'stretch') => {
    if (band === 'foundation') return copy.foundation
    if (band === 'stretch') return copy.stretch
    return copy.core
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
          resetCurriculumSelection()
          onOpenSettings()
        }}>
          <span className="settings-icon" aria-hidden="true">⚙</span><span>{copy.settings}</span><span className="settings-arrow" aria-hidden="true">›</span>
        </button>
      </aside>

      {loggedIn ? (
        <section
          id="curriculum-curtain"
          className={`curriculum-curtain curriculum-roadmap-curtain${open && panel === 'curriculum' ? ' open' : ''}`}
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
                    resetCurriculumSelection()
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
                <button
                  className={selectedSubject === subject.id ? 'active' : ''}
                  type="button"
                  key={subject.id}
                  onClick={() => chooseSubject(subject)}
                >
                  <span className={`subject-icon subject-${subject.id}`}>{subject.icon}</span>
                  <strong>{language === 'zh' ? subject.labelZh : subject.labelEn}</strong>
                  <small>{copy.viewPlan}</small>
                  <i aria-hidden="true">›</i>
                </button>
              ))}
            </div>
          </section>

          {selectedTrack && selectedSubjectMeta ? (
            <section className="curriculum-section curriculum-roadmap-section">
              <div className="curriculum-section-title">
                <span>03</span>
                <strong>{copy.roadmap}</strong>
                <small>{selectedGrade} · {language === 'zh' ? selectedSubjectMeta.labelZh : selectedSubjectMeta.labelEn}</small>
              </div>

              <div className="curriculum-roadmap-intro">
                <strong>{copy.roadmapHint}</strong>
                <p>{selectedTrack.note ?? copy.sourceNote}</p>
              </div>

              <div className="curriculum-semester-tabs" role="tablist" aria-label={copy.roadmap}>
                <button type="button" role="tab" aria-selected={selectedSemester === 1} className={selectedSemester === 1 ? 'active' : ''} onClick={() => setSelectedSemester(1)}>{copy.semesterOne}</button>
                <button type="button" role="tab" aria-selected={selectedSemester === 2} className={selectedSemester === 2 ? 'active' : ''} onClick={() => setSelectedSemester(2)}>{copy.semesterTwo}</button>
              </div>

              <div className="curriculum-unit-list">
                {selectedSemesterPlan?.units.map((unit, index) => (
                  <article className="curriculum-unit-card" key={unit.id}>
                    <div className="curriculum-unit-index">{String(index + 1).padStart(2, '0')}</div>
                    <div className="curriculum-unit-copy">
                      <div className="curriculum-unit-title-row">
                        <strong>{unit.title}</strong>
                        <span className={`difficulty-${unit.difficultyBand}`}>{difficultyLabel(unit.difficultyBand)}</span>
                      </div>
                      <p>{unit.focus}</p>
                      <small>{copy.plannedLessons}</small>
                    </div>
                  </article>
                ))}
              </div>

              <button className="curriculum-start-course" type="button" onClick={openCourse}>{copy.startCourse}</button>
            </section>
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
