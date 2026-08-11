import type { ReviewedUnitContent } from './curriculum-reviewed-social10'

const negativeNumbers: ReviewedUnitContent = {
  grade: 7, subject: 'math', unitId: 'g7-math-s1-u1', reviewStatus: 'reviewed',
  researchBasis: ['十二年國教數學領域七年級 N-7 學習內容', '七年級 108 課綱公開課程結構'],
  overview: '負數不是一套新的神祕規則，而是把數線從 0 往左延伸。這個單元要先建立方向、相反數、絕對值與大小的直覺，再把它用到整數四則與混合運算。',
  concepts: [
    { title: '正數、負數與 0', explanation: '正負號可以表示相對於基準的兩個方向，例如海拔、溫度、收支。0 是基準點，本身既不是正數也不是負數。', example: '收入 500 元可記 +500；支出 300 元可記 −300。' },
    { title: '數線與大小', explanation: '數線越往右數值越大。比較負數時，離 0 比較近的負數反而比較大。', example: '−3 在 −8 的右邊，所以 −3 > −8。' },
    { title: '相反數', explanation: '互為相反數的兩個數到 0 的距離相同、方向相反，兩者相加等於 0。', example: '5 和 −5 互為相反數，5 + (−5) = 0。' },
    { title: '絕對值', explanation: '絕對值只表示一個數到 0 的距離，因此不帶方向，結果不會是負數。', example: '|−7| = 7，因為 −7 到 0 的距離是 7。' },
    { title: '整數加法：看位移方向', explanation: '加正數可以想成向右移；加負數可以想成向左移。異號相加時，本質上是在比較兩個方向的位移量。', example: '−4 + 7：從 −4 向右 7 格，得到 3。' },
    { title: '減法轉成加相反數', explanation: 'a − b 等於 a + (−b)。這不是硬背變號，而是把「減去一個量」重新表成「加上它的相反量」。', example: '3 − (−5) = 3 + 5 = 8。' },
    { title: '乘除符號與混合運算', explanation: '同號相乘除得正，異號得負；混合運算仍遵守括號、乘除先於加減等順序。符號判斷和數值計算要分開檢查。', example: '−3 × (−4) = +12；−12 ÷ 3 = −4。' },
  ],
  workedExamples: [{
    title: '溫度變化不是只看數字大小',
    context: '清晨溫度是 −4°C，中午上升 9°C，晚上又下降 6°C。',
    prompt: '晚上的溫度是多少？',
    steps: ['先把變化寫成有方向的數：上升 +9，下降 −6。', '從 −4 開始：−4 + 9 = 5。', '再下降 6：5 + (−6) = −1。', '用情境檢查：中午 5°C 再降 6°C，確實會低於 0°C 1 度。'],
    answer: '−1°C',
    explanation: '有向數問題的重點是先把「上升／下降」翻成正負方向，再運算。',
  }],
  questions: [
    { id:'g7-math-s1-u1-q1',kind:'choice',level:'理解',prompt:'下列哪個敘述正確？',options:['0 既不是正數也不是負數','0 是最小的正數','所有負數都比 0 大','−1 比 1 大'],correctIndex:0,explanation:'0 是正負的基準點，但不屬於正數或負數。' },
    { id:'g7-math-s1-u1-q2',kind:'choice',level:'理解',prompt:'比較 −2、−5，哪一個較大？',options:['−2','−5','一樣大','無法比較'],correctIndex:0,explanation:'數線上 −2 位在 −5 的右邊，所以 −2 > −5。' },
    { id:'g7-math-s1-u1-q3',kind:'choice',level:'理解',prompt:'|−9| 的值是多少？',options:['9','−9','0','18'],correctIndex:0,explanation:'絕對值表示到 0 的距離，所以 |−9| = 9。' },
    { id:'g7-math-s1-u1-q4',kind:'choice',level:'應用',prompt:'計算 −6 + 10。',options:['4','−4','16','−16'],correctIndex:0,explanation:'從 −6 向右 10 格，到 4。' },
    { id:'g7-math-s1-u1-q5',kind:'choice',level:'應用',prompt:'計算 7 − (−3)。',options:['10','4','−10','−4'],correctIndex:0,explanation:'減去 −3 等於加上它的相反數 +3，所以 7+3=10。' },
    { id:'g7-math-s1-u1-q6',kind:'choice',level:'應用',prompt:'計算 (−4)×(−6)。',options:['24','−24','10','−10'],correctIndex:0,explanation:'同號相乘為正，4×6=24。' },
    { id:'g7-math-s1-u1-q7',kind:'choice',level:'檢核',prompt:'計算 −12 ÷ 3 + 5。',options:['1','−9','9','−1'],correctIndex:0,explanation:'先除法：−12÷3=−4，再算 −4+5=1。' },
    { id:'g7-math-s1-u1-q8',kind:'response',level:'檢核',context:'電梯原本在地下 2 樓（記作 −2），先上升 5 層，再下降 4 層。',prompt:'請列式並求最後所在樓層。',sampleAnswer:'−2 + 5 − 4 = −1，所以最後在地下 1 樓。',explanation:'先把方向寫成有向數，再依順序計算。' },
  ],
  takeaway: ['數線越往右越大。','絕對值是到 0 的距離。','減法可以改寫成加相反數。','乘除先判斷符號，再算大小。','情境題先把方向翻成正負數。'],
}

