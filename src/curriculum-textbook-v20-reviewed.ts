import { getTextbookUnitContentV20Published } from './curriculum-textbook-v20-published'
import { resolveCurriculumUnit } from './curriculum-plan-v5'
import type { ReviewedConcept, ReviewedQuestion, ReviewedWorkedExample } from './curriculum-reviewed-social10'
import type { TextbookMisconception, TextbookVisual, TextbookVocabulary } from './curriculum-textbook-v14'
import type { TextbookUnitContentV20Final } from './curriculum-textbook-v20-final'

type UnitContext = NonNullable<ReturnType<typeof resolveCurriculumUnit>>
type Task = { context: string; prompt: string; correct: string; wrong: [string, string, string]; explanation: string }

type ChoiceExtras = Extract<ReviewedQuestion, { kind: 'choice' }> & { optionFeedback?: string[]; mediaAssetId?: string; audioText?: string }
type ResponseExtras = Extract<ReviewedQuestion, { kind: 'response' }> & { rubric?: string[]; mediaAssetId?: string; audioText?: string }

const norm = (value: unknown) => String(value ?? '').replace(/\s+/g, ' ').trim()
const compact = (value: unknown, max = 120) => { const s = norm(value); return s.length <= max ? s : `${s.slice(0, max - 1).replace(/[，、；：,.!?。！？\s]+$/g, '')}…` }

function hash(value: string) { let h = 2166136261; for (let i = 0; i < value.length; i += 1) { h ^= value.charCodeAt(i); h = Math.imul(h, 16777619) } return Math.abs(h >>> 0) }
function n(seed: string, min: number, max: number) { return min + (hash(seed) % (max - min + 1)) }
function gcd(a: number, b: number): number { return b ? gcd(b, a % b) : Math.abs(a) }
function uniqueWrong(correct: string, wrong: string[]) { const out: string[] = []; for (const item of wrong.map(norm)) if (item && item !== correct && !out.includes(item)) out.push(item); while (out.length < 3) out.push(`其他結果 ${out.length + 1}`); return out.slice(0, 3) as [string,string,string] }
function task(context: string, prompt: string, correct: string, wrong: string[], explanation: string): Task { return { context, prompt, correct, wrong: uniqueWrong(correct, wrong), explanation } }

