import type { CurriculumLessonPlan, CurriculumUnitBundle } from './curriculum-course-engine'
import type { CurriculumSubjectId } from './curriculum-plan'

export type TeachingExample = {
  prompt: string
  steps: string[]
  answer: string
}

export type TeachingBlock = {
  id: string
  eyebrow: string
  title: string
  paragraphs: string[]
  bullets?: string[]
  example?: TeachingExample
}

function includesAny(value: string, keywords: string[]) {
  return keywords.some((keyword) => value.includes(keyword))
}

function mathNotes(title: string, focus: string): { paragraphs: string[]; bullets: string[] } {
  if (includesAny(title, ['正負', '有向數', '數線', '絕對值'])) return {
    paragraphs: [
      '正數和負數常用來表示「相反方向」或「相對於基準的位置」。例如海拔以上可記正、海拔以下可記負；溫度高於 0°C 可記正、低於 0°C 可記負。',
      '數線上越往右數值越大。絕對值表示一個數和 0 的距離，所以 |−5| = 5、|5| = 5；絕對值本身不表示方向。',
    ],
    bullets: ['加上正數：往右移', '加上負數：往左移', '絕對值：只看與 0 的距離'],
  }
  if (includesAny(title, ['分數'])) return {
    paragraphs: [
      '分數表示「一個整體被平均分成幾份，其中取了幾份」。分母告訴我們整體被分成幾等份，分子表示取了幾份。',
      '分數相加減時，如果分母不同，要先把每份的大小統一，也就是通分；乘法則是把兩個比例直接相乘。',
    ],
    bullets: ['同分母才能直接加減分子', '通分不改變分數大小', '答案最後記得約分'],
  }
  if (includesAny(title, ['小數'])) return {
    paragraphs: [
      '小數每一位都有固定的位值：小數點右邊依序是十分位、百分位、千分位。計算時真正重要的是位值對齊，不是字串長度。',
      '例如 0.8 和 0.80 的大小相同，因為多出的 0 不改變位值。',
    ],
    bullets: ['加減：小數點對齊', '乘法：先算整數，再處理小數位數', '除法：必要時同時移動被除數與除數的小數點'],
  }
  if (includesAny(title, ['百分', '比例', '比率'])) return {
    paragraphs: [
      '百分率就是「以 100 為基準的比率」。25% = 25/100 = 0.25。看到百分率題，第一步先確認誰是「基準量」。',
      '比例題的核心是兩組量保持相同的倍數關係。不要只背交叉相乘，先弄懂兩個比值為什麼相等。',
    ],
    bullets: ['百分率 = 比較量 ÷ 基準量', '部分量 = 基準量 × 百分率', '比例式兩邊代表同一種比值關係'],
  }
  if (includesAny(title, ['方程', '代數式'])) return {
    paragraphs: [
      '代數用字母代表未知數或會改變的數。方程式像天平：等號左右必須保持相等，所以你對左邊做的運算，也要對右邊做相同的運算。',
      '解方程式的目標不是「把符號搬家」，而是一步一步讓未知數單獨留下。',
    ],
    bullets: ['先化簡同類項', '等號兩邊做相同運算', '求出未知數後代回檢查'],
  }
  if (includesAny(title, ['指數', '科學記號'])) return {
    paragraphs: [
      '指數是重複乘法的簡寫。a³ 表示 a×a×a。底數相同相乘時，因為重複乘法的個數合併，所以指數相加。',
      '科學記號把很大或很小的數寫成 a×10ⁿ，其中 1≤|a|<10，重點是掌握小數點移動方向與次數。',
    ],
    bullets: ['aᵐ×aⁿ = aᵐ⁺ⁿ', 'aᵐ÷aⁿ = aᵐ⁻ⁿ（a≠0）', '科學記號先把第一個非零數放到個位'],
  }
  if (includesAny(title, ['函數', '直線'])) return {
    paragraphs: [
      '函數描述「輸入改變時，輸出如何跟著改變」。同一個輸入，在同一個函數規則下只能得到一個輸出。',
      '像 y=2x+1，x 是輸入，先乘 2 再加 1 得到 y。圖形可以把這個輸入輸出關係畫出來。',
    ],
    bullets: ['先看自變數與應變數', '代入時注意括號', '表格、算式、圖形都是同一個關係的不同表示法'],
  }
  if (includesAny(title, ['機率'])) return {
    paragraphs: [
      '機率用來描述事件發生的可能性。當每一個基本結果同樣可能時，機率可以用「有利結果數 ÷ 全部可能結果數」計算。',
      '機率一定介於 0 和 1 之間；0 表示不可能，1 表示一定發生。',
    ],
    bullets: ['先列出全部可能結果', '再數符合條件的結果', '最後檢查機率是否介於 0 與 1'],
  }
  if (includesAny(title, ['統計', '資料'])) return {
    paragraphs: [
      '統計不是只算平均數，而是用數字整理一群資料的特徵。平均數容易受極端值影響，中位數則看排序後的中間位置。',
      '讀圖表時一定要先看標題、單位、刻度與資料來源，再比較數值。',
    ],
    bullets: ['平均數 = 總和 ÷ 筆數', '中位數要先排序', '圖表先確認單位和刻度'],
  }
  if (includesAny(title, ['數列'])) return {
    paragraphs: [
      '數列是依規律排列的數。等差數列相鄰兩項的差固定，等比數列相鄰兩項的倍數固定。',
      '先判斷規律，再決定要用加法關係還是乘法關係，會比直接背公式更穩。',
    ],
    bullets: ['等差：固定增加或減少', '等比：固定乘上一個倍數', '先找規律，再使用通項公式'],
  }
  if (includesAny(title, ['對數'])) return {
    paragraphs: [
      '對數是指數的反向問題。log₂8=3 的意思就是 2³=8。看見對數時，可以先把它翻回指數式。',
      '對數常用來處理跨越很大尺度的數值，也能把乘法關係轉成加法關係。',
    ],
    bullets: ['logₐb=c ⇔ aᶜ=b', '底數 a 必須大於 0 且不等於 1', '真數 b 必須大於 0'],
  }
  if (includesAny(title, ['微分', '導數'])) return {
    paragraphs: [
      '導數描述「瞬間變化有多快」。在圖形上，可以把它理解為曲線在某一點切線的斜率。',
      '例如位置隨時間改變，位置函數的導數就能描述瞬時速度。',
    ],
    bullets: ['導數是局部變化率', '幾何上對應切線斜率', '先求導函數，再代入指定位置'],
  }
  if (includesAny(title, ['圓', '三角', '角', '幾何'])) return {
    paragraphs: [
      '幾何不是背圖形名稱，而是用定義、性質與已知條件推導未知量。每一步都要能說明用了哪一個性質。',
      '畫輔助圖、標出已知長度與角度，常常比直接套公式更容易看出關係。',
    ],
    bullets: ['先把已知條件標在圖上', '選擇對應的性質或公式', '最後檢查長度、角度或面積是否合理'],
  }
  return {
    paragraphs: [`本單元核心：${focus}`, '先把題目中的已知量、未知量與它們的關係分開，再選擇適合的表示方式。數學答案不只要算對，也要能說明為什麼這樣列式。'],
    bullets: ['找出已知與未知', '把文字轉成數學關係', '計算後檢查結果是否合理'],
  }
}

