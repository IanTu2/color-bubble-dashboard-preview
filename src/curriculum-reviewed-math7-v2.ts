import { getReviewedMath7UnitContent as getLegacyMath7 } from './curriculum-reviewed-math7'
import type { ReviewedUnitContent } from './curriculum-reviewed-social10'

function cloneAs(unit: ReviewedUnitContent, unitId: string, overview?: string): ReviewedUnitContent {
  return {
    ...unit,
    unitId,
    overview: overview ?? unit.overview,
    concepts: [...unit.concepts],
    workedExamples: [...unit.workedExamples],
    questions: unit.questions.map((question) => ({ ...question, id: question.id.replace(unit.unitId, unitId) })),
    takeaway: [...unit.takeaway],
  }
}

function mergeAs(first: ReviewedUnitContent, second: ReviewedUnitContent, unitId: string, overview: string): ReviewedUnitContent {
  return {
    grade: 7,
    subject: 'math',
    unitId,
    reviewStatus: 'reviewed',
    researchBasis: Array.from(new Set([...first.researchBasis, ...second.researchBasis, '七年級 108 課綱公開課程結構交叉查核'])),
    overview,
    concepts: [...first.concepts, ...second.concepts],
    workedExamples: [...first.workedExamples, ...second.workedExamples],
    questions: [...first.questions.slice(0, 6), ...second.questions.slice(0, 6)].map((question, index) => ({ ...question, id: `${unitId}-q${index + 1}` })),
    takeaway: Array.from(new Set([...first.takeaway, ...second.takeaway])),
  }
}

