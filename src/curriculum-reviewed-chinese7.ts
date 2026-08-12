import type { ReviewedUnitContent } from './curriculum-reviewed-social10'

const languageTools: ReviewedUnitContent = {
  grade:7,subject:'chinese',unitId:'g7-chinese-s1-u1',reviewStatus:'reviewed',
  researchBasis:['十二年國教國語文第四學習階段','公開七年級國文能力分類：字詞、句法、修辭、篇章閱讀'],
  overview:'國中國文的「基礎」不是重新背一遍國字，而是學會遇到陌生字詞、複雜句子和不確定語意時，能用字形、語境、工具書與句法線索自己處理。',
  concepts:[
    {title:'字音字形要放回語境',explanation:'同音字、形近字常要靠句意判斷。只背單字表容易在真正文章中選錯字。',example:'「再接再厲」中的「厲」不能因讀音相近寫成「勵」。'},
    {title:'詞義有本義、引申與語境差異',explanation:'同一詞在不同句子可能有不同義項。先看前後文，再用辭典確認最符合該句的解釋。'},
    {title:'實詞與虛詞的功能不同',explanation:'名詞、動詞、形容詞等常承擔主要意義；介詞、連詞、助詞等則幫助建立句子關係。分類的目的在看懂結構，不是為分類而分類。'},
    {title:'句子的核心先找「誰／什麼＋怎麼樣」',explanation:'長句可先找主要主語和述語，再看修飾語、補充成分與連接關係。'},
    {title:'標點也是語意的一部分',explanation:'逗號、分號、冒號、引號等不只是停頓符號，也標示句子層次、引用、列舉與說明關係。'},
    {title:'上下文猜詞要能提出依據',explanation:'猜陌生詞時可看同義改述、反義對比、因果或例子，但猜完仍應回句子驗證是否通順。'},
    {title:'工具書與搜尋結果要會選',explanation:'查字典、辭典或網路時要比對詞性、義項、例句與來源，而不是直接拿第一個解釋套進所有句子。'},
  ],
  workedExamples:[{title:'陌生詞不一定要立刻查字典',context:'閱讀原創短句：「山雨忽至，遊客原本喧鬧的腳步漸漸收斂，大家都靠向屋簷，靜看雨絲斜落。」',prompt:'依上下文推測「收斂」在這裡較接近什麼意思？',steps:['先看前面「原本喧鬧」建立原來狀態。','後面出現「靠向屋簷、靜看」，表示行動與聲音變得克制。','因此此處不是數學上的收斂，也不是把物品收起來。','可推測為「減少、克制、不再那麼張揚」。'],answer:'此處「收斂」較接近「克制、減少原本喧鬧的狀態」。',explanation:'語境推詞的重點是指出哪個上下文線索支持你的解釋。'}],
  questions:[
    {id:'g7-chinese-s1-u1-q1',kind:'choice',level:'理解',prompt:'閱讀「他一進教室，原本熱烈的談話立刻沉寂下來。」依語境，「沉寂」最接近？',options:['安靜下來','更加吵鬧','快速奔跑','開始下雨'],correctIndex:0,explanation:'「原本熱烈」和「立刻」形成狀態轉變，語意指聲音變安靜。'},
    {id:'g7-chinese-s1-u1-q2',kind:'choice',level:'理解',prompt:'下列哪個做法最適合處理一個有多種義項的詞？',options:['先看上下文，再比對辭典義項與例句','永遠選辭典第一個解釋','只看單字字面不看句子','用讀音相近的詞替換'],correctIndex:0,explanation:'詞義必須和實際語境相合。'},
    {id:'g7-chinese-s1-u1-q3',kind:'choice',level:'理解',prompt:'「因為雨勢太大，所以比賽暫停。」哪個詞最明顯標示因果關係？',options:['因為／所以','雨勢','比賽','暫停'],correctIndex:0,explanation:'「因為…所以…」直接建立原因與結果。'},
    {id:'g7-chinese-s1-u1-q4',kind:'choice',level:'應用',prompt:'「我準備了三樣東西：水、雨衣、手電筒。」冒號主要作用是？',options:['引出後面的列舉說明','表示疑問','表示話沒說完','表示強烈驚嘆'],correctIndex:0,explanation:'冒號在此引出「三樣東西」的具體內容。'},
    {id:'g7-chinese-s1-u1-q5',kind:'choice',level:'應用',context:'「走過操場的學生，因突然下雨，紛紛跑進走廊。」',prompt:'這句的主要動作最接近哪一項？',options:['學生跑進走廊','操場突然跑步','下雨走過學生','走廊突然下雨'],correctIndex:0,explanation:'先抓主語「學生」和主要述語「跑進走廊」，其他部分補充背景。'},
    {id:'g7-chinese-s1-u1-q6',kind:'choice',level:'應用',prompt:'查到一個詞有四個意思時，下一步應該？',options:['用原句測試哪個義項最符合語意與詞性','四個意思全部塞進句子','只看哪個解釋最短','隨機選一個'],correctIndex:0,explanation:'查工具書後仍要回到語境判斷。'},
    {id:'g7-chinese-s1-u1-q7',kind:'choice',level:'檢核',context:'「他表面輕鬆，手指卻一直敲著桌面。」',prompt:'「卻」最主要提示哪種關係？',options:['轉折／對比','因果','時間先後','列舉'],correctIndex:0,explanation:'表面輕鬆和緊張小動作形成對比。'},
    {id:'g7-chinese-s1-u1-q8',kind:'response',level:'檢核',context:'「比賽前，他不停整理早已整齊的鞋帶，直到裁判喊集合才停下。」',prompt:'請用上下文推測人物可能的心理狀態，並指出一個文字證據。',sampleAnswer:'人物可能緊張；證據是鞋帶已經整齊，卻仍反覆整理，顯示動作可能不是實際需要，而是緊張的表現。',explanation:'推論必須回到文本證據，不能只寫「我覺得」。'},
  ],
  takeaway:['詞義要回到語境判斷。','長句先抓主語與主要述語。','連接詞與標點提示句子關係。','工具書的義項要和原句比對。','任何閱讀推論都要能指出文字證據。'],
}

