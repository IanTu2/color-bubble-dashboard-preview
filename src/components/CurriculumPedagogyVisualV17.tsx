import type { CurriculumSubjectId } from '../curriculum-plan-v5'
import type { TextbookVisual } from '../curriculum-textbook-v14'

type Props = {
  subject: CurriculumSubjectId
  unitTitle: string
  focus: string
  visual: TextbookVisual
}

type VisualProps = { visual: TextbookVisual }

const short = (value: string, max = 16) => {
  const clean = value.replace(/\s+/g, ' ').trim()
  return clean.length <= max ? clean : `${clean.slice(0, max - 1)}…`
}

function FlowDiagram({ visual }: VisualProps) {
  const items = visual.items.slice(0, 5)
  const width = 760
  const step = width / Math.max(1, items.length)
  return (
    <svg viewBox="0 0 760 250" role="img" aria-label={visual.title}>
      <defs><marker id="v17-arrow" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" className="v17-arrow" /></marker></defs>
      {items.map((item, index) => {
        const x = 34 + index * step
        const boxWidth = Math.min(126, step - 20)
        const center = x + boxWidth / 2
        return <g key={`${item.label}-${index}`}>
          {index < items.length - 1 ? <line x1={x + boxWidth} y1="106" x2={x + step - 10} y2="106" className="v17-line" markerEnd="url(#v17-arrow)" /> : null}
          <rect x={x} y="56" rx="18" width={boxWidth} height="100" className="v17-node" />
          <text x={center} y="88" textAnchor="middle" className="v17-number">{String(index + 1).padStart(2, '0')}</text>
          <text x={center} y="116" textAnchor="middle" className="v17-label">{short(item.label, 10)}</text>
          <text x={center} y="141" textAnchor="middle" className="v17-caption">{short(item.detail, 14)}</text>
        </g>
      })}
    </svg>
  )
}

function NumberLineDiagram({ visual }: VisualProps) {
  const items = visual.items.slice(0, 6)
  const start = 90
  const end = 680
  const step = (end - start) / Math.max(1, items.length - 1)
  return <svg viewBox="0 0 760 250" role="img" aria-label={visual.title}>
    <line x1={start - 30} y1="128" x2={end + 30} y2="128" className="v17-axis" />
    <path d={`M${end + 30} 128 l-14 -8 v16 z`} className="v17-axis-fill" />
    {items.map((item, index) => {
      const x = start + index * step
      return <g key={`${item.label}-${index}`}><line x1={x} y1="112" x2={x} y2="144" className="v17-tick" /><circle cx={x} cy="128" r="10" className="v17-point" /><text x={x} y={index % 2 === 0 ? 82 : 188} textAnchor="middle" className="v17-label">{short(item.label, 11)}</text><line x1={x} y1={index % 2 === 0 ? 91 : 153} x2={x} y2={index % 2 === 0 ? 112 : 166} className="v17-guide" /></g>
    })}
  </svg>
}

function GeometryDiagram({ visual }: VisualProps) {
  const labels = visual.items.slice(0, 4).map((item) => short(item.label, 12))
  return <svg viewBox="0 0 760 280" role="img" aria-label={visual.title}>
    <polygon points="120,220 245,58 355,220" className="v17-shape" /><circle cx="525" cy="140" r="82" className="v17-shape" /><line x1="525" y1="140" x2="607" y2="140" className="v17-line-strong" /><path d="M185 137 A46 46 0 0 1 225 166" className="v17-arc" />
    <text x="185" y="245" textAnchor="middle" className="v17-label">{labels[0] ?? '條件'}</text><text x="284" y="245" textAnchor="middle" className="v17-label">{labels[1] ?? '關係'}</text><text x="525" y="250" textAnchor="middle" className="v17-label">{labels[2] ?? '圖形'}</text><text x="566" y="128" textAnchor="middle" className="v17-caption">{labels[3] ?? '檢查'}</text>
  </svg>
}

function CoordinateDiagram({ visual }: VisualProps) {
  const items = visual.items.slice(0, 5)
  const points = [[145,190],[245,145],[350,175],[465,92],[590,122]]
  return <svg viewBox="0 0 760 300" role="img" aria-label={visual.title}>
    <line x1="80" y1="245" x2="690" y2="245" className="v17-axis" /><line x1="110" y1="270" x2="110" y2="38" className="v17-axis" /><path d="M690 245 l-14 -8 v16 z" className="v17-axis-fill" /><path d="M110 38 l-8 14 h16 z" className="v17-axis-fill" /><polyline points={points.slice(0, items.length).map((p) => p.join(',')).join(' ')} className="v17-trend" />
    {items.map((item, index) => { const [x,y] = points[index]; return <g key={`${item.label}-${index}`}><circle cx={x} cy={y} r="9" className="v17-point" /><text x={x} y={y - 18} textAnchor="middle" className="v17-label">{short(item.label, 10)}</text></g> })}
  </svg>
}

