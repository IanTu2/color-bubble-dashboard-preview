import type { ReviewedUnitContent } from './curriculum-reviewed-social10'

const beBasics: ReviewedUnitContent = {
  grade:7,subject:'english',unitId:'g7-english-s1-u1',reviewStatus:'reviewed',
  researchBasis:['十二年國教英語文第四學習階段溝通功能與語言知識','七年級基礎自我介紹、be 動詞與人稱代名詞公開課程'],
  overview:'第一單元要讓學生真的能「介紹自己、辨認人物與狀態」，而不是只背 am／is／are 表格。先從完整語意出發，再整理人稱、be 動詞、否定、問句與縮寫。',
  concepts:[
    {title:'be 動詞連接主詞和身分／狀態',explanation:'am、is、are 常用來說明「是誰、是什麼、在哪裡、什麼狀態」。先看句子想表達的關係，再選形式。',example:'I am a student. / My bag is on the desk. / They are tired.'},
    {title:'主詞決定 am／is／are',explanation:'I 搭配 am；he/she/it 與單數名詞多搭 is；you/we/they 與複數名詞搭 are。'},
    {title:'人稱代名詞替代已知人物／事物',explanation:'I, you, he, she, it, we, they 幫助避免一直重複名詞。選代名詞時要看人物數量與語境。'},
    {title:'a／an 與單數可數名詞',explanation:'第一次提到一個單數可數的人或物時常用 a/an。a/an 的選擇看後面單字開頭的「聲音」，不是只看字母。',example:'an apple, a uniform.'},
    {title:'be 動詞否定',explanation:'在 be 後加 not：am not, is not/isn’t, are not/aren’t。否定的位置和一般動詞不同。'},
    {title:'Yes/No 問句把 be 放到主詞前',explanation:'She is new. → Is she new? 回答時仍要配合主詞：Yes, she is. / No, she isn’t.'},
    {title:'Wh- 問句先確認要問的資訊',explanation:'Who 問人、What 問事物／資訊、Where 問地點、How 問狀態或方式。be 動詞結構常是 Wh-word + be + subject…?'},
    {title:'縮寫是自然語流的一部分',explanation:'I’m, you’re, he’s, she’s, it’s, we’re, they’re 常見於口語與非正式書寫；但所有格 its 和 it’s (=it is) 要區分。'},
  ],
  workedExamples:[{
    title:'第一次見面，怎麼完成一段自然自我介紹',
    context:'New student Amy meets Leo before class.\nAmy: Hi, I’m Amy. I’m new here.\nLeo: Hi, Amy. I’m Leo. Are you in Class 701?\nAmy: Yes, I am. Where is our classroom?\nLeo: It’s on the second floor.',
    prompt:'這段對話用了哪些 be 動詞功能？',
    steps:['I’m Amy / I’m Leo：介紹身分。','I’m new：描述狀態。','Are you in Class 701?：用 be 問 Yes/No 問題。','Where is our classroom?：用 where + be 問地點。','It’s on the second floor：用 be 連接主詞和位置。'],
    answer:'同一個 be 動詞系統可以完成身分、狀態、位置與問答，不只是填空規則。',
    explanation:'把文法放進對話，學生才知道何時需要它。',
  }],
  questions:[
    {id:'g7-english-s1-u1-q1',kind:'choice',level:'理解',prompt:'Choose the best sentence for introducing yourself.',options:['I am Kevin.','I is Kevin.','Me are Kevin.','Kevin am I a.'],correctIndex:0,explanation:'With subject I, use am: I am Kevin.'},
    {id:'g7-english-s1-u1-q2',kind:'choice',level:'理解',prompt:'Mia and Ben are my classmates. ___ are friendly.',options:['They','She','He','It'],correctIndex:0,explanation:'Mia and Ben refers to two people, so use They.'},
    {id:'g7-english-s1-u1-q3',kind:'choice',level:'應用',prompt:'Choose the correct sentence.',options:['My books are on the desk.','My books is on the desk.','My books am on the desk.','My books be on desk.'],correctIndex:0,explanation:'Books is plural, so use are.'},
    {id:'g7-english-s1-u1-q4',kind:'choice',level:'理解',prompt:'Which article is correct?',options:['an apple','a apple','an uniform','a orange'],correctIndex:0,explanation:'Apple begins with a vowel sound. Uniform begins with a /j/ sound, so it takes a.'},
    {id:'g7-english-s1-u1-q5',kind:'choice',level:'應用',context:'Nina: Is Tom your brother?\nKen: ___',prompt:'Choose the best reply.',options:['Yes, he is.','Yes, Tom are.','Yes, I am.','He yes is.'],correctIndex:0,explanation:'The question refers to Tom = he, so answer Yes, he is.'},
    {id:'g7-english-s1-u1-q6',kind:'choice',level:'應用',prompt:'Turn “She is at home.” into a Yes/No question.',options:['Is she at home?','Does she is at home?','She is at home? is','Are she at home?'],correctIndex:0,explanation:'With be, move is before the subject: Is she…?'},
    {id:'g7-english-s1-u1-q7',kind:'choice',level:'檢核',context:'A: ___ is your science teacher?\nB: Mr. Lin.',prompt:'Which question word fits best?',options:['Who','Where','When','How many'],correctIndex:0,explanation:'The answer is a person, so ask Who.'},
    {id:'g7-english-s1-u1-q8',kind:'response',level:'檢核',prompt:'Write 3 short sentences to introduce yourself: name, class/grade, and one feeling or identity. Use be correctly.',sampleAnswer:'I’m Amy. I’m in Grade 7. I’m excited about my new school.',explanation:'重點是三個完整句子都能以正確主詞＋be 表達實際意思，不要求照抄範例。'},
  ],
  takeaway:['I→am；單數 he/she/it→is；you/we/they→are。','be 可表身分、狀態與位置。','否定在 be 後加 not。','問句把 be 移到主詞前。','學文法要放進完整對話與語境。'],
}

