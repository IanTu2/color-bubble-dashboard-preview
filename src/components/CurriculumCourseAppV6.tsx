import { useEffect, useRef } from 'react'
import {
  CurriculumCourseApp as CurriculumCourseAppV5,
  type CurriculumCourseSelection,
} from './CurriculumCourseAppV5'
import type { Language } from '../types'

export type { CurriculumCourseSelection }

type Props = CurriculumCourseSelection & {
  language: Language
  userId: string
}

type VisualKind =
  | 'number-line'
  | 'balance'
  | 'coordinate'
  | 'geometry'
  | 'cell'
  | 'cycle'
  | 'timeline'
  | 'map'
  | 'text-flow'
  | 'dialogue'
  | 'network'

const SVG_BY_KIND: Record<VisualKind, string> = {
  'number-line': `
    <svg viewBox="0 0 320 220" role="img" aria-hidden="true">
      <line x1="34" y1="116" x2="286" y2="116" class="v-line"/>
      <path d="M286 116l-12-7v14z" class="v-fill"/>
      <path d="M34 116l12-7v14z" class="v-fill"/>
      <g class="v-soft"><line x1="88" y1="104" x2="88" y2="128"/><line x1="124" y1="104" x2="124" y2="128"/><line x1="160" y1="100" x2="160" y2="132"/><line x1="196" y1="104" x2="196" y2="128"/><line x1="232" y1="104" x2="232" y2="128"/></g>
      <circle cx="104" cy="116" r="11" class="v-accent"/><circle cx="216" cy="116" r="11" class="v-accent-2"/>
      <path d="M104 82c24-22 88-22 112 0" class="v-dash"/>
      <text x="160" y="157" text-anchor="middle" class="v-text">0</text>
      <text x="104" y="88" text-anchor="middle" class="v-text">−</text><text x="216" y="88" text-anchor="middle" class="v-text">＋</text>
    </svg>`,
  balance: `
    <svg viewBox="0 0 320 220" role="img" aria-hidden="true">
      <line x1="160" y1="54" x2="160" y2="168" class="v-line"/><path d="M124 176h72" class="v-line"/>
      <path d="M72 86h176" class="v-line"/><circle cx="160" cy="86" r="9" class="v-accent"/>
      <path d="M94 88l-34 54h68zM226 88l-34 54h68z" class="v-outline"/>
      <rect x="74" y="113" width="40" height="28" rx="8" class="v-panel"/><rect x="206" y="113" width="40" height="28" rx="8" class="v-panel"/>
      <text x="94" y="132" text-anchor="middle" class="v-text">x</text><text x="226" y="132" text-anchor="middle" class="v-text">?</text>
      <text x="160" y="45" text-anchor="middle" class="v-text">＝</text>
    </svg>`,
  coordinate: `
    <svg viewBox="0 0 320 220" role="img" aria-hidden="true">
      <g class="v-grid"><path d="M52 42v144M88 42v144M124 42v144M160 42v144M196 42v144M232 42v144M268 42v144"/><path d="M52 54h216M52 90h216M52 126h216M52 162h216"/></g>
      <path d="M52 126h224M160 190V34" class="v-line"/><path d="M76 168L246 64" class="v-accent-line"/><path d="M82 66l164 98" class="v-accent-2-line"/><circle cx="161" cy="116" r="9" class="v-accent"/>
    </svg>`,
  geometry: `
    <svg viewBox="0 0 320 220" role="img" aria-hidden="true">
      <path d="M72 162L150 54l102 108z" class="v-outline strong"/><path d="M150 54v108" class="v-dash"/>
      <path d="M142 154h16v-16" class="v-line"/><circle cx="150" cy="54" r="7" class="v-accent"/>
      <path d="M86 153c14-14 31-20 49-20" class="v-accent-2-line"/>
      <text x="158" y="188" text-anchor="middle" class="v-text">形狀 · 距離 · 角度</text>
    </svg>`,
  cell: `
    <svg viewBox="0 0 320 220" role="img" aria-hidden="true">
      <path d="M68 112c0-53 42-78 92-78 58 0 98 32 98 81 0 47-36 76-96 76-55 0-94-27-94-79z" class="v-cell"/>
      <circle cx="164" cy="111" r="32" class="v-nucleus"/><circle cx="164" cy="111" r="12" class="v-accent"/>
      <ellipse cx="111" cy="86" rx="21" ry="10" class="v-organelle"/><ellipse cx="219" cy="137" rx="23" ry="11" class="v-organelle"/>
      <circle cx="113" cy="145" r="9" class="v-soft-fill"/><circle cx="218" cy="79" r="8" class="v-soft-fill"/>
      <path d="M40 54h48l25 23M278 53h-47l-24 25M276 176h-51l-17-20" class="v-dash"/>
    </svg>`,
  cycle: `
    <svg viewBox="0 0 320 220" role="img" aria-hidden="true">
      <circle cx="160" cy="111" r="31" class="v-panel"/><text x="160" y="116" text-anchor="middle" class="v-text">核心</text>
      <circle cx="160" cy="47" r="21" class="v-soft-fill"/><circle cx="231" cy="111" r="21" class="v-soft-fill"/><circle cx="160" cy="175" r="21" class="v-soft-fill"/><circle cx="89" cy="111" r="21" class="v-soft-fill"/>
      <path d="M184 61c25 8 36 20 39 34M218 135c-10 22-22 31-42 36M136 171c-23-9-35-20-39-39M100 87c10-21 24-30 43-35" class="v-accent-line"/>
      <path d="M225 94l5 13-14-3M177 170l-13 6 2-15M97 133l-6-13 15 2M142 52l13-6-2 15" class="v-fill"/>
    </svg>`,
  timeline: `
    <svg viewBox="0 0 320 220" role="img" aria-hidden="true">
      <path d="M45 119h230" class="v-line"/>
      <circle cx="78" cy="119" r="11" class="v-accent"/><circle cx="135" cy="119" r="11" class="v-accent-2"/><circle cx="196" cy="119" r="11" class="v-accent"/><circle cx="252" cy="119" r="11" class="v-accent-2"/>
      <path d="M78 108V72h56M135 130v36h54M196 108V63h47M252 130v31" class="v-dash"/>
      <rect x="47" y="48" width="88" height="29" rx="9" class="v-panel"/><rect x="163" y="39" width="92" height="29" rx="9" class="v-panel"/><rect x="112" y="160" width="82" height="29" rx="9" class="v-panel"/>
    </svg>`,
  map: `
    <svg viewBox="0 0 320 220" role="img" aria-hidden="true">
      <path d="M106 31l31 18 29-11 37 18 36-9 2 132-39 11-34-17-31 11-36-15z" class="v-map"/>
      <path d="M137 49l0 135M166 38l2 135M203 56l-1 134M101 81l140-7M101 118l140-7M102 153l138-8" class="v-grid"/>
      <circle cx="184" cy="94" r="10" class="v-accent"/><circle cx="130" cy="142" r="8" class="v-accent-2"/>
      <path d="M184 94c18 8 27 18 29 32M130 142c20-14 34-20 49-22" class="v-dash"/>
      <path d="M58 47v52M45 60l13-13 13 13" class="v-line"/><text x="58" y="116" text-anchor="middle" class="v-text">N</text>
    </svg>`,
  'text-flow': `
    <svg viewBox="0 0 320 220" role="img" aria-hidden="true">
      <rect x="45" y="40" width="230" height="140" rx="18" class="v-panel"/>
      <rect x="66" y="61" width="91" height="18" rx="7" class="v-soft-fill"/><rect x="66" y="91" width="187" height="9" rx="4" class="v-muted-fill"/><rect x="66" y="109" width="160" height="9" rx="4" class="v-muted-fill"/>
      <rect x="66" y="135" width="61" height="24" rx="8" class="v-accent-soft"/><rect x="135" y="135" width="58" height="24" rx="8" class="v-accent2-soft"/><rect x="201" y="135" width="52" height="24" rx="8" class="v-accent-soft"/>
      <path d="M97 135v-14M164 135v-14M227 135v-14" class="v-dash"/>
    </svg>`,
  dialogue: `
    <svg viewBox="0 0 320 220" role="img" aria-hidden="true">
      <rect x="46" y="48" width="133" height="60" rx="20" class="v-panel"/><path d="M88 108l-16 21 30-17" class="v-panel-fill"/>
      <rect x="141" y="119" width="133" height="57" rx="20" class="v-panel accent"/><path d="M231 176l16 18-5-23" class="v-panel-fill accent"/>
      <circle cx="70" cy="78" r="7" class="v-accent"/><rect x="86" y="71" width="63" height="9" rx="4" class="v-muted-fill"/>
      <circle cx="165" cy="148" r="7" class="v-accent-2"/><rect x="181" y="141" width="63" height="9" rx="4" class="v-muted-fill"/>
    </svg>`,
  network: `
    <svg viewBox="0 0 320 220" role="img" aria-hidden="true">
      <circle cx="160" cy="111" r="36" class="v-panel"/><circle cx="160" cy="111" r="13" class="v-accent"/>
      <circle cx="80" cy="58" r="24" class="v-soft-fill"/><circle cx="244" cy="59" r="24" class="v-soft-fill"/><circle cx="78" cy="166" r="24" class="v-soft-fill"/><circle cx="243" cy="165" r="24" class="v-soft-fill"/>
      <path d="M129 91L99 72M191 91l32-18M129 132l-31 21M191 132l31 20" class="v-accent-line"/>
    </svg>`,
}

