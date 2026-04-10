import React from 'react'
import { useTutorialStore } from '../../store/tutorialStore.js'
import { MODULES, LESSONS } from '../../core/tutorial/lessons.js'

export default function ProgressTracker() {
  const { completedLessons, bestTimes } = useTutorialStore()

  const totalLessons = Object.keys(LESSONS).length
  const completedCount = Object.values(completedLessons).filter((l) => l.completed).length
  const pct = Math.round((completedCount / totalLessons) * 100)

  const bestFull = bestTimes?.fullSolve

  const formatMs = (ms) => {
    if (!ms) return '—'
    const s = Math.floor(ms / 1000)
    const cs = Math.floor((ms % 1000) / 10)
    return `${s}.${String(cs).padStart(2, '0')}s`
  }

  return (
    <div className="p-4 border-t border-white/10">
      <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">Progress</p>

      {/* Overall progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-white/40 mb-1">
          <span>{completedCount} / {totalLessons} lessons</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {bestFull && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/40">Best solve</span>
          <span className="text-white/70 font-mono">{formatMs(bestFull)}</span>
        </div>
      )}
    </div>
  )
}
