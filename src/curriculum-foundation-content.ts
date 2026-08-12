import { getCurriculumTrack, type CurriculumSubjectId, type CurriculumUnitPlan } from './curriculum-plan-v5'
import type {
  ReviewedChoiceQuestion,
  ReviewedConcept,
  ReviewedQuestion,
  ReviewedResponseQuestion,
  ReviewedWorkedExample,
  ReviewedUnitContent,
} from './curriculum-reviewed-social10'

export type FoundationUnitContent = Omit<ReviewedUnitContent, 'reviewStatus'> & {
  reviewStatus: 'foundation'
}

type UnitContext = {
  grade: number
  subject: CurriculumSubjectId
  semester: 1 | 2
  unitIndex: number
  unit: CurriculumUnitPlan
}

type ConceptRule = {
  match: RegExp
  title?: string
  explanation: (grade: number, phrase: string) => string
  example?: (grade: number, phrase: string) => string
}

const SUBJECT_NAME: Record<CurriculumSubjectId, string> = {
  chinese: '國文',
  english: '英文',
  math: '數學',
  science: '自然',
  social: '社會',
}

function gradeStage(grade: number) {
  if (grade <= 2) return '低年級'
  if (grade <= 6) return '國小'
  if (grade <= 9) return '國中'
  return '高中'
}

function compact(value: string) {
  return value.replace(/^建立|^理解|^認識|^練習|^掌握|^分析|^統整|^使用|^運用|^從|^以|^處理|^閱讀|^辨識|^熟悉|^加強|^探討/, '').trim()
}

function splitFocus(unit: CurriculumUnitPlan) {
  const candidates = `${unit.title}。${unit.focus}`
    .split(/[。；，、]|以及|並且|並|與|和/)
    .map((item) => compact(item.trim()))
    .filter((item) => item.length >= 2)

  const seen = new Set<string>()
  const unique: string[] = []
  for (const item of candidates) {
    const key = item.replace(/[「」『』（）()：:]/g, '')
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(item)
  }
  return unique.slice(0, 8)
}

const CHINESE_RULES: ConceptRule[] = [
  {
    match: /注音|聲韻|聲調|拼讀/,
    title: '把聲音拆成可以辨認的符號',
    explanation: () => '注音不是把整個字硬背起來，而是把聲母、韻母和聲調分開，再重新合成一個音。學習時先聽音、辨符號，再做拼讀，最後回到真正的詞語。',
    example: () => '例如「媽、麻、馬、罵」聲母和韻母相近，但聲調不同，意思也不同；讀字時要把聲調一起當成字音的一部分。',
  },
  {
    match: /識字|字形|部件|字音字形|生字|常用字/,
    title: '用部件、字音與語境一起認字',
    explanation: () => '認字不能只看外形。可以先找部件，再確認讀音，最後把字放進句子判斷意思。形近字尤其要比較「哪個部件不同、放進句子後哪一個意思才合理」。',
    example: () => '「晴」和「睛」都有「青」，但「日」和天氣有關，「目」和眼睛有關；句子「今天是晴天」就能幫忙排除錯字。',
  },
  {
    match: /詞語|成語|語境|詞義|同義|反義/,
    title: '詞義要放回語境判斷',
    explanation: () => '同一個詞在不同句子裡可能有不同意思或語氣。讀到不熟的詞，先看前後文在說誰、做什麼、結果如何，再用可替換的近義詞測試意思是否通順。',
    example: () => '「他把門『關』上」的「關」是關閉；「這件事和我有『關』」的「關」則是關係。上下文決定了真正的意思。',
  },
  {
    match: /完整句|句型|句法|標點|語法|語氣/,
    title: '句子要有清楚的關係',
    explanation: () => '一個好句子要讓讀者知道「誰／什麼」和「發生什麼事」，並用標點、連接詞或語序表示先後、因果、轉折、條件等關係。句子越長，越要先抓主要骨架。',
    example: () => '「因為下雨，所以比賽延期。」不是兩件無關的事，而是用「因為／所以」標出原因和結果。',
  },
  {
    match: /故事|情節|人物|敘事|記敘|描寫|事件|順序/,
    title: '敘事先抓人物、目標、變化與結果',
    explanation: () => '讀故事時不要只記每一句。先找人物想做什麼、遇到什麼阻礙、做了什麼選擇、最後發生什麼改變。描寫則是在關鍵位置補上動作、語言、感官或心理細節。',
    example: () => '「小安遲到了」只是事件；若補上「他一路看著手錶跑進校門，鞋帶還鬆著」，讀者就能感受到他的焦急。',
  },
  {
    match: /段落|主旨|中心句|篇章|文章架構|組織/,
    title: '從段落功能找文章主旨',
    explanation: () => '主旨不是把第一句抄下來。先看每段在做什麼：提出問題、舉例、解釋、轉折或總結，再找這些段落共同服務的中心意思。',
    example: () => '如果三段分別寫「塑膠來源多、分解慢、會進入海洋」，主旨可能是「塑膠垃圾為何造成長期環境問題」，而不是只寫「海洋有垃圾」。',
  },
  {
    match: /說明文|資訊|說明方法|分類|步驟|因果/,
    title: '說明文要看資訊怎麼被組織',
    explanation: () => '說明文常用分類、比較、因果、時間順序、步驟或舉例來整理資訊。讀者先辨認組織方式，就比較容易知道哪一段是定義、哪一段是例子、哪一段是原因。',
    example: () => '介紹颱風形成時，可以按「海水溫度 → 水氣上升 → 低壓發展 → 旋轉增強」的過程順序說明。',
  },
  {
    match: /修辭|譬喻|擬人|排比|象徵/,
    title: '修辭要看它改變了什麼感受',
    explanation: () => '修辭不是只背名稱。判斷後還要問：它讓哪個畫面更具體？讓哪種情緒更強？把抽象概念連到什麼熟悉事物？這才是閱讀題真正要理解的地方。',
    example: () => '「風在窗外唱歌」把風擬人化，重點不是風真的會唱，而是把聲音寫得像有生命、比較有畫面。',
  },
  {
    match: /詩|詩歌|詩詞|意象|韻文/,
    title: '詩的意思藏在意象與語氣的組合',
    explanation: () => '讀詩時先圈出反覆出現或特別突出的景物、顏色、聲音、動作，再看它們共同營造什麼情緒。不要只逐字翻譯，還要看留白和語氣。',
    example: () => '若詩中反覆出現「遠燈、晚風、空車站」，即使沒有直接寫「孤單」，這些意象也可能共同形成等待或離別的感受。',
  },
  {
    match: /文言|古文|古典|經典/,
    title: '文言文先斷句，再判斷詞義與省略',
    explanation: (grade) => grade <= 6
      ? '讀短篇古文時先把句子切開，再找和現代漢語相近的字詞。遇到不懂的字，不要單獨猜，要看前後動作與人物關係。'
      : '文言文閱讀可分三步：先斷句與辨主語，再處理古今詞義與虛詞功能，最後把句子放回篇章判斷人物立場與作者意旨。',
    example: () => '自寫短句「童見鳥集於樹，止步觀之」可先拆成「童／見鳥集於樹／止步觀之」，再理解「之」指前面的景象。',
  },
  {
    match: /論說|論證|主張|論點|證據|思辨|議論/,
    title: '論證要把主張、理由與證據分開',
    explanation: () => '一段有說服力的論述至少要回答三件事：我主張什麼？為什麼？有什麼證據支持？理由和證據不是同一件事，例子也不能自動代表所有情況。',
    example: () => '主張「校園應增加飲水機」；理由是「方便補充水分」；若再有使用人次或問卷資料，才是可以檢查的證據。',
  },
  {
    match: /跨文本|多文本|圖表|資料型文本|媒體|公共議題|資訊閱讀/,
    title: '多來源閱讀要先比來源，再比說法',
    explanation: () => '面對文章、圖表、新聞或不同作者時，先確認來源與日期，再整理每份資料的主張、證據和限制。兩份資料不同，不代表一定有一份錯，也可能是研究範圍或時間不同。',
    example: () => '一張圖顯示「總用水量」，另一張顯示「每人平均用水量」，數字趨勢不同是合理的，因為衡量的變數不同。',
  },
  {
    match: /寫作|作文|日記|書信|寫話|表達|專題/,
    title: '寫作先決定目的，再安排材料',
    explanation: () => '寫之前先問「我要讓讀者知道、感受或相信什麼？」再挑選最能支持目的的材料。草稿完成後依序檢查內容是否完整、段落是否有順序、句子是否清楚、用詞與標點是否恰當。',
    example: () => '寫「一次難忘的合作」時，不必列出整天行程；挑出發生衝突、一起解決、最後改變想法的三個關鍵片段會更有重點。',
  },
]

