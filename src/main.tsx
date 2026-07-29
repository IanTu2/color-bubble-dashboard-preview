import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import './auth.css'
import './member-layout.css'
import './todo-manager.css'
import './desktop-workspace.css'
import './window-overlay.css'
import './music-studio.css'
import './preferences-music.css'
import './english-learning.css'
import './english-casual-practice.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('找不到 React 根節點 #root')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
