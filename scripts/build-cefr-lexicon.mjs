import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const cefrSources = [
  {
    name: 'CEFR-J 1.5',
    primary: 'https://raw.githubusercontent.com/openlanguageprofiles/olp-en-cefrj/master/cefrj-vocabulary-profile-1.5.csv',
    fallback: 'https://cdn.jsdelivr.net/gh/openlanguageprofiles/olp-en-cefrj@master/cefrj-vocabulary-profile-1.5.csv',
    expectedHeader: 'headword,pos,CEFR',
  },
  {
    name: 'Octanove C1/C2 1.0',
    primary: 'https://raw.githubusercontent.com/openlanguageprofiles/olp-en-cefrj/master/octanove-vocabulary-profile-c1c2-1.0.csv',
    fallback: 'https://cdn.jsdelivr.net/gh/openlanguageprofiles/olp-en-cefrj@master/octanove-vocabulary-profile-c1c2-1.0.csv',
    expectedHeader: 'headword,pos,CEFR',
  },
]

const ecdictSource = {
  name: 'ECDICT',
  primary: 'https://raw.githubusercontent.com/skywind3000/ECDICT/master/ecdict.csv',
  fallback: 'https://cdn.jsdelivr.net/gh/skywind3000/ECDICT@master/ecdict.csv',
  expectedHeader: 'word,phonetic,definition,translation',
}

const validLevels = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
const minimumEntriesPerLevel = 1000
const minimumBilingualCardsPerLevel = 1000
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

function forEachCsvRecord(text, callback) {
  let row = []
  let value = ''
  let quoted = false
  let recordIndex = 0

  const emit = () => {
    row.push(value)
    value = ''
    if (row.length > 1 || row.some((item) => item.trim())) callback(row, recordIndex)
    row = []
    recordIndex += 1
  }

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]

    if (character === '"') {
      if (quoted && text[index + 1] === '"') {
        value += '"'
        index += 1
      } else {
        quoted = !quoted
      }
      continue
    }

    if (character === ',' && !quoted) {
      row.push(value)
      value = ''
      continue
    }

    if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && text[index + 1] === '\n') index += 1
      emit()
      continue
    }

    value += character
  }

  if (value || row.length > 0) emit()
}

function normalizeWord(value) {
  return value
    .replace(/^\uFEFF/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeLookup(value) {
  return normalizeWord(value)
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[’]/g, "'")
}

function lookupKeys(value) {
  const normalized = normalizeLookup(value)
  return Array.from(new Set([
    normalized,
    normalized.replace(/\./g, ''),
    normalized.replace(/-/g, ' '),
    normalized.replace(/\s+/g, '-'),
  ].filter(Boolean)))
}

function cleanDictionaryField(value, maximumLength) {
  return String(value ?? '')
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, maximumLength)
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
      const response = await fetch(url, { headers: { 'user-agent': 'Bubble-Space-build/2.0' } })
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
      const text = await response.text()
      if (!text.includes(source.expectedHeader)) throw new Error('unexpected CSV header')
      return text
    } catch (error) {
      lastError = error
      console.warn(`[dictionary] ${source.name} fetch failed from ${url}: ${String(error)}`)
    }
  }
  throw lastError ?? new Error(`unable to fetch ${source.name}`)
}