const ENGLISH_RULES: ConceptRule[] = [
  {
    match: /字母|字母音|拼讀|phonics|高頻字/,
    title: '從聲音連到字母與拼字',
    explanation: (grade) => grade <= 2
      ? '先聽出單字開頭或結尾的聲音，再把聲音連到字母。低年級重點是「聽得出、指得出、說得出」，不急著分析文法。'
      : '拼讀時把字母或字母組合對應到常見語音，再把聲音合成單字；遇到不規則高頻字則另外建立整字辨識。',
    example: () => 'cat 可以先聽 /k/ /æ/ /t/ 三個聲音，再把 c-a-t 合起來讀；the 則屬於需要整體熟悉的高頻字。',
  },
  {
    match: /招呼|自我介紹|姓名|年齡|心情/,
    title: '先把句型綁在真實對話裡',
    explanation: () => '招呼和自我介紹不是背單句，而是知道什麼時候說、對方可能怎麼回。先理解對話功能，再注意句型。',
    example: () => 'A: Hi, I’m Mia. What’s your name?  B: I’m Leo. Nice to meet you. 這組對話同時完成招呼、介紹與回應。',
  },
  {
    match: /be 動詞|am|is|are|簡單句|基本句型/,
    title: 'be 動詞連接「人／事物」和它的狀態或身分',
    explanation: () => 'am、is、are 的選擇跟主詞有關：I am；he/she/it is；you/we/they are。先理解句子是在說「是誰、是什麼、處於什麼狀態」，再處理形式。',
    example: () => 'I am tired. / She is my sister. / They are ready. 三句都用 be 動詞把主詞和後面的資訊連起來。',
  },
  {
    match: /現在式|日常作息|第三人稱|習慣/,
    title: '現在簡單式描述習慣、事實與固定狀態',
    explanation: () => '現在簡單式常用來說固定會發生的事。第三人稱單數主詞 he/she/it 在肯定句中通常要調整動詞形式；問句和否定句則常使用 do/does。',
    example: () => 'I walk to school every day. / Mia walks to school every day. / Does Mia walk to school? 注意 does 出現後，主要動詞回到原形 walk。',
  },
  {
    match: /過去式|過去簡單|昨天|故事敘述/,
    title: '過去簡單式把事件放到已結束的時間',
    explanation: () => '先找 yesterday、last week、two days ago 等時間線索，再判斷事件是否已完成。規則動詞常加 -ed，不規則動詞則要熟悉常見形式；did 出現時主要動詞回原形。',
    example: () => 'We visited Tainan last weekend. / Did you visit the museum? 問句有 did，所以不是 visited。',
  },
  {
    match: /未來|will|be going to|計畫/,
    title: '未來表達要分臨時決定、預測與既定計畫',
    explanation: () => 'will 常用於即時決定或一般預測；be going to 常用於已有計畫或有明顯跡象的預測。真正閱讀時要看上下文，不只看單一公式。',
    example: () => 'The phone is ringing. I’ll get it. 是當下決定；We’re going to visit Grandma this Sunday. 是已安排的計畫。',
  },
  {
    match: /現在進行|進行式|正在/,
    title: '現在進行式描述「此刻正在發生」或暫時狀態',
    explanation: () => '形式是 be + V-ing，但重點是時間觀念。先判斷事情是不是正在此刻進行，再處理拼字變化。',
    example: () => 'Look! The dog is running across the yard. 「Look!」提供了此刻正在發生的線索。',
  },
  {
    match: /問句|wh|yes\/no|疑問/,
    title: '問句先決定你缺的是哪一種資訊',
    explanation: () => 'who 問人、where 問地點、when 問時間、why 問原因、how 問方式。真正組句前先弄清楚想得到什麼資訊，再選疑問詞與助動詞。',
    example: () => 'A: Where do you practice basketball? B: At the school gym. 回答的是地點，所以 where 才是正確疑問詞。',
  },
  {
    match: /祈使|指令|教室英語|命令句/,
    title: '祈使句直接從動詞開始，重點在功能與語氣',
    explanation: () => '祈使句常用來給指令、提醒、邀請或建議。肯定句可直接用原形動詞開頭；否定常用 Don’t。語氣是否禮貌還要看 please、情境與說話關係。',
    example: () => 'Please open your book to page ten. / Don’t run in the hallway. 兩句都在要求對方做或不要做某件事。',
  },
  {
    match: /情態|can|could|should|must|規則|建議/,
    title: '情態動詞改變句子的能力、義務或可能性',
    explanation: () => 'can 常表示能力或允許；should 常表示建議；must 常表示強烈義務。情態動詞後接原形動詞，解題時先判斷語意功能。',
    example: () => 'You should drink some water. 是建議；You must wear a helmet here. 是規定或強烈義務。',
  },
  {
    match: /比較級|最高級|比較|more|than/,
    title: '比較句先確定比較對象與比較標準',
    explanation: () => '比較級用來比較兩者，最高級通常是在三者以上找最突出者。不要只背 -er/-est，還要注意比較的是高度、速度、價格或其他哪個特徵。',
    example: () => 'A bus is heavier than a bicycle. 比較的是 weight；The blue whale is one of the largest animals on Earth. 是在大範圍中比較大小。',
  },
  {
    match: /關係子句|形容詞子句|who|which|that/,
    title: '關係子句把兩個相關資訊合成一句',
    explanation: () => '先找被修飾的名詞，再看後面的子句補充了什麼資訊。who 常指人，which 常指物，that 可在許多限定用法中代替兩者。',
    example: () => 'The girl who won the race is my cousin. who won the race 說明是哪一個 girl。',
  },
  {
    match: /名詞子句|副詞子句|複雜句|連接詞/,
    title: '複雜句要先找主要句，再看子句扮演什麼角色',
    explanation: () => '長句不要從第一個字一路硬翻。先找主要主詞和動詞，再辨認 because、although、if、when、that 等連接詞引導的子句是原因、讓步、條件、時間或名詞功能。',
    example: () => 'Although it was raining, we continued the game. 主要句是 we continued the game；前面子句提供「雖然下雨」的讓步背景。',
  },
  {
    match: /短文閱讀|閱讀|主旨|細節|推論|篇章|學術閱讀|多文本/,
    title: '英文閱讀先抓篇章任務，不要逐字翻譯',
    explanation: () => '先看標題、首尾句和重複詞抓主題，再依題目找細節、指涉或推論。遇到生字時先用上下文判斷它在句中扮演的角色和大概意思。',
    example: () => '若一段反覆出現 bike lanes、traffic、safer streets，主題很可能和城市自行車交通有關，即使有一兩個字不熟也不妨礙先抓主旨。',
  },
  {
    match: /聽力|聽說|跟讀|口語|簡報|對話/,
    title: '聽力與口說要以「意思單位」練，不是逐字翻譯',
    explanation: () => '聽的時候先抓人物、地點、時間、數字、否定詞與轉折等關鍵訊息；說的時候先用熟悉句型完整傳達意思，再逐步改善速度與發音。',
    example: () => '聽到 “The meeting was moved from three to four.” 最重要的是 moved、three、four，不能只聽到第一個時間就作答。',
  },
  {
    match: /寫作|段落|主題句|議論|敘事|說明/,
    title: '英文寫作先把一段寫完整，再追求複雜句',
    explanation: () => '一段通常要有清楚主題句、支持細節和結尾。先確保每句都在支持同一主題，再用 because、for example、however、therefore 等連接詞整理邏輯。',
    example: () => '主題句 “Our school should add more water stations.” 後面可接需求、使用情境與好處，而不是突然改談校服。',
  },
]

