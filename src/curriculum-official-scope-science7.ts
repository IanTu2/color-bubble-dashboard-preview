export type Science7OfficialScopeItem = {
  code: string
  summary: string
}

export type Science7OfficialUnitScope = {
  unitId: string
  title: string
  items: Science7OfficialScopeItem[]
  note?: string
}

// 重要：自然科學課綱中的「Ⅳ」是第四學習階段（國中七～九年級），
// 並非國家統一指定某個代碼一定要放在七年級某學期。
// 此檔用途是把 Bubble Space 目前「七年級生物」教學序列，對照到正式第四學習階段內容；
// 年級／學期順序屬平台課程編排，不能把常見教科書順序誤稱成全國唯一排法。
export const SCIENCE7_STAGE_IV_SCOPE: Science7OfficialUnitScope[] = [
  {
    unitId: 'g7-science-s1-u1',
    title: '科學方法、顯微鏡與細胞',
    items: [
      { code: 'po-Ⅳ-1 / po-Ⅳ-2', summary: '從觀察與既有知識發現問題，形成可探究、可驗證的提問' },
      { code: 'pe-Ⅳ-1 / pe-Ⅳ-2', summary: '辨認變因、規劃控制與重複，並安全操作、客觀觀察與量測記錄' },
      { code: 'Da-Ⅳ-1', summary: '使用適當儀器觀察細胞形態與細胞膜、細胞質、細胞核、細胞壁等基本構造' },
      { code: 'Da-Ⅳ-2', summary: '理解細胞是組成生物體的基本單位' },
    ],
    note: '探究表現不是只在第一單元使用；後續實驗、資料判讀也應持續練習。',
  },
  {
    unitId: 'g7-science-s1-u2',
    title: '細胞分化、生物體組成層次與構造功能',
    items: [
      { code: 'Da-Ⅳ-3', summary: '多細胞個體具有細胞、組織、器官、器官系統等組成層次' },
      { code: 'Fc-Ⅳ-2', summary: '從細胞、分子到更小粒子理解生命世界中的不同尺度' },
    ],
  },
  {
    unitId: 'g7-science-s1-u3',
    title: '營養、酵素、消化、呼吸與光合作用',
    items: [
      { code: 'Db-Ⅳ-1', summary: '人體經由攝食、消化與吸收獲得所需養分' },
      { code: 'Bc-Ⅳ-1', summary: '酵素催化新陳代謝，並可用實驗探討影響酵素作用速率的因素' },
      { code: 'Bc-Ⅳ-2', summary: '細胞利用養分進行呼吸作用釋放能量' },
      { code: 'Bc-Ⅳ-3', summary: '植物利用葉綠體進行光合作用，將二氧化碳與水轉成醣類養分並釋出氧氣' },
      { code: 'Bc-Ⅳ-4', summary: '日光、二氧化碳與水分等因素會影響光合作用，可透過探究實驗檢驗' },
    ],
  },
  {
    unitId: 'g7-science-s2-u1',
    title: '運輸、神經／內分泌協調與恆定',
    items: [
      { code: 'Db-Ⅳ-2', summary: '人體循環系統運送物質至細胞並進行物質交換' },
      { code: 'Db-Ⅳ-3', summary: '呼吸系統與外界交換氣體' },
      { code: 'Db-Ⅳ-6', summary: '植物根、莖、葉、花、果實內的維管束具有運輸功能' },
      { code: 'Dc-Ⅳ-1', summary: '神經系統察覺環境變動並產生反應' },
      { code: 'Dc-Ⅳ-2', summary: '內分泌系統調節代謝並協助維持體內物質恆定' },
      { code: 'Dc-Ⅳ-3', summary: '皮膚與淋巴系統參與人體防禦與免疫' },
      { code: 'Dc-Ⅳ-4', summary: '多個系統協調，使體內物質與狀態維持在一定範圍' },
      { code: 'Dc-Ⅳ-5', summary: '生物能感知環境變化並作出反應以維持內部穩定，可用觀察或改變變因探討' },
    ],
  },
  {
    unitId: 'g7-science-s2-u2',
    title: '生殖、遺傳、變異與演化',
    items: [
      { code: 'Da-Ⅳ-4', summary: '細胞分裂過程伴隨染色體的變化' },
      { code: 'Db-Ⅳ-4', summary: '人體生殖系統產生配子進行有性生殖' },
      { code: 'Db-Ⅳ-7', summary: '花的雄蕊、雌蕊與配子／種子形成相關構造' },
      { code: 'Ga-Ⅳ-1', summary: '有性與無性生殖及其後代差異' },
      { code: 'Ga-Ⅳ-2', summary: '人類性別主要與性染色體相關' },
      { code: 'Ga-Ⅳ-3', summary: 'ABO 血型是可遺傳性狀' },
      { code: 'Ga-Ⅳ-4', summary: '遺傳物質變異可能改變性狀，發生於生殖細胞的變異可能傳給後代' },
      { code: 'Ga-Ⅳ-5', summary: '生物技術可解決問題，也可能產生新的倫理與環境議題' },
      { code: 'Ga-Ⅳ-6', summary: '孟德爾遺傳研究的科學史與資料推理' },
      { code: 'Gb-Ⅳ-1', summary: '利用化石證據理解過去生物、消失與演化歷史' },
    ],
  },
  {
    unitId: 'g7-science-s2-u3',
    title: '分類、生態系、能量與環境',
    items: [
      { code: 'Fc-Ⅳ-1', summary: '生物圈包含不同生態系，生物因子可由個體、族群、群集等層次理解' },
      { code: 'Bd-Ⅳ-1', summary: '太陽是生態系重要能量來源，能量經食物鏈在生物間流轉' },
      { code: 'Bd-Ⅳ-2', summary: '碳元素以不同物質形式在生物與無生物環境間循環' },
      { code: 'Bd-Ⅳ-3', summary: '生產者、消費者與分解者共同參與能量流轉和物質循環' },
      { code: 'Gc-Ⅳ-1', summary: '可依生物形態與構造特徵進行分類' },
      { code: 'Gc-Ⅳ-2', summary: '生物多樣性中的不同生物扮演不同生態角色，有助生態系穩定' },
      { code: 'Gc-Ⅳ-3 / Gc-Ⅳ-4', summary: '微生物與人體、生活及生物技術之間有多樣關係' },
      { code: 'La-Ⅳ-1', summary: '生物與生物／環境的交互作用會使生態系結構隨時間改變' },
      { code: 'Lb-Ⅳ-1～Lb-Ⅳ-3', summary: '非生物因子影響生物分布；人類活動改變環境，也能採取行動維持生物棲地與生態平衡' },
    ],
  },
]

export function getScience7StageIVScope(unitId: string) {
  return SCIENCE7_STAGE_IV_SCOPE.find((item) => item.unitId === unitId) ?? null
}

export function science7StageIVScopeUnitIds() {
  return SCIENCE7_STAGE_IV_SCOPE.map((item) => item.unitId)
}
