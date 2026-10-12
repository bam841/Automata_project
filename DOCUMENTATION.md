# Automata City — Complete Technical Architecture & Codebase Walkthrough

This document provides a comprehensive technical guide to the **Automata City** codebase. It covers the overall system architecture, component contracts, data flows, state machine lifecycle, and module-by-module breakdown of all components.

---

## Table of Contents

1. [Architectural Overview & Design Principles](#architectural-overview--design-principles)
2. [File Inventory & Load Hierarchy](#file-inventory--load-hierarchy)
3. [Global Namespace & Core Systems (`js/core/`)](#global-namespace--core-systems-jscore)
4. [Custom 2D Game Engine (`js/engine/`)](#custom-2d-game-engine-jsengine)
5. [Pure Theory Logic Engine (`js/logic/`)](#pure-theory-logic-engine-jslogic)
6. [Interactive Blackboard Lessons (`js/lessons/`)](#interactive-blackboard-lessons-jslessons)
7. [Open World & Interactive Entities (`js/world/`)](#open-world--interactive-entities-jsworld)
8. [Exam Tower, Evaluation & Diploma (`tower.js` & `certificate.js`)](#exam-tower-evaluation--diploma)
9. [Settings, Accessibility & Touch Controls (`settings.js` & `touch.js`)](#settings-accessibility--touch-controls)
10. [Classic Mode Fallback (`js/classic.js`)](#classic-mode-fallback-jsclassicjs)
11. [Finite State Machine & Bootstrapper (`js/main.js`)](#finite-state-machine--bootstrapper-jsmainjs)
12. [Verification, Property Testing & Test Runner (`tests/`)](#verification-property-testing--test-runner-tests)
13. [How to Defend This Project to the Professor](#how-to-defend-this-project-to-the-professor)

---

## Architectural Overview & Design Principles

Automata City is an educational open-world browser game built without external frameworks, npm packages, runtime dependencies, or bundlers. It is designed to run seamlessly offline by double-clicking `index.html` via the `file://` protocol.

### Key Architectural Tenets:
1. **Single Global Namespace (`window.AC`):** Every module is wrapped in an Immediately Invoked Function Expression (IIFE) attaching strictly to `AC`. No other globals exist.
2. **Strict Decoupling of Theory Logic:** All mathematical algorithms live in `js/logic/`. They are 100% pure, DOM-free, deterministic (using seeded pseudo-random number generators), and headlessly testable in Node.js.
3. **No Hard-Coded Educational Results:** All numbers, traversals, partitions, truth values, and exam answers displayed across lessons, quick checks, and the final exam are dynamically computed by the pure logic modules.
4. **Deterministic Custom 2D Engine:**
   - Fixed 60 FPS update loop with accumulator and frame lag clamping.
   - Integer pixel-perfect scaling with letterboxing (buffer resolution 320×180).
   - Axis-aligned bounding box (AABB) sliding collision.
   - Smooth camera viewport tracking clamped to map boundaries.
5. **Progressive Web Audio Synthesizer:** All 7 distinct audio cues (`select`, `open`, `close`, `collect`, `stamp`, `error`, `step`) are procedurally synthesized using the browser's native `AudioContext`, requiring zero external MP3/WAV asset downloads.

---

## File Inventory & Load Hierarchy

In `index.html`, scripts are included in classic dependency order:

```html
<!-- Core Namespace & State -->
<script src="js/core/ac.js"></script>
<script src="js/core/progress.js"></script>

<!-- Engine Modules -->
<script src="js/engine/render.js"></script>
<script src="js/engine/loop.js"></script>
<script src="js/engine/input.js"></script>
<script src="js/engine/camera.js"></script>
<script src="js/engine/tilemap.js"></script>
<script src="js/engine/collide.js"></script>
<script src="js/engine/audio.js"></script>

<!-- Pure Theory Logic Modules -->
<script src="js/logic/strings.js"></script>
<script src="js/logic/sets.js"></script>
<script src="js/logic/tree.js"></script>
<script src="js/logic/dfa.js"></script>
<script src="js/logic/quiz.js"></script>
<script src="js/logic/exam-gen.js"></script>

<!-- Mountable District Views & Lecture Shell -->
<script src="js/lessons/shell.js"></script>
<script src="js/lessons/lesson-player.js"></script>
<script src="js/lessons/drawings.js"></script>
<script src="js/lessons/str.js"></script>
<script src="js/lessons/set.js"></script>
<script src="js/lessons/tree.js"></script>
<script src="js/lessons/dfa.js"></script>
<script src="js/lessons/lessons-data.js"></script>

<!-- World Modules -->
<script src="js/world/tiles.js"></script>
<script src="js/world/map-data.js"></script>
<script src="js/world/districts.js"></script>
<script src="js/world/triggers.js"></script>
<script src="js/world/hud.js"></script>
<script src="js/world/dialogue.js"></script>
<script src="js/world/shards.js"></script>
<script src="js/world/journal.js"></script>
<script src="js/world/npcs.js"></script>
<script src="js/world/companion.js"></script>
<script src="js/world/dressing.js"></script>
<script src="js/world/atmosphere.js"></script>
<script src="js/world/title.js"></script>
<script src="js/world/tower.js"></script>
<script src="js/world/certificate.js"></script>
<script src="js/world/settings.js"></script>
<script src="js/world/touch.js"></script>
<script src="js/world/player.js"></script>
<script src="js/world/game.js"></script>

<!-- Classic Mode & Entry Bootstrapper -->
<script src="js/classic.js"></script>
<script src="js/main.js"></script>
```

---

## Global Namespace & Core Systems (`js/core/`)

### 1. `js/core/ac.js`
- **`AC.util`**:
  - `$(selector, root)`: DOM query selector shorthand.
  - `esc(str)`: HTML entity sanitization (`&`, `<`, `>`, `"`, `'`) protecting against injection.
  - `clamp(val, min, max)`: Numeric boundary constraint.
- **`AC.bus`**: Pub/sub event bus supporting `on(event, handler)`, `off(event, handler)`, and `emit(event, payload)`. Emits events: `stamp`, `shard`, `lecture:open`, `lecture:close`, `exam:pass`, `state`.
- **`AC.rng(seed)`**: 32-bit Mulberry32 PRNG returning deterministic floats in $[0, 1)$.

### 2. `js/core/progress.js`
Manages persistent user progression in `localStorage` under key `automataCity.v1`:
- Schema: `{ v: 1, name, sprite, stamps: { str, set, tree, dfa }, shards: [], exam: { passed, best }, player: { tx, ty }, settings: { muted, theme, reducedMotion } }`.
- API: `load()`, `save()`, `reset()`, `get()`, `setStamp(id)`, `addShard(id)`, `stampCount()`.
- Resilient error handling: wraps all storage accesses in `try/catch` and defaults cleanly if corrupted.

---

## Custom 2D Game Engine (`js/engine/`)

### 1. `js/engine/render.js`
- Maintains an offscreen virtual buffer canvas (320×180 resolution).
- Calculates integer pixel scaling factor $\lfloor \min(\frac{W}{320}, \frac{H}{180}) \rfloor \ge 1$.
- Blits the virtual buffer to the physical screen canvas centered with letterboxing and `imageSmoothingEnabled = false`.

### 2. `js/engine/loop.js`
- Fixed timestep loop running at exactly 60 Hz ($\Delta t = 1/60$ s $\approx 16.67$ ms).
- Maintains a time accumulator to decouple rendering framerate from simulation speed.
- Clamps large frame deltas ($\le 250$ ms) to prevent spiraling after tab suspension.

### 3. `js/engine/input.js`
- Normalizes keyboard movements (WASD and arrow keys) so diagonal movement speed equals orthogonal speed ($\|\vec{v}\| \le 1.0$).
- Tracks action triggers: `interact` ([E]/Space), `cancel` ([Esc]), `journal` ([J]), `hint` ([H]), `theme` ([T]), `settings` ([O]), `mute` ([U]), `debug` ([F3]).
- Form protection: disables action keys when focus is inside text inputs.

### 4. `js/engine/collide.js`
- Implements AABB collision movement: moves entity along X axis, resolves solid overlaps, then moves along Y axis, allowing the player to slide along walls.

### 5. `js/engine/audio.js`
- WebAudio procedural sound synthesizer.
- Synthesizes 7 cues using oscillator nodes and exponential gain envelopes.
- Hard-clamped master volume ($\le 0.18$) and persistent mute toggle.

---

## Pure Theory Logic Engine (`js/logic/`)

### 1. `js/logic/strings.js`
- `length(w)`: String character count.
- `prefixes(w)` & `suffixes(w)`: Returns all $n+1$ prefixes and suffixes.
- `prefixAt(w, k)` & `suffixAt(w, k)`: Decomposes string at cut index $k$.
- `concat(w, v)` & `reverse(w)`: String concatenation and reversal ($w^R$).
- `isPalindrome(w)`: Verifies $w = w^R$.

### 2. `js/logic/sets.js`
Discrete set algebra over universe $U = \{1, \dots, 8\}$:
- Operations: Union ($\cup$), Intersection ($\cap$), Difference ($\setminus$), Symmetric Difference ($\Delta$), Complement ($A' = U \setminus A$).
- `powerSet(A)`: Computes all $2^{|A|}$ subsets sorted by cardinality then lexicographically.
- `cartesian(A, B)`: Computes ordered pairs with size $|A| \times |B|$.
- `isChallengeSatisfied(A, B)`: Verifies Set Park challenge criteria ($A \Delta B = \{1, 2, 7, 8\}$ and $A \cap B = \{4\}$).

### 3. `js/logic/tree.js`
- `buildBST(keys)`: Inserts keys into a Binary Search Tree following the invariant ($\text{left} < \text{node} < \text{right}$).
- `preorder(root)`: Node, Left, Right ($NLR$).
- `inorder(root)`: Left, Node, Right ($LNR$) — visits keys in strictly ascending sorted order.
- `postorder(root)`: Left, Right, Node ($LRN$).
- `layout(root)`: Assigns non-overlapping 2D coordinates using inorder X projection.

### 4. `js/logic/dfa.js`
- `run(machine, str)`: Steps binary string through transition table $\delta(q, a)$ starting at $q_0 = 0$.
- `accepts(machine, str)`: Evaluates if final state $\in F$.
- `complement(machine)`: Inverts accepting states ($F_{\text{new}} = Q \setminus F$).
- `testAgainst(machine, goalId)`: Tests DFA against all 127 binary strings of length 0 to 6.

### 5. `js/logic/quiz.js` & `js/logic/exam-gen.js`
- Generates 3-question quick checks for lessons and the 8-question final exam.
- Generates 4 unique options per question with plausible distractors and exactly 1 correct answer verified by logic.

---

## Interactive Blackboard Lessons (`js/lessons/`)

### 1. `js/lessons/shell.js`
- Modal dialog (`#lecture`) featuring blackboard styling, focus trapping, and accessible tabs (Learn, Practice, Challenge).
- Mounts and unmounts district modules cleanly without memory or event listener leaks.

### 2. `js/lessons/lesson-player.js`
- Step-by-step walkthrough engine with navigation arrows, progress dots, autoplay, and keyboard navigation.

### 3. `js/lessons/drawings.js`
- Dynamic drawing helpers:
  - String locomotive train wagons with couplers and cut indicator.
  - Interactive SVG Venn diagrams with highlighted partition regions.
  - Binary search tree recursive call stack renderer.
  - Animated DFA CRT tape runner.

### 4. `js/lessons/lessons-data.js`
- Authoritative guided lessons:
  - String Street: 7 steps.
  - Set Park: 9 steps.
  - Tree Forest: 8 steps.
  - DFA Station: 8 steps.
  - Every step's narrative text is verified $\le 30$ words.

---

## Open World & Interactive Entities (`js/world/`)

- **Map (`map-data.js`):** 64×64 tilemap featuring Central Hub plaza, 3-tile wide roads, and 4 themed regions.
- **District Dressing (`dressing.js`):** Procedural landmarks including the Hub fountain, railway tracks, twin Venn ponds, illuminated tree lanterns, and DFA state platforms.
- **Atmosphere (`atmosphere.js`):** Day/Night lighting cycle with ambient color grading, radial lantern cutouts, and floating firefly particles.
- **Theory Shards (`shards.js`):** 12 collectible shards placed across districts, guaranteed reachable from spawn via BFS pathfinding.
- **Theory Journal (`journal.js`):** In-game card grid displaying formal mathematical definitions for all collected shards.
- **Resident NPCs (`npcs.js`) & Companion (`companion.js`):** Resident station NPCs with hints and floating companion Eps ($\varepsilon$) trailing the player without collision.

---

## Exam Tower, Evaluation & Diploma

### 1. `js/world/tower.js`
- Unlocks when all 4 district stamps are collected; shows sealed indicator if $< 4$ stamps.
- Runs an 8-question comprehensive final exam generated by `AC.examGen`.
- Instant answer feedback with formal mathematical explanations.
- Passing threshold: $\ge 6/8$ (75%). Emits `exam:pass`, updates progress, and unlocks the diploma view.

### 2. `js/world/certificate.js`
- Canvas-rendered pixel diploma:
  - Displays recipient name, final score, completion date, and signatures.
  - Accreditation credits to Course ACE, professor, and development team.
  - "Download PNG" export via `canvas.toDataURL`.
  - "Print Certificate" using custom `@media print` CSS rules.

---

## Settings, Accessibility & Touch Controls

### 1. `js/world/settings.js`
- Accessible via `[O]` key or top-bar button.
- Master audio mute toggle.
- Atmosphere theme override (Auto / Day / Night).
- Reduced motion toggle.
- In-UI progress reset dialog (no `window.confirm()`).

### 2. `js/world/touch.js`
- Automatically enables on touchscreen devices (`pointer: coarse`).
- Virtual D-pad for 4-directional movement.
- On-screen tactile buttons: `[E]` Interact, `[J]` Journal, `[H]` Hint, `[⚙]` Settings.

---

## Verification, Property Testing & Test Runner (`tests/`)

Automated test runner runs headlessly in Node.js or visually in the browser (`tests/index.html`):
- **77 Automated Tests Passing:**
  - Property-based testing of seeded PRNG determinism.
  - Golden value matching for string operations, set algebra, and tree traversals.
  - Exhaustive 127-string validation for all reference DFAs and complementation.
  - BFS reachability validation from spawn to all 4 station boards and 12 shards.
  - 20-cycle mount/unmount listener leak audits.
  - 200 random seeds validation for the 8-question exam generator.

---

## How to Defend This Project to the Professor

When defending this project to Professor Doc. Jayson Guia:

1. **Pedagogical Significance:**
   The game transforms abstract formal definitions into interactive spatial simulations. For example, language concatenation is modeled as coupling train cars, set operations are modeled as overlapping ponds, BST properties are reinforced through interactive traversals, and DFAs are experienced as state transitions on a transit network.

2. **Mathematical Integrity:**
   All operations are computed directly by pure mathematical logic algorithms. Zero outcomes are pre-recorded or hard-coded.

3. **Engineering Rigor:**
   - Zero third-party dependencies, running standalone via `file://`.
   - Strict separation between pure logic, engine, and presentation layers.
   - 77 automated test suites verifying mathematical invariants and engine stability.
