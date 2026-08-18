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
  seededPick,
  stableHash,
  unitObjectives,
  unitOverview,
  visualSet,
  type V21SubjectBuild,
  type V21UnitContext,
} from './curriculum-v21-common'

type ScienceFamily =
  | 'life-integrated'
  | 'inquiry-measurement'
  | 'cell-life'
  | 'ecology-environment'
  | 'genetics-evolution'
  | 'physiology'
  | 'matter-properties'
  | 'chemical-reaction'
  | 'chemistry-advanced'
  | 'force-motion'
  | 'energy-heat'
  | 'waves-optics'
  | 'electricity-magnetism'
  | 'earth-geology'
  | 'weather-climate-ocean'
  | 'astronomy'
  | 'data-project'

type ScienceCase = {
  context: string
  prompt: string
  answer: string
  distractors: string[]
  steps: string[]
  explanation: string
}

function scienceFamily(context: V21UnitContext): ScienceFamily {
  const text = `${context.unit.title} ${context.unit.focus}`
  if (context.pathway === 'life' || context.grade <= 2) return 'life-integrated'
  if (/觀察|測量|科學方法|小探究|實驗設計|資料分析|專題/.test(text)) return 'inquiry-measurement'
  if (/細胞|生命物質|微小世界|生物體的組成/.test(text)) return 'cell-life'
  if (/生態|環境|多樣性|全球變遷|永續/.test(text)) return 'ecology-environment'
  if (/遺傳|演化|基因|分類|生殖|發育/.test(text)) return 'genetics-evolution'
  if (/植物|動物|運輸|協調|調節|生理|代謝|養分|器官/.test(text)) return 'physiology'
  if (/原子|物質|材料|溶液|氣體|化學鍵|週期|高分子/.test(text) && !/反應|平衡|酸鹼|氧化|電化學|速率|反應熱/.test(text)) return 'matter-properties'
  if (/化學反應|化學變化|化學計量/.test(text)) return 'chemical-reaction'
  if (/平衡|酸鹼|氧化|電化學|有機|分析|反應熱|反應速率|能源化學/.test(text)) return 'chemistry-advanced'
  if (/力|運動|壓力|浮力|流體|機械|動量|碰撞|力學/.test(text)) return 'force-motion'
  if (/熱|溫度|能量|功|守恆|能源轉換/.test(text)) return 'energy-heat'
  if (/波|聲音|光|成像|光學|振動/.test(text)) return 'waves-optics'
  if (/電|磁|電磁|電場|電位/.test(text)) return 'electricity-magnetism'
  if (/地球內部|地質|板塊|岩石|地史|地表|天然災害/.test(text)) return 'earth-geology'
  if (/天氣|氣候|大氣|海洋|水循環|海氣/.test(text)) return 'weather-climate-ocean'
  if (/月亮|天空|太空|天文|太陽系|宇宙|恆星|行星/.test(text)) return 'astronomy'
  return 'data-project'
}

function familyLabel(family: ScienceFamily) {
  const labels: Record<ScienceFamily, string> = {
    'life-integrated': '生活觀察、環境與問題解決',
    'inquiry-measurement': '科學探究、測量與證據',
    'cell-life': '細胞、生命物質與組成層次',
    'ecology-environment': '生態系、環境與多樣性',
    'genetics-evolution': '生殖、遺傳與演化',
    physiology: '生物功能、調節與能量利用',
    'matter-properties': '物質、粒子、性質與材料',
    'chemical-reaction': '化學反應、計量與能量變化',
    'chemistry-advanced': '化學平衡、酸鹼、氧化還原與分析',
    'force-motion': '力、運動與機械關係',
    'energy-heat': '功、能量、熱與守恆',
    'waves-optics': '波、聲音與光',
    'electricity-magnetism': '電路、電場、磁場與電磁現象',
    'earth-geology': '地球內部、岩石與地質作用',
    'weather-climate-ocean': '大氣、天氣、氣候、海洋與水循環',
    astronomy: '月球、太陽系、恆星與宇宙觀測',
    'data-project': '科學資料、模型與專題探究',
  }
  return labels[family]
}

