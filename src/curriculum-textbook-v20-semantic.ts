import { getTextbookUnitContentV20Published } from './curriculum-textbook-v20-published'
import { resolveCurriculumUnit } from './curriculum-plan-v5'
import { getV20MathSemanticTask } from './curriculum-v20-semantic-math'
import { getV20ScienceSemanticTask } from './curriculum-v20-semantic-science'
import { getV20ChineseSemanticTask, getV20EnglishSemanticTask } from './curriculum-v20-semantic-language'
import { getV20SocialSemanticTask } from './curriculum-v20-semantic-social'
import { hashV20, compactV20, type V20SemanticTask } from './curriculum-v20-semantic-task'
import type { ReviewedConcept, ReviewedQuestion, ReviewedWorkedExample } from './curriculum-reviewed-social10'
import type { TextbookMisconception, TextbookVisual, TextbookVocabulary } from './curriculum-textbook-v14'
import type { TextbookUnitContentV20Final } from './curriculum-textbook-v20-final'

type UnitContext = NonNullable<ReturnType<typeof resolveCurriculumUnit>>
type ChoiceExtras = Extract<ReviewedQuestion, { kind: 'choice' }> & { optionFeedback?: string[]; mediaAssetId?: string; audioText?: string }
type ResponseExtras = Extract<ReviewedQuestion, { kind: 'response' }> & { rubric?: string[]; mediaAssetId?: string; audioText?: string }

function taskFor(context: UnitContext, index: number): V20SemanticTask {
  if (context.pathway === 'life') return getV20ScienceSemanticTask(context.unit.id, context.pathway, context.unit.title, context.unit.focus, index)
  if (context.subject === 'math') return getV20MathSemanticTask(context.unit.id, context.unit.title, context.unit.focus, index)
  if (context.subject === 'science') return getV20ScienceSemanticTask(context.unit.id, context.pathway, context.unit.title, context.unit.focus, index)
  if (context.subject === 'english') return getV20EnglishSemanticTask(context.unit.id, context.unit.title, context.unit.focus, index)
  if (context.subject === 'social') return getV20SocialSemanticTask(context.unit.id, context.pathway, context.unit.title, context.unit.focus, index)
  return getV20ChineseSemanticTask(context.unit.id, context.unit.title, context.unit.focus, index)
}

function rotate(task: V20SemanticTask, seed: string) {
  const source = [task.correct, ...task.distractors]
  const shift = hashV20(seed) % source.length
  const options = source.slice(shift).concat(source.slice(0, shift))
  return { options, correctIndex: options.indexOf(task.correct) }
}

function rewriteQuestion(context: UnitContext, question: ReviewedQuestion, index: number): ReviewedQuestion {
  const task = taskFor(context, index)
  if (question.kind === 'choice') {
    const base = question as ChoiceExtras
    const packed = rotate(task, `${question.id}:${index}`)
    const optionFeedback = packed.options.map((option, optionIndex) => optionIndex === packed.correctIndex
      ? `正確。${task.explanation}`
      : `「${compactV20(option, 58)}」不符合目前題幹。正確答案是「${compactV20(task.correct, 68)}」。${compactV20(task.explanation, 160)}`)
    return {
      ...base,
      context: task.context,
      prompt: task.prompt,
      options: packed.options,
      correctIndex: packed.correctIndex,
      explanation: task.explanation,
      optionFeedback,
      mediaAssetId: undefined,
      audioText: undefined,
    } as ReviewedQuestion
  }
  const base = question as ResponseExtras
  return {
    ...base,
    context: task.context,
    prompt: `${task.prompt}${context.subject === 'english' ? ' Answer in one complete sentence and cite one clue.' : ' 請寫出答案，並指出一項題幹中的具體證據、計算或資料。'}`,
    sampleAnswer: `${task.correct}。${task.explanation}`,
    explanation: task.explanation,
    rubric: [
      `直接回答「${compactV20(task.prompt, 78)}」。`,
      '至少指出一項題幹中的具體數字、語句、資料、觀察或計算。',
      `理由必須和「${context.unit.title}」的本單元範圍一致，不能超出題目資訊。`,
    ],
    mediaAssetId: undefined,
    audioText: undefined,
  } as ReviewedQuestion
}

function rewriteExample(context: UnitContext, model: ReviewedWorkedExample, index: number): ReviewedWorkedExample {
  const task = taskFor(context, index + 1000)
  const subjectCheck = context.subject === 'math'
    ? '最後用代回、估算、單位、圖形或另一種表示反向檢查。'
    : context.subject === 'english'
      ? 'Finally, reread the complete sentence or passage and check meaning, form, reference/time clues, and word order.'
      : context.subject === 'science'
        ? '最後把觀察／量測、模型與推論分開，確認結論沒有超出資料。'
        : context.subject === 'social'
          ? '最後核對來源、時間、尺度與立場，確認結論沒有超過證據。'
          : '最後回到完整文本或語境，指出支持答案的具體字詞、句段或篇章線索。'
  return {
    ...model,
    title: `${context.unit.title}｜示範 ${index + 1}`,
    context: task.context,
    prompt: task.prompt,
    steps: [
      `確認本章範圍：${context.unit.focus}`,
      '圈出題幹中的已知條件、證據、資料或語境線索。',
      `依本章方法完成判斷，得到「${task.correct}」。`,
      subjectCheck,
    ],
    answer: `${task.correct}。`,
    explanation: `${task.explanation} ${subjectCheck}`,
  }
}