const MATH_RULES: ConceptRule[] = [
  {
    match: /100 以內|1000 以內|10000 以內|大數|位值|數量|數的順序/,
    title: '位值決定每個數字代表多少',
    explanation: (grade) => grade <= 2
      ? '同一個數字放在不同位置，代表的數量不同。先用十個一換一個十、十個十換一個百的操作理解，再連到數字寫法。'
      : '位值系統用十進位把數量組成個、十、百、千……。比較大數時先看最高位值，不需要從個位開始逐位比較。',
    example: () => '在 3,408 中，3 代表 3 個千，4 代表 4 個百，0 表示沒有十，8 代表 8 個一。',
  },
  {
    match: /加法|減法|加減/,
    title: '加減法要先分清楚情境關係',
    explanation: () => '加法不只代表「變多」，也能表示合併；減法除了拿走，也能表示比較兩量相差多少。列式前先問未知的是「總量、剩下、增加多少、相差多少」中的哪一個。',
    example: () => '架上有 18 本書，借走 7 本，剩下 11 本是拿走型；小安 18 本、小美 7 本，相差 11 本則是比較型，算式相同但意思不同。',
  },
  {
    match: /乘法|九九|同量累加/,
    title: '乘法描述「幾組、每組一樣多」',
    explanation: () => '先用陣列、等組或重複加法理解乘法，再熟練乘法事實。看到情境時先指出「有幾組」和「每組多少」，不要只看到兩個數就相乘。',
    example: () => '4 盒彩筆，每盒 6 枝，可寫 6+6+6+6，也可寫 4×6=24。',
  },
  {
    match: /除法|等分|包含除/,
    title: '除法有「平均分」與「可以分成幾組」兩種常見意思',
    explanation: () => '同一個除法算式可以來自不同問題：12 顆糖平均分給 3 人，是每人幾顆；12 顆糖每 3 顆一包，是可以包幾包。理解情境能幫助檢查答案單位。',
    example: () => '12÷3=4；前一題答案是 4 顆／人，後一題答案是 4 包。',
  },
  {
    match: /分數|單位分數|異分母|約分|通分|有理數/,
    title: '分數的核心是「同一個整體被分成幾等份」',
    explanation: (grade) => grade <= 4
      ? '分母說明整體被平均分成幾份，分子說明取了其中幾份。比較分數時先確認整體大小相同。'
      : '分數運算的關鍵是單位分數。加減前要讓兩個分數使用同樣大小的部分，所以異分母要先找共同分母；乘除則要從「幾倍」與「平均分」理解，不只記規則。',
    example: () => '1/2 和 2/4 表示相同大小；1/2+1/3 不能直接變成 2/5，因為兩個「一份」大小不同，需通分成 3/6+2/6=5/6。',
  },
  {
    match: /小數|小數位值/,
    title: '小數是位值系統延伸到 1 的右邊',
    explanation: () => '小數點右邊依序是十分位、百分位、千分位。比較小數時可以補 0 對齊位值，但補 0 不會改變數值。',
    example: () => '0.7=0.70，而 0.70>0.68，因為十分位相同後再比較百分位。',
  },
  {
    match: /因數|倍數|質數|合數|質因數|最大公因數|最小公倍數/,
    title: '因數看「能整除」，倍數看「由某數乘出來」',
    explanation: () => '如果 a 能整除 b，a 是 b 的因數，b 是 a 的倍數。質因數分解能把一個數拆成質數乘積，再系統地找最大公因數與最小公倍數。',
    example: () => '60=2²×3×5，90=2×3²×5，所以最大公因數取共同的較小次方得到 2×3×5=30。',
  },
  {
    match: /比率|百分率|百分比/,
    title: '百分率是「每 100 份有多少份」',
    explanation: () => '百分率方便比較不同大小的整體。先分清楚部分與整體，再算 部分÷整體；若要換成百分率再乘 100%。',
    example: () => '20 人中有 5 人選 A，比例是 5/20=0.25=25%。如果另一班 40 人有 8 人選 A，雖然人數較多，比例卻只有 20%。',
  },
  {
    match: /比與比值|比例|正比|反比|放大縮小/,
    title: '比例關係要看「相除固定」還是「相乘固定」',
    explanation: () => '正比中 y/x 固定，x 放大幾倍，y 也放大幾倍；反比中 xy 固定，x 放大時 y 反而縮小。先用表格找規律，再寫成式子或圖形。',
    example: () => '每枝筆 12 元，總價 y=12x 是正比；固定路程 120 公里時，速度 v 與時間 t 滿足 vt=120，是反比情境。',
  },
  {
    match: /長度|周長|面積|體積|表面積|容量|重量|測量/,
    title: '測量先確認「量的是什麼」與「單位」',
    explanation: () => '長度是一維、面積是二維、體積是三維，單位也跟著從 cm、cm² 到 cm³。公式不是只背數字相乘，而是把幾個方向的尺度組合起來。',
    example: () => '長 5 cm、寬 3 cm 的長方形，周長是把四條邊加起來得 16 cm；面積是 5×3=15 cm²，兩個答案的單位不同。',
  },
  {
    match: /時間|日曆|時分秒|速率|距離/,
    title: '時間與速率題先畫時間線或列三量關係',
    explanation: () => '時間計算容易錯在跨時、進位或把時刻和經過時間混在一起。速率題則先確定距離、時間、速率三者的單位一致，再使用 距離=速率×時間。',
    example: () => '9:45 到 10:20 可分成 15 分鐘到 10:00，再加 20 分鐘，共 35 分鐘。',
  },
  {
    match: /角度|幾何|圖形|四邊形|三角形|平行|垂直|線段|射線|三視圖|圓/,
    title: '幾何要把文字條件畫到圖上',
    explanation: () => '看到「平行、垂直、等長、等角、半徑」等條件時，先用符號標在圖上，再利用定義或性質推理。不能只憑圖看起來像就判定。',
    example: () => '題目若只畫兩條看似平行的線，但沒有平行記號或文字條件，就不能因為「看起來平行」直接使用同位角相等。',
  },
  {
    match: /數線|正負|有向數|絕對值/,
    title: '正負數同時表示大小與方向，絕對值只看距離',
    explanation: () => '數線越往右數值越大；負數不是「比較小的寫法」而是位於 0 的左側。絕對值 |a| 表示 a 到 0 的距離，所以永遠不會是負數。',
    example: () => '−3 比 −8 大，因為 −3 在數線上更靠右；|−8|=8，表示 −8 距離 0 有 8 個單位。',
  },
  {
    match: /指數|科學記號|數量級/,
    title: '指數記錄重複相乘，科學記號整理極大極小數',
    explanation: () => 'aⁿ 表示 n 個 a 相乘；同底數相乘可把指數相加，是因為重複相乘的個數被合併。科學記號寫成 a×10ⁿ，通常要求 1≤|a|<10。',
    example: () => '3,200,000=3.2×10⁶；0.00045=4.5×10⁻⁴。比較時可先看 10 的指數。',
  },
  {
    match: /代數式|未知數|符號|一次式|多項式/,
    title: '代數符號是在記錄「數量關係」',
    explanation: () => '字母不是神秘的答案，而是代表尚未指定或會變動的數量。同類項能合併，是因為它們代表相同種類的量；分配律則能把括號外的倍數分到每一項。',
    example: () => '3x+2x=5x，因為都是 x 的倍數；3x+2 不能變成 5x，因為 2 不是 x 項。',
  },
  {
    match: /一元一次方程式|等量|移項/,
    title: '解方程式是在維持等號兩邊平衡',
    explanation: () => '等式兩邊做相同運算，等量關係仍成立。「移項」只是把兩邊同加或同減的步驟縮寫，不是數字穿過等號就神奇變號。',
    example: () => '3x+5=20：兩邊同減 5 得 3x=15，再同除以 3 得 x=5。代回 3×5+5=20 可驗算。',
  },
  {
    match: /聯立|二元一次/,
    title: '聯立方程式是在找同時符合兩個條件的數對',
    explanation: () => '每一條二元一次方程式代表一組可能解；聯立後要找同時滿足兩條式子的 x、y。代入法利用一式表達一個未知數，加減消去法則把其中一個未知數消掉。',
    example: () => 'x+y=10、x−y=2，相加得 2x=12，所以 x=6，再代回得 y=4。數對 (6,4) 同時滿足兩式。',
  },
  {
    match: /不等式/,
    title: '不等式描述一整個範圍，不只是一個答案',
    explanation: () => '解不等式的步驟和方程式相似，但乘或除以負數時不等號方向要反轉，因為負號會把數線的大小關係翻轉。答案通常要用範圍或數線表示。',
    example: () => '−2x>6，兩邊除以 −2 後得到 x<−3；若忘記反轉符號，代入 x=0 就會發現原式不成立。',
  },
  {
    match: /坐標|象限|直角坐標|函數圖形|線型函數|一次函數/,
    title: '坐標把數量關係轉成位置與圖形',
    explanation: () => '點 (x,y) 先沿 x 軸水平移動，再沿 y 軸垂直移動。函數圖形則把許多符合關係的數對放到同一平面，讓變化趨勢直接可見。',
    example: () => 'y=2x+1 中，x=0 得 (0,1)，x=2 得 (2,5)。兩點都在同一條直線上。',
  },
  {
    match: /根號|平方根|畢氏/,
    title: '平方根是「平方後得到原數」的數',
    explanation: () => '√a 代表非負平方根。根式化簡要找出完全平方因數；畢氏定理則描述直角三角形三邊平方的關係。',
    example: () => '√72=√(36×2)=6√2。直角邊 3、4 的三角形，斜邊 c 滿足 c²=3²+4²=25，所以 c=5。',
  },
  {
    match: /乘法公式|因式分解/,
    title: '展開與因式分解是互為反向的代數操作',
    explanation: () => '乘法公式能快速展開特定型態；因式分解則把多項式改寫成乘積。兩者互相檢查：分解後再展開，應該回到原式。',
    example: () => 'x²−9=(x+3)(x−3)；再展開得到 x²−3x+3x−9=x²−9。',
  },
  {
    match: /二次方程式|二次函數|拋物線/,
    title: '二次關係會產生彎曲的拋物線',
    explanation: () => '一元二次方程式是在找讓 ax²+bx+c=0 成立的 x；二次函數 y=ax²+bx+c 則描述每個 x 對應的 y，圖形是拋物線。根與 x 軸交點有直接關係。',
    example: () => 'x²−5x+6=0 可分解成 (x−2)(x−3)=0，所以根是 2、3；函數 y=x²−5x+6 的圖形也在 x=2、3 與 x 軸相交。',
  },
  {
    match: /數列|等差|等比|級數|遞迴/,
    title: '數列要先找「每一步怎麼變」',
    explanation: () => '等差數列每次加固定差，等比數列每次乘固定比。一般項描述第 n 項，級數則把前幾項加起來。先分清楚「項」和「總和」。',
    example: () => '3,7,11,15,… 每次加 4，是等差數列，第 n 項可寫 3+(n−1)×4。',
  },
  {
    match: /指數與對數|對數/,
    title: '對數是在問「底數要乘自己幾次」',
    explanation: () => 'bˣ=y 與 log_b y=x 是同一件事的兩種寫法。對數可以把乘法關係轉成加法，常用來描述跨很多數量級的資料。',
    example: () => '2³=8，所以 log₂8=3。若某量每次變成 10 倍，使用以 10 為底的對數能直接看出數量級增加多少。',
  },
  {
    match: /三角比|三角函數|週期/,
    title: '三角比把角度和邊長比例連起來',
    explanation: () => '在直角三角形中，sin、cos、tan 由指定角與邊長比例定義；把角度擴展到圓上後，就能描述週期性的波動。',
    example: () => '對同一個銳角 θ，sinθ=對邊/斜邊。只要角度相同，即使三角形放大，這個比例仍相同。',
  },
  {
    match: /向量/,
    title: '向量同時記錄大小與方向',
    explanation: () => '向量可以表示位移、速度、力等有方向的量。分量法把向量拆成水平與垂直部分，方便做加減與幾何分析。',
    example: () => '向東 3、向北 4 的位移可寫成向量 (3,4)，大小為 √(3²+4²)=5。',
  },
  {
    match: /矩陣/,
    title: '矩陣是整理多組數據與線性關係的工具',
    explanation: () => '矩陣用列和欄保存數字。加法要同型；乘法則是把一組線性組合套到另一組資料上。學習重點是理解每一列、每一欄代表什麼，不只照規則算。',
    example: () => '若兩家店兩天的銷量分別排成 2×2 表格，矩陣能保留「店別 × 日期」的結構，方便一起運算。',
  },
  {
    match: /排列組合|機率|樣本空間|隨機/,
    title: '機率先列清楚所有可能，再談比例',
    explanation: () => '計數時先確認事件能不能重複、順序是否重要，再選排列或組合。機率則是有利情況與所有可能情況的比例；條件改變時樣本空間也可能改變。',
    example: () => '擲一顆公平骰子，偶數事件 {2,4,6} 有 3 種，全部有 6 種，所以機率是 3/6=1/2。',
  },
  {
    match: /統計|資料|平均數|中位數|眾數|圖表|分布/,
    title: '統計量是在用不同方式描述資料',
    explanation: () => '平均數會受極端值影響，中位數看排序後的中間位置，眾數看最常出現值。選哪一個要看資料型態與問題，不是平均數永遠最好。',
    example: () => '薪資 30、32、33、35、200 千元的平均數很高，但中位數 33 千元更接近多數人的情況。',
  },
  {
    match: /極限|變化率|導數|微分|切線|極值|最佳化/,
    title: '微分把「一小段內的變化」縮到某一瞬間',
    explanation: () => '平均變化率比較兩點；當兩點越靠越近，若變化率趨近固定值，就得到瞬時變化率，也就是導數。導數的正負可判斷函數上升或下降。',
    example: () => '位置 s(t)=t²，從 t=2 到 2+h 的平均速度是 [(2+h)²−4]/h=4+h；h 趨近 0 時得到瞬時速度 4。',
  },
]

