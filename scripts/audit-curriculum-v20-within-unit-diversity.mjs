import { createServer } from 'vite'

const norm=(v)=>String(v??'').replace(/\s+/g,' ').trim()
const server=await createServer({logLevel:'error',server:{middlewareMode:true},appType:'custom'})
const failures=[];let units=0,questions=0
try{
  const plan=await server.ssrLoadModule('/src/curriculum-plan-v5.ts')
  const final=await server.ssrLoadModule('/src/curriculum-textbook-v20-reviewed-final.ts')
  for(let grade=1;grade<=12;grade++)for(const route of plan.getCurriculumRouteOptions(grade)){
    const track=plan.getCurriculumTrack(grade,route.subject,route.pathway);if(!track)continue
    for(const sem of track.semesters)for(const unit of sem.units){
      units++
      const content=final.getTextbookUnitContentV20ReviewedFinal(unit.id)
      if(!content){failures.push(`${unit.id}: missing content`);continue}
      const qs=content.questions??[];questions+=qs.length
      const exact=new Set(qs.map(q=>JSON.stringify({context:norm(q.context),prompt:norm(q.prompt),answer:q.kind==='choice'?(q.options??[]).map(norm):norm(q.sampleAnswer)})))
      if(exact.size!==qs.length)failures.push(`${unit.id}: exact within-unit duplicate ${qs.length-exact.size}`)
      const cores=new Set(qs.map(q=>norm(q.context)
        .replace(/^Grade \d+, Semester \d+, unit “[^”]+”\. Learning focus: [^.。]+[.。]?\s*/,'')
        .replace(/^\d+ 年級第 \d+ 學期「[^」]+」。本章焦點：[^。]+。\s*/,'')
        .replace(/^(Practice stage: (concept confirmation|contextual application|cumulative transfer check)\.|練習階段：(概念確認|情境應用|累積遷移檢核)。)\s*/,'')
      ))
      if(cores.size<3)failures.push(`${unit.id}: only ${cores.size} substantive question contexts; need >=3`)
      const levels=new Set(qs.map(q=>norm(q.level)))
      if(levels.size<3)failures.push(`${unit.id}: only ${levels.size} difficulty labels`)
    }
  }
}finally{await server.close()}
console.log('[curriculum-v20-within-unit-diversity]',JSON.stringify({units,questions,failures:failures.length},null,2))
if(units!==453||questions!==6903||failures.length){console.error('[curriculum-v20-within-unit-diversity] FAILED');for(const f of failures.slice(0,160))console.error(`- ${f}`);process.exit(1)}
console.log('[curriculum-v20-within-unit-diversity] PASS: 453/453 units have no exact duplicate question experience, at least three substantive contexts, and all three difficulty labels.')