function englishNotes(title: string, focus: string, grade: number): { paragraphs: string[]; bullets: string[] } {
  if (includesAny(title.toLowerCase(), ['be', '自我介紹', '招呼'])) return {
    paragraphs: ['be 動詞用來連接主詞和身分、狀態或特徵。現在式最常見的是 am、is、are。', 'I 用 am；he、she、it 或單數名詞用 is；you、we、they 和複數名詞用 are。'],
    bullets: ['I am ...', 'He / She / It is ...', 'You / We / They are ...'],
  }
  if (includesAny(title, ['現在式', '日常', '作息'])) return {
    paragraphs: ['一般現在式常用來描述習慣、固定行程或普遍事實。', '主詞是 he、she、it 或單數第三人稱時，肯定句的主要動詞通常要加 -s 或 -es。'],
    bullets: ['I play. / He plays.', 'Do you ...? / Does he ...?', '否定：do not / does not + 原形動詞'],
  }
  if (includesAny(title, ['過去'])) return {
    paragraphs: ['過去式描述已經在過去完成的事件。規則動詞多半加 -ed，不規則動詞則需要個別熟悉。', '時間詞如 yesterday、last week、ago 可以幫助判斷句子的時間。'],
    bullets: ['play → played', 'go → went', 'did 後面的主要動詞回到原形'],
  }
  if (includesAny(title, ['比較'])) return {
    paragraphs: ['比較級用來比較兩個人或事物。短形容詞常加 -er，較長形容詞常用 more。', '比較句常搭配 than：A is taller than B.'],
    bullets: ['fast → faster', 'beautiful → more beautiful', 'good → better'],
  }
  if (includesAny(title, ['被動'])) return {
    paragraphs: ['被動語態把焦點放在「承受動作的人或事物」。基本結構是 be + 過去分詞。', '時態仍然由 be 動詞表現，例如 is made、was built、has been used。'],
    bullets: ['主動：People make cars.', '被動：Cars are made.', '需要說明動作者時可使用 by'],
  }
  if (includesAny(title, ['完成'])) return {
    paragraphs: ['現在完成式常連結「過去發生的事情」和「現在的結果或經驗」。基本結構是 have / has + 過去分詞。', 'already、yet、ever、never、since、for 都常和現在完成式一起出現。'],
    bullets: ['I have finished.', 'She has lived here for two years.', 'Have you ever ...?'],
  }
  if (includesAny(title, ['字母', '拼讀', '高頻字'])) return {
    paragraphs: ['拼讀不是只背字母名稱，而是把字母或字母組合和聲音連起來。', '看到新字時，可以先找熟悉的字母音或常見組合，再把聲音拼合。'],
    bullets: ['先聽音', '再找對應字母或字母組合', '最後放回完整單字和句子中'],
  }
  if (includesAny(title, ['閱讀', '短文', '文本'])) return {
    paragraphs: ['英文閱讀不用每個單字都翻成中文。先看標題、第一句和重複出現的關鍵詞，抓住文章主題。', '遇到生字時先看前後文，判斷它可能是人物、動作、特徵還是時間地點資訊。'],
    bullets: ['先抓主旨', '再找細節', '最後用上下文推測不熟的字'],
  }
  return {
    paragraphs: [`本單元核心：${focus}`, grade <= 3 ? '先用聲音、圖片與完整短句理解意思，不急著分析複雜文法。' : '先理解句子想表達什麼，再觀察字彙、句型和文法如何共同完成這個意思。'],
    bullets: ['先理解情境', '用完整句子學字彙與句型', '換一個情境自己再用一次'],
  }
}

