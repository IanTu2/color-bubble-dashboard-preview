import { readFile } from 'node:fs/promises'
import { createServer } from 'vite'

const server = await createServer({ logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })
const failures = []
let walked = 0
let questions = 0
let choiceQuestions = 0
let responseQuestions = 0
const norm = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()
const forbidden = /V20|fallback|待人工|編輯流程|審稿|placeholder/i

try {
  const plan = await server.ssrLoadModule('/src/curriculum-plan-v5.ts')
  const final = await server.ssrLoadModule('/src/curriculum-textbook-v20-reviewed-final.ts')

  for (let grade = 1; grade <= 12; grade += 1) {
    for (const route of plan.getCurriculumRouteOptions(grade)) {
      const track = plan.getCurriculumTrack(grade, route.subject, route.pathway)
      if (!track) continue
      for (const semester of track.semesters) {
        for (const unit of semester.units) {
          const content = final.getTextbookUnitContentV20ReviewedFinal(unit.id)
          if (!content) {
            failures.push(`${unit.id}: missing learner content`)
            continue
          }
          walked += 1
          const pageText = norm(`${content.overview} ${(content.objectives ?? []).join(' ')} ${(content.concepts ?? []).map((c) => `${c.title} ${c.explanation} ${c.example}`).join(' ')} ${(content.visuals ?? []).map((v) => `${v.title} ${v.caption} ${(v.items ?? []).map((i) => `${i.label} ${i.detail}`).join(' ')}`).join(' ')} ${(content.workedExamples ?? []).map((e) => `${e.title} ${e.context} ${e.prompt} ${(e.steps ?? []).join(' ')} ${e.answer} ${e.explanation}`).join(' ')} ${(content.questions ?? []).map((q) => `${q.context} ${q.prompt} ${q.kind === 'choice' ? (q.options ?? []).join(' ') : q.sampleAnswer} ${q.explanation}`).join(' ')}`)

          if (!norm(content.overview)) failures.push(`${unit.id}: empty overview`)
          if ((content.objectives ?? []).length < 2) failures.push(`${unit.id}: insufficient objectives`)
          if (!(content.concepts ?? []).length) failures.push(`${unit.id}: missing concepts`)
          if (!(content.visuals ?? []).length) failures.push(`${unit.id}: missing visual learning representation`)
          if ((content.workedExamples ?? []).length < 4) failures.push(`${unit.id}: fewer than 4 worked examples`)
          if ((content.questions ?? []).length < 15) failures.push(`${unit.id}: fewer than 15 learner questions`)
          if (forbidden.test(pageText)) failures.push(`${unit.id}: internal/editorial wording leaked into learner pages`)

          for (const question of content.questions ?? []) {
            questions += 1
            if (!norm(question.context) || !norm(question.prompt) || !norm(question.explanation)) failures.push(`${unit.id}/${question.id}: incomplete question presentation`)
            if (question.kind === 'choice') {
              choiceQuestions += 1
              if ((question.options ?? []).length !== 4) failures.push(`${unit.id}/${question.id}: choice does not have 4 options`)
              if (!Number.isInteger(question.correctIndex) || question.correctIndex < 0 || question.correctIndex > 3) failures.push(`${unit.id}/${question.id}: invalid correctIndex`)
              if ((question.optionFeedback ?? []).length !== 4) failures.push(`${unit.id}/${question.id}: missing per-option feedback`)
            } else {
              responseQuestions += 1
              if (!norm(question.sampleAnswer)) failures.push(`${unit.id}/${question.id}: missing sample answer`)
              if ((question.rubric ?? []).length < 3) failures.push(`${unit.id}/${question.id}: response rubric incomplete`)
            }
          }
        }
      }
    }
  }

  // Responsive behavior is composed across the V19 course styles and the final V18
  // user-experience overrides, which are loaded after the course layer. Check the
  // actual stylesheet set instead of requiring every guard to live in one V19 file.
  const css = [
    await readFile('src/curriculum-course-v19.css', 'utf8'),
    await readFile('src/curriculum-course-v19-fixes.css', 'utf8'),
    await readFile('src/user-experience-audit-v18.css', 'utf8'),
  ].join('\n')
  if (!/@media\s*\(/.test(css)) failures.push('responsive CSS: no media-query coverage')
  if (!/min-width:\s*0\s*!important|min-width:\s*0\s*;/.test(css)) failures.push('responsive CSS: missing min-width:0 overflow protection in loaded course/UX styles')
  if (!/grid-template-columns:\s*46px\s+minmax\(0,\s*1fr\)\s+46px/.test(css)) failures.push('responsive CSS: English dialogue three-column regression protection missing')
} finally {
  await server.close()
}

console.log('[curriculum-v20-student-walkthrough]', JSON.stringify({ walked, questions, choiceQuestions, responseQuestions, failures: failures.length }, null, 2))
if (walked !== 453 || questions !== 6903 || failures.length) {
  console.error('[curriculum-v20-student-walkthrough] FAILED')
  for (const failure of failures.slice(0, 180)) console.error(`- ${failure}`)
  process.exit(1)
}
console.log('[curriculum-v20-student-walkthrough] PASS: all 453 learner units can be traversed through overview/objectives/concepts/visuals/examples/questions, with response/choice feedback checks and responsive-course CSS regression guards for desktop/mobile layouts.')
