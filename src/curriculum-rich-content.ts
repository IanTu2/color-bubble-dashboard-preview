import type { CurriculumLessonPlan, CurriculumUnitBundle } from './curriculum-course-engine'
import type { CurriculumSubjectId } from './curriculum-plan'

export type RichVisualKind = 'number-line' | 'concept-map' | 'experiment' | 'timeline' | 'spatial' | 'reading' | 'dialogue'

export type RichVisualItem = {
  label: string
  detail: string
}

export type RichVisual = {
  kind: RichVisualKind
  title: string
  caption: string
  items: RichVisualItem[]
  audioText?: string
}

export type RichPractice = {
  id: string
  level: '基礎' | '應用' | '挑戰'
  question: string
  hint: string
  answer: string
  explanation: string
}

export type RichLessonPack = {
  bridge: string[]
  visual: RichVisual
  practices: RichPractice[]
  takeaway: string
}

function has(value: string, words: string[]) {
  return words.some((word) => value.includes(word))
}

function practice(id: string, level: RichPractice['level'], question: string, hint: string, answer: string, explanation: string): RichPractice {
  return { id, level, question, hint, answer, explanation }
}

function mathPack(grade: number, unit: CurriculumUnitBundle, lesson: CurriculumLessonPlan): RichLessonPack {
  const title = unit.title
  if (has(title, ['正負', '有向數', '數線', '絕對值'])) {
    return {
      bridge: [
        '先把「正、負」想成方向，而不是兩種不同的數字。以 0 為基準，右邊是正、左邊是負。',
        '做加減時，可以問自己：「從目前的位置，要往哪個方向走幾格？」這比死背負負得正更容易理解。',
      ],
      visual: {
        kind: 'number-line',
        title: '用數線看 −3 + 5',
        caption: '從 −3 出發，加 5 代表向右走 5 格，最後停在 2。',
        items: [
          { label: '−5', detail: '左側' }, { label: '−3', detail: '起點' }, { label: '0', detail: '基準' }, { label: '2', detail: '終點' }, { label: '5', detail: '右側' },
        ],
      },
      practices: [
        practice(`${lesson.id}-p1`, '基礎', '計算：−4 + 7 = ?', '從 −4 往右走 7 格。', '3', '−4 → −3 → −2 → −1 → 0 → 1 → 2 → 3，所以答案是 3。'),
        practice(`${lesson.id}-p2`, '應用', '早上是 2°C，晚上下降 7°C。晚上幾度？', '「下降」可以寫成加上一個負數。', '−5°C', '2 + (−7) = −5，所以晚上是 −5°C。'),
        practice(`${lesson.id}-p3`, '挑戰', '哪一個比較大：−8 還是 −3？為什麼？', '數線越往右，數值越大。', '−3 較大', '−3 在 −8 的右邊，因此 −3 > −8。'),
      ],
      takeaway: '正負數的核心是「方向與位置」；數線可以同時幫你判斷大小與加減方向。',
    }
  }

  if (has(title, ['分數'])) {
    return {
      bridge: ['分數加減最重要的是「每一份大小要一樣」。分母不同時，直接加分子會把不同大小的份數混在一起。', '通分不是改變數值，而是把同一個分數換成另一種等值寫法。'],
      visual: {
        kind: 'concept-map', title: '分數運算流程', caption: '先看運算種類，再決定是否需要通分。',
        items: [
          { label: '加減', detail: '先通分 → 加減分子 → 約分' },
          { label: '乘法', detail: '分子乘分子、分母乘分母 → 約分' },
          { label: '除法', detail: '除以一個分數 = 乘以它的倒數' },
        ],
      },
      practices: [
        practice(`${lesson.id}-p1`, '基礎', '1/3 + 1/6 = ?', '共同分母可以用 6。', '1/2', '1/3 = 2/6，所以 2/6 + 1/6 = 3/6 = 1/2。'),
        practice(`${lesson.id}-p2`, '應用', '3/4 − 1/8 = ?', '把 3/4 改寫成八分之幾。', '5/8', '3/4 = 6/8，6/8 − 1/8 = 5/8。'),
        practice(`${lesson.id}-p3`, '挑戰', '一瓶果汁喝掉 2/5，剩下原本的幾分之幾？', '完整的一瓶可以寫成 1。', '3/5', '1 − 2/5 = 5/5 − 2/5 = 3/5。'),
      ],
      takeaway: '分數加減先統一「份的大小」，再處理份數；最後一定檢查能不能約分。',
    }
  }

  if (has(title, ['方程', '代數式'])) {
    return {
      bridge: ['把等號想成天平，左右兩邊代表相同重量。解方程式時的所有動作，都要維持這個平衡。', '「移項變號」只是簡寫；真正發生的是等號兩邊同時加上或減去同一個量。'],
      visual: {
        kind: 'concept-map', title: '3x + 5 = 20 的平衡過程', caption: '每一步都對左右兩邊做相同運算。',
        items: [
          { label: '3x + 5 = 20', detail: '原式' },
          { label: '3x = 15', detail: '左右同減 5' },
          { label: 'x = 5', detail: '左右同除以 3' },
          { label: '20 = 20', detail: '代回檢查' },
        ],
      },
      practices: [
        practice(`${lesson.id}-p1`, '基礎', '解：x + 7 = 12', '左右同減 7。', 'x = 5', 'x + 7 − 7 = 12 − 7，所以 x = 5。'),
        practice(`${lesson.id}-p2`, '應用', '解：4x = 28', '左右同除以 4。', 'x = 7', '4x ÷ 4 = 28 ÷ 4，因此 x = 7。'),
        practice(`${lesson.id}-p3`, '挑戰', '解：2x − 3 = 11', '先消掉 −3，再處理 2x。', 'x = 7', '左右同加 3 得 2x = 14，再同除以 2，得到 x = 7。'),
      ],
      takeaway: '解方程式不是把符號搬來搬去，而是持續保持等號兩邊相等，直到未知數單獨留下。',
    }
  }

  if (has(title, ['百分', '比例', '比率'])) {
    return {
      bridge: ['百分率表示「每 100 份中有幾份」。做百分率題時，先找出誰是 100% 的基準量。', '折扣、成長率、命中率看似不同，核心都是「比較量和基準量的關係」。'],
      visual: {
        kind: 'concept-map', title: '百分率三角關係', caption: '知道其中兩個量，就能求第三個量。',
        items: [
          { label: '基準量', detail: '被拿來當 100% 的量' },
          { label: '百分率', detail: '比較量 ÷ 基準量' },
          { label: '比較量', detail: '基準量 × 百分率' },
        ],
      },
      practices: [
        practice(`${lesson.id}-p1`, '基礎', '200 的 25% 是多少？', '25% = 0.25。', '50', '200 × 0.25 = 50。'),
        practice(`${lesson.id}-p2`, '應用', '原價 500 元打 8 折，售價多少？', '8 折 = 80%。', '400 元', '500 × 0.8 = 400。'),
        practice(`${lesson.id}-p3`, '挑戰', '某班 40 人，有 30 人通過測驗，通過率是多少？', '百分率 = 比較量 ÷ 基準量。', '75%', '30 ÷ 40 = 0.75 = 75%。'),
      ],
      takeaway: '百分率題最容易錯在基準量；先找出「誰代表 100%」再列式。',
    }
  }

  if (has(title, ['函數', '直線'])) {
    return {
      bridge: ['函數是一台「輸入 → 規則 → 輸出」的機器。同一個輸入，在同一規則下會得到唯一輸出。', '算式、表格與圖形不是三件事，而是同一個函數關係的三種表示方式。'],
      visual: {
        kind: 'concept-map', title: 'y = 2x + 1', caption: '把不同 x 代入同一個規則。',
        items: [
          { label: 'x = 0', detail: 'y = 1' }, { label: 'x = 1', detail: 'y = 3' }, { label: 'x = 2', detail: 'y = 5' }, { label: 'x = 3', detail: 'y = 7' },
        ],
      },
      practices: [
        practice(`${lesson.id}-p1`, '基礎', '若 y = 3x + 2，x = 2 時 y = ?', '把 2 代入 x。', '8', 'y = 3×2 + 2 = 8。'),
        practice(`${lesson.id}-p2`, '應用', '函數 y = x − 4，若 y = 5，x 是多少？', '把 y = 5 代回。', '9', '5 = x − 4，所以 x = 9。'),
        practice(`${lesson.id}-p3`, '挑戰', 'y = 2x + 1 中，x 每增加 1，y 會怎麼變？', '比較連續兩個輸出。', 'y 增加 2', '因為 x 的係數是 2，所以 x 每增加 1，y 增加 2。'),
      ],
      takeaway: '看到函數先找「輸入、規則、輸出」，再在算式、表格和圖形之間互相翻譯。',
    }
  }

  const simple = grade <= 3
  return {
    bridge: [
      `這個單元的學習重點是：${unit.focus}`,
      simple ? '先用實物、圖像或短算式把問題表示出來，再進行計算。' : '先辨認已知量、未知量與關係，再選擇算式、表格或圖形表示。',
    ],
    visual: {
      kind: 'concept-map', title: '解題四步驟', caption: '不管題型怎麼變，都可以先用這四步穩定拆題。',
      items: [
        { label: '1 讀題', detail: '圈出條件與問題' }, { label: '2 表示', detail: '畫圖、列表或列式' }, { label: '3 計算', detail: '依規則求解' }, { label: '4 檢查', detail: '單位、範圍與合理性' },
      ],
    },
    practices: simple ? [
      practice(`${lesson.id}-p1`, '基礎', '小明有 8 顆球，又得到 5 顆，現在有幾顆？', '「又得到」代表增加。', '13 顆', '8 + 5 = 13。'),
      practice(`${lesson.id}-p2`, '應用', '有 15 顆糖，送出 6 顆，剩幾顆？', '「送出」代表減少。', '9 顆', '15 − 6 = 9。'),
      practice(`${lesson.id}-p3`, '挑戰', '哪個算式可以表示「4 組，每組 3 個」？', '想像四個盒子，每盒三個。', '4 × 3 = 12', '重複 4 次的 3，可以用乘法表示。'),
    ] : [
      practice(`${lesson.id}-p1`, '基礎', `用自己的話說明「${unit.title}」最重要的數學關係。`, '不要只抄標題，要說明量與量之間怎麼互動。', unit.focus, `本題重點是抓出：${unit.focus}`),
      practice(`${lesson.id}-p2`, '應用', '把本單元的一個文字情境改寫成算式或圖表。', '先列出已知、未知，再選表示法。', '合理列式或圖表皆可', '只要表示法能完整保留題目中的數量關係，就算是有效轉換。'),
      practice(`${lesson.id}-p3`, '挑戰', '如果條件改變一個數值，你的答案會往哪個方向改變？請說明。', '先判斷變數之間是同向還是反向。', '依題目關係判斷', '這題用來檢查你是否真的理解關係，而不是只會代公式。'),
    ],
    takeaway: '數學不是只求最後答案；能畫出關係、說明每一步理由、檢查結果，才算真正學會。',
  }
}

