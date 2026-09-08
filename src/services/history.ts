import { supabase } from '../lib/supabase'
import type { DatePrecision, HistoryCatalog, HistoryEvent, HistoryEventNode, HistoryPeriod, HistorySource, HistoryStoryline } from '../history-data'

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
    sourceSlugs: stringArray(row.source_slugs),
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

export async function loadHistoryCatalog(): Promise<HistoryCatalog> {
  const [periodsResult, storylinesResult, eventsResult, nodesResult, sourcesResult] = await Promise.all([
    supabase.from('history_periods').select('*').eq('is_published', true).order('start_year'),
    supabase.from('history_storylines').select('*').order('sequence'),
    supabase.from('history_events').select('*').eq('is_published', true).order('sequence'),
    supabase.from('history_event_nodes').select('*').eq('is_published', true).order('sequence'),
    supabase.from('history_sources').select('*').order('name_zh'),
  ])

  const failure = [periodsResult.error, storylinesResult.error, eventsResult.error, nodesResult.error, sourcesResult.error].find(Boolean)
  if (failure) throw new Error(failure.message)

  return {
    periods: (periodsResult.data ?? []).map((row) => mapPeriod(row as Row)),
    storylines: (storylinesResult.data ?? []).map((row) => mapStoryline(row as Row)),
    events: (eventsResult.data ?? []).map((row) => mapEvent(row as Row)),
    nodes: (nodesResult.data ?? []).map((row) => mapNode(row as Row)),
    sources: (sourcesResult.data ?? []).map((row) => mapSource(row as Row)),
  }
}
