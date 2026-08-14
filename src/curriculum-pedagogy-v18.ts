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

function choiceFeedback(options: string[], correctIndex: number, explanation: string) {
  return options.map((_, index) => index === correctIndex
    ? `正確。${explanation}`
    : `再看一次題目中的具體數字、文字或證據；這個選項和條件不一致。`)
}

function mathTask(text: string, index: number): ConcreteTask {
  const variant = index % 5
  if (/正數|負數|整數|數線|相反數|絕對值/.test(text)) {
    const start = [4, 7, -2, 3, -5][variant]
    const change = [-9, -12, 8, -7, 11][variant]
    const result = start + change
    const options = [String(result), String(start - change), String(Math.abs(result)), String(-result)]
    const unique = Array.from(new Set(options))
    while (unique.length < 4) unique.push(String(result + unique.length + 2))
    return {
      context: `早上氣溫是 ${start}°C，之後氣溫改變 ${change > 0 ? `+${change}` : change}°C。把 0°C 當作基準。`,
      prompt: '改變後的氣溫是多少？',
      options: unique.slice(0, 4),
      correctIndex: unique.slice(0, 4).indexOf(String(result)),
      explanation: `${start} + (${change}) = ${result}，正負號表示相對於 0 的方向。`,
    }
  }
  if (/科學記號|指數|次方|冪/.test(text)) {
    const values = [320000, 4500000, 78000, 91000000, 560000]
    const value = values[variant]
    const exponent = String(value).length - 1
    const lead = value / 10 ** exponent
    const answer = `${lead} × 10^${exponent}`
    const options = [answer, `${lead} × 10^${exponent - 1}`, `${lead / 10} × 10^${exponent}`, `${lead * 10} × 10^${exponent}`]
    return {
      context: `一筆量測資料是 ${value.toLocaleString('en-US')}。老師要把它寫成 a × 10^n，而且 1 ≤ a < 10。`,
      prompt: '下列哪一個科學記號正確？',
      options,
      correctIndex: 0,
      explanation: `小數點從 ${value.toLocaleString('en-US')} 移到 ${lead} 共移動 ${exponent} 位，所以是 ${answer}。`,
    }
  }
  if (/分數|小數|百分|比率|比例|比值/.test(text)) {
    const total = [40, 60, 80, 120, 200][variant]
    const percent = [25, 30, 15, 40, 35][variant]
    const result = total * percent / 100
    return {
      context: `班上有 ${total} 人，其中 ${percent}% 選擇搭公車。`,
      prompt: '搭公車的學生有幾人？',
      options: [String(result), String(total - result), String(percent), String(total + result)],
      correctIndex: 0,
      explanation: `${total} × ${percent}% = ${total} × ${percent / 100} = ${result}。`,
    }
  }
  if (/方程|代數|未知數|一元|式子/.test(text)) {
    const each = [35, 40, 45, 50, 60][variant]
    const count = [6, 7, 8, 5, 9][variant]
    const total = each * count
    return {
      context: `每張票 ${each} 元，小安買了 x 張，一共付 ${total} 元。`,
      prompt: 'x 應該是多少？',
      options: [String(count), String(count + 1), String(each), String(total - each)],
      correctIndex: 0,
      explanation: `列式 ${each}x = ${total}，兩邊同除以 ${each}，得到 x = ${count}。`,
    }
  }
  if (/幾何|角|三角|四邊|圓|面積|周長|體積|形狀/.test(text)) {
    const a = [8, 9, 12, 7, 11][variant]
    const b = [5, 6, 4, 9, 3][variant]
    return {
      context: `一個長方形長 ${a} 公分、寬 ${b} 公分。`,
      prompt: '這個長方形的面積是多少平方公分？',
      options: [String(a * b), String(2 * (a + b)), String(a + b), String(a * b * 2)],
      correctIndex: 0,
      explanation: `長方形面積 = 長 × 寬 = ${a} × ${b} = ${a * b} 平方公分。`,
    }
  }
  if (/統計|平均|中位|眾數|機率|資料|圖表/.test(text)) {
    const sets = [[8, 10, 10, 12, 15], [12, 14, 15, 15, 19], [6, 9, 11, 11, 18], [20, 22, 24, 24, 30], [3, 5, 7, 7, 9]]
    const data = sets[variant]
    const median = data[2]
    return {
      context: `五次測量結果依序是 ${data.join('、')}。`,
      prompt: '這組資料的中位數是多少？',
      options: [String(median), String(data[0]), String(data[4]), String(data.reduce((sum, item) => sum + item, 0))],
      correctIndex: 0,
      explanation: `資料已排序，共 5 筆，中間第 3 筆就是中位數 ${median}。`,
    }
  }
  if (/時間|長度|重量|容量|測量|單位/.test(text)) {
    const start = [35, 48, 72, 90, 125][variant]
    const used = [12, 19, 28, 35, 45][variant]
    return {
      context: `一條緞帶原本長 ${start} 公分，用掉 ${used} 公分。`,
      prompt: '還剩下多少公分？',
      options: [String(start - used), String(start + used), String(used), String(start)],
      correctIndex: 0,
      explanation: `${start} - ${used} = ${start - used}，而且單位仍是公分。`,
    }
  }
  const total = [18, 24, 32, 45, 56][variant]
  const used = [7, 9, 13, 18, 21][variant]
  return {
    context: `某項活動準備了 ${total} 份材料，第一階段用了 ${used} 份。`,
    prompt: '剩下的材料有幾份？',
    options: [String(total - used), String(total + used), String(used), String(total)],
    correctIndex: 0,
    explanation: `剩餘量 = 原有量 - 已使用量 = ${total} - ${used} = ${total - used}。`,
  }
}