const exponents: ReviewedUnitContent = {
  grade:7,subject:'math',unitId:'g7-math-s1-u2',reviewStatus:'reviewed',
  researchBasis:['十二年國教數學領域七年級數與量','七年級整數運算與科學記號公開課程結構'],
  overview:'指數是重複乘法的簡寫；科學記號則把非常大或非常小的數用「一個 1 到 10 之間的數 × 10 的整數次方」表示。先理解記號，再談運算規則。',
  concepts:[
    {title:'底數、指數與冪',explanation:'aⁿ 表示 n 個 a 相乘；a 是底數，n 是指數。指數不是拿來和底數相乘。',example:'2⁴ = 2×2×2×2 = 16，不是 2×4。'},
    {title:'負號與括號',explanation:'(−2)⁴ 和 −2⁴ 不同：前者底數是 −2，後者依運算慣例先算 2⁴ 再加前面的負號。',example:'(−2)⁴=16；−2⁴=−16。'},
    {title:'同底數乘法',explanation:'aᵐ×aⁿ = aᵐ⁺ⁿ，因為本質上只是把相同底數的乘法串在一起。',example:'3²×3⁴=3⁶。'},
    {title:'同底數除法',explanation:'aᵐ÷aⁿ = aᵐ⁻ⁿ（a≠0），來自分子分母相同因數的約分。',example:'5⁶÷5²=5⁴。'},
    {title:'冪的乘方',explanation:'(aᵐ)ⁿ = aᵐⁿ，因為 aᵐ 被重複乘 n 次。',example:'(2³)²=2⁶=64。'},
    {title:'10 的次方與位值',explanation:'10 的正整數次方對應小數點向右的位值變化，是科學記號的基礎。',example:'10³=1000。'},
    {title:'科學記號',explanation:'科學記號寫成 a×10ⁿ，其中 1≤|a|<10。移動小數點幾位，就用 10 的幾次方補回大小。',example:'4,500,000 = 4.5×10⁶。'},
    {title:'數量級比較',explanation:'比較科學記號時先看 10 的指數；指數相同再比較前面的係數。',example:'7.2×10⁸ > 9.9×10⁷，因為 10⁸ 的數量級更大。'},
  ],
  workedExamples:[{title:'把 0.00056 寫成科學記號',context:'科學記號要求第一個係數的絕對值介於 1 和 10 之間。',prompt:'0.00056 應寫成什麼？',steps:['把小數點移到 5.6，向右移了 4 位。','原數比 5.6 小，所以需要乘上 10 的負次方。','得到 5.6×10⁻⁴。','檢查：10⁻⁴=0.0001，5.6×0.0001=0.00056。'],answer:'5.6×10⁻⁴',explanation:'小數點移動方向不是背口訣；可用「乘回去是否恢復原數」檢查。'}],
  questions:[
    {id:'g7-math-s1-u2-q1',kind:'choice',level:'理解',prompt:'2⁵ 表示什麼？',options:['2×2×2×2×2','2×5','5×5','2+2+2+2+2'],correctIndex:0,explanation:'指數表示相同底數重複相乘的次數。'},
    {id:'g7-math-s1-u2-q2',kind:'choice',level:'理解',prompt:'(−3)² 等於多少？',options:['9','−9','6','−6'],correctIndex:0,explanation:'底數是 −3，平方得到 (+9)。'},
    {id:'g7-math-s1-u2-q3',kind:'choice',level:'應用',prompt:'2³×2⁴ = ?',options:['2⁷','4⁷','2¹²','4¹²'],correctIndex:0,explanation:'同底數相乘，指數相加：3+4=7。'},
    {id:'g7-math-s1-u2-q4',kind:'choice',level:'應用',prompt:'5⁷÷5³ = ?',options:['5⁴','5¹⁰','1⁴','25⁴'],correctIndex:0,explanation:'同底數相除，指數相減：7−3=4。'},
    {id:'g7-math-s1-u2-q5',kind:'choice',level:'應用',prompt:'(3²)³ = ?',options:['3⁶','3⁵','9⁵','6³'],correctIndex:0,explanation:'冪的乘方，指數相乘：2×3=6。'},
    {id:'g7-math-s1-u2-q6',kind:'choice',level:'理解',prompt:'8,200,000 的科學記號是？',options:['8.2×10⁶','82×10⁶','8.2×10⁵','0.82×10⁶'],correctIndex:0,explanation:'係數需介於 1 與 10 之間，原數小數點左移 6 位。'},
    {id:'g7-math-s1-u2-q7',kind:'choice',level:'檢核',prompt:'哪一個數比較大？',context:'A=4.8×10⁷；B=9.1×10⁶',options:['A','B','一樣大','無法比較'],correctIndex:0,explanation:'先比 10 的指數：10⁷ 的數量級大於 10⁶。'},
    {id:'g7-math-s1-u2-q8',kind:'response',level:'檢核',prompt:'將 0.000072 寫成科學記號，並說明指數為什麼是負的。',sampleAnswer:'7.2×10⁻⁵。因為原數小於 1，將 7.2 乘上小於 1 的 10⁻⁵ 才能回到原來大小。',explanation:'能說明大小關係比只背「往右移所以負」更穩定。'},
  ],
  takeaway:['指數是重複乘法的記號。','括號會改變底數。','指數律可以由乘法與約分理解。','科學記號係數須介於 1 和 10。','比較科學記號先看 10 的指數。'],
}

