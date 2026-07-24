import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import {
  createTodo,
  removeTodo,
  setTodoCompleted,
  updateTodo,
  type Todo,
  type TodoDraft,
} from '../services/todos'
import type { Language } from '../types'

type TodoManagerProps = {
  language: Language
  userId: string
  todos: Todo[]
  loading: boolean
  error: boolean
  extendedSchema: boolean
  initialDate?: string | null
  onChanged: () => Promise<void>
  onNotice: (message: string) => void
}

type TodoMode = 'active' | 'completed'

function toLocalInput(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

export function TodoManager({
  language,
  userId,
  todos,
  loading,
  error,
  extendedSchema,
  initialDate,
  onChanged,
  onNotice,
}: TodoManagerProps) {
  const [mode, setMode] = useState<TodoMode>('active')
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState<string | number | null>(null)
  const [busy, setBusy] = useState(false)

  const copy = language === 'zh'
    ? {
        title: '代辦事項',
        subtitle: '新增、搜尋、完成、編輯或刪除待辦事項。',
        taskName: '待辦事項名稱',
        dueDate: '截止日期',
        reminder: '提醒時間（選填）',
        add: '新增',
        save: '儲存修改',
        cancel: '取消編輯',
        active: '進行中',
        completed: '完成紀錄',
        search: '搜尋待辦事項',
        empty: '目前沒有待辦事項',
        noResult: '找不到符合的待辦事項',
        loadError: '待辦資料讀取失敗，請稍後再試。',
        overdue: '已逾期',
        edit: '編輯',
        remove: '刪除',
        complete: '標記完成',
        reopen: '恢復為進行中',
        added: '待辦事項已新增。',
        updated: '待辦事項已更新。',
        deleted: '待辦事項已刪除。',
        completedNotice: '完成狀態已更新。',
        failed: '操作失敗，請稍後再試。',
        legacyHint: '目前資料表尚未啟用提醒欄位，提醒時間暫時不會儲存。',
      }
    : {
        title: 'To-dos',
        subtitle: 'Add, search, complete, edit, or delete your to-dos.',
        taskName: 'To-do title',
        dueDate: 'Due date',
        reminder: 'Reminder time (optional)',
        add: 'Add',
        save: 'Save changes',
        cancel: 'Cancel edit',
        active: 'Active',
        completed: 'Completed',
        search: 'Search to-dos',
        empty: 'No to-dos yet',
        noResult: 'No matching to-dos',
        loadError: 'Could not load to-dos. Try again later.',
        overdue: 'Overdue',
        edit: 'Edit',
        remove: 'Delete',
        complete: 'Mark complete',
        reopen: 'Move back to active',
        added: 'To-do added.',
        updated: 'To-do updated.',
        deleted: 'To-do deleted.',
        completedNotice: 'Completion status updated.',
        failed: 'The action failed. Please try again.',
        legacyHint: 'The reminder column is not enabled yet, so reminder time will not be saved.',
      }

  const editingTodo = todos.find((todo) => String(todo.id) === String(editingId)) ?? null
  const activeCount = todos.filter((todo) => !todo.completed).length
  const completedCount = todos.filter((todo) => todo.completed).length
  const visibleTodos = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()
    return todos
      .filter((todo) => (mode === 'completed' ? todo.completed : !todo.completed))
      .filter((todo) => !normalizedQuery || todo.title.toLocaleLowerCase().includes(normalizedQuery))
      .sort((a, b) => a.due_date.localeCompare(b.due_date))
  }, [mode, query, todos])

  const submitTodo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return

    const form = new FormData(event.currentTarget)
    const title = String(form.get('title') ?? '').trim()
    const dueDate = String(form.get('dueDate') ?? '')
    const reminderValue = String(form.get('reminderAt') ?? '')
    if (!title || !dueDate) return

    const draft: TodoDraft = {
      title,
      dueDate,
      reminderAt: reminderValue ? new Date(reminderValue).toISOString() : null,
    }

    setBusy(true)
    const result = editingTodo
      ? await updateTodo(supabase, userId, editingTodo.id, draft, extendedSchema)
      : await createTodo(supabase, userId, draft, extendedSchema)
    setBusy(false)

    if (result.error) {
      onNotice(copy.failed)
      return
    }

    setEditingId(null)
    event.currentTarget.reset()
    onNotice(editingTodo ? copy.updated : copy.added)
    await onChanged()
  }

  const toggleCompleted = async (todo: Todo) => {
    if (busy) return
    setBusy(true)
    const result = await setTodoCompleted(supabase, userId, todo.id, !todo.completed, extendedSchema)
    setBusy(false)
    if (result.error) {
      onNotice(copy.failed)
      return
    }
    onNotice(copy.completedNotice)
    await onChanged()
  }

  const deleteTodo = async (todo: Todo) => {
    if (busy || !window.confirm(`${copy.remove}「${todo.title}」？`)) return
    setBusy(true)
    const result = await removeTodo(supabase, userId, todo.id)
    setBusy(false)
    if (result.error) {
      onNotice(copy.failed)
      return
    }
    if (String(editingId) === String(todo.id)) setEditingId(null)
    onNotice(copy.deleted)
    await onChanged()
  }

  const formKey = editingTodo ? `edit-${editingTodo.id}` : `add-${initialDate ?? 'today'}`
  const defaultDate = editingTodo?.due_date ?? initialDate ?? new Date().toISOString().slice(0, 10)
  const defaultReminder = toLocalInput(editingTodo?.reminder_at ?? null)

  return (
    <div className="todo-manager">
      <div className="todo-manager-heading">
        <div>
          <p className="eyebrow">BUBBLE SPACE</p>
          <h2>{copy.title}</h2>
          <p>{copy.subtitle}</p>
        </div>
      </div>

      <form className="todo-editor" key={formKey} onSubmit={submitTodo}>
        <label className="todo-title-field">
          <span>{copy.taskName}</span>
          <input name="title" type="text" maxLength={100} required defaultValue={editingTodo?.title ?? ''} />
        </label>
        <label>
          <span>{copy.dueDate}</span>
          <input name="dueDate" type="date" required defaultValue={defaultDate} />
        </label>
        <label>
          <span>{copy.reminder}</span>
          <input name="reminderAt" type="datetime-local" defaultValue={defaultReminder} disabled={!extendedSchema} />
        </label>
        <button className="primary-button" type="submit" disabled={busy}>{busy ? '…' : editingTodo ? copy.save : copy.add}</button>
        {editingTodo ? (
          <button className="secondary-button" type="button" onClick={() => setEditingId(null)}>{copy.cancel}</button>
        ) : null}
      </form>

      {!extendedSchema ? <p className="schema-hint">{copy.legacyHint}</p> : null}

      <div className="todo-manager-tools">
        <div className="todo-view-tabs" role="tablist">
          <button className={mode === 'active' ? 'active' : ''} type="button" role="tab" aria-selected={mode === 'active'} onClick={() => setMode('active')}>{copy.active} ({activeCount})</button>
          <button className={mode === 'completed' ? 'active' : ''} type="button" role="tab" aria-selected={mode === 'completed'} onClick={() => setMode('completed')}>{copy.completed} ({completedCount})</button>
        </div>
        <label className="todo-search-field">
          <span className="sr-only">{copy.search}</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.search} />
        </label>
      </div>

      <div className="full-todo-list">
        {loading ? <div className="empty-state">…</div> : null}
        {!loading && error ? <div className="empty-state error-state">{copy.loadError}</div> : null}
        {!loading && !error && visibleTodos.length === 0 ? <div className="empty-state">{query ? copy.noResult : copy.empty}</div> : null}
        {!loading && !error ? visibleTodos.map((todo) => {
          const overdue = !todo.completed && todo.due_date < new Date().toISOString().slice(0, 10)
          return (
            <article className={`full-todo${todo.completed ? ' done' : ''}${overdue ? ' overdue' : ''}`} key={todo.id}>
              <button className="todo-toggle" type="button" aria-label={todo.completed ? copy.reopen : copy.complete} onClick={() => void toggleCompleted(todo)}>{todo.completed ? '✓' : ''}</button>
              <div className="todo-main-copy">
                <strong>{todo.title}</strong>
                <div className="todo-meta">
                  <time dateTime={todo.due_date}>{todo.due_date}</time>
                  {overdue ? <span className="overdue-label">{copy.overdue}</span> : null}
                  {todo.reminder_at ? <span>{new Intl.DateTimeFormat(language === 'zh' ? 'zh-TW' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(todo.reminder_at))}</span> : null}
                </div>
              </div>
              <div className="todo-actions">
                <button type="button" aria-label={copy.edit} onClick={() => setEditingId(todo.id)}>✎</button>
                <button type="button" aria-label={copy.remove} onClick={() => void deleteTodo(todo)}>×</button>
              </div>
            </article>
          )
        }) : null}
      </div>
    </div>
  )
}
