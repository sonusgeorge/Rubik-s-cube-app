import * as THREE from 'three'
import { CUBIE_SIZE, CUBIE_GAP } from '../utils/constants.js'

const STEP = CUBIE_SIZE + CUBIE_GAP // 1.04

/**
 * Map a face letter to its rotation axis vector and the axis index.
 * For a CW rotation (modifier=1), the quaternion angle is -π/2 around the axis.
 */
export const FACE_AXIS = {
  R: { axis: new THREE.Vector3(1, 0, 0),  index: 0, sign:  1 },
  L: { axis: new THREE.Vector3(1, 0, 0),  index: 0, sign: -1 },
  U: { axis: new THREE.Vector3(0, 1, 0),  index: 1, sign:  1 },
  D: { axis: new THREE.Vector3(0, 1, 0),  index: 1, sign: -1 },
  F: { axis: new THREE.Vector3(0, 0, 1),  index: 2, sign:  1 },
  B: { axis: new THREE.Vector3(0, 0, 1),  index: 2, sign: -1 },
}

/**
 * Given a face name and modifier (1=CW, -1=CCW, 2=180°), return:
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
 * Determine which cubies belong to a given face layer.
 * Compares cubie world position along the face axis to the expected layer value (+1, 0, -1).
 */
export function getCubiesInLayer(cubies, face) {
  const { index, sign } = FACE_AXIS[face]
  return cubies.filter((c) => {
    const pos = c.getWorldPosition(new THREE.Vector3())
    return Math.round(pos.getComponent(index)) === sign
  })
}
