import { getTextbookUnitContentV18 } from './curriculum-pedagogy-v18'
import { resolveCurriculumUnit } from './curriculum-plan-v5'
import type { CurriculumQuestionEnhancement } from './curriculum-reviewed-content'
import type {
  ReviewedChoiceQuestion,
  ReviewedConcept,
  ReviewedQuestion,
  ReviewedResponseQuestion,
  ReviewedWorkedExample,
} from './curriculum-reviewed-social10'
import type { TextbookMisconception, TextbookUnitContentV14, TextbookVisual } from './curriculum-textbook-v14'

type UnitContext = NonNullable<ReturnType<typeof resolveCurriculumUnit>>
type EnhancedChoice = ReviewedChoiceQuestion & CurriculumQuestionEnhancement
type EnhancedResponse = ReviewedResponseQuestion & CurriculumQuestionEnhancement

type Task = {
  context: string
  prompt: string
  options: string[]
  correctIndex: number
  explanation: string
}

const SUBJECT_CLOSURES = [
  /重點是回到完整語境[^。]*。?/g,
  /Connect meaning, form, word order, time clues, reference, and register[^.]*\.?/gi,
  /重點是把條件轉成可檢查的數學表示[^。]*。?/g,
  /重點是把觀察、模型與推論分開[^。]*。?/g,
  /重點是連同來源、時間、空間尺度與不同群體觀點判讀資料[^。]*。?/g,
]

const GENERIC_MISCONCEPTION = /只要記住「.*?」的最後結論，就不需要重新檢查題目條件、文本或證據/

function normalize(value: string) {
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
  return min + (stableHash(seed) % span)
}

function uniqueOptions(correct: string, distractors: string[]) {
  const values = [correct, ...distractors].map(normalize).filter(Boolean)
  const unique: string[] = []
  for (const value of values) if (!unique.includes(value)) unique.push(value)
  const fallbacks = ['無法由題目推出', '與題目條件相反', '混用了另一個概念', '忽略了關鍵條件']
  for (const value of fallbacks) if (unique.length < 4 && !unique.includes(value)) unique.push(value)
  return unique.slice(0, 4)
}

function topicText(context: UnitContext, concept: ReviewedConcept) {
  return `${context.unit.title} ${context.unit.focus} ${concept.title}`
}

function cleanExplanation(value: string) {
  let result = normalize(value)
  for (const pattern of SUBJECT_CLOSURES) result = result.replace(pattern, '').trim()
  return result.replace(/\s{2,}/g, ' ').trim()
}

