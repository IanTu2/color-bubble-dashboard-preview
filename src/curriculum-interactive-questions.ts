import type { RichLessonPack, RichPractice } from './curriculum-rich-content'

export type InteractiveLessonQuestion =
  | {
      id: string
      kind: 'choice'
      level: '理解' | '應用' | '檢核'
      prompt: string
      context?: string
      options: string[]
      correctIndex: number
      explanation: string
    }
  | {
      id: string
      kind: 'response'
      level: '理解' | '應用' | '檢核'
      prompt: string
      context?: string
      sampleAnswer: string
      explanation: string
    }

const VAGUE_PRACTICE = /看到一張|依圖表|依題目|依文本|一個公共議題|本單元的一個|今天的文章|文章或概念|答案可不同|答案依|自行|自己舉例/

export function isPracticeSelfContained(item: RichPractice) {
  return !VAGUE_PRACTICE.test(`${item.question} ${item.answer}`)
}

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)))
}

function rotateChoice(
  id: string,
  level: '理解' | '應用' | '檢核',
  prompt: string,
  correct: string,
  distractors: string[],
  explanation: string,
  seed: number,
  context?: string,
): InteractiveLessonQuestion {
  const pool = unique([
    correct,
    ...distractors,
    '只要記住名稱，不需要理解內容',
    '這和本課的觀念沒有直接關係',
    '沒有足夠資訊可以做任何判斷',
  ]).slice(0, 4)
  const shift = pool.length ? seed % pool.length : 0
  const options = [...pool.slice(shift), ...pool.slice(0, shift)]
  return {
    id,
    kind: 'choice',
    level,
    prompt,
    context,
    options,
    correctIndex: options.indexOf(correct),
    explanation,
  }
}

export function buildInteractiveLessonQuestions(pack: RichLessonPack, lessonId: string): InteractiveLessonQuestion[] {
  const questions: InteractiveLessonQuestion[] = []
  const items = pack.visual.items.filter((item) => item.label.trim() && item.detail.trim())

  items.slice(0, 5).forEach((item, index) => {
    const otherDetails = items.filter((_, itemIndex) => itemIndex !== index).map((entry) => entry.detail)
    const otherLabels = items.filter((_, itemIndex) => itemIndex !== index).map((entry) => entry.label)

    questions.push(rotateChoice(
      `${lessonId}-visual-detail-${index}`,
      '理解',
      `下列哪一個敘述最符合「${item.label}」？`,
      item.detail,
      otherDetails,
      `教材中的「${item.label}」對應的是：${item.detail}`,
      index + 1,
      pack.visual.title,
    ))

    questions.push(rotateChoice(
      `${lessonId}-visual-label-${index}`,
      '理解',
      `「${item.detail}」在這張教材中對應哪個概念？`,
      item.label,
      otherLabels,
      `這段說明在教材中標示為「${item.label}」。`,
      index + 2,
      pack.visual.title,
    ))
  })

  const safePractices = pack.practices.filter(isPracticeSelfContained)
  safePractices.forEach((item, index) => {
    if (questions.length >= 10) return
    questions.push({
      id: `${lessonId}-response-${index}`,
      kind: 'response',
      level: index === 0 ? '理解' : index === 1 ? '應用' : '檢核',
      prompt: item.question,
      context: item.hint,
      sampleAnswer: item.answer,
      explanation: item.explanation,
    })
  })

  if (questions.length < 10) {
    questions.push(rotateChoice(
      `${lessonId}-takeaway`,
      '檢核',
      '哪一項最接近這一課真正希望你帶走的重點？',
      pack.takeaway,
      [
        '只要把最後答案背起來，遇到新題也不用重新判斷。',
        '只要記住專有名詞，不必知道它和例子有什麼關係。',
        '只看一個數字或一句話，就能對所有情況下結論。',
      ],
      pack.takeaway,
      3,
    ))
  }

  if (questions.length < 10 && pack.bridge[0]) {
    questions.push(rotateChoice(
      `${lessonId}-bridge`,
      '理解',
      '下列哪一句最符合本課前面的觀念說明？',
      pack.bridge[0],
      [
        '遇到不熟悉的題目時直接猜答案最快。',
        '只需要記住結果，不需要確認資料或條件。',
        '同一個方法不論條件如何都一定能直接套用。',
      ],
      pack.bridge[0],
      1,
    ))
  }

  while (questions.length < 8) {
    const index = questions.length
    questions.push(rotateChoice(
      `${lessonId}-quality-${index}`,
      '檢核',
      '如果題目換了情境，哪一種做法比較可靠？',
      '先確認題目提供的條件，再回到本課觀念判斷。',
      [
        '看到熟悉的關鍵字就直接選同一個答案。',
        '不看條件，只套用上一題的結論。',
        '只記住老師示範的最後一句話。',
      ],
      '學會一個觀念的目標，是能依新的條件重新判斷，而不是只記住單一題答案。',
      index,
    ))
  }

  return questions.slice(0, 10)
}
