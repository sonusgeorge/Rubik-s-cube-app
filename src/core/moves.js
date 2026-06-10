/**
 * Facelet index layout (54 facelets, 9 per face):
 *
 *         U0 U1 U2
 *         U3 U4 U5   Face order: U=0-8, R=9-17, F=18-26,
 *         U6 U7 U8              D=27-35, L=36-44, B=45-53
 *
 *  L0 L1 L2  F0 F1 F2  R0 R1 R2  B0 B1 B2
 *  L3 L4 L5  F3 F4 F5  R3 R4 R5  B3 B4 B5
 *  L6 L7 L8  F6 F7 F8  R6 R7 R8  B6 B7 B8
 *
 *         D0 D1 D2
 *         D3 D4 D5
 *         D6 D7 D8
 *
 * Cycle notation: each array entry is one 4-cycle [a,b,c,d]
 * meaning: state[a]→state[b]→state[c]→state[d]→state[a]  (clockwise).
 *
 * These cycles are derived from FACELET_MAP (cubieMapper.js) and the same
 * rotation conventions the 3D animation uses (rotationMath.js), so the
 * logical state always matches what the animation shows. They are verified
 * against that geometric ground truth in moves.test.js.
 */

const MOVES = {
  // ── R ──  U→B→D→F on the x=+1 column
  R: [
    // R face cycle (CW)
    [9, 11, 17, 15],
    [10, 14, 16, 12],
    // Adjacent facelets
    [2, 51, 29, 20],
    [5, 48, 32, 23],
    [8, 45, 35, 26],
  ],

  // ── L ──  U→F→D→B on the x=-1 column
  L: [
    // L face cycle (CW when looking from left)
    [36, 38, 44, 42],
    [37, 41, 43, 39],
    // Adjacent facelets
    [0, 18, 27, 53],
    [3, 21, 30, 50],
    [6, 24, 33, 47],
  ],

  // ── U ──  R→F→L→B on the y=+1 row
  U: [
    // U face cycle (CW when looking from top)
    [0, 2, 8, 6],
    [1, 5, 7, 3],
    // Adjacent facelets
    [9, 18, 36, 45],
    [10, 19, 37, 46],
    [11, 20, 38, 47],
  ],

  // ── D ──  F→R→B→L on the y=-1 row
  D: [
    // D face cycle (CW when looking from bottom)
    [27, 29, 35, 33],
    [28, 32, 34, 30],
    // Adjacent facelets
    [24, 15, 51, 42],
    [25, 16, 52, 43],
    [26, 17, 53, 44],
  ],

  // ── F ──  U→R→D→L on the z=+1 slice
  F: [
    // F face cycle (CW when looking from front)
    [18, 20, 26, 24],
    [19, 23, 25, 21],
    // Adjacent facelets
    [6, 9, 29, 44],
    [7, 12, 28, 41],
    [8, 15, 27, 38],
  ],

  // ── B ──  U→L→D→R on the z=-1 slice
  B: [
    // B face cycle (CW when looking from back)
    [45, 47, 53, 51],
    [46, 50, 52, 48],
    // Adjacent facelets
    [0, 42, 35, 11],
    [1, 39, 34, 14],
    [2, 36, 33, 17],
  ],

  // ── Slice moves (middle layers, including centers) ──
  // M follows L's direction on the x=0 column: U→F→D→B
  M: [
    [1, 19, 28, 52],
    [4, 22, 31, 49],
    [7, 25, 34, 46],
  ],

  // E follows D's direction on the y=0 row: F→R→B→L
  E: [
    [21, 12, 48, 39],
    [22, 13, 49, 40],
    [23, 14, 50, 41],
  ],

  // S follows F's direction on the z=0 slice: U→R→D→L
  S: [
    [3, 10, 32, 43],
    [4, 13, 31, 40],
    [5, 16, 30, 37],
  ],
}

export default MOVES