function mathTask(context: UnitContext, concept: ReviewedConcept, index: number): Task {
  const text = topicText(context, concept)
  const seed = `${context.unit.id}:${concept.title}:${index}`

  if (/100\s*以內|百以內/.test(text)) {
    const a = n(seed, 41, 49)
    const b = n(`${seed}:b`, 5, Math.max(6, a - 5))
    const answer = a - b
    const correct = String(answer)
    const options = uniqueOptions(correct, [String(a + b), String(a - b + 10), String(b)])
    return { context: `小芸有 ${a} 張數字卡，整理後拿走 ${b} 張；所有數量都在 100 以內。`, prompt: `${a} - ${b} = ?`, options, correctIndex: options.indexOf(correct), explanation: `本單元限制在 100 以內；直接計算 ${a} - ${b} = ${answer}，結果仍在範圍內。` }
  }
  if (/1000\s*以內|千以內|位值|個位|十位|百位|千位/.test(text)) {
    const hundreds = n(seed, 2, 7)
    const tens = n(`${seed}:t`, 1, 9)
    const ones = n(`${seed}:o`, 1, 9)
    const value = hundreds * 100 + tens * 10 + ones
    const correct = String(value)
    const options = uniqueOptions(correct, [String(hundreds * 100 + ones * 10 + tens), String(hundreds * 10 + tens + ones), String(value + 100)])
    return { context: `一個三位數有 ${hundreds} 個百、${tens} 個十和 ${ones} 個一。`, prompt: `這個三位數是多少？`, options, correctIndex: options.indexOf(correct), explanation: `${hundreds}×100 + ${tens}×10 + ${ones} = ${value}，這是在使用十進位位值。` }
  }
  if (/因數|倍數|最大公因|最小公倍|質數|質因數/.test(text)) {
    const base = n(seed, 3, 7)
    const a = base * n(`${seed}:a`, 2, 5)
    const b = base * n(`${seed}:b`, 5, 5)
    const gcd = (() => { let x = a; let y = b; while (y) [x, y] = [y, x % y]; return x })()
    const correct = String(gcd)
    const options = uniqueOptions(correct, [String(base), String(a + b), String(a * b)])
    return { context: `兩個整數是 ${a} 與 ${b}。`, prompt: `${a} 與 ${b} 的最大公因數是多少？`, options, correctIndex: options.indexOf(correct), explanation: `把兩數分解或用輾轉相除可得最大公因數 ${gcd}；這題直接檢查因數與倍數關係。` }
  }
  if (/分數|小數|百分|比率|比例|比值/.test(text)) {
    const denominator = [4, 5, 8, 10][n(seed, 0, 4)]
    const numerator = n(`${seed}:num`, 1, denominator - 1)
    const percent = numerator / denominator * 100
    const correct = `${percent}%`
    const options = uniqueOptions(correct, [`${numerator * 10}%`, `${denominator * 10}%`, `${Math.round(percent / 10)}%`])
    return { context: `一組資料中有 ${denominator} 份，其中 ${numerator} 份符合條件。`, prompt: `${numerator}/${denominator} 換成百分率是多少？`, options, correctIndex: options.indexOf(correct), explanation: `${numerator} ÷ ${denominator} × 100% = ${percent}%，把分數、比值與百分率連起來。` }
  }
  if (/正數|負數|整數|數線|相反數|絕對值/.test(text)) {
    const start = -n(seed, 2, 8)
    const rise = n(`${seed}:rise`, 3, 10)
    const result = start + rise
    const correct = String(result)
    const options = uniqueOptions(correct, [String(start - rise), String(Math.abs(result)), String(-result)])
    return { context: `氣溫一開始是 ${start}°C，之後上升 ${rise}°C。`, prompt: `最後氣溫是多少？`, options, correctIndex: options.indexOf(correct), explanation: `上升表示加上正數：${start} + ${rise} = ${result}。數線方向與正負號必須一致。` }
  }
  if (/科學記號|指數律|指數|次方|冪/.test(text)) {
    const coefficient = n(seed, 2, 7)
    const exponent = n(`${seed}:exp`, 3, 6)
    const value = coefficient * 10 ** exponent
    const correct = `${coefficient} × 10^${exponent}`
    const options = uniqueOptions(correct, [`${coefficient} × 10^${exponent - 1}`, `${coefficient * 10} × 10^${exponent - 1}`, `${coefficient}.0 × 10^${exponent + 1}`])
    return { context: `要把 ${value.toLocaleString('en-US')} 寫成 a × 10^n，且 1 ≤ a < 10。`, prompt: `正確的科學記號是哪一個？`, options, correctIndex: options.indexOf(correct), explanation: `小數點移到第一個非零數後得到 ${coefficient}，共移 ${exponent} 位，所以是 ${correct}。` }
  }
  if (/二次方程|一元二次/.test(text)) {
    const r1 = n(seed, 2, 6)
    const r2 = n(`${seed}:r2`, r1 + 1, 5)
    const sum = r1 + r2
    const product = r1 * r2
    const correct = `x = ${r1} 或 x = ${r2}`
    const options = uniqueOptions(correct, [`x = ${sum}`, `x = ${product}`, `x = -${r1} 或 x = -${r2}`])
    return { context: `方程式 x² - ${sum}x + ${product} = 0 可因式分解。`, prompt: `這個一元二次方程式的解為何？`, options, correctIndex: options.indexOf(correct), explanation: `x² - ${sum}x + ${product} = (x-${r1})(x-${r2})，因此 x=${r1} 或 x=${r2}。` }
  }
  if (/乘法公式|多項式|展開|因式分解/.test(text)) {
    const a = n(seed, 2, 7)
    const b = n(`${seed}:b`, 1, 6)
    const correct = `x² + ${a + b}x + ${a * b}`
    const options = uniqueOptions(correct, [`x² + ${a * b}x + ${a + b}`, `x² + ${a + b}x - ${a * b}`, `2x + ${a + b}`])
    return { context: `要展開 (x + ${a})(x + ${b})。`, prompt: `展開後的多項式是哪一個？`, options, correctIndex: options.indexOf(correct), explanation: `用分配律：x² + ${b}x + ${a}x + ${a * b} = ${correct}。` }
  }
  if (/一次方程|方程|未知數|代數|式子/.test(text)) {
    const x = n(seed, 2, 9)
    const a = n(`${seed}:a`, 2, 8)
    const b = n(`${seed}:b`, 1, 10)
    const total = a * x + b
    const correct = String(x)
    const options = uniqueOptions(correct, [String(total / a), String(x + b), String(a)])
    return { context: `方程式 ${a}x + ${b} = ${total}。`, prompt: `x 的值是多少？`, options, correctIndex: options.indexOf(correct), explanation: `先減 ${b} 得 ${a}x=${a * x}，再除以 ${a}，得到 x=${x}。` }
  }
  if (/三角比|三角函數|sin|cos|tan/.test(text)) {
    const triples = [[3,4,5],[5,12,13],[8,15,17]] as const
    const [opp, adj, hyp] = triples[n(seed, 0, triples.length)]
    const correct = `${opp}/${hyp}`
    const options = uniqueOptions(correct, [`${adj}/${hyp}`, `${opp}/${adj}`, `${hyp}/${opp}`])
    return { context: `一直角三角形相對於角 θ 的對邊為 ${opp}、鄰邊為 ${adj}、斜邊為 ${hyp}。`, prompt: `sin θ 等於多少？`, options, correctIndex: options.indexOf(correct), explanation: `sin θ = 對邊/斜邊，所以 sin θ = ${opp}/${hyp}。` }
  }
  if (/極限|微分|導數|變化率/.test(text)) {
    const a = n(seed, 2, 6)
    const x = n(`${seed}:x`, 1, 5)
    const correct = String(2 * a * x)
    const options = uniqueOptions(correct, [String(a * x), String(a * x * x), String(2 * a)])
    return { context: `函數 f(x) = ${a}x²，要求在 x=${x} 的瞬時變化率。`, prompt: `f′(${x}) 是多少？`, options, correctIndex: options.indexOf(correct), explanation: `f′(x)=${2 * a}x，代入 x=${x} 得 ${correct}。這題直接檢查導數與變化率。` }
  }
  if (/數列|等差|等比/.test(text)) {
    const first = n(seed, 2, 8)
    const diff = n(`${seed}:d`, 2, 6)
    const term = n(`${seed}:term`, 5, 5)
    const value = first + (term - 1) * diff
    const correct = String(value)
    const options = uniqueOptions(correct, [String(first + term * diff), String(first * diff), String(term * diff)])
    return { context: `等差數列首項 ${first}、公差 ${diff}。`, prompt: `第 ${term} 項是多少？`, options, correctIndex: options.indexOf(correct), explanation: `a_${term}=${first}+(${term}-1)×${diff}=${value}。` }
  }
  if (/機率/.test(text)) {
    const red = n(seed, 2, 5)
    const blue = n(`${seed}:blue`, 2, 6)
    const total = red + blue
    const correct = `${red}/${total}`
    const options = uniqueOptions(correct, [`${blue}/${total}`, `${red}/${blue}`, `1/${total}`])
    return { context: `袋中有 ${red} 顆紅球與 ${blue} 顆藍球，每顆被抽到的機會相同。`, prompt: `隨機抽 1 顆，抽到紅球的機率是多少？`, options, correctIndex: options.indexOf(correct), explanation: `有利結果 ${red} 種、全部 ${total} 種，因此機率為 ${red}/${total}。` }
  }
  if (/平均|中位|眾數|統計|資料|四分位/.test(text)) {
    const base = n(seed, 4, 10)
    const data = [base, base + 2, base + 3, base + 6, base + 9]
    const correct = String(data[2])
    const options = uniqueOptions(correct, [String(data[0]), String(data[4]), String(data.reduce((a,b)=>a+b,0))])
    return { context: `資料已排序：${data.join('、')}。`, prompt: `這 5 筆資料的中位數是多少？`, options, correctIndex: options.indexOf(correct), explanation: `奇數筆已排序資料的中位數是正中央第 3 筆，因此為 ${correct}。` }
  }
  if (/圓|角|三角形|四邊形|幾何|面積|周長|體積|座標|形狀/.test(text)) {
    const w = n(seed, 4, 8)
    const h = n(`${seed}:h`, 3, 7)
    const area = w * h
    const correct = String(area)
    const options = uniqueOptions(correct, [String(2 * (w + h)), String(w + h), String(area * 2)])
    return { context: `長方形長 ${w} 公分、寬 ${h} 公分。`, prompt: `面積是多少平方公分？`, options, correctIndex: options.indexOf(correct), explanation: `面積 = 長 × 寬 = ${w}×${h}=${area} 平方公分。` }
  }

  const a = n(seed, 12, 40)
  const b = n(`${seed}:b`, 3, Math.max(4, a - 3))
  const correct = String(a - b)
  const options = uniqueOptions(correct, [String(a + b), String(b), String(a)])
  return { context: `「${concept.title}」練習使用兩個量 ${a} 與 ${b}，題目要求比較並計算差。`, prompt: `${a} - ${b} = ?`, options, correctIndex: options.indexOf(correct), explanation: `${a} - ${b} = ${a - b}。這是目前 V20 第一輪保底題；若「${concept.title}」不是加減型概念，該單元仍須在後續人工審稿改成專屬題型。` }
}