function scienceTask(text: string, index: number): ConcreteTask {
  if (/電|電流|電壓|電阻|電路/.test(text)) {
    return {
      context: '甲、乙兩個相同燈泡串聯接上電池。把其中一顆燈泡拆下後，電路出現斷點。',
      prompt: '此時另一顆燈泡最可能出現什麼情況？',
      options: ['熄滅，因為電路不再形成完整回路', '變得更亮，因為少一顆燈泡', '亮度完全不變', '只有電池會熄滅'],
      correctIndex: 0,
      explanation: '串聯電路中任一處斷開，電流就無法形成完整路徑。',
    }
  }
  if (/力|運動|速度|摩擦|慣性/.test(text)) {
    return {
      context: '同一台玩具車分別在光滑木板與粗糙布面上，以相同速度出發。木板上的車滑得比較遠。',
      prompt: '哪個解釋最符合這次觀察？',
      options: ['粗糙布面的摩擦力較大，使車較快減速', '木板上的車質量突然變大', '粗糙布面沒有重力', '兩個表面的摩擦力一定相同'],
      correctIndex: 0,
      explanation: '其他條件相近時，較大的摩擦力會讓運動物體更快減速。',
    }
  }
  if (/植物|動物|生物|細胞|器官|生態/.test(text)) {
    return {
      context: '兩盆同種幼苗放在相同溫度下，一盆每天照光 8 小時，另一盆完全遮光；一週後比較葉色與高度。',
      prompt: '這個實驗中最主要被改變的條件是什麼？',
      options: ['光照時間', '植物種類', '觀察天數', '兩盆的溫度'],
      correctIndex: 0,
      explanation: '兩組要比較光照的影響，因此主動改變的是光照時間。',
    }
  }
  if (/水循環|天氣|氣候|蒸發|凝結|地球|岩石/.test(text)) {
    return {
      context: '透明杯外側原本是乾的。倒入冰水幾分鐘後，杯外出現許多小水滴。',
      prompt: '杯外水滴主要從哪裡來？',
      options: ['空氣中的水蒸氣遇冷凝結', '冰水直接穿過杯壁', '杯子自己產生水', '空氣中的氧氣變成液態水'],
      correctIndex: 0,
      explanation: '杯壁使附近空氣降溫，水蒸氣凝結成可見的小水滴。',
    }
  }
  if (/月|太陽|行星|宇宙|天文|星/.test(text)) {
    return {
      context: '連續數晚在同一時間觀察月亮，發現亮面形狀與天空中的位置逐日改變。',
      prompt: '下列哪項紀錄最能幫助比較月相變化？',
      options: ['每天固定時間記錄日期、方位與亮面形狀', '只記其中一天的照片', '每天改在不同地點且不記時間', '只寫「月亮很好看」'],
      correctIndex: 0,
      explanation: '固定觀察條件並記錄日期、位置與亮面，才能比較逐日變化。',
    }
  }
  if (/光|聲|波|振動|熱|溫度/.test(text)) {
    return {
      context: '把相同體積的熱水分別倒入金屬杯與保麗龍杯，10 分鐘後量溫度。',
      prompt: '若要比較兩種杯子的保溫效果，最重要的是什麼？',
      options: ['一開始水量與水溫相同，並在相同時間後量測', '兩杯使用不同水量', '一杯放室內、一杯放冰箱', '只摸杯子外面判斷'],
      correctIndex: 0,
      explanation: '公平比較需要控制起始水量、水溫、時間與環境，主要改變容器材質。',
    }
  }
  const sets = [12, 15, 18, 21, 24]
  const value = sets[index % sets.length]
  return {
    context: `學生重複量測同一現象三次，結果是 ${value - 1}、${value}、${value + 1}。`,
    prompt: '面對這三筆接近但不完全相同的量測，哪個處理較合理？',
    options: ['保留三筆紀錄並比較誤差範圍', '只留下最喜歡的一筆', '把不同數字全部改成一樣', '直接宣稱儀器一定壞掉'],
    correctIndex: 0,
    explanation: '真實量測常有小幅變動，應保留資料、比較差異並檢查可能的誤差來源。',
  }
}

