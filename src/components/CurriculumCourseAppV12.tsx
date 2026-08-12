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
  type CurriculumQuestionEnhancement,
  type CurriculumUnitContent,
  type ReviewedQuestion,
  type ReviewedWorkedExample,
} from '../curriculum-reviewed-content'
import { CURRICULUM_VETTED_MEDIA } from '../curriculum-vetted-media'
import type { CurriculumSemester, CurriculumSubjectId } from '../curriculum-plan'
import type { Language } from '../types'
import '../curriculum-course-v12.css'

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

function lessonLabel(lesson: CurriculumLessonPlan) {
  return LESSON_LABEL[lesson.kind]
}

function splitQuestionBank(content: CurriculumUnitContent) {
  const all = content.questions
  if (!all.length) return { guided: [], practice: [], assessment: [] }

  if (all.length < 3) {
    return {
      guided: all.slice(0, 1),
      practice: all.slice(1, 2),
      assessment: all.slice(2),
    }
  }

  const guidedEnd = Math.max(1, Math.floor(all.length * 0.34))
  const practiceEnd = Math.max(guidedEnd + 1, Math.floor(all.length * 0.67))
  return {
    guided: all.slice(0, guidedEnd),
    practice: all.slice(guidedEnd, practiceEnd),
    assessment: all.slice(practiceEnd),
  }
}

function questionSlice(content: CurriculumUnitContent, lesson: CurriculumLessonPlan) {
  const groups = splitQuestionBank(content)
  if (lesson.kind === 'guided') return groups.guided
  if (lesson.kind === 'practice') return groups.practice
  if (lesson.kind === 'assessment') return groups.assessment
  return []
}

function buildContentPages(content: CurriculumUnitContent, lesson: CurriculumLessonPlan): LessonPage[] {
  const currentLessonLabel = lessonLabel(lesson)

  if (lesson.kind === 'launch') {
    return [
      { id: `${lesson.id}-intro`, kind: 'intro', title: `${currentLessonLabel}｜先知道這單元要解決什麼`, body: content.overview },
      { id: `${lesson.id}-map`, kind: 'concept-map', title: '這個單元有哪些核心概念？' },
      { id: `${lesson.id}-recap`, kind: 'recap', title: '準備好了，接著進入核心觀念' },
    ]
  }

  if (lesson.kind === 'concept') {
    const pages: LessonPage[] = [
      { id: `${lesson.id}-intro`, kind: 'intro', title: `${currentLessonLabel}｜把觀念逐個學清楚`, body: '每一頁只處理一個核心概念。先理解意思，再看例子，最後用後面的練習確認自己真的會用。' },
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
      { id: `${lesson.id}-intro`, kind: 'intro', title: `${currentLessonLabel}｜看完整思考過程`, body: '接下來看完整情境，逐步追蹤「已知什麼、為什麼選這個方法、怎麼檢查結果」。示範題不和後面的練習題重複。' },
    ]
    content.workedExamples.forEach((model, index) => pages.push({ id: `${lesson.id}-model-${index}`, kind: 'model', title: model.title, model, index }))
    pages.push({ id: `${lesson.id}-recap`, kind: 'recap', title: '示範完成，下一課開始自己做' })
    return pages
  }

  const questions = questionSlice(content, lesson)
  const introCopy = lesson.kind === 'guided'
    ? '這組題會先從較直接的應用開始。先自己判斷，作答後再看解析；如果卡住，可以回核心觀念頁。'
    : lesson.kind === 'practice'
      ? '這組題和引導練習不同，改用新的數字、文本、資料或情境，確認你不是只記住上一題。'
      : '這組檢核題沒有在前面的引導與獨立練習出現過，用來確認你能否把本單元觀念獨立用出來。'

  const pages: LessonPage[] = [
    { id: `${lesson.id}-intro`, kind: 'intro', title: `${currentLessonLabel}｜一頁一題`, body: introCopy },
  ]
  questions.forEach((question, index) => pages.push({ id: `${lesson.id}-${question.id}`, kind: 'question', title: `${currentLessonLabel} ${index + 1}`, question, index }))
  pages.push({ id: `${lesson.id}-recap`, kind: 'recap', title: `${currentLessonLabel}完成` })
  return pages
}