function mathTask(c: UnitContext, i: number): Task {
  const title = c.unit.title, focus = c.unit.focus, t = `${title} ${focus}`, seed = `${c.unit.id}:${i}`
  if (/100 以內/.test(t)) { const tens=n(seed,1,9), ones=n(`${seed}:o`,0,9), value=tens*10+ones; return task(`一個兩位數有 ${tens} 個十和 ${ones} 個一。`, '這個數是多少？', String(value), [String(tens+ones),String(tens*10),String(ones*10+tens)], `${tens} 個十是 ${tens*10}，再加 ${ones} 個一得到 ${value}；數值保持在 100 以內。`) }
  if (/1000 以內/.test(t)) { const h=n(seed,1,9), d=n(`${seed}:d`,0,9), o=n(`${seed}:o`,0,9), value=h*100+d*10+o; return task(`一個三位數有 ${h} 個百、${d} 個十和 ${o} 個一。`, '這個數是多少？', String(value), [String(h*100+d+o),String(h*10+d*100+o),String(h*100+d*10)], `${h}×100+${d}×10+${o}=${value}，沒有超出 1000 以內的範圍。`) }
  if (/10000 以內|大數與四則/.test(t)) { const th=n(seed,1,9), h=n(`${seed}:h`,0,9), d=n(`${seed}:d`,0,9), o=n(`${seed}:o`,0,9), value=th*1000+h*100+d*10+o; return task(`一個四位數有 ${th} 個千、${h} 個百、${d} 個十和 ${o} 個一。`, '依位值寫出這個數。', String(value), [String(th*100+h*1000+d*10+o),String(th*1000+h*100+d+o),String(th+h+d+o)], `${th}×1000+${h}×100+${d}×10+${o}=${value}。`) }
  if (/形狀與位置/.test(t)) return task('桌面上，圓形在三角形右邊；正方形在三角形上方。', '哪個敘述符合位置關係？', '圓形在三角形的右邊', ['圓形在三角形左邊','正方形在三角形下方','三個圖形一定一樣大'], '題幹直接給出圓形相對三角形的位置；本單元先辨識形狀與位置，不需要計算面積。')
  if (/平面與立體圖形/.test(t)) return task('觀察一個正方體模型。', '正方體有幾個面？', '6', ['4','8','12'], '正方體有 6 個正方形的面、12 條邊與 8 個頂點。')
  if (/角度與幾何/.test(t)) { const angle=[30,90,120][i%3]; const correct=angle<90?'銳角':angle===90?'直角':'鈍角'; return task(`量角器讀到一個角是 ${angle}°。`, '這個角屬於哪一類？', correct, ['銳角','直角','鈍角','平角'].filter(x=>x!==correct).slice(0,3), `小於 90° 是銳角，等於 90° 是直角，大於 90° 且小於 180° 是鈍角；${angle}° 因此是${correct}。`) }
  if (/簡單圖形與幾何符號/.test(t)) return task('直線 l 與直線 m 相交形成四個直角。', 'l 與 m 的關係應如何表示？', 'l ⟂ m', ['l ∥ m','l = m','l ∈ m'], '兩直線相交成 90° 時互相垂直，符號是 ⟂。')
  if (/平面幾何/.test(t)) { const a=n(seed,35,70), b=n(`${seed}:b`,35,70), third=180-a-b; return task(`三角形兩個內角分別是 ${a}° 與 ${b}°。`, '第三個內角是多少？', `${third}°`, [`${a+b}°`,`${180-a}°`,`${180-b}°`], `三角形內角和為 180°，所以第三角為 180-${a}-${b}=${third}°。`) }
  if (/圓與幾何關係/.test(t)) { const central=2*n(seed,25,70); const inscribed=central/2; return task(`同一圓中，某弧所對的圓心角是 ${central}°。`, '同弧所對的圓周角是多少？', `${inscribed}°`, [`${central}°`,`${central*2}°`,`${180-inscribed}°`], '同弧所對的圓周角等於圓心角的一半。') }
  if (/相似與比例/.test(t)) { const scale=n(seed,2,5), small=n(`${seed}:s`,3,8), large=small*scale; return task(`兩個相似三角形的對應邊比為 1:${scale}；小三角形某邊長 ${small} 公分。`, '大三角形的對應邊長是多少？', `${large} 公分`, [`${small+scale} 公分`,`${large+scale} 公分`,`${small} 公分`], `相似圖形對應邊按同一比例放大，${small}×${scale}=${large}。`) }
  if (/平面向量/.test(t)) { const a=n(seed,1,5), b=n(`${seed}:b`,1,5), c2=n(`${seed}:c`,1,5), d=n(`${seed}:d`,1,5); return task(`向量 a=(${a},${b})，b=(${c2},${d})。`, 'a+b 等於多少？', `(${a+c2},${b+d})`, [`(${a*c2},${b*d})`,`(${a-c2},${b-d})`,`(${a+d},${b+c2})`], '向量相加是對應分量相加。') }
  if (/空間向量|空間與幾何關係/.test(t)) { const a=n(seed,2,6), b=n(`${seed}:b`,2,6); const sq=a*a+b*b; return task(`空間向量 v=(${a},${b},0)。`, 'v 的長度平方 |v|² 是多少？', String(sq), [String(a+b),String(a*a+b),String(a*b)], `|v|²=${a}²+${b}²+0²=${sq}。`) }
  if (/長度、容量與重量/.test(t)) { const m=n(seed,2,8); return task(`繩子長 ${m} 公尺。`, '換成公分是多少？', `${m*100} 公分`, [`${m*10} 公分`,`${m} 公分`,`${m*1000} 公分`], `1 公尺=100 公分，所以 ${m} 公尺=${m*100} 公分。`) }
  if (/長度與比較/.test(t)) { const a=n(seed,25,80), diff=n(`${seed}:d`,3,20); return task(`甲物長 ${a} 公分，乙物比甲物短 ${diff} 公分。`, '乙物長多少公分？', `${a-diff} 公分`, [`${a+diff} 公分`,`${diff} 公分`,`${a} 公分`], `${a}-${diff}=${a-diff}。`) }
  if (/長度與周長/.test(t)) { const a=n(seed,4,10), b=n(`${seed}:b`,3,9), p=2*(a+b); return task(`長方形長 ${a} 公分、寬 ${b} 公分。`, '周長是多少？', `${p} 公分`, [`${a*b} 公分`,`${a+b} 公分`,`${2*a+b} 公分`], `周長=2×(長+寬)=2×(${a}+${b})=${p}。`) }
  if (/時間初步/.test(t)) { const h=n(seed,7,15), half=i%2===1; return task(`時鐘顯示 ${h}:${half?'30':'00'}。`, '這個時間應如何讀？', half?`${h} 點半`:`${h} 點整`, [`${h+1} 點整`,`${h} 點 15 分`,`${h-1} 點半`], half?`${h}:30 是 ${h} 點半。`:`${h}:00 是 ${h} 點整。`) }
  if (/時間與日曆|時間計算/.test(t)) { const h=n(seed,8,14), mins=[30,60,90][i%3]; const total=h*60+mins, eh=Math.floor(total/60), em=total%60; const correct=`${eh}:${String(em).padStart(2,'0')}`; return task(`活動在 ${h}:00 開始，持續 ${mins} 分鐘。`, '活動幾點結束？', correct, [`${h}:${String(mins%60).padStart(2,'0')}`,`${eh+1}:${String(em).padStart(2,'0')}`,`${h-1}:00`], `把 ${mins} 分鐘加到 ${h}:00，得到 ${correct}。`) }
  if (/分類與規律|資料與規律/.test(t)) return task('圖卡依「紅、藍、紅、藍、紅、藍……」重複排列。', '接下來四張應如何排列？', '紅、藍、紅、藍', ['藍、紅、藍、紅','紅、紅、藍、藍','藍、藍、紅、紅'], '規律以「紅、藍」為一組重複，所以繼續是紅、藍、紅、藍。')
  if (/乘法概念/.test(t)) { const groups=n(seed,3,8), each=n(`${seed}:e`,2,9), total=groups*each; return task(`有 ${groups} 組，每組 ${each} 個。`, '總共有多少個？', String(total), [String(groups+each),String(total+each),String(each)], `${groups} 組同樣多可寫成 ${groups}×${each}=${total}。`) }
  if (/乘法與除法/.test(t)) { const each=n(seed,3,9), groups=n(`${seed}:g`,2,8), total=each*groups; return task(`共有 ${total} 顆球，平均分成 ${groups} 組。`, '每組有幾顆？', String(each), [String(groups),String(total-groups),String(total)], `${total}÷${groups}=${each}。`) }
  if (/分數初步/.test(t)) { const d=[3,4,5,6][i%4]; const a=1, b=2; return task(`同樣大的兩個披薩都平均分成 ${d} 份；甲吃 ${a} 份，乙吃 ${b} 份。`, '誰吃得比較多？', '乙', ['甲','一樣多','無法比較'], `分母相同時比較分子；${b}/${d} > ${a}/${d}，所以乙較多。`) }
  if (/分數與小數/.test(t)) { const pairs=[['1/2','0.5'],['1/4','0.25'],['3/4','0.75']]; const [frac,dec]=pairs[i%pairs.length]; return task(`比較分數 ${frac} 與小數 ${dec}。`, '兩者的關係為何？', '兩者相等', ['分數比較大','小數比較大','沒有辦法比較'], `${frac} 換成小數就是 ${dec}，所以相等。`) }
  if (/分數加減/.test(t)) { const mode=i%2; const correct=mode?'3/4':'1/4'; return mode?task('計算 1/2 + 1/4。','結果是多少？',correct,['2/6','1/6','3/8'],'1/2=2/4，所以 2/4+1/4=3/4。'):task('計算 3/4 - 1/2。','結果是多少？',correct,['2/2','1/2','2/4'],'1/2=2/4，所以 3/4-2/4=1/4。') }
  if (/分數與小數除法/.test(t)) return task('計算 3/4 ÷ 1/2。', '結果是多少？', '3/2', ['3/8','2/3','1/4'], '除以 1/2 等於乘以 2，所以 3/4×2=3/2。')
  if (/小數乘除/.test(t)) { const a=[1.2,2.5,3.4][i%3], b=2; const val=a*b; return task(`計算 ${a} × ${b}。`, '結果是多少？', String(val), [String(a+b),String(a/b),String(val*10)], `${a}×${b}=${val}。`) }
  if (/因數與倍數/.test(t)) { const a=[18,24,28][i%3], b=[30,36,42][i%3], g=gcd(a,b); return task(`兩個數是 ${a} 與 ${b}。`, '最大公因數是多少？', String(g), [String(a+b),String(Math.min(a,b)),String(a*b/g)], `列出共同因數或做質因數分解，可得 gcd(${a},${b})=${g}。`) }
  if (/因數分解與分數運算/.test(t)) { if(i%2===0){const a=24,b=36,g=gcd(a,b);return task(`求 ${a} 與 ${b} 的最大公因數。`,'答案是多少？',String(g),['6','18','72'],`共同質因數相乘得到 ${g}。`)} return task('計算 -1/2 + 3/4。','答案是多少？','1/4',['-1/4','2/4','5/4'],'-1/2=-2/4，所以 -2/4+3/4=1/4。') }
  if (/比率與百分率|比與比值/.test(t)) { const part=n(seed,1,4), total=5; const pct=part*20; return task(`全體有 ${total} 份，其中 ${part} 份符合條件。`, '符合條件的百分率是多少？', `${pct}%`, [`${part}%`,`${total*10}%`,`${100-pct}%`], `${part}/${total}=${part}/5=${pct}/100=${pct}%。`) }
  if (/比例與正反比/.test(t)) { const a=n(seed,2,5), b=n(`${seed}:b`,3,7), x=a*b; return task(`若 y 與 x 成正比，且 x=${a} 時 y=${x}。`, `x=${b} 時 y 是多少？`, String(b*b), [String(x+b),String(a*b),String(b)], `比例常數 k=${x}/${a}=${b}，所以 x=${b} 時 y=${b}×${b}=${b*b}。`) }
  if (/面積與體積/.test(t)) { if(i%2===0){const b=n(seed,4,10),h=n(`${seed}:h`,3,8),area=b*h/2;return task(`三角形底 ${b} 公分、高 ${h} 公分。`,'面積是多少？',`${area} 平方公分`,[`${b*h} 平方公分`,`${b+h} 平方公分`,`${2*(b+h)} 平方公分`],`三角形面積=${b}×${h}÷2=${area}。`)} const a=n(seed,3,7),b=n(`${seed}:b`,3,6),h=n(`${seed}:h`,2,5),v=a*b*h;return task(`長方體長 ${a}、寬 ${b}、高 ${h} 公分。`,'體積是多少？',`${v} 立方公分`,[`${a*b} 立方公分`,`${a+b+h} 立方公分`,`${2*(a+b+h)} 立方公分`],`體積=${a}×${b}×${h}=${v}。`) }
  if (/^面積$|理解平方單位/.test(title+' '+focus)) { const a=n(seed,4,10), b=n(`${seed}:b`,3,9), area=a*b; return task(`長方形長 ${a} 公分、寬 ${b} 公分。`, '面積是多少？', `${area} 平方公分`, [`${2*(a+b)} 平方公分`,`${a+b} 平方公分`,`${area*2} 平方公分`], `長方形面積=${a}×${b}=${area}。`) }
  if (/柱體與體積/.test(t)) { const a=n(seed,3,6), b=n(`${seed}:b`,2,5), h=n(`${seed}:h`,4,8), v=a*b*h; return task(`長方柱底面長 ${a}、寬 ${b} 公分，高 ${h} 公分。`, '體積是多少？', `${v} 立方公分`, [`${a*b} 立方公分`,`${a+b+h} 立方公分`,`${2*(a+b)*h} 立方公分`], `柱體體積=底面積×高=(${a}×${b})×${h}=${v}。`) }
  if (/圓與圓周/.test(t)) { const r=n(seed,2,7), d=2*r; return task(`一個圓的半徑是 ${r} 公分，取 π=3.14。`, '圓周長是多少？', `${(3.14*d).toFixed(2)} 公分`, [`${(3.14*r).toFixed(2)} 公分`,`${(3.14*r*r).toFixed(2)} 公分`,`${d} 公分`], `圓周長=2πr=3.14×${d}=${(3.14*d).toFixed(2)}。`) }
  if (/速率與比例應用/.test(t)) { const speed=n(seed,4,12), time=n(`${seed}:t`,2,5), dist=speed*time; return task(`以每小時 ${speed} 公里的速度行進 ${time} 小時。`, '共行進多少公里？', `${dist} 公里`, [`${speed+time} 公里`,`${speed/time} 公里`,`${dist+speed} 公里`], `距離=速率×時間=${speed}×${time}=${dist}。`) }
  if (/整數四則應用/.test(t)) { const groups=n(seed,3,6), each=n(`${seed}:e`,5,12), used=n(`${seed}:u`,2,8), left=groups*each-used; return task(`有 ${groups} 盒，每盒 ${each} 個物品，先拿走 ${used} 個。`, '還剩多少個？', String(left), [String(groups+each-used),String(groups*each+used),String(each-used)], `先算總數 ${groups}×${each}=${groups*each}，再減 ${used} 得 ${left}。`) }
  if (/整數運算與科學記號/.test(t)) { if(i%2===0){const start=-n(seed,2,10),rise=n(`${seed}:r`,3,12),ans=start+rise;return task(`氣溫原為 ${start}°C，之後上升 ${rise}°C。`,'最後氣溫是多少？',`${ans}°C`,[`${start-rise}°C`,`${Math.abs(ans)}°C`,`${-ans}°C`],`${start}+${rise}=${ans}。`)} const coef=n(seed,2,8),exp=n(`${seed}:e`,3,6),value=coef*10**exp;return task(`把 ${value.toLocaleString('en-US')} 表示成 a×10^n，1≤a<10。`,'正確的科學記號是？',`${coef} × 10^${exp}`,[`${coef} × 10^${exp-1}`,`${coef*10} × 10^${exp}`,`${coef/10} × 10^${exp+1}`],`小數點移 ${exp} 位，得到 ${coef}×10^${exp}。`) }
  if (/一元一次方程式|代數與國中銜接|數量關係/.test(t)) { const x=n(seed,2,9),a=n(`${seed}:a`,2,6),b=n(`${seed}:b`,1,8),total=a*x+b; return task(`${a}x+${b}=${total}。`,'x 的值是多少？',String(x),[String(x+b),String(total/a),String(a)],`先減 ${b} 再除 ${a}，得到 x=${x}。`) }
  if (/二元一次聯立方程式/.test(t)) { const x=n(seed,2,7),y=n(`${seed}:y`,1,6),s=x+y,d=x-y; return task(`聯立方程式 x+y=${s}、x-y=${d}。`,'(x,y) 是多少？',`(${x},${y})`,[`(${y},${x})`,`(${s},${d})`,`(${x+1},${y-1})`],`兩式相加得 2x=${2*x}，所以 x=${x}；再代回得 y=${y}。`) }
  if (/直角坐標與二元一次方程式圖形/.test(t)) { const m=n(seed,1,4),b=n(`${seed}:b`,1,5),x=n(`${seed}:x`,1,4),y=m*x+b; return task(`直線方程式 y=${m}x+${b}。`,'哪一點在這條直線上？',`(${x},${y})`,[`(${x},${y+1})`,`(${y},${x})`,`(0,0)`],`代入 x=${x} 得 y=${m}×${x}+${b}=${y}。`) }
  if (/一元一次不等式/.test(t)) { const a=n(seed,2,6),b=n(`${seed}:b`,8,15),limit=b-a; return task(`不等式 x+${a}<${b}。`,'解集為何？',`x < ${limit}`,[`x > ${limit}`,`x < ${b+a}`,`x = ${limit}`],`兩邊同減 ${a}，得到 x<${limit}。`) }
  if (/乘法公式與多項式|多項式與方程式|函數與多項式變化/.test(t)) { const a=n(seed,2,6),b=n(`${seed}:b`,1,5); return task(`展開 (x+${a})(x+${b})。`,'正確結果為何？',`x² + ${a+b}x + ${a*b}`,[`x² + ${a*b}x + ${a+b}`,`x² + ${a+b}x - ${a*b}`,`2x + ${a+b}`],`分配律得到 x²+${b}x+${a}x+${a*b}=x²+${a+b}x+${a*b}。`) }
  if (/平方根與畢氏定理/.test(t)) { const triples=[[3,4,5],[5,12,13],[8,15,17]], [a,b,h]=triples[i%3]; return task(`直角三角形兩股長 ${a} 與 ${b}。`,'斜邊長是多少？',String(h),[String(a+b),String(Math.abs(b-a)),String(a*b)],`畢氏定理：${a}²+${b}²=${h}²，所以斜邊 ${h}。`) }
  if (/^因式分解$/.test(title)) { const a=n(seed,1,5),b=n(`${seed}:b`,1,5); return task(`因式分解 x²+${a+b}x+${a*b}。`,'正確結果為何？',`(x+${a})(x+${b})`,[`(x-${a})(x-${b})`,`(x+${a+b})(x+${a*b})`,`x(x+${a+b})`],`找兩數和為 ${a+b}、積為 ${a*b}，得到 (x+${a})(x+${b})。`) }
  if (/數列與規律|數列與級數/.test(t)) { const first=n(seed,2,8),diff=n(`${seed}:d`,2,5),term=n(`${seed}:t`,5,8),value=first+(term-1)*diff; return task(`等差數列首項 ${first}、公差 ${diff}。`,`第 ${term} 項是多少？`,String(value),[String(first+term*diff),String(first*diff),String(term*diff)],`a_${term}=${first}+(${term}-1)×${diff}=${value}。`) }
  if (/線型函數|函數與圖形|函數、圖表與建模/.test(t)) { const m=n(seed,2,5),b=n(`${seed}:b`,1,7),x=n(`${seed}:x`,1,5),y=m*x+b; return task(`函數 f(x)=${m}x+${b}。`,`f(${x}) 是多少？`,String(y),[String(m+x+b),String(m*x),String(x+b)],`代入 x=${x}：${m}×${x}+${b}=${y}。`) }
  if (/二次方程式/.test(t)) { const r1=n(seed,1,4),r2=r1+n(`${seed}:r2`,1,3),sum=r1+r2,prod=r1*r2; return task(`x²-${sum}x+${prod}=0。`,'所有實數解為何？',`x = ${r1} 或 x = ${r2}`,[`x = ${sum}`,`x = ${prod}`,`x = -${r1} 或 x = -${r2}`],`因式分解為 (x-${r1})(x-${r2})=0，所以兩根為 ${r1}、${r2}；代回均成立。`) }
  if (/二次函數/.test(t)) { const h=n(seed,1,4),k=n(`${seed}:k`,-3,4); const expr=k>=0?`(x-${h})²+${k}`:`(x-${h})²-${Math.abs(k)}`; return task(`函數 y=${expr}。`,'拋物線頂點為何？',`(${h}, ${k})`,[`(0, ${k})`,`(${k}, ${h})`,`(-${h}, ${k})`],`頂點式 y=(x-h)²+k 的頂點是 (h,k)，所以是 (${h},${k})。`) }
  if (/機率與統計|排列組合與機率|機率與風險|機率模型|機率與統計深化/.test(t)) { const red=n(seed,2,6),blue=n(`${seed}:b`,2,7),total=red+blue; return task(`袋中 ${red} 顆紅球、${blue} 顆藍球，等可能抽 1 顆。`,'抽到紅球的機率？',`${red}/${total}`,[`${blue}/${total}`,`${red}/${blue}`,`1/${total}`],`有利結果 ${red} 個，全部 ${total} 個，所以機率 ${red}/${total}。`) }
  if (/統計圖表與統計數據|資料判讀|資料分析|資料分析與推論|資料分析與統計|統計與資料推論/.test(t)) { const a=n(seed,4,9),data=[a,a+2,a+3,a+6,a+9]; return task(`已排序資料：${data.join('、')}。`,'中位數是多少？',String(data[2]),[String(data[0]),String(data[4]),String(data.reduce((x,y)=>x+y,0)/5)],'5 筆排序資料的中央第 3 筆就是中位數。') }
  if (/實數與代數/.test(t)) { const x=-n(seed,2,9); return task(`計算 |${x}|。`,'結果是多少？',String(Math.abs(x)),[String(x),'0',String(Math.abs(x)+1)],`絕對值表示到 0 的距離，所以 |${x}|=${Math.abs(x)}。`) }
  if (/指數與對數/.test(t)) { const e=n(seed,2,5),value=10**e; return task(`10^${e}=${value}。`,'log₁₀ 的哪個值等於這個指數？',`log₁₀(${value}) = ${e}`,[`log₁₀(${e}) = ${value}`,`log₁₀(${value}) = ${e+1}`,`log₁₀(10) = ${value}`],`因為 10^${e}=${value}，所以 log₁₀(${value})=${e}。`) }
  if (/三角比與三角函數/.test(t)) { const triples=[[3,4,5],[5,12,13],[8,15,17]], [opp,adj,hyp]=triples[i%3]; return task(`一直角三角形對角 θ 的對邊 ${opp}、鄰邊 ${adj}、斜邊 ${hyp}。`,'sin θ 等於多少？',`${opp}/${hyp}`,[`${adj}/${hyp}`,`${opp}/${adj}`,`${hyp}/${opp}`],'sin θ=對邊/斜邊。') }
  if (/矩陣與線性關係|矩陣、資料與應用/.test(t)) { const a=n(seed,1,5),b=n(`${seed}:b`,1,5),d=n(`${seed}:d`,1,5),e=n(`${seed}:e`,1,5); return task(`矩陣 A=[[${a},${b}],[${d},${e}]]。`,'A 的跡（主對角線元素和）是多少？',String(a+e),[String(a+b),String(d+e),String(a*e)],`主對角線是 ${a} 與 ${e}，相加為 ${a+e}。`) }
  if (/指數、成長與財務情境/.test(t)) { const principal=1000,rate=[5,10][i%2],final=principal*(1+rate/100); return task(`本金 ${principal} 元，一期利率 ${rate}%，忽略其他費用。`,'一期後本利和是多少？',`${final} 元`,[`${principal+rate} 元`,`${principal-rate} 元`,`${principal*rate} 元`],`${principal}×(1+${rate}/100)=${final}。`) }
  if (/極限與微分/.test(t)) { const a=n(seed,2,5),x=n(`${seed}:x`,1,4),ans=2*a*x; return task(`f(x)=${a}x²。` ,`f′(${x}) 是多少？`,String(ans),[String(a*x),String(a*x*x),String(2*a)],`f′(x)=${2*a}x，代入 x=${x} 得 ${ans}。`) }
  if (/微分應用/.test(t)) return task('函數 f(x)=x²-4x+7。', '函數在哪個 x 值取得此拋物線的最小值？', 'x = 2', ['x = -2','x = 4','x = 0'], 'f′(x)=2x-4，令 f′(x)=0 得 x=2；且拋物線開口向上。')
  if (/積分與累積/.test(t)) { const a=n(seed,2,5); return task(`計算 ∫₀^${a} 2x dx。`,'定積分值是多少？',String(a*a),[String(2*a),String(a),String(2*a*a)],`2x 的反導函數是 x²，代入上下限得到 ${a}²-0=${a*a}。`) }
  if (/微分與生活模型/.test(t)) { const a=n(seed,2,6),x=n(`${seed}:x`,1,4),ans=2*a*x; return task(`成本模型 C(x)=${a}x²+10。`,`x=${x} 時的邊際變化率 C′(${x}) 是多少？`,String(ans),[String(a*x),String(a*x*x+10),String(2*a)],`C′(x)=${2*a}x，代入得 ${ans}。`) }
  if (/整合|專題|素養/.test(t)) { const a=n(seed,5,10),b=n(`${seed}:b`,2,6),c2=n(`${seed}:c`,1,5),ans=a*b-c2; return task(`專題資料顯示每組 ${a} 人，共 ${b} 組；其中 ${c2} 人缺席。`,'實際到場多少人？',String(ans),[String(a+b-c2),String(a*b+c2),String(a-c2)],`先算 ${a}×${b}=${a*b}，再減 ${c2} 得 ${ans}。`) }
  const x=n(seed,2,9),a=n(`${seed}:a`,2,5),b=n(`${seed}:b`,1,7),total=a*x+b
  return task(`本章焦點是「${focus}」。用等量關係 ${a}x+${b}=${total} 表示其中一個未知量。`,'x 的值是多少？',String(x),[String(x+b),String(a),String(total)],`由 ${a}x+${b}=${total} 得 x=${x}；答案需回到「${title}」的量與條件解讀。`)
}

