import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const failures = []

const registry = read('src/curriculum-audit-registry.ts')
const plan = read('src/curriculum-plan-v5.ts')
const pathwayFoundation = read('src/curriculum-pathway-foundation-v13.ts')
const aggregator = read('src/curriculum-reviewed-content.ts')
const foundationV12 = read('src/curriculum-foundation-question-bank-v12.ts')
const textbookV14 = read('src/curriculum-textbook-v14.ts')
const pedagogyV17 = read('src/curriculum-pedagogy-v17.ts')
const v12 = read('src/components/CurriculumCourseAppV12.tsx')
const v8 = read('src/components/CurriculumCourseAppV8.tsx')
const v14 = read('src/components/CurriculumCourseAppV14.tsx')
const v17 = read('src/components/CurriculumCourseAppV17.tsx')
const activeExport = read('src/components/CurriculumCourseApp.tsx')
const drawer = read('src/components/SideDrawer.tsx')
const desktop = read('src/components/DesktopWorkspace.tsx')
const inventory = read('scripts/report-curriculum-audit.mjs')
const runtimeAudit = read('scripts/audit-curriculum-v14-runtime.mjs')
const certificationV15 = read('src/curriculum-textbook-certification-v15.ts')

for (const structure of ['integrated-life','platform-extension','discipline-split','path-selected','discipline-split-required','path-selection-required']) {
  if (!registry.includes(`'${structure}'`)) failures.push(`audit registry missing structural policy ${structure}`)
}
if (!registry.includes('const TEXTBOOK_READY_UNITS = new Set<string>([')) failures.push('V15 textbook-ready registry is not explicit')
if (!registry.includes('GRADE7_MATH_OFFICIAL_SCOPE.map') || !registry.includes('SCIENCE7_STAGE_IV_SCOPE.map')) failures.push('V15 registry must derive certified Grade 7 math/science IDs from official scope maps')
for (const token of ["pathway === 'life'",'isSciencePath(pathway)','isSocialPath(pathway)','isMathPath(pathway)','textbookBlocked: false']) {
  if (!registry.includes(token)) failures.push(`pathway-aware audit registry missing ${token}`)
}

for (const pathway of ['life','physics','chemistry','biology','earth-science','geography','history','civics','math-a','math-b','math-alpha','math-beta']) {
  if (!plan.includes(`'${pathway}'`)) failures.push(`route plan missing pathway ${pathway}`)
}
for (const pair of [
  ["pathwayRoute('science', 'life')", 'G1/2 integrated Life Curriculum'],
  ["pathwayRoute('math', 'math-a')", 'G11 Math A'],
  ["pathwayRoute('math', 'math-b')", 'G11 Math B'],
  ["pathwayRoute('math', 'math-alpha')", 'G12 Math 甲'],
  ["pathwayRoute('math', 'math-beta')", 'G12 Math 乙'],
  ["pathwayRoute('science', 'physics')", 'HS physics'],
  ["pathwayRoute('science', 'chemistry')", 'HS chemistry'],
  ["pathwayRoute('science', 'biology')", 'HS biology'],
  ["pathwayRoute('science', 'earth-science')", 'HS earth science'],
  ["pathwayRoute('social', 'geography')", 'HS geography'],
  ["pathwayRoute('social', 'history')", 'HS history'],
  ["pathwayRoute('social', 'civics')", 'HS civics'],
]) if (!plan.includes(pair[0])) failures.push(`student route missing ${pair[1]}`)
if (!plan.includes("if (grade >= 10 && (subject === 'science' || subject === 'social')) return true")) failures.push('legacy merged HS science/social base routes are not blocked')
if (!plan.includes("if (grade >= 11 && subject === 'math') return true")) failures.push('legacy common G11+ math base route is not blocked')
if (!drawer.includes('getCurriculumRouteOptions') || drawer.includes('查看五科課程')) failures.push('drawer does not use grade-specific routes')
if (!drawer.includes('校本／平台延伸')) failures.push('G1/2 English extension disclosure missing from drawer')
if (!desktop.includes('getCurriculumTrack(course.grade, course.subject, course.pathway)')) failures.push('persisted ambiguous course windows are not rejected')
if (!desktop.includes('getCurriculumCourseMeta')) failures.push('desktop titles do not preserve pathway identity')
if (!inventory.includes('activeTracks !== 75') || !inventory.includes('totalUnits !== 453') || !inventory.includes('structuralBlockerUnits = 0')) failures.push('active inventory assertions missing')
if (!inventory.includes('textbookReadyUnits !== 15') || !inventory.includes('scopeVerifiedUnits !== 0')) failures.push('V15 mutually exclusive promotion inventory assertions missing')

if (!pathwayFoundation.includes("reviewStatus: 'foundation'")) failures.push('pathway source content must remain identifiable as Foundation before learner-runtime enrichment')
if (!pathwayFoundation.includes('getPathwayFoundationUnitContent')) failures.push('pathway foundation builder missing')
if (!aggregator.includes('getPathwayFoundationUnitContent')) failures.push('pathway foundation is not wired into aggregator')
if (!aggregator.includes('upgradeFoundationUnitV12(foundation)')) failures.push('Foundation source must receive subject question upgrade')
for (const feature of ['optionFeedback','mediaAssetId','audioText','rubric']) {
  if (!aggregator.includes(feature)) failures.push(`aggregator no longer preserves ${feature}`)
  if (!foundationV12.includes(feature)) failures.push(`foundation question bank cannot produce ${feature}`)
  if (!v17.includes(feature)) failures.push(`active learner reader cannot consume ${feature}`)
}

