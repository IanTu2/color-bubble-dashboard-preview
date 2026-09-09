-- Add normalized geography context for fourth-layer event nodes.
-- Existing history and user data are preserved.

alter table public.history_event_nodes
  add column geographic_context_zh text not null default '';

create table public.history_event_node_places (
  node_slug text not null references public.history_event_nodes(slug) on delete cascade,
  place_slug text not null references public.history_places(slug) on delete cascade,
  role text not null check (role in ('focus', 'origin', 'destination', 'context', 'blocked')),
  sequence smallint not null default 0,
  note_zh text not null default '',
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (node_slug, place_slug, role)
);

create table public.history_event_node_routes (
  node_slug text not null references public.history_event_nodes(slug) on delete cascade,
  sequence smallint not null,
  from_place_slug text not null references public.history_places(slug) on delete restrict,
  to_place_slug text not null references public.history_places(slug) on delete restrict,
  route_kind text not null check (route_kind in ('advance', 'blocked', 'transfer', 'mobilization', 'command')),
  label_zh text not null,
  is_approximate boolean not null default true,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (node_slug, sequence)
);

create index history_event_node_places_place_idx on public.history_event_node_places (place_slug);
create index history_event_node_routes_from_idx on public.history_event_node_routes (from_place_slug);
create index history_event_node_routes_to_idx on public.history_event_node_routes (to_place_slug);

alter table public.history_event_node_places enable row level security;
alter table public.history_event_node_routes enable row level security;

grant select on table public.history_event_node_places, public.history_event_node_routes to anon, authenticated;
grant insert, update, delete on table public.history_event_node_places, public.history_event_node_routes to authenticated;

create policy history_event_node_places_public_read on public.history_event_node_places
  for select to anon, authenticated using (is_published);
create policy history_event_node_routes_public_read on public.history_event_node_routes
  for select to anon, authenticated using (is_published);

create policy history_event_node_places_admin_insert on public.history_event_node_places
  for insert to authenticated with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'));
create policy history_event_node_places_admin_update on public.history_event_node_places
  for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'));
create policy history_event_node_places_admin_delete on public.history_event_node_places
  for delete to authenticated using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'));

create policy history_event_node_routes_admin_insert on public.history_event_node_routes
  for insert to authenticated with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'));
create policy history_event_node_routes_admin_update on public.history_event_node_routes
  for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'));
create policy history_event_node_routes_admin_delete on public.history_event_node_routes
  for delete to authenticated using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'));

create trigger history_event_node_places_updated_at before update on public.history_event_node_places
  for each row execute function public.history_set_updated_at();
create trigger history_event_node_routes_updated_at before update on public.history_event_node_routes
  for each row execute function public.history_set_updated_at();

insert into public.history_places (slug, region_slug, title_zh, title_en, latitude, longitude, location_precision) values
  ('yewang', 'central-plains', '野王（今河南沁陽一帶）', 'Yewang', 35.09, 112.95, 'approximate')
on conflict (slug) do update set
  title_zh = excluded.title_zh,
  title_en = excluded.title_en,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  location_precision = excluded.location_precision;

update public.history_event_nodes set geographic_context_zh = case slug
  when 'changping-qin-takes-yewang' then '野王位於韓國本土通往上黨的南側交通線。秦軍取得野王後，上黨與韓國本土的聯繫被切斷。'
  when 'changping-fengting-offers-shangdang' then '上黨位於太行山區西側高地，原有南向聯絡中斷後，馮亭轉而尋求東側趙國支援。'
  when 'changping-zhao-accepts-shangdang' then '邯鄲位於太行山東側，上黨在山地另一側；趙國接收上黨，也意味必須跨越山區投入軍隊維持。'
  when 'changping-initial-fighting' then '長平位於上黨南部，是秦軍北上爭奪上黨與趙軍西進接應之間的交會區。'
  when 'changping-lianpo-defends' then '長平周邊山谷與高地限制大軍運動；趙軍築壘固守，是在初戰不利後利用地形延緩秦軍。'
  when 'changping-king-dissatisfied' then '趙王在邯鄲決策，前線則在太行山以西的長平；都城與戰場分隔，使前線判斷依賴軍報與使者。'
  when 'changping-counterintelligence' then '反間消息在趙國決策中樞發揮作用，影響的是遠在長平前線的指揮安排。'
  when 'changping-zhaokuo-replaces-lianpo' then '換將決策在趙廷形成，趙括再由邯鄲方向赴長平接掌前線；政治決策與戰場相隔。'
  when 'changping-baiqi-secret-command' then '秦方秘密換將後，白起前往長平接掌秦軍；地圖路線僅表示由秦方到前線的概略方向。'
  when 'changping-zhao-attacks' then '趙軍離開既有防禦位置追擊後，戰場空間由固定對峙轉為縱深運動。精確行軍線仍有爭議。'
  when 'changping-encircled' then '秦軍切斷趙軍與原有陣地及補給方向的聯繫；此圖只表達包圍關係，不假裝復原精確軍陣。'
  when 'changping-zhaokuo-dies' then '突圍發生於長平包圍區內；主要史料不足以把突圍路線定位到現代地圖上的單一路徑。'
  when 'changping-after-surrender' then '降卒處置發生於長平戰區；具體地點與「坑」的形式仍需結合考古研究，不標示為單一精確遺址。'
  when 'changping-aftermath' then '長平位於趙國西側防線之外，戰敗後秦軍進一步威脅太行山東側的趙都邯鄲。'
  else geographic_context_zh
