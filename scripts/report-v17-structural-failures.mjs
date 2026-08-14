import { createServer } from 'vite'

const server = await createServer({ logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })
const failures = []

try {
  const plan = await server.ssrLoadModule('/src/curriculum-plan-v5.ts')
  const pedagogy = await server.ssrLoadModule('/src/curriculum-pedagogy-v17.ts')
  for (let grade = 1; grade <= 12; grade += 1) {
    for (const route of plan.getCurriculumRouteOptions(grade)) {
      const track = plan.getCurriculumTrack(grade, route.subject, route.pathway)
      if (!track) continue
      for (const semester of track.semesters) {
        for (const unit of semester.units) {
          const inspected = pedagogy.inspectTextbookUnitV17(unit.id)
          if (!inspected.unit || !inspected.validation.ready) {
            failures.push({
              unitId: unit.id,
              title: unit.title,
              errors: inspected.validation?.errors ?? ['unit missing'],
              questions: inspected.unit?.questions?.length ?? 0,
            })
          }
        }
      }
    }
  }
} finally {
  await server.close()
}

console.log(`[v17-structural-report] failures=${failures.length}`)
for (const failure of failures) console.log(`- ${failure.unitId} ${failure.title} questions=${failure.questions}: ${failure.errors.join(' | ')}`)
