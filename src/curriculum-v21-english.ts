import type { ReviewedQuestion, ReviewedWorkedExample } from './curriculum-reviewed-social10'
import type { TextbookUnitContentV14 } from './curriculum-textbook-v14'
import {
  buildMisconceptions,
  choiceQuestion,
  cleanConcepts,
  formalQuestionSet,
  quickCheckSet,
  responseQuestion,
  seededInt,
  seededPick,
  stableHash,
  unitObjectives,
  unitOverview,
  visualSet,
  type V21SubjectBuild,
  type V21UnitContext,
} from './curriculum-v21-common'

type EnglishFamily =
  | 'phonics'
  | 'vocabulary-greetings'
  | 'be-basic'
  | 'present-simple'
  | 'questions'
  | 'modal-imperative'
  | 'progressive'
  | 'past'
  | 'gerund-infinitive'
  | 'comparison'
  | 'future'
  | 'complex-sentences'
  | 'reading'
  | 'perfect'
  | 'relative-clause'
  | 'passive'
  | 'condition-inference'
  | 'listening-speaking'
  | 'writing'
  | 'culture-academic'

type EnglishCase = {
  context: string
  prompt: string
  answer: string
  distractors: string[]
  steps: string[]
  explanation: string
}

function englishFamily(context: V21UnitContext): EnglishFamily {
  const text = `${context.unit.title} ${context.unit.focus}`
  if (/聲音|節奏|字母|字母音|拼讀|高頻字/.test(text)) return 'phonics'
  if (/生活單字|招呼|自我介紹|顏色|數字|教室|家庭|食物|購物|天氣|服裝|地點|方向|興趣|能力|健康|旅行|交通|環境|世界|字彙|搭配詞/.test(text) && !/時態|句型|問答|閱讀/.test(text)) return 'vocabulary-greetings'
  if (/Be 動詞|基本句型/.test(text)) return 'be-basic'
  if (/現在簡單式|現在式問答|日常作息/.test(text)) return 'present-simple'
  if (/疑問詞|簡單問答/.test(text)) return 'questions'
  if (/命令句|情態動詞|動作與指令/.test(text)) return 'modal-imperative'
  if (/現在進行|過去進行/.test(text)) return 'progressive'
  if (/過去簡單|過去事件|事件敘述/.test(text)) return 'past'
  if (/不定詞|動名詞/.test(text)) return 'gerund-infinitive'
  if (/比較級|最高級|比較與描述/.test(text)) return 'comparison'
  if (/未來|計畫/.test(text)) return 'future'
  if (/連接詞|複句|複雜句|句型整合|時態統整/.test(text)) return 'complex-sentences'
  if (/完成式/.test(text)) return 'perfect'
  if (/關係子句/.test(text)) return 'relative-clause'
  if (/被動語態/.test(text)) return 'passive'
  if (/條件|推論/.test(text)) return 'condition-inference'
  if (/聽力|聽說|口語|簡報/.test(text)) return 'listening-speaking'
  if (/寫作|書寫|議論/.test(text)) return 'writing'
  if (/閱讀|圖表|段落|長文|多文本/.test(text)) return 'reading'
  return 'culture-academic'
}

function familyLabel(family: EnglishFamily) {
  const labels: Record<EnglishFamily, string> = {
    phonics: 'phonics, sounds, and print',
    'vocabulary-greetings': 'everyday vocabulary and communication',
    'be-basic': 'be verbs and basic sentence patterns',
    'present-simple': 'simple present and routines',
    questions: 'questions and information exchange',
    'modal-imperative': 'commands, requests, and modal meaning',
    progressive: 'progressive aspect and actions in progress',
    past: 'past events and time reference',
    'gerund-infinitive': 'gerunds, infinitives, and verb patterns',
    comparison: 'comparatives, superlatives, and description',
    future: 'future plans, predictions, and intentions',
    'complex-sentences': 'connectors, clauses, and sentence relationships',
    reading: 'reading for main ideas, details, and evidence',
    perfect: 'perfect aspect and time relationships',
    'relative-clause': 'relative clauses and noun modification',
    passive: 'passive voice and information focus',
    'condition-inference': 'conditions, possibilities, and inference',
    'listening-speaking': 'listening, note-taking, and spoken interaction',
    writing: 'paragraph development and revision',
    'culture-academic': 'cross-cultural and academic language use',
  }
  return labels[family]
}

