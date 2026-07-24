import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { Language } from '../types'

type SearchEngine = 'google' | 'duckduckgo' | 'bing'

type SearchHistoryItem = {
  query: string
  engine: SearchEngine
  createdAt: string
}

type SearchAppProps = {
  language: Language
  userId: string
  instanceId: string
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const stored = window.localStorage.getItem(key)
    return stored ? (JSON.parse(stored) as T) : fallback
  } catch {
    return fallback
  }
}

export function SearchApp({ language, userId, instanceId }: SearchAppProps) {
  const historyKey = `bubble-space-v2-search-history-${userId}`
  const draftKey = `bubble-space-v2-search-draft-${userId}-${instanceId}`
  const [engine, setEngine] = useState<SearchEngine>('google')
  const [query, setQuery] = useState(() => window.sessionStorage.getItem(draftKey) ?? '')
  const [history, setHistory] = useState<SearchHistoryItem[]>(() => readJson(historyKey, []))

  const copy = language === 'zh'
    ? {
        title: '搜尋工作視窗',
        hint: '每個搜尋視窗都能保留自己的關鍵字。現階段結果會在新分頁開啟；之後接搜尋 API 或反向代理時，結果區會直接放進這個視窗。',
        query: '輸入搜尋關鍵字',
        search: '搜尋',
        history: '搜尋紀錄',
        clear: '清除紀錄',
        empty: '尚無搜尋紀錄',
        future: '網站內搜尋結果區（下一階段）',
      }
    : {
        title: 'Search workspace',
        hint: 'Each search window keeps its own query. Results open in a new tab for now; an API or reverse proxy can later render them inside this window.',
        query: 'Enter search keywords',
        search: 'Search',
        history: 'Search history',
        clear: 'Clear history',
        empty: 'No search history yet',
        future: 'Embedded result area (next phase)',
      }

  useEffect(() => {
    window.localStorage.setItem(historyKey, JSON.stringify(history))
  }, [history, historyKey])

  useEffect(() => {
    window.sessionStorage.setItem(draftKey, query)
  }, [draftKey, query])

  const runSearch = (searchQuery: string, selectedEngine = engine) => {
    const trimmed = searchQuery.trim()
    if (!trimmed) return
    const encoded = encodeURIComponent(trimmed)
    const url = selectedEngine === 'google'
      ? `https://www.google.com/search?q=${encoded}`
      : selectedEngine === 'duckduckgo'
        ? `https://duckduckgo.com/?q=${encoded}`
        : `https://www.bing.com/search?q=${encoded}`

    window.open(url, '_blank', 'noopener,noreferrer')
    setHistory((current) => [
      { query: trimmed, engine: selectedEngine, createdAt: new Date().toISOString() },
      ...current.filter((item) => item.query !== trimmed || item.engine !== selectedEngine),
    ].slice(0, 30))
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    runSearch(query)
  }

  return (
    <section className="desktop-search-app">
      <div className="desktop-search-card">
        <p className="eyebrow">BUBBLE SEARCH</p>
        <h2>{copy.title}</h2>
        <p>{copy.hint}</p>
        <form onSubmit={submit}>
          <select value={engine} onChange={(event) => setEngine(event.target.value as SearchEngine)}>
            <option value="google">Google</option>
            <option value="duckduckgo">DuckDuckGo</option>
            <option value="bing">Bing</option>
          </select>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.query}
            autoFocus
          />
          <button className="primary-button" type="submit">{copy.search} ↗</button>
        </form>
      </div>

      <div className="desktop-search-result-placeholder">
        <span>⌕</span>
        <strong>{copy.future}</strong>
      </div>

      <div className="desktop-search-history">
        <div className="desktop-search-history-head">
          <h3>{copy.history}</h3>
          <button type="button" onClick={() => setHistory([])}>{copy.clear}</button>
        </div>
        {history.length === 0 ? <p className="desktop-app-empty">{copy.empty}</p> : null}
        {history.map((item) => (
          <button
            className="desktop-search-history-row"
            type="button"
            key={`${item.createdAt}-${item.engine}-${item.query}`}
            onClick={() => {
              setEngine(item.engine)
              setQuery(item.query)
              runSearch(item.query, item.engine)
            }}
          >
            <small>{item.engine}</small>
            <strong>{item.query}</strong>
            <span>↗</span>
          </button>
        ))}
      </div>
    </section>
  )
}