function englishTask(context: UnitContext, concept: ReviewedConcept, index: number): Task {
  const text = topicText(context, concept).toLowerCase()
  const seed = `${context.unit.id}:${concept.title}:${index}`
  const name = ['Amy','Ben','Cindy','David','Ella','Frank','Grace','Henry'][n(seed, 0, 8)]

  if (/be動詞|be 動詞|am\b|is\b|are\b|基本句型/.test(text)) {
    const subject = n(seed, 0, 2) ? 'They' : name
    const correct = subject === 'They' ? 'are' : 'is'
    const options = uniqueOptions(correct, ['am', correct === 'are' ? 'is' : 'are', 'beed'])
    return { context: `${subject} ___ ready for class now.`, prompt: `Choose the correct form of be for “${subject}”.`, options, correctIndex: options.indexOf(correct), explanation: `Use “${correct}” with “${subject}” in the present tense: “${subject} ${correct} ready for class.”` }
  }
  if (/現在進行|present continuous|進行式/.test(text)) {
    const correct = `${name} is reading.`
    const options = uniqueOptions(correct, [`${name} reads now.`, `${name} reading is.`, `${name} was read now.`])
    return { context: `Right now, ${name} has a book open and is in the middle of the action.`, prompt: `Which sentence correctly describes the action happening right now?`, options, correctIndex: options.indexOf(correct), explanation: `An action happening now uses be + V-ing: “${name} is reading.”` }
  }
  if (/過去|past/.test(text)) {
    const correct = `${name} visited the museum yesterday.`
    const options = uniqueOptions(correct, [`${name} visits the museum yesterday.`, `${name} will visited the museum yesterday.`, `${name} visiting the museum yesterday.`])
    return { context: `Yesterday, ${name} went to the museum and returned home before dinner.`, prompt: `Which sentence correctly reports the completed past event?`, options, correctIndex: options.indexOf(correct), explanation: `“Yesterday” signals the past, so the completed action uses the past form “visited.”` }
  }
  if (/未來|future|will|going to/.test(text)) {
    const correct = `${name} is going to study tonight.`
    const options = uniqueOptions(correct, [`${name} studied tonight tomorrow.`, `${name} going study tonight.`, `${name} studies yesterday tonight.`])
    return { context: `${name} has already made a plan for tonight.`, prompt: `Which sentence clearly expresses the future plan?`, options, correctIndex: options.indexOf(correct), explanation: `“Be going to + base verb” can express a planned future action.` }
  }
  if (/比較|comparative|最高級|superlative/.test(text)) {
    const a = n(seed, 3, 7); const b = a + n(`${seed}:b`, 2, 5)
    const correct = 'The second bag is heavier than the first bag.'
    const options = uniqueOptions(correct, ['The second bag is heavy than the first bag.', 'The first bag is more heavy the second bag.', 'The second bag heavier the first bag is.'])
    return { context: `The first bag is ${a} kg. The second bag is ${b} kg.`, prompt: `Which comparison is correct?`, options, correctIndex: options.indexOf(correct), explanation: `${b} kg is greater than ${a} kg, and the comparative form is “heavier than.”` }
  }
  if (/被動|passive/.test(text)) {
    const correct = 'The window was broken by the ball.'
    const options = uniqueOptions(correct, ['The window broke by the ball.', 'The ball was broke the window.', 'The window was break by the ball.'])
    return { context: `A ball hit the window, and the focus is on what happened to the window.`, prompt: `Which passive sentence is correct?`, options, correctIndex: options.indexOf(correct), explanation: `Past passive uses was/were + past participle: “was broken.”` }
  }
  if (/完成式|present perfect|perfect/.test(text)) {
    const correct = `${name} has finished the homework.`
    const options = uniqueOptions(correct, [`${name} have finish the homework.`, `${name} has finish the homework.`, `${name} finished has the homework.`])
    return { context: `${name}'s homework is complete now, and the completion is relevant to the present.`, prompt: `Which sentence correctly uses the present perfect?`, options, correctIndex: options.indexOf(correct), explanation: `With a singular subject, present perfect uses has + past participle: “has finished.”` }
  }
  if (/關係代名|relative|who|which|that/.test(text)) {
    const correct = 'The student who won the race is my friend.'
    const options = uniqueOptions(correct, ['The student which won the race is my friend.', 'The student who win the race my friend.', 'Who the student won the race is my friend.'])
    return { context: `Two ideas need to be combined: “The student won the race.” “The student is my friend.”`, prompt: `Which sentence correctly combines the ideas with a relative clause?`, options, correctIndex: options.indexOf(correct), explanation: `For a person as subject, “who” can introduce the relative clause: “who won the race.”` }
  }
  if (/條件句|conditional|if/.test(text)) {
    const correct = 'If it rains, we will stay inside.'
    const options = uniqueOptions(correct, ['If it will rain, we stayed inside.', 'If it rains, we stayed yesterday inside.', 'If rains it, we will inside stay.'])
    return { context: `The plan depends on tomorrow's weather.`, prompt: `Which first-conditional sentence is correct?`, options, correctIndex: options.indexOf(correct), explanation: `A common first conditional uses if + present simple, then will + base verb.` }
  }

  const clue = normalize(context.unit.focus).split(/[，。；]/)[0] || concept.title
  const correct = `It directly matches the lesson focus: ${clue}.`
  const options = uniqueOptions(correct, ['It changes the topic to an unrelated event.', 'It ignores the sentence meaning completely.', 'It gives a time or action not stated in the context.'])
  return { context: `Lesson focus: “${clue}”. Concept: “${concept.title}”.`, prompt: `Which statement stays directly aligned with this English lesson focus?`, options, correctIndex: options.indexOf(correct), explanation: `This fallback keeps the item tied to the actual unit focus, but V20 still requires a later human rewrite if a grammar/communication family has not yet been specialized.` }
}

