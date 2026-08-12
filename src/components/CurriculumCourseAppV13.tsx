import { useMemo, useState } from 'react'
import { CurriculumCourseApp as StableCurriculumCourseApp } from './CurriculumCourseAppV8'
import {
  readCurriculumProgress,
  writeCurriculumProgress,
  type CurriculumLessonPlan,
  type CurriculumUnitBundle,
} from '../curriculum-course-engine'
import { getCurriculumCourseBundleV13 } from '../curriculum-course-engine-v13'
import {
  getCurriculumUnitContent,
  type CurriculumQuestionEnhancement,
  type ReviewedQuestion,
} from '../curriculum-reviewed-content'
import {
  getCurriculumCourseMeta,
  type CurriculumPathwayId,
  type CurriculumSemester,
  type CurriculumSubjectId,
} from '../curriculum-plan-v5'
import { CURRICULUM_VETTED_MEDIA } from '../curriculum-vetted-media'
import type { Language } from '../types'
import '../curriculum-course-v13.css'

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
type Page =
  | { id: string; kind: 'intro'; title: string; body: string }
  | { id: string; kind: 'concept'; title: string; explanation: string; example?: string; index: number }
  | { id: string; kind: 'model'; title: string; context: string; prompt: string; steps: string[]; answer: string; explanation: string; index: number }
  | { id: string; kind: 'question'; title: string; question: ReviewedQuestion; index: number }
  | { id: string; kind: 'recap'; title: string; items: string[] }

const LESSON_LABEL: Record<CurriculumLessonPlan['kind'], string> = {
  launch: '導入', concept: '核心觀念', example: '完整示範', guided: '引導練習', practice: '獨立練習', assessment: '單元檢核',
}

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
  const guidedEnd = Math.max(1, Math.floor(questions.length * 0.34))
  const practiceEnd = Math.max(guidedEnd + 1, Math.floor(questions.length * 0.67))
  return {
    guided: questions.slice(0, guidedEnd),
    practice: questions.slice(guidedEnd, practiceEnd),
    assessment: questions.slice(practiceEnd),
  }
}

