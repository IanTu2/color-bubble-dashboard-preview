import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { formatHistoryYear, historyCategoryZh, historyFallbackCatalog } from '../history-data'
import type { HistoryCatalog, HistoryEvent, HistoryEventNode, HistoryPeriod } from '../history-data'
import { loadHistoryCatalog } from '../services/history'
import { HistoryInteractiveMap, type HistoryMapPoint } from './HistoryInteractiveMap'
import '../history-materials.css'

type View = 'world' | 'period' | 'storyline' | 'event'
const precisionZh = {
  year: '精確至年', month: '精確至月', range: '年代範圍', approximate: '約略年代', unknown: '日期不詳',
}

function loadStoredState(userId: string) {
  try {
    const raw = window.localStorage.getItem(`bubble-space-history-${userId}`)
    if (!raw) return null
    return JSON.parse(raw) as { view?: View; year?: number; period?: string; storyline?: string; event?: string; scroll?: Partial<Record<View, number>> }
  } catch {
    return null
  }
}

function WorldHistoryMap({ catalog, year, onOpenPeriod }: { catalog: HistoryCatalog; year: number; onOpenPeriod: (period: HistoryPeriod) => void }) {
  const activePeriods = catalog.periods.filter((period) => period.startYear <= year && period.endYear >= year)
  const activeEvents = catalog.events.filter((event) => event.storylineSlug === null && event.importance >= 5 && event.startYear <= year && event.endYear >= year && event.latitude !== null && event.longitude !== null)
  const points: HistoryMapPoint[] = [
    ...activePeriods.map((period) => ({ key: period.slug, title: period.titleZh, subtitle: period.dateLabelZh, latitude: period.latitude, longitude: period.longitude, tone: 'period' as const, onClick: () => onOpenPeriod(period) })),
    ...activeEvents.map((event) => {
      const period = catalog.periods.find((item) => item.slug === event.periodSlug)
      return { key: event.slug, title: event.titleZh, subtitle: event.dateLabelZh, latitude: event.latitude!, longitude: event.longitude!, tone: 'event' as const, onClick: period ? () => onOpenPeriod(period) : undefined }
    }),
  ]
  return <div className="history-map-stage"><HistoryInteractiveMap ariaLabel={`${formatHistoryYear(year)}的世界地形地圖`} emptyLabel="此年代的首批資料尚未收錄" mode="world" points={points} /></div>
}

function SourceLinks({ node, catalog }: { node: HistoryEventNode; catalog: HistoryCatalog }) {
  const sources = node.sourceSlugs.map((slug) => catalog.sources.find((source) => source.slug === slug)).filter(Boolean)
  if (sources.length === 0) return <p className="history-source-empty">尚未連結來源</p>
  return <div className="history-source-list">{sources.map((source) => source ? <a key={source.slug} href={source.url} target="_blank" rel="noreferrer">
    <strong>{source.nameZh}</strong><small>{source.locator} · {source.authorOrInstitution}</small>
  </a> : null)}</div>
}

const fallbackGeography: Record<string, string> = {
  'changping-qin-takes-yewang': '野王位於韓國本土通往上黨的南側交通線。秦軍取得野王後，上黨與韓國本土的聯繫被切斷。',
  'changping-fengting-offers-shangdang': '上黨位於太行山區西側高地；南向聯絡中斷後，馮亭轉而尋求東側趙國支援。',
  'changping-zhao-accepts-shangdang': '邯鄲位於太行山東側，上黨在山地另一側；趙國接收上黨，也必須跨越山區投入軍隊維持。',
  'changping-initial-fighting': '長平位於上黨南部，是秦軍北上爭奪上黨與趙軍西進接應之間的交會區。',
  'changping-zhaokuo-replaces-lianpo': '換將決策在趙廷形成，趙括再由邯鄲方向赴長平接掌前線；政治決策與戰場相隔。',
}

