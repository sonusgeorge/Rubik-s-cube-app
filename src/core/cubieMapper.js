/**
 * Maps each of the 54 facelets to its 3D cubie grid position and face direction.
 *
 * Grid positions: x, y, z ∈ {-1, 0, 1}
 * Face directions: which axis the sticker faces (e.g. 'y+' = top face)
 *
 * Face index layout:
 *   U = 0-8   (y = +1, looking down)
 *   R = 9-17  (x = +1, looking from right)
 *   F = 18-26 (z = +1, looking from front)
 *   D = 27-35 (y = -1, looking up from below)
 *   L = 36-44 (x = -1, looking from left)
 *   B = 45-53 (z = -1, looking from back)
 */

// U face (indices 0-8): y = +1, rows go back→front (z: -1→+1), cols left→right (x: -1→+1)
// R face (indices 9-17): x = +1, rows go top→bottom (y: +1→-1), cols front→back (z: +1→-1) ... wait
// Let's define the canonical unfold used in the plan:
//
//          U0 U1 U2
//          U3 U4 U5
//          U6 U7 U8
// L0L1L2  F0 F1 F2  R0 R1 R2  B0 B1 B2
// L3L4L5  F3 F4 F5  R3 R4 R5  B3 B4 B5
// L6L7L8  F6 F7 F8  R6 R7 R8  B6 B7 B8
//          D0 D1 D2
//          D3 D4 D5
//          D6 D7 D8
//
// U is viewed looking down from above.  Row 0 = back row (z=-1), row 2 = front row (z=+1).
// F is viewed looking from front.  Row 0 = top (y=+1), row 2 = bottom (y=-1).

const FACELET_MAP = [
  // U face (0-8) — y=+1, viewed from top
  { pos: [-1, 1, -1], dir: 'y+' }, // U0
  { pos: [0,  1, -1], dir: 'y+' }, // U1
  { pos: [1,  1, -1], dir: 'y+' }, // U2
  { pos: [-1, 1,  0], dir: 'y+' }, // U3
  { pos: [0,  1,  0], dir: 'y+' }, // U4 (center)
  { pos: [1,  1,  0], dir: 'y+' }, // U5
  { pos: [-1, 1,  1], dir: 'y+' }, // U6
  { pos: [0,  1,  1], dir: 'y+' }, // U7
  { pos: [1,  1,  1], dir: 'y+' }, // U8

  // R face (9-17) — x=+1, viewed from right
  { pos: [1,  1, -1], dir: 'x+' }, // R0
  { pos: [1,  1,  0], dir: 'x+' }, // R1
  { pos: [1,  1,  1], dir: 'x+' }, // R2
  { pos: [1,  0, -1], dir: 'x+' }, // R3
  { pos: [1,  0,  0], dir: 'x+' }, // R4 (center)
  { pos: [1,  0,  1], dir: 'x+' }, // R5
  { pos: [1, -1, -1], dir: 'x+' }, // R6
  { pos: [1, -1,  0], dir: 'x+' }, // R7
  { pos: [1, -1,  1], dir: 'x+' }, // R8

  // F face (18-26) — z=+1, viewed from front
  { pos: [-1,  1, 1], dir: 'z+' }, // F0
  { pos: [0,   1, 1], dir: 'z+' }, // F1
  { pos: [1,   1, 1], dir: 'z+' }, // F2
  { pos: [-1,  0, 1], dir: 'z+' }, // F3
  { pos: [0,   0, 1], dir: 'z+' }, // F4 (center)
  { pos: [1,   0, 1], dir: 'z+' }, // F5
  { pos: [-1, -1, 1], dir: 'z+' }, // F6
  { pos: [0,  -1, 1], dir: 'z+' }, // F7
  { pos: [1,  -1, 1], dir: 'z+' }, // F8

  // D face (27-35) — y=-1, viewed from bottom
  { pos: [-1, -1,  1], dir: 'y-' }, // D0
  { pos: [0,  -1,  1], dir: 'y-' }, // D1
  { pos: [1,  -1,  1], dir: 'y-' }, // D2
  { pos: [-1, -1,  0], dir: 'y-' }, // D3
  { pos: [0,  -1,  0], dir: 'y-' }, // D4 (center)
  { pos: [1,  -1,  0], dir: 'y-' }, // D5
  { pos: [-1, -1, -1], dir: 'y-' }, // D6
  { pos: [0,  -1, -1], dir: 'y-' }, // D7
  { pos: [1,  -1, -1], dir: 'y-' }, // D8

  // L face (36-44) — x=-1, viewed from left
  { pos: [-1,  1,  1], dir: 'x-' }, // L0
  { pos: [-1,  1,  0], dir: 'x-' }, // L1
  { pos: [-1,  1, -1], dir: 'x-' }, // L2
  { pos: [-1,  0,  1], dir: 'x-' }, // L3
  { pos: [-1,  0,  0], dir: 'x-' }, // L4 (center)
  { pos: [-1,  0, -1], dir: 'x-' }, // L5
  { pos: [-1, -1,  1], dir: 'x-' }, // L6
  { pos: [-1, -1,  0], dir: 'x-' }, // L7
  { pos: [-1, -1, -1], dir: 'x-' }, // L8

  // B face (45-53) — z=-1, viewed from back
  { pos: [1,   1, -1], dir: 'z-' }, // B0
  { pos: [0,   1, -1], dir: 'z-' }, // B1
  { pos: [-1,  1, -1], dir: 'z-' }, // B2
  { pos: [1,   0, -1], dir: 'z-' }, // B3
  { pos: [0,   0, -1], dir: 'z-' }, // B4 (center)
  { pos: [-1,  0, -1], dir: 'z-' }, // B5
  { pos: [1,  -1, -1], dir: 'z-' }, // B6
  { pos: [0,  -1, -1], dir: 'z-' }, // B7
  { pos: [-1, -1, -1], dir: 'z-' }, // B8
]

export default FACELET_MAP

/**
 * Build a lookup: "x,y,z" → { face→color } map from a 54-facelet state array.
 * Returns a Map<string, object> where object has keys like 'y+', 'x+', etc.
 */
export function buildCubieFaceColors(state) {
  const map = new Map()
  FACELET_MAP.forEach(({ pos, dir }, index) => {
    const key = pos.join(',')
    if (!map.has(key)) map.set(key, {})
    map.get(key)[dir] = state[index]
  })
  return map
}
