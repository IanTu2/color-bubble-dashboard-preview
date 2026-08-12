import { getCurriculumRouteOptions, getCurriculumTrack } from '../src/curriculum-plan-v5'
import { getPathwayKnowledgeProfileV14 } from '../src/curriculum-pathway-knowledge-v14'
import { inspectTextbookUnitV14 } from '../src/curriculum-textbook-v14-final'

const failures: string[] = []
let pathwayUnits = 0
let matchedKnowledgeRules = 0
let unitsWithMultipleRules = 0
const byPathway = new Map<string, { units: number; rules: number }>()

for (let grade = 10; grade <= 12; grade += 1) {
  for (const route of getCurriculumRouteOptions(grade)) {
    if (!route.pathway || route.pathway === 'life') continue
    const track = getCurriculumTrack(grade, route.subject, route.pathway)
    if (!track) {
      failures.push(`grade ${grade} ${route.id}: route missing track`)
      continue
    }
    for (const semester of track.semesters) {
      for (const plannedUnit of semester.units) {
        pathwayUnits += 1
        const profile = getPathwayKnowledgeProfileV14({
          grade,
          subject: route.subject,
          pathway: route.pathway,
          title: plannedUnit.title,
          focus: plannedUnit.focus,
        })
        const stat = byPathway.get(route.pathway) ?? { units: 0, rules: 0 }
        stat.units += 1
        stat.rules += profile.matchedRules.length
        byPathway.set(route.pathway, stat)
        matchedKnowledgeRules += profile.matchedRules.length
        if (profile.matchedRules.length >= 2) unitsWithMultipleRules += 1
        if (!profile.matchedRules.length) failures.push(`${plannedUnit.id}: no subject-knowledge rule matched ${plannedUnit.title} / ${plannedUnit.focus}`)
        if (!profile.concepts.length) failures.push(`${plannedUnit.id}: semantic profile produced no concepts`)

        const inspected = inspectTextbookUnitV14(plannedUnit.id)
        if (!inspected.unit || !inspected.validation.ready) {
          failures.push(`${plannedUnit.id}: finalized textbook unit unavailable during semantic audit`)
          continue
        }
        const textbook = inspected.unit
        const textbookTitles = new Set(textbook.concepts.map((item) => item.title))
        const missingProfileConcepts = profile.concepts.filter((item) => !textbookTitles.has(item.title))
        if (missingProfileConcepts.length) failures.push(`${plannedUnit.id}: ${missingProfileConcepts.length} pathway knowledge concepts were not carried into the textbook`)

        const topicConcepts = profile.concepts.filter((item) => !item.title.includes('核心模型與證據'))
        const referenced = topicConcepts.filter((concept) => textbook.questions.some((question) => question.prompt.includes(concept.title)))
        const requiredReferences = Math.min(2, topicConcepts.length)
        if (referenced.length < requiredReferences) failures.push(`${plannedUnit.id}: only ${referenced.length}/${requiredReferences} specific knowledge concepts appear in question prompts`)

        const genericConcepts = textbook.concepts.filter((item) => /核心模型與證據|核心觀念｜關係/.test(item.title))
        if (genericConcepts.length > 2) failures.push(`${plannedUnit.id}: too many generic concepts (${genericConcepts.length}) after pathway enrichment`)
      }
    }
  }
}

if (pathwayUnits !== 150) failures.push(`senior-high pathway unit count ${pathwayUnits} !== 150`)
if (matchedKnowledgeRules < pathwayUnits) failures.push(`knowledge-rule matches ${matchedKnowledgeRules} < pathway units ${pathwayUnits}`)

if (failures.length) {
  console.error('[textbook-v14-semantic-audit] FAILED')
  console.error(`[textbook-v14-semantic-audit] failures: ${failures.length}`)
  for (const failure of failures.slice(0, 100)) console.error(`- ${failure}`)
  if (failures.length > 100) console.error(`- ... ${failures.length - 100} more failures omitted`)
  process.exit(1)
}

console.log('[textbook-v14-semantic-audit] PASS')
console.log(JSON.stringify({
  seniorHighPathwayUnits: pathwayUnits,
  matchedKnowledgeRules,
  unitsWithMultipleRules,
  byPathway: Object.fromEntries([...byPathway.entries()].sort(([a], [b]) => a.localeCompare(b))),
}, null, 2))