function chineseNotes(title: string, focus: string): { paragraphs: string[]; bullets: string[] } {
  if (includesAny(title, ['注音', '字音', '字形', '識字', '部件'])) return {
    paragraphs: ['識字時把「字音、字形、字義」一起學，比只抄寫更有效。部件和部首可以幫助我們辨認字形，也能提供意思或讀音線索。', '遇到不熟的字詞，可以利用上下文、部件、工具書三種線索互相驗證。'],
    bullets: ['看字形：有哪些部件', '讀字音：聲母、韻母與聲調', '看語境：這個字在句子裡是什麼意思'],
  }
  if (includesAny(title, ['主旨', '段落', '篇章', '閱讀'])) return {
    paragraphs: ['段落主旨是這一段最主要想說的事情，不一定等於第一句。要把重要事件、重複概念和作者的重點合起來判斷。', '細節用來支持主旨；如果刪掉某個句子整段核心仍然不變，它通常比較接近細節。'],
    bullets: ['先找重複概念', '再分主要訊息與支持細節', '最後用自己的話濃縮成一句'],
  }
  if (includesAny(title, ['敘事', '記敘', '人物', '情節'])) return {
    paragraphs: ['敘事文本通常包含人物、時間、地點、事件與結果。真正理解故事不能只記發生了什麼，還要看人物為什麼做出選擇。', '人物的語言、動作、想法和他人的反應，都可以成為判斷人物特質的證據。'],
    bullets: ['事件發生前發生了什麼', '人物做了什麼選擇', '結果造成什麼改變'],
  }
  if (includesAny(title, ['說明'])) return {
    paragraphs: ['說明文的目的在把一件事講清楚。常見方式包括分類、舉例、比較、因果、步驟與數據。', '閱讀時先確認作者在說明什麼，再找每一段用了什麼方法提供資訊。'],
    bullets: ['主題是什麼', '每段提供哪一類資訊', '資訊彼此是分類、順序還是因果關係'],
  }
  if (includesAny(title, ['修辭', '譬喻', '擬人', '排比'])) return {
    paragraphs: ['修辭不是只背名稱，而是看作者怎麼讓語句更有畫面、節奏或情感。', '判斷修辭時要先找「和平常說法不一樣的地方」，再說明這種寫法產生什麼效果。'],
    bullets: ['譬喻：用相似事物幫助理解', '擬人：把人的特質給非人事物', '排比：相近結構連續出現，加強節奏與語氣'],
  }
  if (includesAny(title, ['文言', '古文', '古典'])) return {
    paragraphs: ['讀文言文不要逐字硬翻。先判斷人物、動作和前後句關係，再處理古今字義不同的地方。', '常見虛詞雖然字數少，卻會影響語氣與句子關係；閱讀時要放回整句判斷。'],
    bullets: ['先分句', '找主詞與主要動作', '用註釋和上下文確認古今義'],
  }
  if (includesAny(title, ['論說', '論證', '思辨'])) return {
    paragraphs: ['論說文要分清楚「主張」和「支持主張的理由、證據」。有理由不代表論證一定成立，還要看理由是否真的支持主張。', '好的證據應該和主題相關、可以查證，而且不能只挑對自己有利的部分。'],
    bullets: ['主張：作者希望你接受什麼觀點', '理由：為什麼作者這樣主張', '證據：用什麼資料或例子支持理由'],
  }
  return {
    paragraphs: [`本單元核心：${focus}`, '讀國文時，每一個理解都要盡量回到文本找依據；寫作時則要把目的、讀者、內容和組織方式一起考慮。'],
    bullets: ['找關鍵字詞', '看句子與段落關係', '用自己的話整理理解'],
  }
}

