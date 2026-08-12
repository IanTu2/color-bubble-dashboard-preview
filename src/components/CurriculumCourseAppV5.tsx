import { useMemo, useState } from 'react'
import {
  getCurriculumCourseBundle,
  readCurriculumProgress,
  writeCurriculumProgress,
  type CurriculumLessonPlan,
  type CurriculumUnitBundle,
} from '../curriculum-course-engine'
import {
  getCurriculumUnitContent,
  isReviewedUnit,
  type CurriculumUnitContent,
  type ReviewedQuestion,
  type ReviewedWorkedExample,
} from '../curriculum-reviewed-content'
import {
  getTrackPolicy,
  getUnitAuditSnapshot,
  type CurriculumAuditSnapshot,
} from '../curriculum-audit-registry'
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
  | { id: string; kind: 'intro'; title: string; body: string }
  | { id: string; kind: 'concept-map'; title: string }
  | { id: string; kind: 'concept'; title: string; explanation: string; example?: string; index: number }
  | { id: string; kind: 'model'; title: string; model: ReviewedWorkedExample; index: number }
  | { id: string; kind: 'question'; title: string; question: ReviewedQuestion; index: number }
  | { id: string; kind: 'recap'; title: string }
  | { id: string; kind: 'editorial'; title: string }

const SUBJECT_META: Record<CurriculumSubjectId, { zh: string; en: string; icon: string }> = {
  chinese: { zh: '國文', en: 'Chinese', icon: '文' },
  english: { zh: '英文', en: 'English', icon: 'EN' },
  math: { zh: '數學', en: 'Math', icon: '∑' },
  science: { zh: '自然', en: 'Science', icon: '⚗' },
  social: { zh: '社會', en: 'Social studies', icon: '社' },
}

const LESSON_LABEL: Record<CurriculumLessonPlan['kind'], string> = {
  launch: '導入',
  concept: '核心觀念',
  example: '完整示範',
  guided: '引導練習',
  practice: '獨立練習',
  assessment: '單元檢核',
}

