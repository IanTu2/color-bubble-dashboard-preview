import { useEffect, useMemo, useState } from 'react'
import { ENGLISH_WORDS } from '../english-data'
import {
  CEFR_BILINGUAL_CARD_COUNT,
  CEFR_BILINGUAL_COUNTS,
  CEFR_DICTIONARY_NOTE,
  CEFR_LEXICON,
  CEFR_MIN_BILINGUAL_CARDS_PER_LEVEL,
  CEFR_SOURCE_NOTE,
} from '../generated/cefr-lexicon'
import type { GeneratedCefrEntry, GeneratedCefrLevel } from '../generated/cefr-lexicon'
import { speakEnglish } from '../english-learning'
import type { LearnerProfile } from '../english-learning'
import type { Language } from '../types'

type Props = {
  language: Language
  profile: LearnerProfile
}

type LevelFilter = 'ALL' | GeneratedCefrLevel

const LEVELS: GeneratedCefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const PAGE_SIZE = 90

const exchangeLabels: Record<string, { zh: string; en: string }> = {
  p: { zh: '過去式', en: 'past tense' },
  d: { zh: '過去分詞', en: 'past participle' },
  i: { zh: '現在分詞', en: 'present participle' },
  '3': { zh: '第三人稱單數', en: 'third-person singular' },
  r: { zh: '比較級', en: 'comparative' },
  t: { zh: '最高級', en: 'superlative' },
  s: { zh: '複數', en: 'plural' },
  '0': { zh: '原形', en: 'lemma' },
  '1': { zh: '變化形式', en: 'derived form' },
}

function lines(value: string) {
  return value
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function primaryMeaning(entry: GeneratedCefrEntry) {
  return lines(entry.translation).find((item) => !/^\[網路\]|^\[网络\]/.test(item)) ?? entry.translation.trim()
}

function wordForms(exchange: string, language: Language) {
  return exchange
    .split('/')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const separator = item.indexOf(':')
      if (separator < 0) return { label: language === 'zh' ? '變化形式' : 'word form', value: item }
      const code = item.slice(0, separator)
      const value = item.slice(separator + 1)
      const label = exchangeLabels[code]
      return { label: label ? label[language] : code, value }
    })
}