function scienceNotes(title: string, focus: string): { paragraphs: string[]; bullets: string[] } {
  if (includesAny(title, ['物質', '水', '狀態', '熱', '溫度'])) return {
    paragraphs: ['物質會因溫度與環境條件改變狀態。熔化、凝固、蒸發、凝結描述的是粒子排列或運動狀態改變，不代表物質憑空消失。', '判斷熱現象時要分清楚「溫度」和「熱的傳遞」：熱會由高溫處往低溫處傳遞，直到接近平衡。'],
    bullets: ['固態、液態、氣態可互相轉換', '蒸發可在液體表面持續發生', '凝結是氣態變液態'],
  }
  if (includesAny(title, ['電', '電路'])) return {
    paragraphs: ['電流需要一條完整、可導電的閉合路徑。只把燈泡接在電池旁邊並不會亮，必須讓電流能從一端流出再回到另一端。', '串聯和並聯會改變元件之間的連接方式，因此電流、電壓與各元件的影響也不同。'],
    bullets: ['閉合電路才有持續電流', '導體讓電流較容易通過', '畫電路圖時先確認每個接點真的連在一起'],
  }
  if (includesAny(title, ['生態', '生物', '食物'])) return {
    paragraphs: ['生態系包含生物與非生物環境。生物之間透過食物、競爭、合作等關係互相影響。', '食物鏈的箭頭表示能量與物質傳遞方向。某一個族群改變，影響可能沿著食物網傳到其他生物。'],
    bullets: ['生產者製造有機物', '消費者取得其他生物的能量', '分解者把遺體與有機物分解回環境'],
  }
  if (includesAny(title, ['力', '運動'])) return {
    paragraphs: ['力可以改變物體的運動狀態或形狀。物體有沒有移動，和「有沒有受力」不是完全相同的問題；要看所有力合成後的結果。', '描述運動時要先選定參考位置，再比較位置隨時間怎麼改變。'],
    bullets: ['力有大小和方向', '平衡力可能讓物體保持靜止或等速', '速度同時包含快慢與方向資訊'],
  }
  if (includesAny(title, ['光', '聲'])) return {
    paragraphs: ['聲音來自振動，必須透過介質傳遞；光則能在真空中傳播。', '光遇到不同介面可能反射、折射或被吸收，觀察方向改變時要先看介面和入射方向。'],
    bullets: ['聲音需要介質', '反射角等於入射角', '不同介質中的光速改變會造成折射'],
  }
  return {
    paragraphs: [`本單元核心：${focus}`, '自然科學的解釋要把「觀察」、「資料」與「推論」分開。先確定看到了什麼，再說明你用哪些證據支持解釋。'],
    bullets: ['先提出可觀察問題', '記錄資料與變因', '用證據支持或修正原本的解釋'],
  }
}

function socialNotes(title: string, focus: string): { paragraphs: string[]; bullets: string[] } {
  if (includesAny(title, ['地圖', '位置', '空間', '地理'])) return {
    paragraphs: ['地圖把真實空間縮小成可以閱讀的符號系統。方向、比例尺、圖例與座標是基本工具。', '地理學不只是知道「在哪裡」，還要問為什麼某種人口、產業或環境現象會出現在那裡。'],
    bullets: ['先看方向與比例尺', '利用圖例辨識地圖資訊', '比較自然環境與人類活動的空間關係'],
  }
  if (includesAny(title, ['歷史', '時代', '事件'])) return {
    paragraphs: ['歷史學習要把事件放回當時的背景，而不是只記年份。原因通常不只一個，也要區分直接原因、長期條件與事件後果。', '史料是理解過去的證據。不同來源可能有不同立場，因此要比較來源、作者、時間與目的。'],
    bullets: ['時間順序', '背景與原因', '事件結果與後續影響'],
  }
  if (includesAny(title, ['公民', '權利', '政府', '法律'])) return {
    paragraphs: ['公民議題常同時涉及權利、責任、制度與不同價值。先確認法律或制度怎麼規定，再討論不同選擇可能造成的影響。', '公共討論需要把「可以查證的事實」和「個人意見、價值判斷」分開。'],
    bullets: ['先確認制度與權利義務', '比較不同利害關係人的立場', '用可查證資料支持判斷'],
  }
  if (includesAny(title, ['經濟', '市場', '消費'])) return {
    paragraphs: ['經濟學關心有限資源如何被選擇和分配。需求、供給、價格與機會成本是常見核心概念。', '做選擇時，成本不只包含付出去的錢，也包含因為選了 A 而放棄 B 的價值。'],
    bullets: ['需求：消費者願意且能購買的量', '供給：生產者願意提供的量', '機會成本：被放棄選項中價值最高者'],
  }
  return {
    paragraphs: [`本單元核心：${focus}`, '社會科要從時間、空間、制度與人的行動之間找關係。看到資料時先確認來源，再判斷它能支持到什麼程度的結論。'],
    bullets: ['看資料來源', '找出事件或現象之間的關係', '用證據說明自己的判斷'],
  }
}

