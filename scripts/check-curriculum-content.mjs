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

// Keep the older reviewed-content and visual chain healthy because V14/V17/V18/V19 reuse its subject-specific base content.
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

// V20 is the learner-facing editorial layer. V19 owns subject visual language; V18 remains the validated content baseline.
const activeExport = read('src/components/CurriculumCourseApp.tsx')
const v14 = read('src/components/CurriculumCourseAppV14.tsx')
const activeReader = read('src/components/CurriculumCourseAppV17.tsx')
const v14Css = read('src/curriculum-course-v14.css')
const v17Css = read('src/curriculum-course-v17.css')
const v19Css = read('src/curriculum-course-v19.css')
const textbookV14 = read('src/curriculum-textbook-v14.ts')
const pedagogyV17 = read('src/curriculum-pedagogy-v17.ts')
const pedagogyV18 = read('src/curriculum-pedagogy-v18.ts')
const pedagogyV18Base = read('src/curriculum-pedagogy-v18-base.ts')
const v20Runtime = read('src/curriculum-textbook-v20-runtime.ts')
const pedagogyVisualV17 = read('src/components/CurriculumPedagogyVisualV17.tsx')
const pedagogyVisualV18 = read('src/components/CurriculumPedagogyVisualV18.tsx')
const pedagogyVisualV19 = read('src/components/CurriculumSubjectVisualV19.tsx')
const uxV18Css = read('src/user-experience-audit-v18.css')
if (!activeExport.includes("from './CurriculumCourseAppV17'")) failures.push('active curriculum export must keep the stable reader component entry')
if (!activeExport.includes("-user-audit-v18`")) failures.push('active reader route key must preserve V18 learner-content remount semantics')
for (const token of ['getCurriculumCourseBundleV13','getTextbookUnitContentV18','getConceptChecksV18','quickCheck','renderQuestion(page.quickCheck)','CurriculumPedagogyVisualV19','CurriculumLearningVisualV19','questionGroups','unitContent.objectives','unitContent.misconceptions','unitContent.visuals','unitContent.workedExamples','unitContent.questions','optionFeedback','mediaAssetId','audioText','rubric','REPORT_OPTIONS']) {
  if (!activeReader.includes(token)) failures.push(`active V19/V20 reader missing ${token}`)
}
for (const forbidden of ['MutationObserver','requestAnimationFrame','getUnitAuditSnapshot','getTrackPolicy','品質層級']) {
  if (activeReader.includes(forbidden)) failures.push(`active reader contains forbidden internal/DOM token ${forbidden}`)
}
for (const token of ['getCurriculumCourseBundleV13','getTextbookUnitContentV14','unitContent.objectives','unitContent.workedExamples','unitContent.questions']) {
  if (!v14.includes(token)) failures.push(`V14 fallback reader missing ${token}`)
}
for (const token of ['grid-template-columns','html[data-theme="light"]','.curriculum-v14-misconception','.curriculum-v14-visual-grid','.curriculum-v14-report-kinds']) {
  if (!v14Css.includes(token)) failures.push(`V14 base layout missing ${token}`)
}
for (const token of ['curriculum-v17-quick-check','curriculum-v17-diagram','data-v17-rich-visual']) {
  if (!`${v17Css}\n${pedagogyVisualV17}`.includes(token)) failures.push(`V17 pedagogy layout/visual missing ${token}`)
}
for (const token of ['CoordinateDiagram','GeometryDiagram','NumberLineDiagram','CircuitDiagram','ParticleDiagram','MotionDiagram','TimelineDiagram','EvidenceDiagram']) {
  if (!pedagogyVisualV17.includes(token)) failures.push(`V17 rich visual renderer missing ${token}`)
}
for (const token of ['buildPedagogyQuestions','upgradeExamples','subjectSteps','-ped-v17-check-','validateTextbookUnitV14','getTextbookUnitContentV17','getConceptChecksV17']) {
  if (!pedagogyV17.includes(token)) failures.push(`V17 pedagogy content layer missing ${token}`)
}
for (const token of ['getTextbookUnitContentV17','concreteTask','mathTask','scienceTask','socialTask','englishTask','chineseTask','validateTextbookUnitV14']) {
  if (!pedagogyV18Base.includes(token)) failures.push(`V18 concrete core missing ${token}`)
}
for (const token of ['getTextbookUnitContentV18','getConceptChecksV18','getTextbookUnitContentV20','resolvingV20']) {
  if (!pedagogyV18.includes(token)) failures.push(`V18/V20 learner entry missing ${token}`)
}
for (const token of ['inspectTextbookUnitV20','taskFor','upgradeWorkedExample','specificMisconceptionVisual','mathTask','englishTask','chineseTask','scienceTask','socialTask']) {
  if (!v20Runtime.includes(token)) failures.push(`V20 editorial runtime missing ${token}`)
}
for (const token of ['ConcreteNumberLine','concrete-number-line','−3','+3','CurriculumPedagogyVisualV17']) {
  if (!pedagogyVisualV18.includes(token)) failures.push(`V18 learner visual layer missing ${token}`)
}
for (const token of ['ChineseDiscourseVisual','EnglishSceneVisual','MathRelationVisual','ScienceEvidenceVisual','SocialLensVisual','CurriculumPedagogyVisualV18']) {
  if (!pedagogyVisualV19.includes(token)) failures.push(`V19 subject visual layer missing ${token}`)
}
for (const token of ['.v19-chinese-page','.v19-dialogue-stage','.v19-science-stage','.v19-social-canvas','.curriculum-v19-details','.curriculum-v19-model-steps']) {
  if (!v19Css.includes(token)) failures.push(`V19 visual-first layout missing ${token}`)
}
for (const token of ['assistant-tool-hub','.curriculum-v14-reader-tools','.learning-resume-card','.auth-intro','.curriculum-layer.rail']) {
  if (!uxV18Css.includes(token)) failures.push(`V18 UX override missing ${token}`)
}
for (const token of ['reviewStatus: \'textbook-ready\'','textbookVersion: \'v14\'','sourceRefs','objectives','misconceptions','visuals','vocabulary','ensureWorkedExamples','ensureQuestions','validateTextbookUnitV14','BANNED_MISSING_MATERIAL','optionFeedback','rubric']) {
  if (!textbookV14.includes(token)) failures.push(`V14 textbook structural layer missing ${token}`)
}

