import { solveBeginnerMethod, getSolutionSteps, STAGES, applySequence } from './beginnerMethod.js'

/**
 * Main solver entry point.
 * Returns an array of move strings that solve the given state using the
 * beginner (layer-by-layer) method — suitable for animated playback and
 * as the data source for the guided tutorial.
 *
 * A Kociemba two-phase solver could be plugged in here later for shorter
 * solutions.
 */
export function solve(state) {
  return solveBeginnerMethod(state)
}

export { getSolutionSteps, STAGES, applySequence }