function englishTask(c: UnitContext, i: number): Task {
  const t=`${c.unit.title} ${c.unit.focus}`.toLowerCase(), seed=`${c.unit.id}:${i}`, name=['Amy','Ben','Cindy','David'][hash(seed)%4]
  if (/聲音|字母音|拼讀|phonics/.test(t)) return task('The word “map” begins with the letter m.','Which beginning sound matches “map”?','/m/',['/s/','/t/','/f/'],'The letter m represents /m/ in “map.”')
  if (/字母/.test(t)) return task('Look at the lowercase letter “b”.','Which uppercase letter matches it?','B',['D','P','R'],'The uppercase form of b is B.')
  if (/招呼|自我介紹|簡單問答|口語小對話/.test(t)) return task(`${name} meets a new classmate who asks, “What is your name?”`,'Which reply is natural?',`My name is ${name}.`,['I am at seven o’clock.','Because my name.','The pencil is blue yesterday.'],'The question asks for a name, so “My name is …” answers directly.')
  if (/顏色|數字/.test(t)) return task('There are three red balls and two blue balls.','How many balls are there in all?','five',['two','three','seven'],'Three plus two is five; the color words identify the groups.')
  if (/教室|動作與指令/.test(t)) return task('The teacher says, “Please close the door.”','What should the student do?','Close the door.',['Open a book.','Write the word door.','Leave the classroom.'],'The imperative directly tells the listener to close the door.')
  if (/圖片閱讀|短句閱讀|閱讀策略|短文閱讀|長文|學術閱讀|論述閱讀|段落閱讀/.test(t)) return task('Passage: “Mina joined a garden project to learn how food grows. After three months, she could explain why sunlight and regular watering mattered.”','What is the main idea?','Mina learned about growing plants through the garden project.',['Mina stopped watering plants.','The passage is mainly about school exams.','Sunlight is never needed by plants.'],'The repeated details describe Mina learning about plant growth through the project.')
  if (/數字、時間|時間與日期/.test(t)) return task('The digital clock shows 7:30.','Which phrase matches the time?','seven thirty',['thirty seven','seven thirteen','half seven hours'],'7:30 is read “seven thirty.”')
  if (/be 動詞|be動詞|簡單句與問句|基本句型/.test(t)) { const subject=i%2?'They':name, correct=subject==='They'?'are':'is'; return task(`${subject} ___ ready for class now.`,`Choose the correct form of be for “${subject}”.`,correct,['am',correct==='are'?'is':'are','beed'],`Use “${correct}” with “${subject}”.`) }
  if (/現在簡單|現在式問答|日常作息|學校與生活/.test(t)) return task(`${name} goes to the library every Saturday.`,'Which sentence correctly describes the repeated habit?',`${name} goes to the library every Saturday.`,[`${name} going to the library every Saturday.`,`${name} went tomorrow every Saturday.`,`${name} go to the library every Saturday.`],'A repeated habit uses the simple present; a singular third-person subject takes -s/-es.')
  if (/現在進行/.test(t)) return task(`Right now, ${name} has a book open and is looking at the page.`,'Which sentence describes the action now?',`${name} is reading.`,[`${name} reads yesterday.`,`${name} reading is.`,`${name} was read now.`],'Use be + V-ing for an action in progress now.')
  if (/過去進行/.test(t)) return task(`At 8 p.m. yesterday, ${name} was in the middle of reading when the phone rang.`,'Which sentence describes the background action?',`${name} was reading.`,[`${name} is reading tomorrow.`,`${name} read when tomorrow.`,`${name} was read.`],'Past continuous uses was/were + V-ing for an action in progress at a past time.')
  if (/過去事件|過去簡單/.test(t)) return task(`Yesterday, ${name} visited a museum.`,'Which sentence correctly reports the event?',`${name} visited a museum yesterday.`,[`${name} visits a museum yesterday.`,`${name} will visited yesterday.`,`${name} visiting yesterday.`],'“Yesterday” signals a completed past event, so use the simple past.')
  if (/未來/.test(t)) return task(`${name} has a plan for tonight.`,'Which sentence expresses the plan?',`${name} is going to study tonight.`,[`${name} studied tonight tomorrow.`,`${name} going study tonight.`,`${name} studies yesterday tonight.`],'Be going to + base verb can express a plan.')
  if (/興趣與能力|情態|命令句/.test(t)) return task(`${name} wants to ask politely for permission to use a pencil.`,'Which sentence is appropriate?','Can I use your pencil, please?',['I can your pencil use.','Must I used your pencil yesterday?','Your pencil can I using.'],'A modal is followed by the base verb; “Can I…?” is a common permission request.')
  if (/不定詞|動名詞/.test(t)) return task(`${name} enjoys ___ books after school.`,'Choose the correct form.','reading',['to readed','read to','reads'],'Enjoy is commonly followed by a gerund: enjoy reading.')
  if (/比較級|最高級|比較與描述/.test(t)) return task('Bag A weighs 4 kg; Bag B weighs 7 kg.','Which comparison is correct?','Bag B is heavier than Bag A.',['Bag B is heavy than Bag A.','Bag A is more heavy Bag B.','Bag B heavier Bag A is.'],'Use the comparative “heavier than.”')
  if (/連接詞|複句/.test(t)) return task(`${name} stayed inside because it was raining heavily.`,'Which part gives the reason?','because it was raining heavily',['stayed inside tomorrow','because stayed is','heavily was inside'],'A clause introduced by “because” gives a reason.')
  if (/完成式/.test(t)) return task(`${name}'s homework is complete now.`,'Which sentence correctly uses present perfect?',`${name} has finished the homework.`,[`${name} have finish the homework.`,`${name} has finish the homework.`,`${name} finished has the homework.`],'Singular subject + has + past participle forms present perfect.')
  if (/關係子句/.test(t)) return task('Combine: “The student won the race.” “The student is my friend.”','Which sentence is correct?','The student who won the race is my friend.',['The student which won the race is my friend.','The student who win the race my friend.','Who the student won is my friend.'],'Use who for a person as the subject of a relative clause.')
  if (/被動/.test(t)) return task('A ball broke the window; the focus is the window.','Which passive sentence is correct?','The window was broken by the ball.',['The window broke by the ball.','The ball was broke the window.','The window was break.'],'Past passive uses was/were + past participle.')
  if (/條件/.test(t)) return task('Tomorrow’s plan depends on the weather.','Which first conditional is correct?','If it rains, we will stay inside.',['If it will rain, we stayed inside.','If it rains, we stayed yesterday.','If rains it, we will inside stay.'],'A common first conditional uses if + present, will + base verb.')
  if (/地點|方向|旅行|交通/.test(t)) return task('The library is next to the bank.','Where is the library?','It is next to the bank.',['It is yesterday.','It is seven kilograms.','It is more happy.'],'“Next to” describes location.')
  if (/食物|購物/.test(t)) return task(`${name} wants to buy two apples.`,'Which request is clear and polite?','I would like two apples, please.',['I am apple two please.','Two apples yesterday heavy.','Where apples was two?'],'“I would like …, please” clearly expresses a polite purchase request.')
  if (/天氣|服裝/.test(t)) return task('It is cold and raining outside.','Which choice fits the weather?','I should wear a raincoat and a warm jacket.',['I should wear sandals because it is hot.','Yesterday wears the weather.','A jacket is seven o’clock.'],'The clothing choice matches both rain and low temperature.')
  if (/健康/.test(t)) return task(`${name} has a fever and feels tired.`,'Which advice is appropriate?','You should rest and tell an adult.',['You should run a race immediately.','You are fever yesterday.','The fever is under the desk.'],'Should + base verb gives advice; rest and telling an adult fit the health context.')
  if (/句型整合|複雜句|篇章/.test(t)) return task(`${name} stayed home because the rain was heavy, although the event continued online.`,'Which clause expresses contrast?','although the event continued online',['because the rain was heavy',`${name} stayed home`,'the rain was heavy'],'Although introduces the contrasting information.')
  if (/字彙|搭配詞|詞族|語境/.test(t)) return task('Sentence: “The committee reached a decision after reviewing the evidence.”','Which word naturally completes “reach a ___”?','decision',['rain','quickly','blue'],'“Reach a decision” is a standard collocation.')
  if (/聽力|聽說|口語|簡報/.test(t)) return task('Speaker: “Our club meeting moves from Tuesday to Thursday at 4 p.m. in Room 203.”','Which note captures the essential information?','Thursday, 4 p.m., Room 203',['Tuesday, time unknown','Room 203 closes forever','The speaker dislikes clubs'],'A useful note preserves the changed day, time and place without adding unsupported claims.')
  if (/寫作|段落/.test(t)) return task('A paragraph explains two ways schools can reduce food waste.','Which topic sentence best introduces it?','Schools can take practical steps to reduce food waste.',['Lunch has five letters.','Yesterday schools because.','Every school wastes exactly the same amount.'],'A topic sentence states the controlling idea that the supporting details can develop.')
  if (/跨文化/.test(t)) return task(`${name} is unsure whether every family follows the same local custom.`,'Which response is responsible?','I can share what I know, but we should check reliable local guidance too.',['My experience represents everyone.','All customs are identical everywhere.','We should guess and state it as fact.'],'Cross-cultural communication should avoid overgeneralization and verify uncertainty.')
  return task(`Unit focus: ${c.unit.focus}`,'Which response best shows careful language use?','Use the complete context, meaning and form before choosing or producing the expression.',['Choose only by the first familiar word.','Ignore word order and time clues.','Use a form from an unrelated sentence.'],`The answer must fit the full context of “${c.unit.title}”.`)
}

