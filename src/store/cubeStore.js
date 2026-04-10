import { create } from 'zustand'
import { solvedState, applyMove, isSolved } from '../core/CubeState.js'
import { generateScramble } from '../core/scrambler.js'
import { parseNotation } from '../core/notation.js'
import { solve } from '../core/solver/index.js'

const useCubeStore = create((set, get) => ({
  facelets: solvedState(),
  moveHistory: [],   // [{move: 'R', timestamp: number}]
  redoStack: [],
  isAnimating: false,
  isSolved: true,
  // Set by CubeControls to allow Toolbar to trigger animated moves
  executeMove: null,
  setExecuteMove(fn) { set({ executeMove: fn }) },

  /**
   * Apply a single move string (e.g. 'R', "U'", 'F2').
   * Pushes to history and clears redo stack.
   */
  applyMove(move) {
    const { facelets, moveHistory } = get()
    const next = applyMove(facelets, move)
    set({
      facelets: next,
      moveHistory: [...moveHistory, { move, timestamp: Date.now() }],
      redoStack: [],
      isSolved: isSolved(next),
    })
  },

  undo() {
    const { moveHistory, redoStack } = get()
    if (moveHistory.length === 0) return

    const last = moveHistory[moveHistory.length - 1]
    // Recompute state from scratch (reliable over inverting)
    let state = solvedState()
    for (const { move } of moveHistory.slice(0, -1)) {
      state = applyMove(state, move)
    }
    set({
      facelets: state,
      moveHistory: moveHistory.slice(0, -1),
      redoStack: [last, ...redoStack],
      isSolved: isSolved(state),
    })
  },

  redo() {
    const { redoStack, moveHistory, facelets } = get()
    if (redoStack.length === 0) return

    const [next, ...remaining] = redoStack
    const newFacelets = applyMove(facelets, next.move)
    set({
      facelets: newFacelets,
      moveHistory: [...moveHistory, next],
      redoStack: remaining,
      isSolved: isSolved(newFacelets),
    })
  },

  /**
   * Generate a scramble and queue it for animated playback.
   * Returns the move string so the animation layer can consume it.
   */
  scramble() {
    const scrambleStr = generateScramble(20)
    const moves = parseNotation(scrambleStr).map((m) => m.raw)
    // Apply all moves to state immediately; animation drives the 3D visuals
    let state = solvedState()
    for (const move of moves) state = applyMove(state, move)
    set({
      facelets: state,
      moveHistory: moves.map((move) => ({ move, timestamp: Date.now() })),
      redoStack: [],
      isSolved: false,
    })
    return moves
  },

  /**
   * Compute the solution for the current state.
   * Returns a move array; animation layer plays it back.
   */
  getSolution() {
    return solve(get().facelets)
  },

  reset() {
    const fresh = solvedState()
    set({
      facelets: fresh,
      moveHistory: [],
      redoStack: [],
      isAnimating: false,
      isSolved: true,
    })
  },

  setAnimating(v) {
    set({ isAnimating: v })
  },

  checkSolved() {
    const solved = isSolved(get().facelets)
    set({ isSolved: solved })
    return solved
  },
}))

export default useCubeStore