function socialTask(text: string, index: number): ConcreteTask {
  if (/位置|地圖|地理|地形|區域|交通|人口分布/.test(text)) {
    return {
      context: '某城市地圖顯示：甲區靠近火車站與主要道路，乙區位於山坡且距主要道路較遠。近十年甲區人口增加較快。',
      prompt: '哪項資料最能支持「交通便利可能影響人口分布」？',
      options: ['比較兩區到車站、道路的距離與人口變化', '只看甲區一張街景照片', '只詢問一位居民最喜歡哪裡', '只比較兩區名稱'],
      correctIndex: 0,
      explanation: '要檢驗交通與人口分布的關係，需要同時比較交通可及性與人口變化資料。',
    }
  }
  if (/歷史|年代|時代|事件|變遷|近代|古代/.test(text)) {
    return {
      context: '資料甲是事件發生當年的報紙，資料乙是五十年後學者根據多份檔案寫成的研究。兩份資料對同一事件的原因說法不同。',
      prompt: '閱讀這兩份資料時，最合適的做法是什麼？',
      options: ['比較作者、年代、目的與所用證據，再判斷差異', '只相信年代較早的資料', '只相信寫得比較長的資料', '把兩份資料不同處全部視為錯誤'],
      correctIndex: 0,
      explanation: '史料需要連同來源、時代、目的與證據一起判讀，不能只靠先後或篇幅決定可信度。',
    }
  }
  if (/政府|公民|法律|權利|義務|民主|制度|政策/.test(text)) {
    return {
      context: '市政府準備調整公園使用規則，居民、附近學校、攤商與環保團體提出不同意見。',
      prompt: '公共決策前，哪個做法最能兼顧程序與不同權益？',
      options: ['公開資訊並讓受影響群體表達意見，再說明決策理由', '只聽人數最多的一方', '不公布資料直接決定', '只採用最早提出的意見'],
      correctIndex: 0,
      explanation: '公共議題通常涉及多方權益，透明資訊、參與程序與可說明的理由都很重要。',
    }
  }
  if (/產業|經濟|消費|市場|貿易|資源/.test(text)) {
    return {
      context: '同一商品今年價格上升 15%，同期間原料運費增加，市場需求也增加。',
      prompt: '若要解釋價格上升，哪個結論最合理？',
      options: ['目前至少有成本與需求兩種可能因素，需要更多資料比較影響', '一定只由運費造成', '一定只由需求造成', '價格上升和任何市場條件都無關'],
      correctIndex: 0,
      explanation: '多個因素同時變動時，單一資料不足以證明唯一原因。',
    }
  }
  const year = 2018 + (index % 5)
  return {
    context: `某地區 ${year} 年到 ${year + 3} 年的公共運輸使用率從 42% 上升到 51%，同期間新增兩條公車路線。`,
    prompt: '根據這些資料，可以最穩妥地說什麼？',
    options: ['使用率上升與新增路線同時發生，但仍需更多資料判斷因果', '新增路線一定是唯一原因', '使用率其實下降', '這些數字可以直接代表所有地區'],
    correctIndex: 0,
    explanation: '資料能支持「同時發生」與趨勢，但要主張因果還需要排除其他因素。',
  }
}

function englishTask(text: string, index: number): ConcreteTask {
  if (/過去|past/i.test(text)) {
    return {
      context: 'Yesterday, Mia visited her grandmother and helped cook dinner.',
      prompt: 'Which sentence correctly describes what Mia did yesterday?',
      options: ['Mia visited her grandmother.', 'Mia visits her grandmother tomorrow.', 'Mia is visit her grandmother yesterday.', 'Mia visiting her grandmother every day.'],
      correctIndex: 0,
      explanation: '“Yesterday” calls for a past-time form, so “visited” fits the completed event.',
    }
  }
  if (/未來|future/i.test(text)) {
    return {
      context: 'Kevin has a plan for Saturday afternoon.',
      prompt: 'Which sentence clearly talks about his future plan?',
      options: ['Kevin is going to play basketball on Saturday.', 'Kevin played basketball yesterday.', 'Kevin plays basketball last Saturday.', 'Kevin basketball Saturday.'],
      correctIndex: 0,
      explanation: '“is going to + verb” can express a future plan already decided.',
    }
  }
  if (/比較|compar/i.test(text)) {
    return {
      context: 'A blue bag weighs 2 kg. A red bag weighs 3 kg.',
      prompt: 'Which sentence is correct?',
      options: ['The red bag is heavier than the blue bag.', 'The red bag is heavy than the blue bag.', 'The blue bag is more heavy the red bag.', 'The blue bag heavier than red bag is.'],
      correctIndex: 0,
      explanation: 'For “heavy,” the comparative form is “heavier,” followed by “than.”',
    }
  }
  const names = ['Amy', 'Ben', 'Cindy', 'David', 'Ella']
  const name = names[index % names.length]
  return {
    context: `${name} says, “I usually get up at seven and walk to school.”`,
    prompt: `What does ${name} usually do after getting up?`,
    options: ['Walks to school', 'Takes a plane', 'Goes back to bed', 'Cooks dinner at midnight'],
    correctIndex: 0,
    explanation: 'The sentence directly says that the speaker walks to school.',
  }
}

