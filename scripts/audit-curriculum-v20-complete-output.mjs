import { writeFile } from 'node:fs/promises'
import { createServer } from 'vite'

const norm=(v)=>String(v??'').replace(/\s+/g,' ').trim()
const uniq=(v)=>[...new Set(v)]
const residue=/(待補|TODO|TBD|placeholder|教材準備中|依題目而異|依圖表而異|依文本而異|V20 第一輪保底題|V20 .*fallback|later human rewrite|仍需人工改成真正專屬題型|仍是 V20 明確標記的 fallback|重點是把條件轉成可檢查的數學表示|重點是回到完整語境|重點是把觀察、模型與推論分開|重點是連同來源、時間、空間尺度與不同群體觀點判讀資料)/i
const signature=(q)=>JSON.stringify({context:norm(q.context),prompt:norm(q.prompt),answer:q.kind==='choice'?(q.options??[]).map(norm):norm(q.sampleAnswer)})
const server=await createServer({logLevel:'error',server:{middlewareMode:true},appType:'custom'})
const records=[], sigUnits=new Map()
try{
  const plan=await server.ssrLoadModule('/src/curriculum-plan-v5.ts')
  const complete=await server.ssrLoadModule('/src/curriculum-textbook-v20-complete.ts')
  for(let grade=1;grade<=12;grade++)for(const route of plan.getCurriculumRouteOptions(grade)){
    const track=plan.getCurriculumTrack(grade,route.subject,route.pathway);if(!track)continue
    for(const semester of track.semesters)for(const unit of semester.units){
      const content=complete.getTextbookUnitContentV20Complete(unit.id), findings=[]
      const add=(severity,dimension,code,detail)=>findings.push({severity,dimension,code,detail})
      if(!content){records.push({unitId:unit.id,title:unit.title,subject:route.subject,findings:[{severity:'P0',dimension:'correctness',code:'missing-content',detail:''}],ready:false});continue}
      const qs=content.questions??[], ex=content.workedExamples??[], concepts=content.concepts??[], misconceptions=content.misconceptions??[], visuals=content.visuals??[]
      if(qs.length<12)add('P1','questionBank','questions-under-12',String(qs.length))
      if(ex.length<2)add('P1','workedExamples','examples-under-2',String(ex.length))
      if(concepts.length<3)add('P1','scopeAlignment','concepts-under-3',String(concepts.length))
      if(misconceptions.length<2)add('P1','correctness','misconceptions-under-2',String(misconceptions.length))
      if(visuals.length<2)add('P1','visualMeaning','visuals-under-2',String(visuals.length))
      const ev=content.v20ReviewEvidence
      if(!/naer\.edu\.tw/i.test(norm(ev?.scope?.sourceUrl)))add('P1','scopeAlignment','official-source-missing','')
      if(!norm(ev?.scope?.mappingNote))add('P1','scopeAlignment','mapping-note-missing','')
      if(grade<=2&&route.subject==='english'&&ev?.scope?.mode!=='platform-extension')add('P0','scopeAlignment','low-grade-english-overclaim','')
      for(const field of ['source','check','bridge'])if(!norm(ev?.prerequisite?.[field]))add('P1','prerequisiteContinuity',`prerequisite-${field}-missing`,'')
      if(!(content.sourceRefs??[]).some(s=>/naer\.edu\.tw/i.test(norm(s.url))))add('P1','scopeAlignment','sourceRefs-official-missing','')
      const levels=new Set(), prompts=new Map()
      for(const q of qs){
        levels.add(norm(q.level));const p=norm(q.prompt);prompts.set(p,(prompts.get(p)??0)+1)
        if(!p||residue.test(norm(`${q.context} ${q.prompt} ${q.explanation}`)))add('P1','publicationQuality','question-residue',q.id)
        if(q.kind==='choice'){const opts=(q.options??[]).map(norm);if(opts.length!==4)add('P1','questionBank','choice-count',q.id);if(uniq(opts).length!==opts.length)add('P0','correctness','duplicate-options',q.id);if(!Number.isInteger(q.correctIndex)||q.correctIndex<0||q.correctIndex>=opts.length)add('P0','correctness','invalid-key',q.id);if(!norm(q.explanation))add('P1','correctness','missing-explanation',q.id)}
        else if(!norm(q.sampleAnswer)||!norm(q.explanation))add('P1','correctness','response-support-missing',q.id)
        const s=signature(q);if(!sigUnits.has(s))sigUnits.set(s,new Set());sigUnits.get(s).add(unit.id)
      }
      if(levels.size<3)add('P1','difficultyProgression','level-span-under-3',String(levels.size))
      for(const [p,count] of prompts)if(p&&count>Math.max(4,Math.ceil(qs.length*.45)))add('P1','questionBank','prompt-overreuse',`${count}/${qs.length}: ${p.slice(0,70)}`)
      for(const e of ex){const text=norm(`${e.title} ${e.context} ${e.prompt} ${(e.steps??[]).join(' ')} ${e.answer} ${e.explanation}`);if(residue.test(text))add('P1','workedExamples','example-residue',e.title);if((e.steps??[]).length<3||norm(e.answer).length<2||norm(e.explanation).length<12)add('P1','workedExamples','thin-example',e.title)}
      const prose=norm(`${content.overview} ${(content.objectives??[]).join(' ')} ${concepts.map(c=>`${c.title} ${c.explanation} ${c.example}`).join(' ')} ${misconceptions.map(m=>`${m.claim} ${m.correction} ${m.reason}`).join(' ')} ${visuals.map(v=>`${v.title} ${v.caption} ${(v.items??[]).map(i=>`${i.label} ${i.detail}`).join(' ')}`).join(' ')} ${(content.vocabulary??[]).map(v=>`${v.term} ${v.definition}`).join(' ')} ${(content.takeaway??[]).join(' ')}`)
      if(residue.test(prose))add('P1','publicationQuality','prose-residue','')
      const all=norm(`${qs.map(q=>`${q.context} ${q.prompt} ${q.kind==='choice'?(q.options??[]).join(' '):q.sampleAnswer}`).join(' ')} ${ex.map(e=>`${e.context} ${e.prompt} ${e.answer}`).join(' ')} ${prose}`)
      if(unit.id==='g9-math-s1-u1'){if(!/x²/.test(all)||!/因式分解/.test(all)||!/x\s*=/.test(all)||!/代回|驗算/.test(all))add('P0','scopeAlignment','quadratic-evidence-missing','');if(/科學記號|a\s*[×x]\s*10\^|4,?000.*51,?000/.test(all))add('P0','scopeAlignment','quadratic-contamination','')}
      const dimensions={correctness:4,scopeAlignment:4,prerequisiteContinuity:4,visualMeaning:4,workedExamples:4,questionBank:4,difficultyProgression:4,publicationQuality:4}
      for(const f of findings)dimensions[f.dimension]=Math.max(0,dimensions[f.dimension]-(f.severity==='P0'?4:f.severity==='P1'?2:1))
      const weights={correctness:25,scopeAlignment:15,prerequisiteContinuity:10,visualMeaning:10,workedExamples:10,questionBank:15,difficultyProgression:5,publicationQuality:10}
      const weightedScore=Math.round(Object.entries(weights).reduce((sum,[k,w])=>sum+dimensions[k]/4*w,0)*10)/10
      const ready=!findings.some(f=>f.severity==='P0'||f.severity==='P1')&&Object.values(dimensions).every(v=>v>=3)&&weightedScore>=90
      records.push({unitId:unit.id,grade,semester:semester.semester,subject:route.subject,pathway:route.pathway??null,title:unit.title,focus:unit.focus,counts:{questions:qs.length,examples:ex.length,concepts:concepts.length,misconceptions:misconceptions.length,visuals:visuals.length},dimensions,weightedScore,findings,ready})
    }
  }
}finally{await server.close()}
if(records.length!==453)throw new Error(`Expected 453 units; got ${records.length}`)
const reuse=[...sigUnits.entries()].filter(([,units])=>units.size>1)
if(reuse.length){const affected=new Set(reuse.flatMap(([,u])=>[...u]));for(const r of records)if(affected.has(r.unitId)){r.findings.push({severity:'P1',dimension:'questionBank',code:'cross-unit-exact-reuse',detail:''});r.ready=false}}
const p0=records.reduce((n,r)=>n+r.findings.filter(f=>f.severity==='P0').length,0),p1=records.reduce((n,r)=>n+r.findings.filter(f=>f.severity==='P1').length,0),ready=records.filter(r=>r.ready)
const bySubject={};for(const r of records){const b=bySubject[r.subject]??={total:0,ready:0,p0:0,p1:0};b.total++;if(r.ready)b.ready++;b.p0+=r.findings.filter(f=>f.severity==='P0').length;b.p1+=r.findings.filter(f=>f.severity==='P1').length}
const report={version:'v20-complete-output-2026-08-18',totalUnits:453,readyUnits:ready.length,p0,p1,crossUnitExactReuseGroups:reuse.length,bySubject,records};await writeFile('v20-final-editorial-review.json',JSON.stringify(report,null,2),'utf8')
console.log('[curriculum-v20-complete-output]',JSON.stringify({totalUnits:453,readyUnits:ready.length,p0,p1,crossUnitExactReuseGroups:reuse.length,bySubject},null,2))
if(ready.length!==453||p0||p1||reuse.length){console.error('[curriculum-v20-complete-output] FAILED');for(const r of records.filter(r=>!r.ready).slice(0,120))console.error(`- ${r.unitId} ${r.title}: ${r.findings.map(f=>`${f.severity}/${f.code}`).join(', ')}`);process.exit(1)}
console.log('[curriculum-v20-complete-output] PASS: 453/453 units pass the internal V20 completed editorial gate; this is not independent human, publisher, or government certification.')