function scienceCase(context: V21UnitContext, family: ScienceFamily, index: number): ScienceCase {
  const seed = stableHash(`${context.unit.id}-${family}-${index}`)
  const n = (min: number, max: number, shift = 0) => seededInt(seed + shift * 6131, min, max)

  if (family === 'life-integrated') {
    const items = [
      { context: '同一個校園角落，上午九點有陽光，下午三點大多被建築物遮住。', prompt: '如果要知道「光影怎麼隨時間改變」，最好的紀錄方式是什麼？', answer: '在相同位置、不同時間拍照或描畫影子位置並標記時間', distractors: ['只在某一天憑印象描述', '每次換不同地點觀察', '先決定答案再找符合的照片'] },
      { context: '兩種紙做成相同大小的小船，放入同樣多的水中。', prompt: '要比較哪種紙較耐水，哪個做法較公平？', answer: '讓兩艘船大小相同、接觸水量相同，再比較變軟或滲水時間', distractors: ['一艘放水裡、一艘不放水裡', '同時改變紙張和船大小', '只挑自己喜歡的紙'] },
      { context: '校園步道下雨後有一處特別容易積水。', prompt: '第一步最適合做什麼？', answer: '觀察積水位置、地面高低與排水口，留下照片或簡單圖示', distractors: ['直接把所有排水口封住', '沒有觀察就先決定原因', '只問一個人就當成全部證據'] },
    ]
    const item = items[n(0, items.length - 1, 1)]
    return { ...item, steps: ['提出可觀察的問題', '固定重要條件', '留下照片／圖示／數量紀錄', '比較後再提出解釋'], explanation: '生活探究要從可觀察、可重複的紀錄開始，先看證據再提出原因或改善方式。' }
  }

  if (family === 'inquiry-measurement') {
    const t1 = n(20, 30, 1); const t2 = t1 + n(5, 12, 2)
    return {
      context: `同一杯水先用溫度計量得 ${t1}°C，加熱 2 分鐘後量得 ${t2}°C；其他量測方式相同。`,
      prompt: '這組紀錄最直接支持哪個敘述？',
      answer: `在這次條件下，加熱後水溫由 ${t1}°C 上升到 ${t2}°C`,
      distractors: ['所有液體加熱 2 分鐘都一定上升相同溫度', '溫度計本身證明加熱造成所有物質改變', '因為結果符合預期，所以不必記錄量測方法'],
      steps: ['分清楚操作條件與量測結果', '比較前後數據', '只說資料能支持的範圍', '不把一次觀察過度推廣'],
      explanation: '科學結論必須和實際資料範圍一致；這組資料只能直接描述這杯水在這次加熱條件下的變化。',
    }
  }

  if (family === 'cell-life') {
    return {
      context: '顯微鏡觀察洋蔥表皮，可看到許多相鄰的規則小區塊；每個區塊有明顯邊界，染色後部分區域更容易辨認。',
      prompt: '下列哪個說法最符合「細胞是生物體基本構造單位」的觀察？',
      answer: '表皮由許多可辨認的細胞單位共同構成，而不是一整片沒有分隔的物質',
      distractors: ['每個小區塊都是一個完整器官', '只要有邊界就一定是細胞核', '顯微鏡看到的所有形狀都代表不同物種'],
      steps: ['先描述可見構造', '區分細胞、胞器與器官層次', '把觀察和模型對照', '避免把示意圖比例當成真實比例'],
      explanation: '顯微鏡下可辨認的重複細胞單位支持組織由細胞構成；細胞核、細胞壁等則是更細的構造。',
    }
  }

  if (family === 'ecology-environment') {
    const insects = n(18, 35, 1); const birds = n(4, 12, 2)
    return {
      context: `某草地樣區記錄到開花植物、${insects} 隻昆蟲與 ${birds} 隻食蟲鳥；移除大部分開花植物後，下一月昆蟲數明顯下降。`,
      prompt: '哪個解釋最符合生態系中生物之間的關係？',
      answer: '開花植物可能提供昆蟲食物或棲地，植物減少會改變昆蟲資源，並可能進一步影響食蟲鳥',
      distractors: ['任何一種生物減少都不會影響其他生物', '昆蟲下降證明鳥一定是唯一原因', '生態系只包含生物，不包含環境條件'],
      steps: ['列出觀察到的生物與環境', '找可能的食物／棲地關係', '區分觀察與因果推論', '提出需要更多資料驗證的關係'],
      explanation: '生態系包含生物彼此以及生物與環境的交互作用；觀察可支持資源關聯，但仍需更多控制或長期資料判定因果。',
    }
  }

  if (family === 'genetics-evolution') {
    return {
      context: '同一物種的個體在毛色上有差異；親代與子代之間常可看到部分相似，但環境也可能影響某些性狀表現。',
      prompt: '哪個說法最能區分「遺傳」與「性狀表現」？',
      answer: '遺傳資訊會影響性狀，但實際表現可能同時受到基因與環境條件影響',
      distractors: ['所有性狀都只由環境決定', '子代一定和其中一個親代完全相同', '只要外表相似就能證明全部基因完全相同'],
      steps: ['先區分遺傳資訊與可觀察性狀', '比較親代、子代與環境', '避免把相似寫成完全相同', '用多個世代或實驗資料支持推論'],
      explanation: '遺傳提供生物性狀形成的重要資訊，但許多性狀的表現也會受環境與發育條件影響。',
    }
  }

  if (family === 'physiology') {
    const before = n(65, 82, 1); const after = before + n(35, 65, 2)
    return {
      context: `某人安靜坐著時心跳約 ${before} 次/分，跑步 5 分鐘後量得 ${after} 次/分，休息後逐漸下降。`,
      prompt: '哪個解釋最能把觀察和生理功能連起來？',
      answer: '運動時組織對氧與物質運輸需求增加，循環系統活動會相應調整',
      distractors: ['心跳增加表示血液停止流動', '只要心跳快就一定代表生病', '運動完全不會改變身體的能量需求'],
      steps: ['先比較運動前後量測', '連到器官系統功能', '區分正常調節與疾病判斷', '用恢復過程補充理解'],
      explanation: '運動提高能量需求與氣體、養分運輸需求，心跳加快是循環調節的一部分；單一數值不能直接診斷疾病。',
    }
  }

  if (family === 'matter-properties') {
    const substances = [
      { a: '食鹽', b: '沙子', property: '加入水並攪拌後，食鹽形成均勻溶液，沙子多數沉降', conclusion: '可利用在水中的溶解性差異進行初步分離' },
      { a: '鐵粉', b: '硫粉', property: '混合前鐵粉可被磁鐵吸引，硫粉不會', conclusion: '可利用磁性差異分離未反應的混合物' },
      { a: '水', b: '食用油', property: '混合後靜置會分成上下兩層', conclusion: '兩液體互溶性與密度差異可形成分層' },
    ]
    const item = substances[n(0, substances.length - 1, 1)]
    return {
      context: `${item.a} 與 ${item.b} 的觀察：${item.property}。`,
      prompt: '哪個結論最直接根據這項物質性質？',
      answer: item.conclusion,
      distractors: ['所有物質的性質都會因混合而完全消失', '只要顏色不同就代表一定發生化學反應', '一次觀察足以證明所有溫度下都完全相同'],
      steps: ['辨認觀察的是物理性質還是反應現象', '比較兩種物質差異', '選擇可利用的性質', '限制結論在實際條件內'],
      explanation: `這個判斷直接利用${item.property}，因此可得：${item.conclusion}。`,
    }
  }

  if (family === 'chemical-reaction') {
    const m1 = n(8, 18, 1); const m2 = n(5, 15, 2); const total = m1 + m2
    return {
      context: `密閉容器中讓 ${m1} g 的物質 A 與 ${m2} g 的物質 B 完全反應，容器沒有物質進出。`,
      prompt: '若以質量守恆判斷，反應後容器內物質總質量應是多少？',
      answer: `${total} g`,
      distractors: [`${Math.abs(m1 - m2)} g`, `${m1 * m2} g`, '一定比反應前少，因為產生新物質'],
      steps: ['確認系統是密閉的', `反應前總質量 ${m1}+${m2}`, `算得 ${total} g`, '新物質形成不代表質量消失'],
      explanation: `密閉系統中化學反應前後總質量守恆，因此總質量仍是 ${total} g。`,
    }
  }

  if (family === 'chemistry-advanced') {
    if (/酸鹼/.test(context.unit.title)) {
      const pH = n(2, 5, 1)
      return {
        context: `某水溶液量得 pH=${pH}（25°C，作為本題簡化判斷）。`,
        prompt: '依 pH 尺度，這個溶液最合理的分類是什麼？',
        answer: '酸性溶液',
        distractors: ['中性溶液', '鹼性溶液', '只靠 pH 無法進行任何酸鹼判斷'],
        steps: ['讀取 pH 數值', '與中性基準 pH 7 比較', 'pH<7 判為酸性', '不把酸鹼性直接等同危險程度'],
        explanation: `在常用水溶液 pH 判讀中，pH=${pH}<7，屬酸性；強弱與安全性仍需更多資訊。`,
      }
    }
    const initial = n(0, 20, 1); const shift = n(10, 25, 2)
    return {
      context: `某可逆反應達平衡後，改變一項條件，量測發現產物比例由 ${initial + 35}% 變成 ${initial + 35 + shift}%。`,
      prompt: '對這筆資料最嚴謹的說法是哪一項？',
      answer: '條件改變後新的平衡組成不同，但需要知道改變了什麼條件才能判斷平衡移動原因',
      distractors: ['平衡表示反應已完全停止', '產物比例增加就證明催化劑改變平衡常數', '任何條件改變都一定讓產物增加'],
      steps: ['先確認平衡是動態狀態', '比較改變前後組成', '區分觀察結果與造成結果的條件', '需要具體條件才能用平衡原理解釋'],
      explanation: '平衡時正逆反應仍可持續；只知道組成改變，還不足以判定是哪個外在條件造成移動。',
    }
  }

  if (family === 'force-motion') {
    const time = n(2, 6, 1); const speed = n(3, 12, 2); const distance = time * speed
    return {
      context: `小車做近似等速直線運動，${time} 秒內前進 ${distance} 公尺。`,
      prompt: '平均速率是多少公尺/秒？',
      answer: `${speed} m/s`,
      distractors: [`${distance + time} m/s`, `${time / distance} m/s`, `${distance} m/s`],
      steps: ['確認距離與時間', '使用速率=距離/時間', `${distance}÷${time}=${speed}`, '寫上 m/s'],
      explanation: `平均速率 = ${distance} m ÷ ${time} s = ${speed} m/s。`,
    }
  }

  if (family === 'energy-heat') {
    const mass = n(2, 6, 1); const height = n(2, 8, 2); const g = 10; const pe = mass * g * height
    return {
      context: `取 g≈10 m/s²，一個 ${mass} kg 物體被抬高 ${height} m。`,
      prompt: '重力位能增加約多少焦耳？',
      answer: `${pe} J`,
      distractors: [`${mass * height} J`, `${mass * g} J`, `${g * height} J`],
      steps: ['辨認使用重力位能 mgh', `代入 ${mass}×${g}×${height}`, `算得 ${pe}`, '單位為焦耳 J'],
      explanation: `ΔU=mgh=${mass}×${g}×${height}=${pe} J。`,
    }
  }

  if (family === 'waves-optics') {
    if (/光|成像|光學/.test(context.unit.title)) {
      return {
        context: '一束光由空氣斜射入透明玻璃，在界面改變傳播方向。',
        prompt: '這個現象最直接稱為什麼？',
        answer: '折射',
        distractors: ['只有反射', '蒸發', '電磁感應'],
        steps: ['確認光跨越兩種介質', '觀察傳播方向改變', '區分反射與進入另一介質後的偏折', '以折射描述'],
        explanation: '光進入不同介質時速率改變，斜入射通常會改變方向，稱為折射。',
      }
    }
    const f = n(200, 800, 1)
    return {
      context: `音叉振動頻率為 ${f} Hz。`,
      prompt: '這個數字代表什麼？',
      answer: `每秒約振動 ${f} 次`,
      distractors: [`每分鐘只振動 ${f} 次`, '聲音一定傳播 '+f+' 公尺', '音量一定等於頻率數值'],
      steps: ['辨認 Hz 是頻率單位', '1 Hz=每秒 1 次週期', `所以 ${f} Hz 表示每秒 ${f} 次`, '不要把頻率和音量混在一起'],
      explanation: `Hz 表示每秒週期數，因此 ${f} Hz 是每秒 ${f} 次振動。`,
    }
  }

  if (family === 'electricity-magnetism') {
    const v = n(3, 12, 1); const r = n(2, 8, 2); const i = v / r
    if (Number.isInteger(i)) {
      return {
        context: `一個簡化電路中，電阻 ${r} Ω 兩端電壓 ${v} V。`,
        prompt: '依歐姆定律 I=V/R，電流是多少？',
        answer: `${i} A`,
        distractors: [`${v * r} A`, `${r / v} A`, `${v + r} A`],
        steps: ['確認電壓與電阻', '使用 I=V/R', `${v}÷${r}=${i}`, '單位為安培 A'],
        explanation: `I=${v}/${r}=${i} A。`,
      }
    }
    return {
      context: '兩顆燈泡串聯接在電池上；其中一顆燈泡被取下，使回路出現斷點。',
      prompt: '另一顆燈泡會怎樣？',
      answer: '熄滅，因為完整閉合回路被切斷',
      distractors: ['一定變更亮', '完全不受影響', '電池會讓電流跨過空氣斷點持續流動'],
      steps: ['畫出電流可能路徑', '確認是否形成閉合回路', '取下燈泡後路徑中斷', '因此沒有持續電流'],
      explanation: '串聯回路任一處斷開都使完整電流路徑消失，因此兩顆都不會持續發亮。',
    }
  }

  if (family === 'earth-geology') {
    return {
      context: '某地震帶與火山帶長期集中在兩個板塊交界附近，GPS 也量到兩側地表具有相對運動。',
      prompt: '哪個說法最符合板塊構造的證據推理？',
      answer: '地震、火山分布與地表相對運動可共同支持板塊邊界存在活動，但每次災害仍需個別資料分析',
      distractors: ['只要有一座火山就能證明整個大陸會立刻裂開', '地震只會發生在完全沒有板塊運動的地方', 'GPS 測量與地質推論完全無關'],
      steps: ['比較地震與火山空間分布', '加入地表位移量測', '用多種證據支持板塊關係', '避免從區域趨勢預測單一次事件'],
      explanation: '板塊理論建立在多種地質與地球物理證據上；區域模式不等於能精確預測每次地震時間。',
    }
  }

  if (family === 'weather-climate-ocean') {
    const days = n(5, 12, 1)
    return {
      context: `某地連續 ${days} 天記錄氣溫與降雨；其中 2 天午後有強降雨，但其他日子乾燥。`,
      prompt: '這組短期紀錄最適合用來描述什麼？',
      answer: '這段期間的天氣變化，不能單靠幾天資料就定義整地區長期氣候',
      distractors: ['已足以證明未來每年同日期一定下雨', '氣候與天氣完全相同', '只要一天很熱就能證明長期氣候變暖'],
      steps: ['先看資料時間尺度', '短期現象稱天氣', '長期統計特徵才涉及氣候', '避免把單一事件直接等同長期趨勢'],
      explanation: '天氣描述短時間大氣狀況；氣候需長期統計。幾天資料可以分析天氣，但不足以獨立界定長期氣候。',
    }
  }

  if (family === 'astronomy') {
    return {
      context: '連續數晚在相近時間觀察月亮，記錄到亮面形狀與天空位置逐日改變。',
      prompt: '哪個解釋最符合月相形成？',
      answer: '月球繞地球運行時，地球上看到的日照亮面比例改變',
      distractors: ['月球每天被地球影子遮住不同部分就是所有月相的原因', '月球本身每天產生不同亮度的光', '月相只由雲量決定'],
      steps: ['先確認太陽照亮月球一半', '考慮月球繞地球的位置改變', '觀察者看到的亮面比例改變', '區分月相與月食'],
      explanation: '月相主要來自太陽、地球、月球相對位置改變，使我們看到月球受光面中的不同比例；月食是另一種特定排列。',
    }
  }

  return {
    context: '一組科學資料包含三次重複測量：12.1、12.4、12.2；另一次量得 19.8，且實驗紀錄指出該次儀器曾掉落。',
    prompt: '若要先處理這組資料，最合理的做法是什麼？',
    answer: '先檢查異常值 19.8 的量測條件與儀器紀錄，再決定是否重測或排除，不能直接刪掉',
    distractors: ['把最大值直接刪掉而不留紀錄', '只保留最接近期望答案的數字', '把四個數字全部視為一定同等可靠'],
    steps: ['先保留原始資料', '檢查量測與儀器紀錄', '判斷異常是否有可追溯原因', '需要時重測並說明處理方式'],
    explanation: '科學資料處理要透明；異常值可能是重要現象也可能是量測問題，必須先查原因而不是為了漂亮結果任意刪除。',
  }
}

