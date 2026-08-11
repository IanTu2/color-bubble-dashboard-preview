import type { CurriculumSubjectId } from './curriculum-plan'

export type ReviewedChoiceQuestion = {
  id: string
  kind: 'choice'
  level: '理解' | '應用' | '檢核'
  context?: string
  prompt: string
  options: string[]
  correctIndex: number
  explanation: string
}

export type ReviewedResponseQuestion = {
  id: string
  kind: 'response'
  level: '理解' | '應用' | '檢核'
  context?: string
  prompt: string
  sampleAnswer: string
  explanation: string
}

export type ReviewedQuestion = ReviewedChoiceQuestion | ReviewedResponseQuestion

export type ReviewedConcept = {
  title: string
  explanation: string
  example?: string
}

export type ReviewedWorkedExample = {
  title: string
  context: string
  prompt: string
  steps: string[]
  answer: string
  explanation: string
}

export type ReviewedUnitContent = {
  grade: number
  subject: CurriculumSubjectId
  unitId: string
  reviewStatus: 'reviewed'
  researchBasis: string[]
  overview: string
  concepts: ReviewedConcept[]
  workedExamples: ReviewedWorkedExample[]
  questions: ReviewedQuestion[]
  takeaway: string[]
}

const geographySpatial: ReviewedUnitContent = {
  grade: 10,
  subject: 'social',
  unitId: 'g10-social-s1-u1',
  reviewStatus: 'reviewed',
  researchBasis: ['十二年國教社會領域課綱', '高中地理常見的地理技術與空間分析課程結構'],
  overview: '地理的核心不是背地名，而是把「位置、分布、距離、尺度、環境條件」轉成可以比較與解釋的空間關係。這個單元先建立讀圖與空間資料的基本語言，再進入 GIS、定位與空間推論。',
  concepts: [
    {
      title: '地理問題：在哪裡、如何分布、為什麼在這裡',
      explanation: '地理問題通常先描述位置與分布，再追問形成原因與影響。先把「看到的空間事實」和「對原因的解釋」分開，才能避免把猜測當成地圖已經證明的事實。',
      example: '「便利商店多集中在車站周圍」是分布描述；「因為人流大所以店家選址集中」才是待驗證的解釋。',
    },
    {
      title: '絕對位置與相對位置',
      explanation: '絕對位置用經緯度或坐標精確定位；相對位置則描述一個地點和其他地點的方向、距離、交通或鄰接關係。兩者回答的問題不同，不能互相取代。',
      example: '25°N、121°E 是絕對位置；「位於車站東側、步行約 5 分鐘」是相對位置。',
    },
    {
      title: '地圖四個先決條件：方向、圖例、比例尺、資料時間',
      explanation: '讀圖前先確認方向、圖例、比例尺與資料時間。比例尺決定能看見多細的空間資訊；圖例決定符號代表什麼；資料時間則避免拿不同年代的分布直接比較。',
      example: '同一個都市在 1:5,000 與 1:500,000 的地圖上，能呈現的道路、街廓與設施細節完全不同。',
    },
    {
      title: '尺度與概化',
      explanation: '地圖必須把真實世界簡化。範圍越大，通常越需要捨去細節；範圍越小，才能呈現更多道路、建物或地形細節。研究問題的尺度不同，可能得到不同的結論。',
      example: '分析全臺人口移動適合縣市尺度；分析學生通學安全則需要街廓甚至路口尺度。',
    },
    {
      title: '主題地圖與資料分類',
      explanation: '主題地圖用顏色、大小、線條或符號呈現人口密度、雨量、產業、交通等變數。讀圖時要先看資料單位與分類方式，否則相同數值可能因分級方法不同而看起來差很多。',
      example: '總人口與人口密度是不同變數：面積大的行政區總人口高，不代表每平方公里住得更密。',
    },
    {
      title: 'GIS：把不同空間圖層疊在一起',
      explanation: 'GIS 可把道路、人口、地形、土地使用、災害潛勢等圖層放在同一空間座標中進行查詢、量測與疊圖。GIS 的價值不只在畫漂亮地圖，而在比較不同資料之間的空間關係。',
      example: '規劃避難場所時，可同時比較人口分布、淹水潛勢、道路可達性與現有公共設施。',
    },
    {
      title: 'GPS、遙測與 GIS 的角色不同',
      explanation: 'GPS 主要回答「我在哪裡」；遙測利用衛星或航空影像觀察地表；GIS 則負責儲存、整合、分析與呈現空間資料。三者常一起使用，但功能不能混為一談。',
      example: '調查山坡地變化：GPS 記錄採樣位置，遙測比較不同時間影像，GIS 疊合坡度、道路與土地使用資料。',
    },
    {
      title: '空間相關不等於因果',
      explanation: '兩種現象在地圖上出現在相近位置，只能先說「具有空間上的關聯」，不能直接證明一方造成另一方。還要檢查時間順序、其他變因與額外證據。',
      example: '咖啡店與捷運站都集中在市中心，可能共同受到人口密度與商業活動影響，不能只看兩張圖就斷言捷運站必然造成咖啡店增加。',
    },
  ],
  workedExamples: [
    {
      title: '用空間資料選避難集合點',
      context: '某社區有 A、B 兩座公園。A 距主要住宅區 300 公尺，但位在低窪淹水潛勢區；B 距住宅區 550 公尺，地勢較高，且有兩條主要道路可到達。',
      prompt: '若要先做初步避難集合點評估，不能只用「距離住宅區最近」當唯一條件。你會怎麼判斷？',
      steps: [
        '先列需求：安全、可達、能容納居民，而不是只比距離。',
        '把住宅人口、淹水潛勢、道路、地勢與公園位置當成不同圖層。',
        '排除明顯位於高風險區的候選點，再比較剩餘地點的可達性與容量。',
        '最後到現地確認資料是否過期，例如道路施工或公園實際可用面積。',
      ],
      answer: 'B 雖然較遠，但在目前條件下通常比 A 更值得進一步評估；真正決策仍要加入容量、災害類型與現地調查。',
      explanation: '這個例子要練的是多圖層判斷：空間分析不是只找最短距離，而是先確認問題，再選擇和問題有關的資料。',
    },
  ],
  questions: [
    {
      id: 'g10-social-s1-u1-q1', kind: 'choice', level: '理解',
      prompt: '「某市的書店大多集中在火車站周圍 800 公尺內」這句話首先屬於哪一類敘述？',
      options: ['空間分布的描述', '因果關係已被證明', '法律規範的判斷', '歷史時代的劃分'],
      correctIndex: 0,
      explanation: '這句話只描述書店「在哪裡、如何分布」，還沒有證明為什麼集中在火車站附近。',
    },
    {
      id: 'g10-social-s1-u1-q2', kind: 'choice', level: '理解',
      context: '甲：25.04°N, 121.52°E。乙：位於市政府西南方約 1.2 公里。',
      prompt: '甲、乙分別代表什麼位置表達？',
      options: ['甲絕對位置；乙相對位置', '甲相對位置；乙絕對位置', '兩者都是比例尺', '兩者都是圖例'],
      correctIndex: 0,
      explanation: '經緯度可精確定位，是絕對位置；方向與距離相對其他地點描述，是相對位置。',
    },
    {
      id: 'g10-social-s1-u1-q3', kind: 'choice', level: '理解',
      context: '你拿到一張以深色代表高值、淺色代表低值的主題地圖。',
      prompt: '在比較深淺之前，最需要先確認哪一項？',
      options: ['圖例中的數值範圍與單位', '地圖是不是彩色列印', '標題字體大小', '行政區名稱是否依筆畫排序'],
      correctIndex: 0,
      explanation: '沒有確認圖例、單位與分級方式，就不能知道深淺代表多少，也不能正確比較。',
    },
    {
      id: 'g10-social-s1-u1-q4', kind: 'choice', level: '應用',
      prompt: '要研究「某國中校門口 200 公尺內的行人事故熱點」，下列哪種地圖尺度最合適？',
      options: ['能清楚看到路口、斑馬線與街廓的大比例尺地圖', '只呈現全世界國界的世界地圖', '只呈現全臺縣市邊界的地圖', '只列出各國人口排名的表格'],
      correctIndex: 0,
      explanation: '研究範圍很小，需要路口與街廓細節，因此應使用能呈現較多局部細節的大比例尺地圖。',
    },
    {
      id: 'g10-social-s1-u1-q5', kind: 'choice', level: '應用',
      context: '你有四個資料圖層：①人口密度 ②淹水潛勢 ③道路網 ④便利商店位置。',
      prompt: '若要初步評估颱風時的避難集合點，哪三個圖層最直接相關？',
      options: ['①②③', '①②④', '①③④', '②③④'],
      correctIndex: 0,
      explanation: '人口可估計服務需求，淹水潛勢關係安全，道路網關係可達性；便利商店位置不是這個問題的核心條件。',
    },
    {
      id: 'g10-social-s1-u1-q6', kind: 'choice', level: '理解',
      prompt: '下列哪一項最符合 GPS、遙測、GIS 的正確分工？',
      options: ['GPS 定位；遙測觀察地表；GIS 整合與分析圖層', 'GPS 分析歷史史料；遙測制定法律；GIS 量體溫', '三者功能完全相同', 'GIS 只能畫地圖，不能分析資料'],
      correctIndex: 0,
      explanation: '三種技術常搭配使用，但定位、蒐集影像與空間資料分析的主要角色不同。',
    },
    {
      id: 'g10-social-s1-u1-q7', kind: 'choice', level: '檢核',
      context: '地圖顯示捷運站周圍咖啡店較多。',
      prompt: '下列哪個結論最謹慎？',
      options: ['兩者有空間關聯，但仍需檢查人口、商業活動等其他因素後才能談因果', '捷運站必然直接造成咖啡店增加', '咖啡店一定造成捷運站興建', '地圖不能提供任何資訊'],
      correctIndex: 0,
      explanation: '空間共現是提出假設的起點，不是因果證明。要再看時間、其他變因與額外資料。',
    },
    {
      id: 'g10-social-s1-u1-q8', kind: 'response', level: '檢核',
      context: '研究問題：學校周圍哪一些路段最需要優先改善行人安全？',
      prompt: '請列出至少三種你會需要的空間資料，並各說明它為什麼有用。',
      sampleAnswer: '例如：行人事故位置（找事故集中路段）、人行道與斑馬線位置（檢查設施缺口）、學生通學路線或人流（了解暴露量）；也可加入車速、道路寬度、號誌、校門位置等。',
      explanation: '答案重點不是背固定三項，而是能把「資料」和「研究問題」連起來，說明每一個圖層能幫助判斷什麼。',
    },
  ],
  takeaway: ['先描述空間事實，再解釋原因。', '讀圖先看方向、圖例、比例尺與資料時間。', '尺度決定你看得到什麼。', 'GIS 用來整合與比較圖層；GPS、遙測角色不同。', '空間相關不等於因果。'],
}

