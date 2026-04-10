import React, { useCallback } from 'react'
import {
  RotateCcw, RotateCw, Shuffle, Sparkles, RefreshCw,
  Settings, BookOpen, Hand, Eye,
} from 'lucide-react'
import useCubeStore from '../../store/cubeStore.js'
import useUIStore from '../../store/uiStore.js'
import { useTutorialStore } from '../../store/tutorialStore.js'

export default function Toolbar() {
  const {
    undo, redo, scramble, getSolution, reset,
    moveHistory, redoStack, isAnimating, isSolved,
  } = useCubeStore()
  const {
    toggleSettings, toggleNotationGuide, triggerCelebration,
    interactionMode, toggleInteractionMode,
  } = useUIStore()
  const startTutorial = useTutorialStore((s) => s.startTutorial)

  const isLookMode = interactionMode === 'look'

  /**
   * Scramble: reset to solved then animate each move sequentially at fast speed.
   */
  const handleScramble = useCallback(async () => {
    if (useCubeStore.getState().isAnimating) return
    const moves = scramble()
    await new Promise((r) => setTimeout(r, 50))
    for (const move of moves) {
      const execFn = useCubeStore.getState().executeMove
      if (execFn) await execFn(move, 'fast')
    }
  }, [scramble])

  /**
   * Solve: play back the inverse of move history sequentially.
   */
  const handleSolve = useCallback(async () => {
    if (useCubeStore.getState().isAnimating) return
    if (useCubeStore.getState().isSolved) return
    const solution = getSolution()
    if (!solution || solution.length === 0) return
    for (const move of solution) {
      const execFn = useCubeStore.getState().executeMove
      if (execFn) await execFn(move)
    }
    if (useCubeStore.getState().isSolved) {
      triggerCelebration()
    }
  }, [getSolution, triggerCelebration])

  const handleUndo = useCallback(() => {
    if (useCubeStore.getState().isAnimating) return
    undo()
  }, [undo])

  const handleRedo = useCallback(() => {
    if (useCubeStore.getState().isAnimating) return
    redo()
  }, [redo])

  const btnClass =
    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ' +
    'bg-white/10 hover:bg-white/20 active:scale-95 text-white disabled:opacity-40 disabled:cursor-not-allowed'

  return (
    <div className="flex items-center gap-2 flex-wrap">

      {/* ── Mode Toggle — most important control, shown first ── */}
      <button
        className={
          'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 active:scale-95 ' +
          (isLookMode
            ? 'bg-blue-500/80 hover:bg-blue-400/80 text-white ring-1 ring-blue-300/50'
            : 'bg-emerald-500/80 hover:bg-emerald-400/80 text-white ring-1 ring-emerald-300/50')
        }
        onClick={toggleInteractionMode}
        title={isLookMode ? 'Switch to Turn mode (drag face to rotate layer)' : 'Switch to Look mode (drag to orbit camera)'}
      >
        {isLookMode ? <Eye size={15} /> : <Hand size={15} />}
        {isLookMode ? 'Looking' : 'Turning'}
      </button>

      <div className="w-px h-6 bg-white/20 mx-1" />

      <button
        className={btnClass}
        onClick={handleUndo}
        disabled={moveHistory.length === 0 || isAnimating}
        title="Undo last move"
      >
        <RotateCcw size={16} /> Undo
      </button>

      <button
        className={btnClass}
        onClick={handleRedo}
        disabled={redoStack.length === 0 || isAnimating}
        title="Redo move"
      >
        <RotateCw size={16} /> Redo
      </button>

      <button
        className={btnClass}
        onClick={handleScramble}
        disabled={isAnimating}
        title="Scramble the cube"
      >
        <Shuffle size={16} /> Scramble
      </button>

      <button
        className={btnClass}
        onClick={handleSolve}
        disabled={isAnimating || isSolved}
        title="Auto-solve"
      >
        <Sparkles size={16} /> Solve
      </button>

      <button
        className={btnClass}
        onClick={reset}
        disabled={isAnimating}
        title="Reset to solved"
      >
        <RefreshCw size={16} /> Reset
      </button>

      {/* Move counter */}
      {moveHistory.length > 0 && (
        <span className="text-white/50 text-xs font-mono px-2">
          {moveHistory.length} moves
        </span>
      )}

      <div className="flex-1" />

      <button className={btnClass} onClick={startTutorial} title="Learn to Solve">
        <BookOpen size={16} /> Learn
      </button>
      <button className={btnClass} onClick={toggleNotationGuide} title="Notation guide">
        <span className="font-mono text-xs">R U R'</span>
      </button>
      <button className={btnClass} onClick={toggleSettings} title="Settings">
        <Settings size={16} />
      </button>
    </div>
  )
}
