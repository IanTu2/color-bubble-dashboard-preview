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

type SocialFamily =
  | 'map-spatial'
  | 'physical-geography'
  | 'population-urban'
  | 'industry-economic-geography'
  | 'history-source'
  | 'taiwan-history'
  | 'eastasia-world-history'
  | 'culture-society'
  | 'civics-community'
  | 'government-democracy'
  | 'law-rights'
  | 'market-economy'
  | 'media-public'
  | 'environment-global'
  | 'policy-welfare'
  | 'research-project'

type SocialCase = {
  context: string
  prompt: string
  answer: string
  distractors: string[]
  steps: string[]
  explanation: string
}

function socialFamily(context: V21UnitContext): SocialFamily {
  const text = `${context.unit.title} ${context.unit.focus}`
  if (/地圖|位置|空間|地理方法|空間資料|地理資訊/.test(text)) return 'map-spatial'
  if (/地形|自然環境|氣候水文|海域|世界地理|區域分析/.test(text)) return 'physical-geography'
  if (/人口|聚落|都市|移動/.test(text)) return 'population-urban'
  if (/產業|經濟地理|全球經濟|區域與文化/.test(text)) return 'industry-economic-geography'
  if (/史料|時序|歷史解釋|口述|影像|數位史料|公共史|歷史研究|地方的過去/.test(text)) return 'history-source'
  if (/臺灣早期歷史|臺灣歷史|臺灣史|史前|原住民族|大航海|清帝國|日治|戰後臺灣|臺灣與世界/.test(text)) return 'taiwan-history'
  if (/中國|東亞|世界史|近代|戰爭|冷戰|帝國|殖民|革命|全球史|國際秩序|思想|宗教/.test(text)) return 'eastasia-world-history'
  if (/多元文化|文化|社會互動|社會與多元|生活中的公民|社會議題/.test(text) && !/媒體|政策|公平/.test(text)) return 'culture-society'
  if (/自我|家庭|社區|公民生活|公共服務/.test(text)) return 'civics-community'
  if (/民主|政府|政治|憲政|治理|公共參與/.test(text)) return 'government-democracy'
  if (/法律|權利|人權|法治|制度分析/.test(text)) return 'law-rights'
  if (/市場|消費|經濟與市場|經濟生活|總體經濟|經濟選擇|經濟與社會變遷/.test(text)) return 'market-economy'
  if (/媒體|資訊|公共論證|爭議|證據/.test(text)) return 'media-public'
  if (/環境|永續|全球化|全球議題|風險|環境正義/.test(text)) return 'environment-global'
  if (/政策|福利|公平|公共政策/.test(text)) return 'policy-welfare'
  return 'research-project'
}

function familyLabel(family: SocialFamily) {
  const labels: Record<SocialFamily, string> = {
    'map-spatial': '地圖、位置、尺度與空間資料',
    'physical-geography': '自然環境、地形、氣候與區域',
    'population-urban': '人口、移動、聚落與都市',
    'industry-economic-geography': '產業、區位、區域與全球經濟',
    'history-source': '史料、時序與歷史解釋',
    'taiwan-history': '臺灣歷史的多元脈絡',
    'eastasia-world-history': '東亞、世界史與跨區域互動',
    'culture-society': '社會互動、文化與多元觀點',
    'civics-community': '自我、家庭、社區與公民生活',
    'government-democracy': '民主、政府、制度與公共參與',
    'law-rights': '法律、權利、責任與法治',
    'market-economy': '市場、選擇、誘因與經濟資料',
    'media-public': '媒體、資訊、論證與公共議題',
    'environment-global': '全球化、環境變遷、風險與永續',
    'policy-welfare': '公共政策、社會福利與公平',
    'research-project': '社會探究、資料分析與專題表達',
  }
  return labels[family]
}

