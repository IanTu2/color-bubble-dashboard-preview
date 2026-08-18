import { createServer } from 'vite'

const server = await createServer({ logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })
const normalize = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()
const signature = (question) => JSON.stringify({
  context: normalize(question.context),
  prompt: normalize(question.prompt),
  answerShape: question.kind === 'choice'
    ? { kind: 'choice', options: (question.options ?? []).map(normalize) }
    : { kind: 'response', sampleAnswer: normalize(question.sampleAnswer) },
})
const exampleText = (example) => ['title', 'context', 'prompt', 'answer', 'explanation'].map((key) => normalize(example?.[key])).join(' ')
const unitTopic = (row) => normalize(`${row.unit.title} ${row.unit.focus} ${(row.content?.concepts ?? []).map((item) => item.title).join(' ')}`)

const genericExamplePatterns = {
  chinese: /處理「[^」]+」的文本或表達任務時，學生要利用「[^」]+」找出具體詞句、篇章結構或上下文線索/,
  english: /a learner communicates about .*The learner must use/i,
  science: /探究「[^」]+」時，學生留下可比較的觀察或量測紀錄/,
  social: /討論「[^」]+」時，手上有不同時間、地點、來源或群體的資料/,
}
const conceptClosures = {
  chinese: '重點是回到完整語境',
  english: 'Connect meaning, form, word order, time clues, reference, and register',
  math: '重點是把條件轉成可檢查的數學表示',
  science: '重點是把觀察、模型與推論分開',
  social: '重點是連同來源、時間、空間尺度與不同群體觀點判讀資料',
}
const genericMisconceptionVisual = /只要記住「.*?」的最後結論，就不需要重新檢查題目條件、文本或證據/

function mathMismatch(row, example) {
  const topic = unitTopic(row)
  const text = exampleText(example)
  const issues = []

  const materialSubtraction = /(?:準備了|共有)\s*\d+\s*份材料|\d+\s*份材料.*(?:用掉|用了).*剩下/.test(text)
  if (materialSubtraction && !/(加法|減法|加減|四則|整數|負數|有理數|小數|分數|計算|估算|應用題|數與量|100\s*以內|1000\s*以內|10000\s*以內)/.test(topic)) {
    issues.push('generic-material-subtraction-not-unit-goal')
  }

  const sciNotation = /(科學記號|×\s*10\s*\^|10\s*的\s*\d+\s*次方|10\^)/.test(text)
  if (sciNotation && !/(科學記號|指數|次方|極大|極小|10\s*的次方)/.test(topic)) issues.push('scientific-notation-outside-unit-goal')

  const rectangleArea = /(長方形).*(?:長|寬).*面積|面積.*長方形/.test(text)
  if (rectangleArea && !/(面積|長方形|周長|平方|平面圖形|幾何|測量)/.test(topic)) issues.push('rectangle-area-outside-unit-goal')

  const medianTask = /中位數/.test(text)
  if (medianTask && !/(資料|統計|中位數|四分位|分布|集中量)/.test(topic)) issues.push('median-outside-unit-goal')

  const percentTask = /(百分率|百分比|\d+(?:\.\d+)?%)/.test(text)
  if (percentTask && !/(百分|比率|比例|資料|統計|機率|分數|小數|折扣|成數)/.test(topic)) issues.push('percentage-outside-unit-goal')

  if (/100\s*以內/.test(topic)) {
    const nums = (text.match(/\d+(?:\.\d+)?/g) ?? []).map(Number)
    if (nums.some((value) => value > 100)) issues.push('example-exceeds-100-within-unit-range')
  }
  if (/1000\s*以內/.test(topic)) {
    const nums = (text.match(/\d+(?:\.\d+)?/g) ?? []).map(Number)
    if (nums.some((value) => value > 1000)) issues.push('example-exceeds-1000-within-unit-range')
  }
  if (/10000\s*以內/.test(topic)) {
    const nums = (text.match(/\d+(?:\.\d+)?/g) ?? []).map(Number)
    if (nums.some((value) => value > 10000)) issues.push('example-exceeds-10000-within-unit-range')
  }
  return issues
}

