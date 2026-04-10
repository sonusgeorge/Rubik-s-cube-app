import React from 'react'
import { ContactShadows } from '@react-three/drei'

export default function GroundPlane() {
  return (
    <>
      <ContactShadows
        position={[0, -1.65, 0]}
        opacity={0.4}
        scale={8}
        blur={2.5}
        far={4}
        resolution={256}
      />
      {/* Subtle reflective floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.66, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#111111" roughness={0.8} metalness={0.2} />
      </mesh>
    </>
  )
}
