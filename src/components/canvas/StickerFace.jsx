import React, { useMemo } from 'react'
import * as THREE from 'three'
import { FACE_COLORS } from '../../utils/colors.js'
import { STICKER_SIZE, STICKER_OFFSET } from '../../utils/constants.js'

// Direction → [position, rotation] for the sticker mesh
const DIR_CONFIG = {
  'y+': { pos: [0,  STICKER_OFFSET, 0],  rot: [-Math.PI / 2, 0, 0] },
  'y-': { pos: [0, -STICKER_OFFSET, 0],  rot: [ Math.PI / 2, 0, 0] },
  'x+': { pos: [ STICKER_OFFSET, 0, 0],  rot: [0,  Math.PI / 2, 0] },
  'x-': { pos: [-STICKER_OFFSET, 0, 0],  rot: [0, -Math.PI / 2, 0] },
  'z+': { pos: [0, 0,  STICKER_OFFSET],  rot: [0, 0, 0] },
  'z-': { pos: [0, 0, -STICKER_OFFSET],  rot: [0, Math.PI, 0] },
}

/**
 * A single coloured sticker rendered as a slightly raised plane
 * on the surface of a cubie.
 *
 * Props:
 *   direction — one of 'y+', 'y-', 'x+', 'x-', 'z+', 'z-'
 *   color     — face letter ('U','R','F','D','L','B') or hex string
 *   emissive  — optional emissive hex for tutorial highlighting
 *   emissiveIntensity — 0-1
 *   opacity   — 0-1 (for dimming in tutorial mode)
 */
export default function StickerFace({
  direction,
  color,
  emissive = '#000000',
  emissiveIntensity = 0,
  opacity = 1,
}) {
  const cfg = DIR_CONFIG[direction]
  if (!cfg) return null

  const hexColor = FACE_COLORS[color] ?? color

  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: hexColor,
        roughness: 0.25,
        metalness: 0,
        clearcoat: 0.6,
        clearcoatRoughness: 0.1,
        emissive: new THREE.Color(emissive),
        emissiveIntensity,
        transparent: opacity < 1,
        opacity,
      }),
    [hexColor, emissive, emissiveIntensity, opacity]
  )

  return (
    <mesh position={cfg.pos} rotation={cfg.rot}>
      <planeGeometry args={[STICKER_SIZE, STICKER_SIZE]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}