function chineseTask(context: UnitContext, concept: ReviewedConcept, index: number): Task {
  const text = topicText(context, concept)
  const seed = `${context.unit.id}:${concept.title}:${index}`
  if (/注音|聲母|韻母|拼音|字音|多音字/.test(text)) {
    const options = ['同音字辨識', '只看字形猜讀音', '完全忽略聲調', '把所有字都讀成同一音']
    return { context: `本題聚焦「${concept.title}」的字音辨識。朗讀或查字時，必須同時核對音節與聲調。`, prompt: `哪一個做法最符合字音／注音工具的正確使用？`, options, correctIndex: 0, explanation: `字音學習要核對實際音節與聲調；不能只靠字形猜，也不能忽略聲調差異。` }
  }
  if (/字形|部首|筆畫|查字典|工具書|辭典|識字/.test(text)) {
    const radical = ['木','水','言','心'][n(seed,0,4)]
    const correct = `先依「${radical}」部或已知讀音查找，再核對字義與例詞`
    const options = uniqueOptions(correct, ['只看字長得像什麼就直接猜意思', '遇到生字就跳過，不查任何資料', '只抄第一個解釋，不看語境'])
    return { context: `閱讀「${context.unit.title}」時遇到一個含「${radical}」部的生字，需要使用字典或工具書確認。`, prompt: `哪個查找步驟較完整？`, options, correctIndex: options.indexOf(correct), explanation: `工具書使用要能用部首或讀音找到字，再回到語境核對適合的義項與例詞。` }
  }
  if (/修辭|譬喻|比喻/.test(text)) {
    const objects = ['雨點','月光','浪花','落葉'][n(seed,0,4)]
    const image = ['透明的珠子','鋪在地上的銀紗','奔跑的白馬','旋轉的小船'][n(`${seed}:i`,0,4)]
    const sentence = `${objects}像${image}，把眼前景象寫得更具體。`
    const options = ['譬喻','設問','排比','轉品']
    return { context: `句子：「${sentence}」`, prompt: `「${objects}像${image}」主要使用哪一種修辭？`, options, correctIndex: 0, explanation: `用「像」把兩個不同事物依相似點連結，是明確的譬喻。` }
  }
  if (/成語|詞語|語詞|字義|詞義/.test(text)) {
    const correct = '先讀完整句子，再用上下文判斷詞義是否合理'
    const options = uniqueOptions(correct, ['只看單一字就決定整個詞的意思', '所有成語都照字面逐字相加', '不看前後文就選最熟悉的解釋'])
    return { context: `在「${context.unit.title}」的句子中遇到「${concept.title}」相關詞語，前後文提供人物行動與事件結果。`, prompt: `判斷詞義時最需要保留哪個步驟？`, options, correctIndex: options.indexOf(correct), explanation: `詞義與成語常受語境影響，必須回到完整句子與前後文驗證。` }
  }
  if (/文言|古文|古典|詩|詞|曲/.test(text)) {
    const line = `「山色入簾青，風來竹有聲。」`
    const correct = '由「入簾青」與「竹有聲」可看出視覺與聽覺描寫並用'
    const options = uniqueOptions(correct, ['句中完全沒有景物描寫', '句中明確說作者正在市場買東西', '只要看到古文就不需要依文字證據解讀'])
    return { context: `閱讀句子：${line}`, prompt: `哪個解讀最能由原句直接支持？`, options, correctIndex: options.indexOf(correct), explanation: `「青」提供視覺色彩，「有聲」提供聽覺線索；解讀必須回到原文。` }
  }
  if (/寫作|段落|篇章|主旨|結構|起承轉合/.test(text)) {
    const correct = '先有中心意思，再安排支持中心的事件或細節'
    const options = uniqueOptions(correct, ['每句都換一個完全無關的主題', '只堆形容詞，不需要事件或證據', '段落順序完全不影響閱讀'])
    return { context: `要為「${context.unit.title}」寫一段短文，題目要求中心清楚、細節能支持主旨。`, prompt: `哪種安排最符合篇章組織？`, options, correctIndex: options.indexOf(correct), explanation: `篇章結構要讓中心意思與支持細節形成可追蹤的關係。` }
  }

  const passage = `小安原本只記下結果，後來在「${concept.title}」的學習中補上事情發生的原因、轉折與最後影響。`
  const correct = '內容比原先多了因果與轉折線索，讀者較能理解事件怎麼發展'
  const options = uniqueOptions(correct, ['補上原因與轉折會讓內容完全無法理解', '文中證明所有事件都沒有先後關係', '只要有結果就不需要任何上下文'])
  return { context: `短文：「${passage}」`, prompt: `從這段文字可以直接判斷哪一項？`, options, correctIndex: options.indexOf(correct), explanation: `題幹明確指出新增原因、轉折與影響，因此最直接的結論是篇章關係更完整。` }
}