const historySources: ReviewedUnitContent = {
  grade: 10, subject: 'social', unitId: 'g10-social-s1-u2', reviewStatus: 'reviewed',
  researchBasis: ['十二年國教社會領域課綱', '高中歷史常見史料判讀與歷史思考結構'],
  overview: '歷史不是把年份排成一條線而已。真正的歷史學習要問：資料是誰留下的、在什麼情境留下、想對誰說什麼，以及不同資料能不能互相印證。',
  concepts: [
    { title: '一手史料與二手研究', explanation: '一手史料來自研究時代中的人、物件或紀錄；二手研究則是後人整理、分析與解釋。兩者都可能有偏誤，不能把「一手」直接等同「完全可靠」。', example: '戰時日記是一手史料；後來的歷史專著是二手研究。' },
    { title: '來源檢核：作者、時間、目的、受眾', explanation: '判讀史料先確認誰寫、何時寫、為何寫、寫給誰。相同事件在私人日記、官方公告、新聞報導中可能呈現不同重點。' },
    { title: '歷史脈絡化', explanation: '不能只用今天的制度與價值理解過去。要把事件放回當時的政治、經濟、社會與文化條件中，理解當時的人能看到哪些選項。' },
    { title: '互證與衝突', explanation: '不同史料如果互相支持，可信度通常提高；若互相矛盾，不是隨便選一個，而是比較來源、立場、時間與資訊取得方式。' },
    { title: '事實、推論與解釋', explanation: '「文件寫了什麼」是直接證據；「作者為何這樣寫」是推論；把多個證據串成對事件的說明，才形成歷史解釋。' },
    { title: '因果、延續與變遷', explanation: '歷史事件通常有多重原因，也可能同時帶來改變與延續。避免把複雜變遷縮成「因為某一個人或某一件事」的單因果故事。' },
  ],
  workedExamples: [{ title: '兩份相反史料怎麼辦', context: 'A 是政府在事件當天發布的公告，稱秩序「完全穩定」；B 是當地居民當晚寫給親友的信，提到街上多處衝突。', prompt: '可以直接判定 A 或 B 一定是假嗎？', steps: ['先辨認來源：官方公告與私人書信的目的、受眾不同。', '比較兩份資料描述的是不是同一時間、同一區域。', '再找第三類資料，例如報紙、照片、醫療或警察紀錄。', '把「可以確定的事實」與「仍待確認的解釋」分開。'], answer: '不能只憑來源類型直接判定真偽；應比較脈絡並用其他資料互證。', explanation: '史料判讀不是挑自己喜歡的版本，而是追問每份資料能證明什麼、不能證明什麼。' }],
  questions: [
    { id:'g10-social-s1-u2-q1',kind:'choice',level:'理解',prompt:'下列哪一項最符合「一手史料」？',options:['事件當時參與者寫下的日記','五十年後出版的歷史教科書','後世學者的研究論文','整理多本研究後寫成的百科條目'],correctIndex:0,explanation:'一手史料來自研究時代當下或直接參與者留下的材料。' },
    { id:'g10-social-s1-u2-q2',kind:'choice',level:'理解',prompt:'判讀一份政治宣傳海報時，最不應忽略哪一組問題？',options:['誰製作、何時製作、目的與受眾','紙張是不是自己喜歡的顏色','字體是不是最流行','圖片解析度是否高'],correctIndex:0,explanation:'來源、時間、目的與受眾會直接影響史料能代表什麼。' },
    { id:'g10-social-s1-u2-q3',kind:'choice',level:'應用',context:'A：官方公告說市場供應正常。B：同日商人帳冊顯示米價突然上升。',prompt:'最合理的下一步是？',options:['再找價格、運輸、地方報告等資料交叉比對','只相信官方資料','只相信私人帳冊','因為資料衝突就放棄研究'],correctIndex:0,explanation:'資料衝突正是需要互證與脈絡化的時候。' },
    { id:'g10-social-s1-u2-q4',kind:'choice',level:'理解',prompt:'「某份信中提到當晚下大雨」和「作者因為害怕所以誇大衝突」分別較接近什麼？',options:['前者是史料內容；後者是對作者動機的推論','兩者都是已證實事實','兩者都只是年份','前者是法律規範；後者是統計結果'],correctIndex:0,explanation:'先分清史料直接寫了什麼，再把對動機的判斷標成推論。' },
    { id:'g10-social-s1-u2-q5',kind:'choice',level:'應用',prompt:'為什麼不能只用今天的價值觀直接判斷古代人的所有選擇？',options:['需要把人物放回當時制度、知識與社會條件中理解','因為過去完全沒有價值判斷','因為歷史不需要證據','因為古代人的文字都不能相信'],correctIndex:0,explanation:'脈絡化不是替過去辯護，而是先理解當時可見的條件與選項。' },
    { id:'g10-social-s1-u2-q6',kind:'choice',level:'檢核',prompt:'下列哪個歷史因果敘述較完整？',options:['事件通常由多個長期與短期因素共同形成，還要比較各因素作用','任何大事件一定只有一個原因','只要找到最早的年份就找到原因','結果發生在原因之前也沒關係'],correctIndex:0,explanation:'歷史因果要考慮多重因素、時間順序與作用機制。' },
    { id:'g10-social-s1-u2-q7',kind:'response',level:'應用',context:'史料甲是事件當天的報紙社論；史料乙是十年後參與者的回憶錄。',prompt:'請各寫出一個使用甲、乙時需要注意的限制。',sampleAnswer:'甲可能受報社立場、當時資訊不完整或審查影響；乙雖有較長時間整理經驗，但記憶可能改變，也可能受到後來觀點影響。',explanation:'不同史料不是誰比較「高級」，而是有不同優勢與限制。' },
    { id:'g10-social-s1-u2-q8',kind:'response',level:'檢核',prompt:'如果兩份史料對同一事件描述相反，你會依什麼順序處理？',sampleAnswer:'先確認是否談同一時間與地點，再檢查作者、目的、受眾和資訊來源，最後尋找其他獨立資料互證，並保留仍無法確定的部分。',explanation:'好的歷史判讀允許不確定，不需要為了得到單一答案而強行消除矛盾。' },
  ],
  takeaway: ['一手不等於完全可靠。','先問作者、時間、目的、受眾。','史料要放回歷史脈絡。','資料衝突要互證，不是挑一份相信。','把直接證據、推論與歷史解釋分開。'],
}

