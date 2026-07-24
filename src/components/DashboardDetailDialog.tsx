import type { MouseEvent } from 'react'
import type { Language } from '../types'

type Todo = {
  id: string | number
  title: string
  due_date: string
  completed: boolean
}

type DetailMode = 'calendar' | 'todo' | null

type DashboardDetailDialogProps = {
  language: Language
  mode: DetailMode
  monthLabel: string
  weekdays: string[]
  calendarDays: Array<number | null>
  currentYear: number
  currentMonth: number
  today: number
  taskDates: Set<string>
  todos: Todo[]
  loading: boolean
  onClose: () => void
}

function dateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function DashboardDetailDialog({
  language,
  mode,
  monthLabel,
  weekdays,
  calendarDays,
  currentYear,
  currentMonth,
  today,
  taskDates,
  todos,
  loading,
  onClose,
}: DashboardDetailDialogProps) {
  if (!mode) return null

  const copy = language === 'zh'
    ? {
        close: '關閉',
        calendar: '完整月曆',
        todo: '所有待辦事項',
        calendarHint: '粉紅色圓點代表當天有待辦事項。',
        todoHint: '目前先顯示帳號中的待辦資料，新增與編輯功能下一階段接入。',
        loading: '載入待辦中…',
        empty: '目前沒有待辦事項',
        completed: '已完成',
      }
    : {
        close: 'Close',
        calendar: 'Full calendar',
        todo: 'All to-dos',
        calendarHint: 'A pink dot marks dates that contain to-dos.',
        todoHint: 'This view currently shows account data. Add and edit controls arrive next.',
        loading: 'Loading to-dos…',
        empty: 'No to-dos yet',
        completed: 'Completed',
      }

  const activeTodos = todos.filter((todo) => !todo.completed)

  return (
    <div className="modal dashboard-detail-modal" role="presentation" onMouseDown={onClose}>
      <section
        className="dashboard-detail-shell"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dashboard-detail-title"
        onMouseDown={(event: MouseEvent<HTMLElement>) => event.stopPropagation()}
      >
        <button className="modal-close" type="button" aria-label={copy.close} onClick={onClose}>×</button>
        <p className="eyebrow">BUBBLE SPACE</p>
        <h2 id="dashboard-detail-title">{mode === 'calendar' ? copy.calendar : copy.todo}</h2>
        <p className="dashboard-detail-subtitle">{mode === 'calendar' ? copy.calendarHint : copy.todoHint}</p>

        {mode === 'calendar' ? (
          <>
            <h3 className="detail-month-label">{monthLabel}</h3>
            <div className="large-calendar">
              {weekdays.map((weekday, index) => (
                <span className="weekday" key={`${weekday}-${index}`}>{weekday}</span>
              ))}
              {calendarDays.map((day, index) => {
                const currentDate = day ? dateKey(new Date(currentYear, currentMonth, day)) : ''
                const classNames = [day === today ? 'today' : '', currentDate && taskDates.has(currentDate) ? 'has-task' : '']
                  .filter(Boolean)
                  .join(' ')
                return <span className={classNames} key={`${day ?? 'blank'}-${index}`}>{day ?? ''}</span>
              })}
            </div>
          </>
        ) : (
          <div className="detail-todo-list">
            {loading ? <div className="empty-state">{copy.loading}</div> : null}
            {!loading && activeTodos.length === 0 ? <div className="empty-state">{copy.empty}</div> : null}
            {!loading ? activeTodos.map((todo) => (
              <article className="detail-todo-row" key={todo.id}>
                <span className="todo-check" aria-hidden="true" />
                <div>
                  <strong>{todo.title}</strong>
                  <time dateTime={todo.due_date}>{todo.due_date}</time>
                </div>
              </article>
            )) : null}
            {!loading && todos.some((todo) => todo.completed) ? (
              <p className="completed-summary">{copy.completed}：{todos.filter((todo) => todo.completed).length}</p>
            ) : null}
          </div>
        )}
      </section>
    </div>
  )
}
