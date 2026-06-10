import React, { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera, OrbitControls, Environment, Lightformer } from '@react-three/drei'
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
        dampingFactor={0.12}
        rotateSpeed={0.8}
        minDistance={4}
        maxDistance={12}
        enablePan={false}
      />

      {/* Lighting — every face of the cube must stay readable from any angle,
          including mid-rotation when stickers tilt away from the key light
          and internal plastic gets exposed. */}
      <ambientLight intensity={0.4} />
      <hemisphereLight args={['#ffffff', '#8888aa', 0.5]} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-6, 4, 2]} intensity={0.6} />
      <directionalLight position={[2, 3, -6]} intensity={0.6} />
      <directionalLight position={[0, -5, 0]} intensity={0.35} />

      {/* Environment map for reflections — rendered locally from Lightformers.
          The previous preset="studio" fetched an HDR from a CDN at runtime:
          on slow/failed loads the cube lost most of its lighting (faces went
          near-black) and a fetch error crashed the whole canvas. */}
      <Environment resolution={64}>
        <Lightformer intensity={1.2} rotation-x={Math.PI / 2} position={[0, 5, 0]} scale={[10, 10, 1]} />
        <Lightformer intensity={0.7} rotation-y={Math.PI / 2} position={[-5, 1, 0]} scale={[10, 3, 1]} />
        <Lightformer intensity={0.7} rotation-y={-Math.PI / 2} position={[5, 1, 0]} scale={[10, 3, 1]} />
        <Lightformer intensity={0.5} position={[0, 1, -5]} scale={[10, 3, 1]} />
      </Environment>

      {/* The cube — cubeGroupRef is the rotation anchor */}
      <RubiksCube cubieRefs={cubieRefs} cubeGroupRef={cubeGroupRef} />

      {/* Interaction handler — attaches events to canvas, no visible geometry */}
      <CubeControls orbitRef={orbitRef} cubieRefs={cubieRefs} cubeGroupRef={cubeGroupRef} />

      {/* Ground */}
      <GroundPlane />
    </Canvas>
  )
}
