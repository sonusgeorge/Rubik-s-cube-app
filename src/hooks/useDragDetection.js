import { useRef, useCallback } from 'react'
import * as THREE from 'three'

const DRAG_THRESHOLD = 5 // px before we commit to a rotation

/**
 * Returns pointer event handlers that detect which face was tapped and
 * the swipe direction, then call `onRotate(moveName)`.
 *
 * `cubieRefs` — array of Three.js mesh objects to raycast against.
 * `camera`    — Three.js camera.
 * `onRotate`  — callback(moveName: string)
 * `disabled`  — boolean: block new drags while animating
 */
export function useDragDetection({ cubieRefs, camera, onRotate, disabled }) {
  const state = useRef({
    down: false,
    startX: 0,
    startY: 0,
    hitCubie: null,
    hitNormal: null,
  })

  const raycaster = useRef(new THREE.Raycaster())

  const getPointerNDC = useCallback((event, domElement) => {
    const rect = domElement.getBoundingClientRect()
    const clientX = event.touches ? event.touches[0].clientX : event.clientX
    const clientY = event.touches ? event.touches[0].clientY : event.clientY
    return new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    )
  }, [])

  const onPointerDown = useCallback(
    (event) => {
      if (disabled) return
      const ndc = getPointerNDC(event, event.target)
      raycaster.current.setFromCamera(ndc, camera.current)
      const hits = raycaster.current.intersectObjects(cubieRefs.current ?? [], false)

      if (hits.length === 0) return

      const hit = hits[0]
      state.current = {
        down: true,
        startX: event.touches ? event.touches[0].clientX : event.clientX,
        startY: event.touches ? event.touches[0].clientY : event.clientY,
        hitCubie: hit.object,
        hitNormal: hit.face.normal.clone().transformDirection(hit.object.matrixWorld),
      }
      event.stopPropagation()
    },
    [disabled, camera, cubieRefs, getPointerNDC]
  )

  const onPointerUp = useCallback(
    (event) => {
      if (!state.current.down) return
      state.current.down = false

      const clientX = event.changedTouches ? event.changedTouches[0].clientX : event.clientX
      const clientY = event.changedTouches ? event.changedTouches[0].clientY : event.clientY
      const dx = clientX - state.current.startX
      const dy = clientY - state.current.startY
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < DRAG_THRESHOLD) return // tap, not swipe

      const { hitCubie, hitNormal } = state.current
      if (!hitCubie || !hitNormal) return

      const move = determineMoveFromDrag(hitNormal, dx, dy, hitCubie)
      if (move) onRotate(move)
    },
    [onRotate]
  )

  return { onPointerDown, onPointerUp }
}

/**
 * Given the face normal and drag delta, determine the move notation string.
 *
 * Strategy: cross(faceNormal, dragDirection) → rotation axis
 * Then map axis + cubie position to face name + direction.
 */
function determineMoveFromDrag(faceNormal, dx, dy, cubie) {
  // Build a screen-space drag vector (in world space we use x/y screen axes)
  const drag = new THREE.Vector3(dx, -dy, 0).normalize()

  // The rotation axis is perpendicular to both the face normal and the drag direction
  const rotAxis = new THREE.Vector3().crossVectors(faceNormal, drag).normalize()

  // Dominant component tells us which world axis we're rotating around
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

  // Which layer along that axis?
  const worldPos = new THREE.Vector3()
  cubie.getWorldPosition(worldPos)
  const layer = Math.round([worldPos.x, worldPos.y, worldPos.z][axisIndex])

  return layerToMove(axisIndex, layer, axisSign)
}

const AXIS_FACE_MAP = [
  // axis 0 (X): layer +1 → R, layer -1 → L
  { 1: 'R', '-1': 'L' },
  // axis 1 (Y): layer +1 → U, layer -1 → D
  { 1: 'U', '-1': 'D' },
  // axis 2 (Z): layer +1 → F, layer -1 → B
  { 1: 'F', '-1': 'B' },
]

function layerToMove(axisIndex, layer, sign) {
  if (layer === 0) return null // middle slice — skip for now
  const faceMap = AXIS_FACE_MAP[axisIndex]
  const face = faceMap[layer]
  if (!face) return null
  // sign > 0 means CW when looking from positive axis direction
  return sign > 0 ? face : `${face}'`
}
