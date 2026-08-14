import type { CurriculumQuestionEnhancement } from './curriculum-reviewed-content'
import { resolveCurriculumUnit } from './curriculum-plan-v5'
import type {
  ReviewedChoiceQuestion,
  ReviewedConcept,
  ReviewedQuestion,
  ReviewedResponseQuestion,
  ReviewedWorkedExample,
} from './curriculum-reviewed-social10'
import {
  validateTextbookUnitV14,
  type TextbookUnitContentV14,
} from './curriculum-textbook-v14'
import { getTextbookUnitContentV17 } from './curriculum-pedagogy-v17'

type EnhancedChoice = ReviewedChoiceQuestion & CurriculumQuestionEnhancement
type EnhancedResponse = ReviewedResponseQuestion & CurriculumQuestionEnhancement
type UnitContext = NonNullable<ReturnType<typeof resolveCurriculumUnit>>

type ConcreteTask = {
  context: string
  prompt: string
  options: string[]
  correctIndex: number
  explanation: string
}

const META_PATTERNS = /哪個做法最|最能正確使用|先確認量、單位與限制|題目提供一組具體|情境\s*\d+：請用|看到.*就立刻套|直接搬用|算出一個數字就停止|哪一個做法最可靠/

function compact(value: string, max = 96) {
  const clean = value.replace(/\s+/g, ' ').trim()
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).replace(/[，、；：,.!?。！？\s]+$/g, '')}…`
}

function uniqueOptions(correct: string, distractors: string[]) {
  const values = [correct, ...distractors].map((item) => String(item).trim()).filter(Boolean)
  const result: string[] = []
  for (const item of values) if (!result.includes(item)) result.push(item)
  while (result.length < 4) result.push(`其他不符合條件的結果 ${result.length + 1}`)
  return result.slice(0, 4)
}

function choiceFeedback(options: string[], correctIndex: number, explanation: string) {
  return options.map((_, index) => index === correctIndex
    ? `正確。${explanation}`
    : `這個選項和題目中的具體數字、文字或觀察條件不一致。${explanation}`)
}

function mathTask(text: string, index: number): ConcreteTask {
  if (/正數|負數|整數|數線|相反數|絕對值/.test(text)) {
    const start = (index % 2 === 0 ? 1 : -1) * (index + 2)
    const change = (index % 3 === 0 ? -1 : 1) * (index + 5)
    const result = start + change
    const correct = String(result)
    const options = uniqueOptions(correct, [String(start - change), String(Math.abs(result)), String(-result)])
    return {
      context: `氣象站把 0°C 當作基準。某次紀錄的起始氣溫是 ${start}°C，接著氣溫變化 ${change > 0 ? `+${change}` : change}°C。`,
      prompt: `起始 ${start}°C 再變化 ${change > 0 ? `+${change}` : change}°C 後，最後氣溫是多少？`,
      options,
      correctIndex: options.indexOf(correct),
      explanation: `把變化量連同正負號一起計算：${start} + (${change}) = ${result}。正負號表示相對於 0°C 的方向，因此答案要保留正負意義。`,
    }
  }
  if (/科學記號|指數|次方|冪/.test(text)) {
    const coefficient = 2 + (index % 7) + ((index % 3) * 0.1)
    const exponent = 3 + (index % 6)
    const value = coefficient * 10 ** exponent
    const correct = `${coefficient} × 10^${exponent}`
    const options = uniqueOptions(correct, [`${coefficient} × 10^${exponent - 1}`, `${coefficient / 10} × 10^${exponent}`, `${coefficient * 10} × 10^${exponent}`])
    return {
      context: `量測資料為 ${value.toLocaleString('en-US')}，要改寫成 a × 10^n，且 1 ≤ a < 10。`,
      prompt: `${value.toLocaleString('en-US')} 應寫成哪一個符合 1 ≤ a < 10 的科學記號？`,
      options,
      correctIndex: options.indexOf(correct),
      explanation: `把小數點移到第一個非零數字後，得到 ${coefficient}；共移動 ${exponent} 位，所以正確表示為 ${correct}。`,
    }
  }
  if (/分數|小數|百分|比率|比例|比值/.test(text)) {
    const total = 40 + index * 20
    const percent = 10 + ((index * 5) % 45)
    const result = total * percent / 100
    const correct = String(result)
    const options = uniqueOptions(correct, [String(total - result), String(percent), String(total + result)])
    return {
      context: `一項調查共有 ${total} 人，其中 ${percent}% 選擇同一方案。`,
      prompt: `${total} 人的 ${percent}% 是多少人？請直接算出實際人數。`,
      options,
      correctIndex: options.indexOf(correct),
      explanation: `百分率先化成 ${percent / 100}，再算 ${total} × ${percent / 100} = ${result}，所以實際人數是 ${result} 人。`,
    }
  }
  if (/方程|代數|未知數|一元|式子/.test(text)) {
    const each = 25 + index * 5
    const count = 3 + (index % 9)
    const total = each * count
    const correct = String(count)
    const options = uniqueOptions(correct, [String(count + 1), String(each), String(total - each)])
    return {
      context: `每張票 ${each} 元，小安買了 x 張，一共付 ${total} 元。`,
      prompt: `由 ${each}x = ${total} 求 x，實際買了幾張票？`,
      options,
      correctIndex: options.indexOf(correct),
      explanation: `等式兩邊同除以 ${each}，得到 x = ${total} ÷ ${each} = ${count}。代回原式可確認 ${each} × ${count} = ${total}。`,
    }
  }
  if (/幾何|角|三角|四邊|圓|面積|周長|體積|形狀/.test(text)) {
    const a = 6 + index
    const b = 3 + (index % 8)
    const area = a * b
    const correct = String(area)
    const options = uniqueOptions(correct, [String(2 * (a + b)), String(a + b), String(area * 2)])
    return {
      context: `一個長方形長 ${a} 公分、寬 ${b} 公分，所有尺寸都以公分為單位。`,
      prompt: `長 ${a} 公分、寬 ${b} 公分的長方形，面積是多少平方公分？`,
      options,
      correctIndex: options.indexOf(correct),
      explanation: `長方形面積使用長 × 寬：${a} × ${b} = ${area}，因此答案是 ${area} 平方公分，而不是周長。`,
    }
  }
  if (/統計|平均|中位|眾數|機率|資料|圖表/.test(text)) {
    const base = 5 + index * 2
    const data = [base, base + 2, base + 4, base + 4, base + 9]
    const median = data[2]
    const correct = String(median)
    const options = uniqueOptions(correct, [String(data[0]), String(data[4]), String(data.reduce((sum, item) => sum + item, 0))])
    return {
      context: `五筆資料已由小到大排成 ${data.join('、')}。`,
      prompt: `資料 ${data.join('、')} 的中位數是多少？`,
      options,
      correctIndex: options.indexOf(correct),
      explanation: `共有 5 筆且已排序，中間位置是第 3 筆，因此中位數是 ${median}；不需要把五筆全部相加。`,
    }
  }
  if (/時間|長度|重量|容量|測量|單位/.test(text)) {
    const start = 50 + index * 7
    const used = 8 + index * 2
    const remain = start - used
    const correct = String(remain)
    const options = uniqueOptions(correct, [String(start + used), String(used), String(start)])
    return {
      context: `一條緞帶原本長 ${start} 公分，製作作品時用掉 ${used} 公分。`,
      prompt: `${start} 公分用掉 ${used} 公分後，還剩多少公分？`,
      options,
      correctIndex: options.indexOf(correct),
      explanation: `剩餘長度用減法計算：${start} - ${used} = ${remain}。題目中的量都是長度，所以答案單位仍是公分。`,
    }
  }
  const total = 30 + index * 4
  const used = 6 + index
  const remain = total - used
  const correct = String(remain)
  const options = uniqueOptions(correct, [String(total + used), String(used), String(total)])
  return {
    context: `活動準備了 ${total} 份材料，第一階段實際用了 ${used} 份。`,
    prompt: `${total} 份材料用掉 ${used} 份後，剩下幾份？`,
    options,
    correctIndex: options.indexOf(correct),
    explanation: `剩餘量等於原有量減去已使用量：${total} - ${used} = ${remain}。再把結果和原有量比較，可確認答案大小合理。`,
  }
}

function scienceTask(text: string, index: number): ConcreteTask {
  if (/電|電流|電壓|電阻|電路/.test(text)) {
    const voltage = (1.5 + index * 0.5).toFixed(1)
    return {
      context: `實驗使用 ${voltage} V 電池，甲、乙兩顆相同燈泡串聯。把甲燈泡拆下後，導線中出現斷點。`,
      prompt: `使用 ${voltage} V 電池的這個串聯電路斷開後，乙燈泡會發生什麼事？`,
      options: ['熄滅，因為完整回路被切斷', '變得更亮，因為少一顆燈泡', '亮度完全不變', '只有電池停止作用但燈泡照常亮'],
      correctIndex: 0,
      explanation: `串聯電路必須形成完整閉合路徑才有持續電流。拆下一顆燈泡形成斷路後，乙燈泡也沒有電流通過，因此會熄滅。`,
    }
  }
  if (/力|運動|速度|摩擦|慣性/.test(text)) {
    const smooth = 80 + index * 6
    const rough = 35 + index * 3
    return {
      context: `同一台玩具車以相同起始速度出發，在光滑木板滑行 ${smooth} 公分，在粗糙布面只滑行 ${rough} 公分。`,
      prompt: `木板滑 ${smooth} 公分、布面滑 ${rough} 公分，哪個解釋最符合這組實際觀察？`,
      options: ['粗糙布面的摩擦作用較大，使車較快減速', '木板上的車質量在途中突然增加', '粗糙布面沒有重力', '兩個表面的摩擦作用一定完全相同'],
      correctIndex: 0,
      explanation: `起始條件相同而滑行距離明顯不同，最直接的差異是接觸面。粗糙布面造成較大的摩擦作用，所以玩具車較快減速並停下。`,
    }
  }
  if (/植物|動物|生物|細胞|器官|生態/.test(text)) {
    const hours = 4 + (index % 10)
    const days = 5 + index
    return {
      context: `兩盆同種幼苗在相同溫度與水量下生長 ${days} 天；甲盆每天照光 ${hours} 小時，乙盆完全遮光，再比較葉色與高度。`,
      prompt: `觀察 ${days} 天、甲盆每天照光 ${hours} 小時的實驗中，主要被刻意改變的條件是什麼？`,
      options: ['光照時間', '植物種類', '兩盆的溫度', '每盆使用的土壤量一定不同'],
      correctIndex: 0,
      explanation: `兩盆使用同種植物並控制溫度與水量，只有光照安排不同，因此光照時間是主要操縱變因，葉色與高度則是觀察結果。`,
    }
  }
  if (/水循環|天氣|氣候|蒸發|凝結|地球|岩石/.test(text)) {
    const waterTemp = 2 + (index % 7)
    const roomTemp = 24 + (index % 5)
    return {
      context: `室溫約 ${roomTemp}°C，透明杯中倒入約 ${waterTemp}°C 的冰水；數分鐘後杯外出現小水滴，但杯子沒有裂縫。`,
      prompt: `室溫 ${roomTemp}°C、杯中水溫約 ${waterTemp}°C 時，杯外小水滴主要從哪裡來？`,
      options: ['空氣中的水蒸氣在冷杯壁附近凝結', '杯內冰水大量穿過完整杯壁', '杯子本身製造出新的水', '空氣中的氧氣直接變成液態水'],
      correctIndex: 0,
      explanation: `冷杯壁使附近空氣降溫，空氣中的水蒸氣達到容易凝結的條件，於是形成杯外可見的小水滴；不是杯內液態水穿過杯壁。`,
    }
  }
  if (/月|太陽|行星|宇宙|天文|星/.test(text)) {
    const nights = 4 + index
    const time = 19 + (index % 3)
    return {
      context: `學生連續 ${nights} 晚都在晚上 ${time}:00 觀察月亮，記下方位、仰角與亮面形狀。`,
      prompt: `連續 ${nights} 晚固定在 ${time}:00 觀察月亮時，哪些紀錄最能比較月相與位置的逐日變化？`,
      options: ['每晚記日期、方位、仰角與亮面形狀', '只保存其中一晚的照片', '每天換不同時間且不留下時間紀錄', '只寫「今天月亮很亮」'],
      correctIndex: 0,
      explanation: `比較逐日變化需要保留日期並盡量固定觀察時間，同時記錄位置與亮面形狀；這樣才有可比較的連續證據。`,
    }
  }
  if (/光|聲|波|振動|熱|溫度/.test(text)) {
    const initial = 70 + index
    const minutes = 8 + index
    return {
      context: `把各 ${200 + index * 10} mL、初溫 ${initial}°C 的熱水分別倒入金屬杯與保麗龍杯，${minutes} 分鐘後量溫度。`,
      prompt: `要比較兩種杯子的保溫效果，這組初溫 ${initial}°C、觀察 ${minutes} 分鐘的實驗必須控制哪些條件？`,
      options: ['兩杯起始水量與水溫相同，並在相同環境、相同時間後量測', '兩杯使用不同水量才能比較', '一杯放室內、一杯放冰箱', '只用手摸杯外表就代替溫度量測'],
      correctIndex: 0,
      explanation: `公平比較容器材質時，水量、起始水溫、環境與經過時間都應盡量相同，主要只改變杯子材質，再比較最後量得的溫度。`,
    }
  }
  const center = 10 + index * 2
  const data = [center - 1, center, center + 2]
  return {
    context: `學生重複量測同一現象三次，得到 ${data.join('、')}，三次操作方式相同。`,
    prompt: `三次量測為 ${data.join('、')} 時，應如何處理這組接近但不完全相同的實驗資料？`,
    options: ['保留三筆資料，描述差異並檢查可能的量測誤差', '只留下最符合預期的一筆', '把三個數字全部改成一樣', '直接宣稱只要不同就是儀器故障'],
    correctIndex: 0,
    explanation: `重複量測出現小幅差異很常見。應保留原始資料、比較變動範圍並檢查量測方法，而不是刪除或任意修改不一致的數值。`,
  }
}

function socialTask(text: string, index: number): ConcreteTask {
  if (/位置|地圖|地理|地形|區域|交通|人口分布/.test(text)) {
    const near = 6 + index * 2
    const far = 2 + index
    return {
      context: `甲區距火車站 0.8 公里、近五年人口增加 ${near}%；乙區距車站 6.2 公里、同期人口增加 ${far}%。兩區其他條件仍可能不同。`,
      prompt: `甲區人口增 ${near}%、乙區增 ${far}% 且到車站距離不同，哪組資料最能進一步檢驗交通便利與人口分布的關係？`,
      options: ['同時比較兩區交通可及性、人口變化與其他可能影響因素', '只看甲區一張街景照片', '只詢問一位居民最喜歡哪一區', '只比較兩個地名的字數'],
      correctIndex: 0,
      explanation: `目前資料只能看到交通距離與人口變化同時不同。要進一步判斷兩者關係，還要系統比較交通可及性、人口資料及其他可能因素。`,
    }
  }
  if (/歷史|年代|時代|事件|變遷|近代|古代/.test(text)) {
    const year = 1900 + index * 5
    const later = year + 50
    return {
      context: `資料甲是 ${year} 年事件當時的報紙，資料乙是 ${later} 年學者根據多份檔案完成的研究；兩者對事件原因的解釋不同。`,
      prompt: `比較 ${year} 年報紙與 ${later} 年研究的不同解釋時，應先檢查哪些史料條件？`,
      options: ['作者、年代、寫作目的、資料來源與各自提出的證據', '只相信年代較早的資料', '只相信篇幅比較長的資料', '把兩份資料不同的地方全部當成錯誤'],
      correctIndex: 0,
      explanation: `史料的形成背景會影響內容。比較不同說法時，要連同作者位置、年代、目的與證據來源一起判讀，不能用早晚或篇幅直接決定真偽。`,
    }
  }
  if (/政府|公民|法律|權利|義務|民主|制度|政策/.test(text)) {
    const responses = 120 + index * 25
    return {
      context: `市政府準備調整公園規則，公開草案後收到 ${responses} 份意見，包含居民、學校、攤商與環保團體的不同需求。`,
      prompt: `面對 ${responses} 份不同立場的公共意見，哪種決策程序最能兼顧透明與權益？`,
      options: ['公開資訊、整理不同群體意見，最後說明採納與未採納的理由', '只聽人數最多的一方，其他意見全部不看', '不公布資料就直接決定', '永遠只採用最早提出的那一份意見'],
      correctIndex: 0,
      explanation: `公共決策涉及多方權益，程序應讓受影響者取得資訊並表達意見，決策者也要說明理由；這比只看人數或先後更符合透明與參與。`,
    }
  }
  if (/產業|經濟|消費|市場|貿易|資源/.test(text)) {
    const price = 8 + index
    const cost = 4 + (index % 7)
    return {
      context: `某商品今年售價上升 ${price}%，同期間原料運費增加 ${cost}%，市場需求也上升；目前沒有其他完整成本資料。`,
      prompt: `售價增 ${price}%、運費增 ${cost}% 且需求也變高時，根據現有資料可以下什麼程度的結論？`,
      options: ['成本與需求都可能相關，但仍需更多資料才能比較各因素影響', '一定只有運費造成價格上升', '一定只有需求造成價格上升', '價格變化一定與任何市場條件都無關'],
      correctIndex: 0,
      explanation: `多個因素同時變動時，現有資料不足以證明唯一原因。較穩妥的結論是列出可能因素，再蒐集更多資料比較各因素的影響。`,
    }
  }
  const year = 2010 + index
  const start = 35 + index
  const end = start + 7
  return {
    context: `某地 ${year} 年公共運輸使用率為 ${start}%，到 ${year + 3} 年升到 ${end}%，期間新增兩條公車路線。`,
    prompt: `${year} 到 ${year + 3} 年使用率由 ${start}% 升至 ${end}% 時，這組資料最穩妥能支持哪個說法？`,
    options: ['使用率上升與新增路線同時發生，但仍需更多資料判斷因果關係', '新增路線一定是唯一原因', '使用率其實下降', '這一地區的數字可以直接代表所有地區'],
    correctIndex: 0,
    explanation: `數據能直接支持使用率上升以及兩件事在同一期間發生，但還不能單靠這些資訊證明新增路線是唯一原因，也不能外推到所有地區。`,
  }
}

const ENGLISH_NAMES = ['Amy','Ben','Cindy','David','Ella','Frank','Grace','Henry','Ivy','Jack','Kelly','Leo','Mia','Noah','Olivia','Peter','Ruby','Sam','Tina','Victor','Wendy','Zack']
const WEEKDAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

function englishTask(text: string, index: number): ConcreteTask {
  const name = ENGLISH_NAMES[index % ENGLISH_NAMES.length]
  const day = WEEKDAYS[index % WEEKDAYS.length]
  const hour = 6 + (index % 6)
  if (/過去|past/i.test(text)) {
    const context = `Yesterday at ${hour}:00, ${name} visited a family member and helped prepare dinner.`
    return {
      context,
      prompt: `According to the sentence about ${name} at ${hour}:00 yesterday, which sentence correctly describes the completed event?`,
      options: [`${name} visited a family member.`, `${name} visits a family member tomorrow.`, `${name} is visit a family member yesterday.`, `${name} visiting a family member every day.`],
      correctIndex: 0,
      explanation: `The time word “yesterday” places the event in the past, so the completed past form “visited” matches both the time clue and the meaning of the sentence.`,
    }
  }
  if (/未來|future/i.test(text)) {
    return {
      context: `${name} has already made a plan for ${day} at ${hour}:00.` ,
      prompt: `Which sentence clearly expresses ${name}'s plan for ${day} at ${hour}:00?`,
      options: [`${name} is going to play basketball on ${day}.`, `${name} played basketball yesterday.`, `${name} plays basketball last ${day}.`, `${name} basketball ${day}.`],
      correctIndex: 0,
      explanation: `“Is going to + base verb” can express a future plan that has already been decided, and the ${day} time phrase keeps the sentence in the intended future context.`,
    }
  }
  if (/比較|compar/i.test(text)) {
    const light = 2 + index
    const heavy = light + 2
    return {
      context: `${name} weighs two bags: the blue bag is ${light} kg and the red bag is ${heavy} kg.`,
      prompt: `The blue bag is ${light} kg and the red bag is ${heavy} kg. Which comparison is grammatically and factually correct?`,
      options: ['The red bag is heavier than the blue bag.', 'The red bag is heavy than the blue bag.', 'The blue bag is more heavy the red bag.', 'The blue bag heavier than red bag is.'],
      correctIndex: 0,
      explanation: `Because ${heavy} kg is greater than ${light} kg, the red bag is heavier. The comparative form of “heavy” is “heavier,” followed by “than.”`,
    }
  }
  const minute = String((index * 5) % 60).padStart(2, '0')
  return {
    context: `${name} says, “I usually get up at ${hour}:${minute} on ${day} and walk to school after breakfast.”`,
    prompt: `In ${name}'s ${day} routine at ${hour}:${minute}, what does ${name} do after breakfast?`,
    options: ['Walks to school', 'Takes a plane', 'Goes back to bed for the whole day', 'Cooks dinner at midnight'],
    correctIndex: 0,
    explanation: `The sentence explicitly says “walk to school after breakfast,” so the answer comes directly from the stated routine rather than from a guess about daily habits.`,
  }
}

