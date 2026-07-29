import { useEffect, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'

export type WindowGeometry = {
  x: number
  y: number
  width: number
  height: number
}

type DragMode = 'move' | 'resize-corner' | 'resize-bottom' | 'resize-right'

type DragState = {
  mode: DragMode
  startX: number
  startY: number
  geometry: WindowGeometry
}

type WindowFrameProps = {
  title: string
  icon: string
  geometry: WindowGeometry
  maximized: boolean
  zIndex: number
  children: ReactNode
  hideMaximize?: boolean
  onFocus: () => void
  onMinimize: () => void
  onToggleMaximize: () => void
  onClose: () => void
  onGeometryChange: (geometry: WindowGeometry) => void
}

export function clampWindowGeometry(value: WindowGeometry): WindowGeometry {
  const mobile = window.innerWidth <= 760
  if (mobile) {
    return { x: 6, y: 6, width: Math.max(0, window.innerWidth - 12), height: Math.max(0, window.innerHeight - 88) }
  }

  const minWidth = 520
  const minHeight = 360
  const edgeGap = 8
  const maxWidth = Math.max(minWidth, window.innerWidth - edgeGap * 2)
  const maxHeight = Math.max(minHeight, window.innerHeight - edgeGap * 2)
  const width = Math.min(Math.max(value.width, minWidth), maxWidth)
  const height = Math.min(Math.max(value.height, minHeight), maxHeight)
  return {
    width,
    height,
    x: Math.min(Math.max(value.x, edgeGap), Math.max(edgeGap, window.innerWidth - width - edgeGap)),
    y: Math.min(Math.max(value.y, edgeGap), Math.max(edgeGap, window.innerHeight - height - edgeGap)),
  }
}

export function WindowFrame({
  title,
  icon,
  geometry,
  maximized,
  zIndex,
  children,
  hideMaximize = false,
  onFocus,
  onMinimize,
  onToggleMaximize,
  onClose,
  onGeometryChange,
}: WindowFrameProps) {
  const [dragState, setDragState] = useState<DragState | null>(null)

  useEffect(() => {
    const move = (event: PointerEvent) => {
      if (!dragState) return
      const deltaX = event.clientX - dragState.startX
      const deltaY = event.clientY - dragState.startY

      let next: WindowGeometry
      if (dragState.mode === 'move') {
        next = {
          ...dragState.geometry,
          x: dragState.geometry.x + deltaX,
          y: dragState.geometry.y + deltaY,
        }
      } else if (dragState.mode === 'resize-bottom') {
        next = {
          ...dragState.geometry,
          height: dragState.geometry.height + deltaY,
        }
      } else if (dragState.mode === 'resize-right') {
        next = {
          ...dragState.geometry,
          width: dragState.geometry.width + deltaX,
        }
      } else {
        next = {
          ...dragState.geometry,
          width: dragState.geometry.width + deltaX,
          height: dragState.geometry.height + deltaY,
        }
      }

      onGeometryChange(clampWindowGeometry(next))
    }

    const stop = () => setDragState(null)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', stop)
    window.addEventListener('pointercancel', stop)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', stop)
      window.removeEventListener('pointercancel', stop)
    }
  }, [dragState, onGeometryChange])

  useEffect(() => {
    const resize = () => onGeometryChange(clampWindowGeometry(geometry))
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [geometry, onGeometryChange])

  const startDrag = (event: ReactPointerEvent<HTMLElement>, mode: DragMode) => {
    if (maximized || window.innerWidth <= 760) return
    event.preventDefault()
    event.stopPropagation()
    onFocus()
    setDragState({ mode, startX: event.clientX, startY: event.clientY, geometry })
  }

  const style = maximized
    ? { inset: '8px', zIndex }
    : {
        left: `${geometry.x}px`,
        top: `${geometry.y}px`,
        width: `${geometry.width}px`,
        height: `${geometry.height}px`,
        zIndex,
      }

  return (
    <section
      className={`desktop-window${maximized ? ' maximized' : ''}${dragState ? ' is-resizing' : ''}`}
      style={style}
      onPointerDown={onFocus}
      aria-label={title}
    >
      <header
        className="desktop-window-titlebar"
        onPointerDown={(event) => startDrag(event, 'move')}
        onDoubleClick={() => {
          if (!hideMaximize) onToggleMaximize()
        }}
        title={hideMaximize ? undefined : '雙擊標題列可最大化或還原'}
      >
        <div className="desktop-window-title">
          <span>{icon}</span>
          <strong>{title}</strong>
        </div>
        <div
          className="desktop-window-actions"
          onPointerDown={(event) => event.stopPropagation()}
          onDoubleClick={(event) => event.stopPropagation()}
        >
          <button type="button" aria-label="最小化" title="最小化" onClick={onMinimize}>—</button>
          {!hideMaximize ? (
            <button type="button" aria-label={maximized ? '還原' : '最大化'} title={maximized ? '還原' : '最大化'} onClick={onToggleMaximize}>
              {maximized ? '❐' : '□'}
            </button>
          ) : null}
          <button className="window-close-button" type="button" aria-label="關閉" title="關閉" onClick={onClose}>×</button>
        </div>
      </header>
      <div className="desktop-window-content">{children}</div>
      {!maximized ? (
        <>
          <button
            className="desktop-window-resize-edge desktop-window-resize-bottom"
            type="button"
            aria-label="往下拖曳調整視窗高度"
            title="往下拖曳可放大視窗"
            onPointerDown={(event) => startDrag(event, 'resize-bottom')}
          />
          <button
            className="desktop-window-resize-edge desktop-window-resize-right"
            type="button"
            aria-label="向右拖曳調整視窗寬度"
            title="向右拖曳可調整寬度"
            onPointerDown={(event) => startDrag(event, 'resize-right')}
          />
          <button
            className="desktop-window-resize"
            type="button"
            aria-label="拖曳調整視窗寬度與高度"
            title="拖曳調整視窗大小"
            onPointerDown={(event) => startDrag(event, 'resize-corner')}
          />
        </>
      ) : null}
    </section>
  )
}
