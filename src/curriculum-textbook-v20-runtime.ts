import { getTextbookUnitContentV18 } from './curriculum-pedagogy-v18'
import { resolveCurriculumUnit } from './curriculum-plan-v5'
import type {
  ReviewedChoiceQuestion,
  ReviewedConcept,
  ReviewedQuestion,
  ReviewedResponseQuestion,
  ReviewedWorkedExample,
} from './curriculum-reviewed-social10'
import type { TextbookUnitContentV14, TextbookVisual } from './curriculum-textbook-v14'

type UnitContext = NonNullable<ReturnType<typeof resolveCurriculumUnit>>
type ExtendedQuestion = ReviewedQuestion & { audioText?: string; mediaAssetId?: string; optionFeedback?: string[]; rubric?: string[] }

type Task = {
  context: string
  prompt: string
  options: string[]
  correctIndex: number
  explanation: string
  family: string
  fallback?: boolean
}

const SUBJECT_CLOSURES = [
  /重點是回到完整語境[^。]*。?/g,
  /Connect meaning, form, word order, time clues, reference, and register[^.]*\.?/gi,
  /重點是把條件轉成可檢查的數學表示[^。]*。?/g,
  /重點是把觀察、模型與推論分開[^。]*。?/g,
  /重點是連同來源、時間、空間尺度與不同群體觀點判讀資料[^。]*。?/g,
]
const GENERIC_MISCONCEPTION = /只要記住「.*?」的最後結論，就不需要重新檢查題目條件、文本或證據/

function normalize(value: unknown) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function stableHash(value: string) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash >>> 0)
}

function n(seed: string, min: number, span: number) {
  return min + stableHash(seed) % Math.max(1, span)
}

function options(correct: string, distractors: string[]) {
  const all = [correct, ...distractors].map(normalize).filter(Boolean)
  const result: string[] = []
  for (const item of all) if (!result.includes(item)) result.push(item)
  for (const item of ['無法由題目推出', '與題目條件相反', '混用了另一個概念', '忽略關鍵條件']) {
    if (result.length >= 4) break
    if (!result.includes(item)) result.push(item)
  }
  return result.slice(0, 4)
}

function makeTask(context: string, prompt: string, correct: string, distractors: string[], explanation: string, family: string, fallback = false): Task {
  const list = options(correct, distractors)
  return { context, prompt, options: list, correctIndex: list.indexOf(correct), explanation, family, fallback }
}

function topic(context: UnitContext, concept: ReviewedConcept) {
  return `${context.unit.title} ${context.unit.focus} ${concept.title}`
}

function stripBoilerplate(value: string) {
  let result = normalize(value)
  for (const pattern of SUBJECT_CLOSURES) result = result.replace(pattern, '').trim()
  return result
}

