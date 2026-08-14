import { readFile } from 'node:fs/promises'
import { createServer } from 'vite'

const server = await createServer({ logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })
const normalize = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()
const metaPattern = /哪個做法最|最能正確使用|哪一個做法最可靠|先確認量、單位與限制|題目提供一組具體|情境\s*\d+：請用|看到.*就立刻套|直接搬用|算出一個數字就停止/
const metaMisconceptionPattern = /只要記住|最後結論|重新檢查題目條件|整理已知與未知|建立表示與關係|推理或計算|驗算與檢查|回答原情境|不能只看表面詞|不能只看表面現象|先讀情境/
const genericDistractorPattern = /^其他不符合條件的結果\s*\d+$/
const concreteMathPattern = /[-+×÷=^%]|\d/
const evidencePattern = /\d|°C|公里|公分|公斤|公升|元|人|年|月|日|小時|分鐘|昨天|明天|Yesterday|Saturday|資料|句子|短文|照片|報紙|地圖|燈泡|幼苗|杯|水|氣溫|票|長方形|量測|公車|政府|居民|商品|bag|school|grandmother/i

const stats = {
  active: 0,
  ready: 0,
  structuralFailures: 0,
  learnerQuestions: 0,
  metaQuestions: 0,
  genericDistractorOptions: 0,
  metaMisconceptions: 0,
  concreteQuestions: 0,
  concreteMathQuestions: 0,
  mathQuestions: 0,
  unitsWithMeta: 0,
  unitsWithoutConcreteEvidence: 0,
  quickChecks: 0,
}
const findings = []