const presentSimple: ReviewedUnitContent = {
  grade:7,subject:'english',unitId:'g7-english-s1-u2',reviewStatus:'reviewed',
  researchBasis:['十二年國教英語文第四學習階段日常溝通功能','七年級一般現在式、do/does、頻率與作息公開課程'],
  overview:'一般現在式主要用來談習慣、規律、事實與長期狀態。最容易出錯的是第三人稱單數和 do／does 問答，因此每個規則都放回「日常作息」語境練。',
  concepts:[
    {title:'一般現在式描述習慣與規律',explanation:'Every day, usually, on Mondays 等時間訊號常和一般現在式搭配。',example:'I walk to school every day.'},
    {title:'I/you/we/they 使用原形動詞',explanation:'一般肯定句中，這些主詞通常接動詞原形。'},
    {title:'he/she/it 的動詞多加 -s/-es',explanation:'第三人稱單數肯定句要注意動詞變化，例如 plays, watches, studies。'},
    {title:'否定使用 do not / does not',explanation:'加入 does 後，主要動詞回原形：He doesn’t play，不是 doesn’t plays。'},
    {title:'問句使用 Do / Does',explanation:'Do you…? / Does she…? 回答也用 do/does：Yes, she does.'},
    {title:'頻率副詞的位置',explanation:'always, usually, often, sometimes, never 通常放在一般動詞前；若句中是 be，常放在 be 後。'},
    {title:'時間與頻率片語補充「多久一次」',explanation:'every day, twice a week, on weekends 等可說明規律頻率。'},
    {title:'讀作息表要把時間資料和句型連起來',explanation:'閱讀日程表時先找人物、時間和活動，再把資料轉成完整句子，不要只抓單字。'},
  ],
  workedExamples:[{
    title:'從一張簡單作息表寫完整句子',
    context:'Leo’s weekdays: 6:30 get up / 7:20 go to school / 16:30 practice basketball / 22:30 go to bed.',
    prompt:'How can we describe Leo’s routine?',
    steps:['主詞 Leo = he，所以肯定句動詞要考慮第三人稱單數。','Leo gets up at 6:30.','He goes to school at 7:20.','He practices basketball after school and goes to bed at 10:30 p.m.'],
    answer:'Use the present simple and third-person -s/-es to describe his regular routine.',
    explanation:'先讀懂表格，再用文法把資料變成語言。',
  }],
  questions:[
    {id:'g7-english-s1-u2-q1',kind:'choice',level:'理解',prompt:'Choose the correct sentence.',options:['I play basketball after school.','I plays basketball after school.','I playing basketball after school.','I does play basketball every day.'],correctIndex:0,explanation:'With I in a regular affirmative sentence, use the base verb play.'},
    {id:'g7-english-s1-u2-q2',kind:'choice',level:'理解',prompt:'My sister ___ TV after dinner.',options:['watches','watch','watching','does watches'],correctIndex:0,explanation:'My sister = she, so watch → watches.'},
    {id:'g7-english-s1-u2-q3',kind:'choice',level:'應用',prompt:'Choose the correct negative sentence.',options:['He doesn’t like milk.','He doesn’t likes milk.','He not like milk.','He don’t likes milk.'],correctIndex:0,explanation:'After doesn’t, use the base verb like.'},
    {id:'g7-english-s1-u2-q4',kind:'choice',level:'應用',prompt:'___ your brother walk to school every day?',options:['Does','Do','Is','Are'],correctIndex:0,explanation:'Your brother is third-person singular; use Does + base verb.'},
    {id:'g7-english-s1-u2-q5',kind:'choice',level:'理解',prompt:'Which sentence places the frequency adverb naturally?',options:['I usually eat breakfast at home.','I eat usually breakfast at home.','Usually I breakfast eat home.','I do usually eats breakfast.'],correctIndex:0,explanation:'Frequency adverbs commonly appear before an ordinary main verb.'},
    {id:'g7-english-s1-u2-q6',kind:'choice',level:'應用',context:'A: Does Mia take the bus?\nB: ___ She walks.',prompt:'Choose the best answer.',options:['No, she doesn’t.','No, she isn’t.','No, she don’t.','No, Mia not.'],correctIndex:0,explanation:'A Does-question is answered with does/doesn’t.'},
    {id:'g7-english-s1-u2-q7',kind:'choice',level:'檢核',prompt:'Which sentence describes a regular habit rather than an action happening right now?',options:['Ben reads before bed every night.','Ben is reading right now.','Look! Ben is running.','Ben is talking at this moment.'],correctIndex:0,explanation:'Every night signals a regular habit, so use the present simple.'},
    {id:'g7-english-s1-u2-q8',kind:'response',level:'檢核',prompt:'Write 3 sentences about a family member’s regular routine. Include at least one third-person -s/-es verb and one frequency word.',sampleAnswer:'My dad usually gets up at six. He drinks coffee before work. He sometimes walks home after dinner.',explanation:'檢查是否描述規律習慣、第三人稱動詞形式正確，且頻率詞位置自然。'},
  ],
  takeaway:['一般現在式常談習慣與規律。','he/she/it 肯定句動詞要注意 -s/-es。','does 出現後主要動詞回原形。','頻率副詞位置要和動詞類型搭配。','先理解作息資料，再轉成完整句子。'],
}

