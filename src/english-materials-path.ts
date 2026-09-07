export type PathSentence = { en: string; zh: string; word: string; distractors: string[]; note: string }
export const MATERIAL_UNITS: { title: string; titleEn: string; sentences: PathSentence[] }[] = [
  { title: '打招呼與自我介紹', titleEn: 'Meet someone', sentences: [
    { en: 'My name is Alex.', zh: '我的名字是 Alex。', word: 'is', distractors: ['am', 'are'], note: 'My name 是單數，搭配 is；I 才搭配 am。' },
    { en: 'I am a student.', zh: '我是一名學生。', word: 'a', distractors: ['an', 'two'], note: 'student 的開頭是子音 /s/，單數身分前用 a。' },
    { en: 'Nice to meet you.', zh: '很高興認識你。', word: 'meet', distractors: ['meets', 'meeting'], note: 'Nice to meet you 是初次見面的招呼語，to 後接原形動詞 meet。' },
  ]},
  { title: '在咖啡店點餐', titleEn: 'Order at a café', sentences: [
    { en: 'I would like some tea.', zh: '我想要一些茶。', word: 'some', distractors: ['a', 'many'], note: 'tea 在這裡是不可數飲料，用 some；一杯茶則是 a cup of tea。' },
    { en: 'Can I have the menu?', zh: '可以給我菜單嗎？', word: 'have', distractors: ['has', 'having'], note: 'Can 後接原形動詞，Can I have ...? 可用來提出請求。' },
    { en: 'How much is this sandwich?', zh: '這個三明治多少錢？', word: 'much', distractors: ['many', 'long'], note: 'How much 問價格；How many 問可數物品的數量。' },
  ]},
  { title: '問路與位置', titleEn: 'Find your way', sentences: [
    { en: 'Where is the station?', zh: '車站在哪裡？', word: 'Where', distractors: ['When', 'Who'], note: 'Where 問地點；When 問時間；Who 問人物。' },
    { en: 'Turn left at the bank.', zh: '在銀行那裡左轉。', word: 'at', distractors: ['under', 'between'], note: 'at the bank 把銀行當作轉彎的地點標記。' },
    { en: 'The park is next to the school.', zh: '公園在學校旁邊。', word: 'to', distractors: ['from', 'of'], note: 'next to 是固定的介系詞片語，表示緊鄰、在旁邊。' },
  ]},
  { title: '日常生活', titleEn: 'Daily routines', sentences: [
    { en: 'She walks to work every day.', zh: '她每天走路上班。', word: 'walks', distractors: ['walk', 'walking'], note: '現在簡單式描述習慣；主詞 she 為第三人稱單數，動詞加 s。' },
    { en: 'I get up at seven.', zh: '我七點起床。', word: 'at', distractors: ['on', 'in'], note: '明確鐘點前用 at；日期、星期前通常用 on。' },
    { en: 'Do you like music?', zh: '你喜歡音樂嗎？', word: 'Do', distractors: ['Does', 'Are'], note: 'like 是一般動詞；主詞 you 的現在簡單式問句用 Do。' },
  ]},
  { title: '昨天做了什麼', titleEn: 'Talk about yesterday', sentences: [
    { en: 'I visited my friend yesterday.', zh: '我昨天拜訪了朋友。', word: 'visited', distractors: ['visit', 'visiting'], note: 'yesterday 指過去時間，visit 的規則過去式為 visited。' },
    { en: 'Did you enjoy the movie?', zh: '你喜歡那部電影嗎？', word: 'enjoy', distractors: ['enjoyed', 'enjoys'], note: 'Did 已標示過去式，後面的 enjoy 要用原形。' },
    { en: 'We were at home last night.', zh: '我們昨晚在家。', word: 'were', distractors: ['was', 'are'], note: 'last night 是過去；we 的 be 動詞過去式為 were。' },
  ]},
  { title: '安排明天', titleEn: 'Make plans', sentences: [
    { en: 'I will call you tomorrow.', zh: '我明天會打電話給你。', word: 'call', distractors: ['called', 'calls'], note: 'will 後接原形動詞，用來表達未來行動。' },
    { en: 'We are going to visit Taipei.', zh: '我們打算去臺北。', word: 'are', distractors: ['is', 'am'], note: 'be going to 表示計畫；we 對應的 be 動詞為 are。' },
    { en: 'Let us meet at noon.', zh: '我們中午見面吧。', word: 'meet', distractors: ['meeting', 'met'], note: 'Let us（Let’s）後接原形動詞，表示提議一起做某件事。' },
  ]},
]

export function normalizePathAnswer(value: string) {
  return value.trim().toLowerCase().replace(/[.!?,]/g, '').replace(/\s+/g, ' ')
}
