import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const sources = [
  {
    name: 'CEFR-J 1.5',
    primary: 'https://raw.githubusercontent.com/openlanguageprofiles/olp-en-cefrj/master/cefrj-vocabulary-profile-1.5.csv',
    fallback: 'https://cdn.jsdelivr.net/gh/openlanguageprofiles/olp-en-cefrj@master/cefrj-vocabulary-profile-1.5.csv',
  },
  {
    name: 'Octanove C1/C2 1.0',
    primary: 'https://raw.githubusercontent.com/openlanguageprofiles/olp-en-cefrj/master/octanove-vocabulary-profile-c1c2-1.0.csv',
    fallback: 'https://cdn.jsdelivr.net/gh/openlanguageprofiles/olp-en-cefrj@master/octanove-vocabulary-profile-c1c2-1.0.csv',
  },
]

const validLevels = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
const minimumEntriesPerLevel = 1000
const outputPath = path.resolve('src/generated/cefr-lexicon.ts')

function parseCsvLine(line) {
  const values = []
  let value = ''
  let quoted = false

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"'
        index += 1
      } else {
        quoted = !quoted
      }
    } else if (character === ',' && !quoted) {
      values.push(value)
      value = ''
    } else {
      value += character
    }
  }

  values.push(value)
  return values
}

