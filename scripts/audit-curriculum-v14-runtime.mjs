import { createServer } from 'vite'

const failures = []
const stats = {
  activeUnits: 0,
  reviewedUnits: 0,
  foundationUnits: 0,
  lifeUnits: 0,
  depthPassed: 0,
  questions: 0,
  choice: 0,
  response: 0,
}

const bannedMissingMaterial = [
  /看到一張統計圖後/,
  /依圖表而異/,
  /依文本而異/,
  /答案依題目而異/,
  /根據下圖/,
  /依下圖/,
  /觀察下圖/,
  /請看下圖/,
  /如圖所示/,
  /依附圖/,
]

const server = await createServer({
  logLevel: 'error',
  server: { middlewareMode: true },
  appType: 'custom',
})

try {
  const plan = await server.ssrLoadModule('/src/curriculum-plan-v5.ts')
  const content = await server.ssrLoadModule('/src/curriculum-reviewed-content.ts')
  const depth = await server.ssrLoadModule('/src/curriculum-textbook-depth-v14.ts')

  for (let grade = 1; grade <= 12; grade += 1) {
    const routes = plan.getCurriculumRouteOptions(grade)
    for (const route of routes) {
      const track = plan.getCurriculumTrack(grade, route.subject, route.pathway)
      if (!track) {
        failures.push(`grade ${grade} route ${route.id}: active route cannot resolve track`)
        continue
      }
      for (const semester of track.semesters) {
        for (const unit of semester.units) {
          stats.activeUnits += 1
          const strict = content.getStrictReviewedUnitContent(unit.id)
          if (strict) {
            stats.reviewedUnits += 1
            continue
          }

          stats.foundationUnits += 1
          const rendered = content.getCurriculumUnitContent(unit.id)
          if (!rendered) {
            failures.push(`${unit.id}: no runtime content`)
            continue
          }
          if (rendered.reviewStatus !== 'foundation') failures.push(`${unit.id}: Foundation unit self-promoted to ${rendered.reviewStatus}`)

          const report = depth.auditTextbookDepthV14(rendered)
          if (!report.passed) failures.push(`${unit.id}: depth gate failed: ${report.reasons.join(' | ')}`)
          else stats.depthPassed += 1

          const conceptTitles = rendered.concepts.map((item) => item.title.trim())
          if (new Set(conceptTitles).size !== conceptTitles.length) failures.push(`${unit.id}: duplicate concept titles`)
          const exampleTitles = rendered.workedExamples.map((item) => item.title.trim())
          if (new Set(exampleTitles).size !== exampleTitles.length) failures.push(`${unit.id}: duplicate worked example titles`)

          const isLife = unit.id.includes('-life-')
          if (isLife) {
            stats.lifeUnits += 1
            if (!rendered.researchBasis.some((item) => item.includes('生活課程課程綱要'))) failures.push(`${unit.id}: Life Curriculum missing official Life syllabus basis`)
            if (!conceptTitles.includes('常見迷思：我覺得就是我觀察到的事實')) failures.push(`${unit.id}: Life-specific observation misconception missing`)
            if (!conceptTitles.includes('常見迷思：合作就是大家一起做，不需要分工和比較')) failures.push(`${unit.id}: Life-specific collaboration misconception missing`)
            if (conceptTitles.some((title) => title === '常見迷思：科學模型就是實物本身' || /^常見迷思：觀察到/.test(title))) failures.push(`${unit.id}: generic science misconception leaked into Life Curriculum`)
            if (!exampleTitles.includes('錯誤診斷：把「我覺得」改成可以比較的觀察')) failures.push(`${unit.id}: Life-specific error clinic missing`)
            if (!exampleTitles.includes('轉移示範：把探究方法帶到新的生活問題')) failures.push(`${unit.id}: Life-specific transfer example missing`)
            if (exampleTitles.includes('錯誤診斷：把觀察和因果分開') || exampleTitles.includes('轉移示範：用同一模型預測新的觀察')) failures.push(`${unit.id}: generic science worked example leaked into Life Curriculum`)
          }

          const ids = new Set()
          const prompts = new Set()
          for (const question of rendered.questions) {
            stats.questions += 1
            const normalizedPrompt = question.prompt.replace(/\s+/g, ' ').trim().toLowerCase()
            if (!question.id?.trim()) failures.push(`${unit.id}: question without id`)
            if (ids.has(question.id)) failures.push(`${unit.id}: duplicate question id ${question.id}`)
            ids.add(question.id)
            if (normalizedPrompt.length < 8) failures.push(`${unit.id}/${question.id}: prompt too short`)
            if (prompts.has(normalizedPrompt)) failures.push(`${unit.id}: duplicate prompt ${question.prompt}`)
            prompts.add(normalizedPrompt)
            if (!question.explanation?.trim()) failures.push(`${unit.id}/${question.id}: missing explanation`)

            const combined = `${question.context ?? ''} ${question.prompt} ${question.explanation}`
            for (const pattern of bannedMissingMaterial) {
              if (pattern.test(combined)) failures.push(`${unit.id}/${question.id}: missing-material placeholder ${pattern}`)
            }

            if (question.kind === 'choice') {
              stats.choice += 1
              if (question.options.length < 4) failures.push(`${unit.id}/${question.id}: fewer than 4 options`)
              if (new Set(question.options.map((item) => item.trim())).size !== question.options.length) failures.push(`${unit.id}/${question.id}: duplicate options`)
              if (!Number.isInteger(question.correctIndex) || question.correctIndex < 0 || question.correctIndex >= question.options.length) failures.push(`${unit.id}/${question.id}: invalid correctIndex`)
              const feedback = question.optionFeedback
              if (feedback && feedback.length !== question.options.length) failures.push(`${unit.id}/${question.id}: optionFeedback length mismatch`)
            } else {
              stats.response += 1
              if (!question.sampleAnswer?.trim()) failures.push(`${unit.id}/${question.id}: response missing sample answer`)
            }
          }

          if (!rendered.researchBasis.some((item) => item.includes('國家教育研究院'))) failures.push(`${unit.id}: missing NAER research basis`)
          if (!rendered.questions.some((question) => question.kind === 'response' && Array.isArray(question.rubric) && question.rubric.length >= 3)) failures.push(`${unit.id}: no rubric-backed response question`)
          if (!rendered.questions.some((question) => question.id.includes('v14-transfer'))) failures.push(`${unit.id}: no V14 transfer question`)
          if (!rendered.workedExamples.some((item) => /錯誤診斷|Error clinic/.test(item.title))) failures.push(`${unit.id}: no misconception/error-clinic worked example`)
          if (!rendered.workedExamples.some((item) => /轉移示範|Transfer example/.test(item.title))) failures.push(`${unit.id}: no transfer worked example`)
        }
      }
    }
  }
} finally {
  await server.close()
}

