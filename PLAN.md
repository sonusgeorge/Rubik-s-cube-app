# Rubik's Cube — 3D Interactive Web App

## Context

The user has provided a detailed architectural plan for a browser-based 3D Rubik's Cube app. The repository is a completely blank slate (only a `.git` directory exists). This plan translates their design document into an actionable, phased implementation roadmap.

The goal is to build a photorealistic, fully interactive 3D Rubik's Cube in three phases:
- **Phase 1**: Static 3D cube with orbit/zoom controls
- **Phase 2**: Full interactivity (face rotations, scramble, solve, undo/redo)
- **Phase 3**: Tutorial/learn mode (CFOP beginner method, step-by-step guidance)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| 3D Engine | Three.js + React Three Fiber (`@react-three/fiber`) |
| 3D Helpers | `@react-three/drei` (OrbitControls, RoundedBox, Environment, ContactShadows) |
| Animation | GSAP 3 |
| State | Zustand |
| Styling | Tailwind CSS 4 |
| Post-processing | `@react-three/postprocessing` |
| Icons | Lucide React |
| Testing | Vitest + React Testing Library |
| Package manager | pnpm |

---

## Project Structure (target)

```
rubiks-cube/
├── public/
│   ├── textures/        # sticker-normal.png, plastic-roughness.png, env-studio.hdr
│   └── sounds/          # rotate-click.mp3, snap.mp3
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── components/
│   │   ├── canvas/      # CubeScene, RubiksCube, Cubie, StickerFace, RotationGroup,
│   │   │                #   CubeControls, GhostLayer, GroundPlane
│   │   ├── ui/          # Toolbar, MoveHistory, Timer, ColorPicker, SettingsPanel,
│   │   │                #   NotationGuide
│   │   └── tutorial/    # TutorialOverlay, LessonSidebar, StepCard, AlgorithmDisplay,
│   │                    #   PracticeMode, HintSystem, ProgressTracker
│   ├── core/
│   │   ├── CubeState.js / CubeState.test.js
│   │   ├── moves.js
│   │   ├── notation.js
│   │   ├── scrambler.js
│   │   ├── solver/      # index.js, kociemba.js, beginnerMethod.js,
│   │   │                #   crossSolver, cornerSolver, secondLayerSolver,
│   │   │                #   ollSolver, pllSolver, moveTable.js
│   │   ├── cubieMapper.js
│   │   ├── rotationMath.js
│   │   └── validation.js
│   ├── store/
│   │   ├── cubeStore.js
│   │   ├── uiStore.js
│   │   └── tutorialStore.js
│   ├── hooks/
│   │   ├── useRotation.js
│   │   ├── useDragDetection.js
│   │   ├── useCubeInteraction.js
│   │   ├── useTimer.js
│   │   ├── useSound.js
│   │   └── useTutorialValidation.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── colors.js
│   │   ├── easing.js
│   │   └── helpers.js
│   └── styles/
│       ├── index.css
│       └── tutorial.css
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## Implementation Plan

### Step 0 — Project Scaffold

**Files to create:** `package.json`, `vite.config.js`, `tailwind.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`, `src/styles/index.css`, `.gitignore`, `.eslintrc.cjs`, `.prettierrc`

**Key dependencies to install:**
```
react react-dom
@react-three/fiber @react-three/drei three
gsap
zustand
tailwindcss@4
@react-three/postprocessing
lucide-react
vitest @testing-library/react @testing-library/user-event
pnpm (package manager)
```

---

### Step 1 — Core Cube State Logic (`src/core/`)

**`CubeState.js`**
- 54-facelet array (`U`=0–8, `R`=9–17, `F`=18–26, `D`=27–35, `L`=36–44, `B`=45–53)
- Solved-state initializer
- `applyMove(state, moveName)` using permutation cycles

**`moves.js`**
- Define all 18 moves (R, L, U, D, F, B + primes + doubles) as facelet permutation arrays
- R example permutation: face cycle `[9,11,17,15, 10,14,16,12]` + adjacent `[[2,20,29,47],[5,23,32,50],[8,26,35,53]]`

**`notation.js`**
- Parse Singmaster notation string → array of `{face, direction, angle}` objects
- Support: `R`, `R'`, `R2`, `M`, `E`, `S`, `x`, `y`, `z`

**`cubieMapper.js`**
- Map grid position `(x,y,z) ∈ {-1,0,1}³` → which facelets are visible + their colors
- Reverse map: facelet index → cubie grid position + face direction

