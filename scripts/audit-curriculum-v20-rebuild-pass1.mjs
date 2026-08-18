import { createServer } from 'vite'

const server = await createServer({ logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })
const normalize = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()
const signature = (q) => JSON.stringify({ context: normalize(q.context), prompt: normalize(q.prompt), answer: q.kind === 'choice' ? q.options?.map(normalize) : normalize(q.sampleAnswer) })
const oldClosures = /重點是回到完整語境|Connect meaning, form, word order, time clues, reference, and register|重點是把條件轉成可檢查的數學表示|重點是把觀察、模型與推論分開|重點是連同來源、時間、空間尺度與不同群體觀點判讀資料/
const genericMisconception = /只要記住「.*?」的最後結論，就不需要重新檢查題目條件、文本或證據/
const oldGenericExample = /處理「[^」]+」的文本或表達任務時|a learner communicates about|探究「[^」]+」時，學生留下可比較的觀察或量測紀錄|討論「[^」]+」時，手上有不同時間、地點、來源或群體的資料/

const rows = []
try {
  const plan = await server.ssrLoadModule('/src/curriculum-plan-v5.ts')
  const runtime = await server.ssrLoadModule('/src/curriculum-textbook-v20-runtime.ts')
  for (let grade = 1; grade <= 12; grade += 1) {
    for (const route of plan.getCurriculumRouteOptions(grade)) {
      const track = plan.getCurriculumTrack(grade, route.subject, route.pathway)
      if (!track) continue
      for (const semester of track.semesters) {
        for (const unit of semester.units) {
          const inspected = runtime.inspectTextbookUnitV20(unit.id)
          if (!inspected?.unit) throw new Error(`V20 runtime missing ${unit.id}`)
          rows.push({ grade, subject: route.subject, pathway: route.pathway ?? null, unit, content: inspected.unit })
        }
      }
    }
  }
} finally {
  await server.close()
}

if (rows.length !== 453) throw new Error(`Expected 453 units; got ${rows.length}`)

const sigUnits = new Map()
for (const row of rows) for (const q of row.content.questions) {
  const key = signature(q)
  if (!sigUnits.has(key)) sigUnits.set(key, new Set())
  sigUnits.get(key).add(row.unit.id)
}

const stats = {
  units: rows.length,
  questions: 0,
  reusedQuestionInstances: 0,
  majorReuseUnits: 0,
  workedExamples: 0,
  oldGenericWorkedExamples: 0,
  genericMisconceptionVisualUnits: 0,
  oldConceptBoilerplate: 0,
  concepts: 0,
  mathFallbackUnits: new Set(),
  englishFallbackUnits: new Set(),
  socialFallbackUnits: new Set(),
  bySubject: {},
}

for (const row of rows) {
  const subjectStats = stats.bySubject[row.subject] ??= { units: 0, questions: 0, reused: 0, majorReuseUnits: 0, examples: 0, genericExamples: 0, fallbackUnits: new Set() }
  subjectStats.units += 1
  const questions = row.content.questions ?? []
  const reused = questions.filter((q) => (sigUnits.get(signature(q))?.size ?? 0) > 1).length
  stats.questions += questions.length
  stats.reusedQuestionInstances += reused
  subjectStats.questions += questions.length
  subjectStats.reused += reused
  if (questions.length && reused / questions.length >= 0.5) {
    stats.majorReuseUnits += 1
    subjectStats.majorReuseUnits += 1
  }

  for (const example of row.content.workedExamples ?? []) {
    const text = normalize(`${example.context} ${example.prompt} ${example.explanation}`)
    stats.workedExamples += 1
    subjectStats.examples += 1
    if (oldGenericExample.test(text)) {
      stats.oldGenericWorkedExamples += 1
      subjectStats.genericExamples += 1
    }
    if (/V20 第一輪保底題/.test(text)) { stats.mathFallbackUnits.add(row.unit.id); subjectStats.fallbackUnits.add(row.unit.id) }
    if (/fallback keeps the item tied|later human rewrite/.test(text)) { stats.englishFallbackUnits.add(row.unit.id); subjectStats.fallbackUnits.add(row.unit.id) }
    if (/社會科判讀要先確認來源、時間、空間尺度/.test(text) && /本單元/.test(text)) { stats.socialFallbackUnits.add(row.unit.id); subjectStats.fallbackUnits.add(row.unit.id) }
  }

  const visualText = (row.content.visuals ?? []).flatMap((v) => v.items ?? []).map((item) => `${item.label} ${item.detail}`).join(' ')
  if (genericMisconception.test(visualText)) stats.genericMisconceptionVisualUnits += 1

  for (const concept of row.content.concepts ?? []) {
    stats.concepts += 1
    if (oldClosures.test(normalize(concept.explanation))) stats.oldConceptBoilerplate += 1
  }
}

const pct = (a, b) => b ? +(a / b * 100).toFixed(1) : 0
const output = {
  units: stats.units,
  questions: stats.questions,
  uniqueQuestionExperiences: sigUnits.size,
  reusedQuestionInstances: stats.reusedQuestionInstances,
  reusedQuestionPct: pct(stats.reusedQuestionInstances, stats.questions),
  majorReuseUnits: stats.majorReuseUnits,
  workedExamples: stats.workedExamples,
  oldGenericWorkedExamples: stats.oldGenericWorkedExamples,
  oldGenericWorkedExamplePct: pct(stats.oldGenericWorkedExamples, stats.workedExamples),
  genericMisconceptionVisualUnits: stats.genericMisconceptionVisualUnits,
  oldConceptBoilerplate: stats.oldConceptBoilerplate,
  concepts: stats.concepts,
  remainingSpecialization: {
    mathFallbackUnits: stats.mathFallbackUnits.size,
    englishFallbackUnits: stats.englishFallbackUnits.size,
    socialFallbackUnits: stats.socialFallbackUnits.size,
  },
}
console.log('[curriculum-v20-rebuild] learner-facing pass-1 audit')
console.log(JSON.stringify(output, null, 2))
for (const [subject, item] of Object.entries(stats.bySubject)) {
  console.log(`- ${subject}: reused ${item.reused}/${item.questions} (${pct(item.reused,item.questions)}%); major reuse ${item.majorReuseUnits}/${item.units}; old generic examples ${item.genericExamples}/${item.examples}; remaining fallback units ${item.fallbackUnits.size}`)
}

// Pass 1 must materially remove the systemic V20 failures. This does NOT grant readiness.
if (stats.questions < 6000 || stats.reusedQuestionInstances / stats.questions > 0.50) {
  console.error('[curriculum-v20-rebuild] FAILED: cross-unit exact question reuse remains above 50%')
  process.exit(1)
}
if (stats.oldGenericWorkedExamples / Math.max(1, stats.workedExamples) > 0.05) {
  console.error('[curriculum-v20-rebuild] FAILED: old generic worked-example templates remain above 5%')
  process.exit(1)
}
if (stats.genericMisconceptionVisualUnits !== 0 || stats.oldConceptBoilerplate !== 0) {
  console.error('[curriculum-v20-rebuild] FAILED: old generic misconception visual or concept boilerplate still reaches learner-facing V20')
  process.exit(1)
}
console.log('[curriculum-v20-rebuild] PASS: systemic baseline failures materially reduced. All units remain v20-reviewing; fallbacks listed above still require subject/editorial work.')
