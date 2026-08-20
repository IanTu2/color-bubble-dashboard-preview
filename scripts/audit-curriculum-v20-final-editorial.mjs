import { writeFile } from 'node:fs/promises'
import { createServer } from 'vite'

const normalize = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()
const uniq = (items) => Array.from(new Set(items))
const placeholder = /(待補|TODO|TBD|placeholder|教材準備中|依題目而異|依圖表而異|依文本而異|其他不符合條件的結果)/i
const fallback = /(V20 第一輪保底題|V20 .*fallback|later human rewrite|仍需人工改成真正專屬題型|仍是 V20 明確標記的 fallback)/i
const oldClosure = /(重點是回到完整語境|Connect meaning, form, word order, time clues, reference, and register|重點是把條件轉成可檢查的數學表示|重點是把觀察、模型與推論分開|重點是連同來源、時間、空間尺度與不同群體觀點判讀資料)/i
const oldMisconception = /只要記住「.*?」的最後結論，就不需要重新檢查題目條件、文本或證據/
const missingMaterial = /(根據下圖|依下圖|觀察下圖|請看下圖|如圖所示|依附圖|請聽音檔|依音檔)/i
const materialPayload = /(mediaAssetId|audioText)/

function questionSignature(q) {
  return JSON.stringify({
    context: normalize(q.context),
    prompt: normalize(q.prompt),
    answer: q.kind === 'choice' ? (q.options ?? []).map(normalize) : normalize(q.sampleAnswer),
  })
}

function learnerCore(text) {
  return normalize(text)
    .replace(/^Unit focus:[^.]+\.\s*Target:[^.]+\.\s*Use this task only as evidence for the lesson focus “[^”]+”\.\s*/i, '')
    .replace(/^這題屬於「[^」]+」的「[^」]+」；數值與表示必須在本單元焦點「[^」]+」的範圍內解讀。\s*/, '')
    .replace(/^這份觀察／資料用來檢查「[^」]+」中的「[^」]+」；結論只能落在「[^」]+」可支持的範圍。\s*/, '')
    .replace(/^這份資料屬於「[^」]+」的「[^」]+」；判讀時要連同本單元焦點「[^」]+」的時間、空間或制度脈絡。\s*/, '')
    .replace(/^這段素材屬於「[^」]+」的「[^」]+」；解讀與表達須回到本單元焦點「[^」]+」。\s*/, '')
}

function scoreUnit(record) {
  const dimensions = {
    correctness: 4,
    scopeAlignment: 4,
    prerequisiteContinuity: 4,
    visualMeaning: 4,
    workedExamples: 4,
    questionBank: 4,
    difficultyProgression: 4,
    publicationQuality: 4,
  }
  for (const finding of record.findings) {
    const severityPenalty = finding.severity === 'P0' ? 4 : finding.severity === 'P1' ? 2 : 1
    const key = finding.dimension
    if (key && key in dimensions) dimensions[key] = Math.max(0, dimensions[key] - severityPenalty)
  }
  const weights = {
    correctness: 25,
    scopeAlignment: 15,
    prerequisiteContinuity: 10,
    visualMeaning: 10,
    workedExamples: 10,
    questionBank: 15,
    difficultyProgression: 5,
    publicationQuality: 10,
  }
  let weighted = 0
  for (const [key, weight] of Object.entries(weights)) weighted += dimensions[key] / 4 * weight
  return { dimensions, weightedScore: Math.round(weighted * 10) / 10 }
}

const server = await createServer({ logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })
const records = []
const sigUnits = new Map()