const whLife: ReviewedUnitContent = {
  grade:7,subject:'english',unitId:'g7-english-s1-u3',reviewStatus:'reviewed',
  researchBasis:['十二年國教英語文第四學習階段問答與生活主題','七年級 Wh- questions、時間日期、地點與生活資訊公開課程'],
  overview:'Wh- 問句的本質是「你缺哪一種資訊？」Who 問人、What 問事物、Where 問地點、When 問時間、Why 問原因、How 問方式或狀態。先看答案類型，再組問句。',
  concepts:[
    {title:'Who / What / Where / When',explanation:'先辨識要問的是人、事物、地點還是時間，再選 question word。'},
    {title:'Why / How',explanation:'Why 問原因，常用 because 回答；How 可問方式、狀態，也可和 old, many, much, often 等組合。'},
    {title:'be 問句與一般動詞問句結構不同',explanation:'Where is Tina?；Where does Tina live? 第二句需要 does，因為主要動詞是 live。'},
    {title:'時間表達',explanation:'at + 時刻；on + 日期／星期；in + 月份／年份／較長時段，是常見基礎搭配。'},
    {title:'How often 問頻率',explanation:'可回答 every day, once a week, twice a month, usually 等。'},
    {title:'How many / How much',explanation:'How many 後接可數複數；How much 可問不可數量或價格。'},
    {title:'問句要能自然接住答案',explanation:'檢查方法：把預期答案放回去，看問題是否真的在問那個資訊。'},
    {title:'短篇生活資訊閱讀',explanation:'公告、課表、活動海報常混合日期、時間、地點、費用與注意事項，閱讀時先定位問題需要哪一欄。'},
  ],
  workedExamples:[{
    title:'從活動海報找資料再提出問題',
    context:'School Music Day\nDate: October 18\nTime: 2:00–4:00 p.m.\nPlace: School Hall\nTickets: NT$50\nStudents can buy tickets at the library.',
    prompt:'How can we ask about four different pieces of information?',
    steps:['When is School Music Day? → October 18.','Where is it? → In the school hall.','How much is a ticket? → NT$50.','Where can students buy tickets? → At the library.'],
    answer:'Choose the Wh-expression based on the information you need.',
    explanation:'閱讀與問句可以一起練：先找資訊類型，再問得精確。',
  }],
  questions:[
    {id:'g7-english-s1-u3-q1',kind:'choice',level:'理解',prompt:'___ is your best friend? — Kevin.',options:['Who','Where','When','Why'],correctIndex:0,explanation:'Kevin is a person, so ask Who.'},
    {id:'g7-english-s1-u3-q2',kind:'choice',level:'理解',prompt:'___ do you live? — In Taichung.',options:['Where','Who','When','How old'],correctIndex:0,explanation:'The answer is a place.'},
    {id:'g7-english-s1-u3-q3',kind:'choice',level:'應用',prompt:'Choose the correct question.',options:['Where does Mia live?','Where Mia does live?','Where is Mia live?','Does where Mia live?'],correctIndex:0,explanation:'For an ordinary verb, use Wh-word + does + subject + base verb.'},
    {id:'g7-english-s1-u3-q4',kind:'choice',level:'理解',prompt:'Which preposition is correct?',options:['at 7:30','on 7:30','in 7:30','by Monday at as'],correctIndex:0,explanation:'Use at with clock times.'},
    {id:'g7-english-s1-u3-q5',kind:'choice',level:'應用',prompt:'___ do you practice the piano? — Twice a week.',options:['How often','How many','What time is','Who'],correctIndex:0,explanation:'Twice a week describes frequency.'},
    {id:'g7-english-s1-u3-q6',kind:'choice',level:'理解',prompt:'___ books are in your bag?',options:['How many','How much','How old','Why'],correctIndex:0,explanation:'Books are countable plural nouns, so use How many.'},
    {id:'g7-english-s1-u3-q7',kind:'choice',level:'檢核',context:'Event: Science Club Open House / Nov. 6 / Room 305 / Free',prompt:'Which question can be answered by “Room 305”?',options:['Where is the open house?','When is the open house?','How much is it?','Who is November?'],correctIndex:0,explanation:'Room 305 is a location.'},
    {id:'g7-english-s1-u3-q8',kind:'response',level:'檢核',context:'Your new classmate says: “I play badminton after school on Tuesdays.”',prompt:'Write two different Wh- questions you can ask about this sentence.',sampleAnswer:'What do you play after school? / When do you play badminton? / When do you play it? / What do you do on Tuesdays?',explanation:'問題必須對應句中可回答的資訊，且一般動詞問句要使用 do/does 結構。'},
  ],
  takeaway:['Wh-word 先依要問的資訊種類選。','be 問句和一般動詞問句結構不同。','at/on/in 用於不同時間尺度。','How often 問頻率。','生活閱讀先定位時間、地點、價格等資訊。'],
}

