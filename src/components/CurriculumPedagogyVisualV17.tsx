import type { CurriculumSubjectId } from '../curriculum-plan-v5'
import type { TextbookVisual } from '../curriculum-textbook-v14'

type Props = {
  subject: CurriculumSubjectId
  unitTitle: string
  focus: string
  visual: TextbookVisual
}

const short = (value: string, max = 16) => {
  const clean = value.replace(/\s+/g, ' ').trim()
  return clean.length <= max ? clean : `${clean.slice(0, max - 1)}…`
}

function FlowDiagram({ visual }: { visual: TextbookVisual }) {
  const items = visual.items.slice(0, 5)
  const width = 760
  const step = width / Math.max(1, items.length)
  return (
    <svg viewBox="0 0 760 250" role="img" aria-label={visual.title}>
      <defs><marker id="v17-arrow" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" className="v17-arrow" /></marker></defs>
      {items.map((item, index) => {
        const x = 34 + index * step
        const center = x + Math.min(126, step - 20) / 2
        const boxWidth = Math.min(126, step - 20)
        return (
          <g key={`${item.label}-${index}`}>
            {index < items.length - 1 ? <line x1={center + boxWidth / 2 - 2} y1="106" x2={x + step - 10} y2="106" className="v17-line" markerEnd="url(#v17-arrow)" /> : null}
            <rect x={x} y="56" rx="18" width={boxWidth} height="100" className="v17-node" />
            <text x={center} y="88" textAnchor="middle" className="v17-number">{String(index + 1).padStart(2, '0')}</text>
            <text x={center} y="116" textAnchor="middle" className="v17-label">{short(item.label, 10)}</text>
            <text x={center} y="141" textAnchor="middle" className="v17-caption">{short(item.detail, 14)}</text>
          </g>
        )
      })}
    </svg>
  )
}

function NumberLineDiagram({ visual }: { visual: TextbookVisual }) {
  const items = visual.items.slice(0, 6)
  const start = 90
  const end = 680
  const step = (end - start) / Math.max(1, items.length - 1)
  return (
    <svg viewBox="0 0 760 250" role="img" aria-label={visual.title}>
      <line x1={start - 30} y1="128" x2={end + 30} y2="128" className="v17-axis" />
      <path d={`M${end + 30} 128 l-14 -8 v16 z`} className="v17-axis-fill" />
      {items.map((item, index) => {
        const x = start + index * step
        return (
          <g key={`${item.label}-${index}`}>
            <line x1={x} y1="112" x2={x} y2="144" className="v17-tick" />
            <circle cx={x} cy="128" r="10" className="v17-point" />
            <text x={x} y={index % 2 === 0 ? 82 : 188} textAnchor="middle" className="v17-label">{short(item.label, 11)}</text>
            <line x1={x} y1={index % 2 === 0 ? 91 : 153} x2={x} y2={index % 2 === 0 ? 112 : 166} className="v17-guide" />
          </g>
        )
      })}
    </svg>
  )
}

function GeometryDiagram({ visual }: { visual: TextbookVisual }) {
  const labels = visual.items.slice(0, 4).map((item) => short(item.label, 12))
  return (
    <svg viewBox="0 0 760 280" role="img" aria-label={visual.title}>
      <polygon points="120,220 245,58 355,220" className="v17-shape" />
      <circle cx="525" cy="140" r="82" className="v17-shape" />
      <line x1="525" y1="140" x2="607" y2="140" className="v17-line-strong" />
      <path d="M185 137 A46 46 0 0 1 225 166" className="v17-arc" />
      <text x="185" y="245" textAnchor="middle" className="v17-label">{labels[0] ?? '條件'}</text>
      <text x="284" y="245" textAnchor="middle" className="v17-label">{labels[1] ?? '關係'}</text>
      <text x="525" y="250" textAnchor="middle" className="v17-label">{labels[2] ?? '圖形'}</text>
      <text x="566" y="128" textAnchor="middle" className="v17-caption">{labels[3] ?? '檢查'}</text>
    </svg>
  )
}

