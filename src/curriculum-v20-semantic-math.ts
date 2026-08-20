import { gcdV20, intV20, taskV20, type V20SemanticTask } from './curriculum-v20-semantic-task'

function gradeOf(unitId: string) {
  return Number(unitId.match(/^g(\d+)/)?.[1] ?? 0)
}

function seed(unitId: string, index: number, suffix = '') {
  return `${unitId}:${index}:${suffix}`
}

function mean(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export function getV20MathSemanticTask(unitId: string, title: string, focus: string, index: number): V20SemanticTask {
  const grade = gradeOf(unitId)
  const s = seed(unitId, index)

  if (title === '100 以內的數') {
    const tens = intV20(s, 1, 9), ones = intV20(seed(unitId,index,'o'), 0, 9), value = tens * 10 + ones
    if (index % 3 === 1) {
      const other = Math.min(99, value + intV20(seed(unitId,index,'d'), 1, Math.max(1, 99-value)))
      return taskV20(`比較 ${value} 與 ${other}。`, '哪個數比較大？', String(Math.max(value, other)), [String(Math.min(value, other)), String(Math.abs(other-value)), '兩個一樣大'], `先比較十位，再比較個位；${Math.max(value,other)} 比 ${Math.min(value,other)} 大。`)
    }
    if (index % 3 === 2) {
      const next = Math.min(99, value + 1)
      return taskV20(`數列片段是 ${Math.max(0,value-1)}、${value}、___。`, '依數的順序，空格應填什麼？', String(next), [String(value-1),String(value+10),String(Math.max(0,value-10))], `相鄰整數每次增加 1，所以 ${value} 後面是 ${next}。`)
    }
    return taskV20(`一個兩位數有 ${tens} 個十和 ${ones} 個一。`, '這個數是多少？', String(value), [String(tens+ones),String(tens*10),String(ones*10+tens)], `${tens} 個十是 ${tens*10}，再加 ${ones} 個一得到 ${value}。`)
  }

  if (title === '加法與減法') {
    const a=intV20(s,5,16), b=intV20(seed(unitId,index,'b'),1,Math.min(9,a))
    if(index%2===0){const total=Math.min(20,a+b);const add=total-a;return taskV20(`盒子裡原有 ${a} 顆積木，又放入 ${add} 顆。`,'現在共有幾顆積木？',String(total),[String(a-add),String(add),String(total+1)],`${a}+${add}=${total}；「又放入」表示數量增加。`)}
    return taskV20(`盤子裡有 ${a} 顆水果，拿走 ${b} 顆。`,'還剩幾顆？',String(a-b),[String(a+b),String(b),String(a-b+1)],`${a}-${b}=${a-b}；「拿走」表示從原數量減去。`)
  }

  if (title === '形狀與位置') {
    if(index%2===0)return taskV20('桌面上，圓形在三角形右邊；正方形在三角形上方。','哪個敘述符合位置關係？','圓形在三角形的右邊',['圓形在三角形左邊','正方形在三角形下方','三個圖形一定一樣大'],'題幹直接說圓形在三角形右邊；這是位置關係，不需要計算面積。')
    return taskV20('積木盒裡有球、正方體與圓柱。','哪一個物體最容易向各方向滾動？','球',['正方體','只有一個面的平面正方形','三者一定完全相同'],'球面沒有平坦的底面與稜角，因此最容易向各方向滾動。')
  }

  if (title === '長度與比較') {
    const a=intV20(s,20,75), d=intV20(seed(unitId,index,'d'),3,15)
    return taskV20(`甲彩帶長 ${a} 公分，乙彩帶比甲短 ${d} 公分。`,'乙彩帶長多少公分？',`${a-d} 公分`,[`${a+d} 公分`,`${d} 公分`,`${a} 公分`],`${a}-${d}=${a-d}，比較時要保留相同的長度單位。`)
  }

  if (title === '時間初步') {
    const h=intV20(s,7,15), half=index%2===1
    return taskV20(`時鐘顯示 ${h}:${half?'30':'00'}。`,'這個時間應如何讀？',half?`${h} 點半`:`${h} 點整`,[`${h+1} 點整`,`${h} 點 15 分`,`${Math.max(1,h-1)} 點半`],half?`${h}:30 表示 ${h} 點半。`:`${h}:00 表示 ${h} 點整。`)
  }

  if (title === '分類與規律') {
    if(index%2===0)return taskV20('圖卡依「紅、藍、紅、藍、紅、藍……」重複排列。','接下來四張應如何排列？','紅、藍、紅、藍',['藍、紅、藍、紅','紅、紅、藍、藍','藍、藍、紅、紅'],'規律以「紅、藍」為一組重複。')
    return taskV20('桌上有紅色圓形、紅色三角形、藍色圓形、藍色三角形四張圖卡。','若先依顏色分類，會分成幾組？','2 組',['1 組','3 組','4 組'],'依顏色只分紅色與藍色，所以是 2 組。')
  }

  if (title === '1000 以內的數') {
    const h=intV20(s,1,9), d=intV20(seed(unitId,index,'d'),0,9), o=intV20(seed(unitId,index,'o'),0,9), value=h*100+d*10+o
    if(index%3===1){const other=Math.min(999,value+intV20(seed(unitId,index,'x'),1,50));return taskV20(`比較 ${value} 與 ${other}。`,'哪個數較大？',String(other),[String(value),String(other-value),String(value+100)],`先比較百位，再比較十位與個位；${other}>${value}。`)}
    if(index%3===2){const next=value<999?value+1:value-1;return taskV20(`在數線上，${value} 的下一個整數位置標記為多少？`,'依相鄰整數關係作答。',String(next),[String(value),String(value+10),String(Math.max(0,value-10))],`相鄰整數差 1；依題目方向得到 ${next}。`)}
    return taskV20(`一個三位數有 ${h} 個百、${d} 個十和 ${o} 個一。`,'這個數是多少？',String(value),[String(h*100+d+o),String(h*10+d*100+o),String(h*100+d*10)],`${h}×100+${d}×10+${o}=${value}，數值保持在 1000 以內。`)
  }

  if (title === '加減計算與應用') {
    const a=intV20(s,120,480), b=intV20(seed(unitId,index,'b'),60,190), c=intV20(seed(unitId,index,'c'),20,80)
    if(index%2===0){return taskV20(`圖書館上午借出 ${a} 本書，下午又借出 ${b} 本，其中 ${c} 本當天歸還。`,'今天仍借在外面的書共有多少本？',String(a+b-c),[String(a+b+c),String(a-b+c),String(a+b)],`先合併兩次借出 ${a}+${b}=${a+b}，再扣除已歸還 ${c} 本，得到 ${a+b-c}。`)}
    return taskV20(`倉庫原有 ${a+b} 箱物品，上午送出 ${a} 箱，下午補進 ${c} 箱。`,'最後有幾箱？',String(b+c),[String(b-c),String(a+c),String(a+b+c)],`${a+b}-${a}+${c}=${b+c}；按事件先後處理加減。`)
  }

  if (title === '乘法概念') {
    const groups=intV20(s,3,8), each=intV20(seed(unitId,index,'e'),2,9), total=groups*each
    return taskV20(`有 ${groups} 組貼紙，每組 ${each} 張。`,'總共有多少張貼紙？',String(total),[String(groups+each),String(total+each),String(each)],`${groups} 組同樣多可寫成 ${groups}×${each}=${total}。`)
  }

  if (title === '長度、容量與重量') {
    const value=intV20(s,2,8)
    if(index%3===0)return taskV20(`繩子長 ${value} 公尺。`,'換成公分是多少？',`${value*100} 公分`,[`${value*10} 公分`,`${value} 公分`,`${value*1000} 公分`],`1 公尺=100 公分，所以 ${value} 公尺=${value*100} 公分。`)
    if(index%3===1)return taskV20(`一瓶水有 ${value} 公升。`,'換成毫升是多少？',`${value*1000} 毫升`,[`${value*100} 毫升`,`${value} 毫升`,`${value*10} 毫升`],`1 公升=1000 毫升，所以 ${value} 公升=${value*1000} 毫升。`)
    return taskV20(`一包米重 ${value} 公斤。`,'換成公克是多少？',`${value*1000} 公克`,[`${value*100} 公克`,`${value} 公克`,`${value*10} 公克`],`1 公斤=1000 公克，所以 ${value} 公斤=${value*1000} 公克。`)
  }

  if (title === '時間與日曆' || title === '時間計算') {
    const h=intV20(s,8,14), minutes=[30,60,90][index%3], total=h*60+minutes, eh=Math.floor(total/60), em=total%60, correct=`${eh}:${String(em).padStart(2,'0')}`
    return taskV20(`活動在 ${h}:00 開始，持續 ${minutes} 分鐘。`,'活動幾點結束？',correct,[`${h}:${String(minutes%60).padStart(2,'0')}`,`${eh+1}:${String(em).padStart(2,'0')}`,`${Math.max(0,h-1)}:00`],`把 ${minutes} 分鐘加到 ${h}:00，得到 ${correct}。`)
  }

  if (title === '平面與立體圖形') {
    if(index%2===0)return taskV20('觀察一個正方體模型。','正方體有幾個面？','6',['4','8','12'],'正方體有 6 個正方形的面。')
    return taskV20('觀察一個三角形紙片。','三角形有幾條邊？','3',['2','4','6'],'三角形由 3 條邊圍成。')
  }

  if (title === '10000 以內的數') {
    const th=intV20(s,1,9), h=intV20(seed(unitId,index,'h'),0,9), d=intV20(seed(unitId,index,'d'),0,9), o=intV20(seed(unitId,index,'o'),0,9), value=th*1000+h*100+d*10+o
    return taskV20(`一個四位數有 ${th} 個千、${h} 個百、${d} 個十和 ${o} 個一。`,'依位值寫出這個數。',String(value),[String(th*100+h*1000+d*10+o),String(th*1000+h*100+d+o),String(th+h+d+o)],`${th}×1000+${h}×100+${d}×10+${o}=${value}。`)
  }

  if (title === '乘法與除法') {
    const each=intV20(s,12,48), groups=intV20(seed(unitId,index,'g'),3,8), total=each*groups
    if(index%2===0)return taskV20(`每箱有 ${each} 個零件，共 ${groups} 箱。`,'一共有多少個零件？',String(total),[String(each+groups),String(total+groups),String(each)],`${each}×${groups}=${total}。`)
    return taskV20(`共有 ${total} 顆球，平均分成 ${groups} 組。`,'每組有幾顆？',String(each),[String(groups),String(total-groups),String(total)],`${total}÷${groups}=${each}；等分問題用除法。`)
  }

  if (title === '分數初步') {
    const d=[3,4,5,6][index%4]
    return taskV20(`同樣大的兩個披薩都平均分成 ${d} 份；甲吃 1 份，乙吃 2 份。`,'誰吃得比較多？','乙',['甲','一樣多','無法比較'],`分母相同時比較分子；2/${d} > 1/${d}。`)
  }

  if (title === '長度與周長') {
    const a=intV20(s,4,10), b=intV20(seed(unitId,index,'b'),3,9), p=2*(a+b)
    return taskV20(`長方形長 ${a} 公分、寬 ${b} 公分。`,'周長是多少？',`${p} 公分`,[`${a*b} 公分`,`${a+b} 公分`,`${2*a+b} 公分`],`周長=2×(長+寬)=2×(${a}+${b})=${p}。`)
  }

  if (title === '資料與規律') {
    if(index%2===0){const base=intV20(s,2,7), diff=intV20(seed(unitId,index,'d'),2,5);return taskV20(`數列是 ${base}、${base+diff}、${base+2*diff}、${base+3*diff}、___。`,'下一項是多少？',String(base+4*diff),[String(base+3*diff+1),String(base+5*diff),String(diff)],`每一項都增加 ${diff}，所以下一項是 ${base+4*diff}。`)}
    const a=intV20(s,3,8), b=intV20(seed(unitId,index,'b'),a+1,12);return taskV20(`長條圖資料：甲班借書 ${a} 本，乙班借書 ${b} 本。`,'乙班比甲班多借幾本？',String(b-a),[String(a+b),String(b),String(a)],`${b}-${a}=${b-a}。`)
  }

  if (title === '大數與四則') {
    if(index%3===0){const value=intV20(s,12000,98000);const rounded=Math.round(value/1000)*1000;return taskV20(`某城市人口約為 ${value.toLocaleString('en-US')} 人。`,'四捨五入到千位約是多少人？',`${rounded.toLocaleString('en-US')} 人`,[`${Math.floor(value/1000)*1000-1000} 人`,`${value} 千人`,`${Math.round(value/100)*100} 人`],`觀察百位決定千位是否進位，得到約 ${rounded.toLocaleString('en-US')} 人。`)}
    if(index%3===1){const a=intV20(s,120,480),b=intV20(seed(unitId,index,'b'),20,90);return taskV20(`每箱有 ${a} 個零件，共 ${b} 箱。`,'總共有多少個零件？',String(a*b),[String(a+b),String(a*(b-1)),String(b)],`${a}×${b}=${a*b}。`)}
    const divisor=intV20(s,3,9), quotient=intV20(seed(unitId,index,'q'),120,450), total=divisor*quotient;return taskV20(`共有 ${total} 張紙，平均分成 ${divisor} 份。`,'每份有幾張？',String(quotient),[String(total-divisor),String(divisor),String(quotient+divisor)],`${total}÷${divisor}=${quotient}。`)
  }

  if (title === '分數與小數') {
    const pairs=[['1/2','0.5'],['1/4','0.25'],['3/4','0.75']]
    const [frac,dec]=pairs[index%pairs.length]
    return taskV20(`比較分數 ${frac} 與小數 ${dec}。`,'兩者的關係為何？','兩者相等',['分數比較大','小數比較大','沒有辦法比較'],`${frac} 換成小數是 ${dec}，所以相等。`)
  }

  if (title === '角度與幾何') {
    if(index%2===0){const angle=[30,90,120][index%3], correct=angle<90?'銳角':angle===90?'直角':'鈍角';return taskV20(`量角器讀到一個角是 ${angle}°。`,'這個角屬於哪一類？',correct,['銳角','直角','鈍角','平角'].filter(x=>x!==correct).slice(0,3),`小於 90° 是銳角，等於 90° 是直角，大於 90° 且小於 180° 是鈍角。`)}
    return taskV20('四邊形有兩組對邊互相平行，且四個角都是直角。','這個圖形可能是哪一種？','長方形',['三角形','圓形','只有一組平行邊的梯形'],'長方形有兩組對邊平行且四角皆為直角。')
  }

  if (title === '面積') {
    const a=intV20(s,4,10), b=intV20(seed(unitId,index,'b'),3,9), area=a*b
    return taskV20(`長方形長 ${a} 公分、寬 ${b} 公分。`,'面積是多少？',`${area} 平方公分`,[`${2*(a+b)} 平方公分`,`${a+b} 平方公分`,`${area*2} 平方公分`],`面積=長×寬=${a}×${b}=${area} 平方公分。`)
  }

  if (title === '整數四則應用') {
    const groups=intV20(s,3,6), each=intV20(seed(unitId,index,'e'),5,12), used=intV20(seed(unitId,index,'u'),2,8), left=groups*each-used
    return taskV20(`有 ${groups} 盒，每盒 ${each} 個物品，先拿走 ${used} 個。`,'還剩多少個？',String(left),[String(groups+each-used),String(groups*each+used),String(each-used)],`先算總數 ${groups}×${each}=${groups*each}，再減 ${used} 得 ${left}。`)
  }

  if (title === '資料判讀') {
    const jan=intV20(s,20,40), feb=intV20(seed(unitId,index,'f'),jan+3,jan+15), mar=intV20(seed(unitId,index,'m'),feb-5,feb+8)
    return taskV20(`折線圖數值：1 月 ${jan}、2 月 ${feb}、3 月 ${mar}。`,'1 月到 2 月增加多少？',String(feb-jan),[String(feb+jan),String(mar-feb),String(mar-jan)],`${feb}-${jan}=${feb-jan}；比較圖表時先確認月份與同一單位。`)
  }

  if (title === '因數與倍數') {
    const pairs=[[18,30],[24,36],[28,42]], [a,b]=pairs[index%3], g=gcdV20(a,b), l=a*b/g
    if(index%2===0)return taskV20(`兩個數是 ${a} 與 ${b}。`,'最大公因數是多少？',String(g),[String(a+b),String(Math.min(a,b)),String(l)],`列出共同因數或做質因數分解，可得最大公因數 ${g}。`)
    return taskV20(`兩個數是 ${a} 與 ${b}。`,'最小公倍數是多少？',String(l),[String(g),String(a+b),String(a*b)],`由質因數分解或倍數列表，可得最小公倍數 ${l}。`)
  }

  if (title === '分數加減') {
    const cases=[['1/2 + 1/4','3/4','1/2=2/4，所以 2/4+1/4=3/4。'],['3/4 - 1/2','1/4','1/2=2/4，所以 3/4-2/4=1/4。'],['2/3 + 1/6','5/6','2/3=4/6，所以 4/6+1/6=5/6。']]
    const [expr,ans,exp]=cases[index%cases.length]
    return taskV20(`計算 ${expr}。`,'結果是多少？',ans,['2/6','1/6','7/6'],exp)
  }

  if (title === '小數乘除') {
    if(index%2===0){const a=[1.2,2.5,3.4][index%3], b=2, val=a*b;return taskV20(`計算 ${a} × ${b}。`,'結果是多少？',String(val),[String(a+b),String(a/b),String(val*10)],`${a}×${b}=${val}；可先估算確認小數點位置。`)}
    const dividend=[4.8,7.5,9.6][index%3], divisor=[2,3,4][index%3], ans=dividend/divisor;return taskV20(`計算 ${dividend} ÷ ${divisor}。`,'結果是多少？',String(ans),[String(dividend*divisor),String(dividend-divisor),String(ans*10)],`${dividend}÷${divisor}=${ans}；用 ${ans}×${divisor}=${dividend} 反向檢查。`)
  }

  if (title === '面積與體積') {
    if(index%2===0){const b=intV20(s,4,10),h=intV20(seed(unitId,index,'h'),3,8),area=b*h/2;return taskV20(`三角形底 ${b} 公分、高 ${h} 公分。`,'面積是多少？',`${area} 平方公分`,[`${b*h} 平方公分`,`${b+h} 平方公分`,`${2*(b+h)} 平方公分`],`三角形面積=${b}×${h}÷2=${area}。`)}
    const a=intV20(s,3,7),b=intV20(seed(unitId,index,'b'),3,6),h=intV20(seed(unitId,index,'h'),2,5),v=a*b*h;return taskV20(`長方體長 ${a}、寬 ${b}、高 ${h} 公分。`,'體積是多少？',`${v} 立方公分`,[`${a*b} 立方公分`,`${a+b+h} 立方公分`,`${2*(a+b+h)} 立方公分`],`體積=${a}×${b}×${h}=${v}。`)
  }

  if (title === '比率與百分率初步') {
    const part=intV20(s,1,4), total=5, pct=part*20
    return taskV20(`全體有 ${total} 份，其中 ${part} 份符合條件。`,'符合條件的百分率是多少？',`${pct}%`,[`${part}%`,`${total*10}%`,`${100-pct}%`],`${part}/${total}=${pct}/100=${pct}%。`)
  }

  if (title === '數量關係') {
    const start=intV20(s,3,8), diff=intV20(seed(unitId,index,'d'),2,5), term=intV20(seed(unitId,index,'t'),4,7), value=start+(term-1)*diff
    return taskV20(`表格顯示第 1 項是 ${start}，之後每增加 1 項就增加 ${diff}。` ,`第 ${term} 項是多少？`,String(value),[String(start+term*diff),String(term*diff),String(start+diff)],`用「起始量 + 增加次數×每次增加量」：${start}+(${term}-1)×${diff}=${value}。`)
  }

  if (title === '分數與小數除法') {
    if(index%2===0)return taskV20('計算 3/4 ÷ 1/2。','結果是多少？','3/2',['3/8','2/3','1/4'],'除以 1/2 等於乘以 2，所以 3/4×2=3/2。')
    const dividend=[4.8,6.3,7.2][index%3], divisor=[0.6,0.7,0.8][index%3], ans=dividend/divisor;return taskV20(`計算 ${dividend} ÷ ${divisor}。`,'結果是多少？',String(ans),[String(dividend*divisor),String(dividend-divisor),String(ans/10)],`同乘 10 可把除數化成整數，再計算得 ${ans}；用乘法反查。`)
  }

  if (title === '比與比值') {
    if(index%2===0){const a=intV20(s,2,6),b=intV20(seed(unitId,index,'b'),a+1,10),g=gcdV20(a,b);return taskV20(`紅球與藍球的數量比是 ${a}:${b}。`,'化成最簡整數比為何？',`${a/g}:${b/g}`,[`${b/g}:${a/g}`,`${a+b}:${b}`,`${a}:${b/g}`],`兩項同除以最大公因數 ${g}，得到 ${a/g}:${b/g}。`)}
    const scale=intV20(s,2,5), small=intV20(seed(unitId,index,'x'),3,8);return taskV20(`模型與實物長度比為 1:${scale}；模型長 ${small} 公分。`,'實物長多少公分？',`${small*scale} 公分`,[`${small+scale} 公分`,`${small} 公分`,`${small/scale} 公分`],`依比例放大 ${scale} 倍：${small}×${scale}=${small*scale}。`)
  }

  if (title === '圓與圓周') {
    const r=intV20(s,2,7)
    if(index%2===0){const circumference=3.14*2*r;return taskV20(`一個圓的半徑是 ${r} 公分，取 π=3.14。`,'圓周長是多少？',`${circumference.toFixed(2)} 公分`,[`${(3.14*r).toFixed(2)} 公分`,`${(3.14*r*r).toFixed(2)} 公分`,`${2*r} 公分`],`圓周長=2πr=2×3.14×${r}=${circumference.toFixed(2)}。`)}
    const area=3.14*r*r;return taskV20(`一個圓的半徑是 ${r} 公分，取 π=3.14。`,'圓面積是多少？',`${area.toFixed(2)} 平方公分`,[`${(2*3.14*r).toFixed(2)} 平方公分`,`${(3.14*r).toFixed(2)} 平方公分`,`${r*r} 平方公分`],`圓面積=πr²=3.14×${r}²=${area.toFixed(2)}。`)
  }

  if (title === '速率與比例應用') {
    const speed=intV20(s,4,12), time=intV20(seed(unitId,index,'t'),2,5), dist=speed*time
    return taskV20(`以每小時 ${speed} 公里的速度行進 ${time} 小時。`,'共行進多少公里？',`${dist} 公里`,[`${speed+time} 公里`,`${speed/time} 公里`,`${dist+speed} 公里`],`距離=速率×時間=${speed}×${time}=${dist}。`)
  }

  if (title === '柱體與體積') {
    const a=intV20(s,3,6),b=intV20(seed(unitId,index,'b'),2,5),h=intV20(seed(unitId,index,'h'),4,8),v=a*b*h
    if(index%2===0)return taskV20(`長方柱底面長 ${a}、寬 ${b} 公分，高 ${h} 公分。`,'體積是多少？',`${v} 立方公分`,[`${a*b} 立方公分`,`${a+b+h} 立方公分`,`${2*(a+b)*h} 立方公分`],`柱體體積=底面積×高=(${a}×${b})×${h}=${v}。`)
    const surface=2*(a*b+a*h+b*h);return taskV20(`長方柱長 ${a}、寬 ${b}、高 ${h} 公分。`,'表面積是多少？',`${surface} 平方公分`,[`${v} 平方公分`,`${2*(a+b+h)} 平方公分`,`${a*b+a*h+b*h} 平方公分`],`表面積=2(長×寬+長×高+寬×高)=${surface}。`)
  }

  if (title === '代數與國中銜接' || title === '一元一次方程式') {
    const x=intV20(s,2,9),a=intV20(seed(unitId,index,'a'),2,6),b=intV20(seed(unitId,index,'b'),1,8),total=a*x+b
    return taskV20(`${a}x+${b}=${total}。`,'x 的值是多少？',String(x),[String(x+b),String(total/a),String(a)],`先減 ${b} 再除 ${a}，得到 x=${x}；代回可驗算。`)
  }

  if (title === '整數運算與科學記號') {
    if(index%2===0){const start=-intV20(s,2,10),rise=intV20(seed(unitId,index,'r'),3,12),ans=start+rise;return taskV20(`氣溫原為 ${start}°C，之後上升 ${rise}°C。`,'最後氣溫是多少？',`${ans}°C`,[`${start-rise}°C`,`${Math.abs(ans)}°C`,`${-ans}°C`],`${start}+${rise}=${ans}。`)}
    const coef=intV20(s,2,8),exp=intV20(seed(unitId,index,'e'),3,6),value=coef*10**exp;return taskV20(`把 ${value.toLocaleString('en-US')} 表示成 a×10^n，1≤a<10。`,'正確的科學記號是？',`${coef} × 10^${exp}`,[`${coef} × 10^${exp-1}`,`${coef*10} × 10^${exp}`,`${coef/10} × 10^${exp+1}`],`小數點移 ${exp} 位，得到 ${coef}×10^${exp}。`)
  }

  if (title === '因數分解與分數運算') {
    if(index%2===0){const a=24,b=36,g=gcdV20(a,b);return taskV20(`求 ${a} 與 ${b} 的最大公因數。`,'答案是多少？',String(g),['6','18','72'],`共同質因數相乘得到 ${g}。`)}
    return taskV20('計算 -1/2 + 3/4。','答案是多少？','1/4',['-1/4','2/4','5/4'],'-1/2=-2/4，所以 -2/4+3/4=1/4。')
  }

  if (title === '簡單圖形與幾何符號') {
    if(index%2===0)return taskV20('直線 l 與直線 m 相交形成四個直角。','l 與 m 的關係應如何表示？','l ⟂ m',['l ∥ m','l = m','l ∈ m'],'兩直線相交成 90° 時互相垂直，符號是 ⟂。')
    return taskV20('點 P 到直線 l 的最短距離，是從 P 向 l 作垂線得到的線段長。','哪一條線段代表點到直線的距離？','垂直於 l 的線段',['任意斜線段','沿著 l 的線段','繞一圈回到 P 的路徑'],'點到直線的距離定義為垂線段長。')
  }

  if (title === '二元一次聯立方程式') {
    const x=intV20(s,2,7),y=intV20(seed(unitId,index,'y'),1,6),sum=x+y,diff=x-y
    return taskV20(`聯立方程式 x+y=${sum}、x-y=${diff}。`,'(x,y) 是多少？',`(${x},${y})`,[`(${y},${x})`,`(${sum},${diff})`,`(${x+1},${y-1})`],`兩式相加得 2x=${2*x}，所以 x=${x}；再代回得 y=${y}。`)
  }

  if (title === '直角坐標與二元一次方程式圖形') {
    const m=intV20(s,1,4),b=intV20(seed(unitId,index,'b'),1,5),x=intV20(seed(unitId,index,'x'),1,4),y=m*x+b
    return taskV20(`直線方程式 y=${m}x+${b}。`,'哪一點在這條直線上？',`(${x},${y})`,[`(${x},${y+1})`,`(${y},${x})`,`(0,0)`],`代入 x=${x} 得 y=${m}×${x}+${b}=${y}。`)
  }

  if (title === '比例與正反比') {
    if(index%2===0){const x=intV20(s,2,5),k=intV20(seed(unitId,index,'k'),2,6),y=k*x,target=intV20(seed(unitId,index,'t'),6,9);return taskV20(`y 與 x 成正比，且 x=${x} 時 y=${y}。`,`x=${target} 時 y 是多少？`,String(k*target),[String(y+target),String(x*target),String(k+target)],`比例常數 k=${y}/${x}=${k}，所以 y=${k}×${target}=${k*target}。`)}
    const k=intV20(s,12,36),x=intV20(seed(unitId,index,'x'),2,6),y=k/x,target=intV20(seed(unitId,index,'t'),2,6);return taskV20(`y 與 x 成反比，且 xy=${k}；當 x=${x} 時 y=${y}。`,`若 x=${target}，y 是多少？`,String(k/target),[String(k*target),String(y+target),String(target/k)],`反比時 xy 固定為 ${k}，所以 y=${k}/${target}=${k/target}。`)
  }

  if (title === '一元一次不等式') {
    const a=intV20(s,2,6),b=intV20(seed(unitId,index,'b'),8,15),limit=b-a
    return taskV20(`不等式 x+${a}<${b}。`,'解集為何？',`x < ${limit}`,[`x > ${limit}`,`x < ${b+a}`,`x = ${limit}`],`兩邊同減 ${a}，得到 x<${limit}。`)
  }

  if (title === '統計圖表與統計數據') {
    const base=intV20(s,4,9),data=[base,base+2,base+2,base+6,base+9]
    if(index%3===0)return taskV20(`已排序資料：${data.join('、')}。`,'中位數是多少？',String(data[2]),[String(data[0]),String(data[4]),String(mean(data))],'5 筆排序資料的中央第 3 筆是中位數。')
    if(index%3===1)return taskV20(`資料：${data.join('、')}。`,'眾數是多少？',String(base+2),[String(base),String(base+6),String(base+9)],`${base+2} 出現 2 次，其餘各 1 次，所以眾數是 ${base+2}。`)
    return taskV20(`資料：${data.join('、')}。`,'平均數是多少？',String(mean(data)),[String(data[2]),String(data[0]),String(data[4])],`總和除以 5 得平均數 ${mean(data)}。`)
  }

  if (title === '乘法公式與多項式' || title === '多項式與方程式' || title === '函數與多項式變化') {
    const a=intV20(s,2,6),b=intV20(seed(unitId,index,'b'),1,5)
    return taskV20(`展開 (x+${a})(x+${b})。`,'正確結果為何？',`x² + ${a+b}x + ${a*b}`,[`x² + ${a*b}x + ${a+b}`,`x² + ${a+b}x - ${a*b}`,`2x + ${a+b}`],`分配律得到 x²+${b}x+${a}x+${a*b}=x²+${a+b}x+${a*b}。`)
  }

  if (title === '平方根與畢氏定理') {
    const triples=[[3,4,5],[5,12,13],[8,15,17]], [a,b,h]=triples[index%3]
    return taskV20(`直角三角形兩股長 ${a} 與 ${b}。`,'斜邊長是多少？',String(h),[String(a+b),String(Math.abs(b-a)),String(a*b)],`畢氏定理：${a}²+${b}²=${h}²，所以斜邊 ${h}。`)
  }

  if (title === '因式分解') {
    const a=intV20(s,1,5),b=intV20(seed(unitId,index,'b'),1,5)
    return taskV20(`因式分解 x²+${a+b}x+${a*b}。`,'正確結果為何？',`(x+${a})(x+${b})`,[`(x-${a})(x-${b})`,`(x+${a+b})(x+${a*b})`,`x(x+${a+b})`],`找兩數和為 ${a+b}、積為 ${a*b}，得到 (x+${a})(x+${b})。`)
  }

  if (title === '數列與規律' || title === '數列與級數') {
    if(title==='數列與級數'&&index%2===1){const first=intV20(s,2,6),ratio=intV20(seed(unitId,index,'r'),2,4),term=intV20(seed(unitId,index,'t'),4,6),value=first*ratio**(term-1);return taskV20(`等比數列首項 ${first}、公比 ${ratio}。`,`第 ${term} 項是多少？`,String(value),[String(first+(term-1)*ratio),String(first*ratio*term),String(value/ratio)],`a_${term}=${first}×${ratio}^(${term}-1)=${value}。`)}
    const first=intV20(s,2,8),diff=intV20(seed(unitId,index,'d'),2,5),term=intV20(seed(unitId,index,'t'),5,8),value=first+(term-1)*diff
    return taskV20(`等差數列首項 ${first}、公差 ${diff}。`,`第 ${term} 項是多少？`,String(value),[String(first+term*diff),String(first*diff),String(term*diff)],`a_${term}=${first}+(${term}-1)×${diff}=${value}。`)
  }

  if (title === '線型函數' || title === '函數與圖形') {
    const m=intV20(s,2,5),b=intV20(seed(unitId,index,'b'),1,7),x=intV20(seed(unitId,index,'x'),1,5),y=m*x+b
    return taskV20(`函數 f(x)=${m}x+${b}。`,`f(${x}) 是多少？`,String(y),[String(m+x+b),String(m*x),String(x+b)],`代入 x=${x}：${m}×${x}+${b}=${y}。`)
  }

  if (title === '平面幾何') {
    const a=intV20(s,35,70),b=intV20(seed(unitId,index,'b'),35,70),third=180-a-b
    return taskV20(`三角形兩個內角分別是 ${a}° 與 ${b}°。`,'第三個內角是多少？',`${third}°`,[`${a+b}°`,`${180-a}°`,`${180-b}°`],`三角形內角和為 180°，所以第三角為 ${third}°。`)
  }

  if (title === '二次方程式') {
    const r1=intV20(s,1,4),r2=r1+intV20(seed(unitId,index,'r2'),1,3),sum=r1+r2,prod=r1*r2
    return taskV20(`x²-${sum}x+${prod}=0。`,'所有實數解為何？',`x = ${r1} 或 x = ${r2}`,[`x = ${sum}`,`x = ${prod}`,`x = -${r1} 或 x = -${r2}`],`因式分解為 (x-${r1})(x-${r2})=0，所以兩根為 ${r1}、${r2}；代回均成立。`)
  }

  if (title === '二次函數') {
    const h=intV20(s,1,4),k=intV20(seed(unitId,index,'k'),-3,4),expr=k>=0?`(x-${h})²+${k}`:`(x-${h})²-${Math.abs(k)}`
    return taskV20(`函數 y=${expr}。`,'拋物線頂點為何？',`(${h}, ${k})`,[`(0, ${k})`,`(${k}, ${h})`,`(-${h}, ${k})`],`頂點式 y=(x-h)²+k 的頂點是 (h,k)。`)
  }

  if (title === '相似與比例') {
    const scale=intV20(s,2,5),small=intV20(seed(unitId,index,'x'),3,8),large=small*scale
    return taskV20(`兩個相似三角形的對應邊比為 1:${scale}；小三角形某邊長 ${small} 公分。`,'大三角形的對應邊長是多少？',`${large} 公分`,[`${small+scale} 公分`,`${large+scale} 公分`,`${small} 公分`],`相似圖形對應邊按同一比例放大，${small}×${scale}=${large}。`)
  }

  if (title === '圓與幾何關係') {
    const central=2*intV20(s,25,70),inscribed=central/2
    return taskV20(`同一圓中，某弧所對的圓心角是 ${central}°。`,'同弧所對的圓周角是多少？',`${inscribed}°`,[`${central}°`,`${central*2}°`,`${180-inscribed}°`],`同弧所對的圓周角等於圓心角的一半。`)
  }

  if (title === '機率與統計') {
    if(index%2===0){const red=intV20(s,2,6),blue=intV20(seed(unitId,index,'b'),2,7),total=red+blue;return taskV20(`袋中 ${red} 顆紅球、${blue} 顆藍球，等可能抽 1 顆。`,'抽到紅球的機率？',`${red}/${total}`,[`${blue}/${total}`,`${red}/${blue}`,`1/${total}`],`有利結果 ${red} 個，全部 ${total} 個，所以機率 ${red}/${total}。`)}
    const data=[2,4,4,6,9];return taskV20(`資料：${data.join('、')}。`,'中位數是多少？','4',['2','5','9'],'排序後中央值是 4。')
  }

  if (title === '國中數學統整') {
    if(index%3===0)return getV20MathSemanticTask(unitId,'二次方程式','',index)
    if(index%3===1)return getV20MathSemanticTask(unitId,'平面幾何','',index)
    return getV20MathSemanticTask(unitId,'機率與統計','',index)
  }

  if (title === '實數與代數') {
    const x=-intV20(s,2,9)
    return taskV20(`計算 |${x}|。`,'結果是多少？',String(Math.abs(x)),[String(x),'0',String(Math.abs(x)+1)],`絕對值表示到 0 的距離，所以 |${x}|=${Math.abs(x)}。`)
  }

  if (title === '指數與對數') {
    const e=intV20(s,2,5),value=10**e
    return taskV20(`10^${e}=${value}。`,'哪個對數等式正確？',`log₁₀(${value}) = ${e}`,[`log₁₀(${e}) = ${value}`,`log₁₀(${value}) = ${e+1}`,`log₁₀(10) = ${value}`],`因為 10^${e}=${value}，所以 log₁₀(${value})=${e}。`)
  }

  if (title === '資料分析') {
    const base=intV20(s,40,60),values=[base-6,base-2,base,base+2,base+6]
    if(index%2===0)return taskV20(`資料：${values.join('、')}。`,'平均數是多少？',String(mean(values)),[String(values[0]),String(values[2]),String(values[4])],`資料以 ${base} 為中心對稱，平均數是 ${base}。`)
    return taskV20(`兩組資料平均數相同，但甲組數值集中、乙組數值分散。`,'哪個敘述最合理？','乙組的離散程度較大',['兩組每個數值都相同','甲組一定有較大平均數','平均數相同代表分布完全相同'],'平均數相同不能決定分散程度；乙組較分散代表離散程度較大。')
  }

  if (title === '三角比與三角函數') {
    if(index%3===0){const triples=[[3,4,5],[5,12,13],[8,15,17]], [opp,adj,hyp]=triples[index%3];return taskV20(`一直角三角形對角 θ 的對邊 ${opp}、鄰邊 ${adj}、斜邊 ${hyp}。`,'sin θ 等於多少？',`${opp}/${hyp}`,[`${adj}/${hyp}`,`${opp}/${adj}`,`${hyp}/${opp}`],'sin θ=對邊/斜邊。')}
    if(index%3===1)return taskV20('角度 180° 對應半圓。','換成弧度是多少？','π',['π/2','2π','1'],'180°=π 弧度。')
    return taskV20('函數 y=sin x。','它的基本週期是多少？','2π',['π','π/2','4π'],'正弦函數每增加 2π 重複一次。')
  }

  if (title === '平面向量') {
    const a=intV20(s,1,5),b=intV20(seed(unitId,index,'b'),1,5),c=intV20(seed(unitId,index,'c'),1,5),d=intV20(seed(unitId,index,'d'),1,5)
    if(index%2===0)return taskV20(`向量 a=(${a},${b})，b=(${c},${d})。`,'a+b 等於多少？',`(${a+c},${b+d})`,[`(${a*c},${b*d})`,`(${a-c},${b-d})`,`(${a+d},${b+c})`],'向量相加是對應分量相加。')
    return taskV20(`向量 a=(${a},${b})，b=(${c},${d})。`,'內積 a·b 是多少？',String(a*c+b*d),[String(a+b+c+d),String(a*c),String(b*d)],`a·b=${a}×${c}+${b}×${d}=${a*c+b*d}。`)
  }

  if (title === '空間與幾何關係' || title === '空間向量與幾何深化') {
    const a=intV20(s,2,6),b=intV20(seed(unitId,index,'b'),2,6),c=intV20(seed(unitId,index,'c'),1,5),sq=a*a+b*b+c*c
    return taskV20(`空間向量 v=(${a},${b},${c})。`,'v 的長度平方 |v|² 是多少？',String(sq),[String(a+b+c),String(a*b*c),String(a*a+b*b)],`|v|²=${a}²+${b}²+${c}²=${sq}。`)
  }

  if (title === '矩陣與線性關係' || title === '矩陣、資料與應用') {
    const a=intV20(s,1,4),b=intV20(seed(unitId,index,'b'),1,4),c=intV20(seed(unitId,index,'c'),1,4),d=intV20(seed(unitId,index,'d'),1,4)
    if(index%2===0)return taskV20(`矩陣 A=[[${a},${b}],[${c},${d}]]，向量 x=[1,2]^T。`,'A x 的第一個分量是多少？',String(a+2*b),[String(a+b),String(c+2*d),String(a*c+2*b*d)],`第一列與向量做內積：${a}×1+${b}×2=${a+2*b}。`)
    return taskV20(`矩陣 A=[[${a},${b}],[${c},${d}]]，B=[[1,0],[0,1]]。`,'A B 等於什麼？',`[[${a},${b}],[${c},${d}]]`,[`[[1,0],[0,1]]`,`[[${a+1},${b}],[${c},${d+1}]]`,`[[${a*c},${b*d}],[${c*a},${d*b}]]`],'B 是單位矩陣，因此 A 乘 B 仍是 A。')
  }

  if (title === '排列組合與機率') {
    if(index%2===0)return taskV20('5 位學生中選 2 位擔任代表，不分職務。','共有幾種選法？','10',['20','5','25'],'組合數 C(5,2)=5×4÷2=10。')
    return taskV20('袋中有 3 紅 2 藍，不放回連抽兩球。','第一球是紅球後，第二球仍是紅球的條件機率？','2/4',['3/5','3/4','2/5'],'已知先抽走一顆紅球後，剩 2 紅 2 藍，共 4 球，所以條件機率 2/4。')
  }

  if (title === '資料分析與推論') {
    if(index%2===0)return taskV20('樣本 A 的平均數 50、標準差 2；樣本 B 的平均數 50、標準差 8。','哪組資料較分散？','樣本 B',['樣本 A','兩組完全一樣','只看平均數無法知道任何分散資訊'],'兩組平均相同，但 B 的標準差較大，代表分布較分散。')
    return taskV20('抽樣調查只訪問某校籃球隊員，卻想推論全校學生的平均運動時間。','主要風險是什麼？','樣本可能不具代表性',['一定沒有任何誤差','樣本越小就一定平均數越大','只要有平均數就能代表全校'],'抽樣來源偏向常運動族群，可能產生選樣偏誤。')
  }

  if (title === '函數、圖表與建模') {
    const x1=1,y1=intV20(s,3,7),x2=4,y2=y1+intV20(seed(unitId,index,'d'),6,12),slope=(y2-y1)/(x2-x1)
    return taskV20(`資料點為 (${x1},${y1}) 與 (${x2},${y2})，先用直線近似兩點間變化。`,'這條直線的斜率是多少？',String(slope),[String(y2-y1),String(x2-x1),String((x2-x1)/(y2-y1))],`斜率=(y₂-y₁)/(x₂-x₁)=(${y2}-${y1})/(${x2}-${x1})=${slope}。`)
  }

  if (title === '幾何、測量與設計') {
    const dx=intV20(s,3,8),dy=intV20(seed(unitId,index,'d'),4,9),sq=dx*dx+dy*dy
    return taskV20(`設計圖上兩點 A=(0,0)、B=(${dx},${dy})，單位為公尺。`,'AB 距離的平方是多少？',String(sq),[String(dx+dy),String(dx*dy),String(Math.abs(dx-dy))],`距離平方=(Δx)²+(Δy)²=${dx}²+${dy}²=${sq}。`)
  }

  if (title === '指數、成長與財務情境') {
    const principal=1000,rate=[5,10][index%2],final=principal*(1+rate/100)
    return taskV20(`本金 ${principal} 元，一期利率 ${rate}%，忽略其他費用。`,'一期後本利和是多少？',`${final} 元`,[`${principal+rate} 元`,`${principal-rate} 元`,`${principal*rate} 元`],`${principal}×(1+${rate}/100)=${final}。`)
  }

  if (title === '資料分析與統計') {
    const values=[42,48,50,52,58]
    if(index%2===0)return taskV20(`資料：${values.join('、')}。`,'平均數是多少？','50',['48','52','58'],'總和 250，除以 5 得平均數 50。')
    return taskV20('兩個班平均成績都 70 分；甲班標準差 3，乙班標準差 12。','哪個敘述較合理？','乙班成績較分散',['甲班平均較高','兩班每人成績相同','標準差與分散程度無關'],'標準差越大，資料通常越分散。')
  }

  if (title === '機率與風險') {
    return taskV20('方案 A：50% 機率得 200 元、50% 得 0 元；方案 B：一定得 90 元。','只比較期望值，哪個方案較高？','方案 A',['方案 B','兩方案期望值相同','無法計算'],'A 的期望值=0.5×200=100 元，大於 B 的 90 元；但實際決策還可再考量風險偏好。')
  }

  if (title === '數學素養專題' || title === '數學甲整合問題' || title === '數學乙整合專題') {
    const a=intV20(s,5,10),b=intV20(seed(unitId,index,'b'),2,6),c=intV20(seed(unitId,index,'c'),1,5),ans=a*b-c
    return taskV20(`專題資料顯示每組 ${a} 人，共 ${b} 組；其中 ${c} 人缺席。`,'實際到場多少人？',String(ans),[String(a+b-c),String(a*b+c),String(a-c)],`先算 ${a}×${b}=${a*b}，再減 ${c} 得 ${ans}；專題題還應說明資料限制與所用模型。`)
  }

  if (title === '極限與微分') {
    if(index%2===0){const a=intV20(s,2,5),x=intV20(seed(unitId,index,'x'),1,4),ans=2*a*x;return taskV20(`f(x)=${a}x²。`,`f′(${x}) 是多少？`,String(ans),[String(a*x),String(a*x*x),String(2*a)],`f′(x)=${2*a}x，代入 x=${x} 得 ${ans}。`)}
    return taskV20('函數 f(x)=x²。','當 x 趨近 2 時，差商 [f(x)-f(2)]/(x-2) 的極限是多少？','4',['2','8','0'],'差商可化為 x+2，令 x→2 得 4；這就是 f′(2)。')
  }

  if (title === '微分應用') {
    return taskV20('函數 f(x)=x²-4x+7。','函數在哪個 x 值取得此拋物線的最小值？','x = 2',['x = -2','x = 4','x = 0'],'f′(x)=2x-4，令 f′(x)=0 得 x=2；且二次項係數為正。')
  }

  if (title === '積分與累積') {
    const a=intV20(s,2,5)
    return taskV20(`計算 ∫₀^${a} 2x dx。`,'定積分值是多少？',String(a*a),[String(2*a),String(a),String(2*a*a)],`2x 的反導函數是 x²，代入上下限得到 ${a}²=${a*a}。`)
  }

  if (title === '機率與統計深化') {
    if(index%2===0)return taskV20('隨機變數 X 取 0、1、2，機率分別為 0.2、0.5、0.3。','E(X) 是多少？','1.1',['0.8','1.0','1.5'],'E(X)=0×0.2+1×0.5+2×0.3=1.1。')
    return taskV20('某估計量抽樣分布近似常態，樣本數增加而其他條件相近。','標準誤通常如何變化？','通常變小',['通常變大','一定不變','一定變成 0'],'常見情況下標準誤與 1/√n 同階，樣本數增加會降低抽樣波動。')
  }

  if (title === '微分與生活模型') {
    const a=intV20(s,2,6),x=intV20(seed(unitId,index,'x'),1,4),ans=2*a*x
    return taskV20(`成本模型 C(x)=${a}x²+10。`,`x=${x} 時的邊際變化率 C′(${x}) 是多少？`,String(ans),[String(a*x),String(a*x*x+10),String(2*a)],`C′(x)=${2*a}x，代入得 ${ans}。`)
  }

  if (title === '機率模型') {
    return taskV20('某事件每次成功機率為 0.4，進行 2 次獨立試驗。','恰好成功 1 次的機率是多少？','0.48',['0.16','0.24','0.64'],'兩種順序：成功失敗或失敗成功，所以 2×0.4×0.6=0.48。')
  }

  if (title === '統計與資料推論') {
    return taskV20('隨機抽樣 100 人估計支持比例為 0.52；另一個獨立樣本只有 25 人且比例也為 0.52。','若其他條件相近，哪個樣本的估計通常較穩定？','100 人的樣本',['25 人的樣本','兩者一定完全相同','樣本數越大一定沒有偏誤'],'較大的隨機樣本通常有較小抽樣波動，但仍需注意抽樣方式與系統性偏誤。')
  }

  const x=intV20(s,2,9),a=intV20(seed(unitId,index,'a'),2,5),b=intV20(seed(unitId,index,'b'),1,7),total=a*x+b
  return taskV20(`本章「${title}」焦點是：${focus}。用等量關係 ${a}x+${b}=${total} 表示其中一個未知量。`,'x 的值是多少？',String(x),[String(x+b),String(a),String(total)],`由 ${a}x+${b}=${total} 得 x=${x}；若這只是整合題的一部分，還需把答案回到「${title}」的原情境解讀。`)
}
