import React, { useEffect, useState } from 'react'
import { useTimer } from '../../hooks/useTimer.js'
import useCubeStore from '../../store/cubeStore.js'

const BEST_KEY = 'rubiks-best-time-ms'

function loadBest() {
  try {
    const v = Number(localStorage.getItem(BEST_KEY))
    return Number.isFinite(v) && v > 0 ? v : null
  } catch {
    return null
  }
}

function formatMs(ms) {
  const total = Math.floor(ms)
  const minutes = Math.floor(total / 60000)
  const seconds = Math.floor((total % 60000) / 1000)
  const centis = Math.floor((total % 1000) / 10)
  return `${minutes > 0 ? minutes + ':' : ''}${String(seconds).padStart(minutes > 0 ? 2 : 1, '0')}.${String(centis).padStart(2, '0')}`
}

export default function Timer() {
  const { timerState, display, solveMs, startInspection, startSolve, stop, reset } = useTimer()
  const isSolved = useCubeStore((s) => s.isSolved)
  const [bestMs, setBestMs] = useState(loadBest)

  // Auto-stop the timer the moment the cube becomes solved
  useEffect(() => {
    if (timerState === 'solving' && isSolved) stop()
  }, [isSolved, timerState, stop])

  // Record best time when a solve completes
  useEffect(() => {
    if (timerState === 'stopped' && solveMs !== null && (bestMs === null || solveMs < bestMs)) {
      setBestMs(solveMs)
      try {
        localStorage.setItem(BEST_KEY, String(Math.floor(solveMs)))
      } catch {
        // non-fatal
      }
    }
  }, [timerState, solveMs, bestMs])

  // Spacebar: hold to ready, release to start inspection → solve
  useEffect(() => {
    let holdTimer = null

    const onKeyDown = (e) => {
      if (e.code !== 'Space') return
      const target = e.target
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return
      e.preventDefault()
      if (timerState === 'solving') {
        stop()
      } else if (timerState === 'idle' || timerState === 'stopped') {
        holdTimer = setTimeout(() => startInspection(), 300)
      } else if (timerState === 'inspection') {
        startSolve()
      }
    }

    const onKeyUp = (e) => {
      if (e.code !== 'Space') return
      clearTimeout(holdTimer)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      clearTimeout(holdTimer)
    }
  }, [timerState, startInspection, startSolve, stop])

  const colorClass =
    timerState === 'inspection'
      ? 'text-yellow-400'
      : timerState === 'solving'
      ? 'text-green-400'
      : timerState === 'stopped'
      ? 'text-white'
      : 'text-white/40'

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`font-mono text-4xl font-bold tabular-nums ${colorClass}`}>
        {timerState === 'inspection' ? `${display}s` : display}
      </div>
      {bestMs !== null && (
        <div className="text-white/40 text-xs font-mono">Best: {formatMs(bestMs)}</div>
      )}
      {timerState === 'idle' && (
        <div className="text-white/30 text-xs">Hold Space to start inspection</div>
      )}
      {timerState === 'stopped' && solveMs !== null && (
        <button
          className="text-white/40 text-xs hover:text-white/70 transition-colors"
          onClick={reset}
        >
          Reset timer
        </button>
      )}
    </div>
  )
}
