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
]) {
  if (!foundation.includes(requiredSourceToken)) failures.push(`foundation curriculum missing source requirement: ${requiredSourceToken}`)
}
for (const phrase of bannedMissingMaterial) {
  if (foundation.includes(phrase)) failures.push(`foundation curriculum contains banned missing-material wording: ${phrase}`)
}

const foundationV12 = read('src/curriculum-foundation-question-bank-v12.ts')
for (const requiredToken of [
  'buildFoundationSubjectQuestions',
  'upgradeFoundationUnitV12',
  '3x+5=20',
  '沉著',
  'Mia goes to the library after school on Tuesday',
  'science-animal-cell-zhtw',
  'science-earth-tilt-orbit-animation',
  'social-taiwan-relief',
  'optionFeedback',
  'rubric',
  'audioText',
  'mediaAssetId',
]) {
  if (!foundationV12.includes(requiredToken)) failures.push(`v12 subject question bank missing: ${requiredToken}`)
}
if (count(foundationV12, /foundation-v12-q/g) < 1) failures.push('v12 foundation question ids are not versioned')

const player = read('src/components/CurriculumCourseAppV12.tsx')
for (const requiredPlayerToken of [
  'splitQuestionBank',
  'groups.guided',
  'groups.practice',
  'groups.assessment',
  'QuestionMedia',
  'AudioPrompt',
  'optionFeedback',
  'curriculum-response-rubric',
  'CURRICULUM_VETTED_MEDIA',
]) {
  if (!player.includes(requiredPlayerToken)) failures.push(`CurriculumCourseAppV12 missing: ${requiredPlayerToken}`)
}
for (const forbiddenPlayerToken of [
  'getUnitAuditSnapshot',
  'getTrackPolicy',
  'compactAuditLabel',
  'curriculum-audit-warning',
  'curriculum-review-badge',
  '品質層級',
  'MutationObserver',
  'requestAnimationFrame',
]) {
  if (player.includes(forbiddenPlayerToken)) failures.push(`reader-facing V12 must not contain internal/DOM-rewrite token: ${forbiddenPlayerToken}`)
}
if (!player.includes("if (lesson.kind === 'guided') return groups.guided")) failures.push('guided lesson must have its own disjoint question group')
if (!player.includes("if (lesson.kind === 'practice') return groups.practice")) failures.push('practice lesson must have its own disjoint question group')
if (!player.includes("if (lesson.kind === 'assessment') return groups.assessment")) failures.push('assessment lesson must have its own disjoint question group')
if (player.includes("lesson.kind === 'launch') return all.slice")) failures.push('launch lesson must not recycle subject questions from later lessons')
if (player.includes("lesson.kind === 'example') return all.slice")) failures.push('example lesson must not recycle subject questions from later lessons')

const stableVisualPlayer = read('src/components/CurriculumCourseAppV8.tsx')
const playerExport = read('src/components/CurriculumCourseApp.tsx')
const stabilityCss = read('src/curriculum-visual-stability-v8.css')
if (!playerExport.includes("from './CurriculumCourseAppV8'")) failures.push('active curriculum player must export the stable v8 visual layer directly')
if (playerExport.includes('MutationObserver') || playerExport.includes('requestAnimationFrame')) failures.push('active export must not rewrite reader-facing copy after render')
if (!stableVisualPlayer.includes("from './CurriculumCourseAppV12'")) failures.push('v8 must attach directly to reader-first V12 player')
if (stableVisualPlayer.includes("from './CurriculumCourseAppV5'")) failures.push('v8 must not route through the old internal-status V5 player')
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
for (const requiredAggregatorToken of [
  'stableHash',
  'sanitizeQuestions',
  'normalizeChoiceQuestion',
  'getStrictReviewedUnitContent',
  'getFoundationUnitContent',
  'upgradeFoundationUnitV12',
  'optionFeedback',
  'mediaAssetId',
  'audioText',
  'rubric',
]) {
  if (!aggregator.includes(requiredAggregatorToken)) failures.push(`curriculum aggregator missing: ${requiredAggregatorToken}`)
}

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

console.log('[curriculum-qa] v12 reader player + disjoint lesson question groups + subject foundation questions + media/audio/feedback gates passed')
