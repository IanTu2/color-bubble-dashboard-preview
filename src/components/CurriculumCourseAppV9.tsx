import { useLayoutEffect, useMemo, useRef } from 'react'
import {
  CurriculumCourseApp as CurriculumCourseAppV8,
  type CurriculumCourseSelection,
} from './CurriculumCourseAppV8'
import { getCurriculumCourseBundle } from '../curriculum-course-engine'
import { getCurriculumUnitContent, isReviewedUnit } from '../curriculum-reviewed-content'
import type { Language } from '../types'

export type { CurriculumCourseSelection }

type Props = CurriculumCourseSelection & {
  language: Language
  userId: string
}

type UnitStatus = {
  id: string
  title: string
  reviewed: boolean
  concepts: number
  questions: number
  lessonMinutes: number[]
}

function buildStatusMap(grade: number, subject: CurriculumCourseSelection['subject']) {
  const course = getCurriculumCourseBundle(grade, subject)
  const statuses = new Map<string, UnitStatus>()
  if (!course) return statuses

  for (const semester of course.semesters) {
    for (const unit of semester.units) {
      const content = getCurriculumUnitContent(unit.id)
      statuses.set(unit.title, {
        id: unit.id,
        title: unit.title,
        reviewed: isReviewedUnit(unit.id),
        concepts: content?.concepts.length ?? 0,
        questions: content?.questions.length ?? 0,
        lessonMinutes: unit.lessons.map((lesson) => lesson.estimatedMinutes),
      })
    }
  }
  return statuses
}

function statusLabel(status: UnitStatus | undefined) {
  if (!status) return '內容編修中'
  return status.reviewed ? '✓ 已審閱' : '基礎教材'
}

function applyContentStatus(root: HTMLElement, statuses: Map<string, UnitStatus>) {
  const currentTitle = root.querySelector<HTMLElement>('.curriculum-compact-identity small')?.textContent?.trim()
  const currentStatus = currentTitle ? statuses.get(currentTitle) : undefined

  const metaStatus = root.querySelector<HTMLElement>('.curriculum-compact-meta .reviewed, .curriculum-compact-meta .editing, .curriculum-compact-meta .foundation')
  if (metaStatus && currentStatus) {
    metaStatus.textContent = statusLabel(currentStatus)
    metaStatus.classList.remove('reviewed', 'editing', 'foundation')
    metaStatus.classList.add(currentStatus.reviewed ? 'reviewed' : 'foundation')
  }

  const badge = root.querySelector<HTMLElement>('.curriculum-review-badge')
  if (badge && currentStatus) {
    badge.classList.toggle('foundation', !currentStatus.reviewed)
    badge.textContent = currentStatus.reviewed
      ? `✓ 內容已審閱 · ${currentStatus.concepts} 個核心概念 · ${currentStatus.questions} 題已檢查題幹`
      : `基礎教材 · ${currentStatus.concepts} 個核心概念 · ${currentStatus.questions} 題自我檢核 · 尚待逐題人工審閱`
  }

  const sections = root.querySelectorAll<HTMLElement>('.curriculum-directory-units > section')
  sections.forEach((section) => {
    const title = section.querySelector<HTMLElement>('.curriculum-directory-unit-title strong')?.textContent?.trim()
    if (!title) return
    const status = statuses.get(title)
    if (!status) return

    const unitStatus = section.querySelector<HTMLElement>('.curriculum-directory-unit-title small')
    if (unitStatus) unitStatus.textContent = status.reviewed ? '✓ 內容已審閱' : '基礎教材 · 可學習，待人工深度 QA'

    const lessonStatus = section.querySelectorAll<HTMLElement>('.curriculum-directory-lessons button small')
    lessonStatus.forEach((small, index) => {
      const minutes = status.lessonMinutes[index]
      small.textContent = status.reviewed
        ? `${minutes ?? ''} 分鐘`.trim()
        : `${minutes ?? ''} 分鐘 · 基礎教材`.trim()
    })
  })
}

export function CurriculumCourseApp(props: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const statuses = useMemo(() => buildStatusMap(props.grade, props.subject), [props.grade, props.subject])

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const options: MutationObserverInit = { childList: true, subtree: true, characterData: true }
    let observer: MutationObserver
    const refresh = () => {
      observer?.disconnect()
      applyContentStatus(root, statuses)
      observer?.observe(root, options)
    }

    observer = new MutationObserver(refresh)
    refresh()
    return () => observer.disconnect()
  }, [statuses])

  return (
    <div ref={rootRef} className="curriculum-course-v9">
      <CurriculumCourseAppV8 {...props} />
    </div>
  )
}
