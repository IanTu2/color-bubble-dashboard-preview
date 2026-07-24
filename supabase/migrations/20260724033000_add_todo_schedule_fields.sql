-- Bubble Space v2: preserve existing todo rows while adding separate planned/deadline fields.

alter table public.todos
  add column if not exists planned_date date,
  add column if not exists planned_time time without time zone default '23:59:00',
  add column if not exists due_time time without time zone default '23:59:00',
  add column if not exists reminder_at timestamptz,
  add column if not exists completed_at timestamptz;

-- A deadline is optional in the v2 form. Existing dates are retained.
alter table public.todos
  alter column due_date drop not null;

update public.todos
set planned_time = coalesce(planned_time, '23:59:00'::time),
    due_time = coalesce(due_time, '23:59:00'::time)
where planned_time is null
   or due_time is null;

comment on column public.todos.planned_date is 'Date the user plans to work on the todo.';
comment on column public.todos.planned_time is 'Planned time; Bubble Space defaults this to 23:59.';
comment on column public.todos.due_date is 'Optional deadline date.';
comment on column public.todos.due_time is 'Deadline time; Bubble Space defaults this to 23:59.';
