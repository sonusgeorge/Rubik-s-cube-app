import { FACE_NAMES } from '../utils/colors.js'

/**
 * Basic structural validation of a 54-facelet state.
 * Checks that each color appears exactly 9 times.
 * (Does NOT check parity / solvability — that requires deeper analysis.)
 */
export function isValidState(state) {
  if (!Array.isArray(state) || state.length !== 54) return false

  const counts = {}
  for (const f of FACE_NAMES) counts[f] = 0

  for (const facelet of state) {
    if (!(facelet in counts)) return false
    counts[facelet]++
  }

  return Object.values(counts).every((c) => c === 9)
}
