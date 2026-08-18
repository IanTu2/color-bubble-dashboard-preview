import { createServer } from 'vite'

const server=await createServer({logLevel:'error',server:{middlewareMode:true},appType:'custom'})
const norm=(v)=>String(v??'').replace(/\s+/g,' ').trim()
const failures=[];let classified=0

const CH_WORD=/注音與聲韻|識字與字形|字詞運用|部件與字詞|詞語與語感|詞語、成語與語境|字音字形整合|語文基礎與工具/
const CH_CLASSIC=/文言|古典散文|古文與思想|文化經典|經典整合閱讀/
const CH_POETRY=/詩歌|詩詞|古典詩|新詩/
const CH_ARGUMENT=/論說|論證|公共議題|學術與公共論述|論述與資訊/
const CH_WRITING=/寫作|作文|圖文寫話|日記與書信|口語表達|專題表達|語文素養統整/
const CH_CROSS=/跨文本|文學與社會/
const CH_NARRATIVE=/故事|人物與情節|敘事|記敘|現代散文|現代小說|現代文學|文學閱讀|文學流變/
const CH_INFO=/段落|說明短文|說明文|資訊與說明|篇章結構|閱讀理解|閱讀銜接|深度閱讀/
const CH_SENTENCE=/完整句子|句型與標點|修辭|語法/

