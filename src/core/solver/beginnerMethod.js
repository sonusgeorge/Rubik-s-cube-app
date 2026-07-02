import { applyMove, isSolved } from '../CubeState.js'

/**
 * Beginner method (layer-by-layer) solver.
 *
 * Solves any valid cube state in 7 stages:
 *   1. Cross on U        (the "white cross")
 *   2. First layer corners
 *   3. Second layer edges
 *   4. Cross on D        (the "yellow cross")
 *   5. Position D-layer edges
 *   6. Position D-layer corners
 *   7. Orient D-layer corners
 *
 * Everything is solved *relative to the centers* (targets are defined by
 * center colors, not absolute face letters), so states scrambled with slice
 * moves (M/E/S), which move centers, solve correctly too.
 *
 * All algorithms are written for the F face and remapped to other side faces
 * by the cyclic substitution F→R→B→L (equivalent to conjugating by a
 * whole-cube y-rotation, which preserves the U/D structure the stages rely
 * on). The output uses face moves only (U D F B R L with ' / 2 suffixes).
 */

// ── Face geometry ───────────────────────────────────────────────────────────

const SIDE_FACES = ['F', 'R', 'B', 'L']
const RIGHT = { F: 'R', R: 'B', B: 'L', L: 'F' }
const LEFT = { F: 'L', L: 'B', B: 'R', R: 'F' }
const OPPOSITE = { F: 'B', B: 'F', R: 'L', L: 'R' }
const CENTER = { U: 4, R: 13, F: 22, D: 31, L: 40, B: 49 }

/**
 * Edge slots. `face` is the slot's reference side face:
 *  - U/D slots: the side face the slot touches (`side` = sticker on it,
 *    `u`/`d` = sticker on the U/D face).
 *  - M slots: the slot is (face, RIGHT[face]); `a` = sticker on `face`,
 *    `b` = sticker on RIGHT[face].
 */
const EDGE_SLOTS = [
  { name: 'UF', layer: 'U', face: 'F', u: 7, side: 19 },
  { name: 'UR', layer: 'U', face: 'R', u: 5, side: 10 },
  { name: 'UB', layer: 'U', face: 'B', u: 1, side: 46 },
  { name: 'UL', layer: 'U', face: 'L', u: 3, side: 37 },
  { name: 'FR', layer: 'M', face: 'F', a: 23, b: 12 },
  { name: 'RB', layer: 'M', face: 'R', a: 14, b: 48 },
  { name: 'BL', layer: 'M', face: 'B', a: 50, b: 39 },
  { name: 'LF', layer: 'M', face: 'L', a: 41, b: 21 },
  { name: 'DF', layer: 'D', face: 'F', d: 28, side: 25 },
  { name: 'DR', layer: 'D', face: 'R', d: 32, side: 16 },
  { name: 'DB', layer: 'D', face: 'B', d: 34, side: 52 },
  { name: 'DL', layer: 'D', face: 'L', d: 30, side: 43 },
]

/**
 * Corner slots. Slot for side face X is (U/D, X, RIGHT[X]).
 * `u`/`d` = sticker on U/D, `x` = sticker on X, `rx` = sticker on RIGHT[X].
 */
const CORNER_SLOTS = [
  { name: 'UFR', layer: 'U', face: 'F', u: 8, x: 20, rx: 9 },
  { name: 'URB', layer: 'U', face: 'R', u: 2, x: 11, rx: 45 },
  { name: 'UBL', layer: 'U', face: 'B', u: 0, x: 47, rx: 36 },
  { name: 'ULF', layer: 'U', face: 'L', u: 6, x: 38, rx: 18 },
  { name: 'DFR', layer: 'D', face: 'F', d: 29, x: 26, rx: 15 },
  { name: 'DRB', layer: 'D', face: 'R', d: 35, x: 17, rx: 51 },
  { name: 'DBL', layer: 'D', face: 'B', d: 33, x: 53, rx: 42 },
  { name: 'DLF', layer: 'D', face: 'L', d: 27, x: 44, rx: 24 },
]

// ── Piece lookup ────────────────────────────────────────────────────────────

function edgeStickerIndices(slot) {
  return slot.layer === 'M' ? [slot.a, slot.b] : [slot.layer === 'U' ? slot.u : slot.d, slot.side]
}

function cornerStickerIndices(slot) {
  return [slot.layer === 'U' ? slot.u : slot.d, slot.x, slot.rx]
}

function findEdgeSlot(state, colors) {
  const want = [...colors].sort().join('')
  for (const slot of EDGE_SLOTS) {
    const have = edgeStickerIndices(slot).map((i) => state[i]).sort().join('')
    if (have === want) return slot
  }
  throw new Error(`Solver: edge {${colors.join(',')}} not found — invalid state`)
}

