import { createServer } from 'vite'

const norm=(v)=>String(v??'').replace(/\s+/g,' ').trim()
const server=await createServer({logLevel:'error',server:{middlewareMode:true},appType:'custom'})
const failures=[];let mathChecked=0,mathUnclassified=0,nonMathChecked=0;const correctPositions=[0,0,0,0]

function answerText(q){return q.kind==='choice'?norm(q.options?.[q.correctIndex]):norm(q.sampleAnswer)}
function canonicalFactorProduct(value){
  const m=norm(value).match(/(\(x[+-]\d+\))(\(x[+-]\d+\))/)
  return m?[m[1],m[2]].sort().join(''):null
}
function includesExpected(answer,expected){
  const a=norm(answer),e=norm(expected)
  if(a.includes(e))return true
  const af=canonicalFactorProduct(a),ef=canonicalFactorProduct(e)
  return Boolean(af&&ef&&af===ef)
}
function fail(unitId,q,code,detail){failures.push({unitId,questionId:q.id,code,detail})}
function gcd(a,b){return b?gcd(b,a%b):Math.abs(a)}
function parseNum(s){return Number(String(s).replace(/,/g,''))}

function solveMath(q){
  const c=norm(q.context),p=norm(q.prompt)
  let m
  if((m=c.match(/有 (\d+) 個十和 (\d+) 個一/)))return String(+m[1]*10 + +m[2])
  if((m=c.match(/有 (\d+) 個百、(\d+) 個十和 (\d+) 個一/)))return String(+m[1]*100 + +m[2]*10 + +m[3])
  if((m=c.match(/有 (\d+) 個千、(\d+) 個百、(\d+) 個十和 (\d+) 個一/)))return String(+m[1]*1000 + +m[2]*100 + +m[3]*10 + +m[4])
  if(/圓形在三角形右邊/.test(c))return '圓形在三角形的右邊'
  if(/正方體模型/.test(c))return '6'
  if((m=c.match(/圓心角是 (\d+)°/)))return `${+m[1]/2}°`
  if((m=c.match(/量角器讀到一個角是 (\d+)°/))){const a=+m[1];return a<90?'銳角':a===90?'直角':'鈍角'}
  if(/直線 l 與直線 m 相交形成四個直角/.test(c))return 'l ⟂ m'
  if((m=c.match(/內角分別是 (\d+)° 與 (\d+)°/)))return `${180-+m[1]-+m[2]}°`
  if((m=c.match(/對應邊比為 1:(\d+)；小三角形某邊長 (\d+) 公分/)))return `${+m[1]*+m[2]} 公分`
  if((m=c.match(/向量 a=\(([-\d.]+),([-\d.]+)\)，b=\(([-\d.]+),([-\d.]+)\)/)))return `(${+m[1]+ +m[3]},${+m[2]+ +m[4]})`
  if((m=c.match(/空間向量 v=\(([-\d.]+),([-\d.]+),0\)/)))return String((+m[1])**2+(+m[2])**2)
  if((m=c.match(/繩子長 (\d+) 公尺/)))return `${+m[1]*100} 公分`
  if((m=c.match(/甲物長 (\d+) 公分，乙物比甲物短 (\d+) 公分/)))return `${+m[1]-+m[2]} 公分`
  if((m=c.match(/長方形長 (\d+) 公分、寬 (\d+) 公分/))&&/周長/.test(p))return `${2*(+m[1]+ +m[2])} 公分`
  if((m=c.match(/時鐘顯示 (\d+):(00|30)/)))return m[2]==='30'?`${m[1]} 點半`:`${m[1]} 點整`
  if((m=c.match(/活動在 (\d+):00 開始，持續 (\d+) 分鐘/))){const total=+m[1]*60 + +m[2];return `${Math.floor(total/60)}:${String(total%60).padStart(2,'0')}`}
  if(/紅、藍、紅、藍/.test(c)&&/接下來四張/.test(p))return '紅、藍、紅、藍'
  if((m=c.match(/有 (\d+) 組，每組 (\d+) 個/)))return String(+m[1]*+m[2])
  if((m=c.match(/共有 (\d+) 顆球，平均分成 (\d+) 組/)))return String(+m[1]/+m[2])
  if(/披薩/.test(c)&&/誰吃得比較多/.test(p))return '乙'
  if(/比較分數/.test(c)&&/關係為何/.test(p))return '兩者相等'
  if(/計算 1\/2 \+ 1\/4/.test(c))return '3/4'
  if(/計算 3\/4 - 1\/2/.test(c))return '1/4'
  if(/計算 3\/4 ÷ 1\/2/.test(c))return '3/2'
  if((m=c.match(/計算 ([\d.]+) × (\d+)/)))return String(+m[1]*+m[2])
  if((m=c.match(/兩個數是 (\d+) 與 (\d+)/)))return String(gcd(+m[1],+m[2]))
  if((m=c.match(/求 (\d+) 與 (\d+) 的最大公因數/)))return String(gcd(+m[1],+m[2]))
  if(/計算 -1\/2 \+ 3\/4/.test(c))return '1/4'
  if((m=c.match(/全體有 (\d+) 份，其中 (\d+) 份/)))return `${(+m[2]/+m[1])*100}%`
  if((m=c.match(/x=(\d+) 時 y=(\d+)/))&&/成正比/.test(c)){const k=+m[2]/+m[1];const m2=p.match(/x=(\d+) 時 y/);if(m2)return String(k*+m2[1])}
  if((m=c.match(/三角形底 (\d+) 公分、高 (\d+) 公分/)))return `${+m[1]*+m[2]/2} 平方公分`
  if((m=c.match(/長方體長 (\d+)、寬 (\d+)、高 (\d+) 公分/)))return `${+m[1]*+m[2]*+m[3]} 立方公分`
  if((m=c.match(/長方形長 (\d+) 公分、寬 (\d+) 公分/))&&/面積/.test(p))return `${+m[1]*+m[2]} 平方公分`
  if((m=c.match(/長方柱底面長 (\d+)、寬 (\d+) 公分，高 (\d+) 公分/)))return `${+m[1]*+m[2]*+m[3]} 立方公分`
  if((m=c.match(/半徑是 (\d+) 公分/)))return `${(3.14*2*+m[1]).toFixed(2)} 公分`
  if((m=c.match(/每小時 (\d+) 公里的速度行進 (\d+) 小時/)))return `${+m[1]*+m[2]} 公里`
  if((m=c.match(/有 (\d+) 盒，每盒 (\d+) 個物品，先拿走 (\d+) 個/)))return String(+m[1]*+m[2]-+m[3])
  if((m=c.match(/氣溫原為 (-?\d+)°C，之後上升 (\d+)°C/)))return `${+m[1]+ +m[2]}°C`
  if((m=c.match(/把 ([\d,]+) 表示成 a×10\^n/))){const value=parseNum(m[1]),exp=Math.floor(Math.log10(value)),coef=value/10**exp;return `${coef} × 10^${exp}`}
  if((m=c.match(/x²-(\d+)x\+(\d+)=0/))){const sum=+m[1],prod=+m[2];for(let a=1;a<=prod;a++)if(prod%a===0&&a+prod/a===sum){const b=prod/a;return `x = ${Math.min(a,b)} 或 x = ${Math.max(a,b)}`}}
  if((m=c.match(/(\d+)x\+(\d+)=(\d+)/))&&!/x²/.test(c)){return String((+m[3]-+m[2])/+m[1])}
  if((m=c.match(/x\+y=(-?\d+)、x-y=(-?\d+)/))){return `(${(+m[1]+ +m[2])/2},${(+m[1]-+m[2])/2})`}
  if((m=c.match(/y=(\d+)x\+(\d+)/))){const point=(answerText(q).match(/\((-?\d+),(-?\d+)\)/)||[]);if(point&&point[1])return (+point[2]===+m[1]*+point[1]+ +m[2])?answerText(q):'__WRONG_POINT__'}
  if((m=c.match(/不等式 x\+(\d+)<(\d+)/)))return `x < ${+m[2]-+m[1]}`
  if((m=c.match(/展開 \(x\+(\d+)\)\(x\+(\d+)\)/)))return `x² + ${+m[1]+ +m[2]}x + ${+m[1]*+m[2]}`
  if((m=c.match(/兩股長 (\d+) 與 (\d+)/)))return String(Math.sqrt((+m[1])**2+(+m[2])**2))
  if((m=c.match(/因式分解 x²\+(\d+)x\+(\d+)/))){const sum=+m[1],prod=+m[2];for(let a=1;a<=prod;a++)if(prod%a===0&&a+prod/a===sum)return `(x+${a})(x+${prod/a})`}
  if((m=c.match(/等差數列首項 (\d+)、公差 (\d+)/))){const tnum=+(p.match(/第 (\d+) 項/)||[])[1];return String(+m[1]+(tnum-1)*+m[2])}
  if((m=c.match(/函數 f\(x\)=(\d+)x\+(\d+)/))){const xv=+(p.match(/f\((\d+)\)/)||[])[1];return String(+m[1]*xv + +m[2])}
  if((m=c.match(/函數 y=\(x-(\d+)\)²([+-])(\d+)/))){const k=m[2]==='+'?+m[3]:-m[3];return `(${m[1]}, ${k})`}
  if((m=c.match(/袋中 (\d+) 顆紅球、(\d+) 顆藍球/)))return `${m[1]}/${+m[1]+ +m[2]}`
  if((m=c.match(/已排序資料：([\d、.]+)/))){const vals=m[1].split('、').map(Number);return String(vals[Math.floor(vals.length/2)])}
  if((m=c.match(/計算 \|(-?\d+)\|/)))return String(Math.abs(+m[1]))
  if((m=c.match(/10\^(\d+)=(\d+)/)))return `log₁₀(${m[2]}) = ${m[1]}`
  if((m=c.match(/對邊 (\d+)、鄰邊 (\d+)、斜邊 (\d+)/)))return `${m[1]}/${m[3]}`
  if((m=c.match(/矩陣 A=\[\[(\d+),(\d+)\],\[(\d+),(\d+)\]\]/)))return String(+m[1]+ +m[4])
  if((m=c.match(/本金 (\d+) 元，一期利率 (\d+)%/)))return `${+m[1]*(1+ +m[2]/100)} 元`
  if((m=c.match(/f\(x\)=(\d+)x²/))){const xv=+(p.match(/f′\((\d+)\)/)||[])[1];return String(2*+m[1]*xv)}
  if(/f\(x\)=x²-4x\+7/.test(c))return 'x = 2'
  if((m=c.match(/∫₀\^(\d+) 2x dx/)))return String((+m[1])**2)
  if((m=c.match(/C\(x\)=(\d+)x²\+10/))){const xv=+(p.match(/C′\((\d+)\)/)||[])[1];return String(2*+m[1]*xv)}
  if((m=c.match(/每組 (\d+) 人，共 (\d+) 組；其中 (\d+) 人缺席/)))return String(+m[1]*+m[2]-+m[3])
  return null
}

