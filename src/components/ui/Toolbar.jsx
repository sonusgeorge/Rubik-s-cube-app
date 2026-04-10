import React, { useCallback } from 'react'
import { RotateCcw, RotateCw, Shuffle, Sparkles, RefreshCw, Settings, BookOpen } from 'lucide-react'
import useCubeStore from '../../store/cubeStore.js'
import useUIStore from '../../store/uiStore.js'
import { useTutorialStore } from '../../store/tutorialStore.js'
import { parseNotation } from '../../core/notation.js'

export default function Toolbar() {
  const { undo, redo, scramble, getSolution, reset, moveHistory, redoStack, isAnimating, isSolved } = useCubeStore()
  const { toggleSettings, toggleNotationGuide } = useUIStore()
  const startTutorial = useTutorialStore((s) => s.startTutorial)
  const executeMove = useCubeStore((s) => s.executeMove)

  const handleScramble = useCallback(() => {
    if (isAnimating) return
    const moves = scramble()
    // Queue animated playback
    if (executeMove) {
      let delay = 0
      for (const move of moves) {
        setTimeout(() => executeMove(move), delay)
        delay += 140 // fast pace
      }
    }
  }, [isAnimating, scramble, executeMove])

  const handleSolve = useCallback(async () => {
    if (isAnimating || isSolved) return
    const solution = getSolution()
    if (!solution || solution.length === 0) return
    if (executeMove) {
      for (const move of solution) {
        await new Promise((res) => setTimeout(res, 50))
        await executeMove(move)
      }
    }
  }, [isAnimating, isSolved, getSolution, executeMove])

  const btnClass =
    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ' +
    'bg-white/10 hover:bg-white/20 text-white disabled:opacity-40 disabled:cursor-not-allowed'

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button className={btnClass} onClick={undo} disabled={moveHistory.length === 0 || isAnimating} title="Undo">
        <RotateCcw size={16} /> Undo
      </button>
      <button className={btnClass} onClick={redo} disabled={redoStack.length === 0 || isAnimating} title="Redo">
        <RotateCw size={16} /> Redo
      </button>
      <button className={btnClass} onClick={handleScramble} disabled={isAnimating} title="Scramble">
        <Shuffle size={16} /> Scramble
      </button>
      <button className={btnClass} onClick={handleSolve} disabled={isAnimating || isSolved} title="Solve">
        <Sparkles size={16} /> Solve
      </button>
      <button className={btnClass} onClick={reset} disabled={isAnimating} title="Reset">
        <RefreshCw size={16} /> Reset
      </button>

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
