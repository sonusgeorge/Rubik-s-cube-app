import React, { useEffect, useRef } from 'react'
import useUIStore from '../../store/uiStore.js'
import useCubeStore from '../../store/cubeStore.js'

/**
 * Full-screen celebration overlay that appears when the cube is solved
 * (after at least one move has been made — ignores the initial solved state).
 * Auto-dismisses after 3.5 seconds.
 */
export default function SolvedOverlay() {
  const celebratingSolve = useUIStore((s) => s.celebratingSolve)
  const moveHistory = useCubeStore((s) => s.moveHistory)
  const scrambleBase = useCubeStore((s) => s.scrambleBase)
  const isSolved = useCubeStore((s) => s.isSolved)
  const triggerCelebration = useUIStore((s) => s.triggerCelebration)
  const prevSolved = useRef(false)

  // Detect the moment the cube transitions unsolved → solved (after real moves)
  useEffect(() => {
    if (isSolved && !prevSolved.current && moveHistory.length > 0) {
      triggerCelebration()
    }
    prevSolved.current = isSolved
  }, [isSolved, moveHistory.length, triggerCelebration])

  if (!celebratingSolve) return null

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
      style={{ animation: 'fadeInOverlay 0.4s ease-out' }}
    >
      {/* Confetti particles */}
      <Confetti />

      {/* Central card */}
      <div
        className="relative flex flex-col items-center gap-3 px-12 py-8 rounded-3xl text-center"
        style={{
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.15)',
          animation: 'bounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          boxShadow: '0 0 60px rgba(255, 215, 0, 0.3)',
        }}
      >
        <div style={{ fontSize: '3.5rem', animation: 'spinEmoji 0.6s ease-out 0.3s both' }}>
          🎉
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tight">
          Solved!
        </h2>
        <p className="text-white/60 text-base">
          in {Math.max(0, moveHistory.length - scrambleBase)} moves
        </p>
        <div className="flex gap-2 mt-1">
          {['R', 'G', 'B', 'W', 'Y', 'O'].map((c, i) => (
            <div
              key={c}
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: colorMap[c],
                animation: `dotPop 0.3s ease-out ${0.5 + i * 0.07}s both`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

const colorMap = {
  R: '#B71234',
  G: '#009B48',
  B: '#0046AD',
  W: '#FFFFFF',
  Y: '#FFD500',
  O: '#FF5800',
}

/** Simple CSS confetti using random-positioned, colored dots */
function Confetti() {
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    color: Object.values(colorMap)[i % 6],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.8}s`,
    size: `${6 + Math.random() * 8}px`,
    duration: `${1.5 + Math.random() * 1.5}s`,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            top: '-20px',
            left: p.left,
            width: p.size,
            height: p.size,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            backgroundColor: p.color,
            animation: `confettiFall ${p.duration} ease-in ${p.delay} both`,
          }}
        />
      ))}
    </div>
  )
}
