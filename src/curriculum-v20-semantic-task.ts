export type V20SemanticTask = {
  context: string
  prompt: string
  correct: string
  distractors: [string, string, string]
  explanation: string
}

export function normalizeV20(value: unknown) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

export function compactV20(value: unknown, max = 120) {
  const clean = normalizeV20(value)
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).replace(/[，、；：,.!?。！？\s]+$/g, '')}…`
}

export function hashV20(value: string) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash >>> 0)
}

export function intV20(seed: string, min: number, max: number) {
  return min + (hashV20(seed) % (max - min + 1))
}

export function gcdV20(a: number, b: number): number {
  return b ? gcdV20(b, a % b) : Math.abs(a)
}

export function taskV20(context: string, prompt: string, correct: string, distractors: string[], explanation: string): V20SemanticTask {
  const cleanCorrect = normalizeV20(correct)
  const unique: string[] = []
  for (const value of distractors.map(normalizeV20)) {
    if (!value || value === cleanCorrect || unique.includes(value)) continue
    unique.push(value)
  }
  while (unique.length < 3) unique.push(`其他不符合題意的結果 ${unique.length + 1}`)
  return { context, prompt, correct: cleanCorrect, distractors: unique.slice(0, 3) as [string, string, string], explanation }
}
