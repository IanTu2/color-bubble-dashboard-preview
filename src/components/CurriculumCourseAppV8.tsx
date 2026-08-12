import { useLayoutEffect, useRef } from 'react'
import {
  CurriculumCourseApp as CurriculumCourseAppV12,
  type CurriculumCourseSelection,
} from './CurriculumCourseAppV12'
import { findVettedCurriculumMedia } from '../curriculum-vetted-media'
import type { Language } from '../types'

export type { CurriculumCourseSelection }

type Props = CurriculumCourseSelection & {
  language: Language
  userId: string
}

type GenericVisualKind =
  | 'number-line'
  | 'balance'
  | 'coordinate'
  | 'geometry'
  | 'text-flow'
  | 'dialogue'
  | 'network'

const SVG_BY_KIND: Record<GenericVisualKind, string> = {
  'number-line': `
    <svg viewBox="0 0 320 220" role="img" aria-hidden="true">
      <line x1="34" y1="116" x2="286" y2="116" class="v-line"/>
      <path d="M286 116l-12-7v14zM34 116l12-7v14z" class="v-fill"/>
      <g class="v-soft"><line x1="88" y1="104" x2="88" y2="128"/><line x1="124" y1="104" x2="124" y2="128"/><line x1="160" y1="100" x2="160" y2="132"/><line x1="196" y1="104" x2="196" y2="128"/><line x1="232" y1="104" x2="232" y2="128"/></g>
      <circle cx="104" cy="116" r="11" class="v-accent"/><circle cx="216" cy="116" r="11" class="v-accent-2"/>
      <path d="M104 82c24-22 88-22 112 0" class="v-dash"/>
      <text x="160" y="157" text-anchor="middle" class="v-text">0</text><text x="104" y="88" text-anchor="middle" class="v-text">−</text><text x="216" y="88" text-anchor="middle" class="v-text">＋</text>
    </svg>`,
  balance: `
    <svg viewBox="0 0 320 220" role="img" aria-hidden="true">
      <line x1="160" y1="54" x2="160" y2="168" class="v-line"/><path d="M124 176h72M72 86h176" class="v-line"/><circle cx="160" cy="86" r="9" class="v-accent"/>
      <path d="M94 88l-34 54h68zM226 88l-34 54h68z" class="v-outline"/>
      <rect x="74" y="113" width="40" height="28" rx="8" class="v-panel"/><rect x="206" y="113" width="40" height="28" rx="8" class="v-panel"/>
      <text x="94" y="132" text-anchor="middle" class="v-text">x</text><text x="226" y="132" text-anchor="middle" class="v-text">?</text><text x="160" y="45" text-anchor="middle" class="v-text">＝</text>
    </svg>`,
  coordinate: `
    <svg viewBox="0 0 320 220" role="img" aria-hidden="true">
      <g class="v-grid"><path d="M52 42v144M88 42v144M124 42v144M160 42v144M196 42v144M232 42v144M268 42v144"/><path d="M52 54h216M52 90h216M52 126h216M52 162h216"/></g>
      <path d="M52 126h224M160 190V34" class="v-line"/><path d="M76 168L246 64" class="v-accent-line"/><path d="M82 66l164 98" class="v-accent-2-line"/><circle cx="161" cy="116" r="9" class="v-accent"/>
    </svg>`,
  geometry: `
    <svg viewBox="0 0 320 220" role="img" aria-hidden="true">
      <path d="M72 162L150 54l102 108z" class="v-outline strong"/><path d="M150 54v108" class="v-dash"/><path d="M142 154h16v-16" class="v-line"/><circle cx="150" cy="54" r="7" class="v-accent"/>
      <path d="M86 153c14-14 31-20 49-20" class="v-accent-2-line"/><text x="158" y="188" text-anchor="middle" class="v-text">形狀 · 距離 · 角度</text>
    </svg>`,
  'text-flow': `
    <svg viewBox="0 0 320 220" role="img" aria-hidden="true">
      <rect x="45" y="40" width="230" height="140" rx="18" class="v-panel"/><rect x="66" y="61" width="91" height="18" rx="7" class="v-soft-fill"/>
      <rect x="66" y="91" width="187" height="9" rx="4" class="v-muted-fill"/><rect x="66" y="109" width="160" height="9" rx="4" class="v-muted-fill"/>
      <rect x="66" y="135" width="61" height="24" rx="8" class="v-accent-soft"/><rect x="135" y="135" width="58" height="24" rx="8" class="v-accent2-soft"/><rect x="201" y="135" width="52" height="24" rx="8" class="v-accent-soft"/>
      <path d="M97 135v-14M164 135v-14M227 135v-14" class="v-dash"/>
    </svg>`,
  dialogue: `
    <svg viewBox="0 0 320 220" role="img" aria-hidden="true">
      <rect x="46" y="48" width="133" height="60" rx="20" class="v-panel"/><path d="M88 108l-16 21 30-17" class="v-panel-fill"/>
      <rect x="141" y="119" width="133" height="57" rx="20" class="v-panel accent"/><path d="M231 176l16 18-5-23" class="v-panel-fill accent"/>
      <circle cx="70" cy="78" r="7" class="v-accent"/><rect x="86" y="71" width="63" height="9" rx="4" class="v-muted-fill"/><circle cx="165" cy="148" r="7" class="v-accent-2"/><rect x="181" y="141" width="63" height="9" rx="4" class="v-muted-fill"/>
    </svg>`,
  network: `
    <svg viewBox="0 0 320 220" role="img" aria-hidden="true">
      <circle cx="160" cy="111" r="36" class="v-panel"/><circle cx="160" cy="111" r="13" class="v-accent"/>
      <circle cx="80" cy="58" r="24" class="v-soft-fill"/><circle cx="244" cy="59" r="24" class="v-soft-fill"/><circle cx="78" cy="166" r="24" class="v-soft-fill"/><circle cx="243" cy="165" r="24" class="v-soft-fill"/>
      <path d="M129 91L99 72M191 91l32-18M129 132l-31 21M191 132l31 20" class="v-accent-line"/>
    </svg>`,
}