function buildPages(unitContent: ReturnType<typeof getCurriculumUnitContent>, lesson: CurriculumLessonPlan): Page[] {
  if (!unitContent) return [{ id: `${lesson.id}-intro`, kind: 'intro', title: '教材準備中', body: '這個分流單元已建立正確課程位置，但教材內容尚未完成。' }]
  const label = LESSON_LABEL[lesson.kind]
  if (lesson.kind === 'launch') return [
    { id: `${lesson.id}-intro`, kind: 'intro', title: `${label}｜這一單元要處理什麼？`, body: unitContent.overview },
    { id: `${lesson.id}-recap`, kind: 'recap', title: '先看核心地圖', items: unitContent.concepts.slice(0, 6).map((item) => item.title) },
  ]
  if (lesson.kind === 'concept') return [
    { id: `${lesson.id}-intro`, kind: 'intro', title: `${label}｜一頁一個觀念`, body: '每一頁只處理一個概念；先理解意思，再看例子，最後到練習課自己使用。' },
    ...unitContent.concepts.map((concept, index): Page => ({ id: `${lesson.id}-c${index}`, kind: 'concept', title: concept.title, explanation: concept.explanation, example: concept.example, index })),
    { id: `${lesson.id}-recap`, kind: 'recap', title: '核心觀念整理', items: unitContent.takeaway },
  ]
  if (lesson.kind === 'example') return [
    { id: `${lesson.id}-intro`, kind: 'intro', title: `${label}｜看完整思考過程`, body: '示範會把情境、證據／已知條件、步驟與檢查拆開，不和後面的正式練習題重複。' },
    ...unitContent.workedExamples.map((model, index): Page => ({ id: `${lesson.id}-m${index}`, kind: 'model', title: model.title, context: model.context, prompt: model.prompt, steps: model.steps, answer: model.answer, explanation: model.explanation, index })),
    { id: `${lesson.id}-recap`, kind: 'recap', title: '示範完成', items: ['先辨認問題', '選擇方法或證據', '完成推理', '檢查結果與限制'] },
  ]
  const groups = questionGroups(unitContent.questions)
  const questions = lesson.kind === 'guided' ? groups.guided : lesson.kind === 'practice' ? groups.practice : groups.assessment
  return [
    { id: `${lesson.id}-intro`, kind: 'intro', title: `${label}｜一頁一題`, body: lesson.kind === 'guided' ? '先從直接應用開始；作答後再讀解析。' : lesson.kind === 'practice' ? '換新的數字、資料或情境，確認不是只記住示範。' : '這些題目不會和前兩組重複，用來做單元獨立檢核。' },
    ...questions.map((question, index): Page => ({ id: `${lesson.id}-${question.id}`, kind: 'question', title: `${label} ${index + 1}`, question, index })),
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
  if (!asset) return <div className="curriculum-v13-media-missing">教材圖目前無法載入，請先跳過這題。</div>
  return <figure className="curriculum-v13-media"><img src={asset.src} alt={asset.alt} /><figcaption><strong>{asset.title}</strong><span>{asset.caption}</span></figcaption></figure>
}

function PathwayCourse({ language, userId, grade, subject, pathway }: Props & { pathway: CurriculumPathwayId }) {
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
  const [reportText, setReportText] = useState('')
  const [reportSaved, setReportSaved] = useState(false)

  if (!course) return <div className="curriculum-course-empty">找不到這條課程路線。</div>
  const semesterPlan = course.semesters.find((item) => item.semester === semester) ?? course.semesters[0]
  const safeUnitIndex = Math.min(unitIndex, Math.max(0, semesterPlan.units.length - 1))
  const unit: CurriculumUnitBundle = semesterPlan.units[safeUnitIndex]
  const safeLessonIndex = Math.min(lessonIndex, Math.max(0, unit.lessons.length - 1))
  const lesson = unit.lessons[safeLessonIndex]
  const unitContent = getCurriculumUnitContent(unit.id)
  const pages = buildPages(unitContent, lesson)
  const safePageIndex = Math.min(pageIndex, Math.max(0, pages.length - 1))
  const page = pages[safePageIndex]
  const allLessons = course.semesters.flatMap((item) => item.units.flatMap((entry) => entry.lessons))
  const overall = allLessons.length ? Math.round((allLessons.filter((entry) => completed.includes(entry.id)).length / allLessons.length) * 100) : 0

  const markComplete = () => {
    const next = Array.from(new Set([...completed, lesson.id]))
    setCompleted(next)
    writeCurriculumProgress(userId, next)
  }

  const selectSemester = (next: CurriculumSemester) => { setSemester(next); setUnitIndex(0); setLessonIndex(0); setPageIndex(0) }
  const nextLesson = () => {
    if (unitContent) markComplete()
    if (safeLessonIndex < unit.lessons.length - 1) { setLessonIndex(safeLessonIndex + 1); setPageIndex(0); return }
    if (safeUnitIndex < semesterPlan.units.length - 1) { setUnitIndex(safeUnitIndex + 1); setLessonIndex(0); setPageIndex(0); return }
    if (semester === 1) selectSemester(2)
  }
  const nextPage = () => safePageIndex < pages.length - 1 ? setPageIndex(safePageIndex + 1) : nextLesson()
  const previousPage = () => {
    if (safePageIndex > 0) { setPageIndex(safePageIndex - 1); return }
    if (safeLessonIndex > 0) { setLessonIndex(safeLessonIndex - 1); setPageIndex(0); return }
    if (safeUnitIndex > 0) { setUnitIndex(safeUnitIndex - 1); setLessonIndex(0); setPageIndex(0) }
  }
  const updateAnswer = (id: string, next: AnswerState) => setAnswers((current) => ({ ...current, [id]: next }))

  const submitReport = () => {
    const key = `bubble-space-curriculum-content-reports-${userId}`
    const entry = { id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`, grade, subject, pathway, semester, unitId: unit.id, unitTitle: unit.title, lessonId: lesson.id, pageId: page.id, message: reportText.trim(), createdAt: new Date().toISOString() }
    try {
      const raw = localStorage.getItem(key)
      const existing = raw ? JSON.parse(raw) : []
      localStorage.setItem(key, JSON.stringify([...(Array.isArray(existing) ? existing : []), entry].slice(-300)))
    } catch { localStorage.setItem(key, JSON.stringify([entry])) }
    setReportSaved(true)
  }

  const renderQuestion = (question: ReviewedQuestion) => {
    const state = answers[question.id] ?? {}
    const extra = enhancement(question)
    if (question.kind === 'choice') {
      const selected = state.selectedIndex
      return <div className="curriculum-v13-question"><QuestionMedia question={question} />{extra.audioText ? <button className="curriculum-v13-audio" type="button" onClick={() => playAudio(extra.audioText!)}>🔊 {language === 'zh' ? '播放聽力' : 'Play audio'}</button> : null}{question.context ? <div className="curriculum-v13-context">{question.context}</div> : null}<h3>{question.prompt}</h3><div className="curriculum-v13-options">{question.options.map((option, index) => <button key={`${option}-${index}`} type="button" className={selected === index ? 'selected' : ''} onClick={() => updateAnswer(question.id, { selectedIndex: index, checked: false })}><span>{String.fromCharCode(65 + index)}</span><strong>{option}</strong></button>)}</div><button className="curriculum-v13-check" type="button" disabled={selected === undefined} onClick={() => updateAnswer(question.id, { ...state, checked: true })}>{language === 'zh' ? '確認答案' : 'Check answer'}</button>{state.checked && selected !== undefined ? <div className={`curriculum-v13-feedback ${selected === question.correctIndex ? 'correct' : 'wrong'}`}><strong>{selected === question.correctIndex ? '✓ 答對了' : '再檢查一次'}</strong>{extra.optionFeedback?.[selected] ? <p>{extra.optionFeedback[selected]}</p> : null}<p>{question.explanation}</p></div> : null}</div>
    }
    return <div className="curriculum-v13-question"><QuestionMedia question={question} />{extra.audioText ? <button className="curriculum-v13-audio" type="button" onClick={() => playAudio(extra.audioText!)}>🔊 {language === 'zh' ? '播放聽力' : 'Play audio'}</button> : null}{question.context ? <div className="curriculum-v13-context">{question.context}</div> : null}<h3>{question.prompt}</h3><textarea value={state.text ?? ''} onChange={(event) => updateAnswer(question.id, { text: event.target.value, checked: false })} placeholder={language === 'zh' ? '寫下你的判斷與理由。' : 'Write your answer and reasoning.'} /><button className="curriculum-v13-check" type="button" disabled={!state.text?.trim()} onClick={() => updateAnswer(question.id, { ...state, checked: true })}>{language === 'zh' ? '對照評分焦點' : 'Check criteria'}</button>{state.checked ? <div className="curriculum-v13-feedback neutral">{extra.rubric?.length ? <ul>{extra.rubric.map((item) => <li key={item}>{item}</li>)}</ul> : null}<strong>參考作答</strong><p>{question.sampleAnswer}</p><p>{question.explanation}</p></div> : null}</div>
  }

  const renderPage = () => {
    if (page.kind === 'intro') return <div className="curriculum-v13-card intro"><span>{LESSON_LABEL[lesson.kind]}</span><h2>{page.title}</h2><p>{page.body}</p></div>
    if (page.kind === 'concept') return <div className="curriculum-v13-card concept"><span>CONCEPT {page.index + 1}</span><h2>{page.title}</h2><p>{page.explanation}</p>{page.example ? <div className="curriculum-v13-example"><strong>例子</strong><p>{page.example}</p></div> : null}</div>
    if (page.kind === 'model') return <div className="curriculum-v13-card model"><span>WORKED EXAMPLE {page.index + 1}</span><h2>{page.title}</h2><div className="curriculum-v13-context">{page.context}</div><h3>{page.prompt}</h3><ol>{page.steps.map((step) => <li key={step}>{step}</li>)}</ol><div className="curriculum-v13-answer"><strong>結論</strong><p>{page.answer}</p><small>{page.explanation}</small></div></div>
    if (page.kind === 'question') return <div className="curriculum-v13-card question"><span>{page.title}</span>{renderQuestion(page.question)}</div>
    return <div className="curriculum-v13-card recap"><span>RECAP</span><h2>{page.title}</h2><div className="curriculum-v13-takeaway">{page.items.map((item) => <div key={item}>✓ {item}</div>)}</div>{lesson.kind === 'assessment' ? <button className="curriculum-v13-check" type="button" onClick={markComplete}>{completed.includes(lesson.id) ? '✓ 已完成目前檢核' : '完成目前檢核'}</button> : null}</div>
  }

  return <div className={`curriculum-v13 course-${subject}`}>
    <header className="curriculum-v13-header"><div className="curriculum-v13-identity"><span>{meta.icon}</span><div><strong>{gradeLabel(grade, language)} · {language === 'zh' ? meta.labelZh : meta.labelEn}</strong><small>{unit.title}</small></div></div><div className="curriculum-v13-meta"><span>{semester === 1 ? '上學期' : '下學期'}</span><span>{LESSON_LABEL[lesson.kind]} {safeLessonIndex + 1}/{unit.lessons.length}</span><span>{overall}%</span><button type="button" onClick={() => setDirectoryOpen(true)}>☰ 課程目錄</button></div></header>
    <main className="curriculum-v13-stage"><div className="curriculum-v13-progress"><span style={{ width: `${((safePageIndex + 1) / pages.length) * 100}%` }} /></div><section>{renderPage()}<button className="curriculum-v13-report" type="button" onClick={() => { setReportOpen(true); setReportSaved(false) }}>內容有問題？反映問題</button></section><footer><button type="button" disabled={safeUnitIndex === 0 && safeLessonIndex === 0 && safePageIndex === 0} onClick={previousPage}>← 上一頁</button><span>{safePageIndex + 1} / {pages.length}</span><button type="button" onClick={nextPage}>{safePageIndex === pages.length - 1 ? '前往下一課 →' : '下一頁 →'}</button></footer></main>
    <aside className={`curriculum-v13-directory${directoryOpen ? ' open' : ''}`} aria-hidden={!directoryOpen}><header><div><small>COURSE MAP</small><h2>{gradeLabel(grade, language)} · {meta.labelZh}</h2></div><button type="button" onClick={() => setDirectoryOpen(false)}>×</button></header><div className="curriculum-v13-semesters"><button className={semester === 1 ? 'active' : ''} type="button" onClick={() => selectSemester(1)}>上學期</button><button className={semester === 2 ? 'active' : ''} type="button" onClick={() => selectSemester(2)}>下學期</button></div><div className="curriculum-v13-unit-list">{semesterPlan.units.map((entry, nextUnitIndex) => <section key={entry.id} className={nextUnitIndex === safeUnitIndex ? 'active' : ''}><button type="button" onClick={() => { setUnitIndex(nextUnitIndex); setLessonIndex(0); setPageIndex(0); setDirectoryOpen(false) }}><strong>{entry.title}</strong><small>{entry.focus}</small></button><div>{entry.lessons.map((entryLesson, nextLessonIndex) => <button key={entryLesson.id} type="button" className={nextUnitIndex === safeUnitIndex && nextLessonIndex === safeLessonIndex ? 'active' : ''} onClick={() => { setUnitIndex(nextUnitIndex); setLessonIndex(nextLessonIndex); setPageIndex(0); setDirectoryOpen(false) }}>{completed.includes(entryLesson.id) ? '✓' : nextLessonIndex + 1} {LESSON_LABEL[entryLesson.kind]}</button>)}</div></section>)}</div></aside>
    <aside className={`curriculum-v13-report-curtain${reportOpen ? ' open' : ''}`} aria-hidden={!reportOpen}><header><div><small>CONTENT SUPPORT</small><h2>內容有問題？反映問題</h2></div><button type="button" onClick={() => setReportOpen(false)}>×</button></header><div><p><strong>{meta.labelZh}</strong> · {unit.title} · {LESSON_LABEL[lesson.kind]} · 第 {safePageIndex + 1} 頁</p><textarea value={reportText} onChange={(event) => { setReportText(event.target.value); setReportSaved(false) }} placeholder="請描述看不懂、可能有錯或需要補充的地方。" /><button className="curriculum-v13-check" type="button" onClick={submitReport}>送出問題</button>{reportSaved ? <strong className="curriculum-v13-report-saved">✓ 已記錄目前課程位置與問題</strong> : null}</div></aside>
  </div>
}

export function CurriculumCourseApp(props: Props) {
  if (!props.pathway) return <StableCurriculumCourseApp language={props.language} userId={props.userId} grade={props.grade} subject={props.subject} />
  return <PathwayCourse {...props} pathway={props.pathway} />
}
