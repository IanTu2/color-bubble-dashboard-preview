import { getTextbookUnitContentV20Final, type TextbookUnitContentV20Final } from './curriculum-textbook-v20-final'
import { resolveCurriculumUnit } from './curriculum-plan-v5'
import type { ReviewedConcept, ReviewedQuestion } from './curriculum-reviewed-social10'
import type { TextbookMisconception, TextbookVisual, TextbookVocabulary } from './curriculum-textbook-v14'

type UnitContext = NonNullable<ReturnType<typeof resolveCurriculumUnit>>

function normalize(value: unknown) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function compact(value: unknown, max = 108) {
  const clean = normalize(value)
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).replace(/[，、；：,.!?。！？\s]+$/g, '')}…`
}

function unique(values: string[]) {
  const seen = new Set<string>()
  const result: string[] = []
  for (const value of values.map(normalize)) {
    if (!value || seen.has(value)) continue
    seen.add(value)
    result.push(value)
  }
  return result
}

function focusParts(context: UnitContext) {
  const raw = `${context.unit.title}。${context.unit.focus}`
    .split(/[。；，、]|以及|並且|並|與|和/)
    .map((item) => item.replace(/^(理解|認識|建立|分析|運用|使用|處理|練習|掌握|統整|比較|從|以)/, '').trim())
    .filter((item) => item.length >= 2)
  const parts = unique(raw)
  if (!parts.includes(context.unit.title)) parts.unshift(context.unit.title)
  return parts.slice(0, 6)
}

function subjectMethod(context: UnitContext, concept: string) {
  if (context.pathway === 'life') return `「${concept}」要從真實生活觀察、實作與紀錄建立；描述時要分清楚實際看到的現象與自己的推測，再用前後紀錄比較變化。`
  if (context.subject === 'math') return `「${concept}」要能在文字條件、數值、符號、算式或圖形之間轉換。先確認已知、未知與限制，再選用本單元的定義或關係完成推理，最後以代回、估算或另一種表示檢查。`
  if (context.subject === 'english') return `For “${concept},” connect meaning with the actual sentence or discourse context. Check the subject, time clue, word form and word order before choosing or producing the English expression, then read the complete sentence again to verify meaning.`
  if (context.subject === 'science') return `「${concept}」要把觀察或量測、科學模型與結論分開。先指出資料真正顯示什麼，再使用本單元的構造、作用、變因或系統關係解釋，並保留證據不足時的限制。`
  if (context.subject === 'social') return `「${concept}」的判讀要保留來源、時間、空間尺度與制度／群體脈絡。先說明資料事實，再提出解釋；若涉及因果或價值判斷，要補足可支持該結論的證據。`
  return `「${concept}」要回到完整文本與語境理解。先找出直接詞句、篇章位置或表達線索，再說明它如何支持字詞、修辭、主旨、結構或寫作上的判斷，不能只靠印象作答。`
}

function correctAnswer(question: ReviewedQuestion) {
  if (question.kind === 'choice') return normalize(question.options?.[question.correctIndex])
  return normalize(question.sampleAnswer)
}

function questionEvidence(question: ReviewedQuestion) {
  return compact(`${normalize(question.context)} ${normalize(question.prompt)} → ${correctAnswer(question)}`, 180)
}

function rebuildConcepts(context: UnitContext, unit: TextbookUnitContentV20Final): ReviewedConcept[] {
  const parts = focusParts(context)
  const questions = unit.questions ?? []
  return parts.map((part, index) => ({
    title: part,
    explanation: `本單元焦點是「${compact(context.unit.focus, 120)}」。${subjectMethod(context, part)}`,
    example: questions.length ? questionEvidence(questions[index % questions.length]) : `以「${part}」完成一個可檢查的本單元任務。`,
  }))
}

function rebuildMisconceptions(unit: TextbookUnitContentV20Final): TextbookMisconception[] {
  const questions = unit.questions ?? []
  const misconceptions: TextbookMisconception[] = []
  for (let index = 0; index < questions.length && misconceptions.length < 4; index += 1) {
    const question = questions[index]
    if (question.kind === 'choice') {
      const options = question.options ?? []
      const wrongIndex = options.findIndex((_, optionIndex) => optionIndex !== question.correctIndex)
      if (wrongIndex < 0) continue
      const wrong = normalize(options[wrongIndex])
      const correct = normalize(options[question.correctIndex])
      misconceptions.push({
        claim: `面對「${compact(question.prompt, 72)}」時，把「${compact(wrong, 54)}」當成答案。`,
        correction: `應改為「${compact(correct, 70)}」，並用題幹中的條件或證據說明為什麼。`,
        reason: compact(question.explanation || `正解必須同時符合題目情境與「${unit.unitId}」目前的單元任務。`, 180),
      })
    } else {
      misconceptions.push({
        claim: `回答「${compact(question.prompt, 72)}」時只寫結論，沒有指出題幹中的具體證據或推理步驟。`,
        correction: `至少寫出關鍵答案，再補上一項題幹證據、計算、語句或資料關係。`,
        reason: compact(question.explanation || question.sampleAnswer || '開放作答需要讓讀者看得出結論如何由題目資訊得到。', 180),
      })
    }
  }
  if (misconceptions.length >= 2) return misconceptions
  return [
    {
      claim: '只看到熟悉關鍵字就直接套用另一章的方法。',
      correction: '先確認本單元真正詢問的量、語意、資料或證據，再選用本章方法。',
      reason: `「${unit.unitId}」的學習證據必須和單元條件一致，不能只靠表面字詞判斷。`,
    },
    {
      claim: '得到第一個看似合理的答案後就停止檢查。',
      correction: '用題意、單位、文本、資料或反向驗算檢查答案是否真正成立。',
      reason: '教科書級作答需要可追蹤的證據鏈，而不是只留下結果。',
    },
  ]
}

function rebuildVisuals(context: UnitContext, concepts: ReviewedConcept[], misconceptions: TextbookMisconception[]): TextbookVisual[] {
  return [
    {
      id: `${context.unit.id}-v20-editorial-map`,
      kind: 'concept-map',
      title: `${context.unit.title}｜概念地圖`,
      caption: `所有節點都回到本單元焦點：${compact(context.unit.focus, 120)}`,
      items: concepts.slice(0, 6).map((concept, index) => ({
        label: `${index + 1}｜${compact(concept.title, 36)}`,
        detail: compact(concept.explanation, 150),
      })),
    },
    {
      id: `${context.unit.id}-v20-editorial-misconceptions`,
      kind: 'comparison',
      title: `${context.unit.title}｜易錯判斷與修正`,
      caption: '錯誤與修正直接取自本單元目前的題目與解釋，不沿用其他單元的舊題素材。',
      items: misconceptions.slice(0, 4).map((item, index) => ({
        label: `易錯 ${index + 1}｜${compact(item.claim, 52)}`,
        detail: `${compact(item.correction, 92)} ${compact(item.reason, 110)}`,
      })),
    },
  ]
}

function rebuildVocabulary(context: UnitContext, concepts: ReviewedConcept[]): TextbookVocabulary[] {
  return concepts.slice(0, 6).map((concept) => ({
    term: compact(concept.title, 32),
    definition: compact(`${subjectMethod(context, concept.title)} 本單元使用這個詞時，範圍以「${context.unit.title}」與其焦點為準。`, 170),
  }))
}

function rebuildObjectives(context: UnitContext, concepts: ReviewedConcept[]) {
  const lead = context.subject === 'english' ? 'Can use' : context.subject === 'math' ? '能表示並解決' : '能說明並應用'
  return concepts.slice(0, 5).map((concept) => `${lead}「${concept.title}」，並用本單元題目中的條件、證據或表示方式驗證答案。`)
}

function rebuildTakeaway(context: UnitContext, concepts: ReviewedConcept[]) {
  const names = concepts.slice(0, 4).map((item) => `「${item.title}」`).join('、')
  return [
    `本單元範圍是「${context.unit.title}」：${context.unit.focus}`,
    `核心概念包含 ${names}；作答時要讓方法和題目條件真正對上。`,
    context.subject === 'math'
      ? '最後用代回、估算、圖形或另一種表示檢查符號、數值、單位與範圍。'
      : context.subject === 'english'
        ? '最後重讀完整句子或文本，檢查語意、形式、時間線索與語序是否一致。'
        : context.subject === 'science'
          ? '最後區分觀察、模型與推論，確認結論沒有超過資料能支持的範圍。'
          : context.subject === 'social'
            ? '最後核對來源、時間、空間尺度與立場，避免把相關誤寫成因果或把單一案例外推全部。'
            : '最後回到完整文本或生活脈絡，以具體線索支持解讀與表達。',
  ]
}

export function getTextbookUnitContentV20Editorial(unitId: string): TextbookUnitContentV20Final | null {
  const source = getTextbookUnitContentV20Final(unitId)
  const context = resolveCurriculumUnit(unitId)
  if (!source || !context) return null
  const concepts = rebuildConcepts(context, source)
  const misconceptions = rebuildMisconceptions(source)
  const visuals = rebuildVisuals(context, concepts, misconceptions)
  return {
    ...source,
    objectives: rebuildObjectives(context, concepts),
    overview: `「${context.unit.title}」以「${context.unit.focus}」為完整學習範圍。V20 會讓概念、例題、練習、迷思與視覺都回到同一範圍，並要求學生指出可檢查的條件、證據或表示方式，而不是把別章模板套進來。`,
    concepts,
    misconceptions,
    visuals,
    vocabulary: rebuildVocabulary(context, concepts),
    takeaway: rebuildTakeaway(context, concepts),
  }
}

const cache = new Map<string, TextbookUnitContentV20Final | null>()

export function getCachedTextbookUnitContentV20Editorial(unitId: string) {
  if (cache.has(unitId)) return cache.get(unitId) ?? null
  const unit = getTextbookUnitContentV20Editorial(unitId)
  cache.set(unitId, unit)
  return unit
}
