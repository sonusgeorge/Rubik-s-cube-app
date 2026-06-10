import React from 'react'
import CubeScene from './components/canvas/CubeScene.jsx'
import Toolbar from './components/ui/Toolbar.jsx'
import MoveHistory from './components/ui/MoveHistory.jsx'
import SettingsPanel from './components/ui/SettingsPanel.jsx'
import SolvedOverlay from './components/ui/SolvedOverlay.jsx'
import Timer from './components/ui/Timer.jsx'
import NotationGuide from './components/ui/NotationGuide.jsx'
import TutorialOverlay from './components/tutorial/TutorialOverlay.jsx'
import { useTutorialStore } from './store/tutorialStore.js'
import { useKeyboardMoves } from './hooks/useKeyboardMoves.js'

export default function App() {
  const isTutorialActive = useTutorialStore((s) => s.isActive)

  // Keyboard move input (R/L/U/D/F/B/M/E/S, Shift = counter-clockwise)
  useKeyboardMoves()

  return (
    <div className="relative w-full h-full">
      {/* 3D Canvas — fills the viewport */}
      <CubeScene />

      {/* 2D UI overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
        <div className="pointer-events-auto">
          <Toolbar />
        </div>
        <div className="pointer-events-auto">
          <MoveHistory />
        </div>
      </div>

      {/* Speedcubing timer — top centre, under the toolbar */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-auto">
        <Timer />
      </div>

      {/* Win celebration */}
      <SolvedOverlay />

      {/* Tutorial overlay */}
      {isTutorialActive && <TutorialOverlay />}

      {/* Notation guide (conditionally shown) */}
      <NotationGuide />

      {/* Settings panel (conditionally shown) */}
      <SettingsPanel />
    </div>
  )
}
