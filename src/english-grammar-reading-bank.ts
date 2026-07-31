import type { EnglishQuestion } from './english-data'

type GrammarSeed = {
  id: string
  level: number
  focus: string
  cloze: string
  answer: string
  choices: string[]
  correction: string
  corrected: string
  explanation: string
}

type ReadingQuestionSeed = {
  prompt: string
  answer: string
  choices: string[]
  explanation: string
  difficultyOffset?: number
}

type ReadingPassageSeed = {
  id: string
  level: number
  title: string
  passage: string
  questions: ReadingQuestionSeed[]
}

function stableShuffle<T>(items: T[], seed: string) {
  const result = [...items]
  let value = 2166136261
  for (let index = 0; index < seed.length; index += 1) {
    value ^= seed.charCodeAt(index)
    value = Math.imul(value, 16777619)
  }
  for (let index = result.length - 1; index > 0; index -= 1) {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0
    const swapIndex = value % (index + 1)
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }
  return result
}

const GRAMMAR_SEEDS: GrammarSeed[] = [
  {
    id: 'a1-be', level: 1, focus: 'be 動詞',
    cloze: 'My parents _____ at home now.', answer: 'are', choices: ['am', 'is', 'are', 'be'],
    correction: '請改正：My parents is at home now.', corrected: 'my parents are at home now',
    explanation: 'parents 是複數主詞，因此使用 are。',
  },
  {
    id: 'a1-have', level: 1.05, focus: 'have / has',
    cloze: 'Lena _____ two brothers.', answer: 'has', choices: ['have', 'has', 'having', 'had'],
    correction: '請改正：Lena have two brothers.', corrected: 'lena has two brothers',
    explanation: '第三人稱單數 Lena 在現在式使用 has。',
  },
  {
    id: 'a1-third-person', level: 1.1, focus: '第三人稱單數',
    cloze: 'Ken _____ to school by bus every day.', answer: 'goes', choices: ['go', 'goes', 'going', 'went'],
    correction: '請改正：Ken go to school by bus every day.', corrected: 'ken goes to school by bus every day',
    explanation: '第三人稱單數的一般現在式動詞通常加 -s 或 -es。',
  },
  {
    id: 'a1-articles', level: 1.15, focus: '冠詞 a / an',
    cloze: 'She is _____ engineer.', answer: 'an', choices: ['a', 'an', 'the', 'no article'],
    correction: '請改正：She is a engineer.', corrected: 'she is an engineer',
    explanation: 'engineer 以母音音素開頭，因此使用 an。',
  },
  {
    id: 'a1-there', level: 1.2, focus: 'there is / are',
    cloze: 'There _____ a small café near the station.', answer: 'is', choices: ['am', 'is', 'are', 'have'],
    correction: '請改正：There are a small café near the station.', corrected: 'there is a small cafe near the station',
    explanation: '後方名詞 a small café 是單數，因此使用 there is。',
  },
  {
    id: 'a1-present-continuous', level: 1.3, focus: '現在進行式',
    cloze: 'The children _____ in the park right now.', answer: 'are playing', choices: ['play', 'plays', 'are playing', 'played'],
    correction: '請改正：The children playing in the park right now.', corrected: 'the children are playing in the park right now',
    explanation: '現在進行式使用 be 動詞加現在分詞。',
  },
  {
    id: 'a1-can', level: 1.4, focus: '情態動詞 can',
    cloze: 'Maya can _____ very well.', answer: 'swim', choices: ['swim', 'swims', 'swimming', 'swam'],
    correction: '請改正：Maya can swims very well.', corrected: 'maya can swim very well',
    explanation: 'can 後面接原形動詞。',
  },
  {
    id: 'a1-plural', level: 1.5, focus: '可數名詞複數',
    cloze: 'We bought three _____ at the market.', answer: 'tomatoes', choices: ['tomato', 'tomatos', 'tomatoes', 'tomatoe'],
    correction: '請改正：We bought three tomato at the market.', corrected: 'we bought three tomatoes at the market',
    explanation: '數量 three 後面使用複數名詞；tomato 的複數是 tomatoes。',
  },

  {
    id: 'a2-past-simple', level: 2, focus: '過去簡單式',
    cloze: 'We _____ the museum last Saturday.', answer: 'visited', choices: ['visit', 'visits', 'visited', 'have visited'],
    correction: '請改正：We visit the museum last Saturday.', corrected: 'we visited the museum last saturday',
    explanation: 'last Saturday 是明確過去時間，因此使用過去式。',
  },
  {
    id: 'a2-past-continuous', level: 2.1, focus: '過去進行式',
    cloze: 'I _____ dinner when the lights went out.', answer: 'was cooking', choices: ['cook', 'was cooking', 'have cooked', 'am cooking'],
    correction: '請改正：I cooking dinner when the lights went out.', corrected: 'i was cooking dinner when the lights went out',
    explanation: '過去某動作進行中，被另一個短動作打斷，使用過去進行式。',
  },
  {
    id: 'a2-since-for', level: 2.2, focus: 'since / for',
    cloze: 'Nora has worked here _____ three years.', answer: 'for', choices: ['since', 'for', 'during', 'from'],
    correction: '請改正：Nora has worked here since three years.', corrected: 'nora has worked here for three years',
    explanation: 'for 接一段時間；since 接起始時間點。',
  },
  {
    id: 'a2-comparative', level: 2.3, focus: '比較級',
    cloze: 'This route is _____ than the highway during rush hour.', answer: 'faster', choices: ['fast', 'faster', 'fastest', 'more fast'],
    correction: '請改正：This route is more fast than the highway.', corrected: 'this route is faster than the highway',
    explanation: '短形容詞 fast 的比較級是 faster。',
  },
  {
    id: 'a2-countable', level: 2.4, focus: '可數與不可數名詞',
    cloze: 'We need a little _____ before we decide.', answer: 'information', choices: ['information', 'informations', 'an information', 'inform'],
    correction: '請改正：We need a few information before we decide.', corrected: 'we need a little information before we decide',
    explanation: 'information 是不可數名詞，搭配 a little。',
  },
  {
    id: 'a2-gerund', level: 2.5, focus: '動名詞',
    cloze: 'Leo enjoys _____ photos of old buildings.', answer: 'taking', choices: ['take', 'takes', 'taking', 'to took'],
    correction: '請改正：Leo enjoys to take photos of old buildings.', corrected: 'leo enjoys taking photos of old buildings',
    explanation: 'enjoy 後面通常接動名詞。',
  },
  {
    id: 'a2-first-conditional', level: 2.6, focus: '第一類條件句',
    cloze: 'If the weather improves, we _____ hiking tomorrow.', answer: 'will go', choices: ['go', 'went', 'will go', 'would go'],
    correction: '請改正：If the weather will improve, we will go hiking.', corrected: 'if the weather improves, we will go hiking',
    explanation: '第一類條件句的 if 子句使用現在式，主要子句使用 will。',
  },
  {
    id: 'a2-modal', level: 2.7, focus: 'should / must',
    cloze: 'You _____ wear a seat belt; it is required by law.', answer: 'must', choices: ['might', 'could', 'must', 'would'],
    correction: '請改正：You must to wear a seat belt.', corrected: 'you must wear a seat belt',
    explanation: 'must 表示強制義務，後面接原形動詞。',
  },

  {
    id: 'b1-present-perfect-past', level: 3, focus: '現在完成式與過去式',
    cloze: 'I _____ that film twice, but I did not see it in the cinema.', answer: 'have seen', choices: ['saw', 'have seen', 'see', 'had saw'],
    correction: '請改正：I have seen that film yesterday.', corrected: 'i saw that film yesterday',
    explanation: '沒有明確過去時間時可用現在完成式；有 yesterday 時使用過去式。',
  },
  {
    id: 'b1-passive', level: 3.1, focus: '被動語態',
    cloze: 'The final decision _____ by the committee yesterday.', answer: 'was made', choices: ['made', 'was made', 'has making', 'is make'],
    correction: '請改正：The final decision made by the committee yesterday.', corrected: 'the final decision was made by the committee yesterday',
    explanation: '過去式被動語態使用 was/were + 過去分詞。',
  },
  {
    id: 'b1-relative', level: 3.2, focus: '關係子句',
    cloze: 'The woman _____ designed the app will speak today.', answer: 'who', choices: ['who', 'which', 'where', 'whose'],
    correction: '請改正：The woman which designed the app will speak today.', corrected: 'the woman who designed the app will speak today',
    explanation: '指人的主格關係代名詞使用 who。',
  },
  {
    id: 'b1-reported', level: 3.3, focus: '間接引語',
    cloze: 'Sam said that he _____ tired.', answer: 'was', choices: ['is', 'was', 'has', 'will'],
    correction: '請改正：Sam said that he is tired yesterday.', corrected: 'sam said that he was tired yesterday',
    explanation: '過去式 reporting verb 常伴隨時態後移。',
  },
  {
    id: 'b1-second-conditional', level: 3.4, focus: '第二類條件句',
    cloze: 'If I had more time, I _____ another language.', answer: 'would learn', choices: ['learn', 'will learn', 'would learn', 'learned'],
    correction: '請改正：If I would have more time, I learned another language.', corrected: 'if i had more time, i would learn another language',
    explanation: '與現在事實相反的假設使用 if + 過去式，would + 原形。',
  },
  {
    id: 'b1-used-to', level: 3.5, focus: 'used to',
    cloze: 'This building _____ be a railway station.', answer: 'used to', choices: ['use to', 'used to', 'is used to', 'was use to'],
    correction: '請改正：This building use to be a railway station.', corrected: 'this building used to be a railway station',
    explanation: 'used to 表示過去曾經存在、現在已改變的狀態。',
  },
  {
    id: 'b1-so-such', level: 3.6, focus: 'so / such',
    cloze: 'It was _____ a useful workshop that everyone stayed late.', answer: 'such', choices: ['so', 'such', 'very', 'too'],
    correction: '請改正：It was so useful workshop that everyone stayed late.', corrected: 'it was such a useful workshop that everyone stayed late',
    explanation: 'such + a/an + 形容詞 + 單數可數名詞。',
  },
  {
    id: 'b1-suggest', level: 3.7, focus: 'suggest 後接動名詞',
    cloze: 'The guide suggested _____ the earlier train.', answer: 'taking', choices: ['take', 'taking', 'to take', 'took'],
    correction: '請改正：The guide suggested to take the earlier train.', corrected: 'the guide suggested taking the earlier train',
    explanation: 'suggest 後常接動名詞，或接 that 子句。',
  },

  {
    id: 'b2-future-perfect', level: 4, focus: '未來完成式',
    cloze: 'By next June, the team _____ the bridge inspection.', answer: 'will have completed', choices: ['completes', 'will complete', 'will have completed', 'completed'],
    correction: '請改正：By next June, the team will completed the inspection.', corrected: 'by next june, the team will have completed the inspection',
    explanation: 'by + 未來時間常搭配 will have + 過去分詞。',
  },
  {
    id: 'b2-past-perfect', level: 4.1, focus: '過去完成式',
    cloze: 'When the auditor arrived, the staff _____ the records.', answer: 'had already prepared', choices: ['already prepared', 'had already prepared', 'have prepared', 'were prepare'],
    correction: '請改正：When the auditor arrived, the staff already prepared the records.', corrected: 'when the auditor arrived, the staff had already prepared the records',
    explanation: '在另一個過去事件之前完成的動作使用過去完成式。',
  },
  {
    id: 'b2-third-conditional', level: 4.2, focus: '第三類條件句',
    cloze: 'If we had checked the forecast, we _____ the outdoor event.', answer: 'would have postponed', choices: ['postpone', 'will postpone', 'would postpone', 'would have postponed'],
    correction: '請改正：If we checked the forecast, we would have postponed the event.', corrected: 'if we had checked the forecast, we would have postponed the event',
    explanation: '與過去事實相反使用 if + had + 過去分詞，would have + 過去分詞。',
  },
  {
    id: 'b2-reduced-relative', level: 4.3, focus: '分詞簡化關係子句',
    cloze: 'The files _____ during the review must be encrypted.', answer: 'created', choices: ['create', 'created', 'creating', 'were created'],
    correction: '請改正：The files creating during the review must be encrypted.', corrected: 'the files created during the review must be encrypted',
    explanation: 'files 與 create 是被動關係，因此使用過去分詞 created。',
  },
  {
    id: 'b2-despite', level: 4.4, focus: 'despite / in spite of',
    cloze: '_____ the limited budget, the project met its main goals.', answer: 'Despite', choices: ['Although', 'Despite', 'Because', 'Unless'],
    correction: '請改正：Despite of the limited budget, the project succeeded.', corrected: 'despite the limited budget, the project succeeded',
    explanation: 'despite 後直接接名詞，不加 of。',
  },
  {
    id: 'b2-modal-deduction', level: 4.5, focus: '情態動詞推測',
    cloze: 'The office is dark and the doors are locked; everyone _____ left.', answer: 'must have', choices: ['must have', 'should', 'can', 'would'],
    correction: '請改正：Everyone must left before we arrived.', corrected: 'everyone must have left before we arrived',
    explanation: '對過去情況做高度肯定的推測，使用 must have + 過去分詞。',
  },
  {
    id: 'b2-cleft', level: 4.6, focus: '強調句',
    cloze: 'It was the lack of testing _____ caused the failure.', answer: 'that', choices: ['that', 'what', 'where', 'whose'],
    correction: '請改正：It was the lack of testing what caused the failure.', corrected: 'it was the lack of testing that caused the failure',
    explanation: 'It was ... that ... 是常見的強調句型。',
  },
  {
    id: 'b2-participle', level: 4.7, focus: '分詞構句',
    cloze: '_____ the data twice, Mira submitted the report.', answer: 'Having checked', choices: ['Checking', 'Having checked', 'Checked', 'Has checked'],
    correction: '請改正：Having check the data twice, Mira submitted the report.', corrected: 'having checked the data twice, mira submitted the report',
    explanation: '先完成檢查再提交，使用 Having + 過去分詞。',
  },

  {
    id: 'c1-subjunctive', level: 5, focus: '正式虛擬語氣',
    cloze: 'The panel recommended that the proposal _____ revised.', answer: 'be', choices: ['is', 'was', 'be', 'being'],
    correction: '請改正：The panel recommended that the proposal is revised.', corrected: 'the panel recommended that the proposal be revised',
    explanation: 'recommend that 後在正式語體可使用原形虛擬語氣。',
  },
  {
    id: 'c1-negative-inversion', level: 5.05, focus: '否定副詞倒裝',
    cloze: 'Rarely _____ such a rapid change in public opinion.', answer: 'have we witnessed', choices: ['we witnessed', 'have we witnessed', 'we have witness', 'did witnessed we'],
    correction: '請改正：Rarely we have witnessed such a rapid change.', corrected: 'rarely have we witnessed such a rapid change',
    explanation: 'Rarely 置於句首時，助動詞放在主詞之前。',
  },
  {
    id: 'c1-inverted-conditional', level: 5.1, focus: '條件句倒裝',
    cloze: 'Had the warning been clearer, residents _____ sooner.', answer: 'might have acted', choices: ['act', 'will act', 'might have acted', 'had acted'],
    correction: '請改正：Had the warning was clearer, residents might have acted sooner.', corrected: 'had the warning been clearer, residents might have acted sooner',
    explanation: '省略 if 的第三類條件句使用 Had + 主詞 + 過去分詞。',
  },
  {
    id: 'c1-hedging', level: 5.15, focus: '學術語氣保留',
    cloze: 'The findings _____ suggest that the policy had a modest effect.', answer: 'appear to', choices: ['prove', 'appear to', 'definitely', 'never'],
    correction: '請改正語氣過度肯定的句子：The findings prove that the policy always works.', corrected: 'the findings suggest that the policy may work in some contexts',
    explanation: '學術寫作通常避免超出證據範圍的絕對結論。',
  },
  {
    id: 'c1-nominalisation', level: 5.2, focus: '名詞化',
    cloze: 'The rapid _____ of the service created unexpected demand.', answer: 'expansion', choices: ['expand', 'expanded', 'expansion', 'expansive'],
    correction: '請改正：The service expand rapidly created unexpected demand.', corrected: 'the rapid expansion of the service created unexpected demand',
    explanation: '正式書面語可使用名詞化 expansion 作為主詞核心。',
  },
  {
    id: 'c1-concession', level: 5.25, focus: '讓步結構',
    cloze: '_____ compelling the initial results may seem, further testing is necessary.', answer: 'However', choices: ['However', 'Therefore', 'Because', 'Unless'],
    correction: '請改正：Although compelling the results may seem, further testing is necessary.', corrected: 'however compelling the results may seem, further testing is necessary',
    explanation: 'However + 形容詞 + 主詞 + may be 可表達讓步。',
  },
  {
    id: 'c1-fronting', level: 5.3, focus: '前置與強調',
    cloze: 'What the report fails to explain _____ why the gap widened.', answer: 'is', choices: ['is', 'are', 'were', 'have'],
    correction: '請改正：What the report fails to explain are why the gap widened.', corrected: 'what the report fails to explain is why the gap widened',
    explanation: 'What 子句作主詞時，整體通常視為單數。',
  },
  {
    id: 'c1-parallelism', level: 5.35, focus: '平行結構',
    cloze: 'The reform aims to reduce costs, improve access, and _____ trust.', answer: 'restore', choices: ['restore', 'restoring', 'restored', 'restoration'],
    correction: '請改正：The reform aims to reduce costs, improving access, and restore trust.', corrected: 'the reform aims to reduce costs, improve access, and restore trust',
    explanation: '並列項目應保持相同的文法形式。',
  },

  {
    id: 'c2-so-inversion', level: 5.5, focus: 'so 置首倒裝',
    cloze: 'So fundamental _____ the assumption that few researchers questioned it.', answer: 'was', choices: ['was', 'were', 'did', 'has'],
    correction: '請改正：So fundamental the assumption was that few researchers questioned it.', corrected: 'so fundamental was the assumption that few researchers questioned it',
    explanation: 'So + 形容詞置首時，be 動詞移到主詞之前。',
  },
  {
    id: 'c2-no-sooner', level: 5.55, focus: 'No sooner ... than',
    cloze: 'No sooner _____ the announcement than objections began to appear.', answer: 'had they made', choices: ['they made', 'had they made', 'did they made', 'they had make'],
    correction: '請改正：No sooner they made the announcement when objections appeared.', corrected: 'no sooner had they made the announcement than objections appeared',
    explanation: 'No sooner 置首使用過去完成式倒裝，並搭配 than。',
  },
  {
    id: 'c2-complex-agreement', level: 5.6, focus: '複雜主詞一致',
    cloze: 'The extent to which the findings can be generalized _____ uncertain.', answer: 'remains', choices: ['remain', 'remains', 'are remaining', 'have remained'],
    correction: '請改正：The extent to which the findings can be generalized remain uncertain.', corrected: 'the extent to which the findings can be generalized remains uncertain',
    explanation: '核心主詞是單數 extent，因此動詞使用 remains。',
  },
  {
    id: 'c2-concessive-inversion', level: 5.65, focus: '讓步倒裝',
    cloze: '_____ the evidence may be, it does not settle the ethical question.', answer: 'Compelling though', choices: ['Compelling though', 'Because compelling', 'Despite compelling', 'So compelling'],
    correction: '請改正：Though the evidence compelling may be, it does not settle the question.', corrected: 'compelling though the evidence may be, it does not settle the question',
    explanation: '形容詞 + though + 主詞 + 動詞可形成正式讓步倒裝。',
  },
  {
    id: 'c2-dangling', level: 5.7, focus: '懸垂修飾語',
    cloze: 'After reviewing the evidence, _____ concluded that more data were needed.', answer: 'the committee', choices: ['the committee', 'the report', 'more data', 'the conclusion'],
    correction: '請改正：After reviewing the evidence, the conclusion was obvious.', corrected: 'after reviewing the evidence, the committee reached an obvious conclusion',
    explanation: '分詞構句的隱含主詞必須與主要子句主詞一致。',
  },
  {
    id: 'c2-substitution', level: 5.75, focus: '替代與省略',
    cloze: 'The northern region adapted faster than the southern region _____.', answer: 'did', choices: ['did', 'was', 'had been', 'would'],
    correction: '請改正：The northern region adapted faster than the southern region adapted.', corrected: 'the northern region adapted faster than the southern region did',
    explanation: 'did 可替代前面已出現的動詞 adapted，避免不自然重複。',
  },
  {
    id: 'c2-register', level: 5.8, focus: '正式語域與精確性',
    cloze: 'The committee did not reject the proposal outright; _____, it requested substantial revisions.', answer: 'rather', choices: ['rather', 'otherwise', 'similarly', 'meanwhile'],
    correction: '請將口語句改為正式表達：The committee kind of liked it but wanted lots of changes.', corrected: 'the committee viewed the proposal favorably but requested substantial revisions',
    explanation: '正式寫作應避免 kind of、lots of 等含糊口語，並明確呈現邏輯關係。',
  },
  {
    id: 'c2-scope', level: 5.85, focus: '否定範圍',
    cloze: 'Not all participants who received the message _____ it immediately.', answer: 'understood', choices: ['understood', 'did not understand', 'had understanding', 'were understood'],
    correction: '請改正語意：All participants did not understand the message.', corrected: 'not all participants understood the message',
    explanation: 'not all 表示部分否定；all ... not 容易造成範圍歧義。',
  },
]

