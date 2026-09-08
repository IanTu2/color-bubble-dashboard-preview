export type DatePrecision = 'year' | 'month' | 'range' | 'approximate' | 'unknown'

export type HistorySource = {
  slug: string
  nameZh: string
  authorOrInstitution: string
  workTitle: string
  locator: string
  url: string
  sourceType: 'primary' | 'official' | 'academic' | 'museum'
  reliability: 'primary-record' | 'reviewed' | 'reference'
  accessedAt: string
}

export type HistoryPeriod = {
  slug: string
  titleZh: string
  titleEn: string
  startYear: number
  endYear: number
  dateLabelZh: string
  summaryZh: string
  latitude: number
  longitude: number
  importance: number
}

export type HistoryStoryline = {
  slug: string
  periodSlug: string
  titleZh: string
  titleEn: string
  dateLabelZh: string
  summaryZh: string
  sequence: number
  status: 'published' | 'planned'
}

export type HistoryEvent = {
  slug: string
  periodSlug: string
  storylineSlug: string | null
  titleZh: string
  titleEn: string
  startYear: number
  endYear: number
  dateLabelZh: string
  datePrecision: DatePrecision
  category: 'politics' | 'capital' | 'succession' | 'reform' | 'military' | 'diplomacy' | 'war' | 'territory'
  summaryZh: string
  placeNameZh: string
  latitude: number | null
  longitude: number | null
  peopleZh: string[]
  importance: number
  sequence: number
  detailStatus: 'published' | 'planned'
}

export type HistoryEventNode = {
  slug: string
  eventSlug: string
  sequence: number
  dateLabelZh: string
  datePrecision: DatePrecision
  titleZh: string
  placeNameZh: string
  peopleZh: string[]
  descriptionZh: string
  causeZh: string
  previousContextZh: string
  consequenceZh: string
  disputeZh: string
  sourceSlugs: string[]
}

export type HistoryCatalog = {
  periods: HistoryPeriod[]
  storylines: HistoryStoryline[]
  events: HistoryEvent[]
  nodes: HistoryEventNode[]
  sources: HistorySource[]
}

