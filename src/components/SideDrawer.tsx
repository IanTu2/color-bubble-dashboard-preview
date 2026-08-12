import { useState } from 'react'
import {
  getCurriculumRouteOptions,
  getCurriculumTrack,
  type CurriculumPathwayId,
  type CurriculumSemester,
  type CurriculumSubjectId,
} from '../curriculum-plan-v5'
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
  onOpenCourse: (grade: number, subject: CurriculumSubjectId, pathway?: CurriculumPathwayId) => void
}

type DrawerPanel = 'curriculum' | 'practice' | null

type GradeGroup = {
  id: 'elementary' | 'junior' | 'senior'
  labelZh: string
  labelEn: string
  grades: number[]
}

const GRADE_GROUPS: GradeGroup[] = [
  { id: 'elementary', labelZh: '國小', labelEn: 'Elementary', grades: [1, 2, 3, 4, 5, 6] },
  { id: 'junior', labelZh: '國中', labelEn: 'Junior high', grades: [7, 8, 9] },
  { id: 'senior', labelZh: '高中', labelEn: 'Senior high', grades: [10, 11, 12] },
]

function gradeLabel(grade: number, language: Language) {
  if (language === 'en') return `Grade ${grade}`
  if (grade <= 6) return `${['一', '二', '三', '四', '五', '六'][grade - 1]}年級`
  if (grade <= 9) return `${['七', '八', '九'][grade - 7]}年級`
  return `高${['一', '二', '三'][grade - 10]}`
}

