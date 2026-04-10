import { useCallback, useRef, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useDragDetection } from './useDragDetection.js'
import { useRotation } from './useRotation.js'
import { getRotationTarget, getCubiesInLayer, snapPosition } from '../core/rotationMath.js'
import useCubeStore from '../store/cubeStore.js'
import { useTutorialStore } from '../store/tutorialStore.js'
import useUIStore from '../store/uiStore.js'

/**
 * Orchestrates drag detection → rotation animation → state update.
 *
 * `cubeGroupRef` — ref to the <group> wrapping all 27 cubies (from RubiksCube)
 * `cubieRefs`    — ref to array of cubie RoundedBox mesh objects (for raycasting)
 * `orbitRef`     — ref to OrbitControls (disabled during drag)
 * `domElement`   — the canvas DOM element (for pointer event attachment)
 */
export function useCubeInteraction({ cubeGroupRef, cubieRefs, orbitRef, domElement }) {
  const { camera } = useThree()
  const cameraRef = useRef()
  cameraRef.current = camera

  const validateMove = useTutorialStore((s) => s.validateMove)
  const isTutorialActive = useTutorialStore((s) => s.isActive)

  const animateRotation = useRotation()

  /**
   * Execute a single move with full animation + state update.
   * Reads isAnimating fresh from store to avoid stale-closure bugs.
   * speedOverride: 'fast' | 'slow' | 'instant' | undefined (uses user setting)
   */
  const executeMove = useCallback(
    async (moveName, speedOverride) => {
      // Always read fresh from store — avoids stale closure on isAnimating
      if (useCubeStore.getState().isAnimating) return
      useCubeStore.getState().setAnimating(true)

      if (orbitRef?.current) orbitRef.current.enabled = false

      // Tutorial validation
      if (isTutorialActive) {
        validateMove(moveName)
      }

      // Parse move
      const face = moveName.replace("'", '').replace('2', '')
      const modifier = moveName.includes("'") ? -1 : moveName.includes('2') ? 2 : 1
      const { axisName, angle } = getRotationTarget(face, modifier)

      // Find the 9 cubies in this face layer
      // cubeGroupRef.current.children = the 27 Cubie <group> wrappers
      const cubeChildren = Array.from(cubeGroupRef.current?.children ?? [])
      const layerCubies = getCubiesInLayer(cubeChildren, face)

      if (layerCubies.length > 0) {
        // Temporarily re-parent layer cubies into a rotation group
        const rotGroup = new THREE.Group()
        cubeGroupRef.current.add(rotGroup)
        for (const c of layerCubies) {
          rotGroup.attach(c) // preserves world transform
        }

        // GSAP-animate the rotation group
        await animateRotation(rotGroup, axisName, angle, speedOverride)

        // Re-parent back to main cube group + teleport back to React home slot.
        // Important: this prevents the physical groups from permanently drifting 
        // to new spots and causing their fixed `StickerFaces` to face inward.
        for (const c of [...rotGroup.children]) {
          cubeGroupRef.current.attach(c)
          if (c.userData && c.userData.gridPos) {
            c.position.set(...c.userData.gridPos)
          } else {
            snapPosition(c.position)
          }
          c.rotation.set(0, 0, 0)
        }
        cubeGroupRef.current.remove(rotGroup)
      }

      // Update logical facelet state (triggers React re-render for colors)
      useCubeStore.getState().applyMove(moveName)
      useCubeStore.getState().setAnimating(false)

      if (orbitRef?.current) orbitRef.current.enabled = true
    },
    // NOTE: we intentionally exclude isAnimating from deps — we read it from store
    [animateRotation, cubeGroupRef, orbitRef, isTutorialActive, validateMove]
  )

  const { onPointerDown, onPointerUp } = useDragDetection({
    cubieRefs,
    camera: cameraRef,
    domElement,
    orbitRef,
    onRotate: executeMove,
  })

  // Attach native DOM pointer events to the canvas element.
  // Using DOM events (not R3F synthetic events) avoids the invisible-box problem.
  useEffect(() => {
    if (!domElement) return
    // Use 'capture: true' so our handler fires before OrbitControls sees the event
    domElement.addEventListener('pointerdown', onPointerDown, { capture: true })
    domElement.addEventListener('pointerup', onPointerUp, { capture: true })
    return () => {
      domElement.removeEventListener('pointerdown', onPointerDown, { capture: true })
      domElement.removeEventListener('pointerup', onPointerUp, { capture: true })
    }
  }, [domElement, onPointerDown, onPointerUp])

  // Keep OrbitControls in sync with the interaction mode.
  // In 'look' mode, ensure orbit is always enabled.
  const interactionMode = useUIStore((s) => s.interactionMode)
  useEffect(() => {
    if (!orbitRef?.current) return
    if (interactionMode === 'look') {
      orbitRef.current.enabled = true
    }
  }, [interactionMode, orbitRef])

  return { executeMove }
}