const narrativeDescription: ReviewedUnitContent = {
  grade:7,subject:'chinese',unitId:'g7-chinese-s1-u2',reviewStatus:'reviewed',
  researchBasis:['十二年國教國語文第四學習階段','敘事文本、描寫與閱讀理解公開能力分類'],
  overview:'敘事文不是「有人做了什麼」的流水帳。讀者要辨認敘事順序、衝突、人物選擇、視角與描寫細節，理解作者如何讓事件產生意義。',
  concepts:[
    {title:'敘事六要素只是起點',explanation:'人物、時間、地點、事件原因、經過、結果能幫助整理，但真正閱讀還要追問人物為什麼選擇、事件如何改變。'},
    {title:'順敘、倒敘與插敘',explanation:'故事可以依時間前進，也可從後來的場景回頭說明。判讀時看時間訊號與段落功能。'},
    {title:'衝突推動情節',explanation:'人物面對外在困難、他人衝突或內在猶豫，往往使故事產生選擇與轉折。'},
    {title:'直接描寫與間接描寫',explanation:'直接寫「他很緊張」是直接描寫；透過手抖、反覆確認等動作讓讀者推知心理，是間接描寫。'},
    {title:'敘事觀點影響讀者知道多少',explanation:'第一人稱能直接呈現「我」的感受，但未必知道別人的內心；第三人稱可依作者安排呈現不同範圍資訊。'},
    {title:'場景描寫不只是裝飾',explanation:'天色、聲音、空間與物件可營造氣氛、提示人物心理或埋下後續事件線索。'},
    {title:'主旨從事件和變化推回來',explanation:'不要只用一個抽象詞如「友情」。要說出故事透過什麼事件、人物改變傳達何種理解。'},
  ],
  workedExamples:[{title:'從動作讀人物心理',context:'原創短文：「公布名單前，安琪說自己一點也不在意，卻把手機螢幕關了又開、開了又關。老師走進教室時，她立刻坐直，目光沒有離開老師手上的紙。」',prompt:'文章沒有寫「安琪很緊張」，為什麼讀者仍可如此推論？',steps:['先找人物口頭說法：「一點也不在意」。','再找行為：反覆開關螢幕、坐直、盯著名單。','口頭說法與行為形成反差。','因此可推論她其實很在意結果並感到緊張。'],answer:'透過反覆動作與注意力集中等間接描寫，讀者可從行為推知她的緊張。',explanation:'好的閱讀回答要指出具體描寫，不只貼心理標籤。'}],
  questions:[
    {id:'g7-chinese-s1-u2-q1',kind:'choice',level:'理解',prompt:'故事從主角成年回家開始，再回想十年前離家的情景，較接近哪種安排？',options:['倒敘／回溯','完全順敘','列舉','說明定義'],correctIndex:0,explanation:'從較後時間點回到過去，是倒敘或回溯式安排。'},
    {id:'g7-chinese-s1-u2-q2',kind:'choice',level:'理解',prompt:'哪一句最接近「間接描寫緊張」？',options:['他把同一句開場白練了七遍，手心全是汗','他非常非常緊張','緊張就是焦慮','今天星期三'],correctIndex:0,explanation:'以動作與生理反應呈現心理，而非直接命名。'},
    {id:'g7-chinese-s1-u2-q3',kind:'choice',level:'理解',prompt:'敘事中的「衝突」最主要有什麼功能？',options:['迫使人物面對問題與做出選擇，推動情節','只用來增加字數','保證故事一定悲傷','取代所有場景描寫'],correctIndex:0,explanation:'衝突常使事件發展並呈現人物選擇。'},
    {id:'g7-chinese-s1-u2-q4',kind:'choice',level:'應用',context:'「雨越下越大，巷子盡頭的路燈忽明忽滅。阿澤看了看手中的地址，又看了看沒有門牌的老屋。」',prompt:'場景描寫最可能產生哪種效果？',options:['營造不安與不確定感','證明角色一定迷路十年','說明雨量精確數值','表示故事已經結束'],correctIndex:0,explanation:'大雨、閃爍路燈與無門牌共同營造不確定氣氛。'},
    {id:'g7-chinese-s1-u2-q5',kind:'choice',level:'理解',prompt:'第一人稱「我」敘事通常有哪個限制？',options:['「我」未必知道其他人物沒說出的內心','一定不能描寫任何景物','一定比第三人稱客觀','不能描述過去事件'],correctIndex:0,explanation:'第一人稱視角的資訊通常受敘述者經驗限制。'},
    {id:'g7-chinese-s1-u2-q6',kind:'choice',level:'應用',context:'故事中主角起初拒絕向同學求助，後來失敗後主動說出困難並接受合作。',prompt:'哪個主旨說法較完整？',options:['故事透過主角從逞強到願意合作，呈現承認限制也是成長的一部分','主旨就是「同學」兩個字','主旨是故事發生在學校','主旨只要寫「友情」就一定完整'],correctIndex:0,explanation:'完整主旨要結合事件與人物變化。'},
    {id:'g7-chinese-s1-u2-q7',kind:'choice',level:'檢核',prompt:'閱讀敘事文要判斷人物性格，哪種證據通常較有力？',options:['人物在多個關鍵情境中的行動與選擇','只看人物名字','只看文章長度','只看第一句天氣'],correctIndex:0,explanation:'性格推論需要多個行動與選擇支持，避免單點過度推論。'},
    {id:'g7-chinese-s1-u2-q8',kind:'response',level:'檢核',context:'「媽媽把便當放在桌上，只說：『今天別又忘了。』我正要回嘴，看見她外套肩上還沾著清晨的雨。」',prompt:'這段可推論母親和敘述者之間有什麼情感張力？請引用細節說明。',sampleAnswer:'敘述者原本可能覺得母親在碎念而想反駁，但看到母親冒雨準備便當的痕跡後，讀者可感到責備背後也有照顧；「正要回嘴」與「肩上沾雨」形成轉折。',explanation:'回答不需要只有一個標準情緒詞，但必須以文本細節支持。'},
  ],
  takeaway:['敘事要看事件中的人物選擇與變化。','衝突推動情節。','間接描寫讓讀者從細節推心理。','敘事觀點決定資訊範圍。','主旨要結合事件與改變，不只貼抽象標籤。'],
}