// Structural route model: active learner routes must reflect grade-specific official organization.
const plan = read('src/curriculum-plan-v5.ts')
for (const pathway of ['life','physics','chemistry','biology','earth-science','geography','history','civics','math-a','math-b','math-alpha','math-beta']) {
  if (!plan.includes(`'${pathway}'`)) failures.push(`V13 plan missing pathway ${pathway}`)
}
for (const token of ['getCurriculumRouteOptions','getCurriculumCourseMeta','resolveCurriculumUnit','ambiguousBaseRoute','routeToken']) {
  if (!plan.includes(token)) failures.push(`V13 plan missing structural function ${token}`)
}
if (!plan.includes("if (grade <= 2)") || !plan.includes("pathwayRoute('science', 'life')")) failures.push('grades 1-2 must expose integrated Life Curriculum route')
if (!plan.includes("grade === 11") || !plan.includes("pathwayRoute('math', 'math-a')") || !plan.includes("pathwayRoute('math', 'math-b')")) failures.push('grade 11 math A/B route split missing')
if (!plan.includes("pathwayRoute('math', 'math-alpha')") || !plan.includes("pathwayRoute('math', 'math-beta')")) failures.push('grade 12 math 甲/乙 route split missing')
for (const pathName of ['physics','chemistry','biology','earth-science']) if (!plan.includes(`pathwayRoute('science', '${pathName}')`)) failures.push(`high school science route missing ${pathName}`)
for (const pathName of ['geography','history','civics']) if (!plan.includes(`pathwayRoute('social', '${pathName}')`)) failures.push(`high school social route missing ${pathName}`)
if (!plan.includes("if (grade >= 10 && (subject === 'science' || subject === 'social')) return true")) failures.push('ambiguous high-school merged science/social route must be blocked')
if (!plan.includes("if (grade >= 11 && subject === 'math') return true")) failures.push('ambiguous G11+ common math route must be blocked')

const pathwayFoundation = read('src/curriculum-pathway-foundation-v13.ts')
for (const token of ['getPathwayFoundationUnitContent','resolveCurriculumUnit','生活課程','課程已放在正確的','questions: []']) {
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

for (const chapter of ['二元一次聯立方程式','直角坐標與二元一次方程式圖形','一元一次不等式']) if (!plan.includes(chapter)) failures.push(`grade 7 math roadmap missing ${chapter}`)
if (plan.includes('公民：民主與法律')) failures.push('grade 7 social roadmap regressed to politics/law unit')

if (failures.length) {
  console.error('[curriculum-qa] FAILED')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('[curriculum-qa] V20 learner editorial runtime + V19 subject visual layer + V18 concrete core + V17 pedagogy base + V14 structural textbook + V13 route structure passed')
