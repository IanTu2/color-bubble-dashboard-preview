import type { ReviewedConcept, ReviewedQuestion, ReviewedWorkedExample } from './curriculum-reviewed-social10'

export type Chinese7TextbookSupplement = {
  unitId: string
  scopeCodes: string[]
  misconceptionConcepts: ReviewedConcept[]
  workedExamples: ReviewedWorkedExample[]
  questions: ReviewedQuestion[]
}

const SUPPLEMENTS: Chinese7TextbookSupplement[] = [
  {
    unitId: 'g7-chinese-s1-u1',
    scopeCodes: ['Ab-Ⅳ-1～7', 'Ac-Ⅳ-1～3', '5-Ⅳ-2～4', '5-Ⅳ-6'],
    misconceptionConcepts: [
      { title: '常見迷思｜查到辭典第一個義項不代表就是本文詞義', explanation: '多義詞必須回到句子與段落判斷。辭典提供可能義項，語境才決定哪一個義項能和前後文共同成立。', example: '「他把門關上」與「這件事與我有關」的「關」不能用同一義項解釋。' },
      { title: '常見迷思｜標點不是停頓符號而已', explanation: '逗號、分號、冒號、破折號、問號等會改變句子關係、語氣與資訊層次。讀文章時要問「如果換一個標點，意思或語氣會不會改變」。' },
    ],
    workedExamples: [{
      title: '用語境判斷「沉」的意思',
      context: '自寫短文：放學後，走廊慢慢安靜下來。小杰把書包往肩上一甩，卻覺得今天的書包特別「沉」。他站在教室門口，又回頭看了看桌上那張沒交出去的道歉卡。',
      prompt: '「沉」只是在說書包重量嗎？怎麼用文本證據判斷？',
      steps: ['先保留字面義：書包可能真的很重。', '再看後文出現「沒交出去的道歉卡」，人物顯然還有心事。', '因此「沉」同時能帶出身體負擔與心理壓力，形成雙層語意。', '若只查辭典「重量大」就停下來，會漏掉文本前後呼應。'],
      answer: '「沉」有書包重量的字面義，也藉後文暗示小杰的心理負擔。',
      explanation: '詞義判斷要同時看字典義、句法位置與篇章線索。',
    }],
    questions: [
      { id: 'g7-chinese-s1-u1-supp-q1', kind: 'choice', level: '理解', context: '「雨停了；操場上的人卻沒有立刻散去。」', prompt: '分號最主要在這句中表現什麼？', options: ['把兩個關係密切、但各自完整的分句分開', '表示人物正在說話', '表示句子完全結束且彼此無關', '表示後文一定是原因'], correctIndex: 0, explanation: '兩個分句意思相關且各自完整，分號比逗號更清楚標出層次。' },
      { id: 'g7-chinese-s1-u1-supp-q2', kind: 'choice', level: '應用', context: '「他一聽見消息，腳步立刻『快』了起來。」', prompt: '這裡的「快」最接近哪個意思？', options: ['速度加快', '感到高興', '接近完成', '鋒利'], correctIndex: 0, explanation: '「腳步」和「起來」提供動作速度的語境，不能因「快樂」也有快字就選情緒義。' },
      { id: 'g7-chinese-s1-u1-supp-q3', kind: 'choice', level: '應用', context: '原句：「我不是不想去，只是還沒準備好。」', prompt: '哪一個改寫最接近原意？', options: ['我有意願去，但目前準備不足', '我完全不想去，也不會準備', '我已經準備好了，所以一定會去', '我不知道去哪裡'], correctIndex: 0, explanation: '雙重否定「不是不想」保留意願，真正限制在「還沒準備好」。' },
      { id: 'g7-chinese-s1-u1-supp-q4', kind: 'response', level: '檢核', prompt: '請自寫一組兩句話，讓同一個詞在不同語境中出現不同意思，並各自解釋。', sampleAnswer: '「風把門吹開了。」的「開」是由關閉變成開啟；「會議在九點開。」的「開」是開始。前後搭配的名詞與動作情境決定詞義。', explanation: '能自己造例，表示你不只會查詞義，還能用語境區分多義詞。' },
    ],
  },
  {
    unitId: 'g7-chinese-s1-u2',
    scopeCodes: ['Ba-Ⅳ-1～2', 'Ad-Ⅳ-1～2', '5-Ⅳ-2～3', '6-Ⅳ'],
    misconceptionConcepts: [
      { title: '常見迷思｜第一人稱不等於作者本人', explanation: '敘事文本中的「我」是敘述者。除非有明確文本與背景證據，不能直接把敘述者的經歷、態度全部等同真實作者。' },
      { title: '常見迷思｜描寫越多越好', explanation: '描寫要服務人物、氣氛、情節或主題。和核心沒有關係的細節即使華麗，也可能拖慢敘事、模糊重點。' },
    ],
    workedExamples: [{
      title: '同一事件，順敘與倒敘會產生什麼差異',
      context: '版本甲：小雯先發現悠遊卡不見，沿原路尋找，最後在早餐店找到。\n版本乙：小雯握著失而復得的悠遊卡喘氣。十分鐘前，她才在公車站發現口袋空了……',
      prompt: '兩個版本的事件相同，閱讀效果為什麼不同？',
      steps: ['版本甲依事件先後順序，讀者容易清楚掌握因果與過程。', '版本乙先揭示「已找回」的結果，再回到先前事件，是倒敘。', '倒敘可以先製造問題：「她為什麼喘氣？卡怎麼失而復得？」', '選擇敘事順序要看作者想讓讀者先知道什麼，而不是哪一種永遠比較高級。'],
      answer: '順敘偏重清楚呈現過程；倒敘透過先展示結果或後來情境，能改變懸念與閱讀焦點。',
      explanation: '敘事手法要和閱讀效果一起分析。',
    }],
    questions: [
      { id: 'g7-chinese-s1-u2-supp-q1', kind: 'choice', level: '理解', context: '「門一開，他先把濕透的傘靠在牆邊，又用袖口擦了擦額頭。直到這時，大家才發現他跑得有多急。」', prompt: '這段最主要透過哪種方式表現人物急迫？', options: ['動作描寫', '議論', '定義說明', '統計數據'], correctIndex: 0, explanation: '靠傘、擦汗等連續動作讓讀者自行感受急迫。' },
      { id: 'g7-chinese-s1-u2-supp-q2', kind: 'choice', level: '應用', context: '一篇故事開頭先寫：「三年後，我才明白那天爸爸為什麼沒有回頭。」接著回到三年前。', prompt: '這個開頭最接近哪種敘事安排？', options: ['倒敘', '純順敘', '列舉', '定義'], correctIndex: 0, explanation: '先寫後來的時間點，再回到先前事件，形成倒敘。' },
      { id: 'g7-chinese-s1-u2-supp-q3', kind: 'choice', level: '應用', prompt: '若主題是「第一次獨自上台的緊張」，下列哪個細節最能服務主題？', options: ['手心一直冒汗，稿紙邊緣被捏出皺痕', '禮堂牆壁是米白色', '學校門口有三棵樹', '午餐有青菜和湯'], correctIndex: 0, explanation: '手汗與捏皺稿紙直接呈現人物緊張，其餘細節與主題關聯較弱。' },
      { id: 'g7-chinese-s1-u2-supp-q4', kind: 'response', level: '檢核', prompt: '把「他很緊張」改寫成一句不直接出現「緊張」兩字、但能讓讀者感受到緊張的描寫。', sampleAnswer: '輪到他時，他站起來又坐下，確認了兩次口袋裡的講稿，才慢慢走向台前。', explanation: '有效描寫透過可觀察的動作、語言、感官或心理細節讓情緒被看見。' },
    ],
  },
  {
    unitId: 'g7-chinese-s1-u3',
    scopeCodes: ['Ab-Ⅳ-6～7', 'Ad-Ⅳ-4', '5-Ⅳ-2～4'],
    misconceptionConcepts: [
      { title: '常見迷思｜文言文不是逐字換成現代詞就會懂', explanation: '文言常省略主語／賓語，同一字也有古今義或虛詞功能。應先斷句、辨人物與動作，再處理字詞，最後回到整段邏輯。' },
      { title: '常見迷思｜「之」永遠翻成「的」是錯的', explanation: '文言虛詞功能會依句法改變；「之」可能作代詞，也可能連結修飾關係。要看它前後接的是動作、人物還是名詞。' },
    ],
    workedExamples: [{
      title: '先斷句，再理解省略與代詞',
      context: '自寫仿古短文：「童見犬守門，欲近之。犬吠，童止步，笑曰：『汝不迎客耶？』遂退。」',
      prompt: '這段如何分人物、動作，並理解「之」「遂」？',
      steps: ['先找明確人物：童、犬。', '「欲近之」的動作者承接「童」；「之」依語境指犬。', '「犬吠」後「童止步」形成原因與反應。', '「遂退」承接童的行動，「遂」可理解為於是／就。', '翻譯時要把省略的人物補到自然的現代語句，但不能亂加原文沒有的情節。'],
      answer: '小孩看見狗守門，想靠近牠；狗叫後，小孩停下，開玩笑後就退開。「之」指狗，「遂」表示承接結果。',
      explanation: '文言閱讀先處理句法與指涉，再翻譯，比逐字替換更可靠。',
    }],
    questions: [
      { id: 'g7-chinese-s1-u3-supp-q1', kind: 'choice', level: '理解', context: '「童見鳥集於樹，止步觀之。」', prompt: '「之」最合理指什麼？', options: ['鳥集於樹的景象／鳥', '小孩自己', '道路', '時間'], correctIndex: 0, explanation: '「觀」需要觀看對象，前文最近且合理的對象是鳥集於樹的景象。' },
      { id: 'g7-chinese-s1-u3-supp-q2', kind: 'choice', level: '應用', context: '「雨甚，客乃留。」', prompt: '依上下文，「乃」最接近哪個承接意思？', options: ['於是／才', '但是', '如果', '一邊'], correctIndex: 0, explanation: '雨很大，客人於是留下，形成原因—結果承接。' },
      { id: 'g7-chinese-s1-u3-supp-q3', kind: 'choice', level: '應用', context: '「父呼兒，兒未聞。」', prompt: '哪個現代語譯最自然且沒有亂加資訊？', options: ['父親呼喚孩子，孩子沒有聽見', '父親生氣地責罵孩子，孩子故意不回答', '孩子叫父親，但父親沒聽見', '父親和孩子一起唱歌'], correctIndex: 0, explanation: '原文只提供「呼」與「未聞」，不能自行加入生氣、故意等心理。' },
      { id: 'g7-chinese-s1-u3-supp-q4', kind: 'response', level: '檢核', context: '「客至，主人喜，延之入。」', prompt: '請先說明省略了哪些主語／賓語，再翻成自然現代中文。', sampleAnswer: '「延之入」的主語是主人，「之」指客人。可譯為：「客人到了，主人很高興，便邀請他進來。」', explanation: '翻譯時補出文言省略成分，但補的是句法必要資訊，不是虛構情節。' },
    ],
  },
  {
    unitId: 'g7-chinese-s2-u1',
    scopeCodes: ['Ad-Ⅳ-3', 'Bb-Ⅳ', '5-Ⅳ-1', '5-Ⅳ-3'],
    misconceptionConcepts: [
      { title: '常見迷思｜看到「月、雨、落葉」不能直接套固定情緒', explanation: '意象的效果由搭配的動詞、聲音、時間、人物處境與全詩關係決定。同一個「月」可以是思念，也可以是寧靜、明亮或時間流逝。' },
      { title: '常見迷思｜押韻不等於詩的全部', explanation: '節奏與音韻能加強記憶與情感，但理解詩仍要處理語意、意象、視角、轉折與留白，不能只數韻腳。' },
    ],
    workedExamples: [{
      title: '從兩個意象讀出情緒變化',
      context: '自寫小詩：「晚風把操場吹得很空／最後一盞教室燈還亮著／我把沒說出口的再見／折進口袋，慢慢走過校門。」',
      prompt: '哪幾個意象共同建立離別感？',
      steps: ['「操場很空」先建立人群散去後的空間感。', '「最後一盞燈」把時間推向結束，也形成孤單焦點。', '「沒說出口的再見」把抽象遺憾變成可被「折進口袋」的具體動作。', '最後「慢慢走過校門」讓情緒以動作收束，而不是直接說「我很難過」。'],
      answer: '空操場、最後一盞燈、沒說出口的再見與慢慢離校共同形成離別與不捨。',
      explanation: '賞析要說明「文字線索如何造成感受」，不只貼一個情緒標籤。',
    }],
    questions: [
      { id: 'g7-chinese-s2-u1-supp-q1', kind: 'choice', level: '理解', context: '「雨停後，屋簷還一滴一滴，把巷子敲得很慢。」', prompt: '「敲得很慢」最主要造成什麼效果？', options: ['把雨滴聲具體化，拉長寧靜的時間感', '證明屋簷真的有手', '提供統計資料', '說明雨完全沒有聲音'], correctIndex: 0, explanation: '把聲音寫成敲擊，並用「慢」建立節奏與氛圍。' },
      { id: 'g7-chinese-s2-u1-supp-q2', kind: 'choice', level: '應用', context: '「燈全熄了，只有窗外的月還醒著。」', prompt: '這句的「醒著」較接近哪種表現？', options: ['擬人，使月亮像仍陪伴著人', '客觀科學定義', '倒敘', '列舉'], correctIndex: 0, explanation: '把「醒」這種生命狀態給月亮，是擬人，用來塑造夜晚氛圍。' },
      { id: 'g7-chinese-s2-u1-supp-q3', kind: 'choice', level: '應用', prompt: '賞析一句詩時，下列哪種說法最有證據？', options: ['「最後一盞燈」配合「很空」的場景，把人群散去後的孤單集中到一個亮點', '這首詩一定在寫作者真實失戀', '只要有月亮就一定是思鄉', '押韻所以主旨一定快樂'], correctIndex: 0, explanation: '好的賞析從文本線索推論效果，避免把固定象徵或作者生平硬套入。' },
      { id: 'g7-chinese-s2-u1-supp-q4', kind: 'response', context: '「公車駛遠後，站牌旁只剩一張被風吹動的時刻表。」', level: '檢核', prompt: '請用 2～3 句說明這個畫面可能營造的情緒，並指出至少兩個文字線索。', sampleAnswer: '可能有等待結束後的空落感。「公車駛遠」表示重要的人／事件已離開；「只剩」和「被風吹動」讓站牌顯得空，時刻表則保留一種仍在等待下一班的時間感。', explanation: '情緒判讀必須綁定具體語詞，不能只寫「很悲傷」而沒有依據。' },
    ],
  },
  {
    unitId: 'g7-chinese-s2-u2',
    scopeCodes: ['Bc-Ⅳ-1～3', 'Bd-Ⅳ', '5-Ⅳ-2～5'],
    misconceptionConcepts: [
      { title: '常見迷思｜有數字不代表論證就可靠', explanation: '數據必須看來源、時間、樣本、單位與它是否真的支持主張。把任何百分比放進文章，不會自動讓論證成立。' },
      { title: '常見迷思｜例子不是「證明所有情況」', explanation: '一個例子可以說明可能性或讓概念具體，但若主張是「所有人都……」，單一例子通常不足以證明普遍結論。' },
    ],
    workedExamples: [{
      title: '分辨說明、主張與證據',
      context: '自寫段落：「本校午休後常有大量一次性飲料杯。學生會調查三天，共記錄 620 個杯子，其中 71% 可在校內飲水機或自備杯情境下被替代。因此學生會主張先在福利社提供可重複使用杯借用制度，並試辦一個月再比較垃圾量。」',
      prompt: '段落裡哪些是資料、哪些是主張？這個論證有什麼可取與限制？',
      steps: ['620 個與 71% 是調查資料，不是主張。', '「提供借杯制度並試辦」是行動主張。', '資料和一次性杯問題有直接關聯，所以比完全沒有證據更有說服力。', '但只有三天資料，且「71% 可替代」的判定方法仍需交代；試辦後再比較能補強證據。'],
      answer: '好論證把資料與主張分開，並承認樣本與方法限制，再用後續資料檢驗方案。',
      explanation: '論說閱讀要檢查證據品質，不是只找「作者意見」。',
    }],
    questions: [
      { id: 'g7-chinese-s2-u2-supp-q1', kind: 'choice', level: '理解', context: '「蜂蜜結晶不是壞掉；葡萄糖比例、溫度等因素都會影響結晶速度。」', prompt: '這句主要在做什麼？', options: ['解釋現象與可能因素', '命令人購買蜂蜜', '敘述人物衝突', '證明所有蜂蜜味道相同'], correctIndex: 0, explanation: '它以客觀方式說明結晶現象與相關因素，屬說明功能。' },
      { id: 'g7-chinese-s2-u2-supp-q2', kind: 'choice', level: '應用', context: '主張：「學生都應該每天跑五公里。」證據：「我朋友每天跑五公里，所以成績變好。」', prompt: '這段論證最大的問題是什麼？', options: ['單一個案不足以支持「所有學生」的普遍主張，且成績變好也未證明由跑步造成', '沒有使用成語', '句子太短', '只要是朋友的例子就一定錯'], correctIndex: 0, explanation: '要檢查主張範圍、樣本與因果，而不是看文字是否漂亮。' },
      { id: 'g7-chinese-s2-u2-supp-q3', kind: 'choice', level: '應用', prompt: '下列哪個資料最能直接支持「校門口下午四點到五點行人過街等待時間偏長」？', options: ['連續多日同時段實測每位行人等待秒數與分布', '校門顏色照片', '學生最喜歡的飲料問卷', '十年前的校史'], correctIndex: 0, explanation: '主張談的是特定地點、時段、等待時間，直接量測相符變數最有關聯。' },
      { id: 'g7-chinese-s2-u2-supp-q4', kind: 'response', level: '檢核', prompt: '針對「班級是否應減少一次性餐具」寫一個 4 句微型論證：主張、理由、可檢查證據、限制或後續方法各一句。', sampleAnswer: '我主張班級活動應優先使用可重複餐具。因為一次性餐具用完即丟，會增加垃圾量。我們可記錄四週活動中一次性餐具使用數量，再和改用借用餐具後比較。不過還要同時考慮清洗用水與衛生流程，不能只看垃圾件數。', explanation: '完整論證不只表態，還要有可檢查的證據與對限制的認識。' },
    ],
  },
  {
    unitId: 'g7-chinese-s2-u3',
    scopeCodes: ['6-Ⅳ-1～6', 'Ba-Ⅳ-1～2', 'Bc-Ⅳ', 'Bd-Ⅳ', '5-Ⅳ-6'],
    misconceptionConcepts: [
      { title: '常見迷思｜作文列出「起承轉合」四個標題不等於有結構', explanation: '結構是資訊與事件之間的關係。每段都要有功能，並透過因果、時間、對比或論證關係推進；不是把四個名稱硬貼在四段上。' },
      { title: '常見迷思｜修辭越多文章不一定越好', explanation: '用詞與修辭必須服務寫作目的。若每句都塞比喻、排比，反而可能讓資訊不清楚、語氣失真。修訂要刪掉不必要的華麗詞。' },
    ],
    workedExamples: [{
      title: '把流水帳改成有轉折的短文骨架',
      context: '原稿：「星期六我去淨灘。我們撿垃圾。很熱。我喝水。後來結束。我回家。」',
      prompt: '怎麼把它改成有重點的三段結構？',
      steps: ['先定核心：不是「做了哪些事」，而是「我原以為只是撿垃圾，最後理解垃圾來源更重要」。', '第一段用具體場景交代期待與出發，不必列全部流程。', '第二段選一個轉折：撿到大量同類包裝，讓人物開始追問來源。', '第三段寫認知改變與後續行動，例如記錄品牌／類型、思考減量，而不只是「我回家」。', '最後刪除和核心無關的喝水、排隊等流水細節，除非它們服務情節或感受。'],
      answer: '先決定中心，再用場景—發現—改變的段落功能組織材料，文章就從行程清單變成有意義的敘事。',
      explanation: '寫作結構的核心是選材與段落功能。',
    }],
    questions: [
      { id: 'g7-chinese-s2-u3-supp-q1', kind: 'choice', level: '理解', prompt: '題目「一次我改變看法的經驗」最需要優先選哪種材料？', options: ['能清楚呈現原先想法、觸發事件與後來改變的經驗', '一天中所有吃過的東西', '越多不相關的小事越好', '只寫一句結論，不交代事件'], correctIndex: 0, explanation: '選材應服務題目核心「看法如何改變」。' },
      { id: 'g7-chinese-s2-u3-supp-q2', kind: 'choice', level: '應用', context: '段落一介紹校園積水問題；段落二列三個積水位置和雨後照片；段落三提出改善排水與追蹤方式。', prompt: '這篇較接近哪種組織？', options: ['問題—證據／現況—解決方法', '完全無關的列舉', '純倒敘小說', '只有抒情'], correctIndex: 0, explanation: '三段功能依序提出問題、提供現況證據、提出處理方法。' },
      { id: 'g7-chinese-s2-u3-supp-q3', kind: 'choice', level: '應用', context: '原句：「這次活動真的非常非常非常有意義，讓我學到很多很多東西。」', prompt: '哪個修訂較具體？', options: ['活動後，我第一次會先查資料來源，再決定要不要轉傳訊息。', '這次真的超級無敵有意義。', '我學到很多，真的很多。', '意義就是有意義。'], correctIndex: 0, explanation: '具體行為改變比重複形容詞更能讓讀者理解「學到什麼」。' },
      { id: 'g7-chinese-s2-u3-supp-q4', kind: 'response', level: '檢核', prompt: '為「一次合作失敗後的改變」規劃三段式大綱，每段用一句話寫出功能，不需要寫全文。', sampleAnswer: '第一段：交代原本大家各做各的，我以為最後拼起來就好。第二段：呈現簡報前發現格式與內容重複，臨時重做造成衝突。第三段：寫出我們後來改用共同大綱與中途檢查，並說明我對合作的理解如何改變。', explanation: '先能規劃段落功能，再擴寫細節，會比一開始就硬寫全文更穩。' },
    ],
  },
]

export function getChinese7TextbookSupplement(unitId: string) {
  return SUPPLEMENTS.find((item) => item.unitId === unitId) ?? null
}

export function chinese7TextbookSupplementUnitIds() {
  return SUPPLEMENTS.map((item) => item.unitId)
}
