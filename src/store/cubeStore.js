import { create } from 'zustand'
import { solvedState, applyMove, isSolved, parseMoveStr } from '../core/CubeState.js'
import { generateScramble } from '../core/scrambler.js'

/**
 * Invert a single move string.
 *   R  → R'
 *   R' → R
 *   R2 → R2  (180° is its own inverse)
 */
function invertMove(moveName) {
  const [face, modifier] = parseMoveStr(moveName)
  if (modifier === 2) return `${face}2`
  if (modifier === -1) return face
  return `${face}'`
}

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
   * Generate a scramble and reset to solved state.
   * Returns the move array so the animation layer can play them one by one.
   * Does NOT pre-apply moves to state — each executeMove call does that.
   */
  scramble() {
    const scrambleStr = generateScramble(20)
    const moves = scrambleStr.trim().split(/\s+/).filter(Boolean)
    // Reset to solved so the animation starts from a clean visual state
    set({
      facelets: solvedState(),
      moveHistory: [],
      redoStack: [],
      isAnimating: false,
      isSolved: true,
    })
    return moves
  },

  /**
   * Compute the solution by inverting the current move history.
   * This always produces a valid (if not minimal) solution.
   * Returns a move string array for animated playback.
   */
  getSolution() {
    const { moveHistory } = get()
    if (moveHistory.length === 0) return []
    return [...moveHistory].reverse().map(({ move }) => invertMove(move))
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
