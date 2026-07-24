import type { MouseEvent } from 'react'
import { TodoManager } from './TodoManager'
import type { Todo } from '../services/todos'
import type { Language } from '../types'

type DetailMode = 'calendar' | 'todo' | null

type DashboardDetailDialogProps = {
  language: Language
  mode: DetailMode
  userId: string
  monthLabel: string
  weekdays: string[]
  calendarDays: Array<number | null>
  currentYear: number
  currentMonth: number
  today: number
  taskDates: Set<string>
  todos: Todo[]
  loading: boolean
  error: boolean
  extendedSchema: boolean
  selectedDate?: string | null
  onSelectDate: (date: string) => void
  onChanged: () => Promise<void>
  onNotice: (message: string) => void
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
  userId,
  monthLabel,
  weekdays,
  calendarDays,
  currentYear,
  currentMonth,
  today,
  taskDates,
  todos,
  loading,
  error,
  extendedSchema,
  selectedDate,
  onSelectDate,
  onChanged,
  onNotice,
  onClose,
}: DashboardDetailDialogProps) {
  if (!mode) return null

  const copy = language === 'zh'
    ? {
        close: '關閉',
        calendar: '完整月曆',
        calendarHint: '點選日期可直接新增或查看該日的待辦事項；粉紅色圓點代表已有待辦。',
        openDate: '查看這一天的待辦事項',
      }
    : {
        close: 'Close',
        calendar: 'Full calendar',
        calendarHint: 'Select a date to add or review to-dos. A pink dot marks dates with existing items.',
        openDate: 'Open to-dos for this date',
      }

  return (
    <div className="modal dashboard-detail-modal" role="presentation" onMouseDown={onClose}>
      <section
        className={`dashboard-detail-shell${mode === 'todo' ? ' todo-detail-shell' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dashboard-detail-title"
        onMouseDown={(event: MouseEvent<HTMLElement>) => event.stopPropagation()}
      >
        <button className="modal-close" type="button" aria-label={copy.close} onClick={onClose}>×</button>

        {mode === 'calendar' ? (
          <>
            <p className="eyebrow">BUBBLE SPACE</p>
            <h2 id="dashboard-detail-title">{copy.calendar}</h2>
            <p className="dashboard-detail-subtitle">{copy.calendarHint}</p>
            <h3 className="detail-month-label">{monthLabel}</h3>
            <div className="large-calendar">
              {weekdays.map((weekday, index) => (
                <span className="weekday" key={`${weekday}-${index}`}>{weekday}</span>
              ))}
              {calendarDays.map((day, index) => {
                if (!day) return <span className="calendar-empty" key={`blank-${index}`} />
                const currentDate = dateKey(new Date(currentYear, currentMonth, day))
                const classNames = [day === today ? 'today' : '', taskDates.has(currentDate) ? 'has-task' : '']
                  .filter(Boolean)
                  .join(' ')
                return (
                  <button
                    className={classNames}
                    type="button"
                    aria-label={`${copy.openDate} ${currentDate}`}
                    onClick={() => onSelectDate(currentDate)}
                    key={currentDate}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <TodoManager
            language={language}
            userId={userId}
            todos={todos}
            loading={loading}
            error={error}
            extendedSchema={extendedSchema}
            initialDate={selectedDate}
            onChanged={onChanged}
            onNotice={onNotice}
          />
        )}
      </section>
    </div>
  )
}