const factorsFractions: ReviewedUnitContent = {
  grade:7,subject:'math',unitId:'g7-math-s1-u3',reviewStatus:'reviewed',
  researchBasis:['十二年國教數學領域七年級 N-7-1、N-7-2、N-7-3','七年級因數分解與分數運算公開課程結構'],
  overview:'這個單元把整數的結構和分數運算連起來：先用質因數分解看懂一個整數由哪些質數組成，再用公因數、公倍數處理約分、通分與生活中的週期問題。',
  concepts:[
    {title:'質數與合數',explanation:'大於 1 的整數中，只有 1 和本身兩個正因數的是質數；有其他因數的是合數。1 不是質數也不是合數。'},
    {title:'質因數分解',explanation:'把一個大於 1 的整數寫成質數相乘，標準分解式能清楚呈現每個質因數出現幾次。',example:'60=2²×3×5。'},
    {title:'最大公因數',explanation:'兩數共同擁有的質因數中，取各自較小的次方相乘，可以得到最大公因數。',example:'12=2²×3、18=2×3²，所以 gcd=2×3=6。'},
    {title:'最小公倍數',explanation:'要同時包含兩數所有質因數，取各質因數較大的次方相乘。',example:'lcm(12,18)=2²×3²=36。'},
    {title:'分數的正負與約分',explanation:'分數仍是有理數，可以有正負；約分是分子分母同除以非 0 公因數，數值不變。'},
    {title:'異分母加減',explanation:'加減前要把每一份的大小統一，因此先找共同分母；最小公倍數常能讓計算較簡潔。'},
    {title:'分數乘除',explanation:'乘法可先約分再相乘；除以非 0 分數等於乘以它的倒數，因為目標是找出「有幾個這樣的份量」。'},
  ],
  workedExamples:[{title:'兩個警示燈多久同時亮一次',context:'A 燈每 12 秒亮一次，B 燈每 18 秒亮一次，現在同時亮。',prompt:'至少幾秒後會再次同時亮？',steps:['這是找同時出現的最早時間，所以求最小公倍數。','12=2²×3；18=2×3²。','取較高次方：2²×3²=36。','檢查：36÷12=3，36÷18=2。'],answer:'36 秒後',explanation:'「同時再發生」通常是公倍數情境；「最多平均分組」常是公因數情境。'}],
  questions:[
    {id:'g7-math-s1-u3-q1',kind:'choice',level:'理解',prompt:'下列哪一個是質數？',options:['29','1','21','35'],correctIndex:0,explanation:'29 的正因數只有 1 和 29；1 不是質數。'},
    {id:'g7-math-s1-u3-q2',kind:'choice',level:'理解',prompt:'60 的標準質因數分解是？',options:['2²×3×5','2×30','3×20','6×10'],correctIndex:0,explanation:'標準質因數分解必須全部用質數表示。'},
    {id:'g7-math-s1-u3-q3',kind:'choice',level:'應用',prompt:'12 和 18 的最大公因數是？',options:['6','36','3','2'],correctIndex:0,explanation:'共同因數中最大的是 6。'},
    {id:'g7-math-s1-u3-q4',kind:'choice',level:'應用',prompt:'12 和 18 的最小公倍數是？',options:['36','6','54','216'],correctIndex:0,explanation:'最小同時被兩數整除的正整數是 36。'},
    {id:'g7-math-s1-u3-q5',kind:'choice',level:'應用',prompt:'1/4 + 1/6 = ?',options:['5/12','2/10','1/10','2/12'],correctIndex:0,explanation:'共同分母 12：3/12+2/12=5/12。'},
    {id:'g7-math-s1-u3-q6',kind:'choice',level:'應用',prompt:'3/5 × 10/9 = ?',options:['2/3','30/45','13/14','6/5'],correctIndex:0,explanation:'先約分：10÷5=2、3÷9=1/3，所以得到 2/3。'},
    {id:'g7-math-s1-u3-q7',kind:'choice',level:'檢核',prompt:'3/4 ÷ 2/5 = ?',options:['15/8','6/20','5/6','8/15'],correctIndex:0,explanation:'除以 2/5 等於乘 5/2：3/4×5/2=15/8。'},
    {id:'g7-math-s1-u3-q8',kind:'response',level:'檢核',context:'有 24 枝鉛筆和 36 枝原子筆，要分成內容完全相同且不剩下的最多組禮物。',prompt:'最多可分幾組？每組各有幾枝？',sampleAnswer:'gcd(24,36)=12，所以最多 12 組；每組 2 枝鉛筆、3 枝原子筆。',explanation:'「最多組且平均分完」是最大公因數的典型情境。'},
  ],
  takeaway:['1 不是質數。','質因數分解揭示整數結構。','最大公因數常處理平均分組。','最小公倍數常處理週期同步。','分數加減先統一分母，除法轉成乘倒數。'],
}