function cleanCardText(card: HTMLElement) {
  const clone = card.cloneNode(true) as HTMLElement
  clone.querySelector('.curriculum-side-visual')?.remove()
  return clone.textContent?.trim() ?? ''
}

function visualSearchText(card: HTMLElement) {
  const heading = card.querySelector('h2')?.textContent?.trim() ?? ''
  const lead = card.querySelector('.curriculum-concept-statement, .curriculum-page-lead, .curriculum-model-context, .curriculum-takeaway-v5')?.textContent?.trim() ?? ''
  return `${heading} ${lead} ${cleanCardText(card).slice(0, 800)}`
}

function genericVisualKind(subject: CurriculumCourseSelection['subject'], text: string): GenericVisualKind | null {
  const value = text.toLowerCase()
  if (subject === 'science' || subject === 'social') return null

  if (subject === 'math') {
    if (/方程|等量|移項|不等式/.test(value)) return 'balance'
    if (/坐標|聯立|函數|圖形/.test(value)) return 'coordinate'
    if (/幾何|角|線段|射線|中垂|三視圖/.test(value)) return 'geometry'
    if (/統計|資料|圖表|比例|正比|反比/.test(value)) return 'network'
    return 'number-line'
  }

  if (subject === 'chinese') return /敘事|描寫|文言|詩|修辭|詞義|句法|段落|篇章|寫作|論說|說明/.test(value) ? 'text-flow' : 'network'
  if (subject === 'english') return 'dialogue'
  return 'network'
}

function genericCaption(kind: GenericVisualKind) {
  const captions: Record<GenericVisualKind, string> = {
    'number-line': '把數量放回數線，位置、方向與距離會比只背規則更直觀。',
    balance: '把等號想成平衡：兩邊要維持同樣的關係，步驟才有意義。',
    coordinate: '把式子放到座標平面，同時看數值關係與圖形位置。',
    geometry: '先把點、線、角與距離畫出來，再把文字條件一一對上圖形。',
    'text-flow': '把字詞、句子、段落與篇章層次拆開，能更清楚看出文字如何組成意思。',
    dialogue: '先確認誰在什麼情境、什麼時間說話，再選擇合適的句型與語意。',
    network: '把核心概念放在中心，再連到例子、證據與應用，避免只背單一名詞。',
  }
  return captions[kind]
}

