import type { CSSProperties } from 'react'

const bubbles = Array.from({ length: 24 }, (_, index) => ({
  id: index,
  size: 42 + ((index * 29) % 96),
  left: (index * 37) % 100,
  delay: -((index * 1.7) % 18),
  duration: 16 + ((index * 11) % 18),
  drift: -80 + ((index * 47) % 160),
}))

const modules = [
  { name: '帳號與設定', status: '等待搬移' },
  { name: '待辦與月曆', status: '等待搬移' },
  { name: '音樂與工作區', status: '等待搬移' },
  { name: '學習與搜尋', status: '等待搬移' },
]

function App() {
  return (
    <main className="app-shell">
      <div className="aurora" aria-hidden="true" />
      <div className="bubble-field" aria-hidden="true">
        {bubbles.map((bubble) => (
          <span
            className="bubble"
            key={bubble.id}
            style={
              {
                '--bubble-size': `${bubble.size}px`,
                '--bubble-left': `${bubble.left}%`,
                '--bubble-delay': `${bubble.delay}s`,
                '--bubble-duration': `${bubble.duration}s`,
                '--bubble-drift': `${bubble.drift}px`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <section className="workspace" aria-labelledby="page-title">
        <header className="topbar">
          <div className="brand-mark" aria-hidden="true">B</div>
          <div>
            <p className="eyebrow">Bubble Space</p>
            <h1 id="page-title">v2 雲端測試服</h1>
          </div>
          <span className="environment-badge">React + TypeScript</span>
        </header>

        <div className="hero-card">
          <p className="hero-kicker">第一階段已開始</p>
          <h2>新版在獨立測試站重建，原本正式站保持不動。</h2>
          <p>
            這是 Bubble Space v2 的第一個雲端建置版本。接下來會依序搬入外框、登入、待辦、月曆、音樂、工作區與學習功能。
          </p>
          <div className="status-row">
            <span className="status-dot" aria-hidden="true" />
            <strong>架構狀態：等待 GitHub Pages 首次部署</strong>
          </div>
        </div>

        <section className="module-grid" aria-label="功能搬移進度">
          {modules.map((module, index) => (
            <article className="module-card" key={module.name}>
              <span className="module-number">0{index + 1}</span>
              <h3>{module.name}</h3>
              <p>{module.status}</p>
            </article>
          ))}
        </section>

        <footer className="footer-note">
          <span>環境：preview</span>
          <span>Repository：color-bubble-dashboard-preview</span>
          <span>版本：0.1.0</span>
        </footer>
      </section>
    </main>
  )
}

export default App
