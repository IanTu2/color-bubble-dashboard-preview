import { useEffect, useRef } from 'react'
import * as maplibregl from 'maplibre-gl'
import type { Map as MapLibreMap, Marker as MapLibreMarker } from 'maplibre-gl'
import type { FeatureCollection, LineString } from 'geojson'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { HistoryNodeRoute, HistoryPlace } from '../history-data'

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

type RouteWithPlaces = HistoryNodeRoute & { from: HistoryPlace; to: HistoryPlace }

type Props = {
  ariaLabel: string
  points: HistoryMapPoint[]
  routes?: RouteWithPlaces[]
  mode: 'world' | 'region'
  focusKey?: string
  emptyLabel?: string
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
  if (point.onClick) button.addEventListener('click', point.onClick)
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

export function HistoryInteractiveMap({ ariaLabel, points, routes = [], mode, focusKey, emptyLabel }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const markersRef = useRef<MapLibreMarker[]>([])
  const pointsRef = useRef(points)
  const routesRef = useRef(routes)
  pointsRef.current = points
  routesRef.current = routes

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
        }, firstSymbol)
      }
      map.addControl(new maplibregl.TerrainControl({ source: 'history-terrain', exaggeration: 0.8 }), 'top-right')
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
  }, [mode])

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
    <button className="history-map-refocus" type="button" onClick={() => { if (mapRef.current) fitPoints(mapRef.current, points, mode) }}>◎ {mode === 'world' ? '回到世界' : '回到事件範圍'}</button>
    {points.length === 0 && emptyLabel ? <p className="history-map-empty">{emptyLabel}</p> : null}
    <div className="history-map-legend"><span><i className="terrain" />地形底圖</span><span><i className="approximate" />古地點／路線為概略定位</span></div>
  </div>
}
