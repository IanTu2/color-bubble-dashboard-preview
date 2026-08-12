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

const bannedMissingMaterial = [
  '看到一張統計圖後',
  '依圖表而異',
  '依文本而異',
  '答案依題目而異',
  '根據下圖',
  '依下圖',
  '觀察下圖',
  '請看下圖',
  '如圖所示',
  '依附圖',
]

for (const target of activeModules) {
  const text = read(target.file)
  const reviewedCount = count(text, /reviewStatus:\s*['"]reviewed['"]/g)
  const questionCount = count(text, /id:\s*['"][^'"]+-q\d+['"]/g)
  const workedExampleCount = count(text, /workedExamples\s*:/g)

  if (reviewedCount < target.units) failures.push(`${target.file}: reviewed units ${reviewedCount} < ${target.units}`)
  if (questionCount < target.questions) failures.push(`${target.file}: questions ${questionCount} < ${target.questions}`)
  if (workedExampleCount < target.units) failures.push(`${target.file}: worked examples ${workedExampleCount} < ${target.units}`)

  for (const phrase of bannedMissingMaterial) {
    if (text.includes(phrase)) failures.push(`${target.file}: banned missing-material fallback "${phrase}"`)
  }
}

const basePlan = read('src/curriculum-plan.ts')
const planSubjects = ['chinese', 'english', 'math', 'science', 'social']
for (let index = 0; index < planSubjects.length; index += 1) {
  const subject = planSubjects[index]
  const startMarker = `const ${subject}: Record<number, RawTrack> = {`
  const nextSubject = planSubjects[index + 1]
  const start = basePlan.indexOf(startMarker)
  const end = nextSubject ? basePlan.indexOf(`const ${nextSubject}: Record<number, RawTrack> = {`, start + startMarker.length) : basePlan.indexOf('const subjectRoadmaps', start + startMarker.length)
  if (start < 0 || end < 0) {
    failures.push(`curriculum-plan.ts: cannot isolate ${subject} roadmap`)
    continue
  }
  const block = basePlan.slice(start, end)
  for (let grade = 1; grade <= 12; grade += 1) {
    if (!new RegExp(`\\n\\s*${grade}: \\[` ).test(block)) failures.push(`curriculum-plan.ts: ${subject} grade ${grade} roadmap missing`)
  }
}

const foundation = read('src/curriculum-foundation-content.ts')
for (const requiredSourceToken of [
  "reviewStatus: 'foundation'",
  'getFoundationUnitContent',
  'getCurriculumTrack',
  'CHINESE_RULES',
  'ENGLISH_RULES',
  'MATH_RULES',
  'SCIENCE_RULES',
  'SOCIAL_RULES',
  'workedExampleFor',
  'buildQuestions',
  'foundation-q8',
]) {
  if (!foundation.includes(requiredSourceToken)) failures.push(`foundation curriculum missing source requirement: ${requiredSourceToken}`)
}
for (const phrase of bannedMissingMaterial) {
  if (foundation.includes(phrase)) failures.push(`foundation curriculum contains banned missing-material wording: ${phrase}`)
}

const player = read('src/components/CurriculumCourseAppV5.tsx')
if (player.includes("from '../curriculum-teaching-content'")) failures.push('CurriculumCourseAppV5 must not import the legacy teaching-content fallback')
if (player.includes("from '../curriculum-rich-content'")) failures.push('CurriculumCourseAppV5 must not import the legacy rich-content fallback')
if (!player.includes('getUnitAuditSnapshot')) failures.push('CurriculumCourseAppV5 must render v10 audit status directly')
if (!player.includes('getCurriculumUnitContent')) failures.push('CurriculumCourseAppV5 must distinguish available curriculum content from QA tier')
if (!player.includes('isReviewedUnit')) failures.push('CurriculumCourseAppV5 must distinguish strict human review status')

const stableVisualPlayer = read('src/components/CurriculumCourseAppV8.tsx')
const playerExport = read('src/components/CurriculumCourseApp.tsx')
const stabilityCss = read('src/curriculum-visual-stability-v8.css')
if (!playerExport.includes("from './CurriculumCourseAppV8'")) failures.push('active curriculum player must use v8 stable visual layer directly after v10 audit status is rendered inside V5')
if (playerExport.includes('CurriculumCourseAppV9')) failures.push('v9 status MutationObserver must not remain on the active curriculum path')
if (!stableVisualPlayer.includes("from './CurriculumCourseAppV5'")) failures.push('v8 must attach directly to v5 instead of nesting the competing v6/v7 observers')
if (!stableVisualPlayer.includes('useLayoutEffect')) failures.push('v8 visuals must be synchronized before paint with useLayoutEffect')
if (stableVisualPlayer.includes('requestAnimationFrame')) failures.push('v8 visual layer must not defer layout changes to requestAnimationFrame')
if (!stableVisualPlayer.includes('observer?.disconnect()')) failures.push('v8 must disconnect its observer while mutating the visual DOM')
if (!stabilityCss.includes('grid-template-columns')) failures.push('v8 must reserve teaching-visual layout space before media is inserted')
if (!stabilityCss.includes('aspect-ratio: 4 / 3')) failures.push('v8 vetted image container needs a fixed aspect ratio to prevent image-load layout shift')

const vettedMedia = read('src/curriculum-vetted-media.ts')
if (!stableVisualPlayer.includes('findVettedCurriculumMedia')) failures.push('v8 must resolve concept-specific vetted media')
for (const requiredAsset of [
  'Animal%20cell%20structure%20zhtw.svg',
  'Plant%20cell%20structure%20svg%20zh-hant.svg',
  'Reliefkarte%20Taiwan.png',
  'Mitosis%20Animation.gif',
  'Blood%20Circulation.gif',
  'Earth%20tilt%20animation.gif',
]) {
  if (!vettedMedia.includes(requiredAsset)) failures.push(`vetted curriculum media missing required asset: ${requiredAsset}`)
}
for (const requiredMetadata of ['sourcePage:', 'license:', 'attribution:', 'alt:', "mediaType: 'animation'"]) {
  if (!vettedMedia.includes(requiredMetadata)) failures.push(`vetted curriculum media missing metadata field: ${requiredMetadata}`)
}

const aggregator = read('src/curriculum-reviewed-content.ts')
if (!aggregator.includes('stableHash')) failures.push('curriculum choices must use stable per-question option shuffling')
if (!aggregator.includes('sanitizeQuestions')) failures.push('curriculum question sanitizer is missing')
if (!aggregator.includes('normalizeChoiceQuestion')) failures.push('curriculum content must normalize choice questions from their actual options')
if (!aggregator.includes('getStrictReviewedUnitContent')) failures.push('reviewed content must remain separately identifiable from foundation content')
if (!aggregator.includes('getFoundationUnitContent')) failures.push('all-grade foundation content must be wired under manually reviewed content')

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

console.log('[curriculum-qa] reviewed + all-grade foundation + vetted animation + visual stability + direct audit status checks passed')
