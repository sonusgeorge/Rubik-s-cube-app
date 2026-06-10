import { useRef, useCallback } from 'react'
import * as THREE from 'three'
import useUIStore from '../store/uiStore.js'

const DRAG_THRESHOLD = 8 // px before we commit to a rotation

/**
 * Attaches native DOM pointer listeners to `domElement` (the canvas).
 * On pointer-down: raycasts against cubieRefs to find hit cubie + face normal.
 * On pointer-up: computes drag direction → move name → calls onRotate.
 *
 * Uses the real canvas DOM element for accurate NDC calculation.
 */
export function useDragDetection({ cubieRefs, camera, domElement, orbitRef, onRotate, scene }) {
  const dragState = useRef({
    down: false,
    startX: 0,
    startY: 0,
    hitCubie: null,
    hitNormal: null,
  })

  const raycaster = useRef(new THREE.Raycaster())

  const getPointerNDC = useCallback(
    (event) => {
      if (!domElement) return new THREE.Vector2()
      const rect = domElement.getBoundingClientRect()
      const clientX = event.touches ? event.touches[0].clientX : event.clientX
      const clientY = event.touches ? event.touches[0].clientY : event.clientY
      return new THREE.Vector2(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1
      )
    },
    [domElement]
  )

  const onPointerDown = useCallback(
    (event) => {
      // In 'look' mode, skip entirely — OrbitControls owns all drags
      if (useUIStore.getState().interactionMode === 'look') return
      // Drags during an animation are allowed — the resulting move is queued.
      if (!domElement || !camera.current) return

      const ndc = getPointerNDC(event)
      raycaster.current.setFromCamera(ndc, camera.current)

      const meshes = cubieRefs.current ?? []
      const hits = raycaster.current.intersectObjects(meshes, false)
      if (hits.length === 0) return

      const hit = hits[0]
      // Transform face normal from local space to world space
      const worldNormal = hit.face.normal
        .clone()
        .transformDirection(hit.object.matrixWorld)

      dragState.current = {
        down: true,
        startX: event.touches ? event.touches[0].clientX : event.clientX,
        startY: event.touches ? event.touches[0].clientY : event.clientY,
        hitCubie: hit.object,
        hitNormal: worldNormal,
      }
      // Disable OrbitControls immediately so it doesn't steal the drag
      if (orbitRef?.current) orbitRef.current.enabled = false
      // Stop event propagation so OrbitControls never sees this pointerdown
      event.stopPropagation()
    },
    [camera, cubieRefs, getPointerNDC, domElement]
  )

  const onPointerUp = useCallback(
    (event) => {
      if (!dragState.current.down) return
      dragState.current.down = false

      const clientX = event.changedTouches
        ? event.changedTouches[0].clientX
        : event.clientX
      const clientY = event.changedTouches
        ? event.changedTouches[0].clientY
        : event.clientY

      const dx = clientX - dragState.current.startX
      const dy = clientY - dragState.current.startY
      const dist = Math.sqrt(dx * dx + dy * dy)

      const { hitCubie, hitNormal } = dragState.current
      // Re-enable OrbitControls regardless of whether a move fired
      if (orbitRef?.current) orbitRef.current.enabled = true

      if (dist < DRAG_THRESHOLD) return // tap, not swipe
      if (!hitCubie || !hitNormal) return

      const move = determineMoveFromDrag(hitNormal, dx, dy, hitCubie, camera.current)
      if (move) onRotate(move)
    },
    [onRotate]
  )

  return { onPointerDown, onPointerUp }
}

/**
 * Given the face normal and drag delta, determine the move notation string.
 * Strategy: project screen-space drag into world space using camera orientation,
 * then cross(faceNormal, worldDrag) → rotation axis.
 * Then map axis + cubie position → face name + direction.
 */
function determineMoveFromDrag(faceNormal, dx, dy, cubie, cam) {
  // Project the screen-space drag vector into world space using the camera's
  // right and up axes. This ensures the drag direction is correct regardless
  // of the camera's current viewing angle.
  const camRight = new THREE.Vector3()
  const camUp = new THREE.Vector3()
  camRight.setFromMatrixColumn(cam.matrixWorld, 0) // camera X axis (right)
  camUp.setFromMatrixColumn(cam.matrixWorld, 1)    // camera Y axis (up)

  const drag = new THREE.Vector3()
    .addScaledVector(camRight, dx)
    .addScaledVector(camUp, -dy)
    .normalize()

  // Rotation axis = perpendicular to both face normal and drag
  const rotAxis = new THREE.Vector3()
    .crossVectors(faceNormal, drag)
    .normalize()

  const absX = Math.abs(rotAxis.x)
  const absY = Math.abs(rotAxis.y)
  const absZ = Math.abs(rotAxis.z)

  let axisIndex, axisSign
  if (absX >= absY && absX >= absZ) {
    axisIndex = 0; axisSign = rotAxis.x > 0 ? 1 : -1
  } else if (absY >= absX && absY >= absZ) {
    axisIndex = 1; axisSign = rotAxis.y > 0 ? 1 : -1
  } else {
    axisIndex = 2; axisSign = rotAxis.z > 0 ? 1 : -1
  }

  // Which grid layer along this axis? Use the cubie's home slot (stable even
  // mid-animation) rather than its live world position.
  const home = cubie.userData?.gridPos
  const pos = home ?? cubie.getWorldPosition(new THREE.Vector3()).toArray()
  const layer = Math.round(pos[axisIndex])

  return layerToMove(axisIndex, layer, axisSign)
}

// axis index → { layer → face letter }. Middle layers map to slice moves.
const AXIS_FACE_MAP = [
  { 1: 'R', '-1': 'L', 0: 'M' },  // X axis
  { 1: 'U', '-1': 'D', 0: 'E' },  // Y axis
  { 1: 'F', '-1': 'B', 0: 'S' },  // Z axis
]

// Each move's CW turn rotates by -90° * sign about its axis (rotationMath.js),
// i.e. its right-hand-rule rotation axis points along -sign. The drag gesture
// gives us the desired rotation axis directly (cross(normal, drag)), so the
// move is CW exactly when the gesture sign is opposite the move's sign.
const MOVE_SIGN = { R: 1, L: -1, M: -1, U: 1, D: -1, E: -1, F: 1, B: -1, S: 1 }

function layerToMove(axisIndex, layer, sign) {
  const face = AXIS_FACE_MAP[axisIndex][layer]
  if (!face) return null
  const cw = sign !== MOVE_SIGN[face]
  return cw ? face : `${face}'`
}
