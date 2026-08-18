import { createServer } from 'vite'

const server = await createServer({ logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })

const normalize = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()
const uniq = (items) => Array.from(new Set(items))
const materialCue = /(下圖|上圖|如圖|圖中|圖表|地圖|照片|圖片|附圖|聽力|音檔|音訊|錄音|listen|audio)/i
const placeholder = /(待補|TODO|TBD|placeholder|其他不符合條件的結果|教材準備中|依題目而異|依圖表而異|依文本而異)/i
const metaStrategy = /(哪個做法最|最能正確使用|先確認量、單位與限制|直接搬用|算出一個數字就停止|只要記住最後答案)/

const stats = {
  activeUnits: 0,
  v18Ready: 0,
  strictReviewed: 0,
  officialScopeMapped: 0,
  explicitPrerequisiteMetadata: 0,
  machineP0Units: 0,
  machineP1Units: 0,
  humanReviewRequired: 0,
  eligibleForV20InternalReady: 0,
  questions: 0,
  workedExamples: 0,
  visuals: 0,
  bySubject: {},
  byGrade: {},
  blockerCodes: {},
}

const records = []
const bump = (bucket, key) => { bucket[key] = (bucket[key] ?? 0) + 1 }
const addFinding = (record, severity, code, detail) => {
  record.findings.push({ severity, code, detail })
  bump(stats.blockerCodes, `${severity}:${code}`)
}

