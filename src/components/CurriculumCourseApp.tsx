import { useMemo, useState } from 'react'
import {
  getCurriculumCourseBundle,
  readCurriculumFeedback,
  readCurriculumProgress,
  saveCurriculumFeedback,
  writeCurriculumProgress,
  type CurriculumDifficultyFeedback,
  type CurriculumLessonPlan,
  type CurriculumUnitBundle,
} from '../curriculum-course-engine'
import type { CurriculumSemester, CurriculumSubjectId } from '../curriculum-plan'
import type { Language } from '../types'

export type CurriculumCourseSelection = {
  grade: number
  subject: CurriculumSubjectId
}

type Props = CurriculumCourseSelection & {
  language: Language
  userId: string
}

const SUBJECT_META: Record<CurriculumSubjectId, { zh: string; en: string; icon: string }> = {
  chinese: { zh: '國文', en: 'Chinese', icon: '文' },
  english: { zh: '英文', en: 'English', icon: 'EN' },
  math: { zh: '數學', en: 'Math', icon: '∑' },
  science: { zh: '自然', en: 'Science', icon: '⚗' },
  social: { zh: '社會', en: 'Social studies', icon: '社' },
}

function gradeLabel(grade: number, language: Language) {
  if (language === 'en') return `Grade ${grade}`
  if (grade <= 6) return `${['一', '二', '三', '四', '五', '六'][grade - 1]}年級`
  if (grade <= 9) return `${['七', '八', '九'][grade - 7]}年級`
  return `高${['一', '二', '三'][grade - 10]}`
}

function feedbackLabel(feedback: CurriculumDifficultyFeedback, language: Language) {
  const zh = { 'too-hard': '太難', 'about-right': '剛好', 'too-easy': '太簡單', unclear: '我看不懂' }
  const en = { 'too-hard': 'Too hard', 'about-right': 'About right', 'too-easy': 'Too easy', unclear: 'I am stuck' }
  return (language === 'zh' ? zh : en)[feedback]
}

function lessonKindLabel(lesson: CurriculumLessonPlan, language: Language) {
  const zh = {
    launch: '導入', concept: '觀念', example: '示範', guided: '引導', practice: '練習', assessment: '檢核',
  }
  const en = {
    launch: 'Launch', concept: 'Concept', example: 'Example', guided: 'Guided', practice: 'Practice', assessment: 'Check',
  }
  return (language === 'zh' ? zh : en)[lesson.kind]
}

function learningSteps(subject: CurriculumSubjectId, lesson: CurriculumLessonPlan, language: Language) {
  if (language === 'en') {
    return [
      `Understand the goal: ${lesson.objective}`,
      lesson.teachingFocus,
      lesson.learnerTask,
    ]
  }

  if (subject === 'math') {
    return [
      `先圈出題目要解決的量與條件：${lesson.objective}`,
      `把圖像、文字與算式連起來：${lesson.teachingFocus}`,
      '完成後不要只看答案，回頭判斷是觀念、列式還是計算哪一步最容易出錯。',
    ]
  }
  if (subject === 'science') {
    return [
      `先寫下可以直接觀察到的現象：${lesson.objective}`,
      `再用資料與證據形成解釋：${lesson.teachingFocus}`,
      '最後把「我看到什麼」和「我推論什麼」分開寫，避免把猜測當成證據。',
    ]
  }
  if (subject === 'social') {
    return [
      `先確認時間、地點、人物或議題背景：${lesson.objective}`,
      `閱讀資料來源並比較線索：${lesson.teachingFocus}`,
      '最後用「因為……所以……」或證據句說明你的判斷，不只背結論。',
    ]
  }
  if (subject === 'english') {
    return [
      `先理解情境要表達的意思：${lesson.objective}`,
      `用完整句子理解字彙與句型：${lesson.teachingFocus}`,
      '最後換一個情境再說、聽、讀或寫一次，確認不是只記住原本例句。',
    ]
  }
  return [
    `先讀懂文本或表達任務：${lesson.objective}`,
    `找關鍵字詞、結構與線索：${lesson.teachingFocus}`,
    '最後換一段文字或新的表達任務再使用同一個策略，確認真正理解。',
  ]
}