const CHINESE_NAMES = ['小安','小傑','雅婷','明哲','欣怡','冠宇','小晴','柏翰','怡君','子翔','詠恩','承翰','思妤','家豪','品妍','宇辰','妍希','祐嘉','宥寧','語彤','俊熙','采恩']

function chineseTask(text: string, index: number): ConcreteTask {
  const name = CHINESE_NAMES[index % CHINESE_NAMES.length]
  if (/修辭|譬喻|比喻/.test(text)) {
    const objects = ['雨點','晨霧','夕陽','浪花','落葉','星光','溪水','雲朵']
    const images = ['透明的珠子','薄薄的白紗','燃燒的橘色燈籠','奔跑的白馬','旋轉的小船','撒在黑布上的銀粉','滑過石頭的緞帶','慢慢移動的棉花']
    const object = objects[index % objects.length]
    const image = images[index % images.length]
    const sentence = `${object}像${image}，讓${name}停下腳步多看了一會兒。`
    return {
      context: `句子：「${sentence}」`,
      prompt: `在「${object}像${image}」這段描寫中，主要運用了哪一種表達方式？`,
      options: ['譬喻', '設問', '排比', '轉品'],
      correctIndex: 0,
      explanation: `句子使用「像」把「${object}」和「${image}」連結，藉由兩個事物的相似處形成具體形象，因此屬於譬喻。`,
    }
  }
  const day = index + 2
  const passage = `${name}第 ${day} 天練習上台朗讀。第一次只敢小聲念，這天卻主動舉手，還在讀完後問同學哪一句需要再調整。`
  return {
    context: `短文：「${passage}」`,
    prompt: `從「第 ${day} 天主動舉手，讀完還詢問同學」這些文字，可以直接看出 ${name} 有什麼變化？`,
    options: ['比之前更願意參與，也開始主動修正表現', '已經決定永遠不再朗讀', '完全不在意同學的意見', '文中證明他每次朗讀都一定滿分'],
    correctIndex: 0,
    explanation: `「主動舉手」和「詢問哪一句要調整」都是文中直接可找到的行動證據，支持人物更願意參與並主動修正；其他選項都超出文本。`,
  }
}

