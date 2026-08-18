import type { ReviewedQuestion, ReviewedWorkedExample } from './curriculum-reviewed-social10'
import type { TextbookUnitContentV14 } from './curriculum-textbook-v14'
import {
  buildMisconceptions,
  choiceQuestion,
  cleanConcepts,
  formalQuestionSet,
  quickCheckSet,
  responseQuestion,
  seededInt,
  stableHash,
  unitObjectives,
  unitOverview,
  visualSet,
  type V21SubjectBuild,
  type V21UnitContext,
} from './curriculum-v21-common'

type MathFamily =
  | 'number'
  | 'operations'
  | 'factors'
  | 'fraction-decimal'
  | 'ratio-rate'
  | 'measurement'
  | 'geometry'
  | 'root-pythagorean'
  | 'algebra'
  | 'quadratic'
  | 'function'
  | 'sequence'
  | 'statistics-probability'
  | 'exp-log'
  | 'trigonometry'
  | 'vector'
  | 'matrix'
  | 'calculus'
  | 'modeling-project'

type MathCase = {
  context: string
  prompt: string
  answer: string
  distractors: string[]
  steps: string[]
  explanation: string
}

function mathFamily(context: V21UnitContext): MathFamily {
  const text = `${context.unit.title} ${context.unit.focus}`
  if (/極限|微分|積分|導數|變化率/.test(text)) return 'calculus'
  if (/矩陣/.test(text)) return 'matrix'
  if (/向量/.test(text)) return 'vector'
  if (/三角比|三角函數/.test(text)) return 'trigonometry'
  if (/指數|對數|科學記號|成長與財務/.test(text)) return 'exp-log'
  if (/二次方程式|二次函數/.test(text)) return 'quadratic'
  if (/平方根|畢氏/.test(text)) return 'root-pythagorean'
  if (/排列組合|機率|統計|資料分析|資料判讀|統計圖表|風險/.test(text)) return 'statistics-probability'
  if (/數列|級數|規律/.test(text)) return 'sequence'
  if (/函數|坐標|座標|正反比|圖表與建模/.test(text)) return 'function'
  if (/方程|不等式|代數|多項式|因式|乘法公式|未知數|線性關係|數量關係/.test(text)) return 'algebra'
  if (/因數|倍數/.test(text)) return 'factors'
  if (/分數|小數/.test(text)) return 'fraction-decimal'
  if (/百分|比率|比例|比值|速率/.test(text)) return 'ratio-rate'
  if (/角度|幾何|圖形|圓|相似|平面|立體|形狀|空間/.test(text)) return 'geometry'
  if (/長度|容量|重量|時間|日曆|面積|體積|周長|測量/.test(text)) return 'measurement'
  if (/加法|減法|乘法|除法|四則|整數運算|計算與應用/.test(text)) return 'operations'
  if (/100\s*以內|1000\s*以內|10000\s*以內|大數|實數/.test(text)) return 'number'
  if (/統整|專題|應用|素養/.test(text)) return 'modeling-project'
  return 'modeling-project'
}

function familyLabel(family: MathFamily) {
  const labels: Record<MathFamily, string> = {
    number: '數與位值',
    operations: '運算與數量關係',
    factors: '因數、倍數與整除',
    'fraction-decimal': '分數與小數',
    'ratio-rate': '比、比例、百分率與速率',
    measurement: '測量、單位與量感',
    geometry: '幾何關係與空間推理',
    'root-pythagorean': '平方根與畢氏關係',
    algebra: '代數式、方程與不等式',
    quadratic: '二次式、二次方程與二次函數',
    function: '函數、坐標與圖形',
    sequence: '規律、數列與級數',
    'statistics-probability': '資料分析、統計與機率',
    'exp-log': '指數、科學記號與對數',
    trigonometry: '三角比與三角函數',
    vector: '向量與幾何表示',
    matrix: '矩陣與線性關係',
    calculus: '極限、微分與積分',
    'modeling-project': '數學建模與整合',
  }
  return labels[family]
}

function numberLimit(context: V21UnitContext) {
  const text = context.unit.title
  if (/100\s*以內/.test(text)) return 100
  if (/1000\s*以內/.test(text)) return 1000
  if (/10000\s*以內/.test(text)) return 10000
  return context.grade <= 2 ? 1000 : context.grade <= 4 ? 100000 : 1000000
}

