import { useCallback, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useDragDetection } from './useDragDetection.js'
import { useRotation } from './useRotation.js'
import { getRotationTarget, getCubiesInLayer, snapPosition } from '../core/rotationMath.js'
import useCubeStore from '../store/cubeStore.js'
import { useTutorialStore } from '../store/tutorialStore.js'

/**
 * Orchestrates drag detection → rotation animation → state update.
 *
 * `cubeGroupRef` — ref to the parent THREE.Group holding all cubies
 * `cubieRefs`    — ref to array of cubie mesh objects
 * `orbitRef`     — ref to OrbitControls (disabled during drag)
 */
export function useCubeInteraction({ cubeGroupRef, cubieRefs, orbitRef }) {
  const { camera } = useThree()
  const cameraRef = useRef()
  cameraRef.current = camera

  const isAnimating = useCubeStore((s) => s.isAnimating)
  const applyMoveFn = useCubeStore((s) => s.applyMove)
  const setAnimating = useCubeStore((s) => s.setAnimating)
  const validateMove = useTutorialStore((s) => s.validateMove)
  const isTutorialActive = useTutorialStore((s) => s.isActive)

  const animateRotation = useRotation()

  const executeMove = useCallback(
    async (moveName) => {
      if (isAnimating) return
      setAnimating(true)
      if (orbitRef?.current) orbitRef.current.enabled = false

      // Tutorial validation
      if (isTutorialActive) {
        const result = validateMove(moveName)
        if (result === 'wrong') {
          // Still animate but signal wrong
        }
      }

      // Determine rotation target
      const [face] = [moveName.replace("'", '').replace('2', '')]
      const modifier = moveName.includes("'") ? -1 : moveName.includes('2') ? 2 : 1
      const { axisName, angle } = getRotationTarget(face, modifier)

      // Find the 9 cubies in this layer
      const allCubies = cubeGroupRef.current?.children ?? []
      const layerCubies = getCubiesInLayer(allCubies, face)

      // Create a temporary rotation group
      const rotGroup = new THREE.Group()
      cubeGroupRef.current.add(rotGroup)
      for (const c of layerCubies) {
        rotGroup.attach(c)
      }

      // Animate
      await animateRotation(rotGroup, axisName, angle)

      // Re-parent cubies back and snap positions
      for (const c of [...rotGroup.children]) {
        cubeGroupRef.current.attach(c)
        snapPosition(c.position)
        c.rotation.set(0, 0, 0)
      }
      cubeGroupRef.current.remove(rotGroup)

      // Update logical state
      applyMoveFn(moveName)
      setAnimating(false)
      if (orbitRef?.current) orbitRef.current.enabled = true
    },
    [isAnimating, animateRotation, applyMoveFn, setAnimating, cubeGroupRef, orbitRef, isTutorialActive, validateMove]
  )

  const { onPointerDown, onPointerUp } = useDragDetection({
    cubieRefs,
    camera: cameraRef,
    onRotate: executeMove,
    disabled: isAnimating,
  })

  return { onPointerDown, onPointerUp, executeMove }
}