function buildPages(content: CurriculumUnitContent | null, lesson: CurriculumLessonPlan): LessonPage[] {
  if (!content) return [{ id: `${lesson.id}-editorial`, kind: 'editorial', title: '這個單元正在準備' }]
  return buildContentPages(content, lesson)
}

function questionEnhancement(question: ReviewedQuestion) {
  return question as ReviewedQuestion & CurriculumQuestionEnhancement
}

function playSpeech(text: string) {
  if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = 0.92
  window.speechSynthesis.speak(utterance)
}

function QuestionMedia({ question }: { question: ReviewedQuestion }) {
  const enhancement = questionEnhancement(question)
  if (!enhancement.mediaAssetId) return null
  const asset = CURRICULUM_VETTED_MEDIA.find((item) => item.id === enhancement.mediaAssetId)
  if (!asset) return <div className="curriculum-question-media-missing">這題的教材圖暫時無法載入，請先跳過這題。</div>

  return (
    <figure className="curriculum-question-media">
      <div className="curriculum-question-media-frame"><img src={asset.src} alt={asset.alt} loading="eager" decoding="async" referrerPolicy="no-referrer" /></div>
      <figcaption><strong>{asset.title}</strong><span>{asset.caption}</span><a href={asset.sourcePage} target="_blank" rel="noreferrer">圖片來源與授權</a></figcaption>
    </figure>
  )
}

function AudioPrompt({ question, language }: { question: ReviewedQuestion; language: Language }) {
  const text = questionEnhancement(question).audioText
  if (!text) return null
  return (
    <div className="curriculum-audio-question">
      <button type="button" onClick={() => playSpeech(text)}>🔊 {language === 'zh' ? '播放聽力' : 'Play audio'}</button>
      <span>{language === 'zh' ? '先聽內容，再看題目作答；可重播。' : 'Listen first, then answer. You may replay it.'}</span>
    </div>
  )
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
  const enhancement = questionEnhancement(question)
  const selectedFeedback = checked && selected !== undefined ? enhancement.optionFeedback?.[selected] : undefined

  return (
    <div className="curriculum-paged-question">
      <QuestionMedia question={question} />
      <AudioPrompt question={question} language={language} />
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
      {checked ? (
        <div className={`curriculum-answer-feedback ${correct ? 'correct' : 'wrong'}`}>
          <strong>{correct ? '✓ 答對了' : '再檢查一次'}</strong>
          {selectedFeedback ? <p className="curriculum-option-feedback">{selectedFeedback}</p> : null}
          <p>{question.explanation}</p>
        </div>
      ) : null}
    </div>
  )
}