function englishPack(grade: number, unit: CurriculumUnitBundle, lesson: CurriculumLessonPlan): RichLessonPack {
  const title = unit.title
  if (has(title, ['自我介紹', '招呼', 'be'])) {
    const dialogue = 'A: Hi! I’m Mia. What’s your name? B: I’m Leo. Nice to meet you. A: Nice to meet you, too.'
    return {
      bridge: ['先讀完整對話，再看文法。英文學習的順序應該是「理解意思 → 注意句型 → 換成自己的內容」。', 'be 動詞在這裡負責連接主詞和身分：I am / I’m，he or she is，you or we or they are。'],
      visual: {
        kind: 'dialogue', title: '第一次見面的對話', caption: '按朗讀後先只聽一次，再對照文字。', audioText: dialogue,
        items: [
          { label: 'Mia', detail: 'Hi! I’m Mia. What’s your name?' },
          { label: 'Leo', detail: 'I’m Leo. Nice to meet you.' },
          { label: 'Mia', detail: 'Nice to meet you, too.' },
        ],
      },
      practices: [
        practice(`${lesson.id}-p1`, '基礎', '完成：I ___ a student.', '主詞是 I。', 'am', 'I 搭配 am，所以是 I am a student.'),
        practice(`${lesson.id}-p2`, '應用', '完成：She ___ my sister.', 'She 是第三人稱單數。', 'is', 'She 搭配 is。'),
        practice(`${lesson.id}-p3`, '挑戰', '寫兩句自我介紹，至少包含姓名和身分。', '可以使用 I’m ... / I am a ...', '例如：I’m Amy. I’m a student.', '重點是句子完整，而且 be 動詞要和主詞一致。'),
      ],
      takeaway: '先把句型放進真實對話，再去記規則，會比只背 am/is/are 更容易使用。',
    }
  }

  if (has(title, ['現在式', '日常', '作息'])) {
    const audio = 'I get up at seven. My brother gets up at six thirty. We eat breakfast together, and he goes to school by bus.'
    return {
      bridge: ['一般現在式常用來描述習慣和固定生活。主詞若是 he、she、it，主要動詞通常需要第三人稱單數變化。', '不要只看到動詞就加 s，要先看主詞。'],
      visual: {
        kind: 'dialogue', title: 'Daily routine', caption: '聽完後找出 I 和 he 的動詞有什麼不同。', audioText: audio,
        items: [
          { label: '07:00', detail: 'I get up at seven.' },
          { label: '06:30', detail: 'My brother gets up at six thirty.' },
          { label: 'School', detail: 'He goes to school by bus.' },
        ],
      },
      practices: [
        practice(`${lesson.id}-p1`, '基礎', 'He ___ basketball after school. (play)', '主詞是 He。', 'plays', '第三人稱單數肯定句通常在動詞後加 -s。'),
        practice(`${lesson.id}-p2`, '應用', '把「She likes music.」改成否定句。', 'does not 後面用原形動詞。', 'She does not like music.', 'does 已經負責第三人稱變化，所以 like 回到原形。'),
        practice(`${lesson.id}-p3`, '挑戰', '用 3 句英文描述你平日早上的習慣。', '使用一般現在式與時間詞。', '答案依個人作息', '檢查每句主詞和動詞是否一致，並避免把所有句子都只寫成單字。'),
      ],
      takeaway: '一般現在式的第一個判斷是「主詞是誰」，第二個才是「動詞要不要變化」。',
    }
  }

  const audio = grade <= 6
    ? 'This is my school. I study English, math, science, Chinese, and social studies. My favorite subject is English.'
    : 'Learning a language takes repeated exposure. Read for meaning first, notice useful patterns, and then use them in a new context.'
  return {
    bridge: [`這個單元的重點是：${unit.focus}`, '先理解整句意思，再注意字彙與句型；最後一定要自己輸出一句新的內容，才能從「看得懂」進到「會使用」。'],
    visual: {
      kind: 'dialogue', title: 'Listen & read', caption: '先聽，再看文字，最後嘗試不看文字重述大意。', audioText: audio,
      items: audio.split('. ').filter(Boolean).map((sentence, index) => ({ label: `0${index + 1}`, detail: sentence.endsWith('.') ? sentence : `${sentence}.` })),
    },
    practices: [
      practice(`${lesson.id}-p1`, '基礎', '從本單元挑 3 個重要字詞，各寫一個完整片語或短句。', '不要只抄單字，要放進上下文。', '依本單元字詞作答', '能在不同句子中使用同一個字，代表你不是只記翻譯。'),
      practice(`${lesson.id}-p2`, '應用', '把本單元核心句型改成和你自己生活有關的一句話。', '保留句型骨架，替換人物、時間或地點。', '答案依個人情境', '句型練習的目標是遷移，不是重複抄範例。'),
      practice(`${lesson.id}-p3`, '挑戰', '用 2～3 句英文摘要本課內容。', '先抓誰、做什麼、何時／在哪裡。', '合理英文摘要皆可', '摘要不需要使用原句全部字詞，但意思要完整且文法可理解。'),
    ],
    takeaway: '英文課不是「單字＋文法清單」，而是理解、注意語言規則，再把規則用回真實句子。',
  }
}

