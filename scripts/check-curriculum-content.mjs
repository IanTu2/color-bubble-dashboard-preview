import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const failures = []
const count = (text, pattern) => (text.match(pattern) ?? []).length

const activeModules = [
  { file: 'src/curriculum-reviewed-social10.ts', units: 6, questions: 48 },
  { file: 'src/curriculum-reviewed-math7.ts', units: 6, questions: 48 },
  { file: 'src/curriculum-reviewed-math7-v2.ts', units: 5, questions: 40 },
  { file: 'src/curriculum-reviewed-science7.ts', units: 6, questions: 48 },
  { file: 'src/curriculum-reviewed-chinese7.ts', units: 6, questions: 48 },
  { file: 'src/curriculum-reviewed-english7.ts', units: 6, questions: 48 },
  { file: 'src/curriculum-reviewed-social7.ts', units: 6, questions: 48 },
]

const bannedMissingMaterial = ['看到一張統計圖後','依圖表而異','依文本而異','答案依題目而異','根據下圖','依下圖','觀察下圖','請看下圖','如圖所示','依附圖']
for (const target of activeModules) {
  const text = read(target.file)
  if (count(text, /reviewStatus:\s*['"]reviewed['"]/g) < target.units) failures.push(`${target.file}: reviewed unit count regressed`)
  if (count(text, /id:\s*['"][^'"]+-q\d+['"]/g) < target.questions) failures.push(`${target.file}: reviewed question count regressed`)
  if (count(text, /workedExamples\s*:/g) < target.units) failures.push(`${target.file}: worked example count regressed`)
  for (const phrase of bannedMissingMaterial) if (text.includes(phrase)) failures.push(`${target.file}: missing-material fallback "${phrase}"`)
}

const foundation = read('src/curriculum-foundation-content.ts')
for (const token of ["reviewStatus: 'foundation'",'getFoundationUnitContent','CHINESE_RULES','ENGLISH_RULES','MATH_RULES','SCIENCE_RULES','SOCIAL_RULES','workedExampleFor']) {
  if (!foundation.includes(token)) failures.push(`foundation curriculum missing ${token}`)
}
const foundationV12 = read('src/curriculum-foundation-question-bank-v12.ts')
for (const token of ['buildFoundationSubjectQuestions','upgradeFoundationUnitV12','3x+5=20','沉著','Mia goes to the library after school on Tuesday','optionFeedback','rubric','audioText','mediaAssetId']) {
  if (!foundationV12.includes(token)) failures.push(`v12 subject question bank missing ${token}`)
}

// Existing reader and visual stability chain must not regress.
const v12 = read('src/components/CurriculumCourseAppV12.tsx')
for (const token of ['splitQuestionBank','groups.guided','groups.practice','groups.assessment','QuestionMedia','AudioPrompt','optionFeedback','curriculum-response-rubric','CURRICULUM_VETTED_MEDIA']) {
  if (!v12.includes(token)) failures.push(`V12 reader missing ${token}`)
}
for (const forbidden of ['getUnitAuditSnapshot','getTrackPolicy','品質層級','MutationObserver','requestAnimationFrame']) {
  if (v12.includes(forbidden)) failures.push(`V12 reader contains forbidden internal/DOM token ${forbidden}`)
}
const v8 = read('src/components/CurriculumCourseAppV8.tsx')
const stabilityCss = read('src/curriculum-visual-stability-v8.css')
if (!v8.includes("from './CurriculumCourseAppV12'")) failures.push('V8 must still wrap V12 directly')
if (!v8.includes('useLayoutEffect') || v8.includes('requestAnimationFrame')) failures.push('V8 visual synchronization regressed')
if (!v8.includes('observer?.disconnect()')) failures.push('V8 observer mutation guard regressed')
if (!stabilityCss.includes('aspect-ratio: 4 / 3')) failures.push('V8 media aspect-ratio reservation missing')

// V13 active router adds pathway courses while preserving V8 for ordinary routes.
const activeExport = read('src/components/CurriculumCourseApp.tsx')
const v13 = read('src/components/CurriculumCourseAppV13.tsx')
const v13Css = read('src/curriculum-course-v13.css')
if (!activeExport.includes("from './CurriculumCourseAppV13'")) failures.push('active curriculum export must route through V13')
if (!v13.includes("from './CurriculumCourseAppV8'")) failures.push('V13 must preserve V8 for non-pathway courses')
if (!v13.includes('if (!props.pathway)')) failures.push('V13 must explicitly preserve the legacy/base stable player')
for (const token of ['getCurriculumCourseBundleV13','questionGroups','guided: questions.slice','practice: questions.slice','assessment: questions.slice','optionFeedback','mediaAssetId','audioText','rubric','pathway']) {
  if (!v13.includes(token)) failures.push(`V13 pathway player missing ${token}`)
}
for (const forbidden of ['MutationObserver','requestAnimationFrame','getUnitAuditSnapshot','品質層級']) {
  if (v13.includes(forbidden)) failures.push(`V13 reader contains forbidden token ${forbidden}`)
}
if (!v13Css.includes('grid-template-columns') || !v13Css.includes('html[data-theme="light"]')) failures.push('V13 layout must include responsive grid and light theme')

// Structural route model: active learner routes must reflect grade-specific official organization.
const plan = read('src/curriculum-plan-v5.ts')
for (const pathway of ['life','physics','chemistry','biology','earth-science','geography','history','civics','math-a','math-b','math-alpha','math-beta']) {
  if (!plan.includes(`'${pathway}'`)) failures.push(`V13 plan missing pathway ${pathway}`)
}
for (const token of ['getCurriculumRouteOptions','getCurriculumCourseMeta','resolveCurriculumUnit','ambiguousBaseRoute','routeToken']) {
  if (!plan.includes(token)) failures.push(`V13 plan missing structural function ${token}`)
}
if (!plan.includes("if (grade <= 2)" ) || !plan.includes("pathwayRoute('science', 'life')")) failures.push('grades 1-2 must expose integrated Life Curriculum route')
if (!plan.includes("grade === 11") || !plan.includes("pathwayRoute('math', 'math-a')") || !plan.includes("pathwayRoute('math', 'math-b')")) failures.push('grade 11 math A/B route split missing')
if (!plan.includes("pathwayRoute('math', 'math-alpha')") || !plan.includes("pathwayRoute('math', 'math-beta')")) failures.push('grade 12 math 甲/乙 route split missing')
for (const path of ['physics','chemistry','biology','earth-science']) if (!plan.includes(`pathwayRoute('science', '${path}')`)) failures.push(`high school science route missing ${path}`)
for (const path of ['geography','history','civics']) if (!plan.includes(`pathwayRoute('social', '${path}')`)) failures.push(`high school social route missing ${path}`)
if (!plan.includes("if (grade >= 10 && (subject === 'science' || subject === 'social')) return true")) failures.push('ambiguous high-school merged science/social route must be blocked')
if (!plan.includes("if (grade >= 11 && subject === 'math') return true")) failures.push('ambiguous G11+ common math route must be blocked')

const pathwayFoundation = read('src/curriculum-pathway-foundation-v13.ts')
for (const token of ['getPathwayFoundationUnitContent','resolveCurriculumUnit','生活課程','高中分科課程','questions: []']) {
  if (!pathwayFoundation.includes(token)) failures.push(`pathway foundation missing ${token}`)
}
const aggregator = read('src/curriculum-reviewed-content.ts')
if (!aggregator.includes('getPathwayFoundationUnitContent')) failures.push('pathway foundation content is not wired into content aggregator')
if (!aggregator.includes('getFoundationUnitContent(unitId) ?? getPathwayFoundationUnitContent(unitId)')) failures.push('base foundation must remain first, pathway fallback second')

const drawer = read('src/components/SideDrawer.tsx')
for (const token of ['getCurriculumRouteOptions','selectedRouteId','selectedRoute.pathway','依本年級正式結構顯示']) if (!drawer.includes(token)) failures.push(`SideDrawer pathway navigation missing ${token}`)
if (drawer.includes('查看五科課程')) failures.push('drawer must not claim every grade has the same five-course structure')
const desktop = read('src/components/DesktopWorkspace.tsx')
for (const token of ['getCurriculumCourseMeta','getCurriculumTrack(course.grade, course.subject, course.pathway)','pathway={item.course.pathway}']) if (!desktop.includes(token)) failures.push(`desktop pathway persistence missing ${token}`)

const inventory = read('scripts/report-curriculum-audit.mjs')
for (const token of ['activeTracks !== 75','totalUnits !== 453','structuralBlockerUnits = 0']) if (!inventory.includes(token)) failures.push(`v13 active inventory missing assertion ${token}`)

// Keep Grade 7 researched map protections.
for (const chapter of ['二元一次聯立方程式','直角坐標與二元一次方程式圖形','一元一次不等式']) if (!plan.includes(chapter)) failures.push(`grade 7 math roadmap missing ${chapter}`)
if (plan.includes('公民：民主與法律')) failures.push('grade 7 social roadmap regressed to politics/law unit')

if (failures.length) {
  console.error('[curriculum-qa] FAILED')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('[curriculum-qa] V13 route structure + V8/V12 stability + pathway content + disjoint questions + enhanced feedback gates passed')
