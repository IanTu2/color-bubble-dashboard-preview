import type { CSSProperties } from 'react'

const bubbles = Array.from({ length: 24 }, (_, index) => ({
  id: index,
  size: 36 + ((index * 31) % 104),
  left: (index * 37) % 100,
  delay: -((index * 1.65) % 22),
  duration: 17 + ((index * 13) % 19),
  drift: -90 + ((index * 47) % 180),
}))

export function Background() {
  return (
    <>
      <div className="moving-screen" aria-hidden="true">
        <span className="color-field field-one" />
        <span className="color-field field-two" />
        <span className="color-field field-three" />
      </div>
      <div className="bubble-layer" aria-hidden="true">
        {bubbles.map((bubble) => (
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
