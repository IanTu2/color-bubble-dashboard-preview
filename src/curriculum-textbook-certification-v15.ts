import { GRADE7_MATH_OFFICIAL_SCOPE } from './curriculum-official-scope-math7'
import { SCIENCE7_STAGE_IV_SCOPE } from './curriculum-official-scope-science7'
import type { CurriculumQuestionEnhancement } from './curriculum-foundation-question-bank-v12'
import type {
  ReviewedChoiceQuestion,
  ReviewedQuestion,
  ReviewedResponseQuestion,
  ReviewedUnitContent,
  ReviewedWorkedExample,
} from './curriculum-reviewed-social10'

type EnhancedChoice = ReviewedChoiceQuestion & CurriculumQuestionEnhancement
type EnhancedResponse = ReviewedResponseQuestion & CurriculumQuestionEnhancement

const MATH7_IDS = new Set(GRADE7_MATH_OFFICIAL_SCOPE.map((item) => item.unitId))
const SCIENCE7_IDS = new Set(SCIENCE7_STAGE_IV_SCOPE.map((item) => item.unitId))

export const TEXTBOOK_CERTIFICATION_V15_CANDIDATE_IDS = new Set([...MATH7_IDS, ...SCIENCE7_IDS])

function anchorOf(unit: ReviewedUnitContent) {
  return unit.concepts.find((item) => !/常見迷思|Common misconception/.test(item.title))?.title
    ?? unit.concepts[0]?.title
    ?? unit.overview
}

function mathExample(unit: ReviewedUnitContent, anchor: string): ReviewedWorkedExample {
  return {
    title: `認證示範：檢查「${anchor}」的錯誤解法`,
    context: `同學正在處理「${anchor}」的題目。他寫出一個看似熟悉的式子就直接算到底，但沒有說明條件、單位或為什麼能使用這個方法。`,
    prompt: '請找出這份解法最需要先檢查的地方，並寫出一套可以驗證答案的修正流程。',
    steps: [
      '重新列出題目的已知量、未知量、限制與單位，確認原解法沒有漏掉條件。',
      '把每一步運算或幾何／代數關係對回題意，說明使用的性質或定義。',
      '完成修正後的計算或推導，保留必要的符號、範圍與單位。',
      '用代回、估算、另一種表示、圖形或極端情況檢查結果是否合理。',
    ],
    answer: '先確認模型和條件，再修正計算，最後用獨立方法檢查；只有得到數字並不足以證明解法正確。',
    explanation: `這個示範專門檢查學生是否真的理解「${anchor}」的使用條件，而不是只會套固定題型。`,
  }
}

function scienceExample(unit: ReviewedUnitContent, anchor: string): ReviewedWorkedExample {
  return {
    title: `認證示範：用證據檢查「${anchor}」的解釋`,
    context: `兩組同學針對「${anchor}」提出不同解釋。第一組只引用一次觀察，第二組提出可量測的預測並考慮控制條件。`,
    prompt: '要如何比較兩個解釋的證據品質，並避免把觀察直接當成原因？',
    steps: [
      '先把可以直接觀察、量測或從圖表讀到的資料列出，不先加入原因。',
      '確認重要變因、比較條件、樣本或重複量測是否足以支持比較。',
      '把每個解釋轉成可檢驗的預測，說明若模型正確應該看到什麼結果。',
      '比較預測與資料，指出支持程度、仍存在的不確定性與結論適用範圍。',
    ],
    answer: '證據較完整的解釋必須能提出可檢驗預測、控制重要條件並和實際資料一致；單一次觀察通常不足以證明因果。',
    explanation: `這個示範把「${anchor}」放進科學探究流程，確認學生能分辨觀察、推論、模型與證據。`,
  }
}

