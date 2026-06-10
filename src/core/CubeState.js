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

// Moves on the same axis commute (R/L/M, U/D/E, F/B/S)
const MOVE_AXIS = { R: 'x', L: 'x', M: 'x', U: 'y', D: 'y', E: 'y', F: 'z', B: 'z', S: 'z' }

/**
 * Simplify a move sequence by merging/cancelling turns of the same face,
 * looking past moves on the same axis (which commute):
 *   R R  → R2,  R R' → (nothing),  R2 R → R',  R L R' → L
 */
export function simplifyMoves(moves) {
  // stack entries: [face, quarterTurns (1..3)]
  const stack = []
  for (const mv of moves) {
    const [face, modifier] = parseMoveStr(mv)
    const turns = modifier === -1 ? 3 : modifier

    // Look back past commuting (same-axis, different-face) moves
    let i = stack.length - 1
    while (i >= 0 && stack[i][0] !== face && MOVE_AXIS[stack[i][0]] === MOVE_AXIS[face]) i--

    if (i >= 0 && stack[i][0] === face) {
      const total = (stack[i][1] + turns) % 4
      if (total === 0) stack.splice(i, 1)
      else stack[i][1] = total
    } else {
      stack.push([face, turns])
    }
  }
  return stack.map(([face, t]) => (t === 1 ? face : t === 2 ? `${face}2` : `${face}'`))
}