**`rotationMath.js`**
- Quaternion math for 90° rotations
- `getRotationAxis(face)` → Three.js `Vector3`
- `updateCubiePositions(cubies, face, direction)` after rotation

**`validation.js`**
- Check if a 54-facelet state is a valid (solvable) Rubik's Cube state

**`CubeState.test.js`**
- Unit tests: applying all 18 moves, solved-state identity, inverse moves cancel

---

### Step 2 — Phase 1: 3D Rendering

**`src/utils/constants.js`**
```js
CUBIE_SIZE = 1.0
CUBIE_GAP = 0.04
CORNER_RADIUS = 0.06
STICKER_SIZE = 0.85
STICKER_OFFSET = 0.52   // slightly proud of face
```

**`src/utils/colors.js`**
```js
U: '#FFFFFF', D: '#FFD500', F: '#009B48',
B: '#0046AD', R: '#B71234', L: '#FF5800', X: '#1a1a1a'
```

**`CubeScene.jsx`**
- R3F `<Canvas>` with `<PerspectiveCamera position={[4,3,4]} fov={45} />`
- Lighting: Key (1.2), Fill (0.4), Rim (0.3), Ambient (0.15)
- `<Environment>` with studio HDRI
- `<OrbitControls enableDamping dampingFactor={0.08} minDistance={4} maxDistance={12} enablePan={false} />`

**`RubiksCube.jsx`**
- Loops over 27 cubie positions (x,y,z ∈ {-1,0,1})
- Renders `<Cubie>` at `position = [x*(SIZE+GAP), y*(SIZE+GAP), z*(SIZE+GAP)]`

**`Cubie.jsx`**
- `<RoundedBox args={[1,1,1]} radius={0.06} smoothness={4}>` with black plastic `MeshPhysicalMaterial`
- Renders up to 3 `<StickerFace>` children (only for outer-facing faces)

**`StickerFace.jsx`**
- `<mesh position={[0.52,0,0]} rotation={[0,π/2,0]}>` (adjusted per face direction)
- `<planeGeometry args={[0.85,0.85]} />`
- `MeshPhysicalMaterial` with `roughness:0.25, clearcoat:0.6`

**`GroundPlane.jsx`**
- `<ContactShadows position={[0,-1.65,0]} opacity={0.4} blur={2.5} />`
- Optional reflective floor plane

**Phase 1 acceptance:** Cube renders, orbits 360°, 60fps, correct sticker colors, visible gaps, raised stickers, soft shadows.

---

### Step 3 — Phase 2: Interactivity

**`RotationGroup.jsx`**
- Temporary THREE.Group used during animation
- Re-parents 9 cubies of selected layer, animates rotation, then re-parents back

**`useRotation.js`**
```js
animateRotation(group, axis, angle, duration=0.3) // GSAP power2.out easing
// Durations: normal=0.3s, fast=0.12s(scramble), slow=0.6s(tutorial), instant=0s
```

**`useDragDetection.js`**
- `onPointerDown`: raycast → record hit cubie, face normal, mouse pos
- `onPointerMove`: compute drag delta → cross(faceNormal, dragDir) → rotation axis → determine face layer
- Layer from cubie position along rotation axis: `+1`=outer, `0`=middle, `-1`=opposite
- `onPointerUp`: execute move or snap to nearest 90°

**`CubeControls.jsx`**
- Wires pointer events on the cube to `useDragDetection` and `useRotation`
- Disables OrbitControls during face rotation drag

**`GhostLayer.jsx`**
- Semi-transparent highlight showing selected layer during drag

**`src/store/cubeStore.js`** (Zustand)
```js
{
  facelets: SOLVED_STATE,          // 54-element array
  moveHistory: [],                  // [{move, timestamp}, ...]
  redoStack: [],
  isAnimating: false,
  isSolved: true,
  applyMove(move),
  undo(), redo(),
  scramble(),
  solve(),                          // run Kociemba, returns move sequence
  reset(),
  setAnimating(v),
  checkSolved(),
}
```

**`src/store/uiStore.js`** (Zustand)
```js
{
  animationSpeed: 'normal',        // 'slow' | 'normal' | 'fast'
  soundEnabled: true,
  autoSolve: false,
  showNotationGuide: false,
}
```

**`scrambler.js`**
- 20–25 random moves, WCA constraints (no consecutive same-face, no 3 parallel-face moves)

