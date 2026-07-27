import { normalizeEnglishAnswer } from './english-learning'

export type SmartGradeKind = 'exact' | 'alternative' | 'close' | 'wrong'

export type SmartGrade = {
  score: number
  kind: SmartGradeKind
  matchedAnswer: string | null
}

function editDistance(left: string, right: string) {
  const matrix = Array.from(
    { length: left.length + 1 },
    () => Array<number>(right.length + 1).fill(0),
  )

  for (let row = 0; row <= left.length; row += 1) matrix[row][0] = row
  for (let column = 0; column <= right.length; column += 1) matrix[0][column] = column

  for (let row = 1; row <= left.length; row += 1) {
    for (let column = 1; column <= right.length; column += 1) {
      const cost = left[row - 1] === right[column - 1] ? 0 : 1
      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + cost,
      )
    }
  }

  return matrix[left.length][right.length]
}

export function smartGradeEnglishAnswer(
  answer: string,
  target: string,
  acceptedAnswers: string[] = [],
): SmartGrade {
  const normalized = normalizeEnglishAnswer(answer)
  const normalizedTarget = normalizeEnglishAnswer(target)

  if (!normalized) return { score: 0, kind: 'wrong', matchedAnswer: null }
  if (normalized === normalizedTarget) {
    return { score: 1, kind: 'exact', matchedAnswer: target }
  }

  const alternatives = Array.from(new Set(acceptedAnswers))
    .filter((item) => normalizeEnglishAnswer(item) !== normalizedTarget)

  const exactAlternative = alternatives.find(
    (item) => normalizeEnglishAnswer(item) === normalized,
  )
  if (exactAlternative) {
    return { score: 0.75, kind: 'alternative', matchedAnswer: exactAlternative }
  }

  if (normalizedTarget.length >= 5 && editDistance(normalized, normalizedTarget) === 1) {
    return { score: 0.5, kind: 'close', matchedAnswer: target }
  }

  const closeAlternative = alternatives.find((item) => {
    const alternative = normalizeEnglishAnswer(item)
    return alternative.length >= 5 && editDistance(normalized, alternative) === 1
  })
  if (closeAlternative) {
    return { score: 0.5, kind: 'close', matchedAnswer: closeAlternative }
  }

  return { score: 0, kind: 'wrong', matchedAnswer: null }
}

export function targetLetterHint(word: string) {
  const trimmed = word.trim()
  if (trimmed.length <= 2) return trimmed
  return `${trimmed[0]}${'_'.repeat(Math.max(1, trimmed.length - 2))}${trimmed[trimmed.length - 1]}`
}

export function smartGradeLabel(
  grade: SmartGrade,
  target: string,
  language: 'zh' | 'en',
) {
  if (language === 'en') {
    if (grade.kind === 'exact') return 'Exact target answer'
    if (grade.kind === 'alternative') return `Meaning accepted. The lesson target is “${target}”.`
    if (grade.kind === 'close') return `Almost correct. Check the spelling of “${grade.matchedAnswer ?? target}”.`
    return `The target answer is “${target}”.`
  }

  if (grade.kind === 'exact') return '完全正確，命中本課目標字。'
  if (grade.kind === 'alternative') {
    return `你的答案語意可以接受；本課目標字是「${target}」，請留意兩者常見搭配與使用情境。`
  }
  if (grade.kind === 'close') {
    return `拼字非常接近，請再檢查「${grade.matchedAnswer ?? target}」的字母順序。`
  }
  return `本題目標答案是「${target}」。`
}
