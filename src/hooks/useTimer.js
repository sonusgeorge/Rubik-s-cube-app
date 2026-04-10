import { useState, useEffect, useRef, useCallback } from 'react'

const INSPECTION_TIME = 15 // seconds (WCA standard)

/**
 * Speedcubing timer hook.
 *
 * States: 'idle' → 'inspection' → 'solving' → 'stopped'
 *
 * Returns:
 *   state       — 'idle' | 'inspection' | 'solving' | 'stopped'
 *   display     — string to show in the UI
 *   solveMs     — final solve time in milliseconds (null if not stopped)
 *   startInspection() — begin 15s inspection countdown
 *   startSolve()      — start the solve timer
 *   stop()            — stop the solve timer
 *   reset()
 */
export function useTimer() {
  const [timerState, setTimerState] = useState('idle')
  const [elapsedMs, setElapsedMs] = useState(0)
  const [inspectionLeft, setInspectionLeft] = useState(INSPECTION_TIME)
  const [solveMs, setSolveMs] = useState(null)

  const intervalRef = useRef(null)
  const startTimeRef = useRef(null)

  const clearTick = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const startInspection = useCallback(() => {
    setTimerState('inspection')
    setInspectionLeft(INSPECTION_TIME)
    setElapsedMs(0)
    setSolveMs(null)

    let left = INSPECTION_TIME
    intervalRef.current = setInterval(() => {
      left -= 1
      setInspectionLeft(left)
      if (left <= 0) {
        clearTick()
        // Auto-start solve when inspection expires
        startSolveInternal()
      }
    }, 1000)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const startSolveInternal = useCallback(() => {
    clearTick()
    setTimerState('solving')
    startTimeRef.current = performance.now()
    intervalRef.current = setInterval(() => {
      setElapsedMs(performance.now() - startTimeRef.current)
    }, 16)
  }, [])

  const startSolve = useCallback(() => {
    startSolveInternal()
  }, [startSolveInternal])

  const stop = useCallback(() => {
    if (timerState !== 'solving') return
    clearTick()
    const ms = performance.now() - startTimeRef.current
    setSolveMs(ms)
    setElapsedMs(ms)
    setTimerState('stopped')
  }, [timerState])

  const reset = useCallback(() => {
    clearTick()
    setTimerState('idle')
    setElapsedMs(0)
    setInspectionLeft(INSPECTION_TIME)
    setSolveMs(null)
  }, [])

  useEffect(() => () => clearTick(), [])

  const formatMs = (ms) => {
    const total = Math.floor(ms)
    const minutes = Math.floor(total / 60000)
    const seconds = Math.floor((total % 60000) / 1000)
    const centis = Math.floor((total % 1000) / 10)
    return `${minutes > 0 ? minutes + ':' : ''}${String(seconds).padStart(minutes > 0 ? 2 : 1, '0')}.${String(centis).padStart(2, '0')}`
  }

  let display = '0.00'
  if (timerState === 'inspection') display = `${inspectionLeft}`
  else if (timerState === 'solving' || timerState === 'stopped') display = formatMs(elapsedMs)

  return {
    timerState,
    display,
    solveMs,
    inspectionLeft,
    startInspection,
    startSolve,
    stop,
    reset,
  }
}
