import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const server = await createServer({ logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })
const failures = []
const familyBySubject = new Map()
const signatures = new Map()
let rendered = 0

const norm = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()
const plain = (html) => norm(String(html).replace(/<[^>]+>/g, ' '))
const focusTokens = (value) => String(value ?? '')
  .split(/[。；，、]|以及|並且|並|與|和|／|\/+|\s+/)
  .map((item) => item.trim())
  .filter((item) => item.length >= 2)

try {
  const plan = await server.ssrLoadModule('/src/curriculum-plan-v5.ts')
  const final = await server.ssrLoadModule('/src/curriculum-textbook-v20-reviewed-final.ts')
  const visualModule = await server.ssrLoadModule('/src/components/CurriculumSubjectVisualV19.tsx')
  const LearningVisual = visualModule.CurriculumLearningVisualV19

  for (let grade = 1; grade <= 12; grade += 1) {
    for (const route of plan.getCurriculumRouteOptions(grade)) {
      const track = plan.getCurriculumTrack(grade, route.subject, route.pathway)
      if (!track) continue
      for (const semester of track.semesters) {
        for (const unit of semester.units) {
          const content = final.getTextbookUnitContentV20ReviewedFinal(unit.id)
          if (!content) {
            failures.push(`${unit.id}: missing V20 learner content`)
            continue
          }
          const html = renderToStaticMarkup(React.createElement(LearningVisual, {
            subject: route.subject,
            unitTitle: unit.title,
            focus: unit.focus,
            title: unit.title,
            explanation: content.overview,
            example: content.objectives?.[0],
            mode: 'intro',
          }))
          rendered += 1
          const text = plain(html)
          const family = html.match(/data-v20-unit-visual="([^"]+)"/)?.[1]
          if (!family) failures.push(`${unit.id}: intro visual has no data-v20-unit-visual family`)
          else {
            if (!familyBySubject.has(route.subject)) familyBySubject.set(route.subject, new Set())
            familyBySubject.get(route.subject).add(family)
          }

          if (!text.includes(norm(unit.title))) failures.push(`${unit.id}: visual does not name the active unit`)
          const tokens = focusTokens(unit.focus)
          if (tokens.length && !tokens.some((token) => text.includes(token))) failures.push(`${unit.id}: visual does not carry a real focus token`)

          if (/已知\s+表示\s+關係\s+檢查/.test(text)) failures.push(`${unit.id}: legacy math 已知/表示/關係/檢查 shell leaked`)
          if (/觀察\s*\/\s*操作.*變因\s*\/\s*結構.*證據\s*\/\s*結論/.test(text)) failures.push(`${unit.id}: legacy science evidence-chain shell leaked`)
          if (/Listen\s*→\s*notice\s*→\s*say it again/i.test(text)) failures.push(`${unit.id}: legacy English fixed dialogue leaked`)
          if (/四個社會鏡頭/.test(text)) failures.push(`${unit.id}: legacy social four-lens shell leaked`)

          const signature = norm(html
            .replaceAll(unit.title, '<UNIT>')
            .replaceAll(unit.focus, '<FOCUS>')
            .replace(/data-v20-unit-visual="[^"]+"/g, 'data-v20-unit-visual="<FAMILY>"'))
          if (!signatures.has(signature)) signatures.set(signature, [])
          signatures.get(signature).push(unit.id)
        }
      }
    }
  }
} finally {
  await server.close()
}

const familyCounts = Object.fromEntries([...familyBySubject].map(([subject, values]) => [subject, values.size]))
const minimumFamilies = { chinese: 3, english: 4, math: 6, science: 6, social: 4 }
for (const [subject, minimum] of Object.entries(minimumFamilies)) {
  const actual = familyBySubject.get(subject)?.size ?? 0
  if (actual < minimum) failures.push(`${subject}: only ${actual} visual families; expected at least ${minimum}`)
}

const heavyReuse = [...signatures.entries()].filter(([, units]) => units.length >= 8)
if (heavyReuse.length) {
  for (const [, units] of heavyReuse.slice(0, 20)) failures.push(`generic rendered visual reused by ${units.length} units: ${units.slice(0, 12).join(', ')}`)
}

console.log('[curriculum-v20-visual-specificity]', JSON.stringify({ rendered, familyCounts, heavyReuseGroups: heavyReuse.length, failures: failures.length }, null, 2))
if (rendered !== 453 || failures.length) {
  console.error('[curriculum-v20-visual-specificity] FAILED')
  for (const failure of failures.slice(0, 180)) console.error(`- ${failure}`)
  process.exit(1)
}
console.log('[curriculum-v20-visual-specificity] PASS: all 453 intro visuals carry unit-specific title/focus evidence, legacy fixed shells are absent, and each subject uses multiple visual families.')
