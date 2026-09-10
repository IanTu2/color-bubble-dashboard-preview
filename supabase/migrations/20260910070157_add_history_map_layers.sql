-- Register authoritative, year-aware historical map layers without changing existing data.

create table public.history_map_layers (
  slug text primary key,
  period_slug text not null references public.history_periods(slug) on delete cascade,
  title_zh text not null,
  layer_kind text not null default 'territory_overlay' check (layer_kind in ('territory_overlay')),
  start_year integer not null,
  end_year integer not null,
  tile_template text not null,
  min_zoom smallint not null default 0 check (min_zoom between 0 and 24),
  max_zoom smallint not null default 19 check (max_zoom between 0 and 24),
  bounds_west double precision not null,
  bounds_south double precision not null,
  bounds_east double precision not null,
  bounds_north double precision not null,
  attribution_zh text not null,
  source_url text not null,
  opacity real not null default 0.82 check (opacity between 0 and 1),
  coverage_note_zh text not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (period_slug, start_year, end_year, layer_kind),
  check (end_year >= start_year),
  check (max_zoom >= min_zoom),
  check (bounds_west between -180 and 180 and bounds_east between -180 and 180 and bounds_east > bounds_west),
  check (bounds_south between -90 and 90 and bounds_north between -90 and 90 and bounds_north > bounds_south)
);

create index history_map_layers_year_idx
  on public.history_map_layers (start_year, end_year)
  where is_published;

alter table public.history_map_layers enable row level security;
grant select on table public.history_map_layers to anon, authenticated;
grant insert, update, delete on table public.history_map_layers to authenticated;

create policy history_map_layers_public_read on public.history_map_layers
  for select to anon, authenticated using (is_published);
create policy history_map_layers_admin_insert on public.history_map_layers
  for insert to authenticated with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'));
create policy history_map_layers_admin_update on public.history_map_layers
  for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'));
create policy history_map_layers_admin_delete on public.history_map_layers
  for delete to authenticated using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'));

create trigger history_map_layers_updated_at before update on public.history_map_layers
  for each row execute function public.history_set_updated_at();

insert into public.history_map_layers (
  slug, period_slug, title_zh, start_year, end_year, tile_template, min_zoom, max_zoom,
  bounds_west, bounds_south, bounds_east, bounds_north, attribution_zh, source_url,
  opacity, coverage_note_zh, is_published
) values (
  'sinica-warring-states', 'warring-states', '戰國時期疆域', -475, -221,
  'https://gis.sinica.edu.tw/ccts/file-exists.php?img=warring_states-png-{z}-{x}-{y}', 0, 19,
  93.947, 22.285, 130.849, 45.057,
  '中央研究院人社中心 GIS 專題中心',
  'https://gis.sinica.edu.tw/showwmts/index.php?l=warring_states&s=ccts',
  0.82,
  '戰國疆域為歷史地圖概略重建，不代表前 260 年每一時點的精確邊界。',
  true
);