function chineseTask(c: UnitContext, i: number): Task {
  const t=`${c.unit.title} ${c.unit.focus}`
  if (/注音|字音|聲韻|拼讀/.test(t)) return task('查字典時看到「好」在「好人」讀 ㄏㄠˇ，在「愛好」讀 ㄏㄠˋ。','這個例子最能說明什麼？','同一個字可能因詞義與語境有不同讀音',['只看字形就能決定所有讀音','聲調不影響讀音','每個字永遠只有一個讀音'],'讀音要連同詞語與語境判斷，不能只看單一字形。')
  if (/識字|字形|部件|工具|字詞|成語/.test(t)) return task('句子：「他做事一向很『謹慎』，會先確認資料再下結論。」','依語境，「謹慎」最接近哪個意思？','小心仔細',['急躁衝動','毫不在意','只求速度'],'上下文的「先確認資料再下結論」支持「小心仔細」的意思。')
  if (/句型|標點|完整句子|修辭|語法/.test(t)) { if(/修辭/.test(t)) return task('句子：「風在窗外唱著歌。」','這句主要使用哪一種修辭？','擬人',['排比','設問','引用'],'把「風」寫成會「唱歌」的人，屬於擬人。'); return task('原句：「下雨了我們帶著雨傘出門」','哪一種標點最能讓句意清楚？','下雨了，我們帶著雨傘出門。',['下雨了？我們帶著雨傘出門！','下雨了我們，帶著雨傘出門','下雨了；？我們帶著雨傘出門'],'逗號可分開前後相關分句，句末用句號結束完整陳述。') }
  if (/敘事|人物|情節|故事|記敘|描寫|小說/.test(t)) return task('短文：「小安忘了帶水壺，走到校門才想起來。他先打電話告訴家人，再向老師借杯子裝水。」','哪一項最能概括事件發展？','小安發現忘帶水壺後想辦法解決喝水問題',['小安一整天都沒有喝水','老師禁止小安喝水','家人立刻把水壺送到教室'],'摘要要保留「問題—處理」的主要事件，不能加入文中沒有的結果。')
  if (/說明|資訊|圖表/.test(t)) return task('資料：「校園雨水回收系統先收集屋頂雨水，再經過濾後用於澆灌。」','哪個敘述是資料直接支持的？','回收的雨水經處理後可用於澆灌',['雨水可以直接飲用','系統完全不需要過濾','所有用水都來自雨水'],'題幹明確說明「過濾後用於澆灌」，其他選項超出資料。')
  if (/詩|詩詞|古典|文言|古文|文化經典/.test(t)) return task('句子：「學而時習之，不亦說乎？」','依句意，這句最強調哪個學習態度？','學習後持續溫習與實踐',['只在考前背誦','完全不需要練習','學過一次就不用再碰'],'「時習」指經常溫習、實踐所學，重點在持續學習。')
  if (/論說|論證|思辨|公共議題|媒體/.test(t)) return task('主張：「學校應增加樹蔭空間。」證據甲：「三個夏日量測點中，有樹蔭處中午地表溫度都較低。」','哪個做法最能讓論證更完整？','說明量測條件並補充更多時段或地點資料',['把三個點直接說成全世界都一樣','刪掉量測方法','只重複主張不談證據'],'論證需要可追蹤的證據與適當的外推範圍。')
  if (/寫作|作文|表達|日記|書信|專題/.test(t)) return task('題目要寫「一次我學會負責的經驗」。','哪個寫作安排最合適？','交代事情背景，再寫自己的選擇、結果與反思',['只列十個形容詞','完全不寫事件只下結論','把三件無關事情混在一起'],'敘寫經驗需要事件脈絡、行動、結果與反思，才能回應題目。')
  if (/跨文本|多文本|整合|深度閱讀|學術/.test(t)) return task('文本甲主張增加公共自行車站點；文本乙提醒熱門站點尖峰時段常缺車。','整合兩文後，哪個結論最合理？','擴充站點時也要考慮尖峰調度',['兩文完全互相否定','只要設站就不可能缺車','乙文證明公共自行車沒有價值'],'整合要同時保留甲的擴充主張與乙的調度限制。')
  return task('短文：「社區把閒置空地改成小公園，居民開始在傍晚散步，孩子也多了一個遊戲場所。」','哪個主旨最符合短文？','空地改造改變了居民使用社區空間的方式',['居民不再外出','公園只供孩子使用','社區拆除了所有空地'],'主旨要涵蓋主要變化與影響，且不能超出文本。')
}