function lifeTask(index: number): ConcreteTask {
  const minutes = 5 + index
  const count = 3 + (index % 6)
  return {
    context: `生活課小組在校園觀察 ${minutes} 分鐘，記下 ${count} 個不同聲音來源，並標記「在哪裡、什麼時間、聽到什麼」。`,
    prompt: `觀察 ${minutes} 分鐘並記錄 ${count} 個聲音後，哪一份紀錄最能讓同學回頭比較觀察結果？`,
    options: ['同時保留地點、時間、聲音來源與實際描述', '只寫「今天很好玩」', '只記最喜歡的一個聲音，其他全部刪掉', '回教室後憑印象把所有聲音改成一樣'],
    correctIndex: 0,
    explanation: `生活探究要保留可回頭比較的實際紀錄。地點、時間、來源與描述都留下來，之後才能和其他組的觀察互相比較並討論差異。`,
  }
}

function concreteTask(context: UnitContext, concept: ReviewedConcept, index: number): ConcreteTask {
  const text = `${context.unit.title} ${context.unit.focus} ${concept.title}`
  if (context.pathway === 'life') return lifeTask(index)
  if (context.subject === 'math') return mathTask(text, index)
  if (context.subject === 'science') return scienceTask(text, index)
  if (context.subject === 'social') return socialTask(text, index)
  if (context.subject === 'english') return englishTask(text, index)
  return chineseTask(text, index)
}

