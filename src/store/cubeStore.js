import { create } from 'zustand'
import { solvedState, applyMove, isSolved, parseMoveStr, simplifyMoves } from '../core/CubeState.js'
import { generateScramble } from '../core/scrambler.js'
import { solve, applySequence } from '../core/solver/index.js'

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
  // True while a scripted sequence (scramble / solve) is playing back.
  // User move input is ignored during playback so it can't interleave
  // with the precomputed sequence and corrupt the outcome.
  isPlayback: false,
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
   * Compute a solution for the current cube state.
   *
   * Uses the real beginner-method solver, so it works for any state (even
   * one restored from storage or reached through slice moves). The result
   * is verified before being returned; if the solver ever fails, we fall
   * back to inverting the move history.
   * Returns a move string array for animated playback.
   */
  getSolution() {
    const { facelets, moveHistory } = get()
    if (isSolved(facelets)) return []

    try {
      const solution = simplifyMoves(solve(facelets))
      if (isSolved(applySequence(facelets, solution))) return solution
    } catch (err) {
      // Should not happen for states produced by this app — surface it so a
      // solver regression can't hide behind the fallback.
      console.warn('Solver failed, falling back to history inversion:', err)
    }

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

  setPlayback(v) {
    set({ isPlayback: v })
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