const SCIENCE_RULES: ConceptRule[] = [
  {
    match: /觀察|科學方法|探究|測量|紀錄|實驗|變因/,
    title: '科學從可觀察、可記錄的證據開始',
    explanation: (grade) => grade <= 4
      ? '先提出一個可以觀察的問題，再用相同方式記錄每次結果。描述「我看到什麼」和解釋「為什麼」要分開。'
      : '探究要先把問題說清楚，再設計能比較的條件。控制變因讓我們知道差異可能來自哪個因素；重複測量與記錄則幫助判斷結果是否可靠。',
    example: () => '比較植物在不同光照下的生長時，除了光照時間，水量、植物種類、土壤與觀察天數應盡量一致。',
  },
  {
    match: /植物|根|莖|葉|花|果實|種子/,
    title: '植物構造各自負責不同任務，也彼此合作',
    explanation: () => '根常負責固定與吸收，莖負責支撐與運輸，葉是主要進行光合作用與氣體交換的部位，花與果實和繁殖有關。真正理解要把構造、位置與功能連在一起。',
    example: () => '若根受損，植物即使葉片正常，也可能因吸水能力下降而萎凋。',
  },
  {
    match: /動物|生物|生命|成長|需求/,
    title: '生命現象可從生長、獲得能量、反應與繁殖觀察',
    explanation: () => '生物種類很多，但都需要取得物質與能量、維持身體狀態、對環境作出反應，並透過繁殖延續族群。比較生物時要先說明比較的是哪個生命現象。',
    example: () => '植物不會像動物一樣走動，但仍會向光生長、開花結果，也能對環境作出反應。',
  },
  {
    match: /細胞|細胞膜|細胞核|胞器|組織/,
    title: '細胞是生命構造與功能的基本單位',
    explanation: () => '細胞膜控制物質進出，細胞質中有不同胞器進行各種作用，細胞核包含重要遺傳資訊。多細胞生物再由相似細胞組成組織、器官與器官系統。',
    example: () => '肌肉細胞的形態與功能和神經細胞不同，但都具有基本細胞構造，並在更高層次共同形成身體系統。',
  },
  {
    match: /營養|消化|養分|酵素|光合作用/,
    title: '生物需要把物質轉成可利用的養分與能量',
    explanation: () => '動物靠消化把大分子食物分解成可吸收的小分子；植物則能利用光能、二氧化碳和水製造有機物。酵素能加快特定化學反應，但作用受溫度、酸鹼等條件影響。',
    example: () => '澱粉不能直接整塊穿過腸壁，需要先被消化成較小分子；葉片則利用光合作用製造糖類，作為能量與生長材料來源。',
  },
  {
    match: /循環|運輸|血液|心臟|呼吸|氣體交換/,
    title: '運輸系統把物質送到需要的位置，再帶走廢物',
    explanation: () => '大型多細胞生物不能只靠擴散完成全身運輸。人體用循環系統運送氧、養分與代謝廢物；呼吸系統則在肺部完成氣體交換。',
    example: () => '運動時肌肉耗氧增加，心跳與呼吸加快，有助於把更多氧送到組織並移除二氧化碳。',
  },
  {
    match: /神經|內分泌|協調|感覺|反射|恆定/,
    title: '身體要偵測變化、傳遞訊息並調整反應',
    explanation: () => '神經系統傳遞快速、具方向性的訊息；內分泌系統透過激素調節較慢但可持續的反應。恆定作用則讓體溫、血糖、水分等維持在適合範圍。',
    example: () => '碰到燙的物體時，反射動作能先快速縮手；之後大腦才更完整地處理疼痛感受。',
  },
  {
    match: /生殖|遺傳|染色體|DNA|基因/,
    title: '遺傳資訊透過 DNA 與染色體傳遞',
    explanation: () => '基因是 DNA 上具有特定資訊的片段，DNA 組成染色體。生殖細胞形成與受精會重新組合遺傳資訊，因此子代和父母相似但不完全相同。',
    example: () => '同一家族可能有相似眼睛或髮色特徵，但兄弟姊妹仍有差異，因為得到的基因組合不完全相同。',
  },
  {
    match: /演化|天擇|分類|物種/,
    title: '演化描述族群在世代間的遺傳特徵改變',
    explanation: () => '個體不會因「需要」就立刻演化。族群中原本就有差異；若某些可遺傳特徵使個體較容易生存繁殖，經多代後這些特徵的比例可能改變。分類則用共同特徵與演化關係整理生物多樣性。',
    example: () => '抗藥性細菌不是被藥物「訓練」出來，而是原有差異中能存活的個體繁殖，使抗藥性比例逐代提高。',
  },
  {
    match: /生態|食物|食物網|族群|群集|能量|環境/,
    title: '生態系同時包含生物關係與能量、物質流動',
    explanation: () => '食物鏈只顯示一條取食關係，食物網更接近真實生態系。能量從生產者往較高營養階層傳遞時逐層減少，物質則可在環境與生物間循環。',
    example: () => '若某地昆蟲大量減少，吃昆蟲的鳥可能受影響，而植物授粉也可能改變，所以不能只看單一食物鏈。',
  },
  {
    match: /水|溶解|溶液|酸鹼|材料|物質|狀態|固體|液體|氣體/,
    title: '物質的性質與狀態要靠可觀察或可測量特徵判斷',
    explanation: () => '固、液、氣三態的差異可從形狀、體積與粒子運動理解；溶解不是「消失」，而是粒子分散在溶劑中。物質性質可用密度、溶解度、酸鹼性等方式比較。',
    example: () => '鹽溶進水後看不見，但水蒸發後可以得到鹽，表示鹽並沒有消失，只是分散在水中。',
  },
  {
    match: /化學反應|反應|原子|分子|元素|週期表|莫耳|氧化|還原/,
    title: '化學反應會重新排列粒子，但原子總數守恆',
    explanation: () => '化學反應中舊鍵結斷裂、新鍵結形成，產生新物質；原子的種類與數量不會憑空消失。化學式與反應式就是用符號記錄這種粒子層次的變化。',
    example: () => '2H₂+O₂→2H₂O：反應前後都有 4 個氫原子與 2 個氧原子，只是重新組成水分子。',
  },
  {
    match: /力|運動|速度|加速度|牛頓|摩擦|重力/,
    title: '力會改變運動狀態，不是維持運動的必要條件',
    explanation: () => '速度描述位置改變快慢與方向；加速度描述速度如何改變。合力不為零時物體才會產生加速度。物體已在運動並不代表一定有向前的合力。',
    example: () => '冰面上的滑塊若摩擦很小，可以在沒有持續向前推力時維持近似等速運動；推力主要在改變速度。',
  },
  {
    match: /功|能量|動能|位能|熱|溫度/,
    title: '能量可以轉換與傳遞，總量分析要先畫系統邊界',
    explanation: () => '動能和運動有關，位能和位置或形變有關，熱傳則和溫度差有關。真實過程常有部分機械能轉成內能，所以不能只追一種能量。',
    example: () => '球從高處落下時重力位能減少、動能增加；撞地後一部分能量轉為聲音、形變與內能。',
  },
  {
    match: /光|影子|反射|折射|透鏡|顏色/,
    title: '光的路徑可以用光線模型追蹤',
    explanation: () => '光在均勻介質中近似直線前進；遇到介面可能反射或折射。影子、鏡像與透鏡成像都能用光線路徑解釋，而不是靠背圖形。',
    example: () => '吸管插入水中看起來彎折，是光從水進入空氣時方向改變造成的折射，不是吸管真的彎了。',
  },
  {
    match: /聲音|波|頻率|振動/,
    title: '聲音來自振動，頻率與振幅描述不同性質',
    explanation: () => '聲音需要介質傳播。頻率主要關係到音高，振幅常和聲音強弱相關。波形看起來更密不代表一定更大聲，要分清楚兩個量。',
    example: () => '同一把吉他弦拉得更緊時振動頻率通常提高，音高變高；彈得更用力主要增加振幅，聲音較響。',
  },
  {
    match: /電|電路|電流|電壓|電阻|歐姆|串聯|並聯/,
    title: '電路要同時看電流路徑與元件兩端電位差',
    explanation: () => '電流必須有完整閉合路徑。串聯元件共享同一路徑，並聯元件則接在相同兩個節點之間。電壓不是「流過」元件，而是兩點間的電位差。',
    example: () => '兩顆燈泡並聯時，即使其中一支路斷掉，另一支路仍可能形成完整電路；串聯則會一起中斷。',
  },
  {
    match: /磁鐵|磁場|電磁/,
    title: '磁力可用磁場描述方向與影響範圍',
    explanation: () => '磁鐵有兩極，同極相斥、異極相吸；磁場是一種用來描述空間中磁力作用的模型。電流也能產生磁場，因此電與磁可以互相連結。',
    example: () => '通電線圈放入鐵芯可形成電磁鐵；切斷電流後磁性會大幅降低，因此適合做可控制的吸放裝置。',
  },
  {
    match: /天氣|氣候|季節|氣團|鋒面|颱風|水文/,
    title: '天氣是短時間狀態，氣候是長期統計特徵',
    explanation: () => '判讀天氣要看溫度、氣壓、濕度、風與降水等變化；氣候則需要長期資料。季節、季風、鋒面與颱風影響的時間尺度不同，不能混成同一概念。',
    example: () => '今天突然下大雨是天氣事件；某地多年夏季平均較濕、冬季較乾則屬於氣候特徵。',
  },
  {
    match: /地球|岩石|地層|地震|板塊|火山|地質/,
    title: '地球表面變動可從板塊、岩石與地層證據推論',
    explanation: () => '板塊運動會造成地震、火山與造山等現象；地層與岩石則保存過去環境與地質事件線索。地質推論依靠多種證據，不只看單一地震。',
    example: () => '臺灣地震頻繁與板塊交界有關；不同地區的岩層變形、斷層與地震分布可以共同支持這個解釋。',
  },
  {
    match: /太陽|月亮|星|宇宙|天文|軌道|日月地/,
    title: '天文現象要先建立觀察者、方向與時間尺度',
    explanation: () => '日夜、月相、季節與行星運動常被混淆。先畫出太陽、地球、月球或觀察者的位置關係，再追蹤光照方向與運動，就比較不容易靠想像猜答案。',
    example: () => '月相變化不是地球影子每天遮住月球，而是我們看到月球受日照半面中的不同部分。',
  },
]