function socialCase(context: V21UnitContext, family: SocialFamily, index: number): SocialCase {
  const seed = stableHash(`${context.unit.id}-${family}-${index}`)
  const n = (min: number, max: number, shift = 0) => seededInt(seed + shift * 5179, min, max)

  if (family === 'map-spatial') {
    const distance = n(2, 7, 1)
    return {
      context: `地圖比例尺為 1:50,000，圖上 A、B 兩地直線距離約 ${distance} 公分。`,
      prompt: '換算成實際直線距離約是多少公里？',
      answer: `${distance * 0.5} 公里`,
      distractors: [`${distance * 50} 公里`, `${distance / 2} 公尺`, `${distance} 公里`],
      steps: ['讀比例尺 1:50,000', '圖上 1 公分代表實地 50,000 公分', '換成 0.5 公里', `乘上 ${distance}`, '最後確認單位'],
      explanation: `1:50,000 表示圖上 1 cm = 實地 50,000 cm = 0.5 km，因此 ${distance} cm 約為 ${distance * 0.5} km。`,
    }
  }

  if (family === 'physical-geography') {
    const rainA = n(1600, 2600, 1); const rainB = n(600, 1200, 2)
    return {
      context: `甲地年雨量約 ${rainA} mm，乙地約 ${rainB} mm；兩地緯度接近，但甲地位於迎風坡、乙地位於背風側。`,
      prompt: '哪個解釋最能把地形與降水差異連起來？',
      answer: '迎風坡空氣受地形抬升較容易冷卻凝結，背風側可能形成較乾燥的雨影效應',
      distractors: ['緯度接近表示兩地雨量一定完全相同', '背風側一定比迎風坡海拔高', '只看一年雨量就能證明所有年份都完全相同'],
      steps: ['先比較兩地共同條件', '找出地形位置差異', '連到氣流抬升與降水機制', '保留年際變動的限制'],
      explanation: '地形會改變氣流垂直運動，迎風坡與背風側因此可能出現明顯降水差異；實際氣候仍受多項因素共同影響。',
    }
  }

  if (family === 'population-urban') {
    const start = n(80, 130, 1); const end = start + n(15, 45, 2)
    return {
      context: `某都市外圍行政區十年間人口由 ${start} 千人增至 ${end} 千人，同期通勤鐵路新增兩站，住宅開發面積也增加。`,
      prompt: '哪一個判斷最符合地理資料的謹慎解讀？',
      answer: '人口增加、交通改善與住宅開發在時間上同時出現，可能有關聯，但仍需更多資料判斷因果方向',
      distractors: ['新增車站已經單獨證明是人口增加的唯一原因', '人口增加與土地使用完全不可能互相影響', '只要人口變多就代表生活品質一定提高'],
      steps: ['確認人口變化', '加入交通與土地使用變化', '先描述共變關係', '再找時間順序、其他因素與比較地區'],
      explanation: '社會與空間現象常互相影響；資料可先支持關聯，但不能僅靠同時發生就下唯一因果結論。',
    }
  }

  if (family === 'industry-economic-geography') {
    const costA = n(35, 55, 1); const costB = costA + n(8, 20, 2)
    return {
      context: `某工廠比較兩個設址：A 地原料運輸成本每單位 ${costA} 元、靠近主要市場；B 地運輸成本 ${costB} 元，但土地成本較低且有較大擴充空間。`,
      prompt: '哪個分析方式最符合產業區位思考？',
      answer: '把運輸、市場、土地、勞動力與未來擴充等條件一起比較，而不是只看單一成本',
      distractors: ['只要土地便宜就一定是最佳區位', '離市場近的地點永遠不需要考慮其他成本', '產業區位與交通、原料、勞動力完全無關'],
      steps: ['列出不同區位因子', '把各因子轉成可比較資訊', '依產業需求決定權重', '檢查是否有環境或政策限制'],
      explanation: '產業區位通常是多條件權衡，單一價格不能代表整體最適選擇。',
    }
  }

  if (family === 'history-source') {
    const year = n(1910, 1980, 1)
    return {
      context: `資料甲：${year} 年地方報紙的一則社論。資料乙：同年政府統計表。資料丙：五十年後受訪者回憶當時生活。`,
      prompt: '若研究「當時人如何看待某項政策」與「政策實際影響」，最好的做法是什麼？',
      answer: '比較不同類型史料：社論可見部分當時觀點，統計可提供量化資訊，回憶則要考慮記憶與後見之明',
      distractors: ['三種史料只能選一種，其他全部不可信', '後來的回憶一定比當時資料更客觀', '政府統計有數字，所以不需要檢查統計定義與目的'],
      steps: ['確認史料形成時間與作者', '辨認史料類型與目的', '比較可回答的問題', '交叉檢證並指出限制'],
      explanation: '不同史料提供不同面向；歷史研究重視來源脈絡與交叉檢證，而不是把某一種材料當成全貌。',
    }
  }

  if (family === 'taiwan-history') {
    return {
      context: '同一港口地區在不同時期留下原住民族交換紀錄、外來商船航海記、清代地方行政文書與日治時期統計。',
      prompt: '若要理解這個地區長期變遷，哪個做法最適合？',
      answer: '把不同時期、不同立場的材料放入各自時代脈絡，追蹤人口、貿易、治理與地方社會如何改變',
      distractors: ['只選最後一個時期的材料代表全部歷史', '把所有時期都用今天的制度名稱解釋', '不同族群留下的資料互相不同，所以無法研究'],
      steps: ['先排出時序', '辨認每份材料的作者與位置', '比較制度與社會關係的變化', '保留不同群體經驗與史料限制'],
      explanation: '臺灣史的長期變遷需要跨時期、跨群體比較；同一地點在不同政治與經濟網絡中可能扮演不同角色。',
    }
  }

  if (family === 'eastasia-world-history') {
    const items = [
      { context: '甲資料記錄新航路開通後港口貿易量增加；乙資料記錄殖民地勞動制度擴張；丙資料顯示跨洲作物與疾病傳播。', answer: '把貿易、權力、人口與環境變化放在跨區域連結中一起解釋' },
      { context: '一場戰爭前後，政府財政、徵兵制度、報紙政治語言與民眾生活紀錄都發生變化。', answer: '同時分析國家制度、社會動員與日常生活，避免只用戰場勝負代表整個歷史影響' },
      { context: '某思想在不同地區傳播後，被地方政治與宗教傳統重新解釋。', answer: '思想傳播不是單向複製，要比較原始概念與地方轉化' },
    ]
    const item = items[n(0, items.length - 1, 1)]
    return {
      context: item.context,
      prompt: '哪個歷史解釋方式最適合這組材料？',
      answer: item.answer,
      distractors: ['只背事件年份，不需要看社會關係', '所有地區的歷史發展一定遵循完全相同順序', '只要一份材料寫得詳細就能代表所有群體'],
      steps: ['先建立時序與區域', '分辨政治、經濟、社會、文化層面', '找跨區域互動與地方差異', '用多份史料限制結論範圍'],
      explanation: '世界史與東亞史需要同時看連結與差異，不能只把一地經驗當成普遍模型。',
    }
  }

  if (family === 'culture-society') {
    return {
      context: '班上討論節慶服飾時，有同學說：「同一族群的人應該都穿一樣、想法也一樣。」另一位同學拿出不同家庭、世代與地區的訪談紀錄。',
      prompt: '哪個回應較符合社會與文化的分析？',
      answer: '文化有共享元素，也存在家庭、世代、地區與個人差異，不能用單一特徵固定化整個群體',
      distractors: ['只要同一族群，生活經驗一定完全相同', '文化差異表示彼此無法溝通', '訪談只要有一個例子就能代表所有人'],
      steps: ['區分群體共享與內部差異', '看資料來自哪些人', '避免刻板化', '比較制度、歷史與個人選擇如何交織'],
      explanation: '社會群體內部也有差異；尊重多元不只是「接受不同」，還要避免把群體當成單一固定樣貌。',
    }
  }

  if (family === 'civics-community') {
    return {
      context: '社區公園晚間照明不足，有居民擔心安全，也有人擔心增加光害與能源使用。里民會蒐集使用人數、事故紀錄、照度與居民意見。',
      prompt: '哪個做法最符合公共問題的處理？',
      answer: '先釐清不同需求與證據，再比較多個方案的安全、成本與環境影響',
      distractors: ['只採用聲音最大的一方，不需要資料', '把不同意見視為一定有人惡意', '公共問題一定只有一個完全沒有代價的答案'],
      steps: ['定義公共問題', '找出受影響群體', '蒐集資料與不同意見', '比較方案與代價', '形成可說明的選擇'],
      explanation: '公民生活中的問題常有多方需求，需要證據、對話與權衡，而不是把價值衝突假裝成單純事實題。',
    }
  }

  if (family === 'government-democracy') {
    return {
      context: '某市要調整一項公共設施設計。市府提出草案，議會公開討論預算，居民可參加說明會並提出意見，執行後另有公開評估報告。',
      prompt: '這個案例最能呈現民主治理的哪個重點？',
      answer: '公共決策包含不同機關角色、公開討論、人民參與與事後問責，而不是由單一人物任意決定',
      distractors: ['民主表示所有政策都必須每人完全同意', '有選舉就不需要資訊公開或監督', '公共預算與政治責任無關'],
      steps: ['辨認決策機關與程序', '找參與與監督機制', '區分多數決與權利保障', '檢查執行後是否可被問責'],
      explanation: '民主治理不只是一場投票，也包括制度分工、公開性、參與、權利與責任。',
    }
  }

  if (family === 'law-rights') {
    return {
      context: '班級規則規定「任何同學只要被匿名檢舉，就立即失去參加活動資格，不需要說明理由或查證」。',
      prompt: '若從法治與程序保障概念檢視，最值得質疑的是什麼？',
      answer: '處分前缺少查證、理由與讓當事人陳述的基本程序，容易造成任意處置',
      distractors: ['只要是規則就永遠不能被檢討', '匿名檢舉一定全部是假的', '權利保障表示任何規則都不能存在'],
      steps: ['確認規則目的', '辨認被限制的權益', '檢查程序是否透明與可陳述', '比較限制手段是否必要且合宜'],
      explanation: '法治不等於「有規則就好」，還重視權限、程序、理由與權利保障。實際法律案件仍須依具體法規與事實判斷。',
    }
  }

  if (family === 'market-economy') {
    const p1 = n(30, 60, 1); const q1 = n(90, 130, 2); const p2 = p1 + n(10, 25, 3); const q2 = q1 - n(15, 35, 4)
    return {
      context: `某商品價格由 ${p1} 元升到 ${p2} 元，同期每週購買量由 ${q1} 件降到 ${q2} 件；其他條件是否相同尚未確認。`,
      prompt: '哪個敘述最符合經濟資料判讀？',
      answer: '資料顯示價格上升與購買量下降同時出現，和一般需求關係方向一致，但仍需檢查收入、替代品等其他因素',
      distractors: ['已證明價格是購買量變化的唯一原因', '價格越高，需求量一定越高', '市場資料不需要考慮其他條件'],
      steps: ['先描述價格與數量變化', '對照需求概念', '檢查其他條件是否可能改變', '避免把相關方向直接寫成唯一因果'],
      explanation: '需求概念通常在其他條件相同下討論價格與需求量關係；真實資料要另外檢查其他因素。',
    }
  }

  if (family === 'media-public') {
    return {
      context: '社群貼文寫：「本校九成學生都支持延後上課！」點開來源後發現問卷只在某個 30 人社團中發放，共 20 人作答，其中 18 人支持。',
      prompt: '這則貼文最主要的資料問題是什麼？',
      answer: '把小型、特定社團的作答結果直接推廣成「全校學生」意見，母群體與樣本不相符',
      distractors: ['18/20 不是 90%', '只要是網路問卷就完全不能使用', '支持延後上課的意見一定是錯的'],
      steps: ['先找原始資料', '確認樣本怎麼來', '比較樣本與宣稱的母群體', '再檢查比例、題目文字與未回覆者'],
      explanation: '18/20 的確是 90%，問題在抽樣範圍；特定社團不能直接代表全校。媒體識讀要把數字和資料來源一起看。',
    }
  }

  if (family === 'environment-global') {
    const years = n(15, 35, 1)
    return {
      context: `某沿海地區整理 ${years} 年潮位、颱風淹水範圍、土地使用與人口資料，發現暴露於淹水風險的住宅增加。`,
      prompt: '若討論氣候風險與調適，哪個分析最完整？',
      answer: '同時看自然危害變化、人口與土地使用的暴露度，以及防災能力，不能只看單一氣象指標',
      distractors: ['只要有淹水就是單一因素造成', '風險只由自然現象決定，和人口分布無關', '只要建更高的牆就一定沒有任何其他代價'],
      steps: ['區分危害、暴露與脆弱度', '比較長期自然資料', '加入人口與土地使用', '評估不同調適方案與分配效果'],
      explanation: '社會風險是自然與社會條件共同作用的結果；調適政策也涉及成本、空間與公平。',
    }
  }

  if (family === 'policy-welfare') {
    return {
      context: '某市評估增加課後照顧補助。資料包含家庭所得分布、目前使用率、候補人數、每增加一個名額的成本，以及不同地區的服務距離。',
      prompt: '若要評估政策是否公平且有效，最適合怎麼做？',
      answer: '同時比較誰得到服務、哪些需求仍未滿足、成本與可近性，並明確說明公平判準',
      distractors: ['只看總支出越高就代表政策越好', '只看平均使用率，不需要知道不同群體差異', '公平只有一種定義，不需要說明判準'],
      steps: ['先定義政策目標', '辨認受益與未受益群體', '比較成本、覆蓋與結果', '明確說明使用的公平標準', '檢查可能的副作用'],
      explanation: '公共政策評估要把目標、資源、分配與結果連起來；公平判斷需要公開其規範標準。',
    }
  }

  const values = [n(42, 68, 1), n(50, 79, 2), n(35, 64, 3)]
  return {
    context: `專題調查三個地區的某項指標分別為 ${values.join('、')}；三地資料年份一致，但定義與抽樣方式尚待確認。`,
    prompt: '進一步比較前，最重要的下一步是什麼？',
    answer: '先確認三地指標定義、資料來源與抽樣方式可比，再進行差異解釋',
    distractors: ['直接把最大值地區評為最好', '因為年份相同就代表其他方法完全相同', '只畫漂亮圖表，不需要讀資料說明'],
    steps: ['確認研究問題', '查資料定義與來源', '檢查年份與方法可比性', '完成描述統計', '再提出有限度解釋'],
    explanation: '社會資料的數值只有在定義與蒐集方式可比時，跨地區比較才有清楚意義。',
  }
}