const classicalBasics: ReviewedUnitContent = {
  grade:7,subject:'chinese',unitId:'g7-chinese-s1-u3',reviewStatus:'reviewed',
  researchBasis:['十二年國教國語文第四學習階段','國中文言文基礎閱讀策略'],
  overview:'文言文入門最怕逐字硬翻。先找人物、動作、否定與轉折，再用上下文處理古今義、詞類活用與省略，最後才整理整句意思。',
  concepts:[
    {title:'先切分語意單位',explanation:'文言沒有現代標點時，閱讀要依人物、動作與句意切分。課堂文本會有標點，但仍需理解詞組關係。'},
    {title:'常見實詞要看古今義',explanation:'同一字古今意思可能不同，不能直接套現代常用義。先看語境，再用注釋或工具書確認。'},
    {title:'常見虛詞建立句間關係',explanation:'之、其、而、以、於等詞可能有不同功能，應以句子位置和前後關係判斷，而不是一字只背一義。'},
    {title:'省略成分要從上下文補回',explanation:'文言常省略主語、賓語等；補回時要能由前後文找到合理指涉。'},
    {title:'詞類活用要看它在句中做什麼',explanation:'某些名詞、形容詞在特定句中可作動詞等功能，判斷時以語法位置與句意為主。'},
    {title:'倒裝與語序不要硬照字面搬',explanation:'部分文言句式語序和現代漢語不同，翻譯要先還原關係再用自然現代語表達。'},
    {title:'翻譯後要做語意檢查',explanation:'好的翻譯不是每字一對一，而是資訊不漏、關係正確、現代語通順。'},
  ],
  workedExamples:[{title:'用自寫仿古短句練閱讀',context:'練習句（平台自寫）：「客至，童出迎之。客問主人安在，童指園中曰：『方理花木。』」',prompt:'「迎之」的「之」較可能指誰？「方」在此何意？',steps:['前句主角有「客」與「童」。','「童出迎之」的動作是童出去迎接某人，最合理受詞是剛到的客。','後句「方理花木」用來回答主人在哪、在做什麼。','「方」在此較接近「正在」，所以主人正在整理花木。'],answer:'「之」指客；「方」意為正在。',explanation:'先用角色與動作關係解指涉，再處理古今詞義。'}],
  questions:[
    {id:'g7-chinese-s1-u3-q1',kind:'choice',level:'理解',context:'平台自寫句：「犬聞聲而起。」',prompt:'「而」在這裡較接近什麼作用？',options:['連接前後動作／關係','表示一個人的名字','表示地點','表示數量'],correctIndex:0,explanation:'「聞聲」和「起」是前後相關動作。'},
    {id:'g7-chinese-s1-u3-q2',kind:'choice',level:'理解',context:'「主人方讀書。」',prompt:'「方」較接近？',options:['正在','方向','正方形','方法'],correctIndex:0,explanation:'依句子語境表示動作正在進行。'},
    {id:'g7-chinese-s1-u3-q3',kind:'choice',level:'應用',context:'「弟見果於桌，取而食之。」',prompt:'最後的「之」最合理指什麼？',options:['果子','桌子','弟弟本人','看見這個動作'],correctIndex:0,explanation:'「食」需要受詞，前文最近且合理的是果子。'},
    {id:'g7-chinese-s1-u3-q4',kind:'choice',level:'理解',prompt:'遇到文言陌生字時，哪個順序較好？',options:['先看上下文與句法，再查注釋／工具書確認','只看現代第一個常用義','跳過整句','每個字都翻成相同固定意思'],correctIndex:0,explanation:'文言詞義高度依賴語境。'},
    {id:'g7-chinese-s1-u3-q5',kind:'choice',level:'應用',context:'「雨甚，客乃止行。」',prompt:'整句較自然的現代語是？',options:['雨下得很大，客人於是停止前行','雨很喜歡客人走路','客人把雨停下來','雨和客人都不存在'],correctIndex:0,explanation:'「甚」表程度，「乃」在此可理解為於是／才。'},
    {id:'g7-chinese-s1-u3-q6',kind:'choice',level:'檢核',prompt:'文言翻譯最不適合哪種做法？',options:['不管句法，每個字固定換一個現代字再串起來','確認人物和動作關係','注意古今義','翻完檢查現代語是否通順'],correctIndex:0,explanation:'逐字機械對譯容易破壞句法與語意。'},
    {id:'g7-chinese-s1-u3-q7',kind:'choice',level:'應用',context:'「童入室取傘，出而與客。」',prompt:'句中可能省略了哪個成分？',options:['「與」後省略「傘」等受詞','所有人物都省略','「室」一定是動詞','完全沒有可理解內容'],correctIndex:0,explanation:'前文「取傘」提供可補回的受詞，語意是把傘給客人。'},
    {id:'g7-chinese-s1-u3-q8',kind:'response',level:'檢核',context:'平台自寫句：「晨起，見庭葉滿地，知昨夜風急。」',prompt:'請翻成自然現代中文，並說明「知昨夜風急」是觀察還是由觀察做出的推論。',sampleAnswer:'早晨起來，看見院子裡滿地落葉，便知道昨晚風很強。「滿地落葉」是觀察，「昨夜風很強」是根據現象做的推論。',explanation:'文言閱讀也可以結合資訊層次判斷，不只是翻字。'},
  ],
  takeaway:['文言先找人物、動作與關係。','實詞與虛詞都要依語境判斷。','省略成分要有前後文依據。','翻譯不是逐字機械替換。','翻完要檢查資訊與現代語是否合理。'],
}

