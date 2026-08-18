import { hashV20, intV20, taskV20, type V20SemanticTask } from './curriculum-v20-semantic-task'

const inSet = (title: string, values: string[]) => values.includes(title)
const seed = (unitId: string, index: number, suffix = '') => `${unitId}:${index}:${suffix}`

const CHINESE_WORD = ['注音與聲韻','識字與字形','字詞運用','部件與字詞','詞語與語感','詞語、成語與語境','字音字形整合','語文基礎與工具']
const CHINESE_SENTENCE = ['完整句子','句型與標點','修辭初探','修辭與語法']
const CHINESE_NARRATIVE = ['故事的順序','人物與情節','敘事文入門','記敘與描寫','敘事與描寫','現代散文','現代小說','現代文學閱讀','文學閱讀整合','文學流變']
const CHINESE_INFO = ['段落主旨','段落組織','說明短文','說明文入門','資訊與說明','篇章結構','閱讀理解','國中閱讀銜接','深度閱讀']
const CHINESE_CLASSIC = ['文言啟蒙','古典文本初探','文言文基礎','文言文進階','文言文整合','古典散文','古文與思想','文化經典','經典整合閱讀']
const CHINESE_POETRY = ['詩歌與童詩','詩詞賞析','古典詩詞','詩詞曲閱讀','詩歌與意象','新詩與多元文本']
const CHINESE_ARGUMENT = ['論說入門','說明與論說','論說閱讀','論說與媒體文本','論證與思辨','論述與資訊閱讀','公共議題閱讀','學術與公共論述']
const CHINESE_CROSS = ['跨文本閱讀','跨文本統整','跨文本與圖表','文學與社會']
const CHINESE_WRITING = ['口語表達','圖文寫話','日記與書信','短文寫作','作文修訂','多文體寫作','作文結構','寫作深化','寫作與表達','高中寫作基礎','議論寫作','專題表達','國中素養統整','語文素養統整']