function chinesePack(unit: CurriculumUnitBundle, lesson: CurriculumLessonPlan): RichLessonPack {
  const title = unit.title
  const text = has(title, ['文言', '古文'])
    ? '學而時習之，不亦說乎？有朋自遠方來，不亦樂乎？'
    : has(title, ['修辭', '譬喻', '擬人'])
      ? '傍晚的風輕輕推開窗簾，夕陽把整間教室染成橘紅色。黑板沉默地守著一天留下的字跡。'
      : '下課鐘響後，操場一下子熱鬧起來。有人追著球跑，有人在樹蔭下聊天。十分鐘不長，卻像替忙碌的一天開了一扇小窗。'
  return {
    bridge: [`本單元的閱讀核心是：${unit.focus}`, '閱讀時不要急著猜「標準答案」。先把你做出的判斷連回文章中的字詞、句子或段落，找得到證據才是完整理解。'],
    visual: {
      kind: 'reading', title: '先讀一小段', caption: '第一遍只讀懂大意；第二遍再圈關鍵詞與前後關係。',
      items: [{ label: '文本', detail: text }],
    },
    practices: [
      practice(`${lesson.id}-p1`, '基礎', '用一句話說出這段文字「表面上發生了什麼」。', '先回答人物／景物與事件。', '依文本合理作答', '這一步只整理明確資訊，不急著解釋深層含義。'),
      practice(`${lesson.id}-p2`, '應用', '找出一個你認為重要的詞或句子，說明它為什麼重要。', '想想刪掉它後，段落會少掉什麼資訊或情緒。', '需引用文本線索並解釋', '閱讀理解不能只說「我覺得」，要能指出文本證據。'),
      practice(`${lesson.id}-p3`, '挑戰', '這段文字除了表面內容，還可能傳達什麼情緒或觀點？', '觀察語氣、比喻、對比或結尾。', '合理解讀且有文本證據', '不同解讀可以並存，但都必須由文本支持。'),
    ],
    takeaway: '國文閱讀的關鍵是「理解 → 找證據 → 解釋」，不是只背作者與修辭名稱。',
  }
}

