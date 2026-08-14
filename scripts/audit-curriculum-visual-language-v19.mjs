import { readFile } from 'node:fs/promises'
import { createServer } from 'vite'

const server = await createServer({ logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })
const findings = []
const stats = { activeUnits: 0, bySubject: {}, visualFirstPages: 0, subjectVisualSystems: 5 }

try {
  const plan = await server.ssrLoadModule('/src/curriculum-plan-v5.ts')
  const reader = await readFile(new URL('../src/components/CurriculumCourseAppV17.tsx', import.meta.url), 'utf8')
  const visual = await readFile(new URL('../src/components/CurriculumSubjectVisualV19.tsx', import.meta.url), 'utf8')
  const css = await readFile(new URL('../src/curriculum-course-v19.css', import.meta.url), 'utf8')

  const requiredReaderTokens = [
    'CurriculumLearningVisualV19',
    'CurriculumPedagogyVisualV19',
    'curriculum-course-v19.css',
    'v19-visual-first',
    'curriculum-v19-details',
    'curriculum-v19-model-steps',
  ]
  for (const token of requiredReaderTokens) if (!reader.includes(token)) findings.push(`reader missing ${token}`)

  const requiredVisualTokens = [
    "subject === 'chinese'",
    "subject === 'english'",
    "subject === 'math'",
    "subject === 'science'",
    'ChineseDiscourseVisual',
    'EnglishSceneVisual',
    'MathRelationVisual',
    'ScienceEvidenceVisual',
    'SocialLensVisual',
    'chinese-discourse-map',
    'english-dialogue-pattern',
  ]
  for (const token of requiredVisualTokens) if (!visual.includes(token)) findings.push(`visual system missing ${token}`)

  const requiredCssTokens = [
    '.v19-chinese-page',
    '.v19-dialogue-stage',
    '.v19-science-stage',
    '.v19-social-canvas',
    '.curriculum-v19-details',
    '.curriculum-v14-card.visual .curriculum-v14-visual-grid article p { display:none;',
    '.curriculum-v19-model-steps',
  ]
  for (const token of requiredCssTokens) if (!css.replace(/\s+/g, ' ').includes(token.replace(/\s+/g, ' '))) findings.push(`visual-first CSS missing ${token}`)

  for (let grade = 1; grade <= 12; grade += 1) {
    for (const route of plan.getCurriculumRouteOptions(grade)) {
      const track = plan.getCurriculumTrack(grade, route.subject, route.pathway)
      if (!track) continue
      for (const semester of track.semesters) {
        for (const unit of semester.units) {
          stats.activeUnits += 1
          stats.bySubject[route.subject] = (stats.bySubject[route.subject] ?? 0) + 1
        }
      }
    }
  }

  stats.visualFirstPages = (reader.match(/v19-visual-first/g) ?? []).length
} finally {
  await server.close()
}

console.log('[curriculum-visual-language-v19] subject visual-language audit')
console.log(JSON.stringify(stats, null, 2))
for (const finding of findings) console.log(`- ${finding}`)

const subjects = ['chinese', 'english', 'math', 'science', 'social']
if (
  stats.activeUnits !== 453 ||
  subjects.some((subject) => !stats.bySubject[subject]) ||
  stats.visualFirstPages < 4 ||
  findings.length
) {
  console.error('[curriculum-visual-language-v19] FAILED: learner pages are not consistently visual-first by subject')
  process.exit(1)
}
console.log('[curriculum-visual-language-v19] PASSED: all five subjects have explicit visual languages and teaching pages are visual-first')
