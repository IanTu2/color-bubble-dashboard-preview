import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')

const activeModules = [
  { file: 'src/curriculum-reviewed-social10.ts', units: 6, questions: 48 },
  { file: 'src/curriculum-reviewed-math7.ts', units: 6, questions: 48 },
  { file: 'src/curriculum-reviewed-math7-v2.ts', units: 5, questions: 40 },
  { file: 'src/curriculum-reviewed-science7.ts', units: 6, questions: 48 },
]

const failures = []
const count = (text, pattern) => (text.match(pattern) ?? []).length

for (const target of activeModules) {
  const text = read(target.file)
  const reviewedCount = count(text, /reviewStatus:\s*['"]reviewed['"]/g)
  const questionCount = count(text, /kind:\s*['"](?:choice|response)['"]/g)
  const workedExampleCount = count(text, /workedExamples\s*:/g)

  if (reviewedCount < target.units) failures.push(`${target.file}: reviewed units ${reviewedCount} < ${target.units}`)
  if (questionCount < target.questions) failures.push(`${target.file}: questions ${questionCount} < ${target.questions}`)
  if (workedExampleCount < target.units) failures.push(`${target.file}: worked examples ${workedExampleCount} < ${target.units}`)

  const banned = [
    '看到一張統計圖後',
    '依圖表而異',
    '依文本而異',
    '答案依題目而異',
  ]
  for (const phrase of banned) {
    if (text.includes(phrase)) failures.push(`${target.file}: banned missing-material fallback "${phrase}"`)
  }
}

const player = read('src/components/CurriculumCourseAppV5.tsx')
if (player.includes("from '../curriculum-teaching-content'")) failures.push('CurriculumCourseAppV5 must not import the legacy teaching-content fallback')
if (player.includes("from '../curriculum-rich-content'")) failures.push('CurriculumCourseAppV5 must not import the legacy rich-content fallback')

const aggregator = read('src/curriculum-reviewed-content.ts')
if (!aggregator.includes('stableHash')) failures.push('reviewed choices must use stable per-question option shuffling')
if (!aggregator.includes('sanitizeReviewedUnit')) failures.push('reviewed content sanitizer is missing')

if (failures.length) {
  console.error('[curriculum-qa] FAILED')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('[curriculum-qa] reviewed content source checks passed')
