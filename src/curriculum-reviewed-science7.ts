import type { ReviewedUnitContent } from './curriculum-reviewed-social10'

const methodCells: ReviewedUnitContent = {
  grade:7,subject:'science',unitId:'g7-science-s1-u1',reviewStatus:'reviewed',
  researchBasis:['十二年國教自然科學領域七年級學習內容','國中七年級生物公開課程：科學方法、生命世界、細胞'],
  overview:'生物課的第一步不是背名詞，而是學會「怎麼知道」。先分清觀察、問題、假設、變因與證據，再用顯微鏡把生命世界從肉眼尺度推到細胞尺度。',
  concepts:[
    {title:'觀察和推論要分開',explanation:'觀察是直接看到、量到或記錄到的結果；推論是根據觀察提出的解釋。科學紀錄要讓別人知道哪一部分是資料、哪一部分是解釋。',example:'「葉片表面有水滴」是觀察；「水滴一定來自植物蒸散」是待驗證推論。'},
    {title:'可檢驗的問題',explanation:'科學問題必須能透過觀察、測量或實驗收集證據。過於模糊、只問喜好或無法定義變項的問題，不容易形成可檢驗研究。'},
    {title:'假設不是猜答案',explanation:'假設是可被證據支持或反駁的暫時解釋，通常要說清楚變因間預期的關係。'},
    {title:'操縱變因、應變變因與控制變因',explanation:'操縱變因是研究者刻意改變的因素；應變變因是觀察結果；其他可能影響結果的因素盡量保持一致，稱控制變因。'},
    {title:'重複、樣本與測量',explanation:'單次結果可能受偶然誤差影響。增加重複次數、樣本數並用合適工具量測，可以提高資料的可靠性。'},
    {title:'顯微鏡的倍率與視野',explanation:'總倍率通常是目鏡倍率乘物鏡倍率。倍率提高時，視野通常變小、看到的範圍變少，因此尋找標本要先低倍再高倍。'},
    {title:'細胞是生命的基本構造單位',explanation:'多數生物由細胞構成。細胞具有能維持生命活動的構造與功能，不同細胞可因功能不同而形態不同。'},
    {title:'植物細胞和動物細胞的共同與差異',explanation:'兩者都有細胞膜、細胞質與遺傳物質相關構造；典型植物細胞另常具有細胞壁、大型液泡與進行光合作用的葉綠體等。'},
    {title:'物質進出細胞與濃度差',explanation:'細胞膜控制物質進出。部分物質可由濃度較高處向較低處移動；水的移動也會影響細胞狀態。'},
  ],
  workedExamples:[{title:'肥料越多植物一定長越快嗎？',context:'學生想研究肥料濃度對豆苗高度的影響，準備四組相同品種豆苗，使用相同土壤、光照與澆水量，只有肥料濃度不同，兩週後量測高度。',prompt:'這個實驗的操縱變因、應變變因與至少兩個控制變因是什麼？',steps:['研究者刻意改變的是肥料濃度，所以是操縱變因。','最後量測豆苗高度，所以高度是應變變因。','品種、土壤、光照、澆水量、培養時間都可能影響高度，應盡量控制。','若每組只有一株，偶然差異很大；每組應有多株並重複量測。'],answer:'操縱變因＝肥料濃度；應變變因＝豆苗高度；控制變因可包含品種、土壤、光照、澆水量、時間等。',explanation:'科學實驗的核心是讓主要差異可以合理歸因到操縱變因，而不是同時改很多條件。'}],
  questions:[
    {id:'g7-science-s1-u1-q1',kind:'choice',level:'理解',prompt:'下列哪一句是「觀察」而不是推論？',options:['燒杯中的液體溫度是 42°C','液體一定因化學反應而變熱','植物看起來很開心','這次結果證明所有植物都一樣'],correctIndex:0,explanation:'42°C 是直接量測結果；其他敘述包含未被直接觀察的解釋或過度推廣。'},
    {id:'g7-science-s1-u1-q2',kind:'choice',level:'理解',prompt:'研究「光照時間是否影響幼苗高度」時，光照時間屬於？',options:['操縱變因','應變變因','結果誤差','樣本數'],correctIndex:0,explanation:'研究者刻意改變的光照時間是操縱變因。'},
    {id:'g7-science-s1-u1-q3',kind:'choice',level:'理解',prompt:'同一實驗每組使用多株幼苗，主要目的之一是？',options:['降低單一個體偶然差異對結果的影響','讓操縱變因變更多','避免任何測量','保證假設一定正確'],correctIndex:0,explanation:'增加樣本與重複可讓結果比較不受單一偶然值影響。'},
    {id:'g7-science-s1-u1-q4',kind:'choice',level:'應用',prompt:'目鏡 10×、物鏡 40×，總倍率通常是多少？',options:['400×','50×','4×','40×'],correctIndex:0,explanation:'總倍率＝目鏡倍率×物鏡倍率＝10×40=400。'},
    {id:'g7-science-s1-u1-q5',kind:'choice',level:'理解',prompt:'使用顯微鏡找標本時通常先用低倍，較重要的原因是？',options:['低倍視野較大，較容易找到標本','低倍一定看得最清楚所有細節','高倍完全不能觀察細胞','低倍不需要光源'],correctIndex:0,explanation:'低倍視野較廣，先定位後再換高倍看細節較穩定。'},
    {id:'g7-science-s1-u1-q6',kind:'choice',level:'理解',prompt:'下列哪個構造是典型植物細胞較常具有、一般動物細胞沒有的？',options:['細胞壁','細胞膜','細胞質','遺傳物質'],correctIndex:0,explanation:'植物細胞通常有細胞壁；細胞膜、細胞質與遺傳物質則兩者都有。'},
    {id:'g7-science-s1-u1-q7',kind:'choice',level:'檢核',context:'某同學同時改變肥料量和光照時間，最後發現植物長得比較高。',prompt:'最大的實驗設計問題是？',options:['無法分辨高度變化主要來自肥料還是光照','植物高度不能量測','任何植物實驗都只能做一次','只要結果變高就能證明兩個因素都有效'],correctIndex:0,explanation:'同時改兩個主要因素會混淆因果歸因。'},
    {id:'g7-science-s1-u1-q8',kind:'response',level:'檢核',context:'你發現窗邊一盆植物比房間深處的植物長得高。',prompt:'請寫出一個可檢驗的問題，並列出你至少要控制的兩個條件。',sampleAnswer:'問題可寫「每天光照時數是否影響同品種幼苗兩週後的高度？」控制條件可包含品種、初始大小、土壤、澆水量、溫度、容器大小等。',explanation:'從生活觀察轉成可測量問題，是科學方法的核心能力。'},
  ],
  takeaway:['觀察和推論要分開。','實驗要定義操縱、應變與控制變因。','樣本與重複能降低偶然差異。','顯微鏡先低倍定位再高倍觀察。','細胞是生命基本構造單位。'],
}