const SOCIAL_RULES: ConceptRule[] = [
  {
    match: /地圖|位置|方位|經緯|比例尺|圖例|GIS|空間/,
    title: '讀地圖先確認位置、方向、尺度與圖例',
    explanation: () => '地圖是被選擇與簡化過的空間資料。先確認方向、比例尺、圖例、資料時間與範圍，再描述分布；如果沒有這些步驟，很容易把符號或距離看錯。',
    example: () => '同樣 2 公分在 1:10,000 和 1:1,000,000 的地圖上代表的實際距離完全不同，所以不能只用尺量圖面。',
  },
  {
    match: /地形|海岸|海域|山脈|河川|水文|氣候/,
    title: '自然環境要看形成過程與人類使用的關係',
    explanation: () => '地形、氣候與水系不只是地名清單。先看高低起伏、風向、降水與河流方向等空間特徵，再問它們如何影響聚落、農業、交通與災害風險。',
    example: () => '山地迎風坡可能降雨較多；河川短急、坡度大時，暴雨期間洪水風險也可能提高。',
  },
  {
    match: /人口|聚落|都市|交通|產業|區域|土地使用/,
    title: '人口與產業分布是多種條件共同作用的結果',
    explanation: () => '聚落與產業位置可能同時受到地形、交通、市場、資源、政策與歷史影響。看到集中分布時，先描述現象，再找多個可能因素，不要把相關直接當成單一因果。',
    example: () => '車站周邊商業密集，可能和人流、交通可達性、土地價格與都市規劃共同有關。',
  },
  {
    match: /史前|歷史|時代|年代|王朝|政權|戰爭|殖民|日治|清|戰後/,
    title: '歷史要同時建立時間線與因果鏈',
    explanation: () => '先把事件依時間排序，再問「當時有哪些條件、誰做了什麼選擇、短期與長期造成什麼影響」。相鄰發生的事件不一定直接互為因果。',
    example: () => '某政策推出後人口移動增加，還要檢查戰爭、交通、經濟等因素，不能只因為時間前後相鄰就斷言政策是唯一原因。',
  },
  {
    match: /史料|資料來源|證據|考古|遺址|文獻/,
    title: '史料是有來源與限制的證據',
    explanation: () => '讀史料先問誰製作、何時製作、為什麼製作、原本給誰看，再分清楚史料直接告訴我們什麼、哪些是後人的推論。多份來源互相比較，比單一資料更可靠。',
    example: () => '官方公告能直接顯示政府當時公開宣稱的政策，但不能單靠公告就知道所有民眾實際如何感受。',
  },
  {
    match: /原住民|族群|文化|多元|移民|認同/,
    title: '文化與族群不能用單一刻板印象代表',
    explanation: () => '族群內部也有差異，文化會隨交流、遷移、政策與世代改變。理解文化議題要區分自我認同、外部分類、歷史經驗與制度影響。',
    example: () => '同一族群在不同地區、世代或家庭中，語言使用與生活方式可能不同，因此不能用一個習俗代表所有成員。',
  },
  {
    match: /家庭|社區|學校|自我|性別|社會互動|團體/,
    title: '個人生活同時受到關係、規範與角色影響',
    explanation: () => '人在家庭、學校、社區與團體中會扮演不同角色，也會遇到權利、責任、合作與衝突。分析情境時要先找出有哪些人、彼此關係和可用的規範。',
    example: () => '班級分組意見不同時，重點不只是誰聲音最大，而是如何讓每個人有表達機會並共同決定。',
  },
  {
    match: /規範|法律|權利|義務|司法|犯罪|契約/,
    title: '規範有不同層次，法律具有正式程序與公權力',
    explanation: () => '生活習慣、道德、校規與法律都能影響行為，但來源、適用範圍與制裁方式不同。法律問題還要區分權利、義務、責任以及程序保障。',
    example: () => '「排隊」可能主要靠社會規範；交通號誌則有法律規範與公權力執行，違反後果不同。',
  },
  {
    match: /民主|政府|政治|選舉|權力|制度|公共政策/,
    title: '民主政治不只是投票，而是權力受規則與監督約束',
    explanation: () => '民主制度透過選舉、分權、法治、資訊公開與公民參與限制公權力。評估政策時要分清楚「誰有權決定、程序是否合法、不同群體受到什麼影響」。',
    example: () => '一項公共建設即使多數人支持，仍需要合法程序、預算監督與對受影響居民的權利保障。',
  },
  {
    match: /經濟|市場|供需|價格|消費|生產|金融|貨幣|國際貿易/,
    title: '經濟選擇的核心是有限資源下的取捨',
    explanation: () => '個人、企業與政府都要在有限時間、金錢與資源中選擇。市場價格常受到供給與需求影響，但政策、資訊、壟斷、外部成本等也會改變結果。',
    example: () => '颱風前蔬菜供應減少、需求又上升時，價格可能上漲；但若只用「商家變貪心」就無法完整解釋市場變化。',
  },
  {
    match: /福利|公平|社會安全|弱勢|正義/,
    title: '公平不一定等於每個人拿到完全一樣',
    explanation: () => '公共資源分配常要在平等、需求、貢獻、效率與基本權利之間取捨。討論公平時要先說明採用哪一種標準，再比較不同方案對各群體的影響。',
    example: () => '無障礙坡道不是讓每個人獲得完全相同設施，而是降低不同身體條件造成的使用障礙。',
  },
  {
    match: /媒體|資訊|假訊息|公共議題|立場|公民參與/,
    title: '公共資訊要查來源、證據與推論是否跳太快',
    explanation: () => '看到圖卡、短影音或新聞標題時，先找原始資料與日期，再確認數據單位、樣本與比較基準。意見可以有立場，但事實主張仍需要可檢查的證據。',
    example: () => '「某政策讓犯罪增加 50%」若沒說基準是 2 件變 3 件，或樣本只有一個月，就可能造成誤解。',
  },
  {
    match: /全球化|國際|世界|區域合作|環境議題/,
    title: '全球議題要看跨國連結與不同尺度',
    explanation: () => '商品、資金、人口、資訊與環境影響會跨越國界。分析全球議題時，不能只看單一國家的利益，還要比較地方、國家與全球尺度的成本與收益。',
    example: () => '一件衣服的設計、原料、製造、運輸與銷售可能分布在不同國家，價格與勞動、能源、物流和匯率都有關。',
  },
]

