import React from 'react'
import { X } from 'lucide-react'
import useUIStore from '../../store/uiStore.js'

const MOVES = [
  { move: 'R / R\'', desc: 'Right face CW / CCW' },
  { move: 'L / L\'', desc: 'Left face CW / CCW' },
  { move: 'U / U\'', desc: 'Top face CW / CCW' },
  { move: 'D / D\'', desc: 'Bottom face CW / CCW' },
  { move: 'F / F\'', desc: 'Front face CW / CCW' },
  { move: 'B / B\'', desc: 'Back face CW / CCW' },
  { move: 'M / E / S', desc: 'Middle slices (follow L / D / F)' },
  { move: 'X2', desc: 'Double turn (180°)' },
]

export default function NotationGuide() {
  const { showNotationGuide, toggleNotationGuide } = useUIStore()

  if (!showNotationGuide) return null

  return (
    <div className="absolute top-16 left-4 w-72 bg-black/80 backdrop-blur border border-white/10 rounded-xl p-4 text-white pointer-events-auto z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Move Notation</h3>
        <button onClick={toggleNotationGuide} className="text-white/50 hover:text-white">
          <X size={16} />
        </button>
      </div>
      <div className="space-y-1.5">
        {MOVES.map(({ move, desc }) => (
          <div key={move} className="flex items-center gap-3">
            <code className="text-xs font-mono bg-white/10 px-2 py-0.5 rounded w-20 text-center">
              {move}
            </code>
            <span className="text-xs text-white/60">{desc}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-white/30 mt-3">
        CW = clockwise when looking directly at that face
      </p>
      <p className="text-xs text-white/30 mt-1">
        Keyboard: press a letter to turn, hold Shift for CCW
      </p>
    </div>
  )
}