function findCornerSlot(state, colors) {
  const want = [...colors].sort().join('')
  for (const slot of CORNER_SLOTS) {
    const have = cornerStickerIndices(slot).map((i) => state[i]).sort().join('')
    if (have === want) return slot
  }
  throw new Error(`Solver: corner {${colors.join(',')}} not found — invalid state`)
}

/** Side face whose center currently shows `color`. */
function faceOfColor(state, color) {
  for (const X of SIDE_FACES) {
    if (state[CENTER[X]] === color) return X
  }
  throw new Error(`Solver: no side center with color ${color}`)
}

// ── Algorithm remapping ─────────────────────────────────────────────────────

/**
 * Remap an algorithm written for the F face onto side face X
 * (F↦X, R↦RIGHT[X], B↦OPPOSITE[X], L↦LEFT[X]; U/D unchanged).
 */
function remapAlg(tokens, X) {
  const map = { U: 'U', D: 'D', F: X, R: RIGHT[X], B: OPPOSITE[X], L: LEFT[X] }
  return tokens.map((t) => map[t[0]] + t.slice(1))
}

// ── Solve context ───────────────────────────────────────────────────────────

function makeCtx(state) {
  return {
    state: [...state],
    moves: [],
    /** Apply an algorithm, optionally remapped from F onto side face X. */
    run(tokens, X) {
      const seq = X ? remapAlg(tokens, X) : tokens
      for (const move of seq) {
        this.state = applyMove(this.state, move)
        this.moves.push(move)
      }
    },
  }
}

/** Turn D until `pred()` holds (at most 3 turns). */
function rotateDUntil(ctx, pred, stageName) {
  for (let i = 0; i < 4; i++) {
    if (pred()) return
    ctx.run(['D'])
  }
  throw new Error(`Solver stage failed (D alignment): ${stageName}`)
}

/**
 * Breadth-first search over macro move sequences until `isGoal` holds.
 * Used for the last-layer stages, where a small fixed set of algorithms
 * (remapped to the four side faces) provably reaches the goal in a few
 * applications — BFS finds the shortest combination without case tables.
 */
function bfsSolve(ctx, macros, isGoal, maxDepth, stageName) {
  if (isGoal(ctx.state)) return
  let frontier = [{ state: ctx.state, path: [] }]
  const seen = new Set([ctx.state.join('')])
  for (let depth = 0; depth < maxDepth; depth++) {
    const next = []
    for (const node of frontier) {
      for (const macro of macros) {
        let s = node.state
        for (const move of macro) s = applyMove(s, move)
        const key = s.join('')
        if (seen.has(key)) continue
        seen.add(key)
        const path = [...node.path, macro]
        if (isGoal(s)) {
          for (const m of path) ctx.run(m)
          return
        }
        next.push({ state: s, path })
      }
    }
    frontier = next
  }
  throw new Error(`Solver stage failed: ${stageName}`)
}

// ── Stage predicates ────────────────────────────────────────────────────────

function crossEdgeSolved(state, X) {
  const slot = EDGE_SLOTS.find((s) => s.name === 'U' + X)
  return state[slot.u] === state[CENTER.U] && state[slot.side] === state[CENTER[X]]
}

function crossSolved(state) {
  return SIDE_FACES.every((X) => crossEdgeSolved(state, X))
}

function cornerSolved(state, X) {
  const slot = CORNER_SLOTS.find((s) => s.layer === 'U' && s.face === X)
  return (
    state[slot.u] === state[CENTER.U] &&
    state[slot.x] === state[CENTER[X]] &&
    state[slot.rx] === state[CENTER[RIGHT[X]]]
  )
}

function firstLayerSolved(state) {
  return crossSolved(state) && SIDE_FACES.every((X) => cornerSolved(state, X))
}

function middleEdgeSolved(state, A) {
  const slot = EDGE_SLOTS.find((s) => s.layer === 'M' && s.face === A)
  return state[slot.a] === state[CENTER[A]] && state[slot.b] === state[CENTER[RIGHT[A]]]
}

function secondLayerSolved(state) {
  return firstLayerSolved(state) && SIDE_FACES.every((A) => middleEdgeSolved(state, A))
}

function yellowCross(state) {
  const Y = state[CENTER.D]
  return [28, 30, 32, 34].every((i) => state[i] === Y)
}

function llEdgesDone(state) {
  return (
    yellowCross(state) &&
    EDGE_SLOTS.filter((s) => s.layer === 'D').every(
      (s) => state[s.side] === state[CENTER[s.face]]
    )
  )
}

function llCornersPositioned(state) {
  const Y = state[CENTER.D]
  return CORNER_SLOTS.filter((s) => s.layer === 'D').every((slot) => {
    const have = cornerStickerIndices(slot).map((i) => state[i]).sort().join('')
    const want = [Y, state[CENTER[slot.face]], state[CENTER[RIGHT[slot.face]]]].sort().join('')
    return have === want
  })
}