function mathTask(context: UnitContext, concept: ReviewedConcept, index: number): Task {
  const text = topic(context, concept)
  const seed = `${context.unit.id}:${concept.title}:${index}`

  if (/100\s*以內|百以內/.test(text)) {
    const a = n(seed, 45, 45)
    const b = n(`${seed}:b`, 4, a - 3)
    return makeTask(`數量都限制在 100 以內：原有 ${a} 個，拿走 ${b} 個。`, `${a} - ${b} = ?`, String(a - b), [String(a + b), String(b), String(a - b + 10)], `${a}-${b}=${a-b}，且所有數值都符合 100 以內的單元範圍。`, 'within-100')
  }
  if (/10000\s*以內|四位數|大數|概數|位值|個位|十位|百位|千位/.test(text)) {
    const thousands = n(seed, 1, 8), hundreds = n(`${seed}:h`, 1, 9), tens = n(`${seed}:t`, 1, 9), ones = n(`${seed}:o`, 1, 9)
    const value = thousands*1000 + hundreds*100 + tens*10 + ones
    return makeTask(`一個數由 ${thousands} 個千、${hundreds} 個百、${tens} 個十與 ${ones} 個一組成。`, '這個數是多少？', String(value), [String(value+1000), String(thousands*100+hundreds*10+tens), String(value-100)], `${thousands}×1000+${hundreds}×100+${tens}×10+${ones}=${value}。`, 'place-value')
  }
  if (/加法|減法|加減|四則|計算與應用/.test(text)) {
    const a = n(seed, 24, 70), b = n(`${seed}:b`, 7, 35)
    return makeTask(`班上要整理 ${a} 份資料，已完成 ${b} 份。`, '還剩多少份？', String(a-b), [String(a+b), String(b), String(a-b+1)], `剩餘量用減法：${a}-${b}=${a-b}。`, 'add-subtract')
  }
  if (/乘法|除法|九九|等分/.test(text)) {
    const groups = n(seed, 3, 7), per = n(`${seed}:p`, 2, 8), total = groups*per
    return makeTask(`有 ${groups} 組，每組 ${per} 個。`, '總共有多少個？', String(total), [String(groups+per), String(total-groups), String(per)], `${groups} 組相同數量可用 ${groups}×${per}=${total}。`, 'multiply-divide')
  }
  if (/長度|容量|重量|測量|公分|公尺|公斤|公升/.test(text)) {
    const a = n(seed, 20, 60), b = n(`${seed}:b`, 5, 20)
    return makeTask(`甲物長 ${a} 公分，乙物比甲物短 ${b} 公分。`, '乙物長多少公分？', String(a-b), [String(a+b), String(b), String(a)], `${a}-${b}=${a-b} 公分；比較時單位要一致。`, 'measurement')
  }
  if (/時間|日曆|時分秒|經過時間/.test(text)) {
    const start = n(seed, 7, 7), duration = n(`${seed}:d`, 1, 5)
    return makeTask(`活動在 ${start}:00 開始，持續 ${duration} 小時。`, '活動幾點結束？', `${start+duration}:00`, [`${start-duration}:00`, `${duration}:00`, `${start+duration+1}:00`], `從 ${start}:00 往後推 ${duration} 小時，得到 ${start+duration}:00。`, 'time')
  }
  if (/分類|規律|模式/.test(text)) {
    const correct = '紅、藍、紅、藍'
    return makeTask('圖卡依「紅、藍、紅、藍、紅、藍……」重複排列。', '接下來四張應如何排列？', correct, ['紅、紅、藍、藍','藍、藍、紅、紅','紅、藍、藍、紅'], '規律每兩項重複一次，所以延續紅、藍、紅、藍。', 'pattern')
  }
  if (/因數|倍數|最大公因|最小公倍|質數|質因數/.test(text)) {
    const base = n(seed, 2, 7), a = base*4, b = base*6
    const correct = String(base*2)
    return makeTask(`兩個數是 ${a} 與 ${b}。`, '兩數的最大公因數是多少？', correct, [String(base), String(a+b), String(a*b)], `${a} 與 ${b} 的共同因數中最大的是 ${correct}。`, 'factor-multiple')
  }
  if (/分數|小數|百分|比率|比例|比值/.test(text)) {
    const denominator = [4,5,8,10][n(seed,0,4)], numerator = n(`${seed}:n`,1,denominator-1), pct = numerator/denominator*100
    return makeTask(`共 ${denominator} 份，其中 ${numerator} 份符合條件。`, `${numerator}/${denominator} 換成百分率是多少？`, `${pct}%`, [`${numerator*10}%`,`${denominator*10}%`,`${Math.round(pct/10)}%`], `${numerator}÷${denominator}×100%=${pct}%。`, 'fraction-percent')
  }
  if (/正數|負數|整數|數線|相反數|絕對值/.test(text)) {
    const start = -n(seed,2,8), rise = n(`${seed}:r`,3,10), result = start+rise
    return makeTask(`氣溫原為 ${start}°C，之後上升 ${rise}°C。`, '最後氣溫是多少？', String(result), [String(start-rise),String(Math.abs(result)),String(-result)], `${start}+${rise}=${result}；上升在數線上向右。`, 'signed-number')
  }
  if (/科學記號|指數律|指數|次方|冪/.test(text)) {
    const c = n(seed,2,7), e = n(`${seed}:e`,3,5), value = c*10**e
    return makeTask(`把 ${value.toLocaleString('en-US')} 表示成 a×10^n，1≤a<10。`, '正確的科學記號是？', `${c} × 10^${e}`, [`${c} × 10^${e-1}`,`${c*10} × 10^${e}`,`${c}.0 × 10^${e+1}`], `小數點移 ${e} 位得到係數 ${c}，所以是 ${c}×10^${e}。`, 'scientific-notation')
  }
  if (/二次方程|一元二次/.test(text)) {
    const r1=n(seed,1,5), r2=n(`${seed}:r2`,r1+1,5), sum=r1+r2, prod=r1*r2
    return makeTask(`x²-${sum}x+${prod}=0。`, '方程式的解為何？', `x = ${r1} 或 x = ${r2}`, [`x = ${sum}`,`x = ${prod}`,`x = -${r1} 或 x = -${r2}`], `因式分解為 (x-${r1})(x-${r2})=0。`, 'quadratic')
  }
  if (/二次函數|拋物線|頂點|開口/.test(text)) {
    const h=n(seed,-3,7), k=n(`${seed}:k`,-4,9)
    return makeTask(`函數 y=(x-${h})²+${k}。`, '拋物線頂點為何？', `(${h}, ${k})`, [`(0, ${k})`,`(${k}, ${h})`,`(-${h}, ${k})`], `頂點式 y=(x-h)²+k 的頂點是 (h,k)，所以為 (${h},${k})。`, 'quadratic-function')
  }
  if (/乘法公式|多項式|展開|因式分解/.test(text)) {
    const a=n(seed,2,6), b=n(`${seed}:b`,1,5)
    return makeTask(`展開 (x+${a})(x+${b})。`, '正確結果為何？', `x² + ${a+b}x + ${a*b}`, [`x² + ${a*b}x + ${a+b}`,`x² + ${a+b}x - ${a*b}`,`2x + ${a+b}`], `分配律得到 x²+${b}x+${a}x+${a*b}。`, 'polynomial')
  }
  if (/一次方程|方程|未知數|代數|式子|數量關係|線性關係/.test(text)) {
    const x=n(seed,2,8), a=n(`${seed}:a`,2,6), b=n(`${seed}:b`,1,9), total=a*x+b
    return makeTask(`${a}x+${b}=${total}。`, 'x 的值是多少？', String(x), [String(total/a),String(x+b),String(a)], `先減 ${b} 再除 ${a}，得到 x=${x}。`, 'linear')
  }
  if (/三角比|三角函數|sin|cos|tan/.test(text)) {
    const triples=[[3,4,5],[5,12,13],[8,15,17]], [opp,adj,hyp]=triples[n(seed,0,triples.length)]
    return makeTask(`一直角三角形對角 θ 的對邊 ${opp}、鄰邊 ${adj}、斜邊 ${hyp}。`, 'sin θ 等於多少？', `${opp}/${hyp}`, [`${adj}/${hyp}`,`${opp}/${adj}`,`${hyp}/${opp}`], 'sin θ=對邊/斜邊。', 'trigonometry')
  }
  if (/極限|微分|導數|變化率/.test(text)) {
    const a=n(seed,2,5), x=n(`${seed}:x`,1,4)
    return makeTask(`f(x)=${a}x²，求 x=${x} 的瞬時變化率。`, `f′(${x}) 是多少？`, String(2*a*x), [String(a*x),String(a*x*x),String(2*a)], `f′(x)=${2*a}x，代入得到 ${2*a*x}。`, 'derivative')
  }
  if (/矩陣/.test(text)) {
    const a=n(seed,1,5), b=n(`${seed}:b`,1,5), c=n(`${seed}:c`,1,5), d=n(`${seed}:d`,1,5)
    return makeTask(`矩陣 A=[[${a},${b}],[${c},${d}]]。`, 'A 的跡（主對角線元素和）是多少？', String(a+d), [String(a+b),String(c+d),String(a*b)], `主對角線是 ${a} 與 ${d}，相加為 ${a+d}。`, 'matrix')
  }
  if (/函數與圖形|函數表示|圖形特徵/.test(text)) {
    const m=n(seed,2,5), x=n(`${seed}:x`,1,5), b=n(`${seed}:b`,1,7)
    return makeTask(`函數 f(x)=${m}x+${b}。`, `f(${x}) 是多少？`, String(m*x+b), [String(m+x+b),String(m*x),String(x+b)], `代入 x=${x}：${m}×${x}+${b}=${m*x+b}。`, 'function')
  }
  if (/數列|等差|等比/.test(text)) {
    const first=n(seed,2,7), diff=n(`${seed}:d`,2,5), term=n(`${seed}:t`,5,4), value=first+(term-1)*diff
    return makeTask(`等差數列首項 ${first}、公差 ${diff}。`, `第 ${term} 項是多少？`, String(value), [String(first+term*diff),String(first*diff),String(term*diff)], `a_${term}=${first}+(${term}-1)×${diff}=${value}。`, 'sequence')
  }
  if (/機率/.test(text)) {
    const red=n(seed,2,5), blue=n(`${seed}:b`,2,6), total=red+blue
    return makeTask(`袋中 ${red} 顆紅球、${blue} 顆藍球，等可能抽 1 顆。`, '抽到紅球的機率？', `${red}/${total}`, [`${blue}/${total}`,`${red}/${blue}`,`1/${total}`], `有利結果 ${red}、全部 ${total}，機率 ${red}/${total}。`, 'probability')
  }
  if (/平均|中位|眾數|統計|資料|四分位/.test(text)) {
    const base=n(seed,4,8), data=[base,base+2,base+3,base+6,base+9]
    return makeTask(`已排序資料：${data.join('、')}。`, '中位數是多少？', String(data[2]), [String(data[0]),String(data[4]),String(data.reduce((a,b)=>a+b,0))], '5 筆排序資料的正中央第 3 筆即中位數。', 'statistics')
  }
  if (/圓|角|三角形|四邊形|幾何|面積|周長|體積|座標|形狀/.test(text)) {
    const w=n(seed,4,8), h=n(`${seed}:h`,3,7)
    return makeTask(`長方形長 ${w} 公分、寬 ${h} 公分。`, '面積是多少平方公分？', String(w*h), [String(2*(w+h)),String(w+h),String(w*h*2)], `${w}×${h}=${w*h} 平方公分。`, 'geometry')
  }

  const a=n(seed,12,40), b=n(`${seed}:b`,3,Math.max(4,a-3))
  return makeTask(`「${concept.title}」目前以 ${a} 與 ${b} 兩個量做第一輪可計算練習。`, `${a}-${b}=?`, String(a-b), [String(a+b),String(b),String(a)], `${a}-${b}=${a-b}。V20 第一輪保底題：此單元仍需人工改成真正專屬題型。`, 'math-fallback', true)
}

