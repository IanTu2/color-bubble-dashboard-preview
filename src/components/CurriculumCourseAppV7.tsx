import { useEffect, useRef } from 'react'
import {
  CurriculumCourseApp as CurriculumCourseAppV6,
  type CurriculumCourseSelection,
} from './CurriculumCourseAppV6'
import { findVettedCurriculumMedia } from '../curriculum-vetted-media'
import type { Language } from '../types'

export type { CurriculumCourseSelection }

type Props = CurriculumCourseSelection & {
  language: Language
  userId: string
}

function v6VisualKey(subject: CurriculumCourseSelection['subject'], card: HTMLElement) {
  const heading = card.querySelector('h2')?.textContent?.trim() ?? ''
  const body = card.textContent?.trim() ?? ''
  return `${subject}:${heading}:${body.slice(0, 120)}`
}

function mediaSearchText(card: HTMLElement) {
  const heading = card.querySelector('h2')?.textContent?.trim() ?? ''
  const lead = card.querySelector('.curriculum-concept-statement, .curriculum-page-lead, .curriculum-model-context, .curriculum-takeaway-v5')?.textContent?.trim() ?? ''
  const body = card.textContent?.trim() ?? ''
  return `${heading} ${lead} ${body.slice(0, 700)}`
}

function applyVettedMedia(root: HTMLElement, subject: CurriculumCourseSelection['subject']) {
  const card = root.querySelector<HTMLElement>('.curriculum-page-card')
  if (!card) return
  if (card.classList.contains('curriculum-page-question') || card.classList.contains('curriculum-editorial-page')) return

  const key = v6VisualKey(subject, card)
  const existing = card.querySelector<HTMLElement>('.curriculum-side-visual')
  const asset = findVettedCurriculumMedia(subject, mediaSearchText(card))

  if (!asset) {
    if (subject === 'science' || subject === 'social') {
      const placeholder = existing ?? document.createElement('figure')
      placeholder.className = 'curriculum-side-visual curriculum-side-visual-suppressed'
      placeholder.dataset.visualKey = key
      placeholder.dataset.vettedMedia = 'none'
      placeholder.replaceChildren()
      if (!existing) card.append(placeholder)
      card.classList.remove('has-teaching-visual')
      card.classList.add('vetted-visual-required')
    }
    return
  }

  if (existing?.dataset.vettedMedia === asset.id && existing.dataset.visualKey === key) return

  const figure = existing ?? document.createElement('figure')
  figure.className = 'curriculum-side-visual curriculum-vetted-media'
  figure.dataset.visualKey = key
  figure.dataset.vettedMedia = asset.id
  figure.setAttribute('aria-label', `教材圖：${asset.title}`)

  const imageWrap = document.createElement('div')
  imageWrap.className = 'curriculum-vetted-media-image'

  const image = document.createElement('img')
  image.src = asset.src
  image.alt = asset.alt
  image.loading = 'lazy'
  image.decoding = 'async'
  image.referrerPolicy = 'no-referrer'
  imageWrap.append(image)

  const copy = document.createElement('div')
  copy.className = 'curriculum-vetted-media-copy'

  const eyebrow = document.createElement('span')
  eyebrow.className = 'curriculum-vetted-media-label'
  eyebrow.textContent = '教材圖解 · 已核對來源'

  const title = document.createElement('strong')
  title.textContent = asset.title

  const caption = document.createElement('p')
  caption.textContent = asset.caption

  const source = document.createElement('a')
  source.href = asset.sourcePage
  source.target = '_blank'
  source.rel = 'noreferrer'
  source.textContent = `來源：${asset.attribution} · ${asset.license}`

  copy.append(eyebrow, title, caption, source)
  figure.replaceChildren(imageWrap, copy)

  if (!existing) card.append(figure)
  card.classList.remove('vetted-visual-required')
  card.classList.add('has-teaching-visual', 'has-vetted-teaching-media')
}

export function CurriculumCourseApp(props: Props) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    let frame = 0
    const refresh = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => applyVettedMedia(root, props.subject))
    }

    refresh()
    const observer = new MutationObserver(refresh)
    observer.observe(root, { childList: true, subtree: true, characterData: true })

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [props.subject])

  return (
    <div ref={rootRef} className="curriculum-course-v7">
      <CurriculumCourseAppV6 {...props} />
    </div>
  )
}
