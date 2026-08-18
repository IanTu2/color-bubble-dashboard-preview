import { getTextbookUnitContentV20Editorial, type } from './curriculum-textbook-v20-editorial'
import { resolveCurriculumUnit } from './curriculum-plan-v5'
import type { ReviewedConcept, ReviewedQuestion, ReviewedWorkedExample } from './curriculum-reviewed-social10'
import type { TextbookMisconception, TextbookVisual, TextbookVocabulary } from './curriculum-textbook-v14'
import type { TextbookUnitContentV20Final } from './curriculum-textbook-v20-final'

type UnitContext = NonNullable<ReturnType<typeof resolveCurriculumUnit>>

type Task = { context: string; prompt: string; correct: string; distractors: string[]; explanation: string }

const normalize = (value: unknown) => String(value ?? '').replace(/\s+/g, ' ').trim()
const editorialResidue = /(V20 第一輪保底題|V20 .*fallback|later human rewrite|仍需人工改成真正專屬題型|仍是 V20 明確標記的 fallback)/i

function compact(value: unknown, max = 110) {
  const clean = normalize(value)
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).replace(/[，、；：,.!?。！？\s]+$/g, '')}…`
}

function stableHash(value: string) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) { hash ^= value.charCodeAt(index); hash = Math.imul(hash, 16777619) }
  return Math.abs(hash >>> 0)
}

function focusParts(context: UnitContext) {
  const values = `${context.unit.title}。${context.unit.focus}`.split(/[。；，、]|以及|並且|並|與|和/).map((v) => normalize(v)).filter((v) => v.length >= 2)
  const result = [...new Set(values)]
  const fillers = [`${context.unit.title}的核心條件`, `${context.unit.title}的表示與證據`, `${context.unit.title}的檢查與應用`]
  for (const filler of fillers) if (result.length < 3 && !result.includes(filler)) result.push(filler)
  return result.slice(0, 6)
}

function fallbackEnglish(context: UnitContext, index: number): Task {
  const text = `${context.unit.title} ${context.unit.focus}`.toLowerCase()
  const name = ['Amy','Ben','Cindy','David'][stableHash(`${context.unit.id}:${index}`) % 4]
  if (/教室|指令|命令|classroom/.test(text)) return { context:'The teacher says, “Please open your book to page ten.”', prompt:'What should the student do?', correct:'Open the book to page ten.', distractors:['Close the book and leave.','Write page ten on the wall.','Ask about yesterday’s weather.'], explanation:'The classroom instruction “open your book to page ten” directly tells the student what action to take.' }
  if (/問答|自我介紹|招呼|姓名|年齡|喜好/.test(text)) return { context:`${name} meets a new classmate. The classmate asks, “What is your name?”`, prompt:'Which reply completes the conversation naturally?', correct:`My name is ${name}.`, distractors:['I am at seven o’clock.','The pencil is under yesterday.','Because my name.'], explanation:'“What is your name?” asks for a name, so “My name is …” directly answers the question.' }
  if (/食物|購物/.test(text)) return { context:`${name} wants to buy two apples at a shop.`, prompt:'Which sentence clearly expresses the request?', correct:'I would like two apples, please.', distractors:['Two apples yesterday heavy.','I am apple two please.','Where apples was two?'], explanation:'“I would like …, please” is a clear polite request, and “two apples” keeps the requested quantity.' }
  if (/天氣|服裝/.test(text)) return { context:'It is cold and raining outside.', prompt:'Which sentence best connects the weather and clothing choice?', correct:'I should wear a raincoat and a warm jacket.', distractors:['I should wear sandals because it is snowing hot.','Yesterday wears the weather.','A jacket is seven o’clock.'], explanation:'The clothing choice must match both rain and low temperature.' }
  if (/健康|身體|建議/.test(text)) return { context:`${name} has a fever and feels tired.`, prompt:'Which advice is appropriate?', correct:'You should rest and tell an adult.', distractors:['You should run a race immediately.','You are fever yesterday.','The fever is under the desk.'], explanation:'“Should + base verb” gives advice, and rest/telling an adult fits the health situation.' }
  if (/旅行|交通|方向/.test(text)) return { context:`${name} needs to travel from the station to the museum. A sign says “Bus 5 → Museum.”`, prompt:'Which choice follows the travel information?', correct:'Take Bus 5 to the museum.', distractors:['Take the museum to Bus 5.','Yesterday Bus 5 is hungry.','Stay at the station because the sign says museum.'], explanation:'The sign directly links Bus 5 with the museum destination.' }
  if (/能力|興趣|can/.test(text)) return { context:`${name} can swim but cannot ride a bicycle yet.`, prompt:'Which sentence matches the information?', correct:`${name} can swim.`, distractors:[`${name} can rides a bicycle.`,`${name} cannot swimming.`,`${name} swam tomorrow can.`], explanation:'After “can,” use the base verb; the context explicitly says the person can swim.' }
  if (/現在式|習慣|作息/.test(text)) return { context:`${name} goes to the library every Saturday.`, prompt:'Which sentence correctly describes the repeated habit?', correct:`${name} goes to the library every Saturday.`, distractors:[`${name} going to the library every Saturday.`,`${name} went tomorrow every Saturday.`,`${name} go to library every Saturday.`], explanation:'A repeated habit uses the simple present; a singular third-person subject takes -s/-es.' }
  if (/句型整合|國中英語銜接|複雜句|複句|連接詞/.test(text)) return { context:`${name} stayed inside because it was raining heavily.`, prompt:'Which part gives the reason?', correct:'because it was raining heavily', distractors:['stayed inside tomorrow','because stayed is','heavily was inside'], explanation:'The clause introduced by “because” states the reason.' }
  if (/寫作|段落|議論/.test(text)) return { context:'A paragraph argues that schools should reduce food waste and then gives two examples of leftover lunches.', prompt:'Which sentence works best as a clear topic claim?', correct:'Schools should take practical steps to reduce food waste.', distractors:['Lunch is a word with five letters.','Yesterday schools because.','Two examples always prove every school is identical.'], explanation:'A topic claim should state the paragraph’s controlling idea and allow the following examples to support it.' }
  if (/聽力|聽說|口語|簡報/.test(text)) return { context:'Speaker: “Our club meeting moves from Tuesday to Thursday at 4 p.m. in Room 203.”', prompt:'Which note captures the essential change?', correct:'Club meeting: Thursday, 4 p.m., Room 203.', distractors:['Club meeting: Tuesday, time unknown.','Room 203 closes every Thursday forever.','The speaker dislikes clubs.'], explanation:'A useful note preserves the changed day, time and place without adding unsupported claims.' }
  if (/字彙|搭配詞|詞族|語境/.test(text)) return { context:'Sentence: “The committee reached a decision after reviewing the evidence.”', prompt:'Which word naturally completes the collocation “reach a ___”?', correct:'decision', distractors:['rain','quickly','blue'], explanation:'“Reach a decision” is a standard collocation and the surrounding sentence confirms the meaning.' }
  if (/跨文化|文化/.test(text)) return { context:`A visitor asks ${name} how to behave at a local event, but ${name} is not sure about every custom.`, prompt:'Which response is most responsible?', correct:'I can share what I know, but we should also check the event guidance.', distractors:['My experience represents everyone in the culture.','All customs are exactly the same everywhere.','We should guess and state it as a fact.'], explanation:'Cross-cultural communication should avoid overgeneralizing one person’s experience and should verify uncertain information.' }
  if (/環境|世界/.test(text)) return { context:'A short text explains that students reduced single-use cups by carrying reusable bottles for one month.', prompt:'What is the main idea?', correct:'Students changed one daily habit to reduce waste.', distractors:['Reusable bottles increase all waste.','The text is mainly about exam scores.','One month proves every environmental policy works.'], explanation:'The repeated details support a main idea about a practical waste-reduction habit, not a universal claim.' }
  if (/閱讀|文本|主旨|推論|學術|論述/.test(text)) return { context:'Passage: “The city added shade trees on three streets. Summer surface temperatures there fell, but the report says more data are needed before extending the result citywide.”', prompt:'Which conclusion is best supported?', correct:'The three streets became cooler, but the result should not yet be generalized to the whole city.', distractors:['Every street in the city is now cooler.','Trees never affect temperature.','The report proves a single cause with no uncertainty.'], explanation:'The conclusion must preserve both the observed local result and the report’s stated limit on generalization.' }
  return { context:`Unit: ${context.unit.title}. ${context.unit.focus}`, prompt:'Which response best follows the meaning and form required by this unit focus?', correct:'Use the unit focus and the complete context before choosing the English form.', distractors:['Choose only by the first familiar word.','Ignore the subject, time clue and word order.','Use a form from an unrelated sentence.'], explanation:`The task is limited to “${context.unit.title}”; the complete context and unit focus determine the acceptable English form.` }
}

function fallbackTask(context: UnitContext, index: number): Task {
  if (context.subject === 'english') return fallbackEnglish(context,index)
  if (context.subject === 'math') {
    const a=2+stableHash(`${context.unit.id}:${index}`)%7,b=1+stableHash(`${context.unit.id}:b:${index}`)%5
    return {context:`「${context.unit.title}」任務只使用本單元焦點：${context.unit.focus}。取兩個示例量 ${a} 與 ${b}，先判斷它們在本章代表的量或關係。`,prompt:`依「${context.unit.title}」的定義或關係，哪個步驟最應先完成？`,correct:'先把題目條件轉成本單元的符號、圖形或數量關係，再計算。',distractors:['直接套用另一章公式。','只看數字大小猜答案。','忽略單位與限制。'],explanation:'數學任務先建立與本章一致的表示，再做計算與驗算；這能避免跨章公式誤用。'}
  }
  if (context.subject === 'science') return {context:`研究「${context.unit.title}」時，留下兩次可比較的觀察／量測紀錄，並標示條件。`,prompt:'哪種做法最能支持本單元的科學判斷？',correct:'比較可重複的觀察或量測，並用本單元模型解釋差異。',distractors:['先決定答案再挑資料。','只記印象不記條件。','一次觀察就宣稱所有情況相同。'],explanation:'科學結論需要可比較證據、清楚條件與和本單元概念一致的模型。'}
  if (context.subject === 'social') return {context:`分析「${context.unit.title}」時，手上有兩份來源、時間或空間尺度不同的資料。`,prompt:'哪個步驟最能形成可靠判斷？',correct:'先核對來源、時間與尺度，再比較資料能支持的事實與解釋。',distractors:['只看標題決定結論。','把單一案例外推全部。','忽略資料年代直接混用。'],explanation:'社會科判讀必須把資料放回來源與時空脈絡，並限制結論不超過證據。'}
  return {context:`閱讀或表達「${context.unit.title}」時，先保留完整句段與前後文。`,prompt:'哪種做法最能支持本單元的語文判斷？',correct:'指出具體字詞、句段或篇章線索，再說明它如何支持解讀或表達。',distractors:['只看一個熟字就猜全文。','不讀前後文直接套答案。','把個人印象當成文本證據。'],explanation:'語文判斷要回到完整語境，以可指出的文本線索支持結論。'}
}

function cognitivePrompt(context: UnitContext, question: ReviewedQuestion, index: number, original: string) {
  const part = focusParts(context)[index % focusParts(context).length]
  if (question.level === '理解') return context.subject==='english' ? `Identify the clue for “${part},” then answer: ${original}` : `先指出「${part}」的關鍵條件或證據，再回答：${original}`
  if (question.level === '應用') return context.subject==='english' ? `Apply “${part}” to this new context: ${original}` : `把「${part}」用到這個新情境，完成：${original}`
  return context.subject==='english' ? `Check a likely mistake about “${part},” then choose the answer that survives the check: ${original}` : `先排除「${part}」最可能的錯法，再選出能通過檢查的答案：${original}`
}

function repairQuestions(context: UnitContext, questions: ReviewedQuestion[]) {
  return questions.map((question,index) => {
    const body=normalize(`${question.context} ${question.prompt} ${question.explanation}`)
    const replace=editorialResidue.test(body)
    const task=replace?fallbackTask(context,index):null
    if (question.kind==='choice') {
      const options=task?[task.correct,...task.distractors]:question.options
      return {...question,context:task?.context??question.context,prompt:cognitivePrompt(context,question,index,task?.prompt??question.prompt),options,correctIndex:task?0:question.correctIndex,explanation:task?.explanation??question.explanation}
    }
    const correct=task?.correct??question.sampleAnswer
    return {...question,context:task?.context??question.context,prompt:cognitivePrompt(context,question,index,task?.prompt??question.prompt),sampleAnswer:task?`${correct} ${task.explanation}`:question.sampleAnswer,explanation:task?.explanation??question.explanation}
  })
}

function repairExamples(context: UnitContext, examples: ReviewedWorkedExample[]) {
  return examples.map((example,index)=>{
    const body=normalize(`${example.context} ${example.prompt} ${example.explanation}`)
    if(!editorialResidue.test(body)) return example
    const task=fallbackTask(context,index+500)
    return {...example,title:`${context.unit.title}｜示範 ${index+1}`,context:task.context,prompt:task.prompt,steps:[`讀清楚本單元範圍：${context.unit.focus}`,'指出題幹中的直接條件或證據。',`依本單元方法完成判斷，得到「${task.correct}」。`,'回到題幹檢查答案沒有超出資料或語境。'],answer:`${task.correct}。`,explanation:task.explanation}
  })
}

function correctAnswer(question: ReviewedQuestion){return question.kind==='choice'?normalize(question.options?.[question.correctIndex]):normalize(question.sampleAnswer)}
function rebuildConcepts(context:UnitContext,questions:ReviewedQuestion[]):ReviewedConcept[]{return focusParts(context).map((part,index)=>({title:part,explanation:context.subject==='english'?`In “${context.unit.title},” connect “${part}” with meaning, form and the complete context. Check subject, time/reference clues and word order before deciding.`:`「${part}」必須放回「${context.unit.title}」的完整焦點「${compact(context.unit.focus,100)}」理解；先指出條件或證據，再完成推理、解讀或表達，最後做反向檢查。`,example:questions.length?`${compact(questions[index%questions.length].context,105)} ${compact(questions[index%questions.length].prompt,90)} → ${compact(correctAnswer(questions[index%questions.length]),80)}`:`完成一個「${part}」的本單元任務。`}))}
function rebuildMisconceptions(questions:ReviewedQuestion[]):TextbookMisconception[]{const out=[];for(const q of questions){if(out.length>=4)break;if(q.kind==='choice'){const wrong=(q.options??[]).find((_,i)=>i!==q.correctIndex);if(!wrong)continue;out.push({claim:`作答「${compact(q.prompt,62)}」時選了「${compact(wrong,48)}」。`,correction:`正確應為「${compact(correctAnswer(q),60)}」，並指出題幹中的直接條件。`,reason:compact(q.explanation,160)})}else out.push({claim:`回答「${compact(q.prompt,62)}」時只寫結果，沒有提出證據或步驟。`,correction:'補上題幹中的具體線索、計算、資料或語句，再連到結論。',reason:compact(q.explanation,160)})}return out.slice(0,4)}
function rebuildVisuals(context:UnitContext,concepts:ReviewedConcept[],misconceptions:TextbookMisconception[]):TextbookVisual[]{return[{id:`${context.unit.id}-v20-complete-map`,kind:'concept-map',title:`${context.unit.title}｜概念地圖`,caption:`從「${compact(context.unit.focus,105)}」整理本章概念與證據。`,items:concepts.map((c,i)=>({label:`${i+1}｜${compact(c.title,34)}`,detail:compact(c.explanation,140)}))},{id:`${context.unit.id}-v20-complete-errors`,kind:'comparison',title:`${context.unit.title}｜錯誤與修正`,caption:'把本章實際題目中的錯誤選項、正解與理由並列比較。',items:misconceptions.map((m,i)=>({label:`易錯 ${i+1}｜${compact(m.claim,48)}`,detail:`${compact(m.correction,82)} ${compact(m.reason,95)}`}))}]}
function rebuildVocabulary(concepts:ReviewedConcept[]):TextbookVocabulary[]{return concepts.map(c=>({term:compact(c.title,30),definition:compact(c.explanation,150)}))}

export function getTextbookUnitContentV20Complete(unitId:string):TextbookUnitContentV20Final|null{
  const source=getTextbookUnitContentV20Editorial(unitId),context=resolveCurriculumUnit(unitId);if(!source||!context)return null
  const questions=repairQuestions(context,source.questions??[]),examples=repairExamples(context,source.workedExamples??[]),concepts=rebuildConcepts(context,questions),misconceptions=rebuildMisconceptions(questions),visuals=rebuildVisuals(context,concepts,misconceptions)
  return {...source,questions,workedExamples:examples,concepts,misconceptions,visuals,vocabulary:rebuildVocabulary(concepts),objectives:concepts.slice(0,5).map(c=>context.subject==='english'?`Can use “${c.title}” in a complete context and explain the clue that supports the choice.`:`能說明並應用「${c.title}」，且用題目中的條件、證據或表示方式驗證答案。`),overview:`「${context.unit.title}」的學習範圍是：${context.unit.focus} 本章把概念、示範、練習、易錯判斷與視覺整理在同一範圍內；作答時需要指出可檢查的條件、證據或表示方式。`,takeaway:[`本章完整範圍：${context.unit.focus}`,`核心概念：${concepts.slice(0,4).map(c=>c.title).join('、')}。`,context.subject==='english'?'最後重讀完整句子或文本，檢查語意、形式、時間／指涉線索與語序。':context.subject==='math'?'最後用代回、估算、圖形或另一種表示檢查符號、數值、單位與範圍。':context.subject==='science'?'最後區分觀察、模型與推論，確認結論沒有超過資料能支持的範圍。':context.subject==='social'?'最後核對來源、時間、空間尺度與立場，避免把相關誤寫成因果或把單一案例外推全部。':'最後回到完整文本或生活脈絡，以具體線索支持解讀與表達。']}
}
const cache=new Map<string,TextbookUnitContentV20Final|null>()
export function getCachedTextbookUnitContentV20Complete(unitId:string){if(cache.has(unitId))return cache.get(unitId)??null;const unit=getTextbookUnitContentV20Complete(unitId);cache.set(unitId,unit);return unit}
