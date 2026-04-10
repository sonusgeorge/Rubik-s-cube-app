// Custom easing helpers (mirrors GSAP curve names for reference)

/**
 * power2.out — fast start, smooth deceleration (default snap feel).
 * t ∈ [0,1]
 */
export function power2Out(t) {
  return 1 - Math.pow(1 - t, 2)
}

/**
 * power3.out — aggressive deceleration (scramble playback).
 */
export function power3Out(t) {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * power1.inOut — gentle start and stop (tutorial demo).
 */
export function power1InOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}
