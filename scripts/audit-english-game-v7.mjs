import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { readFile } from 'node:fs/promises'
import { createServer } from 'vite'

const failures = []
const approx = (actual, expected, tolerance, label) => {
  if (Math.abs(actual - expected) > tolerance) failures.push(`${label}: expected ~${expected}, got ${actual}`)
}
const msHours = (iso, base) => (Date.parse(iso) - base) / 3_600_000

const server = await createServer({ logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })
try {
  const engine = await server.ssrLoadModule('/src/english-game-v7-engine.ts')
  const grammar = await server.ssrLoadModule('/src/english-grammar-reading-bank.ts')
  const lexicon = await server.ssrLoadModule('/src/generated/cefr-lexicon.ts')
  const grader = await server.ssrLoadModule('/src/english-smart-grading.ts')
  const componentModule = await server.ssrLoadModule('/src/components/EnglishCasualPracticeV7.tsx')
  const Game = componentModule.EnglishCasualPracticeV7

  const component = await readFile(new URL('../src/components/EnglishCasualPracticeV7.tsx', import.meta.url), 'utf8')
  const portal = await readFile(new URL('../src/components/EnglishGameV7Portal.tsx', import.meta.url), 'utf8')
  const studio = await readFile(new URL('../src/components/EnglishLearningStudioV5.tsx', import.meta.url), 'utf8')
  const css = await readFile(new URL('../src/english-casual-practice-v7.css', import.meta.url), 'utf8')
  const portalCss = await readFile(new URL('../src/english-game-v7-portal.css', import.meta.url), 'utf8')

  const now = Date.parse('2026-08-24T12:00:00.000Z')
  const wordRef = { key: 'word:friend:A1', source: 'word', refId: 'friend', level: 'A1', label: 'friend' }
  const grammarRef = { key: 'grammar:grammar-expanded-a1-be', source: 'grammar', refId: 'grammar-expanded-a1-be-choice', level: 'A1', label: 'be 動詞' }

  const empty = engine.emptyEnglishGameMemoryV7()
  const wrong = engine.scheduleEnglishGameReviewV7(empty, wordRef, 0, now)
  approx(msHours(wrong.reviews[0].dueAt, now), 4, .01, 'wrong review interval')
  if (wrong.reviews[0].lapses !== 1 || wrong.reviews[0].correctStreak !== 0) failures.push('wrong answer does not reset streak/increment lapse')

  const close = engine.scheduleEnglishGameReviewV7(empty, wordRef, .5, now)
  approx(msHours(close.reviews[0].dueAt, now), 12, .01, 'close review interval')

  const alt = engine.scheduleEnglishGameReviewV7(empty, wordRef, .75, now)
  approx(msHours(alt.reviews[0].dueAt, now), 24, .01, 'accepted review interval')

  const exact1 = engine.scheduleEnglishGameReviewV7(empty, wordRef, 1, now)
  approx(msHours(exact1.reviews[0].dueAt, now), 24, .01, 'first exact interval')
  const exact2 = engine.scheduleEnglishGameReviewV7(exact1, wordRef, 1, now + 24 * 3_600_000)
  approx(msHours(exact2.reviews[0].dueAt, now + 24 * 3_600_000), 72, .01, 'second exact interval')
  const exact3 = engine.scheduleEnglishGameReviewV7(exact2, wordRef, 1, now + 96 * 3_600_000)
  approx(msHours(exact3.reviews[0].dueAt, now + 96 * 3_600_000), 168, .01, 'third exact interval')
  if (exact3.reviews.length !== 1) failures.push(`same review key duplicated: ${exact3.reviews.length}`)

  const mixedMemory = engine.scheduleEnglishGameReviewV7(wrong, grammarRef, 0, now)
  const dueLater = now + 5 * 3_600_000
  if (engine.dueEnglishGameReviewsV7(mixedMemory, 'mix', dueLater).length !== 2) failures.push('mix due filter does not include word + grammar')
  if (engine.dueEnglishGameReviewsV7(mixedMemory, 'grammar', dueLater).some((item) => item.source !== 'grammar')) failures.push('grammar due filter leaked word review')
  for (const track of ['vocabulary', 'listening', 'speaking']) {
    if (engine.dueEnglishGameReviewsV7(mixedMemory, track, dueLater).some((item) => item.source !== 'word')) failures.push(`${track} due filter leaked grammar review`)
  }
  if (engine.dueEnglishGameReviewsV7(mixedMemory, 'mix', now + 60 * 60 * 1000).length !== 0) failures.push('future review returned before due time')
  if (!engine.nextDueEnglishGameReviewV7(mixedMemory, 'mix', new Set([wordRef.key]), dueLater)?.key.startsWith('grammar:')) failures.push('excluded due key was not respected')

  const session1 = engine.completeEnglishGameSessionV7(empty, 100, Date.parse('2026-08-24T03:00:00Z'))
  const sessionSameDay = engine.completeEnglishGameSessionV7(session1, 20, Date.parse('2026-08-24T15:00:00Z'))
  const sessionNextDay = engine.completeEnglishGameSessionV7(sessionSameDay, 30, Date.parse('2026-08-25T04:00:00Z'))
  if (session1.sessionStreak !== 1 || sessionSameDay.sessionStreak !== 1 || sessionNextDay.sessionStreak !== 2) failures.push('session day streak logic is incorrect')
  if (sessionNextDay.sessions !== 3 || sessionNextDay.totalXp !== 150) failures.push('session totals are not accumulated correctly')

  const sanitized = engine.sanitizeEnglishGameMemoryV7({ version: 999, reviews: [{ broken: true }], sessions: -10, totalXp: Number.NaN })
  if (sanitized.version !== 1 || sanitized.reviews.length !== 0 || sanitized.sessions !== 0 || sanitized.totalXp !== 0) failures.push('invalid persisted memory is not sanitized safely')

  const grammarChoices = grammar.GRAMMAR_READING_QUESTION_BANK.filter((item) => item.skill === 'grammar' && item.id.endsWith('-choice'))
  const grammarCorrections = new Map(grammar.GRAMMAR_READING_QUESTION_BANK.filter((item) => item.skill === 'grammar' && item.id.endsWith('-correction')).map((item) => [engine.grammarBaseIdV7(item.id), item]))
  let grammarOrderReady = 0
  for (const question of grammarChoices) {
    if (!question.choices?.length || question.choices.length < 3) failures.push(`${question.id}: grammar choice missing playable choices`)
    if (!question.choices?.some((choice) => String(choice).trim().toLowerCase() === String(question.answer).trim().toLowerCase())) failures.push(`${question.id}: answer absent from choices`)
    const sentence = engine.completeGrammarSentenceV7(question)
    if (!sentence || sentence.includes('___') || engine.tokenizeSentenceV7(sentence).length < 3) failures.push(`${question.id}: cannot build a complete grammar-card sentence`)
    else grammarOrderReady += 1
    if (!grammarCorrections.has(engine.grammarBaseIdV7(question.id))) failures.push(`${question.id}: matching correction task missing`)
  }
  if (grammarChoices.length < 30) failures.push(`grammar concepts too small: ${grammarChoices.length}`)

  for (const level of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']) if (!lexicon.CEFR_LEVEL_COUNTS[level]) failures.push(`CEFR lexicon missing ${level}`)

  const crossScript = grader.smartGradeEnglishAnswer('想法', 'idea', ['想法'])
  if (crossScript.score !== 0 || crossScript.kind !== 'wrong') failures.push('CJK semantic alias is accepted as an English production answer')
  const spellingNear = grader.smartGradeEnglishAnswer('frend', 'friend', [])
  if (spellingNear.score !== .5 || spellingNear.kind !== 'close') failures.push('one-letter spelling tolerance regressed')

  const requiredComponentTokens = [
    "'speaking'",
    "'dictation-sentence'",
    "'grammar-order'",
    "'speech-recall'",
    'preAnswerAudio',
    'postAnswerAudio',
    'scheduleEnglishGameReviewV7',
    'nextDueEnglishGameReviewV7',
    'readEnglishGameMemoryV7',
    'reviewTimingLabelV7',
    'dueEnglishGameReviewsV7',
    '不評分口音或語調',
    'data-english-game-v7="setup"',
    'data-english-game-v7="playing"',
    'data-english-game-v7="summary"',
  ]
  for (const token of requiredComponentTokens) if (!component.includes(token)) failures.push(`V7 component missing ${token}`)

  const misleadingClaims = ['發音準確度評分', 'AI 發音評分', 'pronunciation accuracy score', 'AI pronunciation score', 'EPOP 演算法', 'EPOP algorithm']
  for (const phrase of misleadingClaims) if (component.toLowerCase().includes(phrase.toLowerCase())) failures.push(`unsupported product claim: ${phrase}`)

  const clozeStart = component.indexOf("if (kind === 'cloze' && detail)")
  const clozeEnd = component.indexOf("if (kind === 'sentence-order'", clozeStart)
  const clozeBlock = component.slice(clozeStart, clozeEnd)
  if (clozeBlock.includes('preAnswerAudio: detail.example')) failures.push('cloze still leaks the complete target sentence before answer')
  const grammarOrderStart = component.indexOf("if (kind === 'grammar-order'")
  const grammarOrderEnd = component.indexOf("if (kind === 'grammar-repair'", grammarOrderStart)
  if (component.slice(grammarOrderStart, grammarOrderEnd).includes('preAnswerAudio')) failures.push('grammar-order leaks target audio before answer')

  if (!studio.includes("useState<EnglishMode>('game')")) failures.push('English tool hub does not open the game by default')
  if (!studio.includes("{ id: 'game'")) failures.push('English game is not a first-class tool menu item')
  if (!studio.includes('<EnglishGameV7Portal')) failures.push('English tool hub is not wired to V7 portal')
  if (!portal.includes('userId={userId}') || !portal.includes('EnglishCasualPracticeV7')) failures.push('V7 portal does not pass user-scoped identity into the game')
  if (!portal.includes("if (!profile.level)")) failures.push('game does not require placement level before adaptive play')

  const requiredCss = [
    '.english-game-v7-shell', '.english-game-v7-review-card', '.english-game-v7-track-grid', '.english-game-v7-audio-stage',
    '.english-game-v7-token-bank', '.english-game-v7-speaking-task', '.english-game-v7-feedback', '.english-game-v7-summary-grid',
    '@media (max-width: 520px)', '@media (prefers-reduced-motion: reduce)',
  ]
  for (const token of requiredCss) if (!css.includes(token)) failures.push(`V7 CSS missing ${token}`)
  if (!portalCss.includes('.english-game-v7-gate') || !portalCss.includes('.english-game-v7-word-return')) failures.push('V7 portal states are not styled')

  const html = renderToStaticMarkup(React.createElement(Game, {
    language: 'zh', userId: 'audit-user',
    profile: { goals: ['daily'], accent: 'en-US', dailyMinutes: 10, listeningEnabled: true, level: 'A2', assessmentCompletedAt: '2026-08-24T00:00:00.000Z' },
    history: { attempts: 0, correct: 0, learnedWordIds: [], difficultWordIds: [], streak: 0, lastStudyDate: null },
    setHistory: () => {}, onOpenWord: () => {},
  }))
  if (!html.includes('data-english-game-v7="setup"')) failures.push('SSR setup state did not render')
  if (!html.includes('智慧綜合') || !html.includes('文法') || !html.includes('聽力') || !html.includes('口說回想')) failures.push('SSR setup is missing practice-track choices')
  if (!html.includes('disabled')) failures.push('SSR without SpeechRecognition should disable speaking mode')

  console.log('[english-game-v7]', JSON.stringify({
    engineSchedule: { wrongHours: 4, closeHours: 12, exactDays: [1, 3, 7] },
    grammarConcepts: grammarChoices.length,
    grammarOrderReady,
    cefrLevels: Object.fromEntries(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((level) => [level, lexicon.CEFR_LEVEL_COUNTS[level]])),
    persistentReview: true,
    primaryEnglishTool: true,
    answerLeakGuard: true,
    speechBoundary: 'recognized-text-only',
    responsive: true,
    failures: failures.length,
  }, null, 2))
} finally {
  await server.close()
}

if (failures.length) {
  console.error('[english-game-v7] FAILED')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}
console.log('[english-game-v7] PASSED: persistent spaced review, same-round recovery, grammar sentence cards, sentence listening, speech-recognition boundaries, CEFR data, grading boundaries, first-class game entry, SSR setup, mobile layout, and answer-leak guards passed.')