function mathCase(context: V21UnitContext, family: MathFamily, index: number): MathCase {
  const seed = stableHash(`${context.unit.id}-${family}-${index}`)
  const n = (min: number, max: number, shift = 0) => seededInt(seed + shift * 7919, min, max)

  if (family === 'number') {
    const limit = numberLimit(context)
    const a = n(Math.max(10, Math.floor(limit * 0.18)), Math.max(20, Math.floor(limit * 0.72)), 1)
    const b = n(Math.max(10, Math.floor(limit * 0.18)), Math.max(20, Math.floor(limit * 0.72)), 2)
    const left = Math.min(a, limit)
    const right = Math.min(b, limit)
    const answer = left === right ? '兩數相等' : left > right ? `${left} 較大` : `${right} 較大`
    return {
      context: `比較 ${left} 與 ${right}。兩個數都在「${context.unit.title}」要求的數量範圍內。`,
      prompt: `依位值由高位往低位比較，哪一個判斷正確？`,
      answer,
      distractors: [left > right ? `${right} 較大` : `${left} 較大`, '只比較個位數就能決定', '位數相同時不需要再比較'],
      steps: ['先確認兩數位數', '從最高位開始比較', '第一次出現不同數字的位置就能決定大小', '用數線或讀數再檢查一次'],
      explanation: `位值比較要從最高位開始，不能只看最後一位。${left} 與 ${right} 的大小由第一個不同的高位數字決定。`,
    }
  }

  if (family === 'operations') {
    const useMultiply = /乘法|除法/.test(context.unit.title)
    if (useMultiply) {
      const a = n(3, context.grade <= 3 ? 9 : 18, 1)
      const b = n(2, context.grade <= 3 ? 9 : 14, 2)
      const product = a * b
      return {
        context: `每盒有 ${a} 枝筆，共有 ${b} 盒。`,
        prompt: `總共有多少枝筆？`,
        answer: String(product),
        distractors: [String(a + b), String(product - a), String(product + b)],
        steps: [`把「每盒 ${a} 枝」重複 ${b} 次`, `列式 ${a} × ${b}`, `算得 ${product}`, `用 ${product} ÷ ${b} = ${a} 反向檢查`],
        explanation: `相同份量重複出現用乘法表示，所以 ${a} × ${b} = ${product}。反向用除法可以檢查乘法結果。`,
      }
    }
    const a = n(35, context.grade <= 2 ? 90 : 480, 1)
    const b = n(8, Math.max(12, Math.floor(a * 0.6)), 2)
    const result = /減法/.test(context.unit.title) ? a - b : a + b
    const op = /減法/.test(context.unit.title) ? '-' : '+'
    return {
      context: `記錄表中第一筆是 ${a}，第二筆是 ${b}。本題練習「${context.unit.title}」的運算意義。`,
      prompt: `計算 ${a} ${op} ${b}。`,
      answer: String(result),
      distractors: [String(a + b), String(Math.abs(a - b)), String(result + 10)],
      steps: ['先判斷題目要求的運算', `列式 ${a} ${op} ${b}`, '依位值正確對齊計算', '用估算或逆運算檢查'],
      explanation: `${a} ${op} ${b} = ${result}。計算後可用相反運算或估算確認結果大小合理。`,
    }
  }

  if (family === 'factors') {
    const p = [2, 3, 5, 7][n(0, 3, 1)]
    const q = [3, 4, 5, 6, 8][n(0, 4, 2)]
    const a = p * q
    const b = p * (q + 2)
    const answer = String(p)
    return {
      context: `兩個整數是 ${a} 與 ${b}。`,
      prompt: `下列哪個數一定同時是 ${a} 與 ${b} 的因數？`,
      answer,
      distractors: [String(q), String(q + 2), String(a + b)],
      steps: [`分解 ${a} 與 ${b} 的因數`, '找兩者共同出現的因數', `確認 ${a} ÷ ${p}、${b} ÷ ${p} 都是整數`, '區分「共同因數」與「兩數相加」'],
      explanation: `${a} 和 ${b} 都可以被 ${p} 整除，所以 ${p} 是共同因數。判斷因數要檢查整除，而不是只看數字大小。`,
    }
  }

  if (family === 'fraction-decimal') {
    const denominator = [4, 5, 8, 10][n(0, 3, 1)]
    const numerator = n(1, denominator - 1, 2)
    const decimal = numerator / denominator
    const answer = Number(decimal.toFixed(3)).toString()
    return {
      context: `一個整體被平均分成 ${denominator} 份，其中取 ${numerator} 份。`,
      prompt: `分數 ${numerator}/${denominator} 化成小數是多少？`,
      answer,
      distractors: [String(denominator / numerator), `0.${numerator}${denominator}`, String(numerator + denominator)],
      steps: [`把 ${numerator}/${denominator} 看成 ${numerator} ÷ ${denominator}`, '完成除法', `得到 ${answer}`, '用乘回分母或估算檢查'],
      explanation: `分數 a/b 就是 a ÷ b，所以 ${numerator} ÷ ${denominator} = ${answer}。`,
    }
  }

  if (family === 'ratio-rate') {
    if (/速率/.test(context.unit.title)) {
      const hours = n(2, 5, 1)
      const speed = n(35, 75, 2)
      const distance = hours * speed
      return {
        context: `一台車以平均每小時 ${speed} 公里行駛 ${hours} 小時。`,
        prompt: `依「距離＝速率×時間」，共行駛多少公里？`,
        answer: String(distance),
        distractors: [String(speed + hours), String(distance / hours), String(distance - speed)],
        steps: ['確認速率單位是公里/小時', `列式 ${speed} × ${hours}`, `算得 ${distance}`, '把答案單位寫成公里'],
        explanation: `距離 = 速率 × 時間 = ${speed} × ${hours} = ${distance} 公里。`,
      }
    }
    const total = n(80, 240, 1)
    const percent = [15, 20, 25, 30, 40][n(0, 4, 2)]
    const result = total * percent / 100
    return {
      context: `共有 ${total} 份資料，其中 ${percent}% 符合條件。`,
      prompt: `${total} 的 ${percent}% 是多少？`,
      answer: String(result),
      distractors: [String(percent), String(total - result), String(total + result)],
      steps: [`把 ${percent}% 化成 ${percent / 100}`, `列式 ${total} × ${percent / 100}`, `算得 ${result}`, '檢查結果應小於或等於總量'],
      explanation: `百分率表示每 100 份中的比例，所以 ${total} × ${percent / 100} = ${result}。`,
    }
  }

  if (family === 'measurement') {
    if (/時間|日曆/.test(context.unit.title)) {
      const startHour = n(7, 14, 1)
      const startMin = [5, 15, 20, 30, 40][n(0, 4, 2)]
      const duration = [35, 45, 55, 70, 85][n(0, 4, 3)]
      const total = startHour * 60 + startMin + duration
      const h = Math.floor(total / 60)
      const m = total % 60
      const answer = `${h}:${String(m).padStart(2, '0')}`
      return {
        context: `活動在 ${startHour}:${String(startMin).padStart(2, '0')} 開始，持續 ${duration} 分鐘。`,
        prompt: `活動結束時間是幾點？`,
        answer,
        distractors: [`${startHour}:${String((startMin + duration) % 60).padStart(2, '0')}`, `${h + 1}:${String(m).padStart(2, '0')}`, `${startHour}:${String(startMin).padStart(2, '0')}`],
        steps: ['把起始時間換成分鐘或分段加', `加上 ${duration} 分鐘`, '超過 60 分鐘就進 1 小時', `得到 ${answer}`],
        explanation: `時間計算要處理 60 分鐘進 1 小時，因此結果是 ${answer}。`,
      }
    }
    if (/面積/.test(context.unit.title)) {
      const a = n(5, 18, 1); const b = n(3, 12, 2); const area = a * b
      return { context: `長方形長 ${a} 公分、寬 ${b} 公分。`, prompt: '面積是多少平方公分？', answer: String(area), distractors: [String(2 * (a + b)), String(a + b), String(area * 2)], steps: ['辨認求的是面積', `列式 ${a} × ${b}`, `算得 ${area}`, '答案使用平方公分'], explanation: `長方形面積 = 長 × 寬 = ${a} × ${b} = ${area} 平方公分。` }
    }
    if (/體積/.test(context.unit.title)) {
      const a = n(2, 8, 1); const b = n(2, 7, 2); const c = n(2, 6, 3); const volume = a * b * c
      return { context: `長方體長 ${a} 公分、寬 ${b} 公分、高 ${c} 公分。`, prompt: '體積是多少立方公分？', answer: String(volume), distractors: [String(a + b + c), String(a * b), String(2 * (a * b + b * c + a * c))], steps: ['確認三個互相垂直的長度', `列式 ${a} × ${b} × ${c}`, `算得 ${volume}`, '使用立方公分'], explanation: `長方體體積 = 長 × 寬 × 高 = ${volume} 立方公分。` }
    }
    const length = n(120, 480, 1)
    const cm = length % 100
    const m = Math.floor(length / 100)
    return { context: `一條繩子長 ${length} 公分。`, prompt: '換成公尺與公分是多少？', answer: `${m} 公尺 ${cm} 公分`, distractors: [`${length} 公尺`, `${m + cm} 公尺`, `${cm} 公尺 ${m} 公分`], steps: ['使用 100 公分 = 1 公尺', `把 ${length} ÷ 100`, `商是 ${m}、餘數 ${cm}`, '寫成公尺與公分'], explanation: `${length} 公分 = ${m} 公尺 ${cm} 公分。` }
  }

  if (family === 'geometry') {
    if (/圓/.test(context.unit.title)) {
      const radius = n(3, 9, 1)
      const diameter = radius * 2
      return { context: `一個圓的半徑是 ${radius} 公分。`, prompt: '這個圓的直徑是多少公分？', answer: String(diameter), distractors: [String(radius), String(radius + 1), String(radius * radius)], steps: ['辨認半徑是圓心到圓周', '直徑通過圓心並連接兩個圓周點', `直徑 = 2 × ${radius}`, `得到 ${diameter}`], explanation: `直徑是半徑的 2 倍，所以是 ${diameter} 公分。` }
    }
    if (/相似/.test(context.unit.title)) {
      const k = n(2, 4, 1); const side = n(3, 8, 2); const target = k * side
      return { context: `兩個相似三角形的對應邊比為 1:${k}，小三角形某邊長 ${side} 公分。`, prompt: '大三角形對應邊長是多少公分？', answer: String(target), distractors: [String(side + k), String(side / k), String(target + k)], steps: ['找出對應邊', `確認放大倍率 ${k}`, `計算 ${side} × ${k}`, `得到 ${target}`], explanation: `相似圖形的對應邊按同一比例變化，因此 ${side} × ${k} = ${target}。` }
    }
    const a = n(35, 75, 1); const b = n(40, 80, 2); const c = 180 - a - b
    return { context: `一個三角形兩個內角分別是 ${a}°、${b}°。`, prompt: '第三個內角是多少度？', answer: String(c), distractors: [String(a + b), String(360 - a - b), String(Math.abs(a - b))], steps: ['使用三角形內角和 180°', `列式 180 - ${a} - ${b}`, `算得 ${c}`, '三角形三角相加再檢查'], explanation: `三角形內角和是 180°，所以第三角為 ${c}°。` }
  }

  if (family === 'root-pythagorean') {
    const triples = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17]] as const
    const [a, b, c] = triples[n(0, triples.length - 1, 1)]
    return { context: `直角三角形兩股長為 ${a} 與 ${b}。`, prompt: '斜邊長是多少？', answer: String(c), distractors: [String(a + b), String(Math.abs(a - b)), String(a * b)], steps: [`使用 a²+b²=c²`, `${a}²+${b}²=${a * a + b * b}`, `開平方得到 ${c}`, '確認斜邊比兩股都長'], explanation: `${a}² + ${b}² = ${c}²，所以斜邊長 ${c}。` }
  }

  if (family === 'algebra') {
    if (/不等式/.test(context.unit.title)) {
      const bound = n(4, 15, 1); const add = n(2, 8, 2); const rhs = bound + add
      return { context: `條件是 x + ${add} < ${rhs}。`, prompt: '解這個一元一次不等式。', answer: `x < ${bound}`, distractors: [`x > ${bound}`, `x < ${rhs}`, `x = ${bound}`], steps: [`兩邊同減 ${add}`, `得到 x < ${rhs - add}`, '不乘除負數，因此不等號方向不變', '代入一個小於邊界的值檢查'], explanation: `x + ${add} < ${rhs} 兩邊同減 ${add}，得到 x < ${bound}。` }
    }
    if (/多項式|乘法公式|因式/.test(context.unit.title)) {
      const a = n(2, 6, 1); const b = n(1, 7, 2)
      const answer = `x² + ${a + b}x + ${a * b}`
      return { context: `展開 (x + ${a})(x + ${b})。`, prompt: '正確結果是哪一個？', answer, distractors: [`x² + ${a * b}x + ${a + b}`, `x² + ${a + b}`, `2x + ${a + b}`], steps: ['每一項都要互乘', `x·x=x²`, `交叉項合併成 ${a + b}x`, `常數項 ${a}×${b}=${a * b}`], explanation: `(x+${a})(x+${b}) = x² + ${a + b}x + ${a * b}。` }
    }
    const coefficient = n(2, 9, 1); const x = n(2, 12, 2); const constant = n(1, 8, 3); const rhs = coefficient * x + constant
    return { context: `方程式 ${coefficient}x + ${constant} = ${rhs}。`, prompt: 'x 等於多少？', answer: String(x), distractors: [String(rhs - constant), String(x + constant), String(Math.floor(rhs / coefficient))], steps: [`兩邊同減 ${constant}`, `得到 ${coefficient}x=${rhs - constant}`, `兩邊同除 ${coefficient}`, `x=${x}，代回檢查`], explanation: `等式兩邊做相同運算可保持相等，最後得到 x=${x}。` }
  }

  if (family === 'quadratic') {
    const r1 = n(1, 5, 1); const r2 = n(2, 7, 2); const sum = r1 + r2; const prod = r1 * r2
    if (/函數/.test(context.unit.title)) {
      const h = n(-3, 3, 3); const k = n(-4, 5, 4)
      return { context: `二次函數 y=(x-${h})²+${k}。`, prompt: '此拋物線的頂點為何？', answer: `(${h}, ${k})`, distractors: [`(${-h}, ${k})`, `(${h}, ${-k})`, `(0, ${k})`], steps: ['辨認頂點式 y=(x-h)²+k', `讀出 h=${h}`, `讀出 k=${k}`, `頂點 (${h}, ${k})`], explanation: `頂點式直接給出頂點 (h,k)，因此為 (${h}, ${k})。` }
    }
    return { context: `解方程式 x² - ${sum}x + ${prod} = 0。`, prompt: '解集合是哪一組？', answer: `x = ${r1} 或 ${r2}`, distractors: [`x = ${sum}`, `x = ${prod}`, `x = -${r1} 或 -${r2}`], steps: [`找兩數乘積 ${prod}、和 ${sum}`, `因式分解成 (x-${r1})(x-${r2})=0`, '使用零乘積性質', `得到 x=${r1} 或 ${r2}`], explanation: `因式分解後兩因式任一為 0，因此兩個解為 ${r1}、${r2}。` }
  }

  if (family === 'function') {
    const slope = n(1, 5, 1); const intercept = n(-4, 6, 2); const x = n(2, 8, 3); const y = slope * x + intercept
    return { context: `函數 y=${slope}x${intercept >= 0 ? '+' : ''}${intercept}，取 x=${x}。`, prompt: '對應的 y 值是多少？', answer: String(y), distractors: [String(slope + x + intercept), String(slope * x), String(y + slope)], steps: [`把 x=${x} 代入函數`, `${slope}×${x}${intercept >= 0 ? '+' : ''}${intercept}`, `算得 y=${y}`, '用坐標點 (${x},'+y+') 檢查'], explanation: `函數值由代入得到：y=${slope}×${x}${intercept >= 0 ? '+' : ''}${intercept}=${y}。` }
  }

  if (family === 'sequence') {
    const first = n(2, 12, 1); const d = n(2, 8, 2); const pos = n(5, 10, 3); const value = first + (pos - 1) * d
    return { context: `等差數列首項 ${first}、公差 ${d}。`, prompt: `第 ${pos} 項是多少？`, answer: String(value), distractors: [String(first + pos * d), String(first * pos), String(value - d)], steps: ['使用 aₙ=a₁+(n-1)d', `代入 ${first}+(${pos}-1)×${d}`, `算得 ${value}`, '用前後項差皆為公差檢查'], explanation: `第 ${pos} 項 = ${first}+${pos - 1}×${d}=${value}。` }
  }

  if (family === 'statistics-probability') {
    if (/機率|風險|排列組合/.test(context.unit.title)) {
      const red = n(2, 6, 1); const blue = n(3, 8, 2); const total = red + blue
      return { context: `袋中有 ${red} 顆紅球、${blue} 顆藍球，隨機取 1 顆。`, prompt: '取到紅球的機率是多少？', answer: `${red}/${total}`, distractors: [`${blue}/${total}`, `${red}/${blue}`, `1/${red}`], steps: [`總樣本數 ${total}`, `符合事件有 ${red} 種等可能結果`, `機率=${red}/${total}`, '確認機率介於 0 與 1'], explanation: `等可能情況下，機率=有利結果數/全部結果數，所以是 ${red}/${total}。` }
    }
    const a = n(5, 15, 1); const data = [a, a + 2, a + 4, a + 6, a + 8]; const mean = a + 4
    return { context: `五筆資料為 ${data.join('、')}。`, prompt: '平均數是多少？', answer: String(mean), distractors: [String(data[0]), String(data[4]), String(data.reduce((s, v) => s + v, 0))], steps: ['把五筆資料相加', `總和 ${mean * 5}`, '除以資料筆數 5', `得到 ${mean}`], explanation: `平均數 = 總和 ÷ 筆數 = ${mean * 5} ÷ 5 = ${mean}。` }
  }

  if (family === 'exp-log') {
    if (/對數/.test(context.unit.title)) {
      const exponent = n(2, 5, 1); const value = 10 ** exponent
      return { context: `因為 10^${exponent}=${value}。`, prompt: `log₁₀(${value}) 等於多少？`, answer: String(exponent), distractors: [String(value), String(exponent * 10), String(exponent - 1)], steps: ['對數回答「底數要乘方幾次」', `找 10 的幾次方等於 ${value}`, `10^${exponent}=${value}`, `所以 log₁₀(${value})=${exponent}`], explanation: `對數與指數互為反運算，因此答案是 ${exponent}。` }
    }
    const coefficient = n(12, 89, 1) / 10; const exponent = n(3, 7, 2); const answer = `${coefficient} × 10^${exponent}`
    return { context: `要把 ${Math.round(coefficient * 10 ** exponent).toLocaleString('en-US')} 寫成 1≤a<10 的科學記號。`, prompt: '正確表示是哪一個？', answer, distractors: [`${coefficient * 10} × 10^${exponent - 1}`, `${coefficient} × 10^${exponent - 1}`, `${coefficient / 10} × 10^${exponent}`], steps: ['把小數點移到第一個非零數字後', `係數為 ${coefficient}`, `記錄移動 ${exponent} 位`, `寫成 ${answer}`], explanation: `標準科學記號的係數需介於 1 與 10，所以是 ${answer}。` }
  }

  if (family === 'trigonometry') {
    const triples = [[3, 4, 5], [5, 12, 13], [8, 15, 17]] as const
    const [opp, adj, hyp] = triples[n(0, triples.length - 1, 1)]
    return { context: `直角三角形相對於角 θ，對邊=${opp}、鄰邊=${adj}、斜邊=${hyp}。`, prompt: 'sin θ 等於多少？', answer: `${opp}/${hyp}`, distractors: [`${adj}/${hyp}`, `${opp}/${adj}`, `${hyp}/${opp}`], steps: ['先以角 θ 判斷對邊與斜邊', 'sin=對邊/斜邊', `代入 ${opp}/${hyp}`, '確認比值不大於 1'], explanation: `sin θ 定義為對邊/斜邊，因此是 ${opp}/${hyp}。` }
  }

  if (family === 'vector') {
    const ax = n(-4, 6, 1); const ay = n(-4, 6, 2); const bx = n(-4, 6, 3); const by = n(-4, 6, 4)
    return { context: `向量 a=(${ax},${ay})，b=(${bx},${by})。`, prompt: 'a+b 是多少？', answer: `(${ax + bx},${ay + by})`, distractors: [`(${ax - bx},${ay - by})`, `(${ax + by},${ay + bx})`, `(${ax * bx},${ay * by})`], steps: ['對應分量相加', `x 分量 ${ax}+${bx}=${ax + bx}`, `y 分量 ${ay}+${by}=${ay + by}`, '寫成有序對'], explanation: `向量加法逐分量相加，所以得到 (${ax + bx},${ay + by})。` }
  }

  if (family === 'matrix') {
    const a = n(1, 5, 1); const b = n(1, 5, 2); const c = n(1, 5, 3); const d = n(1, 5, 4)
    return { context: `矩陣 A=[[${a},${b}],[${c},${d}]]，向量 v=[1,2]ᵀ。`, prompt: 'Av 的第一個分量是多少？', answer: String(a + 2 * b), distractors: [String(a + b), String(c + 2 * d), String(2 * a + b)], steps: ['第一列與向量做內積', `${a}×1+${b}×2`, `算得 ${a + 2 * b}`, '第二列另外計算，不和第一列混在一起'], explanation: `矩陣乘向量的第一分量由第一列和向量內積得到，所以是 ${a + 2 * b}。` }
  }

  if (family === 'calculus') {
    if (/積分/.test(context.unit.title)) {
      const k = n(2, 6, 1); const upper = n(2, 5, 2); const result = k * upper * upper / 2
      return { context: `求 ∫₀^${upper} ${k}x dx。`, prompt: '定積分值是多少？', answer: String(result), distractors: [String(k * upper), String(k * upper * upper), String(result + k)], steps: [`${k}x 的原始函數為 ${k / 2}x²`, `代入上限 ${upper}`, '減去下限 0 的值', `得到 ${result}`], explanation: `∫₀^${upper} ${k}x dx = [${k / 2}x²]₀^${upper} = ${result}。` }
    }
    const a = n(2, 6, 1); const b = n(-5, 7, 2); const x = n(1, 5, 3); const slope = 2 * a * x + b
    return { context: `函數 f(x)=${a}x²${b >= 0 ? '+' : ''}${b}x。`, prompt: `在 x=${x} 時，瞬時變化率 f'(${x}) 是多少？`, answer: String(slope), distractors: [String(a * x + b), String(2 * a + b), String(a * x * x + b * x)], steps: [`先求導 f'(x)=${2 * a}x${b >= 0 ? '+' : ''}${b}`, `代入 x=${x}`, `算得 ${slope}`, '區分函數值與導數值'], explanation: `導數描述瞬時變化率，f'(x)=${2 * a}x${b >= 0 ? '+' : ''}${b}，代入得 ${slope}。` }
  }

  const x = n(2, 8, 1); const rate = n(3, 7, 2); const fixed = n(10, 35, 3); const total = fixed + rate * x
  return { context: `某方案固定費 ${fixed} 元，每單位再增加 ${rate} 元。使用量為 ${x} 時。`, prompt: '總費用是多少？', answer: String(total), distractors: [String(fixed + rate), String(rate * x), String(total + fixed)], steps: ['把固定量和變動量分開', `變動量 ${rate}×${x}=${rate * x}`, `加上固定費 ${fixed}`, `總費用 ${total}`], explanation: `建模時先把關係寫成 y=${fixed}+${rate}x，再代入 x=${x} 得 ${total}。` }
}