function EventGeographyMap({ node, catalog }: { node: HistoryEventNode; catalog: HistoryCatalog }) {
  const relations = catalog.nodePlaces.filter((item) => item.nodeSlug === node.slug)
  const routes = catalog.nodeRoutes.filter((item) => item.nodeSlug === node.slug).sort((a, b) => a.sequence - b.sequence)
  const visibleSlugs = ['xianyang', 'yewang', 'shangdang', 'changping', 'handan']
  const places = visibleSlugs.map((slug) => catalog.places.find((place) => place.slug === slug)).filter(Boolean)
  const relationByPlace = new Map(relations.map((item) => [item.placeSlug, item]))
  const placeBySlug = new Map(catalog.places.map((place) => [place.slug, place]))
  const geographicContext = node.geographicContextZh || fallbackGeography[node.slug] || node.causeZh
  const points: HistoryMapPoint[] = places.flatMap((place) => {
    if (!place) return []
    const relation = relationByPlace.get(place.slug)
    return [{
      key: place.slug,
      title: place.titleZh,
      subtitle: relation?.noteZh || '周邊歷史位置',
      latitude: place.latitude,
      longitude: place.longitude,
      tone: relation?.role ?? 'context',
    }]
  })
  const mappedRoutes = routes.flatMap((route) => {
    const from = placeBySlug.get(route.fromPlaceSlug)
    const to = placeBySlug.get(route.toPlaceSlug)
    return from && to ? [{ ...route, from, to }] : []
  })

  return <section className="history-geography-card" aria-label="事件地理圖">
    <div className="history-geography-head"><div><small>GEOGRAPHIC CONTEXT</small><h3>從世界縮放到事件現場</h3></div><span>拖曳、滾輪縮放，點位停留顯示說明</span></div>
    <HistoryInteractiveMap ariaLabel={`${node.titleZh}的可縮放地形地圖`} focusKey={node.slug} mode="region" points={points} routes={mappedRoutes} />
    <div className="history-geography-meaning"><small>地理意義</small><p>{geographicContext}</p></div>
    <p className="history-geography-caveat">地形來自公開高程資料；古地名與虛線路線僅為概略定位，不把有爭議的古代疆界或行軍線畫成精確結果。</p>
  </section>
}