export function EnglishBilingualCardLibrary({ language, profile }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [level, setLevel] = useState<LevelFilter>('ALL')
  const [page, setPage] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    setPage(0)
  }, [level, query])

  useEffect(() => {
    if (!open) setSelectedId(null)
  }, [open])

  const bilingualEntries = useMemo(
    () => CEFR_LEXICON.filter((entry) => Boolean(entry.translation)),
    [],
  )

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return bilingualEntries.filter((entry) => {
      if (level !== 'ALL' && entry.level !== level) return false
      if (!normalized) return true
      return `${entry.word} ${entry.translation} ${entry.definition} ${entry.pos} ${entry.topic} ${entry.tags}`
        .toLowerCase()
        .includes(normalized)
    })
  }, [bilingualEntries, level, query])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const visible = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const selected = selectedId ? CEFR_LEXICON.find((entry) => entry.id === selectedId) ?? null : null
  const curated = selected
    ? ENGLISH_WORDS.find((word) => word.word.toLowerCase() === selected.word.toLowerCase()) ?? null
    : null
  const selectedForms = selected ? wordForms(selected.exchange, language) : []

  const copy = language === 'zh'
    ? {
        launcher: `雙語卡 ${CEFR_BILINGUAL_CARD_COUNT.toLocaleString()}`,
        title: 'CEFR 中英雙語學習卡',
        subtitle: '每級至少 1,000 張；可搜尋中文意思、英文定義、詞性、主題與詞形變化。',
        search: '搜尋英文、中文、定義、詞性或主題',
        all: '全部',
        close: '關閉',
        previous: '上一頁',
        next: '下一頁',
        pronunciation: '播放發音',
        chinese: '中文釋義',
        definition: '英文解釋',
        forms: '詞形變化',
        metadata: '分級資料',
        curated: '人工深度補充',
        noResult: '找不到符合的雙語卡。',
        coverage: `建置規則：A1～C2 每級至少 ${CEFR_MIN_BILINGUAL_CARDS_PER_LEVEL.toLocaleString()} 張有中文釋義的卡，低於門檻就停止建置。`,
      }
    : {
        launcher: `${CEFR_BILINGUAL_CARD_COUNT.toLocaleString()} bilingual cards`,
        title: 'CEFR English–Chinese learning cards',
        subtitle: 'At least 1,000 cards per level, searchable by meaning, definition, POS, topic, and word forms.',
        search: 'Search word, Chinese meaning, definition, POS, or topic',
        all: 'All',
        close: 'Close',
        previous: 'Previous',
        next: 'Next',
        pronunciation: 'Play pronunciation',
        chinese: 'Chinese meanings',
        definition: 'English definitions',
        forms: 'Word forms',
        metadata: 'Level metadata',
        curated: 'Human-curated extras',
        noResult: 'No matching bilingual cards.',
        coverage: `Build rule: every CEFR level must contain at least ${CEFR_MIN_BILINGUAL_CARDS_PER_LEVEL.toLocaleString()} cards with Chinese meanings.`,
      }

  return (
    <>
      <button className="bilingual-library-launcher" type="button" onClick={() => setOpen(true)}>
        中英 · {copy.launcher}
      </button>

      {open ? (
        <div className="bilingual-library-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
          <section className="bilingual-library-panel" onMouseDown={(event) => event.stopPropagation()}>
            <header className="bilingual-library-header">
              <div>
                <p className="eyebrow">BUBBLE ENGLISH · ECDICT</p>
                <h2>{copy.title}</h2>
                <p>{copy.subtitle}</p>
              </div>
              <button type="button" aria-label={copy.close} onClick={() => setOpen(false)}>×</button>
            </header>

            <div className="bilingual-library-toolbar">
              <input value={query} placeholder={copy.search} onChange={(event) => setQuery(event.target.value)} />
              <div className="english-chip-grid">
                <button className={level === 'ALL' ? 'active' : ''} type="button" onClick={() => setLevel('ALL')}>
                  {copy.all} · {CEFR_BILINGUAL_CARD_COUNT.toLocaleString()}
                </button>
                {LEVELS.map((item) => (
                  <button className={level === item ? 'active' : ''} type="button" key={item} onClick={() => setLevel(item)}>
                    {item} · {CEFR_BILINGUAL_COUNTS[item].toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <p className="bilingual-coverage-note">{copy.coverage}</p>

            <div className="bilingual-card-grid">
              {visible.length === 0 ? <p>{copy.noResult}</p> : visible.map((entry) => (
                <button type="button" key={entry.id} onClick={() => setSelectedId(entry.id)}>
                  <div><strong>{entry.word}</strong><span>{entry.level}</span></div>
                  <p>{primaryMeaning(entry)}</p>
                  <small>{entry.phonetic ? `/${entry.phonetic}/ · ` : ''}{entry.pos}</small>
                </button>
              ))}
            </div>

            <footer className="bilingual-library-footer">
              <button type="button" disabled={page <= 0} onClick={() => setPage((current) => Math.max(0, current - 1))}>{copy.previous}</button>
              <span>{page + 1} / {pageCount} · {filtered.length.toLocaleString()}</span>
              <button type="button" disabled={page >= pageCount - 1} onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}>{copy.next}</button>
            </footer>

            <small className="bilingual-source-note">{CEFR_SOURCE_NOTE} {CEFR_DICTIONARY_NOTE}</small>
          </section>
        </div>
      ) : null}

      {open && selected ? (
        <div className="word-detail-backdrop bilingual-card-detail-backdrop" role="presentation" onMouseDown={() => setSelectedId(null)}>
          <article className="word-detail bilingual-card-detail" onMouseDown={(event) => event.stopPropagation()}>
            <header>
              <div>
                <p className="eyebrow">{curated ? 'HUMAN CURATED + ECDICT' : 'ECDICT BILINGUAL CARD'}</p>
                <h3>{selected.word}</h3>
                <span>{selected.phonetic ? `/${selected.phonetic}/ · ` : ''}{selected.level} · {selected.pos}</span>
              </div>
              <button type="button" aria-label={copy.close} onClick={() => setSelectedId(null)}>×</button>
            </header>

            <section className="bilingual-detail-section">
              <h4>{copy.chinese}</h4>
              <div className="bilingual-definition-lines">{lines(selected.translation).map((item) => <p key={item}>{item}</p>)}</div>
            </section>

            {selected.definition ? (
              <section className="bilingual-detail-section">
                <h4>{copy.definition}</h4>
                <div className="bilingual-definition-lines">{lines(selected.definition).map((item) => <p key={item}>{item}</p>)}</div>
              </section>
            ) : null}

            <div className="word-detail-grid">
              <section>
                <h4>{copy.metadata}</h4>
                <p>{selected.level} · {selected.pos}</p>
                <small>{selected.topic || selected.note || selected.source}</small>
              </section>
              <section>
                <h4>{copy.forms}</h4>
                {selectedForms.length > 0
                  ? selectedForms.map((item) => <p key={`${item.label}-${item.value}`}><strong>{item.label}</strong>：{item.value}</p>)
                  : <p>—</p>}
              </section>
            </div>

            {curated ? (
              <section className="bilingual-detail-section curated-extra-section">
                <h4>{copy.curated}</h4>
                <p><strong>{curated.meaning}</strong> · {curated.partOfSpeech}</p>
                <p>{curated.definition}</p>
                <blockquote>{curated.example}<small>{curated.exampleZh}</small></blockquote>
                <p>{curated.collocations.join(' · ')}</p>
              </section>
            ) : null}

            <button className="listen-button" type="button" onClick={() => speakEnglish(selected.word, profile.accent)}>🔊 {copy.pronunciation}</button>
          </article>
        </div>
      ) : null}
    </>
  )
}