function grammarQuestions(seed: GrammarSeed): EnglishQuestion[] {
  const base = Math.round(seed.level * 100)
  return [
    {
      id: `grammar-expanded-${seed.id}-cloze`,
      type: 'cloze',
      skill: 'grammar',
      difficulty: seed.level,
      prompt: seed.cloze,
      answer: seed.answer,
      context: `文法重點：${seed.focus}`,
      explanation: seed.explanation,
    },
    {
      id: `grammar-expanded-${seed.id}-choice`,
      type: 'choice',
      skill: 'grammar',
      difficulty: Math.min(6, seed.level + 0.04),
      prompt: `哪個選項最適合完成句子？\n${seed.cloze}`,
      answer: seed.answer,
      choices: stableShuffle(seed.choices, `${seed.id}-${base}`),
      context: `文法重點：${seed.focus}`,
      explanation: seed.explanation,
    },
    {
      id: `grammar-expanded-${seed.id}-correction`,
      type: 'correction',
      skill: 'grammar',
      difficulty: Math.min(6, seed.level + 0.1),
      prompt: seed.correction,
      answer: seed.corrected,
      context: `文法重點：${seed.focus}`,
      explanation: `${seed.explanation} 建議答案：${seed.corrected}。`,
    },
  ]
}

const READING_PASSAGES: ReadingPassageSeed[] = [
  {
    id: 'a1-garden', level: 1.05, title: 'A Morning at the Community Garden',
    passage: `Every Saturday morning, Mina goes to the community garden near her apartment. She arrives at eight o’clock with her father. First, they water the tomatoes and the beans. Then Mina checks the small signs beside each plant. The signs show the plant names and the dates they were planted. At nine, more neighbors arrive. One neighbor brings bread, and another brings fruit. They sit under a tree and eat together. Mina likes the garden because she learns about plants and meets people from her neighborhood. Before she leaves, she picks two tomatoes for dinner.`,
    questions: [
      { prompt: 'Mina 通常何時到社區花園？', answer: '星期六早上八點', choices: ['星期六早上八點', '星期六晚上八點', '星期日早上九點', '每天早上七點'], explanation: '第一句與第二句說她星期六早上去，八點抵達。' },
      { prompt: 'Mina 和父親首先做什麼？', answer: '幫番茄和豆子澆水', choices: ['幫番茄和豆子澆水', '先吃麵包', '先摘水果', '製作植物標誌'], explanation: '文章說 First, they water the tomatoes and the beans。' },
      { prompt: '植物旁的小標誌提供什麼資訊？', answer: '植物名稱和種植日期', choices: ['植物名稱和種植日期', '鄰居的電話', '食物價格', '天氣預報'], explanation: '標誌顯示 plant names 和 dates they were planted。' },
      { prompt: '鄰居們九點後做了什麼？', answer: '帶食物並一起吃', choices: ['帶食物並一起吃', '回家睡覺', '搭公車去市場', '把所有植物移走'], explanation: '鄰居帶來麵包和水果，並坐在樹下吃。' },
      { prompt: 'Mina 為什麼喜歡這座花園？', answer: '她能學植物並認識鄰居', choices: ['她能學植物並認識鄰居', '她可以不用上學', '花園裡有電影院', '她每天得到很多錢'], explanation: '文章直接說她學習植物並認識社區的人。' },
      { prompt: '離開前，Mina 帶了什麼回家？', answer: '兩顆番茄', choices: ['兩顆番茄', '一袋豆子', '一條麵包', '兩棵樹'], explanation: '最後一句說她摘了 two tomatoes for dinner。' },
    ],
  },
  {
    id: 'a1-library', level: 1.45, title: 'Leo’s First Library Card',
    passage: `Leo visits the town library after school. It is his first visit, so he asks a librarian for help. The librarian gives him a form and asks for his name, address, and phone number. Leo writes carefully and receives a blue library card. With the card, he can borrow five books for three weeks. He chooses a book about space, a comic book, and a short mystery. The librarian reminds him to return the books on time. Leo puts the return date in his phone. Before going home, he finds a quiet table and reads the first chapter of the space book.`,
    questions: [
      { prompt: 'Leo 為什麼向館員求助？', answer: '因為這是他第一次來圖書館', choices: ['因為這是他第一次來圖書館', '因為他遺失手機', '因為圖書館要關門', '因為他不想看書'], explanation: '文章說 It is his first visit, so he asks a librarian for help。' },
      { prompt: '申請表需要哪一項資料？', answer: '地址', choices: ['地址', '鞋子尺寸', '學校成績', '最喜歡的食物'], explanation: '表格要求 name, address, and phone number。' },
      { prompt: 'Leo 最多可以借幾本書？', answer: '五本', choices: ['三本', '五本', '十本', '沒有限制'], explanation: '卡片允許他 borrow five books。' },
      { prompt: '借書期限是多久？', answer: '三週', choices: ['三天', '一週', '三週', '三個月'], explanation: '文章寫 for three weeks。' },
      { prompt: 'Leo 如何記住還書日期？', answer: '把日期記在手機裡', choices: ['把日期記在手機裡', '寫在牆上', '請朋友每天提醒', '不做任何紀錄'], explanation: '他把 return date 放進手機。' },
      { prompt: '回家前 Leo 做了什麼？', answer: '讀太空書的第一章', choices: ['讀太空書的第一章', '歸還全部書籍', '參加足球比賽', '買了一台電腦'], explanation: '最後一句描述他在安靜的桌旁讀第一章。' },
    ],
  },
  {
    id: 'a2-train', level: 2.05, title: 'A Change of Plan at the Station',
    passage: `Rina planned to take the 10:15 train to visit her aunt. She arrived at the station twenty minutes early and bought a sandwich. A message on the information board then announced that her train would be delayed by forty-five minutes because of a signal problem. Rina first felt annoyed because her aunt was preparing lunch. She called her aunt and explained the delay. Her aunt said there was no need to hurry and suggested meeting at a café near the station instead. While waiting, Rina noticed an older traveler who could not understand the ticket machine. She helped him buy the correct ticket and showed him the right platform. By the time Rina’s train arrived, she felt calmer. The delay had changed her plan, but it had also given her time to help someone.`,
    questions: [
      { prompt: 'Rina 原本計畫搭幾點的火車？', answer: '10:15', choices: ['9:45', '10:15', '10:45', '11:15'], explanation: '第一句寫 10:15 train。' },
      { prompt: '火車為什麼延誤？', answer: '號誌出了問題', choices: ['號誌出了問題', '天氣太熱', '司機生病', '車站停電'], explanation: '資訊看板說 because of a signal problem。' },
      { prompt: 'Rina 的阿姨如何改變午餐計畫？', answer: '改在車站附近的咖啡館見面', choices: ['改在車站附近的咖啡館見面', '取消整個行程', '改搭飛機', '要求 Rina 立刻回家'], explanation: '阿姨建議在車站附近的 café 見面。' },
      { prompt: '等待時，Rina 幫助了誰？', answer: '不會使用售票機的年長旅客', choices: ['不會使用售票機的年長旅客', '一位迷路的小孩', '咖啡館店員', '火車司機'], explanation: '文章描述 older traveler 無法理解售票機。' },
      { prompt: '文章最後 Rina 的心情如何？', answer: '比一開始平靜', choices: ['比一開始平靜', '更加生氣', '非常害怕', '完全無聊'], explanation: 'By the time ... she felt calmer。' },
      { prompt: '這篇文章的主要訊息最接近哪一項？', answer: '意外延誤也可能帶來有意義的機會', choices: ['意外延誤也可能帶來有意義的機會', '火車永遠不可靠', '旅行時不該幫助陌生人', '午餐比準時更重要'], explanation: '延誤雖改變計畫，卻讓她有時間幫助別人。' },
    ],
  },
  {
    id: 'a2-repair', level: 2.45, title: 'The Saturday Repair Café',
    passage: `Once a month, the community center becomes a “repair café.” People bring broken household items, and volunteers try to fix them. Visitors do not pay for the repairs, but they may donate money for tools and materials. This Saturday, Omar brought a desk lamp that had stopped working. A volunteer named Grace checked the cable and found a loose connection. Instead of repairing the lamp alone, Grace showed Omar how to open the base safely and reconnect the wire. At another table, a teenager learned to sew a button onto a coat. Near the door, two volunteers explained how to clean a laptop fan. Not every object could be saved, but most visitors left with either a repaired item or a better understanding of how it worked. Omar said the best part was not saving money; it was learning a skill he could use again.`,
    questions: [
      { prompt: 'Repair café 多久舉辦一次？', answer: '每月一次', choices: ['每週一次', '每月一次', '每年一次', '每天'], explanation: '文章開頭說 Once a month。' },
      { prompt: '訪客通常如何支付修理費？', answer: '修理免費，但可以捐款', choices: ['修理免費，但可以捐款', '按小時計費', '必須購買會員卡', '只能用食物交換'], explanation: 'Visitors do not pay，但可以 donate money。' },
      { prompt: 'Omar 的檯燈出了什麼問題？', answer: '接線鬆脫', choices: ['接線鬆脫', '燈罩破裂', '缺少燈泡', '底座太重'], explanation: 'Grace 找到 a loose connection。' },
      { prompt: 'Grace 的教學方式有何特點？', answer: '讓 Omar 參與並學會修理', choices: ['讓 Omar 參與並學會修理', '不讓任何人靠近', '只給他一張新檯燈', '要求他下個月再來'], explanation: '她不是獨自修理，而是示範安全打開與重新接線。' },
      { prompt: '並非所有物品都能修好時，活動仍提供了什麼價值？', answer: '讓人更了解物品如何運作', choices: ['讓人更了解物品如何運作', '保證得到新產品', '提供免費午餐', '發放現金'], explanation: '訪客至少能獲得對物品運作方式的理解。' },
      { prompt: 'Omar 認為活動最重要的收穫是什麼？', answer: '學到能再次使用的技能', choices: ['學到能再次使用的技能', '省下最多金錢', '認識名人', '買到便宜工具'], explanation: '最後一句明確說最棒的不是省錢，而是學到技能。' },
    ],
  },
  {
    id: 'b1-remote', level: 3.05, title: 'A Six-Week Remote Work Experiment',
    passage: `A medium-sized design company recently tested a new work schedule. For six weeks, employees could choose to work from home three days a week. Managers wanted to know whether flexibility would improve productivity or make communication more difficult. Before the experiment began, teams agreed on several rules. Everyone had to be available online between ten in the morning and three in the afternoon. Important decisions had to be written in shared documents rather than left in private messages, and each team met in person every Wednesday.

At the end of the six weeks, the company compared project deadlines, client feedback, and employee surveys with data from the previous two months. Most teams completed their work slightly faster, and employees reported fewer interruptions when doing tasks that required concentration. However, new staff members said it was harder to ask quick questions and understand informal workplace habits. Some managers also noticed that meetings became longer because people tried to discuss too many issues at once.

The company decided to keep the flexible schedule, but it changed the rules. New employees now work in the office more often during their first month, and teams limit online meetings to forty minutes. The experiment did not prove that remote work was always better. Instead, it showed that flexibility worked best when communication practices were designed deliberately.`,
    questions: [
      { prompt: '公司進行這項實驗的主要目的為何？', answer: '了解彈性工作對生產力和溝通的影響', choices: ['了解彈性工作對生產力和溝通的影響', '減少所有員工薪資', '關閉實體辦公室', '測試新的設計軟體'], explanation: '第一段明確說想知道彈性是否提升生產力或增加溝通困難。' },
      { prompt: '實驗期間，哪一項是所有團隊都必須遵守的規則？', answer: '上午十點到下午三點必須在線', choices: ['上午十點到下午三點必須在線', '每天都必須進辦公室', '不得使用共享文件', '所有會議必須超過一小時'], explanation: '共同核心時段是十點到三點。' },
      { prompt: '哪一群人遇到較明顯的困難？', answer: '新進員工', choices: ['新進員工', '所有客戶', '資深設計師的家人', '辦公室清潔人員'], explanation: '第二段指出 new staff members 較難快速提問與理解非正式習慣。' },
      { prompt: '公司為何把線上會議限制為四十分鐘？', answer: '因為會議變長且塞入太多議題', choices: ['因為會議變長且塞入太多議題', '因為網路只能使用四十分鐘', '因為員工不會說話', '因為客戶要求取消會議'], explanation: '管理者發現人們試圖一次討論太多事情，使會議變長。' },
      { prompt: '作者對遠距工作的結論為何？', answer: '成效取決於刻意設計的溝通方式', choices: ['成效取決於刻意設計的溝通方式', '遠距工作一定比辦公室工作好', '遠距工作一定會失敗', '只要買新電腦就能解決所有問題'], explanation: '最後一句指出 flexibility works best when communication practices are designed deliberately。' },
      { prompt: '文中的 deliberately 最接近哪個意思？', answer: '有意識且經過規劃地', choices: ['有意識且經過規劃地', '偶然地', '秘密地', '快速而草率地'], explanation: '此處表示溝通規則需要刻意設計，而非自然發生。', difficultyOffset: 0.15 },
    ],
  },
  {
    id: 'b1-food-waste', level: 3.45, title: 'From Leftovers to a Local Resource',
    passage: `The town of Bellmere used to send nearly all restaurant food waste to a landfill. This was expensive, and residents often complained about the smell from collection trucks. Two years ago, the town began a pilot program with twelve restaurants. Each restaurant received separate bins for food scraps, cooking oil, and ordinary rubbish. Drivers collected the food scraps three times a week and delivered them to a nearby farm, where they were turned into compost.

At first, restaurant staff found the system confusing. Plastic packaging sometimes ended up in the compost bins, and several kitchens said they did not have enough space for three containers. The town responded by providing smaller bins, clearer picture labels, and short training sessions in multiple languages. After four months, contamination fell sharply.

The program now includes forty-eight restaurants. The farm sells some compost to gardeners and gives some back to the town for public parks. Collection costs have not disappeared, but the town sends less material to the landfill and pays lower disposal fees. Officials are considering adding apartment buildings next year. They know the expansion will require more vehicles and public education, yet they argue that the pilot offers a practical model: start small, measure problems, and adjust the system before expanding it.`,
    questions: [
      { prompt: 'Bellmere 最初推動計畫的背景問題不包括哪一項？', answer: '公園缺少遊樂設施', choices: ['公園缺少遊樂設施', '掩埋費用高', '收運車造成異味抱怨', '餐廳食物廢棄物多'], explanation: '文章沒有提到遊樂設施；其餘都是計畫背景。' },
      { prompt: '餐廳最初執行分類時遇到哪兩類問題？', answer: '分類錯誤和空間不足', choices: ['分類錯誤和空間不足', '沒有任何食物廢棄物', '農場拒收所有材料', '員工不會使用卡車'], explanation: '塑膠混入廚餘，且廚房沒有足夠空間放三個容器。' },
      { prompt: '鎮公所如何降低錯誤分類？', answer: '提供小型容器、圖示標籤和多語訓練', choices: ['提供小型容器、圖示標籤和多語訓練', '提高所有餐廳稅金', '停止收運四個月', '只接受大型餐廳加入'], explanation: '第二段列出這三項調整。' },
      { prompt: '現在產出的堆肥如何使用？', answer: '部分販售，部分用於公共公園', choices: ['部分販售，部分用於公共公園', '全部運回掩埋場', '只送到國外', '全部倒入河中'], explanation: '農場賣給園藝者，也回饋給鎮上公園。' },
      { prompt: '官員從試辦計畫得到的管理原則是什麼？', answer: '先小規模測試、量測問題，再調整擴大', choices: ['先小規模測試、量測問題，再調整擴大', '一開始就全面強制實施', '遇到問題立即放棄', '只依賴居民自行處理'], explanation: '文章最後用 start small, measure problems, and adjust 概括。' },
      { prompt: '根據文章，加入公寓大樓最可能需要什麼？', answer: '更多收運能力與居民教育', choices: ['更多收運能力與居民教育', '減少所有分類標籤', '停止與農場合作', '取消餐廳計畫'], explanation: '最後一段指出需要 more vehicles and public education。' },
    ],
  },
  {
    id: 'b2-school-time', level: 4.05, title: 'Rethinking the Beginning of the School Day',
    passage: `For decades, Northbridge Secondary School began classes at 7:35 a.m. The schedule allowed buses to complete several routes and gave students more time for sports in the afternoon. Yet teachers regularly saw students sleeping during first period, and the school nurse reported that many teenagers complained of headaches and difficulty concentrating.

A committee proposed moving the start time to 8:30. Supporters pointed to research suggesting that adolescent sleep patterns shift later during puberty, making it difficult for many teenagers to fall asleep early even when they try. They argued that a later start could improve alertness, attendance, and emotional well-being. Opponents did not necessarily reject the sleep research, but they worried about practical consequences. Bus contracts would need to change, after-school activities might finish later, and some parents depended on older children to care for younger siblings in the afternoon.

Instead of debating the proposal only in public meetings, the school ran a one-semester trial. It adjusted bus routes, shortened the lunch break by ten minutes, and moved certain clubs to two mornings each week. During the trial, first-period absence fell, and students reported sleeping an average of twenty-eight minutes longer. Academic results improved slightly, though the change was not equal across all subjects. Coaches complained that travel to away games became harder, while several families struggled with revised childcare arrangements.

The committee ultimately recommended keeping the later start but creating a small fund to support families facing additional childcare costs. It also proposed reviewing sports schedules with nearby schools. The decision reflected neither a simple victory for scientific evidence nor a surrender to logistical concerns. Rather, the trial transformed an abstract argument into a set of measurable trade-offs that the community could address.`,
    questions: [
      { prompt: '原本早上 7:35 上課的主要制度性原因之一是什麼？', answer: '方便校車完成多條路線', choices: ['方便校車完成多條路線', '學生要求更早考試', '教室下午沒有電', '教師只願意清晨工作'], explanation: '第一段說該時程讓 buses complete several routes。' },
      { prompt: '反對延後上課者的核心立場最接近哪一項？', answer: '承認睡眠研究，但擔心執行成本與家庭影響', choices: ['承認睡眠研究，但擔心執行成本與家庭影響', '完全否認青少年需要睡眠', '只關心考試排名', '要求取消所有課外活動'], explanation: '反對者不一定否定研究，而是擔心交通、活動與照顧安排。' },
      { prompt: '試辦期間出現哪一項正面結果？', answer: '第一節缺席下降', choices: ['第一節缺席下降', '所有科目成績大幅上升', '校車費完全消失', '每位學生多睡兩小時'], explanation: '文章明確說 first-period absence fell。' },
      { prompt: '為何文章說學業改善「並不平均」？', answer: '不同科目的改善程度不同', choices: ['不同科目的改善程度不同', '只有教師參加試辦', '所有學生都退步', '學校沒有蒐集資料'], explanation: 'the change was not equal across all subjects。' },
      { prompt: '委員會提出育兒補助基金的目的為何？', answer: '減輕部分家庭因新時程增加的照顧成本', choices: ['減輕部分家庭因新時程增加的照顧成本', '支付學生買早餐', '獎勵體育教練', '增加考試次數'], explanation: '基金針對 facing additional childcare costs 的家庭。' },
      { prompt: '最後一句所說的 measurable trade-offs 指什麼？', answer: '可以用資料評估並逐項處理的利弊交換', choices: ['可以用資料評估並逐項處理的利弊交換', '所有人都滿意的結果', '無法觀察的個人感受', '只需要相信單一研究'], explanation: '試辦把抽象爭論轉化為可量測的利益與成本。', difficultyOffset: 0.2 },
    ],
  },
  {
    id: 'b2-archive', level: 4.45, title: 'Opening a Museum Archive Without Losing Its Context',
    passage: `The Eastport Museum owns more than 600,000 photographs, letters, maps, and recorded interviews. Only a small proportion can be displayed in its galleries, so the museum began digitizing the collection. At first, the plan sounded straightforward: scan each object, attach a title and date, and publish it online. The archive team soon discovered that access was not simply a technical problem.

Many photographs had incomplete descriptions. A label might identify a factory but not the workers shown in front of it. Some recorded interviews contained names of living people who had never agreed to appear online. Community groups also objected to older catalogue language that described neighborhoods from the perspective of officials while ignoring residents’ own names and experiences. Publishing every file exactly as it appeared in the internal database could therefore reproduce mistakes, expose private information, and give users a misleading sense that the records were complete.

The museum changed its approach. It created a review process that brings together archivists, legal advisers, and community representatives. Online records now distinguish between confirmed information and uncertain descriptions. Sensitive interviews may be available only inside the museum, while other materials are released with edited transcripts. Visitors can submit corrections, but proposed changes remain visible alongside the evidence used to evaluate them. The museum also publishes short essays explaining why certain historical terms remain searchable even when they are no longer used in current descriptions.

Digitization has consequently become slower and more expensive than managers first expected. Nevertheless, online use of the collection has increased dramatically, and researchers have contributed information that the museum could not have found alone. The project’s central lesson is that opening an archive is not the same as emptying a storage room onto the internet. Meaningful access requires decisions about privacy, uncertainty, language, and whose knowledge counts.`,
    questions: [
      { prompt: '博物館最初低估了數位化的哪個面向？', answer: '資料脈絡、隱私與描述權力的複雜性', choices: ['資料脈絡、隱私與描述權力的複雜性', '掃描器完全無法使用', '館藏數量只有幾百件', '研究者不會使用網路'], explanation: '團隊發現 access 不只是技術問題，而涉及多種倫理與知識問題。' },
      { prompt: '直接公開內部資料庫可能造成什麼風險？', answer: '重複錯誤、暴露隱私並製造完整性的假象', choices: ['重複錯誤、暴露隱私並製造完整性的假象', '使所有照片變成黑白', '立即破壞實體文物', '讓博物館停止營業'], explanation: '第二段明列這三項風險。' },
      { prompt: '新的審查流程納入社區代表，主要為了解決什麼問題？', answer: '讓描述不只反映機構單一觀點', choices: ['讓描述不只反映機構單一觀點', '降低掃描解析度', '決定紀念品售價', '安排館員休假'], explanation: '社區團體質疑舊目錄只反映官方視角，忽略居民知識。' },
      { prompt: '博物館如何處理尚未確認的資訊？', answer: '明確標示不確定性並保留評估證據', choices: ['明確標示不確定性並保留評估證據', '全部刪除', '假裝資訊已確認', '只讓館長秘密查看'], explanation: '新紀錄區分 confirmed information 與 uncertain descriptions，修正也附帶證據。' },
      { prompt: '為何仍保留某些過時歷史詞彙的搜尋功能？', answer: '讓研究者能找到歷史紀錄，同時用說明交代其問題', choices: ['讓研究者能找到歷史紀錄，同時用說明交代其問題', '博物館支持過時用語', '系統無法修改任何文字', '為了增加廣告收入'], explanation: '館方透過短文說明為何可搜尋，但現行描述不再使用。' },
      { prompt: '全文主要主張是什麼？', answer: '真正的開放取決於負責任地保存脈絡，而非單純上傳檔案', choices: ['真正的開放取決於負責任地保存脈絡，而非單純上傳檔案', '數位化應該完全停止', '所有館藏都應只在館內閱讀', '社區知識不適合進入博物館'], explanation: '結尾強調 meaningful access 需要處理隱私、不確定性、語言與知識權。' },
    ],
  },
  {
    id: 'c1-prediction', level: 5.05, title: 'When a Prediction Becomes Part of the System',
    passage: `Prediction tools are often evaluated as though they were weather forecasts: a model observes existing conditions, announces what is likely to happen, and is later judged by whether the event occurred. In social settings, however, a prediction can alter the very behavior it seeks to anticipate. A school that identifies a student as “at risk” may provide tutoring that prevents failure. A lender that predicts default may deny credit, making it impossible to observe whether the borrower would actually have repaid. A police department that sends more officers to locations marked as high risk may record more incidents there simply because observation has intensified.

These feedback effects complicate familiar measures of accuracy. Suppose a hospital model flags patients who are likely to be readmitted. If staff respond effectively, flagged patients may return less often than unflagged patients. Judged only by the final outcome, the model may appear wrong precisely because the intervention succeeded. Conversely, a weak model can seem accurate when decision-makers treat its predictions as instructions and thereby produce the predicted pattern.

The problem is not solved merely by hiding predictions from users. Institutions deploy models because they want to act. Nor is it enough to compare predicted and observed outcomes without documenting what happened between them. Evaluation must distinguish at least three elements: the model’s estimate, the decision made in response, and the subsequent behavior of the people and institutions involved. Randomized trials can sometimes separate these effects, but they may be expensive, ethically difficult, or impossible when decisions carry serious consequences.

A more realistic approach treats prediction systems as components of changing environments rather than detached instruments. This requires continuous monitoring, records of interventions, and attention to who is affected when errors occur. It also changes the question from “Was the model accurate?” to “What pattern of decisions and outcomes did the model help create?” The second question is harder, but it better reflects the responsibility of institutions that use predictions to distribute opportunities, scrutiny, and support.`,
    questions: [
      { prompt: '作者為何認為社會預測工具不像一般天氣預報？', answer: '預測本身會改變人的行為與後續結果', choices: ['預測本身會改變人的行為與後續結果', '社會資料永遠比天氣資料精確', '天氣預報不需要模型', '社會事件完全無法觀察'], explanation: '第一段核心是 prediction can alter the behavior it seeks to anticipate。' },
      { prompt: '醫院案例如何顯示成功模型可能看起來不準？', answer: '介入降低再住院，使原本高風險者沒有出現預測結果', choices: ['介入降低再住院，使原本高風險者沒有出現預測結果', '模型刪除了病人資料', '醫院拒絕治療高風險者', '所有病人都被標成低風險'], explanation: '因有效介入，最終結果與原始預測不同，表面上像是錯誤。' },
      { prompt: '弱模型在何種情況下可能顯得準確？', answer: '決策者依預測行動並促成了預測中的模式', choices: ['決策者依預測行動並促成了預測中的模式', '模型完全不影響任何決策', '資料全部隨機產生', '使用者忽略所有預測'], explanation: '第二段說 decision-makers 可能把預測當指令，從而產生預測結果。' },
      { prompt: '作者認為評估至少要區分哪三項？', answer: '模型估計、回應決策與之後的行為', choices: ['模型估計、回應決策與之後的行為', '價格、顏色與品牌', '硬體、網路與辦公室', '學校、醫院與銀行的規模'], explanation: '第三段明列 estimate、decision、subsequent behavior。' },
      { prompt: '文章對隨機試驗的態度為何？', answer: '有時有用，但可能昂貴、具倫理困難或不可行', choices: ['有時有用，但可能昂貴、具倫理困難或不可行', '永遠是唯一可接受的方法', '完全沒有任何價值', '只適用於天氣預報'], explanation: '作者承認其用途，也列出限制。' },
      { prompt: '作者最希望機構改問哪一個問題？', answer: '模型協助形成了什麼決策與結果模式', choices: ['模型協助形成了什麼決策與結果模式', '模型介面是否漂亮', '模型能否取代所有員工', '模型是否使用最多資料'], explanation: '最後段將問題從單純準確度轉向系統共同創造的結果。', difficultyOffset: 0.2 },
    ],
  },
  {
    id: 'c1-convenience', level: 5.35, title: 'The Hidden Cost of Frictionless Services',
    passage: `Digital services often compete by removing friction. A purchase that once required a visit, a conversation, and a signature can now be completed with a tap. A subscription renews automatically; a meal arrives without a phone call; a recommendation appears before the user has formulated a request. These conveniences save time, but they also transfer decisions from visible moments into background systems.

The transfer matters because friction is not always waste. A pause can remind someone that a subscription is about to renew. A conversation with a pharmacist can reveal that two medicines should not be combined. A form that asks a person to confirm an address may prevent a package from being sent to an old home. Designers are therefore mistaken when they treat every extra step as an obstacle. Some steps function as safeguards, opportunities for reflection, or signals that a decision has consequences.

This does not mean that complicated processes are automatically responsible. Bureaucratic friction can exclude people who lack time, language support, reliable internet access, or confidence in dealing with institutions. The relevant distinction is not between more friction and less friction, but between accidental friction and purposeful friction. Accidental friction arises from poor coordination, outdated rules, or inaccessible design. Purposeful friction is placed where speed would increase the chance of error, manipulation, or harm.

The challenge is that businesses can easily measure abandonment rates and transaction speed, while the benefits of a thoughtful pause are harder to quantify. A warning that prevents a mistaken purchase produces no sale and leaves no dramatic success story. As a result, organizations may optimize what is visible and undervalue what does not happen. Responsible design requires institutions to study near misses, complaints, reversals, and long-term user outcomes, not merely completed transactions.

Convenience should therefore be understood as a design choice with distributional effects. Removing a step may help experienced users while exposing inexperienced ones to risk. Adding a confirmation may protect consumers while burdening people who use assistive technologies. The goal is not a perfectly frictionless service, but a service in which effort appears at the points where it helps users understand, consent, and recover from mistakes.`,
    questions: [
      { prompt: '作者所說「決策被轉移到背景系統」是什麼意思？', answer: '使用者不再於明確時刻主動審視每個決定', choices: ['使用者不再於明確時刻主動審視每個決定', '所有決策都由政府公開表決', '數位服務不再儲存資料', '使用者必須親自到店'], explanation: '自動續訂與預先推薦讓決策不再出現在可見的確認時刻。' },
      { prompt: '第二段列舉藥師對話，是為了說明什麼？', answer: '某些看似多餘的步驟其實能防止傷害', choices: ['某些看似多餘的步驟其實能防止傷害', '藥局應該取消數位服務', '所有對話都比文字可靠', '藥品不能在線購買'], explanation: '對話可能揭露藥物交互作用，顯示 friction 可作為 safeguard。' },
      { prompt: 'purposeful friction 與 accidental friction 的差異為何？', answer: '前者為降低風險而刻意設計，後者來自低效或不友善制度', choices: ['前者為降低風險而刻意設計，後者來自低效或不友善制度', '前者總是紙本，後者總是數位', '前者只服務企業，後者只服務政府', '兩者完全相同'], explanation: '第三段直接定義兩者。' },
      { prompt: '為何組織容易低估「有益的停頓」？', answer: '其預防的錯誤通常不會形成容易量測的成功事件', choices: ['其預防的錯誤通常不會形成容易量測的成功事件', '停頓一定會增加銷售', '使用者從不抱怨', '組織無法量測交易速度'], explanation: '預防錯誤常呈現為「事情沒有發生」，不如完成交易可見。' },
      { prompt: '第五段所說的 distributional effects 指什麼？', answer: '同一設計對不同使用者群體產生不同利益與負擔', choices: ['同一設計對不同使用者群體產生不同利益與負擔', '服務只能在不同國家配送', '所有使用者得到完全相同結果', '企業必須平均分配收入'], explanation: '移除或增加步驟可能分別幫助或傷害不同群體。' },
      { prompt: '全文最支持哪一項設計原則？', answer: '在能促進理解、同意與修正錯誤之處保留適當步驟', choices: ['在能促進理解、同意與修正錯誤之處保留適當步驟', '刪除所有確認畫面', '讓所有流程盡可能複雜', '只優化交易完成率'], explanation: '結尾明確主張 effort 應出現在有助理解、同意與復原的節點。' },
    ],
  },
  {
    id: 'c2-memory', level: 5.55, title: 'Public Memory in the Age of Algorithmic Archives',
    passage: `Archives have never been neutral containers. Decisions about what to collect, how to describe it, and who may consult it shape the histories that later generations can write. Digital systems do not remove these decisions; they multiply and partially conceal them. A physical archive may reveal its boundaries through shelves, boxes, catalogues, and opening hours. An algorithmic archive can appear limitless while directing attention through search rankings, recommendation systems, automatic summaries, and interfaces that most users cannot inspect.

This apparent abundance changes the politics of absence. In a traditional collection, a missing record may be recognized as a gap. Online, users often assume that what cannot be found does not exist or is unimportant. Yet search visibility depends on digitization budgets, metadata quality, copyright status, language resources, and the behavior of ranking models. A well-described photograph from a wealthy institution may repeatedly appear above a poorly indexed oral history held by a small community group. The inequality is not merely one of possession; it is also one of computational legibility.

Efforts to correct such imbalances frequently rely on automated transcription, translation, and image recognition. These tools can make previously inaccessible collections searchable at a scale no human team could match. They also introduce systematic errors. Historical handwriting, regional accents, damaged recordings, and minority languages are often processed less accurately than standardized contemporary material. If confidence scores remain hidden, users may mistake uncertain output for authoritative description. Worse, errors can travel: an incorrect transcription feeds a summary, the summary influences a search index, and the index determines which sources future researchers encounter.

Some institutions respond by preserving every stage of the process. They publish scans beside machine transcriptions, show confidence levels, record human corrections, and allow users to trace summaries back to source material. This approach treats uncertainty as information rather than embarrassment. It also makes the archive slower to use. A clean interface that offers one confident answer is easier than a layered interface that exposes disagreement, provenance, and revision history.

The tension cannot be resolved by choosing either human judgment or automation. Human catalogues contain bias and error; automated systems inherit those patterns while adding new ones. Nor can institutions simply promise perfect transparency. Most users lack the time or expertise to inspect a model’s technical details. What they need are meaningful cues: whether a description is original or generated, whether a claim is widely supported or contested, and whether important material may be missing because it has not been digitized.

An algorithmic archive should therefore be judged not only by the quantity of material it makes searchable, but by the quality of the relationship it creates between users and evidence. Does the system invite verification or reward the first plausible result? Does it preserve minority descriptions or collapse them into dominant vocabulary? Can communities challenge harmful labels without erasing the historical record of how those labels were used? These questions shift attention from access as simple availability to access as an ongoing institutional practice.

Public memory is formed through repeated encounters with selected evidence. When algorithms mediate those encounters, design choices become historical forces. The responsible archive is not the one that claims to contain everything or to eliminate uncertainty. It is the one that helps users see what is present, what is inferred, what remains absent, and who has the power to revise the record.`,
    questions: [
      { prompt: '作者為何說數位系統會「部分隱藏」典藏決策？', answer: '排序、推薦與摘要會導引注意力，但其運作邊界不容易被使用者看見', choices: ['排序、推薦與摘要會導引注意力，但其運作邊界不容易被使用者看見', '數位系統完全不做任何選擇', '所有演算法都公開原始碼', '實體檔案沒有任何邊界'], explanation: '第一段對比實體邊界可見與演算法導引較隱蔽。' },
      { prompt: 'computational legibility 在文中最接近什麼概念？', answer: '資料被數位系統辨識、描述與排序的容易程度', choices: ['資料被數位系統辨識、描述與排序的容易程度', '文件紙張是否清楚', '研究者閱讀速度', '館舍是否有電梯'], explanation: '例子顯示後設資料與機構資源影響資料能否被搜尋系統看見。' },
      { prompt: '自動處理錯誤為何可能產生連鎖效應？', answer: '錯誤轉錄會進入摘要與索引，進而改變後續研究者看到的來源', choices: ['錯誤轉錄會進入摘要與索引，進而改變後續研究者看到的來源', '錯誤只會停留在單一螢幕', '所有摘要都由人工重新寫', '搜尋排序與資料內容無關'], explanation: '第三段用 transcription → summary → index → encounter 描述錯誤傳播。' },
      { prompt: '作者如何看待「乾淨、只提供一個答案」的介面？', answer: '易用但可能隱藏不確定性、來源與爭議', choices: ['易用但可能隱藏不確定性、來源與爭議', '一定比多層介面更負責任', '只適合紙本資料', '能自動消除偏見'], explanation: '第四段指出單一自信答案容易，但分層介面才能呈現 provenance 與 disagreement。' },
      { prompt: '文章為何反對單純在人工判斷與自動化之間二選一？', answer: '兩者都可能帶有偏誤與錯誤，而且會以不同方式交互影響', choices: ['兩者都可能帶有偏誤與錯誤，而且會以不同方式交互影響', '人工永遠正確', '自動化永遠中立', '檔案館不需要任何描述'], explanation: '第五段說人工目錄有偏誤，自動系統繼承並增加新的偏誤。' },
      { prompt: '根據全文，負責任的演算法檔案館最重要的能力是什麼？', answer: '讓使用者區分現有證據、推論、不確定性與缺漏，並看見修訂權力', choices: ['讓使用者區分現有證據、推論、不確定性與缺漏，並看見修訂權力', '宣稱已收錄世界上一切資料', '永遠把最熱門結果排第一', '消除所有歷史上的有害詞彙'], explanation: '結尾將責任定義為呈現 present、inferred、absent 與 revision power。', difficultyOffset: 0.25 },
    ],
  },
  {
    id: 'c2-resilience', level: 5.85, title: 'The Efficiency Trap in Urban Resilience',
    passage: `Modern cities are often praised for efficiency. Water, electricity, food, transport, and information move through tightly coordinated networks that reduce cost and delay. Warehouses hold less inventory because deliveries arrive precisely when needed. Transit agencies concentrate vehicles on routes with the highest demand. Hospitals share specialized equipment rather than duplicating expensive capacity. Under ordinary conditions, such systems can serve more people with fewer resources.

Resilience, however, concerns performance under conditions that are not ordinary. A network optimized around average demand may fail abruptly when several disruptions occur together. Just-in-time delivery reduces waste but leaves little inventory when roads close. Centralized expertise improves quality but creates dependence on a small number of facilities. Digital coordination accelerates response but may spread a software failure across services that were once separate. The very connections that produce efficiency can transmit disturbance.

This observation has encouraged calls for redundancy: spare capacity, multiple suppliers, backup communication channels, and local alternatives. Critics object that redundancy looks like waste during normal periods. An unused generator requires maintenance; an extra bus sits idle; a second supplier may charge more. Political systems that reward visible short-term savings therefore tend to remove buffers gradually. Each individual cut appears reasonable, while the cumulative loss of flexibility remains difficult to see until a crisis occurs.

Yet simply duplicating everything is neither affordable nor necessarily resilient. Two facilities exposed to the same flood are not meaningful backups. Multiple suppliers using the same transport corridor do not provide genuine diversity. Redundancy must be combined with independence, adaptability, and the ability to learn. A neighborhood clinic that can change its function during an emergency may be more valuable than a larger facility designed for one narrow task. A transport network with several modest connections may recover faster than one with a single high-capacity hub.

The measurement problem is central. Efficiency can be expressed through familiar indicators such as cost per passenger or average delivery time. Resilience is partly defined by events that may not happen during the measurement period. Officials may therefore rely on simulations, stress tests, near-miss reports, and comparisons with disruptions elsewhere. These methods are imperfect. Simulations reflect assumptions; near misses are inconsistently reported; past crises may not resemble future ones. Nevertheless, refusing to measure resilience because it is uncertain effectively assigns it a value of zero.

Equity further complicates the analysis. A city may maintain system-wide service while allowing particular neighborhoods to experience repeated outages. Average recovery time can improve even as the slowest areas fall further behind. Some forms of redundancy are privately available: wealthier households can buy batteries, store food, or work remotely. When public planning assumes that residents will provide their own backup capacity, vulnerability is redistributed rather than reduced.

A resilient city is therefore not simply an inefficient city with more spare equipment. It is a city that decides deliberately where efficiency is safe, where buffers are essential, and whose risks are being counted. This requires institutions to preserve options that may look unnecessary, test whether backups are truly independent, and examine distribution rather than averages alone. The goal is not to predict every crisis. It is to maintain enough diversity and adaptive capacity that unexpected events do not force every part of the system to fail in the same way at the same time.`,
    questions: [
      { prompt: '第一段列舉即時配送、集中設備等案例，主要想建立什麼前提？', answer: '效率化能在正常條件下用較少資源服務更多人', choices: ['效率化能在正常條件下用較少資源服務更多人', '所有集中系統都必然失敗', '城市不應使用數位技術', '備援設備永遠比主要設備便宜'], explanation: '第一段先公平承認效率系統在 ordinary conditions 的優點。' },
      { prompt: '作者所說「連結會傳遞擾動」是什麼意思？', answer: '提高協調效率的相互依賴也可能讓單一故障擴散到其他服務', choices: ['提高協調效率的相互依賴也可能讓單一故障擴散到其他服務', '城市中的道路會傳遞聲音', '所有網路都應完全分離', '故障只影響最小的單位'], explanation: '第二段以軟體故障跨服務擴散等例子說明。' },
      { prompt: '為何政治制度容易逐步移除備援？', answer: '備援在平時看似閒置，而短期節省更容易被看見與獎勵', choices: ['備援在平時看似閒置，而短期節省更容易被看見與獎勵', '備援完全不需維護', '危機每週都會發生', '所有選民都反對公共服務'], explanation: '第三段說每次削減看似合理，累積失去彈性直到危機才顯現。' },
      { prompt: '文章為何說「兩座設施」不一定構成真正備援？', answer: '若兩者暴露於相同風險，可能同時失效', choices: ['若兩者暴露於相同風險，可能同時失效', '第二座設施一定比較小', '備援必須位於同一棟建築', '只有私人設施能當備援'], explanation: '第四段舉兩座設施同受洪水影響，說明獨立性很重要。' },
      { prompt: '作者如何回應「韌性難以量測」的問題？', answer: '承認方法不完美，但不量測等於在決策中把韌性視為零', choices: ['承認方法不完美，但不量測等於在決策中把韌性視為零', '主張只看平均成本', '認為模擬可以完美預測未來', '建議停止蒐集任何資料'], explanation: '第五段最後一句直接提出這個論點。' },
      { prompt: '加入公平性後，單看全市平均恢復時間有何缺陷？', answer: '可能掩蓋特定社區長期承受較慢恢復與較高風險', choices: ['可能掩蓋特定社區長期承受較慢恢復與較高風險', '平均值一定低估所有地區', '富裕家庭沒有任何私人備援', '系統服務無法跨社區比較'], explanation: '第六段指出平均改善時，最慢地區仍可能落後更多。' },
    ],
  },
]

