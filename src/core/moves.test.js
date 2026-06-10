import { describe, it, expect } from 'vitest'
import FACELET_MAP from './cubieMapper.js'
import { solvedState, applyMove, isSolved, simplifyMoves } from './CubeState.js'

/**
 * Geometric ground truth: derive each move's facelet permutation from
 * FACELET_MAP and the same rotation conventions the 3D animation uses
 * (rotationMath.js: a CW move rotates -90° * sign about its axis).
 * This guarantees the logical state can never drift from what the
 * animation shows — the bug class that previously corrupted R/L/D/B.
 */
const FACE_DEF = {
  R: { axis: 0, layer: 1, angle: -90 },
  L: { axis: 0, layer: -1, angle: 90 },
  U: { axis: 1, layer: 1, angle: -90 },
  D: { axis: 1, layer: -1, angle: 90 },
  F: { axis: 2, layer: 1, angle: -90 },
  B: { axis: 2, layer: -1, angle: 90 },
  M: { axis: 0, layer: 0, angle: 90 },   // follows L
  E: { axis: 1, layer: 0, angle: 90 },   // follows D
  S: { axis: 2, layer: 0, angle: -90 },  // follows F
}

function rot(axis, angle, [x, y, z]) {
  const s = angle === 90 ? 1 : -1
  if (axis === 0) return [x, -s * z, s * y]
  if (axis === 1) return [s * z, y, -s * x]
  return [-s * y, s * x, z]
}

const DIR_VEC = {
  'x+': [1, 0, 0], 'x-': [-1, 0, 0],
  'y+': [0, 1, 0], 'y-': [0, -1, 0],
  'z+': [0, 0, 1], 'z-': [0, 0, -1],
}
function vecToDir([x, y, z]) {
  if (x === 1) return 'x+'
  if (x === -1) return 'x-'
  if (y === 1) return 'y+'
  if (y === -1) return 'y-'
  if (z === 1) return 'z+'
  return 'z-'
}

function referenceApply(state, face) {
  const { axis, layer, angle } = FACE_DEF[face]
  const next = [...state]
  FACELET_MAP.forEach(({ pos, dir }, i) => {
    if (pos[axis] !== layer) return
    const newPos = rot(axis, angle, pos)
    const newDir = vecToDir(rot(axis, angle, DIR_VEC[dir]))
    const j = FACELET_MAP.findIndex(
      (f) => f.pos[0] === newPos[0] && f.pos[1] === newPos[1] && f.pos[2] === newPos[2] && f.dir === newDir
    )
    expect(j).toBeGreaterThanOrEqual(0)
    next[j] = state[i]
  })
  return next
}

describe('move table matches 3D geometry', () => {
  const distinct = Array.from({ length: 54 }, (_, i) => `s${i}`)

  for (const face of Object.keys(FACE_DEF)) {
    it(`${face} permutes facelets exactly like a -90°·sign rotation of its layer`, () => {
      expect(applyMove(distinct, face)).toEqual(referenceApply(distinct, face))
    })
  }
})

describe('slice moves', () => {
  it('M, E, S applied 4 times return to solved', () => {
    for (const face of ['M', 'E', 'S']) {
      let state = solvedState()
      for (let i = 0; i < 4; i++) state = applyMove(state, face)
      expect(state).toEqual(solvedState())
    }
  })

  it("M then M' returns to solved", () => {
    let state = solvedState()
    state = applyMove(state, 'M')
    state = applyMove(state, "M'")
    expect(isSolved(state)).toBe(true)
  })

  it('M moves the U center', () => {
    const state = applyMove(solvedState(), 'M')
    expect(state[4]).not.toBe('U') // U4 center received another color
  })
})

describe('simplifyMoves', () => {
  it('merges same-face turns', () => {
    expect(simplifyMoves(['R', 'R'])).toEqual(['R2'])
    expect(simplifyMoves(['R', 'R', 'R'])).toEqual(["R'"])
    expect(simplifyMoves(['R2', 'R'])).toEqual(["R'"])
  })

  it('cancels inverse pairs, including cascades', () => {
    expect(simplifyMoves(['R', "R'"])).toEqual([])
    expect(simplifyMoves(['R', 'F', "F'", "R'"])).toEqual([])
    expect(simplifyMoves(['R2', 'R2'])).toEqual([])
  })

  it('merges across commuting same-axis moves', () => {
    expect(simplifyMoves(['R', 'L', "R'"])).toEqual(['L'])
    expect(simplifyMoves(['U', 'D', 'U'])).toEqual(['U2', 'D'])
  })

  it('does not merge across non-commuting moves', () => {
    expect(simplifyMoves(['R', 'U', "R'"])).toEqual(['R', 'U', "R'"])
  })

  it('simplified sequences produce the same cube state', () => {
    const seq = ['R', 'L', "R'", 'U', 'U', 'F2', "F'", 'D', "D'", 'B']
    let a = solvedState()
    for (const m of seq) a = applyMove(a, m)
    let b = solvedState()
    for (const m of simplifyMoves(seq)) b = applyMove(b, m)
    expect(a).toEqual(b)
  })
})
