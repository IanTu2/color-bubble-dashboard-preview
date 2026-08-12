import {
  getCurriculumCourseMeta,
  resolveCurriculumUnit,
  type CurriculumPathwayId,
  type CurriculumSubjectId,
} from './curriculum-plan-v5'
import type { FoundationUnitContent } from './curriculum-foundation-content'
import type { ReviewedConcept, ReviewedWorkedExample } from './curriculum-reviewed-social10'

function compact(value: string) {
  return value.replace(/^建立|^理解|^認識|^練習|^掌握|^分析|^統整|^使用|^運用|^從|^以|^處理|^閱讀|^辨識|^熟悉|^加強|^探討/, '').trim()
}

function phrases(title: string, focus: string) {
  const seen = new Set<string>()
  return `${title}。${focus}`
    .split(/[。；，、]|以及|並且|並|與|和/)
    .map((item) => compact(item.trim()))
    .filter((item) => item.length >= 2)
    .filter((item) => {
      const key = item.replace(/[「」『』（）()：:]/g, '')
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 8)
}

function lifeConcept(phrase: string): ReviewedConcept {
  return {
    title: phrase,
    explanation: `生活課程學「${phrase}」時，先從自己的生活經驗提出問題，再透過觀察、操作、訪問、比較或合作找到線索，最後用圖畫、動作或簡短語句分享發現。重點不是把自然和社會拆成兩本課本，而是把同一個生活問題連起來。`,
    example: '例如探索校園時，可以同時觀察植物、辨認空間位置、詢問工作人員的工作，並討論怎麼安全使用公共空間。',
  }
}

function subjectConcept(subject: CurriculumSubjectId, phrase: string): ReviewedConcept {
  if (subject === 'math') return {
    title: phrase,
    explanation: `理解「${phrase}」時要能在符號、圖形、數值與情境之間轉換。先說清楚已知量與關係，再選方法，最後用代回、估算、圖形或另一種表示檢查。`,
    example: '不要只記公式名稱；換一組數值或圖形後，仍要能說明同一個關係為什麼成立。',
  }
  if (subject === 'science') return {
    title: phrase,
    explanation: `理解「${phrase}」時先區分觀察、模型與解釋，再用可測量的證據檢查模型是否支持現象。高中分科課程還要注意量、單位、控制條件與證據的適用範圍。`,
    example: '先寫出可以直接量測或從圖表讀到的證據，再說明哪個物理、化學、生物或地科模型可以解釋它。',
  }
  if (subject === 'social') return {
    title: phrase,
    explanation: `理解「${phrase}」時先確認資料來源、時間與尺度，再區分資料直接顯示的事實、對原因的解釋與價值判斷。高中分科後要使用各科方法形成有證據的論證。`,
    example: '地理先看空間資料，歷史先查史料脈絡，公民與社會則要比較制度、權利、利益與政策證據。',
  }
  return {
    title: phrase,
    explanation: `理解「${phrase}」時先放回完整語境，找出可檢查的線索，再用自己的話重述並換一個新例子。`,
  }
}

function buildConcepts(subject: CurriculumSubjectId, pathway: CurriculumPathwayId | undefined, title: string, focus: string) {
  const source = phrases(title, focus)
  const concepts = source.map((phrase) => pathway === 'life' ? lifeConcept(phrase) : subjectConcept(subject, phrase))
  while (concepts.length < 4) {
    const phrase = `${title}的核心關係 ${concepts.length + 1}`
    concepts.push(pathway === 'life' ? lifeConcept(phrase) : subjectConcept(subject, phrase))
  }
  return concepts.slice(0, pathway === 'life' ? 5 : 8)
}

function workedExample(subject: CurriculumSubjectId, pathway: CurriculumPathwayId | undefined, title: string, focus: string): ReviewedWorkedExample {
  if (pathway === 'life') return {
    title: '從生活問題完成一次小探究',
    context: `今天要探索「${title}」。老師不先公布答案，而是請大家從校園或家庭生活找到一個可以實際觀察的例子。`,
    prompt: '怎麼做才不是只說「我覺得」，而是真的有發現？',
    steps: ['先說出想知道的問題。', '用看、聽、摸、訪問或實作蒐集可以記錄的線索。', '把觀察畫下來、排順序或做簡單分類。', '和同學比較發現，說出哪裡相同、哪裡不同。', '最後提出一個可以在生活中做到的行動或改進。'],
    answer: '有問題、有觀察、有記錄、有比較，也能把發現說清楚，就是一次完整的生活探究。',
    explanation: focus,
  }
  if (subject === 'math') return {
    title: `把「${title}」從公式變成模型`,
    context: `本單元聚焦：${focus}`,
    prompt: '遇到一題新情境時，應該依什麼順序處理？',
    steps: ['標出已知量、未知量與限制。', '選擇適合的式子、圖形、向量、函數或統計表示。', '完成關鍵推導或計算，保留單位與條件。', '用代回、圖形、極端情況或另一種表示檢查。'],
    answer: '先建模再計算，最後檢查模型與結果是否仍符合原情境。',
    explanation: '高中數學分流後，題目形式會不同，但建模、推理與檢查仍是共同核心。',
  }
  if (subject === 'science') return {
    title: `用證據檢查「${title}」的科學解釋`,
    context: `本單元聚焦：${focus}`,
    prompt: '如果兩個解釋都看起來合理，怎麼決定哪一個比較受到支持？',
    steps: ['先把可直接觀察或量測的結果列出。', '確認控制條件、單位與資料是否可比較。', '寫出每個模型預測應看到什麼證據。', '比較預測與實際資料，保留不確定性與限制。'],
    answer: '選擇和現有證據最一致、又沒有超出資料範圍的解釋，並說明仍需哪些資料。',
    explanation: '分科不代表只背更多名詞；物理、化學、生物與地科都要用模型和證據連結現象。',
  }
  return {
    title: `用資料分析「${title}」`,
    context: `本單元聚焦：${focus}`,
    prompt: '看到一份地圖、史料、統計或政策案例時，怎麼避免太快下結論？',
    steps: ['先確認資料是誰、何時、在哪個尺度產生。', '寫出資料可以直接支持的事實。', '把原因解釋和價值判斷另外列出。', '尋找其他來源、不同群體或替代解釋交叉檢查。'],
    answer: '先把證據、解釋與立場分開，再形成有範圍限制的結論。',
    explanation: '高中社會分科後，地理、歷史、公民與社會各有方法，但都需要可檢查的證據鏈。',
  }
}

export function getPathwayFoundationUnitContent(unitId: string): FoundationUnitContent | null {
  const context = resolveCurriculumUnit(unitId)
  if (!context?.pathway) return null
  const meta = getCurriculumCourseMeta(context.subject, context.pathway)
  const concepts = buildConcepts(context.subject, context.pathway, context.unit.title, context.unit.focus)
  return {
    grade: context.grade,
    subject: context.subject,
    unitId: context.unit.id,
    reviewStatus: 'foundation',
    researchBasis: [
      '十二年國民基本教育課程綱要領域／科目結構',
      `${meta.labelZh} Bubble Space v13 分流課程藍圖`,
      '此層為分流後的基礎教材入口；逐單元人工教科書級審閱仍由 QA registry 個別判定',
    ],
    overview: `這是「${context.unit.title}」的基礎教材層，範圍是：${context.unit.focus}。課程已放在正確的「${meta.labelZh}」路線中，不再和其他分科共用一個模糊入口。`,
    concepts,
    workedExamples: [workedExample(context.subject, context.pathway, context.unit.title, context.unit.focus)],
    questions: [],
    takeaway: concepts.slice(0, 5).map((item) => item.title),
  }
}
