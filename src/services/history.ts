import { supabase } from '../lib/supabase'
import type { DatePrecision, HistoryCatalog, HistoryEvent, HistoryEventNode, HistoryMapLayer, HistoryNodePlace, HistoryNodeRoute, HistoryPeriod, HistoryPlace, HistorySource, HistoryStoryline } from '../history-data'

type Row = Record<string, unknown>

const text = (value: unknown) => typeof value === 'string' ? value : ''
const number = (value: unknown) => typeof value === 'number' ? value : Number(value)
const nullableNumber = (value: unknown) => value === null || value === undefined ? null : number(value)
const stringArray = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []

function mapPeriod(row: Row): HistoryPeriod {
  return {
    slug: text(row.slug), titleZh: text(row.title_zh), titleEn: text(row.title_en),
    startYear: number(row.start_year), endYear: number(row.end_year), dateLabelZh: text(row.date_label_zh),
    summaryZh: text(row.summary_zh), latitude: number(row.latitude), longitude: number(row.longitude), importance: number(row.importance),
  }
}

function mapStoryline(row: Row): HistoryStoryline {
  return {
    slug: text(row.slug), periodSlug: text(row.period_slug), titleZh: text(row.title_zh), titleEn: text(row.title_en),
    dateLabelZh: text(row.date_label_zh), summaryZh: text(row.summary_zh), sequence: number(row.sequence),
    status: text(row.status) === 'published' ? 'published' : 'planned',
  }
}

function mapEvent(row: Row): HistoryEvent {
  return {
    slug: text(row.slug), periodSlug: text(row.period_slug), storylineSlug: row.storyline_slug === null ? null : text(row.storyline_slug),
    titleZh: text(row.title_zh), titleEn: text(row.title_en), startYear: number(row.start_year), endYear: number(row.end_year),
    dateLabelZh: text(row.date_label_zh), datePrecision: text(row.date_precision) as DatePrecision,
    category: text(row.category) as HistoryEvent['category'], summaryZh: text(row.summary_zh), placeNameZh: text(row.place_name_zh),
    latitude: nullableNumber(row.latitude), longitude: nullableNumber(row.longitude), peopleZh: stringArray(row.people_zh),
    importance: number(row.importance), sequence: number(row.sequence), detailStatus: text(row.detail_status) === 'published' ? 'published' : 'planned',
  }
}

function mapNode(row: Row): HistoryEventNode {
  return {
    slug: text(row.slug), eventSlug: text(row.event_slug), sequence: number(row.sequence), dateLabelZh: text(row.date_label_zh),
    datePrecision: text(row.date_precision) as DatePrecision, titleZh: text(row.title_zh), placeNameZh: text(row.place_name_zh),
    peopleZh: stringArray(row.people_zh), descriptionZh: text(row.description_zh), causeZh: text(row.cause_zh),
    previousContextZh: text(row.previous_context_zh), consequenceZh: text(row.consequence_zh), disputeZh: text(row.dispute_zh),
    sourceSlugs: stringArray(row.source_slugs), geographicContextZh: text(row.geographic_context_zh),
  }
}

function mapPlace(row: Row): HistoryPlace {
  return {
    slug: text(row.slug), titleZh: text(row.title_zh), latitude: number(row.latitude), longitude: number(row.longitude),
    locationPrecision: text(row.location_precision) as HistoryPlace['locationPrecision'],
  }
}

function mapNodePlace(row: Row): HistoryNodePlace {
  return {
    nodeSlug: text(row.node_slug), placeSlug: text(row.place_slug), role: text(row.role) as HistoryNodePlace['role'],
    sequence: number(row.sequence), noteZh: text(row.note_zh),
  }
}

function mapNodeRoute(row: Row): HistoryNodeRoute {
  return {
    nodeSlug: text(row.node_slug), sequence: number(row.sequence), fromPlaceSlug: text(row.from_place_slug),
    toPlaceSlug: text(row.to_place_slug), routeKind: text(row.route_kind) as HistoryNodeRoute['routeKind'],
    labelZh: text(row.label_zh), isApproximate: Boolean(row.is_approximate),
  }
}

function mapSource(row: Row): HistorySource {
  return {
    slug: text(row.slug), nameZh: text(row.name_zh), authorOrInstitution: text(row.author_or_institution),
    workTitle: text(row.work_title), locator: text(row.locator), url: text(row.url),
    sourceType: text(row.source_type) as HistorySource['sourceType'], reliability: text(row.reliability) as HistorySource['reliability'],
    accessedAt: text(row.accessed_at),
  }
}

function mapLayer(row: Row): HistoryMapLayer {
  return {
    slug: text(row.slug), periodSlug: text(row.period_slug), titleZh: text(row.title_zh),
    startYear: number(row.start_year), endYear: number(row.end_year), tileTemplate: text(row.tile_template),
    minZoom: number(row.min_zoom), maxZoom: number(row.max_zoom),
    bounds: [number(row.bounds_west), number(row.bounds_south), number(row.bounds_east), number(row.bounds_north)],
    attributionZh: text(row.attribution_zh), sourceUrl: text(row.source_url), opacity: number(row.opacity),
    coverageNoteZh: text(row.coverage_note_zh), isPublished: Boolean(row.is_published),
  }
}

export async function loadHistoryCatalog(): Promise<HistoryCatalog> {
  const [periodsResult, storylinesResult, eventsResult, nodesResult, sourcesResult, placesResult, nodePlacesResult, nodeRoutesResult, mapLayersResult] = await Promise.all([
    supabase.from('history_periods').select('*').eq('is_published', true).order('start_year'),
    supabase.from('history_storylines').select('*').order('sequence'),
    supabase.from('history_events').select('*').eq('is_published', true).order('sequence'),
    supabase.from('history_event_nodes').select('*').eq('is_published', true).order('sequence'),
    supabase.from('history_sources').select('*').order('name_zh'),
    supabase.from('history_places').select('slug,title_zh,latitude,longitude,location_precision').order('title_zh'),
    supabase.from('history_event_node_places').select('*').eq('is_published', true).order('sequence'),
    supabase.from('history_event_node_routes').select('*').eq('is_published', true).order('sequence'),
    supabase.from('history_map_layers').select('*').eq('is_published', true).order('start_year'),
  ])

  const failure = [periodsResult.error, storylinesResult.error, eventsResult.error, nodesResult.error, sourcesResult.error, placesResult.error, nodePlacesResult.error, nodeRoutesResult.error, mapLayersResult.error].find(Boolean)
  if (failure) throw new Error(failure.message)

  return {
    periods: (periodsResult.data ?? []).map((row) => mapPeriod(row as Row)),
    storylines: (storylinesResult.data ?? []).map((row) => mapStoryline(row as Row)),
    events: (eventsResult.data ?? []).map((row) => mapEvent(row as Row)),
    nodes: (nodesResult.data ?? []).map((row) => mapNode(row as Row)),
    sources: (sourcesResult.data ?? []).map((row) => mapSource(row as Row)),
    places: (placesResult.data ?? []).map((row) => mapPlace(row as Row)),
    nodePlaces: (nodePlacesResult.data ?? []).map((row) => mapNodePlace(row as Row)),
    nodeRoutes: (nodeRoutesResult.data ?? []).map((row) => mapNodeRoute(row as Row)),
    mapLayers: (mapLayersResult.data ?? []).map((row) => mapLayer(row as Row)),
  }
}
