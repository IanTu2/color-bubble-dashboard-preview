import { englishStorageKey, englishTodayKey } from './english-learning'

export type JourneyCourseId = 'general' | 'travel' | 'business' | 'exam'
export type JourneyFrameId = 'aurora' | 'sunset' | 'ocean' | 'mono'

export type SavedSentence = {
  id: string
  english: string
  chinese: string
  createdAt: string
}

export type ReviewScheduleItem = {
  dueDate: string
  intervalDays: number
  ease: number
  lapses: number
  reviews: number
}

export type JourneyState = {
  version: 1
  xp: number
  coins: number
  streak: number
  lastActiveDate: string | null
  dailyXp: Record<string, number>
  selectedCourse: JourneyCourseId
  microLevel: number
  dailyTargetXp: number
  completedMissionIds: string[]
  claimedDailyRewardDate: string | null
  savedWordIds: string[]
  savedSentences: SavedSentence[]
  reviewSchedule: Record<string, ReviewScheduleItem>
  avatar: string
  frame: JourneyFrameId
  roleplayCompletions: Record<string, number>
  speakingAttempts: number
  completedLessonIds: string[]
}

export type CourseTrack = {
  id: JourneyCourseId
  icon: string
  zhTitle: string
  enTitle: string
  zhDescription: string
  enDescription: string
  focus: string[]
}

export type RoleplayStage = {
  speaker: string
  prompt: string
  expectedKeywords: string[]
  sample: string
  successReply: string
  retryHint: string
}

export type RoleplayScenario = {
  id: string
  course: JourneyCourseId
  icon: string
  level: number
  zhTitle: string
  enTitle: string
  zhDescription: string
  enDescription: string
  stages: RoleplayStage[]
}

export const COURSE_TRACKS: CourseTrack[] = [
  {
    id: 'general',
    icon: '🌱',
    zhTitle: '日常英文',
    enTitle: 'Everyday English',
    zhDescription: '生活、社交、資訊理解與日常表達。',
    enDescription: 'Daily life, social interaction, information, and practical expression.',
    focus: ['recognition', 'spelling', 'listening', 'reading'],
  },
  {
    id: 'travel',
    icon: '🧳',
    zhTitle: '旅遊英文',
    enTitle: 'Travel English',
    zhDescription: '機場、飯店、餐廳、交通與緊急應對。',
    enDescription: 'Airports, hotels, restaurants, transport, and emergencies.',
    focus: ['listening', 'reading', 'spelling'],
  },
  {
    id: 'business',
    icon: '💼',
    zhTitle: '商務英文',
    enTitle: 'Business English',
    zhDescription: '會議、簡報、Email、協商與職場溝通。',
    enDescription: 'Meetings, presentations, email, negotiation, and workplace communication.',
    focus: ['grammar', 'reading', 'listening'],
  },
  {
    id: 'exam',
    icon: '🎯',
    zhTitle: '考試準備',
    enTitle: 'Exam Preparation',
    zhDescription: 'TOEIC、全民英檢與綜合能力計時練習。',
    enDescription: 'Timed integrated practice for TOEIC, GEPT, and general exams.',
    focus: ['grammar', 'reading', 'listening', 'recognition'],
  },
]

