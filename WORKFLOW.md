# WORKFLOW.md — Automata City: Step-by-Step Execution & Quality Workflow

This document codifies the operational instructions, anti-hallucination protocols, and step-by-step milestone execution loop for building **Automata City**. It synthesizes [plan.md](plan.md), [AGENTS.md](AGENTS.md), and [agent-kit/](agent-kit/).

---

## 1. Core Principles & Non-Negotiables

1. **Zero External Dependencies & `file://` First:**
   - Plain HTML5 Canvas 2D, vanilla JavaScript (ES6+), CSS, SVG, WebAudio.
   - **No npm runtime dependencies, no bundlers, no external CDNs.**
   - **No ES modules (`import`/`export`), no `type="module"`, no local `fetch()`/XHR** so the game runs by double-clicking `index.html`.
2. **Single Global Namespace (`AC`):**
   - Exactly one global: `window.AC`.
   - Every script is wrapped in an IIFE attaching to `AC`:
     ```js
     (function (root) {
       'use strict';
       const AC = root.AC = root.AC || {};
       // module code
     })(typeof globalThis !== 'undefined' ? globalThis : window);
     ```
   - No inline `onclick` or loose global state.
3. **Pure Logic Isolation (`js/logic/`):**
   - Theory logic (strings, sets, trees, DFAs, exam generation) lives in `js/logic/`.
   - **Zero DOM, zero window/document access** in logic modules so they can run headlessly in Node.js test runners (`node tests/run.js`).
   - No direct `Math.random()`. Use deterministic seeded RNG (`AC.rng(seed)`).
4. **Input & Focus Isolation:**
   - Active overlay (lecture board, journal, dialog) disables world movement.
   - Any typing inside text inputs disables WASD/arrow game movement.

---

## 2. The 8-Step Task Execution Loop

Every sub-task must follow this exact sequence:

```
[Step 1: Restate] ──► [Step 2: Ground] ──► [Step 3: Plan] ──► [Step 4: Implement Slice]
                                                                     │
[Step 8: Commit]  ◄── [Step 7: Report] ◄── [Step 6: Audit] ◄── [Step 5: Verify]
```

### Step 1: Restate & Scope
- Copy the task's acceptance criteria and "Done when" conditions.
- Explicitly state what is **out of scope** to prevent drift.

### Step 2: Ground Before Action
- Before writing code that references an existing function, variable, CSS class, or DOM element:
  1. Open the file where it is defined.
  2. Record the citation as `path:line` (tagged `[READ]`).
- If something cannot be found in code or docs, record it as `[UNKNOWN]` and resolve it before proceeding. Never guess.

### Step 3: Plan the Slice
- List files to create/modify (limit to **≤ 5 files**, **≤ 400 lines** per file).
- Identify tests to add/run.

### Step 4: Implement the Minimal Slice
- Write/update unit tests first for any logic changes.
- Implement only what is required to satisfy the criteria.
- Keep existing comments and docstrings intact.

### Step 5: Dual Verification
- **Automated Verification:** Run `node tests/run.js` (must pass 100%).
- **Runtime Verification:** Ensure `index.html` runs with zero console warnings or errors.
- Any check not executed in the current session must be marked `[NOT VERIFIED]` with manual instructions.

### Step 6: Identifier & Anti-Hallucination Audit
- List all new identifiers across files:
  ```
  Identifier            Defined at              Used at
  AC.collide.move       js/engine/collide.js    js/world/entities.js
  ```
- Verify with `grep` that no dangling or misspelled identifiers exist.

### Step 7: Task Report (Mandatory Template)
Every completed task requires a report containing:
- **Goal / Done-when**
- **Files changed** (created / modified)
- **What was done** (concise summary)
- **Verification:** `[VERIFIED]` commands and outputs, or `[NOT VERIFIED]` manual checks
- **Evidence Tags:** `[VERIFIED]`, `[READ]`, `[ASSUMED]`, `[UNKNOWN]`
- **Identifier audit table**
- **Risks & Next task**

### Step 8: Progress Sync & Commit
- Check off the task in `agent-kit/docs/PROGRESS.md`.
- Commit with message format: `M<n>: <summary>`.

---

## 3. Evidence Tag Protocol

| Tag | Requirement |
|---|---|
| `[VERIFIED]` | You personally ran the command or observed runtime behavior in this session. Cite the command and output. |
| `[READ]` | You opened the file and observed it directly. Cite `path:line`. |
| `[ASSUMED]` | Reasonable design choice when docs are silent. Must be explicitly listed in the report. |
| `[UNKNOWN]` | Information needed but missing. Must be asked or investigated before proceeding. |

---

## 4. Milestone Roadmap (M0 through M6)

- **M0: Refactor & Namespace Grounding**
  - Backup baseline to `legacy/`.
  - Extract pure theory logic into `js/logic/{strings,sets,tree,dfa}.js`.
  - Wire namespace `AC` and initialize `tests/run.js`.
- **M1: Walking Prototype**
  - Canvas 2D engine (320×180 resolution, pixelated integer scaling).
  - Fixed-step 60 FPS loop, camera follow, tilemap, AABB foot-box collision.
  - Hub area + 4 blank district zones.
- **M2: Stations & Lecture Overlay**
  - Trigger zones with "Press E" visual prompts.
  - Lecture shell with chalkboard styling and tabs: Learn, Practice, Challenge.
  - Mount existing district UI into overlay; earn stamps upon challenge completion.
- **M3: Blackboard Lessons**
  - 6–8 step animated interactive lectures for all 4 stations.
  - Hand-drawn chalk SVG aesthetics and quick-check quizzes.
- **M4: World Atmosphere & Game Feel**
  - District visual styling (Orange `#e0663f`, Teal `#1f9d8a`, Green `#4c8c3a`, Purple `#6f55e0`).
  - NPCs (Professor Delta, robot companion Eps), symbol shards journal, WebAudio synthesized sound effects.
- **M5: In-World Minigames (Optional)**
  - Venn stepping puzzle, Tree traversal walk, DFA track ride, String train concatenation.
- **M6: Finale & Ship**
  - Exam Tower unlock (4 stamps required), procedural randomized exam generator, graduation certificate, mobile controls.

---

## 5. Emergency Stop Triggers

Stop and ask the user immediately if:
1. A requirement is ambiguous or contracts conflict.
2. An external dependency, CDN, or bundler is being proposed (forbidden without explicit user approval).
3. A test fails and root cause cannot be determined after two focused attempts.
4. An operation would delete or alter existing verified code outside the task scope.
