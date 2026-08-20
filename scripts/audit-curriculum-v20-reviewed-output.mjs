import { writeFile } from 'node:fs/promises'
import { createServer } from 'vite'

const norm=(v)=>String(v??'').replace(/\s+/g,' ').trim()
const residue=/(\bV20\b|fallback|仍需人工|later human rewrite|保底題|TODO|TBD|placeholder|教材準備中|依題目而異|依圖表而異|依文本而異)/i
const signature=(q)=>JSON.stringify({context:norm(q.context),prompt:norm(q.prompt),answer:q.kind==='choice'?(q.options??[]).map(norm):norm(q.sampleAnswer)})
const server=await createServer({logLevel:'error',server:{middlewareMode:true},appType:'custom'})
const rows=[],sigUnits=new Map(),failures=[]
try{
  const plan=await server.ssrLoadModule('/src/curriculum-plan-v5.ts')
  const reviewed=await server.ssrLoadModule('/src/curriculum-textbook-v20-reviewed-final.ts')
  for(let grade=1;grade<=12;grade++)for(const route of plan.getCurriculumRouteOptions(grade)){
    const track=plan.getCurriculumTrack(grade,route.subject,route.pathway);if(!track)continue
    for(const sem of track.semesters)for(const unit of sem.units){
      const content=reviewed.getTextbookUnitContentV20ReviewedFinal(unit.id)
      const f=[];const add=(code,detail)=>f.push({code,detail})
      if(!content){add('missing-content','');rows.push({unitId:unit.id,subject:route.subject,title:unit.title,failures:f});continue}
      const qs=content.questions??[],ex=content.workedExamples??[]
      if(qs.length<12)add('question-count',String(qs.length));if(ex.length<2)add('example-count',String(ex.length));if((content.concepts??[]).length<3)add('concept-count',String(content.concepts?.length??0));if((content.misconceptions??[]).length<2)add('misconception-count','');if((content.visuals??[]).length<2)add('visual-count','')
      const ev=content.v20ReviewEvidence
      if(!/naer\.edu\.tw/i.test(norm(ev?.scope?.sourceUrl)))add('official-source','')
      if(!norm(ev?.scope?.mappingNote))add('scope-note','')
      if(grade<=2&&route.subject==='english'&&ev?.scope?.mode!=='platform-extension')add('low-grade-english-overclaim','')
      for(const field of ['source','check','bridge'])if(!norm(ev?.prerequisite?.[field]))add(`prerequisite-${field}`,'')
      if(!(content.sourceRefs??[]).some(s=>/naer\.edu\.tw/i.test(norm(s.url))))add('sourceRefs-official','')
      const learner=norm(`${content.overview} ${(content.objectives??[]).join(' ')} ${(content.takeaway??[]).join(' ')} ${(content.concepts??[]).map(x=>`${x.title} ${x.explanation} ${x.example}`).join(' ')} ${(content.misconceptions??[]).map(x=>`${x.claim} ${x.correction} ${x.reason}`).join(' ')} ${(content.visuals??[]).map(v=>`${v.title} ${v.caption} ${(v.items??[]).map(x=>`${x.label} ${x.detail}`).join(' ')}`).join(' ')} ${(content.vocabulary??[]).map(x=>`${x.term} ${x.definition}`).join(' ')} ${ex.map(x=>`${x.title} ${x.context} ${x.prompt} ${(x.steps??[]).join(' ')} ${x.answer} ${x.explanation}`).join(' ')} ${qs.map(q=>`${q.context} ${q.prompt} ${q.kind==='choice'?(q.options??[]).join(' '):q.sampleAnswer} ${q.explanation} ${(q.optionFeedback??[]).join(' ')} ${(q.rubric??[]).join(' ')}`).join(' ')}`)
      if(residue.test(learner))add('learner-editorial-residue',(learner.match(residue)||[])[0]||'')
      const levels=new Set(),prompts=new Map()
      for(const q of qs){levels.add(norm(q.level));const p=norm(q.prompt);prompts.set(p,(prompts.get(p)??0)+1);const key=signature(q);if(!sigUnits.has(key))sigUnits.set(key,new Set());sigUnits.get(key).add(unit.id)
        if(q.kind==='choice'){const opts=(q.options??[]).map(norm);if(opts.length!==4)add('choice-count',q.id);if(new Set(opts).size!==4)add('duplicate-options',q.id);if(!Number.isInteger(q.correctIndex)||q.correctIndex<0||q.correctIndex>=4)add('invalid-key',q.id);const fb=q.optionFeedback??[];if(fb.length!==4)add('feedback-count',q.id);else{if(!/^正確/.test(norm(fb[q.correctIndex])))add('correct-feedback',q.id);for(let oi=0;oi<4;oi++)if(oi!==q.correctIndex&&!norm(fb[oi]).includes(norm(opts[q.correctIndex]).slice(0,Math.min(18,norm(opts[q.correctIndex]).length))))add('wrong-feedback-answer-link',`${q.id}:${oi}`)}}
        else{const rub=q.rubric??[];if(rub.length<3)add('rubric-count',q.id);if(!norm(q.sampleAnswer)||!norm(q.explanation))add('response-support',q.id)}
      }
      if(levels.size<3)add('difficulty-levels',String(levels.size));for(const [p,count] of prompts)if(p&&count>Math.max(4,Math.ceil(qs.length*.45)))add('prompt-overreuse',`${count}/${qs.length}: ${p.slice(0,60)}`)
      for(const e of ex)if((e.steps??[]).length<3||!norm(e.answer)||norm(e.explanation).length<10)add('thin-example',e.title)
      rows.push({unitId:unit.id,grade,semester:sem.semester,subject:route.subject,pathway:route.pathway??null,title:unit.title,focus:unit.focus,questionCount:qs.length,failures:f})
    }
  }
}finally{await server.close()}
if(rows.length!==453)throw new Error(`Expected 453 units; got ${rows.length}`)
const reuse=[...sigUnits.entries()].filter(([,u])=>u.size>1);for(const [,units] of reuse)for(const id of units){const row=rows.find(r=>r.unitId===id);row?.failures.push({code:'cross-unit-exact-reuse',detail:''})}
for(const row of rows)for(const f of row.failures)failures.push({unitId:row.unitId,...f})
const bySubject={};for(const row of rows){const b=bySubject[row.subject]??={total:0,ready:0,failures:0};b.total++;if(!row.failures.length)b.ready++;b.failures+=row.failures.length}
const report={version:'v20-reviewed-output-2026-08-18',totalUnits:rows.length,readyUnits:rows.filter(r=>!r.failures.length).length,totalQuestions:rows.reduce((n,r)=>n+r.questionCount,0),crossUnitExactReuseGroups:reuse.length,bySubject,failures,rows}
await writeFile('v20-reviewed-output-audit.json',JSON.stringify(report,null,2),'utf8')
console.log('[curriculum-v20-reviewed-output]',JSON.stringify({totalUnits:report.totalUnits,readyUnits:report.readyUnits,totalQuestions:report.totalQuestions,crossUnitExactReuseGroups:reuse.length,bySubject,failures:failures.length},null,2))
if(failures.length||reuse.length||report.readyUnits!==453){console.error('[curriculum-v20-reviewed-output] FAILED');for(const x of failures.slice(0,120))console.error(`- ${x.unitId}: ${x.code} ${x.detail}`);process.exit(1)}
console.log('[curriculum-v20-reviewed-output] PASS: 453/453 final learner units pass publication, feedback, prerequisite, source, diversity, and reuse checks.')