const NAMES = ['Mia', 'Leo', 'Amy', 'Noah', 'Tina', 'Ben', 'Ivy', 'Ethan'] as const
const PLACES = ['library', 'science room', 'gym', 'bus stop', 'school garden', 'museum'] as const
const ACTIVITIES = ['read comics', 'play badminton', 'practice the piano', 'feed the class fish', 'ride a bike', 'take photos'] as const

function englishCase(context: V21UnitContext, family: EnglishFamily, index: number): EnglishCase {
  const seed = stableHash(`${context.unit.id}-${family}-${index}`)
  const n = (min: number, max: number, shift = 0) => seededInt(seed + shift * 4099, min, max)
  const name = seededPick(NAMES, seed + 1)
  const place = seededPick(PLACES, seed + 2)
  const activity = seededPick(ACTIVITIES, seed + 3)

  if (family === 'phonics') {
    const items = [
      { target: 'cat', sound: '/k/', answer: 'c', distractors: ['g', 'm', 't'], clue: 'The first sound in “cat” is /k/.' },
      { target: 'fish', sound: '/f/', answer: 'f', distractors: ['v', 's', 'h'], clue: 'The first sound in “fish” is /f/.' },
      { target: 'map', sound: '/m/', answer: 'm', distractors: ['n', 'p', 'b'], clue: 'The first sound in “map” is /m/.' },
      { target: 'sun', sound: '/s/', answer: 's', distractors: ['z', 'c', 'r'], clue: 'The first sound in “sun” is /s/.' },
    ]
    const item = items[n(0, items.length - 1, 4)]
    return {
      context: `Word: ${item.target}. Focus on the first sound ${item.sound}.`,
      prompt: `Which letter matches the first sound in “${item.target}”?`,
      answer: item.answer,
      distractors: item.distractors,
      steps: ['Say the word slowly', 'Listen to the first sound', 'Match the sound to a letter', 'Say the word again to check'],
      explanation: item.clue,
    }
  }

  if (family === 'vocabulary-greetings') {
    const items = [
      { context: `${name} meets a new classmate in the morning.`, prompt: 'Which sentence is the most natural greeting?', answer: 'Good morning. Nice to meet you.', distractors: ['Good night. See you yesterday.', 'I am pencil.', 'Blue is seven.'] },
      { context: `${name} wants to buy two apples at a shop.`, prompt: 'Which sentence best fits the situation?', answer: 'I’d like two apples, please.', distractors: ['Two apples are rainy.', 'I can two apples.', 'Where is yesterday?'] },
      { context: `${name} cannot find the ${place}.`, prompt: 'Which question is most useful?', answer: `Excuse me, where is the ${place}?`, distractors: [`How old is the ${place}?`, `What time are you ${place}?`, `The ${place} can blue.`] },
    ]
    const item = items[n(0, items.length - 1, 4)]
    return {
      ...item,
      steps: ['Identify the real-life purpose', 'Choose words that fit the setting', 'Use a complete natural expression', 'Check politeness and meaning'],
      explanation: 'Vocabulary is useful when it fits a real communicative purpose. The correct sentence matches both meaning and situation.',
    }
  }

  if (family === 'be-basic') {
    const subject = n(0, 1, 1) ? 'They' : name
    const complement = n(0, 1, 2) ? `in the ${place}` : 'ready for class'
    const verb = subject === 'They' ? 'are' : 'is'
    return {
      context: `Complete the sentence: “${subject} ___ ${complement}.”`,
      prompt: 'Which be verb completes the sentence correctly?',
      answer: verb,
      distractors: verb === 'is' ? ['am', 'are', 'be'] : ['am', 'is', 'be'],
      steps: ['Find the subject', `Decide whether the subject is singular or plural`, `Choose the matching form of be`, 'Read the whole sentence aloud'],
      explanation: `${subject} takes “${verb},” so the sentence is “${subject} ${verb} ${complement}.”`,
    }
  }

  if (family === 'present-simple') {
    const third = n(0, 1, 1) === 1
    const subject = third ? name : 'They'
    const verb = 'walk'
    const form = third ? 'walks' : 'walk'
    return {
      context: `Every school day, ${subject} ___ to school after breakfast.`,
      prompt: 'Choose the correct simple-present form.',
      answer: form,
      distractors: ['walking', 'walked', third ? 'walk' : 'walks'],
      steps: ['Notice the routine clue “Every school day”', 'Find the subject', 'Apply subject–verb agreement', 'Check that the verb is not marked as past or progressive'],
      explanation: `The simple present describes routines. With ${subject}, the correct form is “${form}.”`,
    }
  }

  if (family === 'questions') {
    const target = seededPick(['time', 'place', 'person', 'reason'], seed + 4)
    const data = {
      time: { answer: 'When', prompt: `${name} wants to ask what time the club meets.` },
      place: { answer: 'Where', prompt: `${name} wants to ask the location of the ${place}.` },
      person: { answer: 'Who', prompt: `${name} wants to ask which person will lead the activity.` },
      reason: { answer: 'Why', prompt: `${name} wants to ask the reason the meeting was moved.` },
    }[target]
    return {
      context: data.prompt,
      prompt: 'Which question word should begin the question?',
      answer: data.answer,
      distractors: ['What', 'How many', 'Which'],
      steps: ['Identify what information is missing', 'Match the information type to a question word', 'Build the question order', 'Check that the expected answer fits the question word'],
      explanation: `The missing information is ${target}, so “${data.answer}” is the appropriate question word.`,
    }
  }

  if (family === 'modal-imperative') {
    if (/命令|指令/.test(context.unit.title)) {
      return {
        context: `A teacher wants students to keep the door closed during an experiment.`,
        prompt: 'Which instruction is clear and natural?',
        answer: 'Please keep the door closed.',
        distractors: ['You keeping the door closed?', 'The door can closed yesterday.', 'Closed is the door pleaseing.'],
        steps: ['Identify the action', 'Use the base verb for an imperative', 'Add “please” for a polite classroom instruction', 'Keep the sentence direct and clear'],
        explanation: 'Imperatives use the base verb. “Please keep the door closed” gives a clear, polite instruction.',
      }
    }
    return {
      context: `${name} has a fever and asks what action is advisable.`,
      prompt: 'Which sentence gives appropriate advice?',
      answer: 'You should rest and drink water.',
      distractors: ['You should to rested.', 'You can resting yesterday.', 'You musts water.'],
      steps: ['Identify the meaning: advice', 'Choose the modal “should”', 'Use the base verb after a modal', 'Check the sentence fits the situation'],
      explanation: 'Modals such as “should” are followed by the base form of the verb: should rest, should drink.',
    }
  }

  if (family === 'progressive') {
    const past = /過去進行/.test(context.unit.title)
    const time = past ? 'at 8:00 last night' : 'right now'
    const subject = name
    const be = past ? 'was' : 'is'
    const answer = `${be} reading`
    return {
      context: `${time}, ${subject} ___ a book in the living room.`,
      prompt: `Which verb phrase shows an action in progress ${past ? 'at that past time' : 'now'}?`,
      answer,
      distractors: ['reads', 'read', `${be} read`],
      steps: [`Notice the time clue “${time}”`, `Choose the correct form of be`, 'Use verb-ing', 'Check the time reference'],
      explanation: `${past ? 'Past' : 'Present'} progressive uses ${be} + verb-ing, so “${answer}” is correct.`,
    }
  }

  if (family === 'past') {
    const items = [
      { base: 'visit', past: 'visited', place: 'museum' },
      { base: 'play', past: 'played', place: 'park' },
      { base: 'go', past: 'went', place: 'library' },
      { base: 'see', past: 'saw', place: 'concert' },
    ]
    const item = items[n(0, items.length - 1, 4)]
    return {
      context: `Yesterday, ${name} ___ to the ${item.place}.`,
      prompt: 'Which form correctly places the event in the past?',
      answer: item.past,
      distractors: [item.base, `${item.base}ing`, item.base === 'go' ? 'goed' : `${item.base}s`],
      steps: ['Notice “Yesterday”', 'Choose the past form', 'Check whether the verb is regular or irregular', 'Read the complete sentence'],
      explanation: `“Yesterday” sets the event in the past, so the correct form is “${item.past}.”`,
    }
  }

  if (family === 'gerund-infinitive') {
    const items = [
      { stem: 'enjoy', answer: 'reading', wrong: ['to reading', 'readed', 'reads'], note: 'enjoy is followed by a gerund' },
      { stem: 'want', answer: 'to read', wrong: ['reading to', 'readed', 'to reading'], note: 'want is commonly followed by to + base verb' },
      { stem: 'finish', answer: 'doing', wrong: ['to doing', 'did to', 'does'], note: 'finish is followed by a gerund' },
    ]
    const item = items[n(0, items.length - 1, 4)]
    return {
      context: `${name} ${item.stem}s ___ homework before dinner.`,
      prompt: 'Choose the form that fits the verb pattern.',
      answer: item.answer,
      distractors: item.wrong,
      steps: ['Find the first verb', 'Recall the verb pattern', 'Choose gerund or infinitive', 'Check meaning and grammar together'],
      explanation: `Here, ${item.note}; therefore “${item.answer}” is the correct complement.`,
    }
  }

  if (family === 'comparison') {
    const a = n(120, 170, 1); const b = a + n(5, 25, 2)
    return {
      context: `Bike A weighs ${a} kg in a cargo test; Bike B weighs ${b} kg.`,
      prompt: 'Which sentence correctly compares the two weights?',
      answer: 'Bike B is heavier than Bike A.',
      distractors: ['Bike B is more heavy that Bike A.', 'Bike A is heaviest than Bike B.', 'Bike B heavier Bike A.'],
      steps: ['Compare the actual values', 'Choose the comparative form “heavier”', 'Use “than” to connect the two items', 'Check that the sentence matches the data'],
      explanation: `${b} is greater than ${a}; “heavy” changes to “heavier,” followed by “than.”`,
    }
  }

  if (family === 'future') {
    const day = seededPick(['tomorrow', 'next Saturday', 'this weekend'], seed + 4)
    return {
      context: `${name} has already made a plan to ${activity} ${day}.`,
      prompt: 'Which sentence clearly expresses the future plan?',
      answer: `${name} is going to ${activity} ${day}.`,
      distractors: [`${name} went to ${activity} ${day}.`, `${name} going ${activity} yesterday.`, `${name} has ${activity} every day.`],
      steps: ['Notice the future time expression', 'Identify that this is a plan', 'Use “be going to + base verb”', 'Check agreement with the subject'],
      explanation: '“Be going to + base verb” is a natural way to express an already formed plan.',
    }
  }

  if (family === 'complex-sentences') {
    const connectors = [
      { a: 'It was raining.', b: `${name} still walked to the ${place}.`, answer: 'Although it was raining, '+`${name} still walked to the ${place}.`, meaning: 'contrast' },
      { a: `${name} studied the map.`, b: `${name} could find the museum easily.`, answer: `${name} studied the map so that the museum was easier to find.`, meaning: 'purpose/result relationship' },
      { a: `${name} finished dinner.`, b: `${name} started homework.`, answer: `After ${name} finished dinner, ${name} started homework.`, meaning: 'time sequence' },
    ]
    const item = connectors[n(0, connectors.length - 1, 4)]
    return {
      context: `Sentence A: ${item.a} Sentence B: ${item.b}`,
      prompt: `Which combined sentence best expresses the intended ${item.meaning}?`,
      answer: item.answer,
      distractors: [`Because ${item.a} ${item.b}`, `${item.a} And because. ${item.b}`, `${item.b} unless ${item.a}`],
      steps: ['Identify the logical relationship', 'Choose a connector that expresses that relationship', 'Place the clauses in grammatical order', 'Read the combined meaning again'],
      explanation: `The clauses need a connector that expresses ${item.meaning}; the correct sentence preserves both grammar and logic.`,
    }
  }

  if (family === 'perfect') {
    const years = n(2, 7, 1)
    return {
      context: `${name} started learning the guitar ${years} years ago and still learns it now.`,
      prompt: 'Which sentence best connects the past starting point with the present?',
      answer: `${name} has learned the guitar for ${years} years.`,
      distractors: [`${name} learned the guitar for ${years} years yesterday.`, `${name} has learning the guitar for ${years} years.`, `${name} is learn the guitar since ${years} years.`],
      steps: ['Identify a past starting point with present relevance', 'Use has/have + past participle', 'Use “for” with a duration', 'Check that the action still relates to now'],
      explanation: 'The present perfect links a past starting point to the present. “For” introduces a duration.',
    }
  }

  if (family === 'relative-clause') {
    return {
      context: `The student won the science prize. The student is standing by the window.`,
      prompt: 'Which sentence combines the two ideas with a relative clause?',
      answer: 'The student who is standing by the window won the science prize.',
      distractors: ['The student which standing by the window won the science prize.', 'Who the student is standing won the science prize.', 'The student won who by the window science prize.'],
      steps: ['Find the repeated noun “the student”', 'Use “who” for a person', 'Put the relative clause after the noun it modifies', 'Keep the main clause complete'],
      explanation: '“Who is standing by the window” modifies “the student” and keeps the main statement intact.',
    }
  }

  if (family === 'passive') {
    const object = seededPick(['posters', 'tickets', 'books', 'samples'], seed + 4)
    return {
      context: `The student team collected the ${object} yesterday.`,
      prompt: 'Which passive sentence keeps the same event and puts the received action first?',
      answer: `The ${object} were collected by the student team yesterday.`,
      distractors: [`The ${object} collected the student team yesterday.`, `The ${object} were collect by the student team.`, `The student team were collected by the ${object}.`],
      steps: ['Move the original object to subject position', 'Choose be in the correct tense', 'Use the past participle', 'Add the agent with “by” if useful'],
      explanation: 'Past passive uses was/were + past participle. The original object becomes the grammatical subject.',
    }
  }

  if (family === 'condition-inference') {
    const temp = n(28, 35, 1)
    return {
      context: `The school garden needs watering only when the soil is dry. Today the soil sensor shows “dry,” and the temperature is ${temp}°C.`,
      prompt: 'Which conditional sentence correctly connects the condition and action?',
      answer: 'If the soil is dry, we should water the garden.',
      distractors: ['If the soil dry, we watered yesterday.', 'Unless the soil is dry, we must always water it.', 'If should the soil dry, water is garden.'],
      steps: ['Identify the condition', 'Identify the resulting action', 'Build the if-clause and main clause', 'Check that the meaning matches the evidence'],
      explanation: 'The condition is “the soil is dry”; the appropriate action follows in the main clause.',
    }
  }

  if (family === 'reading') {
    const passages = [
      { text: 'Our school opened a repair corner last month. Students can bring broken zippers, loose buttons, and small electronic items. Volunteers first check whether an item can be fixed safely. In four weeks, 63 items were repaired instead of thrown away.', main: 'The repair corner helps students safely repair usable items and reduce waste.', detail: '63 items were repaired in four weeks.' },
      { text: 'Mina keeps a small notebook when she visits new places. She writes one question before each visit and records three details that might answer it. Later, she compares her notes with a map or museum guide instead of relying only on memory.', main: 'Mina uses questions and notes to collect and verify information during visits.', detail: 'She records three details related to her question.' },
      { text: 'The community library moved its children’s reading hour from 4:00 to 5:00 p.m. After the change, average attendance rose from 18 to 31 children. Staff members say they still need more weeks of data before deciding whether the new time is better in every season.', main: 'Attendance increased after the time change, but more data are needed before a broad conclusion.', detail: 'Average attendance rose from 18 to 31 children.' },
    ]
    const p = passages[n(0, passages.length - 1, 4)]
    return {
      context: p.text,
      prompt: index % 2 === 0 ? 'What is the best main idea?' : 'Which detail is stated directly in the passage?',
      answer: index % 2 === 0 ? p.main : p.detail,
      distractors: index % 2 === 0 ? ['Every broken item can always be repaired.', 'The passage is mainly about a sports competition.', 'Only the first sentence matters when finding the main idea.'] : ['A conclusion that is not stated in the passage', 'A guess based only on the title', 'A detail from a different topic'],
      steps: ['Read the whole passage', 'Separate main idea from supporting detail', 'Return to the sentence that supports the answer', 'Reject options that add information not in the text'],
      explanation: index % 2 === 0 ? `The passage consistently develops this idea: ${p.main}` : `This detail appears directly in the passage: ${p.detail}`,
    }
  }

  if (family === 'listening-speaking') {
    const note = `Attention, students. The robotics club will meet in Room 204 at 4:10 p.m. on Thursday instead of Wednesday. Please bring your project notebook.`
    return {
      context: `Listening script: “${note}”`,
      prompt: index % 2 === 0 ? 'Which note captures the changed meeting information?' : 'What should a student bring?',
      answer: index % 2 === 0 ? 'Thursday, 4:10 p.m., Room 204' : 'a project notebook',
      distractors: index % 2 === 0 ? ['Wednesday, 4:10 p.m., Room 204', 'Thursday, 2:04 p.m., library', 'Only “robotics club” with no time or place'] : ['a basketball', 'a lunch box', 'nothing'],
      steps: ['Listen for purpose', 'Write only key time/place/action words', 'Notice corrections such as “instead of”', 'Check notes against the message'],
      explanation: 'Effective listening notes prioritize changed details and required actions rather than copying every word.',
    }
  }

  if (family === 'writing') {
    const draft = `Our class garden is useful. It is good. We learn things there. It is nice.`
    return {
      context: `Draft: “${draft}”`,
      prompt: 'Which revision most improves unity and supporting detail?',
      answer: 'Our class garden helps us learn by observation. For example, we measure plant growth each Friday and compare leaves under different light conditions.',
      distractors: ['Our class garden is useful useful useful and very very good.', 'Garden. Friday. Leaves. Nice.', 'Our class garden helps us learn. However, I bought new shoes yesterday.'],
      steps: ['Identify the main idea', 'Add one concrete supporting example', 'Remove unrelated details', 'Use clear sentence connections'],
      explanation: 'A strong paragraph develops one central idea with relevant, specific support rather than repetition or unrelated details.',
    }
  }

  const contexts = [
    { text: 'A student writes to an exchange partner for the first time.', answer: 'Use clear, friendly language and briefly explain local context that the reader may not know.' },
    { text: 'A presentation compares two sources about the same environmental issue.', answer: 'Name the sources, distinguish their evidence, and avoid presenting one perspective as the only possible view.' },
    { text: 'A short academic summary reports survey results.', answer: 'State the sample and result clearly, then avoid claims stronger than the data support.' },
  ]
  const item = contexts[n(0, contexts.length - 1, 4)]
  return {
    context: item.text,
    prompt: 'Which language choice best fits this communicative or academic purpose?',
    answer: item.answer,
    distractors: ['Use slang or unexplained abbreviations in every sentence.', 'Ignore audience and source context.', 'Make the conclusion stronger by deleting all limitations.'],
    steps: ['Identify audience and purpose', 'Choose an appropriate register', 'Make references clear', 'Check that claims match evidence and context'],
    explanation: 'Effective English use depends on audience, purpose, evidence, and register—not grammar in isolation.',
  }
}

