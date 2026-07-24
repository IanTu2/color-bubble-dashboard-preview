import type { SupabaseClient } from '@supabase/supabase-js'

export type TodoSchema = 'schedule' | 'extended' | 'legacy'

export type Todo = {
  id: string | number
  title: string
  planned_date: string | null
  planned_time: string | null
  due_date: string | null
  due_time: string | null
  completed: boolean
  reminder_at: string | null
  completed_at: string | null
  created_at?: string
  updated_at?: string
}

export type TodoDraft = {
  title: string
  plannedDate: string | null
  plannedTime: string
  dueDate: string | null
  dueTime: string
  reminderAt: string | null
}

const scheduleFields = 'id,title,planned_date,planned_time,due_date,due_time,completed,reminder_at,completed_at,created_at,updated_at'
const extendedFields = 'id,title,due_date,completed,reminder_at,completed_at,created_at,updated_at'
const legacyFields = 'id,title,due_date,completed,created_at,updated_at'

function optionalString(value: unknown) {
  return value === null || value === undefined || value === '' ? null : String(value)
}

function normalizeTodo(todo: Record<string, unknown>, schema: TodoSchema): Todo {
  return {
    id: String(todo.id ?? ''),
    title: String(todo.title ?? ''),
    planned_date: schema === 'schedule' ? optionalString(todo.planned_date) : null,
    planned_time: schema === 'schedule' ? optionalString(todo.planned_time) ?? '23:59:00' : null,
    due_date: optionalString(todo.due_date),
    due_time: schema === 'schedule' ? optionalString(todo.due_time) ?? '23:59:00' : '23:59:00',
    completed: Boolean(todo.completed),
    reminder_at: schema === 'legacy' ? null : optionalString(todo.reminder_at),
    completed_at:
      schema === 'legacy'
        ? todo.completed
          ? optionalString(todo.updated_at ?? todo.created_at)
          : null
        : optionalString(todo.completed_at),
    created_at: todo.created_at ? String(todo.created_at) : undefined,
    updated_at: todo.updated_at ? String(todo.updated_at) : undefined,
  }
}

function rowsFrom(data: unknown) {
  return (data as Record<string, unknown>[] | null) ?? []
}

export async function loadTodos(client: SupabaseClient, userId: string) {
  const schedule = await client
    .from('todos')
    .select(scheduleFields)
    .eq('user_id', userId)
    .order('due_date', { ascending: true })

  if (!schedule.error) {
    return {
      todos: rowsFrom(schedule.data).map((todo) => normalizeTodo(todo, 'schedule')),
      schemaMode: 'schedule' as TodoSchema,
      error: null,
    }
  }

  const extended = await client
    .from('todos')
    .select(extendedFields)
    .eq('user_id', userId)
    .order('due_date', { ascending: true })

  if (!extended.error) {
    return {
      todos: rowsFrom(extended.data).map((todo) => normalizeTodo(todo, 'extended')),
      schemaMode: 'extended' as TodoSchema,
      error: null,
    }
  }

  const legacy = await client
    .from('todos')
    .select(legacyFields)
    .eq('user_id', userId)
    .order('due_date', { ascending: true })

  if (legacy.error) {
    return { todos: [] as Todo[], schemaMode: 'legacy' as TodoSchema, error: legacy.error }
  }

  return {
    todos: rowsFrom(legacy.data).map((todo) => normalizeTodo(todo, 'legacy')),
    schemaMode: 'legacy' as TodoSchema,
    error: null,
  }
}

function valuesForDraft(userId: string, draft: TodoDraft, schemaMode: TodoSchema) {
  const values: Record<string, unknown> = {
    user_id: userId,
    title: draft.title,
  }

  if (schemaMode === 'schedule') {
    values.planned_date = draft.plannedDate
    values.planned_time = draft.plannedTime || '23:59'
    values.due_date = draft.dueDate
    values.due_time = draft.dueTime || '23:59'
    values.reminder_at = draft.reminderAt
    return values
  }

  const compatibleDate = draft.dueDate || draft.plannedDate
  if (!compatibleDate) return null

  values.due_date = compatibleDate
  if (schemaMode === 'extended') values.reminder_at = draft.reminderAt
  return values
}

export async function createTodo(
  client: SupabaseClient,
  userId: string,
  draft: TodoDraft,
  schemaMode: TodoSchema,
) {
  const values = valuesForDraft(userId, draft, schemaMode)
  if (!values) return { todo: null, error: new Error('A date is required before the schedule migration is applied.') }

  const fields = schemaMode === 'schedule' ? scheduleFields : schemaMode === 'extended' ? extendedFields : legacyFields
  const result = await client.from('todos').insert([values]).select(fields).single()

  if (result.error) return { todo: null, error: result.error }

  return {
    todo: normalizeTodo((result.data as unknown as Record<string, unknown>) ?? {}, schemaMode),
    error: null,
  }
}

export async function updateTodo(
  client: SupabaseClient,
  userId: string,
  todoId: string | number,
  draft: TodoDraft,
  schemaMode: TodoSchema,
) {
  const values = valuesForDraft(userId, draft, schemaMode)
  if (!values) return { error: new Error('A date is required before the schedule migration is applied.') }
  delete values.user_id
  return client.from('todos').update(values).eq('id', todoId).eq('user_id', userId)
}

export async function setTodoCompleted(
  client: SupabaseClient,
  userId: string,
  todoId: string | number,
  completed: boolean,
  schemaMode: TodoSchema,
) {
  const values: Record<string, unknown> = { completed }
  if (schemaMode !== 'legacy') values.completed_at = completed ? new Date().toISOString() : null
  return client.from('todos').update(values).eq('id', todoId).eq('user_id', userId)
}

export async function removeTodo(client: SupabaseClient, userId: string, todoId: string | number) {
  return client.from('todos').delete().eq('id', todoId).eq('user_id', userId)
}