function gradeLabel(grade: number, language: Language) {
  if (language === 'en') return `Grade ${grade}`
  if (grade <= 6) return `${['一', '二', '三', '四', '五', '六'][grade - 1]}年級`
  if (grade <= 9) return `${['七', '八', '九'][grade - 7]}年級`
  return `高${['一', '二', '三'][grade - 10]}`
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

function compactAuditLabel(audit: CurriculumAuditSnapshot) {
  if (audit.tier === 'textbook-ready') return '✓ 教科書級'
  if (audit.tier === 'scope-verified') return '課綱範圍已核對'
  if (audit.tier === 'legacy-reviewed') return '人工內容 · 待複核'
  if (audit.tier === 'foundation-draft') return '教材初稿'
  return audit.label
}

function lessonLabel(lesson: CurriculumLessonPlan, audit: CurriculumAuditSnapshot) {
  if (lesson.kind === 'assessment' && audit.tier === 'foundation-draft') return '學習策略自我檢核'
  return LESSON_LABEL[lesson.kind]
}

function questionSlice(content: CurriculumUnitContent, lesson: CurriculumLessonPlan) {
  const all = content.questions
  if (lesson.kind === 'launch') return all.slice(0, Math.min(2, all.length))
  if (lesson.kind === 'example') return all.slice(0, Math.min(3, all.length))
  if (lesson.kind === 'guided') return all.slice(0, Math.min(5, all.length))
  if (lesson.kind === 'practice') return all.slice(Math.max(0, all.length - 6))
  if (lesson.kind === 'assessment') return all
  return []
}

function buildContentPages(content: CurriculumUnitContent, lesson: CurriculumLessonPlan, audit: CurriculumAuditSnapshot): LessonPage[] {
  const currentLessonLabel = lessonLabel(lesson, audit)

  if (lesson.kind === 'launch') {
    const pages: LessonPage[] = [
      { id: `${lesson.id}-intro`, kind: 'intro', title: `${currentLessonLabel}｜先知道這單元要解決什麼`, body: content.overview },
      { id: `${lesson.id}-map`, kind: 'concept-map', title: '這個單元有哪些核心概念？' },
    ]
    questionSlice(content, lesson).forEach((question, index) => pages.push({ id: `${lesson.id}-${question.id}`, kind: 'question', title: `先備判斷 ${index + 1}`, question, index }))
    pages.push({ id: `${lesson.id}-recap`, kind: 'recap', title: '導入完成' })
    return pages
  }

  if (lesson.kind === 'concept') {
    const pages: LessonPage[] = [
      { id: `${lesson.id}-intro`, kind: 'intro', title: `${currentLessonLabel}｜逐個把觀念講清楚`, body: `這一課共有 ${content.concepts.length} 個核心概念。頁數由實際概念數決定，不套固定兩頁模板。` },
    ]
    content.concepts.forEach((concept, index) => pages.push({
      id: `${lesson.id}-concept-${index}`,
      kind: 'concept',
      title: concept.title,
      explanation: concept.explanation,
      example: concept.example,
      index,
    }))
    pages.push({ id: `${lesson.id}-recap`, kind: 'recap', title: '核心觀念整理' })
    return pages
  }

  if (lesson.kind === 'example') {
    const pages: LessonPage[] = [
      { id: `${lesson.id}-intro`, kind: 'intro', title: `${currentLessonLabel}｜從條件走到結論`, body: '示範頁會把題目需要的資料一起提供，並逐步說明每一步為什麼成立；如果題目需要圖片、圖表或地圖，素材必須和題幹一起提供。' },
    ]
    content.workedExamples.forEach((model, index) => pages.push({ id: `${lesson.id}-model-${index}`, kind: 'model', title: model.title, model, index }))
    questionSlice(content, lesson).forEach((question, index) => pages.push({ id: `${lesson.id}-${question.id}`, kind: 'question', title: `示範後檢查 ${index + 1}`, question, index }))
    pages.push({ id: `${lesson.id}-recap`, kind: 'recap', title: '示範完成' })
    return pages
  }

  const questions = questionSlice(content, lesson)
  const foundation = audit.tier === 'foundation-draft'
  const pages: LessonPage[] = [
    {
      id: `${lesson.id}-intro`,
      kind: 'intro',
      title: `${currentLessonLabel}｜${lesson.kind === 'assessment' ? '確認目前能說明到什麼程度' : '一頁一題，真的作答'}`,
      body: foundation
        ? '這一層仍是教材初稿。現有題目主要用來檢查「會不會解釋觀念、選擇可靠的學習方法」，屬於學習策略自我檢核，不能當作正式教科書題庫。正式題庫會逐單元補成計算、閱讀、語境、資料、史料、圖表或實驗等真正的科目題型。'
        : lesson.kind === 'guided'
          ? '先依題目提供的條件作答；答完後才看解析。卡住時可以回課程目錄重看核心觀念。'
          : lesson.kind === 'practice'
            ? '這一課不重複長篇教學，直接用不同情境練習。每一題都必須自帶作答所需的文字、數據或背景。'
            : '單元檢核使用目前已人工整理的題目。這仍不自動等於「教科書級」；只有通過 v10 課綱、內容、題庫、媒體與教學流程 gate 的單元才會取得教科書級標記。',
    },
  ]
  questions.forEach((question, index) => pages.push({ id: `${lesson.id}-${question.id}`, kind: 'question', title: `${currentLessonLabel} ${index + 1}`, question, index }))
  pages.push({ id: `${lesson.id}-recap`, kind: 'recap', title: `${currentLessonLabel}完成` })
  return pages
}

function buildPages(content: CurriculumUnitContent | null, lesson: CurriculumLessonPlan, audit: CurriculumAuditSnapshot): LessonPage[] {
  if (!content) return [{ id: `${lesson.id}-editorial`, kind: 'editorial', title: '這個單元正在內容編修' }]
  return buildContentPages(content, lesson, audit)
}

function ChoiceQuestion({ question, state, language, onChange }: {
  question: Extract<ReviewedQuestion, { kind: 'choice' }>
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
            <button type="button" className={classes} key={`${option}-${index}`} onClick={() => onChange({ selectedIndex: index, checked: false })}>
              <span>{String.fromCharCode(65 + index)}</span><strong>{option}</strong>
            </button>
          )
        })}
      </div>
      <button type="button" className="curriculum-check-answer" disabled={selected === undefined} onClick={() => onChange({ ...state, checked: true })}>
        {language === 'zh' ? '確認答案' : 'Check answer'}
      </button>
      {checked ? <div className={`curriculum-answer-feedback ${correct ? 'correct' : 'wrong'}`}><strong>{correct ? '✓ 答對了' : '再看一次觀念'}</strong><p>{question.explanation}</p></div> : null}
    </div>
  )
}

