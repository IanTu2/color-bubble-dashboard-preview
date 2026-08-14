import { readFile } from 'node:fs/promises'
import { createServer } from 'vite'

const server = await createServer({ logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })

const genericConceptPatterns = [
  /學習不能只背最後一句，而要依/,
  /例如遇到「.+」的新情境時，先找出/,
  /核心觀念(?:｜關係 \d+)?$/,
]
const genericPromptPatterns = [
  /^下列哪個敘述最符合「/,
  /^哪個例子最能直接說明「/,
  /^同學說：「.+」哪個修正最完整？$/,
  /^這個情境如何呈現「/,
  /^針對「.+」，請說明你會先檢查什麼/,
]
const genericOptionPatterns = [
  /只背最後答案/,
  /忽略題目提供的限制/,
  /不符合本題條件的說法/,
  /只背最後結論/,
  /表面相似的另一個概念/,
  /只看單一關鍵字/,
]
const genericFeedbackPatterns = [
  /這個選項沒有同時符合題目條件與教材定義/,
  /這個選項沒有同時符合題目條件與本單元概念/,
]

const ratio = (a, b) => b ? a / b : 0
const pct = (value) => `${Math.round(value * 100)}%`
const normalize = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()

function unitPhrases(unit) {
  return `${unit.title}。${unit.focus}`
    .split(/[。；，、：:（）()／/]|以及|並且|並|與|和/)
    .map(normalize)
    .filter((item) => item.length >= 2 && item.length <= 28)
}

function hasUnitPhrase(text, phrases) {
  const source = normalize(text)
  return phrases.some((phrase) => source.includes(phrase))
}

const stats = {
  activeUnits: 0,
  resolvedUnits: 0,
  strictReviewedUnits: 0,
  foundationUnits: 0,
  highTemplateUnits: 0,
  weakConceptSpecificityUnits: 0,
  weakQuestionSpecificityUnits: 0,
  weakExampleSpecificityUnits: 0,
  weakVisualSupportUnits: 0,
  pacingRisk: false,
  bySubject: {},
}
const findings = []