function CoordinateDiagram({ visual }: { visual: TextbookVisual }) {
  const items = visual.items.slice(0, 5)
  const points = [[145,190],[245,145],[350,175],[465,92],[590,122]]
  return (
    <svg viewBox="0 0 760 300" role="img" aria-label={visual.title}>
      <line x1="80" y1="245" x2="690" y2="245" className="v17-axis" />
      <line x1="110" y1="270" x2="110" y2="38" className="v17-axis" />
      <path d="M690 245 l-14 -8 v16 z" className="v17-axis-fill" />
      <path d="M110 38 l-8 14 h16 z" className="v17-axis-fill" />
      <polyline points={points.slice(0, items.length).map((p) => p.join(',')).join(' ')} className="v17-trend" />
      {items.map((item, index) => {
        const [x,y] = points[index]
        return <g key={`${item.label}-${index}`}><circle cx={x} cy={y} r="9" className="v17-point" /><text x={x} y={y - 18} textAnchor="middle" className="v17-label">{short(item.label, 10)}</text></g>
      })}
    </svg>
  )
}

function CircuitDiagram({ visual }: { visual: TextbookVisual }) {
  const labels = visual.items.slice(0, 4).map((item) => short(item.label, 11))
  return (
    <svg viewBox="0 0 760 280" role="img" aria-label={visual.title}>
      <path d="M140 72 H590 V210 H140 Z" className="v17-wire" />
      <line x1="140" y1="115" x2="140" y2="167" className="v17-wire-gap" />
      <line x1="126" y1="125" x2="154" y2="125" className="v17-battery" />
      <line x1="132" y1="154" x2="148" y2="154" className="v17-battery" />
      <circle cx="365" cy="72" r="33" className="v17-component" />
      <path d="M340 72 q12 -22 24 0 q12 22 24 0" className="v17-filament" />
      <rect x="535" y="188" rx="8" width="92" height="44" className="v17-component" />
      <text x="365" y="127" textAnchor="middle" className="v17-label">{labels[0] ?? '元件'}</text>
      <text x="140" y="198" textAnchor="middle" className="v17-label">{labels[1] ?? '電源'}</text>
      <text x="580" y="258" textAnchor="middle" className="v17-label">{labels[2] ?? '關係'}</text>
      <text x="520" y="52" textAnchor="middle" className="v17-caption">{labels[3] ?? '量測與檢查'}</text>
    </svg>
  )
}

function ParticleDiagram({ visual }: { visual: TextbookVisual }) {
  const labels = visual.items.slice(0, 4).map((item) => short(item.label, 10))
  const particles = [[160,98],[205,126],[142,157],[245,174],[390,92],[430,142],[382,181],[575,105],[610,160],[540,185]]
  return (
    <svg viewBox="0 0 760 280" role="img" aria-label={visual.title}>
      <rect x="80" y="52" width="600" height="170" rx="24" className="v17-container" />
      {particles.map(([x,y], index) => <circle key={`${x}-${y}`} cx={x} cy={y} r={index % 3 === 0 ? 17 : 12} className={`v17-particle p${index % 3}`} />)}
      <text x="175" y="245" textAnchor="middle" className="v17-label">{labels[0] ?? '粒子'}</text>
      <text x="400" y="245" textAnchor="middle" className="v17-label">{labels[1] ?? '交互作用'}</text>
      <text x="590" y="245" textAnchor="middle" className="v17-label">{labels[2] ?? '巨觀現象'}</text>
      <text x="380" y="31" textAnchor="middle" className="v17-caption">{labels[3] ?? '模型是簡化表示，不代表真實比例'}</text>
    </svg>
  )
}

function MotionDiagram({ visual }: { visual: TextbookVisual }) {
  const labels = visual.items.slice(0, 4).map((item) => short(item.label, 10))
  return (
    <svg viewBox="0 0 760 270" role="img" aria-label={visual.title}>
      <line x1="80" y1="205" x2="680" y2="205" className="v17-axis" />
      {[150,280,430,590].map((x,index) => <g key={x}><circle cx={x} cy={175 - index * 18} r="18" className="v17-object" /><line x1={x + 22} y1={175 - index * 18} x2={x + 80 + index * 12} y2={175 - index * 18} className="v17-vector" markerEnd="url(#v17-arrow)" /><text x={x} y="238" textAnchor="middle" className="v17-label">{labels[index] ?? `階段 ${index + 1}`}</text></g>)}
    </svg>
  )
}

