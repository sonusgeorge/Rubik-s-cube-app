import React from 'react'
import { X } from 'lucide-react'
import useUIStore from '../../store/uiStore.js'

export default function SettingsPanel() {
  const { showSettings, animationSpeed, soundEnabled, toggleSettings, setAnimationSpeed, toggleSound } = useUIStore()

  if (!showSettings) return null

  return (
    <div className="absolute top-16 right-4 w-64 bg-black/80 backdrop-blur border border-white/10 rounded-xl p-4 text-white pointer-events-auto z-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">Settings</h3>
        <button onClick={toggleSettings} className="text-white/50 hover:text-white">
          <X size={16} />
        </button>
      </div>

      {/* Animation speed */}
      <div className="mb-4">
        <label className="text-xs text-white/60 block mb-2">Animation Speed</label>
        <div className="flex gap-2">
          {['slow', 'normal', 'fast'].map((speed) => (
            <button
              key={speed}
              onClick={() => setAnimationSpeed(speed)}
              className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
                animationSpeed === speed
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {speed.charAt(0).toUpperCase() + speed.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Sound toggle */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/60">Sound Effects</span>
        <button
          onClick={toggleSound}
          className={`w-10 h-5 rounded-full transition-colors ${
            soundEnabled ? 'bg-green-500' : 'bg-white/20'
          } relative`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
              soundEnabled ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
    </div>
  )
}
