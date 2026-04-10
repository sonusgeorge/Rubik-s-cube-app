const FACES = ['R', 'L', 'U', 'D', 'F', 'B']
const OPPOSITE = { R: 'L', L: 'R', U: 'D', D: 'U', F: 'B', B: 'F' }
const MODIFIERS = ['', "'", '2']

/**
 * Generate a WCA-style random scramble of `length` moves.
 * Constraints:
 *   - No two consecutive moves on the same face
 *   - No three consecutive moves where face2 is opposite to face1 and face3 === face1
 */
export function generateScramble(length = 20) {
  const moves = []
  let prev = null
  let prevPrev = null

  while (moves.length < length) {
    let face
    let attempts = 0
    do {
      face = FACES[Math.floor(Math.random() * FACES.length)]
      attempts++
      if (attempts > 100) break // safety valve
    } while (
      face === prev ||
      (face === prevPrev && OPPOSITE[face] === prev)
    )

    const mod = MODIFIERS[Math.floor(Math.random() * 3)]
    moves.push(face + mod)
    prevPrev = prev
    prev = face
  }

  return moves.join(' ')
}