function normalizeWord(value) {
  return value
    .replace(/^\uFEFF/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function expandHeadword(headword) {
  return headword
    .split('/')
    .map(normalizeWord)
    .filter((word) => word.length > 0 && word.length <= 48)
    .filter((word) => /^[A-Za-z0-9][A-Za-z0-9 .,'’()\-]*$/.test(word))
}

async function fetchText(source) {
  let lastError = null
  for (const url of [source.primary, source.fallback]) {
    try {
      const response = await fetch(url, { headers: { 'user-agent': 'Bubble-Space-build/1.0' } })
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
      const text = await response.text()
      if (!text.includes('headword,pos,CEFR')) throw new Error('unexpected CSV header')
      return text
    } catch (error) {
      lastError = error
      console.warn(`[cefr] ${source.name} fetch failed from ${url}: ${String(error)}`)
    }
  }
  throw lastError ?? new Error(`unable to fetch ${source.name}`)
}

function parseSource(text, sourceName) {
  const lines = text.split(/\r?\n/).filter(Boolean)
  const header = parseCsvLine(lines[0]).map((value) => value.replace(/^\uFEFF/, '').trim())
  const headwordIndex = header.indexOf('headword')
  const posIndex = header.indexOf('pos')
  const levelIndex = header.indexOf('CEFR')
  const notesIndex = header.indexOf('notes')
  const topicIndexes = header
    .map((name, index) => ({ name, index }))
    .filter(({ name }) => name.startsWith('CoreInventory') || name === 'Threshold')
    .map(({ index }) => index)

  if (headwordIndex < 0 || posIndex < 0 || levelIndex < 0) {
    throw new Error(`${sourceName}: required columns are missing`)
  }

  const entries = []
  const sourceCounts = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 }

  for (let rowIndex = 1; rowIndex < lines.length; rowIndex += 1) {
    const row = parseCsvLine(lines[rowIndex])
    const level = normalizeWord(row[levelIndex] ?? '').toUpperCase()
    if (!validLevels.has(level)) continue

    const originalHeadword = normalizeWord(row[headwordIndex] ?? '')
    const pos = normalizeWord(row[posIndex] ?? '') || 'unknown'
    const note = notesIndex >= 0 ? normalizeWord(row[notesIndex] ?? '') : ''
    const topic = topicIndexes
      .map((index) => normalizeWord(row[index] ?? ''))
      .filter(Boolean)
      .join(' · ')

    sourceCounts[level] += 1
    for (const word of expandHeadword(originalHeadword)) {
      entries.push({
        id: `${sourceName}:${rowIndex}:${word.toLowerCase()}:${pos}`,
        word,
        pos,
        level,
        source: sourceName,
        topic,
        note,
      })
    }
  }

  return { entries, sourceCounts }
}

function countLevels(entries) {
  const counts = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 }
  for (const entry of entries) counts[entry.level] += 1
  return counts
}

function dedupe(entries) {
  const seen = new Set()
  const result = []
  for (const entry of entries) {
    const key = `${entry.word.toLowerCase()}|${entry.pos.toLowerCase()}|${entry.level}`
    if (seen.has(key)) continue
    seen.add(key)
    result.push(entry)
  }
  return result
}

function assertCoverage(levelCounts) {
  const insufficient = Object.entries(levelCounts)
    .filter(([, count]) => count < minimumEntriesPerLevel)
    .map(([level, count]) => `${level}=${count}`)

  if (insufficient.length > 0) {
    throw new Error(`CEFR coverage below ${minimumEntriesPerLevel} entries: ${insufficient.join(', ')}`)
  }
}

async function main() {
  await mkdir(path.dirname(outputPath), { recursive: true })

  try {
    const parsedSources = []
    for (const source of sources) {
      const text = await fetchText(source)
      parsedSources.push(parseSource(text, source.name))
    }

    const entries = dedupe(parsedSources.flatMap((item) => item.entries))
      .sort((left, right) => left.level.localeCompare(right.level) || left.word.localeCompare(right.word))
    const levelCounts = countLevels(entries)
    assertCoverage(levelCounts)

    const sourceRowCounts = parsedSources.reduce(
      (total, item) => Object.fromEntries(Object.keys(total).map((level) => [level, total[level] + item.sourceCounts[level]])),
      { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 },
    )
    const entriesJson = JSON.stringify(entries)

    const content = `// Generated by scripts/build-cefr-lexicon.mjs. Do not edit manually.\n` +
      `export type GeneratedCefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'\n` +
      `export type GeneratedCefrEntry = { id: string; word: string; pos: string; level: GeneratedCefrLevel; source: string; topic: string; note: string }\n` +
      `const CEFR_LEXICON_JSON = ${JSON.stringify(entriesJson)}\n` +
      `export const CEFR_LEXICON = JSON.parse(CEFR_LEXICON_JSON) as GeneratedCefrEntry[]\n` +
      `export const CEFR_LEVEL_COUNTS: Record<GeneratedCefrLevel, number> = ${JSON.stringify(levelCounts)}\n` +
      `export const CEFR_SOURCE_ROW_COUNTS: Record<GeneratedCefrLevel, number> = ${JSON.stringify(sourceRowCounts)}\n` +
      `export const CEFR_MIN_ENTRIES_PER_LEVEL = ${minimumEntriesPerLevel}\n` +
      `export const CEFR_COVERAGE_OK = true\n` +
      `export const CEFR_SOURCE_NOTE = 'CEFR-J Vocabulary Profile 1.5 © Tono Laboratory, TUFS; Octanove Vocabulary Profile C1/C2 1.0, CC BY-SA 4.0.'\n`

    await writeFile(outputPath, content, 'utf8')
    console.log(`[cefr] generated ${entries.length} playable entries`)
    console.log(`[cefr] source rows ${JSON.stringify(sourceRowCounts)}`)
    console.log(`[cefr] playable entries ${JSON.stringify(levelCounts)}`)
    console.log(`[cefr] coverage check passed: every level has at least ${minimumEntriesPerLevel} entries`)
  } catch (error) {
    console.error(`[cefr] generation failed; refusing to deploy incomplete coverage: ${String(error)}`)
    const fallback = `// Generated fallback because CEFR coverage validation failed.\n` +
      `export type GeneratedCefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'\n` +
      `export type GeneratedCefrEntry = { id: string; word: string; pos: string; level: GeneratedCefrLevel; source: string; topic: string; note: string }\n` +
      `export const CEFR_LEXICON: GeneratedCefrEntry[] = []\n` +
      `export const CEFR_LEVEL_COUNTS: Record<GeneratedCefrLevel, number> = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 }\n` +
      `export const CEFR_SOURCE_ROW_COUNTS = CEFR_LEVEL_COUNTS\n` +
      `export const CEFR_MIN_ENTRIES_PER_LEVEL = ${minimumEntriesPerLevel}\n` +
      `export const CEFR_COVERAGE_OK = false\n` +
      `export const CEFR_SOURCE_NOTE = 'CEFR coverage generation failed.'\n`
    await writeFile(outputPath, fallback, 'utf8')
    process.exitCode = 1
  }
}

await main()
