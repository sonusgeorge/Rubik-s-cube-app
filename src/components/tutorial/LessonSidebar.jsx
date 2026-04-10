import React from 'react'
import { CheckCircle, Circle, ChevronRight } from 'lucide-react'
import { useTutorialStore } from '../../store/tutorialStore.js'
import { MODULES, LESSONS } from '../../core/tutorial/lessons.js'

export default function LessonSidebar() {
  const { currentLesson, completedLessons, startLesson } = useTutorialStore()

  return (
    <div className="w-64 h-full overflow-y-auto bg-black/60 border-r border-white/10 p-3">
      <h2 className="text-white font-bold text-sm mb-4 px-1">Beginner Method</h2>

      {MODULES.map((module) => (
        <div key={module.id} className="mb-4">
          <h3 className="text-white/50 text-xs font-semibold uppercase tracking-wider px-1 mb-1">
            {module.title}
          </h3>
          <div className="space-y-0.5">
            {module.lessons.map((lessonId) => {
              const lesson = LESSONS[lessonId]
              const isComplete = completedLessons[lessonId]?.completed
              const isCurrent = currentLesson === lessonId

              return (
                <button
                  key={lessonId}
                  onClick={() => startLesson(lessonId)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs transition-colors ${
                    isCurrent
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {isComplete ? (
                    <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
                  ) : (
                    <Circle size={14} className="text-white/20 flex-shrink-0" />
                  )}
                  <span className="flex-1 truncate">{lesson?.title ?? lessonId}</span>
                  {isCurrent && <ChevronRight size={12} className="flex-shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
