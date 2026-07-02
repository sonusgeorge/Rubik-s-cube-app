import { describe, it, expect } from 'vitest'
import { solvedState, applyMove, isSolved } from '../CubeState.js'
import { solveBeginnerMethod, getSolutionSteps, applySequence, STAGES } from './beginnerMethod.js'
import { solve } from './index.js'
import { generateScramble } from '../scrambler.js'

const FACE_MOVES = ['R', 'L', 'U', 'D', 'F', 'B']
const ALL_MOVES = [...FACE_MOVES, 'M', 'E', 'S']
const MODIFIERS = ['', "'", '2']

function randomScramble(length, moveSet = FACE_MOVES) {
  const moves = []
  for (let i = 0; i < length; i++) {
    const face = moveSet[Math.floor(Math.random() * moveSet.length)]
    const mod = MODIFIERS[Math.floor(Math.random() * MODIFIERS.length)]
    moves.push(face + mod)
  }
  return moves
}

describe('beginner method solver', () => {
  it('returns an empty solution for a solved cube', () => {
    expect(solveBeginnerMethod(solvedState())).toEqual([])
  })

  it('emits no moves for stages that are already complete', () => {
    for (const step of getSolutionSteps(solvedState())) {
      expect(step.moves, `stage ${step.id} should be a no-op on a solved cube`).toEqual([])
    }
    // A cube one D-turn from solved needs a single realignment move and
    // nothing from any other stage.
    const steps = getSolutionSteps(applyMove(solvedState(), 'D'))
    const total = steps.flatMap((s) => s.moves)
    expect(total.length).toBeLessThanOrEqual(3)
    for (const step of steps) {
      if (step.moves.length > 0) expect(step.moves.every((m) => m[0] === 'D')).toBe(true)
    }
  })

  it('solves single-move states', () => {
    for (const face of FACE_MOVES) {
      for (const mod of MODIFIERS) {
        const state = applyMove(solvedState(), face + mod)
        const solution = solveBeginnerMethod(state)
        expect(isSolved(applySequence(state, solution)), `move: ${face}${mod}`).toBe(true)
      }
    }
  })

  it('solves 100 WCA-style scrambles', () => {
    for (let t = 0; t < 100; t++) {
      const scramble = generateScramble(20).split(' ')
      const state = applySequence(solvedState(), scramble)
      const solution = solveBeginnerMethod(state)
      expect(isSolved(applySequence(state, solution)), `scramble: ${scramble.join(' ')}`).toBe(true)
    }
  })

  it('solves 100 random scrambles of varying lengths', () => {
    for (let t = 0; t < 100; t++) {
      const scramble = randomScramble(1 + (t % 40))
      const state = applySequence(solvedState(), scramble)
      const solution = solveBeginnerMethod(state)
      expect(isSolved(applySequence(state, solution)), `scramble: ${scramble.join(' ')}`).toBe(true)
    }
  })

  it('solves scrambles that include slice moves (rotated centers)', () => {
    for (let t = 0; t < 50; t++) {
      const scramble = randomScramble(25, ALL_MOVES)
      const state = applySequence(solvedState(), scramble)
      const solution = solveBeginnerMethod(state)
      expect(isSolved(applySequence(state, solution)), `scramble: ${scramble.join(' ')}`).toBe(true)
    }
  })

  it('produces solutions of reasonable length', () => {
    for (let t = 0; t < 20; t++) {
      const scramble = generateScramble(20).split(' ')
      const state = applySequence(solvedState(), scramble)
      const solution = solveBeginnerMethod(state)
      expect(solution.length, `scramble: ${scramble.join(' ')}`).toBeLessThan(300)
    }
  })

  it('getSolutionSteps completes each stage in order', () => {
    for (let t = 0; t < 25; t++) {
      const scramble = generateScramble(20).split(' ')
      let state = applySequence(solvedState(), scramble)
      const steps = getSolutionSteps(state)
      expect(steps.map((s) => s.id)).toEqual(STAGES.map((s) => s.id))
      for (let i = 0; i < steps.length; i++) {
        state = applySequence(state, steps[i].moves)
        expect(
          STAGES[i].isDone(state),
          `stage "${steps[i].id}" incomplete after its moves (scramble: ${scramble.join(' ')})`
        ).toBe(true)
      }
      expect(isSolved(state)).toBe(true)
    }
  })

  it('solver entry point solve() works', () => {
    const scramble = generateScramble(20).split(' ')
    const state = applySequence(solvedState(), scramble)
    expect(isSolved(applySequence(state, solve(state)))).toBe(true)
  })
})
