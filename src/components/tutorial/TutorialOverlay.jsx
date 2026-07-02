import React from 'react'
import { X } from 'lucide-react'
import { useTutorialStore } from '../../store/tutorialStore.js'
import LessonSidebar from './LessonSidebar.jsx'
import StepCard from './StepCard.jsx'
import PracticeMode from './PracticeMode.jsx'
import ProgressTracker from './ProgressTracker.jsx'
import '../../styles/tutorial.css'

export default function TutorialOverlay() {
  const exitTutorial = useTutorialStore((s) => s.exitTutorial)

  return (
    // pointer-events-none on the wrapper so the cube canvas underneath stays
    // interactive (lessons ask the user to orbit and turn the cube); only the
    // side panels capture the mouse.
    <div className="absolute inset-0 pointer-events-none flex z-40">
      {/* Left sidebar — lesson list */}
      <div className="pointer-events-auto flex flex-col bg-black/70 backdrop-blur w-64 flex-shrink-0 border-r border-white/10">
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <span className="text-white text-sm font-bold">Learn to Solve</span>
          <button
            onClick={exitTutorial}
            className="text-white/50 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <LessonSidebar />
        </div>
        <ProgressTracker />
      </div>

      {/* Right panel — step content */}
      <div className="pointer-events-auto flex flex-col bg-black/50 backdrop-blur w-72 border-l border-white/10 ml-auto flex-shrink-0">
        <div className="flex-1 overflow-hidden">
          <StepCard />
        </div>
        <div className="p-4 border-t border-white/10">
          <PracticeMode />
        </div>
      </div>
    </div>
  )
}