function sciencePack(unit: CurriculumUnitBundle, lesson: CurriculumLessonPlan): RichLessonPack {
  const title = unit.title
  if (has(title, ['物質', '水', '熱', '狀態'])) {
    return {
      bridge: ['自然科學先分清楚「看到什麼」和「為什麼」。看到杯子外有水珠是觀察；說水蒸氣凝結則是解釋。', '好的解釋需要能用可觀察、可測量的證據支持。'],
      visual: {
        kind: 'experiment', title: '冰水杯外的水珠從哪裡來？', caption: '用比較實驗排除「杯子漏水」的可能。',
        items: [
          { label: '1 準備', detail: '一杯冰水、一杯常溫水，杯外先擦乾' },
          { label: '2 觀察', detail: '數分鐘後比較兩個杯子外側' },
          { label: '3 紀錄', detail: '冰水杯外側出現較多水珠' },
          { label: '4 解釋', detail: '空氣水蒸氣遇冷凝結成液態水' },
        ],
      },
      practices: [
        practice(`${lesson.id}-p1`, '基礎', '「冰水杯外出現小水滴」是觀察還是解釋？', '它是直接看到的現象。', '觀察', '能直接看見或測量的結果屬於觀察。'),
        practice(`${lesson.id}-p2`, '應用', '為什麼常溫杯外的水珠通常比冰水杯少？', '比較兩個杯壁的溫度。', '常溫杯較不容易讓水蒸氣凝結', '較冷表面更容易讓附近空氣中的水蒸氣凝結。'),
        practice(`${lesson.id}-p3`, '挑戰', '怎麼設計方法確認水珠不是從杯內滲漏？', '想辦法讓杯內液體不直接接觸外壁，或做比較組。', '可用密封容器／對照組等方法', '重點是控制其他條件，建立能排除替代解釋的證據。'),
      ],
      takeaway: '科學不是先背答案，而是用觀察、比較與證據逐步支持或排除解釋。',
    }
  }

  if (has(title, ['電', '電路'])) {
    return {
      bridge: ['燈泡發亮需要電流有完整路徑。只把電池和燈泡「碰在一起」不一定形成閉合電路。', '畫電路時要追蹤電流是否能從電池一端出發，經元件後回到另一端。'],
      visual: {
        kind: 'experiment', title: '閉合電路檢查', caption: '依序確認每一段路徑是否連接。',
        items: [
          { label: '電池', detail: '提供電位差' }, { label: '導線', detail: '形成導電路徑' }, { label: '燈泡', detail: '把電能轉換成光和熱' }, { label: '回路', detail: '必須接回電池另一端' },
        ],
      },
      practices: [
        practice(`${lesson.id}-p1`, '基礎', '電路中有一條導線斷開，燈泡會亮嗎？', '想想電流路徑是否完整。', '不會', '路徑中斷形成開路，無法建立完整電流路徑。'),
        practice(`${lesson.id}-p2`, '應用', '開關打開時燈不亮、閉合時燈亮，開關控制的是什麼？', '開關會改變路徑是否連續。', '是否形成閉合電路', '開關的主要作用是接通或切斷電路。'),
        practice(`${lesson.id}-p3`, '挑戰', '如果燈泡不亮，你會依什麼順序檢查？', '從電源、接點、元件一路排除。', '檢查電池→接點→導線→燈泡→是否閉合', '系統化排錯比隨機換零件更能找出真正原因。'),
      ],
      takeaway: '分析電路時不要只看元件數量，而要沿著路徑檢查是否形成完整閉合回路。',
    }
  }

  return {
    bridge: [`這個單元要理解：${unit.focus}`, '把學習流程固定成「提出問題 → 觀察／測量 → 整理證據 → 解釋 → 再驗證」，能避免把猜測直接當成結論。'],
    visual: {
      kind: 'experiment', title: '科學探究流程', caption: '每一步都要留下可檢查的證據。',
      items: [
        { label: '問題', detail: '我想知道什麼？' }, { label: '假設', detail: '我預期會發生什麼？' }, { label: '方法', detail: '怎麼公平比較？' }, { label: '資料', detail: '實際觀察或測量' }, { label: '結論', detail: '資料支持什麼？' },
      ],
    },
    practices: [
      practice(`${lesson.id}-p1`, '基礎', '把本單元的一個敘述分成「觀察」和「解釋」。', '能直接看到／量到的是觀察。', '依本單元內容分類', '先把資料和推論分開，是科學推理的第一步。'),
      practice(`${lesson.id}-p2`, '應用', '設計一個簡單比較實驗，指出你要控制的條件。', '只改一個主要變因，其餘盡量相同。', '合理實驗設計', '公平比較能讓結果更容易歸因到你真正想研究的變因。'),
      practice(`${lesson.id}-p3`, '挑戰', '如果實驗結果和原本假設不同，該怎麼辦？', '科學不是為了證明自己一定對。', '保留資料、檢查方法並修正假設', '和預期不同的結果仍然是有效資訊，重點是能否重複與合理解釋。'),
    ],
    takeaway: '自然科的答案要能回到證據；「我覺得」只是起點，不是終點。',
  }
}