try {
  const plan = await server.ssrLoadModule('/src/curriculum-plan-v5.ts')
  const pedagogy = await server.ssrLoadModule('/src/curriculum-pedagogy-v18.ts')
  const reviewed = await server.ssrLoadModule('/src/curriculum-reviewed-content.ts')
  const registry = await server.ssrLoadModule('/src/curriculum-audit-registry.ts')

  for (let grade = 1; grade <= 12; grade += 1) {
    for (const route of plan.getCurriculumRouteOptions(grade)) {
      const track = plan.getCurriculumTrack(grade, route.subject, route.pathway)
      if (!track) continue
      for (const semester of track.semesters) {
        for (let unitIndex = 0; unitIndex < semester.units.length; unitIndex += 1) {
          const unit = semester.units[unitIndex]
          stats.activeUnits += 1
          bump(stats.bySubject, route.subject)
          bump(stats.byGrade, String(grade))

          const inspected = pedagogy.inspectTextbookUnitV18(unit.id)
          const content = inspected?.unit ?? null
          const strictContent = reviewed.getStrictReviewedUnitContent(unit.id)
          const strictReviewed = Boolean(strictContent)
          if (strictReviewed) stats.strictReviewed += 1
          const snapshot = registry.getUnitAuditSnapshot({
            grade,
            subject: route.subject,
            pathway: route.pathway,
            unitId: unit.id,
            strictReviewed,
          })

          const record = {
            unitId: unit.id,
            grade,
            semester: semester.semester,
            subject: route.subject,
            pathway: route.pathway ?? null,
            unitIndex,
            title: unit.title,
            focus: unit.focus,
            status: 'v20-reviewing',
            v18Ready: Boolean(inspected?.validation?.ready),
            historicalStrictReviewed: strictReviewed,
            officialScopeMapped: Boolean(snapshot.scopeChecked),
            trackPolicy: registry.getTrackPolicy(grade, route.subject, route.pathway),
            counts: { concepts: 0, misconceptions: 0, workedExamples: 0, questions: 0, visuals: 0 },
            machineChecks: {
              answerStructure: 'pending',
              requiredMaterials: 'pending',
              questionDiversity: 'pending',
              workedExampleDepth: 'pending',
              sourceTraceability: 'pending',
              prerequisiteMetadata: 'pending',
            },
            humanGates: {
              correctnessReadThrough: false,
              curriculumEvidenceReadThrough: false,
              prerequisiteTrace: false,
              visualMeaningReview: false,
              blindSolveAllObjectiveQuestions: false,
              rubricReviewAllOpenQuestions: false,
              difficultyCalibration: false,
              copyeditPass: false,
              desktopStudentWalkthrough: false,
              mobileStudentWalkthrough: false,
            },
            findings: [],
          }

          if (!content || !inspected?.validation?.ready) {
            addFinding(record, 'P0', 'content-not-runtime-ready', inspected?.validation?.errors?.join(' | ') || 'V18 content missing or invalid')
            records.push(record)
            continue
          }

          stats.v18Ready += 1
          if (snapshot.scopeChecked) stats.officialScopeMapped += 1
          record.counts = {
            concepts: content.concepts?.length ?? 0,
            misconceptions: content.misconceptions?.length ?? 0,
            workedExamples: content.workedExamples?.length ?? 0,
            questions: content.questions?.length ?? 0,
            visuals: content.visuals?.length ?? 0,
          }
          stats.questions += record.counts.questions
          stats.workedExamples += record.counts.workedExamples
          stats.visuals += record.counts.visuals

          // B — official curriculum evidence. A project label is not sufficient for V20.
          if (!snapshot.scopeChecked) {
            addFinding(record, 'P1', 'official-scope-mapping-required', '尚未留下逐單元官方課綱代碼與實際頁面證據；V20 不接受只靠 roadmap/title 推定。')
          }

          // C — explicit prerequisite trace required by V20. Track ordering alone is not evidence.
          const prerequisiteMetadata = content.prerequisites ?? content.prerequisite ?? content.prerequisiteSkills ?? content.prerequisiteKnowledge
          if (Array.isArray(prerequisiteMetadata) && prerequisiteMetadata.length) {
            stats.explicitPrerequisiteMetadata += 1
            record.machineChecks.prerequisiteMetadata = 'present-needs-human-trace'
          } else {
            record.machineChecks.prerequisiteMetadata = 'missing'
            addFinding(record, 'P1', 'explicit-prerequisite-trace-required', '缺 V20 prerequisite/source/check/bridge 明確紀錄；必須反查前一單元或前一年級真正是否教過。')
          }

          // A/F — structural answer checks. These do not prove subject-matter truth, only that the item is internally well-formed.
          let answerStructureOk = true
          const prompts = new Map()
          const levels = new Set()
          for (const question of content.questions ?? []) {
            const prompt = normalize(question.prompt)
            levels.add(normalize(question.level))
            prompts.set(prompt, (prompts.get(prompt) ?? 0) + 1)
            if (!prompt || placeholder.test(prompt) || metaStrategy.test(prompt)) {
              answerStructureOk = false
              addFinding(record, 'P1', 'question-prompt-quality', `題目 ${question.id}: 題幹空白、placeholder 或後設策略殘留。`)
            }
            const contextAndPrompt = `${normalize(question.context)} ${prompt}`
            if (materialCue.test(contextAndPrompt) && !(question.mediaAssetId || question.audioText) && !/[-+×÷=^%]|\d|：|:|「|」|表\s*\d/.test(contextAndPrompt)) {
              answerStructureOk = false
              addFinding(record, 'P0', 'required-material-missing', `題目 ${question.id}: 題幹要求圖／表／音訊等素材，但未偵測到可用媒體或自足資料。`)
            }
            if (question.kind === 'choice') {
              const options = (question.options ?? []).map(normalize)
              if (!Number.isInteger(question.correctIndex) || question.correctIndex < 0 || question.correctIndex >= options.length) {
                answerStructureOk = false
                addFinding(record, 'P0', 'invalid-answer-key', `題目 ${question.id}: correctIndex 超出選項範圍。`)
              }
              if (options.length < 4) {
                addFinding(record, 'P1', 'insufficient-choice-options', `題目 ${question.id}: 選項少於 4 個。`)
              }
              if (uniq(options).length !== options.length) {
                answerStructureOk = false
                addFinding(record, 'P0', 'duplicate-choice-options', `題目 ${question.id}: 存在重複選項，可能造成複數合理答案。`)
              }
              if (!normalize(question.explanation)) {
                addFinding(record, 'P1', 'missing-question-explanation', `題目 ${question.id}: 缺解析。`)
              }
              const feedback = question.optionFeedback ?? []
              if (feedback.length && feedback.length !== options.length) {
                addFinding(record, 'P1', 'feedback-option-mismatch', `題目 ${question.id}: optionFeedback 數量與選項不一致。`)
              }
            } else {
              if (!normalize(question.sampleAnswer)) addFinding(record, 'P1', 'missing-sample-answer', `題目 ${question.id}: 開放題缺參考作答。`)
              if (!Array.isArray(question.rubric) || question.rubric.length < 2) addFinding(record, 'P1', 'weak-open-rubric', `題目 ${question.id}: 開放題缺可操作的至少兩項評分焦點。`)
            }
          }
          for (const [prompt, count] of prompts) {
            if (prompt && count > 1) addFinding(record, 'P1', 'duplicate-question-prompt', `同單元有 ${count} 題使用相同 prompt：${prompt.slice(0, 70)}`)
          }
          record.machineChecks.answerStructure = answerStructureOk ? 'structurally-valid-needs-blind-solve' : 'issues-found'
          record.machineChecks.requiredMaterials = record.findings.some((item) => item.code === 'required-material-missing') ? 'issues-found' : 'no-obvious-missing-material'

          // E — worked example depth.
          if ((content.workedExamples?.length ?? 0) < 2) {
            addFinding(record, 'P1', 'insufficient-worked-examples', 'V20 至少需要彼此不同的完整示範（基礎＋應用）；目前少於 2 題。')
            record.machineChecks.workedExampleDepth = 'insufficient'
          } else {
            let thin = 0
            for (const example of content.workedExamples) {
              if ((example.steps?.length ?? 0) < 3 || normalize(example.answer).length < 8 || normalize(example.explanation).length < 20) thin += 1
            }
            if (thin) addFinding(record, 'P1', 'thin-worked-example', `${thin} 個例題的步驟／答案／解釋未達 V20 最低完整度。`)
            record.machineChecks.workedExampleDepth = thin ? 'issues-found' : 'structurally-deep-needs-human-rework'
          }

          // F — question-bank breadth. Machine level labels are only a proxy; V20 still requires human judgement.
          if ((content.questions?.length ?? 0) < 12) addFinding(record, 'P1', 'insufficient-question-bank', `正式題庫僅 ${content.questions?.length ?? 0} 題，低於 V20 最低審稿基準。`)
          if (levels.size < 3) addFinding(record, 'P1', 'insufficient-question-level-span', `題目 level 僅 ${levels.size} 種，尚不能證明理解→應用→遷移的難度曲線。`)
          record.machineChecks.questionDiversity = (content.questions?.length ?? 0) >= 12 && levels.size >= 3 ? 'basic-span-present-needs-human-calibration' : 'issues-found'

          // D — visual/material presence. Correctness and pedagogy remain human-only.
          if (!(content.visuals?.length)) addFinding(record, 'P1', 'visual-system-missing', '沒有單元視覺資料；V20 要求視覺承載知識而非純文字。')
          if ((content.visuals?.length ?? 0) < 2 && ['math', 'science', 'social'].includes(route.subject)) addFinding(record, 'P2', 'visual-variety-thin', '此科單元視覺型態偏少，需人工判斷是否足以支撐概念。')

          // H — source traceability and copy signals.
          const sourceRefs = content.sourceRefs ?? content.researchBasis ?? []
          if (!Array.isArray(sourceRefs) || !sourceRefs.length) {
            addFinding(record, 'P1', 'source-traceability-missing', '沒有可追溯 sourceRefs/researchBasis；正確性與時效性無法完成出版級複查。')
            record.machineChecks.sourceTraceability = 'missing'
          } else {
            record.machineChecks.sourceTraceability = 'present-needs-source-verification'
          }
          const prose = normalize([
            content.overview,
            ...(content.objectives ?? []),
            ...(content.concepts ?? []).flatMap((item) => [item.title, item.explanation, item.example]),
            ...(content.takeaway ?? []),
          ].join(' '))
          if (placeholder.test(prose)) addFinding(record, 'P1', 'editorial-placeholder', '教材正文仍含 placeholder／待補文字。')

          // Structural track policies that cannot claim an official textbook route as-is.
          if (record.trackPolicy?.textbookBlocked) addFinding(record, 'P0', 'track-structure-blocked', record.trackPolicy.note)
          if (record.trackPolicy?.structure === 'platform-extension') addFinding(record, 'P1', 'platform-extension-not-official-textbook-route', record.trackPolicy.note)

          // V20 human gates are intentionally false until a reviewer actually performs them.
          stats.humanReviewRequired += 1
          const hasP0 = record.findings.some((item) => item.severity === 'P0')
          const hasP1 = record.findings.some((item) => item.severity === 'P1')
          if (hasP0) stats.machineP0Units += 1
          if (hasP1) stats.machineP1Units += 1
          // Never auto-promote: passing machine preflight is necessary but not sufficient.
          record.eligibleForV20InternalReady = false
          records.push(record)
        }
      }
    }
  }
} finally {
  await server.close()
}