function expected(subject,pathway,title){
  if(subject==='math'){
    if(/100 以內|1000 以內|10000 以內|大數與四則/.test(title))return /個十|個百|個千|位值|比較|四捨五入|平均分/
    if(/加法與減法|加減計算與應用|整數四則應用/.test(title))return /積木|水果|圖書館|倉庫|盒|拿走|借出/
    if(/形狀與位置|平面與立體圖形|角度與幾何|簡單圖形與幾何符號|平面幾何|圓與幾何關係|相似與比例|幾何、測量與設計/.test(title))return /圓形|正方體|三角形|角|直線|相似|圓心角|距離/
    if(/長度|時間|日曆|分類與規律/.test(title))return /公分|公尺|毫升|公克|時鐘|活動|紅、藍|圖卡/
    if(/乘法概念|乘法與除法/.test(title))return /每組|每箱|平均分|共有/
    if(/分數|小數/.test(title))return /\d\/\d|小數|÷|分母|披薩/
    if(/因數|倍數/.test(title))return /最大公因數|最小公倍數|質因數/
    if(/面積|體積|柱體|圓與圓周/.test(title))return /平方公分|立方公分|圓周|表面積|底面積/
    if(/比與比值|比率|百分率|比例|正反比|速率/.test(title))return /百分率|比是|模型與實物|成正比|成反比|速率|公里/
    if(/代數|一元一次方程式|二元一次|直角坐標|不等式/.test(title))return /x|y=|聯立|不等式|等量/
    if(/統計|資料/.test(title))return /平均|中位數|眾數|標準差|樣本|抽樣|機率|資料/
    if(/多項式|因式分解|平方根|二次方程式|二次函數|實數與代數/.test(title))return /x²|展開|因式|畢氏|絕對值/
    if(/數列|函數/.test(title))return /等差|等比|f\(x\)|斜率|函數/
    if(/三角比/.test(title))return /sin|弧度|週期|斜邊/
    if(/向量|空間與幾何/.test(title))return /向量|長度平方|內積/
    if(/矩陣/.test(title))return /矩陣|單位矩陣|第一個分量/
    if(/排列組合|機率與風險|機率模型|機率與統計深化/.test(title))return /機率|組合|E\(X\)|期望值|獨立試驗/
    if(/指數與對數|指數、成長/.test(title))return /log|利率|10\^/
    if(/極限|微分|積分/.test(title))return /f′|導數|差商|∫|定積分|邊際/
    if(/整合|專題|素養/.test(title))return /專題|每組|代數|幾何|機率/
    return null
  }
  if(subject==='science'){
    if(pathway==='life')return /觀察|安全|感受|植物|材料|互助|生活/
    if(pathway==='physics'){
      if(/運動|力學|動量/.test(title))return /m\/s|F=ma|動量|kg·m\/s/
      if(/功、能量|熱與能量/.test(title))return /J|動能|Q=mc|kJ/
      if(/波|振動/.test(title))return /Hz|波長|頻率|干涉/
      if(/光/.test(title))return /透鏡|雙縫|成像|光/
      if(/電|磁/.test(title))return /電壓|電流|W|磁通|楞次/
      if(/近代/.test(title))return /光電子|光子|量子|頻率/
      if(/資料|實驗|專題/.test(title))return /量測|不確定性|模型|資料/
      return /物理|量測|模型|資料/
    }
    if(pathway==='chemistry'){
      if(/原子|週期/.test(title))return /質子|電子|原子/
      if(/化學鍵|分子形狀/.test(title))return /離子鍵|VSEPR|電子域/
      if(/計量|溶液|氣體/.test(title))return /mol|莫耳|濃度|M/
      if(/反應熱|速率|化學反應與能量/.test(title))return /反應|能量|碰撞|溫度/
      if(/平衡/.test(title))return /平衡|勒沙特列|NH₃/
      if(/酸鹼/.test(title))return /pH|H⁺|酸/
      if(/氧化還原|電化學/.test(title))return /電子|氧化|Zn/
      if(/有機|生物分子/.test(title))return /官能基|OH|醇/
      if(/高分子|材料/.test(title))return /高分子|結晶|生命週期|材料/
      if(/分析|實驗|專題/.test(title))return /校正|量測|控制|資料/
      return /化學|反應|分子|物質/
    }
    if(pathway==='biology'){
      if(/細胞/.test(title))return /細胞膜|訊息|細胞/
      if(/代謝|生理|調控/.test(title))return /酵素|體溫|代謝|調節/
      if(/遺傳|基因|基因體/.test(title))return /DNA|基因|染色體|等位基因/
      if(/演化|分類/.test(title))return /自然選擇|共同祖先|變異/
      if(/生態/.test(title))return /能量|食物|族群|全球變遷/
      if(/植物/.test(title))return /氣孔|CO₂|蒸散/
      if(/動物/.test(title))return /心跳|呼吸|氧氣|循環/
      if(/資料|專題/.test(title))return /樣本|變異|資料|層級/
      return /生物|細胞|遺傳|生理/
    }
    if(pathway==='earth-science'){
      if(/板塊|地質|地球內部|地表|地史|地球歷史/.test(title))return /板塊|地震|地層|P 波|S 波|災害/
      if(/大氣|天氣/.test(title))return /鋒|等壓線|氣壓|大氣/
      if(/海洋|海氣/.test(title))return /洋流|海溫|海氣|熱量/
      if(/氣候/.test(title))return /冰芯|樹輪|長期|氣候/
      if(/太陽系|宇宙|恆星|太空/.test(title))return /光譜|行星|波段|恆星/
      if(/資料|專題/.test(title))return /相關|時間|尺度|資料/
      return /地球|觀測|系統|資料/
    }
    if(/細胞|生物體|養分|運輸|生殖|生態/.test(title))return /細胞|光合作用|反射|遺傳|食物|生態/
    if(/光與能量/.test(title))return /光|鏡子|影子|反射/
    if(/電路|電與能源|電與磁/.test(title))return /電池|電路|電壓|電流|歐姆/
    if(/水循環|天氣|地球|太空|天文|地質/.test(title))return /蒸發|凝結|月相|自轉|板塊|氣候/
    if(/力|機械|能量轉換/.test(title))return /摩擦|力臂|能量|速度|浮力/
    if(/物質|原子|化學|溶液|熱/.test(title))return /密度|原子|反應|鹽水|傳導|pH/
    if(/探究|銜接|統整|環境變遷|永續/.test(title))return /量測|控制|資料|環境|探究/
    return null
  }
  if(subject==='chinese'){
    if(CH_WORD.test(title))return /謹慎|讀音|字典|詞義|語境/
    if(CH_CLASSIC.test(title))return /學而時習|三人行|知之為知之|古文|句意/
    if(CH_POETRY.test(title))return /月光|意象|詩|節奏/
    if(CH_ARGUMENT.test(title))return /主張|證據|論證|反方/
    if(CH_WRITING.test(title))return /寫作|書信|報告|主張|專題|表達/
    if(CH_CROSS.test(title))return /文本甲|文本乙|整合|比較/
    if(CH_NARRATIVE.test(title))return /人物|事件|敘事|月台|故事|描寫/
    if(CH_INFO.test(title))return /主旨|說明|步驟|雨水|段落/
    if(CH_SENTENCE.test(title))return /標點|擬人|譬喻|排比|句子/
    return null
  }
  if(subject==='english'){
    if(/聲音|字母|拼讀/.test(title))return /letter|sound|rhythm|uppercase/i
    if(/招呼|問答|對話|自我介紹|疑問詞/.test(title))return /name|how are you|where/i
    if(/單字|字彙|搭配詞|語境|教室與家庭|學校與生活/.test(title))return /pencil|school|decision|effective|ruler|activity/i
    if(/教室英語|動作與指令/.test(title))return /teacher|close|stand|listen/i
    if(/時間與日期/.test(title))return /clock|seven thirty/i
    if(/Be 動詞|簡單句與問句/.test(title))return /form of be|ready|\bis\b|\bare\b/i
    if(/現在簡單|現在式問答|日常作息/.test(title))return /every Saturday|simple present/i
    if(/現在進行/.test(title))return /right now|is reading|V-ing/i
    if(/過去進行/.test(title))return /was reading|past continuous/i
    if(/過去事件|過去簡單/.test(title))return /yesterday|visited|simple past/i
    if(/未來/.test(title))return /going to|plan|future/i
    if(/能力|情態/.test(title))return /Can I|modal/i
    if(/不定詞|動名詞/.test(title))return /enjoys|reading|gerund/i
    if(/比較/.test(title))return /heavier|comparative/i
    if(/連接詞|複句/.test(title))return /because|reason/i
    if(/完成式/.test(title))return /has finished|present perfect/i
    if(/關係子句/.test(title))return /who won|relative/i
    if(/被動/.test(title))return /was broken|passive/i
    if(/條件/.test(title))return /If it rains|conditional/i
    if(/閱讀|文本|學術|論述|多文本/.test(title))return /Passage|main idea|synthesis|limitation|author/i
    if(/寫作|段落/.test(title))return /topic sentence|thesis|claim|paragraph/i
    if(/聽|口語|簡報/.test(title))return /Speaker|note|instruction/i
    if(/跨文化/.test(title))return /custom|overgeneralization|guidance/i
    if(/自主學習|升學/.test(title))return /goal|practice|progress|strategy/i
    if(/句型整合|國中英語|複雜句|時態/.test(title))return /because|although|time clue|present|past/i
    if(/環境與世界/.test(title))return /reusable|waste|environment/i
    if(/食物|購物/.test(title))return /apples|would like/i
    if(/天氣|服裝/.test(title))return /raincoat|cold|weather/i
    if(/健康/.test(title))return /fever|should rest/i
    if(/地點|方向|旅行|交通/.test(title))return /library|next to|location/i
    return /context|meaning|form/i
  }
  if(subject==='social'){
    if(pathway==='geography')return /地圖|人口|區域|GIS|洋流|尺度|分布|空間|密度|環境/
    if(pathway==='history')return /史料|時間|作者|回憶|歷史|工業化|史學/
    if(pathway==='civics')return /法律|政策|民主|市場|權利|制度|媒體|公民|機會成本/
    if(/歷史|過去|史前|政權|殖民|戰後|文明|革命|工業化|冷戰|時代|近現代/.test(title))return /史料|老照片|訪談|時間線|歷史/
    if(/公民|民主|政府|法律|權利|經濟|市場|媒體|公共|社會議題|資訊/.test(title))return /規則|政策|民主|法律|機會成本|來源|公民/
    if(/地理|位置|地圖|環境|人口|產業|聚落|區域|亞洲|世界|全球化|永續|地方/.test(title))return /地圖|人口|區域|比例尺|地形|空間|環境/
    return /生活|資料|來源|比較/
  }
  return null
}

