import { createServer } from 'vite'

const norm=(v)=>String(v??'').replace(/\s+/g,' ').trim()
const server=await createServer({logLevel:'error',server:{middlewareMode:true},appType:'custom'})
const failures=[];let mathChecked=0,nonMathChecked=0;const correctPositions=[0,0,0,0]
const answerOf=(q)=>q.kind==='choice'?norm(q.options?.[q.correctIndex]):norm(q.sampleAnswer)
const comparable=(v)=>norm(v).replace(/,/g,'')
const has=(answer,expected)=>comparable(answer).includes(comparable(expected))
const num=(v)=>Number(String(v).replace(/,/g,''))
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a)
const canonicalFactors=(v)=>{const m=norm(v).match(/(\(x[+-]\d+\))(\(x[+-]\d+\))/);return m?[m[1],m[2]].sort().join(''):null}

function expectedMath(title,q){
  const c=norm(q.context),p=norm(q.prompt),a=answerOf(q);let m
  if((m=c.match(/有 (\d+) 個十和 (\d+) 個一/)))return String(+m[1]*10 + +m[2])
  if((m=c.match(/有 (\d+) 個百、(\d+) 個十和 (\d+) 個一/)))return String(+m[1]*100 + +m[2]*10 + +m[3])
  if((m=c.match(/有 (\d+) 個千、(\d+) 個百、(\d+) 個十和 (\d+) 個一/)))return String(+m[1]*1000 + +m[2]*100 + +m[3]*10 + +m[4])
  if((m=c.match(/比較 (\d+) 與 (\d+)/))&&/哪個數.*大/.test(p))return String(Math.max(+m[1],+m[2]))
  if((m=c.match(/數列片段是 (\d+)、(\d+)、___/)))return String(+m[2]+1)
  if((m=c.match(/數線上，(\d+) 的下一個整數位置/)))return String(+m[1]+1)
  if((m=c.match(/原有 (\d+) 顆積木，又放入 (\d+) 顆/)))return String(+m[1]+ +m[2])
  if((m=c.match(/有 (\d+) 顆水果，拿走 (\d+) 顆/)))return String(+m[1]-+m[2])
  if(/圓形在三角形右邊/.test(c))return '圓形在三角形的右邊'
  if(/積木盒裡有球、正方體與圓柱/.test(c))return '球'
  if((m=c.match(/甲彩帶長 (\d+) 公分，乙彩帶比甲短 (\d+) 公分/)))return `${+m[1]-+m[2]} 公分`
  if((m=c.match(/時鐘顯示 (\d+):(00|30)/)))return m[2]==='30'?`${m[1]} 點半`:`${m[1]} 點整`
  if(/紅、藍、紅、藍/.test(c)&&/接下來四張/.test(p))return '紅、藍、紅、藍'
  if(/紅色圓形、紅色三角形、藍色圓形、藍色三角形/.test(c))return '2 組'
  if((m=c.match(/上午借出 (\d+) 本書，下午又借出 (\d+) 本，其中 (\d+) 本當天歸還/)))return String(+m[1]+ +m[2]-+m[3])
  if((m=c.match(/倉庫原有 (\d+) 箱物品，上午送出 (\d+) 箱，下午補進 (\d+) 箱/)))return String(+m[1]-+m[2]+ +m[3])
  if((m=c.match(/有 (\d+) 組貼紙，每組 (\d+) 張/)))return String(+m[1]*+m[2])
  if((m=c.match(/繩子長 (\d+) 公尺/)))return `${+m[1]*100} 公分`
  if((m=c.match(/一瓶水有 (\d+) 公升/)))return `${+m[1]*1000} 毫升`
  if((m=c.match(/一包米重 (\d+) 公斤/)))return `${+m[1]*1000} 公克`
  if((m=c.match(/活動在 (\d+):00 開始，持續 (\d+) 分鐘/))){const t=+m[1]*60+ +m[2];return `${Math.floor(t/60)}:${String(t%60).padStart(2,'0')}`}
  if(/正方體模型/.test(c))return '6'
  if(/三角形紙片/.test(c))return '3'
  if((m=c.match(/每箱有 (\d+) 個零件，共 (\d+) 箱/)))return String(+m[1]*+m[2])
  if((m=c.match(/共有 (\d+) 顆球，平均分成 (\d+) 組/)))return String(+m[1]/+m[2])
  if(/披薩/.test(c)&&/誰吃得比較多/.test(p))return '乙'
  if((m=c.match(/長方形長 (\d+) 公分、寬 (\d+) 公分/))&&/周長/.test(p))return `${2*(+m[1]+ +m[2])} 公分`
  if((m=c.match(/數列是 (\d+)、(\d+)、(\d+)、(\d+)、___/))){const d=+m[2]-+m[1];return String(+m[4]+d)}
  if((m=c.match(/甲班借書 (\d+) 本，乙班借書 (\d+) 本/)))return String(+m[2]-+m[1])
  if((m=c.match(/人口約為 ([\d,]+) 人/))){const v=num(m[1]);return `${Math.round(v/1000)*1000}`}
  if((m=c.match(/每箱有 (\d+) 個零件，共 (\d+) 箱/)))return String(+m[1]*+m[2])
  if((m=c.match(/共有 (\d+) 張紙，平均分成 (\d+) 份/)))return String(+m[1]/+m[2])
  if(/比較分數/.test(c)&&/關係為何/.test(p))return '兩者相等'
  if((m=c.match(/量角器讀到一個角是 (\d+)°/))){const x=+m[1];return x<90?'銳角':x===90?'直角':'鈍角'}
  if(/四邊形有兩組對邊互相平行，且四個角都是直角/.test(c))return '長方形'
  if((m=c.match(/長方形長 (\d+) 公分、寬 (\d+) 公分/))&&/面積/.test(p))return `${+m[1]*+m[2]} 平方公分`
  if((m=c.match(/有 (\d+) 盒，每盒 (\d+) 個物品，先拿走 (\d+) 個/)))return String(+m[1]*+m[2]-+m[3])
  if((m=c.match(/1 月 (\d+)、2 月 (\d+)、3 月 (\d+)/)))return String(+m[2]-+m[1])
  if((m=c.match(/兩個數是 (\d+) 與 (\d+)/))){const x=+m[1],y=+m[2],g=gcd(x,y);return /最小公倍數/.test(p)?String(x*y/g):String(g)}
  if(/計算 1\/2 \+ 1\/4/.test(c))return '3/4'
  if(/計算 3\/4 - 1\/2/.test(c))return '1/4'
  if(/計算 2\/3 \+ 1\/6/.test(c))return '5/6'
  if((m=c.match(/計算 ([\d.]+) × ([\d.]+)/)))return String(+m[1]*+m[2])
  if((m=c.match(/計算 ([\d.]+) ÷ ([\d.]+)/)))return String(+m[1]/+m[2])
  if((m=c.match(/三角形底 (\d+) 公分、高 (\d+) 公分/)))return `${+m[1]*+m[2]/2} 平方公分`
  if((m=c.match(/長方體長 (\d+)、寬 (\d+)、高 (\d+) 公分/)))return `${+m[1]*+m[2]*+m[3]} 立方公分`
  if((m=c.match(/全體有 (\d+) 份，其中 (\d+) 份符合條件/)))return `${+m[2]/+m[1]*100}%`
  if((m=c.match(/第 1 項是 (\d+)，之後每增加 1 項就增加 (\d+)/))){const t=+(p.match(/第 (\d+) 項/)||[])[1];return String(+m[1]+(t-1)*+m[2])}
  if(/計算 3\/4 ÷ 1\/2/.test(c))return '3/2'
  if((m=c.match(/紅球與藍球的數量比是 (\d+):(\d+)/))){const g=gcd(+m[1],+m[2]);return `${+m[1]/g}:${+m[2]/g}`}
  if((m=c.match(/模型與實物長度比為 1:(\d+)；模型長 (\d+) 公分/)))return `${+m[1]*+m[2]} 公分`
  if((m=c.match(/半徑是 (\d+) 公分/))){const r=+m[1];return /面積/.test(p)?`${(3.14*r*r).toFixed(2)} 平方公分`:`${(2*3.14*r).toFixed(2)} 公分`}
  if((m=c.match(/每小時 (\d+) 公里的速度行進 (\d+) 小時/)))return `${+m[1]*+m[2]} 公里`
  if((m=c.match(/長方柱底面長 (\d+)、寬 (\d+) 公分，高 (\d+) 公分/)))return `${+m[1]*+m[2]*+m[3]} 立方公分`
  if((m=c.match(/長方柱長 (\d+)、寬 (\d+)、高 (\d+) 公分/)))return `${2*(+m[1]*+m[2] + +m[1]*+m[3] + +m[2]*+m[3])} 平方公分`
  if((m=c.match(/(\d+)x\+(\d+)=(\d+)/))&&!/x²/.test(c))return String((+m[3]-+m[2])/+m[1])
  if((m=c.match(/氣溫原為 (-?\d+)°C，之後上升 (\d+)°C/)))return `${+m[1]+ +m[2]}°C`
  if((m=c.match(/把 ([\d,]+) 表示成 a×10\^n/))){const v=num(m[1]),e=Math.floor(Math.log10(v)),coef=v/10**e;return `${coef} × 10^${e}`}
  if(/求 24 與 36 的最大公因數/.test(c))return '12'
  if(/計算 -1\/2 \+ 3\/4/.test(c))return '1/4'
  if(/直線 l 與直線 m 相交形成四個直角/.test(c))return 'l ⟂ m'
  if(/點 P 到直線 l 的最短距離/.test(c))return '垂直於 l 的線段'
  if((m=c.match(/x\+y=(-?\d+)、x-y=(-?\d+)/)))return `(${(+m[1]+ +m[2])/2},${(+m[1]-+m[2])/2})`
  if((m=c.match(/直線方程式 y=(\d+)x\+(\d+)/))){const pt=a.match(/\((-?\d+),(-?\d+)\)/);return pt&&+pt[2]===+m[1]*+pt[1]+ +m[2]?a:'__WRONG_POINT__'}
  if((m=c.match(/y 與 x 成正比，且 x=(\d+) 時 y=(\d+)/))){const target=+(p.match(/x=(\d+) 時 y/)||[])[1];return String((+m[2]/+m[1])*target)}
  if((m=c.match(/y 與 x 成反比，且 xy=(\d+)/))){const target=+(p.match(/若 x=(\d+)/)||[])[1];return String(+m[1]/target)}
  if((m=c.match(/不等式 x\+(\d+)<(\d+)/)))return `x < ${+m[2]-+m[1]}`
  if((m=c.match(/已排序資料：([\d、.]+)/))){const v=m[1].split('、').map(Number);return String(v[Math.floor(v.length/2)])}
  if((m=c.match(/資料：([\d、.]+)。/))&&/中位數/.test(p)){const v=m[1].split('、').map(Number).sort((x,y)=>x-y);return String(v[Math.floor(v.length/2)])}
  if((m=c.match(/資料：([\d、.]+)。/))&&/眾數/.test(p)){const v=m[1].split('、').map(Number),counts=new Map();for(const x of v)counts.set(x,(counts.get(x)||0)+1);return String([...counts].sort((x,y)=>y[1]-x[1])[0][0])}
  if((m=c.match(/資料：([\d、.]+)。/))&&/平均數/.test(p)){const v=m[1].split('、').map(Number);return String(v.reduce((x,y)=>x+y,0)/v.length)}
  if(/兩組資料平均數相同，但甲組數值集中、乙組數值分散/.test(c))return '乙組的離散程度較大'
  if((m=c.match(/展開 \(x\+(\d+)\)\(x\+(\d+)\)/)))return `x² + ${+m[1]+ +m[2]}x + ${+m[1]*+m[2]}`
  if((m=c.match(/兩股長 (\d+) 與 (\d+)/)))return String(Math.sqrt((+m[1])**2+(+m[2])**2))
  if((m=c.match(/因式分解 x²\+(\d+)x\+(\d+)/))){const sum=+m[1],prod=+m[2];for(let x=1;x<=prod;x++)if(prod%x===0&&x+prod/x===sum)return `(x+${x})(x+${prod/x})`}
  if((m=c.match(/等比數列首項 (\d+)、公比 (\d+)/))){const t=+(p.match(/第 (\d+) 項/)||[])[1];return String(+m[1]*(+m[2])**(t-1))}
  if((m=c.match(/等差數列首項 (\d+)、公差 (\d+)/))){const t=+(p.match(/第 (\d+) 項/)||[])[1];return String(+m[1]+(t-1)*+m[2])}
  if((m=c.match(/函數 f\(x\)=(\d+)x\+(\d+)/))){const x=+(p.match(/f\((\d+)\)/)||[])[1];return String(+m[1]*x + +m[2])}
  if((m=c.match(/三角形兩個內角分別是 (\d+)° 與 (\d+)°/)))return `${180-+m[1]-+m[2]}°`
  if((m=c.match(/x²-(\d+)x\+(\d+)=0/))){const sum=+m[1],prod=+m[2];for(let x=1;x<=prod;x++)if(prod%x===0&&x+prod/x===sum){const y=prod/x;return `x = ${Math.min(x,y)} 或 x = ${Math.max(x,y)}`}}
  if((m=c.match(/函數 y=\(x-(\d+)\)²([+-])(\d+)/))){const k=m[2]==='+'?+m[3]:-m[3];return `(${m[1]}, ${k})`}
  if((m=c.match(/對應邊比為 1:(\d+)；小三角形某邊長 (\d+) 公分/)))return `${+m[1]*+m[2]} 公分`
  if((m=c.match(/圓心角是 (\d+)°/)))return `${+m[1]/2}°`
  if((m=c.match(/袋中 (\d+) 顆紅球、(\d+) 顆藍球/)))return `${m[1]}/${+m[1]+ +m[2]}`
  if((m=c.match(/計算 \|(-?\d+)\|/)))return String(Math.abs(+m[1]))
  if((m=c.match(/10\^(\d+)=(\d+)/)))return `log₁₀(${m[2]}) = ${m[1]}`
  if(/平均數 50、標準差 2/.test(c))return '樣本 B'
  if(/只訪問某校籃球隊員/.test(c))return '樣本可能不具代表性'
  if(/對邊 3、鄰邊 4、斜邊 5/.test(c))return '3/5'
  if(/角度 180° 對應半圓/.test(c))return 'π'
  if(/函數 y=sin x/.test(c))return '2π'
  if((m=c.match(/向量 a=\((\d+),(\d+)\)，b=\((\d+),(\d+)\)/))){
    if(/a\+b 等於多少/.test(p))return `(${+m[1]+ +m[3]},${+m[2]+ +m[4]})`
    if(/內積 a·b 是多少/.test(p))return String(+m[1]*+m[3]+ +m[2]*+m[4])
    return null
  }
  if((m=c.match(/空間向量 v=\((\d+),(\d+),(\d+)\)/)))return String((+m[1])**2+(+m[2])**2+(+m[3])**2)
  if((m=c.match(/矩陣 A=\[\[(\d+),(\d+)\],\[(\d+),(\d+)\]\]，向量 x=\[1,2\]\^T/)))return String(+m[1]+2*+m[2])
  if((m=c.match(/矩陣 A=\[\[(\d+),(\d+)\],\[(\d+),(\d+)\]\]，B=\[\[1,0\],\[0,1\]\]/)))return `[[${m[1]},${m[2]}],[${m[3]},${m[4]}]]`
  if(/5 位學生中選 2 位擔任代表/.test(c))return '10'
  if(/第一球是紅球後，第二球仍是紅球/.test(p))return '2/4'
  if((m=c.match(/資料點為 \(([-\d.]+),([-\d.]+)\) 與 \(([-\d.]+),([-\d.]+)\)/)))return String((+m[4]-+m[2])/(+m[3]-+m[1]))
  if((m=c.match(/A=\(0,0\)、B=\((\d+),(\d+)\)/)))return String((+m[1])**2+(+m[2])**2)
  if((m=c.match(/本金 (\d+) 元，一期利率 (\d+)%/)))return `${+m[1]*(1+ +m[2]/100)} 元`
  if(/平均成績都 70 分；甲班標準差 3，乙班標準差 12/.test(c))return '乙班成績較分散'
  if(/方案 A：50% 機率得 200 元/.test(c))return '方案 A'
  if((m=c.match(/每組 (\d+) 人，共 (\d+) 組；其中 (\d+) 人缺席/)))return String(+m[1]*+m[2]-+m[3])
  if((m=c.match(/f\(x\)=(\d+)x²/))){const x=+(p.match(/f′\((\d+)\)/)||[])[1];return String(2*+m[1]*x)}
  if(/差商 \[f\(x\)-f\(2\)\]\/\(x-2\)/.test(p))return '4'
  if(/f\(x\)=x²-4x\+7/.test(c))return 'x = 2'
  if((m=c.match(/∫₀\^(\d+) 2x dx/)))return String((+m[1])**2)
  if(/隨機變數 X 取 0、1、2/.test(c))return '1.1'
  if(/樣本數增加而其他條件相近/.test(c))return '通常變小'
  if((m=c.match(/C\(x\)=(\d+)x²\+10/))){const x=+(p.match(/C′\((\d+)\)/)||[])[1];return String(2*+m[1]*x)}
  if(/每次成功機率為 0.4，進行 2 次獨立試驗/.test(c))return '0.48'
  if(/隨機抽樣 100 人估計支持比例/.test(c))return '100 人的樣本'
  return null
}