const algebraExpressions: ReviewedUnitContent = {
  grade:7,subject:'math',unitId:'g7-math-s2-u1',reviewStatus:'reviewed',
  researchBasis:['十二年國教數學領域七年級代數 A-7','七年級一元一次方程式前置代數內容'],
  overview:'代數式不是把數字換成字母而已，而是用符號表示「可以改變的量」與「量之間的關係」。先學會翻譯情境，再處理同類項與運算。',
  concepts:[
    {title:'未知數與變數',explanation:'字母可以代表尚未知的數，也可以代表會改變的量。符號的意義要由題目情境決定。'},
    {title:'用代數式翻譯文字',explanation:'先找到量，再辨認加、減、倍數、總價、剩餘等關係。',example:'每枝筆 x 元，買 3 枝再付袋子 5 元，總價是 3x+5。'},
    {title:'係數、常數與項',explanation:'3x+5 中，3 是 x 的係數，5 是常數；以加減號分開的部分稱為項。'},
    {title:'同類項',explanation:'只有字母部分完全相同的項才能直接合併，合併的是係數。',example:'3x+2x=5x，但 3x+2y 不能合併成 5xy。'},
    {title:'去括號與分配律',explanation:'a(b+c)=ab+ac。括號前若是負號，相當於乘以 −1，因此括號內每一項都要改變符號。'},
    {title:'代入求值',explanation:'知道變數的值後，要把每個變數都換成指定數值並遵守運算順序。負數代入時通常先加括號避免符號混亂。'},
  ],
  workedExamples:[{title:'把「每人費用」寫成代數式',context:'班級租車固定費 2400 元，另外每位學生保險 30 元，共有 x 位學生。',prompt:'總費用如何表示？若 x=32，總費用是多少？',steps:['固定費不隨人數改變，是常數 2400。','每人 30 元，共 x 人，所以變動費是 30x。','總費用是 2400+30x。','代入 x=32：2400+30×32=3360。'],answer:'總費用 2400+30x；32 人時 3360 元。',explanation:'代數式的價值在於一個式子可以描述所有可能人數，而不是只算單一案例。'}],
  questions:[
    {id:'g7-math-s2-u1-q1',kind:'choice',level:'理解',prompt:'「一個數 x 的 4 倍再加 3」應寫成？',options:['4x+3','4(x+3)','x+7','3x+4'],correctIndex:0,explanation:'先 4 倍得到 4x，再加 3。'},
    {id:'g7-math-s2-u1-q2',kind:'choice',level:'理解',prompt:'在 5x−7 中，x 的係數是？',options:['5','−7','7','x'],correctIndex:0,explanation:'乘在 x 前面的數 5 是係數。'},
    {id:'g7-math-s2-u1-q3',kind:'choice',level:'應用',prompt:'3x+2x−4 化簡為？',options:['5x−4','5x−8','6x−4','x−4'],correctIndex:0,explanation:'3x 與 2x 是同類項，係數相加得到 5x。'},
    {id:'g7-math-s2-u1-q4',kind:'choice',level:'應用',prompt:'2(x+3) 展開為？',options:['2x+6','2x+3','x+6','2x+5'],correctIndex:0,explanation:'分配律：2×x + 2×3。'},
    {id:'g7-math-s2-u1-q5',kind:'choice',level:'應用',prompt:'−(x−5) 化簡為？',options:['−x+5','−x−5','x−5','x+5'],correctIndex:0,explanation:'括號前 −1 乘進每一項：−x+5。'},
    {id:'g7-math-s2-u1-q6',kind:'choice',level:'應用',prompt:'若 x=−2，3x+4 的值為？',options:['−2','10','2','−10'],correctIndex:0,explanation:'3(−2)+4=−6+4=−2。'},
    {id:'g7-math-s2-u1-q7',kind:'choice',level:'檢核',context:'每張票 x 元，買 5 張使用 100 元折價券。',prompt:'實付金額的代數式是？',options:['5x−100','5(x−100)','x−500','100−5x'],correctIndex:0,explanation:'五張原價共 5x，再扣掉固定折價 100 元。'},
    {id:'g7-math-s2-u1-q8',kind:'response',level:'檢核',prompt:'請說明為什麼 3x+2y 不能化簡成 5xy。',sampleAnswer:'因為 3x 和 2y 的字母部分不同，不是同類項；加法不能把不同變數直接合併成乘積。',explanation:'能辨認「同類項」是代數化簡的核心。'},
  ],
  takeaway:['字母代表量，意義由情境決定。','文字題先翻譯量與關係。','只有同類項才能合併。','分配律要乘到括號內每一項。','負數代入時用括號避免符號錯誤。'],
}