function englishTask(context: UnitContext, concept: ReviewedConcept, index: number): Task {
  const text=topic(context,concept).toLowerCase(), seed=`${context.unit.id}:${concept.title}:${index}`
  const name=['Amy','Ben','Cindy','David','Ella','Frank'][n(seed,0,6)]
  if (/be動詞|be 動詞|基本句型/.test(text)) {
    const subject=n(seed,0,2)?'They':name, correct=subject==='They'?'are':'is'
    return makeTask(`${subject} ___ ready for class now.`, `Choose the correct form of be for “${subject}”.`, correct, ['am',correct==='are'?'is':'are','beed'], `Use “${correct}” with “${subject}”.`, 'be')
  }
  if (/現在簡單|日常作息|習慣|頻率|simple present/.test(text)) {
    return makeTask(`${name} usually walks to school at 7:30 on weekdays.`, 'Which sentence correctly describes the habit?', `${name} usually walks to school.`, [`${name} is usually walk to school.`,`${name} usually walked tomorrow.`,`${name} walk usually to school.`], 'A repeated habit uses the simple present; a singular third-person subject takes -s.', 'simple-present')
  }
  if (/現在進行|present continuous|進行式/.test(text)) return makeTask(`Right now, ${name} has a book open.`, 'Which sentence describes the action happening now?', `${name} is reading.`, [`${name} reads yesterday.`,`${name} reading is.`,`${name} was read now.`], 'Use be + V-ing for an action in progress now.', 'continuous')
  if (/過去|past/.test(text)) return makeTask(`Yesterday, ${name} went to a museum.`, 'Which sentence correctly reports the event?', `${name} visited the museum yesterday.`, [`${name} visits the museum yesterday.`,`${name} will visited yesterday.`,`${name} visiting yesterday.`], '“Yesterday” signals a completed past event.', 'past')
  if (/未來|future|will|going to/.test(text)) return makeTask(`${name} has made a plan for tonight.`, 'Which sentence expresses the future plan?', `${name} is going to study tonight.`, [`${name} studied tonight tomorrow.`,`${name} going study tonight.`,`${name} studies yesterday tonight.`], 'Be going to + base verb can express a plan.', 'future')
  if (/比較|comparative|最高級|superlative/.test(text)) return makeTask('Bag A is 4 kg; Bag B is 7 kg.', 'Which comparison is correct?', 'Bag B is heavier than Bag A.', ['Bag B is heavy than Bag A.','Bag A is more heavy Bag B.','Bag B heavier Bag A is.'], 'Use the comparative “heavier than.”', 'comparison')
  if (/情態|can|能力|建議|should|must|命令句/.test(text)) return makeTask(`${name} wants to ask politely for permission to use a pencil.`, 'Which sentence is appropriate?', 'Can I use your pencil, please?', ['I can your pencil use.','Must I used your pencil yesterday?','Your pencil can I using.'], 'Can I…? is a common permission request; modal + base verb.', 'modal')
  if (/不定詞|動名詞|gerund|infinitive/.test(text)) return makeTask(`${name} enjoys ___ books after school.`, 'Choose the form that completes the sentence.', 'reading', ['to readed','read to','reads'], 'Enjoy is commonly followed by a gerund: enjoy reading.', 'gerund')
  if (/被動|passive/.test(text)) return makeTask('A ball hit the window; the focus is the window.', 'Which passive sentence is correct?', 'The window was broken by the ball.', ['The window broke by the ball.','The ball was broke the window.','The window was break.'], 'Past passive uses was/were + past participle.', 'passive')
  if (/完成式|present perfect|perfect/.test(text)) return makeTask(`${name}'s homework is complete now.`, 'Which sentence correctly uses present perfect?', `${name} has finished the homework.`, [`${name} have finish the homework.`,`${name} has finish the homework.`,`${name} finished has the homework.`], 'Singular subject + has + past participle.', 'perfect')
  if (/關係|relative|who|which|that/.test(text)) return makeTask('Combine: “The student won the race.” “The student is my friend.”', 'Which sentence is correct?', 'The student who won the race is my friend.', ['The student which won the race is my friend.','The student who win the race my friend.','Who the student won is my friend.'], 'Use who for a person as the subject of a relative clause.', 'relative')
  if (/條件句|conditional|if/.test(text)) return makeTask('Tomorrow’s plan depends on the weather.', 'Which first conditional is correct?', 'If it rains, we will stay inside.', ['If it will rain, we stayed inside.','If it rains, we stayed yesterday.','If rains it, we will inside stay.'], 'A common first conditional uses if + present, will + base verb.', 'conditional')
  if (/字母|拼讀|字母音|phonics/.test(text)) return makeTask('The word “map” begins with the letter m.', 'Which beginning sound matches “map”?', '/m/', ['/s/','/t/','/f/'], 'The letter m commonly represents /m/ in this word.', 'phonics')
  if (/數字|時間|日期|星期/.test(text)) return makeTask('The clock shows 7:30.', 'Which English phrase matches the time?', 'seven thirty', ['thirty seven','seven thirteen','half seven hours'], '7:30 is read “seven thirty” in a basic digital-time reading task.', 'time-vocab')
  if (/地點|方向|旅行|交通/.test(text)) return makeTask('The library is next to the bank.', 'Where is the library?', 'It is next to the bank.', ['It is yesterday.','It is seven kilograms.','It is more happy.'], 'The answer uses the location phrase “next to.”', 'location')
  if (/閱讀|主旨|細節|推論|段落|長文|論述|學術閱讀/.test(text)) return makeTask(`Passage: “Mina joined the school garden project because she wanted to learn how food grows. After three months, she could explain why sunlight and regular watering mattered.”`, 'What is the main idea?', 'Mina learned about growing food through a school garden project.', ['Mina never worked in a garden.','The passage is mainly about buying food.','Sunlight was not relevant to the project.'], 'The main idea must cover both the project and what Mina learned.', 'reading')
  if (/寫作|段落寫作|議論寫作|英文寫作/.test(text)) return makeTask('A paragraph claims that the school should add more shaded seating.', 'Which sentence best supports the claim?', 'Students need a cooler place to rest safely during hot lunch breaks.', ['Blue is my favorite color.','The library has many books.','Yesterday was Tuesday.'], 'A supporting sentence must give relevant evidence or reason for the claim.', 'writing')
  if (/聽力|聽說|口語|簡報|對話|溝通/.test(text)) return makeTask(`Speaker: “The meeting starts at 3:20 in Room 204, not in the library.”`, 'Which detail should a listener record?', '3:20, Room 204', ['2:04, library','3:20, library','Room 320 at 2:04'], 'Listening notes should preserve the corrected time and place.', 'listening-speaking')
  if (/字彙|搭配詞|詞族|語境|食物|天氣|健康|環境|文化|學校|生活/.test(text)) return makeTask(`Context: “After running in the sun, ${name} was thirsty and drank a bottle of water.”`, 'What does “thirsty” most likely mean?', 'needing a drink', ['wanting to sleep','unable to hear','feeling very cold'], 'The action “drank a bottle of water” gives a contextual clue.', 'vocabulary-context')

  const focus=normalize(context.unit.focus).split(/[，。；]/)[0] || concept.title
  return makeTask(`Lesson focus: “${focus}”. Concept: “${concept.title}”.`, 'Which statement stays aligned with this English lesson focus?', `It directly addresses ${focus}.`, ['It changes to an unrelated topic.','It ignores the language meaning.','It uses information absent from the context.'], 'V20 English fallback: this unit still requires a later human-authored task family even though the item is bound to its focus.', 'english-fallback', true)
}