if (stats.activeUnits !== 453) failures.push(`active runtime units ${stats.activeUnits} != 453`)
if (stats.foundationUnits !== 420) failures.push(`runtime Foundation units ${stats.foundationUnits} != 420`)
if (stats.depthPassed !== 420) failures.push(`V14 depth-passed Foundation units ${stats.depthPassed} != 420`)
if (stats.reviewedUnits !== 33) failures.push(`reviewed/scope units ${stats.reviewedUnits} != 33`)
if (stats.lifeUnits !== 12) failures.push(`Life Curriculum runtime units ${stats.lifeUnits} != 12`)

if (failures.length) {
  console.error('[curriculum-v14-runtime] FAILED')
  for (const failure of failures.slice(0, 120)) console.error(`- ${failure}`)
  if (failures.length > 120) console.error(`- ... ${failures.length - 120} more failures`)
  console.error(JSON.stringify(stats, null, 2))
  process.exit(1)
}

console.log('[curriculum-v14-runtime] all 453 active units resolved at runtime')
console.log('[curriculum-v14-runtime] all 420 Foundation units passed V14 depth + uniqueness + self-contained-question gates')
console.log('[curriculum-v14-runtime] all 12 Life Curriculum units use integrated Life-specific misconceptions/examples/questions')
console.log(JSON.stringify(stats, null, 2))
