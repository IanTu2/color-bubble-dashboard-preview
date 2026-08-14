import { readFile } from 'node:fs/promises'
import { createServer } from 'vite'

const server = await createServer({ logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })

const legacyPromptPatterns = [
  /^下列哪個敘述最符合「/,
  /^哪個例子最能直接說明「/,
  /^同學說：「.+」哪個修正最完整？$/,
  /^這個情境如何呈現「/,
  /^針對「.+」，請說明你會先檢查什麼/,
]
const legacyOptionPatterns = [
  /只背最後答案，不檢查條件/,
  /忽略題目提供的限制，直接猜結論/,
  /不符合本題條件的說法/,
  /不使用.+已提供的任何概念或證據/,
]
const legacyFeedbackPatterns = [
  /這個選項沒有同時符合題目條件與教材定義/,
  /這個選項沒有同時符合題目條件與本單元概念/,
]
const genericConceptPatterns = [
  /學習不能只背最後一句，而要依/,
  /例如遇到「.+」的新情境時，先找出/,
  /核心觀念(?:｜關係 \d+)?$/,
]

const normalize = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()
const ratio = (a, b) => b ? a / b : 0
const pct = (value) => `${Math.round(value * 100)}%`

function unitPhrases(unit) {
  return `${unit.title}。${unit.focus}`
    .split(/[。；，、：:（）()／/]|以及|並且|並|與|和/)
    .map(normalize)
    .filter((item) => item.length >= 2 && item.length <= 30)
}

function hasUnitPhrase(text, phrases) {
  const source = normalize(text)
  return phrases.some((phrase) => source.includes(phrase))
}

function specializedVisualKind(subject, text) {
  if (subject === 'math') {
    if (/座標|函數|斜率|趨勢|幾何|角|三角|圓|多邊形|面積|周長|相似|全等|數線|正負|整數|分數|小數|有理數/.test(text)) return true
    return false
  }
  if (subject === 'science') {
    if (/電路|電流|電壓|電阻|串聯|並聯|粒子|原子|分子|元素|化學|溶液|物質|力|運動|速度|加速度|位移|慣性/.test(text)) return true
    return false
  }
  if (subject === 'social') return /歷史|年代|時代|事件|朝代|演變|變遷/.test(text)
  return false
}

const stats = {
  activeUnits: 0,
  resolvedUnits: 0,
  legacyTemplateUnits: 0,
  weakConceptSpecificityUnits: 0,
  weakQuestionContextUnits: 0,
  weakExampleSpecificityUnits: 0,
  richVisualExpectedUnits: 0,
  richVisualRenderedUnits: 0,
  specializedVisualUnits: 0,
  genericDiagramUnits: 0,
  pacingRisk: false,
  totalQuestions: 0,
  v17GeneratedQuestions: 0,
  contextualQuestions: 0,
  bySubject: {},
}
const findings = []