export function SideDrawer({ language, open, loggedIn, onToggle, onClose, onOpenSettings, onOpenAuth, onOpenDesktopApp, onOpenCourse }: SideDrawerProps) {
  const [panel, setPanel] = useState<DrawerPanel>(null)
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null)
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null)
  const [selectedSemester, setSelectedSemester] = useState<CurriculumSemester>(1)

  const copy = language === 'zh'
    ? {
        menu: '主要選單', close: '關閉選單', workspace: '工作視窗', notes: '記事本', search: '新增搜尋視窗', searchHint: '可同時開啟多個',
        learning: '學習', learningHint: '國小・國中・高中', learningSubHint: '依年級顯示正式課程路線', guestNote: '登入後即可使用工作視窗、學習選單、月曆與待辦事項。',
        login: '登入或註冊', settings: '設定', curriculum: '課程總覽', chooseGrade: '選擇年級', chooseGradeHint: '一年級到高三，直式排列',
        chooseSubject: '選擇課程', roadmap: '課程內容', roadmapHint: '選擇學期與單元，再進入正式教學',
        semesterOne: '上學期', semesterTwo: '下學期', sourceNote: '依十二年國教領域／科目結構整理，不綁定單一出版社版本。', startCourse: '開始上課 →', lessons: '觀念・示範・練習・解析',
        practice: '練習場', practiceHint: '測驗・題庫・單字・遊戲', practiceSubHint: '不綁學校年級的練習工具', practiceTitle: '練習場與學習工具',
        practiceDescription: '跨年級練習 App 放這裡；正式教材走課程總覽。', englishPractice: '英文情境練習', englishPracticeHint: '程度測驗、情境挖空、無限練習、複習與單字工具', open: '開啟', coming: '更多練習工具會陸續加入',
      }
    : {
        menu: 'Main menu', close: 'Close menu', workspace: 'Work windows', notes: 'Notes', search: 'New search window', searchHint: 'Open multiple windows',
        learning: 'Learning', learningHint: 'Elementary · Junior · Senior', learningSubHint: 'Grade-correct curriculum routes', guestNote: 'Sign in to unlock work windows, learning, calendar, and to-dos.',
        login: 'Log in or register', settings: 'Settings', curriculum: 'Course browser', chooseGrade: 'Choose grade', chooseGradeHint: 'Grades 1–12 in one vertical list',
        chooseSubject: 'Choose course', roadmap: 'Course content', roadmapHint: 'Choose semester and unit, then enter the formal lesson',
        semesterOne: 'Semester 1', semesterTwo: 'Semester 2', sourceNote: 'Aligned to Taiwan curriculum domains/subjects without binding to one publisher.', startCourse: 'Start course →', lessons: 'Concept · example · practice · explanation',
        practice: 'Practice lab', practiceHint: 'Tests · banks · words · games', practiceSubHint: 'Practice tools outside the school-grade path', practiceTitle: 'Practice lab and learning tools',
        practiceDescription: 'Cross-grade apps stay here; formal subjects use the course browser.', englishPractice: 'English context practice', englishPracticeHint: 'Placement, context cloze, continuous practice, review, and vocabulary tools', open: 'Open', coming: 'More practice tools will be added later',
      }

  const routeOptions = selectedGrade ? getCurriculumRouteOptions(selectedGrade) : []
  const selectedRoute = routeOptions.find((item) => item.id === selectedRouteId) ?? null
  const selectedTrack = selectedGrade && selectedRoute
    ? getCurriculumTrack(selectedGrade, selectedRoute.subject, selectedRoute.pathway)
    : null
  const selectedSemesterPlan = selectedTrack?.semesters.find((item) => item.semester === selectedSemester) ?? null

  const resetCoursePath = () => {
    setSelectedGrade(null)
    setSelectedRouteId(null)
    setSelectedSemester(1)
  }

  const closeAll = () => {
    setPanel(null)
    resetCoursePath()
    onClose()
  }

  const openDesktopApp = (app: DesktopAppKind) => {
    closeAll()
    onOpenDesktopApp(app)
  }

  const openCourse = () => {
    if (!selectedGrade || !selectedRoute) return
    const grade = selectedGrade
    const { subject, pathway } = selectedRoute
    closeAll()
    onOpenCourse(grade, subject, pathway)
  }

  return (
    <>
      <button className="drawer-trigger" type="button" aria-label={copy.menu} aria-expanded={open} onClick={onToggle}><span /><span /><span /></button>

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
              <button className={`curriculum-entry${panel === 'curriculum' ? ' active' : ''}`} type="button" onClick={() => {
                resetCoursePath()
                setPanel((current) => current === 'curriculum' ? null : 'curriculum')
              }}>
                <span className="curriculum-entry-icon">▦</span><span className="curriculum-entry-copy"><strong>{copy.curriculum}</strong><small>{copy.learningHint}</small><em>{copy.learningSubHint}</em></span><span className="curriculum-entry-arrow">›</span>
              </button>
              <button className={`curriculum-entry practice-entry${panel === 'practice' ? ' active' : ''}`} type="button" onClick={() => {
                resetCoursePath()
                setPanel((current) => current === 'practice' ? null : 'practice')
              }}>
                <span className="curriculum-entry-icon practice-entry-icon">◇</span><span className="curriculum-entry-copy"><strong>{copy.practice}</strong><small>{copy.practiceHint}</small><em>{copy.practiceSubHint}</em></span><span className="curriculum-entry-arrow">›</span>
              </button>
            </nav>
          </>
        ) : (
          <div className="guest-drawer-note"><span className="note-orb">✦</span><div><p>{copy.guestNote}</p><button className="drawer-login-button" type="button" onClick={() => { closeAll(); onOpenAuth() }}>{copy.login}</button></div></div>
        )}

        <button className="settings-button" type="button" onClick={() => { setPanel(null); resetCoursePath(); onOpenSettings() }}><span className="settings-icon">⚙</span><span>{copy.settings}</span><span className="settings-arrow">›</span></button>
      </aside>

      {loggedIn ? (
        <section className={`curriculum-layer curriculum-grade-curtain${selectedGrade ? ' rail' : ''}${open && panel === 'curriculum' ? ' open' : ''}`} aria-hidden={!(open && panel === 'curriculum')}>
          <header className="curriculum-layer-head">
            <button type="button" aria-label={language === 'zh' ? '返回主選單' : 'Back to main menu'} onClick={() => setPanel(null)}>‹</button>
            <div><p>COURSE · 01</p><h2>{copy.chooseGrade}</h2><span>{copy.chooseGradeHint}</span></div>
            {selectedGrade ? <span className="curriculum-rail-label">{gradeLabel(selectedGrade, language)}</span> : null}
          </header>
          <div className="curriculum-vertical-scroll">
            {GRADE_GROUPS.map((group) => (
              <section className="curriculum-grade-group" key={group.id}>
                <h3>{language === 'zh' ? group.labelZh : group.labelEn}</h3>
                <div className="curriculum-vertical-list">
                  {group.grades.map((grade) => (
                    <button type="button" className={selectedGrade === grade ? 'active' : ''} key={grade} onClick={() => { setSelectedGrade(grade); setSelectedRouteId(null); setSelectedSemester(1) }}>
                      <span className="curriculum-list-index">{String(grade).padStart(2, '0')}</span><span className="curriculum-list-copy"><strong>{gradeLabel(grade, language)}</strong><small>{language === 'zh' ? '查看本年級課程路線' : 'Browse this grade’s course routes'}</small></span><i>›</i>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      ) : null}

      {loggedIn && selectedGrade ? (
        <section className={`curriculum-layer curriculum-subject-curtain${selectedRoute ? ' rail' : ''}${open && panel === 'curriculum' ? ' open' : ''}`} aria-hidden={!(open && panel === 'curriculum')}>
          <header className="curriculum-layer-head">
            <button type="button" aria-label={language === 'zh' ? '返回年級' : 'Back to grades'} onClick={() => { setSelectedGrade(null); setSelectedRouteId(null) }}>‹</button>
            <div><p>COURSE · 02</p><h2>{copy.chooseSubject}</h2><span>{gradeLabel(selectedGrade, language)} · {language === 'zh' ? '依本年級正式結構顯示' : 'Routes reflect this grade structure'}</span></div>
            {selectedRoute ? <span className="curriculum-rail-label">{language === 'zh' ? selectedRoute.labelZh : selectedRoute.labelEn}</span> : null}
          </header>
          <div className="curriculum-vertical-scroll">
            <div className="curriculum-vertical-list curriculum-subject-list">
              {routeOptions.map((route) => (
                <button type="button" className={selectedRoute?.id === route.id ? 'active' : ''} key={route.id} onClick={() => { setSelectedRouteId(route.id); setSelectedSemester(1) }}>
                  <span className={`curriculum-list-icon subject-${route.subject} pathway-${route.id}`}>{route.icon}</span><span className="curriculum-list-copy"><strong>{language === 'zh' ? route.labelZh : route.labelEn}</strong><small>{route.extension ? (language === 'zh' ? `校本／平台延伸 · ${route.hintZh}` : `School/platform extension · ${route.hintEn}`) : language === 'zh' ? route.hintZh : route.hintEn}</small></span><i>›</i>
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {loggedIn && selectedGrade && selectedRoute && selectedTrack ? (
        <section className={`curriculum-layer curriculum-content-curtain${open && panel === 'curriculum' ? ' open' : ''}`} aria-hidden={!(open && panel === 'curriculum')}>
          <header className="curriculum-layer-head"><button type="button" aria-label={language === 'zh' ? '返回課程' : 'Back to courses'} onClick={() => setSelectedRouteId(null)}>‹</button><div><p>COURSE · 03</p><h2>{copy.roadmap}</h2><span>{gradeLabel(selectedGrade, language)} · {language === 'zh' ? selectedRoute.labelZh : selectedRoute.labelEn}</span></div></header>
          <div className="curriculum-content-body">
            <div className="curriculum-roadmap-intro"><strong>{copy.roadmapHint}</strong><p>{selectedTrack.note ?? copy.sourceNote}</p></div>
            <div className="curriculum-semester-tabs" role="tablist"><button type="button" className={selectedSemester === 1 ? 'active' : ''} onClick={() => setSelectedSemester(1)}>{copy.semesterOne}</button><button type="button" className={selectedSemester === 2 ? 'active' : ''} onClick={() => setSelectedSemester(2)}>{copy.semesterTwo}</button></div>
            <div className="curriculum-unit-list">
              {selectedSemesterPlan?.units.map((unit, index) => (
                <article className="curriculum-unit-card" key={unit.id}><div className="curriculum-unit-index">{String(index + 1).padStart(2, '0')}</div><div className="curriculum-unit-copy"><div className="curriculum-unit-title-row"><strong>{unit.title}</strong></div><p>{unit.focus}</p><small>{copy.lessons}</small></div></article>
              ))}
            </div>
            <button className="curriculum-start-course" type="button" onClick={openCourse}>{copy.startCourse}</button>
          </div>
        </section>
      ) : null}

      {loggedIn ? (
        <section id="practice-curtain" className={`curriculum-curtain practice-curtain${open && panel === 'practice' ? ' open' : ''}`} aria-hidden={!(open && panel === 'practice')}>
          <header className="curriculum-curtain-head practice-curtain-head"><button className="curriculum-back" type="button" onClick={() => setPanel(null)}>‹</button><div><p className="eyebrow">PRACTICE LAB</p><h2>{copy.practiceTitle}</h2><span>{copy.practiceDescription}</span></div></header>
          <section className="practice-tool-list"><button className="practice-tool-card" type="button" onClick={() => openDesktopApp('english')}><span className="practice-tool-icon">EN</span><span className="practice-tool-copy"><strong>{copy.englishPractice}</strong><small>{copy.englishPracticeHint}</small></span><span className="practice-tool-open">{copy.open} ›</span></button></section>
          <div className="practice-coming-note"><span>＋</span><p>{copy.coming}</p></div>
        </section>
      ) : null}

      {open ? <button className="drawer-backdrop" type="button" aria-label={copy.close} onClick={closeAll} /> : null}
    </>
  )
}
