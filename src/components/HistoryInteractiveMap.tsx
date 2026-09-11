import { useEffect, useRef, useState } from 'react'
import * as maplibregl from 'maplibre-gl'
import type { Map as MapLibreMap, Marker as MapLibreMarker } from 'maplibre-gl'
import type { FeatureCollection, LineString, Point } from 'geojson'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { HistoryMapLayer, HistoryNodeRoute, HistoryPlace } from '../history-data'

const OPEN_FREE_MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty'
const MAPTERHORN_DEM = 'https://tiles.mapterhorn.com/tilejson.json'

export type HistoryMapPoint = {
  key: string
  title: string
  subtitle: string
  longitude: number
  latitude: number
  tone?: 'period' | 'event' | 'focus' | 'context' | 'origin' | 'destination' | 'blocked'
  onClick?: () => void
}

export type HistoryBoundaryLabel = {
  key: string
  title: string
  longitude: number
  latitude: number
  color?: string
}

type RouteWithPlaces = HistoryNodeRoute & { from: HistoryPlace; to: HistoryPlace }

type Props = {
  ariaLabel: string
  points: HistoryMapPoint[]
  routes?: RouteWithPlaces[]
  mode: 'world' | 'region'
  historicalLayer?: HistoryMapLayer
  historicalLabels?: HistoryBoundaryLabel[]
  modernLabels?: HistoryBoundaryLabel[]
  focusKey?: string
  emptyLabel?: string
}

const MODERN_BOUNDARY_LAYERS = ['boundary_3', 'boundary_2', 'boundary_disputed']
const MODERN_LABEL_LAYERS = ['label_state', 'label_country_3', 'label_country_2', 'label_country_1']

function boundaryLabelCollection(labels: HistoryBoundaryLabel[]): FeatureCollection<Point> {
  return {
    type: 'FeatureCollection',
    features: labels.map((label) => ({
      type: 'Feature',
      properties: { title: label.title, color: label.color ?? '#173047' },
      geometry: { type: 'Point', coordinates: [label.longitude, label.latitude] },
    })),
  }
}

function applyBoundaryMode(map: MapLibreMap, mode: 'modern' | 'historical') {
  const visibility = mode === 'modern' ? 'visible' : 'none'
  const modernLayers = [...MODERN_BOUNDARY_LAYERS, ...MODERN_LABEL_LAYERS]
  modernLayers.forEach((id) => {
    if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', visibility)
  })
  if (map.getLayer('boundary_2')) {
    map.setPaintProperty('boundary_2', 'line-color', '#d54462')
    map.setPaintProperty('boundary_2', 'line-width', ['interpolate', ['linear'], ['zoom'], 1, 1.25, 5, 2.2, 10, 4])
  }
  if (map.getLayer('boundary_3')) {
    map.setPaintProperty('boundary_3', 'line-color', '#536dde')
    map.setPaintProperty('boundary_3', 'line-dasharray', [2, 1])
    map.setPaintProperty('boundary_3', 'line-width', ['interpolate', ['linear'], ['zoom'], 5, 1.4, 9, 2.6])
  }
  MODERN_LABEL_LAYERS.forEach((id) => {
    if (!map.getLayer(id)) return
    map.setPaintProperty(id, 'text-color', '#18243a')
    map.setPaintProperty(id, 'text-halo-color', '#ffffff')
    map.setPaintProperty(id, 'text-halo-width', 2)
  })
}

function routeColor(kind: HistoryNodeRoute['routeKind']) {
  if (kind === 'blocked') return '#ef6f82'
  if (kind === 'transfer') return '#967cff'
  if (kind === 'command') return '#f0c870'
  return '#69dfcc'
}

function routeCollection(routes: RouteWithPlaces[]): FeatureCollection<LineString> {
  return {
    type: 'FeatureCollection',
    features: routes.map((route) => ({
      type: 'Feature',
      properties: {
        label: route.labelZh,
        color: routeColor(route.routeKind),
        approximate: route.isApproximate,
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [route.from.longitude, route.from.latitude],
          [route.to.longitude, route.to.latitude],
        ],
      },
    })),
  }
}

