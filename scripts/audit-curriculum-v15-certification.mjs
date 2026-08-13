import { createServer } from 'vite'

const failures = []
const stats = { candidates: 0, math: 0, science: 0, passed: 0, questions: 0, mediaMatched: 0 }
const server = await createServer({ logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })

function normalize(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim().toLowerCase()
}

try {
  const content = await server.ssrLoadModule('/src/curriculum-reviewed-content.ts')
  const mathScope = await server.ssrLoadModule('/src/curriculum-official-scope-math7.ts')
  const scienceScope = await server.ssrLoadModule('/src/curriculum-official-scope-science7.ts')
  const media = await server.ssrLoadModule('/src/curriculum-vetted-media.ts')

  const candidates = [
    ...mathScope.GRADE7_MATH_OFFICIAL_SCOPE.map((item) => ({ ...item, subject: 'math' })),
    ...scienceScope.SCIENCE7_STAGE_IV_SCOPE.map((item) => ({ ...item, subject: 'science' })),
  ]

  const uniqueIds = new Set(candidates.map((item) => item.unitId))
  if (uniqueIds.size !== 15) failures.push(`expected 15 unique certification candidates, got ${uniqueIds.size}`)

  for (const candidate of candidates) {
    stats.candidates += 1
    stats[candidate.subject] += 1
    const unit = content.getStrictReviewedUnitContent(candidate.unitId)
    if (!unit) {
      failures.push(`${candidate.unitId}: strict reviewed content missing`)
      continue
    }

    const localFailures = []
    const misconceptions = unit.concepts.filter((item) => /常見迷思|Common misconception/.test(item.title))
    if (unit.concepts.length < 6) localFailures.push(`concepts ${unit.concepts.length} < 6`)
    if (misconceptions.length < 2) localFailures.push(`misconceptions ${misconceptions.length} < 2`)
    if (unit.workedExamples.length < 3) localFailures.push(`worked examples ${unit.workedExamples.length} < 3`)
    if (unit.questions.length < 12) localFailures.push(`questions ${unit.questions.length} < 12`)

    const choices = unit.questions.filter((question) => question.kind === 'choice')
    const responses = unit.questions.filter((question) => question.kind === 'response')
    if (choices.length < 6) localFailures.push(`choice questions ${choices.length} < 6`)
    if (responses.length < 2) localFailures.push(`response questions ${responses.length} < 2`)

    const ids = new Set()
    const prompts = new Set()
    let rubricCount = 0
    let feedbackCount = 0
    for (const question of unit.questions) {
      stats.questions += 1
      if (!question.id?.trim()) localFailures.push('question missing id')
      if (ids.has(question.id)) localFailures.push(`duplicate question id ${question.id}`)
      ids.add(question.id)
      const prompt = normalize(question.prompt)
      if (!prompt) localFailures.push(`${question.id}: empty prompt`)
      if (prompts.has(prompt)) localFailures.push(`${question.id}: duplicate prompt in unit`)
      prompts.add(prompt)
      if (!question.explanation?.trim()) localFailures.push(`${question.id}: missing explanation`)

      if (question.kind === 'choice') {
        if (question.options.length < 4) localFailures.push(`${question.id}: fewer than 4 options`)
        if (new Set(question.options.map(normalize)).size !== question.options.length) localFailures.push(`${question.id}: duplicate options`)
        if (!Number.isInteger(question.correctIndex) || question.correctIndex < 0 || question.correctIndex >= question.options.length) localFailures.push(`${question.id}: invalid correctIndex`)
        if (Array.isArray(question.optionFeedback) && question.optionFeedback.length === question.options.length) feedbackCount += 1
      } else {
        if (!question.sampleAnswer?.trim()) localFailures.push(`${question.id}: missing sample answer`)
        if (Array.isArray(question.rubric) && question.rubric.length >= 3) rubricCount += 1
      }
    }

    if (rubricCount < 1) localFailures.push('no rubric-backed response question')
    if (feedbackCount < 1) localFailures.push('no choice question with per-option diagnostic feedback')

    for (const example of unit.workedExamples) {
      if (!example.context?.trim()) localFailures.push(`worked example ${example.title}: missing context`)
      if (!example.prompt?.trim()) localFailures.push(`worked example ${example.title}: missing prompt`)
      if (!Array.isArray(example.steps) || example.steps.length < 3) localFailures.push(`worked example ${example.title}: fewer than 3 steps`)
      if (!example.answer?.trim()) localFailures.push(`worked example ${example.title}: missing answer`)
      if (!example.explanation?.trim()) localFailures.push(`worked example ${example.title}: missing explanation`)
    }

    const scopeCodes = Array.isArray(candidate.items) ? candidate.items.map((item) => item.code).filter(Boolean) : []
    if (!scopeCodes.length) localFailures.push('official scope mapping contains no codes')
    if (!unit.researchBasis.some((item) => /國教院|國家教育研究院/.test(item))) localFailures.push('research basis does not identify NAER review')

    if (candidate.subject === 'science') {
      const combined = [
        unit.overview,
        ...unit.concepts.flatMap((item) => [item.title, item.explanation, item.example ?? '']),
        ...unit.workedExamples.flatMap((item) => [item.title, item.context, item.prompt, item.explanation]),
      ].join(' ')
      const matched = media.findVettedCurriculumMedia('science', combined)
      if (!matched) localFailures.push('no vetted instructional media matched this science unit')
      else {
        stats.mediaMatched += 1
        if (!matched.sourcePage || !matched.license || !matched.alt || !matched.attribution) localFailures.push(`media ${matched.id}: incomplete source/license/accessibility metadata`)
      }
    }

    if (localFailures.length) {
      for (const reason of localFailures) failures.push(`${candidate.unitId}: ${reason}`)
    } else {
      stats.passed += 1
    }
  }
} finally {
  await server.close()
}

if (stats.math !== 9) failures.push(`math candidates ${stats.math} != 9`)
if (stats.science !== 6) failures.push(`science candidates ${stats.science} != 6`)

if (failures.length) {
  console.error('[curriculum-v15-certification] FAILED')
  for (const failure of failures) console.error(`- ${failure}`)
  console.error(JSON.stringify(stats, null, 2))
  process.exit(1)
}

console.log('[curriculum-v15-certification] 15/15 Grade 7 math/science candidates passed strict certification gates')
console.log(JSON.stringify(stats, null, 2))