try {
  const plan = await server.ssrLoadModule('/src/curriculum-plan-v5.ts')
  const final = await server.ssrLoadModule('/src/curriculum-textbook-v20-final.ts')

  for (let grade = 1; grade <= 12; grade += 1) {
    for (const route of plan.getCurriculumRouteOptions(grade)) {
      const track = plan.getCurriculumTrack(grade, route.subject, route.pathway)
      if (!track) continue
      for (const semester of track.semesters) {
        for (const unit of semester.units) {
          const content = final.getTextbookUnitContentV20Final(unit.id)
          const record = {
            unitId: unit.id,
            grade,
            semester: semester.semester,
            subject: route.subject,
            pathway: route.pathway ?? null,
            title: unit.title,
            focus: unit.focus,
            findings: [],
            counts: {},
          }
          const add = (severity, dimension, code, detail) => record.findings.push({ severity, dimension, code, detail })
          if (!content) {
            add('P0', 'correctness', 'missing-final-content', 'Learner-facing V20 final content is missing.')
            records.push(record)
            continue
          }

          const questions = content.questions ?? []
          const examples = content.workedExamples ?? []
          const concepts = content.concepts ?? []
          const misconceptions = content.misconceptions ?? []
          const visuals = content.visuals ?? []
          record.counts = { questions: questions.length, examples: examples.length, concepts: concepts.length, misconceptions: misconceptions.length, visuals: visuals.length }

          if (questions.length < 12) add('P1', 'questionBank', 'question-bank-too-small', `${questions.length} questions; V20 requires at least 12.`)
          if (examples.length < 2) add('P1', 'workedExamples', 'worked-examples-too-small', `${examples.length} worked examples; V20 requires at least 2.`)
          if (concepts.length < 3) add('P1', 'scopeAlignment', 'concept-set-too-small', `${concepts.length} concepts; unit scope is too thin.`)
          if (misconceptions.length < 2) add('P1', 'correctness', 'misconception-set-too-small', `${misconceptions.length} misconceptions; diagnostic coverage is too thin.`)
          if (!visuals.length) add('P1', 'visualMeaning', 'visuals-missing', 'No instructional visual is attached to the unit.')

          const sourceRefs = content.sourceRefs ?? []
          if (!sourceRefs.some((item) => /naer\.edu\.tw/i.test(normalize(item.url)))) add('P1', 'scopeAlignment', 'official-source-link-missing', 'No NAER official curriculum source appears in sourceRefs.')
          const evidence = content.v20ReviewEvidence
          if (!evidence?.scope?.sourceUrl || !/naer\.edu\.tw/i.test(evidence.scope.sourceUrl)) add('P1', 'scopeAlignment', 'final-scope-evidence-missing', 'V20 final scope evidence is missing an official NAER source URL.')
          if (!normalize(evidence?.scope?.mappingNote)) add('P1', 'scopeAlignment', 'scope-mapping-note-missing', 'V20 final scope mapping note is empty.')
          if (grade <= 2 && route.subject === 'english' && evidence?.scope?.mode !== 'platform-extension') add('P0', 'scopeAlignment', 'low-grade-english-overclaim', 'Grade 1–2 English must remain clearly marked as a platform/local extension.')
          for (const field of ['source', 'check', 'bridge']) {
            if (!normalize(evidence?.prerequisite?.[field])) add('P1', 'prerequisiteContinuity', `prerequisite-${field}-missing`, `Prerequisite ${field} is missing.`)
          }

          const prompts = new Map()
          const levels = new Set()
          for (const q of questions) {
            const prompt = normalize(q.prompt)
            const context = normalize(q.context)
            const body = normalize(`${context} ${prompt} ${q.kind === 'choice' ? (q.options ?? []).join(' ') : q.sampleAnswer} ${q.explanation}`)
            levels.add(normalize(q.level))
            prompts.set(prompt, (prompts.get(prompt) ?? 0) + 1)
            if (!prompt || placeholder.test(prompt)) add('P1', 'publicationQuality', 'bad-question-prompt', `${q.id}: empty/placeholder prompt.`)
            if (fallback.test(body)) add('P0', 'scopeAlignment', 'fallback-reaches-learner', `${q.id}: fallback marker reaches learner output.`)
            if (oldClosure.test(body)) add('P1', 'publicationQuality', 'old-boilerplate-reaches-learner', `${q.id}: old subject-wide closing boilerplate remains.`)
            if (missingMaterial.test(body) && !materialPayload.test(JSON.stringify(q))) add('P0', 'correctness', 'required-material-missing', `${q.id}: prompt references unavailable visual/audio material.`)
            if (q.kind === 'choice') {
              const options = (q.options ?? []).map(normalize)
              if (options.length !== 4) add('P1', 'questionBank', 'choice-option-count', `${q.id}: expected exactly four choices; got ${options.length}.`)
              if (uniq(options).length !== options.length) add('P0', 'correctness', 'duplicate-choice-options', `${q.id}: duplicate options.`)
              if (!Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex >= options.length) add('P0', 'correctness', 'invalid-answer-key', `${q.id}: correctIndex is invalid.`)
              if (!normalize(q.explanation)) add('P1', 'correctness', 'missing-explanation', `${q.id}: explanation missing.`)
            } else {
              if (!normalize(q.sampleAnswer)) add('P1', 'correctness', 'missing-sample-answer', `${q.id}: sample answer missing.`)
              if (!normalize(q.explanation)) add('P1', 'correctness', 'missing-response-explanation', `${q.id}: response explanation missing.`)
            }
            const sig = questionSignature(q)
            if (!sigUnits.has(sig)) sigUnits.set(sig, new Set())
            sigUnits.get(sig).add(unit.id)
          }
          if (levels.size < 3) add('P1', 'difficultyProgression', 'question-level-span', `Only ${levels.size} question level label(s) present.`)
          for (const [prompt, count] of prompts) if (prompt && count > Math.max(4, Math.ceil(questions.length * 0.45))) add('P1', 'questionBank', 'intra-unit-prompt-repetition', `${count}/${questions.length} questions reuse prompt “${prompt.slice(0, 80)}”.`)

          for (const example of examples) {
            const text = normalize(`${example.title} ${example.context} ${example.prompt} ${(example.steps ?? []).join(' ')} ${example.answer} ${example.explanation}`)
            if (fallback.test(text)) add('P0', 'workedExamples', 'fallback-example-reaches-learner', `${example.title}: fallback marker remains.`)
            if ((example.steps ?? []).length < 3) add('P1', 'workedExamples', 'thin-example-steps', `${example.title}: fewer than 3 worked steps.`)
            if (normalize(example.answer).length < 2 || normalize(example.explanation).length < 12) add('P1', 'workedExamples', 'thin-example-answer', `${example.title}: answer/explanation too thin.`)
          }

          const prose = normalize([
            content.overview,
            ...(content.objectives ?? []),
            ...concepts.flatMap((item) => [item.title, item.explanation, item.example]),
            ...misconceptions.flatMap((item) => [item.claim, item.correction, item.reason]),
            ...visuals.flatMap((item) => [item.title, item.caption, ...(item.items ?? []).flatMap((part) => [part.label, part.detail])]),
            ...(content.takeaway ?? []),
          ].join(' '))
          if (placeholder.test(prose)) add('P1', 'publicationQuality', 'editorial-placeholder', 'Unit prose contains placeholder/editorial residue.')
          if (fallback.test(prose)) add('P0', 'scopeAlignment', 'fallback-prose-reaches-learner', 'Unit prose contains a V20 fallback marker.')
          if (oldClosure.test(prose)) add('P1', 'publicationQuality', 'old-concept-closure', 'Old subject-wide concept closure remains in final content.')
          if (oldMisconception.test(prose)) add('P1', 'correctness', 'old-generic-misconception', 'Old generic “memorize the conclusion” misconception remains.')

          // Known confirmed contamination must stay fixed at the final learner layer.
          if (unit.id === 'g9-math-s1-u1') {
            const learner = normalize(`${examples.map((item) => `${item.context} ${item.prompt} ${item.answer} ${item.explanation}`).join(' ')} ${questions.map((q) => `${q.context} ${q.prompt} ${q.kind === 'choice' ? q.options?.join(' ') : q.sampleAnswer}`).join(' ')} ${prose}`)
            if (!/x²/.test(learner) || !/因式分解/.test(learner) || !/x\s*=/.test(learner)) add('P0', 'scopeAlignment', 'quadratic-evidence-missing', 'G9 quadratic unit is missing quadratic-equation evidence.')
            if (/科學記號|a\s*[×x]\s*10\^|4,?000.*51,?000/.test(learner)) add('P0', 'scopeAlignment', 'quadratic-scientific-notation-contamination', 'Scientific-notation task still contaminates G9 quadratic content.')
          }

          // Learner-core check: a unit cannot pass only because pass1 prepended its title/focus.
          const coreSamples = [
            ...questions.slice(0, 4).map((q) => learnerCore(`${q.context} ${q.prompt}`)),
            ...examples.slice(0, 2).map((e) => learnerCore(`${e.context} ${e.prompt}`)),
          ].filter(Boolean)
          if (!coreSamples.length || coreSamples.every((sample) => sample.length < 16)) add('P1', 'scopeAlignment', 'learner-core-too-thin', 'After removing V20 unit framing, learner tasks are too thin to evidence a real unit task.')

          const scored = scoreUnit(record)
          record.dimensions = scored.dimensions
          record.weightedScore = scored.weightedScore
          record.ready = !record.findings.some((item) => item.severity === 'P0' || item.severity === 'P1')
            && Object.values(scored.dimensions).every((value) => value >= 3)
            && scored.weightedScore >= 90
          records.push(record)
        }
      }
    }
  }
} finally {
  await server.close()
}