function readingQuestions(seed: ReadingPassageSeed): EnglishQuestion[] {
  const context = `${seed.title}\n\n${seed.passage}`
  return seed.questions.map((question, index) => ({
    id: `reading-long-${seed.id}-${index + 1}`,
    type: 'choice',
    skill: 'reading',
    difficulty: Math.min(6, seed.level + (question.difficultyOffset ?? index * 0.03)),
    prompt: question.prompt,
    answer: question.answer,
    choices: stableShuffle(question.choices, `${seed.id}-${index}`),
    context,
    explanation: question.explanation,
  }))
}

export const EXPANDED_GRAMMAR_QUESTIONS: EnglishQuestion[] = GRAMMAR_SEEDS.flatMap(grammarQuestions)
export const LONG_FORM_READING_QUESTIONS: EnglishQuestion[] = READING_PASSAGES.flatMap(readingQuestions)

export const GRAMMAR_READING_QUESTION_BANK: EnglishQuestion[] = [
  ...EXPANDED_GRAMMAR_QUESTIONS,
  ...LONG_FORM_READING_QUESTIONS,
]

export const GRAMMAR_READING_COVERAGE = {
  grammarSeeds: GRAMMAR_SEEDS.length,
  grammarQuestions: EXPANDED_GRAMMAR_QUESTIONS.length,
  readingPassages: READING_PASSAGES.length,
  readingQuestions: LONG_FORM_READING_QUESTIONS.length,
  totalQuestions: GRAMMAR_READING_QUESTION_BANK.length,
  grammarByLevel: [1, 2, 3, 4, 5, 5.5].map((floor, index) => ({
    level: index + 1,
    count: EXPANDED_GRAMMAR_QUESTIONS.filter((question) => question.difficulty >= floor && question.difficulty < (index === 5 ? 6.1 : [2, 3, 4, 5, 5.5][index])).length,
  })),
  readingWordCounts: READING_PASSAGES.map((passage) => ({
    id: passage.id,
    level: passage.level,
    words: passage.passage.trim().split(/\s+/).length,
  })),
}