function exampleFromCase(context: V21UnitContext, family: SocialFamily, index: number): ReviewedWorkedExample {
  const item = socialCase(context, family, index)
  return { title: `${familyLabel(family)}案例 ${index + 1}`, context: item.context, prompt: item.prompt, steps: item.steps, answer: item.answer, explanation: item.explanation }
}

function questionFromCase(context: V21UnitContext, family: SocialFamily, index: number, id: string, level: '理解' | '應用' | '檢核'): ReviewedQuestion {
  const item = socialCase(context, family, index + 15)
  if (index % 5 === 4) {
    return responseQuestion({
      id,
      level,
      context: item.context,
      prompt: `${item.prompt} 請指出你使用的資料、史料、制度條件或判斷標準。`,
      sampleAnswer: `${item.answer}。判斷時需要：${item.steps.join(' → ')}。`,
      explanation: item.explanation,
      rubric: ['使用題目中的具體資料或史料', '區分事實、推論與價值判斷', '說明結論限制或其他可能觀點'],
    })
  }
  return choiceQuestion({ id, level, context: item.context, prompt: item.prompt, correct: item.answer, distractors: item.distractors, explanation: item.explanation })
}

function misconceptionPairs(family: SocialFamily) {
  const pairs: Record<SocialFamily, Array<{ wrong: string; right: string; why: string }>> = {
    'map-spatial': [
      { wrong: '地圖看起來面積比較大，就代表真實世界一定比較大。', right: '先確認投影、比例尺、範圍與圖例再比較。', why: '地圖是對空間的選擇與轉換，不是原尺寸縮小照片。' },
      { wrong: '比例尺分母數字越大，地圖細節一定越多。', right: '同尺寸圖幅下，分母越大通常涵蓋範圍越大、細節越少。', why: '大比例尺與小比例尺的「大／小」指比例大小，不是分母大小。' },
    ],
    'physical-geography': [
      { wrong: '緯度相同的地方氣候一定完全相同。', right: '緯度重要，但海陸、地形、洋流、季風等也會影響氣候。', why: '自然環境由多個空間條件共同作用。' },
      { wrong: '地形只是景觀，和人類活動無關。', right: '地形會影響交通、聚落、農業、災害與土地利用。', why: '自然條件與人類活動彼此交互作用。' },
    ],
    'population-urban': [
      { wrong: '人口增加一定表示出生率提高。', right: '人口變化同時受到出生、死亡與遷移影響。', why: '淨遷移可在出生率不變時改變人口。' },
      { wrong: '人口密度高就表示生活品質一定差。', right: '密度需和交通、住房、公共服務、所得與環境等一起分析。', why: '單一密度指標不能代表完整生活品質。' },
    ],
    'industry-economic-geography': [
      { wrong: '產業只會選土地最便宜的地方。', right: '區位涉及市場、原料、交通、勞動、技術、政策、環境與群聚等多種因子。', why: '不同產業對各因子的權重不同。' },
      { wrong: '全球化表示所有產業都移到同一個地方。', right: '全球化可讓生產鏈分工更跨區域，同時形成不同節點與專業化。', why: '連結增加不等於空間差異消失。' },
    ],
    'history-source': [
      { wrong: '第一手史料一定完全客觀可靠。', right: '第一手史料也有作者立場、目的、知識限制與保存偏差。', why: '接近事件不等於沒有觀點。' },
      { wrong: '後來寫的研究一定比當時史料差。', right: '後來研究可整合更多史料，但仍要檢查方法與論證。', why: '史料價值取決於研究問題與來源脈絡。' },
    ],
    'taiwan-history': [
      { wrong: '臺灣歷史可以只用單一族群或政權的視角代表全部。', right: '需要比較不同族群、地方、政權與跨海網絡的經驗。', why: '同一時期不同群體可能有非常不同的歷史處境。' },
      { wrong: '今天的行政區與身份概念可以直接套用到所有歷史時期。', right: '歷史概念要放回當時制度與社會語境。', why: '政治邊界、分類與名稱會隨時間改變。' },
    ],
    'eastasia-world-history': [
      { wrong: '世界史就是把各國年表排在一起。', right: '還要分析跨區域互動、制度差異與共同變遷。', why: '貿易、帝國、移民、思想與疾病等都跨越政治邊界。' },
      { wrong: '某地較早發生的變化就是其他地方的唯一原因。', right: '跨區域影響要檢查傳播機制、地方條件與多重因果。', why: '時間先後不等於單向因果。' },
    ],
    'culture-society': [
      { wrong: '同一群體的人一定有完全相同價值與生活方式。', right: '群體有共享文化，也有世代、地區、階級、性別與個人差異。', why: '把群體本質化會形成刻板印象。' },
      { wrong: '尊重多元就是任何說法都不能討論或批評。', right: '可以討論行為與制度，同時避免以偏概全和貶抑群體身份。', why: '多元尊重與理性公共討論可以同時存在。' },
    ],
    'civics-community': [
      { wrong: '公共問題只要找一個人負責就能解決。', right: '先辨認利害關係人、制度權責與可行方案。', why: '社區問題往往跨越多個角色與資源。' },
      { wrong: '個人權利和公共責任一定互相對立。', right: '制度常需要在權利保障、他人權益與公共利益間建立可說明的界線。', why: '公民生活需要權利與責任一起討論。' },
    ],
    'government-democracy': [
      { wrong: '民主只等於多數決。', right: '民主也包含權利保障、法治、資訊公開、權力制衡與公民參與。', why: '單一多數不能正當化任意侵害基本權利。' },
      { wrong: '有選舉就不需要日常監督。', right: '民主治理需要持續的問責、公開與制度監督。', why: '公共權力在選舉之間仍持續運作。' },
    ],
    'law-rights': [
      { wrong: '有規定就一定符合法治。', right: '還要檢查權限、程序、明確性、比例與權利保障。', why: '任意規則不等於法治。' },
      { wrong: '權利表示個人永遠不受任何限制。', right: '權利保障重要，但具體行使仍可能在法律與他人權利下有合比例的限制。', why: '需分析具體權利、目的、法律依據與限制程度。' },
    ],
    'market-economy': [
      { wrong: '價格上漲就等於需求增加。', right: '要區分需求量沿需求曲線變動與需求條件本身改變。', why: '價格與其他影響需求的因素是不同概念。' },
      { wrong: '經濟選擇只有金錢成本。', right: '還要考慮時間、機會成本、風險與其他資源。', why: '選擇意味著放棄其他可能方案。' },
    ],
    'media-public': [
      { wrong: '百分比看起來很高就代表全體意見。', right: '還要檢查母群體、樣本、回覆率與題目設計。', why: '比例不能脫離資料如何產生。' },
      { wrong: '來源有引用就一定可靠。', right: '仍要追到原始來源、資料方法與引用是否忠實。', why: '二手轉述可能斷章取義或誤用數據。' },
    ],
    'environment-global': [
      { wrong: '災害風險只由自然現象強度決定。', right: '風險還受到人口暴露、基礎設施、脆弱度與調適能力影響。', why: '同樣自然事件在不同社會條件下造成的損失可能不同。' },
      { wrong: '永續政策只要對環境好就沒有任何社會成本。', right: '要一起評估環境、經濟、社會分配與世代影響。', why: '政策常涉及不同群體的成本與利益。' },
    ],
    'policy-welfare': [
      { wrong: '政策花越多錢就一定越有效。', right: '要比較目標、投入、覆蓋、結果與替代方案。', why: '支出是投入，不等於成果。' },
      { wrong: '公平就是每個人拿完全一樣的資源。', right: '公平可能涉及平等、需求、機會、補償等不同判準，要明確說明。', why: '不同公平觀會導向不同政策設計。' },
    ],
    'research-project': [
      { wrong: '圖表做得漂亮就代表研究可信。', right: '可信度來自清楚問題、適當資料、方法透明與合理推論。', why: '視覺呈現不能取代研究設計。' },
      { wrong: '資料年份一樣就一定可以直接比較。', right: '還要檢查定義、抽樣、空間範圍與資料來源。', why: '相同年份不代表測量的是同一件事。' },
    ],
  }
  return pairs[family]
}