function exampleFromCase(context: V21UnitContext, family: EnglishFamily, index: number): ReviewedWorkedExample {
  const item = englishCase(context, family, index)
  return {
    title: `${familyLabel(family)} model ${index + 1}`,
    context: item.context,
    prompt: item.prompt,
    steps: item.steps,
    answer: item.answer,
    explanation: item.explanation,
  }
}

function questionFromCase(context: V21UnitContext, family: EnglishFamily, index: number, id: string, level: '理解' | '應用' | '檢核'): ReviewedQuestion {
  const item = englishCase(context, family, index + 11)
  if (index % 5 === 4) {
    return responseQuestion({
      id,
      level,
      context: item.context,
      prompt: `${item.prompt} Write one short reason or language clue that supports your answer.`,
      sampleAnswer: `${item.answer}. The key clue is the meaning/form relationship described here: ${item.explanation}`,
      explanation: item.explanation,
      rubric: ['Answer fits the communicative or grammatical target', 'Uses a relevant language clue or text detail', 'English is understandable and appropriate for the grade level'],
    })
  }
  return choiceQuestion({ id, level, context: item.context, prompt: item.prompt, correct: item.answer, distractors: item.distractors, explanation: item.explanation })
}

function misconceptionPairs(family: EnglishFamily) {
  const pairs: Record<EnglishFamily, Array<{ wrong: string; right: string; why: string }>> = {
    phonics: [
      { wrong: 'One letter always has exactly one sound in every English word.', right: 'Letters and letter groups can represent different sounds depending on the word.', why: 'English spelling–sound relationships are patterned but not one-to-one.' },
      { wrong: 'If I know the first letter, I do not need to blend the rest of the sounds.', right: 'Blend the sound sequence across the whole word.', why: 'The full sequence distinguishes words such as map, mat, and man.' },
    ],
    'vocabulary-greetings': [
      { wrong: 'A dictionary meaning is enough; any word with a similar meaning can fit every situation.', right: 'Word choice must fit collocation, register, and the communicative situation.', why: 'Natural English depends on how words are actually used together.' },
      { wrong: 'Greetings and requests can ignore who the listener is.', right: 'Choose expressions that fit relationship, setting, and politeness.', why: 'Language use changes with audience and purpose.' },
    ],
    'be-basic': [
      { wrong: 'Every subject uses “is.”', right: 'Choose am/is/are according to the subject.', why: 'Be verbs agree with person and number.' },
      { wrong: 'A be-verb sentence needs another main verb in the simple form every time.', right: 'Be itself can link the subject to a noun, adjective, or place phrase.', why: '“She is tired” is already a complete clause.' },
    ],
    'present-simple': [
      { wrong: 'Third-person singular never changes the verb.', right: 'In affirmative simple present, he/she/it usually takes -s/-es.', why: 'Subject–verb agreement is part of the tense form.' },
      { wrong: 'Simple present can only describe actions happening right now.', right: 'It often describes habits, routines, facts, and repeated events.', why: 'Time meaning comes from both tense and context.' },
    ],
    questions: [
      { wrong: 'All questions can begin with “what.”', right: 'Choose question words according to the information being requested.', why: 'Who, where, when, why, how, and what target different information.' },
      { wrong: 'English question word order is always the same as a statement.', right: 'Many questions use auxiliary–subject order or a be verb before the subject.', why: 'Question syntax changes the clause structure.' },
    ],
    'modal-imperative': [
      { wrong: 'A modal is followed by “to + verb” in every case.', right: 'Core modals such as can, should, must are followed by the base verb.', why: '“should rest,” not “should to rest.”' },
      { wrong: 'An imperative must sound rude.', right: 'Imperatives can be softened with please, tone, or context.', why: 'Form and politeness are separate dimensions.' },
    ],
    progressive: [
      { wrong: 'Verb-ing by itself is a complete progressive verb phrase.', right: 'Progressive aspect needs an appropriate form of be + verb-ing.', why: '“is reading” or “was reading” carries tense and aspect together.' },
      { wrong: 'Any sentence with “now” must use progressive even for every verb.', right: 'Some stative meanings are not normally expressed in progressive form.', why: 'Grammar choice depends on verb meaning as well as time clues.' },
    ],
    past: [
      { wrong: 'Add -ed to every verb to make past tense.', right: 'Regular verbs often take -ed, but common irregular verbs have other forms.', why: 'go→went and see→saw are not formed with -ed.' },
      { wrong: 'A past time expression and present-tense verb can be mixed freely.', right: 'Verb tense should normally align with the event time unless the discourse has a special reason.', why: 'Time reference is part of sentence meaning.' },
    ],
    'gerund-infinitive': [
      { wrong: 'Gerunds and infinitives are always interchangeable after any verb.', right: 'Different verbs license different complement patterns, sometimes with meaning changes.', why: 'enjoy reading and want to read use different patterns.' },
      { wrong: 'After “to” the verb always takes -ing.', right: 'Infinitival to is followed by the base verb.', why: '“to read,” not “to reading,” in an infinitive.' },
    ],
    comparison: [
      { wrong: 'Add “more” before every adjective.', right: 'Short adjectives often take -er/-est; longer forms often use more/most, with irregular exceptions.', why: 'Comparison morphology depends on the adjective.' },
      { wrong: 'Comparative sentences do not need to identify what is being compared.', right: 'The comparison relation should be clear, often using “than.”', why: 'Without a comparison target, the meaning may be incomplete or ambiguous.' },
    ],
    future: [
      { wrong: 'There is only one English future form.', right: 'Will, be going to, present progressive, and other forms can express different future meanings.', why: 'Choice depends on prediction, plan, arrangement, willingness, and context.' },
      { wrong: 'A future time phrase can be combined with any tense without considering meaning.', right: 'The verb form must fit the intended future relationship.', why: 'Time expressions and grammar work together.' },
    ],
    'complex-sentences': [
      { wrong: 'Connectors are interchangeable because they all join clauses.', right: 'Each connector expresses a specific logical relation such as cause, contrast, time, or condition.', why: 'Changing the connector can change the argument or event relation.' },
      { wrong: 'Longer sentences are automatically more advanced and better.', right: 'A complex sentence should make relationships clearer, not merely add length.', why: 'Accuracy and coherence matter more than length.' },
    ],
    reading: [
      { wrong: 'The first sentence is always the main idea.', right: 'The main idea may be stated directly or inferred from several sentences.', why: 'Readers need to integrate supporting details across the passage.' },
      { wrong: 'If an option sounds reasonable in real life, it is supported by the passage.', right: 'Reading answers must be supported by the text unless the question explicitly asks for outside knowledge.', why: 'Plausibility is not the same as textual evidence.' },
    ],
    perfect: [
      { wrong: 'Present perfect is just another name for simple past.', right: 'Present perfect connects a prior event/state with the present in a way simple past may not.', why: 'Time perspective and current relevance differ.' },
      { wrong: 'Use present perfect with a finished past time such as “yesterday” in every case.', right: 'Finished past-time expressions normally call for simple past when referring to a completed event.', why: 'Present perfect avoids locating the event in a closed past time in standard usage.' },
    ],
    'relative-clause': [
      { wrong: 'A relative clause can be placed anywhere in the sentence.', right: 'It should be placed so its noun reference is clear.', why: 'Distance or ambiguous placement can make the modifier attach to the wrong noun.' },
      { wrong: 'Who, which, and that have no reference differences.', right: 'Relative markers are chosen partly by antecedent type and clause function.', why: 'For example, “who” commonly refers to people.' },
    ],
    passive: [
      { wrong: 'Passive voice means simply reversing word order.', right: 'Passive requires be + past participle and changes information focus.', why: 'The grammatical structure, not just order, creates the passive.' },
      { wrong: 'Every passive sentence must include “by + agent.”', right: 'The agent may be omitted when unknown, obvious, or unimportant.', why: 'Passive often highlights the affected entity or process.' },
    ],
    'condition-inference': [
      { wrong: 'If always describes a fact that is guaranteed to happen.', right: 'Conditionals can express real, possible, hypothetical, or counterfactual relationships.', why: 'Meaning depends on verb forms and context.' },
      { wrong: 'An inference can ignore the evidence as long as it sounds logical.', right: 'An inference should connect explicitly to available clues and acknowledge uncertainty.', why: 'Reasoning goes beyond the text only within the evidence limits.' },
    ],
    'listening-speaking': [
      { wrong: 'Good listening notes copy every word.', right: 'Useful notes prioritize purpose, key details, changes, numbers, names, and actions.', why: 'Trying to transcribe everything can cause the listener to miss later information.' },
      { wrong: 'Speaking fluently means speaking as fast as possible.', right: 'Fluency includes understandable pacing, meaningful chunks, and repair when needed.', why: 'Speed without clarity does not support communication.' },
    ],
    writing: [
      { wrong: 'A paragraph is improved mainly by using longer words.', right: 'A strong paragraph has a clear focus, relevant support, coherence, and appropriate language.', why: 'Vocabulary difficulty cannot replace organization and evidence.' },
      { wrong: 'Revision only means fixing spelling.', right: 'Revision also changes ideas, support, order, connections, and register.', why: 'Editing mechanics is only one part of writing development.' },
    ],
    'culture-academic': [
      { wrong: 'There is one “native” way to communicate appropriately in every English-speaking context.', right: 'English use varies across communities, purposes, identities, and registers.', why: 'Cross-cultural competence includes noticing variation rather than treating one pattern as universal.' },
      { wrong: 'Academic language should remove all uncertainty and limitations.', right: 'Careful academic language often states evidence strength and limitations explicitly.', why: 'Responsible claims should not be stronger than the evidence.' },
    ],
  }
  return pairs[family]
}