const geometry: ReviewedUnitContent = {
  grade: 7, subject: 'math', unitId: 'g7-math-s2-u1', reviewStatus: 'reviewed',
  researchBasis: ['十二年國教數學 S-7-1～S-7-5', '七年級簡單圖形與幾何符號公開課程結構'],
  overview: '幾何不只是看圖猜答案。這一章先建立點、線、角與符號語言，再學三視圖、垂直、距離和線對稱，讓圖形敘述可以被精確閱讀與推理。',
  concepts: [
    { title: '點、直線、線段與射線', explanation: '直線向兩端無限延伸；線段有兩個端點；射線有一個端點並向一個方向延伸。符號要和圖形種類一致。', example: 'AB 上方加線段符號表示線段 AB；若是直線則使用直線符號。' },
    { title: '角與角的表示', explanation: '角由兩條有共同端點的射線形成。三字母記角時，中間字母必須是頂點。', example: '∠ABC 的頂點是 B。' },
    { title: '三視圖', explanation: '從前、上、左／右等方向觀察立體物體會得到不同平面投影。三視圖要同時符合物體在三個方向的佔位。' },
    { title: '垂直與垂足', explanation: '兩直線相交成直角時稱互相垂直。從一點向直線作垂線，交點稱垂足。' },
    { title: '點到直線的距離', explanation: '點到直線的最短距離是從該點向直線所作垂線段的長度，不是任意斜線段。' },
    { title: '中垂線', explanation: '一線段的中垂線同時滿足「通過中點」和「垂直該線段」。中垂線上的點到線段兩端距離相等。' },
    { title: '線對稱', explanation: '若圖形沿某直線摺疊後兩側重合，該直線是對稱軸。對應點連線會被對稱軸垂直平分。' },
    { title: '基本對稱圖形', explanation: '等腰三角形、正方形、菱形、箏形、正多邊形具有不同數量與位置的對稱軸；不能只看「看起來左右一樣」。' },
  ],
  workedExamples: [{
    title: '為什麼最短路徑是垂線段',
    context: '點 P 在直線 ℓ 外。A 是 P 到 ℓ 的垂足，B 是 ℓ 上另一點。',
    prompt: '比較 PA 與 PB，為什麼 PA 一定不比 PB 長？',
    steps: ['PA ⟂ ℓ，所以 ∠PAB=90°。', '在直角三角形 PAB 中，PB 是斜邊。', '直角三角形斜邊長於任一直角邊，所以 PB>PA（若 B≠A）。', '因此點到直線距離定義為垂線段長度。'],
    answer: 'PA 是 P 到直線 ℓ 的最短距離。',
    explanation: '幾何定義不是口訣；它可以由直角三角形的邊長關係理解。',
  }],
  questions: [
    { id:'g7-math-s2-u1-q1',kind:'choice',level:'理解',prompt:'∠ABC 的頂點是哪一點？',options:['B','A','C','無法判斷'],correctIndex:0,explanation:'三字母記角時，中間字母是頂點。' },
    { id:'g7-math-s2-u1-q2',kind:'choice',level:'理解',prompt:'哪一種圖形只有一個端點並向一方向無限延伸？',options:['射線','線段','直線','圓'],correctIndex:0,explanation:'射線有一個端點；線段兩端都有端點；直線沒有端點。' },
    { id:'g7-math-s2-u1-q3',kind:'choice',level:'理解',prompt:'點 P 到直線 ℓ 的距離應取哪一段？',options:['P 到 ℓ 的垂線段長','P 到 ℓ 上任意點的距離','最長的斜線段','沿著 ℓ 的長度'],correctIndex:0,explanation:'點到直線距離定義為垂線段長度。' },
    { id:'g7-math-s2-u1-q4',kind:'choice',level:'理解',prompt:'線段 AB 的中垂線上的任一點 P 具有什麼性質？',options:['PA=PB','PA 一定大於 PB','P 一定在 AB 上','∠APB 一定為 90°'],correctIndex:0,explanation:'中垂線上的點到線段兩端等距。' },
    { id:'g7-math-s2-u1-q5',kind:'choice',level:'應用',prompt:'正方形有幾條對稱軸？',options:['4','1','2','8'],correctIndex:0,explanation:'兩條對角線與兩條通過對邊中點的直線，共 4 條。' },
    { id:'g7-math-s2-u1-q6',kind:'choice',level:'應用',context:'一個立體由小正方體堆成。從上方只能看到 3 個格子。',prompt:'這個資訊最直接告訴你什麼？',options:['至少有 3 個垂直柱位置被占用','總共一定只有 3 顆小正方體','高度一定全部相同','前視圖一定只有 1 格'],correctIndex:0,explanation:'上視圖只顯示平面位置是否有方塊，無法單獨決定每柱高度。' },
    { id:'g7-math-s2-u1-q7',kind:'choice',level:'檢核',prompt:'要判斷一條直線是不是線段 AB 的中垂線，至少要確認哪兩件事？',options:['通過 AB 中點且垂直 AB','通過 A 且通過 B','長度比 AB 長且平行 AB','只要垂直 AB 即可'],correctIndex:0,explanation:'中垂線同時需要「中點」與「垂直」兩條件。' },
    { id:'g7-math-s2-u1-q8',kind:'response',level:'檢核',prompt:'請說明「點到直線的距離」為什麼不是任意連到直線的一條線段長度。',sampleAnswer:'因為距離要取最短長度；從點向直線作垂線得到的垂線段比連到其他點的斜線段短，因此以垂線段長定義。',explanation:'能把「垂直」和「最短」連起來，就不是只背定義。' },
  ],
  takeaway: ['幾何符號要精確對應圖形。','三字母記角的中間字母是頂點。','點到直線距離取垂線段。','中垂線同時滿足中點與垂直。','三視圖要跨方向共同判讀。'],
}