function focusParts(context: UnitContext) {
  const values = [context.unit.title, ...context.unit.focus.split(/[，、；。]|以及|並且|並|與|和/).map((v) => v.trim())].filter((v) => v.length >= 2)
  const unique = [...new Set(values)]
  while (unique.length < 3) unique.push(`${context.unit.title}的應用與檢查 ${unique.length + 1}`)
  return unique.slice(0, 6)
}

function answerOf(question: ReviewedQuestion) {
  return question.kind === 'choice' ? question.options[question.correctIndex] : question.sampleAnswer
}

function conceptsFor(context: UnitContext, questions: ReviewedQuestion[]): ReviewedConcept[] {
  return focusParts(context).map((part, index) => ({
    title: part,
    explanation: context.subject === 'english'
      ? `In “${context.unit.title},” connect “${part}” with the complete meaning, form, reference/time clues, and word order required by the unit focus.`
      : `「${part}」屬於「${context.unit.title}」的學習範圍。先辨認題目條件或證據，再用本章定義、關係、文本、資料或模型完成推理，最後檢查是否符合「${compactV20(context.unit.focus, 108)}」。`,
    example: `${compactV20(questions[index % questions.length].context, 108)} ${compactV20(questions[index % questions.length].prompt, 88)} → ${compactV20(answerOf(questions[index % questions.length]), 78)}`,
  }))
}

function misconceptionsFor(questions: ReviewedQuestion[]): TextbookMisconception[] {
  return questions.slice(0, 4).map((question) => {
    if (question.kind === 'choice') {
      const wrong = question.options.find((_, index) => index !== question.correctIndex) ?? question.options[0]
      return {
        claim: `作答「${compactV20(question.prompt, 56)}」時選了「${compactV20(wrong, 46)}」。`,
        correction: `應改為「${compactV20(answerOf(question), 62)}」，並回到題幹核對支持條件。`,
        reason: compactV20(question.explanation, 165),
      }
    }
    return {
      claim: `回答「${compactV20(question.prompt, 56)}」時只寫結果，沒有留下可檢查的依據。`,
      correction: '補上題幹中的具體證據、計算、資料、觀察或語句，再把它和結論連起來。',
      reason: compactV20(question.explanation, 165),
    }
  })
}

function visualsFor(context: UnitContext, concepts: ReviewedConcept[], misconceptions: TextbookMisconception[]): TextbookVisual[] {
  return [
    {
      id: `${context.unit.id}-semantic-map`,
      kind: 'concept-map',
      title: `${context.unit.title}｜概念地圖`,
      caption: `本章焦點：${compactV20(context.unit.focus, 120)}`,
      items: concepts.map((concept, index) => ({ label: `${index + 1}｜${compactV20(concept.title, 34)}`, detail: compactV20(concept.explanation, 148) })),
    },
    {
      id: `${context.unit.id}-semantic-errors`,
      kind: 'comparison',
      title: `${context.unit.title}｜易錯與修正`,
      caption: '錯誤示例與修正理由都取自本章目前的題目與答案。',
      items: misconceptions.map((item, index) => ({ label: `易錯 ${index + 1}｜${compactV20(item.claim, 48)}`, detail: `${compactV20(item.correction, 86)} ${compactV20(item.reason, 100)}` })),
    },
  ]
}

function vocabularyFor(concepts: ReviewedConcept[]): TextbookVocabulary[] {
  return concepts.map((concept) => ({ term: compactV20(concept.title, 30), definition: compactV20(concept.explanation, 152) }))
}

export function getTextbookUnitContentV20Semantic(unitId: string): TextbookUnitContentV20Final | null {
  const source = getTextbookUnitContentV20Published(unitId)
  const context = resolveCurriculumUnit(unitId)
  if (!source || !context) return null
  const questions = source.questions.map((question, index) => rewriteQuestion(context, question, index))
  const workedExamples = source.workedExamples.map((example, index) => rewriteExample(context, example, index))
  const concepts = conceptsFor(context, questions)
  const misconceptions = misconceptionsFor(questions)
  const visuals = visualsFor(context, concepts, misconceptions)
  return {
    ...source,
    overview: `「${context.unit.title}」完整學習範圍：${context.unit.focus} 本章的概念、示範、練習、易錯判斷與視覺都依這個現行單元範圍組織。`,
    objectives: concepts.slice(0, 5).map((concept) => context.subject === 'english'
      ? `Can use “${concept.title}” in a complete context and explain the clue supporting the answer.`
      : `能說明並應用「${concept.title}」，且用題幹中的條件、證據或表示方式驗證答案。`),
    concepts,
    workedExamples,
    questions,
    misconceptions,
    visuals,
    vocabulary: vocabularyFor(concepts),
    takeaway: [
      `本章範圍：${context.unit.focus}`,
      `核心概念：${concepts.slice(0, 4).map((concept) => concept.title).join('、')}。`,
      context.subject === 'math' ? '最後用代回、估算、圖形、單位或另一種表示檢查答案。'
        : context.subject === 'english' ? '最後重讀完整句子或文本，檢查語意、形式、時間／指涉線索與語序。'
          : context.subject === 'science' ? '最後區分觀察、模型與推論，確認結論沒有超過資料能支持的範圍。'
            : context.subject === 'social' ? '最後核對來源、時間、空間尺度與立場，限制結論不超過資料。'
              : '最後回到完整文本與語境，用具體線索支持解讀與表達。',
    ],
  }
}

const cache = new Map<string, TextbookUnitContentV20Final | null>()
export function getCachedTextbookUnitContentV20Semantic(unitId: string) {
  if (cache.has(unitId)) return cache.get(unitId) ?? null
  const unit = getTextbookUnitContentV20Semantic(unitId)
  cache.set(unitId, unit)
  return unit
}
