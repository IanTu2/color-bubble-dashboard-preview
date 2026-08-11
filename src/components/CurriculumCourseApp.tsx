import { useState } from 'react'
import {
  getCurriculumCourseBundle,
  readCurriculumProgress,
  writeCurriculumProgress,
  type CurriculumLessonPlan,
  type CurriculumUnitBundle,
} from '../curriculum-course-engine'
import { buildRichLessonPack } from '../curriculum-rich-content'
import {
  buildInteractiveLessonQuestions,
  isPracticeSelfContained,
  type InteractiveLessonQuestion,
} from '../curriculum-interactive-questions'
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

type AnswerState = {
  selectedIndex?: number
  text?: string
  checked?: boolean
}

type LessonPage =
  | { id: string; kind: 'intro'; title: string }
  | { id: string; kind: 'concept'; title: string; body: string; index: number }
  | { id: string; kind: 'visual'; title: string }
  | { id: string; kind: 'focus'; title: string; label: string; detail: string; index: number }
  | { id: string; kind: 'model'; title: string; prompt: string; hint: string; answer: string; explanation: string }
  | { id: string; kind: 'question'; title: string; question: InteractiveLessonQuestion; index: number }
  | { id: string; kind: 'recap'; title: string }

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

function buildLessonPages(
  lesson: CurriculumLessonPlan,
  pack: ReturnType<typeof buildRichLessonPack>,
  questions: InteractiveLessonQuestion[],
  language: Language,
): LessonPage[] {
  const pages: LessonPage[] = [{ id: `${lesson.id}-intro`, kind: 'intro', title: language === 'zh' ? '這堂課要做什麼' : 'Lesson goal' }]

  pack.bridge.forEach((body, index) => {
    pages.push({
      id: `${lesson.id}-concept-${index}`,
      kind: 'concept',
      title: language === 'zh' ? `觀念 ${index + 1}` : `Concept ${index + 1}`,
      body,
      index,
    })
  })

  pages.push({ id: `${lesson.id}-visual`, kind: 'visual', title: pack.visual.title })

  pack.visual.items.slice(0, 5).forEach((item, index) => {
    pages.push({
      id: `${lesson.id}-focus-${index}`,
      kind: 'focus',
      title: language === 'zh' ? `重點拆解 ${index + 1}` : `Key idea ${index + 1}`,
      label: item.label,
      detail: item.detail,
      index,
    })
  })

  const worked = pack.practices.find(isPracticeSelfContained)
  if (worked) {
    pages.push({
      id: `${lesson.id}-model`,
      kind: 'model',
      title: language === 'zh' ? '老師示範一題' : 'Worked example',
      prompt: worked.question,
      hint: worked.hint,
      answer: worked.answer,
      explanation: worked.explanation,
    })
  }

  questions.forEach((question, index) => {
    pages.push({
      id: question.id,
      kind: 'question',
      title: language === 'zh' ? `練習 ${index + 1}` : `Practice ${index + 1}`,
      question,
      index,
    })
  })

  pages.push({ id: `${lesson.id}-recap`, kind: 'recap', title: language === 'zh' ? '完成前再確認' : 'Final check' })
  return pages
}

function VisualCanvas({ pack }: { pack: ReturnType<typeof buildRichLessonPack> }) {
  return (
    <div className={`curriculum-visual-canvas kind-${pack.visual.kind}`}>
      {pack.visual.items.map((item, index) => (
        <article className="curriculum-visual-node" key={`${item.label}-${index}`}>
          <strong>{item.label}</strong>
          <span>{item.detail}</span>
        </article>
      ))}
    </div>
  )
}