function chineseTask(context: UnitContext, concept: ReviewedConcept, index: number): Task {
  const text=topic(context,concept), seed=`${context.unit.id}:${concept.title}:${index}`
  if (/注音|聲母|韻母|拼音|字音|多音字/.test(text)) return makeTask('朗讀與查字時需要同時核對音節與聲調。', '哪個做法最符合字音／注音學習？', '依字典或注音核對讀音與聲調', ['只看字形猜音','忽略聲調','每個字都讀同音'], '字音辨識需要實際音節與聲調證據。', 'phonetics')
  if (/字形|部首|筆畫|查字典|工具書|辭典|識字/.test(text)) {
    const radical=['木','水','言','心'][n(seed,0,4)]
    return makeTask(`遇到含「${radical}」部的生字，需要確認讀音與義項。`, '哪個查找步驟較完整？', `先依「${radical}」部或讀音查找，再回到語境核對義項`, ['只看字形猜意思','跳過不查','只抄第一個義項'], '工具書使用不能離開實際語境。', 'dictionary')
  }
  if (/修辭|譬喻|比喻/.test(text)) return makeTask('句子：「月光像鋪在地上的銀紗。」', '主要使用哪種修辭？', '譬喻', ['設問','排比','轉品'], '以「像」依相似點連結月光與銀紗，是譬喻。', 'rhetoric')
  if (/成語|詞語|語詞|字義|詞義/.test(text)) return makeTask('一句話中的詞語前後有原因、行動與結果線索。', '判斷詞義時最可靠的做法？', '讀完整句子並用上下文核對', ['只看單一字','所有成語逐字相加','不看前後文選最熟解釋'], '詞義須由語境驗證。', 'word-meaning')
  if (/文言|古文|古典|詩|詞|曲/.test(text)) return makeTask('讀句：「山色入簾青，風來竹有聲。」', '哪個解讀有直接文本證據？', '同時運用視覺「青」與聽覺「有聲」描寫', ['完全沒有景物描寫','作者正在市場買東西','古文不需文本證據'], '解讀須回到原句詞語。', 'classical')
  if (/寫作|段落|篇章|主旨|結構|起承轉合/.test(text)) return makeTask('短文需要中心清楚，細節支持主旨。', '哪種安排最符合篇章組織？', '先確立中心，再安排支持中心的事件或細節', ['每句換無關主題','只堆形容詞','段落順序不影響閱讀'], '中心與支持細節要形成可追蹤關係。', 'writing')
  return makeTask(`短文：「小安學習『${concept.title}』時，補上事情發生的原因、轉折與影響。」`, '從文字可直接判斷什麼？', '內容增加了因果與轉折線索', ['內容因此完全無法理解','所有事件沒有先後','有結果就不需上下文'], '題幹明示原因、轉折與影響，結論須由文本支持。', 'reading')
}