function scienceTask(c: UnitContext, i: number): Task {
  const t=`${c.unit.title} ${c.unit.focus}`
  if (c.pathway==='life') return task(`在「${c.unit.title}」活動中，兩次觀察都記下時間、地點與實際看到的現象。`,'哪種紀錄最適合拿來比較？','使用相同觀察項目並保留時間、地點與現象',['只寫「很好玩」','第二次改用完全不同方法卻直接比較','把沒看到的現象補進去'],'生活課的比較要建立在真實、可對照的觀察紀錄上。')
  if (/細胞/.test(t)) return task('顯微鏡下觀察到細胞膜、細胞質與細胞核。','哪個構造主要包圍細胞並控制物質進出？','細胞膜',['細胞核','染色體','葉綠體'],'細胞膜形成細胞邊界並參與物質進出調節。')
  if (/遺傳|基因|DNA|染色體|基因體|生物技術/.test(t)) return task('一段 DNA 上有能影響性狀的遺傳資訊，而 DNA 主要位在染色體上。','哪個關係最合理？','基因是 DNA 上的一段，染色體含有 DNA',['DNA 是基因內的一個細胞器','染色體只由蛋白質構成且沒有 DNA','每個基因都等於整條染色體'],'基因是 DNA 的功能片段，DNA 與蛋白質共同構成染色體。')
  if (/生態|食物網|族群|保育|全球變遷/.test(t)) return task('草地中有草、兔子與狐狸；兔子吃草，狐狸捕食兔子。','哪個順序表示能量傳遞？','草 → 兔子 → 狐狸',['狐狸 → 兔子 → 草','兔子 → 草 → 狐狸','草 → 狐狸 → 兔子'],'能量由生產者進入草食消費者，再到較高階消費者。')
  if (/生理|恆定|人體|健康|調控/.test(t)) return task('運動後體溫上升，人體增加皮膚血流與出汗。','這些反應最主要有助於什麼？','散熱並維持體溫恆定',['讓體溫持續無限制上升','停止所有代謝','把熱量全部儲存在肌肉'],'出汗蒸發與皮膚血流增加有助散熱，是維持恆定的調節。')
  if (/演化|分類/.test(t)) return task('某族群中原本就有不同遺傳變異；環境改變後，一些個體留下較多後代。','哪個敘述符合自然選擇？','有利變異的個體平均留下較多後代，使相關特徵比例改變',['個體因需要而立即產生指定基因','所有個體同時變成一樣','環境直接選出最強壯而不涉及繁殖差異'],'自然選擇作用在既有可遺傳變異上，透過繁殖成功差異改變族群。')
  if (/力|運動|力學|速度|加速度|能量|功/.test(t)) { if(/能量|功/.test(t)&&i%2){const f=n(`${c.unit.id}:${i}`,2,8),d=n(`${c.unit.id}:d:${i}`,2,6);return task(`沿力的方向施力 ${f} N，使物體移動 ${d} m。`,'此力做功多少焦耳？',`${f*d} J`,[`${f+d} J`,`${f/d} J`,`${d} J`],`W=Fd=${f}×${d}=${f*d} J。`)} const sec=n(`${c.unit.id}:${i}`,2,6),dist=n(`${c.unit.id}:d:${i}`,3,10)*sec;return task(`小車 ${sec} 秒前進 ${dist} 公尺。`,'平均速度大小是多少？',`${dist/sec} m/s`,[`${dist} m/s`,`${sec/dist} m/s`,`${dist+sec} m/s`],`平均速度大小=位移÷時間=${dist}÷${sec}=${dist/sec} m/s。`) }
  if (/電|電路|電磁|磁場|感應/.test(t)) { const v=n(`${c.unit.id}:${i}`,3,12),r=n(`${c.unit.id}:r:${i}`,2,6),current=v/r; return task(`電阻 ${r} Ω 兩端電壓為 ${v} V。`,'依歐姆定律，電流大小是多少？',`${current} A`,[`${v*r} A`,`${r/v} A`,`${v+r} A`],`I=V/R=${v}/${r}=${current} A。`) }
  if (/聲|波動/.test(t)) return task('兩個聲源振幅相近，但甲每秒振動 500 次，乙每秒振動 250 次。','哪個敘述較正確？','甲的頻率較高，因此音調通常較高',['甲一定比較大聲','乙的頻率較高','頻率與音調完全無關'],'音調主要和頻率相關；振幅較直接影響聲音強弱。')
  if (/光|光學/.test(t)) { const angle=n(`${c.unit.id}:${i}`,20,60); return task(`光線射到平面鏡，入射角以法線為基準是 ${angle}°。`,'反射角是多少？',`${angle}°`,[`${90-angle}°`,`${180-angle}°`,`${angle*2}°`],'反射定律指出入射角等於反射角，兩者都以法線為基準。') }
  if (/熱|溫度/.test(t)) return task('熱湯中的金屬湯匙一端浸在湯裡，過一會兒握柄也變熱。','主要是哪種熱傳方式？','傳導',['對流','輻射','蒸發'],'金屬內部熱能由高溫端傳向低溫端，屬於熱傳導。')
  if (/酸|鹼|pH|中和/.test(t)) { const ph=[2,5,9,12][i%4],correct=ph<7?'酸性':ph>7?'鹼性':'中性'; return task(`某水溶液 pH=${ph}。`,'這個溶液屬於哪一類？',correct,['酸性','中性','鹼性','無法判斷'].filter(x=>x!==correct).slice(0,3),`pH<7 為酸性，pH=7 中性，pH>7 鹼性；pH=${ph} 所以是${correct}。`) }
  if (/原子|分子|粒子|物質結構|週期/.test(t)) return task('一個中性原子有 8 個質子。','這個原子有幾個電子？','8',['4','16','0'],'中性原子的正負電荷總量相等，所以電子數等於質子數。')
  if (/化學反應|反應式|莫耳|化學計量|平衡|反應速率/.test(t)) { if(/莫耳|計量/.test(t)){const mol=n(`${c.unit.id}:${i}`,2,5);return task(`有 ${mol} mol 的某物質。`,'若只問粒子數量級，最直接要乘上哪個常數？','亞佛加厥常數',['萬有引力常數','光速','圓周率'],'1 mol 所含基本粒子數由亞佛加厥常數連結。')} return task('密閉容器中進行化學反應，反應前後都沒有物質進出。','總質量應如何變化？','反應前後總質量相同',['反應後一定增加','反應後一定減少','只要產生氣體質量就消失'],'密閉系統中化學反應遵守質量守恆。') }
  if (/有機|生物分子/.test(t)) return task('比較乙醇與葡萄糖等含碳化合物的結構與官能基。','判斷有機物性質時，哪個資訊最有用？','分子結構與官能基',['只看物質名稱長度','只看顏色就決定所有性質','假設所有含碳物都完全相同'],'有機物性質和分子骨架、官能基與分子間作用等結構特徵密切相關。')
  if (/高分子|材料/.test(t)) return task('兩種塑膠的單體與鏈結方式不同，拉伸強度也不同。','要解釋材料性質差異，最合理先比較什麼？','分子結構、鏈結與排列',['只比較產品商標','只看顏色','假設所有高分子性質相同'],'高分子材料的巨觀性質與鏈結、排列、結晶度等微觀結構相關。')
  if (/天氣|氣候|大氣|水循環|海氣|降水/.test(t)) return task('暖濕空氣上升後冷卻，水蒸氣形成許多微小水滴。','最直接是哪個過程？','凝結',['蒸發','融化','昇華'],'氣態水蒸氣冷卻成液態小水滴，屬於凝結。')
  if (/地質|板塊|地震|火山|岩石|地球歷史|地層|化石/.test(t)) return task('全球強震與許多火山帶常沿板塊邊界集中。','哪個解釋最合理？','板塊交互作用使邊界附近地殼活動較頻繁',['地震只由天氣造成','火山與板塊完全無關','所有板塊內部都不可能地震'],'板塊碰撞、張裂或錯動會集中地殼變形與岩漿活動。')
  if (/天文|宇宙|太陽|月|行星|太空|恆星/.test(t)) return task('一個月中，從地球看見月球亮面形狀有規律變化。','月相主要如何形成？','月球繞地球公轉時，我們看到受光半球的比例改變',['月球自己週期性發光熄滅','地球影子每天遮住月球形成所有月相','雲層固定遮住月球不同部分'],'月球一半受太陽照亮；相對位置改變使地球觀察者看到的亮面比例不同。')
  if (/近代物理|量子|相對論/.test(t)) return task('光照射金屬時，只有當光頻率高於某門檻才會產生光電子。','這個現象支持哪個觀念？','光能量具有與頻率相關的量子特性',['光能量只由振幅決定且與頻率無關','任何頻率的微弱光都必定產生電子','原子完全不和光交換能量'],'光電效應顯示單個光子的能量與頻率相關，存在門檻頻率。')
  if (/實驗|資料|探究|方法|分析|專題/.test(t)) return task(`研究「${c.unit.title}」時，規劃兩組可比較的觀察或量測。`,'哪個設計最能提高因果判斷品質？','只改變主要自變因，控制其他重要條件並重複量測',['同時改變很多條件','先決定結論再挑資料','每次使用不同方法卻直接比較'],'控制重要變因、重複量測並保留紀錄，才能讓差異較能指向被研究的因素。')
  return task(`本單元研究「${c.unit.title}」：${c.unit.focus}`,'面對新資料時，哪個科學做法最合理？','先區分觀察、模型與推論，再用資料檢查解釋',['先決定答案再找證據','把一次觀察當成普遍定律','忽略量測條件直接比較'],'科學判斷要保留可重複的證據、條件與模型的適用範圍。')
}

