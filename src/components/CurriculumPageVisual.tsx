import type { CurriculumSubjectId } from '../curriculum-plan'

type Props = {
  subject: CurriculumSubjectId
  pageKind: string
  title: string
  text: string
  unitTitle: string
}

type VisualKind =
  | 'question'
  | 'number-line' | 'coordinate' | 'equation' | 'ratio' | 'statistics' | 'math'
  | 'cell' | 'energy' | 'cycle' | 'dna' | 'ecosystem' | 'science'
  | 'map' | 'timeline' | 'community' | 'social-data' | 'social'
  | 'structure' | 'classical' | 'poetry' | 'chinese'
  | 'dialogue' | 'english-time' | 'sentence' | 'english'

function includesAny(text: string, keywords: string[]) {
  const normalized = text.toLowerCase()
  return keywords.some((keyword) => normalized.includes(keyword.toLowerCase()))
}

function chooseVisual(subject: CurriculumSubjectId, pageKind: string, seed: string): VisualKind {
  if (pageKind === 'question') return 'question'

  if (subject === 'math') {
    if (includesAny(seed, ['數線', '絕對值', '負數', '正負數'])) return 'number-line'
    if (includesAny(seed, ['坐標', '象限', '圖形', '平面直角'])) return 'coordinate'
    if (includesAny(seed, ['方程式', '等量', '移項', '不等式'])) return 'equation'
    if (includesAny(seed, ['比例', '比值', '正比', '反比'])) return 'ratio'
    if (includesAny(seed, ['統計', '資料', '平均', '中位', '眾數', '圖表'])) return 'statistics'
    return 'math'
  }

  if (subject === 'science') {
    if (includesAny(seed, ['細胞', '細胞核', '胞器'])) return 'cell'
    if (includesAny(seed, ['養分', '能量', '光合', '呼吸', '食物'])) return 'energy'
    if (includesAny(seed, ['運輸', '循環', '恆定', '協調'])) return 'cycle'
    if (includesAny(seed, ['遺傳', '基因', 'dna', '染色體'])) return 'dna'
    if (includesAny(seed, ['生態', '環境', '食物鏈', '族群', '分類'])) return 'ecosystem'
    return 'science'
  }

  if (subject === 'social') {
    if (includesAny(seed, ['歷史', '史料', '時代', '清', '日治', '戰後', '政權'])) return 'timeline'
    if (includesAny(seed, ['人口', '產業', '統計', '資料', '都市'])) return 'social-data'
    if (includesAny(seed, ['公民', '家庭', '社區', '社會', '文化', '規範', '權利'])) return 'community'
    if (includesAny(seed, ['地理', '位置', '地圖', '地形', '氣候', '區域', '海域'])) return 'map'
    return 'social'
  }

  if (subject === 'chinese') {
    if (includesAny(seed, ['文言', '古文', '實詞', '虛詞'])) return 'classical'
    if (includesAny(seed, ['詩', '意象', '修辭', '譬喻', '擬人'])) return 'poetry'
    if (includesAny(seed, ['段落', '篇章', '結構', '論說', '說明', '主旨', '寫作'])) return 'structure'
    return 'chinese'
  }

  if (includesAny(seed, ['過去', '現在', '未來', '時態', '進行式'])) return 'english-time'
  if (includesAny(seed, ['問句', '疑問', '對話', '招呼', 'who', 'what', 'where', 'when', 'how'])) return 'dialogue'
  if (includesAny(seed, ['句型', 'be', '動詞', '祈使', '情態', 'can', '句子'])) return 'sentence'
  return 'english'
}

function QuestionStrategy({ subject }: { subject: CurriculumSubjectId }) {
  const middle = subject === 'math' ? '找關係／列式' : subject === 'science' ? '找證據／變因' : subject === 'social' ? '找資料／立場' : subject === 'chinese' ? '找文本線索' : '找語境線索'
  return (
    <svg viewBox="0 0 320 240" aria-hidden="true">
      <rect className="visual-soft" x="28" y="35" width="76" height="76" rx="22" />
      <rect className="visual-soft" x="122" y="82" width="76" height="76" rx="22" />
      <rect className="visual-soft" x="216" y="129" width="76" height="76" rx="22" />
      <path className="visual-line" d="M103 75 C126 75 124 99 137 105" />
      <path className="visual-line" d="M197 124 C219 124 216 146 231 151" />
      <text className="visual-number" x="66" y="66">01</text>
      <text className="visual-label" x="66" y="88">讀條件</text>
      <text className="visual-number" x="160" y="113">02</text>
      <text className="visual-label" x="160" y="135">{middle}</text>
      <text className="visual-number" x="254" y="160">03</text>
      <text className="visual-label" x="254" y="182">再作答</text>
    </svg>
  )
}