function chineseTask(text: string, index: number): ConcreteTask {
  if (/修辭|譬喻|比喻/.test(text)) {
    return {
      context: '句子：「雨點像一顆顆透明的珠子，落在窗邊。」',
      prompt: '這句話主要運用了哪一種表達方式？',
      options: ['譬喻', '設問', '排比', '轉品'],
      correctIndex: 0,
      explanation: '句中用「像」把雨點比作透明珠子，讓形象更具體。',
    }
  }
  const snippets = [
    '小杰原本不敢上台，排練幾次後，他主動舉手參加朗讀。',
    '清晨的市場先是安靜，太陽升起後，叫賣聲與腳步聲慢慢多了起來。',
    '奶奶把舊照片一張張排好，邊看邊說起年輕時搬家的故事。',
    '校園停電時，同學先打開窗戶，再把需要完成的工作重新分配。',
    '雨停後，操場還有積水，但幾個孩子已經拿著掃把一起整理。',
  ]
  const snippet = snippets[index % snippets.length]
  return {
    context: `短文：「${snippet}」`,
    prompt: '下列哪個說法最符合這段文字可以直接支持的內容？',
    options: ['人物或情境出現了可從文字找到的變化', '作者一定在批評所有人物', '文中每個人都抱持完全相同的想法', '只看標題就能知道所有細節'],
    correctIndex: 0,
    explanation: '判讀要回到實際詞句；這段文字確實呈現行動或情境的變化，其餘說法超出文本證據。',
  }
}

function concreteTask(context: UnitContext, concept: ReviewedConcept, index: number): ConcreteTask {
  const text = `${context.unit.title} ${context.unit.focus} ${concept.title}`
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
  return {
    ...question,
    context: task.context,
    prompt: context.subject === 'english'
      ? `${task.prompt} Write one complete sentence and point to the words in the context that support your answer.`
      : `先回答：「${task.prompt}」再用一句話指出題目中的哪個數字、文字或證據支持你的答案。`,
    sampleAnswer: `${task.options[task.correctIndex]}。${task.explanation}`,
    explanation: task.explanation,
    rubric: context.subject === 'english'
      ? ['Answers the concrete task directly.', 'Uses a complete sentence.', 'Points to a clue from the given context.']
      : ['有直接回答具體問題。', '有引用題目中的數字、文字或證據。', '理由與本單元觀念一致。'],
  } as EnhancedResponse
}

function upgradeWorkedExample(context: UnitContext, model: ReviewedWorkedExample, concept: ReviewedConcept, index: number): ReviewedWorkedExample {
  if (!META_PATTERNS.test(`${model.context} ${model.prompt}`)) return model
  const task = concreteTask(context, concept, index)
  const answer = task.options[task.correctIndex]
  const steps = context.subject === 'math'
    ? [
        `把題目中的具體數字與單位圈出來：${compact(task.context, 72)}`,
        `把問題轉成這個單元的數學表示，先不要跳步。`,
        `完成計算或判斷，得到 ${answer}。`,
        `回到原情境檢查符號、單位、大小與答案是否合理。`,
      ]
    : [
        '先把情境中可以直接觀察、讀到或比較的資料列出來。',
        `用「${concept.title}」連結資料與問題，不加入題目沒有提供的假設。`,
        `選出或寫出最符合證據的結論：${answer}。`,
        '最後檢查結論是否超出資料能支持的範圍。',
      ]
  return {
    ...model,
    title: `${concept.title}｜完整例題`,
    context: task.context,
    prompt: task.prompt,
    steps,
    answer,
    explanation: task.explanation,
  }
}

export function inspectTextbookUnitV18(unitId: string) {
  const source = getTextbookUnitContentV17(unitId)
  const context = resolveCurriculumUnit(unitId)
  if (!source || !context) return { unit: null, validation: { ready: false, issues: ['V18 source/context missing'] } }

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