const organization: ReviewedUnitContent = {
  grade:7,subject:'science',unitId:'g7-science-s1-u2',reviewStatus:'reviewed',
  researchBasis:['十二年國教自然科學領域七年級生命系統','七年級生物體組成公開課程'],
  overview:'多細胞生物不是把很多細胞隨便堆在一起，而是具有「細胞 → 組織 → 器官 → 器官系統 → 個體」的分工層次。理解層次後，才看得懂不同器官如何合作維持生命。',
  concepts:[
    {title:'細胞分化',explanation:'多細胞生物中的細胞可因功能不同而具有不同形態與構造，例如神經細胞、肌肉細胞、保衛細胞。'},
    {title:'組織',explanation:'形態或功能相近的細胞共同完成特定工作，可形成組織；組織是介於細胞與器官間的重要層次。'},
    {title:'器官',explanation:'多種組織組成並共同執行功能的構造稱器官，例如人的胃、心臟，植物的根、莖、葉。'},
    {title:'器官系統',explanation:'多個器官協同完成較大的生命功能，例如消化系統、循環系統。植物常以根、莖、葉等器官協同完成吸收、運輸與光合作用。'},
    {title:'單細胞也能完成生命活動',explanation:'單細胞生物雖沒有組織與器官，單一細胞仍需完成攝食、代謝、排除廢物、感應與繁殖等基本生命功能。'},
    {title:'構造與功能相配合',explanation:'生物構造通常和功能相關，例如小腸表面積大有利吸收，紅血球形態有利氣體運輸。'},
    {title:'系統間互相依賴',explanation:'消化系統把食物分解吸收，呼吸系統進行氣體交換，循環系統再把物質運到細胞；各系統不是獨立工作。'},
  ],
  workedExamples:[{title:'小腸為什麼不是只有一層「管子」',context:'小腸內壁具有許多皺褶與絨毛，絨毛內有微血管。',prompt:'這些構造如何和吸收功能配合？',steps:['皺褶與絨毛增加與食物接觸的表面積。','養分穿過腸壁後進入微血管。','循環系統把吸收的養分帶往身體其他細胞。','因此吸收功能同時涉及器官構造與不同系統合作。'],answer:'增加表面積有利吸收，微血管則把養分迅速帶走並運送全身。',explanation:'生物學常用「構造如何支持功能」來理解，而不是只背器官名稱。'}],
  questions:[
    {id:'g7-science-s1-u2-q1',kind:'choice',level:'理解',prompt:'人體的心臟最適合歸在哪個層次？',options:['器官','細胞','組織','個體'],correctIndex:0,explanation:'心臟由多種組織組成並執行特定功能，是器官。'},
    {id:'g7-science-s1-u2-q2',kind:'choice',level:'理解',prompt:'下列層次由小到大正確的是？',options:['細胞→組織→器官→器官系統→個體','器官→細胞→組織→個體→系統','組織→細胞→器官系統→器官→個體','細胞→器官→組織→個體→系統'],correctIndex:0,explanation:'多細胞動物常用這個由小到大的組成層次描述。'},
    {id:'g7-science-s1-u2-q3',kind:'choice',level:'理解',prompt:'植物的根、莖、葉通常屬於哪個層次？',options:['器官','細胞','組織','器官系統'],correctIndex:0,explanation:'根、莖、葉由多種組織構成並有特定功能，因此屬器官。'},
    {id:'g7-science-s1-u2-q4',kind:'choice',level:'理解',prompt:'單細胞生物沒有器官，是否代表無法完成生命活動？',options:['不是；單一細胞仍可完成基本生命活動','是；沒有器官就不算生物','只有植物單細胞可以','只有在顯微鏡下才算生物'],correctIndex:0,explanation:'單細胞生物以一個細胞完成生存所需的基本功能。'},
    {id:'g7-science-s1-u2-q5',kind:'choice',level:'應用',context:'小腸內壁有大量絨毛。',prompt:'這種構造最直接有助於哪一項？',options:['增加吸收表面積','減少所有血流','讓食物不用消化','阻止任何物質通過'],correctIndex:0,explanation:'更大的表面積有利養分和腸壁接觸與吸收。'},
    {id:'g7-science-s1-u2-q6',kind:'choice',level:'應用',prompt:'消化系統吸收葡萄糖後，主要需要哪個系統把它運到全身細胞？',options:['循環系統','骨骼系統','皮膚表面','生殖系統'],correctIndex:0,explanation:'循環系統負責運輸血液中的養分與其他物質。'},
    {id:'g7-science-s1-u2-q7',kind:'choice',level:'檢核',prompt:'「同一器官只由一種細胞構成」這句話通常有什麼問題？',options:['器官通常由多種組織與細胞共同構成','所有器官都沒有細胞','器官只存在植物','細胞比器官更大'],correctIndex:0,explanation:'器官的特徵就是多種組織協同完成功能。'},
    {id:'g7-science-s1-u2-q8',kind:'response',level:'檢核',prompt:'請用「消化系統、循環系統、細胞」說明吃下食物後養分如何到達身體細胞。',sampleAnswer:'消化系統把食物分解並在腸道吸收，養分進入血液後由循環系統運送，最後到達各組織的細胞供利用。',explanation:'這題檢查的是跨系統合作，而不是單一器官背誦。'},
  ],
  takeaway:['多細胞生物有不同組成層次。','器官由多種組織構成。','單細胞生物也能完成生命活動。','構造常和功能相配合。','器官系統彼此合作而非獨立。'],
}

