# 🧊 Rubik's Cube — 3D Interactive Web App

## Project Plan & Architecture Document

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Phase 1 — Realistic 3D Cube](#4-phase-1--realistic-3d-cube)
5. [Phase 2 — Interactive Rotation & Scramble/Solve](#5-phase-2--interactive-rotation--scramblesolve)
6. [Phase 3 — Learn to Solve (Tutorial Mode)](#6-phase-3--learn-to-solve-tutorial-mode)
7. [Cube Geometry & Math Reference](#7-cube-geometry--math-reference)
8. [Rendering & Realism Details](#8-rendering--realism-details)
9. [State Management Architecture](#9-state-management-architecture)
10. [Animation System](#10-animation-system)
11. [Solving Algorithm Reference](#11-solving-algorithm-reference)
12. [Deployment](#12-deployment)
13. [Future Enhancements](#13-future-enhancements)

---

## 1. Project Overview

A browser-based, photorealistic 3D Rubik's Cube that mirrors real-world cube mechanics — from the physical geometry (beveled edges, glossy stickers, internal black body) to the rotation system (layer-based face turns with realistic snap animations). The project is built in three phases, each deployable independently.

### Goals

- **Phase 1**: A static but fully 3D-rendered cube that can be orbited/zoomed — looks like a real cube sitting on a table.
- **Phase 2**: Full interactivity — click-drag face rotations, scramble, undo/redo, auto-solve with animation.
- **Phase 3**: A guided tutorial system teaching the CFOP beginner method (Layer-by-Layer) with interactive lessons, algorithm visualization, and progress tracking.

### Target Audience

- Cubing beginners who want to learn
- Developers interested in 3D web graphics
- Portfolio/showcase piece

---

## 2. Tech Stack

### Core

| Layer            | Technology                    | Why                                                                 |
| ---------------- | ----------------------------- | ------------------------------------------------------------------- |
| **Framework**    | React 18+ (Vite)              | Component model, state management, fast HMR                        |
| **3D Engine**    | Three.js + React Three Fiber  | Declarative Three.js in React; great for complex scene graphs       |
| **3D Helpers**   | @react-three/drei             | OrbitControls, Environment maps, rounded boxes, text, etc.          |
| **Animation**    | GSAP 3 / Three.js AnimationMixer | Buttery 90° snapping rotations with easing                       |
| **State**        | Zustand                       | Lightweight, perfect for cube state (54 facelets + move history)    |
| **Styling**      | Tailwind CSS 4                | Utility-first for the 2D UI overlay                                |
| **Tutorial**     | Custom step engine + Zustand  | Lesson state machine with validation hooks                         |

### Supporting

| Purpose          | Library / Tool              |
| ---------------- | --------------------------- |
| Post-processing  | @react-three/postprocessing |
| Icons            | Lucide React                |
| Linting          | ESLint + Prettier           |
| Testing          | Vitest + React Testing Lib  |
| Deploy           | Cloudflare Pages / Vercel   |
| Package Manager  | pnpm                        |

### Why React Three Fiber over raw Three.js?

- Declarative scene graph = easier to reason about 27 cubies + grouping logic
- React state drives re-renders naturally (e.g., color changes after rotation)
- drei provides `<RoundedBox>`, `<Environment>`, `<ContactShadows>` out of the box
- Hot module replacement works seamlessly with Vite

---

## 3. Project Structure

```
rubiks-cube/
├── public/
│   ├── textures/
│   │   ├── sticker-normal.png        # Subtle bump map for sticker edges
│   │   ├── plastic-roughness.png     # Roughness map for cube body
│   │   └── env-studio.hdr            # Studio HDRI for reflections
│   ├── sounds/
│   │   ├── rotate-click.mp3          # Tactile rotation sound
│   │   └── snap.mp3                  # Layer snap into place
│   └── favicon.svg
│
├── src/
│   ├── main.jsx                      # Entry point
│   ├── App.jsx                       # Layout: Canvas + UI overlay
│   │
│   ├── components/
│   │   ├── canvas/                   # === THREE.JS / R3F COMPONENTS ===
│   │   │   ├── CubeScene.jsx         # Scene root: lighting, env, camera
│   │   │   ├── RubiksCube.jsx        # Parent group of 27 cubies
│   │   │   ├── Cubie.jsx             # Single cubie: body + sticker faces
│   │   │   ├── StickerFace.jsx       # One colored sticker with material
│   │   │   ├── RotationGroup.jsx     # Temp group for animating a face turn
│   │   │   ├── CubeControls.jsx      # Click/drag detection → face rotation
│   │   │   ├── GhostLayer.jsx        # Visual guide showing which layer is selected
│   │   │   └── GroundPlane.jsx       # Contact shadows / reflection plane
│   │   │
│   │   ├── ui/                       # === 2D OVERLAY UI ===
│   │   │   ├── Toolbar.jsx           # Scramble, Solve, Reset, Undo, Redo
│   │   │   ├── MoveHistory.jsx       # Scrollable move notation log
│   │   │   ├── Timer.jsx             # Speedcubing timer (Phase 2)
│   │   │   ├── ColorPicker.jsx       # Manual state input (Phase 2)
│   │   │   ├── SettingsPanel.jsx     # Animation speed, sound, theme
│   │   │   └── NotationGuide.jsx     # Quick-reference for R, U, F, etc.
│   │   │
│   │   └── tutorial/                 # === PHASE 3: LEARNING MODE ===
│   │       ├── TutorialOverlay.jsx   # Full tutorial UI wrapper
│   │       ├── LessonSidebar.jsx     # Lesson list + progress
│   │       ├── StepCard.jsx          # Current step: text + 3D highlight
│   │       ├── AlgorithmDisplay.jsx  # Animated notation with finger tricks
│   │       ├── PracticeMode.jsx      # "Now you try" interactive practice
│   │       ├── HintSystem.jsx        # Progressive hints on wrong moves
│   │       └── ProgressTracker.jsx   # LocalStorage-backed progress
│   │
│   ├── core/                         # === PURE LOGIC (no React) ===
│   │   ├── CubeState.js             # 54-facelet array + transformation logic
│   │   ├── CubeState.test.js         # Unit tests for all moves
│   │   ├── moves.js                  # Move definitions (R, U, F, L, D, B + primes + doubles)
│   │   ├── notation.js               # Parse "R U R' U'" → move sequence
│   │   ├── scrambler.js              # WCA-compliant random state scrambler
│   │   ├── solver/
│   │   │   ├── index.js              # Solver entry point
│   │   │   ├── kociemba.js           # Two-phase Kociemba algorithm
│   │   │   ├── beginnerMethod.js     # Layer-by-layer solve (for tutorial)
│   │   │   ├── crossSolver.js        # Step 1: White cross
│   │   │   ├── cornerSolver.js       # Step 2: First layer corners
│   │   │   ├── secondLayerSolver.js  # Step 3: Middle layer edges
│   │   │   ├── ollSolver.js          # Step 4: Orient last layer
│   │   │   ├── pllSolver.js          # Step 5: Permute last layer
│   │   │   └── moveTable.js          # Precomputed move tables for Kociemba
│   │   ├── cubieMapper.js            # Maps facelet index → 3D cubie position
│   │   ├── rotationMath.js           # Quaternion math for 90° face rotations
│   │   └── validation.js             # Check if cube state is solvable
│   │
│   ├── store/
│   │   ├── cubeStore.js              # Zustand: cube state, move history, undo/redo
│   │   ├── uiStore.js                # Zustand: panels, settings, theme
│   │   └── tutorialStore.js          # Zustand: current lesson, step, progress
│   │
│   ├── hooks/
│   │   ├── useRotation.js            # Manages face rotation animation lifecycle
│   │   ├── useDragDetection.js       # Raycasting + swipe → determine face + direction
│   │   ├── useCubeInteraction.js     # Combines drag detection with rotation execution
│   │   ├── useTimer.js               # Solve timer with inspection countdown
│   │   ├── useSound.js               # Rotation click sounds (Howler.js or Web Audio)
│   │   └── useTutorialValidation.js  # Checks if user's move matches expected step
│   │
│   ├── utils/
│   │   ├── constants.js              # Colors, dimensions, easing curves
│   │   ├── colors.js                 # Rubik's official color hex values
│   │   ├── easing.js                 # Custom easing functions for snap feel
│   │   └── helpers.js                # General utilities
│   │
│   └── styles/
│       ├── index.css                 # Tailwind directives + global styles
│       └── tutorial.css              # Tutorial-specific animations
│
├── index.html
├── vite.config.js
├── tailwind.config.js
├── package.json
├── tsconfig.json                     # Optional: can be JS-only
├── .eslintrc.cjs
├── .prettierrc
├── CLAUDE.md                         # Claude Code project context
└── README.md
```

---

## 4. Phase 1 — Realistic 3D Cube

### Objective

Render a 3×3×3 Rubik's Cube that looks photorealistic and can be freely orbited, zoomed, and panned.

### 4.1 Cubie Geometry

Each of the 27 cubies is a slightly rounded box (not a sharp cube — real cubes have ~0.5mm edge radius).

```
Cubie dimensions:
- Size: 1.0 × 1.0 × 1.0 units
- Corner radius: 0.06 units (RoundedBox from drei)
- Gap between cubies: 0.04 units (simulates the real gap)
- Total cube size: ~3.12 × 3.12 × 3.12 units
```

**Cubie positioning formula:**

```javascript
// For cubie at grid position (x, y, z) where x, y, z ∈ {-1, 0, 1}
const GAP = 0.04;
const SIZE = 1.0;
const offset = (index) => index * (SIZE + GAP);

// Example: cubie at (-1, 1, 0)
// position = (-1.04, 1.04, 0)
```

### 4.2 Materials & Realism

**Cube body (black plastic):**

```javascript
{
  color: '#1a1a1a',
  roughness: 0.35,
  metalness: 0.0,
  clearcoat: 0.3,
  clearcoatRoughness: 0.2,
  // Use MeshPhysicalMaterial for clearcoat support
}
```

**Stickers (colored faces):**

```javascript
// Rubik's official colors (approximate)
const COLORS = {
  U: '#FFFFFF',  // White  (top)
  D: '#FFD500',  // Yellow (bottom)
  F: '#009B48',  // Green  (front)
  B: '#0046AD',  // Blue   (back)
  R: '#B71234',  // Red    (right)
  L: '#FF5800',  // Orange (left)
  X: '#1a1a1a',  // Internal face (no sticker)
};

// Sticker material
{
  color: COLORS[face],
  roughness: 0.25,       // Slightly glossy
  metalness: 0.0,
  clearcoat: 0.6,        // Sticker sheen
  clearcoatRoughness: 0.1,
}
```

**Sticker geometry:**

Stickers are NOT painted on — they are separate thin meshes (0.02 units thick) slightly offset from the cubie face (0.01 units). This creates the realistic raised-sticker look with visible edges.

```javascript
// Sticker sits on top of cubie face
// For a face pointing in +X direction:
<mesh position={[0.52, 0, 0]} rotation={[0, Math.PI/2, 0]}>
  <planeGeometry args={[0.85, 0.85]} />  {/* Slightly smaller than cubie face */}
  <meshPhysicalMaterial {...stickerMaterial} />
</mesh>
```

### 4.3 Lighting Setup

```
Scene lighting (studio-style, 3-point):
├── Key Light:     DirectionalLight, intensity 1.2, position [5, 8, 5], castShadow
├── Fill Light:    DirectionalLight, intensity 0.4, position [-3, 4, -2]
├── Rim Light:     DirectionalLight, intensity 0.3, position [0, 2, -8]
├── Ambient:       AmbientLight, intensity 0.15 (prevents pure black shadows)
└── Environment:   HDRI studio map via <Environment> for realistic reflections
```

### 4.4 Camera & Controls

```javascript
// Initial camera
<PerspectiveCamera makeDefault position={[4, 3, 4]} fov={45} />

// OrbitControls (from drei)
<OrbitControls
  enableDamping={true}
  dampingFactor={0.08}
  minDistance={4}
  maxDistance={12}
  enablePan={false}           // Disable pan — cube stays centered
  autoRotate={false}          // Can be toggled in settings
  autoRotateSpeed={1.5}
/>
```

### 4.5 Ground & Shadows

```javascript
// Subtle contact shadow beneath cube (drei)
<ContactShadows
  position={[0, -1.65, 0]}
  opacity={0.4}
  scale={8}
  blur={2.5}
  far={4}
/>

// Optional: reflective ground plane
<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.66, 0]}>
  <planeGeometry args={[20, 20]} />
  <meshStandardMaterial color="#111" roughness={0.8} metalness={0.2} />
</mesh>
```

### 4.6 Phase 1 Deliverables

| Component           | File                        | Description                                    |
| ------------------- | --------------------------- | ---------------------------------------------- |
| Scene setup         | `CubeScene.jsx`             | Canvas, camera, lighting, environment          |
| Cube assembly       | `RubiksCube.jsx`            | Maps 27 cubie positions from state             |
| Single cubie        | `Cubie.jsx`                 | RoundedBox body + up to 3 StickerFace children |
| Sticker             | `StickerFace.jsx`           | Colored plane with physical material           |
| Ground              | `GroundPlane.jsx`           | Contact shadows + reflective floor             |
| Cube state (basic)  | `CubeState.js`              | 54-facelet array, initial solved state          |
| Constants           | `constants.js`, `colors.js` | Dimensions, colors, material params            |
| Cubie mapper        | `cubieMapper.js`            | Facelet index ↔ 3D position mapping            |

### 4.7 Phase 1 Acceptance Criteria

- [ ] Cube renders with 27 distinct cubies, each with correct colored stickers
- [ ] Visible gap between cubies (black body shows through)
- [ ] Stickers appear raised (not painted flush)
- [ ] Cube can be orbited 360° with smooth damping
- [ ] Zoom in/out with scroll wheel (clamped range)
- [ ] Studio-quality lighting with soft shadows
- [ ] Reflections visible on sticker surfaces
- [ ] Responsive — works on mobile (touch orbit) and desktop
- [ ] 60fps on mid-range hardware

---

## 5. Phase 2 — Interactive Rotation & Scramble/Solve

### Objective

Full interactivity: drag to rotate faces, scramble, auto-solve with animated playback, undo/redo, timer.

### 5.1 Rotation System Architecture

This is the hardest part of the project. Real Rubik's cube rotations involve temporarily re-parenting cubies in the scene graph.

**Rotation lifecycle:**

```
User drags on cube face
  → Raycast determines: which cubie face was hit + drag direction
  → From hit face + direction, determine: which layer (R/L/U/D/F/B) + rotation direction (CW/CCW)
  → LOCK: Prevent new rotations during animation
  → Create temporary THREE.Group (RotationGroup)
  → Reparent the 9 cubies of that layer into RotationGroup
  → Animate RotationGroup.rotation by ±90° (GSAP)
  → On complete:
      → Update CubeState (permute facelets)
      → Reparent cubies back to main cube group (with new world positions)
      → Destroy RotationGroup
      → UNLOCK
```

### 5.2 Drag Detection (`useDragDetection.js`)

```
Step 1: onPointerDown
  - Cast ray from mouse → cube
  - Record: hit cubie, hit face normal, mouse position
  - Set dragState = 'pending'

Step 2: onPointerMove (while dragging)
  - Calculate drag delta in screen space
  - If delta > threshold (5px): determine drag axis
  - Cross product: face normal × drag direction → rotation axis
  - Map rotation axis to cube face (R, U, F, etc.)
  - Set dragState = 'rotating'
  - Optional: allow "live drag" where layer follows finger (advanced)

Step 3: onPointerUp
  - If live dragging: snap to nearest 90° (round rotation)
  - Else: execute the detected move
  - Reset dragState
```

**Key math for determining which layer to rotate:**

```javascript
// Given:
// - faceNormal: the normal of the cubie face that was clicked (e.g., [1,0,0] for +X face)
// - dragDirection: normalized screen-space drag direction projected onto the cube surface
// - cross = faceNormal × dragDirection → this gives the rotation axis

// Map rotation axis to face:
// axis ≈ [1,0,0] → rotate R (or L, depending on sign and cubie position)
// axis ≈ [0,1,0] → rotate U (or D)
// axis ≈ [0,0,1] → rotate F (or B)

// Which specific layer? Check the clicked cubie's position along the rotation axis:
// cubie.position[axisIndex] === 1  → outer layer (R, U, or F)
// cubie.position[axisIndex] === 0  → middle layer (M, E, or S)
// cubie.position[axisIndex] === -1 → opposite layer (L, D, or B)
```

### 5.3 Rotation Animation (`useRotation.js`)

```javascript
// GSAP animation for a face turn
const animateRotation = (rotationGroup, axis, angle, duration = 0.3) => {
  return new Promise((resolve) => {
    gsap.to(rotationGroup.rotation, {
      [axis]: angle,           // 'x', 'y', or 'z'
      duration: duration,
      ease: 'power2.out',     // Fast start, smooth deceleration (like a real cube snap)
      onComplete: resolve,
    });
  });
};

// Duration variants:
// Normal:    0.30s (default interaction)
// Fast:      0.12s (scramble playback)
// Slow:      0.60s (tutorial demonstration)
// Instant:   0.00s (undo/redo with no animation)
```

### 5.4 Move Notation System (`notation.js`)

Standard Singmaster notation:

```
Face Moves:   R  L  U  D  F  B       (clockwise 90°)
Prime Moves:  R' L' U' D' F' B'     (counter-clockwise 90°)
Double Moves: R2 L2 U2 D2 F2 B2     (180°)
Slice Moves:  M  E  S               (middle layers)
Rotations:    x  y  z               (whole cube rotations)

Parse function:
  "R U R' U'" → [
    { face: 'R', direction: 1, angle: Math.PI/2 },
    { face: 'U', direction: 1, angle: Math.PI/2 },
    { face: 'R', direction: -1, angle: -Math.PI/2 },
    { face: 'U', direction: -1, angle: -Math.PI/2 },
  ]
```

### 5.5 Cube State Model (`CubeState.js`)

```
Facelet index layout (54 facelets, 9 per face):

        U0 U1 U2
        U3 U4 U5          Face order: U=0-8, R=9-17, F=18-26,
        U6 U7 U8                      D=27-35, L=36-44, B=45-53

 L0 L1 L2  F0 F1 F2  R0 R1 R2  B0 B1 B2
 L3 L4 L5  F3 F4 F5  R3 R4 R5  B3 B4 B5
 L6 L7 L8  F6 F7 F8  R6 R7 R8  B6 B7 B8

        D0 D1 D2
        D3 D4 D5
        D6 D7 D8

Each facelet stores a color: 'U', 'R', 'F', 'D', 'L', 'B'
Solved state: facelets[0..8] = 'U', facelets[9..17] = 'R', etc.
```

**Move as permutation (example: R move):**

```javascript
const R_MOVE = {
  // Cycle within R face (indices 9-17): 4-corner cycle + 4-edge cycle
  face: [9,11,17,15, 10,14,16,12],  // corners then edges (CW cycle)
  // Adjacent facelets that cycle between faces:
  adjacent: [
    [2, 20, 29, 47],   // U2 → F2 → D2 → B6 (and shifted indices)
    [5, 23, 32, 50],
    [8, 26, 35, 53],
  ]
};
// Apply by cycling values at these positions
```

### 5.6 Scramble (`scrambler.js`)

```
WCA-style random-state scramble:
- Generate 20-25 random moves
- No two consecutive moves on the same face
- No three consecutive moves on parallel faces (e.g., R L R)
- Format as standard notation string: "R U2 F' D B2 L' ..."
```

### 5.7 Solver (`solver/`)

**Beginner method (Layer-by-Layer)** — used for tutorial and basic solve:

```
Step 1: White Cross        — 4 white edge pieces correctly oriented on U face
Step 2: White Corners      — 4 white corner pieces in correct position
Step 3: Second Layer Edges — 4 middle-layer edge pieces using R U R' U' / L' U' L U F' sequences
Step 4: Yellow Cross (OLL) — Orient last layer edges (F R U R' U' F')
Step 5: Yellow Corners Orientation — Orient corners (R U R' U R U2 R')
Step 6: Corner Permutation (PLL) — Position corners correctly
Step 7: Edge Permutation (PLL)   — Position edges correctly → SOLVED
```

**Kociemba two-phase** — used for optimal solve animation:

```
Phase 1: Reduce to <U, D, R2, L2, F2, B2> subgroup (~12 moves)
Phase 2: Solve from subgroup to identity (~6 moves)
Total: ~18-20 moves (near optimal)

Implementation: Use precomputed pruning tables (loaded as JSON or computed on first run)
Table sizes: ~500KB total (phase1: ~200KB, phase2: ~300KB)
Can be lazy-loaded / web-worker computed
```

### 5.8 Zustand Store (`cubeStore.js`)

```javascript
const useCubeStore = create((set, get) => ({
  // State
  facelets: SOLVED_STATE,        // 54-element array
  moveHistory: [],                // [{move: 'R', timestamp: ...}, ...]
  redoStack: [],
  isAnimating: false,
  isSolved: true,

  // Actions
  applyMove: (move) => { ... },
  undo: () => { ... },
  redo: () => { ... },
  scramble: () => { ... },
  solve: () => { ... },          // Returns move sequence
  reset: () => { ... },
  setAnimating: (v) => set({ isAnimating: v }),

  // Computed
  checkSolved: () => { ... },
}));
```

### 5.9 UI Components (Phase 2)

**Toolbar (`Toolbar.jsx`):**

```
┌──────────────────────────────────────────────┐
│  ⟲ Undo  │  ⟳ Redo  │  🔀 Scramble  │  ✨ Solve  │  🔄 Reset  │
└──────────────────────────────────────────────┘
```

**Move History (`MoveHistory.jsx`):**

```
Scrollable horizontal ribbon showing moves:
  R  U  R'  U'  F  R2  ...
     ↑ current position (undo highlights past this point)
```

**Timer (`Timer.jsx`):**

```
- 15-second inspection countdown (WCA rules)
- Solve timer with millisecond precision
- Start: spacebar hold + release (or tap on mobile)
- Stop: any key press / tap
- Display: MM:SS.ms
- Best time tracking (localStorage)
```

### 5.10 Phase 2 Deliverables

| Component           | File                          | Description                                    |
| ------------------- | ----------------------------- | ---------------------------------------------- |
| Drag detection      | `useDragDetection.js`         | Raycast + swipe → face + direction             |
| Rotation animation  | `useRotation.js`              | GSAP-powered 90° snapping with re-parenting    |
| Rotation group      | `RotationGroup.jsx`           | Temporary Three.js group for animating layer    |
| Cube interaction    | `useCubeInteraction.js`       | Combines drag + rotation hooks                 |
| Cube controls       | `CubeControls.jsx`            | Event handlers on cube mesh                    |
| Ghost layer         | `GhostLayer.jsx`              | Semi-transparent highlight of selected layer   |
| Move notation       | `notation.js`                 | Parse & serialize move sequences               |
| Move definitions    | `moves.js`                    | Permutation arrays for all 18 moves            |
| Scrambler           | `scrambler.js`                | WCA-compliant random scramble generator         |
| Beginner solver     | `beginnerMethod.js`           | Layer-by-layer solution finder                 |
| Kociemba solver     | `kociemba.js`                 | Near-optimal 2-phase solver                    |
| State store         | `cubeStore.js`                | Zustand store with full move history            |
| Toolbar             | `Toolbar.jsx`                 | Action buttons                                 |
| Move history        | `MoveHistory.jsx`             | Visual move log                                |
| Timer               | `Timer.jsx`                   | Speedcubing timer                              |
| Sound effects       | `useSound.js`                 | Rotation click/snap audio                      |

### 5.11 Phase 2 Acceptance Criteria

- [ ] Drag on any exposed cubie face to rotate that layer
- [ ] Rotation snaps to 90° with smooth deceleration easing
- [ ] Cannot initiate a new rotation while one is animating
- [ ] Undo/redo works for entire move history
- [ ] Scramble generates random state with animated playback
- [ ] Auto-solve animates the solution move-by-move
- [ ] Timer starts/stops with spacebar or tap
- [ ] Move history displays in standard notation
- [ ] Rotation sound effect on each move (toggleable)
- [ ] Works on touch devices (swipe to rotate layers)
- [ ] Solve detection — confetti/celebration on solved state

---

## 6. Phase 3 — Learn to Solve (Tutorial Mode)

### Objective

A guided, interactive tutorial that teaches the beginner method (Layer-by-Layer) step-by-step, with 3D visualization, practice exercises, and progress tracking.

### 6.1 Tutorial Structure

```
LESSON PLAN (Beginner Method / LBL)
=====================================

Module 0: Cube Basics
  0.1  Parts of the cube: centers, edges, corners
  0.2  Color scheme & face naming (U/D/R/L/F/B)
  0.3  Move notation: R, U, F and their primes
  0.4  Practice: Execute R, U, R', U' on the 3D cube

Module 1: The White Cross
  1.1  Concept: What is the cross? (4 white edges aligned with centers)
  1.2  Demo: Solving one edge piece
  1.3  Practice: Solve the white cross (guided, with hints)
  1.4  Challenge: Solve white cross unguided

Module 2: First Layer Corners
  2.1  Concept: Positioning white corners
  2.2  Algorithm: R U R' U' (sexy move) — repeated insertion
  2.3  Demo: Insert one corner
  2.4  Practice: Complete the first layer

Module 3: Second Layer (Middle Layer Edges)
  3.1  Concept: Edge pieces that don't have yellow
  3.2  Algorithm: U R U' R' U' F' U F (insert right)
  3.3  Algorithm: U' L' U L U F U' F' (insert left)
  3.4  Practice: Complete two layers

Module 4: Yellow Cross (OLL Step 1)
  4.1  Concept: Orient yellow edges on top
  4.2  Recognize: dot → L → line → cross patterns
  4.3  Algorithm: F R U R' U' F'
  4.4  Practice: Get yellow cross from any state

Module 5: Yellow Face (OLL Step 2)
  5.1  Concept: Orient yellow corners
  5.2  Algorithm: R U R' U R U2 R' (Sune)
  5.3  Practice: Complete yellow face

Module 6: Position Yellow Corners (PLL Step 1)
  6.1  Concept: Get corners to correct positions (ignore edges)
  6.2  Algorithm: U R U' L' U R' U' L
  6.3  Practice: Position all corners

Module 7: Position Yellow Edges (PLL Step 2)
  7.1  Concept: Cycle edges to final positions
  7.2  Algorithm: R U' R U R U R U' R' U' R2 (or simpler Ua/Ub perm)
  7.3  Practice: SOLVE THE CUBE! 🎉

Module 8: Practice & Review
  8.1  Full solve practice (guided)
  8.2  Full solve practice (unguided, with hints available)
  8.3  Timed solves with personal best tracking
```

### 6.2 Tutorial Engine Architecture

**Lesson state machine (`tutorialStore.js`):**

```javascript
{
  currentModule: 2,
  currentLesson: 3,
  currentStep: 1,            // Within a lesson
  lessonState: 'DEMO',       // INTRO | DEMO | PRACTICE | CHALLENGE | COMPLETE

  // Expected state for validation
  expectedMoves: ['R', 'U', "R'", "U'"],
  expectedCubeState: [...],  // What the cube should look like after correct moves
  moveIndex: 0,              // How far through the expected sequence

  // Progress (persisted to localStorage)
  completedLessons: [0.1, 0.2, 0.3, 0.4, 1.1, 1.2],
  bestTimes: { fullSolve: 245000 },  // ms

  // Hint system
  hintsUsed: 0,
  hintLevel: 0,              // 0=none, 1=which piece, 2=which face, 3=exact move
}
```

### 6.3 3D Highlighting System

During tutorials, the cube uses visual highlights to guide the user:

```
Highlighting modes:
├── Piece highlight:   Specific cubie(s) glow/pulse (emissive material boost)
├── Face highlight:    Entire face outlined with colored border
├── Target position:   Ghost cubie showing where a piece needs to go
├── Algorithm arrows:  3D arrows showing rotation direction on the face
└── Dim others:        Non-relevant cubies reduce opacity to 0.3
```

**Implementation:**

```javascript
// In Cubie.jsx, check if this cubie should be highlighted
const isHighlighted = tutorialStore.highlightedCubies.includes(cubieId);

<meshPhysicalMaterial
  {...baseMaterial}
  emissive={isHighlighted ? '#FFD700' : '#000000'}
  emissiveIntensity={isHighlighted ? 0.4 : 0}
  opacity={isDimmed ? 0.3 : 1.0}
  transparent={isDimmed}
/>
```

### 6.4 Hint System (`HintSystem.jsx`)

Progressive hints (costs "hint points" to encourage independent solving):

```
Level 0: "Try to figure it out!" (no hint)
Level 1: "Focus on the RED-WHITE edge piece" (identifies the piece)
Level 2: "That piece needs to go to the RIGHT face" (identifies target)
Level 3: "Try rotating the RIGHT face clockwise (R)" (exact move)
Level 4: [Auto-demonstrate] Animate the move on the cube
```

### 6.5 Algorithm Visualization (`AlgorithmDisplay.jsx`)

```
┌───────────────────────────────────────────────┐
│                                               │
│   R    U    R'   U'   F    R    U    R'   U'  │
│   ●    ○    ○    ○    ○    ○    ○    ○    ○   │
│   ↑                                           │
│  current                                      │
│                                               │
│  Tap to see each move demonstrated on cube    │
│  "Sexy Move" — the most common algorithm      │
│                                               │
└───────────────────────────────────────────────┘
```

- Each move is a tappable chip
- Current move is highlighted
- Tapping a move animates it on the 3D cube
- "Play all" button animates the full algorithm slowly
- Finger trick tips shown below (e.g., "Use right index finger for R")

### 6.6 Practice Mode (`PracticeMode.jsx`)

```
Mode: PRACTICE
State: Cube is set to a state where the current algorithm applies

"Now you try! Perform: R U R' U'"

Progress: [✓] [✓] [ ] [ ]
           R   U   R'  U'

[Hint] [Reset] [Show Me]
```

- Cube is set to a specific state relevant to the lesson
- User must perform the exact moves
- Green checkmark per correct move
- Wrong move: gentle shake animation + "Not quite, try again"
- "Show Me" button: auto-animate the solution

### 6.7 Progress Tracking (`ProgressTracker.jsx`)

```
Persisted to localStorage:

{
  version: 1,
  lessons: {
    "0.1": { completed: true, completedAt: "2026-04-10T..." },
    "0.2": { completed: true, completedAt: "2026-04-10T..." },
    "1.1": { completed: false },
    ...
  },
  stats: {
    totalMoves: 1247,
    totalSolves: 3,
    bestTime: 245000,
    averageTime: 312000,
    streakDays: 5,
    lastPractice: "2026-04-10",
  }
}
```

### 6.8 Phase 3 Deliverables

| Component           | File                          | Description                                    |
| ------------------- | ----------------------------- | ---------------------------------------------- |
| Tutorial overlay    | `TutorialOverlay.jsx`         | Full-screen tutorial wrapper                   |
| Lesson sidebar      | `LessonSidebar.jsx`           | Module/lesson list with progress indicators    |
| Step card           | `StepCard.jsx`                | Current step instructions + visual             |
| Algorithm display   | `AlgorithmDisplay.jsx`        | Interactive notation viewer                    |
| Practice mode       | `PracticeMode.jsx`            | "Now you try" interactive exercise             |
| Hint system         | `HintSystem.jsx`              | Progressive hint escalation                    |
| Progress tracker    | `ProgressTracker.jsx`         | Stats dashboard + streak tracking              |
| Tutorial store      | `tutorialStore.js`            | Zustand: lesson state machine                  |
| Tutorial validation | `useTutorialValidation.js`    | Validates user moves against expected sequence  |
| Beginner solver     | `beginnerMethod.js`           | Step-by-step LBL solver (generates solutions)  |
| Step sub-solvers    | `crossSolver.js`, etc.        | Individual step solvers for targeted practice   |

### 6.9 Phase 3 Acceptance Criteria

- [ ] 8 modules with 30+ individual lessons
- [ ] 3D highlighting correctly identifies target pieces
- [ ] Algorithm display syncs with cube animation
- [ ] Practice mode validates exact move sequences
- [ ] Hint system escalates progressively
- [ ] Wrong moves show feedback without breaking state
- [ ] Progress persists across browser sessions
- [ ] Can resume any lesson from where user left off
- [ ] Full solve practice mode with timer
- [ ] Celebration animation on first complete solve

---

## 7. Cube Geometry & Math Reference

### 7.1 Coordinate System

```
        Y+ (Up)
        │
        │    Z- (Back)
        │   /
        │  /
        │ /
        └──────── X+ (Right)
       /
      /
     Z+ (Front)

Face → Axis mapping:
  U (top)    → Y = +1
  D (bottom) → Y = -1
  R (right)  → X = +1
  L (left)   → X = -1
  F (front)  → Z = +1
  B (back)   → Z = -1
```

### 7.2 The 27 Cubies

```
Type          Count    Visible faces    Example position
─────────────────────────────────────────────────────────
Corner        8        3 stickers       (1, 1, 1) = URF corner
Edge          12       2 stickers       (1, 1, 0) = UR edge
Center        6        1 sticker        (1, 0, 0) = R center
Core          1        0 stickers       (0, 0, 0) = hidden center
```

### 7.3 Rotation Quaternions

For a 90° clockwise rotation of the R face (around X+ axis):

```javascript
// Axis: [1, 0, 0]
// Angle: -π/2 (clockwise when looking from +X toward origin)
const quaternion = new THREE.Quaternion();
quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);

// Cubies on R face: all cubies where x === 1
// After rotation, update their y and z positions:
// New position = quaternion.apply(old position)
// (1, 1, 1)  → (1, -1, 1)
// (1, 1, 0)  → (1, 0, 1)
// (1, 1, -1) → (1, 1, 1)
// etc.
```

### 7.4 Facelet-to-Cubie Mapping

```javascript
// Maps each of the 54 facelets to its cubie position and face direction
const FACELET_MAP = [
  // U face (indices 0-8)
  { cubie: [-1, 1, -1], face: 'y+' },  // U0 (top-left when looking down)
  { cubie: [0, 1, -1],  face: 'y+' },  // U1
  { cubie: [1, 1, -1],  face: 'y+' },  // U2
  { cubie: [-1, 1, 0],  face: 'y+' },  // U3
  { cubie: [0, 1, 0],   face: 'y+' },  // U4 (center)
  { cubie: [1, 1, 0],   face: 'y+' },  // U5
  { cubie: [-1, 1, 1],  face: 'y+' },  // U6
  { cubie: [0, 1, 1],   face: 'y+' },  // U7
  { cubie: [1, 1, 1],   face: 'y+' },  // U8
  // ... R, F, D, L, B follow same pattern
];
```

---

## 8. Rendering & Realism Details

### 8.1 Material Layering (per cubie)

```
Layer 1: Black plastic body (MeshPhysicalMaterial)
  - RoundedBox geometry, radius 0.06
  - color: #1a1a1a, roughness: 0.35, clearcoat: 0.3

Layer 2: Colored stickers (MeshPhysicalMaterial, up to 3 per cubie)
  - PlaneGeometry, 0.85 × 0.85 (with 0.075 margin on each side)
  - Offset 0.51 units from center along face normal
  - roughness: 0.25, clearcoat: 0.6
  - Slight bevel at edges using normalMap (optional)

Layer 3: Sticker border (optional, for extra realism)
  - Thin dark outline around sticker (0.02 unit inset)
  - Can be done with shader or a second slightly-larger black plane behind sticker
```

### 8.2 Post-Processing (optional, togglable)

```javascript
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';

<EffectComposer>
  <Bloom intensity={0.1} luminanceThreshold={0.9} />  // Subtle glow on white stickers
  <Vignette offset={0.3} darkness={0.5} />             // Cinematic framing
</EffectComposer>
```

### 8.3 Performance Budget

```
Target: 60fps on iPhone 12 / mid-range Android

Geometry:
  27 cubies × RoundedBox (64 segments) = ~27 meshes
  Up to 54 sticker planes = ~54 meshes
  Total: ~81 meshes — well within budget

Draw calls: Instancing not needed at this scale
Textures: 1 HDRI (~2MB), 2 PBR maps (~200KB)
JS bundle: Target < 300KB gzipped (excl. solver tables)
Solver tables: Lazy-loaded, ~500KB (can be web-worker generated)
```

---

## 9. State Management Architecture

```
┌─────────────────────────────────────────┐
│              Zustand Stores             │
├──────────────┬──────────┬───────────────┤
│  cubeStore   │ uiStore  │ tutorialStore │
│              │          │               │
│ • facelets   │ • theme  │ • module      │
│ • history    │ • sound  │ • lesson      │
│ • isAnimating│ • speed  │ • step        │
│ • isSolved   │ • panels │ • progress    │
│              │          │ • hints       │
└──────┬───────┴────┬─────┴───────┬───────┘
       │            │             │
       ▼            ▼             ▼
   RubiksCube    UI Overlay   Tutorial UI
   (3D scene)    (React DOM)  (React DOM)
```

**Data flow for a rotation:**

```
1. useDragDetection detects face + direction → "R"
2. cubeStore.applyMove("R") called
   a. Pushes to moveHistory
   b. Permutes facelets array
   c. Sets isAnimating = true
3. useRotation picks up isAnimating
   a. Creates RotationGroup, reparents 9 cubies
   b. Animates 90° rotation via GSAP
   c. On complete: reparents back, sets isAnimating = false
4. RubiksCube re-renders with new facelet colors
5. cubeStore.checkSolved() → if true, trigger celebration
```

---

## 10. Animation System

### 10.1 Rotation Easing Curves

```
Real cube feel:

1. "Snap" easing (default):
   - power2.out — fast deceleration, mimics magnetic snap
   - Duration: 0.25-0.35s

2. "Smooth" easing (tutorial/demo):
   - power1.inOut — gentle start and stop
   - Duration: 0.5-0.7s

3. "Speed" easing (scramble playback):
   - power3.out — aggressive deceleration
   - Duration: 0.08-0.12s

4. "Live drag" (finger-follows-cube):
   - No easing — rotation follows pointer position
   - On release: spring to nearest 90° with bounce
   - back.out(1.2) for slight overshoot
```

### 10.2 Celebration Animation (on solve)

```
1. Cube briefly floats up (y += 0.5, 0.5s)
2. Each face "explodes" outward slightly (0.1 units, staggered)
3. Particle burst (confetti) using drei <Sparkles> or custom particles
4. Camera does a slow orbit
5. Timer shows final time in large text
6. After 3s, cube reassembles
```

---

## 11. Solving Algorithm Reference

### 11.1 Beginner Method — Algorithm Cheat Sheet

```
STEP 1: White Cross
  - Intuitive (no fixed algorithms)
  - Move white edges to U face aligned with centers

STEP 2: White Corners
  - R U R' U' (repeat until corner drops in)
  - Position corner above target slot first

STEP 3: Second Layer Edges
  - Insert Right: U R U' R' U' F' U F
  - Insert Left:  U' L' U L U F U' F'

STEP 4: Yellow Cross
  - F R U R' U' F' (from dot/L/line to cross)

STEP 5: Yellow Corners Orientation
  - R U R' U R U2 R' (Sune)

STEP 6: Corner Permutation
  - U R U' L' U R' U' L

STEP 7: Edge Permutation
  - R U' R U R U R U' R' U' R2 (Ua perm)
  - R2 U R U R' U' R' U' R' U R' (Ub perm)
```

---

## 12. Deployment

### 12.1 Build & Deploy Pipeline

```
Platform: Cloudflare Pages (free tier)
Alt: Vercel / Netlify

Build:
  pnpm install
  pnpm build           # Vite production build
  Output: dist/         # Static files

Environment:
  - No server needed (fully client-side)
  - Solver tables: bundled as JSON or generated in Web Worker

Performance optimizations:
  - Code split: solver loaded on-demand (dynamic import)
  - HDRI texture: compressed to .hdr or use lower-res fallback on mobile
  - Lazy load tutorial module (Phase 3)
  - Service worker for offline support (optional)
```

### 12.2 Suggested Domain / URL

```
rubiks.bridgetobim.com    — ties into your brand
cube.sonu.dev             — personal portfolio
rubiks-cube.pages.dev     — Cloudflare default
```

---

## 13. Future Enhancements

```
Phase 4+ ideas:
├── Advanced methods: F2L, Full OLL (57 algs), Full PLL (21 algs), CFOP
├── Custom cube sizes: 2×2, 4×4, 5×5 (same architecture, parameterized)
├── Multiplayer: WebSocket race mode
├── Cube state import: Scan physical cube via camera (ML model)
├── VR support: WebXR — hold and rotate cube in VR space
├── Algorithm trainer: Flash-card style OLL/PLL recognition practice
├── Themes: Stickerless cube, carbon fiber, mirror cube, void cube
├── Replay system: Save/share solves as encoded URLs
└── PWA: Installable app with offline solve tracking
```

---

## Summary Timeline

| Phase   | Scope                                | Est. Duration  | Complexity |
| ------- | ------------------------------------ | -------------- | ---------- |
| Phase 1 | Static 3D cube + orbit               | 1-2 weeks      | ⭐⭐       |
| Phase 2 | Rotation + scramble + solve + timer   | 3-5 weeks      | ⭐⭐⭐⭐   |
| Phase 3 | Tutorial system + lessons + progress  | 3-4 weeks      | ⭐⭐⭐     |
| **Total** |                                    | **7-11 weeks**  |            |

> **Phase 2 is the hardest phase** — the rotation detection / re-parenting / animation pipeline is the core engineering challenge. Phase 1 and 3 are comparatively straightforward once Phase 2's architecture is solid.

---

*Document version: 1.0 | Created: April 2026 | Author: Sonu × Claude*
