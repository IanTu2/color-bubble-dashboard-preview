import { readFile } from 'node:fs/promises'
import { createServer } from 'vite'

const server = await createServer({ logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })
const normalize = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()
const ratio = (a, b) => b ? a / b : 0
const pct = (value) => `${Math.round(value * 100)}%`

const legacyPromptPatterns = [/^下列哪個敘述最符合「/, /^哪個例子最能直接說明「/, /^同學說：「.+」哪個修正最完整？$/, /^這個情境如何呈現「/, /^針對「.+」，請說明你會先檢查什麼/]
const legacyOptionPatterns = [/只背最後答案，不檢查條件/, /忽略題目提供的限制，直接猜結論/, /不符合本題條件的說法/, /不使用.+已提供的任何概念或證據/]
const legacyFeedbackPatterns = [/這個選項沒有同時符合題目條件與教材定義/, /這個選項沒有同時符合題目條件與本單元概念/]
const genericTitlePatterns = [/核心觀念(?:｜關係 \d+)?$/, /^關係 \d+$/, /^重點 \d+$/]

function unitPhrases(unit) {
  return `${unit.title}。${unit.focus}`.split(/[。；，、：:（）()／/]|以及|並且|並|與|和/).map(normalize).filter((item) => item.length >= 2 && item.length <= 32)
}
function linkedToUnit(text, phrases) {
  const value = normalize(text)
  return phrases.some((phrase) => value.includes(phrase))
}
function diagramKind(subject, text) {
  if (subject === 'math') {
    if (/座標|函數|斜率|趨勢|方程.*圖|圖形關係/.test(text)) return 'coordinate'
    if (/幾何|角|三角|圓|多邊形|面積|周長|體積|相似|全等|形狀|立體/.test(text)) return 'geometry'
    if (/數線|正負|整數|分數|小數|有理數|數的大小|100\s*以內|1000\s*以內|10000\s*以內/.test(text)) return 'number-line'
    if (/資料|統計|圖表|平均|機率|長條|圓餅|分布/.test(text)) return 'data-chart'
    if (/長度|容量|重量|時間|日曆|測量|單位|角度/.test(text)) return 'measurement'
    if (/加法|減法|乘法|除法|四則|因數|倍數|比率|比例|百分率|數量關係|代數|式子|方程|不等式/.test(text)) return 'bar-model'
    return 'math-flow'
  }
  if (subject === 'science') {
    if (/電路|電流|電壓|電阻|串聯|並聯|電與|電磁/.test(text)) return 'circuit'
    if (/粒子|原子|分子|元素|化學|溶液|物質|酸鹼|反應/.test(text)) return 'particle'
    if (/力|運動|速度|加速度|位移|慣性|摩擦/.test(text)) return 'motion'
    if (/植物|動物|生物|生態|細胞|遺傳|器官|身體|分類|生命/.test(text)) return 'biology-system'
    if (/循環|水循環|天氣|氣候|岩石|地質|地球環境|季節/.test(text)) return 'earth-cycle'
    if (/地球與太空|太空|月亮|月相|太陽|行星|宇宙|天文|星/.test(text)) return 'orbit'
    if (/光|聲音|聲|波|振動|熱|溫度|能量/.test(text)) return 'wave-energy'
    if (/測量|觀察|實驗|探究/.test(text)) return 'measurement'
    return 'science-flow'
  }
  if (subject === 'social') {
    if (/歷史|年代|時代|事件|朝代|早期|近代|古代|演變|變遷/.test(text)) return 'timeline'
    if (/地圖|位置|地形|海域|地理|環境|區域|人口分布|氣候|交通|空間/.test(text)) return 'map'
    if (/政府|公民|法律|權利|義務|民主|制度|公共服務|政策|政治/.test(text)) return 'civic-network'
    if (/產業|經濟|消費|市場|人口|資料|統計|貿易|資源/.test(text)) return 'social-data'
    return 'evidence'
  }
  return 'not-required'
}

