import React from 'react'
import { useTutorialStore } from '../../store/tutorialStore.js'
import { LESSONS } from '../../core/tutorial/lessons.js'
import HintSystem from './HintSystem.jsx'
import AlgorithmDisplay from './AlgorithmDisplay.jsx'

export default function StepCard() {
  const { currentLesson, currentStep, lessonState } = useTutorialStore()

  if (!currentLesson) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white/50 p-6 text-center">
        <p className="text-lg font-semibold text-white/70 mb-2">Welcome to Learn Mode</p>
        <p className="text-sm">Select a lesson from the sidebar to begin.</p>
      </div>
    )
  }

  const lesson = LESSONS[currentLesson]
  if (!lesson) return null

  const step = lesson.steps[currentStep]
  if (!step && lessonState !== 'COMPLETE') return null

  if (lessonState === 'COMPLETE') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <div className="text-4xl mb-3">🎉</div>
        <p className="text-white font-bold text-lg mb-1">Lesson Complete!</p>
        <p className="text-white/60 text-sm">Pick the next lesson from the sidebar.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
      {/* Lesson title */}
      <div>
        <p className="text-white/40 text-xs font-medium uppercase tracking-wider">{lesson.title}</p>
        <p className="text-white/30 text-xs mt-0.5">
          Step {currentStep + 1} of {lesson.steps.length}
        </p>
      </div>

      {/* Step description */}
      <p className="text-white/90 text-sm leading-relaxed">{step.description}</p>

      {/* Algorithm display if there are expected moves */}
      {step.expectedMoves?.length > 0 && (
        <AlgorithmDisplay moves={step.expectedMoves} />
      )}

      {/* Hint system */}
      <HintSystem hint={step.hint} />
    </div>
  )
}