const nutritionEnergy: ReviewedUnitContent = {
  grade:7,subject:'science',unitId:'g7-science-s1-u3',reviewStatus:'reviewed',
  researchBasis:['十二年國教自然科學領域生命與能量','七年級營養、光合作用與呼吸相關公開課程'],
  overview:'生物需要物質也需要能量。植物能利用光能製造有機養分；動物主要從食物取得養分。無論來源如何，細胞都需要把養分經代謝轉成可利用的能量與構造材料。',
  concepts:[
    {title:'養分的角色不同',explanation:'醣類、脂質、蛋白質、維生素、礦物質與水在能量、構造與生理調節上扮演不同角色；不能只用「有沒有熱量」分類。'},
    {title:'酵素具有專一性與適合條件',explanation:'酵素能促進生化反應，通常對特定受質有較高專一性，活性也受溫度、酸鹼等條件影響。'},
    {title:'消化：大分子變成可吸收的小分子',explanation:'消化包含物理性切碎與化學性分解；大分子養分需經消化成較小分子才能有效吸收。'},
    {title:'吸收和消化不是同一件事',explanation:'消化是分解，吸收是物質穿過消化道進入體內運輸系統。小腸是許多養分吸收的重要位置。'},
    {title:'光合作用',explanation:'植物在有光與適當構造下，利用二氧化碳和水製造有機物並釋放氧氣，把光能轉存在化學能中。'},
    {title:'呼吸作用',explanation:'細胞可分解有機養分釋放可利用能量。植物和動物的細胞都需要呼吸作用，不能把「植物只光合作用、不呼吸」當成正確敘述。'},
    {title:'物質循環、能量流動',explanation:'物質可在生物與環境之間循環使用；能量則在轉換與傳遞過程中逐步散失為熱，因此需要持續輸入。'},
  ],
  workedExamples:[{title:'葉片遮光實驗在測什麼',context:'先讓植物在黑暗中一段時間，再用不透光鋁箔遮住葉片一部分並照光數小時，最後以適當方法檢測葉片澱粉。',prompt:'為什麼要比較同一葉片「有照光」與「被遮光」的部分？',steps:['操縱變因是是否接受光照。','同一葉片可降低品種、葉齡等差異。','若照光區較能檢出澱粉，可支持光與有機養分形成有關。','仍要注意二氧化碳、葉綠體等其他必要條件。'],answer:'用控制比較檢驗「光」是否是光合作用形成養分的重要條件。',explanation:'實驗只能支持在其控制條件下的關係，不應推論成「只要有光就一定能光合作用」。'}],
  questions:[
    {id:'g7-science-s1-u3-q1',kind:'choice',level:'理解',prompt:'消化和吸收最主要的差別是？',options:['消化是分解養分，吸收是物質進入體內運輸系統','兩者完全相同','吸收只發生口腔','消化只發生細胞內'],correctIndex:0,explanation:'分解與進入體內是兩個不同過程。'},
    {id:'g7-science-s1-u3-q2',kind:'choice',level:'理解',prompt:'酵素活性可能受哪一項影響？',options:['溫度與酸鹼條件','字體大小','容器顏色本身必然決定所有反應','是否把名稱背熟'],correctIndex:0,explanation:'酵素是蛋白質性質的催化分子，環境條件會影響其構造與活性。'},
    {id:'g7-science-s1-u3-q3',kind:'choice',level:'理解',prompt:'光合作用把哪一類能量轉存到有機物中？',options:['光能','聲能','核能','只有熱能'],correctIndex:0,explanation:'光合作用利用光能形成有機物中的化學能。'},
    {id:'g7-science-s1-u3-q4',kind:'choice',level:'理解',prompt:'植物是否也會進行細胞呼吸？',options:['會；植物細胞也需要從有機物取得可利用能量','不會；植物永遠只做光合作用','只有晚上才算生物','只有根會呼吸'],correctIndex:0,explanation:'植物細胞同樣進行呼吸作用；光合作用與呼吸作用是不同反應。'},
    {id:'g7-science-s1-u3-q5',kind:'choice',level:'應用',context:'同一葉片一半遮光、一半照光，其他條件相同。',prompt:'這個設計主要要比較哪個因素？',options:['光照','葉片品種','植物年齡','土壤種類'],correctIndex:0,explanation:'遮光與照光是主要被刻意改變的條件。'},
    {id:'g7-science-s1-u3-q6',kind:'choice',level:'理解',prompt:'下列哪個說法較符合「能量流動」？',options:['能量在生態系傳遞時會有部分散失為熱，需要持續輸入','能量可以無限循環且完全不損失','所有物質都只能單向流動','植物不需要能量'],correctIndex:0,explanation:'能量可轉換與傳遞，但不是像物質一樣封閉循環。'},
    {id:'g7-science-s1-u3-q7',kind:'choice',level:'檢核',prompt:'為什麼把食物切碎有助消化，但不等於完成化學消化？',options:['切碎增加接觸面積，但大分子仍需酵素等分解','切碎會把蛋白質直接變成胺基酸','切碎後完全不需消化液','物理變化和化學變化永遠相同'],correctIndex:0,explanation:'物理性處理有助後續反應，但分子層次仍需要化學分解。'},
    {id:'g7-science-s1-u3-q8',kind:'response',level:'檢核',prompt:'用一兩句話說明光合作用與呼吸作用的關係，但不要寫成「完全相反、互相抵消」。',sampleAnswer:'光合作用把光能轉存到有機物並產生氧氣；呼吸作用利用有機物釋放細胞可用能量。兩者反應方向與功能不同，生態系中又透過物質與能量彼此關聯。',explanation:'避免把兩個複雜代謝過程簡化成機械式相反號。'},
  ],
  takeaway:['消化與吸收不同。','酵素有專一性且受環境影響。','光合作用儲存光能。','植物也進行呼吸作用。','物質可循環，能量需要持續輸入。'],
}