function upgradeConcept(context: UnitContext, concept: ReviewedConcept, index: number): ReviewedConcept {
  const task = concreteTask(context, concept, index)
  const metaExample = !concept.example || META_PATTERNS.test(concept.example)
  return {
    ...concept,
    example: metaExample ? `${task.context} ${task.prompt}` : concept.example,
  }
}

function upgradeChoice(context: UnitContext, question: ReviewedChoiceQuestion, concept: ReviewedConcept, index: number): EnhancedChoice {
  const extra = question as EnhancedChoice
  if (extra.audioText || extra.mediaAssetId) return question as EnhancedChoice
  const task = concreteTask(context, concept, index)
  return {
    ...question,
    context: task.context,
    prompt: task.prompt,
    options: task.options,
    correctIndex: task.correctIndex,
    explanation: task.explanation,
    optionFeedback: choiceFeedback(task.options, task.correctIndex, task.explanation),
  } as EnhancedChoice
}

function upgradeResponse(context: UnitContext, question: ReviewedResponseQuestion, concept: ReviewedConcept, index: number): EnhancedResponse {
  const extra = question as EnhancedResponse
  if (extra.audioText || extra.mediaAssetId) return question as EnhancedResponse
  const task = concreteTask(context, concept, index)
  const correct = task.options[task.correctIndex]
  const prompt = context.subject === 'english'
    ? `${task.prompt} Write one complete sentence and quote the exact clue from the context that supports your answer.`
    : `先回答：「${task.prompt}」再引用題目中的一個具體數字、文字或觀察證據，說明為什麼。`
  const sampleAnswer = context.subject === 'english'
    ? `${correct} The answer is supported by the exact time, action, or comparison stated in the context. A complete response should quote that clue and explain how it leads to the conclusion rather than only naming the option.`
    : `${correct}。${task.explanation} 完整作答還要指出題目中直接支持這個結論的數字、文字或觀察結果，並確認沒有加入題目未提供的條件。`
  return {
    ...question,
    context: task.context,
    prompt,
    sampleAnswer,
    explanation: `${task.explanation} 這題要求把答案和題目中的明確證據連起來，因此不能只寫最後結果或只背固定句型。`,
    rubric: context.subject === 'english'
      ? ['Answers the concrete task directly and accurately.', 'Uses a complete sentence with the relevant form or meaning.', 'Quotes or identifies a specific clue from the given context.']
      : ['有直接回答題目的具體問題。', '有引用題目中的數字、文字或觀察證據。', '理由與本單元觀念一致，而且沒有超出題目資訊。'],
  } as EnhancedResponse
}

