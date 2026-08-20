import { createServer } from 'vite'
const server = await createServer({ logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })
const groups = { math: [], english: [], social: [] }
try {
  const plan = await server.ssrLoadModule('/src/curriculum-plan-v5.ts')
  const runtime = await server.ssrLoadModule('/src/curriculum-textbook-v20-runtime.ts')
  for (let grade = 1; grade <= 12; grade += 1) for (const route of plan.getCurriculumRouteOptions(grade)) {
    const track = plan.getCurriculumTrack(grade, route.subject, route.pathway)
    if (!track) continue
    for (const semester of track.semesters) for (const unit of semester.units) {
      const content = runtime.getTextbookUnitContentV20(unit.id)
      if (!content) continue
      const text = content.workedExamples.map((x) => `${x.context} ${x.prompt} ${x.explanation}`).join(' ')
      if (/V20 第一輪保底題/.test(text)) groups.math.push(`${unit.id} | G${grade} | ${unit.title} | ${unit.focus}`)
      if (/fallback keeps the item tied|later human rewrite/.test(text)) groups.english.push(`${unit.id} | G${grade} | ${unit.title} | ${unit.focus}`)
      if (/社會科判讀要先確認來源、時間、空間尺度/.test(text) && /本單元/.test(text)) groups.social.push(`${unit.id} | G${grade} | ${unit.title} | ${unit.focus}`)
    }
  }
} finally { await server.close() }
for (const [subject, items] of Object.entries(groups)) {
  console.log(`[v20-fallbacks] ${subject} ${items.length}`)
  for (const item of items) console.log(`- ${item}`)
}