function scienceTask(context: UnitContext, concept: ReviewedConcept, index: number): Task {
  const text = topicText(context, concept)
  const seed = `${context.unit.id}:${concept.title}:${index}`
  if (/細胞|細胞膜|細胞核|葉綠體|粒線體|器官|組織/.test(text)) {
    const correct = '細胞膜控制物質進出，細胞核含有重要遺傳資訊'
    const options = uniqueOptions(correct, ['所有細胞構造的功能完全相同', '細胞核只負責把氧氣送到全身', '細胞膜是沒有任何選擇性的空洞'])
    return { context: `觀察細胞模型時，需要把「構造名稱」和「功能」正確配對。`, prompt: `哪一個配對較符合基本細胞構造與功能？`, options, correctIndex: options.indexOf(correct), explanation: `不同細胞構造有不同功能；細胞膜與細胞核不能互換解釋。` }
  }
  if (/遺傳|基因|染色體|DNA/.test(text)) {
    const correct = '基因是遺傳資訊的一部分，位於染色體上的 DNA 序列中'
    const options = uniqueOptions(correct, ['基因和染色體完全沒有關係', '所有性狀只由單一基因且不受環境影響', 'DNA 只存在植物而不存在動物'])
    return { context: `比較 DNA、基因與染色體三個層次。`, prompt: `哪個敘述最符合三者關係？`, options, correctIndex: options.indexOf(correct), explanation: `基因是 DNA 的特定片段，染色體則由 DNA 與蛋白質構成；層次要分清楚。` }
  }
  if (/生態|食物鏈|食物網|族群|群集|生態系/.test(text)) {
    const correct = '生產者 → 草食動物 → 肉食動物'
    const options = uniqueOptions(correct, ['肉食動物 → 陽光 → 生產者', '分解者完全不參與物質循環', '所有生物都只能吃同一種食物'])
    return { context: `草地上有草、兔子與狐狸，兔子吃草，狐狸捕食兔子。`, prompt: `哪個箭頭順序最能表示這條食物關係？`, options, correctIndex: options.indexOf(correct), explanation: `能量由生產者草進入兔子，再進入捕食兔子的狐狸。` }
  }
  if (/電路|電流|電壓|電阻|串聯|並聯/.test(text)) {
    const v = n(seed, 3, 10)
    const r = n(`${seed}:r`, 2, 8)
    const current = v / r
    const correct = `${current} A`
    const options = uniqueOptions(correct, [`${v * r} A`, `${r / v} A`, `${v + r} A`])
    return { context: `一個簡化電路的電壓為 ${v} V、電阻為 ${r} Ω。`, prompt: `依 I = V/R，電流是多少？`, options, correctIndex: options.indexOf(correct), explanation: `I=${v}/${r}=${current} A；單位與關係式都要一起檢查。` }
  }
  if (/力|速度|加速度|運動|摩擦|慣性/.test(text)) {
    const t = n(seed, 2, 5); const d = n(`${seed}:d`, 20, 40)
    const speed = d / t
    const correct = `${speed} m/s`
    const options = uniqueOptions(correct, [`${d * t} m/s`, `${t / d} m/s`, `${d + t} m/s`])
    return { context: `小車 ${t} 秒內等速前進 ${d} 公尺。`, prompt: `平均速度大小是多少？`, options, correctIndex: options.indexOf(correct), explanation: `速度 = 路程/時間 = ${d}/${t}=${speed} m/s。` }
  }
  if (/酸|鹼|pH|化學反應|元素|化合物|原子|分子/.test(text)) {
    const ph = n(seed, 2, 5)
    const correct = '酸性'
    const options = uniqueOptions(correct, ['中性','鹼性','無法比較任何酸鹼性'])
    return { context: `某水溶液量得 pH = ${ph}。`, prompt: `依 pH 判斷，這個水溶液屬於哪一類？`, options, correctIndex: options.indexOf(correct), explanation: `一般條件下 pH < 7 為酸性，因此 pH=${ph} 屬酸性。` }
  }
  if (/光|反射|折射|透鏡/.test(text)) {
    const correct = '入射角等於反射角'
    const options = uniqueOptions(correct, ['反射光一定沿原路返回', '反射角永遠是入射角的兩倍', '反射定律只適用沒有光的地方'])
    return { context: `一束光照到平面鏡，角度都以法線為基準量測。`, prompt: `哪個關係符合反射定律？`, options, correctIndex: options.indexOf(correct), explanation: `平面反射中，入射角與反射角相等，且都以法線為基準。` }
  }
  if (/聲|音|波/.test(text)) {
    const correct = '振動頻率越高，音調通常越高'
    const options = uniqueOptions(correct, ['頻率越高音調一定越低', '沒有振動也能在真空中產生一般聲音傳播', '音量和頻率永遠是同一物理量'])
    return { context: `比較兩個聲源的振動頻率與聽到的音調。`, prompt: `哪個敘述符合頻率與音調的基本關係？`, options, correctIndex: options.indexOf(correct), explanation: `在其他條件相同時，頻率越高通常對應越高的音調。` }
  }
  if (/天氣|氣候|水循環|蒸發|凝結|雲|降水/.test(text)) {
    const correct = '水蒸氣冷卻後凝結成小水滴，是形成雲滴的重要過程'
    const options = uniqueOptions(correct, ['蒸發就是液態水直接變成冰', '凝結表示水滴一定立刻落成暴雨', '水循環完全不受太陽能量影響'])
    return { context: `暖濕空氣上升後冷卻，空氣中的水蒸氣開始形成微小水滴。`, prompt: `這段描述最直接對應哪個過程？`, options, correctIndex: options.indexOf(correct), explanation: `氣態水蒸氣冷卻形成液態小水滴，是凝結。` }
  }
  if (/地球|板塊|岩石|地震|火山/.test(text)) {
    const correct = '板塊交界附近常是地震與火山活動較集中的區域'
    const options = uniqueOptions(correct, ['所有地震都只發生在大陸正中央且與板塊無關', '板塊完全不會移動', '火山活動和地球內部能量毫無關係'])
    return { context: `地圖上顯示多數強震與火山帶沿著若干板塊邊界分布。`, prompt: `哪個解釋最符合這項空間分布？`, options, correctIndex: options.indexOf(correct), explanation: `板塊互動集中在邊界，常伴隨地震、火山等地質活動。` }
  }
  if (/太陽|月球|行星|恆星|宇宙|天文/.test(text)) {
    const correct = '月相主要來自我們看到月球受太陽照亮部分的角度改變'
    const options = uniqueOptions(correct, ['月相是月球每天自己發光顏色不同', '月相主要是地球影子每天遮住月球形成', '所有行星都繞月球運行'])
    return { context: `一個月中，從地球看到月球亮面形狀規律改變。`, prompt: `哪個說法最能解釋月相變化？`, options, correctIndex: options.indexOf(correct), explanation: `月球繞地球運行時，日照面相對觀察者的方向改變，因此看到不同月相。` }
  }

  const changed = n(seed, 3, 8)
  const correct = '只改變一個主要條件，其他重要條件盡量保持相同，再比較結果'
  const options = uniqueOptions(correct, ['同時把所有條件都改掉再猜原因', '不記錄觀察結果就直接下結論', `只做 ${changed} 次但每次都換不同問題`])
  return { context: `要研究「${concept.title}」，設計一組可比較的觀察。`, prompt: `哪個設計最能讓結果支持因果判斷？`, options, correctIndex: options.indexOf(correct), explanation: `控制其他重要條件、聚焦主要變因，才能讓觀察差異更有解釋力。` }
}

