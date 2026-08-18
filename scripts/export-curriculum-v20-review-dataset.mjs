import { writeFile } from 'node:fs/promises'
import { createServer } from 'vite'

const server = await createServer({ logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })
const rows = []

try {
  const plan = await server.ssrLoadModule('/src/curriculum-plan-v5.ts')
  const final = await server.ssrLoadModule('/src/curriculum-textbook-v20-final.ts')
  const reviewed = await server.ssrLoadModule('/src/curriculum-reviewed-content.ts')
  const registry = await server.ssrLoadModule('/src/curriculum-audit-registry.ts')

  for (let grade = 1; grade <= 12; grade += 1) {
    for (const route of plan.getCurriculumRouteOptions(grade)) {
      const track = plan.getCurriculumTrack(grade, route.subject, route.pathway)
      if (!track) continue
      for (const semester of track.semesters) {
        for (let unitIndex = 0; unitIndex < semester.units.length; unitIndex += 1) {
          const unit = semester.units[unitIndex]
          const content = final.getTextbookUnitContentV20Final(unit.id)
          const strict = Boolean(reviewed.getStrictReviewedUnitContent(unit.id))
          const audit = registry.getUnitAuditSnapshot({ grade, subject: route.subject, pathway: route.pathway, unitId: unit.id, strictReviewed: strict })
          rows.push({
            grade,
            semester: semester.semester,
            subject: route.subject,
            pathway: route.pathway ?? null,
            unitIndex,
            unit: { id: unit.id, title: unit.title, focus: unit.focus },
            historicalStrictReviewed: strict,
            historicalAudit: audit,
            trackPolicy: registry.getTrackPolicy(grade, route.subject, route.pathway),
            reviewEvidence: content?.v20ReviewEvidence ?? null,
            content,
          })
        }
      }
    }
  }
} finally {
  await server.close()
}

if (rows.length !== 453) {
  console.error(`[v20-export] expected 453 rows, got ${rows.length}`)
  process.exit(1)
}
await writeFile('v20-review-export.json', JSON.stringify({ version: 'v20-final-review-export-2026-08-18', rows }, null, 2), 'utf8')
console.log(`[v20-export] wrote ${rows.length} learner-facing V20 final unit records to v20-review-export.json`)