const imperativesModals: ReviewedUnitContent = {
  grade:7,subject:'english',unitId:'g7-english-s2-u1',reviewStatus:'reviewed',
  researchBasis:['十二年國教英語文第四學習階段生活指令與溝通功能','七年級祈使句、can 等情態動詞公開課程'],
  overview:'這個單元處理「請別人做事、給指示、說能不能、提出簡單請求」。規則不難，但語氣和情境很重要：同一句文法正確，不一定在所有場合都自然或禮貌。',
  concepts:[
    {title:'祈使句用原形動詞開頭',explanation:'Open the door. / Turn left. 主詞 you 通常省略。'},
    {title:'否定祈使句用 Don’t + 原形',explanation:'Don’t run. / Don’t touch the glass. 用於禁止或提醒。'},
    {title:'please 可以調整語氣',explanation:'Please sit down. / Sit down, please. 可增加禮貌，但情境、語調與關係也影響語氣。'},
    {title:'can 表能力',explanation:'I can swim. / She can’t drive. can 後面接原形動詞，不加 -s。'},
    {title:'Can…? 可問能力或提出請求',explanation:'Can you swim? 問能力；Can you help me? 在情境中是請求。'},
    {title:'must / mustn’t 的基本義',explanation:'must 常表示強烈必要；mustn’t 表示禁止，不等於「不必」。初學時要和 don’t have to 的概念區分。'},
    {title:'指示語要按順序清楚',explanation:'First, then, next, finally 等可幫助說明步驟。'},
    {title:'讀標誌要把圖示和語言連起來',explanation:'No food, Keep quiet, Turn off your phone 等常見於公共場所；不能只背句型，還要知道在哪裡會看到。'},
  ],
  workedExamples:[{
    title:'在圖書館怎麼給新生簡單指示',
    context:'A new student is using the school library. Signs say: Keep quiet. No food or drinks. Return books here. You can use the computers for schoolwork.',
    prompt:'Which sentences are rules, commands, and permission/ability statements?',
    steps:['Keep quiet. / Return books here. → affirmative imperatives.','No food or drinks. → a short prohibition sign; full instruction can be Don’t eat or drink here.','You can use the computers… → can expresses permission in this context.','The language matches the place and purpose.'],
    answer:'Imperatives give direct instructions; can/can’t can express ability or permission depending on context.',
    explanation:'同一語法形式要和場合功能一起理解。',
  }],
  questions:[
    {id:'g7-english-s2-u1-q1',kind:'choice',level:'理解',prompt:'Choose the correct imperative.',options:['Open your book.','You opens your book.','To open your book.','Opening your book is.'],correctIndex:0,explanation:'An affirmative imperative begins with the base verb.'},
    {id:'g7-english-s2-u1-q2',kind:'choice',level:'理解',prompt:'Choose the correct negative command.',options:['Don’t run in the hallway.','Doesn’t run in the hallway.','Not run hallway.','Don’t runs in hallway.'],correctIndex:0,explanation:'Use Don’t + base verb.'},
    {id:'g7-english-s2-u1-q3',kind:'choice',level:'理解',prompt:'She can ___ very fast.',options:['run','runs','running','ran'],correctIndex:0,explanation:'Modal can is followed by the base verb.'},
    {id:'g7-english-s2-u1-q4',kind:'choice',level:'應用',context:'You are carrying two heavy boxes.',prompt:'Which sentence is a natural request to a classmate?',options:['Can you help me, please?','You help me can.','Helping me now is can.','Does you can help?'],correctIndex:0,explanation:'Can you + base verb is a common simple request.'},
    {id:'g7-english-s2-u1-q5',kind:'choice',level:'理解',prompt:'“You mustn’t enter.” most nearly means:',options:['Entering is not allowed.','Entering is optional.','You are unable to enter physically.','You entered yesterday.'],correctIndex:0,explanation:'Mustn’t expresses prohibition.'},
    {id:'g7-english-s2-u1-q6',kind:'choice',level:'應用',context:'A sign is next to a wet floor.',prompt:'Which instruction fits best?',options:['Walk carefully.','Eat quickly.','Turn up the music.','Close your textbook forever.'],correctIndex:0,explanation:'The instruction should respond to the safety context.'},
    {id:'g7-english-s2-u1-q7',kind:'choice',level:'檢核',prompt:'Which sentence has a grammar problem?',options:['He can swims.','He can swim.','Can he swim?','He can’t swim.'],correctIndex:0,explanation:'After can, use the base form swim, not swims.'},
    {id:'g7-english-s2-u1-q8',kind:'response',level:'檢核',prompt:'Write 3 short rules for a science lab: one positive imperative, one negative imperative, and one sentence with must or can.',sampleAnswer:'Wear safety glasses. Don’t touch chemicals without permission. You must follow the teacher’s instructions.',explanation:'檢查三種功能是否符合科學實驗室情境，且動詞形式正確。'},
  ],
  takeaway:['祈使句用原形動詞。','否定祈使用 Don’t + 原形。','can 後接原形，不因主詞加 -s。','can 可依情境表能力、許可或請求。','文法正確之外，還要看語氣與場合。'],
}