**`solver/beginnerMethod.js`**
- Layer-by-layer: white cross → white corners → second layer → OLL → PLL

**`solver/kociemba.js`**
- Two-phase Kociemba with precomputed pruning tables (~500KB JSON, lazy-loaded / web worker)

**UI components:**
- `Toolbar.jsx`: `[Undo] [Redo] [Scramble] [Solve] [Reset]`
- `MoveHistory.jsx`: Scrollable horizontal ribbon; undo highlights past current position
- `Timer.jsx`: 15s WCA inspection countdown → solve timer (MM:SS.ms); start: spacebar hold+release or tap; stop: any key/tap; best time in localStorage
- `SettingsPanel.jsx`: Speed, sound, theme toggles
- `NotationGuide.jsx`: Quick-reference R/U/F notation table

---

### Step 4 — Phase 3: Tutorial Mode

**`src/store/tutorialStore.js`** (Zustand)
```js
{
  isActive: false,
  currentLesson: null,             // e.g., 'white-cross'
  currentStep: 0,
  progress: {},                    // persisted to localStorage
  expectedMoves: [],
  startLesson(lessonId),
  advanceStep(),
  validateMove(moveName),          // returns pass/fail/hint
}
```

**Lesson data structure:**
```js
{
  id: 'white-cross',
  title: 'Step 1: White Cross',
  steps: [
    { description: '...', expectedMoves: ['F', 'U', 'R', ...], hint: '...', highlightFacelets: [2,5,...] }
  ]
}
```

**`useTutorialValidation.js`**
- Intercepts every move while tutorial is active
- Compares against `expectedMoves[currentStep]`
- Triggers hint system on wrong move

**`src/store/tutorialStore.js`** (Zustand)
```js
{
  currentModule, currentLesson, currentStep,
  lessonState: 'INTRO|DEMO|PRACTICE|CHALLENGE|COMPLETE',
  expectedMoves: [],         // e.g. ['R','U',"R'","U'"]
  expectedCubeState: [],
  moveIndex: 0,
  completedLessons: [],      // persisted to localStorage
  bestTimes: {},
  hintsUsed: 0,
  hintLevel: 0,              // 0=none, 1=piece, 2=face, 3=exact move, 4=auto-demo
  startLesson(id), advanceStep(), validateMove(moveName),
}
```

**3D highlighting (in `Cubie.jsx`):**
```jsx
<meshPhysicalMaterial
  emissive={isHighlighted ? '#FFD700' : '#000000'}
  emissiveIntensity={isHighlighted ? 0.4 : 0}
  opacity={isDimmed ? 0.3 : 1.0}
  transparent={isDimmed}
/>
```
Modes: piece glow, face outline, ghost target position, rotation-direction arrows, dim-others (0.3 opacity)

**Tutorial UI components:**
- `TutorialOverlay.jsx`: Full-screen wrapper with lesson content
- `LessonSidebar.jsx`: Module/lesson list (8 modules, 30+ lessons) + progress indicators
- `StepCard.jsx`: Current step text + highlighted facelets in 3D
- `AlgorithmDisplay.jsx`: Tappable move chips synced to cube animation; "Play all"; finger-trick tips
- `PracticeMode.jsx`: Cube set to lesson state; validates exact sequence; checkmarks per move; shake on wrong; "Show Me" auto-animates
- `HintSystem.jsx`: 5 levels — 0=none, 1=piece ID, 2=target face, 3=exact move, 4=auto-demonstrate
- `ProgressTracker.jsx`: localStorage stats (totalMoves, totalSolves, bestTime, streakDays, lastPractice)

---

## Key Design Decisions

1. **Facelet permutation model** — The cube state is a flat 54-element array. Moves are defined as index-permutation cycles. This is simple, fast, and compatible with Kociemba.

2. **Re-parenting rotation pattern** — During a face turn, cubies are moved into a temporary `THREE.Group` which is rotated, then snapped back. This avoids floating-point drift that accumulates with direct rotation on each cubie.

3. **Zustand over Redux** — Minimal boilerplate, direct mutations via Immer-style selectors. Cube state (54 facelets + history) is the only global state needed.

4. **GSAP for animation** — More control over easing curves than CSS transitions; `power2.out` gives a natural snap feel.

5. **Kociemba in a Web Worker** — Pruning tables are ~500KB; computation can take 50–200ms. Run solver off main thread to avoid UI freezes.

---