const stats = {
  activeUnits: 0,
  resolvedUnits: 0,
  structuralFailures: 0,
  legacyTemplateUnits: 0,
  weakConceptLinkUnits: 0,
  genericConceptTitleUnits: 0,
  weakQuestionContextUnits: 0,
  weakExampleSpecificityUnits: 0,
  insufficientQuickCheckUnits: 0,
  richVisualExpectedUnits: 0,
  richVisualRenderedUnits: 0,
  domainVisualUnits: 0,
  subjectFlowFallbackUnits: 0,
  totalQuestions: 0,
  contextualQuestions: 0,
  quickChecks: 0,
  bySubject: {},
}
const findings = []

try {
  const plan = await server.ssrLoadModule('/src/curriculum-plan-v5.ts')
  const pedagogy = await server.ssrLoadModule('/src/curriculum-pedagogy-v17.ts')
  const readerSource = await readFile(new URL('../src/components/CurriculumCourseAppV17.tsx', import.meta.url), 'utf8')
  const visualSource = await readFile(new URL('../src/components/CurriculumPedagogyVisualV17.tsx', import.meta.url), 'utf8')
  const inlinePractice = readerSource.includes('quickCheck') && readerSource.includes('renderQuestion(page.quickCheck)')
  const richRenderer = visualSource.includes('data-v17-rich-visual="true"') && visualSource.includes('data-v17-diagram-kind')

  for (let grade = 1; grade <= 12; grade += 1) {
    for (const route of plan.getCurriculumRouteOptions(grade)) {
      const track = plan.getCurriculumTrack(grade, route.subject, route.pathway)
      if (!track) continue
      for (const semester of track.semesters) {
        for (const unit of semester.units) {
          stats.activeUnits += 1
          const subject = route.subject
          const subjectStats = stats.bySubject[subject] ??= { units: 0, structural: 0, legacy: 0, concepts: 0, questions: 0, examples: 0, quickChecks: 0, richVisuals: 0, domainVisuals: 0, flowFallbacks: 0 }
          subjectStats.units += 1
          const inspected = pedagogy.inspectTextbookUnitV17(unit.id)
          if (!inspected?.unit || !inspected.validation?.ready) {
            stats.structuralFailures += 1
            subjectStats.structural += 1
            findings.push({ unitId: unit.id, title: unit.title, severity: 'critical', reasons: inspected.validation?.errors ?? ['content missing'] })
            continue
          }
          stats.resolvedUnits += 1
          const content = inspected.unit
          const phrases = unitPhrases(unit)
          const reasons = []

          const conceptLinked = content.concepts.filter((concept) => linkedToUnit(`${concept.title} ${concept.explanation} ${concept.example ?? ''}`, phrases)).length
          if (conceptLinked < content.concepts.length) {
            stats.weakConceptLinkUnits += 1
            subjectStats.concepts += 1
            reasons.push(`unit-linked concepts ${conceptLinked}/${content.concepts.length}`)
          }
          const genericTitles = content.concepts.filter((concept) => genericTitlePatterns.some((pattern) => pattern.test(concept.title.trim()))).length
          if (genericTitles) {
            stats.genericConceptTitleUnits += 1
            reasons.push(`generic concept titles ${genericTitles}/${content.concepts.length}`)
          }

          const choices = content.questions.filter((question) => question.kind === 'choice')
          const legacyPrompts = content.questions.filter((question) => legacyPromptPatterns.some((pattern) => pattern.test(question.prompt))).length
          const legacyOptions = choices.flatMap((question) => question.options).filter((option) => legacyOptionPatterns.some((pattern) => pattern.test(option))).length
          const legacyFeedback = choices.flatMap((question) => question.optionFeedback ?? []).filter((feedback) => legacyFeedbackPatterns.some((pattern) => pattern.test(feedback))).length
          if (legacyPrompts || legacyOptions || legacyFeedback) {
            stats.legacyTemplateUnits += 1
            subjectStats.legacy += 1
            reasons.push(`legacy template residue p=${legacyPrompts} o=${legacyOptions} f=${legacyFeedback}`)
          }

          stats.totalQuestions += content.questions.length
          const contextual = content.questions.filter((question) => normalize(question.context).length >= 24 && linkedToUnit(`${question.context} ${question.prompt}`, phrases)).length
          stats.contextualQuestions += contextual
          if (ratio(contextual, content.questions.length) < 0.9) {
            stats.weakQuestionContextUnits += 1
            subjectStats.questions += 1
            reasons.push(`contextual questions ${contextual}/${content.questions.length} < 90%`)
          }

          const specificExamples = content.workedExamples.filter((example) => linkedToUnit(`${example.title} ${example.context} ${example.prompt} ${example.answer}`, phrases)).length
          if (specificExamples < content.workedExamples.length) {
            stats.weakExampleSpecificityUnits += 1
            subjectStats.examples += 1
            reasons.push(`unit-linked examples ${specificExamples}/${content.workedExamples.length}`)
          }

          const quickChecks = content.questions.filter((question) => question.id.includes('-ped-v17-check-')).length
          stats.quickChecks += quickChecks
          const expectedQuickChecks = Math.min(6, content.concepts.length)
          if (!inlinePractice || quickChecks < expectedQuickChecks) {
            stats.insufficientQuickCheckUnits += 1
            subjectStats.quickChecks += 1
            reasons.push(`quick checks ${quickChecks}/${expectedQuickChecks}`)
          }

          if (['math', 'science', 'social'].includes(subject)) {
            stats.richVisualExpectedUnits += 1
            if (richRenderer && content.visuals.length >= 3) {
              stats.richVisualRenderedUnits += 1
              subjectStats.richVisuals += 1
            }
            const visualText = `${unit.title} ${unit.focus} ${content.visuals.map((visual) => `${visual.title} ${visual.items.map((item) => `${item.label} ${item.detail}`).join(' ')}`).join(' ')}`
            const kind = diagramKind(subject, visualText)
            if (kind.endsWith('-flow')) {
              stats.subjectFlowFallbackUnits += 1
              subjectStats.flowFallbacks += 1
              reasons.push(`subject-aware SVG falls back to ${kind}`)
            } else {
              stats.domainVisualUnits += 1
              subjectStats.domainVisuals += 1
            }
          }

          if (reasons.length) findings.push({ unitId: unit.id, title: unit.title, severity: reasons.length >= 3 ? 'high' : 'medium', reasons })
        }
      }
    }
  }
} finally {
  await server.close()
}

