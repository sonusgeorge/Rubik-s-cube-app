import React, { useRef, useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import StickerFace from './StickerFace.jsx'
import { CORNER_RADIUS } from '../../utils/constants.js'
import { useTutorialStore } from '../../store/tutorialStore.js'
import FACELET_MAP from '../../core/cubieMapper.js'

/**
 * One of the 27 cubies.
 *
 * Props:
 *   gridPos   — [x, y, z] in cube space {-1, 0, 1}
 *   faceColors — { 'y+': 'U', 'x+': 'R', ... } for visible faces; missing keys = internal
 *   cubieId   — string key "x,y,z" used for tutorial highlight lookup
 *   meshRef   — forwarded ref array push target (for drag detection)
 */
export default function Cubie({ gridPos, faceColors = {}, cubieId, meshRef }) {
  const ref = useRef()
  const { highlightedCubies, dimmedCubies } = useTutorialStore()

  const isHighlighted = highlightedCubies.includes(cubieId)
  const isDimmed = dimmedCubies && !isHighlighted

  const bodyMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#1a1a1a',
        roughness: 0.35,
        metalness: 0,
        clearcoat: 0.3,
        clearcoatRoughness: 0.2,
        transparent: isDimmed,
        opacity: isDimmed ? 0.3 : 1,
      }),
    [isDimmed]
  )

  // Assign ref for drag-detection raycasting
  const handleRef = (mesh) => {
    if (ref) ref.current = mesh
    if (meshRef && mesh) meshRef.push(mesh)
  }

  return (
    <group position={gridPos}>
      <RoundedBox
        ref={handleRef}
        args={[1, 1, 1]}
        radius={CORNER_RADIUS}
        smoothness={4}
        userData={{ cubieId, gridPos }}
      >
        <primitive object={bodyMaterial} attach="material" />
      </RoundedBox>

      {Object.entries(faceColors).map(([dir, color]) => (
        <StickerFace
          key={dir}
          direction={dir}
          color={color}
          emissive={isHighlighted ? '#FFD700' : '#000000'}
          emissiveIntensity={isHighlighted ? 0.4 : 0}
          opacity={isDimmed ? 0.3 : 1}
        />
      ))}
    </group>
  )
}
