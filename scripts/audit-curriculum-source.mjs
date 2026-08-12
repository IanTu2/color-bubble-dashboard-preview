import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const srcRoot = path.join(root, 'src')
const failures = []
const warnings = []
const questions = []
const ids = new Map()
const prompts = new Map()

const missingMaterialPhrases = [
  '根據下圖', '依下圖', '觀察下圖', '請看下圖', '如圖所示', '依附圖',
  '看到一張統計圖後', '依圖表而異', '依文本而異', '答案依題目而異',
]

function walkFiles(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...walkFiles(full))
    else if (/^curriculum-(reviewed|textbook-supplement)-.*\.(ts|tsx)$/.test(entry.name)) files.push(full)
  }
  return files
}

function lineNumber(text, index) {
  return text.slice(0, index).split('\n').length
}

function readQuoted(text, start) {
  const quote = text[start]
  if (!['\'', '"', '`'].includes(quote)) return null
  let value = ''
  let escaped = false
  for (let index = start + 1; index < text.length; index += 1) {
    const char = text[index]
    if (escaped) {
      value += char
      escaped = false
      continue
    }
    if (char === '\\') {
      value += char
      escaped = true
      continue
    }
    if (char === quote) return { value, end: index + 1 }
    value += char
  }
  return null
}

function extractBalanced(text, start, open, close) {
  if (text[start] !== open) return null
  let depth = 0
  let quote = null
  let escaped = false
  let lineComment = false
  let blockComment = false

  for (let index = start; index < text.length; index += 1) {
    const char = text[index]
    const next = text[index + 1]

    if (lineComment) {
      if (char === '\n') lineComment = false
      continue
    }
    if (blockComment) {
      if (char === '*' && next === '/') { blockComment = false; index += 1 }
      continue
    }
    if (quote) {
      if (escaped) { escaped = false; continue }
      if (char === '\\') { escaped = true; continue }
      if (char === quote) quote = null
      continue
    }
    if (char === '/' && next === '/') { lineComment = true; index += 1; continue }
    if (char === '/' && next === '*') { blockComment = true; index += 1; continue }
    if (char === '\'' || char === '"' || char === '`') { quote = char; continue }
    if (char === open) depth += 1
    if (char === close) {
      depth -= 1
      if (depth === 0) return { text: text.slice(start, index + 1), end: index + 1 }
    }
  }
  return null
}

function findPropertyStart(objectText, name) {
  const match = new RegExp(`\\b${name}\\s*:\\s*`).exec(objectText)
  return match ? match.index + match[0].length : -1
}

function readStringProperty(objectText, name) {
  const start = findPropertyStart(objectText, name)
  if (start < 0) return null
  return readQuoted(objectText, start)?.value ?? null
}

function readNumberProperty(objectText, name) {
  const start = findPropertyStart(objectText, name)
  if (start < 0) return null
  const match = /^-?\d+/.exec(objectText.slice(start))
  return match ? Number(match[0]) : null
}

function readStringArrayProperty(objectText, name) {
  const start = findPropertyStart(objectText, name)
  if (start < 0 || objectText[start] !== '[') return null
  const array = extractBalanced(objectText, start, '[', ']')
  if (!array) return null

  const values = []
  for (let index = 1; index < array.text.length - 1;) {
    const char = array.text[index]
    if (char === '\'' || char === '"' || char === '`') {
      const parsed = readQuoted(array.text, index)
      if (!parsed) return null
      values.push(parsed.value)
      index = parsed.end
      continue
    }
    index += 1
  }
  return values
}

