import { useEffect, useMemo, useState } from 'react'
import { DashboardDetailDialog } from './DashboardDetailDialog'
import { supabase } from '../lib/supabase'
import type { Language } from '../types'

type HomeDashboardProps = {
  language: Language
  loggedIn: boolean
  userId?: string
}

type Todo = {
  id: string | number
  title: string
  due_date: string
  completed: boolean
}

type DetailMode = 'calendar' | 'todo' | null

function getCalendarDays(now: Date) {
  const year = now.getFullYear()
  const month = now.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: Array<number | null> = Array.from({ length: firstDay }, () => null)

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day)
  }

  while (cells.length % 7 !== 0) {
    cells.push(null)
  }

  return cells
}

function dateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function HomeDashboard({ language, loggedIn, userId }: HomeDashboardProps) {
  const [now, setNow] = useState(() => new Date())
  const [todos, setTodos] = useState<Todo[]>([])
  const [todoLoading, setTodoLoading] = useState(false)
  const [todoError, setTodoError] = useState(false)
  const [detailMode, setDetailMode] = useState<DetailMode>(null)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    let mounted = true

    if (!loggedIn || !userId) {
      setTodos([])
      setTodoLoading(false)
      setTodoError(false)
      setDetailMode(null)
      return () => {
        mounted = false
      }
    }

    setTodoLoading(true)
    setTodoError(false)
    void supabase
      .from('todos')
      .select('id,title,due_date,completed')
      .eq('user_id', userId)
      .order('due_date', { ascending: true })
      .then(({ data, error }) => {
        if (!mounted) return
        setTodos(error ? [] : ((data ?? []) as Todo[]))
        setTodoError(Boolean(error))
        setTodoLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [loggedIn, userId])

  const locale = language === 'zh' ? 'zh-TW' : 'en-US'
  const calendarDays = useMemo(() => getCalendarDays(now), [now])
  const weekdays = language === 'zh' ? ['日', '一', '二', '三', '四', '五', '六'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const monthLabel = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long' }).format(now)
  const dateLabel = new Intl.DateTimeFormat(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(now)
  const timeLabel = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hour12: false }).format(now)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const activeTodos = todos.filter((todo) => !todo.completed)
  const counts = [0, 2, 7, 30].map((days) =>
    activeTodos.filter((todo) => {
      const due = new Date(`${todo.due_date}T00:00:00`)
      const difference = Math.round((due.getTime() - today.getTime()) / 86400000)
      return difference >= 0 && difference <= days
    }).length,
  )
  const upcomingTodos = activeTodos.slice(0, 3)
  const taskDates = new Set(todos.map((todo) => todo.due_date))
  const copy =
    language === 'zh'
      ? {
          welcome: loggedIn ? '歡迎回到你的個人空間' : '歡迎來到你的個人空間',
          footer: '讓今天成為有進展的一天',
          calendar: '月曆',
          todo: '待辦事項',
          upcoming: '即將到來',
          dashboard: '登入後功能',
          periods: ['今天', '兩天內', '七天內', '30 天內'],
          loading: '載入待辦中…',
          empty: '目前沒有待辦事項',
          loadError: '待辦資料讀取失敗',
          openCalendar: '開啟完整月曆',
          openTodo: '開啟所有待辦事項',
          view: '查看',
        }
      : {
          welcome: loggedIn ? 'Welcome back to your personal space' : 'Welcome to your personal space',
          footer: 'Make today a day of progress',
          calendar: 'Calendar',
          todo: 'To-do',
          upcoming: 'Upcoming',
          dashboard: 'Signed-in features',
          periods: ['Today', 'Within 2 days', 'Within 7 days', 'Within 30 days'],
          loading: 'Loading to-dos…',
          empty: 'No to-dos yet',
          loadError: 'Could not load to-dos',
          openCalendar: 'Open full calendar',
          openTodo: 'Open all to-dos',
          view: 'View',
        }

  return (
    <main className={`page-shell${loggedIn ? ' member-layout' : ' guest-layout'}`}>
      <section className="hero-card" aria-label={copy.welcome}>
        <div className="hero-glow" aria-hidden="true" />
        <p className="hero-kicker">{copy.welcome}</p>
        <time className="clock" dateTime={now.toISOString()}>{timeLabel}</time>
        <p className="date">{dateLabel}</p>
        <div className="hero-footer">
          <span className="weather-dot" aria-hidden="true" />
          <span>{copy.footer}</span>
        </div>
      </section>

      {loggedIn ? (
        <aside className="member-dashboard" aria-label={copy.dashboard}>
          <button
            className="dashboard-card dashboard-card-button calendar-card"
            type="button"
            aria-label={copy.openCalendar}
            onClick={() => setDetailMode('calendar')}
          >
            <div className="card-head">
              <div>
                <p className="eyebrow">{copy.calendar}</p>
                <h2>{monthLabel}</h2>
              </div>
              <span className="card-view-label">{copy.view} →</span>
            </div>
            <div className="mini-calendar">
              {weekdays.map((weekday, index) => (
                <span className="weekday" key={`${weekday}-${index}`}>{weekday}</span>
              ))}
              {calendarDays.map((day, index) => {
                const currentDate = day ? dateKey(new Date(now.getFullYear(), now.getMonth(), day)) : ''
                const classNames = [day === now.getDate() ? 'today' : '', currentDate && taskDates.has(currentDate) ? 'has-task' : '']
                  .filter(Boolean)
                  .join(' ')
                return <span className={classNames} key={`${day ?? 'blank'}-${index}`}>{day ?? ''}</span>
              })}
            </div>
          </button>

          <button
            className="dashboard-card dashboard-card-button todo-card"
            type="button"
            aria-label={copy.openTodo}
            onClick={() => setDetailMode('todo')}
          >
            <div className="card-head">
              <div>
                <p className="eyebrow">{copy.todo}</p>
                <h2>{copy.upcoming}</h2>
              </div>
              <span className="card-view-label">{copy.view} →</span>
            </div>
            <div className="todo-buckets">
              {counts.map((count, index) => (
                <div className="todo-bucket" key={copy.periods[index]}>
                  <strong>{count}</strong>
                  <span>{copy.periods[index]}</span>
                </div>
              ))}
            </div>
            <div className="todo-preview">
              {todoLoading ? <div className="empty-state">{copy.loading}</div> : null}
              {!todoLoading && todoError ? <div className="empty-state error-state">{copy.loadError}</div> : null}
              {!todoLoading && !todoError && upcomingTodos.length === 0 ? <div className="empty-state">{copy.empty}</div> : null}
              {!todoLoading && !todoError
                ? upcomingTodos.map((todo) => (
                    <div className="todo-row" key={todo.id}>
                      <span className="todo-check" aria-hidden="true" />
                      <span>{todo.title}</span>
                      <time dateTime={todo.due_date}>{todo.due_date.slice(5).replace('-', '/')}</time>
                    </div>
                  ))
                : null}
            </div>
          </button>
        </aside>
      ) : null}

      <DashboardDetailDialog
        language={language}
        mode={detailMode}
        monthLabel={monthLabel}
        weekdays={weekdays}
        calendarDays={calendarDays}
        currentYear={now.getFullYear()}
        currentMonth={now.getMonth()}
        today={now.getDate()}
        taskDates={taskDates}
        todos={todos}
        loading={todoLoading}
        onClose={() => setDetailMode(null)}
      />
    </main>
  )
}