function upgradeWorkedExample(context: UnitContext, model: ReviewedWorkedExample, concept: ReviewedConcept, index: number): ReviewedWorkedExample {
  if (!META_PATTERNS.test(`${model.context} ${model.prompt}`) && model.context.length >= 25 && model.prompt.length >= 18 && model.answer.length >= 25 && model.explanation.length >= 35) return model
  const task = concreteTask(context, concept, index + 30)
  const answer = task.options[task.correctIndex]
  const steps = context.subject === 'math'
    ? [
        `先把情境中的實際數字與單位整理出來：${compact(task.context, 110)}`,
        `把題目轉成和「${concept.title}」相符的數學表示，保留正負號、單位或已知條件。`,
        `依定義或運算規則逐步處理，得到本題結果「${answer}」，中間步驟不可只寫最後數字。`,
        `把結果代回原情境，重新檢查符號、單位、大小與題目問法是否全部一致。`,
      ]
    : [
        `先列出情境中可以直接讀到、量到或比較的資訊：${compact(task.context, 105)}`,
        `找出和「${concept.title}」直接相關的證據，先排除題目沒有提供的猜測。`,
        `依本單元觀念連結證據與問題，得到目前最能被資料支持的結論「${answer}」。`,
        `最後回頭檢查：結論是否真的由現有證據支持，以及有哪些資訊仍不能從題目確定。`,
      ]
  return {
    ...model,
    title: `${concept.title}｜完整情境例題`,
    context: task.context,
    prompt: `${task.prompt} 請把判斷或計算過程完整寫出來，並在最後檢查答案。`,
    steps,
    answer: `本題結論是「${answer}」。作答時除了寫出結果，也要保留和題目情境直接相關的計算、文字證據或觀察依據。`,
    explanation: `${task.explanation} 這份示範特別把條件、推理與檢查拆開，讓換成另一組數字或另一個情境時仍能重新完成，而不是背同一個答案。`,
  }
}