function MathVisual({ kind }: { kind: VisualKind }) {
  if (kind === 'number-line') return (
    <svg viewBox="0 0 320 240" aria-hidden="true">
      <line className="visual-axis" x1="34" y1="128" x2="286" y2="128" />
      {[54, 96, 138, 180, 222, 264].map((x, i) => <g key={x}><line className="visual-tick" x1={x} y1="119" x2={x} y2="137"/><text className="visual-small" x={x} y="157">{i - 3}</text></g>)}
      <circle className="visual-accent-fill" cx="96" cy="128" r="10" />
      <path className="visual-line" d="M96 101 C116 77 145 71 160 72 C179 73 205 82 222 101" />
      <text className="visual-label" x="159" y="54">距離看絕對值</text>
      <text className="visual-small" x="96" y="184">位置先決定正負，再談距離</text>
    </svg>
  )
  if (kind === 'coordinate') return (
    <svg viewBox="0 0 320 240" aria-hidden="true">
      {[64, 96, 128, 160, 192, 224, 256].map((v) => <g key={v}><line className="visual-grid" x1={v} y1="34" x2={v} y2="210"/><line className="visual-grid" x1="40" y1={v - 16} x2="280" y2={v - 16}/></g>)}
      <line className="visual-axis" x1="40" y1="128" x2="280" y2="128"/><line className="visual-axis" x1="160" y1="34" x2="160" y2="210"/>
      <circle className="visual-accent-fill" cx="224" cy="80" r="8"/><text className="visual-label" x="245" y="73">(x, y)</text>
      <text className="visual-small" x="244" y="143">x</text><text className="visual-small" x="174" y="48">y</text>
    </svg>
  )
  if (kind === 'equation') return (
    <svg viewBox="0 0 320 240" aria-hidden="true">
      <line className="visual-axis" x1="160" y1="55" x2="160" y2="184"/><path className="visual-line" d="M88 90 L232 90 M106 90 L81 146 M214 90 L239 146"/>
      <rect className="visual-soft" x="48" y="146" width="70" height="34" rx="10"/><rect className="visual-soft" x="202" y="146" width="70" height="34" rx="10"/>
      <text className="visual-label" x="83" y="168">左邊</text><text className="visual-label" x="237" y="168">右邊</text>
      <text className="visual-small" x="160" y="215">做同一件事，等量關係才保持</text>
    </svg>
  )
  if (kind === 'ratio') return (
    <svg viewBox="0 0 320 240" aria-hidden="true">
      <text className="visual-label" x="54" y="55">A</text><rect className="visual-accent-soft" x="78" y="38" width="154" height="26" rx="9"/>
      <text className="visual-label" x="54" y="106">B</text><rect className="visual-accent-soft" x="78" y="89" width="77" height="26" rx="9"/>
      <path className="visual-line" d="M80 148 H232"/><text className="visual-label" x="156" y="175">同倍放大／縮小</text>
      <text className="visual-small" x="156" y="204">比較的是兩個量之間的關係</text>
    </svg>
  )
  if (kind === 'statistics') return (
    <svg viewBox="0 0 320 240" aria-hidden="true">
      <line className="visual-axis" x1="50" y1="190" x2="278" y2="190"/><line className="visual-axis" x1="50" y1="42" x2="50" y2="190"/>
      {[62, 108, 154, 200, 246].map((x, i) => <rect key={x} className={i === 3 ? 'visual-accent-fill' : 'visual-soft'} x={x} y={165 - i * 20} width="26" height={25 + i * 20} rx="7" />)}
      <path className="visual-line" d="M62 105 C103 84 147 105 188 77 C220 56 244 64 272 48"/>
      <text className="visual-small" x="160" y="218">先讀尺度，再比較分布與趨勢</text>
    </svg>
  )
  return (
    <svg viewBox="0 0 320 240" aria-hidden="true">
      <circle className="visual-soft" cx="82" cy="84" r="42"/><rect className="visual-soft" x="142" y="44" width="94" height="72" rx="20"/><path className="visual-line" d="M52 174 H268 M80 151 L118 174 L160 137 L207 174 L246 149"/>
      <text className="visual-label" x="82" y="89">數</text><text className="visual-label" x="189" y="84">式與圖</text><text className="visual-small" x="160" y="211">數量 → 關係 → 表示 → 驗證</text>
    </svg>
  )
}

