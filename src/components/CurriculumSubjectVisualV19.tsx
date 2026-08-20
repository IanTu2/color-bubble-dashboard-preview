import type { CurriculumSubjectId } from '../curriculum-plan-v5'
import type { TextbookVisual } from '../curriculum-textbook-v14'
import { CurriculumPedagogyVisualV18 } from './CurriculumPedagogyVisualV18'
import '../curriculum-course-v19-fixes.css'

type BaseProps = { subject: CurriculumSubjectId; unitTitle: string; focus: string }
type VisualProps = BaseProps & { visual: TextbookVisual }
type LearningProps = BaseProps & {
  title: string
  explanation: string
  example?: string
  misconception?: { claim: string; correction: string; reason: string }
  mode?: 'intro' | 'concept' | 'model' | 'question'
}

type Family = { id: string; cue: string }
type EnglishFamily = Family & { labels: [string, string, string]; sample: string }

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
    .split(/[。；，、]|以及|並且|並|與|和|／|\/+|：/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 2),
))

function concreteItems(props: LearningProps, max = 4) {
  const focus = focusParts(`${props.unitTitle}。${props.focus}`)
  const evidence = sentenceParts(`${props.example ?? ''}。${props.explanation}`)
  const candidates = [props.unitTitle, ...focus, props.title, props.misconception ? '易錯修正' : '本課檢查'].filter(Boolean)
  const labels = Array.from(new Set(candidates)).slice(0, max)
  while (labels.length < max) labels.push(`${props.unitTitle}｜${labels.length + 1}`)
  return labels.map((label, index) => ({
    label: compact(label, 22),
    detail: compact(evidence[index] || (index === max - 1 ? props.misconception?.correction : '') || props.explanation, 72),
  }))
}

function mathFamily(text: string): Family {
  if (/微分|積分|極限|導數/.test(text)) return { id: 'calculus', cue: '函數圖形 切線 面積' }
  if (/矩陣/.test(text)) return { id: 'matrix', cue: '矩陣 表格 線性關係' }
  if (/向量/.test(text)) return { id: 'vector', cue: '座標 向量 方向' }
  if (/三角比|三角函數|正弦|餘弦|弧度/.test(text)) return { id: 'trigonometry', cue: '直角三角形 角 三角比' }
  if (/機率|隨機|排列|組合/.test(text)) return { id: 'probability', cue: '機率 樣本空間 事件' }
  if (/統計|資料|平均|中位|眾數|分布|標準差/.test(text)) return { id: 'statistics', cue: '資料 統計 圖表' }
  if (/數列|規律|模式|級數/.test(text)) return { id: 'sequence', cue: '數列 規律 項次' }
  if (/二次函數|一次函數|函數|座標|斜率|直線方程/.test(text)) return { id: 'function-coordinate', cue: '座標 函數 圖形' }
  if (/圓|圓周|弦|切線/.test(text)) return { id: 'circle', cue: '圓 圓心 角與弦' }
  if (/體積|柱體|立體|長方體|表面積/.test(text)) return { id: 'solid-geometry', cue: '立體 底面 高 體積' }
  if (/相似|全等|三角形|畢氏/.test(text)) return { id: 'triangle-geometry', cue: '三角形 邊角 關係' }
  if (/幾何|形狀|角|四邊形|多邊形|面積|周長|垂直|對稱/.test(text)) return { id: 'geometry', cue: '幾何 點線角 圖形' }
  if (/長度|容量|重量|時間|日曆|測量|單位|角度/.test(text)) return { id: 'measurement', cue: '測量 單位 刻度' }
  if (/因數|倍數|質數|公因數|公倍數/.test(text)) return { id: 'factors-multiples', cue: '因數 倍數 分解' }
  if (/百分率|比率|比例|正比|反比|速率/.test(text)) return { id: 'ratio-rate', cue: '比例 比值 對應量' }
  if (/分數|小數/.test(text)) return { id: 'fraction-decimal', cue: '分數 小數 等值與大小' }
  if (/方程|不等式|代數|多項式|因式|數量關係|式子/.test(text)) return { id: 'algebra-equation', cue: '代數 等式 未知量' }
  if (/加法|減法|乘法|除法|四則|運算/.test(text)) return { id: 'operations', cue: '運算 數量關係 計算' }
  if (/100\s*以內|1000\s*以內|10000\s*以內|位值|大數|數的表示|數與量/.test(text)) return { id: 'place-value', cue: '位值 數的大小 表示' }
  if (/負數|正負|絕對值|相反數|有向數/.test(text)) return { id: 'signed-number', cue: '數線 正負 相反數' }
  return { id: 'number-representation', cue: '數的表示 大小 規律' }
}

