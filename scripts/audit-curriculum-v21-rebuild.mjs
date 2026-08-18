import { createServer } from 'vite'

const server = await createServer({ logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })
const normalize = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()
const learnerText = (unit) => normalize([
  unit.overview,
  ...unit.objectives,
  ...unit.concepts.flatMap((item) => [item.title, item.explanation, item.example]),
  ...unit.misconceptions.flatMap((item) => [item.claim, item.correction, item.reason]),
  ...unit.workedExamples.flatMap((item) => [item.context, item.prompt, ...item.steps, item.answer, item.explanation]),
  ...unit.questions.flatMap((item) => [item.context, item.prompt, item.kind === 'choice' ? item.options.join(' ') : item.sampleAnswer, item.explanation]),
].join(' '))

const rows = []
const findings = []
const stats = {
  active: 0,
  ready: 0,
  familyResolved: 0,
  bySubject: {},
  familyCounts: {},
  workedExamples: 0,
  questions: 0,
  quickChecks: 0,
  responseQuestions: 0,
  visuals: 0,
  internalReady: 0,
  humanVerified: 0,
}

function fail(unitId, code, detail) {
  findings.push({ unitId, code, detail })
}

function assertSignal(row, pattern, code, label) {
  const text = learnerText(row.content)
  if (!pattern.test(text)) fail(row.unit.id, code, `Expected ${label} evidence in active learner content.`)
}