export function getV20ChineseSemanticTask(unitId: string, title: string, focus: string, index: number): V20SemanticTask {
  if (inSet(title, CHINESE_WORD)) {
    const cases = [
      taskV20('句子：「他做事一向很『謹慎』，會先確認資料再下結論。」','依語境，「謹慎」最接近哪個意思？','小心仔細',['急躁衝動','毫不在意','只求速度'],'上下文的「先確認資料再下結論」支持「小心仔細」的意思。'),
      taskV20('查字典時看到「好」在「好人」讀 ㄏㄠˇ，在「愛好」讀 ㄏㄠˋ。','這個例子最能說明什麼？','同一個字可能因詞義與語境有不同讀音',['只看字形就能決定所有讀音','聲調不影響讀音','每個字永遠只有一個讀音'],'讀音要連同詞語與語境判斷，不能只看單一字形。'),
      taskV20('句子：「山路崎嶇，大家走得很慢。」','若不確定「崎嶇」的讀音與意思，哪個工具最適合先查？','字典或可靠辭典',['只看同學表情','任意猜一個讀音','只按字的筆畫多寡決定意思'],'工具書能提供讀音、字義與例詞；查到後仍要回到句子確認適切義項。'),
    ]
    return cases[index % cases.length]
  }
  if (inSet(title, CHINESE_SENTENCE)) {
    if (title.includes('修辭')) {
      const cases = [
        taskV20('句子：「風在窗外唱著歌。」','這句主要使用哪一種修辭？','擬人',['排比','設問','引用'],'把「風」寫成會「唱歌」的人，屬於擬人。'),
        taskV20('句子：「湖面像一面閃亮的鏡子。」','這句主要使用哪一種修辭？','譬喻',['誇飾','反問','對偶'],'用「像」把湖面比作鏡子，形成明喻。'),
        taskV20('句子：「我們要讀書、要思考、要行動。」','連續使用相近結構的語句，主要形成哪種效果？','排比',['擬人','引用','轉品'],'相近句法連續排列，可加強節奏與語勢。'),
      ]
      return cases[index % cases.length]
    }
    const cases = [
      taskV20('原句：「下雨了我們帶著雨傘出門」','哪一種標點最能讓句意清楚？','下雨了，我們帶著雨傘出門。',['下雨了？我們帶著雨傘出門！','下雨了我們，帶著雨傘出門','下雨了；？我們帶著雨傘出門'],'逗號分開相關分句，句末用句號結束陳述。'),
      taskV20('詞語：「小明／在操場／踢球」。','哪一句是完整且語序自然的句子？','小明在操場踢球。',['在操場小明。','踢球在。','小明操場。'],'完整句要能清楚表達人物、地點與動作的關係。'),
      taskV20('句子：「因為雨下得很大，所以比賽延期。」','「因為……所以……」主要表示哪種關係？','因果',['並列','轉折','選擇'],'前半說明原因，後半說明結果。'),
    ]
    return cases[index % cases.length]
  }
  if (inSet(title, CHINESE_NARRATIVE)) {
    const advanced = ['現代散文','現代小說','現代文學閱讀','文學閱讀整合','文學流變'].includes(title)
    const cases = advanced ? [
      taskV20('短文：「他把未寄出的信又折回口袋。月台上的廣播響了第三次，他仍沒有上車。」','哪個細節最能表現人物的猶豫？','廣播響了第三次，他仍沒有上車',['信紙是白色的','月台有廣播','車站可以搭車'],'「多次廣播仍不上車」呈現行動延宕，直接支持人物猶豫。'),
      taskV20('短文先寫童年在河邊玩耍，再轉到多年後返鄉看到河岸改建。','這種時間安排最可能產生什麼效果？','用今昔對照凸顯記憶與環境變化',['證明兩段時間完全相同','讓事件失去任何先後','只為增加字數'],'跨時間敘事可形成今昔對照，深化主題與情感。'),
      taskV20('小說中同一事件先由甲敘述，再由乙敘述，兩人對原因的理解不同。','閱讀時最重要的做法是什麼？','比較不同敘事觀點掌握資訊差異與人物立場',['直接認定第一個說法一定是真相','忽略敘事者身分','把兩種觀點混成同一句'],'多視角敘事的意義在資訊與立場差異，需分開比較。'),
    ] : [
      taskV20('短文：「小安忘了帶水壺，走到校門才想起來。他先打電話告訴家人，再向老師借杯子裝水。」','哪一項最能概括事件發展？','小安發現忘帶水壺後想辦法解決喝水問題',['小安一整天都沒有喝水','老師禁止小安喝水','家人立刻把水壺送到教室'],'摘要要保留「問題—處理」的主要事件，不能加入文中沒有的結果。'),
      taskV20('故事依序寫：「找到受傷小鳥 → 打電話詢問救傷單位 → 按指示安置 → 專業人員接手」。','哪一項最適合當作故事順序的核心？','從發現問題到尋求適當協助',['小鳥的顏色','電話的品牌','每個人都一定會遇到小鳥'],'事件順序要抓住主要行動與結果。'),
      taskV20('句子：「她握緊雨傘，站在門口望了很久，最後才跨出第一步。」','哪個描寫最能呈現人物心情可能不安？','握緊雨傘、望了很久才跨步',['門口有一把雨傘','她最後出門','句子有逗號'],'動作細節可以間接呈現人物心理。'),
    ]
    return cases[index % cases.length]
  }
  if (inSet(title, CHINESE_INFO)) {
    const cases = [
      taskV20('資料：「校園雨水回收系統先收集屋頂雨水，再經過濾後用於澆灌。」','哪個敘述是資料直接支持的？','回收的雨水經處理後可用於澆灌',['雨水可以直接飲用','系統完全不需要過濾','所有用水都來自雨水'],'題幹明確說明「過濾後用於澆灌」，其他選項超出資料。'),
      taskV20('段落先說「睡眠有助記憶整理」，接著列出兩項研究觀察與一個生活例子。','哪一句最可能是段落主旨？','睡眠有助記憶整理',['研究有兩項觀察','生活中有人睡覺','例子一定能證明所有情況'],'主旨是統攝後面例證的中心意思。'),
      taskV20('說明文依序寫「材料準備 → 操作步驟 → 注意事項 → 完成後檢查」。','這篇文章主要使用哪種組織方式？','步驟順序',['空間遠近','人物對話','倒敘回憶'],'操作說明常依程序先後安排資訊。'),
    ]
    return cases[index % cases.length]
  }
  if (inSet(title, CHINESE_CLASSIC)) {
    const cases = [
      taskV20('句子：「學而時習之，不亦說乎？」','依句意，這句最強調哪個學習態度？','學習後持續溫習與實踐',['只在考前背誦','完全不需要練習','學過一次就不用再碰'],'「時習」指經常溫習、實踐所學。'),
      taskV20('句子：「三人行，必有我師焉。」','這句較接近哪個意思？','和別人相處時，總有值得自己學習之處',['三個人一定要選一位老師','只有年長者能當老師','學習只能在教室發生'],'「必有我師」強調從他人長處與經驗中學習。'),
      taskV20('古文句：「知之為知之，不知為不知，是知也。」','這句主要肯定哪種態度？','誠實面對自己知道與不知道的範圍',['不知道時應假裝知道','知識越多越可以忽略證據','只要自信就等於理解'],'句意強調如實辨認知與不知，是求知的重要態度。'),
    ]
    return cases[index % cases.length]
  }
  if (inSet(title, CHINESE_POETRY)) {
    const cases = [
      taskV20('詩句：「床前明月光，疑是地上霜。」','這兩句最鮮明的核心意象是什麼？','月光與霜白的視覺聯想',['喧鬧市場','炎熱正午','急促戰鼓'],'明亮月光被聯想到地上白霜，形成清冷的視覺意象。'),
      taskV20('短詩反覆出現「風」「遠方」「未寄出的信」三個意象。','閱讀時哪個做法最有助理解情感？','觀察意象在前後文的關聯與重複變化',['只查每個字的筆畫','把任何風都固定解成同一意思','忽略整首詩只看標點'],'詩意常由意象之間的關聯、重複與轉折共同形成。'),
      taskV20('詩句前兩行節奏短促，後兩行句子拉長並轉為沉靜。','這種形式變化可能產生什麼效果？','節奏改變可呼應情緒或場景轉折',['證明詩沒有情感','節奏與閱讀感受完全無關','句子變長只表示錯字更多'],'詩歌形式、節奏與語氣常共同參與情感表現。'),
    ]
    return cases[index % cases.length]
  }
  if (inSet(title, CHINESE_ARGUMENT)) {
    const cases = [
      taskV20('主張：「學校應增加樹蔭空間。」證據甲：「三個夏日量測點中，有樹蔭處中午地表溫度都較低。」','哪個做法最能讓論證更完整？','說明量測條件並補充更多時段或地點資料',['把三個點直接說成全世界都一樣','刪掉量測方法','只重複主張不談證據'],'論證需要可追蹤的證據與適當外推範圍。'),
      taskV20('文章主張延後校園熄燈時間能增加夜間安全，但只引用一位學生的感受。','這個論證最需要補強什麼？','更多與安全結果直接相關的資料與不同使用者觀點',['把同一句主張重複三次','刪除資料來源','只增加形容詞'],'單一感受不足以支持普遍效果，需要更直接且多元的證據。'),
      taskV20('一篇評論先呈現支持方案的理由，再提出反方疑慮並回應。','這種安排最主要的論證功能是什麼？','處理可能的反對意見，使主張更完整',['證明反方一定無知','讓文章不需要證據','把所有立場說成一樣'],'回應反方能檢驗主張是否考慮限制與替代解釋。'),
    ]
    return cases[index % cases.length]
  }
  if (inSet(title, CHINESE_CROSS)) {
    const cases = [
      taskV20('文本甲主張增加公共自行車站點；文本乙提醒熱門站點尖峰時段常缺車。','整合兩文後，哪個結論最合理？','擴充站點時也要考慮尖峰調度',['兩文完全互相否定','只要設站就不可能缺車','乙文證明公共自行車沒有價值'],'整合要同時保留甲的擴充主張與乙的調度限制。'),
      taskV20('文字資料說某河川近十年整治；圖表顯示其中五年水質指標改善，但另五年變化不大。','哪個整合判斷較謹慎？','整治期間部分年份改善，但不能只憑這張圖宣稱每年都持續變好',['十年每年一定都改善','圖表與文字完全無關','只要有整治就不需看數據'],'跨文本整合要同時保留文字脈絡與圖表實際趨勢。'),
      taskV20('兩篇文章談同一歷史建築：甲重視保存文化記憶，乙重視無障礙與安全改造。','比較兩文時最適合先做什麼？','分別找出各自主張、證據與關注面向',['把兩篇合成同一立場','只比較篇幅長短','先決定哪篇作者比較好'],'跨文本比較先辨識各自問題意識與證據，再評估可否整合。'),
    ]
    return cases[index % cases.length]
  }
  if (inSet(title, CHINESE_WRITING)) {
    const advanced = ['高中寫作基礎','議論寫作','專題表達','語文素養統整'].includes(title)
    const cases = advanced ? [
      taskV20('題目：「公共空間是否應全面禁止一次性餐具？」資料提供垃圾量趨勢與兩種政策方案。','哪種寫作規劃最完整？','先界定立場，再引用資料提出理由、處理反方疑慮並形成結論',['只寫一句「我覺得」','把資料全部抄一遍不解釋','只列標題沒有論證'],'議論寫作需有明確主張、證據、推論與對限制的處理。'),
      taskV20('準備一場 5 分鐘專題簡報，資料來源包含訪談、統計圖與官方說明。','哪個組織方式最合適？','問題 → 方法與來源 → 主要發現 → 限制 → 結論與建議',['依檔名順序逐一念資料','只放圖片不說來源','先下結論再省略研究方法'],'專題表達要讓聽者追蹤問題、證據、推論與限制。'),
      taskV20('文章初稿有明確主張，但第二段例子和主張關聯很弱。','修訂時優先怎麼做？','說明例子如何支持主張，若無法支持就替換或刪除',['只把字體變大','增加無關形容詞','保留所有內容因為已經寫完'],'修訂重點是內容與論證關係，而不只是表面形式。'),
    ] : [
      taskV20('題目要寫「一次我學會負責的經驗」。','哪個寫作安排最合適？','交代事情背景，再寫自己的選擇、結果與反思',['只列十個形容詞','完全不寫事件只下結論','把三件無關事情混在一起'],'敘寫經驗需要事件脈絡、行動、結果與反思。'),
      taskV20('要寫一封信邀請同學參加班級活動。','哪項內容最不能缺少？','活動時間、地點與邀請目的',['只寫自己的名字十次','完全不說要做什麼','只寫一個表情符號'],'實用書信要讓收信人知道目的與必要資訊。'),
      taskV20('口頭報告主題是「我推薦的一本書」。','哪個順序較清楚？','先介紹書名與主題，再說推薦理由與具體例子',['想到什麼就跳著說','只念書名不說理由','先講結尾再省略內容'],'有組織的表達能讓聽者清楚掌握主題與支持理由。'),
    ]
    return cases[index % cases.length]
  }
  return taskV20(`本單元「${title}」的學習焦點是：${focus}`,'閱讀或表達時，哪種做法最能形成可檢查的語文判斷？','回到完整文本與語境，指出具體線索後再說明解讀',['只看一個熟字就猜全文','忽略前後文直接套答案','把個人印象當成文本證據'],'語文判斷要由可指出的文本線索支持，並保留語境與篇章關係。')
}

