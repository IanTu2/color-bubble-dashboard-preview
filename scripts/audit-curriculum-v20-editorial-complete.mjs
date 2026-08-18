import { writeFile } from 'node:fs/promises'
import { createServer } from 'vite'

const norm = (v) => String(v ?? '').replace(/\s+/g, ' ').trim()
const uniq = (xs) => [...new Set(xs)]
const bad = /(待補|TODO|TBD|placeholder|教材準備中|依題目而異|依圖表而異|依文本而異|V20 第一輪保底題|V20 .*fallback|later human rewrite|仍需人工改成真正專屬題型|仍是 V20 明確標記的 fallback)/i
const old = /(重點是回到完整語境|Connect meaning, form, word order, time clues, reference, and register|重點是把條件轉成可檢查的數學表示|重點是把觀察、模型與推論分開|重點是連同來源、時間、空間尺度與不同群體觀點判讀資料|只要記住「.*?」的最後結論)/i
const sig = (q) => JSON.stringify({ c: norm(q.context), p: norm(q.prompt), a: q.kind === 'choice' ? (q.options ?? []).map(norm) : norm(q.sampleAnswer) })

const server = await createServer({ logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })
const records = []
const signatures = new Map()
try {
  const plan = await server.ssrLoadModule('/src/curriculum-plan-v5.ts')
  const editorial = await server.ssrLoadModule('/src/curriculum-textbook-v20-editorial.ts')
  for (let grade = 1; grade <= 12; grade += 1) {
    for (const route of plan.getCurriculumRouteOptions(grade)) {
      const track = plan.getCurriculumTrack(grade, route.subject, route.pathway)
      if (!track) continue
      for (const semester of track.semesters) for (const unit of semester.units) {
        const content = editorial.getTextbookUnitContentV20Editorial(unit.id)
        const findings = []
        const add = (severity, dimension, code, detail) => findings.push({ severity, dimension, code, detail })
        if (!content) {
          records.push({ unitId: unit.id, grade, subject: route.subject, title: unit.title, findings: [{ severity: 'P0', dimension: 'correctness', code: 'missing-content', detail: 'V20 editorial content missing.' }], ready: false })
          continue
        }
        const qs = content.questions ?? [], ex = content.workedExamples ?? [], concepts = content.concepts ?? [], misconceptions = content.misconceptions ?? [], visuals = content.visuals ?? []
        if (qs.length < 12) add('P1','questionBank','questions-under-12',`${qs.length} questions`)
        if (ex.length < 2) add('P1','workedExamples','examples-under-2',`${ex.length} examples`)
        if (concepts.length < 3) add('P1','scopeAlignment','concepts-under-3',`${concepts.length} concepts`)
        if (misconceptions.length < 2) add('P1','correctness','misconceptions-under-2',`${misconceptions.length} misconceptions`)
        if (visuals.length < 2) add('P1','visualMeaning','visuals-under-2',`${visuals.length} visuals`)

        const evidence = content.v20ReviewEvidence
        if (!/naer\.edu\.tw/i.test(norm(evidence?.scope?.sourceUrl))) add('P1','scopeAlignment','official-source-missing','No official NAER source URL in final evidence.')
        if (!norm(evidence?.scope?.mappingNote)) add('P1','scopeAlignment','mapping-note-missing','Scope mapping note missing.')
        if (grade <= 2 && route.subject === 'english' && evidence?.scope?.mode !== 'platform-extension') add('P0','scopeAlignment','low-grade-english-overclaim','G1–2 English must remain platform/local extension.')
        for (const field of ['source','check','bridge']) if (!norm(evidence?.prerequisite?.[field])) add('P1','prerequisiteContinuity',`prerequisite-${field}-missing`,`${field} missing`)
        if (!(content.sourceRefs ?? []).some((s) => /naer\.edu\.tw/i.test(norm(s.url)))) add('P1','scopeAlignment','sourceRefs-official-missing','sourceRefs missing NAER source.')

        const levels = new Set()
        const prompts = new Map()
        for (const q of qs) {
          levels.add(norm(q.level))
          const prompt = norm(q.prompt)
          prompts.set(prompt,(prompts.get(prompt)??0)+1)
          const body = norm(`${q.context} ${q.prompt} ${q.kind==='choice'?(q.options??[]).join(' '):q.sampleAnswer} ${q.explanation}`)
          if (!prompt || bad.test(body) || old.test(body)) add('P1','publicationQuality','question-editorial-residue',q.id)
          if (q.kind === 'choice') {
            const options = (q.options ?? []).map(norm)
            if (options.length !== 4) add('P1','questionBank','choice-count',`${q.id}: ${options.length}`)
            if (uniq(options).length !== options.length) add('P0','correctness','duplicate-options',q.id)
            if (!Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex >= options.length) add('P0','correctness','invalid-key',q.id)
            if (!norm(q.explanation)) add('P1','correctness','choice-explanation-missing',q.id)
          } else {
            if (!norm(q.sampleAnswer) || !norm(q.explanation)) add('P1','correctness','response-support-missing',q.id)
          }
          const key = sig(q)
          if (!signatures.has(key)) signatures.set(key,new Set())
          signatures.get(key).add(unit.id)
        }
        if (levels.size < 3) add('P1','difficultyProgression','level-span-under-3',`${levels.size} levels`)
        for (const [prompt,count] of prompts) if (prompt && count > Math.max(4,Math.ceil(qs.length*.45))) add('P1','questionBank','prompt-overreuse',`${count}/${qs.length}: ${prompt.slice(0,70)}`)

        for (const item of ex) {
          const text = norm(`${item.title} ${item.context} ${item.prompt} ${(item.steps??[]).join(' ')} ${item.answer} ${item.explanation}`)
          if (bad.test(text) || old.test(text)) add('P1','workedExamples','example-editorial-residue',item.title)
          if ((item.steps??[]).length < 3 || norm(item.answer).length < 2 || norm(item.explanation).length < 12) add('P1','workedExamples','thin-example',item.title)
        }
        const prose = norm(`${content.overview} ${(content.objectives??[]).join(' ')} ${concepts.map(c=>`${c.title} ${c.explanation} ${c.example}`).join(' ')} ${misconceptions.map(m=>`${m.claim} ${m.correction} ${m.reason}`).join(' ')} ${visuals.map(v=>`${v.title} ${v.caption} ${(v.items??[]).map(i=>`${i.label} ${i.detail}`).join(' ')}`).join(' ')} ${(content.vocabulary??[]).map(v=>`${v.term} ${v.definition}`).join(' ')} ${(content.takeaway??[]).join(' ')}`)
        if (bad.test(prose) || old.test(prose)) add('P1','publicationQuality','prose-editorial-residue','Editorial residue in rebuilt shell.')

        const known = norm(`${qs.map(q=>`${q.context} ${q.prompt} ${q.kind==='choice'?(q.options??[]).join(' '):q.sampleAnswer}`).join(' ')} ${ex.map(e=>`${e.context} ${e.prompt} ${e.answer}`).join(' ')} ${prose}`)
        if (unit.id === 'g9-math-s1-u1') {
          if (!/x²/.test(known) || !/因式分解/.test(known) || !/x\s*=/.test(known) || !/代回|驗算/.test(known)) add('P0','scopeAlignment','quadratic-evidence-missing','Quadratic equation evidence incomplete.')
          if (/科學記號|a\s*[×x]\s*10\^|4,?000.*51,?000/.test(known)) add('P0','scopeAlignment','quadratic-contamination','Scientific notation remains in G9 quadratic unit.')
        }

        const dimensions = { correctness:4, scopeAlignment:4, prerequisiteContinuity:4, visualMeaning:4, workedExamples:4, questionBank:4, difficultyProgression:4, publicationQuality:4 }
        for (const f of findings) dimensions[f.dimension] = Math.max(0, dimensions[f.dimension] - (f.severity==='P0'?4:f.severity==='P1'?2:1))
        const weights = { correctness:25, scopeAlignment:15, prerequisiteContinuity:10, visualMeaning:10, workedExamples:10, questionBank:15, difficultyProgression:5, publicationQuality:10 }
        const weightedScore = Math.round(Object.entries(weights).reduce((sum,[k,w])=>sum+dimensions[k]/4*w,0)*10)/10
        const ready = !findings.some(f=>f.severity==='P0'||f.severity==='P1') && Object.values(dimensions).every(v=>v>=3) && weightedScore>=90
        records.push({ unitId:unit.id, grade, semester:semester.semester, subject:route.subject, pathway:route.pathway??null, title:unit.title, focus:unit.focus, counts:{questions:qs.length,examples:ex.length,concepts:concepts.length,misconceptions:misconceptions.length,visuals:visuals.length}, dimensions, weightedScore, findings, ready })
      }
    }
  }
} finally { await server.close() }