function visualKind(subject: CurriculumCourseSelection['subject'], text: string): VisualKind {
  const value = text.toLowerCase()

  if (subject === 'math') {
    if (/數線|絕對值|正負|有向數/.test(value)) return 'number-line'
    if (/方程|等量|移項|不等式/.test(value)) return 'balance'
    if (/坐標|圖形|聯立|函數/.test(value)) return 'coordinate'
    if (/幾何|角|線段|射線|中垂|三視圖/.test(value)) return 'geometry'
    if (/統計|資料|圖表|比例|正比|反比/.test(value)) return 'network'
    return 'number-line'
  }

  if (subject === 'science') {
    if (/細胞|細胞核|胞器|組織/.test(value)) return 'cell'
    if (/生殖|遺傳|演化|分類|生態|食物|循環|運輸|恆定|營養|能量/.test(value)) return 'cycle'
    return 'network'
  }

  if (subject === 'social') {
    if (/地理|位置|經緯|地形|海域|氣候|水文|人口|產業|區域|都市|交通|gis|地圖/.test(value)) return 'map'
    if (/歷史|史料|時代|清|日治|戰後|殖民|政權|年代/.test(value)) return 'timeline'
    return 'network'
  }

  if (subject === 'chinese') {
    if (/敘事|描寫|文言|詩|修辭|詞義|句法|段落|篇章|寫作|論說|說明/.test(value)) return 'text-flow'
    return 'network'
  }

  if (/be 動詞|wh|問句|對話|現在|過去|進行|祈使|情態|英文|句型/.test(value)) return 'dialogue'
  return 'network'
}

