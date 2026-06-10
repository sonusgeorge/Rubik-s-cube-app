import { create } from 'zustand'

// ── Persisted user preferences ──────────────────────────────
const PREFS_KEY = 'rubiks-cube-prefs-v1'

function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) return {}
    const data = JSON.parse(raw)
    const prefs = {}
    if (['slow', 'normal', 'fast'].includes(data.animationSpeed)) prefs.animationSpeed = data.animationSpeed
    if (typeof data.soundEnabled === 'boolean') prefs.soundEnabled = data.soundEnabled
    if (['turn', 'look'].includes(data.interactionMode)) prefs.interactionMode = data.interactionMode
    return prefs
  } catch {
    return {}
  }
}

const prefs = typeof localStorage !== 'undefined' ? loadPrefs() : {}

const useUIStore = create((set) => ({
  animationSpeed: prefs.animationSpeed ?? 'normal',  // 'slow' | 'normal' | 'fast'
  soundEnabled: prefs.soundEnabled ?? true,
  showSettings: false,
  showNotationGuide: false,
  celebratingSolve: false,
  interactionMode: prefs.interactionMode ?? 'turn',  // 'turn' | 'look'

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
  toggleInteractionMode() {
    set((s) => ({ interactionMode: s.interactionMode === 'turn' ? 'look' : 'turn' }))
  },
}))

// Save preferences whenever they change
if (typeof localStorage !== 'undefined') {
  useUIStore.subscribe((s) => {
    try {
      localStorage.setItem(
        PREFS_KEY,
        JSON.stringify({
          animationSpeed: s.animationSpeed,
          soundEnabled: s.soundEnabled,
          interactionMode: s.interactionMode,
        })
      )
    } catch {
      // non-fatal
    }
  })
}

export default useUIStore
