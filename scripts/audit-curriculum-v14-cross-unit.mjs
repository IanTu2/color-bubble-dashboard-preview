import { createServer } from 'vite'

const failures = []
const duplicates = []
const server = await createServer({ logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })

function normalize(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim().toLowerCase()
}

try {
  const plan = await server.ssrLoadModule('/src/curriculum-plan-v5.ts')
  const content = await server.ssrLoadModule('/src/curriculum-reviewed-content.ts')

  for (let grade = 1; grade <= 12; grade += 1) {
    for (const route of plan.getCurriculumRouteOptions(grade)) {
      const track = plan.getCurriculumTrack(grade, route.subject, route.pathway)
      if (!track) continue
      const seen = new Map()
      for (const semester of track.semesters) {
        for (const unit of semester.units) {
          if (content.getStrictReviewedUnitContent(unit.id)) continue
          const rendered = content.getCurriculumUnitContent(unit.id)
          if (!rendered) continue
          for (const question of rendered.questions) {
            const extra = question
            // Student experience is the visible material plus prompt. Identical prompts are allowed
            // when the context/media/audio genuinely changes; exact same experience inside one route is not.
            const key = [
              normalize(question.context),
              normalize(extra.audioText),
              normalize(extra.mediaAssetId),
              normalize(question.prompt),
              question.kind === 'choice' ? question.options.map(normalize).join('|') : normalize(question.sampleAnswer),
            ].join(' :: ')
            const previous = seen.get(key)
            if (previous && previous.unitId !== unit.id) {
              duplicates.push({ route: `g${grade}-${route.id}`, first: previous, second: { unitId: unit.id, questionId: question.id, prompt: question.prompt } })
            } else {
              seen.set(key, { unitId: unit.id, questionId: question.id, prompt: question.prompt })
            }
          }
        }
      }
    }
  }
} finally {
  await server.close()
}

if (duplicates.length) {
  failures.push(`${duplicates.length} exact repeated student question experiences found across units in the same route`)
  console.error('[curriculum-v14-cross-unit] FAILED')
  for (const item of duplicates.slice(0, 80)) {
    console.error(`- ${item.route}: ${item.first.unitId}/${item.first.questionId} == ${item.second.unitId}/${item.second.questionId}: ${item.second.prompt}`)
  }
  if (duplicates.length > 80) console.error(`- ... ${duplicates.length - 80} more duplicates`)
  process.exit(1)
}

console.log('[curriculum-v14-cross-unit] no exact repeated student question experiences across Foundation units in the same route')