function BarModelDiagram({ visual }: VisualProps) {
  const items = visual.items.slice(0, 5)
  const widths = [170,230,125,290,205]
  return <svg viewBox="0 0 760 310" role="img" aria-label={visual.title}>
    {items.map((item,index) => { const y = 38 + index * 52; return <g key={`${item.label}-${index}`}><text x="35" y={y + 23} className="v17-label">{short(item.label, 10)}</text><rect x="155" y={y} rx="9" width={widths[index]} height="34" className="v17-node" /><line x1={155 + widths[index]} y1={y + 17} x2="665" y2={y + 17} className="v17-guide" /><text x="680" y={y + 22} textAnchor="end" className="v17-caption">{short(item.detail, 16)}</text></g> })}
  </svg>
}

function MeasurementDiagram({ visual }: VisualProps) {
  const items = visual.items.slice(0, 5)
  return <svg viewBox="0 0 760 280" role="img" aria-label={visual.title}>
    <line x1="90" y1="155" x2="665" y2="155" className="v17-axis" />
    {Array.from({ length: 13 }).map((_,index) => { const x = 90 + index * 48; return <line key={x} x1={x} y1={index % 2 ? 143 : 133} x2={x} y2="177" className="v17-tick" /> })}
    <path d="M150 88 A68 68 0 0 1 286 88" className="v17-arc" /><line x1="218" y1="88" x2="267" y2="57" className="v17-line-strong" />
    {items.slice(0,3).map((item,index) => <text key={item.label} x={165 + index * 180} y="220" textAnchor="middle" className="v17-label">{short(item.label, 12)}</text>)}
    <text x="380" y="258" textAnchor="middle" className="v17-caption">先確認單位與刻度，再比較或換算</text>
  </svg>
}

function DataChartDiagram({ visual }: VisualProps) {
  const items = visual.items.slice(0, 5)
  const heights = [95,150,72,185,124]
  return <svg viewBox="0 0 760 300" role="img" aria-label={visual.title}>
    <line x1="90" y1="245" x2="690" y2="245" className="v17-axis" /><line x1="90" y1="245" x2="90" y2="42" className="v17-axis" />
    {items.map((item,index) => { const x = 125 + index * 108; const h = heights[index]; return <g key={`${item.label}-${index}`}><rect x={x} y={245-h} width="62" height={h} rx="7" className="v17-node" /><text x={x+31} y="270" textAnchor="middle" className="v17-label">{short(item.label,9)}</text><text x={x+31} y={235-h} textAnchor="middle" className="v17-caption">{short(item.detail,10)}</text></g> })}
  </svg>
}

function CircuitDiagram({ visual }: VisualProps) {
  const labels = visual.items.slice(0, 4).map((item) => short(item.label, 11))
  return <svg viewBox="0 0 760 280" role="img" aria-label={visual.title}>
    <path d="M140 72 H590 V210 H140 Z" className="v17-wire" /><line x1="140" y1="115" x2="140" y2="167" className="v17-wire-gap" /><line x1="126" y1="125" x2="154" y2="125" className="v17-battery" /><line x1="132" y1="154" x2="148" y2="154" className="v17-battery" /><circle cx="365" cy="72" r="33" className="v17-component" /><path d="M340 72 q12 -22 24 0 q12 22 24 0" className="v17-filament" /><rect x="535" y="188" rx="8" width="92" height="44" className="v17-component" />
    <text x="365" y="127" textAnchor="middle" className="v17-label">{labels[0] ?? '元件'}</text><text x="140" y="198" textAnchor="middle" className="v17-label">{labels[1] ?? '電源'}</text><text x="580" y="258" textAnchor="middle" className="v17-label">{labels[2] ?? '關係'}</text><text x="520" y="52" textAnchor="middle" className="v17-caption">{labels[3] ?? '量測與檢查'}</text>
  </svg>
}