function ScienceVisual({ kind }: { kind: VisualKind }) {
  if (kind === 'cell') return (
    <svg viewBox="0 0 320 240" aria-hidden="true">
      <ellipse className="visual-soft" cx="157" cy="120" rx="98" ry="73"/><ellipse className="visual-accent-soft" cx="158" cy="118" rx="36" ry="29"/>
      <circle className="visual-accent-fill" cx="158" cy="118" r="9"/><circle className="visual-dot" cx="101" cy="91" r="10"/><circle className="visual-dot" cx="214" cy="144" r="11"/>
      <line className="visual-line" x1="194" y1="88" x2="245" y2="62"/><text className="visual-small" x="258" y="59">細胞膜</text>
      <line className="visual-line" x1="180" y1="118" x2="251" y2="118"/><text className="visual-small" x="267" y="122">細胞核</text>
    </svg>
  )
  if (kind === 'energy') return (
    <svg viewBox="0 0 320 240" aria-hidden="true">
      <circle className="visual-accent-soft" cx="60" cy="74" r="28"/><text className="visual-label" x="60" y="80">光</text>
      <path className="visual-line" d="M94 76 H137"/><path className="visual-line" d="M134 69 L145 76 L134 83"/>
      <rect className="visual-soft" x="146" y="48" width="76" height="56" rx="18"/><text className="visual-label" x="184" y="80">生產者</text>
      <path className="visual-line" d="M184 109 V151"/><path className="visual-line" d="M177 148 L184 159 L191 148"/>
      <rect className="visual-soft" x="129" y="160" width="110" height="42" rx="14"/><text className="visual-label" x="184" y="186">養分與能量</text>
    </svg>
  )
  if (kind === 'cycle') return (
    <svg viewBox="0 0 320 240" aria-hidden="true">
      <circle className="visual-soft" cx="160" cy="120" r="68"/><path className="visual-line" d="M160 45 C220 45 250 85 241 124"/><path className="visual-line" d="M240 121 L233 109 M240 121 L252 112"/>
      <path className="visual-line" d="M238 140 C220 194 158 211 112 181"/><path className="visual-line" d="M113 181 L126 181 M113 181 L117 168"/>
      <path className="visual-line" d="M95 166 C61 124 77 73 121 52"/><path className="visual-line" d="M121 52 L115 64 M121 52 L108 48"/>
      <text className="visual-label" x="160" y="114">輸入</text><text className="visual-label" x="160" y="139">調節</text><text className="visual-small" x="160" y="222">生命系統靠運輸與回饋維持穩定</text>
    </svg>
  )
  if (kind === 'dna') return (
    <svg viewBox="0 0 320 240" aria-hidden="true">
      <path className="visual-line" d="M102 38 C211 75 108 159 218 204"/><path className="visual-line" d="M218 38 C109 75 212 159 102 204"/>
      {[64, 88, 112, 136, 160, 184].map((y, i) => <line key={y} className="visual-grid-strong" x1={i % 2 ? 124 : 112} y1={y} x2={i % 2 ? 196 : 208} y2={y} />)}
      <text className="visual-label" x="160" y="225">遺傳資訊的組合與傳遞</text>
    </svg>
  )
  if (kind === 'ecosystem') return (
    <svg viewBox="0 0 320 240" aria-hidden="true">
      <circle className="visual-soft" cx="72" cy="118" r="30"/><circle className="visual-soft" cx="160" cy="66" r="30"/><circle className="visual-soft" cx="246" cy="121" r="30"/><circle className="visual-soft" cx="160" cy="178" r="30"/>
      <path className="visual-line" d="M100 107 L131 84 M189 83 L216 106 M222 143 L189 165 M131 164 L99 139"/>
      <text className="visual-label" x="72" y="123">環境</text><text className="visual-label" x="160" y="71">生產</text><text className="visual-label" x="246" y="126">消費</text><text className="visual-label" x="160" y="183">分解</text>
    </svg>
  )
  return (
    <svg viewBox="0 0 320 240" aria-hidden="true">
      <path className="visual-line" d="M66 176 C90 121 110 92 145 62 C178 89 201 126 229 176"/><circle className="visual-accent-soft" cx="146" cy="63" r="20"/>
      <rect className="visual-soft" x="55" y="176" width="184" height="20" rx="10"/><text className="visual-label" x="146" y="68">觀察</text><text className="visual-small" x="147" y="222">提問 → 證據 → 解釋 → 再驗證</text>
    </svg>
  )
}

