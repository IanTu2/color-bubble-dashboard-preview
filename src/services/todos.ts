import type { SupabaseClient } from '@supabase/supabase-js'

export type Todo = {
  id: string | number
  title: string
  due_date: string
  completed: boolean
  reminder_at: string | null
  completed_at: string | null
  created_at?: string
  updated_at?: string
}

export type TodoDraft = {
  title: string
  dueDate: string
  reminderAt: string | null
}

const extendedFields = 'id,title,due_date,completed,reminder_at,completed_at,created_at,updated_at'
const legacyFields = 'id,title,due_date,completed,created_at,updated_at'

function normalizeLegacyTodo(todo: Record<string, unknown>): Todo {
  return {
    id: String(todo.id ?? ''),
    title: String(todo.title ?? ''),
    due_date: String(todo.due_date ?? ''),
    completed: Boolean(todo.completed),
    reminder_at: null,
    completed_at: todo.completed ? String(todo.updated_at ?? todo.created_at ?? '') || null : null,
    created_at: todo.created_at ? String(todo.created_at) : undefined,
    updated_at: todo.updated_at ? String(todo.updated_at) : undefined,
  }
}

export async function loadTodos(client: SupabaseClient, userId: string) {
  const extended = await client
    .from('todos')
    .select(extendedFields)
    .eq('user_id', userId)
    .order('due_date', { ascending: true })

  if (!extended.error) {
    return { todos: (extended.data ?? []) as Todo[], extendedSchema: true, error: null }
  }

  const legacy = await client
    .from('todos')
    .select(legacyFields)
    .eq('user_id', userId)
    .order('due_date', { ascending: true })

  if (legacy.error) {
    return { todos: [] as Todo[], extendedSchema: false, error: legacy.error }
  }

  return {
    todos: (legacy.data ?? []).map((todo: Record<string, unknown>) => normalizeLegacyTodo(todo)),
    extendedSchema: false,
    error: null,
  }
}

export async function createTodo(
  client: SupabaseClient,
  userId: string,
  draft: TodoDraft,
  extendedSchema: boolean,
) {
  const values: Record<string, unknown> = {
    user_id: userId,
    title: draft.title,
    due_date: draft.dueDate,
  }

  if (extendedSchema) values.reminder_at = draft.reminderAt

  const fields = extendedSchema ? extendedFields : legacyFields
  const result = await client.from('todos').insert([values]).select(fields).single()

  if (result.error) return { todo: null, error: result.error }

  return {
    todo: extendedSchema
      ? (result.data as Todo)
      : normalizeLegacyTodo(result.data as Record<string, unknown>),
    error: null,
  }
}

export async function updateTodo(
  client: SupabaseClient,
  userId: string,
  todoId: string | number,
  draft: TodoDraft,
  extendedSchema: boolean,
) {
  const values: Record<string, unknown> = {
    title: draft.title,
    due_date: draft.dueDate,
  }
  if (extendedSchema) values.reminder_at = draft.reminderAt

  return client.from('todos').update(values).eq('id', todoId).eq('user_id', userId)
}

export async function setTodoCompleted(
  client: SupabaseClient,
  userId: string,
  todoId: string | number,
  completed: boolean,
  extendedSchema: boolean,
) {
  const values: Record<string, unknown> = { completed }
  if (extendedSchema) values.completed_at = completed ? new Date().toISOString() : null
  return client.from('todos').update(values).eq('id', todoId).eq('user_id', userId)
}

export async function removeTodo(client: SupabaseClient, userId: string, todoId: string | number) {
  return client.from('todos').delete().eq('id', todoId).eq('user_id', userId)
}