function ParticleDiagram({ visual }: VisualProps) {
  const labels = visual.items.slice(0, 4).map((item) => short(item.label, 10))
  const particles = [[160,98],[205,126],[142,157],[245,174],[390,92],[430,142],[382,181],[575,105],[610,160],[540,185]]
  return <svg viewBox="0 0 760 280" role="img" aria-label={visual.title}>
    <rect x="80" y="52" width="600" height="170" rx="24" className="v17-container" />{particles.map(([x,y], index) => <circle key={`${x}-${y}`} cx={x} cy={y} r={index % 3 === 0 ? 17 : 12} className={`v17-particle p${index % 3}`} />)}
    <text x="175" y="245" textAnchor="middle" className="v17-label">{labels[0] ?? '粒子'}</text><text x="400" y="245" textAnchor="middle" className="v17-label">{labels[1] ?? '交互作用'}</text><text x="590" y="245" textAnchor="middle" className="v17-label">{labels[2] ?? '巨觀現象'}</text><text x="380" y="31" textAnchor="middle" className="v17-caption">{labels[3] ?? '模型是簡化表示，不代表真實比例'}</text>
  </svg>
}

function MotionDiagram({ visual }: VisualProps) {
  const labels = visual.items.slice(0, 4).map((item) => short(item.label, 10))
  return <svg viewBox="0 0 760 270" role="img" aria-label={visual.title}>
    <defs><marker id="v17-motion-arrow" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" className="v17-arrow" /></marker></defs><line x1="80" y1="205" x2="680" y2="205" className="v17-axis" />
    {[150,280,430,590].map((x,index) => <g key={x}><circle cx={x} cy={175-index*18} r="18" className="v17-object" /><line x1={x+22} y1={175-index*18} x2={x+80+index*12} y2={175-index*18} className="v17-vector" markerEnd="url(#v17-motion-arrow)" /><text x={x} y="238" textAnchor="middle" className="v17-label">{labels[index] ?? `階段 ${index+1}`}</text></g>)}
  </svg>
}

function BiologyDiagram({ visual }: VisualProps) {
  const items = visual.items.slice(0, 5)
  const pos = [[380,60],[190,145],[570,145],[270,235],[490,235]]
  return <svg viewBox="0 0 760 300" role="img" aria-label={visual.title}>
    {pos.slice(1).map(([x,y],index) => <line key={`${x}-${y}`} x1="380" y1="95" x2={x} y2={y-30} className="v17-guide" />)}
    {items.map((item,index) => { const [x,y] = pos[index]; return <g key={`${item.label}-${index}`}><ellipse cx={x} cy={y} rx={index===0?100:78} ry="38" className={index===0?'v17-center':'v17-node'} /><text x={x} y={y-3} textAnchor="middle" className="v17-label">{short(item.label,12)}</text><text x={x} y={y+18} textAnchor="middle" className="v17-caption">{short(item.detail,15)}</text></g> })}
  </svg>
}

function CycleDiagram({ visual }: VisualProps) {
  const items = visual.items.slice(0, 5)
  const pos = [[380,55],[575,125],[500,245],[260,245],[185,125]]
  return <svg viewBox="0 0 760 310" role="img" aria-label={visual.title}>
    <defs><marker id="v17-cycle-arrow" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" className="v17-arrow" /></marker></defs>
    {items.map((_,index) => { const [x1,y1]=pos[index]; const [x2,y2]=pos[(index+1)%items.length]; return <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} className="v17-line-strong" markerEnd="url(#v17-cycle-arrow)" /> })}
    {items.map((item,index) => { const [x,y]=pos[index]; return <g key={`${item.label}-${index}`}><circle cx={x} cy={y} r="43" className="v17-node" /><text x={x} y={y-3} textAnchor="middle" className="v17-label">{short(item.label,9)}</text><text x={x} y={y+17} textAnchor="middle" className="v17-caption">{short(item.detail,10)}</text></g> })}
  </svg>
}

function OrbitDiagram({ visual }: VisualProps) {
  const labels = visual.items.slice(0, 4).map((item)=>short(item.label,11))
  return <svg viewBox="0 0 760 300" role="img" aria-label={visual.title}>
    <ellipse cx="380" cy="150" rx="245" ry="98" className="v17-shape" /><ellipse cx="380" cy="150" rx="160" ry="62" className="v17-guide" /><circle cx="380" cy="150" r="38" className="v17-component" /><circle cx="622" cy="150" r="19" className="v17-point" /><circle cx="233" cy="105" r="14" className="v17-object" />
    <text x="380" y="155" textAnchor="middle" className="v17-label">{labels[0] ?? '中心天體'}</text><text x="622" y="185" textAnchor="middle" className="v17-label">{labels[1] ?? '位置'}</text><text x="233" y="80" textAnchor="middle" className="v17-label">{labels[2] ?? '觀測'}</text><text x="380" y="285" textAnchor="middle" className="v17-caption">{labels[3] ?? '用尺度、週期與相對位置理解系統'}</text>
  </svg>
}