function subjectRules(subject: CurriculumSubjectId) {
  if (subject === 'chinese') return CHINESE_RULES
  if (subject === 'english') return ENGLISH_RULES
  if (subject === 'math') return MATH_RULES
  if (subject === 'science') return SCIENCE_RULES
  if (subject === 'social') return SOCIAL_RULES
  return []
}

function fallbackConcept(subject: CurriculumSubjectId, grade: number, phrase: string): ReviewedConcept {
  const title = compact(phrase)
  if (subject === 'chinese') return {
    title,
    explanation: `學「${title}」時先放回完整文本：找出明確字詞或句子線索，再用自己的話說明它的作用，最後用改寫、比較或新文本確認真的理解，而不是只背名稱。`,
    example: `做題時先圈出能支持答案的原文，再回答「如果把這個詞／句子換掉，意思或語氣會怎麼變？」`,
  }
  if (subject === 'english') return {
    title,
    explanation: `「${title}」先處理意思，再處理英文形式。先在對話或短文中聽懂／讀懂，再注意關鍵字詞與句型，最後自己說或寫一個新例子。`,
    example: `不要只背中文翻譯；把目標語言放進「誰、在什麼情境、想表達什麼」的完整句子中使用。`,
  }
  if (subject === 'math') return {
    title,
    explanation: `「${title}」要同時理解意義、表示方法與可檢查的步驟。先用具體數量、圖形或表格建立意思，再連到算式／公式，最後用估算、代回或反向運算檢查。`,
    example: `看到新題先寫「已知什麼、未知什麼、兩者有什麼關係」，不要一看到數字就直接套公式。`,
  }
  if (subject === 'science') return {
    title,
    explanation: `理解「${title}」時先分開「觀察到的現象」和「用科學概念做的解釋」。若有數據或實驗，先確認控制條件與證據，再判斷解釋是否真的被支持。`,
    example: `把觀察寫成「溫度上升 5°C」比寫「反應變得比較厲害」更可檢查；後者屬於需要證據支持的解釋。`,
  }
  return {
    title,
    explanation: `理解「${title}」時先確認時間、空間、人物／群體與資料來源，再區分「資料直接顯示的事實」、「對原因的解釋」和「不同立場的價值判斷」。`,
    example: `先寫出資料可以直接支持哪一句話，再另外列出還需要哪些證據才能支持因果或價值判斷。`,
  }
}

function conceptFromPhrase(subject: CurriculumSubjectId, grade: number, phrase: string): ReviewedConcept {
  const rule = subjectRules(subject).find((item) => item.match.test(phrase))
  if (!rule) return fallbackConcept(subject, grade, phrase)
  return {
    title: rule.title ?? compact(phrase),
    explanation: rule.explanation(grade, phrase),
    example: rule.example?.(grade, phrase),
  }
}

function buildConcepts(context: UnitContext) {
  const phrases = splitFocus(context.unit)
  const concepts = phrases.map((phrase) => conceptFromPhrase(context.subject, context.grade, phrase))

  const seen = new Set<string>()
  const unique = concepts.filter((concept) => {
    if (seen.has(concept.title)) return false
    seen.add(concept.title)
    return true
  })

  while (unique.length < 4) {
    const phrase = unique.length === 0 ? context.unit.title : `${context.unit.title}的應用 ${unique.length + 1}`
    const concept = fallbackConcept(context.subject, context.grade, phrase)
    if (!seen.has(concept.title)) {
      seen.add(concept.title)
      unique.push(concept)
    }
  }
  return unique.slice(0, context.grade <= 2 ? 5 : context.grade <= 6 ? 6 : 8)
}

function mathWorkedExample(context: UnitContext, concepts: ReviewedConcept[]): ReviewedWorkedExample {
  const text = `${context.unit.title} ${context.unit.focus}`
  if (/加法|減法|加減/.test(text)) return {
    title: '先判斷情境，再決定用加還是減',
    context: '圖書角原本有 36 本書，本週又放入 18 本；之後同學借走 15 本。',
    prompt: '現在圖書角有幾本書？為什麼要分兩步？',
    steps: ['先處理「放入」：36+18=54。', '再處理「借走」：54−15=39。', '用估算檢查：36 約 40、18 約 20，先到約 60，再減約 15，39 合理。'],
    answer: '39 本。',
    explanation: '把每個動作對應到數量變化，比把三個數一次塞進算式更不容易出錯。',
  }
  if (/乘法|除法/.test(text)) return {
    title: '把「幾組」和「每組多少」畫清楚',
    context: '有 6 盒球，每盒 8 顆。要平均分給 4 組學生。',
    prompt: '每組可以分到幾顆球？',
    steps: ['先求總數：6×8=48。', '再平均分成 4 組：48÷4=12。', '檢查單位：答案問的是每組「幾顆」。'],
    answer: '每組 12 顆。',
    explanation: '乘法先形成總量，除法再重新等分；每一步都對應不同的情境關係。',
  }
  if (/分數/.test(text)) return {
    title: '異分母加法先讓「一份」一樣大',
    context: '一壺果汁上午喝了 1/3，下午又喝了 1/4。',
    prompt: '一天共喝掉這壺果汁的多少？',
    steps: ['1/3 和 1/4 的單位分數大小不同，先找共同分母 12。', '1/3=4/12，1/4=3/12。', '相加得 7/12，已是最簡分數。'],
    answer: '7/12 壺。',
    explanation: '分數加減不是直接加分母，而是先統一「每一份」的大小。',
  }
  if (/方程|代數|未知|聯立|不等式/.test(text)) return {
    title: '把文字關係翻成等量關係',
    context: '一張學生票 x 元，3 張學生票再加 40 元手續費共 250 元。',
    prompt: '學生票一張多少元？',
    steps: ['依題意列式：3x+40=250。', '兩邊同減 40：3x=210。', '兩邊同除以 3：x=70。', '代回檢查：3×70+40=250。'],
    answer: '70 元。',
    explanation: '方程式不是猜 x，而是把已知關係寫出來，再用等量原理逐步縮小未知。',
  }
  if (/比例|百分|比率|速率/.test(text)) return {
    title: '先找不變的比率，再處理新情境',
    context: '4 瓶飲料共 120 元，假設單價固定。',
    prompt: '買 7 瓶要多少元？',
    steps: ['先找每瓶單價：120÷4=30。', '單價固定，所以 7 瓶：30×7=210。', '也可檢查比值：120:4=210:7。'],
    answer: '210 元。',
    explanation: '比例題的核心是先找哪個比值保持不變。',
  }
  if (/面積|體積|長度|周長|幾何|圖形|圓/.test(text)) return {
    title: '先標示已知尺寸，再決定量的是長度、面積還是體積',
    context: '一個長方形長 8 cm、寬 5 cm。',
    prompt: '它的周長和面積各是多少？',
    steps: ['周長量的是邊界長度：(8+5)×2=26 cm。', '面積量的是平面大小：8×5=40 cm²。', '檢查單位：周長是 cm，面積是 cm²。'],
    answer: '周長 26 cm；面積 40 cm²。',
    explanation: '同一張圖可能問不同量，公式選擇前先看問題真正要測量什麼。',
  }
  if (/統計|資料|機率/.test(text)) return {
    title: '先看資料分布，再選合適的統計量',
    context: '五筆資料為 10、11、12、13、54。',
    prompt: '用平均數還是中位數描述「典型值」較合理？',
    steps: ['平均數=(10+11+12+13+54)÷5=20。', '中位數是排序後中間值 12。', '54 是明顯極端值，會把平均數往上拉。'],
    answer: '若要描述多數資料的典型位置，中位數 12 較合理；平均數 20 仍可報告，但要說明極端值影響。',
    explanation: '統計量沒有永遠最好，選擇要配合資料分布和問題。',
  }
  if (/函數|坐標|數列|指數|對數|微分|向量|矩陣/.test(text)) return {
    title: '把符號關係轉成表格、圖形或具體數值',
    context: `本單元正在學「${context.unit.title}」。先用一組簡單數值測試規則，再回到一般符號。`,
    prompt: '遇到抽象公式時，怎麼確認自己真的理解？',
    steps: ['先選一組容易計算的數代入。', '把結果畫成表格、數線或坐標圖，找出變化規律。', '再回到符號，說明每個字母代表什麼量，以及改變它會造成什麼影響。'],
    answer: '能在數值、圖形與符號三種表示間互相轉換，才算真正掌握關係。',
    explanation: concepts[0]?.explanation ?? context.unit.focus,
  }
  return genericWorkedExample(context, concepts)
}