export function buildSocialV21(context: V21UnitContext, base: TextbookUnitContentV14): V21SubjectBuild {
  const family = socialFamily(context)
  const label = familyLabel(family)
  const concepts = cleanConcepts(base, '社會領域中，')
  const misconceptions = buildMisconceptions({ familyLabel: label, pairs: misconceptionPairs(family) })
  const workedExamples = Array.from({ length: 4 }, (_, index) => exampleFromCase(context, family, index))
  const questions = [
    ...quickCheckSet({ unitId: context.unit.id, familyId: family, concepts, maker: (_concept, index, id) => questionFromCase(context, family, index, id, '理解') }),
    ...formalQuestionSet({
      unitId: context.unit.id,
      familyId: family,
      makers: [
        (index, id, level) => questionFromCase(context, family, index, id, level),
        (index, id, level) => questionFromCase(context, family, index + 21, id, level),
        (index, id, level) => questionFromCase(context, family, index + 43, id, level),
      ],
    }),
  ]
  const visuals = visualSet({
    unitId: context.unit.id,
    familyLabel: label,
    concepts,
    process: [
      { label: '來源／資料', detail: '先確認地圖、史料、統計、制度文本或訪談從哪裡來、何時形成。' },
      { label: '脈絡', detail: `依${label}確認時間、空間尺度、制度、群體與資料定義。` },
      { label: '比較', detail: '區分事實、推論、價值判斷，並比較不同來源或觀點。' },
      { label: '有限度結論', detail: '說明證據支持到哪裡，以及還缺哪些資料或其他觀點。' },
    ],
    compare: misconceptions.map((item, index) => ({ label: `迷思 ${index + 1}`, detail: `${item.claim} → ${item.correction}` })),
  })
  return {
    familyId: family,
    familyLabel: label,
    overview: unitOverview(context, label, `「${label}」中的地圖、史料、統計、制度或公共議題證據`),
    objectives: unitObjectives(context, label, ['辨認資料來源、時間與空間脈絡', '用至少兩項證據比較解釋或方案', '區分可以由資料判斷的事實與需要說明價值標準的主張']),
    concepts,
    misconceptions,
    visuals,
    workedExamples,
    questions,
    takeaway: [
      `「${context.unit.title}」必須真的處理這個單元的地圖、史料、制度或資料，不再共用車站距離／人口題。`,
      '先問資料從哪裡來、何時形成、代表誰，再開始解釋。',
      '相關不等於因果；歷史解釋、公共政策與社會議題都要保留證據範圍與其他可能觀點。',
      '當代法律、制度與統計若可能變動，正式 V20 通過前仍需重新查核最新官方來源。',
    ],
  }
}

export function getSocialFamilyV21(context: V21UnitContext) {
  return socialFamily(context)
}