function socialTask(context: UnitContext, concept: ReviewedConcept, index: number): Task {
  const text = topicText(context, concept)
  const seed = `${context.unit.id}:${concept.title}:${index}`
  if (/臺灣.*位置|位置.*臺灣|經緯|海域|地形|地圖|方位|比例尺/.test(text)) {
    const correct = '先確認圖例、方向與比例尺，再用地圖資訊支持位置判斷'
    const options = uniqueOptions(correct, ['只看地圖顏色就猜地形', '不看圖例就把所有藍色都當成河流', '把局部地圖直接當成全世界比例相同'])
    return { context: `一張臺灣地圖同時標出中央山脈、西部平原、臺灣海峽與太平洋，附有方位和比例尺。`, prompt: `要判斷臺灣地形與海域的相對位置，第一步最應該保留什麼資訊？`, options, correctIndex: options.indexOf(correct), explanation: `地圖判讀需要圖例、方向、比例尺與空間位置共同支持，不能只依顏色猜測。` }
  }
  if (/人口|都市|聚落|分布|密度|統計/.test(text)) {
    const a = n(seed, 40, 20); const b = a + n(`${seed}:b`, 5, 15)
    const correct = `乙地較高，因為 ${b}% > ${a}%`
    const options = uniqueOptions(correct, [`甲地較高，因為 ${a}% < ${b}%`, '兩地一定完全相同', '單憑這兩個百分比可以推出所有人口原因'])
    return { context: `甲地都市人口比例 ${a}%，乙地 ${b}%。`, prompt: `只根據這組數據，哪個比較可以直接成立？`, options, correctIndex: options.indexOf(correct), explanation: `${b}% 大於 ${a}%，所以能直接說乙地較高；但不能只靠這兩數據推導所有原因。` }
  }
  if (/歷史|朝代|時代|事件|戰爭|殖民|日治|清領|史料|古代/.test(text)) {
    const year1 = 1900 + n(seed, 1, 30); const year2 = year1 + n(`${seed}:y`, 2, 8)
    const correct = `先確認兩份史料的作者、時間與目的，再比較對同一事件的描述`
    const options = uniqueOptions(correct, ['只採用年代較早的一份就當唯一真相', '只要兩份史料不同就一定有一份造假', `因為相差 ${year2-year1} 年，所以內容不必閱讀`])
    return { context: `兩份關於同一事件的史料分別寫於 ${year1} 年與 ${year2} 年，作者身分與目的不同。`, prompt: `要比較兩份史料，哪個步驟最符合史料判讀？`, options, correctIndex: options.indexOf(correct), explanation: `史料需要放回作者、時間、目的與脈絡中比較，差異本身也是理解觀點的重要證據。` }
  }
  if (/政府|公民|法律|權利|義務|民主|制度|選舉|憲法|政策/.test(text)) {
    const correct = '先區分法律規定、政策選擇與個人價值判斷，再查核現行制度'
    const options = uniqueOptions(correct, ['把個人喜好直接當成法律條文', '只看網路留言數量就決定制度內容', '制度曾經如此就假設永遠不會變'])
    return { context: `討論「${concept.title}」時，同學同時提出法律條文、政策意見和個人價值判斷。`, prompt: `哪種整理方式較能避免把不同層次混在一起？`, options, correctIndex: options.indexOf(correct), explanation: `公民議題要把現行規範、政策選擇與價值立場分開，並對可能變動的制度做時效查核。` }
  }
  if (/市場|經濟|價格|供需|消費|貿易|產業|資源/.test(text)) {
    const demand = n(seed, 8, 18); const supply = n(`${seed}:s`, 2, 8)
    const correct = '需求與供給都在變，不能只靠一個百分比就斷定唯一原因'
    const options = uniqueOptions(correct, ['只要需求上升就能精確推出價格一定上升多少', '供給變動永遠不影響市場', '只看最後價格，不需要任何市場條件'])
    return { context: `某商品需求增加約 ${demand}%，同時供給也增加約 ${supply}%，其他條件尚未完整蒐集。`, prompt: `根據現有資料，哪個結論最合理？`, options, correctIndex: options.indexOf(correct), explanation: `多個市場因素同時變動時，需要更多資料才能判斷各因素影響，不能過度因果化。` }
  }
  if (/文化|族群|宗教|社會|多元|認同/.test(text)) {
    const correct = '比較不同群體的資料與自我敘述，避免把單一案例當成整個群體'
    const options = uniqueOptions(correct, ['用一個人的行為概括所有同群體成員', '先決定哪個群體一定比較好再找證據', '不同觀點存在就代表沒有任何事實可以查'])
    return { context: `資料中呈現不同族群對同一公共空間的使用方式與意義。`, prompt: `分析文化與群體差異時，哪種做法較妥當？`, options, correctIndex: options.indexOf(correct), explanation: `社會文化分析要保留群體內部差異與多元來源，避免以單一案例過度概括。` }
  }

  const correct = `先確認資料來源，再判斷它能回答「${concept.title}」的哪一部分`
  const options = uniqueOptions(correct, ['只看標題就直接下結論', '把不同年代資料混成同一年', '忽略來源與尺度直接外推到所有地區'])
  return { context: `本單元「${context.unit.title}」提供一份和「${concept.title}」相關的資料摘要。`, prompt: `開始分析前，哪個步驟最能維持證據品質？`, options, correctIndex: options.indexOf(correct), explanation: `社會科判讀要先確認來源、時間、空間尺度，再判斷資料實際能支持的結論範圍。` }
}

