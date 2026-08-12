import type {
  ReviewedConcept,
  ReviewedQuestion,
  ReviewedWorkedExample,
} from './curriculum-reviewed-social10'

export type Math7TextbookSupplement = {
  unitId: string
  officialCodes: string[]
  misconceptionConcepts: ReviewedConcept[]
  workedExamples: ReviewedWorkedExample[]
  questions: ReviewedQuestion[]
}

const supplements: Math7TextbookSupplement[] = [
  {
    unitId: 'g7-math-s1-u1',
    officialCodes: ['N-7-3', 'N-7-4', 'N-7-5', 'N-7-6', 'N-7-7', 'N-7-8'],
    misconceptionConcepts: [
      {
        title: '常見迷思｜絕對值不是「把負號拿掉」的規則',
        explanation: '絕對值的核心是數線上的距離，所以 |a-b| 表示 a、b 兩點的距離。把它只記成「負數變正數」會在 |a-b|、含運算式的情況失去意義。',
        example: '|−7−2|=|−9|=9，代表 −7 與 2 在數線上相距 9。',
      },
      {
        title: '常見迷思｜負號和次方的作用範圍要看括號',
        explanation: '(−3)^2 是把 −3 整體平方；−3^2 則先算 3^2，再取負號。運算符號的作用範圍不同，答案就不同。',
        example: '(−3)^2=9，但 −3^2=−9。',
      },
    ],
    workedExamples: [
      {
        title: '同時辨認負號、次方與科學記號',
        context: '比較 A=(−3)^2、B=−3^2，並把 0.000072 寫成標準科學記號。',
        prompt: 'A、B 各是多少？0.000072 的科學記號怎麼寫？',
        steps: [
          'A 的底數是整個 −3，所以 A=(−3)×(−3)=9。',
          'B 沒有括號，先算 3^2=9，再套外面的負號，所以 B=−9。',
          '0.000072 的小數點向右移 5 位得到 7.2；原數很小，因此乘上 10^−5。',
          '檢查科學記號係數 7.2 落在 1≤a<10，格式正確。',
        ],
        answer: 'A=9、B=−9；0.000072=7.2×10^−5。',
        explanation: '括號決定次方作用的底數；科學記號則用 10 的整數次方記錄小數點移動的位數。',
      },
    ],
    questions: [
      { id: 'g7-math-s1-u1-supp-q1', kind: 'choice', level: '理解', prompt: '|−7−2| 的值是多少？', options: ['9', '5', '−9', '−5'], correctIndex: 0, explanation: '先算括號內概念：−7−2=−9；絕對值是到 0 的距離，所以 |−9|=9。' },
      { id: 'g7-math-s1-u1-supp-q2', kind: 'choice', level: '應用', prompt: '下列哪一組計算正確？', options: ['(−2)^4=16 且 −2^4=−16', '(−2)^4=−16 且 −2^4=16', '兩者都等於 16', '兩者都等於 −16'], correctIndex: 0, explanation: '(−2)^4 的底數含負號；−2^4 則先算 2^4 再取負。' },
      { id: 'g7-math-s1-u1-supp-q3', kind: 'choice', level: '應用', prompt: '0.00056 的標準科學記號是？', options: ['5.6×10^−4', '56×10^−5', '5.6×10^4', '0.56×10^−3'], correctIndex: 0, explanation: '標準形式要求係數介於 1 與 10 之間；0.00056=5.6×10^−4。' },
      { id: 'g7-math-s1-u1-supp-q4', kind: 'response', level: '檢核', prompt: '說明為什麼 30×10^3 雖然和 3×10^4 數值相同，通常不寫成標準科學記號。', sampleAnswer: '標準科學記號寫成 a×10^n，且 1≤a<10。30 不符合係數範圍；把 30 改成 3×10，便得到 3×10^4。', explanation: '科學記號除了數值相等，還有統一的標準表示形式，方便比較數量級。' },
    ],
  },
  {
    unitId: 'g7-math-s1-u2',
    officialCodes: ['N-7-1', 'N-7-2', 'N-7-3'],
    misconceptionConcepts: [
      {
        title: '常見迷思｜質因數分解不是找到「任何乘法」就結束',
        explanation: '標準分解式必須把合數一路分解到所有因數都是質數，並用固定順序與指數整理。',
        example: '84=4×21 還沒完成；84=2^2×3×7 才是標準質因數分解。',
      },
      {
        title: '常見迷思｜最大公因數和最小公倍數的指數選法相反',
        explanation: '共同因數只能取兩數都擁有的質因數次方，所以取較小指數；要成為兩數共同倍數則必須涵蓋雙方需求，所以取較大指數。',
        example: '48=2^4×3，72=2^3×3^2，因此 GCD=2^3×3=24，LCM=2^4×3^2=144。',
      },
    ],
    workedExamples: [
      {
        title: '用質因數分解同時求最大公因數與最小公倍數',
        context: '兩種警示燈分別每 18 秒與每 24 秒閃一次，現在同時閃亮。',
        prompt: '至少再過多久兩盞燈會再次同時閃？若要把 18 與 24 分成相同大小且最大的整數組，又和哪個量有關？',
        steps: [
          '18=2×3^2；24=2^3×3。',
          '再次同時閃需要同時是 18 與 24 的倍數，取 LCM=2^3×3^2=72。',
          '若問「可以整除兩數的最大大小」，則取共同質因數的較小次方：GCD=2×3=6。',
          '用語意檢查：同步週期用最小公倍數；最大等分用最大公因數。',
        ],
        answer: '72 秒後再次同時閃；最大等分量對應最大公因數 6。',
        explanation: '先判斷問題要找共同「倍數」還是共同「因數」，比死背題型關鍵字可靠。',
      },
    ],
    questions: [
      { id: 'g7-math-s1-u2-supp-q1', kind: 'choice', level: '理解', prompt: '84 的標準質因數分解是哪一個？', options: ['2^2×3×7', '4×21', '2×42', '3×28'], correctIndex: 0, explanation: '標準分解式的每個因數都要是質數，84=2^2×3×7。' },
      { id: 'g7-math-s1-u2-supp-q2', kind: 'choice', level: '應用', prompt: '48 與 72 的最大公因數是多少？', options: ['24', '12', '144', '6'], correctIndex: 0, explanation: '48=2^4×3，72=2^3×3^2，共同部分取較小指數得 2^3×3=24。' },
      { id: 'g7-math-s1-u2-supp-q3', kind: 'choice', level: '應用', prompt: '12 與 18 的最小公倍數是多少？', options: ['36', '6', '72', '30'], correctIndex: 0, explanation: '12=2^2×3，18=2×3^2，LCM=2^2×3^2=36。' },
      { id: 'g7-math-s1-u2-supp-q4', kind: 'response', level: '檢核', prompt: '計算 −3/4+5/6，並說明為什麼不能直接把分子與分母分別相加。', sampleAnswer: '最小公分母是 12，−3/4=−9/12，5/6=10/12，所以和為 1/12。分數相加要先統一每一份的大小；分母不同代表單位分數大小不同，不能直接相加。', explanation: '分數運算的核心是共同單位，而不是記一條機械規則。' },
    ],
  },
  {
    unitId: 'g7-math-s1-u3',
    officialCodes: ['A-7-1', 'A-7-2', 'A-7-3'],
    misconceptionConcepts: [
      {
        title: '常見迷思｜只有同類項才能合併',
        explanation: '2x 與 3x 都代表若干個 x，可以合併；2x 與 3 則是不同種類的量，不能寫成 5x。',
        example: '2x+3x=5x，但 2x+3 不能再化簡。',
      },
      {
        title: '常見迷思｜「移項變號」只是等量操作的縮寫',
        explanation: '項目不是真的跨過等號就魔法變號；本質是方程式兩邊同加或同減相同的量。理解這點才能處理括號、分數與較複雜方程式。',
        example: 'x+5=12 兩邊同減 5 得 x=7，課堂上才常簡寫成「+5 移到右邊變 −5」。',
      },
    ],
    workedExamples: [
      {
        title: '從幾何敘述建立一元一次方程式',
        context: '長方形的寬是 x cm，長比寬多 3 cm，周長為 30 cm。',
        prompt: '求長方形的長與寬。',
        steps: [
          '定義：寬=x，長=x+3。',
          '周長=2×長+2×寬，所以 2(x+3)+2x=30。',
          '展開：2x+6+2x=30，合併得 4x+6=30。',
          '兩邊同減 6：4x=24；再同除以 4：x=6。',
          '長=x+3=9。檢查：2×9+2×6=30。',
        ],
        answer: '寬 6 cm、長 9 cm。',
        explanation: '方程式的價值是把文字中的數量關係精確記錄，再用等量原理求未知數。',
      },
    ],
    questions: [
      { id: 'g7-math-s1-u3-supp-q1', kind: 'choice', level: '理解', prompt: '化簡 3(2x−1)−4x 的結果是？', options: ['2x−3', '2x−1', '6x−7', '10x−3'], correctIndex: 0, explanation: '先分配：6x−3−4x，再合併同類項得 2x−3。' },
      { id: 'g7-math-s1-u3-supp-q2', kind: 'choice', level: '應用', prompt: '方程式 5x−7=2x+8 的解是？', options: ['x=5', 'x=1', 'x=−5', 'x=15'], correctIndex: 0, explanation: '兩邊同減 2x 得 3x−7=8，再同加 7 得 3x=15，所以 x=5。' },
      { id: 'g7-math-s1-u3-supp-q3', kind: 'choice', level: '應用', context: '某數的 3 倍再加 4 等於 25。', prompt: '若此數為 x，正確方程式與答案是哪一組？', options: ['3x+4=25，x=7', '3(x+4)=25，x=13/3', '3x−4=25，x=7', 'x+3+4=25，x=18'], correctIndex: 0, explanation: '「某數的 3 倍再加 4」是 3x+4；解得 3x=21，所以 x=7。' },
      { id: 'g7-math-s1-u3-supp-q4', kind: 'response', level: '檢核', prompt: '同學把 x+5=12 說成「5 跑到右邊所以變 −5」。請用等量公理重新解釋這一步。', sampleAnswer: '真正做的是方程式兩邊都減 5：x+5−5=12−5，所以 x=7。「移項變號」只是把兩邊同做相反運算的過程簡寫。', explanation: '理解等量公理後，就不需要把移項當成沒有理由的符號規則。' },
    ],
  },
  {
    unitId: 'g7-math-s2-u1',
    officialCodes: ['S-7-1', 'S-7-2', 'S-7-3', 'S-7-4', 'S-7-5'],
    misconceptionConcepts: [
      {
        title: '常見迷思｜「看起來垂直／對稱」不是幾何證明',
        explanation: '圖形只是幫助思考，真正判斷仍要使用直角、中點、等長、等角等條件。手繪圖不精確時尤其不能只靠眼睛。',
        example: '一條線穿過線段中點但沒有垂直，仍然不是中垂線。',
      },
      {
        title: '常見迷思｜對稱軸不是隨便把圖形切成兩塊',
        explanation: '沿對稱軸摺疊後，兩側必須完全重合；對應點的連線會被對稱軸垂直平分。',
        example: '一般長方形有 2 條對稱軸，但對角線通常不是對稱軸；正方形則有 4 條。',
      },
    ],
    workedExamples: [
      {
        title: '從線對稱推回距離關係',
        context: '點 A 對直線 ℓ 的對稱點是 A′，線段 AA′ 與 ℓ 交於 M。',
        prompt: 'M 和直線 ℓ 具有哪些必然性質？',
        steps: [
          '對稱表示 A 與 A′ 到對稱軸的位置完全對應。',
          '對稱軸會垂直平分任一對對應點的連線，因此 ℓ⊥AA′。',
          '因為是「平分」，M 是 AA′ 的中點，所以 AM=MA′。',
          '這兩個條件合起來說明 ℓ 是 AA′ 的中垂線。',
        ],
        answer: 'ℓ⊥AA′，且 AM=MA′；M 是 AA′ 的中點。',
        explanation: '線對稱不只是一個外觀概念，它會產生可用來推理的垂直與等長性質。',
      },
    ],
    questions: [
      { id: 'g7-math-s2-u1-supp-q1', kind: 'choice', level: '理解', prompt: '一條直線通過線段 AB 的中點。還要加上哪個條件，才能保證它是 AB 的中垂線？', options: ['與 AB 垂直', '與 AB 平行', '通過 A', '長度等於 AB'], correctIndex: 0, explanation: '中垂線需要同時滿足「通過中點」與「垂直原線段」。' },
      { id: 'g7-math-s2-u1-supp-q2', kind: 'choice', level: '應用', prompt: '一個不是正方形的長方形有幾條對稱軸？', options: ['2', '1', '4', '0'], correctIndex: 0, explanation: '通過兩組對邊中點的兩條直線是對稱軸；一般長方形的兩條對角線不是對稱軸。' },
      { id: 'g7-math-s2-u1-supp-q3', kind: 'choice', level: '應用', prompt: 'P 在 AB 的中垂線上。下列哪一個關係一定成立？', options: ['PA=PB', 'PA⊥PB', 'P 是 AB 中點', '∠APB=90°'], correctIndex: 0, explanation: '中垂線上的任一點到線段兩端等距，但 P 不必是中點，也不保證形成直角。' },
      { id: 'g7-math-s2-u1-supp-q4', kind: 'response', level: '檢核', prompt: '請比較「直線、射線、線段」的端點數量與延伸方式，並說明為什麼不能只用外觀看起來長短來判斷。', sampleAnswer: '直線沒有端點且向兩端無限延伸；射線有一個端點並向一端無限延伸；線段有兩個端點且長度有限。紙上的圖都只能畫有限長，所以必須靠端點與符號判斷，不是看畫得多長。', explanation: '幾何圖只是抽象物件的表示，定義比畫面長短更可靠。' },
    ],
  },
  {
    unitId: 'g7-math-s2-u2',
    officialCodes: ['A-7-4', 'A-7-5'],
    misconceptionConcepts: [
      {
        title: '常見迷思｜聯立方程式的解必須同時滿足兩式',
        explanation: '代入其中一式成立還不夠；一組 (x,y) 只有在兩個方程式都成立時才是聯立方程式的解。',
        example: '(3,5) 滿足 x+y=8，但若另一式是 x−y=2，它就不是聯立解。',
      },
      {
        title: '常見迷思｜消去法不是消掉「不喜歡的符號」',
        explanation: '加減消去要先用等價變形讓某未知數的係數相同或互為相反數，再把兩個等式相加／相減。每一步都必須保持原方程式的解集合。',
      },
    ],
    workedExamples: [
      {
        title: '選擇加減消去法解價格問題',
        context: '2 本筆記本加 3 支筆共 90 元；3 本相同筆記本加 2 支相同筆共 110 元。',
        prompt: '每本筆記本、每支筆各多少元？',
        steps: [
          '設筆記本 x 元、筆 y 元：2x+3y=90，3x+2y=110。',
          '第一式乘 3：6x+9y=270；第二式乘 2：6x+4y=220。',
          '兩式相減得 5y=50，所以 y=10。',
          '代回 2x+3(10)=90，得到 2x=60，x=30。',
          '檢查第二式：3×30+2×10=110。',
        ],
        answer: '筆記本 30 元，筆 10 元。',
        explanation: '方法的選擇看係數是否容易對齊；最後代回另一式能檢查計算與列式。',
      },
    ],
    questions: [
      { id: 'g7-math-s2-u2-supp-q1', kind: 'choice', level: '理解', prompt: '聯立 x+y=9、x−y=3 的解是？', options: ['(6,3)', '(3,6)', '(9,3)', '(6,−3)'], correctIndex: 0, explanation: '兩式相加得 2x=12，所以 x=6；代回得 y=3。' },
      { id: 'g7-math-s2-u2-supp-q2', kind: 'choice', level: '應用', context: '成人票 x 張、學生票 y 張，共 20 張。', prompt: '哪個方程式一定符合張數條件？', options: ['x+y=20', 'x−y=20', '20x+y=1', 'xy=20'], correctIndex: 0, explanation: '總張數是兩種票數量相加，因此 x+y=20。' },
      { id: 'g7-math-s2-u2-supp-q3', kind: 'choice', level: '應用', prompt: '哪一組同時滿足 2x+y=7 與 x−y=2？', options: ['(3,1)', '(2,3)', '(4,−1)', '(1,5)'], correctIndex: 0, explanation: '代入 (3,1)：2×3+1=7 且 3−1=2，兩式都成立。' },
      { id: 'g7-math-s2-u2-supp-q4', kind: 'response', level: '檢核', prompt: '什麼情況下你會優先考慮代入消去法？什麼情況下加減消去法可能比較省步驟？', sampleAnswer: '若其中一式已容易寫成 x=… 或 y=…，代入法通常直接；若兩式某未知數係數已相同、相反或容易倍乘對齊，加減法通常較快。兩種方法都必須保持等價並最後驗算。', explanation: '能依方程式結構選方法，比只背固定流程更能處理變式題。' },
    ],
  },
  {
    unitId: 'g7-math-s2-u3',
    officialCodes: ['G-7-1', 'A-7-6'],
    misconceptionConcepts: [
      {
        title: '常見迷思｜坐標 (x,y) 的順序不能交換',
        explanation: '第一個數是水平的 x 坐標，第二個數是鉛直的 y 坐標；交換後通常會變成另一個點。',
        example: '(2,−3) 與 (−3,2) 位於不同象限。',
      },
      {
        title: '常見迷思｜在坐標軸上的點不屬於任何象限',
        explanation: '象限是由 x 軸、y 軸切出的四個開放區域；只要 x=0 或 y=0，點就在軸上而不屬於象限。',
      },
    ],
    workedExamples: [
      {
        title: '把聯立方程式的解看成兩條直線的交點',
        context: '兩條直線分別由 x+y=7 與 x−y=1 表示。',
        prompt: '求交點，並說明為什麼它就是聯立方程式的解。',
        steps: [
          '兩式相加：2x=8，所以 x=4。',
          '代回 x+y=7，得到 y=3。',
          '(4,3) 代入第一式：4+3=7；代入第二式：4−3=1。',
          '在圖形上，一個交點同時位於兩條直線上，所以坐標同時滿足兩個方程式。',
        ],
        answer: '交點為 (4,3)，也就是聯立方程式的解。',
        explanation: '代數的「同時滿足」和幾何的「共同交點」是同一件事的兩種表示。',
      },
    ],
    questions: [
      { id: 'g7-math-s2-u3-supp-q1', kind: 'choice', level: '理解', prompt: '點 (−4,−2) 位於哪一象限？', options: ['第三象限', '第一象限', '第二象限', '第四象限'], correctIndex: 0, explanation: 'x<0、y<0，所以在第三象限。' },
      { id: 'g7-math-s2-u3-supp-q2', kind: 'choice', level: '理解', prompt: '方程式 y=3 在坐標平面上的圖形是？', options: ['通過 y=3 的水平直線', '通過 x=3 的鉛直直線', '只有點 (3,3)', '通過原點的斜線'], correctIndex: 0, explanation: 'y 永遠固定為 3，而 x 可以取不同值，因此形成水平線。' },
      { id: 'g7-math-s2-u3-supp-q3', kind: 'choice', level: '應用', prompt: '哪一點在直線 2x+y=6 上？', options: ['(2,2)', '(1,5)', '(3,2)', '(0,5)'], correctIndex: 0, explanation: '代入 (2,2)：2×2+2=6。其他選項代入不等於 6。' },
      { id: 'g7-math-s2-u3-supp-q4', kind: 'response', level: '檢核', prompt: '請找出 2x+y=6 的另一組整數解（不能用 (2,2)），並說明它在圖形上代表什麼。', sampleAnswer: '例如 x=1 時 y=4，所以 (1,4) 是一組解。它代表直線 2x+y=6 上的一個點；任何滿足方程式的坐標都在同一條直線上。', explanation: '把代數解連到圖形上的點，是這一章最重要的表示轉換。' },
    ],
  },
  {
    unitId: 'g7-math-s2-u4',
    officialCodes: ['N-7-9'],
    misconceptionConcepts: [
      {
        title: '常見迷思｜「兩個量一起變大」不代表一定成正比',
        explanation: '正比要求 y/x 是固定常數，而且關係 y=kx 通過原點。若有固定起始費、門檻或其他項，即使兩量一起增加也可能不是正比。',
      },
      {
        title: '常見迷思｜比的順序會改變意義',
        explanation: 'a:b 和 b:a 通常不是同一個比。列比以前要先說清楚「誰比誰」，並統一可比較的單位。',
        example: '男生:女生=2:3 不等於女生:男生=2:3；後者應是 3:2。',
      },
    ],
    workedExamples: [
      {
        title: '用比例尺把圖上距離換成真實距離',
        context: '地圖比例尺為 1:50,000，兩地在圖上的直線距離量得 3.6 cm。',
        prompt: '兩地實際直線距離約多少公里？',
        steps: [
          '比例尺 1:50,000 表示圖上 1 cm 對應實際 50,000 cm。',
          '3.6×50,000=180,000 cm。',
          '100,000 cm=1 km，所以 180,000 cm=1.8 km。',
          '檢查量綱：先在相同單位做比例，再把結果換成公里。',
        ],
        answer: '約 1.8 km。',
        explanation: '比例尺本質是固定比值；單位換算若沒處理好，即使比例式正確也會得到錯誤結果。',
      },
    ],
    questions: [
      { id: 'g7-math-s2-u4-supp-q1', kind: 'choice', level: '理解', prompt: '若紅球:藍球=2:5，藍球有 20 顆，紅球有幾顆？', options: ['8', '10', '50', '18'], correctIndex: 0, explanation: '藍球 5 份=20，所以 1 份=4，紅球 2 份=8。' },
      { id: 'g7-math-s2-u4-supp-q2', kind: 'choice', level: '應用', context: '每公斤蘋果固定 60 元，不打折也沒有固定費。', prompt: '總價 y 與重量 x 的關係是哪一個？', options: ['y=60x，成正比', 'xy=60，成反比', 'y=x+60，成正比', 'y=60/x，成反比'], correctIndex: 0, explanation: '單價固定代表 y/x=60，所以 y=60x，且通過原點。' },
      { id: 'g7-math-s2-u4-supp-q3', kind: 'choice', level: '應用', context: '完成固定工作量，假設每人效率相同且可完全分工。', prompt: '人數加倍時，所需時間會怎麼變？', options: ['變為一半，理想模型下成反比', '也加倍，成正比', '完全不變', '一定變成四倍'], correctIndex: 0, explanation: '工作量固定時，人數×時間為固定量，因此理想模型下成反比。' },
      { id: 'g7-math-s2-u4-supp-q4', kind: 'response', level: '檢核', prompt: '為什麼「計程車起跳 85 元，之後每公里加 25 元」的總價和公里數不是正比？', sampleAnswer: '若總價 y=85+25x，當 x=0 時 y=85，不通過原點；而且 y/x 不是固定常數。雖然里程增加會讓總價增加，但不符合 y=kx。', explanation: '判斷正比要看固定比值與是否通過原點，不能只看兩個量是不是一起增加。' },
    ],
  },
  {
    unitId: 'g7-math-s2-u5',
    officialCodes: ['A-7-7', 'A-7-8'],
    misconceptionConcepts: [
      {
        title: '常見迷思｜不等式的解通常不是一個數',
        explanation: '方程式常找特定值；不等式則描述一整個範圍。解完後要同時保留不等號方向與端點是否包含。',
      },
      {
        title: '常見迷思｜乘除負數反向有數線理由',
        explanation: '所有數乘 −1 會在數線上以 0 為中心反射，原本右邊較大的數會跑到左邊，因此大小關係反轉。',
        example: '2<5，但乘 −1 後 −2>−5。',
      },
    ],
    workedExamples: [
      {
        title: '負係數不等式：為什麼最後要反向',
        context: '解不等式 −3x+4≥10。',
        prompt: '求 x 的範圍，並用代入值快速檢查方向。',
        steps: [
          '兩邊同減 4：−3x≥6。',
          '兩邊同除以 −3；除以負數時大小關係反轉，所以 x≤−2。',
          '檢查邊界 x=−2：−3(−2)+4=10，符合 ≥10。',
          '再取範圍內 x=−3：13≥10 成立；取範圍外 x=0：4≥10 不成立。',
        ],
        answer: 'x≤−2。',
        explanation: '代入一個範圍內與一個範圍外的值，可以快速發現不等號方向是否寫反。',
      },
    ],
    questions: [
      { id: 'g7-math-s2-u5-supp-q1', kind: 'choice', level: '理解', prompt: '「人數不超過 40 人」若以 n 表人數，應寫成？', options: ['n≤40', 'n<40', 'n≥40', 'n>40'], correctIndex: 0, explanation: '「不超過」包含剛好 40，所以是 ≤。' },
      { id: 'g7-math-s2-u5-supp-q2', kind: 'choice', level: '應用', prompt: '解 −4x>12。', options: ['x<−3', 'x>−3', 'x<3', 'x>3'], correctIndex: 0, explanation: '兩邊除以 −4 時不等號反向，得到 x<−3。' },
      { id: 'g7-math-s2-u5-supp-q3', kind: 'choice', level: '應用', context: '每張票 80 元，手上最多可花 500 元。', prompt: '若 x 是可買票數，且 x 為非負整數，哪個敘述正確？', options: ['80x≤500，所以最多買 6 張', '80x≥500，所以至少買 7 張', '80+x≤500，所以最多買 420 張', 'x/80≤500，所以最多買 40,000 張'], correctIndex: 0, explanation: '500÷80=6.25；x 必須是非負整數且滿足 x≤6.25，所以最多 6 張。' },
      { id: 'g7-math-s2-u5-supp-q4', kind: 'response', level: '檢核', prompt: '解 5−2x<11，並用一個符合解的數與一個不符合解的數驗證。', sampleAnswer: '5−2x<11 → −2x<6 → x>−3。取 x=0：5<11 成立；取 x=−4：13<11 不成立，因此方向 x>−3 合理。', explanation: '不等式除了代數操作，還可以用代入測試檢查範圍方向。' },
    ],
  },
  {
    unitId: 'g7-math-s2-u6',
    officialCodes: ['D-7-1', 'D-7-2'],
    misconceptionConcepts: [
      {
        title: '常見迷思｜平均數不一定最能代表「典型」資料',
        explanation: '平均數會受極端值影響；資料高度偏斜時，中位數有時更接近多數資料所在的位置。選統計量要看資料分布與問題目的。',
        example: '2、2、3、4、19 的平均數是 6，但中位數是 3；19 把平均數明顯拉高。',
      },
      {
        title: '常見迷思｜圖表的視覺差距可能被座標軸放大',
        explanation: '長條圖若縱軸不是從 0 開始，數值差異會看起來比實際更巨大。讀圖時要先看刻度、單位、資料總量與圖表類型。',
      },
    ],
    workedExamples: [
      {
        title: '同一組資料為什麼平均數、中位數、眾數說法不同',
        context: '某五天的等待時間（分鐘）為 2、2、3、4、19。',
        prompt: '計算平均數、中位數、眾數，並判斷哪個數最能描述「一般幾天」的等待狀況。',
        steps: [
          '平均數=(2+2+3+4+19)÷5=30÷5=6。',
          '資料已排序，中間第 3 個值是 3，所以中位數=3。',
          '2 出現最多次，所以眾數=2。',
          '19 是明顯較大的值，把平均數拉到 6；若想描述一般幾天的典型等待，中位數 3 可能更有代表性，但應同時說明資料分布。',
        ],
        answer: '平均數 6、中位數 3、眾數 2；描述典型等待時中位數 3 較不受 19 分鐘離群值影響。',
        explanation: '統計量沒有永遠唯一的「最好」；必須根據資料分布與問題目的解讀。',
      },
    ],
    questions: [
      { id: 'g7-math-s2-u6-supp-q1', kind: 'choice', level: '理解', prompt: '資料 3、5、5、7、10 的中位數是多少？', options: ['5', '6', '7', '10'], correctIndex: 0, explanation: '資料已排序且共有 5 個，中間第 3 個數是 5。' },
      { id: 'g7-math-s2-u6-supp-q2', kind: 'choice', level: '理解', prompt: '資料 4、4、6、8、8、8、10 的眾數是多少？', options: ['8', '4', '6', '10'], correctIndex: 0, explanation: '8 出現 3 次，是出現次數最多的數。' },
      { id: 'g7-math-s2-u6-supp-q3', kind: 'choice', level: '應用', context: '兩家店滿意度分別為 82 分與 84 分。某圖把縱軸只畫 80～85，使兩根長條看起來差很多。', prompt: '閱讀這張圖最需要注意什麼？', options: ['縱軸截斷可能放大視覺差異，應回到實際數值比較', '84 一定是 82 的兩倍', '只要是長條圖就不能比較', '縱軸一定必須從 100 開始'], correctIndex: 0, explanation: '數值只差 2 分；截斷縱軸可能讓視覺差距被放大。讀圖要同時看刻度與原始數值。' },
      { id: 'g7-math-s2-u6-supp-q4', kind: 'response', level: '檢核', prompt: '班上大多數人的零用錢在 100～300 元，但有一位是 3000 元。若要描述「典型學生」的零用錢，你會優先看平均數還是中位數？說明理由。', sampleAnswer: '我會優先看中位數，因為 3000 元是很大的極端值，會把平均數明顯拉高；中位數只看排序後中間的位置，較不受單一極端值影響。不過完整報告仍應同時提供資料分布。', explanation: '題目要檢查的是能否依資料特性選擇統計量，而不是背「平均數一定最好」。' },
    ],
  },
]

export function getMath7TextbookSupplement(unitId: string) {
  return supplements.find((item) => item.unitId === unitId) ?? null
}

export function math7TextbookSupplementUnitIds() {
  return supplements.map((item) => item.unitId)
}