const simultaneousEquations: ReviewedUnitContent = {
  grade:7,subject:'math',unitId:'g7-math-s2-u2',reviewStatus:'reviewed',
  researchBasis:['十二年國教數學 A-7-4、A-7-5', '七年級二元一次聯立方程式公開課程結構'],
  overview: '二元一次聯立方程式處理「兩個未知量、兩個同時成立的條件」。重點不是背消去步驟，而是理解一組解必須同時滿足兩個方程式。',
  concepts: [
    { title:'二元一次方程式', explanation:'含兩個未知數且每個未知數最高次方為 1 的等式，可表示兩個量之間的線性關係。', example:'x+y=10。' },
    { title:'一個方程式通常有很多組解', explanation:'只知道 x+y=10 時，(1,9)、(2,8)、(3,7)…都可能成立；還需要另一個獨立條件才能鎖定唯一解。' },
    { title:'聯立方程式的解', explanation:'聯立方程式的解是一組同時讓兩個方程式成立的 x、y 值。' },
    { title:'代入消去法', explanation:'由其中一式表示出一個未知數，再代入另一式，把二元問題轉成一元方程式。' },
    { title:'加減消去法', explanation:'適當倍乘兩式後相加或相減，使其中一個未知數係數互為相反數或相同，進而消去。' },
    { title:'選擇較省步驟的方法', explanation:'如果某一式已容易寫成 x=…，代入法通常方便；若係數容易對齊，加減法常更簡潔。' },
    { title:'應用題先定義兩個未知量', explanation:'先說 x、y 分別代表什麼，再把兩個獨立條件各寫成方程式，最後檢查解是否符合情境。' },
  ],
  workedExamples:[{
    title:'雞兔不是重點，兩個條件才是',
    context:'某活動成人票 x 張、學生票 y 張，共 18 張。成人票 200 元、學生票 120 元，總收入 2640 元。',
    prompt:'成人票與學生票各幾張？',
    steps:['張數條件：x+y=18。','收入條件：200x+120y=2640。','第一式乘 120：120x+120y=2160。','第二式減去它：80x=480，所以 x=6。','代回 x+y=18，得 y=12。','檢查收入：6×200+12×120=2640。'],
    answer:'成人票 6 張、學生票 12 張。',
    explanation:'兩個不同條件共同限制兩個未知數，才形成可解的聯立問題。',
  }],
  questions: [
    {id:'g7-math-s2-u2-q1',kind:'choice',level:'理解',prompt:'下列哪一組是 x+y=7 的解？',options:['(2,5)','(2,4)','(7,1)','(0,8)'],correctIndex:0,explanation:'2+5=7。'},
    {id:'g7-math-s2-u2-q2',kind:'choice',level:'理解',context:'x+y=7；x−y=1。',prompt:'哪一組同時滿足兩式？',options:['(4,3)','(5,2)','(3,4)','(7,0)'],correctIndex:0,explanation:'4+3=7 且 4−3=1。'},
    {id:'g7-math-s2-u2-q3',kind:'choice',level:'應用',context:'x=10−y；2x+y=14。',prompt:'使用代入法後，第二式變成？',options:['2(10−y)+y=14','2x+10−y=14 且保留 x','10−2y=14','20+y=14'],correctIndex:0,explanation:'把 x 完整替換成 10−y。'},
    {id:'g7-math-s2-u2-q4',kind:'choice',level:'應用',context:'2x+y=9；2x−y=3。',prompt:'兩式相加可以直接消去哪個未知數？',options:['y','x','兩者都消去','都不能'],correctIndex:0,explanation:'y 和 −y 相加為 0。'},
    {id:'g7-math-s2-u2-q5',kind:'choice',level:'應用',prompt:'解 x+y=10、x−y=4。',options:['x=7,y=3','x=6,y=4','x=3,y=7','x=8,y=2'],correctIndex:0,explanation:'兩式相加得 2x=14，x=7，再得 y=3。'},
    {id:'g7-math-s2-u2-q6',kind:'choice',level:'檢核',prompt:'為什麼只用 x+y=10 通常不能決定唯一的 x、y？',options:['因為一個條件可對應很多組解','因為 x 和 y 不能相加','因為方程式沒有等號','因為 10 太小'],correctIndex:0,explanation:'二元一次方程式單獨通常有無限多組解，需要另一個獨立條件。'},
    {id:'g7-math-s2-u2-q7',kind:'choice',level:'檢核',context:'某同學解出 x=3,y=4。',prompt:'最可靠的驗算方法是？',options:['分別代入原來兩個方程式','只看 x+y 是否為正','只代入其中一式','看答案是不是整數'],correctIndex:0,explanation:'聯立解必須同時滿足所有原式。'},
    {id:'g7-math-s2-u2-q8',kind:'response',level:'檢核',context:'兩種筆共買 11 枝，A 筆每枝 20 元、B 筆每枝 35 元，共 280 元。',prompt:'設 A 筆 x 枝、B 筆 y 枝，列出聯立方程式，不一定要解。',sampleAnswer:'x+y=11；20x+35y=280。',explanation:'先把「總枝數」與「總價格」兩個獨立條件正確翻成式子。'},
  ],
  takeaway:['一個二元一次方程式通常有多組解。','聯立解要同時滿足兩式。','代入法和加減法都在消去一個未知數。','先選步驟較簡潔的方法。','應用題要先定義未知量與兩個獨立條件。'],
}