const ENGLISH_PHONICS = ['英語啟蒙：聲音與節奏','字母初探','字母與字母音','字母、拼讀與高頻字']
const ENGLISH_GREETING = ['生活招呼','簡單問答','口語小對話','自我介紹與招呼','疑問詞與生活對話']
const ENGLISH_VOCAB = ['顏色與數字','生活單字','教室與家庭','學校與生活','字彙與語境','主題字彙與搭配詞']
const ENGLISH_CLASSROOM = ['教室英語','動作與指令']
const ENGLISH_READING = ['圖片閱讀','短句閱讀與書寫','短文閱讀','閱讀策略','段落閱讀策略','進階閱讀策略','長文與圖表閱讀','學術閱讀','論述閱讀','多文本整合']
const ENGLISH_WRITING = ['段落閱讀與寫作','段落寫作','英文寫作深化','議論寫作','綜合語言任務']
const ENGLISH_LISTEN = ['聽說小任務','聽力與筆記','聽說整合','口語簡報']

export function getV20EnglishSemanticTask(unitId: string, title: string, focus: string, index: number): V20SemanticTask {
  const name = ['Amy','Ben','Cindy','David'][hashV20(seed(unitId,index)) % 4]
  if (inSet(title, ENGLISH_PHONICS)) {
    if (title === '字母初探') return taskV20('Look at the lowercase letter “b”.','Which uppercase letter matches it?','B',['D','P','R'],'The uppercase form of b is B.')
    const cases = [
      taskV20('The word “map” begins with the letter m.','Which beginning sound matches “map”?','/m/',['/s/','/t/','/f/'],'The letter m represents /m/ in “map.”'),
      taskV20('The words “cat” and “cap” begin with the same letter.','Which beginning sound do they share?','/k/',['/m/','/s/','/p/'],'In these words, c represents the /k/ sound.'),
      taskV20('Listen to the rhythm: “clap, clap, stop.” The class repeats it.','What skill is mainly practiced?','Noticing and reproducing English sound and rhythm',['Solving a math equation','Reading a long academic essay','Changing a verb into passive voice'],'Early sound work develops attention to spoken patterns before formal grammar analysis.'),
    ]
    return cases[index % cases.length]
  }
  if (inSet(title, ENGLISH_GREETING)) {
    const cases = [
      taskV20(`${name} meets a new classmate. The classmate asks, “What is your name?”`,'Which reply is natural?',`My name is ${name}.`,['I am at seven o’clock.','Because my name.','The pencil is blue yesterday.'],'The question asks for a name, so “My name is …” answers directly.'),
      taskV20(`A classmate says, “How are you, ${name}?”`,'Which reply fits the greeting?','I’m fine, thank you.',['I am three pencils.','At Monday yesterday.','Because the desk.'],'“How are you?” asks about condition or feeling, so a short wellbeing reply is appropriate.'),
      taskV20(`${name} wants to know where the library is.`,'Which question is correct?','Where is the library?',['Who library is?','When the library blue?','How many is library yesterday?'],'“Where” asks about location, and the be verb follows the question word.'),
    ]
    return cases[index % cases.length]
  }
  if (inSet(title, ENGLISH_VOCAB)) {
    if (title === '顏色與數字') return taskV20('There are three red balls and two blue balls.','How many balls are there in all?','five',['two','three','seven'],'Three plus two is five; the color words identify the groups.')
    if (title === '生活單字') {
      const cases = [
        taskV20('Picture labels: mother, father, sister, brother.','Which word names a female sibling?','sister',['father','brother','desk'],'“Sister” means a female sibling.'),
        taskV20('On the desk are a pencil, an eraser, and a book.','Which word names something used to write?','pencil',['book','eraser','window'],'A pencil is used for writing.'),
        taskV20('The sentence says, “I go to school in the morning.”','Which word names the place?','school',['morning','go','I'],'“School” is the place named in the sentence.'),
      ]
      return cases[index % cases.length]
    }
    if (title === '主題字彙與搭配詞') return taskV20('Sentence: “The committee reached a decision after reviewing the evidence.”','Which word naturally completes “reach a ___”?','decision',['rain','quickly','blue'],'“Reach a decision” is a standard collocation in formal English.')
    if (title === '字彙與語境') return taskV20('Sentence: “The medicine was effective; the patient’s fever fell within two hours.”','What does “effective” most nearly mean here?','successful in producing the intended result',['very expensive','difficult to pronounce','brightly colored'],'The following result—fever falling—shows that the medicine worked.')
    const cases = [
      taskV20(`At school, ${name} has a notebook, a ruler, and a pencil.`,'Which item is mainly used to measure length?','ruler',['notebook','pencil','backpack'],'A ruler is used to measure length.'),
      taskV20(`${name} says, “I play badminton after school.”`,'Which word names the activity?','badminton',['school','after','I'],'“Badminton” is the activity named in the sentence.'),
    ]
    return cases[index % cases.length]
  }
  if (inSet(title, ENGLISH_CLASSROOM)) {
    const cases = [
      taskV20('The teacher says, “Please close the door.”','What should the student do?','Close the door.',['Open a book.','Write the word door.','Leave the classroom.'],'The imperative directly tells the listener to close the door.'),
      taskV20('The teacher says, “Stand up, please.”','Which action matches the instruction?','Get out of the chair and stand.',['Sit down.','Open a window.','Write your name.'],'“Stand up” is a classroom action instruction.'),
      taskV20('The teacher says, “Listen and repeat.”','What should students do?','Hear the model and say it again.',['Read silently only.','Leave the room.','Draw a map.'],'The two verbs tell students to listen first and then repeat.'),
    ]
    return cases[index % cases.length]
  }
  if (title === '數字、時間與日期') return taskV20('The digital clock shows 7:30 on Monday.','Which phrase matches the time?','seven thirty',['thirty seven','seven thirteen','half seven hours'],'7:30 is read “seven thirty.”')
  if (title === 'Be 動詞與基本句型' || title === '簡單句與問句') {
    const subject = index % 2 ? 'They' : name, correct = subject === 'They' ? 'are' : 'is'
    return taskV20(`${subject} ___ ready for class now.`,`Choose the correct form of be for “${subject}”.`,correct,['am',correct==='are'?'is':'are','beed'],`Use “${correct}” with “${subject}”.`)
  }
  if (title === '日常作息' || title === '現在式問答' || title === '現在簡單式') return taskV20(`${name} goes to the library every Saturday.`,'Which sentence correctly describes the repeated habit?',`${name} goes to the library every Saturday.`,[`${name} going to the library every Saturday.`,`${name} went tomorrow every Saturday.`,`${name} go to the library every Saturday.`],'A repeated habit uses the simple present; a singular third-person subject takes -s/-es.')
  if (title === '現在進行式') return taskV20(`Right now, ${name} has a book open and is looking at the page.`,'Which sentence describes the action now?',`${name} is reading.`,[`${name} reads yesterday.`,`${name} reading is.`,`${name} was read now.`],'Use be + V-ing for an action in progress now.')
  if (title === '過去進行與事件敘述') return taskV20(`At 8 p.m. yesterday, ${name} was in the middle of reading when the phone rang.`,'Which sentence describes the background action?',`${name} was reading.`,[`${name} is reading tomorrow.`,`${name} read when tomorrow.`,`${name} was read.`],'Past continuous uses was/were + V-ing for an action in progress at a past time.')
  if (title === '過去事件初探' || title === '過去簡單式') return taskV20(`Yesterday, ${name} visited a museum.`,'Which sentence correctly reports the event?',`${name} visited a museum yesterday.`,[`${name} visits a museum yesterday.`,`${name} will visited yesterday.`,`${name} visiting yesterday.`],'“Yesterday” signals a completed past event, so use the simple past.')
  if (title === '未來計畫' || title === '未來與計畫') return taskV20(`${name} has a plan for tonight.`,'Which sentence expresses the plan?',`${name} is going to study tonight.`,[`${name} studied tonight tomorrow.`,`${name} going study tonight.`,`${name} studies yesterday tonight.`],'Be going to + base verb can express a plan.')
  if (title === '興趣與能力' || title === '命令句與情態動詞') return taskV20(`${name} wants to ask politely for permission to use a pencil.`,'Which sentence is appropriate?','Can I use your pencil, please?',['I can your pencil use.','Must I used your pencil yesterday?','Your pencil can I using.'],'A modal is followed by the base verb; “Can I…?” is a common permission request.')
  if (title === '不定詞與動名詞') return taskV20(`${name} enjoys ___ books after school.`,'Choose the correct form.','reading',['to readed','read to','reads'],'“Enjoy” is commonly followed by a gerund: enjoy reading.')
  if (title === '比較與描述' || title === '比較級與最高級') return taskV20('Bag A weighs 4 kg; Bag B weighs 7 kg.','Which comparison is correct?','Bag B is heavier than Bag A.',['Bag B is heavy than Bag A.','Bag A is more heavy Bag B.','Bag B heavier Bag A is.'],'Use the comparative “heavier than.”')
  if (title === '連接詞與複句') return taskV20(`${name} stayed inside because it was raining heavily.`,'Which part gives the reason?','because it was raining heavily',['stayed inside tomorrow','because stayed is','heavily was inside'],'A clause introduced by “because” gives a reason.')
  if (title === '完成式概念') return taskV20(`${name}'s homework is complete now.`,'Which sentence correctly uses present perfect?',`${name} has finished the homework.`,[`${name} have finish the homework.`,`${name} has finish the homework.`,`${name} finished has the homework.`],'Singular subject + has + past participle forms the present perfect.')
  if (title === '關係子句') return taskV20('Combine: “The student won the race.” “The student is my friend.”','Which sentence is correct?','The student who won the race is my friend.',['The student which won the race is my friend.','The student who win the race my friend.','Who the student won is my friend.'],'Use “who” for a person functioning as the subject of a relative clause.')
  if (title === '被動語態') return taskV20('A ball broke the window; the focus is the window.','Which passive sentence is correct?','The window was broken by the ball.',['The window broke by the ball.','The ball was broke the window.','The window was break.'],'Past passive uses was/were + past participle.')
  if (title === '條件與推論') return taskV20('Tomorrow’s plan depends on the weather.','Which first conditional is correct?','If it rains, we will stay inside.',['If it will rain, we stayed inside.','If it rains, we stayed yesterday.','If rains it, we will inside stay.'],'A common first conditional uses if + present, will + base verb.')
  if (title === '地點與方向' || title === '旅行與交通') return taskV20('The library is next to the bank.','Where is the library?','It is next to the bank.',['It is yesterday.','It is seven kilograms.','It is more happy.'],'“Next to” describes location.')
  if (title === '食物與購物') return taskV20(`${name} wants to buy two apples.`,'Which request is clear and polite?','I would like two apples, please.',['I am apple two please.','Two apples yesterday heavy.','Where apples was two?'],'“I would like …, please” clearly expresses a polite purchase request.')
  if (title === '天氣與服裝') return taskV20('It is cold and raining outside.','Which choice fits the weather?','I should wear a raincoat and a warm jacket.',['I should wear sandals because it is hot.','Yesterday wears the weather.','A jacket is seven o’clock.'],'The clothing choice matches both rain and low temperature.')
  if (title === '健康與生活') return taskV20(`${name} has a fever and feels tired.`,'Which advice is appropriate?','You should rest and tell an adult.',['You should run a race immediately.','You are fever yesterday.','The fever is under the desk.'],'Should + base verb gives advice; rest and telling an adult fit the health context.')
  if (title === '時態與時間線索' || title === '句型與時態統整') {
    const cases = [
      taskV20('Sentence: “I finished the report yesterday.”','Which time clue supports the simple past?','yesterday',['finished','report','I'],'“Yesterday” places the event in a completed past time.'),
      taskV20('Sentence: “She has lived here for three years.”','What does “for three years” help express?','a duration continuing to the present',['a completed action at one exact past time only','a future command','a location preposition'],'With present perfect, “for + duration” can connect a past start with the present.'),
      taskV20('Sentence: “By next Friday, the team will have finished the draft.”','Which time relationship is expressed?','completion before a specified future time',['a habit repeated every Friday','a past action with no future reference','an action happening only now'],'Future perfect locates expected completion before a later future reference point.'),
    ]
    return cases[index % cases.length]
  }
  if (title === '句型整合' || title === '國中英語銜接' || title === '國中英語統整' || title === '複雜句與篇章') return taskV20(`${name} stayed home because the rain was heavy, although the event continued online.`,'Which clause expresses contrast?','although the event continued online',['because the rain was heavy',`${name} stayed home`,'the rain was heavy'],'“Although” introduces the contrasting information.')
  if (inSet(title, ENGLISH_READING)) {
    const advanced = ['進階閱讀策略','長文與圖表閱讀','學術閱讀','論述閱讀','多文本整合'].includes(title)
    const cases = advanced ? [
      taskV20('Passage A argues that remote work cuts commuting emissions. Passage B notes that home energy use and data centers also consume energy.','Which synthesis is best supported?','Remote work can reduce some commuting emissions, but its total environmental effect depends on other energy use too.',['Remote work always has zero emissions.','The two passages completely contradict each other.','Data centers prove commuting has no emissions.'],'A strong synthesis preserves both the reduction identified in A and the additional costs identified in B.'),
      taskV20('A report says a treatment group improved more than a comparison group, but participants were not randomly assigned.','What is the most important limitation?','The design may contain selection differences that weaken causal inference.',['Any improvement proves the treatment caused everything.','Random assignment is never relevant.','A comparison group makes all bias impossible.'],'Without random assignment, preexisting group differences can contribute to the observed effect.'),
      taskV20('Paragraph: “Cities often publish open data to support transparency. Yet raw datasets can still be difficult to interpret without definitions, missing-value notes, and context.”','What is the author’s main point?','Open data is useful, but meaningful interpretation still requires metadata and context.',['Open data should never be published.','Metadata always makes data false.','Raw numbers explain themselves completely.'],'The contrast introduced by “Yet” limits a simple claim that publication alone guarantees understanding.'),
    ] : [
      taskV20('Passage: “Mina joined a garden project to learn how food grows. After three months, she could explain why sunlight and regular watering mattered.”','What is the main idea?','Mina learned about growing plants through the garden project.',['Mina stopped watering plants.','The passage is mainly about school exams.','Sunlight is never needed by plants.'],'The details consistently describe Mina learning about plant growth through the project.'),
      taskV20(`${name} has soccer practice at 4 p.m. and piano class at 6 p.m. on Tuesday.`,'Which event happens first?','soccer practice',['piano class','both at the same time','neither event'],'4 p.m. comes before 6 p.m.'),
      taskV20('Short text: “The bus was late, so Leo called his teacher before class started.”','Why did Leo call the teacher?','Because the bus was late.',['Because class was canceled.','Because he lost his phone.','Because the teacher missed the bus.'],'“So” links the late bus to Leo’s decision to call.'),
    ]
    return cases[index % cases.length]
  }
  if (inSet(title, ENGLISH_WRITING)) {
    const advanced = ['英文寫作深化','議論寫作','綜合語言任務'].includes(title)
    const cases = advanced ? [
      taskV20('An essay argues that schools should reduce food waste and has survey data plus two examples.','Which thesis is strongest?','Schools should reduce food waste through measurable cafeteria changes and student participation.',['Food is important.','Yesterday lunch was tasty.','All waste can disappear instantly.'],'A strong thesis states a defensible claim that the available evidence can develop.'),
      taskV20('A paragraph includes a claim, evidence, and explanation, but no sentence connects the evidence back to the claim.','What revision is most useful?','Add reasoning that explains how the evidence supports the claim.',['Add unrelated adjectives.','Repeat the title three times.','Delete the evidence.'],'Academic writing needs the reasoning link between evidence and claim.'),
    ] : [
      taskV20('A paragraph is about a favorite school activity.','Which topic sentence is clearest?','My favorite school activity is the science club because I can build and test ideas.',['Science club yesterday table.','Favorite is because.','There are many words in school.'],'A topic sentence names the subject and gives a direction for supporting details.'),
      taskV20('A short paragraph tells what happened on a class trip.','Which order is easiest to follow?','Use time order from the beginning of the trip to the end.',['Mix every event randomly.','Write only the last word of each event.','Remove all time clues.'],'A simple narrative is easier to follow when events are ordered in time.'),
    ]
    return cases[index % cases.length]
  }
  if (inSet(title, ENGLISH_LISTEN)) {
    const advanced = ['聽力與筆記','聽說整合','口語簡報'].includes(title)
    return advanced
      ? taskV20('Speaker: “Our club meeting moves from Tuesday to Thursday at 4 p.m. in Room 203; members should bring the revised proposal.”','Which note captures the essential information?','Thursday, 4 p.m., Room 203; bring the revised proposal',['Tuesday, time unknown','Room 203 closes forever','The speaker dislikes proposals'],'Effective notes preserve the changed time/place plus the required action without adding unsupported claims.')
      : taskV20('Speaker: “Please point to the blue circle.”','Which action matches the spoken instruction?','Point to the blue circle.',['Point to a red square.','Close every book.','Say yesterday twice.'],'The key words “point,” “blue,” and “circle” identify the action and target.')
  }
  if (title === '環境與世界') return taskV20('A short text explains that students reduced single-use cups by carrying reusable bottles for one month.','What is the main idea?','Students changed one daily habit to reduce waste.',['Reusable bottles increase all waste.','The text is mainly about exam scores.','One month proves every environmental policy works.'],'The details support a main idea about a practical waste-reduction habit, not a universal claim.')
  if (title === '跨文化溝通') return taskV20(`${name} is unsure whether every family follows the same local custom.`,'Which response is responsible?','I can share what I know, but we should check reliable local guidance too.',['My experience represents everyone.','All customs are identical everywhere.','We should guess and state it as fact.'],'Cross-cultural communication should avoid overgeneralization and verify uncertainty.')
  if (title === '升學與自主學習銜接') return taskV20('A student notices that reading vocabulary lists alone does not improve listening comprehension.','Which self-study plan is most evidence-based?','Set a specific listening goal, practice with level-appropriate audio, check comprehension, and adjust the strategy',['Repeat the same ineffective routine without checking progress','Only collect more app icons','Avoid any feedback or reflection'],'Autonomous learning works best when goals, practice, evidence of progress, and strategy adjustment are connected.')
  return taskV20(`Unit: “${title}”. Learning focus: ${focus}`,'Which response best shows careful language use?','Use the complete context, meaning and form before choosing or producing the expression.',['Choose only by the first familiar word.','Ignore word order and time clues.','Use a form from an unrelated sentence.'],`The answer must fit the full context of “${title}”.`)
}