const civicsPolitics: ReviewedUnitContent = {
  grade:10, subject:'social', unitId:'g10-social-s1-u3', reviewStatus:'reviewed',
  researchBasis:['十二年國教社會領域課綱','高中公民與社會的民主政治與公共參與主題'],
  overview:'公民課不是背機關名稱，而是理解「公共權力為何需要授權、限制與監督」，以及人民如何透過制度與公共討論參與共同決策。',
  concepts:[
    {title:'國家、政府與公共權力',explanation:'國家是具有人民、領土、政府與主權的政治共同體；政府是執行公共權力的制度與組織。把國家和某一屆政府視為同一件事，容易混淆制度與執政者。'},
    {title:'民主正當性：授權與責任',explanation:'民主政府的權力需要來自合法程序與人民授權，同時必須接受法律、選舉、議會、司法、媒體與公民社會等不同形式的監督。'},
    {title:'權力分立與制衡',explanation:'把不同國家權力分配給不同機關，目的不是讓彼此互相妨礙，而是降低權力過度集中，並建立可以互相檢查的制度。'},
    {title:'代表政治與公民參與',explanation:'投票只是民主參與的一部分。陳情、公共聽證、倡議、社會運動、參與式討論與依法監督，都可能影響公共政策。'},
    {title:'公共政策不是只有「對／錯」',explanation:'政策常牽涉不同群體的成本、利益與價值。好的分析要先說清楚目標，再比較替代方案、效果、成本與權利影響。'},
    {title:'資訊、媒體與公共判斷',explanation:'公共議題中的資訊要檢查來源、證據與脈絡。多數人轉傳不代表內容正確；立場鮮明也不代表一定錯，重點仍是能否被查證與論證。'},
  ],
  workedExamples:[{title:'校園周邊禁停政策',context:'市府考慮在上學時段禁止校門前 100 公尺臨時停車。支持者認為能提升行人安全；部分家長與店家擔心接送與營業受影響。',prompt:'如何把這個爭議整理成一個可討論的公共政策問題？',steps:['先定義政策目標：降低事故風險與改善校門秩序。','列出受影響群體：學生、家長、店家、居民、駕駛。','比較替代方案：全面禁停、特定時段禁停、設接送區、改善人行道與執法。','找資料評估：事故、車流、步行量、替代停車位置。','最後比較效果、成本與權利影響，而不是只問誰聲音最大。'],answer:'把價值衝突轉成可比較的方案與證據，再透過合法程序決策。',explanation:'公共政策分析的重點是明確目標、辨認利害關係人、比較方案與證據。'}],
  questions:[
    {id:'g10-social-s1-u3-q1',kind:'choice',level:'理解',prompt:'「國家」與「政府」最恰當的關係是？',options:['政府是國家行使公共權力的制度與組織，但國家不等於某一屆政府','國家就是現任執政黨','政府只包含行政機關，與其他公共權力完全無關','國家只是一個地理名稱'],correctIndex:0,explanation:'區分國家與政府，可以避免把制度、政治共同體和特定執政者混在一起。'},
    {id:'g10-social-s1-u3-q2',kind:'choice',level:'理解',prompt:'權力分立與制衡最主要想降低哪一種風險？',options:['公共權力過度集中且缺乏監督','所有政策都做得太快','人民可以參加選舉','政府需要公開資訊'],correctIndex:0,explanation:'分權與制衡的核心是避免權力集中並提供互相監督。'},
    {id:'g10-social-s1-u3-q3',kind:'choice',level:'理解',prompt:'下列哪一項屬於投票之外的公民參與？',options:['參加公共聽證並提出有依據的意見','完全不看議題內容只轉傳訊息','用暴力阻止不同意見發言','冒用他人身分投票'],correctIndex:0,explanation:'依法參與公共討論、倡議與監督都是民主參與形式。'},
    {id:'g10-social-s1-u3-q4',kind:'choice',level:'應用',context:'某政策能降低 20% 車流，但會讓部分居民通勤增加 10 分鐘。',prompt:'下一步較合理的政策分析是？',options:['比較政策目標、受影響群體、替代方案與更多數據','只看降低車流這一個數字就決定','只聽最生氣的一方','因為有人反對就永遠不能決策'],correctIndex:0,explanation:'公共政策常有取捨，需要比較不同方案的效益、成本與權利影響。'},
    {id:'g10-social-s1-u3-q5',kind:'choice',level:'應用',prompt:'一則社群貼文聲稱「九成民眾都支持」，但沒有提供調查機構、樣本或日期。最適當做法是？',options:['先查原始調查來源與方法再判斷','因為數字很高所以一定正確','只要朋友也轉發就可信','立刻把它當成政府正式統計'],correctIndex:0,explanation:'公共議題中的數字要能追到來源、抽樣、時間和問法。'},
    {id:'g10-social-s1-u3-q6',kind:'choice',level:'檢核',prompt:'民主決策為什麼不能簡化成「多數人想要什麼就一定可以做」？',options:['多數決仍受基本權利、法治與程序限制','因為多數人永遠判斷錯','因為民主不需要投票','因為只有專家能做所有決定'],correctIndex:0,explanation:'民主除了多數決，也包括權利保障、法治、程序與對少數的保護。'},
    {id:'g10-social-s1-u3-q7',kind:'response',level:'應用',context:'校方想延後第一節課 30 分鐘。',prompt:'請列出至少三個需要納入討論的利害關係人或資料。',sampleAnswer:'學生睡眠與通勤、家長接送與工作、教師與校務排程、公車班次、課後活動、學習成效等都可以納入；重點是說明它和政策目標的關係。',explanation:'政策分析不是列越多人越好，而是辨認誰會受到影響，以及需要什麼證據比較方案。'},
    {id:'g10-social-s1-u3-q8',kind:'response',level:'檢核',prompt:'用一句話說明「民主政治中的監督」和「故意讓政府什麼都做不了」有何不同。',sampleAnswer:'監督是透過法律與制度要求權力說明理由、接受檢查並負責，而不是無條件阻止所有公共決策。',explanation:'制衡的目的在權力可被問責，不是讓制度癱瘓。'},
  ],
  takeaway:['國家不等於某一屆政府。','民主權力需要授權也需要監督。','分權與制衡降低權力集中。','投票之外還有多種公民參與。','公共政策要比較目標、證據、成本與權利。'],
}