const rows = []
try {
  const plan = await server.ssrLoadModule('/src/curriculum-plan-v5.ts')
  const pedagogy = await server.ssrLoadModule('/src/curriculum-pedagogy-v18.ts')
  for (let grade = 1; grade <= 12; grade += 1) {
    for (const route of plan.getCurriculumRouteOptions(grade)) {
      const track = plan.getCurriculumTrack(grade, route.subject, route.pathway)
      if (!track) continue
      for (const semester of track.semesters) {
        for (const unit of semester.units) {
          const inspected = pedagogy.inspectTextbookUnitV18(unit.id)
          if (!inspected?.validation?.ready || !inspected.unit) throw new Error(`V18 unit unavailable: ${unit.id}`)
          rows.push({ grade, semester: semester.semester, subject: route.subject, pathway: route.pathway ?? null, unit, content: inspected.unit })
        }
      }
    }
  }
} finally {
  await server.close()
}

if (rows.length !== 453) throw new Error(`Expected 453 units, got ${rows.length}`)

// Pass 1: identify exact learner-question reuse across unit boundaries.
const signatureUnits = new Map()
for (const row of rows) {
  for (const question of row.content.questions) {
    const sig = signature(question)
    if (!signatureUnits.has(sig)) signatureUnits.set(sig, new Set())
    signatureUnits.get(sig).add(row.unit.id)
  }
}

const findings = []
const stats = {
  units: rows.length,
  questions: 0,
  uniqueQuestionExperiences: signatureUnits.size,
  crossUnitReusedQuestionInstances: 0,
  unitsWithMajorQuestionReuse: 0,
  genericWorkedExamples: 0,
  workedExamples: 0,
  unitsWithMajorGenericExamples: 0,
  mathExampleMismatchInstances: 0,
  mathUnitsWithExampleMismatch: 0,
  genericMisconceptionVisualUnits: 0,
  conceptBoilerplateConcepts: 0,
  concepts: 0,
  bySubject: {},
}

for (const row of rows) {
  const subject = row.subject
  const subjectStats = stats.bySubject[subject] ??= {
    units: 0, questions: 0, reusedQuestions: 0, majorReuseUnits: 0,
    workedExamples: 0, genericWorkedExamples: 0, majorGenericExampleUnits: 0,
    mathMismatchUnits: 0, genericMisconceptionVisualUnits: 0,
    concepts: 0, conceptBoilerplateConcepts: 0,
  }
  subjectStats.units += 1

  const questions = row.content.questions ?? []
  const reused = questions.filter((question) => (signatureUnits.get(signature(question))?.size ?? 0) > 1).length
  const reuseFraction = questions.length ? reused / questions.length : 0
  stats.questions += questions.length
  stats.crossUnitReusedQuestionInstances += reused
  subjectStats.questions += questions.length
  subjectStats.reusedQuestions += reused
  if (reuseFraction >= 0.5) {
    stats.unitsWithMajorQuestionReuse += 1
    subjectStats.majorReuseUnits += 1
    findings.push({ severity: 'P1', unitId: row.unit.id, code: 'cross-unit-question-bank-reuse', detail: `${reused}/${questions.length} (${Math.round(reuseFraction * 100)}%) learner questions are exact experiences reused in other units.` })
  }

  const examples = row.content.workedExamples ?? []
  stats.workedExamples += examples.length
  subjectStats.workedExamples += examples.length
  const genericPattern = genericExamplePatterns[subject]
  const genericCount = genericPattern ? examples.filter((example) => genericPattern.test(exampleText(example))).length : 0
  stats.genericWorkedExamples += genericCount
  subjectStats.genericWorkedExamples += genericCount
  if (examples.length && genericCount / examples.length >= 0.5) {
    stats.unitsWithMajorGenericExamples += 1
    subjectStats.majorGenericExampleUnits += 1
    findings.push({ severity: 'P1', unitId: row.unit.id, code: 'generic-worked-example-template', detail: `${genericCount}/${examples.length} worked examples describe a generic learning situation instead of supplying the actual text/dialogue/data/evidence needed to demonstrate the unit concept.` })
  }

  if (subject === 'math') {
    const mismatches = examples.flatMap((example) => mathMismatch(row, example))
    if (mismatches.length) {
      stats.mathExampleMismatchInstances += mismatches.length
      stats.mathUnitsWithExampleMismatch += 1
      subjectStats.mathMismatchUnits += 1
      findings.push({ severity: 'P1', unitId: row.unit.id, code: 'math-worked-example-goal-mismatch', detail: Array.from(new Set(mismatches)).join(', ') })
    }
  }

  const visuals = row.content.visuals ?? []
  const hasGenericMisconception = visuals.some((visual) => genericMisconceptionVisual.test((visual.items ?? []).map((item) => `${normalize(item.label)} ${normalize(item.detail)}`).join(' ')))
  if (hasGenericMisconception) {
    stats.genericMisconceptionVisualUnits += 1
    subjectStats.genericMisconceptionVisualUnits += 1
    findings.push({ severity: 'P1', unitId: row.unit.id, code: 'generic-meta-misconception-visual', detail: 'The “common misconception” visual teaches a generic check-your-conditions habit rather than a concrete misconception of this unit.' })
  }

  const concepts = row.content.concepts ?? []
  const closure = conceptClosures[subject]
  const boilerplate = closure ? concepts.filter((concept) => normalize(concept.explanation).includes(closure)).length : 0
  stats.concepts += concepts.length
  stats.conceptBoilerplateConcepts += boilerplate
  subjectStats.concepts += concepts.length
  subjectStats.conceptBoilerplateConcepts += boilerplate
  if (concepts.length && boilerplate === concepts.length) {
    findings.push({ severity: 'P2', unitId: row.unit.id, code: 'subject-wide-concept-boilerplate', detail: 'Every concept repeats the same subject-level closing paragraph; this inflates text and weakens concept-specific editorial precision.' })
  }
}