function WaveDiagram({ visual }: VisualProps) {
  const labels=visual.items.slice(0,4).map((item)=>short(item.label,10))
  const points=Array.from({length:41},(_,i)=>`${70+i*15},${145-Math.sin(i/3)*58}`).join(' ')
  return <svg viewBox="0 0 760 285" role="img" aria-label={visual.title}>
    <line x1="65" y1="145" x2="695" y2="145" className="v17-axis" /><polyline points={points} className="v17-trend" /><line x1="160" y1="145" x2="160" y2="87" className="v17-guide" /><line x1="160" y1="87" x2="345" y2="87" className="v17-guide" />
    <text x="160" y="70" textAnchor="middle" className="v17-label">{labels[0]??'振幅'}</text><text x="255" y="70" textAnchor="middle" className="v17-label">{labels[1]??'週期／波長'}</text><text x="500" y="235" textAnchor="middle" className="v17-label">{labels[2]??'傳播'}</text><text x="380" y="270" textAnchor="middle" className="v17-caption">{labels[3]??'分清介質振動與波形向前傳遞'}</text>
  </svg>
}

function TimelineDiagram({ visual }: VisualProps) {
  const items=visual.items.slice(0,6); const start=95; const end=665; const step=(end-start)/Math.max(1,items.length-1)
  return <svg viewBox="0 0 760 280" role="img" aria-label={visual.title}><line x1={start-25} y1="140" x2={end+25} y2="140" className="v17-axis" />{items.map((item,index)=>{const x=start+index*step;const top=index%2===0;return <g key={`${item.label}-${index}`}><circle cx={x} cy="140" r="10" className="v17-point" /><line x1={x} y1={top?130:150} x2={x} y2={top?82:202} className="v17-guide" /><text x={x} y={top?66:225} textAnchor="middle" className="v17-label">{short(item.label,11)}</text><text x={x} y={top?88:247} textAnchor="middle" className="v17-caption">{short(item.detail,12)}</text></g>})}</svg>
}

function MapDiagram({ visual }: VisualProps) {
  const items=visual.items.slice(0,5); const pos=[[190,92],[480,75],[325,155],[575,205],[205,230]]
  return <svg viewBox="0 0 760 310" role="img" aria-label={visual.title}>
    <path d="M105 95 Q190 35 275 70 T445 65 T650 105 L620 255 Q500 278 405 235 T235 260 T105 210 Z" className="v17-shape" />
    <path d="M115 170 Q270 110 405 170 T640 155" className="v17-guide" />
    {items.map((item,index)=>{const[x,y]=pos[index];return <g key={`${item.label}-${index}`}><circle cx={x} cy={y} r="10" className="v17-point" /><text x={x+14} y={y-10} className="v17-label">{short(item.label,11)}</text><text x={x+14} y={y+10} className="v17-caption">{short(item.detail,13)}</text></g>})}
  </svg>
}

function EvidenceDiagram({ visual }: VisualProps) {
  const items=visual.items.slice(0,5); const positions=[[130,65],[130,190],[380,52],[630,65],[630,190]]
  return <svg viewBox="0 0 760 300" role="img" aria-label={visual.title}><rect x="285" y="110" width="190" height="80" rx="24" className="v17-center" /><text x="380" y="143" textAnchor="middle" className="v17-label">比較證據</text><text x="380" y="169" textAnchor="middle" className="v17-caption">來源 · 時間 · 地點 · 群體</text>{items.map((item,index)=>{const[x,y]=positions[index];const tx=x<380?285:x>380?475:380;const ty=y<110?110:190;return <g key={`${item.label}-${index}`}><line x1={x} y1={y+26} x2={tx} y2={ty} className="v17-guide" /><rect x={x-80} y={y} width="160" height="64" rx="16" className="v17-node" /><text x={x} y={y+27} textAnchor="middle" className="v17-label">{short(item.label,12)}</text><text x={x} y={y+48} textAnchor="middle" className="v17-caption">{short(item.detail,16)}</text></g>})}</svg>
}

function CivicDiagram({ visual }: VisualProps) {
  const items=visual.items.slice(0,5); const pos=[[380,62],[165,155],[595,155],[260,250],[500,250]]
  return <svg viewBox="0 0 760 310" role="img" aria-label={visual.title}>
    {pos.slice(1).map(([x,y],i)=><line key={i} x1="380" y1="94" x2={x} y2={y-30} className="v17-line" />)}
    {items.map((item,index)=>{const[x,y]=pos[index];return <g key={`${item.label}-${index}`}><rect x={x-82} y={y-32} width="164" height="64" rx="18" className={index===0?'v17-center':'v17-node'} /><text x={x} y={y-4} textAnchor="middle" className="v17-label">{short(item.label,12)}</text><text x={x} y={y+17} textAnchor="middle" className="v17-caption">{short(item.detail,15)}</text></g>})}
  </svg>
}

