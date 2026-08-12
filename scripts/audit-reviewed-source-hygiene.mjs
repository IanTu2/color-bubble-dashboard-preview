import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const reviewedFiles = [
  'src/curriculum-reviewed-social10.ts',
  'src/curriculum-reviewed-math7.ts',
  'src/curriculum-reviewed-math7-v2.ts',
  'src/curriculum-reviewed-science7.ts',
  'src/curriculum-reviewed-chinese7.ts',
  'src/curriculum-reviewed-english7.ts',
  'src/curriculum-reviewed-social7.ts',
]

const failures = []

for (const file of reviewedFiles) {
  const text = fs.readFileSync(path.join(root, file), 'utf8')

  const invalidKinds = [...text.matchAll(/kind\s*:\s*['"]([^'"]+)['"]/g)]
    .map((match) => match[1])
    .filter((kind) => kind !== 'choice' && kind !== 'response')
  if (invalidKinds.length) {
    failures.push(`${file}: invalid question kind values: ${Array.from(new Set(invalidKinds)).join(', ')}`)
  }

  if (/\bas\s+never\b/.test(text)) failures.push(`${file}: unsafe 'as never' cast is forbidden in reviewed curriculum source`)
  if (/\bas\s+any\b/.test(text)) failures.push(`${file}: unsafe 'as any' cast is forbidden in reviewed curriculum source`)
  if (text.includes('בלבד')) failures.push(`${file}: legacy foreign-token artifact remains in reviewed curriculum source`)

  const choiceObjects = [...text.matchAll(/\{[^{}]*kind\s*:\s*['"]choice['"][^{}]*\}/gs)]
  for (const match of choiceObjects) {
    const objectText = match[0]
    if (!/level\s*:\s*['"](?:理解|應用|檢核)['"]/.test(objectText)) {
      failures.push(`${file}: choice question is missing a valid level near ${objectText.slice(0, 90).replace(/\s+/g, ' ')}`)
    }
    if (!/correctIndex\s*:\s*\d+/.test(objectText)) {
      failures.push(`${file}: choice question is missing correctIndex near ${objectText.slice(0, 90).replace(/\s+/g, ' ')}`)
    }
  }

  const responseObjects = [...text.matchAll(/\{[^{}]*kind\s*:\s*['"]response['"][^{}]*\}/gs)]
  for (const match of responseObjects) {
    const objectText = match[0]
    if (!/level\s*:\s*['"](?:理解|應用|檢核)['"]/.test(objectText)) {
      failures.push(`${file}: response question is missing a valid level near ${objectText.slice(0, 90).replace(/\s+/g, ' ')}`)
    }
    if (!/sampleAnswer\s*:/.test(objectText)) {
      failures.push(`${file}: response question is missing sampleAnswer near ${objectText.slice(0, 90).replace(/\s+/g, ' ')}`)
    }
  }
}

if (failures.length) {
  console.error('[reviewed-source-hygiene] FAILED')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(`[reviewed-source-hygiene] passed for ${reviewedFiles.length} reviewed curriculum modules`)
console.log('[reviewed-source-hygiene] question kind, level, unsafe casts and dirty-token checks passed')