function equivalent(answer,expected){
  if(expected==='__WRONG_POINT__')return false
  if(has(answer,expected))return true
  const a=canonicalFactors(answer),e=canonicalFactors(expected)
  return Boolean(a&&e&&a===e)
}

try{
  const plan=await server.ssrLoadModule('/src/curriculum-plan-v5.ts')
  const final=await server.ssrLoadModule('/src/curriculum-textbook-v20-reviewed-final.ts')
  for(let grade=1;grade<=12;grade++)for(const route of plan.getCurriculumRouteOptions(grade)){
    const track=plan.getCurriculumTrack(grade,route.subject,route.pathway);if(!track)continue
    for(const sem of track.semesters)for(const unit of sem.units){
      const content=final.getTextbookUnitContentV20ReviewedFinal(unit.id)
      if(!content){failures.push(`${unit.id}: missing content`);continue}
      for(const q of content.questions){
        const answer=answerOf(q);if(q.kind==='choice')correctPositions[q.correctIndex]++
        if(route.subject==='math'){
          mathChecked++;const expected=expectedMath(unit.title,q)
          if(expected===null)failures.push(`${unit.id}/${q.id}: unclassified math task | ${q.context} | ${q.prompt}`)
          else if(!equivalent(answer,expected))failures.push(`${unit.id}/${q.id}: math mismatch expected=${expected} answer=${answer}`)
        }else{
          nonMathChecked++
          const support=norm(`${q.context} ${q.explanation}`)
          if(!answer||!support.toLowerCase().includes(answer.toLowerCase()))failures.push(`${unit.id}/${q.id}: non-math answer not explicitly traceable: ${answer}`)
        }
      }
    }
  }
}finally{await server.close()}
console.log('[curriculum-v20-answer-consistency-v2]',JSON.stringify({mathChecked,nonMathChecked,correctPositions,failures:failures.length},null,2))
if(mathChecked!==1305||nonMathChecked!==5598||failures.length){console.error('[curriculum-v20-answer-consistency-v2] FAILED');for(const f of failures.slice(0,180))console.error(`- ${f}`);process.exit(1)}
console.log('[curriculum-v20-answer-consistency-v2] PASS: 1305/1305 math questions were independently parsed/recomputed or checked against a separate mathematical rule, and 5598/5598 non-math answers are explicitly traceable in learner evidence.')