const geographyHumanEnvironment: ReviewedUnitContent = {
  grade:10,subject:'social',unitId:'g10-social-s2-u1',reviewStatus:'reviewed',
  researchBasis:['十二年國教社會領域課綱','高中地理人地關係與環境議題主題'],
  overview:'人與環境不是單向的「環境決定人類」或「人類完全控制環境」。地理學習要看自然條件、技術、制度與選擇如何一起塑造土地利用、資源使用、災害風險與永續問題。',
  concepts:[
    {title:'人地系統：環境條件與人類選擇互相影響',explanation:'地形、氣候、水與資源會限制或提供機會；技術、制度與文化也會改變人們如何使用環境。'},
    {title:'資源不是固定不變的',explanation:'某種物質是否成為「資源」，和需求、技術、價格與制度有關；同一種資源也可能因過度使用而面臨枯竭或品質下降。'},
    {title:'災害風險 = 危害 × 暴露 × 脆弱度',explanation:'地震、洪水、颱風是危害；有人口與設施位在危害區才形成暴露；建物、所得、預警與救援能力則影響脆弱度。'},
    {title:'都市化與土地利用',explanation:'人口、產業與交通集中會改變住宅、商業、工業與綠地分布，也帶來房價、通勤、熱島、逕流與污染等議題。'},
    {title:'環境外部性',explanation:'某個人的生產或消費可能把成本轉嫁給沒有參與交易的人，例如空氣污染、噪音或塞車。政策常需要把這些外部成本納入。'},
    {title:'減緩與調適',explanation:'面對氣候與環境變遷，減緩是降低造成問題的壓力，例如減少溫室氣體；調適是降低已發生或預期衝擊，例如防洪、耐熱都市設計。'},
    {title:'永續不是「完全不使用」',explanation:'永續強調在環境承載、社會公平與經濟需求之間長期平衡，並考慮代際影響。'},
  ],
  workedExamples:[{title:'為什麼同一場豪雨造成的損失不同',context:'甲區與乙區雨量相近。甲區河川旁有密集住宅、地下停車場與較少滯洪空間；乙區人口較少，保留較多洪氾區並有預警疏散。',prompt:'為什麼不能只用「雨下得一樣大」推論兩地災害損失相同？',steps:['雨量代表危害強度的一部分。','比較人口、建物與設施是否暴露在淹水區。','比較排水、預警、建築與撤離能力等脆弱度。','因此風險是危害、暴露與脆弱度共同形成。'],answer:'甲區可能因暴露與脆弱度較高而有更大損失，即使雨量相近。',explanation:'災害研究不能把自然現象直接等同災害損失。'}],
  questions:[
    {id:'g10-social-s2-u1-q1',kind:'choice',level:'理解',prompt:'下列哪個例子最能說明「人地互動」？',options:['河川提供水源，但水庫、灌溉與用水制度又改變人類如何利用河川','地形存在，所以所有地方的人都只能有同一種生活方式','只要有科技，環境條件完全沒有影響','自然和人類活動彼此沒有關係'],correctIndex:0,explanation:'人地關係同時包含環境條件與人的技術、制度與選擇。'},
    {id:'g10-social-s2-u1-q2',kind:'choice',level:'理解',prompt:'下列哪一項屬於災害風險中的「暴露」？',options:['大量住宅位於河川洪氾區','颱風風速很強','建築耐震能力不足','居民有完整的防災演練'],correctIndex:0,explanation:'暴露指人口、建物與資產位於可能受危害影響的位置。'},
    {id:'g10-social-s2-u1-q3',kind:'choice',level:'應用',prompt:'改善老舊建物耐震補強，主要是在降低哪一項？',options:['脆弱度','地震發生機率','板塊運動速度','人口是否住在臺灣'],correctIndex:0,explanation:'補強不能阻止地震，但能降低建物受到危害時的損害程度。'},
    {id:'g10-social-s2-u1-q4',kind:'choice',level:'理解',prompt:'工廠排放污染造成附近居民健康成本，最接近哪個概念？',options:['負外部性','絕對位置','史料互證','權力分立'],correctIndex:0,explanation:'生產者沒有承擔全部社會成本時，可能形成負外部性。'},
    {id:'g10-social-s2-u1-q5',kind:'choice',level:'應用',prompt:'城市增加遮蔭、透水鋪面與滯洪公園，較接近哪一類氣候行動？',options:['調適','完全停止所有能源使用','史料保存','匯率政策'],correctIndex:0,explanation:'這些措施主要是降低高溫與強降雨造成的衝擊，屬調適。'},
    {id:'g10-social-s2-u1-q6',kind:'choice',level:'理解',prompt:'下列哪個說法最符合永續？',options:['在環境承載、社會公平與經濟需求間做長期權衡','完全不准使用任何自然資源','只看今年經濟成長','只要科技進步就不必考慮環境'],correctIndex:0,explanation:'永續不是單一目標，而是長期兼顧多面向與代際影響。'},
    {id:'g10-social-s2-u1-q7',kind:'response',level:'應用',context:'某山坡地社區近年豪雨崩塌風險升高。',prompt:'請分別提出一個降低「暴露」和一個降低「脆弱度」的作法。',sampleAnswer:'降低暴露可避免新建住宅進入高風險區或進行遷建；降低脆弱度可補強邊坡、改善排水、建立預警與避難系統。',explanation:'同一個危害可從不同風險構成面向降低損失。'},
    {id:'g10-social-s2-u1-q8',kind:'response',level:'檢核',prompt:'為什麼「某地有很多自然資源」不代表一定會有相同的經濟發展結果？',sampleAnswer:'資源能否被使用還受技術、交通、市場、制度、資本、人力與環境限制影響，因此自然條件只是其中一部分。',explanation:'避免環境決定論，是人地關係的重要思考。'},
  ],
  takeaway:['人與環境互相影響。','災害風險不只看危害，還要看暴露與脆弱度。','都市與資源使用會產生空間與環境外部性。','減緩與調適是不同策略。','永續是長期多目標權衡。'],
}

