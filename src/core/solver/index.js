import { solveBeginnerMethod } from './beginnerMethod.js'

/**
 * Main solver entry point.
 * Returns an array of move strings that solve the given state.
 * Falls back to the beginner method (layer-by-layer) which is suitable
 * for tutorial use and reasonable for animated playback.
 *
 * A Kociemba two-phase solver can be plugged in here later.
 */
export function solve(state) {
  return solveBeginnerMethod(state)
}