function subjectNotes(subject: CurriculumSubjectId, title: string, focus: string, grade: number) {
  if (subject === 'math') return mathNotes(title, focus)
  if (subject === 'english') return englishNotes(title, focus, grade)
  if (subject === 'chinese') return chineseNotes(title, focus)
  if (subject === 'science') return scienceNotes(title, focus)
  return socialNotes(title, focus)
}

function workedExample(subject: CurriculumSubjectId, title: string, grade: number): TeachingExample {
  if (subject === 'math') {
    if (includesAny(title, ['正負', '有向數', '數線', '絕對值'])) return { prompt: '早上氣溫是 −3°C，中午升高 5°C。中午是多少度？', steps: ['「升高 5」代表從 −3 往數線右邊移動 5 格。', '−3 + 5 = 2。', '結果 2 比 −3 大，方向也符合「升高」。'], answer: '2°C' }
    if (includesAny(title, ['分數'])) return { prompt: '計算 3/4 + 1/8。', steps: ['共同分母取 8。', '3/4 = 6/8。', '6/8 + 1/8 = 7/8。'], answer: '7/8' }
    if (includesAny(title, ['小數'])) return { prompt: '計算 2.35 + 0.8。', steps: ['把小數點對齊。', '0.8 寫成 0.80。', '2.35 + 0.80 = 3.15。'], answer: '3.15' }
    if (includesAny(title, ['百分', '比例', '比率'])) return { prompt: '一件 250 元商品打 8 折，售價是多少？', steps: ['8 折 = 原價的 80%。', '250×0.8=200。', '售價應低於原價，結果合理。'], answer: '200 元' }
    if (includesAny(title, ['方程', '代數式'])) return { prompt: '解 3x + 5 = 20。', steps: ['兩邊同減 5：3x=15。', '兩邊同除 3：x=5。', '代回：3×5+5=20。'], answer: 'x = 5' }
    if (includesAny(title, ['指數', '科學記號'])) return { prompt: '計算 2³ × 2⁴。', steps: ['底數相同相乘，指數相加。', '2³×2⁴=2⁷。', '2⁷=128。'], answer: '128' }
    if (includesAny(title, ['函數', '直線'])) return { prompt: '若 y=2x+1，x=3 時 y 是多少？', steps: ['代入 x=3。', 'y=2×3+1。', '所以 y=7。'], answer: '7' }
    if (includesAny(title, ['機率'])) return { prompt: '袋中 3 顆紅球、2 顆藍球，隨機取 1 顆，紅球機率？', steps: ['全部 5 顆。', '有利結果 3 顆紅球。', '3÷5=3/5。'], answer: '3/5' }
    if (includesAny(title, ['統計', '資料'])) return { prompt: '資料 2、4、6 的平均數？', steps: ['總和 2+4+6=12。', '共有 3 筆。', '12÷3=4。'], answer: '4' }
    if (includesAny(title, ['數列'])) return { prompt: '等差數列 3、7、11、15……下一項？', steps: ['相鄰兩項都加 4。', '公差 d=4。', '15+4=19。'], answer: '19' }
    if (includesAny(title, ['對數'])) return { prompt: 'log₁₀(100) 是多少？', steps: ['改問：10 的幾次方是 100？', '10²=100。', '所以對數值為 2。'], answer: '2' }
    if (includesAny(title, ['微分', '導數'])) return { prompt: 'f(x)=x²，求 f′(3)。', steps: ['f′(x)=2x。', '代入 x=3。', 'f′(3)=6。'], answer: '6' }
    if (includesAny(title, ['圓'])) return { prompt: '半徑 4 公分的圓，圓周長？', steps: ['C=2πr。', '代入 r=4。', 'C=8π。'], answer: '8π 公分' }
    if (includesAny(title, ['三角', '角', '幾何'])) return { prompt: '三角形兩角為 50°、60°，第三角？', steps: ['三角形內角和 180°。', '180−50−60。', '得到 70°。'], answer: '70°' }
    return grade <= 3
      ? { prompt: '小明有 8 顆球，又得到 5 顆，現在有幾顆？', steps: ['「又得到」代表增加。', '8+5=13。', '加上單位。'], answer: '13 顆' }
      : { prompt: '面對文字題時，第一步應先做什麼？', steps: ['找出已知量。', '找出未知量。', '判斷量與量之間的關係後再列式。'], answer: '先整理已知、未知與關係，再列式。' }
  }

  if (subject === 'english') {
    if (includesAny(title.toLowerCase(), ['be', '自我介紹', '招呼'])) return { prompt: 'I ___ a student. She ___ my friend.', steps: ['I 搭配 am。', 'She 搭配 is。', '放回完整句子檢查。'], answer: 'am；is' }
    if (includesAny(title, ['現在式', '日常', '作息'])) return { prompt: 'He play basketball. / He plays basketball. 哪句正確？', steps: ['描述習慣用一般現在式。', 'He 是第三人稱單數。', '主要動詞 play 加 -s。'], answer: 'He plays basketball.' }
    if (includesAny(title, ['過去'])) return { prompt: '把 I visit my grandma every Sunday. 改成昨天發生。', steps: ['昨天是過去時間。', 'visit → visited。', '時間詞改成 yesterday。'], answer: 'I visited my grandma yesterday.' }
    if (includesAny(title, ['比較'])) return { prompt: 'A train is ___ than a bicycle. (fast)', steps: ['兩者比較用比較級。', 'fast → faster。', '比較級後常接 than。'], answer: 'faster' }
    if (includesAny(title, ['被動'])) return { prompt: 'People use English around the world. 改成被動。', steps: ['把 English 放到主詞位置。', '一般現在式被動：be + p.p.。', 'English is used ...。'], answer: 'English is used around the world.' }
    if (includesAny(title, ['完成'])) return { prompt: 'I ___ already ___ my homework. (finish)', steps: ['already 常搭配現在完成式。', 'I 使用 have。', 'finish → finished。'], answer: 'I have already finished my homework.' }
    return grade <= 3
      ? { prompt: '第一次遇到新同學，可以怎麼簡單打招呼並介紹自己？', steps: ['先說 Hello。', '再說 I’m ...。', '用完整句子說出名字。'], answer: 'Hello! I’m Amy.' }
      : { prompt: '如何把新單字真正學會，而不是只背中文？', steps: ['先看它在完整句子的意思。', '注意它和哪些字一起出現。', '自己換一個情境造句。'], answer: '在完整語境中理解並實際使用。' }
  }

  if (subject === 'chinese') {
    if (includesAny(title, ['主旨', '篇章', '段落', '閱讀'])) return { prompt: '「下雨後操場積水，午休後太陽出來，水漸漸不見了。」主旨是什麼？', steps: ['找最重要的對象：操場積水。', '整理變化：積水 → 太陽出來 → 消失。', '用一句話概括。'], answer: '雨後操場的積水在太陽照射後漸漸消失。' }
    if (includesAny(title, ['修辭', '譬喻', '擬人'])) return { prompt: '「風在窗外唱歌。」用了什麼修辭？', steps: ['唱歌是人的動作。', '句子把人的動作給了風。', '所以是擬人。'], answer: '擬人' }
    if (includesAny(title, ['文言', '古文'])) return { prompt: '讀文言句子遇到陌生字詞，應先怎麼做？', steps: ['先看前後文。', '找主詞與動作關係。', '再用註釋驗證。'], answer: '先依語境推測，再用註釋確認。' }
    if (includesAny(title, ['論說', '論證', '思辨'])) return { prompt: '主張「學校應增加閱讀時間」，哪種支持方式較有力？', steps: ['理由必須直接支持主張。', '個人喜好證明力較弱。', '閱讀成效資料或具體案例較能支持。'], answer: '使用與閱讀成效相關且可查證的資料或案例。' }
    return { prompt: '閱讀文章時，如何知道自己的理解不是只憑感覺？', steps: ['先提出自己的理解。', '回文章找可以支持的詞句。', '如果找不到，就要重新檢查推論。'], answer: '讓理解可以回到文本找到證據。' }
  }

  if (subject === 'science') {
    if (includesAny(title, ['物質', '水', '狀態', '熱'])) return { prompt: '冰水杯外出現水珠，是杯子漏水嗎？', steps: ['觀察：水珠在外表面。', '空氣水蒸氣遇冷凝結。', '水珠來源可以由凝結解釋。'], answer: '主要是空氣中的水蒸氣凝結，不是杯內水穿過杯壁。' }
    if (includesAny(title, ['電', '電路'])) return { prompt: '燈泡要亮，電池、導線與燈泡至少要形成什麼？', steps: ['電流需要完整路徑。', '路徑中斷是開路。', '閉合後電流才能通過。'], answer: '閉合電路。' }
    if (includesAny(title, ['生態', '生物'])) return { prompt: '昆蟲大量減少，可能怎麼影響食蟲鳥？', steps: ['鳥把昆蟲當食物。', '昆蟲減少造成食物不足。', '影響可能繼續傳到食物網其他成員。'], answer: '食蟲鳥可能因食物減少而族群下降或改變活動範圍。' }
    return { prompt: '要說明一個自然現象，最重要的依據是什麼？', steps: ['先觀察或測量。', '提出可檢驗解釋。', '用更多資料或實驗驗證。'], answer: '可觀察、可測量、可重複檢驗的證據。' }
  }

  if (includesAny(title, ['地圖', '位置', '空間', '地理'])) return { prompt: '看地圖為什麼不能只看地名？', steps: ['先確認方向、比例尺、圖例。', '比較位置與距離。', '再連到人口、交通或產業。'], answer: '地圖重點是呈現空間關係，不只是列地名。' }
  if (includesAny(title, ['歷史', '時代', '事件'])) return { prompt: '為什麼理解歷史不能只記年份？', steps: ['年份只提供時間。', '還要看背景與原因。', '最後比較事件造成的影響。'], answer: '要把時間、背景、原因與後果連成關係。' }
  if (includesAny(title, ['公民', '權利', '政府', '法律'])) return { prompt: '公共議題中，什麼判斷方式較可靠？', steps: ['先分清事實與意見。', '查制度規則或可靠資料。', '比較不同立場與影響。'], answer: '以可查證資料為基礎，再比較不同立場。' }
  if (includesAny(title, ['經濟', '市場', '消費'])) return { prompt: '商品熱門但數量有限時，價格為什麼可能上升？', steps: ['需求增加。', '短期供給沒有同步增加。', '競爭提高，價格出現上升壓力。'], answer: '需求增加而供給有限時，價格通常有上升壓力。' }
  return { prompt: '閱讀社會資料圖表的第一步是什麼？', steps: ['看標題。', '確認時間、單位與來源。', '再比較數值並解釋。'], answer: '先確認主題、時間、單位與資料來源。' }
}