const transportCoordination: ReviewedUnitContent = {
  grade:7,subject:'science',unitId:'g7-science-s2-u1',reviewStatus:'reviewed',
  researchBasis:['十二年國教自然科學領域生物體運輸、協調與恆定','七年級運輸、協調、恆定公開課程'],
  overview:'生物體要維持生命，必須把物質送到需要的地方、把訊息傳到適當器官，並讓體內環境維持在可運作範圍。運輸、神經／內分泌協調和恆定其實是同一個「系統合作」問題。',
  concepts:[
    {title:'植物的木質部與韌皮部',explanation:'木質部主要運輸水和礦物質；韌皮部主要運輸光合作用製造的有機養分。運輸方向與來源、需求部位有關。'},
    {title:'蒸散與水分運輸',explanation:'葉片氣孔散失水分會形成水勢梯度，有助根吸收的水往上運輸；氣孔同時也是氣體交換的重要通道。'},
    {title:'血液、心臟與血管',explanation:'循環系統由心臟、血管與血液等組成，負責運送氣體、養分、廢物與訊息分子。'},
    {title:'動脈、靜脈與微血管按「流向」命名',explanation:'動脈把血帶離心臟，靜脈把血帶回心臟；不能簡化成動脈永遠含氧高、靜脈永遠含氧低。'},
    {title:'神經系統快速傳遞訊息',explanation:'感覺受器接收刺激，神經訊息經中樞處理後可透過運動神經引發反應；反射可在短時間內完成保護性反應。'},
    {title:'內分泌訊息較慢但作用可較持久',explanation:'荷爾蒙由內分泌腺分泌進入血液，到具有受器的目標細胞產生作用。'},
    {title:'恆定是動態調節',explanation:'體溫、血糖、水分等並非固定不變，而是在一定範圍內透過回饋機制調整。'},
    {title:'負回饋',explanation:'當狀態偏離正常範圍時，調節反應會朝相反方向把它拉回，例如體溫升高時促進散熱。'},
  ],
  workedExamples:[{title:'跑步後為什麼心跳、呼吸都變快',context:'跑步時骨骼肌代謝增加，需要更多氧氣與養分，也產生更多二氧化碳與熱。',prompt:'請把呼吸、循環與恆定連在一起解釋。',steps:['肌肉活動增加，細胞對氧與養分需求提高。','呼吸加快增加氣體交換。','心跳加快提升血液運輸速度。','皮膚血流與出汗等調節有助散熱。','停止運動後需求下降，負回饋讓各項指標逐漸回到安靜範圍。'],answer:'多個器官系統一起調整供應、運輸與散熱，以維持內部環境。',explanation:'生理反應不是各章節互不相關，而是維持恆定的整合結果。'}],
  questions:[
    {id:'g7-science-s2-u1-q1',kind:'choice',level:'理解',prompt:'植物木質部主要運輸什麼？',options:['水與礦物質','只有糖','神經訊號','紅血球'],correctIndex:0,explanation:'木質部主要與根吸收的水及礦物質運輸有關。'},
    {id:'g7-science-s2-u1-q2',kind:'choice',level:'理解',prompt:'「動脈」最核心的定義是？',options:['把血液帶離心臟的血管','永遠含氧最多的血管','任何最粗的血管','只存在手臂的血管'],correctIndex:0,explanation:'動脈、靜脈依相對心臟的流向命名。'},
    {id:'g7-science-s2-u1-q3',kind:'choice',level:'理解',prompt:'人體物質交換最主要發生在哪一類細小血管？',options:['微血管','主動脈','所有靜脈瓣膜','骨骼'],correctIndex:0,explanation:'微血管壁薄、分布廣，適合血液與組織間進行物質交換。'},
    {id:'g7-science-s2-u1-q4',kind:'choice',level:'理解',prompt:'下列哪項較符合反射？',options:['手碰熱物迅速縮回','閱讀一篇文章後寫摘要','規劃明年旅行','背誦一首詩'],correctIndex:0,explanation:'反射是快速且較固定的神經反應，有保護作用。'},
    {id:'g7-science-s2-u1-q5',kind:'choice',level:'理解',prompt:'荷爾蒙通常如何到達目標細胞？',options:['進入血液循環並作用於有相應受器的細胞','沿木質部運送','只靠骨骼傳遞','直接變成神經元'],correctIndex:0,explanation:'內分泌腺分泌的荷爾蒙多經血液運輸。'},
    {id:'g7-science-s2-u1-q6',kind:'choice',level:'應用',prompt:'體溫升高後出汗增加，最符合哪個概念？',options:['負回饋調節','正數加法','質因數分解','遺傳突變'],correctIndex:0,explanation:'偏高體溫引發增加散熱的反應，使狀態往正常範圍移動。'},
    {id:'g7-science-s2-u1-q7',kind:'choice',level:'檢核',context:'肺循環中的肺動脈把血由心臟送往肺。',prompt:'這個例子說明為什麼不能把「動脈」定義成「含氧血管」？',options:['因為血管名稱主要依流向心臟或離開心臟決定','因為肺沒有氧氣','因為所有靜脈都沒有血','因為動脈只存在植物'],correctIndex:0,explanation:'肺動脈仍是動脈，因為它把血帶離心臟，即使其含氧量相對低。'},
    {id:'g7-science-s2-u1-q8',kind:'response',level:'檢核',prompt:'請用「刺激→受器→神經訊息→中樞→反應器」描述手碰到熱鍋迅速縮手的大致流程。',sampleAnswer:'高溫刺激被皮膚受器偵測，訊息經感覺神經進入中樞，再由運動神經傳到肌肉等反應器，引發縮手；之後大腦才進一步形成痛覺與認知。',explanation:'重點是理解訊息傳遞方向與反射的快速處理。'},
  ],
  takeaway:['植物有不同運輸組織。','動脈靜脈依血流方向命名。','神經與內分泌都是協調系統。','恆定是動態範圍而非完全不變。','負回饋能抵銷偏離。'],
}