function exampleFromCase(context: V21UnitContext, family: ScienceFamily, index: number): ReviewedWorkedExample {
  const item = scienceCase(context, family, index)
  return { title: `${familyLabel(family)}示範 ${index + 1}`, context: item.context, prompt: item.prompt, steps: item.steps, answer: item.answer, explanation: item.explanation }
}

function questionFromCase(context: V21UnitContext, family: ScienceFamily, index: number, id: string, level: '理解' | '應用' | '檢核'): ReviewedQuestion {
  const item = scienceCase(context, family, index + 13)
  if (index % 5 === 4) {
    return responseQuestion({
      id,
      level,
      context: item.context,
      prompt: `${item.prompt} 請寫出你使用的觀察、數據、模型或科學關係。`,
      sampleAnswer: `${item.answer}。判斷依據：${item.explanation}`,
      explanation: item.explanation,
      rubric: ['指出題目中的具體證據或科學關係', '結論沒有超出證據範圍', '若屬模型／推論，能和直接觀察區分'],
    })
  }
  return choiceQuestion({ id, level, context: item.context, prompt: item.prompt, correct: item.answer, distractors: item.distractors, explanation: item.explanation })
}

function misconceptionPairs(family: ScienceFamily) {
  const pairs: Record<ScienceFamily, Array<{ wrong: string; right: string; why: string }>> = {
    'life-integrated': [
      { wrong: '只要看到一次現象，就已經知道原因。', right: '先留下可比較的觀察，再提出可能原因並想辦法查證。', why: '生活探究也要區分「看到什麼」與「為什麼」。' },
      { wrong: '做實驗時同時改很多條件會比較快。', right: '要比較原因時，盡量一次只改主要條件並保持其他重要條件相近。', why: '同時改太多因素會不知道差異由哪一項造成。' },
    ],
    'inquiry-measurement': [
      { wrong: '量一次就代表真正值，不需要重複。', right: '量測有不確定性；重複量測與紀錄條件有助於判斷變異。', why: '儀器解析度、操作與環境都可能造成差異。' },
      { wrong: '結果符合預期就代表假設已被永久證明。', right: '結果只能支持或不支持特定條件下的假設，仍要考慮其他解釋。', why: '科學結論有證據範圍與可修正性。' },
    ],
    'cell-life': [
      { wrong: '細胞就是肉眼看到的所有小顆粒。', right: '細胞是生物構造與功能的基本單位，需要依生物學構造證據辨認。', why: '灰塵、結晶或氣泡也可能在顯微鏡下呈小顆粒。' },
      { wrong: '所有細胞都有完全相同的形狀與構造。', right: '不同細胞可因功能與生物類群而具有不同形態與構造特徵。', why: '基本生命機制有共通性，但細胞高度多樣。' },
    ],
    'ecology-environment': [
      { wrong: '食物網中的一種生物改變，只會影響自己。', right: '族群透過食物、棲地、競爭等關係互相連結，變化可能產生連鎖影響。', why: '生態系是多個生物與環境因素的網絡。' },
      { wrong: '觀察到兩個族群同時變化就已證明彼此直接因果。', right: '先視為關聯，再檢查時間、機制與其他環境變因。', why: '共同環境因素也可能同時影響兩者。' },
    ],
    'genetics-evolution': [
      { wrong: '獲得性改變一定會直接遺傳給下一代。', right: '可遺傳變異涉及遺傳資訊；個體生活中取得的改變不等於都能遺傳。', why: '遺傳需要看影響是否進入可傳給後代的遺傳資訊。' },
      { wrong: '演化是個體為了適應環境而主動改變自己。', right: '演化描述族群中可遺傳變異在世代間頻率改變。', why: '選汰作用於既有變異，不是個體依需要產生指定改變。' },
    ],
    physiology: [
      { wrong: '一個器官系統可以完全獨立運作。', right: '生物體的系統透過物質、訊息與能量交換協同維持功能。', why: '例如運動同時牽涉呼吸、循環、神經與肌肉。' },
      { wrong: '任何生理數值變高都代表疾病。', right: '先考慮活動、環境與調節範圍，再判斷是否異常。', why: '許多生理變化是正常調節反應。' },
    ],
    'matter-properties': [
      { wrong: '物質混合就一定產生新物質。', right: '混合可能只是物理混合；是否發生化學反應要看新性質與反應證據。', why: '混合與反應是不同概念。' },
      { wrong: '所有看不見的微觀粒子模型都代表真實大小比例。', right: '粒子圖常是模型，需要看圖例與比例說明。', why: '教學模型會放大粒子並簡化空間關係。' },
    ],
    'chemical-reaction': [
      { wrong: '產生氣體代表質量一定消失。', right: '是否量到質量改變要看系統是否開放；密閉系統總質量守恆。', why: '開放系統的氣體可能離開量測範圍。' },
      { wrong: '化學方程式係數可以靠改變化學式下標來配平。', right: '配平改變反應物／生成物前的係數，不任意改變物質化學式。', why: '改下標會把物質本身變成另一種化合物。' },
    ],
    'chemistry-advanced': [
      { wrong: '化學平衡表示正逆反應都停止。', right: '平衡是正逆反應速率相等的動態狀態。', why: '巨觀濃度穩定不表示微觀反應停止。' },
      { wrong: '催化劑會改變平衡常數並讓平衡只往產物移動。', right: '催化劑加快正逆反應達平衡的速率，但在同溫下不改變平衡常數。', why: '催化降低活化能而不改變反應熱力學平衡位置。' },
    ],
    'force-motion': [
      { wrong: '物體在移動就一定有一個向前的淨力。', right: '等速直線運動時淨力可為零。', why: '力決定速度如何改變，而不是是否「存在速度」。' },
      { wrong: '質量越大的物體一定落得比較快。', right: '忽略空氣阻力時，自由落體加速度與質量無關。', why: '重力與慣性質量同時增加，使加速度相同。' },
    ],
    'energy-heat': [
      { wrong: '溫度和熱是同一個物理量。', right: '溫度描述熱狀態；熱是因溫差造成的能量傳遞。', why: '單位與物理意義不同。' },
      { wrong: '能量守恆表示每一種能量形式都不變。', right: '總能量守恆時，能量形式仍可互相轉換。', why: '例如位能可轉成動能與內能。' },
    ],
    'waves-optics': [
      { wrong: '聲音在真空中也能像光一樣傳播。', right: '一般聲波需要介質傳遞；光的電磁波可在真空傳播。', why: '兩者的傳播機制不同。' },
      { wrong: '頻率越高一定代表聲音越大聲。', right: '頻率主要關聯音高；振幅等因素更直接關聯響度。', why: '頻率與振幅是不同波的參數。' },
    ],
    'electricity-magnetism': [
      { wrong: '電流在通過燈泡後被「用完」。', right: '穩態串聯電路中同一支路電流連續；燈泡轉換的是電能。', why: '電荷不在元件內被消耗掉。' },
      { wrong: '只要有電池，就算回路斷開也一定有持續電流。', right: '持續電流需要完整閉合路徑。', why: '斷路時電荷無法沿完整路徑持續流動。' },
    ],
    'earth-geology': [
      { wrong: '地震只發生在地表裂縫看得到的地方。', right: '地震震源可位於地下，與斷層或板塊運動等地質作用相關。', why: '地表破裂不是所有地震都會出現的條件。' },
      { wrong: '板塊邊界圖可以精確預測下一次地震日期。', right: '板塊分布可說明長期危險區與機制，但不能單獨精確預測個別地震時間。', why: '區域風險與事件預測是不同問題。' },
    ],
    'weather-climate-ocean': [
      { wrong: '今天很冷就代表全球暖化不存在。', right: '單日天氣和長期氣候趨勢是不同時間尺度。', why: '氣候需用長期、大範圍統計分析。' },
      { wrong: '水循環表示每一滴水都按固定順序走完全相同路徑。', right: '水可經蒸發、凝結、降水、逕流、滲透等多種路徑循環。', why: '自然系統是多路徑且受環境條件影響。' },
    ],
    astronomy: [
      { wrong: '月相主要是地球影子每天遮住月球不同部分。', right: '一般月相來自月球繞地球時我們看到的受光面比例改變。', why: '地球影子造成的是特定的月食現象，不是日常月相。' },
      { wrong: '夜空中看起來較亮的星一定離地球更近。', right: '視亮度同時受本質亮度與距離等因素影響。', why: '只看視亮度不能單獨判斷距離。' },
    ],
    'data-project': [
      { wrong: '異常值一定是錯誤，應直接刪掉。', right: '先檢查量測、資料來源與機制，再決定重測、保留或排除。', why: '異常值也可能代表真實現象。' },
      { wrong: '模型越複雜就一定越好。', right: '模型應在目的、可解釋性、資料品質與預測表現間取得平衡。', why: '過度複雜可能讓模型難以驗證或過度貼合資料。' },
    ],
  }
  return pairs[family]
}

