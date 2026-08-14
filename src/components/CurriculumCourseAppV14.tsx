import { useMemo, useState } from 'react'
import {
  readCurriculumProgress,
  writeCurriculumProgress,
  type CurriculumLessonPlan,
  type CurriculumUnitBundle,
} from '../curriculum-course-engine'
import { getCurriculumCourseBundleV13 } from '../curriculum-course-engine-v13'
import type { CurriculumQuestionEnhancement } from '../curriculum-reviewed-content'
import type { ReviewedQuestion } from '../curriculum-reviewed-social10'
import {
  getCurriculumCourseMeta,
  type CurriculumPathwayId,
  type CurriculumSemester,
  type CurriculumSubjectId,
} from '../curriculum-plan-v5'
import { getTextbookUnitContentV14 } from '../curriculum-textbook-v14-final'
import type {
  TextbookUnitContentV14,
  TextbookVisual,
} from '../curriculum-textbook-v14'
import { CURRICULUM_VETTED_MEDIA } from '../curriculum-vetted-media'
import type { Language } from '../types'
import '../curriculum-course-v14.css'

export type CurriculumCourseSelection = {
  grade: number
  subject: CurriculumSubjectId
  pathway?: CurriculumPathwayId
}

type Props = CurriculumCourseSelection & {
  language: Language
  userId: string
}

type AnswerState = { selectedIndex?: number; text?: string; checked?: boolean }
type ReportKind = 'confusing' | 'possible-error' | 'answer-question' | 'unclear' | 'other'
type CourseView = 'overview' | 'lesson'
type Page =
  | { id: string; kind: 'intro'; title: string; body: string; objectives?: string[] }
  | { id: string; kind: 'visual'; title: string; visual: TextbookVisual }
  | { id: string; kind: 'concept'; title: string; explanation: string; example?: string; misconception?: TextbookUnitContentV14['misconceptions'][number]; index: number }
  | { id: string; kind: 'model'; title: string; context: string; prompt: string; steps: string[]; answer: string; explanation: string; index: number }
  | { id: string; kind: 'question'; title: string; question: ReviewedQuestion; index: number }
  | { id: string; kind: 'recap'; title: string; items: string[] }

const LESSON_LABEL: Record<CurriculumLessonPlan['kind'], string> = {
  launch: '開始認識',
  concept: '核心觀念',
  example: '完整例題',
  guided: '跟著練習',
  practice: '自己試試',
  assessment: '學習檢核',
}

const REPORT_OPTIONS: Array<{ id: ReportKind; label: string }> = [
  { id: 'confusing', label: '我看不懂' },
  { id: 'possible-error', label: '內容可能有錯' },
  { id: 'answer-question', label: '例題／解答有疑問' },
  { id: 'unclear', label: '敘述不清楚' },
  { id: 'other', label: '其他' },
]

function gradeLabel(grade: number, language: Language) {
  if (language === 'en') return `Grade ${grade}`
  if (grade <= 6) return `${['一', '二', '三', '四', '五', '六'][grade - 1]}年級`
  if (grade <= 9) return `${['七', '八', '九'][grade - 7]}年級`
  return `高${['一', '二', '三'][grade - 10]}`
}

function enhancement(question: ReviewedQuestion) {
  return question as ReviewedQuestion & CurriculumQuestionEnhancement
}

function questionGroups(questions: ReviewedQuestion[]) {
  if (!questions.length) return { guided: [], practice: [], assessment: [] }
  const guidedEnd = Math.max(4, Math.floor(questions.length * 0.34))
  const practiceEnd = Math.max(guidedEnd + 4, Math.floor(questions.length * 0.67))
  return {
    guided: questions.slice(0, guidedEnd),
    practice: questions.slice(guidedEnd, practiceEnd),
    assessment: questions.slice(practiceEnd),
  }
}