// ── Stage 1: cross on U ─────────────────────────────────────────────────────

function solveCross(ctx) {
  const W = ctx.state[CENTER.U]
  for (const X of SIDE_FACES) {
    for (let guard = 0; guard < 6 && !crossEdgeSolved(ctx.state, X); guard++) {
      const colors = [W, ctx.state[CENTER[X]]]
      const slot = findEdgeSlot(ctx.state, colors)
      if (slot.layer === 'U') {
        // Wrong U slot, or right slot but flipped — drop it to the D layer.
        ctx.run([slot.face + '2'])
      } else if (slot.layer === 'M') {
        // Extract from the middle layer to the D layer without touching
        // solved cross edges (R' pulls it down, D moves it clear, R restores).
        ctx.run(["R'", 'D', 'R'], slot.face)
      } else {
        // In the D layer: bring it under its target face, then insert.
        rotateDUntil(ctx, () => findEdgeSlot(ctx.state, colors).name === 'D' + X, 'cross')
        const dSlot = findEdgeSlot(ctx.state, colors)
        if (ctx.state[dSlot.d] === W) {
          ctx.run([X + '2'])
        } else {
          // Flipped edge (cross color faces sideways).
          ctx.run(['D', 'R', "F'", "R'"], X)
        }
      }
    }
    if (!crossEdgeSolved(ctx.state, X)) throw new Error('Solver stage failed: cross')
  }
}

// ── Stage 2: first layer corners ────────────────────────────────────────────

function solveFirstCorners(ctx) {
  const W = ctx.state[CENTER.U]
  for (const X of SIDE_FACES) {
    const colors = [W, ctx.state[CENTER[X]], ctx.state[CENTER[RIGHT[X]]]]
    for (let guard = 0; guard < 8 && !cornerSolved(ctx.state, X); guard++) {
      const slot = findCornerSlot(ctx.state, colors)
      if (slot.layer === 'U') {
        // Extract a wrong/twisted corner from the U layer to the D layer.
        ctx.run(["R'", "D'", 'R'], slot.face)
      } else {
        // Bring it directly under its target slot, then repeat the
        // insertion trigger until it seats correctly (≤ 5 repetitions).
        rotateDUntil(
          ctx,
          () => findCornerSlot(ctx.state, colors).name === 'D' + X + RIGHT[X],
          'first corners'
        )
        for (let i = 0; i < 8 && !cornerSolved(ctx.state, X); i++) {
          ctx.run(["R'", "D'", 'R', 'D'], X)
        }
      }
    }
    if (!cornerSolved(ctx.state, X)) throw new Error('Solver stage failed: first corners')
  }
}

// ── Stage 3: second layer edges ─────────────────────────────────────────────

const INSERT_RIGHT = ["D'", "R'", 'D', 'R', 'D', 'F', "D'", "F'"]
const INSERT_LEFT = ['D', 'L', "D'", "L'", "D'", "F'", 'D', 'F']

function solveSecondLayer(ctx) {
  for (const A of SIDE_FACES) {
    const colors = [ctx.state[CENTER[A]], ctx.state[CENTER[RIGHT[A]]]]
    for (let guard = 0; guard < 6 && !middleEdgeSolved(ctx.state, A); guard++) {
      const slot = findEdgeSlot(ctx.state, colors)
      if (slot.layer === 'M') {
        // Wrong slot or flipped in place — eject it to the D layer by
        // inserting whatever sits below into its slot.
        ctx.run(INSERT_RIGHT, slot.face)
        continue
      }
      // In the D layer: line its side sticker up with the matching center.
      const targetFace = faceOfColor(ctx.state, ctx.state[slot.side])
      rotateDUntil(
        ctx,
        () => {
          const s = findEdgeSlot(ctx.state, colors)
          return s.layer === 'D' && s.face === targetFace
        },
        'second layer'
      )
      const aligned = findEdgeSlot(ctx.state, colors)
      const bottomFace = faceOfColor(ctx.state, ctx.state[aligned.d])
      if (bottomFace === RIGHT[targetFace]) ctx.run(INSERT_RIGHT, targetFace)
      else ctx.run(INSERT_LEFT, targetFace)
    }
    if (!middleEdgeSolved(ctx.state, A)) throw new Error('Solver stage failed: second layer')
  }
}

// ── Stages 4-6: last layer via small BFS over known algorithms ──────────────

// Orients D-layer edges (mirror of F R U R' U' F').
const OLL_EDGE = ["F'", "R'", "D'", 'R', 'D', 'F']
// Cycles three D-layer edges, preserving their orientation (mirrored Sune).
const SUNE = ["R'", "D'", 'R', "D'", "R'", 'D2', 'R']
// Cycles three D-layer corners in place (mirrored Niklas).
const NIKLAS = ["D'", "R'", 'D', 'L', "D'", 'R', 'D', "L'"]