const reproductionGeneticsEvolution: ReviewedUnitContent = {
  grade:7,subject:'science',unitId:'g7-science-s2-u2',reviewStatus:'reviewed',
  researchBasis:['十二年國教自然科學領域生殖、遺傳、演化','七年級下生殖、遺傳、演化公開課程'],
  overview:'生殖把生命延續到下一代；遺傳說明特徵如何透過遺傳物質傳遞；變異讓後代彼此不同；演化則研究族群中的遺傳特徵如何隨世代改變。這四件事彼此連續，但不能混成同一概念。',
  concepts:[
    {title:'無性生殖與有性生殖',explanation:'無性生殖通常由單一親代產生後代，遺傳組合較接近親代；有性生殖涉及配子結合，會增加遺傳組合的多樣性。'},
    {title:'細胞分裂與生長修補',explanation:'體細胞分裂可增加細胞數，參與生長與組織修補；分裂前遺傳物質需要複製並合理分配。'},
    {title:'配子與受精',explanation:'有性生殖中，精子與卵等配子結合形成受精卵，遺傳資訊來自雙親。'},
    {title:'基因、染色體與遺傳物質',explanation:'基因是遺傳資訊的功能單位之一，位於染色體上的特定位置；染色體主要由 DNA 與蛋白質構成。'},
    {title:'性狀與等位基因',explanation:'同一性狀可能有不同遺傳版本；表現型除了受到遺傳影響，也可能受環境影響。'},
    {title:'變異的來源',explanation:'有性生殖的遺傳重組與突變都可造成遺傳差異；後天環境也可造成非遺傳性的差異。'},
    {title:'天擇作用於表現差異，演化發生在族群',explanation:'在特定環境中，有些可遺傳差異可能讓個體較容易存活繁殖，經多代後相關遺傳特徵在族群中的比例改變。個體不會因為「需要」就在一生中演化。'},
    {title:'演化不是朝向完美',explanation:'演化沒有預先設定的終點；適應性取決於環境，環境改變時原本有利的特徵也可能不再有利。'},
  ],
  workedExamples:[{title:'抗藥性不是細菌「故意學會」的',context:'一群細菌原本就有少數個體因遺傳差異對某抗生素較不敏感。用藥後，多數敏感細菌死亡，較不敏感者較容易存活並繁殖。',prompt:'多代之後，為什麼族群中抗藥性比例會上升？',steps:['抗藥差異在用藥前就可能存在，不是藥物讓每隻細菌主動產生需要的突變。','抗生素形成選汰壓力。','較能存活者留下更多後代。','若抗藥差異可遺傳，相關特徵比例會在族群中上升。'],answer:'抗生素選擇了原本存在的可遺傳差異，使抗藥型較容易留下後代。',explanation:'這是自然選擇的經典邏輯：變異先存在，環境造成差異繁殖成功率，族群隨世代改變。'}],
  questions:[
    {id:'g7-science-s2-u2-q1',kind:'choice',level:'理解',prompt:'有性生殖相較無性生殖，通常更容易產生什麼？',options:['遺傳組合多樣性','完全相同的所有後代','不需要遺傳物質','沒有配子'],correctIndex:0,explanation:'雙親遺傳資訊的重新組合可增加後代差異。'},
    {id:'g7-science-s2-u2-q2',kind:'choice',level:'理解',prompt:'體細胞分裂的重要功能之一是？',options:['生長與修補','製造天氣','直接形成生態系','讓所有性狀改變'],correctIndex:0,explanation:'體細胞分裂增加細胞數，參與生長與組織修補。'},
    {id:'g7-science-s2-u2-q3',kind:'choice',level:'理解',prompt:'受精是指什麼？',options:['精子與卵等配子結合','任何細胞長大','染色體完全消失','個體自動變成成體'],correctIndex:0,explanation:'配子結合形成受精卵是有性生殖的重要步驟。'},
    {id:'g7-science-s2-u2-q4',kind:'choice',level:'理解',prompt:'下列哪個說法較正確？',options:['表現型常同時受遺傳與環境影響','所有性狀只由環境決定','所有性狀只由單一基因決定','後天鍛鍊一定直接改變配子 DNA 並遺傳'],correctIndex:0,explanation:'許多性狀是基因與環境共同作用的結果。'},
    {id:'g7-science-s2-u2-q5',kind:'choice',level:'應用',prompt:'抗生素使用後抗藥細菌比例增加，較合理的解釋是？',options:['原本差異中較抗藥者存活繁殖比例較高','每隻細菌知道需要抗藥所以同時改變','藥物讓所有細菌變成同一基因型','抗藥性和遺傳完全無關'],correctIndex:0,explanation:'自然選擇作用於既有可遺傳差異。'},
    {id:'g7-science-s2-u2-q6',kind:'choice',level:'理解',prompt:'「演化」主要描述哪個層次的長期改變？',options:['族群中遺傳特徵比例跨世代改變','單一個體每天長高','一個人努力後變強','器官在一小時內變大'],correctIndex:0,explanation:'演化是族群跨世代的遺傳組成變化。'},
    {id:'g7-science-s2-u2-q7',kind:'choice',level:'檢核',prompt:'哪一句最需要修正？',options:['長頸鹿因為需要吃高處葉子，所以每隻都努力把脖子拉長並直接遺傳','族群中原本可能有頸長差異','環境會影響不同個體的繁殖成功率','可遺傳差異可在多代後改變族群特徵比例'],correctIndex:0,explanation:'「因需要而主動產生適應並直接遺傳」不是自然選擇的機制。'},
    {id:'g7-science-s2-u2-q8',kind:'response',level:'檢核',prompt:'請用「變異、環境、繁殖成功率、世代」四個詞說明自然選擇。',sampleAnswer:'族群原本存在可遺傳變異，在特定環境中不同變異造成不同生存或繁殖成功率，經過多個世代後，相關遺傳特徵的比例可能改變。',explanation:'四個關鍵詞能把自然選擇從目的論敘述拉回實際機制。'},
  ],
  takeaway:['生殖延續生命，遺傳傳遞資訊。','有性生殖增加遺傳組合多樣性。','遺傳與環境可共同影響性狀。','自然選擇作用於既有變異。','演化是族群跨世代改變，不是個體因需要而改變。'],
}

