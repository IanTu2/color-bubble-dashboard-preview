import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')

const activeModules = [
  { file: 'src/curriculum-reviewed-social10.ts', units: 6, questions: 48 },
  { file: 'src/curriculum-reviewed-math7.ts', units: 6, questions: 48 },
  { file: 'src/curriculum-reviewed-math7-v2.ts', units: 5, questions: 40 },
  { file: 'src/curriculum-reviewed-science7.ts', units: 6, questions: 48 },
  { file: 'src/curriculum-reviewed-chinese7.ts', units: 6, questions: 48 },
  { file: 'src/curriculum-reviewed-english7.ts', units: 6, questions: 48 },
  { file: 'src/curriculum-reviewed-social7.ts', units: 6, questions: 48 },
]

const failures = []
const count = (text, pattern) => (text.match(pattern) ?? []).length

for (const target of activeModules) {
  const text = read(target.file)
  const reviewedCount = count(text, /reviewStatus:\s*['"]reviewed['"]/g)
  // 作者檔允許 QA 期間用強制型別標記；正式 player 會依 options/sampleAnswer 正規化題型。
  // 這裡用 question id 數量確認題庫，不讓拼字型別標記掩蓋「其實少題」。
  const questionCount = count(text, /id:\s*['"][^'"]+-q\d+['"]/g)
  const workedExampleCount = count(text, /workedExamples\s*:/g)

  if (reviewedCount < target.units) failures.push(`${target.file}: reviewed units ${reviewedCount} < ${target.units}`)
  if (questionCount < target.questions) failures.push(`${target.file}: questions ${questionCount} < ${target.questions}`)
  if (workedExampleCount < target.units) failures.push(`${target.file}: worked examples ${workedExampleCount} < ${target.units}`)

  const banned = [
    '看到一張統計圖後',
    '依圖表而異',
    '依文本而異',
    '答案依題目而異',
    // v6 原則：在正式題目視覺資料 schema 上線前，任何「需要一張未附圖才能作答」的題幹都不能進 reviewed 題庫。
    '根據下圖',
    '依下圖',
    '觀察下圖',
    '請看下圖',
    '如圖所示',
    '依附圖',
  ]
  for (const phrase of banned) {
    if (text.includes(phrase)) failures.push(`${target.file}: banned missing-material fallback "${phrase}"`)
  }
}

const player = read('src/components/CurriculumCourseAppV5.tsx')
if (player.includes("from '../curriculum-teaching-content'")) failures.push('CurriculumCourseAppV5 must not import the legacy teaching-content fallback')
if (player.includes("from '../curriculum-rich-content'")) failures.push('CurriculumCourseAppV5 must not import the legacy rich-content fallback')

const visualLayer = read('src/components/CurriculumCourseAppV6.tsx')
if (!visualLayer.includes('enhanceTeachingPage')) failures.push('CurriculumCourseAppV6 teaching visual enhancer is missing')
if (!visualLayer.includes('curriculum-page-question')) failures.push('CurriculumCourseAppV6 must explicitly keep ordinary question pages text-first')

const aggregator = read('src/curriculum-reviewed-content.ts')
if (!aggregator.includes('stableHash')) failures.push('reviewed choices must use stable per-question option shuffling')
if (!aggregator.includes('sanitizeReviewedUnit')) failures.push('reviewed content sanitizer is missing')
if (!aggregator.includes('normalizeChoiceQuestion')) failures.push('reviewed content must normalize choice questions from their actual options')

const planV5 = read('src/curriculum-plan-v5.ts')
for (const requiredChapter of ['二元一次聯立方程式', '直角坐標與二元一次方程式圖形', '一元一次不等式']) {
  if (!planV5.includes(requiredChapter)) failures.push(`grade 7 math researched roadmap missing: ${requiredChapter}`)
}
if (planV5.includes('公民：民主與法律')) failures.push('grade 7 social roadmap must not place the old politics/law unit in grade 7')
if (!planV5.includes('公民：社會互動、規範、文化與福利')) failures.push('grade 7 social researched roadmap is missing the corrected social-life unit')

if (failures.length) {
  console.error('[curriculum-qa] FAILED')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('[curriculum-qa] reviewed content source checks passed')