function SocialVisual({ kind }: { kind: VisualKind }) {
  if (kind === 'timeline') return (
    <svg viewBox="0 0 320 240" aria-hidden="true">
      <line className="visual-axis" x1="42" y1="124" x2="278" y2="124"/>
      {[72, 126, 182, 244].map((x, i) => <g key={x}><circle className={i === 2 ? 'visual-accent-fill' : 'visual-soft-fill'} cx={x} cy="124" r="10"/><line className="visual-grid-strong" x1={x} y1="93" x2={x} y2="113"/><text className="visual-small" x={x} y={i % 2 ? 166 : 77}>階段 {i + 1}</text></g>)}
      <text className="visual-label" x="160" y="207">先排時序，再找延續、轉折與因果</text>
    </svg>
  )
  if (kind === 'community') return (
    <svg viewBox="0 0 320 240" aria-hidden="true">
      <circle className="visual-accent-soft" cx="160" cy="120" r="37"/><text className="visual-label" x="160" y="125">公共生活</text>
      {[[70,68,'家庭'],[252,68,'學校'],[69,180,'社區'],[252,180,'制度']].map(([x,y,label]) => <g key={String(label)}><circle className="visual-soft" cx={Number(x)} cy={Number(y)} r="30"/><text className="visual-label" x={Number(x)} y={Number(y)+5}>{label}</text><line className="visual-line" x1={Number(x)+(Number(x)<160?27:-27)} y1={Number(y)+(Number(y)<120?18:-18)} x2={160+(Number(x)<160?-28:28)} y2={120+(Number(y)<120?-18:18)}/></g>)}
    </svg>
  )
  if (kind === 'social-data') return (
    <svg viewBox="0 0 320 240" aria-hidden="true">
      <rect className="visual-soft" x="38" y="38" width="112" height="164" rx="18"/><rect className="visual-soft" x="168" y="38" width="112" height="164" rx="18"/>
      {[72,108,144].map((y,i)=><rect key={y} className={i===1?'visual-accent-fill':'visual-grid-fill'} x="58" y={y} width={52+i*18} height="14" rx="7"/>)}
      <path className="visual-line" d="M190 168 L210 132 L228 146 L255 88"/><circle className="visual-accent-fill" cx="255" cy="88" r="6"/>
      <text className="visual-small" x="94" y="188">比較量</text><text className="visual-small" x="224" y="188">看趨勢</text>
    </svg>
  )
  if (kind === 'map') return (
    <svg viewBox="0 0 320 240" aria-hidden="true">
      <rect className="visual-soft" x="42" y="32" width="236" height="176" rx="24"/>
      {[82,122,162,202,242].map((x)=><line key={x} className="visual-grid" x1={x} y1="48" x2={x} y2="192"/>)}
      {[72,112,152,192].map((y)=><line key={y} className="visual-grid" x1="58" y1={y} x2="262" y2={y}/>)}
      <path className="visual-accent-path" d="M170 56 C148 75 145 96 153 112 C165 137 149 160 139 183 C166 171 180 153 184 131 C189 103 178 80 170 56 Z"/>
      <circle className="visual-accent-fill" cx="183" cy="110" r="6"/><text className="visual-small" x="221" y="215">方向 · 圖例 · 尺度</text>
    </svg>
  )
  return (
    <svg viewBox="0 0 320 240" aria-hidden="true">
      <rect className="visual-soft" x="42" y="44" width="72" height="60" rx="16"/><rect className="visual-soft" x="124" y="92" width="72" height="60" rx="16"/><rect className="visual-soft" x="206" y="140" width="72" height="60" rx="16"/>
      <path className="visual-line" d="M111 87 L130 101 M193 137 L212 150"/>
      <text className="visual-label" x="78" y="79">資料</text><text className="visual-label" x="160" y="127">關係</text><text className="visual-label" x="242" y="175">判斷</text>
    </svg>
  )
}

