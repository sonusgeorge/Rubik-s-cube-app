import React, { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera, OrbitControls, Environment } from '@react-three/drei'
import RubiksCube from './RubiksCube.jsx'
import GroundPlane from './GroundPlane.jsx'
import CubeControls from './CubeControls.jsx'

export default function CubeScene() {
  const orbitRef = useRef()
  const cubieRefs = useRef([])   // array of RoundedBox meshes — for raycasting
  const cubeGroupRef = useRef()  // the <group> root of all 27 cubies — for re-parenting

  return (
    <Canvas
      shadows
      gl={{ antialias: true, toneMapping: 4 /* ACESFilmicToneMapping */ }}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Camera */}
      <PerspectiveCamera makeDefault position={[4, 3, 4]} fov={45} />

      {/* Orbit controls */}
      <OrbitControls
        ref={orbitRef}
        enableDamping
        dampingFactor={0.08}
        minDistance={4}
        maxDistance={12}
        enablePan={false}
      />

      {/* Lighting — 3-point studio setup */}
      <ambientLight intensity={0.15} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-3, 4, -2]} intensity={0.4} />
      <directionalLight position={[0, 2, -8]} intensity={0.3} />

      {/* Environment map for reflections */}
      <Environment preset="studio" />

      {/* The cube — cubeGroupRef is the rotation anchor */}
      <RubiksCube cubieRefs={cubieRefs} cubeGroupRef={cubeGroupRef} />

      {/* Interaction handler — attaches events to canvas, no visible geometry */}
      <CubeControls orbitRef={orbitRef} cubieRefs={cubieRefs} cubeGroupRef={cubeGroupRef} />

      {/* Ground */}
      <GroundPlane />
    </Canvas>
  )
}
