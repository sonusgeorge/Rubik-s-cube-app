import React, { useRef } from 'react'
import Cubie from './Cubie.jsx'
import { buildCubieFaceColors } from '../../core/cubieMapper.js'
import { CUBIE_SIZE, CUBIE_GAP, GRID_POSITIONS } from '../../utils/constants.js'
import useCubeStore from '../../store/cubeStore.js'

const STEP = CUBIE_SIZE + CUBIE_GAP  // 1.04

/**
 * Assembles all 27 cubies at the correct world positions.
 * `cubieRefs` is populated with the Three.js mesh objects for drag detection.
 */
export default function RubiksCube({ cubieRefs }) {
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

  return <group>{cubies}</group>
}
