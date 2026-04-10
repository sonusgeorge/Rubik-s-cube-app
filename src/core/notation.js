import { parseMoveStr } from './CubeState.js'

/**
 * Parse a Singmaster notation string into an array of move objects.
 * e.g. "R U R' U'" → [{face:'R',modifier:1}, {face:'U',modifier:1}, ...]
 *
 * Supports: R L U D F B (and primes + doubles)
 * Also: M E S (slice moves — mapped to face equivalents)
 * Also: x y z (whole-cube rotations — included as-is for the animation layer)
 */
export function parseNotation(str) {
  const tokens = str.trim().split(/\s+/)
  return tokens.map((token) => {
    const [face, modifier] = parseMoveStr(token)
    return { face, modifier, raw: token }
  })
}

/**
 * Serialize a move list back to a notation string.
 */
export function serializeNotation(moves) {
  return moves
    .map(({ face, modifier }) => {
      if (modifier === -1) return `${face}'`
      if (modifier === 2) return `${face}2`
      return face
    })
    .join(' ')
}

/**
 * Invert a sequence of moves (reverse order, flip direction).
 */
export function invertSequence(moves) {
  return [...moves]
    .reverse()
    .map(({ face, modifier }) => ({ face, modifier: modifier === 2 ? 2 : -modifier }))
}