function scienceFamily(text: string): Family {
  if (/電磁|電路|電流|電壓|電阻|電場|電位/.test(text)) return { id: 'electricity', cue: '電路 電流 電壓' }
  if (/原子|分子|元素|化學|溶液|物質|酸鹼|反應/.test(text)) return { id: 'particle-chemistry', cue: '粒子 原子 化學 物質' }
  if (/力|運動|速度|加速度|位移|慣性|摩擦/.test(text)) return { id: 'motion-force', cue: '力 運動 速度' }
  if (/細胞|遺傳|生態|植物|動物|生物|器官|生命|演化/.test(text)) return { id: 'biology', cue: '生物 細胞 生態' }
  if (/太空|月亮|月相|太陽|行星|宇宙|天文|星/.test(text)) return { id: 'astronomy', cue: '太空 行星 宇宙' }
  if (/地質|岩石|地球|天氣|氣候|海洋|水循環|季節/.test(text)) return { id: 'earth-system', cue: '循環 地球 天氣 氣候' }
  if (/光|聲|波|振動|熱|溫度|能量/.test(text)) return { id: 'wave-energy', cue: '光 聲 波 能量' }
  return { id: 'investigation', cue: '測量 觀察 實驗 探究' }
}

function socialFamily(text: string): Family {
  if (/歷史|年代|時代|事件|朝代|早期|近代|古代|演變|變遷/.test(text)) return { id: 'history', cue: '歷史 年代 變遷' }
  if (/地圖|位置|地形|海域|地理|環境|區域|氣候|交通|空間/.test(text)) return { id: 'geography', cue: '地圖 位置 地理 空間' }
  if (/政府|公民|法律|權利|義務|民主|制度|公共服務|政策|政治/.test(text)) return { id: 'civics', cue: '政府 公民 法律 制度' }
  if (/產業|經濟|消費|市場|人口|統計|貿易|資源/.test(text)) return { id: 'economy-data', cue: '資料 統計 經濟 市場' }
  return { id: 'source-evidence', cue: '證據 來源 觀點' }
}

function englishFamily(text: string): EnglishFamily {
  if (/字母|字母音|拼讀|phonics|發音|聲音與節奏/i.test(text)) return { id: 'phonics', cue: 'sound-letter', labels: ['SOUND', 'LETTER', 'WORD'], sample: 'B /b/ → book' }
  if (/招呼|自我介紹|姓名|年齡|生活對話|口語小對話/i.test(text)) return { id: 'social-language', cue: 'speaker-response', labels: ['SPEAKER', 'MEANING', 'RESPONSE'], sample: 'Hello! My name is Mia.' }
  if (/字彙|單字|顏色|數字|教室|家庭|食物|購物|天氣|服裝|地點|方向/i.test(text)) return { id: 'vocabulary-context', cue: 'word-category-use', labels: ['WORD', 'CATEGORY', 'USE'], sample: 'library → a place for books' }
  if (/be 動詞|be動詞|基本句型/i.test(text)) return { id: 'be-sentence', cue: 'subject-be-complement', labels: ['SUBJECT', 'BE', 'COMPLEMENT'], sample: 'She is ready.' }
  if (/問句|問答|wh|yes\/no|疑問/i.test(text)) return { id: 'question-form', cue: 'question-clue-answer', labels: ['QUESTION', 'CLUE', 'ANSWER'], sample: 'Where is the library?' }
  if (/情態|命令|指令|祈使|can|must|should/i.test(text)) return { id: 'modal-imperative', cue: 'modal-action-purpose', labels: ['MODAL', 'ACTION', 'PURPOSE'], sample: 'Can you help me?' }
  if (/進行式|正在/i.test(text)) return { id: 'progressive', cue: 'now-be-v-ing', labels: ['NOW', 'BE', 'V-ING'], sample: 'She is reading now.' }
  if (/過去式|過去|yesterday/i.test(text)) return { id: 'past-tense', cue: 'past-clue-verb', labels: ['PAST CLUE', 'VERB', 'EVENT'], sample: 'They visited the museum yesterday.' }
  if (/未來|will|be going to/i.test(text)) return { id: 'future-tense', cue: 'future-clue-plan', labels: ['FUTURE CLUE', 'FORM', 'PLAN'], sample: 'We will meet tomorrow.' }
  if (/動名詞|不定詞|gerund|infinitive/i.test(text)) return { id: 'gerund-infinitive', cue: 'verb-pattern-complement', labels: ['VERB', 'PATTERN', 'COMPLEMENT'], sample: 'I enjoy reading.' }
  if (/比較|最高級|compar/i.test(text)) return { id: 'comparison', cue: 'item-marker-standard', labels: ['ITEM A', 'COMPARE', 'ITEM B'], sample: 'A is taller than B.' }
  if (/被動|passive/i.test(text)) return { id: 'passive', cue: 'receiver-action-doer', labels: ['RECEIVER', 'ACTION', 'DOER / BY'], sample: 'The letter was written by Mia.' }
  if (/完成式|have\s+pp|perfect/i.test(text)) return { id: 'perfect', cue: 'before-now-result', labels: ['BEFORE', 'HAVE + PP', 'NOW'], sample: 'I have finished my homework.' }
  if (/關係子句|relative/i.test(text)) return { id: 'relative-clause', cue: 'noun-link-detail', labels: ['NOUN', 'WHO / THAT', 'DETAIL'], sample: 'The book that I bought is new.' }
  if (/條件句|condition|if/i.test(text)) return { id: 'conditional', cue: 'if-condition-result', labels: ['IF', 'CONDITION', 'RESULT'], sample: 'If it rains, we will stay home.' }
  if (/複句|連接詞|clause|because|although/i.test(text)) return { id: 'clause-link', cue: 'main-link-detail', labels: ['MAIN', 'LINK', 'DETAIL'], sample: 'I stayed home because it rained.' }
  if (/聽力|聽說|口說|speaking|listening/i.test(text)) return { id: 'listening-speaking', cue: 'speaker-clue-response', labels: ['SPEAKER', 'CLUE', 'RESPONSE'], sample: 'Listen for who, where, and why.' }
  if (/寫作|書寫|writing|段落|句子組織/i.test(text)) return { id: 'writing', cue: 'topic-detail-revise', labels: ['TOPIC', 'DETAIL', 'REVISE'], sample: 'Topic sentence → detail → revision' }
  if (/閱讀|短文|文本|篇章|跨文化|學術/i.test(text)) return { id: 'reading', cue: 'text-clue-inference', labels: ['TEXT', 'CLUE', 'INFERENCE'], sample: 'Read → find evidence → infer.' }
  if (/現在式|日常作息|習慣|第三人稱/i.test(text)) return { id: 'present-simple', cue: 'routine-subject-verb', labels: ['ROUTINE', 'SUBJECT', 'VERB'], sample: 'He plays basketball every day.' }
  return { id: 'context-pattern', cue: 'context-form-meaning', labels: ['CONTEXT', 'FORM', 'MEANING'], sample: 'Use the form that matches the situation.' }
}

