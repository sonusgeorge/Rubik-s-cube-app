# Interactive Tutorial Plan — "Guided Solve"

## Vision

The current tutorial teaches *concepts* (notation, piece types) with static
lesson text, but it can't teach someone to actually solve a cube, because the
lessons don't know anything about the cube in front of the user.

The new solver changes that. `getSolutionSteps(state)` (in
`src/core/solver/`) solves **the user's actual cube** stage by stage and
returns, for each of the 7 beginner-method stages, the exact moves that
complete it:

```js
getSolutionSteps(facelets) → [
  { id: 'cross',            name: 'White Cross',            moves: ['F2', 'D', 'R', ...] },
  { id: 'first-corners',    name: 'First Layer Corners',    moves: [...] },
  { id: 'second-layer',     name: 'Second Layer Edges',     moves: [...] },
  { id: 'yellow-cross',     name: 'Yellow Cross',           moves: [...] },
  { id: 'position-edges',   name: 'Position Yellow Edges',  moves: [...] },
  { id: 'position-corners', name: 'Position Yellow Corners',moves: [...] },
  { id: 'orient-corners',   name: 'Orient Yellow Corners',  moves: [...] },
]
```

Every stage also exposes an `isDone(state)` predicate (exported as `STAGES`),
so the UI always knows which stage the user's cube is in — no matter how they
got there.

**Guided Solve mode**: the user scrambles (or brings any mixed-up cube state),
and the app walks them through solving it — their real cube, move by move,
with explanations, hints, and demos. This is the thing a learner can actually
use: every solve of their own cube is the lesson.

## Core loop

```
scramble → [for each stage] →
    stage intro card (goal, what to look for)
  → next-move guidance (one move at a time)
  → user performs move (drag or keyboard — existing validateMove hook fires)
      ├─ correct → advance to next move, tick progress
      └─ different move → re-run solver from the new state (solver is <5ms),
                          guidance seamlessly continues from wherever they are
  → stage complete → celebrate, explain what was achieved
→ cube solved → stats (moves, time, hints used)
```

The "recompute on deviation" step is the key UX decision: the user can never
be *wrong*, they can only take a longer route. Wandering off-script (or
exploring) never breaks the tutorial, because the solver re-plans from any
state. A gentle "off the suggested path — recalculated" toast keeps them
oriented.

## What exists already (and gets reused)

| Existing piece | Role in Guided Solve |
|---|---|
| `tutorialStore.validateMove` — already called from `useCubeInteraction` on every move | The event source for advancing / re-planning |
| `expectedMoves` / `moveIndex` / `PracticeMode` progress chips | Render the current stage's move queue |
| `HintSystem` hint ladder (levels 1-4) | Level 1: stage goal · 2: which face to turn · 3: exact move · 4: auto-play it |
| `highlightedCubies` / `dimmedCubies` (now working) | Spotlight the pieces the current stage manipulates |
| `executeMove(move, speed)` queue | Demo playback ("watch this step") |
| `LessonSidebar` / `StepCard` layout | Becomes stage list + stage explanation panel |

## Implementation phases

### Phase 1 — Guided Solve MVP
*Goal: scramble → guided to solved, one move at a time.*

- `tutorialStore`: add a `mode: 'lessons' | 'guided'` and guided state:
  `stages` (from `getSolutionSteps`), `stageIndex`, `stageMoves`, `moveIndex`.
  - `startGuidedSolve()` — reads `cubeStore` facelets, computes steps, skips
    already-complete stages.
  - extend `validateMove(move)`: on expected move → `moveIndex++`; on any
    other move → recompute `getSolutionSteps(currentFacelets)` and reset
    indices (find first incomplete stage via `STAGES[i].isDone`).
- New `GuidedSolvePanel.jsx` (right panel, replaces `StepCard` in guided
  mode): stage name, plain-language goal, big "next move" badge (e.g. `R'`),
  progress `move 3 / 14 · stage 2 / 7`.
- Toolbar: "Guided Solve" entry point (replaces or sits next to "Learn").
- Highlight the face to turn: map next move's face letter to its 9 cubies via
  the existing highlight system.

### Phase 2 — Teaching content per stage
*Goal: user understands **why**, not just what.*

- Stage intro cards (one paragraph + diagram-ish highlight): shown when a
  stage begins; explain the goal and the trigger/algorithm the stage uses
  (e.g. second layer's "right insert: D' R' D R D F D' F'").
- Named-algorithm detection: when the upcoming moves match a known trigger
  (sexy move, Sune, Niklas, inserts — the solver only uses these), show the
  name and group the move chips visually so users learn *patterns*, not
  individual turns.
- "Watch" button per stage: auto-plays the remaining stage moves at slow
  speed (demo), then offers to reset to the pre-demo state so the user can
  try it themselves (snapshot facelets before demo; restore after).

### Phase 3 — Practice generator (replaces placeholder lessons)
*Goal: drills for a single stage.*

- `generatePracticeState(stageId)`: scramble randomly, run the solver through
  all stages *before* `stageId`, apply those moves — result is a cube that
  needs exactly that stage next. Instant, infinite, always-valid drills.
- Rebuild the lesson modules on this: "White Cross practice" = 5 generated
  cross-only solves with guidance dialed down (hints on request only).
- Track per-stage stats in `completedLessons` (already persisted): solves,
  average moves, hints used → sidebar progress becomes meaningful.

### Phase 4 — Polish
- 3D turn-direction arrow overlay on the face to rotate (small `<group>` of
  arrow meshes positioned via `FACE_AXIS`, shown when hint level ≥ 2).
- Keyboard shortcut card in guided mode (the fastest way to execute a
  suggested move is its key).
- Mobile layout for the guidance panel (bottom sheet instead of side panel).
- Optional: shorten solutions (the solver is modular — a Kociemba two-phase
  solver can replace `solve()` for the "just solve it" button while guided
  mode keeps the pedagogical layer-by-layer output).

## Effort estimate

| Phase | Size | Notes |
|---|---|---|
| 1 | ~1-2 days | Mostly store wiring + one panel component; solver API is ready |
| 2 | ~1-2 days | Content writing + trigger detection (string matching on move windows) |
| 3 | ~1 day | Generator is ~10 lines on top of the solver; rest is lesson data |
| 4 | ~1-2 days | Arrow meshes are the only 3D work |

## Risks / notes

- Solver runtime is negligible (<5ms/solve, verified by 350-scramble test
  suite), so recomputing on every deviation is fine.
- The solver's moves are face turns only (no slices), so guidance never asks
  for a move the drag UI can't perform.
- If the user pauses guided mode and free-plays, re-entry is trivial:
  recompute from current state, resume at the first incomplete stage.