end
where event_slug = 'battle-of-changping';

insert into public.history_event_node_places (node_slug, place_slug, role, sequence, note_zh) values
  ('changping-qin-takes-yewang', 'xianyang', 'origin', 1, '秦國方向'),
  ('changping-qin-takes-yewang', 'yewang', 'focus', 2, '秦軍攻取'),
  ('changping-qin-takes-yewang', 'shangdang', 'blocked', 3, '與韓國本土聯絡中斷'),
  ('changping-fengting-offers-shangdang', 'shangdang', 'focus', 1, '歸屬爭議核心'),
  ('changping-fengting-offers-shangdang', 'handan', 'destination', 2, '趙國決策方向'),
  ('changping-zhao-accepts-shangdang', 'handan', 'origin', 1, '趙廷決策'),
  ('changping-zhao-accepts-shangdang', 'shangdang', 'destination', 2, '趙國接收'),
  ('changping-initial-fighting', 'xianyang', 'origin', 1, '秦國方向'),
  ('changping-initial-fighting', 'handan', 'origin', 2, '趙國方向'),
  ('changping-initial-fighting', 'changping', 'focus', 3, '交戰區'),
  ('changping-lianpo-defends', 'changping', 'focus', 1, '趙軍固守區'),
  ('changping-king-dissatisfied', 'handan', 'focus', 1, '決策中樞'),
  ('changping-king-dissatisfied', 'changping', 'context', 2, '前線'),
  ('changping-counterintelligence', 'handan', 'focus', 1, '反間影響趙廷'),
  ('changping-counterintelligence', 'changping', 'context', 2, '前線'),
  ('changping-zhaokuo-replaces-lianpo', 'handan', 'origin', 1, '換將決策'),
  ('changping-zhaokuo-replaces-lianpo', 'changping', 'destination', 2, '接掌前線'),
  ('changping-baiqi-secret-command', 'xianyang', 'origin', 1, '秦方決策方向'),
  ('changping-baiqi-secret-command', 'changping', 'destination', 2, '秘密接掌前線'),
  ('changping-zhao-attacks', 'changping', 'focus', 1, '出戰與誘敵區域'),
  ('changping-encircled', 'changping', 'focus', 1, '包圍區域'),
  ('changping-zhaokuo-dies', 'changping', 'focus', 1, '突圍與投降區域'),
  ('changping-after-surrender', 'changping', 'focus', 1, '戰後處置區域'),
  ('changping-aftermath', 'changping', 'context', 1, '戰敗地區'),
  ('changping-aftermath', 'handan', 'focus', 2, '後續受威脅的趙都');

insert into public.history_event_node_routes (node_slug, sequence, from_place_slug, to_place_slug, route_kind, label_zh, is_approximate) values
  ('changping-qin-takes-yewang', 1, 'xianyang', 'yewang', 'advance', '秦軍向野王推進', true),
  ('changping-qin-takes-yewang', 2, 'yewang', 'shangdang', 'blocked', '上黨道路中斷', true),
  ('changping-fengting-offers-shangdang', 1, 'shangdang', 'handan', 'transfer', '馮亭轉而歸趙', true),
  ('changping-zhao-accepts-shangdang', 1, 'handan', 'shangdang', 'mobilization', '趙國接收並派軍', true),
  ('changping-initial-fighting', 1, 'xianyang', 'changping', 'advance', '秦軍進攻方向', true),
  ('changping-initial-fighting', 2, 'handan', 'changping', 'mobilization', '趙軍接應方向', true),
  ('changping-zhaokuo-replaces-lianpo', 1, 'handan', 'changping', 'command', '趙括赴前線接任', true),
  ('changping-baiqi-secret-command', 1, 'xianyang', 'changping', 'command', '白起秘密接掌前線', true);