const presentProgressive: ReviewedUnitContent = {
  grade:7,subject:'english',unitId:'g7-english-s2-u2',reviewStatus:'reviewed',
  researchBasis:['十二年國教英語文第四學習階段生活描述','七年級現在進行式與現在簡單式對比公開課程'],
  overview:'現在進行式用來描述「正在進行、暫時發生」的動作。核心不是看到中文「正在」就套公式，而是和一般現在式比較：一個談此刻／暫時，一個常談習慣與規律。',
  concepts:[
    {title:'be + V-ing',explanation:'現在進行式由 am/is/are + 動詞 -ing 組成，兩部分缺一不可。',example:'They are studying now.'},
    {title:'-ing 拼字基本變化',explanation:'多數直接 +ing；部分字去 e 再加 ing（write→writing）；部分短字需重複尾字母（run→running）。'},
    {title:'now / right now / Look! 等訊號',explanation:'這些詞常提示眼前正在發生，但仍要理解句意而不是只靠關鍵字。'},
    {title:'否定在 be 後加 not',explanation:'She isn’t sleeping. / They aren’t playing.'},
    {title:'問句把 be 移到主詞前',explanation:'Are you studying? / What is he doing?'},
    {title:'一般現在式 vs 現在進行式',explanation:'He walks to school every day.（習慣）/ He is walking to school now.（此刻進行）'},
    {title:'圖片描述要先看誰在做什麼',explanation:'寫圖片句子時先辨識人物數量與動作，再選 am/is/are 和正確 -ing 形式。'},
    {title:'短對話中的即時情境',explanation:'電話、視訊或現場問答常用 What are you doing? / I’m waiting for the bus. 描述當下。'},
  ],
  workedExamples:[{
    title:'同一個人，習慣和此刻可以不一樣',
    context:'Mia usually rides her bike to school. Today it is raining. She is taking the bus now.',
    prompt:'Why do the two verbs use different tenses?',
    steps:['usually 描述規律習慣 → rides。','today / now 描述今天此刻的暫時狀況 → is taking。','主詞都是 Mia，但時間觀點不同。','所以時態選擇不是只看主詞，而是看事件時間與功能。'],
    answer:'Use the present simple for the usual routine and the present progressive for what is happening now.',
    explanation:'時態是說話者如何定位事件，不是單純動詞變形表。',
  }],
  questions:[
    {id:'g7-english-s2-u2-q1',kind:'choice',level:'理解',prompt:'Look! The dog ___ after the ball.',options:['is running','runs every day','running is','does run now'],correctIndex:0,explanation:'Look! signals an action happening now; use is + running.'},
    {id:'g7-english-s2-u2-q2',kind:'choice',level:'理解',prompt:'What is the correct -ing form of “write”?',options:['writing','writeing','writting','writes'],correctIndex:0,explanation:'Drop the final silent e before adding -ing.'},
    {id:'g7-english-s2-u2-q3',kind:'choice',level:'理解',prompt:'Choose the correct negative sentence.',options:['They aren’t watching TV.','They not watching TV.','They don’t watching TV now.','They aren’t watch TV.'],correctIndex:0,explanation:'Present progressive negative: be + not + V-ing.'},
    {id:'g7-english-s2-u2-q4',kind:'choice',level:'應用',prompt:'Turn “Leo is doing his homework.” into a question.',options:['Is Leo doing his homework?','Does Leo doing his homework?','Leo is doing his homework? is','Is Leo do his homework?'],correctIndex:0,explanation:'Move is before the subject and keep doing.'},
    {id:'g7-english-s2-u2-q5',kind:'choice',level:'應用',context:'Every Saturday, Anna ___ with her grandmother. Right now, they ___ lunch together.',prompt:'Choose the best pair.',options:['cooks / are making','is cooking / make','cook / is making','cooking / makes'],correctIndex:0,explanation:'Every Saturday = routine; right now = action in progress.'},
    {id:'g7-english-s2-u2-q6',kind:'choice',level:'檢核',prompt:'Which sentence is incomplete?',options:['He studying now.','He is studying now.','Is he studying now?','He isn’t studying now.'],correctIndex:0,explanation:'The present progressive needs a form of be.'},
    {id:'g7-english-s2-u2-q7',kind:'choice',level:'應用',context:'On the phone: “Hi, I can’t talk long. I ___ for the train.”',prompt:'Which form fits?',options:['am waiting','wait every day','waiting','does wait'],correctIndex:0,explanation:'The speaker describes an action happening at the moment.'},
    {id:'g7-english-s2-u2-q8',kind:'response',level:'檢核',prompt:'Write two sentences about the same person: one regular habit and one action happening now. Make the tense contrast clear.',sampleAnswer:'My brother plays games after dinner. He is studying for a test right now.',explanation:'一個句子要用一般現在式表習慣，另一個用 be + V-ing 表此刻動作。'},
  ],
  takeaway:['現在進行式 = be + V-ing。','主詞決定 am/is/are。','問句與否定仍以 be 為核心。','一般現在式談規律；現在進行式談當下／暫時。','時態要由事件時間和溝通功能決定。'],
}