function visualCaption(kind: VisualKind) {
  const captions: Record<VisualKind, string> = {
    'number-line': '把數量放回數線，位置、方向與距離會比只背規則更直觀。',
    balance: '把等號想成平衡：兩邊要維持同樣的關係，步驟才有意義。',
    coordinate: '把式子放到座標平面，同時看「數值關係」與「圖形位置」。',
    geometry: '先把點、線、角與距離畫出來，再把文字條件一一對上圖形。',
    cell: '先辨認構造的位置，再把每個構造和功能連起來理解。',
    cycle: '把過程看成有方向的流程或循環，較容易追蹤前因、結果與回饋。',
    timeline: '先排出時間先後，再討論事件之間的原因、轉折與影響。',
    map: '讀空間資料先看位置、方向、圖例與分布，再解釋「為什麼在這裡」。',
    'text-flow': '把字詞、句子、段落與篇章層次拆開，能更清楚看出文字如何組成意思。',
    dialogue: '先確認誰在什麼情境、什麼時間說話，再選擇合適的句型與語意。',
    network: '把核心概念放在中心，再連到例子、證據與應用，避免只背單一名詞。',
  }
  return captions[kind]
}

function enhanceTeachingPage(root: HTMLElement, subject: CurriculumCourseSelection['subject']) {
  const card = root.querySelector<HTMLElement>('.curriculum-page-card')
  if (!card) return

  if (card.classList.contains('curriculum-page-question') || card.classList.contains('curriculum-editorial-page')) {
    card.classList.remove('has-teaching-visual')
    card.querySelector('.curriculum-side-visual')?.remove()
    return
  }

  const heading = card.querySelector('h2')?.textContent?.trim() ?? ''
  const body = card.textContent?.trim() ?? ''
  const key = `${subject}:${heading}:${body.slice(0, 120)}`
  const existing = card.querySelector<HTMLElement>('.curriculum-side-visual')
  if (existing?.dataset.visualKey === key) return
  existing?.remove()

  const kind = visualKind(subject, `${heading} ${body}`)
  const figure = document.createElement('figure')
  figure.className = `curriculum-side-visual visual-${kind}`
  figure.dataset.visualKey = key
  figure.setAttribute('aria-label', `輔助圖解：${heading || '本頁核心概念'}`)

  const visual = document.createElement('div')
  visual.className = 'curriculum-side-visual-canvas'
  visual.innerHTML = SVG_BY_KIND[kind]

  const label = document.createElement('span')
  label.className = 'curriculum-side-visual-label'
  label.textContent = '輔助圖解'

  const caption = document.createElement('figcaption')
  caption.textContent = visualCaption(kind)

  figure.append(label, visual, caption)
  card.classList.add('has-teaching-visual')
  card.append(figure)
}

export function CurriculumCourseApp(props: Props) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    let frame = 0
    const refresh = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => enhanceTeachingPage(root, props.subject))
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
    <div ref={rootRef} className="curriculum-course-v6">
      <CurriculumCourseAppV5 {...props} />
    </div>
  )
}
