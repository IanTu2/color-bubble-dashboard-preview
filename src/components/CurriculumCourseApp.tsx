import { useMemo, useState } from 'react'
import {
  getCurriculumCourseBundle,
  readCurriculumProgress,
  writeCurriculumProgress,
  type CurriculumLessonPlan,
  type CurriculumUnitBundle,
} from '../curriculum-course-engine'
import { buildTeachingBlocks, type TeachingBlock } from '../curriculum-teaching-content'
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

type IssueKind = 'unclear' | 'possible-error' | 'answer' | 'wording' | 'other'

type ReportContext = {
  blockId: string
  blockTitle: string
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

function lessonKindLabel(lesson: CurriculumLessonPlan, language: Language) {
  const zh = { launch: '導入', concept: '觀念', example: '示範', guided: '引導', practice: '練習', assessment: '檢核' }
  const en = { launch: 'Launch', concept: 'Concept', example: 'Example', guided: 'Guided', practice: 'Practice', assessment: 'Check' }
  return (language === 'zh' ? zh : en)[lesson.kind]
}

function reportStorageKey(userId: string) {
  return `bubble-space-curriculum-content-reports-${userId}`
}

function saveReport(userId: string, report: Record<string, unknown>) {
  try {
    const raw = window.localStorage.getItem(reportStorageKey(userId))
    const parsed = raw ? JSON.parse(raw) : []
    const current = Array.isArray(parsed) ? parsed : []
    window.localStorage.setItem(reportStorageKey(userId), JSON.stringify([...current, report].slice(-300)))
  } catch {
    window.localStorage.setItem(reportStorageKey(userId), JSON.stringify([report]))
  }
}

function issueLabel(kind: IssueKind, language: Language) {
  const zh: Record<IssueKind, string> = { unclear: '我看不懂', 'possible-error': '內容可能有錯', answer: '例題／解答有疑問', wording: '敘述不清楚', other: '其他' }
  const en: Record<IssueKind, string> = { unclear: 'I do not understand', 'possible-error': 'Possible content error', answer: 'Question about the answer', wording: 'Unclear wording', other: 'Other' }
  return (language === 'zh' ? zh : en)[kind]
}

function TeachingSection({ block, language, onReport }: { block: TeachingBlock; language: Language; onReport: (block: TeachingBlock) => void }) {
  return (
    <section className="curriculum-teaching-block">
      <div className="curriculum-teaching-heading"><span>{block.eyebrow}</span><h3>{block.title}</h3></div>
      <div className="curriculum-teaching-copy">
        {block.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
      {block.bullets?.length ? (
        <ul className="curriculum-teaching-bullets">{block.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
      ) : null}
      {block.example ? (
        <div className="curriculum-worked-example">
          <div className="curriculum-example-prompt"><span>{language === 'zh' ? '例題' : 'Example'}</span><strong>{block.example.prompt}</strong></div>
          <ol>{block.example.steps.map((step) => <li key={step}>{step}</li>)}</ol>
          <div className="curriculum-example-answer"><span>{language === 'zh' ? '答案' : 'Answer'}</span><strong>{block.example.answer}</strong></div>
        </div>
      ) : null}
      <div className="curriculum-problem-link-row">
        <span>{language === 'zh' ? '內容有問題？' : 'Something wrong with this content?'}</span>
        <button type="button" onClick={() => onReport(block)}>{language === 'zh' ? '反映問題' : 'Report issue'}</button>
      </div>
    </section>
  )
}

export function CurriculumCourseApp({ language, userId, grade, subject }: Props) {
  const course = useMemo(() => getCurriculumCourseBundle(grade, subject), [grade, subject])
  const [semester, setSemester] = useState<CurriculumSemester>(1)
  const [unitIndex, setUnitIndex] = useState(0)
  const [lessonIndex, setLessonIndex] = useState(0)
  const [directoryOpen, setDirectoryOpen] = useState(false)
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(() => readCurriculumProgress(userId))
  const [reportContext, setReportContext] = useState<ReportContext | null>(null)
  const [issueKind, setIssueKind] = useState<IssueKind>('unclear')
  const [issueText, setIssueText] = useState('')
  const [reportSaved, setReportSaved] = useState(false)

  const copy = language === 'zh'
    ? {
        directory: '課程目錄', semesterOne: '上學期', semesterTwo: '下學期', progress: '整體進度', lesson: '本課', objective: '這堂要學會什麼',
        complete: '完成這一課', completed: '已完成', next: '下一課 →', previous: '← 上一課', minutes: '分鐘', source: '課程依據', unitProgress: '單元進度', close: '關閉', noCourse: '找不到這門課的課程藍圖。',
        planVersion: '正式課程 v2', reportTitle: '內容有問題？反映問題', reportHint: '系統已自動帶入目前的年級、科目、單元、課次與內容區塊。之後串接課程 AI 時，AI 就從這個 context 回答，而不是讓你重新描述整題。',
        reportDetail: '補充說明', reportPlaceholder: '例如：我不懂第二步為什麼要這樣算；或我覺得答案可能有問題……', submitReport: '送出問題', reportDone: '已記錄這個問題。這個入口就是之後課程 AI 的反應位置。',
      }
    : {
        directory: 'Course directory', semesterOne: 'Semester 1', semesterTwo: 'Semester 2', progress: 'Overall progress', lesson: 'Lesson', objective: 'Learning goal',
        complete: 'Complete lesson', completed: 'Completed', next: 'Next lesson →', previous: '← Previous', minutes: 'min', source: 'Curriculum basis', unitProgress: 'Unit progress', close: 'Close', noCourse: 'No curriculum roadmap was found.',
        planVersion: 'Formal course v2', reportTitle: 'Report a content issue', reportHint: 'Grade, subject, unit, lesson, and content block are attached automatically. A future course AI can answer with this exact context.',
        reportDetail: 'Details', reportPlaceholder: 'For example: I do not understand step 2, or I think the answer may be wrong…', submitReport: 'Submit issue', reportDone: 'Issue saved. This is the integration point for the future course AI.',
      }

  if (!course) return <div className="curriculum-course-empty">{copy.noCourse}</div>

  const subjectMeta = SUBJECT_META[subject]
  const semesterPlan = course.semesters.find((item) => item.semester === semester) ?? course.semesters[0]
  const safeUnitIndex = Math.min(unitIndex, Math.max(0, semesterPlan.units.length - 1))
  const unit: CurriculumUnitBundle = semesterPlan.units[safeUnitIndex]
  const safeLessonIndex = Math.min(lessonIndex, Math.max(0, unit.lessons.length - 1))
  const lesson = unit.lessons[safeLessonIndex]
  const teachingBlocks = buildTeachingBlocks(subject, grade, unit, lesson)
  const allLessons = course.semesters.flatMap((item) => item.units.flatMap((entry) => entry.lessons))
  const completedInCourse = allLessons.filter((item) => completedLessonIds.includes(item.id)).length
  const overallProgress = allLessons.length ? Math.round((completedInCourse / allLessons.length) * 100) : 0
  const unitCompleted = unit.lessons.filter((item) => completedLessonIds.includes(item.id)).length
  const unitProgress = Math.round((unitCompleted / unit.lessons.length) * 100)

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

  const openReport = (block: TeachingBlock) => {
    setReportContext({ blockId: block.id, blockTitle: block.title })
    setIssueKind('unclear')
    setIssueText('')
    setReportSaved(false)
  }

  const submitReport = () => {
    if (!reportContext) return
    saveReport(userId, {
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
      grade,
      subject,
      semester,
      unitId: unit.id,
      unitTitle: unit.title,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      blockId: reportContext.blockId,
      blockTitle: reportContext.blockTitle,
      issueKind,
      message: issueText.trim(),
      createdAt: new Date().toISOString(),
    })
    setReportSaved(true)
  }

  return (
    <div className={`curriculum-course-app course-${subject}`}>
      <header className="curriculum-course-header">
        <div className="curriculum-course-brand"><span className="curriculum-course-subject-icon">{subjectMeta.icon}</span><div><p>{copy.planVersion} · {gradeLabel(grade, language)}</p><h1>{language === 'zh' ? subjectMeta.zh : subjectMeta.en}</h1><span>{unit.title} · {lessonKindLabel(lesson, language)}</span></div></div>
        <div className="curriculum-course-header-actions"><div className="curriculum-course-progress-chip"><span>{copy.progress}</span><strong>{overallProgress}%</strong></div><button type="button" className="curriculum-directory-button" onClick={() => setDirectoryOpen(true)}>☰ {copy.directory}</button></div>
      </header>
      <div className="curriculum-course-progress-track"><span style={{ width: `${overallProgress}%` }} /></div>

      <main className="curriculum-lesson-stage">
        <div className="curriculum-lesson-meta-row"><span>{semester === 1 ? copy.semesterOne : copy.semesterTwo}</span><span>{String(safeUnitIndex + 1).padStart(2, '0')} · {unit.title}</span><span>{copy.lesson} {safeLessonIndex + 1}/{unit.lessons.length}</span><span>約 {lesson.estimatedMinutes} {copy.minutes}</span></div>
        <section className="curriculum-lesson-hero"><p>{lessonKindLabel(lesson, language).toUpperCase()}</p><h2>{lesson.title}</h2><div className="curriculum-lesson-objective"><span>{copy.objective}</span><strong>{lesson.objective}</strong></div></section>

        <div className="curriculum-teaching-stack">
          {teachingBlocks.map((block) => <TeachingSection key={block.id} block={block} language={language} onReport={openReport} />)}
        </div>

        <footer className="curriculum-lesson-footer">
          <button type="button" className="curriculum-secondary-action" disabled={safeUnitIndex === 0 && safeLessonIndex === 0} onClick={goPrevious}>{copy.previous}</button>
          <div className="curriculum-lesson-completion"><span>{copy.unitProgress} {unitProgress}%</span><button type="button" className={completedLessonIds.includes(lesson.id) ? 'completed' : ''} onClick={completeLesson}>{completedLessonIds.includes(lesson.id) ? `✓ ${copy.completed}` : copy.complete}</button></div>
          <button type="button" className="curriculum-primary-action" onClick={goNext}>{copy.next}</button>
        </footer>
      </main>

      <aside className={`curriculum-course-directory${directoryOpen ? ' open' : ''}`} aria-hidden={!directoryOpen}>
        <header><div><p>COURSE MAP</p><h2>{gradeLabel(grade, language)} · {language === 'zh' ? subjectMeta.zh : subjectMeta.en}</h2></div><button type="button" aria-label={copy.close} onClick={() => setDirectoryOpen(false)}>×</button></header>
        <div className="curriculum-directory-semesters"><button type="button" className={semester === 1 ? 'active' : ''} onClick={() => selectSemester(1)}>{copy.semesterOne}</button><button type="button" className={semester === 2 ? 'active' : ''} onClick={() => selectSemester(2)}>{copy.semesterTwo}</button></div>
        <div className="curriculum-directory-units">
          {semesterPlan.units.map((directoryUnit, directoryUnitIndex) => {
            const done = directoryUnit.lessons.filter((item) => completedLessonIds.includes(item.id)).length
            return (
              <section key={directoryUnit.id} className={directoryUnitIndex === safeUnitIndex ? 'active' : ''}>
                <button className="curriculum-directory-unit-title" type="button" onClick={() => selectUnit(directoryUnitIndex)}><span>{String(directoryUnitIndex + 1).padStart(2, '0')}</span><div><strong>{directoryUnit.title}</strong><small>{done}/{directoryUnit.lessons.length} {copy.completed}</small></div></button>
                <div className="curriculum-directory-lessons">
                  {directoryUnit.lessons.map((directoryLesson, directoryLessonIndex) => (
                    <button type="button" className={directoryUnitIndex === safeUnitIndex && directoryLessonIndex === safeLessonIndex ? 'active' : ''} key={directoryLesson.id} onClick={() => selectLesson(directoryUnitIndex, directoryLessonIndex)}><span>{completedLessonIds.includes(directoryLesson.id) ? '✓' : directoryLessonIndex + 1}</span><div><strong>{lessonKindLabel(directoryLesson, language)}</strong><small>{directoryLesson.estimatedMinutes} {copy.minutes}</small></div></button>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
        <footer><small>{copy.source}</small><p>{course.sourceBasis}</p>{course.note ? <p>{course.note}</p> : null}</footer>
      </aside>

      <aside className={`curriculum-issue-curtain${reportContext ? ' open' : ''}`} aria-hidden={!reportContext}>
        <header><div><p>CONTENT SUPPORT</p><h2>{copy.reportTitle}</h2></div><button type="button" onClick={() => setReportContext(null)}>×</button></header>
        {reportContext ? (
          <div className="curriculum-issue-body">
            <div className="curriculum-report-context"><span>{gradeLabel(grade, language)} · {language === 'zh' ? subjectMeta.zh : subjectMeta.en}</span><strong>{unit.title}</strong><small>{lessonKindLabel(lesson, language)} · {reportContext.blockTitle}</small></div>
            <p className="curriculum-report-hint">{copy.reportHint}</p>
            <div className="curriculum-issue-types">{(['unclear', 'possible-error', 'answer', 'wording', 'other'] as IssueKind[]).map((kind) => <button type="button" className={issueKind === kind ? 'active' : ''} key={kind} onClick={() => { setIssueKind(kind); setReportSaved(false) }}>{issueLabel(kind, language)}</button>)}</div>
            <label className="curriculum-report-text"><span>{copy.reportDetail}</span><textarea value={issueText} placeholder={copy.reportPlaceholder} onChange={(event) => { setIssueText(event.target.value); setReportSaved(false) }} /></label>
            {reportSaved ? <div className="curriculum-report-saved">✓ {copy.reportDone}</div> : <button className="curriculum-report-submit" type="button" onClick={submitReport}>{copy.submitReport}</button>}
          </div>
        ) : null}
      </aside>

      {directoryOpen ? <button type="button" className="curriculum-course-backdrop" aria-label={copy.close} onClick={() => setDirectoryOpen(false)} /> : null}
      {reportContext ? <button type="button" className="curriculum-issue-backdrop" aria-label={copy.close} onClick={() => setReportContext(null)} /> : null}
    </div>
  )
}
