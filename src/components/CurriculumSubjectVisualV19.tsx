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

function englishExcerpt(value: string) {
  const matches = String(value ?? '').match(/[A-Za-z][A-Za-z0-9'’ ,.!?\-]{5,}/g) ?? []
  return matches.map((item) => item.trim()).sort((a, b) => b.length - a.length)[0] ?? ''
}

function numberTokens(value: string) {
  return Array.from(new Set((String(value ?? '').match(/[-+]?\d+(?:\.\d+)?%?|[xyab]=?|-?\d+\/\d+/gi) ?? []).slice(0, 6)))
}

function ChineseDiscourseVisual({ title, explanation, example, misconception }: LearningProps) {
  const source = sentenceParts(example || explanation)
  const first = compact(source[0] || title, 34)
  const second = compact(source[1] || explanation, 34)
  const correction = compact(misconception?.correction || '回到上下文，確認語句之間的關係', 34)
  return (
    <figure className="curriculum-v19-learning-visual chinese" data-v19-subject-visual="chinese-discourse">
      <div className="v19-chinese-page">
        <div className="v19-chinese-line primary"><span>語句</span><strong>{first}</strong></div>
        <div className="v19-chinese-arrow">↓ 找線索</div>
        <div className="v19-chinese-line"><span>上下文</span><strong>{second}</strong></div>
        <div className="v19-chinese-arrow">↓ 推語意</div>
        <div className="v19-chinese-line accent"><span>讀法</span><strong>{correction}</strong></div>
      </div>
      <figcaption><strong>篇章透視</strong><span>先看句子在文章裡的位置與關係，再回到文字細讀。</span></figcaption>
    </figure>
  )
}

function EnglishSceneVisual({ title, explanation, example }: LearningProps) {
  const excerpt = englishExcerpt(`${example ?? ''} ${explanation}`) || compact(title, 46)
  const words = excerpt.replace(/[.!?]/g, '').split(/\s+/).filter(Boolean)
  const subjectWord = words[0] || 'Who'
  const verbWord = words[1] || 'does'
  const detail = words.slice(2).join(' ') || 'what / where / when'
  return (
    <figure className="curriculum-v19-learning-visual english" data-v19-subject-visual="english-scene">
      <div className="v19-dialogue-stage">
        <div className="v19-avatar">A</div><div className="v19-bubble a">{compact(excerpt, 68)}</div>
        <div className="v19-bubble b">Listen → notice → say it again</div><div className="v19-avatar b">B</div>
      </div>
      <div className="v19-sentence-rail" aria-label="句型結構">
        <span><small>WHO</small><strong>{compact(subjectWord, 16)}</strong></span>
        <i>→</i>
        <span><small>ACTION</small><strong>{compact(verbWord, 16)}</strong></span>
        <i>→</i>
        <span><small>DETAIL</small><strong>{compact(detail, 28)}</strong></span>
      </div>
      <figcaption><strong>情境＋句型</strong><span>先把英語放回對話，再看誰、做什麼、補充什麼資訊。</span></figcaption>
    </figure>
  )
}

function MathRelationVisual(props: LearningProps) {
  const tokens = numberTokens(`${props.title} ${props.explanation} ${props.example ?? ''}`)
  const synthetic: TextbookVisual = {
    id: `v19-math-${props.title}`,
    kind: 'concept-map',
    title: props.title,
    caption: '把條件轉成數、圖形或關係，再用圖檢查答案。',
    items: [
      { label: '已知', detail: tokens.slice(0, 2).join('、') || compact(props.explanation, 28) },
      { label: '表示', detail: compact(props.example || props.explanation, 34) },
      { label: '關係', detail: tokens.slice(2, 5).join('、') || compact(props.title, 28) },
      { label: '檢查', detail: compact(props.misconception?.correction || '回到條件核對結果', 32) },
    ],
  }
  return <CurriculumPedagogyVisualV18 subject="math" unitTitle={props.unitTitle} focus={`${props.focus} ${props.title}`} visual={synthetic} />
}

function ScienceEvidenceVisual({ title, explanation, example, misconception }: LearningProps) {
  return (
    <figure className="curriculum-v19-learning-visual science" data-v19-subject-visual="science-evidence">
      <div className="v19-science-stage">
        <div className="v19-science-source"><span>①</span><small>觀察 / 操作</small><strong>{compact(example || explanation, 42)}</strong></div>
        <div className="v19-science-arrow">→</div>
        <div className="v19-science-source"><span>②</span><small>變因 / 結構</small><strong>{compact(title, 34)}</strong></div>
        <div className="v19-science-arrow">→</div>
        <div className="v19-science-source accent"><span>③</span><small>證據 / 結論</small><strong>{compact(misconception?.correction || explanation, 42)}</strong></div>
      </div>
      <div className="v19-observation-scale"><i /><i /><i /><i /><b>量測／比較</b></div>
      <figcaption><strong>證據鏈</strong><span>自然科先看「做了什麼 → 觀察到什麼 → 能支持什麼」。</span></figcaption>
    </figure>
  )
}

function SocialLensVisual({ title, explanation, example, misconception }: LearningProps) {
  return (
    <figure className="curriculum-v19-learning-visual social" data-v19-subject-visual="social-lenses">
      <div className="v19-social-canvas">
        <div className="v19-social-center"><small>正在理解</small><strong>{compact(title, 30)}</strong></div>
        <div className="v19-social-lens time"><span>時間</span><strong>先後／變遷</strong></div>
        <div className="v19-social-lens place"><span>空間</span><strong>地點／分布</strong></div>
        <div className="v19-social-lens data"><span>資料</span><strong>{compact(example || explanation, 24)}</strong></div>
        <div className="v19-social-lens view"><span>觀點</span><strong>{compact(misconception?.correction || '比較不同立場與證據', 24)}</strong></div>
        <svg viewBox="0 0 100 100" aria-hidden="true"><path d="M18 22 L50 50 L82 22 M18 78 L50 50 L82 78" /></svg>
      </div>
      <figcaption><strong>四個社會鏡頭</strong><span>同一件事同時看時間、空間、資料與觀點，比只讀一段敘述更完整。</span></figcaption>
    </figure>
  )
}

export function CurriculumLearningVisualV19(props: LearningProps) {
  if (props.subject === 'chinese') return <ChineseDiscourseVisual {...props} />
  if (props.subject === 'english') return <EnglishSceneVisual {...props} />
  if (props.subject === 'math') return <MathRelationVisual {...props} />
  if (props.subject === 'science') return <ScienceEvidenceVisual {...props} />
  return <SocialLensVisual {...props} />
}

function ChineseOverviewVisual({ visual }: VisualProps) {
  const items = visual.items.slice(0, 5)
  return (
    <figure className="curriculum-v19-overview-visual chinese" data-v19-rich-visual="true" data-v19-diagram-kind="chinese-discourse-map">
      <div className="v19-discourse-map">
        <div className="v19-paper-spine">篇章</div>
        {items.map((item, index) => <div className={`v19-paragraph p${index + 1}`} key={`${item.label}-${index}`}><span>{index + 1}</span><strong>{compact(item.label, 18)}</strong><small>{compact(item.detail, 30)}</small></div>)}
      </div>
      <figcaption><strong>文章不是一排文字</strong><span>把段落、線索、語意與表達作用放在同一張篇章圖上。</span></figcaption>
    </figure>
  )
}

function EnglishOverviewVisual({ visual }: VisualProps) {
  const items = visual.items.slice(0, 4)
  const utterance = englishExcerpt(visual.items.map((item) => `${item.label} ${item.detail}`).join(' ')) || 'Who does what, where and when?'
  return (
    <figure className="curriculum-v19-overview-visual english" data-v19-rich-visual="true" data-v19-diagram-kind="english-dialogue-pattern">
      <div className="v19-english-overview">
        <div className="v19-dialogue-card"><span>A</span><p>{compact(utterance, 72)}</p></div>
        <div className="v19-dialogue-card right"><p>Listen for meaning first, then notice the pattern.</p><span>B</span></div>
        <div className="v19-pattern-grid">{items.map((item, index) => <div key={`${item.label}-${index}`}><small>{['CONTEXT','MEANING','PATTERN','USE'][index] ?? `STEP ${index + 1}`}</small><strong>{compact(item.label, 18)}</strong></div>)}</div>
      </div>
      <figcaption><strong>英語先出現在情境裡</strong><span>用對話、語意與句型槽位看懂語言，而不是先讀文法定義。</span></figcaption>
    </figure>
  )
}

export function CurriculumPedagogyVisualV19(props: VisualProps) {
  if (props.subject === 'chinese') return <ChineseOverviewVisual {...props} />
  if (props.subject === 'english') return <EnglishOverviewVisual {...props} />
  return <CurriculumPedagogyVisualV18 {...props} />
}
