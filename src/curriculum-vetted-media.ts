import type { CurriculumSubjectId } from './curriculum-plan'

export type CurriculumMediaAsset = {
  id: string
  subject: CurriculumSubjectId
  match: RegExp
  src: string
  sourcePage: string
  title: string
  caption: string
  alt: string
  license: string
  attribution: string
}

export const CURRICULUM_VETTED_MEDIA: CurriculumMediaAsset[] = [
  {
    id: 'science-animal-cell-cc0',
    subject: 'science',
    match: /(動物細胞|細胞膜|細胞核|粒線體|內質網|高基氏體|胞器)/,
    src: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Animal%20cell%20structure%20gl.svg',
    sourcePage: 'https://commons.wikimedia.org/wiki/File:Animal_cell_structure_gl.svg',
    title: '動物細胞構造',
    caption: '用完整細胞構造圖對照細胞膜、細胞核、粒線體、內質網與其他胞器的位置；學習時應把名稱、位置與功能一起對照。',
    alt: '具有多種胞器細節的動物細胞構造圖',
    license: 'CC0 1.0',
    attribution: 'LadyofHats / Wikimedia Commons',
  },
  {
    id: 'science-plant-cell-public-domain',
    subject: 'science',
    match: /(植物細胞|細胞壁|葉綠體|液胞)/,
    src: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Plant%20cell%20structure%20svg.svg',
    sourcePage: 'https://commons.wikimedia.org/wiki/File:Plant_cell_structure_svg.svg',
    title: '植物細胞構造',
    caption: '植物細胞除了細胞膜與細胞核，還可辨認細胞壁、葉綠體與大型液胞；可拿來和動物細胞逐項比較。',
    alt: '具有細胞壁、葉綠體、液胞與其他胞器的植物細胞構造圖',
    license: 'Public domain',
    attribution: 'LadyofHats / Wikimedia Commons',
  },
  {
    id: 'social-taiwan-relief',
    subject: 'social',
    match: /(臺灣.*地形|台灣.*地形|中央山脈|山脈|地勢|地形分布|地形區)/,
    src: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Reliefkarte%20Taiwan.png',
    sourcePage: 'https://commons.wikimedia.org/wiki/File:Reliefkarte_Taiwan.png',
    title: '臺灣地形陰影圖',
    caption: '陰影地形能直接看出臺灣山地集中於中東部、平原多位在西部的空間差異；閱讀時可搭配方向、比例尺與河川分布思考。',
    alt: '呈現臺灣山脈和平原高低起伏的地形陰影圖',
    license: 'Wikimedia Commons file license; topographic background from NASA SRTM public-domain data',
    attribution: 'Tschubby / Wikimedia Commons; NASA SRTM terrain data',
  },
  {
    id: 'social-taiwan-blank-map',
    subject: 'social',
    match: /(臺灣.*位置|台灣.*位置|經緯度|相對位置|絕對位置|海域|方位)/,
    src: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Taiwan-blank-map.png',
    sourcePage: 'https://commons.wikimedia.org/wiki/File:Taiwan-blank-map.png',
    title: '臺灣位置底圖',
    caption: '位置題先用乾淨底圖確認島嶼輪廓、方位與周邊海域，再疊加經緯度、城市或地形資訊，避免一次塞太多符號。',
    alt: '臺灣島輪廓與周邊位置底圖',
    license: 'Public domain',
    attribution: 'CIA World Factbook-derived map / Wikimedia Commons',
  },
  {
    id: 'social-taiwan-topography-cc0',
    subject: 'social',
    match: /(中央山脈|地形剖面|高低起伏|地勢差異)/,
    src: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Mapa%20topogr%C3%A1fico%20de%20Taiwan.png',
    sourcePage: 'https://commons.wikimedia.org/wiki/File:Mapa_topogr%C3%A1fico_de_Taiwan.png',
    title: '臺灣中央山地分布示意',
    caption: '這張地形圖可用來辨認中央山地帶與周圍低地的對比，適合搭配「為什麼人口與交通分布不均」之類的空間推論。',
    alt: '強調臺灣中央山地分布的地形圖',
    license: 'CC0 1.0',
    attribution: 'Mariaclaramp / Wikimedia Commons',
  },
]

export function findVettedCurriculumMedia(subject: CurriculumSubjectId, text: string) {
  return CURRICULUM_VETTED_MEDIA.find((asset) => asset.subject === subject && asset.match.test(text)) ?? null
}
