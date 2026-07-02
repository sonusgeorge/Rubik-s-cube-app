import { create } from 'zustand'
import { solvedState, applyMove, isSolved, parseMoveStr, simplifyMoves } from '../core/CubeState.js'
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

// ── Persistence ─────────────────────────────────────────────
const STORAGE_KEY = 'rubiks-cube-state-v1'
const VALID_COLORS = new Set(['U', 'R', 'F', 'D', 'L', 'B'])

function loadPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!Array.isArray(data.facelets) || data.facelets.length !== 54) return null
    if (!data.facelets.every((c) => VALID_COLORS.has(c))) return null
    if (!Array.isArray(data.moveHistory)) return null
    return {
      facelets: data.facelets,
      moveHistory: data.moveHistory,
      redoStack: Array.isArray(data.redoStack) ? data.redoStack : [],
      scrambleBase: Number.isInteger(data.scrambleBase) ? data.scrambleBase : 0,
    }
  } catch {
    return null
  }
}

function persist(state) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        facelets: state.facelets,
        moveHistory: state.moveHistory,
        redoStack: state.redoStack,
        scrambleBase: state.scrambleBase,
      })
    )
  } catch {
    // storage full / unavailable — non-fatal
  }
}

const persisted = typeof localStorage !== 'undefined' ? loadPersisted() : null

const useCubeStore = create((set, get) => ({
  facelets: persisted?.facelets ?? solvedState(),
  moveHistory: persisted?.moveHistory ?? [],   // [{move: 'R', timestamp: number}]
  redoStack: persisted?.redoStack ?? [],
  // Number of history entries that belong to the last scramble — moves past
  // this index are the user's own turns (used for the move counter).
  scrambleBase: persisted?.scrambleBase ?? 0,
  isAnimating: false,
  isSolved: isSolved(persisted?.facelets ?? solvedState()),
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
      scrambleBase: 0,
    })
    return moves
  },

  /**
   * Called after all scramble moves have been played, so the move counter
   * can distinguish scramble turns from the user's own turns.
   */
  markScrambleComplete() {
    set({ scrambleBase: get().moveHistory.length })
  },

  /**
   * Compute the solution by inverting the current move history, then
   * simplifying it (merging R R → R2, cancelling R R' etc.) so playback
   * doesn't waste turns. Always produces a valid (if not minimal) solution.
   * Returns a move string array for animated playback.
   */
  getSolution() {
    const { moveHistory } = get()
    if (moveHistory.length === 0) return []
    const inverse = [...moveHistory].reverse().map(({ move }) => invertMove(move))
    return simplifyMoves(inverse)
  },

  reset() {
    const fresh = solvedState()
    set({
      facelets: fresh,
      moveHistory: [],
      redoStack: [],
      isAnimating: false,
      isSolved: true,
      scrambleBase: 0,
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

// Save cube state whenever it changes (cheap: only on identity change)
if (typeof localStorage !== 'undefined') {
  let prevFacelets = useCubeStore.getState().facelets
  let prevBase = useCubeStore.getState().scrambleBase
  useCubeStore.subscribe((state) => {
    if (state.facelets !== prevFacelets || state.scrambleBase !== prevBase) {
      prevFacelets = state.facelets
      prevBase = state.scrambleBase
      persist(state)
    }
  })
}

export default useCubeStore