const pct = (a, b) => b ? `${(a / b * 100).toFixed(1)}%` : '0.0%'
console.log('[curriculum-v20-content] SECOND-LAYER FULL CONTENT AUDIT')
console.log(JSON.stringify({
  ...stats,
  reusedQuestionPct: pct(stats.crossUnitReusedQuestionInstances, stats.questions),
  genericWorkedExamplePct: pct(stats.genericWorkedExamples, stats.workedExamples),
  conceptBoilerplatePct: pct(stats.conceptBoilerplateConcepts, stats.concepts),
}, null, 2))
console.log('[curriculum-v20-content] per-subject')
for (const [subject, item] of Object.entries(stats.bySubject)) {
  console.log(`- ${subject}: questions reused ${item.reusedQuestions}/${item.questions} (${pct(item.reusedQuestions,item.questions)}); generic examples ${item.genericWorkedExamples}/${item.workedExamples} (${pct(item.genericWorkedExamples,item.workedExamples)}); major-reuse units ${item.majorReuseUnits}/${item.units}; generic-misconception visuals ${item.genericMisconceptionVisualUnits}/${item.units}; concept boilerplate ${item.conceptBoilerplateConcepts}/${item.concepts}`)
}
const codeCounts = {}
for (const finding of findings) codeCounts[finding.code] = (codeCounts[finding.code] ?? 0) + 1
console.log('[curriculum-v20-content] finding counts', JSON.stringify(codeCounts, null, 2))
console.log('[curriculum-v20-content] selected math mismatches')
for (const finding of findings.filter((item) => item.code === 'math-worked-example-goal-mismatch').slice(0, 50)) console.log(`- ${finding.unitId}: ${finding.detail}`)

// These are review findings, not CI-failure conditions. Coverage/instrumentation is the gate.
if (stats.questions !== 6903 || stats.units !== 453 || !findings.length) {
  console.error('[curriculum-v20-content] FAILED coverage/instrumentation regression')
  process.exit(1)
}
if (stats.crossUnitReusedQuestionInstances < 1 || stats.genericMisconceptionVisualUnits < 1) {
  console.error('[curriculum-v20-content] FAILED: expected V20 content-quality findings were not detected')
  process.exit(1)
}
console.log('[curriculum-v20-content] PASSED audit coverage: systemic V20 content findings are explicitly surfaced; this does NOT mean the findings are resolved.')