function scienceTask(context: UnitContext, concept: ReviewedConcept, index: number): Task {
  const text=topic(context,concept), seed=`${context.unit.id}:${concept.title}:${index}`
  if (/細胞|細胞膜|細胞核|葉綠體|粒線體|器官|組織/.test(text)) return makeTask('比較細胞構造名稱與功能。', '哪個配對正確？', '細胞膜調節物質進出；細胞核含重要遺傳資訊', ['所有構造功能相同','細胞核只運送氧氣','細胞膜完全沒有選擇性'], '不同細胞構造功能不可互換。', 'cell')
  if (/遺傳|基因|染色體|DNA/.test(text)) return makeTask('比較 DNA、基因與染色體三個層次。', '哪個敘述較正確？', '基因是 DNA 的特定片段，染色體含 DNA', ['三者完全無關','所有性狀只由單一基因','DNA 只在植物'], '三者有層次關係，且性狀表現可能涉及基因與環境。', 'genetics')
  if (/生態|食物鏈|食物網|族群|群集|生態系/.test(text)) return makeTask('草地有草、兔子、狐狸；兔吃草，狐狸捕食兔。', '哪個順序表示能量傳遞？', '草 → 兔子 → 狐狸', ['狐狸 → 陽光 → 草','分解者不參與循環','所有生物只吃一種食物'], '能量由生產者進入消費者。', 'ecology')
  if (/電路|電流|電壓|電阻|串聯|並聯/.test(text)) {
    const r=n(seed,2,6), i=n(`${seed}:i`,1,5), v=r*i
    return makeTask(`電壓 ${v} V、電阻 ${r} Ω。`, '依 I=V/R，電流是多少？', `${i} A`, [`${v*r} A`,`${r/v} A`,`${v+r} A`], `${v}/${r}=${i} A。`, 'electricity')
  }
  if (/力|速度|加速度|運動|摩擦|慣性/.test(text)) {
    const t=n(seed,2,5), speed=n(`${seed}:s`,3,8), d=t*speed
    return makeTask(`小車 ${t} 秒前進 ${d} 公尺。`, '平均速度大小？', `${speed} m/s`, [`${d*t} m/s`,`${t/d} m/s`,`${d+t} m/s`], `${d}/${t}=${speed} m/s。`, 'motion')
  }
  if (/酸|鹼|pH|化學反應|元素|化合物|原子|分子/.test(text)) {
    const ph=n(seed,2,5)
    return makeTask(`溶液 pH=${ph}。`, '屬於哪一類？', '酸性', ['中性','鹼性','無法判斷'], `一般條件下 pH<7 為酸性。`, 'chemistry')
  }
  if (/光|反射|折射|透鏡/.test(text)) return makeTask('光照到平面鏡，角度以法線為基準。', '哪個關係符合反射定律？', '入射角等於反射角', ['反射角永遠兩倍','反射光一定原路返回','沒有法線也能任意定義角度'], '反射定律以法線量角，入射角=反射角。', 'optics')
  if (/聲|音|波/.test(text)) return makeTask('比較聲源振動頻率與聽到的音調。', '哪個敘述正確？', '頻率越高，音調通常越高', ['頻率越高音調越低','真空可傳一般聲音','音量與頻率是同一量'], '頻率主要對應音調，不等於音量。', 'sound')
  if (/天氣|氣候|水循環|蒸發|凝結|雲|降水/.test(text)) return makeTask('暖濕空氣上升冷卻，水蒸氣形成微小水滴。', '最直接是哪個過程？', '凝結', ['蒸發','融化','昇華'], '水蒸氣變液態小水滴是凝結。', 'weather')
  if (/地球|板塊|岩石|地震|火山/.test(text)) return makeTask('強震與火山帶常沿板塊邊界集中。', '哪個解釋最合理？', '板塊交界是地質活動常較集中的區域', ['板塊完全不移動','所有地震只在大陸中央','火山與地球內部無關'], '板塊互動集中在邊界，常伴隨地震與火山。', 'earth-science')
  if (/太陽|月球|行星|恆星|宇宙|天文/.test(text)) return makeTask('一個月中從地球看到月球亮面形狀規律改變。', '月相主要如何形成？', '觀察到的月球受日照部分角度隨公轉改變', ['月球每天自行改變發光顏色','每天都是地球影子遮住月球','所有行星繞月球'], '月相是太陽、月球、地球相對位置造成的觀察結果。', 'astronomy')
  return makeTask(`研究「${concept.title}」並做可比較觀察。`, '哪個設計較能支持因果判斷？', '只改變一個主要條件，其他重要條件保持相近並記錄結果', ['同時改所有條件','不記錄就下結論','每次換問題再直接比較'], '控制重要變因並留下觀察，才能提高證據解釋力。', 'inquiry')
}