try {
  const plan = await server.ssrLoadModule('/src/curriculum-plan-v5.ts')
  const v21 = await server.ssrLoadModule('/src/curriculum-pedagogy-v21.ts')
  const status = await server.ssrLoadModule('/src/curriculum-v20-review-status.ts')

  for (let grade = 1; grade <= 12; grade += 1) {
    for (const route of plan.getCurriculumRouteOptions(grade)) {
      const track = plan.getCurriculumTrack(grade, route.subject, route.pathway)
      if (!track) continue
      for (const semester of track.semesters) {
        for (const unit of semester.units) {
          stats.active += 1
          const inspected = v21.inspectTextbookUnitV21(unit.id)
          if (!inspected?.unit || !inspected?.validation?.ready) {
            fail(unit.id, 'v21-structural-not-ready', (inspected?.validation?.errors ?? ['unknown']).join(' | '))
            continue
          }
          stats.ready += 1
          if (!inspected.familyId || !inspected.familyLabel) fail(unit.id, 'family-unresolved', 'V21 did not resolve a subject knowledge family.')
          else {
            stats.familyResolved += 1
            const familyKey = `${route.subject}:${inspected.familyId}`
            stats.familyCounts[familyKey] = (stats.familyCounts[familyKey] ?? 0) + 1
          }

          const content = inspected.unit
          const row = { grade, subject: route.subject, pathway: route.pathway ?? null, semester: semester.semester, unit, content, familyId: inspected.familyId }
          rows.push(row)
          stats.bySubject[route.subject] = (stats.bySubject[route.subject] ?? 0) + 1
          stats.workedExamples += content.workedExamples.length
          stats.questions += content.questions.length
          stats.responseQuestions += content.questions.filter((q) => q.kind === 'response').length
          stats.quickChecks += content.questions.filter((q) => q.id.includes('-ped-v17-check-v21-')).length
          stats.visuals += content.visuals.length

          if (content.workedExamples.length < 4) fail(unit.id, 'worked-example-depth', `${content.workedExamples.length} < 4`)
          if (content.questions.filter((q) => !q.id.includes('-ped-v17-check-v21-')).length < 15) fail(unit.id, 'formal-question-depth', 'fewer than 15 formal V21 questions')
          if (content.questions.filter((q) => q.kind === 'response').length < 3) fail(unit.id, 'response-question-depth', 'fewer than 3 response questions')
          if (content.visuals.length < 3 || content.visuals.some((v) => v.items.length < 4)) fail(unit.id, 'visual-structure-depth', 'V21 visuals are incomplete')
          if (content.questions.some((q) => q.kind === 'choice' && q.options.some((o) => /資訊不足，不能依題目條件得到此結論（\d+）/.test(o)))) fail(unit.id, 'generic-fallback-distractor', 'generic fallback option remains')

          const title = unit.title
          const titleFocus = `${unit.title} ${unit.focus}`
          if (route.subject === 'math') {
            if (/100\s*以內/.test(title)) {
              if (inspected.familyId !== 'number') fail(unit.id, 'math-family-100', `family=${inspected.familyId}`)
              const taskText = normalize(content.workedExamples.flatMap((e) => [e.prompt, e.answer, e.explanation]).join(' '))
              const values = (taskText.match(/\d+(?:\.\d+)?/g) ?? []).map(Number).filter((value) => value < 1900)
              if (values.some((value) => value > 100)) fail(unit.id, 'math-100-range', `value > 100 found: ${Math.max(...values)}`)
            }
            if (/因數|倍數/.test(title)) {
              if (inspected.familyId !== 'factors') fail(unit.id, 'math-family-factors', `family=${inspected.familyId}`)
              assertSignal(row, /因數|倍數|整除/, 'math-factor-signal', 'factor/divisibility')
            }
            if (/二次方程式|二次函數/.test(title)) {
              if (inspected.familyId !== 'quadratic') fail(unit.id, 'math-family-quadratic', `family=${inspected.familyId}`)
              assertSignal(row, /x²|二次|拋物線|因式分解/, 'math-quadratic-signal', 'quadratic expression/equation/function')
            }
            if (/三角比|三角函數/.test(title)) {
              if (inspected.familyId !== 'trigonometry') fail(unit.id, 'math-family-trigonometry', `family=${inspected.familyId}`)
              assertSignal(row, /sin|cos|tan|對邊|鄰邊|斜邊|三角比/, 'math-trig-signal', 'trigonometric relationship')
            }
            if (/極限|微分|積分|導數/.test(title)) {
              if (inspected.familyId !== 'calculus') fail(unit.id, 'math-family-calculus', `family=${inspected.familyId}`)
              assertSignal(row, /導數|微分|積分|變化率|∫|f'\(/, 'math-calculus-signal', 'calculus operation')
            }
            if (inspected.familyId === 'modeling-project' && !/統整|專題|應用|素養|建模|探究/.test(titleFocus)) fail(unit.id, 'math-broad-fallback', `unexplained modeling-project fallback for ${unit.title}`)
          }

          if (route.subject === 'english') {
            if (/Be 動詞|基本句型/.test(title)) {
              if (inspected.familyId !== 'be-basic') fail(unit.id, 'english-family-be', `family=${inspected.familyId}`)
              assertSignal(row, /\bam\b|\bis\b|\bare\b|be verb/i, 'english-be-signal', 'am/is/are')
            }
            if (/現在簡單式|現在式問答|日常作息/.test(title)) {
              if (inspected.familyId !== 'present-simple') fail(unit.id, 'english-family-present', `family=${inspected.familyId}`)
              assertSignal(row, /simple present|Every school day|walks|routine/i, 'english-present-signal', 'simple-present routine or form')
            }
            if (/被動語態/.test(title)) {
              if (inspected.familyId !== 'passive') fail(unit.id, 'english-family-passive', `family=${inspected.familyId}`)
              assertSignal(row, /passive|were collected|past participle/i, 'english-passive-signal', 'passive structure')
            }
          }

          if (route.subject === 'chinese') {
            const classicalTitle = /文言|古文|古典文本|古文與思想/.test(title) && !/詩|詞|曲/.test(title)
            if (classicalTitle) {
              if (inspected.familyId !== 'classical') fail(unit.id, 'chinese-family-classical', `family=${inspected.familyId}`)
              assertSignal(row, /文言|句意|翻譯|上下文|古今/, 'chinese-classical-signal', 'classical-text interpretation')
            }
            if (/修辭/.test(title)) {
              if (inspected.familyId !== 'rhetoric') fail(unit.id, 'chinese-family-rhetoric', `family=${inspected.familyId}`)
              assertSignal(row, /修辭|譬喻|擬人|誇飾|表達效果/, 'chinese-rhetoric-signal', 'rhetorical device and effect')
            }
            if (/古典詩詞|詩詞曲|詩歌|意象/.test(title)) {
              if (inspected.familyId !== 'poetry') fail(unit.id, 'chinese-family-poetry', `family=${inspected.familyId}`)
              assertSignal(row, /詩|意象|情感|節奏|畫面/, 'chinese-poetry-signal', 'poetic image/form/effect')
            }
          }

          if (route.subject === 'science') {
            if (/細胞/.test(title)) {
              if (inspected.familyId !== 'cell-life') fail(unit.id, 'science-family-cell', `family=${inspected.familyId}`)
              assertSignal(row, /細胞|顯微鏡|細胞核|胞器|構造單位/, 'science-cell-signal', 'cell structure/observation')
            }
            if (/電與磁|電路|電磁|電場|電位|磁場/.test(title) && !/專題|跨域/.test(title)) {
              if (inspected.familyId !== 'electricity-magnetism') fail(unit.id, 'science-family-electricity', `family=${inspected.familyId}`)
              assertSignal(row, /電流|電路|電壓|電阻|電場|磁場|電磁/, 'science-electricity-signal', 'electric/magnetic relationship')
            }
            if (/月亮|太空|天文|太陽系|宇宙|恆星|行星/.test(title) && !/專題/.test(title)) {
              if (inspected.familyId !== 'astronomy') fail(unit.id, 'science-family-astronomy', `family=${inspected.familyId}`)
              assertSignal(row, /月相|月球|太陽|恆星|行星|宇宙|天文/, 'science-astronomy-signal', 'astronomical observation/model')
            }
            if (/專題|跨域/.test(title)) {
              if (!['data-project', 'inquiry-measurement'].includes(inspected.familyId)) fail(unit.id, 'science-family-project', `family=${inspected.familyId}`)
              assertSignal(row, /探究|資料|量測|變因|模型|證據|研究/, 'science-project-signal', 'inquiry/data/model evidence for cross-domain project')
            }
          }

          if (route.subject === 'social') {
            if (/地圖|位置|空間資料|地理資訊/.test(title)) {
              if (inspected.familyId !== 'map-spatial') fail(unit.id, 'social-family-map', `family=${inspected.familyId}`)
              assertSignal(row, /地圖|比例尺|位置|空間|尺度/, 'social-map-signal', 'map/scale/spatial evidence')
            }
            const explicitLawTitle = /法律|法治/.test(title) || (/權利|人權/.test(title) && route.pathway === 'civics' && !/民主|治理/.test(title))
            if (explicitLawTitle) {
              if (inspected.familyId !== 'law-rights') fail(unit.id, 'social-family-law', `family=${inspected.familyId}`)
              assertSignal(row, /法律|法治|權利|程序|權益/, 'social-law-signal', 'law/rights/procedure')
            }
            if (/史料|歷史解釋/.test(title)) {
              if (inspected.familyId !== 'history-source') fail(unit.id, 'social-family-source', `family=${inspected.familyId}`)
              assertSignal(row, /史料|來源|作者|社論|統計|回憶|交叉檢證/, 'social-source-signal', 'source criticism')
            }
            if (route.pathway === 'history' && inspected.familyId === 'law-rights') fail(unit.id, 'social-history-pathway-misclassified', 'history pathway unit must not collapse into civics law-rights merely because its focus mentions rights')
            if (route.pathway === 'geography' && ['law-rights', 'government-democracy'].includes(inspected.familyId)) fail(unit.id, 'social-geography-pathway-misclassified', `geography pathway family=${inspected.familyId}`)
          }
        }
      }
    }
  }

  stats.internalReady = status.V20_INTERNAL_READY_UNITS instanceof Set ? status.V20_INTERNAL_READY_UNITS.size : 0
  stats.humanVerified = status.V20_HUMAN_VERIFIED_UNITS instanceof Set ? status.V20_HUMAN_VERIFIED_UNITS.size : 0
} finally {
  await server.close()
}

console.log('[curriculum-v21] SUBJECT-SPECIFIC REBUILD AUDIT')
console.log(JSON.stringify(stats, null, 2))
console.log('[curriculum-v21] family distribution')
for (const [key, value] of Object.entries(stats.familyCounts).sort()) console.log(`- ${key}: ${value}`)
if (findings.length) {
  console.log('[curriculum-v21] findings')
  for (const finding of findings.slice(0, 150)) console.log(`- ${finding.unitId} | ${finding.code}: ${finding.detail}`)
  if (findings.length > 150) console.log(`- ... ${findings.length - 150} more`)
}

const expectedSubjects = { chinese: 72, english: 72, math: 87, science: 126, social: 96 }
const topFailures = []
if (stats.active !== 453 || stats.ready !== 453 || stats.familyResolved !== 453) topFailures.push(`coverage active=${stats.active}, ready=${stats.ready}, family=${stats.familyResolved}`)
for (const [subject, expected] of Object.entries(expectedSubjects)) if (stats.bySubject[subject] !== expected) topFailures.push(`${subject}=${stats.bySubject[subject]}/${expected}`)
if (stats.workedExamples < 1812) topFailures.push(`workedExamples=${stats.workedExamples}`)
if (stats.questions < 9000) topFailures.push(`questions=${stats.questions}`)
if (stats.quickChecks < 2700) topFailures.push(`quickChecks=${stats.quickChecks}`)
if (stats.responseQuestions < 1300) topFailures.push(`responseQuestions=${stats.responseQuestions}`)
if (stats.visuals < 1359) topFailures.push(`visuals=${stats.visuals}`)
if (stats.internalReady !== 0 || stats.humanVerified !== 0) topFailures.push(`V20 status auto-promoted internal=${stats.internalReady}, human=${stats.humanVerified}`)
if (findings.length) topFailures.push(`unit-alignment findings=${findings.length}`)

if (topFailures.length) {
  console.error('[curriculum-v21] FAILED rebuild gate')
  for (const item of topFailures) console.error(`- ${item}`)
  process.exit(1)
}
console.log('[curriculum-v21] PASSED: 453 units resolve to subject knowledge families and pass structural/sentinel alignment. V20 readiness remains intentionally 0.')