function practiceExample(subject: CurriculumSubjectId, title: string, grade: number): TeachingExample {
  if (subject === 'math') {
    if (includesAny(title, ['正負', '有向數', '數線', '絕對值'])) return { prompt: '自己算：−4 + 7 = ?', steps: ['從 −4 往右走 7 格。', '依序經過 −3、−2、−1、0、1、2、3。', '所以結果是 3。'], answer: '3' }
    if (includesAny(title, ['分數'])) return { prompt: '自己算：5/6 − 1/3 = ?', steps: ['1/3 = 2/6。', '5/6−2/6=3/6。', '3/6 約分成 1/2。'], answer: '1/2' }
    if (includesAny(title, ['小數'])) return { prompt: '自己算：4.20 − 1.75 = ?', steps: ['小數點對齊。', '4.20−1.75=2.45。', '位值保持一致。'], answer: '2.45' }
    if (includesAny(title, ['百分', '比例', '比率'])) return { prompt: '600 元的 15% 是多少？', steps: ['15%=0.15。', '600×0.15=90。', '90 小於 600，大小合理。'], answer: '90 元' }
    if (includesAny(title, ['方程', '代數式'])) return { prompt: '自己解：2x − 3 = 11。', steps: ['兩邊同加 3：2x=14。', '兩邊同除 2。', 'x=7。'], answer: 'x = 7' }
    if (includesAny(title, ['指數', '科學記號'])) return { prompt: '自己算：3² × 3³。', steps: ['底數相同，指數相加。', '3⁵=243。', '不要把底數也相乘成 9。'], answer: '243' }
    if (includesAny(title, ['函數', '直線'])) return { prompt: 'y=3x−2，x=4 時 y=?', steps: ['代入 x=4。', '3×4−2=12−2。', '得到 10。'], answer: '10' }
    if (includesAny(title, ['機率'])) return { prompt: '袋中 4 紅、6 藍，共 10 顆，取到紅球機率？', steps: ['有利結果 4。', '全部結果 10。', '4/10=2/5。'], answer: '2/5' }
    if (includesAny(title, ['統計', '資料'])) return { prompt: '資料 2、4、7、9、10 的中位數？', steps: ['資料已排序。', '共有 5 筆。', '中間第 3 筆是 7。'], answer: '7' }
    if (includesAny(title, ['三角', '角', '幾何'])) return { prompt: '三角形兩角 40°、65°，第三角？', steps: ['內角和 180°。', '180−40−65=75。', '三角形三角相加檢查為 180°。'], answer: '75°' }
    return grade <= 3 ? { prompt: '自己算：12−5=?', steps: ['從 12 拿走 5。', '12−5=7。', '答案單位依題意。'], answer: '7' } : { prompt: '練習：先寫出這個單元一題題目的「已知、未知、關係」。', steps: ['標已知。', '標未知。', '寫出能連結兩者的數學關係。'], answer: '能清楚寫出三部分，就完成第一步。' }
  }

  if (subject === 'english') {
    if (includesAny(title.toLowerCase(), ['be', '自我介紹', '招呼'])) return { prompt: '填空：They ___ my classmates.', steps: ['They 是複數主詞。', '現在式 be 動詞用 are。', '完整句：They are my classmates.'], answer: 'are' }
    if (includesAny(title, ['現在式', '日常', '作息'])) return { prompt: '填空：My brother ___ to school every day. (walk)', steps: ['every day 表示習慣。', 'My brother 是第三人稱單數。', 'walk → walks。'], answer: 'walks' }
    if (includesAny(title, ['過去'])) return { prompt: '填空：They ___ soccer yesterday. (play)', steps: ['yesterday 表示過去。', 'play 是規則動詞。', 'play → played。'], answer: 'played' }
    if (includesAny(title, ['比較'])) return { prompt: '填空：This building is ___ than that one. (tall)', steps: ['比較兩個建築物。', 'tall 是短形容詞。', 'tall → taller。'], answer: 'taller' }
    return { prompt: '請用本單元的一個核心字或句型造一個完整句子。', steps: ['先決定人物或主詞。', '放入本單元字彙或句型。', '再加上時間、地點或情境讓意思完整。'], answer: '答案可不同，但必須是完整且語意合理的句子。' }
  }

  if (subject === 'chinese') {
    if (includesAny(title, ['修辭', '譬喻', '擬人'])) return { prompt: '「月亮悄悄躲進雲裡。」較接近哪一種修辭？', steps: ['「躲」是有意識的人或動物常做的動作。', '月亮被賦予人的行為。', '因此是擬人。'], answer: '擬人' }
    if (includesAny(title, ['主旨', '段落', '篇章', '閱讀'])) return { prompt: '閱讀：「小華每天走路上學。下雨時，他會提早十分鐘出門並帶雨傘。」請用一句話概括重點。', steps: ['人物：小華。', '主要行為：走路上學。', '特殊情況：下雨時提早並帶傘。'], answer: '小華平常走路上學，下雨時會提早出門並準備雨傘。' }
    return { prompt: '從今天的文章或概念中，找一句可以支持你理解的關鍵句。', steps: ['先說自己的理解。', '再找文本證據。', '用「因為文中寫……所以我認為……」回答。'], answer: '答案依文本而異，但必須同時有理解與文本證據。' }
  }

  if (subject === 'science') return { prompt: '練習：把「觀察」和「推論」分開。看到葉子表面有水滴，哪一句是觀察？', steps: ['觀察只能描述直接看到或量到的現象。', '「葉子表面有水滴」是直接看到的。', '「一定是植物排出的水」則屬於推論。'], answer: '觀察：葉子表面有水滴。' }

  return { prompt: '練習：看到一張統計圖後，先寫出兩個「可以直接從圖上讀到的事實」，再寫一個解釋。', steps: ['事實只描述圖上的資料。', '解釋要另外提出可能原因。', '不要把推測寫成圖表本身已證明的事實。'], answer: '答案依圖表而異；重點是把資料事實和原因推論分開。' }
}