try {
  const plan = await server.ssrLoadModule('/src/curriculum-plan-v5.ts')
  const pedagogy = await server.ssrLoadModule('/src/curriculum-pedagogy-v18.ts')
  const readerSource = await readFile(new URL('../src/components/CurriculumCourseAppV17.tsx', import.meta.url), 'utf8')
  const visualSource = await readFile(new URL('../src/components/CurriculumPedagogyVisualV18.tsx', import.meta.url), 'utf8')
  const cssSource = await readFile(new URL('../src/user-experience-audit-v18.css', import.meta.url), 'utf8')

  if (!readerSource.includes('getTextbookUnitContentV18') || !readerSource.includes('CurriculumPedagogyVisualV18')) {
    findings.push({ unitId: 'reader', reasons: ['active reader is not wired to V18 content and visuals'] })
  }
  if (readerSource.includes('一次學一個觀念，學完馬上試一次') || readerSource.includes("title: '準備開始'")) {
    findings.push({ unitId: 'reader', reasons: ['redundant pedagogy transition page remains in learner flow'] })
  }
  if (!visualSource.includes('concrete-number-line') || !visualSource.includes('−3') || !visualSource.includes('+3')) {
    findings.push({ unitId: 'visual', reasons: ['concrete number-line renderer is missing'] })
  }
  if (!cssSource.includes('body:has(.desktop-dock-hidden) .assistant-tool-hub') || !cssSource.includes('.curriculum-v14-reader-tools')) {
    findings.push({ unitId: 'responsive', reasons: ['immersive tool-hub/mobile-directory safeguards are missing'] })
  }

  for (let grade = 1; grade <= 12; grade += 1) {
    for (const route of plan.getCurriculumRouteOptions(grade)) {
      const track = plan.getCurriculumTrack(grade, route.subject, route.pathway)
      if (!track) continue
      for (const semester of track.semesters) {
        for (const unit of semester.units) {
          stats.active += 1
          const inspected = pedagogy.inspectTextbookUnitV18(unit.id)
          if (!inspected?.unit || !inspected.validation?.ready) {
            stats.structuralFailures += 1
            findings.push({ unitId: unit.id, reasons: inspected?.validation?.errors ?? inspected?.validation?.issues ?? ['V18 content missing'] })
            continue
          }
          stats.ready += 1
          const content = inspected.unit
          let unitMeta = 0
          let unitConcrete = 0
          let unitGenericDistractors = 0
          let unitMetaMisconceptions = 0
          for (const question of content.questions) {
            const extra = question
            const mediaQuestion = Boolean(extra.mediaAssetId || extra.audioText)
            if (!mediaQuestion) {
              stats.learnerQuestions += 1
              const text = normalize(`${question.context ?? ''} ${question.prompt ?? ''} ${question.kind === 'choice' ? question.options.join(' ') : question.sampleAnswer ?? ''}`)
              if (metaPattern.test(text)) {
                stats.metaQuestions += 1
                unitMeta += 1
              }
              if (evidencePattern.test(text)) {
                stats.concreteQuestions += 1
                unitConcrete += 1
              }
              if (route.subject === 'math') {
                stats.mathQuestions += 1
                if (concreteMathPattern.test(text)) stats.concreteMathQuestions += 1
              }
            }
            if (question.kind === 'choice') {
              const generic = question.options.filter((option) => genericDistractorPattern.test(option)).length
              stats.genericDistractorOptions += generic
              unitGenericDistractors += generic
            }
          }
          for (const misconception of content.misconceptions) {
            if (metaMisconceptionPattern.test(normalize(`${misconception.claim} ${misconception.correction} ${misconception.reason}`))) {
              stats.metaMisconceptions += 1
              unitMetaMisconceptions += 1
            }
          }
          const checks = content.questions.filter((question) => question.id.includes('-ped-v17-check-')).length
          stats.quickChecks += checks
          if (unitMeta) {
            stats.unitsWithMeta += 1
            findings.push({ unitId: unit.id, reasons: [`${unitMeta} learner questions still test meta-strategy wording`] })
          }
          if (unitGenericDistractors) findings.push({ unitId: unit.id, reasons: [`${unitGenericDistractors} generic placeholder distractors remain`] })
          if (unitMetaMisconceptions) findings.push({ unitId: unit.id, reasons: [`${unitMetaMisconceptions} meta-strategy misconceptions remain`] })
          if (!unitConcrete) {
            stats.unitsWithoutConcreteEvidence += 1
            findings.push({ unitId: unit.id, reasons: ['no concrete learner question with numeric/textual/observational evidence'] })
          }
        }
      }
    }
  }
} finally {
  await server.close()
}

const mathConcretePct = stats.mathQuestions ? Math.round(stats.concreteMathQuestions / stats.mathQuestions * 100) : 0
const concretePct = stats.learnerQuestions ? Math.round(stats.concreteQuestions / stats.learnerQuestions * 100) : 0
console.log('[curriculum-user-experience-v18] concrete learner-content audit')
console.log(JSON.stringify(stats, null, 2))
console.log(`[curriculum-user-experience-v18] concrete evidence coverage=${concretePct}%`)
console.log(`[curriculum-user-experience-v18] math numeric/task coverage=${mathConcretePct}%`)
for (const finding of findings.slice(0, 100)) console.log(`- ${finding.unitId}: ${finding.reasons.join(' | ')}`)
if (findings.length > 100) console.log(`- ... ${findings.length - 100} more findings`)

if (
  stats.active !== 453 ||
  stats.ready !== 453 ||
  stats.structuralFailures ||
  stats.metaQuestions ||
  stats.genericDistractorOptions ||
  stats.metaMisconceptions ||
  stats.unitsWithoutConcreteEvidence ||
  concretePct < 95 ||
  mathConcretePct < 95 ||
  findings.some((finding) => ['reader', 'visual', 'responsive'].includes(finding.unitId))
) {
  console.error('[curriculum-user-experience-v18] FAILED: concrete learner UX gate regressed')
  process.exit(1)
}
console.log('[curriculum-user-experience-v18] PASSED: 453 units use concrete learner tasks, concrete misconceptions, clean distractors, streamlined flow, and responsive safeguards')