try {
  const plan = await server.ssrLoadModule('/src/curriculum-plan-v5.ts')
  const finalTextbook = await server.ssrLoadModule('/src/curriculum-textbook-v14-final.ts')
  const sourceContent = await server.ssrLoadModule('/src/curriculum-reviewed-content.ts')

  const appSource = await readFile(new URL('../src/components/CurriculumCourseAppV14.tsx', import.meta.url), 'utf8')
  const conceptBranch = appSource.match(/if \(lesson\.kind === 'concept'\)[\s\S]*?if \(lesson\.kind === 'example'\)/)?.[0] ?? ''
  const conceptsInterleaveQuestions = /questions|renderQuestion|kind:\s*'question'/.test(conceptBranch)
  stats.pacingRisk = !conceptsInterleaveQuestions

  for (let grade = 1; grade <= 12; grade += 1) {
    for (const route of plan.getCurriculumRouteOptions(grade)) {
      const track = plan.getCurriculumTrack(grade, route.subject, route.pathway)
      if (!track) continue
      for (const semester of track.semesters) {
        for (const unit of semester.units) {
          stats.activeUnits += 1
          const subject = route.subject
          const subjectStats = stats.bySubject[subject] ??= { units: 0, highTemplate: 0, weakConcepts: 0, weakQuestions: 0, weakExamples: 0, weakVisuals: 0 }
          subjectStats.units += 1

          const strict = sourceContent.getStrictReviewedUnitContent(unit.id)
          if (strict) stats.strictReviewedUnits += 1
          else stats.foundationUnits += 1

          const inspected = finalTextbook.inspectTextbookUnitV14(unit.id)
          if (!inspected?.unit || !inspected.validation?.ready) {
            findings.push({ unitId: unit.id, grade, subject, severity: 'critical', reasons: ['教材 runtime 無法通過既有 V14 validator'] })
            continue
          }
          stats.resolvedUnits += 1
          const content = inspected.unit
          const phrases = unitPhrases(unit)
          const reasons = []

          const genericConcepts = content.concepts.filter((concept) => genericConceptPatterns.some((pattern) => pattern.test(`${concept.title} ${concept.explanation} ${concept.example ?? ''}`))).length
          const conceptSpecific = content.concepts.filter((concept) => hasUnitPhrase(`${concept.title} ${concept.explanation} ${concept.example ?? ''}`, phrases)).length
          if (ratio(genericConcepts, content.concepts.length) >= 0.35 || conceptSpecific < Math.min(4, content.concepts.length)) {
            stats.weakConceptSpecificityUnits += 1
            subjectStats.weakConcepts += 1
            reasons.push(`概念內容學科／單元專屬性不足（模板 ${genericConcepts}/${content.concepts.length}，明確連結單元 ${conceptSpecific}/${content.concepts.length}）`)
          }

          const generatedQuestions = content.questions.filter((question) => /-tb-v14-/.test(question.id) || genericPromptPatterns.some((pattern) => pattern.test(question.prompt))).length
          const genericOptions = content.questions.filter((question) => question.kind === 'choice').flatMap((question) => question.options).filter((option) => genericOptionPatterns.some((pattern) => pattern.test(option))).length
          const allOptions = content.questions.filter((question) => question.kind === 'choice').flatMap((question) => question.options).length
          const questionSpecific = content.questions.filter((question) => hasUnitPhrase(`${question.context ?? ''} ${question.prompt}`, phrases)).length
          const genericFeedback = content.questions.filter((question) => question.kind === 'choice').flatMap((question) => question.optionFeedback ?? []).filter((feedback) => genericFeedbackPatterns.some((pattern) => pattern.test(feedback))).length
          const allFeedback = content.questions.filter((question) => question.kind === 'choice').flatMap((question) => question.optionFeedback ?? []).length
          const questionTemplateRatio = ratio(generatedQuestions, content.questions.length)
          if (questionTemplateRatio >= 0.60 || ratio(genericOptions, allOptions) >= 0.20 || ratio(genericFeedback, allFeedback) >= 0.35 || questionSpecific < Math.ceil(content.questions.length * 0.65)) {
            stats.weakQuestionSpecificityUnits += 1
            subjectStats.weakQuestions += 1
            reasons.push(`題庫模板比例偏高（生成題 ${pct(questionTemplateRatio)}、通用干擾選項 ${pct(ratio(genericOptions, allOptions))}、通用回饋 ${pct(ratio(genericFeedback, allFeedback))}）`)
          }

          const specificExamples = content.workedExamples.filter((example) => hasUnitPhrase(`${example.title} ${example.context} ${example.prompt} ${example.answer}`, phrases)).length
          if (specificExamples < Math.ceil(content.workedExamples.length * 0.6)) {
            stats.weakExampleSpecificityUnits += 1
            subjectStats.weakExamples += 1
            reasons.push(`例題情境不夠貼合單元（明確連結 ${specificExamples}/${content.workedExamples.length}）`)
          }

          const mediaQuestions = content.questions.filter((question) => question.mediaAssetId || question.audioText).length
          const richVisualExpected = ['math', 'science', 'social'].includes(subject)
          if (richVisualExpected && mediaQuestions === 0) {
            stats.weakVisualSupportUnits += 1
            subjectStats.weakVisuals += 1
            reasons.push('只有文字結構圖，缺少可直接教學的圖像／圖表／地圖／幾何或資料視覺')
          }

          if (questionTemplateRatio >= 0.60) {
            stats.highTemplateUnits += 1
            subjectStats.highTemplate += 1
          }

          if (reasons.length) findings.push({ unitId: unit.id, grade, subject, title: unit.title, strictReviewed: Boolean(strict), severity: reasons.length >= 3 ? 'high' : 'medium', reasons })
        }
      }
    }
  }
} finally {
  await server.close()
}

console.log('[curriculum-pedagogy-v16] second-pass pedagogical audit')
console.log(JSON.stringify(stats, null, 2))
if (stats.pacingRisk) console.log('[curriculum-pedagogy-v16] GLOBAL: concept pages are still separated from question pages; immediate retrieval/checks are not interleaved during concept teaching.')
console.log(`[curriculum-pedagogy-v16] units requiring pedagogical revision: ${findings.length}/${stats.activeUnits}`)
for (const item of findings.slice(0, 120)) {
  console.log(`- [${item.severity}] ${item.unitId}${item.title ? ` ${item.title}` : ''}: ${item.reasons.join(' | ')}`)
}
if (findings.length > 120) console.log(`- ... ${findings.length - 120} more units`)

const critical = findings.filter((item) => item.severity === 'critical')
if (stats.activeUnits !== 453 || stats.resolvedUnits !== 453 || critical.length) {
  console.error('[curriculum-pedagogy-v16] FAILED: curriculum inventory/runtime integrity problem')
  process.exit(1)
}

console.log('[curriculum-pedagogy-v16] runtime integrity passed; pedagogical findings are intentionally reported separately from structural readiness.')
