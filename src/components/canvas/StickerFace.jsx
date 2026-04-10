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

const STICKER_DEPTH = 0.04  // Thin box depth — visible from all angles during rotation

/**
 * A single coloured sticker rendered as a thin box (not a plane).
 * Using a box instead of a plane avoids backface-culling artifacts
 * when the cube layer rotates and stickers temporarily face away
 * from the camera (which caused the "black sticker" bug during animation).
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

  // Front face (visible colored sticker)
  const frontMaterial = useMemo(
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

  // Side and back faces of the thin box — match cubie body color
  const sideMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#1a1a1a',
        roughness: 0.35,
        metalness: 0,
        transparent: opacity < 1,
        opacity,
      }),
    [opacity]
  )

  // BoxGeometry face order: +X, -X, +Y, -Y, +Z, -Z
  // The sticker plane is along Z (local), so +Z face = front of sticker = colored
  // All other faces = dark body color
  const materials = [
    sideMaterial,  // +X
    sideMaterial,  // -X
    sideMaterial,  // +Y
    sideMaterial,  // -Y
    frontMaterial, // +Z  ← the visible colored face
    sideMaterial,  // -Z
  ]

  return (
    <mesh position={cfg.pos} rotation={cfg.rot}>
      <boxGeometry args={[STICKER_SIZE, STICKER_SIZE, STICKER_DEPTH]} />
      {materials.map((mat, i) => (
        <primitive key={i} object={mat} attach={`material-${i}`} />
      ))}
    </mesh>
  )
}