function ResponseQuestion({ question, state, language, onChange }: {
  question: Extract<ReviewedQuestion, { kind: 'response' }>
  state: AnswerState
  language: Language
  onChange: (next: AnswerState) => void
}) {
  return (
    <div className="curriculum-paged-question">
      {question.context ? <div className="curriculum-question-context">{question.context}</div> : null}
      <h3>{question.prompt}</h3>
      <textarea className="curriculum-response-input" value={state.text ?? ''} placeholder={language === 'zh' ? '先寫下你的判斷與理由。' : 'Write your answer and reasoning.'} onChange={(event) => onChange({ text: event.target.value, checked: false })} />
      <button type="button" className="curriculum-check-answer" disabled={!state.text?.trim()} onClick={() => onChange({ ...state, checked: true })}>對照評分焦點</button>
      {state.checked ? <div className="curriculum-answer-feedback neutral"><strong>參考作答</strong><p>{question.sampleAnswer}</p><p>{question.explanation}</p></div> : null}
    </div>
  )
}

export function CurriculumCourseApp({ language, userId, grade, subject }: Props) {
  const course = useMemo(() => getCurriculumCourseBundle(grade, subject), [grade, subject])
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
  const trackPolicy = getTrackPolicy(grade, subject)
  const semesterPlan = course.semesters.find((item) => item.semester === semester) ?? course.semesters[0]
  const safeUnitIndex = Math.min(unitIndex, Math.max(0, semesterPlan.units.length - 1))
  const unit: CurriculumUnitBundle = semesterPlan.units[safeUnitIndex]
  const safeLessonIndex = Math.min(lessonIndex, Math.max(0, unit.lessons.length - 1))
  const lesson = unit.lessons[safeLessonIndex]
  const unitContent = getCurriculumUnitContent(unit.id)
  const strictReviewed = isReviewedUnit(unit.id)
  const audit = getUnitAuditSnapshot({ grade, subject, unitId: unit.id, strictReviewed })
  const pages = buildPages(unitContent, lesson, audit)
  const safePageIndex = Math.min(pageIndex, Math.max(0, pages.length - 1))
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
    setSemester(next); setUnitIndex(0); setLessonIndex(0); setPageIndex(0)
  }

  const selectLesson = (nextUnitIndex: number, nextLessonIndex: number) => {
    setUnitIndex(nextUnitIndex); setLessonIndex(nextLessonIndex); setPageIndex(0); setDirectoryOpen(false)
  }

  const goToNextLesson = () => {
    if (unitContent) completeLesson()
    if (safeLessonIndex < unit.lessons.length - 1) { setLessonIndex(safeLessonIndex + 1); setPageIndex(0); return }
    if (safeUnitIndex < semesterPlan.units.length - 1) { setUnitIndex(safeUnitIndex + 1); setLessonIndex(0); setPageIndex(0); return }
    if (semester === 1) { selectSemester(2); return }
  }

  const goNext = () => {
    if (safePageIndex < pages.length - 1) { setPageIndex(safePageIndex + 1); return }
    if (unitContent) goToNextLesson()
  }

  const goPrevious = () => {
    if (safePageIndex > 0) { setPageIndex(safePageIndex - 1); return }
    if (safeLessonIndex > 0) { setLessonIndex(safeLessonIndex - 1); setPageIndex(0); return }
    if (safeUnitIndex > 0) { setUnitIndex(safeUnitIndex - 1); setLessonIndex(0); setPageIndex(0) }
  }

  const openReport = (blockId: string, blockTitle: string) => {
    setReportContext({ blockId, blockTitle }); setIssueKind('unclear'); setIssueText(''); setReportSaved(false)
  }

  const submitReport = () => {
    if (!reportContext) return
    saveReport(userId, {
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
      grade, subject, semester, unitId: unit.id, unitTitle: unit.title, lessonId: lesson.id, lessonTitle: lesson.title,
      pageId: page.id, pageIndex: safePageIndex, blockId: reportContext.blockId, blockTitle: reportContext.blockTitle,
      issueKind, message: issueText.trim(), createdAt: new Date().toISOString(),
    })
    setReportSaved(true)
  }

  const updateAnswer = (questionId: string, next: AnswerState) => setAnswerStates((current) => ({ ...current, [questionId]: next }))

  const renderPage = () => {
    if (page.kind === 'editorial') {
      return (
        <div className="curriculum-page-card curriculum-editorial-page">
          <span className="curriculum-page-kicker">CONTENT QA</span>
          <h2>這個單元正在重新編修</h2>
          <p className="curriculum-page-lead">{unit.focus}</p>
          <div className="curriculum-editorial-note">
            <strong>品質原則</strong>
            <p>沒有完整概念、示範、自足題幹與可檢查答案的內容，不會取得教科書級標記。</p>
          </div>
        </div>
      )
    }

    if (!unitContent) return null

    if (page.kind === 'intro') {
      return (
        <div className="curriculum-page-card curriculum-page-intro">
          <span className="curriculum-page-kicker">{lessonLabel(lesson, audit)}</span>
          <h2>{page.title}</h2>
          <p className="curriculum-page-lead">{page.body}</p>
          <div className={`curriculum-review-badge audit-${audit.tier}`}>
            <strong>{audit.label}</strong>
            <span>{unitContent.concepts.length} 個核心概念 · {unitContent.workedExamples.length} 個完整示範 · {unitContent.questions.length} 個目前題目</span>
          </div>
          {audit.warnings.map((warning) => <div className={`curriculum-audit-warning audit-${audit.tier}`} key={warning}>{warning}</div>)}
        </div>
      )
    }

    if (page.kind === 'concept-map') return <div className="curriculum-page-card curriculum-page-concept-map"><span className="curriculum-page-kicker">COURSE MAP</span><h2>{page.title}</h2><div className="curriculum-concept-map-list">{unitContent.concepts.map((concept, index) => <div key={concept.title}><span>{String(index + 1).padStart(2, '0')}</span><strong>{concept.title}</strong></div>)}</div></div>

    if (page.kind === 'concept') return <div className="curriculum-page-card curriculum-page-concept"><span className="curriculum-page-kicker">CONCEPT {String(page.index + 1).padStart(2, '0')} / {String(unitContent.concepts.length).padStart(2, '0')}</span><h2>{page.title}</h2><p className="curriculum-concept-statement">{page.explanation}</p>{page.example ? <div className="curriculum-concept-example"><strong>例子</strong><p>{page.example}</p></div> : null}</div>

    if (page.kind === 'model') return <div className="curriculum-page-card curriculum-page-model-v5"><span className="curriculum-page-kicker">WORKED EXAMPLE {page.index + 1}</span><h2>{page.model.title}</h2><div className="curriculum-model-context"><strong>資料／情境</strong><p>{page.model.context}</p></div><h3>{page.model.prompt}</h3><div className="curriculum-model-steps-v5">{page.model.steps.map((step, index) => <div key={step}><span>{index + 1}</span><p>{step}</p></div>)}</div><div className="curriculum-model-answer-v5"><strong>結論</strong><p>{page.model.answer}</p><small>{page.model.explanation}</small></div></div>

    if (page.kind === 'question') {
      const state = answerStates[page.question.id] ?? {}
      return <div className="curriculum-page-card curriculum-page-question"><div className="curriculum-question-heading"><span className="curriculum-page-kicker">{page.title}</span><span className="curriculum-question-level">{page.question.level}</span></div>{page.question.kind === 'choice' ? <ChoiceQuestion question={page.question} state={state} language={language} onChange={(next) => updateAnswer(page.question.id, next)} /> : <ResponseQuestion question={page.question} state={state} language={language} onChange={(next) => updateAnswer(page.question.id, next)} />}</div>
    }

    return <div className="curriculum-page-card curriculum-page-recap"><span className="curriculum-page-kicker">RECAP</span><h2>{page.title}</h2><div className="curriculum-takeaway-v5">{unitContent.takeaway.map((item) => <div key={item}><span>✓</span><strong>{item}</strong></div>)}</div>{lesson.kind === 'assessment' ? <button type="button" className="curriculum-complete-page" onClick={completeLesson}>{completedLessonIds.includes(lesson.id) ? '✓ 已完成目前檢核' : '完成目前檢核'}</button> : null}</div>
  }

  return (
    <div className={`curriculum-course-app curriculum-paged-course curriculum-course-v5 curriculum-audit-${audit.tier} course-${subject}`}>
      <header className="curriculum-compact-bar">
        <div className="curriculum-compact-identity"><span className="curriculum-compact-icon">{subjectMeta.icon}</span><div><strong>{gradeLabel(grade, language)} {language === 'zh' ? subjectMeta.zh : subjectMeta.en}</strong><small>{unit.title}</small></div></div>
        <div className="curriculum-compact-meta"><span>{semester === 1 ? '上學期' : '下學期'}</span><span>{lessonLabel(lesson, audit)} {safeLessonIndex + 1}/{unit.lessons.length}</span><span>頁 {safePageIndex + 1}/{pages.length}</span><span className={`audit-status audit-${audit.tier}`}>{compactAuditLabel(audit)}</span></div>
        <div className="curriculum-compact-actions"><span className="curriculum-compact-progress">{overallProgress}%</span><button type="button" onClick={() => setDirectoryOpen(true)}>☰ 課程目錄</button></div>
      </header>

      {trackPolicy.structure !== 'official-subject' ? <div className={`curriculum-track-policy policy-${trackPolicy.structure}`}><strong>{trackPolicy.label}</strong><span>{trackPolicy.note}</span></div> : null}

      <main className="curriculum-paged-stage curriculum-paged-stage-v5">
        <div className="curriculum-page-progress"><span style={{ width: `${pageProgress}%` }} /></div>
        <section className="curriculum-single-page">{renderPage()}<div className="curriculum-page-report"><button type="button" onClick={() => openReport(page.id, page.title)}>內容有問題？反映問題</button></div></section>
        <footer className="curriculum-paged-navigation"><button type="button" className="curriculum-secondary-action" disabled={safeUnitIndex === 0 && safeLessonIndex === 0 && safePageIndex === 0} onClick={goPrevious}>← 上一頁</button><div className="curriculum-page-counter"><strong>{safePageIndex + 1}</strong><span>/ {pages.length}</span></div><button type="button" className="curriculum-primary-action" disabled={!unitContent && safePageIndex === pages.length - 1} onClick={goNext}>{safePageIndex === pages.length - 1 ? '前往下一課 →' : '下一頁 →'}</button></footer>
      </main>

      <aside className={`curriculum-course-directory${directoryOpen ? ' open' : ''}`} aria-hidden={!directoryOpen}>
        <header><div><p>COURSE MAP</p><h2>{gradeLabel(grade, language)} · {language === 'zh' ? subjectMeta.zh : subjectMeta.en}</h2></div><button type="button" onClick={() => setDirectoryOpen(false)}>×</button></header>
        <div className="curriculum-directory-semesters"><button type="button" className={semester === 1 ? 'active' : ''} onClick={() => selectSemester(1)}>上學期</button><button type="button" className={semester === 2 ? 'active' : ''} onClick={() => selectSemester(2)}>下學期</button></div>
        <div className="curriculum-directory-units">{semesterPlan.units.map((directoryUnit, directoryUnitIndex) => {
          const directoryContent = getCurriculumUnitContent(directoryUnit.id)
          const directoryAudit = getUnitAuditSnapshot({ grade, subject, unitId: directoryUnit.id, strictReviewed: isReviewedUnit(directoryUnit.id) })
          return <section key={directoryUnit.id} className={directoryUnitIndex === safeUnitIndex ? 'active' : ''}><button className="curriculum-directory-unit-title" type="button" onClick={() => { setUnitIndex(directoryUnitIndex); setLessonIndex(0); setPageIndex(0); setDirectoryOpen(false) }}><span>{String(directoryUnitIndex + 1).padStart(2, '0')}</span><div><strong>{directoryUnit.title}</strong><small className={`audit-${directoryAudit.tier}`}>{directoryContent ? compactAuditLabel(directoryAudit) : '內容編修中'}</small></div></button><div className="curriculum-directory-lessons">{directoryUnit.lessons.map((directoryLesson, directoryLessonIndex) => <button type="button" className={directoryUnitIndex === safeUnitIndex && directoryLessonIndex === safeLessonIndex ? 'active' : ''} key={directoryLesson.id} onClick={() => selectLesson(directoryUnitIndex, directoryLessonIndex)}><span>{completedLessonIds.includes(directoryLesson.id) ? '✓' : directoryLessonIndex + 1}</span><div><strong>{lessonLabel(directoryLesson, directoryAudit)}</strong><small>{directoryContent ? `${directoryLesson.estimatedMinutes} 分鐘 · ${compactAuditLabel(directoryAudit)}` : '待內容 QA'}</small></div></button>)}</div></section>
        })}</div>
        <footer><small>內容與審核原則</small><p>先以國教院正式課綱與課程手冊核對範圍，再分別審核概念、示範、題庫與媒體。舊版「已審閱」不再自動等於教科書級。</p>{trackPolicy.structure !== 'official-subject' ? <p><strong>{trackPolicy.label}：</strong>{trackPolicy.note}</p> : null}</footer>
      </aside>

      <aside className={`curriculum-issue-curtain${reportContext ? ' open' : ''}`} aria-hidden={!reportContext}>
        <header><div><p>CONTENT SUPPORT</p><h2>內容有問題？反映問題</h2></div><button type="button" onClick={() => setReportContext(null)}>×</button></header>
        {reportContext ? <div className="curriculum-issue-body"><div className="curriculum-report-context"><span>{gradeLabel(grade, language)} · {language === 'zh' ? subjectMeta.zh : subjectMeta.en}</span><strong>{unit.title}</strong><small>{lessonLabel(lesson, audit)} · 第 {safePageIndex + 1} 頁 · {reportContext.blockTitle}</small></div><p className="curriculum-report-hint">年級、科目、單元、Lesson、頁面與目前品質層級會一起記錄，之後接課程 AI 或人工審核時可以直接定位問題。</p><div className="curriculum-issue-types">{(['unclear', 'possible-error', 'answer', 'wording', 'other'] as IssueKind[]).map((kind) => <button type="button" className={issueKind === kind ? 'active' : ''} key={kind} onClick={() => { setIssueKind(kind); setReportSaved(false) }}>{issueLabel(kind, language)}</button>)}</div><label className="curriculum-report-text"><span>補充說明</span><textarea value={issueText} placeholder="例如：我不懂這個選項為什麼錯；或這裡是不是少了一個條件……" onChange={(event) => { setIssueText(event.target.value); setReportSaved(false) }} /></label>{reportSaved ? <div className="curriculum-report-saved">✓ 已記錄這個問題。</div> : <button className="curriculum-report-submit" type="button" onClick={submitReport}>送出問題</button>}</div> : null}
      </aside>

      {directoryOpen ? <button type="button" className="curriculum-course-backdrop" aria-label="關閉" onClick={() => setDirectoryOpen(false)} /> : null}
      {reportContext ? <button type="button" className="curriculum-issue-backdrop" aria-label="關閉" onClick={() => setReportContext(null)} /> : null}
    </div>
  )
}