const ecologyEnvironment: ReviewedUnitContent = {
  grade:7,subject:'science',unitId:'g7-science-s2-u3',reviewStatus:'reviewed',
  researchBasis:['十二年國教自然科學領域生態系與環境','七年級分類、生態、環境公開課程'],
  overview:'生態學不是只背「食物鏈箭頭」。要先辨認個體、族群、群集、生態系層次，再看能量、物質、族群互動與環境條件如何一起改變生態系。',
  concepts:[
    {title:'分類與親緣',explanation:'分類是用共同特徵整理生物多樣性；現代分類也重視演化親緣。學名可提供跨語言一致的物種命名方式。'},
    {title:'個體、族群、群集、生態系',explanation:'同種生物在特定區域形成族群；多個不同物種族群形成群集；群集再加上非生物環境組成生態系。'},
    {title:'棲地與生態棲位',explanation:'棲地是生物生活的地方；棲位更包含資源利用、活動時間、食物與生態角色。兩物種生活在同一棲地，不代表棲位完全相同。'},
    {title:'生產者、消費者、分解者',explanation:'生產者把外界能量轉成有機物；消費者取食其他生物；分解者分解遺體與排遺，使物質回到環境。'},
    {title:'食物網比單一食物鏈更接近真實',explanation:'一個物種常有多種食物來源與天敵，因此多條食物鏈交織成食物網。'},
    {title:'能量逐營養階層減少',explanation:'能量在代謝與呼吸中有大量散失為熱，能傳到下一營養階層的只是一部分，因此高營養階層通常能支持的生物量較少。'},
    {title:'物質循環',explanation:'水、碳、氮等物質可在環境與生物間循環；分解作用對物質回收非常重要。'},
    {title:'族群交互作用',explanation:'捕食、競爭、寄生、互利等關係會影響族群數量，但結果依資源、環境與其他物種而變。'},
    {title:'人類活動與生物多樣性',explanation:'棲地破壞、污染、過度利用、外來種與氣候變遷都可能改變生態系；保育需同時考慮物種、棲地、制度與人類需求。'},
  ],
  workedExamples:[{title:'昆蟲減少為什麼不只影響一種鳥',context:'農田中大量使用廣效性殺蟲劑後，昆蟲數量明顯下降。當地食蟲鳥以昆蟲為主要食物，部分植物也依靠昆蟲授粉。',prompt:'可能出現哪些連鎖影響？',steps:['昆蟲下降使食蟲鳥食物來源減少。','授粉昆蟲下降可能影響部分植物繁殖。','植物變化又可能影響其他以植物為食或棲息其上的生物。','若殺蟲劑也直接影響非目標生物，效應更複雜。'],answer:'影響可能沿食物網與授粉關係擴散，不能只看「昆蟲→鳥」單一食物鏈。',explanation:'生態系是網絡，改變一個族群可能透過多條關係造成間接效應。'}],
  questions:[
    {id:'g7-science-s2-u3-q1',kind:'choice',level:'理解',prompt:'同一森林中所有梅花鹿個體合稱什麼？',options:['族群','群集','生態系','生物圈'],correctIndex:0,explanation:'同物種在特定時間與地點的一群個體稱族群。'},
    {id:'g7-science-s2-u3-q2',kind:'choice',level:'理解',prompt:'「森林中的所有生物＋土壤、水、光與氣候」最接近哪個層次？',options:['生態系','族群','單一個體','一種器官'],correctIndex:0,explanation:'生態系包含生物群集和非生物環境。'},
    {id:'g7-science-s2-u3-q3',kind:'choice',level:'理解',prompt:'分解者的重要功能之一是？',options:['把遺體與排遺中的物質分解並回到環境','製造所有太陽能','讓物質永遠消失','只吃活的大型動物'],correctIndex:0,explanation:'分解作用是物質循環的重要環節。'},
    {id:'g7-science-s2-u3-q4',kind:'choice',level:'理解',prompt:'為什麼食物網通常比單一食物鏈更接近真實生態系？',options:['多數生物有不只一種食物或天敵','每個生物都只吃一種食物','食物網沒有方向','食物網不包含能量'],correctIndex:0,explanation:'真實生態關係通常由多條取食關係交織。'},
    {id:'g7-science-s2-u3-q5',kind:'choice',level:'應用',prompt:'高營養階層通常能支持的生物量較少，較主要的原因是？',options:['能量在每一階層代謝過程中有大量散失','能量會在高階層自動增加','所有消費者不需要能量','分解者阻止能量流動'],correctIndex:0,explanation:'只有部分能量能轉移到下一營養階層。'},
    {id:'g7-science-s2-u3-q6',kind:'choice',level:'理解',prompt:'兩種鳥生活在同一森林，一種夜間吃昆蟲、一種白天吃果實。這最能說明？',options:['可共享棲地但生態棲位不同','兩者一定是同一物種','棲地和棲位完全相同','沒有競爭就不是生物'],correctIndex:0,explanation:'棲位包含資源、時間與生態角色，不只是住在哪裡。'},
    {id:'g7-science-s2-u3-q7',kind:'choice',level:'檢核',context:'外來植物進入濕地後快速擴張，排擠原生植物。',prompt:'下列哪個研究最有助於判斷影響？',options:['比較入侵前後原生植物覆蓋、物種數與相關動物變化','只拍一張漂亮照片','只問植物名字好不好聽','假設所有外來種影響都完全相同'],correctIndex:0,explanation:'需要可比較的生態資料，而非只靠標籤判斷。'},
    {id:'g7-science-s2-u3-q8',kind:'response',level:'檢核',context:'某湖泊魚類大量死亡，同時水中藻類暴增。',prompt:'請提出至少兩個需要蒐集的資料，才能進一步判斷原因。',sampleAnswer:'可測溶氧、營養鹽、溫度、pH、污染物、藻類種類與時間變化，並比較死亡前後資料。',explanation:'生態事件往往有多個可能因素，應先收集能區分假設的證據。'},
  ],
  takeaway:['生態系包含生物與非生物環境。','棲地不等於生態棲位。','食物網呈現多重關係。','能量逐階層減少，物質則可循環。','保育要用資料分析多重人為壓力。'],
}

const UNITS: Record<string, ReviewedUnitContent> = {
  [methodCells.unitId]: methodCells,
  [organization.unitId]: organization,
  [nutritionEnergy.unitId]: nutritionEnergy,
  [transportCoordination.unitId]: transportCoordination,
  [reproductionGeneticsEvolution.unitId]: reproductionGeneticsEvolution,
  [ecologyEnvironment.unitId]: ecologyEnvironment,
}

export function getReviewedScience7UnitContent(unitId: string) {
  return UNITS[unitId] ?? null
}