try{
  const plan=await server.ssrLoadModule('/src/curriculum-plan-v5.ts')
  const final=await server.ssrLoadModule('/src/curriculum-textbook-v20-reviewed-final.ts')
  for(let grade=1;grade<=12;grade++)for(const route of plan.getCurriculumRouteOptions(grade)){
    const track=plan.getCurriculumTrack(grade,route.subject,route.pathway);if(!track)continue
    for(const sem of track.semesters)for(const unit of sem.units){
      const pattern=expected(route.subject,route.pathway,unit.title)
      if(!pattern){failures.push(`${unit.id} ${unit.title}: no semantic family classification`);continue}
      classified++
      const content=final.getTextbookUnitContentV20ReviewedFinal(unit.id)
      if(!content){failures.push(`${unit.id} ${unit.title}: missing final content`);continue}
      const taskText=norm(`${(content.questions??[]).map(q=>`${q.context} ${q.prompt} ${q.kind==='choice'?(q.options??[]).join(' '):q.sampleAnswer} ${q.explanation}`).join(' ')} ${(content.workedExamples??[]).map(e=>`${e.context} ${e.prompt} ${e.answer} ${e.explanation}`).join(' ')}`)
        .replaceAll(unit.title,'').replaceAll(unit.focus,'')
      if(!pattern.test(taskText))failures.push(`${unit.id} ${unit.title}: semantic evidence missing for ${pattern}`)
    }
  }
}finally{await server.close()}
console.log('[curriculum-v20-semantic-alignment]',JSON.stringify({classified,total:453,failures:failures.length},null,2))
if(classified!==453||failures.length){console.error('[curriculum-v20-semantic-alignment] FAILED');for(const f of failures.slice(0,180))console.error(`- ${f}`);process.exit(1)}
console.log('[curriculum-v20-semantic-alignment] PASS: 453/453 active units are classified by subject/pathway/title and contain family-specific learner evidence beyond the displayed unit title/focus.')
