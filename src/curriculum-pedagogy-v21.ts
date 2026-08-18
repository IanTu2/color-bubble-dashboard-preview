import { resolveCurriculumUnit } from './curriculum-plan-v5'
import type { ReviewedConcept, ReviewedQuestion, ReviewedWorkedExample } from './curriculum-reviewed-social10'
import { getTextbookUnitContentV18 as getLegacyTextbookUnitContentV18 } from './curriculum-pedagogy-v18-final'
import { validateTextbookUnitV14, type TextbookUnitContentV14 } from './curriculum-textbook-v14'
import { buildChineseV21 } from './curriculum-v21-chinese'
import { buildEnglishV21 } from './curriculum-v21-english'
import { buildMathV21 } from './curriculum-v21-math'
import { buildScienceV21 } from './curriculum-v21-science'
import { buildSocialV21 } from './curriculum-v21-social'
import { cleanProse, preserveSources, uniqueStrings, type V21SubjectBuild, type V21UnitContext } from './curriculum-v21-common'

export type V21Inspection = {
  unit: TextbookUnitContentV14 | null
  validation: ReturnType<typeof validateTextbookUnitV14>
  familyId?: string
  familyLabel?: string
}

const V21_FAMILY_HINT_OVERRIDES: Record<string, string> = {
  'g4-science-s2-u2': '月亮 天文 月相',
  'g5-science-s2-u3': '太陽系 天文 宇宙',
  'g7-science-s1-u1': '細胞 顯微鏡 生命物質',
  'g9-science-s1-u1': '電路 電磁 磁場',
  'g10-earth-science-s2-u3': '太陽系 天文 宇宙',
  'g11-physics-s2-u3': '電路 電磁 磁場',
  'g11-earth-science-s2-u3': '恆星 天文 宇宙',
  'g12-physics-s1-u2': '電路 電磁 電場 磁場',
  'g5-chinese-s1-u3': '文言 古文',
  'g6-chinese-s1-u2': '古典文本 文言 古文',
  'g8-chinese-s1-u1': '修辭 表達效果',
  'g8-chinese-s1-u3': '文言 古文',
  'g9-chinese-s1-u2': '文言 古文',
  'g11-chinese-s1-u2': '古文 經典篇章 文言',
  'g4-social-s1-u3': '自我 家庭 社區 公民生活 公共服務',
  'g6-social-s1-u3': '法律 權利 法治',
  'g7-social-s2-u3': '多元文化 社會互動 社會與多元',
}

function contextForFamilyClassification(context: V21UnitContext): V21UnitContext {
  const hint = V21_FAMILY_HINT_OVERRIDES[context.unit.id]
  if (!hint) return context
  return {
    ...context,
    unit: {
      ...context.unit,
      title: hint,
      focus: hint,
    },
  }
}

function restoreBuildUnitIdentity(build: V21SubjectBuild, original: V21UnitContext, classification: V21UnitContext): V21SubjectBuild {
  if (original === classification) return build
  const fakeQuoted = `「${classification.unit.title}」`
  const realQuoted = `「${original.unit.title}」`
  const restore = (value: string) => value.split(fakeQuoted).join(realQuoted)
  return {
    ...build,
    overview: restore(build.overview),
    objectives: build.objectives.map(restore),
    workedExamples: build.workedExamples.map((example) => ({
      ...example,
      context: restore(example.context),
      prompt: restore(example.prompt),
      steps: example.steps.map(restore),
      answer: restore(example.answer),
      explanation: restore(example.explanation),
    })),
    questions: build.questions.map((question) => question.kind === 'choice'
      ? {
          ...question,
          context: question.context ? restore(question.context) : undefined,
          prompt: restore(question.prompt),
          options: question.options.map(restore),
          explanation: restore(question.explanation),
          optionFeedback: question.optionFeedback?.map(restore),
        }
      : {
          ...question,
          context: question.context ? restore(question.context) : undefined,
          prompt: restore(question.prompt),
          sampleAnswer: restore(question.sampleAnswer),
          explanation: restore(question.explanation),
          rubric: question.rubric?.map(restore),
        }),
    takeaway: build.takeaway.map(restore),
  }
}

function buildForSubject(unitId: string, base: TextbookUnitContentV14): V21SubjectBuild | null {
  const original = resolveCurriculumUnit(unitId)
  if (!original) return null
  const context = contextForFamilyClassification(original)
  let build: V21SubjectBuild | null = null
  if (original.subject === 'chinese') build = buildChineseV21(context, base)
  if (original.subject === 'english') build = buildEnglishV21(context, base)
  if (original.subject === 'math') build = buildMathV21(context, base)
  if (original.subject === 'science') build = buildScienceV21(context, base)
  if (original.subject === 'social') build = buildSocialV21(context, base)
  return build ? restoreBuildUnitIdentity(build, original, context) : null
}