export function buildTeachingBlocks(subject: CurriculumSubjectId, grade: number, unit: CurriculumUnitBundle, lesson: CurriculumLessonPlan): TeachingBlock[] {
  const notes = subjectNotes(subject, unit.title, unit.focus, grade)
  const example = workedExample(subject, unit.title, grade)
  const practice = practiceExample(subject, unit.title, grade)
  const lessonLead = lesson.kind === 'launch'
    ? '先從生活或具體情境切入，知道這個單元到底要解決什麼。'
    : lesson.kind === 'concept'
      ? '這一課先把核心概念講清楚，再確認每個規則背後的意思。'
      : lesson.kind === 'example'
        ? '這一課重點是看完整示範，理解每一步使用了哪個觀念。'
        : lesson.kind === 'guided'
          ? '先跟著提示做一次，卡住時回到觀念而不是直接猜答案。'
          : lesson.kind === 'practice'
            ? '先自己想，再對照解析；目標是能把方法用在不同情境。'
            : '先整理核心觀念，再用新的題目確認真的理解。'

  return [
    {
      id: `${lesson.id}-teach`,
      eyebrow: 'TEACH',
      title: '觀念講解',
      paragraphs: [lessonLead, ...notes.paragraphs],
      bullets: notes.bullets,
    },
    {
      id: `${lesson.id}-example`,
      eyebrow: 'WORKED EXAMPLE',
      title: '老師完整示範',
      paragraphs: ['先看題目，再順著步驟理解「為什麼這樣做」。如果只記最後答案，換題目後還是容易卡住。'],
      example,
    },
    {
      id: `${lesson.id}-practice`,
      eyebrow: 'YOUR TURN',
      title: '換你練習｜附解析',
      paragraphs: ['先遮住解析自己做一次，再逐步比對。如果答案不同，先找出是觀念、判斷、列式／語法，還是計算／表達哪一步開始不同。'],
      example: practice,
    },
    {
      id: `${lesson.id}-recap`,
      eyebrow: 'RECAP',
      title: '本課重點整理',
      paragraphs: [lesson.objective],
      bullets: lesson.successCriteria,
    },
  ]
}