export function buildScienceV21(context: V21UnitContext, base: TextbookUnitContentV14): V21SubjectBuild {
  const family = scienceFamily(context)
  const label = familyLabel(family)
  const concepts = cleanConcepts(base, '自然科學中，')
  const misconceptions = buildMisconceptions({ familyLabel: label, pairs: misconceptionPairs(family) })
  const workedExamples = Array.from({ length: 4 }, (_, index) => exampleFromCase(context, family, index))
  const questions = [
    ...quickCheckSet({ unitId: context.unit.id, familyId: family, concepts, maker: (_concept, index, id) => questionFromCase(context, family, index, id, '理解') }),
    ...formalQuestionSet({
      unitId: context.unit.id,
      familyId: family,
      makers: [
        (index, id, level) => questionFromCase(context, family, index, id, level),
        (index, id, level) => questionFromCase(context, family, index + 19, id, level),
        (index, id, level) => questionFromCase(context, family, index + 37, id, level),
      ],
    }),
  ]
  const visuals = visualSet({
    unitId: context.unit.id,
    familyLabel: label,
    concepts,
    process: [
      { label: '觀察／量測', detail: '先留下現象、數值、影像或操作條件，不把推論寫進觀察。' },
      { label: '變因／模型', detail: `依${label}辨認重要變因、結構、能量或系統關係。` },
      { label: '證據', detail: '比較資料是否真的支持假設或模型，並檢查重複與不確定性。' },
      { label: '有限度結論', detail: '結論只說證據能支持的範圍，清楚標示模型、推論與限制。' },
    ],
    compare: misconceptions.map((item, index) => ({ label: `迷思 ${index + 1}`, detail: `${item.claim} → ${item.correction}` })),
  })
  return {
    familyId: family,
    familyLabel: label,
    overview: unitOverview(context, label, `「${label}」中的現象、量測、模型與證據鏈`),
    objectives: unitObjectives(context, label, ['從實際觀察或數據區分事實與推論', '使用本單元科學模型解釋現象', '說明證據能支持什麼以及不能支持什麼']),
    concepts,
    misconceptions,
    visuals,
    workedExamples,
    questions,
    takeaway: [
      `「${context.unit.title}」要用實際現象與證據學，不以泛用「兩盆幼苗」題代替所有自然科單元。`,
      '觀察、模型、推論與結論要分開標示。',
      '數據題要保留單位、量測條件與不確定性；實驗題要清楚控制與操縱變因。',
      '科學模型是解釋工具，不一定按真實比例，也不能超出證據範圍使用。',
    ],
  }
}

export function getScienceFamilyV21(context: V21UnitContext) {
  return scienceFamily(context)
}
