import type { CSSProperties } from 'react'
import type { AnimationLevel } from '../preferences'

const bubbles = Array.from({ length: 36 }, (_, index) => ({
  id: index,
  size: 36 + ((index * 31) % 104),
  left: (index * 37) % 100,
  delay: -((index * 1.65) % 22),
  duration: 17 + ((index * 13) % 19),
  drift: -90 + ((index * 47) % 180),
}))

type BackgroundProps = {
  animationLevel: AnimationLevel
  bubbleCount: number
}

export function Background({ animationLevel, bubbleCount }: BackgroundProps) {
  const visibleBubbles = bubbles.slice(0, Math.min(36, Math.max(0, bubbleCount)))

  return (
    <>
      <div className={`moving-screen motion-${animationLevel}`} aria-hidden="true">
        <span className="color-field field-one" />
        <span className="color-field field-two" />
        <span className="color-field field-three" />
      </div>
      <div className={`bubble-layer motion-${animationLevel}`} aria-hidden="true">
        {visibleBubbles.map((bubble) => (
          <span
            className="bubble"
            key={bubble.id}
            style={
              {
                '--size': `${bubble.size}px`,
                '--left': `${bubble.left}%`,
                '--delay': `${bubble.delay}s`,
                '--duration': `${bubble.duration}s`,
                '--drift': `${bubble.drift}px`,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </>
  )
}