const pastSimple: ReviewedUnitContent = {
  grade:7,subject:'english',unitId:'g7-english-s2-u3',reviewStatus:'reviewed',
  researchBasis:['十二年國教英語文第四學習階段敘事與生活經驗','七年級過去簡單式與 did 問答公開課程'],
  overview:'過去簡單式用來談已經結束的過去事件。這一單元把規則動詞、不規則動詞、did 問答與時間順序放進「昨天、上週、一次經驗」的短敘事中。',
  concepts:[
    {title:'過去簡單式描述已結束事件',explanation:'yesterday, last night, two days ago 等常建立過去時間框架。'},
    {title:'規則動詞 -ed',explanation:'多數動詞加 -ed；部分有拼字變化，如 study→studied, stop→stopped。'},
    {title:'不規則動詞要在語境中累積',explanation:'go→went, see→saw, have→had, eat→ate 等需逐步熟悉，但應放在完整句子與常用情境。'},
    {title:'be 的過去式 was / were',explanation:'I/he/she/it 多搭 was；you/we/they 搭 were。'},
    {title:'否定使用 didn’t + 原形',explanation:'did 已標示過去，所以主要動詞回原形：didn’t go，不是 didn’t went。'},
    {title:'問句使用 Did + 主詞 + 原形',explanation:'Did you see the movie? / Yes, I did. / No, I didn’t.'},
    {title:'時間順序詞幫助敘事',explanation:'first, then, after that, finally 可讓多個過去事件的先後更清楚。'},
    {title:'閱讀短故事要分事件與背景',explanation:'was/were 常描述背景狀態；動作動詞則推進事件。初學時先辨認誰、何時、發生什麼。'},
  ],
  workedExamples:[{
    title:'把昨天的一段經驗說完整',
    context:'Yesterday, Leo missed the bus. He walked back home, got his bike, and rode to school. He was ten minutes late, but his teacher listened to his explanation.',
    prompt:'What makes this a clear past story?',
    steps:['Yesterday 建立已結束的過去時間。','missed / walked 是規則過去式；got / rode 是不規則過去式。','was 描述「遲到十分鐘」的過去狀態。','多個動作按時間順序排列，讀者知道事情怎麼發展。'],
    answer:'The story uses past-time signals and past verb forms to present a sequence of completed events.',
    explanation:'過去式不是單字變化練習，而是敘事的時間框架。',
  }],
  questions:[
    {id:'g7-english-s2-u3-q1',kind:'choice',level:'理解',prompt:'Yesterday, I ___ my grandma.',options:['visited','visit','visits','am visiting'],correctIndex:0,explanation:'Yesterday signals a completed past event; visit → visited.'},
    {id:'g7-english-s2-u3-q2',kind:'choice',level:'理解',prompt:'The past form of “go” is:',options:['went','goed','goes','going'],correctIndex:0,explanation:'Go is irregular: go → went.'},
    {id:'g7-english-s2-u3-q3',kind:'choice',level:'理解',prompt:'We ___ at the park last Sunday.',options:['were','was','are','be'],correctIndex:0,explanation:'With we in the past, use were.'},
    {id:'g7-english-s2-u3-q4',kind:'choice',level:'應用',prompt:'Choose the correct negative sentence.',options:['She didn’t watch TV last night.','She didn’t watched TV last night.','She doesn’t watched TV yesterday.','She not watch yesterday.'],correctIndex:0,explanation:'After didn’t, use the base verb watch.'},
    {id:'g7-english-s2-u3-q5',kind:'choice',level:'應用',prompt:'___ you see Ben yesterday?',options:['Did','Do','Does','Were see'],correctIndex:0,explanation:'Use Did + subject + base verb for a past simple question.'},
    {id:'g7-english-s2-u3-q6',kind:'choice',level:'應用',context:'A: Did Mia finish the project?\nB: ___',prompt:'Choose the best reply.',options:['Yes, she did.','Yes, she finished did.','Yes, she does.','Yes, she was.'],correctIndex:0,explanation:'A Did-question is answered with did/didn’t.'},
    {id:'g7-english-s2-u3-q7',kind:'choice',level:'檢核',prompt:'Which sentence has a past-tense error?',options:['He didn’t went to school.','He went to school.','Did he go to school?','He didn’t go to school.'],correctIndex:0,explanation:'Didn’t already carries past tense, so the main verb must be go.'},
    {id:'g7-english-s2-u3-q8',kind:'response',level:'檢核',prompt:'Write a 3-sentence mini story about yesterday. Use at least one regular past verb, one irregular past verb, and a time-order word.',sampleAnswer:'Yesterday, I finished my homework early. Then I went to the park with my sister. We played basketball before dinner.',explanation:'檢查過去時間框架、規則／不規則動詞與事件順序是否一致。'},
  ],
  takeaway:['過去簡單式談已結束事件。','規則動詞常加 -ed，不規則動詞需在語境累積。','was/were 是 be 的過去式。','did/didn’t 出現後主要動詞回原形。','過去式最適合放進短敘事與時間順序練習。'],
}

const UNITS: Record<string, ReviewedUnitContent> = {
  [beBasics.unitId]: beBasics,
  [presentSimple.unitId]: presentSimple,
  [whLife.unitId]: whLife,
  [imperativesModals.unitId]: imperativesModals,
  [presentProgressive.unitId]: presentProgressive,
  [pastSimple.unitId]: pastSimple,
}

export function getReviewedEnglish7UnitContent(unitId: string) {
  return UNITS[unitId] ?? null
}