try {
  const plan = await server.ssrLoadModule('/src/curriculum-plan-v5.ts')
  const pedagogy = await server.ssrLoadModule('/src/curriculum-pedagogy-v17.ts')

  const readerSource = await readFile(new URL('../src/components/CurriculumCourseAppV17.tsx', import.meta.url), 'utf8')
  const visualSource = await readFile(new URL('../src/components/CurriculumPedagogyVisualV17.tsx', import.meta.url), 'utf8')
  const hasInlineChecks = readerSource.includes('quickCheck') && readerSource.includes('renderQuestion(page.quickCheck)')
  const hasRichVisualRenderer = visualSource.includes('data-v17-rich-visual="true"')
    && visualSource.includes('CoordinateDiagram')
    && visualSource.includes('CircuitDiagram')
    && visualSource.includes('TimelineDiagram')
  stats.pacingRisk = !hasInlineChecks

  for (let grade = 1; grade <= 12; grade += 1) {
    for (const route of plan.getCurriculumRouteOptions(grade)) {
      const track = plan.getCurriculumTrack(grade, route.subject, route.pathway)
      if (!track) continue
      for (const semester of track.semesters) {
        for (const unit of semester.units) {
          stats.activeUnits += 1
          const subject = route.subject
          const subjectStats = stats.bySubject[subject] ??= {
            units: 0,
            legacyTemplates: 0,
            weakConcepts: 0,
            weakQuestions: 0,
            weakExamples: 0,
            richVisuals: 0,
            specializedVisuals: 0,
            genericDiagrams: 0,
          }
          subjectStats.units += 1

          const inspected = pedagogy.inspectTextbookUnitV17(unit.id)
          if (!inspected?.unit || !inspected.validation?.ready) {
            findings.push({ unitId: unit.id, grade, subject, severity: 'critical', reasons: ['V17 content cannot pass V14 structural validator'] })
            continue
          }
          stats.resolvedUnits += 1
          const content = inspected.unit
          const phrases = unitPhrases(unit)
          const reasons = []

          const genericConcepts = content.concepts.filter((concept) => genericConceptPatterns.some((pattern) => pattern.test(`${concept.title} ${concept.explanation} ${concept.example ?? ''}`))).length
          const specificConcepts = content.concepts.filter((concept) => hasUnitPhrase(`${concept.title} ${concept.explanation} ${concept.example ?? ''}`, phrases)).length
          if (genericConcepts > 0 || specificConcepts < Math.min(4, content.concepts.length)) {
            stats.weakConceptSpecificityUnits += 1
            subjectStats.weakConcepts += 1
            reasons.push(`concept specificity still needs review (generic ${genericConcepts}/${content.concepts.length}, unit-linked ${specificConcepts}/${content.concepts.length})`)
          }

          const legacyPrompts = content.questions.filter((question) => legacyPromptPatterns.some((pattern) => pattern.test(question.prompt))).length
          const choiceQuestions = content.questions.filter((question) => question.kind === 'choice')
          const legacyOptions = choiceQuestions.flatMap((question) => question.options).filter((option) => legacyOptionPatterns.some((pattern) => pattern.test(option))).length
          const allOptions = choiceQuestions.flatMap((question) => question.options).length
          const legacyFeedback = choiceQuestions.flatMap((question) => question.optionFeedback ?? []).filter((feedback) => legacyFeedbackPatterns.some((pattern) => pattern.test(feedback))).length
          const allFeedback = choiceQuestions.flatMap((question) => question.optionFeedback ?? []).length
          if (legacyPrompts || legacyOptions || legacyFeedback) {
            stats.legacyTemplateUnits += 1
            subjectStats.legacyTemplates += 1
            reasons.push(`legacy templates remain (prompts ${legacyPrompts}, options ${pct(ratio(legacyOptions, allOptions))}, feedback ${pct(ratio(legacyFeedback, allFeedback))})`)
          }

          stats.totalQuestions += content.questions.length
          stats.v17GeneratedQuestions += content.questions.filter((question) => question.id.includes('-ped-v17-')).length
          const contextualQuestions = content.questions.filter((question) => {
            const contextText = normalize(question.context)
            if (contextText.length < 18) return false
            const combined = `${contextText} ${question.prompt}`
            return hasUnitPhrase(combined, phrases)
              || question.id.includes('-ped-v17-') && !/本單元範圍：/.test(contextText)
          }).length
          stats.contextualQuestions += contextualQuestions
          if (ratio(contextualQuestions, content.questions.length) < 0.75) {
            stats.weakQuestionContextUnits += 1
            subjectStats.weakQuestions += 1
            reasons.push(`contextual question coverage ${contextualQuestions}/${content.questions.length} < 75%`)
          }

          const specificExamples = content.workedExamples.filter((example) => hasUnitPhrase(`${example.title} ${example.context} ${example.prompt} ${example.answer}`, phrases)).length
          if (specificExamples < Math.ceil(content.workedExamples.length * 0.8)) {
            stats.weakExampleSpecificityUnits += 1
            subjectStats.weakExamples += 1
            reasons.push(`unit-linked examples ${specificExamples}/${content.workedExamples.length} < 80%`)
          }

          if (['math', 'science', 'social'].includes(subject)) {
            stats.richVisualExpectedUnits += 1
            if (hasRichVisualRenderer && content.visuals.length >= 3) {
              stats.richVisualRenderedUnits += 1
              subjectStats.richVisuals += 1
            }
            const visualText = `${unit.title} ${unit.focus} ${content.visuals.map((visual) => `${visual.title} ${visual.items.map((item) => item.label).join(' ')}`).join(' ')}`
            if (specializedVisualKind(subject, visualText)) {
              stats.specializedVisualUnits += 1
              subjectStats.specializedVisuals += 1
            } else {
              stats.genericDiagramUnits += 1
              subjectStats.genericDiagrams += 1
              reasons.push('rich SVG exists, but this unit still uses the generic subject diagram rather than a specialized domain diagram')
            }
          }

          if (reasons.length) findings.push({
            unitId: unit.id,
            grade,
            subject,
            title: unit.title,
            severity: reasons.length >= 3 ? 'high' : 'medium',
            reasons,
          })
        }
      }
    }
  }
} finally {
  await server.close()
}

console.log('[curriculum-pedagogy-v17] post-revision pedagogical audit')
console.log(JSON.stringify(stats, null, 2))
console.log(`[curriculum-pedagogy-v17] V17-generated question share: ${pct(ratio(stats.v17GeneratedQuestions, stats.totalQuestions))}`)
console.log(`[curriculum-pedagogy-v17] contextual question coverage: ${pct(ratio(stats.contextualQuestions, stats.totalQuestions))}`)
console.log(`[curriculum-pedagogy-v17] rich visual renderer coverage: ${stats.richVisualRenderedUnits}/${stats.richVisualExpectedUnits}`)
console.log(`[curriculum-pedagogy-v17] specialized visual coverage: ${stats.specializedVisualUnits}/${stats.richVisualExpectedUnits}; generic diagram follow-up: ${stats.genericDiagramUnits}`)
if (stats.pacingRisk) console.log('[curriculum-pedagogy-v17] GLOBAL: immediate retrieval/check is not interleaved.')
else console.log('[curriculum-pedagogy-v17] GLOBAL: concept teaching now interleaves immediate quick checks in the learner reader.')
console.log(`[curriculum-pedagogy-v17] units with remaining pedagogical findings: ${findings.length}/${stats.activeUnits}`)
for (const item of findings.slice(0, 120)) console.log(`- [${item.severity}] ${item.unitId} ${item.title}: ${item.reasons.join(' | ')}`)
if (findings.length > 120) console.log(`- ... ${findings.length - 120} more units`)

const critical = findings.filter((item) => item.severity === 'critical')
if (stats.activeUnits !== 453 || stats.resolvedUnits !== 453 || critical.length || stats.pacingRisk) {
  console.error('[curriculum-pedagogy-v17] FAILED: runtime integrity or learner-flow regression')
  process.exit(1)
}

console.log('[curriculum-pedagogy-v17] runtime and learner-flow gates passed; remaining quality findings stay visible for the next editorial pass.')