function normalizePrompt(value) {
  return value.replace(/\\n/g, ' ').replace(/\s+/g, ' ').replace(/[「」『』“”"'，。！？、：；,.!?;:]/g, '').trim().toLowerCase()
}

function inspectQuestion(file, source, objectText, objectStart, id) {
  const relative = path.relative(root, file)
  const place = `${relative}:${lineNumber(source, objectStart)}`
  const kind = readStringProperty(objectText, 'kind')
  const prompt = readStringProperty(objectText, 'prompt')
  const explanation = readStringProperty(objectText, 'explanation')
  const context = readStringProperty(objectText, 'context') ?? ''

  if (ids.has(id)) failures.push(`${place}: duplicate question id ${id}; first seen at ${ids.get(id)}`)
  else ids.set(id, place)

  if (kind !== 'choice' && kind !== 'response') failures.push(`${place}: question ${id} must use kind 'choice' or 'response', found ${JSON.stringify(kind)}`)
  if (!prompt?.trim()) failures.push(`${place}: ${id} is missing a literal prompt`)
  if (!explanation?.trim()) failures.push(`${place}: ${id} is missing a literal explanation`)
  if (prompt && prompt.trim().length < 5) warnings.push(`${place}: very short prompt may be under-specified: ${JSON.stringify(prompt)}`)
  if (explanation && explanation.trim().length < 8) warnings.push(`${place}: explanation may be too thin to teach from: ${JSON.stringify(explanation)}`)

  const combined = `${context} ${prompt ?? ''}`
  for (const phrase of missingMaterialPhrases) {
    if (combined.includes(phrase)) failures.push(`${place}: ${id} refers to missing material (${phrase}) without an attached question-media schema`)
  }

  if (prompt) {
    const key = normalizePrompt(prompt)
    if (key.length >= 8) {
      const list = prompts.get(key) ?? []
      list.push(place)
      prompts.set(key, list)
    }
  }

  if (kind === 'choice') {
    const options = readStringArrayProperty(objectText, 'options')
    const correctIndex = readNumberProperty(objectText, 'correctIndex')
    if (!options) failures.push(`${place}: ${id} requires a literal options array`)
    else {
      if (options.length < 3) failures.push(`${place}: ${id} has only ${options.length} options`)
      const normalized = options.map(normalizePrompt)
      if (new Set(normalized).size !== normalized.length) failures.push(`${place}: ${id} has duplicate choice options`)
      if (correctIndex === null || !Number.isInteger(correctIndex)) failures.push(`${place}: ${id} requires integer correctIndex`)
      else if (correctIndex < 0 || correctIndex >= options.length) failures.push(`${place}: ${id} correctIndex ${correctIndex} is outside ${options.length} options`)
    }
  }

  if (kind === 'response') {
    const sampleAnswer = readStringProperty(objectText, 'sampleAnswer')
    if (!sampleAnswer?.trim()) failures.push(`${place}: ${id} requires a literal sampleAnswer`)
    else if (sampleAnswer.trim().length < 15) warnings.push(`${place}: ${id} sample answer may be too thin for a scoring reference`)
  }

  questions.push({ id, kind, prompt, file: relative, place })
}

const sourceFiles = walkFiles(srcRoot)
for (const file of sourceFiles) {
  const source = fs.readFileSync(file, 'utf8')
  const relative = path.relative(root, file)
  if (source.includes('בלבד')) warnings.push(`${relative}: legacy foreign-token artifact remains in source and must be cleaned before textbook-ready promotion`)

  const pattern = /\{\s*id\s*:\s*(['"])((?:g\d+-)?[^'"\n]+?(?:-supp)?-q\d+)\1/g
  let match
  while ((match = pattern.exec(source)) !== null) {
    const objectStart = match.index
    const balanced = extractBalanced(source, objectStart, '{', '}')
    if (!balanced) {
      failures.push(`${relative}:${lineNumber(source, objectStart)}: could not parse question object ${match[2]}`)
      continue
    }
    inspectQuestion(file, source, balanced.text, objectStart, match[2])
    pattern.lastIndex = balanced.end
  }
}

for (const [prompt, locations] of prompts.entries()) {
  if (locations.length >= 3) warnings.push(`repeated explicit prompt (${locations.length}x): ${prompt.slice(0, 90)} -> ${locations.join(', ')}`)
}

const choiceCount = questions.filter((question) => question.kind === 'choice').length
const responseCount = questions.filter((question) => question.kind === 'response').length
if (questions.length < 300) failures.push(`expected at least 300 explicit reviewed/supplement questions, found ${questions.length}`)

if (failures.length) {
  console.error('[curriculum-source-audit] FAILED')
  for (const failure of failures) console.error(`- ${failure}`)
  for (const warning of warnings.slice(0, 40)) console.warn(`! ${warning}`)
  if (warnings.length > 40) console.warn(`! ... ${warnings.length - 40} more warnings`)
  process.exit(1)
}

console.log(`[curriculum-source-audit] scanned ${sourceFiles.length} reviewed/supplement source files`)
console.log(`[curriculum-source-audit] explicit questions: ${questions.length} (${choiceCount} choice / ${responseCount} response)`)
console.log(`[curriculum-source-audit] unique explicit question ids: ${ids.size}`)
console.log(`[curriculum-source-audit] warnings: ${warnings.length}`)
for (const warning of warnings.slice(0, 25)) console.log(`[curriculum-source-audit] NOTE: ${warning}`)
if (warnings.length > 25) console.log(`[curriculum-source-audit] NOTE: ... ${warnings.length - 25} more warnings`)