function socialTask(c: UnitContext, i: number): Task {
  const t=`${c.unit.title} ${c.unit.focus}`, pathway=c.pathway
  const history=pathway==='history'||/歷史|史料|過去|史前|日治|清帝國|戰後|世界史|東亞|帝國|殖民|革命|公共史|記憶|臺灣史/.test(t)
  if(history) return task(`研究「${c.unit.title}」時，資料甲是事件當時的官方紀錄，資料乙是多年後的回憶訪談；兩者對同一事件描述有差異。`,'第一步怎麼處理兩份史料較妥當？','確認作者、時間、目的與資料形成情境，再比較相同與差異',['年代較早就一定完全正確','只要內容不同就代表一份造假','直接挑符合自己立場的一份'],'史料要先做來源與脈絡判讀，再互證與解釋差異；不同並不自動代表造假。')
  const geography=pathway==='geography'||/地理|地圖|位置|區域|人口|聚落|都市|產業|環境|空間|氣候|地形|海域|人地/.test(t)
  if(geography){ if(/人口|都市/.test(t)){const a=n(`${c.unit.id}:${i}`,35,60),b=n(`${c.unit.id}:b:${i}`,a+1,75);return task(`同一年度資料顯示甲地都市人口比例 ${a}%，乙地 ${b}%。`,'只依這組數據，哪個敘述可以直接成立？',`乙地都市人口比例比甲地高 ${b-a} 個百分點`,['乙地一定比較富裕','甲地所有居民都住農村','兩地差異一定只由一個原因造成'],`數據能直接支持比例差 ${b-a} 個百分點，但不能單靠兩個比例推出財富或單一因果。`)} return task(`分析「${c.unit.title}」的一張主題地圖，圖上標有方向、比例尺、圖例與資料年份。`,'開始解讀空間分布前，哪個做法最重要？','先確認圖例、比例尺、方向與資料時間',['只看顏色深淺就下結論','忽略尺度把局部現象外推全球','把行政區面積當成人口密度'],'地圖符號、尺度與資料時間決定能做哪些比較與推論。') }
  if (/媒體|資訊|輿論/.test(t)) return task('同一公共事件有政府公告、新聞報導與匿名社群貼文。','第一步如何提高資訊判讀品質？','辨識來源、作者、日期與證據，再比較各說法',['轉發最多就一定正確','匿名貼文自動等於證據','只讀標題即可'],'來源可追溯性、時效與證據品質是媒體識讀基礎。')
  if (/經濟|市場|消費|成本|財政|貨幣|政策|福利/.test(t)) return task(`討論「${c.unit.title}」時，有一項政策方案會讓不同群體承擔不同成本與獲得不同利益。`,'哪種分析比較完整？','同時比較政策目標、成本、受益者、受影響者與替代方案',['只看總花費就決定公平與否','只問支持者不看反對理由','假設政策沒有任何取捨'],'公共經濟與政策判斷要同時考量效果、分配與機會成本，不能只看單一數字。')
  if (/法律|權利|法治|憲政|民主|政府|選舉|公民|政治/.test(t)) return task(`「${c.unit.title}」案例中，同時出現法律規定、政府政策與公民價值主張。`,'哪個整理方式最妥當？','先區分法律規範、政策選擇與價值立場，再查核制度與程序',['把個人喜好直接當成法律','用留言數決定法律內容','假設制度永遠不會改變'],'法律、政策與價值判斷層次不同，需分開並做時效與程序查核。')
  if (/文化|多元|社會|群體|身分|公平/.test(t)) return task(`在「${c.unit.title}」議題中，不同群體對同一公共空間有不同經驗與需求。`,'分析時哪個做法較妥當？','比較多個來源並注意群體內差異，避免用單一案例代表全部',['一個人可以代表整個群體','先決定哪個群體比較好再找證據','只要觀點不同就沒有可查證的事實'],'多元社會分析要區分事實與立場，也要避免過度概括。')
  return task(`討論「${c.unit.title}」時，有兩份來源不同、時間不同的公共資料。`,'哪個步驟最能形成可靠判斷？','先核對來源、時間與資料範圍，再比較能支持的事實與解釋',['只看標題就下結論','混用不同年代資料而不說明','把一個案例外推所有情況'],'社會科判讀要保留來源、時空脈絡與結論的證據界線。')
}

