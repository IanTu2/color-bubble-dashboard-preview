import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import './learning-drawer.css'
import './practice-drawer.css'
import './curriculum-roadmap.css'
import './curriculum-layered-drawer.css'
import './curriculum-course.css'
import './curriculum-course-v2.css'
import './curriculum-rich-content.css'
import './curriculum-reading-v5.css'
import './auth.css'
import './member-layout.css'
import './todo-manager.css'
import './desktop-workspace.css'
import './window-overlay.css'
import './music-studio.css'
import './preferences-music.css'
import './english-learning.css'
import './english-casual-practice.css'
import './english-bilingual-library.css'
import './english-assessment-reading.css'
import './english-journey.css'
import './english-journey-bridge.css'
import './english-tool-curtain.css'
import './theme-appearance.css'
import './desktop-light-v2.css'
import './curriculum-paged-v4.css'
import './curriculum-compact-v5.css'
import './curriculum-compact-tight-v5.css'
import './curriculum-visuals-dock-v6.css'
import './curriculum-vetted-media-v7.css'
import './curriculum-visual-stability-v8.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('找不到 React 根節點 #root')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)