function ChineseVisual({ kind }: { kind: VisualKind }) {
  if (kind === 'classical') return (
    <svg viewBox="0 0 320 240" aria-hidden="true">
      <rect className="visual-soft" x="45" y="42" width="230" height="154" rx="20"/>
      <text className="visual-classical" x="84" y="82">字</text><text className="visual-classical" x="134" y="82">→</text><text className="visual-classical" x="185" y="82">句</text><text className="visual-classical" x="236" y="82">→</text>
      <text className="visual-small" x="92" y="121">語境詞義</text><text className="visual-small" x="210" y="121">句法</text>
      <line className="visual-line" x1="80" y1="144" x2="240" y2="144"/><text className="visual-label" x="160" y="174">再回到篇意</text>
    </svg>
  )
  if (kind === 'poetry') return (
    <svg viewBox="0 0 320 240" aria-hidden="true">
      <circle className="visual-soft" cx="85" cy="88" r="36"/><circle className="visual-soft" cx="235" cy="88" r="36"/><circle className="visual-accent-soft" cx="160" cy="165" r="42"/>
      <path className="visual-line" d="M113 111 L139 143 M207 111 L181 143"/>
      <text className="visual-label" x="85" y="93">景物</text><text className="visual-label" x="235" y="93">語氣</text><text className="visual-label" x="160" y="170">情感／意象</text>
    </svg>
  )
  if (kind === 'structure') return (
    <svg viewBox="0 0 320 240" aria-hidden="true">
      <rect className="visual-accent-soft" x="58" y="39" width="204" height="42" rx="13"/><text className="visual-label" x="160" y="65">主旨／觀點</text>
      <path className="visual-line" d="M160 82 V105 M160 105 H96 V125 M160 105 H224 V125"/>
      <rect className="visual-soft" x="48" y="126" width="96" height="48" rx="14"/><rect className="visual-soft" x="176" y="126" width="96" height="48" rx="14"/>
      <text className="visual-label" x="96" y="155">段落 A</text><text className="visual-label" x="224" y="155">段落 B</text><text className="visual-small" x="160" y="211">找功能，比只抓一句關鍵字更可靠</text>
    </svg>
  )
  return (
    <svg viewBox="0 0 320 240" aria-hidden="true">
      <rect className="visual-soft" x="52" y="34" width="216" height="172" rx="22"/>
      {[68,96,124,152].map((y,i)=><rect key={y} className={i===1?'visual-accent-soft':'visual-grid-fill'} x="76" y={y} width={i===3?112:164} height="14" rx="7"/>)}
      <circle className="visual-accent-fill" cx="231" cy="161" r="18"/><path className="visual-white-line" d="M224 161 L230 167 L240 153"/>
      <text className="visual-small" x="160" y="227">字詞 → 句子 → 段落 → 篇章</text>
    </svg>
  )
}