function exampleFromCase(context: V21UnitContext, family: MathFamily, index: number): ReviewedWorkedExample {
  const item = mathCase(context, family, index)
  return {
    title: `${familyLabel(family)}例題 ${index + 1}`,
    context: item.context,
    prompt: item.prompt,
    steps: item.steps,
    answer: item.answer,
    explanation: item.explanation,
  }
}

function questionFromCase(context: V21UnitContext, family: MathFamily, index: number, id: string, level: '理解' | '應用' | '檢核'): ReviewedQuestion {
  const item = mathCase(context, family, index + 7)
  if (index % 5 === 4) {
    return responseQuestion({
      id,
      level,
      context: item.context,
      prompt: `${item.prompt} 請寫出列式或關鍵推理，不能只寫最後答案。`,
      sampleAnswer: `${item.steps.join(' → ')}，所以答案為 ${item.answer}。`,
      explanation: item.explanation,
      rubric: ['列出正確的數學關係或公式', '計算／推理過程正確', '答案與單位或符號完整'],
    })
  }
  return choiceQuestion({ id, level, context: item.context, prompt: item.prompt, correct: item.answer, distractors: item.distractors, explanation: item.explanation })
}

function familyMisconceptions(context: V21UnitContext, family: MathFamily) {
  const byFamily: Record<MathFamily, Array<{ wrong: string; right: string; why: string }>> = {
    number: [
      { wrong: '位數相同時，只看個位數就能比較整個數的大小。', right: '位數相同要從最高位開始逐位比較。', why: '高位的單位價值大於低位；第一個不同的高位已決定整體大小。' },
      { wrong: '0 出現在數字中間時可以直接省略。', right: '0 可能是重要的佔位符，不能任意刪除。', why: '例如 405 與 45 的位值完全不同。' },
    ],
    operations: [
      { wrong: '看到兩個數就先相加。', right: '先判斷情境是合併、比較、增加、減少、等組或平均分，再選運算。', why: '同樣的兩個數可能對應完全不同的運算關係。' },
      { wrong: '直式計算只要數字排整齊，不必對齊位值。', right: '個位、十位、百位必須按位值對齊。', why: '位值錯位會讓每一欄代表不同單位，計算就失去意義。' },
    ],
    factors: [
      { wrong: '比原數小的數都是它的因數。', right: '因數必須能整除原數。', why: '大小不是判準，整除才是因數定義。' },
      { wrong: '倍數一定比原數大。', right: '正整數脈絡中原數本身也是它的倍數。', why: 'n=1 時，原數×1仍是原數。' },
    ],
    'fraction-decimal': [
      { wrong: '分母越大，分數一定越大。', right: '比較分數要同時看分子與分母；同分子時分母越大反而每份越小。', why: '分母代表平均分成幾份，不是單獨代表數值大小。' },
      { wrong: '小數位數較多的數一定較大。', right: '小數比較要依位值逐位比較。', why: '例如 0.8 = 0.80，位數多不代表值更大。' },
    ],
    'ratio-rate': [
      { wrong: '百分率的數字可以直接當成實際人數。', right: '百分率要乘上總量才得到實際數量。', why: '25% 是比例，不是「25 人」。' },
      { wrong: '速率只比較距離，不需要看時間。', right: '速率是單位時間內的距離，距離與時間要一起考慮。', why: '走得遠可能只是花得時間更多。' },
    ],
    measurement: [
      { wrong: '不同單位的數值可以直接相加。', right: '先換成相同單位再運算。', why: '1 公尺與 1 公分代表不同大小的量。' },
      { wrong: '面積與周長都用同一種單位。', right: '周長用長度單位，面積用平方單位，體積用立方單位。', why: '三者描述的量綱不同。' },
    ],
    geometry: [
      { wrong: '圖看起來比較長，就一定能當作正式長度證據。', right: '幾何推理依題目條件、標示與定理，不能只靠未按比例的圖。', why: '示意圖可能為了清楚而不按真實比例繪製。' },
      { wrong: '三角形三個角可以任意指定。', right: '平面三角形內角和必須為 180°。', why: '角度條件彼此受到幾何關係限制。' },
    ],
    'root-pythagorean': [
      { wrong: '畢氏定理可以套在任何三角形。', right: 'a²+b²=c² 的基本形式適用於直角三角形，c 是斜邊。', why: '缺少直角條件時不能直接套用。' },
      { wrong: '√(a+b)=√a+√b。', right: '平方根一般不能對加法直接拆開。', why: '例如 √(9+16)=5，但 3+4=7。' },
    ],
    algebra: [
      { wrong: '移項只是把符號換掉，與等式兩邊無關。', right: '所謂移項其實是在等式兩邊做相同的加減運算。', why: '理解等量公理才能避免符號機械化造成錯誤。' },
      { wrong: '2(x+3)=2x+3。', right: '分配律要把 2 乘到括號內每一項：2x+6。', why: '括號代表整體都受到外面的乘數作用。' },
    ],
    quadratic: [
      { wrong: '二次方程式一定只有一個解。', right: '實數範圍可能有兩個、一個或沒有實數解。', why: '解的個數與因式、判別式或圖形交點有關。' },
      { wrong: '二次函數的頂點就是 y 截距。', right: '頂點與 y 截距是不同概念；頂點由對稱軸與極值位置決定。', why: '只有特殊情況兩者才可能重合。' },
    ],
    function: [
      { wrong: '同一個 x 可以在函數中對應兩個不同的 y。', right: '函數要求每個允許的輸入 x 只對應一個輸出 y。', why: '這是函數關係的核心條件。' },
      { wrong: '圖線越高代表斜率一定越大。', right: '斜率看的是變化率，不是 y 值本身的高低。', why: '平移圖形可以改變高度但不改變斜率。' },
    ],
    sequence: [
      { wrong: '看到前幾項有規律，就已經唯一決定所有後續項。', right: '有限項可能符合多種規律；題目需給出規則或足夠條件。', why: '只憑少量項目不能把猜測當成唯一證明。' },
      { wrong: '等差數列第 n 項是 a₁+nd。', right: '第 n 項是 a₁+(n-1)d。', why: '從第 1 項走到第 n 項只跨過 n-1 次公差。' },
    ],
    'statistics-probability': [
      { wrong: '平均數永遠最能代表資料。', right: '要依資料分布與研究目的選平均數、中位數、眾數等摘要。', why: '極端值可能大幅影響平均數。' },
      { wrong: '機率 1/2 代表做兩次一定各出現一次。', right: '機率描述長期或隨機結果的可能性，不保證短期必然平均。', why: '單次或少數次試驗仍可能偏離理論比例。' },
    ],
    'exp-log': [
      { wrong: '10³ = 10×3。', right: '10³ = 10×10×10。', why: '指數表示相同底數重複相乘的次數。' },
      { wrong: '科學記號的係數可以任意大。', right: '標準科學記號 a×10ⁿ 要求 1≤|a|<10。', why: '統一係數範圍才能有一致且唯一的標準形式。' },
    ],
    trigonometry: [
      { wrong: 'sin、cos、tan 的對邊與鄰邊不需要指定角。', right: '對邊與鄰邊都相對於指定角 θ 定義。', why: '換參考角後，對邊與鄰邊可能互換。' },
      { wrong: 'sin θ = 鄰邊/斜邊。', right: 'sin θ=對邊/斜邊；cos θ=鄰邊/斜邊。', why: '三角比定義要和邊的位置正確對應。' },
    ],
    vector: [
      { wrong: '向量只有長度，沒有方向。', right: '向量同時包含大小與方向。', why: '方向不同即使長度相同，也是不同向量。' },
      { wrong: '向量相加就是把兩個長度相加。', right: '向量要按分量或平行四邊形法則相加。', why: '不同方向會影響合向量大小與方向。' },
    ],
    matrix: [
      { wrong: '矩陣乘法和一般數字乘法一樣可以任意交換順序。', right: '矩陣乘法一般不具交換律，AB 未必等於 BA。', why: '行列配對方式與維度順序會影響結果。' },
      { wrong: '只要兩個矩陣大小相同就一定可以相乘。', right: 'AB 可乘的條件是 A 的欄數等於 B 的列數。', why: '內維度必須相同才能做行列內積。' },
    ],
    calculus: [
      { wrong: '導數就是原函數在該點的 y 值。', right: '導數表示瞬時變化率／切線斜率，和函數值是不同量。', why: '同一點可同時有函數值與斜率兩種資訊。' },
      { wrong: '定積分只是一個不帶意義的反導數代入。', right: '定積分可表示帶符號的累積量，需注意區間與正負。', why: '幾何面積與帶符號積分在跨越 x 軸時並不完全相同。' },
    ],
    'modeling-project': [
      { wrong: '只要模型算得出數字，就代表模型一定正確。', right: '模型要檢查假設、單位、資料範圍與預測誤差。', why: '模型是現實的簡化；能算不代表假設適用。' },
      { wrong: '資料越多，不需要再考慮資料品質。', right: '資料來源、偏誤、缺漏與量測方式仍要檢查。', why: '大量低品質資料仍可能導向錯誤結論。' },
    ],
  }
  return buildMisconceptions({ familyLabel: familyLabel(family), pairs: byFamily[family] })
}

