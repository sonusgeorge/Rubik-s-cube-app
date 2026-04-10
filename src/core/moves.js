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
 */

const MOVES = {
  // ── R ────────────────────────────────────────────────────
  R: [
    // R face cycle (CW)
    [9, 11, 17, 15],
    [10, 14, 16, 12],
    // Adjacent facelets
    [2, 20, 29, 47],
    [5, 23, 32, 50],
    [8, 26, 35, 53],
  ],

  // ── L ────────────────────────────────────────────────────
  L: [
    // L face cycle (CW when looking from left)
    [36, 38, 44, 42],
    [37, 41, 43, 39],
    // Adjacent facelets
    [0, 45, 27, 18],
    [3, 48, 30, 21],
    [6, 51, 33, 24],
  ],

  // ── U ────────────────────────────────────────────────────
  U: [
    // U face cycle (CW when looking from top)
    [0, 2, 8, 6],
    [1, 5, 7, 3],
    // Adjacent facelets
    [9, 18, 36, 45],
    [10, 19, 37, 46],
    [11, 20, 38, 47],
  ],

  // ── D ────────────────────────────────────────────────────
  D: [
    // D face cycle (CW when looking from bottom)
    [27, 29, 35, 33],
    [28, 32, 34, 30],
    // Adjacent facelets
    [15, 44, 24, 53],
    [16, 43, 25, 52],
    [17, 42, 26, 51],
  ],

  // ── F ────────────────────────────────────────────────────
  F: [
    // F face cycle (CW when looking from front)
    [18, 20, 26, 24],
    [19, 23, 25, 21],
    // Adjacent facelets
    [6, 9, 29, 44],
    [7, 12, 28, 41],
    [8, 15, 27, 38],
  ],

  // ── B ────────────────────────────────────────────────────
  B: [
    // B face cycle (CW when looking from back)
    [45, 47, 53, 51],
    [46, 50, 52, 48],
    // Adjacent facelets
    [2, 36, 33, 11],
    [1, 39, 34, 14],
    [0, 42, 35, 17],
  ],
}

export default MOVES
