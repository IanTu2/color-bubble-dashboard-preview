import type { CurriculumSubjectId } from '../curriculum-plan-v5'
import type { TextbookVisual } from '../curriculum-textbook-v14'
import { CurriculumPedagogyVisualV18 } from './CurriculumPedagogyVisualV18'
import '../curriculum-course-v19-fixes.css'

type BaseProps = {
  subject: CurriculumSubjectId
  unitTitle: string
  focus: string
}

type VisualProps = BaseProps & { visual: TextbookVisual }
type LearningProps = BaseProps & {
  title: string
  explanation: string
  example?: string
  misconception?: { claim: string; correction: string; reason: string }
  mode?: 'intro' | 'concept' | 'model' | 'question'
}

const compact = (value: string, max = 48) => {
  const clean = String(value ?? '').replace(/\s+/g, ' ').trim()
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).replace(/[，、；：,.!?。！？\s]+$/g, '')}…`
}

const sentenceParts = (value: string) => String(value ?? '')
  .split(/[。！？；!?;]/)
  .map((item) => item.trim())
  .filter(Boolean)

const focusParts = (value: string) => Array.from(new Set(
  String(value ?? '')
    .split(/[。；，、]|以及|並且|並|與|和|／|\/+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 2),
))

function englishExcerpt(value: string) {
  const matches = String(value ?? '').match(/[A-Za-z][A-Za-z0-9'’ ,.!?\-]{5,}/g) ?? []
  return matches.map((item) => item.trim()).sort((a, b) => b.length - a.length)[0] ?? ''
}

function concreteItems(props: LearningProps, max = 4) {
  const focus = focusParts(`${props.unitTitle}。${props.focus}`)
  const evidence = sentenceParts(`${props.example ?? ''}。${props.explanation}`)
  const candidates = [
    props.unitTitle,
    ...focus,
    props.title,
    props.example ? '本課例子' : '',
    props.misconception ? '易錯修正' : '本課檢查',
  ].filter(Boolean)
  const labels = Array.from(new Set(candidates)).slice(0, max)
  while (labels.length < max) labels.push(`${props.unitTitle}｜${labels.length + 1}`)
  return labels.map((label, index) => ({
    label: compact(label, 22),
    detail: compact(evidence[index] || (index === max - 1 ? props.misconception?.correction : '') || props.explanation, 72),
  }))
}

function mathFamily(text: string) {
  if (/微分|積分|極限|導數/.test(text)) return { id: 'calculus', cue: '座標 函數 斜率' }
  if (/向量|矩陣/.test(text)) return { id: 'vector-matrix', cue: '座標 向量 關係' }
  if (/三角比|三角函數|正弦|餘弦/.test(text)) return { id: 'trigonometry', cue: '三角 幾何 角' }
  if (/函數|座標|斜率|二次函數|一次函數/.test(text)) return { id: 'function-coordinate', cue: '座標 函數 趨勢' }
  if (/機率|統計|資料|平均|中位|眾數|分布/.test(text)) return { id: 'data-probability', cue: '資料 統計 圖表' }
  if (/幾何|形狀|角|三角形|四邊形|圓|多邊形|面積|周長|體積|相似|全等|柱體|立體/.test(text)) return { id: 'geometry', cue: '幾何 圖形 角' }
  if (/長度|容量|重量|時間|日曆|測量|單位|角度/.test(text)) return { id: 'measurement', cue: '測量 單位 刻度' }
  if (/方程|不等式|代數|多項式|因式|數量關係|比率|比例|百分率|因數|倍數|四則|加法|減法|乘法|除法/.test(text)) return { id: 'algebra-relation', cue: '方程 代數 數量關係' }
  return { id: 'number-representation', cue: '數線 數的大小 整數 分數 小數' }
}

function scienceFamily(text: string) {
  if (/電磁|電路|電流|電壓|電阻|電場|電位/.test(text)) return { id: 'electricity', cue: '電路 電流 電壓' }
  if (/原子|分子|元素|化學|溶液|物質|酸鹼|反應/.test(text)) return { id: 'particle-chemistry', cue: '粒子 原子 化學 物質' }
  if (/力|運動|速度|加速度|位移|慣性|摩擦/.test(text)) return { id: 'motion-force', cue: '力 運動 速度' }
  if (/細胞|遺傳|生態|植物|動物|生物|器官|生命|演化/.test(text)) return { id: 'biology', cue: '生物 細胞 生態' }
  if (/太空|月亮|月相|太陽|行星|宇宙|天文|星/.test(text)) return { id: 'astronomy', cue: '太空 行星 宇宙' }
  if (/地質|岩石|地球|天氣|氣候|海洋|水循環|季節/.test(text)) return { id: 'earth-system', cue: '循環 地球 天氣 氣候' }
  if (/光|聲|波|振動|熱|溫度|能量/.test(text)) return { id: 'wave-energy', cue: '光 聲 波 能量' }
  return { id: 'investigation', cue: '測量 觀察 實驗 探究' }
}

function socialFamily(text: string) {
  if (/歷史|年代|時代|事件|朝代|早期|近代|古代|演變|變遷/.test(text)) return { id: 'history', cue: '歷史 年代 變遷' }
  if (/地圖|位置|地形|海域|地理|環境|區域|氣候|交通|空間/.test(text)) return { id: 'geography', cue: '地圖 位置 地理 空間' }
  if (/政府|公民|法律|權利|義務|民主|制度|公共服務|政策|政治/.test(text)) return { id: 'civics', cue: '政府 公民 法律 制度' }
  if (/產業|經濟|消費|市場|人口|統計|貿易|資源/.test(text)) return { id: 'economy-data', cue: '資料 統計 經濟 市場' }
  return { id: 'source-evidence', cue: '證據 來源 觀點' }
}

function ChineseDiscourseVisual(props: LearningProps) {
  const text = `${props.unitTitle} ${props.focus} ${props.title}`
  const source = sentenceParts(`${props.example ?? ''}。${props.explanation}`)
  let labels = ['語句', '上下文', '讀法']
  let family = 'discourse'
  if (/字音|字形|注音|字詞|工具書/.test(text)) { labels = ['字詞', '讀音／字形', '語境用法']; family = 'literacy' }
  else if (/文言|古文|古典|詩|韻文/.test(text)) { labels = ['原句', '語詞線索', '今義／作用']; family = 'classical-text' }
  else if (/論證|議論|媒體|跨文本|觀點|證據/.test(text)) { labels = ['主張', '文本證據', '判讀']; family = 'argument-evidence' }
  const values = [
    compact(source[0] || props.example || props.unitTitle, 42),
    compact(source[1] || props.explanation, 42),
    compact(props.misconception?.correction || source[2] || props.explanation, 42),
  ]
  return (
    <figure className="curriculum-v19-learning-visual chinese" data-v20-unit-visual={`chinese-${family}`}>
      <div className="v19-chinese-page">
        <div className="v19-chinese-line primary"><span>{labels[0]}</span><strong>{values[0]}</strong></div>
        <div className="v19-chinese-arrow">↓ 對照本課線索</div>
        <div className="v19-chinese-line"><span>{labels[1]}</span><strong>{values[1]}</strong></div>
        <div className="v19-chinese-arrow">↓ 回到文本判斷</div>
        <div className="v19-chinese-line accent"><span>{labels[2]}</span><strong>{values[2]}</strong></div>
      </div>
      <figcaption><strong>{props.unitTitle}</strong><span>{compact(props.focus, 72)}</span></figcaption>
    </figure>
  )
}

function EnglishSceneVisual(props: LearningProps) {
  const text = `${props.unitTitle} ${props.focus} ${props.title}`
  const excerpt = englishExcerpt(`${props.example ?? ''} ${props.explanation}`) || compact(props.title, 62)
  let labels = ['CONTEXT', 'FORM', 'MEANING']
  let values = [compact(excerpt, 26), compact(props.title, 22), compact(props.focus, 28)]
  let family = 'context-pattern'
  if (/過去|未來|完成|現在式|進行式|時態|tense/i.test(text)) {
    labels = ['BEFORE', 'NOW', 'TIME CLUE']; values = [compact(excerpt, 26), compact(props.title, 22), compact(props.focus, 28)]; family = 'tense-timeline'
  } else if (/比較|最高級|compar/i.test(text)) {
    labels = ['A', 'COMPARE', 'B']; values = [compact(excerpt, 24), compact(props.title, 22), compact(props.focus, 28)]; family = 'comparison'
  } else if (/被動|passive/i.test(text)) {
    labels = ['RECEIVER', 'ACTION', 'DOER / BY']; values = [compact(excerpt, 24), compact(props.title, 22), compact(props.focus, 28)]; family = 'passive-roles'
  } else if (/關係子句|條件句|複句|連接詞|clause|condition/i.test(text)) {
    labels = ['MAIN', 'LINK', 'DETAIL']; values = [compact(excerpt, 24), compact(props.title, 22), compact(props.focus, 28)]; family = 'clause-link'
  }
  return (
    <figure className="curriculum-v19-learning-visual english" data-v20-unit-visual={`english-${family}`}>
      <div className="v19-dialogue-stage">
        <div className="v19-avatar">A</div><div className="v19-bubble a">{compact(excerpt, 72)}</div>
        <div className="v19-bubble b">{compact(props.focus, 62)}</div><div className="v19-avatar b">B</div>
      </div>
      <div className="v19-sentence-rail" aria-label={`${props.unitTitle} visual pattern`}>
        {labels.map((label, index) => <span key={label}><small>{label}</small><strong>{values[index]}</strong></span>)}
      </div>
      <figcaption><strong>{props.unitTitle}</strong><span>圖中的句子、結構與提示直接來自這一單元，不使用跨單元固定句型殼。</span></figcaption>
    </figure>
  )
}

function MathRelationVisual(props: LearningProps) {
  const family = mathFamily(`${props.unitTitle} ${props.focus} ${props.title}`)
  const visual: TextbookVisual = {
    id: `v20-math-${props.unitTitle}-${props.title}`,
    kind: props.mode === 'model' ? 'process' : 'concept-map',
    title: `${props.unitTitle}｜${family.cue}`,
    caption: `${props.unitTitle}：${compact(props.focus, 96)}`,
    items: concreteItems(props),
  }
  return <div data-v20-unit-visual={`math-${family.id}`}><CurriculumPedagogyVisualV18 subject="math" unitTitle={props.unitTitle} focus={props.focus} visual={visual} /></div>
}

function ScienceEvidenceVisual(props: LearningProps) {
  const family = scienceFamily(`${props.unitTitle} ${props.focus} ${props.title}`)
  const visual: TextbookVisual = {
    id: `v20-science-${props.unitTitle}-${props.title}`,
    kind: props.mode === 'model' ? 'process' : 'concept-map',
    title: `${props.unitTitle}｜${family.cue}`,
    caption: `${props.unitTitle}：${compact(props.focus, 96)}`,
    items: concreteItems(props),
  }
  return <div data-v20-unit-visual={`science-${family.id}`}><CurriculumPedagogyVisualV18 subject="science" unitTitle={props.unitTitle} focus={props.focus} visual={visual} /></div>
}

function SocialLensVisual(props: LearningProps) {
  const family = socialFamily(`${props.unitTitle} ${props.focus} ${props.title}`)
  const visual: TextbookVisual = {
    id: `v20-social-${props.unitTitle}-${props.title}`,
    kind: props.mode === 'model' ? 'process' : 'concept-map',
    title: `${props.unitTitle}｜${family.cue}`,
    caption: `${props.unitTitle}：${compact(props.focus, 96)}`,
    items: concreteItems(props),
  }
  return <div data-v20-unit-visual={`social-${family.id}`}><CurriculumPedagogyVisualV18 subject="social" unitTitle={props.unitTitle} focus={props.focus} visual={visual} /></div>
}

export function CurriculumLearningVisualV19(props: LearningProps) {
  if (props.subject === 'chinese') return <ChineseDiscourseVisual {...props} />
  if (props.subject === 'english') return <EnglishSceneVisual {...props} />
  if (props.subject === 'math') return <MathRelationVisual {...props} />
  if (props.subject === 'science') return <ScienceEvidenceVisual {...props} />
  return <SocialLensVisual {...props} />
}

function ChineseOverviewVisual({ unitTitle, focus, visual }: VisualProps) {
  const items = visual.items.slice(0, 5)
  return (
    <figure className="curriculum-v19-overview-visual chinese" data-v19-rich-visual="true" data-v19-diagram-kind="chinese-discourse-map" data-v20-unit-visual="chinese-overview">
      <div className="v19-discourse-map">
        <div className="v19-paper-spine">{compact(unitTitle, 12)}</div>
        {items.map((item, index) => <div className={`v19-paragraph p${index + 1}`} key={`${item.label}-${index}`}><span>{index + 1}</span><strong>{compact(item.label, 18)}</strong><small>{compact(item.detail, 30)}</small></div>)}
      </div>
      <figcaption><strong>{unitTitle}</strong><span>{compact(focus, 72)}</span></figcaption>
    </figure>
  )
}

function EnglishOverviewVisual({ unitTitle, focus, visual }: VisualProps) {
  const items = visual.items.slice(0, 4)
  const utterance = englishExcerpt(visual.items.map((item) => `${item.label} ${item.detail}`).join(' ')) || compact(unitTitle, 54)
  return (
    <figure className="curriculum-v19-overview-visual english" data-v19-rich-visual="true" data-v19-diagram-kind="english-dialogue-pattern" data-v20-unit-visual="english-overview">
      <div className="v19-english-overview">
        <div className="v19-dialogue-card"><span>A</span><p>{compact(utterance, 72)}</p></div>
        <div className="v19-dialogue-card right"><p>{compact(focus, 72)}</p><span>B</span></div>
        <div className="v19-pattern-grid">{items.map((item, index) => <div key={`${item.label}-${index}`}><small>{['CONTEXT','MEANING','PATTERN','USE'][index] ?? `STEP ${index + 1}`}</small><strong>{compact(item.label, 18)}</strong></div>)}</div>
      </div>
      <figcaption><strong>{unitTitle}</strong><span>對話與結構直接取自本單元的教材內容。</span></figcaption>
    </figure>
  )
}

export function CurriculumPedagogyVisualV19(props: VisualProps) {
  if (props.subject === 'chinese') return <ChineseOverviewVisual {...props} />
  if (props.subject === 'english') return <EnglishOverviewVisual {...props} />
  return <CurriculumPedagogyVisualV18 {...props} />
}
