import React, { useRef } from 'react'
import Cubie from './Cubie.jsx'
import { buildCubieFaceColors } from '../../core/cubieMapper.js'
import { CUBIE_SIZE, CUBIE_GAP, GRID_POSITIONS } from '../../utils/constants.js'
import useCubeStore from '../../store/cubeStore.js'

const STEP = CUBIE_SIZE + CUBIE_GAP  // 1.04

/**
 * Assembles all 27 cubies at the correct world positions.
 *
 * Props:
 *   cubieRefs   — ref to array; cubie RoundedBox meshes are pushed here for raycasting
 *   cubeGroupRef — ref attached to the root <group>; used by useCubeInteraction
 *                  for re-parenting during rotation animation
 */
export default function RubiksCube({ cubieRefs, cubeGroupRef }) {
  const facelets = useCubeStore((s) => s.facelets)
  const cubieFaceColors = buildCubieFaceColors(facelets)

  const cubies = []
  for (const x of GRID_POSITIONS) {
    for (const y of GRID_POSITIONS) {
      for (const z of GRID_POSITIONS) {
        const key = [x, y, z].join(',')
        const faceColors = cubieFaceColors.get(key) ?? {}
        const worldPos = [x * STEP, y * STEP, z * STEP]
        cubies.push(
          <Cubie
            key={key}
            gridPos={worldPos}
            faceColors={faceColors}
            cubieId={key}
            meshRef={cubieRefs?.current}
          />
        )
      }
    }
  }

  // cubeGroupRef is the rotation anchor — useCubeInteraction re-parents
  // individual Cubie groups in/out of a temporary rotation group here.
  return <group ref={cubeGroupRef}>{cubies}</group>
}
