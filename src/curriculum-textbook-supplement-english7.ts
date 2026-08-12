import type { ReviewedConcept, ReviewedQuestion, ReviewedWorkedExample } from './curriculum-reviewed-social10'

export type English7TextbookSupplement = {
  unitId: string
  scopeCodes: string[]
  misconceptionConcepts: ReviewedConcept[]
  workedExamples: ReviewedWorkedExample[]
  questions: ReviewedQuestion[]
}

const SUPPLEMENTS: English7TextbookSupplement[] = [
  {
    unitId: 'g7-english-s1-u1',
    scopeCodes: ['1-Ⅳ-1～4', '2-Ⅳ-2～8', '3-Ⅳ-5～8', '5-Ⅳ-1～3'],
    misconceptionConcepts: [
      { title: 'Common mistake｜be is not a “filler verb”', explanation: 'Use am/is/are when the sentence connects a subject to identity, state, location, or description. Do not add be before every ordinary verb.', example: 'She is tired. / She plays tennis. NOT: She is plays tennis.' },
      { title: 'Common mistake｜a/an follows sound, not just spelling', explanation: 'The choice depends on the first sound of the next word. A word beginning with a vowel letter may start with a consonant sound, and vice versa.', example: 'a uniform (/j/ sound), an hour (silent h).' },
    ],
    workedExamples: [{
      title: 'Read a student profile and ask for missing information',
      context: 'Student card: Name: Hana Wu / Class: 705 / Club: Art Club / Mood today: excited / Homeroom: Room 302.',
      prompt: 'How can a new classmate turn this information into natural statements and questions?',
      steps: ['Use be for identity and class: “She is Hana. She is in Class 705.”', 'Use be for state: “She is excited today.”', 'Use where + be to ask location: “Where is her homeroom?”', 'Do not use be before an ordinary activity verb unless a different tense requires it: “She joins the Art Club,” not “She is joins…”.'],
      answer: 'A profile becomes communication only when the learner can both state known information and ask for missing information.',
      explanation: 'Grammar is serving identity, state, and information-gap communication.',
    }],
    questions: [
      { id: 'g7-english-s1-u1-supp-q1', kind: 'choice', level: '理解', prompt: 'Choose the sentence with correct use of be.', options: ['My teacher is kind.', 'My teacher is teaches English.', 'They is ready.', 'I are hungry.'], correctIndex: 0, explanation: 'Kind describes a state/quality, so “is” links the subject and adjective.' },
      { id: 'g7-english-s1-u1-supp-q2', kind: 'choice', level: '應用', context: 'A: ___ your new classmates?\nB: Mia and Owen.', prompt: 'Which question word fits?', options: ['Who are', 'Where is', 'How old is', 'What time are'], correctIndex: 0, explanation: 'The answer names people, so “Who are your new classmates?” is the natural question.' },
      { id: 'g7-english-s1-u1-supp-q3', kind: 'choice', level: '應用', prompt: 'Which phrase is correct?', options: ['an hour', 'a hour', 'an uniform', 'an university'], correctIndex: 0, explanation: 'Hour begins with a vowel sound because h is silent. Uniform/university begin with a /j/ consonant sound.' },
      { id: 'g7-english-s1-u1-supp-q4', kind: 'response', level: '檢核', context: 'Profile: Leo / Class 703 / from Tainan / nervous today.', prompt: 'Write two statements and one question you could use when meeting Leo. Use be naturally.', sampleAnswer: 'You are Leo. You are in Class 703. Are you nervous about the first day?', explanation: 'A strong response uses be for identity/state and forms a real question, not three disconnected grammar drills.' },
    ],
  },
  {
    unitId: 'g7-english-s1-u2',
    scopeCodes: ['1-Ⅳ-3～4', '2-Ⅳ-5～7', '3-Ⅳ-4～8', '5-Ⅳ-2', '5-Ⅳ-11'],
    misconceptionConcepts: [
      { title: 'Common mistake｜does already carries the grammar marker', explanation: 'After does/doesn’t, use the base verb. Do not mark third-person singular twice.', example: 'Does he play? / He doesn’t play. NOT: Does he plays?' },
      { title: 'Common mistake｜frequency words and exact frequency are different', explanation: 'Usually/often/sometimes give an approximate frequency; twice a week/every day give more explicit frequency information.' },
    ],
    workedExamples: [{
      title: 'Use a weekly schedule to compare two routines',
      context: 'Mina: Mon/Wed/Fri—swim 17:00; Tue/Thu—study at library 16:30.\nKai: Mon–Fri—take the bus home 16:10; Sat—play soccer 09:00.',
      prompt: 'What can we say and ask from this schedule?',
      steps: ['Mina swims three times a week: third-person singular → swims.', 'She studies at the library twice a week: study → studies.', 'Kai takes the bus home on weekdays.', 'Information-gap question: “How often does Mina swim?” → “Three times a week.”', 'After does, use the base form: “does Mina swim,” not “does Mina swims.”'],
      answer: 'A schedule can produce statements, how-often questions, and comparisons of routines.',
      explanation: 'Reading a table and turning data into language matches real communicative use.',
    }],
    questions: [
      { id: 'g7-english-s1-u2-supp-q1', kind: 'choice', level: '理解', prompt: 'Which question is correct?', options: ['How often does Ken practice?', 'How often does Ken practices?', 'How often Ken does practice?', 'How often is Ken practice?'], correctIndex: 0, explanation: 'Use does + subject + base verb.' },
      { id: 'g7-english-s1-u2-supp-q2', kind: 'choice', level: '應用', context: 'Ella reads before bed on Monday, Wednesday, Friday, and Sunday.', prompt: 'Which sentence best matches the data?', options: ['Ella reads before bed four times a week.', 'Ella never reads before bed.', 'Ella is reading every day right now.', 'Ella read before bed yesterday only.'], correctIndex: 0, explanation: 'The schedule gives four regular days each week, so present simple plus “four times a week” fits.' },
      { id: 'g7-english-s1-u2-supp-q3', kind: 'choice', level: '應用', prompt: 'Choose the most natural sentence.', options: ['My brother usually walks to school.', 'My brother walks usually to school.', 'My brother usually walk to school.', 'My brother does usually walks to school.'], correctIndex: 0, explanation: 'With an ordinary main verb, the frequency adverb commonly goes before the verb; brother also requires walks.' },
      { id: 'g7-english-s1-u2-supp-q4', kind: 'response', level: '檢核', context: 'Schedule: Mom—exercise Tue/Thu/Sat; cook dinner Mon–Fri.', prompt: 'Write one statement and one How often question-answer pair from the schedule.', sampleAnswer: 'My mom exercises three times a week. How often does she cook dinner? She cooks dinner five days a week.', explanation: 'The answer must accurately convert table information into present-simple language.' },
    ],
  },
  {
    unitId: 'g7-english-s1-u3',
    scopeCodes: ['2-Ⅳ-6～7', '3-Ⅳ-7～12', '5-Ⅳ-6～7', '5-Ⅳ-10～12'],
    misconceptionConcepts: [
      { title: 'Common mistake｜choose the Wh-word from the missing information', explanation: 'Do not memorize Wh-words as a fixed order. Look at the expected answer: person → who, place → where, time → when/what time, reason → why, method/state → how.' },
      { title: 'Common mistake｜a complete Wh-question still needs the right helper', explanation: 'With be, move be before the subject; with ordinary present-simple verbs, use do/does. Mixing the two systems creates errors.', example: 'Where is Mia? / Where does Mia study? NOT: Where does Mia is?' },
    ],
    workedExamples: [{
      title: 'Read a club notice and ask useful questions',
      context: 'ROBOT CLUB OPEN DAY\nDate: September 18\nTime: 3:30–5:00 p.m.\nPlace: Lab 2\nBring: a pencil case\nContact: Ms. Chen',
      prompt: 'Turn the notice into questions a student may actually ask.',
      steps: ['Date → “When is the open day?”', 'Place → “Where is it?”', 'Person → “Who can I contact?”', 'Object → “What should I bring?”', 'The question form depends on the verb: “Where is it?” uses be; “What should I bring?” uses a modal.'],
      answer: 'Wh-questions are tools for recovering missing information from a real notice.',
      explanation: 'The learner should connect question form to information type and context.',
    }],
    questions: [
      { id: 'g7-english-s1-u3-supp-q1', kind: 'choice', level: '理解', context: 'A: ___ do you eat lunch?\nB: At 12:10.', prompt: 'Choose the best Wh-word.', options: ['When', 'Who', 'Where', 'Why'], correctIndex: 0, explanation: 'The answer is a time, so When fits.' },
      { id: 'g7-english-s1-u3-supp-q2', kind: 'choice', level: '應用', context: 'Answer: “Because I have a science test tomorrow.”', prompt: 'Which question best matches?', options: ['Why are you studying tonight?', 'Where are you studying tonight?', 'Who is your teacher?', 'What time is tomorrow?'], correctIndex: 0, explanation: 'Because introduces a reason, so a Why-question is expected.' },
      { id: 'g7-english-s1-u3-supp-q3', kind: 'choice', level: '應用', prompt: 'Which question is grammatically correct?', options: ['Where does Leo practice basketball?', 'Where does Leo practices basketball?', 'Where is Leo practice basketball?', 'Where Leo does practice basketball?'], correctIndex: 0, explanation: 'Ordinary present-simple verb → does + subject + base verb.' },
      { id: 'g7-english-s1-u3-supp-q4', kind: 'response', level: '檢核', context: 'Movie Night: Friday / 6:30 p.m. / School Hall / free entry.', prompt: 'Write three different Wh-questions that can be answered from the notice.', sampleAnswer: 'When is Movie Night? What time does it start? Where is it?', explanation: 'The questions must ask different information and use natural auxiliary/be structure.' },
    ],
  },
  {
    unitId: 'g7-english-s2-u1',
    scopeCodes: ['1-Ⅳ-2～4', '2-Ⅳ-2～5', '3-Ⅳ-3～6', '5-Ⅳ-3'],
    misconceptionConcepts: [
      { title: 'Common mistake｜can’t and mustn’t do not mean the same thing', explanation: 'Can’t may express inability or lack of permission depending on context; mustn’t expresses prohibition. The situation determines meaning.' },
      { title: 'Common mistake｜a rule must fit the place and purpose', explanation: 'A grammatically correct imperative can still be a bad answer if it does not solve the safety or social need in the situation.' },
    ],
    workedExamples: [{
      title: 'Choose language for a museum notice',
      context: 'Museum situation: Photography is allowed in the lobby but prohibited in the special exhibition. Visitors may use wheelchairs provided at the entrance. Food is not allowed in galleries.',
      prompt: 'Write three short signs without changing the meaning.',
      steps: ['Lobby permission: “You can take photos in the lobby.”', 'Exhibition prohibition: “Don’t take photos in the special exhibition.” / “You mustn’t take photos…”', 'Accessibility option: “You can use a wheelchair from the entrance.”', 'Food rule: “No food in the galleries.” / “Don’t eat in the galleries.”'],
      answer: 'Choose can for permission/availability and imperative/mustn’t for clear prohibitions, matching each location.',
      explanation: 'Meaning and context come before choosing a grammar label.',
    }],
    questions: [
      { id: 'g7-english-s2-u1-supp-q1', kind: 'choice', level: '理解', prompt: '“You mustn’t touch the artwork.” means:', options: ['Touching the artwork is prohibited.', 'You are physically unable to touch it.', 'You touched it yesterday.', 'Touching it is required.'], correctIndex: 0, explanation: 'Mustn’t expresses prohibition.' },
      { id: 'g7-english-s2-u1-supp-q2', kind: 'choice', level: '應用', context: 'A science lab sign should prevent eye injury.', prompt: 'Which rule fits best?', options: ['Wear safety glasses.', 'Sing loudly.', 'Bring extra snacks.', 'Open every bottle.'], correctIndex: 0, explanation: 'The instruction must match the actual safety goal.' },
      { id: 'g7-english-s2-u1-supp-q3', kind: 'choice', level: '應用', context: 'A: I can’t lift this box alone.', prompt: 'What does can’t most likely mean here?', options: ['lack of ability', 'prohibition by a rule', 'past tense', 'future plan'], correctIndex: 0, explanation: 'The physical-task context makes inability the natural interpretation.' },
      { id: 'g7-english-s2-u1-supp-q4', kind: 'response', level: '檢核', context: 'School computer room: no drinks; students may print homework; keep voices low.', prompt: 'Write three natural English rules/permissions for the room.', sampleAnswer: 'Don’t bring drinks into the computer room. You can print your homework here. Keep your voice low.', explanation: 'The response should express the three meanings clearly, not merely include a modal word.' },
    ],
  },
  {
    unitId: 'g7-english-s2-u2',
    scopeCodes: ['1-Ⅳ-3～4', '2-Ⅳ-6', '2-Ⅳ-10', '3-Ⅳ-4～8', '5-Ⅳ-1～4'],
    misconceptionConcepts: [
      { title: 'Common mistake｜now does not automatically make every sentence progressive', explanation: 'The progressive is mainly for ongoing/temporary actions. Some verbs often describe states rather than visible actions, so learners should understand meaning instead of blindly reacting to a time word.' },
      { title: 'Common mistake｜be is part of the tense, not optional', explanation: 'The present progressive needs a form of be plus V-ing. “He studying” is incomplete in standard English.' },
    ],
    workedExamples: [{
      title: 'Read a live school-event update',
      context: '3:10 p.m. live update: Students are setting up tables. Ms. Lin is checking the microphones. Two parents are waiting at the gate. The music club practices every Tuesday, but today they are helping on the stage.',
      prompt: 'Which actions are happening now, and which sentence describes a routine?',
      steps: ['“are setting up / is checking / are waiting / are helping” describe the current event.', '“practices every Tuesday” describes a regular routine, so it uses present simple.', 'The same group can have a routine and a different temporary activity today.', 'Use the time viewpoint, not just the subject, to select tense.'],
      answer: 'The live actions use be + V-ing; the regular Tuesday practice uses present simple.',
      explanation: 'Contrasting two time viewpoints is more useful than memorizing isolated forms.',
    }],
    questions: [
      { id: 'g7-english-s2-u2-supp-q1', kind: 'choice', level: '理解', prompt: 'Which sentence describes an action happening at this moment?', options: ['Mia is waiting for the bus now.', 'Mia takes the bus every day.', 'Mia took the bus yesterday.', 'Mia usually walks.'], correctIndex: 0, explanation: 'Now plus an ongoing action fits the present progressive.' },
      { id: 'g7-english-s2-u2-supp-q2', kind: 'choice', level: '應用', context: 'Every Monday, Ben ___ chess. Today he ___ basketball because the chess club is closed.', prompt: 'Choose the best pair.', options: ['plays / is playing', 'is playing / plays', 'play / playing', 'played / plays'], correctIndex: 0, explanation: 'Every Monday = routine; today’s temporary ongoing situation = present progressive.' },
      { id: 'g7-english-s2-u2-supp-q3', kind: 'choice', level: '應用', prompt: 'Which sentence is complete and correct?', options: ['The students are preparing the room.', 'The students preparing the room.', 'The students are prepare the room.', 'The students is preparing the room.'], correctIndex: 0, explanation: 'Plural subject students takes are, followed by preparing.' },
      { id: 'g7-english-s2-u2-supp-q4', kind: 'response', level: '檢核', context: 'Routine: Leo practices guitar after dinner. Current situation: he has a test and is studying now.', prompt: 'Write two sentences that clearly contrast the routine and the current situation.', sampleAnswer: 'Leo practices guitar after dinner, but he is studying for a test right now.', explanation: 'The contrast should show present simple for routine and present progressive for the temporary action.' },
    ],
  },
  {
    unitId: 'g7-english-s2-u3',
    scopeCodes: ['1-Ⅳ-4～8', '2-Ⅳ-6～9', '3-Ⅳ-8～12', '5-Ⅳ-6～10'],
    misconceptionConcepts: [
      { title: 'Common mistake｜did and a past-form verb should not normally be doubled', explanation: 'Did already marks the clause as past, so the main verb returns to its base form in questions and negatives.', example: 'Did you go? / I didn’t go. NOT: Did you went?' },
      { title: 'Common mistake｜a past narrative needs event order, not only past verbs', explanation: 'A list of past-tense sentences may still be hard to follow. Time expressions and cause/effect links help readers reconstruct what happened.' },
    ],
    workedExamples: [{
      title: 'Read a short message and reconstruct yesterday’s events',
      context: 'Message from Noah: “Sorry I missed practice yesterday. My bike got a flat tire after school. I called my dad, waited near the library, and got home at 6:20. I didn’t see your message until dinner.”',
      prompt: 'What happened, in what order, and what can we infer?',
      steps: ['Time frame: yesterday / after school establishes past events.', 'Event order: bike got a flat tire → called dad → waited → got home → saw message later.', '“didn’t see” uses did + not + base verb.', 'A reasonable inference is that the bike problem explains the missed practice, but the text does not say Noah intentionally skipped it.'],
      answer: 'The message uses past forms plus chronological details to explain a completed chain of events.',
      explanation: 'Reading past tense includes timeline and inference, not just verb recognition.',
    }],
    questions: [
      { id: 'g7-english-s2-u3-supp-q1', kind: 'choice', level: '理解', prompt: 'Which sentence is correct?', options: ['Did Mia finish the book?', 'Did Mia finished the book?', 'Does Mia finished the book?', 'Mia did finished the book?'], correctIndex: 0, explanation: 'After Did, use the base verb finish.' },
      { id: 'g7-english-s2-u3-supp-q2', kind: '應用' as 'choice', level: '應用', context: 'Yesterday, Leo first missed the bus, then called his mom, and finally walked home.', prompt: 'Which connector best introduces the last event?', options: ['Finally', 'Usually', 'Right now', 'Every day'], correctIndex: 0, explanation: 'Finally signals the last event in a completed sequence.' },
      { id: 'g7-english-s2-u3-supp-q3', kind: 'choice', level: '應用', context: 'A: Why were you late?\nB: ___', prompt: 'Which answer is the most complete and natural?', options: ['Because I missed the bus and walked to school.', 'Because I miss the bus tomorrow.', 'I am late every yesterday.', 'Did the bus late.'], correctIndex: 0, explanation: 'The question asks about a past reason; the answer uses completed past events.' },
      { id: 'g7-english-s2-u3-supp-q4', kind: 'response', level: '檢核', context: 'Notes: Saturday morning—visit grandmother; then—help cook lunch; afternoon—go home by train.', prompt: 'Turn the notes into a coherent 3-sentence past narrative with at least one sequence word.', sampleAnswer: 'Last Saturday morning, I visited my grandmother. Then I helped her cook lunch. In the afternoon, I went home by train.', explanation: 'A good response preserves the past time frame and makes event order easy to follow.' },
    ],
  },
]

export function getEnglish7TextbookSupplement(unitId: string) {
  return SUPPLEMENTS.find((item) => item.unitId === unitId) ?? null
}

export function english7TextbookSupplementUnitIds() {
  return SUPPLEMENTS.map((item) => item.unitId)
}