function diagnosticChoice(unit: ReviewedUnitContent, unitId: string, anchor: string, science: boolean): EnhancedChoice {
  if (science) {
    return {
      id: `${unitId}-v15-diagnostic-choice`,
      kind: 'choice',
      level: '應用',
      context: `本題檢查「${anchor}」是否能用科學證據判斷，而不是只靠熟悉的名詞。`,
      prompt: `研究「${anchor}」時，哪一種作答最符合可靠的科學推理？`,
      options: [
        '先指出可觀察或量測的證據，再說明模型如何解釋，並限制結論範圍',
        '只要課本出現過同一個名詞，就直接把結論抄上去',
        '只挑一筆最符合自己猜想的資料，其餘忽略',
        '把示意模型的每個尺寸與顏色都當成實物完全相同',
      ],
      correctIndex: 0,
      explanation: '可靠的科學答案要讓證據、模型與結論彼此對得上，並承認資料不能支持的部分。',
      optionFeedback: [
        '正確。這個選項把證據、解釋與結論範圍分開，推理可以被檢查。',
        '不正確。記得名詞不代表已經使用證據，也沒有說明因果或機制。',
        '不正確。選擇性保留資料會造成偏誤，必須處理所有合理資料與不確定性。',
        '不正確。模型是簡化表示，顏色、比例或形狀不一定等同真實尺度。',
      ],
    }
  }

  return {
    id: `${unitId}-v15-diagnostic-choice`,
    kind: 'choice',
    level: '應用',
    context: `本題檢查「${anchor}」是否能從條件建立數學關係，而不是只靠題型記憶。`,
    prompt: `遇到「${anchor}」的新情境題時，哪一種解題流程最可靠？`,
    options: [
      '先列已知、未知與限制，建立關係，再計算並用另一種方式檢查',
      '看到熟悉關鍵字就立刻套最近背過的公式',
      '只要算出一個數字就停止，不檢查單位與範圍',
      '如果答案和預期不同，就直接把答案改成看起來比較合理的數字',
    ],
    correctIndex: 0,
    explanation: '數學解題的核心是先確認關係與條件，再進行運算；檢查則用來確認答案真的符合原問題。',
    optionFeedback: [
      '正確。這個流程從建模到驗證都有可檢查的依據。',
      '不正確。關鍵字可能出現在不同關係裡，公式必須先確認適用條件。',
      '不正確。數字若沒有單位、範圍或合理性檢查，仍可能不是題目真正的答案。',
      '不正確。合理性檢查是找出錯誤來源，不是直接竄改計算結果。',
    ],
  }
}

function transferResponse(unit: ReviewedUnitContent, unitId: string, anchor: string, science: boolean): EnhancedResponse {
  if (science) {
    return {
      id: `${unitId}-v15-transfer-response`,
      kind: 'response',
      level: '檢核',
      context: `把「${anchor}」換到一個教材沒有直接示範的新材料、生物或環境條件。`,
      prompt: '請提出一個可檢驗的預測，說明要蒐集什麼證據、控制什麼條件，以及什麼結果會讓你修改原本的解釋。',
      sampleAnswer: '完整答案應先根據本單元模型提出方向明確的預測，再指定可量測資料與重要控制條件；如果重複資料持續不符合預測，就要限制或修正原模型，而不是忽略不符合的結果。',
      explanation: '這題評量能不能把概念轉移到陌生情境，同時維持科學探究的可檢驗性。',
      rubric: ['預測和本單元概念有明確連結', '列出可觀察／量測證據與重要控制條件', '說明何種結果會支持、限制或修改解釋', '沒有把一次觀察直接當成因果證明'],
    }
  }

  return {
    id: `${unitId}-v15-transfer-response`,
    kind: 'response',
    level: '檢核',
    context: `把「${anchor}」放進一個數值、圖形或生活背景都不同的新問題。`,
    prompt: '請說明你會如何判斷原本的方法是否仍適用，建立新的數學關係，並用至少一種獨立方式檢查答案。',
    sampleAnswer: '完整答案要先比較新問題的已知量、未知量與限制是否仍符合原概念的使用條件；若符合，再建立式子／圖形／表格處理，最後可用代回、估算、另一種表示或特殊值檢查。',
    explanation: '這題評量的是方法能否轉移，而不是把原例題換一組數字後照抄步驟。',
    rubric: ['正確辨認新情境的已知、未知與限制', '方法與本單元數學關係相符', '關鍵推理或計算步驟可檢查', '至少使用一種獨立方法驗證結果'],
  }
}

function uniqueById(questions: ReviewedQuestion[]) {
  const seen = new Set<string>()
  return questions.filter((question) => {
    if (seen.has(question.id)) return false
    seen.add(question.id)
    return true
  })
}

export function enrichTextbookCertificationCandidateV15(unit: ReviewedUnitContent, unitId: string): ReviewedUnitContent {
  const isMath = MATH7_IDS.has(unitId)
  const isScience = SCIENCE7_IDS.has(unitId)
  if (!isMath && !isScience) return unit

  const anchor = anchorOf(unit)
  const certificationExample = isScience ? scienceExample(unit, anchor) : mathExample(unit, anchor)
  const workedExamples = unit.workedExamples.some((item) => item.title === certificationExample.title)
    ? unit.workedExamples
    : [...unit.workedExamples, certificationExample]

  const questions = uniqueById([
    ...unit.questions,
    diagnosticChoice(unit, unitId, anchor, isScience),
    transferResponse(unit, unitId, anchor, isScience),
  ])

  return {
    ...unit,
    researchBasis: Array.from(new Set([
      ...unit.researchBasis,
      isScience
        ? 'Bubble Space V15：七年級自然第四學習階段 scope、人工教材、題庫診斷、rubric 與 vetted media 認證檢查'
        : 'Bubble Space V15：七年級數學官方學習內容 scope、人工教材、題庫診斷與 rubric 認證檢查',
    ])),
    workedExamples,
    questions,
  }
}