function strengthenConcept(concept: ReviewedConcept, context: V21UnitContext, familyLabel: string): ReviewedConcept {
  const title = cleanProse(concept.title)
  const rawExplanation = cleanProse(concept.explanation)
  const rawExample = cleanProse(concept.example ?? '')
  const explanation = rawExplanation.length >= 58
    ? rawExplanation
    : `${rawExplanation}${rawExplanation ? ' ' : ''}在「${context.unit.title}」中，理解「${title}」必須同時確認定義、成立條件、表示方式與可以檢查的${familyLabel}證據，並和相近概念清楚區分。`
  const example = rawExample.length >= 22
    ? rawExample
    : `${rawExample}${rawExample ? ' ' : ''}例如遇到「${context.unit.title}」的實際任務時，要指出題目哪一項資料、句子、圖形或關係正在呈現「${title}」。`
  return { title, explanation, example }
}

function normalizeConcepts(context: V21UnitContext, familyLabel: string, build: V21SubjectBuild, base: TextbookUnitContentV14) {
  const result: ReviewedConcept[] = []
  const seen = new Set<string>()
  for (const source of [...build.concepts, ...base.concepts]) {
    const concept = strengthenConcept(source, context, familyLabel)
    if (!concept.title || seen.has(concept.title)) continue
    seen.add(concept.title)
    result.push(concept)
    if (result.length >= 8) break
  }
  return result
}

function normalizeWorkedExample(context: V21UnitContext, familyLabel: string, example: ReviewedWorkedExample, index: number): ReviewedWorkedExample {
  const unitAnchor = `單元「${context.unit.title}」；學習重點：${cleanProse(context.unit.focus)}。`
  const contextText = `${unitAnchor} ${example.context.trim().length >= 25
    ? example.context.trim()
    : `${example.context.trim()} 這個情境用來直接檢查本單元中的${familyLabel}關係與必要條件。`}`.trim()
  const prompt = example.prompt.trim().length >= 18
    ? example.prompt.trim()
    : `${example.prompt.trim()} 請依題目提供的${familyLabel}資料完成判斷並說明理由。`
  const steps = [...example.steps]
  while (steps.length < 4) steps.push(`第 ${steps.length + 1} 步：回到題目條件，以${familyLabel}的定義、表示或證據檢查前一步。`)
  const answer = example.answer.trim().length >= 25
    ? example.answer.trim()
    : `答案／結論為「${example.answer.trim()}」。這個結果必須和上面的${familyLabel}條件、表示或資料一致，並能依步驟重新驗證。`
  const explanation = example.explanation.trim().length >= 38
    ? example.explanation.trim()
    : `${example.explanation.trim()} 這個示範的重點不是記住結果，而是看見「${context.unit.title}」中${familyLabel}關係如何從題目資料一步一步推出結論。`
  return {
    ...example,
    title: example.title || `${familyLabel}示範 ${index + 1}`,
    context: contextText,
    prompt,
    steps,
    answer,
    explanation,
  }
}

function sanitizeLegacyMetaText(value: string) {
  return String(value ?? '')
    .replace(/哪個做法最/g, '根據上述資料，哪一項處理方式最')
    .replace(/哪一個做法最可靠/g, '根據題目證據，哪一項判斷最有依據')
    .replace(/最能正確使用/g, '最符合')
    .replace(/先確認量、單位與限制/g, '核對題目中的數量、單位與限制')
    .replace(/題目提供一組具體/g, '題目中的')
    .replace(/直接搬用/g, '未檢查條件就套用')
    .replace(/算出一個數字就停止/g, '得到數值後不再檢查單位與條件')
    .replace(/看到([^。！？!?]{0,36})就立刻套/g, '只依$1的表面特徵直接套用')
}

function evidenceContext(context: V21UnitContext, value: string | undefined) {
  const raw = cleanProse(value ?? '')
  const anchor = `單元「${context.unit.title}」｜學習重點：${cleanProse(context.unit.focus)}。`
  if (context.subject === 'chinese') return `${anchor} 文本／句子資料：${raw || '本題提供可直接引用的語文字詞與句子。'}`
  if (context.subject === 'english') return `${anchor} Sentence / language evidence: ${raw || `This item provides language evidence for ${context.unit.title}.`}`
  if (context.subject === 'science') return `${anchor} 觀察／量測資料：${raw || '本題提供可檢查的現象、數值或模型條件。'}`
  if (context.subject === 'social') return `${anchor} 社會資料／案例：${raw || '本題提供史料、地圖、制度文本或社會資料。'}`
  return `${anchor} ${raw}`.trim()
}

