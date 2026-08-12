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
const v12 = read('src/components/CurriculumCourseAppV12.tsx')
const v8 = read('src/components/CurriculumCourseAppV8.tsx')
const v14 = read('src/components/CurriculumCourseAppV14.tsx')
const activeExport = read('src/components/CurriculumCourseApp.tsx')
const drawer = read('src/components/SideDrawer.tsx')
const desktop = read('src/components/DesktopWorkspace.tsx')
const runtimeAudit = read('scripts/audit-textbook-ready-v14.ts')

for (const structure of ['integrated-life','platform-extension','discipline-split','path-selected','discipline-split-required','path-selection-required']) {
  if (!registry.includes(`'${structure}'`)) failures.push(`audit registry missing structural policy ${structure}`)
}
if (!registry.includes('getTextbookUnitContentV14(args.unitId)')) failures.push('audit registry must derive textbook-ready status from the V14 runtime validator')
if (registry.includes('TEXTBOOK_READY_UNITS = new Set<string>()')) failures.push('static empty textbook-ready registry must not override passing V14 units')
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

if (!pathwayFoundation.includes("reviewStatus: 'foundation'")) failures.push('V13 pathway base must remain identifiable as source foundation before V14 enrichment')
if (!aggregator.includes('upgradeFoundationUnitV12(foundation)')) failures.push('Foundation source must receive subject-specific V12 question upgrade before V14 enrichment')
for (const feature of ['optionFeedback','mediaAssetId','audioText','rubric']) {
  if (!aggregator.includes(feature)) failures.push(`aggregator no longer preserves ${feature}`)
  if (!foundationV12.includes(feature)) failures.push(`foundation question bank cannot produce ${feature}`)
  if (!v14.includes(feature)) failures.push(`V14 reader cannot consume ${feature}`)
}

if (!activeExport.includes("from './CurriculumCourseAppV14'")) failures.push('active formal-course export must use Textbook V14')
if (!activeExport.includes('textbook-v14')) failures.push('active V14 reader must remount when the course route changes')
if (!v8.includes("from './CurriculumCourseAppV12'")) failures.push('legacy vetted-media reader chain regressed')
for (const reader of [{ name: 'V12', text: v12 }, { name: 'V14', text: v14 }]) {
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
]) if (!textbookV14.includes(token)) failures.push(`Textbook V14 layer missing ${token}`)
for (const token of ['activeUnitIds.size !== 453','textbookReadyUnits !== activeUnitIds.size','unit.questions.length','unit.misconceptions.length','unit.visuals.length','promptOwners','owners.size > 8','source.url.includes(\'naer.edu.tw\')']) {
  if (!runtimeAudit.includes(token)) failures.push(`runtime V14 audit missing ${token}`)
}

// Existing deep Grade 7 official-code checkpoints remain mandatory instead of being hidden by the global V14 promotion.
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

if (failures.length) {
  console.error('[textbook-audit] FAILED')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('[textbook-audit] V14 runtime promotion architecture + official source gates + reader separation + Grade 7 deep checkpoints passed')
console.log(`[textbook-audit] grade 7 math supplement: 9 units, ${math7QuestionCount} extra questions, ${math7MisconceptionCount} misconception concepts`)
console.log(`[textbook-audit] grade 7 science supplement: 6 units, ${science7QuestionCount} extra questions, ${science7MisconceptionCount} misconception concepts`)