const poetryImagery: ReviewedUnitContent = {
  grade:7,subject:'chinese',unitId:'g7-chinese-s2-u1',reviewStatus:'reviewed',
  researchBasis:['十二年國教國語文第四學習階段','詩歌、意象、情感與修辭公開能力分類'],
  overview:'讀詩不是猜作者心情。要從意象、聲音、節奏、語序與對比找證據，再說這些選擇如何形成情緒與畫面。',
  concepts:[
    {title:'意象是具體事物與感官畫面',explanation:'月、雨、車站、燈光都可以是意象，但它們的情感意義要由整首詩中的關係判斷，不能固定說「月亮永遠代表思鄉」。'},
    {title:'情感要由語言證據支持',explanation:'形容詞、動詞、重複、停頓、語氣與意象組合都能支持情感推論。'},
    {title:'譬喻建立兩件事的相似關係',explanation:'譬喻把抽象感受轉成可感的畫面。判讀不只找「像」，還要說相似點。'},
    {title:'擬人讓非人事物帶有人類行為或情感',explanation:'擬人可改變讀者與景物的距離，例如「夜色推著窗」比「夜變黑」更有動感。'},
    {title:'排比、類疊與反覆形成節奏',explanation:'結構或語詞反覆可強調概念、累積情緒或建立節奏，但要看反覆內容如何變化。'},
    {title:'對比能凸顯轉折',explanation:'明暗、冷暖、喧鬧與安靜、過去與現在等對比，常讓詩的情緒或觀點更明顯。'},
    {title:'讀詩可以有多種解釋，但不是毫無限制',explanation:'不同讀者可有不同合理理解，前提是能指出文本細節與完整脈絡。'},
  ],
  workedExamples:[{title:'一首四行原創小詩怎麼讀',context:'平台原創：\n「末班車走後／月台留下兩盞燈／風翻著沒人讀的時刻表／像替誰再等一分鐘」',prompt:'這段可能營造什麼情緒？請從意象與修辭說明。',steps:['場景是末班車後的空月台，先建立「人已離開」的空缺。','「兩盞燈」「沒人讀的時刻表」都是留下來的物件。','「風翻著」有擬人化動態；最後「像替誰再等」把場景轉成等待意象。','因此可以合理讀出安靜、留戀或等待未完的情緒。'],answer:'可讀為安靜而帶留戀／等待的情緒；證據是空月台、留下的燈、無人時刻表與「再等一分鐘」的譬喻式收束。',explanation:'詩意解釋允許不同詞語，但要有文本證據鏈。'}],
  questions:[
    {id:'g7-chinese-s2-u1-q1',kind:'choice',level:'理解',prompt:'「風在屋簷下低聲抱怨」最明顯使用？',options:['擬人','列數據','定義','因果論證'],correctIndex:0,explanation:'把「抱怨」這種人的行為賦予風。'},
    {id:'g7-chinese-s2-u1-q2',kind:'choice',level:'理解',prompt:'判斷詩中「月亮」的意義，最好的方法是？',options:['看它和其他意象、動詞及全詩脈絡的關係','固定背月亮永遠等於思鄉','只看標題字數','不需要文本證據'],correctIndex:0,explanation:'意象意義由具體文本脈絡產生。'},
    {id:'g7-chinese-s2-u1-q3',kind:'choice',level:'應用',context:'「記憶像口袋裡的一顆小石頭，走很久了還有重量。」',prompt:'譬喻相似點最接近？',options:['記憶雖小卻持續帶來可感的負擔／存在感','記憶真的由石頭製成','所有石頭都會說話','口袋就是大腦'],correctIndex:0,explanation:'譬喻要找兩者在語境中的共同特質。'},
    {id:'g7-chinese-s2-u1-q4',kind:'choice',level:'理解',prompt:'排比最常見的特徵是？',options:['相近句式連續排列形成強調或節奏','每句都完全沒有關係','只能出現在法律條文','一定只有兩個字'],correctIndex:0,explanation:'排比常以結構相近的多個分句累積語勢。'},
    {id:'g7-chinese-s2-u1-q5',kind:'choice',level:'應用',context:'「白天廣場擠滿聲音，夜裡只剩噴泉自己數著水滴。」',prompt:'哪個手法最值得注意？',options:['喧鬧與安靜的對比，加上噴泉擬人','只有精確統計','沒有任何修辭','全段都是法律命令'],correctIndex:0,explanation:'白天／夜晚、擁擠／只剩形成對比，「數著」又帶擬人。'},
    {id:'g7-chinese-s2-u1-q6',kind:'choice',level:'檢核',prompt:'哪個詩歌解釋最有說服力？',options:['先提出理解，再引用具體字詞與意象說明','只說「我就是覺得」','只查作者生日','只數每行字數'],correctIndex:0,explanation:'詩歌解釋仍需回到文本證據。'},
    {id:'g7-chinese-s2-u1-q7',kind:'choice',level:'理解',prompt:'反覆同一句話在詩中出現，每次上下文不同，可能有什麼作用？',options:['讓同一句在不同段落累積或改變意義','一定是作者打錯','完全沒有閱讀價值','表示每段意思都一樣'],correctIndex:0,explanation:'反覆可透過脈絡變化形成節奏與意義層次。'},
    {id:'g7-chinese-s2-u1-q8',kind:'response',level:'檢核',context:'平台原創：「雨停了／窗上的水痕還在往下走／我沒有再等訊息／只是沒有關燈。」',prompt:'請提出一種合理情緒解讀，並引用至少兩個細節。',sampleAnswer:'可讀為表面放下、內心仍等待：說「沒有再等訊息」像是在否認期待，但「沒有關燈」和仍往下的水痕保留未結束感。',explanation:'答案可不同，只要細節與推論能連起來。'},
  ],
  takeaway:['意象沒有固定單一答案，要看全詩脈絡。','情感推論要有語言證據。','修辭要說明效果，不只命名。','對比與反覆能建立情緒層次。','多元解讀仍需要文本支持。'],
}

