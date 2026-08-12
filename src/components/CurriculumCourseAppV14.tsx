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
import {
  getTextbookUnitContentV14,
  type TextbookUnitContentV14,
  type TextbookVisual,
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
type Page =
  | { id: string; kind: 'intro'; title: string; body: string; objectives?: string[] }
  | { id: string; kind: 'visual'; title: string; visual: TextbookVisual }
  | { id: string; kind: 'concept'; title: string; explanation: string; example?: string; misconception?: TextbookUnitContentV14['misconceptions'][number]; index: number }
  | { id: string; kind: 'model'; title: string; context: string; prompt: string; steps: string[]; answer: string; explanation: string; index: number }
  | { id: string; kind: 'question'; title: string; question: ReviewedQuestion; index: number }
  | { id: string; kind: 'recap'; title: string; items: string[] }

const LESSON_LABEL: Record<CurriculumLessonPlan['kind'], string> = {
  launch: '導入',
  concept: '核心觀念',
  example: '完整示範',
  guided: '引導練習',
  practice: '獨立練習',
  assessment: '單元檢核',
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
      title: `${label}｜這一單元要學到什麼？`,
      body: unitContent.overview,
      objectives: unitContent.objectives,
    },
    { id: `${lesson.id}-visual`, kind: 'visual', title: '先看整體概念地圖', visual: conceptVisual },
    { id: `${lesson.id}-recap`, kind: 'recap', title: '開始前先記住', items: unitContent.takeaway.slice(0, 5) },
  ]

  if (lesson.kind === 'concept') return [
    {
      id: `${lesson.id}-intro`,
      kind: 'intro',
      title: `${label}｜一頁只處理一個觀念`,
      body: '先讀完整解釋，再看自足例子與常見迷思。每一頁都要能說出「為什麼」，不是只記標題。',
    },
    { id: `${lesson.id}-visual`, kind: 'visual', title: '概念之間怎麼連在一起？', visual: conceptVisual },
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
      title: `${label}｜看完整思考，不只看答案`,
      body: '每個示範都會寫出情境、問題、步驟、答案與為什麼這樣做；下一個 Lesson 會換情境讓你自己做。',
    },
    { id: `${lesson.id}-process`, kind: 'visual', title: '本單元的解題／探究流程', visual: processVisual },
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
    { id: `${lesson.id}-misconception`, kind: 'visual', title: '示範後再看常見錯誤', visual: misconceptionVisual },
    { id: `${lesson.id}-recap`, kind: 'recap', title: '示範完成', items: ['先辨認問題與條件', '選擇方法或證據', '逐步完成推理', '檢查答案與證據範圍', '換情境仍能重做一次'] },
  ]

  const groups = questionGroups(unitContent.questions)
  const questions = lesson.kind === 'guided' ? groups.guided : lesson.kind === 'practice' ? groups.practice : groups.assessment
  return [
    {
      id: `${lesson.id}-intro`,
      kind: 'intro',
      title: `${label}｜一頁一題`,
      body: lesson.kind === 'guided'
        ? '先從能直接連到教材觀念的題目開始；每題作答後都會看到選項診斷或評分焦點。'
        : lesson.kind === 'practice'
          ? '題目會換例子、資料或問法，確認你不是只記住示範。'
          : '最後一組使用不同題幹做獨立檢核；開放題會提供 rubric，而不是假裝能自動判斷所有答案。',
    },
    ...(lesson.kind === 'assessment' ? [{ id: `${lesson.id}-misconception`, kind: 'visual' as const, title: '作答前快速掃描迷思', visual: misconceptionVisual }] : []),
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
        <strong>教材完整性檢查未通過</strong>
        <p>這個單元沒有通過 V14 教材 gate，因此學生端不會把半完成內容當成正式教材顯示。</p>
      </div>
    )
  }

  const pages = buildPages(unitContent, lesson)
  const safePageIndex = Math.min(pageIndex, Math.max(0, pages.length - 1))
  const page = pages[safePageIndex]
  const allLessons = course.semesters.flatMap((item) => item.units.flatMap((entry) => entry.lessons))
  const overall = allLessons.length ? Math.round((allLessons.filter((entry) => completed.includes(entry.id)).length / allLessons.length) * 100) : 0
  const isLastLesson = semester === 2 && safeUnitIndex === semesterPlan.units.length - 1 && safeLessonIndex === unit.lessons.length - 1

  const markComplete = () => {
    const next = Array.from(new Set([...completed, lesson.id]))
    setCompleted(next)
    writeCurriculumProgress(userId, next)
  }

  const selectSemester = (next: CurriculumSemester) => {
    setSemester(next)
    setUnitIndex(0)
    setLessonIndex(0)
    setPageIndex(0)
    setAnswers({})
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
      <div className="curriculum-v14-card intro">
        <span>{LESSON_LABEL[lesson.kind]}</span><h2>{page.title}</h2><p>{page.body}</p>
        {page.objectives?.length ? <div className="curriculum-v14-objectives"><strong>完成這一單元後，你應該能：</strong>{page.objectives.map((item, index) => <div key={item}><span>{index + 1}</span><p>{item}</p></div>)}</div> : null}
      </div>
    )
    if (page.kind === 'visual') return <div className="curriculum-v14-card visual"><span>TEACHING VISUAL</span><h2>{page.visual.title}</h2><p>{page.visual.caption}</p>{renderVisual(page.visual)}</div>
    if (page.kind === 'concept') return (
      <div className="curriculum-v14-card concept">
        <span>CONCEPT {page.index + 1}</span><h2>{page.title}</h2><p>{page.explanation}</p>
        {page.example ? <div className="curriculum-v14-example"><strong>具體例子</strong><p>{page.example}</p></div> : null}
        {page.misconception ? <div className="curriculum-v14-misconception"><strong>常見迷思</strong><p className="claim">× {page.misconception.claim}</p><p className="correction">✓ {page.misconception.correction}</p><small>{page.misconception.reason}</small></div> : null}
      </div>
    )
    if (page.kind === 'model') return (
      <div className="curriculum-v14-card model">
        <span>WORKED EXAMPLE {page.index + 1}</span><h2>{page.title}</h2><div className="curriculum-v14-context">{page.context}</div><h3>{page.prompt}</h3>
        <ol>{page.steps.map((step) => <li key={step}>{step}</li>)}</ol>
        <div className="curriculum-v14-answer"><strong>結論／答案</strong><p>{page.answer}</p><small>{page.explanation}</small></div>
      </div>
    )
    if (page.kind === 'question') return <div className="curriculum-v14-card question"><span>{page.title}</span>{renderQuestion(page.question)}</div>
    return <div className="curriculum-v14-card recap"><span>RECAP</span><h2>{page.title}</h2><div className="curriculum-v14-takeaway">{page.items.map((item) => <div key={item}>✓ {item}</div>)}</div>{lesson.kind === 'assessment' ? <button className="curriculum-v14-check" type="button" onClick={markComplete}>{completed.includes(lesson.id) ? '✓ 已完成目前檢核' : '完成目前檢核'}</button> : null}</div>
  }

  const atCourseStart = semester === 1 && safeUnitIndex === 0 && safeLessonIndex === 0 && safePageIndex === 0
  const finalPage = isLastLesson && safePageIndex === pages.length - 1

  return (
    <div className={`curriculum-v14 course-${subject}`}>
      <header className="curriculum-v14-header">
        <div className="curriculum-v14-identity"><span>{meta.icon}</span><div><strong>{gradeLabel(grade, language)} · {language === 'zh' ? meta.labelZh : meta.labelEn}</strong><small>{unit.title}</small></div></div>
        <div className="curriculum-v14-meta"><span>{semester === 1 ? '上學期' : '下學期'}</span><span>{LESSON_LABEL[lesson.kind]} {safeLessonIndex + 1}/{unit.lessons.length}</span><span>{overall}%</span><span>Textbook V14</span><button type="button" onClick={() => setDirectoryOpen(true)}>☰ 課程目錄</button></div>
      </header>

      <main className="curriculum-v14-stage">
        <div className="curriculum-v14-progress"><span style={{ width: `${((safePageIndex + 1) / pages.length) * 100}%` }} /></div>
        <section>{renderPage()}<button className="curriculum-v14-report" type="button" onClick={() => { setReportOpen(true); setReportSaved(false) }}>內容有問題？反映問題</button></section>
        <footer><button type="button" disabled={atCourseStart} onClick={previousPage}>← 上一頁</button><span>{safePageIndex + 1} / {pages.length}</span><button type="button" onClick={nextPage}>{finalPage ? (completed.includes(lesson.id) ? '✓ 課程已完成' : '完成課程') : safePageIndex === pages.length - 1 ? '前往下一課 →' : '下一頁 →'}</button></footer>
      </main>

      <aside className={`curriculum-v14-directory${directoryOpen ? ' open' : ''}`} aria-hidden={!directoryOpen}>
        <header><div><small>COURSE MAP · TEXTBOOK V14</small><h2>{gradeLabel(grade, language)} · {meta.labelZh}</h2></div><button type="button" onClick={() => setDirectoryOpen(false)}>×</button></header>
        <div className="curriculum-v14-semesters"><button className={semester === 1 ? 'active' : ''} type="button" onClick={() => selectSemester(1)}>上學期</button><button className={semester === 2 ? 'active' : ''} type="button" onClick={() => selectSemester(2)}>下學期</button></div>
        <div className="curriculum-v14-unit-list">{semesterPlan.units.map((entry, nextUnitIndex) => (
          <section key={entry.id} className={nextUnitIndex === safeUnitIndex ? 'active' : ''}>
            <button type="button" onClick={() => { setUnitIndex(nextUnitIndex); setLessonIndex(0); setPageIndex(0); setAnswers({}); setDirectoryOpen(false) }}><strong>{entry.title}</strong><small>{entry.focus}</small></button>
            <div>{entry.lessons.map((entryLesson, nextLessonIndex) => <button key={entryLesson.id} type="button" className={nextUnitIndex === safeUnitIndex && nextLessonIndex === safeLessonIndex ? 'active' : ''} onClick={() => { setUnitIndex(nextUnitIndex); setLessonIndex(nextLessonIndex); setPageIndex(0); setAnswers({}); setDirectoryOpen(false) }}>{completed.includes(entryLesson.id) ? '✓' : nextLessonIndex + 1} {LESSON_LABEL[entryLesson.kind]}</button>)}</div>
          </section>
        ))}</div>
      </aside>

      <aside className={`curriculum-v14-report-curtain${reportOpen ? ' open' : ''}`} aria-hidden={!reportOpen}>
        <header><div><small>CONTENT SUPPORT</small><h2>內容有問題？反映問題</h2></div><button type="button" onClick={() => setReportOpen(false)}>×</button></header>
        <div><p><strong>{meta.labelZh}</strong> · {unit.title} · {LESSON_LABEL[lesson.kind]} · 第 {safePageIndex + 1} 頁</p>
          <div className="curriculum-v14-report-kinds">{REPORT_OPTIONS.map((option) => <button key={option.id} type="button" className={reportKind === option.id ? 'active' : ''} onClick={() => { setReportKind(option.id); setReportSaved(false) }}>{option.label}</button>)}</div>
          <textarea value={reportText} onChange={(event) => { setReportText(event.target.value); setReportSaved(false) }} placeholder="請描述看不懂、可能有錯或需要補充的地方。" />
          <button className="curriculum-v14-check" type="button" onClick={submitReport}>送出問題</button>{reportSaved ? <strong className="curriculum-v14-report-saved">✓ 已記錄年級、課程路線、單元、Lesson、頁面與問題類型</strong> : null}
        </div>
      </aside>
    </div>
  )
}

export function CurriculumCourseApp(props: Props) {
  return <TextbookCourse {...props} />
}