export function CurriculumPedagogyVisualV17({ subject, unitTitle, focus, visual }: Props) {
  const text=`${unitTitle} ${focus} ${visual.title} ${visual.items.map((item)=>`${item.label} ${item.detail}`).join(' ')}`
  let diagram=<FlowDiagram visual={visual} />
  let diagramKind='flow'

  if(subject==='math'){
    if(/座標|函數|斜率|趨勢|方程.*圖|圖形關係/.test(text)){diagram=<CoordinateDiagram visual={visual}/>;diagramKind='coordinate'}
    else if(/幾何|角|三角|圓|多邊形|面積|周長|體積|相似|全等|形狀|立體/.test(text)){diagram=<GeometryDiagram visual={visual}/>;diagramKind='geometry'}
    else if(/數線|正負|整數|分數|小數|有理數|數的大小|100\s*以內|1000\s*以內|10000\s*以內/.test(text)){diagram=<NumberLineDiagram visual={visual}/>;diagramKind='number-line'}
    else if(/資料|統計|圖表|平均|機率|長條|圓餅|分布/.test(text)){diagram=<DataChartDiagram visual={visual}/>;diagramKind='data-chart'}
    else if(/長度|容量|重量|時間|日曆|測量|單位|角度/.test(text)){diagram=<MeasurementDiagram visual={visual}/>;diagramKind='measurement'}
    else if(/加法|減法|乘法|除法|四則|因數|倍數|比率|比例|百分率|數量關係|代數|式子|方程|不等式/.test(text)){diagram=<BarModelDiagram visual={visual}/>;diagramKind='bar-model'}
  } else if(subject==='science'){
    if(/電路|電流|電壓|電阻|串聯|並聯|電與|電磁/.test(text)){diagram=<CircuitDiagram visual={visual}/>;diagramKind='circuit'}
    else if(/粒子|原子|分子|元素|化學|溶液|物質|酸鹼|反應/.test(text)){diagram=<ParticleDiagram visual={visual}/>;diagramKind='particle'}
    else if(/力|運動|速度|加速度|位移|慣性|摩擦/.test(text)){diagram=<MotionDiagram visual={visual}/>;diagramKind='motion'}
    else if(/植物|動物|生物|生態|細胞|遺傳|器官|身體|分類|生命/.test(text)){diagram=<BiologyDiagram visual={visual}/>;diagramKind='biology-system'}
    else if(/循環|水循環|天氣|氣候|岩石|地質|地球環境|季節/.test(text)){diagram=<CycleDiagram visual={visual}/>;diagramKind='earth-cycle'}
    else if(/地球與太空|太空|月亮|月相|太陽|行星|宇宙|天文|星/.test(text)){diagram=<OrbitDiagram visual={visual}/>;diagramKind='orbit'}
    else if(/光|聲音|聲|波|振動|熱|溫度|能量/.test(text)){diagram=<WaveDiagram visual={visual}/>;diagramKind='wave-energy'}
    else if(/測量|觀察|實驗|探究/.test(text)){diagram=<MeasurementDiagram visual={visual}/>;diagramKind='measurement'}
  } else if(subject==='social'){
    if(/歷史|年代|時代|事件|朝代|早期|近代|古代|演變|變遷/.test(text)){diagram=<TimelineDiagram visual={visual}/>;diagramKind='timeline'}
    else if(/地圖|位置|地形|海域|地理|環境|區域|人口分布|氣候|交通|空間/.test(text)){diagram=<MapDiagram visual={visual}/>;diagramKind='map'}
    else if(/政府|公民|法律|權利|義務|民主|制度|公共服務|政策|政治/.test(text)){diagram=<CivicDiagram visual={visual}/>;diagramKind='civic-network'}
    else if(/產業|經濟|消費|市場|人口|資料|統計|貿易|資源/.test(text)){diagram=<DataChartDiagram visual={visual}/>;diagramKind='social-data'}
    else {diagram=<EvidenceDiagram visual={visual}/>;diagramKind='evidence'}
  }

  return <figure className={`curriculum-v17-diagram subject-${subject}`} data-v17-rich-visual="true" data-v17-diagram-kind={diagramKind}><div className="curriculum-v17-diagram-canvas">{diagram}</div><figcaption><strong>圖解怎麼看</strong><span>{visual.caption}</span></figcaption></figure>
}