function buildPages(unitContent: TextbookUnitContentV14, lesson: CurriculumLessonPlan): Page[] {
  const label = LESSON_LABEL[lesson.kind]
  const conceptVisual = unitContent.visuals.find((item) => item.kind === 'concept-map') ?? unitContent.visuals[0]
  const processVisual = unitContent.visuals.find((item) => item.kind === 'process') ?? unitContent.visuals[1] ?? unitContent.visuals[0]
  const misconceptionVisual = unitContent.visuals.find((item) => item.kind === 'comparison') ?? unitContent.visuals[2] ?? unitContent.visuals[0]

  if (lesson.kind === 'launch') return [
    {
      id: `${lesson.id}-intro`,
      kind: 'intro',
      title: '這一單元要學什麼？',
      body: unitContent.overview,
      objectives: unitContent.objectives,
    },
    { id: `${lesson.id}-visual`, kind: 'visual', title: '先看整體概念', visual: conceptVisual },
    { id: `${lesson.id}-recap`, kind: 'recap', title: '開始前先記住', items: unitContent.takeaway.slice(0, 5) },
  ]

  if (lesson.kind === 'concept') return [
    {
      id: `${lesson.id}-intro`,
      kind: 'intro',
      title: '先理解，再記住',
      body: '接下來一次只處理一個觀念。讀完解釋後，看例子與常見迷思，確認自己能說出「為什麼」，而不是只背下一個答案。',
    },
    { id: `${lesson.id}-visual`, kind: 'visual', title: '觀念之間怎麼連在一起？', visual: conceptVisual },
    ...unitContent.concepts.map((concept, index): Page => ({
      id: `${lesson.id}-concept-${index}`,
      kind: 'concept',
      title: concept.title,
      explanation: concept.explanation,
      example: concept.example,
      misconception: unitContent.misconceptions[index % unitContent.misconceptions.length],
      index,
    })),
    { id: `${lesson.id}-recap`, kind: 'recap', title: '核心觀念整理', items: unitContent.takeaway },
  ]

  if (lesson.kind === 'example') return [
    {
      id: `${lesson.id}-intro`,
      kind: 'intro',
      title: '看完整思考，不只看答案',
      body: '每個例題都會保留情境、問題、步驟、答案和理由。先理解每一步為什麼成立，等一下再換一個情境自己做。',
    },
    { id: `${lesson.id}-process`, kind: 'visual', title: '這類題目可以怎麼想？', visual: processVisual },
    ...unitContent.workedExamples.map((model, index): Page => ({
      id: `${lesson.id}-model-${index}`,
      kind: 'model',
      title: model.title,
      context: model.context,
      prompt: model.prompt,
      steps: model.steps,
      answer: model.answer,
      explanation: model.explanation,
      index,
    })),
    { id: `${lesson.id}-misconception`, kind: 'visual', title: '做完例題，再看常見錯誤', visual: misconceptionVisual },
    { id: `${lesson.id}-recap`, kind: 'recap', title: '例題學完了', items: ['先辨認問題與條件', '選擇適合的方法或證據', '把推理步驟寫完整', '檢查答案與證據範圍', '換一個情境仍然能重新做一次'] },
  ]

  const groups = questionGroups(unitContent.questions)
  const questions = lesson.kind === 'guided' ? groups.guided : lesson.kind === 'practice' ? groups.practice : groups.assessment
  return [
    {
      id: `${lesson.id}-intro`,
      kind: 'intro',
      title: `${label}，確認真的會了`,
      body: lesson.kind === 'guided'
        ? '先從和教材觀念直接相關的題目開始。每題作答後都會看到提示與解析，不需要一次把所有題目做完才知道問題在哪裡。'
        : lesson.kind === 'practice'
          ? '題目會換例子、資料或問法，確認你不是只記住剛才的例題。'
          : '最後用不同題幹做一次獨立檢核。開放題會提供評分焦點，讓你能自己對照答案是否完整。',
    },
    ...(lesson.kind === 'assessment' ? [{ id: `${lesson.id}-misconception`, kind: 'visual' as const, title: '作答前，快速掃過容易錯的地方', visual: misconceptionVisual }] : []),
    ...questions.map((question, index): Page => ({
      id: `${lesson.id}-${question.id}`,
      kind: 'question',
      title: `${label} ${index + 1}`,
      question,
      index,
    })),
    { id: `${lesson.id}-recap`, kind: 'recap', title: `${label}完成`, items: unitContent.takeaway },
  ]
}

