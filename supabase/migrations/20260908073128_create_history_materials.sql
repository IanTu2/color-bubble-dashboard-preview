-- Bubble Space history materials: normalized, source-backed public curriculum.
-- This migration only adds new objects and seed content; it does not alter existing user data.

create table public.history_regions (
  slug text primary key,
  title_zh text not null,
  title_en text not null default '',
  parent_slug text references public.history_regions(slug) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.history_places (
  slug text primary key,
  region_slug text references public.history_regions(slug) on delete set null,
  title_zh text not null,
  title_en text not null default '',
  latitude double precision,
  longitude double precision,
  location_precision text not null default 'approximate' check (location_precision in ('exact', 'approximate', 'disputed', 'unknown')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (latitude is null or latitude between -90 and 90),
  check (longitude is null or longitude between -180 and 180)
);

create table public.history_periods (
  slug text primary key,
  region_slug text references public.history_regions(slug) on delete set null,
  title_zh text not null,
  title_en text not null default '',
  start_year integer not null,
  end_year integer not null,
  date_label_zh text not null,
  summary_zh text not null default '',
  latitude double precision not null,
  longitude double precision not null,
  importance smallint not null default 1 check (importance between 1 and 5),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_year >= start_year),
  check (latitude between -90 and 90),
  check (longitude between -180 and 180)
);

create table public.history_polities (
  slug text primary key,
  region_slug text references public.history_regions(slug) on delete set null,
  title_zh text not null,
  title_en text not null default '',
  start_year integer,
  end_year integer,
  date_precision text not null default 'year' check (date_precision in ('year', 'month', 'range', 'approximate', 'unknown')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_year is null or start_year is null or end_year >= start_year)
);

create table public.history_people (
  slug text primary key,
  primary_polity_slug text references public.history_polities(slug) on delete set null,
  name_zh text not null,
  name_en text not null default '',
  birth_year integer,
  death_year integer,
  date_note_zh text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.history_storylines (
  slug text primary key,
  period_slug text not null references public.history_periods(slug) on delete cascade,
  title_zh text not null,
  title_en text not null default '',
  date_label_zh text not null,
  summary_zh text not null default '',
  sequence integer not null default 0,
  status text not null default 'planned' check (status in ('published', 'planned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.history_events (
  slug text primary key,
  period_slug text not null references public.history_periods(slug) on delete restrict,
  storyline_slug text references public.history_storylines(slug) on delete set null,
  place_slug text references public.history_places(slug) on delete set null,
  title_zh text not null,
  title_en text not null default '',
  start_year integer not null,
  end_year integer not null,
  date_label_zh text not null,
  date_precision text not null check (date_precision in ('year', 'month', 'range', 'approximate', 'unknown')),
  category text not null check (category in ('politics', 'capital', 'succession', 'reform', 'military', 'diplomacy', 'war', 'territory')),
  summary_zh text not null default '',
  place_name_zh text not null default '',
  latitude double precision,
  longitude double precision,
  people_zh text[] not null default '{}',
  importance smallint not null default 1 check (importance between 1 and 5),
  sequence integer not null default 0,
  detail_status text not null default 'planned' check (detail_status in ('published', 'planned')),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_year >= start_year),
  check (latitude is null or latitude between -90 and 90),
  check (longitude is null or longitude between -180 and 180)
);

create table public.history_event_nodes (
  slug text primary key,
  event_slug text not null references public.history_events(slug) on delete cascade,
  sequence integer not null,
  date_label_zh text not null,
  date_precision text not null check (date_precision in ('year', 'month', 'range', 'approximate', 'unknown')),
  title_zh text not null,
  place_name_zh text not null default '',
  people_zh text[] not null default '{}',
  description_zh text not null,
  cause_zh text not null,
  previous_context_zh text not null,
  consequence_zh text not null,
  dispute_zh text not null default '',
  source_slugs text[] not null default '{}',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_slug, sequence)
);

create table public.history_sources (
  slug text primary key,
  name_zh text not null,
  author_or_institution text not null,
  work_title text not null,
  locator text not null default '',
  url text not null,
  source_type text not null check (source_type in ('primary', 'official', 'academic', 'museum')),
  reliability text not null check (reliability in ('primary-record', 'reviewed', 'reference')),
  accessed_at date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.history_event_people (
  event_slug text not null references public.history_events(slug) on delete cascade,
  person_slug text not null references public.history_people(slug) on delete cascade,
  relationship_zh text not null default '',
  primary key (event_slug, person_slug)
);

create table public.history_event_polities (
  event_slug text not null references public.history_events(slug) on delete cascade,
  polity_slug text not null references public.history_polities(slug) on delete cascade,
  relationship_zh text not null default '',
  primary key (event_slug, polity_slug)
);

create table public.history_event_relations (
  from_event_slug text not null references public.history_events(slug) on delete cascade,
  to_event_slug text not null references public.history_events(slug) on delete cascade,
  relation_type text not null check (relation_type in ('causes', 'leads_to', 'part_of', 'context_for')),
  note_zh text not null default '',
  primary key (from_event_slug, to_event_slug, relation_type),
  check (from_event_slug <> to_event_slug)
);

create table public.history_source_links (
  id bigint generated always as identity primary key,
  source_slug text not null references public.history_sources(slug) on delete cascade,
  event_slug text references public.history_events(slug) on delete cascade,
  node_slug text references public.history_event_nodes(slug) on delete cascade,
  claim_summary_zh text not null,
  relationship text not null default 'supports' check (relationship in ('supports', 'disputes', 'context')),
  created_at timestamptz not null default now(),
  check ((event_slug is not null)::integer + (node_slug is not null)::integer = 1)
);

create index history_periods_year_idx on public.history_periods (start_year, end_year, importance desc) where is_published;
create index history_storylines_period_sequence_idx on public.history_storylines (period_slug, sequence);
create index history_events_map_idx on public.history_events (start_year, end_year, importance desc) where is_published;
create index history_events_storyline_sequence_idx on public.history_events (storyline_slug, sequence) where is_published;
create index history_events_category_idx on public.history_events (category, start_year) where is_published;
create index history_event_nodes_event_sequence_idx on public.history_event_nodes (event_slug, sequence) where is_published;
create index history_source_links_event_idx on public.history_source_links (event_slug) where event_slug is not null;
create index history_source_links_node_idx on public.history_source_links (node_slug) where node_slug is not null;

create function public.history_set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.history_set_updated_at() from public, anon, authenticated;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'history_regions', 'history_places', 'history_periods', 'history_polities', 'history_people',
    'history_storylines', 'history_events', 'history_event_nodes', 'history_sources'
  ] loop
    execute format('create trigger %I before update on public.%I for each row execute function public.history_set_updated_at()', table_name || '_updated_at', table_name);
  end loop;
end $$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'history_regions', 'history_places', 'history_periods', 'history_polities', 'history_people',
    'history_storylines', 'history_events', 'history_event_nodes', 'history_sources',
    'history_event_people', 'history_event_polities', 'history_event_relations', 'history_source_links'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('grant select on table public.%I to anon, authenticated', table_name);
    execute format('grant insert, update, delete on table public.%I to authenticated', table_name);
    execute format('create policy %I on public.%I for select to anon, authenticated using (true)', table_name || '_public_read', table_name);
    execute format(
      'create policy %I on public.%I for all to authenticated using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = ''admin'')) with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = ''admin''))',
      table_name || '_admin_write', table_name
    );
  end loop;
end $$;

grant usage, select on sequence public.history_source_links_id_seq to authenticated;

insert into public.history_regions (slug, title_zh, title_en, parent_slug) values
  ('world', '世界', 'World', null),
  ('east-asia', '東亞', 'East Asia', 'world'),
  ('central-plains', '中原地區', 'Central Plains', 'east-asia'),
  ('europe', '歐洲', 'Europe', 'world');

insert into public.history_places (slug, region_slug, title_zh, title_en, latitude, longitude, location_precision) values
  ('zhao-state', 'central-plains', '趙國', 'State of Zhao', 37.0, 113.8, 'approximate'),
  ('handan', 'central-plains', '邯鄲', 'Handan', 36.62, 114.49, 'approximate'),
  ('shangdang', 'central-plains', '上黨', 'Shangdang', 36.0, 113.0, 'approximate'),
  ('changping', 'central-plains', '長平', 'Changping', 35.8, 112.9, 'approximate'),
  ('xianyang', 'central-plains', '咸陽', 'Xianyang', 34.33, 108.71, 'approximate');

insert into public.history_periods (slug, region_slug, title_zh, title_en, start_year, end_year, date_label_zh, summary_zh, latitude, longitude, importance, is_published) values
  ('warring-states', 'east-asia', '戰國時期', 'Warring States period', -475, -221, '前 475－前 221', '周代後期諸侯競爭、變法與兼併加速，最後由秦統一六國。戰國起點另有前 403 年等不同分期方式。', 34.6, 112.4, 5, true),
  ('modern-world', 'world', '近現代世界', 'Modern world', 1900, 2025, '1900－2025', '首批資料僅收錄世界大戰時間標記。', 49.0, 15.0, 5, false);

insert into public.history_polities (slug, region_slug, title_zh, title_en, start_year, end_year, date_precision) values
  ('zhou', 'central-plains', '周', 'Zhou', -1046, -256, 'approximate'),
  ('zhao', 'central-plains', '趙', 'Zhao', -403, -222, 'range'),
  ('qin-state', 'central-plains', '秦國', 'State of Qin', -770, -221, 'approximate'),
  ('han-state', 'central-plains', '韓國', 'State of Han', -403, -230, 'range');

insert into public.history_people (slug, primary_polity_slug, name_zh, name_en, date_note_zh) values
  ('king-xiaocheng-zhao', 'zhao', '趙孝成王', 'King Xiaocheng of Zhao', '生年不詳，前 265－前 245 年在位'),
  ('lian-po', 'zhao', '廉頗', 'Lian Po', '生卒年不詳'),
  ('zhao-kuo', 'zhao', '趙括', 'Zhao Kuo', '卒於前 260 年'),
  ('bai-qi', 'qin-state', '白起', 'Bai Qi', '卒於前 257 年'),
  ('fan-ju', 'qin-state', '范雎', 'Fan Ju', '生卒年不詳'),
  ('lin-xiangru', 'zhao', '藺相如', 'Lin Xiangru', '生卒年不詳'),
  ('feng-ting', 'han-state', '馮亭', 'Feng Ting', '卒於長平之戰期間');

insert into public.history_storylines (slug, period_slug, title_zh, title_en, date_label_zh, summary_zh, sequence, status) values
  ('three-jin', 'warring-states', '韓、趙、魏成為諸侯', 'Recognition of the Three Jin', '前 403 起', '從晉國權力分解到三國取得諸侯地位。', 1, 'planned'),
  ('qin-rise', 'warring-states', '秦國崛起', 'Rise of Qin', '前 356 起', '變法、擴張與統一六國。', 2, 'planned'),
  ('zhao-mainline', 'warring-states', '趙國主線', 'History of Zhao', '前 403－前 222', '建國、遷都、君主更替、改革、外交與戰爭。', 3, 'published'),
  ('vertical-horizontal-alliances', 'warring-states', '合縱與連橫', 'Vertical and horizontal alliances', '戰國中後期', '各國結盟、外交與對秦策略。', 4, 'planned'),
  ('qin-unification', 'warring-states', '秦滅六國', 'Qin wars of unification', '前 230－前 221', '秦先後滅韓、趙、魏、楚、燕、齊。', 5, 'planned');

insert into public.history_events
  (slug, period_slug, storyline_slug, place_slug, title_zh, title_en, start_year, end_year, date_label_zh, date_precision, category, summary_zh, place_name_zh, latitude, longitude, people_zh, importance, sequence, detail_status, is_published)
values
  ('three-jin-recognized', 'warring-states', 'zhao-mainline', null, '周威烈王承認韓、趙、魏為諸侯', 'Zhou recognizes Han, Zhao and Wei', -403, -403, '前 403 年', 'year', 'politics', '韓、趙、魏取得周王室承認的諸侯地位。', '周王畿／三晉', 34.7, 112.5, array['周威烈王','趙烈侯'], 4, 1, 'planned', true),
  ('zhao-capital-handan', 'warring-states', 'zhao-mainline', 'handan', '趙敬侯遷都邯鄲', 'Zhao moves its capital to Handan', -386, -386, '前 386 年', 'year', 'capital', '趙國政治中心移至邯鄲。', '邯鄲', 36.62, 114.49, array['趙敬侯'], 3, 2, 'planned', true),
  ('king-wuling-accession', 'warring-states', 'zhao-mainline', 'zhao-state', '趙武靈王即位', 'King Wuling succeeds to Zhao', -325, -325, '前 325 年', 'year', 'succession', '趙雍即位，後稱趙武靈王。', '趙國', 37.0, 113.8, array['趙武靈王'], 3, 3, 'planned', true),
  ('hufu-qishe', 'warring-states', 'zhao-mainline', 'zhao-state', '趙武靈王推行胡服騎射', 'King Wuling adopts Hu clothing and cavalry', -307, -307, '前 307 年', 'year', 'reform', '趙國改革服制與騎兵運用，以改善北方作戰能力。', '趙國', 38.0, 112.8, array['趙武靈王'], 4, 4, 'planned', true),
  ('wuling-abdicates', 'warring-states', 'zhao-mainline', 'zhao-state', '趙武靈王傳位趙惠文王', 'King Wuling abdicates to King Huiwen', -299, -299, '前 299 年', 'year', 'succession', '趙武靈王傳位趙何，自稱主父。', '趙國', 37.0, 113.8, array['趙武靈王','趙惠文王'], 3, 5, 'planned', true),
  ('shaqu-disorder', 'warring-states', 'zhao-mainline', 'zhao-state', '沙丘之亂，趙武靈王死', 'Sand Dune Incident and death of King Wuling', -295, -295, '前 295 年', 'year', 'succession', '公子章作亂失敗後，趙武靈王被圍於沙丘宮並死亡。', '沙丘宮', 37.1, 114.5, array['趙武靈王','公子章','趙成'], 4, 6, 'planned', true),
  ('perfect-jade', 'warring-states', 'zhao-mainline', null, '藺相如奉璧使秦', 'Lin Xiangru carries the jade to Qin', -283, -283, '約前 283 年', 'approximate', 'diplomacy', '藺相如奉和氏璧出使秦國，史事後以「完璧歸趙」流傳。', '秦國', 34.33, 108.71, array['藺相如','趙惠文王','秦昭襄王'], 3, 7, 'planned', true),
  ('mianchi-meeting', 'warring-states', 'zhao-mainline', null, '秦趙澠池之會', 'Meeting at Mianchi', -279, -279, '前 279 年', 'year', 'diplomacy', '秦趙兩國君主會於澠池，藺相如隨行。', '澠池', 34.77, 111.76, array['趙惠文王','秦昭襄王','藺相如'], 3, 8, 'planned', true),
  ('battle-of-eyu', 'warring-states', 'zhao-mainline', null, '閼與之戰', 'Battle of Eyu', -269, -269, '前 269 年', 'year', 'war', '趙奢率軍救閼與，擊敗秦軍。', '閼與', 37.1, 113.0, array['趙奢'], 3, 9, 'planned', true),
  ('battle-of-changping', 'warring-states', 'zhao-mainline', 'changping', '長平之戰', 'Battle of Changping', -262, -260, '前 262－前 260 年', 'range', 'war', '上黨歸屬引發秦趙對抗；前 260 年趙軍在長平遭到重大失敗。', '上黨／長平', 35.8, 112.9, array['廉頗','趙括','白起','趙孝成王'], 5, 10, 'published', true),
  ('handan-relieved', 'warring-states', 'zhao-mainline', 'handan', '邯鄲之圍解除', 'Relief of Handan', -257, -257, '前 257 年', 'year', 'war', '魏、楚援軍與趙軍共同解除秦軍對邯鄲的圍攻。', '邯鄲', 36.62, 114.49, array['平原君','信陵君','春申君'], 4, 11, 'planned', true),
  ('handan-falls', 'warring-states', 'zhao-mainline', 'handan', '秦軍攻破邯鄲，趙王遷被俘', 'Qin captures Handan and King Qian', -228, -228, '前 228 年', 'year', 'territory', '秦軍攻破趙都邯鄲，趙王遷被俘；公子嘉轉往代地。', '邯鄲', 36.62, 114.49, array['王翦','趙王遷','趙嘉'], 4, 12, 'planned', true),
  ('dai-falls', 'warring-states', 'zhao-mainline', null, '秦滅代，趙嘉被俘', 'Qin conquers Dai', -222, -222, '前 222 年', 'year', 'territory', '秦軍攻取代地，趙國殘餘政權結束。', '代地', 39.4, 114.2, array['趙嘉'], 3, 13, 'planned', true),
  ('qin-unifies', 'warring-states', null, 'xianyang', '秦統一六國', 'Qin unifies the six states', -221, -221, '前 221 年', 'year', 'politics', '秦王政完成對六國的兼併並建立秦帝國。', '咸陽', 34.33, 108.71, array['秦始皇'], 5, 90, 'planned', true),
  ('first-world-war', 'modern-world', null, null, '第一次世界大戰', 'First World War', 1914, 1918, '1914－1918 年', 'range', 'war', '主要戰場集中於歐洲並擴及全球的戰爭。', '歐洲及全球', 50.0, 10.0, '{}', 5, 91, 'planned', true),
  ('second-world-war', 'modern-world', null, null, '第二次世界大戰', 'Second World War', 1939, 1945, '1939－1945 年', 'range', 'war', '涉及多洲戰場的全球性戰爭。', '歐洲、亞洲及全球', 48.0, 20.0, '{}', 5, 92, 'planned', true);

insert into public.history_sources (slug, name_zh, author_or_institution, work_title, locator, url, source_type, reliability, accessed_at) values
  ('shiji-zhao', '《史記・趙世家》', '司馬遷／中國哲學書電子化計劃', '史記', '卷四十三・趙世家', 'https://ctext.org/shiji/zhao-shi-jia/zh', 'primary', 'primary-record', '2026-09-08'),
  ('shiji-lianpo', '《史記・廉頗藺相如列傳》', '司馬遷／中國哲學書電子化計劃', '史記', '卷八十一・廉頗藺相如列傳', 'https://ctext.org/shiji/lian-po-lin-xiang-ru-lie-zhuan/zh', 'primary', 'primary-record', '2026-09-08'),
  ('shiji-baiqi', '《史記・白起王翦列傳》', '司馬遷／中國哲學書電子化計劃', '史記', '卷七十三・白起王翦列傳', 'https://ctext.org/shiji/bai-qi-wang-jian-lie-zhuan/zh', 'primary', 'primary-record', '2026-09-08'),
  ('shiji-pingyuan', '《史記・平原君虞卿列傳》', '司馬遷／中國哲學書電子化計劃', '史記', '卷七十六・平原君虞卿列傳', 'https://ctext.org/shiji/ping-yuan-jun-yu-qing-lie-zhuan/zh', 'primary', 'primary-record', '2026-09-08'),
  ('moe-paper-war', '教育部《成語典》「紙上談兵」', '中華民國教育部', '成語典', '紙上談兵・典源及典故說明', 'https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=50&la=0&webMd=2', 'official', 'reviewed', '2026-09-08'),
  ('nccu-zhao-military', '戰國時代趙國的軍事與外交', '國立政治大學', '戰國時代趙國的軍事與外交', '學位論文典藏', 'https://ah.lib.nccu.edu.tw/item?item_id=106969', 'academic', 'reviewed', '2026-09-08'),
  ('british-museum-qin', 'British Museum：Qin unification', 'The British Museum', 'Horsepower: China, Mongolia and the steppe', 'Research project overview', 'https://www.britishmuseum.org/research/projects/horsepower-china-mongolia-and-steppe', 'museum', 'reviewed', '2026-09-08'),
  ('iwm-world-wars', 'Imperial War Museums：World Wars', 'Imperial War Museums', 'Stories of War and Conflict', 'First World War / Second World War', 'https://www.iwm.org.uk/history', 'museum', 'reviewed', '2026-09-08');

insert into public.history_event_nodes
  (slug, event_slug, sequence, date_label_zh, date_precision, title_zh, place_name_zh, people_zh, description_zh, cause_zh, previous_context_zh, consequence_zh, dispute_zh, source_slugs, is_published)
values
  ('changping-qin-takes-yewang', 'battle-of-changping', 1, '前 262 年', 'year', '秦攻韓野王，上黨道路中斷', '野王／上黨', array['秦昭襄王'], '秦軍攻取野王，使上黨與韓國本土的道路被切斷。', '秦國持續向韓國上黨方向擴張；野王是連接上黨與韓國本土的重要通道。', '秦國向韓國河內、上黨方向推進。', '上黨陷入孤立，歸屬問題成為秦趙衝突的引線。', '主要史料可定位到年份，未提供可換算的確切月日。', array['shiji-baiqi'], true),
  ('changping-fengting-offers-shangdang', 'battle-of-changping', 2, '前 262 年', 'year', '馮亭以上黨歸趙', '上黨', array['馮亭','平原君'], '上黨郡守馮亭不願降秦，轉而將上黨交給趙國。', '上黨已難以與韓國本土聯繫；馮亭希望藉趙國力量抵抗秦國。', '野王失守，上黨與韓國本土隔絕。', '趙國是否接收上黨成為朝廷內部的重要決策。', '馮亭的動機主要依《史記》的敘事，應與後世推測區分。', array['shiji-pingyuan'], true),
  ('changping-zhao-accepts-shangdang', 'battle-of-changping', 3, '前 262 年', 'year', '趙國決定接收上黨', '邯鄲', array['趙孝成王','平原君','平陽君'], '趙廷討論後接受上黨，並封賞馮亭。', '趙方看重取得上黨的戰略與土地利益；史料同時保留反對接收、擔心招致秦軍的意見。', '馮亭提出以上黨歸趙。', '秦國轉而以軍事手段爭奪上黨，秦趙衝突升高。', '應呈現趙廷內部支持與反對兩種意見，不把決策簡化成單一動機。', array['shiji-pingyuan'], true),
  ('changping-initial-fighting', 'battle-of-changping', 4, '前 260 年', 'year', '秦趙軍在長平交戰', '長平', array['廉頗','王齕'], '秦趙軍在長平對峙，趙軍初期交戰遭受損失。', '秦國要奪回上黨；趙國則試圖保住所接收的地區。', '趙國接收上黨，秦國出兵爭奪。', '廉頗改採築壘固守，避免繼續正面交戰。', '各段戰事的精確日序難以完整還原。', array['shiji-lianpo','shiji-baiqi'], true),
  ('changping-lianpo-defends', 'battle-of-changping', 5, '前 260 年', 'year', '廉頗採取固守', '長平', array['廉頗'], '廉頗築壘堅守，不接受秦軍反覆挑戰。', '趙軍初戰不利；繼續正面決戰風險高，固守可延緩秦軍推進。', '趙軍初期作戰受挫。', '戰局轉為持久對峙，趙王逐漸對久守不戰感到不滿。', '「希望拖垮秦軍」屬常見戰略解讀；史料明文核心是固壁不戰。', array['shiji-lianpo','moe-paper-war'], true),
  ('changping-king-dissatisfied', 'battle-of-changping', 6, '前 260 年', 'year', '趙王不滿廉頗久守', '邯鄲／長平', array['趙孝成王','廉頗'], '趙王多次責備廉頗，認為趙軍失利且長期不出戰。', '趙軍先前有損失，廉頗又拒絕秦軍挑戰；趙廷希望改變久拖不決的戰況。', '廉頗長期固守，戰事無法迅速結束。', '秦國得以利用趙王的不滿施行反間。', '趙國糧運壓力常被用來解釋換將，但主要記載對其程度與直接作用有限，不宜寫成唯一原因。', array['shiji-baiqi'], true),
  ('changping-counterintelligence', 'battle-of-changping', 7, '前 260 年', 'year', '秦國施行反間', '趙國', array['范雎','趙孝成王'], '秦相范雎派人攜重金在趙國散布消息，宣稱秦軍真正忌憚趙括，而廉頗容易對付甚至將降。', '廉頗固守使秦軍難以迅速突破；秦國希望趙方主動改變現行策略。', '趙王已對廉頗不滿。', '反間消息加深趙廷換將意願。', '反間的具體執行細節以《史記・白起王翦列傳》為主要依據。', array['shiji-baiqi'], true),
  ('changping-zhaokuo-replaces-lianpo', 'battle-of-changping', 8, '前 260 年', 'year', '趙括取代廉頗', '邯鄲／長平', array['趙孝成王','趙括','廉頗','藺相如','趙括之母'], '趙孝成王任命趙括接替廉頗。藺相如與趙括之母都曾反對，但趙王仍維持決定。', '趙王不滿廉頗屢有損失、又長期避戰；秦國反間消息宣稱秦軍最怕趙括；趙括又具有名將趙奢之子的聲望。', '久守不決與秦國反間共同推動換將。', '趙括改變約束與軍吏配置，趙軍由守勢轉向主動出擊。', '確切月日未見於主要記載；持久戰的經濟壓力不應被寫成史料已明言的唯一原因。', array['shiji-lianpo','shiji-baiqi','moe-paper-war'], true),
  ('changping-baiqi-secret-command', 'battle-of-changping', 9, '前 260 年', 'year', '秦國秘密改由白起統軍', '長平', array['秦昭襄王','白起','王齕'], '秦國暗中任命白起為上將軍，並禁止軍中洩露白起到任的消息。', '秦國判斷趙軍換將後可能改採進攻，希望由白起掌握決戰時機並保持情報優勢。', '趙括接掌趙軍，趙方戰法即將改變。', '秦軍預先部署誘敵、分割與斷糧戰術。', '「配合趙方換將」是事件順序上的合理判讀；秘密任命與禁洩密有史料明文。', array['shiji-baiqi'], true),
  ('changping-zhao-attacks', 'battle-of-changping', 10, '前 260 年', 'year', '趙括出擊，秦軍佯退誘敵', '長平', array['趙括','白起'], '趙括出兵攻秦，秦軍佯敗退卻，引導趙軍離開原有陣地。', '趙括接任後改變廉頗的固守策略；白起則利用趙軍轉守為攻的機會。', '雙方先後更換主將。', '秦軍以奇兵截斷趙軍後路與糧道。', '精確行軍路線與個別戰場位置仍有研究討論。', array['shiji-lianpo','shiji-baiqi'], true),
  ('changping-encircled', 'battle-of-changping', 11, '前 260 年', 'year', '趙軍被分割並斷糧', '長平', array['趙括','白起'], '秦軍切斷趙軍糧道與後路，將趙軍分為兩部分包圍。', '趙軍追擊秦軍後離開有利防線；秦軍預置奇兵從側後切斷聯繫。', '秦軍佯退，趙軍追擊。', '趙軍長期受困並逐漸斷糧。', '史料記載包圍與斷糧結果，現代對戰場空間的復原仍可能不同。', array['shiji-baiqi'], true),
  ('changping-zhaokuo-dies', 'battle-of-changping', 12, '前 260 年九月', 'month', '趙括突圍戰死，趙軍投降', '長平', array['趙括','白起'], '《史記》記趙軍斷糧四十六日，趙括率精兵突圍時被射殺；失去主將後，趙軍投降。', '趙軍被圍且糧食斷絕，必須嘗試突圍；突圍未能突破秦軍包圍。', '趙軍遭包圍並斷糧四十餘日。', '秦軍控制大批趙國降卒，戰事進入戰後處置。', '月份與四十六日依《史記》；不可換算成未有根據的現代確切日期。', array['shiji-baiqi','shiji-lianpo'], true),
  ('changping-after-surrender', 'battle-of-changping', 13, '前 260 年九月後', 'approximate', '秦軍處置趙國降卒', '長平', array['白起'], '《史記》記載秦軍大規模坑殺趙國降卒，只留下少數年幼者返回趙國。', '史料將此決策與秦方擔心降卒反覆、難以控制相連。', '趙軍主力投降。', '趙國人口與軍事力量遭受重大損失，秦趙力量對比改變。', '降卒人數與「坑」的具體形式存在考古與現代研究討論，頁面不得把史料數字當成無爭議統計。', array['shiji-baiqi','nccu-zhao-military'], true),
  ('changping-aftermath', 'battle-of-changping', 14, '前 259 年以後', 'range', '戰後影響與邯鄲危機', '趙國／邯鄲', array['趙孝成王','白起','王陵'], '趙國主力受創，秦國東進優勢擴大；但秦軍後續攻趙並非立即完成，邯鄲之戰仍出現反覆。', '長平之戰削弱趙國軍力，也加深秦趙衝突。', '趙軍在長平遭到重大失敗。', '秦軍進一步威脅邯鄲，魏、楚後來援趙。', '不應把長平之戰直接簡化成「秦立即統一」；統一仍經歷數十年與多次戰爭。', array['nccu-zhao-military','shiji-baiqi'], true);

insert into public.history_event_people (event_slug, person_slug, relationship_zh) values
  ('battle-of-changping', 'king-xiaocheng-zhao', '趙國君主與換將決策者'),
  ('battle-of-changping', 'lian-po', '趙軍前期主將'),
  ('battle-of-changping', 'zhao-kuo', '趙軍後期主將'),
  ('battle-of-changping', 'bai-qi', '秦軍決戰主將'),
  ('battle-of-changping', 'fan-ju', '秦相與反間策劃者'),
  ('battle-of-changping', 'lin-xiangru', '反對趙括領軍'),
  ('battle-of-changping', 'feng-ting', '上黨郡守');

insert into public.history_event_polities (event_slug, polity_slug, relationship_zh) values
  ('battle-of-changping', 'zhao', '交戰方'),
  ('battle-of-changping', 'qin-state', '交戰方'),
  ('battle-of-changping', 'han-state', '上黨原屬國');

insert into public.history_event_relations (from_event_slug, to_event_slug, relation_type, note_zh) values
  ('battle-of-changping', 'handan-relieved', 'context_for', '長平戰後趙國衰弱，秦軍進一步威脅邯鄲。'),
  ('handan-falls', 'dai-falls', 'leads_to', '邯鄲失守後，公子嘉在代地維持趙國殘餘政權。');

insert into public.history_source_links (source_slug, event_slug, claim_summary_zh, relationship) values
  ('shiji-zhao', 'hufu-qishe', '趙武靈王推行胡服騎射。', 'supports'),
  ('shiji-lianpo', 'battle-of-changping', '廉頗固守、趙括代將及趙軍戰敗的主要敘事。', 'supports'),
  ('shiji-baiqi', 'battle-of-changping', '上黨、反間、白起秘密接任、斷糧與戰後處置。', 'supports'),
  ('nccu-zhao-military', 'battle-of-changping', '趙國軍事與外交背景及戰後影響的現代研究。', 'context'),
  ('british-museum-qin', 'qin-unifies', '秦於前 221 年完成統一的博物館研究概述。', 'supports'),
  ('iwm-world-wars', 'first-world-war', '第一次世界大戰年代為 1914 至 1918 年。', 'supports'),
  ('iwm-world-wars', 'second-world-war', '第二次世界大戰年代為 1939 至 1945 年。', 'supports');

insert into public.history_source_links (source_slug, node_slug, claim_summary_zh, relationship)
select unnest(n.source_slugs), n.slug, n.title_zh, 'supports'
from public.history_event_nodes n
where n.event_slug = 'battle-of-changping';
