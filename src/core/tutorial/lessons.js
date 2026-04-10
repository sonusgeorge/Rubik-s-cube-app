/**
 * Lesson data for the beginner method tutorial.
 *
 * Structure:
 *   LESSONS[lessonId] = {
 *     id, title, moduleId, description,
 *     steps: [{ description, expectedMoves, hint, highlightFacelets }]
 *   }
 *
 * highlightFacelets: indices into the 54-facelet array to visually highlight.
 * expectedMoves: exact move sequence the user must perform to complete the step.
 *   Empty array = free exploration / demo (no validation).
 */

export const LESSONS = {
  // ── Module 0: Cube Basics ────────────────────────────────────────────────
  '0.1': {
    id: '0.1', moduleId: 0, title: 'Parts of the Cube',
    description: 'Learn about centers, edges, and corners.',
    steps: [
      {
        description: 'A Rubik\'s Cube has 3 types of pieces: 6 centers (1 color), 12 edges (2 colors), and 8 corners (3 colors). Rotate the cube to explore it.',
        expectedMoves: [],
        hint: 'Use your mouse to orbit the cube and look at all sides.',
        highlightFacelets: [4, 13, 22, 31, 40, 49], // all 6 centers
      },
    ],
  },
  '0.2': {
    id: '0.2', moduleId: 0, title: 'Color Scheme & Face Names',
    description: 'Learn which color is on which face.',
    steps: [
      {
        description: 'Each face has a name: U (Up/White), D (Down/Yellow), F (Front/Green), B (Back/Blue), R (Right/Red), L (Left/Orange). The center sticker defines each face\'s color — it never moves.',
        expectedMoves: [],
        hint: 'The center pieces always stay in place — they define each face\'s permanent color.',
        highlightFacelets: [4, 13, 22, 31, 40, 49],
      },
    ],
  },
  '0.3': {
    id: '0.3', moduleId: 0, title: 'Move Notation',
    description: 'Learn R, U, F and their primes.',
    steps: [
      {
        description: 'R means rotate the Right face clockwise. R\' (R prime) is counter-clockwise. R2 is a double turn (180°). Try pressing R now.',
        expectedMoves: ['R'],
        hint: 'Click the R button in the toolbar, or drag the right face of the cube downward.',
        highlightFacelets: [9,10,11,12,13,14,15,16,17], // R face
      },
      {
        description: 'Now try R\' to undo that move.',
        expectedMoves: ["R'"],
        hint: 'R\' is the reverse of R. The cube should return to its previous state.',
        highlightFacelets: [9,10,11,12,13,14,15,16,17],
      },
    ],
  },
  '0.4': {
    id: '0.4', moduleId: 0, title: 'Practice: R U R\' U\'',
    description: 'Practice the most common algorithm in cubing.',
    steps: [
      {
        description: 'Perform R U R\' U\' — known as the "sexy move". This is the most used sequence in beginner cubing.',
        expectedMoves: ['R', 'U', "R'", "U'"],
        hint: 'R → rotate right face CW. U → rotate top face CW. R\' → rotate right CCW. U\' → rotate top CCW.',
        highlightFacelets: [],
      },
    ],
  },

  // ── Module 1: White Cross ────────────────────────────────────────────────
  '1.1': {
    id: '1.1', moduleId: 1, title: 'What is the White Cross?',
    description: 'Understand the goal of the first step.',
    steps: [
      {
        description: 'The white cross means the 4 white edge pieces are on the U face, each aligned with its matching center color on the sides. The white center is already in place.',
        expectedMoves: [],
        hint: 'Look at the 4 white edge pieces: U1 (top), U3 (left), U5 (right), U7 (bottom) of the U face.',
        highlightFacelets: [1, 3, 5, 7, 10, 19, 37, 46], // U edges + adjacent side centers
      },
    ],
  },
  '1.2': {
    id: '1.2', moduleId: 1, title: 'Demo: Solving One Edge',
    description: 'Watch and learn how to get one white edge in place.',
    steps: [
      {
        description: 'Find a white edge piece. If it\'s on the bottom layer (D face), rotate the D face to bring it under its target, then do F2 to insert it. Watch the demo.',
        expectedMoves: [],
        hint: 'If the white edge is on the D face, turn D until it is directly below its matching center, then do F2.',
        highlightFacelets: [1, 10, 19, 46], // U-top edge + adjacent
      },
    ],
  },
  '1.3': {
    id: '1.3', moduleId: 1, title: 'Practice: White Cross',
    description: 'Solve the white cross with guidance.',
    steps: [
      {
        description: 'The cube has been scrambled with one edge out of place. Find the white-red edge and place it correctly on the U face with red aligned to the R center.',
        expectedMoves: [],
        hint: 'Look for the white-red edge piece. Bring it to the bottom layer, position it under the R face, then do R2.',
        highlightFacelets: [1, 3, 5, 7],
      },
    ],
  },

  // ── Module 2: First Layer Corners ───────────────────────────────────────
  '2.1': {
    id: '2.1', moduleId: 2, title: 'White Corners Concept',
    description: 'Understand how corner pieces work.',
    steps: [
      {
        description: 'White corners have 3 colors. Each must go in the spot where its 3 colors match the 3 adjacent face centers. Always position the corner above its target slot first.',
        expectedMoves: [],
        hint: 'Find the white-red-green corner. Its home is the URF slot (Up-Right-Front corner).',
        highlightFacelets: [0, 2, 6, 8], // U corners
      },
    ],
  },
  '2.2': {
    id: '2.2', moduleId: 2, title: 'Algorithm: R U R\' U\'',
    description: 'The "sexy move" inserts corners.',
    steps: [
      {
        description: 'When the white corner is above its slot (on the U face), repeat R U R\' U\' until the corner drops into place correctly. It takes 1–5 repetitions depending on orientation.',
        expectedMoves: ['R', 'U', "R'", "U'"],
        hint: 'Make sure the white corner is in the URF position of the top layer first. Then perform R U R\' U\'.',
        highlightFacelets: [2, 8, 18, 20], // URF corner area
      },
    ],
  },

  // ── Module 3: Second Layer ───────────────────────────────────────────────
  '3.1': {
    id: '3.1', moduleId: 3, title: 'Second Layer Edges',
    description: 'Learn which edges go in the middle layer.',
    steps: [
      {
        description: 'The 4 middle-layer edges have no yellow. Find them on the top layer (they\'ll have a non-yellow color on top), then use one of two algorithms to insert them.',
        expectedMoves: [],
        hint: 'Look for edge pieces that have neither white nor yellow. If they\'re on top, match the side color to the front center, then decide left or right insertion.',
        highlightFacelets: [10, 14, 16, 12, 19, 21, 23, 25, 37, 39, 41, 43, 46, 48, 50, 52],
      },
    ],
  },
  '3.2': {
    id: '3.2', moduleId: 3, title: 'Insert Right: U R U\' R\' U\' F\' U F',
    description: 'Algorithm for inserting an edge to the right.',
    steps: [
      {
        description: 'Position so the edge on U matches the front center. The second color points left on U. Perform: U R U\' R\' U\' F\' U F',
        expectedMoves: ['U', 'R', "U'", "R'", "U'", "F'", 'U', 'F'],
        hint: 'First align: front center = edge front color. The edge\'s other color should point LEFT. Then do U R U\' R\' U\' F\' U F.',
        highlightFacelets: [],
      },
    ],
  },
  '3.3': {
    id: '3.3', moduleId: 3, title: 'Insert Left: U\' L\' U L U F U\' F\'',
    description: 'Algorithm for inserting an edge to the left.',
    steps: [
      {
        description: 'Position so the edge on U matches the front center. The second color points right on U. Perform: U\' L\' U L U F U\' F\'',
        expectedMoves: ["U'", "L'", 'U', 'L', 'U', 'F', "U'", "F'"],
        hint: 'Same setup but the edge\'s other color points RIGHT. Then do U\' L\' U L U F U\' F\'.',
        highlightFacelets: [],
      },
    ],
  },

  // ── Module 4: Yellow Cross ───────────────────────────────────────────────
  '4.1': {
    id: '4.1', moduleId: 4, title: 'Yellow Cross (OLL)',
    description: 'Orient the yellow edges on top.',
    steps: [
      {
        description: 'Look at the U face. You\'ll see one of 4 patterns: a dot (no yellow edges), L-shape, line, or cross. Perform F R U R\' U\' F\' to advance to the next pattern.',
        expectedMoves: ['F', 'R', 'U', "R'", "U'", "F'"],
        hint: 'Apply F R U R\' U\' F\' once for line, twice for L-shape or dot (dot needs two orientations).',
        highlightFacelets: [1, 3, 5, 7], // U face edges
      },
    ],
  },

  // ── Module 5: Yellow Corners (OLL step 2) ────────────────────────────────
  '5.1': {
    id: '5.1', moduleId: 5, title: 'Orient Yellow Corners',
    description: 'Use the Sune algorithm to orient all yellow corners.',
    steps: [
      {
        description: 'You need all 4 top-layer corners showing yellow on top. Find a corner with yellow facing right, hold it in the URF position, and perform: R U R\' U R U2 R\'',
        expectedMoves: ['R', 'U', "R'", 'U', 'R', 'U2', "R'"],
        hint: 'Hold the cube so a "yellow-right" corner is at URF. Perform R U R\' U R U2 R\'. Repeat from different angles as needed.',
        highlightFacelets: [0, 2, 6, 8], // U corners
      },
    ],
  },

  // ── Module 6: Corner Permutation ────────────────────────────────────────
  '6.1': {
    id: '6.1', moduleId: 6, title: 'Position Yellow Corners',
    description: 'Get corners to their correct positions.',
    steps: [
      {
        description: 'Check if any corner is already in its correct position (colors match side faces, ignore yellow). Hold it in the URF spot and do: U R U\' L\' U R\' U\' L',
        expectedMoves: ['U', 'R', "U'", "L'", 'U', "R'", "U'", 'L'],
        hint: 'Find a corner already in the right place (or try from any position if none). Do U R U\' L\' U R\' U\' L once or twice.',
        highlightFacelets: [0, 2, 6, 8],
      },
    ],
  },

  // ── Module 7: Edge Permutation ───────────────────────────────────────────
  '7.1': {
    id: '7.1', moduleId: 7, title: 'Position Yellow Edges — SOLVE IT!',
    description: 'Cycle edges to their final positions and solve the cube.',
    steps: [
      {
        description: 'Find an edge already in its correct position. Hold it at the back. Perform Ua perm: R U\' R U R U R U\' R\' U\' R2 — this cycles the other 3 edges.',
        expectedMoves: ['R', "U'", 'R', 'U', 'R', 'U', 'R', 'U', "R'", "U'", 'R2'],
        hint: 'If one edge is correct, hold it at the BACK (B face) and apply the Ua perm. If none are correct, do it once first.',
        highlightFacelets: [1, 3, 5, 7],
      },
    ],
  },
}

/**
 * Module metadata for the sidebar.
 */
export const MODULES = [
  { id: 0, title: 'Cube Basics',               lessons: ['0.1', '0.2', '0.3', '0.4'] },
  { id: 1, title: 'The White Cross',           lessons: ['1.1', '1.2', '1.3'] },
  { id: 2, title: 'First Layer Corners',       lessons: ['2.1', '2.2'] },
  { id: 3, title: 'Second Layer',             lessons: ['3.1', '3.2', '3.3'] },
  { id: 4, title: 'Yellow Cross (OLL 1)',      lessons: ['4.1'] },
  { id: 5, title: 'Yellow Corners (OLL 2)',    lessons: ['5.1'] },
  { id: 6, title: 'Corner Permutation (PLL 1)',lessons: ['6.1'] },
  { id: 7, title: 'Edge Permutation (PLL 2)',  lessons: ['7.1'] },
]