export function HistoryMaterialsApp({ language, userId }: { language: 'zh' | 'en'; userId: string }) {
  const stored = useMemo(() => loadStoredState(userId), [userId])
  const [catalog, setCatalog] = useState(historyFallbackCatalog)
  const [databaseState, setDatabaseState] = useState<'loading' | 'online' | 'fallback'>('loading')
  const [view, setView] = useState<View>(stored?.view ?? 'world')
  const [year, setYear] = useState(stored?.year ?? -260)
  const [periodSlug, setPeriodSlug] = useState(stored?.period ?? 'warring-states')
  const [storylineSlug, setStorylineSlug] = useState(stored?.storyline ?? 'zhao-mainline')
  const [eventSlug, setEventSlug] = useState(stored?.event ?? 'battle-of-changping')
  const [selectedNodeSlug, setSelectedNodeSlug] = useState('changping-zhaokuo-replaces-lianpo')
  const [category, setCategory] = useState<'all' | HistoryEvent['category']>('all')
  const [ascending, setAscending] = useState(true)
  const contentRef = useRef<HTMLDivElement>(null)
  const scrollByView = useRef<Record<View, number>>({
    world: stored?.scroll?.world ?? 0,
    period: stored?.scroll?.period ?? 0,
    storyline: stored?.scroll?.storyline ?? 0,
    event: stored?.scroll?.event ?? 0,
  })
  const zh = language === 'zh'

  useEffect(() => {
    let active = true
    loadHistoryCatalog().then((remote) => {
      if (!active) return
      if (remote.periods.length && remote.events.length) {
        setCatalog(remote)
        setDatabaseState('online')
      } else {
        setDatabaseState('fallback')
      }
    }).catch(() => { if (active) setDatabaseState('fallback') })
    return () => { active = false }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(`bubble-space-history-${userId}`, JSON.stringify({ view, year, period: periodSlug, storyline: storylineSlug, event: eventSlug, scroll: scrollByView.current }))
  }, [eventSlug, periodSlug, storylineSlug, userId, view, year])

  const navigate = (next: View) => {
    if (contentRef.current) scrollByView.current[view] = contentRef.current.scrollTop
    setView(next)
  }

  useLayoutEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = scrollByView.current[view]
  }, [view])

  const period = catalog.periods.find((item) => item.slug === periodSlug) ?? catalog.periods[0]
  const storyline = catalog.storylines.find((item) => item.slug === storylineSlug)
  const event = catalog.events.find((item) => item.slug === eventSlug)
  const nodes = catalog.nodes.filter((node) => node.eventSlug === eventSlug).sort((a, b) => a.sequence - b.sequence)
  const selectedNode = nodes.find((node) => node.slug === selectedNodeSlug) ?? nodes[0]
  const storylineEvents = catalog.events
    .filter((item) => item.storylineSlug === storylineSlug && (category === 'all' || item.category === category))
    .sort((a, b) => ascending ? a.sequence - b.sequence : b.sequence - a.sequence)

  const openPeriod = (nextPeriod: HistoryPeriod) => { setPeriodSlug(nextPeriod.slug); navigate('period') }
  const openStoryline = (slug: string, status: 'published' | 'planned') => {
    if (status === 'planned') return
    setStorylineSlug(slug)
    navigate('storyline')
  }
  const openEvent = (nextEvent: HistoryEvent) => {
    setEventSlug(nextEvent.slug)
    const first = catalog.nodes.filter((node) => node.eventSlug === nextEvent.slug).sort((a, b) => a.sequence - b.sequence)[0]
    setSelectedNodeSlug(first?.slug ?? '')
    navigate('event')
  }

  const milestones = [
    { year: -221, label: '秦統一六國' }, { year: 1914, label: '一戰' }, { year: 1939, label: '二戰' },
  ]

  return <div className={`history-app history-view-${view}`}>
    <header className="history-app-header">
      <div className="history-app-title"><span>史</span><div><small>{zh ? '輔助教材區' : 'Learning materials'}</small><strong>{zh ? '世界歷史地圖' : 'World history map'}</strong></div></div>
      <nav className="history-levels" aria-label={zh ? '歷史教材層級' : 'History levels'}>
        {(['world', 'period', 'storyline', 'event'] as View[]).map((item, index) => <button key={item} type="button" className={view === item ? 'active' : ''} disabled={index > ['world', 'period', 'storyline', 'event'].indexOf(view)} onClick={() => navigate(item)}>{index + 1}<span>{zh ? ['世界', '時期', '細項', '詳情'][index] : ['World', 'Period', 'Events', 'Detail'][index]}</span></button>)}
      </nav>
      <span className={`history-database-state ${databaseState}`}>{databaseState === 'online' ? 'Supabase' : databaseState === 'loading' ? '同步中' : '離線教材'}</span>
    </header>

    <div className="history-app-content" ref={contentRef} onScroll={(event) => { scrollByView.current[view] = event.currentTarget.scrollTop }}>
      {databaseState === 'fallback' ? <div className="history-data-notice" role="status">資料庫暫時無法讀取，目前顯示內建的已查證教材。</div> : null}

      {view === 'world' ? <main className="history-world-view">
        <div className="history-world-heading"><div><small>GLOBAL HISTORY</small><h1>拖動年代，看同一刻的世界</h1></div><strong>{formatHistoryYear(year)}</strong></div>
        <WorldHistoryMap catalog={catalog} year={year} onOpenPeriod={openPeriod} />
        <section className="history-global-timeline">
          <div className="history-milestones">{milestones.map((milestone) => <button key={milestone.year} type="button" style={{ left: `${((milestone.year + 3000) / 5025) * 100}%` }} onClick={() => setYear(milestone.year)}>{milestone.label}<small>{formatHistoryYear(milestone.year)}</small></button>)}</div>
          <label htmlFor="history-year-range">全球時間軸 <output>{formatHistoryYear(year)}</output></label>
          <input id="history-year-range" type="range" min="-3000" max="2025" value={year} onChange={(e) => setYear(Number(e.target.value))} />
          <div className="history-range-labels"><span>前 3000</span><span>古典</span><span>中世紀</span><span>近現代</span><span>現在</span></div>
        </section>
      </main> : null}

      {view === 'period' && period ? <main className="history-layer-view">
        <nav className="history-breadcrumb"><button type="button" onClick={() => navigate('world')}>← 世界地圖</button><span>/</span><strong>{period.titleZh}</strong></nav>
        <section className="history-period-summary"><div><small>{period.dateLabelZh}</small><h1>{period.titleZh}</h1><p>{period.summaryZh}</p></div><div className="history-period-key"><span>範圍</span><strong>東亞 · 戰國諸國</strong><span>目前收錄</span><strong>趙國主線／長平之戰</strong></div></section>
        <div className="history-section-heading"><div><small>MAJOR STORYLINES</small><h2>選擇大事件線</h2></div><span>其他主線會逐步查證收錄</span></div>
        <div className="history-storyline-grid">{catalog.storylines.filter((item) => item.periodSlug === period.slug).map((item) => <button type="button" key={item.slug} className={item.status === 'published' ? 'published' : 'planned'} onClick={() => openStoryline(item.slug, item.status)}>
          <time>{item.dateLabelZh}</time><strong>{item.titleZh}{item.status === 'published' ? ' →' : ''}</strong><span>{item.summaryZh}</span>{item.status === 'planned' ? <em>尚未收錄</em> : null}
        </button>)}</div>
      </main> : null}

      {view === 'storyline' && storyline ? <main className="history-layer-view">
        <nav className="history-breadcrumb"><button type="button" onClick={() => navigate('world')}>世界地圖</button><span>/</span><button type="button" onClick={() => navigate('period')}>{period?.titleZh}</button><span>/</span><strong>{storyline.titleZh}</strong></nav>
        <div className="history-list-heading"><div><small>{storyline.dateLabelZh}</small><h1>{storyline.titleZh}</h1></div><div className="history-list-controls"><label>類型<select value={category} onChange={(e) => setCategory(e.target.value as typeof category)}><option value="all">全部</option>{Object.entries(historyCategoryZh).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><button type="button" onClick={() => setAscending((value) => !value)}>{ascending ? '由早到晚' : '由晚到早'} ↕</button></div></div>
        <div className="history-event-list" role="list">{storylineEvents.map((item) => <button type="button" role="listitem" key={item.slug} onClick={() => openEvent(item)}>
          <time>{item.dateLabelZh}<small>{precisionZh[item.datePrecision]}</small></time><span className="history-event-category">{historyCategoryZh[item.category]}</span><span className="history-event-name"><strong>{item.titleZh}</strong><small>{item.summaryZh}</small></span><span className="history-event-place"><strong>{item.placeNameZh}</strong><small>{item.peopleZh.join('、') || '人物尚待整理'}</small></span><span className="history-event-open">{item.detailStatus === 'published' ? '查看 →' : '尚未收錄'}</span>
        </button>)}</div>
        {storylineEvents.length === 0 ? <p className="history-empty-state">此分類尚未收錄事件。</p> : null}
      </main> : null}

      {view === 'event' && event ? <main className="history-layer-view history-event-detail">
        <nav className="history-breadcrumb"><button type="button" onClick={() => navigate('world')}>世界地圖</button><span>/</span><button type="button" onClick={() => navigate('period')}>{period?.titleZh}</button><span>/</span><button type="button" onClick={() => navigate('storyline')}>{storyline?.titleZh}</button><span>/</span><strong>{event.titleZh}</strong></nav>
        <header className="history-detail-heading"><div><small>{event.dateLabelZh} · {event.placeNameZh}</small><h1>{event.titleZh}</h1><p>{event.summaryZh}</p></div><span>{nodes.length ? `${nodes.length} 個內部節點` : '尚未收錄詳情'}</span></header>
        {nodes.length && selectedNode ? <div className="history-detail-grid">
          <section className="history-node-timeline"><div className="history-node-head"><h2>事件內部時間軸</h2><span>日期不詳時不強行補足</span></div>{nodes.map((node) => <button type="button" key={node.slug} className={selectedNode.slug === node.slug ? 'active' : ''} onClick={() => setSelectedNodeSlug(node.slug)}><time>{node.dateLabelZh}</time><i aria-hidden="true"/><span><strong>{node.titleZh}</strong><small>{node.consequenceZh}</small></span></button>)}</section>
          <article className="history-node-detail" aria-live="polite">
            <header><span>{selectedNode.dateLabelZh} · {precisionZh[selectedNode.datePrecision]}</span><h2>{selectedNode.titleZh}</h2><p>{selectedNode.placeNameZh} · {selectedNode.peopleZh.join('、')}</p></header>
            <EventGeographyMap node={selectedNode} catalog={catalog} />
            <section><h3>發生了什麼</h3><p>{selectedNode.descriptionZh}</p></section>
            <section><h3>為什麼發生</h3><p>{selectedNode.causeZh}</p></section>
            <section className="history-cause-chain"><h3>前因與後續</h3><div><span><small>前因</small>{selectedNode.previousContextZh}</span><b>→</b><span><small>本事件</small>{selectedNode.titleZh}</span><b>→</b><span><small>後續</small>{selectedNode.consequenceZh}</span></div></section>
            <section><h3>史料限制／不同解讀</h3><p>{selectedNode.disputeZh}</p></section>
            <section><h3>資料來源</h3><SourceLinks node={selectedNode} catalog={catalog} /></section>
          </article>
        </div> : <div className="history-empty-state"><h2>尚未收錄</h2><p>此事件的詳細內容仍待史料查證。</p><button type="button" onClick={() => navigate('storyline')}>返回事件細項</button></div>}
      </main> : null}
    </div>
  </div>
}
