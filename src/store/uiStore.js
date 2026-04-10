import { create } from 'zustand'

const useUIStore = create((set) => ({
  animationSpeed: 'normal',  // 'slow' | 'normal' | 'fast'
  soundEnabled: true,
  showSettings: false,
  showNotationGuide: false,
  celebratingSolve: false,

  setAnimationSpeed(speed) {
    set({ animationSpeed: speed })
  },
  toggleSound() {
    set((s) => ({ soundEnabled: !s.soundEnabled }))
  },
  toggleSettings() {
    set((s) => ({ showSettings: !s.showSettings }))
  },
  toggleNotationGuide() {
    set((s) => ({ showNotationGuide: !s.showNotationGuide }))
  },
  triggerCelebration() {
    set({ celebratingSolve: true })
    setTimeout(() => set({ celebratingSolve: false }), 4000)
  },
}))

export default useUIStore
