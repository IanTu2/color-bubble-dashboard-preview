import { readFile } from 'node:fs/promises'
import { createServer } from 'vite'

const failures = []
const server = await createServer({ logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })

try {
  const component = await readFile(new URL('../src/components/EnglishCasualPracticeV6.tsx', import.meta.url), 'utf8')
  const wrapper = await readFile(new URL('../src/components/EnglishCasualPractice.tsx', import.meta.url), 'utf8')
  const css = await readFile(new URL('../src/english-casual-practice-v6.css', import.meta.url), 'utf8')
  const grammar = await server.ssrLoadModule('/src/english-grammar-reading-bank.ts')
  const lexicon = await server.ssrLoadModule('/src/generated/cefr-lexicon.ts')
  const grader = await server.ssrLoadModule('/src/english-smart-grading.ts')

  const componentTokens = [
    "type GameTrack = 'mix' | 'vocabulary' | 'grammar' | 'listening'",
    'type SessionLength = 10 | 15 | 20',
    "type SessionPhase = 'setup' | 'playing' | 'summary'",
    "'sentence-order'",
    "'grammar-choice'",
    "'dictation'",
    'reviewQueue',
    'dueAt',
    'buildNextChallenge',
    'startVoiceInput',
    'SpeechRecognition',
    'aria-live="polite"',
    'data-english-game-v6="setup"',
    'data-english-game-v6="playing"',
    'data-english-game-v6="summary"',
    'stats.xp',
    'stats.bestStreak',
    'reviewHits',
  ]
  for (const token of componentTokens) if (!component.includes(token)) failures.push(`component missing ${token}`)

  if (!wrapper.includes('EnglishCasualPracticeV6 as EnglishCasualPractice')) failures.push('active English casual practice is not V6')
  if (wrapper.includes('EnglishCasualPracticeV5 as EnglishCasualPractice')) failures.push('V5 is still active')

  const cssTokens = [
    '.english-game-v6-shell',
    '.english-game-v6-progress',
    '.english-game-v6-track-grid',
    '.english-game-v6-token-bank',
    '.english-game-v6-feedback',
    '.english-game-v6-summary-grid',
    '@media (max-width: 520px)',
    '@media (prefers-reduced-motion: reduce)',
  ]
  for (const token of cssTokens) if (!css.includes(token)) failures.push(`game CSS missing ${token}`)

  const grammarQuestions = grammar.GRAMMAR_READING_QUESTION_BANK.filter((item) => item.skill === 'grammar')
  if (grammarQuestions.length < 30) failures.push(`grammar practice bank too small: ${grammarQuestions.length}`)
  const grammarLevels = new Set(grammarQuestions.map((item) => Math.max(1, Math.min(6, Math.round(item.difficulty)))))
  if (grammarLevels.size < 5) failures.push(`grammar bank covers only ${grammarLevels.size} rounded CEFR bands`)

  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  const counts = lexicon.CEFR_LEVEL_COUNTS
  for (const level of levels) if (!counts[level] || counts[level] < 1) failures.push(`missing CEFR lexicon coverage for ${level}`)

  const misleadingClaims = ['發音準確度評分', 'pronunciation accuracy score', 'AI 發音評分', 'AI pronunciation score']
  for (const phrase of misleadingClaims) if (component.toLowerCase().includes(phrase.toLowerCase())) failures.push(`misleading unsupported speech claim: ${phrase}`)

  const crossScript = grader.smartGradeEnglishAnswer('想法', 'idea', ['想法'])
  if (crossScript.score !== 0 || crossScript.kind !== 'wrong') {
    failures.push('Chinese semantic aliases are still accepted as an English spelling/cloze answer')
  }
  const sameScriptAlternative = grader.smartGradeEnglishAnswer('colour', 'color', ['colour'])
  if (sameScriptAlternative.score < 0.75) failures.push('valid same-script English alternatives stopped working')

  console.log('[english-game-v6]', JSON.stringify({
    grammarQuestions: grammarQuestions.length,
    grammarBands: grammarLevels.size,
    lexiconByLevel: Object.fromEntries(levels.map((level) => [level, counts[level]])),
    crossScriptGuard: crossScript.kind,
    sameScriptAlternative: sameScriptAlternative.kind,
    failures: failures.length,
  }, null, 2))
} finally {
  await server.close()
}

if (failures.length) {
  console.error('[english-game-v6] FAILED')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}
console.log('[english-game-v6] PASSED: short-session flow, adaptive review, vocabulary/grammar/listening modes, voice-input boundary, grading-script boundary, accessibility, and responsive UI gates are present.')