const coordinates: ReviewedUnitContent = {
  grade:7,subject:'math',unitId:'g7-math-s2-u3',reviewStatus:'reviewed',
  researchBasis:['十二年國教數學 G-7-1、A-7-6', '七年級直角坐標與二元一次方程式圖形公開課程結構'],
  overview: '坐標把「位置」變成有順序的數對；二元一次方程式的所有解畫在平面上會形成直線。這讓代數的「解」和幾何的「交點」連起來。',
  concepts: [
    {title:'直角坐標系',explanation:'水平軸是 x 軸、鉛直軸是 y 軸，交點是原點 O。位置以有順序的數對 (x,y) 表示，順序不能交換。'},
    {title:'四個象限與座標正負',explanation:'第一象限 (+,+)、第二 (−,+)、第三 (−,−)、第四 (+,−)；坐標軸上的點不屬於任何象限。'},
    {title:'方位與距離也能坐標化',explanation:'建立適當原點與單位後，可把相對位置轉成坐標，方便比較與計算。'},
    {title:'方程式的解是平面上的點',explanation:'若 (x,y) 代入 ax+by=c 成立，該點就在這個方程式的圖形上。'},
    {title:'二元一次方程式的圖形是直線',explanation:'找至少兩組解可畫出直線；更多點可用來檢查是否畫錯。'},
    {title:'x=c 與 y=c',explanation:'x=c 表示所有點 x 坐標固定，是鉛直線；y=c 表示 y 坐標固定，是水平線。'},
    {title:'聯立方程式與交點',explanation:'兩直線的交點坐標同時在兩條線上，因此同時滿足兩個方程式，也就是聯立方程式的解。'},
  ],
  workedExamples:[{
    title:'把聯立解看成兩條線的交點',
    context:'方程式① x+y=5；② x−y=1。',
    prompt:'用代數求解，再解釋圖形意義。',
    steps:['兩式相加：2x=6，所以 x=3。','代入 x+y=5，得 y=2。','點 (3,2) 代入兩式都成立。','因此在坐標平面上，兩條直線會在 (3,2) 相交。'],
    answer:'(x,y)=(3,2)，也是兩直線交點。',
    explanation:'同一個答案同時有代數與幾何兩種意義。',
  }],
  questions: [
    {id:'g7-math-s2-u3-q1',kind:'choice',level:'理解',prompt:'點 (−3,4) 位於哪一象限？',options:['第二象限','第一象限','第三象限','第四象限'],correctIndex:0,explanation:'x<0、y>0，所以在第二象限。'},
    {id:'g7-math-s2-u3-q2',kind:'choice',level:'理解',prompt:'點 (0,5) 位在哪裡？',options:['y 軸上','第一象限','x 軸上','原點'],correctIndex:0,explanation:'x=0 的點都在 y 軸上。'},
    {id:'g7-math-s2-u3-q3',kind:'choice',level:'應用',prompt:'哪一點在 x+y=6 上？',options:['(2,4)','(2,3)','(6,1)','(−1,6)'],correctIndex:0,explanation:'2+4=6。'},
    {id:'g7-math-s2-u3-q4',kind:'choice',level:'理解',prompt:'x=3 的圖形是？',options:['通過 x=3 的鉛直線','通過 y=3 的水平線','只是一個點 (3,3)','斜率為 3 的所有直線'],correctIndex:0,explanation:'x 坐標固定為 3，y 可取不同值。'},
    {id:'g7-math-s2-u3-q5',kind:'choice',level:'理解',prompt:'y=−2 的圖形是？',options:['通過 y=−2 的水平線','通過 x=−2 的鉛直線','只有原點','沒有圖形'],correctIndex:0,explanation:'y 坐標固定，所以形成水平線。'},
    {id:'g7-math-s2-u3-q6',kind:'choice',level:'應用',context:'兩條直線相交於 (4,−1)。',prompt:'若這兩條線分別代表一組聯立方程式，解是？',options:['x=4,y=−1','x=−1,y=4','只有 x=4','沒有解'],correctIndex:0,explanation:'交點同時滿足兩式。'},
    {id:'g7-math-s2-u3-q7',kind:'choice',level:'檢核',prompt:'畫二元一次方程式直線時，為什麼常找兩組解？',options:['兩個不同點可以決定一條直線','每條直線只能有兩個點','兩個點會讓方程式變成二次','不需要檢查代入'],correctIndex:0,explanation:'直線由兩個不同點決定；第三點可再作檢查。'},
    {id:'g7-math-s2-u3-q8',kind:'response',level:'檢核',prompt:'請找出 x+2y=6 的兩組整數解，並說明這兩組解在圖形上代表什麼。',sampleAnswer:'例如 (6,0)、(4,1)。它們都是方程式圖形上的點，通過這兩點可畫出該直線。',explanation:'理解「解」和「圖形上的點」對應，是坐標幾何的核心。'},
  ],
  takeaway:['坐標是有順序的 (x,y)。','軸上的點不屬於象限。','方程式解對應圖形上的點。','二元一次方程式圖形是直線。','聯立解就是兩條直線的共同交點。'],
}

