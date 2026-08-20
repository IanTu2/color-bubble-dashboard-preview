import type { CurriculumSubjectId } from '../curriculum-plan-v5'
import type { TextbookVisual } from '../curriculum-textbook-v14'
import { CurriculumPedagogyVisualV17 } from './CurriculumPedagogyVisualV17'
import '../curriculum-v20-unit-visuals.css'

type Props = {
  subject: CurriculumSubjectId
  unitTitle: string
  focus: string
  visual: TextbookVisual
}

function ConcreteNumberLine({ visual }: { visual: TextbookVisual }) {
  const ticks = Array.from({ length: 11 }, (_, index) => index - 5)
  const x = (value: number) => 90 + (value + 5) * 58
  return (
    <figure className="curriculum-v17-diagram curriculum-v18-numberline" data-v18-rich-visual="true" data-v18-diagram-kind="concrete-number-line">
      <div className="curriculum-v17-diagram-canvas">
        <svg viewBox="0 0 760 300" role="img" aria-label={`${visual.title}：-5 到 5 的數線`}>
          <defs>
            <marker id="v18-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" className="v17-arrow" /></marker>
          </defs>
          <line x1="62" y1="155" x2="700" y2="155" className="v17-axis" markerEnd="url(#v18-arrow)" />
          {ticks.map((value) => (
            <g key={value}>
              <line x1={x(value)} y1="138" x2={x(value)} y2="172" className="v17-tick" />
              <text x={x(value)} y="198" textAnchor="middle" className={`v18-numberline-value${value === 0 ? ' zero' : ''}`}>{value}</text>
            </g>
          ))}
          <circle cx={x(-3)} cy="155" r="11" className="v18-numberline-negative" />
          <circle cx={x(3)} cy="155" r="11" className="v18-numberline-positive" />
          <path d={`M${x(-3)} 105 Q${x(0)} 62 ${x(3)} 105`} className="v18-numberline-pair" markerEnd="url(#v18-arrow)" />
          <text x={x(-3)} y="92" textAnchor="middle" className="v17-label">−3</text>
          <text x={x(3)} y="92" textAnchor="middle" className="v17-label">+3</text>
          <text x={x(0)} y="45" textAnchor="middle" className="v18-numberline-title">互為相反數，和 0 的距離相同</text>
          <line x1={x(-3)} y1="230" x2={x(0)} y2="230" className="v18-distance-line" />
          <line x1={x(0)} y1="230" x2={x(3)} y2="230" className="v18-distance-line" />
          <text x={(x(-3)+x(0))/2} y="255" textAnchor="middle" className="v17-caption">|-3| = 3</text>
          <text x={(x(0)+x(3))/2} y="255" textAnchor="middle" className="v17-caption">|3| = 3</text>
          <text x={x(0)} y="286" textAnchor="middle" className="v17-caption">越往右數值越大；0 是正數與負數的基準</text>
        </svg>
      </div>
      <figcaption><strong>用有向數線看正負關係</strong><span>{visual.caption}</span></figcaption>
    </figure>
  )
}

function LabeledDiagram({ props, children }: { props: Props; children: React.ReactNode }) {
  return (
    <div className="curriculum-v20-diagram-frame" data-v20-diagram-title={props.unitTitle}>
      <div className="curriculum-v20-diagram-title"><strong>{props.unitTitle}</strong><span>{props.visual.title}</span></div>
      {children}
    </div>
  )
}

export function CurriculumPedagogyVisualV18(props: Props) {
  const text = `${props.unitTitle} ${props.focus} ${props.visual.title} ${props.visual.items.map((item) => `${item.label} ${item.detail}`).join(' ')}`
  const diagram = props.subject === 'math' && /負數|正負|相反數|絕對值|有向數/.test(text)
    ? <ConcreteNumberLine visual={props.visual} />
    : <CurriculumPedagogyVisualV17 {...props} />
  return <LabeledDiagram props={props}>{diagram}</LabeledDiagram>
}
