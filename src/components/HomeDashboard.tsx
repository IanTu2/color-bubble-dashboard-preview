import { useEffect, useMemo, useState } from 'react'
import type { Language } from '../types'

type HomeDashboardProps = {
  language: Language
  loggedIn: boolean
}

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

export function HomeDashboard({ language, loggedIn }: HomeDashboardProps) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const locale = language === 'zh' ? 'zh-TW' : 'en-US'
  const calendarDays = useMemo(() => getCalendarDays(now), [now])
  const weekdays = language === 'zh' ? ['日', '一', '二', '三', '四', '五', '六'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const monthLabel = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long' }).format(now)
  const dateLabel = new Intl.DateTimeFormat(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(now)
  const timeLabel = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hour12: false }).format(now)
  const copy =
    language === 'zh'
      ? {
          welcome: loggedIn ? '歡迎回到你的個人空間' : '歡迎來到你的個人空間',
          footer: '讓今天成為有進展的一天',
          calendar: '月曆',
          todo: '待辦事項',
          upcoming: '即將到來',
          preview: '登入後功能預覽資料',
          tasks: ['整理 React 架構', '確認測試站部署', '規劃登入模組'],
          periods: ['今天', '本週', '本月', '稍後'],
        }
      : {
          welcome: loggedIn ? 'Welcome back to your personal space' : 'Welcome to your personal space',
          footer: 'Make today a day of progress',
          calendar: 'Calendar',
          todo: 'To-do',
          upcoming: 'Upcoming',
          preview: 'Signed-in feature preview data',
          tasks: ['Organize React structure', 'Verify preview deployment', 'Plan account module'],
          periods: ['Today', 'Week', 'Month', 'Later'],
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
        <aside className="member-dashboard" aria-label={copy.preview}>
          <article className="dashboard-card calendar-card">
            <div className="card-head">
              <div>
                <p className="eyebrow">{copy.calendar}</p>
                <h2>{monthLabel}</h2>
              </div>
              <span className="preview-chip">V2</span>
            </div>
            <div className="mini-calendar">
              {weekdays.map((weekday, index) => (
                <span className="weekday" key={`${weekday}-${index}`}>{weekday}</span>
              ))}
              {calendarDays.map((day, index) => (
                <span className={day === now.getDate() ? 'today' : ''} key={`${day ?? 'blank'}-${index}`}>
                  {day ?? ''}
                </span>
              ))}
            </div>
          </article>

          <article className="dashboard-card todo-card">
            <div className="card-head">
              <div>
                <p className="eyebrow">{copy.todo}</p>
                <h2>{copy.upcoming}</h2>
              </div>
              <span className="preview-chip">V2</span>
            </div>
            <div className="todo-buckets">
              {[2, 4, 7, 1].map((count, index) => (
                <div className="todo-bucket" key={copy.periods[index]}>
                  <strong>{count}</strong>
                  <span>{copy.periods[index]}</span>
                </div>
              ))}
            </div>
            <div className="todo-preview">
              {copy.tasks.map((task, index) => (
                <div className="todo-row" key={task}>
                  <span className="todo-check" aria-hidden="true" />
                  <span>{task}</span>
                  <time>{index === 0 ? '10:00' : index === 1 ? '14:30' : '18:00'}</time>
                </div>
              ))}
            </div>
          </article>
        </aside>
      ) : null}
    </main>
  )
}