const ratio: ReviewedUnitContent = {
  grade:7,subject:'math',unitId:'g7-math-s2-u4',reviewStatus:'reviewed',
  researchBasis:['十二年國教數學 N-7-9', '七年級比與比例式、正比反比公開課程結構'],
  overview: '比是在比較兩個量，比值則是兩量相除後的數。比例式描述兩個比值相等；正比與反比則描述變數改變時的關係模式。',
  concepts: [
    {title:'比與比值',explanation:'a:b 是比，a÷b（b≠0）是比值。若量有單位，必須先確認單位是否可直接比較。'},
    {title:'等比',explanation:'比的前後項同乘或同除以同一非 0 數，比值不變。'},
    {title:'比例式',explanation:'a:b=c:d 表示 a/b=c/d，可用交叉相乘 ad=bc 檢查（分母非 0）。'},
    {title:'連比例',explanation:'a:b 與 b:c 可用共同倍數統一中間項，再寫成 a:b:c。'},
    {title:'正比',explanation:'y=kx（k≠0）時，y/x 固定；x 放大幾倍，y 也放大相同倍數。'},
    {title:'反比',explanation:'y=k/x（k≠0）時，xy 固定；x 放大幾倍，y 會縮小相同倍數。'},
    {title:'先判斷情境是否真的符合比例',explanation:'有固定費用、門檻或非線性關係時，不一定能直接用正比。',example:'計程車「起跳價＋里程費」不是總價與距離的純正比。'},
  ],
  workedExamples: [{
    title:'配方放大不是把所有數隨便加倍',
    context:'果汁配方中濃縮汁:水=2:5。要用 750 mL 水時，希望味道比例不變。',
    prompt:'需要多少濃縮汁？',
    steps:['比例式：濃縮汁/水 = 2/5。','設濃縮汁 x mL，x/750=2/5。','5x=1500，所以 x=300。','檢查：300:750 約分為 2:5。'],
    answer:'300 mL。',
    explanation:'比例式保留的是比值，而不是兩個量的差。',
  }],
  questions: [
    {id:'g7-math-s2-u4-q1',kind:'choice',level:'理解',prompt:'比 6:9 化成最簡整數比是？',options:['2:3','3:2','6:3','2:9'],correctIndex:0,explanation:'前後項同除以 3 得 2:3。'},
    {id:'g7-math-s2-u4-q2',kind:'choice',level:'理解',prompt:'3:5 的比值是？',options:['3/5','5/3','8','2'],correctIndex:0,explanation:'比值是前項除以後項。'},
    {id:'g7-math-s2-u4-q3',kind:'choice',level:'應用',prompt:'若 x:12=3:4，x=?',options:['9','16','4','36'],correctIndex:0,explanation:'x/12=3/4，所以 x=9。'},
    {id:'g7-math-s2-u4-q4',kind:'choice',level:'理解',prompt:'若 y 與 x 成正比，哪個量保持固定？',options:['y/x','xy','y−x','x+y'],correctIndex:0,explanation:'正比 y=kx，所以 y/x=k。'},
    {id:'g7-math-s2-u4-q5',kind:'choice',level:'理解',prompt:'若 y 與 x 成反比，哪個量保持固定？',options:['xy','y/x','x+y','x−y'],correctIndex:0,explanation:'反比 y=k/x，所以 xy=k。'},
    {id:'g7-math-s2-u4-q6',kind:'choice',level:'應用',context:'4 人完成固定工作需 6 小時，假設每人效率相同且可完全分工。',prompt:'8 人約需多久？',options:['3 小時','12 小時','6 小時','2 小時'],correctIndex:0,explanation:'人數與時間在理想條件下成反比，4×6=8×3。'},
    {id:'g7-math-s2-u4-q7',kind:'choice',level:'檢核',context:'停車費前 1 小時固定 50 元，之後每小時加 30 元。',prompt:'總費用和停車時間是否為正比？',options:['不是，因為有固定起始費用','是，因為時間越長錢越多','一定是反比','無法用任何數學表示'],correctIndex:0,explanation:'正比圖形需通過原點，固定費使比值不固定。'},
    {id:'g7-math-s2-u4-q8',kind:'response',level:'檢核',prompt:'請各舉一個生活中的正比與反比例子，並說明「固定的是什麼」。',sampleAnswer:'正比：單價固定時總價與數量，總價/數量=單價固定；反比：固定路程下平均速度與時間（理想模型），速度×時間=路程固定。',explanation:'重點是說出不變量，避免只看「一起變大／一大一小」。'},
  ],
  takeaway:['比值是前項除以後項。','比例式表示兩個比值相等。','正比的 y/x 固定。','反比的 xy 固定。','有固定費或其他條件時不一定是比例關係。'],
}