export const ROLEPLAY_SCENARIOS: RoleplayScenario[] = [
  {
    id: 'cafe-order',
    course: 'general',
    icon: '☕',
    level: 1,
    zhTitle: '咖啡店點餐',
    enTitle: 'Ordering at a Café',
    zhDescription: '完成飲品、尺寸與外帶需求。',
    enDescription: 'Order a drink, choose a size, and ask for takeaway.',
    stages: [
      {
        speaker: 'Barista',
        prompt: 'Hi! What can I get for you today?',
        expectedKeywords: ['would like', 'can i have', 'coffee', 'tea', 'latte'],
        sample: 'I would like a medium latte, please.',
        successReply: 'Sure. What size would you like?',
        retryHint: '試著使用 “I would like…” 或 “Can I have…?” 說出飲品。',
      },
      {
        speaker: 'Barista',
        prompt: 'Would you like it hot or iced?',
        expectedKeywords: ['hot', 'iced', 'ice'],
        sample: 'I would like it iced, please.',
        successReply: 'Great. Is that for here or to go?',
        retryHint: '回答 hot 或 iced，並盡量用完整句子。',
      },
      {
        speaker: 'Barista',
        prompt: 'Is that for here or to go?',
        expectedKeywords: ['to go', 'takeaway', 'for here'],
        sample: 'To go, please.',
        successReply: 'Perfect. Your order will be ready soon.',
        retryHint: '可回答 “To go, please.” 或 “For here, please.”',
      },
    ],
  },
  {
    id: 'hotel-checkin',
    course: 'travel',
    icon: '🏨',
    level: 2,
    zhTitle: '飯店入住',
    enTitle: 'Hotel Check-in',
    zhDescription: '說明訂房、確認入住天數並詢問早餐。',
    enDescription: 'Confirm a reservation, length of stay, and breakfast details.',
    stages: [
      {
        speaker: 'Receptionist',
        prompt: 'Welcome. Do you have a reservation?',
        expectedKeywords: ['reservation', 'booking', 'yes', 'under the name'],
        sample: 'Yes, I have a reservation under the name Ian Tu.',
        successReply: 'Thank you. How many nights will you be staying?',
        retryHint: '說明你有訂房，最好加上 “under the name…”。',
      },
      {
        speaker: 'Receptionist',
        prompt: 'How many nights will you be staying?',
        expectedKeywords: ['night', 'nights', 'staying', 'stay'],
        sample: 'I will be staying for three nights.',
        successReply: 'All right. Breakfast is served from seven to ten.',
        retryHint: '用 “I will be staying for … nights.” 回答。',
      },
      {
        speaker: 'Receptionist',
        prompt: 'Do you have any questions about the hotel?',
        expectedKeywords: ['breakfast', 'wifi', 'check-out', 'checkout', 'where', 'what time'],
        sample: 'What time is breakfast served?',
        successReply: 'Breakfast is on the second floor from seven to ten.',
        retryHint: '詢問早餐、Wi-Fi、退房時間或設施位置。',
      },
    ],
  },
  {
    id: 'project-update',
    course: 'business',
    icon: '📊',
    level: 3,
    zhTitle: '專案進度會議',
    enTitle: 'Project Status Meeting',
    zhDescription: '回報進度、說明阻礙並提出下一步。',
    enDescription: 'Report progress, explain a blocker, and propose next steps.',
    stages: [
      {
        speaker: 'Manager',
        prompt: 'Could you give us a quick update on the project?',
        expectedKeywords: ['completed', 'finished', 'progress', 'working on', 'on schedule'],
        sample: 'We have completed the login flow and are working on the dashboard.',
        successReply: 'Thanks. Is anything blocking the team?',
        retryHint: '先說已完成什麼，再說目前正在進行什麼。',
      },
      {
        speaker: 'Manager',
        prompt: 'Is anything blocking the team?',
        expectedKeywords: ['blocked', 'waiting', 'issue', 'problem', 'need', 'dependency'],
        sample: 'We are waiting for the API specification, so integration is blocked.',
        successReply: 'Understood. What do you recommend as the next step?',
        retryHint: '說明具體阻礙以及它造成的影響。',
      },
      {
        speaker: 'Manager',
        prompt: 'What do you recommend as the next step?',
        expectedKeywords: ['recommend', 'suggest', 'next step', 'plan', 'should'],
        sample: 'I suggest confirming the API contract today and testing tomorrow.',
        successReply: 'That sounds practical. Please document the plan after the meeting.',
        retryHint: '用 recommend、suggest 或 should 提出可執行的下一步。',
      },
    ],
  },
  {
    id: 'exam-opinion',
    course: 'exam',
    icon: '📝',
    level: 4,
    zhTitle: '口說立場題',
    enTitle: 'Speaking Opinion Task',
    zhDescription: '表達立場、提供理由並補充例子。',
    enDescription: 'State an opinion, support it, and give an example.',
    stages: [
      {
        speaker: 'Examiner',
        prompt: 'Do you think students should be allowed to use phones in class?',
        expectedKeywords: ['think', 'believe', 'agree', 'disagree', 'should', 'should not'],
        sample: 'I think phones should be allowed only when teachers ask students to use them.',
        successReply: 'What is the main reason for your opinion?',
        retryHint: '先清楚說出同意或不同意。',
      },
      {
        speaker: 'Examiner',
        prompt: 'What is the main reason for your opinion?',
        expectedKeywords: ['because', 'reason', 'help', 'distract', 'learning', 'focus'],
        sample: 'Because phones can support research, but unrestricted use can distract students.',
        successReply: 'Can you give a specific example?',
        retryHint: '用 because 提供一個清楚理由。',
      },
      {
        speaker: 'Examiner',
        prompt: 'Can you give a specific example?',
        expectedKeywords: ['for example', 'for instance', 'such as', 'example'],
        sample: 'For example, students can use a dictionary app during a vocabulary activity.',
        successReply: 'Thank you. Your answer included a position, a reason, and an example.',
        retryHint: '使用 “For example” 或 “For instance” 補充具體情境。',
      },
    ],
  },
]