function playAudio(text: string) {
  if (!text || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const voice = new SpeechSynthesisUtterance(text)
  voice.lang = 'en-US'
  voice.rate = 0.92
  window.speechSynthesis.speak(voice)
}

function QuestionMedia({ question }: { question: ReviewedQuestion }) {
  const assetId = enhancement(question).mediaAssetId
  if (!assetId) return null
  const asset = CURRICULUM_VETTED_MEDIA.find((item) => item.id === assetId)
  if (!asset) return <div className="curriculum-v14-media-missing">教材圖目前無法載入，請回報這一題。</div>
  return (
    <figure className="curriculum-v14-media">
      <img src={asset.src} alt={asset.alt} />
      <figcaption><strong>{asset.title}</strong><span>{asset.caption}</span><small>{asset.attribution} · {asset.license}</small></figcaption>
    </figure>
  )
}

function TextbookCourse({ language, userId, grade, subject, pathway }: Props) {
  const course = useMemo(() => getCurriculumCourseBundleV13(grade, subject, pathway), [grade, subject, pathway])
  const meta = getCurriculumCourseMeta(subject, pathway)
  const [view, setView] = useState<CourseView>('overview')
  const [semester, setSemester] = useState<CurriculumSemester>(1)
  const [unitIndex, setUnitIndex] = useState(0)
  const [lessonIndex, setLessonIndex] = useState(0)
  const [pageIndex, setPageIndex] = useState(0)
  const [directoryOpen, setDirectoryOpen] = useState(false)
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({})
  const [completed, setCompleted] = useState<string[]>(() => readCurriculumProgress(userId))
  const [reportOpen, setReportOpen] = useState(false)
  const [reportKind, setReportKind] = useState<ReportKind>('confusing')
  const [reportText, setReportText] = useState('')
  const [reportSaved, setReportSaved] = useState(false)

  if (!course) return <div className="curriculum-course-empty">找不到這條課程路線。</div>

  const semesterPlan = course.semesters.find((item) => item.semester === semester) ?? course.semesters[0]
  const safeUnitIndex = Math.min(unitIndex, Math.max(0, semesterPlan.units.length - 1))
  const unit: CurriculumUnitBundle = semesterPlan.units[safeUnitIndex]
  const safeLessonIndex = Math.min(lessonIndex, Math.max(0, unit.lessons.length - 1))
  const lesson = unit.lessons[safeLessonIndex]
  const unitContent = getTextbookUnitContentV14(unit.id)

  if (!unitContent) {
    return (
      <div className="curriculum-v14-blocked">
        <strong>教材準備中</strong>
        <p>這個單元尚未通過完整教材檢查，因此暫時不顯示未完成內容。</p>
      </div>
    )
  }

  const pages = buildPages(unitContent, lesson)
  const safePageIndex = Math.min(pageIndex, Math.max(0, pages.length - 1))
  const page = pages[safePageIndex]
  const allLessons = course.semesters.flatMap((item) => item.units.flatMap((entry) => entry.lessons))
  const completedInCourse = allLessons.filter((entry) => completed.includes(entry.id)).length
  const overall = allLessons.length ? Math.round((completedInCourse / allLessons.length) * 100) : 0
  const isLastLesson = semester === 2 && safeUnitIndex === semesterPlan.units.length - 1 && safeLessonIndex === unit.lessons.length - 1

  const markComplete = () => {
    const next = Array.from(new Set([...completed, lesson.id]))
    setCompleted(next)
    writeCurriculumProgress(userId, next)
  }

  const openLesson = (nextSemester: CurriculumSemester, nextUnitIndex: number, nextLessonIndex: number) => {
    setSemester(nextSemester)
    setUnitIndex(nextUnitIndex)
    setLessonIndex(nextLessonIndex)
    setPageIndex(0)
    setAnswers({})
    setDirectoryOpen(false)
    setView('lesson')
  }

  const selectSemester = (next: CurriculumSemester) => {
    setSemester(next)
    setUnitIndex(0)
    setLessonIndex(0)
    setPageIndex(0)
    setAnswers({})
  }

  const continueCourse = () => {
    for (const semesterEntry of course.semesters) {
      for (let nextUnitIndex = 0; nextUnitIndex < semesterEntry.units.length; nextUnitIndex += 1) {
        const nextUnit = semesterEntry.units[nextUnitIndex]
        const nextLessonIndex = nextUnit.lessons.findIndex((entry) => !completed.includes(entry.id))
        if (nextLessonIndex >= 0) {
          openLesson(semesterEntry.semester, nextUnitIndex, nextLessonIndex)
          return
        }
      }
    }
    openLesson(1, 0, 0)
  }

  const openUnit = (nextUnitIndex: number) => {
    const nextUnit = semesterPlan.units[nextUnitIndex]
    const pendingLessonIndex = nextUnit.lessons.findIndex((entry) => !completed.includes(entry.id))
    openLesson(semester, nextUnitIndex, pendingLessonIndex >= 0 ? pendingLessonIndex : 0)
  }

  const nextLesson = () => {
    markComplete()
    setAnswers({})
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
    if (semester === 1) selectSemester(2)
  }

  const nextPage = () => {
    if (safePageIndex < pages.length - 1) {
      setPageIndex(safePageIndex + 1)
      return
    }
    if (isLastLesson) {
      markComplete()
      return
    }
    nextLesson()
  }

  const previousPage = () => {
    setAnswers({})
    if (safePageIndex > 0) {
      setPageIndex(safePageIndex - 1)
      return
    }
    if (safeLessonIndex > 0) {
      setLessonIndex(safeLessonIndex - 1)
      setPageIndex(Number.MAX_SAFE_INTEGER)
      return
    }
    if (safeUnitIndex > 0) {
      const previousUnit = semesterPlan.units[safeUnitIndex - 1]
      setUnitIndex(safeUnitIndex - 1)
      setLessonIndex(Math.max(0, previousUnit.lessons.length - 1))
      setPageIndex(Number.MAX_SAFE_INTEGER)
      return
    }
    if (semester === 2) {
      const previousSemester = course.semesters.find((item) => item.semester === 1) ?? course.semesters[0]
      const previousUnit = previousSemester.units[previousSemester.units.length - 1]
      setSemester(1)
      setUnitIndex(Math.max(0, previousSemester.units.length - 1))
      setLessonIndex(Math.max(0, previousUnit.lessons.length - 1))
      setPageIndex(Number.MAX_SAFE_INTEGER)
    }
  }

  const updateAnswer = (id: string, next: AnswerState) => setAnswers((current) => ({ ...current, [id]: next }))

  const submitReport = () => {
    const key = `bubble-space-curriculum-content-reports-${userId}`
    const entry = {
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
      grade,
      subject,
      pathway,
      semester,
      unitId: unit.id,
      unitTitle: unit.title,
      lessonId: lesson.id,
      lessonKind: lesson.kind,
      pageId: page.id,
      pageTitle: page.title,
      issueKind: reportKind,
      message: reportText.trim(),
      textbookVersion: 'v14',
      createdAt: new Date().toISOString(),
    }
    try {
      const raw = localStorage.getItem(key)
      const existing = raw ? JSON.parse(raw) : []
      localStorage.setItem(key, JSON.stringify([...(Array.isArray(existing) ? existing : []), entry].slice(-300)))
    } catch {
      localStorage.setItem(key, JSON.stringify([entry]))
    }
    setReportSaved(true)
  }

  const renderQuestion = (question: ReviewedQuestion) => {
    const state = answers[question.id] ?? {}
    const extra = enhancement(question)
    if (question.kind === 'choice') {
      const selected = state.selectedIndex
      return (
        <div className="curriculum-v14-question">
          <QuestionMedia question={question} />
          {extra.audioText ? <button className="curriculum-v14-audio" type="button" onClick={() => playAudio(extra.audioText!)}>🔊 {language === 'zh' ? '播放聽力' : 'Play audio'}</button> : null}
          {question.context ? <div className="curriculum-v14-context">{question.context}</div> : null}
          <h3>{question.prompt}</h3>
          <div className="curriculum-v14-options">
            {question.options.map((option, index) => (
              <button key={`${option}-${index}`} type="button" className={selected === index ? 'selected' : ''} onClick={() => updateAnswer(question.id, { selectedIndex: index, checked: false })}>
                <span>{String.fromCharCode(65 + index)}</span><strong>{option}</strong>
              </button>
            ))}
          </div>
          <button className="curriculum-v14-check" type="button" disabled={selected === undefined} onClick={() => updateAnswer(question.id, { ...state, checked: true })}>{language === 'zh' ? '確認答案' : 'Check answer'}</button>
          {state.checked && selected !== undefined ? (
            <div className={`curriculum-v14-feedback ${selected === question.correctIndex ? 'correct' : 'wrong'}`}>
              <strong>{selected === question.correctIndex ? '✓ 答對了' : '再檢查一次'}</strong>
              {extra.optionFeedback?.[selected] ? <p>{extra.optionFeedback[selected]}</p> : null}
              <p>{question.explanation}</p>
            </div>
          ) : null}
        </div>
      )
    }

    return (
      <div className="curriculum-v14-question">
        <QuestionMedia question={question} />
        {extra.audioText ? <button className="curriculum-v14-audio" type="button" onClick={() => playAudio(extra.audioText!)}>🔊 {language === 'zh' ? '播放聽力' : 'Play audio'}</button> : null}
        {question.context ? <div className="curriculum-v14-context">{question.context}</div> : null}
        <h3>{question.prompt}</h3>
        <textarea value={state.text ?? ''} onChange={(event) => updateAnswer(question.id, { text: event.target.value, checked: false })} placeholder={language === 'zh' ? '寫下你的判斷、線索與理由。' : 'Write your answer, evidence, and reasoning.'} />
        <button className="curriculum-v14-check" type="button" disabled={!state.text?.trim()} onClick={() => updateAnswer(question.id, { ...state, checked: true })}>{language === 'zh' ? '對照評分焦點' : 'Check criteria'}</button>
        {state.checked ? (
          <div className="curriculum-v14-feedback neutral">
            {extra.rubric?.length ? <div className="curriculum-v14-rubric"><strong>評分焦點</strong><ul>{extra.rubric.map((item) => <li key={item}>{item}</li>)}</ul></div> : null}
            <strong>參考作答</strong><p>{question.sampleAnswer}</p><p>{question.explanation}</p>
          </div>
        ) : null}
      </div>
    )
  }

  const renderVisual = (visual: TextbookVisual) => (
    <div className={`curriculum-v14-visual-grid visual-${visual.kind}`}>
      {visual.items.map((item, index) => (
        <article key={`${item.label}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item.label}</strong><p>{item.detail}</p></article>
      ))}
    </div>
  )

  const renderPage = () => {
    if (page.kind === 'intro') return (
      <article className="curriculum-v14-card intro">
        <span className="curriculum-v14-eyebrow">{LESSON_LABEL[lesson.kind]}</span>
        <h2>{page.title}</h2>
        <p>{page.body}</p>
        {page.objectives?.length ? <div className="curriculum-v14-objectives"><strong>學完這一單元，你會做到：</strong>{page.objectives.map((item, index) => <div key={item}><span>{index + 1}</span><p>{item}</p></div>)}</div> : null}
      </article>
    )
    if (page.kind === 'visual') return (
      <article className="curriculum-v14-card visual">
        <span className="curriculum-v14-eyebrow">觀念圖解</span><h2>{page.visual.title}</h2><p>{page.visual.caption}</p>{renderVisual(page.visual)}
      </article>
    )
    if (page.kind === 'concept') return (
      <article className="curriculum-v14-card concept">
        <span className="curriculum-v14-eyebrow">重點 {page.index + 1}</span><h2>{page.title}</h2><p>{page.explanation}</p>
        {page.example ? <div className="curriculum-v14-example"><strong>看一個例子</strong><p>{page.example}</p></div> : null}
        {page.misconception ? <div className="curriculum-v14-misconception"><strong>容易搞混的地方</strong><p className="claim">× {page.misconception.claim}</p><p className="correction">✓ {page.misconception.correction}</p><small>{page.misconception.reason}</small></div> : null}
      </article>
    )
    if (page.kind === 'model') return (
      <article className="curriculum-v14-card model">
        <span className="curriculum-v14-eyebrow">例題 {page.index + 1}</span><h2>{page.title}</h2><div className="curriculum-v14-context">{page.context}</div><h3>{page.prompt}</h3>
        <ol>{page.steps.map((step) => <li key={step}>{step}</li>)}</ol>
        <div className="curriculum-v14-answer"><strong>答案與檢查</strong><p>{page.answer}</p><small>{page.explanation}</small></div>
      </article>
    )
    if (page.kind === 'question') return <article className="curriculum-v14-card question"><span className="curriculum-v14-eyebrow">{page.title}</span>{renderQuestion(page.question)}</article>
    return (
      <article className="curriculum-v14-card recap">
        <span className="curriculum-v14-eyebrow">重點整理</span><h2>{page.title}</h2><div className="curriculum-v14-takeaway">{page.items.map((item) => <div key={item}>✓ {item}</div>)}</div>{lesson.kind === 'assessment' ? <button className="curriculum-v14-check" type="button" onClick={markComplete}>{completed.includes(lesson.id) ? '✓ 已完成這次檢核' : '完成這次檢核'}</button> : null}
      </article>
    )
  }

  const atCourseStart = semester === 1 && safeUnitIndex === 0 && safeLessonIndex === 0 && safePageIndex === 0
  const finalPage = isLastLesson && safePageIndex === pages.length - 1

  const renderDirectory = () => (
    <aside className={`curriculum-v14-directory${directoryOpen ? ' open' : ''}`} aria-hidden={!directoryOpen}>
      <header><div><small>學習目錄</small><h2>{gradeLabel(grade, language)} · {language === 'zh' ? meta.labelZh : meta.labelEn}</h2></div><button type="button" onClick={() => setDirectoryOpen(false)}>×</button></header>
      <div className="curriculum-v14-semesters"><button className={semester === 1 ? 'active' : ''} type="button" onClick={() => selectSemester(1)}>上學期</button><button className={semester === 2 ? 'active' : ''} type="button" onClick={() => selectSemester(2)}>下學期</button></div>
      <div className="curriculum-v14-unit-list">{semesterPlan.units.map((entry, nextUnitIndex) => {
        const unitCompleted = entry.lessons.filter((entryLesson) => completed.includes(entryLesson.id)).length
        return (
          <section key={entry.id} className={nextUnitIndex === safeUnitIndex ? 'active' : ''}>
            <button type="button" onClick={() => openUnit(nextUnitIndex)}><strong>{entry.title}</strong><small>{entry.focus}</small><span>{unitCompleted}/{entry.lessons.length} 個步驟完成</span></button>
            <div>{entry.lessons.map((entryLesson, nextLessonIndex) => <button key={entryLesson.id} type="button" className={nextUnitIndex === safeUnitIndex && nextLessonIndex === safeLessonIndex ? 'active' : ''} onClick={() => openLesson(semester, nextUnitIndex, nextLessonIndex)}><span>{completed.includes(entryLesson.id) ? '✓' : nextLessonIndex + 1}</span>{LESSON_LABEL[entryLesson.kind]}</button>)}</div>
          </section>
        )
      })}</div>
      <button className="curriculum-v14-directory-home" type="button" onClick={() => { setView('overview'); setDirectoryOpen(false) }}>回到課程首頁</button>
    </aside>
  )

  const renderReport = () => (
    <aside className={`curriculum-v14-report-curtain${reportOpen ? ' open' : ''}`} aria-hidden={!reportOpen}>
      <header><div><small>內容回報</small><h2>這一頁哪裡需要調整？</h2></div><button type="button" onClick={() => setReportOpen(false)}>×</button></header>
      <div><p><strong>{meta.labelZh}</strong> · {unit.title} · {LESSON_LABEL[lesson.kind]} · 第 {safePageIndex + 1} 頁</p>
        <div className="curriculum-v14-report-kinds">{REPORT_OPTIONS.map((option) => <button key={option.id} type="button" className={reportKind === option.id ? 'active' : ''} onClick={() => { setReportKind(option.id); setReportSaved(false) }}>{option.label}</button>)}</div>
        <textarea value={reportText} onChange={(event) => { setReportText(event.target.value); setReportSaved(false) }} placeholder="請描述看不懂、可能有錯或需要補充的地方。" />
        <button className="curriculum-v14-check" type="button" onClick={submitReport}>送出問題</button>{reportSaved ? <strong className="curriculum-v14-report-saved">✓ 已記錄這一頁的位置與問題類型</strong> : null}
      </div>
    </aside>
  )

  if (view === 'overview') {
    const semesterCompleted = semesterPlan.units.flatMap((entry) => entry.lessons).filter((entry) => completed.includes(entry.id)).length
    const semesterLessons = semesterPlan.units.reduce((sum, entry) => sum + entry.lessons.length, 0)
    const semesterProgress = semesterLessons ? Math.round((semesterCompleted / semesterLessons) * 100) : 0

    return (
      <div className={`curriculum-v14 curriculum-v14-overview course-${subject}`}>
        <div className="curriculum-v14-overview-scroll">
          <header className="curriculum-v14-course-topbar">
            <div className="curriculum-v14-brand"><span>{meta.icon}</span><div><small>{gradeLabel(grade, language)}</small><strong>{language === 'zh' ? meta.labelZh : meta.labelEn}</strong></div></div>
            <button type="button" className="curriculum-v14-quiet-button" onClick={() => setDirectoryOpen(true)}>學習目錄</button>
          </header>

          <main className="curriculum-v14-course-home">
            <section className="curriculum-v14-course-hero">
              <div>
                <span className="curriculum-v14-eyebrow">你的學習路徑</span>
                <h1>{gradeLabel(grade, language)} · {language === 'zh' ? meta.labelZh : meta.labelEn}</h1>
                <p>不用一次看完整門課。照著單元一步一步學，觀念、例題與練習會接在同一條路徑上。</p>
                <div className="curriculum-v14-hero-actions"><button type="button" className="curriculum-v14-primary" onClick={continueCourse}>{overall >= 100 ? '重新開始' : completedInCourse > 0 ? '繼續學習 →' : '開始學習 →'}</button><button type="button" className="curriculum-v14-secondary" onClick={() => setDirectoryOpen(true)}>查看全部單元</button></div>
              </div>
              <div className="curriculum-v14-overall-progress" aria-label={`整體進度 ${overall}%`}><strong>{overall}%</strong><span>整體進度</span><div><i style={{ width: `${overall}%` }} /></div><small>{completedInCourse} / {allLessons.length} 個學習步驟</small></div>
            </section>

            <section className="curriculum-v14-path-section">
              <div className="curriculum-v14-section-heading"><div><span className="curriculum-v14-eyebrow">本學期</span><h2>照順序往前學</h2></div><div className="curriculum-v14-semester-tabs"><button type="button" className={semester === 1 ? 'active' : ''} onClick={() => selectSemester(1)}>上學期</button><button type="button" className={semester === 2 ? 'active' : ''} onClick={() => selectSemester(2)}>下學期</button></div></div>
              <div className="curriculum-v14-semester-summary"><span>{semester === 1 ? '上學期' : '下學期'}進度</span><strong>{semesterProgress}%</strong><div><i style={{ width: `${semesterProgress}%` }} /></div></div>

              <div className="curriculum-v14-learning-path">{semesterPlan.units.map((entry, nextUnitIndex) => {
                const done = entry.lessons.filter((entryLesson) => completed.includes(entryLesson.id)).length
                const progress = Math.round((done / entry.lessons.length) * 100)
                const isCurrent = done > 0 && done < entry.lessons.length
                return (
                  <article key={entry.id} className={`${progress === 100 ? 'complete ' : ''}${isCurrent ? 'current' : ''}`.trim()}>
                    <div className="curriculum-v14-path-marker"><span>{progress === 100 ? '✓' : nextUnitIndex + 1}</span></div>
                    <div className="curriculum-v14-path-content"><div><small>第 {nextUnitIndex + 1} 單元 · {done}/{entry.lessons.length} 步驟</small><h3>{entry.title}</h3><p>{entry.focus}</p></div><div className="curriculum-v14-unit-progress"><span style={{ width: `${progress}%` }} /></div><div className="curriculum-v14-unit-lessons">{entry.lessons.map((entryLesson, index) => <span key={entryLesson.id} className={completed.includes(entryLesson.id) ? 'done' : ''}>{completed.includes(entryLesson.id) ? '✓' : index + 1} {LESSON_LABEL[entryLesson.kind]}</span>)}</div><button type="button" onClick={() => openUnit(nextUnitIndex)}>{progress === 100 ? '再學一次' : done > 0 ? '繼續這個單元 →' : '開始這個單元 →'}</button></div>
                  </article>
                )
              })}</div>
            </section>
          </main>
        </div>

        {directoryOpen || reportOpen ? <button className="curriculum-v14-backdrop" type="button" aria-label="關閉" onClick={() => { setDirectoryOpen(false); setReportOpen(false) }} /> : null}
        {renderDirectory()}
        {renderReport()}
      </div>
    )
  }

  return (
    <div className={`curriculum-v14 curriculum-v14-reader course-${subject}`}>
      <header className="curriculum-v14-reader-header">
        <button type="button" className="curriculum-v14-reader-back" onClick={() => setView('overview')}>← 課程首頁</button>
        <div className="curriculum-v14-reader-title"><small>{gradeLabel(grade, language)} · {language === 'zh' ? meta.labelZh : meta.labelEn} · {semester === 1 ? '上學期' : '下學期'}</small><strong>{unit.title}</strong></div>
        <div className="curriculum-v14-reader-tools"><span>{overall}%</span><button type="button" onClick={() => setDirectoryOpen(true)}>☰ 目錄</button></div>
      </header>

      <nav className="curriculum-v14-lesson-path" aria-label="本單元學習步驟">
        {unit.lessons.map((entryLesson, nextLessonIndex) => <button key={entryLesson.id} type="button" className={`${nextLessonIndex === safeLessonIndex ? 'active ' : ''}${completed.includes(entryLesson.id) ? 'done' : ''}`.trim()} onClick={() => openLesson(semester, safeUnitIndex, nextLessonIndex)}><span>{completed.includes(entryLesson.id) ? '✓' : nextLessonIndex + 1}</span><strong>{LESSON_LABEL[entryLesson.kind]}</strong></button>)}
      </nav>

      <main className="curriculum-v14-stage">
        <div className="curriculum-v14-progress"><span style={{ width: `${((safePageIndex + 1) / pages.length) * 100}%` }} /></div>
        <section className="curriculum-v14-reading-column">
          <div className="curriculum-v14-reading-meta"><span>{LESSON_LABEL[lesson.kind]}</span><small>第 {safePageIndex + 1} / {pages.length} 頁</small></div>
          {renderPage()}
          <button className="curriculum-v14-report" type="button" onClick={() => { setReportOpen(true); setReportSaved(false) }}>這一頁有問題？</button>
        </section>
        <footer className="curriculum-v14-reader-navigation"><button type="button" className="secondary" disabled={atCourseStart} onClick={previousPage}>← 上一步</button><div><strong>{safePageIndex + 1}</strong><span>/ {pages.length}</span></div><button type="button" className="primary" onClick={nextPage}>{finalPage ? (completed.includes(lesson.id) ? '✓ 已完成' : '完成課程') : safePageIndex === pages.length - 1 ? '下一個學習步驟 →' : '繼續 →'}</button></footer>
      </main>

      {directoryOpen || reportOpen ? <button className="curriculum-v14-backdrop" type="button" aria-label="關閉" onClick={() => { setDirectoryOpen(false); setReportOpen(false) }} /> : null}
      {renderDirectory()}
      {renderReport()}
    </div>
  )
}

export function CurriculumCourseApp(props: Props) {
  return <TextbookCourse {...props} />
}