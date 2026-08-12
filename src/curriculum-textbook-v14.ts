import {
  getCurriculumUnitContent,
  type CurriculumQuestionEnhancement,
} from './curriculum-reviewed-content'
import {
  getCurriculumCourseMeta,
  resolveCurriculumUnit,
  type CurriculumPathwayId,
  type CurriculumSubjectId,
} from './curriculum-plan-v5'
import type {
  ReviewedChoiceQuestion,
  ReviewedConcept,
  ReviewedQuestion,
  ReviewedResponseQuestion,
  ReviewedWorkedExample,
} from './curriculum-reviewed-social10'

export type TextbookMisconception = {
  claim: string
  correction: string
  reason: string
}

export type TextbookVisualKind = 'concept-map' | 'process' | 'comparison'

export type TextbookVisual = {
  id: string
  kind: TextbookVisualKind
  title: string
  caption: string
  items: Array<{ label: string; detail: string }>
}

export type TextbookVocabulary = {
  term: string
  definition: string
}

export type TextbookSourceRef = {
  label: string
  url: string
  note: string
}

export type TextbookUnitContentV14 = {
  grade: number
  subject: CurriculumSubjectId
  pathway?: CurriculumPathwayId
  unitId: string
  reviewStatus: 'textbook-ready'
  textbookVersion: 'v14'
  researchBasis: string[]
  sourceRefs: TextbookSourceRef[]
  objectives: string[]
  overview: string
  concepts: ReviewedConcept[]
  misconceptions: TextbookMisconception[]
  visuals: TextbookVisual[]
  vocabulary: TextbookVocabulary[]
  workedExamples: ReviewedWorkedExample[]
  questions: ReviewedQuestion[]
  takeaway: string[]
}

type EnhancedChoice = ReviewedChoiceQuestion & CurriculumQuestionEnhancement
type EnhancedResponse = ReviewedResponseQuestion & CurriculumQuestionEnhancement

type UnitContext = NonNullable<ReturnType<typeof resolveCurriculumUnit>>

const OFFICIAL_SOURCES = {
  syllabusIndex: 'https://www.naer.edu.tw/PageSyllabus?fid=177',
  courseManualIndex: 'https://www.naer.edu.tw/PageSyllabus?fid=197',
  life: 'https://www.naer.edu.tw/upload/1/16/doc/813/%28%E7%99%BC%E5%B8%83%E7%89%88%29%E7%94%9F%E6%B4%BB%E8%AA%B2%E7%A8%8B%E8%AA%B2%E7%A8%8B%E7%B6%B1%E8%A6%81.pdf',
  chinese: 'https://www.naer.edu.tw/upload/1/16/doc/806/%E5%8D%81%E4%BA%8C%E5%B9%B4%E5%9C%8B%E6%B0%91%E5%9F%BA%E6%9C%AC%E6%95%99%E8%82%B2%E8%AA%B2%E7%A8%8B%E7%B6%B1%E8%A6%81%E5%9C%8B%E6%B0%91%E4%B8%AD%E5%B0%8F%E5%AD%B8%E6%9A%A8%E6%99%AE%E9%80%9A%E5%9E%8B%E9%AB%98%E7%B4%9A%E4%B8%AD%E7%AD%89%E5%AD%B8%E6%A0%A1%28%E8%AA%9E%E6%96%87%E9%A0%98%E5%9F%9F%E2%94%80%E5%9C%8B%E8%AA%9E%E6%96%87%29.pdf',
  english: 'https://www.naer.edu.tw/upload/1/16/doc/812/%28%E7%99%BC%E5%B8%83%E7%89%88%29%E5%9C%8B%E6%B0%91%E4%B8%AD%E5%B0%8F%E5%AD%B8%E6%9A%A8%E6%99%AE%E9%80%9A%E5%9E%8B%E9%AB%98%E7%B4%9A%E4%B8%AD%E7%AD%89%E5%AD%B8%E6%A0%A1-%E8%AA%9E%E6%96%87%E9%A0%98%E5%9F%9F-%E8%8B%B1%E8%AA%9E%E6%96%87%E8%AA%B2%E7%A8%8B%E7%B6%B1%E8%A6%81.pdf',
  math: 'https://www.naer.edu.tw/upload/1/16/doc/815/%E5%8D%81%E4%BA%8C%E5%B9%B4%E5%9C%8B%E6%B0%91%E5%9F%BA%E6%9C%AC%E6%95%99%E8%82%B2%E8%AA%B2%E7%A8%8B%E7%B6%B1%E8%A6%81%E5%9C%8B%E6%B0%91%E4%B8%AD%E5%B0%8F%E5%AD%B8%E6%9A%A8%E6%99%AE%E9%80%9A%E5%9E%8B%E9%AB%98%E7%B4%9A%E4%B8%AD%E7%AD%89%E5%AD%B8%E6%A0%A1-%E6%95%B8%E5%AD%B8%E9%A0%98%E5%9F%9F.pdf',
  science: 'https://www.naer.edu.tw/upload/1/16/doc/820/%E5%8D%81%E4%BA%8C%E5%B9%B4%E5%9C%8B%E6%B0%91%E5%9F%BA%E6%9C%AC%E6%95%99%E8%82%B2%E8%AA%B2%E7%A8%8B%E7%B6%B1%E8%A6%81%E5%9C%8B%E6%B0%91%E4%B8%AD%E5%B0%8F%E5%AD%B8%E6%9A%A8%E6%99%AE%E9%80%9A%E5%9E%8B%E9%AB%98%E7%B4%9A%E4%B8%AD%E7%AD%89%E6%A0%A1-%E8%87%AA%E7%84%B6%E7%A7%91%E5%AD%B8%E9%A0%98%E5%9F%9F.pdf',
  social: 'https://www.naer.edu.tw/upload/1/16/doc/819/%E5%8D%81%E4%BA%8C%E5%B9%B4%E5%9C%8B%E6%B0%91%E5%9F%BA%E6%9C%AC%E6%95%99%E8%82%B2%E8%AA%B2%E7%A8%8B%E7%B6%B1%E8%A6%81%E5%9C%8B%E6%B0%91%E4%B8%AD%E5%B0%8F%E5%AD%B8%E6%9A%A8%E6%99%AE%E9%80%9A%E5%9E%8B%E9%AB%98%E7%B4%9A%E4%B8%AD%E7%AD%89%E5%AD%B8%E6%A0%A1-%E7%A4%BE%E6%9C%83%E9%A0%98%E5%9F%9F.pdf',
} as const