function ChoiceQuestion({
  question,
  state,
  language,
  onChange,
}: {
  question: Extract<InteractiveLessonQuestion, { kind: 'choice' }>
  state: AnswerState
  language: Language
  onChange: (next: AnswerState) => void
}) {
  const selected = state.selectedIndex
  const checked = Boolean(state.checked)
  const correct = checked && selected === question.correctIndex

  return (
    <div className="curriculum-paged-question">
      {question.context ? <div className="curriculum-question-context">{question.context}</div> : null}
      <h3>{question.prompt}</h3>
      <div className="curriculum-choice-grid">
        {question.options.map((option, index) => {
          const classes = [
            selected === index ? 'selected' : '',
            checked && index === question.correctIndex ? 'correct' : '',
            checked && selected === index && index !== question.correctIndex ? 'wrong' : '',
          ].filter(Boolean).join(' ')
          return (
            <button
              type="button"
              className={classes}
              key={`${option}-${index}`}
              onClick={() => onChange({ selectedIndex: index, checked: false })}
            >
              <span>{String.fromCharCode(65 + index)}</span>
              <strong>{option}</strong>
            </button>
          )
        })}
      </div>
      <button
        type="button"
        className="curriculum-check-answer"
        disabled={selected === undefined}
        onClick={() => onChange({ ...state, checked: true })}
      >
        {language === 'zh' ? '確認答案' : 'Check answer'}
      </button>
      {checked ? (
        <div className={`curriculum-answer-feedback ${correct ? 'correct' : 'wrong'}`}>
          <strong>{correct ? (language === 'zh' ? '✓ 答對了' : '✓ Correct') : (language === 'zh' ? '再看一次觀念' : 'Review the idea')}</strong>
          <p>{question.explanation}</p>
        </div>
      ) : null}
    </div>
  )
}

function ResponseQuestion({
  question,
  state,
  language,
  onChange,
}: {
  question: Extract<InteractiveLessonQuestion, { kind: 'response' }>
  state: AnswerState
  language: Language
  onChange: (next: AnswerState) => void
}) {
  return (
    <div className="curriculum-paged-question">
      {question.context ? <div className="curriculum-question-context">💡 {question.context}</div> : null}
      <h3>{question.prompt}</h3>
      <textarea
        className="curriculum-response-input"
        value={state.text ?? ''}
        placeholder={language === 'zh' ? '先寫下你的想法，再對照參考答案。' : 'Write your answer before checking the model answer.'}
        onChange={(event) => onChange({ text: event.target.value, checked: false })}
      />
      <button type="button" className="curriculum-check-answer" onClick={() => onChange({ ...state, checked: true })}>
        {language === 'zh' ? '對照參考答案' : 'Show model answer'}
      </button>
      {state.checked ? (
        <div className="curriculum-answer-feedback neutral">
          <strong>{language === 'zh' ? `參考答案：${question.sampleAnswer}` : `Model answer: ${question.sampleAnswer}`}</strong>
          <p>{question.explanation}</p>
        </div>
      ) : null}
    </div>
  )
}