function ChineseDiscourseVisual(props: LearningProps) {
  const text = `${props.unitTitle} ${props.focus} ${props.title}`
  const source = sentenceParts(`${props.example ?? ''}。${props.explanation}`)
  let labels = ['語句', '上下文', '讀法']
  let family = 'discourse'
  if (/字音|字形|注音|字詞|工具書/.test(text)) { labels = ['字詞', '讀音／字形', '語境用法']; family = 'literacy' }
  else if (/文言|古文|古典|詩|韻文/.test(text)) { labels = ['原句', '語詞線索', '今義／作用']; family = 'classical-text' }
  else if (/論證|議論|媒體|跨文本|觀點|證據/.test(text)) { labels = ['主張', '文本證據', '判讀']; family = 'argument-evidence' }
  const values = [compact(source[0] || props.example || props.unitTitle, 42), compact(source[1] || props.explanation, 42), compact(props.misconception?.correction || source[2] || props.explanation, 42)]
  return <figure className="curriculum-v19-learning-visual chinese" data-v20-unit-visual={`chinese-${family}`}>
    <div className="v19-chinese-page">
      <div className="v19-chinese-line primary"><span>{labels[0]}</span><strong>{values[0]}</strong></div>
      <div className="v19-chinese-arrow">↓ 對照本課線索</div>
      <div className="v19-chinese-line"><span>{labels[1]}</span><strong>{values[1]}</strong></div>
      <div className="v19-chinese-arrow">↓ 回到文本判斷</div>
      <div className="v19-chinese-line accent"><span>{labels[2]}</span><strong>{values[2]}</strong></div>
    </div>
    <figcaption><strong>{props.unitTitle}</strong><span>{compact(props.focus, 72)}</span></figcaption>
  </figure>
}