export const historyFallbackCatalog: HistoryCatalog = {
  periods: [
    {
      slug: 'warring-states', titleZh: '戰國時期', titleEn: 'Warring States period',
      startYear: -475, endYear: -221, dateLabelZh: '前 475－前 221',
      summaryZh: '周代後期諸侯競爭、變法與兼併加速，最後由秦統一六國。戰國起點另有前 403 年等不同分期方式。',
      latitude: 34.6, longitude: 112.4, importance: 5,
    },
  ],
  storylines: [
    { slug: 'three-jin', periodSlug: 'warring-states', titleZh: '韓、趙、魏成為諸侯', titleEn: 'Recognition of the Three Jin', dateLabelZh: '前 403 起', summaryZh: '從晉國權力分解到三國取得諸侯地位。', sequence: 1, status: 'planned' },
    { slug: 'qin-rise', periodSlug: 'warring-states', titleZh: '秦國崛起', titleEn: 'Rise of Qin', dateLabelZh: '前 356 起', summaryZh: '變法、擴張與統一六國。', sequence: 2, status: 'planned' },
    { slug: 'zhao-mainline', periodSlug: 'warring-states', titleZh: '趙國主線', titleEn: 'History of Zhao', dateLabelZh: '前 403－前 222', summaryZh: '建國、遷都、君主更替、改革、外交與戰爭。', sequence: 3, status: 'published' },
    { slug: 'vertical-horizontal-alliances', periodSlug: 'warring-states', titleZh: '合縱與連橫', titleEn: 'Vertical and horizontal alliances', dateLabelZh: '戰國中後期', summaryZh: '各國結盟、外交與對秦策略。', sequence: 4, status: 'planned' },
    { slug: 'qin-unification', periodSlug: 'warring-states', titleZh: '秦滅六國', titleEn: 'Qin wars of unification', dateLabelZh: '前 230－前 221', summaryZh: '秦先後滅韓、趙、魏、楚、燕、齊。', sequence: 5, status: 'planned' },
  ],
  events: [
    { slug: 'three-jin-recognized', periodSlug: 'warring-states', storylineSlug: 'zhao-mainline', titleZh: '周威烈王承認韓、趙、魏為諸侯', titleEn: 'Zhou recognizes Han, Zhao and Wei', startYear: -403, endYear: -403, dateLabelZh: '前 403 年', datePrecision: 'year', category: 'politics', summaryZh: '韓、趙、魏取得周王室承認的諸侯地位。', placeNameZh: '周王畿／三晉', latitude: 34.7, longitude: 112.5, peopleZh: ['周威烈王', '趙烈侯'], importance: 4, sequence: 1, detailStatus: 'planned' },
    { slug: 'zhao-capital-handan', periodSlug: 'warring-states', storylineSlug: 'zhao-mainline', titleZh: '趙敬侯遷都邯鄲', titleEn: 'Zhao moves its capital to Handan', startYear: -386, endYear: -386, dateLabelZh: '前 386 年', datePrecision: 'year', category: 'capital', summaryZh: '趙國政治中心移至邯鄲。', placeNameZh: '邯鄲', latitude: 36.62, longitude: 114.49, peopleZh: ['趙敬侯'], importance: 3, sequence: 2, detailStatus: 'planned' },
    { slug: 'king-wuling-accession', periodSlug: 'warring-states', storylineSlug: 'zhao-mainline', titleZh: '趙武靈王即位', titleEn: 'King Wuling succeeds to Zhao', startYear: -325, endYear: -325, dateLabelZh: '前 325 年', datePrecision: 'year', category: 'succession', summaryZh: '趙雍即位，後稱趙武靈王。', placeNameZh: '趙國', latitude: 37.0, longitude: 113.8, peopleZh: ['趙武靈王'], importance: 3, sequence: 3, detailStatus: 'planned' },
    { slug: 'hufu-qishe', periodSlug: 'warring-states', storylineSlug: 'zhao-mainline', titleZh: '趙武靈王推行胡服騎射', titleEn: 'King Wuling adopts Hu clothing and cavalry', startYear: -307, endYear: -307, dateLabelZh: '前 307 年', datePrecision: 'year', category: 'reform', summaryZh: '趙國改革服制與騎兵運用，以改善北方作戰能力。', placeNameZh: '趙國', latitude: 38.0, longitude: 112.8, peopleZh: ['趙武靈王'], importance: 4, sequence: 4, detailStatus: 'planned' },
    { slug: 'wuling-abdicates', periodSlug: 'warring-states', storylineSlug: 'zhao-mainline', titleZh: '趙武靈王傳位趙惠文王', titleEn: 'King Wuling abdicates to King Huiwen', startYear: -299, endYear: -299, dateLabelZh: '前 299 年', datePrecision: 'year', category: 'succession', summaryZh: '趙武靈王傳位趙何，自稱主父。', placeNameZh: '趙國', latitude: 37.0, longitude: 113.8, peopleZh: ['趙武靈王', '趙惠文王'], importance: 3, sequence: 5, detailStatus: 'planned' },
    { slug: 'shaqu-disorder', periodSlug: 'warring-states', storylineSlug: 'zhao-mainline', titleZh: '沙丘之亂，趙武靈王死', titleEn: 'Sand Dune Incident and death of King Wuling', startYear: -295, endYear: -295, dateLabelZh: '前 295 年', datePrecision: 'year', category: 'succession', summaryZh: '公子章作亂失敗後，趙武靈王被圍於沙丘宮並死亡。', placeNameZh: '沙丘宮', latitude: 37.1, longitude: 114.5, peopleZh: ['趙武靈王', '公子章', '趙成'], importance: 4, sequence: 6, detailStatus: 'planned' },
    { slug: 'perfect-jade', periodSlug: 'warring-states', storylineSlug: 'zhao-mainline', titleZh: '藺相如奉璧使秦', titleEn: 'Lin Xiangru carries the jade to Qin', startYear: -283, endYear: -283, dateLabelZh: '約前 283 年', datePrecision: 'approximate', category: 'diplomacy', summaryZh: '藺相如奉和氏璧出使秦國，史事後以「完璧歸趙」流傳。', placeNameZh: '秦國', latitude: 34.33, longitude: 108.71, peopleZh: ['藺相如', '趙惠文王', '秦昭襄王'], importance: 3, sequence: 7, detailStatus: 'planned' },
    { slug: 'mianchi-meeting', periodSlug: 'warring-states', storylineSlug: 'zhao-mainline', titleZh: '秦趙澠池之會', titleEn: 'Meeting at Mianchi', startYear: -279, endYear: -279, dateLabelZh: '前 279 年', datePrecision: 'year', category: 'diplomacy', summaryZh: '秦趙兩國君主會於澠池，藺相如隨行。', placeNameZh: '澠池', latitude: 34.77, longitude: 111.76, peopleZh: ['趙惠文王', '秦昭襄王', '藺相如'], importance: 3, sequence: 8, detailStatus: 'planned' },
    { slug: 'battle-of-eyu', periodSlug: 'warring-states', storylineSlug: 'zhao-mainline', titleZh: '閼與之戰', titleEn: 'Battle of Eyu', startYear: -269, endYear: -269, dateLabelZh: '前 269 年', datePrecision: 'year', category: 'war', summaryZh: '趙奢率軍救閼與，擊敗秦軍。', placeNameZh: '閼與', latitude: 37.1, longitude: 113.0, peopleZh: ['趙奢'], importance: 3, sequence: 9, detailStatus: 'planned' },
    { slug: 'battle-of-changping', periodSlug: 'warring-states', storylineSlug: 'zhao-mainline', titleZh: '長平之戰', titleEn: 'Battle of Changping', startYear: -262, endYear: -260, dateLabelZh: '前 262－前 260 年', datePrecision: 'range', category: 'war', summaryZh: '上黨歸屬引發秦趙對抗；前 260 年趙軍在長平遭到重大失敗。', placeNameZh: '上黨／長平', latitude: 35.8, longitude: 112.9, peopleZh: ['廉頗', '趙括', '白起', '趙孝成王'], importance: 5, sequence: 10, detailStatus: 'published' },
    { slug: 'handan-relieved', periodSlug: 'warring-states', storylineSlug: 'zhao-mainline', titleZh: '邯鄲之圍解除', titleEn: 'Relief of Handan', startYear: -257, endYear: -257, dateLabelZh: '前 257 年', datePrecision: 'year', category: 'war', summaryZh: '魏、楚援軍與趙軍共同解除秦軍對邯鄲的圍攻。', placeNameZh: '邯鄲', latitude: 36.62, longitude: 114.49, peopleZh: ['平原君', '信陵君', '春申君'], importance: 4, sequence: 11, detailStatus: 'planned' },
    { slug: 'handan-falls', periodSlug: 'warring-states', storylineSlug: 'zhao-mainline', titleZh: '秦軍攻破邯鄲，趙王遷被俘', titleEn: 'Qin captures Handan and King Qian', startYear: -228, endYear: -228, dateLabelZh: '前 228 年', datePrecision: 'year', category: 'territory', summaryZh: '秦軍攻破趙都邯鄲，趙王遷被俘；公子嘉轉往代地。', placeNameZh: '邯鄲', latitude: 36.62, longitude: 114.49, peopleZh: ['王翦', '趙王遷', '趙嘉'], importance: 4, sequence: 12, detailStatus: 'planned' },
    { slug: 'dai-falls', periodSlug: 'warring-states', storylineSlug: 'zhao-mainline', titleZh: '秦滅代，趙嘉被俘', titleEn: 'Qin conquers Dai', startYear: -222, endYear: -222, dateLabelZh: '前 222 年', datePrecision: 'year', category: 'territory', summaryZh: '秦軍攻取代地，趙國殘餘政權結束。', placeNameZh: '代地', latitude: 39.4, longitude: 114.2, peopleZh: ['趙嘉'], importance: 3, sequence: 13, detailStatus: 'planned' },
    { slug: 'qin-unifies', periodSlug: 'warring-states', storylineSlug: null, titleZh: '秦統一六國', titleEn: 'Qin unifies the six states', startYear: -221, endYear: -221, dateLabelZh: '前 221 年', datePrecision: 'year', category: 'politics', summaryZh: '秦王政完成對六國的兼併並建立秦帝國。', placeNameZh: '咸陽', latitude: 34.33, longitude: 108.71, peopleZh: ['秦始皇'], importance: 5, sequence: 90, detailStatus: 'planned' },
    { slug: 'first-world-war', periodSlug: 'modern-world', storylineSlug: null, titleZh: '第一次世界大戰', titleEn: 'First World War', startYear: 1914, endYear: 1918, dateLabelZh: '1914－1918 年', datePrecision: 'range', category: 'war', summaryZh: '主要戰場集中於歐洲並擴及全球的戰爭。', placeNameZh: '歐洲及全球', latitude: 50.0, longitude: 10.0, peopleZh: [], importance: 5, sequence: 91, detailStatus: 'planned' },
    { slug: 'second-world-war', periodSlug: 'modern-world', storylineSlug: null, titleZh: '第二次世界大戰', titleEn: 'Second World War', startYear: 1939, endYear: 1945, dateLabelZh: '1939－1945 年', datePrecision: 'range', category: 'war', summaryZh: '涉及多洲戰場的全球性戰爭。', placeNameZh: '歐洲、亞洲及全球', latitude: 48.0, longitude: 20.0, peopleZh: [], importance: 5, sequence: 92, detailStatus: 'planned' },
  ],
  nodes: [
    { slug: 'changping-qin-takes-yewang', eventSlug: 'battle-of-changping', sequence: 1, dateLabelZh: '前 262 年', datePrecision: 'year', titleZh: '秦攻韓野王，上黨道路中斷', placeNameZh: '野王／上黨', peopleZh: ['秦昭襄王'], descriptionZh: '秦軍攻取野王，使上黨與韓國本土的道路被切斷。', causeZh: '秦國持續向韓國上黨方向擴張；野王是連接上黨與韓國本土的重要通道。', previousContextZh: '秦國向韓國河內、上黨方向推進。', consequenceZh: '上黨陷入孤立，歸屬問題成為秦趙衝突的引線。', disputeZh: '主要史料可定位到年份，未提供可換算的確切月日。', sourceSlugs: ['shiji-baiqi'] },
    { slug: 'changping-fengting-offers-shangdang', eventSlug: 'battle-of-changping', sequence: 2, dateLabelZh: '前 262 年', datePrecision: 'year', titleZh: '馮亭以上黨歸趙', placeNameZh: '上黨', peopleZh: ['馮亭', '平原君'], descriptionZh: '上黨郡守馮亭不願降秦，轉而將上黨交給趙國。', causeZh: '上黨已難以與韓國本土聯繫；馮亭希望藉趙國力量抵抗秦國。', previousContextZh: '野王失守，上黨與韓國本土隔絕。', consequenceZh: '趙國是否接收上黨成為朝廷內部的重要決策。', disputeZh: '馮亭的動機主要依《史記》的敘事，應與後世推測區分。', sourceSlugs: ['shiji-pingyuan'] },
    { slug: 'changping-zhao-accepts-shangdang', eventSlug: 'battle-of-changping', sequence: 3, dateLabelZh: '前 262 年', datePrecision: 'year', titleZh: '趙國決定接收上黨', placeNameZh: '邯鄲', peopleZh: ['趙孝成王', '平原君', '平陽君'], descriptionZh: '趙廷討論後接受上黨，並封賞馮亭。', causeZh: '趙方看重取得上黨的戰略與土地利益；史料同時保留反對接收、擔心招致秦軍的意見。', previousContextZh: '馮亭提出以上黨歸趙。', consequenceZh: '秦國轉而以軍事手段爭奪上黨，秦趙衝突升高。', disputeZh: '應呈現趙廷內部支持與反對兩種意見，不把決策簡化成單一動機。', sourceSlugs: ['shiji-pingyuan'] },
    { slug: 'changping-initial-fighting', eventSlug: 'battle-of-changping', sequence: 4, dateLabelZh: '前 260 年', datePrecision: 'year', titleZh: '秦趙軍在長平交戰', placeNameZh: '長平', peopleZh: ['廉頗', '王齕'], descriptionZh: '秦趙軍在長平對峙，趙軍初期交戰遭受損失。', causeZh: '秦國要奪回上黨；趙國則試圖保住所接收的地區。', previousContextZh: '趙國接收上黨，秦國出兵爭奪。', consequenceZh: '廉頗改採築壘固守，避免繼續正面交戰。', disputeZh: '各段戰事的精確日序難以完整還原。', sourceSlugs: ['shiji-lianpo', 'shiji-baiqi'] },
    { slug: 'changping-lianpo-defends', eventSlug: 'battle-of-changping', sequence: 5, dateLabelZh: '前 260 年', datePrecision: 'year', titleZh: '廉頗採取固守', placeNameZh: '長平', peopleZh: ['廉頗'], descriptionZh: '廉頗築壘堅守，不接受秦軍反覆挑戰。', causeZh: '趙軍初戰不利；繼續正面決戰風險高，固守可延緩秦軍推進。', previousContextZh: '趙軍初期作戰受挫。', consequenceZh: '戰局轉為持久對峙，趙王逐漸對久守不戰感到不滿。', disputeZh: '「希望拖垮秦軍」屬常見戰略解讀；史料明文核心是固壁不戰。', sourceSlugs: ['shiji-lianpo', 'moe-paper-war'] },
    { slug: 'changping-king-dissatisfied', eventSlug: 'battle-of-changping', sequence: 6, dateLabelZh: '前 260 年', datePrecision: 'year', titleZh: '趙王不滿廉頗久守', placeNameZh: '邯鄲／長平', peopleZh: ['趙孝成王', '廉頗'], descriptionZh: '趙王多次責備廉頗，認為趙軍失利且長期不出戰。', causeZh: '趙軍先前有損失，廉頗又拒絕秦軍挑戰；趙廷希望改變久拖不決的戰況。', previousContextZh: '廉頗長期固守，戰事無法迅速結束。', consequenceZh: '秦國得以利用趙王的不滿施行反間。', disputeZh: '趙國糧運壓力常被用來解釋換將，但主要記載對其程度與直接作用有限，不宜寫成唯一原因。', sourceSlugs: ['shiji-baiqi'] },
    { slug: 'changping-counterintelligence', eventSlug: 'battle-of-changping', sequence: 7, dateLabelZh: '前 260 年', datePrecision: 'year', titleZh: '秦國施行反間', placeNameZh: '趙國', peopleZh: ['范雎', '趙孝成王'], descriptionZh: '秦相范雎派人攜重金在趙國散布消息，宣稱秦軍真正忌憚趙括，而廉頗容易對付甚至將降。', causeZh: '廉頗固守使秦軍難以迅速突破；秦國希望趙方主動改變現行策略。', previousContextZh: '趙王已對廉頗不滿。', consequenceZh: '反間消息加深趙廷換將意願。', disputeZh: '反間的具體執行細節以《史記・白起王翦列傳》為主要依據。', sourceSlugs: ['shiji-baiqi'] },
    { slug: 'changping-zhaokuo-replaces-lianpo', eventSlug: 'battle-of-changping', sequence: 8, dateLabelZh: '前 260 年', datePrecision: 'year', titleZh: '趙括取代廉頗', placeNameZh: '邯鄲／長平', peopleZh: ['趙孝成王', '趙括', '廉頗', '藺相如', '趙括之母'], descriptionZh: '趙孝成王任命趙括接替廉頗。藺相如與趙括之母都曾反對，但趙王仍維持決定。', causeZh: '趙王不滿廉頗屢有損失、又長期避戰；秦國反間消息宣稱秦軍最怕趙括；趙括又具有名將趙奢之子的聲望。', previousContextZh: '久守不決與秦國反間共同推動換將。', consequenceZh: '趙括改變約束與軍吏配置，趙軍由守勢轉向主動出擊。', disputeZh: '確切月日未見於主要記載；持久戰的經濟壓力不應被寫成史料已明言的唯一原因。', sourceSlugs: ['shiji-lianpo', 'shiji-baiqi', 'moe-paper-war'] },
    { slug: 'changping-baiqi-secret-command', eventSlug: 'battle-of-changping', sequence: 9, dateLabelZh: '前 260 年', datePrecision: 'year', titleZh: '秦國秘密改由白起統軍', placeNameZh: '長平', peopleZh: ['秦昭襄王', '白起', '王齕'], descriptionZh: '秦國暗中任命白起為上將軍，並禁止軍中洩露白起到任的消息。', causeZh: '秦國判斷趙軍換將後可能改採進攻，希望由白起掌握決戰時機並保持情報優勢。', previousContextZh: '趙括接掌趙軍，趙方戰法即將改變。', consequenceZh: '秦軍預先部署誘敵、分割與斷糧戰術。', disputeZh: '「配合趙方換將」是事件順序上的合理判讀；秘密任命與禁洩密有史料明文。', sourceSlugs: ['shiji-baiqi'] },
    { slug: 'changping-zhao-attacks', eventSlug: 'battle-of-changping', sequence: 10, dateLabelZh: '前 260 年', datePrecision: 'year', titleZh: '趙括出擊，秦軍佯退誘敵', placeNameZh: '長平', peopleZh: ['趙括', '白起'], descriptionZh: '趙括出兵攻秦，秦軍佯敗退卻，引導趙軍離開原有陣地。', causeZh: '趙括接任後改變廉頗的固守策略；白起則利用趙軍轉守為攻的機會。', previousContextZh: '雙方先後更換主將。', consequenceZh: '秦軍以奇兵截斷趙軍後路與糧道。', disputeZh: '精確行軍路線與個別戰場位置仍有研究討論。', sourceSlugs: ['shiji-lianpo', 'shiji-baiqi'] },
    { slug: 'changping-encircled', eventSlug: 'battle-of-changping', sequence: 11, dateLabelZh: '前 260 年', datePrecision: 'year', titleZh: '趙軍被分割並斷糧', placeNameZh: '長平', peopleZh: ['趙括', '白起'], descriptionZh: '秦軍切斷趙軍糧道與後路，將趙軍分為兩部分包圍。', causeZh: '趙軍追擊秦軍後離開有利防線；秦軍預置奇兵從側後切斷聯繫。', previousContextZh: '秦軍佯退，趙軍追擊。', consequenceZh: '趙軍長期受困並逐漸斷糧。', disputeZh: '史料記載包圍與斷糧結果，現代對戰場空間的復原仍可能不同。', sourceSlugs: ['shiji-baiqi'] },
    { slug: 'changping-zhaokuo-dies', eventSlug: 'battle-of-changping', sequence: 12, dateLabelZh: '前 260 年九月', datePrecision: 'month', titleZh: '趙括突圍戰死，趙軍投降', placeNameZh: '長平', peopleZh: ['趙括', '白起'], descriptionZh: '《史記》記趙軍斷糧四十六日，趙括率精兵突圍時被射殺；失去主將後，趙軍投降。', causeZh: '趙軍被圍且糧食斷絕，必須嘗試突圍；突圍未能突破秦軍包圍。', previousContextZh: '趙軍遭包圍並斷糧四十餘日。', consequenceZh: '秦軍控制大批趙國降卒，戰事進入戰後處置。', disputeZh: '月份與四十六日依《史記》；不可換算成未有根據的現代確切日期。', sourceSlugs: ['shiji-baiqi', 'shiji-lianpo'] },
    { slug: 'changping-after-surrender', eventSlug: 'battle-of-changping', sequence: 13, dateLabelZh: '前 260 年九月後', datePrecision: 'approximate', titleZh: '秦軍處置趙國降卒', placeNameZh: '長平', peopleZh: ['白起'], descriptionZh: '《史記》記載秦軍大規模坑殺趙國降卒，只留下少數年幼者返回趙國。', causeZh: '史料將此決策與秦方擔心降卒反覆、難以控制相連。', previousContextZh: '趙軍主力投降。', consequenceZh: '趙國人口與軍事力量遭受重大損失，秦趙力量對比改變。', disputeZh: '降卒人數與「坑」的具體形式存在考古與現代研究討論，頁面不得把史料數字當成無爭議統計。', sourceSlugs: ['shiji-baiqi', 'nccu-zhao-military'] },
    { slug: 'changping-aftermath', eventSlug: 'battle-of-changping', sequence: 14, dateLabelZh: '前 259 年以後', datePrecision: 'range', titleZh: '戰後影響與邯鄲危機', placeNameZh: '趙國／邯鄲', peopleZh: ['趙孝成王', '白起', '王陵'], descriptionZh: '趙國主力受創，秦國東進優勢擴大；但秦軍後續攻趙並非立即完成，邯鄲之戰仍出現反覆。', causeZh: '長平之戰削弱趙國軍力，也加深秦趙衝突。', previousContextZh: '趙軍在長平遭到重大失敗。', consequenceZh: '秦軍進一步威脅邯鄲，魏、楚後來援趙。', disputeZh: '不應把長平之戰直接簡化成「秦立即統一」；統一仍經歷數十年與多次戰爭。', sourceSlugs: ['nccu-zhao-military', 'shiji-baiqi'] },
  ],
  sources: [
    { slug: 'shiji-zhao', nameZh: '《史記・趙世家》', authorOrInstitution: '司馬遷／中國哲學書電子化計劃', workTitle: '史記', locator: '卷四十三・趙世家', url: 'https://ctext.org/shiji/zhao-shi-jia/zh', sourceType: 'primary', reliability: 'primary-record', accessedAt: '2026-09-08' },
    { slug: 'shiji-lianpo', nameZh: '《史記・廉頗藺相如列傳》', authorOrInstitution: '司馬遷／中國哲學書電子化計劃', workTitle: '史記', locator: '卷八十一・廉頗藺相如列傳', url: 'https://ctext.org/shiji/lian-po-lin-xiang-ru-lie-zhuan/zh', sourceType: 'primary', reliability: 'primary-record', accessedAt: '2026-09-08' },
    { slug: 'shiji-baiqi', nameZh: '《史記・白起王翦列傳》', authorOrInstitution: '司馬遷／中國哲學書電子化計劃', workTitle: '史記', locator: '卷七十三・白起王翦列傳', url: 'https://ctext.org/shiji/bai-qi-wang-jian-lie-zhuan/zh', sourceType: 'primary', reliability: 'primary-record', accessedAt: '2026-09-08' },
    { slug: 'shiji-pingyuan', nameZh: '《史記・平原君虞卿列傳》', authorOrInstitution: '司馬遷／中國哲學書電子化計劃', workTitle: '史記', locator: '卷七十六・平原君虞卿列傳', url: 'https://ctext.org/shiji/ping-yuan-jun-yu-qing-lie-zhuan/zh', sourceType: 'primary', reliability: 'primary-record', accessedAt: '2026-09-08' },
    { slug: 'moe-paper-war', nameZh: '教育部《成語典》「紙上談兵」', authorOrInstitution: '中華民國教育部', workTitle: '成語典', locator: '紙上談兵・典源及典故說明', url: 'https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=50&la=0&webMd=2', sourceType: 'official', reliability: 'reviewed', accessedAt: '2026-09-08' },
    { slug: 'nccu-zhao-military', nameZh: '戰國時代趙國的軍事與外交', authorOrInstitution: '國立政治大學', workTitle: '戰國時代趙國的軍事與外交', locator: '學位論文典藏', url: 'https://ah.lib.nccu.edu.tw/item?item_id=106969', sourceType: 'academic', reliability: 'reviewed', accessedAt: '2026-09-08' },
    { slug: 'british-museum-qin', nameZh: 'British Museum：Qin unification', authorOrInstitution: 'The British Museum', workTitle: 'Horsepower: China, Mongolia and the steppe', locator: 'Research project overview', url: 'https://www.britishmuseum.org/research/projects/horsepower-china-mongolia-and-steppe', sourceType: 'museum', reliability: 'reviewed', accessedAt: '2026-09-08' },
    { slug: 'iwm-world-wars', nameZh: 'Imperial War Museums：World Wars', authorOrInstitution: 'Imperial War Museums', workTitle: 'Stories of War and Conflict', locator: 'First World War / Second World War', url: 'https://www.iwm.org.uk/history', sourceType: 'museum', reliability: 'reviewed', accessedAt: '2026-09-08' },
  ],
}

export function formatHistoryYear(year: number) {
  if (year < 0) return `前 ${Math.abs(year)} 年`
  return `${year} 年`
}

export const historyCategoryZh: Record<HistoryEvent['category'], string> = {
  politics: '政權', capital: '都城', succession: '君主', reform: '改革', military: '軍政', diplomacy: '外交', war: '戰爭', territory: '領土',
}