export function CurriculumCourseApp({ language, userId, grade, subject }: Props) {
  const course = getCurriculumCourseBundle(grade, subject)
  const [semester, setSemester] = useState<CurriculumSemester>(1)
  const [unitIndex, setUnitIndex] = useState(0)
  const [lessonIndex, setLessonIndex] = useState(0)
  const [pageIndex, setPageIndex] = useState(0)
  const [directoryOpen, setDirectoryOpen] = useState(false)
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(() => readCurriculumProgress(userId))
  const [answerStates, setAnswerStates] = useState<Record<string, AnswerState>>({})
  const [reportContext, setReportContext] = useState<ReportContext | null>(null)
  const [issueKind, setIssueKind] = useState<IssueKind>('unclear')
  const [issueText, setIssueText] = useState('')
  const [reportSaved, setReportSaved] = useState(false)

  if (!course) return <div className="curriculum-course-empty">找不到這門課的課程藍圖。</div>

  const subjectMeta = SUBJECT_META[subject]
  const semesterPlan = course.semesters.find((item) => item.semester === semester) ?? course.semesters[0]
  const safeUnitIndex = Math.min(unitIndex, Math.max(0, semesterPlan.units.length - 1))
  const unit: CurriculumUnitBundle = semesterPlan.units[safeUnitIndex]
  const safeLessonIndex = Math.min(lessonIndex, Math.max(0, unit.lessons.length - 1))
  const lesson = unit.lessons[safeLessonIndex]
  const pack = buildRichLessonPack(subject, grade, unit, lesson)
  const questions = buildInteractiveLessonQuestions(pack, lesson.id)
  const pages = buildLessonPages(lesson, pack, questions, language)
  const safePageIndex = Math.min(pageIndex, pages.length - 1)
  const page = pages[safePageIndex]
  const pageProgress = Math.round(((safePageIndex + 1) / pages.length) * 100)

  const allLessons = course.semesters.flatMap((item) => item.units.flatMap((entry) => entry.lessons))
  const completedInCourse = allLessons.filter((item) => completedLessonIds.includes(item.id)).length
  const overallProgress = allLessons.length ? Math.round((completedInCourse / allLessons.length) * 100) : 0

  const completeLesson = () => {
    const next = Array.from(new Set([...completedLessonIds, lesson.id]))
    setCompletedLessonIds(next)
    writeCurriculumProgress(userId, next)
  }

  const selectSemester = (next: CurriculumSemester) => {
    setSemester(next)
    setUnitIndex(0)
    setLessonIndex(0)
    setPageIndex(0)
  }

  const selectLesson = (nextUnitIndex: number, nextLessonIndex: number) => {
    setUnitIndex(nextUnitIndex)
    setLessonIndex(nextLessonIndex)
    setPageIndex(0)
    setDirectoryOpen(false)
  }

  const goToNextLesson = () => {
    completeLesson()
    if (safeLessonIndex < unit.lessons.length - 1) {
      setLessonIndex(safeLessonIndex + 1)
      setPageIndex(0)
      return
    }
    if (safeUnitIndex < semesterPlan.units.length - 1) {
      setUnitIndex(safeUnitIndex + 1)
      setLessonIndex(0)
      setPageIndex(0)
      return
    }
    if (semester === 1) {
      selectSemester(2)
      return
    }
    setPageIndex(pages.length - 1)
  }

  const goNext = () => {
    if (safePageIndex < pages.length - 1) {
      setPageIndex(safePageIndex + 1)
      return
    }
    goToNextLesson()
  }

  const goPrevious = () => {
    if (safePageIndex > 0) {
      setPageIndex(safePageIndex - 1)
      return
    }
    if (safeLessonIndex > 0) {
      const previousLessonIndex = safeLessonIndex - 1
      const previousLesson = unit.lessons[previousLessonIndex]
      const previousPack = buildRichLessonPack(subject, grade, unit, previousLesson)
      const previousQuestions = buildInteractiveLessonQuestions(previousPack, previousLesson.id)
      const previousPages = buildLessonPages(previousLesson, previousPack, previousQuestions, language)
      setLessonIndex(previousLessonIndex)
      setPageIndex(previousPages.length - 1)
      return
    }
    if (safeUnitIndex > 0) {
      const previousUnit = semesterPlan.units[safeUnitIndex - 1]
      const previousLessonIndex = previousUnit.lessons.length - 1
      const previousLesson = previousUnit.lessons[previousLessonIndex]
      const previousPack = buildRichLessonPack(subject, grade, previousUnit, previousLesson)
      const previousQuestions = buildInteractiveLessonQuestions(previousPack, previousLesson.id)
      const previousPages = buildLessonPages(previousLesson, previousPack, previousQuestions, language)
      setUnitIndex(safeUnitIndex - 1)
      setLessonIndex(previousLessonIndex)
      setPageIndex(previousPages.length - 1)
    }
  }

  const openReport = (blockId: string, blockTitle: string) => {
    setReportContext({ blockId, blockTitle })
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
      pageId: page.id,
      pageIndex: safePageIndex,
      blockId: reportContext.blockId,
      blockTitle: reportContext.blockTitle,
      issueKind,
      message: issueText.trim(),
      createdAt: new Date().toISOString(),
    })
    setReportSaved(true)
  }

  const updateAnswer = (questionId: string, next: AnswerState) => {
    setAnswerStates((current) => ({ ...current, [questionId]: next }))
  }

  const renderPage = () => {
    if (page.kind === 'intro') {
      return (
        <div className="curriculum-page-card curriculum-page-intro">
          <span className="curriculum-page-kicker">START</span>
          <h2>{lesson.title}</h2>
          <p className="curriculum-page-lead">{lesson.objective}</p>
          <div className="curriculum-success-grid">
            {lesson.successCriteria.map((criterion, index) => <div key={criterion}><span>{index + 1}</span><strong>{criterion}</strong></div>)}
          </div>
        </div>
      )
    }

    if (page.kind === 'concept') {
      return (
        <div className="curriculum-page-card curriculum-page-concept">
          <span className="curriculum-page-kicker">CONCEPT {String(page.index + 1).padStart(2, '0')}</span>
          <h2>{page.title}</h2>
          <p className="curriculum-concept-statement">{page.body}</p>
          <div className="curriculum-concept-callout">{pack.takeaway}</div>
        </div>
      )
    }

    if (page.kind === 'visual') {
      return (
        <div className="curriculum-page-card curriculum-page-visual">
          <span className="curriculum-page-kicker">VISUAL LEARNING</span>
          <h2>{pack.visual.title}</h2>
          <p>{pack.visual.caption}</p>
          <VisualCanvas pack={pack} />
        </div>
      )
    }

    if (page.kind === 'focus') {
      return (
        <div className="curriculum-page-card curriculum-page-focus">
          <span className="curriculum-page-kicker">KEY IDEA {String(page.index + 1).padStart(2, '0')}</span>
          <div className="curriculum-focus-symbol">{String(page.index + 1).padStart(2, '0')}</div>
          <h2>{page.label}</h2>
          <p>{page.detail}</p>
        </div>
      )
    }

    if (page.kind === 'model') {
      return (
        <div className="curriculum-page-card curriculum-page-model">
          <span className="curriculum-page-kicker">WORKED EXAMPLE</span>
          <h2>{page.title}</h2>
          <div className="curriculum-model-prompt">{page.prompt}</div>
          <div className="curriculum-model-flow">
            <div><span>1</span><strong>先想</strong><p>{page.hint}</p></div>
            <div><span>2</span><strong>答案</strong><p>{page.answer}</p></div>
            <div><span>3</span><strong>為什麼</strong><p>{page.explanation}</p></div>
          </div>
        </div>
      )
    }

    if (page.kind === 'question') {
      const state = answerStates[page.question.id] ?? {}
      return (
        <div className="curriculum-page-card curriculum-page-question">
          <div className="curriculum-question-heading">
            <span className="curriculum-page-kicker">PRACTICE {String(page.index + 1).padStart(2, '0')}</span>
            <span className="curriculum-question-level">{page.question.level}</span>
          </div>
          {page.question.kind === 'choice'
            ? <ChoiceQuestion question={page.question} state={state} language={language} onChange={(next) => updateAnswer(page.question.id, next)} />
            : <ResponseQuestion question={page.question} state={state} language={language} onChange={(next) => updateAnswer(page.question.id, next)} />}
        </div>
      )
    }

    return (
      <div className="curriculum-page-card curriculum-page-recap">
        <span className="curriculum-page-kicker">RECAP</span>
        <h2>{language === 'zh' ? '這堂課真正要帶走的內容' : 'What to remember'}</h2>
        <p className="curriculum-recap-main">{pack.takeaway}</p>
        <div className="curriculum-success-grid compact">
          {lesson.successCriteria.map((criterion, index) => <div key={criterion}><span>✓</span><strong>{criterion}</strong></div>)}
        </div>
        <button type="button" className="curriculum-complete-page" onClick={completeLesson}>
          {completedLessonIds.includes(lesson.id) ? '✓ 已完成這一課' : '標記這一課完成'}
        </button>
      </div>
    )
  }

  return (
    <div className={`curriculum-course-app curriculum-paged-course course-${subject}`}>
      <header className="curriculum-course-header">
        <div className="curriculum-course-brand">
          <span className="curriculum-course-subject-icon">{subjectMeta.icon}</span>
          <div><p>正式課程 v4 · {gradeLabel(grade, language)}</p><h1>{language === 'zh' ? subjectMeta.zh : subjectMeta.en}</h1><span>{unit.title} · {lessonKindLabel(lesson, language)}</span></div>
        </div>
        <div className="curriculum-course-header-actions">
          <div className="curriculum-course-progress-chip"><span>整體進度</span><strong>{overallProgress}%</strong></div>
          <button type="button" className="curriculum-directory-button" onClick={() => setDirectoryOpen(true)}>☰ 課程目錄</button>
        </div>
      </header>

      <main className="curriculum-paged-stage">
        <div className="curriculum-paged-meta">
          <span>{semester === 1 ? '上學期' : '下學期'}</span>
          <span>{String(safeUnitIndex + 1).padStart(2, '0')} · {unit.title}</span>
          <span>Lesson {safeLessonIndex + 1}/{unit.lessons.length}</span>
          <span>頁面 {safePageIndex + 1}/{pages.length}</span>
        </div>

        <div className="curriculum-page-progress"><span style={{ width: `${pageProgress}%` }} /></div>

        <section className="curriculum-single-page">
          {renderPage()}
          <div className="curriculum-page-report"><button type="button" onClick={() => openReport(page.id, page.title)}>內容有問題？反映問題</button></div>
        </section>

        <footer className="curriculum-paged-navigation">
          <button type="button" className="curriculum-secondary-action" disabled={safeUnitIndex === 0 && safeLessonIndex === 0 && safePageIndex === 0} onClick={goPrevious}>← 上一頁</button>
          <div className="curriculum-page-counter"><strong>{safePageIndex + 1}</strong><span>/ {pages.length}</span></div>
          <button type="button" className="curriculum-primary-action" onClick={goNext}>{safePageIndex === pages.length - 1 ? '完成並前往下一課 →' : '下一頁 →'}</button>
        </footer>
      </main>

      <aside className={`curriculum-course-directory${directoryOpen ? ' open' : ''}`} aria-hidden={!directoryOpen}>
        <header><div><p>COURSE MAP</p><h2>{gradeLabel(grade, language)} · {language === 'zh' ? subjectMeta.zh : subjectMeta.en}</h2></div><button type="button" onClick={() => setDirectoryOpen(false)}>×</button></header>
        <div className="curriculum-directory-semesters"><button type="button" className={semester === 1 ? 'active' : ''} onClick={() => selectSemester(1)}>上學期</button><button type="button" className={semester === 2 ? 'active' : ''} onClick={() => selectSemester(2)}>下學期</button></div>
        <div className="curriculum-directory-units">
          {semesterPlan.units.map((directoryUnit, directoryUnitIndex) => (
            <section key={directoryUnit.id} className={directoryUnitIndex === safeUnitIndex ? 'active' : ''}>
              <button className="curriculum-directory-unit-title" type="button" onClick={() => { setUnitIndex(directoryUnitIndex); setLessonIndex(0); setPageIndex(0); setDirectoryOpen(false) }}>
                <span>{String(directoryUnitIndex + 1).padStart(2, '0')}</span><div><strong>{directoryUnit.title}</strong><small>{directoryUnit.lessons.filter((item) => completedLessonIds.includes(item.id)).length}/{directoryUnit.lessons.length} 已完成</small></div>
              </button>
              <div className="curriculum-directory-lessons">
                {directoryUnit.lessons.map((directoryLesson, directoryLessonIndex) => (
                  <button type="button" className={directoryUnitIndex === safeUnitIndex && directoryLessonIndex === safeLessonIndex ? 'active' : ''} key={directoryLesson.id} onClick={() => selectLesson(directoryUnitIndex, directoryLessonIndex)}>
                    <span>{completedLessonIds.includes(directoryLesson.id) ? '✓' : directoryLessonIndex + 1}</span><div><strong>{lessonKindLabel(directoryLesson, language)}</strong><small>{directoryLesson.estimatedMinutes} 分鐘</small></div>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
        <footer><small>課程依據</small><p>{course.sourceBasis}</p>{course.note ? <p>{course.note}</p> : null}</footer>
      </aside>

      <aside className={`curriculum-issue-curtain${reportContext ? ' open' : ''}`} aria-hidden={!reportContext}>
        <header><div><p>CONTENT SUPPORT</p><h2>內容有問題？反映問題</h2></div><button type="button" onClick={() => setReportContext(null)}>×</button></header>
        {reportContext ? (
          <div className="curriculum-issue-body">
            <div className="curriculum-report-context"><span>{gradeLabel(grade, language)} · {language === 'zh' ? subjectMeta.zh : subjectMeta.en}</span><strong>{unit.title}</strong><small>{lesson.title} · 第 {safePageIndex + 1} 頁 · {reportContext.blockTitle}</small></div>
            <p className="curriculum-report-hint">年級、科目、單元、Lesson 與目前頁面都會一起記錄，之後接課程 AI 時不需要重新描述你卡在哪裡。</p>
            <div className="curriculum-issue-types">{(['unclear', 'possible-error', 'answer', 'wording', 'other'] as IssueKind[]).map((kind) => <button type="button" className={issueKind === kind ? 'active' : ''} key={kind} onClick={() => { setIssueKind(kind); setReportSaved(false) }}>{issueLabel(kind, language)}</button>)}</div>
            <label className="curriculum-report-text"><span>補充說明</span><textarea value={issueText} placeholder="例如：我不懂這個選項為什麼錯；或教材這裡好像少了一個條件……" onChange={(event) => { setIssueText(event.target.value); setReportSaved(false) }} /></label>
            {reportSaved ? <div className="curriculum-report-saved">✓ 已記錄這個問題。</div> : <button className="curriculum-report-submit" type="button" onClick={submitReport}>送出問題</button>}
          </div>
        ) : null}
      </aside>

      {directoryOpen ? <button type="button" className="curriculum-course-backdrop" aria-label="關閉" onClick={() => setDirectoryOpen(false)} /> : null}
      {reportContext ? <button type="button" className="curriculum-issue-backdrop" aria-label="關閉" onClick={() => setReportContext(null)} /> : null}
    </div>
  )
}