export function buildEnglishV21(context: V21UnitContext, base: TextbookUnitContentV14): V21SubjectBuild {
  const family = englishFamily(context)
  const label = familyLabel(family)
  const concepts = cleanConcepts(base, 'In English, ')
  const misconceptions = buildMisconceptions({ familyLabel: label, pairs: misconceptionPairs(family) })
  const workedExamples = Array.from({ length: 4 }, (_, index) => exampleFromCase(context, family, index))
  const questions = [
    ...quickCheckSet({
      unitId: context.unit.id,
      familyId: family,
      concepts,
      maker: (_concept, index, id) => questionFromCase(context, family, index, id, '理解'),
    }),
    ...formalQuestionSet({
      unitId: context.unit.id,
      familyId: family,
      makers: [
        (index, id, level) => questionFromCase(context, family, index, id, level),
        (index, id, level) => questionFromCase(context, family, index + 17, id, level),
        (index, id, level) => questionFromCase(context, family, index + 31, id, level),
      ],
    }),
  ]
  const visuals = visualSet({
    unitId: context.unit.id,
    familyLabel: label,
    concepts,
    process: [
      { label: 'Meaning', detail: 'First identify what the speaker or writer is trying to mean or do.' },
      { label: 'Form', detail: `Use the grammar, sound, vocabulary, or text structure required by ${label}.` },
      { label: 'Clue', detail: 'Check subject, time expression, reference, connector, context, or textual evidence.' },
      { label: 'Use', detail: 'Read or say the complete message and verify that it is natural in the situation.' },
    ],
    compare: misconceptions.map((item, index) => ({ label: `Common mix-up ${index + 1}`, detail: `${item.claim} → ${item.correction}` })),
  })
  return {
    familyId: family,
    familyLabel: label,
    overview: unitOverview(context, label, `real sentences, short texts, listening scripts, and communicative choices for ${label}`),
    objectives: unitObjectives(context, label, ['choose language forms that match meaning and context', 'use sentence or text clues to justify an answer', 'produce a short understandable response using the target language']),
    concepts,
    misconceptions,
    visuals,
    workedExamples,
    questions,
    takeaway: [
      `This unit focuses on ${label}; each item must actually use that language target.`,
      'Grammar, vocabulary, reading, listening, and writing decisions are checked in context, not as isolated labels.',
      'Use time clues, subject/reference, word order, text evidence, and communicative purpose as evidence.',
      'A correct answer should sound natural and express the intended meaning, not merely match a memorized pattern.',
    ],
  }
}

export function getEnglishFamilyV21(context: V21UnitContext) {
  return englishFamily(context)
}
