import {
  getCurriculumRouteOptions,
  getCurriculumTrack,
  type CurriculumPathwayId,
  type CurriculumSubjectId,
} from '../src/curriculum-plan-v5'
import { getUnitAuditSnapshot } from '../src/curriculum-audit-registry'
import { inspectTextbookUnitV14 } from '../src/curriculum-textbook-v14-final'

type RouteSummary = {
  grade: number
  subject: CurriculumSubjectId
  pathway?: CurriculumPathwayId
  label: string
  units: number
  questions: number
  concepts: number
  workedExamples: number
}

function normalizedPrompt(value: string) {
  return value.toLowerCase().replace(/[\s，。！？；：,.!?;:'"「」『』（）()\-—]/g, '')
}

const failures: string[] = []
const routeSummaries: RouteSummary[] = []
const activeUnitIds = new Set<string>()
const promptOwners = new Map<string, Set<string>>()
let textbookReadyUnits = 0
let totalQuestions = 0
let totalConcepts = 0
let totalMisconceptions = 0
let totalVisuals = 0
let totalWorkedExamples = 0
let totalObjectives = 0
let totalVocabulary = 0
let totalRoutes = 0

for (let grade = 1; grade <= 12; grade += 1) {
  const routes = getCurriculumRouteOptions(grade)
  totalRoutes += routes.length
  for (const route of routes) {
    const track = getCurriculumTrack(grade, route.subject, route.pathway)
    if (!track) {
      failures.push(`grade ${grade} route ${route.id}: active route has no track`)
      continue
    }

    let routeUnits = 0
    let routeQuestions = 0
    let routeConcepts = 0
    let routeExamples = 0

    for (const semester of track.semesters) {
      for (const plannedUnit of semester.units) {
        routeUnits += 1
        if (activeUnitIds.has(plannedUnit.id)) failures.push(`${plannedUnit.id}: duplicate active unit id across routes`)
        activeUnitIds.add(plannedUnit.id)

        const inspected = inspectTextbookUnitV14(plannedUnit.id)
        if (!inspected.unit) {
          failures.push(`${plannedUnit.id}: V14 textbook content not generated`)
          continue
        }
        if (!inspected.validation.ready) failures.push(...inspected.validation.errors)
        else textbookReadyUnits += 1

        const auditSnapshot = getUnitAuditSnapshot({
          grade,
          subject: route.subject,
          pathway: route.pathway,
          unitId: plannedUnit.id,
          strictReviewed: true,
        })
        if (!auditSnapshot.textbookReady || auditSnapshot.tier !== 'textbook-ready') failures.push(`${plannedUnit.id}: audit registry did not promote a passing V14 unit`)
        if (!auditSnapshot.scopeChecked || !auditSnapshot.contentChecked || !auditSnapshot.questionsChecked) failures.push(`${plannedUnit.id}: textbook-ready audit flags incomplete`)

        const unit = inspected.unit
        routeQuestions += unit.questions.length
        routeConcepts += unit.concepts.length
        routeExamples += unit.workedExamples.length
        totalQuestions += unit.questions.length
        totalConcepts += unit.concepts.length
        totalMisconceptions += unit.misconceptions.length
        totalVisuals += unit.visuals.length
        totalWorkedExamples += unit.workedExamples.length
        totalObjectives += unit.objectives.length
        totalVocabulary += unit.vocabulary.length

        for (const source of unit.sourceRefs) {
          if (!source.url.includes('naer.edu.tw')) failures.push(`${plannedUnit.id}: source is not an official NAER reference: ${source.url}`)
        }

        for (const question of unit.questions) {
          const key = normalizedPrompt(question.prompt)
          const owners = promptOwners.get(key) ?? new Set<string>()
          owners.add(plannedUnit.id)
          promptOwners.set(key, owners)
        }
      }
    }

    routeSummaries.push({
      grade,
      subject: route.subject,
      pathway: route.pathway,
      label: route.labelZh,
      units: routeUnits,
      questions: routeQuestions,
      concepts: routeConcepts,
      workedExamples: routeExamples,
    })
  }
}

if (totalRoutes !== 75) failures.push(`active routes ${totalRoutes} !== 75`)
if (activeUnitIds.size !== 453) failures.push(`active units ${activeUnitIds.size} !== 453`)
if (textbookReadyUnits !== activeUnitIds.size) failures.push(`textbook-ready units ${textbookReadyUnits}/${activeUnitIds.size}`)

const overRepeatedPrompts = [...promptOwners.entries()]
  .filter(([, owners]) => owners.size > 8)
  .sort((a, b) => b[1].size - a[1].size)
if (overRepeatedPrompts.length) {
  for (const [prompt, owners] of overRepeatedPrompts.slice(0, 12)) failures.push(`question prompt reused across ${owners.size} units: ${prompt.slice(0, 90)}`)
}

const minimums = {
  objectives: activeUnitIds.size * 5,
  concepts: activeUnitIds.size * 6,
  misconceptions: activeUnitIds.size * 4,
  visuals: activeUnitIds.size * 3,
  workedExamples: activeUnitIds.size * 3,
  questions: activeUnitIds.size * 15,
  vocabulary: activeUnitIds.size * 6,
}
if (totalObjectives < minimums.objectives) failures.push(`objectives ${totalObjectives} < ${minimums.objectives}`)
if (totalConcepts < minimums.concepts) failures.push(`concepts ${totalConcepts} < ${minimums.concepts}`)
if (totalMisconceptions < minimums.misconceptions) failures.push(`misconceptions ${totalMisconceptions} < ${minimums.misconceptions}`)
if (totalVisuals < minimums.visuals) failures.push(`visuals ${totalVisuals} < ${minimums.visuals}`)
if (totalWorkedExamples < minimums.workedExamples) failures.push(`worked examples ${totalWorkedExamples} < ${minimums.workedExamples}`)
if (totalQuestions < minimums.questions) failures.push(`questions ${totalQuestions} < ${minimums.questions}`)
if (totalVocabulary < minimums.vocabulary) failures.push(`vocabulary ${totalVocabulary} < ${minimums.vocabulary}`)

if (failures.length) {
  console.error('[textbook-v14-runtime-audit] FAILED')
  console.error(`[textbook-v14-runtime-audit] failures: ${failures.length}`)
  for (const failure of failures.slice(0, 120)) console.error(`- ${failure}`)
  if (failures.length > 120) console.error(`- ... ${failures.length - 120} more failures omitted`)
  process.exit(1)
}

const byStage = {
  elementary: routeSummaries.filter((item) => item.grade <= 6).reduce((sum, item) => sum + item.units, 0),
  junior: routeSummaries.filter((item) => item.grade >= 7 && item.grade <= 9).reduce((sum, item) => sum + item.units, 0),
  senior: routeSummaries.filter((item) => item.grade >= 10).reduce((sum, item) => sum + item.units, 0),
}

console.log('[textbook-v14-runtime-audit] PASS')
console.log(JSON.stringify({
  activeRoutes: totalRoutes,
  activeUnits: activeUnitIds.size,
  textbookReadyUnits,
  byStage,
  objectives: totalObjectives,
  concepts: totalConcepts,
  misconceptions: totalMisconceptions,
  structuredVisuals: totalVisuals,
  vocabulary: totalVocabulary,
  workedExamples: totalWorkedExamples,
  questions: totalQuestions,
  overRepeatedPrompts: overRepeatedPrompts.length,
}, null, 2))