function socialPack(unit: CurriculumUnitBundle, lesson: CurriculumLessonPlan): RichLessonPack {
  const title = unit.title
  if (has(title, ['歷史', '時代', '事件'])) {
    return {
      bridge: ['歷史不是一串年份。年份只是定位點，真正要理解的是事件之前有哪些條件、事件本身發生什麼、之後造成哪些改變。', '同一事件可能有政治、經濟、社會等多個原因，也可能對不同群體產生不同影響。'],
      visual: {
        kind: 'timeline', title: '事件因果時間軸', caption: '把「背景 → 事件 → 立即影響 → 長期影響」連起來。',
        items: [
          { label: '背景', detail: '先前累積的條件與矛盾' }, { label: '事件', detail: unit.title }, { label: '短期', detail: '當下制度、人物或生活的變化' }, { label: '長期', detail: '後續社會結構與觀念的影響' },
        ],
      },
      practices: [
        practice(`${lesson.id}-p1`, '基礎', '列出理解一個歷史事件至少要問的兩個問題。', '不要只問「哪一年」。', '例如：為什麼發生？造成什麼影響？', '時間只是定位；原因、過程與影響才構成歷史理解。'),
        practice(`${lesson.id}-p2`, '應用', '把本單元一個事件分成「原因」與「結果」。', '先確認時間先後，再判斷是否真的有關聯。', '依單元史實整理', '先後發生不一定等於因果，需要教材或史料證據支持。'),
        practice(`${lesson.id}-p3`, '挑戰', '同一事件可能對兩個不同群體造成什麼不同影響？', '從身分、資源與制度位置想。', '合理比較並附理由', '歷史影響常因群體位置不同而不一樣，這也是多觀點閱讀的重要性。'),
      ],
      takeaway: '歷史理解要把時間、背景、因果與不同觀點連在一起，而不是單獨背日期。',
    }
  }

  if (has(title, ['地圖', '地理', '空間', '環境'])) {
    return {
      bridge: ['地圖不是裝飾圖。閱讀地圖時先確認方向、圖例、比例尺與資料時間，再開始解釋空間分布。', '地理題常在問「為什麼這些現象集中在某些地方」，需要把自然環境、交通、人口與產業放在一起看。'],
      visual: {
        kind: 'spatial', title: '空間判讀四層', caption: '從位置一路推到人與環境的關係。',
        items: [
          { label: '位置', detail: '在哪裡？相對於什麼？' }, { label: '分布', detail: '集中、分散或沿線？' }, { label: '條件', detail: '地形、氣候、交通、資源' }, { label: '影響', detail: '人口、產業、生活方式' },
        ],
      },
      practices: [
        practice(`${lesson.id}-p1`, '基礎', '看一張地圖前，至少先確認哪三項資訊？', '想想地圖邊緣常見的元素。', '方向、圖例、比例尺（或時間／資料來源）', '沒有先確認圖例和單位，很容易把顏色或距離讀錯。'),
        practice(`${lesson.id}-p2`, '應用', '某些聚落沿河流分布，可能有哪些原因？', '想水源、交通、地形與農業。', '可能因水源、交通、灌溉或平坦地形', '空間分布通常不是單一原因，要依地區條件判斷。'),
        practice(`${lesson.id}-p3`, '挑戰', '同一地區交通改善後，人口與產業可能怎麼改變？', '從可達性與成本思考。', '可能吸引人口／投資並改變土地利用', '交通改變可達性，進一步影響產業位置、通勤與都市發展。'),
      ],
      takeaway: '地理不是背地名，而是用地圖和資料解釋「為什麼現象出現在這裡」。',
    }
  }

  return {
    bridge: [`本單元要理解：${unit.focus}`, '社會科要分清楚「資料中的事實」、「作者或人物的觀點」與「我們做出的判斷」，再比較不同證據。'],
    visual: {
      kind: 'concept-map', title: '社會資料判讀', caption: '不要只看一個數字或一句話就下結論。',
      items: [
        { label: '來源', detail: '誰製作？何時？目的？' }, { label: '事實', detail: '哪些內容可直接查證？' }, { label: '觀點', detail: '作者如何解釋？' }, { label: '比較', detail: '其他資料是否支持？' },
      ],
    },
    practices: [
      practice(`${lesson.id}-p1`, '基礎', '資料判讀時，為什麼要先看來源和時間？', '同一份資料在不同時空可能代表不同意義。', '確認資料適用範圍與可信度', '來源、時間與蒐集方法會影響我們能否用它支持某個結論。'),
      practice(`${lesson.id}-p2`, '應用', '把一個公共議題分成「事實」與「意見」。', '可被查證的是事實；價值判斷通常是意見。', '依題目資料分類', '先分清兩者，才能避免把立場直接當成證據。'),
      practice(`${lesson.id}-p3`, '挑戰', '如果兩份資料得出不同結論，你下一步該做什麼？', '比較資料來源、樣本、時間與定義。', '檢查方法與背景，再找第三方資料交叉驗證', '資料衝突時，不應直接挑自己喜歡的答案，而要分析差異來源。'),
    ],
    takeaway: '社會科的核心能力是以資料與制度為基礎理解世界，同時能比較不同立場。',
  }
}

export function buildRichLessonPack(subject: CurriculumSubjectId, grade: number, unit: CurriculumUnitBundle, lesson: CurriculumLessonPlan): RichLessonPack {
  if (subject === 'math') return mathPack(grade, unit, lesson)
  if (subject === 'english') return englishPack(grade, unit, lesson)
  if (subject === 'chinese') return chinesePack(unit, lesson)
  if (subject === 'science') return sciencePack(unit, lesson)
  return socialPack(unit, lesson)
}
