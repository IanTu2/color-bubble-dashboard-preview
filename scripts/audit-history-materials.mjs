import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const component = read('src/components/HistoryMaterialsApp.tsx')
const data = read('src/history-data.ts')
const drawer = read('src/components/SideDrawer.tsx')
const workspace = read('src/components/DesktopWorkspace.tsx')
const css = read('src/history-materials.css')
const migration = read('supabase/migrations/20260908073128_create_history_materials.sql')
const geographyMigration = read('supabase/migrations/20260909023120_add_history_node_geography.sql')

const checks = [
  ['history opens from materials drawer', drawer.includes("launch('history')")],
  ['desktop workspace supports history windows', workspace.includes("item.app === 'history'")],
  ['four fixed views exist', ["'world'", "'period'", "'storyline'", "'event'"].every((view) => component.includes(view))],
  ['world map uses packaged Natural Earth geometry', component.includes("world-atlas/countries-110m.json") && component.includes('geoNaturalEarth1')],
  ['world map excludes storyline-level events', component.includes('event.storylineSlug === null')],
  ['map labels appear from compact point markers', component.includes('history-map-dot') && css.includes('.history-map-dot:hover > span')],
  ['global timeline supports BCE through current era', component.includes('min="-3000"') && component.includes('max="2025"')],
  ['storyline filters and ordering exist', component.includes('setCategory') && component.includes('setAscending')],
  ['Changping has fourteen internal nodes', (data.match(/eventSlug: 'battle-of-changping'/g) ?? []).length === 14],
  ['commander replacement includes causes and caveat', data.includes('久守不決與秦國反間共同推動換將') && data.includes('不應被寫成史料已明言的唯一原因')],
  ['source links are attached to nodes', component.includes('<SourceLinks node={selectedNode} catalog={catalog} />')],
  ['fourth-layer nodes include a synchronized geography map', component.includes('function EventGeographyMap') && component.includes('<EventGeographyMap node={selectedNode} catalog={catalog} />')],
  ['node geography is normalized and protected by RLS', geographyMigration.includes('create table public.history_event_node_places') && geographyMigration.includes('create table public.history_event_node_routes') && geographyMigration.includes('enable row level security')],
  ['geography distinguishes approximate routes and borders', geographyMigration.includes('is_approximate boolean') && component.includes('不把爭議中的古代疆界或行軍線畫成精確結果')],
  ['database tables use RLS', migration.includes('enable row level security') && migration.includes('_public_read') && migration.includes('_admin_write')],
  ['database has normalized event relations', migration.includes('create table public.history_event_relations') && migration.includes('create table public.history_source_links')],
  ['responsive breakpoints cover tablet and mobile', css.includes('@media (max-width: 900px)') && css.includes('@media (max-width: 650px)')],
  ['unverified source categories are absent', !/wikipedia|維基|野史|小說|history\.com/i.test(data)],
]

const failures = checks.filter(([, ok]) => !ok)
console.log(JSON.stringify({ checks: checks.length, failures: failures.map(([name]) => name) }, null, 2))
if (failures.length) process.exit(1)