function socialTask(context: UnitContext, concept: ReviewedConcept, index: number): Task {
  const text=topic(context,concept), seed=`${context.unit.id}:${concept.title}:${index}`
  if (/臺灣.*位置|位置.*臺灣|經緯|海域|地形|地圖|方位|比例尺|地理資訊|圖層|空間資料/.test(text)) return makeTask('地圖有圖例、方向、比例尺與地形／海域標示。', '判斷空間關係前最應保留什麼？', '先確認圖例、方向、比例尺，再用位置資訊判斷', ['只看顏色猜','不看圖例','把局部地圖當全世界同比例'], '地圖判讀須同時考慮圖例、方向、比例尺與尺度。', 'map')
  if (/人口|都市|聚落|分布|密度|統計/.test(text)) {
    const a=n(seed,35,25), b=a+n(`${seed}:b`,5,15)
    return makeTask(`甲地都市人口 ${a}%，乙地 ${b}%。`, '只依數據可直接成立什麼？', `乙地較高，因為 ${b}% > ${a}%`, [`甲地較高`,`兩地完全相同`,'可推出所有形成原因'], '可以直接比較數值，但不能只靠兩個百分比推出完整原因。', 'population')
  }
  if (/地方的過去|老照片|故事|文物|歷史|朝代|時代|事件|革命|工業化|帝國|民族|史料/.test(text)) {
    const y1=1900+n(seed,1,30), y2=y1+n(`${seed}:y`,2,8)
    return makeTask(`兩份同一事件資料寫於 ${y1} 與 ${y2} 年，作者身分不同。`, '比較史料應先做什麼？', '確認作者、時間、目的，再比較描述與差異', ['年代早就一定是真相','不同就代表一份造假','只看年份不讀內容'], '史料差異需放回作者與時代脈絡分析。', 'history-source')
  }
  if (/政府|公民|法律|權利|義務|民主|選舉|憲法|政策|制度/.test(text)) return makeTask('討論中同時出現法律條文、政策意見與個人價值判斷。', '哪種整理最妥當？', '區分法律規定、政策選擇與價值立場，再查核現行制度', ['把喜好當法律','用留言數決定制度','假設制度永不變'], '不同層次的主張需要分開並做時效查核。', 'civics')
  if (/媒體|資訊來源|偏誤|輿論|公共論證/.test(text)) return makeTask('同一事件有官方公告、新聞報導與匿名社群貼文三種來源。', '第一步如何提高媒體識讀品質？', '辨識來源、作者與證據，再比較各說法', ['轉發最多就一定正確','匿名貼文自動等於證據','只讀標題即可'], '來源可追溯性與證據品質是判讀基礎。', 'media-literacy')
  if (/市場|經濟|價格|供需|消費|貿易|產業|資源/.test(text)) return makeTask('某商品需求與供給同時變動，但其他條件尚未蒐集完整。', '哪個結論較合理？', '需要更多資料才能判斷各因素對價格的影響', ['需求一變就能精確推出價格','供給永不影響市場','只看最後價格即可'], '多個因素同時變動時不能過度因果化。', 'economics')
  if (/文化|族群|宗教|社會|多元|認同/.test(text)) return makeTask('不同群體對同一公共空間有不同使用方式與意義。', '分析時哪個做法較妥當？', '比較多個來源與群體內差異，避免單一案例概括全部', ['一人代表全群體','先決定哪群較好再找證據','有觀點差異就沒有事實'], '多元社會分析需要避免過度概括。', 'culture')
  if (/區域|東亞|亞洲|世界區域|核心邊陲|區域研究/.test(text)) return makeTask('兩個區域有不同人口密度、交通連結、產業結構與自然條件。', '要比較區域形成，哪種方法較完整？', '同時比較自然、人文、連結與尺度，再說明差異', ['只看國名','只用單一人口數','忽略尺度直接類推'], '區域分析需要多變項與尺度意識。', 'regional-analysis')
  return makeTask(`本單元提供一份和「${concept.title}」相關的資料摘要。`, '分析前哪個步驟最能維持證據品質？', `確認來源與脈絡，再判斷資料能回答「${concept.title}」的哪一部分`, ['只看標題下結論','混用不同年代','忽略尺度外推全部'], 'V20 social fallback：來源、時間、空間尺度仍需人工補成單元專屬史料／地圖／制度素材。', 'social-fallback', true)
}