const bySeverity = { P0: 0, P1: 0, P2: 0, P3: 0 }
for (const record of records) for (const finding of record.findings) bySeverity[finding.severity] += 1
const cleanMachinePreflight = records.filter((record) => !record.findings.some((item) => item.severity === 'P0' || item.severity === 'P1')).length

console.log('[curriculum-v20] ALL-UNIT EDITORIAL PREFLIGHT')
console.log(JSON.stringify({ ...stats, findingsBySeverity: bySeverity, cleanMachinePreflight }, null, 2))
console.log('[curriculum-v20] subject totals', JSON.stringify(stats.bySubject))
console.log('[curriculum-v20] grade totals', JSON.stringify(stats.byGrade))
console.log('[curriculum-v20] top blocker codes')
for (const [code, count] of Object.entries(stats.blockerCodes).sort((a, b) => b[1] - a[1]).slice(0, 30)) console.log(`- ${code}: ${count}`)

console.log('[curriculum-v20] units with machine P0')
for (const record of records.filter((item) => item.findings.some((f) => f.severity === 'P0')).slice(0, 80)) {
  console.log(`- ${record.unitId} | G${record.grade} ${record.subject}${record.pathway ? `/${record.pathway}` : ''} | ${record.findings.filter((f) => f.severity === 'P0').map((f) => f.code).join(', ')}`)
}

console.log('[curriculum-v20] IMPORTANT: machine preflight does not grant V20 readiness')
console.log('- Every unit remains v20-reviewing until correctness, curriculum evidence, prerequisite trace, visual meaning, blind-solving/rubrics, difficulty, copyedit, and desktop/mobile student walkthrough are completed by review.')

if (stats.activeUnits !== 453 || stats.v18Ready !== 453 || records.length !== 453) {
  console.error(`[curriculum-v20] FAILED inventory/runtime coverage: active=${stats.activeUnits}, ready=${stats.v18Ready}, records=${records.length}`)
  process.exit(1)
}
if (stats.eligibleForV20InternalReady !== 0 || records.some((record) => record.status !== 'v20-reviewing')) {
  console.error('[curriculum-v20] FAILED safety boundary: machine audit must never auto-promote V20 readiness')
  process.exit(1)
}
console.log('[curriculum-v20] PASSED coverage gate: all 453 units received a V20 preflight record; zero were auto-promoted.')