## Critical Files (ordered by dependency)

1. `src/utils/constants.js` — dimensions, easing curves
2. `src/utils/colors.js` — official Rubik's color hex values
3. `src/core/CubeState.js` — facelet array, solved state
4. `src/core/moves.js` — 18 move permutations
5. `src/core/cubieMapper.js` — facelet ↔ 3D position mapping
6. `src/core/rotationMath.js` — axis/quaternion math
7. `src/store/cubeStore.js` — Zustand cube state
8. `src/components/canvas/Cubie.jsx` — single cubie render
9. `src/components/canvas/RubiksCube.jsx` — 27 cubie assembly
10. `src/components/canvas/CubeScene.jsx` — scene root
11. `src/components/canvas/CubeControls.jsx` — interaction
12. `src/components/ui/Toolbar.jsx` — scramble/solve UI

---

## Cube Geometry & Math Reference

### Coordinate system
```
Y+ (Up) │ Z- (Back) / origin, Z+ (Front), X+ (Right)
```
Face → Axis: `U=Y+1, D=Y-1, R=X+1, L=X-1, F=Z+1, B=Z-1`

### Cubie types
| Type   | Count | Visible faces | Example position |
|--------|-------|---------------|-----------------|
| Corner | 8     | 3 stickers    | (1,1,1) = URF   |
| Edge   | 12    | 2 stickers    | (1,1,0) = UR    |
| Center | 6     | 1 sticker     | (1,0,0) = R     |
| Core   | 1     | 0 stickers    | (0,0,0)         |

### Rotation quaternion (R face, 90° CW)
```js
quaternion.setFromAxisAngle(new THREE.Vector3(1,0,0), -Math.PI/2);
// (1,1,1)→(1,-1,1), (1,1,0)→(1,0,1), etc.
```

---

## Animation System

### Easing variants
| Mode         | Ease         | Duration | Use case          |
|---|---|---|---|
| Snap (default) | power2.out | 0.25–0.35s | Normal interaction |
| Smooth       | power1.inOut | 0.5–0.7s | Tutorial demo     |
| Speed        | power3.out   | 0.08–0.12s | Scramble playback |
| Live drag    | none → back.out(1.2) | — | Finger-follows, snaps with overshoot |

### Celebration on solve
1. Cube floats up (y += 0.5, 0.5s)
2. Each face explodes outward slightly (0.1 units, staggered)
3. Particle burst via `<Sparkles>` from drei or custom particles
4. Camera slow orbit
5. Timer shows final time large
6. After 3s, cube reassembles

---

## Algorithm Reference (Beginner Method)

| Step | Algorithm |
|---|---|
| White Cross | Intuitive |
| White Corners | `R U R' U'` (repeat) |
| Second Layer Right | `U R U' R' U' F' U F` |
| Second Layer Left | `U' L' U L U F U' F'` |
| Yellow Cross | `F R U R' U' F'` |
| Yellow Corners | `R U R' U R U2 R'` (Sune) |
| Corner Permutation | `U R U' L' U R' U' L` |
| Edge Permutation Ua | `R U' R U R U R U' R' U' R2` |
| Edge Permutation Ub | `R2 U R U R' U' R' U' R' U R'` |

---

## Deployment

**Platform:** Cloudflare Pages (free tier) or Vercel

```
pnpm build   # Vite production build → dist/
```

- Fully client-side, no server needed
- Solver tables: bundled as JSON or generated in Web Worker (lazy-loaded, ~500KB)
- Code split: tutorial module and solver loaded on-demand
- HDRI: compressed `.hdr`, lower-res fallback on mobile
- Target bundle: < 300KB gzipped (excl. solver tables)

---

## Verification / Testing

### Phase 1
- `pnpm dev` → cube renders at localhost
- Orbit 360° with mouse drag, scroll to zoom
- All 6 faces show correct colors; black plastic visible between cubies
- Stickers appear slightly raised with gloss sheen
- Lighthouse performance ≥ 80

### Phase 2
- Click-drag a row/column → layer rotates 90° with snap animation
- Scramble button generates a random state
- Solve button animates solution moves sequentially
- Undo/Redo buttons step through move history
- `pnpm test` → CubeState.test.js: all 18 moves pass, identity test passes

### Phase 3
- Tutorial mode launches from toolbar
- Steps guide user through white cross with highlighted facelets
- Wrong move triggers hint system
- Progress persists after page reload (localStorage)