const historyModern: ReviewedUnitContent = {
  grade:10,subject:'social',unitId:'g10-social-s2-u2',reviewStatus:'reviewed',
  researchBasis:['十二年國教社會領域課綱','高中歷史近現代史與歷史變遷主題'],
  overview:'近現代歷史要理解「工業化、國家形成、帝國擴張、戰爭、社會運動與全球連結」如何互相作用，而不是只把事件拆成孤立年份。',
  concepts:[
    {title:'工業化改變生產與社會',explanation:'機械化、工廠制度、能源與交通改變生產效率，也推動都市化、勞動關係與社會階層變化。'},
    {title:'民族國家與政治動員',explanation:'近代國家透過行政、教育、軍隊、稅收與國民身分整合人口；民族主義既可能形成共同認同，也可能造成排除與衝突。'},
    {title:'帝國主義與殖民',explanation:'軍事、經濟、科技與政治力量不平等，使部分國家擴張控制其他地區；殖民統治同時伴隨資源、制度、人口與文化變動。'},
    {title:'戰爭與總體動員',explanation:'近代戰爭不只發生在戰場，也動員工業、媒體、女性勞動、殖民地與民生資源，影響社會結構。'},
    {title:'冷戰與兩極體系',explanation:'二戰後美蘇競爭不只表現在軍事，也影響外交、經濟援助、代理戰爭、科技與意識形態。'},
    {title:'民主化與社會運動',explanation:'政治開放通常不是單一事件，而是制度改革、社會力量、經濟變化、國際環境與公民行動長期互動的結果。'},
    {title:'全球化與連結',explanation:'商品、資本、人口、資訊與文化跨境流動加深，各地更互相依賴，也帶來不均、供應鏈風險與身份政治等新問題。'},
  ],
  workedExamples:[{title:'不要把工業革命只背成「機器出現」',context:'某地工廠增加後，農村人口大量移入城市，鐵路快速擴張，女性與兒童進入工廠工作，同時出現工時與勞動安全爭議。',prompt:'這組現象如何說明工業化不只是技術史？',steps:['機器與能源改變生產方式。','工廠集中改變人口與都市分布。','新的勞動關係形成社會議題。','交通與市場擴大又反過來促進工業生產。'],answer:'工業化同時是技術、經濟、人口、都市與社會關係的整體變遷。',explanation:'歷史變遷要看互相連動的結構，而不是只背發明名稱。'}],
  questions:[
    {id:'g10-social-s2-u2-q1',kind:'choice',level:'理解',prompt:'下列哪一項最能表現工業化的社會影響？',options:['工廠集中與都市化改變勞動和家庭生活','只多出幾種機器名稱','所有農業立刻消失','世界各地同時以完全相同速度工業化'],correctIndex:0,explanation:'工業化涉及生產方式、人口、都市與勞動關係的長期變化。'},
    {id:'g10-social-s2-u2-q2',kind:'choice',level:'理解',prompt:'近代民族國家的形成通常和哪一組制度最相關？',options:['行政、教育、軍隊、稅收與國民身分','只和氣候變化有關','只和一位君主的個性有關','完全不需要制度'],correctIndex:0,explanation:'國家形成涉及長期制度建構與政治認同。'},
    {id:'g10-social-s2-u2-q3',kind:'choice',level:'應用',prompt:'分析殖民統治時，哪種做法較完整？',options:['同時看權力不平等、經濟資源、制度改造與在地回應','只列殖民者國名','只看官方說法','只要有鐵路就判定殖民統治對所有人都相同有利'],correctIndex:0,explanation:'殖民史需要分析權力、制度、經濟與不同群體的經驗。'},
    {id:'g10-social-s2-u2-q4',kind:'choice',level:'理解',prompt:'「總體戰」為什麼不只研究軍隊？',options:['因為工業、財政、宣傳、勞動與民生都被動員','因為戰爭與社會完全無關','因為只有武器名稱重要','因為所有戰爭都沒有平民影響'],correctIndex:0,explanation:'近代大規模戰爭會深入社會與經濟。'},
    {id:'g10-social-s2-u2-q5',kind:'choice',level:'理解',prompt:'冷戰中的「兩極競爭」不只包含哪一類？',options:['軍事以外還有外交、經濟、科技與意識形態','只有體育比賽','只有兩國國內選舉','完全沒有第三世界參與'],correctIndex:0,explanation:'冷戰競爭遍及多個領域，也透過不同地區的代理衝突與援助展開。'},
    {id:'g10-social-s2-u2-q6',kind:'choice',level:'檢核',prompt:'哪個說法較能解釋民主化？',options:['制度改革、社會運動、經濟與國際環境長期互動','某一天突然所有人同時改變想法','只由單一人物決定','只要經濟成長就一定自動民主化'],correctIndex:0,explanation:'民主化通常是多重因素與長期過程，不能化約成單一原因。'},
    {id:'g10-social-s2-u2-q7',kind:'response',level:'應用',prompt:'請舉出全球化中「互相依賴」可能帶來的一個好處和一個風險。',sampleAnswer:'好處如市場、資訊與技術交流更快；風險如供應鏈中斷會跨國擴散，或利益分配不均。',explanation:'全球化既增加連結，也增加部分風險的跨境傳播。'},
    {id:'g10-social-s2-u2-q8',kind:'response',level:'檢核',prompt:'為什麼近現代史不適合只背「事件—年份」？',sampleAnswer:'因為重要的是理解事件前後的結構條件、不同群體、因果關係與後續影響；年份只能提供時間定位。',explanation:'時間定位是歷史學習的工具，不是完整的歷史解釋。'},
  ],
  takeaway:['工業化是技術、社會與人口的整體變遷。','近代國家透過制度塑造政治共同體。','殖民與戰爭要看權力與社會影響。','民主化是長期多因素過程。','全球化增加連結，也可能放大不均與風險。'],
}

