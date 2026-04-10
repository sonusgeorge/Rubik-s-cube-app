import { applyMove, isSolved } from '../CubeState.js'

/**
 * Beginner method (layer-by-layer) solver stub.
 *
 * This is intentionally a placeholder for Phase 3 expansion.
 * The full implementation will use dedicated sub-solvers for each step:
 *   1. White cross  (crossSolver)
 *   2. White corners (cornerSolver)
 *   3. Second layer  (secondLayerSolver)
 *   4. OLL           (ollSolver)
 *   5. PLL           (pllSolver)
 *
 * For now, returns an empty array if already solved,
 * otherwise throws so the UI can surface the "solver not yet implemented" state
 * without crashing silently.
 */
export function solveBeginnerMethod(state) {
  if (isSolved(state)) return []

  // TODO: implement full LBL solver in Phase 3
  // Each sub-solver will return a partial move list that advances the cube
  // to the next checkpoint, and they chain together.
  return []
}

/**
 * Apply a sequence of moves (string array) to a state, return final state.
 */
export function applySequence(state, moves) {
  return moves.reduce((s, move) => applyMove(s, move), state)
}