const expositionArgument: ReviewedUnitContent = {
  grade:7,subject:'chinese',unitId:'g7-chinese-s2-u2',reviewStatus:'reviewed',
  researchBasis:['十二年國教國語文第四學習階段','說明文、論說文、非連續文本與媒體閱讀能力'],
  overview:'說明文重在把事物講清楚；論說文則要提出主張並用理由與證據支持。讀者要學會辨認文章目的、結構、證據品質與推論是否跳躍。',
  concepts:[
    {title:'說明文先辨識說明對象與目的',explanation:'作者可能在解釋原理、介紹特徵、說明流程或比較差異。先知道「要說清楚什麼」才容易整理資訊。'},
    {title:'常見說明方法',explanation:'定義、分類、舉例、比較、因果、步驟與數據等方法各有功能。不要只背名稱，要看它讓哪件事更清楚。'},
    {title:'論說文的主張、理由與證據',explanation:'主張是作者希望讀者接受的判斷；理由說明為何；證據則提供可檢查的支持。三者不能混為一談。'},
    {title:'例子不是自動等於充分證據',explanation:'一個人的經驗可幫助理解，但若主張涉及大群體，通常還需要更具代表性的資料。'},
    {title:'相關不等於因果',explanation:'兩件事一起出現不代表一方造成另一方。需要時間順序、機制與排除其他因素。'},
    {title:'圖表也是文本',explanation:'讀圖表要確認標題、時間、單位、來源與坐標尺度，再把資料和文章敘述互相比對。'},
    {title:'反方觀點能測試論證',explanation:'好的論證會預想不同立場，回應限制與可能反例，而不是只挑支持自己的材料。'},
  ],
  workedExamples:[{title:'「我朋友都熬夜，所以熬夜不影響學習」哪裡有問題？',context:'某段論說寫：「我認識三個同學每天凌晨一點睡，成績都很好，因此晚睡不會影響學生學習。」',prompt:'這個論證有什麼主要問題？',steps:['主張是「晚睡不影響學生學習」。','證據只有作者認識的三位同學，樣本極小且不是隨機。','成績還可能受到讀書時間、能力、家庭與健康等因素影響。','因此案例可以提出問題，但不足以支持對所有學生的普遍結論。'],answer:'以少數身邊案例推論所有學生，證據代表性不足，也未控制其他因素。',explanation:'閱讀論說文要問「這份證據足以支持這麼大的主張嗎？」'}],
  questions:[
    {id:'g7-chinese-s2-u2-q1',kind:'choice',level:'理解',prompt:'文章先解釋「熱島效應」的定義，再列城市例子，主要屬哪種文本目的？',options:['說明事物與現象','敘述人物冒險','抒情表白','只列對話'],correctIndex:0,explanation:'定義與例子服務於說明。'},
    {id:'g7-chinese-s2-u2-q2',kind:'choice',level:'理解',prompt:'「學校應增加飲水機」在論說文中較接近？',options:['主張','統計數據','例句標點','文章作者姓名'],correctIndex:0,explanation:'它是一個希望讀者接受的政策判斷。'},
    {id:'g7-chinese-s2-u2-q3',kind:'choice',level:'理解',prompt:'哪個最接近「證據」？',options:['校內三年飲水機使用量與學生調查資料','我就是覺得比較好','所以一定如此','主張本身再說一次'],correctIndex:0,explanation:'證據應提供可檢查的資料或材料來支持理由。'},
    {id:'g7-chinese-s2-u2-q4',kind:'choice',level:'應用',context:'研究發現使用圖書館的學生平均成績較高。',prompt:'可以直接說「去圖書館一定使成績提高」嗎？',options:['不行，相關不等於因果，還要考慮其他因素與研究設計','可以，兩件事一起出現就一定有因果','只要樣本超過兩人就可以','完全不能研究這個問題'],correctIndex:0,explanation:'可能是原本較愛學習的學生也更常去圖書館，需要更好的研究設計判斷因果。'},
    {id:'g7-chinese-s2-u2-q5',kind:'choice',level:'應用',prompt:'讀一張折線圖前，下列哪項最不應省略？',options:['確認坐標軸、單位、時間與來源','只看線條顏色是否漂亮','只看最高點不看時間','忽略圖例'],correctIndex:0,explanation:'圖表的量尺與資料範圍會影響解讀。'},
    {id:'g7-chinese-s2-u2-q6',kind:'choice',level:'檢核',prompt:'哪種證據最可能支持「全校學生午餐滿意度下降」？',options:['相同方法、跨多班級的連續滿意度調查結果','一位同學今天不喜歡一道菜','作者說「大家都知道」','一張沒有來源的迷因'],correctIndex:0,explanation:'群體主張需要較具代表性且可比較的資料。'},
    {id:'g7-chinese-s2-u2-q7',kind:'choice',level:'理解',prompt:'作者主動回應「增加樹蔭會增加維護成本」這個反對意見，有什麼作用？',options:['檢驗並補強自己的論證','表示作者不知道主題','把文章變成詩','取消所有證據'],correctIndex:0,explanation:'回應合理反方能讓論證更完整。'},
    {id:'g7-chinese-s2-u2-q8',kind:'response',level:'檢核',context:'主張：「學校應把午休延長 20 分鐘。」',prompt:'請寫一個可支持此主張的「理由」和一項你希望蒐集的「證據」。',sampleAnswer:'理由：較充足休息可能改善下午注意力；證據：可比較調整前後不同班級的睡眠／休息情形、下午注意力或學習表現，並控制其他作息差異。',explanation:'重點是分清「為什麼」和「拿什麼資料來支持」。'},
  ],
  takeaway:['先分辨文章是在說明還是論證。','主張、理由與證據功能不同。','單一案例不一定有代表性。','相關不等於因果。','圖表也要查時間、單位、來源與尺度。'],
}