if (!activeExport.includes("from './CurriculumCourseAppV17'")) failures.push('active formal-course export must keep the stable reader component entry')
if (!activeExport.includes('user-audit-v18')) failures.push('active V18 reader must remount when the course route changes')
if (!v8.includes("from './CurriculumCourseAppV12'")) failures.push('legacy vetted-media reader chain regressed')
for (const reader of [{ name: 'V12', text: v12 }, { name: 'V14', text: v14 }, { name: 'V18-active', text: v17 }]) {
  for (const leak of ['getUnitAuditSnapshot','getTrackPolicy','品質層級','MutationObserver','requestAnimationFrame']) {
    if (reader.text.includes(leak)) failures.push(`${reader.name} reader leaks internal/DOM token ${leak}`)
  }
}

for (const token of [
  "reviewStatus: 'textbook-ready'",
  "textbookVersion: 'v14'",
  'sourceRefs',
  'objectives',
  'misconceptions',
  'visuals',
  'vocabulary',
  'ensureWorkedExamples',
  'ensureQuestions',
  'validateTextbookUnitV14',
  'getTextbookUnitContentV14',
  'BANNED_MISSING_MATERIAL',
]) if (!textbookV14.includes(token)) failures.push(`Textbook V14 structural layer missing ${token}`)
for (const token of ['getTextbookUnitContentV17','inspectTextbookUnitV17','buildPedagogyQuestions','upgradeExamples','getConceptChecksV17']) {
  if (!pedagogyV17.includes(token)) failures.push(`Pedagogy V17 learner base missing ${token}`)
}
for (const token of ['stats.activeUnits !== 453','stats.foundationUnits !== 420','stats.depthPassed !== 420','all 453 active units resolved at runtime']) {
  if (!runtimeAudit.includes(token)) failures.push(`current V14 runtime audit missing ${token}`)
}

const math7Scope = read('src/curriculum-official-scope-math7.ts')
const math7Supplement = read('src/curriculum-textbook-supplement-math7.ts')
const science7Scope = read('src/curriculum-official-scope-science7.ts')
const science7Supplement = read('src/curriculum-textbook-supplement-science7.ts')
const science7Source = read('src/curriculum-reviewed-science7.ts')

const requiredMath7Codes = ['N-7-1','N-7-2','N-7-3','N-7-4','N-7-5','N-7-6','N-7-7','N-7-8','N-7-9','S-7-1','S-7-2','S-7-3','S-7-4','S-7-5','G-7-1','A-7-1','A-7-2','A-7-3','A-7-4','A-7-5','A-7-6','A-7-7','A-7-8','D-7-1','D-7-2']
for (const code of requiredMath7Codes) if (!math7Scope.includes(`'${code}'`)) failures.push(`grade 7 math official scope missing ${code}`)
const math7UnitIds = new Set([...math7Scope.matchAll(/unitId:\s*'([^']+)'/g)].map((match) => match[1]))
if (math7UnitIds.size !== 9) failures.push(`grade 7 math official scope should map 9 units, found ${math7UnitIds.size}`)
for (const unitId of math7UnitIds) if (!math7Supplement.includes(`unitId: '${unitId}'`)) failures.push(`grade 7 math supplement missing ${unitId}`)
const math7QuestionCount = (math7Supplement.match(/supp-q\d+/g) ?? []).length
const math7MisconceptionCount = (math7Supplement.match(/title:\s*'常見迷思/g) ?? []).length
if (math7QuestionCount < 36) failures.push(`grade 7 math supplement questions ${math7QuestionCount} < 36`)
if (math7MisconceptionCount < 18) failures.push(`grade 7 math misconception concepts ${math7MisconceptionCount} < 18`)

const science7UnitIds = new Set([...science7Scope.matchAll(/unitId:\s*'([^']+)'/g)].map((match) => match[1]))
if (science7UnitIds.size !== 6) failures.push(`grade 7 science scope should map 6 platform-sequence units, found ${science7UnitIds.size}`)
for (const unitId of science7UnitIds) if (!science7Supplement.includes(`unitId: '${unitId}'`)) failures.push(`grade 7 science supplement missing ${unitId}`)
const science7QuestionCount = (science7Supplement.match(/supp-q\d+/g) ?? []).length
const science7MisconceptionCount = (science7Supplement.match(/title:\s*'常見迷思/g) ?? []).length
if (science7QuestionCount < 24) failures.push(`grade 7 science supplement questions ${science7QuestionCount} < 24`)
if (science7MisconceptionCount < 15) failures.push(`grade 7 science misconception concepts ${science7MisconceptionCount} < 15`)
if (science7Source.includes('בלבד')) failures.push('grade 7 science dirty foreign token regressed')

for (const token of ['enrichTextbookCertificationCandidateV15','v15-diagnostic-choice','v15-transfer-response','optionFeedback','rubric']) {
  if (!certificationV15.includes(token)) failures.push(`V15 certification supplement missing ${token}`)
}
if (!aggregator.includes('enrichTextbookCertificationCandidateV15')) failures.push('strict reviewed aggregator no longer applies V15 certification supplement')

if (failures.length) {
  console.error('[textbook-audit] FAILED')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('[textbook-audit] V18 active learner overlay + V17 pedagogy base + V14 structural runtime + V15 certification + official Grade 7 gates passed')
console.log(`[textbook-audit] grade 7 math supplement: 9 units, ${math7QuestionCount} extra questions, ${math7MisconceptionCount} misconception concepts`)
console.log(`[textbook-audit] grade 7 science supplement: 6 units, ${science7QuestionCount} extra questions, ${science7MisconceptionCount} misconception concepts`)