if (records.length !== 453) throw new Error(`Expected 453 units; got ${records.length}`)
const reuseGroups = [...signatures.entries()].filter(([,units])=>units.size>1)
if (reuseGroups.length) {
  const affected = new Set(reuseGroups.flatMap(([,units])=>[...units]))
  for (const r of records) if (affected.has(r.unitId)) { r.findings.push({severity:'P1',dimension:'questionBank',code:'cross-unit-exact-reuse',detail:'Exact learner question reused in another unit.'}); r.ready=false }
}
const p0=records.reduce((n,r)=>n+r.findings.filter(f=>f.severity==='P0').length,0), p1=records.reduce((n,r)=>n+r.findings.filter(f=>f.severity==='P1').length,0)
const ready=records.filter(r=>r.ready)
const bySubject={}
for(const r of records){const b=bySubject[r.subject]??={total:0,ready:0,p0:0,p1:0};b.total++;if(r.ready)b.ready++;b.p0+=r.findings.filter(f=>f.severity==='P0').length;b.p1+=r.findings.filter(f=>f.severity==='P1').length}
const report={version:'v20-editorial-complete-2026-08-18',totalUnits:453,readyUnits:ready.length,p0,p1,crossUnitExactReuseGroups:reuseGroups.length,bySubject,records}
await writeFile('v20-final-editorial-review.json',JSON.stringify(report,null,2),'utf8')
console.log('[curriculum-v20-editorial-complete]',JSON.stringify({totalUnits:453,readyUnits:ready.length,p0,p1,crossUnitExactReuseGroups:reuseGroups.length,bySubject},null,2))
if(ready.length!==453||p0||p1||reuseGroups.length){console.error('[curriculum-v20-editorial-complete] FAILED');for(const r of records.filter(r=>!r.ready).slice(0,100))console.error(`- ${r.unitId} ${r.title}: ${r.findings.map(f=>`${f.severity}/${f.code}`).join(', ')}`);process.exit(1)}
console.log('[curriculum-v20-editorial-complete] PASS: 453/453 learner-facing units pass the V20 internal editorial gate. Internal QA only; not independent human, publisher, or government certification.')
