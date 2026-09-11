import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const component = read('src/components/HistoryMaterialsApp.tsx')
const interactiveMap = read('src/components/HistoryInteractiveMap.tsx')
const data = read('src/history-data.ts')
const drawer = read('src/components/SideDrawer.tsx')
const workspace = read('src/components/DesktopWorkspace.tsx')
const css = read('src/history-materials.css')
const migration = read('supabase/migrations/20260908073128_create_history_materials.sql')
const geographyMigration = read('supabase/migrations/20260909023120_add_history_node_geography.sql')
const mapLayersMigration = read('supabase/migrations/20260910070157_add_history_map_layers.sql')

const checks = [
  ['history opens from materials drawer', drawer.includes("launch('history')")],
  ['desktop workspace supports history windows', workspace.includes("item.app === 'history'")],
  ['four fixed views exist', ["'world'", "'period'", "'storyline'", "'event'"].every((view) => component.includes(view))],
  ['world and regional maps share MapLibre interaction', component.includes('HistoryInteractiveMap') && interactiveMap.includes("mode: 'world' | 'region'")],
  ['maps provide terrain, pan, zoom and fullscreen controls', interactiveMap.includes('MAPTERHORN_DEM') && interactiveMap.includes('setTerrain') && interactiveMap.includes('NavigationControl') && interactiveMap.includes('FullscreenControl')],
  ['every map can switch between modern and historical boundaries', interactiveMap.includes('history-map-boundary-toggle') && interactiveMap.includes("setBoundaryMode('modern')") && interactiveMap.includes("setBoundaryMode('historical')")],
  ['modern and historical boundaries have visible map labels and legends', interactiveMap.includes('history-boundary-labels-text') && interactiveMap.includes('紅線＝國界') && interactiveMap.includes('藍線＝戰國疆界') && component.includes('上黨爭議區')],
  ['historical boundary layer uses the official Academia Sinica tiles', interactiveMap.includes("type: 'raster'") && mapLayersMigration.includes('gis.sinica.edu.tw/ccts/file-exists.php') && mapLayersMigration.includes('中央研究院')],
  ['regional map refocuses around the selected node', interactiveMap.includes('fitBounds') && component.includes('focusKey={node.slug}')],
  ['world map excludes storyline-level events', component.includes('event.storylineSlug === null')],
  ['map labels appear from compact point markers', interactiveMap.includes('history-map-pin') && css.includes('.history-map-pin:hover > span')],
  ['map marker activation is isolated from map drag gestures', interactiveMap.includes("addEventListener('pointerdown', keepMarkerGesture)") && interactiveMap.includes("addEventListener('click'")],
  ['MapLibre markers retain absolute geographic anchoring', css.includes('.history-map-pin {\n  position: absolute;')],
  ['world map uses overlay controls instead of shrinking the map', css.includes('.history-map-stage { position: absolute; inset: 6px;') && css.includes('.history-global-timeline { position: absolute;')],
  ['global timeline supports BCE through current era', component.includes('min="-3000"') && component.includes('max="2025"')],
  ['storyline filters and ordering exist', component.includes('setCategory') && component.includes('setAscending')],
  ['Changping has fourteen internal nodes', (data.match(/eventSlug: 'battle-of-changping'/g) ?? []).length === 14],
  ['commander replacement includes causes and caveat', data.includes('久守不決與秦國反間共同推動換將') && data.includes('不應被寫成史料已明言的唯一原因')],
  ['source links are attached to nodes', component.includes('<SourceLinks node={selectedNode} catalog={catalog} />')],
  ['fourth-layer nodes include a synchronized geography map', component.includes('function EventGeographyMap') && component.includes('<EventGeographyMap node={selectedNode} catalog={catalog} year={event.startYear} />') && component.includes('routes={mappedRoutes}')],
  ['node geography is normalized and protected by RLS', geographyMigration.includes('create table public.history_event_node_places') && geographyMigration.includes('create table public.history_event_node_routes') && geographyMigration.includes('enable row level security')],
  ['historical map registry is normalized and protected by RLS', mapLayersMigration.includes('create table public.history_map_layers') && mapLayersMigration.includes('start_year integer') && mapLayersMigration.includes('enable row level security') && mapLayersMigration.includes('history_map_layers_admin_update')],
  ['geography distinguishes approximate routes and borders', geographyMigration.includes('is_approximate boolean') && component.includes('不把有爭議的古代疆界或行軍線畫成精確結果')],
  ['database tables use RLS', migration.includes('enable row level security') && migration.includes('_public_read') && migration.includes('_admin_write')],
  ['database has normalized event relations', migration.includes('create table public.history_event_relations') && migration.includes('create table public.history_source_links')],
  ['responsive breakpoints cover tablet and mobile', css.includes('@media (max-width: 900px)') && css.includes('@media (max-width: 650px)')],
  ['unverified source categories are absent', !/wikipedia|維基|野史|小說|history\.com/i.test(data)],
]

const failures = checks.filter(([, ok]) => !ok)
console.log(JSON.stringify({ checks: checks.length, failures: failures.map(([name]) => name) }, null, 2))
if (failures.length) process.exit(1)