function lifeTask(context: UnitContext, concept: ReviewedConcept, index: number): Task {
  const minutes=n(`${context.unit.id}:${concept.title}:${index}`,5,10)
  return makeTask(`在「${context.unit.title}」活動中，用 ${minutes} 分鐘觀察校園生活現象。`, '哪種紀錄最能支持比較與分享？', '記下時間、地點、實際看到或聽到的現象', ['只寫很好玩','補寫沒看到的現象','每次換方法卻直接比較'], '生活課要保留真實觀察與可比較紀錄。', 'life-observation')
}

function taskFor(context: UnitContext, concept: ReviewedConcept, index: number) {
  if (context.pathway==='life') return lifeTask(context,concept,index)
  if (context.subject==='math') return mathTask(context,concept,index)
  if (context.subject==='english') return englishTask(context,concept,index)
  if (context.subject==='science') return scienceTask(context,concept,index)
  if (context.subject==='social') return socialTask(context,concept,index)
  return chineseTask(context,concept,index)
}

function upgradeChoice(context: UnitContext, question: ReviewedChoiceQuestion, concept: ReviewedConcept, index: number): ReviewedChoiceQuestion {
  const extra=question as ExtendedQuestion
  if (extra.audioText || extra.mediaAssetId) return question
  const task=taskFor(context,concept,index)
  return { ...question, context: task.context, prompt: task.prompt, options: task.options, correctIndex: task.correctIndex, explanation: task.explanation }
}