export function CurriculumCourseApp({ language, userId, grade, subject }: Props) {
  const course = useMemo(() => getCurriculumCourseBundle(grade, subject), [grade, subject])
  const [semester, setSemester] = useState<CurriculumSemester>(1)
  const [unitIndex, setUnitIndex] = useState(0)
  const [lessonIndex, setLessonIndex] = useState(0)
  const [directoryOpen, setDirectoryOpen] = useState(false)
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(() => readCurriculumProgress(userId))
  const [feedbackByLesson, setFeedbackByLesson] = useState<Record<string, CurriculumDifficultyFeedback>>(() => Object.fromEntries(
    readCurriculumFeedback(userId).map((entry) => [entry.lessonId, entry.feedback]),
  ))

  const copy = language === 'zh'
    ? {
        directory: '課程目錄', semesterOne: '上學期', semesterTwo: '下學期', progress: '整體進度', lesson: '本課', objective: '這堂要學會什麼',
        flow: '今天怎麼學', criteria: '學會的判斷標準', feedback: '這堂課對你來說？', feedbackHint: '先記錄你的感受，之後反應型 AI 會使用這些訊號協助調整。',
        complete: '完成這一課', completed: '已完成', next: '下一課 →', previous: '← 上一課', minutes: '分鐘', source: '課程依據',
        resetUnit: '從本單元第一課開始', unitProgress: '單元進度', close: '關閉目錄', noCourse: '找不到這門課的課程藍圖。',
        planVersion: '課程規劃版 v1', assessmentNote: '這一課是單元檢核。正式題庫之後可以依同一份學習目標掛入，不需要再改課程結構。',
      }
    : {
        directory: 'Course directory', semesterOne: 'Semester 1', semesterTwo: 'Semester 2', progress: 'Overall progress', lesson: 'Lesson', objective: 'Learning goal',
        flow: 'Learning flow', criteria: 'Success criteria', feedback: 'How did this lesson feel?', feedbackHint: 'Your response is stored now and can later feed the adaptive AI.',
        complete: 'Complete lesson', completed: 'Completed', next: 'Next lesson →', previous: '← Previous', minutes: 'min', source: 'Curriculum basis',
        resetUnit: 'Start unit from lesson 1', unitProgress: 'Unit progress', close: 'Close directory', noCourse: 'No curriculum roadmap was found.',
        planVersion: 'Curriculum plan v1', assessmentNote: 'This lesson is the unit check. A real question bank can plug into these goals later without changing the course structure.',
      }

  if (!course) return <div className="curriculum-course-empty">{copy.noCourse}</div>

  const subjectMeta = SUBJECT_META[subject]
  const semesterPlan = course.semesters.find((item) => item.semester === semester) ?? course.semesters[0]
  const safeUnitIndex = Math.min(unitIndex, Math.max(0, semesterPlan.units.length - 1))
  const unit: CurriculumUnitBundle = semesterPlan.units[safeUnitIndex]
  const safeLessonIndex = Math.min(lessonIndex, Math.max(0, unit.lessons.length - 1))
  const lesson = unit.lessons[safeLessonIndex]
  const allLessons = course.semesters.flatMap((item) => item.units.flatMap((entry) => entry.lessons))
  const completedInCourse = allLessons.filter((item) => completedLessonIds.includes(item.id)).length
  const overallProgress = allLessons.length ? Math.round((completedInCourse / allLessons.length) * 100) : 0
  const unitCompleted = unit.lessons.filter((item) => completedLessonIds.includes(item.id)).length
  const unitProgress = Math.round((unitCompleted / unit.lessons.length) * 100)
  const currentFeedback = feedbackByLesson[lesson.id]
  const steps = learningSteps(subject, lesson, language)

  const selectSemester = (next: CurriculumSemester) => {
    setSemester(next)
    setUnitIndex(0)
    setLessonIndex(0)
  }

  const selectUnit = (index: number) => {
    setUnitIndex(index)
    setLessonIndex(0)
    setDirectoryOpen(false)
  }

  const selectLesson = (nextUnitIndex: number, nextLessonIndex: number) => {
    setUnitIndex(nextUnitIndex)
    setLessonIndex(nextLessonIndex)
    setDirectoryOpen(false)
  }

  const completeLesson = () => {
    const next = Array.from(new Set([...completedLessonIds, lesson.id]))
    setCompletedLessonIds(next)
    writeCurriculumProgress(userId, next)
  }

  const goPrevious = () => {
    if (safeLessonIndex > 0) {
      setLessonIndex(safeLessonIndex - 1)
      return
    }
    if (safeUnitIndex > 0) {
      const previousUnit = semesterPlan.units[safeUnitIndex - 1]
      setUnitIndex(safeUnitIndex - 1)
      setLessonIndex(previousUnit.lessons.length - 1)
    }
  }

  const goNext = () => {
    completeLesson()
    if (safeLessonIndex < unit.lessons.length - 1) {
      setLessonIndex(safeLessonIndex + 1)
      return
    }
    if (safeUnitIndex < semesterPlan.units.length - 1) {
      setUnitIndex(safeUnitIndex + 1)
      setLessonIndex(0)
      return
    }
    if (semester === 1) selectSemester(2)
  }

  const saveFeedback = (feedback: CurriculumDifficultyFeedback) => {
    setFeedbackByLesson((current) => ({ ...current, [lesson.id]: feedback }))
    saveCurriculumFeedback(userId, {
      lessonId: lesson.id,
      unitId: unit.id,
      grade,
      subject,
      feedback,
      createdAt: new Date().toISOString(),
    })
  }

  return (
    <div className={`curriculum-course-app course-${subject}`}>
      <header className="curriculum-course-header">
        <div className="curriculum-course-brand">
          <span className="curriculum-course-subject-icon">{subjectMeta.icon}</span>
          <div>
            <p>{copy.planVersion} · {gradeLabel(grade, language)}</p>
            <h1>{language === 'zh' ? subjectMeta.zh : subjectMeta.en}</h1>
            <span>{unit.title} · {lessonKindLabel(lesson, language)}</span>
          </div>
        </div>
        <div className="curriculum-course-header-actions">
          <div className="curriculum-course-progress-chip">
            <span>{copy.progress}</span><strong>{overallProgress}%</strong>
          </div>
          <button type="button" className="curriculum-directory-button" onClick={() => setDirectoryOpen(true)}>☰ {copy.directory}</button>
        </div>
      </header>

      <div className="curriculum-course-progress-track"><span style={{ width: `${overallProgress}%` }} /></div>

      <main className="curriculum-lesson-stage">
        <div className="curriculum-lesson-meta-row">
          <span>{semester === 1 ? copy.semesterOne : copy.semesterTwo}</span>
          <span>{String(safeUnitIndex + 1).padStart(2, '0')} · {unit.title}</span>
          <span>{copy.lesson} {safeLessonIndex + 1}/{unit.lessons.length}</span>
          <span>約 {lesson.estimatedMinutes} {copy.minutes}</span>
        </div>

        <section className="curriculum-lesson-hero">
          <p>{lessonKindLabel(lesson, language).toUpperCase()}</p>
          <h2>{lesson.title}</h2>
          <div className="curriculum-lesson-objective">
            <span>{copy.objective}</span>
            <strong>{lesson.objective}</strong>
          </div>
        </section>

        <section className="curriculum-learning-flow">
          <div className="curriculum-section-heading"><span>01</span><h3>{copy.flow}</h3></div>
          <div className="curriculum-learning-step-list">
            {steps.map((step, index) => (
              <article key={step}>
                <span>{index + 1}</span>
                <p>{step}</p>
              </article>
            ))}
          </div>
          {lesson.kind === 'assessment' ? <aside className="curriculum-assessment-note">✦ {copy.assessmentNote}</aside> : null}
        </section>

        <section className="curriculum-success-section">
          <div className="curriculum-section-heading"><span>02</span><h3>{copy.criteria}</h3></div>
          <div className="curriculum-success-grid">
            {lesson.successCriteria.map((criterion) => <div key={criterion}><span>✓</span><p>{criterion}</p></div>)}
          </div>
        </section>

        <section className="curriculum-feedback-section">
          <div className="curriculum-section-heading"><span>03</span><h3>{copy.feedback}</h3></div>
          <p className="curriculum-feedback-hint">{copy.feedbackHint}</p>
          <div className="curriculum-feedback-buttons">
            {(['too-hard', 'about-right', 'too-easy', 'unclear'] as CurriculumDifficultyFeedback[]).map((feedback) => (
              <button
                type="button"
                key={feedback}
                className={currentFeedback === feedback ? 'active' : ''}
                onClick={() => saveFeedback(feedback)}
              >
                {feedbackLabel(feedback, language)}
              </button>
            ))}
          </div>
        </section>

        <footer className="curriculum-lesson-footer">
          <button type="button" className="curriculum-secondary-action" disabled={safeUnitIndex === 0 && safeLessonIndex === 0} onClick={goPrevious}>{copy.previous}</button>
          <div className="curriculum-lesson-completion">
            <span>{copy.unitProgress} {unitProgress}%</span>
            <button
              type="button"
              className={completedLessonIds.includes(lesson.id) ? 'completed' : ''}
              onClick={completeLesson}
            >
              {completedLessonIds.includes(lesson.id) ? `✓ ${copy.completed}` : copy.complete}
            </button>
          </div>
          <button type="button" className="curriculum-primary-action" onClick={goNext}>{copy.next}</button>
        </footer>
      </main>

      <aside className={`curriculum-course-directory${directoryOpen ? ' open' : ''}`} aria-hidden={!directoryOpen}>
        <header>
          <div><p>COURSE MAP</p><h2>{gradeLabel(grade, language)} · {language === 'zh' ? subjectMeta.zh : subjectMeta.en}</h2></div>
          <button type="button" aria-label={copy.close} onClick={() => setDirectoryOpen(false)}>×</button>
        </header>

        <div className="curriculum-directory-semesters">
          <button type="button" className={semester === 1 ? 'active' : ''} onClick={() => selectSemester(1)}>{copy.semesterOne}</button>
          <button type="button" className={semester === 2 ? 'active' : ''} onClick={() => selectSemester(2)}>{copy.semesterTwo}</button>
        </div>

        <div className="curriculum-directory-units">
          {semesterPlan.units.map((directoryUnit, directoryUnitIndex) => {
            const done = directoryUnit.lessons.filter((item) => completedLessonIds.includes(item.id)).length
            return (
              <section key={directoryUnit.id} className={directoryUnitIndex === safeUnitIndex ? 'active' : ''}>
                <button className="curriculum-directory-unit-title" type="button" onClick={() => selectUnit(directoryUnitIndex)}>
                  <span>{String(directoryUnitIndex + 1).padStart(2, '0')}</span>
                  <div><strong>{directoryUnit.title}</strong><small>{done}/{directoryUnit.lessons.length} {copy.completed}</small></div>
                </button>
                <div className="curriculum-directory-lessons">
                  {directoryUnit.lessons.map((directoryLesson, directoryLessonIndex) => (
                    <button
                      type="button"
                      className={directoryUnitIndex === safeUnitIndex && directoryLessonIndex === safeLessonIndex ? 'active' : ''}
                      key={directoryLesson.id}
                      onClick={() => selectLesson(directoryUnitIndex, directoryLessonIndex)}
                    >
                      <span>{completedLessonIds.includes(directoryLesson.id) ? '✓' : directoryLessonIndex + 1}</span>
                      <div><strong>{lessonKindLabel(directoryLesson, language)}</strong><small>{directoryLesson.estimatedMinutes} {copy.minutes}</small></div>
                    </button>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
        <footer><small>{copy.source}</small><p>{course.sourceBasis}</p>{course.note ? <p>{course.note}</p> : null}</footer>
      </aside>
      {directoryOpen ? <button type="button" className="curriculum-course-backdrop" aria-label={copy.close} onClick={() => setDirectoryOpen(false)} /> : null}
    </div>
  )
}
