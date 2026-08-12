import { useLayoutEffect, useRef } from 'react'
import {
  CurriculumCourseApp as CurriculumCourseAppV8,
  type CurriculumCourseSelection,
} from './CurriculumCourseAppV8'
import type { Language } from '../types'

export type { CurriculumCourseSelection }

type Props = CurriculumCourseSelection & {
  language: Language
  userId: string
}

function hide(element: Element | null) {
  if (element instanceof HTMLElement) element.style.display = 'none'
}

function setText(element: Element | null, value: string) {
  if (element && element.textContent !== value) element.textContent = value
}

function keepReaderFacingCopy(root: HTMLElement) {
  root.querySelectorAll('.curriculum-review-badge, .curriculum-audit-warning, .audit-status').forEach(hide)
  root.querySelectorAll('.curriculum-track-policy').forEach(hide)

  root.querySelectorAll('.curriculum-directory-unit-title small[class*="audit-"]').forEach((element) => {
    if (element.textContent?.trim() !== '內容編修中') hide(element)
  })

  root.querySelectorAll('.curriculum-directory-lessons small').forEach((element) => {
    const current = element.textContent?.trim() ?? ''
    if (current === '待內容 QA') {
      setText(element, '內容準備中')
      return
    }
    const minutes = current.match(/^(\d+\s*分鐘)/)?.[1]
    if (minutes) setText(element, minutes)
  })

  const directoryFooter = root.querySelector('.curriculum-course-directory footer')
  if (directoryFooter?.textContent?.includes('審核原則')) hide(directoryFooter)

  const editorial = root.querySelector('.curriculum-editorial-page')
  if (editorial) {
    setText(editorial.querySelector('.curriculum-page-kicker'), '課程準備中')
    hide(editorial.querySelector('.curriculum-editorial-note'))
  }

  root.querySelectorAll('.curriculum-page-intro .curriculum-page-lead').forEach((element) => {
    const current = element.textContent ?? ''
    if (current.includes('這一層仍是教材初稿')) {
      setText(element, '先用這些題目確認你是否能說明觀念，並把學到的方法運用在不同情境。')
      return
    }
    if (current.includes('單元檢核使用目前已人工整理的題目')) {
      setText(element, '完成這組題目，確認你是否能把本單元的觀念運用在不同情境。')
      return
    }
    if (current.includes('頁數由實際概念數決定')) {
      setText(element, '這一課會依序整理本單元的核心概念，搭配說明與例子幫助理解。')
      return
    }
    if (current.includes('示範頁會把題目需要的資料一起提供')) {
      setText(element, '接下來會用完整情境逐步示範，說明每一步的判斷與理由。')
      return
    }
    if (current.includes('這一課不重複長篇教學')) {
      setText(element, '接下來用不同情境練習本單元觀念，先自己作答，再查看解析。')
    }
  })

  root.querySelectorAll('.curriculum-report-hint').forEach((element) => {
    const current = element.textContent ?? ''
    if (current.includes('品質層級') || current.includes('人工審核') || current.includes('課程 AI')) {
      setText(element, '送出後會一併記錄目前課程位置，方便後續協助你處理這個問題。')
    }
  })
}

export function CurriculumCourseApp(props: Props) {
  const rootRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    let scheduled = 0
    const refresh = () => {
      cancelAnimationFrame(scheduled)
      scheduled = requestAnimationFrame(() => keepReaderFacingCopy(root))
    }

    const observer = new MutationObserver(refresh)
    observer.observe(root, { childList: true, subtree: true, characterData: true })
    refresh()

    return () => {
      observer.disconnect()
      cancelAnimationFrame(scheduled)
    }
  }, [])

  return (
    <div ref={rootRef} className="curriculum-reader-facing">
      <CurriculumCourseAppV8 {...props} />
    </div>
  )
}
