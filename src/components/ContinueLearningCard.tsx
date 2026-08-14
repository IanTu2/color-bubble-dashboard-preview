import { useMemo } from 'react'
import { getCurriculumCourseBundleV13 } from '../curriculum-course-engine-v13'
import { readCurriculumProgress } from '../curriculum-course-engine'
import {
  getCurriculumCourseMeta,
  getCurriculumRouteOptions,
  type CurriculumPathwayId,
  type CurriculumSubjectId,
} from '../curriculum-plan-v5'
import type { Language } from '../types'

type Props = {
  language: Language
  userId: string
  onBrowse: () => void
  onOpenCourse: (grade: number, subject: CurriculumSubjectId, pathway?: CurriculumPathwayId) => void
}

type CourseProgress = {
  grade: number
  subject: CurriculumSubjectId
  pathway?: CurriculumPathwayId
  completed: number
  total: number
  percent: number
  nextUnitTitle: string
  labelZh: string
  labelEn: string
  icon: string
}

function gradeLabel(grade: number, language: Language) {
  if (language === 'en') return `Grade ${grade}`
  if (grade <= 6) return `${['一', '二', '三', '四', '五', '六'][grade - 1]}年級`
  if (grade <= 9) return `${['七', '八', '九'][grade - 7]}年級`
  return `高${['一', '二', '三'][grade - 10]}`
}

function resolveProgress(userId: string): CourseProgress | null {
  const completedIds = new Set(readCurriculumProgress(userId))
  if (!completedIds.size) return null
  const candidates: CourseProgress[] = []

  for (let grade = 1; grade <= 12; grade += 1) {
    for (const route of getCurriculumRouteOptions(grade)) {
      const course = getCurriculumCourseBundleV13(grade, route.subject, route.pathway)
      if (!course) continue
      const lessons = course.semesters.flatMap((semester) => semester.units.flatMap((unit) => unit.lessons))
      const completed = lessons.filter((lesson) => completedIds.has(lesson.id)).length
      if (!completed) continue
      const firstPending = course.semesters
        .flatMap((semester) => semester.units)
        .find((unit) => unit.lessons.some((lesson) => !completedIds.has(lesson.id)))
      const meta = getCurriculumCourseMeta(route.subject, route.pathway)
      candidates.push({
        grade,
        subject: route.subject,
        pathway: route.pathway,
        completed,
        total: lessons.length,
        percent: lessons.length ? Math.round((completed / lessons.length) * 100) : 0,
        nextUnitTitle: firstPending?.title ?? course.semesters.at(-1)?.units.at(-1)?.title ?? '',
        labelZh: meta.labelZh,
        labelEn: meta.labelEn,
        icon: meta.icon,
      })
    }
  }

  return candidates.sort((a, b) => b.completed - a.completed || b.percent - a.percent)[0] ?? null
}

export function ContinueLearningCard({ language, userId, onBrowse, onOpenCourse }: Props) {
  const progress = useMemo(() => resolveProgress(userId), [userId])
  const copy = language === 'zh'
    ? {
        kicker: '繼續學習',
        startTitle: '準備開始今天的學習',
        startBody: '直接選年級與科目，不必再從工具選單裡找課程。',
        choose: '選擇課程 →',
        continue: '繼續 →',
        next: '接下來',
        done: '已完成',
      }
    : {
        kicker: 'Continue learning',
        startTitle: 'Start today’s learning',
        startBody: 'Choose a grade and subject directly instead of hunting through tools.',
        choose: 'Choose course →',
        continue: 'Continue →',
        next: 'Next',
        done: 'completed',
      }

  if (!progress) {
    return (
      <aside className="learning-resume-card learning-resume-empty" aria-label={copy.kicker}>
        <div className="learning-resume-icon">學</div>
        <div className="learning-resume-copy"><small>{copy.kicker}</small><strong>{copy.startTitle}</strong><p>{copy.startBody}</p></div>
        <button type="button" onClick={onBrowse}>{copy.choose}</button>
      </aside>
    )
  }

  const courseLabel = language === 'zh' ? progress.labelZh : progress.labelEn
  return (
    <aside className="learning-resume-card" aria-label={copy.kicker}>
      <div className="learning-resume-head"><span>{progress.icon}</span><div><small>{copy.kicker}</small><strong>{gradeLabel(progress.grade, language)} · {courseLabel}</strong></div><b>{progress.percent}%</b></div>
      <div className="learning-resume-progress"><span style={{ width: `${progress.percent}%` }} /></div>
      <p><em>{copy.next}</em>{progress.nextUnitTitle}</p>
      <div className="learning-resume-actions"><small>{progress.completed} / {progress.total} {copy.done}</small><button type="button" onClick={() => onOpenCourse(progress.grade, progress.subject, progress.pathway)}>{copy.continue}</button></div>
    </aside>
  )
}