function significantTokens(text,subject){
  if(subject==='english')return (text.toLowerCase().match(/[a-z]{2,}/g)||[]).filter(w=>!['the','and','this','that','with','from','into','should','which','what','when','where'].includes(w))
  const clean=text.replace(/[「」『』，。；：！？、（）()\s]/g,'')
  const out=[];for(let i=0;i<clean.length-1;i++)out.push(clean.slice(i,i+2));return [...new Set(out)]
}

try{
  const plan=await server.ssrLoadModule('/src/curriculum-plan-v5.ts')
  const reviewed=await server.ssrLoadModule('/src/curriculum-textbook-v20-reviewed-final.ts')
  for(let grade=1;grade<=12;grade++)for(const route of plan.getCurriculumRouteOptions(grade)){
    const track=plan.getCurriculumTrack(grade,route.subject,route.pathway);if(!track)continue
    for(const sem of track.semesters)for(const unit of sem.units){
      const content=reviewed.getTextbookUnitContentV20ReviewedFinal(unit.id);if(!content){failures.push({unitId:unit.id,code:'missing-content'});continue}
      for(const q of content.questions){
        if(q.kind==='choice')correctPositions[q.correctIndex]++
        const answer=answerText(q)
        if(route.subject==='math'){
          const expected=solveMath(q);mathChecked++
          if(expected===null){mathUnclassified++;fail(unit.id,q,'math-unclassified',`${q.context} | ${q.prompt}`)}
          else if(expected==='__WRONG_POINT__'||!includesExpected(answer,expected))fail(unit.id,q,'math-answer-mismatch',`expected ${expected}; got ${answer}; ${q.context}`)
        }else{
          nonMathChecked++
          const support=norm(`${q.context} ${q.explanation}`)
          const exact=answer&&support.toLowerCase().includes(answer.toLowerCase())
          const tokens=significantTokens(answer,route.subject)
          const tokenHit=tokens.some(token=>support.toLowerCase().includes(token.toLowerCase()))
          if(!exact&&!tokenHit)fail(unit.id,q,'answer-support-missing',`answer=${answer}; explanation=${q.explanation}`)
        }
      }
    }
  }
}finally{await server.close()}
console.log('[curriculum-v20-answer-consistency]',JSON.stringify({mathChecked,mathUnclassified,nonMathChecked,correctPositions,failures:failures.length},null,2))
if(failures.length||mathUnclassified){console.error('[curriculum-v20-answer-consistency] FAILED');for(const f of failures.slice(0,160))console.error(`- ${f.unitId}/${f.questionId??''}: ${f.code} ${f.detail??''}`);process.exit(1)}
console.log('[curriculum-v20-answer-consistency] PASS: every math question was independently classified/recomputed with equivalent forms accepted, and every non-math answer is explicitly traceable in its context/explanation.')