const linearEquations: ReviewedUnitContent = {
  grade:7,subject:'math',unitId:'g7-math-s2-u2',reviewStatus:'reviewed',
  researchBasis:['十二年國教數學領域七年級 A-7 一元一次方程式','七年級一元一次方程式公開課程結構'],
  overview:'方程式是一個「等量關係」。解方程式的每一步都要保持等號左右相等；所謂移項只是同時對左右兩邊做相反運算的簡寫。',
  concepts:[
    {title:'等式與方程式',explanation:'等式表示左右兩邊值相等；含未知數且要找出使等式成立的值時，就是解方程式。'},
    {title:'等量公理',explanation:'等號兩邊同加、同減、同乘或同除以同一個非 0 數，等式仍成立。這是所有解方程式步驟的依據。'},
    {title:'移項其實是相反運算',explanation:'把 +5 移到另一邊變 −5，是左右兩邊同減 5 的簡寫；理解這件事能減少符號錯誤。'},
    {title:'去括號再整理',explanation:'有括號時先用分配律，之後合併同類項，再用等量公理解未知數。'},
    {title:'含分母的方程式',explanation:'可把等號兩邊同乘所有分母的公倍數消去分母，但要確保每一項都乘到。'},
    {title:'文字題建模',explanation:'先定義未知數，再把題目中的兩個相等量寫成方程式。列式前先說清楚「哪兩個量相等」。'},
    {title:'代回檢查',explanation:'解出 x 後代回原方程式，確認左右兩邊相等；文字題還要檢查答案是否符合情境限制。'},
  ],
  workedExamples:[{title:'票價問題如何列方程式',context:'學生票每張 x 元，成人票比學生票多 40 元。買 2 張學生票和 1 張成人票共 340 元。',prompt:'學生票多少元？',steps:['設學生票 x 元，成人票就是 x+40。','總價關係：2x+(x+40)=340。','去括號並合併：3x+40=340。','兩邊同減 40：3x=300；再同除 3：x=100。','代回：200+140=340，成立。'],answer:'學生票 100 元。',explanation:'文字題最重要的不是算得快，而是把同一個量用一致的未知數表示並建立正確等量關係。'}],
  questions:[
    {id:'g7-math-s2-u2-q1',kind:'choice',level:'理解',prompt:'解 x+6=15，第一步最合理的是？',options:['等號兩邊同減 6','只把左邊減 6','等號兩邊同乘 6','把 x 改成 6'],correctIndex:0,explanation:'保持等式平衡，左右兩邊要做相同運算。'},
    {id:'g7-math-s2-u2-q2',kind:'choice',level:'應用',prompt:'解 3x=21。',options:['x=7','x=18','x=24','x=63'],correctIndex:0,explanation:'兩邊同除以 3，得到 x=7。'},
    {id:'g7-math-s2-u2-q3',kind:'choice',level:'應用',prompt:'解 2x−5=13。',options:['x=9','x=4','x=18','x=6'],correctIndex:0,explanation:'先同加 5 得 2x=18，再同除 2 得 x=9。'},
    {id:'g7-math-s2-u2-q4',kind:'choice',level:'應用',prompt:'解 3(x+2)=18。',options:['x=4','x=8','x=6','x=12'],correctIndex:0,explanation:'可先兩邊除 3 得 x+2=6，再減 2；或展開後求解。'},
    {id:'g7-math-s2-u2-q5',kind:'choice',level:'應用',prompt:'解 x/4 + 2 = 5。',options:['x=12','x=3','x=7','x=20'],correctIndex:0,explanation:'先減 2 得 x/4=3，再乘 4 得 x=12。'},
    {id:'g7-math-s2-u2-q6',kind:'choice',level:'檢核',context:'一個數的 3 倍加 4 等於 25。',prompt:'最適合的方程式是？',options:['3x+4=25','3(x+4)=25','x+7=25','4x+3=25'],correctIndex:0,explanation:'「3 倍」作用在未知數 x，再加 4。'},
    {id:'g7-math-s2-u2-q7',kind:'choice',level:'檢核',prompt:'某同學解 2x+3=11 得 x=7。最直接的檢查方式是？',options:['把 x=7 代回原式看左右是否相等','看答案是不是正數','看 7 是否比 11 小','只重抄一次步驟'],correctIndex:0,explanation:'代回原式：2×7+3=17≠11，所以答案錯。'},
    {id:'g7-math-s2-u2-q8',kind:'response',level:'檢核',context:'長方形長比寬多 3 公分，周長 30 公分。',prompt:'設寬為 x，列方程式並求長、寬。',sampleAnswer:'長=x+3，2[x+(x+3)]=30，解得 4x+6=30，x=6；寬 6 公分、長 9 公分。',explanation:'列式前先把長、寬都用同一個未知數表達，再套用周長關係。'},
  ],
  takeaway:['方程式描述等量關係。','每一步都要保持等號平衡。','移項是相反運算的簡寫。','文字題先定義未知數與相等關係。','解完要代回原式與情境檢查。'],
}