function chineseWorkedExample(context: UnitContext, concepts: ReviewedConcept[]): ReviewedWorkedExample {
  const text = `${context.unit.title} ${context.unit.focus}`
  if (/主旨|段落|篇章|閱讀|故事|敘事|說明|論說|跨文本/.test(text)) return {
    title: '從線索整理主旨，不直接抄第一句',
    context: '自寫短文：「社區圖書館把原本封閉的角落改成兒童閱讀區。週末開始有親子一起來讀書，附近居民也自發捐書。半年後，借閱量比改造前多了一倍。」',
    prompt: '這段文字的重點是什麼？哪些細節支持你的判斷？',
    steps: ['先找重複出現的中心：圖書館空間改造與使用變化。', '再看結果：親子使用、居民捐書、借閱量增加。', '把細節往上一層概括，而不是逐句重述。'],
    answer: '圖書館改善閱讀空間後，帶動居民參與並提高使用量。',
    explanation: '主旨要能涵蓋多個重要細節，又不能比原文說得更誇張。',
  }
  if (/文言|古典/.test(text)) return {
    title: '先斷句，再處理詞義與指涉',
    context: 'Bubble Space 自寫文言短句：「童聞庭前有鳥鳴，出而觀之。鳥見人至，振翼而去。」',
    prompt: '先把兩句翻成現代語，再說明第二個「而」表示什麼關係。',
    steps: ['找人物與動作：童／聞／出／觀；鳥／見／振翼／去。', '「人至」是鳥看到的情況；「振翼而去」是先振翅、接著離去。', '整理成通順現代語。'],
    answer: '孩子聽到庭院前有鳥叫，就出去看。鳥看到人來了，拍動翅膀飛走。「而」連接前後相承的動作。',
    explanation: '文言翻譯先抓句子骨架，比逐字找一對一中文更可靠。',
  }
  if (/寫|作文|表達|日記|書信/.test(text)) return {
    title: '把題目變成「要傳達的中心」',
    context: '題目：「一次我改變想法的經驗」。',
    prompt: '怎麼避免寫成一整天流水帳？',
    steps: ['先寫一句中心：我原本怎麼想，後來為什麼改變。', '只挑能造成改變的關鍵事件與對話。', '結尾回到改變後的想法，而不是只寫「今天很開心」。'],
    answer: '用「原本想法 → 關鍵事件 → 新理解」做主線，其他無關行程刪掉。',
    explanation: '寫作的取材不是越多越好，而是每個細節都要服務中心。',
  }
  return genericWorkedExample(context, concepts)
}

function englishWorkedExample(context: UnitContext, concepts: ReviewedConcept[]): ReviewedWorkedExample {
  const text = `${context.unit.title} ${context.unit.focus}`
  if (/問句|招呼|自我介紹|對話|口語/.test(text)) return {
    title: '從情境決定要問什麼',
    context: 'A: Hi, I’m Nina. I’m new here.  B: Welcome! ______ do you live?  A: Near the library.',
    prompt: '空格應填哪個疑問詞？為什麼？',
    steps: ['先看回答 Near the library，是地點資訊。', '問地點用 where。', '完整句為 Where do you live?'],
    answer: 'Where。',
    explanation: '疑問詞要由「想取得哪種資訊」決定，不是只背固定句型。',
  }
  if (/現在式|過去式|進行|時態|未來/.test(text)) return {
    title: '先找時間線索，再選動詞形式',
    context: 'Mia usually walks to school, but today her dad is driving her because it is raining.',
    prompt: '為什麼 walks 和 is driving 可以出現在同一句？',
    steps: ['usually 表示固定習慣，所以用現在簡單式 walks。', 'today 加上當下情境表示今天此刻的暫時行動，所以用現在進行式 is driving。', '兩種時態描述不同時間性質，並不矛盾。'],
    answer: 'walks 表習慣；is driving 表此刻／今天的暫時行動。',
    explanation: '時態的核心是時間觀念，不只是動詞長相。',
  }
  if (/閱讀|短文|篇章|學術|多文本/.test(text)) return {
    title: '不逐字翻譯，也能先抓文章主旨',
    context: 'Short text: “Many students ride bikes to school. The city added a protected bike lane last year. Since then, fewer students say they feel unsafe near the main road.”',
    prompt: 'What is the main idea?',
    steps: ['抓重複概念：students、bikes、bike lane、safe。', '找變化：增加 protected bike lane 之後，覺得不安全的人變少。', '主旨要涵蓋原因與結果，不只抄其中一句。'],
    answer: 'A protected bike lane made students feel safer when biking near the main road.',
    explanation: '先抓篇章結構，再處理個別生字，閱讀會更有效率。',
  }
  return genericWorkedExample(context, concepts)
}

function scienceWorkedExample(context: UnitContext, concepts: ReviewedConcept[]): ReviewedWorkedExample {
  const text = `${context.unit.title} ${context.unit.focus}`
  if (/細胞|植物|生物|生態|營養|循環|遺傳/.test(text)) return {
    title: '用觀察證據排除不合理解釋',
    context: '兩株同品種幼苗使用相同土壤與水量。A 每天有 8 小時光照，B 放在暗處。七天後 A 長出 4 片新葉，B 葉色變淡且幾乎沒有新葉。',
    prompt: '這組觀察可以支持什麼結論？還不能直接證明什麼？',
    steps: ['先寫直接觀察：A 新葉較多；B 葉色較淡。', '主要不同條件是光照，因此結果支持「光照與植物生長狀態有關」。', '但只有一組植物、時間又短，不能直接宣稱所有植物都會以完全相同比例變化。'],
    answer: '可支持光照會影響這種幼苗的生長與葉色；不能把結果無限制推廣到所有植物與所有條件。',
    explanation: '科學結論要和證據範圍相配，不能超出實驗真正比較的條件。',
  }
  if (/力|運動|能量|電|光|聲音|熱/.test(text)) return {
    title: '先畫系統與方向，再判斷變化',
    context: '一台玩具車在水平地面上往右滑行，之後速度逐漸變慢直到停止。',
    prompt: '「車在動，所以一定有向右的合力」這句話哪裡有問題？',
    steps: ['運動方向不等於合力方向。', '車速度在減小，表示加速度方向和速度相反。', '若主要影響是摩擦力，合力應大致向左。'],
    answer: '向右運動只描述速度方向；因為車在減速，合力應與運動方向相反，而不是一定向右。',
    explanation: '用速度「怎麼變」判斷合力，比只看物體往哪裡移動更準確。',
  }
  if (/化學|物質|溶液|反應|原子|分子/.test(text)) return {
    title: '把巨觀現象連到粒子模型',
    context: '把 5 g 食鹽加入 100 g 水中並完全溶解，杯中看不到鹽晶體。',
    prompt: '食鹽是否消失？如何用一個可驗證的方法判斷？',
    steps: ['「看不見晶體」只是巨觀觀察，不能等同物質不存在。', '溶解表示食鹽粒子分散在水中。', '可把水蒸發，觀察是否重新得到固體鹽；也可量測溶液總質量。'],
    answer: '食鹽沒有消失，而是溶解分散；蒸發水後可重新得到鹽。',
    explanation: '粒子模型能解釋「看不見但仍存在」的現象。',
  }
  return genericWorkedExample(context, concepts)
}

function socialWorkedExample(context: UnitContext, concepts: ReviewedConcept[]): ReviewedWorkedExample {
  const text = `${context.unit.title} ${context.unit.focus}`
  if (/地理|地形|人口|產業|氣候|區域|地圖|位置/.test(text)) return {
    title: '先描述空間分布，再提出可以驗證的解釋',
    context: '某城市地圖顯示大型商店多集中在捷運站與主要幹道周圍，住宅區內則較少。',
    prompt: '哪一句是「地圖直接支持的描述」？哪一句是「需要更多證據的解釋」？',
    steps: ['直接描述：商店在捷運站與幹道周圍較密集。', '可能解釋：人流與交通可達性吸引商店選址。', '若要支持解釋，還需要人流、租金、土地使用或消費資料。'],
    answer: '分布集中是地圖直接支持的事實；「因交通方便所以集中」是合理假設，但仍需其他資料驗證。',
    explanation: '地理判讀要把「看到什麼」和「為什麼」分開。',
  }
  if (/歷史|史前|清|日治|戰後|政權|史料/.test(text)) return {
    title: '用兩種來源交叉檢查歷史敘事',
    context: '資料 A 是政府當年發布的政策公告；資料 B 是同一時期一位居民的日記。兩份資料對政策效果描述不同。',
    prompt: '應該怎麼使用這兩份資料？',
    steps: ['先看來源目的：公告呈現官方立場，日記呈現個人經驗。', '兩者都不是「全部真相」，但各自能回答不同問題。', '再找統計、報刊、其他地區紀錄等資料比較。'],
    answer: '保留兩份資料的差異，分別用來理解官方政策與個人經驗，再用更多來源交叉驗證。',
    explanation: '歷史研究不是找一份「最像答案」的資料，而是比較不同證據的角度與限制。',
  }
  if (/公民|法律|民主|經濟|家庭|社會|規範|福利/.test(text)) return {
    title: '公共情境先辨認權利、責任與規則',
    context: '社區想把一塊公共空地改成停車場。一部分居民支持解決停車問題，另一部分擔心兒童活動空間消失。',
    prompt: '如果要做公共決策，不能只問「哪一邊人比較多」。還要考慮什麼？',
    steps: ['確認土地用途與合法程序。', '整理不同群體需求與可能受影響的權利。', '比較替代方案、成本與長期影響。', '讓決策理由與資料公開，保留參與與救濟程序。'],
    answer: '要同時考慮程序、權利、證據、替代方案與不同群體影響。',
    explanation: '公民議題不是找唯一口號，而是用制度與證據處理價值衝突。',
  }
  return genericWorkedExample(context, concepts)
}