export function inspectTextbookUnitV18(unitId: string) {
  const source = getTextbookUnitContentV17(unitId)
  const context = resolveCurriculumUnit(unitId)
  if (!source || !context) return { unit: null, validation: { ready: false, errors: ['V18 source/context missing'] } }

  const concepts = source.concepts.map((concept, index) => upgradeConcept(context, concept, index))
  const questions: ReviewedQuestion[] = source.questions.map((question, index) => {
    const concept = concepts[index % concepts.length]
    return question.kind === 'choice'
      ? upgradeChoice(context, question, concept, index)
      : upgradeResponse(context, question, concept, index)
  })
  const workedExamples = source.workedExamples.map((model, index) => upgradeWorkedExample(context, model, concepts[index % concepts.length], index))
  const unit: TextbookUnitContentV14 = { ...source, concepts, questions, workedExamples }
  return { unit, validation: validateTextbookUnitV14(unit) }
}

const cache = new Map<string, TextbookUnitContentV14 | null>()

export function getTextbookUnitContentV18(unitId: string): TextbookUnitContentV14 | null {
  if (cache.has(unitId)) return cache.get(unitId) ?? null
  const inspected = inspectTextbookUnitV18(unitId)
  const unit = inspected.unit && inspected.validation.ready ? inspected.unit : null
  cache.set(unitId, unit)
  return unit
}

export function getConceptChecksV18(unit: TextbookUnitContentV14) {
  return unit.questions.filter((question) => question.id.includes('-ped-v17-check-'))
}

export function isMetaLearnerPromptV18(value: string) {
  return META_PATTERNS.test(value)
}