function upgradeResponse(context: UnitContext, question: ReviewedResponseQuestion, concept: ReviewedConcept, index: number): ReviewedResponseQuestion {
  const extra=question as ExtendedQuestion
  if (extra.audioText || extra.mediaAssetId) return question
  const task=taskFor(context,concept,index), correct=task.options[task.correctIndex]
  return {
    ...question,
    context: task.context,
    prompt: context.subject==='english' ? `${task.prompt} Answer in one complete sentence and cite one clue.` : `${task.prompt} 請寫出答案並指出題目中的具體證據。`,
    sampleAnswer: `${correct}。${task.explanation}`,
    explanation: task.explanation,
  }
}

function upgradeWorkedExample(context: UnitContext, model: ReviewedWorkedExample, concept: ReviewedConcept, index: number): ReviewedWorkedExample {
  const task=taskFor(context,concept,index+101), answer=task.options[task.correctIndex]
  const steps=context.subject==='math'
    ? [`整理已知：${task.context}`,`辨認要使用「${concept.title}」的哪個定義、算式或表示。`,`完成計算／推理得到「${answer}」。`,'代回題意檢查範圍、符號與單位。']
    : [`讀完整素材：${task.context}`,`指出和「${concept.title}」直接相關的詞句、資料或觀察。`,`回答：「${task.prompt}」並得到「${answer}」。`,'檢查結論是否超出素材能支持的範圍。']
  return { ...model, title:`${concept.title}｜單元專屬示範`, context:task.context, prompt:task.prompt, steps, answer:`${answer}。`, explanation:`${task.explanation}${task.fallback?' 這仍是 V20 明確標記的 fallback，後續人工審稿不得把它視為完成。':''}` }
}

function upgradeConcept(context: UnitContext, concept: ReviewedConcept, index: number): ReviewedConcept {
  const task=taskFor(context,concept,index+211), explanation=stripBoilerplate(concept.explanation)
  return { ...concept, explanation: explanation || `「${concept.title}」是「${context.unit.title}」中的核心觀念。`, example:`${task.context} ${task.prompt}` }
}

function misconceptionVisual(unit: TextbookUnitContentV14): TextbookVisual {
  return {
    id:`${unit.unitId}-v20-misconceptions`, kind:'comparison', title:'本單元真正容易搞混的地方',
    caption:'把本單元實際迷思和修正理由並列；仍須在 V20 人工審稿確認迷思是否真的常見且正確。',
    items:unit.misconceptions.slice(0,4).map((item,index)=>({label:`迷思 ${index+1}｜${normalize(item.claim).slice(0,38)}`,detail:`${normalize(item.correction)} ${normalize(item.reason)}`})),
  }
}

export function inspectTextbookUnitV20(unitId: string) {
  const source=getTextbookUnitContentV18(unitId), context=resolveCurriculumUnit(unitId)
  if (!source || !context) return { unit:null, status:'v20-reviewing' as const, errors:['V20 source/context missing'] }
  const concepts=source.concepts.map((concept,index)=>upgradeConcept(context,concept,index))
  const questions:ReviewedQuestion[]=source.questions.map((question,index)=>{
    const concept=concepts[index%concepts.length]
    return question.kind==='choice' ? upgradeChoice(context,question,concept,index) : upgradeResponse(context,question,concept,index)
  })
  const workedExamples=source.workedExamples.map((model,index)=>upgradeWorkedExample(context,model,concepts[index%concepts.length],index))
  const visuals=[...source.visuals.filter((visual)=>!GENERIC_MISCONCEPTION.test((visual.items??[]).map((item)=>`${item.label} ${item.detail}`).join(' '))),misconceptionVisual(source)]
  return { unit:{...source,concepts,questions,workedExamples,visuals}, status:'v20-reviewing' as const, errors:[] as string[] }
}

const cache=new Map<string,TextbookUnitContentV14|null>()
export function getTextbookUnitContentV20(unitId:string){
  if(cache.has(unitId)) return cache.get(unitId)??null
  const result=inspectTextbookUnitV20(unitId)
  cache.set(unitId,result.unit)
  return result.unit
}

export function getConceptChecksV20(unit:TextbookUnitContentV14){return unit.questions.filter((question)=>question.id.includes('-ped-v17-check-'))}