function markerElement(point: HistoryMapPoint) {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = `history-map-pin tone-${point.tone ?? 'context'}`
  button.setAttribute('aria-label', `${point.title}｜${point.subtitle}`)
  const dot = document.createElement('i')
  dot.setAttribute('aria-hidden', 'true')
  const tooltip = document.createElement('span')
  tooltip.setAttribute('role', 'tooltip')
  const title = document.createElement('strong')
  title.textContent = point.title
  const subtitle = document.createElement('small')
  subtitle.textContent = point.subtitle
  tooltip.append(title, subtitle)
  button.append(dot, tooltip)
  const keepMarkerGesture = (event: Event) => event.stopPropagation()
  button.addEventListener('pointerdown', keepMarkerGesture)
  button.addEventListener('pointerup', keepMarkerGesture)
  button.addEventListener('mousedown', keepMarkerGesture)
  button.addEventListener('touchstart', keepMarkerGesture, { passive: true })
  if (point.onClick) {
    button.classList.add('is-actionable')
    button.addEventListener('click', (event) => {
      event.preventDefault()
      event.stopPropagation()
      point.onClick?.()
    })
  }
  return button
}

function fitPoints(map: MapLibreMap, points: HistoryMapPoint[], mode: Props['mode']) {
  if (mode === 'world') {
    map.jumpTo({ center: [15, 22], zoom: 1.15, pitch: 0, bearing: 0 })
    return
  }
  if (!points.length) return
  if (points.length === 1) {
    map.flyTo({ center: [points[0].longitude, points[0].latitude], zoom: 8.2, pitch: 42, essential: true })
    return
  }
  const bounds = new maplibregl.LngLatBounds()
  points.forEach((point) => bounds.extend([point.longitude, point.latitude]))
  map.fitBounds(bounds, { padding: { top: 46, right: 46, bottom: 46, left: 46 }, maxZoom: 8.2, pitch: 42, duration: 700 })
}

