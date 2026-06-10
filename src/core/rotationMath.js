import * as THREE from 'three'
import { CUBIE_SIZE, CUBIE_GAP } from '../utils/constants.js'

const STEP = CUBIE_SIZE + CUBIE_GAP // 1.04

/**
 * Map a move letter to its rotation axis vector, the axis index, the grid
 * layer it selects (+1 / 0 / -1) and the rotation sign.
 * For a CW move (modifier=1), the rotation angle is -π/2 * sign around the axis.
 * Slice moves follow standard notation: M turns like L, E like D, S like F.
 */
export const FACE_AXIS = {
  R: { axis: new THREE.Vector3(1, 0, 0), index: 0, layer: 1,  sign:  1 },
  L: { axis: new THREE.Vector3(1, 0, 0), index: 0, layer: -1, sign: -1 },
  M: { axis: new THREE.Vector3(1, 0, 0), index: 0, layer: 0,  sign: -1 },
  U: { axis: new THREE.Vector3(0, 1, 0), index: 1, layer: 1,  sign:  1 },
  D: { axis: new THREE.Vector3(0, 1, 0), index: 1, layer: -1, sign: -1 },
  E: { axis: new THREE.Vector3(0, 1, 0), index: 1, layer: 0,  sign: -1 },
  F: { axis: new THREE.Vector3(0, 0, 1), index: 2, layer: 1,  sign:  1 },
  B: { axis: new THREE.Vector3(0, 0, 1), index: 2, layer: -1, sign: -1 },
  S: { axis: new THREE.Vector3(0, 0, 1), index: 2, layer: 0,  sign:  1 },
}

/**
 * Given a move letter and modifier (1=CW, -1=CCW, 2=180°), return:
 * - axisName: 'x' | 'y' | 'z'
 * - angle: the GSAP rotation target angle (in radians)
 */
export function getRotationTarget(face, modifier) {
  const { axis, sign } = FACE_AXIS[face]
  const base = -Math.PI / 2 * sign  // CW quarter turn on this face
  const angle = modifier === 2 ? base * 2 : modifier === -1 ? -base : base

  const axisName = axis.x ? 'x' : axis.y ? 'y' : 'z'
  return { axisName, angle }
}

/**
 * Round a cubie's position to the nearest STEP-multiple.
 * Uses STEP (1.04) instead of integers to eliminate the
 * small 0.04-unit visual gap that plain Math.round() produces.
 */
export function snapPosition(vec3) {
  vec3.x = Math.round(vec3.x / STEP) * STEP
  vec3.y = Math.round(vec3.y / STEP) * STEP
  vec3.z = Math.round(vec3.z / STEP) * STEP
  return vec3
}

/**
 * Determine which cubies belong to a given move's layer.
 * Uses the cubie's home grid slot (userData.gridPos) rather than its live
 * world position, so the result is stable even while an animation is
 * mid-flight (queued moves are computed against rest positions).
 */
export function getCubiesInLayer(cubies, face) {
  const { index, layer } = FACE_AXIS[face]
  return cubies.filter((c) => {
    const pos = c.userData?.gridPos ?? c.getWorldPosition(new THREE.Vector3()).toArray()
    return Math.round(pos[index] / STEP) === layer
  })
}
