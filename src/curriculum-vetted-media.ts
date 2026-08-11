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
    id: 'science-animal-cell-zhtw',
    subject: 'science',
    match: /(動物細胞|細胞膜|細胞核|粒線體|內質網|高基氏體|胞器)/,
    src: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Animal%20cell%20structure%20zhtw.svg',
    sourcePage: 'https://commons.wikimedia.org/wiki/File:Animal_cell_structure_zhtw.svg',
    title: '動物細胞構造（繁體中文標示）',
    caption: '直接用完整的動物細胞構造圖對照胞器名稱、位置與功能；比簡化成幾個圓形更適合真正教「細胞構造」。',
    alt: '繁體中文標示的動物細胞構造圖，包含細胞核、粒線體、內質網、高基氏體等胞器',
    license: 'CC BY-SA 3.0',
    attribution: 'LadyofHats 原圖；丁志仁繁體中文翻譯 / Wikimedia Commons',
  },
  {
    id: 'science-plant-cell-zhtw',
    subject: 'science',
    match: /(植物細胞|細胞壁|葉綠體|液胞)/,
    src: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Plant%20cell%20structure%20svg%20zh-hant.svg',
    sourcePage: 'https://commons.wikimedia.org/wiki/File:Plant_cell_structure_svg_zh-hant.svg',
    title: '植物細胞構造（繁體中文標示）',
    caption: '利用細節完整的植物細胞圖比較細胞壁、細胞膜、葉綠體、大型液胞與其他胞器，再和動物細胞逐項對照。',
    alt: '繁體中文標示的植物細胞構造圖，包含細胞壁、葉綠體、大型液胞與其他胞器',
    license: 'Public domain',
    attribution: 'LadyofHats / Mariana Ruiz Villarreal 原圖；User:159265 繁體中文翻譯 / Wikimedia Commons',
  },
  {
    id: 'science-circulatory-system',
    subject: 'science',
    match: /(血液循環|循環系統|心臟|動脈|靜脈|血管|體循環|肺循環)/,
    src: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Circulatory%20System%20no%20tags.svg',
    sourcePage: 'https://commons.wikimedia.org/wiki/File:Circulatory_System_no_tags.svg',
    title: '人體循環系統',
    caption: '先用完整人體循環圖追蹤心臟、肺與全身血管的路徑，再於教材文字中標示體循環與肺循環方向。',
    alt: '人體循環系統前視圖，呈現心臟與全身主要血管路徑',
    license: 'Public-domain derivative of LadyofHats circulatory-system diagram',
    attribution: 'LadyofHats / Wikimedia Commons',
  },
  {
    id: 'science-digestive-system',
    subject: 'science',
    match: /(消化系統|消化道|口腔|食道|胃|小腸|大腸|肝臟|胰臟|營養消化)/,
    src: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Digestive%20system%20diagram%20en.svg',
    sourcePage: 'https://commons.wikimedia.org/wiki/File:Digestive_system_diagram_en.svg',
    title: '人體消化系統',
    caption: '完整人體消化圖可用來追蹤食物從口腔、食道、胃到小腸與大腸的路徑，並辨認肝臟與胰臟等附屬器官。',
    alt: '人體消化系統構造圖，呈現口腔、食道、胃、小腸、大腸、肝臟與胰臟',
    license: 'Public domain',
    attribution: 'LadyofHats / Wikimedia Commons',
  },
  {
    id: 'science-food-web',
    subject: 'science',
    match: /(食物網|食物鏈|生態系|能量流動|營養階層|生產者|消費者)/,
    src: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/FoodWeb.svg',
    sourcePage: 'https://commons.wikimedia.org/wiki/File:FoodWeb.svg',
    title: '生態系食物網',
    caption: '真正的食物網圖能同時呈現多條食物鏈的交織關係，適合討論生產者、不同級消費者與能量流動，而不是只畫四個圓圈。',
    alt: '由多種生物與箭頭構成的生態系食物網圖',
    license: 'CC0 1.0 derivative',
    attribution: 'Thompsma / Pixelsquid / Wikimedia Commons',
  },
  {
    id: 'social-taiwan-relief',
    subject: 'social',
    match: /(臺灣.*地形|台灣.*地形|中央山脈|山脈|地勢|地形分布|地形區|平原|盆地|丘陵)/,
    src: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Reliefkarte%20Taiwan.png',
    sourcePage: 'https://commons.wikimedia.org/wiki/File:Reliefkarte_Taiwan.png',
    title: '臺灣高解析地形陰影圖',
    caption: '以地形陰影直接辨認臺灣山地集中於中東部、低地與平原多在西側的空間差異，適合搭配山脈、河川、人口與交通分布一起讀。',
    alt: '高解析臺灣地形陰影圖，清楚呈現中央山脈與周邊低地起伏',
    license: 'Wikimedia Commons file license; terrain background uses NASA SRTM public-domain data',
    attribution: 'Tschubby / Wikimedia Commons；NASA SRTM terrain data',
  },
  {
    id: 'social-taiwan-blank-map',
    subject: 'social',
    match: /(臺灣.*位置|台灣.*位置|經緯度|相對位置|絕對位置|周邊海域|方位)/,
    src: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Taiwan-blank-map.png',
    sourcePage: 'https://commons.wikimedia.org/wiki/File:Taiwan-blank-map.png',
    title: '臺灣位置底圖',
    caption: '位置概念先用乾淨底圖確認島嶼輪廓、方向與周邊空間，再疊加經緯度、城市、海域或鄰近地區資訊，避免符號互相干擾。',
    alt: '臺灣島輪廓與周邊位置底圖',
    license: 'Public domain',
    attribution: 'CIA World Factbook-derived map / Wikimedia Commons',
  },
  {
    id: 'social-taiwan-topography-cc0',
    subject: 'social',
    match: /(中央山脈|高低起伏|地勢差異|山地集中)/,
    src: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Mapa%20topogr%C3%A1fico%20de%20Taiwan.png',
    sourcePage: 'https://commons.wikimedia.org/wiki/File:Mapa_topogr%C3%A1fico_de_Taiwan.png',
    title: '臺灣中央山地分布圖',
    caption: '這張圖用更明顯的方式凸顯中央山地帶，可搭配「人口、交通、產業為何集中在特定區域」進行空間推論。',
    alt: '強調臺灣中央山地帶的地形圖',
    license: 'CC0 1.0',
    attribution: 'Mariaclaramp / Wikimedia Commons',
  },
]

export function findVettedCurriculumMedia(subject: CurriculumSubjectId, text: string) {
  return CURRICULUM_VETTED_MEDIA.find((asset) => asset.subject === subject && asset.match.test(text)) ?? null
}
