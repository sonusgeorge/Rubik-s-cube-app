import { useCallback, useRef, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useDragDetection } from './useDragDetection.js'
import { useRotation } from './useRotation.js'
import { getRotationTarget, getCubiesInLayer, snapPosition } from '../core/rotationMath.js'
import { playRotateSound, playSnapSound } from './useSound.js'
import useCubeStore from '../store/cubeStore.js'
import { useTutorialStore } from '../store/tutorialStore.js'
import useUIStore from '../store/uiStore.js'

const MAX_QUEUED_MOVES = 8 // drop input beyond this to avoid runaway spam

/**
 * Orchestrates drag detection → rotation animation → state update.
 *
 * Moves are serialized through a FIFO promise chain: a move requested while
 * another is animating is queued (up to MAX_QUEUED_MOVES) instead of dropped,
 * so fast successive turns all register.
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

  /** The actual animation + state update for a single move. */
  const performMove = useCallback(
    async (moveName, speedOverride) => {
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

      playRotateSound()

      // Find the 9 cubies in this move's layer
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

      playSnapSound()

      if (orbitRef?.current) orbitRef.current.enabled = true
    },
    [animateRotation, cubeGroupRef, orbitRef, isTutorialActive, validateMove]
  )

  // FIFO queue: serialize moves so rapid input is played back in order
  const queueRef = useRef(Promise.resolve())
  const pendingRef = useRef(0)

  const executeMove = useCallback(
    (moveName, speedOverride) => {
      if (pendingRef.current >= MAX_QUEUED_MOVES) return Promise.resolve()
      pendingRef.current += 1
      const run = queueRef.current.then(() =>
        performMove(moveName, speedOverride).finally(() => {
          pendingRef.current -= 1
          // isAnimating stays true until the whole queue drains, so UI
          // guards (undo/scramble buttons) cover queued moves too.
          if (pendingRef.current === 0) useCubeStore.getState().setAnimating(false)
        })
      )
      // Keep the chain alive even if a move throws
      queueRef.current = run.catch(() => {})
      return run
    },
    [performMove]
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