function EnglishSceneVisual(props: LearningProps) {
  const family = englishFamily(`${props.unitTitle} ${props.focus} ${props.title}`)
  const parts = focusParts(props.focus)
  const unitClues = [parts[0], parts[1], parts[2]].filter(Boolean)
  const values: [string, string, string] = [
    compact(unitClues[0] || family.sample, 26),
    compact(unitClues[1] || family.cue, 26),
    compact(unitClues[2] || family.sample, 30),
  ]
  return <figure className="curriculum-v19-learning-visual english" data-v20-unit-visual={`english-${family.id}`}>
    <div className="v19-dialogue-stage">
      <div className="v19-avatar">A</div><div className="v19-bubble a">{family.sample}</div>
      <div className="v19-bubble b">{compact(unitClues.join(' · ') || props.focus, 68)}</div><div className="v19-avatar b">B</div>
    </div>
    <div className="v19-sentence-rail" aria-label={`${props.unitTitle} visual pattern`}>
      {family.labels.map((label, index) => <span key={label}><small>{label}</small><strong>{values[index]}</strong></span>)}
    </div>
    <figcaption><strong>{props.unitTitle}</strong><span>{family.cue} · {compact(props.focus, 58)}</span></figcaption>
  </figure>
}

function RoutedSubjectVisual(props: LearningProps & { family: Family; visualSubject: CurriculumSubjectId }) {
  const visual: TextbookVisual = {
    id: `v20-${props.visualSubject}-${props.unitTitle}-${props.title}`,
    kind: props.mode === 'model' ? 'process' : 'concept-map',
    title: `${props.unitTitle}｜${props.family.cue}`,
    caption: `${props.family.cue}：${compact(props.focus, 92)}`,
    items: concreteItems(props),
  }
  return <div data-v20-unit-visual={`${props.visualSubject}-${props.family.id}`}><CurriculumPedagogyVisualV18 subject={props.visualSubject} unitTitle={props.unitTitle} focus={props.focus} visual={visual} /></div>
}

function MathRelationVisual(props: LearningProps) { return <RoutedSubjectVisual {...props} family={mathFamily(`${props.unitTitle} ${props.focus} ${props.title}`)} visualSubject="math" /> }
function ScienceEvidenceVisual(props: LearningProps) { return <RoutedSubjectVisual {...props} family={scienceFamily(`${props.unitTitle} ${props.focus} ${props.title}`)} visualSubject="science" /> }
function SocialLensVisual(props: LearningProps) { return <RoutedSubjectVisual {...props} family={socialFamily(`${props.unitTitle} ${props.focus} ${props.title}`)} visualSubject="social" /> }

export function CurriculumLearningVisualV19(props: LearningProps) {
  if (props.subject === 'chinese') return <ChineseDiscourseVisual {...props} />
  if (props.subject === 'english') return <EnglishSceneVisual {...props} />
  if (props.subject === 'math') return <MathRelationVisual {...props} />
  if (props.subject === 'science') return <ScienceEvidenceVisual {...props} />
  return <SocialLensVisual {...props} />
}

function ChineseOverviewVisual({ unitTitle, focus, visual }: VisualProps) {
  const items = visual.items.slice(0, 5)
  return <figure className="curriculum-v19-overview-visual chinese" data-v19-rich-visual="true" data-v19-diagram-kind="chinese-discourse-map" data-v20-unit-visual="chinese-overview">
    <div className="v19-discourse-map"><div className="v19-paper-spine">{compact(unitTitle, 12)}</div>{items.map((item, index) => <div className={`v19-paragraph p${index + 1}`} key={`${item.label}-${index}`}><span>{index + 1}</span><strong>{compact(item.label, 18)}</strong><small>{compact(item.detail, 30)}</small></div>)}</div>
    <figcaption><strong>{unitTitle}</strong><span>{compact(focus, 72)}</span></figcaption>
  </figure>
}

function EnglishOverviewVisual({ unitTitle, focus, visual }: VisualProps) {
  const items = visual.items.slice(0, 4)
  const family = englishFamily(`${unitTitle} ${focus}`)
  return <figure className="curriculum-v19-overview-visual english" data-v19-rich-visual="true" data-v19-diagram-kind="english-dialogue-pattern" data-v20-unit-visual={`english-overview-${family.id}`}>
    <div className="v19-english-overview">
      <div className="v19-dialogue-card"><span>A</span><p>{family.sample}</p></div>
      <div className="v19-dialogue-card right"><p>{compact(focusParts(focus).join(' · ') || focus, 72)}</p><span>B</span></div>
      <div className="v19-pattern-grid">{items.map((item, index) => <div key={`${item.label}-${index}`}><small>{family.labels[index % 3]}</small><strong>{compact(item.label, 18)}</strong></div>)}</div>
    </div>
    <figcaption><strong>{unitTitle}</strong><span>{family.cue}</span></figcaption>
  </figure>
}

export function CurriculumPedagogyVisualV19(props: VisualProps) {
  if (props.subject === 'chinese') return <ChineseOverviewVisual {...props} />
  if (props.subject === 'english') return <EnglishOverviewVisual {...props} />
  return <CurriculumPedagogyVisualV18 {...props} />
}
