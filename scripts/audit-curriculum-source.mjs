import fs from 'node:fs'
import path from 'node:path'
import * as ts from 'typescript'

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
    else if (/\.(ts|tsx)$/.test(entry.name) && entry.name.startsWith('curriculum-')) files.push(full)
  }
  return files
}

function propName(property) {
  if (!property?.name) return null
  if (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name) || ts.isNumericLiteral(property.name)) return property.name.text
  return null
}

function property(object, name) {
  return object.properties.find((item) => ts.isPropertyAssignment(item) && propName(item) === name)
}

function stringValue(expression) {
  if (!expression) return null
  if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) return expression.text
  return null
}

function numericValue(expression) {
  if (!expression) return null
  if (ts.isNumericLiteral(expression)) return Number(expression.text)
  if (ts.isPrefixUnaryExpression(expression) && expression.operator === ts.SyntaxKind.MinusToken && ts.isNumericLiteral(expression.operand)) return -Number(expression.operand.text)
  return null
}

function location(sourceFile, node) {
  const pos = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
  return `${path.relative(root, sourceFile.fileName)}:${pos.line + 1}`
}

function normalizePrompt(value) {
  return value.replace(/\s+/g, ' ').replace(/[「」『』“”"'，。！？、：；,.!?;:]/g, '').trim().toLowerCase()
}

function visitObject(sourceFile, node) {
  if (!ts.isObjectLiteralExpression(node)) return
  const idProp = property(node, 'id')
  const id = idProp ? stringValue(idProp.initializer) : null
  if (!id || !/(?:-q\d+|-supp-q\d+)$/.test(id)) return

  const place = location(sourceFile, node)
  const kindProp = property(node, 'kind')
  const promptProp = property(node, 'prompt')
  const explanationProp = property(node, 'explanation')
  const contextProp = property(node, 'context')
  const kind = kindProp ? stringValue(kindProp.initializer) : null
  const prompt = promptProp ? stringValue(promptProp.initializer) : null
  const explanation = explanationProp ? stringValue(explanationProp.initializer) : null
  const context = contextProp ? stringValue(contextProp.initializer) : ''

  if (ids.has(id)) failures.push(`${place}: duplicate question id ${id}; first seen at ${ids.get(id)}`)
  else ids.set(id, place)

  if (!kind) failures.push(`${place}: question kind must be a literal 'choice' or 'response'; do not rely on type assertions or runtime repair`)
  else if (kind !== 'choice' && kind !== 'response') failures.push(`${place}: unsupported question kind ${kind}`)

  if (!prompt?.trim()) failures.push(`${place}: missing literal prompt`)
  if (!explanation?.trim()) failures.push(`${place}: missing literal explanation`)
  if (prompt && prompt.trim().length < 5) warnings.push(`${place}: very short prompt may be under-specified: ${JSON.stringify(prompt)}`)
  if (explanation && explanation.trim().length < 8) warnings.push(`${place}: explanation is too short to teach from: ${JSON.stringify(explanation)}`)

  const combined = `${context ?? ''} ${prompt ?? ''}`
  for (const phrase of missingMaterialPhrases) {
    if (combined.includes(phrase)) failures.push(`${place}: missing-material wording ${JSON.stringify(phrase)} is forbidden unless a question-media schema supplies the asset`)
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
    const optionsProp = property(node, 'options')
    const correctProp = property(node, 'correctIndex')
    if (!optionsProp || !ts.isArrayLiteralExpression(optionsProp.initializer)) {
      failures.push(`${place}: choice question requires a literal options array`)
    } else {
      const optionNodes = optionsProp.initializer.elements
      const optionValues = optionNodes.map((item) => stringValue(item))
      if (optionValues.some((item) => item === null)) failures.push(`${place}: every choice option must be a literal string for source QA`)
      if (optionValues.length < 3) failures.push(`${place}: choice question has only ${optionValues.length} options`)
      const normalized = optionValues.filter((item) => item !== null).map((item) => normalizePrompt(item))
      if (new Set(normalized).size !== normalized.length) failures.push(`${place}: duplicate choice options`)
      const correctIndex = correctProp ? numericValue(correctProp.initializer) : null
      if (correctIndex === null || !Number.isInteger(correctIndex)) failures.push(`${place}: choice question requires integer correctIndex`)
      else if (correctIndex < 0 || correctIndex >= optionValues.length) failures.push(`${place}: correctIndex ${correctIndex} outside ${optionValues.length} options`)
    }
  }

  if (kind === 'response') {
    const sampleProp = property(node, 'sampleAnswer')
    const sample = sampleProp ? stringValue(sampleProp.initializer) : null
    if (!sample?.trim()) failures.push(`${place}: response question requires a literal sampleAnswer`)
    else if (sample.trim().length < 15) warnings.push(`${place}: response sample answer may be too thin for a scoring reference`)
  }

  questions.push({ id, kind, prompt, file: path.relative(root, sourceFile.fileName), place })
}

const sourceFiles = walkFiles(srcRoot)
for (const file of sourceFiles) {
  const text = fs.readFileSync(file, 'utf8')
  const relative = path.relative(root, file)
  if (text.includes('בלבד')) {
    if (relative === 'src/curriculum-reviewed-science7.ts') warnings.push(`${relative}: legacy foreign-token artifact remains in source and blocks textbook-ready promotion until cleaned`)
    else failures.push(`${relative}: unexpected foreign-token artifact בלבד`)
  }
  const sourceFile = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true)
  const visit = (node) => {
    visitObject(sourceFile, node)
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
}

for (const [prompt, locations] of prompts.entries()) {
  if (locations.length >= 3) warnings.push(`repeated explicit prompt (${locations.length}x): ${prompt.slice(0, 90)} -> ${locations.join(', ')}`)
}

const explicitReviewed = questions.filter((question) => /curriculum-(reviewed|textbook-supplement)-/.test(question.file))
const choiceCount = explicitReviewed.filter((question) => question.kind === 'choice').length
const responseCount = explicitReviewed.filter((question) => question.kind === 'response').length

if (explicitReviewed.length < 300) failures.push(`expected at least 300 explicit reviewed/supplement questions, found ${explicitReviewed.length}`)

if (failures.length) {
  console.error('[curriculum-source-audit] FAILED')
  for (const failure of failures) console.error(`- ${failure}`)
  for (const warning of warnings.slice(0, 40)) console.warn(`! ${warning}`)
  if (warnings.length > 40) console.warn(`! ... ${warnings.length - 40} more warnings`)
  process.exit(1)
}

console.log(`[curriculum-source-audit] scanned ${sourceFiles.length} curriculum source files`)
console.log(`[curriculum-source-audit] explicit reviewed/supplement questions: ${explicitReviewed.length} (${choiceCount} choice / ${responseCount} response)`)
console.log(`[curriculum-source-audit] unique explicit question ids: ${ids.size}`)
console.log(`[curriculum-source-audit] warnings: ${warnings.length}`)
for (const warning of warnings.slice(0, 25)) console.log(`[curriculum-source-audit] NOTE: ${warning}`)
if (warnings.length > 25) console.log(`[curriculum-source-audit] NOTE: ... ${warnings.length - 25} more warnings`)