function lifeTask(context: UnitContext, concept: ReviewedConcept, index: number): Task {
  const seed = `${context.unit.id}:${concept.title}:${index}`
  const minutes = n(seed, 5, 10)
  const correct = '記下時間、地點、看到或聽到的現象，再比較前後差異'
  const options = uniqueOptions(correct, ['只寫「很好玩」不記任何觀察', '把沒有看到的現象補進紀錄', '每次都改變觀察地點和方法卻直接比較'])
  return { context: `在「${context.unit.title}」活動中，小組用 ${minutes} 分鐘觀察校園生活現象。`, prompt: `哪種紀錄最能支持之後的比較與分享？`, options, correctIndex: options.indexOf(correct), explanation: `生活課重視真實觀察、實作與分享；保留時間、地點與實際現象，才有可比較的證據。` }
}

function taskFor(context: UnitContext, concept: ReviewedConcept, index: number): Task {
  if (context.pathway === 'life') return lifeTask(context, concept, index)
  if (context.subject === 'math') return mathTask(context, concept, index)
  if (context.subject === 'english') return englishTask(context, concept, index)
  if (context.subject === 'science') return scienceTask(context, concept, index)
  if (context.subject === 'social') return socialTask(context, concept, index)
  return chineseTask(context, concept, index)
}

function upgradeChoice(context: UnitContext, question: ReviewedChoiceQuestion, concept: ReviewedConcept, index: number): EnhancedChoice {
  const extra = question as EnhancedChoice
  if (extra.audioText || extra.mediaAssetId) return question as EnhancedChoice
  const task = taskFor(context, concept, index)
  return {
    ...question,
    context: task.context,
    prompt: task.prompt,
    options: task.options,
    correctIndex: task.correctIndex,
    explanation: task.explanation,
    optionFeedback: task.options.map((_, optionIndex) => optionIndex === task.correctIndex ? `正確。${task.explanation}` : `不符合本題「${concept.title}」的條件。${task.explanation}`),
  } as EnhancedChoice
}