const writingStructure: ReviewedUnitContent = {
  grade:7,subject:'chinese',unitId:'g7-chinese-s2-u3',reviewStatus:'reviewed',
  researchBasis:['十二年國教國語文第四學習階段寫作','七年級審題、取材、組織、修訂基本寫作流程'],
  overview:'寫作不是想到哪寫到哪。七年級先建立可重複的流程：審題 → 決定中心 → 選材料 → 排順序 → 寫段落 → 修訂。好文章的重點是讓讀者知道你要說什麼，以及每一段為什麼存在。',
  concepts:[
    {title:'審題先圈出任務與限制',explanation:'題目要你記敘、說明、議論或抒情？有沒有指定對象、事件、時間或觀點？先確認再取材。'},
    {title:'中心意思要能用一句話說完',explanation:'寫作前先寫「我想讓讀者最後理解什麼」。中心越清楚，材料越容易取捨。'},
    {title:'材料不是越多越好',explanation:'選能支持中心的細節，無關但有趣的內容仍可能要刪除。'},
    {title:'段落要有功能',explanation:'一段通常圍繞一個主要意思；換段不是看字數，而是看時間、場景、焦點或論述功能是否改變。'},
    {title:'細節比抽象評語有力',explanation:'與其寫「我很感動」，可寫具體動作、聲音、物件與對話讓讀者感受。'},
    {title:'銜接詞要反映真正關係',explanation:'首先、因此、然而、例如、同時等詞要和內容邏輯一致，不能只為「看起來像作文」硬加。'},
    {title:'修訂分成內容與表面兩層',explanation:'先修主旨、順序、證據與段落，再處理字詞、標點與錯字。只改錯字不等於完成修訂。'},
  ],
  workedExamples:[{title:'把流水帳改成有中心的段落',context:'初稿：「星期六我去外婆家。吃午餐。下午下雨。我們收衣服。後來喝茶。晚上回家。」',prompt:'如果中心是「我第一次發現外婆年紀大了，需要我幫忙」，應如何取材與改寫？',steps:['刪掉和中心關係不大的行程清單。','選「下雨收衣服」當核心事件。','加入外婆動作變慢、我先跑去收衣服等具體細節。','結尾回到人物理解，而不是只寫「晚上回家」。'],answer:'可把段落集中在突降大雨、外婆起身緩慢、自己主動幫忙的事件，讓「角色關係改變」成為中心。',explanation:'作文不是把發生過的事全部寫出來，而是用材料支持中心。'}],
  questions:[
    {id:'g7-chinese-s2-u3-q1',kind:'choice',level:'理解',prompt:'題目「一次我改變想法的經驗」最核心的寫作要求是？',options:['寫出原本想法、造成改變的事件與後來理解','只列一天行程','介紹三種動物','只抄名言'],correctIndex:0,explanation:'題目的關鍵是「改變想法」及其過程。'},
    {id:'g7-chinese-s2-u3-q2',kind:'choice',level:'理解',prompt:'寫作前先用一句話寫中心意思，最主要目的？',options:['幫助取捨材料與安排段落','讓文章一定變長','取代正文','不用再修稿'],correctIndex:0,explanation:'中心是判斷材料是否相關的基準。'},
    {id:'g7-chinese-s2-u3-q3',kind:'choice',level:'應用',prompt:'中心是「第一次獨自搭車讓我學會先做準備」，哪個材料最相關？',options:['出發前查路線、坐錯方向後重新判斷並記下方法','早餐吃了什麼品牌麵包的所有細節','去年另一部電影劇情','同學的星座'],correctIndex:0,explanation:'材料要直接支持「準備與學習」的中心。'},
    {id:'g7-chinese-s2-u3-q4',kind:'choice',level:'理解',prompt:'何時最適合換段？',options:['主要時間、場景、焦點或段落功能明顯改變時','每寫 20 個字固定換段','只要有逗號就換段','永遠不要換段'],correctIndex:0,explanation:'段落反映意思結構，不是固定字數。'},
    {id:'g7-chinese-s2-u3-q5',kind:'choice',level:'應用',prompt:'要呈現「他很疲憊」，哪一句細節較有畫面？',options:['他進門後鞋都沒脫好，就靠著牆坐了下來','他很疲憊很疲憊很疲憊','疲憊就是累','今天是星期五'],correctIndex:0,explanation:'具體動作能讓讀者自行感受人物狀態。'},
    {id:'g7-chinese-s2-u3-q6',kind:'choice',level:'理解',prompt:'第一輪修訂最值得先看什麼？',options:['中心、材料、順序與段落是否清楚','每個字是不是寫得一樣大','紙張是不是最白','先把所有逗號改成句號'],correctIndex:0,explanation:'先處理高層次內容結構，再處理表面錯誤。'},
    {id:'g7-chinese-s2-u3-q7',kind:'choice',level:'檢核',context:'前句說「我原本很想參加」，後句卻接「因此，我決定退出」。',prompt:'如果中間沒有任何原因說明，最主要問題是？',options:['邏輯銜接不足，「因此」缺乏前提','字數太少所以一定錯','不能使用「因此」這個詞','每篇文章都必須參賽'],correctIndex:0,explanation:'連接詞必須和前後邏輯關係一致。'},
    {id:'g7-chinese-s2-u3-q8',kind:'response',level:'檢核',prompt:'請為「我學會開口求助的一次經驗」設計三段式大綱，每段一句即可。',sampleAnswer:'第一段：我一直怕麻煩別人，遇到問題都自己撐；第二段：一次任務卡住造成更大麻煩，我終於向同學說明困難；第三段：獲得協助後完成任務，我理解求助不是把責任丟給別人。',explanation:'大綱需要看得出起點、關鍵事件與最後理解的變化。'},
  ],
  takeaway:['先審題再取材。','中心意思決定材料去留。','段落按功能而不是固定字數。','用具體細節代替空泛評語。','修訂先改內容結構，再修字詞標點。'],
}

const UNITS: Record<string, ReviewedUnitContent> = {
  [languageTools.unitId]: languageTools,
  [narrativeDescription.unitId]: narrativeDescription,
  [classicalBasics.unitId]: classicalBasics,
  [poetryImagery.unitId]: poetryImagery,
  [expositionArgument.unitId]: expositionArgument,
  [writingStructure.unitId]: writingStructure,
}

export function getReviewedChinese7UnitContent(unitId: string) {
  return UNITS[unitId] ?? null
}