export function buildMathV21(context: V21UnitContext, base: TextbookUnitContentV14): V21SubjectBuild {
  const family = mathFamily(context)
  const label = familyLabel(family)
  const concepts = cleanConcepts(base, '數學上，')
  const misconceptions = familyMisconceptions(context, family)
  const workedExamples = Array.from({ length: 4 }, (_, index) => exampleFromCase(context, family, index))
  const questions = [
    ...quickCheckSet({
      unitId: context.unit.id,
      familyId: family,
      concepts,
      maker: (_concept, index, id) => questionFromCase(context, family, index, id, '理解'),
    }),
    ...formalQuestionSet({
      unitId: context.unit.id,
      familyId: family,
      makers: [
        (index, id, level) => questionFromCase(context, family, index, id, level),
        (index, id, level) => questionFromCase(context, family, index + 11, id, level),
        (index, id, level) => questionFromCase(context, family, index + 23, id, level),
      ],
    }),
  ]
  const visuals = visualSet({
    unitId: context.unit.id,
    familyLabel: label,
    concepts,
    process: [
      { label: '讀條件', detail: '先標出數量、單位、符號與限制。' },
      { label: '建立表示', detail: `用${label}的式子、圖形、表格或坐標表示關係。` },
      { label: '推理／計算', detail: '每一步都保留等量、比例、幾何或函數關係。' },
      { label: '檢查', detail: '用估算、代回、逆運算、範圍或圖形再驗證。' },
    ],
    compare: misconceptions.map((item, index) => ({ label: `迷思 ${index + 1}`, detail: `${item.claim} → ${item.correction}` })),
  })
  return {
    familyId: family,
    familyLabel: label,
    overview: unitOverview(context, label, `「${label}」中的定義、表示、運算與推理關係`),
    objectives: unitObjectives(context, label, ['依題意建立正確數學表示', '完成至少兩種不同情境的計算或推理', '用估算、代回或圖形檢查答案']),
    concepts,
    misconceptions,
    visuals,
    workedExamples,
    questions,
    takeaway: [
      `先辨認這題屬於「${label}」的哪一種關係。`,
      '列式、圖形或表格要能直接對應題目條件。',
      '答案除了算對，也要檢查符號、單位、範圍與合理性。',
      '遇到新題型時回到定義與關係，不背同一個數字答案。',
    ],
  }
}

export function getMathFamilyV21(context: V21UnitContext) {
  return mathFamily(context)
}
