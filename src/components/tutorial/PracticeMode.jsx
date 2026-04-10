import React from 'react'
import { CheckCircle, Circle } from 'lucide-react'
import { useTutorialStore } from '../../store/tutorialStore.js'
import { LESSONS } from '../../core/tutorial/lessons.js'

export default function PracticeMode() {
  const { currentLesson, currentStep, moveIndex, lessonState } = useTutorialStore()

  if (!currentLesson || lessonState === 'INTRO' || lessonState === 'COMPLETE') return null

  const lesson = LESSONS[currentLesson]
  const step = lesson?.steps[currentStep]
  if (!step?.expectedMoves?.length) return null

  return (
    <div className="bg-white/5 rounded-lg p-3">
      <p className="text-white/40 text-xs mb-2">Your progress</p>
      <div className="flex gap-1.5 flex-wrap">
        {step.expectedMoves.map((move, i) => {
          const done = i < moveIndex
          const current = i === moveIndex
          return (
            <div
              key={i}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-mono ${
                done
                  ? 'bg-green-500/20 text-green-400'
                  : current
                  ? 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/50'
                  : 'bg-white/5 text-white/30'
              }`}
            >
              {done ? <CheckCircle size={10} /> : <Circle size={10} />}
              {move}
            </div>
          )
        })}
      </div>
    </div>
  )
}