export const DEFAULT_JOURNEY_STATE: JourneyState = {
  version: 1,
  xp: 0,
  coins: 120,
  streak: 0,
  lastActiveDate: null,
  dailyXp: {},
  selectedCourse: 'general',
  microLevel: 1,
  dailyTargetXp: 50,
  completedMissionIds: [],
  claimedDailyRewardDate: null,
  savedWordIds: [],
  savedSentences: [],
  reviewSchedule: {},
  avatar: '🐧',
  frame: 'aurora',
  roleplayCompletions: {},
  speakingAttempts: 0,
  completedLessonIds: [],
}

function safeNumber(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

export function normalizeJourneyState(value: Partial<JourneyState> | null | undefined): JourneyState {
  const source = value ?? {}
  return {
    ...DEFAULT_JOURNEY_STATE,
    ...source,
    version: 1,
    xp: Math.max(0, safeNumber(source.xp, 0)),
    coins: Math.max(0, safeNumber(source.coins, 120)),
    streak: Math.max(0, safeNumber(source.streak, 0)),
    microLevel: Math.max(1, Math.min(30, safeNumber(source.microLevel, 1))),
    dailyTargetXp: Math.max(20, Math.min(150, safeNumber(source.dailyTargetXp, 50))),
    dailyXp: source.dailyXp ?? {},
    completedMissionIds: Array.isArray(source.completedMissionIds) ? source.completedMissionIds : [],
    savedWordIds: Array.isArray(source.savedWordIds) ? source.savedWordIds : [],
    savedSentences: Array.isArray(source.savedSentences) ? source.savedSentences : [],
    reviewSchedule: source.reviewSchedule ?? {},
    roleplayCompletions: source.roleplayCompletions ?? {},
    completedLessonIds: Array.isArray(source.completedLessonIds) ? source.completedLessonIds : [],
  }
}

export function journeyStorageKey(userId: string) {
  return englishStorageKey(userId, 'journey-v1')
}

export function readJourneyState(userId: string) {
  try {
    const raw = window.localStorage.getItem(journeyStorageKey(userId))
    return normalizeJourneyState(raw ? JSON.parse(raw) as Partial<JourneyState> : null)
  } catch {
    return DEFAULT_JOURNEY_STATE
  }
}

export function writeJourneyState(userId: string, state: JourneyState) {
  window.localStorage.setItem(journeyStorageKey(userId), JSON.stringify(state))
}

export function cefrBaseMicroLevel(level: string | null) {
  return ({ A1: 1, A2: 6, B1: 11, B2: 16, C1: 21, C2: 26 } as Record<string, number>)[level ?? ''] ?? 1
}

export function microLevelToCefr(level: number) {
  if (level <= 5) return 'A1'
  if (level <= 10) return 'A2'
  if (level <= 15) return 'B1'
  if (level <= 20) return 'B2'
  if (level <= 25) return 'C1'
  return 'C2'
}

export function applyJourneyReward(state: JourneyState, xp: number, coins: number, lessonId?: string) {
  const today = englishTodayKey()
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const nextXp = state.xp + Math.max(0, xp)
  const baseLevel = Math.max(state.microLevel, 1)
  const earnedLevel = Math.min(30, 1 + Math.floor(nextXp / 240))
  return normalizeJourneyState({
    ...state,
    xp: nextXp,
    coins: state.coins + Math.max(0, coins),
    streak: state.lastActiveDate === today
      ? state.streak
      : state.lastActiveDate === yesterday
        ? state.streak + 1
        : 1,
    lastActiveDate: today,
    dailyXp: { ...state.dailyXp, [today]: (state.dailyXp[today] ?? 0) + Math.max(0, xp) },
    microLevel: Math.max(baseLevel, earnedLevel),
    completedLessonIds: lessonId
      ? Array.from(new Set([...state.completedLessonIds, lessonId]))
      : state.completedLessonIds,
  })
}

export function scheduleReview(item: ReviewScheduleItem | undefined, correct: boolean) {
  const current = item ?? { dueDate: englishTodayKey(), intervalDays: 0, ease: 2.3, lapses: 0, reviews: 0 }
  const intervalDays = correct
    ? current.intervalDays <= 0
      ? 1
      : current.intervalDays === 1
        ? 3
        : Math.min(60, Math.max(1, Math.round(current.intervalDays * current.ease)))
    : 1
  const due = new Date()
  due.setDate(due.getDate() + intervalDays)
  return {
    dueDate: due.toISOString().slice(0, 10),
    intervalDays,
    ease: Math.max(1.3, Math.min(2.8, current.ease + (correct ? 0.06 : -0.2))),
    lapses: current.lapses + (correct ? 0 : 1),
    reviews: current.reviews + 1,
  }
}

export function currentWeekKey() {
  const date = new Date()
  const day = date.getDay() || 7
  date.setDate(date.getDate() - day + 1)
  return date.toISOString().slice(0, 10)
}

export function weeklyXp(state: JourneyState) {
  const monday = currentWeekKey()
  return Object.entries(state.dailyXp)
    .filter(([date]) => date >= monday)
    .reduce((total, [, value]) => total + value, 0)
}

function seededNumber(seed: string) {
  let value = 2166136261
  for (let index = 0; index < seed.length; index += 1) {
    value ^= seed.charCodeAt(index)
    value = Math.imul(value, 16777619)
  }
  return Math.abs(value >>> 0)
}

export function localLeagueRows(state: JourneyState) {
  const week = currentWeekKey()
  const names = ['Mia', 'Leo', 'Yuna', 'Noah', 'Ava', 'Eli', 'Nora']
  const generated = names.map((name, index) => ({
    name,
    avatar: ['🦊', '🐼', '🐰', '🦉', '🐯', '🐨', '🦦'][index],
    xp: 80 + (seededNumber(`${week}-${name}`) % 420),
    isUser: false,
  }))
  return [
    ...generated,
    { name: '你', avatar: state.avatar, xp: weeklyXp(state), isUser: true },
  ]
    .sort((left, right) => right.xp - left.xp)
    .map((row, index) => ({ ...row, rank: index + 1 }))
}