function solveYellowCross(ctx) {
  bfsSolve(
    ctx,
    SIDE_FACES.map((X) => remapAlg(OLL_EDGE, X)),
    yellowCross,
    4,
    'yellow cross'
  )
}

function solveLLEdges(ctx) {
  bfsSolve(
    ctx,
    [['D'], ["D'"], ['D2'], ...SIDE_FACES.map((X) => remapAlg(SUNE, X))],
    llEdgesDone,
    5,
    'position last layer edges'
  )
}

function solveLLCornersPosition(ctx) {
  bfsSolve(
    ctx,
    SIDE_FACES.map((X) => remapAlg(NIKLAS, X)),
    (s) => llEdgesDone(s) && llCornersPositioned(s),
    4,
    'position last layer corners'
  )
}

// ── Stage 7: orient last layer corners ──────────────────────────────────────

function solveLLCornersOrient(ctx) {
  // Classic trick: twist the DFR corner in place with repeated
  // (R U R' U') pairs, then turn D to bring the next corner in.
  // The upper layers look scrambled mid-stage but restore once every
  // corner is oriented and D is realigned.
  for (let k = 0; k < 4; k++) {
    let guard = 0
    while (ctx.state[29] !== ctx.state[CENTER.D]) {
      ctx.run(['R', 'U', "R'", "U'"])
      if (++guard > 12) throw new Error('Solver stage failed: orient last layer corners')
    }
    ctx.run(['D'])
  }
  let guard = 0
  while (!isSolved(ctx.state) && guard < 4) {
    ctx.run(['D'])
    guard++
  }
  if (!isSolved(ctx.state)) throw new Error('Solver failed: cube not solved after final stage')
}

// ── Public API ──────────────────────────────────────────────────────────────

export const STAGES = [
  {
    id: 'cross',
    name: 'White Cross',
    description: 'Place the four cross edges on the top face, each aligned with its side center.',
    solve: solveCross,
    isDone: crossSolved,
  },
  {
    id: 'first-corners',
    name: 'First Layer Corners',
    description: 'Insert the four top-layer corners to complete the first layer.',
    solve: solveFirstCorners,
    isDone: firstLayerSolved,
  },
  {
    id: 'second-layer',
    name: 'Second Layer Edges',
    description: 'Insert the four middle-layer edges using the left/right insertion algorithms.',
    solve: solveSecondLayer,
    isDone: secondLayerSolved,
  },
  {
    id: 'yellow-cross',
    name: 'Yellow Cross',
    description: 'Orient the bottom-layer edges to form a cross on the last face.',
    solve: solveYellowCross,
    isDone: (s) => secondLayerSolved(s) && yellowCross(s),
  },
  {
    id: 'position-edges',
    name: 'Position Yellow Edges',
    description: 'Cycle the last-layer edges until each matches its side center.',
    solve: solveLLEdges,
    isDone: (s) => secondLayerSolved(s) && llEdgesDone(s),
  },
  {
    id: 'position-corners',
    name: 'Position Yellow Corners',
    description: 'Cycle the last-layer corners into their correct slots (ignoring twist).',
    solve: solveLLCornersPosition,
    isDone: (s) => secondLayerSolved(s) && llEdgesDone(s) && llCornersPositioned(s),
  },
  {
    id: 'orient-corners',
    name: 'Orient Yellow Corners',
    description: 'Twist each last-layer corner in place to finish the cube.',
    solve: solveLLCornersOrient,
    isDone: isSolved,
  },
]

/**
 * Solve a state stage by stage.
 * Returns [{ id, name, description, moves }] — one entry per stage
 * (moves may be empty if a stage was already complete).
 * Throws if the state is invalid/unsolvable.
 */
export function getSolutionSteps(state) {
  const ctx = makeCtx(state)
  const steps = []
  for (const stage of STAGES) {
    const before = ctx.moves.length
    stage.solve(ctx)
    steps.push({
      id: stage.id,
      name: stage.name,
      description: stage.description,
      moves: ctx.moves.slice(before),
    })
  }
  if (!isSolved(ctx.state)) throw new Error('Solver failed: cube not solved')
  return steps
}

/**
 * Solve a state with the beginner method.
 * Returns a flat move array (empty if already solved).
 */
export function solveBeginnerMethod(state) {
  if (isSolved(state)) return []
  return getSolutionSteps(state).flatMap((step) => step.moves)
}

/**
 * Apply a sequence of moves (string array) to a state, return final state.
 */
export function applySequence(state, moves) {
  return moves.reduce((s, move) => applyMove(s, move), state)
}