function buildVettedFigure(asset: ReturnType<typeof findVettedCurriculumMedia>, key: string) {
  if (!asset) return null
  const figure = document.createElement('figure')
  figure.className = 'curriculum-side-visual curriculum-vetted-media curriculum-v8-visual'
  figure.dataset.visualKey = key
  figure.dataset.vettedMedia = asset.id
  figure.setAttribute('aria-label', `教材圖：${asset.title}`)

  const imageWrap = document.createElement('div')
  imageWrap.className = 'curriculum-vetted-media-image'
  const image = document.createElement('img')
  image.src = asset.src
  image.alt = asset.alt
  image.loading = 'eager'
  image.decoding = 'async'
  image.referrerPolicy = 'no-referrer'
  imageWrap.append(image)

  const copy = document.createElement('div')
  copy.className = 'curriculum-vetted-media-copy'
  const label = document.createElement('span')
  label.className = 'curriculum-vetted-media-label'
  label.textContent = '教材圖解'
  const title = document.createElement('strong')
  title.textContent = asset.title
  const caption = document.createElement('p')
  caption.textContent = asset.caption
  const source = document.createElement('a')
  source.href = asset.sourcePage
  source.target = '_blank'
  source.rel = 'noreferrer'
  source.textContent = '圖片來源與授權'
  copy.append(label, title, caption, source)
  figure.append(imageWrap, copy)
  return figure
}

function buildGenericFigure(kind: GenericVisualKind, key: string, heading: string) {
  const figure = document.createElement('figure')
  figure.className = `curriculum-side-visual visual-${kind} curriculum-v8-visual curriculum-v8-generic-visual`
  figure.dataset.visualKey = key
  figure.setAttribute('aria-label', `輔助圖解：${heading || '本頁核心概念'}`)

  const label = document.createElement('span')
  label.className = 'curriculum-side-visual-label'
  label.textContent = '輔助圖解'
  const visual = document.createElement('div')
  visual.className = 'curriculum-side-visual-canvas'
  visual.innerHTML = SVG_BY_KIND[kind]
  const caption = document.createElement('figcaption')
  caption.textContent = genericCaption(kind)
  figure.append(label, visual, caption)
  return figure
}

function applyStableVisual(root: HTMLElement, subject: CurriculumCourseSelection['subject']) {
  const card = root.querySelector<HTMLElement>('.curriculum-page-card')
  if (!card) return
  const existing = card.querySelector<HTMLElement>('.curriculum-side-visual')

  if (card.classList.contains('curriculum-page-question') || card.classList.contains('curriculum-editorial-page')) {
    existing?.remove()
    card.classList.remove('curriculum-v8-has-visual')
    return
  }

  const heading = card.querySelector('h2')?.textContent?.trim() ?? ''
  const searchText = visualSearchText(card)
  const asset = findVettedCurriculumMedia(subject, searchText)
  const kind = asset ? null : genericVisualKind(subject, searchText)
  const identity = asset ? `asset:${asset.id}` : kind ? `generic:${kind}` : 'none'
  const key = `${subject}:${heading}:${identity}:${cleanCardText(card).slice(0, 120)}`

  if (existing?.dataset.visualKey === key) return
  existing?.remove()

  const figure = asset ? buildVettedFigure(asset, key) : kind ? buildGenericFigure(kind, key, heading) : null
  if (!figure) {
    card.classList.remove('curriculum-v8-has-visual')
    return
  }

  card.append(figure)
  card.classList.add('curriculum-v8-has-visual')
}

export function CurriculumCourseApp(props: Props) {
  const rootRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const options: MutationObserverInit = { childList: true, subtree: true, characterData: true }
    let observer: MutationObserver
    const refresh = () => {
      observer?.disconnect()
      applyStableVisual(root, props.subject)
      observer?.observe(root, options)
    }

    observer = new MutationObserver(refresh)
    refresh()

    return () => observer.disconnect()
  }, [props.subject])

  return (
    <div ref={rootRef} className="curriculum-course-v8">
      <CurriculumCourseAppV12 {...props} />
    </div>
  )
}
