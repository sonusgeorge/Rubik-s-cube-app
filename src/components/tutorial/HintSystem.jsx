import React from 'react'
import { Lightbulb } from 'lucide-react'
import { useTutorialStore } from '../../store/tutorialStore.js'

const HINT_LABELS = ['', 'Hint 1: Identify the piece', 'Hint 2: Target position', 'Hint 3: Exact move', 'Demo: Watch the move']

export default function HintSystem({ hint }) {
  const { hintLevel, requestHint } = useTutorialStore()

  return (
    <div className="mt-auto">
      {hintLevel > 0 && hint && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-2">
          <p className="text-yellow-300/80 text-xs font-medium mb-1">{HINT_LABELS[hintLevel]}</p>
          <p className="text-yellow-200/70 text-sm">{hint}</p>
        </div>
      )}

      {hintLevel < 3 && (
        <button
          onClick={requestHint}
          className="flex items-center gap-1.5 text-white/40 hover:text-yellow-400 text-xs transition-colors"
        >
          <Lightbulb size={13} />
          {hintLevel === 0 ? 'Need a hint?' : 'More help'}
        </button>
      )}
    </div>
  )
}