const inequalities: ReviewedUnitContent = {
  grade:7,subject:'math',unitId:'g7-math-s2-u5',reviewStatus:'reviewed',
  researchBasis:['十二年國教數學 A-7-7、A-7-8', '七年級一元一次不等式公開課程結構'],
  overview: '方程式找的是使兩邊「相等」的值；不等式找的是符合「大於、小於、至少、至多」等限制的一整段範圍。解不等式後要能把範圍畫在數線上。',
  concepts: [
    {title:'不等號與語意',explanation:'>、< 表示嚴格大小；≥、≤ 包含等號。文字中的「至少」通常對應 ≥，「至多／不超過」通常對應 ≤。'},
    {title:'不等式的解通常是一個範圍',explanation:'例如 x>3 有無限多個解，不是只找一個答案。'},
    {title:'加減同一數不改變方向',explanation:'不等式兩邊同加或同減同一數，大小關係保持。'},
    {title:'乘除正數不改方向',explanation:'兩邊同乘或同除正數，大小方向不變。'},
    {title:'乘除負數要反向',explanation:'兩邊同乘或同除負數時，不等號方向反轉，因為數線方向被反射。',example:'2<5，兩邊乘 −1 後 −2>−5。'},
    {title:'數線表示解',explanation:'> 或 < 的端點用空心點；≥ 或 ≤ 的端點包含在解中，用實心點。方向則依大小向左或右延伸。'},
    {title:'情境限制轉成不等式',explanation:'先定義未知數，再把「至少、最多、不超過、需要超過」等條件翻譯成符號。'},
  ],
  workedExamples: [{
    title:'預算題為什麼是 ≤',
    context:'你有 500 元，已花 140 元，每本筆記本 45 元。想知道最多還能買幾本。',
    prompt:'設還買 x 本，如何列不等式並求整數解？',
    steps:['總支出不能超過 500：140+45x≤500。','兩邊減 140：45x≤360。','兩邊除以正數 45：x≤8。','x 是本數，還需 x≥0 且為整數，所以最多 8 本。'],
    answer:'x≤8；最多買 8 本。',
    explanation:'數學解可能是一段範圍，情境再加入「非負整數」限制得到實際答案。',
  }],
  questions: [
    {id:'g7-math-s2-u5-q1',kind:'choice',level:'理解',prompt:'「x 至少是 5」應寫成？',options:['x≥5','x>5','x≤5','x<5'],correctIndex:0,explanation:'「至少」包含 5 本身。'},
    {id:'g7-math-s2-u5-q2',kind:'choice',level:'理解',prompt:'「溫度低於 10°C」應寫成？',options:['T<10','T≤10','T>10','T≥10'],correctIndex:0,explanation:'「低於」不包含 10。'},
    {id:'g7-math-s2-u5-q3',kind:'choice',level:'應用',prompt:'解 x+4>9。',options:['x>5','x<5','x≥13','x>13'],correctIndex:0,explanation:'兩邊同減 4，不等號方向不變。'},
    {id:'g7-math-s2-u5-q4',kind:'choice',level:'應用',prompt:'解 3x≤12。',options:['x≤4','x≥4','x<9','x≤36'],correctIndex:0,explanation:'兩邊除以正數 3，方向不變。'},
    {id:'g7-math-s2-u5-q5',kind:'choice',level:'應用',prompt:'解 −2x<8。',options:['x>−4','x<−4','x>4','x≤−4'],correctIndex:0,explanation:'兩邊除以 −2 時不等號反向，得到 x>−4。'},
    {id:'g7-math-s2-u5-q6',kind:'choice',level:'理解',prompt:'x≥2 畫在數線上時，2 應該用？',options:['實心點，向右延伸','空心點，向左延伸','空心點，向右延伸','實心點，向左延伸'],correctIndex:0,explanation:'≥ 包含端點 2，而且解是 2 以上。'},
    {id:'g7-math-s2-u5-q7',kind:'choice',level:'檢核',context:'遊樂設施規定身高至少 120 cm。',prompt:'若 h 表身高，條件是？',options:['h≥120','h>120','h≤120','h<120'],correctIndex:0,explanation:'「至少」包含剛好 120 cm。'},
    {id:'g7-math-s2-u5-q8',kind:'response',level:'檢核',prompt:'請用數線的觀點解釋：為什麼不等式兩邊乘負數時方向要反轉？',sampleAnswer:'乘負數相當於把數在 0 的兩側反射；原本較大的正方向位置會跑到較小的負方向位置，例如 2<5 乘 −1 後變 −2>−5，因此符號要反向。',explanation:'若能用具體數或數線說明，就不必只背「負號要反向」。'},
  ],
  takeaway:['不等式的答案通常是範圍。','至少／至多要注意是否包含端點。','加減同數不改方向。','乘除負數要反轉不等號。','數線與情境限制都是解的一部分。'],
}