function upgradeResponse(context: UnitContext, question: ReviewedResponseQuestion, concept: ReviewedConcept, index: number): EnhancedResponse {
  const extra = question as EnhancedResponse
  if (extra.audioText || extra.mediaAssetId) return question as EnhancedResponse
  const task = taskFor(context, concept, index)
  const correct = task.options[task.correctIndex]
  return {
    ...question,
    context: task.context,
    prompt: context.subject === 'english'
      ? `${task.prompt} Answer in one complete sentence and cite one clue from the context.`
      : `${task.prompt} 請寫出答案，並指出題目中支持你的數字、詞句、資料或觀察。`,
    sampleAnswer: context.subject === 'english'
      ? `${correct} ${task.explanation}`
      : `${correct}。${task.explanation}`,
    explanation: task.explanation,
    rubric: context.subject === 'english'
      ? ['Answers the unit-specific task.', 'Uses an appropriate complete sentence.', 'Cites a clue from the supplied context.']
      : ['直接回答本單元問題。', '使用題目提供的具體證據。', '推理或計算和本概念一致。'],
  } as EnhancedResponse
}

function upgradeWorkedExample(context: UnitContext, model: ReviewedWorkedExample, concept: ReviewedConcept, index: number): ReviewedWorkedExample {
  const task = taskFor(context, concept, index + 101)
  const answer = task.options[task.correctIndex]
  const steps = context.subject === 'math'
    ? [
        `整理本題已知：${task.context}`,
        `辨認這題要使用「${concept.title}」，先寫出對應算式、關係式或定義。`,
        `逐步計算或推理，得到「${answer}」。`,
        `把結果代回題意，檢查數值範圍、符號與單位。`,
      ]
    : [
        `先讀完整素材：${task.context}`,
        `指出和「${concept.title}」直接相關的詞句、資料或觀察。`,
        `用這些證據回答：「${task.prompt}」`,
        `得到「${answer}」後，再檢查是否有超出素材的推論。`,
      ]
  return {
    ...model,
    title: `${concept.title}｜單元專屬示範`,
    context: task.context,
    prompt: task.prompt,
    steps,
    answer: `${answer}。`,
    explanation: `${task.explanation} 這個示範直接對應「${context.unit.title}／${concept.title}」，不是跨單元共用的解題流程文字。`,
  }
}

function upgradeConcept(context: UnitContext, concept: ReviewedConcept, index: number): ReviewedConcept {
  const cleaned = cleanExplanation(concept.explanation)
  const task = taskFor(context, concept, index + 211)
  return {
    ...concept,
    explanation: cleaned || `「${concept.title}」是「${context.unit.title}」中的核心觀念，需要依本單元定義、證據或表示方式理解。`,
    example: `${task.context} ${task.prompt}`,
  }
}

function specificMisconceptionVisual(unit: TextbookUnitContentV14): TextbookVisual {
  const items = unit.misconceptions.slice(0, 4).map((item, index) => ({
    label: `迷思 ${index + 1}｜${normalize(item.claim).slice(0, 38)}`,
    detail: `${normalize(item.correction)} ${normalize(item.reason)}`,
  }))
  return {
    id: `${unit.unitId}-v20-misconceptions`,
    kind: 'comparison',
    title: '本單元真正容易搞混的地方',
    caption: '把錯誤想法和正確概念直接並列；若這些迷思仍過度泛化，V20 人工審稿必須再改寫。',
    items,
  }
}

function upgradeVisuals(unit: TextbookUnitContentV14): TextbookVisual[] {
  const kept = unit.visuals.filter((visual) => !GENERIC_MISCONCEPTION.test((visual.items ?? []).map((item) => `${item.label} ${item.detail}`).join(' ')))
  return [...kept, specificMisconceptionVisual(unit)]
}

export function inspectTextbookUnitV20(unitId: string) {
  const source = getTextbookUnitContentV18(unitId)
  const context = resolveCurriculumUnit(unitId)
  if (!source || !context) return { unit: null, status: 'v20-reviewing' as const, errors: ['V20 source/context missing'] }
  const concepts = source.concepts.map((concept, index) => upgradeConcept(context, concept, index))
  const questions: ReviewedQuestion[] = source.questions.map((question, index) => {
    const concept = concepts[index % concepts.length]
    return question.kind === 'choice'
      ? upgradeChoice(context, question, concept, index)
      : upgradeResponse(context, question, concept, index)
  })
  const workedExamples = source.workedExamples.map((model, index) => upgradeWorkedExample(context, model, concepts[index % concepts.length], index))
  const unit: TextbookUnitContentV14 = {
    ...source,
    concepts,
    questions,
    workedExamples,
    visuals: upgradeVisuals(source),
  }
  return { unit, status: 'v20-reviewing' as const, errors: [] as string[] }
}

const cache = new Map<string, TextbookUnitContentV14 | null>()

export function getTextbookUnitContentV20(unitId: string): TextbookUnitContentV14 | null {
  if (cache.has(unitId)) return cache.get(unitId) ?? null
  const result = inspectTextbookUnitV20(unitId)
  cache.set(unitId, result.unit)
  return result.unit
}

export function getConceptChecksV20(unit: TextbookUnitContentV14) {
  return unit.questions.filter((question) => question.id.includes('-ped-v17-check-'))
}
