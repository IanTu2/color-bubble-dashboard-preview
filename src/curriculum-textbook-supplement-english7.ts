import type { ReviewedConcept, ReviewedQuestion, ReviewedWorkedExample } from './curriculum-reviewed-social10'

export type English7TextbookSupplement = {
  unitId: string
  scopeCodes: string[]
  misconceptionConcepts: ReviewedConcept[]
  workedExamples: ReviewedWorkedExample[]
  questions: ReviewedQuestion[]
}

const supplement = (
  unitId: string,
  scopeCodes: string[],
  misconceptionConcepts: ReviewedConcept[],
  workedExamples: ReviewedWorkedExample[],
  questions: ReviewedQuestion[],
): English7TextbookSupplement => ({ unitId, scopeCodes, misconceptionConcepts, workedExamples, questions })

const SUPPLEMENTS: English7TextbookSupplement[] = [
  supplement('g7-english-s1-u1', ['1-Ⅳ-1～4', '2-Ⅳ-2～8', '3-Ⅳ-5～8', '5-Ⅳ-1～3'], [
    { title: 'Common mistake｜be is not a filler before every verb', explanation: 'Use am/is/are for identity, state, location or description. Ordinary action verbs do not automatically need be.', example: 'She is tired. / She plays tennis. NOT: She is plays tennis.' },
    { title: 'Common mistake｜a/an follows sound', explanation: 'Choose a/an from the first sound of the next word, not only the first letter.', example: 'an hour; a uniform.' },
  ], [{
    title: 'Turn a student card into real questions',
    context: 'Student card: Hana Wu / Class 705 / Art Club / excited today / Homeroom 302.',
    prompt: 'State known information and ask for missing information naturally.',
    steps: ['Identity: She is Hana.', 'Class: She is in Class 705.', 'State: She is excited today.', 'Location question: Where is her homeroom?', 'Do not write “She is joins the Art Club.”'],
    answer: 'Use be for identity/state/location and form questions from the actual missing information.',
    explanation: 'The grammar is serving first-day communication.',
  }], [
    { id: 'g7-english-s1-u1-supp-q1', kind: 'choice', level: '理解', prompt: 'Choose the correct sentence.', options: ['My teacher is kind.', 'My teacher is teaches English.', 'They is ready.', 'I are hungry.'], correctIndex: 0, explanation: 'Kind is a description linked to the subject by is.' },
    { id: 'g7-english-s1-u1-supp-q2', kind: 'choice', level: '應用', context: 'A: ___ your new classmates? B: Mia and Owen.', prompt: 'Which form fits?', options: ['Who are', 'Where is', 'When is', 'How old is'], correctIndex: 0, explanation: 'The answer names people, so Who is the needed information type.' },
    { id: 'g7-english-s1-u1-supp-q3', kind: 'choice', level: '應用', prompt: 'Which phrase is correct?', options: ['an hour', 'a hour', 'an uniform', 'an university'], correctIndex: 0, explanation: 'Hour starts with a vowel sound; uniform/university start with /j/.' },
    { id: 'g7-english-s1-u1-supp-q4', kind: 'response', level: '檢核', context: 'Profile: Leo / Class 703 / from Tainan / nervous today.', prompt: 'Write two statements and one natural question using be.', sampleAnswer: 'You are Leo. You are in Class 703. Are you nervous about the first day?', explanation: 'The response should communicate information, not only recite a pattern.' },
  ]),

  supplement('g7-english-s1-u2', ['1-Ⅳ-3～4', '2-Ⅳ-5～7', '3-Ⅳ-4～8', '5-Ⅳ-2', '5-Ⅳ-11'], [
    { title: 'Common mistake｜does already marks third person', explanation: 'After does/doesn’t, use the base verb; do not mark -s twice.', example: 'Does he play? NOT: Does he plays?' },
    { title: 'Common mistake｜usually and three times a week are not identical', explanation: 'Frequency adverbs are approximate; expressions such as twice a week state frequency more explicitly.' },
  ], [{
    title: 'Read a weekly schedule and compare routines',
    context: 'Mina: swim Mon/Wed/Fri; study at the library Tue/Thu. Kai: take the bus home Mon–Fri; play soccer Sat.',
    prompt: 'Turn the table into statements and a How often question.',
    steps: ['Mina swims three times a week.', 'She studies at the library twice a week.', 'Kai takes the bus home on weekdays.', 'How often does Mina swim? Three times a week.', 'After does, use swim, not swims.'],
    answer: 'A schedule can be converted into routine statements and information-gap questions.',
    explanation: 'This combines table reading with present-simple communication.',
  }], [
    { id: 'g7-english-s1-u2-supp-q1', kind: 'choice', level: '理解', prompt: 'Which question is correct?', options: ['How often does Ken practice?', 'How often does Ken practices?', 'How often Ken does practice?', 'How often is Ken practice?'], correctIndex: 0, explanation: 'Use does + subject + base verb.' },
    { id: 'g7-english-s1-u2-supp-q2', kind: 'choice', level: '應用', context: 'Ella reads before bed on Mon/Wed/Fri/Sun.', prompt: 'Which sentence matches?', options: ['Ella reads before bed four times a week.', 'Ella never reads before bed.', 'Ella is reading every day right now.', 'Ella read only yesterday.'], correctIndex: 0, explanation: 'The data describe a repeated weekly routine.' },
    { id: 'g7-english-s1-u2-supp-q3', kind: 'choice', level: '應用', prompt: 'Choose the natural sentence.', options: ['My brother usually walks to school.', 'My brother walks usually to school.', 'My brother usually walk to school.', 'My brother does usually walks to school.'], correctIndex: 0, explanation: 'Usually commonly goes before an ordinary main verb; brother requires walks.' },
    { id: 'g7-english-s1-u2-supp-q4', kind: 'response', level: '檢核', context: 'Mom: exercise Tue/Thu/Sat; cook dinner Mon–Fri.', prompt: 'Write one routine statement and one How often question-answer pair.', sampleAnswer: 'My mom exercises three times a week. How often does she cook dinner? She cooks dinner five days a week.', explanation: 'The language must accurately reflect the schedule.' },
  ]),

  supplement('g7-english-s1-u3', ['2-Ⅳ-6～7', '3-Ⅳ-7～12', '5-Ⅳ-6～7', '5-Ⅳ-10～12'], [
    { title: 'Common mistake｜choose the Wh-word from the missing information', explanation: 'Person, place, time, reason and method need different question words; do not choose by memorized order.' },
    { title: 'Common mistake｜be questions and do/does questions use different helpers', explanation: 'Move be before the subject, but use do/does with ordinary present-simple verbs.', example: 'Where is Mia? / Where does Mia study?' },
  ], [{
    title: 'Read a club notice and ask useful questions',
    context: 'ROBOT CLUB OPEN DAY\nDate: Sep 18\nTime: 3:30–5:00 p.m.\nPlace: Lab 2\nBring: a pencil case\nContact: Ms. Chen',
    prompt: 'Turn the notice into information-gap questions.',
    steps: ['When is the open day?', 'Where is it?', 'Who can I contact?', 'What should I bring?', 'Choose the helper from the verb structure, not from a memorized template.'],
    answer: 'Wh-questions recover specific missing information from the notice.',
    explanation: 'Question form and information type must match.',
  }], [
    { id: 'g7-english-s1-u3-supp-q1', kind: 'choice', level: '理解', context: 'A: ___ do you eat lunch? B: At 12:10.', prompt: 'Choose the best word.', options: ['When', 'Who', 'Where', 'Why'], correctIndex: 0, explanation: 'At 12:10 is a time.' },
    { id: 'g7-english-s1-u3-supp-q2', kind: 'choice', level: '應用', context: 'Answer: Because I have a science test tomorrow.', prompt: 'Which question fits best?', options: ['Why are you studying tonight?', 'Where are you studying tonight?', 'Who is your teacher?', 'What time is tomorrow?'], correctIndex: 0, explanation: 'Because introduces a reason.' },
    { id: 'g7-english-s1-u3-supp-q3', kind: 'choice', level: '應用', prompt: 'Which question is correct?', options: ['Where does Leo practice basketball?', 'Where does Leo practices basketball?', 'Where is Leo practice basketball?', 'Where Leo does practice basketball?'], correctIndex: 0, explanation: 'Use does + subject + base verb with practice.' },
    { id: 'g7-english-s1-u3-supp-q4', kind: 'response', level: '檢核', context: 'Movie Night: Friday / 6:30 p.m. / School Hall / free entry.', prompt: 'Write three different Wh-questions answered by the notice.', sampleAnswer: 'When is Movie Night? What time does it start? Where is it?', explanation: 'Questions should target different information.' },
  ]),

  supplement('g7-english-s2-u1', ['1-Ⅳ-2～4', '2-Ⅳ-2～5', '3-Ⅳ-3～6', '5-Ⅳ-3'], [
    { title: 'Common mistake｜can’t and mustn’t differ', explanation: 'Can’t may mean inability or lack of permission; mustn’t expresses prohibition. Context decides the intended function.' },
    { title: 'Common mistake｜a grammatically correct rule can still be contextually wrong', explanation: 'A safety rule or sign must solve the actual problem in the place.' },
  ], [{
    title: 'Rewrite museum information as signs',
    context: 'Photos allowed in lobby; photos prohibited in special exhibition; wheelchairs available at entrance; food prohibited in galleries.',
    prompt: 'Write short signs without changing the meaning.',
    steps: ['You can take photos in the lobby.', 'Don’t take photos in the special exhibition.', 'You can use a wheelchair from the entrance.', 'No food in the galleries.'],
    answer: 'Choose permission, prohibition and imperative language according to the actual rule.',
    explanation: 'Function comes before grammar labels.',
  }], [
    { id: 'g7-english-s2-u1-supp-q1', kind: 'choice', level: '理解', prompt: '“You mustn’t touch the artwork.” means:', options: ['Touching the artwork is prohibited.', 'You are physically unable to touch it.', 'You touched it yesterday.', 'Touching it is required.'], correctIndex: 0, explanation: 'Mustn’t expresses prohibition.' },
    { id: 'g7-english-s2-u1-supp-q2', kind: 'choice', level: '應用', context: 'A lab sign should prevent eye injury.', prompt: 'Which rule fits best?', options: ['Wear safety glasses.', 'Sing loudly.', 'Bring snacks.', 'Open every bottle.'], correctIndex: 0, explanation: 'The rule must match the safety goal.' },
    { id: 'g7-english-s2-u1-supp-q3', kind: 'choice', level: '應用', context: 'A: I can’t lift this box alone.', prompt: 'What does can’t most likely mean?', options: ['lack of ability', 'prohibition', 'past time', 'future plan'], correctIndex: 0, explanation: 'The physical-task context indicates inability.' },
    { id: 'g7-english-s2-u1-supp-q4', kind: 'response', level: '檢核', context: 'Computer room: no drinks; printing homework allowed; keep voices low.', prompt: 'Write three natural rules/permissions.', sampleAnswer: 'Don’t bring drinks into the computer room. You can print your homework here. Keep your voice low.', explanation: 'The three different functions should all be clear.' },
  ]),

  supplement('g7-english-s2-u2', ['1-Ⅳ-3～4', '2-Ⅳ-6', '2-Ⅳ-10', '3-Ⅳ-4～8', '5-Ⅳ-1～4'], [
    { title: 'Common mistake｜now is a clue, not a magic tense switch', explanation: 'Use the progressive for ongoing/temporary actions after understanding the meaning, not merely because the sentence contains now.' },
    { title: 'Common mistake｜be is required in the progressive', explanation: 'Standard present progressive needs am/is/are + V-ing.', example: 'He is studying. NOT: He studying.' },
  ], [{
    title: 'Separate routine from a live update',
    context: '3:10 p.m.: Students are setting up tables. Ms. Lin is checking microphones. The music club practices every Tuesday, but today they are helping on stage.',
    prompt: 'Which language describes now and which describes routine?',
    steps: ['are setting up / is checking / are helping = current actions.', 'practices every Tuesday = routine.', 'The same subject may have a routine and a different temporary action.', 'Choose tense from time viewpoint.'],
    answer: 'Use present progressive for the live actions and present simple for the regular Tuesday practice.',
    explanation: 'Tense is a meaning choice, not only verb spelling.',
  }], [
    { id: 'g7-english-s2-u2-supp-q1', kind: 'choice', level: '理解', prompt: 'Which sentence describes an action happening now?', options: ['Mia is waiting for the bus now.', 'Mia takes the bus every day.', 'Mia took the bus yesterday.', 'Mia usually walks.'], correctIndex: 0, explanation: 'The action is ongoing at this moment.' },
    { id: 'g7-english-s2-u2-supp-q2', kind: 'choice', level: '應用', context: 'Every Monday, Ben ___ chess. Today he ___ basketball.', prompt: 'Choose the best pair.', options: ['plays / is playing', 'is playing / plays', 'play / playing', 'played / plays'], correctIndex: 0, explanation: 'Routine uses present simple; temporary current action uses progressive.' },
    { id: 'g7-english-s2-u2-supp-q3', kind: 'choice', level: '應用', prompt: 'Which sentence is complete?', options: ['The students are preparing the room.', 'The students preparing the room.', 'The students are prepare the room.', 'The students is preparing the room.'], correctIndex: 0, explanation: 'Plural subject takes are + preparing.' },
    { id: 'g7-english-s2-u2-supp-q4', kind: 'response', level: '檢核', context: 'Routine: Leo practices guitar after dinner. Now: he is studying for a test.', prompt: 'Write two sentences that clearly contrast the routine and now.', sampleAnswer: 'Leo practices guitar after dinner, but he is studying for a test right now.', explanation: 'The two tenses must match the two time viewpoints.' },
  ]),

  supplement('g7-english-s2-u3', ['1-Ⅳ-4～8', '2-Ⅳ-6～9', '3-Ⅳ-8～12', '5-Ⅳ-6～10'], [
    { title: 'Common mistake｜did already carries past time', explanation: 'Questions and negatives with did normally return the main verb to base form.', example: 'Did you go? / I didn’t go. NOT: Did you went?' },
    { title: 'Common mistake｜past verbs alone do not make a clear story', explanation: 'Readers also need time order and relationships among events.' },
  ], [{
    title: 'Reconstruct events from a short message',
    context: 'Noah: “Sorry I missed practice yesterday. My bike got a flat tire after school. I called my dad, waited near the library, and got home at 6:20. I didn’t see your message until dinner.”',
    prompt: 'Put the events in order and identify a safe inference.',
    steps: ['Past frame: yesterday / after school.', 'Order: flat tire → called dad → waited → got home → saw message.', 'didn’t see = did + not + base verb.', 'We may infer the bike problem explains the absence, but not that Noah skipped on purpose.'],
    answer: 'The message combines past forms with chronology and evidence-based inference.',
    explanation: 'Past-tense reading is more than identifying -ed forms.',
  }], [
    { id: 'g7-english-s2-u3-supp-q1', kind: 'choice', level: '理解', prompt: 'Which question is correct?', options: ['Did Mia finish the book?', 'Did Mia finished the book?', 'Does Mia finished the book?', 'Mia did finished the book?'], correctIndex: 0, explanation: 'After Did, use base verb finish.' },
    { id: 'g7-english-s2-u3-supp-q2', kind: 'choice', level: '應用', context: 'Leo first missed the bus, then called his mom, and ___ walked home.', prompt: 'Choose the best sequence word.', options: ['finally', 'usually', 'right now', 'every day'], correctIndex: 0, explanation: 'Finally introduces the last event in the sequence.' },
    { id: 'g7-english-s2-u3-supp-q3', kind: 'choice', level: '應用', context: 'A: Why were you late? B: ___', prompt: 'Choose the natural answer.', options: ['Because I missed the bus and walked to school.', 'Because I miss the bus tomorrow.', 'I am late every yesterday.', 'Did the bus late.'], correctIndex: 0, explanation: 'The answer explains a completed past reason.' },
    { id: 'g7-english-s2-u3-supp-q4', kind: 'response', level: '檢核', context: 'Notes: Sat morning—visit grandmother; then—help cook lunch; afternoon—go home by train.', prompt: 'Write a coherent three-sentence past narrative.', sampleAnswer: 'Last Saturday morning, I visited my grandmother. Then I helped her cook lunch. In the afternoon, I went home by train.', explanation: 'Keep a past time frame and clear event order.' },
  ]),
]

export function getEnglish7TextbookSupplement(unitId: string) {
  return SUPPLEMENTS.find((item) => item.unitId === unitId) ?? null
}

export function english7TextbookSupplementUnitIds() {
  return SUPPLEMENTS.map((item) => item.unitId)
}