const BANNED_MISSING_MATERIAL = [
  /看到一張/, /依圖表而異/, /依文本而異/, /答案依題目而異/, /根據下圖/, /依下圖/, /觀察下圖/, /請看下圖/, /如圖所示/, /依附圖/,
]

function stableHash(value: string) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0
  return Math.abs(hash)
}

function rotate<T>(items: T[], shift: number) {
  if (!items.length) return items
  const safe = shift % items.length
  return [...items.slice(safe), ...items.slice(0, safe)]
}

function clip(value: string, max = 92) {
  const clean = value.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, max - 1).replace(/[，、；：,.!?。！？\s]+$/g, '')}…`
}

function firstSentence(value: string) {
  return value.split(/[。！？!?]/).map((item) => item.trim()).find(Boolean) ?? value.trim()
}

function focusPhrases(context: UnitContext) {
  const seen = new Set<string>()
  return `${context.unit.title}。${context.unit.focus}`
    .split(/[。；，、]|以及|並且|並|與|和/)
    .map((item) => item.replace(/^建立|^理解|^認識|^練習|^掌握|^分析|^統整|^使用|^運用|^從|^以|^處理|^閱讀|^辨識|^熟悉|^加強|^探討/, '').trim())
    .filter((item) => item.length >= 2)
    .filter((item) => {
      const key = item.replace(/[「」『』（）()：:\s]/g, '')
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
}

function methodName(subject: CurriculumSubjectId, pathway?: CurriculumPathwayId) {
  if (pathway === 'life') return '提問 → 觀察／實作 → 記錄 → 比較 → 分享與行動'
  if (subject === 'chinese') return '語境 → 篇章結構 → 文本證據 → 表達效果 → 重述／寫作'
  if (subject === 'english') return '情境 → 語意 → 形式 → 聽讀線索 → 實際使用'
  if (subject === 'math') return '已知／未知 → 表示關係 → 推理或計算 → 驗算 → 回答情境'
  if (subject === 'science') return '問題 → 觀察／量測 → 模型或假設 → 證據檢驗 → 限制'
  return '來源與脈絡 → 資料事實 → 解釋 → 比較證據 → 有範圍的判斷'
}

function stageName(grade: number) {
  if (grade <= 2) return '第一學習階段'
  if (grade <= 4) return '第二學習階段'
  if (grade <= 6) return '第三學習階段'
  if (grade <= 9) return '第四學習階段'
  return '第五學習階段／普通型高中'
}

function sourceRefs(context: UnitContext): TextbookSourceRef[] {
  const courseMeta = getCurriculumCourseMeta(context.subject, context.pathway)
  const primary = context.pathway === 'life' ? OFFICIAL_SOURCES.life : OFFICIAL_SOURCES[context.subject]
  return [
    {
      label: `${courseMeta.labelZh}課程綱要`,
      url: primary,
      note: `${stageName(context.grade)}的領域／科目範圍、學習表現與學習內容依據。`,
    },
    {
      label: '國教院課程手冊索引',
      url: OFFICIAL_SOURCES.courseManualIndex,
      note: '用來核對素養導向教學、課程銜接與教材轉化原則。',
    },
    {
      label: '國教院領域／科目課綱索引',
      url: OFFICIAL_SOURCES.syllabusIndex,
      note: '用來追蹤正式發布版本與後續更新。',
    },
  ]
}

function generatedConcept(context: UnitContext, phrase: string, ordinal: number): ReviewedConcept {
  if (context.pathway === 'life') {
    return {
      title: `從生活探索「${phrase}」`,
      explanation: `學「${phrase}」時，先從孩子真的碰得到的生活情境提出一個可以觀察的問題，再用看、聽、摸、訪問、操作或簡單測量取得線索。記錄時要把「我看到的」和「我猜的原因」分開，最後和同學比較並說出可以採取的生活行動。`,
      example: `例如在「${context.unit.title}」裡，可以選同一個地點連續觀察、畫下變化或記錄人物行動，再用這些紀錄說明自己的發現。`,
    }
  }
  if (context.subject === 'chinese') {
    return {
      title: `「${phrase}」的文本功能與證據`,
      explanation: `處理「${phrase}」不能只抓一個關鍵字。先看它出現在句子或篇章的哪個位置、和前後內容形成什麼關係，再找能支持理解的字詞、句子、段落或表達手法。最後要能用自己的話說明「這個線索如何支持結論」。`,
      example: `在「${context.unit.title}」的閱讀或寫作任務中，先標出文本線索，再說明它對人物、主旨、結構或語氣造成的效果。`,
    }
  }
  if (context.subject === 'english') {
    return {
      title: `「${phrase}」的情境、形式與語意`,
      explanation: `學「${phrase}」時要把意思、句型形式和實際使用情境連在一起。先判斷說話者要完成什麼溝通目的，再觀察關鍵字、動詞形式、語序或語音線索，最後換一個人物、時間或地點重新使用，確認不是只背原句。`,
      example: `在「${context.unit.title}」中，把教材句子的主詞、時間或場所替換後再說一次，並檢查意思和文法是否仍符合新情境。`,
    }
  }
  if (context.subject === 'math') {
    return {
      title: `「${phrase}」的表示、關係與檢查`,
      explanation: `理解「${phrase}」時先說清楚數量、圖形或符號各代表什麼，再把已知、未知和限制整理成算式、圖表、坐標或幾何關係。完成推理後要用代回、估算、單位、圖形或另一種表示檢查，避免只記步驟卻不知道何時可以使用。`,
      example: `遇到「${context.unit.title}」的新題型時，先寫出數量關係再計算；答案完成後至少用一種不同方法檢查結果是否合理。`,
    }
  }
  if (context.subject === 'science') {
    return {
      title: `「${phrase}」的現象、證據與模型`,
      explanation: `理解「${phrase}」要分清楚三層：直接觀察或量測到的現象、用來解釋現象的模型，以及模型能支持到哪個範圍。若要比較兩個解釋，必須先讓資料可比較，再看哪一個預測和證據較一致，不能因為結果「看起來符合」就把相關當成因果。`,
      example: `在「${context.unit.title}」裡，把可量測的變因、控制條件與預期結果先寫出來，再用資料判斷模型是否受到支持。`,
    }
  }
  return {
    title: `「${phrase}」的資料、脈絡與判斷`,
    explanation: `理解「${phrase}」時先確認資料來源、時間、空間尺度與製作者目的，再把資料直接支持的事實、對原因的解釋與價值判斷分開。形成結論前要比較其他來源、不同群體或替代解釋，並說明結論的適用範圍。`,
    example: `在「${context.unit.title}」的案例中，先列出可直接查證的資料，再另外寫出解釋與立場，最後用第二份證據交叉檢查。`,
  }
}

function ensureConcepts(context: UnitContext, source: ReviewedConcept[]) {
  const concepts = source.map((item) => ({
    ...item,
    explanation: item.explanation.trim(),
    example: item.example?.trim(),
  }))
  const titles = new Set(concepts.map((item) => item.title.replace(/[「」『』（）()：:\s]/g, '')))
  const phrases = focusPhrases(context)
  let ordinal = 0
  for (const phrase of phrases) {
    if (concepts.length >= 7) break
    const candidate = generatedConcept(context, phrase, ordinal++)
    const key = candidate.title.replace(/[「」『』（）()：:\s]/g, '')
    if (titles.has(key)) continue
    titles.add(key)
    concepts.push(candidate)
  }
  while (concepts.length < 6) {
    const phrase = `${context.unit.title}核心關係 ${concepts.length + 1}`
    concepts.push(generatedConcept(context, phrase, ordinal++))
  }
  return concepts.slice(0, 8)
}

function buildObjectives(context: UnitContext, concepts: ReviewedConcept[]) {
  const meta = getCurriculumCourseMeta(context.subject, context.pathway)
  return [
    `能用自己的話說明「${context.unit.title}」至少三個核心觀念，並指出它們彼此的關係。`,
    `能使用${meta.labelZh}的「${methodName(context.subject, context.pathway)}」處理本單元的新情境。`,
    `能辨認至少兩個和「${concepts[0]?.title ?? context.unit.title}」相關的常見迷思，說明錯在哪裡。`,
    `能看懂完整示範中的已知／證據、步驟、結論與檢查，而不是只抄最後答案。`,
    `能在未看示範答案的情況下完成分層練習，並用解析或評分焦點修正自己的想法。`,
  ]
}

function misconceptionFor(context: UnitContext, concept: ReviewedConcept, index: number): TextbookMisconception {
  const core = clip(firstSentence(concept.explanation), 110)
  if (context.pathway === 'life') {
    return {
      claim: `只要先猜出「${concept.title}」的答案，就算沒有連續觀察或紀錄也可以。`,
      correction: `生活探究要先留下可以回頭比較的觀察或實作紀錄，再從紀錄提出解釋。`,
      reason: `${core}；沒有紀錄時，很難分辨真正觀察到的變化和事後的印象。`,
    }
  }
  if (context.subject === 'chinese') {
    return {
      claim: `讀到「${concept.title}」時，只要找到和題目一樣的關鍵字就能判斷答案。`,
      correction: `要把關鍵字放回句子與篇章，確認上下文關係以及它真正支持的結論。`,
      reason: `${core}；同一個詞在不同語境可能有不同功能，單靠字面重複容易誤判。`,
    }
  }
  if (context.subject === 'english') {
    return {
      claim: `「${concept.title}」只要逐字翻成中文並背固定句子，換情境也能直接套用。`,
      correction: `先確認溝通情境與語意，再選符合主詞、時間、語序或語氣的形式。`,
      reason: `${core}；英語形式會隨情境與句子功能改變，逐字翻譯不能取代語境判斷。`,
    }
  }
  if (context.subject === 'math') {
    return {
      claim: `「${concept.title}」只要背公式或移項規則，不需要說明數量關係，也不用驗算。`,
      correction: `先把已知、未知與關係表示清楚，再運算，最後用代回、估算、圖形或單位檢查。`,
      reason: `${core}；公式只有在條件符合時才適用，檢查能抓出符號、單位與模型選錯等問題。`,
    }
  }
  if (context.subject === 'science') {
    return {
      claim: `只要一次觀察結果符合「${concept.title}」的預期，就已經證明解釋一定正確。`,
      correction: `科學證據只能在測量條件與資料範圍內支持解釋，還要檢查控制條件、重複性與替代解釋。`,
      reason: `${core}；單一結果可能同時符合多個模型，也可能受未控制變因影響。`,
    }
  }
  return {
    claim: `只要一份資料支持「${concept.title}」的說法，就可以直接推成所有時間、地點與群體都成立。`,
    correction: `先確認來源、時間、尺度與樣本，再和其他證據比較，結論必須保留適用範圍。`,
    reason: `${core}；資料能支持的範圍有限，來源差異與替代解釋都可能改變判斷。`,
  }
}

function buildMisconceptions(context: UnitContext, concepts: ReviewedConcept[]) {
  return concepts.slice(0, 4).map((concept, index) => misconceptionFor(context, concept, index))
}

function buildVisuals(context: UnitContext, concepts: ReviewedConcept[], misconceptions: TextbookMisconception[]): TextbookVisual[] {
  const method = methodName(context.subject, context.pathway).split(' → ')
  return [
    {
      id: `${context.unit.id}-v14-visual-concepts`,
      kind: 'concept-map',
      title: `${context.unit.title}｜概念地圖`,
      caption: '先看概念之間的關係，再進入逐頁解釋；每一格都會在後面的觀念頁展開。',
      items: concepts.slice(0, 6).map((concept) => ({ label: concept.title, detail: clip(firstSentence(concept.explanation), 100) })),
    },
    {
      id: `${context.unit.id}-v14-visual-method`,
      kind: 'process',
      title: `${getCurriculumCourseMeta(context.subject, context.pathway).labelZh}的解題／探究流程`,
      caption: `本單元不只記結論，會反覆使用這條流程處理「${context.unit.title}」的新情境。`,
      items: method.map((label, index) => ({
        label: `${index + 1}. ${label}`,
        detail: index === 0
          ? '先確認題目、文本、資料或現象真正提供了什麼。'
          : index === method.length - 1
            ? '回到原問題檢查答案、證據範圍與表達是否完整。'
            : `把「${context.unit.focus}」中的相關資訊放進這一步，不跳過理由。`,
      })),
    },
    {
      id: `${context.unit.id}-v14-visual-misconception`,
      kind: 'comparison',
      title: '常見迷思：錯在哪裡？',
      caption: '把容易犯的錯和正確判斷並排看，練習辨認「看起來像會、其實理由不成立」的答案。',
      items: misconceptions.slice(0, 4).map((item) => ({ label: clip(item.claim, 58), detail: item.correction })),
    },
  ]
}

function buildVocabulary(concepts: ReviewedConcept[]): TextbookVocabulary[] {
  return concepts.slice(0, 6).map((concept) => ({
    term: concept.title,
    definition: clip(firstSentence(concept.explanation), 120),
  }))
}

function modelSteps(context: UnitContext, concept: ReviewedConcept) {
  if (context.pathway === 'life') return [
    '先把想知道的生活問題說成一句可以觀察的問題。',
    '決定在哪裡、什麼時候、用什麼方式觀察或操作，並注意安全。',
    '把看到、量到或訪問到的線索畫下來或記錄下來。',
    `用「${concept.title}」比較紀錄，分開寫出觀察事實與自己的解釋。`,
    '和同學比較結果，再提出一個可以實際做到的行動或下一步。',
  ]
  if (context.subject === 'chinese') return [
    '先讀完整語境，不先用單一關鍵字猜答案。',
    `標出和「${concept.title}」直接相關的字詞、句子或段落。`,
    '說明這些文本證據彼此如何連起來，而不是只抄原文。',
    '形成解釋後，再檢查是否有其他句子造成不同理解。',
    '最後用自己的話重述，確認沒有超出文本證據。',
  ]
  if (context.subject === 'english') return [
    '先確認人物、時間、地點與溝通目的。',
    `找出「${concept.title}」需要的關鍵語意與形式線索。`,
    '組成完整句子或答案，檢查主詞、動詞、語序與時間是否一致。',
    '把其中一個人物、時間或情境換掉，重新調整句子。',
    '讀或念一次，確認新句子仍自然且意思清楚。',
  ]
  if (context.subject === 'math') return [
    '把已知量、未知量、單位與限制列出來。',
    `選擇能表示「${concept.title}」的算式、圖形、表格、坐標或模型。`,
    '依定義與性質完成推理或計算，每一步保留理由。',
    '用代回、估算、單位、圖形或另一種表示檢查。',
    '把結果翻回原情境，確認回答的就是題目所問的量。',
  ]
  if (context.subject === 'science') return [
    '先列出可以直接觀察或量測的現象與變因。',
    `寫出「${concept.title}」模型預測應該看到什麼結果。`,
    '確認控制條件、量測方式、單位與資料是否可比較。',
    '把實際資料和模型預測比較，指出支持與不支持的地方。',
    '結論只寫到證據能支持的範圍，並留下不確定性或下一個檢驗。',
  ]
  return [
    '先確認資料的製作者、時間、地點、尺度與目的。',
    `列出和「${concept.title}」直接相關、可以查證的資料事實。`,
    '把原因解釋、價值判斷與資料事實分欄整理。',
    '加入第二份來源或不同群體觀點，檢查替代解釋。',
    '形成有證據、有範圍限制的結論，避免把相關直接說成因果。',
  ]
}

function generatedWorkedExample(context: UnitContext, concept: ReviewedConcept, misconception: TextbookMisconception, index: number): ReviewedWorkedExample {
  const example = concept.example ?? `本單元「${context.unit.title}」的情境，聚焦於：${context.unit.focus}`
  if (index % 2 === 0) {
    return {
      title: `完整示範：把「${concept.title}」用在新情境`,
      context: example,
      prompt: `如果不能只背結論，要怎麼依本單元方法分析這個情境？`,
      steps: modelSteps(context, concept),
      answer: `應先依「${methodName(context.subject, context.pathway)}」整理情境，再用「${concept.title}」形成結論；結論必須能指出使用了哪些條件、文本或證據。`,
      explanation: `${concept.explanation} 這個示範刻意把方法寫完整，讓後面的獨立練習可以換情境而不是重抄答案。`,
    }
  }
  return {
    title: `錯誤辨析：為什麼這個想法不成立？`,
    context: `一位同學說：「${misconception.claim}」`,
    prompt: `請先指出問題，再把說法改成能通過本單元檢查的方法。`,
    steps: [
      '圈出原說法把哪些條件、省略步驟或證據範圍忽略了。',
      `回到「${concept.title}」的定義、關係或文本／資料證據。`,
      `用正確方法重寫：${misconception.correction}`,
      '用一個反例、驗算、第二份證據或換情境檢查修正後的說法。',
      '最後說明原迷思為什麼容易出現，以及之後如何避免。',
    ],
    answer: misconception.correction,
    explanation: misconception.reason,
  }
}

function ensureWorkedExamples(context: UnitContext, source: ReviewedWorkedExample[], concepts: ReviewedConcept[], misconceptions: TextbookMisconception[]) {
  const result = [...source]
  let cursor = 0
  while (result.length < 4) {
    const concept = concepts[cursor % concepts.length]
    const misconception = misconceptions[cursor % misconceptions.length]
    result.push(generatedWorkedExample(context, concept, misconception, cursor))
    cursor += 1
  }
  return result.slice(0, 5)
}

function uniqueOptions(options: string[]) {
  const seen = new Set<string>()
  const result: string[] = []
  for (const option of options) {
    const key = option.replace(/\s+/g, ' ').trim()
    if (!key || seen.has(key)) continue
    seen.add(key)
    result.push(key)
  }
  return result
}

function choice(
  id: string,
  level: ReviewedChoiceQuestion['level'],
  prompt: string,
  options: string[],
  correctIndex: number,
  explanation: string,
  context?: string,
): EnhancedChoice {
  const cleaned = uniqueOptions(options)
  const fallback = [
    '只背最後答案，不檢查條件。',
    '忽略題目或資料提供的限制，直接猜結論。',
    '把另一個不同概念的特徵當成這一題的理由。',
    '只看表面相似的字詞，不回到完整情境。',
  ]
  for (const item of fallback) if (cleaned.length < 4 && !cleaned.includes(item)) cleaned.push(item)
  const safeOptions = cleaned.slice(0, 4)
  const safeCorrect = Math.min(Math.max(correctIndex, 0), safeOptions.length - 1)
  const correctText = safeOptions[safeCorrect]
  const feedback = safeOptions.map((option) => option === correctText ? `這個選項符合本頁教材的定義與判斷方法。${explanation}` : '這個選項沒有同時符合本題提供的情境與核心觀念，請回到教材中的條件或證據再比一次。')
  const shift = stableHash(id) % safeOptions.length
  const rotated = rotate(safeOptions, shift)
  const rotatedFeedback = rotate(feedback, shift)
  const rotatedCorrectIndex = rotated.indexOf(correctText)
  return { id, kind: 'choice', level, context, prompt, options: rotated, correctIndex: rotatedCorrectIndex, explanation, optionFeedback: rotatedFeedback }
}

function response(
  id: string,
  level: ReviewedResponseQuestion['level'],
  prompt: string,
  sampleAnswer: string,
  explanation: string,
  context: string,
  rubric: string[],
): EnhancedResponse {
  return { id, kind: 'response', level, context, prompt, sampleAnswer, explanation, rubric }
}

function selfContained(question: ReviewedQuestion) {
  const text = `${question.context ?? ''} ${question.prompt} ${question.explanation}`
  return !BANNED_MISSING_MATERIAL.some((pattern) => pattern.test(text))
}

function normalizedPrompt(value: string) {
  return value.toLowerCase().replace(/[\s，。！？；：,.!?;:'"「」『』（）()\-—]/g, '')
}

function buildGeneratedQuestions(context: UnitContext, concepts: ReviewedConcept[], misconceptions: TextbookMisconception[]): ReviewedQuestion[] {
  const questions: ReviewedQuestion[] = []
  const descriptions = concepts.map((item) => clip(firstSentence(item.explanation), 96))
  const examples = concepts.map((item) => clip(item.example ?? `${item.title}需要依本單元條件、證據或表示方式判斷。`, 100))

  concepts.slice(0, 4).forEach((concept, index) => {
    const others = descriptions.filter((_, itemIndex) => itemIndex !== index)
    questions.push(choice(
      `${context.unit.id}-tb-v14-definition-q${index + 1}`,
      '理解',
      `下列哪一個敘述最符合「${concept.title}」？`,
      [descriptions[index], ...others.slice(0, 3)],
      0,
      clip(concept.explanation, 180),
      `單元：${context.unit.title}。本題只比較教材中已解釋過的核心觀念。`,
    ))
  })

  concepts.slice(0, 4).forEach((concept, index) => {
    const others = examples.filter((_, itemIndex) => itemIndex !== index)
    questions.push(choice(
      `${context.unit.id}-tb-v14-example-q${index + 1}`,
      '應用',
      `哪一個例子最能直接用來說明「${concept.title}」？`,
      [examples[index], ...others.slice(0, 3)],
      0,
      `正確例子必須同時符合「${concept.title}」的條件，而不是只和標題有相似字詞。`,
      `請比較四個完整例子，再依本單元的概念定義判斷。`,
    ))
  })

  misconceptions.slice(0, 3).forEach((item, index) => {
    const alternatives = misconceptions.filter((_, itemIndex) => itemIndex !== index).map((entry) => entry.correction)
    questions.push(choice(
      `${context.unit.id}-tb-v14-misconception-q${index + 1}`,
      '檢核',
      `同學說：「${item.claim}」哪一個修正最完整？`,
      [item.correction, ...alternatives.slice(0, 2), item.claim],
      0,
      item.reason,
      `這題要判斷原說法漏掉的條件、證據或檢查步驟。`,
    ))
  })

  concepts.slice(0, 3).forEach((concept, index) => {
    const contextText = concept.example ?? `本單元聚焦：${context.unit.focus}`
    questions.push(response(
      `${context.unit.id}-tb-v14-response-q${index + 1}`,
      index === 0 ? '理解' : '應用',
      `這個情境如何呈現「${concept.title}」？請寫出至少兩個判斷線索。`,
      `${concept.explanation} 在這個情境中，應把具體條件、文本或證據和概念連起來，而不是只重複概念名稱。可引用的例子是：${contextText}`,
      `完整作答需要把「觀念」和「情境中的實際線索」連在一起。`,
      contextText,
      ['有正確說明核心觀念', '至少指出兩個來自情境的線索或條件', '能說明線索為什麼支持判斷，而不是只抄題目'],
    ))
  })

  questions.push(response(
    `${context.unit.id}-tb-v14-synthesis-q1`,
    '檢核',
    `請用本單元的方法完成一個小結：先說明你會先檢查什麼，再說明如何形成結論，以及最後怎麼驗證或限制結論。`,
    `可依「${methodName(context.subject, context.pathway)}」回答。以「${context.unit.title}」為例，先整理題目、文本、資料或現象提供的條件，再使用核心觀念形成推理，最後用驗算、第二份證據、換情境或資料範圍檢查結論。`,
    '單元檢核不是要求背固定句，而是能完整說出一條可重做的思考流程。',
    `本單元範圍：${context.unit.focus}`,
    ['有寫出開始時要確認的條件或證據', '有寫出形成結論的核心方法', '有寫出至少一種檢查或限制結論的方法'],
  ))

  return questions
}

function ensureQuestions(context: UnitContext, source: ReviewedQuestion[], concepts: ReviewedConcept[], misconceptions: TextbookMisconception[]) {
  const generated = buildGeneratedQuestions(context, concepts, misconceptions)
  const candidates = [...source.filter(selfContained).slice(0, 6), ...generated]
  const seen = new Set<string>()
  const result: ReviewedQuestion[] = []
  for (const question of candidates) {
    const key = normalizedPrompt(question.prompt)
    if (!key || seen.has(key)) continue
    seen.add(key)
    result.push(question)
  }
  return result
}

function buildTakeaway(context: UnitContext, concepts: ReviewedConcept[], misconceptions: TextbookMisconception[]) {
  const result = [
    ...concepts.slice(0, 5).map((item) => `${item.title}：${clip(firstSentence(item.explanation), 78)}`),
    `方法：${methodName(context.subject, context.pathway)}。`,
    `自我檢查：${misconceptions[0]?.correction ?? '把答案和題目條件重新對照一次。'}`,
  ]
  return result.slice(0, 7)
}

function buildTextbookUnit(unitId: string): TextbookUnitContentV14 | null {
  const context = resolveCurriculumUnit(unitId)
  if (!context) return null
  const base = getCurriculumUnitContent(unitId)
  if (!base) return null
  const concepts = ensureConcepts(context, base.concepts)
  const misconceptions = buildMisconceptions(context, concepts)
  const workedExamples = ensureWorkedExamples(context, base.workedExamples, concepts, misconceptions)
  const questions = ensureQuestions(context, base.questions, concepts, misconceptions)
  const refs = sourceRefs(context)
  return {
    grade: context.grade,
    subject: context.subject,
    pathway: context.pathway,
    unitId,
    reviewStatus: 'textbook-ready',
    textbookVersion: 'v14',
    researchBasis: Array.from(new Set([
      ...base.researchBasis,
      `${stageName(context.grade)}正式領域／科目課程綱要`,
      '國家教育研究院領域／科目課程綱要與課程手冊',
      'Bubble Space V14：逐單元教材完整性、題目自足性、迷思辨析、示範與分層題庫 gate',
    ])),
    sourceRefs: refs,
    objectives: buildObjectives(context, concepts),
    overview: `${base.overview}\n\n本單元的教學範圍是「${context.unit.focus}」。學習時不以背誦最後結論為目標，而是要能依「${methodName(context.subject, context.pathway)}」重新處理新的題目、文本、資料或生活情境。`,
    concepts,
    misconceptions,
    visuals: buildVisuals(context, concepts, misconceptions),
    vocabulary: buildVocabulary(concepts),
    workedExamples,
    questions,
    takeaway: buildTakeaway(context, concepts, misconceptions),
  }
}

export type TextbookValidationResult = {
  ready: boolean
  errors: string[]
}

export function validateTextbookUnitV14(unit: TextbookUnitContentV14): TextbookValidationResult {
  const errors: string[] = []
  const prefix = unit.unitId
  if (unit.reviewStatus !== 'textbook-ready' || unit.textbookVersion !== 'v14') errors.push(`${prefix}: status/version mismatch`)
  if (unit.sourceRefs.length < 2 || !unit.sourceRefs.every((item) => /^https:\/\//.test(item.url))) errors.push(`${prefix}: official source references incomplete`)
  if (unit.objectives.length < 5) errors.push(`${prefix}: objectives ${unit.objectives.length} < 5`)
  if (unit.concepts.length < 6) errors.push(`${prefix}: concepts ${unit.concepts.length} < 6`)
  if (unit.concepts.some((item) => item.explanation.trim().length < 55 || (item.example?.trim().length ?? 0) < 18)) errors.push(`${prefix}: concept explanation/example too thin`)
  if (unit.misconceptions.length < 4) errors.push(`${prefix}: misconceptions ${unit.misconceptions.length} < 4`)
  if (unit.misconceptions.some((item) => item.claim.length < 25 || item.correction.length < 25 || item.reason.length < 35)) errors.push(`${prefix}: misconception analysis too thin`)
  if (unit.visuals.length < 3 || unit.visuals.some((item) => item.items.length < 4)) errors.push(`${prefix}: structured teaching visuals incomplete`)
  if (unit.vocabulary.length < 6) errors.push(`${prefix}: vocabulary ${unit.vocabulary.length} < 6`)
  if (unit.workedExamples.length < 3) errors.push(`${prefix}: worked examples ${unit.workedExamples.length} < 3`)
  if (unit.workedExamples.some((item) => item.context.length < 25 || item.prompt.length < 18 || item.steps.length < 4 || item.answer.length < 25 || item.explanation.length < 35)) errors.push(`${prefix}: worked example is not fully specified`)
  if (unit.questions.length < 15) errors.push(`${prefix}: questions ${unit.questions.length} < 15`)

  const choiceQuestions = unit.questions.filter((question): question is ReviewedChoiceQuestion => question.kind === 'choice')
  const responseQuestions = unit.questions.filter((question): question is ReviewedResponseQuestion => question.kind === 'response')
  if (choiceQuestions.length < 8) errors.push(`${prefix}: choice questions ${choiceQuestions.length} < 8`)
  if (responseQuestions.length < 3) errors.push(`${prefix}: response questions ${responseQuestions.length} < 3`)
  if (!['理解', '應用', '檢核'].every((level) => unit.questions.some((question) => question.level === level))) errors.push(`${prefix}: question levels incomplete`)

  const ids = new Set<string>()
  const prompts = new Set<string>()
  for (const question of unit.questions) {
    if (!question.id || ids.has(question.id)) errors.push(`${prefix}: duplicate/empty question id ${question.id}`)
    ids.add(question.id)
    const promptKey = normalizedPrompt(question.prompt)
    if (!promptKey || prompts.has(promptKey)) errors.push(`${prefix}: duplicate/empty question prompt`)
    prompts.add(promptKey)
    const combined = `${question.context ?? ''} ${question.prompt} ${question.explanation}`
    if (BANNED_MISSING_MATERIAL.some((pattern) => pattern.test(combined))) errors.push(`${prefix}: question refers to missing material`)
    if (question.explanation.trim().length < 25) errors.push(`${prefix}: question explanation too short`)
    if (question.kind === 'choice') {
      const unique = new Set(question.options.map((item) => item.trim()))
      if (question.options.length !== 4 || unique.size !== 4) errors.push(`${prefix}: choice must have four unique options`)
      if (question.correctIndex < 0 || question.correctIndex >= question.options.length) errors.push(`${prefix}: invalid correctIndex`)
      const extra = question as EnhancedChoice
      if (!extra.optionFeedback || extra.optionFeedback.length !== 4) errors.push(`${prefix}: choice option feedback incomplete`)
    } else {
      const extra = question as EnhancedResponse
      if (question.sampleAnswer.trim().length < 45) errors.push(`${prefix}: response sample answer too short`)
      if (!extra.rubric || extra.rubric.length < 3) errors.push(`${prefix}: response rubric incomplete`)
    }
  }

  if (unit.takeaway.length < 5) errors.push(`${prefix}: takeaway ${unit.takeaway.length} < 5`)
  return { ready: errors.length === 0, errors }
}

const cache = new Map<string, TextbookUnitContentV14 | null>()

export function getTextbookUnitContentV14(unitId: string): TextbookUnitContentV14 | null {
  if (cache.has(unitId)) return cache.get(unitId) ?? null
  const unit = buildTextbookUnit(unitId)
  if (!unit) {
    cache.set(unitId, null)
    return null
  }
  const validation = validateTextbookUnitV14(unit)
  if (!validation.ready) {
    cache.set(unitId, null)
    return null
  }
  cache.set(unitId, unit)
  return unit
}

export function inspectTextbookUnitV14(unitId: string) {
  const unit = buildTextbookUnit(unitId)
  return unit ? { unit, validation: validateTextbookUnitV14(unit) } : { unit: null, validation: { ready: false, errors: [`${unitId}: content not found`] } }
}
