import MOVES from './moves.js'

/**
 * Solved state: 9 facelets per face in order U, R, F, D, L, B.
 * Each facelet stores the face letter it belongs to when solved.
 */
export function solvedState() {
  const faces = ['U', 'R', 'F', 'D', 'L', 'B']
  const state = []
  for (const face of faces) {
    for (let i = 0; i < 9; i++) state.push(face)
  }
  return state
}

/**
 * Apply a single clockwise cycle to a copy of `state`.
 * `cycle` is an array of 4 indices: [a, b, c, d]
 * Result: state[b]=state[a], state[c]=state[b], state[d]=state[c], state[a]=state[d]
 */
function applyCycle(state, cycle) {
  const tmp = state[cycle[3]]
  state[cycle[3]] = state[cycle[2]]
  state[cycle[2]] = state[cycle[1]]
  state[cycle[1]] = state[cycle[0]]
  state[cycle[0]] = tmp
}

/**
 * Apply a move to a state array (mutates a copy and returns it).
 * direction: 1 = clockwise (CW), -1 = counter-clockwise (CCW), 2 = 180°
 */
export function applyMove(state, moveName) {
  const [face, modifier] = parseMoveStr(moveName)
  const cycles = MOVES[face]
  if (!cycles) throw new Error(`Unknown move: ${moveName}`)

  const next = [...state]
  const times = modifier === 2 ? 2 : modifier === -1 ? 3 : 1
  for (let t = 0; t < times; t++) {
    for (const cycle of cycles) {
      applyCycle(next, cycle)
    }
  }
  return next
}

/**
 * Parse a move string like "R", "R'", "R2" into [face, modifier].
 * modifier: 1 = CW, -1 = CCW, 2 = double
 */
export function parseMoveStr(moveStr) {
  const face = moveStr[0].toUpperCase()
  const suffix = moveStr.slice(1)
  let modifier = 1
  if (suffix === "'") modifier = -1
  else if (suffix === '2') modifier = 2
  return [face, modifier]
}

/**
 * Check whether a state is solved.
 */
export function isSolved(state) {
  for (let face = 0; face < 6; face++) {
    const base = face * 9
    const color = state[base]
    for (let i = 1; i < 9; i++) {
      if (state[base + i] !== color) return false
    }
  }
  return true
}