function ResponseQuestion({ question, state, language, onChange }: {
  question: Extract<ReviewedQuestion, { kind: 'response' }>
  state: AnswerState
  language: Language
  onChange: (next: AnswerState) => void
}) {
  const enhancement = questionEnhancement(question)
  return (
    <div className="curriculum-paged-question">
      <QuestionMedia question={question} />
      <AudioPrompt question={question} language={language} />
      {question.context ? <div className="curriculum-question-context">{question.context}</div> : null}
      <h3>{question.prompt}</h3>
      <textarea className="curriculum-response-input" value={state.text ?? ''} placeholder={language === 'zh' ? '先寫下你的判斷與理由。' : 'Write your answer and reasoning.'} onChange={(event) => onChange({ text: event.target.value, checked: false })} />
      <button type="button" className="curriculum-check-answer" disabled={!state.text?.trim()} onClick={() => onChange({ ...state, checked: true })}>{language === 'zh' ? '對照評分焦點' : 'Check criteria'}</button>
      {state.checked ? (
        <div className="curriculum-answer-feedback neutral">
          {enhancement.rubric?.length ? <div className="curriculum-response-rubric"><strong>評分焦點</strong><ul>{enhancement.rubric.map((item) => <li key={item}>{item}</li>)}</ul></div> : null}
          <strong>參考作答</strong><p>{question.sampleAnswer}</p><p>{question.explanation}</p>
        </div>
      ) : null}
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
  const semesterPlan = course.semesters.find((item) => item.semester === semester) ?? course.semesters[0]
  const safeUnitIndex = Math.min(unitIndex, Math.max(0, semesterPlan.units.length - 1))
  const unit: CurriculumUnitBundle = semesterPlan.units[safeUnitIndex]
  const safeLessonIndex = Math.min(lessonIndex, Math.max(0, unit.lessons.length - 1))
  const lesson = unit.lessons[safeLessonIndex]
  const unitContent = getCurriculumUnitContent(unit.id)
  const pages = buildPages(unitContent, lesson)
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
    if (semester === 1) selectSemester(2)
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
      return <div className="curriculum-page-card curriculum-editorial-page"><span className="curriculum-page-kicker">課程準備中</span><h2>這個單元正在整理</h2><p className="curriculum-page-lead">{unit.focus}</p></div>
    }
    if (!unitContent) return null

    if (page.kind === 'intro') return <div className="curriculum-page-card curriculum-page-intro"><span className="curriculum-page-kicker">{lessonLabel(lesson)}</span><h2>{page.title}</h2><p className="curriculum-page-lead">{page.body}</p></div>

    if (page.kind === 'concept-map') return <div className="curriculum-page-card curriculum-page-concept-map"><span className="curriculum-page-kicker">COURSE MAP</span><h2>{page.title}</h2><div className="curriculum-concept-map-list">{unitContent.concepts.map((concept, index) => <div key={`${concept.title}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span><strong>{concept.title}</strong></div>)}</div></div>

    if (page.kind === 'concept') return <div className="curriculum-page-card curriculum-page-concept"><span className="curriculum-page-kicker">CONCEPT {String(page.index + 1).padStart(2, '0')} / {String(unitContent.concepts.length).padStart(2, '0')}</span><h2>{page.title}</h2><p className="curriculum-concept-statement">{page.explanation}</p>{page.example ? <div className="curriculum-concept-example"><strong>例子</strong><p>{page.example}</p></div> : null}</div>

    if (page.kind === 'model') return <div className="curriculum-page-card curriculum-page-model-v5"><span className="curriculum-page-kicker">WORKED EXAMPLE {page.index + 1}</span><h2>{page.model.title}</h2><div className="curriculum-model-context"><strong>資料／情境</strong><p>{page.model.context}</p></div><h3>{page.model.prompt}</h3><div className="curriculum-model-steps-v5">{page.model.steps.map((step, index) => <div key={`${step}-${index}`}><span>{index + 1}</span><p>{step}</p></div>)}</div><div className="curriculum-model-answer-v5"><strong>結論</strong><p>{page.model.answer}</p><small>{page.model.explanation}</small></div></div>

    if (page.kind === 'question') {
      const state = answerStates[page.question.id] ?? {}
      return <div className="curriculum-page-card curriculum-page-question"><div className="curriculum-question-heading"><span className="curriculum-page-kicker">{page.title}</span><span className="curriculum-question-level">{page.question.level}</span></div>{page.question.kind === 'choice' ? <ChoiceQuestion question={page.question} state={state} language={language} onChange={(next) => updateAnswer(page.question.id, next)} /> : <ResponseQuestion question={page.question} state={state} language={language} onChange={(next) => updateAnswer(page.question.id, next)} />}</div>
    }

    return <div className="curriculum-page-card curriculum-page-recap"><span className="curriculum-page-kicker">RECAP</span><h2>{page.title}</h2><div className="curriculum-takeaway-v5">{unitContent.takeaway.map((item, index) => <div key={`${item}-${index}`}><span>✓</span><strong>{item}</strong></div>)}</div>{lesson.kind === 'assessment' ? <button type="button" className="curriculum-complete-page" onClick={completeLesson}>{completedLessonIds.includes(lesson.id) ? '✓ 已完成目前檢核' : '完成目前檢核'}</button> : null}</div>
  }

  return (
    <div className={`curriculum-course-app curriculum-paged-course curriculum-course-v5 curriculum-course-v12 course-${subject}`}>
      <header className="curriculum-compact-bar">
        <div className="curriculum-compact-identity"><span className="curriculum-compact-icon">{subjectMeta.icon}</span><div><strong>{gradeLabel(grade, language)} {language === 'zh' ? subjectMeta.zh : subjectMeta.en}</strong><small>{unit.title}</small></div></div>
        <div className="curriculum-compact-meta"><span>{semester === 1 ? '上學期' : '下學期'}</span><span>{lessonLabel(lesson)} {safeLessonIndex + 1}/{unit.lessons.length}</span><span>頁 {safePageIndex + 1}/{pages.length}</span></div>
        <div className="curriculum-compact-actions"><span className="curriculum-compact-progress">{overallProgress}%</span><button type="button" onClick={() => setDirectoryOpen(true)}>☰ 課程目錄</button></div>
      </header>

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
          return <section key={directoryUnit.id} className={directoryUnitIndex === safeUnitIndex ? 'active' : ''}><button className="curriculum-directory-unit-title" type="button" onClick={() => { setUnitIndex(directoryUnitIndex); setLessonIndex(0); setPageIndex(0); setDirectoryOpen(false) }}><span>{String(directoryUnitIndex + 1).padStart(2, '0')}</span><div><strong>{directoryUnit.title}</strong>{directoryContent ? null : <small>內容準備中</small>}</div></button><div className="curriculum-directory-lessons">{directoryUnit.lessons.map((directoryLesson, directoryLessonIndex) => <button type="button" className={directoryUnitIndex === safeUnitIndex && directoryLessonIndex === safeLessonIndex ? 'active' : ''} key={directoryLesson.id} onClick={() => selectLesson(directoryUnitIndex, directoryLessonIndex)}><span>{completedLessonIds.includes(directoryLesson.id) ? '✓' : directoryLessonIndex + 1}</span><div><strong>{lessonLabel(directoryLesson)}</strong><small>{directoryContent ? `${directoryLesson.estimatedMinutes} 分鐘` : '內容準備中'}</small></div></button>)}</div></section>
        })}</div>
      </aside>

      <aside className={`curriculum-issue-curtain${reportContext ? ' open' : ''}`} aria-hidden={!reportContext}>
        <header><div><p>CONTENT SUPPORT</p><h2>內容有問題？反映問題</h2></div><button type="button" onClick={() => setReportContext(null)}>×</button></header>
        {reportContext ? <div className="curriculum-issue-body"><div className="curriculum-report-context"><span>{gradeLabel(grade, language)} · {language === 'zh' ? subjectMeta.zh : subjectMeta.en}</span><strong>{unit.title}</strong><small>{lessonLabel(lesson)} · 第 {safePageIndex + 1} 頁 · {reportContext.blockTitle}</small></div><p className="curriculum-report-hint">送出後會一併記錄目前課程位置，方便後續協助處理這個問題。</p><div className="curriculum-issue-types">{(['unclear', 'possible-error', 'answer', 'wording', 'other'] as IssueKind[]).map((kind) => <button type="button" className={issueKind === kind ? 'active' : ''} key={kind} onClick={() => { setIssueKind(kind); setReportSaved(false) }}>{issueLabel(kind, language)}</button>)}</div><label className="curriculum-report-text"><span>補充說明</span><textarea value={issueText} placeholder="例如：我不懂這個選項為什麼錯；或這裡是不是少了一個條件……" onChange={(event) => { setIssueText(event.target.value); setReportSaved(false) }} /></label>{reportSaved ? <div className="curriculum-report-saved">✓ 已記錄這個問題。</div> : <button className="curriculum-report-submit" type="button" onClick={submitReport}>送出問題</button>}</div> : null}
      </aside>

      {directoryOpen ? <button type="button" className="curriculum-course-backdrop" aria-label="關閉" onClick={() => setDirectoryOpen(false)} /> : null}
      {reportContext ? <button type="button" className="curriculum-issue-backdrop" aria-label="關閉" onClick={() => setReportContext(null)} /> : null}
    </div>
  )
}