function taskFor(c: UnitContext, i: number) {
  if(c.pathway==='life') return scienceTask(c,i)
  if(c.subject==='math') return mathTask(c,i)
  if(c.subject==='english') return englishTask(c,i)
  if(c.subject==='science') return scienceTask(c,i)
  if(c.subject==='social') return socialTask(c,i)
  return chineseTask(c,i)
}

function rotate(taskItem: Task, seed: string) {
  const all=[taskItem.correct,...taskItem.wrong], shift=hash(seed)%4, options=all.slice(shift).concat(all.slice(0,shift)), correctIndex=options.indexOf(taskItem.correct)
  return {options,correctIndex}
}

function rewriteQuestion(c: UnitContext, q: ReviewedQuestion, i: number): ReviewedQuestion {
  const item=taskFor(c,i), packed=rotate(item,`${q.id}:${i}`)
  if(q.kind==='choice'){
    const base=q as ChoiceExtras
    const optionFeedback=packed.options.map((option,index)=>index===packed.correctIndex?`正確。${item.explanation}`:`「${compact(option,55)}」不符合目前題幹。正確答案是「${compact(item.correct,65)}」。${compact(item.explanation,155)}`)
    return {...base,context:item.context,prompt:item.prompt,options:packed.options,correctIndex:packed.correctIndex,explanation:item.explanation,optionFeedback,mediaAssetId:undefined,audioText:undefined} as ReviewedQuestion
  }
  const base=q as ResponseExtras
  return {...base,context:item.context,prompt:`${item.prompt}${c.subject==='english'?' Answer in one complete sentence and cite one clue.':' 請寫出答案，並指出一項題幹中的具體證據或計算。'}`,sampleAnswer:`${item.correct}。${item.explanation}`,explanation:item.explanation,rubric:[`直接回答「${compact(item.prompt,70)}」。`,'指出至少一項題幹中的具體證據、數值、語句、觀察或計算。',`理由要和「${c.unit.title}」的單元焦點一致，不能超出題目資訊。`],mediaAssetId:undefined,audioText:undefined} as ReviewedQuestion
}