console.log('[curriculum-pedagogy-v17-final] learner-facing pedagogy audit')
console.log(JSON.stringify(stats, null, 2))
console.log(`[curriculum-pedagogy-v17-final] contextual question coverage: ${pct(ratio(stats.contextualQuestions, stats.totalQuestions))}`)
console.log(`[curriculum-pedagogy-v17-final] rich SVG coverage: ${stats.richVisualRenderedUnits}/${stats.richVisualExpectedUnits}`)
console.log(`[curriculum-pedagogy-v17-final] domain-specific SVG coverage: ${stats.domainVisualUnits}/${stats.richVisualExpectedUnits}; subject-flow fallback=${stats.subjectFlowFallbackUnits}`)
console.log(`[curriculum-pedagogy-v17-final] immediate quick checks: ${stats.quickChecks}; insufficient units=${stats.insufficientQuickCheckUnits}`)
console.log(`[curriculum-pedagogy-v17-final] units with remaining review findings: ${findings.length}/${stats.activeUnits}`)
for (const finding of findings.slice(0, 120)) console.log(`- [${finding.severity}] ${finding.unitId} ${finding.title}: ${finding.reasons.join(' | ')}`)
if (findings.length > 120) console.log(`- ... ${findings.length - 120} more units`)

if (stats.activeUnits !== 453 || stats.resolvedUnits !== 453 || stats.structuralFailures || stats.legacyTemplateUnits || stats.weakConceptLinkUnits || stats.weakQuestionContextUnits || stats.weakExampleSpecificityUnits || stats.insufficientQuickCheckUnits || stats.richVisualRenderedUnits !== stats.richVisualExpectedUnits) {
  console.error('[curriculum-pedagogy-v17-final] FAILED: learner-facing V17 pedagogy gate regressed')
  process.exit(1)
}
console.log('[curriculum-pedagogy-v17-final] structural, context, examples, template-removal, inline-practice and rich-visual gates passed')
