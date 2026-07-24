import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import {
  createTodo,
  removeTodo,
  setTodoCompleted,
  updateTodo,
  type Todo,
  type TodoDraft,
  type TodoSchema,
} from '../services/todos'
import type { Language } from '../types'

type TodoManagerProps = {
  language: Language
  userId: string
  todos: Todo[]
  loading: boolean
  error: boolean
  schemaMode: TodoSchema
  initialDate?: string | null
  onChanged: () => Promise<void>
  onNotice: (message: string) => void
}

type TodoMode = 'active' | 'completed'
type PanelMode = 'add' | 'search'
type RangeFilter = 0 | 2 | 7 | 30 | 'all'

function shortTime(value: string | null) {
  return value ? value.slice(0, 5) : '23:59'
}

function targetDate(todo: Todo) {
  return todo.due_date || todo.planned_date
}

function dateDifference(value: string | null) {
  if (!value) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(`${value}T00:00:00`)
  return Math.round((target.getTime() - today.getTime()) / 86400000)
}

function isOverdue(todo: Todo) {
  if (todo.completed || !todo.due_date) return false
  const dueTime = shortTime(todo.due_time)
  return new Date(`${todo.due_date}T${dueTime}:00`).getTime() < Date.now()
}

export function TodoManager({
  language,
  userId,
  todos,
  loading,
  error,
  schemaMode,
  initialDate,
  onChanged,
  onNotice,
}: TodoManagerProps) {
  const [panelMode, setPanelMode] = useState<PanelMode>(initialDate ? 'add' : 'search')
  const [mode, setMode] = useState<TodoMode>('active')
  const [rangeFilter, setRangeFilter] = useState<RangeFilter>('all')
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState<string | number | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!initialDate) return
    setEditingId(null)
    setPanelMode('add')
  }, [initialDate])

  const copy = language === 'zh'
    ? {
        title: '代辦事項',
        subtitle: '填入代辦事項',
        addMode: '新增',
        searchMode: '查詢',
        taskName: '填入代辦事項',
        plannedDate: '計畫日期',
        plannedTime: '計畫時間',
        dueDate: '截止日期（選填）',
        dueTime: '截止時間',
        plannedHint: '設定預計處理這項待辦的日期與時間。',
        dueHint: '截止日期可以留空；時間預設為 23:59。',
        add: '新增待辦',
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
        migrationHint: '資料庫尚未套用四欄位 migration；計畫日期與時間暫時不會保存，且目前至少需要填寫一個日期。',
        dateRequiredLegacy: '資料庫升級前，計畫日期或截止日期至少要填寫一個。',
        ranges: ['今天', '兩天內', '七天內', '30 天內'],
        all: '全部',
        planned: '計畫',
        deadline: '截止',
        noDate: '未設定日期',
      }
    : {
        title: 'To-dos',
        subtitle: 'Enter a to-do',
        addMode: 'Add',
        searchMode: 'Search',
        taskName: 'To-do title',
        plannedDate: 'Planned date',
        plannedTime: 'Planned time',
        dueDate: 'Deadline date (optional)',
        dueTime: 'Deadline time',
        plannedHint: 'Choose when you plan to work on this item.',
        dueHint: 'The deadline date is optional. Time defaults to 23:59.',
        add: 'Add to-do',
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
        migrationHint: 'The four-field database migration is not applied yet. Planned date/time will not be saved, and at least one date is currently required.',
        dateRequiredLegacy: 'Before the database upgrade, enter either a planned date or a deadline date.',
        ranges: ['Today', 'Within 2 days', 'Within 7 days', 'Within 30 days'],
        all: 'All',
        planned: 'Planned',
        deadline: 'Deadline',
        noDate: 'No date',
      }

  const editingTodo = todos.find((todo) => String(todo.id) === String(editingId)) ?? null
  const activeTodos = todos.filter((todo) => !todo.completed)
  const activeCount = activeTodos.length
  const completedCount = todos.filter((todo) => todo.completed).length
  const rangeValues: Array<0 | 2 | 7 | 30> = [0, 2, 7, 30]
  const rangeCounts = rangeValues.map((days) => activeTodos.filter((todo) => {
    const difference = dateDifference(targetDate(todo))
    return difference !== null && difference >= 0 && difference <= days
  }).length)

  const visibleTodos = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()
    return todos
      .filter((todo) => (mode === 'completed' ? todo.completed : !todo.completed))
      .filter((todo) => {
        if (rangeFilter === 'all') return true
        const difference = dateDifference(targetDate(todo))
        return difference !== null && difference >= 0 && difference <= rangeFilter
      })
      .filter((todo) => !normalizedQuery || todo.title.toLocaleLowerCase().includes(normalizedQuery))
      .sort((a, b) => (targetDate(a) ?? '9999-12-31').localeCompare(targetDate(b) ?? '9999-12-31'))
  }, [mode, query, rangeFilter, todos])

  const submitTodo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return

    const form = new FormData(event.currentTarget)
    const title = String(form.get('title') ?? '').trim()
    const plannedDate = String(form.get('plannedDate') ?? '') || null
    const plannedTime = String(form.get('plannedTime') ?? '') || '23:59'
    const dueDate = String(form.get('dueDate') ?? '') || null
    const dueTime = String(form.get('dueTime') ?? '') || '23:59'
    if (!title) return
    if (schemaMode !== 'schedule' && !plannedDate && !dueDate) {
      onNotice(copy.dateRequiredLegacy)
      return
    }

    const draft: TodoDraft = {
      title,
      plannedDate,
      plannedTime,
      dueDate,
      dueTime,
      reminderAt: editingTodo?.reminder_at ?? null,
    }

    setBusy(true)
    try {
      const result = editingTodo
        ? await updateTodo(supabase, userId, editingTodo.id, draft, schemaMode)
        : await createTodo(supabase, userId, draft, schemaMode)

      if (result.error) {
        onNotice(copy.failed)
        return
      }

      setEditingId(null)
      setPanelMode('search')
      setRangeFilter('all')
      onNotice(editingTodo ? copy.updated : copy.added)
      await onChanged()
    } catch {
      onNotice(copy.failed)
    } finally {
      setBusy(false)
    }
  }

  const toggleCompleted = async (todo: Todo) => {
    if (busy) return
    setBusy(true)
    try {
      const result = await setTodoCompleted(supabase, userId, todo.id, !todo.completed, schemaMode)
      if (result.error) {
        onNotice(copy.failed)
        return
      }
      onNotice(copy.completedNotice)
      await onChanged()
    } catch {
      onNotice(copy.failed)
    } finally {
      setBusy(false)
    }
  }

  const deleteTodo = async (todo: Todo) => {
    if (busy || !window.confirm(`${copy.remove}「${todo.title}」？`)) return
    setBusy(true)
    try {
      const result = await removeTodo(supabase, userId, todo.id)
      if (result.error) {
        onNotice(copy.failed)
        return
      }
      if (String(editingId) === String(todo.id)) setEditingId(null)
      onNotice(copy.deleted)
      await onChanged()
    } catch {
      onNotice(copy.failed)
    } finally {
      setBusy(false)
    }
  }

  const openAdd = () => {
    setEditingId(null)
    setPanelMode('add')
  }

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id)
    setPanelMode('add')
  }

  const formKey = editingTodo ? `edit-${editingTodo.id}` : `add-${initialDate ?? 'blank'}`
  const defaultPlannedDate = editingTodo?.planned_date ?? ''
  const defaultPlannedTime = shortTime(editingTodo?.planned_time)
  const defaultDueDate = editingTodo?.due_date ?? initialDate ?? ''
  const defaultDueTime = shortTime(editingTodo?.due_time)

  return (
    <div className="todo-manager">
      <div className="todo-manager-heading">
        <div>
          <p className="eyebrow">BUBBLE SPACE</p>
          <h2>{copy.title}</h2>
          <p>{copy.subtitle}</p>
        </div>
        <div className="todo-primary-actions" role="tablist">
          <button className={panelMode === 'add' ? 'active' : ''} type="button" role="tab" aria-selected={panelMode === 'add'} onClick={openAdd}>＋ {copy.addMode}</button>
          <button className={panelMode === 'search' ? 'active' : ''} type="button" role="tab" aria-selected={panelMode === 'search'} onClick={() => setPanelMode('search')}>⌕ {copy.searchMode}</button>
        </div>
      </div>

      {panelMode === 'add' ? (
        <>
          <form className="todo-editor schedule-editor" key={formKey} onSubmit={submitTodo}>
            <label className="todo-title-field schedule-title-field">
              <span>{copy.taskName}</span>
              <input name="title" type="text" maxLength={100} required defaultValue={editingTodo?.title ?? ''} autoFocus />
            </label>

            <fieldset className="schedule-side planned-side">
              <legend>{copy.planned}</legend>
              <p>{copy.plannedHint}</p>
              <div className="schedule-field-pair">
                <label>
                  <span>{copy.plannedDate}</span>
                  <input name="plannedDate" type="date" defaultValue={defaultPlannedDate} />
                </label>
                <label>
                  <span>{copy.plannedTime}</span>
                  <input name="plannedTime" type="time" defaultValue={defaultPlannedTime} />
                </label>
              </div>
            </fieldset>

            <fieldset className="schedule-side deadline-side">
              <legend>{copy.deadline}</legend>
              <p>{copy.dueHint}</p>
              <div className="schedule-field-pair">
                <label>
                  <span>{copy.dueDate}</span>
                  <input name="dueDate" type="date" defaultValue={defaultDueDate} />
                </label>
                <label>
                  <span>{copy.dueTime}</span>
                  <input name="dueTime" type="time" defaultValue={defaultDueTime} />
                </label>
              </div>
            </fieldset>

            <div className="schedule-form-actions">
              <button className="primary-button" type="submit" disabled={busy}>{busy ? '…' : editingTodo ? copy.save : copy.add}</button>
              {editingTodo ? <button className="secondary-button" type="button" onClick={() => setEditingId(null)}>{copy.cancel}</button> : null}
            </div>
          </form>
          {schemaMode !== 'schedule' ? <p className="schema-hint migration-hint">{copy.migrationHint}</p> : null}
        </>
      ) : (
        <>
          <div className="todo-range-grid" aria-label={copy.searchMode}>
            {rangeValues.map((days, index) => (
              <button className={rangeFilter === days ? 'active' : ''} type="button" onClick={() => setRangeFilter(days)} key={days}>
                <strong>{rangeCounts[index]}</strong>
                <span>{copy.ranges[index]}</span>
              </button>
            ))}
          </div>

          <div className="todo-manager-tools">
            <div className="todo-view-tabs" role="tablist">
              <button className={mode === 'active' ? 'active' : ''} type="button" role="tab" aria-selected={mode === 'active'} onClick={() => setMode('active')}>{copy.active} ({activeCount})</button>
              <button className={mode === 'completed' ? 'active' : ''} type="button" role="tab" aria-selected={mode === 'completed'} onClick={() => setMode('completed')}>{copy.completed} ({completedCount})</button>
              <button className={rangeFilter === 'all' ? 'active' : ''} type="button" onClick={() => setRangeFilter('all')}>{copy.all}</button>
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
            {!loading && !error ? visibleTodos.map((todo) => (
              <article className={`full-todo${todo.completed ? ' done' : ''}${isOverdue(todo) ? ' overdue' : ''}`} key={todo.id}>
                <button className="todo-toggle" type="button" disabled={busy} aria-label={todo.completed ? copy.reopen : copy.complete} onClick={() => void toggleCompleted(todo)}>{todo.completed ? '✓' : ''}</button>
                <div className="todo-main-copy">
                  <strong>{todo.title}</strong>
                  <div className="todo-meta schedule-meta">
                    {todo.planned_date ? <span>{copy.planned}：<time dateTime={`${todo.planned_date}T${shortTime(todo.planned_time)}`}>{todo.planned_date} {shortTime(todo.planned_time)}</time></span> : null}
                    {todo.due_date ? <span>{copy.deadline}：<time dateTime={`${todo.due_date}T${shortTime(todo.due_time)}`}>{todo.due_date} {shortTime(todo.due_time)}</time></span> : null}
                    {!todo.planned_date && !todo.due_date ? <span>{copy.noDate}</span> : null}
                    {isOverdue(todo) ? <span className="overdue-label">{copy.overdue}</span> : null}
                  </div>
                </div>
                <div className="todo-actions">
                  <button type="button" disabled={busy} aria-label={copy.edit} onClick={() => startEditing(todo)}>✎</button>
                  <button type="button" disabled={busy} aria-label={copy.remove} onClick={() => void deleteTodo(todo)}>×</button>
                </div>
              </article>
            )) : null}
          </div>
        </>
      )}
    </div>
  )
}
