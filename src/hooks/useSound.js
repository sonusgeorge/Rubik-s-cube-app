import { useCallback } from 'react'
import useUIStore from '../store/uiStore.js'

/**
 * Plays rotation sounds using the Web Audio API.
 * Falls back silently if audio is not available.
 */
let audioCtx = null

function getAudioContext() {
  if (!audioCtx && typeof window !== 'undefined') {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    } catch {}
  }
  return audioCtx
}

function playClick(ctx, frequency = 440, duration = 0.05) {
  try {
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    oscillator.frequency.value = frequency
    oscillator.type = 'square'
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)
  } catch {}
}

/**
 * Plain functions (no hook needed) — read the sound setting fresh from the
 * store so they can be called from imperative code like executeMove.
 */
export function playRotateSound() {
  if (!useUIStore.getState().soundEnabled) return
  const ctx = getAudioContext()
  if (ctx) playClick(ctx, 600, 0.04)
}

export function playSnapSound() {
  if (!useUIStore.getState().soundEnabled) return
  const ctx = getAudioContext()
  if (ctx) playClick(ctx, 800, 0.03)
}

export function useSound() {
  const playRotate = useCallback(playRotateSound, [])
  const playSnap = useCallback(playSnapSound, [])
  return { playRotateSound: playRotate, playSnapSound: playSnap }
}