function EnglishVisual({ kind }: { kind: VisualKind }) {
  if (kind === 'dialogue') return (
    <svg viewBox="0 0 320 240" aria-hidden="true">
      <path className="visual-soft-path" d="M42 48 H176 Q192 48 192 64 V106 Q192 122 176 122 H96 L72 145 L76 122 H42 Q26 122 26 106 V64 Q26 48 42 48 Z"/>
      <path className="visual-accent-soft-path" d="M153 116 H278 Q294 116 294 132 V170 Q294 186 278 186 H236 L253 207 L221 186 H153 Q137 186 137 170 V132 Q137 116 153 116 Z"/>
      <text className="visual-label" x="109" y="78">What / Where / How...?</text><text className="visual-label" x="216" y="150">Complete answer</text><text className="visual-small" x="109" y="100">問什麼，回答就對應什麼</text>
    </svg>
  )
  if (kind === 'english-time') return (
    <svg viewBox="0 0 320 240" aria-hidden="true">
      <line className="visual-axis" x1="42" y1="128" x2="278" y2="128"/>
      <circle className="visual-soft-fill" cx="85" cy="128" r="10"/><circle className="visual-accent-fill" cx="160" cy="128" r="12"/><circle className="visual-soft-fill" cx="237" cy="128" r="10"/>
      <text className="visual-label" x="85" y="96">Past</text><text className="visual-label" x="160" y="96">Now</text><text className="visual-label" x="237" y="96">Future</text>
      <text className="visual-small" x="160" y="176">先找時間線索，再選動詞形式</text>
    </svg>
  )
  if (kind === 'sentence') return (
    <svg viewBox="0 0 320 240" aria-hidden="true">
      <rect className="visual-soft" x="38" y="82" width="72" height="58" rx="17"/><rect className="visual-accent-soft" x="124" y="82" width="72" height="58" rx="17"/><rect className="visual-soft" x="210" y="82" width="72" height="58" rx="17"/>
      <text className="visual-label" x="74" y="116">Subject</text><text className="visual-label" x="160" y="116">Verb</text><text className="visual-label" x="246" y="116">Info</text>
      <path className="visual-line" d="M110 111 H124 M196 111 H210"/><text className="visual-small" x="160" y="178">先看意思，再確認句子骨架</text>
    </svg>
  )
  return (
    <svg viewBox="0 0 320 240" aria-hidden="true">
      <circle className="visual-soft" cx="86" cy="82" r="38"/><rect className="visual-soft" x="145" y="44" width="112" height="76" rx="21"/><rect className="visual-accent-soft" x="92" y="150" width="142" height="42" rx="14"/>
      <text className="visual-label" x="86" y="87">Words</text><text className="visual-label" x="201" y="85">Context</text><text className="visual-label" x="163" y="176">Meaning → Use</text>
    </svg>
  )
}

function visualLabel(subject: CurriculumSubjectId, kind: VisualKind) {
  if (kind === 'question') return '讀題輔助：先找條件與關係，不顯示答案。'
  if (subject === 'math') return '數學圖解：把抽象關係轉成數線、圖形、等量或資料表示。'
  if (subject === 'science') return '自然圖解：用結構、流程與系統關係協助理解現象。'
  if (subject === 'social') return '社會圖解：用地圖、時間軸、資料或群體關係整理資訊。'
  if (subject === 'chinese') return '國文圖解：把字句、篇章結構與意象關係視覺化。'
  return '英文圖解：把語境、句型、對話與時間關係視覺化。'
}

export function CurriculumPageVisual({ subject, pageKind, title, text, unitTitle }: Props) {
  const seed = `${unitTitle} ${title} ${text}`
  const kind = chooseVisual(subject, pageKind, seed)
  const label = visualLabel(subject, kind)

  return (
    <figure className={`curriculum-page-visual subject-${subject} visual-${kind}`} role="img" aria-label={label}>
      <div className="curriculum-page-visual-head"><span>VISUAL AID</span><strong>{title}</strong></div>
      <div className="curriculum-page-visual-canvas">
        {kind === 'question' ? <QuestionStrategy subject={subject} /> : null}
        {subject === 'math' && kind !== 'question' ? <MathVisual kind={kind} /> : null}
        {subject === 'science' && kind !== 'question' ? <ScienceVisual kind={kind} /> : null}
        {subject === 'social' && kind !== 'question' ? <SocialVisual kind={kind} /> : null}
        {subject === 'chinese' && kind !== 'question' ? <ChineseVisual kind={kind} /> : null}
        {subject === 'english' && kind !== 'question' ? <EnglishVisual kind={kind} /> : null}
      </div>
      <figcaption>{label}</figcaption>
    </figure>
  )
}