export function getReviewedMath7UnitContentV2(unitId: string): ReviewedUnitContent | null {
  const oldNegative = getLegacyMath7('g7-math-s1-u1')
  const oldExponent = getLegacyMath7('g7-math-s1-u2')
  const oldFactors = getLegacyMath7('g7-math-s1-u3')
  const oldAlgebra = getLegacyMath7('g7-math-s2-u1')
  const oldEquation = getLegacyMath7('g7-math-s2-u2')
  const oldStatistics = getLegacyMath7('g7-math-s2-u3')

  if (!oldNegative || !oldExponent || !oldFactors || !oldAlgebra || !oldEquation || !oldStatistics) return null

  if (unitId === 'g7-math-s1-u1') return mergeAs(oldNegative, oldExponent, unitId, '把負數、數線、整數運算、指數與科學記號放進同一章，先建立有向數與運算規則，再理解 10 的次方如何表示極大與極小數。')
  if (unitId === 'g7-math-s1-u2') return cloneAs(oldFactors, unitId)
  if (unitId === 'g7-math-s1-u3') return mergeAs(oldAlgebra, oldEquation, unitId, '從代數符號、一次式與同類項開始，進到一元一次方程式的意義、等量公理、移項、驗算與情境建模。')
  if (unitId === geometry.unitId) return geometry
  if (unitId === simultaneousEquations.unitId) return simultaneousEquations
  if (unitId === coordinates.unitId) return coordinates
  if (unitId === ratio.unitId) return ratio
  if (unitId === inequalities.unitId) return inequalities
  if (unitId === 'g7-math-s2-u6') return cloneAs(oldStatistics, unitId, '從資料來源與抽樣開始，依序處理統計圖表、相對次數、平均數、中位數、眾數與圖表尺度，最後練習判斷統計結論的限制。')
  return null
}