function rewriteExample(c: UnitContext, model: ReviewedWorkedExample, i: number): ReviewedWorkedExample {
  const item=taskFor(c,i+1000)
  return {...model,title:`${c.unit.title}｜示範 ${i+1}`,context:item.context,prompt:item.prompt,steps:[`確認本章要處理：${c.unit.focus}`,'圈出題幹的已知條件、證據或語境線索。',`套用本章方法，得到「${item.correct}」。`,'用題意、單位、語境、代回或另一種表示做檢查。'],answer:`${item.correct}。`,explanation:item.explanation}
}

function focusParts(c: UnitContext) { const values=[c.unit.title,...c.unit.focus.split(/[，、；。]|以及|並且|並|與|和/).map(norm)].filter(v=>v.length>=2); const unique=[...new Set(values)]; while(unique.length<3)unique.push(`${c.unit.title}的應用與檢查 ${unique.length+1}`); return unique.slice(0,6) }
function answer(q: ReviewedQuestion){return q.kind==='choice'?q.options[q.correctIndex]:q.sampleAnswer}
function rebuildConcepts(c:UnitContext,qs:ReviewedQuestion[]):ReviewedConcept[]{return focusParts(c).map((part,i)=>({title:part,explanation:c.subject==='english'?`In “${c.unit.title},” use “${part}” by checking meaning, form, word order and the complete context.`:`「${part}」是「${c.unit.title}」範圍的一部分。先辨認題目條件或證據，再用本章定義、關係、文本或資料完成推理，最後檢查答案是否符合「${compact(c.unit.focus,105)}」。`,example:`${compact(qs[i%qs.length].context,105)} ${compact(qs[i%qs.length].prompt,85)} → ${compact(answer(qs[i%qs.length]),75)}`}))}
function rebuildMisconceptions(qs:ReviewedQuestion[]):TextbookMisconception[]{return qs.slice(0,4).map(q=>q.kind==='choice'?{claim:`作答「${compact(q.prompt,55)}」時選了「${compact(q.options.find((_,i)=>i!==q.correctIndex),45)}」。`,correction:`應改為「${compact(answer(q),60)}」，並回到題幹核對條件。`,reason:compact(q.explanation,160)}:{claim:`回答「${compact(q.prompt,55)}」時只寫結果。`,correction:'補上題幹中的具體證據、計算、資料或語句。',reason:compact(q.explanation,160)})}
function rebuildVisuals(c:UnitContext,concepts:ReviewedConcept[],mis:TextbookMisconception[]):TextbookVisual[]{return[{id:`${c.unit.id}-reviewed-map`,kind:'concept-map',title:`${c.unit.title}｜概念地圖`,caption:`本章焦點：${compact(c.unit.focus,115)}`,items:concepts.map((x,i)=>({label:`${i+1}｜${compact(x.title,34)}`,detail:compact(x.explanation,145)}))},{id:`${c.unit.id}-reviewed-errors`,kind:'comparison',title:`${c.unit.title}｜易錯與修正`,caption:'錯誤示例與修正理由都取自本章目前的題目。',items:mis.map((x,i)=>({label:`易錯 ${i+1}｜${compact(x.claim,48)}`,detail:`${compact(x.correction,85)} ${compact(x.reason,100)}`}))}]}
function rebuildVocabulary(concepts:ReviewedConcept[]):TextbookVocabulary[]{return concepts.map(c=>({term:compact(c.title,30),definition:compact(c.explanation,150)}))}

export function getTextbookUnitContentV20Reviewed(unitId:string):TextbookUnitContentV20Final|null{
  const source=getTextbookUnitContentV20Published(unitId),c=resolveCurriculumUnit(unitId);if(!source||!c)return null
  const questions=source.questions.map((q,i)=>rewriteQuestion(c,q,i)),workedExamples=source.workedExamples.map((e,i)=>rewriteExample(c,e,i)),concepts=rebuildConcepts(c,questions),misconceptions=rebuildMisconceptions(questions),visuals=rebuildVisuals(c,concepts,misconceptions)
  return {...source,overview:`「${c.unit.title}」完整範圍：${c.unit.focus} 本章的概念、示範、練習、易錯判斷與視覺都依這個範圍組織。`,objectives:concepts.slice(0,5).map(x=>c.subject==='english'?`Can use “${x.title}” in a complete context and explain the clue supporting the answer.`:`能說明並應用「${x.title}」，且用題幹的條件、證據或表示驗證答案。`),concepts,workedExamples,questions,misconceptions,visuals,vocabulary:rebuildVocabulary(concepts),takeaway:[`本章範圍：${c.unit.focus}`,`核心概念：${concepts.slice(0,4).map(x=>x.title).join('、')}。`,c.subject==='math'?'最後用代回、估算、圖形或另一種表示檢查。':c.subject==='english'?'最後重讀完整句子或文本，檢查語意、形式與語序。':c.subject==='science'?'最後區分觀察、模型與推論，確認結論沒有超過證據。':c.subject==='social'?'最後核對來源、時間、尺度與立場，限制結論不超過資料。':'最後回到完整文本與語境，用具體線索支持解讀。']}
}

const cache=new Map<string,TextbookUnitContentV20Final|null>()
export function getCachedTextbookUnitContentV20Reviewed(unitId:string){if(cache.has(unitId))return cache.get(unitId)??null;const unit=getTextbookUnitContentV20Reviewed(unitId);cache.set(unitId,unit);return unit}
