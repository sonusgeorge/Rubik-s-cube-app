import React from 'react'
import { useTutorialStore } from '../../store/tutorialStore.js'

/**
 * Displays an algorithm as a row of tappable move chips.
 * The current move (moveIndex) is highlighted.
 */
export default function AlgorithmDisplay({ moves }) {
  const { moveIndex } = useTutorialStore()

  if (!moves || moves.length === 0) return null

  return (
    <div className="bg-white/5 rounded-lg p-3">
      <p className="text-white/40 text-xs mb-2">Algorithm</p>
      <div className="flex flex-wrap gap-1.5">
        {moves.map((move, i) => (
          <span
            key={i}
            className={`px-2.5 py-1 rounded font-mono text-sm font-medium transition-all ${
              i === moveIndex
                ? 'bg-blue-500 text-white scale-110 shadow-lg shadow-blue-500/30'
                : i < moveIndex
                ? 'bg-green-500/20 text-green-400'
                : 'bg-white/10 text-white/60'
            }`}
          >
            {move}
          </span>
        ))}
      </div>
      <p className="text-white/30 text-xs mt-2">
        Perform each move on the cube in order
      </p>
    </div>
  )
}