if (records.length !== 453) throw new Error(`Expected 453 active units; got ${records.length}`)

for (const record of records) {
  for (const q of record.findings ?? []) void q
}
const crossUnitReuse = []
for (const [signature, units] of sigUnits) if (units.size > 1) crossUnitReuse.push({ signature, units: [...units] })
if (crossUnitReuse.length) {
  const affected = new Set(crossUnitReuse.flatMap((item) => item.units))
  for (const record of records) if (affected.has(record.unitId)) {
    record.findings.push({ severity: 'P1', dimension: 'questionBank', code: 'cross-unit-exact-reuse', detail: 'At least one exact learner question experience is reused in another unit.' })
    const rescored = scoreUnit(record)
    record.dimensions = rescored.dimensions
    record.weightedScore = rescored.weightedScore
    record.ready = false
  }
}

const ready = records.filter((item) => item.ready)
const p0 = records.reduce((sum, item) => sum + item.findings.filter((finding) => finding.severity === 'P0').length, 0)
const p1 = records.reduce((sum, item) => sum + item.findings.filter((finding) => finding.severity === 'P1').length, 0)
const bySubject = {}
for (const record of records) {
  const bucket = bySubject[record.subject] ??= { total: 0, ready: 0, p0: 0, p1: 0 }
  bucket.total += 1
  if (record.ready) bucket.ready += 1
  bucket.p0 += record.findings.filter((item) => item.severity === 'P0').length
  bucket.p1 += record.findings.filter((item) => item.severity === 'P1').length
}
const output = {
  version: 'v20-final-editorial-2026-08-18',
  totalUnits: records.length,
  readyUnits: ready.length,
  p0,
  p1,
  crossUnitExactReuseGroups: crossUnitReuse.length,
  bySubject,
  records,
}
await writeFile('v20-final-editorial-review.json', JSON.stringify(output, null, 2), 'utf8')
console.log('[curriculum-v20-final] editorial gate')
console.log(JSON.stringify({ totalUnits: records.length, readyUnits: ready.length, p0, p1, crossUnitExactReuseGroups: crossUnitReuse.length, bySubject }, null, 2))

if (ready.length !== 453 || p0 !== 0 || p1 !== 0 || crossUnitReuse.length !== 0) {
  console.error('[curriculum-v20-final] FAILED')
  for (const record of records.filter((item) => !item.ready).slice(0, 80)) {
    console.error(`- ${record.unitId} ${record.title}: ${record.findings.map((item) => `${item.severity}/${item.code}`).join(', ')}`)
  }
  process.exit(1)
}
console.log('[curriculum-v20-final] PASS: 453/453 units pass the internal final editorial gate. This is an internal project QA state, not independent human verification or government/publisher certification.')
