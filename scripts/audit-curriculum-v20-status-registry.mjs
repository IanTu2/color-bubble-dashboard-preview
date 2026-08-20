import { createServer } from 'vite'

const server = await createServer({ logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })
const failures = []
try {
  const plan = await server.ssrLoadModule('/src/curriculum-plan-v5.ts')
  const status = await server.ssrLoadModule('/src/curriculum-v20-review-status.ts')
  const final = await server.ssrLoadModule('/src/curriculum-textbook-v20-reviewed-final.ts')

  const activeIds = []
  for (let grade = 1; grade <= 12; grade += 1) {
    for (const route of plan.getCurriculumRouteOptions(grade)) {
      const track = plan.getCurriculumTrack(grade, route.subject, route.pathway)
      if (!track) continue
      for (const semester of track.semesters) for (const unit of semester.units) activeIds.push(unit.id)
    }
  }
  const uniqueActive = [...new Set(activeIds)].sort()
  const internalReady = [...(status.V20_INTERNAL_READY_UNITS ?? [])].sort()
  const humanVerified = [...(status.V20_HUMAN_VERIFIED_UNITS ?? [])].sort()
  const certification = status.V20_INTERNAL_REVIEW_CERTIFICATION

  if (uniqueActive.length !== 453) failures.push(`active unit count is ${uniqueActive.length}, expected 453`)
  if (internalReady.length !== 453) failures.push(`internal-ready count is ${internalReady.length}, expected 453`)
  if (humanVerified.length !== 0) failures.push(`human-verified must remain 0 without independent human review; got ${humanVerified.length}`)
  if (uniqueActive.join('|') !== internalReady.join('|')) failures.push('internal-ready set does not exactly match frozen active curriculum snapshot')
  if (!certification || certification.p0 !== 0 || certification.p1 !== 0) failures.push('certification must record P0=0 and P1=0')
  if (!certification || certification.weightedScore < 90) failures.push(`weighted score below 90: ${certification?.weightedScore}`)
  for (const [dimension, score] of Object.entries(certification?.dimensionScores ?? {})) if (score < 3) failures.push(`${dimension} score ${score} < 3`)
  if (Object.keys(certification?.dimensionScores ?? {}).length !== 8) failures.push('certification must contain all eight V20 dimension scores')

  let officialLinked = 0
  let platformExtensions = 0
  for (const unitId of uniqueActive) {
    const content = final.getTextbookUnitContentV20ReviewedFinal(unitId)
    const evidence = content?.v20ReviewEvidence
    if (!content) { failures.push(`${unitId}: missing final learner content`); continue }
    if (!evidence) { failures.push(`${unitId}: missing V20 review evidence`); continue }
    if (!evidence.scope?.sourceUrl || !evidence.scope?.mappingNote) failures.push(`${unitId}: missing curriculum-source mapping evidence`)
    if (evidence.scope?.mode === 'official-source-linked') officialLinked += 1
    else if (evidence.scope?.mode === 'platform-extension') platformExtensions += 1
    else failures.push(`${unitId}: unknown scope mode ${evidence.scope?.mode}`)
    if (!evidence.prerequisite?.source || !evidence.prerequisite?.check || !evidence.prerequisite?.bridge) failures.push(`${unitId}: incomplete prerequisite source/check/bridge`)
  }
  if (officialLinked !== 441) failures.push(`official-source-linked count ${officialLinked}, expected 441`)
  if (platformExtensions !== 12) failures.push(`platform-extension count ${platformExtensions}, expected 12`)

  console.log('[curriculum-v20-status]', JSON.stringify({
    active: uniqueActive.length,
    internalReady: internalReady.length,
    humanVerified: humanVerified.length,
    officialLinked,
    platformExtensions,
    weightedScore: certification?.weightedScore,
    dimensionScores: certification?.dimensionScores,
    failures: failures.length,
  }, null, 2))

  if (failures.length) {
    console.error('[curriculum-v20-status] FAILED')
    for (const failure of failures.slice(0, 160)) console.error(`- ${failure}`)
    process.exitCode = 1
  } else {
    console.log('[curriculum-v20-status] PASS: 453/453 units match the frozen V20 internal-ready snapshot; 0 units are claimed human-verified.')
  }
} finally {
  await server.close()
}
