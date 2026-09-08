-- Follow-up from Supabase database advisors: avoid overlapping SELECT policies
-- and cover every history foreign key used for joins or cascades.

do $$
declare
  table_name text;
  admin_predicate text := 'exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = ''admin'')';
begin
  foreach table_name in array array[
    'history_regions', 'history_places', 'history_periods', 'history_polities', 'history_people',
    'history_storylines', 'history_events', 'history_event_nodes', 'history_sources',
    'history_event_people', 'history_event_polities', 'history_event_relations', 'history_source_links'
  ] loop
    execute format('drop policy if exists %I on public.%I', table_name || '_admin_write', table_name);
    execute format('create policy %I on public.%I for insert to authenticated with check (%s)', table_name || '_admin_insert', table_name, admin_predicate);
    execute format('create policy %I on public.%I for update to authenticated using (%s) with check (%s)', table_name || '_admin_update', table_name, admin_predicate, admin_predicate);
    execute format('create policy %I on public.%I for delete to authenticated using (%s)', table_name || '_admin_delete', table_name, admin_predicate);
  end loop;
end $$;

create index history_regions_parent_idx on public.history_regions (parent_slug) where parent_slug is not null;
create index history_places_region_idx on public.history_places (region_slug) where region_slug is not null;
create index history_periods_region_idx on public.history_periods (region_slug) where region_slug is not null;
create index history_polities_region_idx on public.history_polities (region_slug) where region_slug is not null;
create index history_people_polity_idx on public.history_people (primary_polity_slug) where primary_polity_slug is not null;
create index history_events_period_idx on public.history_events (period_slug);
create index history_events_place_idx on public.history_events (place_slug) where place_slug is not null;
create index history_event_people_person_idx on public.history_event_people (person_slug);
create index history_event_polities_polity_idx on public.history_event_polities (polity_slug);
create index history_event_relations_to_idx on public.history_event_relations (to_event_slug);
create index history_source_links_source_idx on public.history_source_links (source_slug);