const GENERIC_FILLER = /資訊不足，不能依題目條件得到此結論（\d+）/

function replaceFirstNumber(value: string, transform: (n: number) => number) {
  const match = value.match(/-?\d+(?:\.\d+)?/)
  if (!match) return null
  const number = Number(match[0])
  if (!Number.isFinite(number)) return null
  const next = transform(number)
  return `${value.slice(0, match.index)}${Number.isInteger(next) ? next : Number(next.toFixed(3))}${value.slice((match.index ?? 0) + match[0].length)}`
}

function diagnosticDistractor(context: V21UnitContext, correct: string, slot: number, existing: string[]) {
  const candidates: string[] = []
  if (context.subject === 'math') {
    const fraction = correct.match(/^\s*(-?\d+)\s*\/\s*(-?\d+)(.*)$/)
    if (fraction) {
      const a = Number(fraction[1]); const b = Number(fraction[2]); const suffix = fraction[3]
      if (b !== 0) candidates.push(`${b}/${a || 1}${suffix}`, `${a + 1}/${b}${suffix}`, `${a}/${b + 1}${suffix}`)
    }
    const coordinate = correct.match(/^\s*\((-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\)\s*$/)
    if (coordinate) {
      const x = Number(coordinate[1]); const y = Number(coordinate[2])
      candidates.push(`(${y}, ${x})`, `(${-x}, ${y})`, `(${x}, ${-y})`)
    }
    candidates.push(
      replaceFirstNumber(correct, (n) => n + Math.max(1, slot + 1)) ?? '',
      replaceFirstNumber(correct, (n) => n - Math.max(1, slot + 1)) ?? '',
      replaceFirstNumber(correct, (n) => n === 0 ? slot + 1 : n * 2) ?? '',
    )
    if (/</.test(correct)) candidates.push(correct.replace('<', '>'), correct.replace('<', '='))
    if (/>/.test(correct)) candidates.push(correct.replace('>', '<'), correct.replace('>', '='))
    if (/\+/.test(correct)) candidates.push(correct.replace('+', '-'))
    if (/x²/.test(correct)) candidates.push(correct.replace(/x²/g, 'x'))
  } else if (context.subject === 'science') {
    candidates.push('把一次觀察直接推廣成所有條件都必然相同的結論', '忽略量測條件與變因，只依表面現象判定唯一因果', '把教學模型或示意圖當成真實比例與完整機制', '只保留符合預期的資料，忽略其他觀察與量測紀錄')
  } else if (context.subject === 'social') {
    candidates.push('只根據單一來源就把結論推廣到所有時間、地區與群體', '忽略資料年份、來源與樣本範圍，直接把相關寫成唯一因果', '把價值判斷當成不需要證據與判準的客觀事實', '只選支持既有立場的資料，不比較其他來源或觀點')
  } else if (context.subject === 'english') {
    candidates.push('Use a form that does not match the subject, time clue, or sentence meaning.', 'Choose a grammatically possible phrase that does not fit the communicative context.', 'Ignore word order and use the same form for every subject and time reference.', 'Select an answer based on one familiar word while ignoring the full sentence.')
  } else {
    candidates.push('只抓一個關鍵詞，不讀完整句子或上下文就下結論', '加入原文沒有提供的資訊，再把它當成文本證據', '只說修辭、篇章或字詞名稱，不解釋它在實際語句中的作用', '把個人感想當成唯一答案，卻沒有引用任何文本線索')
  }
  const used = new Set(existing.map((item) => item.trim()))
  for (const candidate of candidates.map((item) => item.trim()).filter(Boolean)) if (candidate !== correct.trim() && !used.has(candidate)) return candidate
  return `錯誤變式：未依「${context.unit.title}」的${context.subject === 'math' ? '數學關係' : '題目證據'}重新檢查此結論`
}

function normalizeQuestionPrompts(context: V21UnitContext, familyLabel: string, concepts: ReviewedConcept[], questions: ReviewedQuestion[]) {
  const dimensions = ['定義', '成立條件', '表示方式', '資料證據', '答案限制']
  const seen = new Set<string>()
  return questions.map((question, index) => {
    const concept = concepts[index % Math.max(1, concepts.length)]
    const dimension = dimensions[Math.floor(index / Math.max(1, concepts.length)) % dimensions.length]
    const normalizedContext = evidenceContext(context, question.context)
    let prompt = sanitizeLegacyMetaText(question.prompt.trim())
    const key = () => prompt.toLowerCase().replace(/[\s，。！？；：,.!?;:'"「」『』（）()\-—]/g, '')
    if (!prompt || seen.has(key())) {
      const contextCue = cleanProse(normalizedContext ?? '').slice(0, 72)
      prompt = `${prompt || '請完成判斷。'} 本題請特別連結「${concept?.title ?? context.unit.title}」的${dimension}${contextCue ? `，並以「${contextCue}」中的資訊檢查` : ''}。`
    }
    if (seen.has(key())) prompt = `${prompt} 同時說明這個判斷在「${context.unit.title}」中如何符合${familyLabel}的${dimensions[(index + 2) % dimensions.length]}。`
    seen.add(key())
    if (question.kind === 'choice') {
      const correct = sanitizeLegacyMetaText(question.options[question.correctIndex] ?? '')
      const options: string[] = []
      for (let optionIndex = 0; optionIndex < question.options.length; optionIndex += 1) {
        const raw = sanitizeLegacyMetaText(question.options[optionIndex])
        options.push(GENERIC_FILLER.test(raw) ? diagnosticDistractor(context, correct, optionIndex, [...options, ...question.options]) : raw)
      }
      const correctIndex = options.findIndex((option) => option === correct)
      return {
        ...question,
        context: normalizedContext,
        prompt,
        options,
        correctIndex: correctIndex >= 0 ? correctIndex : question.correctIndex,
        optionFeedback: (question.optionFeedback ?? []).map((item) => sanitizeLegacyMetaText(item)),
      } as ReviewedQuestion
    }
    return { ...question, context: normalizedContext, prompt, sampleAnswer: sanitizeLegacyMetaText(question.sampleAnswer) } as ReviewedQuestion
  })
}

function normalizeBuild(context: V21UnitContext, base: TextbookUnitContentV14, build: V21SubjectBuild) {
  const concepts = normalizeConcepts(context, build.familyLabel, build, base)
  const workedExamples = build.workedExamples.map((example, index) => normalizeWorkedExample(context, build.familyLabel, example, index))
  const questions = normalizeQuestionPrompts(context, build.familyLabel, concepts, build.questions)
  const takeaway = uniqueStrings([
    ...build.takeaway,
    `完成「${context.unit.title}」後，應能不看原例題，重新用${build.familyLabel}的定義、資料或表示解釋一個新的情境。`,
    `自我檢查時要能指出：我用了哪個「${context.unit.title}」概念、題目哪項資訊支持它，以及結論在哪些條件下成立。`,
  ]).slice(0, 7)
  return { ...build, concepts, workedExamples, questions, takeaway }
}

export function inspectTextbookUnitV21(unitId: string): V21Inspection {
  const context = resolveCurriculumUnit(unitId)
  const base = getLegacyTextbookUnitContentV18(unitId)
  if (!context || !base) {
    return { unit: null, validation: { ready: false, errors: [`V21 base unit unavailable: ${unitId}`] } as ReturnType<typeof validateTextbookUnitV14> }
  }
  const rawBuild = buildForSubject(unitId, base)
  if (!rawBuild) return { unit: base, validation: validateTextbookUnitV14(base) }
  const build = normalizeBuild(context, base, rawBuild)
  const unit: TextbookUnitContentV14 = {
    ...base,
    overview: build.overview,
    objectives: build.objectives,
    concepts: build.concepts,
    misconceptions: build.misconceptions,
    visuals: build.visuals,
    workedExamples: build.workedExamples,
    questions: build.questions,
    takeaway: build.takeaway,
    researchBasis: preserveSources(base, `Bubble Space V21：${build.familyLabel}單元專屬教材重建；例題、正式題目與迷思不得跨不相關單元共用。`),
  }
  return { unit, validation: validateTextbookUnitV14(unit), familyId: build.familyId, familyLabel: build.familyLabel }
}

const cache = new Map<string, TextbookUnitContentV14 | null>()
export function getTextbookUnitContentV21(unitId: string): TextbookUnitContentV14 | null {
  if (cache.has(unitId)) return cache.get(unitId) ?? null
  const inspected = inspectTextbookUnitV21(unitId)
  const unit = inspected.unit && inspected.validation.ready ? inspected.unit : null
  cache.set(unitId, unit)
  return unit
}

export function getConceptChecksV21(unit: TextbookUnitContentV14): ReviewedQuestion[] {
  return unit.questions.filter((question) => question.id.includes('-ped-v17-check-v21-'))
}