export function HistoryInteractiveMap({ ariaLabel, points, routes = [], mode, historicalLayer, historicalLabels = [], modernLabels = [], focusKey, emptyLabel }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const markersRef = useRef<MapLibreMarker[]>([])
  const [boundaryMode, setBoundaryMode] = useState<'modern' | 'historical'>('modern')
  const boundaryModeRef = useRef(boundaryMode)
  const pointsRef = useRef(points)
  const routesRef = useRef(routes)
  const historicalLabelsRef = useRef(historicalLabels)
  const modernLabelsRef = useRef(modernLabels)
  pointsRef.current = points
  routesRef.current = routes
  historicalLabelsRef.current = historicalLabels
  modernLabelsRef.current = modernLabels
  boundaryModeRef.current = boundaryMode

  useEffect(() => {
    if (!historicalLayer && boundaryMode === 'historical') setBoundaryMode('modern')
  }, [boundaryMode, historicalLayer])

  useEffect(() => {
    if (!containerRef.current) return
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OPEN_FREE_MAP_STYLE,
      center: mode === 'world' ? [15, 22] : [112.9, 35.8],
      zoom: mode === 'world' ? 1.15 : 6.6,
      pitch: mode === 'world' ? 0 : 42,
      minZoom: 0.7,
      maxZoom: 15,
      attributionControl: {},
      cooperativeGestures: false,
    })
    mapRef.current = map
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right')
    map.addControl(new maplibregl.FullscreenControl(), 'top-right')
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-left')

    map.on('style.load', () => {
      if (!map.getSource('history-terrain')) {
        map.addSource('history-terrain', { type: 'raster-dem', url: MAPTERHORN_DEM })
        map.setTerrain({ source: 'history-terrain', exaggeration: 0.8 })
        const boundaryLayer = map.getStyle().layers?.find((layer) => MODERN_BOUNDARY_LAYERS.includes(layer.id))?.id
        const firstSymbol = map.getStyle().layers?.find((layer) => layer.type === 'symbol')?.id
        map.addLayer({
          id: 'history-hillshade',
          type: 'hillshade',
          source: 'history-terrain',
          paint: {
            'hillshade-exaggeration': 0.32,
            'hillshade-shadow-color': '#19283b',
            'hillshade-highlight-color': '#d7eadf',
            'hillshade-accent-color': '#7f8f7d',
          },
        }, boundaryLayer ?? firstSymbol)
      }
      map.addControl(new maplibregl.TerrainControl({ source: 'history-terrain', exaggeration: 0.8 }), 'top-right')
      if (historicalLayer) {
        map.addSource('history-boundaries', {
          type: 'raster',
          tiles: [historicalLayer.tileTemplate],
          tileSize: 256,
          minzoom: historicalLayer.minZoom,
          maxzoom: historicalLayer.maxZoom,
          bounds: historicalLayer.bounds,
          attribution: historicalLayer.attributionZh,
        })
        map.addLayer({
          id: 'history-boundaries-overlay',
          type: 'raster',
          source: 'history-boundaries',
          layout: { visibility: boundaryModeRef.current === 'historical' ? 'visible' : 'none' },
          paint: {
            'raster-opacity': Math.max(historicalLayer.opacity, 0.96),
            'raster-contrast': 0.28,
            'raster-saturation': 0.12,
            'raster-fade-duration': 140,
          },
        })
      }
      map.addSource('history-boundary-labels', {
        type: 'geojson',
        data: boundaryLabelCollection(boundaryModeRef.current === 'historical' ? historicalLabelsRef.current : modernLabelsRef.current),
      })
      map.addLayer({
        id: 'history-boundary-labels-text',
        type: 'symbol',
        source: 'history-boundary-labels',
        minzoom: mode === 'world' ? 2.8 : 4.5,
        layout: {
          'text-field': ['get', 'title'],
          'text-font': ['Noto Sans Bold'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 3, 12, 6, 17, 9, 21],
          'text-allow-overlap': false,
          'text-letter-spacing': 0.08,
        },
        paint: {
          'text-color': ['get', 'color'],
          'text-halo-color': '#ffffff',
          'text-halo-width': 3,
          'text-halo-blur': 1,
        },
      })
      applyBoundaryMode(map, boundaryModeRef.current)
      map.addSource('history-routes', { type: 'geojson', data: routeCollection(routesRef.current) })
      map.addLayer({
        id: 'history-routes-line',
        type: 'line',
        source: 'history-routes',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 3,
          'line-opacity': 0.9,
          'line-dasharray': [2, 2],
        },
      })
      map.addLayer({
        id: 'history-routes-label',
        type: 'symbol',
        source: 'history-routes',
        minzoom: 5,
        layout: {
          'symbol-placement': 'line-center',
          'text-field': ['get', 'label'],
          'text-size': 11,
          'text-allow-overlap': false,
        },
        paint: {
          'text-color': '#f4f8ff',
          'text-halo-color': '#142238',
          'text-halo-width': 2,
        },
      })
      fitPoints(map, pointsRef.current, mode)
    })

    return () => {
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
      map.remove()
      mapRef.current = null
    }
  }, [historicalLayer?.slug, mode])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (map.getLayer('history-boundaries-overlay')) map.setLayoutProperty('history-boundaries-overlay', 'visibility', boundaryMode === 'historical' ? 'visible' : 'none')
    applyBoundaryMode(map, boundaryMode)
    const labelSource = map.getSource('history-boundary-labels') as maplibregl.GeoJSONSource | undefined
    labelSource?.setData(boundaryLabelCollection(boundaryMode === 'historical' ? historicalLabels : modernLabels))
  }, [boundaryMode, historicalLabels, historicalLayer?.slug, modernLabels])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = points.map((point) => new maplibregl.Marker({ element: markerElement(point), anchor: 'center' })
      .setLngLat([point.longitude, point.latitude])
      .addTo(map))
    const source = map.getSource('history-routes') as maplibregl.GeoJSONSource | undefined
    if (source) source.setData(routeCollection(routes))
    const ready = () => fitPoints(map, points, mode)
    if (map.loaded()) ready()
    else map.once('load', ready)
  }, [focusKey, mode, points, routes])

  return <div className={`history-interactive-map map-${mode}`} aria-label={ariaLabel} role="application">
    <div className="history-map-canvas" ref={containerRef} />
    <div className="history-map-boundary-toggle" role="group" aria-label="疆界顯示方式">
      <button className={boundaryMode === 'modern' ? 'active' : ''} type="button" onClick={() => setBoundaryMode('modern')} aria-pressed={boundaryMode === 'modern'}>現代</button>
      <button className={boundaryMode === 'historical' ? 'active' : ''} type="button" disabled={!historicalLayer} onClick={() => setBoundaryMode('historical')} aria-pressed={boundaryMode === 'historical'} title={historicalLayer?.coverageNoteZh ?? '此年代的歷史疆域尚未收錄'}>當時</button>
    </div>
    <button className="history-map-refocus" type="button" onClick={() => { if (mapRef.current) fitPoints(mapRef.current, points, mode) }}>◎ {mode === 'world' ? '回到世界' : '回到事件範圍'}</button>
    {points.length === 0 && emptyLabel ? <p className="history-map-empty">{emptyLabel}</p> : null}
    {boundaryMode === 'historical' && historicalLayer
      ? <a className="history-map-layer-source" href={historicalLayer.sourceUrl} target="_blank" rel="noreferrer" title={historicalLayer.coverageNoteZh}>藍線＝戰國疆界（概略） · {historicalLayer.attributionZh}</a>
      : <span className="history-map-layer-source is-modern">紅線＝國界 · 藍線＝省界</span>}
    <div className="history-map-legend"><span><i className="terrain" />地形底圖</span><span><i className="approximate" />古地點／路線為概略定位</span></div>
  </div>
}