const civicsRights: ReviewedUnitContent = {
  grade:10,subject:'social',unitId:'g10-social-s2-u3',reviewStatus:'reviewed',
  researchBasis:['十二年國教社會領域課綱','高中公民與社會的法治與權利保障主題'],
  overview:'法律不是「規定越多越好」。法治的重點是公共權力受到法律拘束，權利受到保障，而且限制權利時必須有法律依據、正當目的與合理比例。',
  concepts:[
    {title:'法治不等於依法統治',explanation:'法治要求政府也受法律與基本權利拘束；不是只要求人民守法、政府卻可以任意行使權力。'},
    {title:'法律位階與合法性',explanation:'不同規範有位階關係，下位規範不能牴觸上位規範。行政機關的命令與處分也要有法律依據。'},
    {title:'基本權利不是完全沒有限制',explanation:'言論、隱私、財產與行動自由等權利可能因公共利益受到限制，但限制必須符合明確法律依據與比例原則。'},
    {title:'比例原則：適合、必要、衡量',explanation:'限制權利的手段要能達成目的；若有同樣有效但侵害更小的方法應優先使用；最後還要衡量公共利益與權利損害。'},
    {title:'正當法律程序',explanation:'國家作成影響人民權利的重要決定時，需要合理程序，例如通知理由、陳述意見、獨立審查或救濟機會。'},
    {title:'平等不是所有人永遠完全相同待遇',explanation:'平等要求相同情況合理一致、不同情況可有合理差別；關鍵在差別待遇是否有正當目的與合理關聯。'},
    {title:'權利受侵害時的救濟',explanation:'法治社會需要可以挑戰國家或他人侵害的程序，例如申訴、訴願、訴訟或其他依法設計的救濟。'},
  ],
  workedExamples:[{title:'校園手機全面搜查合理嗎？',context:'學校為了防止考試作弊，規定每次考試前可無差別查看所有學生手機中的照片、聊天紀錄與雲端檔案。',prompt:'若從權利保障與比例原則分析，至少要問哪些問題？',steps:['先確認目的：防止作弊是正當目的之一。','再問手段是否真的有助於防弊。','檢查有沒有侵害更小的替代方案，例如統一關機封存、考場管理。','比較全面查看私人內容造成的隱私侵害是否過大。','還要確認規範依據、程序與申訴救濟。'],answer:'不能因目的正當就自動認定任何手段都合理；要繼續檢查必要性、侵害程度與程序。',explanation:'比例原則就是避免「只要目的是好的，手段都可以」的推理。'}],
  questions:[
    {id:'g10-social-s2-u3-q1',kind:'choice',level:'理解',prompt:'下列哪一項最符合「法治」？',options:['政府與人民都受到法律與基本權利框架拘束','政府只要說是公共利益就不必說明理由','只有人民需要守法','行政命令可以任意違反法律'],correctIndex:0,explanation:'法治也限制國家權力，並要求權利保障與可受檢驗的程序。'},
    {id:'g10-social-s2-u3-q2',kind:'choice',level:'理解',prompt:'比例原則中的「必要性」主要在問什麼？',options:['是否存在同樣有效但侵害權利更小的手段','政策名稱好不好聽','支持者是不是比較多','規則是否寫得很長'],correctIndex:0,explanation:'必要性要求在有效手段中優先選擇侵害較小者。'},
    {id:'g10-social-s2-u3-q3',kind:'choice',level:'應用',context:'政府為了減少深夜噪音，直接禁止所有居民晚上六點後出門。',prompt:'最明顯需要檢查哪一點？',options:['手段是否過度、是否有侵害更小的替代方式','是不是每個人都喜歡安靜','政策海報顏色','居民姓名筆畫'],correctIndex:0,explanation:'目的可能正當，但全面禁止外出對行動自由侵害極大，必須檢查必要性與衡量。'},
    {id:'g10-social-s2-u3-q4',kind:'choice',level:'理解',prompt:'平等原則最恰當的理解是？',options:['差別待遇需要有正當理由與合理關聯','任何情況都必須給所有人完全相同待遇','只要法律有寫就一定平等','只保護多數人'],correctIndex:0,explanation:'實質平等允許合理差別，但不能任意歧視。'},
    {id:'g10-social-s2-u3-q5',kind:'choice',level:'理解',prompt:'正當法律程序為什麼重要？',options:['讓受影響的人知道理由、表達意見並有機會救濟','讓政府不用解釋決定','保證每個人都一定勝訴','讓所有案件都不需要證據'],correctIndex:0,explanation:'程序保障降低恣意決策，讓權力可以被檢驗。'},
    {id:'g10-social-s2-u3-q6',kind:'choice',level:'檢核',prompt:'某行政規則和法律明文相牴觸時，哪個觀念最直接相關？',options:['法律位階與依法行政','空間尺度','史料脈絡','供需均衡'],correctIndex:0,explanation:'下位規範不得違反上位規範，行政行為也要有合法依據。'},
    {id:'g10-social-s2-u3-q7',kind:'response',level:'應用',context:'學校為防止遲到，規定遲到一次就停學一週。',prompt:'請用比例原則提出至少兩個需要檢查的問題。',sampleAnswer:'可問停學是否真的有助於改善遲到、是否存在較輕的有效措施、一次遲到就停學一週是否造成過度不利益，以及是否有申訴與個別情況考量。',explanation:'不是要你直接宣布違法，而是練習用目的、適合性、必要性與衡量分析。'},
    {id:'g10-social-s2-u3-q8',kind:'response',level:'檢核',prompt:'用自己的話說明「權利可以被限制」和「政府可以任意限制權利」的差別。',sampleAnswer:'權利限制必須有法律依據、正當目的、合比例且遵守程序；政府不能只因方便或主觀偏好就任意限制。',explanation:'法治的核心就在於權力需要理由、界線與可救濟性。'},
  ],
  takeaway:['法治也約束政府。','限制權利需要法律依據與正當目的。','比例原則檢查適合、必要與衡量。','平等不等於所有情況完全相同待遇。','程序與救濟讓公共權力可以被檢驗。'],
}

const REVIEWED_UNITS: Record<string, ReviewedUnitContent> = {
  [geographySpatial.unitId]: geographySpatial,
  [historySources.unitId]: historySources,
  [civicsPolitics.unitId]: civicsPolitics,
  [geographyHumanEnvironment.unitId]: geographyHumanEnvironment,
  [historyModern.unitId]: historyModern,
  [civicsRights.unitId]: civicsRights,
}

export function getReviewedUnitContent(unitId: string) {
  return REVIEWED_UNITS[unitId] ?? null
}

export function isReviewedUnit(unitId: string) {
  return Boolean(REVIEWED_UNITS[unitId])
}
