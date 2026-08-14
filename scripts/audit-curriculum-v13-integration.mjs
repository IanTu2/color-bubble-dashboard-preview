import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const failures = []

const plan = read('src/curriculum-plan-v5.ts')
const lifeBank = read('src/curriculum-life-question-bank-v13.ts')
const pathwayFoundation = read('src/curriculum-pathway-foundation-v13.ts')
const aggregator = read('src/curriculum-reviewed-content.ts')
const activeWrapper = read('src/components/CurriculumCourseApp.tsx')
const activePlayer = read('src/components/CurriculumCourseAppV17.tsx')
const legacyV13 = read('src/components/CurriculumCourseAppV13.tsx')
const drawer = read('src/components/SideDrawer.tsx')
const app = read('src/App.tsx')
const desktop = read('src/components/DesktopWorkspace.tsx')

for (const token of ['routeToken(subject, pathway)','`g${grade}-${routeToken(subject, pathway)}-s${semester}-u${index + 1}`','resolveCurriculumUnit']) {
  if (!plan.includes(token)) failures.push(`pathway unit identity contract missing: ${token}`)
}

if (!plan.includes("pathwayRoute('science', 'life')")) failures.push('Life Curriculum route missing')
const lowGradeRouteBlock = plan.slice(plan.indexOf('if (grade <= 2)'), plan.indexOf('if (grade <= 9)'))
if (lowGradeRouteBlock.includes("baseRoute('science')") || lowGradeRouteBlock.includes("baseRoute('social')")) failures.push('grades 1-2 route options must not expose independent science/social base courses')
if (!lowGradeRouteBlock.includes("baseRoute('english', true)")) failures.push('grades 1-2 English must remain explicitly marked extension')

for (const token of ['buildLifeCurriculumQuestionsV13','校園走廊','社區圖書館員','合作','生活順序','我發現了']) {
  if (!lifeBank.includes(token)) failures.push(`Life Curriculum integrated question evidence missing: ${token}`)
}
if (!aggregator.includes("unitId.includes('-life-')")) failures.push('aggregator does not detect Life Curriculum unit ids')
if (!aggregator.includes('buildLifeCurriculumQuestionsV13(upgraded)')) failures.push('Life Curriculum question bank not wired after Foundation upgrade')
if (!pathwayFoundation.includes("pathway === 'life'")) failures.push('Life Curriculum concepts/worked examples not specialized')

for (const route of [
  "pathwayRoute('science', 'physics')",
  "pathwayRoute('science', 'chemistry')",
  "pathwayRoute('science', 'biology')",
  "pathwayRoute('science', 'earth-science')",
  "pathwayRoute('social', 'geography')",
  "pathwayRoute('social', 'history')",
  "pathwayRoute('social', 'civics')",
  "pathwayRoute('math', 'math-a')",
  "pathwayRoute('math', 'math-b')",
  "pathwayRoute('math', 'math-alpha')",
  "pathwayRoute('math', 'math-beta')",
]) if (!plan.includes(route)) failures.push(`high-school route missing: ${route}`)

if (!drawer.includes('onOpenCourse(grade, subject, pathway)')) failures.push('SideDrawer drops pathway before course request')
if (!app.includes('course: { grade, subject, pathway }')) failures.push('App drops pathway in desktop request')
if (!desktop.includes('pathway={item.course.pathway}')) failures.push('DesktopWorkspace drops pathway before player render')
if (!activePlayer.includes('getCurriculumCourseBundleV13(grade, subject, pathway)')) failures.push('active player does not load the selected V13 route model')
if (!activePlayer.includes('getTextbookUnitContentV18(unit.id)')) failures.push('active player does not load the selected unit through V18 learner-content gate')
if (!legacyV13.includes('getCurriculumCourseBundleV13(grade, subject, pathway)')) failures.push('legacy V13 route reader lost pathway support')

if (!activeWrapper.includes("const routeKey = `${props.grade}-${props.subject}-${props.pathway ?? 'base'}-user-audit-v18`")) failures.push('active curriculum wrapper does not build the V18 route-specific remount key')
if (!activeWrapper.includes('key={routeKey}')) failures.push('active curriculum wrapper does not remount the player on route changes')

for (const forbidden of ['MutationObserver','requestAnimationFrame','getUnitAuditSnapshot','getTrackPolicy','品質層級']) {
  if (activePlayer.includes(forbidden) || activeWrapper.includes(forbidden)) failures.push(`active learner reader path contains reader-forbidden token: ${forbidden}`)
}

if (failures.length) {
  console.error('[curriculum-v13-integration] FAILED')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('[curriculum-v13-integration] route identity + Life integration + HS splits + V18 propagation + route-change remount passed')
