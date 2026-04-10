import React, { useEffect, useCallback } from 'react'
import { useTimer } from '../../hooks/useTimer.js'
import useCubeStore from '../../store/cubeStore.js'

export default function Timer() {
  const { timerState, display, solveMs, startInspection, startSolve, stop, reset } = useTimer()
  const isSolved = useCubeStore((s) => s.isSolved)

  // Spacebar: hold to ready, release to start inspection → solve
  useEffect(() => {
    let holdTimer = null

    const onKeyDown = (e) => {
      if (e.code !== 'Space') return
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
