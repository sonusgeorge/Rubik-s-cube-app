import { useCallback } from 'react'
import { gsap } from 'gsap'
import { ANIM } from '../utils/constants.js'
import useUIStore from '../store/uiStore.js'

/**
 * Returns an `animateRotation` function that GSAP-animates a THREE.Group
 * by `angle` radians around `axisName` ('x'|'y'|'z').
 *
 * The promise resolves when the animation completes.
 */
export function useRotation() {
  const animationSpeed = useUIStore((s) => s.animationSpeed)

  const animateRotation = useCallback(
    (group, axisName, angle, speedOverride) => {
      return new Promise((resolve) => {
        const speed = speedOverride ?? animationSpeed
        const duration =
          speed === 'fast'
            ? ANIM.FAST
            : speed === 'slow'
            ? ANIM.SLOW
            : speed === 'instant'
            ? ANIM.INSTANT
            : ANIM.NORMAL

        if (duration === 0) {
          group.rotation[axisName] += angle
          resolve()
          return
        }

        gsap.to(group.rotation, {
          [axisName]: group.rotation[axisName] + angle,
          duration,
          ease: speed === 'slow' ? 'power1.inOut' : speed === 'fast' ? 'power3.out' : 'power2.out',
          onComplete: resolve,
        })
      })
    },
    [animationSpeed]
  )

  return animateRotation
}
