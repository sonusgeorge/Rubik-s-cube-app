import React, { useRef, useEffect } from 'react'
import useCubeStore from '../../store/cubeStore.js'

export default function MoveHistory() {
  const moveHistory = useCubeStore((s) => s.moveHistory)
  const scrollRef = useRef()

  // Auto-scroll right when new moves come in
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [moveHistory.length])

  if (moveHistory.length === 0) return null

  return (
    <div
      ref={scrollRef}
      className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-hide"
      style={{ scrollbarWidth: 'none' }}
    >
      {moveHistory.map(({ move }, i) => (
        <span
          key={i}
          className="flex-shrink-0 px-2 py-0.5 rounded bg-white/10 text-white/80 text-xs font-mono"
        >
          {move}
        </span>
      ))}
    </div>
  )
}