const statistics: ReviewedUnitContent = {
  grade:7,subject:'math',unitId:'g7-math-s2-u3',reviewStatus:'reviewed',
  researchBasis:['十二年國教數學領域七年級資料與不確定性 D-7','七年級統計圖表與統計數據公開課程結構'],
  overview:'統計不是把平均數公式算完就結束，而是先確認資料代表誰、怎麼收集，再用合適的圖表與統計量描述資料。不同統計量回答不同問題。',
  concepts:[
    {title:'母體、樣本與資料來源',explanation:'想研究的整體是母體，實際觀察的一部分是樣本。樣本若偏向特定族群，計算再精確也可能得出偏誤結論。'},
    {title:'類別資料與數值資料',explanation:'類別資料表示種類，例如交通方式；數值資料表示可量測數量，例如身高或時間。資料型態影響適合的圖表與統計方法。'},
    {title:'次數與相對次數',explanation:'次數是出現幾次；相對次數是某類次數占總數的比例，可用來比較不同樣本大小的資料。'},
    {title:'平均數',explanation:'平均數把總量平均分配給每一筆資料，會受到極端值影響。'},
    {title:'中位數',explanation:'資料排序後位在中間的值是中位數；當資料有極端值時，中位數常比平均數更能表示典型位置。'},
    {title:'眾數',explanation:'出現次數最多的值或類別是眾數，可能有一個、超過一個，或沒有唯一眾數。'},
    {title:'圖表選擇與尺度',explanation:'長條圖適合比較類別，折線圖常用於時間變化。坐標軸若截斷或比例不一致，可能造成視覺誤導。'},
    {title:'統計結論的限制',explanation:'統計摘要描述資料，但不自動證明因果；要看抽樣方式、樣本大小、變項定義與其他可能因素。'},
  ],
  workedExamples:[{title:'平均薪資為什麼不等於「大多數人的薪資」',context:'五人的月收入（千元）為 30、31、32、33、174。',prompt:'平均數與中位數各是多少？哪個較能描述這五人的典型收入？',steps:['平均數：(30+31+32+33+174)÷5=300÷5=60。','資料已排序，中間第三筆是 32，所以中位數 32。','174 是很大的極端值，把平均數拉高。','若要描述典型位置，中位數 32 比平均數 60 更符合多數資料所在區域。'],answer:'平均數 60 千；中位數 32 千；此例中中位數較能描述典型收入。',explanation:'不是中位數永遠比較好，而是要依資料分布與研究問題選擇統計量。'}],
  questions:[
    {id:'g7-math-s2-u3-q1',kind:'choice',level:'理解',prompt:'調查全校 1200 人的通勤方式，隨機抽 120 人作答。120 人屬於什麼？',options:['樣本','母體','眾數','平均數'],correctIndex:0,explanation:'全校 1200 人是母體，實際抽查的 120 人是樣本。'},
    {id:'g7-math-s2-u3-q2',kind:'choice',level:'理解',prompt:'「上學交通方式：步行、公車、機車接送」屬於哪類資料？',options:['類別資料','連續數值資料','平均數','中位數'],correctIndex:0,explanation:'它描述的是類別而不是數值大小。'},
    {id:'g7-math-s2-u3-q3',kind:'choice',level:'應用',prompt:'資料 2、4、6、8 的平均數是？',options:['5','4','6','20'],correctIndex:0,explanation:'總和 20，除以 4 得 5。'},
    {id:'g7-math-s2-u3-q4',kind:'choice',level:'應用',prompt:'資料 3、5、8、12、20 的中位數是？',options:['8','9.6','5','12'],correctIndex:0,explanation:'排序後中間第三筆是 8。'},
    {id:'g7-math-s2-u3-q5',kind:'choice',level:'理解',prompt:'資料 1、2、2、3、4 的眾數是？',options:['2','1','3','4'],correctIndex:0,explanation:'2 出現兩次，次數最多。'},
    {id:'g7-math-s2-u3-q6',kind:'choice',level:'應用',context:'A 班 20 人中 8 人走路上學；B 班 40 人中 12 人走路上學。',prompt:'哪班走路比例較高？',options:['A 班','B 班','一樣','無法比較'],correctIndex:0,explanation:'A=8/20=40%；B=12/40=30%，所以 A 較高。'},
    {id:'g7-math-s2-u3-q7',kind:'choice',level:'檢核',prompt:'新聞用 y 軸從 98 開始的長條圖呈現 99 與 100，兩根柱子看起來差一倍。最應注意什麼？',options:['截斷坐標軸可能誇大視覺差異','99 和 100 真的差一倍','任何圖表都不能相信','長條圖只能畫負數'],correctIndex:0,explanation:'圖表尺度會影響視覺印象，讀圖要看坐標軸起點與單位。'},
    {id:'g7-math-s2-u3-q8',kind:'response',level:'檢核',context:'某社群投票問「你是否支持延後上課？」只有自願點進貼文的人能投票。',prompt:'為什麼不能直接把結果當成全校學生意見？',sampleAnswer:'樣本是自願參與者，可能對議題特別有興趣，沒有保證能代表全校；還需考慮抽樣方式與樣本結構。',explanation:'統計結論的可信度先取決於資料如何取得，再取決於計算。'},
  ],
  takeaway:['先問資料代表誰、怎麼收集。','平均數容易受極端值影響。','中位數是排序後的中間位置。','比較不同樣本常看相對次數。','圖表尺度與抽樣方式都可能誤導。'],
}

const UNITS: Record<string, ReviewedUnitContent> = {
  [negativeNumbers.unitId]: negativeNumbers,
  [exponents.unitId]: exponents,
  [factorsFractions.unitId]: factorsFractions,
  [algebraExpressions.unitId]: algebraExpressions,
  [linearEquations.unitId]: linearEquations,
  [statistics.unitId]: statistics,
}

export function getReviewedMath7UnitContent(unitId: string) {
  return UNITS[unitId] ?? null
}