function TimelineDiagram({ visual }: { visual: TextbookVisual }) {
  const items = visual.items.slice(0, 6)
  const start = 95
  const end = 665
  const step = (end - start) / Math.max(1, items.length - 1)
  return (
    <svg viewBox="0 0 760 280" role="img" aria-label={visual.title}>
      <line x1={start - 25} y1="140" x2={end + 25} y2="140" className="v17-axis" />
      {items.map((item,index) => {
        const x = start + index * step
        const top = index % 2 === 0
        return <g key={`${item.label}-${index}`}><circle cx={x} cy="140" r="10" className="v17-point" /><line x1={x} y1={top ? 130 : 150} x2={x} y2={top ? 82 : 202} className="v17-guide" /><text x={x} y={top ? 66 : 225} textAnchor="middle" className="v17-label">{short(item.label, 11)}</text><text x={x} y={top ? 88 : 247} textAnchor="middle" className="v17-caption">{short(item.detail, 12)}</text></g>
      })}
    </svg>
  )
}

function EvidenceDiagram({ visual }: { visual: TextbookVisual }) {
  const items = visual.items.slice(0, 5)
  const positions = [[130,65],[130,190],[380,52],[630,65],[630,190]]
  return (
    <svg viewBox="0 0 760 300" role="img" aria-label={visual.title}>
      <rect x="285" y="110" width="190" height="80" rx="24" className="v17-center" />
      <text x="380" y="143" textAnchor="middle" className="v17-label">比較證據</text>
      <text x="380" y="169" textAnchor="middle" className="v17-caption">來源 · 時間 · 地點 · 群體</text>
      {items.map((item,index) => {
        const [x,y] = positions[index]
        const tx = x < 380 ? 285 : x > 380 ? 475 : 380
        const ty = y < 110 ? 110 : 190
        return <g key={`${item.label}-${index}`}><line x1={x} y1={y + 26} x2={tx} y2={ty} className="v17-guide" /><rect x={x - 80} y={y} width="160" height="64" rx="16" className="v17-node" /><text x={x} y={y + 27} textAnchor="middle" className="v17-label">{short(item.label, 12)}</text><text x={x} y={y + 48} textAnchor="middle" className="v17-caption">{short(item.detail, 16)}</text></g>
      })}
    </svg>
  )
}

export function CurriculumPedagogyVisualV17({ subject, unitTitle, focus, visual }: Props) {
  const text = `${unitTitle} ${focus} ${visual.title} ${visual.items.map((item) => `${item.label} ${item.detail}`).join(' ')}`
  let diagram = <FlowDiagram visual={visual} />

  if (subject === 'math') {
    if (/座標|函數|圖形|趨勢|斜率|變化/.test(text)) diagram = <CoordinateDiagram visual={visual} />
    else if (/幾何|角|三角|圓|多邊形|面積|周長|相似|全等/.test(text)) diagram = <GeometryDiagram visual={visual} />
    else if (/數線|正負|整數|分數|小數|有理數|大小/.test(text)) diagram = <NumberLineDiagram visual={visual} />
  } else if (subject === 'science') {
    if (/電路|電流|電壓|電阻|串聯|並聯/.test(text)) diagram = <CircuitDiagram visual={visual} />
    else if (/粒子|原子|分子|元素|化學|溶液|物質/.test(text)) diagram = <ParticleDiagram visual={visual} />
    else if (/力|運動|速度|加速度|位移|慣性/.test(text)) diagram = <MotionDiagram visual={visual} />
  } else if (subject === 'social') {
    if (/歷史|年代|時代|事件|朝代|演變|變遷/.test(text)) diagram = <TimelineDiagram visual={visual} />
    else diagram = <EvidenceDiagram visual={visual} />
  }

  return (
    <figure className={`curriculum-v17-diagram subject-${subject}`} data-v17-rich-visual="true">
      <div className="curriculum-v17-diagram-canvas">{diagram}</div>
      <figcaption><strong>圖解怎麼看</strong><span>{visual.caption}</span></figcaption>
    </figure>
  )
}
