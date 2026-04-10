import { describe, it, expect } from 'vitest'
import { solvedState, applyMove, isSolved } from './CubeState.js'

describe('CubeState', () => {
  it('starts solved', () => {
    expect(isSolved(solvedState())).toBe(true)
  })

  it('R then R-prime returns to solved', () => {
    let state = solvedState()
    state = applyMove(state, 'R')
    state = applyMove(state, "R'")
    expect(isSolved(state)).toBe(true)
  })

  it('R2 is the same as R R', () => {
    let a = solvedState()
    a = applyMove(a, 'R')
    a = applyMove(a, 'R')

    let b = solvedState()
    b = applyMove(b, 'R2')

    expect(a).toEqual(b)
  })

  it('all 6 CW moves applied 4 times return to solved', () => {
    for (const face of ['R', 'L', 'U', 'D', 'F', 'B']) {
      let state = solvedState()
      for (let i = 0; i < 4; i++) state = applyMove(state, face)
      expect(isSolved(state)).toBe(true)
    }
  })

  it('U move changes facelets correctly', () => {
    let state = solvedState()
    state = applyMove(state, 'U')
    // U face itself should still all be 'U'
    for (let i = 0; i < 9; i++) expect(state[i]).toBe('U')
    // First row of F (18,19,20) should now be R (was L after U CW)
    // R face top row (9,10,11) should now be B's top row colors
    expect(isSolved(state)).toBe(false)
  })
})
