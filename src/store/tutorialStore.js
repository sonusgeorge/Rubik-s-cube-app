import { create } from 'zustand'
import { LESSONS } from '../core/tutorial/lessons.js'

export const useTutorialStore = create((set, get) => ({
  isActive: false,
  currentModule: null,
  currentLesson: null,
  currentStep: 0,
  lessonState: 'INTRO', // 'INTRO' | 'DEMO' | 'PRACTICE' | 'CHALLENGE' | 'COMPLETE'
  expectedMoves: [],
  expectedCubeState: null,
  moveIndex: 0,
  completedLessons: loadProgress(),
  bestTimes: loadBestTimes(),
  hintsUsed: 0,
  hintLevel: 0,       // 0=none, 1=piece, 2=face, 3=exact move, 4=auto-demo
  highlightedCubies: [],
  dimmedCubies: false,

  startTutorial() {
    set({ isActive: true, currentModule: 0, currentLesson: '0.1', currentStep: 0, lessonState: 'INTRO' })
  },

  exitTutorial() {
    set({ isActive: false, currentModule: null, currentLesson: null, highlightedCubies: [], dimmedCubies: false })
  },

  startLesson(lessonId) {
    const lesson = LESSONS[lessonId]
    if (!lesson) return
    const step = lesson.steps[0]
    set({
      currentLesson: lessonId,
      currentStep: 0,
      lessonState: 'INTRO',
      expectedMoves: step?.expectedMoves ?? [],
      moveIndex: 0,
      hintsUsed: 0,
      hintLevel: 0,
      highlightedCubies: step?.highlightFacelets ?? [],
    })
  },

  advanceStep() {
    const { currentLesson, currentStep } = get()
    const lesson = LESSONS[currentLesson]
    if (!lesson) return
    const nextStep = currentStep + 1
    if (nextStep >= lesson.steps.length) {
      // Lesson complete
      const { completedLessons } = get()
      const updated = { ...completedLessons, [currentLesson]: { completed: true, completedAt: new Date().toISOString() } }
      saveProgress(updated)
      set({ lessonState: 'COMPLETE', completedLessons: updated })
    } else {
      const step = lesson.steps[nextStep]
      set({
        currentStep: nextStep,
        lessonState: 'PRACTICE',
        expectedMoves: step.expectedMoves ?? [],
        moveIndex: 0,
        hintLevel: 0,
        highlightedCubies: step.highlightFacelets ?? [],
      })
    }
  },

  /**
   * Validate a move the user performed during a lesson step.
   * Returns 'correct' | 'wrong' | 'done'
   */
  validateMove(moveName) {
    const { expectedMoves, moveIndex } = get()
    if (expectedMoves.length === 0) return 'correct'

    const expected = expectedMoves[moveIndex]
    if (moveName === expected) {
      const nextIndex = moveIndex + 1
      if (nextIndex >= expectedMoves.length) {
        set({ moveIndex: 0 })
        get().advanceStep()
        return 'done'
      }
      set({ moveIndex: nextIndex, hintLevel: 0 })
      return 'correct'
    }
    // Wrong move
    set((s) => ({ hintsUsed: s.hintsUsed + 1, hintLevel: Math.min(4, s.hintLevel + 1) }))
    return 'wrong'
  },

  requestHint() {
    set((s) => ({ hintLevel: Math.min(4, s.hintLevel + 1), hintsUsed: s.hintsUsed + 1 }))
  },

  recordTime(ms) {
    const { bestTimes, currentLesson } = get()
    const prev = bestTimes[currentLesson]
    if (!prev || ms < prev) {
      const updated = { ...bestTimes, [currentLesson]: ms }
      saveBestTimes(updated)
      set({ bestTimes: updated })
    }
  },
}))

// localStorage helpers
function loadProgress() {
  try { return JSON.parse(localStorage.getItem('rk-tutorial-progress') || '{}') } catch { return {} }
}
function saveProgress(p) {
  try { localStorage.setItem('rk-tutorial-progress', JSON.stringify(p)) } catch {}
}
function loadBestTimes() {
  try { return JSON.parse(localStorage.getItem('rk-tutorial-times') || '{}') } catch { return {} }
}
function saveBestTimes(t) {
  try { localStorage.setItem('rk-tutorial-times', JSON.stringify(t)) } catch {}
}