function parseCefrSource(text, sourceName) {
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

function countLevels(entries, predicate = () => true) {
  const counts = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 }
  for (const entry of entries) {
    if (predicate(entry)) counts[entry.level] += 1
  }
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

function dictionaryRichness(entry) {
  return (entry.translation ? 100 : 0)
    + (entry.definition ? 24 : 0)
    + (entry.phonetic ? 12 : 0)
    + (entry.exchange ? 6 : 0)
    + (entry.tags ? 2 : 0)
}

function buildEcdictMap(text, targetEntries) {
  const targetKeys = new Set(targetEntries.flatMap((entry) => lookupKeys(entry.word)))
  const dictionary = new Map()
  let headerIndexes = null
  let matchedRows = 0

  forEachCsvRecord(text, (row, recordIndex) => {
    if (recordIndex === 0) {
      const header = row.map((value) => value.replace(/^\uFEFF/, '').trim())
      headerIndexes = {
        word: header.indexOf('word'),
        phonetic: header.indexOf('phonetic'),
        definition: header.indexOf('definition'),
        translation: header.indexOf('translation'),
        pos: header.indexOf('pos'),
        tags: header.indexOf('tag'),
        bnc: header.indexOf('bnc'),
        frq: header.indexOf('frq'),
        exchange: header.indexOf('exchange'),
      }
      if (headerIndexes.word < 0 || headerIndexes.translation < 0) {
        throw new Error('ECDICT required columns are missing')
      }
      return
    }

    if (!headerIndexes) return
    const word = cleanDictionaryField(row[headerIndexes.word], 80)
    const keys = lookupKeys(word)
    const relevantKeys = keys.filter((key) => targetKeys.has(key))
    if (relevantKeys.length === 0) return

    const candidate = {
      word,
      phonetic: cleanDictionaryField(row[headerIndexes.phonetic], 120),
      definition: cleanDictionaryField(row[headerIndexes.definition], 1200),
      translation: cleanDictionaryField(row[headerIndexes.translation], 900),
      dictionaryPos: cleanDictionaryField(row[headerIndexes.pos], 180),
      exchange: cleanDictionaryField(row[headerIndexes.exchange], 500),
      tags: cleanDictionaryField(row[headerIndexes.tags], 260),
      bnc: Number.parseInt(row[headerIndexes.bnc] ?? '', 10) || 0,
      frq: Number.parseInt(row[headerIndexes.frq] ?? '', 10) || 0,
    }

    if (!candidate.translation) return
    matchedRows += 1
    for (const key of relevantKeys) {
      const current = dictionary.get(key)
      if (!current || dictionaryRichness(candidate) > dictionaryRichness(current)) {
        dictionary.set(key, candidate)
      }
    }
  })

  console.log(`[ecdict] matched ${matchedRows} source rows to CEFR targets`)
  return dictionary
}

function findDictionaryEntry(dictionary, word) {
  for (const key of lookupKeys(word)) {
    const entry = dictionary.get(key)
    if (entry) return entry
  }
  return null
}

function enrichEntries(entries, dictionary) {
  return entries.map((entry) => {
    const matched = findDictionaryEntry(dictionary, entry.word)
    return {
      ...entry,
      phonetic: matched?.phonetic ?? '',
      definition: matched?.definition ?? '',
      translation: matched?.translation ?? '',
      dictionaryPos: matched?.dictionaryPos ?? '',
      exchange: matched?.exchange ?? '',
      tags: matched?.tags ?? '',
      bnc: matched?.bnc ?? 0,
      frq: matched?.frq ?? 0,
      dictionarySource: matched ? 'ECDICT' : '',
    }
  })
}

function assertMinimum(counts, minimum, label) {
  const insufficient = Object.entries(counts)
    .filter(([, count]) => count < minimum)
    .map(([level, count]) => `${level}=${count}`)

  if (insufficient.length > 0) {
    throw new Error(`${label} below ${minimum}: ${insufficient.join(', ')}`)
  }
}

async function main() {
  await mkdir(path.dirname(outputPath), { recursive: true })

  try {
    const parsedSources = []
    for (const source of cefrSources) {
      const text = await fetchText(source)
      parsedSources.push(parseCefrSource(text, source.name))
    }

    const baseEntries = dedupe(parsedSources.flatMap((item) => item.entries))
      .sort((left, right) => left.level.localeCompare(right.level) || left.word.localeCompare(right.word))
    const levelCounts = countLevels(baseEntries)
    assertMinimum(levelCounts, minimumEntriesPerLevel, 'CEFR playable entries')

    const ecdictText = await fetchText(ecdictSource)
    const dictionary = buildEcdictMap(ecdictText, baseEntries)
    const entries = enrichEntries(baseEntries, dictionary)
    const bilingualCounts = countLevels(entries, (entry) => Boolean(entry.translation))
    assertMinimum(bilingualCounts, minimumBilingualCardsPerLevel, 'Chinese bilingual cards')

    const sourceRowCounts = parsedSources.reduce(
      (total, item) => Object.fromEntries(Object.keys(total).map((level) => [level, total[level] + item.sourceCounts[level]])),
      { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 },
    )
    const entriesJson = JSON.stringify(entries)
    const bilingualCardCount = Object.values(bilingualCounts).reduce((sum, count) => sum + count, 0)

    const content = `// Generated by scripts/build-cefr-lexicon.mjs. Do not edit manually.\n` +
      `export type GeneratedCefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'\n` +
      `export type GeneratedCefrEntry = { id: string; word: string; pos: string; level: GeneratedCefrLevel; source: string; topic: string; note: string; phonetic: string; definition: string; translation: string; dictionaryPos: string; exchange: string; tags: string; bnc: number; frq: number; dictionarySource: string }\n` +
      `const CEFR_LEXICON_JSON = ${JSON.stringify(entriesJson)}\n` +
      `export const CEFR_LEXICON = JSON.parse(CEFR_LEXICON_JSON) as GeneratedCefrEntry[]\n` +
      `export const CEFR_LEVEL_COUNTS: Record<GeneratedCefrLevel, number> = ${JSON.stringify(levelCounts)}\n` +
      `export const CEFR_BILINGUAL_COUNTS: Record<GeneratedCefrLevel, number> = ${JSON.stringify(bilingualCounts)}\n` +
      `export const CEFR_BILINGUAL_CARD_COUNT = ${bilingualCardCount}\n` +
      `export const CEFR_SOURCE_ROW_COUNTS: Record<GeneratedCefrLevel, number> = ${JSON.stringify(sourceRowCounts)}\n` +
      `export const CEFR_MIN_ENTRIES_PER_LEVEL = ${minimumEntriesPerLevel}\n` +
      `export const CEFR_MIN_BILINGUAL_CARDS_PER_LEVEL = ${minimumBilingualCardsPerLevel}\n` +
      `export const CEFR_COVERAGE_OK = true\n` +
      `export const CEFR_SOURCE_NOTE = 'CEFR-J Vocabulary Profile 1.5 © Tono Laboratory, TUFS; Octanove Vocabulary Profile C1/C2 1.0, CC BY-SA 4.0.'\n` +
      `export const CEFR_DICTIONARY_NOTE = 'Chinese meanings, phonetics, English definitions and word forms are matched from ECDICT, MIT License.'\n`

    await writeFile(outputPath, content, 'utf8')
    console.log(`[cefr] generated ${entries.length} playable entries`)
    console.log(`[cefr] source rows ${JSON.stringify(sourceRowCounts)}`)
    console.log(`[cefr] playable entries ${JSON.stringify(levelCounts)}`)
    console.log(`[ecdict] bilingual cards ${JSON.stringify(bilingualCounts)}; total=${bilingualCardCount}`)
    console.log(`[coverage] every CEFR level has at least ${minimumEntriesPerLevel} entries and ${minimumBilingualCardsPerLevel} Chinese bilingual cards`)
  } catch (error) {
    console.error(`[cefr] generation failed; refusing to deploy incomplete coverage: ${String(error)}`)
    const fallback = `// Generated fallback because CEFR or bilingual coverage validation failed.\n` +
      `export type GeneratedCefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'\n` +
      `export type GeneratedCefrEntry = { id: string; word: string; pos: string; level: GeneratedCefrLevel; source: string; topic: string; note: string; phonetic: string; definition: string; translation: string; dictionaryPos: string; exchange: string; tags: string; bnc: number; frq: number; dictionarySource: string }\n` +
      `export const CEFR_LEXICON: GeneratedCefrEntry[] = []\n` +
      `export const CEFR_LEVEL_COUNTS: Record<GeneratedCefrLevel, number> = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 }\n` +
      `export const CEFR_BILINGUAL_COUNTS = CEFR_LEVEL_COUNTS\n` +
      `export const CEFR_BILINGUAL_CARD_COUNT = 0\n` +
      `export const CEFR_SOURCE_ROW_COUNTS = CEFR_LEVEL_COUNTS\n` +
      `export const CEFR_MIN_ENTRIES_PER_LEVEL = ${minimumEntriesPerLevel}\n` +
      `export const CEFR_MIN_BILINGUAL_CARDS_PER_LEVEL = ${minimumBilingualCardsPerLevel}\n` +
      `export const CEFR_COVERAGE_OK = false\n` +
      `export const CEFR_SOURCE_NOTE = 'CEFR coverage generation failed.'\n` +
      `export const CEFR_DICTIONARY_NOTE = 'ECDICT bilingual generation failed.'\n`
    await writeFile(outputPath, fallback, 'utf8')
    process.exitCode = 1
  }
}

await main()