function genericWorkedExample(context: UnitContext, concepts: ReviewedConcept[]): ReviewedWorkedExample {
  const first = concepts[0]
  const second = concepts[1]
  return {
    title: `把「${context.unit.title}」從名詞變成可操作的方法`,
    context: `本單元的核心範圍是：${context.unit.focus}`,
    prompt: '如果遇到一個新情境，應該怎麼開始，而不是直接猜答案？',
    steps: [
      `先確認第一個核心觀念：「${first?.title ?? context.unit.title}」。`,
      second ? `再檢查第二個相關觀念：「${second.title}」。` : '把問題拆成可以逐步確認的小問題。',
      '使用一個具體例子、資料、圖形或短文本測試自己的理解。',
      '最後用另一個新情境重做一次，確認不是只記住原例子。',
    ],
    answer: '能說明使用哪個觀念、為什麼適用，並在新情境得到可檢查的結果。',
    explanation: first?.explanation ?? context.unit.focus,
  }
}

function workedExampleFor(context: UnitContext, concepts: ReviewedConcept[]) {
  if (context.subject === 'math') return mathWorkedExample(context, concepts)
  if (context.subject === 'chinese') return chineseWorkedExample(context, concepts)
  if (context.subject === 'english') return englishWorkedExample(context, concepts)
  if (context.subject === 'science') return scienceWorkedExample(context, concepts)
  if (context.subject === 'social') return socialWorkedExample(context, concepts)
  return genericWorkedExample(context, concepts)
}

function applicationPrompt(subject: CurriculumSubjectId, concept: ReviewedConcept) {
  if (subject === 'chinese') return `閱讀或寫作時，哪個做法最能真正運用「${concept.title}」？`
  if (subject === 'english') return `Which learning move best shows that you understand “${concept.title}” instead of only memorizing a form?`
  if (subject === 'math') return `遇到和「${concept.title}」有關的新題目時，哪個做法最能檢查你真的理解？`
  if (subject === 'science') return `研究「${concept.title}」相關現象時，哪個做法最符合科學判斷？`
  return `面對和「${concept.title}」有關的新資料時，哪個做法最可靠？`
}

function goodApplication(subject: CurriculumSubjectId) {
  if (subject === 'chinese') return '先找文本線索，再說明判斷理由，最後用新文本或改寫驗證。'
  if (subject === 'english') return 'Understand the meaning in context first, notice the language pattern, then use it in a new sentence or situation.'
  if (subject === 'math') return '先說明已知、未知與關係，再選方法，做完後用估算、代回或另一種表示檢查。'
  if (subject === 'science') return '先記錄可觀察證據，控制重要條件，再判斷哪個解釋受到資料支持。'
  return '先確認來源、時間與範圍，分開資料事實與解釋，再比較其他證據。'
}

function distractors(subject: CurriculumSubjectId) {
  if (subject === 'chinese') return ['只背課本上的術語名稱，不回到句子或文章。', '只挑自己最有感覺的一句，其他線索都忽略。', '看到關鍵字就直接選答案，不說明它和題目的關係。']
  if (subject === 'english') return ['Translate every word first and stop if one word is unknown.', 'Memorize one sample sentence and use it for every situation.', 'Choose a grammar form only because it looks familiar, without checking the meaning or time.']
  if (subject === 'math') return ['先找最像的公式直接代數字，不管題意與單位。', '只看答案數字大小，不檢查算式代表什麼。', '算完一次就結束，即使結果和情境明顯不合理也不檢查。']
  if (subject === 'science') return ['先決定自己相信的答案，再只挑支持它的觀察。', '只做一次觀察就宣稱對所有情況都成立。', '把「同時發生」直接當成「一定有因果」。']
  return ['只看標題或單一圖卡就下結論。', '兩件事同時出現就直接宣稱一方造成另一方。', '只採用和自己立場一致的資料，不檢查來源。']
}

function buildQuestions(context: UnitContext, concepts: ReviewedConcept[]): ReviewedQuestion[] {
  const questions: ReviewedQuestion[] = []
  const distractorSet = distractors(context.subject)
  const selectedConcepts = concepts.slice(0, Math.min(5, concepts.length))

  selectedConcepts.forEach((concept, index) => {
    const question: ReviewedChoiceQuestion = {
      id: `${context.unit.id}-foundation-q${index + 1}`,
      kind: 'choice',
      level: index < 2 ? '理解' : '應用',
      context: concept.example,
      prompt: applicationPrompt(context.subject, concept),
      options: [goodApplication(context.subject), ...distractorSet],
      correctIndex: 0,
      explanation: concept.explanation,
    }
    questions.push(question)
  })

  const responseOne: ReviewedResponseQuestion = {
    id: `${context.unit.id}-foundation-q6`,
    kind: 'response',
    level: '理解',
    context: `本單元：${context.unit.title}`,
    prompt: `請用自己的話解釋「${concepts[0]?.title ?? context.unit.title}」，並舉一個和課程例子不同的新例子。`,
    sampleAnswer: `${concepts[0]?.explanation ?? context.unit.focus} 一個合格的新例子需要保留同一個核心關係，但換掉人物、數字、文本或生活情境。`,
    explanation: '能用自己的話重述、再產生新例子，比只背定義更能檢查是否真正理解。',
  }
  const responseTwo: ReviewedResponseQuestion = {
    id: `${context.unit.id}-foundation-q7`,
    kind: 'response',
    level: '應用',
    context: `把本單元換到新的情境：${context.unit.focus}`,
    prompt: `如果同學在「${context.unit.title}」卡住，你會先請他檢查哪兩件事？為什麼？`,
    sampleAnswer: `先檢查是否理解「${concepts[0]?.title ?? '核心觀念'}」；再檢查能否把題目／文本／資料中的條件和這個觀念連起來。若只記住原例子，應換一個更具體的例子重新建立關係。`,
    explanation: '找出卡點比直接把答案告訴對方更能建立可轉用的能力。',
  }
  const responseThree: ReviewedResponseQuestion = {
    id: `${context.unit.id}-foundation-q8`,
    kind: 'response',
    level: '檢核',
    context: `單元檢核：${context.unit.title}`,
    prompt: '請寫出本單元一個「容易犯的錯」以及一個你可以用來自我檢查的方法。',
    sampleAnswer: `容易犯的錯可以是忽略條件、混淆概念或只套公式／背句型；自我檢查可使用回到原文、代回、估算、改變例子、比較證據或重新畫圖等方式，依科目選擇。`,
    explanation: '能指出常見錯誤並設計檢查方式，代表你開始具有監控自己學習的能力。',
  }
  questions.push(responseOne, responseTwo, responseThree)
  return questions
}

function resolveUnit(unitId: string): UnitContext | null {
  const match = /^g(\d+)-(chinese|english|math|science|social)-s([12])-u(\d+)$/.exec(unitId)
  if (!match) return null
  const grade = Number(match[1])
  const subject = match[2] as CurriculumSubjectId
  const semester = Number(match[3]) as 1 | 2
  const unitIndex = Number(match[4]) - 1
  const track = getCurriculumTrack(grade, subject)
  if (!track) return null
  const semesterPlan = track.semesters.find((item) => item.semester === semester)
  const unit = semesterPlan?.units[unitIndex]
  if (!unit || unit.id !== unitId) return null
  return { grade, subject, semester, unitIndex, unit }
}

function buildFoundationUnit(context: UnitContext): FoundationUnitContent {
  const concepts = buildConcepts(context)
  const workedExample = workedExampleFor(context, concepts)
  const questions = buildQuestions(context, concepts)
  return {
    grade: context.grade,
    subject: context.subject,
    unitId: context.unit.id,
    reviewStatus: 'foundation',
    researchBasis: [
      '十二年國民基本教育課程綱要領域方向',
      `${gradeStage(context.grade)} ${SUBJECT_NAME[context.subject]} Bubble Space 課程藍圖`,
      '公開教育平台與教師課程資源僅用於章節粒度、教學節奏與常見卡點參考；教材文字與題目由 Bubble Space 另行撰寫',
    ],
    overview: `這是「${context.unit.title}」的基礎教材層。學習範圍是：${context.unit.focus}。這一層的目標是先讓所有年級、所有科目都有可閱讀、可示範、可練習的內容；它不取代後續逐題人工審閱。`,
    concepts,
    workedExamples: [workedExample],
    questions,
    takeaway: concepts.slice(0, 5).map((concept) => concept.title),
  }
}

const CACHE = new Map<string, FoundationUnitContent | null>()

export function getFoundationUnitContent(unitId: string): FoundationUnitContent | null {
  if (CACHE.has(unitId)) return CACHE.get(unitId) ?? null
  const context = resolveUnit(unitId)
  const content = context ? buildFoundationUnit(context) : null
  CACHE.set(unitId, content)
  return content
}

export function hasFoundationUnitContent(unitId: string) {
  return Boolean(getFoundationUnitContent(unitId))
}
